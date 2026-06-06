import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ParticleField() {
  const meshRef = useRef()
  const isMobile = window.innerWidth < 768
  const count = isMobile ? 80 : 200
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 14
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 9
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  const { positions, originalPositions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const originalPositions = new Float32Array(count * 3)
    const phases = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 18
      const y = (Math.random() - 0.5) * 11
      const z = (Math.random() - 0.5) * 8 - 3
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      originalPositions[i * 3] = x
      originalPositions[i * 3 + 1] = y
      originalPositions[i * 3 + 2] = z
      phases[i] = Math.random() * Math.PI * 2
    }
    return { positions, originalPositions, phases }
  }, [count])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    return geo
  }, [positions])

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    const pos = meshRef.current.geometry.attributes.position
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    for (let i = 0; i < count; i++) {
      const ox = originalPositions[i * 3]
      const oy = originalPositions[i * 3 + 1]
      const phase = phases[i]

      // Gentle float
      const nx = ox + Math.sin(t * 0.3 + phase) * 0.3
      const ny = oy + Math.cos(t * 0.25 + phase) * 0.2

      // Mouse repulsion
      const dx = nx - mx * 0.15
      const dy = ny - my * 0.15
      const dist = Math.sqrt(dx * dx + dy * dy)
      const repel = Math.max(0, 1.5 - dist) * 0.4

      pos.array[i * 3] = nx + (dx / dist) * repel * (dist < 1.5 ? 1 : 0)
      pos.array[i * 3 + 1] = ny + (dy / (dist || 1)) * repel * (dist < 1.5 ? 1 : 0)
    }
    pos.needsUpdate = true
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color="#c79a52"
        size={isMobile ? 0.06 : 0.05}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  )
}
