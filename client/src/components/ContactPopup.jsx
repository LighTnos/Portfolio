import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE = import.meta.env.VITE_EMAILJS_SERVICE
const EMAILJS_TEMPLATE_NOTIFY = import.meta.env.VITE_EMAILJS_TEMPLATE_NOTIFY
const EMAILJS_TEMPLATE_REPLY = import.meta.env.VITE_EMAILJS_TEMPLATE_REPLY
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const ContactPopup = ({ isOpen, onClose }) => {
    const overlayRef = useRef(null)
    const modalRef = useRef(null)
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [status, setStatus] = useState('idle')
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' && window.innerWidth < 768
    )

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = ''
            return
        }
        document.body.style.overflow = 'hidden'
        setForm({ name: '', email: '', message: '' })
        setStatus('idle')

        gsap.set(modalRef.current, { clearProps: 'all' })
        gsap.set(overlayRef.current, { opacity: 0 })
        gsap.set(modalRef.current, { opacity: 0, scale: 0.96 })
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' })
        gsap.to(modalRef.current, { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out', delay: 0.05 })
    }, [isOpen])

    const handleClose = () => {
        gsap.to(modalRef.current, { opacity: 0, scale: 0.96, duration: 0.22, ease: 'power2.in' })
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.28, ease: 'power2.in', delay: 0.04, onComplete: onClose })
    }

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('sending')

        const templateParams = {
            name: form.name,
            email: form.email,
            to_email: form.email,  // explicit recipient for auto-reply
            to_name: form.name,
            message: form.message,
            year: new Date().getFullYear(),
        }

        try {
            // 1️⃣ Notify you — this is the one that matters
            await emailjs.send(
                EMAILJS_SERVICE,
                EMAILJS_TEMPLATE_NOTIFY,
                templateParams,
                EMAILJS_PUBLIC_KEY
            )
            // 2️⃣ Auto-reply to sender — non-fatal if it fails (e.g. bad address),
            // the message already reached the inbox.
            try {
                await emailjs.send(
                    EMAILJS_SERVICE,
                    EMAILJS_TEMPLATE_REPLY,
                    templateParams,
                    EMAILJS_PUBLIC_KEY
                )
            } catch {
                /* auto-reply failed — ignore */
            }
            setForm({ name: '', email: '', message: '' })
            setStatus('sent')
        } catch {
            setStatus('error')
        }
    }

    if (!isOpen) return null

    const inputCls = `w-full rounded-2xl font-light
                      outline-none transition-all duration-300
                      focus:shadow-[0_0_0_3px_rgba(182,0,168,0.15)]`

    const inputStyle = {
        padding: '12px 16px', fontSize: 14, letterSpacing: '-0.01em',
        color: '#D7E2EA',
        background: 'rgba(215,226,234,0.04)',
        border: '1px solid rgba(215,226,234,0.12)',
    }
    const inputFocus = (e) => {
        e.target.style.borderColor = 'rgba(182,0,168,0.6)'
        e.target.style.background = 'rgba(182,0,168,0.06)'
    }
    const inputBlur = (e) => {
        e.target.style.borderColor = 'rgba(215,226,234,0.12)'
        e.target.style.background = 'rgba(215,226,234,0.04)'
    }

    const labelStyle = {
        color: 'rgba(215,226,234,0.45)', fontSize: 10, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.18em', paddingLeft: 2,
    }

    const ghostBtnStyle = {
        marginTop: 4, padding: '10px 28px', borderRadius: 999,
        background: 'transparent', border: '2px solid rgba(215,226,234,0.4)',
        color: '#D7E2EA', fontSize: 12, fontWeight: 500,
        cursor: 'pointer', letterSpacing: '0.14em', textTransform: 'uppercase',
        transition: 'all 0.25s',
    }

    return (
        /* ── Backdrop ── */
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) handleClose() }}
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: isMobile ? '16px' : '32px',
                backgroundColor: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            {/* ── Modal ── */}
            <div
                ref={modalRef}
                style={{
                    position: 'relative',
                    width: isMobile ? 'calc(100vw - 32px)' : 'min(860px, calc(100vw - 64px))',
                    maxHeight: '92dvh',
                    overflowY: 'auto',
                    borderRadius: '32px',
                    background: 'rgba(12,12,12,0.94)',
                    border: '2px solid rgba(215,226,234,0.25)',
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.85), 0 0 80px rgba(182,0,168,0.12)',
                }}
            >
                {/* ambient brand glow */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '32px',
                    background: 'radial-gradient(ellipse 60% 50% at 15% 100%, rgba(182,0,168,0.1) 0%, rgba(118,33,176,0.05) 45%, transparent 70%)',
                }} />

                {/* top gradient shimmer */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 2, pointerEvents: 'none',
                    background: 'linear-gradient(90deg, transparent 5%, #B600A8 35%, #7621B0 60%, #BE4C00 80%, transparent 95%)',
                    opacity: 0.7,
                }} />

                {/* ── Close button (always top-right) ── */}
                <button
                    onClick={handleClose}
                    aria-label="Close"
                    className="hover:scale-110 hover:!border-[rgba(182,0,168,0.6)] hover:!text-white"
                    style={{
                        position: 'absolute', top: 20, right: 20, zIndex: 10,
                        width: 36, height: 36, borderRadius: '50%',
                        border: '1px solid rgba(215,226,234,0.2)',
                        background: 'rgba(215,226,234,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(215,226,234,0.6)', cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* ── Layout: single col on mobile, two col on desktop ── */}
                <div style={{
                    display: isMobile ? 'block' : 'grid',
                    gridTemplateColumns: isMobile ? undefined : '1fr 1.4fr',
                }}>

                    {/* ── LEFT: info panel ── */}
                    <div style={{
                        padding: isMobile ? '32px 24px 20px' : '48px 40px 48px 44px',
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between', gap: 24,
                        borderRight: isMobile ? 'none' : '1px solid rgba(215,226,234,0.08)',
                        borderBottom: isMobile ? '1px solid rgba(215,226,234,0.08)' : 'none',
                    }}>
                        <div>
                            <p style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                color: 'rgba(215,226,234,0.45)', fontSize: 11, fontWeight: 500,
                                textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 14,
                            }}>
                                <span style={{
                                    width: 8, height: 8, display: 'inline-block',
                                    background: 'linear-gradient(135deg, #B600A8, #BE4C00)',
                                    clipPath: 'polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)',
                                }} />
                                Contact
                            </p>
                            <h2
                                className="hero-heading font-black uppercase"
                                style={{
                                    margin: 0,
                                    fontSize: isMobile ? '1.9rem' : 'clamp(1.9rem, 3.2vw, 2.8rem)',
                                    letterSpacing: '-0.02em', lineHeight: 1.05,
                                }}
                            >
                                Let's build<br />something great.
                            </h2>
                            <p style={{
                                color: 'rgba(215,226,234,0.45)', fontWeight: 300, marginTop: 16,
                                fontSize: isMobile ? 13 : 'clamp(13px, 1.1vw, 15px)',
                                letterSpacing: '-0.01em', lineHeight: 1.6,
                            }}>
                                I'll get back to you within 24 hours. Whether it's a project idea, a question, or just a hello.
                            </p>
                        </div>

                        {/* contact info chips */}
                        {!isMobile && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '9px 14px', borderRadius: 999,
                                    background: 'rgba(215,226,234,0.04)',
                                    border: '1px solid rgba(215,226,234,0.12)',
                                }}>
                                    <svg width="13" height="13" fill="none" stroke="rgba(215,226,234,0.5)" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span style={{ color: 'rgba(215,226,234,0.55)', fontSize: 12, fontWeight: 300, letterSpacing: '-0.01em' }}>
                                        udit.2012005@gmail.com
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    padding: '9px 14px', borderRadius: 999,
                                    background: 'rgba(182,0,168,0.06)',
                                    border: '1px solid rgba(182,0,168,0.25)',
                                }}>
                                    <span className="relative flex h-2 w-2">
                                        <span
                                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                                            style={{ backgroundColor: '#4ade80' }}
                                        />
                                        <span
                                            className="relative inline-flex rounded-full h-2 w-2"
                                            style={{ backgroundColor: '#4ade80' }}
                                        />
                                    </span>
                                    <span style={{ color: 'rgba(215,226,234,0.65)', fontSize: 12, fontWeight: 300, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        Available for freelance
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: form ── */}
                    <div style={{ padding: isMobile ? '20px 24px 28px' : '48px 44px 48px 40px' }}>
                        {status === 'error' ? (

                            /* error */
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: isMobile ? 'auto' : '100%', textAlign: 'center', padding: '24px 0' }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: '50%',
                                    background: 'rgba(190,76,0,0.12)', border: '1px solid rgba(190,76,0,0.4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="22" height="22" fill="none" stroke="#BE4C00" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <p style={{ color: '#D7E2EA', fontWeight: 500, fontSize: 17, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Something went wrong</p>
                                <p style={{ color: 'rgba(215,226,234,0.45)', fontSize: 13, fontWeight: 300 }}>
                                    Please try again or email me directly at<br />
                                    <span style={{ color: '#D7E2EA' }}>udit.2012005@gmail.com</span>
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="hover:!bg-[#D7E2EA] hover:!text-[#0C0C0C] hover:scale-[1.04] active:scale-95"
                                    style={ghostBtnStyle}
                                >
                                    Try again
                                </button>
                            </div>

                        ) : status === 'sent' ? (

                            /* success */
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, minHeight: isMobile ? 'auto' : '100%', textAlign: 'center', padding: '24px 0' }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(182,0,168,0.25), rgba(118,33,176,0.25))',
                                    border: '1px solid rgba(182,0,168,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <svg width="22" height="22" fill="none" stroke="#D7E2EA" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p style={{ color: '#D7E2EA', fontWeight: 500, fontSize: 17, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>Message sent!</p>
                                <p style={{ color: 'rgba(215,226,234,0.45)', fontSize: 13, fontWeight: 300 }}>
                                    Thanks for reaching out. I'll be in touch shortly.
                                </p>
                                <button
                                    onClick={handleClose}
                                    className="hover:!bg-[#D7E2EA] hover:!text-[#0C0C0C] hover:scale-[1.04] active:scale-95"
                                    style={ghostBtnStyle}
                                >
                                    Close
                                </button>
                            </div>

                        ) : (

                            /* form */
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

                                {[
                                    { field: 'Name', type: 'text', placeholder: 'Your name' },
                                    { field: 'Email', type: 'email', placeholder: 'your@email.com' },
                                ].map(({ field, type, placeholder }) => (
                                    <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                        <label style={labelStyle}>
                                            {field}
                                        </label>
                                        <input
                                            type={type} name={field.toLowerCase()} required
                                            value={form[field.toLowerCase()]} onChange={handleChange}
                                            onFocus={inputFocus} onBlur={inputBlur}
                                            placeholder={placeholder}
                                            className={inputCls}
                                            style={inputStyle}
                                        />
                                    </div>
                                ))}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                                    <label style={labelStyle}>
                                        Message
                                    </label>
                                    <textarea
                                        name="message" required
                                        rows={isMobile ? 4 : 5}
                                        value={form.message} onChange={handleChange}
                                        onFocus={inputFocus} onBlur={inputBlur}
                                        placeholder="What would you like to discuss?"
                                        className={`${inputCls} resize-none`}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'sending'}
                                    className="uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] will-change-transform"
                                    style={{
                                        width: '100%', padding: '14px', marginTop: 2,
                                        borderRadius: 999, fontWeight: 500, fontSize: 14,
                                        color: '#fff',
                                        background: 'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
                                        boxShadow: '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
                                        outline: '2px solid #FFFFFF',
                                        outlineOffset: '-3px',
                                        border: 'none',
                                        cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                                        opacity: status === 'sending' ? 0.55 : 1,
                                        transition: 'all 0.25s',
                                    }}
                                >
                                    {status === 'sending' ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <svg className="animate-spin" width="15" height="15" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Sending…
                                        </span>
                                    ) : 'Send Message'}
                                </button>

                            </form>
                        )}
                    </div>

                </div>

                {/* safe-area bottom gap */}
                <div style={{ height: 'env(safe-area-inset-bottom, 12px)' }} />
            </div>
        </div>
    )
}

export default ContactPopup
