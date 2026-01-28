import {Dialog, activateWait, addAlert, deactivateWait} from "../../common"
import {importBibFileTemplate} from "./templates"
/** First step of the BibTeX file import. Creates a dialog box to specify upload file.
 */

export class BibLatexFileImportDialog {
    constructor(bibDB, addToListCall, app) {
        this.bibDB = bibDB
        this.addToListCall = addToListCall
        this.tmpDB = false
        this.app = app
    }

    init() {
        if (this.app.isOffline()) {
            addAlert(
                "info",
                gettext(
                    "You are currently offline. Please try again when you are back online."
                )
            )
            return
        }
        const buttons = [
            {
                text: gettext("Import"),
                classes: "fw-dark submit-import",
                click: () => {
                    let bibFile = document.getElementById("bib-uploader").files
                    if (0 === bibFile.length) {
                        return false
                    }
                    bibFile = bibFile[0]
                    if (10485760 < bibFile.size) {
                        return false
                    }
                    if (this.app.isOffline()) {
                        addAlert(
                            "info",
                            gettext(
                                "You are currently offline. Please try again when you are back online."
                            )
                        )
                        dialog.close()
                        return false
                    }
                    activateWait()
                    const reader = new window.FileReader()
                    reader.onload = event => {
                        import("./biblatex").then(({BibLatexImporter}) => {
                            const importer = new BibLatexImporter(
                                event.target.result,
                                this.bibDB,
                                this.addToListCall,
                                () => deactivateWait()
                            )
                            importer.init()
                        })
                    }
                    reader.readAsText(bibFile)
                    dialog.close()
                }
            },
            {
                type: "cancel"
            }
        ]
        const dialog = new Dialog({
            id: "importbibtex",
            title: gettext("Import a BibTex library"),
            body: importBibFileTemplate(),
            height: 180,
            buttons
        })
        dialog.open()
        document
            .getElementById("bib-uploader")
            .addEventListener(
                "change",
                () =>
                    (document.getElementById("import-bib-name").innerHTML =
                        document
                            .getElementById("bib-uploader")
                            .value.replace(/C:\\fakepath\\/i, ""))
            )
        document
            .getElementById("import-bib-btn")
            .addEventListener("click", () =>
                document.getElementById("bib-uploader").click()
            )
    }
}
