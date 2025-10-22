export type Weather = {
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

export type DescribeOptions = {
	/**
	 * Timezone to use for the weather description (default: "auto")
	 */
	timezone?: string;
	/**
	 * Optional AbortSignal to cancel the request
	 */
	signal?: AbortSignal;
	/**
	 * City name to include in the description (optional)
	 */
	cityName?: string;
};
