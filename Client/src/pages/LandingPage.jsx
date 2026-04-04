import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Shield, Cpu, Zap, Activity, ChevronRight, Sparkles, Lock, Globe, Code2, Server, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

  return (
    <div className="bg-surface min-h-screen text-tx-primary font-sans relative">
      <Navbar />

      {/* ════════ HERO ════════ */}
      <section className="relative w-full pt-32 pb-24 overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 mesh-bg pointer-events-none" />
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

        {/* Radial spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brand/[0.06] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            style={{ opacity: heroOpacity }}
            className="flex flex-col items-center text-center"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {/* Status badge */}
            <motion.div variants={fadeUp} className="mb-8">
              <div className="badge-brand">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
                </span>
                <span>Diagnostic Engine v4.2 — Online</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[0.9] tracking-tight mb-8 max-w-4xl"
            >
              Clinical Vision,{' '}
              <span className="text-gradient-animate">Redefined.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-tx-secondary max-w-2xl mb-10 leading-relaxed font-medium"
            >
              Med-Lens AI Vault leverages enterprise-grade neural networks to analyze medical imaging instantly and securely — achieving 99.8% diagnostic precision across 5M+ annotated datasets.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/scan" className="btn-primary text-base px-8 py-4 rounded-2xl group">
                Launch Diagnostic Node
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="#technology" className="btn-secondary text-base px-8 py-4 rounded-2xl">
                Explore Architecture
                <ChevronRight className="w-5 h-5 opacity-60" />
              </a>
            </motion.div>
          </motion.div>

          {/* Hero visual — Floating terminal */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-20 relative max-w-4xl mx-auto"
          >
            {/* Glow behind card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-brand/20 via-accent-teal/20 to-accent-indigo/20 rounded-3xl blur-2xl opacity-50" />

            <div className="relative glass-card rounded-2xl overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center gap-3 px-5 py-3.5 bg-surface-overlay/60 border-b border-edge">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-accent-rose/80" />
                  <div className="w-3 h-3 rounded-full bg-accent-amber/80" />
                  <div className="w-3 h-3 rounded-full bg-accent-emerald/80" />
                </div>
                <span className="text-[11px] font-mono text-tx-muted ml-2">med-lens — diagnostic-terminal</span>
              </div>

              {/* Terminal body */}
              <div className="aspect-[21/9] bg-surface/80 relative overflow-hidden p-8 flex items-center justify-center">
                <div className="absolute inset-0 dot-pattern opacity-30" />
                <div className="text-center space-y-5 relative z-10">
                  {/* Animated bars */}
                  <div className="flex justify-center gap-3">
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [16, 36, 16] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                        className="w-1 bg-brand/60 rounded-full"
                      />
                    ))}
                  </div>
                  <p className="text-xs font-mono text-tx-muted tracking-widest">
                    AWAITING CLINICAL UPLINK...
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center justify-center gap-8 pt-4">
                    {[
                      { label: 'Precision', value: '99.8%' },
                      { label: 'Latency', value: '<800ms' },
                      { label: 'Nodes', value: '5M+' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center">
                        <p className="text-lg font-bold text-tx-primary">{stat.value}</p>
                        <p className="text-[10px] font-mono text-tx-muted tracking-wider">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HUD corner elements */}
                <div className="absolute top-6 left-6 space-y-2">
                  <div className="h-1 w-16 bg-surface-subtle rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: ['0%', '70%', '45%', '85%'] }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="h-full bg-brand/60"
                    />
                  </div>
                  <p className="text-[9px] font-mono text-tx-muted">SYS LOAD</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════ VALUE PROPS ════════ */}
      <section className="section-padding max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: <Shield className="w-6 h-6 text-accent-teal" />,
              title: "Military-Grade Security",
              text: "Zero-knowledge encryption with quantum-safe protocols. Patient data never rests on unencrypted volumes.",
              accent: "accent-teal"
            },
            {
              icon: <Cpu className="w-6 h-6 text-brand" />,
              title: "Neural Optimization",
              text: "Pixel-perfect analysis via Gemini 2.5 Flash architecture with spatial awareness and multi-label detection.",
              accent: "brand"
            },
            {
              icon: <Zap className="w-6 h-6 text-accent-indigo" />,
              title: "Sub-Second Inference",
              text: "Instant diagnostic synthesis for urgent clinical paths, delivering results in under 800ms end-to-end.",
              accent: "accent-indigo"
            }
          ].map((prop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card-hover p-7 rounded-2xl group"
            >
              <div className={`mb-5 bg-${prop.accent}/10 p-3 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300`}>
                {prop.icon}
              </div>
              <h3 className="text-lg font-bold mb-3 text-tx-primary">{prop.title}</h3>
              <p className="text-sm text-tx-secondary leading-relaxed">{prop.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════ STATS TICKER ════════ */}
      <div className="w-full py-5 bg-surface-raised/50 border-y border-edge overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="text-[11px] font-mono text-tx-muted px-10 tracking-widest">
              99.8% ACCURACY  •  5M+ DATASETS  •  HIPAA COMPLIANT  •  GDPR READY  •  AES-256  •  SOC2 CERTIFIED  •
            </span>
          ))}
        </div>
      </div>

      {/* ════════ TECHNOLOGY SECTION ════════ */}
      <section id="technology" className="section-padding max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-brand text-sm font-semibold tracking-widest uppercase mb-4"
          >
            Architecture
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
          >
            Intelligence that{' '}
            <span className="text-gradient">scales.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            viewport={{ once: true }}
            className="text-tx-secondary mt-4 text-lg max-w-2xl mx-auto"
          >
            Security that doesn't compromise.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: <Cpu className="w-6 h-6 text-accent-indigo" />, title: "Neural Diagnostics", desc: "Multi-layered CNNs trained on 5M+ clinical datasets for pinpoint anomaly detection." },
            { icon: <Zap className="w-6 h-6 text-accent-teal" />, title: "Sub-second Inference", desc: "Optimized tensor pipelines deliver diagnostic breakdowns in under 800ms." },
            { icon: <Shield className="w-6 h-6 text-accent-emerald" />, title: "HIPAA Compliant", desc: "End-to-end RSA-4096 encryption ensures patient PHI is always protected." },
            { icon: <Activity className="w-6 h-6 text-brand" />, title: "Continuous Learning", desc: "Federated learning streams constantly sharpen accuracy on rare pathologies." }
          ].map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              viewport={{ once: true }}
              className="glass-card-hover p-6 rounded-2xl group"
            >
              <div className="bg-surface-overlay p-3 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform duration-300 border border-edge">
                {f.icon}
              </div>
              <h3 className="text-base font-bold mb-2 text-tx-primary">{f.title}</h3>
              <p className="text-sm text-tx-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════ SECURITY SECTION ════════ */}
      <section id="security" className="section-padding max-w-6xl mx-auto relative z-10 border-t border-edge">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
                Zero-Trust Clinical{' '}
                <span className="text-gradient">Security.</span>
              </h2>
              <p className="text-lg text-tx-secondary mb-6 leading-relaxed">
                Patient data never rests on unencrypted volumes. Our node gateways instantly encrypt DICOM streams using AES-256 before inference. Post-analysis buffers are shredded from memory to ensure absolute HIPAA and GDPR compliance.
              </p>
              <div className="flex items-center gap-3 text-sm font-semibold text-accent-teal">
                <Lock className="w-5 h-5" />
                SOC2 Certified Node Network
              </div>
            </motion.div>
          </div>

          <div className="flex-1 w-full">
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group border-accent-emerald/20">
              <div className="absolute inset-0 bg-accent-emerald/[0.02] group-hover:bg-accent-emerald/[0.04] transition-colors" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -right-8 -top-8 text-accent-emerald/[0.06]"
              >
                <Server className="w-48 h-48" />
              </motion.div>
              <div className="relative z-10 font-mono text-accent-emerald/70 text-sm space-y-1.5">
                <p>{'>'} initializing encrypted connection...</p>
                <p>{'>'} protocol RSA-4096 handshake: <span className="text-accent-emerald">OK</span></p>
                <p>{'>'} buffering patient stream... <span className="text-accent-emerald">SECURE</span></p>
                <p className="mt-4 text-tx-primary/80 border-l-2 border-accent-emerald pl-3 font-semibold">
                  SYSTEM SECURED
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ ENTERPRISE SECTION ════════ */}
      <section id="enterprise" className="section-padding max-w-6xl mx-auto relative z-10 border-t border-edge">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
                Ready for{' '}
                <span className="text-gradient">Enterprise.</span>
              </h2>
              <p className="text-lg text-tx-secondary mb-6 leading-relaxed">
                Deploy Med-Lens inside your hospital's private intranet. Integrate with existing PACS or EHR systems using self-hosted container clusters optimized for your infrastructure.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Kubernetes Ready', 'HL7 / FHIR', 'Load Balanced'].map((tag, i) => (
                  <span key={i} className="badge-brand">{tag}</span>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex-1 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="glass-card p-8 rounded-2xl text-center max-w-xs w-full"
            >
              <div className="absolute inset-0 bg-accent-indigo/[0.02] rounded-2xl" />
              <Network className="w-16 h-16 text-accent-indigo mx-auto relative z-10 mb-4" />
              <p className="text-tx-secondary font-medium text-sm relative z-10">Internal Network Mapping</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ API SECTION ════════ */}
      <section id="api" className="section-padding max-w-6xl mx-auto relative z-10 border-t border-edge">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
              Developer <span className="text-gradient">API</span> Hub
            </h2>
            <p className="text-lg text-tx-secondary">
              Hook into the Med-Lens cluster with a single REST endpoint. Build the next-generation triage interface natively.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-2xl overflow-hidden max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 px-5 py-3 bg-surface-overlay/60 border-b border-edge">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-accent-rose/80" />
              <div className="w-3 h-3 rounded-full bg-accent-amber/80" />
              <div className="w-3 h-3 rounded-full bg-accent-emerald/80" />
            </div>
            <p className="text-[11px] font-mono text-tx-muted flex items-center gap-2 ml-2">
              <Code2 className="w-3 h-3" /> integration-test.js
            </p>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="font-mono text-sm leading-relaxed text-brand-light">
{`const payload = new FormData();
payload.append('scan', fileStream);

// Initialize REST sequence to Med-Lens Gateway
const response = await fetch('https://api.medlens.ai/v1/diagnose', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SECURE_TOKEN'
  },
  body: payload
});

const clinicalResult = await response.json();
console.log(clinicalResult.diagnosis); `}
<span className="text-accent-emerald">{`// Output: "Viral Pneumonia Detected"`}</span>
            </pre>
          </div>
        </motion.div>
      </section>

      {/* ════════ WHY MED-LENS ════════ */}
      <section className="section-padding max-w-6xl mx-auto relative z-10 border-t border-edge">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Why <span className="text-gradient">Med-Lens?</span>
          </h2>
          <p className="text-lg text-tx-secondary max-w-2xl mx-auto">
            Current diagnostic platforms are expensive, opaque, and inaccessible. We built something better.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { problem: "Expensive AI tools cost ₹50L+/year", solution: "Free, browser-based — any doctor, anywhere", icon: "💰" },
            { problem: "Black-box AI with no explainability", solution: "Visual ROI mapping + Neural Reasoning transparency", icon: "🧠" },
            { problem: "No instant report generation", solution: "One-click PDF clinical dossier export", icon: "📄" },
            { problem: "Manual report writing takes 30+ mins", solution: "AI generates structured reports in seconds", icon: "⚡" },
            { problem: "No severity classification", solution: "Auto color-coded Normal / Monitor / Critical triage", icon: "🚨" },
            { problem: "No longitudinal tracking", solution: "Full scan history dashboard with analytics", icon: "📊" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              viewport={{ once: true }}
              className="glass-card-hover p-6 rounded-2xl group"
            >
              <span className="text-2xl mb-3 inline-block group-hover:scale-110 transition-transform">{item.icon}</span>
              <p className="text-xs text-accent-rose font-medium mb-2 line-through decoration-accent-rose/30">
                {item.problem}
              </p>
              <p className="text-sm text-tx-primary font-semibold leading-relaxed">
                {item.solution}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-edge bg-surface-raised/30">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-accent-teal flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-tx-primary">Med-Lens AI</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-tx-muted">
            <span className="hover:text-brand transition-colors cursor-default">HIPAA Compliant</span>
            <span className="hover:text-brand transition-colors cursor-default">AES-256</span>
            <span className="hover:text-brand transition-colors cursor-default">SOC2 Certified</span>
          </div>

          <p className="text-xs font-mono text-tx-muted">
            © 2026 Med-Lens Systems
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
