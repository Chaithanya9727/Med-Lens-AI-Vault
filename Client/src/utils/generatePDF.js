import { jsPDF } from 'jspdf';

const NAVY   = [10, 22, 58];
const BRAND  = [88, 166, 255];
const WHITE  = [255, 255, 255];
const GRAY   = [100, 116, 139];
const LGRAY  = [241, 245, 249];
const DARK   = [30, 41, 59];
const BG     = [248, 250, 252];

const SEV = {
  critical:   [220, 38, 38],
  suspicious: [234, 88, 12],
  monitor:    [99, 102, 241],
  normal:     [5, 150, 105],
};

export function generateClinicalPDF({ diagnosisResult, clinicalContext, scanFile, user }) {
  if (!diagnosisResult) return;

  const doc  = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W    = 210;
  const H    = 297;
  const M    = 14;
  const CW   = W - M * 2;
  const sev  = diagnosisResult.severity || 'normal';
  const SC   = SEV[sev] || SEV.normal;
  const ID   = 'MLR-' + Math.random().toString(36).substr(2, 8).toUpperCase();
  const NOW  = new Date();
  const DATE = NOW.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const TIME = NOW.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  // ── helpers ──────────────────────────────────────────
  const sf  = (style, size) => { doc.setFont('helvetica', style); doc.setFontSize(size); };
  const tc  = (...c) => doc.setTextColor(...c);
  const fc  = (...c) => doc.setFillColor(...c);
  const dc  = (...c) => doc.setDrawColor(...c);
  const rr  = (x, y, w, h, r, style) => doc.roundedRect(x, y, w, h, r, r, style);
  const checkPage = (y, need = 30) => {
    if (y + need > H - 22) { doc.addPage(); return M; }
    return y;
  };

  // ── section header ────────────────────────────────────
  const sectionHeader = (label, y) => {
    fc(...NAVY); doc.rect(M, y, CW, 7, 'F');
    tc(...BRAND); sf('bold', 7);
    doc.text(label, M + 4, y + 5);
    return y + 10;
  };

  // ── page header (repeated) ────────────────────────────
  const drawPageHeader = (pageNum) => {
    fc(...NAVY);  doc.rect(0, 0, W, 40, 'F');
    fc(...SC);    doc.rect(0, 40, W, 2, 'F');
    tc(...WHITE); sf('bold', 20);
    doc.text('MED-LENS AI VAULT', M, 18);
    sf('normal', 7); tc(...BRAND);
    doc.text('NEURAL DIAGNOSTIC IMAGING SYSTEM  ·  Gemini 2.5 Flash Vision Engine v4.2.0', M, 25);
    sf('normal', 6.5); tc(148, 163, 184);
    doc.text(`Report ID: ${ID}   ·   Generated: ${DATE} at ${TIME}   ·   HIPAA Compliant`, M, 31);
    doc.text(`Attending: ${user?.name || 'Dr. Unknown'}   ·   Classification: CONFIDENTIAL`, M, 36);
    if (pageNum > 1) {
      sf('bold', 7); tc(...BRAND);
      doc.text(`Page ${pageNum}`, W - M, 25, { align: 'right' });
    }
    // Severity badge top-right
    fc(...SC); rr(W - 52, 6, 38, 14, 2, 'F');
    tc(...WHITE); sf('bold', 7);
    doc.text(sev.toUpperCase(), W - 33, 12, { align: 'center' });
    sf('normal', 6); tc(255,255,255);
    doc.text('SEVERITY', W - 33, 17, { align: 'center' });
  };

  // ── footer (all pages) ────────────────────────────────
  const drawFooter = () => {
    const n = doc.internal.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      fc(...NAVY); doc.rect(0, H - 16, W, 16, 'F');
      fc(...SC);   doc.rect(0, H - 17, W, 1, 'F');
      tc(148,163,184); sf('normal', 6);
      doc.text('AI-GENERATED REPORT — NOT A SUBSTITUTE FOR LICENSED PHYSICIAN EVALUATION  ·  Med-Lens AI Vault', M, H - 9);
      doc.text(`${ID}  ·  Page ${i} of ${n}`, W - M, H - 9, { align: 'right' });
    }
  };

  // ════════════════════════════════════════════════════════
  // PAGE 1
  // ════════════════════════════════════════════════════════
  drawPageHeader(1);
  let y = 50;

  // ── PATIENT INFORMATION ──────────────────────────────
  y = sectionHeader('PATIENT & CLINICAL INFORMATION', y);
  fc(...LGRAY); dc(...LGRAY); doc.rect(M, y, CW, 36, 'F');
  const colW = CW / 4;
  const pInfo = [
    { label: 'PATIENT AGE',       value: clinicalContext?.age ? `${clinicalContext.age} yrs` : 'Not specified' },
    { label: 'SMOKING HISTORY',   value: clinicalContext?.smokingHistory || 'Not specified' },
    { label: 'ATTENDING',         value: user?.name || 'Dr. Unknown' },
    { label: 'SCAN TYPE',         value: diagnosisResult.category || 'Digital Radiograph' },
  ];
  pInfo.forEach((p, i) => {
    const px = M + 4 + i * colW;
    tc(...GRAY); sf('normal', 6.5); doc.text(p.label, px, y + 7);
    tc(...DARK); sf('bold', 9);     doc.text(p.value, px, y + 14);
  });

  if (clinicalContext?.symptoms) {
    tc(...GRAY); sf('normal', 6.5); doc.text('REPORTED SYMPTOMS', M + 4, y + 23);
    tc(...DARK); sf('normal', 8.5);
    doc.text(doc.splitTextToSize(clinicalContext.symptoms, CW - 8), M + 4, y + 29);
  }
  y += 40;

  if (clinicalContext?.notes?.trim()) {
    fc(255,251,235); dc(253,230,138);
    const nLines = doc.splitTextToSize(clinicalContext.notes, CW - 10);
    const nH = nLines.length * 4.5 + 14;
    rr(M, y, CW, nH, 2, 'FD');
    tc(146,64,14); sf('bold', 7);   doc.text('PHYSICIAN CLINICAL NOTES', M + 5, y + 8);
    tc(120,53,15); sf('normal', 8.5); doc.text(nLines, M + 5, y + 14);
    y += nH + 6;
  }

  // ── PRIMARY DIAGNOSIS ────────────────────────────────
  y += 2;
  y = sectionHeader('PRIMARY CLINICAL IMPRESSION', y);

  // Colored left bar + bg
  fc(...SC.map(c => Math.min(255, c + 215))); doc.rect(M, y, CW, 26, 'F');
  fc(...SC); doc.rect(M, y, 4, 26, 'F');
  tc(...DARK); sf('bold', 7); doc.text('DIAGNOSIS', M + 8, y + 7);
  tc(...SC); sf('bold', 15);
  doc.text(doc.splitTextToSize(diagnosisResult.diagnosis || 'No acute pathology', CW - 60)[0], M + 8, y + 17);

  // Confidence badge
  fc(...NAVY); rr(W - M - 38, y + 4, 24, 18, 2, 'F');
  tc(...BRAND); sf('bold', 16); doc.text(`${diagnosisResult.confidence}%`, W - M - 26, y + 15, { align: 'center' });
  tc(148,163,184); sf('normal', 6); doc.text('CONFIDENCE', W - M - 26, y + 20, { align: 'center' });
  y += 30;

  // Confidence bar
  fc(226,232,240); rr(M, y, CW, 6, 1, 'F');
  fc(...SC);       rr(M, y, CW * (diagnosisResult.confidence / 100), 6, 1, 'F');
  tc(...WHITE); sf('bold', 5.5); doc.text(`AI Confidence Score: ${diagnosisResult.confidence}%`, M + 3, y + 4.3);
  y += 12;

  // ── ANALYSIS SUMMARY ─────────────────────────────────
  if (diagnosisResult.summary) {
    y = checkPage(y, 30);
    y = sectionHeader('ANALYSIS SUMMARY', y);
    fc(...BG); dc(226,232,240);
    const sLines = doc.splitTextToSize(diagnosisResult.summary, CW - 8);
    const sH = sLines.length * 4.8 + 10;
    rr(M, y, CW, sH, 2, 'FD');
    tc(...DARK); sf('normal', 9); doc.text(sLines, M + 5, y + 7);
    y += sH + 8;
  }

  // ── CRITICAL ALERT ────────────────────────────────────
  if (diagnosisResult.criticalAlert) {
    y = checkPage(y, 20);
    fc(254,242,242); dc(239,68,68);
    const aLines = doc.splitTextToSize(diagnosisResult.criticalAlert, CW - 10);
    const aH = aLines.length * 4.8 + 14;
    rr(M, y, CW, aH, 2, 'FD');
    tc(185,28,28); sf('bold', 7.5); doc.text('⚠ CRITICAL FINDING — IMMEDIATE ATTENTION REQUIRED', M + 5, y + 8);
    tc(153,27,27); sf('normal', 8.5); doc.text(aLines, M + 5, y + 14);
    y += aH + 8;
  }

  // ── DETAILED FINDINGS ────────────────────────────────
  if (diagnosisResult.findings?.length) {
    y = checkPage(y, 40);
    y = sectionHeader('DETAILED RADIOLOGICAL FINDINGS', y);
    diagnosisResult.findings.forEach((finding, idx) => {
      y = checkPage(y, 14);
      const fLines = doc.splitTextToSize(finding, CW - 16);
      const fH = fLines.length * 4.8 + 8;
      fc(...(idx % 2 === 0 ? LGRAY : BG)); dc(220,226,234);
      rr(M, y, CW, fH, 1.5, 'FD');
      fc(...SC); doc.rect(M, y, 3, fH, 'F');
      tc(...GRAY); sf('bold', 8); doc.text(`${idx + 1}`, M + 7, y + fH / 2 + 1.5);
      tc(...DARK); sf('normal', 8.5); doc.text(fLines, M + 14, y + 6);
      y += fH + 2;
    });
    y += 6;
  }

  // ── CONDITIONS TABLE ─────────────────────────────────
  if (diagnosisResult.conditions?.length) {
    y = checkPage(y, 50);
    y = sectionHeader('CONDITIONS ANALYSIS', y);

    // Table header
    fc(...DARK); dc(...DARK); doc.rect(M, y, CW, 8, 'F');
    tc(...WHITE); sf('bold', 6.5);
    const cCols = [CW * 0.38, CW * 0.18, CW * 0.2, CW * 0.24];
    ['CONDITION', 'PROBABILITY', 'SEVERITY', 'ANATOMICAL LOCATION'].forEach((h, i) => {
      doc.text(h, M + 3 + cCols.slice(0, i).reduce((a, b) => a + b, 0), y + 5.5);
    });
    y += 9;

    diagnosisResult.conditions.forEach((c, i) => {
      y = checkPage(y, 14);
      const rH = 14;
      fc(...(i % 2 === 0 ? LGRAY : WHITE)); dc(220,226,234);
      doc.rect(M, y, CW, rH, 'FD');
      const cColor = SEV[c.severity] || SEV.normal;

      // Condition name
      tc(...DARK); sf('bold', 8.5); doc.text(c.name, M + 3, y + 5.5);

      // Probability bar
      const bx = M + cCols[0] + 3;
      const bw = cCols[1] - 8;
      sf('bold', 7.5); tc(...DARK); doc.text(`${c.probability}%`, bx, y + 5.5);
      fc(226,232,240); rr(bx, y + 7, bw, 3, 1, 'F');
      fc(...cColor);   rr(bx, y + 7, bw * (c.probability / 100), 3, 1, 'F');

      // Severity
      const sx = M + cCols[0] + cCols[1] + 3;
      fc(...cColor); rr(sx, y + 2, 22, 8, 1, 'F');
      tc(...WHITE); sf('bold', 6); doc.text((c.severity || 'normal').toUpperCase(), sx + 11, y + 7, { align: 'center' });

      // Location
      const lx = M + cCols[0] + cCols[1] + cCols[2] + 3;
      tc(...GRAY); sf('normal', 7.5);
      doc.text(doc.splitTextToSize(c.location || '—', cCols[3] - 5)[0], lx, y + 5.5);
      y += rH;
    });
    y += 8;
  }

  // ── DIFFERENTIAL DIAGNOSIS ───────────────────────────
  if (diagnosisResult.differentialDiagnosis?.length) {
    y = checkPage(y, 40);
    y = sectionHeader('DIFFERENTIAL DIAGNOSIS', y);
    diagnosisResult.differentialDiagnosis.forEach((ddx, idx) => {
      y = checkPage(y, 20);
      const lc = ddx.likelihood === 'high' ? SEV.critical : ddx.likelihood === 'moderate' ? SEV.suspicious : SEV.normal;
      const rLines = doc.splitTextToSize(ddx.reasoning || '', CW - 60);
      const rH = Math.max(18, rLines.length * 4.5 + 10);
      fc(...(idx % 2 === 0 ? LGRAY : BG)); dc(220,226,234);
      rr(M, y, CW, rH, 1.5, 'FD');
      tc(...DARK); sf('bold', 9); doc.text(ddx.condition, M + 4, y + 7);
      fc(...lc); rr(M + 4, y + 9, 32, 6, 1, 'F');
      tc(...WHITE); sf('bold', 5.5); doc.text(`${(ddx.likelihood || '').toUpperCase()} LIKELIHOOD`, M + 20, y + 13, { align: 'center' });
      tc(...GRAY); sf('normal', 8); doc.text(rLines, M + 40, y + 7);
      y += rH + 2;
    });
    y += 6;
  }

  // ── SUB-VISUAL AI TELEMETRY ──────────────────────────
  if (diagnosisResult.beyondHumanFindings?.length) {
    y = checkPage(y, 30);
    fc(239,246,255); dc(147,197,253);
    const bH = diagnosisResult.beyondHumanFindings.length * 9 + 18;
    rr(M, y, CW, bH, 3, 'FD');
    tc(30,64,175); sf('bold', 7.5);
    doc.text('SUB-VISUAL AI TELEMETRY — Signatures beyond standard human visual detection', M + 5, y + 9);
    diagnosisResult.beyondHumanFindings.forEach((f, i) => {
      tc(30,58,138); sf('normal', 8.5);
      doc.text(`• ${f}`, M + 6, y + 17 + i * 9);
    });
    y += bH + 8;
  }

  // ── STRUCTURAL ANALYSIS ───────────────────────────────
  if (diagnosisResult.structuralAnalysis) {
    const sa = diagnosisResult.structuralAnalysis;
    y = checkPage(y, 30);
    y = sectionHeader('STRUCTURAL ANALYSIS METRICS', y);
    const boxes = [
      { label: 'Structures Examined', value: sa.examined?.length || 0, color: BRAND },
      { label: 'Normal Structures',   value: sa.normalStructures?.length || 0, color: SEV.normal },
      { label: 'Abnormal Structures', value: sa.abnormalStructures?.length || 0, color: SEV.critical },
    ];
    const bw2 = CW / 3 - 3;
    boxes.forEach((b, i) => {
      const bx = M + i * (bw2 + 4.5);
      fc(...LGRAY); rr(bx, y, bw2, 22, 2, 'F');
      fc(...b.color); rr(bx, y, 3, 22, 1, 'F');
      tc(...GRAY); sf('normal', 7); doc.text(b.label, bx + 7, y + 9);
      tc(...b.color); sf('bold', 18); doc.text(`${b.value}`, bx + 7, y + 19);
    });
    y += 30;
  }

  // ── PROGNOSIS & NEXT STEPS ───────────────────────────
  if (diagnosisResult.prognosis || diagnosisResult.recommendation) {
    y = checkPage(y, 40);
    y = sectionHeader('CLINICAL PROGNOSIS & RECOMMENDATIONS', y);
    const half = (CW - 4) / 2;

    if (diagnosisResult.prognosis) {
      const pLines = doc.splitTextToSize(diagnosisResult.prognosis, half - 10);
      const pH = pLines.length * 5 + 16;
      fc(240,253,244); dc(134,239,172); rr(M, y, half, pH, 2, 'FD');
      tc(21,128,61); sf('bold', 7); doc.text('CLINICAL PROGNOSIS', M + 5, y + 9);
      tc(22,101,52); sf('normal', 8.5); doc.text(pLines, M + 5, y + 16);

      if (diagnosisResult.recommendation) {
        const rLines = doc.splitTextToSize(diagnosisResult.recommendation, half - 10);
        fc(239,246,255); dc(147,197,253); rr(M + half + 4, y, half, pH, 2, 'FD');
        tc(30,64,175); sf('bold', 7); doc.text('RECOMMENDED NEXT STEPS', M + half + 9, y + 9);
        tc(30,58,138); sf('normal', 8.5); doc.text(rLines, M + half + 9, y + 16);
      }
      y += Math.max(30, diagnosisResult.prognosis.length / 5) + 10;
    }
  }

  // ── PATIENT GUIDE ─────────────────────────────────────
  y = checkPage(y, 40);
  y = sectionHeader('PATIENT GUIDE — UNDERSTANDING YOUR RESULTS', y);
  fc(255,251,235); dc(253,230,138);
  const urgency = sev === 'critical'
    ? 'URGENT: Please contact your physician or visit an emergency department immediately.'
    : sev === 'suspicious'
    ? 'Some findings require follow-up. Please schedule an appointment with your physician soon.'
    : 'Your scan shows generally reassuring findings. Maintain routine medical check-ups.';
  const guide = [
    `Diagnosis: "${diagnosisResult.diagnosis}" — Confidence Level: ${diagnosisResult.confidence}%`,
    '',
    urgency,
    '',
    'What this report means for you:',
    '  • This report was created by an AI diagnostic system to assist your healthcare provider.',
    '  • The confidence score reflects how certain the AI is about its primary finding.',
    '  • Always discuss this report with your licensed physician before making any medical decisions.',
    '  • Bring this document to your next medical appointment for review.',
    '',
    clinicalContext?.symptoms ? `Symptoms reported: ${clinicalContext.symptoms}` : '',
    clinicalContext?.age ? `Patient age at time of scan: ${clinicalContext.age} years` : '',
  ].filter(Boolean);
  const gLines = guide.flatMap(g => g === '' ? [''] : doc.splitTextToSize(g, CW - 12));
  const gH = gLines.length * 5 + 14;
  rr(M, y, CW, gH, 3, 'FD');
  tc(146,64,14); sf('bold', 8); doc.text('Please read carefully before your physician visit:', M + 6, y + 9);
  tc(120,53,15); sf('normal', 8.5); doc.text(gLines, M + 6, y + 16);
  y += gH + 8;

  // ── LEGAL DISCLAIMER ─────────────────────────────────
  y = checkPage(y, 24);
  fc(...LGRAY); dc(226,232,240);
  rr(M, y, CW, 20, 2, 'FD');
  tc(...GRAY); sf('bold', 6.5);
  doc.text('LEGAL DISCLAIMER', M + 5, y + 7);
  sf('normal', 6.5);
  doc.text('This report is generated by an automated AI system (Med-Lens AI Vault) and is intended solely to assist qualified medical professionals.', M + 5, y + 12);
  doc.text('It does not constitute a clinical diagnosis and must not be used as a sole basis for treatment decisions. Patient data is processed under HIPAA-compliant protocols.', M + 5, y + 17);

  // ── IMAGING ATTACHMENT PAGE ───────────────────────────
  if (scanFile?.type?.startsWith('image/')) {
    doc.addPage();
    drawPageHeader(doc.internal.getNumberOfPages());
    fc(...NAVY); doc.rect(0, 0, W, 40, 'F');
    tc(...WHITE); sf('bold', 16); doc.text('IMAGING ATTACHMENT', M, 20);
    tc(...BRAND); sf('normal', 8);
    doc.text(`Reference: ${ID}  ·  ${diagnosisResult.diagnosis}`, M, 28);
    fc(...SC); doc.rect(0, 40, W, 2, 'F');

    const fileUrl = URL.createObjectURL(scanFile);
    const img = new Image();
    img.src = fileUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width  = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#07090F';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', M, 48, CW, 200, undefined, 'FAST');
      } catch {
        doc.addImage(img, 'JPEG', M, 48, CW, 200, undefined, 'FAST');
      }
      drawFooter();
      doc.save(`MedLens_Report_${ID}.pdf`);
    };
  } else {
    drawFooter();
    doc.save(`MedLens_Report_${ID}.pdf`);
  }
}
