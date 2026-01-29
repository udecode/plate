import {ensureCSS, escapeText, findTarget, whenReady} from "../common"
import {DocumentTemplateExporter} from "./exporter"
import {DocumentTemplateImporter} from "./importer"

export class DocumentTemplateListAdmin {
    constructor() {
        this.objectTools = false
        this.actionDropdown = false
    }

    init() {
        if (
            window.location.search.length &&
            window.location.search.includes("debug=true")
        ) {
            return
        }
        ensureCSS([
            staticUrl("css/document_template_admin.css"),
            staticUrl("css/admin.css")
        ])

        whenReady().then(() => {
            this.objectTools = document.querySelector("ul.object-tools")
            this.actionDropdown = document.querySelector(
                'select[name="action"]'
            )
            this.modifyDOM()
            this.bind()
        })
    }

    modifyDOM() {
        this.objectTools.insertAdjacentHTML(
            "beforeend",
            `<li>
                <span class="link" id="upload-template">${gettext("Upload FIDUSTEMPLATE")}</span>
            </li>`
        )
        this.actionDropdown.insertAdjacentHTML(
            "beforeend",
            `<option value="download">${gettext("Download selected as FIDUSTEMPLATE")}</option>`
        )
    }

    showErrors(errors) {
        this.templateDesignerBlock.querySelector("ul.errorlist").innerHTML =
            Object.values(errors)
                .map(error => `<li>${escapeText(error)}</li>`)
                .join("")
    }

    bind() {
        document.body.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, "#upload-template", el): {
                    event.preventDefault()
                    const fileSelector = document.createElement("input")
                    fileSelector.id = "fidus-template-uploader"
                    fileSelector.setAttribute("type", "file")
                    fileSelector.setAttribute("multiple", "")
                    fileSelector.setAttribute("accept", ".fidustemplate")
                    document.body.appendChild(fileSelector)
                    fileSelector.click()
                    fileSelector.addEventListener("change", () => {
                        const files = Array.from(fileSelector.files).filter(
                            file => {
                                //TODO: This is an arbitrary size. What should be done with huge import files?
                                if (
                                    file.length === 0 ||
                                    file.size > 104857600
                                ) {
                                    return false
                                }
                                return true
                            }
                        )
                        Promise.all(
                            files.map(file => {
                                const importer = new DocumentTemplateImporter(
                                    file
                                )
                                return importer.init()
                            })
                        ).then(() => window.location.reload())
                    })
                    break
                }
                case findTarget(event, "button[type=submit]", el):
                    if (this.actionDropdown.value === "download") {
                        event.preventDefault()
                        const ids = Array.from(
                            document.querySelectorAll(
                                '#result_list tr.selected input[type="checkbox"]'
                            )
                        ).map(el => Number.parseInt(el.value))
                        ids.forEach(id => {
                            const exporter = new DocumentTemplateExporter(id)
                            exporter.init()
                        })
                    }
                    break
                default:
                    break
            }
        })
    }
}
