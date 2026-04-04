import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, ShieldCheck, Users, Activity, FileText, 
  Terminal, Server, Lock, ArrowLeft, RefreshCw, Eye, Settings, LogOut
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminPage = () => {
  const [data, setData] = useState({ users: [], scans: [], auditLogs: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, logs
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchGlobalData = async () => {
    setIsRefreshing(true);
    try {
      const { data: bundle } = await api.get('/admin/global-data');
      setData(bundle);
    } catch (err) {
      console.error("Global Handshake Failed:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const userStored = localStorage.getItem('medlens_auth_user');
    const user = userStored ? JSON.parse(userStored) : null;
    if (!user?.isAdmin) {
       navigate('/'); // Kick out if not SuperAdmin
    } else {
       fetchGlobalData();
    }
  }, [navigate]);

  const stats = [
    { label: 'Licensed Practitioners', value: data.users.length, icon: Users, color: 'text-brand' },
    { label: 'Global Clinical Studies', value: data.scans.length, icon: FileText, color: 'text-accent-teal' },
    { label: 'Active Security Nodes', value: 4, icon: Server, color: 'text-accent-indigo' },
    { label: 'System Uptime', value: '99.98%', icon: Activity, color: 'text-accent-emerald' }
  ];

  return (
    <div className="bg-[#07090F] min-h-screen text-tx-primary font-sans relative overflow-hidden">
      <div className="absolute inset-0 mesh-bg opacity-40 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Sidebar Command Portal */}
      <div className="fixed inset-y-0 left-0 w-64 bg-surface/50 backdrop-blur-xl border-r border-edge z-50 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
             <motion.div animate={{ top: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute left-0 right-0 h-0.5 bg-brand opacity-50 shadow-[0_0_10px_rgba(88,166,255,1)]" />
             <ShieldAlert className="text-brand w-5 h-5 relative z-10" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">OWNER CONSOLE</h2>
            <p className="text-[9px] text-brand uppercase tracking-widest font-bold">System Root</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: 'overview', label: 'Global Overview', icon: Activity },
            { id: 'users', label: 'Practitioner Registry', icon: Users },
            { id: 'logs', label: 'Audit Terminal', icon: Terminal }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group ${
                activeTab === item.id 
                ? 'bg-brand/10 text-brand border border-brand/20 shadow-[0_0_20px_rgba(88,166,255,0.05)]' 
                : 'text-tx-muted hover:text-tx-primary hover:bg-surface-overlay'
              }`}
            >
              <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-edge space-y-4">
           <Link to="/" className="w-full flex items-center gap-3 px-4 py-2 text-xs text-tx-muted hover:text-tx-primary group">
              <ArrowLeft className="w-3.5 h-3.5" /> Clinical Portal
           </Link>
           <div className="bg-accent-rose/5 border border-accent-rose/10 p-3 rounded-lg flex items-center gap-2">
              <Lock className="w-3 h-3 text-accent-rose" />
              <span className="text-[10px] text-accent-rose font-mono">E2E ENCRYPTION ACTIVE</span>
           </div>
        </div>
      </div>

      <main className="ml-64 p-10 relative z-10">
        <header className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[10px] text-tx-muted font-mono uppercase tracking-[0.3em] mb-2">Vault Administration</p>
            <h1 className="text-4xl font-extrabold tracking-tight">Command <span className="text-gradient">Center</span></h1>
          </div>
          <button 
            onClick={fetchGlobalData}
            className="p-2.5 bg-surface-overlay border border-edge rounded-xl hover:brand-glow transition-all"
          >
            <RefreshCw className={`w-5 h-5 text-tx-muted ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
             <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-brand rounded-full" />
                <Settings className="w-6 h-6 text-brand animate-spin-slow" />
             </div>
             <p className="text-xs text-tx-muted font-mono uppercase tracking-widest">Handshaking with API Server...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                 {/* Stats Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                      <div key={i} className="glass-card-hover p-6 rounded-2xl border border-edge/30 transition-all group">
                         <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-brand/10 transition-colors">
                               <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                         </div>
                         <p className="text-[10px] text-tx-muted uppercase font-bold tracking-wider mb-1">{stat.label}</p>
                         <p className="text-3xl font-extrabold text-tx-primary font-mono tracking-tighter">{stat.value}</p>
                      </div>
                    ))}
                 </div>

                 {/* System Activity Table */}
                 <div className="glass-card rounded-2xl overflow-hidden border border-edge/20 shadow-2xl">
                    <div className="px-6 py-5 border-b border-edge bg-surface-overlay/30 flex justify-between items-center">
                       <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                          <Activity className="w-4 h-4 text-brand" /> GLOBAL STUDY ARCHIVE
                       </h3>
                       <p className="text-[10px] text-tx-muted font-mono">{data.scans.length} verified analysis records synchronized</p>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left text-xs">
                          <thead className="bg-[#161B22]/50 text-tx-muted font-bold uppercase tracking-tight text-[10px]">
                             <tr>
                                <th className="px-6 py-4">Clinical Case ID</th>
                                <th className="px-6 py-4">Identity (Dr.)</th>
                                <th className="px-6 py-4">Diagnosis</th>
                                <th className="px-6 py-4">Engine Score</th>
                                <th className="px-6 py-4">Timestamp</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-edge/10">
                             {data.scans.slice(0, 10).map((scan, i) => (
                               <tr key={i} className="hover:bg-surface-overlay/20 transition-all font-medium">
                                  <td className="px-6 py-4 text-tx-muted font-mono">{scan.id}</td>
                                  <td className="px-6 py-4 text-tx-primary font-bold">{scan.doctorName || 'Dr. Practitioner'}</td>
                                  <td className="px-6 py-4">
                                     <span className="px-2 py-1 bg-brand/10 text-brand rounded-md border border-brand/20">{scan.diagnosis}</span>
                                  </td>
                                  <td className="px-6 py-4 font-mono">{scan.confidence}%</td>
                                  <td className="px-6 py-4 text-tx-muted">{new Date(scan.timestamp).toLocaleString()}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <div className="flex justify-between items-center bg-surface-overlay/30 p-6 rounded-2xl border border-edge/20 backdrop-blur-md">
                    <div>
                       <h2 className="text-xl font-bold">Practitioner Registry</h2>
                       <p className="text-xs text-tx-muted mt-1">Management and status of hospital clinical staff accounts.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                       <div className="text-right">
                          <p className="text-[10px] text-tx-muted uppercase font-bold">Total Staff</p>
                          <p className="text-xl font-bold font-mono">{data.users.length}</p>
                       </div>
                       <Users className="w-8 h-8 text-brand opacity-20" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.users.map((user, i) => (
                      <div key={i} className="glass-card-hover p-6 rounded-3xl border border-edge/20 relative group">
                         <div className="absolute top-6 right-6">
                            <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald shadow-[0_0_10px_rgba(16,185,129,1)]" />
                         </div>
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#161B22] rounded-2xl flex items-center justify-center font-bold text-brand p-3 border border-edge/50">
                               {user.name?.substr(0, 2).toUpperCase() || 'DR'}
                            </div>
                            <div className="min-w-0">
                               <p className="font-extrabold text-tx-primary truncate">{user.name}</p>
                               <p className="text-[10px] text-tx-muted font-mono truncate">{user.role}</p>
                            </div>
                         </div>
                         <div className="space-y-3 pt-4 border-t border-edge/10">
                            <div className="flex justify-between text-[10px] font-mono">
                               <span className="text-tx-muted">Clinical Handle</span>
                               <span className="text-tx-primary font-bold">@{user.username}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono">
                               <span className="text-tx-muted">Authorized On</span>
                               <span className="text-tx-primary font-bold">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-mono">
                               <span className="text-tx-muted">Clearance Level</span>
                               <span className="text-accent-emerald font-bold">PRACTITIONER_I</span>
                            </div>
                         </div>
                         <button className="w-full mt-6 py-2.5 text-[10px] uppercase font-bold tracking-widest text-tx-muted hover:text-tx-primary bg-surface/30 rounded-xl hover:bg-surface-overlay transition-all">
                            Manage Credentials
                         </button>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === 'logs' && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-[75vh] flex flex-col bg-[#0d1117] rounded-3xl border border-edge/30 shadow-2xl overflow-hidden font-mono">
                 <div className="p-4 bg-[#161B22] border-b border-edge/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="flex gap-1.5 px-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-accent-rose/50" />
                          <div className="w-2.5 h-2.5 rounded-full bg-accent-amber/50" />
                          <div className="w-2.5 h-2.5 rounded-full bg-accent-emerald/50" />
                       </div>
                       <span className="text-[10px] font-bold text-tx-muted uppercase tracking-widest">Global Activity Stream v1.0.4 - Live Trace</span>
                    </div>
                    <div className="text-[10px] text-accent-emerald flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                       CONNECTED TO VAULT_ROOT_CLUSTER
                    </div>
                 </div>
                 <div className="flex-1 p-6 overflow-y-auto space-y-2 text-[11px] custom-scrollbar bg-black/40">
                     {data.auditLogs.map((log, i) => (
                      <div key={i} className="flex flex-col gap-1 hover:bg-white/5 p-2 rounded transition-colors group">
                        <div className="flex items-start gap-4">
                           <span className="text-tx-muted shrink-0 opacity-40">{new Date(log.timestamp).toLocaleTimeString()}</span>
                           <span className={`shrink-0 font-bold ${log.type === 'SECURITY' ? 'text-accent-rose' : 'text-accent-teal'}`}>
                              [{log.type}]
                           </span>
                           <span className="text-tx-secondary group-hover:text-tx-primary transition-colors">
                              <span className="text-tx-muted font-bold mr-2">&gt;</span>
                              {log.action}: {log.drName || log.username || log.fileName || 'SYS_INTERN'}
                           </span>
                           <span className="ml-auto text-tx-muted italic opacity-0 group-hover:opacity-100 transition-opacity">PID: {log.id}</span>
                        </div>
                        {(log.ipAddress || log.device) && (
                          <div className="flex items-center gap-4 pl-24 text-[10px] opacity-60">
                            {log.ipAddress && <span className="text-brand flex items-center gap-1"><Terminal className="w-3 h-3"/> IP: {log.ipAddress}</span>}
                            {log.device && <span className="text-tx-muted truncate max-w-sm flex items-center gap-1">User-Agent: {log.device}</span>}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-brand animate-pulse mt-4">
                       &gt; <span className="text-tx-primary">_</span>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
