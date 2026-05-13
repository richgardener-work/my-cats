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

      {/* Leaderboard */}
      <div className="flex flex-col flex-1 min-h-0 pt-4">
        <div className="text-[10px] uppercase tracking-[0.14em] opacity-40 mb-3 flex-shrink-0">
          Leaderboard
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 pr-0.5">
          {loading ? (
            <div className="py-10 text-center text-sm opacity-40">Loading…</div>
          ) : (
            leaderboard.map((u, i) => {
              const isMe = u.uid === user?.uid
              const rank = i + 1
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null
              const uInitial = (u.displayName || u.email || '?').charAt(0).toUpperCase()
              return (
                <div
                  key={u.uid}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 flex-shrink-0 ${
                    isMe
                      ? 'bg-[#E879B4]/10 border border-[#E879B4]/25'
                      : 'bg-black/[0.025] dark:bg-white/[0.03]'
                  }`}
                >
                  <span className="w-6 text-center text-base flex-shrink-0">
                    {medal ?? <span className="text-xs opacity-40">{rank}</span>}
                  </span>
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-bold flex-shrink-0 ${
                      isMe ? 'bg-morph text-white' : 'bg-black/10 dark:bg-white/10'
                    }`}>
                      {uInitial}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-sm font-medium truncate">
                    {u.displayName || u.email}
                    {isMe && <span className="text-xs font-normal opacity-40 ml-1">· you</span>}
                  </div>
                  <div className={`text-sm font-bold flex-shrink-0 ${isMe ? 'text-[#E879B4]' : 'opacity-55'}`}>
                    {u.totalStars ?? 0} ⭐
                  </div>
                </div>
              )
            })
          )}
        </div>
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
