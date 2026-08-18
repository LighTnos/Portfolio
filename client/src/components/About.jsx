import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import FadeIn from './ui/FadeIn.jsx'
import AnimatedText from './ui/AnimatedText.jsx'
import ContactButton from './ui/ContactButton.jsx'

const DECOR_BASE =
  'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7'

const ABOUT_TEXT =
  "With more than three years of experience in development, i focus on full-stack apps, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let's build something incredible together!"

/** Decorative 3D icon — gentle idle float, springy wiggle on hover. */
const DecorIcon = ({ src, className = '' }) => {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const float = gsap.to(el, {
      y: -12,
      duration: gsap.utils.random(2.2, 3.2),
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
      delay: gsap.utils.random(0, 1),
    })
    return () => float.kill()
  }, [])

  const onEnter = () => {
    gsap.to(ref.current, {
      scale: 1.18,
      rotation: gsap.utils.random(-12, 12),
      duration: 0.45,
      ease: 'back.out(2.5)',
    })
  }
  const onLeave = () => {
    gsap.to(ref.current, {
      scale: 1,
      rotation: 0,
      duration: 1,
      ease: 'elastic.out(1, 0.4)',
    })
  }

  return (
    <img
      ref={ref}
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      draggable={false}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`select-none cursor-pointer will-change-transform ${className}`}
    />
  )
}

const About = ({ onContact }) => {
  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center justify-center px-5 sm:px-8 md:px-10 py-20"
    >
      {/* ── Decorative corner 3D images ── */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] left-[1%] sm:left-[2%] md:left-[4%]"
      >
        <DecorIcon
          src={`${DECOR_BASE}/moon_icon.11395d36.png`}
          className="w-[120px] sm:w-[160px] md:w-[210px]"
        />
      </FadeIn>

      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%]"
      >
        <DecorIcon
          src={`${DECOR_BASE}/p59_1.4659672e.png`}
          className="w-[100px] sm:w-[140px] md:w-[180px]"
        />
      </FadeIn>

      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="absolute top-[4%] right-[1%] sm:right-[2%] md:right-[4%]"
      >
        <DecorIcon
          src={`${DECOR_BASE}/lego_icon-1.703bb594.png`}
          className="w-[120px] sm:w-[160px] md:w-[210px]"
        />
      </FadeIn>

      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%]"
      >
        <DecorIcon
          src={`${DECOR_BASE}/Group_134-1.2e04f3ce.png`}
          className="w-[130px] sm:w-[170px] md:w-[220px]"
        />
      </FadeIn>

      {/* ── Center content ── */}
      <div className="relative z-10 flex flex-col items-center text-center gap-10 sm:gap-14 md:gap-16">
        <FadeIn delay={0} y={40}>
          <h2
            className="hero-heading font-black uppercase leading-none tracking-tight"
            style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
          >
            About me
          </h2>
        </FadeIn>

        <div className="flex flex-col items-center gap-16 sm:gap-20 md:gap-24">
          <AnimatedText
            text={ABOUT_TEXT}
            className="font-medium text-center leading-relaxed max-w-[560px]"
            style={{ color: '#D7E2EA', fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
          />
          <ContactButton onClick={onContact} />
        </div>
      </div>
    </section>
  )
}

export default About
