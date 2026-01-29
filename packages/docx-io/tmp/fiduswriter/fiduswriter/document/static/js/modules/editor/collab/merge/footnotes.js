import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {fnSchema} from "../../../schema/footnotes"
import {htmlToFnNode} from "../../../schema/footnotes_convert"
import {trackedTransaction} from "../../track"

export class FootnoteView {
    constructor(node, view, getPos, editor) {
        // We'll need these later
        this.node = node
        this.outerView = view
        this.getPos = getPos
        this.editor = editor

        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div")
        this.dom.className = "footnote-view"
        // These are used when the footnote is selected
        this.innerView = null
        // Updated main editor state
        this.updatedMainEditor = false
    }

    selectNode() {
        this.dom.classList.add("ProseMirror-selectednode")
        if (!this.innerView) {
            this.open()
        }
    }

    deselectNode() {
        this.dom.classList.remove("ProseMirror-selectednode")
        if (this.innerView) {
            this.close()
        }
    }

    open() {
        // Append a tooltip to the outer node
        const tooltip = this.dom.appendChild(document.createElement("div"))
        tooltip.className = "footnote-tooltip"
        const diffMark = this.node.marks.find(
            mark => mark.type.name === "diffdata"
        )
        if (diffMark === undefined) {
            tooltip.classList.add("render-arrow")
        } else {
            tooltip.style.top = "-30px"
        }

        const doc = fnSchema.nodeFromJSON({
            type: "doc",
            content: [
                {
                    type: "footnotecontainer",
                    content: this.node.attrs.footnote
                }
            ]
        })

        // And put a sub-ProseMirror into that
        this.innerView = new EditorView(tooltip, {
            state: EditorState.create({
                doc: doc
            }),
            dispatchTransaction: this.dispatchInner.bind(this),
            handleDOMEvents: {
                mousedown: () => {
                    if (this.outerView.hasFocus()) {
                        this.innerView.focus()
                    }
                }
            }
        })
    }

    close() {
        if (!this.updatedMainEditor && this.outerView) {
            this.updateMainEditor()
        }
        if (this.innerView) {
            this.innerView.destroy()
            this.innerView = null
            this.dom.textContent = ""
            this.updatedMainEditor = false
        }
    }

    updateMainEditor() {
        const outerTr = this.outerView.state.tr
        const footnoteContent = this.innerView.state.doc
            .child(0)
            .toJSON().content
        const pos = this.getPos()
        const node = outerTr.doc.nodeAt(pos)
        if (node) {
            outerTr.setNodeMarkup(pos, node.type, {
                footnote: footnoteContent
            })
        }
        if (outerTr.docChanged) {
            outerTr.setMeta("fromFootnote", true)
            this.updatedMainEditor = true
            this.outerView.dispatch(outerTr)
        }
    }

    dispatchInner(tr) {
        const trackedTr = trackedTransaction(
            tr,
            this.innerView.state,
            this.editor.user,
            !this.outerView.state.doc.attrs.tracked &&
                !["write-tracked", "review-tracked"].includes(
                    this.editor.docInfo.access_rights
                ),
            Date.now() - this.editor.clientTimeAdjustment
        )
        const {state} = this.innerView.state.applyTransaction(trackedTr)
        this.innerView.updateState(state)
    }

    update(node) {
        this.node = node
        return true
    }

    destroy() {
        this.outerView = null
        if (this.innerView) {
            this.close()
        }
    }

    stopEvent(event) {
        return this.innerView && this.innerView.dom.contains(event.target)
    }

    ignoreMutation() {
        return true
    }
}

export const readOnlyFnEditor = footnoteElement => {
    // This function creates a read only footnote editor for the purpose of showing the
    // footnote nodes which are drawn as part of deletion decoration.
    const newFnElement = document.createElement("div")
    newFnElement.className = "footnote-view"
    newFnElement.dataset.footnote = footnoteElement.dataset.footnote
    const tooltip = newFnElement.appendChild(document.createElement("div"))
    tooltip.className = "footnote-tooltip"
    tooltip.classList.add("render-arrow")
    tooltip.style.display = "none"

    // Parse Footnote node's data
    const doc = fnSchema.nodeFromJSON({
        type: "doc",
        content: [
            {
                type: "footnotecontainer",
                content: htmlToFnNode(footnoteElement.dataset.footnote)
            }
        ]
    })

    // Put a reado only sub-ProseMirror into that
    new EditorView(tooltip, {
        state: EditorState.create({
            doc: doc
        }),
        editable: () => false
    })

    return newFnElement
}
