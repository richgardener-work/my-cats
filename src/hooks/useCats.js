import { useEffect, useState, useCallback, useSyncExternalStore, useMemo } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, getDoc, setDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'
import { findAvailableSlug } from '../utils/slugify'
import { guest, subscribe as guestSubscribe } from '../utils/guestStorage'
import { demoGalleryCats } from '../utils/demoAssets'

export function useCats() {
  const { user, isAuthorized } = useAuth()

  const guestCatsRaw = useSyncExternalStore(guestSubscribe, () => guest.getCats(), () => [])

  const [dbCats, setDbCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [sessionHidden, setSessionHidden] = useState(() => new Set())

  useEffect(() => {
    if (!isAuthorized) { setDbCats([]); setLoading(false); return }
    const q = query(collection(db, 'cats'), where('isPublic', '==', false))
    const unsub = onSnapshot(q, (snap) => {
      setDbCats(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [isAuthorized])

  const guestMerged = useMemo(() => {
    const seen = new Set()
    const merged = []
    for (const c of [...demoGalleryCats, ...guestCatsRaw]) {
      if (seen.has(c.slug)) continue
      seen.add(c.slug)
      merged.push(c)
    }
    return merged.filter(c => !sessionHidden.has(c.id))
  }, [guestCatsRaw, sessionHidden])

  const addCat = useCallback(async (name) => {
    if (!isAuthorized) {
      const slug = await findAvailableSlug(name, async (s) =>
        guest.hasCatSlug(s) || demoGalleryCats.some(c => c.slug === s)
      )
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
    if (!isAuthorized) {
      const cat = [...demoGalleryCats, ...guestCatsRaw].find(c => c.id === id)
      if (cat?.isDemo) {
        setSessionHidden(prev => {
          const next = new Set(prev)
          next.add(id)
          return next
        })
        return
      }
      return guest.removeCat(id)
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
