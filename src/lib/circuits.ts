export interface Circuit {
  id: string
  name: string
  location: string
  country: string
  layout: { x: number; y: number }[]
  facts: string[]
  length: string
  lapRecord?: string
  firstGP?: string
  corners: number
}

