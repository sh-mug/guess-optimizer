import { haversineDistanceKm } from './geo'
import { type ExpectationResult, type Point } from './types'

export interface SearchOptions {
  samplesLat?: number
  samplesLng?: number
  bbox?: { minLat: number; maxLat: number; minLng: number; maxLng: number }
}

// 与えられた距離と係数からスコアを計算する
export function scoreFromDistance(dKm: number, K: number): number {
  return 5000 * Math.exp(-K * dKm)
}

export function expectedScoreAt(
  lat: number,
  lng: number,
  points: Point[],
  K: number
): number {
  if (points.length === 0) return 0

  const invN = 1 / points.length
  let sum = 0
  for (const p of points) {
    const d = haversineDistanceKm(lat, lng, p.lat, p.lng)
    sum += Math.exp(-K * d)
  }

  return 5000 * invN * sum
}

/**
 * グリッドサンプリングで期待値最大地点を近似的に求める
 */
export function findBestExpectationPoint(
  points: Point[],
  K: number,
  options: SearchOptions = {}
): ExpectationResult | null {
  if (points.length === 0) return null

  const samplesLat = Math.max(options.samplesLat ?? 30, 1)
  const samplesLng = Math.max(options.samplesLng ?? 30, 1)

  const bbox =
    options.bbox ??
    points.reduce(
      (acc, p) => ({
        minLat: Math.min(acc.minLat, p.lat),
        maxLat: Math.max(acc.maxLat, p.lat),
        minLng: Math.min(acc.minLng, p.lng),
        maxLng: Math.max(acc.maxLng, p.lng),
      }),
      {
        minLat: points[0].lat,
        maxLat: points[0].lat,
        minLng: points[0].lng,
        maxLng: points[0].lng,
      }
    )

  const stepLat =
    samplesLat === 1 ? 0 : (bbox.maxLat - bbox.minLat) / (samplesLat - 1)
  const stepLng =
    samplesLng === 1 ? 0 : (bbox.maxLng - bbox.minLng) / (samplesLng - 1)

  let bestScore = -Infinity
  let bestLat = bbox.minLat
  let bestLng = bbox.minLng

  for (let i = 0; i < samplesLat; i++) {
    const lat = bbox.minLat + stepLat * i
    for (let j = 0; j < samplesLng; j++) {
      const lng = bbox.minLng + stepLng * j
      const score = expectedScoreAt(lat, lng, points, K)
      if (score > bestScore) {
        bestScore = score
        bestLat = lat
        bestLng = lng
      }
    }
  }

  return {
    bestLat,
    bestLng,
    bestScore,
  }
}
