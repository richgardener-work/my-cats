// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { giftCode } from '../utils/giftCode.js'

describe('giftCode', () => {
  it('is deterministic for the same uid', () => {
    expect(giftCode('abc123')).toBe(giftCode('abc123'))
  })

  it('returns Latin-only WORD-XX format', () => {
    expect(giftCode('abc123')).toMatch(/^[A-Z]+-[0-9A-Z]{2}$/)
    expect(giftCode('a-very-long-firebase-uid-0001')).toMatch(/^[A-Z]+-[0-9A-Z]{2}$/)
  })

  it('differs for different uids', () => {
    expect(giftCode('userOne')).not.toBe(giftCode('userTwo'))
  })

  it('spreads codes well across many uids (decorrelated word/suffix)', () => {
    const codes = Array.from({ length: 100 }, (_, i) => giftCode(`user-${i}`))
    expect(new Set(codes).size).toBeGreaterThanOrEqual(50)
  })

  it('returns empty string for falsy uid', () => {
    expect(giftCode('')).toBe('')
    expect(giftCode(undefined)).toBe('')
    expect(giftCode(null)).toBe('')
  })
})
