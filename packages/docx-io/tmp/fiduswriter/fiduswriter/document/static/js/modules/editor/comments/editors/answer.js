import {CommentEditor} from "./comment"

export class CommentAnswerEditor extends CommentEditor {
    constructor(mod, id, dom, text, options = {}) {
        super(mod, id, dom, text, options)

        this.keepOpenAfterSubmit = true
    }

    initViewDOM() {
        this.viewDOM = document.createElement("div")
        this.viewDOM.classList.add("ProseMirror-wrapper")
        this.dom.appendChild(this.viewDOM)
        this.dom.insertAdjacentHTML(
            "beforeend",
            `<div class="comment-btns">
                <button class="submit fw-button fw-dark disabled" type="submit">
                    ${this.options.answerId ? gettext("Edit") : gettext("Submit")}
                </button>
                <button class="cancel fw-button fw-orange" type="submit">
                    ${gettext("Cancel")}
                </button>
            </div>
            <div class="tagger"></div>`
        )
    }

    submit() {
        const text = this.view.state.doc.toJSON().content
        if (!text) {
            return
        }
        if (this.options.answerId) {
            this.mod.interactions.submitAnswerUpdate(
                this.id,
                this.options.answerId,
                text
            )
        } else {
            this.mod.interactions.createNewAnswer(this.id, text)
        }
        this.sendNotifications()
    }
}
