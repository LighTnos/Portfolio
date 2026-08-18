import React from 'react'

/**
 * Ghost/outline pill button used on project cards.
 * Renders an anchor when href is provided, otherwise a button.
 */
const LiveProjectButton = ({ href, onClick, label = 'Live Project', className = '' }) => {
  const cls = `inline-flex items-center justify-center rounded-full border-2 border-[#D7E2EA]
               text-[#D7E2EA] font-medium uppercase tracking-widest
               px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base
               will-change-transform transition-all duration-300
               hover:bg-[#D7E2EA] hover:text-[#0C0C0C] hover:scale-[1.04] active:scale-95 ${className}`

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>
        {label}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {label}
    </button>
  )
}

export default LiveProjectButton
