export class MonksCommonDisplayLayer extends PlaceablesLayer {
    constructor() {
        super();
    }

    static get layerOptions() {
        return mergeObject(super.layerOptions, {
            objectClass: Note,
            sheetClass: NoteConfig,
            canDragCreate: false,
            zIndex: 180
        });
    }

    static documentName = "MonksCommonDisplayLayer";

    async draw() {
        //don't draw anything, it's not that kind of layer
    }

    acivate() {
        //don't activate anything, it's not that kind of layer
    }

    deactivate() {
        //don't deactivate anything, it's not that kind of layer
    }
}