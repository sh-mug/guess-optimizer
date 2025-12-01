import { describe, expect, it } from 'vitest'
import { parseGeoGuessrJson, parsePointsFromJson } from '../../../src/lib/parsers'

const geoGuessrSample = JSON.stringify({
  name: 'CoolMap',
  customCoordinates: [
    { lat: 35.1, lng: 139.1, panoId: 'p1', countryCode: 'JP' },
    { lat: 40, lng: -74, stateCode: 'NY' },
    { lng: 10 }, // invalid
  ],
})

describe('parseGeoGuessrJson', () => {
  it('parses valid GeoGuessr JSON into PointMeta array', () => {
    const points = parseGeoGuessrJson(geoGuessrSample)
    expect(points).toHaveLength(2)
    expect(points[0].id).toBe('gg-CoolMap-0')
    expect(points[0].lat).toBeCloseTo(35.1)
    expect(points[0].lng).toBeCloseTo(139.1)
    expect(points[0].source).toBe('geoguessr-json')
    expect(points[0].panoId).toBe('p1')
    expect(points[0].countryCode).toBe('JP')
    expect(points[1].stateCode).toBe('NY')
  })

  it('throws if customCoordinates is missing', () => {
    const badJson = JSON.stringify({ name: 'oops' })
    expect(() => parseGeoGuessrJson(badJson)).toThrow()
  })
})

describe('parsePointsFromJson', () => {
  it('detects GeoGuessr format', () => {
    const result = parsePointsFromJson(geoGuessrSample)
    expect(result[0].source).toBe('geoguessr-json')
  })

  it('parses simple array JSON', () => {
    const simpleJson = JSON.stringify([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
    ])
    const points = parsePointsFromJson(simpleJson)
    expect(points).toHaveLength(2)
    expect(points[0].id).toBe('simple-0')
    expect(points[0].source).toBe('simple-json')
    expect(points[1].lat).toBe(3)
    expect(points[1].lng).toBe(4)
  })

  it('throws for unsupported JSON', () => {
    expect(() => parsePointsFromJson('{"foo":1}')).toThrow()
  })
})
