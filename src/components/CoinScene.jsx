import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function GoldRing({ radius, tube, speed, rotX, rotY }) {
  const ref = useRef()
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * speed + rotX
    ref.current.rotation.y = state.clock.elapsedTime * speed * 0.7 + rotY
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, tube, 16, 80]} />
      <meshStandardMaterial
        color="#c79a52"
        metalness={1}
        roughness={0.05}
        emissive="#c79a52"
        emissiveIntensity={0.6}
        toneMapped={false}
      />
    </mesh>
  )
}

function OrbitingDot({ radius, speed, offset, color }) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset
    ref.current.position.x = Math.cos(t) * radius
    ref.current.position.y = Math.sin(t * 0.6) * radius * 0.4
    ref.current.position.z = Math.sin(t) * radius
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        toneMapped={false}
      />
    </mesh>
  )
}

function GlowSphere({ scale: s }) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.material.opacity = 0.06 + Math.sin(t * 1.2) * 0.03
    ref.current.scale.setScalar(s + Math.sin(t * 0.7) * 0.08)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#c79a52" transparent opacity={0.06} side={THREE.BackSide} />
    </mesh>
  )
}

export default function CoinScene() {
  const coinRef = useRef()
  const haloRef = useRef()
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    const handleMouse = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  useFrame((state) => {
    if (!coinRef.current) return
    const t = state.clock.elapsedTime

    targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * 0.04
    targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * 0.04

    coinRef.current.rotation.y = t * 0.35 + targetRef.current.x * 0.4
    coinRef.current.rotation.x = targetRef.current.y * 0.25 + Math.sin(t * 0.5) * 0.05
    coinRef.current.position.y = Math.sin(t * 0.6) * 0.18

    if (haloRef.current) {
      haloRef.current.material.opacity = 0.05 + Math.sin(t * 1.5) * 0.03
      haloRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.06)
    }
  })

  const scale = isMobile ? 0.85 : 1.35

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[4, 6, 4]} intensity={3} color="#fff8e7" castShadow />
      <directionalLight position={[-6, -2, 3]} intensity={0.8} color="#d4824a" />
      <pointLight position={[0, 0, 4]} intensity={2.5} color="#e8b86d" />
      <pointLight position={[3, 3, -2]} intensity={1.2} color="#c79a52" />
      <spotLight position={[0, 10, 0]} angle={0.2} penumbra={1} intensity={5} color="#fffde7" />

      {/* Soft background glow sphere */}
      <GlowSphere scale={3.2 * scale} />

      {/* Orbiting glowing dots */}
      <OrbitingDot radius={2.2} speed={0.5} offset={0} color="#c79a52" />
      <OrbitingDot radius={2.7} speed={0.35} offset={2.1} color="#d4824a" />
      <OrbitingDot radius={2.0} speed={0.65} offset={4.2} color="#e8b86d" />
      <OrbitingDot radius={3.1} speed={0.25} offset={1.0} color="#c79a52" />

      {/* Spinning rings */}
      <GoldRing radius={1.75} tube={0.013} speed={0.4} rotX={0.3} rotY={0} />
      <GoldRing radius={2.15} tube={0.009} speed={-0.3} rotX={1.1} rotY={0.5} />
      <GoldRing radius={2.6} tube={0.006} speed={0.2} rotX={0.7} rotY={1.2} />

      {/* Coin */}
      <group ref={coinRef} scale={scale}>
        {/* Body */}
        <mesh castShadow>
          <cylinderGeometry args={[1, 1, 0.15, 128]} />
          <meshStandardMaterial
            color="#c79a52"
            metalness={1}
            roughness={0.06}
            emissive="#7a5510"
            emissiveIntensity={0.4}
          />
        </mesh>

        {/* Front outer ring */}
        <mesh position={[0, 0.076, 0]}>
          <ringGeometry args={[0.73, 0.97, 128]} />
          <meshStandardMaterial color="#e8c870" metalness={1} roughness={0.03} emissive="#c79a52" emissiveIntensity={0.8} toneMapped={false} />
        </mesh>

        {/* Front inner disc */}
        <mesh position={[0, 0.077, 0]}>
          <circleGeometry args={[0.69, 128]} />
          <meshStandardMaterial color="#b8862a" metalness={0.95} roughness={0.1} emissive="#7a5510" emissiveIntensity={0.3} />
        </mesh>

        {/* Back outer ring */}
        <mesh position={[0, -0.076, 0]} rotation={[Math.PI, 0, 0]}>
          <ringGeometry args={[0.73, 0.97, 128]} />
          <meshStandardMaterial color="#a07830" metalness={1} roughness={0.1} />
        </mesh>

        {/* Back inner disc */}
        <mesh position={[0, -0.077, 0]} rotation={[Math.PI, 0, 0]}>
          <circleGeometry args={[0.69, 128]} />
          <meshStandardMaterial color="#956820" metalness={0.95} roughness={0.14} />
        </mesh>

        {/* Edge notches */}
        {[...Array(12)].map((_, i) => (
          <mesh key={i} rotation={[0, (i / 12) * Math.PI * 2, 0]}>
            <boxGeometry args={[0.018, 0.155, 2.0]} />
            <meshStandardMaterial color="#e8c870" metalness={1} roughness={0.02} emissive="#c79a52" emissiveIntensity={0.5} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Halo ring */}
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5 * scale, 3.5 * scale, 64]} />
        <meshBasicMaterial color="#c79a52" transparent opacity={0.05} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}
