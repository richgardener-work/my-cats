import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Sun, Moon, LogIn, LogOut,
  Image as ImageIcon, Gamepad2,
} from 'lucide-react'
import AuthModal from './AuthModal'
import Logo from './Logo'
import ProfileDropdown from './ProfileDropdown'

function PillNavLink({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-1.5 rounded-full px-3 md:px-3.5 py-1.5 text-[13px] transition',
          isActive
            ? 'bg-morph text-white shadow-md'
            : 'text-current opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10',
        ].join(' ')
      }
    >
      <span className="grid h-4 w-4 place-items-center">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </NavLink>
  )
}

function PillButton({ ariaLabel, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 rounded-full px-2 md:px-3 py-1 text-[13px] opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition"
    >
      {children}
    </button>
  )
}

export default function Header({ theme, auth, totalStars, authOpen, onAuthOpen, onAuthClose }) {
  const [signOutOpen, setSignOutOpen] = useState(false)
  const pillWrapRef = useRef(null)

  useEffect(() => {
    if (!signOutOpen) return
    const onDown = (e) => {
      if (pillWrapRef.current && !pillWrapRef.current.contains(e.target)) setSignOutOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setSignOutOpen(false) }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [signOutOpen])

  const isDark = theme.dark
  const themeStr = isDark ? 'dark' : 'light'

  const initial = auth.user
    ? (auth.user.displayName || auth.user.email || '?').charAt(0).toUpperCase()
    : null

  return (
    <header
      className="sticky top-0 z-30 px-4"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <div
        className="mx-auto grid max-w-6xl items-center gap-3 rounded-full px-4 py-2 shadow-lg"
        style={{
          gridTemplateColumns: '1fr auto 1fr',
          background: isDark ? 'rgba(15,5,24,0.5)' : 'rgba(255,251,245,0.7)',
          backdropFilter: 'blur(12px) saturate(160%)',
          WebkitBackdropFilter: 'blur(12px) saturate(160%)',
        }}
      >
        {/* LEFT — logo */}
        <Link to="/" className="justify-self-start flex items-center gap-2 min-w-0">
          <Logo theme={themeStr} size={32} glow={isDark} />
          <span className="font-display text-lg whitespace-nowrap">My Cats</span>
        </Link>

        {/* CENTER — pill stays fixed; sign-out floats outside to the right */}
        <div
          ref={pillWrapRef}
          className="justify-self-center relative"
        >
          <nav
            aria-label="Primary"
            className="inline-flex items-center gap-1 rounded-full border border-pink-300/20 bg-white/[0.04] p-1 dark:border-purple-300/20"
          >
            <PillNavLink to="/gallery" icon={<ImageIcon size={16} />} label="Gallery" />
            <PillNavLink to="/games" icon={<Gamepad2 size={16} />} label="Games" />

            {auth.user ? (
              <PillButton
                ariaLabel="Profile"
                onClick={() => setSignOutOpen((v) => !v)}
              >
                {auth.user?.photoURL ? (
                  <img
                    src={auth.user.photoURL}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-[22px] w-[22px] rounded-full object-cover"
                  />
                ) : (
                  <span className="bg-morph grid h-[22px] w-[22px] place-items-center rounded-full text-[11px] font-semibold text-white">
                    {initial}
                  </span>
                )}
                <span className="hidden md:inline">Profile</span>
              </PillButton>
            ) : (
              <PillButton ariaLabel="Sign in" onClick={onAuthOpen}>
                <span className="grid h-4 w-4 place-items-center"><LogIn size={16} /></span>
                <span className="hidden md:inline">Sign in</span>
              </PillButton>
            )}
          </nav>

          {/* Sign-out flies out to the right, outside the pill */}
          {auth.user && (
            <button
              type="button"
              onClick={() => { setSignOutOpen(false); auth.signOutUser() }}
              aria-label="Sign out"
              style={{
                position: 'absolute',
                left: 'calc(100% + 6px)',
                top: '50%',
                transform: signOutOpen
                  ? 'translateY(-50%) translateX(0px)'
                  : 'translateY(-50%) translateX(-8px)',
                opacity: signOutOpen ? 1 : 0,
                pointerEvents: signOutOpen ? 'auto' : 'none',
                transition: 'opacity 0.2s ease, transform 0.25s cubic-bezier(0.25,1,0.5,1)',
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-2 md:px-3 py-1 text-[13px] text-red-400 hover:bg-red-500/10 whitespace-nowrap border border-red-400/20"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Sign out</span>
            </button>
          )}

          <ProfileDropdown
            open={signOutOpen}
            onClose={() => setSignOutOpen(false)}
            user={auth.user}
            theme={themeStr}
            onToggleTheme={theme.toggle}
            onSignOut={() => { setSignOutOpen(false); auth.signOutUser() }}
            totalStars={totalStars}
          />
        </div>

        {/* RIGHT — theme */}
        <div className="justify-self-end flex items-center gap-2">
          <button
            type="button"
            onClick={theme.toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      <AuthModal
        open={authOpen}
        onClose={onAuthClose}
        onGoogle={async () => { await auth.signInUser(); onAuthClose() }}
        pending={auth.signInPending}
        theme={themeStr}
      />
    </header>
  )
}
