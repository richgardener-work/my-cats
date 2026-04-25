import { useEffect, useRef, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import CatFilterTabs from '../components/CatFilterTabs'
import CountUp from '../components/CountUp'
import { useCats } from '../hooks/useCats'
import { usePhotos } from '../hooks/usePhotos'

const DIFFS = [
  { label: '3×3', value: '3x3', n: 3 },
  { label: '4×4', value: '4x4', n: 4 },
  { label: '5×5', value: '5x5', n: 5 },
]

export default function GamesPage({ auth, scores }) {
  const [params, setParams] = useSearchParams()
  const [openId, setOpenId] = useState(null)
  const [selectedDiff, setSelectedDiff] = useState(null)
  const navigate = useNavigate()

  const active = params.get('cat') || null
  const { cats, addCat, removeCat } = useCats()
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
              className="bg-morph h-full rounded-full"
            />
          </div>
        </div>
      </header>

      <div className="mt-8">
        <CatFilterTabs cats={cats} activeId={active} onChange={setActive} onAddCat={addCat} onRemoveCat={removeCat}/>
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
              isOpen={openId === p.id}
              selected={openId === p.id ? selectedDiff : null}
              onSelect={setSelectedDiff}
              onExpand={() => { setOpenId(p.id); setSelectedDiff(null) }}
              onCollapse={() => { setOpenId(null); setSelectedDiff(null) }}
              onLaunch={(diff) => { setOpenId(null); setSelectedDiff(null); navigate(`/games/${p.id}/${diff}`) }}
            />
          ))
        )}
      </div>
    </div>
  )
}

function GameRow({ photo, cats, getScore, uid, index, isOpen, selected, onSelect, onExpand, onCollapse, onLaunch }) {
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

  const onPlayClick = () => {
    if (!isOpen) { onExpand(); return }
    if (selected) onLaunch(selected)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index * 0.03, 0.3) } }}
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
      <div
        ref={rootRef}
        className="bg-morph inline-flex shrink-0 items-stretch overflow-hidden rounded-full"
        style={{ boxShadow: '0 8px 18px rgba(232,121,180,0.35)' }}
      >
        <div
          className="flex items-stretch overflow-hidden transition-[max-width,opacity] duration-300 ease-out"
          style={{ maxWidth: isOpen ? 240 : 0, opacity: isOpen ? 1 : 0 }}
          aria-hidden={!isOpen}
        >
          {DIFFS.map((d, i) => {
            const on = selected === d.value
            return (
              <button
                key={d.value}
                tabIndex={isOpen ? 0 : -1}
                onClick={() => onSelect(d.value)}
                className={`shrink-0 whitespace-nowrap px-3.5 text-xs font-medium text-white transition-colors ${i > 0 ? 'border-l border-white/30' : ''} ${on ? 'bg-black/20' : 'hover:bg-white/10'}`}
              >
                {d.label}
              </button>
            )
          })}
        </div>
        <button
          onClick={onPlayClick}
          disabled={isOpen && !selected}
          className={`inline-flex shrink-0 items-center gap-1.5 px-4 py-2 text-xs font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${isOpen ? 'border-l border-white/30' : ''}`}
        >
          <Play size={12}/> Play
        </button>
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
