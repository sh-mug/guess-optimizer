import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleRequest } from '../../../src/workers/handler'

let lastHeatmapSamples: any[] | undefined
let lastOnViewportChange: ((vp: any) => void) | undefined
vi.mock('../../../src/components/MapView', () => ({
  default: ({
    onAddPoint,
    heatmapSamples,
    onViewportChange,
  }: {
    onAddPoint?: (lat: number, lng: number) => void
    heatmapSamples?: any[]
    onViewportChange?: (vp: any) => void
  }) => {
    lastHeatmapSamples = heatmapSamples
    lastOnViewportChange = onViewportChange
    return (
      <div>
        <button onClick={() => onAddPoint?.(1, 2)}>mock-map-add</button>
        <div>mock-map</div>
      </div>
    )
  },
}))

import App from '../../../src/App'

class MockWorker {
  onmessage: ((ev: MessageEvent<any>) => void) | null = null
  constructor() {}
  postMessage(data: any) {
    const response = handleRequest(data as any)
    Promise.resolve().then(() => this.onmessage?.({ data: response } as MessageEvent<any>))
  }
  terminate() {}
}

beforeEach(() => {
  vi.stubGlobal('Worker', MockWorker as any)
})

describe('App', () => {
  it('increases point count when JSON is loaded', async () => {
    render(<App />)

    const textarea = screen.getByLabelText(/json/i)
    await userEvent.clear(textarea)
    fireEvent.change(textarea, {
      target: { value: '[{"lat":1,"lng":2},{"lat":3,"lng":4}]' },
    })
    await userEvent.click(screen.getByRole('button', { name: /Load/i }))

    expect(await screen.findByText(/Points: 2/)).toBeInTheDocument()
  })

  it('computes best expectation via worker', async () => {
    render(<App />)

    const textarea = screen.getByLabelText(/json/i)
    await userEvent.clear(textarea)
    fireEvent.change(textarea, {
      target: { value: '[{"lat":0,"lng":0},{"lat":0,"lng":5}]' },
    })
    await userEvent.click(screen.getByRole('button', { name: /Load/i }))

    await userEvent.click(screen.getByRole('button', { name: /Compute best/i }))

    await waitFor(() => {
      expect(screen.getByText(/Expected score:/)).toBeInTheDocument()
    })
  })

  it('adds a point from map interaction', async () => {
    render(<App />)
    await userEvent.click(screen.getByText('mock-map-add'))
    expect(await screen.findByText(/Points: 1/)).toBeInTheDocument()
  })

  it('enables heatmap and stores samples from worker', async () => {
    render(<App />)

    const textarea = screen.getByLabelText(/json/i)
    await userEvent.clear(textarea)
    fireEvent.change(textarea, {
      target: { value: '[{"lat":0,"lng":0},{"lat":0,"lng":5}]' },
    })
    await userEvent.click(screen.getByRole('button', { name: /Load/i }))

    lastOnViewportChange?.({
      bounds: { minLat: -1, maxLat: 1, minLng: -1, maxLng: 6 },
      zoom: 5,
    })

    await userEvent.click(screen.getByLabelText(/Heatmap/i))

    await waitFor(() => {
      expect(lastHeatmapSamples && lastHeatmapSamples.length).toBeGreaterThan(0)
    })
  })
})
