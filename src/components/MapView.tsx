import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { type HeatmapSample, type PointMeta } from '../lib/types'

interface MapViewProps {
  points: PointMeta[]
  bestPoint?: { lat: number; lng: number } | null
  onAddPoint?: (lat: number, lng: number) => void
  heatmapSamples?: HeatmapSample[]
  onViewportChange?: (viewport: {
    bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
    zoom: number
  }) => void
}

const POINTS_SOURCE = 'points'
const BEST_POINT_SOURCE = 'best-point'
const HEATMAP_SOURCE = 'heatmap'

function pointsToGeoJson(points: PointMeta[]) {
  return {
    type: 'FeatureCollection' as const,
    features: points.map((p) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.lng, p.lat],
      },
      properties: {
        id: p.id,
        source: p.source,
      },
    })),
  }
}

function bestPointToGeoJson(bestPoint?: { lat: number; lng: number } | null) {
  if (!bestPoint) {
    return { type: 'FeatureCollection' as const, features: [] as any[] }
  }
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [bestPoint.lng, bestPoint.lat],
        },
        properties: {},
      },
    ],
  }
}

function heatmapToGeoJson(samples?: HeatmapSample[]) {
  return {
    type: 'FeatureCollection' as const,
    features:
      samples?.map((s, idx) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [s.lng, s.lat],
        },
        properties: { value: s.value, id: idx },
      })) ?? [],
  }
}

function toViewportPayload(map: maplibregl.Map) {
  const b = map.getBounds()
  return {
    bounds: {
      minLat: b.getSouth(),
      maxLat: b.getNorth(),
      minLng: b.getWest(),
      maxLng: b.getEast(),
    },
    zoom: map.getZoom(),
  }
}

function MapView({
  points,
  bestPoint,
  onAddPoint,
  heatmapSamples,
  onViewportChange,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 1.5,
    })

    map.addControl(new maplibregl.NavigationControl())

    map.on('load', () => {
      setLoaded(true)
      onViewportChange?.(toViewportPayload(map))
      map.addSource(POINTS_SOURCE, {
        type: 'geojson',
        data: pointsToGeoJson(points),
      })
      map.addLayer({
        id: 'points-layer',
        type: 'circle',
        source: POINTS_SOURCE,
        paint: {
          'circle-radius': 4,
          'circle-color': '#ff5c8a',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
        },
      })

      map.addSource(BEST_POINT_SOURCE, {
        type: 'geojson',
        data: bestPointToGeoJson(bestPoint),
      })
      map.addLayer({
        id: 'best-point-layer',
        type: 'circle',
        source: BEST_POINT_SOURCE,
        paint: {
          'circle-radius': 6,
          'circle-color': '#0077ff',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.5,
        },
      })

      map.addSource(HEATMAP_SOURCE, {
        type: 'geojson',
        data: heatmapToGeoJson(heatmapSamples),
      })
      map.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: HEATMAP_SOURCE,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            0,
            0,
            5000,
            1,
          ],
          'heatmap-intensity': 1,
          'heatmap-radius': 20,
          'heatmap-opacity': 0.7,
        },
      })
    })

    map.on('click', (e) => {
      onAddPoint?.(e.lngLat.lat, e.lngLat.lng)
    })

    map.on('moveend', () => {
      onViewportChange?.(toViewportPayload(map))
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!loaded || !mapRef.current) return
    const source = mapRef.current.getSource(POINTS_SOURCE) as maplibregl.GeoJSONSource
    source?.setData(pointsToGeoJson(points))
  }, [points, loaded])

  useEffect(() => {
    if (!loaded || !mapRef.current) return
    const source = mapRef.current.getSource(
      BEST_POINT_SOURCE
    ) as maplibregl.GeoJSONSource
    source?.setData(bestPointToGeoJson(bestPoint))
  }, [bestPoint, loaded])

  useEffect(() => {
    if (!loaded || !mapRef.current) return
    const source = mapRef.current.getSource(
      HEATMAP_SOURCE
    ) as maplibregl.GeoJSONSource
    source?.setData(heatmapToGeoJson(heatmapSamples))
  }, [heatmapSamples, loaded])

  return <div data-testid="map-view" className="map-view" ref={containerRef} />
}

export default MapView
