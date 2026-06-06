import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const marqueeItems = [
  '✦ No fake testimonials',
  '✦ 100% honest',
  '✦ Just launched',
  '✦ Be our first seller',
  '✦ Real communities only',
  '✦ Zero ad spend',
  '✦ No fake testimonials',
  '✦ 100% honest',
  '✦ Just launched',
  '✦ Be our first seller',
  '✦ Real communities only',
  '✦ Zero ad spend',
]

export default function SocialProof() {
  const sectionRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current

    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%' },
      }
    )

    gsap.fromTo(el.querySelectorAll('.stat-card'),
      { opacity: 0, y: 40, scale: 0.95 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.12, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: el, start: 'top 70%' },
      }
    )

    gsap.fromTo(el.querySelector('.quote-block'),
      { opacity: 0, x: -40 },
      {
        opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 60%' },
      }
    )
  }, [])

  return (
    <section ref={sectionRef} className="py-24 overflow-hidden">
      {/* Marquee strip */}
      <div className="border-y border-cream/5 py-4 mb-20 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {marqueeItems.map((item, i) => (
            <span key={i} className="text-sm text-cream-dim/40 font-sans mx-8 shrink-0">
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="px-6 max-w-4xl mx-auto text-center">
        <div ref={titleRef} className="opacity-0 mb-16">
          <span className="text-xs text-terracotta tracking-widest uppercase font-sans">The honest truth</span>
          <h2 className="font-serif text-4xl md:text-6xl font-semibold mt-4 mb-6 leading-tight">
            Just launched —{' '}
            <span className="text-gradient-gold italic">be one of our firsts</span>
          </h2>
          <p className="text-cream-dim text-lg font-sans font-light max-w-xl mx-auto leading-relaxed">
            We're not going to show you fake testimonials or made-up numbers. We're being upfront: we're at zero, and we're inviting you to be part of building something real.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { value: '0 → you?', label: 'Sellers helped', sub: 'Be the first to find your community', color: '#d4824a' },
            { value: 'Zero', label: 'Fake reviews', sub: 'We believe in honesty over optics', color: '#c79a52' },
            { value: '1,000+', label: 'Communities mapped', sub: 'In our AI knowledge base, ready to match', color: '#e8b86d' },
          ].map((stat, i) => (
            <div
              key={i}
              className="stat-card opacity-0 glass rounded-2xl p-8 group hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{ background: `radial-gradient(circle at 50% 100%, ${stat.color}15, transparent 70%)` }}
              />
              <p className="font-serif text-4xl font-semibold mb-2" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-cream text-sm font-medium font-sans mb-1">{stat.label}</p>
              <p className="text-cream-dim/50 text-xs font-sans">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="quote-block opacity-0 glass rounded-2xl p-8 md:p-10 border border-terracotta/20 relative overflow-hidden">
          <div className="absolute -top-8 -left-4 font-serif text-[120px] text-terracotta/10 select-none leading-none">"</div>
          <p className="font-serif text-xl md:text-2xl font-light italic text-cream leading-relaxed mb-6 relative z-10">
            The best time to find your first buyers is before you have an audience — because you have nothing to lose and everything to gain by being genuine.
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-px bg-terracotta/40" />
            <p className="text-cream-dim/50 text-sm font-sans">The FreeReach team</p>
            <div className="w-8 h-px bg-terracotta/40" />
          </div>
        </div>
      </div>
    </section>
  )
}
