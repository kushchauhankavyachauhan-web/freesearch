import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function UpgradeModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    console.log('Waitlist email:', email)
    setSubmitted(true)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <div className="absolute inset-0 bg-espresso/80 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative glass rounded-2xl p-8 max-w-md w-full border border-gold/20 glow-gold"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-cream-dim/40 hover:text-cream transition-colors"
            >
              ✕
            </button>

            {!submitted ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">🔓</div>
                  <h3 className="font-serif text-2xl font-semibold mb-2">Unlock unlimited searches</h3>
                  <p className="text-cream-dim text-sm font-sans">
                    You've used your 3 free searches. Join the waitlist for early Premium access — we'll notify you when unlimited searches go live.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="glass rounded-xl p-4 text-center border border-cream/10">
                    <p className="text-xs text-cream-dim/60 font-sans uppercase tracking-wider mb-1">Monthly</p>
                    <p className="font-serif text-2xl font-semibold text-gold">₹99</p>
                    <p className="text-xs text-cream-dim/60 font-sans">/ month</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center border border-gold/30 relative">
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs bg-gold text-espresso px-2 py-0.5 rounded-full font-medium font-sans">Best value</span>
                    <p className="text-xs text-cream-dim/60 font-sans uppercase tracking-wider mb-1">Annual</p>
                    <p className="font-serif text-2xl font-semibold text-gold">₹799</p>
                    <p className="text-xs text-cream-dim/60 font-sans">/ year</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-transparent glass rounded-xl px-4 py-3 text-cream placeholder-cream-dim/30 outline-none text-sm font-sans border border-cream/10 focus:border-gold/30 transition-colors"
                  />
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-terracotta text-cream font-medium text-sm hover:bg-terracotta/90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
                  >
                    Join waitlist — notify me at launch
                  </button>
                </form>
                <p className="text-xs text-cream-dim/40 text-center mt-3 font-sans">
                  No spam. No credit card. Just an early access invite.
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-serif text-2xl font-semibold mb-2">You're on the list!</h3>
                <p className="text-cream-dim text-sm font-sans mb-6">
                  We'll email you at <strong className="text-cream">{email}</strong> when Premium launches.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-full glass text-cream text-sm hover:bg-cream/10 transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
