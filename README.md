# FreeReach — Your First Buyers, Free

An AI-powered tool that helps new online sellers find free communities to get their first buyers.

## Quick Start

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Set up your AI API key:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and replace `your-api-key-here` with your actual API key.

3. Run the dev server:
   ```bash
   npm run dev
   ```

## Adding Your AI API Key

FreeReach uses the OpenAI-compatible API format. You have several options:

### Option 1: OpenAI (recommended for quality)
- Get a key at https://platform.openai.com
- Set `VITE_AI_API_KEY=sk-...` in `.env`
- Set `VITE_AI_MODEL=gpt-4o-mini` (cheapest, great quality)

### Option 2: Groq (free tier, very fast)
- Get a free key at https://console.groq.com
- Set `VITE_AI_BASE_URL=https://api.groq.com/openai/v1`
- Set `VITE_AI_MODEL=llama3-70b-8192`

### Option 3: Together AI (free credits)
- Get credits at https://api.together.ai
- Set `VITE_AI_BASE_URL=https://api.together.xyz/v1`
- Set `VITE_AI_MODEL=mistralai/Mixtral-8x7B-Instruct-v0.1`

**Without a key:** The app runs in demo mode with mock data — great for testing the UI.

## Deploy Free

### Vercel (recommended)
```bash
npm install -g vercel
vercel
```
Add your `VITE_AI_API_KEY` in Vercel's Environment Variables settings.

### Netlify
```bash
npm run build
# Drag and drop the `dist/` folder to app.netlify.com/drop
```
Add env vars in Netlify → Site settings → Environment variables.

## Project Structure

```
src/
  components/
    Navbar.jsx          # Fixed top navigation
    Hero.jsx            # Landing section with 3D coin
    CoinScene.jsx       # Three.js 3D coin with cursor parallax
    ParticleField.jsx   # Floating particle background
    Tool.jsx            # Core AI tool UI + freemium logic
    UpgradeModal.jsx    # Paywall modal with waitlist capture
    HowItWorks.jsx      # 3-step section
    WhyFreeReach.jsx    # Benefits with 3D tilt cards
    TiltCard.jsx        # Reusable 3D tilt wrapper
    SocialProof.jsx     # Honest "just launched" section
    Pricing.jsx         # Pricing plans + waitlist form
    FAQ.jsx             # Accordion FAQ
    Footer.jsx          # Footer
    ScrollProgressBar.jsx  # Top scroll indicator
```

## Connecting Payments

When ready to accept payments, replace the waitlist email capture in `UpgradeModal.jsx` with:
- **Razorpay** (great for INR): https://razorpay.com/docs
- **Stripe**: https://stripe.com/docs
- **Lemon Squeezy**: Easy SaaS billing, https://lemonsqueezy.com
