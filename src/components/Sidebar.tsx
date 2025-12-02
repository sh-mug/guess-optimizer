import Controls from './Controls'
import FileLoader from './FileLoader'
import { type ExpectationResult, type PointMeta } from '../lib/types'

interface SidebarProps {
  pointsCount: number
  bestResult: ExpectationResult | null
  K: number
  onParsedPoints: (points: PointMeta[]) => void
  onChangeK: (K: number) => void
  onComputeBest: () => void
}

function Sidebar({
  pointsCount,
  bestResult,
  K,
  onParsedPoints,
  onChangeK,
  onComputeBest,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <h2>GeoGuessr Expectation Simulator</h2>
      <div className="sidebar__stats">
        <div>Points: {pointsCount}</div>
        {bestResult ? (
          <div className="sidebar__best">
            <div>Best expectation point</div>
            <div>
              Lat: {bestResult.bestLat.toFixed(4)} / Lng: {bestResult.bestLng.toFixed(4)}
            </div>
            <div>Expected score: {bestResult.bestScore.toFixed(1)}</div>
          </div>
        ) : (
          <div className="sidebar__best">Not computed yet</div>
        )}
      </div>

      <FileLoader onParsed={onParsedPoints} />
      <Controls K={K} onChangeK={onChangeK} onComputeBest={onComputeBest} />
    </aside>
  )
}

export default Sidebar
