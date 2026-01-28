import {toggleMark} from "prosemirror-commands"

import {COMMENT_ONLY_ROLES} from "../.."
import {randomAnchorId} from "../../../schema/common"
import {checkProtectedInSelection} from "../../state_plugins"
import {acceptAll, rejectAll} from "../../track"

const tracksInSelection = view => {
    // Check whether track marks are present within the range of selection
    let tracks = false
    const from = view.state.selection.from,
        to = view.state.selection.to

    view.state.doc.nodesBetween(from, to, (node, pos) => {
        if (pos < from && !node.isInline) {
            return true
        } else if (tracks) {
            return false
        } else if (node.attrs.track?.length) {
            tracks = true
        } else if (
            node.marks?.find(mark => {
                if (
                    ["deletion", "format_change"].includes(mark.type.name) ||
                    (mark.type.name === "insertion" && !mark.attrs.approved)
                ) {
                    return true
                } else {
                    return false
                }
            })
        ) {
            tracks = true
        }
    })
    return tracks
}

export const selectionMenuModel = () => ({
    content: [
        {
            type: "button",
            title: gettext("Comment"),
            icon: "comment",
            action: editor => {
                editor.mod.comments.interactions.createNewComment()
                return false
            },
            hidden: editor =>
                editor.currentView.state.selection.$anchor.depth < 1,
            selected: editor =>
                !!editor.currentView.state.selection.$head
                    .marks()
                    .some(mark => mark.type.name === "comment"),
            disabled: editor => {
                if (editor.currentView === editor.view) {
                    //  main editor
                    return checkProtectedInSelection(editor.view.state)
                } else {
                    // footnote editor
                    return false
                }
            },
            order: 1
        },
        {
            type: "button",
            title: gettext("Anchor"),
            icon: "anchor",
            action: editor => {
                const mark = editor.currentView.state.schema.marks["anchor"]
                const command = toggleMark(mark, {id: randomAnchorId()})
                command(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr)
                )
            },
            disabled: editor => {
                if (editor.currentView === editor.view) {
                    //  main editor
                    return (
                        checkProtectedInSelection(editor.view.state) ||
                        COMMENT_ONLY_ROLES.includes(
                            editor.docInfo.access_rights
                        )
                    )
                } else {
                    // footnote editor
                    return COMMENT_ONLY_ROLES.includes(
                        editor.docInfo.access_rights
                    )
                }
            },
            hidden: editor =>
                editor.currentView.state.selection.$anchor.depth < 1,
            selected: editor =>
                !!editor.currentView.state.selection.$head
                    .marks()
                    .some(mark => mark.type.name === "anchor"),
            order: 2
        },
        {
            type: "button",
            title: gettext("Accept all in selection"),
            icon: "check-double",
            action: editor =>
                acceptAll(
                    editor.currentView,
                    editor.currentView.state.selection.from,
                    editor.currentView.state.selection.to
                ),
            disabled: editor => editor.docInfo.access_rights !== "write",
            hidden: editor =>
                editor.currentView.state.selection.$anchor.depth < 1 ||
                !tracksInSelection(editor.currentView),
            order: 3
        },
        {
            type: "button",
            title: gettext("Reject all in selection"),
            icon: "trash",
            action: editor =>
                rejectAll(
                    editor.currentView,
                    editor.currentView.state.selection.from,
                    editor.currentView.state.selection.to
                ),
            disabled: editor => editor.docInfo.access_rights !== "write",
            hidden: editor =>
                editor.currentView.state.selection.$anchor.depth < 1 ||
                !tracksInSelection(editor.currentView),
            order: 4
        }
    ]
})
