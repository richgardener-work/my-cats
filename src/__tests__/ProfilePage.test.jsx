import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from '../pages/ProfilePage'

vi.mock('../hooks/useProfile', () => ({
  useProfile: () => ({
    leaderboard: [
      { uid: 'u1', displayName: 'Ira',  email: 'ira@test.com',  photoURL: null, totalStars: 42, totalGames: 25, puzzlesSolved: 12, photoCount: 7 },
      { uid: 'u2', displayName: 'Rich', email: 'rich@test.com', photoURL: null, totalStars: 35, totalGames: 18, puzzlesSolved: 9,  photoCount: 4 },
    ],
    photoCount: 7,
    loading: false,
  }),
}))
vi.mock('../hooks/usePhotos', () => ({
  usePhotos: () => ({ photos: new Array(12).fill({}), loading: false }),
}))

const baseAuth = (overrides = {}) => ({
  user: null,
  userDoc: null,
  isAuthorized: false,
  signOutUser: vi.fn(),
  ...overrides,
})

describe('ProfilePage', () => {
  test('redirects when not authorized (no hero rendered)', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <ProfilePage auth={baseAuth()} />
      </MemoryRouter>
    )
    expect(screen.queryByText(/^Hello,/)).toBeNull()
    expect(screen.queryByText('Leaderboard')).toBeNull()
  })

  test('hero — eyebrow, wonky H1 with first name, subtitle', () => {
    render(
      <MemoryRouter>
        <ProfilePage auth={baseAuth({
          isAuthorized: true,
          user: { uid: 'u1', displayName: 'Ira Petrova', email: 'ira@test.com', photoURL: null },
          userDoc: { totalStars: 42, totalGames: 25, puzzlesSolved: 12, allowed: true },
        })} />
      </MemoryRouter>
    )
    expect(screen.getByText('Just you')).toBeInTheDocument()
    // H1 contains "Hello, Ira" (firstName only, not full displayName)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Hello, Ira(\b|$)/)
    // subtitle embeds star count: "where the N ⭐ live"
    expect(screen.getByText((_, el) => el?.tagName === 'P' && /where the/.test(el.textContent))).toBeInTheDocument()
  })

  test('hero — email and sign-out in right column', () => {
    render(
      <MemoryRouter>
        <ProfilePage auth={baseAuth({
          isAuthorized: true,
          user: { uid: 'u1', displayName: 'Ira', email: 'ira@test.com', photoURL: null },
          userDoc: { totalStars: 42, allowed: true },
        })} />
      </MemoryRouter>
    )
    expect(screen.getByText('ira@test.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })

  test('hero — 3 stat pills (photos / puzzles / played)', () => {
    render(
      <MemoryRouter>
        <ProfilePage auth={baseAuth({
          isAuthorized: true,
          user: { uid: 'u1', displayName: 'Ira', email: 'ira@test.com', photoURL: null },
          userDoc: { totalStars: 42, totalGames: 25, puzzlesSolved: 12, allowed: true },
        })} />
      </MemoryRouter>
    )
    // photos = useProfile.photoCount = 7 (may appear in leaderboard row too)
    expect(screen.getByText('photos')).toBeInTheDocument()
    expect(screen.getAllByText('7').length).toBeGreaterThan(0)
    // puzzles = userDoc.puzzlesSolved = 12 (total / 36 is hidden on mobile via sm:inline)
    expect(screen.getByText('puzzles')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    // played = userDoc.totalGames = 25 (may appear in leaderboard row too)
    expect(screen.getByText('played')).toBeInTheDocument()
    expect(screen.getAllByText('25').length).toBeGreaterThan(0)
  })

  test('leaderboard — eyebrow + every allowed user row + current user · you suffix', () => {
    render(
      <MemoryRouter>
        <ProfilePage auth={baseAuth({
          isAuthorized: true,
          user: { uid: 'u1', displayName: 'Ira', email: 'ira@test.com', photoURL: null },
          userDoc: { totalStars: 42, totalGames: 25, puzzlesSolved: 12, allowed: true },
        })} />
      </MemoryRouter>
    )
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
    // Both users render (Ira may appear in H1 too)
    expect(screen.getAllByText('Ira').length).toBeGreaterThan(0)
    expect(screen.getByText('Rich')).toBeInTheDocument()
    expect(screen.getByText('· you')).toBeInTheDocument()
    // Stars from leaderboard rows: 42 (me) and 35 (other) — both visible
    // 42 may also appear in the hero CountUp, so use getAllByText
    expect(screen.getAllByText('42').length).toBeGreaterThan(0)
    expect(screen.getByText('35')).toBeInTheDocument()
  })
})
