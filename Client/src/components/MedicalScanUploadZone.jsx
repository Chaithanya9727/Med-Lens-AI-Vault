import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileImage, ShieldAlert, CheckCircle2, Activity, ChevronDown, User, Camera, Heart, Wind, Zap, X } from 'lucide-react';

const SYMPTOM_OPTIONS = [
  'Fever', 'Cough', 'Chest Pain', 'Shortness of Breath',
  'Fatigue', 'Swelling', 'Joint Pain', 'Headache',
  'Weight Loss', 'Night Sweats', 'Wheezing', 'Back Pain'
];

const MedicalScanUploadZone = ({ onUpload, isProcessing, error }) => {
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [patientAge, setPatientAge] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [smokingHistory, setSmokingHistory] = useState('');
  const [showContext, setShowContext] = useState(false);

  const cameraInputRef = useRef(null);
  const notesRef = useRef(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('medlens_draft_notes');
    const savedAge = localStorage.getItem('medlens_draft_age');
    const savedSmoking = localStorage.getItem('medlens_draft_smoking');
    const savedSymptoms = localStorage.getItem('medlens_draft_symptoms');

    if (savedNotes) setClinicalNotes(savedNotes);
    if (savedAge) setPatientAge(savedAge);
    if (savedSmoking) setSmokingHistory(savedSmoking);
    if (savedSymptoms) {
      try { setSelectedSymptoms(JSON.parse(savedSymptoms)); } catch(e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('medlens_draft_notes', clinicalNotes);
    localStorage.setItem('medlens_draft_age', patientAge);
    localStorage.setItem('medlens_draft_smoking', smokingHistory);
    localStorage.setItem('medlens_draft_symptoms', JSON.stringify(selectedSymptoms));
  }, [clinicalNotes, patientAge, smokingHistory, selectedSymptoms]);

  const clearDrafts = () => {
    localStorage.removeItem('medlens_draft_notes');
    localStorage.removeItem('medlens_draft_age');
    localStorage.removeItem('medlens_draft_smoking');
    localStorage.removeItem('medlens_draft_symptoms');
  };

  const startDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setValidationError("Your primary browser engine does not support internal Web Speech dictation API hooks natively. Please type the clinical notes manually.");
      setTimeout(() => setValidationError(null), 6000);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setClinicalNotes((prev) => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onerror = (e) => {
      console.error("Dictation Error", e);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    try { recognition.start(); } catch(e){}
  };

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  // Only preview the file — do NOT trigger the API call yet
  const processFile = (selectedFile) => {
    setValidationError(null);
    setFile(null);

    if (selectedFile.name.endsWith('.dcm') || selectedFile.type === 'application/dicom') {
      setValidationError("For HIPAA-compliant native DICOM (.dcm) multi-slice decoding, please connect your facility's internal PACS integration module or convert to standard JPG/PNG for immediate local inference.");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(selectedFile);
    // Context is collected at submit time, not drop time
  };

  // Triggered by the "Analyze Scan" button — collects current context and calls onUpload
  const handleSubmitScan = () => {
    if (!file || isProcessing) return;
    const clinicalContext = {
      notes: clinicalNotes,
      age: patientAge,
      symptoms: selectedSymptoms.join(', '),
      smokingHistory: smokingHistory
    };
    if (onUpload) {
      clearDrafts();
      onUpload(file, clinicalContext);
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles?.length > 0) {
      setValidationError('Invalid diagnostic format. Required: PNG, JPEG, WebP. Limit: 50MB.');
      return;
    }
    if (acceptedFiles?.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'application/dicom': ['.dcm']
    },
    maxFiles: 1,
  });

  const getBorderClass = () => {
    if (isDragAccept) return 'border-accent-emerald bg-accent-emerald/5';
    if (isDragReject) return 'border-accent-rose bg-accent-rose/5';
    if (isDragActive) return 'border-brand bg-brand/5';
    if (error || validationError) return 'border-accent-rose/40 hover:border-accent-rose';
    return 'border-edge hover:border-edge-hover';
  };

  const contextFieldCount = (patientAge ? 1 : 0) + (smokingHistory ? 1 : 0) + (clinicalNotes.trim() ? 1 : 0) + selectedSymptoms.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto relative z-20"
    >
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative overflow-hidden glass-card rounded-2xl p-8 cursor-pointer transition-all duration-300 min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed outline-none group ${getBorderClass()} ${isDragActive ? 'scale-[1.01]' : ''}`}
      >
        <input {...getInputProps()} disabled={isProcessing} />

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full"
            >
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full border-t-2 border-brand w-20 h-20 animate-spin-slow opacity-50" />
                <div className="bg-brand/10 w-20 h-20 rounded-full flex items-center justify-center border border-brand/20">
                  <Activity className="w-8 h-8 text-brand animate-pulse" />
                </div>
              </div>
              <motion.h3
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-lg font-semibold text-tx-primary tracking-tight"
              >
                Analyzing Scan...
              </motion.h3>
              <div className="w-full max-w-xs mt-5 bg-surface-subtle rounded-full h-1 overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                  className="h-full bg-brand rounded-full"
                />
              </div>
              <p className="mt-3 text-xs text-tx-muted font-mono">
                Multi-label inference in progress...
              </p>
            </motion.div>
          ) : file && !error && !validationError ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center w-full"
            >
              <div className="relative w-full max-w-md mx-auto aspect-square rounded-xl overflow-hidden border border-edge shadow-lg mb-5 group">
                {imagePreview && (
                  <img src={imagePreview} alt="Clinical Scan" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                )}
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.6)] pointer-events-none" />
                {/* Remove file button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-black/60 border border-white/10 text-white rounded-full p-1.5 hover:bg-accent-rose/80 transition-all z-20"
                  title="Remove scan"
                >
                  <X size={12} />
                </button>
              </div>

              <h3 className="text-base font-semibold text-tx-primary mb-2">Scan Uploaded</h3>
              <div className="bg-surface-overlay px-3 py-1.5 rounded-lg border border-edge flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                <span className="text-xs font-mono text-tx-secondary truncate max-w-[200px]">{file.name}</span>
              </div>
              <p className="text-[11px] text-tx-muted mt-2">Fill in clinical context below, then click <span className="text-brand font-semibold">Analyze Scan</span></p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center"
            >
              <div className={`transition-all duration-300 w-16 h-16 rounded-2xl flex items-center justify-center mb-5 border border-edge ${isDragActive ? 'bg-brand/15 rotate-6 scale-110' : 'bg-surface-overlay group-hover:-translate-y-1'}`}>
                <UploadCloud className={`w-8 h-8 transition-colors ${isDragActive ? 'text-brand' : 'text-tx-muted group-hover:text-tx-primary'}`} />
              </div>

              <h3 className="text-lg font-semibold text-tx-primary mb-2">
                {isDragActive ? "Drop to Upload" : "Upload Clinical Scan"}
              </h3>
              <p className="text-tx-secondary text-sm max-w-[80%] mx-auto mb-4">
                Drag and drop your file here, or{' '}
                <span className="text-brand font-medium cursor-pointer hover:underline">browse</span>
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="mt-1 flex items-center gap-2 px-4 py-2 bg-[#1C2128] border border-edge rounded-lg text-xs font-semibold text-tx-primary hover:bg-brand/10 hover:border-brand/40 transition-all shadow-sm group-hover:scale-105"
              >
                <Camera className="w-3.5 h-3.5 text-brand" />
                Mobile / Camera Capture
              </button>

              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
                ref={cameraInputRef} 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    processFile(e.target.files[0]);
                  }
                }} 
              />

              <div className="mt-6 flex items-center gap-3 text-xs text-tx-muted pt-4 border-t border-edge w-full justify-center">
                <ShieldAlert className="w-3.5 h-3.5 text-accent-indigo" />
                <span>E2E Encrypted</span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>DICOM • PNG • JPG</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {(error || validationError) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 w-full bg-accent-rose/10 border border-accent-rose/20 p-4 rounded-xl flex items-start gap-3"
          >
            <div className="w-1 h-full bg-accent-rose rounded-full shrink-0" />
            <ShieldAlert className="w-5 h-5 text-accent-rose shrink-0 mt-0.5" />
            <div>
              <h4 className="text-accent-rose font-semibold text-sm mb-0.5">Upload Error</h4>
              <p className="text-sm text-tx-secondary">{error || validationError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clinical Context Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-3 w-full glass-card rounded-xl overflow-hidden"
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setShowContext(!showContext); }}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-overlay/30 transition-colors"
        >
          <span className="text-xs text-tx-muted font-medium flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-accent-indigo" />
            Patient Clinical Context
            {contextFieldCount > 0 && (
              <span className="badge-teal text-[9px] py-0.5">{contextFieldCount} provided</span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 text-tx-muted transition-transform ${showContext ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showContext && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4 border-t border-edge pt-4" onClick={e => e.stopPropagation()}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-tx-muted font-medium block mb-1.5">Patient Age</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="e.g. 45"
                      value={patientAge}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 150)) {
                          setPatientAge(val);
                        }
                      }}
                      className="w-full border border-edge rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand/40"
                      style={{ backgroundColor: '#161B22', color: '#E6EDF3', colorScheme: 'dark' }}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-tx-muted font-medium block mb-1.5">Smoking History</label>
                    <select
                      value={smokingHistory}
                      onChange={(e) => setSmokingHistory(e.target.value)}
                      className="w-full border border-edge rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand/40 appearance-none cursor-pointer"
                      style={{ backgroundColor: '#161B22', color: '#E6EDF3', colorScheme: 'dark' }}
                      disabled={isProcessing}
                    >
                      <option value="" style={{ backgroundColor: '#0D1117', color: '#E6EDF3' }}>Not specified</option>
                      <option value="Never" style={{ backgroundColor: '#0D1117', color: '#E6EDF3' }}>Never smoked</option>
                      <option value="Former (quit >1yr)" style={{ backgroundColor: '#0D1117', color: '#E6EDF3' }}>Former (quit &gt;1yr)</option>
                      <option value="Former (quit <1yr)" style={{ backgroundColor: '#0D1117', color: '#E6EDF3' }}>Former (quit &lt;1yr)</option>
                      <option value="Current - light" style={{ backgroundColor: '#0D1117', color: '#E6EDF3' }}>Current - light</option>
                      <option value="Current - heavy" style={{ backgroundColor: '#0D1117', color: '#E6EDF3' }}>Current - heavy</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-tx-muted font-medium block mb-2">Reported Symptoms</label>
                  <div className="flex flex-wrap gap-1.5">
                    {SYMPTOM_OPTIONS.map(symptom => (
                      <button
                        key={symptom}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleSymptom(symptom);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all border ${
                          selectedSymptoms.includes(symptom)
                            ? 'bg-brand text-white border-brand shadow-[0_0_12px_rgba(88,166,255,0.4)]'
                            : 'bg-[#1C2128] text-tx-secondary border-edge hover:border-brand/40 hover:text-tx-primary'
                        }`}
                        disabled={isProcessing}
                      >
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Clinical Notes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-3 w-full glass-card rounded-xl p-4 flex flex-col"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-tx-muted font-medium flex items-center gap-2">
            Clinical Notes
            {isListening && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-rose opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-rose" />
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={startDictation}
            className={`p-2 rounded-lg transition-all ${isListening ? 'bg-accent-rose/15 text-accent-rose' : 'bg-surface-overlay hover:bg-surface-subtle text-tx-muted border border-edge'}`}
            title="Dictate Notes"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </button>
        </div>
        <textarea
          ref={notesRef}
          className="w-full border border-edge rounded-lg p-3 text-sm focus:outline-none focus:border-brand/40 resize-none overflow-hidden min-h-[60px]"
          style={{ backgroundColor: 'var(--surface-overlay)', color: '#E6EDF3' }}
          rows="2"
          placeholder="Type observation sequences or dictate securely..."
          value={clinicalNotes}
          onChange={(e) => {
            setClinicalNotes(e.target.value);
            if (notesRef.current) {
              notesRef.current.style.height = 'auto';
              notesRef.current.style.height = `${notesRef.current.scrollHeight}px`;
            }
          }}
          disabled={isProcessing}
        />
      </motion.div>

      {/* ── Analyze Scan CTA ── */}
      <AnimatePresence>
        {file && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mt-4 w-full"
          >
            <button
              type="button"
              onClick={handleSubmitScan}
              className="w-full btn-primary py-3.5 text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-glow-md"
            >
              <Zap size={16} />
              Analyze Scan
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MedicalScanUploadZone;
