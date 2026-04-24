import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export default function CatFilterTabs({ cats = [], activeId, onChange, onAddCat }) {
  const [pending, setPending] = useState(false)
  const [draft, setDraft] = useState('')

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
        <TabPill key={cat.id} active={activeId === cat.id} onClick={() => onChange(cat.id)}>
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

function TabPill({ active, onClick, children }) {
  return (
    <button onClick={onClick} className="relative rounded-full px-4 py-1.5 text-sm">
      {active && (
        <motion.span
          layoutId="cat-tab-pill"
          className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(135deg, #E879B4, #C9A0DC)' }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        />
      )}
      <span className={`relative ${active ? 'text-white' : 'opacity-75'}`}>{children}</span>
    </button>
  )
}
