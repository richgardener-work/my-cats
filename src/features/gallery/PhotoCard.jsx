import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useCats } from '../../hooks/useCats'

export default function PhotoCard({ photo, onOpen }) {
  const { cats } = useCats()
  const names = (photo.catIds || [])
    .map(id => cats.find(c => c.id === id)?.name)
    .filter(Boolean)

  const expired = !photo.imageUrl

  return (
    <motion.button
      whileHover={{ y: -6, rotate: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => !expired && onOpen(photo)}
      aria-label={expired ? 'Photo expired' : `View photo${names.length ? ` of ${names.join(', ')}` : ''}`}
      className="group relative flex flex-col rounded-md bg-light-cream p-2 pb-8 shadow-md dark:bg-dark-card dark:shadow-2xl"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-black/10 dark:bg-white/5">
        {expired ? (
          <div className="grid h-full w-full place-items-center text-center text-xs opacity-60 p-4">
            Photo expired — reload lost the file. Re-upload to keep it.
          </div>
        ) : (
          <>
            <img src={photo.imageUrl} alt="" className="h-full w-full object-cover"/>
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition group-hover:opacity-100"/>
            <div aria-hidden className="absolute inset-0 grid place-items-center opacity-0 transition group-hover:opacity-100">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white/90 scale-90 transition group-hover:scale-100">
                <Play size={22} className="text-[#E879B4] ml-0.5"/>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="font-hand text-xl text-[#E879B4]">{names.join(' · ') || '—'}</span>
      </div>
    </motion.button>
  )
}
