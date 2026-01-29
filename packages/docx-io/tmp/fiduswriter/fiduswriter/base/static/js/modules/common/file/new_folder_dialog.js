import {Dialog} from "../../common"
import {newFolderTemplate} from "./templates"

export class NewFolderDialog {
    constructor(callback = _foldername => {}) {
        this.callback = callback
        this.dialog = new Dialog({
            title: gettext("New folder"),
            id: "new-folder",
            width: 400,
            height: 150,
            body: newFolderTemplate(),
            buttons: [
                {type: "cancel"},
                {
                    text: gettext("Create folder"),
                    classes: "fw-dark",
                    click: () => {
                        const folderName =
                            this.dialog.dialogEl.querySelector(
                                "#new-folder-name"
                            ).value
                        this.dialog.close()
                        if (!folderName.length) {
                            return
                        }
                        this.callback(folderName)
                    }
                }
            ]
        })
    }

    open() {
        return this.dialog.open()
    }
}
