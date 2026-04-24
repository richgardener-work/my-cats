import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { slugify, findAvailableSlug } from './slugify'

// Returns an array of { oldId, newSlug, name, willCopy, reason }.
export async function planMigration() {
  const snap = await getDocs(collection(db, 'cats'))
  const existingSlugs = new Set()
  const plan = []

  for (const d of snap.docs) {
    const data = d.data()
    if (data.slug && d.id === data.slug) {
      plan.push({ oldId: d.id, newSlug: d.id, name: data.name, willCopy: false, reason: 'already migrated' })
      existingSlugs.add(d.id)
    }
  }

  for (const d of snap.docs) {
    const data = d.data()
    if (data.slug && d.id === data.slug) continue
    const base = slugify(data.name || d.id)
    const newSlug = await findAvailableSlug(base, async (s) => {
      if (existingSlugs.has(s)) return true
      const snap2 = await getDoc(doc(db, 'cats', s))
      return snap2.exists()
    })
    existingSlugs.add(newSlug)
    plan.push({ oldId: d.id, newSlug, name: data.name, willCopy: true, reason: '' })
  }
  return plan
}

// Executes a plan returned by planMigration.
export async function runMigration(plan) {
  const log = []
  for (const row of plan.filter(r => r.willCopy)) {
    const oldRef = doc(db, 'cats', row.oldId)
    const oldSnap = await getDoc(oldRef)
    if (!oldSnap.exists()) { log.push(`skip: ${row.oldId} not found`); continue }
    const data = oldSnap.data()
    const newRef = doc(db, 'cats', row.newSlug)
    if ((await getDoc(newRef)).exists()) { log.push(`skip: ${row.newSlug} already exists`); continue }
    await setDoc(newRef, { ...data, slug: row.newSlug })
    log.push(`copy: ${row.oldId} -> ${row.newSlug}`)
  }

  const photosSnap = await getDocs(collection(db, 'photos'))
  const slugMap = Object.fromEntries(plan.map(r => [r.oldId, r.newSlug]))
  for (const p of photosSnap.docs) {
    const catIds = p.data().catIds || []
    const remapped = catIds.map(id => slugMap[id] ?? id)
    const changed = remapped.some((v, i) => v !== catIds[i])
    if (changed) {
      await setDoc(p.ref, { catIds: remapped }, { merge: true })
      log.push(`photo: ${p.id} catIds remapped`)
    }
  }

  for (const row of plan.filter(r => r.willCopy)) {
    await deleteDoc(doc(db, 'cats', row.oldId))
    log.push(`delete old: ${row.oldId}`)
  }
  return log
}
