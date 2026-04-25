import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import PhotoGrid from '../features/gallery/PhotoGrid'
import CatFilterTabs from '../components/CatFilterTabs'
import UploadModal from '../features/gallery/UploadModal'
import PhotoViewModal from '../features/gallery/PhotoViewModal'
import { useCats } from '../hooks/useCats'
import { usePhotos } from '../hooks/usePhotos'

export default function GalleryPage() {
  const [params, setParams] = useSearchParams()
  const active = params.get('cat') || null
  const { cats, addCat, removeCat } = useCats()
  const { photos, deletePhoto } = usePhotos()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [view, setView] = useState(null)

  const filtered = useMemo(
    () => active ? photos.filter(p => (p.catIds || []).includes(active)) : photos,
    [photos, active]
  )

  const setActive = (id) => {
    if (id) params.set('cat', id); else params.delete('cat')
    setParams(params, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] opacity-60">Our shared album</div>
          <h1 className="mt-2 font-display font-wonky text-5xl">
            Gallery <span className="font-hand-accent text-[0.6em] text-[#E879B4]">ours</span>
          </h1>
          <p className="mt-2 text-sm opacity-70">Every day we kept.</p>
        </div>
        <button
          onClick={() => setUploadOpen(true)}
          className="bg-morph inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5"
          style={{ boxShadow: '0 8px 18px rgba(232,121,180,0.35)' }}
          aria-label="Add photo"
        >
          <Plus size={16}/> Add photo
        </button>
      </header>

      <div className="mt-8">
        <CatFilterTabs cats={cats} activeId={active} onChange={setActive} onAddCat={addCat} onRemoveCat={removeCat}/>
      </div>

      <div className="mt-8">
        <PhotoGrid photos={filtered} onOpen={setView} onDelete={deletePhoto}/>
      </div>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)}/>
      <PhotoViewModal open={!!view} photo={view} onClose={() => setView(null)}/>
    </div>
  )
}
