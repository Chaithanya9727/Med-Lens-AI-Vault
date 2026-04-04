import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';

const SecurityPage = () => {
  return (
    <div className="bg-surface min-h-screen text-tx-primary relative overflow-hidden font-sans">
      <Navbar />
      <div className="absolute inset-0 mesh-bg pointer-events-none" />

      <main className="max-w-6xl mx-auto px-6 pt-36 pb-28 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <div className="bg-accent-teal/10 p-4 rounded-2xl w-fit mx-auto mb-8 border border-accent-teal/20">
            <ShieldCheck className="w-10 h-10 text-accent-teal" />
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none">
            Fortified<br />
            <span className="text-gradient">Clinical Privacy.</span>
          </h1>
          <p className="text-xl text-tx-secondary max-w-2xl mx-auto font-medium">
            Standard-setting security protocols that exceed HIPAA, GDPR, and ISO-27001 requirements for healthcare data.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-24 text-left">
          {[
            {
              icon: <Lock className="w-6 h-6 text-tx-primary" />,
              title: "End-to-End RSA-4096",
              text: "Every byte of clinical data is encrypted at the source and decrypted only within transient execution memory."
            },
            {
              icon: <EyeOff className="w-6 h-6 text-tx-primary" />,
              title: "Zero-Knowledge Architecture",
              text: "Our engineers cannot see your data. Keys are managed by the hospital's local policy controllers."
            },
            {
              icon: <Server className="w-6 h-6 text-tx-primary" />,
              title: "Isolated Execution",
              text: "AI inference occurs in isolated sandboxes that are wiped clean after every diagnostic session."
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card-hover p-8 rounded-2xl group"
            >
              <div className="mb-5 bg-surface-overlay p-3 rounded-xl w-fit group-hover:scale-110 transition-transform border border-edge">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-tx-primary">{card.title}</h3>
              <p className="text-sm text-tx-secondary leading-relaxed">{card.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Compliance Banner */}
        <div className="glass-card p-10 rounded-2xl flex flex-wrap justify-center items-center gap-12">
          {[
            { label: "HIPAA", status: "COMPLIANT" },
            { label: "GDPR", status: "VERIFIED" },
            { label: "ISO 27001", status: "CERTIFIED" },
            { label: "SOC 2 Type II", status: "AUDITED" }
          ].map((badge, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <p className="text-xs text-tx-muted font-medium tracking-wider mb-2">{badge.label}</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-teal animate-pulse" />
                <span className="text-sm font-semibold text-accent-teal">{badge.status}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default SecurityPage;
