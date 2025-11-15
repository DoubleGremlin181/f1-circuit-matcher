import circuitsRaw from '@/data/circuits.json'
import wikipediaRaw from '@/data/wikipedia-data.json'
import { Circuit } from './circuits'
import { resolveCircuitMetadata } from './circuit-metadata'

interface StoredCircuit {
  id: string
  name: string
  location: string
  country: string
  layout: { x: number; y: number }[]
}

interface StoredWikipediaData {
  facts: string[]
  length?: string
  lapRecord?: string
  firstGP?: string
  corners?: number
  totalRaces?: number
  yearRange?: string
  mostWins?: {
    driver: string
    wins: number
  }
}

const wikipediaData = wikipediaRaw as Record<string, StoredWikipediaData>

function resolveWikiData(circuitId: string): StoredWikipediaData | undefined {
  if (wikipediaData[circuitId]) {
    return wikipediaData[circuitId]
  }

  const swappedHyphen = circuitId.includes('_') ? circuitId.replace(/_/g, '-') : undefined
  if (swappedHyphen && wikipediaData[swappedHyphen]) {
    return wikipediaData[swappedHyphen]
  }

  const swappedUnderscore = circuitId.includes('-') ? circuitId.replace(/-/g, '_') : undefined
  if (swappedUnderscore && wikipediaData[swappedUnderscore]) {
    return wikipediaData[swappedUnderscore]
  }

  return undefined
}

function buildCircuits(): Circuit[] {
  return (circuitsRaw as StoredCircuit[]).map(circuit => {
    const wiki = resolveWikiData(circuit.id)
    const fallback = resolveCircuitMetadata(circuit.id)

    const facts = wiki?.facts?.length
      ? wiki.facts
      : fallback?.facts || ['Formula 1 racing circuit']

    const corners = wiki?.corners
      ?? fallback?.corners
      ?? Math.max(10, Math.floor(circuit.layout.length / 10))

    return {
      id: circuit.id,
      name: circuit.name || fallback?.name || circuit.id,
      location: circuit.location || fallback?.location || 'Unknown',
      country: circuit.country || fallback?.country || 'Unknown',
      layout: circuit.layout,
      facts,
      length: wiki?.length || fallback?.length || 'Unknown',
      lapRecord: wiki?.lapRecord || fallback?.lapRecord,
      firstGP: wiki?.firstGP || fallback?.firstGP,
      corners,
      totalRaces: wiki?.totalRaces || fallback?.totalRaces,
      yearRange: wiki?.yearRange || fallback?.yearRange,
      mostWins: wiki?.mostWins || fallback?.mostWins
    }
  })
}

const cachedCircuits: Circuit[] = buildCircuits()

export async function loadAllCircuits(): Promise<Circuit[]> {
  return cachedCircuits
}

export function getCachedCircuits(): Circuit[] {
  return cachedCircuits
}
