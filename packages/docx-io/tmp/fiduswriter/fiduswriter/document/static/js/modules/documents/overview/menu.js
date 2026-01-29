import {FileDialog, NewFolderDialog, addAlert} from "../../common"
import {DocumentAccessRightsDialog} from "../access_rights"

export const bulkMenuModel = () => ({
    content: [
        {
            title: gettext("Move selected"),
            tooltip: gettext("Move the documents that have been selected."),
            action: overview => {
                const ids = overview.getSelected()
                const docs = ids.map(id =>
                    overview.documentList.find(doc => doc.id === id)
                )
                if (docs.length) {
                    const dialog = new FileDialog({
                        title:
                            docs.length > 1
                                ? gettext("Move documents")
                                : gettext("Move document"),
                        movingFiles: docs,
                        allFiles: overview.documentList,
                        moveUrl: "/api/document/move/",
                        successMessage: gettext("Document has been moved"),
                        errorMessage: gettext("Could not move document"),
                        succcessCallback: (file, path) => {
                            file.path = path
                            overview.initTable()
                        }
                    })
                    dialog.init()
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 1
        },
        {
            title: gettext("Share selected"),
            tooltip: gettext("Share the documents that have been selected."),
            action: overview => {
                const ids = overview.getSelected()
                const ownIds = ids.filter(
                    id =>
                        overview.documentList.find(doc => doc.id === id)
                            .is_owner
                )
                if (ownIds.length !== ids.length) {
                    addAlert(
                        "error",
                        gettext("You cannot share documents of other users")
                    )
                }
                if (ownIds.length) {
                    const dialog = new DocumentAccessRightsDialog(
                        ids,
                        overview.contacts,
                        memberDetails => overview.contacts.push(memberDetails)
                    )
                    dialog.init()
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 1
        },
        {
            title: gettext("Copy selected"),
            tooltip: gettext("Copy the documents that have been selected."),
            action: overview => {
                const ids = overview.getSelected()
                if (ids.length) {
                    overview.mod.actions.copyFiles(ids)
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 2
        },
        {
            title: gettext("Export selected as Epub"),
            tooltip: gettext(
                "Export the documents that have been selected as Epub files."
            ),
            action: overview => {
                const ids = overview.getSelected()
                if (ids.length) {
                    overview.mod.actions.downloadEpubFiles(ids)
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 3
        },
        {
            title: gettext("Export selected as HTML"),
            tooltip: gettext(
                "Export the documents that have been selected as HTML files."
            ),
            action: overview => {
                const ids = overview.getSelected()
                if (ids.length) {
                    overview.mod.actions.downloadHTMLFiles(ids)
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 4
        },
        {
            title: gettext("Export selected as LaTeX"),
            tooltip: gettext(
                "Export the documents that have been selected as LaTeX files."
            ),
            action: overview => {
                const ids = overview.getSelected()
                if (ids.length) {
                    overview.mod.actions.downloadLatexFiles(ids)
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 5
        },
        {
            title: gettext("Export selected as JATS"),
            tooltip: gettext(
                "Export the documents that have been selected as JATS files."
            ),
            action: overview => {
                const ids = overview.getSelected()
                if (ids.length) {
                    overview.mod.actions.downloadJATSFiles(ids)
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 6
        },
        {
            title: gettext("Export selected as BITS"),
            tooltip: gettext(
                "Export the documents that have been selected as BITS files."
            ),
            action: overview => {
                const ids = overview.getSelected()
                if (ids.length) {
                    overview.mod.actions.downloadBITSFiles(ids)
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 7
        },
        {
            title: gettext("Export selected as FIDUS"),
            tooltip: gettext(
                "Export the documents that have been selected as FIDUS files including their templates."
            ),
            action: overview => {
                const ids = overview.getSelected()
                if (ids.length) {
                    overview.mod.actions.downloadNativeFiles(ids)
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 8
        },
        {
            title: gettext("Export selected as Slim FIDUS"),
            tooltip: gettext(
                "Export the documents that have been selected as FIDUS files without their templates."
            ),
            action: overview => {
                const ids = overview.getSelected()
                if (ids.length) {
                    overview.mod.actions.downloadSlimNativeFiles(ids)
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 9
        },
        {
            title: gettext("Delete selected"),
            tooltip: gettext("Delete the documents that have been selected."),
            action: overview => {
                const ids = overview.getSelected()
                const ownIds = ids.filter(
                    id =>
                        overview.documentList.find(doc => doc.id === id)
                            .is_owner
                )
                if (ownIds.length !== ids.length) {
                    addAlert(
                        "error",
                        gettext("You cannot delete documents of other users")
                    )
                }
                if (ownIds.length) {
                    overview.mod.actions.deleteDocumentDialog(
                        ownIds,
                        overview.app
                    )
                }
            },
            disabled: overview =>
                !overview.getSelected().length || overview.app.isOffline(),
            order: 10
        }
    ]
})

let currentlySearching = false

export const menuModel = () => ({
    content: [
        {
            type: "text",
            id: "new_document",
            title: gettext("Create new document"),
            keys: "Alt-n",
            action: overview => overview.goToNewDocument("new"),
            order: 1
        },
        {
            type: "text",
            title: gettext("Create new folder"),
            keys: "Alt-f",
            action: overview => {
                const dialog = new NewFolderDialog(folderName => {
                    overview.path = overview.path + folderName + "/"
                    window.history.pushState(
                        {},
                        "",
                        "/documents" + overview.path
                    )
                    overview.initTable()
                })
                dialog.open()
            },
            order: 2
        },
        {
            type: "text",
            title: gettext("Upload FIDUS document"),
            keys: "Alt-u",
            action: overview => overview.mod.actions.importFidus(),
            order: 3
        },
        {
            type: "text",
            id: "import_external",
            title: gettext("Import document"),
            keys: "Alt-i",
            action: overview => overview.mod.actions.importExternal(),
            order: 4
        },
        {
            type: "search",
            icon: "search",
            title: gettext("Search documents"),
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
            order: 5
        }
    ]
})
