import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TiltCard from './TiltCard'

const benefits = [
  { icon: '🎯', title: 'Real communities, always', description: 'We only surface platforms that actually exist and are active today — no ghost groups, no dead forums. Every recommendation is a real opportunity.' },
  { icon: '💸', title: 'Zero ad spend needed', description: 'Every community we find is free to join and post in. No boosted posts, no influencer fees, no minimum budgets. Just genuine connection.' },
  { icon: '⚡', title: 'Ready to act in minutes', description: 'You get copy-ready posts, community context, and a first-sale strategy — not vague advice. Go from idea to first post in under 10 minutes.' },
]

export default function WhyFreeReach() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    gsap.fromTo(el.querySelectorAll('.benefit-card'),
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 70%' } }
    )
    gsap.fromTo(el.querySelectorAll('.section-header'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' } }
    )
  }, [])

  return (
    <section id="why" ref={sectionRef} className="py-24 md:py-32 px-6 bg-espresso-light">
      <div className="max-w-6xl mx-auto">
        <div className="section-header text-center mb-16 opacity-0">
          <span className="text-xs text-terracotta tracking-widest uppercase font-sans">Why FreeReach</span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-3">
            Built for sellers who are <span className="text-gradient-gold italic">just starting</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <div key={i} className="benefit-card opacity-0">
              <TiltCard>
                <div className="glass rounded-2xl p-8 h-full">
                  <span className="text-4xl mb-5 block">{benefit.icon}</span>
                  <h3 className="font-serif text-xl font-semibold text-cream mb-3">{benefit.title}</h3>
                  <p className="text-cream-dim text-sm font-sans leading-relaxed">{benefit.description}</p>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
