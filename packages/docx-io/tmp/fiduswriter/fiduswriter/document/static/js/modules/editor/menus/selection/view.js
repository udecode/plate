import {DiffDOM} from "diff-dom"

import {READ_ONLY_ROLES} from "../.."

export class SelectionMenuView {
    constructor(editorView, options) {
        this.editorView = editorView
        this.options = options

        this.editor = this.options.editor
        if (!this.editor.menu.selectionMenuViews) {
            this.editor.menu.selectionMenuViews = []
        }
        this.editor.menu.selectionMenuViews.push(this)

        this.dd = new DiffDOM({
            valueDiffing: false
        })
        this.openedMenu = false
        this.listeners = {}

        this.removeUnavailable(this.editor.menu.selectionMenuModel)

        this.bindEvents()
        this.update()
    }

    removeUnavailable(menu) {
        // Remove those menu items from the menu model that are not available for this document.
        // Used for example for mark or element buttons that aren't permitted according to the
        // document template.
        menu.content = menu.content.filter(item => {
            if (item.available && !item.available(this.editor)) {
                return false
            } else if (item.type === "menu") {
                this.removeUnavailable(item)
            }
            return true
        })
    }

    bindEvents() {
        this.listeners.onclick = event => this.onclick(event)
        document.body.addEventListener("click", this.listeners.onclick)
    }

    destroy() {
        document.body.removeEventListener("click", this.listeners.onclick)
        this.editor.menu.selectionMenuViews =
            this.editor.menu.selectionMenuViews.filter(view => view !== this)
    }

    onclick(event) {
        if (this.editorView !== this.editor.currentView) {
            // the other editor must be active
            return
        }
        const target = event.target
        if (
            target.matches(
                ".editor-selection-menu > div:not(.disabled), .editor-selection-menu > div:not(.disabled) *"
            )
        ) {
            // A menu item has been clicked, lets find out which one.
            let menuNumber = 0
            let seekItem = target.closest("div.ui-buttonset")
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            const menuItem =
                this.editor.menu.selectionMenuModel.content[menuNumber]
            // execute an associated action.
            if (menuItem.action) {
                event.preventDefault()
                const focus = menuItem.action(this.editor)
                this.update()
                if (focus !== false) {
                    this.editor.currentView.focus()
                }
            }
        } else if (
            this.openedMenu !== false ||
            this.editor.menu.selectionMenuModel.openMore
        ) {
            if (this.openedMenu !== false) {
                this.editor.menu.selectionMenuModel.content[
                    this.openedMenu
                ].open = false
            }
            this.editor.menu.selectionMenuModel.openMore = false
            this.openedMenu = false
            this.update()
        }
    }

    update() {
        if (this.editorView !== this.editor.currentView) {
            // the other editor must be active
            return
        }
        const selectionMenuEl =
            document.querySelector("#selection-menu").firstElementChild
        const diff = this.dd.diff(selectionMenuEl, this.getSelectionMenuHTML())
        this.dd.apply(selectionMenuEl, diff)
    }

    getSelectionMenuHTML() {
        if (
            READ_ONLY_ROLES.includes(this.editor.docInfo.access_rights) ||
            this.editorView.state.selection.empty ||
            this.editor.mod.comments.store.commentDuringCreation ||
            this.editor.mod.comments.interactions.isCurrentlyEditing()
        ) {
            return "<div></div>"
        }
        const selectionMenuTop = document
                .querySelector("#selection-menu")
                .getBoundingClientRect().top,
            offset =
                this.editorView.coordsAtPos(
                    this.editorView.state.selection.from
                ).top - selectionMenuTop
        return `<div style="margin-top: ${offset}px;">
            <div class="editor-selection-menu">
                ${this.editor.menu.selectionMenuModel.content
                    .map(
                        (menuItem, index) =>
                            `<div class="ui-buttonset${(menuItem.hidden && menuItem.hidden(this.editor)) || (menuItem.disabled && menuItem.disabled(this.editor)) ? " disabled" : ""}">
                        ${this.getSelectionMenuItemHTML(menuItem, index)}
                    </div>`
                    )
                    .join("")}
            </div>
        </div>`
    }

    getSelectionMenuItemHTML(menuItem, _index) {
        if (menuItem.hidden?.(this.editor)) {
            return ""
        } else {
            return this.getButtonHTML(menuItem)
        }
    }

    getButtonHTML(menuItem) {
        return `
        <button aria-label="${menuItem.title}" class="fw-button fw-light fw-large fw-square edit-button${menuItem.selected && menuItem.selected(this.editor) ? " ui-state-active" : ""}${menuItem.class ? ` ${menuItem.class(this.editor)}` : ""}${menuItem.disabled && menuItem.disabled(this.editor) ? " disabled" : ""}" title="${menuItem.title}" >
            <span class="ui-button-text">
                <i class="fa fa-${typeof menuItem.icon === "function" ? menuItem.icon(this.editor) : menuItem.icon}"></i>
            </span>
        </button>`
    }
}
