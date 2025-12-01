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
      <h2>GeoGuessr 期待値シミュレータ</h2>
      <div className="sidebar__stats">
        <div>候補点: {pointsCount} 件</div>
        {bestResult ? (
          <div className="sidebar__best">
            <div>期待値最大地点</div>
            <div>
              Lat: {bestResult.bestLat.toFixed(4)} / Lng: {bestResult.bestLng.toFixed(4)}
            </div>
            <div>期待値: {bestResult.bestScore.toFixed(1)}</div>
          </div>
        ) : (
          <div className="sidebar__best">まだ計算されていません</div>
        )}
      </div>

      <FileLoader onParsed={onParsedPoints} />
      <Controls K={K} onChangeK={onChangeK} onComputeBest={onComputeBest} />
    </aside>
  )
}

export default Sidebar
