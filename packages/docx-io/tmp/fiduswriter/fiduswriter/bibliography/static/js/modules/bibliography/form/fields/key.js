import {getFocusIndex, noSpaceTmp, setFocusIndex} from "../../../common"
import {BibOptionTitles} from "../strings"
import {LiteralFieldForm} from "./literal"

export class KeyFieldForm {
    constructor(dom, initialValue, _unused, fieldType = undefined) {
        this.currentValue = {}
        this.dom = dom
        this.fieldType = fieldType
        // We set the mode based on the type of value
        if (typeof initialValue === "object") {
            this.predefined = false
            this.currentValue["custom"] = initialValue
        } else {
            this.predefined = true
            this.currentValue["predefined"] = initialValue
        }
    }

    init() {
        this.prepareWrapper()
        this.drawForm()
    }

    prepareWrapper() {
        this.dom.innerHTML = noSpaceTmp`
                <div class="type-switch-input-wrapper">
                    <button class="type-switch">
                        <span class="type-switch-inner">
                            <span class="type-switch-label">${gettext("From list")}</span>
                            <span class="type-switch-label">${gettext("Custom")}</span>
                        </span>
                    </button>
                    <div class="type-switch-input-inner"></div>
                </div>
            `

        this.switcher = this.dom.querySelector(".type-switch")
        this.inner = this.dom.querySelector(".type-switch-input-inner")

        if (this.fieldType.strict) {
            this.switcher.classList.add("disabled")
        } else {
            this.switcher.addEventListener("click", () => this.switchMode())
        }
    }

    switchMode() {
        const formValue = this.value
        if (formValue) {
            if (this.predefined) {
                this.currentValue["predefined"] = formValue
            } else {
                this.currentValue["custom"] = formValue
            }
        }
        this.predefined = !this.predefined
        this.drawForm(true)
    }

    drawForm(redraw = false) {
        const focusIndex = redraw ? getFocusIndex() : -1
        if (this.predefined) {
            this.drawSelectionListForm()
        } else {
            this.drawCustomInputForm()
        }
        setFocusIndex(focusIndex)
    }

    drawSelectionListForm() {
        this.switcher.classList.add("value1")
        this.switcher.classList.remove("value2")

        this.inner.innerHTML = noSpaceTmp`
                <select class='key-selection'><option value=''></option></select>
                <div class="fw-select-arrow fa fa-caret-down"></div>
            `
        const selectEl = this.dom.querySelector(".key-selection")
        if (Array.isArray(this.fieldType.options)) {
            this.fieldType.options.forEach(option => {
                selectEl.insertAdjacentHTML(
                    "beforeend",
                    `<option value="${option}">${BibOptionTitles[option]}</option>`
                )
            })
        } else {
            Object.keys(this.fieldType.options).forEach(option => {
                selectEl.insertAdjacentHTML(
                    "beforeend",
                    `<option value="${option}">${BibOptionTitles[option]}</option>`
                )
            })
        }

        if (this.currentValue["predefined"]) {
            selectEl.value = this.currentValue["predefined"]
        }
    }

    drawCustomInputForm() {
        this.switcher.classList.remove("value1")
        this.switcher.classList.add("value2")

        this.fields = {}
        this.inner.innerHTML = noSpaceTmp`<div class='custom-input field-part field-part-single'></div>`
        this.fields["custom"] = new LiteralFieldForm(
            this.dom.querySelector(".custom-input"),
            this.currentValue["custom"]
        )
        this.fields.custom.init()
    }

    get value() {
        if (this.predefined) {
            const selectEl = this.dom.querySelector(".key-selection")
            const selectionValue =
                selectEl.options[selectEl.selectedIndex].value
            if (selectionValue === "") {
                return false
            } else {
                return selectionValue
            }
        } else {
            if (!this.fields.custom.value) {
                return false
            }
            return this.fields.custom.value
        }
    }

    check() {
        return true
    }
}
