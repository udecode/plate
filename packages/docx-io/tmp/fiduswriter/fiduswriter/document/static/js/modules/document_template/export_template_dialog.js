import JSZip from "jszip"
import {Dialog, escapeText, findTarget, get, postJson} from "../common"

export class ExportTemplateDialog {
    constructor(
        id,
        template,
        documentTemplateId,
        allTemplates,
        refresh,
        documentTemplateValue
    ) {
        this.id = id
        this.template = template
        this.documentTemplateId = documentTemplateId
        this.allTemplates = allTemplates
        this.refresh = refresh
        this.documentTemplateValue = documentTemplateValue
        this.addedFile = false
        this.addedFileType = false
    }

    init() {
        const buttons = [
            {
                text: gettext("Save"),
                classes: "fw-dark",
                click: () => {
                    const {errors} = this.checkCurrent()
                    if (errors.length) {
                        this.showErrors(errors)
                        return
                    }
                    this.save()
                        .then(({json}) => {
                            const exportTemplate = json.export_template[0]
                            const pk = exportTemplate.pk
                            const oldTemplateIndex =
                                this.allTemplates.findIndex(
                                    template => template.pk === pk
                                )
                            if (oldTemplateIndex > -1) {
                                this.allTemplates.splice(
                                    oldTemplateIndex,
                                    1,
                                    exportTemplate
                                )
                            } else {
                                this.allTemplates.push(exportTemplate)
                            }
                            this.refresh()
                            this.dialog.close()
                        })
                        .catch(response => {
                            if (response.json) {
                                response.json().then(json => {
                                    if (json.errors) {
                                        const errors = []
                                        Object.keys(json.errors).forEach(
                                            key => {
                                                json.errors[key].forEach(
                                                    error =>
                                                        errors.push(
                                                            `${key}: ${error}`
                                                        )
                                                )
                                            }
                                        )
                                        this.showErrors(errors)
                                    }
                                })
                            } else {
                                throw response
                            }
                        })
                }
            },
            {type: "cancel"}
        ]
        if (this.id) {
            buttons.unshift({
                text: gettext("Delete"),
                classes: "fw-orange",
                click: () => this.deleteTemplateDialog()
            })
        }
        this.dialog = new Dialog({
            id: "export-template-dialog",
            title: gettext("Export template"),
            width: 400,
            body: `<table class="fw-dialog-table fw-data-table"><tbody>
                <tr>
                    <th><h4 class="fw-tablerow-title">${gettext("File")}</h4></th>
                    <td style="width: 250px;">
                        <span class="export-template-file">${
                            this.template
                                ? `<a href="${this.template.fields.template_file}">${escapeText(this.template.fields.title)}</a>`
                                : ""
                        }</span>
                    </td><td style="width: 70px;">
                        <button type="button" class="fw-media-select-button fw-button fw-light">
                            ${gettext("Select")}
                        </button>
                        <input name="image" type="file" class="fw-media-file-input">
                    </td>
                </tr>
                <tr>
                    <th><h4 class="fw-tablerow-title">${gettext("Filetype")}</h4></th>
                    <td colspan="2">
                        <span class="export-template-filetype">${
                            this.template ? this.template.fields.file_type : ""
                        }</span>
                    </td>
                </tr>
                <tr>
                    <th><h4 class="fw-tablerow-title">${gettext("Found tags")}</h4></th>
                    <td colspan="2">
                        <span class="export-template-found-tags"></span>
                    </td>
                </tr>
                <tr>
                    <th><h4 class="fw-tablerow-title">${gettext("Missing tags")}</h4></th>
                    <td colspan="2">
                        <span class="export-template-missing-tags"></span>
                    </td>
                </tr>
                </tbody></table>
                <ul class="errorlist"></ul>`,
            buttons
        })
        this.dialog.open()
        this.bind()
        if (this.template) {
            this.checkRemoteFile(this.template.fields.template_file)
        }
    }

    showErrors(errors) {
        this.dialog.dialogEl.querySelector("ul.errorlist").innerHTML = errors
            .map(error => `<li>${escapeText(error)}</li>`)
            .join("")
    }

    deleteTemplate() {
        postJson("/api/style/delete_export_template/", {id: this.id})
            .then(() => {
                const oldTemplateIndex = this.allTemplates.findIndex(
                    style => style.pk === this.id
                )
                if (!(typeof oldTemplateIndex === "undefined")) {
                    this.allTemplates.splice(oldTemplateIndex, 1)
                    this.refresh()
                }
                this.dialog.close()
            })
            .catch(response => {
                if (response.json) {
                    response.json().then(json => {
                        if (json.errors) {
                            const errors = []
                            Object.keys(json.errors).forEach(key => {
                                json.errors[key].forEach(error =>
                                    errors.push(`${key}: ${error}`)
                                )
                            })
                            this.showErrors(errors)
                        }
                    })
                } else {
                    throw response
                }
            })
    }

    deleteTemplateDialog() {
        const buttons = [
            {
                text: gettext("Delete"),
                classes: "fw-dark",
                click: () => {
                    dialog.close()
                    this.deleteTemplate()
                }
            },
            {
                type: "cancel"
            }
        ]
        const dialog = new Dialog({
            id: "confirmdeletion",
            icon: "exclamation-triangle",
            title: gettext("Confirm deletion"),
            body: `<p>${gettext("Do you really want to delete the export template?")}</p>`,
            height: 180,
            buttons
        })
        dialog.open()
    }

    checkCurrent() {
        const errors = []

        if (!this.addedFile) {
            errors.push(
                gettext(
                    "You need to upload a template file in ODT or DOCX format."
                )
            )
        }
        if (
            this.allTemplates.find(
                template =>
                    template.fields.title ===
                        this.addedFile.name.split(".")[0] &&
                    template.pk !== this.id
            )
        ) {
            errors.push(
                gettext(
                    "Another export file with the same filename exists already."
                )
            )
        }
        return {errors}
    }

    save() {
        const saveValues = {
            id: this.id,
            template_id: this.documentTemplateId,
            added_file: this.addedFile,
            added_file_type: this.addedFileType
        }
        return postJson("/api/style/save_export_template/", saveValues)
    }

    checkRemoteFile(url) {
        return get(url)
            .then(response => response.blob())
            .then(blob => this.checkFile(blob))
    }

    checkFile(blob) {
        let fileType
        const zip = new JSZip()
        return zip
            .loadAsync(blob)
            .then(zip => {
                if (zip.files["content.xml"]) {
                    fileType = "odt"
                    return zip.files["content.xml"].async("string")
                } else if (zip.files["word/document.xml"]) {
                    fileType = "docx"
                    return zip.files["word/document.xml"].async("string")
                } else {
                    throw new Error(gettext("Unknown filetype"))
                }
            })
            .then(string => {
                const expectedTags = this.documentTemplateValue.content
                    .map(node => {
                        switch (node.type) {
                            case "title":
                                return "title"
                            case "richtext_part":
                            case "table_part":
                                return `@${node.attrs.id}`
                            case "heading_part":
                            case "contributors_part":
                            case "tags_part":
                                return node.attrs.id
                            default:
                                return false
                        }
                    })
                    .concat(["@bibliography", "@copyright", "@licenses"])
                    .filter(tag => tag)
                const parser = new window.DOMParser()
                const xml = parser.parseFromString(string, "text/xml")
                if (fileType === "odt") {
                    this.checkODT(xml, expectedTags)
                } else {
                    this.checkDOCX(xml, expectedTags)
                }
                return fileType
            })
    }

    setStatus(_fileType, foundTags, missingTags) {
        this.dialog.dialogEl.querySelector(
            ".export-template-found-tags"
        ).innerHTML = foundTags.join(", ")
        this.dialog.dialogEl.querySelector(
            ".export-template-missing-tags"
        ).innerHTML = missingTags.join(", ")
    }

    checkODT(xml, expectedTags) {
        const pars = xml.querySelectorAll("p")
        const foundTags = []

        pars.forEach(par => {
            // Assuming there is nothing outside of <w:t>...</w:t>
            const text = par.textContent
            expectedTags.forEach(tag => {
                if (text.includes(`{${tag}}`)) {
                    foundTags.push(tag)
                }
            })
        })

        this.setStatus(
            "odt",
            foundTags,
            expectedTags.filter(tag => !foundTags.includes(tag))
        )
    }

    checkDOCX(xml, expectedTags) {
        const pars = xml.querySelectorAll("p,sectPr")
        const foundTags = []

        pars.forEach(par => {
            // Assuming there is nothing outside of <w:t>...</w:t>
            const text = par.textContent
            expectedTags.forEach(tag => {
                if (text.includes(`{${tag}}`)) {
                    foundTags.push(tag)
                }
            })
        })

        this.setStatus(
            "docx",
            foundTags,
            expectedTags.filter(tag => !foundTags.includes(tag))
        )
    }

    bind() {
        const mediaInputSelector = this.dialog.dialogEl.querySelector(
            ".fw-media-file-input"
        )
        this.dialog.dialogEl.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, ".fw-media-select-button", el): {
                    event.preventDefault()
                    mediaInputSelector.click()
                    break
                }
            }
        })

        mediaInputSelector.addEventListener("change", () => {
            this.showErrors([])
            const mediaInput = mediaInputSelector.files[0]
            if (!mediaInput) {
                return
            }
            this.checkFile(mediaInput)
                .then(fileType => {
                    this.addedFile = mediaInput
                    this.addedFileType = fileType
                    this.dialog.dialogEl.querySelector(
                        ".export-template-filetype"
                    ).innerHTML = fileType
                    this.dialog.dialogEl.querySelector(
                        ".export-template-file"
                    ).innerHTML = escapeText(mediaInput.name)
                })
                .catch(() => {
                    this.showErrors([gettext("Selected file not supported.")])
                })
        })
    }
}
