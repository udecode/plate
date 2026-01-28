import {addAlert, post} from "../../common"
import {createSlug} from "../tools/file"
import {ShrinkFidus} from "./shrink"
import {ZipFidus} from "./zip"

/** Create a Fidus Writer document and upload it to the server as a backup.
 * @function uploadNative
 * @param editor The editor from which to upload the document.
 */

export class SaveRevision {
    constructor(doc, imageDB, bibDB, note, app) {
        this.doc = doc
        this.imageDB = imageDB
        this.bibDB = bibDB
        this.note = note
        this.app = app
    }

    init() {
        const shrinker = new ShrinkFidus(this.doc, this.imageDB, this.bibDB)

        shrinker
            .init()
            .then(({shrunkImageDB, shrunkBibDB, httpIncludes}) => {
                const zipper = new ZipFidus(
                    this.doc.id,
                    this.doc,
                    shrunkImageDB,
                    shrunkBibDB,
                    httpIncludes
                )
                return zipper.init()
            })
            .then(blob => this.uploadRevision(blob))
            .catch(error => {
                addAlert(
                    "error",
                    gettext("Revision file could not be generated.")
                )
                if (this.app.isOffline()) {
                    addAlert(
                        "info",
                        gettext(
                            "You are currently offline. Please try again when you are back online."
                        )
                    )
                } else {
                    throw error
                }
            })
    }

    uploadRevision(blob) {
        post("/api/document/upload/", {
            note: this.note,
            file: {
                file: blob,
                filename: createSlug(this.doc.title) + ".fidus"
            },
            document_id: this.doc.id
        })
            .then(
                () => {
                    addAlert("success", gettext("Revision saved"))
                },
                () => {
                    addAlert("error", gettext("Revision could not be saved."))
                    if (this.app.isOffline()) {
                        addAlert(
                            "info",
                            gettext(
                                "You are currently offline. Please try again when you are back online."
                            )
                        )
                    }
                }
            )
            .catch(error => {
                throw error
            })
    }
}
