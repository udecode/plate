import {baseKeymap, toggleMark} from "prosemirror-commands"
import {history, redo, undo} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {EditorState, Plugin} from "prosemirror-state"
import {Decoration, DecorationSet, EditorView} from "prosemirror-view"

import {InlineTools, icon} from "../../../prosemirror/inline_tools"
import {litSchema} from "../../schema/literal"

export class LiteralFieldForm {
    constructor(dom, initialValue = [], placeHolder = false) {
        this.dom = dom
        this.initialValue = initialValue
        this.placeHolder = placeHolder
        this.placeHolderSet = false
    }

    init() {
        const doc = litSchema.nodeFromJSON({
            type: "doc",
            content: [
                {
                    type: "literal",
                    content: this.initialValue
                }
            ]
        })

        this.view = new EditorView(this.dom, {
            state: EditorState.create({
                schema: litSchema,
                doc,
                plugins: [
                    history(),
                    keymap(baseKeymap),
                    keymap({
                        "Mod-z": undo,
                        "Mod-shift-z": undo,
                        "Mod-y": redo,
                        "Mod-b": () => {
                            const sMark = this.view.state.schema.marks["strong"]
                            const command = toggleMark(sMark)
                            command(this.view.state, tr =>
                                this.view.dispatch(tr)
                            )
                        },
                        "Mod-i": () => {
                            const sMark = this.view.state.schema.marks["em"]
                            const command = toggleMark(sMark)
                            command(this.view.state, tr =>
                                this.view.dispatch(tr)
                            )
                        }
                    }),
                    this.placeholderPlugin(),
                    InlineTools([
                        {
                            command: toggleMark(litSchema.marks.strong),
                            dom: icon("strong", gettext("Strong"))
                        },
                        {
                            command: toggleMark(litSchema.marks.em),
                            dom: icon("em", gettext("Emphasis"))
                        },
                        {
                            command: toggleMark(litSchema.marks.smallcaps),
                            dom: icon("smallcaps", gettext("Small caps"))
                        },
                        {
                            command: toggleMark(litSchema.marks.sub),
                            dom: icon("sub", gettext("Subscript₊"))
                        },
                        {
                            command: toggleMark(litSchema.marks.sup),
                            dom: icon("sup", gettext("Supscript²"))
                        }
                    ])
                ]
            }),
            dispatchTransaction: tr => {
                const newState = this.view.state.apply(tr)
                this.view.updateState(newState)
            }
        })
    }

    get value() {
        const literalContents = this.view.state.doc.firstChild.content.toJSON()
        return literalContents && literalContents.length
            ? literalContents
            : false
    }

    check() {
        return true
    }

    placeholderPlugin() {
        return new Plugin({
            props: {
                decorations: state => {
                    const doc = state.doc
                    if (
                        doc.childCount === 1 &&
                        doc.firstChild.isTextblock &&
                        doc.firstChild.content.size === 0 &&
                        this.placeHolder
                    ) {
                        const placeHolder = document.createElement("span")
                        placeHolder.classList.add("placeholder")
                        // There is only one field, so we know the selection is there
                        placeHolder.classList.add("selected")
                        placeHolder.setAttribute(
                            "data-placeholder",
                            this.placeHolder
                        )
                        return DecorationSet.create(doc, [
                            Decoration.widget(1, placeHolder)
                        ])
                    }
                }
            }
        })
    }
}
