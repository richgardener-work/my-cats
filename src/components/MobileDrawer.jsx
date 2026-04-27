import { NavLink } from 'react-router-dom'
import { LogIn } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/gallery', label: 'Gallery' },
  { to: '/games', label: 'Games' },
]

export default function MobileDrawer({ open, onClose, auth }) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onClose}
          className="rounded-full px-8 py-3.5 min-w-[180px] text-center text-sm font-medium"
        >
          {item.label}
        </NavLink>
      ))}

      <div className="h-px w-15 mx-auto" aria-hidden="true" />

      {!auth.user && (
        <button
          type="button"
          onClick={() => { auth.signIn(); onClose() }}
          className="bg-morph inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white"
          style={{ boxShadow: '0 8px 22px rgba(232,121,180,0.4)' }}
        >
          <LogIn size={14} /> Sign in with Google
        </button>
      )}
    </div>
  )
}
