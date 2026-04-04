import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Activity, Shield, AlertTriangle, CheckCircle2, Clock,
  ArrowLeft, Eye, TrendingUp, Zap, FileText, Search,
  ChevronRight, Brain, Cpu, X, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const SEVERITY_CONFIG = {
  normal:     { label: 'Normal',     color: 'text-accent-teal',    bg: 'bg-accent-teal/10',    border: 'border-accent-teal/20',    dot: 'bg-accent-teal',    icon: CheckCircle2 },
  monitor:    { label: 'Monitor',    color: 'text-accent-indigo',  bg: 'bg-accent-indigo/10',  border: 'border-accent-indigo/20',  dot: 'bg-accent-indigo',  icon: Eye },
  suspicious: { label: 'Suspicious', color: 'text-accent-amber',   bg: 'bg-accent-amber/10',   border: 'border-accent-amber/20',   dot: 'bg-accent-amber',   icon: AlertTriangle },
  critical:   { label: 'Critical',   color: 'text-accent-rose',    bg: 'bg-accent-rose/10',    border: 'border-accent-rose/20',    dot: 'bg-accent-rose',    icon: AlertTriangle }
};

const DashboardPage = () => {
  const [scans, setScans] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const stored = localStorage.getItem('medlens_auth_user');
      const doctorId = stored ? JSON.parse(stored).id : '';

      const [scansRes, analyticsRes, auditRes] = await Promise.all([
        api.get(`/scans?doctorId=${doctorId}`),
        api.get(`/analytics?doctorId=${doctorId}`),
        api.get(`/audit?doctorId=${doctorId}`)
      ]);
      setScans(scansRes.data);
      setAnalytics(analyticsRes.data);
      setAuditLogs(auditRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredScans = scans.filter(s => {
    const matchesSearch = !searchQuery ||
      s.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fileName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || s.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const formatDate = (ts) => {
    return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const maxDayCount = analytics?.last7Days ? Math.max(...analytics.last7Days.map(d => d.count), 1) : 1;

  return (
    <div className="bg-surface min-h-screen text-tx-primary relative overflow-hidden font-sans">
      <Navbar />

      {/* Subtle background */}
      <div className="absolute inset-0 mesh-bg pointer-events-none" />

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <Link to="/" className="btn-ghost text-xs -ml-3 mb-3 inline-flex">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Clinical <span className="text-gradient">Intelligence</span> Hub
            </h1>
            <p className="text-tx-secondary mt-2 text-base">Real-time analytics and scan history.</p>
          </div>
          <Link to="/scan" className="btn-primary">
            <Zap className="w-4 h-4" /> New Scan
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-2 border-brand/30 border-t-brand rounded-full mx-auto mb-4"
              />
              <p className="text-tx-muted font-mono text-xs tracking-wider">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Scans', value: analytics?.totalScans || 0, icon: BarChart3, color: 'text-brand' },
                { label: 'Avg Confidence', value: `${analytics?.avgConfidence || 0}%`, icon: TrendingUp, color: 'text-accent-indigo' },
                { label: 'Avg Latency', value: analytics?.avgLatency || '0ms', icon: Clock, color: 'text-accent-amber' },
                { label: 'Abnormality Rate', value: `${analytics?.abnormalityRate || 0}%`, icon: AlertTriangle, color: 'text-accent-rose' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card-hover p-5 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <stat.icon className={`w-4 h-4 ${stat.color} opacity-70`} />
                    <span className="text-[10px] font-mono text-tx-muted">{stat.label}</span>
                  </div>
                  <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              {/* Severity Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-2xl"
              >
                <h3 className="text-xs font-semibold text-tx-muted mb-5 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Severity Breakdown
                </h3>
                {analytics?.totalScans > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => {
                      const count = analytics?.severityBreakdown?.[key] || 0;
                      const pct = analytics.totalScans > 0 ? (count / analytics.totalScans * 100).toFixed(0) : 0;
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
                            <span className="text-tx-muted font-mono">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                              className={`h-full rounded-full ${cfg.dot}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-tx-muted text-sm text-center py-6 font-mono">No data yet</p>
                )}
              </motion.div>

              {/* Category Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 rounded-2xl"
              >
                <h3 className="text-xs font-semibold text-tx-muted mb-5 flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5" /> Diagnosis Categories
                </h3>
                {analytics && Object.keys(analytics.categoryBreakdown || {}).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(analytics.categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count], i) => {
                      const pct = (count / analytics.totalScans * 100).toFixed(0);
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-indigo shrink-0" />
                          <span className="text-xs text-tx-secondary font-medium flex-1 truncate">{cat}</span>
                          <span className="text-xs font-mono text-tx-muted">{count}</span>
                          <div className="w-14 h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
                              className="h-full bg-accent-indigo rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-tx-muted text-sm text-center py-6 font-mono">No data yet</p>
                )}
              </motion.div>

              {/* 7-Day Activity */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6 rounded-2xl"
              >
                <h3 className="text-xs font-semibold text-tx-muted mb-5 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" /> 7-Day Activity
                </h3>
                {analytics?.last7Days ? (
                  <div className="flex items-end gap-2 h-28">
                    {analytics.last7Days.map((day, i) => {
                      const heightPct = maxDayCount > 0 ? (day.count / maxDayCount * 100) : 0;
                      const dayLabel = new Date(day.date).toLocaleDateString('en', { weekday: 'short' });
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[9px] font-mono text-tx-muted">{day.count}</span>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(heightPct, 4)}%` }}
                            transition={{ duration: 0.6, delay: 0.4 + i * 0.08 }}
                            className={`w-full rounded-t ${day.count > 0 ? 'bg-brand shadow-glow-sm' : 'bg-surface-subtle'}`}
                          />
                          <span className="text-[8px] font-mono text-tx-muted">{dayLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-tx-muted text-sm text-center py-6 font-mono">No data yet</p>
                )}
              </motion.div>
            </div>


            {/* Scan History */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              {/* Table Header */}
              <div className="px-6 py-5 border-b border-edge flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h3 className="text-sm font-semibold text-tx-primary flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand" /> Scan History
                  <span className="text-xs font-mono text-tx-muted ml-1">({filteredScans.length})</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex gap-1">
                    {['all', 'normal', 'monitor', 'suspicious', 'critical'].map(f => (
                      <button
                        key={f}
                        onClick={() => setFilterSeverity(f)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                          filterSeverity === f
                            ? 'bg-brand/15 text-brand border border-brand/25'
                            : 'text-tx-muted hover:text-tx-secondary border border-transparent'
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tx-muted" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-2 bg-surface-overlay border border-edge rounded-lg text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none focus:border-brand/40 w-40 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Table Body */}
              {filteredScans.length === 0 ? (
                <div className="py-16 text-center">
                  <Cpu className="w-10 h-10 text-tx-muted mx-auto mb-3" />
                  <p className="text-tx-muted text-sm">
                    {scans.length === 0 ? 'No scans yet. Upload your first scan to begin.' : 'No scans match your filters.'}
                  </p>
                  {scans.length === 0 && (
                    <Link to="/scan" className="inline-block mt-3 text-brand text-xs font-medium hover:underline">
                      Go to Scanner →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-edge">
                  {filteredScans.map((scan, i) => {
                    const sev = SEVERITY_CONFIG[scan.severity] || SEVERITY_CONFIG.normal;
                    const SevIcon = sev.icon;
                    return (
                      <motion.div
                        key={scan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        onClick={() => setSelectedScan(scan)}
                        className="px-6 py-4 flex items-center gap-4 hover:bg-surface-overlay/50 cursor-pointer transition-colors group"
                      >
                        <div className={`p-2 rounded-lg ${sev.bg} border ${sev.border} shrink-0 group-hover:scale-110 transition-transform`}>
                          <SevIcon className={`w-4 h-4 ${sev.color}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-tx-primary truncate">{scan.diagnosis}</p>
                          <p className="text-[11px] text-tx-muted font-mono truncate">{scan.doctorName || 'Assigned Clinician'} • {scan.fileName}</p>
                        </div>

                        <div className="hidden md:block text-right shrink-0 px-3">
                          <p className="text-sm font-bold text-tx-primary">{scan.confidence}%</p>
                          <p className="text-[9px] text-tx-muted">Confidence</p>
                        </div>

                        <div className="hidden lg:block text-right shrink-0 px-3">
                          <p className="text-xs font-mono text-brand">{scan.telemetry?.latency || '—'}</p>
                          <p className="text-[9px] text-tx-muted">Latency</p>
                        </div>

                        <div className="hidden md:block text-right shrink-0 px-3 border-l border-edge ml-2">
                          <p className="text-xs text-tx-muted font-mono">{formatDate(scan.timestamp)}</p>
                        </div>

                        <ChevronRight className="w-4 h-4 text-tx-muted group-hover:text-brand transition-colors shrink-0" />
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </main>

      {/* Scan Detail Modal */}
      <AnimatePresence>
        {selectedScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface/90 backdrop-blur-xl"
            onClick={() => setSelectedScan(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl bg-surface-raised rounded-2xl border border-edge p-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
              {(() => {
                const sev = SEVERITY_CONFIG[selectedScan.severity] || SEVERITY_CONFIG.normal;
                const SevIcon = sev.icon;
                return (
                  <>
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-extrabold text-tx-primary mb-2">{selectedScan.diagnosis}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`badge ${sev.bg} ${sev.color} border ${sev.border}`}>
                            <SevIcon className="w-3 h-3" /> {sev.label}
                          </span>
                          <span className="text-xs text-tx-muted font-mono bg-surface-overlay px-2 py-1 border border-edge rounded">By: {selectedScan.doctorName || 'Assigned Clinician'}</span>
                        </div>
                      </div>
                      <button onClick={() => setSelectedScan(null)} className="btn-ghost p-2 rounded-lg">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { label: 'Confidence', value: `${selectedScan.confidence}%`, color: 'text-tx-primary' },
                        { label: 'Latency', value: selectedScan.telemetry?.latency || '—', color: 'text-brand' },
                        { label: 'Grade', value: selectedScan.multiPass?.clinicalGrade || 'B', color: selectedScan.multiPass?.clinicalGrade === 'A' ? 'text-accent-emerald' : 'text-accent-amber' }
                      ].map((stat, i) => (
                        <div key={i} className="bg-surface-overlay rounded-xl p-4 text-center border border-edge">
                          <p className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                          <p className="text-[9px] text-tx-muted mt-1">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Evidence */}
                    <div className="bg-accent-teal/5 rounded-xl border border-accent-teal/15 p-4 mb-3">
                      <p className="text-[10px] text-accent-teal font-semibold mb-1">Neural Evidence</p>
                      <p className="text-sm text-tx-secondary leading-relaxed">"{selectedScan.evidence}"</p>
                    </div>

                    {/* Prognosis */}
                    <div className="bg-accent-indigo/5 rounded-xl border border-accent-indigo/15 p-4 mb-3">
                      <p className="text-[10px] text-accent-indigo font-semibold mb-1">Health Forecast</p>
                      <p className="text-sm text-tx-secondary leading-relaxed">{selectedScan.prognosis}</p>
                    </div>

                    {/* Findings */}
                    {selectedScan.findings?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[10px] text-tx-muted font-semibold mb-2">Structural Findings</p>
                        <div className="space-y-1.5">
                          {selectedScan.findings.map((f, i) => (
                            <div key={i} className="flex items-start gap-3 bg-surface-overlay p-3 rounded-xl border border-edge">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent-teal mt-1.5 shrink-0" />
                              <span className="text-xs text-tx-secondary">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendation */}
                    <div className="bg-accent-rose/5 rounded-xl border border-accent-rose/15 p-4">
                      <p className="text-[10px] text-accent-rose font-semibold mb-1">Recommendation</p>
                      <p className="text-sm text-tx-primary font-medium leading-relaxed">{selectedScan.recommendation}</p>
                    </div>

                    <p className="text-[10px] text-tx-muted font-mono text-center mt-5">
                      ID: {selectedScan.id} • {formatDate(selectedScan.timestamp)}
                    </p>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
