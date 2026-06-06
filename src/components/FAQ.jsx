import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'framer-motion'

const faqs = [
  { q: 'Is FreeReach really free to use?', a: 'Yes. You get 3 full searches — each returning 6 communities, posting tips, 3 ready-to-paste posts, and a first-sale tip — at no cost and without creating an account.' },
  { q: 'How does the AI find communities?', a: 'FreeReach uses a large language model trained on a broad knowledge of online platforms, communities, and forums. It matches your product to communities where similar products are discussed or where your target audience hangs out.' },
  { q: 'Are the communities it recommends real?', a: 'We instruct the AI to only recommend real, existing communities — never invented ones. That said, AI can occasionally hallucinate. We recommend verifying each community exists before spending time crafting posts for it.' },
  { q: 'What products work best with FreeReach?', a: 'Handmade goods, digital products, services, SaaS tools, physical products — essentially anything someone would buy online. The more niche and specific your product, the better the community match.' },
  { q: 'Will posting in these communities get me banned?', a: 'Not if you follow the do\'s and don\'ts we provide. The key is adding genuine value before promoting. Each community has its own culture — we give you context to fit in, not stand out as spam.' },
  { q: 'When will Premium be available?', a: 'Premium is in development. Join the waitlist above and you\'ll be among the first to know — and get early-bird pricing.' },
]

export default function FAQ() {
  const sectionRef = useRef(null)
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    const el = sectionRef.current
    gsap.fromTo(el.querySelectorAll('.faq-item'),
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 70%' } }
    )
    gsap.fromTo(el.querySelectorAll('.section-header'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 80%' } }
    )
  }, [])

  return (
    <section id="faq" ref={sectionRef} className="py-24 md:py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="section-header text-center mb-16 opacity-0">
          <span className="text-xs text-terracotta tracking-widest uppercase font-sans">FAQ</span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-3">Common questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item opacity-0 glass rounded-xl overflow-hidden">
              <button className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-cream/5 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                <span className="font-serif text-base font-medium text-cream">{faq.q}</span>
                <motion.span animate={{ rotate: openIndex === i ? 45 : 0 }} transition={{ duration: 0.2 }}
                  className="text-terracotta text-xl shrink-0">+</motion.span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
                    <p className="px-6 pb-5 text-cream-dim text-sm font-sans leading-relaxed border-t border-cream/5 pt-4">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
