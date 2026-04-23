import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCats } from '../hooks/useCats'
import { usePhotos } from '../hooks/usePhotos'
import CatFilterTabs from '../components/CatFilterTabs'
import PhotoGrid from '../features/gallery/PhotoGrid'
import UploadModal from '../features/gallery/UploadModal'
import PhotoViewModal from '../features/gallery/PhotoViewModal'

export default function GalleryPage({ auth }) {
  const [selectedCat, setSelectedCat] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [viewPhoto, setViewPhoto] = useState(null)

  const { cats, addCat } = useCats(auth.isAuthorized)
  const { photos, loading, uploadPhoto, deletePhoto } = usePhotos(auth.isAuthorized, selectedCat)

  const handleUpload = (data) => uploadPhoto({ ...data, userId: auth.user?.uid })

  const handleAddCatPrompt = () => {
    const name = window.prompt('Cat name:')
    if (name?.trim()) addCat(name.trim())
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* filter tabs */}
      <div className="mb-6">
        <CatFilterTabs
          cats={cats}
          selected={selectedCat}
          onSelect={setSelectedCat}
          onAddCat={handleAddCatPrompt}
          isAuthorized={auth.isAuthorized}
        />
      </div>

      {/* photo grid */}
      <PhotoGrid
        photos={photos}
        loading={loading}
        onPhotoClick={setViewPhoto}
        onPhotoDelete={deletePhoto}
        isAuthorized={auth.isAuthorized}
      />

      {/* upload FAB — authorized only */}
      {auth.isAuthorized && (
        <button
          onClick={() => setShowUpload(true)}
          aria-label="Upload photo"
          className="
            fixed bottom-6 right-6 w-14 h-14 rounded-full
            bg-gradient-to-br from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink
            text-white shadow-[0_4px_20px_rgba(244,168,199,0.5)] dark:shadow-[0_4px_20px_rgba(199,125,255,0.4)]
            flex items-center justify-center
            hover:scale-105 active:scale-95
            transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ring-1 ring-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]
          "
        >
          <Plus size={22} strokeWidth={1.5} />
        </button>
      )}

      {/* modals */}
      {showUpload && (
        <UploadModal
          cats={cats}
          onUpload={handleUpload}
          onClose={() => setShowUpload(false)}
          onAddCat={addCat}
        />
      )}

      {viewPhoto && (
        <PhotoViewModal
          photo={viewPhoto}
          cats={cats}
          onClose={() => setViewPhoto(null)}
          onDelete={deletePhoto}
          isAuthorized={auth.isAuthorized}
        />
      )}
    </main>
  )
}
