import TokenField from "tokenfield"

export class TagListForm {
    constructor(dom, initialValue = []) {
        this.dom = dom
        this.initialValue = initialValue
    }

    init() {
        this.dom.innerHTML = '<input class="tags" type="text">'
        this.tokenInput = new TokenField({
            el: this.dom.querySelector(".tags"),
            setItems: this.initialValue.map((key, index) => {
                return {id: index, name: key}
            }),
            keys: {
                188: "delimiter"
            }
        })
    }

    get value() {
        const formValue = this.tokenInput.getItems().map(item => {
            return item.name
        })
        // If the form has not been filled out, don't consider this form
        return formValue.length > 0 ? formValue : false
    }

    check() {
        return true
    }
}
