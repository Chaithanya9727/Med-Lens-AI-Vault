import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap, BrainCircuit } from 'lucide-react';

const features = [
  {
    icon: <BrainCircuit className="w-6 h-6 text-accent-indigo" />,
    title: "Neural Network Diagnostics",
    description: "Multi-layered convolutional networks trained on over 5M+ clinical datasets for pinpoint anomaly detection."
  },
  {
    icon: <Zap className="w-6 h-6 text-accent-teal" />,
    title: "Sub-second Inference",
    description: "Optimized tensor pipelines deliver complete diagnostic breakdowns in under 800ms, accelerating patient care."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-accent-emerald" />,
    title: "HIPAA Compliant",
    description: "End-to-end RSA-4096 bit encryption ensures patient PHI never touches unencrypted storage zones."
  },
  {
    icon: <Activity className="w-6 h-6 text-brand" />,
    title: "Continuous Learning",
    description: "Our models adapt via federated learning streams, constantly sharpening accuracy on rare pathologies."
  }
];

const FeatureSection = () => {
  return (
    <section id="technology" className="section-padding relative z-10 w-full max-w-6xl mx-auto">
      <div className="mb-14 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-brand font-semibold tracking-widest uppercase text-sm mb-4"
        >
          Architecture
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-extrabold text-tx-primary tracking-tight"
        >
          Intelligence that <span className="text-gradient">scales.</span>
          <br />
          <span className="text-tx-muted">Security that doesn't compromise.</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            viewport={{ once: true }}
            className="glass-card-hover p-6 rounded-2xl group"
          >
            <div className="bg-surface-overlay border border-edge w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-base font-bold text-tx-primary mb-2">{feature.title}</h3>
            <p className="text-sm text-tx-secondary leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
