import { useNavigate } from 'react-router-dom'
import { Star, Timer, Footprints } from 'lucide-react'
import { useEffect, useState } from 'react'

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.5}s`,
    color: ['#F4A8C7', '#C9A0DC', '#F9D976', '#7BE8A9', '#74B9FF'][i % 5],
    size: 6 + Math.random() * 8,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: p.delay,
            animationDuration: `${1.5 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function VictoryOverlay({ stars, moves, timeSeconds, onPlayNext, onBack }) {
  const [visibleStars, setVisibleStars] = useState(0)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setVisibleStars(i)
      if (i >= stars) clearInterval(interval)
    }, 300)
    return () => clearInterval(interval)
  }, [stars])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <Confetti />
      <div className="relative bg-light-bg dark:bg-dark-bg rounded-2xl p-8 text-center shadow-2xl max-w-sm w-full mx-4">
        <h2 className="font-heading text-3xl font-bold mb-2">Puzzle Solved!</h2>

        <div className="flex items-center justify-center gap-2 my-6">
          {Array.from({ length: 3 }, (_, i) => (
            <Star
              key={i}
              size={36}
              className={`transition-all duration-300 ${
                i < visibleStars
                  ? 'text-light-pink dark:text-dark-purple fill-current scale-110'
                  : 'text-light-text/20 dark:text-dark-text/20'
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-light-text/60 dark:text-dark-text/60 mb-6">
          +{stars} star{stars !== 1 ? 's' : ''}
        </p>

        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 text-sm">
            <Timer size={16} className="text-light-pink dark:text-dark-purple" />
            <span>{formatTime(timeSeconds)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Footprints size={16} className="text-light-pink dark:text-dark-purple" />
            <span>{moves} moves</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onPlayNext}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Play Next
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 rounded-xl border border-light-pink/30 dark:border-dark-purple/30 font-medium hover:opacity-70 transition-opacity"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    </div>
  )
}
