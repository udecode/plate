import deepEqual from "fast-deep-equal"

import {ContentMenu, Dialog, dropdownSelect} from "../../common"
import {ImageSelectionDialog} from "../../images/selection_dialog"
import {randomFigureId} from "../../schema/common"
import {configureFigureTemplate} from "./templates"

export class FigureDialog {
    constructor(editor) {
        this.editor = editor
        this.imageDB = this.editor.mod.db.imageDB
        this.userImageDB = this.editor.app.imageDB
        this.imgId = false
        this.imgDb = false
        this.copyright = false
        this.insideFigure = false
        this.figureNode = false
        this.contentNode = false
        this.caption = true
        this.category = "none"
        this.aligned = "center"
        this.width = "50"
        this.equation = ""
        this.node = false
        this.submitMessage = gettext("Insert")
        this.dialog = false
    }

    layoutMathEditor() {
        this.dialog.dialogEl.querySelector(".inner-figure-preview").innerHTML =
            `<div><span class="math-field" type="text" name="math" ></span></div>
            <p class="formula-or-figure">${gettext("or")}</p>
            <p><button type="button" id="insert-figure-image" class="fw-button fw-light">
                ${gettext("Insert image")} <i class="fa fa-image"></i>
            </button></p>`

        this.mathliveDOM = this.dialog.dialogEl.querySelector(".math-field")
        this.nonMathElements = [
            this.dialog.dialogEl.querySelector("#insert-figure-image"),
            this.dialog.dialogEl.querySelector(".formula-or-figure")
        ]
        import("mathlive").then(MathLive => {
            MathLive.MathfieldElement.strings = {
                int: {
                    "keyboard.tooltip.functions": gettext("Functions"),
                    "keyboard.tooltip.greek": gettext("Greek Letters"),
                    "keyboard.tooltip.command": gettext("LaTeX Command Mode"),
                    "keyboard.tooltip.numeric": gettext("Numeric"),
                    "keyboard.tooltip.roman": gettext(
                        "Symbols and Roman Letters"
                    ),
                    "tooltip.copy to clipboard": gettext("Copy to Clipboard"),
                    "tooltip.redo": gettext("Redo"),
                    "tooltip.toggle virtual keyboard": gettext(
                        "Toggle Virtual Keyboard"
                    ),
                    "tooltip.undo": gettext("Undo")
                }
            }
            MathLive.MathfieldElement.locale = "int"
            MathLive.MathfieldElement.plonkSound = null
            MathLive.MathfieldElement.keypressSound = null
            this.mathField = new MathLive.MathfieldElement({
                mathVirtualKeyboardPolicy: "manual"
            })
            this.mathField.value = this.equation
            this.mathliveDOM.appendChild(this.mathField)

            this.mathField.addEventListener("focusout", () =>
                this.showPlaceHolder()
            )
            this.mathField.addEventListener("focus", () =>
                this.hidePlaceHolder()
            )
            this.mathField.addEventListener("input", () => {
                this.equation = this.mathField.getValue()
                this.showHideNonMathElements()
            })
            this.mathField.select()
            this.mathField.value = this.equation

            this.showHideNonMathElements()
            this.dialog.dialogEl
                .querySelector("#insert-figure-image")
                .addEventListener("click", () => this.selectImage())
        })
    }

    showPlaceHolder() {
        if (
            !this.mathField.getValue().length &&
            !this.mathliveDOM.querySelector(".placeholder")
        ) {
            this.mathliveDOM.insertAdjacentHTML(
                "beforeend",
                `<span class="placeholder" >${gettext("Type formula")}</span>`
            )
        }
    }

    hidePlaceHolder() {
        const placeHolder = this.mathliveDOM.querySelector(".placeholder")
        if (placeHolder) {
            this.mathliveDOM.removeChild(placeHolder)
        }
    }

    showHideNonMathElements() {
        if (this.equation.length) {
            this.nonMathElements.forEach(el => (el.style.display = "none"))
        } else {
            this.nonMathElements.forEach(el => (el.style.display = ""))
        }
    }

    selectImage() {
        const imageSelection = new ImageSelectionDialog(
            this.imageDB,
            this.userImageDB,
            this.imgId,
            this.editor
        )
        imageSelection.init().then(({id, db}) => {
            if (id) {
                this.imgId = id
                this.imgDb = db
                // We take a copy of the object in case of the image coming from the user db in order
                // not to overwrite the copyright info from the user's image db.
                this.copyright =
                    db === "document"
                        ? this.imageDB.db[this.imgId].copyright
                        : JSON.parse(
                              JSON.stringify(
                                  this.userImageDB.db[this.imgId].copyright
                              )
                          )
                this.layoutImagePreview()
            } else {
                this.imgId = false
                this.imgDb = false
                this.layoutMathEditor()
            }
        })
    }

    layoutImagePreview() {
        if (this.imgId) {
            if (this.mathField) {
                this.mathField = false
            }
            const db =
                this.imgDb === "document"
                    ? this.imageDB.db
                    : this.userImageDB.db

            this.dialog.dialogEl.querySelector(
                ".inner-figure-preview"
            ).innerHTML = `<img src="${db[this.imgId].image}" style="max-width: 400px;max-height:220px">
                <span class="dot-menu-icon"><i class="fa fa-ellipsis-v"></i></span>`

            this.dialog.dialogEl
                .querySelector(".dot-menu-icon")
                .addEventListener("click", event => {
                    const contentMenu = new ContentMenu({
                        menu: this.editor.menu.imageMenuModel,
                        page: this,
                        menuPos: {X: event.pageX, Y: event.pageY}
                    })
                    contentMenu.open()
                })
        }
    }

    submitForm() {
        if (new RegExp(/^\s*$/).test(this.equation) && !this.imgId) {
            // The math input is empty. Delete a math node if it exist. Then close the dialog.
            if (this.insideFigure) {
                const tr = this.editor.currentView.state.tr.deleteSelection()
                this.editor.currentView.dispatch(tr)
            }
            this.dialog.close()
            return false
        }

        if (this.imgDb === "user") {
            // Add image to document db.
            const imageEntry = JSON.parse(
                JSON.stringify(this.userImageDB.db[this.imgId])
            )
            imageEntry.copyright = this.copyright
            this.imageDB.setImage(this.imgId, imageEntry)
            this.imgDb = "document"
        } else if (
            this.imgId &&
            this.imageDB.db[this.imgId] &&
            !deepEqual(this.copyright, this.imageDB.db[this.imgId].copyright)
        ) {
            const imageEntry = JSON.parse(
                JSON.stringify(this.imageDB.db[this.imgId])
            )
            imageEntry.copyright = this.copyright
            this.imageDB.setImage(this.imgId, imageEntry)
        }

        if (
            this.insideFigure &&
            this.equation ===
                (this.node.content.content.find(
                    node => node.type.name === "figure_equation"
                )?.attrs.equation || "") &&
            this.imgId ===
                (this.node.content.content.find(
                    node => node.type.name === "image"
                )?.attrs.image || false) &&
            this.imgDb === "document" &&
            this.caption === this.node.attrs.caption &&
            this.category === this.node.attrs.category &&
            this.aligned === this.node.attrs.aligned &&
            this.width === this.node.attrs.width
        ) {
            // The figure has not been changed, just close the dialog
            this.dialog.close()
            return false
        }
        const content = []
        if (this.imgId) {
            content.push(
                this.editor.currentView.state.schema.nodes["image"].create({
                    image: this.imgId
                })
            )
        } else {
            content.push(
                this.editor.currentView.state.schema.nodes[
                    "figure_equation"
                ].create({
                    equation: this.equation
                })
            )
        }
        const captionNode =
            this.node.content?.content.find(
                node => node.type.name === "figure_caption"
            ) ||
            this.editor.currentView.state.schema.nodes[
                "figure_caption"
            ].create()
        if (this.category === "table") {
            content.unshift(captionNode)
        } else {
            content.push(captionNode)
        }
        const tr = this.editor.currentView.state.tr.replaceSelectionWith(
            this.editor.currentView.state.schema.nodes["figure"].createAndFill(
                {
                    aligned: this.aligned,
                    width: this.width,
                    category: this.category,
                    caption: this.caption,
                    id: this.insideFigure
                        ? this.node.attrs.id
                        : randomFigureId()
                },
                content
            ),
            false
        )
        this.editor.currentView.dispatch(tr)

        this.dialog.close()
    }

    findFigure(state) {
        if (
            state.selection.node &&
            state.selection.node.type.name == "figure"
        ) {
            return state.selection.node
        }
        const $head = state.selection.$head
        for (let d = $head.depth; d > 0; d--) {
            if ($head.node(d).type.name == "figure") {
                return $head.node(d)
            }
        }
        return false
    }

    init() {
        this.node = this.findFigure(this.editor.currentView.state)

        if (this.node?.attrs?.track?.find(track => track.type === "deletion")) {
            // The figure is marked as deleted so we don't allow editing it.
            return true
        }

        const buttons = []

        if (this.node?.type && this.node?.type.name === "figure") {
            this.insideFigure = true
            this.submitMessage = gettext("Update")
            this.equation =
                this.node.content.content.find(
                    node => node.type.name === "figure_equation"
                )?.attrs.equation || ""
            this.imgId =
                this.node.content.content.find(
                    node => node.type.name === "image"
                )?.attrs.image || false
            this.imgDb = "document"
            this.category = this.node.attrs.category
            this.caption = this.node.attrs.caption
            this.aligned = this.node.attrs.aligned
            this.width = this.node.attrs.width
            buttons.push({
                text: gettext("Remove"),
                classes: "fw-orange",
                click: () => {
                    const tr =
                        this.editor.currentView.state.tr.deleteSelection()
                    this.editor.currentView.dispatch(tr)
                    this.dialog.close()
                }
            })
        }
        // Image positioning both at the time of updating and inserting for the first time
        buttons.push({
            // Update
            text: this.submitMessage,
            classes: "fw-dark",
            click: () => this.submitForm()
        })

        buttons.push({
            type: "cancel"
        })

        this.dialog = new Dialog({
            id: "figure-dialog",
            title: gettext("Enter latex math or insert an image"),
            body: configureFigureTemplate({
                language: this.editor.view.state.doc.attrs.language
            }),
            buttons,
            beforeClose: () => {
                if (this.mathField) {
                    this.mathField = false
                }
                if (window.mathVirtualKeyboard) {
                    window.mathVirtualKeyboard.hide()
                }
            },
            onClose: () => this.editor.currentView.focus(),
            restoreActiveElement: false
        })

        this.dialog.open()

        const alignmentSelector = dropdownSelect(
            this.dialog.dialogEl.querySelector(".figure-alignment"),
            {
                onChange: newValue => {
                    this.aligned = newValue
                },
                width: "80%",
                value: this.aligned
            }
        )

        if (this.width === "100") {
            alignmentSelector.setValue("center")
            alignmentSelector.disable()
            this.aligned = "center"
        }

        const figureWidthDOM =
            this.dialog.dialogEl.querySelector(".figure-width")
        figureWidthDOM.style.width = "80%"
        figureWidthDOM.firstElementChild.innerText = `${this.width} %`
        figureWidthDOM.addEventListener("click", event => {
            const contentMenu = new ContentMenu({
                menu: this.editor.menu.figureWidthMenuModel,
                page: this,
                menuPos: {X: event.pageX, Y: event.pageY},
                onClose: () => {
                    if (this.width == "100") {
                        alignmentSelector.setValue("center")
                        alignmentSelector.disable()
                        this.aligned = "center"
                    } else {
                        alignmentSelector.enable()
                    }
                }
            })
            contentMenu.open()
        })

        dropdownSelect(this.dialog.dialogEl.querySelector(".figure-category"), {
            onChange: newValue => {
                this.category = newValue
            },
            width: "80%",
            value: this.category
        })

        dropdownSelect(this.dialog.dialogEl.querySelector(".figure-caption"), {
            onChange: newValue => {
                this.caption = newValue === "true"
            },
            width: "80%",
            value: String(this.caption)
        })

        if (this.imgId && this.imageDB.db[this.imgId]) {
            this.copyright = this.imageDB.db[this.imgId].copyright
            this.layoutImagePreview()
        } else {
            this.layoutMathEditor()
        }
    }
}
