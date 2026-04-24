import { NavLink } from 'react-router-dom'
import { LogIn, CircleUserRound } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/gallery', label: 'Gallery' },
  { to: '/games', label: 'Games' },
]

export default function MobileDrawer({ open, onClose, auth }) {
  const linkClass = ({ isActive }) =>
    `block px-5 py-3.5 text-base font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
      isActive
        ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#E879B4] to-[#C9A0DC]'
        : 'text-light-text dark:text-dark-text'
    }`

  return (
    <>
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? 'bg-black/40 backdrop-blur-sm pointer-events-auto' : 'bg-transparent pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-light-base/95 dark:bg-dark-base/95 backdrop-blur-xl rounded-t-3xl shadow-2xl shadow-light-purple/10 dark:shadow-dark-purple/10 border-t border-black/5 dark:border-white/10 transform transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="w-10 h-1 rounded-full bg-light-text/20 dark:bg-dark-text/20 mx-auto mt-3" />

        <nav className="pt-4 pb-10 space-y-0.5">
          {NAV_ITEMS.map((item, i) => (
            <div
              key={item.to}
              className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
              style={{ transitionDelay: open ? `${80 + i * 50}ms` : '0ms' }}
            >
              <NavLink to={item.to} end={item.end} className={linkClass} onClick={onClose}>
                {item.label}
              </NavLink>
            </div>
          ))}

          <div
            className={`px-5 pt-4 border-t border-black/5 dark:border-white/10 mt-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: open ? '230ms' : '0ms' }}
          >
            {auth.user ? (
              <button
                onClick={() => { auth.signOutUser(); onClose() }}
                className="flex items-center gap-2.5 text-light-text dark:text-dark-text hover:opacity-70 transition-opacity"
              >
                <CircleUserRound size={18} strokeWidth={1.5} />
                <span className="text-sm">{auth.user.displayName}</span>
              </button>
            ) : (
              <button
                onClick={() => { auth.signIn(); onClose() }}
                className="flex items-center gap-2.5 text-light-text dark:text-dark-text hover:opacity-70 transition-opacity"
              >
                <LogIn size={18} strokeWidth={1.5} />
                <span className="text-sm font-medium">Sign In with Google</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}
