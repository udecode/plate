import {baseKeymap} from "prosemirror-commands"
import {buildInputRules, buildKeymap} from "prosemirror-example-setup"
import {gapCursor} from "prosemirror-gapcursor"
import {history} from "prosemirror-history"
import {keymap} from "prosemirror-keymap"
import {menuBar} from "prosemirror-menu"
import {EditorState, Plugin} from "prosemirror-state"
import {tableEditing} from "prosemirror-tables"
import {EditorView} from "prosemirror-view"
import sortable from "sortablejs"

import {ensureCSS, findTarget} from "../common"
import {ContributorsPartView, TagsPartView} from "../editor/state_plugins"
import {docSchema} from "../schema/document"
import {toFullJSON, toMiniJSON} from "../schema/mini_json"
import {DocumentStyleDialog} from "./document_style_dialog"
import {ExportTemplateDialog} from "./export_template_dialog"
import {
    contributorsPartSchema,
    headingMenuContent,
    headingPartSchema,
    helpMenuContent,
    helpSchema,
    richtextMenuContent,
    richtextPartSchema,
    tableMenuContent,
    tablePartSchema,
    tagsPartSchema
} from "./schema"
import {
    bibliographyHeaderTemplate,
    citationstyleTemplate,
    documentDesignerTemplate,
    documentStylesTemplate,
    exportTemplatesTemplate,
    languageTemplate
} from "./templates"
import {addHeadingIds, debounced, noTrack} from "./tools"

export class DocumentTemplateDesigner {
    constructor(
        id,
        title,
        value,
        documentStyles,
        citationStyles,
        exportTemplates,
        dom
    ) {
        this.id = id
        this.title = title
        this.value = toFullJSON(value, docSchema)
        this.documentStyles = documentStyles
        this.citationStyles = citationStyles
        this.exportTemplates = exportTemplates
        this.dom = dom

        this.editors = []
        this.listeners = {
            onScroll: debounced(200, () => this.onScroll())
        }
    }

    init() {
        this.dom.innerHTML = documentDesignerTemplate({
            id: this.id,
            title: this.title,
            value: this.value,
            documentStyles: this.documentStyles,
            exportTemplates: this.exportTemplates,
            citationStyles: this.citationStyles
        })
        ensureCSS([
            staticUrl("css/common.css"),
            staticUrl("css/dialog.css"),
            staticUrl("css/prosemirror.css"),
            staticUrl("css/prosemirror-menu.css"),
            staticUrl("css/prosemirror-example-setup.css"),
            staticUrl("css/document_template_designer.css"),
            staticUrl("css/tags.css"),
            staticUrl("css/contributors.css"),
            staticUrl("css/dialog.css"),
            staticUrl("css/table.css"),
            staticUrl("css/dialog_table.css")
        ])
        this.setupInitialEditors()
        this.bind()
    }

    getCurrentValue() {
        let valid = true
        const ids = []
        const errors = {}
        const titleEl = this.dom.querySelector("input.title")
        if (titleEl.classList.contains("error-element")) {
            titleEl.classList.remove("error-element")
        }
        this.title = titleEl.value
        if (!this.title.length) {
            valid = false
            errors.empty_template_title = gettext("The template needs a title.")
            titleEl.classList.add("error-element")
            titleEl.scrollIntoView({block: "center", behavior: "smooth"})
        }
        const importIdEl = this.dom.querySelector("input.import-id")
        const importId = importIdEl.value
        if (!importId.length) {
            valid = false
            errors.empty_import_id = gettext("The template needs an ID.")
            importIdEl.classList.add("error-element")
            importIdEl.scrollIntoView({block: "center", behavior: "smooth"})
        }
        if (/\s/.test(importId)) {
            valid = false
            errors.no_spaces = gettext("The template ID cannot contain spaces.")
            importIdEl.classList.add("error-element")
            importIdEl.scrollIntoView({block: "center", behavior: "smooth"})
        }

        this.value = {
            type: "doc",
            content: [{type: "title"}].concat(
                Array.from(
                    this.dom.querySelectorAll(
                        ".to-container .doc-part-block:not(.fixed)"
                    )
                ).map(el => {
                    const type = el.dataset.type,
                        id = el.querySelector("input.id").value,
                        title = el.querySelector("input.title")
                            ? el.querySelector("input.title").value
                            : false,
                        help = this.getEditorValue(
                            el.querySelector(".instructions")
                        ),
                        initial = this.getEditorValue(
                            el.querySelector(".initial"),
                            true
                        ),
                        locking = el.querySelector(".locking option:checked")
                            ? el.querySelector(".locking option:checked").value
                            : "false",
                        optional = el.querySelector(".optional option:checked")
                            ? el.querySelector(".optional option:checked").value
                            : false,
                        attrs = {id, title},
                        node = {type, attrs}
                    if (help) {
                        attrs.help = help
                    }
                    if (initial) {
                        attrs.initial = initial
                        node.content = JSON.parse(JSON.stringify(initial))
                    }
                    if (optional !== "false") {
                        attrs.optional = optional
                    }
                    if (optional === "hidden") {
                        attrs.hidden = true
                    }
                    if (locking !== "false") {
                        attrs.locking = locking
                    }
                    switch (type) {
                        case "richtext_part":
                        case "heading_part": {
                            attrs.elements = Array.from(
                                el.querySelectorAll(".elements:checked")
                            ).map(el => el.value)
                            if (!attrs.elements.length) {
                                attrs.elements = ["paragraph"]
                            }
                            attrs.marks = Array.from(
                                el.querySelectorAll(".marks:checked")
                            ).map(el => el.value)
                            const language = el.querySelector(".language").value
                            if (language !== "false") {
                                attrs.language = language
                            }
                            if (!node.content) {
                                node.content = [{type: attrs.elements[0]}]
                            }
                            const metadata =
                                el.querySelector("select.metadata").value
                            if (metadata !== "false") {
                                attrs.metadata = metadata
                            }
                            break
                        }
                        case "table_part": {
                            attrs.elements = Array.from(
                                el.querySelectorAll(".elements:checked")
                            ).map(el => el.value)
                            if (!attrs.elements.includes("paragraph")) {
                                // tables need to allow paragraphs
                                attrs.elements.push("paragraph")
                            }
                            attrs.marks = Array.from(
                                el.querySelectorAll(".marks:checked")
                            ).map(el => el.value)
                            const language = el.querySelector(".language").value
                            if (language !== "false") {
                                attrs.language = language
                            }
                            if (!node.content) {
                                node.content = [
                                    {
                                        type: "table",
                                        content: [
                                            {type: "table_caption"},
                                            {
                                                type: "table_body",
                                                content: [
                                                    {
                                                        type: "table_row",
                                                        content: [
                                                            {
                                                                type: "table_cell",
                                                                content: [
                                                                    {
                                                                        type: "paragraph"
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                            break
                        }
                        case "contributors_part":
                        case "tags_part": {
                            attrs.item_title =
                                el.querySelector("input.item_title").value
                            const metadata =
                                el.querySelector("select.metadata").value
                            if (metadata !== "false") {
                                attrs.metadata = metadata
                            }
                            break
                        }
                        default:
                            break
                    }
                    if (el.classList.contains("error-element")) {
                        el.classList.remove("error-element")
                    }
                    if (!id.length) {
                        valid = false
                        errors.missing_id = gettext(
                            "All document parts need an ID."
                        )
                        el.classList.add("error-element")
                        el.scrollIntoView({block: "center", behavior: "smooth"})
                    }
                    if (/\s/.test(id)) {
                        valid = false
                        errors.no_spaces = gettext("IDs cannot contain spaces.")
                        el.classList.add("error-element")
                        el.scrollIntoView({block: "center", behavior: "smooth"})
                    }
                    if (ids.includes(id)) {
                        valid = false
                        Array.from(
                            this.dom.querySelectorAll(
                                ".to-container .doc-part-block:not(.fixed)"
                            )
                        ).map(el => {
                            const id_duplicate =
                                el.querySelector("input.id").value
                            if (id_duplicate == id) {
                                el.classList.add("error-element")
                            }
                        })
                        el.scrollIntoView({block: "center", behavior: "smooth"})
                        errors.unique_id = gettext("IDs have to be unique.")
                    }
                    ids.push(id)
                    return node
                })
            ),
            attrs: {
                import_id: importId,
                footnote_elements: Array.from(
                    this.dom.querySelectorAll(
                        ".footnote-value .elements:checked"
                    )
                ).map(el => el.value),
                footnote_marks: Array.from(
                    this.dom.querySelectorAll(".footnote-value .marks:checked")
                ).map(el => el.value),
                language: this.dom.querySelector(
                    ".language-value option:checked"
                )
                    ? this.dom.querySelector(".language-value option:checked")
                          .value
                    : false,
                languages: Array.from(
                    this.dom.querySelectorAll(".languages-value option:checked")
                ).map(el => el.value),
                citationstyle: this.dom.querySelector(
                    ".citationstyle-value option:checked"
                )
                    ? this.dom.querySelector(
                          ".citationstyle-value option:checked"
                      ).value
                    : false,
                citationstyles: Array.from(
                    this.dom.querySelectorAll(
                        ".citationstyles-value option:checked"
                    )
                )
                    .map(el => el.value)
                    .slice(0, 30),
                papersizes: Array.from(
                    this.dom.querySelectorAll(
                        ".papersizes-value option:checked"
                    )
                ).map(el => el.value),
                bibliography_header: Array.from(
                    this.dom.querySelectorAll(".bibliography-header-value tr")
                ).reduce((stringObj, trEl) => {
                    const inputEl = trEl.querySelector("input")
                    if (!inputEl.value.length) {
                        return stringObj
                    }
                    const selectEl = trEl.querySelector("select")
                    stringObj[selectEl.value] = inputEl.value
                    return stringObj
                }, {}),
                template: this.title
            }
        }
        if (!this.value.attrs.papersizes.length) {
            this.value.attrs.papersizes = ["A4"]
        }
        this.value.attrs.papersize = this.value.attrs.papersizes[0]
        if (!this.value.attrs.footnote_elements.length) {
            this.value.attrs.footnote_elements = ["paragraph"]
        }
        if (!this.value.attrs.languages.length) {
            this.value.attrs.languages = ["en-US"]
        }
        if (!this.value.attrs.languages.includes(this.value.attrs.language)) {
            this.value.attrs.language = this.value.attrs.languages[0]
        }
        if (!this.value.attrs.citationstyles.length) {
            this.value.attrs.citationstyles = ["apa"]
        }
        if (
            !this.value.attrs.citationstyles.includes(
                this.value.attrs.citationstyle
            )
        ) {
            this.value.attrs.language = this.value.attrs.citationstyles[0]
        }

        return {
            valid,
            title: this.title,
            value: toMiniJSON(docSchema.nodeFromJSON(this.value)),
            errors,
            import_id: importId
        }
    }

    setupInitialEditors() {
        Array.from(
            this.dom.querySelectorAll(
                ".to-container .doc-part-block:not(.fixed)"
            )
        ).forEach((el, index) => {
            const value = this.value.content[index + 1], // offset by title
                help = value.attrs.help,
                initial = value.attrs.initial,
                type = value.type
            this.setupEditors(el, type, help, initial)
        })
    }

    setupEditors(el, type, help = false, initial = false) {
        const helpEl = el.querySelector(".instructions")
        if (!helpEl) {
            return
        }
        const helpDoc = help
                ? helpSchema.nodeFromJSON({type: "doc", content: help})
                : helpSchema.nodes.doc.createAndFill(),
            helpView = new EditorView(helpEl, {
                state: EditorState.create({
                    doc: helpDoc,
                    plugins: [
                        buildInputRules(helpSchema),
                        keymap(buildKeymap(helpSchema)),
                        keymap(baseKeymap),
                        gapCursor(),
                        menuBar({
                            floating: false,
                            content: helpMenuContent
                        }),
                        history()
                    ]
                })
            })
        this.editors.push([helpEl, helpView])
        const plugins = [
            new Plugin({
                // Adding heading IDs to all new headings.
                appendTransaction: (trs, oldState, newState) => {
                    if (trs.every(tr => !tr.steps.length)) {
                        return
                    }
                    return addHeadingIds(oldState, newState, this.editors)
                }
            })
        ]
        let menuContent = [],
            schema
        switch (type) {
            case "richtext_part":
                schema = richtextPartSchema
                menuContent = richtextMenuContent
                plugins.push(tableEditing())
                break
            case "table_part":
                schema = tablePartSchema
                menuContent = tableMenuContent
                plugins.push(tableEditing())
                break
            case "heading_part":
                schema = headingPartSchema
                menuContent = headingMenuContent
                break
            case "tags_part":
                schema = tagsPartSchema
                plugins.push(
                    new Plugin({
                        props: {
                            nodeViews: {
                                tags_part: (node, view, getPos) =>
                                    new TagsPartView(node, view, getPos)
                            }
                        }
                    })
                )
                break
            case "contributors_part":
                schema = contributorsPartSchema
                plugins.push(
                    new Plugin({
                        props: {
                            nodeViews: {
                                contributors_part: (node, view, getPos) =>
                                    new ContributorsPartView(node, view, getPos)
                            }
                        }
                    })
                )
                break
            default:
                break
        }

        if (!schema) {
            return
        }
        plugins.unshift(
            buildInputRules(schema),
            keymap(buildKeymap(schema)),
            keymap(baseKeymap),
            gapCursor(),
            menuBar({
                floating: false,
                content: menuContent
            }),
            history()
        )
        const initialEl = el.querySelector(".initial"),
            doc = initial
                ? schema.nodeFromJSON({
                      type: "doc",
                      content: [
                          {
                              type: type,
                              content: initial
                          }
                      ]
                  })
                : schema.nodes.doc.createAndFill()
        let state = EditorState.create({
            doc,
            plugins
        })
        const addedHeadings = addHeadingIds(state, state, this.editors)
        if (addedHeadings) {
            state = state.apply(addedHeadings)
        }
        const initialView = new EditorView(initialEl, {state})
        this.editors.push([initialEl, initialView])
    }

    getEditorValue(el, initial = false) {
        const editor = this.editors.find(editor => editor[0] === el)
        if (!editor) {
            return false
        }
        const state = editor[1].state
        // Only return if there is more content that a recently initiated doc
        // would have. The number varies between part types.
        if (
            state.doc.firstChild.type.name === "heading_part" ||
            state.doc.nodeSize > state.schema.nodes.doc.createAndFill().nodeSize
        ) {
            return initial
                ? noTrack(state.doc.firstChild.toJSON()).content
                : noTrack(state.doc.toJSON()).content
        }
        return false
    }

    close() {
        this.dom.innerHTML = ""
        document.removeEventListener("scroll", this.listeners.onScroll)
    }

    bind() {
        new sortable(this.dom.querySelector(".from-container"), {
            group: {
                name: "document",
                pull: "clone",
                put: false
            },
            sort: false,
            handle: ".doc-part-header"
        })
        new sortable(this.dom.querySelector(".to-container"), {
            group: {
                name: "document",
                pull: true,
                put: true
            },
            handle: ".doc-part-header",
            onAdd: event => {
                this.setupEditors(event.item, event.item.dataset.type)
            }
        })
        new sortable(this.dom.querySelector(".trash"), {
            group: {
                name: "document",
                put: true
            },
            handle: ".doc-part-header",
            onAdd: event => event.to.removeChild(event.to.firstElementChild) // Remove the item that was just added
        })

        this.dom.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, ".doc-part-block .configure", el):
                    event.preventDefault()
                    el.target
                        .closest(".doc-part-block")
                        .querySelector(".attrs")
                        .classList.toggle("hidden")
                    break
                case findTarget(
                    event,
                    ".bibliography-header-value .fa-plus-circle",
                    el
                ):
                    event.preventDefault()
                    this.getCurrentValue()
                    this.dom.querySelector(
                        ".bibliography-header-value"
                    ).innerHTML = bibliographyHeaderTemplate({
                        bibliography_header: Object.assign(
                            {},
                            this.value.attrs.bibliography_header,
                            {zzz: ""}
                        ) // 'zzz' so that the entry is added at the of the list
                    })
                    break
                case findTarget(
                    event,
                    ".bibliography-header-value .fa-minus-circle",
                    el
                ): {
                    event.preventDefault()
                    const trEl = el.target.closest("tr")
                    trEl.parentElement.removeChild(trEl)
                    break
                }
                case findTarget(event, "button.document-style", el): {
                    event.preventDefault()
                    const id = Number.parseInt(el.target.dataset.id)
                    const style = this.documentStyles.find(
                        style => style.pk === id
                    )
                    const dialog = new DocumentStyleDialog(
                        id,
                        style,
                        this.id,
                        this.documentStyles,
                        () =>
                            (this.dom.querySelector(
                                ".document-styles"
                            ).innerHTML = documentStylesTemplate({
                                documentStyles: this.documentStyles
                            }))
                    )
                    dialog.init()
                    break
                }
                case findTarget(event, "button.export-template", el): {
                    event.preventDefault()
                    const id = Number.parseInt(el.target.dataset.id)
                    const template = this.exportTemplates.find(
                        template => template.pk === id
                    )
                    const {value, valid} = this.getCurrentValue()
                    if (valid) {
                        const dialog = new ExportTemplateDialog(
                            id,
                            template,
                            this.id,
                            this.exportTemplates,
                            () =>
                                (this.dom.querySelector(
                                    ".export-templates"
                                ).innerHTML = exportTemplatesTemplate({
                                    exportTemplates: this.exportTemplates
                                })),
                            value
                        )
                        dialog.init()
                    }
                    break
                }
                default:
                    break
            }
        })

        document.addEventListener("scroll", this.listeners.onScroll)

        this.dom
            .querySelector(".languages-value")
            .addEventListener("change", () => {
                this.getCurrentValue()
                this.dom.querySelector(".language-value").innerHTML =
                    languageTemplate(this.value.attrs)
            })

        this.dom
            .querySelector(".citationstyles-value")
            .addEventListener("change", () => {
                const checkedElements = Array.from(
                    this.dom.querySelectorAll(
                        ".citationstyles-value option:checked"
                    )
                )
                this.getCurrentValue()
                if (
                    checkedElements.length >
                    this.value.attrs.citationstyles.length
                ) {
                    // Selected more than the max limit. We deselect the remaining.
                    checkedElements.forEach(el => {
                        if (
                            !this.value.attrs.citationstyles.includes(el.value)
                        ) {
                            el.selected = false
                        }
                    })
                }
                this.dom.querySelector(".citationstyle-value").innerHTML =
                    citationstyleTemplate(this.value.attrs, this.citationStyles)
            })
    }

    onScroll() {
        const fromContainer = this.dom.querySelector(".from-container"),
            toContainer = this.dom.querySelector(".to-container"),
            fromRect = fromContainer.getBoundingClientRect(),
            toRect = toContainer.getBoundingClientRect()
        if (toRect.height + 25 + fromRect.top > 0) {
            const contentSize = 6 * 61, // 61px for each content type.
                maxPadding = toRect.height - contentSize - 20 // 20px for padding bottom
            fromContainer.style.paddingTop = `${Math.min(10 - Math.min(fromRect.top, 0), maxPadding)}px`
        }
    }
}
