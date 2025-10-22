import { describe, expect, it } from "bun:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describeOpenMeteo } from "../src";
import { baseLyon } from "./helper.ts";

// IMPORTANT : assure que Vitest s'exécute depuis la racine du projet
// (le loader i18next cherche ../locales/{{lng}}/translation.json à partir de src/describe.ts)

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("describeOpenMeteo (FR/EN, lazy i18n load)", () => {
	it("FR · phrase complète de base (Lyon, partiellement nuageux)", async () => {
		const text = await describeOpenMeteo(baseLyon(), "fr", "Lyon");
		expect(text).toContain("À Lyon"); // ville
		expect(text).toMatch(/Il fait\s+12\s*°C/i); // temp arrondie
		expect(text).toContain("(partiellement nuageux)"); // label WMO FR en minuscules
		expect(text).toContain("vent 14.2 km/h"); // vent km/h
		expect(text).toMatch(/de nord-ouest|de nord-nord-ouest/i); // direction FR
		expect(text).toContain("(rafales 28.6 km/h)");
		expect(text).toContain("pas de précipitations");
		expect(text).toContain("humidité 62 %");
		expect(text).toContain("nébulosité 45 %");
		expect(text).toContain("visibilité 9 km");
		expect(text).toContain("ressenti 12 °C"); // apparent_temperature 11.8 → 12 arrondi
	});

	it("EN · same data", async () => {
		const text = await describeOpenMeteo(baseLyon(), "en", "Lyon");
		expect(text).toContain("In Lyon");
		expect(text).toMatch(/It is\s+12\s*°C/i);
		expect(text).toContain("(partly cloudy)");
		expect(text).toContain("wind 14.2 km/h");
		expect(text).toMatch(/from the northwest|from the north-northwest/i);
		expect(text).toContain("(gusts 28.6 km/h)");
		expect(text).toContain("no precipitation");
		expect(text).toContain("humidity 62%");
		expect(text).toContain("cloud cover 45%");
		expect(text).toContain("visibility 9 km");
		expect(text).toContain("feels like 12°C");
	});

	it("FR · pluie (rain+showers), pas de neige", async () => {
		const text = await describeOpenMeteo(
			baseLyon({ rain: 0.7, showers: 0.6, precipitation: 1.3 }),
			"fr",
		);
		// priorité à rain+showers
		expect(text).toContain("précipitations: 1.3 mm");
		expect(text).not.toContain("neige:");
	});

	it("FR · neige prioritaire sur pluie", async () => {
		const text = await describeOpenMeteo(
			baseLyon({ snowfall: 0.8, rain: 2 }),
			"fr",
		);
		expect(text).toContain("neige: 0.8 cm");
		expect(text).not.toContain("précipitations:");
	});

	it("FR · pas de précipitations si tout est zéro", async () => {
		const text = await describeOpenMeteo(
			baseLyon({ rain: 0, showers: 0, precipitation: 0, snowfall: 0 }),
			"fr",
		);
		expect(text).toContain("pas de précipitations");
	});

	it("FR · robustesse : champs manquants", async () => {
		const text = await describeOpenMeteo(
			{
				weathercode: 0, // ciel clair
				temperature_2m: undefined,
				wind_speed_10m: undefined,
			},
			"fr",
		);
		// Pas de plantage, on a au moins le label
		expect(text).toMatch(/ciel clair/i);
	});

	it("EN · direction bords de boussole", async () => {
		// 0° → north ; 90° → east ; 180° → south ; 270° → west
		const n = await describeOpenMeteo(
			baseLyon({ wind_direction_10m: 0 }),
			"en",
		);
		expect(n).toMatch(/from the north/);

		const e = await describeOpenMeteo(
			baseLyon({ wind_direction_10m: 90 }),
			"en",
		);
		expect(e).toMatch(/from the east/);

		const s = await describeOpenMeteo(
			baseLyon({ wind_direction_10m: 180 }),
			"en",
		);
		expect(s).toMatch(/from the south/);

		const w = await describeOpenMeteo(
			baseLyon({ wind_direction_10m: 270 }),
			"en",
		);
		expect(w).toMatch(/from the west/);
	});

	it("FR · uniquement pluie via precipitation (pas de rain/showers)", async () => {
		const text = await describeOpenMeteo(
			baseLyon({ precipitation: 0.4, rain: 0, showers: 0 }),
			"fr",
		);
		expect(text).toContain("précipitations: 0.4 mm");
	});

	it("EN · pas de ville fournie → pas de préfixe", async () => {
		const text = await describeOpenMeteo(baseLyon(), "en");
		expect(text.startsWith("In ")).toBe(false);
		expect(text).toMatch(/It is\s+12\s*°C/);
	});
});
