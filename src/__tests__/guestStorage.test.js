// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest'

let guest
beforeEach(async () => {
  localStorage.clear()
  // re-import чтобы сбросить module-level cache
  const mod = await import('../utils/guestStorage.js?bust=' + Math.random())
  guest = mod.guest
})

describe('guest.removeCat', () => {
  it('detaches removed slug from all photo.catIds without deleting photos', () => {
    localStorage.setItem('guestCats', JSON.stringify([
      { id: 'muffin', name: 'Muffin', slug: 'muffin' },
      { id: 'clove',  name: 'Clove',  slug: 'clove' },
    ]))
    localStorage.setItem('guestPhotos', JSON.stringify([
      { id: 'p1', catIds: ['muffin', 'clove'] },
      { id: 'p2', catIds: ['muffin'] },
      { id: 'p3', catIds: ['clove'] },
    ]))

    guest.removeCat('muffin')

    expect(guest.getCats()).toEqual([
      { id: 'clove', name: 'Clove', slug: 'clove' },
    ])
    const photos = JSON.parse(localStorage.getItem('guestPhotos'))
    expect(photos.map(p => ({ id: p.id, catIds: p.catIds }))).toEqual([
      { id: 'p1', catIds: ['clove'] },
      { id: 'p2', catIds: [] },
      { id: 'p3', catIds: ['clove'] },
    ])
  })
})
