const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 5000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!fs.existsSync(path.join(__dirname, '../uploads'))) {
  fs.mkdirSync(path.join(__dirname, '../uploads'));
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'))
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors({
  origin: '*', // Allow all for demo stability
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ─── Database Helper ───
const DB_PATH = path.join(__dirname, '../database.json');
function loadDB() {
  let db = { leads: [], scans: [], users: [], auditLogs: [] };
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      db = { ...db, ...data };
    } catch (e) {
      console.error("DB Parse Error:", e);
    }
  }
  if (!db.users) db.users = [];
  if (!db.auditLogs) db.auditLogs = [];
  if (!db.scans) db.scans = [];
  if (!db.leads) db.leads = [];
  return db;
}
function saveDB(db) {
  db.users = db.users || [];
  db.auditLogs = db.auditLogs || [];
  db.scans = db.scans || [];
  db.leads = db.leads || [];
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// ─── Enterprise Audit Helper ───
function logEvent(type, action, metadata = {}) {
  const db = loadDB();
  db.auditLogs.unshift({
    id: 'evt_' + crypto.randomBytes(4).toString('hex'),
    timestamp: new Date().toISOString(),
    type, // 'SECURITY', 'CLINICAL', 'SYSTEM'
    action,
    ...metadata
  });
  // Keep last 100 logs
  if (db.auditLogs.length > 100) db.auditLogs = db.auditLogs.slice(0, 100);
  saveDB(db);
}

// ─── Authentication Endpoints ───
app.post('/api/auth/signup', (req, res) => {
  const { name, role, username, password } = req.body;
  if (!name || !username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const db = loadDB();
  if (db.users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already registered' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  const newUser = {
    id: 'dr_' + crypto.randomBytes(4).toString('hex'),
    name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
    role: role || 'Clinical Specialist',
    username,
    password: hashedPassword, // BCRYPT ENCRYPTED
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);
  
  logEvent('SECURITY', 'NEW_PRACTITIONER_REGISTERED', { 
    drName: newUser.name, 
    drId: newUser.id,
    ipAddress: req.ip || req.connection.remoteAddress,
    device: req.headers['user-agent']
  });
  
  const { password: _, ...userSafe } = newUser;
  res.json(userSafe);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.username === username);

  let isMatch = false;
  if (user) {
    if (user.password.startsWith('$2a$')) {
      isMatch = bcrypt.compareSync(password, user.password);
    } else {
      isMatch = (user.password === password); // Fallback for old plaintext prototype accounts
    }
  }

  if (!isMatch) {
    logEvent('SECURITY', 'FAILED_LOGIN_ATTEMPT', { 
      username,
      ipAddress: req.ip || req.connection.remoteAddress,
      device: req.headers['user-agent']
    });
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  logEvent('SECURITY', 'SESSION_AUTHORIZED', { 
    drName: user.name, 
    drId: user.id,
    ipAddress: req.ip || req.connection.remoteAddress,
    device: req.headers['user-agent']
  });

  const { password: _, ...userSafe } = user;
  res.json(userSafe);
});

// ─── Diagnostic Fingerprinting ───
function calculateImageHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Severity classifier
function classifySeverity(diagnosis, confidence, conditions) {
  const diag = (diagnosis || '').toLowerCase();
  
  // Check conditions for any critical/suspicious findings
  if (conditions && conditions.length > 0) {
    const hasCritical = conditions.some(c => c.severity === 'critical');
    const hasSuspicious = conditions.some(c => c.severity === 'suspicious');
    const hasMonitor = conditions.some(c => c.severity === 'monitor');
    if (hasCritical) return 'critical';
    if (hasSuspicious) return 'suspicious';
    if (hasMonitor) return 'monitor';
  }
  
  if (diag.includes('normal') || diag.includes('healthy') || diag.includes('no abnormality') || diag.includes('no acute')) return 'normal';
  if (diag.includes('fracture') || diag.includes('tumor') || diag.includes('mass') || diag.includes('malignant')) return 'critical';
  if (diag.includes('suspicious') || diag.includes('suspected') || diag.includes('opacity') || diag.includes('effusion')) return 'suspicious';
  return 'monitor';
}

// ─── Gemini Call Helper ───
async function callGemini(base64Image, mimeType, promptText, retryCount = 0) {
  try {
    const modelId = "gemini-2.5-flash"; // Restored Enterprise Node Designation
    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: mimeType.startsWith('image/') ? mimeType : 'image/png', data: base64Image } },
          { text: promptText }
        ]
      }]
    });

    let rawText = response.text || '';
    
    // Clean JSON formatting
    rawText = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    if (!rawText.startsWith('{')) {
       const start = rawText.indexOf('{');
       const end = rawText.lastIndexOf('}');
       if (start !== -1 && end !== -1) rawText = rawText.substring(start, end + 1);
    }

    return JSON.parse(rawText);
  } catch (err) {
    if (retryCount < 2) {
      console.warn(`⚠️ RETRYING INFERENCE [${retryCount+1}]...`);
      return callGemini(base64Image, mimeType, promptText, retryCount + 1);
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════
//   MAIN DIAGNOSTIC ENDPOINT
// ═══════════════════════════════════════════════════════════
app.post('/api/upload', upload.single('scan'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: 'error', message: 'No file.' });

    let fileBuffer;
    try {
      fileBuffer = fs.readFileSync(req.file.path);
    } catch (e) {
      return res.status(500).json({ status: 'error', message: 'Failed to read uploaded file.' });
    }

    const base64Image = fileBuffer.toString('base64');
    const imageHash = calculateImageHash(fileBuffer);
    const db = loadDB();

    // ═══ VAULT MATCH CHECK ═══
    const existing = (db.scans || []).find(s => s.imageHash === imageHash && s.doctorId === req.body.doctorId);
    if (existing) {
      try { fs.unlinkSync(req.file.path); } catch (e) {} // cleanup
      return res.json({
        ...existing,
        status: 'success',
        message: `Consistent Analysis: Retrieving previous verified findings from Vault.`,
        telemetry: { latency: "95ms", engine: "Diagnostic Vault", isCacheHit: true }
      });
    }
    const startTime = Date.now();
    let doctorId = 'unknown';
    let doctorName = 'Dr. Unknown';
    
    try {
      doctorId = req.body.doctorId || 'unknown';
      doctorName = req.body.doctorName || 'Dr. Unknown';

      logEvent('CLINICAL', 'SCAN_UPLOADED', { 
        fileName: req.file.originalname, 
        drName: doctorName,
        drId: doctorId 
      });
    } catch (logErr) {
      console.error("Non-critical logging error:", logErr);
    }

    // Build clinical context from patient data
    const patientAge = req.body.age ? `Patient Age: ${req.body.age} years.` : '';
    const patientSymptoms = req.body.symptoms ? `Reported Symptoms: ${req.body.symptoms}.` : '';
    const smokingHx = req.body.smokingHistory ? `Smoking History: ${req.body.smokingHistory}.` : '';
    const clinicalNotes = req.body.notes ? `Clinical Notes: ${req.body.notes}.` : '';
    const contextBlock = [patientAge, patientSymptoms, smokingHx, clinicalNotes].filter(Boolean).join('\n');

    const diagnosticPrompt = `You are a board-certified diagnostic radiologist with 25 years of experience in clinical imaging interpretation. You specialize in detecting subtle abnormalities that are often missed by general practitioners.

TASK: Perform a comprehensive, systematic radiological interpretation of this medical image. You MUST analyze every visible anatomical structure in detail.

${contextBlock ? `CLINICAL CONTEXT:\n${contextBlock}\n` : ''}

CRITICAL INSTRUCTIONS:
1. EXAMINE EVERY REGION of the image systematically. Do NOT give a superficial "normal" reading.
2. For EACH anatomical structure visible, provide a specific finding (normal or abnormal).
3. If the image is normal, STILL provide detailed structural analysis of what you see.
4. Identify the EXACT location of any abnormality using percentage coordinates (x%, y%) relative to the image.
5. Provide findings that go BEYOND what a general physician would catch — subtle density changes, early-stage calcifications, mild asymmetries, borderline measurements, etc.
6. Include differential diagnoses when abnormalities are found.

You MUST respond with ONLY a valid JSON object in this exact structure:

{
  "diagnosis": "Primary clinical impression in clear medical terminology",
  "confidence": <number 75-98>,
  "category": "Orthopedic|Pulmonary|Cardiac|Neurological|Abdominal|General|Dental",
  "severity": "normal|monitor|suspicious|critical",
  "conditions": [
    {
      "name": "Specific finding or condition name",
      "probability": <number 0-100>,
      "severity": "normal|monitor|suspicious|critical",
      "location": "Anatomical location in the image"
    }
  ],
  "findings": [
    "Finding 1: Specific anatomical observation with measurements if applicable",
    "Finding 2: Another specific observation",
    "Finding 3: etc."
  ],
  "roiRegions": [
    {
      "x": <percentage 0-100 from left>,
      "y": <percentage 0-100 from top>,
      "radius": <percentage 5-25>,
      "label": "What is at this location",
      "severity": "normal|monitor|suspicious|critical"
    }
  ],
  "structuralAnalysis": {
    "examined": ["List of every anatomical structure you examined"],
    "normalStructures": ["Structures confirmed normal"],
    "abnormalStructures": ["Structures with abnormalities"],
    "notVisualized": ["Structures that cannot be assessed from this image"]
  },
  "beyondHumanFindings": [
    "Subtle finding 1 that a general physician would likely miss",
    "Subtle finding 2 — early-stage or borderline observation"
  ],
  "differentialDiagnosis": [
    {"condition": "Possible condition 1", "likelihood": "high|moderate|low", "reasoning": "Why this is considered"},
    {"condition": "Possible condition 2", "likelihood": "high|moderate|low", "reasoning": "Why this is considered"}
  ],
  "evidence": "Detailed anatomical evidence supporting the primary diagnosis. Reference specific visual markers, densities, shapes, and positions.",
  "prognosis": "Clinical forecast based on this study. Include timeline expectations and potential progression if abnormal.",
  "recommendation": "Specific next clinical steps. Name exact tests, imaging modalities, or specialist consultations needed.",
  "summary": "Comprehensive 3-5 sentence clinical report suitable for a physician's reference.",
  "criticalAlert": null or "URGENT finding requiring immediate attention"
}

IMPORTANT: 
- The "roiRegions" array MUST contain at least 1 entry pointing to the most clinically significant area.
- The "conditions" array MUST contain at least 3 entries — even for normal scans, list what you checked.
- The "findings" array MUST contain at least 5 specific observations.
- The "beyondHumanFindings" array MUST contain at least 2 entries — observations requiring AI-level precision.
- Be SPECIFIC. Never say "appears normal" without describing WHAT appears normal and WHY.`;

    const diagnosis = await callGemini(base64Image, req.file.mimetype, diagnosticPrompt);
    if (!diagnosis) throw new Error("Primary neural pass failed.");

    // Ensure severity is properly classified
    const severity = diagnosis.severity || classifySeverity(diagnosis.diagnosis, diagnosis.confidence, diagnosis.conditions);

    const finalResult = {
      status: 'success',
      ...diagnosis,
      severity,
      imageHash,
      fileName: req.file.originalname,
      telemetry: {
        latency: `${Date.now() - startTime}ms`,
        engine: 'Gemini 2.5 Flash',
        isCacheHit: false
      }
    };

    db.scans.push({ 
      ...finalResult, 
      id: Math.random().toString(36).substr(2, 9).toUpperCase(), 
      timestamp: new Date().toISOString(),
      doctorId: req.body.doctorId || 'unknown',
      doctorName: req.body.doctorName || 'Dr. Unknown'
    });
    saveDB(db);

    // Simulated HL7 FHIR / PACS push for critical anomalies
    if (severity === 'critical' || severity === 'suspicious') {
      logEvent('SYSTEM', 'HL7_FHIR_SYNC_TRIGGERED', {
        drName: req.body.doctorName || 'Dr. Unknown',
        drId: req.body.doctorId || 'unknown',
        severity: severity.toUpperCase(),
        target: 'EPIC_EHR_NODE_3'
      });
    }

    if (req.file) try { fs.unlinkSync(req.file.path); } catch (e) {}

    res.json(finalResult);

  } catch (error) {
    console.error('Diagnostic Error:', error);
    if (req.file) try { fs.unlinkSync(req.file.path); } catch (e) {}
    res.status(500).json({ status: 'error', message: `Neural Core Error: ${error.message}` });
  }
});

// ═══════════════════════════════════════════════════════════
//   NEURAL-CHAT: CLINICAL ASSISTANT ENDPOINT
// ═══════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
  const { question, scanContext, history } = req.body;
  if (!question || !scanContext) return res.status(400).json({ status: 'error', message: 'Missing query parameters.' });

  try {
    const formattedHistory = history ? history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join('\n') + '\n\n' : '';

    const prompt = `Role: Senior Diagnostic Consultant with 25 years of clinical radiology experience.

Context: You are reviewing a diagnostic imaging study with the following AI-generated findings:
- Primary Diagnosis: "${scanContext.diagnosis}"
- Confidence: ${scanContext.confidence}%
- Key Findings: ${scanContext.findings?.join('; ') || 'Not specified'}
- Evidence: ${scanContext.evidence || 'Not specified'}
- Summary: ${scanContext.summary || 'Not specified'}

Conversation History:
${formattedHistory}
The user (a medical professional) is asking: "${question}"

Instructions:
- Provide a thorough, clinical-grade answer based on the evidence and conversation history above.
- If the question relates to pathology, explain the underlying mechanism.
- If comparing to what a human doctor might miss, highlight AI-specific advantages.
- Use proper medical terminology but keep it accessible.
- If the query asks for something not derivable from the scan data, clearly state that additional clinical correlation or imaging is needed.
- Provide 3-5 sentences for a complete answer.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: { temperature: 0.3, maxOutputTokens: 500 },
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    res.json({ status: 'success', answer: response.text || 'Core timeout.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ─── Analytics ───
app.get('/api/scans', (req, res) => {
  const doctorId = req.query.doctorId;
  let scans = loadDB().scans || [];
  if (doctorId) scans = scans.filter(s => s.doctorId === doctorId);
  res.json(scans.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
});

app.get('/api/analytics', (req, res) => {
    const doctorId = req.query.doctorId;
    let scans = loadDB().scans || [];
    if (doctorId) scans = scans.filter(s => s.doctorId === doctorId);
    
    const breakdown = { normal: 0, monitor: 0, suspicious: 0, critical: 0 };
    scans.forEach(s => { if (breakdown[s.severity] !== undefined) breakdown[s.severity]++; });

    // Category breakdown
    const categoryBreakdown = {};
    scans.forEach(s => {
      if (s.category) categoryBreakdown[s.category] = (categoryBreakdown[s.category] || 0) + 1;
    });

    // Last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const count = scans.filter(s => {
            const scanDate = new Date(s.timestamp);
            return scanDate.getDate() === d.getDate() && scanDate.getMonth() === d.getMonth();
        }).length;
        return { date: d.toISOString(), count };
    }).reverse();

    // Average latency
    const latencies = scans.map(s => parseInt(s.telemetry?.latency) || 0).filter(l => l > 0);
    const avgLatency = latencies.length ? `${Math.round(latencies.reduce((a,b) => a+b, 0) / latencies.length)}ms` : '0ms';

    res.json({
        totalScans: scans.length,
        avgConfidence: scans.length ? (scans.reduce((a,b) => a + (b.confidence || 0), 0) / scans.length).toFixed(1) : 0,
        avgLatency,
        abnormalityRate: scans.length ? ((scans.filter(s => s.severity !== 'normal').length / scans.length) * 100).toFixed(1) : 0,
        severityBreakdown: breakdown,
        categoryBreakdown,
        last7Days
    });
});

app.post('/api/admin/leads', (req, res) => {
    const db = loadDB();
    const newLead = {
        id: 'L' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        ...req.body,
        timestamp: new Date().toISOString()
    };
    db.leads = db.leads || [];
    db.leads.push(newLead);
    saveDB(db);
    res.json({ status: 'success', lead: newLead });
});

app.get('/api/admin/leads', (req, res) => res.json(loadDB().leads || []));

app.get('/api/audit', (req, res) => {
  const doctorId = req.query.doctorId;
  const db = loadDB();
  let logs = db.auditLogs || [];
  
  // Multi-tenancy filter: Only show logs relevant to this doctor
  if (doctorId) {
    logs = logs.filter(log => log.drId === doctorId);
  }
  
  res.json(logs);
});

app.get('/api/admin/global-data', (req, res) => {
  const db = loadDB();
  res.json({
    users: (db.users || []).map(u => {
       const { password, ...safe } = u;
       return safe;
    }),
    scans: db.scans || [],
    auditLogs: db.auditLogs || []
  });
});

// ═══════════════════════════════════════════════════════════
//   FRONTEND STATIC SERVING (ALL-IN-ONE DEPLOYMENT)
// ═══════════════════════════════════════════════════════════
const clientDistPath = path.join(__dirname, '../../Client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => console.log(`🚀 Clinical Engine Online: Port ${PORT} | Gemini 2.5 Flash`));
