import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ParticleField() {
  const meshRef = useRef()
  const count = window.innerWidth < 768 ? 60 : 150

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2
      velocities[i * 3] = (Math.random() - 0.5) * 0.002
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002
      velocities[i * 3 + 2] = 0
    }
    return { positions, velocities }
  }, [count])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    return geo
  }, [positions])

  useFrame(() => {
    if (!meshRef.current) return
    const pos = meshRef.current.geometry.attributes.position
    for (let i = 0; i < count; i++) {
      pos.array[i * 3] += velocities[i * 3]
      pos.array[i * 3 + 1] += velocities[i * 3 + 1]
      // Wrap around
      if (pos.array[i * 3] > 8) pos.array[i * 3] = -8
      if (pos.array[i * 3] < -8) pos.array[i * 3] = 8
      if (pos.array[i * 3 + 1] > 5) pos.array[i * 3 + 1] = -5
      if (pos.array[i * 3 + 1] < -5) pos.array[i * 3 + 1] = 5
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        color="#c79a52"
        size={0.04}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  )
}
