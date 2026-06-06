import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import UpgradeModal from './UpgradeModal'

const FREE_LIMIT = 3
const STORAGE_KEY = 'freereach_searches'

function getSearchCount() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
  } catch {
    return 0
  }
}

function incrementSearchCount() {
  try {
    const count = getSearchCount() + 1
    localStorage.setItem(STORAGE_KEY, String(count))
    return count
  } catch {
    return FREE_LIMIT + 1
  }
}

export default function Tool() {
  const sectionRef = useRef(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [searchCount, setSearchCount] = useState(getSearchCount())
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    gsap.fromTo(el.querySelectorAll('.reveal'),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 75%' }
      }
    )
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return

    const count = getSearchCount()
    if (count >= FREE_LIMIT) {
      setShowUpgrade(true)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const apiKey = import.meta.env.VITE_AI_API_KEY
      const baseUrl = import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1'
      const model = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini'

      if (!apiKey || apiKey === 'your-api-key-here') {
        // Demo mode — return mock data
        await new Promise(r => setTimeout(r, 1500))
        const newCount = incrementSearchCount()
        setSearchCount(newCount)
        setResult(getMockResult(query))
        return
      }

      const prompt = buildPrompt(query)
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          messages: [
            {
              role: 'system',
              content: 'You are a community marketing expert who helps new online sellers find free communities to promote their products. Always respond with valid JSON only, no markdown code blocks.',
            },
            { role: 'user', content: prompt },
          ],
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error?.message || `API error ${response.status}`)
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ''

      let parsed
      try {
        parsed = JSON.parse(text)
      } catch {
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
        else throw new Error('Could not parse AI response')
      }

      const newCount = incrementSearchCount()
      setSearchCount(newCount)
      setResult(parsed)

      if (newCount >= FREE_LIMIT) {
        setTimeout(() => setShowUpgrade(true), 3000)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const remaining = Math.max(0, FREE_LIMIT - searchCount)

  return (
    <section id="tool" ref={sectionRef} className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="reveal text-center mb-12">
          <span className="text-xs text-terracotta tracking-widest uppercase font-sans">The tool</span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mt-3 mb-4">
            Find your free communities
          </h2>
          <p className="text-cream-dim font-sans font-light max-w-xl mx-auto">
            Describe your product and we'll find real, active communities where your first buyers already hang out.
          </p>
          {remaining > 0 && (
            <p className="text-xs text-cream-dim/50 mt-3 font-sans">
              {remaining} free {remaining === 1 ? 'search' : 'searches'} remaining
            </p>
          )}
          {remaining === 0 && (
            <p className="text-xs text-terracotta/80 mt-3 font-sans">
              You've used all free searches.{' '}
              <button onClick={() => setShowUpgrade(true)} className="underline hover:text-terracotta">
                Upgrade to continue
              </button>
            </p>
          )}
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="reveal">
          <div className="glass rounded-2xl p-2 flex flex-col md:flex-row gap-2">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. I sell handmade soy candles with calming scents, targeting women aged 25-40 who love self-care..."
              className="flex-1 bg-transparent text-cream placeholder-cream-dim/40 px-4 py-3 resize-none outline-none font-sans text-sm min-h-[80px] md:min-h-0"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e)
              }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim() || remaining === 0}
              className="px-8 py-3 rounded-xl bg-terracotta text-cream font-medium text-sm hover:bg-terracotta/90 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                  Finding…
                </>
              ) : 'Find communities'}
            </button>
          </div>
          <p className="text-xs text-cream-dim/40 mt-2 text-center font-sans">
            Press ⌘+Enter to search
          </p>
        </form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-sm font-sans"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading skeleton */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-xl p-5 space-y-3 animate-pulse">
                  <div className="h-4 bg-cream/10 rounded w-1/3" />
                  <div className="h-3 bg-cream/5 rounded w-2/3" />
                  <div className="h-3 bg-cream/5 rounded w-1/2" />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8 space-y-8"
            >
              {/* Communities */}
              <div>
                <h3 className="font-serif text-2xl font-semibold mb-4 flex items-center gap-2">
                  <span className="text-gradient-gold">Communities for you</span>
                </h3>
                <div className="grid gap-4">
                  {result.communities?.map((c, i) => (
                    <CommunityCard key={i} community={c} index={i} locked={i >= 3 && searchCount > FREE_LIMIT} />
                  ))}
                </div>
              </div>

              {/* Do's and Don'ts */}
              {result.posting_tips && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-5">
                    <h4 className="font-serif text-lg font-semibold text-gold mb-3">Do's ✓</h4>
                    <ul className="space-y-2">
                      {result.posting_tips.dos?.map((d, i) => (
                        <li key={i} className="text-sm text-cream-dim font-sans flex gap-2">
                          <span className="text-terracotta mt-0.5">→</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="glass rounded-xl p-5">
                    <h4 className="font-serif text-lg font-semibold text-red-400 mb-3">Don'ts ✗</h4>
                    <ul className="space-y-2">
                      {result.posting_tips.donts?.map((d, i) => (
                        <li key={i} className="text-sm text-cream-dim font-sans flex gap-2">
                          <span className="text-red-400 mt-0.5">✗</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Ready-to-paste posts */}
              {result.sample_posts && (
                <div>
                  <h3 className="font-serif text-2xl font-semibold mb-4">
                    <span className="text-gradient-gold">Ready-to-paste posts</span>
                  </h3>
                  <div className="space-y-4">
                    {result.sample_posts.map((post, i) => (
                      <PostCard key={i} post={post} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* First-sale tip */}
              {result.first_sale_tip && (
                <div className="glass rounded-xl p-6 border border-gold/20 glow-gold">
                  <p className="text-xs text-gold tracking-widest uppercase font-sans mb-2">First-sale tip</p>
                  <p className="text-cream font-serif text-lg font-light italic">{result.first_sale_tip}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </section>
  )
}

function CommunityCard({ community, index, locked }) {
  const typeColors = {
    'Reddit': 'bg-orange-500/20 text-orange-300',
    'Facebook Group': 'bg-blue-500/20 text-blue-300',
    'Discord': 'bg-indigo-500/20 text-indigo-300',
    'Telegram': 'bg-sky-500/20 text-sky-300',
    'Forum': 'bg-green-500/20 text-green-300',
    'WhatsApp': 'bg-emerald-500/20 text-emerald-300',
    'LinkedIn': 'bg-blue-400/20 text-blue-200',
    'Twitter/X': 'bg-gray-500/20 text-gray-300',
    'default': 'bg-cream/10 text-cream-dim',
  }
  const colorClass = typeColors[community.type] || typeColors['default']

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass rounded-xl p-5 relative overflow-hidden ${locked ? 'select-none' : ''}`}
    >
      {locked && (
        <div className="absolute inset-0 backdrop-blur-sm bg-espresso/60 flex items-center justify-center rounded-xl z-10">
          <span className="text-sm text-cream-dim font-sans">🔒 Upgrade to unlock</span>
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h4 className="font-serif text-lg font-semibold text-cream">{community.name}</h4>
            <span className={`text-xs px-2 py-0.5 rounded-full font-sans ${colorClass}`}>
              {community.type}
            </span>
          </div>
          <p className="text-sm text-cream-dim font-sans leading-relaxed">{community.why}</p>
          {community.url && (
            <a
              href={community.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-terracotta hover:text-terracotta/80 font-sans mt-2 inline-block transition-colors"
            >
              Visit community →
            </a>
          )}
        </div>
        <span className="text-2xl font-serif text-gold/30 font-bold shrink-0">{index + 1}</span>
      </div>
    </motion.div>
  )
}

function PostCard({ post, index }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(post.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-cream-dim/60 font-sans uppercase tracking-wider">Post {index + 1}</span>
        <button
          onClick={copy}
          className="text-xs px-3 py-1.5 rounded-full glass hover:bg-cream/10 text-cream-dim hover:text-cream transition-all duration-200 font-sans"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-sm text-cream font-sans leading-relaxed whitespace-pre-wrap">{post.content}</p>
    </motion.div>
  )
}

function buildPrompt(product) {
  return `A new online seller describes their product: "${product}"

Find 6 real, existing free communities where they can post to find their first buyers. Return ONLY valid JSON with this exact structure:

{
  "communities": [
    {
      "name": "community name",
      "type": "Reddit|Facebook Group|Discord|Telegram|Forum|WhatsApp|LinkedIn|Twitter/X",
      "why": "1-2 sentences on why this community is a great fit and what to expect",
      "url": "direct URL to the community if known, or null"
    }
  ],
  "posting_tips": {
    "dos": ["tip 1", "tip 2", "tip 3"],
    "donts": ["tip 1", "tip 2", "tip 3"]
  },
  "sample_posts": [
    { "content": "ready to paste post text, 50-100 words, genuine and non-spammy" },
    { "content": "another ready to paste post, different angle" },
    { "content": "a third post for a different community type" }
  ],
  "first_sale_tip": "one specific, actionable tip to close their first sale from a community"
}

RULES:
- Only recommend REAL communities that actually exist right now
- Never invent community names
- Communities must be FREE to join and post in
- Posts must sound human, not promotional spam`
}

function getMockResult(query) {
  return {
    communities: [
      {
        name: 'r/entrepreneur',
        type: 'Reddit',
        why: 'A highly active subreddit with 1.2M members where founders share wins, seek feedback, and support each other. The community welcomes genuine product introductions in the weekly threads.',
        url: 'https://reddit.com/r/entrepreneur',
      },
      {
        name: 'r/smallbusiness',
        type: 'Reddit',
        why: 'Focused on small business owners and side hustlers. Members are supportive of new sellers and often give honest, constructive feedback on products.',
        url: 'https://reddit.com/r/smallbusiness',
      },
      {
        name: 'Indie Hackers',
        type: 'Forum',
        why: 'A well-known community of indie founders and online sellers. You can share your product launch story and get both feedback and early customers.',
        url: 'https://www.indiehackers.com',
      },
      {
        name: 'Product Hunt',
        type: 'Forum',
        why: 'The go-to launch platform for new products. A featured launch or even an upvoted comment can drive hundreds of visitors on day one.',
        url: 'https://www.producthunt.com',
      },
      {
        name: 'Facebook Marketplace & Local Groups',
        type: 'Facebook Group',
        why: 'Search for local buy-sell groups relevant to your niche. These groups have buyers with high purchase intent who are already looking for products like yours.',
        url: 'https://www.facebook.com/marketplace',
      },
      {
        name: 'Side Hustle Nation Community',
        type: 'Facebook Group',
        why: 'Tens of thousands of side hustlers and online sellers who actively share referrals and purchases. Members are highly supportive of fellow entrepreneurs.',
        url: 'https://www.facebook.com/groups/sidehustlenation',
      },
    ],
    posting_tips: {
      dos: [
        'Lead with genuine value — share a helpful tip or story before mentioning your product',
        'Engage with 3-5 existing posts first to build community standing before posting',
        "Be transparent: mention you're a new seller and would love early feedback",
      ],
      donts: [
        "Never just drop a link with no context — it reads as spam and will be removed",
        "Don't post the same message copy-pasted across multiple communities",
        'Avoid overly sales-heavy language — communities reward authenticity over pitches',
      ],
    },
    sample_posts: [
      {
        content: `Hey everyone! I recently started making [your product] and just opened my small shop. I'd really appreciate any feedback from people who know this space. Happy to offer a small discount to the first few people who want to try it — I care more about getting real opinions right now than making a big profit. Anyone interested or have tips for a brand-new seller?`,
      },
      {
        content: `I'm a new independent seller and I've spent the last few months perfecting [your product]. After a lot of iteration, I finally feel confident enough to share it publicly. Here's what makes it different: [your unique value]. Completely open to critique — what would make you trust a new seller enough to take a chance?`,
      },
      {
        content: `Quick question for this community: if you were looking for [product category], what would make you buy from a brand-new small seller over an established brand? Asking because I just launched and am trying to understand what matters most to buyers like you.`,
      },
    ],
    first_sale_tip: `Reach out personally in DMs to 5 people who engage with your post — a direct, genuine message asking if they'd like to be your very first customer (with a small thank-you discount) converts far better than any public post alone.`,
  }
}
