import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { LogIn } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/gallery', label: 'Gallery' },
  { to: '/games', label: 'Games' },
]

export default function MobileDrawer({ open, onClose, auth }) {
  const firstLinkRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    return () => { html.style.overflow = prev }
  }, [open])

  useEffect(() => {
    if (open && firstLinkRef.current) {
      firstLinkRef.current.focus()
    }
  }, [open])

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
      {NAV_ITEMS.map((item, index) => (
        <NavLink
          key={item.to}
          ref={index === 0 ? firstLinkRef : undefined}
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

        {auth.user ? (
          <>
            <div className="inline-flex items-center gap-2.5 rounded-full px-5 py-3 backdrop-blur-md bg-white/60 dark:bg-white/[0.06] border border-[rgba(232,121,180,0.18)] dark:border-[rgba(199,125,255,0.2)]">
              {auth.user.photoURL ? (
                <img src={auth.user.photoURL} alt="" className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <span className="bg-morph grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold text-white">
                  {(auth.user.displayName || auth.user.email || '?').charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-medium text-light-text dark:text-dark-text">
                {auth.user.displayName || auth.user.email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => { auth.signOutUser(); onClose() }}
              className="text-sm opacity-70 hover:opacity-100 transition text-light-text dark:text-dark-text"
            >
              Sign out
            </button>
          </>
        ) : (
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
