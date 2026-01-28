import {escapeText, noSpaceTmp} from "../../../common"
import {ContributorDialog} from "../../dialogs"

/** @typedef {{text: string, className: string, action: Function}} MenuOption */

/**
 * Contributor drop-up menu widget
 * Shows a menu above the selected contributor with options like "Edit"
 * Supports keyboard navigation and mouse interactions
 */
class ContributorDropUp {
    /**
     * @param {Object} selection - ProseMirror selection object
     * @param {Object} view - ProseMirror editor view
     * @param {Array<MenuOption>} [menuOptions] - Optional custom menu options
     */
    constructor(selection, view, menuOptions = null) {
        this.selection = selection
        this.view = view
        this.parentNode = selection.$anchor.parent
        this.focusedIndex = -1
        this.menuOptions = menuOptions || this.getDefaultMenuOptions()
        // Flag to prevent blur handler from closing drop-up when opening dialog
        this.openingDialog = false
        this.dropUp = this.createDropUp()
        this.setupEventHandlers()
    }

    /**
     * Get default menu options for contributor drop-up
     * @returns {Array<MenuOption>} Default menu options
     */
    getDefaultMenuOptions() {
        return [
            {
                text: gettext("Edit"),
                className: "edit-contributor",
                action: () => this.openContributorDialog()
            }
        ]
    }

    /**
     * Create the drop-up DOM element
     * @returns {HTMLElement} The drop-up element
     */
    createDropUp() {
        const dropUp = document.createElement("span")
        const requiredPx = 120

        dropUp.classList.add("drop-up-outer")

        // Generate HTML for each menu option
        const optionsHTML = this.menuOptions
            .map(
                (option, index) =>
                    `<li class="drop-up-option ${option.className}"
                       data-index="${index}"
                       tabindex="-1">${escapeText(option.text)}</li>`
            )
            .join("")

        dropUp.innerHTML = noSpaceTmp`
            <div class="link drop-up-inner" style="top: -${requiredPx}px;">
                <div class="drop-up-head">
                    <div>${escapeText(this.parentNode.attrs.item_title)}</div>
                </div>
                <ul class="drop-up-options">
                    ${optionsHTML}
                </ul>
            </div>`

        return dropUp
    }

    /**
     * Set up all event handlers for the drop-up
     */
    setupEventHandlers() {
        const optionsList = this.dropUp.querySelector(".drop-up-options")
        const options = this.dropUp.querySelectorAll(".drop-up-option")

        // Make the options list focusable so it can receive keyboard events
        optionsList.setAttribute("tabindex", "0")

        // Setup handlers for each option
        options.forEach((option, index) => {
            // Mouse enter for visual highlight
            option.addEventListener("mouseenter", () => {
                this.focusOption(index)
            })

            // Mouse leave to remove highlight
            option.addEventListener("mouseleave", () => {
                this.unfocusOption(index)
            })

            // Click to activate the option
            option.addEventListener("click", event => {
                event.preventDefault()
                this.activateOption(index)
            })

            // Mousedown to prevent blur issues and stop propagation
            option.addEventListener("mousedown", event => {
                event.preventDefault()
                event.stopPropagation()
            })
        })

        // Keyboard navigation for the options list
        optionsList.addEventListener("keydown", event => {
            this.handleKeyDown(event)
        })

        // Focus handler - focus first option when list gets focus
        optionsList.addEventListener("focus", () => {
            this.focusOption(0)
        })

        // Blur handler to close the drop-up
        optionsList.addEventListener("blur", () => {
            // Use requestAnimationFrame to check if focus moved outside drop-up
            requestAnimationFrame(() => {
                // If we're opening a dialog, don't close (prevents deselecting contributor)
                if (this.openingDialog) {
                    this.openingDialog = false
                    return
                }
                // Close drop-up if focus moved outside it
                if (!this.dropUp.contains(document.activeElement)) {
                    this.closeDropUp()
                }
            })
        })

        // Prevent mousedown events on the drop-up from propagating to ProseMirror
        this.dropUp.addEventListener("mousedown", event => {
            event.stopPropagation()
        })
    }

    /**
     * Handle keyboard navigation events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        const optionCount = this.menuOptions.length

        switch (event.key) {
            case "ArrowDown":
                event.preventDefault()
                event.stopPropagation()
                // If at last option and there's more than one option, close drop-up and return to contributor
                if (this.focusedIndex === optionCount - 1 && optionCount > 1) {
                    this.closeDropUp()
                    return
                }
                // Move to next option
                this.focusedIndex = (this.focusedIndex + 1) % optionCount
                this.updateFocusedOption()
                break

            case "ArrowUp":
                event.preventDefault()
                event.stopPropagation()
                // If at first option and there's more than one option, close drop-up and return to contributor
                if (this.focusedIndex === 0 && optionCount > 1) {
                    this.closeDropUp()
                    return
                }
                // Move to previous option
                this.focusedIndex =
                    (this.focusedIndex - 1 + optionCount) % optionCount
                this.updateFocusedOption()
                break

            case "Enter":
            case " ":
                event.preventDefault()
                if (this.focusedIndex >= 0) {
                    this.activateOption(this.focusedIndex)
                }
                break

            case "Escape":
                event.preventDefault()
                event.stopPropagation()
                this.closeDropUp()
                break

            case "Home":
                event.preventDefault()
                event.stopPropagation()
                this.focusOption(0)
                break

            case "End":
                event.preventDefault()
                event.stopPropagation()
                this.focusOption(optionCount - 1)
                break
        }
    }

    /**
     * Focus a specific option by index
     * @param {number} index - Index of the option to focus
     */
    focusOption(index) {
        const options = this.dropUp.querySelectorAll(".drop-up-option")
        // Unfocus previous option
        if (this.focusedIndex >= 0 && this.focusedIndex < options.length) {
            options[this.focusedIndex].classList.remove("focused")
        }
        // Focus new option
        this.focusedIndex = index
        if (options[index]) {
            options[index].classList.add("focused")
        }
    }

    /**
     * Unfocus a specific option by index (used for mouse leave)
     * @param {number} index - Index of the option to unfocus
     */
    unfocusOption(index) {
        const options = this.dropUp.querySelectorAll(".drop-up-option")
        if (options[index]) {
            options[index].classList.remove("focused")
        }
        // Only reset focusedIndex if this was the focused option
        if (this.focusedIndex === index) {
            this.focusedIndex = -1
        }
    }

    /**
     * Update visual state of the currently focused option
     */
    updateFocusedOption() {
        const options = this.dropUp.querySelectorAll(".drop-up-option")
        // Remove focused class from all options
        options.forEach(option => {
            option.classList.remove("focused")
        })
        // Add focused class to current option
        if (this.focusedIndex >= 0 && this.focusedIndex < options.length) {
            options[this.focusedIndex].classList.add("focused")
        }
    }

    /**
     * Activate a menu option by index
     * @param {number} index - Index of the option to activate
     */
    activateOption(index) {
        if (index >= 0 && index < this.menuOptions.length) {
            const option = this.menuOptions[index]
            if (option.action && typeof option.action === "function") {
                option.action()
            }
        }
    }

    /**
     * Open the contributor edit dialog
     */
    openContributorDialog() {
        // Set flag to prevent blur handler from closing drop-up or deselecting contributor
        this.openingDialog = true
        // Open the dialog - it will take focus from drop-up
        const dialog = new ContributorDialog(
            this.parentNode,
            this.view,
            this.selection.node.attrs
        )
        dialog.init()
    }

    /**
     * Close the drop-up by deselecting the contributor
     */
    closeDropUp() {
        // Set a text selection to deselect the contributor, which will remove the drop-up
        const tr = this.view.state.tr.setSelection(
            this.view.state.selection.constructor.near(
                this.view.state.doc.resolve(this.selection.from)
            )
        )
        this.view.dispatch(tr)
        this.view.focus()
    }

    /**
     * Get the DOM element for the drop-up
     * @returns {HTMLElement} The drop-up DOM element
     */
    getDOM() {
        return this.dropUp
    }
}

/**
 * Create a contributor drop-up menu
 * @param {Object} selection - ProseMirror selection object
 * @param {Object} view - ProseMirror editor view
 * @param {Array<MenuOption>} [menuOptions] - Optional custom menu options
 * @returns {HTMLElement} The drop-up DOM element
 */
export const createDropUp = (selection, view, menuOptions = null) => {
    const dropUp = new ContributorDropUp(selection, view, menuOptions)
    return dropUp.getDOM()
}
