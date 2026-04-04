import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, X, Info, Loader2 } from 'lucide-react';
import axios from 'axios';

// Dedicated API instance for chat — bypasses global interceptors
const chatApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 30000,
});

const NeuralClinicalChat = ({ scanContext, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `I've reviewed the analysis of "${scanContext.diagnosis}". How can I help with this study?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const stored = localStorage.getItem('medlens_auth_user');
      const userObj = stored ? JSON.parse(stored) : null;
      
      const response = await chatApi.post('/chat', {
        question: userMsg,
        history: chatHistory,
        doctorId: userObj?.id,
        doctorName: userObj?.name,
        scanContext: {
          diagnosis: scanContext.diagnosis,
          confidence: scanContext.confidence,
          findings: scanContext.findings,
          summary: scanContext.summary
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection interrupted. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 16, y: 16 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 16, y: 16 }}
      className="glass-card rounded-2xl flex flex-col overflow-hidden w-full max-w-sm h-[480px] shadow-2xl"
    >
      {/* Header */}
      <div className="bg-surface-overlay/80 px-4 py-3 flex items-center justify-between border-b border-edge">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-brand/15 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-brand" />
          </div>
          <span className="text-xs font-semibold text-tx-primary">Clinical Assistant</span>
        </div>
        <button onClick={onClose} className="text-tx-muted hover:text-tx-primary transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Context */}
      <div className="bg-brand/5 px-4 py-2 border-b border-brand/10 flex items-center gap-2">
        <Info className="w-3 h-3 text-brand" />
        <span className="text-[10px] text-brand font-medium truncate">Context: {scanContext.diagnosis}</span>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
      >
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-3 rounded-xl text-[13px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-brand text-white font-medium'
                : 'bg-surface-overlay text-tx-secondary border border-edge flex flex-col gap-2'
            }`}>
              {msg.role === 'user' ? (
                msg.content
              ) : (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-tx-primary">$1</strong>')
                      .replace(/\n/g, '<br />')
                  }} 
                />
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface-overlay p-3 rounded-xl flex gap-1 border border-edge">
              <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-edge bg-surface-overlay/50">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask about the scan..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-surface border border-edge rounded-xl py-3 pl-4 pr-12 text-[13px] text-tx-primary placeholder:text-tx-muted focus:outline-none focus:border-brand/40 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !inputValue.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-brand text-white rounded-lg hover:bg-brand-light active:scale-95 transition-all disabled:opacity-40 disabled:scale-100"
          >
            {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NeuralClinicalChat;
