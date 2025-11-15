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

Circuit layouts are dynamically loaded from the [bacinger/f1-circuits](https://github.com/bacinger/f1-circuits) repository on app startup. The GeoJSON data is parsed and normalized for shape matching.

### Wikipedia Data

Wikipedia facts and statistics are **pre-scraped and stored locally** in `src/data/wikipedia-data.json`. This approach:

- ✅ Eliminates loading delays and API dependencies
- ✅ Works offline once the app is loaded
- ✅ Ensures consistent data during user sessions
- ✅ Improves app performance significantly

### Updating Wikipedia Data

To refresh Wikipedia data with the latest information:

```bash
# Install tsx if needed
npm install -g tsx

# Run the scraper
tsx scripts/scrape-wikipedia.ts
```

See `scripts/README.md` for more details about the scraper.

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
