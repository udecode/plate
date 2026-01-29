import deepEqual from "fast-deep-equal"
import {DataTable} from "simple-datatables"
import {keyName} from "w3c-keyname"

import {
    DatatableBulk,
    OverviewMenuView,
    addAlert,
    avatarTemplate,
    baseBodyTemplate,
    escapeText,
    findTarget,
    postJson,
    setDocTitle,
    whenReady
} from "../common"
import {FeedbackTab} from "../feedback"
import {SiteMenu} from "../menu"
import {DeleteContactDialog} from "./delete_dialog"
import {bulkMenuModel, menuModel} from "./menu"
import {RespondInviteDialog} from "./respond_invite"
import {
    deleteContactCell,
    displayContactType,
    respondInviteCell
} from "./templates"

export class ContactsOverview {
    constructor({app, user}) {
        this.app = app
        this.user = user

        this.contacts = []
    }

    init() {
        return whenReady().then(() => {
            this.render()
            const smenu = new SiteMenu(this.app, "") // Nothing highlighted.
            smenu.init()
            this.menu = new OverviewMenuView(this, menuModel)
            this.menu.init()
            this.bind()
            this.getList()
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
        setDocTitle(gettext("Contacts"), this.app)
        const feedbackTab = new FeedbackTab()
        feedbackTab.init()
    }

    /* Initialize the overview table */
    initTable() {
        if (this.table) {
            this.table.destroy()
            this.table = null
        }
        if (this.dtBulk) {
            this.dtBulk.destroy()
            this.dtBulk = null
        }
        const tableEl = document.createElement("table")
        tableEl.classList.add("fw-data-table")
        tableEl.classList.add("fw-large")
        tableEl.classList.add("contacts-table")
        const contentsEl = document.querySelector(".fw-contents")
        contentsEl.innerHTML = "" // Delete any old table
        contentsEl.appendChild(tableEl)

        this.dtBulk = new DatatableBulk(this, bulkMenuModel(), 2)

        this.table = new DataTable(tableEl, {
            paging: false,
            scrollY: `${Math.max(window.innerHeight - 360, 100)}px`,
            labels: {
                noRows: gettext("No contacts available"),
                noResults: gettext("No contacts found") // Message shown when there are no search results
            },
            template: (options, _dom) =>
                `<div class='${options.classes.container}'style='height: ${options.scrollY}; overflow-Y: auto;'></div>`,
            data: {
                headings: [
                    "",
                    "",
                    this.dtBulk.getHTML(),
                    gettext("Name"),
                    gettext("Type"),
                    gettext("Email address"),
                    ""
                ],
                data: this.contacts.map(contact => this.createTableRow(contact))
            },
            columns: [
                {
                    select: 0,
                    hidden: true,
                    type: "number"
                },
                {
                    select: 1,
                    hidden: true,
                    type: "string"
                },
                {
                    select: 2,
                    type: "boolean"
                },
                {
                    select: [2, 6],
                    sortable: false
                }
            ],
            rowNavigation: true,
            rowSelectionKeys: ["Enter", "Delete", " "],
            tabIndex: 1,
            rowRender: (row, tr, _index) => {
                const id = row.cells[0].data
                const contactType = row.cells[1].data
                const inputNode = {
                    nodeName: "input",
                    attributes: {
                        type: "checkbox",
                        class: `entry-select fw-check ${contactType}`,
                        "data-id": id,
                        "data-type": contactType,
                        id: `contact-${contactType}-${id}`
                    }
                }
                if (row.cells[2].data) {
                    inputNode.attributes.checked = true
                }
                tr.childNodes[0].childNodes = [
                    inputNode,
                    {
                        nodeName: "label",
                        attributes: {
                            for: `contact-${contactType}-${id}`
                        }
                    }
                ]
            }
        })

        this.dtBulk.init(this.table)

        this.table.on("datatable.selectrow", (rowIndex, event, focused) => {
            event.preventDefault()
            if (event.type === "keydown") {
                const key = keyName(event)
                if (key === " ") {
                    const cell = this.table.data.data[rowIndex].cells[2]
                    cell.data = !cell.data
                    cell.text = String(cell.data)
                    this.table.update()
                } else if (key === "Delete") {
                    const id = this.table.data.data[rowIndex].cells[0].data
                    const type = this.table.data.data[rowIndex].cells[1].data
                    this.deleteContact(id, type)
                }
            } else {
                if (
                    event.target.closest(
                        "span.delete-single-contact, button.respond-invite, label"
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

        this.table.dom.focus()
    }

    createTableRow(contact) {
        return [
            contact.id,
            contact.type,
            false, // checkbox
            `${avatarTemplate({user: contact})} ${escapeText(contact.name)}`,
            displayContactType(contact),
            contact.email,
            contact.type === "to_userinvite"
                ? respondInviteCell(contact)
                : deleteContactCell(contact)
        ]
    }

    getList() {
        const cachedPromise = this.showCached()
        if (this.app.isOffline()) {
            return cachedPromise
        }
        return postJson("/api/user/contacts/list/")
            .then(({json}) => {
                return cachedPromise.then(oldJson => {
                    if (!deepEqual(json, oldJson)) {
                        this.updateIndexedDB(json)
                        this.loadData(json)
                        this.initializeView()
                    }
                })
            })
            .catch(error => {
                if (!this.app.isOffline()) {
                    addAlert("error", gettext("Could not obtain contacts list"))
                    throw error
                }
            })
    }

    loadData(json) {
        this.contacts = json.contacts
    }

    initializeView() {
        if (this.app.page === this) {
            this.initTable()
            // Reset scroll position to top to prevent Safari from auto-scrolling
            // to the focused table element, which would hide the header/menu
            window.scrollTo(0, 0)
        }
    }

    showCached() {
        return this.loaddatafromIndexedDB().then(json => {
            if (!json) {
                return Promise.resolve(false)
            }
            this.loadData(json)
            this.initializeView(json)
            return json
        })
    }

    loaddatafromIndexedDB() {
        return this.app.indexedDB.readAllData("user_data").then(response => {
            if (!response.length) {
                return false
            }
            const data = response[0]
            delete data.id
            return data
        })
    }

    updateIndexedDB(json) {
        json.id = 1
        // Clear data if any present
        return this.app.indexedDB
            .clearData("user_data")
            .then(() => this.app.indexedDB.insertData("user_data", [json]))
    }

    bind() {
        this.dom.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, ".delete-single-contact", el): {
                    //delete single user
                    const id = Number.parseInt(el.target.dataset.id)
                    const type = el.target.dataset.type

                    this.deleteContact(id, type)
                    break
                }
                case findTarget(event, ".respond-invite", el): {
                    const id = Number.parseInt(el.target.dataset.id)
                    const invite = this.contacts.find(
                        contact =>
                            contact.id === id &&
                            contact.type === "to_userinvite"
                    )
                    const dialog = new RespondInviteDialog(
                        [invite],
                        contacts =>
                            (this.contacts = this.contacts.concat(contacts)),
                        invites =>
                            (this.contacts = this.contacts.filter(
                                contact =>
                                    !invites.find(
                                        invite =>
                                            invite.type === contact.type &&
                                            invite.id === contact.id
                                    )
                            )),
                        () => this.initializeView()
                    )
                    dialog.init()
                    break
                }
                default:
                    break
            }
        })
    }

    // get IDs of selected contacts
    getSelected() {
        return Array.from(
            this.dom.querySelectorAll(".entry-select:checked:not(:disabled)")
        ).map(el => ({
            id: Number.parseInt(el.dataset.id),
            type: el.dataset.type
        }))
    }

    deleteContact(id, type) {
        const dialog = new DeleteContactDialog([{id, type}])
        dialog.init().then(() => {
            this.contacts = this.contacts.filter(
                ocontact => ocontact.id !== id || ocontact.type !== type
            )
            this.initializeView()
        })
    }
}
