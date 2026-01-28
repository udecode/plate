const menuTemplate = ({
    id,
    classes,
    height,
    width,
    zIndex,
    menu,
    scroll,
    page
}) =>
    `<div tabindex="-1" role="incontent_menu"
        class="ui-content-menu ui-corner-all ui-widget ui-widget-content ui-front"
        ${id ? `aria-describedby="${id}"` : ""} style="z-index: ${zIndex};">
    <div ${id ? `id="${id}"` : ""} class="ui-content-menu-content ui-widget-content${classes ? ` ${classes}` : ""}${scroll ? " ui-scrollable" : ""}" style="width: ${width}; height: ${height};">
    <div>
        <ul class="content-menu-list">
        ${menu.content
            .map((menuItem, index) => {
                switch (menuItem.type) {
                    case "header":
                        return `<li><span class="content-menu-item-header" title="${menuItem.tooltip}">${
                            typeof menuItem.title === "function"
                                ? menuItem.title(page)
                                : menuItem.title
                        }</span></li>`
                    case "separator":
                        return '<li><hr class="content-menu-item-divider"/></li>'
                    default:
                        return `<li tabindex="0" data-index="${index}" class="content-menu-item${
                            menuItem.disabled && menuItem.disabled(page)
                                ? " disabled"
                                : menuItem.selected
                                  ? " selected"
                                  : ""
                        }" title='${menuItem.tooltip}'>
                        ${
                            typeof menuItem.title === "function"
                                ? menuItem.title(page)
                                : menuItem.title
                        } ${
                            menuItem.icon
                                ? `<span class="content-menu-item-icon"><i class="fa fa-${menuItem.icon}"></i></span>`
                                : ""
                        }
                        </li>`
                }
            })
            .join("")}
        </ul>
    </div>
    </div>
</div>
<div class="ui-widget-overlay ui-front" style="z-index: ${zIndex - 1}"></div>`

export class ContentMenu {
    constructor({
        id = false,
        page = false,
        classes = false,
        menu = {content: []},
        height = false,
        width = false,
        onClose = false,
        scroll = false,
        dialogEl = false,
        backdropEl = false,
        menuPos = false
    }) {
        this.id = id
        this.page = page
        this.classes = classes
        this.menu = menu
        this.height = height ? `${height}px` : "auto"
        this.width = width ? `${width}px` : "auto"
        this.onClose = onClose
        this.scroll = scroll
        this.dialogEl = dialogEl
        this.backdropEl = backdropEl
        this.menuPos = menuPos

        this.focusedIndex = 0
        this.previouslyFocusedElement = null
    }

    open() {
        if (this.dialogEl) {
            return
        }

        this.previouslyFocusedElement = document.activeElement

        document.body.insertAdjacentHTML(
            "beforeend",
            menuTemplate({
                id: this.id,
                classes: this.classes,
                height: this.height,
                width: this.width,
                zIndex: this.getHighestDialogZIndex() + 2,
                menu: this.menu,
                scroll: this.scroll,
                page: this.page
            })
        )
        this.backdropEl = document.body.lastElementChild
        this.dialogEl = this.backdropEl.previousElementSibling
        if (this.menuPos?.X && this.menuPos?.Y) {
            this.positionDialog()
        } else {
            this.centerDialog()
        }
        this.bind()
        this.focusFirstMenuItem()
    }

    centerDialog() {
        const totalWidth = window.innerWidth,
            totalHeight = window.innerHeight,
            dialogRect = this.dialogEl.getBoundingClientRect(),
            dialogWidth = dialogRect.width + 10,
            dialogHeight = dialogRect.height + 10,
            scrollTopOffset = window.pageYOffset,
            scrollLeftOffset = window.pageXOffset
        this.dialogEl.style.top = `${(totalHeight - dialogHeight) / 2 + scrollTopOffset}px`
        this.dialogEl.style.left = `${(totalWidth - dialogWidth) / 2 + scrollLeftOffset}px`
    }

    positionDialog() {
        const dialogHeight = this.dialogEl.getBoundingClientRect().height + 10,
            dialogWidth = this.dialogEl.getBoundingClientRect().width + 10,
            scrollTopOffset = window.pageYOffset,
            clientHeight = window.document.documentElement.clientHeight,
            clientWidth = window.document.documentElement.clientWidth

        // We try to ensure that the menu is seen in the browser at the preferred location.
        // Adjustments are made in case it doesn't fit.
        let top = this.menuPos.Y,
            left = this.menuPos.X

        if (top + dialogHeight > scrollTopOffset + clientHeight) {
            top -= top + dialogHeight - (scrollTopOffset + clientHeight)
        }

        if (top < scrollTopOffset) {
            top = scrollTopOffset + 10
        }

        if (left + dialogWidth > clientWidth) {
            left -= left + dialogWidth - clientWidth
        }

        this.dialogEl.style.top = `${top}px`
        this.dialogEl.style.left = `${left}px`
    }

    bind() {
        this.backdropEl.addEventListener("click", () => this.close())
        this.dialogEl.addEventListener("click", event => this.onclick(event))
        this.dialogEl.addEventListener("keydown", event =>
            this.onKeyDown(event)
        )
        this.dialogEl.focus()
    }

    getHighestDialogZIndex() {
        let zIndex = 100
        document
            .querySelectorAll("div.ui-content-menu")
            .forEach(
                dialogEl => (zIndex = Math.max(zIndex, dialogEl.style.zIndex))
            )
        document
            .querySelectorAll("div.ui-dialog")
            .forEach(
                dialogEl => (zIndex = Math.max(zIndex, dialogEl.style.zIndex))
            )
        return zIndex
    }

    close() {
        if (!this.dialogEl || !this.dialogEl.parentElement) {
            return
        }
        this.dialogEl.parentElement.removeChild(this.dialogEl)
        this.backdropEl.parentElement.removeChild(this.backdropEl)

        // Restore focus to the previously focused element
        if (
            this.previouslyFocusedElement &&
            this.previouslyFocusedElement.focus
        ) {
            this.previouslyFocusedElement.focus()
        }

        if (this.onClose) {
            this.onClose()
        }
    }

    onclick(event) {
        event.preventDefault()
        event.stopImmediatePropagation()
        const target = event.target.closest("li.content-menu-item")
        if (target) {
            const menuNumber = target.dataset.index
            const menuItem = this.menu.content[menuNumber]
            if (menuItem.disabled?.(this.page)) {
                return
            }
            menuItem.action(this.page)
            this.close()
        }
    }

    onKeyDown(event) {
        const {key} = event
        const menuItems = this.dialogEl.querySelectorAll(
            "li.content-menu-item:not(.disabled)"
        )

        switch (key) {
            case "Escape":
                this.close()
                break
            case "ArrowUp":
                event.preventDefault()
                this.focusedIndex =
                    (this.focusedIndex - 1 + menuItems.length) %
                    menuItems.length
                this.focusMenuItem(this.focusedIndex)
                break
            case "ArrowDown":
                event.preventDefault()
                this.focusedIndex = (this.focusedIndex + 1) % menuItems.length
                this.focusMenuItem(this.focusedIndex)
                break
            case "Enter":
            case " ": {
                event.preventDefault()
                const menuItem = this.menu.content[this.focusedIndex]
                if (!menuItem.disabled?.(this.page)) {
                    menuItem.action(this.page)
                    this.close()
                }
                break
            }
        }
    }

    focusFirstMenuItem() {
        const menuItems = this.dialogEl.querySelectorAll(
            "li.content-menu-item:not(.disabled)"
        )
        if (menuItems.length > 0) {
            this.focusedIndex = 0
            this.focusMenuItem(this.focusedIndex)
        }
    }

    focusMenuItem(index) {
        const menuItems = this.dialogEl.querySelectorAll(
            "li.content-menu-item:not(.disabled)"
        )
        if (menuItems[index]) {
            menuItems[index].focus()
        }
    }
}
