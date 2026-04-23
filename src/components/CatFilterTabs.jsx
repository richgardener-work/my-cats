import { PawPrint, Plus } from 'lucide-react'

export default function CatFilterTabs({ cats, selected, onSelect, onAddCat, isAuthorized }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        onClick={() => onSelect(null)}
        className={`
          group flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]
          ${selected === null
            ? 'bg-gradient-to-r from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink text-white shadow-[0_2px_10px_rgba(244,168,199,0.45)] dark:shadow-[0_2px_10px_rgba(199,125,255,0.35)]'
            : 'bg-light-card dark:bg-dark-card text-light-text/65 dark:text-dark-text/65 hover:text-light-text dark:hover:text-dark-text hover:bg-light-pink/10 dark:hover:bg-dark-purple/10'
          }
        `}
      >
        <PawPrint
          size={13}
          strokeWidth={1.5}
          className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
        />
        All Cats
      </button>

      {cats.map((cat, i) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          style={{ animationDelay: `${i * 60}ms` }}
          className={`
            px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]
            ${selected === cat.id
              ? 'bg-gradient-to-r from-light-pink to-light-purple dark:from-dark-purple dark:to-dark-pink text-white shadow-[0_2px_10px_rgba(244,168,199,0.45)] dark:shadow-[0_2px_10px_rgba(199,125,255,0.35)]'
              : 'bg-light-card dark:bg-dark-card text-light-text/65 dark:text-dark-text/65 hover:text-light-text dark:hover:text-dark-text hover:bg-light-pink/10 dark:hover:bg-dark-purple/10'
            }
          `}
        >
          {cat.name}
        </button>
      ))}

      {isAuthorized && (
        <button
          onClick={onAddCat}
          aria-label="Add cat"
          className="
            group flex items-center justify-center w-9 h-9 rounded-full shrink-0
            bg-light-card dark:bg-dark-card
            text-light-text/40 dark:text-dark-text/40
            border border-light-pink/20 dark:border-dark-purple/20
            hover:text-light-pink dark:hover:text-dark-purple
            hover:border-light-pink/55 dark:hover:border-dark-purple/55
            hover:bg-light-pink/8 dark:hover:bg-dark-purple/8
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.95]
          "
        >
          <Plus
            size={15}
            strokeWidth={1.5}
            className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-90"
          />
        </button>
      )}
    </div>
  )
}
