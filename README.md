# weather-describe

Une bibliothèque TypeScript pour obtenir des descriptions météo en langage naturel à partir de l'API Open-Meteo.

## Installation

```bash
bun install
```

## Utilisation

La bibliothèque expose une classe `WeatherDescribe` qui regroupe toutes les fonctionnalités :

```typescript
import { WeatherDescribe } from "weather-describe";

const weather = new WeatherDescribe();

// Obtenir une description par coordonnées
const description = await weather.byCoords(48.8566, 2.3522, "fr");
console.log(description);

// Obtenir une description par nom de ville
const descriptionByCity = await weather.byCity("Paris", "fr");
console.log(descriptionByCity);

// Obtenir un emoji météo par coordonnées
const emoji = await weather.getWeatherEmojiByCoords(48.8566, 2.3522);
console.log(emoji);

// Obtenir un emoji météo par nom de ville
const emojiByCity = await weather.emojiByCity("Paris");
console.log(emojiByCity);

// Obtenir un emoji à partir d'un code météo
const emojiFromCode = weather.getEmojiWeather(0); // ☀️
```

## API

### Classe `WeatherDescribe`

#### Méthodes publiques

- `byCoords(lat: number, lon: number, lang?: Language, opts?: DescribeOptions): Promise<string>`
  - Obtient une description détaillée de la météo actuelle par coordonnées
  
- `byCity(city: string, lang?: Language, opts?: Options): Promise<string>`
  - Obtient une description détaillée de la météo actuelle par nom de ville
  
- `getWeatherEmojiByCoords(lat: number, lon: number, opts?: Options): Promise<string>`
  - Obtient un emoji représentant la météo actuelle par coordonnées
  
- `emojiByCity(city: string, opts?: Options): Promise<string>`
  - Obtient un emoji représentant la météo actuelle par nom de ville
  
- `getEmojiWeather(code: number): string`
  - Convertit un code météo WMO en emoji

## Langues supportées

- `en` (Anglais)
- `fr` (Français)

This project was created using `bun init` in bun v1.3.0. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
