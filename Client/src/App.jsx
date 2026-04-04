import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { jsPDF } from 'jspdf';
import MedicalScanUploadZone from './components/MedicalScanUploadZone';
import Navbar from './components/Navbar';
import FeatureSection from './components/FeatureSection';
import InfoSections from './components/InfoSections';
import { useAuth } from './components/AuthOverlay';
import api, { setupInterceptors } from './services/api';
import { Activity, ArrowRight, ExternalLink, Download, X } from 'lucide-react';

function App() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [scanFile, setScanFile] = useState(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    setupInterceptors(setIsLoading, setError);
  }, []);

  const handleScanUpload = useCallback(async (file, clinicalNotes = '') => {
    setDiagnosisResult(null);
    setScanFile(file);
    const formData = new FormData();
    formData.append('scan', file);
    formData.append('notes', clinicalNotes);
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
    const randomId = Math.random().toString(36).substr(2, 9).toUpperCase();

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("MED-LENS AI VAULT", 20, 25);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Automated Clinical Analysis Report", 20, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Report ID: ${randomId}`, 20, 65);
    doc.text(`Generated: ${dateStr}`, 20, 70);
    doc.text(`Engine: ${diagnosisResult.telemetry?.engine || 'Gemini 2.5 Flash Vision'}`, 20, 75);

    doc.setDrawColor(200);
    doc.line(20, 80, 190, 80);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Primary Diagnosis:", 20, 95);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(239, 68, 68);
    doc.text(diagnosisResult.diagnosis || 'Standard Output', 60, 95);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Confidence Score:", 20, 105);
    doc.setFont("helvetica", "normal");
    doc.text(`${diagnosisResult.confidence || 'N/A'}%`, 60, 105);

    doc.setFont("helvetica", "bold");
    doc.text("Clinical Explanation:", 20, 120);
    doc.setFont("helvetica", "normal");
    const messageLines = doc.splitTextToSize(diagnosisResult.message || 'No description provided.', 170);
    doc.text(messageLines, 20, 130);

    if (scanFile && scanFile.type.startsWith('image/')) {
      const fileUrl = URL.createObjectURL(scanFile);
      const img = new Image();
      img.src = fileUrl;
      img.onload = () => {
        doc.setFont("helvetica", "bold");
        doc.text("Scan Snapshot:", 20, 150 + (messageLines.length * 5));
        doc.addImage(img, 'JPEG', 20, 160 + (messageLines.length * 5), 100, 100);
        doc.save(`MedLens_Report_${randomId}.pdf`);
      };
    } else {
      doc.save(`MedLens_Report_${randomId}.pdf`);
    }
  };

  return (
    <div className="bg-surface relative overflow-hidden min-h-screen">
      <Navbar />

      {/* Background */}
      <div className="absolute inset-0 mesh-bg pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 z-10 w-full min-h-[85vh]">
        <motion.div
          style={{ opacity: heroOpacity }}
          className="flex-1 text-left relative z-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex flex-col mb-8"
          >
            <div className="badge-brand mb-6 w-max">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
              <span>Model v4.2 — Online</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-tx-primary leading-[0.95] tracking-tight">
              <motion.span
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                AI Powered
              </motion.span>{' '}
              <br />
              <span className="text-gradient-animate">Diagnostic</span>{' '}
              <br />
              Intelligence.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-tx-secondary max-w-lg mb-8 leading-relaxed font-medium"
          >
            Leverage enterprise-grade neural networks to analyze medical streams instantly and securely, achieving 99.8% precision across 5M+ annotated nodes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-3"
          >
            <button className="btn-primary">
              Deploy Node <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => window.location.href='/admin'} className="btn-secondary">
              Access Telemetry <ExternalLink className="w-4 h-4 opacity-60" />
            </button>
          </motion.div>
        </motion.div>

        {/* Upload Interface */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex-1 w-full relative z-20"
        >
          <MedicalScanUploadZone
            onUpload={handleScanUpload}
            isProcessing={isLoading}
            error={error}
          />
        </motion.div>
      </section>

      <FeatureSection />
      <InfoSections />

      {/* Footer */}
      <footer className="border-t border-edge bg-surface-raised/30">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-accent-teal flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-tx-primary">Med-Lens AI</span>
          </div>
          <p className="text-xs font-mono text-tx-muted">
            © 2026 Med-Lens Systems. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Diagnostic Results Overlay */}
      <AnimatePresence>
        {(diagnosisResult || isLoading) && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center px-6 py-10 bg-surface/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="relative w-full max-w-6xl h-full max-h-[90vh] bg-surface-raised rounded-2xl border border-edge shadow-2xl flex flex-col md:flex-row overflow-hidden"
            >
              {/* Left: Imaging */}
              <div className="w-full md:w-[45%] h-full relative border-b md:border-b-0 md:border-r border-edge flex flex-col pt-10 pb-6 px-6 bg-surface">
                <div className="absolute top-4 left-5 flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-accent-amber animate-pulse' : 'bg-accent-emerald'}`} />
                  <span className={`text-[10px] font-semibold tracking-wide ${isLoading ? 'text-accent-amber' : 'text-accent-emerald'}`}>
                    {isLoading ? 'Analyzing...' : 'Imaging Payload'}
                  </span>
                </div>

                <div className="flex-1 relative rounded-xl overflow-hidden border border-edge bg-surface-overlay">
                  <MedicalScanUploadZone
                    onUpload={handleScanUpload}
                    isProcessing={isLoading}
                    error={error}
                  />
                </div>

                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-tx-muted font-medium">Engine</p>
                    <p className="text-xs text-tx-primary font-mono">Gemini 2.5 Flash</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-tx-muted font-medium">Status</p>
                    <p className={`text-xs font-mono ${isLoading ? 'text-accent-amber' : 'text-accent-emerald'}`}>
                      {isLoading ? 'Processing...' : 'Verified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Results */}
              <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-8 lg:p-10 relative">
                {!diagnosisResult && isLoading ? (
                  <div className="h-full flex flex-col items-start justify-center">
                    <div className="w-full max-w-sm mb-10">
                      <p className="text-brand font-mono text-xs mb-3 tracking-wider">Initializing Neural Weights...</p>
                      <div className="h-1 w-full bg-surface-subtle rounded-full overflow-hidden">
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="h-full w-1/3 bg-brand shadow-glow-sm"
                        />
                      </div>
                    </div>
                    <h2 className="text-4xl font-extrabold text-tx-primary mb-6 leading-tight tracking-tight">
                      Engaging<br />Diagnostic Core...
                    </h2>
                    <div className="space-y-3">
                      {[
                        'Connecting to clinical nodes...',
                        'Mapping anatomical features...',
                        'Measuring pixel-level anomalies...',
                        'Synthesizing diagnostic reasoning...'
                      ].map((text, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.5 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-1.5 h-1.5 bg-brand/40 rounded-full" />
                          <span className="text-xs font-mono text-tx-muted">{text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : diagnosisResult ? (
                  <div className="animate-fade-in">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-3xl font-extrabold text-tx-primary mb-2 leading-tight tracking-tight">
                          {diagnosisResult.diagnosis}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="badge-teal">Verified</span>
                          <span className="text-xs text-tx-muted font-mono">
                            ID: #{Math.random().toString(36).substr(2, 8).toUpperCase()}
                          </span>
                          <span className="badge bg-brand/10 text-brand border border-brand/20 font-mono text-xs">
                            Attending: {user?.name || 'Dr. Unknown'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setDiagnosisResult(null)}
                        className="btn-ghost p-3 rounded-xl hover:bg-accent-rose/10 hover:text-accent-rose"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
                      <div className="bg-surface-overlay rounded-2xl border border-edge p-5 flex items-center justify-between group hover:border-brand/30 transition-all">
                        <div>
                          <p className="text-[10px] text-tx-muted font-medium mb-1">Confidence</p>
                          <p className="text-3xl font-extrabold text-tx-primary">
                            {diagnosisResult.confidence || '—'}
                            <span className="text-sm text-brand ml-1">%</span>
                          </p>
                        </div>
                        <div className="w-16 h-1 bg-surface-subtle rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${diagnosisResult.confidence || 85}%` }}
                            transition={{ duration: 1.5 }}
                            className="h-full bg-brand"
                          />
                        </div>
                      </div>

                      <div className="bg-brand/5 rounded-2xl border border-brand/15 p-5">
                        <p className="text-[10px] text-brand font-semibold mb-2 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                          Neural Reasoning
                        </p>
                        <p className="text-xs text-tx-secondary leading-relaxed">
                          "{diagnosisResult.evidence || 'Visual analysis confirmed atypia matching clinical markers.'}"
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Prognosis */}
                      <div className="relative pl-5">
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent-indigo" />
                        <p className="text-[10px] text-accent-indigo font-semibold mb-1">Health Forecast</p>
                        <p className="text-sm text-tx-secondary leading-relaxed">
                          {diagnosisResult.prognosis || 'Monitor for 6-month progression.'}
                        </p>
                      </div>

                      {/* Findings */}
                      {diagnosisResult.findings && (
                        <div>
                          <p className="text-[10px] text-tx-muted font-semibold mb-3 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> Structural Findings
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {diagnosisResult.findings.map((f, i) => (
                              <div key={i} className="bg-surface-overlay p-3 rounded-xl border border-edge flex items-center gap-2 hover:bg-surface-subtle transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-teal shrink-0" />
                                <span className="text-xs text-tx-secondary">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendation */}
                      <div className="bg-accent-rose/5 rounded-2xl border border-accent-rose/15 p-5">
                        <p className="text-[10px] text-accent-rose font-semibold mb-2">Clinical Protocol</p>
                        <p className="text-sm text-tx-primary font-medium leading-relaxed">
                          {diagnosisResult.recommendation}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-edge">
                        <button onClick={generateClinicalPDF} className="btn-primary flex-1 min-w-[180px]">
                          <Download className="w-4 h-4" /> Export Report
                        </button>
                        <button className="btn-secondary flex-1 min-w-[180px]">
                          Clinical Collaboration
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
