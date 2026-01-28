import {keyName} from "w3c-keyname"
import {addDeletedPartWidget} from "../document_template"

import {AddButton} from "./add_button"

export class ContributorsPartView {
    constructor(node, view, getPos) {
        this.node = node
        this.view = view
        this.getPos = getPos
        this.dom = document.createElement("div")
        this.dom.classList.add("doc-part")
        this.dom.classList.add(`doc-${this.node.type.name}`)
        this.dom.classList.add(`doc-${this.node.attrs.id}`)
        if (node.attrs.hidden) {
            this.dom.dataset.hidden = true
        }

        this.contentDOM = document.createElement("span")
        this.contentDOM.classList.add("contributors-inner")
        this.contentDOM.contentEditable = node.attrs.locking !== "fixed"
        this.dom.appendChild(this.contentDOM)
        if (node.attrs.locking !== "fixed") {
            this.addButton = new AddButton(
                this.dom,
                () => this.getNode(),
                this.getPos,
                this.view
            )
            this.addButton.init()
        }

        if (node.attrs.deleted) {
            addDeletedPartWidget(this.dom, view, getPos)
        }
    }

    stopEvent(event) {
        // Trap events for addButton
        if (["click", "mousedown"].includes(event.type)) {
            return false
        } else if (!this.addButton || this.node.attrs.locking === "fixed") {
            return false
        } else if (this.addButton.hasFocus() && event.type === "keydown") {
            return true
        } else {
            return false
        }
    }

    update(node, _decorations, _innerDecorations) {
        this.node = node
        if (node.attrs.hidden) {
            this.dom.dataset.hidden = true
        } else {
            delete this.dom.dataset.hidden
        }
        return true
    }

    getNode() {
        return this.node
    }

    setSelection(anchor, head, _root) {
        if (anchor === head && this.view.hasFocus()) {
            // We must be in last position.
            // Activate the tag input tag editor.
            this.addButton.focus()
        }
    }

    ignoreMutation(_record) {
        if (this.addButton?.hasFocus()) {
            return true
        }
        return false
    }
}
