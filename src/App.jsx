import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'
import GamesPage from './pages/GamesPage'
import GameScreen from './pages/GameScreen'

export default function App() {
  const theme = useTheme()
  const auth = useAuth()

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-light-pink dark:border-dark-purple border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter basename="/my-cats">
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
        <Header theme={theme} auth={auth} />
        <Routes>
          <Route path="/" element={<HomePage auth={auth} />} />
          <Route path="/gallery" element={<GalleryPage auth={auth} />} />
          <Route path="/games" element={<GamesPage auth={auth} />} />
          <Route path="/games/:photoId/:difficulty" element={<GameScreen auth={auth} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
