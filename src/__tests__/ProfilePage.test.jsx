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
    expect(screen.getByText('where the stars live')).toBeInTheDocument()
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
    // photos = useProfile.photoCount = 7
    expect(screen.getByText('photos')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    // puzzles = userDoc.puzzlesSolved = 12, total = photos.length * 3 = 36
    expect(screen.getByText('puzzles')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('/ 36')).toBeInTheDocument()
    // played = userDoc.totalGames = 25
    expect(screen.getByText('played')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
  })
})
