import {edtfParse} from "biblatex-csl-converter"

export class DateFieldForm {
    constructor(dom, initialValue = "", placeHolder = "") {
        this.dom = dom
        this.initialValue = initialValue
        this.placeHolder = placeHolder
    }

    init() {
        this.dom.innerHTML = `<input class="date" type="text" value="${this.initialValue}" placeholder="${this.placeHolder}">`
    }

    get value() {
        const formValue = this.dom.querySelector("input.date").value
        // If the form has not been filled out, don't consider this form
        return formValue.length > 0 ? formValue : false
    }

    check() {
        const formValue = this.value
        if (formValue) {
            const checkValue = edtfParse(formValue).valid
            if (!checkValue) {
                this.dom.classList.add("fw-fomt-error")
                return false
            }
        }
        return true
    }
}
