// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { buildDemoAssets } from '../utils/demoAssets.js'

const homeFiles = {
  './demo/home/muffin.png': '/static/muffin.hash.png',
  './demo/home/clove.png':  '/static/clove.hash.png',
  './demo/home/orphan.png': '/static/orphan.hash.png',
}
const homeIndex = [
  { file: 'muffin.png', cat: 'Muffin' },
  { file: 'clove.png',  cat: 'Clove' },
  { file: 'missing.png', cat: 'Ghost' },
]

const galleryFiles = {
  './demo/gallery/morning.png': '/static/morning.hash.png',
  './demo/gallery/duo.png':     '/static/duo.hash.png',
}
const galleryIndex = [
  { file: 'morning.png', cats: ['Muffin'], note: 'morning' },
  { file: 'duo.png',     cats: ['Muffin', 'Clove'] },
]

describe('buildDemoAssets', () => {
  it('homeDeckItems: возвращает запись для каждого файла с урлом и подписью', () => {
    const { homeDeckItems } = buildDemoAssets({ homeFiles, homeIndex, galleryFiles, galleryIndex })
    expect(homeDeckItems).toEqual([
      { url: '/static/muffin.hash.png', cat: 'Muffin' },
      { url: '/static/clove.hash.png',  cat: 'Clove' },
      { url: '/static/orphan.hash.png', cat: 'orphan' }, // fallback: имя файла без расширения
    ])
  })

  it('homeDeckItems: запись с отсутствующим файлом игнорируется', () => {
    const { homeDeckItems } = buildDemoAssets({ homeFiles, homeIndex, galleryFiles, galleryIndex })
    expect(homeDeckItems.find(i => i.cat === 'Ghost')).toBeUndefined()
  })

  it('demoGalleryPhotos: имеют isDemo=true и demo-префиксные catIds', () => {
    const { demoGalleryPhotos } = buildDemoAssets({ homeFiles, homeIndex, galleryFiles, galleryIndex })
    expect(demoGalleryPhotos).toHaveLength(2)
    expect(demoGalleryPhotos[0]).toMatchObject({
      id: expect.stringMatching(/^demo-photo-/),
      imageUrl: '/static/morning.hash.png',
      catIds: ['demo-muffin'],
      note: 'morning',
      isDemo: true,
    })
    expect(demoGalleryPhotos[1].catIds).toEqual(['demo-muffin', 'demo-clove'])
  })

  it('demoGalleryPhotos: note по умолчанию пустая строка', () => {
    const { demoGalleryPhotos } = buildDemoAssets({ homeFiles, homeIndex, galleryFiles, galleryIndex })
    expect(demoGalleryPhotos[1].note).toBe('')
  })

  it('demoGalleryCats: уникальны по slug и собраны из home + gallery', () => {
    const { demoGalleryCats } = buildDemoAssets({ homeFiles, homeIndex, galleryFiles, galleryIndex })
    const slugs = demoGalleryCats.map(c => c.slug)
    expect(slugs).toContain('muffin')
    expect(slugs).toContain('clove')
    expect(slugs).toContain('orphan') // из fallback'а home-файла
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('demoGalleryCats: имеют isDemo=true и id с префиксом demo-', () => {
    const { demoGalleryCats } = buildDemoAssets({ homeFiles, homeIndex, galleryFiles, galleryIndex })
    for (const c of demoGalleryCats) {
      expect(c.isDemo).toBe(true)
      expect(c.id).toBe(`demo-${c.slug}`)
    }
  })
})
