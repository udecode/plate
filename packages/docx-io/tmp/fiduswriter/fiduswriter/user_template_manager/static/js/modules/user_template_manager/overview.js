import {DataTable} from "simple-datatables"
import {keyName} from "w3c-keyname"

import {
    DatatableBulk,
    OverviewMenuView,
    addAlert,
    baseBodyTemplate,
    ensureCSS,
    escapeText,
    findTarget,
    postJson,
    setDocTitle,
    whenReady
} from "../common"
import {FeedbackTab} from "../feedback"
import {SiteMenu} from "../menu"
import {DocTemplatesActions} from "./actions"
import {bulkMenuModel, menuModel} from "./menu"

export class DocTemplatesOverview {
    // A class that contains everything that happens on the templates page.
    // It is currently not possible to initialize more than one such class, as it
    // contains bindings to menu items, etc. that are uniquely defined.
    constructor({app, user}) {
        this.app = app
        this.user = user
        this.mod = {}
        this.templateList = []
        this.styles = false

        this.lastSort = {column: 0, dir: "asc"}
    }

    init() {
        return whenReady().then(() => {
            this.render()
            const smenu = new SiteMenu(this.app, "templates")
            smenu.init()
            new DocTemplatesActions(this)
            this.menu = new OverviewMenuView(this, menuModel)
            this.menu.init()
            this.bind()
            return this.getTemplateListData()
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
            staticUrl("css/add_remove_dialog.css"),
            staticUrl("css/access_rights_dialog.css")
        ])
        setDocTitle(gettext("Document Templates Overview"), this.app)
        const feedbackTab = new FeedbackTab()
        feedbackTab.init()
    }

    onResize() {
        if (!this.table) {
            return
        }
        this.initTable()
    }

    /* Initialize the overview table */
    initTable() {
        const tableEl = document.createElement("table")
        tableEl.classList.add("fw-data-table")
        tableEl.classList.add("fw-large")
        this.dom.querySelector(".fw-contents").innerHTML = ""
        this.dom.querySelector(".fw-contents").appendChild(tableEl)

        this.dtBulk = new DatatableBulk(this, bulkMenuModel(), 1)

        const hiddenCols = [0]

        if (window.innerWidth < 500) {
            hiddenCols.push(1)
        }

        this.table = new DataTable(tableEl, {
            searchable: true,
            paging: false,
            scrollY: `${Math.max(window.innerHeight - 360, 100)}px`,
            labels: {
                noRows: gettext("No document templates available"),
                noResults: gettext("No document templates found") // Message shown when there are no search results
            },
            rowNavigation: true,
            rowSelectionKeys: ["Enter", "Delete", " "],
            tabIndex: 1,
            template: (
                options,
                _dom
            ) => `<div class='${options.classes.container}'${options.scrollY.length ? ` style='height: ${options.scrollY}; overflow-Y: auto;'` : ""}></div>
            <div class='${options.classes.bottom}'>
                <nav class='${options.classes.pagination}'></nav>
            </div>`,
            data: {
                headings: [
                    "",
                    this.dtBulk.getHTML(),
                    gettext("Title"),
                    gettext("Created"),
                    gettext("Last changed"),
                    ""
                ],
                data: this.templateList.map(docTemplate =>
                    this.createTableRow(docTemplate)
                )
            },
            columns: [
                {
                    select: 0,
                    type: "number"
                },
                {
                    select: 1,
                    sortable: false,
                    type: "boolean"
                },
                {
                    select: hiddenCols,
                    hidden: true
                },
                {
                    select: 5,
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
                        "data-id": String(id),
                        id: `template-${id}`
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
                            for: `template-${id}`
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
                    const link = this.table.dom.querySelector(
                        `tr[data-index="${rowIndex}"] a`
                    )
                    if (link) {
                        link.click()
                    }
                } else if (key === " ") {
                    const cell = this.table.data.data[rowIndex].cells[1]
                    cell.data = !cell.data
                    cell.text = String(cell.data)
                    this.table.update()
                } else if (key === "Delete") {
                    const cell = this.table.data.data[rowIndex].cells[0]
                    const imageId = cell.data
                    this.deleteDocTemplatesDialog([imageId])
                }
            } else {
                if (
                    event.target.closest("a, span.delete-doc-template, label")
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

    createTableRow(docTemplate) {
        return [
            docTemplate.id,
            false, // Checkbox
            `<span class="${docTemplate.is_owner ? "fw-data-table-title " : ""}fw-inline">
                <i class="far fa-file"></i>
                ${
                    docTemplate.is_owner
                        ? `<a href='/templates/${docTemplate.id}/'>
                        ${
                            docTemplate.title.length
                                ? escapeText(docTemplate.title)
                                : gettext("Untitled")
                        }
                    </a>`
                        : docTemplate.title.length
                          ? escapeText(docTemplate.title)
                          : gettext("Untitled")
                }
            </span>`,
            docTemplate.added, // format?
            docTemplate.updated, // format ?
            `<span class="delete-doc-template fw-inline fw-link-text" data-id="${docTemplate.id}" data-title="${escapeText(docTemplate.title)}">
                ${docTemplate.is_owner ? '<i class="fa fa-trash-alt"></i>' : ""}
           </span>`
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

    addDocTemplateToTable(docTemplate) {
        this.table.insert({data: [this.createTableRow(docTemplate)]})
        // Redo last sort
        this.table.columns.sort(this.lastSort.column, this.lastSort.dir)
    }

    getTemplateListData() {
        if (this.app.isOffline()) {
            return this.showCached()
        }
        return postJson("/api/user_template_manager/list/")
            .then(({json}) => {
                this.updateIndexedDB(json)
                this.initializeView(json)
            })
            .catch(error => {
                if (this.app.isOffline()) {
                    return this.showCached()
                } else {
                    addAlert(
                        "error",
                        gettext("Document templates loading failed.")
                    )
                    throw error
                }
            })
    }

    initializeView(json) {
        if (this.app.page === this) {
            this.templateList = json.document_templates
            this.initTable()
            // Reset scroll position to top to prevent Safari from auto-scrolling
            // to the focused table element, which would hide the header/menu
            window.scrollTo(0, 0)
        }
    }

    showCached() {
        return this.loaddatafromIndexedDB().then(json =>
            this.initializeView(json)
        )
    }

    loaddatafromIndexedDB() {
        return this.app.indexedDB
            .readAllData("templates_list")
            .then(response => ({document_templates: response}))
    }

    updateIndexedDB(json) {
        // Clear data if any present
        this.app.indexedDB.clearData("templates_list").then(() => {
            this.app.indexedDB.insertData(
                "templates_list",
                json.document_templates
            )
        })
    }

    bind() {
        this.dom.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, ".delete-doc-template", el): {
                    const docTemplateId = Number.parseInt(el.target.dataset.id)
                    this.mod.actions.deleteDocTemplatesDialog([docTemplateId])
                    break
                }
                case findTarget(event, "a", el):
                    if (
                        el.target.hostname === window.location.hostname &&
                        el.target.getAttribute("href")[0] === "/"
                    ) {
                        event.preventDefault()
                        this.app.goTo(el.target.href)
                    }
                    break
                default:
                    break
            }
        })
    }

    getSelected() {
        return Array.from(
            this.dom.querySelectorAll(".entry-select:checked:not(:disabled)")
        ).map(el => Number.parseInt(el.getAttribute("data-id")))
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
