import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../components/Header'

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
