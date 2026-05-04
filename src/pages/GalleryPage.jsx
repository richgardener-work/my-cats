import { useMemo, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import PhotoGrid from '../features/gallery/PhotoGrid'
import CatFilterTabs from '../components/CatFilterTabs'
import PhotoViewModal from '../features/gallery/PhotoViewModal'
import { useCats } from '../hooks/useCats'
import { usePhotos } from '../hooks/usePhotos'
import { filterPhotosByTag } from '../utils/photoFilter'

export default function GalleryPage() {
  const [params, setParams] = useSearchParams()
  const active = params.get('cat') || null
  const { cats, addCat, removeCat } = useCats()
  const { photos, deletePhoto } = usePhotos()
  const [view, setView] = useState(null)

  const filtered = useMemo(() => filterPhotosByTag(photos, active), [photos, active])
  const viewPhoto = view ? (photos.find(p => p.id === view.id) ?? view) : null

  const setActive = (id) => {
    if (id) params.set('cat', id); else params.delete('cat')
    setParams(params, { replace: true })
  }

  const handleRemoveCat = useCallback(async (id) => {
    await removeCat(id)
    if (params.get('cat') === id) {
      params.delete('cat')
      setParams(params, { replace: true })
    }
  }, [removeCat, params, setParams])

  return (
    <div className="mx-auto max-w-6xl px-6 pt-8 pb-0 sm:py-14">
      <header>
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">Our shared album</div>
        <h1 className="mt-2 font-display font-wonky text-5xl">
          Gallery <span className="font-hand-accent text-[0.6em] text-[#E879B4]">ours</span>
        </h1>
        <p className="mt-2 text-sm opacity-70">Every day we kept.</p>
      </header>

      <div className="mt-8">
        <CatFilterTabs cats={cats} activeId={active} onChange={setActive} onAddCat={addCat} onRemoveCat={handleRemoveCat}/>
      </div>

      <div className="mt-8">
        <PhotoGrid photos={filtered} onOpen={setView} onDelete={deletePhoto}/>
      </div>

      <PhotoViewModal open={!!view} photo={viewPhoto} onClose={() => setView(null)}/>
    </div>
  )
}
