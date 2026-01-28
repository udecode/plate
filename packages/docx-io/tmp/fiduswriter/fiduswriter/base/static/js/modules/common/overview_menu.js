import {DiffDOM} from "diff-dom"
import {keyName} from "w3c-keyname"
import {escapeText, whenReady} from "./basic"

export class OverviewMenuView {
    constructor(overview, model) {
        this.overview = overview
        this.model = model()
        this.dd = new DiffDOM({
            valueDiffing: false
        })
        this.openedMenu = false
        this.listeners = {}
        this.keyboardShortcuts = new Map()
    }

    init() {
        whenReady().then(() => {
            this.addMissingIds(this.model)
            this.bindEvents()
            this.setupKeyboardShortcuts()
        })
    }

    addMissingIds(menu) {
        // Add missing ids to menu items that don't have an ID.
        menu.content.forEach(item => {
            if (!item.id) {
                item.id = Math.random().toString(36).substring(2)
            }
            if (item.type === "dropdown") {
                this.addMissingIds(item)
            }
        })
    }

    bindEvents() {
        this.menuEl = document.getElementById("fw-overview-menu")
        this.listeners.onclick = event => this.onclick(event)
        document.body.addEventListener("click", this.listeners.onclick)
        this.listeners.oninput = event => this.oninput(event)
        document.body.addEventListener("input", this.listeners.oninput)
        this.listeners.onKeydown = event => this.onKeydown(event)
        document.body.addEventListener("keydown", this.listeners.onKeydown)
        this.listeners.onFocus = event => this.onFocus(event)
        document.body.addEventListener("focus", this.listeners.onFocus, true)
        this.update()
    }

    setupKeyboardShortcuts() {
        // Map all keyboard shortcuts from the menu model
        this.model.content.forEach(menuItem => {
            if (menuItem.keys) {
                this.keyboardShortcuts.set(
                    menuItem.keys.toLowerCase(),
                    menuItem
                )
            }
        })
    }

    onKeydown(event) {
        let name = keyName(event)
        if (event.altKey) {
            name = "alt-" + name.toLowerCase()
            const menuItem = this.keyboardShortcuts.get(name)
            if (menuItem) {
                event.preventDefault()
                event.stopPropagation()
                event.stopImmediatePropagation()

                if (menuItem.type === "search") {
                    const inputEl = document.getElementById(
                        `${menuItem.id}-input`
                    )
                    if (inputEl) {
                        inputEl.focus()
                    }
                } else if (menuItem.type === "dropdown") {
                    // Toggle dropdown menu
                    // If the menu is already open, close it
                    if (
                        this.openedMenu === this.model.content.indexOf(menuItem)
                    ) {
                        menuItem.open = false
                        this.openedMenu = false
                        this.update()
                    } else {
                        if (this.openedMenu !== false) {
                            this.model.content[this.openedMenu].open = false
                        }
                        menuItem.open = true
                        this.openedMenu = this.model.content.indexOf(menuItem)
                        this.update()
                        const firstDropdownItem = this.menuEl.querySelector(
                            `.fw-pulldown-item.selected`
                        )
                        if (firstDropdownItem) {
                            firstDropdownItem.focus()
                        }
                    }
                } else if (menuItem.action) {
                    menuItem.action(this.overview)
                }
                return
            }
        }

        // Handle horizontal navigation between menu items
        if (name === "ArrowLeft" || name === "ArrowRight") {
            const menuItems = Array.from(
                this.menuEl.querySelectorAll("#fw-overview-menu > li")
            )
            const focusedElement = document.activeElement
            const currentMenuItem = focusedElement.closest("li")

            if (currentMenuItem) {
                event.preventDefault()
                const currentIndex = menuItems.indexOf(currentMenuItem)
                let newIndex

                if (name === "ArrowLeft") {
                    newIndex =
                        currentIndex > 0
                            ? currentIndex - 1
                            : menuItems.length - 1
                } else {
                    newIndex =
                        currentIndex < menuItems.length - 1
                            ? currentIndex + 1
                            : 0
                }

                const nextMenuItem = menuItems[newIndex].querySelector(
                    ".fw-dropdown-menu, .fw-text-menu, button, input"
                )
                if (nextMenuItem) {
                    nextMenuItem.focus()
                }
            }
            return
        }

        // Handle Enter and Space to open dropdown menus
        if (name === "Enter" || name === " ") {
            const focusedElement = document.activeElement
            if (focusedElement.matches(".fw-dropdown-menu")) {
                event.preventDefault()
                const menuItem = this.findMenuItemFromElement(focusedElement)
                if (menuItem && menuItem.type === "dropdown") {
                    if (this.openedMenu !== false) {
                        this.model.content[this.openedMenu].open = false
                    }
                    menuItem.open = true
                    this.openedMenu = this.model.content.indexOf(menuItem)
                    menuItem.selectedIndex = 0
                    this.update()

                    const firstDropdownItem = this.menuEl.querySelector(
                        `.fw-pulldown-item.selected`
                    )
                    if (firstDropdownItem) {
                        firstDropdownItem.focus()
                    }
                }
                return
            }
        }

        if (this.openedMenu !== false) {
            const menuItem = this.model.content[this.openedMenu]

            if (menuItem.type === "dropdown") {
                if (name === "ArrowDown" || name === "ArrowUp") {
                    event.preventDefault()
                    event.stopPropagation()

                    // Find currently selected item
                    let selectedIndex = -1
                    if (menuItem.selectedIndex !== undefined) {
                        selectedIndex = menuItem.selectedIndex
                    }

                    // Calculate new index
                    if (name === "ArrowDown") {
                        selectedIndex =
                            selectedIndex < menuItem.content.length - 1
                                ? selectedIndex + 1
                                : 0
                    } else {
                        selectedIndex -= 1
                        if (selectedIndex < 0) {
                            // Close menu
                            menuItem.open = false
                            this.openedMenu = false
                            delete menuItem.selectedIndex
                            this.update()
                            const dropdownButton = this.menuEl.querySelector(
                                `#${menuItem.id}-button`
                            )
                            if (dropdownButton) {
                                dropdownButton.focus()
                            }
                        }
                    }

                    menuItem.selectedIndex = selectedIndex
                    this.update()
                    const selectedEl = this.menuEl.querySelector(
                        `.fw-pulldown-item.selected`
                    )
                    if (selectedEl) {
                        selectedEl.focus()
                    }
                } else if (name === "Enter" || name === " ") {
                    event.preventDefault()
                    event.stopPropagation()

                    if (
                        menuItem.selectedIndex !== undefined &&
                        menuItem.content[menuItem.selectedIndex]
                    ) {
                        const selectedItem =
                            menuItem.content[menuItem.selectedIndex]
                        if (selectedItem.action) {
                            selectedItem.action(this.overview)
                            menuItem.open = false
                            this.openedMenu = false
                            delete menuItem.selectedIndex
                            this.update()
                        }
                    }
                } else if (name === "Escape") {
                    event.preventDefault()
                    event.stopPropagation()

                    menuItem.open = false
                    this.openedMenu = false
                    delete menuItem.selectedIndex
                    this.update()
                    const dropdownButton = document.getElementById(
                        `${menuItem.id}-button`
                    )
                    if (dropdownButton) {
                        dropdownButton.focus()
                    }
                }
            }
        }
    }

    onFocus(event) {
        // Ignore if the focus event is triggered by JavaScript
        if (event.isTrusted === false) {
            return
        }
        const target = event.target
        if (this.openedMenu !== false) {
            if (target.matches("#fw-overview-menu li .fw-pulldown-item")) {
                const menuItem = this.model.content[this.openedMenu]
                if (menuItem) {
                    const itemNumber = Array.from(
                        target.parentElement.parentElement.children
                    ).indexOf(target.parentElement)
                    menuItem.selectedIndex = itemNumber
                    this.update()
                }
            } else {
                // Close dropdown menu if focus is outside of the dropdown
                const menuItem = this.model.content[this.openedMenu]
                if (menuItem) {
                    menuItem.open = false
                    delete menuItem.selectedIndex
                    this.openedMenu = false
                    this.update()
                }
            }
        }
    }

    findMenuItemFromElement(element) {
        const menuItem = element.closest("li")
        if (!menuItem) {
            return null
        }

        let menuNumber = 0
        let seekItem = menuItem
        while (seekItem.previousElementSibling) {
            menuNumber++
            seekItem = seekItem.previousElementSibling
        }
        return this.model.content[menuNumber]
    }

    focusMenuItem(menuItem) {
        const menuEl = this.menuEl.querySelector(`#${menuItem.id}`)
        if (menuEl) {
            menuEl.focus()
        }
    }

    oninput(event) {
        const target = event.target
        if (target.matches("#fw-overview-menu > li > .fw-button > input")) {
            // A text was entered in a top entry. we find which one.
            let menuNumber = 0
            let seekItem = target.closest("li")
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            const menuItem = this.model.content[menuNumber]
            if (menuItem.input) {
                menuItem.input(this.overview, target.value)
                target.focus()
            }
        }
    }

    onclick(event) {
        const target = event.target
        if (
            target.matches("#fw-overview-menu li li, #fw-overview-menu li li *")
        ) {
            event.preventDefault()
            let itemNumber = 0
            let seekItem = target.closest("li")
            while (seekItem.previousElementSibling) {
                itemNumber++
                seekItem = seekItem.previousElementSibling
            }
            let menuNumber = 0
            seekItem = seekItem.parentElement.parentElement.parentElement
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            this.model.content[menuNumber].content[itemNumber].action(
                this.overview
            )
            this.model.content[menuNumber].open = false

            if (this.model.content[menuNumber].type === "dropdown") {
                this.model.content[menuNumber].title =
                    this.model.content[menuNumber].content[itemNumber].title
                this.openedMenu = false
                this.update()
            }
            return false
        } else if (
            target.matches(
                "#fw-overview-menu li .select-action input[type=checkbox]"
            )
        ) {
            event.preventDefault()
            event.stopImmediatePropagation()
            event.stopPropagation()
            // A toolbar dropdown menu item was clicked. We just need to
            // find out which one
            let menuNumber = 0
            let seekItem = target.closest("li")
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            const menuItem = this.model.content[menuNumber]

            if (menuItem.checked === true) {
                menuItem.checked = false
                menuItem.uncheckAction(this.overview)
            } else {
                menuItem.checked = true
                menuItem.checkAction(this.overview)
            }
            return true
        } else if (
            target.matches("#fw-overview-menu li, #fw-overview-menu li *")
        ) {
            // A toolbar dropdown menu item was clicked. We just need to
            // find out which one
            let menuNumber = 0
            let seekItem = target.closest("li")
            while (seekItem.previousElementSibling) {
                menuNumber++
                seekItem = seekItem.previousElementSibling
            }
            const menuItem = this.model.content[menuNumber]
            // if it is a dropdown menu, open it. Otherwise execute an
            // associated action.
            if (
                ["dropdown", "select-action-dropdown"].includes(menuItem.type)
            ) {
                event.preventDefault()
                if (this.openedMenu === menuNumber) {
                    this.model.content[this.openedMenu].open = false
                    this.openedMenu = false
                } else {
                    if (this.openedMenu !== false) {
                        this.model.content[this.openedMenu].open = false
                    }
                    menuItem.open = true
                    this.openedMenu = menuNumber
                }
                this.update()
            } else if (menuItem.action) {
                event.preventDefault()
                menuItem.action(this.overview)
                this.announceForScreenReader(gettext("Action completed"))
                if (this.openedMenu !== false) {
                    this.model.content[this.openedMenu].open = false
                    this.openedMenu = false
                }
                this.update()
            }
            return false
        } else if (this.openedMenu !== false) {
            this.model.content[this.openedMenu].open = false
            this.openedMenu = false
            this.update()
        }
    }

    update() {
        if (!this.menuEl) {
            // page has not yet been loaded. abort
            return
        }
        const diff = this.dd.diff(this.menuEl, this.getMenuHTML())
        this.dd.apply(this.menuEl, diff)
    }

    getMenuHTML() {
        return `<ul id="fw-overview-menu">${this.model.content
            .map(
                menuItem =>
                    `<li class="fw-overview-menu-item${menuItem.id ? ` ${menuItem.id}` : ""} ${menuItem.type}">${this.getMenuItemHTML(
                        menuItem
                    )}</li>`
            )
            .join("")}</ul>`
    }

    // Underline access keys
    getAccessKeyHTML(title, accessKey) {
        if (!accessKey) {
            return escapeText(title)
        }
        const index = title.toLowerCase().indexOf(accessKey.toLowerCase())
        if (index === -1) {
            return escapeText(title)
        }
        return `${escapeText(title.substring(0, index))}<span class="access-key">${escapeText(
            title.charAt(index)
        )}</span>${escapeText(title.substring(index + 1))}`
    }

    getMenuItemHTML(menuItem) {
        let returnValue
        switch (menuItem.type) {
            case "dropdown":
                returnValue = this.getDropdownHTML(menuItem)
                break
            case "select-action-dropdown":
                returnValue = this.getSelectionActionDropdownHTML(menuItem)
                break
            case "text":
                returnValue = this.getTextHTML(menuItem)
                break
            case "button":
                returnValue = this.getButtonHTML(menuItem)
                break
            case "search":
                returnValue = this.getSearchHTML(menuItem)
                break
            default:
                returnValue = ""
                break
        }
        return returnValue
    }

    getSelectionActionDropdownHTML(menuItem) {
        return `
        <div class="select-action fw-button fw-light fw-large">
            <input type="checkbox" ${menuItem.checked ? "checked" : ""}>
            <span class="select-action-dropdown"><i class="fa fa-caret-down"></i></span>
        </div>
        ${this.getDropdownListHTML(menuItem)}
        `
    }

    getDropdownHTML(menuItem) {
        const accessKey = menuItem.keys?.split("-")[1]
        return `
        <div class="dropdown fw-dropdown-menu"
          role="button"
          aria-haspopup="true"
          aria-expanded="${menuItem.open ? "true" : "false"}"
          tabindex="0"
          id="${menuItem.id}-button">
            <label id="${menuItem.id}-label">
                ${this.getAccessKeyHTML(
                    menuItem.title
                        ? menuItem.title
                        : menuItem.content.length
                          ? menuItem.content[0].title
                          : "",
                    accessKey
                )}
            </label>
            <span class="dropdown" aria-hidden="true">
                <i class="fa fa-caret-down"></i>
            </span>
        </div>
        ${this.getDropdownListHTML(menuItem)}
        `
    }

    getDropdownListHTML(menuItem) {
        if (menuItem.open) {
            return `<div class="fw-pulldown fw-left"
                        role="menu"
                        style="display: block;"
                        aria-labelledby="${menuItem.id}-button"
                        >
                <ul role="presentation">${menuItem.content
                    .map((menuOption, index) =>
                        this.getDropdownOptionHTML(menuOption, index)
                    )
                    .join("")}</ul></div>`
        } else {
            return ""
        }
    }

    getDropdownOptionHTML(menuOption, index) {
        const menuItem = this.model.content[this.openedMenu]
        const isSelected = menuItem.selectedIndex === index
        return `
      <li role="none">
          <span class="fw-pulldown-item${isSelected ? " selected" : ""}"
                role="menuitem" tabindex="0">
              ${escapeText(menuOption.title)}
          </span>
      </li>
      `
    }

    getButtonHTML(menuItem) {
        return `
        <button class="fw-button fw-light fw-large"
                title="${menuItem.title}"
                tabindex="0"
                role="menuitem">
            ${menuItem.title}
            ${menuItem.icon ? `<i class="fa fa-${menuItem.icon}" aria-hidden="true"></i>` : ""}
        </button>`
    }

    announceForScreenReader(message) {
        const announcement = document.createElement("div")
        announcement.setAttribute("aria-live", "polite")
        announcement.classList.add("sr-only") // CSS to visually hide but keep available to screen readers
        announcement.textContent = message
        document.body.appendChild(announcement)
        setTimeout(() => announcement.remove(), 1000)
    }

    getTextHTML(menuItem) {
        const accessKey = menuItem.keys?.split("-")[1]
        return `
        <button class="fw-text-menu"
            title="${menuItem.title}${menuItem.keys ? ` (${menuItem.keys})` : ""}"
              >
              ${this.getAccessKeyHTML(menuItem.title, accessKey)}
        </button>`
    }

    getSearchHTML(menuItem) {
        const accessKey = menuItem.keys?.split("-")[1]
        return `
        <div class="fw-button fw-light fw-large disabled fw-search-field-container">
            <label for="${menuItem.id}-input" class="fw-search-label">
                ${this.getAccessKeyHTML(menuItem.title, accessKey)}
            </label>
            <input type="search"
                class="fw-search-field"
                id="${menuItem.id}-input"
                aria-description="${gettext("Type to search")}"
                placeholder="${menuItem.title}"
                aria-label="${menuItem.title}"
                >
            ${menuItem.icon ? `<i class="fa fa-${menuItem.icon}" aria-hidden="true"></i>` : ""}
        </div>`
    }

    destroy() {
        // Remove all event listeners
        document.body.removeEventListener("click", this.listeners.onclick)
        document.body.removeEventListener("input", this.listeners.oninput)
        document.body.removeEventListener("keydown", this.listeners.onKeydown)
        document.body.removeEventListener("focus", this.listeners.onFocus)

        // Clear references
        this.listeners = {}
        this.keyboardShortcuts.clear()
        this.menuEl = null
        this.openedMenu = false
    }
}
