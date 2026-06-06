import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import TiltCard from './TiltCard'

const plans = [
  {
    name: 'Free', price: '₹0', period: 'forever',
    description: 'Perfect to get started and validate your first ideas.',
    features: ['3 community searches', '6 communities per search', 'Posting tips & do\'s/don\'ts', '3 ready-to-paste posts', 'First-sale tip'],
    cta: 'Start free — no signup', ctaHref: '#tool', highlight: false,
  },
  {
    name: 'Premium', price: '₹99', period: 'per month',
    description: 'For sellers serious about finding their first 100 customers.',
    features: ['Unlimited community searches', '10 communities per search', 'Niche-specific posting strategies', '5 ready-to-paste posts', 'Follow-up message templates', 'Priority support'],
    cta: 'Join waitlist', ctaHref: '#waitlist', highlight: true,
  },
  {
    name: 'Annual', price: '₹799', period: 'per year',
    description: 'Best value for committed sellers. Save ₹389 vs monthly.',
    features: ['Everything in Premium', 'Save 33% vs monthly', 'Early access to new features', 'Community strategy call (1/month)'],
    cta: 'Join waitlist', ctaHref: '#waitlist', highlight: false,
  },
]

export default function Pricing() {
  const sectionRef = useRef(null)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    gsap.fromTo(el.querySelectorAll('.price-card'),
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 70%' } }
    )
    gsap.fromTo(el.querySelectorAll('.section-header'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' } }
    )
  }, [])

  const handleWaitlist = (e) => {
    e.preventDefault()
    if (!waitlistEmail) return
    console.log('Waitlist signup:', waitlistEmail)
    setWaitlistSubmitted(true)
  }

  return (
    <section id="pricing" ref={sectionRef} className="py-24 md:py-32 px-6 bg-espresso-light">
      <div className="max-w-6xl mx-auto">
        <div className="section-header text-center mb-16 opacity-0">
          <span className="text-xs text-terracotta tracking-widest uppercase font-sans">Pricing</span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-3">Start free, grow when ready</h2>
          <p className="text-cream-dim mt-4 text-sm font-sans max-w-md mx-auto">
            Premium is in demo mode — payments aren't live yet. Join the waitlist to be first when it launches.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <div key={i} className="price-card opacity-0">
              <TiltCard>
                <div className={`glass rounded-2xl p-8 h-full flex flex-col relative overflow-hidden ${plan.highlight ? 'border border-gold/30 glow-gold' : 'border border-cream/5'}`}>
                  {plan.highlight && (
                    <div className="absolute top-0 right-0 px-4 py-1 bg-gold text-espresso text-xs font-medium font-sans rounded-bl-xl">Most popular</div>
                  )}
                  <div className="mb-6">
                    <p className="text-cream-dim text-sm font-sans mb-2">{plan.name}</p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="font-serif text-4xl font-semibold text-cream">{plan.price}</span>
                      <span className="text-cream-dim/60 text-sm font-sans mb-1">/{plan.period}</span>
                    </div>
                    <p className="text-cream-dim/60 text-xs font-sans">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-cream-dim font-sans">
                        <span className="text-terracotta">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <a href={plan.ctaHref}
                    className={`block text-center py-3 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 ${plan.highlight ? 'bg-terracotta text-cream hover:bg-terracotta/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-terracotta/30' : 'glass text-cream hover:bg-cream/10'}`}>
                    {plan.cta}
                  </a>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>

        <div id="waitlist" className="section-header opacity-0 max-w-md mx-auto text-center">
          <h3 className="font-serif text-2xl font-semibold mb-2">Join the Premium waitlist</h3>
          <p className="text-cream-dim text-sm font-sans mb-6">Be first to know when paid plans go live. No spam, ever.</p>
          {!waitlistSubmitted ? (
            <form onSubmit={handleWaitlist} className="glass rounded-xl p-2 flex gap-2">
              <input type="email" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)}
                placeholder="your@email.com" required
                className="flex-1 bg-transparent text-cream placeholder-cream-dim/30 px-4 py-2 outline-none text-sm font-sans" />
              <button type="submit"
                className="px-5 py-2 rounded-lg bg-terracotta text-cream text-sm font-medium hover:bg-terracotta/90 active:scale-95 transition-all duration-200 whitespace-nowrap">
                Notify me
              </button>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-6 border border-gold/20">
              <p className="font-serif text-lg font-semibold text-gold mb-1">You're on the list! 🎉</p>
              <p className="text-cream-dim text-sm font-sans">We'll email you at {waitlistEmail}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
