import { useSyncExternalStore } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

let _state = {
  user: null,
  userDoc: null,
  isAuthorized: false,
  loading: true,
  signInPending: false,
}
const _listeners = new Set()
const _subscribe = (fn) => { _listeners.add(fn); return () => _listeners.delete(fn) }
const _emit = () => { for (const fn of _listeners) fn() }
const _setState = (patch) => { _state = { ..._state, ...patch }; _emit() }
const _getSnapshot = () => _state

let _initialized = false
function _init() {
  if (_initialized) return
  _initialized = true

  let unsubDoc = null
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (unsubDoc) { unsubDoc(); unsubDoc = null }
    if (!firebaseUser) {
      _setState({ user: null, userDoc: null, isAuthorized: false, loading: false })
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
        displayName:   firebaseUser.displayName ?? null,
        photoURL:      firebaseUser.photoURL ?? null,
        allowed:       invite !== null,
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
        _setState({
          userDoc: data,
          isAuthorized: !!data?.allowed,
          loading: false,
        })
        if (data && !data.allowed) {
          // Not allowed — sign out so they don't sit in limbo
          signOut(auth)
        }
      },
      (err) => {
        // permission-denied fires when signOut races with the snapshot;
        // safe to ignore — onAuthStateChanged will clean up the listener.
        if (err.code !== 'permission-denied') console.error('userDoc snapshot:', err)
        _setState({ loading: false })
      },
    )

    // Backfill / refresh displayName + photoURL on every login, so leaderboard
    // shows real names/avatars for other users (not just emails).
    setDoc(
      userRef,
      {
        displayName: firebaseUser.displayName ?? null,
        photoURL:    firebaseUser.photoURL    ?? null,
      },
      { merge: true },
    ).catch((err) => {
      if (err?.code !== 'permission-denied') console.error('userDoc displayName merge:', err)
    })

    _setState({ user: firebaseUser })
  })
}

const signInUser = async () => {
  _setState({ signInPending: true })
  let removeVisibility = () => {}
  try {
    // On mobile PWA the auth "popup" opens as a separate browser tab.
    // Firebase never detects that tab being closed, so signInWithPopup hangs forever.
    // We race it against a visibilitychange signal — if the user returns to the app
    // without completing auth, the race resolves and we reset the pending state.
    const returnedToApp = new Promise(resolve => {
      const onVisible = () => { if (document.visibilityState === 'visible') resolve() }
      document.addEventListener('visibilitychange', onVisible)
      removeVisibility = () => document.removeEventListener('visibilitychange', onVisible)
    })
    await Promise.race([
      signInWithPopup(auth, googleProvider).catch(err => {
        if (err?.code !== 'auth/popup-closed-by-user') throw err
      }),
      returnedToApp,
    ])
  } catch (err) {
    console.error('Sign-in failed', err)
  } finally {
    removeVisibility()
    _setState({ signInPending: false })
  }
}
const signOutUser = () => signOut(auth)

export function useAuth() {
  _init()
  const state = useSyncExternalStore(_subscribe, _getSnapshot, _getSnapshot)

  return {
    user:          state.user,
    userDoc:       state.userDoc,
    isAuthorized:  state.isAuthorized,
    loading:       state.loading,
    signInPending: state.signInPending,
    signIn:        signInUser,
    signInUser,
    signOutUser,
  }
}
