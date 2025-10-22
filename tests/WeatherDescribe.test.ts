import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { fetchWeatherApi } from "openmeteo";
import { WeatherDescribe } from "../src";
import {
	baseLyon,
	makeGeoJson,
	makeOpenMeteoResponse,
	type RequestInfo,
	toCurrentArray,
} from "./helper";

// mock du SDK openmeteo
mock.module("openmeteo", () => ({
	fetchWeatherApi: mock(async (_url: string, _params: any) => {
		const arr = toCurrentArray(baseLyon());
		return makeOpenMeteoResponse(arr);
	}),
}));

// mock du fetch global (géocodage)
const realFetch = globalThis.fetch;
beforeEach(() => {
	globalThis.fetch = mock(async (input: RequestInfo) => {
		const url = String(input);
		if (url.includes("geocoding-api.open-meteo.com")) {
			return new Response(JSON.stringify(makeGeoJson(45.76, 4.83)), {
				status: 200,
			});
		}
		return new Response("Not mocked", { status: 500 });
	}) as any;
});
afterEach(() => {
	globalThis.fetch = realFetch;
});

describe("WeatherNow façade (bun:test)", () => {
	it("byCoords → emoji + texte (FR)", async () => {
		(fetchWeatherApi as any).mockResolvedValueOnce(
			makeOpenMeteoResponse(toCurrentArray(baseLyon({ weathercode: 63 }))),
		);

		const wx = new WeatherDescribe({ lang: "fr", timezone: "auto" });
		const { emoji, text, current } = await wx.byCoords(45.76, 4.83, {
			cityName: "Lyon",
		});

		expect(emoji).toBe("🌧️");
		expect(text).toContain("À Lyon");
		expect(text).toMatch(/Il fait\s+12\s*°C/i);
		expect(current.weathercode).toBe(63);
	});

	it("byCity → géocode puis appelle byCoords (EN)", async () => {
		(fetchWeatherApi as any).mockResolvedValueOnce(
			makeOpenMeteoResponse(toCurrentArray(baseLyon({ weathercode: 0 }))),
		);

		const wx = new WeatherDescribe({ lang: "en" });
		const { emoji, text } = await wx.byCity("Lyon", { lang: "en" });

		expect(emoji).toBe("☀️");
		expect(text).toContain("In Lyon");
		expect(text).toMatch(/It is\s+12\s*°C/i);
	});

	it("setLanguage / setTimezone → changent les valeurs par défaut", async () => {
		const wx = new WeatherDescribe({ lang: "fr", timezone: "auto" });
		wx.setLanguage("en");

		const r1 = await wx.byCoords(45.76, 4.83);
		expect(r1.text).toMatch(/^It is/);

		wx.setTimezone("Europe/Paris");
		const r2 = await wx.byCoords(45.76, 4.83);
		expect(r2.text.length).toBeGreaterThan(10);
	});
});
