# Wikipedia Data Scraper

This script scrapes Wikipedia data for F1 circuits and stores it locally in the repository.

## Purpose

Instead of fetching Wikipedia data live during runtime, we pre-scrape the data and store it in a static JSON file. This approach:

- **Improves performance**: No waiting for Wikipedia API calls during app usage
- **Reduces dependencies**: No reliance on Wikipedia API availability
- **Ensures consistency**: Data doesn't change unexpectedly during user sessions
- **Better offline support**: App works without internet connection once loaded

## How to Run

The scraper is written in TypeScript and can be run with ts-node or tsx:

```bash
# Install tsx if not already installed
npm install -g tsx

# Run the scraper
tsx scripts/scrape-wikipedia.ts
```

## What It Does

1. Fetches Wikipedia content and infobox data for each F1 circuit
2. Extracts relevant information:
   - Circuit facts (interesting historical and technical details)
   - Length
   - Number of corners
   - First Grand Prix year
   - Lap record
   - Total races held
   - Year range of races
   - Driver with most wins at the circuit

3. Saves all data to `src/data/wikipedia-data.json`

## Output

The script generates a JSON file with this structure:

```json
{
  "circuit-id": {
    "facts": ["Fact 1", "Fact 2", ...],
    "length": "5.793 km",
    "corners": 11,
    "firstGP": "1950",
    "totalRaces": 73,
    "yearRange": "1950-2024",
    "mostWins": {
      "driver": "Lewis Hamilton",
      "wins": 5
    }
  }
}
```

## When to Update

Run the scraper when:
- Adding new circuits to the database
- Updating facts or statistics for existing circuits
- Wikipedia data has changed significantly
- Before major app releases to ensure fresh data

## Notes

- The scraper includes delays between requests to be respectful to Wikipedia's API
- Some circuits may not have all fields populated (e.g., new circuits without extensive history)
- The data is manually reviewed and can be edited in the JSON file if needed
