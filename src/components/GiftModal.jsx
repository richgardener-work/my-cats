import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useModalScrollLock } from '../hooks/useModalScrollLock'

const reduceMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function GiftModal({ milestone, onClose, theme }) {
  const open = !!milestone
  const reduce = reduceMotion()
  const [opened, setOpened] = useState(false)

  useModalScrollLock(open)

  useEffect(() => {
    if (open) setOpened(reduce)
  }, [open, milestone?.id, reduce])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-[rgba(10,4,20,0.6)] backdrop-blur-md" />
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-[380px] max-w-full rounded-[20px] p-[40px_30px_32px] shadow-2xl"
            style={{
              background: theme === 'dark' ? 'rgba(26,8,40,0.85)' : 'rgba(255,251,245,0.95)',
              backdropFilter: 'blur(16px) saturate(180%)',
              border: theme === 'dark' ? '1px solid rgba(199,125,255,0.2)' : '1px solid rgba(232,121,180,0.2)',
              color: theme === 'dark' ? '#F5EEF8' : '#2D1B28',
            }}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <X size={18} />
            </button>

            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <AnimatePresence mode="wait">
                {!opened ? (
                  <motion.button
                    key="box"
                    type="button"
                    onClick={() => setOpened(true)}
                    className="flex flex-col items-center gap-4 outline-none"
                    exit={{ scale: 1.4, opacity: 0, rotate: 8, transition: { duration: 0.35 } }}
                  >
                    <motion.span
                      className="text-[72px] leading-none"
                      animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      🎁
                    </motion.span>
                    <span className="text-sm opacity-70">Нажми, чтобы открыть</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="note"
                    initial={reduce ? false : { scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 240, damping: 20 } }}
                    className="flex flex-col items-center gap-4"
                  >
                    <h2 className="font-display font-wonky text-[26px] leading-tight">🎁 Твой подарок</h2>
                    <p className="whitespace-pre-line text-[15px] leading-relaxed opacity-90">
                      {milestone.text}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
