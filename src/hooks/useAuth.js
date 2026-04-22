import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const signIn = () => signInWithPopup(auth, googleProvider)
  const signOutUser = () => signOut(auth)

  return { user, isAuthorized, loading, signIn, signOutUser }
}
