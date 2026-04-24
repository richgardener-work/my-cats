import { useEffect, useState, useCallback } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, getDoc, setDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './useAuth'
import { slugify, findAvailableSlug } from '../utils/slugify'

export function useCats() {
  const { user, isAuthorized } = useAuth()
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthorized) { setCats([]); setLoading(false); return }
    const q = query(collection(db, 'cats'), where('isPublic', '==', false))
    const unsub = onSnapshot(q, (snap) => {
      setCats(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [isAuthorized])

  const addCat = useCallback(async (name) => {
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
  }, [user])

  const removeCat = useCallback(async (id) => {
    await deleteDoc(doc(db, 'cats', id))
  }, [])

  return { cats, addCat, removeCat, loading }
}
