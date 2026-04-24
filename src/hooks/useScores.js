import { useState, useEffect } from 'react'
import {
  collection, query, onSnapshot,
  setDoc, getDoc, doc, serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from '../firebase'

const GUEST_STARS_KEY = 'guestTotalStars'

export function useScores(auth) {
  const { isAuthorized, user } = auth
  const [scores, setScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [totalStars, setTotalStars] = useState(() =>
    parseInt(localStorage.getItem(GUEST_STARS_KEY) || '0', 10)
  )

  useEffect(() => {
    if (!isAuthorized) { setLoading(false); return }
    return onSnapshot(query(collection(db, 'scores')), (snap) => {
      const map = {}
      snap.docs.forEach(d => { map[d.id] = d.data() })
      setScores(map)
      setLoading(false)
    })
  }, [isAuthorized])

  useEffect(() => {
    if (!isAuthorized || !user) return
    return onSnapshot(doc(db, 'userStats', user.uid), (snap) => {
      setTotalStars(snap.exists() ? (snap.data().totalStars || 0) : 0)
    })
  }, [isAuthorized, user])

  const saveScore = async (userId, photoId, difficulty, { stars, moves, timeSeconds }) => {
    if (!isAuthorized) {
      const key = `${userId}_${photoId}_${difficulty}`
      setScores(prev => ({ ...prev, [key]: { userId, photoId, difficulty, stars, moves, timeSeconds } }))
      setTotalStars(prev => {
        const next = prev + stars
        localStorage.setItem(GUEST_STARS_KEY, String(next))
        return next
      })
      return
    }

    const scoreId = `${userId}_${photoId}_${difficulty}`
    const scoreRef = doc(db, 'scores', scoreId)
    const prev = await getDoc(scoreRef)
    const prevStars = prev.exists() ? (prev.data().stars ?? 0) : 0
    const starsDelta = Math.max(0, stars - prevStars)
    const firstSolve = !prev.exists() || prevStars === 0

    await setDoc(scoreRef, {
      userId,
      userEmail: user?.email,
      photoId,
      difficulty,
      stars,
      moves,
      timeSeconds,
      solvedAt: serverTimestamp(),
    }, { merge: true })

    const statsRef = doc(db, 'userStats', userId)
    await setDoc(statsRef, {
      userEmail: user?.email,
      totalStars: increment(starsDelta),
      puzzlesSolved: increment(firstSolve && stars > 0 ? 1 : 0),
      lastPlayedAt: serverTimestamp(),
    }, { merge: true })
  }

  const getScore = (userId, photoId, difficulty) =>
    scores[`${userId}_${photoId}_${difficulty}`] || null

  return { scores, loading, saveScore, getScore, totalStars }
}
