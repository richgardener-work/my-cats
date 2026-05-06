import PhotoCard from './PhotoCard'
import UploadingCard from './UploadingCard'

export default function PhotoGrid({ photos, onOpen, onDelete, pendingUploads = [], onRetry, onCancel }) {
  if (!photos.length && !pendingUploads.length) {
    return (
      <div className="py-20 text-center opacity-60">
        No photos yet — hit the + button to add one.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
      {pendingUploads.map(p => (
        <UploadingCard key={p.id} pending={p} onRetry={onRetry} onCancel={onCancel} />
      ))}
      {photos.map(p => (
        <PhotoCard key={p.id} photo={p} onOpen={onOpen} onDelete={onDelete} />
      ))}
    </div>
  )
}
