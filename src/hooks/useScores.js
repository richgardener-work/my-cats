import { useState, useEffect } from 'react'
import { collection, query, onSnapshot, setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

export function useScores(isAuthorized) {
  const [scores, setScores] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthorized) { setLoading(false); return }
    return onSnapshot(query(collection(db, 'scores')), (snap) => {
      const map = {}
      snap.docs.forEach(d => { map[d.id] = d.data() })
      setScores(map)
      setLoading(false)
    })
  }, [isAuthorized])

  const saveScore = (userId, photoId, difficulty, { stars, moves, timeSeconds }) =>
    setDoc(doc(db, 'scores', `${userId}_${photoId}_${difficulty}`), {
      userId,
      photoId,
      difficulty,
      stars,
      moves,
      timeSeconds,
      solvedAt: serverTimestamp(),
    })

  const getScore = (userId, photoId, difficulty) =>
    scores[`${userId}_${photoId}_${difficulty}`] || null

  const totalStars = Object.values(scores).reduce((sum, s) => sum + (s.stars || 0), 0)

  return { scores, loading, saveScore, getScore, totalStars }
}
