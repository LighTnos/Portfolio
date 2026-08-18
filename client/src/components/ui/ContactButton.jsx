import React from 'react'

/**
 * Gradient pill CTA button — the primary action of the new design.
 */
const ContactButton = ({ onClick, label = 'Contact Me', type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    className={`rounded-full text-white font-medium uppercase tracking-widest
                px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4
                text-xs sm:text-sm md:text-base
                cursor-pointer will-change-transform
                transition-transform duration-300 hover:scale-[1.06] active:scale-95 ${className}`}
    style={{
      background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
      boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
      outline: '2px solid #FFFFFF',
      outlineOffset: '-3px',
    }}
  >
    {label}
  </button>
)

export default ContactButton
