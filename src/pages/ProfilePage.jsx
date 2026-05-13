import { Navigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { usePhotos } from '../hooks/usePhotos'

export default function ProfilePage({ auth }) {
  const { user, userDoc, isAuthorized, signOutUser } = auth
  const { leaderboard, photoCount, loading } = useProfile(user?.uid)
  const { photos: allPhotos } = usePhotos(null, null)

  if (!isAuthorized) return <Navigate to="/" replace />

  const totalPossible = allPhotos.length * 3
  const initial = (user?.displayName || user?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-2xl mx-auto px-6 pt-8 pb-0">
      {/* Hero */}
      <div className="flex-shrink-0 pb-6 border-b border-black/7 dark:border-white/10">
        <div className="flex items-center gap-4">
          {/* Avatar — TODO: onClick → custom upload (<input type="file" accept="image/*">) */}
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              className="h-16 w-16 rounded-full object-cover shadow-md flex-shrink-0"
            />
          ) : (
            <div className="bg-morph h-16 w-16 rounded-full grid place-items-center text-white text-2xl font-bold shadow-md flex-shrink-0">
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold truncate">{user?.displayName || user?.email}</div>
            <div className="text-xs opacity-40 mt-0.5 truncate">{user?.email}</div>
          </div>
          <button
            onClick={signOutUser}
            className="flex-shrink-0 text-xs text-red-400 border border-red-400/25 rounded-full px-3 py-1.5 hover:bg-red-500/10 transition"
          >
            Sign out
          </button>
        </div>

        {/* Stats strip */}
        <div className="mt-5 grid grid-cols-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/6 dark:border-white/8 overflow-hidden">
          <StatCell label="Stars" value={
            <span className="text-[#E879B4]">{userDoc?.totalStars ?? 0} ⭐</span>
          } />
          <StatCell label="Photos" value={photoCount} />
          <StatCell label="Puzzles" value={
            <span>
              {userDoc?.puzzlesSolved ?? 0}
              <span className="text-sm font-medium opacity-35"> / {totalPossible}</span>
            </span>
          } />
          <StatCell label="Played" value={userDoc?.totalGames ?? 0} last />
        </div>
      </div>

      {/* Leaderboard placeholder */}
      <div className="flex-1 min-h-0 pt-4">
        <div className="text-[10px] uppercase tracking-[0.14em] opacity-40 mb-3">Leaderboard</div>
      </div>
    </div>
  )
}

function StatCell({ label, value, last = false }) {
  return (
    <div className={`py-3 px-2 text-center${last ? '' : ' border-r border-black/6 dark:border-white/8'}`}>
      <div className="text-xl font-bold leading-none">{value}</div>
      <div className="text-[9px] uppercase tracking-[0.08em] opacity-40 mt-1.5">{label}</div>
    </div>
  )
}
