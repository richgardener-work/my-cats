const WORDS = [
  'PURR', 'MEOW', 'NYAN', 'PAWS', 'WHISKER', 'TUNA',
  'MILK', 'CLAW', 'MITTEN', 'FLOOF', 'POUNCE', 'NAP',
  'YARN', 'TABBY', 'KITTEN', 'CATNIP',
]

export function giftCode(uid) {
  if (!uid) return ''
  let h = 2166136261 >>> 0
  for (let i = 0; i < uid.length; i++) {
    h ^= uid.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  h ^= h >>> 16
  h = Math.imul(h, 0x85ebca6b) >>> 0
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35) >>> 0
  h ^= h >>> 16
  const word = WORDS[(h >>> 0) % WORDS.length]
  const suffix = (((h >>> 8) >>> 0) % 1296).toString(36).toUpperCase().padStart(2, '0')
  return `${word}-${suffix}`
}
