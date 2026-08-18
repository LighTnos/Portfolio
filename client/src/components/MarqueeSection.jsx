import React, { useRef, useEffect } from 'react'

const ROW_1_ITEMS = ['Full-Stack Developer', 'UI Animation', '3D Web', 'MERN Stack', 'Creative Coding']
const ROW_2_ITEMS = ['React', 'Node.js', 'MongoDB', 'Express', 'GSAP', 'Three.js', 'Tailwind CSS']

const TickerRow = ({ items, rowRef, outlined = false }) => (
  <div ref={rowRef} className="flex w-max items-center" style={{ willChange: 'transform' }}>
    {[...Array(3)].map((_, rep) => (
      <React.Fragment key={rep}>
        {items.map((item, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span
              className={`uppercase font-black tracking-tight whitespace-nowrap leading-none ${
                outlined ? 'ticker-outline' : 'hero-heading'
              }`}
              style={{ fontSize: 'clamp(2.2rem, 6vw, 5.5rem)' }}
            >
              {item}
            </span>
            <span
              aria-hidden="true"
              className="mx-5 sm:mx-8 shrink-0"
              style={{
                width: 'clamp(10px, 1.4vw, 18px)',
                height: 'clamp(10px, 1.4vw, 18px)',
                background: 'linear-gradient(135deg, #B600A8, #BE4C00)',
                clipPath: 'polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)',
              }}
            />
          </span>
        ))}
      </React.Fragment>
    ))}
  </div>
)

/**
 * Scroll-driven text ticker — row 1 (gradient fill) drifts right,
 * row 2 (outlined) drifts left. DOM-driven, no React re-renders.
 */
const MarqueeSection = () => {
  const sectionRef = useRef(null)
  const row1Ref = useRef(null)
  const row2Ref = useRef(null)

  useEffect(() => {
    let raf = 0

    const update = () => {
      raf = 0
      const section = sectionRef.current
      if (!section) return
      const sectionTop = section.offsetTop
      const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.25
      if (row1Ref.current) row1Ref.current.style.transform = `translateX(${-800 + offset}px)`
      if (row2Ref.current) row2Ref.current.style.transform = `translateX(${-offset}px)`
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden"
      style={{ backgroundColor: '#0C0C0C' }}
    >
      <div className="flex flex-col gap-4 sm:gap-6 -rotate-2">
        <TickerRow items={ROW_1_ITEMS} rowRef={row1Ref} />
        <TickerRow items={ROW_2_ITEMS} rowRef={row2Ref} outlined />
      </div>
    </section>
  )
}

export default MarqueeSection
