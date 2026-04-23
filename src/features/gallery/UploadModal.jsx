import { useState, useRef } from 'react'
import { X, ImagePlus, Plus } from 'lucide-react'

export default function UploadModal({ cats, onUpload, onClose, onAddCat }) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [selectedCats, setSelectedCats] = useState([])
  const [note, setNote] = useState('')
  const [newCatName, setNewCatName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInput = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const toggleCat = (id) =>
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )

  const handleAddCat = async () => {
    if (!newCatName.trim()) return
    const newCat = await onAddCat(newCatName.trim())
    setSelectedCats(prev => [...prev, newCat.id])
    setNewCatName('')
  }

  const handleUpload = async () => {
    if (!file || selectedCats.length === 0) return
    setUploading(true)
    await onUpload({ file, catIds: selectedCats, note })
    onClose()
  }

  const canUpload = file && selectedCats.length > 0 && !uploading

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-light-bg dark:bg-dark-bg rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl ring-1 ring-light-pink/15 dark:ring-dark-purple/15">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-light-pink/15 dark:border-dark-purple/15">
          <h2 className="font-heading text-lg font-semibold">Upload a Photo</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-light-text/50 dark:text-dark-text/50 hover:bg-light-pink/10 dark:hover:bg-dark-purple/10 transition-colors duration-300"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* drop zone */}
          <div
            className={`
              border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
              transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${dragOver
                ? 'border-light-pink dark:border-dark-purple bg-light-pink/5 dark:bg-dark-purple/5 scale-[1.01]'
                : 'border-light-pink/30 dark:border-dark-purple/30 hover:border-light-pink/60 dark:hover:border-dark-purple/60'
              }
            `}
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          >
            {preview ? (
              <img
                src={preview}
                alt=""
                className="w-full h-44 object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-light-text/35 dark:text-dark-text/35 py-4">
                <ImagePlus size={28} strokeWidth={1} />
                <span className="text-sm">Drag and drop or tap to select</span>
              </div>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {/* cat selector */}
          <div>
            <p className="text-xs font-medium text-light-text/50 dark:text-dark-text/50 uppercase tracking-[0.1em] mb-3">
              Which cats are in this photo?
            </p>
            <div className="flex flex-wrap gap-2">
              {cats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => toggleCat(cat.id)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]
                    ${selectedCats.includes(cat.id)
                      ? 'bg-gradient-to-r from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink text-white shadow-[0_2px_10px_rgba(244,168,199,0.4)] dark:shadow-[0_2px_10px_rgba(199,125,255,0.3)]'
                      : 'bg-light-card dark:bg-dark-card text-light-text/70 dark:text-dark-text/70 hover:bg-light-pink/10 dark:hover:bg-dark-purple/10'
                    }
                  `}
                >
                  {cat.name}
                </button>
              ))}

              {/* add new cat inline */}
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="New cat..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
                  className="px-3 py-1.5 rounded-full text-sm bg-light-card dark:bg-dark-card border border-light-pink/25 dark:border-dark-purple/25 outline-none w-24 focus:w-32 transition-all duration-300 focus:border-light-pink dark:focus:border-dark-purple"
                />
                <button
                  onClick={handleAddCat}
                  className="w-7 h-7 rounded-full bg-light-pink/15 dark:bg-dark-purple/15 flex items-center justify-center hover:bg-light-pink/30 dark:hover:bg-dark-purple/30 transition-colors duration-300"
                >
                  <Plus size={13} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          {/* note */}
          <textarea
            placeholder="Add a note... (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-xl bg-light-card dark:bg-dark-card border border-light-pink/15 dark:border-dark-purple/15 text-sm outline-none resize-none focus:border-light-pink/50 dark:focus:border-dark-purple/50 transition-colors duration-300 placeholder:text-light-text/30 dark:placeholder:text-dark-text/30"
          />

          {/* actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-light-pink/25 dark:border-dark-purple/25 text-sm font-medium hover:opacity-60 transition-opacity duration-300 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!canUpload}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink text-white text-sm font-medium disabled:opacity-35 transition-all duration-300 active:scale-[0.98] hover:opacity-90"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
