import {DiffDOM} from "diff-dom"
import {keyName} from "w3c-keyname"
import {
    addAlert,
    avatarTemplate,
    cleanPath,
    escapeText,
    findTarget
} from "../../../common"

export class HeaderbarView {
    constructor(editorView, options) {
        this.editorView = editorView
        this.options = options

        this.editor = this.options.editor
        this.editor.menu.headerView = this

        this.dd = new DiffDOM({
            valueDiffing: false
        })
        this.headerEl = document.querySelector("#headerbar").firstElementChild
        this.listeners = {}

        this.removeUnavailable(this.options.editor.menu.headerbarModel)
        this.addMissingIds(this.options.editor.menu.headerbarModel)
        this.bindEvents()
        this.update()
        this.parentChain = []

        this.openMenu = null
        this.cursorMenuItem = null
    }

    removeUnavailable(menu) {
        // Remove those menu items from the menu model that are not available for this document.
        // Used for example for language or page size options that aren't permitted according to the
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

    addMissingIds(menu) {
        // Add missing ids to menu items that don't have an ID.
        menu.content.forEach(item => {
            if (!item.id) {
                item.id = Math.random().toString(36).substring(2)
            }
            if (item.type === "menu") {
                this.addMissingIds(item)
            }
        })
    }

    bindEvents() {
        this.listeners.onclick = event => this.onclick(event)
        document.body.addEventListener("click", this.listeners.onclick)
        this.listeners.onKeydown = event => this.onKeydown(event)
        document.body.addEventListener("keydown", this.listeners.onKeydown)
        this.listeners.onKeyup = event => this.onKeyup(event)
        document.body.addEventListener("keyup", this.listeners.onKeyup)
        this.listeners.onFocusout = event => this.onFocusout(event)
        document.body.addEventListener("focusout", this.listeners.onFocusout)
    }

    destroy() {
        if (document.activeElement.id === "document-title") {
            this.saveFileName()
        }
        document.body.removeEventListener("click", this.listeners.onclick)
        document.body.removeEventListener("keydown", this.listeners.onKeydown)
        document.body.removeEventListener("keyup", this.listeners.onKeyup)
        document.body.removeEventListener("focusout", this.listeners.onFocusout)
    }

    onclick(event) {
        const target = event.target
        if (target.matches("div#close-document-top a i.fa-times")) {
            // If the user is offline prevent the closing of the document.
            if (this.editor.app.isOffline()) {
                event.preventDefault()
                event.stopPropagation()
                addAlert(
                    "info",
                    gettext("You cannot close a document when you're offline.")
                )
            }
        } else if (
            target.matches("#headerbar #header-navigation .fw-pulldown-item")
        ) {
            // A header nav menu item was clicked. Now we just need to find
            // which one and execute the corresponding action.
            const searchPath = []
            let seekItem = target
            while (seekItem.closest("li")) {
                let itemNumber = 0
                seekItem = seekItem.closest("li")
                while (seekItem.previousElementSibling) {
                    itemNumber++
                    seekItem = seekItem.previousElementSibling
                }
                searchPath.push(itemNumber)
                seekItem = seekItem.parentElement
            }

            seekItem = seekItem.closest("div.header-menu")
            let menuNumber = 0
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            const menu = this.editor.menu.headerbarModel.content[menuNumber]

            let menuItem = menu

            while (searchPath.length) {
                menuItem = menuItem.content[searchPath.pop()]
            }
            this.executeMenuItem(menuItem, menu)
        } else if (
            target.matches(
                "#headerbar #header-navigation .header-nav-item:not(.disabled)"
            )
        ) {
            // A menu has been clicked, lets find out which one.
            let menuNumber = 0
            let seekItem = target.parentElement
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            this.editor.menu.headerbarModel.content.forEach(menu => {
                if (menu.open) {
                    menu.open = false
                    this.openMenu = null
                    this.closeAllMenu(menu)
                    this.parentChain = []
                }
            })
            this.editor.menu.headerbarModel.content[menuNumber].open = true
            this.openMenu = this.editor.menu.headerbarModel.content[menuNumber]
            this.parentChain = [this.openMenu]
            this.cursorMenuItem = null
            this.update()
        } else {
            let needUpdate = false
            this.cursorMenuItem = null
            this.editor.menu.headerbarModel.content.forEach(menu => {
                if (menu.open) {
                    needUpdate = true
                    menu.open = false
                    this.closeAllMenu(menu)
                    this.parentChain = []
                }
            })
            if (needUpdate) {
                this.openMenu = null
                this.update()
            }
        }
    }

    executeMenuItem(menuItem, menu) {
        switch (menuItem.type) {
            case "action":
                if (menuItem.disabled?.(this.editor)) {
                    return
                }
                menuItem.action(this.editor)
                menu.open = false
                this.openMenu = null
                this.closeAllMenu(menu)
                this.parentChain = []
                this.cursorMenuItem = null
                this.update()
                break
            case "setting":
                // Similar to 'action' but not closing menu.
                if (menuItem.disabled?.(this.editor)) {
                    return
                }
                menuItem.action(this.editor)
                this.update()
                break
            case "menu": {
                let flagCloseAllMenu = true
                if (!this.parentChain.length) {
                    this.parentChain = [menuItem]
                    if (this.openMenu) {
                        this.openMenu.open = false
                    }
                    this.openMenu = menuItem
                    this.openMenu.open = true
                } else {
                    const isMenuItemInParentChain = this.parentChain[
                        this.parentChain.length - 1
                    ].content.find(menu => menu.id === menuItem.id)
                    if (isMenuItemInParentChain) {
                        //Do not close all open menus
                        this.parentChain.push(menuItem)
                    } else if (!isMenuItemInParentChain) {
                        for (
                            let index = this.parentChain.length - 2;
                            index >= 0;
                            index--
                        ) {
                            if (
                                this.parentChain[index].content.find(
                                    menu => menu.id === menuItem.id
                                )
                            ) {
                                const noOfRemovals =
                                    this.parentChain.length - (index + 1)
                                if (noOfRemovals > 0) {
                                    //not last element
                                    this.parentChain.splice(
                                        index + 1,
                                        noOfRemovals
                                    )
                                }
                                this.closeOtherMenu(
                                    this.parentChain[
                                        this.parentChain.length - 1
                                    ],
                                    menuItem
                                )
                                this.parentChain.push(menuItem)
                                flagCloseAllMenu = false
                                break
                            }
                        }
                    }
                    if (flagCloseAllMenu && !isMenuItemInParentChain) {
                        this.closeAllMenu(menu)
                        this.parentChain = [menuItem]
                    }
                }
                menuItem.open = true
                this.update()
                break
            }
            default:
                break
        }
    }

    closeAllMenu(menu) {
        menu.content.forEach(menuItem => {
            if (menuItem.type === "menu" && menuItem.open) {
                menuItem.open = false
                this.closeAllMenu(menuItem)
            }
        })
    }

    closeOtherMenu(menu, currentMenuItem) {
        menu.content.forEach(menuItem => {
            if (menuItem.type === "menu" && menuItem.open) {
                if (
                    !this.parentChain.includes(menuItem) &&
                    currentMenuItem != menuItem
                ) {
                    menuItem.open = false
                }
                this.closeOtherMenu(menuItem, currentMenuItem)
            }
        })
    }

    onKeydown(event) {
        if (findTarget(event, "h1#document-title")) {
            return
        }
        let name = keyName(event)
        if (event.altKey) {
            name = "Alt-" + name
        }
        if (event.ctrlKey) {
            name = "Ctrl-" + name
        }
        if (event.metaKey) {
            name = "Meta-" + name
        }
        if (event.shiftKey) {
            name = "Shift-" + name
        }

        if (this.openMenu) {
            if (
                ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(
                    name
                )
            ) {
                event.preventDefault()
                event.stopPropagation()
                this.changeCursorMenuItem(name)
                return
            } else if (["Enter", " "].includes(name) && this.cursorMenuItem) {
                event.preventDefault()
                event.stopPropagation()
                const menuItem = this.cursorMenuItem
                if (menuItem.type === "menu") {
                    this.cursorMenuItem = menuItem.content[0]
                }
                this.executeMenuItem(
                    menuItem,
                    this.parentChain[this.parentChain.length - 1]
                )
                return
            } else if (name === "Escape") {
                event.preventDefault()
                event.stopPropagation()
                this.openMenu.open = false
                this.cursorMenuItem = null
                this.openMenu = null
                this.parentChain = []
                this.update()
                return
            }
        }
        this.checkKeys(event, this.editor.menu.headerbarModel, name)
    }

    onKeyup(event) {
        if (!findTarget(event, "h1#document-title")) {
            return
        }
        const docTitleEl = document.body.querySelector("h1#document-title")
        if (
            !docTitleEl.childNodes.length ||
            (docTitleEl.childNodes.length === 1 &&
                docTitleEl.firstChild.nodeType === 3)
        ) {
            return
        }
        // Special key was pressed, we reset to text only and blur
        docTitleEl.innerHTML = docTitleEl.innerText
            .trim()
            .replace(/\r?\n|\r/g, "")
        docTitleEl.blur()
    }

    changeCursorMenuItem(name) {
        if (!this.cursorMenuItem) {
            this.cursorMenuItem = this.parentChain[0].content[0]
        } else {
            if (["ArrowDown", "ArrowUp"].includes(name)) {
                let index = this.parentChain[
                    this.parentChain.length - 1
                ].content.indexOf(this.cursorMenuItem)
                if (name === "ArrowDown") {
                    if (
                        index <
                        this.parentChain[this.parentChain.length - 1].content
                            .length -
                            1
                    ) {
                        index++
                    } else {
                        index = 0
                    }
                } else {
                    if (index > 0) {
                        index--
                    } else {
                        index =
                            this.parentChain[this.parentChain.length - 1]
                                .content.length - 1
                    }
                }
                this.cursorMenuItem =
                    this.parentChain[this.parentChain.length - 1].content[index]
            } else if (name === "ArrowLeft") {
                if (this.parentChain.length > 1) {
                    this.cursorMenuItem =
                        this.parentChain[this.parentChain.length - 1]
                    this.parentChain.pop()
                    this.closeAllMenu(
                        this.parentChain[this.parentChain.length - 1]
                    )
                } else {
                    const currentMenuIndex =
                        this.editor.menu.headerbarModel.content.findIndex(
                            menu => menu.open
                        )
                    const newMenuIndex = currentMenuIndex
                        ? currentMenuIndex - 1
                        : this.editor.menu.headerbarModel.content.length - 1
                    this.openMenu.open = false
                    this.openMenu =
                        this.editor.menu.headerbarModel.content[newMenuIndex]
                    this.openMenu.open = true
                    this.cursorMenuItem = this.openMenu.content[0]
                    this.parentChain = [this.openMenu]
                }
            } else if (name === "ArrowRight") {
                if (this.cursorMenuItem.type === "menu") {
                    const menuItem = this.cursorMenuItem
                    this.cursorMenuItem = menuItem.content[0]
                    this.executeMenuItem(
                        menuItem,
                        this.parentChain[this.parentChain.length - 1]
                    )
                } else {
                    const currentMenuIndex =
                        this.editor.menu.headerbarModel.content.findIndex(
                            menu => menu.open
                        )
                    const newMenuIndex =
                        currentMenuIndex ===
                        this.editor.menu.headerbarModel.content.length - 1
                            ? 0
                            : currentMenuIndex + 1
                    this.openMenu.open = false
                    this.openMenu =
                        this.editor.menu.headerbarModel.content[newMenuIndex]
                    this.openMenu.open = true
                    this.cursorMenuItem = this.openMenu.content[0]
                    this.parentChain = [this.openMenu]
                }
            }
        }
        this.update()
    }

    getAccessKeyHTML(title, accessKey) {
        if (!accessKey) {
            return escapeText(title)
        }
        const index = title.toLowerCase().indexOf(accessKey.toLowerCase())
        if (index === -1) {
            return escapeText(title)
        }
        return `${escapeText(title.substring(0, index))}<span class="access-key">${escapeText(title.charAt(index))}</span>${escapeText(title.substring(index + 1))}`
    }

    saveFileName() {
        if (this.editor.app.isOffline()) {
            // We are offline. Just reset.
            return this.update()
        }
        const docTitleEl = document.body.querySelector("h1#document-title")
        const path = cleanPath(this.getTitle(), docTitleEl.innerText.trim())
        this.editor.docInfo.path = path
        this.editor.ws.send(() => {
            return {
                type: "path_change",
                path
            }
        })
        this.update()
    }

    onFocusout(event) {
        if (!findTarget(event, "h1#document-title")) {
            return
        }
        this.saveFileName()
    }

    checkKeys(event, menu, nameKey) {
        menu.content.forEach(menuItem => {
            if (menuItem.keys === nameKey) {
                event.preventDefault()

                // Now execute the menu item
                this.executeMenuItem(menuItem, menu)
            } else if (menuItem.content) {
                this.checkKeys(event, menuItem, nameKey)
            }
        })
    }

    update() {
        if (
            document.activeElement &&
            document.activeElement.matches("h1#document-title")
        ) {
            return
        }
        const diff = this.dd.diff(this.headerEl, this.getHeaderHTML())
        this.dd.apply(this.headerEl, diff)
        if (this.editor.menu.headerbarModel.open) {
            document.body.classList.remove("header-closed")
        } else {
            document.body.classList.add("header-closed")
        }
    }

    getPathText() {
        let text = this.editor.docInfo.path
        if (text.length && !text.endsWith("/")) {
            return text
        } else if (text === "/") {
            text = ""
        }
        text += this.getTitle().replace(/\//g, "") || gettext("Untitled")
        return text
    }

    getTitle() {
        const doc = this.editor.view.state.doc
        let title = ""
        doc.firstChild.forEach(child => {
            if (!child.marks.find(mark => mark.type.name === "deletion")) {
                title += escapeText(child.textContent)
            }
        })
        return title.trim()
    }

    getHeaderHTML() {
        if (!this.editor.menu.headerbarModel.open) {
            // header is closed
            return "<div></div>"
        }
        const folderPath = this.editor.docInfo.path.slice(
            0,
            this.editor.docInfo.path.lastIndexOf("/")
        )
        const exitUrl =
            !folderPath.length && this.editor.app.routes[""].app === "document"
                ? "/"
                : `/documents${encodeURI(folderPath)}/`
        return `<div>
            <div id="close-document-top" title="${gettext("Close the document and return to the document overview menu.")}">
                <a href="${exitUrl}" aria-label="${gettext("Close document")}" title="${gettext("Close document")}">
                    <i class="fa fa-times"></i>
                </a>
            </div>
            <div id="document-top">
                <h1 id="document-title"${this.editor.app.isOffline() || !this.editor.pathEditable ? "" : ' contenteditable="true"'}>${this.getPathText()}</h1>
                <nav id="header-navigation">
                    ${this.getHeaderNavHTML()}
                </nav>
                ${this.getParticipantListHTML()}
            </div>
        </div>`
    }

    getParticipantListHTML() {
        const participants = this.editor.mod.collab.participants
        if (participants.length > 1) {
            return `
                <div id="connected-collaborators">
                    ${participants
                        .map(participant => avatarTemplate({user: participant}))
                        .join("")}
                </div>
            `
        } else {
            return ""
        }
    }

    getHeaderNavHTML() {
        return this.editor.menu.headerbarModel.content
            .map(
                menu => `
                <div class="header-menu">
                    <span class="header-nav-item${menu.disabled && menu.disabled(this.editor) ? " disabled" : ""}"
                          title="${menu.tooltip}"
                          aria-label="${menu.tooltip}"
                          role="menuitem"
                          aria-haspopup="true">
                        ${this.getAccessKeyHTML(menu.title, menu.keys?.slice(-1))}
                    </span>
                    ${menu.open ? this.getMenuHTML(menu) : ""}
                </div>
            `
            )
            .join("")
    }

    getMenuHTML(menu) {
        const title =
            typeof menu.title === "function"
                ? menu.title(this.editor)
                : menu.title
        return `<div class="fw-pulldown fw-left fw-open"
                     role="menu"
                     aria-label="${title}"
                     title="${title}">
            <ul>
                ${menu.content
                    .map(
                        menuItem => `
                        <li role="none">
                            ${this.getMenuItemHTML(menuItem)}
                        </li>`
                    )
                    .join("")}
            </ul>
        </div>`
    }

    getMenuItemHTML(menuItem) {
        let returnValue
        switch (menuItem.type) {
            case "action":
            case "setting":
                returnValue = this.getActionMenuItemHTML(menuItem)
                break
            case "menu":
                returnValue = this.getMenuMenuItemHTML(menuItem)
                break
            case "separator":
                returnValue = "<hr>"
                break
            default:
                break
        }
        return returnValue
    }

    getActionMenuItemHTML(menuItem) {
        return `<span class="fw-pulldown-item${
            menuItem.selected && menuItem.selected(this.editor)
                ? " selected"
                : ""
        }${menuItem.disabled && menuItem.disabled(this.editor) ? " disabled" : ""}${
            menuItem === this.cursorMenuItem ? " cursor" : ""
        }"
        role="menuitem"
        ${menuItem.disabled && menuItem.disabled(this.editor) ? 'aria-disabled="true"' : ""}
        ${menuItem.selected && menuItem.selected(this.editor) ? 'aria-checked="true"' : ""}
        ${menuItem.tooltip ? `title="${menuItem.tooltip}" aria-label="${menuItem.tooltip}"` : ""}>
            ${menuItem.icon ? `<i class="fa fa-${menuItem.icon}" aria-hidden="true"></i>` : ""}
            ${typeof menuItem.title === "function" ? menuItem.title(this.editor) : menuItem.title}
        </span>`
    }

    getMenuMenuItemHTML(menuItem) {
        return `<span class="fw-pulldown-item${
            menuItem.selected && menuItem.selected(this.editor)
                ? " selected"
                : ""
        }${menuItem.disabled && menuItem.disabled(this.editor) ? " disabled" : ""}${
            menuItem === this.cursorMenuItem ? " cursor" : ""
        }" ${menuItem.tooltip ? `title="${menuItem.tooltip}" aria-label="${menuItem.tooltip}"` : ""}>
            ${menuItem.icon ? `<i class="fa fa-${menuItem.icon}"></i>` : ""}
            ${typeof menuItem.title === "function" ? menuItem.title(this.editor) : menuItem.title}
            <span class="fw-icon-right"><i class="fa fa-caret-right"></i></span>
        </span>
        ${menuItem.open ? this.getMenuHTML(menuItem) : ""}`
    }
}
