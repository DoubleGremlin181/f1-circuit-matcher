import { WIKIPEDIA_MAPPING } from '@/data/wikipedia-mapping'

interface WikipediaData {
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

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'

async function fetchWikipediaContent(pageTitle: string): Promise<string> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    titles: pageTitle,
    prop: 'extracts',
    explaintext: 'true',
    origin: '*'
  })

  try {
    const response = await fetch(`${WIKIPEDIA_API}?${params}`)
    const data = await response.json()
    
    const pages = data.query?.pages
    if (!pages) return ''
    
    const pageId = Object.keys(pages)[0]
    return pages[pageId]?.extract || ''
  } catch (error) {
    console.error(`Failed to fetch Wikipedia content for ${pageTitle}:`, error)
    return ''
  }
}

async function fetchWikipediaInfobox(pageTitle: string): Promise<Record<string, string>> {
  const params = new URLSearchParams({
    action: 'parse',
    format: 'json',
    page: pageTitle,
    prop: 'text',
    origin: '*'
  })

  try {
    const response = await fetch(`${WIKIPEDIA_API}?${params}`)
    const data = await response.json()
    
    if (!data.parse?.text?.['*']) return {}
    
    const html = data.parse.text['*']
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    const infobox: Record<string, string> = {}
    const infoboxRows = doc.querySelectorAll('.infobox tr')
    
    infoboxRows.forEach(row => {
      const header = row.querySelector('th')
      const data = row.querySelector('td')
      
      if (header && data) {
        const key = header.textContent?.trim().toLowerCase() || ''
        const value = data.textContent?.trim() || ''
        if (key && value) {
          infobox[key] = value
        }
      }
    })
    
    return infobox
  } catch (error) {
    console.error(`Failed to fetch Wikipedia infobox for ${pageTitle}:`, error)
    return {}
  }
}

function extractCircuitLength(infobox: Record<string, string>): string | undefined {
  const lengthKeys = ['length', 'circuit length', 'lap length', 'distance']
  for (const key of lengthKeys) {
    if (infobox[key]) {
      const match = infobox[key].match(/(\d+\.?\d*)\s*(km|kilometers?|mi|miles?)/i)
      if (match) {
        const value = parseFloat(match[1])
        const unit = match[2].toLowerCase()
        if (unit.startsWith('mi')) {
          return `${(value * 1.60934).toFixed(3)} km`
        }
        return `${value.toFixed(3)} km`
      }
    }
  }
  return undefined
}

function extractCorners(infobox: Record<string, string>): number | undefined {
  const cornerKeys = ['turns', 'corners', 'number of turns']
  for (const key of cornerKeys) {
    if (infobox[key]) {
      const match = infobox[key].match(/(\d+)/)
      if (match) {
        return parseInt(match[1], 10)
      }
    }
  }
  return undefined
}

function extractFirstGP(infobox: Record<string, string>, content: string): string | undefined {
  const gpKeys = ['first grand prix', 'first f1 grand prix', 'opened']
  for (const key of gpKeys) {
    if (infobox[key]) {
      const match = infobox[key].match(/(\d{4})/)
      if (match) {
        return match[1]
      }
    }
  }
  
  const contentMatch = content.match(/first.*?(?:Grand Prix|race).*?(\d{4})/i)
  if (contentMatch) {
    return contentMatch[1]
  }
  
  return undefined
}

function extractLapRecord(infobox: Record<string, string>): string | undefined {
  const recordKeys = ['lap record', 'race lap record', 'fastest lap']
  for (const key of recordKeys) {
    if (infobox[key]) {
      const match = infobox[key].match(/(\d+:\d+\.\d+)/)
      if (match) {
        const driver = infobox[key].match(/\(([^)]+)\s+\d{4}\)/)
        return driver ? `${match[1]} (${driver[1]})` : match[1]
      }
    }
  }
  return undefined
}

function extractFacts(content: string, circuitName: string): string[] {
  const facts: string[] = []
  const sentences = content.split(/\.\s+/)
  
  const keywords = [
    'first', 'longest', 'fastest', 'historic', 'designed', 'feature', 
    'famous', 'known for', 'unique', 'challenging', 'hosted', 'elevation',
    'altitude', 'street circuit', 'night race', 'banked', 'chicane'
  ]
  
  for (const sentence of sentences) {
    if (sentence.length < 30 || sentence.length > 200) continue
    if (!sentence.toLowerCase().includes(circuitName.split(' ')[0].toLowerCase())) {
      const hasKeyword = keywords.some(kw => sentence.toLowerCase().includes(kw))
      if (hasKeyword) {
        facts.push(sentence.trim() + '.')
      }
    }
  }
  
  return facts.slice(0, 8)
}

function extractRaceStatistics(content: string): {
  totalRaces?: number
  yearRange?: string
  mostWinsDriver?: string
  mostWinsCount?: number
} {
  const stats: any = {}
  
  const raceCountMatch = content.match(/held\s+(\d+)\s+(?:times|races|grands? prix)/i) ||
                        content.match(/(\d+)\s+(?:times|races|grands? prix)\s+have been held/i)
  if (raceCountMatch) {
    stats.totalRaces = parseInt(raceCountMatch[1], 10)
  }
  
  const yearRangeMatch = content.match(/(\d{4})[-–](\d{4}|present)/i) ||
                        content.match(/since\s+(\d{4})/i)
  if (yearRangeMatch) {
    if (yearRangeMatch[2]) {
      stats.yearRange = `${yearRangeMatch[1]}-${yearRangeMatch[2] === 'present' ? new Date().getFullYear() : yearRangeMatch[2]}`
    } else {
      stats.yearRange = `${yearRangeMatch[1]}-${new Date().getFullYear()}`
    }
  }
  
  const driverWinsMatch = content.match(/([A-Z][a-z]+\s+[A-Z][a-z]+).*?(?:won|victories|wins).*?(\d+)\s+times/i)
  if (driverWinsMatch) {
    stats.mostWinsDriver = driverWinsMatch[1]
    stats.mostWinsCount = parseInt(driverWinsMatch[2], 10)
  }
  
  return stats
}

export async function scrapeWikipediaData(circuitId: string): Promise<WikipediaData> {
  const wikipediaTitle = WIKIPEDIA_MAPPING[circuitId] || 
                         WIKIPEDIA_MAPPING[circuitId.replace('-', '_')] ||
                         WIKIPEDIA_MAPPING[circuitId.replace('_', '-')]
  
  if (!wikipediaTitle) {
    console.warn(`No Wikipedia mapping found for circuit: ${circuitId}`)
    return { facts: [] }
  }

  console.log(`Scraping Wikipedia data for ${circuitId} from ${wikipediaTitle}`)

  try {
    const [content, infobox] = await Promise.all([
      fetchWikipediaContent(wikipediaTitle),
      fetchWikipediaInfobox(wikipediaTitle)
    ])

    const circuitName = wikipediaTitle.replace(/_/g, ' ')
    const facts = extractFacts(content, circuitName)
    const length = extractCircuitLength(infobox)
    const corners = extractCorners(infobox)
    const firstGP = extractFirstGP(infobox, content)
    const lapRecord = extractLapRecord(infobox)
    const raceStats = extractRaceStatistics(content)

    return {
      facts: facts.length > 0 ? facts : ['Historic Formula 1 racing circuit'],
      length,
      corners,
      firstGP,
      lapRecord,
      totalRaces: raceStats.totalRaces,
      yearRange: raceStats.yearRange,
      mostWins: raceStats.mostWinsDriver && raceStats.mostWinsCount ? {
        driver: raceStats.mostWinsDriver,
        wins: raceStats.mostWinsCount
      } : undefined
    }
  } catch (error) {
    console.error(`Error scraping Wikipedia for ${circuitId}:`, error)
    return { facts: [] }
  }
}

export async function scrapeAllCircuitsData(circuitIds: string[]): Promise<Map<string, WikipediaData>> {
  const dataMap = new Map<string, WikipediaData>()
  
  const results = await Promise.allSettled(
    circuitIds.map(async id => {
      const data = await scrapeWikipediaData(id)
      return { id, data }
    })
  )

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      dataMap.set(result.value.id, result.value.data)
    }
  })

  return dataMap
}
