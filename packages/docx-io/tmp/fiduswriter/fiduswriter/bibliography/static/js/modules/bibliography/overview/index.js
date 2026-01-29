import fixUTF8 from "fix-utf8"
import {DataTable} from "simple-datatables"
import {keyName} from "w3c-keyname"

import * as plugins from "../../../plugins/bibliography_overview"
import {
    DatatableBulk,
    Dialog,
    OverviewMenuView,
    addAlert,
    baseBodyTemplate,
    ensureCSS,
    escapeText,
    findTarget,
    isActivationEvent,
    setDocTitle,
    whenReady
} from "../../common"
import {FeedbackTab} from "../../feedback"
import {SiteMenu} from "../../menu"
import {BibTypeTitles} from "../form/strings"
import {litToText, nameToText} from "../tools"
import {bulkMenuModel, menuModel} from "./menu"
import {editCategoriesTemplate} from "./templates"

export class BibliographyOverview {
    constructor({app, user}) {
        this.app = app
        this.user = user

        this.lastSort = {column: 0, dir: "asc"}
    }

    /** Bind the init function to doc loading.
     * @function bind
     */
    init() {
        return whenReady().then(() => {
            this.render()
            const smenu = new SiteMenu(this.app, "bibliography")
            smenu.init()
            this.menu = new OverviewMenuView(this, menuModel)
            this.menu.init()
            this.setBibCategoryList(this.app.bibDB.cats)
            this.initTable(Object.keys(this.app.bibDB.db))
            // Reset scroll position to top to prevent Safari from auto-scrolling
            // to the focused table element, which would hide the header/menu
            window.scrollTo(0, 0)
            this.activatePlugins()
            this.bindEvents()
        })
    }

    render() {
        this.dom = document.createElement("body")
        this.dom.innerHTML = baseBodyTemplate({
            contents: "",
            user: this.user,
            hasOverview: true,
            app: this.app
        })
        document.body = this.dom
        ensureCSS([
            staticUrl("css/bibliography.css"),
            staticUrl("css/prosemirror.css"),
            staticUrl("css/inline_tools.css")
        ])
        setDocTitle(gettext("Bibliography Manager"), this.app)
        const feedbackTab = new FeedbackTab()
        feedbackTab.init()
    }

    onResize() {
        if (!this.table) {
            return
        }
        this.initTable(Object.keys(this.app.bibDB.db))
    }

    /* Initialize the overview table */
    initTable(ids) {
        const tableEl = document.createElement("table")
        tableEl.id = "bibliography"
        tableEl.classList.add("fw-data-table")
        tableEl.classList.add("fw-large")
        this.dom.querySelector(".fw-contents").innerHTML = ""
        this.dom.querySelector(".fw-contents").appendChild(tableEl)

        this.dtBulk = new DatatableBulk(this, bulkMenuModel(), 1)

        const hiddenCols = [0]

        if (window.innerWidth < 500) {
            hiddenCols.push(1)
            if (window.innerWidth < 450) {
                hiddenCols.push(3)
            }
        }

        this.table = new DataTable(tableEl, {
            searchable: true,
            paging: false,
            scrollY: `${Math.max(window.innerHeight - 360, 100)}px`,
            rowNavigation: true,
            rowSelectionKeys: ["Enter", "Delete", " "],
            tabIndex: 1,
            labels: {
                noRows: gettext("No sources registered"),
                noResults: gettext("No sources found") // Message shown when there are no search results
            },
            template: (options, _dom) =>
                `<div class='${options.classes.container}'${options.scrollY.length ? ` style='height: ${options.scrollY}; overflow-Y: auto;'` : ""}></div>`,
            data: {
                headings: [
                    "",
                    this.dtBulk.getHTML(),
                    gettext("Title"),
                    gettext("Sourcetype"),
                    gettext("Author"),
                    gettext("Published"),
                    ""
                ],
                data: ids.map(id => this.createTableRow(id))
            },
            columns: [
                {
                    select: 0,
                    type: "number"
                },
                {
                    select: 1,
                    type: "boolean",
                    sortable: false
                },
                {
                    select: hiddenCols,
                    hidden: true
                },
                {
                    select: 6,
                    sortable: false
                }
            ],
            rowRender: (row, tr, _index) => {
                const id = row.cells[0].data
                const inputNode = {
                    nodeName: "input",
                    attributes: {
                        type: "checkbox",
                        class: "entry-select fw-check",
                        "data-id": id,
                        id: `bib-${id}`
                    }
                }
                if (row.cells[1].data) {
                    inputNode.attributes.checked = true
                }
                tr.childNodes[0].childNodes = [
                    inputNode,
                    {
                        nodeName: "label",
                        attributes: {
                            for: `bib-${id}`
                        }
                    }
                ]
            }
        })

        this.table.on("datatable.selectrow", (rowIndex, event, focused) => {
            event.preventDefault()
            if (event.type === "keydown") {
                const key = keyName(event)
                if (key === "Enter") {
                    if (this.getSelected().length > 0) {
                        // Don't open. Let the bulk menu handle it.
                        return
                    }
                    const editButton = this.table.dom.querySelector(
                        `tr[data-index="${rowIndex}"] span.edit-bib`
                    )
                    if (editButton) {
                        editButton.click()
                    }
                } else if (key === " ") {
                    const cell = this.table.data.data[rowIndex].cells[1]
                    cell.data = !cell.data
                    cell.text = String(cell.data)
                    this.table.update()
                } else if (key === "Delete") {
                    const cell = this.table.data.data[rowIndex].cells[0]
                    const bibId = cell.data
                    this.deleteBibEntryDialog([bibId])
                }
            } else {
                if (
                    event.target.closest(
                        "span.edit-bib, span.delete-bib, label"
                    )
                ) {
                    return
                }

                if (!focused) {
                    this.table.dom.focus()
                }
                this.table.rows.setCursor(rowIndex)
            }
        })

        this.table.on("datatable.sort", (column, dir) => {
            this.lastSort = {column, dir}
        })

        this.dtBulk.init(this.table)

        this.table.dom.focus()
    }

    /** Adds a list of bibliography categories to current list of bibliography categories.
     * @function setBibCategoryList
     * @param newBibCategories The new categories which will be added to the existing ones.
     */
    setBibCategoryList(bibCategories) {
        const catSelector = this.menu.model.content.find(
            menuItem => menuItem.id === "cat_selector"
        )
        catSelector.content = catSelector.content.filter(
            cat => cat.type !== "category"
        )

        catSelector.content = catSelector.content.concat(
            bibCategories.map(cat => ({
                title: cat.category_title,
                type: "category",
                action: _overview => {
                    const trs = this.dom.querySelectorAll(
                        "#bibliography > tbody > tr"
                    )
                    trs.forEach(tr => {
                        if (
                            tr
                                .querySelector(".fw-data-table-title")
                                .classList.contains(`cat_${cat.id}`)
                        ) {
                            tr.style.display = ""
                        } else {
                            tr.style.display = "none"
                        }
                    })
                }
            }))
        )
        this.menu.update()
    }

    /** This takes a list of new bib entries and adds them to BibDB and the bibliography table
     * @function updateTable
     */
    updateTable(ids) {
        // Remove items that already exist
        this.removeTableRows(ids)
        this.table.insert({data: ids.map(id => this.createTableRow(id))})
        // Redo last sort
        this.table.columns.sort(this.lastSort.column, this.lastSort.dir)
    }

    createTableRow(id) {
        const bibInfo = this.app.bibDB.db[id]
        const bibauthors = bibInfo.fields.author || bibInfo.fields.editor
        const cats = bibInfo.cats.map(cat => `cat_${cat}`)
        return [
            id,
            false, // checkbox
            `<span class="fw-data-table-title ${cats.join(" ")}">
                <i class="fa fa-book"></i>
                <span class="edit-bib fw-link-text fw-searchable" data-id="${id}">
                    ${bibInfo.fields.title?.length ? escapeText(litToText(bibInfo.fields.title)) : gettext("Untitled")}
                </span>
            </span>`, // title
            BibTypeTitles[bibInfo.bib_type], // sourcetype
            bibauthors ? nameToText(bibauthors) : "", // author
            `<span class="date">${bibInfo.fields.date ? bibInfo.fields.date.replace("/", " ") : ""}</span>`, // published,
            `<span class="delete-bib fw-link-text" data-id="${id}"><i class="fa fa-trash-alt">  </i></span>` // delete icon
        ]
    }

    removeTableRows(ids) {
        const existingRows = this.table.data.data
            .map((row, index) => {
                const id = row.cells[0].data
                if (ids.includes(id)) {
                    return index
                } else {
                    return false
                }
            })
            .filter(rowIndex => rowIndex !== false)

        if (existingRows.length) {
            this.table.rows.remove(existingRows)
        }
    }

    /** Opens a dialog for editing categories.
     * @function editCategoriesDialog
     */
    editCategoriesDialog() {
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
                text: gettext("Submit"),
                classes: "fw-dark",
                click: () => {
                    const cats = {ids: [], titles: []}
                    this.dom
                        .querySelectorAll("#edit-categories .category-form")
                        .forEach(el => {
                            const title = el.value.trim()
                            if (title.length) {
                                cats.ids.push(
                                    Number.parseInt(
                                        el.getAttribute("data-id") || 0
                                    )
                                )
                                cats.titles.push(title)
                            }
                        })
                    if (this.app.isOffline()) {
                        addAlert(
                            "info",
                            gettext(
                                "You are currently offline. Please try again when you are back online."
                            )
                        )
                    } else {
                        this.saveCategories(cats)
                    }
                    dialog.close()
                }
            },
            {
                type: "cancel"
            }
        ]

        const dialog = new Dialog({
            id: "edit-categories",
            width: 350,
            height: 350,
            title: gettext("Edit Categories"),
            body: editCategoriesTemplate({
                categories: this.app.bibDB.cats
            }),
            buttons
        })
        dialog.open()
    }

    /** Dialog to confirm deletion of bibliography items.
     * @function deleteBibEntryDialog
     * @param ids Ids of items that are to be deleted.
     */
    deleteBibEntryDialog(ids) {
        const buttons = [
            {
                text: gettext("Delete"),
                classes: "fw-dark",
                click: () => {
                    this.deleteBibEntries(ids)
                    dialog.close()
                }
            },
            {
                type: "cancel"
            }
        ]

        const dialog = new Dialog({
            id: "confirmdeletion",
            title: gettext("Confirm deletion"),
            body: `<p>${gettext("Delete the bibliography item(s)")}?</p>`,
            buttons,
            icon: "exclamation-triangle"
        })
        dialog.open()
    }

    // get IDs of selected bib entries
    getSelected() {
        return Array.from(
            this.dom.querySelectorAll(".entry-select:checked:not(:disabled)")
        ).map(el => Number.parseInt(el.getAttribute("data-id")))
    }

    activatePlugins() {
        // Add plugins
        this.plugins = {}

        Object.keys(plugins).forEach(plugin => {
            if (typeof plugins[plugin] === "function") {
                this.plugins[plugin] = new plugins[plugin](this)
                this.plugins[plugin].init()
            }
        })
    }

    /** Initialize the bibliography table and bind interactive parts.
     * @function bibEvents
     */
    bindEvents() {
        this.dom.addEventListener("click", event =>
            this.handleActivation(event)
        )
        this.dom.addEventListener("keydown", event =>
            this.handleActivation(event)
        )

        // Allow pasting of bibtex data.
        this.dom.addEventListener("paste", event => {
            if (event.target.nodeName === "INPUT") {
                // We are inside of an input element, cancel.
                return false
            }
            const text = event.clipboardData.getData("text")
            return this.getBibtex(text)
        })

        // The two drag events are needed to allow dropping
        this.dom.addEventListener("dragover", event => {
            if (event.dataTransfer.types.includes("text/plain")) {
                event.preventDefault()
            }
        })

        this.dom.addEventListener("dragenter", event => {
            if (event.dataTransfer.types.includes("text/plain")) {
                event.preventDefault()
            }
        })

        // Allow dropping of bibtex data
        this.dom.addEventListener("drop", event => {
            if (event.target.nodeName === "INPUT") {
                // We are inside of an input element, cancel.
                return false
            }
            const text = fixUTF8(event.dataTransfer.getData("text"))
            return this.getBibtex(text)
        })
    }

    handleActivation(event) {
        if (!isActivationEvent(event)) {
            return
        }
        const el = {}
        switch (true) {
            case findTarget(event, ".delete-bib", el): {
                const bibId = Number.parseInt(el.target.dataset.id)
                this.deleteBibEntryDialog([bibId])
                break
            }
            case findTarget(event, ".edit-bib", el): {
                const bibId = Number.parseInt(el.target.dataset.id)
                import("../form").then(({BibEntryForm}) => {
                    const form = new BibEntryForm(
                        this.app.bibDB,
                        this.app,
                        bibId
                    )
                    form.init().then(idTranslations => {
                        const ids = idTranslations.map(idTrans => idTrans[1])
                        return this.updateTable(ids)
                    })
                })
                break
            }
            case findTarget(event, ".fw-add-input", el): {
                const itemEl = el.target.closest(".fw-list-input")
                if (!itemEl.nextElementSibling) {
                    itemEl.insertAdjacentHTML(
                        "afterend",
                        `<tr class="fw-list-input">
                            <td>
                                <input type="text" class="category-form">
                                <span class="fw-add-input icon-addremove" tabindex="0"></span>
                            </td>
                        </tr>`
                    )
                } else {
                    itemEl.parentElement.removeChild(itemEl)
                }
                break
            }
            default:
                break
        }
    }

    // find bibtex in pasted or dropped data.
    getBibtex(text) {
        import("../import").then(({BibLatexImporter}) => {
            const importer = new BibLatexImporter(
                text,
                this.app.bibDB,
                newIds => this.updateTable(newIds),
                false
            )
            importer.init()
        })
        return true
    }

    saveCategories(cats) {
        this.app.bibDB
            .saveCategories(cats)
            .then(bibCats => this.setBibCategoryList(bibCats))
    }

    deleteBibEntries(ids) {
        this.app.bibDB
            .deleteBibEntries(ids)
            .then(ids => this.removeTableRows(ids))
    }

    close() {
        if (this.table) {
            this.table.destroy()
            this.table = null
        }
        if (this.dtBulk) {
            this.dtBulk.destroy()
            this.dtBulk = null
        }
        if (this.menu) {
            this.menu.destroy()
            this.menu = null
        }
    }
}
