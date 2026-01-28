import {GapCursor} from "prosemirror-gapcursor"
import {TextSelection} from "prosemirror-state"

import {findTarget, post} from "../../common"
import {
    deactivateAllSelectedChanges,
    getCommentDuringCreationDecoration
} from "../state_plugins"
import {CommentAnswerEditor, CommentEditor, serializeComment} from "./editors"

/* Functions related to user interactions with comments */
export class ModCommentInteractions {
    constructor(mod) {
        mod.interactions = this
        this.mod = mod
        this.activeCommentId = false
        this.activeCommentAnswerId = false
        this.editComment = false
        this.editor = false
        this.bindEvents()
    }

    bindEvents() {
        // Bind all the click events related to comments
        document.body.addEventListener("click", event => {
            const el = {}
            let id
            switch (true) {
                case findTarget(event, ".edit-comment", el):
                    this.editComment = true
                    this.activeCommentAnswerId = false
                    id = el.target.dataset.id

                    if (this.activeCommentId !== id) {
                        this.deactivateSelectedChanges()
                        this.activeCommentId = id
                        this.editComment = true
                        this.updateDOM()
                    } else {
                        this.updateDOM()
                    }
                    break
                case findTarget(event, ".edit-comment-answer", el):
                    this.editComment = false
                    this.editAnswer(
                        el.target.dataset.id,
                        el.target.dataset.answer
                    )
                    break
                case findTarget(event, ".resolve-comment", el):
                    this.resolveComment(el.target.dataset.id)
                    break
                case findTarget(event, ".recreate-comment", el):
                    this.recreateComment(el.target.dataset.id)
                    break
                case findTarget(event, ".assign-comment", el):
                    this.assignComment(
                        el.target.dataset.id,
                        Number.parseInt(el.target.dataset.user),
                        el.target.dataset.username
                    )
                    break
                case findTarget(event, ".unassign-comment", el):
                    this.unassignComment(el.target.dataset.id)
                    break
                case findTarget(event, ".delete-comment", el):
                    this.deleteComment(el.target.dataset.id)
                    break
                case findTarget(event, ".delete-comment-answer", el):
                    this.deleteCommentAnswer(
                        el.target.dataset.id,
                        el.target.dataset.answer
                    )
                    break
                default:
                    break
            }
        })
    }

    initEditor() {
        const commentEditorDOM = document.querySelector("#comment-editor"),
            answerEditorDOM = document.querySelector("#answer-editor")

        if (
            commentEditorDOM?.matches(":not(:empty)") ||
            answerEditorDOM?.matches(":not(:empty)")
        ) {
            // Editor has been set up already. Abort.
            return
        }

        if (!(commentEditorDOM || answerEditorDOM)) {
            this.editor = false
            return
        }
        const id = this.activeCommentId
        if (commentEditorDOM) {
            const value =
                id === "-1"
                    ? {text: [], isMajor: false}
                    : {
                          text: this.mod.store.comments[id].comment,
                          isMajor: this.mod.store.comments[id].isMajor
                      }
            this.editor = new CommentEditor(
                this.mod,
                id,
                commentEditorDOM,
                value.text,
                {isMajor: value.isMajor}
            )
        } else {
            const answerId = this.activeCommentAnswerId,
                text = answerId
                    ? this.mod.store.comments[id].answers.find(
                          answer => answer.id === answerId
                      ).answer
                    : []
            this.editor = new CommentAnswerEditor(
                this.mod,
                id,
                answerEditorDOM,
                text,
                {answerId}
            )
        }

        this.editor.init()
    }

    updateDOM() {
        this.mod.editor.mod.marginboxes.updateDOM()
        this.initEditor()
    }

    findCommentIds(node) {
        return node.marks
            .filter(mark => mark.type.name === "comment" && mark.attrs.id)
            .map(mark => mark.attrs.id)
    }

    findCommentsAt(node) {
        return this.findCommentIds(node).map(id =>
            this.mod.store.findComment(id)
        )
    }

    deactivateSelectedChanges() {
        const tr = deactivateAllSelectedChanges(this.mod.editor.view.state.tr)
        if (tr) {
            this.mod.editor.view.dispatch(tr)
        }
        const fnTr = deactivateAllSelectedChanges(
            this.mod.editor.mod.footnotes.fnEditor.view.state.tr
        )
        if (fnTr) {
            this.mod.editor.mod.footnotes.fnEditor.view.dispatch(fnTr)
        }
    }

    collapseSelectionToEnd() {
        const $pos = this.mod.editor.currentView.state.selection.$to
        const validTextSelection = $pos.parent.inlineContent
        const selection = validTextSelection
            ? new TextSelection($pos)
            : new GapCursor($pos)
        const tr = this.mod.editor.currentView.state.tr.setSelection(selection)
        if (tr) {
            this.mod.editor.currentView.dispatch(tr)
        }
    }

    activateComment(id) {
        this.deactivateAll()
        this.activeCommentId = id
        this.updateDOM()
    }

    deactivateAll() {
        this.activeCommentId = false
        this.editComment = false
        this.activeCommentAnswerId = false
        // If there is a comment currently under creation, remove it.
        this.mod.store.removeCommentDuringCreation()
    }

    // Activate the comments included in the selection or the comment where the
    // caret is placed, if the editor is in focus.
    activateSelectedComment(view) {
        const selection = view.state.selection
        let comments = []

        if (selection.empty) {
            const node = view.state.doc.nodeAt(selection.from)
            if (node) {
                comments = this.findCommentsAt(node)
            }
        } else {
            view.state.doc.nodesBetween(selection.from, selection.to, node => {
                if (!node.isInline) {
                    return
                }
                comments = comments.concat(this.findCommentsAt(node))
            })
        }

        if (comments.length) {
            if (this.activeCommentId !== comments[0].id) {
                this.activateComment(comments[0].id)
            }
        } else {
            this.deactivateAll()
            this.updateDOM()
        }
    }

    isCurrentlyEditing() {
        // Returns true if
        // A) a comment form is currently open
        // B) the comment answer edit form is currently open
        // C) part of a new answer has been written
        // D) the focus is currently in new answer text area of a comment
        // E) The comment options are open
        // F) a new comment form is about to be displayed, but the updateDOM
        // call has not yet been made.
        if (!this.activeCommentId) {
            return false
        }
        if (document.querySelector(".submit-comment-answer-edit")) {
            // a comment answer edit form is currently open
            return true
        }
        if (this.editor?.view && this.editor?.view.hasFocus()) {
            // There is currently focus in the comment (answer) form
            return true
        }
        if (this.editor?.hasChanged?.()) {
            // Part of a comment (answer) has been entered/changed.
            return true
        }
        if (document.querySelector("div.marginbox-options.fw-open")) {
            // A margin box options menu is open.
            return true
        }
        if (this.mod.store.commentDuringCreation.inDOM === false) {
            // A new comment is about to be created, but it has not
            // yet been added to the DOM.
            return true
        }
        return false
    }

    // Create a temporary empty comment for the current user that is not shared
    // with collaborators.
    createNewComment() {
        // Unhide comments if they had been hidden.
        this.mod.editor.mod.marginboxes.filterOptions.comments = true
        this.deactivateAll()
        this.mod.store.addCommentDuringCreation(this.mod.editor.currentView)
        this.activeCommentId = "-1"
        this.editComment = true
        this.updateDOM()
        this.editor.view.focus()
    }

    deleteComment(id) {
        if (id === "-1") {
            this.deactivateAll()
        } else {
            // Handle the deletion of a comment.
            this.mod.store.deleteComment(id, true)
        }
        this.updateDOM()
    }

    resolveComment(id) {
        this.mod.store.updateComment({id, resolved: true})
    }

    recreateComment(id) {
        if (this.editor) {
            this.editor.dom.childNodes.forEach(node => {
                if (node.classList && node.classList.contains("comment-btns")) {
                    node.childNodes.forEach(buttons => {
                        if (
                            buttons.classList &&
                            buttons.classList.contains("submit") &&
                            buttons.classList.contains("disabled")
                        ) {
                            buttons.classList.remove("disabled")
                        }
                    })
                }
            })
        }
        this.mod.store.updateComment({id, resolved: false})
    }

    assignComment(id, user, username) {
        this.notifyAssignedUser(user, id)
        this.mod.store.updateComment({
            id,
            assignedUser: user,
            assignedUsername: username
        })
    }

    unassignComment(id) {
        this.mod.store.updateComment({
            id,
            assignedUser: false,
            assignedUsername: false
        })
    }

    notifyAssignedUser(user, id) {
        const comment = this.mod.store.findComment(id)
        const {html, text} = serializeComment(comment.comment)

        post("/api/document/comment_notify/", {
            doc_id: this.mod.editor.docInfo.id,
            collaborator_id: user,
            comment_html: html,
            comment_text: text,
            type: "assign"
        })
    }

    updateComment({id, comment, isMajor}) {
        // Save the change to a comment and mark that the document has been changed
        if (id === "-1") {
            const referrer = getCommentDuringCreationDecoration(
                this.mod.store.commentDuringCreation.view.state
            )
            // This is a new comment. We need to get an ID for it if it has content.

            let username

            if (
                ["review", "review-tracked"].includes(
                    this.mod.editor.docInfo.access_rights
                )
            ) {
                username = `${gettext("Reviewer")} ${this.mod.editor.user.id}`
            } else {
                username = this.mod.editor.user.username
            }

            this.mod.store.addComment(
                {
                    user: this.mod.editor.user.id,
                    username,
                    date: Date.now() - this.mod.editor.clientTimeAdjustment, // We update the time to the time the comment was stored
                    comment,
                    isMajor
                },
                referrer.from,
                referrer.to,
                this.mod.store.commentDuringCreation.view
            )
        } else {
            this.mod.store.updateComment({id, comment, isMajor})
        }
        this.deactivateAll()
        this.updateDOM()
    }

    cancelSubmit() {
        // Handle a click on the cancel button of the comment submit form.
        const id = this.activeCommentId
        if (id === "-1" || this.mod.store.comments[id]?.comment.length === 0) {
            this.deleteComment(id)
        } else {
            this.deactivateAll()
        }
        this.updateDOM()
    }

    deleteCommentAnswer(id, answerId) {
        // Handle the deletion of a comment answer.
        this.mod.store.deleteAnswer(id, answerId)
        this.deactivateAll()
        this.updateDOM()
    }

    editAnswer(id, answerId) {
        // Mark a specific answer to a comment as active, then layout the
        // comments, which will make that answer editable.
        this.activeCommentId = id
        this.activeCommentAnswerId = answerId
        this.updateDOM()
    }

    createNewAnswer(id, answerText) {
        // Create a new answer to add to the comment store

        let username

        if (
            ["review", "review-tracked"].includes(
                this.mod.editor.docInfo.access_rights
            )
        ) {
            username = `${gettext("Reviewer")} ${this.mod.editor.user.id}`
        } else {
            username = this.mod.editor.user.username
        }

        const answer = {
            answer: answerText,
            user: this.mod.editor.user.id,
            username,
            date: Date.now() - this.mod.editor.clientTimeAdjustment
        }

        this.mod.store.addAnswer(id, answer)

        this.deactivateAll()
        this.updateDOM()
        this.activateComment(id)
    }

    submitAnswerUpdate(id, answerId, commentText) {
        this.mod.store.updateAnswer(id, answerId, commentText)
        this.deactivateAll()
        this.updateDOM()
        this.activateComment(id)
    }
}
