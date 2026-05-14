import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useGames } from './hooks/useGames'
import { useUploadModal, closeUploadModal } from './hooks/useUploadModal'
import Header from './components/Header'
import Footer from './components/Footer'
import RouteSpinner from './components/RouteSpinner'
import UploadModal from './features/gallery/UploadModal'

// TEMP: diagnostic overlay — remove after iOS offline investigation
function DebugOverlay({ auth }) {
  const [online, setOnline] = useState(navigator.onLine)
  const [lsKeys, setLsKeys] = useState({ auth: 0, doc: 0 })
  const [sw, setSw] = useState('…')

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    const refresh = () => {
      const keys = Object.keys(localStorage)
      const raw = localStorage.getItem('mycats:offline_user')
      let offSnip = '✗'
      if (raw) {
        try { offSnip = JSON.parse(raw).email?.split('@')[0] ?? '✓' } catch { offSnip = raw.slice(0, 10) }
      }
      setLsKeys({
        auth: keys.filter(k => k.startsWith('firebase:authUser')).length,
        doc: keys.filter(k => k.startsWith('userDoc:')).length,
        total: keys.length,
        offUser: offSnip,
      })
    }
    refresh()
    const t = setInterval(refresh, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    navigator.serviceWorker?.getRegistration()
      .then(reg => setSw(reg?.active ? 'active' : reg ? 'no-active' : 'none'))
      .catch(() => setSw('err'))
  }, [])

  return (
    <div style={{
      position: 'fixed', bottom: 8, left: 8, zIndex: 9999,
      background: 'rgba(0,0,0,0.82)', color: '#4ade80',
      fontFamily: 'monospace', fontSize: 11, lineHeight: 1.7,
      padding: '5px 9px', borderRadius: 6, pointerEvents: 'none',
    }}>
      <div>online: {online ? '✓' : '✗'}</div>
      <div>user: {auth.user?.email ?? 'null'}</div>
      <div>loading: {String(auth.loading)}</div>
      <div>authKeys: {lsKeys.auth}</div>
      <div>docKeys: {lsKeys.doc}</div>
      <div>lsTotal: {lsKeys.total ?? '…'}</div>
      <div>offUser: {lsKeys.offUser ?? '…'}</div>
      <div>standalone: {String(window.matchMedia('(display-mode: standalone)').matches)}</div>
      <div>sw: {sw}</div>
    </div>
  )
}

const HomePage = lazy(() => import('./pages/HomePage'))
const GalleryPage = lazy(() => import('./pages/GalleryPage'))
const GamesPage = lazy(() => import('./pages/GamesPage'))
const GameScreen = lazy(() => import('./pages/GameScreen'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
function AppLayout({ theme, auth, games, authOpen, onAuthOpen, onAuthClose }) {
  const location = useLocation()
  const themeStr = theme.dark ? 'dark' : 'light'
  const upload = useUploadModal()

  return (
    <div className="relative flex flex-col text-light-text dark:text-dark-text" style={{ minHeight: '100dvh' }}>
      <Header
        theme={theme}
        auth={auth}
        authOpen={authOpen}
        onAuthOpen={onAuthOpen}
        onAuthClose={onAuthClose}
      />
      <main className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={<RouteSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage auth={auth} onAuthOpen={onAuthOpen} />} />
            <Route path="/gallery" element={<GalleryPage auth={auth} />} />
            <Route path="/games" element={<GamesPage auth={auth} games={games} />} />
            <Route path="/games/:photoId/:difficulty" element={<GameScreen auth={auth} games={games} />} />
            <Route path="/profile" element={<ProfilePage auth={auth} games={games} />} />
          </Routes>
        </Suspense>
      </main>
      <Footer theme={themeStr} />
      <UploadModal open={upload.open} onClose={closeUploadModal} />
    </div>
  )
}

export default function App() {
  const theme = useTheme()
  const auth = useAuth()
  const games = useGames(auth)
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      <DebugOverlay auth={auth} />
      {auth.loading ? (
        <RouteSpinner />
      ) : (
        <BrowserRouter basename="/my-cats">
          <AppLayout
            theme={theme}
            auth={auth}
            games={games}
            authOpen={authOpen}
            onAuthOpen={() => setAuthOpen(true)}
            onAuthClose={() => setAuthOpen(false)}
          />
        </BrowserRouter>
      )}
    </>
  )
}
