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

      {/* Liquid Glass tints toolbar with the solid base read from the fixed parent;
          mask gradient overlays out of the safe-area-inset-bottom zone so the
          visible strip below the toolbar matches that tint exactly. */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: 'calc(env(safe-area-inset-bottom) + 60px)',
          backgroundColor: baseColor,
          WebkitMaskImage:
            'linear-gradient(to top, black 0, black env(safe-area-inset-bottom), transparent 100%)',
          maskImage:
            'linear-gradient(to top, black 0, black env(safe-area-inset-bottom), transparent 100%)',
        }}
      />
    </div>
  )
}
