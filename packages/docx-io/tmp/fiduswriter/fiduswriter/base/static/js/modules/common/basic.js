import {keyName} from "w3c-keyname"

import {ContentMenu} from "./content_menu"
import {Dialog} from "./dialog"
import {isActivationEvent} from "./events"

/** Creates a styled select with a contentmenu from a select tag.
 * @param select The select-tag which is to be replaced.
 * @param options
 */

export const dropdownSelect = (
    selectDOM,
    {onChange = _newValue => {}, width = false, value = false, button = false}
) => {
    if (!selectDOM.parentElement) {
        return
    }
    let buttonDOM
    if (button) {
        buttonDOM = button
        selectDOM.parentElement.removeChild(selectDOM) // Remove the <select> from the main dom.
    } else {
        buttonDOM = document.createElement("div")
        buttonDOM.innerHTML =
            '<label></label>&nbsp;<span class="fa fa-caret-down"></span>'
        buttonDOM.classList.add(
            "fw-button",
            "fw-light",
            "fw-large",
            "fw-dropdown"
        )
        if (width) {
            buttonDOM.style.width = Number.isInteger(width)
                ? `${width}px`
                : width
        }
        selectDOM.classList.forEach(className =>
            buttonDOM.classList.add(className)
        )
        if (selectDOM.id) {
            buttonDOM.id = selectDOM.id
        }
        selectDOM.parentElement.replaceChild(buttonDOM, selectDOM) // Remove the <select> from the main dom.
    }

    buttonDOM.setAttribute("role", "button")
    buttonDOM.setAttribute("tabindex", "0")
    buttonDOM.setAttribute("aria-haspopup", "true")
    buttonDOM.setAttribute("aria-expanded", "false")

    const options = Array.from(selectDOM.children)
    if (!options.length) {
        // There are no options, so we only create the button.
        return {
            setValue: () => {},
            getValue: () => false
        }
    }
    let selected
    const menu = {
        content: options.map((option, order) => {
            if (option.selected || option.value === value) {
                selected = option
            }
            return {
                title: option.innerHTML,
                type: "action",
                tooltip: option.title || "",
                order,
                action: () => {
                    if (!button) {
                        buttonDOM.firstElementChild.innerText = option.innerText
                    }
                    value = option.value || option.dataset.value
                    onChange(value)
                    menu.content.forEach(item => (item.selected = false))
                    menu.content[order].selected = true
                    return false
                },
                selected: !!(option.selected || option.dataset.selected)
            }
        })
    }
    if (!selected && !button) {
        selected = selectDOM.firstElementChild
        menu.content[0].selected = true
    }

    if (!button) {
        buttonDOM.firstElementChild.innerText = selected.innerText
    }

    value = selected ? selected.value : false

    const openMenu = event => {
        if (!isActivationEvent(event)) {
            return
        }

        event.preventDefault()
        event.stopPropagation()
        if (buttonDOM.classList.contains("disabled")) {
            return
        }
        // Determine menu position
        let menuPos
        if (event.type === "click") {
            menuPos = {X: event.pageX, Y: event.pageY}
        } else {
            // Keyboard event
            const rect = buttonDOM.getBoundingClientRect()
            menuPos = {
                X: rect.left + window.pageXOffset,
                Y: rect.top + window.pageYOffset + rect.height
            }
        }

        buttonDOM.setAttribute("aria-expanded", "true")
        const contentMenu = new ContentMenu({
            menu,
            menuPos,
            onClose: () => buttonDOM.setAttribute("aria-expanded", "false")
        })
        contentMenu.open()
    }

    buttonDOM.addEventListener("click", openMenu)
    buttonDOM.addEventListener("keydown", openMenu)

    return {
        setValue: newValue => {
            const optionIndex = options.findIndex(
                option => option.value === newValue
            )
            if (optionIndex === undefined) {
                return
            }
            menu.content.forEach(item => (item.selected = false))
            menu.content[optionIndex].selected = true
            const option = options[optionIndex]
            if (!button) {
                buttonDOM.firstElementChild.innerText = option.innerText
            }
            value = newValue
        },
        getValue: () => value,
        enable: () => buttonDOM.classList.remove("disabled"),
        disable: () => buttonDOM.classList.add("disabled")
    }
}

/** Checks or unchecks a checkable label. This is used for example for bibliography categories when editing bibliography items.
 * @param label The node who's parent has to be checked or unchecked.
 */
export const setCheckableLabel = labelEl => {
    if (labelEl.classList.contains("checked")) {
        labelEl.classList.remove("checked")
    } else {
        labelEl.classList.add("checked")
    }
}

let messageWaiter = false
let waitMessage = ""
/** Cover the page signaling to the user to wait.
 */
export const activateWait = (full = false, message = "") => {
    const waitEl = document.getElementById("wait")
    if (message) {
        let messageEl = waitEl.querySelector("span.message")
        if (messageEl) {
            // Another message is already showing. We update directly.
            messageEl.innerText = message
        } else {
            waitMessage = message // We update the message if there is one waiting already
            if (!messageWaiter) {
                messageWaiter = setTimeout(() => {
                    messageEl = document.createElement("span")
                    messageEl.classList.add("message")
                    messageEl.innerText = waitMessage
                    waitEl.appendChild(messageEl)
                    messageWaiter = false
                }, 2000)
            }
        }
    }
    if (waitEl) {
        waitEl.classList.add("active")
        if (full) {
            waitEl.classList.add("full")
        }
    }
}

/** Remove the wait cover.
 */
export const deactivateWait = () => {
    const waitEl = document.getElementById("wait")
    if (waitEl) {
        waitEl.classList.remove("active")
        waitEl.classList.remove("full")
    }
    const messageEl = waitEl.querySelector("span.message")
    if (messageEl) {
        messageEl.parentElement.removeChild(messageEl)
    }
    if (messageWaiter) {
        clearTimeout(messageWaiter)
        messageWaiter = false
    }
}

/** Show a message to the user.
 * @param alertType The type of message that is shown (error, warning, info or success).
 * @param alertMsg The message text.
 */
export const addAlert = (alertType, alertMsg) => {
    if (!document.body) {
        return
    }
    const iconNames = {
        error: "exclamation-circle",
        warning: "exclamation-circle",
        info: "info-circle",
        success: "check-circle"
    }
    if (!document.getElementById("#alerts-outer-wrapper")) {
        document.body.insertAdjacentHTML(
            "beforeend",
            '<div id="alerts-outer-wrapper"><ul id="alerts-wrapper"></ul></div>'
        )
    }
    const alertsWrapper = document.getElementById("alerts-wrapper")
    alertsWrapper.insertAdjacentHTML(
        "beforeend",
        `<li class="alerts-${alertType} fa-before fa-${iconNames[alertType]}">${alertMsg}</li>`
    )
    const alertBox = alertsWrapper.lastElementChild
    setTimeout(() => {
        alertBox.classList.add("visible")
        setTimeout(() => {
            alertBox.classList.remove("visible")
            setTimeout(() => alertsWrapper.removeChild(alertBox), 2000)
        }, 4000)
    }, 1)
}

// Used for system mesages
export const showSystemMessage = (message, buttons = [{type: "close"}]) => {
    const dialog = new Dialog({
        title: gettext("System message"),
        body: `<p>${escapeText(message)}</p>`,
        buttons
    })
    dialog.open()
    return dialog
}

/** Turn milliseconds since epoch (UTC) into a local date string.
 * @param {number} milliseconds Number of milliseconds since epoch (1/1/1970 midnight, UTC).
 * @param {boolean} type 'full' for full date (default), 'sortable-date' for sortable date, 'minutes' for minute accuracy
 */
const CACHED_DATES = {
    "sortable-date": {},
    minutes: {},
    full: {}
}
export const localizeDate = (milliseconds, type = "full") => {
    if (milliseconds === 0) {
        return ""
    } else if (CACHED_DATES[type][milliseconds]) {
        return CACHED_DATES[type][milliseconds]
    }
    const theDate = new Date(milliseconds)
    let returnValue
    switch (type) {
        case "sortable-date": {
            const yyyy = theDate.getFullYear()
            const mm = theDate.getMonth() + 1
            const dd = theDate.getDate()
            returnValue = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`
            break
        }
        case "minutes":
            returnValue = theDate.toLocaleString([], {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            })
            break
        default:
            returnValue = theDate.toLocaleString()
    }
    if (Object.keys(CACHED_DATES[type]).length > 5000) {
        CACHED_DATES[type] = {}
    }
    CACHED_DATES[type][milliseconds] = returnValue
    return returnValue
}

/**
 * Turn string literals into single line, removing spaces at start of line
 */

export const noSpaceTmp = (strings, ...values) => {
    const tmpStrings = Array.from(strings)

    let combined = ""
    while (tmpStrings.length > 0 || values.length > 0) {
        if (tmpStrings.length > 0) {
            combined += tmpStrings.shift()
        }
        if (values.length > 0) {
            combined += values.shift()
        }
    }

    let out = ""
    combined.split("\n").forEach(line => {
        out += line.replace(/^\s*/g, "")
    })
    return out
}

export const escapeText = text => {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")

        .replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, "") // invalid in XML chars
}

export const unescapeText = text =>
    text
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, "&")
/**
 * Return a cancel promise if you need to cancel a promise chain. Import as
 * ES6 promises are not (yet) cancelable.
 */

export const cancelPromise = () => new Promise(() => {})

// Check if selector matches one of the ancestors of the event target.
// Used in switch statements of document event listeners.
export const findTarget = (event, selector, el = {}) => {
    el.target = event.target.closest(selector)
    if (el.target) {
        event.stopPropagation()
        return true
    }
    return false
}

// Promise when page has been loaded.
export const whenReady = () => {
    if (document.readyState === "complete") {
        return Promise.resolve()
    } else {
        return new Promise(resolve => {
            document.addEventListener("readystatechange", _event => {
                if (document.readyState === "complete") {
                    resolve()
                }
            })
        })
    }
}

export const setDocTitle = (title, app) => {
    const titleText = `${title} - ${app.name}`
    if (document.title !== titleText) {
        document.title = titleText
    }
}

const LANGUAGES = {
    bg: "Български",
    de: "Deutsch",
    en: "English",
    es: "Español",
    fr: "Français",
    it: "Italiano",
    "pt-br": "Português (Brazil)"
}

export const langName = code => {
    return LANGUAGES[code] || code
}
