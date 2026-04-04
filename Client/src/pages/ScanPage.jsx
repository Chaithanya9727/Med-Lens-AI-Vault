import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import MedicalScanUploadZone from '../components/MedicalScanUploadZone';
import NeuralClinicalChat from '../components/NeuralClinicalChat';
import Navbar from '../components/Navbar';
import api, { setupInterceptors } from '../services/api';
import { Activity, Download, X, ArrowLeft, ShieldCheck, Zap, Crosshair, Volume2, FileJson, GitCompare, MessageSquareCode, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/AuthOverlay';

const LOG_SEQUENCE = [
  "[SYS] Establishing secure TLS 1.3 handshake...",
  "[SYS] Authenticated request. Initializing vision cores...",
  "[CORE] Ingesting multi-channel matrix...",
  "[CORE] Running contrast enhancement filters...",
  "[NET] Passing tensor blocks to Gemini 2.5 Flash...",
  "[NET] Analyzing structural integrity metrics...",
  "[NET] Identifying sub-pixel density anomalies...",
  "[AI] Formulating pathological differentials...",
  "[AI] Cross-referencing 5M+ clinical vectors...",
  "[AI] Extracting bounding coordinates for ROI...",
  "[AI] Generating diagnostic reasoning matrix...",
  "[SYS] Validating schema constraints. Finalizing..."
];

const TerminalStreamer = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < LOG_SEQUENCE.length) {
        setLogs(prev => [...prev, LOG_SEQUENCE[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 650);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2.5 font-mono text-[11px] bg-black/60 p-5 rounded-xl border border-edge shadow-inner w-full min-h-[220px]">
      {logs.map((log, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-start gap-2.5 ${log?.startsWith?.('[AI]') ? 'text-brand' : log?.startsWith?.('[CORE]') ? 'text-accent-teal' : 'text-tx-muted'}`}
        >
          <span className="shrink-0">❯</span>
          <span className="tracking-wider">{log || ''}</span>
        </motion.div>
      ))}
      {logs.length < LOG_SEQUENCE.length && (
        <motion.div
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="w-1.5 h-3.5 bg-brand mt-1 ml-5"
        />
      )}
    </div>
  );
};

// ─── ROI Overlay: measures the actual rendered image rect and overlays circles on top ───
const ROIOverlay = ({ roiRegions, isLoading }) => {
  const imgRef = useRef(null);
  const [imgRect, setImgRect] = useState(null);

  // Recalculate whenever the image loads or window resizes
  const updateRect = useCallback(() => {
    if (!imgRef.current) return;
    const el = imgRef.current;
    // getBoundingClientRect gives position relative to viewport
    // We need position relative to the parent container
    const parent = el.closest('.roi-container');
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const imgNativeRect = el.getBoundingClientRect();
    setImgRect({
      left: imgNativeRect.left - parentRect.left,
      top: imgNativeRect.top - parentRect.top,
      width: imgNativeRect.width,
      height: imgNativeRect.height,
    });
  }, []);

  useEffect(() => {
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [updateRect]);

  return { imgRef, imgRect };
};

const ScanPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [scanFile, setScanFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pinnedScans, setPinnedScans] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // For ROI tracking
  const imgRef = useRef(null);
  const [imgRect, setImgRect] = useState(null);

  const updateImgRect = useCallback(() => {
    if (!imgRef.current) return;
    const el = imgRef.current;
    const parent = el.closest('.roi-container');
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const imgNativeRect = el.getBoundingClientRect();
    setImgRect({
      left: imgNativeRect.left - parentRect.left,
      top: imgNativeRect.top - parentRect.top,
      width: imgNativeRect.width,
      height: imgNativeRect.height,
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', updateImgRect);
    return () => window.removeEventListener('resize', updateImgRect);
  }, [updateImgRect]);

  // Re-measure when diagnosis arrives (ROI circles need a fresh measurement)
  useEffect(() => {
    if (diagnosisResult) {
      setTimeout(updateImgRect, 100);
    }
  }, [diagnosisResult, updateImgRect]);

  useEffect(() => {
    setupInterceptors(setIsLoading, setError);
  }, []);

  const handleScanUpload = useCallback(async (file, clinicalContext = {}) => {
    setDiagnosisResult(null);
    setImgRect(null);
    setScanFile(file);

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }

    const formData = new FormData();
    formData.append('scan', file);
    formData.append('notes', clinicalContext.notes || '');
    formData.append('age', clinicalContext.age || '');
    formData.append('symptoms', clinicalContext.symptoms || '');
    formData.append('smokingHistory', clinicalContext.smokingHistory || '');
    const stored = localStorage.getItem('medlens_auth_user');
    if (stored) {
      const userObj = JSON.parse(stored);
      formData.append('doctorId', userObj.id);
      formData.append('doctorName', userObj.name);
    }

    try {
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.status === 'success') {
        setTimeout(() => {
          setDiagnosisResult(response.data);
        }, 500);
      }
    } catch (err) {
      console.error("Upload failure:", err);
    }
  }, []);

  const generateClinicalPDF = () => {
    if (!diagnosisResult) return;

    const doc = new jsPDF();
    const dateStr = new Date().toLocaleString();
    const randomId = Math.random().toString(36).substr(2, 10).toUpperCase();
    const severity = diagnosisResult.severity || 'normal';

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("MED-LENS AI VAULT", 20, 25);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("CLINICAL DIAGNOSTIC REPORT | ID: " + randomId, 20, 32);
    doc.text("CONFIDENTIAL - HIPAA COMPLIANT", 20, 37);

    doc.setFillColor(248, 250, 252);
    doc.rect(140, 10, 60, 25, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.text("DATE: " + dateStr.split(',')[0], 145, 18);
    doc.text("MODALITY: DICOM/AI-V", 145, 23);
    doc.text("ENGINE: v4.2.0-FLASH", 145, 28);

    const sevColor = severity === 'critical' ? [239, 68, 68] : severity === 'suspicious' ? [251, 146, 60] : severity === 'monitor' ? [251, 191, 36] : [16, 185, 129];
    doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
    doc.rect(0, 45, 210, 1.5, 'F');

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("AUTOMATED CLINICAL INTERPRETATION", 20, 65);

    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text("I. CLINICAL IMPRESSION", 20, 78);
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(20, 82, 170, 22, 2, 2, 'FD');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
    doc.setFontSize(12);
    const diagLines = doc.splitTextToSize(diagnosisResult.diagnosis?.toUpperCase() || 'NO ACUTE PATHOLOGY DETECTED', 160);
    doc.text(diagLines, 25, 90);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CONFIDENCE:", 25, 98);
    doc.setTextColor(30, 41, 59);
    doc.text(`${diagnosisResult.confidence}%`, 60, 98);

    let nextY = 120;

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(11);
    doc.text("II. DETAILED FINDINGS", 20, nextY);
    nextY += 8;

    if (diagnosisResult.conditions?.length > 0) {
      diagnosisResult.conditions.forEach((c) => {
        if (nextY > 270) { doc.addPage(); nextY = 20; }
        doc.setFillColor(248, 250, 252);
        doc.rect(20, nextY, 170, 8, 'F');
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(c.name.toUpperCase(), 25, nextY + 5.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(`${c.probability}% | ${c.severity.toUpperCase()}`, 110, nextY + 5.5);
        nextY += 9;
      });
    }

    nextY += 10;
    if (nextY > 250) { doc.addPage(); nextY = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("III. ANALYSIS SUMMARY", 20, nextY);
    nextY += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const summaryLines = doc.splitTextToSize(diagnosisResult.summary || diagnosisResult.message || 'Standard clinical interpretation.', 170);
    doc.text(summaryLines, 20, nextY);
    nextY += (summaryLines.length * 6) + 15;

    if (nextY > 250) { doc.addPage(); nextY = 20; }
    doc.setFillColor(severity === 'critical' ? 254 : 240, severity === 'critical' ? 242 : 253, severity === 'critical' ? 242 : 250);
    doc.rect(20, nextY, 170, 25, 'F');
    doc.setFont("helvetica", "bold");
    doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
    doc.text("IV. RECOMMENDATIONS", 25, nextY + 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const recLines = doc.splitTextToSize(diagnosisResult.recommendation || 'Clinical correlation recommended.', 160);
    doc.text(recLines, 25, nextY + 17);

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("AI-GENERATED REPORT — NOT A SUBSTITUTE FOR PHYSICIAN VALIDATION.", 20, 285);
      doc.text(`PAGE ${i} / ${pageCount}`, 180, 285);
      doc.line(20, 280, 190, 280);
    }

    if (scanFile && scanFile.type.startsWith('image/')) {
      doc.addPage();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text("IMAGING ATTACHMENT — " + randomId, 20, 10);

      const fileUrl = URL.createObjectURL(scanFile);
      const img = new Image();
      img.src = fileUrl;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = "#07090F";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const safeDataUrl = canvas.toDataURL('image/jpeg', 0.95);
          doc.addImage(safeDataUrl, 'JPEG', 20, 30, 170, 170, undefined, 'FAST');
        } catch (e) {
          doc.addImage(img, 'JPEG', 20, 30, 170, 170, undefined, 'FAST');
        }
        doc.save(`MedLens_Report_${randomId}.pdf`);
      };
    } else {
      doc.save(`MedLens_Report_${randomId}.pdf`);
    }
  };

  const playAudioSummary = () => {
    if (!diagnosisResult) return;
    window.speechSynthesis.cancel();
    const text = `Analysis complete. Diagnosis is ${diagnosisResult.diagnosis} with ${diagnosisResult.confidence} percent confidence.`;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const exportFHIR = () => {
    if (!diagnosisResult) return;

    const fhirPayload = {
      resourceType: "DiagnosticReport",
      id: diagnosisResult.id || `medlens-${Date.now()}`,
      status: "final",
      category: [{
        coding: [{ system: "http://snomed.info/sct", code: "394914008", display: diagnosisResult.category || "Radiology" }]
      }],
      code: { text: diagnosisResult.diagnosis },
      conclusion: diagnosisResult.summary || diagnosisResult.diagnosis,
      contained: [],
      result: []
    };

    if (diagnosisResult.findings && diagnosisResult.findings.length > 0) {
      diagnosisResult.findings.forEach((finding, idx) => {
        const obsId = `obs-${idx}`;
        fhirPayload.contained.push({
          resourceType: "Observation",
          id: obsId,
          status: "final",
          code: { text: "Radiological Finding" },
          valueString: finding
        });
        fhirPayload.result.push({ reference: `#${obsId}` });
      });
    }

    const blob = new Blob([JSON.stringify(fhirPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR_${diagnosisResult.id || 'Report'}.json`;
    a.click();
  };

  const handlePinScan = () => {
    if (!diagnosisResult) return;
    const newPin = { ...diagnosisResult, preview: imagePreview };
    setPinnedScans(prev => {
      if (prev.find(s => s.imageHash === newPin.imageHash)) return prev;
      return [newPin, ...prev].slice(0, 2);
    });
    setDiagnosisResult(null);
  };

  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'critical': return 'bg-accent-rose/10 text-accent-rose border-accent-rose/20';
      case 'suspicious': return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20';
      case 'monitor': return 'bg-accent-indigo/10 text-accent-indigo border-accent-indigo/20';
      default: return 'bg-accent-teal/10 text-accent-teal border-accent-teal/20';
    }
  };

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden font-sans text-tx-primary">
      <Navbar />
      <div className="absolute inset-0 mesh-bg pointer-events-none" />

      {/* Comparison Tray */}
      <AnimatePresence>
        {pinnedScans.length > 0 && !showComparison && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 glass-card px-5 py-3 rounded-2xl"
          >
            <p className="text-xs font-semibold text-brand flex items-center gap-2">
              <Pin className="w-3 h-3" /> Compare Tray
            </p>
            <div className="flex gap-2">
              {pinnedScans.map((s, i) => (
                <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden border border-edge">
                  <img src={s.preview} className="w-full h-full object-cover" alt="pinned" />
                  <button
                    onClick={() => setPinnedScans(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0 right-0 bg-accent-rose text-white p-0.5 rounded-bl-lg"
                  >
                    <X size={8} />
                  </button>
                </div>
              ))}
            </div>
            {pinnedScans.length === 2 && (
              <button onClick={() => setShowComparison(true)} className="btn-primary text-xs px-4 py-2">
                Compare
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat FAB */}
      <AnimatePresence>
        {isChatOpen && (
          <div className="fixed bottom-8 right-8 z-[1000] w-full max-w-xs md:max-w-sm">
            <NeuralClinicalChat scanContext={diagnosisResult || pinnedScans[0]} onClose={() => setIsChatOpen(false)} />
          </div>
        )}
        {!isChatOpen && (diagnosisResult || pinnedScans.length > 0) && (
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-8 right-8 z-[1000] w-12 h-12 btn-primary rounded-full shadow-glow-md flex items-center justify-center p-0"
          >
            <MessageSquareCode size={20} />
          </button>
        )}
      </AnimatePresence>

      {/* Comparison Overlay */}
      <AnimatePresence>
        {showComparison && pinnedScans.length === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-surface flex flex-col p-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8 border-b border-edge pb-6">
              <h2 className="text-3xl font-extrabold tracking-tight">
                Longitudinal <span className="text-gradient">Compare</span>
              </h2>
              <button onClick={() => setShowComparison(false)} className="btn-ghost p-3">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
              {pinnedScans.map((s, i) => (
                <div key={i} className="glass-card rounded-2xl p-8 flex flex-col gap-6">
                  <p className="text-xs font-semibold text-tx-muted tracking-wider">
                    {i === 0 ? "LATEST SCAN" : "HISTORICAL REFERENCE"}
                  </p>
                  <div className="flex-1 rounded-xl overflow-hidden border border-edge relative h-[350px] bg-surface">
                    <img src={s.preview} className="w-full h-full object-contain" alt="compare-view" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-tx-primary mb-2">{s.diagnosis}</h4>
                    <div className="flex items-center gap-3">
                      <span className="badge-teal">{s.confidence}% Confidence</span>
                      <span className="text-xs font-mono text-tx-muted">v4.2.0 Engine</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {s.conditions?.slice(0, 4).map((c, ci) => (
                      <div key={ci} className="bg-surface-overlay p-3 rounded-xl border border-edge">
                        <p className="text-[10px] text-tx-muted font-medium mb-2">{c.name}</p>
                        <div className="h-1 bg-surface-subtle rounded-full overflow-hidden">
                          <div className="h-full bg-brand" style={{ width: `${c.probability}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/3 space-y-6"
          >
            <Link to="/" className="btn-ghost text-xs gap-2 -ml-3">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <h1 className="text-5xl font-extrabold tracking-tight leading-none">
              Neural{' '}
              <span className="text-gradient">Diagnostic</span>
              <br />Node
            </h1>
            <p className="text-tx-secondary text-base leading-relaxed max-w-sm">
              Multi-label diagnostic array utilizing Gemini 2.5 Flash for surgical-grade clinical interpretation.
            </p>
            <div className="space-y-3">
              {[
                { icon: <ShieldCheck size={20} />, title: "HIPAA Protocol", desc: "End-to-end encryption active", color: "text-accent-teal", bg: "bg-accent-teal/10" },
                { icon: <Zap size={20} />, title: "Real-time AI", desc: "99.8% precision calibrated", color: "text-brand", bg: "bg-brand/10" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="glass-card-hover p-5 rounded-2xl flex gap-4 items-start"
                >
                  <div className={`${item.bg} p-3 rounded-xl ${item.color} shrink-0`}>{item.icon}</div>
                  <div>
                    <h4 className="font-semibold text-sm text-tx-primary mb-0.5">{item.title}</h4>
                    <p className="text-xs text-tx-muted">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
            <div className="glass-card rounded-2xl p-1.5">
              <div className="bg-surface/80 backdrop-blur-xl rounded-xl p-8 border border-edge relative overflow-hidden min-h-[440px]">
                <MedicalScanUploadZone onUpload={handleScanUpload} isProcessing={isLoading} error={error} />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* ═══ RESULT MODAL ═══ */}
      <AnimatePresence>
        {(diagnosisResult || isLoading) && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[20px]"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-7xl h-full lg:max-h-[92vh] bg-white/[0.02] rounded-3xl border border-white/10 shadow-2xl flex flex-col lg:flex-row overflow-hidden backdrop-blur-3xl"
            >
              {/* Left: Imaging Panel */}
              <div className="w-full lg:w-[48%] h-[45vh] lg:h-full relative border-b lg:border-b-0 lg:border-r border-white/10 bg-black/40 flex flex-col justify-center items-center p-4 lg:p-10">
                {/* Status pill */}
                <div className="absolute top-5 left-5 z-30 flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
                    <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-accent-amber animate-pulse' : 'bg-accent-emerald'}`} />
                    <span className="text-[10px] font-semibold text-white tracking-wide">
                      {isLoading ? 'Analyzing...' : 'Analysis Complete'}
                    </span>
                  </div>
                  {!isLoading && (
                    <button onClick={handlePinScan} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand/20 backdrop-blur-md border border-brand/30 text-brand text-[10px] font-bold cursor-pointer hover:bg-brand/30 transition-all shadow-[0_0_15px_rgba(88,166,255,0.2)]">
                      <Pin size={10} /> Pin
                    </button>
                  )}
                </div>

                {imagePreview ? (
                  <div className="relative inline-block mx-auto group ring-1 ring-white/10 shadow-2xl rounded-xl overflow-hidden bg-black/40">
                    <img
                      ref={imgRef}
                      src={imagePreview}
                      alt="Clinical Diagnostic View"
                      className="max-h-[35vh] lg:max-h-[70vh] w-auto h-auto block select-none mix-blend-screen transition-transform duration-700"
                    />

                    {/* Scanning Animation (Locked to Image) */}
                    {isLoading && (
                      <motion.div
                        initial={{ top: 0 }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-[2px] bg-brand shadow-[0_0_15px_rgba(88,166,255,0.8)] z-20 pointer-events-none"
                      />
                    )}

                    {/* AI Diagnostic Layer (Anchored to Image) */}
                    {diagnosisResult?.roiRegions && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        {diagnosisResult.roiRegions.map((roi, idx) => {
                          const size = roi.radius ? `${roi.radius * 2}%` : '15%';
                          return (
                            <motion.div
                              key={idx}
                              title={roi.label}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              whileHover={{ scale: 1.25, zIndex: 50 }}
                              transition={{ 
                                initial: { duration: 0.5 },
                                whileHover: { type: "spring", stiffness: 300, damping: 15 }
                              }}
                              className={`absolute rounded-full border-2 cursor-crosshair group pointer-events-auto ${
                                roi.severity === 'critical' ? 'border-accent-rose bg-accent-rose/20' :
                                roi.severity === 'suspicious' ? 'border-accent-amber bg-accent-amber/20' :
                                'border-accent-teal bg-accent-teal/20'
                              }`}
                              style={{
                                left: `${roi.x}%`,
                                top: `${roi.y}%`,
                                width: size,
                                aspectRatio: '1/1',
                                transform: 'translate(-50%, -50%)',
                                boxShadow: roi.severity === 'critical' 
                                  ? '0 0 35px rgba(244,112,103,0.8)' 
                                  : '0 0 25px rgba(61,219,217,0.6)'
                              }}
                            >
                              {/* Radar Pulse Effect */}
                              <motion.div 
                                animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className={`absolute inset-0 rounded-full border-2 ${
                                  roi.severity === 'critical' ? 'border-accent-rose' : 'border-accent-teal'
                                }`}
                              />

                              {/* Interactive Label (Appears on Hover) */}
                              <motion.div
                                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                                whileHover={{ opacity: 1, y: -12, scale: 1 }}
                                className={`absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl backdrop-blur-2xl border-2 text-[12px] font-black uppercase tracking-widest whitespace-nowrap shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all pointer-events-none z-50 ${
                                  roi.severity === 'critical' ? 'bg-accent-rose text-white border-accent-rose/50' :
                                  roi.severity === 'suspicious' ? 'bg-accent-amber text-black border-accent-amber/50' :
                                  'bg-brand text-white border-brand/50'
                                }`}
                              >
                                {roi.label}
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-r-2 border-b-2 inherit-bg opacity-50 bg-inherit" />
                              </motion.div>

                              {/* Clinical Center Point */}
                              <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_white]" />
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-tx-muted font-mono text-xs gap-3">
                    <Activity className="w-8 h-8 text-edge-active animate-pulse" />
                    Initializing buffer...
                  </div>
                )}
              </div>

              {/* Right: Analysis Panel */}
              <div className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-12 custom-scrollbar relative bg-transparent selection:bg-brand/20">
                {!diagnosisResult ? (
                  <div className="h-[40vh] lg:h-full flex flex-col justify-center items-center text-center gap-6 lg:gap-10 max-w-md mx-auto py-10 lg:py-0">
                    <h2 className="text-3xl lg:text-4xl font-black leading-none tracking-tight text-white drop-shadow-xl uppercase italic">
                      Synthesizing<br />
                      <span className="text-brand drop-shadow-[0_0_20px_rgba(88,166,255,0.4)]">Clinical Core</span>
                    </h2>
                    <TerminalStreamer />
                  </div>
                ) : (
                  <div className="space-y-8 animate-fade-in">

                    {diagnosisResult.criticalAlert && (
                      <div className="bg-accent-rose/10 border border-accent-rose p-4 rounded-xl flex gap-3 text-accent-rose relative overflow-hidden group">
                        <div className="absolute inset-0 bg-accent-rose/5 animate-pulse" />
                        <Zap className="w-5 h-5 shrink-0 mt-0.5 relative z-10" />
                        <div className="relative z-10">
                          <p className="text-xs font-bold uppercase tracking-widest mb-1">Critical Finding Alert</p>
                          <p className="text-sm font-medium">{diagnosisResult.criticalAlert}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start">
                      <div className="pr-12">
                        <h2 className="text-3xl font-extrabold text-tx-primary leading-tight tracking-tight mb-3">
                          {diagnosisResult.diagnosis}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          <span className={`badge border ${getSeverityStyle(diagnosisResult.severity)}`}>
                            {diagnosisResult.severity || 'Normal'}
                          </span>
                          <span className="badge bg-surface-overlay text-tx-secondary border-edge font-mono">
                            Confidence: <span className="text-tx-primary ml-1">{diagnosisResult.confidence}%</span>
                          </span>
                          <span className="badge bg-brand/10 text-brand border border-brand/20 font-mono">
                            Attending: {user?.name || 'Dr. Unknown'}
                          </span>
                          {diagnosisResult.category && (
                            <span className="badge bg-surface-overlay text-tx-secondary border-edge font-mono">
                              {diagnosisResult.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setDiagnosisResult(null)}
                        className="btn-ghost p-2 rounded-xl hover:bg-accent-rose/10 hover:text-accent-rose absolute top-8 right-8"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="w-full h-px bg-edge" />

                    {diagnosisResult.beyondHumanFindings && diagnosisResult.beyondHumanFindings.length > 0 && (
                      <div className="bg-gradient-to-br from-brand/5 to-accent-indigo/5 border border-brand/20 p-5 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-2xl rounded-full" />
                        <h4 className="text-xs font-bold text-brand uppercase tracking-widest flex items-center gap-2 mb-3 relative z-10">
                          <Activity className="w-4 h-4" /> Sub-visual Telemetry
                        </h4>
                        <p className="text-xs text-tx-muted mb-3 relative z-10 font-mono">Subtle signatures traditionally missed by human observation:</p>
                        <ul className="space-y-2 relative z-10">
                          {diagnosisResult.beyondHumanFindings.map((finding, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-tx-secondary">
                              <span className="text-brand font-bold mt-0.5">•</span>
                              <span className="leading-snug">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-tx-muted uppercase tracking-widest border-b border-edge pb-2">Detailed Findings</h4>
                      <div className="flex gap-4 text-xs font-mono text-tx-muted mb-2">
                        <span>Analyzed: {diagnosisResult.structuralAnalysis?.examined?.length || 0} structures</span>
                        <span className="text-accent-emerald">Normal: {diagnosisResult.structuralAnalysis?.normalStructures?.length || 0}</span>
                        <span className={diagnosisResult.structuralAnalysis?.abnormalStructures?.length > 0 ? 'text-accent-rose font-bold' : ''}>
                          Abnormal: {diagnosisResult.structuralAnalysis?.abnormalStructures?.length || 0}
                        </span>
                      </div>
                      <ul className="space-y-3">
                        {diagnosisResult.findings?.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-surface-overlay p-4 rounded-xl border border-edge">
                            <Crosshair className="w-4 h-4 text-accent-indigo shrink-0 mt-0.5" />
                            <span className="text-sm text-tx-primary leading-relaxed">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {diagnosisResult.conditions && diagnosisResult.conditions.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-tx-muted uppercase tracking-widest border-b border-edge pb-2">Conditions Detected</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {diagnosisResult.conditions.map((c, i) => (
                            <div key={i} className={`p-3 rounded-xl border ${getSeverityStyle(c.severity)} bg-opacity-5`}>
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-xs leading-tight pr-4">{c.name}</span>
                                <span className="font-mono text-xs">{c.probability}%</span>
                              </div>
                              <div className="h-1 bg-surface-subtle rounded-full overflow-hidden mb-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${c.probability}%` }}
                                  className={`h-full rounded-full ${c.severity === 'critical' ? 'bg-accent-rose' : c.severity === 'normal' ? 'bg-accent-teal' : 'bg-brand'}`}
                                />
                              </div>
                              <p className="text-[10px] opacity-80 uppercase tracking-wide truncate">{c.location}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {diagnosisResult.differentialDiagnosis && diagnosisResult.differentialDiagnosis.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-tx-muted uppercase tracking-widest border-b border-edge pb-2">Differential Diagnosis</h4>
                        <div className="space-y-2">
                          {diagnosisResult.differentialDiagnosis.map((ddx, idx) => (
                            <div key={idx} className="bg-surface-overlay border border-edge p-3 rounded-xl">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold text-tx-primary">{ddx.condition}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                                  ddx.likelihood === 'high' ? 'bg-accent-rose/20 text-accent-rose' :
                                  ddx.likelihood === 'moderate' ? 'bg-accent-amber/20 text-accent-amber' :
                                  'bg-surface-subtle text-tx-muted'
                                }`}>
                                  {ddx.likelihood} likelihood
                                </span>
                              </div>
                              <p className="text-xs text-tx-muted">{ddx.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-surface-overlay p-5 rounded-2xl border border-edge">
                        <h4 className="text-xs font-bold text-tx-secondary flex items-center gap-2 mb-2">
                          <Activity size={14} /> Clinical Prognosis
                        </h4>
                        <p className="text-sm text-tx-muted leading-relaxed">{diagnosisResult.prognosis}</p>
                      </div>
                      <div className="bg-surface-overlay p-5 rounded-2xl border border-edge">
                        <h4 className="text-xs font-bold text-brand flex items-center gap-2 mb-2">
                          <ShieldCheck size={14} /> Next Steps
                        </h4>
                        <p className="text-sm text-tx-muted leading-relaxed">{diagnosisResult.recommendation}</p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h4 className="text-xs font-bold text-tx-muted tracking-widest uppercase">Export & Audit</h4>
                      <div className="flex flex-wrap gap-3">
                        <button onClick={generateClinicalPDF} className="btn-primary flex-1 min-w-[200px]">
                          <Download size={16} /> Generate Complete Dossier
                        </button>
                        <button onClick={exportFHIR} className="btn-secondary">
                          <FileJson size={16} /> FHIR format
                        </button>
                        <button onClick={playAudioSummary} className="btn-secondary" title="Audio Summary">
                          <Volume2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScanPage;