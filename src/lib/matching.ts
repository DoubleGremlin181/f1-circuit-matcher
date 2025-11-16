export type Point = { x: number; y: number }

export type MatchAlgorithm = 'hausdorff' | 'frechet' | 'turning-angle'

export interface MatchResult {
  circuitId: string
  similarity: number
}

export interface BoundingBox {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export function getBoundingBox(points: Point[]): BoundingBox {
  if (points.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0, centerX: 0, centerY: 0 }
  }
  
  const minX = Math.min(...points.map(p => p.x))
  const maxX = Math.max(...points.map(p => p.x))
  const minY = Math.min(...points.map(p => p.y))
  const maxY = Math.max(...points.map(p => p.y))
  
  const width = maxX - minX
  const height = maxY - minY
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  
  return { minX, maxX, minY, maxY, width, height, centerX, centerY }
}

/**
 * Normalize points: translate to origin and scale to unit size
 * Note: Does NOT apply rotation - preserves original orientation
 */
function normalizePoints(points: Point[]): Point[] {
  if (points.length === 0) return []
  
  const bbox = getBoundingBox(points)
  const scale = Math.max(bbox.width, bbox.height)
  
  if (scale === 0) return points
  
  return points.map(p => ({
    x: (p.x - bbox.minX) / scale,
    y: (p.y - bbox.minY) / scale
  }))
}

export function alignCircuitToDrawing(circuitPoints: Point[], drawnPoints: Point[]): Point[] {
  if (circuitPoints.length === 0 || drawnPoints.length === 0) return circuitPoints
  
  const drawnBBox = getBoundingBox(drawnPoints)
  const circuitBBox = getBoundingBox(circuitPoints)
  
  const scaleX = drawnBBox.width / circuitBBox.width
  const scaleY = drawnBBox.height / circuitBBox.height
  const scale = Math.min(scaleX, scaleY)
  
  return circuitPoints.map(p => ({
    x: drawnBBox.minX + (p.x - circuitBBox.minX) * scale + (drawnBBox.width - circuitBBox.width * scale) / 2,
    y: drawnBBox.minY + (p.y - circuitBBox.minY) * scale + (drawnBBox.height - circuitBBox.height * scale) / 2
  }))
}

function resamplePoints(points: Point[], numPoints: number): Point[] {
  if (points.length === 0) return []
  
  const totalLength = points.reduce((sum, point, i) => {
    if (i === 0) return 0
    const prev = points[i - 1]
    return sum + Math.sqrt(Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2))
  }, 0)
  
  const segmentLength = totalLength / (numPoints - 1)
  const resampled: Point[] = [points[0]]
  let accumulatedLength = 0
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const dist = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2))
    
    accumulatedLength += dist
    
    while (accumulatedLength >= segmentLength && resampled.length < numPoints) {
      const ratio = (accumulatedLength - segmentLength) / dist
      const newPoint = {
        x: curr.x - ratio * (curr.x - prev.x),
        y: curr.y - ratio * (curr.y - prev.y)
      }
      resampled.push(newPoint)
      accumulatedLength -= segmentLength
    }
  }
  
  while (resampled.length < numPoints) {
    resampled.push(points[points.length - 1])
  }
  
  return resampled.slice(0, numPoints)
}

function hausdorffDistance(points1: Point[], points2: Point[]): number {
  const distance = (p1: Point, p2: Point) =>
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  
  const directional = (from: Point[], to: Point[]) => {
    return Math.max(...from.map(p1 => Math.min(...to.map(p2 => distance(p1, p2)))))
  }
  
  return Math.max(directional(points1, points2), directional(points2, points1))
}

/**
 * Rotate an array to start from a different index
 */
function rotateArray<T>(arr: T[], startIndex: number): T[] {
  if (arr.length === 0) return arr
  const idx = ((startIndex % arr.length) + arr.length) % arr.length
  return [...arr.slice(idx), ...arr.slice(0, idx)]
}

/**
 * Compute Frechet distance with a specific starting offset for points2
 */
function frechetDistanceWithOffset(points1: Point[], points2: Point[], offset: number): number {
  const rotated2 = rotateArray(points2, offset)
  const n = points1.length
  const m = rotated2.length
  const ca: number[][] = Array(n).fill(0).map(() => Array(m).fill(-1))
  
  const distance = (p1: Point, p2: Point) =>
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
  
  const compute = (i: number, j: number): number => {
    if (ca[i][j] > -1) return ca[i][j]
    
    const dist = distance(points1[i], rotated2[j])
    
    if (i === 0 && j === 0) {
      ca[i][j] = dist
    } else if (i > 0 && j === 0) {
      ca[i][j] = Math.max(compute(i - 1, 0), dist)
    } else if (i === 0 && j > 0) {
      ca[i][j] = Math.max(compute(0, j - 1), dist)
    } else {
      ca[i][j] = Math.max(
        Math.min(compute(i - 1, j), compute(i - 1, j - 1), compute(i, j - 1)),
        dist
      )
    }
    
    return ca[i][j]
  }
  
  return compute(n - 1, m - 1)
}

/**
 * Find optimal Frechet distance by trying different starting points
 */
function frechetDistance(points1: Point[], points2: Point[]): number {
  if (points1.length === 0 || points2.length === 0) return Infinity
  
  // Try multiple starting points (sample every 8th point for efficiency)
  const step = Math.max(1, Math.floor(points2.length / 8))
  let minDistance = Infinity
  
  for (let offset = 0; offset < points2.length; offset += step) {
    const dist = frechetDistanceWithOffset(points1, points2, offset)
    minDistance = Math.min(minDistance, dist)
  }
  
  return minDistance
}

/**
 * Compute turning angle distance with a specific starting offset for points2
 */
function turningAngleDistanceWithOffset(points1: Point[], points2: Point[], offset: number): number {
  const getAngles = (points: Point[]): number[] => {
    const angles: number[] = []
    for (let i = 0; i < points.length; i++) {
      const prev = points[(i - 1 + points.length) % points.length]
      const curr = points[i]
      const next = points[(i + 1) % points.length]
      
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x)
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x)
      let diff = angle2 - angle1
      
      while (diff > Math.PI) diff -= 2 * Math.PI
      while (diff < -Math.PI) diff += 2 * Math.PI
      
      angles.push(diff)
    }
    return angles
  }
  
  const angles1 = getAngles(points1)
  const rotated2 = rotateArray(points2, offset)
  const angles2 = getAngles(rotated2)
  
  const minLen = Math.min(angles1.length, angles2.length)
  let sum = 0
  
  for (let i = 0; i < minLen; i++) {
    sum += Math.abs(angles1[i] - angles2[i])
  }
  
  return sum / minLen
}

/**
 * Find optimal turning angle distance by trying different starting points
 */
function turningAngleDistance(points1: Point[], points2: Point[]): number {
  if (points1.length === 0 || points2.length === 0) return Infinity
  
  // Try multiple starting points (sample every 8th point for efficiency)
  const step = Math.max(1, Math.floor(points2.length / 8))
  let minDistance = Infinity
  
  for (let offset = 0; offset < points2.length; offset += step) {
    const dist = turningAngleDistanceWithOffset(points1, points2, offset)
    minDistance = Math.min(minDistance, dist)
  }
  
  return minDistance
}

export function matchShape(
  drawnPoints: Point[],
  circuitPoints: Point[],
  algorithm: MatchAlgorithm
): number {
  const numSamples = 64
  
  const normalized1 = normalizePoints(drawnPoints)
  const normalized2 = normalizePoints(circuitPoints)
  
  const resampled1 = resamplePoints(normalized1, numSamples)
  const resampled2 = resamplePoints(normalized2, numSamples)
  
  let distance: number
  let similarity: number
  
  switch (algorithm) {
    case 'hausdorff':
      distance = hausdorffDistance(resampled1, resampled2)
      // Improved scoring: use exponential decay for better range
      // Typical good matches have distance < 0.1, poor matches > 0.3
      similarity = 100 * Math.exp(-distance * 8)
      return Math.max(0, Math.min(100, similarity))
    
    case 'frechet':
      distance = frechetDistance(resampled1, resampled2)
      // Frechet distance typically ranges from 0.05 (good) to 0.3+ (poor)
      similarity = 100 * Math.exp(-distance * 10)
      return Math.max(0, Math.min(100, similarity))
    
    case 'turning-angle':
      distance = turningAngleDistance(resampled1, resampled2)
      // Turning angle distance ranges from 0 to ~PI
      // Good matches have distance < 0.5, poor matches > 1.5
      similarity = 100 * Math.exp(-distance * 2)
      return Math.max(0, Math.min(100, similarity))
    
    default:
      return 0
  }
}
