import {Dialog} from "../../common"
import {revisionDialogTemplate} from "./templates"

export class RevisionDialog {
    constructor(dir) {
        this.dir = dir
        this.dialog = false
    }

    init() {
        const buttons = []
        const dialogDonePromise = new Promise(resolve => {
            buttons.push({
                text: gettext("Save"),
                classes: "fw-dark",
                click: () => {
                    const note =
                        this.dialog.dialogEl.querySelector(
                            ".revision-note"
                        ).value
                    this.dialog.close()
                    return resolve(note)
                }
            })

            buttons.push({
                type: "cancel"
            })
        })

        this.dialog = new Dialog({
            title: gettext("Revision description"),
            body: revisionDialogTemplate({dir: this.dir}),
            height: 100,
            width: 300,
            buttons,
            restoreActiveElement: false
        })
        this.dialog.open()

        return dialogDonePromise
    }
}
