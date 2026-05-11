import Logo from './Logo'
import Telegram from './icons/brand/Telegram'
import Instagram from './icons/brand/Instagram'
import GitHub from './icons/brand/GitHub'
import { useTheme } from '../hooks/useTheme'

const TG = import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/'
const IG = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/'
const GH = import.meta.env.VITE_GITHUB_URL || 'https://github.com/'

export default function Footer() {
  const { dark } = useTheme()

  return (
    <footer className="relative z-[2] bg-light-base dark:bg-dark-base mt-2 sm:mt-16">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-6 text-center sm:flex-row sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm sm:justify-start">
          <div className="flex items-center gap-2">
            <Logo theme={dark ? 'dark' : 'light'} size={26} />
            <span className="font-display text-[17px] font-semibold">My Cats</span>
          </div>
          <Dot />
          <span className="opacity-70">
            Made with{' '}
            <span
              className="inline-block animate-heart-beat motion-reduce:animate-none"
              style={{ color: dark ? '#E0A7C8' : '#E879B4' }}
            >
              ♥
            </span>{' '}
            for{' '}
            <span className="font-hand" style={{ color: dark ? '#E0A7C8' : '#E879B4' }}>Ira</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <DevLink href={TG} label="Telegram"><Telegram size={16} /></DevLink>
            <DevLink href={IG} label="Instagram"><Instagram size={16} /></DevLink>
            <DevLink href={GH} label="GitHub"><GitHub size={16} /></DevLink>
          </div>
          <Dot />
          <span className="text-xs opacity-40 tracking-wide">© 2026</span>
        </div>
      </div>
    </footer>
  )
}

function Dot() {
  return <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-current opacity-30" />
}

function DevLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="group relative grid h-8 w-8 place-items-center rounded-[10px] border transition hover:-translate-y-0.5"
      style={{
        background: 'rgba(199,125,255,0.08)',
        borderColor: 'rgba(199,125,255,0.2)',
      }}
    >
      <span className="relative z-10 opacity-70 transition group-hover:opacity-100 group-hover:text-white">
        {children}
      </span>
      <span
        aria-hidden
        className="bg-morph pointer-events-none absolute inset-0 rounded-[10px] opacity-0 transition group-hover:opacity-100"
      />
    </a>
  )
}
