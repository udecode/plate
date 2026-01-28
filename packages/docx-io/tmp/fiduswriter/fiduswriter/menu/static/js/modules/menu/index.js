import {keyName} from "w3c-keyname"

import * as plugins from "../../plugins/menu"
import {dropdownSelect, post, whenReady} from "../common"
import {headerNavTemplate} from "./templates"

// Bindings for the top menu on overview pages

export class SiteMenu {
    constructor(app, activeItem) {
        this.app = app
        this.activeItem = activeItem
        this.navItems = [
            {
                text: gettext("Documents"),
                url: "/",
                title: gettext("edit documents"),
                id: "documents",
                order: 0,
                keys: "Alt-d"
            },
            {
                text: gettext("Bibliography"),
                url: "/bibliography/",
                title: gettext("manage bibliography library"),
                id: "bibliography",
                order: 1,
                keys: "Alt-b"
            },
            {
                text: gettext("Images"),
                url: "/usermedia/",
                title: gettext("manage image files"),
                id: "images",
                order: 2,
                keys: "Alt-m"
            }
        ]
        this.listeners = {}
        this.keyboardShortcuts = new Map()
    }

    init() {
        this.activatePlugins()
        this.setupKeyboardShortcuts()
        const currentActive = this.navItems.find(
            item => item.id === this.activeItem
        )
        if (currentActive) {
            currentActive.active = true
        }

        whenReady().then(() => {
            this.sortMenu()
            this.renderMenu()
            this.bindPreferencePullDown()
            this.bindKeyboardNavigation()
        })
    }

    setupKeyboardShortcuts() {
        this.navItems.forEach(navItem => {
            if (navItem.keys) {
                this.keyboardShortcuts.set(navItem.keys.toLowerCase(), navItem)
            }
        })
    }

    bindKeyboardNavigation() {
        this.listeners.onKeydown = event => this.onKeydown(event)
        document.body.addEventListener("keydown", this.listeners.onKeydown)
    }

    onKeydown(event) {
        const name = keyName(event)

        if (event.altKey) {
            const shortcut = "alt-" + name.toLowerCase()
            const navItem = this.keyboardShortcuts.get(shortcut)
            if (navItem) {
                event.preventDefault()
                event.stopPropagation()
                this.app.goTo(navItem.url)
                return
            }
        }
        const headerNav = document.getElementById("header-nav")
        const siteMenuItems = headerNav.querySelectorAll(".fw-nav-item a")
        const currentFocus = document.activeElement
        const overviewMenu = document.getElementById("fw-overview-menu")
        const isInSiteMenu = headerNav.contains(currentFocus)
        const isInOverviewDropdown = overviewMenu
            ?.querySelector(".fw-pulldown.fw-left")
            ?.contains(currentFocus)

        if (!isInSiteMenu && !overviewMenu?.contains(currentFocus)) {
            return
        }

        let currentIndex = -1
        if (isInSiteMenu) {
            currentIndex = parseInt(currentFocus.dataset.index)
        }
        switch (name) {
            case "ArrowLeft": {
                if (isInSiteMenu) {
                    event.preventDefault()
                    const prevIndex =
                        currentIndex > 0
                            ? currentIndex - 1
                            : siteMenuItems.length - 1
                    siteMenuItems[prevIndex].focus()
                }
                break
            }
            case "ArrowRight": {
                if (isInSiteMenu) {
                    event.preventDefault()
                    const nextIndex =
                        currentIndex < siteMenuItems.length - 1
                            ? currentIndex + 1
                            : 0
                    siteMenuItems[nextIndex].focus()
                }
                break
            }
            case "ArrowDown": {
                if (isInSiteMenu && overviewMenu) {
                    event.preventDefault()
                    // Focus first overview menu item
                    const firstOverviewItem = overviewMenu.querySelector(
                        "button, div.dropdown"
                    )

                    if (firstOverviewItem) {
                        firstOverviewItem.focus()
                    }
                }
                break
            }
            case "ArrowUp": {
                if (
                    overviewMenu?.contains(currentFocus) &&
                    !isInOverviewDropdown
                ) {
                    event.preventDefault()
                    // Focus the site menu item that's above the current overview menu item
                    const siteMenuItem = siteMenuItems[0]
                    if (siteMenuItem) {
                        siteMenuItem.focus()
                    }
                }
                break
            }
            case "Enter":
            case " ": {
                if (isInSiteMenu) {
                    event.preventDefault()
                    currentFocus.click()
                }
                break
            }
        }
    }

    sortMenu() {
        this.navItems.sort((a, b) => a.order - b.order)
    }

    renderMenu() {
        const headerNav = document.getElementById("header-nav")
        headerNav.innerHTML = headerNavTemplate({
            navItems: this.navItems,
            getAccessKeyHTML: (text, keys) => this.getAccessKeyHTML(text, keys)
        })
    }

    bindPreferencePullDown() {
        dropdownSelect(document.getElementById("user-preferences-pulldown"), {
            button: document.getElementById("preferences-btn"),
            onChange: value => {
                switch (value) {
                    case "profile":
                        this.app.goTo("/user/profile/")
                        break
                    case "contacts":
                        this.app.goTo("/user/contacts/")
                        break
                    case "logout":
                        post("/api/user/logout/").then(
                            () =>
                                (window.location =
                                    this.app.routes[""].app === "document"
                                        ? "/"
                                        : "/documents/")
                        )
                        break
                }
            }
        })
    }

    activatePlugins() {
        // Add plugins, but only once.
        if (!this.plugins) {
            this.plugins = {}

            Object.keys(plugins).forEach(plugin => {
                if (typeof plugins[plugin] === "function") {
                    this.plugins[plugin] = new plugins[plugin](this)
                    this.plugins[plugin].init()
                }
            })
        }
    }

    destroy() {
        document.body.removeEventListener("keydown", this.listeners.onKeydown)
        this.listeners = {}
    }

    getAccessKeyHTML(text, accessKey) {
        if (!accessKey) {
            return text
        }
        const key = accessKey.split("-")[1] // Get the key part after "Alt-"
        const index = text.toLowerCase().indexOf(key.toLowerCase())
        if (index === -1) {
            return text
        }
        return `${text.substring(0, index)}<span class="access-key">${text.charAt(index)}</span>${text.substring(index + 1)}`
    }
}
