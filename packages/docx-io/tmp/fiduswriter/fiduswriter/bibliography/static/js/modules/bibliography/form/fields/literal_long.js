import {baseKeymap, toggleMark} from "prosemirror-commands"
import {history, redo, undo} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"

import {InlineTools, icon} from "../../../prosemirror/inline_tools"
import {longLitSchema} from "../../schema/literal_long"

export class LiteralLongFieldForm {
    constructor(dom, initialValue = []) {
        this.dom = dom
        this.initialValue = initialValue
    }

    init() {
        this.view = new EditorView(this.dom, {
            state: EditorState.create({
                schema: longLitSchema,
                doc: longLitSchema.nodeFromJSON({
                    type: "doc",
                    content: [
                        {
                            type: "longliteral",
                            content: this.initialValue
                        }
                    ]
                }),
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
                    InlineTools([
                        {
                            command: toggleMark(longLitSchema.marks.strong),
                            dom: icon("strong", gettext("Strong"))
                        },
                        {
                            command: toggleMark(longLitSchema.marks.em),
                            dom: icon("em", gettext("Emphasis"))
                        },
                        {
                            command: toggleMark(longLitSchema.marks.smallcaps),
                            dom: icon("smallcaps", gettext("Small caps"))
                        },
                        {
                            command: toggleMark(longLitSchema.marks.sub),
                            dom: icon("sub", gettext("Subscript₊"))
                        },
                        {
                            command: toggleMark(longLitSchema.marks.sup),
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
}
