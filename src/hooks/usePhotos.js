import { useState, useEffect } from 'react'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'

export function usePhotos(isAuthorized, filterCatId = null) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = isAuthorized
      ? query(collection(db, 'photos'), orderBy('createdAt', 'asc'))
      : query(collection(db, 'photos'), where('isPublic', '==', true), orderBy('createdAt', 'asc'))

    return onSnapshot(q, (snap) => {
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      if (filterCatId) {
        docs = docs.filter(p => p.catIds?.includes(filterCatId))
      }
      setPhotos(docs)
      setLoading(false)
    })
  }, [isAuthorized, filterCatId])

  const uploadPhoto = async ({ file, catIds, note, userId }) => {
    const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`)
    await uploadBytes(storageRef, file)
    const imageUrl = await getDownloadURL(storageRef)
    return addDoc(collection(db, 'photos'), {
      catIds,
      imageUrl,
      note: note || '',
      createdAt: serverTimestamp(),
      uploadedBy: userId,
      isPublic: false,
    })
  }

  const deletePhoto = async (photo) => {
    const storageRef = ref(storage, photo.imageUrl)
    await deleteObject(storageRef).catch(() => {})
    await deleteDoc(doc(db, 'photos', photo.id))
  }

  return { photos, loading, uploadPhoto, deletePhoto }
}
