import { MonksCommonDisplay, i18n } from "./monks-common-display.js";

export const registerSettings = function () {
    // Register any custom module settings here
    let modulename = "monks-common-display";

	game.settings.register(modulename, "show-combat", {
		name: i18n("MonksCommonDisplay.show-combat.name"),
		hint: i18n("MonksCommonDisplay.show-combat.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});
	game.settings.register(modulename, "display-players", {
		name: i18n("MonksCommonDisplay.display-players.name"),
		hint: i18n("MonksCommonDisplay.display-players.hint"),
		scope: "world",
		config: true,
		default: "",
		type: String,
	});
};
