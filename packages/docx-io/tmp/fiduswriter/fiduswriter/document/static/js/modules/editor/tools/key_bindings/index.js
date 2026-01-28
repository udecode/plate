import {Dialog} from "../../../common"
import {keyBindingsTemplate} from "./templates"
/* This is an adaptation of question.mark for Fidus Writer http://fiduswriter.org
 * originally by Gabriel Lopez <gabriel.marcos.lopez@gmail.com>
 */

export class KeyBindingsDialog {
    constructor(editor) {
        this.editor = editor
    }

    init() {
        const dialog = new Dialog({
            title: gettext("Keyboard Shortcuts"),
            body: keyBindingsTemplate(),
            width: 850,
            buttons: [{type: "close"}]
        })
        dialog.open()
    }
}
