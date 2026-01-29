import {DataTable} from "simple-datatables"
import {keyName} from "w3c-keyname"

import * as plugins from "../../../plugins/images_overview"
import {
    DatatableBulk,
    Dialog,
    OverviewMenuView,
    activateWait,
    addAlert,
    baseBodyTemplate,
    deactivateWait,
    ensureCSS,
    escapeText,
    findTarget,
    isActivationEvent,
    localizeDate,
    post,
    setDocTitle,
    whenReady
} from "../../common"
import {FeedbackTab} from "../../feedback"
import {SiteMenu} from "../../menu"
import {ImageOverviewCategories} from "./categories"
import {bulkMenuModel, menuModel} from "./menu"
/** Helper functions for user added images/SVGs.*/

export class ImageOverview {
    constructor({app, user}) {
        this.app = app
        this.user = user
        this.mod = {}

        this.lastSort = {column: 0, dir: "asc"}
    }

    init() {
        ensureCSS([
            staticUrl("css/dialog_usermedia.css"),
            staticUrl("css/dot_menu.css")
        ])

        return whenReady().then(() => {
            this.render()
            new ImageOverviewCategories(this)
            const smenu = new SiteMenu(this.app, "images")
            smenu.init()
            this.menu = new OverviewMenuView(this, menuModel)
            this.menu.init()
            this.activatePlugins()
            this.bindEvents()
            this.mod.categories.setImageCategoryList(this.app.imageDB.cats)
            this.initTable(Object.keys(this.app.imageDB.db))
            // Reset scroll position to top to prevent Safari from auto-scrolling
            // to the focused table element, which would hide the header/menu
            window.scrollTo(0, 0)
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
        ensureCSS([staticUrl("css/cropper.min.css")])
        setDocTitle(gettext("Media Manager"), this.app)
        const feedbackTab = new FeedbackTab()
        feedbackTab.init()
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

    //delete image
    deleteImage(ids) {
        ids = ids.map(id => Number.parseInt(id))
        if (this.app.isOffline()) {
            addAlert(
                "error",
                gettext(
                    "You are currently offline. Please try again when you are back online."
                )
            )
            return
        }
        activateWait()
        post("/api/usermedia/delete/", {ids})
            .catch(error => {
                addAlert("error", gettext("The image(s) could not be deleted"))
                deactivateWait()
                if (this.app.isOffline()) {
                    addAlert(
                        "error",
                        gettext(
                            "You are currently offline. Please try again when you are back online."
                        )
                    )
                } else {
                    throw error
                }
            })
            .then(() => {
                ids.forEach(id => delete this.app.imageDB.db[id])
                this.removeTableRows(ids)
                addAlert("success", gettext("The image(s) have been deleted"))
            })
            .then(() => deactivateWait())
    }

    deleteImageDialog(ids) {
        const buttons = [
            {
                text: gettext("Delete"),
                classes: "fw-dark",
                click: () => {
                    this.deleteImage(ids)
                    dialog.close()
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
            body: `<p>${gettext("Delete the image(s)")}?</p>`,
            buttons
        })
        dialog.open()
    }

    updateTable(ids) {
        // Remove items that already exist
        this.removeTableRows(ids)
        this.table.insert({data: ids.map(id => this.createTableRow(id))})
        // Redo last sort
        this.table.columns.sort(this.lastSort.column, this.lastSort.dir)
    }

    createTableRow(id) {
        const image = this.app.imageDB.db[id]
        const cats = image.cats.map(cat => `cat_${cat}`)

        let fileType = image.file_type.split("/")

        if (1 < fileType.length) {
            fileType = fileType[1].toUpperCase()
        } else {
            fileType = fileType[0].toUpperCase()
        }

        return [
            id,
            false, // checkbox
            `<span class="fw-usermedia-image ${cats.join(" ")}">
                <img src="${image.thumbnail ? image.thumbnail : image.image}">
            </span>
            <span class="fw-usermedia-title">
                <span class="edit-image fw-link-text fw-searchable" data-id="${id}">
                    ${image.title.length ? escapeText(image.title) : gettext("Untitled")}
                </span>
                <span class="fw-usermedia-type">${fileType}</span>
            </span>`,
            `<span>${image.width} x ${image.height}</span>`,
            `<span class="date">${localizeDate(image.added, "sortable-date")}</span>`,
            `<span class="delete-image fw-link-text" data-id="${id}">
                <i class="fa fa-trash-alt"></i>
            </span>`
        ]
    }

    removeTableRows(ids) {
        ids = ids.map(id => Number.parseInt(id))

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

    onResize() {
        if (!this.table) {
            return
        }
        this.initTable(Object.keys(this.app.imageDB.db))
    }

    /* Initialize the overview table */
    initTable(ids) {
        const tableEl = document.createElement("table")
        tableEl.id = "imagelist"
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
                noRows: gettext("No images available"), // Message shown when there are no images
                noResults: gettext("No images found") // Message shown when no images are found after search
            },
            rowNavigation: true,
            rowSelectionKeys: ["Enter", "Delete", " "],
            tabIndex: 1,
            template: (options, _dom) =>
                `<div class='${options.classes.container}'${options.scrollY.length ? ` style='height: ${options.scrollY}; overflow-Y: auto;'` : ""}></div>
            <div class='${options.classes.bottom}'>
                ${
                    options.paging
                        ? `<div class='${options.classes.info}'></div>`
                        : ""
                }
                <nav class='${options.classes.pagination}'></nav>
            </div>`,
            data: {
                headings: [
                    "",
                    this.dtBulk.getHTML(),
                    gettext("File"),
                    gettext("Size (px)"),
                    gettext("Added"),
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
                    type: "boolean"
                },
                {
                    select: hiddenCols,
                    hidden: true
                },
                {
                    select: [1, 3, 5],
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
                        id: `doc-img-${id}`
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
                            for: `doc-img-${id}`
                        }
                    }
                ]
            }
        })

        this.table.on("datatable.sort", (column, dir) => {
            this.lastSort = {column, dir}
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

                    const button = this.table.dom.querySelector(
                        `tr[data-index="${rowIndex}"] span.edit-image`
                    )
                    if (button) {
                        button.click()
                    }
                } else if (key === " ") {
                    const cell = this.table.data.data[rowIndex].cells[1]
                    cell.data = !cell.data
                    cell.text = String(cell.data)
                    this.table.update()
                } else if (key === "Delete") {
                    const cell = this.table.data.data[rowIndex].cells[0]
                    const imageId = cell.data
                    this.deleteImageDialog([imageId])
                }
            } else {
                if (
                    event.target.closest(
                        "span.edit-image, span.delete-image, label"
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

        this.dtBulk.init(this.table)

        this.table.dom.focus()
    }

    // get IDs of selected bib entries
    getSelected() {
        return Array.from(
            this.dom.querySelectorAll(".entry-select:checked:not(:disabled)")
        ).map(el => Number.parseInt(el.getAttribute("data-id")))
    }

    bindEvents() {
        this.dom.addEventListener("click", event =>
            this.handleActivation(event)
        )
        this.dom.addEventListener("keydown", event =>
            this.handleActivation(event)
        )
    }

    handleActivation(event) {
        if (!isActivationEvent(event)) {
            return
        }
        const el = {}
        switch (true) {
            case findTarget(event, ".delete-image", el): {
                const imageId = el.target.dataset.id
                this.deleteImageDialog([imageId])
                break
            }
            case findTarget(event, ".edit-image", el): {
                const imageId = el.target.dataset.id
                import("../edit_dialog").then(({ImageEditDialog}) => {
                    const dialog = new ImageEditDialog(
                        this.app.imageDB,
                        imageId,
                        this
                    )
                    dialog.init().then(() => {
                        this.updateTable([imageId])
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
