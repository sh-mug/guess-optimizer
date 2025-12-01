import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FileLoader from '../../../src/components/FileLoader'

describe('FileLoader', () => {
  it('parses JSON text and calls onParsed', async () => {
    const onParsed = vi.fn()
    render(<FileLoader onParsed={onParsed} />)

    const textarea = screen.getByLabelText(/json/i)
    await userEvent.clear(textarea)
    fireEvent.change(textarea, { target: { value: '[{"lat":1,"lng":2}]' } })
    await userEvent.click(screen.getByRole('button', { name: /読み込む/i }))

    await waitFor(() => {
      expect(onParsed).toHaveBeenCalled()
      expect(onParsed.mock.calls[0][0]).toHaveLength(1)
    })
  })

  it('shows an error message when parsing fails', async () => {
    const onParsed = vi.fn()
    render(<FileLoader onParsed={onParsed} />)

    const textarea = screen.getByLabelText(/json/i)
    await userEvent.type(textarea, 'not json')
    await userEvent.click(screen.getByRole('button', { name: /読み込む/i }))

    expect(await screen.findByText(/パース/i)).toBeInTheDocument()
    expect(onParsed).not.toHaveBeenCalled()
  })
})
