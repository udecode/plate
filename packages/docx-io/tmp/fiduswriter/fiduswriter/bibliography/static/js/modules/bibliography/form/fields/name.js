import {getFocusIndex, noSpaceTmp, setFocusIndex} from "../../../common"
import {LiteralFieldForm} from "./literal"

// There are only name lists, no name fields in the data format. The separation
// between NameFieldForm and NameListForm is for keeping consistency with other fields
// and lists.

export class NameFieldForm {
    constructor(
        dom,
        initialValue = {
            given: [],
            family: [],
            prefix: [],
            suffix: [],
            useprefix: false,
            literal: []
        }
    ) {
        this.currentValue = initialValue
        this.dom = dom
        // We set the mode based on whether there was a literal name.
        if (initialValue.literal) {
            this.realPerson = false
        } else {
            this.realPerson = true
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
                            <span class="type-switch-label">${gettext("Person")}</span>
                            <span class="type-switch-label">${gettext("Organization")}</span>
                        </span>
                    </button>
                    <div class="type-switch-input-inner"></div>
                </div>
            `

        this.switcher = this.dom.querySelector(".type-switch")
        this.inner = this.dom.querySelector(".type-switch-input-inner")

        this.switcher.addEventListener("click", () => this.switchMode())
    }

    switchMode() {
        const formValue = this.value
        if (formValue) {
            Object.assign(this.currentValue, formValue)
        }
        this.realPerson = !this.realPerson
        this.drawForm(true)
    }

    drawForm(redraw = false) {
        const focusIndex = redraw ? getFocusIndex() : -1
        if (this.realPerson) {
            this.drawPersonForm()
        } else {
            this.drawOrganizationForm()
        }
        setFocusIndex(focusIndex)
    }

    drawPersonForm() {
        this.switcher.classList.add("value1")
        this.switcher.classList.remove("value2")

        this.fields = {}
        this.inner.innerHTML = noSpaceTmp`
                <div class='given field-part field-part-long'></div>
                <div class='prefix field-part field-part-short'></div>
                <div class='family field-part field-part-long'></div>
                <div class='suffix field-part field-part-short'></div>
                <div class='useprefix field-part'>
                    <input type='checkbox' class='useprefix'
                        ${this.currentValue.useprefix ? "checked" : ""}>
                    &nbsp;${gettext("Prefix used")}
                </div>
            `
        this.fields["given"] = new LiteralFieldForm(
            this.dom.querySelector(".given"),
            this.currentValue.given,
            gettext("First name")
        )
        this.fields.given.init()
        this.fields["prefix"] = new LiteralFieldForm(
            this.dom.querySelector(".prefix"),
            this.currentValue.prefix,
            gettext("Prefix")
        )
        this.fields.prefix.init()
        this.fields["family"] = new LiteralFieldForm(
            this.dom.querySelector(".family"),
            this.currentValue.family,
            gettext("Last name")
        )
        this.fields.family.init()
        this.fields["suffix"] = new LiteralFieldForm(
            this.dom.querySelector(".suffix"),
            this.currentValue.suffix,
            gettext("Suffix")
        )
        this.fields.suffix.init()
    }

    drawOrganizationForm() {
        this.switcher.classList.add("value2")
        this.switcher.classList.remove("value1")

        this.fields = {}
        this.inner.innerHTML = noSpaceTmp`<div class='literal-text field-part field-part-single'></div>`
        this.fields["literal"] = new LiteralFieldForm(
            this.dom.querySelector(".literal-text"),
            this.currentValue.literal,
            gettext("Organization name")
        )
        this.fields.literal.init()
    }

    get value() {
        if (this.realPerson) {
            if (
                !this.fields.family.value &&
                !this.fields.given.value &&
                !this.fields.prefix.value &&
                !this.fields.suffix.value
            ) {
                return false
            }
            const returnObject = {
                family: this.fields.family.value
                    ? this.fields.family.value
                    : [],
                given: this.fields.given.value ? this.fields.given.value : []
            }
            if (this.fields.prefix.value) {
                returnObject["prefix"] = this.fields.prefix.value
                returnObject["useprefix"] = this.dom.querySelector(
                    "input.useprefix"
                ).checked
                    ? true
                    : false
            }
            if (this.fields.suffix.value) {
                returnObject["suffix"] = this.fields.suffix.value
            }
            return returnObject
        } else {
            if (!this.fields.literal.value) {
                return false
            }
            return {
                literal: this.fields.literal.value
            }
        }
    }

    check() {
        return true
    }
}
