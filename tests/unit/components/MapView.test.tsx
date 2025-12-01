import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MapView from '../../../src/components/MapView'
import { type PointMeta } from '../../../src/lib/types'

class MockMap {
  handlers: Record<string, ((ev: any) => void)[]> = {}
  sources: Record<string, any> = {}
  addControl = vi.fn()
  addLayer = vi.fn()
  removeLayer = vi.fn()
  removeSource = vi.fn()
  remove = vi.fn()

  on(event: string, handler: (ev: any) => void) {
    this.handlers[event] = this.handlers[event] || []
    this.handlers[event].push(handler)
    if (event === 'load') {
      handler({ target: this })
    }
  }

  addSource(id: string, source: any) {
    const src = {
      data: source.data,
      setData: vi.fn((data) => {
        src.data = data
      }),
    }
    this.sources[id] = src
  }

  getSource(id: string) {
    return this.sources[id]
  }

  trigger(event: string, payload: any) {
    this.handlers[event]?.forEach((h) => h(payload))
  }
}

const { createMap, getLastMap } = vi.hoisted(() => {
  let mapInstance: MockMap
  const createMap = vi.fn(function () {
    mapInstance = new MockMap()
    return mapInstance
  })
  return { createMap, getLastMap: () => mapInstance }
})

vi.mock('maplibre-gl', () => {
  const NavigationControl = vi.fn()
  return {
    Map: createMap,
    NavigationControl,
    default: { Map: createMap, NavigationControl },
  }
})

const samplePoints: PointMeta[] = [
  { id: '1', lat: 0, lng: 0, source: 'click' },
  { id: '2', lat: 10, lng: 10, source: 'click' },
]

describe('MapView', () => {
  it('renders map container', () => {
    const { getByTestId } = render(<MapView points={[]} />)
    expect(getByTestId('map-view')).toBeInTheDocument()
    expect(createMap).toHaveBeenCalled()
  })

  it('calls onAddPoint when map is clicked', async () => {
    const onAddPoint = vi.fn()
    render(<MapView points={[]} onAddPoint={onAddPoint} />)

    getLastMap().trigger('click', { lngLat: { lat: 5, lng: 10 } })
    expect(onAddPoint).toHaveBeenCalledWith(5, 10)
  })

  it('updates points source when props change', () => {
    const { rerender } = render(<MapView points={[]} />)
    const sourceBefore = getLastMap().getSource('points')
    expect(sourceBefore.data.features).toHaveLength(0)

    rerender(<MapView points={samplePoints} />)
    const sourceAfter = getLastMap().getSource('points')
    expect(sourceAfter.setData).toHaveBeenCalled()
    expect(sourceAfter.data.features).toHaveLength(2)
  })
})
