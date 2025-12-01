import {
  expectedScoreAt,
  findBestExpectationPoint,
} from '../lib/expectation'
import { type ExpectationResult, type HeatmapSample } from '../lib/types'

export type WorkerRequest =
  | {
      type: 'computeBest'
      points: { lat: number; lng: number }[]
      K: number
    }
  | {
      type: 'computeHeatmap'
      points: { lat: number; lng: number }[]
      K: number
      grid: {
        minLat: number
        maxLat: number
        minLng: number
        maxLng: number
        stepLat: number
        stepLng: number
      }
    }

export type WorkerResponse =
  | {
      type: 'bestResult'
      result: ExpectationResult | null
    }
  | {
      type: 'heatmapResult'
      samples: HeatmapSample[]
    }
  | {
      type: 'error'
      message: string
    }

const mapPoints = (points: { lat: number; lng: number }[]) =>
  points.map((p, idx) => ({ ...p, id: `p-${idx}` }))

export function handleRequest(req: WorkerRequest): WorkerResponse {
  try {
    if (req.type === 'computeBest') {
      const result = findBestExpectationPoint(mapPoints(req.points), req.K)
      return { type: 'bestResult', result }
    }

    if (req.type === 'computeHeatmap') {
      const samples: HeatmapSample[] = []
      const { grid } = req
      const points = mapPoints(req.points)
      for (
        let lat = grid.minLat;
        lat <= grid.maxLat + 1e-9;
        lat += grid.stepLat
      ) {
        for (
          let lng = grid.minLng;
          lng <= grid.maxLng + 1e-9;
          lng += grid.stepLng
        ) {
          const value = expectedScoreAt(lat, lng, points, req.K)
          samples.push({ lat, lng, value })
        }
      }
      return { type: 'heatmapResult', samples }
    }
  } catch (e) {
    return { type: 'error', message: (e as Error).message }
  }

  return { type: 'error', message: 'Unknown request type' }
}
