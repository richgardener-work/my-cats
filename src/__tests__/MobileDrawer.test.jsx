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

  it('applies bg-morph to the active route pill', () => {
    renderDrawer({ open: true, route: '/gallery' })
    expect(screen.getByRole('link', { name: 'Gallery' })).toHaveClass('bg-morph')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass('bg-morph')
  })

  it('applies inactive pill classes to non-active routes', () => {
    renderDrawer({ open: true, route: '/' })
    const gallery = screen.getByRole('link', { name: 'Gallery' })
    expect(gallery).toHaveClass('backdrop-blur-md')
    expect(gallery).not.toHaveClass('bg-morph')
  })

  it('calls onClose when backdrop is clicked', async () => {
    const onClose = vi.fn()
    const user = (await import('@testing-library/user-event')).default.setup()
    renderDrawer({ open: true, onClose })
    await user.click(screen.getByTestId('drawer-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when a nav link is clicked', async () => {
    const onClose = vi.fn()
    const user = (await import('@testing-library/user-event')).default.setup()
    renderDrawer({ open: true, onClose })
    await user.click(screen.getByRole('link', { name: 'Gallery' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls auth.signIn and onClose when Sign in button is clicked', async () => {
    const onClose = vi.fn()
    const signIn = vi.fn()
    const user = (await import('@testing-library/user-event')).default.setup()
    renderDrawer({ open: true, onClose, auth: { user: null, signIn, signOutUser: vi.fn() } })
    await user.click(screen.getByRole('button', { name: /sign in with google/i }))
    expect(signIn).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
