import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { useScores } from './hooks/useScores'
import Header from './components/Header'
import Footer from './components/Footer'
import GuestBanner from './components/GuestBanner'
import SiteBackground from './components/decor/SiteBackground'
import HomePage from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'
import GamesPage from './pages/GamesPage'
import GameScreen from './pages/GameScreen'
import AdminPage from './pages/AdminPage'

function AppLayout({ theme, auth, scores, authOpen, onAuthOpen, onAuthClose }) {
  const location = useLocation()
  const themeStr = theme.dark ? 'dark' : 'light'

  return (
    <div className="relative flex min-h-screen flex-col text-light-text dark:text-dark-text">
      <SiteBackground dark={theme.dark} />
      <Header
        theme={theme}
        auth={auth}
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
          <Route path="/games" element={<GamesPage auth={auth} scores={scores} />} />
          <Route path="/games/:photoId/:difficulty" element={<GameScreen auth={auth} scores={scores} />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      <Footer theme={themeStr} />
    </div>
  )
}

export default function App() {
  const theme = useTheme()
  const auth = useAuth()
  const scores = useScores(auth)
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
        scores={scores}
        authOpen={authOpen}
        onAuthOpen={() => setAuthOpen(true)}
        onAuthClose={() => setAuthOpen(false)}
      />
    </BrowserRouter>
  )
}
