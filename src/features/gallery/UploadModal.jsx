import { AnimatePresence, motion } from 'framer-motion'
import { X, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCats } from '../../hooks/useCats'
import { usePhotos } from '../../hooks/usePhotos'
import { useTheme } from '../../hooks/useTheme'

export default function UploadModal({ open, onClose }) {
  const { dark } = useTheme()
  const { cats, addCat } = useCats()
  const { uploadPhoto } = usePhotos()
  const [file, setFile] = useState(null)
  const [selectedCats, setSelectedCats] = useState([])
  const [note, setNote] = useState('')
  const [newCat, setNewCat] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) { setFile(null); setSelectedCats([]); setNote(''); setNewCat(''); return }
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const doUpload = async () => {
    if (!file || selectedCats.length === 0) return
    setBusy(true)
    try {
      await uploadPhoto({ file, catIds: selectedCats, note })
      onClose()
    } finally { setBusy(false) }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-[rgba(10,4,20,0.6)] backdrop-blur-md"/>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 24 } }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-[460px] max-w-full rounded-[20px] p-7 shadow-2xl"
            style={{
              background: dark ? 'rgba(26,8,40,0.9)' : 'rgba(255,251,245,0.96)',
              backdropFilter: 'blur(16px)',
              color: dark ? '#F5EEF8' : '#2D1B28',
              border: dark ? '1px solid rgba(199,125,255,0.2)' : '1px solid rgba(232,121,180,0.2)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={18}/>
            </button>
            <h2 className="font-display font-wonky text-3xl">Add a photo</h2>

            <label className="mt-6 grid cursor-pointer place-items-center gap-2 rounded-xl border-2 border-dashed border-current/30 p-6 text-sm opacity-80 hover:opacity-100">
              <Upload size={24}/>
              <span>{file ? file.name : 'Click to choose an image'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)}/>
            </label>

            <div className="mt-5">
              <div className="mb-2 text-xs uppercase tracking-wider opacity-60">Cats</div>
              <div className="flex flex-wrap gap-2">
                {cats.map(c => {
                  const on = selectedCats.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCats(on ? selectedCats.filter(x => x !== c.id) : [...selectedCats, c.id])}
                      className={`rounded-full px-3 py-1 text-xs ${on ? 'text-white' : 'opacity-70'}`}
                      style={on ? { background: 'linear-gradient(135deg, #E879B4, #C9A0DC)' } : { border: '1px solid currentColor' }}
                    >
                      {c.name}
                    </button>
                  )
                })}
                <input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && newCat.trim()) {
                      const id = await addCat(newCat.trim())
                      setSelectedCats(prev => [...prev, id])
                      setNewCat('')
                    }
                  }}
                  placeholder="+ new"
                  className="rounded-full border border-dashed border-[#E879B4] bg-transparent px-3 py-1 text-xs outline-none w-20"
                />
              </div>
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Note (optional)"
              className="mt-4 w-full rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm outline-none"
            />

            <button
              disabled={!file || selectedCats.length === 0 || busy}
              onClick={doUpload}
              className="mt-5 w-full rounded-full py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #E879B4, #C9A0DC)', boxShadow: '0 10px 30px rgba(232,121,180,0.3)' }}
            >
              {busy ? 'Uploading…' : 'Upload photo'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
