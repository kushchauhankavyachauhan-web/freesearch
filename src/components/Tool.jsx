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
          max_tokens: 3500,
          messages: [
            {
              role: 'system',
              content: 'You are an expert community marketer with deep knowledge of thousands of niche online communities, forums, Discord servers, Facebook groups, and indie platforms. You specialize in finding non-obvious, highly specific communities for any product niche. You NEVER give generic platform names — you always name the exact community. You always respond with valid JSON only, no markdown code blocks, no commentary outside the JSON.',
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
  return `You are an expert community marketer who knows every niche corner of the internet. A new seller describes their product: "${product}"

Your job: find 6 SPECIFIC, NON-OBVIOUS communities where buyers for THIS exact product already gather.

STRICT RULES — break any of these and your answer is wrong:
1. NEVER name a platform generically. NOT "Reddit", NOT "Facebook", NOT "Instagram", NOT "social media". You MUST name the EXACT community: the specific subreddit (e.g. r/soapmaking), the exact Facebook group name, the exact Discord server, the exact forum URL.
2. At least 2 of the 6 must be communities most people have never heard of — niche forums, small Discord servers, specialized Slack groups, topic-specific communities, indie marketplaces, newsletter communities, or local groups.
3. Every "why" must explain specifically WHY buyers for THIS product (not any product) are in that community, and what they talk about there.
4. All communities must be FREE to join and post in.
5. Only recommend communities that actually exist.
6. Prioritize BUYER communities over seller/entrepreneur communities. The buyer is already there, searching.

THINK STEP BY STEP:
- What is the core use-case or identity of someone who buys this product?
- What hobbies, problems, lifestyles, or rituals surround it?
- Where do those people gather online to talk about those things — not to shop, but to connect?
- Which of those places allow free posting or introductions?

EXAMPLES OF BAD answers (never do this):
- "Reddit" (too vague)
- "Facebook groups related to your niche" (useless)
- "r/entrepreneur" (irrelevant to the product buyer)
- "Instagram hashtag communities" (not a community)

EXAMPLES OF GOOD answers:
- For soy candles: "r/candlemaking", "The Slow Living Collective (Facebook group, 47k members)", "Naturallycurly forums home & lifestyle section", "Etsy Sellers & Buyers Discord (#handmade-home channel)"
- For a Notion template for teachers: "r/Notion", "Teachers Pay Teachers community forum", "Cult of Pedagogy Facebook group", "WeAreTeachers Helpline (Facebook, 500k members)"

Return ONLY valid JSON, no markdown, no explanation outside the JSON:

{
  "communities": [
    {
      "name": "exact community name (subreddit, group name, server name, forum name)",
      "type": "Reddit|Facebook Group|Discord|Telegram|Forum|Slack|Marketplace|Other",
      "why": "2-3 sentences: who specifically is in this community, what they discuss, and why someone there would want this exact product",
      "url": "direct URL if you know it with high confidence, otherwise null"
    }
  ],
  "posting_tips": {
    "dos": [
      "specific tip tailored to THIS product and community culture",
      "specific tip about timing, framing, or approach",
      "specific tip about how to make the first post feel native, not promotional"
    ],
    "donts": [
      "specific mistake sellers of this type of product commonly make",
      "specific rule or norm in these communities that newcomers break",
      "specific phrasing or approach that gets posts removed or ignored"
    ]
  },
  "sample_posts": [
    { "content": "a 60-90 word post written FOR this specific product, ready to paste, sounds like a real person not a marketer, opens a conversation rather than making a pitch" },
    { "content": "a second post with a completely different angle — maybe a question, a story, or a value-first approach" },
    { "content": "a third post suited to a more casual community tone, shorter and more conversational" }
  ],
  "first_sale_tip": "one ultra-specific, actionable tip for closing the first sale in one of these exact communities — include a concrete action (e.g. reply to a specific type of thread, DM people who comment on X, offer Y as a first-buyer bonus)"
}`
}

function getMockResult(query) {
  // Demo result — shows the quality bar. Add your API key in .env to get product-specific results.
  return {
    communities: [
      {
        name: 'r/candlemaking',
        type: 'Reddit',
        why: 'A 180k-member community of active candle makers AND enthusiasts who regularly share what they are burning, buying, and gifting. Members post hauls and ask for recommendations weekly — a genuine post about your scent story fits perfectly here.',
        url: 'https://reddit.com/r/candlemaking',
      },
      {
        name: 'Slow Living & Hygge Home (Facebook Group)',
        type: 'Facebook Group',
        why: 'A 230k-member group dedicated to slow, intentional living — candles are a recurring topic as they are central to the hygge aesthetic. Members actively share where to buy small-batch, artisan candles and respond warmly to maker introductions.',
        url: 'https://www.facebook.com/groups/slowlivinghygge',
      },
      {
        name: 'r/ZeroWaste',
        type: 'Reddit',
        why: 'If your candles use natural wax (soy, beeswax) and cotton wicks, this community of 700k actively seeks non-paraffin alternatives. They reward transparency about ingredients and are willing to pay premium for genuinely clean products.',
        url: 'https://reddit.com/r/zerowaste',
      },
      {
        name: 'The Cozy Corner — Cottage & Farmhouse Living (Facebook Group)',
        type: 'Facebook Group',
        why: 'A tight-knit group of 85k home-decor enthusiasts obsessed with creating warm, scented atmospheres at home. Candle recommendations get dozens of comments and direct DMs from people asking where to buy.',
        url: null,
      },
      {
        name: 'Handmade & Artisan Goods Discord (Makers Market server)',
        type: 'Discord',
        why: 'A Discord community of indie makers with a dedicated #shop-drops channel where artisan sellers post new products weekly. The audience is primed to buy directly from small makers — no algorithm gatekeeping your post.',
        url: 'https://discord.gg/makersmarket',
      },
      {
        name: 'Indie Candle Lovers (Facebook Group)',
        type: 'Facebook Group',
        why: 'A niche group of 40k people who specifically seek out independent candle makers rather than big brands. Members post monthly "find me a candle that smells like..." threads — perfect opportunities to introduce your scent lineup.',
        url: null,
      },
    ],
    posting_tips: {
      dos: [
        'Lead with your scent story or inspiration — "I made this because I couldn\'t find a candle that smelled like..." triggers curiosity without feeling like an ad',
        'Post a photo of your candle in a styled, cozy setting (not on a white product background) — lifestyle imagery outperforms product shots 3:1 in these communities',
        'Offer 1-2 testers or samples to people who DM you — in candle communities, a whiff sells better than any description',
      ],
      donts: [
        'Never list your Etsy or shop link in the first post — many of these groups auto-remove posts with links; get engagement first, then share in comments',
        'Avoid ingredient lists in your opening post — lead with the feeling and scent story, not the specs',
        'Don\'t post in r/candlemaking on weekends when maker posts dominate — Tuesday through Thursday gets more buyer eyeballs',
      ],
    },
    sample_posts: [
      {
        content: `I've been making small-batch soy candles out of my kitchen for the past year and finally feel ready to share them more widely. I focus on calm, grounding scents — think cedarwood and dried herbs rather than sweet or floral. Made a small run of 12 before deciding if I want to open a proper shop. Would love honest opinions from people who actually know candles. Anyone here into earthier, more minimal scents?`,
      },
      {
        content: `Question for this community: what's the most underrated candle scent you've ever burned? Asking partly out of curiosity, partly because I make candles and I'm always looking for inspiration beyond the usual vanilla-and-citrus category. I'll share what I've been working on if there's interest!`,
      },
      {
        content: `Just did my first small candle run 🕯️ Soy wax, cotton wick, cedarwood + vetiver. Smells like a forest cabin in the best way. Not sure if I'll open a shop yet — just happy to share a few with people who'd actually appreciate them. Drop a comment if curious!`,
      },
    ],
    first_sale_tip: `Search r/candlemaking and the Facebook groups for threads where people ask "where can I buy X type of candle?" — reply directly to those threads with a genuine, no-pressure answer. People asking those questions have their wallet open already; you just need to show up in the right conversation.`,
  }
}
