import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Play, Check, Loader2, Download } from 'lucide-react'
import { useCats } from '../../hooks/useCats'
import { usePhotos } from '../../hooks/usePhotos'
import { useTheme } from '../../hooks/useTheme'
import PhotoForm from './PhotoForm'

const DIFFICULTIES = [
  { label: '3×3', value: '3x3' },
  { label: '4×4', value: '4x4' },
  { label: '5×5', value: '5x5' },
]

export default function PhotoViewModal({ open, photo, onClose }) {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const { cats } = useCats()
  const [diffOpen, setDiffOpen] = useState(false)
  const [selectedDiff, setSelectedDiff] = useState(null)
  const dropRef = useRef(null)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const formRef = useRef(null)
  const { editPhoto } = usePhotos()
  const longPressTimer = useRef(null)
  const longPressFired = useRef(false)

  const startLongPress = () => {
    if (!photo || photo.isDemo || editing) return
    longPressFired.current = false
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      setEditing(true)
    }, 500)
  }
  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!diffOpen) return
      if (!dropRef.current?.contains(e.target)) {
        setDiffOpen(false)
        setSelectedDiff(null)
      }
    }
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (diffOpen) { setDiffOpen(false); setSelectedDiff(null); return }
      if (editing) { setEditing(false); return }
      onClose()
    }
    const t = setTimeout(() => document.addEventListener('mousedown', onDoc), 0)
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, diffOpen, editing, onClose])

  useEffect(() => {
    if (!open) setEditing(false)
  }, [open])

  useEffect(() => {
    setEditing(false)
  }, [photo?.id])

  if (!photo) return null

  const catNames = cats
    .filter(c => photo.catIds?.includes(c.id))
    .map(c => c.name)

  const validCatIds = (photo.catIds || []).filter(id => cats.some(c => c.id === id))

  const close = () => {
    if (editing) { setEditing(false); return }
    setDiffOpen(false)
    setSelectedDiff(null)
    onClose()
  }

  const handleSave = async (e) => {
    e.stopPropagation()
    setSaving(true)
    const ok = await formRef.current?.submit()
    setSaving(false)
    if (ok) setEditing(false)
  }

  const handleEditSubmit = async ({ catIds, note }) => {
    await editPhoto(photo, { catIds, note })
  }

  const handlePlay = (difficulty) => {
    close()
    navigate(`/games/${photo.id}/${difficulty}`)
  }

  const onPlayClick = () => {
    if (!diffOpen) { setDiffOpen(true); return }
    if (selectedDiff) handlePlay(selectedDiff)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={close}
        >
          <div className="absolute inset-0 bg-[rgba(10,4,20,0.7)] backdrop-blur-md"/>
          <motion.div
            onClick={(e) => {
              if (longPressFired.current) {
                longPressFired.current = false
                e.stopPropagation()
                return
              }
              if (editing) {
                setEditing(false)
                return
              }
              e.stopPropagation()
            }}
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            onTouchCancel={cancelLongPress}
            onContextMenu={(e) => { if (photo && !photo.isDemo && !editing) e.preventDefault() }}
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
              onClick={editing ? handleSave : close}
              disabled={saving}
              className={`absolute top-3 right-3 z-10 grid h-8 w-8 place-items-center rounded-full transition-colors ${
                editing
                  ? 'bg-morph text-white shadow-lg disabled:opacity-50'
                  : 'bg-black/30 text-white hover:bg-black/50'
              }`}
              aria-label={editing ? 'Save changes' : 'Close'}
            >
              {editing
                ? (saving ? <Loader2 size={15} className="animate-spin"/> : <Check size={15}/>)
                : <X size={15}/>}
            </button>

            <div className="relative bg-black">
              <img src={photo.imageUrl} alt="" className="w-full max-h-[70vh] object-contain"/>
              {editing ? (
                <a
                  href={photo.imageUrl}
                  download={photo.originalFilename ?? `photo-${photo.id}.jpg`}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-morph absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white transition"
                  style={{ boxShadow: '0 8px 18px rgba(232,121,180,0.35)' }}
                >
                  <Download size={12}/> Download
                </a>
              ) : (
                <div
                  ref={dropRef}
                  className="bg-morph absolute bottom-3 right-3 inline-flex items-stretch overflow-hidden rounded-full"
                  style={{ boxShadow: '0 8px 18px rgba(232,121,180,0.35)' }}
                >
                  <div
                    className="flex items-stretch overflow-hidden transition-[max-width,opacity] duration-300 ease-out"
                    style={{ maxWidth: diffOpen ? 240 : 0, opacity: diffOpen ? 1 : 0 }}
                    aria-hidden={!diffOpen}
                  >
                    {DIFFICULTIES.map((d, i) => {
                      const on = selectedDiff === d.value
                      return (
                        <button
                          key={d.value}
                          tabIndex={diffOpen ? 0 : -1}
                          onClick={() => setSelectedDiff(d.value)}
                          className={`shrink-0 whitespace-nowrap px-3.5 text-xs font-medium text-white transition-colors ${i > 0 ? 'border-l border-white/30' : ''} ${on ? 'bg-black/20' : 'hover:bg-white/10'}`}
                        >
                          {d.label}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={onPlayClick}
                    disabled={diffOpen && !selectedDiff}
                    className={`inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${diffOpen ? 'border-l border-white/30' : ''}`}
                  >
                    <Play size={12}/> Play
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 space-y-3">
              {editing ? (
                <PhotoForm
                  ref={formRef}
                  mode="edit"
                  initial={{ catIds: validCatIds, note: photo.note ?? '' }}
                  onSubmit={handleEditSubmit}
                />
              ) : (
                <>
                  {catNames.length > 0 && (
                    <div className="flex flex-wrap justify-start gap-2">
                      {catNames.map(n => (
                        <span key={n} className="font-hand text-2xl text-[#E879B4]">{n}</span>
                      ))}
                    </div>
                  )}
                  {photo.note && (
                    <p className="text-left text-sm opacity-70 leading-relaxed">{photo.note}</p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
