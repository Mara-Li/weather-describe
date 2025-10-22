import type { Language } from "./i18next.ts";

export type Weather = {
	/**
	 * See Open Weather API documentation for details
	 * https://open-meteo.com/en/docs
	 */
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
};

export const WEATHER_CODE_EMOJI: Record<number, string> = {
	0: "☀️", // Clear sky
	1: "🌤️", // Mainly clear
	2: "⛅", // Partly cloudy
	3: "☁️", // Overcast
	45: "🌫️", // Fog
	48: "🌫️", // Depositing rime fog
	51: "🌦️", // Drizzle: Light
	53: "🌦️", // Drizzle: Moderate
	55: "🌧️", // Drizzle: Dense intensity
	56: "🌧️", // Freezing Drizzle: Light
	57: "🌧️", // Freezing Drizzle: Dense intensity
	61: "🌧️", // Rain: Slight
	63: "🌧️", // Rain: Moderate
	65: "🌧️", // Rain: Heavy intensity
	66: "🌨️", // Freezing Rain: Light
	67: "🌨️", // Freezing Rain: Heavy intensity
	71: "🌨️", // Snow fall: Slight
	73: "🌨️", // Snow fall: Moderate
	75: "🌨️", // Snow fall: Heavy intensity
	77: "❄️", // Snow grains
	80: "🌧️", // Rain showers: Slight
	81: "🌧️", // Rain showers
	82: "🌧️", // Rain showers: Violent
	85: "🌨️", // Snow showers slight
	86: "🌨️", // Snow showers heavy
	95: "⛈️", // Thunderstorm: Slight or moderate
	96: "⛈️", // Thunderstorm with slight hail
	99: "⛈️", // Thunderstorm with heavy hail
};

export interface WeatherDescribeOptions {
	/**
	 * Langue for the weather description
	 */
	lang?: Language;
	/**
	 * Timezone for the weather data
	 * @default auto
	 */
	timezone?: string;
	/**
	 * Default city if no location is provided
	 */
	defaultCity?: string;
	/**
	 * Cache duration in milliseconds for weather data
	 * @default 0 (no caching)
	 */
	cacheTtlMs?: number;
}

export interface WeatherDescribeResult {
	/**
	 * Emoji representing the current weather condition
	 */
	emoji: string;
	/**
	 * Textual description of the current weather
	 */
	text: string;
	/**
	 * Current weather data
	 */
	current: Weather;
}

type APIOptions = {
	/**
	 * Language for the text description
	 */
	lang?: Language;
	/**
	 * Short description without detailed info
	 * @default false
	 * @example true => `15°C, light rain, wind 10 km/h NE`
	 */
	short?: boolean;
};

export type ByCoordsOptions = APIOptions & {
	/**
	 * City name for description context (e.g., "Paris" for coordinates in Paris)
	 */
	cityName?: string;
};
export type ByCityOptions = APIOptions & {
	/**
	 * Optional country code to refine city search (e.g., "US" for United States)
	 */
	countryCode?: string;
};
