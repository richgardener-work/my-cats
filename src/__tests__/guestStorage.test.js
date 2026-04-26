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

describe('guest.hideDemoCat / hideDemoPhoto', () => {
  it('hideDemoCat adds id to hidden set, getter reflects it', () => {
    expect(guest.getHiddenDemoCats().has('demo-muffin')).toBe(false)
    guest.hideDemoCat('demo-muffin')
    expect(guest.getHiddenDemoCats().has('demo-muffin')).toBe(true)
  })

  it('hideDemoPhoto adds id to hidden set, getter reflects it', () => {
    expect(guest.getHiddenDemoPhotos().has('demo-photo-0').valueOf()).toBe(false)
    guest.hideDemoPhoto('demo-photo-0')
    expect(guest.getHiddenDemoPhotos().has('demo-photo-0')).toBe(true)
  })

  it('hideDemoCat triggers emit (subscriber is called)', async () => {
    const { guest: g, subscribe } = await import('../utils/guestStorage.js?bust=' + Math.random())
    let calls = 0
    const unsub = subscribe(() => { calls += 1 })
    g.hideDemoCat('demo-x')
    expect(calls).toBeGreaterThan(0)
    unsub()
  })
})
