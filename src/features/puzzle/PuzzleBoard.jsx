import { useEffect, useState, useCallback } from 'react'
import { applyMove, getValidMoves } from './puzzleLogic'

export default function PuzzleBoard({ imageUrl, state, n, onMove, disabled }) {
  const [tileImages, setTileImages] = useState([])
  const [animating, setAnimating] = useState(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const size = 600
      const tileSize = size / n
      const tiles = []
      for (let i = 0; i < n * n; i++) {
        const offscreen = document.createElement('canvas')
        offscreen.width = tileSize
        offscreen.height = tileSize
        const ctx = offscreen.getContext('2d')
        const srcCol = i % n
        const srcRow = Math.floor(i / n)
        ctx.drawImage(img, srcCol * tileSize, srcRow * tileSize, tileSize, tileSize, 0, 0, tileSize, tileSize)
        tiles.push(offscreen.toDataURL())
      }
      setTileImages(tiles)
    }
    img.src = imageUrl
  }, [imageUrl, n])

  const handleTileClick = useCallback((tileIdx) => {
    if (disabled || animating !== null) return
    const valid = getValidMoves(state, n)
    if (!valid.includes(tileIdx)) return
    setAnimating(tileIdx)
    setTimeout(() => {
      onMove(tileIdx)
      setAnimating(null)
    }, 150)
  }, [state, n, onMove, disabled, animating])

  const containerSize = Math.min(window.innerWidth - 32, 480)
  const tileSize = containerSize / n

  return (
    <div
      className="grid mx-auto rounded-xl overflow-hidden shadow-lg"
      style={{
        width: containerSize,
        height: containerSize,
        gridTemplateColumns: `repeat(${n}, 1fr)`,
      }}
    >
      {state.map((tileValue, idx) => {
        const isEmpty = tileValue === 0
        const isAnimating = animating === idx
        return (
          <div
            key={idx}
            onClick={() => handleTileClick(idx)}
            className={`relative overflow-hidden transition-all cursor-pointer select-none border border-white/10 ${
              isEmpty ? 'bg-light-text/10 dark:bg-dark-text/10' : 'hover:brightness-105'
            } ${isAnimating ? 'scale-95 opacity-80' : ''}`}
            style={{ width: tileSize, height: tileSize, transitionDuration: '150ms' }}
          >
            {!isEmpty && tileImages[tileValue - 1] && (
              <img
                src={tileImages[tileValue - 1]}
                alt=""
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
