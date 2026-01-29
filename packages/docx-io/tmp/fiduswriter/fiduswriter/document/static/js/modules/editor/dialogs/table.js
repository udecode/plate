import {Dialog, dropdownSelect} from "../../common"
import {tableConfigurationTemplate, tableInsertTemplate} from "./templates"

export class TableDialog {
    constructor(editor) {
        this.editor = editor
        this.dialogEl = false
    }

    init() {
        this.insertTableDialog()
    }

    markInsertTable(cell, className) {
        this.dialog.dialogEl
            .querySelectorAll(`td.${className}`)
            .forEach(el => el.classList.remove(className))
        let colCount = 1
        let countElement = cell
        while (countElement.previousElementSibling) {
            countElement = countElement.previousElementSibling
            colCount += 1
        }
        let rowCount = 1
        countElement = countElement.parentElement
        while (countElement.previousElementSibling) {
            countElement = countElement.previousElementSibling
            rowCount += 1
        }
        // add hover class.
        const rows = this.dialog.dialogEl.querySelectorAll("tr")
        for (let i = 0; i < rowCount; i++) {
            const cols = rows[i].querySelectorAll("td")
            for (let j = 0; j < colCount; j++) {
                cols[j].classList.add(className)
            }
        }
        return {colCount, rowCount}
    }

    insertTableDialog() {
        let rowCount = 1,
            colCount = 1
        const buttons = []
        buttons.push({
            text: gettext("Insert"),
            classes: "fw-dark",
            click: () => {
                const table = {
                    type: "table",
                    content: [
                        {type: "table_caption"},
                        {type: "table_body", content: []}
                    ]
                }
                const table_body = table.content[1]

                for (let i = 0; i < rowCount; i++) {
                    const row = {type: "table_row", content: []}
                    for (let j = 0; j < colCount; j++) {
                        row.content.push({
                            type: "table_cell",
                            content: [{type: "paragraph"}]
                        })
                    }
                    table_body.content.push(row)
                }
                const schema = this.editor.currentView.state.schema
                this.editor.currentView.dispatch(
                    this.editor.currentView.state.tr.replaceSelectionWith(
                        schema.nodeFromJSON(table),
                        false
                    )
                )
                this.dialog.close()
            }
        })
        buttons.push({
            type: "cancel"
        })

        this.dialog = new Dialog({
            title: gettext("Insert table"),
            body: tableInsertTemplate(),
            width: 360,
            height: 360,
            buttons,
            onClose: () => this.editor.currentView.focus(),
            restoreActiveElement: false
        })

        this.dialog.open()

        // manage hovering over table cells
        this.dialog.dialogEl.querySelectorAll("td").forEach(el =>
            el.addEventListener("mouseenter", () => {
                this.markInsertTable(el, "hover")
            })
        )
        this.dialog.dialogEl.querySelectorAll("td").forEach(el =>
            el.addEventListener("mouseleave", () => {
                this.dialog.dialogEl
                    .querySelectorAll("td.hover")
                    .forEach(mEl => mEl.classList.remove("hover"))
            })
        )

        this.dialog.dialogEl.querySelectorAll("td").forEach(el =>
            el.addEventListener("click", event => {
                event.preventDefault()
                event.stopImmediatePropagation()
                const newCounts = this.markInsertTable(el, "selected")
                rowCount = newCounts.rowCount
                colCount = newCounts.colCount
            })
        )
    }
}

export class TableConfigurationDialog {
    constructor(editor) {
        this.editor = editor
        this.dialogEl = false
        this.aligned = "center"
        this.width = "100"
        this.layout = "fixed"
        this.category = "none"
        this.caption = false
    }

    init() {
        const {table} = this.findTable(this.editor.currentView.state)
        if (!table) {
            return
        }
        this.width = table.attrs.width
        this.aligned = table.attrs.aligned
        this.layout = table.attrs.layout
        this.category = table.attrs.category
        this.caption = table.attrs.caption
        this.insertDialog()
    }

    findTable(state) {
        const $head = state.selection.$head
        for (let d = $head.depth; d > 0; d--) {
            if ($head.node(d).type.name == "table") {
                return {table: $head.node(d), tablePos: $head.before(d)}
            }
        }
        return {table: false}
    }

    submitForm() {
        const {table, tablePos} = this.findTable(this.editor.currentView.state)
        if (!table) {
            return
        }
        const attrs = Object.assign({}, table.attrs, {
            width: this.width,
            aligned: this.width === "100" ? "center" : this.aligned,
            layout: this.layout,
            category: this.category,
            caption: this.caption
        })
        this.editor.currentView.dispatch(
            this.editor.currentView.state.tr.setNodeMarkup(
                tablePos,
                false,
                attrs
            )
        )
    }

    insertDialog() {
        const buttons = []
        buttons.push({
            text: gettext("Update"),
            classes: "fw-dark",
            click: () => {
                this.submitForm()
                this.dialog.close()
            }
        })
        buttons.push({
            type: "cancel"
        })

        this.dialog = new Dialog({
            title: gettext("Configure table"),
            body: tableConfigurationTemplate({
                language: this.editor.view.state.doc.attrs.language
            }),
            width: 400,
            height: 360,
            buttons,
            onClose: () => this.editor.currentView.focus()
        })

        this.dialog.open()

        const alignmentSelector = dropdownSelect(
            this.dialog.dialogEl.querySelector(".table-alignment"),
            {
                onChange: newValue => {
                    this.aligned = newValue
                },
                width: "80%",
                value: this.aligned
            }
        )

        if (this.width == "100") {
            alignmentSelector.setValue("center")
            alignmentSelector.disable()
            this.aligned = "center"
        }

        dropdownSelect(this.dialog.dialogEl.querySelector(".table-width"), {
            onChange: newValue => {
                this.width = newValue
                if (this.width == "100") {
                    alignmentSelector.setValue("center")
                    alignmentSelector.disable()
                    this.aligned = "center"
                } else {
                    alignmentSelector.enable()
                }
            },
            width: "80%",
            value: this.width
        })

        dropdownSelect(this.dialog.dialogEl.querySelector(".table-layout"), {
            onChange: newValue => {
                this.layout = newValue
            },
            width: "80%",
            value: this.layout
        })

        dropdownSelect(this.dialog.dialogEl.querySelector(".table-category"), {
            onChange: newValue => {
                this.category = newValue
            },
            width: "80%",
            value: this.category
        })

        dropdownSelect(this.dialog.dialogEl.querySelector(".table-caption"), {
            onChange: newValue => {
                this.caption = newValue === "true"
            },
            width: "80%",
            value: String(this.caption)
        })
    }
}
