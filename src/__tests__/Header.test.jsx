import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../components/Header'

vi.mock('../hooks/usePhotos', () => ({
  usePhotos: () => ({ photos: [], loading: false, deletePhoto: vi.fn() }),
}))

const baseTheme = { dark: false, toggle: vi.fn() }
const baseAuth = {
  user: null,
  signInPending: false,
  signInUser: vi.fn().mockResolvedValue(undefined),
  signOutUser: vi.fn(),
}

function renderHeader({ route = '/', auth = baseAuth, theme = baseTheme, games = { getScore: () => null, totalStars: 0 } } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Header
        theme={theme}
        auth={auth}
        games={games}
        totalStars={games.totalStars}
        authOpen={false}
        onAuthOpen={vi.fn()}
        onAuthClose={vi.fn()}
      />
    </MemoryRouter>,
  )
}

describe('Header layout', () => {
  it('renders logo with My Cats label on every viewport', () => {
    renderHeader()
    expect(screen.getByText('My Cats')).toBeInTheDocument()
  })

  it('renders Gallery and Games pill segments', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Gallery' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Games' })).toBeInTheDocument()
  })

  it('marks Gallery active on /gallery', () => {
    renderHeader({ route: '/gallery' })
    expect(screen.getByRole('link', { name: 'Gallery' })).toHaveClass('bg-morph')
    expect(screen.getByRole('link', { name: 'Games' })).not.toHaveClass('bg-morph')
  })

  it('does not render a hamburger / drawer trigger', () => {
    renderHeader()
    expect(screen.queryByRole('button', { name: /open menu|close menu/i })).not.toBeInTheDocument()
  })

  it('renders the theme toggle button', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument()
  })
})

describe('Header pill — third segment', () => {
  it('renders Sign in segment when logged out', () => {
    renderHeader({ auth: { ...baseAuth, user: null } })
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Profile menu' })).not.toBeInTheDocument()
  })

  it('renders Profile segment with avatar initial when logged in', () => {
    renderHeader({
      auth: { ...baseAuth, user: { displayName: 'Ira', email: 'i@x.y', photoURL: null, uid: 'u1' } },
    })
    expect(screen.getByRole('button', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByText('I')).toBeInTheDocument()
  })

  it('opens AuthModal when Sign in segment clicked', async () => {
    const user = (await import('@testing-library/user-event')).default.setup()
    const onAuthOpen = vi.fn()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header
          theme={baseTheme}
          auth={{ ...baseAuth, user: null }}
          games={{ getScore: () => null, totalStars: 0 }}
          totalStars={0}
          authOpen={false}
          onAuthOpen={onAuthOpen}
          onAuthClose={vi.fn()}
        />
      </MemoryRouter>,
    )
    await user.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(onAuthOpen).toHaveBeenCalledTimes(1)
  })

  it('does not render a separate standalone Sign In button outside the pill', () => {
    renderHeader({ auth: { ...baseAuth, user: null } })
    const allSignIns = screen.queryAllByRole('button', { name: /^sign in$/i })
    expect(allSignIns).toHaveLength(1)
  })
})

describe('Header tongue', () => {
  it('renders Add photo tongue on /gallery', () => {
    renderHeader({ route: '/gallery' })
    expect(screen.getByRole('button', { name: 'Add photo' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Play/i })).not.toBeInTheDocument()
  })

  it('renders Play tongue on /games', () => {
    renderHeader({ route: '/games' })
    expect(screen.getByRole('button', { name: 'Add photos first' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add photo' })).not.toBeInTheDocument()
  })

  it('renders no tongue on /', () => {
    renderHeader({ route: '/' })
    expect(screen.queryByRole('button', { name: 'Add photo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Play/i })).not.toBeInTheDocument()
  })

  it('Play tongue is disabled (Add photos first) when no photos exist', () => {
    renderHeader({ route: '/games' })
    const btn = screen.getByRole('button', { name: 'Add photos first' })
    expect(btn).toBeDisabled()
  })
})
