import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function SocialProof() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    gsap.fromTo(el.querySelectorAll('.reveal'),
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 75%' } }
    )
  }, [])

  return (
    <section ref={sectionRef} className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="reveal opacity-0">
          <span className="text-xs text-terracotta tracking-widest uppercase font-sans">Honest truth</span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-3 mb-6">
            Just launched — <span className="text-gradient-gold italic">be one of our firsts</span>
          </h2>
          <p className="text-cream-dim text-lg font-sans font-light max-w-xl mx-auto mb-12 leading-relaxed">
            FreeReach is brand new. We're not going to show you fake testimonials or made-up numbers. Instead, we're being upfront: we're at zero, and we're inviting you to be part of building something real.
          </p>
        </div>
        <div className="reveal opacity-0 grid md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Sellers helped', value: '0 → you?', sub: 'Be the first seller to find their community' },
            { label: 'Fake reviews', value: 'Zero', sub: 'We believe in honesty over optics' },
            { label: 'Real communities', value: '1,000+', sub: 'In our AI\'s knowledge base, ready to match' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <p className="font-serif text-3xl font-semibold text-gradient-gold mb-1">{stat.value}</p>
              <p className="text-cream text-sm font-medium font-sans mb-1">{stat.label}</p>
              <p className="text-cream-dim/60 text-xs font-sans">{stat.sub}</p>
            </div>
          ))}
        </div>
        <div className="reveal opacity-0 glass rounded-2xl p-8 border border-terracotta/20">
          <p className="font-serif text-xl font-light italic text-cream leading-relaxed mb-4">
            "The best time to find your first buyers is before you have an audience — because you have nothing to lose and everything to gain by being genuine."
          </p>
          <p className="text-cream-dim/60 text-sm font-sans">— The FreeReach team</p>
        </div>
      </div>
    </section>
  )
}
