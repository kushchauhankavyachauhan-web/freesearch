import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function Orbs({ count = 10 }) {
  const meshRefs = useRef([]);
  const orbs = useMemo(() => Array.from({ length: count }, (_, i) => ({
    position: [(Math.random()-0.5)*14, (Math.random()-0.5)*8, (Math.random()-0.5)*6-3],
    scale: 0.3 + Math.random() * 1.2,
    speed: 0.0003 + Math.random() * 0.0006,
    phase: Math.random() * Math.PI * 2,
    color: i%3===0 ? '#4F46E5' : i%3===1 ? '#818CF8' : '#312E81',
  })), [count]);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const orb = orbs[i];
      mesh.position.y = orb.position[1] + Math.sin(t * orb.speed * 1000 + orb.phase) * 1.2;
      mesh.position.x = orb.position[0] + Math.cos(t * orb.speed * 700 + orb.phase) * 0.8;
      mesh.rotation.x = t * 0.1;
    });
  });
  return <>{orbs.map((orb, i) => (
    <mesh key={i} ref={el => meshRefs.current[i] = el} position={orb.position}>
      <sphereGeometry args={[orb.scale, 16, 16]} />
      <meshStandardMaterial color={orb.color} transparent opacity={0.15} roughness={0.1} metalness={0.8} />
    </mesh>
  ))}</>;
}

function Particles({ count = 150 }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i*3] = (Math.random()-0.5)*20;
      arr[i*3+1] = (Math.random()-0.5)*12;
      arr[i*3+2] = (Math.random()-0.5)*10;
    }
    return arr;
  }, [count]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.015;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#818CF8" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function OrbBackground({ className = '' }) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ zIndex: 0 }}>
      <Canvas camera={{ position: [0,0,8], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5,5,5]} intensity={1} color="#4F46E5" />
        <pointLight position={[-5,-5,-5]} intensity={0.5} color="#818CF8" />
        <Orbs />
        <Particles />
      </Canvas>
    </div>
  );
}
