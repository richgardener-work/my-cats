import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Sun, Moon, LogIn, CircleUserRound } from 'lucide-react'
import MobileDrawer from './MobileDrawer'
import AuthModal from './AuthModal'
import ProfileDropdown from './ProfileDropdown'

export default function Header({ theme, auth, authOpen, onAuthOpen, onAuthClose }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const themeStr = theme.dark ? 'dark' : 'light'

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pb-0.5 ${
      isActive
        ? 'text-transparent bg-clip-text bg-gradient-to-r from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gradient-to-r after:from-light-pink after:to-light-purple dark:after:from-dark-purple dark:after:to-dark-pink'
        : 'text-light-text/80 dark:text-dark-text/80 hover:text-light-text dark:hover:text-dark-text'
    }`

  return (
    <>
      <header className="sticky top-0 z-30 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-light-pink/20 dark:border-dark-purple/20 shadow-[inset_0_-1px_0_rgba(244,168,199,0.1)] dark:shadow-[inset_0_-1px_0_rgba(199,125,255,0.1)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src={theme.dark ? '/my-cats/dark_logo.svg' : '/my-cats/light_logo.svg'}
              alt="My Cats"
              className="h-8 w-8 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <span className="font-heading font-semibold text-lg tracking-tight">My Cats</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/gallery" className={navLinkClass}>Gallery</NavLink>
            <NavLink to="/games" className={navLinkClass}>Games</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={theme.toggle}
              className="p-2 rounded-full hover:bg-light-pink/15 dark:hover:bg-dark-purple/15 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95"
              aria-label="Toggle theme"
            >
              {theme.dark
                ? <Sun size={18} strokeWidth={1.5} />
                : <Moon size={18} strokeWidth={1.5} />
              }
            </button>

            <div className="relative hidden md:block">
              {auth.user ? (
                <>
                  <button
                    onClick={() => setProfileOpen(true)}
                    className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity duration-200 active:scale-[0.98]"
                  >
                    <CircleUserRound size={18} strokeWidth={1.5} />
                    <span>{auth.user.displayName?.split(' ')[0]}</span>
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
                </>
              ) : (
                <button
                  onClick={onAuthOpen}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-gradient-to-r from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink text-white hover:opacity-90 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] shadow-sm"
                >
                  <LogIn size={16} strokeWidth={1.5} />
                  Sign In
                </button>
              )}
            </div>

            <button
              className="md:hidden relative p-2 rounded-full hover:bg-light-pink/15 dark:hover:bg-dark-purple/15 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-95 w-9 h-9 flex flex-col items-center justify-center gap-1"
              onClick={() => setDrawerOpen(v => !v)}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            >
              <span className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${drawerOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
              <span className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${drawerOpen ? '-rotate-45 -translate-y-[3px]' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        auth={auth}
        dark={theme.dark}
        toggleTheme={theme.toggle}
      />

      <AuthModal
        open={authOpen}
        onClose={onAuthClose}
        onGoogle={async () => { await auth.signInUser(); onAuthClose() }}
        pending={auth.signInPending}
        theme={themeStr}
      />
    </>
  )
}
