import {keyName} from "w3c-keyname"

import {whenReady} from "./basic"
import {ContentMenu} from "./content_menu"

let bulkId = 0

export class DatatableBulk {
    constructor(page, model, checkboxColumn) {
        this.page = page
        this.model = model
        this.checkboxColumn = checkboxColumn

        this.id = `dt-bulk-${++bulkId}`
    }

    init(table) {
        this.table = table
        whenReady().then(() => this.bindEvents())
    }

    update() {
        this.model.content = this.model.content.sort(
            (a, b) => a.order - b.order
        )
    }

    bindEvents() {
        // Store the bound functions as instance variables so we can remove them later
        this.boundOnClick = this.onClick.bind(this)
        this.boundOnTableCheckChange = this.onTableCheckChange.bind(this)
        this.boundOnKeyDown = this.onKeyDown.bind(this)

        this.page.dom.addEventListener("click", this.boundOnClick)
        this.table.dom.addEventListener("change", this.boundOnTableCheckChange)
        this.table.dom.addEventListener("keydown", this.boundOnKeyDown)
        this.onTableCheckChange()
    }

    // The new destroy() method removes all event listeners that were added and cleans up DOM elements.
    destroy() {
        if (this.page && this.page.dom && this.boundOnClick) {
            this.page.dom.removeEventListener("click", this.boundOnClick)
        }
        if (this.table && this.table.dom) {
            if (this.boundOnTableCheckChange) {
                this.table.dom.removeEventListener(
                    "change",
                    this.boundOnTableCheckChange
                )
            }
            if (this.boundOnKeyDown) {
                this.table.dom.removeEventListener(
                    "keydown",
                    this.boundOnKeyDown
                )
            }
        }

        // Remove the bulk element from the DOM if it exists
        const el = document.getElementById(this.id)
        if (el && el.parentNode) {
            el.parentNode.removeChild(el)
        }

        // Clear any references to help garbage collection
        this.page = null
        this.table = null
        this.model = null
    }

    onKeyDown(event) {
        const key = keyName(event)
        const el = this.page.dom.querySelector(`#${this.id}`)

        if (!el) {
            return
        }

        if (key === "Enter" && this.page.getSelected().length > 0) {
            // Open the content menu when Enter is pressed and at least one row is selected
            event.preventDefault()
            event.stopImmediatePropagation()
            event.stopPropagation()

            const contentMenu = new ContentMenu({
                menu: this.model,
                width: 280,
                page: this.page,
                menuPos: {
                    X: Number.parseInt(el.getBoundingClientRect().left),
                    Y: Number.parseInt(el.getBoundingClientRect().bottom)
                }
            })
            contentMenu.open()
        } else if (
            key === " " &&
            event.target === el.querySelector("input[type=checkbox]")
        ) {
            // Toggle "Select All" when Space is pressed on the checkbox
            event.preventDefault()
            event.stopImmediatePropagation()
            event.stopPropagation()

            const isChecked = this.isAllChecked()
            this.toggleSelectAll(!isChecked)
        } else if ((event.ctrlKey || event.metaKey) && key === "a") {
            // Select all when Ctrl+A is pressed
            const isChecked = this.isAllChecked()
            this.toggleSelectAll(!isChecked)
            event.preventDefault()
            event.stopImmediatePropagation()
            event.stopPropagation()
        }
    }

    toggleSelectAll(checked) {
        // Update the DataTable instance
        if (this.table) {
            this.table.data.data.forEach(row => {
                if (row.cells[this.checkboxColumn]) {
                    row.cells[this.checkboxColumn].data = checked
                    row.cells[this.checkboxColumn].text = String(checked)
                }
            })
            this.table.update()
        }

        this.onTableCheckChange()
    }

    onTableCheckChange() {
        const el = this.page.dom.querySelector(`#${this.id}`)
        if (!el) {
            return
        }

        const allChecked = this.isAllChecked()
        el.querySelector("input[type=checkbox]").checked = allChecked
    }

    isAllChecked() {
        const checkboxes = Array.from(
            this.table.dom.querySelectorAll("input.entry-select[type=checkbox]")
        )
        const unchecked = checkboxes.filter(box => !box.checked)
        return !unchecked.length && checkboxes.length
    }

    onClick(event) {
        const target = event.target
        if (target.matches(`#${this.id} *`)) {
            event.preventDefault()
            event.stopImmediatePropagation()
            event.stopPropagation()

            if (target.matches(".dt-bulk-dropdown, .dt-bulk-dropdown *")) {
                // Dropdown
                const el = document.querySelector(`#${this.id}`)
                if (el) {
                    const contentMenu = new ContentMenu({
                        menu: this.model,
                        width: 280,
                        page: this.page,
                        menuPos: {
                            X: Number.parseInt(event.pageX),
                            Y: Number.parseInt(event.pageY)
                        }
                    })
                    contentMenu.open()
                }
            } else if (
                target.matches(".fw-check + label, .fw-check + label *")
            ) {
                // Click on bulk checkbox
                const isChecked = this.isAllChecked()
                this.toggleSelectAll(!isChecked)
                target
                    .closest("div.datatable-wrapper")
                    .querySelector("input[type=checkbox]").checked = !isChecked
                this.onTableCheckChange()
            }
        } else if (target.matches(".fw-data-table .entry-select + label")) {
            // The browser will try to scroll the checkbox into view and that will break the page layout.
            event.preventDefault()
            event.stopImmediatePropagation()
            event.stopPropagation()
            const tr = target.closest("tr")
            const index = parseInt(tr.dataset.index)
            const row = this.table.data.data[index]
            const cell = row.cells[this.checkboxColumn]
            cell.data = !cell.data
            cell.text = String(cell.data)
            this.table.update()
            this.onTableCheckChange()
        }
    }

    getHTML() {
        return `<div id="${this.id}" class="dt-bulk" role="group" aria-label="Bulk actions">
                        <input type="checkbox" id="${this.id}_check" class="fw-check" aria-label="Select all">
                        <label for="${this.id}_check"></label>
                        <span class="dt-bulk-dropdown" tabindex="0" role="button" aria-label="Open bulk actions menu">
                            <i class="fa fa-caret-down"></i>
                        </span>
                    </div>`
    }
}
