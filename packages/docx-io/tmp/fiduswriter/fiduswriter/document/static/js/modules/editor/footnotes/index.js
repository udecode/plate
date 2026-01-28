import {ModFootnoteEditor} from "./editor"
import {ModFootnoteLayout} from "./layout"

export class ModFootnotes {
    constructor(editor) {
        editor.mod.footnotes = this
        this.editor = editor
        new ModFootnoteEditor(this)
        new ModFootnoteLayout(this)
    }

    init() {
        this.fnEditor.init()
        this.layout.init()
    }
}
