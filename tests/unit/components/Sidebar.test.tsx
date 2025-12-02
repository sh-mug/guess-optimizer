import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { type ExpectationResult, type PointMeta } from '../../../src/lib/types'

const mockParsedPoints: PointMeta[] = [{ id: 'p1', lat: 1, lng: 2 }]

vi.mock('../../../src/components/FileLoader', () => ({
  default: ({ onParsed }: { onParsed: (pts: PointMeta[]) => void }) => (
    <button onClick={() => onParsed(mockParsedPoints)}>mock-file-loader</button>
  ),
}))

vi.mock('../../../src/components/Controls', () => ({
  default: ({
    onChangeK,
    onComputeBest,
  }: {
    onChangeK: (k: number) => void
    onComputeBest: () => void
  }) => (
    <div>
      <button onClick={() => onChangeK(0.02)}>mock-change-k</button>
      <button onClick={onComputeBest}>mock-compute</button>
    </div>
  ),
}))

import Sidebar from '../../../src/components/Sidebar'

describe('Sidebar', () => {
  it('displays counts and best result', () => {
    const bestResult: ExpectationResult = { bestLat: 5, bestLng: 10, bestScore: 4500 }
    render(
      <Sidebar
        pointsCount={3}
        bestResult={bestResult}
        K={0.01}
        onParsedPoints={vi.fn()}
        onChangeK={vi.fn()}
        onComputeBest={vi.fn()}
      />
    )

    expect(screen.getByText(/Points: 3/)).toBeInTheDocument()
    expect(screen.getByText(/Expected score: 4500\.0/)).toBeInTheDocument()
    expect(screen.getByText(/Lat: 5\.0000 \/ Lng: 10\.0000/)).toBeInTheDocument()
  })

  it('forwards callbacks to children', async () => {
    const onParsed = vi.fn()
    const onChangeK = vi.fn()
    const onComputeBest = vi.fn()
    render(
      <Sidebar
        pointsCount={0}
        bestResult={null}
        K={0.01}
        onParsedPoints={onParsed}
        onChangeK={onChangeK}
        onComputeBest={onComputeBest}
      />
    )

    await userEvent.click(screen.getByText('mock-file-loader'))
    await userEvent.click(screen.getByText('mock-change-k'))
    await userEvent.click(screen.getByText('mock-compute'))

    expect(onParsed).toHaveBeenCalledWith(mockParsedPoints)
    expect(onChangeK).toHaveBeenCalledWith(0.02)
    expect(onComputeBest).toHaveBeenCalled()
  })
})
