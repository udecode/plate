import {
    Dialog,
    activateWait,
    addAlert,
    deactivateWait,
    escapeText,
    longFilePath,
    postJson
} from "../../common"
import {ExportFidusFile, SaveCopy} from "../../exporter/native"
import {FidusFileImporter} from "../../importer/native"
import {importerRegistry} from "../../importer/register"
import {DocumentRevisionsDialog} from "../revisions"
import {getMissingDocumentListData} from "../tools"
import {importFidusTemplate} from "./templates"

export class DocumentOverviewActions {
    constructor(documentOverview) {
        documentOverview.mod.actions = this
        this.documentOverview = documentOverview
    }

    deleteDocument(id) {
        const doc = this.documentOverview.documentList.find(
            doc => doc.id === id
        )
        if (!doc) {
            return Promise.resolve()
        }
        return postJson("/api/document/delete/", {id}).then(({json}) => {
            if (json.done) {
                addAlert(
                    "success",
                    `${gettext("Document has been deleted")}: '${longFilePath(doc.title, doc.path)}'`
                )
                this.documentOverview.documentList =
                    this.documentOverview.documentList.filter(
                        doc => doc.id !== id
                    )
                this.documentOverview.initTable()
            } else {
                addAlert(
                    "error",
                    `${gettext("Could not delete document")}: '${longFilePath(doc.title, doc.path)}'`
                )
            }
        })
    }

    deleteDocumentDialog(ids, app) {
        if (app.isOffline()) {
            addAlert(
                "info",
                gettext("You cannot delete a document while you are offline.")
            )
            return
        }
        const docPaths = ids.map(id => {
            const doc = this.documentOverview.documentList.find(
                doc => doc.id === id
            )
            return escapeText(longFilePath(doc.title, doc.path))
        })
        const confirmDeletionDialog = new Dialog({
            title: gettext("Confirm deletion"),
            body: `<p>
                ${
                    ids.length > 1
                        ? gettext(
                              "Do you really want to delete the following documents?"
                          )
                        : gettext(
                              "Do you really want to delete the following document?"
                          )
                }
                </p>
                <p>
                ${docPaths.join("<br>")}
                </p>`,
            id: "confirmdeletion",
            icon: "exclamation-triangle",
            buttons: [
                {
                    text: gettext("Delete"),
                    classes: "fw-dark",
                    height: Math.min(50 + 15 * ids.length, 500),
                    click: () => {
                        Promise.all(
                            ids.map(id => this.deleteDocument(id))
                        ).then(() => {
                            confirmDeletionDialog.close()
                            this.documentOverview.initTable()
                        })
                    }
                },
                {
                    type: "cancel"
                }
            ]
        })

        confirmDeletionDialog.open()
    }

    importFidus() {
        const buttons = [
            {
                text: gettext("Import"),
                classes: "fw-dark",
                click: () => {
                    let fidusFile =
                        document.getElementById("fidus-uploader").files
                    if (0 === fidusFile.length) {
                        return false
                    }
                    fidusFile = fidusFile[0]
                    if (104857600 < fidusFile.size) {
                        //TODO: This is an arbitrary size. What should be done with huge import files?
                        return false
                    }
                    activateWait()

                    const importer = new FidusFileImporter(
                        fidusFile,
                        this.documentOverview.user,
                        this.documentOverview.path,
                        true,
                        this.documentOverview.contacts
                    )

                    importer
                        .init()
                        .then(({ok, statusText, doc}) => {
                            deactivateWait()
                            if (ok) {
                                addAlert("info", statusText)
                            } else {
                                addAlert("error", statusText)
                                return
                            }
                            this.documentOverview.documentList.push(doc)
                            this.documentOverview.initTable()
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
            id: "importfidus",
            title: gettext("Import a Fidus file"),
            body: importFidusTemplate(),
            height: 100,
            buttons
        })
        importDialog.open()

        document
            .getElementById("fidus-uploader")
            .addEventListener("change", () => {
                document.getElementById("import-fidus-name").innerHTML =
                    document
                        .getElementById("fidus-uploader")
                        .value.replace(/C:\\fakepath\\/i, "")
            })

        document
            .getElementById("import-fidus-btn")
            .addEventListener("click", event => {
                document.getElementById("fidus-uploader").click()
                event.preventDefault()
            })
    }

    importExternal() {
        const importIds = Object.keys(this.documentOverview.documentTemplates)
        let importId = importIds[0] // Default to first template

        const templateSelector =
            importIds.length > 1
                ? `<label for="import-template-selector">${gettext("Import as:")}</label>
                <div class="fw-select-container">
                    <select class="fw-button fw-light fw-large" id="import-template-selector">
                        ${Object.entries(
                            this.documentOverview.documentTemplates
                        )
                            .map(
                                ([key, template]) =>
                                    `<option value="${escapeText(key)}">${escapeText(template.title)}</option>`
                            )
                            .join("")}
                    </select>
                    <div class="fw-select-arrow fa fa-caret-down"></div>
                </div>`
                : ""

        const buttons = [
            {
                text: gettext("Import"),
                classes: "fw-dark",
                click: () => {
                    let file =
                        document.getElementById("external-uploader").files
                    if (0 === file.length) {
                        return false
                    }
                    file = file[0]
                    if (104857600 < file.size) {
                        addAlert("error", gettext("File too large"))
                        return false
                    }

                    if (file.type === "application/zip") {
                        return import("jszip").then(({default: JSZip}) => {
                            return JSZip.loadAsync(file).then(zip => {
                                const importerInfo =
                                    importerRegistry.getZipImporter(zip)

                                if (!importerInfo) {
                                    addAlert(
                                        "error",
                                        gettext(
                                            "No importable files found in ZIP"
                                        )
                                    )
                                    return false
                                }

                                activateWait()

                                return importerInfo
                                    .getContents()
                                    .then(files => {
                                        const importer =
                                            new importerInfo.importer(
                                                files.mainContent,
                                                this.documentOverview.user,
                                                this.documentOverview.path,
                                                importId,
                                                files
                                            )

                                        return importer
                                            .init()
                                            .then(({ok, statusText, doc}) => {
                                                deactivateWait()
                                                if (ok) {
                                                    addAlert("info", statusText)
                                                } else {
                                                    addAlert(
                                                        "error",
                                                        statusText
                                                    )
                                                    return
                                                }
                                                this.documentOverview.documentList.push(
                                                    doc
                                                )
                                                this.documentOverview.initTable()
                                                importDialog.close()
                                            })
                                    })
                                    .catch(_error => {
                                        deactivateWait()
                                    })
                            })
                        })
                    }

                    // Get file extension
                    const fileExtension = file.name
                        .split(".")
                        .pop()
                        .toLowerCase()
                    const importerInfo =
                        importerRegistry.getImporter(fileExtension)

                    if (!importerInfo) {
                        addAlert("error", gettext("Unsupported file format"))
                        return false
                    }

                    // Get selected template if multiple templates exist
                    if (importIds.length > 1) {
                        importId = document.getElementById(
                            "import-template-selector"
                        ).value
                    }

                    activateWait()

                    const importer = new importerInfo.importer(
                        file,
                        this.documentOverview.user,
                        this.documentOverview.path,
                        importId
                    )

                    importer
                        .init()
                        .then(({ok, statusText, doc}) => {
                            deactivateWait()
                            if (ok) {
                                addAlert("info", statusText)
                            } else {
                                addAlert("error", statusText)
                                return
                            }
                            this.documentOverview.documentList.push(doc)
                            this.documentOverview.initTable()
                            importDialog.close()
                        })
                        .catch(() => false)
                }
            },
            {
                type: "cancel"
            }
        ]
        const supportedDescriptions = Object.entries(
            importerRegistry.getAllDescriptions()
        )
            .map(
                ([description, extensions]) =>
                    `${description} (${extensions.join(", ")})`
            )
            .join("<br>")
        const supportedFormats = importerRegistry.getAllFormats()

        const importDialog = new Dialog({
            id: "import_external",
            title: gettext("Import a text document in a different format"),
            body: `
            <form>
                ${templateSelector}
                <div class="fw-select-container">
                    <div class="fw-select-head">
                        <button type="button" class="fw-button fw-light fw-large" id="import-external-btn">
                            ${gettext("Select a file")}
                        </button>
                        <label id="import-external-name" class="ajax-upload-label"></label>
                    </div>
                    <input id="external-uploader" type="file" accept="${supportedFormats.map(format => `.${format}`).join(",")},.zip" style="display: none;">
                </div>
            </form>
            <div class="noteEl">${gettext("Supported formats")}:</div>
            <div class="noteEl">${supportedDescriptions}</div>
            <div class="noteEl">${gettext("You can also upload a ZIP file that contains one file in any of these formats as well as images and/or bibtex file.")}</div>`,
            height:
                (importIds.length > 1 ? 250 : 200) +
                supportedFormats.length * 12,
            buttons
        })
        importDialog.open()

        document
            .getElementById("external-uploader")
            .addEventListener("change", () => {
                document.getElementById("import-external-name").innerHTML =
                    document
                        .getElementById("external-uploader")
                        .value.replace(/C:\\fakepath\\/i, "")
            })

        document
            .getElementById("import-external-btn")
            .addEventListener("click", event => {
                document.getElementById("external-uploader").click()
                event.preventDefault()
            })
    }

    copyFiles(ids) {
        getMissingDocumentListData(
            ids,
            this.documentOverview.documentList,
            this.documentOverview.schema
        ).then(() => {
            ids.forEach(id => {
                const doc = this.documentOverview.documentList.find(
                    entry => entry.id === id
                )
                const copier = new SaveCopy(
                    doc,
                    {db: doc.bibliography},
                    {db: doc.images},
                    this.documentOverview.user
                )

                copier
                    .init()
                    .then(({doc}) => {
                        this.documentOverview.documentList.push(doc)
                        this.documentOverview.initTable()
                    })
                    .catch(() => false)
            })
        })
    }

    copyFilesAs(ids) {
        getMissingDocumentListData(
            ids,
            this.documentOverview.documentList,
            this.documentOverview.schema
        ).then(() => {
            const selectTemplateDialog = new Dialog({
                title: gettext("Choose document template"),
                body: `<p>
                        ${ids.length > 1 ? gettext("Select document template for copies") : gettext("Select document template for copy.")}
                        </p>
                        <select class="fw-button fw-large fw-light">${Object.entries(
                            this.documentOverview.documentTemplates
                        )
                            .map(
                                ([importId, dt]) =>
                                    `<option value="${escapeText(importId)}">${escapeText(dt.title)}</option>`
                            )
                            .join("")}</select>`,
                buttons: [
                    {
                        text: gettext("Copy"),
                        classes: "fw-dark",
                        click: () => {
                            ids.forEach(id => {
                                const doc =
                                    this.documentOverview.documentList.find(
                                        entry => entry.id === id
                                    )
                                const copier = new SaveCopy(
                                    doc,
                                    {db: doc.bibliography},
                                    {db: doc.images},
                                    this.documentOverview.user,
                                    selectTemplateDialog.dialogEl.querySelector(
                                        "select"
                                    ).value
                                )

                                copier
                                    .init()
                                    .then(({doc}) => {
                                        this.documentOverview.documentList.push(
                                            doc
                                        )
                                        this.documentOverview.initTable()
                                    })
                                    .catch(() => false)
                            })
                            selectTemplateDialog.close()
                        }
                    },
                    {
                        type: "cancel"
                    }
                ]
            })
            selectTemplateDialog.open()
        })
    }

    downloadNativeFiles(ids) {
        getMissingDocumentListData(
            ids,
            this.documentOverview.documentList,
            this.documentOverview.schema
        ).then(() =>
            ids.forEach(id => {
                const doc = this.documentOverview.documentList.find(
                    entry => entry.id === id
                )
                new ExportFidusFile(
                    doc,
                    {db: doc.bibliography},
                    {db: doc.images}
                )
            })
        )
    }

    downloadSlimNativeFiles(ids) {
        getMissingDocumentListData(
            ids,
            this.documentOverview.documentList,
            this.documentOverview.schema
        ).then(() =>
            ids.forEach(id => {
                const doc = this.documentOverview.documentList.find(
                    entry => entry.id === id
                )
                new ExportFidusFile(
                    doc,
                    {db: doc.bibliography},
                    {db: doc.images},
                    false
                )
            })
        )
    }

    downloadHTMLFiles(ids) {
        getMissingDocumentListData(
            ids,
            this.documentOverview.documentList,
            this.documentOverview.schema
        ).then(() =>
            ids.forEach(id => {
                const doc = this.documentOverview.documentList.find(
                    entry => entry.id === id
                )
                import("../../exporter/html").then(({HTMLExporter}) => {
                    const exporter = new HTMLExporter(
                        doc,
                        {db: doc.bibliography},
                        {db: doc.images},
                        this.documentOverview.app.csl,
                        new Date(doc.updated * 1000),
                        this.documentOverview.documentStyles
                    )
                    exporter.init()
                })
            })
        )
    }

    downloadTemplateExportFiles(ids, templateUrl, templateType) {
        getMissingDocumentListData(
            ids,
            this.documentOverview.documentList,
            this.documentOverview.schema
        ).then(() => {
            ids.forEach(id => {
                const doc = this.documentOverview.documentList.find(
                    entry => entry.id === id
                )
                if (templateType === "docx") {
                    import("../../exporter/docx").then(({DOCXExporter}) => {
                        const exporter = new DOCXExporter(
                            doc,
                            templateUrl,
                            {db: doc.bibliography},
                            {db: doc.images},
                            this.documentOverview.app.csl
                        )
                        exporter.init()
                    })
                } else {
                    import("../../exporter/odt").then(({ODTExporter}) => {
                        const exporter = new ODTExporter(
                            doc,
                            templateUrl,
                            {db: doc.bibliography},
                            {db: doc.images},
                            this.documentOverview.app.csl
                        )
                        exporter.init()
                    })
                }
            })
        })
    }

    downloadLatexFiles(ids) {
        getMissingDocumentListData(
            ids,
            this.documentOverview.documentList,
            this.documentOverview.schema
        ).then(() =>
            ids.forEach(id => {
                const doc = this.documentOverview.documentList.find(
                    entry => entry.id === id
                )
                import("../../exporter/latex").then(({LatexExporter}) => {
                    const exporter = new LatexExporter(
                        doc,
                        {db: doc.bibliography},
                        {db: doc.images},
                        new Date(doc.updated * 1000)
                    )
                    exporter.init()
                })
            })
        )
    }

    downloadJATSFiles(ids) {
        getMissingDocumentListData(
            ids,
            this.documentOverview.documentList,
            this.documentOverview.schema
        ).then(() =>
            ids.forEach(id => {
                const doc = this.documentOverview.documentList.find(
                    entry => entry.id === id
                )
                import("../../exporter/jats").then(({JATSExporter}) => {
                    const exporter = new JATSExporter(
                        doc,
                        {db: doc.bibliography},
                        {db: doc.images},
                        this.documentOverview.app.csl,
                        new Date(doc.updated * 1000),
                        "article"
                    )
                    exporter.init()
                })
            })
        )
    }

    downloadBITSFiles(ids) {
        getMissingDocumentListData(
            ids,
            this.documentOverview.documentList,
            this.documentOverview.schema
        ).then(() =>
            ids.forEach(id => {
                const doc = this.documentOverview.documentList.find(
                    entry => entry.id === id
                )
                import("../../exporter/jats").then(({JATSExporter}) => {
                    const exporter = new JATSExporter(
                        doc,
                        {db: doc.bibliography},
                        {db: doc.images},
                        this.documentOverview.app.csl,
                        new Date(doc.updated * 1000),
                        "book-part-wrapper"
                    )
                    exporter.init()
                })
            })
        )
    }

    downloadEpubFiles(ids) {
        getMissingDocumentListData(
            ids,
            this.documentOverview.documentList,
            this.documentOverview.schema
        ).then(() =>
            ids.forEach(id => {
                const doc = this.documentOverview.documentList.find(
                    entry => entry.id === id
                )
                import("../../exporter/epub").then(({EpubExporter}) => {
                    const exporter = new EpubExporter(
                        doc,
                        {db: doc.bibliography},
                        {db: doc.images},
                        this.documentOverview.app.csl,
                        new Date(doc.updated * 1000),
                        this.documentOverview.documentStyles
                    )
                    exporter.init()
                })
            })
        )
    }

    revisionsDialog(documentId, app) {
        if (app.isOffline()) {
            addAlert(
                "info",
                gettext(
                    "You cannot view the revision history of a document while you are offline."
                )
            )
            return
        }
        const revDialog = new DocumentRevisionsDialog(
            documentId,
            this.documentOverview.documentList,
            this.documentOverview.user
        )
        revDialog.init().then(actionObject => {
            switch (actionObject.action) {
                case "added-document":
                    this.documentOverview.documentList.push(actionObject.doc)
                    this.documentOverview.initTable()
                    break
                case "deleted-revision":
                    actionObject.doc.revisions =
                        actionObject.doc.revisions.filter(
                            rev => rev.pk !== actionObject.id
                        )
                    this.documentOverview.initTable()
                    break
            }
        })
    }
}
