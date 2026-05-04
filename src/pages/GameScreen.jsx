import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, PawPrint } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { guest } from '../utils/guestStorage'
import { useAuth } from '../hooks/useAuth'
import { useCats } from '../hooks/useCats'
import { demoGalleryPhotos } from '../utils/demoAssets'
import PuzzleBoard from '../features/puzzle/PuzzleBoard'
import VictoryOverlay from '../features/puzzle/VictoryOverlay'
import GameSubHeader from '../features/puzzle/GameSubHeader'
import {
  shuffle, applyMove, isSolved, getStarsForDifficulty, autoSolveMoves
} from '../features/puzzle/puzzleLogic'

const GRID_SIZE = { '3x3': 3, '4x4': 4, '5x5': 5 }

export default function GameScreen({ auth, games }) {
  const { photoId, difficulty } = useParams()
  const navigate = useNavigate()
  const n = GRID_SIZE[difficulty] || 3

  const { user, userDoc, isAuthorized } = useAuth()
  const solveEnabled = !isAuthorized || userDoc?.admin === true

  const [photo, setPhoto] = useState(null)
  const [state, setState] = useState(() => shuffle(n))
  const stateRef = useRef(state)
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)
  const [won, setWon] = useState(false)
  const [autoSolving, setAutoSolving] = useState(false)

  const { cats } = useCats(auth.isAuthorized)
  const { saveScore } = games

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
    }
  }, [n])

  useEffect(() => {
    if (!won) return
    saveScore(auth.user?.uid ?? 'guest', photoId, difficulty, {
      moves,
      timeSeconds: seconds,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won])

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
    if (autoSolving || !solveEnabled) return
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

  if (!photo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-light-pink dark:border-dark-purple border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Back / title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-light-pink/20 dark:border-dark-purple/20">
        <button
          onClick={() => navigate('/games')}
          className="flex items-center gap-1 text-sm font-medium hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        <div className="text-center">
          {catNames ? (
            <p className="font-heading font-semibold text-sm">{catNames}</p>
          ) : (
            <PawPrint size={16} className="text-[#E879B4]" aria-label="Untagged" />
          )}
          <p className="text-xs text-light-text/50 dark:text-dark-text/50">
            {difficulty.replace('x', '×')}
          </p>
        </div>
        <div className="w-16" />
      </div>

      {/* Glass game sub-header */}
      <GameSubHeader
        seconds={seconds}
        moves={moves}
        solveEnabled={solveEnabled}
        autoSolving={autoSolving}
        onShuffle={handleShuffle}
        onSolve={handleAutoSolve}
      />

      {/* Puzzle */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
        <PuzzleBoard
          imageUrl={photo.mediumUrl ?? photo.imageUrl}
          state={state}
          n={n}
          onMove={handleMove}
          disabled={won}
        />
      </div>

      <VictoryOverlay
        open={won}
        stars={getStarsForDifficulty(difficulty)}
        moves={moves}
        seconds={seconds}
      />
    </div>
  )
}
