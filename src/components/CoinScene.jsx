import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, MeshDistortMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

export default function CoinScene() {
  const coinRef = useRef()
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

    // Smooth cursor follow
    targetRef.current.x += (mouseRef.current.x - targetRef.current.x) * 0.05
    targetRef.current.y += (mouseRef.current.y - targetRef.current.y) * 0.05

    // Auto rotation + cursor tilt
    coinRef.current.rotation.y = t * 0.4 + targetRef.current.x * 0.3
    coinRef.current.rotation.x = targetRef.current.y * 0.2

    // Floating bob
    coinRef.current.position.y = Math.sin(t * 0.7) * 0.15
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} color="#f4ece0" />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#c79a52" castShadow />
      <directionalLight position={[-5, -3, 2]} intensity={0.5} color="#d4824a" />
      <pointLight position={[0, 0, 3]} intensity={0.8} color="#e8b86d" />
      <spotLight
        position={[0, 8, 2]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#f4ece0"
        castShadow
      />

      {/* Coin */}
      <Float speed={1} rotationIntensity={0} floatIntensity={0}>
        <group ref={coinRef} scale={isMobile ? 1.2 : 1.8}>
          {/* Main coin body */}
          <mesh castShadow>
            <cylinderGeometry args={[1, 1, 0.12, 64]} />
            <meshStandardMaterial
              color="#c79a52"
              metalness={0.95}
              roughness={0.1}
              envMapIntensity={2}
            />
          </mesh>

          {/* Coin face front — embossed ring */}
          <mesh position={[0, 0.065, 0]}>
            <ringGeometry args={[0.7, 0.95, 64]} />
            <meshStandardMaterial
              color="#e8b86d"
              metalness={1}
              roughness={0.05}
            />
          </mesh>

          {/* Coin face back — embossed ring */}
          <mesh position={[0, -0.065, 0]} rotation={[Math.PI, 0, 0]}>
            <ringGeometry args={[0.7, 0.95, 64]} />
            <meshStandardMaterial
              color="#b8862e"
              metalness={1}
              roughness={0.1}
            />
          </mesh>

          {/* Center circle front */}
          <mesh position={[0, 0.066, 0]}>
            <circleGeometry args={[0.6, 64]} />
            <meshStandardMaterial
              color="#c79a52"
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>

          {/* Glow halo */}
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.05, 1.4, 64]} />
            <meshStandardMaterial
              color="#c79a52"
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </Float>

      {/* Soft ground reflection */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial
          color="#c79a52"
          transparent
          opacity={0.04}
          roughness={1}
        />
      </mesh>
    </>
  )
}
