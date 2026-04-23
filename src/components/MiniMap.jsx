import { useEffect, useMemo, useRef, useState } from 'react'
import { BIOMES, WORLD_DEPTH } from '../World'
import './MiniMap.css'

const MAP_ROUTE_POINTS = [
  { x: 34, y: 34, z: 8 },
  { x: 82, y: 58, z: -55 },
  { x: 154, y: 92, z: -110 },
  { x: 122, y: 126, z: -165 },
  { x: 70, y: 166, z: -220 },
  { x: 106, y: 198, z: -275 },
  { x: 156, y: 236, z: -330 },
  { x: 168, y: 254, z: -WORLD_DEPTH },
]

const MAP_LANDMARKS = [
  { z: -8, icon: 'grove' },
  { z: -126, icon: 'cave' },
  { z: -204, icon: 'ocean' },
  { z: -314, icon: 'ember' },
]

const MAP_DECORATIONS = [
  { type: 'tree', x: 16, y: 22, scale: 0.7, rotation: -8 },
  { type: 'tree', x: 22, y: 18, scale: 0.34, rotation: 6 },
  { type: 'tree', x: 28, y: 22, scale: 0.46, rotation: 8 },
  { type: 'tree', x: 41, y: 24, scale: 0.6, rotation: -4 },
  { type: 'tree', x: 48, y: 18, scale: 0.32, rotation: -8 },
  { type: 'tree', x: 55, y: 26, scale: 0.86, rotation: 6 },
  { type: 'tree', x: 70, y: 28, scale: 0.54, rotation: 10 },
  { type: 'tree', x: 78, y: 22, scale: 0.36, rotation: 4 },
  { type: 'tree', x: 21, y: 40, scale: 0.62, rotation: -10 },
  { type: 'tree', x: 36, y: 42, scale: 0.48, rotation: 4 },
  { type: 'tree', x: 44, y: 36, scale: 0.34, rotation: -6 },
  { type: 'tree', x: 52, y: 46, scale: 0.66, rotation: 12 },
  { type: 'tree', x: 68, y: 48, scale: 0.5, rotation: -6 },
  { type: 'tree', x: 76, y: 42, scale: 0.32, rotation: 8 },
  { type: 'tree', x: 84, y: 44, scale: 0.56, rotation: 6 },
  { type: 'tree', x: 24, y: 58, scale: 0.54, rotation: -4 },
  { type: 'tree', x: 34, y: 54, scale: 0.3, rotation: 10 },
  { type: 'tree', x: 42, y: 60, scale: 0.82, rotation: 8 },
  { type: 'tree', x: 60, y: 64, scale: 0.58, rotation: -10 },
  { type: 'tree', x: 70, y: 60, scale: 0.34, rotation: 6 },
  { type: 'tree', x: 79, y: 66, scale: 0.46, rotation: 12 },
  { type: 'tree', x: 98, y: 66, scale: 0.48, rotation: -8 },
  { type: 'tree', x: 110, y: 64, scale: 0.3, rotation: -4 },
  { type: 'tree', x: 34, y: 78, scale: 0.5, rotation: 4 },
  { type: 'tree', x: 44, y: 74, scale: 0.34, rotation: -10 },
  { type: 'tree', x: 54, y: 80, scale: 0.58, rotation: -6 },
  { type: 'tree', x: 66, y: 76, scale: 0.3, rotation: 4 },
  { type: 'tree', x: 76, y: 84, scale: 0.44, rotation: 8 },
  { type: 'tree', x: 90, y: 80, scale: 0.32, rotation: -6 },
  { type: 'tree', x: 102, y: 82, scale: 0.42, rotation: -10 },
  { type: 'tree', x: 116, y: 80, scale: 0.28, rotation: 8 },

  { type: 'crystal', x: 138, y: 96, scale: 0.5, rotation: -14 },
  { type: 'crystal', x: 146, y: 90, scale: 0.28, rotation: 6 },
  { type: 'crystal', x: 152, y: 98, scale: 0.66, rotation: 10 },
  { type: 'crystal', x: 168, y: 100, scale: 0.8, rotation: 6 },
  { type: 'crystal', x: 178, y: 96, scale: 0.34, rotation: 16 },
  { type: 'crystal', x: 126, y: 112, scale: 0.46, rotation: -8 },
  { type: 'crystal', x: 136, y: 108, scale: 0.3, rotation: 12 },
  { type: 'crystal', x: 142, y: 114, scale: 0.6, rotation: 14 },
  { type: 'crystal', x: 160, y: 118, scale: 0.74, rotation: -6 },
  { type: 'crystal', x: 170, y: 114, scale: 0.32, rotation: 10 },
  { type: 'crystal', x: 110, y: 126, scale: 0.42, rotation: 10 },
  { type: 'crystal', x: 118, y: 122, scale: 0.26, rotation: -10 },
  { type: 'crystal', x: 120, y: 132, scale: 0.34, rotation: 8 },
  { type: 'crystal', x: 128, y: 130, scale: 0.5, rotation: -10 },
  { type: 'crystal', x: 136, y: 126, scale: 0.28, rotation: 14 },
  { type: 'crystal', x: 146, y: 134, scale: 0.64, rotation: 16 },
  { type: 'crystal', x: 156, y: 130, scale: 0.3, rotation: -6 },
  { type: 'crystal', x: 88, y: 144, scale: 0.44, rotation: -12 },
  { type: 'crystal', x: 98, y: 140, scale: 0.28, rotation: 8 },
  { type: 'crystal', x: 106, y: 148, scale: 0.5, rotation: 8 },
  { type: 'crystal', x: 116, y: 146, scale: 0.32, rotation: -12 },
  { type: 'crystal', x: 126, y: 152, scale: 0.54, rotation: 18 },
  { type: 'crystal', x: 136, y: 142, scale: 0.3, rotation: 10 },
  { type: 'crystal', x: 138, y: 148, scale: 0.28, rotation: -10 },
  { type: 'crystal', x: 64, y: 156, scale: 0.4, rotation: -14 },
  { type: 'crystal', x: 72, y: 152, scale: 0.26, rotation: 12 },
  { type: 'crystal', x: 82, y: 158, scale: 0.46, rotation: 12 },
  { type: 'crystal', x: 92, y: 154, scale: 0.24, rotation: -8 },

  { type: 'bubble', x: 18, y: 166, scale: 0.24, rotation: 0 },
  { type: 'bubble', x: 24, y: 170, scale: 0.18, rotation: 0 },
  { type: 'fish', x: 30, y: 172, scale: 0.5, rotation: -4 },
  { type: 'wave', x: 46, y: 170, scale: 0.38, rotation: -6 },
  { type: 'fish', x: 56, y: 172, scale: 0.3, rotation: 8 },
  { type: 'fish', x: 58, y: 182, scale: 0.48, rotation: 10 },
  { type: 'bubble', x: 66, y: 178, scale: 0.18, rotation: 0 },
  { type: 'jellyfish', x: 24, y: 196, scale: 0.62, rotation: -8 },
  { type: 'bubble', x: 44, y: 204, scale: 0.24, rotation: 0 },
  { type: 'wave', x: 54, y: 196, scale: 0.28, rotation: 4 },
  { type: 'whale', x: 34, y: 216, scale: 0.8, rotation: -6 },
  { type: 'wave', x: 56, y: 220, scale: 0.36, rotation: 6 },
  { type: 'fish', x: 66, y: 214, scale: 0.28, rotation: -10 },
  { type: 'bubble', x: 74, y: 224, scale: 0.18, rotation: 0 },
  { type: 'fish', x: 118, y: 174, scale: 0.46, rotation: 6 },
  { type: 'bubble', x: 110, y: 168, scale: 0.18, rotation: 0 },
  { type: 'wave', x: 136, y: 172, scale: 0.36, rotation: 8 },
  { type: 'fish', x: 146, y: 176, scale: 0.28, rotation: -6 },
  { type: 'jellyfish', x: 150, y: 188, scale: 0.66, rotation: 10 },
  { type: 'bubble', x: 166, y: 194, scale: 0.24, rotation: 0 },
  { type: 'wave', x: 174, y: 188, scale: 0.26, rotation: -4 },
  { type: 'creature', x: 156, y: 206, scale: 0.74, rotation: 8 },
  { type: 'fish', x: 126, y: 214, scale: 0.42, rotation: -12 },
  { type: 'bubble', x: 136, y: 208, scale: 0.18, rotation: 0 },
  { type: 'whale', x: 146, y: 222, scale: 0.62, rotation: 8 },
  { type: 'jellyfish', x: 166, y: 224, scale: 0.5, rotation: -6 },
  { type: 'wave', x: 120, y: 232, scale: 0.32, rotation: -4 },
  { type: 'fish', x: 174, y: 234, scale: 0.26, rotation: 10 },

  { type: 'volcano', x: 88, y: 232, scale: 0.54, rotation: 4 },
  { type: 'flame', x: 100, y: 228, scale: 0.34, rotation: -8 },
  { type: 'flame', x: 106, y: 234, scale: 0.22, rotation: 6 },
  { type: 'volcano', x: 116, y: 236, scale: 0.68, rotation: 0 },
  { type: 'flame', x: 130, y: 232, scale: 0.3, rotation: 10 },
  { type: 'flame', x: 138, y: 238, scale: 0.22, rotation: -6 },
  { type: 'volcano', x: 144, y: 240, scale: 0.78, rotation: 6 },
  { type: 'flame', x: 156, y: 236, scale: 0.3, rotation: -6 },
  { type: 'flame', x: 164, y: 242, scale: 0.22, rotation: 8 },
  { type: 'flame', x: 94, y: 250, scale: 0.28, rotation: 6 },
  { type: 'volcano', x: 112, y: 254, scale: 0.56, rotation: -8 },
  { type: 'flame', x: 120, y: 248, scale: 0.2, rotation: -4 },
  { type: 'flame', x: 128, y: 258, scale: 0.28, rotation: 4 },
  { type: 'volcano', x: 148, y: 256, scale: 0.6, rotation: 8 },
  { type: 'flame', x: 156, y: 262, scale: 0.2, rotation: 6 },
]

const WORLD_START_Z = 8
const WORLD_X_LIMIT = 30
const ROAD_HALF_WIDTH = 1.4
const MAP_ROAD_HALF_WIDTH = 6
const MAP_OFFROAD_MAX_OFFSET = 22
const ROAD_CENTER_EPSILON = 0.08
const MAP_VIEWBOX = {
  width: 190,
  height: 270,
}
const MAP_BOUNDS = {
  minX: 18,
  maxX: 172,
  minY: 18,
  maxY: 256,
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function buildRoutePath(points) {
  if (!points.length) return ''

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')
}

function getRoadRelativeOffset(playerX) {
  const clampedX = clamp(playerX ?? 0, -WORLD_X_LIMIT, WORLD_X_LIMIT)
  const direction = Math.sign(clampedX)
  const distanceFromCenter = Math.abs(clampedX)

  if (distanceFromCenter <= ROAD_HALF_WIDTH) {
    const onRoadRatio = ROAD_HALF_WIDTH === 0 ? 0 : distanceFromCenter / ROAD_HALF_WIDTH
    return direction * onRoadRatio * MAP_ROAD_HALF_WIDTH
  }

  const offRoadRange = Math.max(WORLD_X_LIMIT - ROAD_HALF_WIDTH, 0.0001)
  const offRoadRatio = clamp((distanceFromCenter - ROAD_HALF_WIDTH) / offRoadRange, 0, 1)
  const offset = MAP_ROAD_HALF_WIDTH + offRoadRatio * (MAP_OFFROAD_MAX_OFFSET - MAP_ROAD_HALF_WIDTH)

  return direction * offset
}

function LandmarkGlyph({ type, className = '' }) {
  if (type === 'grove') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M12 19V11" />
        <path d="M8.5 20h7" />
        <path d="M12 4.5l-4 4.4h2.3L7.4 12H10l-1.8 2.6H16L14 12h2.6l-2.7-3.1h2.1z" />
      </svg>
    )
  }

  if (type === 'cave') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M4.5 18.5c1.7-5 4-8.2 7.5-11 3.7 2.6 6 5.9 7.5 11z" />
        <path d="M10 10.2l1.8 2.8-1.2 3.2" />
        <path d="M14.2 9.1l2.2 3.3-1.5 2.8" />
        <path d="M8.1 12.1l1.6 2.2-1.1 2.4" />
      </svg>
    )
  }

  if (type === 'ocean') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M6.5 8.2a3.1 3.1 0 1 1 3.4 3.2" />
        <path d="M4 13.5c1.4-1 2.6-1 4 0s2.6 1 4 0 2.6-1 4 0 2.6 1 4 0" />
        <path d="M3.5 17c1.6-1 2.8-1 4.2 0s2.8 1 4.2 0 2.8-1 4.2 0 2.8 1 4.2 0" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 18h12" />
      <path d="M9 18l3-10 3 10" />
      <path d="M12 6.2c.4-1.5 1.6-2.7 3.1-3.2-.4 1.8-1.2 3.2-2.6 4.3 1.6-.3 3-.1 4.4.6-1.2 1.1-2.7 1.7-4.4 1.8" />
    </svg>
  )
}

function DecorationGlyph({ type, className = '' }) {
  if (type === 'tree') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M12 20V12" />
        <path d="M8.5 20h7" />
        <path d="M12 4.5 7.8 9h2.1L7.3 12h2.6l-1.8 2.7h7.8L14 12h2.8l-2.7-3H16z" />
      </svg>
    )
  }

  if (type === 'crystal') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M9 4.5 6 10l6 9.5 6-9.5-3-5.5z" />
        <path d="M9 4.5 12 10l3-5.5" />
        <path d="M6 10h12" />
        <path d="M12 10v9.5" />
      </svg>
    )
  }

  if (type === 'fish') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M5 12c2.2-2 5-3.2 8-3.2 1.7 0 3.4.4 5 1.2l2-1.8-.8 3.1.8 3.1-2-1.8c-1.6.8-3.3 1.2-5 1.2-3 0-5.8-1.2-8-3.2z" />
        <path d="M8.4 11.2h.01" />
      </svg>
    )
  }

  if (type === 'whale') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M4 13c2.1-2.5 5.2-4 8.6-4 2 0 4 .5 5.8 1.5l1.6-1.1-.4 2.1 1.4 1.3-2 .6c-.8 2-2.7 3.3-5 3.3H10.7L8 18.8l-.3-2.1c-1.6-.6-2.9-1.8-3.7-3.7z" />
        <path d="M15.8 7.4c0-1 .4-1.9 1.2-2.6.6.9 1 1.8 1.1 2.9" />
        <path d="M9 12.3h.01" />
      </svg>
    )
  }

  if (type === 'jellyfish') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M6.5 11.2a5.5 5.5 0 1 1 11 0c0 1.5-1.1 2.8-2.6 3.2H9.1c-1.5-.4-2.6-1.7-2.6-3.2z" />
        <path d="M9 14.6c0 2.1-.7 3.9-1.8 5.4" />
        <path d="M12 14.6v5.6" />
        <path d="M15 14.6c0 2 .7 3.8 1.8 5.2" />
        <path d="M10.6 14.6c.1 1.4-.2 2.7-.8 3.8" />
        <path d="M13.4 14.6c-.1 1.3.2 2.6.8 3.7" />
      </svg>
    )
  }

  if (type === 'creature') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M4.2 15.5c1.8-4.3 5.1-6.8 9.1-6.8 2.5 0 4.7.9 6.5 2.6l-.9 1.5 1.6.8-1.9.9-.2 1.8c-1.4 1.5-3.3 2.3-5.5 2.3-1.1 0-2.1-.2-3.1-.6l-2.6 1.4.5-2.4c-1.5-.8-2.7-1.9-3.5-3.5z" />
        <path d="M8.7 13.4c1.2-.8 2.6-1.2 4.1-1.2 1.8 0 3.6.6 5.1 1.6" />
        <path d="M10.1 12.2h.01" />
      </svg>
    )
  }

  if (type === 'bubble') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <circle cx="10" cy="13" r="4.3" />
        <circle cx="15.8" cy="8.2" r="2.1" />
      </svg>
    )
  }

  if (type === 'wave') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M3.5 11.5c1.5-1.2 3-1.2 4.5 0s3 1.2 4.5 0 3-1.2 4.5 0 3 1.2 4.5 0" />
        <path d="M5 15.5c1.3-1 2.6-1 3.9 0s2.6 1 3.9 0 2.6-1 3.9 0 2.6 1 3.9 0" />
      </svg>
    )
  }

  if (type === 'flame') {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <path d="M12.2 4.5c1.3 1.7 1.9 3.3 1.9 4.9 1-.8 1.6-1.8 1.8-3.1 1.5 1.8 2.3 3.8 2.3 5.9 0 3.8-2.7 6.5-6.3 6.5-3.4 0-6-2.4-6-5.8 0-2.2 1-4.2 3-6 0 1.2.4 2.2 1.1 3.1.6-2.2 1.4-4.1 2.2-5.5z" />
        <path d="M12 10.2c.9 1.1 1.3 2.1 1.3 3.2 0 1.6-1 2.8-2.5 2.8-1.4 0-2.4-1-2.4-2.4 0-1.2.6-2.3 1.8-3.6.1.7.5 1.3 1 1.8z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6 18h12" />
      <path d="M8.5 18 12 9l3.5 9" />
      <path d="M10 13.4c.6-1.8 1.7-3.3 3.3-4.6.2 1.7.8 3.2 1.9 4.6" />
      <path d="M12 9c-.3-1.5.1-2.9 1.1-4 1 1.2 1.5 2.5 1.5 4" />
    </svg>
  )
}

function MiniMapToggle({ open, onToggle }) {
  return (
    <button
      className={`hud-map-toggle${open ? ' active' : ''}`}
      onClick={onToggle}
      aria-label={open ? 'Hide map' : 'Show map'}
      aria-expanded={open}
      type="button"
    >
      <span className="hud-map-toggle-icon" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span className="hud-map-toggle-label">Map</span>
    </button>
  )
}

function sampleRouteByWorldZ(worldZ) {
  if (MAP_ROUTE_POINTS.length === 1) {
    return {
      x: MAP_ROUTE_POINTS[0].x,
      y: MAP_ROUTE_POINTS[0].y,
      tangentX: 0,
      tangentY: 1,
    }
  }

  const routeEnd = MAP_ROUTE_POINTS[MAP_ROUTE_POINTS.length - 1]
  const clampedZ = clamp(worldZ ?? WORLD_START_Z, routeEnd.z, MAP_ROUTE_POINTS[0].z)

  for (let index = 0; index < MAP_ROUTE_POINTS.length - 1; index += 1) {
    const from = MAP_ROUTE_POINTS[index]
    const to = MAP_ROUTE_POINTS[index + 1]
    const lowerZ = Math.min(from.z, to.z)
    const upperZ = Math.max(from.z, to.z)

    if (clampedZ < lowerZ || clampedZ > upperZ) continue

    const span = to.z - from.z
    const localT = span === 0 ? 0 : clamp((clampedZ - from.z) / span, 0, 1)

    return {
      x: from.x + (to.x - from.x) * localT,
      y: from.y + (to.y - from.y) * localT,
      tangentX: to.x - from.x,
      tangentY: to.y - from.y,
    }
  }

  const from = MAP_ROUTE_POINTS[MAP_ROUTE_POINTS.length - 2]
  const to = MAP_ROUTE_POINTS[MAP_ROUTE_POINTS.length - 1]

  return {
    x: to.x,
    y: to.y,
    tangentX: to.x - from.x,
    tangentY: to.y - from.y,
  }
}

function getMarkerPosition(playerX, playerZ) {
  const routeSample = sampleRouteByWorldZ(playerZ)
  const tangentLength = Math.hypot(routeSample.tangentX, routeSample.tangentY) || 1
  const normalX = routeSample.tangentY / tangentLength
  const normalY = -routeSample.tangentX / tangentLength
  const lateralOffset = getRoadRelativeOffset(playerX)

  return {
    x: clamp(routeSample.x + normalX * lateralOffset, MAP_BOUNDS.minX, MAP_BOUNDS.maxX),
    y: clamp(routeSample.y + normalY * lateralOffset, MAP_BOUNDS.minY, MAP_BOUNDS.maxY),
  }
}

function getPositionLabel(playerX) {
  if (Math.abs(playerX ?? 0) <= ROAD_CENTER_EPSILON) return 'Centered on the road'
  if (Math.abs(playerX ?? 0) <= ROAD_HALF_WIDTH) return 'On the road'
  return playerX > 0 ? 'Right of the road' : 'Left of the road'
}

function getLandmarkPosition(landmark) {
  const routeSample = sampleRouteByWorldZ(landmark?.z ?? WORLD_START_Z)
  return {
    x: clamp(routeSample.x, MAP_BOUNDS.minX, MAP_BOUNDS.maxX),
    y: clamp(routeSample.y, MAP_BOUNDS.minY, MAP_BOUNDS.maxY),
  }
}

function toScenePositionStyles(point, color) {
  return {
    '--landmark-x': `${(point.x / MAP_VIEWBOX.width) * 100}%`,
    '--landmark-y': `${(point.y / MAP_VIEWBOX.height) * 100}%`,
    ...(color ? { '--landmark-color': color } : {}),
  }
}

function toMarkerPositionStyles(point) {
  return {
    '--marker-x': `${(point.x / MAP_VIEWBOX.width) * 100}%`,
    '--marker-y': `${(point.y / MAP_VIEWBOX.height) * 100}%`,
  }
}

function toDecorationPositionStyles(decoration) {
  return {
    '--decoration-x': `${(decoration.x / MAP_VIEWBOX.width) * 100}%`,
    '--decoration-y': `${(decoration.y / MAP_VIEWBOX.height) * 100}%`,
    '--decoration-scale': decoration.scale ?? 1,
    '--decoration-rotation': `${decoration.rotation ?? 0}deg`,
  }
}

function MiniMapPanel({ activeBiome, progress, playerX, playerZ, routePath }) {
  const clampedProgress = clamp(progress ?? 0, 0, 1)
  const currentBiome = BIOMES[activeBiome] ?? BIOMES[0]
  const currentLandmark = MAP_LANDMARKS[activeBiome] ?? MAP_LANDMARKS[0]
  const biomeStart = activeBiome / BIOMES.length
  const biomeEnd = (activeBiome + 1) / BIOMES.length
  const localProgress = clamp((clampedProgress - biomeStart) / (biomeEnd - biomeStart || 1), 0, 1)
  const marker = getMarkerPosition(playerX, playerZ)
  const positionLabel = getPositionLabel(playerX)

  return (
    <div className="hud-map-panel" role="dialog" aria-label="Journey map">
      <div className="hud-map-header">
        <span className="hud-map-kicker">Traveller&apos;s Chart</span>
        <span className="hud-map-progress">{currentBiome.roman} Realm</span>
      </div>

      <div className="hud-map-scene">
        <div className="hud-map-compass" aria-hidden="true">
          <span className="hud-map-compass-ring" />
          <span className="hud-map-compass-star" />
          <span className="hud-map-compass-n">N</span>
        </div>

        <div className="hud-map-decorations" aria-hidden="true">
          {MAP_DECORATIONS.map((decoration, index) => (
            <div
              key={`${decoration.type}-${index}`}
              className={`hud-map-decoration ${decoration.type}`}
              style={toDecorationPositionStyles(decoration)}
            >
              <DecorationGlyph type={decoration.type} className="hud-map-decoration-glyph" />
            </div>
          ))}
        </div>

        <svg
          className="hud-map-route"
          viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path className="hud-map-route-shadow" d={routePath} />
          <path className="hud-map-route-line" d={routePath} />
          <path
            className="hud-map-route-travelled"
            d={routePath}
            pathLength="100"
            style={{ strokeDasharray: `${clampedProgress * 100} 100` }}
          />
        </svg>

        {BIOMES.map((biome, index) => {
          const landmark = MAP_LANDMARKS[index]
          const landmarkPosition = getLandmarkPosition(landmark)
          const isActive = index === activeBiome

          return (
            <div
              key={biome.roman}
              className={`hud-map-landmark${isActive ? ' active' : ''}`}
              style={toScenePositionStyles(landmarkPosition, biome.color)}
              aria-label={biome.name}
            >
              <span className="hud-map-landmark-ring" aria-hidden="true" />
              <LandmarkGlyph type={landmark.icon} className="hud-map-landmark-icon" />
              <span className="hud-map-landmark-badge">{biome.roman}</span>
            </div>
          )
        })}

        <div
          className="hud-map-marker"
          style={toMarkerPositionStyles(marker)}
        >
          <span className="hud-map-marker-dot" aria-hidden="true" />
          <span className="hud-map-marker-label">You</span>
        </div>
      </div>

      <div className="hud-map-legend" aria-label="Realm legend">
        {BIOMES.map((biome, index) => {
          const landmark = MAP_LANDMARKS[index]

          return (
            <div
              key={biome.roman}
              className={`hud-map-legend-item${index === activeBiome ? ' active' : ''}`}
            >
              <LandmarkGlyph type={landmark.icon} className="hud-map-legend-icon" />
              <span className="hud-map-legend-copy">
                <span className="hud-map-legend-roman">{biome.roman}</span>
                <span className="hud-map-legend-name">{biome.name}</span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="hud-map-current">
        <LandmarkGlyph type={currentLandmark.icon} className="hud-map-current-icon" />
        <div className="hud-map-current-copy">
          <span className="hud-map-current-name">{currentBiome.roman} - {currentBiome.name}</span>
          <span className="hud-map-current-meta">
            The glowing trail marks your return route through every realm you have crossed.
          </span>
          <span className="hud-map-current-note">
            {positionLabel} {'|'} {Math.round(localProgress * 100)}% through this stretch
          </span>
        </div>
      </div>
    </div>
  )
}

export default function MiniMap({ activeBiome, progressRef, charPosRef }) {
  const mapRef = useRef(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [mapState, setMapState] = useState({
    progress: 0,
    playerX: 0,
    playerZ: WORLD_START_Z,
  })
  const routePath = useMemo(() => buildRoutePath(MAP_ROUTE_POINTS), [])

  useEffect(() => {
    if (!mapOpen) return

    const handlePointerDown = (event) => {
      if (!mapRef.current?.contains(event.target)) {
        setMapOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [mapOpen])

  useEffect(() => {
    let rafId = null
    let lastProgress = -1
    let lastX = Number.NaN
    let lastZ = Number.NaN

    const tick = () => {
      const nextProgress = clamp(progressRef?.current ?? 0, 0, 1)
      const nextX = charPosRef?.current?.x ?? 0
      const nextZ = charPosRef?.current?.z ?? WORLD_START_Z

      if (
        Math.abs(nextProgress - lastProgress) > 0.002 ||
        Math.abs(nextX - lastX) > 0.12 ||
        Math.abs(nextZ - lastZ) > 0.12
      ) {
        lastProgress = nextProgress
        lastX = nextX
        lastZ = nextZ
        setMapState({
          progress: nextProgress,
          playerX: nextX,
          playerZ: nextZ,
        })
      }

      rafId = window.requestAnimationFrame(tick)
    }

    tick()
    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId)
    }
  }, [charPosRef, progressRef])

  return (
    <div ref={mapRef} className={`hud-map-shell${mapOpen ? ' open' : ''}`}>
      <MiniMapToggle open={mapOpen} onToggle={() => setMapOpen(prev => !prev)} />
      {mapOpen && (
        <MiniMapPanel
          activeBiome={activeBiome}
          progress={mapState.progress}
          playerX={mapState.playerX}
          playerZ={mapState.playerZ}
          routePath={routePath}
        />
      )}
    </div>
  )
}
