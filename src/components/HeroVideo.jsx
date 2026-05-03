import { useEffect, useRef, useState } from 'react'
import MeshGradient from './decor/MeshGradient'
import PaperNoise from './decor/PaperNoise'
import { useTheme } from '../hooks/useTheme'

const BASE = import.meta.env.BASE_URL

export default function HeroVideo({
  src = `${BASE}cat-hero.mp4`,
}) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)
  const { dark } = useTheme()

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const onVis = () => document.hidden ? v.pause() : v.play().catch(() => {})
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (failed) {
    return (
      <div className="absolute inset-0">
        <MeshGradient />
      </div>
    )
  }

  return (
    <>
      {/* 1. Video — softly desaturated so any footage blends to the palette */}
      <video
        ref={ref}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        className="ken-burns absolute inset-0 h-full w-full object-cover"
        style={{ filter: 'saturate(0.85) brightness(0.85) contrast(1.04)' }}
      />

      {/* 2. Color tint — paints any footage in pink/purple palette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, rgba(232,121,180,0.18), rgba(199,125,255,0.22))',
          transform: 'translateZ(0)',
        }}
      />

      {/* 3. Dark moody vignette — unconditional, keeps white text readable */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10,4,20,0.35) 0%, rgba(10,4,20,0.72) 100%)',
          transform: 'translateZ(0)',
        }}
      />

      {/* 4. Theme-colored top+bottom fade — smooth transition into header and next section */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: dark
            ? 'linear-gradient(to bottom, rgba(10,4,20,0.85) 0%, transparent 18%, transparent 72%, rgba(10,4,20,0.95) 100%)'
            : 'linear-gradient(to bottom, rgba(253,245,237,0.75) 0%, transparent 20%, transparent 74%, rgba(253,245,237,0.98) 100%)',
          transform: 'translateZ(0)',
        }}
      />

      {/* 5. Grain — same texture as the rest of the site */}
      <PaperNoise opacity={0.1} blend="overlay" />
    </>
  )
}
