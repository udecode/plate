import {getFocusIndex, noSpaceTmp, setFocusIndex} from "../../../common"
import {LiteralFieldForm} from "./literal"

// There are only range lists, no range fields in the data format. The separation
// between RangeFieldForm and RangeListForm is for keeping consistency with other fields
// and lists.

export class RangeFieldForm {
    constructor(dom, initialValue = [[]]) {
        this.currentValue = initialValue
        this.dom = dom
        // We set the mode based on whether there is one or two initial values.
        if (initialValue.length > 1) {
            this.range = true
        } else {
            this.range = false
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
                            <span class="type-switch-label">${gettext("Single value")}</span>
                            <span class="type-switch-label">${gettext("Range")}</span>
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
        this.range = !this.range
        this.drawForm(true)
    }

    drawForm(redraw = false) {
        const focusIndex = redraw ? getFocusIndex() : -1
        if (this.range) {
            this.drawRangeForm()
        } else {
            this.drawSingleValueForm()
        }
        setFocusIndex(focusIndex)
    }

    drawSingleValueForm() {
        this.switcher.classList.add("value1")
        this.switcher.classList.remove("value2")

        this.fields = {}
        this.inner.innerHTML = noSpaceTmp`<div class='single-value field-part field-part-single'></div>`
        this.fields["single"] = new LiteralFieldForm(
            this.dom.querySelector(".single-value"),
            this.currentValue[0]
        )
        this.fields.single.init()
    }

    drawRangeForm() {
        this.switcher.classList.remove("value1")
        this.switcher.classList.add("value2")

        this.fields = {}
        this.inner.innerHTML = noSpaceTmp`
                <div class='range-from field-part field-part-huge'></div>
                <div class='range-to field-part field-part-huge'></div>
            `
        this.fields["from"] = new LiteralFieldForm(
            this.dom.querySelector(".range-from"),
            this.currentValue[0],
            gettext("From")
        )
        this.fields.from.init()
        this.fields["to"] = new LiteralFieldForm(
            this.dom.querySelector(".range-to"),
            this.currentValue[1],
            gettext("To")
        )
        this.fields.to.init()
    }

    get value() {
        if (this.range) {
            if (!this.fields.from.value && !this.fields.to.value) {
                return false
            }
            return [
                this.fields.from.value
                    ? this.fields.from.value
                    : [{type: "text", text: ""}],
                this.fields.to.value
                    ? this.fields.to.value
                    : [{type: "text", text: ""}]
            ]
        } else {
            if (!this.fields.single.value) {
                return false
            }
            return [this.fields.single.value]
        }
    }

    check() {
        return true
    }
}
