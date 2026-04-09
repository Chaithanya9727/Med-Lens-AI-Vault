import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, X, Info, Loader2, Sparkles, Stethoscope, Brain, AlertTriangle, ChevronRight } from 'lucide-react';
import axios from 'axios';

// Dedicated API instance for chat — bypasses global interceptors
const chatApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 60000, // 60s for complex clinical reasoning
});

// ── Smart initial suggestions based on scan context ──
function getInitialSuggestions(ctx) {
  if (!ctx) return [];
  const sev = (ctx.severity || '').toLowerCase();
  const cat = (ctx.category || '').toLowerCase();

  if (sev === 'critical') {
    return [
      "What is the most urgent clinical action needed?",
      "Explain the pathophysiology of this finding",
      "What specialist referrals are indicated?"
    ];
  }
  if (sev === 'suspicious') {
    return [
      "What additional imaging would confirm this?",
      "What is the differential diagnosis?",
      "What are the key risk factors to assess?"
    ];
  }
  if (cat.includes('neuro')) {
    return [
      "Are there any early neurodegenerative markers?",
      "What cognitive assessments should follow?",
      "Explain the white matter findings"
    ];
  }
  if (cat.includes('pulmon') || cat.includes('cardiac')) {
    return [
      "Are there signs of early-stage disease?",
      "What lab workup would you recommend?",
      "What lifestyle modifications should be advised?"
    ];
  }
  if (cat.includes('ortho')) {
    return [
      "Is there any evidence of stress fractures?",
      "What alignment abnormalities are present?",
      "What rehabilitation protocol would you suggest?"
    ];
  }
  return [
    "Summarize the most important findings",
    "What would a general doctor likely miss here?",
    "When should follow-up imaging be done?"
  ];
}

// ── Markdown-lite renderer for AI responses ──
function renderMedicalMarkdown(text) {
  if (!text) return '';
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-tx-primary font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Bullet points (• or -)
    .replace(/^[•\-]\s+(.+)$/gm, '<div class="flex items-start gap-2 ml-1"><span class="text-brand mt-0.5 shrink-0">▸</span><span>$1</span></div>')
    // Numbered lists
    .replace(/^(\d+)\.\s+(.+)$/gm, '<div class="flex items-start gap-2 ml-1"><span class="text-brand font-mono text-[11px] mt-0.5 shrink-0 min-w-[18px]">$1.</span><span>$2</span></div>')
    // Line breaks
    .replace(/\n/g, '<br />');
}

const NeuralClinicalChat = ({ scanContext, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // ── Initialize with context-aware greeting ──
  useEffect(() => {
    if (!scanContext) return;
    const severity = scanContext.severity || 'normal';
    const conditionCount = scanContext.conditions?.length || 0;

    let greeting = '';
    if (severity === 'critical') {
      greeting = `⚠️ **Critical finding detected.** I've analyzed the complete diagnostic profile for "${scanContext.diagnosis}" (${scanContext.confidence}% confidence). ${conditionCount} condition${conditionCount !== 1 ? 's' : ''} assessed. I'm ready to assist with urgent clinical decision-making.`;
    } else if (severity === 'suspicious') {
      greeting = `I've reviewed the diagnostic analysis: **"${scanContext.diagnosis}"** with ${scanContext.confidence}% confidence. Suspicious findings require attention. ${conditionCount} condition${conditionCount !== 1 ? 's' : ''} were evaluated. How can I assist your clinical assessment?`;
    } else {
      greeting = `I've completed my review of **"${scanContext.diagnosis}"** (${scanContext.confidence}% confidence, ${conditionCount} structures assessed). The imaging study is available for deep consultation. What would you like to explore?`;
    }

    setMessages([{ role: 'assistant', content: greeting }]);
    setSuggestions(getInitialSuggestions(scanContext));
  }, [scanContext]);

  // ── Auto-scroll ──
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  }, [messages, isTyping]);

  // ── Send message ──
  const handleSend = useCallback(async (overrideMsg) => {
    const userMsg = (overrideMsg || inputValue).trim();
    if (!userMsg || isTyping) return;

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputValue('');
    setSuggestions([]); // Clear during processing
    setIsTyping(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const stored = localStorage.getItem('medlens_auth_user');
      const userObj = stored ? JSON.parse(stored) : null;

      // ── Send the FULL scan context — every field the backend needs ──
      const response = await chatApi.post('/chat', {
        question: userMsg,
        history: chatHistory,
        doctorId: userObj?.id,
        doctorName: userObj?.name,
        scanContext: {
          diagnosis: scanContext.diagnosis,
          confidence: scanContext.confidence,
          severity: scanContext.severity,
          category: scanContext.category,
          findings: scanContext.findings,
          summary: scanContext.summary,
          evidence: scanContext.evidence,
          prognosis: scanContext.prognosis,
          recommendation: scanContext.recommendation,
          criticalAlert: scanContext.criticalAlert,
          conditions: scanContext.conditions,
          differentialDiagnosis: scanContext.differentialDiagnosis,
          structuralAnalysis: scanContext.structuralAnalysis,
          beyondHumanFindings: scanContext.beyondHumanFindings,
          roiRegions: scanContext.roiRegions
        }
      });

      const answer = response.data.answer;
      const newSuggestions = response.data.suggestions || [];

      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      setSuggestions(newSuggestions);

    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "**Connection interrupted.** The neural reasoning core is temporarily unavailable. Please retry your question — your conversation context has been preserved."
      }]);
      setSuggestions([
        "Can you summarize the key findings?",
        "What should I look for in follow-up?",
        "Retry my last question"
      ]);
    } finally {
      setIsTyping(false);
      // Focus back on input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputValue, isTyping, messages, scanContext]);

  const handleSuggestionClick = (suggestion) => {
    if (isTyping) return;
    handleSend(suggestion);
  };

  const severityColor = (scanContext?.severity || 'normal') === 'critical'
    ? 'text-accent-rose' : (scanContext?.severity || 'normal') === 'suspicious'
    ? 'text-accent-amber' : 'text-accent-teal';

  const severityBg = (scanContext?.severity || 'normal') === 'critical'
    ? 'bg-accent-rose/10 border-accent-rose/20' : (scanContext?.severity || 'normal') === 'suspicious'
    ? 'bg-accent-amber/10 border-accent-amber/20' : 'bg-accent-teal/10 border-accent-teal/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="flex flex-col overflow-hidden w-full h-[560px] rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.6)] border border-white/[0.08]"
      style={{ background: 'linear-gradient(165deg, rgba(10,12,18,0.97) 0%, rgba(6,8,14,0.98) 100%)' }}
    >
      {/* ═══ Header ═══ */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06]"
        style={{ background: 'linear-gradient(135deg, rgba(88,166,255,0.06) 0%, transparent 70%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-brand/15 rounded-xl flex items-center justify-center border border-brand/20">
              <Stethoscope className="w-4 h-4 text-brand" />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-emerald rounded-full border-2 border-surface" />
          </div>
          <div>
            <span className="text-xs font-bold text-tx-primary tracking-wide">Neural Link</span>
            <p className="text-[9px] text-tx-muted font-mono tracking-wider">CLINICAL CONSULTATION MODE</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-tx-muted hover:text-tx-primary hover:bg-white/5 transition-all p-1.5 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ═══ Context Bar ═══ */}
      <div className={`px-4 py-2 border-b border-white/[0.04] flex items-center gap-2 ${severityBg}`}>
        {scanContext?.severity === 'critical' ? (
          <AlertTriangle className={`w-3 h-3 ${severityColor} shrink-0`} />
        ) : (
          <Brain className={`w-3 h-3 ${severityColor} shrink-0`} />
        )}
        <span className={`text-[10px] font-semibold truncate ${severityColor}`}>
          {scanContext?.diagnosis || 'No scan loaded'}
        </span>
        <span className="text-[9px] text-tx-muted font-mono ml-auto shrink-0">
          {scanContext?.confidence}%
        </span>
      </div>

      {/* ═══ Messages ═══ */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Sparkles className="w-3 h-3 text-brand" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand text-white px-4 py-3 font-medium rounded-br-md shadow-[0_4px_20px_rgba(88,166,255,0.25)]'
                  : 'bg-white/[0.03] text-tx-secondary px-4 py-3 border border-white/[0.06] rounded-bl-md'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <div
                    className="clinical-response space-y-1.5"
                    dangerouslySetInnerHTML={{ __html: renderMedicalMarkdown(msg.content) }}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="w-6 h-6 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 mr-2 mt-1">
              <Sparkles className="w-3 h-3 text-brand" />
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] text-tx-muted font-mono ml-1">Analyzing...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ═══ Suggestion Chips ═══ */}
      <AnimatePresence>
        {suggestions.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="px-3 pb-2 overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleSuggestionClick(s)}
                  className="group flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium text-tx-muted bg-white/[0.03] border border-white/[0.06] hover:bg-brand/10 hover:text-brand hover:border-brand/20 transition-all cursor-pointer leading-tight"
                >
                  <ChevronRight className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
                  <span className="text-left">{s}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Input ═══ */}
      <div className="p-3 border-t border-white/[0.06]" style={{ background: 'rgba(6,8,14,0.6)' }}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about findings, prognosis, next steps..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-3 pl-4 pr-12 text-[13px] text-tx-primary placeholder:text-tx-muted/50 focus:outline-none focus:border-brand/40 focus:bg-white/[0.05] transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={isTyping || !inputValue.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-brand text-white rounded-lg hover:bg-brand-light active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 shadow-[0_2px_10px_rgba(88,166,255,0.3)]"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[8px] text-tx-muted/40 text-center mt-1.5 font-mono tracking-wider">
          AI-ASSISTED · NOT A SUBSTITUTE FOR CLINICAL JUDGMENT
        </p>
      </div>
    </motion.div>
  );
};

export default NeuralClinicalChat;
