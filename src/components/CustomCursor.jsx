import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = 'none'

    const moveCursor = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      gsap.to(dotRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1,
        ease: 'power2.out',
      })
      gsap.to(ringRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.45,
        ease: 'power2.out',
      })
    }

    const onEnterLink = () => {
      gsap.to(ringRef.current, { scale: 2.5, opacity: 0.4, duration: 0.3 })
      gsap.to(dotRef.current, { scale: 0, duration: 0.3 })
    }
    const onLeaveLink = () => {
      gsap.to(ringRef.current, { scale: 1, opacity: 1, duration: 0.3 })
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 })
    }

    window.addEventListener('mousemove', moveCursor)

    const addListeners = () => {
      document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
        el.addEventListener('mouseenter', onEnterLink)
        el.addEventListener('mouseleave', onLeaveLink)
      })
    }

    addListeners()
    // Re-add on DOM changes
    const observer = new MutationObserver(addListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.body.style.cursor = ''
      window.removeEventListener('mousemove', moveCursor)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-terracotta z-[99999] pointer-events-none -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        style={{ willChange: 'transform' }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-gold/60 z-[99998] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: 'transform' }}
      />
    </>
  )
}
