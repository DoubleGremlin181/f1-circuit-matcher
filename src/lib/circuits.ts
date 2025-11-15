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
}

export const circuits: Circuit[] = [
  {
    id: 'monza',
    name: 'Autodromo Nazionale di Monza',
    location: 'Monza, Italy',
    country: 'Italy',
    layout: [
      { x: 0.5, y: 0.1 }, { x: 0.7, y: 0.1 }, { x: 0.8, y: 0.15 },
      { x: 0.85, y: 0.25 }, { x: 0.8, y: 0.35 }, { x: 0.7, y: 0.4 },
      { x: 0.6, y: 0.5 }, { x: 0.65, y: 0.6 }, { x: 0.75, y: 0.65 },
      { x: 0.8, y: 0.75 }, { x: 0.7, y: 0.85 }, { x: 0.5, y: 0.9 },
      { x: 0.3, y: 0.85 }, { x: 0.2, y: 0.75 }, { x: 0.25, y: 0.65 },
      { x: 0.35, y: 0.6 }, { x: 0.4, y: 0.5 }, { x: 0.3, y: 0.4 },
      { x: 0.2, y: 0.35 }, { x: 0.15, y: 0.25 }, { x: 0.2, y: 0.15 },
      { x: 0.3, y: 0.1 }
    ],
    facts: [
      'Known as the "Temple of Speed" - fastest track in F1 with average speeds over 260 km/h',
      'Home to the legendary Tifosi, Ferrari\'s passionate fan base',
      'Features the historic banked curves from 1922, though not used in modern F1',
      'Michael Schumacher won here 5 times consecutively (1996-2000)',
      'The circuit is located in a royal park near Milan'
    ],
    length: '5.793 km',
    lapRecord: '1:21.046 - Rubens Barrichello (2004)',
    firstGP: '1950'
  },
  {
    id: 'monaco',
    name: 'Circuit de Monaco',
    location: 'Monte Carlo, Monaco',
    country: 'Monaco',
    layout: [
      { x: 0.5, y: 0.1 }, { x: 0.6, y: 0.15 }, { x: 0.7, y: 0.25 },
      { x: 0.65, y: 0.35 }, { x: 0.55, y: 0.4 }, { x: 0.45, y: 0.45 },
      { x: 0.4, y: 0.55 }, { x: 0.5, y: 0.6 }, { x: 0.6, y: 0.65 },
      { x: 0.7, y: 0.7 }, { x: 0.75, y: 0.8 }, { x: 0.65, y: 0.9 },
      { x: 0.5, y: 0.85 }, { x: 0.35, y: 0.8 }, { x: 0.25, y: 0.7 },
      { x: 0.2, y: 0.6 }, { x: 0.25, y: 0.5 }, { x: 0.3, y: 0.4 },
      { x: 0.25, y: 0.3 }, { x: 0.3, y: 0.2 }, { x: 0.4, y: 0.15 }
    ],
    facts: [
      'The most prestigious race in F1, part of the Triple Crown of Motorsport',
      'Slowest track on the calendar but most demanding on driver concentration',
      'Virtually unchanged since 1929, runs through actual city streets',
      'Ayrton Senna won here 6 times, earning him the title "King of Monaco"',
      'The Swimming Pool complex is one of the most iconic sequences in racing'
    ],
    length: '3.337 km',
    lapRecord: '1:12.909 - Lewis Hamilton (2021)',
    firstGP: '1950'
  },
  {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    location: 'Silverstone, England',
    country: 'United Kingdom',
    layout: [
      { x: 0.5, y: 0.1 }, { x: 0.7, y: 0.15 }, { x: 0.85, y: 0.2 },
      { x: 0.9, y: 0.3 }, { x: 0.8, y: 0.4 }, { x: 0.7, y: 0.45 },
      { x: 0.6, y: 0.5 }, { x: 0.7, y: 0.6 }, { x: 0.8, y: 0.7 },
      { x: 0.75, y: 0.85 }, { x: 0.6, y: 0.9 }, { x: 0.4, y: 0.85 },
      { x: 0.25, y: 0.75 }, { x: 0.2, y: 0.6 }, { x: 0.25, y: 0.45 },
      { x: 0.3, y: 0.35 }, { x: 0.2, y: 0.25 }, { x: 0.25, y: 0.15 }
    ],
    facts: [
      'Home of British Grand Prix and birthplace of F1 (first race 1950)',
      'Built on a former World War II Royal Air Force bomber station',
      'Copse, Maggotts, and Becketts are some of the fastest corners in F1',
      'Lewis Hamilton has won here a record 8 times',
      'Hosts one of the largest crowds in F1, with over 140,000 on race day'
    ],
    length: '5.891 km',
    lapRecord: '1:27.097 - Max Verstappen (2020)',
    firstGP: '1950'
  },
  {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    location: 'Spa, Belgium',
    country: 'Belgium',
    layout: [
      { x: 0.4, y: 0.1 }, { x: 0.5, y: 0.15 }, { x: 0.6, y: 0.25 },
      { x: 0.7, y: 0.4 }, { x: 0.8, y: 0.5 }, { x: 0.85, y: 0.65 },
      { x: 0.8, y: 0.8 }, { x: 0.7, y: 0.85 }, { x: 0.55, y: 0.8 },
      { x: 0.4, y: 0.7 }, { x: 0.3, y: 0.6 }, { x: 0.25, y: 0.45 },
      { x: 0.2, y: 0.3 }, { x: 0.25, y: 0.2 }, { x: 0.3, y: 0.15 }
    ],
    facts: [
      'Longest track on the F1 calendar at 7.004 km',
      'Infamous for unpredictable weather - can rain on one part while dry elsewhere',
      'Eau Rouge-Raidillon is one of the most feared and respected corners in motorsport',
      'Michael Schumacher took his first F1 victory here in 1992',
      'The track elevation changes by 100 meters from lowest to highest point'
    ],
    length: '7.004 km',
    lapRecord: '1:46.286 - Valtteri Bottas (2018)',
    firstGP: '1950'
  },
  {
    id: 'suzuka',
    name: 'Suzuka International Racing Course',
    location: 'Suzuka, Japan',
    country: 'Japan',
    layout: [
      { x: 0.5, y: 0.2 }, { x: 0.65, y: 0.15 }, { x: 0.75, y: 0.2 },
      { x: 0.8, y: 0.3 }, { x: 0.75, y: 0.4 }, { x: 0.65, y: 0.45 },
      { x: 0.55, y: 0.5 }, { x: 0.6, y: 0.6 }, { x: 0.7, y: 0.7 },
      { x: 0.75, y: 0.8 }, { x: 0.65, y: 0.85 }, { x: 0.5, y: 0.8 },
      { x: 0.35, y: 0.75 }, { x: 0.25, y: 0.65 }, { x: 0.2, y: 0.5 },
      { x: 0.25, y: 0.35 }, { x: 0.35, y: 0.25 }
    ],
    facts: [
      'Only figure-eight circuit on the F1 calendar with a bridge overpass',
      'Designed by Dutch racing legend John Hugenholtz in 1962',
      'The 130R corner was one of the fastest in F1 before chicane modifications',
      'Ayrton Senna and Alain Prost had their famous collisions here in 1989 and 1990',
      'Known for enthusiastic fans who create incredible grandstand displays'
    ],
    length: '5.807 km',
    lapRecord: '1:30.983 - Lewis Hamilton (2019)',
    firstGP: '1987'
  },
  {
    id: 'interlagos',
    name: 'Autódromo José Carlos Pace',
    location: 'São Paulo, Brazil',
    country: 'Brazil',
    layout: [
      { x: 0.5, y: 0.15 }, { x: 0.6, y: 0.2 }, { x: 0.7, y: 0.3 },
      { x: 0.75, y: 0.45 }, { x: 0.7, y: 0.6 }, { x: 0.6, y: 0.7 },
      { x: 0.5, y: 0.75 }, { x: 0.4, y: 0.8 }, { x: 0.3, y: 0.75 },
      { x: 0.25, y: 0.65 }, { x: 0.3, y: 0.5 }, { x: 0.35, y: 0.4 },
      { x: 0.3, y: 0.3 }, { x: 0.35, y: 0.2 }
    ],
    facts: [
      'Run counter-clockwise, one of only a few circuits with this direction',
      'Named after Brazilian F1 driver José Carlos Pace who died in 1977',
      'Scene of many dramatic championship deciders, including 2008 and 2012',
      'Elevation changes of 30 meters make it physically demanding',
      'The passionate Brazilian crowd creates an electric atmosphere'
    ],
    length: '4.309 km',
    lapRecord: '1:10.540 - Valtteri Bottas (2018)',
    firstGP: '1973'
  }
]
