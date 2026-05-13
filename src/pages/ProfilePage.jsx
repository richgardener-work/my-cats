import { Navigate } from 'react-router-dom'
import { LogOut, Star } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { usePhotos } from '../hooks/usePhotos'
import CountUp from '../components/CountUp'

function firstNameOf(user) {
  const display = user?.displayName?.trim()
  if (display) return display.split(/\s+/)[0]
  const email = user?.email
  if (email) return email.split('@')[0]
  return 'friend'
}

function Pill({ value, label, total }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/6 bg-black/[0.04] px-3 py-1.5 text-xs dark:border-white/8 dark:bg-white/[0.05]">
      <span className="font-semibold">{value}</span>
      {total != null && <span className="opacity-40">/ {total}</span>}
      <span className="opacity-60">{label}</span>
    </span>
  )
}

export default function ProfilePage({ auth }) {
  const { user, userDoc, isAuthorized, signOutUser } = auth
  const { photoCount } = useProfile(user?.uid)
  const { photos: allPhotos } = usePhotos(null, null)

  if (!isAuthorized) return <Navigate to="/" replace />

  const firstName = firstNameOf(user)
  const totalStars = userDoc?.totalStars ?? 0
  const puzzlesSolved = userDoc?.puzzlesSolved ?? 0
  const totalGames = userDoc?.totalGames ?? 0
  const totalPossible = allPhotos.length * 3
  const initial = (user?.displayName || user?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="w-full mx-auto max-w-6xl px-6 pt-8 pb-0 sm:pt-14">
      {/* Hero */}
      <header className="flex flex-wrap items-end gap-x-6 gap-y-3">
        {/* Left column */}
        <div className="min-w-0 flex-[7]">
          <div className="text-xs uppercase tracking-[0.2em] opacity-60">Just you</div>
          <h1 className="mt-2 font-display font-wonky text-5xl">
            Hello, {firstName}
            <span className="ml-2 inline-flex items-center gap-1.5 font-hand-accent text-[0.6em] text-[#E879B4]">
              · <CountUp value={totalStars} />
              <Star size={20} fill="currentColor" strokeWidth={0} />
            </span>
          </h1>
          <p className="mt-2 text-sm opacity-70">where the stars live</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill value={photoCount} label="photos" />
            <Pill value={puzzlesSolved} total={totalPossible} label="puzzles" />
            <Pill value={totalGames} label="played" />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-[3] flex-col items-end gap-2">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-full object-cover shadow-md"
            />
          ) : (
            <div className="bg-morph grid h-20 w-20 place-items-center rounded-full text-3xl font-bold text-white shadow-md">
              {initial}
            </div>
          )}
          <div className="max-w-full truncate text-xs opacity-40">{user?.email}</div>
          <button
            type="button"
            onClick={signOutUser}
            aria-label="Sign out"
            className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 px-3 py-1 text-[13px] text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Leaderboard placeholder — filled in Task 4 */}
      <div className="mt-12">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60">Leaderboard</div>
      </div>
    </div>
  )
}
