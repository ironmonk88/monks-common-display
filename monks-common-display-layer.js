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

}