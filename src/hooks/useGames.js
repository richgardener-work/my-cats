import { useState, useEffect, useSyncExternalStore } from 'react'
import {
  collectionGroup, query, where, onSnapshot,
  doc, getDoc, setDoc, writeBatch, serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from '../firebase'
import { guest, subscribe as guestSubscribe } from '../utils/guestStorage'
import { computeScoreUpdate } from '../utils/scoreLogic'

export function useGames(auth) {
  const { isAuthorized, user, userDoc } = auth
  const [levels, setLevels] = useState({})
  const [loading, setLoading] = useState(true)

  const guestStars  = useSyncExternalStore(guestSubscribe, () => guest.getTotalStars(), () => 0)
  const guestScores = useSyncExternalStore(guestSubscribe, () => guest.getAllScores(), () => ({}))

  useEffect(() => {
    if (!isAuthorized || !user) { setLevels({}); setLoading(false); return }
    // collectionGroup query — restricted to current user's UID by Firestore rules
    const q = query(collectionGroup(db, 'levels'), where('uid', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const map = {}
      snap.docs.forEach(d => {
        // Path: users/{uid}/games/{photoId}/levels/{difficulty}
        const segs = d.ref.path.split('/')
        const photoId    = segs[3]
        const difficulty = segs[5]
        map[`${photoId}_${difficulty}`] = d.data()
      })
      setLevels(map)
      setLoading(false)
    })
  }, [isAuthorized, user])

  const saveScore = async (uid, photoId, difficulty, { moves, timeSeconds }) => {
    if (!isAuthorized) {
      return guest.saveScore({
        photoId, difficulty,
        stars: ({ '3x3': 1, '4x4': 2, '5x5': 3 })[difficulty] ?? 0,
        moves, timeSeconds,
      })
    }

    const levelRef = doc(db, 'users', uid, 'games', photoId, 'levels', difficulty)
    const userRef  = doc(db, 'users', uid)
    const prev = await getDoc(levelRef)
    const update = computeScoreUpdate(prev.exists() ? prev.data() : null, { moves, timeSeconds, difficulty })

    const batch = writeBatch(db)
    batch.set(levelRef, {
      uid,
      bestMoves:       update.bestMoves,
      bestTimeSeconds: update.bestTimeSeconds,
      plays:           increment(1),
      lastPlayedAt:    serverTimestamp(),
    }, { merge: true })

    batch.set(userRef, {
      totalStars:    increment(update.starsToAdd),
      totalGames:    increment(1),
      puzzlesSolved: increment(update.isFirst ? 1 : 0),
    }, { merge: true })

    await batch.commit()
  }

  const getScore = (uid, photoId, difficulty) => {
    if (!isAuthorized) return guestScores[`${photoId}_${difficulty}`] || null
    const lvl = levels[`${photoId}_${difficulty}`]
    if (!lvl) return null
    return {
      stars: ({ '3x3': 1, '4x4': 2, '5x5': 3 })[difficulty] ?? 0,
      moves: lvl.bestMoves,
      timeSeconds: lvl.bestTimeSeconds,
      plays: lvl.plays,
    }
  }

  return {
    scores: isAuthorized ? levels : guestScores,
    loading,
    saveScore,
    getScore,
    totalStars: isAuthorized ? (userDoc?.totalStars ?? 0) : guestStars,
  }
}
