import { Navigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { usePhotos } from '../hooks/usePhotos'

export default function ProfilePage({ auth }) {
  const { user, userDoc, isAuthorized, signOutUser } = auth
  const { leaderboard, photoCount, loading } = useProfile(user?.uid)
  const { photos: allPhotos } = usePhotos(null, null)

  if (!isAuthorized) return <Navigate to="/" replace />

  const totalPossible = allPhotos.length * 3
  const initial = (user?.displayName || user?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full max-w-2xl mx-auto px-6 pt-8 pb-0">
      <div>scaffold</div>
    </div>
  )
}
