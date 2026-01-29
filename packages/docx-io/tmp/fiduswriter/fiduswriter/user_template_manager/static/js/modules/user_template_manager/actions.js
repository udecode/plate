import {
    Dialog,
    activateWait,
    addAlert,
    deactivateWait,
    postJson
} from "../common"
import {
    DocumentTemplateExporter,
    DocumentTemplateImporter
} from "../document_template"

import {importFidusTemplateTemplate} from "./templates"

export class DocTemplatesActions {
    constructor(docTemplatesOverview) {
        docTemplatesOverview.mod.actions = this
        this.docTemplatesOverview = docTemplatesOverview
    }

    deleteDocTemplate(id) {
        const docTemplate = this.docTemplatesOverview.templateList.find(
            docTemplate => docTemplate.id === id
        )
        if (!docTemplate) {
            return
        }

        postJson("/api/user_template_manager/delete/", {id})
            .catch(error => {
                addAlert(
                    "error",
                    `${gettext("Could not delete document template")}: '${docTemplate.title}'`
                )
                throw error
            })
            .then(({json}) => {
                if (json.done) {
                    addAlert(
                        "success",
                        `${gettext("Document template successfully deleted")}: '${docTemplate.title}'`
                    )
                    this.docTemplatesOverview.removeTableRows([id])
                    this.docTemplatesOverview.templateList =
                        this.docTemplatesOverview.templateList.filter(
                            docTemplate => docTemplate.id !== id
                        )
                } else {
                    addAlert(
                        "error",
                        `${gettext("Document template still required by documents")}: '${docTemplate.title}'`
                    )
                }
            })
    }

    deleteDocTemplatesDialog(ids) {
        const buttons = [
            {
                text: gettext("Delete"),
                classes: "fw-dark",
                click: () => {
                    ids.forEach(id =>
                        this.deleteDocTemplate(Number.parseInt(id))
                    )
                    dialog.close()
                }
            },
            {
                type: "close"
            }
        ]

        const dialog = new Dialog({
            title: gettext("Confirm deletion"),
            id: "confirmdeletion",
            icon: "exclamation-triangle",
            body: `<p>${ids.length > 1 ? gettext("Delete the document templates?") : gettext("Delete the document template?")}</p>`,
            buttons
        })
        dialog.open()
    }

    copyDocTemplate(oldDocTemplate) {
        return postJson("/api/user_template_manager/copy/", {
            id: oldDocTemplate.id,
            title: `${gettext("Copy of")} ${oldDocTemplate.title}`
        })
            .catch(error => {
                addAlert(
                    "error",
                    gettext("The document template could not be copied")
                )
                throw error
            })
            .then(({json}) => {
                const docTemplate = JSON.parse(JSON.stringify(oldDocTemplate))
                docTemplate.is_owner = true
                docTemplate.id = json["id"]
                docTemplate.title = json["title"]
                this.docTemplatesOverview.templateList.push(docTemplate)
                this.docTemplatesOverview.addDocTemplateToTable(docTemplate)
            })
    }

    downloadDocTemplate(id) {
        const exporter = new DocumentTemplateExporter(
            id,
            "/api/user_template_manager/get/"
        )
        exporter.init()
    }

    uploadDocTemplate() {
        const buttons = [
            {
                text: gettext("Import"),
                classes: "fw-dark",
                click: () => {
                    let fidusTemplateFile = document.getElementById(
                        "fidus-template-uploader"
                    ).files
                    if (0 === fidusTemplateFile.length) {
                        return false
                    }
                    fidusTemplateFile = fidusTemplateFile[0]
                    if (104857600 < fidusTemplateFile.size) {
                        //TODO: This is an arbitrary size. What should be done with huge import files?
                        return false
                    }
                    activateWait()

                    const importer = new DocumentTemplateImporter(
                        fidusTemplateFile,
                        "/api/user_template_manager/create/"
                    )

                    importer
                        .init()
                        .then(({ok, statusText, docTemplate}) => {
                            deactivateWait()
                            if (ok) {
                                addAlert("info", statusText)
                            } else {
                                addAlert("error", statusText)
                                return
                            }

                            docTemplate.is_owner = true

                            this.docTemplatesOverview.templateList.push(
                                docTemplate
                            )
                            this.docTemplatesOverview.addDocTemplateToTable(
                                docTemplate
                            )
                            importDialog.close()
                        })
                        .catch(() => false)
                }
            },
            {
                type: "cancel"
            }
        ]
        const importDialog = new Dialog({
            id: "importfidustemplate",
            title: gettext("Import a Fidus Template file"),
            body: importFidusTemplateTemplate(),
            height: 100,
            buttons
        })
        importDialog.open()

        document
            .getElementById("fidus-template-uploader")
            .addEventListener("change", () => {
                document.getElementById(
                    "import-fidus-template-name"
                ).innerHTML = document
                    .getElementById("fidus-template-uploader")
                    .value.replace(/C:\\fakepath\\/i, "")
            })

        document
            .getElementById("import-fidus-template-btn")
            .addEventListener("click", event => {
                document.getElementById("fidus-template-uploader").click()
                event.preventDefault()
            })
    }
}
