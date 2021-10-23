import { MonksCommonDisplay, i18n } from "./monks-common-display.js";

export const registerSettings = function () {
    // Register any custom module settings here
	let modulename = "monks-common-display";

	game.settings.registerMenu(modulename, 'hot-keys', {
		name: 'Change Hotkeys',
		label: 'Change Hotkeys',
		hint: 'Change the hotkeys that this module uses',
		icon: 'fas fa-keyboard',
		restricted: true,
		type: Hotkeys.createConfig('Monks Common Display', ['monks-common-display'])
	});

	/*
	game.settings.register(modulename, "display-players", {
		name: i18n("MonksCommonDisplay.display-players.name"),
		hint: i18n("MonksCommonDisplay.display-players.hint"),
		scope: "world",
		config: true,
		default: "",
		type: String,
	});*/
	game.settings.register(modulename, "mirror-movement", {
		name: i18n("MonksCommonDisplay.mirror-movement.name"),
		hint: i18n("MonksCommonDisplay.mirror-movement.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});

	game.settings.register(modulename, "mirror-token-selection", {
		name: i18n("MonksCommonDisplay.mirror-token-selection.name"),
		hint: i18n("MonksCommonDisplay.mirror-token-selection.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});

	/*
	game.settings.register(modulename, "show-mirror-tool", {
		name: i18n("MonksCommonDisplay.show-mirror-tool.name"),
		hint: i18n("MonksCommonDisplay.show-mirror-tool.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
	});*/
	game.settings.register(modulename, "show-chat-log", {
		name: i18n("MonksCommonDisplay.show-chat-log.name"),
		hint: i18n("MonksCommonDisplay.show-chat-log.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		onChange: () => {
			MonksCommonDisplay.toggleCommonDisplay();
		}
	});
	game.settings.register(modulename, "show-combat", {
		name: i18n("MonksCommonDisplay.show-combat.name"),
		hint: i18n("MonksCommonDisplay.show-combat.hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean,
		onChange: () => {
			MonksCommonDisplay.toggleCommonDisplay();
		}
	});

	game.settings.register(modulename, "allow-gm-players", {
		name: i18n("MonksCommonDisplay.allow-gm-players.name"),
		hint: i18n("MonksCommonDisplay.allow-gm-players.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean
	});

	game.settings.register(modulename, "show-combatants", {
		name: i18n("MonksCommonDisplay.show-combatants.name"),
		hint: i18n("MonksCommonDisplay.show-combatants.hint"),
		scope: "world",
		config: true,
		default: false,
		type: Boolean,
		onChange: () => {
			MonksCommonDisplay.toggleCommonDisplay();
		}
	});

	game.settings.register(modulename, "limit-shown", {
		name: i18n("MonksCommonDisplay.limit-shown.name"),
		scope: "world",
		config: true,
		range: {
			min: 1,
			max: 5,
			step: 1,
		},
		default: 1,
		type: Number,
		onChange: () => {
			MonksCommonDisplay.toggleCommonDisplay();
		}
	});

	game.settings.register(modulename, "startupdata", {
		name: '',
		hint: '',
		scope: "client",
		config: false,
		default: false,
		type: Boolean,
	});

	game.settings.register(modulename, "playerdata", {
		name: '',
		hint: '',
		scope: "world",
		config: false,
		default: {},
		type: Object,
	});
};
