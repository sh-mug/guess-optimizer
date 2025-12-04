import { useEffect, useMemo, useRef, useState } from 'react'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import {
  type ExpectationResult,
  type HeatmapSample,
  type PointMeta,
} from './lib/types'
import {
  handleRequest,
  type WorkerRequest,
  type WorkerResponse,
} from './workers/handler'
import './App.css'

function App() {
  const [points, setPoints] = useState<PointMeta[]>([])
  const [K, setK] = useState(0.01)
  const [bestResult, setBestResult] = useState<ExpectationResult | null>(null)
  const [heatmapEnabled, setHeatmapEnabled] = useState(false)
  const [heatmapSamples, setHeatmapSamples] = useState<HeatmapSample[]>([])
  const [viewport, setViewport] = useState<{
    bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
    zoom: number
  } | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const heatmapTimerRef = useRef<number | null>(null)

  const bestPointCoords = useMemo(() => {
    if (!bestResult) return null
    return { lat: bestResult.bestLat, lng: bestResult.bestLng }
  }, [bestResult])

  useEffect(() => {
    try {
      const worker = new Worker(
        new URL('./workers/expectationWorker.ts', import.meta.url),
        { type: 'module' }
      )
      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const msg = event.data
        if (msg.type === 'bestResult') setBestResult(msg.result)
        if (msg.type === 'heatmapResult') setHeatmapSamples(msg.samples)
      }
      workerRef.current = worker
      return () => worker.terminate()
    } catch {
      workerRef.current = null
    }
    return
  }, [])

  const handleParsedPoints = (newPoints: PointMeta[]) => {
    setPoints((prev) => [...prev, ...newPoints])
  }

  const handleAddPoint = (lat: number, lng: number) => {
    setPoints((prev) => [
      ...prev,
      { id: `click-${prev.length}-${Date.now()}`, lat, lng, source: 'click' },
    ])
  }

  const postToWorker = (req: WorkerRequest) => {
    if (workerRef.current) {
      workerRef.current.postMessage(req)
      return
    }

    const res = handleRequest(req)
    if (res.type === 'bestResult') setBestResult(res.result)
    if (res.type === 'heatmapResult') setHeatmapSamples(res.samples)
  }

  const computeBest = () => {
    if (points.length === 0) return
    postToWorker({
      type: 'computeBest',
      points: points.map((p) => ({ lat: p.lat, lng: p.lng })),
      K,
    })
  }

  const computeHeatmap = () => {
    if (!heatmapEnabled) return
    if (points.length === 0 || !viewport) {
      setHeatmapSamples([])
      return
    }

    const { bounds, zoom } = viewport
    const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0.0001)
    const lngSpan = Math.max(bounds.maxLng - bounds.minLng, 0.0001)
    const baseGrid = 32
    const gridCount = Math.max(
      16,
      Math.min(256, Math.round(baseGrid * Math.pow(2, Math.min(zoom, 12) / 3)))
    )
    const stepLat = latSpan / (gridCount - 1)
    const stepLng = lngSpan / (gridCount - 1)

    postToWorker({
      type: 'computeHeatmap',
      points: points.map((p) => ({ lat: p.lat, lng: p.lng })),
      K,
      grid: {
        minLat: bounds.minLat,
        maxLat: bounds.maxLat,
        minLng: bounds.minLng,
        maxLng: bounds.maxLng,
        stepLat,
        stepLng,
      },
    })
  }

  const scheduleHeatmap = () => {
    if (heatmapTimerRef.current) {
      window.clearTimeout(heatmapTimerRef.current)
    }
    heatmapTimerRef.current = window.setTimeout(() => {
      computeHeatmap()
    }, 150)
  }

  useEffect(() => {
    if (heatmapEnabled) scheduleHeatmap()
    else setHeatmapSamples([])
    return () => {
      if (heatmapTimerRef.current) {
        window.clearTimeout(heatmapTimerRef.current)
      }
    }
  }, [heatmapEnabled, points, K, viewport])

  return (
    <div className="app">
      <Sidebar
        pointsCount={points.length}
        bestResult={bestResult}
        K={K}
        onParsedPoints={handleParsedPoints}
        onChangeK={setK}
        onComputeBest={computeBest}
        heatmapEnabled={heatmapEnabled}
        onToggleHeatmap={setHeatmapEnabled}
      />
      <main className="app__main">
        <MapView
          points={points}
          bestPoint={bestPointCoords}
          onAddPoint={handleAddPoint}
          heatmapSamples={heatmapSamples}
          onViewportChange={setViewport}
        />
      </main>
    </div>
  )
}

export default App
