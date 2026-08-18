import { useEffect, useState, useCallback } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Hero from '../components/hero.jsx'
import MarqueeSection from '../components/MarqueeSection.jsx'
import About from '../components/About.jsx'
import Skills from '../components/Skills.jsx'
import Services from '../components/Services.jsx'
import Projects from '../components/Projects.jsx'
import Experience from '../components/Experience.jsx'
import ContactPopup from '../components/ContactPopup.jsx'
import ScrollToTop from '../components/ScrollToTop.jsx'
import SEO from '../components/SEO.jsx'
import ContactButton from '../components/ui/ContactButton.jsx'
import FadeIn from '../components/ui/FadeIn.jsx'
import { trackVisit } from '../api'

gsap.registerPlugin(ScrollTrigger)

function Portfolio() {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = useCallback(() => setContactOpen(true), [])
  const closeContact = useCallback(() => setContactOpen(false), [])

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.8,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.2,
      infinite: false,
    })

    lenis.on('scroll', ScrollTrigger.update)

    // Expose for components that need programmatic scrolling (e.g. ScrollToTop) —
    // calling window.scrollTo directly gets overridden by Lenis.
    window.lenis = lenis

    const rafFn = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(rafFn)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.destroy()
      if (window.lenis === lenis) delete window.lenis
      gsap.ticker.remove(rafFn)
    }
  }, [])

  // Track page visit
  useEffect(() => {
    trackVisit('/').catch(() => {})
  }, [])

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#0C0C0C', overflowX: 'clip' }}>
      <SEO
        title="Lightnos.dev — Udit Agrawal | Full Stack Developer"
        description="Full-stack developer and MERN Stack specialist with over 3 years of experience. Building scalable systems and shipping products that move fast."
      />

      <Hero onContact={openContact} />
      <MarqueeSection />
      <About onContact={openContact} />
      <Skills />
      <Services />
      <Projects />
      <Experience />

      {/* ── Footer CTA strip ── */}
      <footer
        id="contact"
        className="relative flex flex-col items-center gap-8 sm:gap-10 px-5 sm:px-8 md:px-10 pt-10 pb-20 sm:pb-24 text-center"
      >
        <FadeIn delay={0} y={40}>
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(2.4rem, 9vw, 120px)' }}
          >
            Let&apos;s talk
          </h2>
        </FadeIn>
        <FadeIn delay={0.15} y={20}>
          <ContactButton onClick={openContact} />
        </FadeIn>
        <p
          className="font-light uppercase tracking-widest mt-6"
          style={{ color: 'rgba(215,226,234,0.3)', fontSize: 'clamp(0.6rem, 1.2vw, 0.8rem)' }}
        >
          © {new Date().getFullYear()} Lightnos.dev — Udit Agrawal
        </p>
      </footer>

      <ContactPopup isOpen={contactOpen} onClose={closeContact} />
      <ScrollToTop />
    </div>
  )
}

export default Portfolio
