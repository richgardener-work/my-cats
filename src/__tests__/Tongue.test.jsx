import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tongue from '../components/Tongue'

const Icon = () => <svg data-testid="icon" />

describe('Tongue', () => {
  it('renders label and icon', () => {
    render(<Tongue icon={<Icon />} label="Add photo" onClick={() => {}} ariaLabel="Add photo" />)
    expect(screen.getByText('Add photo')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Tongue icon={<Icon />} label="Play" onClick={onClick} ariaLabel="Play" />)
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Tongue icon={<Icon />} label="Play" onClick={onClick} ariaLabel="Play" disabled />,
    )
    await user.click(screen.getByRole('button', { name: 'Play' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('uses ariaLabel for the button', () => {
    render(<Tongue icon={<Icon />} label="Play" onClick={() => {}} ariaLabel="Play random unsolved puzzle" />)
    expect(screen.getByRole('button', { name: 'Play random unsolved puzzle' })).toBeInTheDocument()
  })
})
