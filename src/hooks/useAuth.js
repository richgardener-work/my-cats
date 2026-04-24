import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [signInPending, setSignInPending] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setIsAuthorized(false)
        setLoading(false)
        return
      }
      const snap = await getDoc(doc(db, 'allowedEmails', firebaseUser.email))
      if (snap.exists()) {
        setUser(firebaseUser)
        setIsAuthorized(true)
      } else {
        await signOut(auth)
        setUser(null)
        setIsAuthorized(false)
      }
      setLoading(false)
    })
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

  return { user, isAuthorized, loading, signIn: signInUser, signInUser, signOutUser, signInPending }
}
