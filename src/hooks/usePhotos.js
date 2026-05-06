import { useEffect, useRef, useState, useCallback, useSyncExternalStore, useMemo } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, addDoc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useAuth } from './useAuth'
import { readFileMetadata } from '../utils/photoMetadata'
import { backfillVariants, variantPaths } from '../utils/photoVariants'
import { guest, subscribe as guestSubscribe } from '../utils/guestStorage'

export function usePhotos(_isAuthorized, filterCatId = null) {
  const { user, isAuthorized } = useAuth()
  const [dbPhotos, setDbPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingUploads, setPendingUploads] = useState([])
  const backfillTriggered = useRef(new Set())

  const guestPhotosRaw = useSyncExternalStore(guestSubscribe, () => guest.getPhotos(), () => [])

  useEffect(() => {
    if (!isAuthorized) { setDbPhotos([]); setLoading(false); return }
    const q = query(collection(db, 'photos'), where('isPublic', '==', false))
    const unsub = onSnapshot(q, (snap) => {
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      docs = docs.filter(p => p.imageUrl) // skip docs with incomplete/failed uploads
      if (filterCatId) docs = docs.filter(p => p.catIds?.includes(filterCatId))
      setDbPhotos(docs)
      setLoading(false)

      for (const p of docs) {
        if (p.storagePath && !p.microUrl && !backfillTriggered.current.has(p.id)) {
          backfillTriggered.current.add(p.id)
          backfillVariants(p.id, p.storagePath).catch(err =>
            console.warn('[variants] heal failed', p.id, err)
          )
        }
      }
    })
    return unsub
  }, [isAuthorized, filterCatId])

  const guestMerged = useMemo(() => {
    return filterCatId ? guestPhotosRaw.filter(p => p.catIds?.includes(filterCatId)) : guestPhotosRaw
  }, [guestPhotosRaw, filterCatId])

  // Shared upload execution — used by both uploadPhoto and retryUpload.
  const _execUpload = useCallback(async (tempId, file, catIds, note) => {
    let photoDocId = null
    try {
      const meta = await readFileMetadata(file)
      setPendingUploads(prev =>
        prev.map(p => p.id === tempId ? { ...p, aspectRatio: meta.aspectRatio } : p)
      )

      const photoRef = await addDoc(collection(db, 'photos'), {
        catIds,
        imageUrl: '',
        storagePath: '',
        originalFilename: meta.originalFilename,
        mimeType: meta.mimeType,
        aspectRatio: meta.aspectRatio,
        contentHash: meta.contentHash,
        note,
        createdAt: serverTimestamp(),
        uploadedBy: user.uid,
        isPublic: false,
      })
      photoDocId = photoRef.id

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
      const storagePath = `photos/${photoRef.id}/original.${ext}`
      const objRef = ref(storage, storagePath)
      await uploadBytes(objRef, file, { contentType: meta.mimeType })
      const imageUrl = await getDownloadURL(objRef)
      await updateDoc(doc(db, 'photos', photoRef.id), { imageUrl, storagePath })

      backfillVariants(photoRef.id, storagePath).catch(err =>
        console.warn('[variants] backfill failed', err)
      )

      setPendingUploads(prev => {
        const item = prev.find(p => p.id === tempId)
        if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
        return prev.filter(p => p.id !== tempId)
      })
    } catch {
      if (photoDocId) {
        deleteDoc(doc(db, 'photos', photoDocId)).catch(() => {})
      }
      setPendingUploads(prev =>
        prev.map(p => p.id === tempId ? { ...p, status: 'error' } : p)
      )
    }
  }, [user])

  const uploadPhoto = useCallback(({ file, catIds, note = '' }) => {
    if (!isAuthorized) {
      readFileMetadata(file).then(meta => {
        guest.addPhoto({ ...meta, catIds, note }, file)
      })
      return
    }
    if (!user) throw new Error('Must be signed in')

    const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const previewUrl = URL.createObjectURL(file)
    setPendingUploads(prev => [...prev, {
      id: tempId, previewUrl, catIds, note, aspectRatio: null, status: 'uploading', file,
    }])
    _execUpload(tempId, file, catIds, note)
  }, [isAuthorized, user, _execUpload])

  const retryUpload = useCallback((tempId) => {
    const entry = pendingUploads.find(p => p.id === tempId)
    if (!entry || entry.status !== 'error') return
    setPendingUploads(prev =>
      prev.map(p => p.id === tempId ? { ...p, status: 'uploading' } : p)
    )
    _execUpload(tempId, entry.file, entry.catIds, entry.note)
  }, [pendingUploads, _execUpload])

  const cancelPendingUpload = useCallback((tempId) => {
    setPendingUploads(prev => {
      const item = prev.find(p => p.id === tempId)
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return prev.filter(p => p.id !== tempId)
    })
  }, [])

  const editPhoto = useCallback(async (photo, { catIds, note = '' }) => {
    if (photo.isDemo) throw new Error('Demo photos are immutable')
    if (!isAuthorized) {
      guest.updatePhoto(photo.id, { catIds, note })
      return
    }
    await updateDoc(doc(db, 'photos', photo.id), { catIds, note })
  }, [isAuthorized])

  const deletePhoto = useCallback(async (photo) => {
    if (!isAuthorized) {
      return guest.removePhoto(photo.id)
    }
    if (photo.storagePath) {
      const paths = [photo.storagePath, ...variantPaths(photo.storagePath)]
      await Promise.all(paths.map(p =>
        deleteObject(ref(storage, p)).catch(() => {})
      ))
    }
    await deleteDoc(doc(db, 'photos', photo.id))
  }, [isAuthorized])

  return {
    photos: isAuthorized ? dbPhotos : guestMerged,
    uploadPhoto,
    editPhoto,
    deletePhoto,
    loading: isAuthorized ? loading : false,
    pendingUploads,
    retryUpload,
    cancelPendingUpload,
  }
}
