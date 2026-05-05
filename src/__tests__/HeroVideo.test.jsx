import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import HeroVideo from '../components/HeroVideo'

vi.mock('../utils/heroVideos', () => ({
  desktopVideos: ['http://test/desktop.mp4'],
  mobileVideos:  ['http://test/mobile.mp4'],
  pickRandom: (arr) => arr[0] ?? null,
}))

vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({ dark: false }),
}))

vi.mock('../components/decor/MeshGradient', () => ({
  default: () => <div data-testid="mesh-gradient" />,
}))

vi.mock('../components/decor/PaperNoise', () => ({
  default: () => null,
}))

// jsdom does not reflect the `muted` boolean attribute on HTMLVideoElement
// (it is a property-only reflection), so we patch it globally for this suite.
Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
  set(v) { if (v) this.setAttribute('muted', '') },
  get() { return this.hasAttribute('muted') },
  configurable: true,
})

beforeEach(() => vi.clearAllMocks())

describe('HeroVideo — video rendering', () => {
  it('renders a video element', () => {
    render(<HeroVideo />)
    expect(document.querySelector('video')).toBeInTheDocument()
  })

  it('video has autoPlay loop muted playsInline', () => {
    render(<HeroVideo />)
    const video = document.querySelector('video')
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('muted')
    expect(video).toHaveAttribute('playsinline')
  })

  it('renders desktop source without media attribute', () => {
    render(<HeroVideo />)
    const sources = [...document.querySelectorAll('source')]
    const desktop = sources.find(s => !s.getAttribute('media'))
    expect(desktop).toBeTruthy()
    expect(desktop.getAttribute('src')).toBe('http://test/desktop.mp4')
  })

  it('renders mobile source with (max-width: 767px) media attribute', () => {
    render(<HeroVideo />)
    const sources = [...document.querySelectorAll('source')]
    const mobile = sources.find(s => s.getAttribute('media') === '(max-width: 767px)')
    expect(mobile).toBeTruthy()
    expect(mobile.getAttribute('src')).toBe('http://test/mobile.mp4')
  })
})

describe('HeroVideo — fallback', () => {
  it('shows MeshGradient on video error', () => {
    render(<HeroVideo />)
    expect(screen.queryByTestId('mesh-gradient')).not.toBeInTheDocument()
    fireEvent.error(document.querySelector('video'))
    expect(screen.getByTestId('mesh-gradient')).toBeInTheDocument()
    expect(document.querySelector('video')).not.toBeInTheDocument()
  })
})
