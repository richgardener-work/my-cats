import { useEffect, useRef, useState } from 'react'
import MeshGradient from './decor/MeshGradient'

export default function HeroVideo({ src = '/cat-hero.mp4', poster = '/default_photo_16to9.png' }) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    const onVis = () => document.hidden ? v.pause() : v.play().catch(() => {})
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (failed) return <div className="absolute inset-0"><MeshGradient/></div>

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        autoPlay loop muted playsInline
        preload="metadata"
        onError={() => setFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ animation: 'ken-burns 30s ease-in-out infinite alternate' }}
      />
      <div aria-hidden className="absolute inset-0"
           style={{ background: 'radial-gradient(ellipse at center, rgba(10,4,20,0.2) 0%, rgba(10,4,20,0.6) 100%)' }}/>
      <style>{`@keyframes ken-burns { from { transform: scale(1); } to { transform: scale(1.08); } }`}</style>
    </>
  )
}
