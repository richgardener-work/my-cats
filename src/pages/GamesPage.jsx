import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, PawPrint, Shuffle } from 'lucide-react'
import CatFilterTabs from '../components/CatFilterTabs'
import CountUp from '../components/CountUp'
import { useCats } from '../hooks/useCats'
import { usePhotos } from '../hooks/usePhotos'
import { filterPhotosByTag } from '../utils/photoFilter'
import { pickRandomPuzzle } from '../utils/pickRandomPuzzle'

const DIFFS = [
  { label: '3×3', value: '3x3', n: 3 },
  { label: '4×4', value: '4x4', n: 4 },
  { label: '5×5', value: '5x5', n: 5 },
]

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 24 } },
}

export default function GamesPage({ auth, games }) {
  const [params, setParams] = useSearchParams()
  const [openId, setOpenId] = useState(null)
  const navigate = useNavigate()

  const active = params.get('cat') || null
  const { cats, addCat, removeCat } = useCats()
  const { photos: rawPhotos } = usePhotos(null, null)
  const photos = useMemo(() => filterPhotosByTag(rawPhotos, active), [rawPhotos, active])
  const { getScore, totalStars } = games
  const uid = auth.user?.uid ?? 'guest'

  const solvedCount = photos.reduce(
    (acc, p) => acc + DIFFS.filter(d => (getScore(uid, p.id, d.value)?.stars ?? 0) > 0).length,
    0
  )
  const totalPossible = photos.length * DIFFS.length

  const onPlayRandom = () => {
    const chosen = pickRandomPuzzle({ photos, getScore, uid, difficulty: '3x3' })
    if (chosen) navigate(`/games/${chosen.id}/3x3`)
  }

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

  const visibleIds = useMemo(() => new Set(photos.map(p => p.id)), [photos])

  return (
    <div className="w-full mx-auto max-w-6xl px-6 pt-8 pb-0 sm:py-14">
      <header className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="min-w-0 flex-[7]">
          <div className="text-xs uppercase tracking-[0.2em] opacity-60">Puzzle room</div>
          <h1 className="mt-2 font-display font-wonky text-5xl">
            My stars <span className="font-hand-accent text-[0.6em] text-[#E879B4]">· <CountUp value={totalStars} /></span>
          </h1>
          <p className="mt-2 text-sm opacity-70">Every puzzle, a tiny win.</p>
        </div>
        <div className="flex flex-[3] flex-col items-stretch gap-2">
          <button
            onClick={onPlayRandom}
            disabled={photos.length === 0}
            className="bg-morph inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ boxShadow: '0 8px 18px rgba(232,121,180,0.35)' }}
            aria-label="Play random puzzle"
          >
            <Shuffle size={16} /> Play
          </button>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalPossible ? (solvedCount / totalPossible) * 100 : 0}%` }}
                transition={{ type: 'spring', stiffness: 140, damping: 22 }}
                className="bg-morph h-full rounded-full"
              />
            </div>
            <span className="shrink-0 text-xs opacity-50">{solvedCount} / {totalPossible}</span>
          </div>
        </div>
      </header>

      <div className="mt-8">
        <CatFilterTabs cats={cats} activeId={active} onChange={setActive} onAddCat={addCat} onRemoveCat={handleRemoveCat}/>
      </div>

      <div className="mt-8">
        {rawPhotos.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {photos.length === 0 && <EmptyState />}
            {rawPhotos.map(p => {
              const visible = visibleIds.has(p.id)
              return (
                <div
                  key={p.id}
                  style={{
                    display: 'grid',
                    gridTemplateRows: visible ? '1fr' : '0fr',
                    transition: visible ? 'grid-template-rows 0.2s ease' : 'none',
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="pb-3">
                      <GameRow
                        photo={p}
                        cats={cats}
                        getScore={getScore}
                        uid={uid}
                        isOpen={openId === p.id}
                        onExpand={() => setOpenId(p.id)}
                        onCollapse={() => setOpenId(null)}
                        onLaunch={(diff) => { setOpenId(null); navigate(`/games/${p.id}/${diff}`) }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

function GameRow({ photo, cats, getScore, uid, isOpen, onExpand, onCollapse, onLaunch }) {
  const rootRef = useRef(null)
  const catName = cats.filter(c => photo.catIds?.includes(c.id)).map(c => c.name).join(' · ')

  useEffect(() => {
    if (!isOpen) return
    const onDoc = (e) => { if (!rootRef.current?.contains(e.target)) onCollapse() }
    const onKey = (e) => { if (e.key === 'Escape') onCollapse() }
    const t = setTimeout(() => document.addEventListener('mousedown', onDoc), 0)
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onCollapse])

  return (
    <motion.div
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-white/80 p-3 transition dark:border-white/10 dark:bg-dark-card/80 hover:border-[#E879B4]"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-black/10">
        {photo.imageUrl
          ? <img src={photo.microUrl ?? photo.imageUrl} alt="" className="h-full w-full object-cover" />
          : <div className="grid h-full w-full place-items-center text-[10px] opacity-60">expired</div>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-hand text-xl text-[#E879B4] truncate flex items-center gap-1.5">
          {catName ? catName : <PawPrint size={18} aria-label="Untagged"/>}
        </div>
        <div className="mt-1 flex items-center gap-1.5" aria-label="Difficulty progress">
          {DIFFS.map(d => {
            const solved = (getScore(uid, photo.id, d.value)?.stars ?? 0) > 0
            return (
              <span
                key={d.value}
                title={`${d.label} ${solved ? '— solved' : ''}`}
                className={`h-2.5 w-2.5 rounded-full transition ${solved ? 'bg-[#E879B4]' : 'border border-current/40'}`}
              />
            )
          })}
        </div>
      </div>

      {/* Pill anchor — fixed size, never shifts layout */}
      <div ref={rootRef} className="relative shrink-0">
        <button
          onClick={onExpand}
          className="bg-morph inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
          style={{ boxShadow: '0 8px 18px rgba(232,121,180,0.35)' }}
          aria-label="Choose difficulty"
        >
          <Play size={12} /> Play
        </button>

        {/* Difficulty overlay — absolute, floats over layout */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute right-0 top-0 bg-morph inline-flex overflow-hidden rounded-full"
              style={{ boxShadow: '0 8px 18px rgba(232,121,180,0.35)' }}
              initial={{ opacity: 0, scale: 0.92, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.92, x: 8 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            >
              {DIFFS.map((d, i) => (
                <button
                  key={d.value}
                  onClick={() => onLaunch(d.value)}
                  className={`shrink-0 whitespace-nowrap px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20 ${i > 0 ? 'border-l border-white/30' : ''}`}
                >
                  {d.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
        className="bg-morph mt-5 inline-block rounded-full px-5 py-2 text-sm text-white"
      >
        Go to Gallery
      </Link>
    </div>
  )
}
