import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { gsap } from 'gsap'
import CoinScene from './CoinScene'
import ParticleField from './ParticleField'

export default function Hero() {
  const headlineRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const badgeRef = useRef(null)

  useEffect(() => {
    const words = headlineRef.current.querySelectorAll('.word')
    const tl = gsap.timeline({ delay: 0.8 })

    tl.fromTo(badgeRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
    tl.fromTo(words,
      { opacity: 0, y: 60, rotateX: -30 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
      '-=0.2'
    )
    tl.fromTo(subRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      '-=0.3'
    )
    tl.fromTo(ctaRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      '-=0.3'
    )
  }, [])

  const headline = 'Your first buyers are already out there — for free.'
  const words = headline.split(' ')

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ParticleField />
          <CoinScene />
        </Canvas>
      </div>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, transparent 20%, #1a130d 80%)',
        }}
      />

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
        <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 opacity-0">
          <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
          <span className="text-xs text-cream-dim font-sans tracking-wider uppercase">AI-powered community finder</span>
        </div>

        <h1
          ref={headlineRef}
          className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold leading-tight mb-6 overflow-hidden"
          style={{ perspective: '800px' }}
        >
          {words.map((word, i) => (
            <span key={i} className="word inline-block mr-[0.25em] opacity-0">
              {word === 'free.' ? (
                <span className="text-gradient-gold italic">{word}</span>
              ) : word === 'buyers' ? (
                <span className="text-gold">{word}</span>
              ) : (
                word
              )}
            </span>
          ))}
        </h1>

        <p
          ref={subRef}
          className="text-cream-dim text-lg md:text-xl max-w-xl mx-auto mb-10 opacity-0 font-sans font-light leading-relaxed"
        >
          FreeReach uses AI to find real, active communities where you can post about your product today — no ads, no budget, no followers needed.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center opacity-0">
          <a
            href="#tool"
            className="px-8 py-4 rounded-full bg-terracotta text-cream font-medium text-base hover:bg-terracotta/90 hover:-translate-y-1 hover:shadow-xl hover:shadow-terracotta/30 active:scale-95 transition-all duration-200"
          >
            Discover your free spots →
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-full glass text-cream font-medium text-base hover:bg-cream/10 transition-all duration-200"
          >
            See how it works
          </a>
        </div>

        <p className="mt-6 text-xs text-cream-dim/50 font-sans">
          3 free searches · No credit card · No signup required
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60">
        <span className="text-xs text-cream-dim tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-cream-dim to-transparent animate-pulse" />
      </div>
    </section>
  )
}
