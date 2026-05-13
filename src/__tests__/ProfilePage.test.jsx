import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProfilePage from '../pages/ProfilePage'

vi.mock('../hooks/useProfile', () => ({
  useProfile: () => ({ leaderboard: [], photoCount: 0, loading: false }),
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
})
