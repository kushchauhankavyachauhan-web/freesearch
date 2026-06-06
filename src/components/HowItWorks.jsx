import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const steps = [
  {
    number: '01',
    title: 'Describe your product',
    description: 'Tell FreeReach what you sell — in plain language. The more specific, the better the results.',
    icon: '✍️',
    color: '#d4824a',
  },
  {
    number: '02',
    title: 'AI finds your communities',
    description: 'Our AI scans thousands of online communities to find 6 real, active spots where your buyers already hang out.',
    icon: '🔍',
    color: '#c79a52',
  },
  {
    number: '03',
    title: 'Post, connect, sell',
    description: 'Use ready-to-paste posts, follow the do\'s and don\'ts, and start real conversations that turn into your first sales.',
    icon: '🚀',
    color: '#e8b86d',
  },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    const isMobile = window.innerWidth < 768

    // Title reveal
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' },
      }
    )

    if (!isMobile) {
      // Horizontal scroll pin for steps
      const cards = el.querySelectorAll('.step-card')
      gsap.fromTo(cards,
        { opacity: 0, x: 80, scale: 0.92 },
        {
          opacity: 1, x: 0, scale: 1,
          duration: 0.9, stagger: 0.2, ease: 'power3.out',
          scrollTrigger: { trigger: trackRef.current, start: 'top 65%' },
        }
      )

      // Number counter animation
      cards.forEach((card, i) => {
        gsap.fromTo(card.querySelector('.big-num'),
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1.2, ease: 'power4.out', delay: i * 0.15,
            scrollTrigger: { trigger: trackRef.current, start: 'top 65%' },
          }
        )
      })
    } else {
      gsap.fromTo(el.querySelectorAll('.step-card'),
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 70%' },
        }
      )
    }

    // Line connector draw
    const lines = el.querySelectorAll('.connector-line')
    lines.forEach((line) => {
      gsap.fromTo(line,
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.2, ease: 'power2.inOut',
          scrollTrigger: { trigger: trackRef.current, start: 'top 65%' },
        }
      )
    })
  }, [])

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 md:py-36 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div ref={titleRef} className="text-center mb-20 opacity-0">
          <span className="text-xs text-terracotta tracking-widest uppercase font-sans">How it works</span>
          <h2 className="font-serif text-4xl md:text-6xl font-semibold mt-4 leading-tight">
            Three steps to your{' '}
            <span className="text-gradient-gold italic">first sale</span>
          </h2>
        </div>

        <div ref={trackRef} className="relative grid md:grid-cols-3 gap-8 md:gap-6">
          {/* Connector lines (desktop) */}
          <div className="hidden md:block absolute top-16 left-[33%] right-[33%] h-px overflow-hidden">
            <div className="connector-line w-full h-full bg-gradient-to-r from-terracotta to-gold origin-left" style={{ transform: 'scaleX(0)' }} />
          </div>

          {steps.map((step, i) => (
            <div
              key={i}
              className="step-card glass rounded-2xl p-8 opacity-0 group relative overflow-hidden cursor-default hover:border-gold/20 border border-transparent transition-all duration-500 hover:shadow-2xl hover:shadow-black/30 hover:-translate-y-3"
              style={{ willChange: 'transform' }}
            >
              {/* Background number */}
              <span
                className="big-num absolute -right-4 -top-6 font-serif text-[120px] font-bold leading-none select-none pointer-events-none opacity-0"
                style={{ color: step.color, opacity: 0.06 }}
              >
                {step.number}
              </span>

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${step.color}18, transparent 70%)` }}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: `${step.color}22` }}>
                    {step.icon}
                  </div>
                  <span className="font-serif text-sm font-semibold tracking-widest" style={{ color: step.color }}>
                    STEP {step.number}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-cream mb-3 group-hover:text-gradient-gold transition-all">
                  {step.title}
                </h3>
                <p className="text-cream-dim text-sm font-sans leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
