import { describe, expect, it } from 'vitest'
import {
  handleRequest,
  type WorkerRequest,
  type WorkerResponse,
} from '../../../src/workers/handler'

const samplePoints = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 10 },
]

describe('worker handleRequest', () => {
  it('computes best expectation result', () => {
    const req: WorkerRequest = { type: 'computeBest', points: samplePoints, K: 0.01 }
    const res = handleRequest(req) as Extract<WorkerResponse, { type: 'bestResult' }>

    expect(res.type).toBe('bestResult')
    expect(res.result).not.toBeNull()
    expect(res.result?.bestScore ?? 0).toBeGreaterThan(0)
  })

  it('computes heatmap samples', () => {
    const req: WorkerRequest = {
      type: 'computeHeatmap',
      points: samplePoints,
      K: 0.01,
      grid: {
        minLat: -1,
        maxLat: 1,
        minLng: -1,
        maxLng: 1,
        stepLat: 1,
        stepLng: 1,
      },
    }

    const res = handleRequest(req) as Extract<WorkerResponse, { type: 'heatmapResult' }>
    expect(res.type).toBe('heatmapResult')
    expect(res.samples.length).toBeGreaterThan(0)

    const center = res.samples.find((s) => s.lat === 0 && s.lng === 0)
    expect(center?.value ?? 0).toBeGreaterThan(0)
  })

  it('returns error for unknown request', () => {
    // @ts-expect-error testing runtime guard
    const res = handleRequest({ type: 'unknown' })
    expect(res.type).toBe('error')
  })
})
