import i18next from "i18next";
import { type Language, resources } from "./i18next.ts";
import type { Weather } from "./type.ts";

const toCompass = (deg: number) => {
	const dirs = [
		"N",
		"NNE",
		"NE",
		"ENE",
		"E",
		"ESE",
		"SE",
		"SSE",
		"S",
		"SSW",
		"SW",
		"WSW",
		"W",
		"WNW",
		"NW",
		"NNW",
	];
	return dirs[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
};

/**
 * Describe current weather from Open-Meteo data.
 * @param current {Weather}
 * @param lang {Language}
 * @param city {string} Optional city name to include in the description.
 */
export async function describeOpenMeteo(
	current: Weather,
	lang: Language,
	city?: string,
) {
	await i18next.init({
		lng: lang,
		fallbackLng: "en",
		resources,
		interpolation: {
			escapeValue: false,
		},
	});

	const parts: string[] = [];

	const cond =
		typeof current.weathercode === "number"
			? i18next.t(`weather.code.${current.weathercode}`)
			: undefined;

	const head = i18next.t("sentence.head", {
		city: city ? i18next.t("sentence.city", { city }) : undefined,
		temp:
			typeof current.temperature_2m === "number"
				? Math.round(current.temperature_2m)
				: undefined,
		cond: cond
			? i18next.t("sentence.cond", { cond: cond.toLowerCase?.() ?? cond })
			: undefined,
	});
	parts.push(head);

	if (typeof current.apparent_temperature === "number") {
		parts.push(
			i18next.t("sentence.feels", {
				feels: Math.round(current.apparent_temperature),
			}),
		);
	}

	if (typeof current.wind_speed_10m === "number") {
		const payload: Record<string, unknown> = {
			speed: Math.round(current.wind_speed_10m * 10) / 10,
		};
		if (typeof current.wind_direction_10m === "number") {
			const code = toCompass(current.wind_direction_10m);
			payload.dir = i18next.t("sentence.wind.dir", {
				dir: i18next.t(`dir.${code}`),
			});
		}
		if (typeof current.wind_gusts_10m === "number") {
			payload.gust = i18next.t("sentence.wind.gust", {
				gust: Math.round(current.wind_gusts_10m * 10) / 10,
			});
		}
		parts.push(i18next.t("sentence.wind", payload));
	}

	const snow = current.snowfall ?? 0;
	const rain = (current.rain ?? 0) + (current.showers ?? 0);
	const precip = current.precipitation ?? 0;

	if (snow > 0)
		parts.push(
			i18next.t("sentence.precip.snow", { cm: Math.round(snow * 10) / 10 }),
		);
	else if (rain > 0)
		parts.push(
			i18next.t("sentence.precip.rain", { mm: Math.round(rain * 10) / 10 }),
		);
	else if (precip > 0)
		parts.push(
			i18next.t("sentence.precip.rain", { mm: Math.round(precip * 10) / 10 }),
		);
	else parts.push(i18next.t("sentence.precip.none"));

	if (typeof current.relative_humidity_2m === "number")
		parts.push(
			i18next.t("sentence.humidity", { pct: current.relative_humidity_2m }),
		);

	if (typeof current.cloud_cover === "number")
		parts.push(i18next.t("sentence.clouds", { pct: current.cloud_cover }));

	if (typeof current.visibility === "number")
		parts.push(
			i18next.t("sentence.visibility", {
				km: Math.round((current.visibility / 1000) * 10) / 10,
			}),
		);

	return parts.join(" · ");
}
