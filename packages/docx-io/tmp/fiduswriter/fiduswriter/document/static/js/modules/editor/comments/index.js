import {ModCommentInteractions} from "./interactions"
import {ModCommentStore} from "./store"

export class ModComments {
    constructor(editor) {
        editor.mod.comments = this
        this.editor = editor
        new ModCommentStore(this)
        new ModCommentInteractions(this)
    }
}
