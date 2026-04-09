import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Shield, Cpu, Zap, Activity, ChevronRight,
  Lock, Code2, Server, Network, Upload, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import Navbar from '../components/Navbar';

// ─── ANIMATION VARIANTS ──────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};
const stagger = { animate: { transition: { staggerChildren: 0.11 } } };

// ─── 3D DNA HELIX CANVAS ─────────────────────────────────────────────────────
const DNACanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    const w = canvas.clientWidth || canvas.offsetWidth || 600;
    const h = canvas.clientHeight || canvas.offsetHeight || 700;
    renderer.setSize(w, h, false);

    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 8);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const l1 = new THREE.PointLight(0x00f5c4, 5, 25);
    l1.position.set(4, 4, 4);
    scene.add(l1);
    const l2 = new THREE.PointLight(0x7b6ef6, 3, 20);
    l2.position.set(-4, -2, 2);
    scene.add(l2);
    const l3 = new THREE.PointLight(0xff6b9d, 2, 15);
    l3.position.set(0, 5, -3);
    scene.add(l3);

    const root = new THREE.Group();
    scene.add(root);

    // ── Central glowing icosahedron core ──
    const coreGeo = new THREE.IcosahedronGeometry(1.1, 2);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x00f5c4, emissive: 0x00f5c4, emissiveIntensity: 0.15,
      transparent: true, opacity: 0.12, side: THREE.DoubleSide,
    });
    root.add(new THREE.Mesh(coreGeo, coreMat));

    const wireMat = new THREE.MeshBasicMaterial({ color: 0x00f5c4, wireframe: true, transparent: true, opacity: 0.2 });
    root.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 2), wireMat));

    // ── DNA Double Helix ──
    const helixGroup = new THREE.Group();
    root.add(helixGroup);

    const N = 80;
    const pts1 = [], pts2 = [];
    const mStrand1 = new THREE.MeshPhongMaterial({ color: 0x00f5c4, emissive: 0x00f5c4, emissiveIntensity: 0.4, shininess: 100 });
    const mStrand2 = new THREE.MeshPhongMaterial({ color: 0x7b6ef6, emissive: 0x7b6ef6, emissiveIntensity: 0.4, shininess: 100 });
    const mRung    = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 });
    const mNode1   = new THREE.MeshPhongMaterial({ color: 0x00f5c4, emissive: 0x00f5c4, emissiveIntensity: 0.7 });
    const mNode2   = new THREE.MeshPhongMaterial({ color: 0x7b6ef6, emissive: 0x7b6ef6, emissiveIntensity: 0.7 });

    for (let i = 0; i < N; i++) {
      const t = i / N;
      const angle = t * Math.PI * 5;
      const y = (t - 0.5) * 6;
      const R = 1.7;
      const x1 = Math.cos(angle) * R, z1 = Math.sin(angle) * R;
      const x2 = Math.cos(angle + Math.PI) * R, z2 = Math.sin(angle + Math.PI) * R;
      pts1.push(new THREE.Vector3(x1, y, z1));
      pts2.push(new THREE.Vector3(x2, y, z2));

      if (i % 4 === 0) {
        const sph1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), mNode1);
        sph1.position.set(x1, y, z1);
        helixGroup.add(sph1);
        const sph2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), mNode2);
        sph2.position.set(x2, y, z2);
        helixGroup.add(sph2);
      }
      if (i % 8 === 0) {
        const rungLen = Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);
        const rungGeo = new THREE.CylinderGeometry(0.022, 0.022, rungLen, 6);
        const rungMesh = new THREE.Mesh(rungGeo, mRung);
        rungMesh.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
        rungMesh.rotation.z = Math.PI / 2;
        rungMesh.lookAt(x2, y, z2);
        rungMesh.rotateX(Math.PI / 2);
        helixGroup.add(rungMesh);
      }
    }

    const makeTube = (pts, mat) => {
      const curve = new THREE.CatmullRomCurve3(pts);
      return new THREE.Mesh(new THREE.TubeGeometry(curve, 200, 0.045, 8, false), mat);
    };
    helixGroup.add(makeTube(pts1, mStrand1));
    helixGroup.add(makeTube(pts2, mStrand2));

    // ── Orbital rings ──
    const addRing = (radius, tube, color, rx, ry, rz) => {
      const m = new THREE.MeshPhongMaterial({ color, emissive: color, emissiveIntensity: 0.4, transparent: true, opacity: 0.45 });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 8, 140), m);
      mesh.rotation.set(rx, ry, rz);
      root.add(mesh);
    };
    addRing(2.9, 0.022, 0x7b6ef6, Math.PI / 3, 0, 0);
    addRing(2.5, 0.016, 0xff6b9d, Math.PI / 2.2, 0, Math.PI / 4);
    addRing(3.3, 0.012, 0x00f5c4, Math.PI / 5, Math.PI / 6, 0);

    // ── Floating particles ──
    const partCount = 250;
    const pPos = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 3.5 + Math.random() * 2.5;
      pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x00f5c4, size: 0.06, transparent: true, opacity: 0.55 });
    root.add(new THREE.Points(pGeo, pMat));

    // ── Animate ──
    let frame;
    const clock = new THREE.Clock();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      root.rotation.y = t * 0.18;
      helixGroup.rotation.y = t * 0.25;
      l1.position.set(Math.sin(t * 0.7) * 5, 4, Math.cos(t * 0.7) * 5);
      l2.position.set(-4, Math.sin(t * 0.5) * 3, Math.cos(t * 0.5) * 4);
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w2 = canvas.clientWidth;
      const h2 = canvas.clientHeight;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2, false);
    };
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(frame); renderer.dispose(); window.removeEventListener('resize', onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};

// ─── SCAN DEMO WIDGET ─────────────────────────────────────────────────────────
const DEMO_RESULTS = [
  { type: 'Chest X-Ray', finding: 'Bilateral Infiltrates', severity: 'critical', conf: 96, roi: '4 regions', rec: 'Immediate pulmonology consult' },
  { type: 'Brain MRI', finding: 'No Acute Abnormality', severity: 'normal', conf: 99, roi: '0 regions', rec: 'Routine follow-up in 12 months' },
  { type: 'Abdominal CT', finding: 'Mild Hepatomegaly', severity: 'monitor', conf: 88, roi: '1 region', rec: 'Gastroenterology referral advised' },
];

const ScanDemo = () => {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState([]);

  const runDemo = async () => {
    if (running) return;
    setRunning(true);
    setResult(null);
    setProgress(0);
    const logs = [
      '>> BOOTING NEURAL_V5...',
      '>> ESTABLISHING CLINICAL_LINK...',
      '>> INGESTING DICOM_STREAM...',
      '>> SEGMENTING PATHOLOGY...',
      '>> RUNNING TENSOR_ARRAY...',
      '>> IDENTIFYING ROI_NODES...',
      '>> ENCRYPTING AES_256...',
      '>> FINALIZING REPORT...',
    ];
    setLog([]);
    for (let i = 0; i < logs.length; i++) {
      await new Promise(r => setTimeout(r, 250));
      setLog(prev => [...prev.slice(-3), logs[i]]);
      setProgress(Math.round(((i + 1) / logs.length) * 100));
    }
    await new Promise(r => setTimeout(r, 400));
    setResult(DEMO_RESULTS[Math.floor(Math.random() * DEMO_RESULTS.length)]);
    setRunning(false);
  };

  const sevColor = (s) => ({ critical: '#ff4d4d', monitor: '#ffcc00', normal: '#00f5c4' }[s] || '#fff');
  const sevLabel = (s) => ({ critical: 'CRITICAL_NODE', monitor: 'MONITOR_NODE', normal: 'STABLE_NODE' }[s] || s);

  return (
    <div className="hero-split" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32, marginTop: 60, perspective: '1000px' }}>
      {/* ── DIGITAL DROP ZONE ── */}
      <motion.div
        whileHover={{ scale: 1.01, rotateY: -2 }}
        onClick={runDemo}
        className="ml-glass"
        style={{
          borderRadius: 24,
          padding: '60px 40px',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 80px rgba(0,0,0,0.4)',
        }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #00f5c4 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div 
            animate={{ y: [0, -10, 0], filter: ['hue-rotate(0deg)', 'hue-rotate(45deg)', 'hue-rotate(0deg)'] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ fontSize: 64, marginBottom: 20 }}
          >
            🩻
          </motion.div>
          <h3 className="ml-grad" style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Ingest Clinical Data</h3>
          <p style={{ fontSize: 13, color: '#8892aa', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>Multi-Modality Support Node</p>
          
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            {['DICOM', 'X-RAY', 'MRI', 'CT'].map(f => (
              <span key={f} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: '#00f5c4', border: '1px solid rgba(0,245,196,0.2)' }}>{f}</span>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,245,196,0.4)' }}
            whileTap={{ scale: 0.95 }}
            onClick={e => { e.stopPropagation(); runDemo(); }}
            style={{
              marginTop: 40, padding: '16px 32px', background: 'linear-gradient(135deg, #00f5c4, #7b6ef6)', color: '#000',
              border: 'none', borderRadius: 16, fontWeight: 800, fontSize: 14, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '1.5px', display: 'inline-flex', alignItems: 'center', gap: 10,
            }}
          >
            <Zap size={18} fill="#000" /> Start Neural Pass
          </motion.button>
        </div>
      </motion.div>

      {/* ── HOLOGRAPHIC OUTPUT ── */}
      <motion.div 
        className="ml-glass" 
        style={{ 
          borderRadius: 24, 
          padding: 32, 
          position: 'relative', 
          boxShadow: '0 20px 80px rgba(0,0,0,0.4)',
          border: '1px solid rgba(123,110,246,0.2)'
        }}
        initial={{ rotateY: 2 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 16, fontWeight: 800, letterSpacing: '2px', color: '#7b6ef6', textTransform: 'uppercase' }}>Analytic Output</h3>
          <div className="badge-teal" style={{ fontSize: 9 }}>v5.0-ENTERPRISE</div>
        </div>

        {!running && !result && (
          <div style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#334155' }}>
            <Activity size={40} className="animate-pulse mb-4 opacity-20" />
            <p style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", textTransform: 'uppercase', letterSpacing: '2px' }}>Awaiting clinical Handshake...</p>
          </div>
        )}

        {/* Matrix Logs */}
        {running && (
          <div style={{ marginTop: 20 }}>
            <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', marginBottom: 24 }}>
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full bg-brand"
              />
            </div>
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: 16, borderRadius: 12, border: '1px solid rgba(0,245,196,0.1)' }}>
              {log.map((l, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -5 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  key={i} 
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, marginBottom: 8, color: i === log.length - 1 ? '#00f5c4' : '#475569' }}
                >
                  <span style={{ opacity: 0.5 }}>{'>'}</span> {l}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Result UI */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-surface-overlay border border-edge rounded-xl p-5 mb-6">
                <p className="text-[10px] text-tx-muted uppercase tracking-[0.2em] mb-1 font-bold">Clinical Finding</p>
                <p className="text-xl font-black text-tx-primary italic">{result.finding}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Modality', val: result.type, color: '#7b6ef6' },
                  { label: 'Classification', val: sevLabel(result.severity), color: sevColor(result.severity) },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p style={{ fontSize: 9, color: '#8892aa', textTransform: 'uppercase', marginBottom: 4, fontWeight: 800 }}>{label}</p>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700, color }}>{val}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 8 }}>
                  <span className="text-tx-muted uppercase font-bold tracking-wider">Engine Confidence</span>
                  <span style={{ color: '#00f5c4', fontWeight: 900 }}>{result.conf}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${result.conf}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg,#00f5c4,#7b6ef6)', borderRadius: 3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// ─── GALLERY (auto-scroll) ────────────────────────────────────────────────────
const GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80",
    alt: "MRI brain scan",
  },
  {
    src: "https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=800&q=80",
    alt: "Medical imaging lab",
  },
  {
    src: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80",
    alt: "Chest X-Ray",
  },
  {
    src: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80",
    alt: "Medical technology",
  },
  {
    src: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    alt: "Ultrasound scan",
  },
];

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────
const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 0.18], [0, -40]);

  // Inline global styles — add to your global CSS instead if preferred
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      body { background: #030408; color: #f0f4ff; font-family: 'Inter', sans-serif; overflow-x: hidden; }
      .ml-grad { background: linear-gradient(135deg,#00f5c4 0%,#7b6ef6 55%,#ff6b9d 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .ml-section { padding: 120px 40px; max-width: 1120px; margin: 0 auto; }
      .ml-section-tag { font-family:'JetBrains Mono',monospace; font-size:11px; color:#00f5c4; text-transform:uppercase; letter-spacing:4px; display:block; margin-bottom:18px; font-weight: 800; }
      .ml-h2 { font-family:'Inter',sans-serif; font-size:clamp(32px,5vw,64px); font-weight:900; letter-spacing:-2px; line-height:0.95; margin-bottom:18px; }
      .ml-sub { font-size:17px; color:#8892aa; font-weight:400; max-width:540px; line-height:1.75; }
      .ml-glass { 
        background: rgba(13, 17, 28, 0.7); 
        border: 1px solid rgba(255, 255, 255, 0.08); 
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
      }
      .ml-tech-card { 
        padding:32px 28px; 
        border-radius:24px; 
        background:rgba(255,255,255,0.02); 
        border:1px solid rgba(255,255,255,0.06); 
        transition:all .4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .ml-tech-card:hover { 
        background:rgba(255,255,255,0.05); 
        transform:translateY(-8px) scale(1.02); 
        border-color:rgba(0,245,196,0.3);
        box-shadow: 0 30px 60px rgba(0,0,0,0.5), 0 0 20px rgba(0,245,196,0.1);
      }
      .ml-why-card { 
        padding:32px; 
        border-radius:22px; 
        border:1px solid rgba(255,255,255,0.05); 
        background:rgba(255,255,255,0.015); 
        transition:all .3s; 
      }
      .ml-why-card:hover { 
        background:rgba(255,255,255,0.04); 
        border-color:rgba(123,110,246,0.4); 
        transform: scale(1.03);
      }
      .gallery-track { display:flex; gap:24px; animation:galleryScroll 40s linear infinite; width:max-content; }
      .gallery-track:hover { animation-play-state:paused; }
      @keyframes galleryScroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      .ticker-inner { display:flex; animation:ticker 25s linear infinite; width:max-content; }
      @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      
      /* Hexagon Grid Background Overlay */
      .hexagon-grid {
        position: absolute;
        inset: 0;
        background-color: transparent;
        background-image: 
          radial-gradient(#00f5c4 0.5px, transparent 0.5px), 
          radial-gradient(#00f5c4 0.5px, #030408 0.5px);
        background-size: 40px 40px;
        background-position: 0 0, 20px 20px;
        opacity: 0.05;
        mask-image: linear-gradient(to bottom, black, transparent);
      }

      @media(max-width:768px){ 
        .ml-section{padding:80px 24px;} 
        .hero-split{grid-template-columns: 1fr !important;} 
        .three-col{grid-template-columns:1fr !important;} 
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={{ background: '#030408', minHeight: '100vh', color: '#f0f4ff', fontFamily: "'Inter',sans-serif" }}>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div className="hexagon-grid" />

        {/* BG mesh */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(123,110,246,0.08) 0%, transparent 70%), radial-gradient(ellipse 40% 40% at 30% 60%, rgba(0,245,196,0.06) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)', backgroundSize: '60px 60px', opacity: 0.5 }} />

        {/* 3D Canvas (right half) */}
        <div style={{ position: 'absolute', right: 0, top: 0, width: '55%', height: '100%', zIndex: 1 }}>
          <DNACanvas />
          {/* fade to left edge */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #080b14 0%, transparent 35%)', pointerEvents: 'none' }} />
        </div>

        {/* Hero text */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY, position: 'relative', zIndex: 2, maxWidth: 600, padding: '0 40px 0 clamp(20px,5vw,80px)', paddingTop: 80 }}
          variants={stagger} initial="initial" animate="animate"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,245,196,0.08)', border: '1px solid rgba(0,245,196,0.22)', borderRadius: 100, padding: '6px 14px', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#00f5c4' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00f5c4', display: 'inline-block', animation: 'ml-pulse 2s infinite' }} />
              Diagnostic Engine v4.2 — Online
            </div>
            <style>{`@keyframes ml-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.5)}}`}</style>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            style={{ fontFamily: "'Inter',sans-serif", fontSize: 'clamp(44px,6vw,80px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: 22 }}
          >
            Clinical Vision,{' '}
            <span className="ml-grad">Redefined.</span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{ fontSize: 17, color: '#8892aa', maxWidth: 470, marginBottom: 36, lineHeight: 1.72, fontWeight: 300 }}>
            Med-Lens AI Vault leverages enterprise-grade neural networks to analyze medical imaging instantly and securely — achieving 99.8% diagnostic precision across 5M+ annotated datasets.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <motion.div whileHover={{ y: -2, boxShadow: '0 14px 36px rgba(0,245,196,0.22)' }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/scan"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#00f5c4', color: '#000', padding: '14px 28px', borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none', fontFamily: "'Inter',sans-serif" }}
              >
                <Zap size={16} /> Launch Diagnostic Node
              </Link>
            </motion.div>
            <motion.a
              href="#technology"
              whileHover={{ background: 'rgba(255,255,255,0.09)' }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', color: '#f0f4ff', padding: '14px 28px', borderRadius: 14, fontWeight: 500, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}
            >
              Explore Architecture <ChevronRight size={15} style={{ opacity: 0.5 }} />
            </motion.a>
          </motion.div>

          {/* Mini stats */}
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 32, marginTop: 52 }}>
            {[{ v: '99.8%', l: 'Precision', c: '#00f5c4' }, { v: '<800ms', l: 'Latency', c: '#7b6ef6' }, { v: '5M+', l: 'Datasets', c: '#ff6b9d' }].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 26, fontWeight: 800, color: s.c, letterSpacing: '-1px' }}>{s.v}</div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#8892aa', textTransform: 'uppercase', letterSpacing: '2px', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── TICKER ──────────────────────────────────────────────── */}
      <div style={{ overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '14px 0', background: '#0d1120' }}>
        <div className="ticker-inner">
          {[...Array(2)].map((_, ri) =>
            ['99.8% Accuracy', '5M+ Datasets', 'HIPAA Compliant', 'GDPR Ready', 'AES-256', 'SOC2 Certified', 'RSA-4096', 'Federated Learning'].map((t, i) => (
              <span key={`${ri}-${i}`} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#8892aa', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap', padding: '0 36px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── VALUE PROPS ──────────────────────────────────────────── */}
      <div className="ml-section">
        <div className="three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { icon: <Shield size={22} color="#00f5c4" />, bg: 'rgba(0,245,196,0.09)', title: 'Military-Grade Security', text: 'Zero-knowledge encryption with quantum-safe protocols. Patient data never rests on unencrypted volumes.' },
            { icon: <Cpu size={22} color="#7b6ef6" />, bg: 'rgba(123,110,246,0.09)', title: 'Neural Optimization', text: 'Pixel-perfect analysis via Gemini 2.5 Flash architecture with spatial awareness and multi-label detection.' },
            { icon: <Zap size={22} color="#ff6b9d" />, bg: 'rgba(255,107,157,0.09)', title: 'Sub-Second Inference', text: 'Instant diagnostic synthesis for urgent clinical paths, delivering results in under 800ms end-to-end.' },
          ].map((p, i) => (
            <motion.div
              key={i} className="ml-tech-card"
              initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }} viewport={{ once: true }}
            >
              <div style={{ width: 46, height: 46, borderRadius: 12, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>{p.icon}</div>
              <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: '#8892aa', lineHeight: 1.7 }}>{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── SCAN DEMO ────────────────────────────────────────────── */}
      <section style={{ background: '#0d1120', padding: '100px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <motion.span className="ml-section-tag" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>Diagnostic Interface</motion.span>
          <motion.h2 className="ml-h2" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Upload. Analyze. <span className="ml-grad">Diagnose.</span>
          </motion.h2>
          <ScanDemo />
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────────── */}
      <section style={{ padding: '100px 0', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ padding: '0 40px', maxWidth: 1120, margin: '0 auto 48px' }}>
          <span className="ml-section-tag">Clinical Imaging</span>
          <h2 className="ml-h2">Precision across every <span className="ml-grad">modality.</span></h2>
        </div>
        <div className="gallery-track">
          {[...GALLERY_IMAGES, ...GALLERY_IMAGES].map((img, i) => (
            <img
              key={i} src={img.src} alt={img.alt}
              style={{ width: 280, height: 175, objectFit: 'cover', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, filter: 'brightness(.85) saturate(.85)', transition: 'filter .3s' }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1) saturate(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(.85) saturate(.85)'; }}
              loading="lazy"
            />
          ))}
        </div>
      </section>

      {/* ── TECHNOLOGY ───────────────────────────────────────────── */}
      <section id="technology" style={{ padding: '100px 40px', background: '#0d1120', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="ml-section-tag" style={{ justifyContent: 'center', display: 'block' }}>Architecture</span>
            <h2 className="ml-h2" style={{ textAlign: 'center' }}>Intelligence that <span className="ml-grad">scales.</span></h2>
            <p className="ml-sub" style={{ margin: '0 auto', textAlign: 'center' }}>Security that doesn't compromise.</p>
          </div>
          <div className="three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              { icon: <Cpu size={22} color="#7b6ef6" />, bg: 'rgba(123,110,246,0.1)', title: 'Neural Diagnostics', desc: 'Multi-layered CNNs trained on 5M+ clinical datasets for pinpoint anomaly detection.' },
              { icon: <Zap size={22} color="#00f5c4" />, bg: 'rgba(0,245,196,0.1)', title: 'Sub-second Inference', desc: 'Optimized tensor pipelines deliver diagnostic breakdowns in under 800ms.' },
              { icon: <Shield size={22} color="#4ade80" />, bg: 'rgba(74,222,128,0.1)', title: 'HIPAA Compliant', desc: 'End-to-end RSA-4096 encryption ensures patient PHI is always protected.' },
              { icon: <Activity size={22} color="#ff6b9d" />, bg: 'rgba(255,107,157,0.1)', title: 'Continuous Learning', desc: 'Federated learning streams constantly sharpen accuracy on rare pathologies.' },
            ].map((f, i) => (
              <motion.div
                key={i} className="ml-tech-card"
                initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, border: '1px solid rgba(255,255,255,0.06)' }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#8892aa', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY ─────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'linear-gradient(135deg,rgba(0,245,196,0.03),rgba(123,110,246,0.03))' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 80, flexWrap: 'wrap' }}>
          <motion.div style={{ flex: 1, minWidth: 280 }} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="ml-section-tag">Zero-Trust Security</span>
            <h2 className="ml-h2">Zero-Trust Clinical <span className="ml-grad">Security.</span></h2>
            <p className="ml-sub">Patient data never rests on unencrypted volumes. Node gateways instantly encrypt DICOM streams using AES-256. Post-analysis buffers are shredded from memory.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 24, fontSize: 14, fontWeight: 600, color: '#00f5c4' }}>
              <Lock size={16} /> SOC2 Certified Node Network
            </div>
          </motion.div>
          <motion.div style={{ flex: 1, minWidth: 280 }} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(0,245,196,0.18)', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ background: 'rgba(0,0,0,0.55)', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: '1px solid rgba(0,245,196,0.1)' }}>
                {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                <span style={{ marginLeft: 8, fontSize: 11, color: '#8892aa' }}>med-lens — secure-channel</span>
              </div>
              <div style={{ padding: '24px 20px', lineHeight: 2.1 }}>
                <div><span style={{ color: '#8892aa' }}>&gt; </span><span style={{ color: '#7b6ef6' }}>initializing</span> encrypted connection...</div>
                <div><span style={{ color: '#8892aa' }}>&gt; </span>RSA-4096 handshake: <span style={{ color: '#00f5c4' }}>✓ OK</span></div>
                <div><span style={{ color: '#8892aa' }}>&gt; </span>AES-256 buffer: <span style={{ color: '#00f5c4' }}>✓ ACTIVE</span></div>
                <div><span style={{ color: '#8892aa' }}>&gt; </span>buffering patient stream: <span style={{ color: '#00f5c4' }}>✓ SECURE</span></div>
                <div><span style={{ color: '#8892aa' }}>&gt; </span>HIPAA audit log: <span style={{ color: '#00f5c4' }}>✓ ENABLED</span></div>
                <div style={{ marginTop: 12, color: '#f0f4ff', fontWeight: 600, borderLeft: '2px solid #00f5c4', paddingLeft: 12 }}>⬤ SYSTEM FULLY SECURED</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY MED-LENS ──────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="ml-section-tag" style={{ display: 'block', textAlign: 'center' }}>Value Proposition</span>
            <h2 className="ml-h2" style={{ textAlign: 'center' }}>Why <span className="ml-grad">Med-Lens?</span></h2>
            <p className="ml-sub" style={{ margin: '0 auto', textAlign: 'center' }}>Current diagnostic platforms are expensive, opaque, and inaccessible. We built something better.</p>
          </div>
          <div className="three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[
              { e: '💰', p: 'Expensive AI tools cost ₹50L+/year', s: 'Free, browser-based — any doctor, anywhere' },
              { e: '🧠', p: 'Black-box AI with no explainability', s: 'Visual ROI mapping + Neural Reasoning transparency' },
              { e: '📄', p: 'No instant report generation', s: 'One-click PDF clinical dossier export' },
              { e: '⚡', p: 'Manual report writing takes 30+ mins', s: 'AI generates structured reports in seconds' },
              { e: '🚨', p: 'No severity classification', s: 'Auto color-coded Normal / Monitor / Critical triage' },
              { e: '📊', p: 'No longitudinal tracking', s: 'Full scan history dashboard with analytics' },
            ].map((c, i) => (
              <motion.div
                key={i} className="ml-why-card"
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }} viewport={{ once: true }}
              >
                <div style={{ fontSize: 28, marginBottom: 14 }}>{c.e}</div>
                <div style={{ fontSize: 12, color: '#8892aa', textDecoration: 'line-through', marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>{c.p}</div>
                <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6 }}>{c.s}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENTERPRISE ────────────────────────────────────────────── */}
      <section style={{ padding: '100px 40px', background: '#0d1120', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 80, flexWrap: 'wrap-reverse' }}>
          <motion.div
            style={{ flex: 1, minWidth: 280, display: 'flex', justifyContent: 'center' }}
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          >
            <div className="ml-glass" style={{ padding: 48, borderRadius: 24, textAlign: 'center', maxWidth: 280, width: '100%', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(123,110,246,0.08), transparent 70%)' }} />
              <Network size={72} color="#7b6ef6" style={{ position: 'relative', zIndex: 1, margin: '0 auto 16px' }} />
              <p style={{ color: '#8892aa', fontSize: 13, fontWeight: 500, position: 'relative', zIndex: 1 }}>Internal Network Mapping</p>
            </div>
          </motion.div>
          <motion.div style={{ flex: 1, minWidth: 280 }} initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="ml-section-tag">Enterprise</span>
            <h2 className="ml-h2">Ready for <span className="ml-grad">Enterprise.</span></h2>
            <p className="ml-sub">Deploy Med-Lens inside your hospital's private intranet. Integrate with existing PACS or EHR systems using self-hosted container clusters optimized for your infrastructure.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24 }}>
              {['Kubernetes Ready', 'HL7 / FHIR', 'Load Balanced'].map(tag => (
                <span key={tag} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '5px 13px', borderRadius: 8, background: 'rgba(0,245,196,0.08)', color: '#00f5c4', border: '1px solid rgba(0,245,196,0.2)' }}>{tag}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── API SECTION ───────────────────────────────────────────── */}
      <section id="api" style={{ padding: '100px 40px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <span className="ml-section-tag" style={{ display: 'block', textAlign: 'center' }}>Developer</span>
          <h2 className="ml-h2" style={{ textAlign: 'center' }}>Developer <span className="ml-grad">API</span> Hub</h2>
          <p className="ml-sub" style={{ margin: '0 auto 40px', textAlign: 'center' }}>Hook into the Med-Lens cluster with a single REST endpoint. Build next-generation triage interfaces natively.</p>
          <motion.div className="ml-glass" style={{ borderRadius: 20, overflow: 'hidden', textAlign: 'left' }} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <span style={{ marginLeft: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#8892aa', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Code2 size={11} /> integration-test.js
              </span>
            </div>
            <pre style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, lineHeight: 1.9, padding: '28px 28px', overflowX: 'auto', color: '#00f5c4' }}>
{`const payload = new FormData();
payload.append('scan', fileStream);

const response = await fetch('https://api.medlens.ai/v1/diagnose', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_SECURE_TOKEN' },
  body: payload
});

const result = await response.json();
`}<span style={{ color: '#4ade80' }}>{`// → { diagnosis: "Viral Pneumonia Detected", confidence: 0.972 }`}</span>
            </pre>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer style={{ padding: '40px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, background: '#0d1120' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: "'Inter',sans-serif", fontWeight: 800, fontSize: 17 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#00f5c4,#7b6ef6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={15} color="#000" />
          </div>
          Med-Lens AI
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['HIPAA Compliant', 'AES-256', 'SOC2', 'GDPR Ready'].map(b => (
            <span key={b} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, padding: '5px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)', color: '#8892aa' }}>{b}</span>
          ))}
        </div>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#8892aa' }}>© 2026 Med-Lens Systems</p>
      </footer>
    </div>
  );
};

export default LandingPage;