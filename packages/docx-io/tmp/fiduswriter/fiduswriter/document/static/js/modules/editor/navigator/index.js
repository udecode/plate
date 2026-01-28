import {escapeText, findTarget} from "../../common"
export class ModNavigator {
    constructor(editor) {
        editor.mod.navigator = this
        this.editor = editor
        this.navigatorEl = document.querySelector("#navigator")
        this.listeners = {}
        this.navigatorFilters = editor.menu.navigatorFilterModel.content
        this.defaultFilters = ["heading1", "heading2", "heading3"]

        this.lastSelectedTarget = null
    }

    init() {
        this.render()
        this.bindEvents()
    }

    render() {
        this.navigatorEl.innerHTML = this.getNavigatorTemplate()
    }

    bindEvents() {
        document.body.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, "#navigator-button", el):
                    if (this.navigatorEl.classList.contains("opened")) {
                        this.closeNavigator()
                    } else {
                        const navigatorListEl =
                            document.getElementById("navigator-list")
                        if (navigatorListEl) {
                            navigatorListEl.innerHTML =
                                this.populateNavigator() || "" //Populating the list
                        }
                        this.openNavigator()
                        const activeHeading = this.navigatorEl.querySelector(
                            "#navigator-list .active-heading a"
                        )
                        if (activeHeading) {
                            activeHeading.focus()
                        } else {
                            const firstFocusable =
                                this.navigatorEl.querySelector(
                                    "#navigator-list [href]"
                                )
                            if (firstFocusable) {
                                firstFocusable.focus()
                            }
                        }
                    }
                    break
                case findTarget(event, "#navigator-list a", el): {
                    event.preventDefault()
                    event.stopImmediatePropagation()
                    const target = el.target.getAttribute("href").slice(1)

                    if (target == "title") {
                        this.editor.scrollPosIntoView(1, this.editor.view)
                        this.lastSelectedTarget = "title"
                    } else if (target == "bibliography") {
                        this.editor.scrollBibliographyIntoView(target)
                    } else {
                        // Store the selected target ID for later focus
                        this.lastSelectedTarget = target
                        this.editor.scrollIdIntoView(target)
                        this.switchActiveHeading(el.target.parentNode)
                    }

                    // Keep focus on the navigation menu item
                    el.target.focus()
                    break
                }
                case findTarget(event, "#navigator-filter-icon", el): {
                    const navigatorFilterEl =
                        document.getElementById("navigator-filter")
                    if (navigatorFilterEl?.classList.contains("hide")) {
                        this.showFilters()
                    } else {
                        this.hideFilters()
                    }
                    break
                }
                case findTarget(event, "#navigator-filter-back", el): {
                    this.defaultFilters = []
                    document
                        .querySelectorAll("#navigator-filter input")
                        .forEach(item => {
                            if (item.checked) {
                                this.defaultFilters.push(item.id)
                            }
                        })
                    const navigatorListEl =
                        document.getElementById("navigator-list")
                    if (navigatorListEl) {
                        navigatorListEl.innerHTML =
                            this.populateNavigator() || ""
                    }
                    this.hideFilters()
                    break
                }
                case findTarget(event, "input", el):
                    break
                case findTarget(event, "label", el):
                    break
                default:
                    this.closeNavigator()
                    break
            }
        })

        document.body
            .querySelector("#navigator-list")
            .addEventListener("mouseover", () => {
                document.body.classList.add("no-scroll")
            })
        document.body
            .querySelector("#navigator-list")
            .addEventListener("mouseout", () => {
                document.body.classList.remove("no-scroll")
            })
        document.body.addEventListener("keydown", event => {
            // Alt+n shortcut to toggle navigator
            if (event.altKey && event.key.toLowerCase() === "n") {
                event.preventDefault()
                if (this.navigatorEl.classList.contains("opened")) {
                    this.closeNavigator()
                } else {
                    const navigatorListEl =
                        document.getElementById("navigator-list")
                    if (navigatorListEl) {
                        navigatorListEl.innerHTML =
                            this.populateNavigator() || ""
                    }
                    this.openNavigator()
                    const activeHeading = this.navigatorEl.querySelector(
                        "#navigator-list .active-heading a"
                    )
                    if (activeHeading) {
                        activeHeading.focus()
                    } else {
                        const firstFocusable = this.navigatorEl.querySelector(
                            "#navigator-list [href]"
                        )
                        if (firstFocusable) {
                            firstFocusable.focus()
                        }
                    }
                }
            }

            const navigatorEl = document.getElementById("navigator")

            if (!navigatorEl || !navigatorEl.classList.contains("opened")) {
                // If the navigator is not opened, do nothing
                return
            }

            // Inside the navigator, handle keyboard navigation

            if (event.key === "Escape") {
                this.closeNavigator()
                return
            }

            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                event.stopImmediatePropagation()
                const activeElement = document.activeElement
                if (activeElement && activeElement.tagName === "A") {
                    activeElement.click()
                }
            }

            // Tab key navigation (keep focus inside dialog)
            if (event.key === "Tab") {
                const focusableElements = navigatorEl.querySelectorAll(
                    'button, [href], input, [tabindex="0"]'
                )
                if (focusableElements.length > 0) {
                    const firstElement = focusableElements[0]
                    const lastElement =
                        focusableElements[focusableElements.length - 1]

                    if (
                        event.shiftKey &&
                        document.activeElement === firstElement
                    ) {
                        event.preventDefault()
                        lastElement.focus()
                    } else if (
                        !event.shiftKey &&
                        document.activeElement === lastElement
                    ) {
                        event.preventDefault()
                        firstElement.focus()
                    }
                }
                return
            }

            const navigatorListEl = document.getElementById("navigator-list")

            // Arrow key navigation within the list
            if (
                !navigatorListEl.classList.contains("hide") &&
                (event.key === "ArrowDown" || event.key === "ArrowUp")
            ) {
                event.preventDefault()

                const links = navigatorListEl.querySelectorAll("a")
                if (links.length === 0) {
                    return
                }

                let currentIndex = -1
                links.forEach((link, index) => {
                    if (document.activeElement === link) {
                        currentIndex = index
                    }
                })

                let newIndex
                if (event.key === "ArrowDown") {
                    newIndex =
                        currentIndex < links.length - 1 ? currentIndex + 1 : 0
                } else {
                    // ArrowUp
                    newIndex =
                        currentIndex > 0 ? currentIndex - 1 : links.length - 1
                }

                links[newIndex].focus()
                return
            }

            const navigatorFilterEl =
                document.getElementById("navigator-filter")

            // Arrow key navigation within the filter menu
            if (
                !navigatorFilterEl.classList.contains("hide") &&
                (event.key === "ArrowDown" || event.key === "ArrowUp")
            ) {
                event.preventDefault()

                const checkboxes = navigatorFilterEl.querySelectorAll(
                    'input[type="checkbox"]'
                )
                if (checkboxes.length === 0) {
                    return
                }

                let currentIndex = -1
                checkboxes.forEach((checkbox, index) => {
                    if (document.activeElement === checkbox) {
                        currentIndex = index
                    }
                })

                let newIndex
                if (event.key === "ArrowDown") {
                    newIndex =
                        currentIndex < checkboxes.length - 1
                            ? currentIndex + 1
                            : 0
                } else {
                    // ArrowUp
                    newIndex =
                        currentIndex > 0
                            ? currentIndex - 1
                            : checkboxes.length - 1
                }

                checkboxes[newIndex].focus()
                return
            }
        })
    }

    switchActiveHeading(new_heading) {
        Array.prototype.forEach.call(
            document.querySelectorAll("#navigator-list .active-heading"),
            active_heading => active_heading.classList.remove("active-heading")
        )
        new_heading.classList.add("active-heading")
    }

    openNavigator() {
        const navigatorEl = document.getElementById("navigator")
        const navigatorButtonEl = document.getElementById("navigator-button")
        const navigatorFilterEl = document.getElementById("navigator-filter")
        const navigatorListEl = document.getElementById("navigator-list")
        const navigatorFilterBackEl = document.getElementById(
            "navigator-filter-back"
        )
        const navigatorFilterIconEl = document.getElementById(
            "navigator-filter-icon"
        )
        if (
            !navigatorEl ||
            !navigatorFilterEl ||
            !navigatorListEl ||
            !navigatorFilterBackEl ||
            !navigatorFilterIconEl
        ) {
            return
        }
        navigatorEl.classList.add("opened")
        navigatorFilterEl.classList.add("hide")
        navigatorListEl.classList.remove("hide")
        navigatorFilterBackEl.classList.add("hide")
        navigatorFilterIconEl.classList.remove("hide")
        navigatorButtonEl.setAttribute("aria-expanded", "true")
        this.scrollToActiveHeading()
    }

    scrollToActiveHeading() {
        const listEl = document.getElementById("navigator-list")
        const activeHeading = listEl?.querySelector(".active-heading")
        if (activeHeading) {
            activeHeading.scrollIntoView()
        }
    }

    closeNavigator() {
        const navigatorEl = document.getElementById("navigator")
        const navigatorButtonEl = document.getElementById("navigator-button")
        if (navigatorEl) {
            navigatorEl.classList.remove("opened")
            navigatorButtonEl.setAttribute("aria-expanded", "false")
        }

        if (this.lastSelectedTarget) {
            const target =
                this.lastSelectedTarget == "title"
                    ? document.body.querySelector(`div.doc-title`)
                    : document.body.querySelector(`#${this.lastSelectedTarget}`)
            if (target) {
                // Set selection at end of target.
                const range = document.createRange()
                const selection = window.getSelection()
                range.selectNodeContents(target)
                range.collapse()
                selection.removeAllRanges()
                selection.addRange(range)
                target.focus()
            }
            this.lastSelectedTarget = null
        }
    }

    showFilters() {
        const navigatorFilterEl = document.getElementById("navigator-filter")
        const navigatorListEl = document.getElementById("navigator-list")
        const navigatorFilterBackEl = document.getElementById(
            "navigator-filter-back"
        )
        const navigatorFilterIconEl = document.getElementById(
            "navigator-filter-icon"
        )
        if (
            !navigatorFilterEl ||
            !navigatorFilterBackEl ||
            !navigatorListEl ||
            !navigatorFilterIconEl
        ) {
            return
        }
        navigatorFilterEl.classList.remove("hide")
        navigatorFilterBackEl.classList.remove("hide")
        navigatorListEl.classList.add("hide")
        navigatorFilterIconEl.classList.add("hide")
        //populating the filter list
        navigatorFilterEl.innerHTML = this.populateNavFilter()
    }

    hideFilters() {
        const navigatorFilterEl = document.getElementById("navigator-filter")
        const navigatorListEl = document.getElementById("navigator-list")
        const navigatorFilterBackEl = document.getElementById(
            "navigator-filter-back"
        )
        const navigatorFilterIconEl = document.getElementById(
            "navigator-filter-icon"
        )
        if (
            !navigatorFilterEl ||
            !navigatorFilterBackEl ||
            !navigatorListEl ||
            !navigatorFilterIconEl
        ) {
            return
        }
        navigatorFilterEl.classList.add("hide")
        navigatorFilterBackEl.classList.add("hide")
        navigatorListEl.classList.remove("hide")
        navigatorFilterIconEl.classList.remove("hide")

        this.scrollToActiveHeading()
    }

    populateNavigator() {
        const currentPos = this.editor.view.state.selection.$head.pos
        const title =
            document.body.querySelector("div.doc-title")?.innerText ||
            gettext("Untitled Document")
        const items = [
            {
                id: "title",
                textContent: title,
                type: {name: "h1"}
            }
        ]
        let nearestHeader = ""
        this.editor.view.state.doc.descendants((node, pos) => {
            if (node.attrs?.hidden) {
                return false
            } else if (
                this.defaultFilters.includes(node.type.name) &&
                node.textContent !== ""
            ) {
                if (pos <= currentPos) {
                    nearestHeader = node
                } else if (nearestHeader !== "") {
                    items[items.length - 1] = Object.assign(
                        {},
                        items[items.length - 1],
                        {
                            class: "active-heading"
                        }
                    )
                    nearestHeader = ""
                }
                items.push({
                    id: node.attrs.id,
                    textContent: node.textContent,
                    type: node.type
                })
            }
        })
        const bibHeader = document.querySelector("h1.doc-bibliography-header")
        if (bibHeader) {
            items.push({
                id: "bibliography",
                textContent: bibHeader.innerText,
                type: {name: "h1"}
            })
        }
        if (items.length) {
            return this.navigatorHTML(items)
        } else {
            return false
        }
    }

    populateNavFilter() {
        return this.navigatorFilters
            .map(item => {
                const level = item.level
                const id = `heading${level}`
                return `<div role="menuitem">
                            <input type="checkbox" class="form-checkbox" id="${id}" ${this.inDefault(level)} aria-labelledby="label-${id}" />
                            <label id="label-${id}" class="navigator-label" for="${id}">${item.title}</label>
                        </div>`
            })
            .join("")
    }

    inDefault(level) {
        if (this.defaultFilters.includes("heading" + level)) {
            return "checked"
        } else {
            return ""
        }
    }

    navigatorHTML(items) {
        return `
            ${items
                .map(item => {
                    const level = item.type.name.substr(-1)
                    const className = item.class ? ` class="${item.class}"` : ""
                    return `<h${level}${className}><a href="#${item.id}" tabindex="0">${escapeText(item.textContent)}</a></h${level}>`
                })
                .join("")}`
    }

    getNavigatorTemplate() {
        return `
            <div id="navigator-content" role="dialog" aria-labelledby="navigator-header">
                <div class="header-container">
                    <button id="navigator-filter-back" class="hide" aria-label="${gettext("Back to navigator")}" tabindex="0">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h1 id="navigator-header" class="header">${gettext("Document Navigator")}</h1>
                    <button id="navigator-filter-icon" aria-label="${gettext("Navigator settings")}" tabindex="0">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
                <div id="navigator-list" role="navigation" aria-label="${gettext("Document headings")}">
                </div>
                <div id="navigator-filter" class="hide" role="menu" aria-label="${gettext("Filter options")}">
                </div>
            </div>
            <button id="navigator-button"
                aria-expanded="false"
                aria-label="${gettext("Toggle document navigator")}"
                title="${gettext("Document N\u0332avigator")}">
                <span class="navigator-arrow-icon"><i class="fas fa-scroll"></i></span>
            </button>
            `
    }
}
