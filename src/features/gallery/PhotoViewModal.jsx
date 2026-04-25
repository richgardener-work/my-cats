import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Play, Trash2 } from 'lucide-react'
import { useCats } from '../../hooks/useCats'
import { usePhotos } from '../../hooks/usePhotos'
import { useTheme } from '../../hooks/useTheme'

const DIFFICULTIES = [
  { label: '3×3', value: '3x3' },
  { label: '4×4', value: '4x4' },
  { label: '5×5', value: '5x5' },
]

export default function PhotoViewModal({ open, photo, onClose }) {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const { cats } = useCats()
  const { deletePhoto } = usePhotos()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (!photo) return null

  const catNames = cats
    .filter(c => photo.catIds?.includes(c.id))
    .map(c => c.name)

  const handlePlay = (difficulty) => {
    onClose()
    navigate(`/games/${photo.id}/${difficulty}`)
  }

  const handleDelete = async () => {
    await deletePhoto(photo)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-[rgba(10,4,20,0.7)] backdrop-blur-md"/>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg rounded-[20px] overflow-hidden shadow-2xl"
            style={{
              background: dark ? 'rgba(26,8,40,0.9)' : 'rgba(255,251,245,0.96)',
              backdropFilter: 'blur(16px)',
              color: dark ? '#F5EEF8' : '#2D1B28',
              border: dark ? '1px solid rgba(199,125,255,0.2)' : '1px solid rgba(232,121,180,0.2)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
            >
              <X size={15}/>
            </button>

            <div className="relative bg-black">
              <img src={photo.imageUrl} alt="" className="w-full max-h-[70vh] object-contain"/>
            </div>

            <div className="p-5 space-y-4">
              {catNames.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {catNames.map(n => (
                    <span key={n} className="font-hand text-xl text-[#E879B4]">{n}</span>
                  ))}
                </div>
              )}
              {photo.note && (
                <p className="text-sm opacity-70 leading-relaxed">{photo.note}</p>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] opacity-40 mb-2.5">Play Puzzle</p>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d.value}
                      onClick={() => handlePlay(d.value)}
                      className="bg-morph group flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all"
                    >
                      <Play size={13} className="group-hover:scale-110 transition-transform"/>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 dark:border-white/10">
                {confirmDelete ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-red-400 flex-1">Delete this photo?</span>
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-lg text-sm opacity-70 hover:opacity-100 transition-opacity"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 text-sm text-red-400/70 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14}/> Delete photo
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
