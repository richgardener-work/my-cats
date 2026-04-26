import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, PawPrint } from 'lucide-react'
import { useCats } from '../../hooks/useCats'

export default function PhotoCard({ photo, onOpen, onDelete }) {
  const { cats } = useCats()
  const names = (photo.catIds || [])
    .map(id => cats.find(c => c.id === id)?.name)
    .filter(Boolean)

  const expired = !photo.imageUrl
  const [removing, setRemoving] = useState(false)
  const timer = useRef(null)
  const fired = useRef(false)

  useEffect(() => {
    if (!removing) return
    const onDocClick = () => setRemoving(false)
    const onKey = (e) => { if (e.key === 'Escape') setRemoving(false) }
    const t = setTimeout(() => document.addEventListener('click', onDocClick), 0)
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [removing])

  const start = () => {
    fired.current = false
    if (!onDelete) return
    timer.current = setTimeout(() => {
      fired.current = true
      setRemoving(true)
    }, 500)
  }
  const cancel = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
  }
  const handleClick = (e) => {
    if (fired.current) {
      e.stopPropagation()
      fired.current = false
      return
    }
    if (removing) { setRemoving(false); return }
    if (!expired) onOpen(photo)
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ y: -6, rotate: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        onMouseDown={start}
        onMouseUp={cancel}
        onMouseLeave={cancel}
        onTouchStart={start}
        onTouchEnd={cancel}
        onTouchCancel={cancel}
        onContextMenu={(e) => { if (onDelete) e.preventDefault() }}
        aria-label={expired ? 'Photo expired' : `View photo${names.length ? ` of ${names.join(', ')}` : ''}`}
        className="group relative flex w-full flex-col rounded-md bg-light-cream p-2 pb-8 shadow-md dark:bg-dark-card dark:shadow-2xl"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-black/10 dark:bg-white/5">
          {expired ? (
            <div className="grid h-full w-full place-items-center text-center text-xs opacity-60 p-4">
              Photo expired — reload lost the file. Re-upload to keep it.
            </div>
          ) : (
            <>
              <img src={photo.imageUrl} alt="" className="h-full w-full object-cover"/>
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100"/>
              <div aria-hidden className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-white/90 scale-90 transition group-hover:scale-100">
                  <Play size={22} className="text-[#E879B4] ml-0.5"/>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="absolute bottom-2 left-0 right-0 grid place-items-center">
          {names.length > 0 ? (
            <span className="font-hand text-xl text-[#E879B4]">{names.join(' · ')}</span>
          ) : (
            <PawPrint size={20} className="text-[#E879B4]" aria-label="Untagged"/>
          )}
        </div>
      </motion.button>
      <AnimatePresence>
        {removing && onDelete && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            onClick={(e) => { e.stopPropagation(); onDelete(photo); setRemoving(false) }}
            aria-label="Delete photo"
            className="absolute -top-2 -right-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-red-500 text-white shadow-lg"
          >
            <X size={14} strokeWidth={3}/>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
