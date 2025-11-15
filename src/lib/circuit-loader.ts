import { Circuit } from './circuits'
import { loadAllCircuitsFromGitHub } from './geojson-loader'

let cachedCircuits: Circuit[] | null = null
let loadingPromise: Promise<Circuit[]> | null = null

export async function loadAllCircuits(): Promise<Circuit[]> {
  if (cachedCircuits) {
    return cachedCircuits
  }

  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = (async () => {
    try {
      const circuits = await loadAllCircuitsFromGitHub()
      cachedCircuits = circuits
      return circuits
    } catch (error) {
      console.error('Failed to load circuits:', error)
      cachedCircuits = []
      return []
    } finally {
      loadingPromise = null
    }
  })()

  return loadingPromise
}

export function getCachedCircuits(): Circuit[] {
  return cachedCircuits || []
}
