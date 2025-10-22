// WeatherNow.ts

import i18next from "i18next";
import { fetchWeatherApi } from "openmeteo";
import { type Language, resources } from "./i18next.ts";
import {
	WEATHER_CODE_EMOJI,
	type Weather,
	type WeatherNowOptions,
} from "./type.ts";

export class WeatherDescribe {
	private lang: Language;
	private timezone: string;
	private readonly defaultCity?: string;
	private readonly cacheTtl: number;
	private inited = false;
	private cache = new Map<string, { at: number; cur: Weather }>();

	constructor(opts: WeatherNowOptions = {}) {
		this.lang = opts.lang ?? "fr";
		this.timezone = opts.timezone ?? "auto";
		this.defaultCity = opts.defaultCity;
		this.cacheTtl = opts.cacheTtlMs ?? 0;
	}

	setLanguage(lang: Language) {
		this.lang = lang;
	}
	setTimezone(tz: string) {
		this.timezone = tz;
	}

	private async ensureI18n(lang: Language) {
		if (!this.inited) {
			await i18next.init({
				lng: lang,
				fallbackLng: "en",
				resources,
				interpolation: {
					escapeValue: false,
				},
			});
			this.inited = true;
		} else {
			await i18next.changeLanguage(lang);
		}
	}

	private toCompass(deg: number) {
		const d = [
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
		return d[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
	}

	private describe(current: Weather, city?: string) {
		const t = i18next.t.bind(i18next);
		const parts: string[] = [];

		const cond =
			typeof current.weathercode === "number"
				? t(`weather.code.${current.weathercode}`)
				: undefined;

		const head = t("sentence.head", {
			city: city ? t("sentence.city", { city }) : undefined,
			temp:
				typeof current.temperature_2m === "number"
					? Math.round(current.temperature_2m)
					: undefined,
			cond: cond
				? t("sentence.cond", { cond: cond.toLowerCase?.() ?? cond })
				: undefined,
		});
		parts.push(head);

		if (typeof current.apparent_temperature === "number")
			parts.push(
				t("sentence.feels", {
					feels: Math.round(current.apparent_temperature),
				}),
			);

		if (typeof current.wind_speed_10m === "number") {
			const payload: Record<string, unknown> = {
				speed: Math.round(current.wind_speed_10m * 10) / 10,
			};
			if (typeof current.wind_direction_10m === "number") {
				payload.dir = t("sentence.wind.dir", {
					dir: t(`dir.${this.toCompass(current.wind_direction_10m)}`),
				});
			}
			if (typeof current.wind_gusts_10m === "number") {
				payload.gust = t("sentence.wind.gust", {
					gust: Math.round(current.wind_gusts_10m * 10) / 10,
				});
			}
			parts.push(t("sentence.wind", payload));
		}

		const snow = current.snowfall ?? 0;
		const rain = (current.rain ?? 0) + (current.showers ?? 0);
		const precip = current.precipitation ?? 0;

		if (snow > 0)
			parts.push(t("sentence.precip.snow", { cm: Math.round(snow * 10) / 10 }));
		else if (rain > 0)
			parts.push(t("sentence.precip.rain", { mm: Math.round(rain * 10) / 10 }));
		else if (precip > 0)
			parts.push(
				t("sentence.precip.rain", { mm: Math.round(precip * 10) / 10 }),
			);
		else parts.push(t("sentence.precip.none"));

		if (typeof current.relative_humidity_2m === "number")
			parts.push(t("sentence.humidity", { pct: current.relative_humidity_2m }));

		if (typeof current.cloud_cover === "number")
			parts.push(t("sentence.clouds", { pct: current.cloud_cover }));

		if (typeof current.visibility === "number")
			parts.push(
				t("sentence.visibility", {
					km: Math.round((current.visibility / 1000) * 10) / 10,
				}),
			);

		// unescape éventuel du slash HTML
		return parts.join(" · ").replaceAll("&#x2F;", "/");
	}

	private async fetchCurrent(lat: number, lon: number, lang: Language) {
		const key = `${lat},${lon},${lang},${this.timezone}`;
		const now = Date.now();
		const cached = this.cache.get(key);
		if (cached && this.cacheTtl > 0 && now - cached.at < this.cacheTtl)
			return cached.cur;

		const currentVars =
			"temperature_2m,apparent_temperature,weather_code,wind_speed_10m," +
			"wind_direction_10m,wind_gusts_10m,precipitation,rain,showers," +
			"snowfall,relative_humidity_2m,cloud_cover,visibility";

		const params = {
			latitude: [lat],
			longitude: [lon],
			current: currentVars,
			lang,
			timezone: this.timezone,
		};

		const url = "https://api.open-meteo.com/v1/forecast";
		const responses = await fetchWeatherApi(url, params);
		const res = responses[0];
		if (!res) throw new Error("Open-Meteo: pas de réponse météo.");
		const cur = res.current();
		if (!cur) throw new Error("Open-Meteo: pas de bloc `current`.");

		const obj: Weather = {
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

		if (this.cacheTtl > 0) this.cache.set(key, { at: now, cur: obj });
		return obj;
	}

	private emojiFromCode(code: number) {
		return WEATHER_CODE_EMOJI[code] ?? "❔";
	}

	async byCoords(
		lat: number,
		lon: number,
		opts?: { lang?: Language; cityName?: string },
	) {
		const lang = opts?.lang ?? this.lang;
		await this.ensureI18n(lang);
		const cur = await this.fetchCurrent(lat, lon, lang);
		const text = this.describe(cur, opts?.cityName);
		const emoji = this.emojiFromCode(Math.round(cur.weathercode ?? -1));
		return { emoji, text, current: cur };
	}

	async byCity(
		city?: string,
		opts?: { countryCode?: string; lang?: Language },
	) {
		const target = city ?? this.defaultCity;
		if (!target) throw new Error("Aucune ville fournie.");
		const lang = opts?.lang ?? this.lang;

		// géocodage public Open-Meteo
		const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
		geoUrl.searchParams.set(
			"name",
			opts?.countryCode ? `${target}, ${opts.countryCode}` : target,
		);
		geoUrl.searchParams.set("count", "1");
		geoUrl.searchParams.set("Language", lang);

		const g = await fetch(geoUrl);
		if (!g.ok)
			throw new Error(`Geocoding error ${g.status}: ${await g.text()}`);
		const gData = (await g.json()) as {
			results?: Array<{ latitude: number; longitude: number; name?: string }>;
		};
		const best = gData.results?.[0];
		if (!best) throw new Error(`Ville introuvable: ${target}`);

		return this.byCoords(best.latitude, best.longitude, {
			lang,
			cityName: target,
		});
	}
}
