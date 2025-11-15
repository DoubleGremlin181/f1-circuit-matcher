import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { DrawingCanvas } from '@/components/DrawingCanvas'
import { CircuitCard } from '@/components/CircuitCard'
import { SettingsSheet } from '@/components/SettingsSheet'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toaster } from 'sonner'
import { X, Flag } from '@phosphor-icons/react'
import { Circuit } from '@/lib/circuits'
import { loadAllCircuits } from '@/lib/circuit-loader'
import { matchShape, MatchAlgorithm, Point } from '@/lib/matching'

interface MatchedCircuit {
  circuitId: string
  similarity: number
}

type DisplayMode = 'draw' | 'browse'

function App() {
  const [algorithm, setAlgorithm] = useKV<MatchAlgorithm>('match-algorithm', 'hausdorff')
  const [matchedCircuit, setMatchedCircuit] = useState<MatchedCircuit | null>(null)
  const [key, setKey] = useState(0)
  const [circuits, setCircuits] = useState<Circuit[]>([])
  const [displayMode, setDisplayMode] = useState<DisplayMode>('draw')
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>('')

  const currentAlgorithm = algorithm || 'hausdorff'

  useEffect(() => {
    const loadedCircuits = loadAllCircuits()
    setCircuits(loadedCircuits)
  }, [])

  const handleDrawingComplete = (points: Point[]) => {
    if (points.length < 10) {
      return
    }

    if (circuits.length === 0) {
      return
    }

    const matches = circuits.map(circuit => ({
      circuitId: circuit.id,
      similarity: matchShape(points, circuit.layout, currentAlgorithm)
    }))

    matches.sort((a, b) => b.similarity - a.similarity)

    const bestMatch = matches[0]
    
    if (bestMatch.similarity < 20) {
      setMatchedCircuit(null)
    } else {
      setMatchedCircuit(bestMatch)
    }
  }

  const handleClear = () => {
    setMatchedCircuit(null)
    setDisplayMode('draw')
    setSelectedCircuitId('')
    setKey(prev => prev + 1)
  }

  const handleAlgorithmChange = (newAlgorithm: MatchAlgorithm) => {
    setAlgorithm(newAlgorithm)
  }

  const handleCircuitSelect = (circuitId: string) => {
    setSelectedCircuitId(circuitId)
    setDisplayMode('browse')
    setMatchedCircuit(null)
  }

  const currentCircuit = displayMode === 'draw' && matchedCircuit
    ? circuits.find(c => c.id === matchedCircuit.circuitId)
    : displayMode === 'browse' && selectedCircuitId
    ? circuits.find(c => c.id === selectedCircuitId)
    : null

  const displayPercentage = displayMode === 'draw' && matchedCircuit
    ? matchedCircuit.similarity
    : 100

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Flag size={32} weight="fill" className="text-primary" />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Circuit Sketch
                </h1>
                <p className="text-muted-foreground text-sm md:text-base mt-1">
                  Draw a shape and match it to F1 circuits
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <SettingsSheet algorithm={currentAlgorithm} onAlgorithmChange={handleAlgorithmChange} />
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">
                {displayMode === 'draw' ? 'Draw Your Circuit' : 'Browse Circuits'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="gap-2"
              >
                <X size={16} />
                Clear
              </Button>
            </div>

            {displayMode === 'browse' ? (
              <Select value={selectedCircuitId} onValueChange={handleCircuitSelect}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Select a circuit to view" />
                </SelectTrigger>
                <SelectContent>
                  {circuits.map(circuit => (
                    <SelectItem key={circuit.id} value={circuit.id} className="text-base">
                      <div className="flex flex-col">
                        <span className="font-medium">{circuit.name}</span>
                        <span className="text-xs text-muted-foreground">{circuit.location}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}

            <DrawingCanvas 
              key={key} 
              onDrawingComplete={handleDrawingComplete}
              overlayCircuit={currentCircuit?.layout}
            />
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {displayMode === 'draw' 
                  ? 'Draw a closed shape with your finger or mouse' 
                  : 'Circuit layout is displayed above'}
              </p>
              {displayMode === 'draw' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDisplayMode('browse')}
                  className="text-xs"
                >
                  or browse circuits
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-medium">
              {displayMode === 'draw' && matchedCircuit 
                ? 'Best Match' 
                : displayMode === 'browse' && currentCircuit
                ? 'Circuit Details'
                : 'Your Match'}
            </h2>
            {currentCircuit ? (
              <CircuitCard 
                circuit={currentCircuit} 
                matchPercentage={displayPercentage}
              />
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                <Flag size={48} weight="duotone" className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg font-medium mb-2">
                  No circuit selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Draw a circuit shape or browse circuits to see details
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App