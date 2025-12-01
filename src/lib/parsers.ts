import { type PointMeta } from './types'

interface GeoGuessrCoordinate {
  lat: number
  lng: number
  heading?: number
  pitch?: number
  zoom?: number
  panoId?: string
  countryCode?: string | null
  stateCode?: string | null
  extra?: unknown
}

interface GeoGuessrMapJson {
  name?: string
  customCoordinates?: GeoGuessrCoordinate[]
  extra?: {
    tags?: Record<string, unknown>
    infoCoordinates?: unknown[]
  }
}

export function parseGeoGuessrJson(jsonText: string): PointMeta[] {
  const parsed = JSON.parse(jsonText) as GeoGuessrMapJson
  if (!Array.isArray(parsed.customCoordinates)) {
    throw new Error('customCoordinates is required')
  }

  const mapName = parsed.name ?? 'map'
  const points: PointMeta[] = []

  parsed.customCoordinates.forEach((coord, idx) => {
    if (coord == null) return
    const { lat, lng } = coord
    if (typeof lat !== 'number' || typeof lng !== 'number') return

    points.push({
      id: `gg-${mapName}-${idx}`,
      lat,
      lng,
      source: 'geoguessr-json',
      panoId: coord.panoId ?? null,
      countryCode: coord.countryCode ?? null,
      stateCode: coord.stateCode ?? null,
      raw: coord,
    })
  })

  return points
}

export function parsePointsFromJson(jsonText: string): PointMeta[] {
  const parsed = JSON.parse(jsonText)

  if (
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray((parsed as GeoGuessrMapJson).customCoordinates)
  ) {
    return parseGeoGuessrJson(jsonText)
  }

  if (Array.isArray(parsed)) {
    const points: PointMeta[] = []
    parsed.forEach((entry, idx) => {
      if (!entry) return
      const { lat, lng } = entry as { lat?: number; lng?: number }
      if (typeof lat !== 'number' || typeof lng !== 'number') return
      points.push({
        id: `simple-${idx}`,
        lat,
        lng,
        source: 'simple-json',
        raw: entry,
      })
    })
    return points
  }

  throw new Error('Unsupported JSON format')
}
