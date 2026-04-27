import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MobileDrawer from '../components/MobileDrawer'

function renderDrawer({ open = true, onClose = vi.fn(), auth = { user: null, signIn: vi.fn(), signOutUser: vi.fn() }, route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <MobileDrawer open={open} onClose={onClose} auth={auth} />
    </MemoryRouter>,
  )
}

describe('MobileDrawer', () => {
  it('renders nothing visible when open=false', () => {
    renderDrawer({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders 3 nav links and Sign in pill when open and signed-out', () => {
    renderDrawer({ open: true })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gallery' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Games' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument()
  })
})
