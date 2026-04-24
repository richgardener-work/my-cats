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
  const { cats, addCat } = useCats()
  const { photos } = usePhotos()
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
      <header>
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">Our shared album</div>
        <h1 className="mt-2 font-display font-wonky text-5xl">
          Gallery <span className="font-hand-accent text-[0.6em] text-[#E879B4]">ours</span>
        </h1>
        <p className="mt-2 text-sm opacity-70">Every day we kept.</p>
      </header>

      <div className="mt-8">
        <CatFilterTabs cats={cats} activeId={active} onChange={setActive} onAddCat={addCat}/>
      </div>

      <div className="mt-8">
        <PhotoGrid photos={filtered} onOpen={setView}/>
      </div>

      <button
        onClick={() => setUploadOpen(true)}
        className="fixed bottom-8 right-8 z-20 grid h-14 w-14 place-items-center rounded-full text-white animate-breath-pulse motion-reduce:animate-none"
        style={{ background: 'linear-gradient(135deg, #E879B4, #C9A0DC)' }}
        aria-label="Add photo"
      >
        <Plus size={24}/>
      </button>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)}/>
      <PhotoViewModal open={!!view} photo={view} onClose={() => setView(null)}/>
    </div>
  )
}
