import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from '../pages/ProfilePage'

vi.mock('../hooks/useProfile', () => ({
  useProfile: () => ({
    leaderboard: [
      { uid: 'u1', displayName: 'Ira',  email: 'ira@test.com',  photoURL: null, totalStars: 42 },
      { uid: 'u2', displayName: 'Rich', email: 'rich@test.com', photoURL: null, totalStars: 35 },
    ],
    photoCount: 0,
    loading: false,
  }),
}))
vi.mock('../hooks/usePhotos', () => ({
  usePhotos: () => ({ photos: [], loading: false }),
}))

const baseAuth = (overrides = {}) => ({
  user: null,
  userDoc: null,
  isAuthorized: false,
  signOutUser: vi.fn(),
  ...overrides,
})

describe('ProfilePage', () => {
  test('renders nothing meaningful when not authorized', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <ProfilePage auth={baseAuth()} />
      </MemoryRouter>
    )
    expect(screen.queryByText('Stars')).toBeNull()
  })

  test('shows user stats in hero when authorized', () => {
    render(
      <MemoryRouter>
        <ProfilePage auth={baseAuth({
          isAuthorized: true,
          user: { uid: 'u1', displayName: 'Ira', email: 'ira@test.com', photoURL: null },
          userDoc: { totalStars: 42, totalGames: 25, puzzlesSolved: 12, allowed: true },
        })} />
      </MemoryRouter>
    )
    expect(screen.getAllByText('Ira').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ira@test.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/42 ⭐/).length).toBeGreaterThan(0)  // stars rendered as "42 ⭐"
    expect(screen.getByText('25')).toBeTruthy()    // played
    expect(screen.getByText(/12/)).toBeTruthy()    // puzzles solved
    expect(screen.getByRole('button', { name: /sign out/i })).toBeTruthy()
  })

  test('leaderboard shows all users, highlights current user', () => {
    render(
      <MemoryRouter>
        <ProfilePage auth={baseAuth({
          isAuthorized: true,
          user: { uid: 'u1', displayName: 'Ira', email: 'ira@test.com', photoURL: null },
          userDoc: { totalStars: 42, totalGames: 0, puzzlesSolved: 0, allowed: true },
        })} />
      </MemoryRouter>
    )
    expect(screen.getByText('Leaderboard')).toBeTruthy()
    expect(screen.getByText('Rich')).toBeTruthy()
    expect(screen.getByText('· you')).toBeTruthy()
  })
})
