import { collection, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

export async function rebuildUserStats() {
  const scoresSnap = await getDocs(collection(db, 'scores'))
  const byUser = new Map() // uid -> { email, total, solved, last }
  for (const s of scoresSnap.docs) {
    const d = s.data()
    const e = byUser.get(d.userId) || { email: d.userEmail ?? '', total: 0, solved: 0, last: null }
    e.email = d.userEmail ?? e.email
    e.total += d.stars ?? 0
    if ((d.stars ?? 0) > 0) e.solved += 1
    if (d.solvedAt && (!e.last || d.solvedAt.toMillis() > e.last.toMillis())) e.last = d.solvedAt
    byUser.set(d.userId, e)
  }
  const log = []
  for (const [uid, e] of byUser) {
    await setDoc(doc(db, 'userStats', uid), {
      userEmail: e.email,
      totalStars: e.total,
      puzzlesSolved: e.solved,
      lastPlayedAt: e.last ?? Timestamp.now(),
    }, { merge: true })
    log.push(`userStats/${uid}: ${e.total} stars, ${e.solved} solved`)
  }
  return log
}

export async function fetchGlobalStats() {
  const [catsSnap, photosSnap, scoresSnap] = await Promise.all([
    getDocs(collection(db, 'cats')),
    getDocs(collection(db, 'photos')),
    getDocs(collection(db, 'scores')),
  ])
  const lastPhoto = photosSnap.docs
    .map(d => d.data())
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))[0] ?? null
  const lastScore = scoresSnap.docs
    .map(d => d.data())
    .sort((a, b) => (b.solvedAt?.toMillis?.() ?? 0) - (a.solvedAt?.toMillis?.() ?? 0))[0] ?? null
  return {
    totals: { cats: catsSnap.size, photos: photosSnap.size, scores: scoresSnap.size },
    lastPhoto: lastPhoto && {
      filename: lastPhoto.originalFilename,
      at: lastPhoto.createdAt?.toDate?.(),
      email: lastPhoto.uploadedByEmail,
    },
    lastScore: lastScore && {
      stars: lastScore.stars,
      at: lastScore.solvedAt?.toDate?.(),
      email: lastScore.userEmail,
    },
  }
}
