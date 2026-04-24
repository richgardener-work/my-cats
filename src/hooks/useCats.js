import { useEffect, useState, useCallback, useSyncExternalStore } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, getDoc, setDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'
import { findAvailableSlug } from '../utils/slugify'
import { guest, subscribe as guestSubscribe } from '../utils/guestStorage'

export function useCats() {
  const { user, isAuthorized } = useAuth()

  const guestCats = useSyncExternalStore(guestSubscribe, () => guest.getCats(), () => [])

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

  const addCat = useCallback(async (name) => {
    if (!isAuthorized) {
      const slug = await findAvailableSlug(name, async (s) => guest.hasCatSlug(s))
      return guest.addCat(name, slug).id
    }
    if (!user) throw new Error('Must be signed in')
    const slug = await findAvailableSlug(name, async (s) => {
      const snap = await getDoc(doc(db, 'cats', s))
      return snap.exists()
    })
    await setDoc(doc(db, 'cats', slug), {
      name,
      slug,
      avatarPhotoId: '',
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      createdByEmail: user.email,
      isPublic: false,
    })
    return slug
  }, [isAuthorized, user])

  const removeCat = useCallback(async (id) => {
    if (!isAuthorized) return guest.removeCat(id)
    await deleteDoc(doc(db, 'cats', id))
  }, [isAuthorized])

  return {
    cats: isAuthorized ? dbCats : guestCats,
    addCat,
    removeCat,
    loading: isAuthorized ? loading : false,
  }
}
