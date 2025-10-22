# weather-describe

A TypeScript library that generates natural language weather descriptions from the Open-Meteo API with multilingual support.

## Features

- 🌍 **Multilingual**: Support for English and French
- 🌡️ **Complete weather data**: Temperature, feels-like, wind, precipitation, humidity, cloud cover, and visibility
- 🎯 **Flexible queries**: Search by coordinates or city name
- 💾 **Built-in caching**: Configurable cache TTL to reduce API calls
- 🌐 **Timezone support**: Automatic or custom timezone configuration
- 😊 **Weather emojis**: Returns appropriate emoji for each weather condition

## Installation

```bash
bun add weather-describe
# or
npm install weather-describe
# or
yarn add weather-describe
```

## Usage

### Basic Example

```typescript
import { WeatherDescribe } from 'weather-describe';

const weather = new WeatherDescribe({
  lang: 'en',
  timezone: 'auto',
  cacheTtlMs: 300000 // 5 minutes cache
});

// Get weather by coordinates
const result = await weather.byCoords(48.8566, 2.3522, {
  cityName: 'Paris'
});

console.log(result.emoji); // e.g., "☀️"
console.log(result.text);  // "In Paris, it's 18°C with clear sky. Feels like 17°C..."
console.log(result.current); // Raw weather data object
```

### Query by City Name

```typescript
const weather = new WeatherDescribe({ lang: 'en' });

// Simple city name
const paris = await weather.byCity('Paris');

// With country code for precision
const london = await weather.byCity('London', { 
  countryCode: 'GB',
  lang: 'en'
});

console.log(london.text);
```

### Change Language Dynamically

```typescript
const weather = new WeatherDescribe({ lang: 'en' });

// Query in English
const resultEN = await weather.byCity('Lyon');

// Switch to French
weather.setLanguage('fr');
const resultFR = await weather.byCity('Lyon');
```

### Configure Timezone

```typescript
const weather = new WeatherDescribe({ 
  lang: 'en',
  timezone: 'America/New_York'
});

// Or change it later
weather.setTimezone('Europe/Paris');
```

## API

### Constructor Options

```typescript
interface WeatherNowOptions {
  lang?: 'en' | 'fr';        // Default: 'fr'
  timezone?: string;         // Default: 'auto'
  defaultCity?: string;      // Default city for byCity() without params
  cacheTtlMs?: number;       // Cache TTL in milliseconds (0 = no cache)
}
```

### Methods

#### `byCoords(lat: number, lon: number, opts?)`

Get weather description by geographic coordinates.

**Parameters:**
- `lat`: Latitude
- `lon`: Longitude
- `opts.lang`: Override language for this query
- `opts.cityName`: Optional city name to include in description

**Returns:** `Promise<{ emoji: string, text: string, current: Weather }>`

#### `byCity(city?: string, opts?)`

Get weather description by city name (uses geocoding).

**Parameters:**
- `city`: City name (uses `defaultCity` if not provided)
- `opts.countryCode`: ISO country code for more precise results (e.g., 'US', 'FR')
- `opts.lang`: Override language for this query

**Returns:** `Promise<{ emoji: string, text: string, current: Weather }>`

#### `setLanguage(lang: 'en' | 'fr')`

Change the default language.

#### `setTimezone(tz: string)`

Change the timezone (e.g., 'Europe/Paris', 'America/New_York', 'auto').

### Weather Data Object

```typescript
interface Weather {
  temperature_2m?: number;
  apparent_temperature?: number;
  weathercode?: number;
  wind_speed_10m?: number;
  wind_direction_10m?: number;
  wind_gusts_10m?: number;
  precipitation?: number;
  rain?: number;
  showers?: number;
  snowfall?: number;
  relative_humidity_2m?: number;
  cloud_cover?: number;
  visibility?: number;
}
```

## Weather Codes & Emojis

| Code   | Description                      | Emoji |
|--------|----------------------------------|-------|
| 0      | Clear sky                        | ☀️    |
| 1      | Mainly clear                     | 🌤️   |
| 2      | Partly cloudy                    | ⛅     |
| 3      | Overcast                         | ☁️    |
| 45, 48 | Fog                              | 🌫️   |
| 51, 53 | Drizzle                          | 🌦️   |
| 55-57  | Dense drizzle / Freezing drizzle | 🌧️   |
| 61-65  | Rain (slight to heavy)           | 🌧️   |
| 66-67  | Freezing rain                    | 🌨️   |
| 71-77  | Snow                             | 🌨️❄️ |
| 80-82  | Rain showers                     | 🌧️   |
| 85-86  | Snow showers                     | 🌨️   |
| 95-99  | Thunderstorm                     | ⛈️    |

## Example Output

**English:**
```
In Paris, it's 18°C with partly cloudy. Feels like 17°C. Wind: 12.5 km/h from SW, gusts up to 20.3 km/h. No precipitation. Humidity: 65%. Cloud cover: 45%. Visibility: 10.0 km.
```

**French:**
```
À Paris, il fait 18°C avec passages nuageux. Ressenti 17°C. Vent : 12,5 km/h de SO, rafales jusqu'à 20,3 km/h. Aucune précipitation. Humidité : 65 %. Couverture nuageuse : 45 %. Visibilité : 10,0 km.
```

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Lint & format
bun run biome check --write
```

## Technologies

- [Bun](https://bun.sh/) - Runtime and package manager
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Open-Meteo](https://open-meteo.com/) - Weather API (free, no API key required)
- [i18next](https://www.i18next.com/) - Internationalization
- [Biome](https://biomejs.dev/) - Linting and formatting

## License

MIT

## Credits

Weather data provided by [Open-Meteo.com](https://open-meteo.com/)

