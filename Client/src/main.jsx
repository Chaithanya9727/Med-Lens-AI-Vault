import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import ScanPage from './pages/ScanPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import TechnologyPage from './pages/TechnologyPage.jsx'
import SecurityPage from './pages/SecurityPage.jsx'
import EnterprisePage from './pages/EnterprisePage.jsx'
import AuthOverlay, { AuthProvider, useAuth } from './components/AuthOverlay.jsx'
import './index.css'

const RootApp = () => {
  const { user, login } = useAuth();
  
  if (!user) {
    return <AuthOverlay onLogin={login} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/technology" element={<TechnologyPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/enterprise" element={<EnterprisePage />} />
      </Routes>
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  </React.StrictMode>,
)
