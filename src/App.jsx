import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useGames } from './hooks/useGames'
import { useUploadModal, closeUploadModal } from './hooks/useUploadModal'
import Header from './components/Header'
import Footer from './components/Footer'
import GuestBanner from './components/GuestBanner'
import UploadModal from './features/gallery/UploadModal'
import HomePage from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'
import GamesPage from './pages/GamesPage'
import GameScreen from './pages/GameScreen'
function AppLayout({ theme, auth, games, authOpen, onAuthOpen, onAuthClose }) {
  const location = useLocation()
  const themeStr = theme.dark ? 'dark' : 'light'
  const upload = useUploadModal()

  return (
    <div className="relative flex flex-col text-light-text dark:text-dark-text" style={{ minHeight: '100dvh' }}>
      <Header
        theme={theme}
        auth={auth}
        totalStars={games.totalStars}
        authOpen={authOpen}
        onAuthOpen={onAuthOpen}
        onAuthClose={onAuthClose}
      />
      <GuestBanner
        show={!auth.isAuthorized && location.pathname !== '/'}
        onSignIn={onAuthOpen}
        theme={themeStr}
      />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage auth={auth} />} />
          <Route path="/gallery" element={<GalleryPage auth={auth} />} />
          <Route path="/games" element={<GamesPage auth={auth} games={games} />} />
          <Route path="/games/:photoId/:difficulty" element={<GameScreen auth={auth} games={games} />} />
        </Routes>
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

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-light-pink dark:border-dark-purple border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
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
  )
}
