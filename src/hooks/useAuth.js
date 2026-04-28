import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [userDoc, setUserDoc] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signInPending, setSignInPending] = useState(false)

  useEffect(() => {
    let unsubDoc = null
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubDoc) { unsubDoc(); unsubDoc = null }
      if (!firebaseUser) {
        setUser(null); setUserDoc(null); setIsAuthorized(false); setLoading(false)
        return
      }

      const userRef = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(userRef).catch((err) => {
        if (err?.code !== 'permission-denied') console.error('userDoc getDoc:', err)
        return null
      })

      if (snap && !snap.exists()) {
        // First login — try to claim invite
        const inviteRef = doc(db, 'invites', firebaseUser.email)
        const inviteSnap = await getDoc(inviteRef).catch(() => null)
        const invite = inviteSnap?.exists() ? inviteSnap.data() : null

        await setDoc(userRef, {
          email:         firebaseUser.email,
          allowed:       invite?.allowed === true,
          admin:         invite?.admin === true,
          totalStars:    0,
          totalGames:    0,
          puzzlesSolved: 0,
        }).catch((err) => {
          if (err?.code !== 'permission-denied') console.error('userDoc setDoc:', err)
        })

        if (invite) {
          // Best-effort cleanup; failure is fine.
          deleteDoc(inviteRef).catch(() => {})
        }
      }

      // Live-subscribe to userDoc for reactive admin/totalStars updates
      unsubDoc = onSnapshot(
        userRef,
        (s) => {
          const data = s.exists() ? s.data() : null
          setUserDoc(data)
          setIsAuthorized(!!data?.allowed)
          setLoading(false)
          if (data && !data.allowed) {
            // Not allowed — sign out so they don't sit in limbo
            signOut(auth)
          }
        },
        (err) => {
          // permission-denied fires when signOut races with the snapshot;
          // safe to ignore — onAuthStateChanged will clean up the listener.
          if (err.code !== 'permission-denied') console.error('userDoc snapshot:', err)
          setLoading(false)
        },
      )

      setUser(firebaseUser)
    })

    return () => {
      if (unsubDoc) unsubDoc()
      unsubAuth()
    }
  }, [])

  const signInUser = async () => {
    setSignInPending(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      console.error('Sign-in failed', err)
    } finally {
      setSignInPending(false)
    }
  }
  const signOutUser = () => signOut(auth)

  return {
    user, userDoc,
    isAuthorized, loading,
    signIn: signInUser, signInUser, signOutUser, signInPending,
  }
}
