interface ControlsProps {
  K: number
  onChangeK: (K: number) => void
  onComputeBest: () => void
  heatmapEnabled?: boolean
  onToggleHeatmap?: (enabled: boolean) => void
}

function Controls({
  K,
  onChangeK,
  onComputeBest,
  heatmapEnabled,
  onToggleHeatmap,
}: ControlsProps) {
  return (
    <div className="controls">
      <label>
        K
        <input
          type="number"
          aria-label="K"
          step="0.0001"
          value={K}
          onChange={(e) => onChangeK(Number(e.target.value))}
        />
      </label>
      <button type="button" onClick={onComputeBest}>
        Compute best location
      </button>
      {typeof heatmapEnabled === 'boolean' && onToggleHeatmap && (
        <label>
          Heatmap
          <input
            type="checkbox"
            aria-label="Heatmap"
            checked={heatmapEnabled}
            onChange={(e) => onToggleHeatmap(e.target.checked)}
          />
        </label>
      )}
    </div>
  )
}

export default Controls
