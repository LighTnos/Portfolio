import React, { useRef, useEffect, useState, Suspense, lazy } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FadeIn from './ui/FadeIn.jsx'
import ContactButton from './ui/ContactButton.jsx'

// Split three.js/R3F into their own async chunk so they never block first paint
const Avatar3D = lazy(() => import('./ui/Avatar3D.jsx'))

gsap.registerPlugin(ScrollTrigger)

const NAV_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Price' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
]

const HEADING = "HI, I'M UDIT"
const TAGLINE = 'a full-stack creator driven by crafting striking and unforgettable products'

const Hero = ({ onContact, animate = true }) => {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const glowRef = useRef(null)
  const parallaxRef = useRef(null)
  const [showAvatar, setShowAvatar] = useState(false)

  // Mount the 3D avatar only after the browser is idle, so the hero
  // text/animations paint instantly and the heavy chunk loads in the background.
  useEffect(() => {
    const mount = () => setShowAvatar(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(mount, { timeout: 1200 })
      return () => window.cancelIdleCallback(id)
    }
    const t = setTimeout(mount, 350)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const heading = headingRef.current
    if (!section || !heading || !animate) return

    const chars = heading.querySelectorAll('[data-char]')

    const ctx = gsap.context(() => {
      // ── Staggered character reveal ──
      gsap.fromTo(
        chars,
        { yPercent: 110, rotate: 4, opacity: 0 },
        {
          yPercent: 0,
          rotate: 0,
          opacity: 1,
          duration: 1.1,
          delay: 0.25,
          ease: 'power4.out',
          stagger: { each: 0.045, from: 'start' },
        }
      )

      // ── Periodic sheen wave sweeping across the characters ──
      gsap.fromTo(
        chars,
        { backgroundPosition: '160% 0, 0 0' },
        {
          backgroundPosition: '-160% 0, 0 0',
          duration: 1.2,
          delay: 2.2,
          ease: 'power2.inOut',
          stagger: { each: 0.06, repeat: -1, repeatDelay: 4.5 },
        }
      )

      // ── Tagline words rise in one after another ──
      gsap.fromTo(
        section.querySelectorAll('[data-word]'),
        { yPercent: 120, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          delay: 1.0,
          ease: 'power4.out',
          stagger: 0.045,
        }
      )

      // ── Ambient glow breathing ──
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.85,
          scale: 1.12,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      }

      // ── Scroll-out parallax: heading drifts up, avatar sinks ──
      gsap.to(heading, {
        yPercent: -35,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, section)

    // ── Mouse parallax on heading + glow ──
    const xTo = gsap.quickTo(parallaxRef.current, 'x', { duration: 0.8, ease: 'power3.out' })
    const yTo = gsap.quickTo(parallaxRef.current, 'y', { duration: 0.8, ease: 'power3.out' })
    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      xTo(nx * 24)
      yTo(ny * 14)
    }
    window.addEventListener('mousemove', onMove)

    return () => {
      window.removeEventListener('mousemove', onMove)
      ctx.revert()
    }
  }, [animate])

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative h-screen flex flex-col"
      style={{ overflowX: 'clip' }}
    >
      {/* ── Ambient brand-gradient glow behind everything ── */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 bottom-[-10%] pointer-events-none
                   w-[90vw] max-w-[1100px] h-[65vh]"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 65%, rgba(182,0,168,0.20) 0%, rgba(118,33,176,0.13) 35%, rgba(190,76,0,0.05) 60%, transparent 78%)',
          opacity: 0.5,
          willChange: 'transform, opacity',
        }}
      />

      {/* ── Navbar: wordmark left, links right ── */}
      <FadeIn delay={0} y={-20} as="nav" className="w-full relative z-20">
        <div className="flex items-center justify-between px-6 md:px-10 pt-6 md:pt-8">
          <a href="#home" className="tracking-tighter font-medium text-base md:text-lg" style={{ color: '#FFFFFF' }}>
            Lightnos<span style={{ color: 'rgba(255,255,255,0.35)' }}>.dev</span>
          </a>
          <div className="flex items-center gap-5 sm:gap-8 md:gap-10">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                onClick={
                  label === 'Contact'
                    ? (e) => {
                        e.preventDefault()
                        onContact?.()
                      }
                    : undefined
                }
                className="group relative font-medium uppercase tracking-widest text-[0.65rem] sm:text-xs md:text-sm
                           hover:opacity-100 opacity-70 transition-opacity duration-200"
                style={{ color: '#D7E2EA' }}
              >
                {label}
                <span
                  className="absolute -bottom-1 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300"
                  style={{ background: 'linear-gradient(90deg, #B600A8, #BE4C00)' }}
                />
              </a>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ── Massive heading with staggered char reveal + parallax ── */}
      <div ref={parallaxRef} className="overflow-hidden relative z-10">
        <h1
          ref={headingRef}
          aria-label={HEADING}
          className="w-full text-center font-black uppercase tracking-tight leading-none whitespace-nowrap
                     text-[14vw] sm:text-[15vw] md:text-[16vw] lg:text-[17.5vw]
                     mt-6 sm:mt-4 md:-mt-5"
        >
          {HEADING.split('').map((ch, i) =>
            ch === ' ' ? (
              <span key={i} className="inline-block">&nbsp;</span>
            ) : (
              <span key={i} className="inline-block overflow-hidden align-bottom">
                <span data-char className="hero-char inline-block will-change-transform" style={{ opacity: 0 }}>
                  {ch}
                </span>
              </span>
            )
          )}
        </h1>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative flex-1 flex items-end">
        <div className="w-full flex justify-between items-end px-6 md:px-10 pb-7 sm:pb-8 md:pb-10">
          <FadeIn delay={0.9} y={20} className="relative z-20">
            <div className="flex flex-col gap-3">
              {/* Availability badge */}
              <span
                className="inline-flex items-center gap-2 uppercase tracking-widest font-medium"
                style={{ color: 'rgba(215,226,234,0.55)', fontSize: 'clamp(0.55rem, 1vw, 0.75rem)' }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                    style={{ backgroundColor: '#4ade80' }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: '#4ade80' }}
                  />
                </span>
                <span className="shimmer-text">Available for work</span>
              </span>
              <p
                className="font-light uppercase tracking-wide leading-snug
                           max-w-[160px] sm:max-w-[220px] md:max-w-[260px]"
                style={{ color: '#D7E2EA', fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
              >
                {TAGLINE.split(' ').map((word, i, arr) => (
                  <span key={i} className="inline-block overflow-hidden align-bottom">
                    <span data-word className="inline-block" style={{ opacity: 0 }}>
                      {i < arr.length - 1 ? `${word}\u00A0` : word}
                    </span>
                  </span>
                ))}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={1.05} y={20} className="relative z-20">
            <ContactButton onClick={onContact} />
          </FadeIn>
        </div>

        {/* ── 3D avatar (glTF) — head follows the cursor ── */}
        <FadeIn
          delay={0.7}
          y={30}
          className="hero-avatar absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none
                     w-[300px] sm:w-[400px] md:w-[500px] lg:w-[580px]
                     top-1/2 -translate-y-1/2 sm:top-auto sm:translate-y-0 sm:bottom-0"
        >
          {showAvatar && (
            <Suspense fallback={null}>
              <Avatar3D className="w-full h-full" />
            </Suspense>
          )}
        </FadeIn>
      </div>
    </section>
  )
}

export default Hero
