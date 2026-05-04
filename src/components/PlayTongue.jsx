import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Play } from 'lucide-react'
import Tongue from './Tongue'
import { usePhotos } from '../hooks/usePhotos'
import { filterPhotosByTag } from '../utils/photoFilter'
import { pickRandomPuzzle } from '../utils/pickRandomPuzzle'

export default function PlayTongue({ auth, games }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const cat = params.get('cat') || null
  const { photos: rawPhotos } = usePhotos(null, null)
  const photos = useMemo(() => filterPhotosByTag(rawPhotos, cat), [rawPhotos, cat])
  const uid = auth.user?.uid ?? 'guest'
  const disabled = photos.length === 0

  const onPlay = () => {
    const chosen = pickRandomPuzzle({
      photos,
      getScore: games.getScore,
      uid,
      difficulty: '3x3',
    })
    if (chosen) navigate(`/games/${chosen.id}/3x3`)
  }

  return (
    <Tongue
      icon={<Play size={14} fill="currentColor" />}
      label="Play"
      ariaLabel={disabled ? 'Add photos first' : 'Play random unsolved puzzle'}
      onClick={onPlay}
      disabled={disabled}
    />
  )
}
