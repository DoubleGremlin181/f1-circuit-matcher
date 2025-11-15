import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const CIRCUITS_GEOJSON_URL = 'https://raw.githubusercontent.com/bacinger/f1-circuits/master/f1-circuits.geojson'

interface CircuitSource {
  id: string
  name: string
  country: string
  location: string
  sourceName?: string
}

const CIRCUIT_METADATA: CircuitSource[] = [
  { id: 'albert_park', name: 'Albert Park Circuit', country: 'Australia', location: 'Melbourne, Australia' },
  { id: 'americas', name: 'Circuit of the Americas', country: 'United States', location: 'Austin, Texas' },
  { id: 'bahrain', name: 'Bahrain International Circuit', country: 'Bahrain', location: 'Sakhir, Bahrain' },
  { id: 'baku', name: 'Baku City Circuit', country: 'Azerbaijan', location: 'Baku, Azerbaijan' },
  { id: 'catalunya', name: 'Circuit de Barcelona-Catalunya', country: 'Spain', location: 'Barcelona, Spain' },
  { id: 'hockenheimring', name: 'Hockenheimring', country: 'Germany', location: 'Hockenheim, Germany' },
  { id: 'hungaroring', name: 'Hungaroring', country: 'Hungary', location: 'Budapest, Hungary' },
  { id: 'imola', name: 'Autodromo Enzo e Dino Ferrari', country: 'Italy', location: 'Imola, Italy' },
  { id: 'interlagos', name: 'Autódromo José Carlos Pace', country: 'Brazil', location: 'São Paulo, Brazil' },
  { id: 'jeddah', name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', location: 'Jeddah, Saudi Arabia' },
  { id: 'marina_bay', name: 'Marina Bay Street Circuit', country: 'Singapore', location: 'Singapore' },
  { id: 'miami', name: 'Miami International Autodrome', country: 'United States', location: 'Miami, Florida' },
  { id: 'monaco', name: 'Circuit de Monaco', country: 'Monaco', location: 'Monte Carlo, Monaco' },
  {
    id: 'monza',
    name: 'Autodromo Nazionale di Monza',
    sourceName: 'Autodromo Nazionale Monza',
    country: 'Italy',
    location: 'Monza, Italy'
  },
  { id: 'red_bull_ring', name: 'Red Bull Ring', country: 'Austria', location: 'Spielberg, Austria' },
  { id: 'rodriguez', name: 'Autódromo Hermanos Rodríguez', country: 'Mexico', location: 'Mexico City, Mexico' },
  { id: 'shanghai', name: 'Shanghai International Circuit', country: 'China', location: 'Shanghai, China' },
  { id: 'silverstone', name: 'Silverstone Circuit', country: 'United Kingdom', location: 'Silverstone, England' },
  { id: 'spa', name: 'Circuit de Spa-Francorchamps', country: 'Belgium', location: 'Spa, Belgium' },
  { id: 'suzuka', name: 'Suzuka International Racing Course', country: 'Japan', location: 'Suzuka, Japan' },
  { id: 'vegas', name: 'Las Vegas Street Circuit', country: 'United States', location: 'Las Vegas, Nevada' },
  { id: 'villeneuve', name: 'Circuit Gilles Villeneuve', country: 'Canada', location: 'Montreal, Canada' },
  { id: 'yas_marina', name: 'Yas Marina Circuit', country: 'United Arab Emirates', location: 'Abu Dhabi, UAE' },
  { id: 'zandvoort', name: 'Circuit Zandvoort', country: 'Netherlands', location: 'Zandvoort, Netherlands' }
]

type Coordinates = number[][]

interface GeoJSONGeometry {
  type: string
  coordinates: Coordinates | Coordinates[]
}

interface GeoJSONFeature {
  type: string
  properties?: Record<string, any>
  geometry: GeoJSONGeometry
}

interface GeoJSONResponse {
  type: string
  features: GeoJSONFeature[]
}

interface NormalizedPoint {
  x: number
  y: number
}

function extractCoordinates(geometry: GeoJSONGeometry): Coordinates {
  if (geometry.type === 'LineString') {
    return geometry.coordinates as Coordinates
  }

  if (geometry.type === 'Polygon') {
    const [outerRing] = geometry.coordinates as Coordinates[]
    return outerRing
  }

  if (geometry.type === 'MultiLineString') {
    const lines = geometry.coordinates as Coordinates[]
    return lines.flat()
  }

  return []
}

function getBounds(coords: Coordinates) {
  const lons = coords.map(([lon]) => lon)
  const lats = coords.map(([, lat]) => lat)

  return {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  }
}

function normalizeCoordinates(coords: Coordinates): NormalizedPoint[] {
  if (coords.length === 0) return []

  const bounds = getBounds(coords)
  const lonRange = bounds.maxLon - bounds.minLon || 1
  const latRange = bounds.maxLat - bounds.minLat || 1

  return coords.map(([lon, lat]) => ({
    x: (lon - bounds.minLon) / lonRange,
    y: 1 - (lat - bounds.minLat) / latRange
  }))
}

async function loadGeoJSONIndex(): Promise<Map<string, GeoJSONFeature>> {
  console.log('Fetching aggregated GeoJSON from GitHub...')
  const response = await fetch(CIRCUITS_GEOJSON_URL)

  if (!response.ok) {
    throw new Error(`Failed to download geojson: ${response.status} ${response.statusText}`)
  }

  const geojson = (await response.json()) as GeoJSONResponse
  const index = new Map<string, GeoJSONFeature>()

  geojson.features?.forEach(feature => {
    const name = feature.properties?.Name || feature.properties?.name
    if (!name) return
    index.set(normalizeKey(name), feature)
  })

  return index
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function findFeature(index: Map<string, GeoJSONFeature>, circuitName: string): GeoJSONFeature | undefined {
  const key = normalizeKey(circuitName)
  if (index.has(key)) {
    return index.get(key)
  }

  for (const [storedKey, feature] of index.entries()) {
    if (storedKey.includes(key) || key.includes(storedKey)) {
      return feature
    }
  }

  return undefined
}

async function main() {
  const featureIndex = await loadGeoJSONIndex()
  const circuits = []

  for (const circuit of CIRCUIT_METADATA) {
    process.stdout.write(`→ ${circuit.name}... `)
    const feature = findFeature(featureIndex, circuit.sourceName ?? circuit.name)

    if (!feature) {
      console.log('not found in geojson dataset')
      continue
    }

    const coords = extractCoordinates(feature.geometry)
    if (coords.length === 0) {
      console.log('missing coordinates')
      continue
    }

    const layout = normalizeCoordinates(coords)

    circuits.push({
      id: circuit.id,
      name: circuit.name,
      location: circuit.location,
      country: circuit.country,
      layout
    })

    console.log('done')
  }

  if (circuits.length === 0) {
    console.error('No circuits were downloaded. Aborting.')
    process.exitCode = 1
    return
  }

  const outputDir = path.join(process.cwd(), 'src', 'data')
  await mkdir(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, 'circuits.json')
  await writeFile(outputPath, JSON.stringify(circuits, null, 2))

  console.log(`\n✓ Saved ${circuits.length} circuits to ${outputPath}`)
}

main().catch(error => {
  console.error('Circuit download failed:', error)
  process.exitCode = 1
})
