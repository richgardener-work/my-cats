export function pickRandom(arr) {
  if (!arr || !arr.length) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

export const desktopVideos = Object.values(
  import.meta.glob('../assets/demo/hero/desktop/*.mp4', { eager: true, query: '?url', import: 'default' })
)

export const mobileVideos = Object.values(
  import.meta.glob('../assets/demo/hero/mobile/*.mp4', { eager: true, query: '?url', import: 'default' })
)
