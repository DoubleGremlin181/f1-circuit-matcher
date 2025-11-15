# Circuit Sketch - F1 Track Matcher

Draw shapes and match them against real Formula 1 circuit layouts! This interactive web application uses shape recognition algorithms to find the best matching F1 circuits and provides detailed information from Wikipedia.

## Features

- 🎨 **Draw to Match**: Draw shapes with your finger or mouse and instantly match them against F1 circuits
- 🏎️ **Browse Circuits**: Explore all available F1 circuits with detailed layouts and information
- 📊 **Multiple Algorithms**: Choose between Hausdorff distance, Frechet distance, or turning angle matching
- 📚 **Wikipedia Data**: Pre-scraped facts and statistics for instant display (no loading delays!)
- 🌓 **Dark Mode**: Full dark mode support for comfortable viewing
- 💾 **Local Data**: All circuit layouts and Wikipedia data stored locally for instant access

## Data Architecture

All data is stored locally in the repository for instant access and offline capability:

### Circuit Layouts

Circuit layouts are downloaded ahead of time from the
[bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) repository and
saved to `src/data/circuits.json`. The `scripts/fetch-circuits.ts` helper pulls the
latest GeoJSON bundle, normalizes each layout into 0-1 coordinates, and writes the
result to disk so the UI never has to hit the network.

### Wikipedia Data

Wikipedia facts and statistics are **pre-scraped and stored locally** in `src/data/wikipedia-data.json`. This approach:

- ✅ Eliminates loading delays and API dependencies
- ✅ Works offline once the app is loaded
- ✅ Ensures consistent data during user sessions
- ✅ Improves app performance significantly

### Updating Local Data

Refresh both the circuit layouts and Wikipedia stats with one command:

```bash
npm run data:pull
```

Individual scripts are also available:

```bash
npm run data:circuits     # Updates src/data/circuits.json
npm run data:wikipedia    # Updates src/data/wikipedia-data.json
```

See `scripts/README.md` for more details about each script.

### Adding New Circuits

To add new circuits:

1. Add the circuit to the [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) repository
2. Add the Wikipedia page mapping to `scripts/scrape-wikipedia.ts` (in the `WIKIPEDIA_MAPPING` object)
3. Run the scraper to fetch Wikipedia data: `tsx scripts/scrape-wikipedia.ts`
4. The circuit will automatically be available in the app

## Development

```bash
npm run dev
```

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
