import {
    addColumnAfter,
    addColumnBefore,
    addRowAfter,
    addRowBefore,
    deleteColumn,
    deleteRow,
    mergeCells,
    splitCell,
    toggleHeaderCell,
    toggleHeaderColumn,
    toggleHeaderRow
} from "prosemirror-tables"
import {TableConfigurationDialog} from "../../dialogs"

// from https://github.com/ProseMirror/prosemirror-tables/blob/master/src/util.js
const findTable = state => {
    const $head = state.selection.$head
    for (let d = $head.depth; d > 0; d--) {
        if ($head.node(d).type.name == "table") {
            return $head.node(d)
        }
    }
    return false
}

// Adjusted from https://github.com/ProseMirror/prosemirror-tables/blob/master/src/commands.js
export function deleteTable(state, dispatch) {
    const $pos = state.selection.$anchor
    for (let d = $pos.depth; d > 0; d--) {
        const node = $pos.node(d)
        if (node.type.name == "table") {
            if (dispatch) {
                dispatch(
                    state.tr
                        .delete($pos.before(d), $pos.after(d))
                        .scrollIntoView()
                )
            }
            return true
        }
    }
    return false
}

const tableAddedFromTemplate = state => {
    const $head = state.selection.$head
    for (let d = $head.depth; d > 0; d--) {
        if ($head.node(d).type.name == "table") {
            if ($head.node(d - 1).type.name === "table_part") {
                return true
            } else {
                return false
            }
        }
    }
    return true
}

const tableAddedByUser = (table, userId) =>
    table.attrs.track.find(
        track => track.type === "insertion" && track.user === userId
    )
        ? true
        : false
export const tableMenuModel = () => ({
    content: [
        {
            title: editor =>
                `${gettext("Add row above")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext("Add a row above the current row"),
            order: 0,
            action: editor => {
                addRowBefore(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr.setMeta("untracked", true))
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            title: editor =>
                `${gettext("Add row below")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext("Add a row below the current row"),
            order: 1,
            action: editor => {
                addRowAfter(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr.setMeta("untracked", true))
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            title: editor =>
                `${gettext("Add column left")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext("Add a column to the left of the current column"),
            order: 2,
            action: editor => {
                addColumnBefore(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr.setMeta("untracked", true))
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            title: editor =>
                `${gettext("Add column right")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext("Add a column to the right of the current column"),
            order: 3,
            action: editor => {
                addColumnAfter(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr.setMeta("untracked", true))
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            type: "separator",
            order: 4
        },
        {
            title: editor =>
                `${gettext("Delete row")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext("Delete current row"),
            order: 5,
            action: editor => {
                deleteRow(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr.setMeta("untracked", true))
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            title: editor =>
                `${gettext("Delete column")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext("Delete current column"),
            order: 6,
            action: editor => {
                deleteColumn(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr.setMeta("untracked", true))
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            type: "separator",
            order: 7
        },
        {
            title: editor =>
                `${gettext("Merge cells")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext("Merge selected cells"),
            order: 8,
            action: editor => {
                mergeCells(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr.setMeta("untracked", true))
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    editor.currentView.state.selection.jsonID !== "cell" ||
                    editor.currentView.state.selection.$headCell.pos ===
                        editor.currentView.state.selection.$anchorCell.pos ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            title: editor =>
                `${gettext("Split cells")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext("Split selected cell"),
            order: 9,
            action: editor => {
                splitCell(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr.setMeta("untracked", true))
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    editor.currentView.state.selection.jsonID !== "cell" ||
                    editor.currentView.state.selection.$headCell.pos !==
                        editor.currentView.state.selection.$anchorCell.pos ||
                    (editor.currentView.state.selection.$anchorCell.nodeAfter
                        .attrs.rowspan === 1 &&
                        editor.currentView.state.selection.$anchorCell.nodeAfter
                            .attrs.colspan === 1) ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            type: "separator",
            order: 10
        },
        {
            title: editor =>
                `${gettext("Toggle header row")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext("Toggle header-status of currently selected row"),
            order: 11,
            action: editor => {
                toggleHeaderRow(
                    editor.currentView.state,
                    editor.currentView.dispatch
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            title: editor =>
                `${gettext("Toggle header column")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext(
                "Toggle header-status of currently selected column"
            ),
            order: 12,
            action: editor => {
                toggleHeaderColumn(
                    editor.currentView.state,
                    editor.currentView.dispatch
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            title: editor =>
                `${gettext("Toggle header cell")}${editor.view.state.doc.attrs.tracked ? ` (${gettext("Not tracked")})` : ""}`,
            type: "action",
            tooltip: gettext(
                "Toggle header-status of currently selected cells"
            ),
            order: 13,
            action: editor => {
                toggleHeaderCell(
                    editor.currentView.state,
                    editor.currentView.dispatch
                )
            },
            disabled: editor => {
                const table = findTable(editor.currentView.state)
                if (
                    !table ||
                    (["write-tracked", "review-tracked"].includes(
                        editor.docInfo.access_rights
                    ) &&
                        !tableAddedByUser(table, editor.user.id))
                ) {
                    return true
                } else {
                    return false
                }
            }
        },
        {
            type: "separator",
            order: 14
        },
        {
            title: `${gettext("Configure")} ...`,
            type: "action",
            tooltip: gettext("Configure the table."),
            order: 15,
            action: editor => {
                const dialog = new TableConfigurationDialog(editor)
                dialog.init()
                return false
            },
            disabled: editor => !findTable(editor.currentView.state)
        },
        {
            title: gettext("Delete table"),
            type: "action",
            icon: "trash-alt",
            tooltip: gettext("Delete currently selected table"),
            order: 16,
            action: editor => {
                deleteTable(
                    editor.currentView.state,
                    editor.currentView.dispatch
                )
            },
            disabled: editor => tableAddedFromTemplate(editor.currentView.state)
        }
    ]
})
