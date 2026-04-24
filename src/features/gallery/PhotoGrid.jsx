import PhotoCard from './PhotoCard'

export default function PhotoGrid({ photos, onOpen }) {
  if (!photos.length) {
    return (
      <div className="py-20 text-center opacity-60">
        No photos yet — hit the + button to add one.
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
      {photos.map(p => <PhotoCard key={p.id} photo={p} onOpen={onOpen}/>)}
    </div>
  )
}
