import { useEffect, useState, useCallback, useSyncExternalStore, useMemo } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, getDoc, getDocs, setDoc, deleteDoc, writeBatch, arrayRemove, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'
import { findAvailableSlug } from '../utils/slugify'
import { guest, subscribe as guestSubscribe } from '../utils/guestStorage'

export function useCats() {
  const { user, isAuthorized } = useAuth()

  const guestCatsRaw = useSyncExternalStore(guestSubscribe, () => guest.getCats(), () => [])

  const [dbCats, setDbCats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthorized) { setDbCats([]); setLoading(false); return }
    const q = query(collection(db, 'cats'), where('isPublic', '==', false))
    const unsub = onSnapshot(q, (snap) => {
      setDbCats(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [isAuthorized])

  const guestMerged = useMemo(() => guestCatsRaw, [guestCatsRaw])

  const addCat = useCallback(async (name) => {
    const trimmed = (name ?? '').trim()
    if (!trimmed) throw new Error('Cat name is required')
    const knownCats = isAuthorized ? dbCats : guestMerged
    const existing = knownCats.find(c => c.name.trim().toLowerCase() === trimmed.toLowerCase())
    if (existing) return existing.id
    if (!isAuthorized) {
      const slug = await findAvailableSlug(trimmed, async (s) => guest.hasCatSlug(s))
      return guest.addCat(trimmed, slug).id
    }
    if (!user) throw new Error('Must be signed in')
    const slug = await findAvailableSlug(trimmed, async (s) => {
      const snap = await getDoc(doc(db, 'cats', s))
      return snap.exists()
    })
    await setDoc(doc(db, 'cats', slug), {
      name: trimmed,
      slug,
      avatarPhotoId: '',
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      createdByEmail: user.email,
      isPublic: false,
    })
    return slug
  }, [isAuthorized, user, dbCats, guestMerged])

  const removeCat = useCallback(async (id) => {
    if (!isAuthorized) {
      return guest.removeCat(id)
    }
    // Auth: каскадный detach — вычистить slug из catIds всех фоток, потом удалить кота
    const photosSnap = await getDocs(query(
      collection(db, 'photos'),
      where('catIds', 'array-contains', id)
    ))
    if (photosSnap.size > 0) {
      const batch = writeBatch(db)
      for (const p of photosSnap.docs) {
        batch.update(p.ref, { catIds: arrayRemove(id) })
      }
      await batch.commit()
    }
    await deleteDoc(doc(db, 'cats', id))
  }, [isAuthorized, guestCatsRaw])

  return {
    cats: isAuthorized ? dbCats : guestMerged,
    addCat,
    removeCat,
    loading: isAuthorized ? loading : false,
  }
}
