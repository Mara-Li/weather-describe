import { getNowDescriptionByCoords, getWeatherEmojiByCoords } from "../src";

console.log(
	await getNowDescriptionByCoords(45.76, 4.83, "fr", { cityName: "Lyon" }),
);

console.log(
	await getWeatherEmojiByCoords(45.76, 4.83, { timezone: "Europe/Paris" }),
);
