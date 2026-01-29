import {CSL} from "citeproc-plus"
import {ensureCSS, escapeText, findTarget, postJson, whenReady} from "../common"
import {DocumentTemplateDesigner} from "./designer"

export class DocumentTemplateAdmin {
    constructor() {
        this.objectTools = false
        this.contentTextarea = false
        this.templateDesigner = false
        this.templateExtras = false
        this.citationStyles = false
        const locationParts = window.location.href.split("/")
        let id = Number.parseInt(locationParts[locationParts.length - 3])
        if (isNaN(id)) {
            id = 0
        }
        this.id = id
    }

    init() {
        if (
            window.location.search.length &&
            window.location.search.includes("debug=true")
        ) {
            return
        }
        ensureCSS([
            staticUrl("css/colors.css"),
            staticUrl("css/document_template_admin.css"),
            staticUrl("css/admin.css"),
            staticUrl("css/ui_dialogs.css"),
            staticUrl("css/buttons.css")
        ])
        const csl = new CSL()
        const initialTasks = [
            whenReady(),
            csl.getStyles().then(styles => (this.citationStyles = styles))
        ]
        if (this.id) {
            initialTasks.push(
                postJson("/api/document/admin/get_template/extras/", {
                    id: this.id
                }).then(({json}) => (this.templateExtras = json))
            )
        }

        Promise.all(initialTasks).then(() => {
            this.objectTools = document.querySelector("ul.object-tools")
            if (!this.objectTools) {
                const mainContent = document.querySelector("#content-main")
                mainContent.insertAdjacentHTML(
                    "afterbegin",
                    '<ul class="object-tools"></ul>'
                )
                this.objectTools = document.querySelector("ul.object-tools")
            }
            this.titleInput = document.querySelector("#id_title")
            this.titleBlock = document.querySelector("div.field-title")
            this.contentTextarea = document.querySelector(
                "textarea[name=content]"
            )
            this.contentImportIdInput = document.querySelector("#id_import_id")
            this.contentImportIdBlock = document.querySelector(
                "div.field-import_id"
            )
            this.contentBlock = document.querySelector("div.field-content")
            this.modifyDOM()
            this.initDesigner()
            this.bind()
        })
    }

    initDesigner() {
        this.templateDesigner = new DocumentTemplateDesigner(
            this.id,
            this.titleInput.value,
            JSON.parse(this.contentTextarea.value),
            this.templateExtras.document_styles || [],
            this.citationStyles,
            this.templateExtras.export_templates || [],
            document.getElementById("template-editor")
        )
        this.templateDesigner.init()
    }

    modifyDOM() {
        this.contentBlock.style.display = "none"
        this.contentImportIdBlock.style.display = "none"
        this.titleBlock.style.display = "none"
        this.objectTools.insertAdjacentHTML(
            "beforeend",
            `<li>
                <span class="link" id="toggle-editor">${gettext("Source/Editor")}</span>
            </li>`
        )
        this.titleBlock.insertAdjacentHTML(
            "beforebegin",
            `<div class="form-row template-editor">
                <ul class="errorlist"></ul>
                <div id="template-editor"></div>
            </div>`
        )

        this.templateDesignerBlock = document.querySelector(
            "div.template-editor"
        )
    }

    setCurrentValue() {
        const {valid, value, errors, import_id, title} =
            this.templateDesigner.getCurrentValue()
        this.contentTextarea.value = JSON.stringify(value)
        this.contentImportIdInput.value = import_id
        this.titleInput.value = title
        this.showErrors(errors)
        return valid
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
                case findTarget(event, "#toggle-editor", el):
                    event.preventDefault()
                    if (this.contentBlock.style.display === "none") {
                        this.contentBlock.style.display = ""
                        this.contentImportIdBlock.style.display = ""
                        this.titleBlock.style.display = ""
                        this.setCurrentValue()
                        this.templateDesigner.close()
                        this.templateDesigner = false
                        this.templateDesignerBlock.style.display = "none"
                    } else {
                        this.contentBlock.style.display = "none"
                        this.contentImportIdBlock.style.display = "none"
                        this.titleBlock.style.display = "none"
                        this.templateDesignerBlock.style.display = ""
                        this.initDesigner()
                    }
                    break
                case findTarget(event, "div.submit-row input[type=submit]", el):
                    if (
                        this.contentBlock.style.display === "none" &&
                        !this.setCurrentValue()
                    ) {
                        event.preventDefault()
                    }
                    break
                default:
                    break
            }
        })
    }
}
