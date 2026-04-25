import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, Shuffle, Timer, Footprints } from 'lucide-react'
import CountUp from '../components/CountUp'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { guest } from '../utils/guestStorage'
import { useCats } from '../hooks/useCats'
import { usePhotos } from '../hooks/usePhotos'
import { demoGalleryPhotos } from '../utils/demoAssets'
import PuzzleBoard from '../features/puzzle/PuzzleBoard'
import VictoryOverlay from '../features/puzzle/VictoryOverlay'
import {
  shuffle, applyMove, isSolved, getStarsForDifficulty, autoSolveMoves
} from '../features/puzzle/puzzleLogic'

const GRID_SIZE = { '3x3': 3, '4x4': 4, '5x5': 5 }

export default function GameScreen({ auth, scores }) {
  const { photoId, difficulty } = useParams()
  const navigate = useNavigate()
  const { search } = useLocation()
  const n = GRID_SIZE[difficulty] || 3
  const isDev = new URLSearchParams(search).get('dev') === 'true'

  const [photo, setPhoto] = useState(null)
  const [state, setState] = useState(() => shuffle(n))
  const stateRef = useRef(state)
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)
  const [won, setWon] = useState(false)
  const [autoSolving, setAutoSolving] = useState(false)

  const { cats } = useCats(auth.isAuthorized)
  const { photos } = usePhotos(auth.isAuthorized)
  const { saveScore } = scores

  useEffect(() => {
    const demo = demoGalleryPhotos.find(p => p.id === photoId)
    if (demo) { setPhoto(demo); return }

    if (photoId.startsWith('guest-')) {
      const guestPhoto = guest.getPhotos().find(p => p.id === photoId)
      if (guestPhoto) setPhoto(guestPhoto)
      return
    }

    getDoc(doc(db, 'photos', photoId)).then(snap => {
      if (snap.exists()) setPhoto({ id: snap.id, ...snap.data() })
    })
  }, [photoId])

  useEffect(() => {
    if (!running || won) return
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running, won])

  const handleMove = useCallback((tileIdx) => {
    const next = applyMove(stateRef.current, n, tileIdx)
    stateRef.current = next
    setState(next)
    setMoves(m => m + 1)
    if (isSolved(next, n)) {
      setRunning(false)
      setWon(true)
      saveScore(auth.user?.uid ?? 'guest', photoId, difficulty, {
        stars: getStarsForDifficulty(difficulty),
        moves: moves + 1,
        timeSeconds: seconds,
      })
    }
  }, [n, difficulty, auth, photoId, moves, seconds, saveScore])

  const handleShuffle = () => {
    const next = shuffle(n)
    stateRef.current = next
    setState(next)
    setMoves(0)
    setSeconds(0)
    setRunning(true)
    setWon(false)
  }

  const handleAutoSolve = async () => {
    if (autoSolving) return
    setAutoSolving(true)
    const movesToMake = autoSolveMoves(stateRef.current, n)
    for (const move of movesToMake) {
      await new Promise(r => setTimeout(r, n <= 3 ? 200 : n === 4 ? 100 : 60))
      handleMove(move)
    }
    setAutoSolving(false)
  }

  const catNames = photo
    ? cats.filter(c => photo.catIds?.includes(c.id)).map(c => c.name).join(' · ')
    : ''

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handlePlayNext = () => {
    const idx = photos.findIndex(p => p.id === photoId)
    const next = photos[idx + 1] || photos[0]
    navigate(`/games/${next.id}/${difficulty}`)
  }

  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-light-pink dark:border-dark-purple border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-light-pink/20 dark:border-dark-purple/20">
        <button
          onClick={() => navigate('/games')}
          className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        <div className="text-center">
          <p className="font-heading font-semibold text-sm">{catNames}</p>
          <p className="text-xs text-light-text/50 dark:text-dark-text/50">{difficulty.replace('x', '×')}</p>
        </div>
        <div className="w-16" />
      </div>

      <div className="flex items-center justify-center gap-8 py-4 font-mono tabular-nums text-sm">
        <div className="flex items-center gap-2">
          <Timer size={16} className="text-light-pink dark:text-dark-purple" />
          <span className="text-xl">{formatTime(seconds)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Footprints size={16} className="text-light-pink dark:text-dark-purple" />
          <CountUp value={moves} className="text-xl" /> <span>moves</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-6">
        <PuzzleBoard
          imageUrl={photo.imageUrl}
          state={state}
          n={n}
          onMove={handleMove}
          disabled={won}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-light-card dark:bg-dark-card text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <Shuffle size={16} />
            Shuffle
          </button>
          {isDev && (
            <button
              onClick={handleAutoSolve}
              disabled={autoSolving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-40"
            >
              Auto-solve
            </button>
          )}
        </div>
      </div>

      <VictoryOverlay
        open={won}
        stars={getStarsForDifficulty(difficulty)}
        moves={moves}
        seconds={seconds}
        onNext={handlePlayNext}
        onClose={() => navigate('/gallery')}
      />
    </div>
  )
}
