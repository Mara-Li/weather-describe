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

console.log(emoji, text, emoji2, text2);
