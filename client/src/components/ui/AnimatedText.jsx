import React, { useRef, useEffect, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Character-by-character scroll-driven reveal.
 * Each character goes from opacity 0.2 to 1, scrubbed by scroll progress
 * (equivalent to Framer Motion useScroll offset ['start 0.8', 'end 0.2']).
 * Words are kept whole so text wraps naturally on all screens.
 */
const AnimatedText = ({ text, className = '', style }) => {
  const ref = useRef(null)

  const words = useMemo(() => text.split(' '), [text])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const chars = el.querySelectorAll('[data-char]')
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { opacity: 0.2 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.03,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: true,
          },
        }
      )
    }, el)
    return () => ctx.revert()
  }, [text])

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, wi) => (
        <React.Fragment key={wi}>
          <span className="inline-block whitespace-nowrap">
            {word.split('').map((ch, ci) => (
              <span key={ci} data-char style={{ opacity: 0.2 }}>
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </p>
  )
}

export default AnimatedText
