export class VerbatimFieldForm {
    constructor(dom, initialValue = "", placeHolder = "") {
        this.dom = dom
        this.initialValue = initialValue
        this.placeHolder = placeHolder
    }

    init() {
        this.dom.innerHTML = `<input class="verbatim" type="text" value="${this.initialValue}" placeholder="${this.placeHolder}">`
    }

    get value() {
        const formValue = this.dom.querySelector("input.verbatim").value
        // If the form has not been filled out, don't consider this form
        return formValue.length > 0 ? formValue : false
    }

    check() {
        return true
    }
}
