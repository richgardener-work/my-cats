import { AnimatePresence, motion } from 'framer-motion'
import { X, Upload } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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
  const [error, setError] = useState('')

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  useEffect(() => {
    if (!open) {
      setFile(null); setSelectedCats([]); setNote(''); setNewCat(''); setError('')
      return
    }
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const pendingName = newCat.trim()
  const canSubmit = !!file && (selectedCats.length > 0 || pendingName !== '') && !busy
  const hint = !file
    ? 'Pick an image first'
    : selectedCats.length === 0 && !pendingName
      ? 'Pick at least one cat'
      : ''

  const doUpload = async () => {
    if (!canSubmit) return
    setBusy(true)
    setError('')
    try {
      let catIds = [...selectedCats]
      if (pendingName) {
        const existing = cats.find(c => c.name.toLowerCase() === pendingName.toLowerCase())
        if (existing) {
          if (!catIds.includes(existing.id)) catIds.push(existing.id)
        } else {
          const id = await addCat(pendingName)
          catIds.push(id)
        }
      }
      await uploadPhoto({ file, catIds, note })
      onClose()
    } catch (e) {
      console.error('upload failed', e)
      setError(e?.message || 'Upload failed. Try a different image.')
    } finally {
      setBusy(false)
    }
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

            <label className="mt-6 block cursor-pointer">
              {previewUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-current/15">
                  <img src={previewUrl} alt="" className="block max-h-56 w-full object-cover"/>
                  <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                    <span className="truncate opacity-80">{file.name}</span>
                    <span className="opacity-60">Click to replace</span>
                  </div>
                </div>
              ) : (
                <div className="grid place-items-center gap-2 rounded-xl border-2 border-dashed border-current/30 p-6 text-sm opacity-80 hover:opacity-100">
                  <Upload size={24}/>
                  <span>Click to choose an image</span>
                </div>
              )}
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
                      className={`rounded-full px-3 py-1 text-xs ${on ? 'bg-morph text-white' : 'opacity-70'}`}
                      style={on ? {} : { border: '1px solid currentColor' }}
                    >
                      {c.name}
                    </button>
                  )
                })}
                <input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="+ new"
                  className={`w-24 rounded-full px-3 py-1 text-xs outline-none transition-colors ${
                    newCat
                      ? 'bg-morph text-white placeholder-white/70'
                      : 'border border-dashed border-[#E879B4] bg-transparent'
                  }`}
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

            {error && (
              <p className="mt-3 text-xs text-red-500">{error}</p>
            )}

            <button
              disabled={!canSubmit}
              onClick={doUpload}
              className="bg-morph mt-5 w-full rounded-full py-3 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:opacity-40"
              style={{ boxShadow: '0 10px 30px rgba(232,121,180,0.3)' }}
            >
              {busy ? 'Uploading…' : hint || 'Upload photo'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
