import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Play, Trash2 } from 'lucide-react'

const DIFFICULTIES = [
  { label: '3×3', value: '3x3' },
  { label: '4×4', value: '4x4' },
  { label: '5×5', value: '5x5' },
]

export default function PhotoViewModal({ photo, cats, onClose, onDelete, isAuthorized }) {
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const catNames = cats
    .filter(c => photo.catIds?.includes(c.id))
    .map(c => c.name)
    .join(' · ')

  const handlePlay = (difficulty) => {
    onClose()
    navigate(`/games/${photo.id}/${difficulty}`)
  }

  const handleDelete = async () => {
    await onDelete(photo)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-light-bg dark:bg-dark-bg rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden ring-1 ring-light-pink/10 dark:ring-dark-purple/10">
        {/* image */}
        <div className="relative bg-black">
          <img
            src={photo.imageUrl}
            alt=""
            className="w-full max-h-[60vh] object-contain"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          >
            <X size={15} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* cat names + note */}
          <div>
            {catNames && (
              <p className="font-heading font-semibold text-base">{catNames}</p>
            )}
            {photo.note && (
              <p className="text-sm text-light-text/55 dark:text-dark-text/55 mt-1 leading-relaxed">
                {photo.note}
              </p>
            )}
          </div>

          {/* difficulty selector */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-light-text/35 dark:text-dark-text/35 font-medium mb-2.5">
              Play Puzzle
            </p>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => handlePlay(d.value)}
                  className="
                    group flex items-center gap-1.5 px-4 py-2.5 rounded-xl
                    bg-gradient-to-r from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink
                    text-white text-sm font-medium
                    hover:opacity-90 active:scale-[0.97]
                    transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    shadow-[0_2px_10px_rgba(244,168,199,0.3)] dark:shadow-[0_2px_10px_rgba(199,125,255,0.25)]
                  "
                >
                  <Play size={13} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-300" />
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* delete (authorized only) */}
          {isAuthorized && (
            <div className="pt-1 border-t border-light-pink/10 dark:border-dark-purple/10">
              {confirmDelete ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-red-400 flex-1">Delete this photo?</span>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors duration-300 active:scale-[0.97]"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg bg-light-card dark:bg-dark-card text-sm hover:opacity-70 transition-opacity duration-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-2 text-sm text-red-400/70 hover:text-red-500 transition-colors duration-300"
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                  Delete photo
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
