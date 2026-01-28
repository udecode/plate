import {toggleMark, wrapIn} from "prosemirror-commands"
import {redo, redoDepth, undo, undoDepth} from "prosemirror-history"
import {wrapInList} from "prosemirror-schema-list"

import {COMMENT_ONLY_ROLES, READ_ONLY_ROLES} from "../.."
import {
    CitationDialog,
    FigureDialog,
    LinkDialog,
    MathDialog,
    TableDialog
} from "../../dialogs"
import {setBlockType} from "../../keymap"
import {checkProtectedInSelection} from "../../state_plugins"

const BLOCK_LABELS = {
    paragraph: gettext("Normal Text"),
    heading1: gettext("1st Heading"),
    heading2: gettext("2nd Heading"),
    heading3: gettext("3rd Heading"),
    heading4: gettext("4th Heading"),
    heading5: gettext("5th Heading"),
    heading6: gettext("6th Heading"),
    code_block: gettext("Code"),
    figure: gettext("Figure")
}

// from https://github.com/ProseMirror/prosemirror-tables/blob/master/src/util.js
const findTable = state => {
    const $head = state.selection.$head
    for (let d = $head.depth; d > 0; d--) {
        if ($head.node(d).type.spec.tableRole == "table") {
            return $head.node(d)
        }
    }
    return false
}

function elementAvailable(editor, elementName) {
    let elementInDocParts = false
    editor.view.state.doc.forEach(docPart => {
        if (
            docPart.attrs.elements &&
            docPart.attrs.elements.includes(elementName)
        ) {
            elementInDocParts = true
        }
    })
    return (
        editor.view.state.doc.attrs.footnote_elements.includes(elementName) ||
        elementInDocParts
    )
}

export function elementDisabled(editor, elementName) {
    if (editor.currentView === editor.view) {
        // main editor
        const anchorDocPart =
                editor.currentView.state.selection.$anchor.node(1),
            headDocPart = editor.currentView.state.selection.$head.node(1)

        return (
            !anchorDocPart ||
            headDocPart !== anchorDocPart ||
            !anchorDocPart.attrs.elements ||
            !anchorDocPart.attrs.elements.includes(elementName) ||
            checkProtectedInSelection(editor.view.state)
        )
    } else {
        // footnote editor
        const anchorFootnote =
                editor.currentView.state.selection.$anchor.node(1),
            headFootnote = editor.currentView.state.selection.$head.node(1)

        return (
            !anchorFootnote ||
            headFootnote !== anchorFootnote ||
            !editor.view.state.doc.attrs.footnote_elements.includes(elementName)
        )
    }
}

function markAvailable(editor, markName) {
    let markInDocParts = false
    editor.view.state.doc.forEach(docPart => {
        if (docPart.attrs.elements && docPart.attrs.marks.includes(markName)) {
            markInDocParts = true
        }
    })
    return (
        editor.view.state.doc.attrs.footnote_marks.includes(markName) ||
        markInDocParts
    )
}

function markDisabled(editor, markName) {
    if (editor.currentView === editor.view) {
        // main editor
        const anchorDocPart =
                editor.currentView.state.selection.$anchor.node(1),
            headDocPart = editor.currentView.state.selection.$head.node(1)

        return (
            !anchorDocPart ||
            headDocPart !== anchorDocPart ||
            !anchorDocPart.attrs.marks ||
            !anchorDocPart.attrs.marks.includes(markName) ||
            checkProtectedInSelection(editor.view.state)
        )
    } else {
        // footnote editor
        const anchorFootnote =
                editor.currentView.state.selection.$anchor.node(1),
            headFootnote = editor.currentView.state.selection.$head.node(1)

        return (
            !anchorFootnote ||
            headFootnote !== anchorFootnote ||
            !editor.view.state.doc.attrs.footnote_marks.includes(markName)
        )
    }
}

export const toolbarModel = () => ({
    openMore: false, // whether 'more' menu is opened.
    content: [
        {
            type: "button",
            title: gettext("Open/close header menu"),
            icon: editor => {
                if (editor.menu.headerbarModel.open) {
                    return "angle-double-up"
                } else {
                    return "angle-double-down"
                }
            },
            action: editor => {
                editor.menu.headerbarModel.open =
                    !editor.menu.headerbarModel.open
                if (editor.menu.headerView) {
                    editor.menu.headerView.update()
                }
            },
            class: editor => {
                if (editor.menu.headerbarModel.open) {
                    return "no-border"
                } else {
                    return "no-border header-closed"
                }
            },
            order: 0
        },
        {
            type: "info",
            show: editor => {
                let title = ""
                if (editor.currentView !== editor.view) {
                    return gettext("Footnote")
                } else if (
                    editor.currentView.state.selection.$anchor.node(1) &&
                    editor.currentView.state.selection.$anchor.node(1) ===
                        editor.currentView.state.selection.$head.node(1)
                ) {
                    title =
                        editor.currentView.state.selection.$anchor.node(1).attrs
                            .title || gettext("Title")
                    return title.length > 20
                        ? title.slice(0, 20) + "..."
                        : title
                } else if (
                    editor.currentView.state.selection.$anchor.depth === 0 &&
                    editor.currentView.state.selection.from ===
                        editor.currentView.state.selection.to
                ) {
                    title =
                        editor.currentView.state.selection.$anchor.nodeAfter
                            .attrs.title
                    return title.length > 20
                        ? title.slice(0, 20) + "..."
                        : title
                } else if (
                    editor.currentView.state.selection.jsonID === "node" &&
                    editor.currentView.state.selection.node.isBlock &&
                    editor.currentView.state.selection.node.attrs.title
                ) {
                    title = editor.currentView.state.selection.node.attrs.title
                    return title.length > 20
                        ? title.slice(0, 20) + "..."
                        : title
                } else {
                    return ""
                }
            },
            order: 1
        },
        {
            type: "menu",
            show: editor => {
                if (
                    editor.currentView.state.selection.$anchor.node(1) &&
                    !editor.view.state.selection.$anchor.node(1).attrs.elements
                ) {
                    return ""
                }
                if (
                    editor.currentView.state.selection.jsonID === "node" &&
                    editor.currentView.state.selection.node.isBlock
                ) {
                    const selectedNode = editor.currentView.state.selection.node
                    return BLOCK_LABELS[selectedNode.type.name]
                        ? BLOCK_LABELS[selectedNode.type.name]
                        : ""
                }
                const startElement =
                        editor.currentView.state.selection.$anchor.parent,
                    endElement = editor.currentView.state.selection.$head.parent
                if (!startElement || !endElement) {
                    return ""
                } else if (startElement === endElement) {
                    const blockNodeType = startElement.type.name
                    return BLOCK_LABELS[blockNodeType]
                        ? BLOCK_LABELS[blockNodeType]
                        : ""
                } else {
                    let blockNodeType = true
                    editor.currentView.state.doc.nodesBetween(
                        editor.currentView.state.selection.from,
                        editor.currentView.state.selection.to,
                        node => {
                            if (node.isTextblock) {
                                const nextBlockNodeType = node.type.name
                                if (blockNodeType === true) {
                                    blockNodeType = nextBlockNodeType
                                }
                                if (blockNodeType !== nextBlockNodeType) {
                                    blockNodeType = false
                                }
                            }
                        }
                    )

                    if (blockNodeType) {
                        return BLOCK_LABELS[blockNodeType]
                            ? BLOCK_LABELS[blockNodeType]
                            : ""
                    } else {
                        return ""
                    }
                }
            },
            disabled: editor =>
                READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                !editor.currentView.state.selection.$anchor.node(1) ||
                !editor.currentView.state.selection.$anchor.node(1).attrs
                    .elements ||
                (editor.currentView.state.selection.jsonID === "node" &&
                    editor.currentView.state.selection.node.isBlock &&
                    !editor.currentView.state.selection.node.isTextblock) ||
                editor.currentView.state.selection.jsonID === "gapcursor",
            content: [
                {
                    title: BLOCK_LABELS["paragraph"],
                    action: editor => {
                        const view = editor.currentView
                        setBlockType(view.state.schema.nodes.paragraph)(
                            view.state,
                            view.dispatch
                        )
                    },
                    available: editor => elementAvailable(editor, "paragraph"),
                    disabled: editor => elementDisabled(editor, "paragraph"),
                    order: 0
                },
                {
                    title: BLOCK_LABELS["heading1"],
                    action: editor => {
                        const view = editor.currentView
                        setBlockType(view.state.schema.nodes.heading1)(
                            view.state,
                            view.dispatch
                        )
                    },
                    available: editor => elementAvailable(editor, "heading1"),
                    disabled: editor => elementDisabled(editor, "heading1"),
                    order: 1
                },
                {
                    title: BLOCK_LABELS["heading2"],
                    action: editor => {
                        const view = editor.currentView
                        setBlockType(view.state.schema.nodes.heading2)(
                            view.state,
                            view.dispatch
                        )
                    },
                    available: editor => elementAvailable(editor, "heading2"),
                    disabled: editor => elementDisabled(editor, "heading2"),
                    order: 2
                },
                {
                    title: BLOCK_LABELS["heading3"],
                    action: editor => {
                        const view = editor.currentView
                        setBlockType(view.state.schema.nodes.heading3)(
                            view.state,
                            view.dispatch
                        )
                    },
                    available: editor => elementAvailable(editor, "heading3"),
                    disabled: editor => elementDisabled(editor, "heading3"),
                    order: 3
                },
                {
                    title: BLOCK_LABELS["heading4"],
                    action: editor => {
                        const view = editor.currentView
                        setBlockType(view.state.schema.nodes.heading4)(
                            view.state,
                            view.dispatch
                        )
                    },
                    available: editor => elementAvailable(editor, "heading4"),
                    disabled: editor => elementDisabled(editor, "heading4"),
                    order: 4
                },
                {
                    title: BLOCK_LABELS["heading5"],
                    action: editor => {
                        const view = editor.currentView
                        setBlockType(view.state.schema.nodes.heading5)(
                            view.state,
                            view.dispatch
                        )
                    },
                    available: editor => elementAvailable(editor, "heading5"),
                    disabled: editor => elementDisabled(editor, "heading5"),
                    order: 5
                },
                {
                    title: BLOCK_LABELS["heading6"],
                    action: editor => {
                        const view = editor.currentView
                        setBlockType(view.state.schema.nodes.heading6)(
                            view.state,
                            view.dispatch
                        )
                    },
                    available: editor => elementAvailable(editor, "heading6"),
                    disabled: editor => elementDisabled(editor, "heading6"),
                    order: 6
                },
                {
                    title: BLOCK_LABELS["code_block"],
                    action: editor => {
                        const view = editor.currentView
                        setBlockType(view.state.schema.nodes.code_block)(
                            view.state,
                            view.dispatch
                        )
                    },
                    available: editor => elementAvailable(editor, "code_block"),
                    disabled: editor => elementDisabled(editor, "code_block"),
                    order: 7
                }
            ],
            order: 2
        },
        {
            type: "button",
            title: gettext("Strong"),
            icon: "bold",
            action: editor => {
                const mark = editor.currentView.state.schema.marks["strong"]
                const command = toggleMark(mark)
                command(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr)
                )
            },
            available: editor => markAvailable(editor, "strong"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    editor.currentView.state.selection.jsonID === "gapcursor" ||
                    markDisabled(editor, "strong")
                ) {
                    return true
                }
            },
            selected: editor => {
                const storedMarks = editor.currentView.state.storedMarks
                if (
                    storedMarks?.some(mark => mark.type.name === "strong") ||
                    editor.currentView.state.selection.$head
                        .marks()
                        .some(mark => mark.type.name === "strong")
                ) {
                    return true
                } else {
                    return false
                }
            },
            order: 3
        },
        {
            type: "button",
            title: gettext("Emphasis"),
            icon: "italic",
            action: editor => {
                const mark = editor.currentView.state.schema.marks["em"]
                const command = toggleMark(mark)
                command(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr)
                )
            },
            available: editor => markAvailable(editor, "em"),
            disabled: editor =>
                READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                editor.currentView.state.selection.jsonID === "gapcursor" ||
                markDisabled(editor, "em"),
            selected: editor => {
                const storedMarks = editor.currentView.state.storedMarks
                if (
                    storedMarks?.some(mark => mark.type.name === "em") ||
                    editor.currentView.state.selection.$head
                        .marks()
                        .some(mark => mark.type.name === "em")
                ) {
                    return true
                } else {
                    return false
                }
            },
            order: 4
        },
        {
            type: "button",
            title: gettext("Underline"),
            icon: "underline",
            action: editor => {
                const mark = editor.currentView.state.schema.marks["underline"]
                const command = toggleMark(mark)
                command(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr)
                )
            },
            available: editor => markAvailable(editor, "underline"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    editor.currentView.state.selection.jsonID === "gapcursor" ||
                    markDisabled(editor, "underline")
                ) {
                    return true
                }
            },
            selected: editor => {
                const storedMarks = editor.currentView.state.storedMarks
                if (
                    storedMarks?.some(mark => mark.type.name === "underline") ||
                    editor.currentView.state.selection.$head
                        .marks()
                        .some(mark => mark.type.name === "underline")
                ) {
                    return true
                } else {
                    return false
                }
            },
            order: 5
        },
        {
            type: "button",
            title: gettext("Numbered list"),
            icon: "list-ol",
            action: editor => {
                const node =
                    editor.currentView.state.schema.nodes["ordered_list"]
                const command = wrapInList(node)
                command(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr)
                )
            },
            available: editor => elementAvailable(editor, "ordered_list"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    elementDisabled(editor, "ordered_list")
                ) {
                    return true
                }
            },
            selected: editor => {
                const depth =
                    editor.currentView.state.selection.$head.sharedDepth(
                        editor.currentView.state.selection.anchor
                    )
                const nodeType =
                    editor.currentView.state.schema.nodes["ordered_list"]
                for (let i = 0; i < depth; i++) {
                    const node =
                        editor.currentView.state.selection.$head.node(i)
                    if (node.type === nodeType) {
                        return true
                    }
                }
                return false
            },
            order: 6
        },
        {
            type: "button",
            title: gettext("Bullet list"),
            icon: "list-ul",
            action: editor => {
                const node =
                    editor.currentView.state.schema.nodes["bullet_list"]
                const command = wrapInList(node)
                command(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr)
                )
            },
            available: editor => elementAvailable(editor, "bullet_list"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    elementDisabled(editor, "bullet_list")
                ) {
                    return true
                }
            },
            selected: editor => {
                const depth =
                    editor.currentView.state.selection.$head.sharedDepth(
                        editor.currentView.state.selection.anchor
                    )
                const nodeType =
                    editor.currentView.state.schema.nodes["bullet_list"]
                for (let i = 0; i < depth; i++) {
                    const node =
                        editor.currentView.state.selection.$head.node(i)
                    if (node.type === nodeType) {
                        return true
                    }
                }
                return false
            },
            order: 7
        },
        {
            type: "button",
            title: gettext("Blockquote"),
            icon: "quote-right",
            action: editor => {
                const node = editor.currentView.state.schema.nodes["blockquote"]
                const command = wrapIn(node)
                command(editor.currentView.state, tr =>
                    editor.currentView.dispatch(tr)
                )
            },
            available: editor => elementAvailable(editor, "blockquote"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    elementDisabled(editor, "blockquote")
                ) {
                    return true
                }
            },
            selected: editor => {
                const depth =
                    editor.currentView.state.selection.$head.sharedDepth(
                        editor.currentView.state.selection.anchor
                    )
                const nodeType =
                    editor.currentView.state.schema.nodes["blockquote"]
                for (let i = 0; i < depth; i++) {
                    const node =
                        editor.currentView.state.selection.$head.node(i)
                    if (node.type === nodeType) {
                        return true
                    }
                }
                return false
            },
            order: 8
        },
        {
            id: "link",
            type: "button",
            title: gettext("Link"),
            icon: "link",
            action: editor => {
                const dialog = new LinkDialog(editor)
                dialog.init()
            },
            available: editor => markAvailable(editor, "link"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    (markDisabled(editor, "link") &&
                        elementDisabled(editor, "cross_reference"))
                ) {
                    return true
                }
            },
            selected: editor =>
                editor.currentView.state.selection.$head
                    .marks()
                    .some(mark => mark.type.name === "link"),
            order: 9
        },
        {
            type: "button",
            title: gettext("Footnote"),
            icon: "asterisk",
            action: editor => {
                const node = editor.view.state.schema.nodes["footnote"]
                const tr = editor.view.state.tr.replaceSelectionWith(
                    node.createAndFill(),
                    false
                )
                editor.view.dispatch(tr)
                return false
            },
            available: editor => elementAvailable(editor, "footnote"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    editor.view !== editor.currentView || // we don't allow footnotes in footnotes
                    elementDisabled(editor, "footnote")
                ) {
                    return true
                }
            },
            order: 10
        },
        {
            type: "button",
            title: gettext("Cite"),
            icon: "book",
            action: editor => {
                const dialog = new CitationDialog(editor)
                dialog.init()
                return false
            },
            available: editor => elementAvailable(editor, "citation"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    elementDisabled(editor, "citation") ||
                    !["text", "node"].includes(
                        editor.currentView.state.selection.jsonID
                    ) ||
                    (editor.currentView.state.selection.jsonID === "node" &&
                        editor.currentView.state.selection.node.type.name !==
                            "citation")
                ) {
                    return true
                }
            },
            order: 11
        },
        {
            type: "button",
            title: gettext("Horizontal line"),
            icon: "minus",
            action: editor => {
                const view = editor.currentView,
                    state = view.state
                view.dispatch(
                    state.tr.replaceSelectionWith(
                        state.schema.node("horizontal_rule")
                    )
                )
            },
            available: editor => elementAvailable(editor, "horizontal_rule"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    elementDisabled(editor, "horizontal_rule")
                ) {
                    return true
                }
            },
            order: 12
        },
        {
            type: "button",
            title: gettext("Math"),
            icon: "percent",
            action: editor => {
                const dialog = new MathDialog(editor)
                dialog.init()
            },
            available: editor => elementAvailable(editor, "equation"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    elementDisabled(editor, "equation") ||
                    !["text", "node"].includes(
                        editor.currentView.state.selection.jsonID
                    ) ||
                    (editor.currentView.state.selection.jsonID === "node" &&
                        editor.currentView.state.selection.node.type.name !==
                            "equation")
                ) {
                    return true
                }
            },
            order: 13
        },
        {
            type: "button",
            title: gettext("Figure"),
            icon: "image",
            action: editor => {
                const dialog = new FigureDialog(editor)
                dialog.init()
                return false
            },
            available: editor => elementAvailable(editor, "figure"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    elementDisabled(editor, "figure")
                ) {
                    return true
                }
            },
            order: 14
        },
        {
            type: "button",
            title: gettext("Table"),
            tooltip: gettext("Insert a table into the document."),
            icon: "table",
            action: editor => {
                const dialog = new TableDialog(editor)
                dialog.init()
                return false
            },
            available: editor => elementAvailable(editor, "table"),
            disabled: editor => {
                if (
                    READ_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    COMMENT_ONLY_ROLES.includes(editor.docInfo.access_rights) ||
                    elementDisabled(editor, "table") ||
                    findTable(editor.currentView.state)
                ) {
                    return true
                }
            },
            order: 15
        },
        {
            type: "button",
            title: gettext("Undo"),
            icon: "undo",
            action: editor =>
                undo(editor.currentView.state, tr =>
                    editor.currentView.dispatch(
                        tr.setMeta("inputType", "historyUndo")
                    )
                ),
            disabled: editor => undoDepth(editor.currentView.state) === 0,
            order: 16
        },
        {
            type: "button",
            title: gettext("Redo"),
            icon: "redo",
            action: editor =>
                redo(editor.currentView.state, tr =>
                    editor.currentView.dispatch(
                        tr.setMeta("inputType", "historyRedo")
                    )
                ),
            disabled: editor => redoDepth(editor.currentView.state) === 0,
            order: 17
        }
    ]
})
