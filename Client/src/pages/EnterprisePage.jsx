import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Building, Users, Network, X, Send, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const EnterprisePage = () => {
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', organization: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    try {
      await api.post('/admin/leads', formData);
      setSubmitStatus('success');
      setTimeout(() => {
        setShowSalesModal(false);
        setSubmitStatus('idle');
        setFormData({ name: '', email: '', organization: '', message: '' });
      }, 3000);
    } catch (err) {
      setSubmitStatus('error');
    }
  };

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
          <span className="text-brand font-semibold tracking-widest uppercase text-xs mb-4 block">Organization Scale</span>
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none">
            Enterprise<br />
            <span className="text-gradient">Diagnostics.</span>
          </h1>
          <p className="text-xl text-tx-secondary max-w-2xl mx-auto font-medium">
            Integrates with existing HIS, PACS, and EMR ecosystems to deliver high-performance AI diagnostics across health systems.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24 text-left">
          {[
            {
              icon: <Building className="w-8 h-8 text-accent-teal" />,
              title: "Hospital & Network Wide",
              desc: "Deploy across radiology, oncology, and pathology departments with shared clinical intelligence.",
              points: ["PACS Integration", "DICOM Standard Support", "Departmental Isolation"]
            },
            {
              icon: <Users className="w-8 h-8 text-accent-indigo" />,
              title: "Medical Collaboration",
              desc: "Share diagnostic dossiers securely for peer-review and multi-disciplinary tumor board reviews.",
              points: ["Real-time Peer-Review", "Case Dossier Sharing", "Audit Trail Logging"]
            }
          ].map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card-hover p-10 rounded-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-surface-subtle rounded-bl-[100%] transition-all group-hover:bg-surface-overlay" />
              <div className="mb-8 p-4 bg-surface-overlay w-fit rounded-2xl border border-edge group-hover:scale-110 transition-transform">
                {section.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight text-tx-primary">{section.title}</h3>
              <p className="text-tx-secondary mb-8 text-base leading-relaxed">{section.desc}</p>
              <ul className="space-y-3">
                {section.points.map((p, k) => (
                  <li key={k} className="flex items-center gap-3 text-sm font-medium text-tx-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-teal shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="glass-card p-12 rounded-2xl text-center">
          <h2 className="text-3xl font-extrabold mb-6 tracking-tight">Deploy Enterprise Intelligence.</h2>
          <p className="text-tx-secondary text-lg mb-8 max-w-xl mx-auto">
            Integrate Med-Lens AI into your health system infrastructure today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/scan" className="btn-primary text-base px-10 py-4">
              Launch Clinical Node
            </Link>
            <button onClick={() => setShowSalesModal(true)} className="btn-secondary text-base px-10 py-4">
              Sales Inquiries
            </button>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showSalesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-raised w-full max-w-lg rounded-2xl border border-edge p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSalesModal(false)}
                className="absolute top-4 right-4 p-2 text-tx-muted hover:text-tx-primary transition-colors hover:bg-surface-overlay rounded-lg"
              >
                <X size={20} />
              </button>
              
              {submitStatus === 'success' ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-16 h-16 text-accent-emerald mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-tx-primary mb-2">Request Received</h3>
                  <p className="text-tx-secondary">Our enterprise integration team will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold text-tx-primary mb-2 tracking-tight">Enterprise Inquiry</h3>
                    <p className="text-tx-muted text-sm mb-6">Connect with our deployment engineers to discuss integration, compliance, and custom pricing.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-tx-primary text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-surface border border-edge rounded-lg px-4 py-3 text-tx-primary focus:outline-none focus:border-brand transition-colors text-sm" placeholder="Dr. Sarah Chen" />
                    </div>
                    <div>
                      <label className="block text-tx-primary text-xs font-semibold uppercase tracking-wider mb-2">Email</label>
                      <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-surface border border-edge rounded-lg px-4 py-3 text-tx-primary focus:outline-none focus:border-brand transition-colors text-sm" placeholder="schen@hospital.org" />
                    </div>
                    <div>
                      <label className="block text-tx-primary text-xs font-semibold uppercase tracking-wider mb-2">Organization</label>
                      <input required type="text" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} className="w-full bg-surface border border-edge rounded-lg px-4 py-3 text-tx-primary focus:outline-none focus:border-brand transition-colors text-sm" placeholder="Memorial Health System" />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitStatus === 'loading'}
                    className="w-full btn-primary py-4 mt-6 flex justify-center items-center gap-2"
                  >
                    {submitStatus === 'loading' ? 'Submitting...' : 'Submit Inquiry'}
                    {submitStatus !== 'loading' && <Send className="w-4 h-4" />}
                  </button>
                  {submitStatus === 'error' && <p className="text-accent-rose text-xs text-center mt-3">Connection failed. Please try again.</p>}
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnterprisePage;
