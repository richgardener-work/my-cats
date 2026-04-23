import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export function useCats(isAuthorized) {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = isAuthorized
      ? query(collection(db, 'cats'))
      : query(collection(db, 'cats'), where('isPublic', '==', true))

    return onSnapshot(q, (snap) => {
      setCats(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
  }, [isAuthorized])

  const addCat = (name) =>
    addDoc(collection(db, 'cats'), {
      name,
      avatarUrl: '',
      createdAt: serverTimestamp(),
      isPublic: false,
    })

  return { cats, loading, addCat }
}
