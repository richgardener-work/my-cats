import { PawPrint } from 'lucide-react'
import PhotoCard from './PhotoCard'

export default function PhotoGrid({ photos, loading, onPhotoClick, onPhotoDelete, isAuthorized }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl bg-light-card dark:bg-dark-card overflow-hidden"
          >
            <div
              className="w-full h-full animate-pulse bg-gradient-to-br from-light-pink/10 to-light-purple/10 dark:from-dark-purple/10 dark:to-dark-pink/10"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          </div>
        ))}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-light-card dark:bg-dark-card flex items-center justify-center ring-1 ring-light-pink/20 dark:ring-dark-purple/20">
          <PawPrint size={28} strokeWidth={1} className="text-light-pink/60 dark:text-dark-purple/60" />
        </div>
        <p className="text-sm text-light-text/40 dark:text-dark-text/40 font-body">No photos yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {photos.map((photo, i) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={i}
          onClick={onPhotoClick}
          onDelete={onPhotoDelete}
          isAuthorized={isAuthorized}
        />
      ))}
    </div>
  )
}
