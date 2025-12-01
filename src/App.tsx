import { useEffect, useMemo, useRef, useState } from 'react'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import { type ExpectationResult, type PointMeta } from './lib/types'
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
  const workerRef = useRef<Worker | null>(null)

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
  }

  const computeBest = () => {
    if (points.length === 0) return
    postToWorker({
      type: 'computeBest',
      points: points.map((p) => ({ lat: p.lat, lng: p.lng })),
      K,
    })
  }

  return (
    <div className="app">
      <Sidebar
        pointsCount={points.length}
        bestResult={bestResult}
        K={K}
        onParsedPoints={handleParsedPoints}
        onChangeK={setK}
        onComputeBest={computeBest}
      />
      <main className="app__main">
        <MapView points={points} bestPoint={bestPointCoords} onAddPoint={handleAddPoint} />
      </main>
    </div>
  )
}

export default App
