import { WeatherDescribe } from "../src";

const wx = new WeatherDescribe({
	lang: "fr",
	timezone: "auto",
	cacheTtlMs: 60_000,
});
const { emoji, text } = await wx.byCity("Lyon"); // "🌤️ À Lyon · Il fait ..."
const { emoji: emoji2, text: text2 } = await wx.byCoords(48.85, 2.35, {
	lang: "en",
}); // { emoji: "☁️", text: "In Paris · It is ..." }

console.log(emoji, text);
console.log(emoji2, text2);

//short
const { emoji: emoji3, text: text3 } = await wx.byCity("Marseille", {
	short: true,
});

console.log(emoji3, text3); // "☀️ 25°C, clear sky, wind 5 km/h SW"
