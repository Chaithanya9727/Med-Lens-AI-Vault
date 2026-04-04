import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, Scan, BarChart3, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthOverlay';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-surface/80 backdrop-blur-xl border-b border-edge shadow-lg shadow-black/20' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-accent-teal flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-all duration-300">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-tx-primary tracking-tight">
            Med-Lens <span className="text-brand">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {user && (
            <div className="flex items-center gap-3 mr-4 pl-4 pr-3 py-1.5 bg-surface-overlay border border-edge rounded-full text-xs">
              <span className={`w-2 h-2 rounded-full ${user.isAdmin ? 'bg-accent-rose shadow-[0_0_8px_rgba(248,81,73,1)]' : 'bg-accent-emerald animate-pulse'}`} />
              <span className="font-semibold text-tx-primary">{user.name}</span>
              <div className="w-[1px] h-3 bg-edge mx-1" />
              <button 
                onClick={logout}
                className="text-tx-muted hover:text-accent-rose transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          )}

          {user?.isAdmin && (
            <Link
              to="/admin"
              className={`btn-ghost text-[11px] uppercase font-bold tracking-widest border border-brand/20 hover:border-brand/40 transition-all mr-2 ${isActive('/admin') ? 'text-brand bg-brand/10 border-brand/50 shadow-glow-sm' : 'text-tx-muted'}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Owner Console
            </Link>
          )}

          <Link
            to="/dashboard"
            className={`btn-ghost text-[13px] ${isActive('/dashboard') ? 'text-brand bg-brand/10' : ''}`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/scan"
            className="btn-primary text-[13px] ml-2"
          >
            <Scan className="w-4 h-4" />
            Start Scan
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-tx-secondary hover:text-tx-primary transition-colors p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-raised/95 backdrop-blur-xl border-b border-edge overflow-hidden"
          >
            <div className="p-4 space-y-2">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 rounded-xl text-sm font-medium text-tx-secondary hover:text-tx-primary hover:bg-surface-overlay transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-brand text-tx-inverse"
              >
                Start Scan
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
