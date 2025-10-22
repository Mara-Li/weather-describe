import { fetchWeatherApi } from "openmeteo";
import type { Language } from "./i18next.ts";
import type { DescribeOptions } from "./type.ts";
import { describeOpenMeteo } from "./utils.ts";

/** Get a description of the current weather at the given coordinates.
 *
 * @param lat {number} Latitude
 * @param lon {number} Longitude
 * @param lang {Language} Language code for the description (default: "en")
 * @param opts {DescribeOptions} Additional options
 * @returns {Promise<string>} Description of the current weather
 * */
export async function getNowDescriptionByCoords(
	lat: number,
	lon: number,
	lang: Language = "en",
	opts?: DescribeOptions,
): Promise<string> {
	const timezone = opts?.timezone ?? "auto";

	// IMPORTANT: l’ordre ici DOIT matcher les indices lus plus bas
	const currentVars =
		"temperature_2m,apparent_temperature,weather_code,wind_speed_10m," +
		"wind_direction_10m,wind_gusts_10m,precipitation,rain,showers," +
		"snowfall,relative_humidity_2m,cloud_cover,visibility";

	const params = {
		latitude: [lat],
		longitude: [lon],
		current: currentVars,
		language: lang,
		timezone,
	};

	const url = "https://api.open-meteo.com/v1/forecast";
	const responses = await fetchWeatherApi(url, params, 3, 0.2, 2, {
		signal: opts?.signal,
	});
	const res = responses[0];
	if (!res) throw new Error(`Open-Meteo error: pas de réponse.`);
	const cur = res.current();
	if (!cur)
		throw new Error("Open-Meteo: pas de bloc `current` dans la réponse.");

	if (!cur.variables) throw new Error("Open-Meteo: Data `current` incomplete.");
	const current = {
		temperature_2m: cur.variables(0)?.value(),
		apparent_temperature: cur.variables(1)?.value(),
		weathercode: cur.variables(2)?.value(),
		wind_speed_10m: cur.variables(3)?.value(),
		wind_direction_10m: cur.variables(4)?.value(),
		wind_gusts_10m: cur.variables(5)?.value(),
		precipitation: cur.variables(6)?.value(),
		rain: cur.variables(7)?.value(),
		showers: cur.variables(8)?.value(),
		snowfall: cur.variables(9)?.value(),
		relative_humidity_2m: cur.variables(10)?.value(),
		cloud_cover: cur.variables(11)?.value(),
		visibility: cur.variables(12)?.value(),
	};

	return describeOpenMeteo(current, lang, opts?.cityName);
}

/**
 * Get a description of the current weather in the given city.
 * @param city
 * @param lang
 * @param opts
 */
export async function getNowDescriptionByCity(
	city: string,
	lang: Language = "en",
	opts?: { countryCode?: string; timezone?: string; signal?: AbortSignal },
): Promise<string> {
	const q = opts?.countryCode ? `${city}, ${opts.countryCode}` : city;
	const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
	geoUrl.searchParams.set("name", q);
	geoUrl.searchParams.set("count", "1");
	geoUrl.searchParams.set("language", lang);

	const g = await fetch(geoUrl, { signal: opts?.signal });
	if (!g.ok) throw new Error(`Geocoding error ${g.status}: ${await g.text()}`);
	const gData = (await g.json()) as {
		results?: Array<{ latitude: number; longitude: number; name?: string }>;
	};
	const best = gData.results?.[0];
	if (!best) throw new Error(`City not found: ${q}`);

	return getNowDescriptionByCoords(best.latitude, best.longitude, lang, {
		timezone: opts?.timezone ?? "auto",
		signal: opts?.signal,
		cityName: city,
	});
}
