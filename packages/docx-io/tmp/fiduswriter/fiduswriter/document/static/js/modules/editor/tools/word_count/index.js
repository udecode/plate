import {Dialog} from "../../../common"
import {getNonDeletedTextContent} from "../../../schema/text"

import {wordCounterDialogTemplate} from "./templates"

export class WordCountDialog {
    constructor(editor) {
        this.editor = editor
    }

    init() {
        const dialog = new Dialog({
            title: gettext("Word counter"),
            body: wordCounterDialogTemplate(this.countWords()),
            buttons: [{type: "close"}]
        })
        dialog.open()
    }

    countWords() {
        const textContent = getNonDeletedTextContent(
                this.editor.view.state.doc
            ),
            footnoteContent = getNonDeletedTextContent(
                this.editor.mod.footnotes.fnEditor.view.state.doc
            ),
            bibliographyContent =
                document.querySelector(".doc-bibliography").textContent
        const docContent =
            textContent + " " + footnoteContent + " " + bibliographyContent
        const docNumChars = docContent.split("\n").join("").length - 2 // Subtract two for added spaces
        const docWords = docContent.split(/[\n ]+/)

        const docNumNoSpace = docWords.join("").length
        const docNumWords = docNumNoSpace ? docWords.length : 0

        const selectionContent = getNonDeletedTextContent(
            this.editor.currentView.state.doc.cut(
                this.editor.currentView.state.selection.from,
                this.editor.currentView.state.selection.to
            )
        )
        const selectionNumChars = selectionContent.split("\n").join("").length
        const selectionWords = selectionContent.split(/[\n ]+/)
        const selectionNumNoSpace = selectionWords.join("").length
        const selectionNumWords = selectionNumNoSpace
            ? selectionWords.length
            : 0

        return {
            docNumWords,
            docNumNoSpace,
            docNumChars,
            selectionNumWords,
            selectionNumNoSpace,
            selectionNumChars
        }
    }
}
