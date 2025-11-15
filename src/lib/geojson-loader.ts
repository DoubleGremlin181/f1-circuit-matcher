import { Circuit } from './circuits'
import { scrapeWikipediaData } from './wikipedia-scraper'

interface GeoJSONGeometry {
  type: string
  coordinates: number[][] | number[][][]
}

interface GeoJSONFeature {
  type: string
  properties: {
    Name?: string
    name?: string
    [key: string]: any
  }
  geometry: GeoJSONGeometry
}

interface GeoJSONCollection {
  type: string
  features: GeoJSONFeature[]
}

interface CircuitBasicInfo {
  name: string
  location: string
  country: string
}

const GITHUB_API_BASE = 'https://api.github.com/repos/bacinger/f1-circuits/contents/circuits'

const circuitBasicInfo: Record<string, CircuitBasicInfo> = {
  'albert-park': {
    name: 'Albert Park Circuit',
    location: 'Melbourne, Australia',
    country: 'Australia'
  },
  'americas': {
    name: 'Circuit of the Americas',
    location: 'Austin, Texas, USA',
    country: 'United States'
  },
  'bahrain': {
    name: 'Bahrain International Circuit',
    location: 'Sakhir, Bahrain',
    country: 'Bahrain'
  },
  'baku': {
    name: 'Baku City Circuit',
    location: 'Baku, Azerbaijan',
    country: 'Azerbaijan'
  },
  'catalunya': {
    name: 'Circuit de Barcelona-Catalunya',
    location: 'Barcelona, Spain',
    country: 'Spain'
  },
  'hockenheim': {
    name: 'Hockenheimring',
    location: 'Hockenheim, Germany',
    country: 'Germany'
  },
  'hungaroring': {
    name: 'Hungaroring',
    location: 'Budapest, Hungary',
    country: 'Hungary'
  },
  'imola': {
    name: 'Autodromo Enzo e Dino Ferrari',
    location: 'Imola, Italy',
    country: 'Italy'
  },
  'interlagos': {
    name: 'Autódromo José Carlos Pace',
    location: 'São Paulo, Brazil',
    country: 'Brazil'
  },
  'jeddah': {
    name: 'Jeddah Corniche Circuit',
    location: 'Jeddah, Saudi Arabia',
    country: 'Saudi Arabia'
  },
  'marina-bay': {
    name: 'Marina Bay Street Circuit',
    location: 'Singapore',
    country: 'Singapore'
  },
  'miami': {
    name: 'Miami International Autodrome',
    location: 'Miami, Florida, USA',
    country: 'United States'
  },
  'monaco': {
    name: 'Circuit de Monaco',
    location: 'Monte Carlo, Monaco',
    country: 'Monaco'
  },
  'monza': {
    name: 'Autodromo Nazionale di Monza',
    location: 'Monza, Italy',
    country: 'Italy'
  },
  'red-bull-ring': {
    name: 'Red Bull Ring',
    location: 'Spielberg, Austria',
    country: 'Austria'
  },
  'ricard': {
    name: 'Circuit Paul Ricard',
    location: 'Le Castellet, France',
    country: 'France'
  },
  'rodriguez': {
    name: 'Autódromo Hermanos Rodríguez',
    location: 'Mexico City, Mexico',
    country: 'Mexico'
  },
  'sakhir': {
    name: 'Bahrain International Circuit (Outer)',
    location: 'Sakhir, Bahrain',
    country: 'Bahrain'
  },
  'saudi-arabia': {
    name: 'Jeddah Corniche Circuit',
    location: 'Jeddah, Saudi Arabia',
    country: 'Saudi Arabia'
  },
  'shanghai': {
    name: 'Shanghai International Circuit',
    location: 'Shanghai, China',
    country: 'China'
  },
  'silverstone': {
    name: 'Silverstone Circuit',
    location: 'Silverstone, England',
    country: 'United Kingdom'
  },
  'sochi': {
    name: 'Sochi Autodrom',
    location: 'Sochi, Russia',
    country: 'Russia'
  },
  'spa': {
    name: 'Circuit de Spa-Francorchamps',
    location: 'Spa, Belgium',
    country: 'Belgium'
  },
  'suzuka': {
    name: 'Suzuka International Racing Course',
    location: 'Suzuka, Japan',
    country: 'Japan'
  },
  'vegas': {
    name: 'Las Vegas Street Circuit',
    location: 'Las Vegas, Nevada, USA',
    country: 'United States'
  },
  'villeneuve': {
    name: 'Circuit Gilles Villeneuve',
    location: 'Montreal, Canada',
    country: 'Canada'
  },
  'yas-marina': {
    name: 'Yas Marina Circuit',
    location: 'Abu Dhabi, UAE',
    country: 'United Arab Emirates'
  },
  'zandvoort': {
    name: 'Circuit Zandvoort',
    location: 'Zandvoort, Netherlands',
    country: 'Netherlands'
  }
}

function projectTo2D(lon: number, lat: number, bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number }): { x: number; y: number } {
  const x = (lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)
  const y = 1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)
  
  return { x, y }
}

function extractCoordinates(geometry: GeoJSONGeometry): number[][] {
  if (geometry.type === 'LineString') {
    return geometry.coordinates as number[][]
  } else if (geometry.type === 'Polygon') {
    return (geometry.coordinates as number[][][])[0]
  } else if (geometry.type === 'MultiLineString') {
    return (geometry.coordinates as number[][][]).flat()
  }
  return []
}

function getBounds(coords: number[][]): { minLon: number; maxLon: number; minLat: number; maxLat: number } {
  const lons = coords.map(c => c[0])
  const lats = coords.map(c => c[1])
  
  return {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  }
}

async function parseGeoJSON(geojson: GeoJSONCollection, circuitId: string): Promise<Circuit | null> {
  if (!geojson.features || geojson.features.length === 0) {
    return null
  }

  const feature = geojson.features[0]
  const coords = extractCoordinates(feature.geometry)
  
  if (coords.length < 3) {
    return null
  }

  const bounds = getBounds(coords)
  const layout = coords.map(coord => projectTo2D(coord[0], coord[1], bounds))

  const basicInfo = circuitBasicInfo[circuitId] || {
    name: feature.properties?.Name || feature.properties?.name || circuitId,
    location: 'Unknown',
    country: 'Unknown'
  }

  console.log(`Fetching Wikipedia data for ${circuitId}...`)
  const wikiData = await scrapeWikipediaData(circuitId)
  console.log(`Wikipedia data for ${circuitId}:`, wikiData)

  return {
    id: circuitId,
    name: basicInfo.name,
    location: basicInfo.location,
    country: basicInfo.country,
    layout,
    facts: wikiData.facts.length > 0 ? wikiData.facts : ['Formula 1 racing circuit'],
    length: wikiData.length || 'Unknown',
    lapRecord: wikiData.lapRecord,
    firstGP: wikiData.firstGP,
    corners: wikiData.corners || layout.length,
    totalRaces: wikiData.totalRaces,
    yearRange: wikiData.yearRange,
    mostWins: wikiData.mostWins
  }
}

export async function loadCircuitFromGitHub(circuitId: string): Promise<Circuit | null> {
  const branches = ['main', 'master']
  
  for (const branch of branches) {
    try {
      const url = `https://raw.githubusercontent.com/bacinger/f1-circuits/${branch}/circuits/${circuitId}.geojson`
      console.log(`Attempting to load circuit from: ${url}`)
      const response = await fetch(url)
      
      if (!response.ok) {
        console.warn(`Failed to load circuit ${circuitId} from ${branch}: ${response.status} ${response.statusText}`)
        continue
      }

      const geojson = await response.json() as GeoJSONCollection
      const circuit = await parseGeoJSON(geojson, circuitId)
      if (circuit) {
        console.log(`Successfully loaded circuit: ${circuitId} from branch ${branch}`)
        return circuit
      }
    } catch (error) {
      console.error(`Error loading circuit ${circuitId} from ${branch}:`, error)
    }
  }
  
  console.error(`Failed to load circuit ${circuitId} from all branches`)
  return null
}

async function discoverAvailableCircuits(): Promise<string[]> {
  try {
    console.log('Discovering available circuits from GitHub...')
    const response = await fetch(GITHUB_API_BASE)
    
    if (!response.ok) {
      console.warn('Failed to discover circuits from GitHub API')
      return []
    }
    
    const files = await response.json() as Array<{ name: string; type: string }>
    const geojsonFiles = files
      .filter(file => file.type === 'file' && file.name.endsWith('.geojson'))
      .map(file => file.name.replace('.geojson', ''))
    
    console.log(`Discovered ${geojsonFiles.length} circuits:`, geojsonFiles)
    return geojsonFiles
  } catch (error) {
    console.error('Error discovering circuits:', error)
    return []
  }
}

export async function loadAllCircuitsFromGitHub(): Promise<Circuit[]> {
  console.log('Starting circuit loading process...')
  
  const availableCircuits = await discoverAvailableCircuits()
  
  let circuitIdsToLoad: string[]
  
  if (availableCircuits.length > 0) {
    console.log(`Using discovered circuits from GitHub: ${availableCircuits.length} found`)
    circuitIdsToLoad = availableCircuits
  } else {
    console.log('Circuit discovery failed, using predefined list')
    circuitIdsToLoad = Object.keys(circuitBasicInfo)
  }
  
  console.log(`Attempting to load ${circuitIdsToLoad.length} circuits...`)
  
  const results = await Promise.allSettled(
    circuitIdsToLoad.map(id => loadCircuitFromGitHub(id))
  )

  const loadedCircuits = results
    .filter((result): result is PromiseFulfilledResult<Circuit | null> => 
      result.status === 'fulfilled' && result.value !== null
    )
    .map(result => result.value as Circuit)
  
  console.log(`Successfully loaded ${loadedCircuits.length} circuits from GitHub`)
  
  if (loadedCircuits.length === 0) {
    console.error('Failed to load any circuits. Possible reasons:')
    console.error('- GitHub repo structure has changed')
    console.error('- Network/CORS issues')
    console.error('- Branch name is incorrect')
    throw new Error('No circuits could be loaded from GitHub')
  }
  
  return loadedCircuits
}
