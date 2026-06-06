import { useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import CoinScene from './CoinScene'
import ParticleField from './ParticleField'

export default function Hero() {
  const headlineRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const badgeRef = useRef(null)
  const canvasWrapRef = useRef(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    // Word-by-word entrance after loader
    const words = headlineRef.current.querySelectorAll('.word')
    const tl = gsap.timeline({ delay: 0.2 })

    tl.fromTo(badgeRef.current,
      { opacity: 0, y: 20, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }
    )
    tl.fromTo(words,
      { opacity: 0, y: 80, rotateX: -40, filter: 'blur(8px)' },
      { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', duration: 1, stagger: 0.07, ease: 'power4.out' },
      '-=0.4'
    )
    tl.fromTo(subRef.current,
      { opacity: 0, y: 30, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    )
    tl.fromTo(ctaRef.current.children,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' },
      '-=0.4'
    )

    // Scroll-driven 3D canvas scale + opacity
    gsap.to(canvasWrapRef.current, {
      scale: 1.15,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })

    // Parallax on text
    gsap.to(headlineRef.current, {
      y: -80,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, [])

  const headline = 'Your first buyers are already out there — for free.'
  const words = headline.split(' ')

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* 3D Canvas */}
      <div ref={canvasWrapRef} className="absolute inset-0 z-0" style={{ willChange: 'transform, opacity' }}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true, toneMapping: 4, toneMappingExposure: 1.2 }}
          dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        >
          <ParticleField />
          <CoinScene />
        </Canvas>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 10%, rgba(26,19,13,0.7) 70%, #1a130d 100%)' }}
      />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #1a130d)' }}
      />

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-5xl mx-auto">
        <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-10 opacity-0">
          <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
          <span className="text-xs text-cream-dim font-sans tracking-widest uppercase">AI-powered community finder</span>
        </div>

        <h1
          ref={headlineRef}
          className="font-serif text-5xl md:text-7xl lg:text-[88px] font-semibold leading-[1.05] mb-8"
          style={{ perspective: '1000px' }}
        >
          {words.map((word, i) => (
            <span key={i} className="word inline-block mr-[0.22em] opacity-0" style={{ willChange: 'transform, opacity' }}>
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

        <p ref={subRef} className="text-cream-dim text-lg md:text-xl max-w-xl mx-auto mb-12 opacity-0 font-sans font-light leading-relaxed">
          FreeReach uses AI to find real, active communities where you can post about your product today — no ads, no budget, no followers needed.
        </p>

        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#tool"
            className="group relative px-8 py-4 rounded-full bg-terracotta text-cream font-medium text-base overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-terracotta/40 active:scale-95 transition-all duration-300"
          >
            <span className="relative z-10">Discover your free spots →</span>
            <div className="absolute inset-0 bg-gradient-to-r from-terracotta via-orange-400 to-terracotta bg-[length:200%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-shimmer" />
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-full glass text-cream font-medium text-base hover:bg-cream/10 hover:-translate-y-0.5 transition-all duration-300"
          >
            See how it works
          </a>
        </div>

        <p className="mt-8 text-xs text-cream-dim/40 font-sans">
          3 free searches · No credit card · No signup required
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
        <span className="text-xs text-cream-dim/40 tracking-[0.3em] uppercase font-sans">Scroll</span>
        <div className="relative w-px h-16">
          <div className="absolute inset-0 bg-cream-dim/20" />
          <div className="absolute top-0 left-0 w-full bg-gradient-to-b from-gold to-transparent animate-[scrollLine_1.5s_ease-in-out_infinite]" style={{ height: '40%' }} />
        </div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(250%); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-shimmer { animation: shimmer 2s linear infinite; }
      `}</style>
    </section>
  )
}
