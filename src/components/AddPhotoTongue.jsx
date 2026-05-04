import { Plus } from 'lucide-react'
import Tongue from './Tongue'
import { openUploadModal } from '../hooks/useUploadModal'

export default function AddPhotoTongue() {
  return (
    <Tongue
      icon={<Plus size={14} />}
      label="Add photo"
      ariaLabel="Add photo"
      onClick={openUploadModal}
    />
  )
}
