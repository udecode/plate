import {DiffDOM} from "diff-dom"

export class ToolbarView {
    constructor(editorView, options) {
        this.editorView = editorView
        this.options = options

        this.editor = this.options.editor
        if (!this.editor.menu.toolbarViews) {
            this.editor.menu.toolbarViews = []
        }
        this.editor.menu.toolbarViews.push(this)

        this.dd = new DiffDOM({
            valueDiffing: false
        })
        this.sideMargins = 20 + 20 // CSS sets left margin to 14px + 46 px for left most button and we want the same margin on both sides
        this.availableWidth = window.innerWidth - this.sideMargins
        this.openedMenu = false
        this.listeners = {}

        if (editorView === this.options.editor.view) {
            // only do this when called for the main editor (not footnote editor)
            this.removeUnavailable(this.options.editor.menu.toolbarModel)
        }

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
        this.editor.menu.toolbarViews = this.editor.menu.toolbarViews.filter(
            view => view !== this
        )
    }

    onResize() {
        // recalculate menu if needed
        this.availableWidth = window.innerWidth - this.sideMargins
        this.update()
    }

    onclick(event) {
        if (this.editorView !== this.editor.currentView) {
            // the other editor must be active
            return
        }
        const target = event.target
        if (
            target.matches(
                ".editor-toolbar .more-button li:not(.disabled), .editor-toolbar .more-button li:not(.disabled) *"
            )
        ) {
            let menuNumber = 0
            let seekItem = target.closest("li")
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            seekItem =
                seekItem.parentElement.parentElement.parentElement.parentElement
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            const menuItem = this.editor.menu.toolbarModel.content[menuNumber]
            // if it is a menu, open it. Otherwise execute an
            // associated action.
            if (menuItem.type === "menu") {
                menuItem.open = true
                this.openedMenu = menuNumber
                event.preventDefault()
                this.update()
            } else if (menuItem.action) {
                event.preventDefault()
                const focus = menuItem.action(this.editor)
                this.editor.menu.toolbarModel.openMore = false
                this.update()
                if (focus !== false) {
                    this.editor.currentView.focus()
                }
            }
        } else if (
            target.matches(
                ".editor-toolbar .more-button, .editor-toolbar .more-button *"
            )
        ) {
            this.editor.menu.toolbarModel.openMore = true
            if (this.openedMenu) {
                this.editor.menu.toolbarModel.content[this.openedMenu].open =
                    false
            }
            this.update()
        } else if (
            target.matches(
                ".editor-toolbar li:not(.disabled), .editor-toolbar li:not(.disabled) *"
            )
        ) {
            // A toolbar menu item was clicked. We just need to
            // find out which one
            let itemNumber = 0
            let seekItem = target.closest("li")
            while (seekItem.previousElementSibling) {
                itemNumber++
                seekItem = seekItem.previousElementSibling
            }
            seekItem =
                seekItem.parentElement.parentElement.parentElement.parentElement
            let menuNumber = 0
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            event.preventDefault()
            const focus = this.editor.menu.toolbarModel.content[
                menuNumber
            ].content[itemNumber].action(this.editor)
            this.editor.menu.toolbarModel.content[menuNumber].open = false
            this.openedMenu = false
            this.update()
            if (focus !== false) {
                this.editor.currentView.focus()
            }
        } else if (
            target.matches(
                ".editor-toolbar > div:not(.disabled), .editor-toolbar > div:not(.disabled) *"
            )
        ) {
            // A menu item has been clicked, lets find out which one.
            let menuNumber = 0
            let seekItem = target.closest("div.ui-buttonset")
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            const menuItem = this.editor.menu.toolbarModel.content[menuNumber]
            // if it is a menu, open it. Otherwise execute an
            // associated action.
            if (menuItem.type === "menu") {
                menuItem.open = true
                this.openedMenu = menuNumber
                this.editor.menu.toolbarModel.openMore = false
                event.preventDefault()
                this.update()
            } else if (menuItem.action) {
                event.preventDefault()
                const focus = menuItem.action(this.editor)
                this.update()
                if (focus !== false) {
                    this.editor.currentView.focus()
                }
            }
        } else if (
            this.openedMenu !== false ||
            this.editor.menu.toolbarModel.openMore
        ) {
            if (this.openedMenu !== false) {
                this.editor.menu.toolbarModel.content[this.openedMenu].open =
                    false
            }
            this.editor.menu.toolbarModel.openMore = false
            this.openedMenu = false
            this.update()
        }
    }

    update() {
        if (this.editorView !== this.editor.currentView) {
            // the other editor must be active
            return
        }
        let spaceCounter = this.availableWidth
        let menuIndexToDrop = false
        this.editor.menu.toolbarModel.content.some((menuItem, index) => {
            switch (menuItem.type) {
                case "info":
                    spaceCounter -= 94
                    break
                case "menu":
                    spaceCounter -= 138
                    break
                default:
                    spaceCounter -= 52
            }
            if (spaceCounter < 0) {
                menuIndexToDrop = Math.max(index - 2, 3) // We need the space of two buttons for the more button
                return true
            }
        })
        const toolbarEl = (document.querySelector("#toolbar") || {})
            .firstElementChild
        if (!toolbarEl) {
            return
        }
        const diff = this.dd.diff(
            toolbarEl,
            this.getToolbarHTML(menuIndexToDrop)
        )
        this.dd.apply(toolbarEl, diff)
    }

    getToolbarHTML(menuIndexToDrop) {
        return `<div>
            <div class="editor-toolbar">
                ${this.editor.menu.toolbarModel.content
                    .map((menuItem, index) => {
                        if (!menuIndexToDrop || index < menuIndexToDrop) {
                            return `
                            <div class="ui-buttonset${menuItem.disabled && menuItem.disabled(this.editor) ? " disabled" : ""}">
                                ${this.getToolbarMenuItemHTML(menuItem, index)}
                            </div>
                        `
                        } else {
                            return ""
                        }
                    })
                    .join("")}
                ${this.getMoreButtonHTML(menuIndexToDrop)}
            </div>
        </div>`
    }

    getToolbarMenuItemHTML(menuItem, _index) {
        let returnValue
        switch (menuItem.type) {
            case "info":
                returnValue = this.getInfoHTML(menuItem)
                break
            case "menu":
                returnValue = this.getDropdownHTML(menuItem)
                break
            case "button":
                returnValue = this.getButtonHTML(menuItem)
                break
            default:
                returnValue = ""
                break
        }
        return returnValue
    }

    getMoreButtonHTML(menuIndexToDrop) {
        if (menuIndexToDrop) {
            return `
                <div class="ui-buttonset more-button">
                    <div class="multi-buttons">
                        <span class="multi-buttons-cover fw-button fw-white fw-large edit-button">
                            ${gettext("More")}
                        </span>
                        ${this.getMoreButtonListHTML(menuIndexToDrop)}
                    </div>
                </div>
            `
        } else {
            return ""
        }
    }

    getMoreButtonListHTML(menuIndexToDrop) {
        if (this.editor.menu.toolbarModel.openMore) {
            const remainingItems =
                this.editor.menu.toolbarModel.content.slice(menuIndexToDrop)
            return `
                <div class="fw-pulldown fw-left" style="display: block;">
                    <ul>${remainingItems.map(menuOption => this.getDropdownOptionHTML(menuOption)).join("")}</ul>
                </div>
            `
        } else {
            return ""
        }
    }

    getInfoHTML(menuItem) {
        return `<div class="info">${menuItem.show(this.editor)}</div>`
    }

    getDropdownHTML(menuItem) {
        return `
        <div class="multi-buttons">
            <span class="multi-buttons-cover fw-button fw-white fw-large edit-button${menuItem.disabled && menuItem.disabled(this.editor) ? " disabled" : ""}">
                ${menuItem.show(this.editor)}
            </span>
            ${this.getDropdownListHTML(menuItem)}
        </div>
        `
    }

    getDropdownListHTML(menuItem) {
        if (menuItem.open) {
            return `<div class="fw-pulldown fw-left" style="display: block;"><ul>${menuItem.content.map(menuOption => this.getDropdownOptionHTML(menuOption)).join("")}</ul></div>`
        } else {
            return ""
        }
    }

    getDropdownOptionHTML(menuOption) {
        return `
        <li class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only${menuOption.disabled && menuOption.disabled(this.editor) ? " disabled" : ""}" role="button" aria-disabled="false">
            <span class="ui-button-text">
                <input type="radio" >
                <label class="fw-pulldown-item">${menuOption.title}</label>
            </span>
        </li>
        `
    }

    getButtonHTML(menuItem) {
        return `
        <button aria-label="${menuItem.title}" class="fw-button fw-white fw-large fw-square edit-button${menuItem.disabled && menuItem.disabled(this.editor) ? " disabled" : ""}${menuItem.selected && menuItem.selected(this.editor) ? " ui-state-active" : ""}${menuItem.class ? ` ${menuItem.class(this.editor)}` : ""}" title="${menuItem.title}" >
            <span class="ui-button-text">
                <i class="fa fa-${typeof menuItem.icon === "function" ? menuItem.icon(this.editor) : menuItem.icon}"></i>
            </span>
        </button>`
    }
}
