import { describe, expect, it } from 'vitest'
import { haversineDistanceKm } from '../../../src/lib/geo'

describe('haversineDistanceKm', () => {
  it('returns 0 for identical points', () => {
    const d = haversineDistanceKm(35.0, 135.0, 35.0, 135.0)
    expect(d).toBeCloseTo(0, 6)
  })

  it('computes ~111 km for 1° longitude difference on equator', () => {
    const d = haversineDistanceKm(0, 0, 0, 1)
    expect(d).toBeCloseTo(111.2, 1)
  })

  it('matches known distance within tolerance (Tokyo to London)', () => {
    const tokyo = { lat: 35.6895, lng: 139.6917 }
    const london = { lat: 51.5074, lng: -0.1278 }

    const d = haversineDistanceKm(tokyo.lat, tokyo.lng, london.lat, london.lng)
    expect(Math.abs(d - 9558)).toBeLessThan(150)
  })
})
