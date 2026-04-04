import React from 'react';
import { motion } from 'framer-motion';
import { Server, Lock, Code2, Network } from 'lucide-react';

const InfoSections = () => {
  return (
    <>
      {/* Security Section */}
      <section id="security" className="section-padding relative z-10 w-full max-w-6xl mx-auto border-t border-edge">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-tx-primary mb-6 tracking-tight">
                Zero-Trust Clinical <span className="text-gradient">Security.</span>
              </h2>
              <p className="text-lg text-tx-secondary mb-6 leading-relaxed">
                Patient data never rests on unencrypted volumes. Our node gateways instantly scramble DICOM streams using AES-256 before inference. Post-analysis buffers are automatically shredded from memory to ensure absolute HIPAA and GDPR compliance.
              </p>
              <div className="flex items-center gap-3 text-sm font-semibold text-accent-teal">
                <Lock className="w-5 h-5" /> SOC2 Certified Node Network
              </div>
            </motion.div>
          </div>

          <div className="flex-1 w-full glass-card p-6 rounded-2xl relative overflow-hidden group border-accent-emerald/20">
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
      </section>

      {/* Enterprise Section */}
      <section id="enterprise" className="section-padding relative z-10 w-full max-w-6xl mx-auto border-t border-edge">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-tx-primary mb-6 tracking-tight">
                Ready for <span className="text-gradient">Enterprise.</span>
              </h2>
              <p className="text-lg text-tx-secondary mb-6 leading-relaxed">
                Deploy Med-Lens inside your hospital's private intranet. Connect cleanly with existing PACS or EHR systems. We offer self-hosted container clusters optimized specifically for internal hospital hardware.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Kubernetes Ready', 'HL7 / FHIR Integration', 'Load Balanced'].map((tag, i) => (
                  <span key={i} className="badge-brand">{tag}</span>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="flex-1 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="w-full max-w-xs glass-card p-8 rounded-2xl relative text-center"
            >
              <div className="absolute inset-0 bg-accent-indigo/[0.02] rounded-2xl" />
              <Network className="w-16 h-16 text-accent-indigo mx-auto relative z-10 mb-4" />
              <p className="text-tx-secondary font-medium text-sm relative z-10">Internal Network Mapping</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="section-padding relative z-10 w-full max-w-6xl mx-auto border-t border-edge mb-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-tx-primary mb-6 tracking-tight">
              Developer <span className="text-gradient">API</span> Hub
            </h2>
            <p className="text-lg text-tx-secondary">
              Hook into the Med-Lens cluster with a single scalable REST POST endpoint. Build the next generation triage interface natively.
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
    </>
  );
};

export default InfoSections;
