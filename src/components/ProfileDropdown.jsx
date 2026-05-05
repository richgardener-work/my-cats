import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun, LogOut, Star } from 'lucide-react'

export default function ProfileDropdown({
  open, onClose, user, theme, onToggleTheme, onSignOut, totalStars = 0,
}) {
  const initial = (user?.displayName || user?.email || '?').charAt(0).toUpperCase()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          className="absolute right-0 top-[56px] z-40 w-[260px] rounded-2xl p-2 shadow-2xl"
          style={{
            background: theme === 'dark' ? 'rgba(26,8,40,0.92)' : 'rgba(255,251,245,0.96)',
            backdropFilter: 'blur(12px)',
            border: theme === 'dark' ? '1px solid rgba(199,125,255,0.2)' : '1px solid rgba(232,121,180,0.2)',
            color: theme === 'dark' ? '#F5EEF8' : '#2D1B28',
          }}
        >
          <div className="flex items-center gap-3 rounded-xl px-3 py-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="bg-morph grid h-10 w-10 place-items-center rounded-full text-white text-sm font-semibold flex-shrink-0">
                {initial}
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user?.displayName || 'Guest'}</div>
              <div className="truncate text-xs opacity-60">{user?.email || ''}</div>
            </div>
          </div>

          <MenuLink icon={<Star size={16} />} onClick={onClose} to="/games">
            <span>My stars</span>
            <span className="font-hand text-[18px] text-[#E879B4]">· {totalStars}</span>
          </MenuLink>

          <button
            onClick={onToggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>

          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
          >
            <LogOut size={16} /> Sign out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MenuLink({ icon, children, to, onClick }) {
  return (
    <a
      href={to}
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
    >
      {icon}
      <span className="flex-1">{children}</span>
    </a>
  )
}
