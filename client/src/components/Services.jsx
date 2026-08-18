import React from 'react'
import FadeIn from './ui/FadeIn.jsx'

const SERVICES = [
  {
    number: '01',
    name: 'Full-Stack Development',
    description:
      'End-to-end web applications built on the MERN stack — from database design and REST APIs to polished, production-ready frontends.',
  },
  {
    number: '02',
    name: 'Web Design',
    description:
      'Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience.',
  },
  {
    number: '03',
    name: 'Motion & Interaction',
    description:
      'Dynamic animations and scroll-driven interactions that add energy and storytelling to brands, products, and digital experiences.',
  },
  {
    number: '04',
    name: 'API & Backend',
    description:
      'Robust Node.js and Express backends with authentication, integrations, and scalable data models built on MongoDB.',
  },
  {
    number: '05',
    name: 'AI Integration',
    description:
      'Embedding AI-powered features into products — from intelligent content generation to automation that saves real time.',
  },
]

const Services = () => {
  return (
    <section
      id="services"
      className="relative rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px]
                 px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <FadeIn delay={0} y={40}>
        <h2
          className="font-black uppercase text-center leading-none tracking-tight mb-16 sm:mb-20 md:mb-28"
          style={{ color: '#0C0C0C', fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          Services
        </h2>
      </FadeIn>

      <div className="max-w-5xl mx-auto">
        {SERVICES.map((service, i) => (
          <FadeIn key={service.number} delay={i * 0.1} y={30}>
            <div
              className="group flex flex-col sm:flex-row items-start gap-2 sm:gap-8 md:gap-12
                         py-8 sm:py-10 md:py-12 cursor-default"
              style={{
                borderTop: '1px solid rgba(12, 12, 12, 0.15)',
                borderBottom: i === SERVICES.length - 1 ? '1px solid rgba(12, 12, 12, 0.15)' : 'none',
              }}
            >
              <span
                className="font-black leading-none shrink-0 text-[#0C0C0C]
                           transition-all duration-300 group-hover:text-[#B600A8] group-hover:-translate-y-1"
                style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
              >
                {service.number}
              </span>
              <div className="flex flex-col gap-2 sm:gap-3 sm:pt-2 md:pt-4 transition-transform duration-300 group-hover:translate-x-2">
                <h3
                  className="font-medium uppercase"
                  style={{ color: '#0C0C0C', fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
                >
                  {service.name}
                </h3>
                <p
                  className="font-light leading-relaxed max-w-2xl transition-opacity duration-300 opacity-60 group-hover:opacity-90"
                  style={{ color: '#0C0C0C', fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)' }}
                >
                  {service.description}
                </p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}

export default Services
