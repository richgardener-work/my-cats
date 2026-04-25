import { slugify } from './slugify.js'

const homeFiles    = import.meta.glob('../assets/demo/home/*.{jpg,jpeg,png,webp}',    { eager: true, query: '?url', import: 'default' })
const galleryFiles = import.meta.glob('../assets/demo/gallery/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })

import homeIndexJson    from '../assets/demo/home/index.json'
import galleryIndexJson from '../assets/demo/gallery/index.json'

const basename = (path) => path.split('/').pop()
const stripExt = (name) => name.replace(/\.[^.]+$/, '')

export function buildDemoAssets({ homeFiles, homeIndex, galleryFiles, galleryIndex }) {
  // Карта: имя файла → url
  const homeByName = Object.fromEntries(
    Object.entries(homeFiles).map(([path, url]) => [basename(path), url])
  )
  const galleryByName = Object.fromEntries(
    Object.entries(galleryFiles).map(([path, url]) => [basename(path), url])
  )

  // Home: индекс задаёт порядок и подписи; orphan-файлы добавляются в конец с fallback'ом
  const indexedHome = homeIndex
    .filter(entry => homeByName[entry.file])
    .map(entry => ({ url: homeByName[entry.file], cat: entry.cat }))
  const indexedHomeFiles = new Set(homeIndex.map(e => e.file))
  const orphanHome = Object.entries(homeByName)
    .filter(([name]) => !indexedHomeFiles.has(name))
    .map(([name, url]) => ({ url, cat: stripExt(name) }))
  const homeDeckItems = [...indexedHome, ...orphanHome]

  // Gallery: то же, но с note и cats[]
  const indexedGallery = galleryIndex
    .filter(entry => galleryByName[entry.file])
    .map((entry, i) => ({
      id: `demo-photo-${i}-${stripExt(entry.file)}`,
      imageUrl: galleryByName[entry.file],
      catIds: (entry.cats || []).map(name => `demo-${slugify(name)}`),
      note: entry.note ?? '',
      isDemo: true,
    }))
  const indexedGalleryFiles = new Set(galleryIndex.map(e => e.file))
  const orphanGallery = Object.entries(galleryByName)
    .filter(([name]) => !indexedGalleryFiles.has(name))
    .map(([name, url], i) => ({
      id: `demo-photo-orphan-${i}-${stripExt(name)}`,
      imageUrl: url,
      catIds: [],
      note: '',
      isDemo: true,
    }))
  const demoGalleryPhotos = [...indexedGallery, ...orphanGallery]

  // Cats: уникальные по slug, собранные из home + gallery (включая orphan'ы)
  const catNames = new Set([
    ...homeDeckItems.map(i => i.cat),
    ...galleryIndex.flatMap(e => e.cats || []),
  ])
  const demoGalleryCats = [...catNames].map(name => {
    const slug = slugify(name)
    return { id: `demo-${slug}`, name, slug, isDemo: true }
  })
  // Дедуп на случай разных name → одинаковый slug
  const seenSlugs = new Set()
  const uniqueCats = demoGalleryCats.filter(c => {
    if (seenSlugs.has(c.slug)) return false
    seenSlugs.add(c.slug)
    return true
  })

  return { homeDeckItems, demoGalleryPhotos, demoGalleryCats: uniqueCats }
}

const built = buildDemoAssets({
  homeFiles,
  homeIndex: homeIndexJson,
  galleryFiles,
  galleryIndex: galleryIndexJson,
})

export const homeDeckItems     = built.homeDeckItems
export const demoGalleryPhotos = built.demoGalleryPhotos
export const demoGalleryCats   = built.demoGalleryCats
