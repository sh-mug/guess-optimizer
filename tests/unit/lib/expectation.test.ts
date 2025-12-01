import { describe, expect, it } from 'vitest'
import {
  expectedScoreAt,
  findBestExpectationPoint,
  scoreFromDistance,
} from '../../../src/lib/expectation'
import { type Point } from '../../../src/lib/types'

describe('scoreFromDistance', () => {
  it('returns 5000 at zero distance', () => {
    expect(scoreFromDistance(0, 0.01)).toBe(5000)
  })

  it('decays exponentially with distance and K', () => {
    const result = scoreFromDistance(100, 0.01)
    const expected = 5000 * Math.exp(-1)
    expect(result).toBeCloseTo(expected, 2)
  })
})

describe('expectedScoreAt', () => {
  const point: Point = { id: 'p1', lat: 0, lng: 0 }

  it('returns 0 when there are no points', () => {
    expect(expectedScoreAt(0, 0, [], 0.01)).toBe(0)
  })

  it('gets closer to 5000 as we approach the single point', () => {
    const nearScore = expectedScoreAt(0, 0, [point], 0.01)
    const farScore = expectedScoreAt(0, 10, [point], 0.01)

    expect(nearScore).toBeCloseTo(5000, 0)
    expect(nearScore).toBeGreaterThan(farScore)
  })

  it('is higher near the nearest of two distant points', () => {
    const points: Point[] = [
      { id: 'a', lat: 0, lng: 0 },
      { id: 'b', lat: 0, lng: 20 },
    ]

    const nearFirst = expectedScoreAt(0, 0, points, 0.01)
    const midpoint = expectedScoreAt(0, 10, points, 0.01)
    expect(nearFirst).toBeGreaterThan(midpoint)
  })
})

describe('findBestExpectationPoint', () => {
  it('returns null for no points', () => {
    expect(findBestExpectationPoint([], 0.01)).toBeNull()
  })

  it('returns the single point as best', () => {
    const points: Point[] = [{ id: 'solo', lat: 35, lng: 135 }]
    const result = findBestExpectationPoint(points, 0.01, {
      bbox: { minLat: 34, maxLat: 36, minLng: 134, maxLng: 136 },
      samplesLat: 5,
      samplesLng: 5,
    })

    expect(result).not.toBeNull()
    expect(result?.bestLat).toBeCloseTo(points[0].lat, 1)
    expect(result?.bestLng).toBeCloseTo(points[0].lng, 1)
    expect(result?.bestScore).toBeGreaterThan(4900)
  })

  it('prefers the center region for three-point triangle', () => {
    const points: Point[] = [
      { id: 'a', lat: 0, lng: 0 },
      { id: 'b', lat: 0, lng: 10 },
      { id: 'c', lat: 10, lng: 0 },
    ]
    const centroid = { lat: 10 / 3, lng: 10 / 3 }

    const K = 0.0001
    const result = findBestExpectationPoint(points, K, {
      samplesLat: 20,
      samplesLng: 20,
    })

    expect(result).not.toBeNull()
    const scoreAtVertex = expectedScoreAt(0, 0, points, K)
    const scoreAtCentroid = expectedScoreAt(centroid.lat, centroid.lng, points, K)
    expect(result?.bestScore ?? 0).toBeGreaterThanOrEqual(scoreAtCentroid)
    expect(result?.bestScore ?? 0).toBeGreaterThan(scoreAtVertex)
    expect(result?.bestLat).toBeGreaterThan(0)
    expect(result?.bestLng).toBeGreaterThan(0)
  })
})
