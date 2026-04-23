import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, Play, Star } from 'lucide-react'
import Footer from '../components/Footer'

const STEPS = [
  { Icon: LayoutGrid, step: '01', title: 'Upload a Photo', description: "Add your cat's photo to the gallery." },
  { Icon: Play, step: '02', title: 'Tap & Press Play', description: 'Choose a photo and hit the Play button.' },
  { Icon: Star, step: '03', title: 'Solve & Earn a Star', description: 'Complete the puzzle to earn up to 3 stars.' },
]

function RevealOnScroll({ children, delay = 0, className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 0,
        transform: 'translateY(1.5rem)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Hero — left-aligned editorial split ── */}
      <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
        {/* Gradient background (always visible behind video) */}
        <div className="absolute inset-0 bg-gradient-to-br from-light-pink via-light-purple to-[#9B72CF] dark:from-dark-bg dark:via-[#2D0B4E] dark:to-dark-bg" />
        {/* Optional video overlay */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          src="/my-cats/cat-video.mp4"
          autoPlay
          muted
          loop
          playsInline
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-black/30" />

        {/* Content — left-aligned, not centered */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 min-h-[calc(100dvh-4rem)] flex items-center">
          <div className="max-w-xl py-24">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white/90 text-[11px] uppercase tracking-[0.18em] font-medium mb-7">
              Private Collection
            </div>
            <h1 className="font-heading text-5xl md:text-6xl xl:text-7xl font-bold text-white leading-tight mb-5">
              My Cats
            </h1>
            <p className="text-base md:text-lg text-white/70 mb-10 leading-relaxed max-w-sm">
              Your personal cat gallery &amp; sliding puzzle adventure.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/gallery"
                className="px-6 py-3 rounded-full bg-white text-light-text font-semibold text-sm hover:bg-white/90 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] shadow-sm"
              >
                Explore Gallery
              </Link>
              <Link
                to="/games"
                className="px-6 py-3 rounded-full border border-white/55 text-white font-semibold text-sm hover:bg-white/10 hover:border-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]"
              >
                Play Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works — numbered rows, not 3-column grid ── */}
      <section className="py-28 px-4">
        <div className="max-w-3xl mx-auto">
          <RevealOnScroll>
            <p className="text-[11px] uppercase tracking-[0.2em] font-medium text-light-pink dark:text-dark-purple mb-3">
              How it works
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-16">
              Three steps to fun
            </h2>
          </RevealOnScroll>

          <div className="flex flex-col">
            {STEPS.map(({ Icon, step, title, description }, i) => (
              <RevealOnScroll key={title} delay={i * 120}>
                <div className="group flex items-start gap-6 sm:gap-8 py-8 border-t border-light-pink/20 dark:border-dark-purple/15 hover:border-light-pink/45 dark:hover:border-dark-purple/35 transition-colors duration-300">
                  {/* Step number */}
                  <span className="font-heading text-3xl sm:text-4xl font-bold text-light-pink/25 dark:text-dark-purple/25 w-10 sm:w-12 shrink-0 leading-none mt-1 select-none group-hover:text-light-pink/50 dark:group-hover:text-dark-purple/50 transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    {step}
                  </span>
                  {/* Icon with inner refraction */}
                  <div className="shrink-0 w-11 h-11 rounded-[14px] bg-gradient-to-br from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <Icon size={18} strokeWidth={1.5} className="text-white" />
                  </div>
                  {/* Text */}
                  <div className="flex-1 pt-0.5">
                    <h3 className="font-heading text-lg font-semibold mb-1.5">{title}</h3>
                    <p className="text-sm text-light-text/55 dark:text-dark-text/55 leading-relaxed">{description}</p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
            <div className="border-t border-light-pink/20 dark:border-dark-purple/15" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
