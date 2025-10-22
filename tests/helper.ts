import type { Weather } from "../src/type.ts";

export function baseLyon(overrides: Weather = {}): Weather {
	return {
		temperature_2m: 12.4,
		apparent_temperature: 11.8,
		weathercode: 2, // Partly cloudy
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

export function toCurrentArray(cur: Weather): number[] {
	return [
		cur.temperature_2m ?? 0,
		cur.apparent_temperature ?? 0,
		cur.weathercode ?? 0,
		cur.wind_speed_10m ?? 0,
		cur.wind_direction_10m ?? 0,
		cur.wind_gusts_10m ?? 0,
		cur.precipitation ?? 0,
		cur.rain ?? 0,
		cur.showers ?? 0,
		cur.snowfall ?? 0,
		cur.relative_humidity_2m ?? 0,
		cur.cloud_cover ?? 0,
		cur.visibility ?? 0,
	];
}

export type RequestInfo = string | URL | Request;

export function makeOpenMeteoResponse(values: number[]) {
	return [
		{
			current() {
				return {
					variables(i: number) {
						return { value: () => values[i] };
					},
				};
			},
		},
	];
}

/** Mock de la réponse de géocodage Open-Meteo */
export function makeGeoJson(lat = 45.76, lon = 4.83) {
	return { results: [{ latitude: lat, longitude: lon, name: "Lyon" }] };
}
