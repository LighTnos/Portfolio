import React, { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getProjects, trackProjectView, BACKEND_URL } from '../api'
import FadeIn from './ui/FadeIn.jsx'
import LiveProjectButton from './ui/LiveProjectButton.jsx'

gsap.registerPlugin(ScrollTrigger)

const safeUrl = (url) => {
  if (!url) return null
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? url : null
  } catch {
    return null
  }
}

// Subtle gradient fills for placeholder image panels
const PANEL_GRADIENTS = [
  'linear-gradient(135deg, rgba(182,0,168,0.25) 0%, rgba(118,33,176,0.2) 55%, rgba(190,76,0,0.15) 100%), #101014',
  'linear-gradient(135deg, rgba(118,33,176,0.25) 0%, rgba(182,0,168,0.15) 60%, rgba(24,1,31,0.6) 100%), #101014',
  'linear-gradient(135deg, rgba(190,76,0,0.2) 0%, rgba(182,0,168,0.18) 55%, rgba(118,33,176,0.2) 100%), #101014',
]

const CACHE_KEY = 'portfolio_projects'
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const getCachedProjects = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch {
    return null
  }
}

const setCachedProjects = (data) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch {
    /* storage full — ignore */
  }
}

const resolveImage = (imageUrl) => {
  if (!imageUrl) return null
  return imageUrl.startsWith('http') ? imageUrl : `${BACKEND_URL}${imageUrl}`
}

// ── Single stacking card ──────────────────────────────────────────────────────
const ProjectCard = ({ project, index, total, sectionRef, onProjectClick }) => {
  const wrapperRef = useRef(null)
  const cardRef = useRef(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const card = cardRef.current
    const section = sectionRef.current
    if (!wrapper || !card || !section) return

    const targetScale = 1 - (total - 1 - index) * 0.06

    const ctx = gsap.context(() => {
      // Deal-in: card flies up from below with a playing-card tilt,
      // straightening as it lands on the pile.
      if (index > 0) {
        gsap.fromTo(
          card,
          { y: 160, rotate: index % 2 === 0 ? 6 : -6 },
          {
            y: 0,
            rotate: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: wrapper,
              start: 'top bottom',
              end: 'top top',
              scrub: true,
            },
          }
        )
      }

      // As the next cards slide over this one, push it "to the bottom":
      // shrink it and dim it so the incoming card clearly stacks on top.
      gsap.fromTo(
        card,
        { scale: 1, filter: 'brightness(1)' },
        {
          scale: targetScale,
          filter: 'brightness(0.45)',
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            endTrigger: section,
            end: 'bottom bottom',
            scrub: true,
          },
        }
      )
    }, wrapper)

    return () => ctx.revert()
  }, [index, total, sectionRef])

  const number = String(index + 1).padStart(2, '0')
  const imageSrc = resolveImage(project.imageUrl)
  const liveUrl = safeUrl(project.liveDemoUrl)
  const githubUrl = safeUrl(project.githubUrl)
  const gradient = PANEL_GRADIENTS[index % PANEL_GRADIENTS.length]

  return (
    <div
      ref={wrapperRef}
      className="sticky top-0 h-screen flex items-center justify-center"
      style={{ zIndex: index + 1 }}
    >
      <div
        ref={cardRef}
        className="stack-card group w-full overflow-hidden
                   rounded-[36px] sm:rounded-[44px] md:rounded-[52px]
                   border border-[rgba(215,226,234,0.18)]
                   flex flex-col md:flex-row
                   transition-colors duration-500 hover:border-[rgba(182,0,168,0.6)]"
        style={{
          background:
            'linear-gradient(145deg, rgba(215,226,234,0.05) 0%, rgba(12,12,12,0) 45%), #101014',
          transformOrigin: 'center center',
          willChange: 'transform',
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        }}
      >
        {/* ── Visual side ── */}
        <div className="relative md:w-[55%] overflow-hidden h-[220px] sm:h-[280px] md:h-auto md:min-h-[480px]">
          {imageSrc ? (
            <>
              {/* blurred fill backdrop so any aspect ratio looks intentional */}
              <img
                src={imageSrc}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl"
                style={{ opacity: 0.5, background: '#101014' }}
              />
              {/* full screenshot, never cropped */}
              <img
                src={imageSrc}
                alt={project.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-contain p-4 sm:p-6
                           transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
              />
            </>
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: gradient }}
            >
              <span
                className="ticker-outline font-black uppercase text-center px-6 leading-none"
                style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}
              >
                {project.title.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          )}

          {/* gradient scrim so the visual melts into the card */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(16,16,20,0.55) 0%, transparent 35%), linear-gradient(to right, transparent 70%, rgba(16,16,20,0.4) 100%)',
            }}
          />

          {/* domain tag pinned on the image */}
          <span
            className="absolute top-5 left-5 sm:top-6 sm:left-6 inline-flex items-center gap-2
                       px-3.5 py-1.5 rounded-full backdrop-blur-md
                       font-medium uppercase tracking-[0.18em]"
            style={{
              background: 'rgba(12,12,12,0.55)',
              border: '1px solid rgba(215,226,234,0.2)',
              color: 'rgba(215,226,234,0.85)',
              fontSize: 'clamp(0.55rem, 1vw, 0.7rem)',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                background: 'linear-gradient(135deg, #B600A8, #BE4C00)',
                clipPath:
                  'polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)',
              }}
            />
            {project.domain}
          </span>
        </div>

        {/* ── Content side ── */}
        <div className="relative flex-1 flex flex-col gap-4 sm:gap-5 p-6 sm:p-8 md:p-10">
          {/* giant watermark number */}
          <span
            aria-hidden="true"
            className="ticker-outline absolute -top-2 right-4 sm:right-6 font-black leading-none select-none pointer-events-none
                       transition-transform duration-500 group-hover:-translate-y-2"
            style={{ fontSize: 'clamp(5rem, 12vw, 11rem)', opacity: 0.55 }}
          >
            {number}
          </span>

          <div className="flex flex-col gap-3 sm:gap-4 mt-8 sm:mt-12 md:mt-16 relative z-10">
            <h3
              className="hero-heading font-black uppercase leading-[0.95] tracking-tight
                         transition-transform duration-300 group-hover:translate-x-1"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3.4rem)' }}
            >
              {project.title}
            </h3>

            {project.description && (
              <p
                className="font-light leading-relaxed max-w-xl"
                style={{
                  color: 'rgba(215,226,234,0.55)',
                  fontSize: 'clamp(0.85rem, 1.4vw, 1.05rem)',
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {project.description}
              </p>
            )}
          </div>

          {/* tech stack */}
          <div className="flex flex-wrap gap-2 relative z-10">
            {(project.techStack || []).slice(0, 6).map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-full border font-light uppercase tracking-wider whitespace-nowrap
                           transition-all duration-300 hover:-translate-y-0.5
                           hover:border-[rgba(182,0,168,0.6)] hover:text-white hover:bg-[rgba(182,0,168,0.08)]"
                style={{
                  borderColor: 'rgba(215,226,234,0.2)',
                  color: 'rgba(215,226,234,0.65)',
                  fontSize: 'clamp(0.6rem, 1vw, 0.75rem)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          {/* CTAs pinned to the bottom */}
          <div className="flex flex-wrap items-center gap-3 mt-auto pt-2 relative z-10">
            {liveUrl && (
              <LiveProjectButton href={liveUrl} onClick={() => onProjectClick(project)} />
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onProjectClick(project)}
                className="inline-flex items-center gap-2 font-medium uppercase tracking-widest
                           text-sm px-4 py-3 opacity-70 hover:opacity-100
                           transition-all duration-300 hover:translate-x-1"
                style={{ color: '#D7E2EA' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.4.6.1.82-.26.82-.58v-2.03c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Code
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────
const Projects = () => {
  const sectionRef = useRef(null)

  const cached = getCachedProjects()
  const [projects, setProjects] = useState(() => cached || [])
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects()
        const list = data.projects || []
        setCachedProjects(list)
        setProjects(list)
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // Sticky layout changed after load — refresh trigger positions
  useEffect(() => {
    if (!loading) ScrollTrigger.refresh()
  }, [loading, projects])

  const handleProjectClick = (project) => {
    trackProjectView(project._id, project.title).catch(() => {})
  }

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative z-10 rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]
                 -mt-10 sm:-mt-12 md:-mt-14
                 px-5 sm:px-8 md:px-10 pt-20 sm:pt-24 md:pt-32 pb-24 sm:pb-32"
      style={{ backgroundColor: '#0C0C0C' }}
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="hero-heading font-black uppercase text-center leading-none tracking-tight
                     mb-16 sm:mb-20 md:mb-28"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Projects
        </h2>
      </FadeIn>

      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full h-64 sm:h-80 rounded-[40px] sm:rounded-[50px] md:rounded-[60px]
                           border-2 animate-pulse"
                style={{ borderColor: 'rgba(215,226,234,0.2)', background: 'rgba(215,226,234,0.03)' }}
              />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-center font-light" style={{ color: 'rgba(215,226,234,0.4)' }}>
            Projects coming soon...
          </p>
        ) : (
          projects.map((project, i) => (
            <ProjectCard
              key={project._id}
              project={project}
              index={i}
              total={projects.length}
              sectionRef={sectionRef}
              onProjectClick={handleProjectClick}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default Projects
