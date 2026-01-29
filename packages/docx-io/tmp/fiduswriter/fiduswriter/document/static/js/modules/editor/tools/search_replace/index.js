import {COMMENT_ONLY_ROLES, READ_ONLY_ROLES} from "../.."
import {Dialog, addAlert} from "../../../common"
import {
    deselectSearchMatch,
    endSearch,
    getProtectedRanges,
    getSearchMatches,
    selectNextSearchMatch,
    selectPreviousSearchMatch,
    setSearchTerm
} from "../../state_plugins"
import {searchDialogTemplate} from "./templates"

export class SearchReplaceDialog {
    constructor(editor) {
        this.editor = editor
        this.dialog = false
        this.matches = {matches: [], selected: false}
        this.fnMatches = {matches: [], selected: false}
        this.canWrite =
            READ_ONLY_ROLES.includes(this.editor.docInfo.access_rights) ||
            COMMENT_ONLY_ROLES.includes(this.editor.docInfo.access_rights)
                ? false
                : true
    }

    init() {
        let buttons = [
            {
                text: gettext("Previous"),
                classes: "fw-light disabled",
                click: () => {
                    if (this.matches.selected !== false) {
                        if (
                            this.matches.selected > 0 ||
                            !this.fnMatches.matches.length
                        ) {
                            this.editor.view.dispatch(
                                selectPreviousSearchMatch(
                                    this.editor.view.state
                                )
                            )
                        } else {
                            this.editor.view.dispatch(
                                deselectSearchMatch(this.editor.view.state)
                            )
                            this.editor.mod.footnotes.fnEditor.view.dispatch(
                                selectPreviousSearchMatch(
                                    this.editor.mod.footnotes.fnEditor.view
                                        .state
                                )
                            )
                        }
                    } else if (this.fnMatches.selected !== false) {
                        if (
                            this.fnMatches.selected > 0 ||
                            !this.matches.matches.length
                        ) {
                            this.editor.mod.footnotes.fnEditor.view.dispatch(
                                selectPreviousSearchMatch(
                                    this.editor.mod.footnotes.fnEditor.view
                                        .state
                                )
                            )
                        } else {
                            this.editor.mod.footnotes.fnEditor.view.dispatch(
                                deselectSearchMatch(
                                    this.editor.mod.footnotes.fnEditor.view
                                        .state
                                )
                            )
                            this.editor.view.dispatch(
                                selectPreviousSearchMatch(
                                    this.editor.view.state
                                )
                            )
                        }
                    }
                }
            },
            {
                text: gettext("Next"),
                classes: "fw-light disabled",
                click: () => {
                    if (this.matches.selected !== false) {
                        if (
                            this.matches.selected <
                                this.matches.matches.length - 1 ||
                            !this.fnMatches.matches.length
                        ) {
                            this.editor.view.dispatch(
                                selectNextSearchMatch(this.editor.view.state)
                            )
                        } else {
                            this.editor.view.dispatch(
                                deselectSearchMatch(this.editor.view.state)
                            )
                            this.editor.mod.footnotes.fnEditor.view.dispatch(
                                selectNextSearchMatch(
                                    this.editor.mod.footnotes.fnEditor.view
                                        .state
                                )
                            )
                        }
                    } else if (this.fnMatches.selected !== false) {
                        if (
                            this.fnMatches.selected <
                                this.fnMatches.matches.length - 1 ||
                            !this.matches.matches.length
                        ) {
                            this.editor.mod.footnotes.fnEditor.view.dispatch(
                                selectNextSearchMatch(
                                    this.editor.mod.footnotes.fnEditor.view
                                        .state
                                )
                            )
                        } else {
                            this.editor.mod.footnotes.fnEditor.view.dispatch(
                                deselectSearchMatch(
                                    this.editor.mod.footnotes.fnEditor.view
                                        .state
                                )
                            )
                            this.editor.view.dispatch(
                                selectNextSearchMatch(this.editor.view.state)
                            )
                        }
                    }
                }
            }
        ]

        if (this.canWrite) {
            buttons = buttons.concat([
                {
                    text: gettext("Replace"),
                    classes: "fw-dark disabled",
                    click: () => {
                        if (this.matches.selected !== false) {
                            const match =
                                this.matches.matches[this.matches.selected]
                            const originalDoc = this.editor.view.state.doc
                            const tr = this.editor.view.state.tr.insertText(
                                this.replaceInput.value,
                                match.from,
                                match.to
                            )
                            this.editor.view.dispatch(tr)
                            // In case there was a match within protected range , the change
                            // would be rejected. Show alert when replace is successfull.
                            if (!this.editor.view.state.doc.eq(originalDoc)) {
                                addAlert(
                                    "info",
                                    gettext("Text replaced successfully")
                                )
                            }
                        } else if (this.fnMatches.selected !== false) {
                            const match =
                                this.fnMatches.matches[this.fnMatches.selected]
                            const originalDoc =
                                this.editor.mod.footnotes.fnEditor.view.state
                                    .doc
                            const tr =
                                this.editor.mod.footnotes.fnEditor.view.state.tr.insertText(
                                    this.replaceInput.value,
                                    match.from,
                                    match.to
                                )
                            this.editor.mod.footnotes.fnEditor.view.dispatch(tr)
                            // In case there was a match within protected range , the change
                            // would be rejected. Show alert when replace is successfull.
                            if (
                                !this.editor.mod.footnotes.fnEditor.view.state.doc.eq(
                                    originalDoc
                                )
                            ) {
                                addAlert(
                                    "info",
                                    gettext("Text replaced successfully")
                                )
                            }
                        }
                    }
                },
                {
                    text: gettext("Replace All"),
                    classes: "fw-dark disabled",
                    click: () => {
                        if (this.matches.matches.length) {
                            const tr = this.editor.view.state.tr
                            const originalDoc = this.editor.view.state.doc
                            const protectedRanges = getProtectedRanges(
                                this.editor.view.state
                            )
                            const matches = this.matches.matches.slice()
                            while (matches.length) {
                                const match = matches.pop() // We take them backward so that there is no need for mapping steps
                                if (
                                    !protectedRanges.find(
                                        ({from, to}) =>
                                            !(
                                                (match.from <= from &&
                                                    match.to <= from) ||
                                                (match.from >= to &&
                                                    match.to >= to)
                                            )
                                    )
                                ) {
                                    // Ignore matches within protected ranges.
                                    tr.insertText(
                                        this.replaceInput.value,
                                        match.from,
                                        match.to
                                    )
                                }
                            }
                            this.editor.view.dispatch(tr)
                            // In case there was a match within protected range , the change
                            // would be rejected. Show alert when replace is successfull.
                            if (!this.editor.view.state.doc.eq(originalDoc)) {
                                addAlert(
                                    "info",
                                    gettext("Text replaced successfully")
                                )
                            }
                        }
                        if (this.fnMatches.matches.length) {
                            const tr =
                                this.editor.mod.footnotes.fnEditor.view.state.tr
                            const originalDoc =
                                this.editor.mod.footnotes.fnEditor.view.state
                                    .doc
                            const matches = this.fnMatches.matches.slice()
                            while (matches.length) {
                                const match = matches.pop() // We take them backward so that there is no need for mapping steps
                                tr.insertText(
                                    this.replaceInput.value,
                                    match.from,
                                    match.to
                                )
                            }
                            this.editor.mod.footnotes.fnEditor.view.dispatch(tr)
                            // In case there was a match within protected range , the change
                            // would be rejected. Show alert when replace is successfull.
                            if (
                                !this.editor.mod.footnotes.fnEditor.view.state.doc.eq(
                                    originalDoc
                                )
                            ) {
                                addAlert(
                                    "info",
                                    gettext("Text replaced successfully")
                                )
                            }
                        }
                    }
                }
            ])
        }

        buttons = buttons.concat([{type: "close"}])

        this.dialog = new Dialog({
            title: this.canWrite
                ? gettext("Search and replace")
                : gettext("Search"),
            body: searchDialogTemplate({canWrite: this.canWrite}),
            buttons,
            blur: false,
            onClose: () => {
                this.endSearch()
                this.editor.currentView.focus()
            },
            note: {
                display: false,
                text: gettext(
                    "Please note that there are match(es) within non-editable parts of the document, these match(es) won't be replaced when using 'replace' or 'replace all'"
                )
            }
        })

        this.dialog.open()

        this.searchInput = this.dialog.dialogEl.querySelector(".search")
        this.replaceInput = this.dialog.dialogEl.querySelector(".replace")
        this.resultCountEl = this.dialog.dialogEl.querySelector(
            ".search-result-count"
        )
        this.dialog.dialogEl.querySelector("input[type=text]").focus()

        this.bind()
    }

    setButtonState() {
        if (this.matches.matches.length + this.fnMatches.matches.length > 1) {
            this.dialog.buttons[0].classes = "fw-light"
            this.dialog.buttons[1].classes = "fw-light"
        } else {
            this.dialog.buttons[0].classes = "fw-light disabled"
            this.dialog.buttons[1].classes = "fw-light disabled"
        }
        if (this.canWrite) {
            if (this.matches.matches.length || this.fnMatches.matches.length) {
                this.dialog.buttons[2].classes = "fw-dark"
                this.dialog.buttons[3].classes = "fw-dark"
            } else {
                this.dialog.buttons[2].classes = "fw-dark disabled"
                this.dialog.buttons[3].classes = "fw-dark disabled"
            }
        }

        this.dialog.refreshButtons()
    }

    setNoteState() {
        const protectedRanges = getProtectedRanges(this.editor.view.state)
        const matches = this.matches.matches.slice()
        let matchWithinPR = false
        while (matches.length && !matchWithinPR) {
            const match = matches.pop()
            if (
                protectedRanges.find(
                    ({from, to}) =>
                        !(
                            (match.from <= from && match.to <= from) ||
                            (match.from >= to && match.to >= to)
                        )
                )
            ) {
                matchWithinPR = true
            }
        }

        if (matchWithinPR) {
            this.dialog.note.display = true
        } else {
            this.dialog.note.display = false
        }
        this.dialog.refreshNote()
    }

    updateResultCount() {
        const totalMatches =
            this.matches.matches.length + this.fnMatches.matches.length
        this.resultCountEl.textContent = `(${totalMatches})`
    }

    bind() {
        this.searchInput.addEventListener("input", () => {
            this.search(this.searchInput.value)
            this.setNoteState()
        })
        if (this.canWrite) {
            this.replaceInput.addEventListener("input", () => {
                this.setButtonState()
            })
        }
    }

    onUpdate() {
        this.matches = getSearchMatches(this.editor.view.state)
        this.fnMatches = getSearchMatches(
            this.editor.mod.footnotes.fnEditor.view.state
        )
        const selectedSearch = document.querySelector(
            "#paper-editable .search.selected"
        )

        if (selectedSearch) {
            selectedSearch.scrollIntoView(false)
        }
        // listener for change in views
        this.setButtonState()
        this.updateResultCount()
    }

    search(term) {
        const setSearchTermResult = setSearchTerm(
            this.editor.view.state,
            term,
            this.editor.view === this.editor.currentView ? 0 : false,
            this
        )
        let {tr} = setSearchTermResult
        const {matches, selected} = setSearchTermResult
        const setSearchTermResultFn = setSearchTerm(
            this.editor.mod.footnotes.fnEditor.view.state,
            term,
            this.editor.mod.footnotes.fnEditor.view === this.editor.currentView
                ? 0
                : false
        )
        let {tr: fnTr} = setSearchTermResultFn
        const {matches: fnMatches, selected: fnSelected} = setSearchTermResultFn
        if (
            selected === false &&
            fnSelected === false &&
            (matches.length || fnMatches.length)
        ) {
            if (matches.length) {
                tr = setSearchTerm(this.editor.view.state, term, 0, this).tr
            } else {
                fnTr = setSearchTerm(
                    this.editor.mod.footnotes.fnEditor.view.state,
                    term,
                    0
                ).tr
            }
        }
        this.editor.mod.footnotes.fnEditor.view.dispatch(fnTr)
        this.editor.view.dispatch(tr)
        this.updateResultCount()
    }

    endSearch() {
        this.editor.view.dispatch(endSearch(this.editor.view.state))
        this.editor.mod.footnotes.fnEditor.view.dispatch(
            endSearch(this.editor.mod.footnotes.fnEditor.view.state)
        )
    }
}
