import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Sun, Moon, LogIn, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MobileDrawer from './MobileDrawer'
import AuthModal from './AuthModal'
import ProfileDropdown from './ProfileDropdown'
import Logo from './Logo'

function NavPill({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `rounded-full px-4 py-1.5 text-sm transition ${
          isActive
            ? 'bg-morph text-white shadow-md'
            : 'opacity-75 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function Header({ theme, auth, authOpen, onAuthOpen, onAuthClose }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const isDark = theme.dark
  const themeStr = isDark ? 'dark' : 'light'

  return (
    <header className="sticky top-0 z-30 px-4 pt-4">
      <div
        className="mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2 shadow-lg"
        style={{
          background: isDark ? 'rgba(15,5,24,0.5)' : 'rgba(255,251,245,0.7)',
          border: isDark ? '1px solid rgba(199,125,255,0.18)' : '1px solid rgba(232,121,180,0.18)',
          backdropFilter: 'blur(12px) saturate(160%)',
        }}
      >
        <Link to="/" className="flex items-center gap-2">
          <Logo theme={themeStr} size={32} glow={isDark} />
          <span className="font-display text-lg">My Cats</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavPill to="/">Home</NavPill>
          <NavPill to="/gallery">Gallery</NavPill>
          <NavPill to="/games">Games</NavPill>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={theme.toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {!auth.user ? (
            <button
              onClick={onAuthOpen}
              className="bg-morph inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5"
              style={{ boxShadow: '0 8px 18px rgba(232,121,180,0.35)' }}
            >
              <LogIn size={14} /> Sign In
            </button>
          ) : (
            <div className="relative">
              <button
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
                totalStars={auth.totalStars || 0}
              />
            </div>
          )}

          <button
            onClick={() => setDrawerOpen((v) => !v)}
            className="md:hidden grid h-9 w-9 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition relative"
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={drawerOpen ? 'x' : 'menu'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.18 }}
                className="grid place-items-center"
              >
                {drawerOpen ? <X size={18} /> : <Menu size={18} />}
              </motion.span>
            </AnimatePresence>
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
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        auth={auth}
        dark={isDark}
        toggleTheme={theme.toggle}
      />
    </header>
  )
}
