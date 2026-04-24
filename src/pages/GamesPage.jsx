import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Star, X } from 'lucide-react'
import CatFilterTabs from '../components/CatFilterTabs'
import CountUp from '../components/CountUp'
import { useCats } from '../hooks/useCats'
import { usePhotos } from '../hooks/usePhotos'

const DIFFS = [
  { label: '3×3', value: '3x3', n: 3, starCount: 1 },
  { label: '4×4', value: '4x4', n: 4, starCount: 2 },
  { label: '5×5', value: '5x5', n: 5, starCount: 3 },
]

export default function GamesPage({ auth, scores }) {
  const [params, setParams] = useSearchParams()
  const [showDiffModal, setShowDiffModal] = useState(null)
  const navigate = useNavigate()

  const active = params.get('cat') || null
  const { cats, addCat } = useCats()
  const { photos } = usePhotos(null, active)
  const { getScore, totalStars } = scores
  const uid = auth.user?.uid ?? 'guest'

  const solvedCount = photos.reduce(
    (acc, p) => acc + DIFFS.filter(d => (getScore(uid, p.id, d.value)?.stars ?? 0) > 0).length,
    0
  )
  const totalPossible = photos.length * DIFFS.length

  const setActive = (id) => {
    if (id) params.set('cat', id); else params.delete('cat')
    setParams(params, { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] opacity-60">Puzzle room</div>
          <h1 className="mt-2 font-display font-wonky text-5xl inline-flex items-baseline gap-3">
            My stars <span className="font-hand text-4xl text-[#E879B4]">·</span>
            <CountUp value={totalStars} className="font-hand text-5xl text-[#E879B4]" />
          </h1>
        </div>
        <div className="min-w-[240px]">
          <div className="text-xs uppercase tracking-wider opacity-60 mb-1">
            Progress — {solvedCount} / {totalPossible}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalPossible ? (solvedCount / totalPossible) * 100 : 0}%` }}
              transition={{ type: 'spring', stiffness: 140, damping: 22 }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(135deg, #E879B4, #C9A0DC)' }}
            />
          </div>
        </div>
      </header>

      <div className="mt-8">
        <CatFilterTabs cats={cats} activeId={active} onChange={setActive} onAddCat={addCat} />
      </div>

      <div className="mt-8 space-y-3">
        {photos.length === 0 ? (
          <EmptyState />
        ) : (
          photos.map((p, i) => (
            <GameRow
              key={p.id}
              photo={p}
              cats={cats}
              getScore={getScore}
              uid={uid}
              index={i}
              onPlay={() => setShowDiffModal(p)}
            />
          ))
        )}
      </div>

      {showDiffModal && (
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
          onClick={() => setShowDiffModal(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="bg-white/10 dark:bg-dark-card/80 backdrop-blur-xl rounded-2xl w-full max-w-xs p-6 border border-white/20 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-wonky text-xl">Choose Difficulty</h3>
              <button
                onClick={() => setShowDiffModal(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center opacity-40 hover:opacity-100 hover:bg-white/10 transition-all"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {DIFFS.map(d => (
                <button
                  key={d.value}
                  onClick={() => {
                    navigate(`/games/${showDiffModal.id}/${d.value}`)
                    setShowDiffModal(null)
                  }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 hover:bg-[#E879B4]/10 border border-white/10 hover:border-[#E879B4]/40 active:scale-[0.98] transition-all"
                >
                  <span className="font-medium text-sm">{d.label}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: d.starCount }).map((_, i) => (
                      <Star key={i} size={13} strokeWidth={0} fill="currentColor" className="text-[#E879B4]" />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function GameRow({ photo, cats, getScore, uid, index, onPlay }) {
  const catName = cats.filter(c => photo.catIds?.includes(c.id)).map(c => c.name).join(' · ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index * 0.03, 0.3) } }}
      whileHover={{ x: 4 }}
      className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-white/50 p-3 backdrop-blur-sm transition dark:border-white/10 dark:bg-dark-card/50 hover:border-[#E879B4]"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/10">
        {photo.imageUrl
          ? <img src={photo.imageUrl} alt="" className="h-full w-full object-cover" />
          : <div className="grid h-full w-full place-items-center text-[10px] opacity-60">expired</div>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-hand text-xl text-[#E879B4] truncate">
          {catName || 'Untitled'}
        </div>
        <div className="mt-1 flex items-center gap-2">
          {DIFFS.map(d => {
            const stars = getScore(uid, photo.id, d.value)?.stars ?? 0
            return (
              <span key={d.value} title={d.label} className="flex items-center gap-0.5 text-xs opacity-70">
                {d.n}×
                <Star size={10} className={stars > 0 ? 'text-[#E879B4] fill-[#E879B4]' : 'opacity-30'} />
              </span>
            )
          })}
        </div>
      </div>
      <button
        onClick={onPlay}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs text-white transition shrink-0"
        style={{ background: 'linear-gradient(135deg, #E879B4, #C9A0DC)' }}
      >
        <Play size={12} /> Play
      </button>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="py-20 text-center">
      <div className="text-6xl opacity-40">🐾</div>
      <p className="mt-4 opacity-60 text-sm">Nothing to solve yet.</p>
      <Link
        to="/gallery"
        className="mt-5 inline-block rounded-full px-5 py-2 text-sm text-white"
        style={{ background: 'linear-gradient(135deg, #E879B4, #C9A0DC)' }}
      >
        Go to Gallery
      </Link>
    </div>
  )
}
