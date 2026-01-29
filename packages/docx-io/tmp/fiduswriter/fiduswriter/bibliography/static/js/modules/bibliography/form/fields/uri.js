// Simple regex to check for a basic URL structure
const simpleUrlRegex = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i

function isValidUrl(string) {
    if (simpleUrlRegex.test(string)) {
        try {
            new URL(string)
            return true
        } catch (_e) {
            return false
        }
    }
    return false
}

export class URIFieldForm {
    constructor(dom, initialValue = "", placeHolder = "") {
        this.dom = dom
        this.initialValue = initialValue
        this.placeHolder = placeHolder
    }

    init() {
        this.dom.innerHTML = `<input class="uri" type="text" value="${this.initialValue}" placeholder="${this.placeHolder}">`
    }

    get value() {
        const formValue = this.dom.querySelector("input.uri").value
        // If the form has not been filled out, don't consider this form
        return formValue.length > 0 ? formValue : false
    }

    check() {
        const formValue = this.value
        if (formValue) {
            if (!isValidUrl(formValue)) {
                this.dom.classList.add("fw-fomt-error")
                return false
            }
        }
        return true
    }
}
