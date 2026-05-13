import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, where, getCountFromServer } from 'firebase/firestore'
import { db } from '../firebase'

export function buildLeaderboard(userDocs) {
  return userDocs
    .filter(u => u.allowed)
    .sort((a, b) => (b.totalStars ?? 0) - (a.totalStars ?? 0))
}

export function useProfile(uid) {
  const [leaderboard, setLeaderboard] = useState([])
  const [photoCount, setPhotoCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    const unsub = onSnapshot(collection(db, 'users'), (snap) => {
      const docs = snap.docs.map(d => ({ uid: d.id, ...d.data() }))
      setLeaderboard(buildLeaderboard(docs))
      setLoading(false)
    })
    return unsub
  }, [uid])

  useEffect(() => {
    if (!uid) return
    const q = query(collection(db, 'photos'), where('uploadedBy', '==', uid))
    getCountFromServer(q).then(snap => setPhotoCount(snap.data().count))
  }, [uid])

  return { leaderboard, photoCount, loading }
}
