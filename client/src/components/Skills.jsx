import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import FadeIn from './ui/FadeIn.jsx'

gsap.registerPlugin(ScrollTrigger)

// Official brand logos served by Simple Icons CDN.
// Dark brand marks (Express, Next.js, GitHub) get a light fill for the dark theme.
const LOGOS = {
  'JavaScript':   'javascript/F7DF1E',
  'TypeScript':   'typescript/3178C6',
  'Python':       'python/3776AB',
  'HTML & CSS':   'html5/E34F26',
  'SQL':          'mysql/4479A1',
  'React.js':     'react/61DAFB',
  'Node.js':      'nodedotjs/339933',
  'Express.js':   'express/D7E2EA',
  'Next.js':      'nextdotjs/D7E2EA',
  'Tailwind CSS': 'tailwindcss/06B6D4',
  'GSAP':         'gsap/0AE448',
  'MongoDB':      'mongodb/47A248',
  'PostgreSQL':   'postgresql/4169E1',
  'REST APIs':    null,
  'Git & GitHub': 'github/D7E2EA',
  'Docker':       'docker/2496ED',
}

const GENERIC_ICONS = {
  'REST APIs': (
    <svg viewBox="0 0 24 24" fill="rgba(215,226,234,0.6)" className="w-4 h-4 shrink-0" aria-hidden="true">
      <path d="M14 12l-2 2-2-2 2-2 2 2zm-2-6l2.12 2.12 2.5-2.5L12 1 7.38 5.62l2.5 2.5L12 6zm-6 6l2.12-2.12-2.5-2.5L1 12l4.62 4.62 2.5-2.5L6 12zm12 0l-2.12 2.12 2.5 2.5L23 12l-4.62-4.62-2.5 2.5L18 12zm-6 6l-2.12-2.12-2.5 2.5L12 23l4.62-4.62-2.5-2.5L12 18z"/>
    </svg>
  ),
}

const SkillIcon = ({ label }) => {
  const logo = LOGOS[label]
  if (logo) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${logo}`}
        alt=""
        loading="lazy"
        decoding="async"
        className="w-4 h-4 shrink-0 select-none pointer-events-none"
        draggable={false}
        aria-hidden="true"
      />
    )
  }
  return GENERIC_ICONS[label] ?? null
}

const SKILLS = [
  ['JavaScript', 'TypeScript', 'Python', 'HTML & CSS', 'SQL'],
  ['React.js', 'Node.js', 'Express.js', 'Next.js', 'Tailwind CSS', 'GSAP'],
  ['MongoDB', 'PostgreSQL', 'REST APIs', 'Git & GitHub', 'Docker'],
]

const SkillPill = ({ label }) => (
  <span
    data-skill-pill
    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full
               border-2 font-light text-sm
               whitespace-nowrap
               transition-all duration-300 will-change-transform
               cursor-default select-none
               hover:-translate-y-1 hover:scale-[1.06]
               hover:!border-[rgba(182,0,168,0.55)] hover:!bg-[rgba(182,0,168,0.1)] hover:!text-[rgba(215,226,234,1)]
               hover:shadow-[0_6px_20px_rgba(182,0,168,0.25)]"
    style={{
      borderColor: 'rgba(215,226,234,0.2)',
      color: 'rgba(215,226,234,0.75)',
      backgroundColor: 'rgba(215,226,234,0.04)',
      opacity: 0,
    }}
  >
    <SkillIcon label={label} />
    {label}
  </span>
)

const Skills = () => {
  const rowsRef = useRef(null)

  useEffect(() => {
    const el = rowsRef.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('[data-skill-pill]'),
        { opacity: 0, y: 26, scale: 0.85 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: 'back.out(1.7)',
          stagger: { each: 0.05, from: 'start' },
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      )
    }, el)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="skills"
      className="relative w-full px-5 sm:px-8 lg:px-16
                 py-20 sm:py-28 lg:py-36"
      style={{ zIndex: 10 }}
    >
      <div className="relative w-full max-w-5xl mx-auto">

        <FadeIn delay={0} y={40}>
          <h2
            className="hero-heading font-black uppercase text-center leading-none tracking-tight mb-12 sm:mb-16 md:mb-20"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            Skills
          </h2>
        </FadeIn>

        <div ref={rowsRef} className="flex flex-col gap-4 sm:gap-5">
          {SKILLS.map((row, i) => (
            <div
              key={i}
              className="flex flex-wrap justify-center gap-2.5 sm:gap-3"
            >
              {row.map((label) => (
                <SkillPill key={label} label={label} />
              ))}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Skills
