import { MonksCommonDisplay, log, i18n, setting } from "../monks-common-display.js";

export class ControllerApp extends Application {
    constructor(options = {}) {
        super(options);
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "monkscommondisplay",
            title: "Monks Common Display",
            template: "./modules/monks-common-display/templates/controller.html",
            width: 600,
            height: 400,
            popOut: true
        });
    }

    getData(options) {
        let playerdata = setting('playerdata');
        let players = game.users.filter(u =>
            (setting('allow-gm-players') ? u.id != game.user.id && u.role < CONST.USER_ROLES.GAMEMASTER : !u.isGM))
            .map(u => {
                let data = playerdata[u.id] || {};
                return mergeObject({
                    id: u.id,
                    name: u.name,
                    img: u.avatar,
                    display: false,
                    mirror: false,
                    selection: false
                }, data);
            });

        return {
            players: players
        };
    }

    saveData() {
        let playerdata = setting('playerdata');
        $('.item-list .item', this.element).each(function () {
            let id = this.dataset.itemId;
            let data = playerdata[id] || {};

            data.display = $('.display', this).is(':checked');
            data.mirror = $('.mirror', this).is(':checked');
            data.selection = $('.selection', this).is(':checked');

            playerdata[id] = data;
        });

        game.settings.set('monks-common-display', 'playerdata', playerdata).then(() => {
            game.socket.emit(MonksCommonDisplay.SOCKET, { action: "dataChange", args: [] });
        });

        this.close();
    }

    clearWindows(event) {
        //find the player
        let id = $(event.currentTarget).parents('.item').get(0).dataset.itemId;
        //send them a request to clear windows
        game.socket.emit(MonksCommonDisplay.SOCKET, { action: "closeImagePopout", args: [id] });
    }

    activateListeners(html) {
        super.activateListeners(html);
        var that = this;

        $('.dialog-buttons.save', html).click($.proxy(this.saveData, this));
        $('.item-control.clear', html).click($.proxy(this.clearWindows, this));
    };
}