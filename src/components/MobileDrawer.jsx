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
    <>
      <div
        data-testid="drawer-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-40 backdrop-blur-xl saturate-[140%] bg-light-base/55 dark:bg-dark-base/55"
      />

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
          className={({ isActive }) =>
            [
              'rounded-full px-8 py-3.5 min-w-[180px] text-center text-sm font-medium transition',
              'hover:-translate-y-0.5 active:scale-[0.98]',
              isActive
                ? 'bg-morph text-white border border-transparent shadow-[0_8px_22px_rgba(232,121,180,0.4)]'
                : 'backdrop-blur-md bg-white/60 dark:bg-white/[0.06] border border-[rgba(232,121,180,0.18)] dark:border-[rgba(199,125,255,0.2)] text-light-text dark:text-dark-text',
            ].join(' ')
          }
        >
          {item.label}
        </NavLink>
      ))}

        <div className="h-px w-15 mx-auto bg-black/[0.08] dark:bg-white/[0.12]" aria-hidden="true" />

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
    </>
  )
}
