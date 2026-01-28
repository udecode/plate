import {baseKeymap, toggleMark} from "prosemirror-commands"
import {history, redo, undo} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"

import {InlineTools, icon} from "../../../prosemirror/inline_tools"
import {titleSchema} from "../../schema/title"

export class TitleFieldForm {
    constructor(dom, initialValue) {
        this.initialValue = initialValue
        this.dom = dom
    }

    init() {
        this.view = new EditorView(this.dom, {
            state: EditorState.create({
                schema: titleSchema,
                doc: titleSchema.nodeFromJSON({
                    type: "doc",
                    content: [
                        {
                            type: "literal",
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
                            command: toggleMark(titleSchema.marks.strong),
                            dom: icon("strong", gettext("Strong"))
                        },
                        {
                            command: toggleMark(titleSchema.marks.em),
                            dom: icon("em", gettext("Emphasis"))
                        },
                        {
                            command: toggleMark(titleSchema.marks.smallcaps),
                            dom: icon("smallcaps", gettext("Small caps"))
                        },
                        {
                            command: toggleMark(titleSchema.marks.sub),
                            dom: icon("sub", gettext("Subscript₊"))
                        },
                        {
                            command: toggleMark(titleSchema.marks.sup),
                            dom: icon("sup", gettext("Supscript²"))
                        },
                        {
                            command: toggleMark(titleSchema.marks.nocase),
                            dom: icon("nocase", gettext("CasE ProTecT"))
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
        const titleContents = this.view.state.doc.firstChild.content.toJSON()
        return titleContents && titleContents.length ? titleContents : false
    }

    check() {
        return true
    }
}
