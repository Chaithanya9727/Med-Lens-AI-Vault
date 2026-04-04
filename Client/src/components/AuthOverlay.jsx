import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Activity, ShieldCheck, ChevronRight, UserPlus, Lock, Key, LogIn, ArrowLeft } from 'lucide-react';
import api from '../services/api';

// ─── Auth Context (Single Source of Truth) ───
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('medlens_auth_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem('medlens_auth_user');
      }
    }
    setIsLoaded(true);
  }, []);

  const login = (doctor) => {
    localStorage.setItem('medlens_auth_user', JSON.stringify(doctor));
    setUser(doctor);
  };

  const logout = () => {
    localStorage.removeItem('medlens_auth_user');
    setUser(null);
  };

  if (!isLoaded) return null; // Prevent flash

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const MASTER_ACCESS_TOKEN = "token";

const AuthOverlay = ({ onLogin }) => {
  const [step, setStep] = useState('gate'); // gate, choice, login, signup
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Form States
  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleGateEntry = () => {
    if (accessToken.trim().toLowerCase() === MASTER_ACCESS_TOKEN.toLowerCase()) {
      setStep('choice');
      setAuthError('');
    } else {
      setAuthError("CRITICAL: UNAUTHORIZED TOKEN.");
      setTimeout(() => setAuthError(''), 3000);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) return;
    setIsAuthenticating(true);
    setAuthError('');
    
    // Check for SuperAdmin (Owner) Identity
    if (username.toUpperCase() === "SUPERADMIN" && password === "superadmin") {
      const adminUser = {
        id: 'system_owner_vault',
        name: 'PLATFORM OWNER',
        role: 'SUPERADMIN (GLOBAL COMMAND)',
        isAdmin: true
      };
      
      onLogin(adminUser);
      return;
    }

    try {
      const { data } = await api.post('/auth/login', { username, password });
      onLogin(data);
    } catch (err) {
      setAuthError(err.response?.data?.error || "Invalid credentials.");
      setIsAuthenticating(false);
      setTimeout(() => setAuthError(''), 4000);
    }
  };

  const handleSignup = async () => {
    if (!name || !username || !password) return;
    setIsAuthenticating(true);
    setAuthError('');
    try {
      const { data } = await api.post('/auth/signup', { name, role, username, password });
      onLogin(data);
    } catch (err) {
      setAuthError(err.response?.data?.error || "Registration failed.");
      setIsAuthenticating(false);
      setTimeout(() => setAuthError(''), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#07090F] mesh-bg overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-transparent to-[#07090F]/80 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-card border border-brand/20 p-8 rounded-2xl relative z-10 shadow-[0_0_80px_rgba(88,166,255,0.05)]"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-brand/20 shadow-[0_0_30px_rgba(88,166,255,0.15)] relative overflow-hidden">
            <motion.div 
              animate={{ top: ['-10%', '110%'] }} 
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute left-0 right-0 h-[2px] bg-brand shadow-[0_0_10px_rgba(88,166,255,1)]"
            />
            {step === 'gate' ? <Key className="w-8 h-8 text-brand relative z-10" /> : <Activity className="w-8 h-8 text-brand relative z-10" />}
          </div>
          <h2 className="text-2xl font-bold text-tx-primary tracking-tight">
            {step === 'gate' ? 'Security Handshake' : 'Med-Lens AI Vault'}
          </h2>
          <p className="text-sm text-tx-muted mt-2 font-medium">
            {step === 'gate' ? 'Verify Hospital Access Token' : 'Enterprise Clinical Suite'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isAuthenticating ? (
             <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 flex flex-col items-center text-center">
                <Fingerprint className="w-12 h-12 text-brand animate-pulse mb-6 opacity-80" />
                <p className="text-sm font-mono text-tx-primary tracking-widest mb-2 uppercase">Syncing Neural Identity</p>
                <div className="w-48 h-1 bg-surface-subtle overflow-hidden rounded-full">
                  <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.5 }} className="h-full bg-brand" />
                </div>
             </motion.div>
          ) : step === 'gate' ? (
            <motion.div key="step-gate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div>
                <label className="flex text-[10px] font-bold text-brand uppercase tracking-[0.2em] mb-3 justify-between items-center">
                  Secure Access Token
                  {authError && <span className="text-accent-rose normal-case font-mono">{authError}</span>}
                </label>
                <div className="relative">
                  <input 
                    type="password"
                    placeholder="Enter Clearance Code..."
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && accessToken && handleGateEntry()}
                    className={`w-full bg-[#161B22]/80 border rounded-xl px-5 py-4 text-sm font-mono tracking-[0.3em] text-brand focus:outline-none transition-all ${authError ? 'border-accent-rose shadow-[0_0_20px_rgba(248,81,73,0.1)]' : 'border-edge focus:border-brand/50'}`}
                  />
                  <Lock className={`absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${accessToken === MASTER_ACCESS_TOKEN ? 'text-accent-emerald' : 'text-tx-muted opacity-30'}`} />
                </div>
              </div>
              <button 
                onClick={handleGateEntry}
                disabled={!accessToken}
                className="w-full py-4 bg-brand text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-light transition-all disabled:opacity-30 disabled:grayscale group shadow-glow-sm"
              >
                Establish Connection
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ) : step === 'choice' ? (
            <motion.div key="step-choice" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
               <button 
                onClick={() => setStep('login')}
                className="w-full p-5 bg-surface-overlay border border-edge rounded-2xl flex items-center gap-4 hover:border-brand/40 group transition-all"
               >
                 <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                    <LogIn className="w-5 h-5" />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-bold text-tx-primary leading-tight">Doctor Sign In</p>
                    <p className="text-[10px] text-tx-muted uppercase font-mono tracking-wider mt-1">Access My Diagnostic Vault</p>
                 </div>
               </button>
               <button 
                onClick={() => setStep('signup')}
                className="w-full p-5 bg-surface-overlay border border-edge rounded-2xl flex items-center gap-4 hover:border-brand/40 group transition-all"
               >
                 <div className="w-10 h-10 bg-accent-teal/10 rounded-xl flex items-center justify-center group-hover:bg-accent-teal group-hover:text-white transition-colors">
                    <UserPlus className="w-5 h-5" />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-bold text-tx-primary leading-tight">Official Registration</p>
                    <p className="text-[10px] text-tx-muted uppercase font-mono tracking-wider mt-1">Onboard New Practitioner</p>
                 </div>
               </button>
               <button onClick={() => setStep('gate')} className="text-xs text-tx-muted hover:text-tx-primary underline underline-offset-4 mx-auto block py-2 mt-4">
                 ← Log out of Hospital Channel
               </button>
            </motion.div>
          ) : (
            <motion.div key="step-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
               <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setStep('choice')} className="p-2 hover:bg-surface-overlay rounded-lg text-tx-muted hover:text-tx-primary transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h3 className="text-sm font-bold text-tx-primary">{step === 'login' ? 'Doctor Verification' : 'Practitioner Registration'}</h3>
               </div>

               {authError && (
                 <div className="bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-[11px] px-3 py-2 rounded-lg font-medium">
                    {authError}
                 </div>
               )}

               <div className="space-y-3">
                 {step === 'signup' && (
                   <>
                    <input 
                      type="text" placeholder="Full Professional Name" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#161B22] border border-edge rounded-xl px-4 py-3 text-sm text-tx-primary focus:border-brand/40 focus:outline-none transition-all"
                    />
                     <div className="relative group">
                        <input 
                         type="text" placeholder="Clinical Role / Department" value={role} onChange={(e) => setRole(e.target.value)}
                         className="w-full bg-[#161B22] border border-edge rounded-xl px-4 py-3 text-sm text-tx-primary focus:border-brand/40 focus:outline-none transition-all relative z-10"
                        />
                        <div className="absolute left-0 right-0 top-[110%] w-full bg-[#1C2128] border border-brand/30 rounded-xl overflow-hidden opacity-0 invisible translate-y-[-10px] group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 z-[100] shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-200 ease-out">
                           <div className="max-h-48 overflow-y-auto py-2 custom-scrollbar">
                              {["Radiology", "Oncology", "Orthopedics", "Cardiology", "Neurology", "Pulmonology", "Internal Medicine", "General Surgery", "Emergency Medicine", "Pathology"].map(d => (
                                <button 
                                  type="button" 
                                  key={d} 
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setRole(d);
                                  }} 
                                  className="w-full text-left px-4 py-2.5 text-xs text-tx-secondary hover:bg-brand/10 hover:text-brand transition-all border-none font-medium"
                                >
                                  {d}
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                   </>
                 )}
                 <input 
                  type="text" placeholder="Clinical Identifier (Username)" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#161B22] border border-edge rounded-xl px-4 py-3 text-sm text-tx-primary focus:border-brand/40 focus:outline-none transition-all"
                 />
                 <input 
                  type="password" placeholder="Passcode" value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (step === 'login' ? handleLogin() : handleSignup())}
                  className="w-full bg-[#161B22] border border-edge rounded-xl px-4 py-3 text-sm text-tx-primary focus:border-brand/40 focus:outline-none transition-all"
                 />
               </div>

               <button 
                onClick={step === 'login' ? handleLogin : handleSignup}
                className="w-full py-3.5 bg-brand text-white rounded-xl font-bold mt-4 hover:shadow-glow-sm transition-all"
               >
                 {step === 'login' ? 'Authenticate Session' : 'Finalize Registration'}
               </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-edge flex items-center justify-center gap-3 text-[10px] text-tx-muted font-mono tracking-wider">
           <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
           E2EE SECURE VAULT — AES-256
        </div>
      </motion.div>
    </div>
  );
};

export default AuthOverlay;
