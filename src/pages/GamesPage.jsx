import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Trophy, Play, PawPrint, Star, X } from 'lucide-react'
import { useCats } from '../hooks/useCats'
import { usePhotos } from '../hooks/usePhotos'
import { useScores } from '../hooks/useScores'
import CatFilterTabs from '../components/CatFilterTabs'

const DIFFICULTIES = [
  { label: '3×3', value: '3x3', stars: 1 },
  { label: '4×4', value: '4x4', stars: 2 },
  { label: '5×5', value: '5x5', stars: 3 },
]

function StarDots({ earned }) {
  const tooltipText = DIFFICULTIES.map((d, i) => `${d.label}: ${i < earned ? 'solved' : 'open'}`).join(' · ')
  return (
    <div className="flex items-center gap-1.5" title={tooltipText}>
      {DIFFICULTIES.map((d, i) => (
        <div
          key={d.value}
          className={`w-2 h-2 rounded-full transition-colors duration-300 ${
            i < earned
              ? 'bg-gradient-to-br from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink'
              : 'bg-light-text/15 dark:bg-dark-text/15'
          }`}
        />
      ))}
    </div>
  )
}

function PhotoRowSkeleton() {
  return (
    <div className="flex items-center gap-4 bg-light-card dark:bg-dark-card rounded-2xl p-3 shadow-sm animate-pulse">
      <div className="w-14 h-14 rounded-xl bg-light-text/8 dark:bg-dark-text/8 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 rounded-full bg-light-text/8 dark:bg-dark-text/8 w-2/5" />
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-light-text/8 dark:bg-dark-text/8" />
          ))}
        </div>
      </div>
      <div className="w-20 h-9 rounded-xl bg-light-text/8 dark:bg-dark-text/8 flex-shrink-0" />
    </div>
  )
}

export default function GamesPage({ auth }) {
  const navigate = useNavigate()
  const [selectedCat, setSelectedCat] = useState(null)
  const [showDiffModal, setShowDiffModal] = useState(null)

  const { cats } = useCats(auth.isAuthorized)
  const { photos, loading } = usePhotos(auth.isAuthorized, selectedCat)
  const { getScore, totalStars } = useScores(auth.isAuthorized)

  const catNames = (catIds) =>
    cats.filter(c => catIds?.includes(c.id)).map(c => c.name).join(' · ')

  const earnedForPhoto = (photoId) =>
    DIFFICULTIES.filter(d => getScore(auth.user?.uid, photoId, d.value)).length

  const totalSolvedDots = photos.reduce((sum, p) => sum + earnedForPhoto(p.id), 0)
  const totalDots = photos.length * 3
  const progressPct = totalDots > 0 ? (totalSolvedDots / totalDots) * 100 : 0

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">

      {/* Stats card (authorized only) */}
      {auth.isAuthorized && (
        <div className="mb-8 bg-light-card dark:bg-dark-card rounded-2xl p-5 shadow-sm ring-1 ring-light-pink/10 dark:ring-dark-purple/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Trophy size={18} strokeWidth={1.5} className="text-light-pink dark:text-dark-purple" />
              <span className="font-heading font-semibold text-base">
                {totalStars} Total Stars
              </span>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: Math.min(totalStars, 6) }).map((_, i) => (
                <Star key={i} size={11} strokeWidth={0} fill="currentColor" className="text-light-pink dark:text-dark-purple" />
              ))}
              {totalStars > 6 && (
                <span className="text-xs text-light-text/40 dark:text-dark-text/40 ml-1">+{totalStars - 6}</span>
              )}
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-light-bg dark:bg-dark-bg overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-light-text/40 dark:text-dark-text/40 mt-1.5">
            {totalSolvedDots} of {totalDots} puzzles solved
          </p>
        </div>
      )}

      {/* Cat filter */}
      <div className="mb-6">
        <CatFilterTabs
          cats={cats}
          selected={selectedCat}
          onSelect={setSelectedCat}
          isAuthorized={false}
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => <PhotoRowSkeleton key={i} />)}
        </div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-light-card dark:bg-dark-card flex items-center justify-center shadow-sm">
            <PawPrint size={28} strokeWidth={1.5} className="text-light-text/25 dark:text-dark-text/25" />
          </div>
          <div className="space-y-1">
            <p className="font-heading font-semibold text-light-text/60 dark:text-dark-text/60">No photos yet</p>
            <p className="text-sm text-light-text/40 dark:text-dark-text/40">Add a cat photo to start playing</p>
          </div>
          <Link
            to="/gallery"
            className="mt-1 text-sm font-medium text-light-pink dark:text-dark-purple hover:underline transition-colors"
          >
            Go to Gallery
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {photos.map((photo, i) => (
            <div
              key={photo.id}
              className="flex items-center gap-4 bg-light-card dark:bg-dark-card rounded-2xl p-3 shadow-sm ring-1 ring-light-pink/5 dark:ring-dark-purple/10 animate-[slide-up_0.35s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <img
                src={photo.imageUrl}
                alt=""
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate mb-1">
                  {catNames(photo.catIds) || 'Untitled'}
                </p>
                <StarDots earned={earnedForPhoto(photo.id)} />
              </div>
              <button
                onClick={() => setShowDiffModal(photo)}
                className="
                  flex items-center gap-1.5 px-4 py-2 rounded-xl shrink-0
                  bg-gradient-to-r from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink
                  text-white text-sm font-medium
                  shadow-[0_2px_8px_rgba(244,168,199,0.4)] dark:shadow-[0_2px_8px_rgba(199,125,255,0.3)]
                  hover:opacity-90 active:scale-[0.97]
                  transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                "
              >
                <Play size={13} strokeWidth={2} />
                Play
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Difficulty picker modal */}
      {showDiffModal && (
        <div
          className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4"
          onClick={() => setShowDiffModal(null)}
        >
          <div
            className="
              bg-light-bg dark:bg-dark-card rounded-2xl w-full max-w-xs p-6
              shadow-[0_24px_48px_rgba(0,0,0,0.2)]
              ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
              animate-[pop-in_0.25s_cubic-bezier(0.16,1,0.3,1)]
            "
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-lg">Choose Difficulty</h3>
              <button
                onClick={() => setShowDiffModal(null)}
                className="
                  w-7 h-7 rounded-full flex items-center justify-center
                  text-light-text/40 dark:text-dark-text/40
                  hover:text-light-text dark:hover:text-dark-text
                  hover:bg-light-text/8 dark:hover:bg-dark-text/8
                  transition-colors duration-200
                "
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  onClick={() => {
                    navigate(`/games/${showDiffModal.id}/${d.value}`)
                    setShowDiffModal(null)
                  }}
                  className="
                    flex items-center justify-between px-4 py-3 rounded-xl
                    bg-light-card dark:bg-dark-bg
                    ring-1 ring-light-pink/8 dark:ring-dark-purple/12
                    hover:bg-light-pink/8 dark:hover:bg-dark-purple/10
                    active:scale-[0.98]
                    transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  "
                >
                  <span className="font-medium text-sm">{d.label}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: d.stars }).map((_, i) => (
                      <Star key={i} size={13} strokeWidth={0} fill="currentColor" className="text-light-pink dark:text-dark-purple" />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </main>
  )
}
