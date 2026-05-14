import { useEffect } from 'react'

export function usePrefetchPhotos(photos) {
  useEffect(() => {
    if (!photos.length) return
    const schedule = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200))
    schedule(() => {
      for (const photo of photos) {
        if (photo.id.startsWith('demo-')) continue
        if (photo.imageUrl?.startsWith('blob:')) continue
        const img = new Image()
        img.src = photo.mediumUrl ?? photo.imageUrl
      }
    })
  }, [photos.length]) // eslint-disable-line react-hooks/exhaustive-deps
}
