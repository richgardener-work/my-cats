import { useState, useEffect, useSyncExternalStore } from 'react'
import {
  collection, query, onSnapshot,
  setDoc, getDoc, doc, serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from '../firebase'
import { guest, subscribe as guestSubscribe } from '../utils/guestStorage'

export function useScores(auth) {
  const { isAuthorized, user } = auth
  const [scores, setScores] = useState({})
  const [loading, setLoading] = useState(true)
  const [dbTotalStars, setDbTotalStars] = useState(0)

  const guestStars = useSyncExternalStore(guestSubscribe, () => guest.getTotalStars(), () => 0)
  const guestScores = useSyncExternalStore(guestSubscribe, () => guest.getAllScores(), () => ({}))

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
      setDbTotalStars(snap.exists() ? (snap.data().totalStars || 0) : 0)
    })
  }, [isAuthorized, user])

  const saveScore = async (userId, photoId, difficulty, { stars, moves, timeSeconds }) => {
    if (!isAuthorized) return guest.saveScore({ photoId, difficulty, stars, moves, timeSeconds })

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

  const getScore = (userId, photoId, difficulty) => {
    if (!isAuthorized) return guestScores[`${photoId}_${difficulty}`] || null
    return scores[`${userId}_${photoId}_${difficulty}`] || null
  }

  return {
    scores: isAuthorized ? scores : guestScores,
    loading,
    saveScore,
    getScore,
    totalStars: isAuthorized ? dbTotalStars : guestStars,
  }
}
