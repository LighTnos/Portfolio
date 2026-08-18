import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const EXPERIENCE = [
  {
    role: 'Technical Lead',
    company: 'The Cloud Club',
    period: 'Feb 2025 – Present',
    description: 'Leading technical initiatives and mentoring developers across cloud infrastructure and web projects.',
  },
  {
    role: 'Web Developer',
    company: 'Nexathread',
    period: 'Jan 2025 – Present',
    description: 'Building and maintaining full-stack features for the platform using the MERN stack and REST APIs.',
  },
  {
    role: 'Web Development Intern',
    company: 'Nexathread',
    period: 'Apr 2023 – Jan 2025',
    description: 'Developed core frontend components, integrated backend APIs, and improved site performance across the product.',
  },
]

const Experience = () => {
  const sectionRef = useRef(null)
  const headingRef = useRef(null)
  const rowRefs    = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      )

      rowRefs.current.forEach((row, i) => {
        if (!row) return
        gsap.fromTo(
          row,
          { opacity: 0, y: 16 },
          {
            opacity: 1, y: 0,
            duration: 0.6,
            ease: 'power3.out',
            delay: i * 0.07,
            scrollTrigger: {
              trigger: row,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative w-full px-5 sm:px-8 lg:px-16
                 py-20 sm:py-28 lg:py-36"
      style={{ zIndex: 10 }}
    >
      <div className="w-full max-w-5xl mx-auto">

        {/* ── Heading ── */}
        <h2
          ref={headingRef}
          className="hero-heading font-black uppercase text-center leading-none tracking-tight mb-12 sm:mb-16 md:mb-20"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Experience
        </h2>

        {/* ── Rows ── */}
        <div className="flex flex-col">
          {EXPERIENCE.map((item, i) => (
            <div
              key={i}
              ref={(el) => (rowRefs.current[i] = el)}
              className="flex flex-col sm:flex-row sm:items-start sm:justify-between
                         gap-2 sm:gap-8
                         py-6 sm:py-8 lg:py-9
                         border-t border-[#D7E2EA]/15
                         last:border-b last:border-[#D7E2EA]/15
                         group cursor-default transition-colors duration-300 hover:border-[#D7E2EA]/40"
            >
              {/* Left: Role + description */}
              <div className="flex flex-col gap-1.5 transition-transform duration-300 group-hover:translate-x-2">
                <span
                  className="font-medium uppercase text-[#D7E2EA] transition-colors duration-300 group-hover:text-white"
                  style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                >
                  {item.role}
                </span>
                <p
                  className="font-light leading-relaxed max-w-md transition-colors duration-300 group-hover:text-[rgba(215,226,234,0.75)]"
                  style={{ color: 'rgba(215,226,234,0.5)', fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)' }}
                >
                  {item.description}
                </p>
              </div>

              {/* Right: Company + Period */}
              <div className="sm:text-right shrink-0 transition-transform duration-300 group-hover:-translate-x-1">
                <p
                  className="font-light uppercase tracking-wider transition-colors duration-300 group-hover:text-white"
                  style={{ color: 'rgba(215,226,234,0.75)', fontSize: 'clamp(0.85rem, 1.6vw, 1.15rem)' }}
                >
                  {item.company}
                </p>
                <p
                  className="font-light mt-0.5"
                  style={{ color: 'rgba(215,226,234,0.4)', fontSize: 'clamp(0.75rem, 1.4vw, 1rem)' }}
                >
                  {item.period}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Experience
