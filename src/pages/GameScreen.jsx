import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Shuffle, Timer, Footprints } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useCats } from '../hooks/useCats'
import { usePhotos } from '../hooks/usePhotos'
import { useScores } from '../hooks/useScores'
import PuzzleBoard from '../features/puzzle/PuzzleBoard'
import VictoryOverlay from '../features/puzzle/VictoryOverlay'
import {
  shuffle, applyMove, isSolved, getStarsForDifficulty, autoSolveMoves
} from '../features/puzzle/puzzleLogic'

const GRID_SIZE = { '3x3': 3, '4x4': 4, '5x5': 5 }

export default function GameScreen({ auth }) {
  const { photoId, difficulty } = useParams()
  const navigate = useNavigate()
  const n = GRID_SIZE[difficulty] || 3
  const devMode = new URLSearchParams(window.location.search).get('dev') === 'true'

  const [photo, setPhoto] = useState(null)
  const [state, setState] = useState(() => shuffle(n))
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)
  const [won, setWon] = useState(false)
  const [autoSolving, setAutoSolving] = useState(false)

  const { cats } = useCats(auth.isAuthorized)
  const { photos } = usePhotos(auth.isAuthorized)
  const { saveScore } = useScores(auth.isAuthorized)

  useEffect(() => {
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
    setState(prev => {
      const next = applyMove(prev, n, tileIdx)
      if (isSolved(next, n)) {
        setRunning(false)
        setWon(true)
        const stars = getStarsForDifficulty(difficulty)
        if (auth.isAuthorized && auth.user) {
          saveScore(auth.user.uid, photoId, difficulty, {
            stars,
            moves: moves + 1,
            timeSeconds: seconds,
          })
        }
      }
      return next
    })
    setMoves(m => m + 1)
  }, [n, difficulty, auth, photoId, moves, seconds, saveScore])

  const handleShuffle = () => {
    setState(shuffle(n))
    setMoves(0)
    setSeconds(0)
    setRunning(true)
    setWon(false)
  }

  const handleAutoSolve = async () => {
    if (autoSolving) return
    setAutoSolving(true)
    const movesToMake = autoSolveMoves(state, n)
    for (const move of movesToMake) {
      await new Promise(r => setTimeout(r, 300))
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

      <div className="flex items-center justify-center gap-8 py-4">
        <div className="flex items-center gap-2 text-sm">
          <Timer size={16} className="text-light-pink dark:text-dark-purple" />
          <span className="font-mono">{formatTime(seconds)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Footprints size={16} className="text-light-pink dark:text-dark-purple" />
          <span className="font-mono">{moves} moves</span>
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
          {devMode && (
            <button
              onClick={handleAutoSolve}
              disabled={autoSolving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Auto-solve
            </button>
          )}
        </div>
      </div>

      {won && (
        <VictoryOverlay
          stars={getStarsForDifficulty(difficulty)}
          moves={moves}
          timeSeconds={seconds}
          onPlayNext={handlePlayNext}
          onBack={() => navigate('/gallery')}
        />
      )}
    </div>
  )
}
