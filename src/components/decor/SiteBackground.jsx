import MeshGradient from './MeshGradient'
import PaperNoise from './PaperNoise'

export default function SiteBackground({ dark }) {
  const baseColor = dark ? '#0A0414' : '#FDF5ED'
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundColor: baseColor }}
    >
      {/* iOS 26 Safari Liquid Glass семплирует background-color с этого fixed-parent
          для тинта top URL bar и bottom toolbar. Parent — solid baseColor, поэтому
          декоративные gradients/mesh/noise ограничиваем зоной между safe-area-inset.
          Soft-mask на 80px сверху и снизу = высота Safari toolbar: за toolbar всегда
          ≈ solid (не «прыгает» во время Liquid Glass-анимации). */}
      <div
        className="absolute inset-x-0"
        style={{
          top: 'env(safe-area-inset-top)',
          bottom: 'env(safe-area-inset-bottom)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)',
        }}
      >
        {dark ? (
          <>
            <MeshGradient />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(199,125,255,0.18), transparent 65%)',
              }}
            />
            <PaperNoise opacity={0.07} blend="overlay" />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232,121,180,0.28), transparent 60%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 55% 45% at 88% 25%, rgba(199,125,255,0.2), transparent 55%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 50% at 10% 80%, rgba(244,168,199,0.18), transparent 60%)',
              }}
            />
            <PaperNoise opacity={0.08} blend="multiply" />
          </>
        )}
      </div>
    </div>
  )
}
