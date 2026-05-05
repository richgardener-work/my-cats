import { useEffect, useRef, useState } from 'react'
import MeshGradient from './decor/MeshGradient'
import PaperNoise from './decor/PaperNoise'
import { useTheme } from '../hooks/useTheme'
import { desktopVideos, mobileVideos, pickRandom } from '../utils/heroVideos'

export default function HeroVideo() {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)
  const { dark } = useTheme()

  const [desktopSrc] = useState(() => pickRandom(desktopVideos))
  const [mobileSrc]  = useState(() => pickRandom(mobileVideos))

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const onVis = () => document.hidden ? v.pause() : v.play().catch(() => {})
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const onTime = () => {
      if (!v.duration) return
      const remaining = v.duration - v.currentTime
      if (remaining < 1.5)           v.style.opacity = remaining / 1.5
      else if (v.currentTime < 1.5)  v.style.opacity = v.currentTime / 1.5
      else                           v.style.opacity = 1
    }
    v.addEventListener('timeupdate', onTime)
    return () => v.removeEventListener('timeupdate', onTime)
  }, [])

  if (failed || (!desktopSrc && !mobileSrc)) {
    return (
      <div className="absolute inset-0">
        <MeshGradient />
      </div>
    )
  }

  return (
    <>
      <video
        ref={ref}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        className="ken-burns absolute inset-0 h-full w-full object-cover"
      >
        {mobileSrc  && <source media="(max-width: 767px)" src={mobileSrc}  type="video/mp4" />}
        {desktopSrc && <source src={desktopSrc} type="video/mp4" />}
      </video>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: dark
            ? [
                'linear-gradient(to bottom, rgba(10,4,20,0.85) 0%, transparent 18%, transparent 72%, rgba(10,4,20,0.95) 100%)',
                'radial-gradient(ellipse at center, rgba(10,4,20,0.35) 0%, rgba(10,4,20,0.72) 100%)',
                'linear-gradient(135deg, rgba(232,121,180,0.22), rgba(199,125,255,0.26))',
                'rgba(10,4,20,0.15)',
              ].join(',')
            : [
                'linear-gradient(to bottom, rgba(253,245,237,0.75) 0%, transparent 20%, transparent 74%, rgba(253,245,237,0.98) 100%)',
                'radial-gradient(ellipse at center, rgba(10,4,20,0.35) 0%, rgba(10,4,20,0.72) 100%)',
                'linear-gradient(135deg, rgba(232,121,180,0.22), rgba(199,125,255,0.26))',
                'rgba(10,4,20,0.15)',
              ].join(','),
          transform: 'translateZ(0)',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
      />

      <PaperNoise opacity={0.1} blend="overlay" />
    </>
  )
}
