import {AddContactDialog} from "./add_dialog"
import {DeleteContactDialog} from "./delete_dialog"

export const bulkMenuModel = () => ({
    content: [
        {
            title: gettext("Delete selected"),
            tooltip: gettext("Delete selected contacts."),
            action: overview => {
                const selected = overview.getSelected()
                if (selected.length) {
                    const dialog = new DeleteContactDialog(selected)
                    dialog.init().then(() => {
                        overview.contacts = overview.contacts.filter(
                            ocontact =>
                                !selected.some(
                                    scontact =>
                                        scontact.id == ocontact.id &&
                                        scontact.type == ocontact.type
                                )
                        )
                        overview.initializeView()
                    })
                }
            },
            disabled: overview => !overview.getSelected().length
        }
    ]
})

let currentlySearching = false

export const menuModel = () => ({
    content: [
        {
            type: "text",
            title: gettext("Invite contact"),
            keys: "Alt-i",
            action: overview => {
                const dialog = new AddContactDialog()
                dialog.init().then(contacts => {
                    contacts.forEach(contact => overview.contacts.push(contact))
                    overview.initializeView()
                })
            },
            order: 0
        },
        {
            type: "search",
            icon: "search",
            title: gettext("Search contacts"),
            keys: "Alt-s",
            input: (overview, text) => {
                if (text.length && !currentlySearching) {
                    overview.initTable(true)
                    currentlySearching = true
                    overview.table.on("datatable.init", () =>
                        overview.table.search(text)
                    )
                } else if (!text.length && currentlySearching) {
                    overview.initTable(false)
                    currentlySearching = false
                } else if (text.length) {
                    overview.table.search(text)
                }
            },
            order: 1
        }
    ]
})
