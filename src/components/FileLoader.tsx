import { type ChangeEvent, useState } from 'react'
import { parsePointsFromJson } from '../lib/parsers'
import { type PointMeta } from '../lib/types'

interface FileLoaderProps {
  onParsed: (points: PointMeta[]) => void
}

function FileLoader({ onParsed }: FileLoaderProps) {
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const parseAndEmit = (jsonText: string) => {
    try {
      const points = parsePointsFromJson(jsonText)
      onParsed(points)
      setError(null)
    } catch (e) {
      setError(`パースに失敗しました: ${(e as Error).message}`)
    }
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const content = await file.text()
    parseAndEmit(content)
  }

  return (
    <div className="file-loader">
      <label htmlFor="json-text">JSON</label>
      <textarea
        id="json-text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="GeoGuessr JSON または [ { lat, lng }, ... ]"
        rows={4}
      />
      <div className="file-loader__actions">
        <button type="button" onClick={() => parseAndEmit(text)}>
          読み込む
        </button>
        <input type="file" accept="application/json" onChange={handleFileChange} />
      </div>
      {error && (
        <div role="alert" className="file-loader__error">
          {error}
        </div>
      )}
    </div>
  )
}

export default FileLoader
