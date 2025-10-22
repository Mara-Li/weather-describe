import type { Weather } from "../src/type.ts";

export function baseLyon(overrides: Weather = {}): Weather {
	return {
		temperature_2m: 12.4,
		apparent_temperature: 11.8,
		weathercode: 2, // Partiellement nuageux
		wind_speed_10m: 14.2,
		wind_direction_10m: 305, // ~NW
		wind_gusts_10m: 28.6,
		precipitation: 0,
		rain: 0,
		showers: 0,
		snowfall: 0,
		relative_humidity_2m: 62,
		cloud_cover: 45,
		visibility: 9000,
		...overrides,
	};
}
