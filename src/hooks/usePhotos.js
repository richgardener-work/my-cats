import { useEffect, useRef, useState, useCallback, useSyncExternalStore, useMemo } from 'react'
import {
  collection, query, where, onSnapshot,
  doc, addDoc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useAuth } from './useAuth'
import { readFileMetadata } from '../utils/photoMetadata'
import { backfillVariants } from '../utils/photoVariants'
import { guest, subscribe as guestSubscribe } from '../utils/guestStorage'
import { demoGalleryPhotos } from '../utils/demoAssets'

export function usePhotos(_isAuthorized, filterCatId = null) {
  const { user, isAuthorized } = useAuth()
  const [dbPhotos, setDbPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const backfillTriggered = useRef(new Set())

  const guestPhotosRaw   = useSyncExternalStore(guestSubscribe, () => guest.getPhotos(),             () => [])
  const hiddenDemoPhotos = useSyncExternalStore(guestSubscribe, () => guest.getHiddenDemoPhotos(),   () => new Set())

  useEffect(() => {
    if (!isAuthorized) { setDbPhotos([]); setLoading(false); return }
    const q = query(collection(db, 'photos'), where('isPublic', '==', false))
    const unsub = onSnapshot(q, (snap) => {
      let docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
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
    const merged = [...demoGalleryPhotos, ...guestPhotosRaw]
    const visible = merged.filter(p => !hiddenDemoPhotos.has(p.id))
    return filterCatId ? visible.filter(p => p.catIds?.includes(filterCatId)) : visible
  }, [guestPhotosRaw, hiddenDemoPhotos, filterCatId])

  const uploadPhoto = useCallback(async ({ file, catIds, note = '' }) => {
    if (!isAuthorized) {
      const meta = await readFileMetadata(file)
      const rec = guest.addPhoto({ ...meta, catIds, note }, file)
      return rec.id
    }
    if (!user) throw new Error('Must be signed in')
    const meta = await readFileMetadata(file)

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

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const storagePath = `photos/${photoRef.id}/original.${ext}`
    const objRef = ref(storage, storagePath)
    await uploadBytes(objRef, file, { contentType: meta.mimeType })
    const imageUrl = await getDownloadURL(objRef)

    await updateDoc(doc(db, 'photos', photoRef.id), { imageUrl, storagePath })

    backfillVariants(photoRef.id, storagePath).catch(err =>
      console.warn('[variants] backfill failed', err)
    )

    return photoRef.id
  }, [isAuthorized, user])

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
      if (photo.isDemo) {
        guest.hideDemoPhoto(photo.id)
        return
      }
      return guest.removePhoto(photo.id)
    }
    if (photo.storagePath) {
      try { await deleteObject(ref(storage, photo.storagePath)) } catch { /* ignore missing */ }
    }
    await deleteDoc(doc(db, 'photos', photo.id))
  }, [isAuthorized])

  return {
    photos: isAuthorized ? dbPhotos : guestMerged,
    uploadPhoto,
    editPhoto,
    deletePhoto,
    loading: isAuthorized ? loading : false,
  }
}
