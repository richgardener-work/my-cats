import { useState } from 'react'

export default function CatTagBar({
  cats = [],
  selectedIds = [],
  onToggle,
  pendingNewName = '',
  onPendingNewNameChange,
  disabled = false,
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0, #000 16px, #000 calc(100% - 16px), transparent 100%)',
        }}
      >
        {cats.map(cat => {
          const on = selectedIds.includes(cat.id)
          return (
            <button
              key={cat.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle?.(cat.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs transition-colors ${
                on ? 'bg-morph text-white' : 'opacity-70'
              }`}
              style={on ? {} : { border: '1px solid currentColor' }}
            >
              {cat.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
