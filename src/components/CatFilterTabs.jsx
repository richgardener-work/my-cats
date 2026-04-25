import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'

export default function CatFilterTabs({ cats = [], activeId, onChange, onAddCat, onRemoveCat }) {
  const [pending, setPending] = useState(false)
  const [draft, setDraft] = useState('')
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    if (!removingId) return
    const onDocClick = () => setRemovingId(null)
    const onKey = (e) => { if (e.key === 'Escape') setRemovingId(null) }
    const t = setTimeout(() => document.addEventListener('click', onDocClick), 0)
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [removingId])

  const submit = async () => {
    const name = draft.trim()
    if (!name) return setPending(false)
    await onAddCat(name)
    setDraft('')
    setPending(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <TabPill active={activeId === null} onClick={() => onChange(null)}>All</TabPill>
      {cats.map(cat => (
        <TabPill
          key={cat.id}
          active={activeId === cat.id}
          isRemoving={removingId === cat.id}
          onClick={() => {
            if (removingId) { setRemovingId(null); return }
            onChange(cat.id)
          }}
          onLongPress={onRemoveCat ? () => setRemovingId(cat.id) : undefined}
          onRemove={onRemoveCat ? () => { onRemoveCat(cat.id); setRemovingId(null) } : undefined}
        >
          {cat.name}
        </TabPill>
      ))}
      {pending ? (
        <div className="flex items-center gap-2 rounded-full border border-dashed border-[#E879B4] px-3 py-1.5">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' ? submit() : e.key === 'Escape' && setPending(false)}
            onBlur={submit}
            placeholder="name"
            className="w-24 bg-transparent text-sm outline-none"
          />
        </div>
      ) : (
        <button
          onClick={() => setPending(true)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-current px-3 py-1.5 text-sm opacity-60 hover:opacity-100 transition"
        >
          <Plus size={14}/> New cat
        </button>
      )}
    </div>
  )
}

function TabPill({ active, onClick, onLongPress, onRemove, isRemoving, children }) {
  const timer = useRef(null)
  const fired = useRef(false)

  const start = () => {
    fired.current = false
    if (!onLongPress) return
    timer.current = setTimeout(() => {
      fired.current = true
      onLongPress()
    }, 500)
  }
  const cancel = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
  }
  const handleClick = (e) => {
    if (fired.current) {
      e.stopPropagation()
      fired.current = false
      return
    }
    onClick?.()
  }

  return (
    <span className="relative inline-block">
      <button
        onClick={handleClick}
        onMouseDown={start}
        onMouseUp={cancel}
        onMouseLeave={cancel}
        onTouchStart={start}
        onTouchEnd={cancel}
        onTouchCancel={cancel}
        onContextMenu={(e) => { if (onLongPress) e.preventDefault() }}
        className="relative rounded-full px-4 py-1.5 text-sm"
      >
        {active && (
          <motion.span
            layoutId="cat-tab-pill"
            className="bg-morph absolute inset-0 rounded-full"
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          />
        )}
        <span className={`relative ${active ? 'text-white' : 'opacity-75'}`}>{children}</span>
      </button>
      <AnimatePresence>
        {isRemoving && onRemove && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 22 }}
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            aria-label="Remove tag"
            className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white shadow-lg z-10"
          >
            <X size={12} strokeWidth={3}/>
          </motion.button>
        )}
      </AnimatePresence>
    </span>
  )
}
