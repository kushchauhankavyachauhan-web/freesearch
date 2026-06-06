import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const steps = [
  { number: '01', title: 'Describe your product', description: 'Tell FreeReach what you sell — in plain language. The more specific, the better the results.', icon: '✍️' },
  { number: '02', title: 'AI finds your communities', description: 'Our AI scans its knowledge of thousands of online communities to find 6 real, active spots where your buyers already hang out.', icon: '🔍' },
  { number: '03', title: 'Post, connect, sell', description: 'Use the ready-to-paste posts, follow the do\'s and don\'ts, and start real conversations that turn into your first sales.', icon: '🚀' },
]

export default function HowItWorks() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    gsap.fromTo(el.querySelectorAll('.step-card'),
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 70%' } }
    )
    gsap.fromTo(el.querySelectorAll('.section-header'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' } }
    )
  }, [])

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="section-header text-center mb-16 opacity-0">
          <span className="text-xs text-terracotta tracking-widest uppercase font-sans">How it works</span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-3">Three steps to your first sale</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="step-card glass rounded-2xl p-8 opacity-0 group hover:-translate-y-2 transition-transform duration-300 cursor-default">
              <div className="flex items-start justify-between mb-6">
                <span className="text-4xl">{step.icon}</span>
                <span className="font-serif text-5xl font-bold text-gradient-gold opacity-30 group-hover:opacity-60 transition-opacity">{step.number}</span>
              </div>
              <h3 className="font-serif text-xl font-semibold text-cream mb-3">{step.title}</h3>
              <p className="text-cream-dim text-sm font-sans leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
