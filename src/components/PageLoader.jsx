import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function PageLoader({ onComplete }) {
  const overlayRef = useRef(null)
  const textRef = useRef(null)
  const progressRef = useRef(null)
  const barRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()

    // Count up
    tl.to(progressRef.current, {
      textContent: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      snap: { textContent: 1 },
      onUpdate() {
        if (progressRef.current)
          progressRef.current.textContent = Math.round(parseFloat(progressRef.current.textContent)) + '%'
      },
    })
    tl.to(barRef.current, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0)

    // Slam up
    tl.to(textRef.current, { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, '+=0.1')
    tl.to(overlayRef.current, {
      yPercent: -100,
      duration: 1,
      ease: 'power4.inOut',
    })
    tl.call(() => onComplete?.())
  }, [])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[99999] bg-espresso flex flex-col items-center justify-center"
    >
      <div ref={textRef} className="text-center">
        <p className="font-serif text-5xl font-semibold text-gradient-gold mb-8">FreeReach</p>
        <div className="w-48 h-px bg-cream/10 mx-auto mb-4 overflow-hidden">
          <div
            ref={barRef}
            className="h-full bg-gradient-to-r from-terracotta to-gold origin-left"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
        <p ref={progressRef} className="text-cream-dim/40 text-sm font-sans tabular-nums">0%</p>
      </div>
    </div>
  )
}
