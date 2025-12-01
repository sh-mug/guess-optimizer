import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Controls from '../../../src/components/Controls'

describe('Controls', () => {
  it('calls onChangeK when K is updated', async () => {
    const onChangeK = vi.fn()
    render(
      <Controls K={0.01} onChangeK={onChangeK} onComputeBest={vi.fn()} />
    )

    const input = screen.getByLabelText(/K/)
    fireEvent.change(input, { target: { value: '0.02' } })
    expect(onChangeK).toHaveBeenCalledWith(0.02)
  })

  it('fires onComputeBest when button clicked', async () => {
    const onComputeBest = vi.fn()
    render(
      <Controls K={0.01} onChangeK={vi.fn()} onComputeBest={onComputeBest} />
    )

    await userEvent.click(screen.getByRole('button', { name: /期待値最大地点/i }))
    expect(onComputeBest).toHaveBeenCalled()
  })

  it('toggles heatmap when provided', async () => {
    const onToggle = vi.fn()
    render(
      <Controls
        K={0.01}
        onChangeK={vi.fn()}
        onComputeBest={vi.fn()}
        heatmapEnabled={false}
        onToggleHeatmap={onToggle}
      />
    )

    const toggle = screen.getByLabelText(/ヒートマップ/)
    await userEvent.click(toggle)
    expect(onToggle).toHaveBeenCalledWith(true)
  })
})
