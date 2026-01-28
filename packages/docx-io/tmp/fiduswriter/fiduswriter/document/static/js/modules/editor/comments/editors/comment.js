import deepEqual from "fast-deep-equal"
import {baseKeymap} from "prosemirror-commands"
import {history, redo, undo} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {EditorState} from "prosemirror-state"
import {suggestionsPlugin, triggerCharacter} from "prosemirror-suggestions"
import {EditorView} from "prosemirror-view"

import {avatarTemplate, escapeText, findTarget} from "../../../common"

import {notifyMentionedUser} from "./notify"
import {commentSchema} from "./schema"

export class CommentEditor {
    constructor(mod, id, dom, text, options = {}) {
        this.mod = mod
        this.id = id
        this.dom = dom
        this.text = text
        this.options = options

        this.isMajor = this.options.isMajor

        this.keepOpenAfterSubmit = false
        this.selectedTag = 0
        this.userTaggerList = []
        this.plugins = [
            history(),
            suggestionsPlugin({
                escapeOnSelectionChange: true,
                matcher: triggerCharacter("@"),
                onEnter: args => {
                    this.selectedTag = 0
                    this.tagRange = args.range
                    const search = args.text.slice(1)
                    if (search.length) {
                        this.setUserTaggerList(search)
                        this.showUserTagger()
                    }
                },
                onChange: args => {
                    this.selectedTag = 0
                    this.tagRange = args.range
                    const search = args.text.slice(1)
                    if (search.length) {
                        this.setUserTaggerList(search)
                        this.showUserTagger()
                    }
                },
                onExit: _args => {
                    this.selectedTag = 0
                    this.removeTagger()
                },
                onKeyDown: ({event}) => {
                    if (event.key === "ArrowDown") {
                        if (this.userTaggerList.length > this.selectedTag + 1) {
                            this.selectedTag += 1
                            this.showUserTagger()
                        }
                        return true
                    } else if (event.key === "ArrowUp") {
                        if (this.selectedTag > 0) {
                            this.selectedTag -= 1
                            this.showUserTagger()
                        }
                        return true
                    } else if (event.key === "Enter") {
                        return this.selectUserTag()
                    }
                    return false
                },
                escapeKeys: ["Escape", "ArrowRight", "ArrowLeft"]
            }),
            keymap(baseKeymap),
            keymap({
                "Mod-z": undo,
                "Mod-shift-z": undo,
                "Mod-y": redo,
                "Ctrl-Enter": () => this.submit()
            })
        ]
    }

    init() {
        this.initViewDOM()
        this.initView()
    }

    initViewDOM() {
        this.viewDOM = document.createElement("div")
        this.viewDOM.classList.add("ProseMirror-wrapper")
        this.dom.appendChild(this.viewDOM)
        this.dom.insertAdjacentHTML(
            "beforeend",
            `<input class="comment-is-major" type="checkbox" name="isMajor"
                ${this.options.isMajor ? "checked" : ""}/>
            <label>${gettext("High priority")}</label>
            <div class="comment-btns">
                <button class="submit fw-button fw-dark disabled" type="submit">
                    ${this.id !== "-1" ? gettext("Edit") : gettext("Submit")}
                </button>
                <button class="cancel fw-button fw-orange" type="submit">
                    ${gettext("Cancel")}
                </button>
            </div>
            <div class="tagger"></div>`
        )
    }

    initView() {
        this.view = new EditorView(this.viewDOM, {
            state: EditorState.create({
                schema: commentSchema,
                doc: commentSchema.nodeFromJSON({
                    type: "doc",
                    content: this.text
                }),
                plugins: this.plugins
            }),
            dispatchTransaction: tr => {
                const newState = this.view.state.apply(tr)
                this.view.updateState(newState)
                this.updateButtons()
            }
        })
        this.oldUserTags = this.getUserTags()
        this.bind()
    }

    bind() {
        this.dom.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, "button.submit:not(.disabled)", el):
                    this.submit()
                    if (this.keepOpenAfterSubmit) {
                        this.scrollToBottom()
                    } else {
                        this.mod.interactions.activeCommentId = false
                        this.mod.interactions.deactivateAll()
                        this.mod.interactions.collapseSelectionToEnd()
                    }
                    break
                case findTarget(event, "button.cancel", el):
                    this.mod.interactions.cancelSubmit()
                    break
                case findTarget(event, ".ProseMirror-wrapper", el):
                    this.view.focus()
                    break
                case findTarget(event, ".tag-user", el):
                    this.selectedTag = Number.parseInt(el.target.dataset.index)
                    this.selectUserTag()
                    this.view.focus()
                    break
                case findTarget(event, ".comment-is-major", el):
                    this.isMajor = !this.isMajor
                    this.updateButtons()
                    break
            }
        })
    }

    hasChanged() {
        return (
            !deepEqual(
                this.text.length ? this.text : [{type: "paragraph"}],
                this.view.state.doc.toJSON().content || [{type: "paragraph"}]
            ) || this.options.isMajor !== this.isMajor
        )
    }

    updateButtons() {
        if (this.hasChanged()) {
            this.dom.querySelector("button.submit").classList.remove("disabled")
        } else {
            this.dom.querySelector("button.submit").classList.add("disabled")
        }
    }

    submit() {
        const comment = this.view.state.doc.toJSON().content
        if (comment?.length > 0) {
            this.mod.interactions.updateComment({
                id: this.id,
                comment,
                isMajor: this.isMajor
            })
            this.sendNotifications()
        } else {
            this.mod.interactions.deleteComment(this.id)
        }
    }

    sendNotifications() {
        const newUserTags = this.getUserTags().filter(
            id => !this.oldUserTags.includes(id)
        )
        if (newUserTags.length) {
            const comment = this.view.state.doc,
                docId = this.mod.editor.docInfo.id
            newUserTags.forEach(userId =>
                notifyMentionedUser(docId, userId, comment)
            )
        }
    }

    setUserTaggerList(search) {
        const owner = this.mod.editor.docInfo.owner
        this.userTaggerList = owner.contacts
            .concat(owner)
            .filter(
                user =>
                    user.name.includes(search) || user.username.includes(search)
            )
    }

    showUserTagger() {
        if (!this.userTaggerList.length) {
            return
        }
        this.dom.querySelector("div.tagger").innerHTML = this.userTaggerList
            .map(
                (user, index) =>
                    `<div class="tag-user tag${index === this.selectedTag ? " selected" : ""}" data-index="${index}">
                ${user ? avatarTemplate({user}) : '<span class="fw-string-avatar"></span>'}
                <h5 class="comment-user-name">${escapeText(user.name)}</h5>
            </div>`
            )
            .join("")
    }

    selectUserTag() {
        const user = this.userTaggerList[this.selectedTag]
        if (!user || !this.tagRange) {
            return false
        }
        const tr = this.view.state.tr.replaceRangeWith(
            this.tagRange.from,
            this.tagRange.to,
            this.view.state.schema.nodes.collaborator.create({
                id: user.id,
                name: user.name
            })
        )
        this.view.dispatch(tr)
        return true
    }

    getUserTags() {
        const users = []
        this.view.state.doc.descendants(node => {
            if (node.type.name === "collaborator") {
                users.push(node.attrs.id)
            }
        })
        return [...new Set(users)] // only unique values.
    }

    removeTagger() {
        this.dom.querySelector("div.tagger").innerHTML = ""
        this.tagRange = false
        this.userTaggerList = []
    }

    scrollToBottom() {
        const activeMarginBox = document.querySelector(
            ".margin-box.comment.active .comment-answer-container"
        )
        if (activeMarginBox) {
            activeMarginBox.scrollTop = activeMarginBox.scrollHeight
        }

        // scroll to bottom of the margin-box-container when new comments are added when the screens width is less
        // than 1024px
        const currentScreenWidth =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth
        if (currentScreenWidth < 1024) {
            const activeMarginBoxContainer = document.querySelector(
                "#margin-box-container"
            )
            if (activeMarginBoxContainer) {
                activeMarginBoxContainer.scrollTop =
                    activeMarginBoxContainer.scrollHeight
            }
        }
    }
}
