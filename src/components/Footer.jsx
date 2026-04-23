import { Send, Link, Heart } from 'lucide-react'

const TELEGRAM_URL = 'https://t.me/your_username'
const INSTAGRAM_URL = 'https://instagram.com/your_username'

export default function Footer() {
  return (
    <footer className="bg-light-card dark:bg-dark-card border-t border-light-pink/20 dark:border-dark-purple/20 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-3 text-center">

        <span className="font-heading text-xl font-semibold tracking-tight">
          My Cats
        </span>

        <p className="flex items-center gap-1.5 text-sm text-light-text/55 dark:text-dark-text/55">
          Made with
          <Heart
            size={13}
            strokeWidth={1.5}
            className="fill-light-pink/70 text-light-pink dark:fill-dark-pink/70 dark:text-dark-pink"
          />
          for Ira
        </p>

        <div className="flex items-center gap-5 mt-1">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram"
            className="text-light-text/40 dark:text-dark-text/40 hover:text-light-pink dark:hover:text-dark-purple transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.92]"
          >
            <Send size={17} strokeWidth={1.5} />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="text-light-text/40 dark:text-dark-text/40 hover:text-light-pink dark:hover:text-dark-purple transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.92]"
          >
            <Link size={17} strokeWidth={1.5} />
          </a>
        </div>

        <p className="text-xs text-light-text/30 dark:text-dark-text/30 mt-1">
          © 2025
        </p>
      </div>
    </footer>
  )
}
