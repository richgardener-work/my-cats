import { motion, useReducedMotion } from 'framer-motion'

export default function Tongue({ icon, label, onClick, disabled = false, ariaLabel }) {
  const reduced = useReducedMotion()

  const variants = reduced
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.22 } },
        exit: { opacity: 0, transition: { duration: 0.16 } },
      }
    : {
        hidden: { opacity: 0, y: -8, scale: 0.92 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
        exit: { opacity: 0, y: -6, scale: 0.94, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
      }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      className="absolute left-1/2 top-full z-[1] -translate-x-1/2 -mt-2 pointer-events-none"
      style={{ width: 168 }}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel ?? label}
        className="bg-morph pointer-events-auto flex w-full items-center justify-center gap-2 px-4 pb-3 pt-4 text-[13px] font-semibold text-white shadow-[0_14px_32px_rgba(232,121,180,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 84% 100%, 16% 100%)',
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
        }}
      >
        <span className="grid place-items-center">{icon}</span>
        <span>{label}</span>
      </button>
    </motion.div>
  )
}
