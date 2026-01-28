import JSZip from "jszip"

import {addAlert, findTarget, get, post, postJson, whenReady} from "../common"
import {updateFile} from "../importer/native/update"
import {FW_DOCUMENT_VERSION} from "../schema"
import {updateDoc} from "../schema/convert"

// To upgrade all docs and document revions to the newest version

export class DocMaintenance {
    constructor() {
        this.batch = 0
        this.revSavesLeft = 0
        this.docTemplatesSavesLeft = 0
    }

    init() {
        whenReady().then(() =>
            document.body.addEventListener("click", event => {
                const el = {}
                switch (true) {
                    case findTarget(event, "input#update:not(.disabled)", el):
                        document.querySelector("input#update").disabled = true
                        document.querySelector("input#update").value =
                            gettext("Updating...")
                        addAlert("info", gettext("Updating documents."))
                        this.getDocBatch()
                        break
                    default:
                        break
                }
            })
        )
    }

    getDocBatch() {
        this.batch++
        postJson("/api/document/admin/get_all_old/")
            .then(({json}) => {
                const docs = window.JSON.parse(json.docs)
                if (docs.length) {
                    addAlert(
                        "info",
                        `${gettext("Downloaded batch")}: ${this.batch}`
                    )
                    Promise.all(docs.map(doc => this.fixDoc(doc))).then(() =>
                        this.getDocBatch()
                    )
                } else {
                    if (this.batch > 1) {
                        addAlert("success", gettext("All documents updated!"))
                    } else {
                        addAlert("info", gettext("No documents to update."))
                    }
                    this.updateDocumentTemplates()
                }
            })
            .catch(error => {
                addAlert(
                    "error",
                    `${gettext("Could not download batch")}: ${this.batch}`
                )
                throw error
            })
    }

    fixDoc(doc) {
        const oldDoc = {
            content: doc.fields.content,
            diffs: doc.fields.diffs,
            bibliography: doc.fields.bibliography,
            comments: doc.fields.comments,
            title: doc.fields.title,
            version: doc.fields.version,
            id: doc.pk
        }
        const docVersion = Number.parseFloat(doc.fields.doc_version)
        let p
        if (docVersion < 2) {
            // In version 0 - 1.x, the bibliography had to be loaded from
            // the document user.

            p = postJson("/api/document/admin/get_user_biblist/", {
                user_id: doc.fields.owner
            }).then(({json}) => {
                return json.bibList.reduce((db, item) => {
                    const id = item["id"]
                    const bibDBEntry = {}
                    bibDBEntry["fields"] = JSON.parse(item["fields"])
                    bibDBEntry["bib_type"] = item["bib_type"]
                    bibDBEntry["entry_key"] = item["entry_key"]
                    db[id] = bibDBEntry
                    return db
                }, {})
            })
        } else {
            p = Promise.resolve(doc.bibliography)
        }
        return p.then(bibliography => {
            // updates doc to the newest version
            doc = updateDoc(oldDoc, docVersion, bibliography)
            return this.saveDoc(doc)
        })
    }

    saveDoc(doc) {
        const p1 = post("/api/document/admin/save_doc/", {
                id: doc.id,
                content: doc.content,
                bibliography: doc.bibliography,
                comments: doc.comments,
                version: doc.version,
                diffs: doc.diffs
            }),
            promises = [p1]
        if (doc.imageIds) {
            const p2 = post("/api/document/admin/add_images_to_doc/", {
                doc_id: doc.id,
                ids: doc.imageIds
            })
            promises.push(p2)
        }
        return Promise.all(promises).then(() => {
            addAlert(
                "success",
                `${gettext("The document has been updated")}: ${doc.id}`
            )
        })
    }

    updateDocumentTemplates() {
        addAlert("info", gettext("Updating document templates."))
        postJson("/api/document/admin/get_all_template_ids/").then(({json}) => {
            const count = json.template_ids.length
            if (count) {
                json.template_ids.forEach(templateId =>
                    this.updateDocumentTemplate(templateId)
                )
            } else {
                addAlert("info", gettext("No document templates to update."))
                this.updateRevisions()
            }
        })
    }

    updateDocumentTemplate(id) {
        postJson("/api/document/admin/get_template/base/", {id}).then(
            // The field 'content' of the document template module has the same
            // structure as the field 'contents' of the document module.
            // Therefore we can use the same update procedure for both of them.
            // We are creating a doc from the fields of the template to upgrade it.
            // Templates were introduced at doc version 3.0, so we don't need to consider
            // previous versions. Also, we can leave several fields empty as they are not
            // used for templates.
            ({json}) => {
                const oldDoc = {
                    content: json.content,
                    diffs: [],
                    bibliography: {},
                    comments: {},
                    title: json.title,
                    version: 1,
                    id
                }
                const docVersion = Number.parseFloat(json.doc_version)
                const doc = updateDoc(oldDoc, docVersion)
                this.saveDocumentTemplate(doc)
            }
        )
    }

    saveDocumentTemplate(doc) {
        this.docTemplatesSavesLeft++
        post("/api/document/admin/save_template/", {
            id: doc.id,
            content: doc.content
        }).then(() => {
            addAlert(
                "success",
                `${gettext("The document template has been updated")}: ${doc.id}`
            )
            this.docTemplatesSavesLeft--
            if (!this.docTemplatesSavesLeft) {
                addAlert("success", gettext("All document templates updated!"))
                this.updateRevisions()
            }
        })
    }

    updateRevisions() {
        addAlert("info", gettext("Updating saved revisions."))
        postJson("/api/document/admin/get_all_revision_ids/").then(({json}) => {
            this.revSavesLeft = json.revision_ids.length
            if (this.revSavesLeft) {
                json.revision_ids.forEach(revId => this.updateRevision(revId))
            } else {
                addAlert("info", gettext("No document revisions to update."))
                this.done()
            }
        })
    }

    updateRevision(id) {
        return get(`/api/document/get_revision/${id}/`)
            .then(response => response.blob())
            .then(blob => {
                const zipfs = new JSZip()
                return zipfs.loadAsync(blob).then(() => {
                    const openedFiles = {},
                        p = []
                    // We don't open other files as they currently don't need to be changed.
                    const fileNames = [
                        "filetype-version",
                        "document.json",
                        "bibliography.json"
                    ]

                    fileNames.forEach(fileName => {
                        p.push(
                            zipfs.files[fileName]
                                .async("text")
                                .then(fileContent => {
                                    openedFiles[fileName] = fileContent
                                })
                        )
                    })
                    return Promise.all(p).then(() => {
                        const filetypeVersion = Number.parseFloat(
                            openedFiles["filetype-version"]
                        )
                        const {bibliography, doc} = updateFile(
                            window.JSON.parse(openedFiles["document.json"]),
                            filetypeVersion,
                            window.JSON.parse(openedFiles["bibliography.json"])
                        )
                        zipfs.file("filetype-version", FW_DOCUMENT_VERSION)
                        zipfs.file("document.json", window.JSON.stringify(doc))
                        zipfs.file(
                            "bibliography.json",
                            window.JSON.stringify(bibliography)
                        )
                        this.saveRevision(id, zipfs)
                    })
                })
            })
    }

    saveRevision(id, zipfs) {
        zipfs
            .generateAsync({type: "blob", mimeType: "application/fidus+zip"})
            .then(blob => {
                post("/api/document/admin/update_revision/", {
                    id,
                    file: {
                        file: blob,
                        filename: "some_file.fidus"
                    }
                }).then(() => {
                    addAlert(
                        "success",
                        gettext("The document revision has been updated: ") + id
                    )
                    this.revSavesLeft--
                    if (this.revSavesLeft === 0) {
                        this.done()
                    }
                })
            })
    }

    done() {
        document.querySelector("input#update").value = gettext(
            "All documents, document templates and document revisions updated!"
        )
    }
}
