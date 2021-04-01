import { registerSettings } from "./settings.js";

export let debug = (...args) => {
    if (debugEnabled > 1) console.log("DEBUG: monks-common-display | ", ...args);
};
export let log = (...args) => console.log("monks-common-display | ", ...args);
export let warn = (...args) => console.warn("monks-common-display | ", ...args);
export let error = (...args) => console.error("monks-common-display | ", ...args);
export let i18n = key => {
    return game.i18n.localize(key);
};
export let setting = key => {
    return game.settings.get("monks-common-display", key);
};
export let combatposition = () => {
    return game.settings.get("monks-common-display", "combat-position");
};

export class MonksCommonDisplay {
}

Hooks.on('ready', () => {
    $('#logo').on('click', function () {
        $('body').toggleClass('hide-ui');
    });
})

