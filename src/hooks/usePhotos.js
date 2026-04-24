import { useEffect, useState, useCallback } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useAuth } from './useAuth'
import { readFileMetadata } from '../utils/photoMetadata'

export const DEMO_PHOTOS = [
  { id: 'demo-1', imageUrl: '/my-cats/default_photo_1to1.png', catIds: [], note: '', isPublic: true },
  { id: 'demo-2', imageUrl: '/my-cats/default_photo_16to9.png', catIds: [], note: '', isPublic: true },
  { id: 'demo-3', imageUrl: '/my-cats/default_photo_9to16.png', catIds: [], note: '', isPublic: true },
]

export function usePhotos(_isAuthorized, filterCatId = null) {
  const { user, isAuthorized } = useAuth()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthorized) {
      setPhotos(DEMO_PHOTOS)
      setLoading(false)
      return
    }
    const q = query(collection(db, 'photos'), where('isPublic', '==', false))
    const unsub = onSnapshot(q, (snap) => {
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      if (filterCatId) {
        docs = docs.filter(p => p.catIds?.includes(filterCatId))
      }
      setPhotos(docs)
      setLoading(false)
    })
    return unsub
  }, [isAuthorized, filterCatId])

  const uploadPhoto = useCallback(async ({ file, catIds, note = '' }) => {
    if (!user) throw new Error('Must be signed in')
    const meta = await readFileMetadata(file)

    const photoRef = await addDoc(collection(db, 'photos'), {
      catIds,
      imageUrl: '',
      storagePath: '',
      originalFilename: meta.originalFilename,
      fileSize: meta.fileSize,
      mimeType: meta.mimeType,
      width: meta.width,
      height: meta.height,
      aspectRatio: meta.aspectRatio,
      contentHash: meta.contentHash,
      takenAt: meta.takenAt ? Timestamp.fromDate(meta.takenAt) : null,
      note,
      createdAt: serverTimestamp(),
      uploadedBy: user.uid,
      uploadedByEmail: user.email,
      isPublic: false,
    })

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const storagePath = `photos/${photoRef.id}/original.${ext}`
    const objRef = ref(storage, storagePath)
    await uploadBytes(objRef, file, { contentType: meta.mimeType })
    const imageUrl = await getDownloadURL(objRef)

    await updateDoc(doc(db, 'photos', photoRef.id), { imageUrl, storagePath })

    return photoRef.id
  }, [user])

  const deletePhoto = useCallback(async (photo) => {
    if (photo.storagePath) {
      try { await deleteObject(ref(storage, photo.storagePath)) } catch { /* ignore missing */ }
    }
    await deleteDoc(doc(db, 'photos', photo.id))
  }, [])

  return { photos, uploadPhoto, deletePhoto, loading }
}
