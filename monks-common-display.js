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
    static _isDisplay = false;
    static init() {
        MonksCommonDisplay.SOCKET = "module.monks-common-display";

        registerSettings();
    }

    static ready() {
        //check to see if this is a display screen
        let displays = setting('display-players').split(',');
        MonksCommonDisplay._isDisplay = (displays.includes(game.user.name));

        if (MonksCommonDisplay.isDisplay)
            MonksCommonDisplay.toggleCommonDisplay();

        if (game.user.isGM)
            MonksCommonDisplay.initGM();

        if (game.user.isGM || MonksCommonDisplay.isDisplay) {
            game.socket.on('module.monks-common-display', MonksCommonDisplay.onMessage);
        }
    }

    static get isDisplay() {
        return MonksCommonDisplay._isDisplay;
    }

    static toggleCommonDisplay() {
        $('body').toggleClass('hide-ui');
        ui.sidebar.activateTab('chat');

        Hooks.on("updateCombat", function (combat, delta) {
            if (setting("show-combat") && delta.round === 1 && combat.turn === 0 && combat.started === true) {
                //new combat, pop it out
                const tabApp = ui["combat"];
                tabApp.renderPopout(tabApp);

                if (ui.sidebar.activeTab !== "chat")
                    ui.sidebar.activateTab("chat");
            }
        });

        Hooks.on("deleteCombat", function (combat) {
            if (game.combats.combats.length == 0 && setting("show-combat")) {
                const tabApp = ui["combat"];
                if (tabApp._popout != undefined) {
                    MonksCommonDisplay.closeCount = 0;
                    MonksCommonDisplay.closeTimer = setInterval(function () {
                        MonksCommonDisplay.closeCount++;
                        const tabApp = ui["combat"];
                        if (MonksCommonDisplay.closeCount > 100 || tabApp._popout == undefined) {
                            clearInterval(MonksCommonDisplay.closeTimer);
                            return;
                        }

                        const states = tabApp?._popout.constructor.RENDER_STATES;
                        if (![states.CLOSING, states.RENDERING].includes(tabApp?._popout._state)) {
                            tabApp?._popout.close();
                            clearInterval(MonksCommonDisplay.closeTimer);
                        }
                    }, 100);
                }
            }
        });
    }

    static initGM() {
        Hooks.on("canvasPan", (canvas, data) => {
            if (canvas.scene.active) {
                game.socket.emit(MonksCommonDisplay.SOCKET, { action: "canvasPan", args: [data] });
            }
        });

        Hooks.on("closeImagePopout", (popout, html) => {
            game.socket.emit(MonksCommonDisplay.SOCKET, { action: "closeImagePopout", args: [popout.appId] });
        });
    }

    static onMessage(data) {
        MonksCommonDisplay[data.action].apply(MonksCommonDisplay, data.args)
    }

    static closeImagePopout(id) {
        $('#app-' + id + ' .header-button.close').click();
    }

    static canvasPan(data) {
        canvas.pan(data);
    }
}

Hooks.on('init', () => {
    MonksCommonDisplay.init();
});

Hooks.on('ready', () => {
    MonksCommonDisplay.ready();
});



