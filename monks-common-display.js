import { registerSettings } from "./settings.js";
import { ControllerApp } from "./apps/controller.js"
import { MonksCommonDisplayLayer } from './monks-common-display-layer.js';

export const DEBUG = false;

export let debug = (...args) => {
    if (DEBUG) console.log("DEBUG: monks-common-display | ", ...args);
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

function registerLayer() {
    CONFIG.Canvas.layers.MonksCommonDisplayLayer = MonksCommonDisplayLayer;
    CONFIG.MonksCommonDisplayLayer = {
        documentClass: null,
        layerClass: MonksCommonDisplayLayer,
        sheetClass: NoteConfig,
        objectClass: Note
    };
    /*
    const layers = mergeObject(Canvas.layers, {
        MonksCommonDisplayLayer: MonksCommonDisplayLayer
    });
    Object.defineProperty(Canvas, 'layers', {
        get: function () {
            return layers
        }
    });*/
}

export class MonksCommonDisplay {
    static playerdata = {};
    static init() {
        MonksCommonDisplay.SOCKET = "module.monks-common-display";

        registerSettings();
        //this is so the screen starts up with the correct information, it'll be altered once the players are actually loaded
        this.playerdata.display = setting('startupdata');
        MonksCommonDisplay.toggleCommonDisplay();

        registerLayer();
    }

    static ready() {
        //check to see if this is a display screen
        MonksCommonDisplay.dataChange();

        if (game.user.isGM) {
            MonksCommonDisplay.initGM();
            MonksCommonDisplay.registerHotKeys();
        }

        game.socket.on('module.monks-common-display', MonksCommonDisplay.onMessage); 
    }

    static dataChange() {
        let data = setting('playerdata');
        let olddata = MonksCommonDisplay.playerdata;
        MonksCommonDisplay.playerdata = data[game.user.id] || { display: false, mirror: false, selection: false };

        game.settings.set('monks-common-display', 'startupdata', MonksCommonDisplay.playerdata.display);

        if (olddata.display != MonksCommonDisplay.playerdata.display)
            MonksCommonDisplay.toggleCommonDisplay();

        // release all tokens on common display for easier sync
        if (MonksCommonDisplay.playerdata.display) {
            for (const token of game.canvas.tokens.controlled) {
                token.release();
            }
        }
    }

    static toggleCommonDisplay() {
        let display = MonksCommonDisplay.playerdata.display || false;
        $('body').toggleClass('hide-ui', display).toggleClass('hide-chat', display && !setting('show-chat-log'));
        if (display && ui.sidebar)
            ui.sidebar.activateTab('chat');

        //$('#sidebar').toggle(setting('show-chat-log') || !display);
    }

    static toggleMirrorScreen(checked) {
        if (checked == undefined)
            checked = !setting("mirror-movement");

        game.settings.set("monks-common-display", "mirror-movement", checked).then(() => {
            if (checked)
                MonksCommonDisplay.sendCanvasPan(canvas.scene._viewPosition);
            $('#controls li[data-tool="mirror-screen"]').toggleClass('active', setting("mirror-movement"));
        });
    }

    static toggleMirrorTokenSelection(checked) {
        if (checked == undefined)
            checked = !setting("mirror-token-selection");

        game.settings.set("monks-common-display", "mirror-token-selection", checked).then(() => {
            $('#controls li[data-tool="mirror-selection"]').toggleClass('active', setting("mirror-token-selection"));
        });
    }

    static registerHotKeys() {
        Hotkeys.registerGroup({
            name: 'monks-common-display.hotkeys',
            label: 'Monks Common Display',
            description: "Monk's Common Display Hotkeys"
        });

        Hotkeys.registerShortcut({
            name: `monks-common-display_mirror-screen`,
            label: `Toggle Mirror Screen`,
            group: 'monks-common-display.hotkeys',
            default: () => { return { key: Hotkeys.keys.KeyM, alt: false, ctrl: false, shift: false }; },
            onKeyDown: (e) => {
                MonksCommonDisplay.toggleMirrorScreen();
            }
        });

        Hotkeys.registerShortcut({
            name: `monks-common-display_mirror-selection`,
            label: `Toggle Mirror Token Selection`,
            group: 'monks-common-display.hotkeys',
            default: () => { return { key: Hotkeys.keys.KeyN, alt: false, ctrl: false, shift: false }; },
            onKeyDown: (e) => {
                MonksCommonDisplay.toggleMirrorTokenSelection();
            }
        });
    }

    static initGM() {
        Hooks.on("canvasPan", (canvas, data) => {
            MonksCommonDisplay.sendCanvasPan(data);
        });

        Hooks.on("controlToken", (token, control) => {
            MonksCommonDisplay.sendTokenSelection([token.data.actorId, control]);
        });

        //I've temporarily removed this as the app-id isn't the same
        /*
        Hooks.on("closeImagePopout", (popout, html) => {
            game.socket.emit(MonksCommonDisplay.SOCKET, { action: "closeImagePopout", args: [popout.appId] });
        });*/
    }

    static sendCanvasPan(data) {
        if (canvas.scene.active && setting("mirror-movement") && MonksCommonDisplay.isAnyDisplayPlayerLoggedIn()) {
            debug('pan data', data)
            game.socket.emit(MonksCommonDisplay.SOCKET, { action: "canvasPan", args: [data] });
        }
    }

    static sendTokenSelection(data) {
        if (canvas.scene.active && setting("mirror-token-selection") && MonksCommonDisplay.isAnyDisplayPlayerLoggedIn()) {
            debug('selection data', data);
            game.socket.emit(MonksCommonDisplay.SOCKET, { action: "controlToken", args: [data] });
        }
    }

    static isAnyDisplayPlayerLoggedIn() {
        for (let [k, v] of Object.entries(setting('playerdata'))) {
            if (v.display === true && game.users.get(k)?.active == true) {
                return true;
            }
        }

        return false;
    }

    static onMessage(data) {
        MonksCommonDisplay[data.action].apply(MonksCommonDisplay, data.args)
    }

    static closeImagePopout(id) {
        //check to see if this is a player, if this is and it currently applies to this user, then we need to clear all the potentially open windows
        let user = game.users.find(u => u.id == id);
        if (user || (id == undefined && MonksCommonDisplay.playerdata.display)) {
            $('.image-popout .header-button.close').click();
        }//else
        //    $('#app-' + id + ' .header-button.close').click(); //app-id isn't shared, I guess that should be obvious
    }

    static canvasPan(data) {
        if (MonksCommonDisplay.playerdata.display && MonksCommonDisplay.playerdata.mirror)
            canvas.pan(data);
    }

    static controlToken(data) {
        if (!MonksCommonDisplay.playerdata.display || !MonksCommonDisplay.playerdata.selection) {
            return;
        }

        const actor = game.actors.get(data[0]);

        if (actor.owner) {
            const tokens = actor.getActiveTokens();

            for (const token of tokens) {
                token.refresh();

                if (data[1]) {
                    token.control({ releaseOthers: false });
                } else {
                    token.release();
                }
            }
        }
    }
}

Hooks.on('init', () => {
    MonksCommonDisplay.init();
});

Hooks.on('ready', () => {
    MonksCommonDisplay.ready();
});

Hooks.on("updateCombat", function (combat, delta) {
    if (MonksCommonDisplay.playerdata.display && setting("show-combat") && delta.round === 1 && combat.turn === 0 && combat.started === true) {
        //new combat, pop it out
        const tabApp = ui["combat"];
        tabApp.renderPopout(tabApp);

        if (ui.sidebar.activeTab !== "chat")
            ui.sidebar.activateTab("chat");
    }
});

Hooks.on("deleteCombat", function (combat) {
    if (MonksCommonDisplay.playerdata.display && game.combats.combats.length == 0 && setting("show-combat")) {
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

/*
Hooks.on("getSceneControlButtons", (controls) => {
    if (game.settings.get('monks-common-display', 'show-mirror-tool')) {
        const mirrorPanTool = {
            name: "mirror-screen",
            title: "MonksCommonDisplay.mirror-screen",
            icon: "fas fa-people-arrows",
            toggle: true,
            active: setting('mirror-movement'),
            onClick: MonksCommonDisplay.toggleMirrorScreen
        };
        let tokenTools = controls.find(control => control.name === "token").tools;
        tokenTools.push(mirrorPanTool);
    }
});*/

Hooks.on('getSceneControlButtons', (controls) => {
    controls.push({
        name: 'monkscommondisplay',
        title: "Monks Common Display",
        icon: 'fas fa-chalkboard-teacher',
        visible: game.user.isGM,
        layer: "MonksCommonDisplayLayer",
        tools: [
            {
                name: 'controller',
                title: "MonksCommonDisplay.change-settings",
                icon: 'fas fa-chalkboard',
                onClick: () => { new ControllerApp().render(true); }
            },
            {
                name: "clear-images",
                title: "MonksCommonDisplay.clear-images",
                icon: "fas fa-portrait",
                onClick: () => { game.socket.emit(MonksCommonDisplay.SOCKET, { action: "closeImagePopout", args: [] }); }
            },
            {
                name: "mirror-screen",
                title: "MonksCommonDisplay.mirror-screen",
                icon: "fas fa-people-arrows",
                toggle: true,
                active: setting('mirror-movement'),
                onClick: MonksCommonDisplay.toggleMirrorScreen
            },
            {
                name: "mirror-selection",
                title: "MonksCommonDisplay.mirror-selection",
                icon: "far fa-object-group",
                toggle: true,
                active: setting('mirror-token-selection'),
                onClick: MonksCommonDisplay.toggleMirrorTokenSelection
            }
        ]
    });
});
