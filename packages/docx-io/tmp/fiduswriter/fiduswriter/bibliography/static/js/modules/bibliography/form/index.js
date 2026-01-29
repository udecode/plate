import {BibFieldTypes, BibTypes} from "biblatex-csl-converter"
import {Dialog, addAlert, noSpaceTmp} from "../../common"
import {nameToText} from "../tools"
import {CatsForm} from "./cats"
import {DateFieldForm} from "./fields/date"
import {KeyFieldForm} from "./fields/key"
import {KeyListForm} from "./fields/key_list"
import {LiteralFieldForm} from "./fields/literal"
import {LiteralListForm} from "./fields/literal_list"
import {LiteralLongFieldForm} from "./fields/literal_long"
import {NameListForm} from "./fields/name_list"
import {RangeListForm} from "./fields/range_list"
import {TagListForm} from "./fields/tag_list"
import {TitleFieldForm} from "./fields/title"
import {URIFieldForm} from "./fields/uri"
import {VerbatimFieldForm} from "./fields/verbatim"
import {BibFieldHelp, BibFieldTitles, BibTypeTitles} from "./strings"
import {bibDialog} from "./templates"

const FIELD_FORMS = {
    f_date: DateFieldForm,
    f_integer: LiteralFieldForm,
    f_literal: LiteralFieldForm,
    l_literal: LiteralListForm,
    f_long_literal: LiteralLongFieldForm,
    f_key: KeyFieldForm,
    l_key: KeyListForm,
    l_name: NameListForm,
    l_range: RangeListForm,
    l_tag: TagListForm,
    f_title: TitleFieldForm,
    f_uri: URIFieldForm,
    f_verbatim: VerbatimFieldForm
}

export class BibEntryForm {
    constructor(bibDB, app = false, itemId = false) {
        this.bibDB = bibDB
        this.itemId = itemId
        this.app = app
        this.fields = {}
        this.currentValues = {}
    }

    init() {
        if (this.app && this.app.isOffline()) {
            // Diable the editing of main user bibliography , since Document bibliography is stored in Editor/Document.
            addAlert(
                "info",
                gettext(
                    "You are currently offline. Please try again when you are back online."
                )
            )
            return Promise.resolve()
        }
        if (this.itemId !== false) {
            this.dialogHeader = gettext("Edit Source")
            const bibEntry = this.bibDB.db[this.itemId]
            this.currentValues = JSON.parse(JSON.stringify(bibEntry)) // copy current values
        } else {
            this.dialogHeader = gettext("Register New Source")
            this.currentValues = {
                bib_type: false,
                cats: [],
                entry_key: "FidusWriter",
                fields: {}
            }
        }
        return this.createForm()
    }

    addDialogToDOM() {
        // Add form to DOM
        const buttons = [
            {
                type: "close"
            }
        ]

        return new Promise(resolve => {
            buttons.push({
                classes: "fw-dark",
                text: gettext("Submit"),
                click: () => {
                    if (this.check()) {
                        const returnValue = this.save()
                        this.dialog.close()
                        resolve(returnValue)
                    }
                }
            })

            this.dialog = new Dialog({
                title: this.dialogHeader,
                id: "bib-dialog",
                width: 940,
                body: bibDialog({
                    bib_type: this.currentValues.bib_type,
                    BibTypes,
                    BibTypeTitles
                }),
                buttons
            })

            this.dialog.open()

            // init ui tabs

            // Hide all but first tab
            this.dialog.dialogEl
                .querySelectorAll("#bib-dialog-tabs .tab-content")
                .forEach((el, index) => {
                    if (index) {
                        el.style.display = "none"
                    }
                })

            this.dialog.dialogEl
                .querySelector("#bib-dialog-tabs .tab-link")
                .classList.add("current-tab")

            // Handle tab link clicking
            this.dialog.dialogEl
                .querySelectorAll("#bib-dialog-tabs .tab-link a")
                .forEach(el =>
                    el.addEventListener("click", event => {
                        event.preventDefault()

                        el.parentNode.parentNode
                            .querySelectorAll(".tab-link.current-tab")
                            .forEach(el => el.classList.remove("current-tab"))
                        el.parentNode.classList.add("current-tab")

                        const link = el.getAttribute("href")
                        this.dialog.dialogEl
                            .querySelectorAll("#bib-dialog-tabs .tab-content")
                            .forEach(el => {
                                if (el.matches(link)) {
                                    el.style.display = ""
                                } else {
                                    el.style.display = "none"
                                }
                            })
                    })
                )

            document
                .getElementById("select-bibtype")
                .addEventListener("change", () => resolve(this.changeBibType()))
        })
    }

    addField(fieldName, dom) {
        const fieldType = BibFieldTypes[fieldName]
        let fieldTitle
        if (BibFieldHelp[fieldName]) {
            fieldTitle = noSpaceTmp`
                <h4 class="fw-tablerow-title wtooltip">
                    ${BibFieldTitles[fieldName]}
                    <span class="tooltip">${BibFieldHelp[fieldName]}</span>
                </h4>
            `
        } else {
            fieldTitle = noSpaceTmp`
                <h4 class="fw-tablerow-title">
                    ${BibFieldTitles[fieldName]}
                </h4>
            `
        }

        dom.insertAdjacentHTML(
            "beforeend",
            noSpaceTmp`
                <tr>
                    <th>${fieldTitle}</th>
                    <td class="entry-field ${fieldName}"></td>
                </tr>`
        )
        const fieldDOM = dom.lastChild.lastChild
        const FieldClass = FIELD_FORMS[fieldType.type]
        if (FieldClass) {
            const fieldHandler = new FieldClass(
                fieldDOM,
                this.currentValues.fields[fieldName],
                undefined,
                fieldType
            )
            fieldHandler.init()
            this.fields[fieldName] = fieldHandler
        }
    }

    createForm() {
        const dialogPromise = this.addDialogToDOM()
        if (this.currentValues.bib_type !== false) {
            const eitherOrFields = document.getElementById("eo-fields")
            BibTypes[this.currentValues.bib_type].eitheror.forEach(
                fieldName => {
                    this.addField(fieldName, eitherOrFields)
                }
            )
            const reqFields = document.getElementById("req-fields")
            BibTypes[this.currentValues.bib_type].required.forEach(
                fieldName => {
                    this.addField(fieldName, reqFields)
                }
            )
            const optFields = document.getElementById("opt-fields")
            BibTypes[this.currentValues.bib_type].optional.forEach(
                fieldName => {
                    this.addField(fieldName, optFields)
                }
            )
            const catsField = document.getElementById("categories-field")
            this.catsForm = new CatsForm(
                catsField,
                this.currentValues.cats,
                this.bibDB.cats
            )
            this.catsForm.init()

            if (!this.bibDB.cats.length) {
                // There are no ctaegories to select from, so remove the categories tab.
                document
                    .querySelectorAll("#categories-tab, #categories-link")
                    .forEach(el => el.parentElement.removeChild(el))
            }
        }
        return dialogPromise
    }

    changeBibType() {
        // Add all current values into temporary currentValues, in case the
        // user still wants them.
        const formValue = this.value
        Object.assign(this.currentValues.fields, formValue.fields)
        this.currentValues.cats = formValue.cats
        this.currentValues.bib_type = formValue.bib_type
        // Reset fields and close dialog.
        this.fields = {}
        this.dialog.close()
        return this.createForm()
    }

    createEntryKey(bibItem) {
        // We attempt to create a biblatex compatible entry key if there is no entry
        // key so far.
        let entryKey = ""
        if (bibItem.fields.author) {
            entryKey += nameToText(bibItem.fields.author).replace(
                /\s|,|=|;|:|{|}/g,
                ""
            )
        } else if (bibItem.fields.editor) {
            entryKey += nameToText(bibItem.fields.editor).replace(
                /\s|,|=|;|:|{|}/g,
                ""
            )
        }
        if (bibItem.fields.date) {
            entryKey += bibItem.fields.date
                .split("/")[0]
                .replace(/\?|\*|u|~|-/g, "")
        }
        if (entryKey.length) {
            bibItem.entry_key = entryKey
        }
    }

    get value() {
        const returnObj = {
            bib_type: document.querySelector("#select-bibtype").value,
            cats: this.catsForm ? this.catsForm.value : [],
            entry_key: this.currentValues.entry_key, // is never updated.
            fields: {}
        }
        Object.keys(this.fields).forEach(fieldName => {
            const fieldValue = this.fields[fieldName].value
            if (fieldValue !== false) {
                returnObj["fields"][fieldName] = fieldValue
            }
        })
        return returnObj
    }

    save() {
        const isNew = this.itemId === false ? true : false,
            itemId = this.itemId === false ? 0 : this.itemId,
            item = this.value

        if (item.entry_key === "FidusWriter") {
            this.createEntryKey(item)
        }
        const saveObj = {}
        saveObj[itemId] = item
        return this.bibDB.saveBibEntries(saveObj, isNew)
    }

    check() {
        let passed = true
        if (!this.currentValues.bib_type) {
            return false
        }
        Object.keys(this.fields).forEach(fieldName => {
            if (this.fields[fieldName].check() !== true) {
                passed = false
            }
        })
        if (!passed) {
            addAlert(
                "error",
                gettext("Error in form, check highlighted values!")
            )
        }
        return passed
    }
}
