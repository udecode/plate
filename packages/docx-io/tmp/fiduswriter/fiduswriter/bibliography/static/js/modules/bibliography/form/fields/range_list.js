import {
    getFocusIndex,
    isActivationEvent,
    noSpaceTmp,
    setFocusIndex
} from "../../../common"
import {RangeFieldForm} from "./range"

export class RangeListForm {
    constructor(dom, initialValue = [[]]) {
        this.currentValue = initialValue
        this.dom = dom
    }

    init() {
        this.drawForm()
    }

    drawForm() {
        this.fields = []
        this.dom.innerHTML =
            '<table class="input-list-wrapper"><tbody></tbody></table>'
        this.currentValue.forEach((fieldValue, index) => {
            this.addField(fieldValue, index)
        })
    }

    addField(fieldValue, index) {
        this.dom.firstChild.firstChild.insertAdjacentHTML(
            "beforeend",
            noSpaceTmp`
            <tr>
                <td></td>
                <td class="input-field-list-ctrl">
                    <span class="fa fa-minus-circle" tabindex="0"></span>&nbsp;
                    <span class="fa fa-plus-circle" tabindex="0"></span>
                </td>
            </tr>`
        )
        const fieldDOM = this.dom.firstChild.firstChild.lastChild
        const fieldHandler = new RangeFieldForm(fieldDOM.firstChild, fieldValue)
        fieldHandler.init()
        this.fields.push(fieldHandler)

        // click on plus
        const addItemEl = fieldDOM.querySelector(".fa-plus-circle")
        addItemEl.addEventListener("click", event =>
            this.handlePlus(event, index)
        )
        addItemEl.addEventListener("keydown", event =>
            this.handlePlus(event, index)
        )

        // Click on minus
        const removeItemEl = fieldDOM.querySelector(".fa-minus-circle")
        removeItemEl.addEventListener("click", event =>
            this.handleMinus(event, index)
        )
        removeItemEl.addEventListener("keydown", event =>
            this.handleMinus(event, index)
        )
    }

    handlePlus(event, index) {
        if (!isActivationEvent(event)) {
            return
        }
        if (!this.value) {
            return
        }
        this.currentValue = this.value
        this.currentValue.splice(index + 1, 0, [])
        const focusIndex = getFocusIndex()
        this.drawForm()
        setFocusIndex(focusIndex + 1)
    }

    handleMinus(event, index) {
        if (!isActivationEvent(event)) {
            return
        }
        if (!this.value) {
            return
        }
        this.currentValue = this.value
        this.currentValue.splice(index, 1)
        if (this.currentValue.length === 0) {
            this.currentValue = [[]]
        }
        const focusIndex = getFocusIndex()
        this.drawForm()
        setFocusIndex(focusIndex - 1)
    }

    get value() {
        const formValue = this.fields
            .map(field => {
                return field.value
            })
            .filter(value => {
                return value !== false
            })
        if (formValue.length === 0) {
            return false
        }
        return formValue
    }

    check() {
        return true
    }
}
