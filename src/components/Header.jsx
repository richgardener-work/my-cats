import { Link, NavLink } from 'react-router-dom'
import { Sun, Moon, LogIn, Image as ImageIcon, Gamepad2 } from 'lucide-react'
import { useState } from 'react'
import AuthModal from './AuthModal'
import ProfileDropdown from './ProfileDropdown'
import Logo from './Logo'

function PillSeg({ to, icon, label, end = false }) {
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

export default function Header({ theme, auth, totalStars, authOpen, onAuthOpen, onAuthClose }) {
  const [profileOpen, setProfileOpen] = useState(false)
  const isDark = theme.dark
  const themeStr = isDark ? 'dark' : 'light'

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

        {/* CENTER — pill (Gallery, Games; Profile/Sign-in lands in Task 7) */}
        <nav
          aria-label="Primary"
          className="justify-self-center inline-flex items-center gap-1 rounded-full border border-pink-300/20 bg-white/[0.04] p-1 dark:border-purple-300/20"
        >
          <PillSeg to="/gallery" icon={<ImageIcon size={16} />} label="Gallery" />
          <PillSeg to="/games" icon={<Gamepad2 size={16} />} label="Games" />
        </nav>

        {/* RIGHT — theme + (temp) signin/profile */}
        <div className="justify-self-end flex items-center gap-2">
          <button
            type="button"
            onClick={theme.toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {!auth.user ? (
            <button
              type="button"
              onClick={onAuthOpen}
              className="bg-morph inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5"
              style={{ boxShadow: '0 8px 18px rgba(232,121,180,0.35)' }}
            >
              <LogIn size={14} /> Sign In
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                aria-label="Profile menu"
                className="bg-morph grid h-9 w-9 place-items-center rounded-full text-white text-sm font-semibold ring-2 ring-pink-400/50 ring-offset-1 ring-offset-transparent transition"
              >
                {(auth.user.displayName || auth.user.email || '?').charAt(0).toUpperCase()}
              </button>
              <ProfileDropdown
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                user={auth.user}
                theme={themeStr}
                onToggleTheme={theme.toggle}
                onSignOut={() => { setProfileOpen(false); auth.signOutUser() }}
                totalStars={totalStars}
              />
            </div>
          )}
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
