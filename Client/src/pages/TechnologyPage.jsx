import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { BrainCircuit, Cpu } from 'lucide-react';

const TechnologyPage = () => {
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
          <span className="text-brand font-semibold tracking-widest uppercase text-xs mb-4 block">Neural Architecture</span>
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none">
            Next-Gen<br />
            <span className="text-gradient">Clinical AI.</span>
          </h1>
          <p className="text-xl text-tx-secondary max-w-2xl mx-auto font-medium">
            Our proprietary stack combines Gemini 2.5 Flash with custom clinical adapters for sub-800ms diagnostic synthesis.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 text-left">
          {[
            {
              icon: <BrainCircuit className="w-8 h-8 text-accent-teal" />,
              title: "Federated Learning Nodes",
              desc: "Our models learn from decentralized clinical datasets without ever moving raw patient data.",
              points: ["Privacy-preserving training", "Cross-institutional intelligence", "Real-time model updates"]
            },
            {
              icon: <Cpu className="w-8 h-8 text-accent-indigo" />,
              title: "Custom Tensor Cores",
              desc: "Optimized inference engines designed specifically for high-resolution DICOM and volumetric imaging.",
              points: ["Volumetric analysis", "Pixel-level precision", "Low latency inference"]
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card-hover p-10 rounded-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-surface-subtle rounded-bl-[100%] transition-all group-hover:bg-surface-overlay" />
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight text-tx-primary">{feature.title}</h3>
              <p className="text-tx-secondary mb-6 text-base leading-relaxed">{feature.desc}</p>
              <ul className="space-y-3">
                {feature.points.map((p, k) => (
                  <li key={k} className="flex items-center gap-3 text-sm text-tx-secondary font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-teal shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Performance Grid */}
        <div className="glass-card p-12 rounded-2xl relative overflow-hidden text-center">
          <div className="absolute inset-0 grid-pattern" />
          <h2 className="text-3xl font-extrabold mb-10 relative z-10 tracking-tight">Engineered for Performance.</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            {[
              { label: "Latency", value: "<800ms" },
              { label: "Precision", value: "99.8%" },
              { label: "Throughput", value: "10k/min" },
              { label: "Security", value: "AES-256" }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-tx-muted text-xs font-medium tracking-wider mb-2">{stat.label}</p>
                <p className="text-2xl font-extrabold text-brand">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TechnologyPage;
