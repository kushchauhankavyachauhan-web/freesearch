import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollProgressBar from './components/ScrollProgressBar'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Tool from './components/Tool'
import HowItWorks from './components/HowItWorks'
import WhyFreeReach from './components/WhyFreeReach'
import SocialProof from './components/SocialProof'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import CustomCursor from './components/CustomCursor'
import PageLoader from './components/PageLoader'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const lenisRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => { lenis.raf(time * 1000) })
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <>
      {/* Custom cursor — desktop only */}
      <div className="hidden md:block">
        <CustomCursor />
      </div>

      {/* Page loader */}
      {!loaded && <PageLoader onComplete={() => setLoaded(true)} />}

      <div className="grain bg-espresso min-h-screen">
        <ScrollProgressBar />
        <Navbar />
        <Hero />
        <Tool />
        <HowItWorks />
        <WhyFreeReach />
        <SocialProof />
        <Pricing />
        <FAQ />
        <Footer />
      </div>
    </>
  )
}
