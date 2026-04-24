import { useEffect, useState } from 'react'
import { Trash2, Play, RefreshCw, Users } from 'lucide-react'
import {
  collection, addDoc, onSnapshot, doc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../hooks/useAuth'
import { planMigration, runMigration } from '../utils/catMigration'
import { rebuildUserStats, fetchGlobalStats } from '../utils/statsRebuild'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'rich.gardener.work@gmail.com'

export default function AdminPage() {
  const { user } = useAuth()
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="mx-auto max-w-md py-32 text-center">
        <h1 className="font-display text-4xl">Not found</h1>
        <p className="mt-3 opacity-60">This page does not exist.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 space-y-10">
      <header>
        <h1 className="font-display font-wonky text-4xl">Admin</h1>
        <p className="mt-2 opacity-60 text-sm">Whitelist, migration, stats.</p>
      </header>

      <EmailsSection currentEmail={user.email} />
      <MigrationSection />
      <RebuildSection />
      <StatsSection />
    </div>
  )
}

function EmailsSection({ currentEmail }) {
  const [emails, setEmails] = useState([])
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    return onSnapshot(collection(db, 'allowedEmails'), (snap) => {
      setEmails(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  const add = async () => {
    const v = input.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return setError('Invalid email')
    if (emails.some(e => e.email === v || e.id === v)) return setError('Already present')
    await addDoc(collection(db, 'allowedEmails'), {
      email: v, addedAt: serverTimestamp(), addedBy: currentEmail,
    })
    setInput(''); setError('')
  }
  const remove = async (e) => {
    if (e.email === currentEmail || e.id === currentEmail) {
      alert('You cannot remove your own email — you would lock yourself out.')
      return
    }
    if (confirm(`Remove ${e.email || e.id}?`)) await deleteDoc(doc(db, 'allowedEmails', e.id))
  }

  return (
    <section>
      <h2 className="font-display text-2xl flex items-center gap-2"><Users size={20}/> Allowed emails</h2>
      <div className="mt-4 flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          placeholder="someone@gmail.com"
          className="flex-1 rounded-lg border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
        />
        <button onClick={add} className="rounded-lg bg-[#E879B4] px-4 py-2 text-sm text-white">Add</button>
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <ul className="mt-4 divide-y divide-black/5 dark:divide-white/10">
        {emails.map(e => (
          <li key={e.id} className="flex items-center justify-between py-2 text-sm">
            <span>{e.email || e.id}</span>
            <button onClick={() => remove(e)} className="rounded p-1 text-red-500 hover:bg-red-500/10">
              <Trash2 size={14}/>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MigrationSection() {
  const [plan, setPlan] = useState(null)
  const [log, setLog] = useState([])
  const [busy, setBusy] = useState(false)

  return (
    <section>
      <h2 className="font-display text-2xl flex items-center gap-2"><Play size={18}/> Cat-ID migration</h2>
      <p className="mt-2 text-sm opacity-60">Converts auto-ID cats to slug IDs and remaps <code>photos.catIds[]</code>. Idempotent.</p>
      <div className="mt-3 flex gap-2">
        <button disabled={busy} onClick={async () => { setBusy(true); setPlan(await planMigration()); setBusy(false) }} className="rounded-lg border border-black/10 dark:border-white/20 px-4 py-2 text-sm">
          Dry run
        </button>
        <button disabled={busy || !plan} onClick={async () => { setBusy(true); setLog(await runMigration(plan)); setBusy(false); setPlan(null) }} className="rounded-lg bg-[#E879B4] px-4 py-2 text-sm text-white disabled:opacity-40">
          Execute
        </button>
      </div>
      {plan && (
        <table className="mt-4 w-full text-xs">
          <thead><tr className="text-left opacity-60"><th>oldId</th><th>newSlug</th><th>name</th><th>copy?</th><th>reason</th></tr></thead>
          <tbody>
            {plan.map((r, i) => (
              <tr key={i} className="border-t border-black/5 dark:border-white/10">
                <td className="py-1 font-mono">{r.oldId}</td>
                <td className="py-1 font-mono">{r.newSlug}</td>
                <td className="py-1">{r.name}</td>
                <td className="py-1">{r.willCopy ? 'yes' : '—'}</td>
                <td className="py-1 opacity-60">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {log.length > 0 && (
        <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-black/5 dark:bg-white/5 p-3 text-xs">{log.join('\n')}</pre>
      )}
    </section>
  )
}

function RebuildSection() {
  const [log, setLog] = useState([])
  const [busy, setBusy] = useState(false)
  return (
    <section>
      <h2 className="font-display text-2xl flex items-center gap-2"><RefreshCw size={18}/> Rebuild userStats</h2>
      <p className="mt-2 text-sm opacity-60">Recomputes <code>totalStars</code>, <code>puzzlesSolved</code>, <code>lastPlayedAt</code> from the <code>scores</code> collection.</p>
      <button disabled={busy} onClick={async () => { setBusy(true); setLog(await rebuildUserStats()); setBusy(false) }} className="mt-3 rounded-lg bg-[#E879B4] px-4 py-2 text-sm text-white">
        Run
      </button>
      {log.length > 0 && (
        <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-black/5 dark:bg-white/5 p-3 text-xs">{log.join('\n')}</pre>
      )}
    </section>
  )
}

function StatsSection() {
  const [stats, setStats] = useState(null)
  useEffect(() => { fetchGlobalStats().then(setStats) }, [])
  if (!stats) return null
  return (
    <section>
      <h2 className="font-display text-2xl">Stats</h2>
      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <Card label="Cats" value={stats.totals.cats}/>
        <Card label="Photos" value={stats.totals.photos}/>
        <Card label="Scores" value={stats.totals.scores}/>
      </div>
      <div className="mt-4 space-y-1 text-xs opacity-70">
        {stats.lastPhoto && <div>Last photo: {stats.lastPhoto.filename} · {stats.lastPhoto.email} · {stats.lastPhoto.at?.toLocaleString?.()}</div>}
        {stats.lastScore && <div>Last score: ⭐{stats.lastScore.stars} · {stats.lastScore.email} · {stats.lastScore.at?.toLocaleString?.()}</div>}
      </div>
    </section>
  )
}

function Card({ label, value }) {
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 p-4">
      <div className="font-display text-3xl">{value}</div>
      <div className="text-xs opacity-60">{label}</div>
    </div>
  )
}
