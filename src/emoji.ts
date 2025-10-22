import { fetchWeatherApi } from "openmeteo";
import { WEATHER_CODE_EMOJI } from "./type.ts";

export function getEmojiWeather(code: number): string {
	return WEATHER_CODE_EMOJI[code] || "";
}

export async function getWeatherEmojiByCoords(
	lat: number,
	lon: number,
	opts?: { timezone?: string },
): Promise<string> {
	const timezone = opts?.timezone ?? "auto";

	const params = {
		latitude: [lat],
		longitude: [lon],
		current: "weather_code",
		timezone,
	};

	const url = "https://api.open-meteo.com/v1/forecast";
	const responses = await fetchWeatherApi(url, params, 3, 0.2, 2);
	const res = responses[0];
	if (!res) throw new Error("Open-Meteo: réponse invalide de l'API météo.");
	const cur = res.current();
	if (!cur)
		throw new Error("Open-Meteo: pas de bloc `current` dans la réponse.");

	const code = cur.variables(0)?.value();
	if (typeof code !== "number")
		throw new Error("Impossible de lire le code météo.");

	return getEmojiWeather(Math.round(code)) ?? "❔";
}

export async function getWeatherEmojiByCity(
	city: string,
	opts?: { countryCode?: string; timezone?: string },
): Promise<string> {
	const q = opts?.countryCode ? `${city}, ${opts.countryCode}` : city;
	const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
	geoUrl.searchParams.set("name", q);
	geoUrl.searchParams.set("count", "1");

	const g = await fetch(geoUrl);
	if (!g.ok) throw new Error(`Geocoding error ${g.status}: ${await g.text()}`);
	const gData = (await g.json()) as {
		results?: Array<{ latitude: number; longitude: number }>;
	};
	const best = gData.results?.[0];
	if (!best) throw new Error(`Ville introuvable: ${q}`);

	return getWeatherEmojiByCoords(best.latitude, best.longitude, {
		timezone: opts?.timezone,
	});
}
