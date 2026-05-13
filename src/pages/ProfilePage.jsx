import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { LogOut, Star, Image as ImageIcon, Puzzle, Gamepad2, Pencil } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { usePhotos } from '../hooks/usePhotos'
import CountUp from '../components/CountUp'

function firstNameOf(user, userDoc) {
  if (userDoc?.nickname?.trim()) return userDoc.nickname.trim()
  const display = user?.displayName?.trim()
  if (display) return display.split(/\s+/)[0]
  const email = user?.email
  if (email) return email.split('@')[0]
  return 'friend'
}

function NicknameEdit({ currentNickname, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(currentNickname ?? '')

  function save() {
    onSave(draft.trim() || null)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex w-full items-center overflow-hidden rounded-full border border-dashed border-[#E879B4] px-3 py-1.5">
        <input
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          onBlur={save}
          placeholder="your name"
          className="min-w-0 flex-1 bg-transparent outline-none"
          style={{ fontSize: '16px', lineHeight: 1 }}
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="flex w-full items-center gap-1.5 rounded-full border border-dashed border-[#E879B4] px-3 py-1.5 text-xs text-[#E879B4] transition hover:bg-[#E879B4]/10"
    >
      <Pencil size={13} className="flex-shrink-0" />
      <span>Name</span>
    </button>
  )
}

function Pill({ value, label, total, icon: Icon }) {
  return (
    <span className="flex w-full items-center gap-1.5 rounded-full border border-black/6 bg-black/[0.04] px-3 py-1.5 text-xs dark:border-white/8 dark:bg-white/[0.05]">
      {Icon && <Icon size={12} className="flex-shrink-0 opacity-50" />}
      <span className="font-semibold">{value}</span>
      {total != null && <span className="opacity-40 hidden sm:inline">/ {total}</span>}
      <span className="ml-auto opacity-60 hidden sm:inline">{label}</span>
    </span>
  )
}

export default function ProfilePage({ auth }) {
  const { user, userDoc, isAuthorized, signOutUser, updateNickname } = auth
  const { photoCount, leaderboard, loading } = useProfile(user?.uid)
  const { photos: allPhotos } = usePhotos(null, null)

  if (!isAuthorized) return <Navigate to="/" replace />

  const firstName = firstNameOf(user, userDoc)
  const totalStars = userDoc?.totalStars ?? 0
  const puzzlesSolved = userDoc?.puzzlesSolved ?? 0
  const totalGames = userDoc?.totalGames ?? 0
  const totalPossible = allPhotos.length * 3
  const initial = (user?.displayName || user?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="w-full mx-auto max-w-6xl px-6 pt-8 pb-0 sm:pt-14">
      {/* Hero — 2×2 grid: left 70% / right 30%, top text / bottom account */}
      <header className="grid grid-cols-[7fr_3fr] gap-x-6 gap-y-6">
        {/* Top-left: eyebrow + H1 + subtitle */}
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.2em] opacity-60">Just you</div>
          <h1 className="mt-2 font-display font-wonky text-5xl">
            Hello, {firstName}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm opacity-70">
            where the
            <span className="inline-flex items-center gap-1 font-hand-accent text-[#E879B4] not-italic opacity-100">
              <CountUp value={totalStars} />
              <Star size={13} fill="currentColor" strokeWidth={0} />
            </span>
            live
          </p>
        </div>

        {/* Top-right: name edit + pills */}
        <div className="flex flex-col justify-end gap-2">
          <NicknameEdit currentNickname={userDoc?.nickname} onSave={updateNickname} />
          <Pill value={photoCount} label="photos" icon={ImageIcon} />
          <Pill value={puzzlesSolved} total={totalPossible} label="puzzles" icon={Puzzle} />
          <Pill value={totalGames} label="played" icon={Gamepad2} />
        </div>

        {/* Bottom-left: Google account — avatar + full name + email */}
        <div className="flex items-center gap-3 border-t border-black/6 pt-4 dark:border-white/8">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              referrerPolicy="no-referrer"
              className="h-11 w-11 flex-shrink-0 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div className="bg-morph grid h-11 w-11 flex-shrink-0 place-items-center rounded-full text-lg font-bold text-white shadow-sm">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user?.displayName}</div>
            <div className="truncate text-xs opacity-40">{user?.email}</div>
          </div>
        </div>

        {/* Bottom-right: sign out — aligned with account row */}
        <div className="flex items-center justify-end border-t border-black/6 pt-4 dark:border-white/8">
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

      {/* Leaderboard */}
      <section className="mt-12">
        <div className="text-xs uppercase tracking-[0.2em] opacity-60 mb-4">Leaderboard</div>
        {loading ? (
          <div className="py-10 text-center text-sm opacity-40">Loading…</div>
        ) : (
          <div className="rounded-2xl border border-black/8 dark:border-white/10 max-h-[420px] overflow-y-auto">
            {leaderboard.map((u, i) => {
              const isMe = u.uid === user?.uid
              const rank = i + 1
              const uInitial = (u.displayName || u.email || '?').charAt(0).toUpperCase()
              return (
                <div
                  key={u.uid}
                  className={`flex items-center gap-3 px-4 py-2.5 ${
                    i > 0 ? 'border-t border-black/5 dark:border-white/8' : ''
                  } ${
                    isMe ? 'bg-[#E879B4]/10' : 'bg-white/80 dark:bg-dark-card/80'
                  }`}
                >
                  <span className={`font-hand w-5 flex-shrink-0 text-center text-sm ${isMe ? 'text-[#E879B4]' : 'opacity-30'}`}>
                    {rank}
                  </span>
                  {u.photoURL ? (
                    <img
                      src={u.photoURL}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-xs font-bold ${
                      isMe ? 'bg-morph text-white' : 'bg-black/10 dark:bg-white/10'
                    }`}>
                      {uInitial}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 truncate text-sm font-medium">
                    {u.nickname ?? u.displayName ?? u.email}
                    {isMe && <span className="ml-1 text-xs font-normal opacity-40">· you</span>}
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    <span className="font-hand inline-flex items-center gap-1 text-base text-[#E879B4]">
                      <Star size={13} fill="currentColor" strokeWidth={0} /> {u.totalStars ?? 0}
                    </span>
                    <span className="hidden items-center gap-1 text-xs opacity-50 sm:inline-flex">
                      <ImageIcon size={11} /> {u.photoCount ?? 0}
                    </span>
                    <span className="hidden items-center gap-1 text-xs opacity-50 sm:inline-flex">
                      <Puzzle size={11} /> {u.puzzlesSolved ?? 0}
                    </span>
                    <span className="hidden items-center gap-1 text-xs opacity-50 sm:inline-flex">
                      <Gamepad2 size={11} /> {u.totalGames ?? 0}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
