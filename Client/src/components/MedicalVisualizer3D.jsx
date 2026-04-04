import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, Line, Preload, OrbitControls } from '@react-three/drei';

function DNAStrand() {
  const groupRef = useRef();

  // Rotate the entire abstract structure slowly to give it life
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.2;
    }
  });

  // Generative art parameters for abstract medical tech representation
  const lineCount = 30;
  const points = [];
  const lines = [];

  for (let i = 0; i < lineCount; i++) {
    const y = (i - lineCount / 2) * 0.4;
    const radius = 2.5;
    const angle1 = i * 0.5;
    const angle2 = Math.PI + i * 0.5;

    const x1 = Math.cos(angle1) * radius;
    const z1 = Math.sin(angle1) * radius;
    
    const x2 = Math.cos(angle2) * radius;
    const z2 = Math.sin(angle2) * radius;

    // Save points for spheres
    points.push([x1, y, z1]);
    points.push([x2, y, z2]);
    
    // Connect them with a line
    lines.push([
      [x1, y, z1],
      [x2, y, z2]
    ]);
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.2}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        {/* Core Connection Lines */}
        {lines.map((line, idx) => (
          <Line key={idx} points={line} color="#2dd4bf" lineWidth={1} transparent opacity={0.3} />
        ))}
        
        {/* Data Nodes (Spheres) */}
        {points.map((pos, idx) => (
          <Sphere key={idx} position={pos} args={[0.08, 16, 16]}>
            <meshStandardMaterial color={idx % 2 === 0 ? "#6366f1" : "#2dd4bf"} emissive={idx % 2 === 0 ? "#6366f1" : "#2dd4bf"} emissiveIntensity={2} />
          </Sphere>
        ))}

        {/* Central glowing core energy line */}
        <Line points={[[0, -7, 0], [0, 7, 0]]} color="#ffffff" lineWidth={4} transparent opacity={0.1} />
      </Float>
    </group>
  );
}

const MedicalVisualizer3D = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply dark:mix-blend-screen opacity-10 dark:opacity-40 hidden md:block transition-all duration-500">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#2dd4bf" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
        <DNAStrand />
        <Preload all />
      </Canvas>
    </div>
  );
};

export default MedicalVisualizer3D;
