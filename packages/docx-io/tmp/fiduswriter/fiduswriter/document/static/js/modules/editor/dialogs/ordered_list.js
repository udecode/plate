import {Dialog} from "../../common"
import {orderedListStartTemplate} from "./templates"

export class OrderedListStartDialog {
    constructor(editor) {
        this.editor = editor
        this.dialogEl = false
        this.order = 1
    }

    init() {
        const {orderedList} = this.findOrderedList(
            this.editor.currentView.state
        )
        if (orderedList) {
            this.order = orderedList.attrs.order
        }
        this.insertDialog()
    }

    findOrderedList(state) {
        const $head = state.selection.$head
        for (let d = $head.depth; d > 0; d--) {
            if ($head.node(d).type.name == "ordered_list") {
                return {
                    orderedList: $head.node(d),
                    orderedListPos: $head.before(d)
                }
            }
        }
        return {orderedList: false, orderedListPos: false}
    }

    submitForm() {
        const {orderedList, orderedListPos} = this.findOrderedList(
            this.editor.currentView.state
        )
        if (!orderedList) {
            return
        }
        const attrs = Object.assign({}, orderedList.attrs, {
            order: this.order
        })
        this.editor.currentView.dispatch(
            this.editor.currentView.state.tr.setNodeMarkup(
                orderedListPos,
                false,
                attrs
            )
        )
    }

    insertDialog() {
        const buttons = []
        buttons.push({
            text: gettext("Update"),
            classes: "fw-dark",
            click: () => {
                this.submitForm()
                this.dialog.close()
            }
        })
        buttons.push({
            type: "cancel"
        })

        this.dialog = new Dialog({
            title: gettext("Set list start number"),
            body: orderedListStartTemplate({order: this.order}),
            width: 300,
            height: 100,
            buttons,
            onClose: () => this.editor.currentView.focus(),
            restoreActiveElement: false
        })

        this.dialog.open()

        const listStartInput = document.querySelector("input.list-start")
        listStartInput.addEventListener("change", _event => {
            this.order = Number.parseInt(listStartInput.value) || 1
        })
    }
}
