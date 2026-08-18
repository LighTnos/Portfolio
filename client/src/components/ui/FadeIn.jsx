import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * GSAP-powered fade-in-on-view wrapper.
 * Replicates a Framer Motion whileInView fade with configurable offset.
 *
 * Props: delay (s), duration (s, default 0.7), x, y (px offsets), as (tag), className, style
 */
const FadeIn = ({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  as: Tag = 'div',
  className = '',
  style,
}) => {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, x, y },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 95%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      )
    }, el)
    return () => ctx.revert()
  }, [delay, duration, x, y])

  return React.createElement(
    Tag,
    { ref, className, style: { opacity: 0, ...style } },
    children
  )
}

export default FadeIn
