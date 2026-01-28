import {RenderCitations} from "../../citations/render"
import {Dialog, cancelPromise} from "../../common"
import {BIBLIOGRAPHY_HEADERS} from "../../schema/i18n"

export class ModCitations {
    constructor(editor) {
        editor.mod.citations = this
        this.editor = editor
        this.citationType = ""
        this.fnOverrideElement = false
    }

    init() {
        /* Add a style to hold dynamic CSS info about footnote numbering overrides.
         * Because we need footnotes in the editor and footnotes added through
         * citations to be numbered but they aren't in the same order in the DOM,
         * we need to organize the numbering manually.
         */
        document.body.insertAdjacentHTML(
            "beforeend",
            '<style type="text/css" id="footnote-numbering-override"></style>'
        )
        this.fnOverrideElement = document.getElementById(
            "footnote-numbering-override"
        )
    }

    resetCitations() {
        const citations = document.querySelectorAll(
            "#paper-editable span.citation"
        )
        citations.forEach(citation => (citation.innerHTML = ""))
        const docBibliography = document.querySelector(".doc-bibliography")
        const citationsContainer = document.getElementById(
            "citation-footnote-box-container"
        )
        if (!docBibliography || !citationsContainer) {
            return
        }
        if (docBibliography.innerHTML !== "") {
            docBibliography.innerHTML = ""
        }
        if (citationsContainer.innerHTML !== "") {
            citationsContainer.innerHTML = ""
        }
        this.layoutCitations()
    }

    layoutCitations() {
        if (!this.editor.mod.db?.bibDB.db) {
            // bibliography hasn't been loaded yet
            return
        }
        const emptyCitations = document.querySelectorAll(
            "#paper-editable span.citation:empty"
        )
        if (emptyCitations.length) {
            const settings = this.editor.view.state.doc.attrs,
                bibliographyHeader =
                    settings.bibliography_header[settings.language] ||
                    BIBLIOGRAPHY_HEADERS[settings.language]
            this.citRenderer = new RenderCitations(
                document.getElementById("paper-editable"),
                settings.citationstyle,
                bibliographyHeader,
                this.editor.mod.db.bibDB,
                this.editor.app.csl,
                false,
                settings.language
            )
            this.citRenderer
                .init()
                .then(() => this.layoutCitationsTwo())
                .catch(() => this.recoverAfterCiteProcCrash())
        }
    }

    recoverAfterCiteProcCrash() {
        console.warn(
            "CitationProcessor crashed. Falling back to simplified citation rendering."
        )

        // Create simplified citation texts for all citations
        const citationNodes = document.querySelectorAll(
            "#paper-editable span.citation"
        )
        citationNodes.forEach(citation => {
            try {
                // Get citation data from dataset
                const referencesData = JSON.parse(
                    citation.dataset.references || "[]"
                )
                if (!referencesData.length) {
                    citation.innerHTML = "[?]"
                    return
                }

                // Create a basic fallback citation text
                const citationText = referencesData
                    .map(ref => {
                        const entryId = ref.id
                        const item = this.editor.mod.db.bibDB.db[entryId]

                        if (!item) {
                            return `[${entryId || "?"}]`
                        }

                        // Extract basic author info
                        let authorText = ""
                        if (item.fields.author && item.fields.author.length) {
                            const author = item.fields.author[0]
                            authorText =
                                (
                                    author.lastName ||
                                    author.firstname ||
                                    author.literal
                                )
                                    ?.map(part => part.text || "")
                                    .join("") || "Unknown Author"
                            if (item.fields.author.length > 1) {
                                authorText += " et al."
                            }
                        } else {
                            authorText = "Unknown Author"
                        }

                        // Extract year
                        const year = item.fields.date
                            ? item.fields.date.substring(0, 4)
                            : "n.d."

                        // Add locator if present
                        const locator = ref.locator ? `, ${ref.locator}` : ""

                        return `(${authorText}, ${year}${locator})`
                    })
                    .join("; ")

                citation.innerHTML = citationText
            } catch (error) {
                console.error("Error creating fallback citation:", error)
                citation.innerHTML = "[Citation]"
            }
        })

        // Create a simplified bibliography
        const docBibliography = document.querySelector(".doc-bibliography")
        if (docBibliography) {
            try {
                const settings = this.editor.view.state.doc.attrs
                const bibliographyHeader =
                    settings.bibliography_header[settings.language] ||
                    BIBLIOGRAPHY_HEADERS[settings.language]

                let bibHTML = `<h1 class="doc-bibliography-header">${bibliographyHeader}</h1><div class="csl-bib-body">`

                // Collect all citation references
                const allCitations = Array.from(
                    document.querySelectorAll("#paper-editable span.citation")
                )
                const allRefs = new Set()

                allCitations.forEach(citation => {
                    try {
                        const refs = JSON.parse(
                            citation.dataset.references || "[]"
                        )
                        refs.forEach(ref => allRefs.add(ref.id))
                    } catch (_error) {
                        // Skip invalid references
                    }
                })

                // Create simple bibliography entries
                const bibDB = this.editor.mod.db.bibDB.db
                Array.from(allRefs)
                    .sort()
                    .forEach(id => {
                        const item = bibDB[id]
                        if (!item) {
                            bibHTML += `<div class="csl-entry" data-reference="${id}">[Missing reference: ${id}]</div>`
                            return
                        }

                        let authors = ""
                        if (item.fields.author && item.fields.author.length) {
                            authors = item.fields.author
                                .map(author => {
                                    return (
                                        (
                                            author.lastName ||
                                            author.firstname ||
                                            author.literal
                                        )
                                            ?.map(part => part.text || "")
                                            .join("") || "Unknown"
                                    )
                                })
                                .join(", ")
                        } else {
                            authors = "Unknown Author"
                        }

                        const year = item.fields.date
                            ? `(${item.fields.date.substring(0, 4)})`
                            : "(n.d.)"
                        const title =
                            item.fields.title
                                ?.map(part => part.text || "")
                                .join("") || "Untitled"
                        const publisher =
                            item.fields.publisher
                                ?.map(part => part.text || "")
                                .join("") || ""
                        const itemType = item.bib_type || "misc"

                        bibHTML += `<div class="csl-entry" data-reference="${id}">${authors} ${year}. <i>${title}</i>. ${publisher}. [${itemType}]</div>`
                    })

                bibHTML += "</div>"
                docBibliography.innerHTML = bibHTML
                // Add basic bibliography styling
                let styleEl = document.querySelector(".doc-bibliography-style")
                if (!styleEl) {
                    document.body.insertAdjacentHTML(
                        "beforeend",
                        '<style type="text/css" class="doc-bibliography-style"></style>'
                    )
                    styleEl = document.querySelector(".doc-bibliography-style")
                }

                const basicCSS = `
                    .csl-bib-body { line-height: 1.35; }
                    .csl-entry { padding-bottom: 1em; padding-left: 2em; text-indent: -2em; }
                    div.csl-entry { cursor: pointer; }
                    div.csl-entry:hover { background-color: #f0f0f0; }
                `
                styleEl.innerHTML = basicCSS

                // Rebind click handlers for bibliography entries
                if (this.editor.docInfo.access_rights === "write") {
                    this.bindBibliographyClicks()
                }
            } catch (error) {
                console.error("Error creating fallback bibliography:", error)
                docBibliography.innerHTML =
                    "<h1>Bibliography (Error rendering)</h1>"
            }
        }

        // Reset citation type to avoid footnote layout issues
        this.citationType = "in-text"

        return Promise.resolve()
    }

    bindBibliographyClicks() {
        document.querySelectorAll("div.csl-entry").forEach((el, index) => {
            el.addEventListener("click", () => {
                const eID = Number.parseInt(
                    this.citRenderer.fm.bibliography[0]?.entry_ids[index][0] ||
                        el.dataset.reference
                )
                this.checkTrackingDialog()
                    .then(() => import("../../bibliography/form"))
                    .then(({BibEntryForm}) => {
                        const form = new BibEntryForm(
                            this.editor.mod.db.bibDB,
                            false,
                            eID
                        )
                        form.init()
                    })
            })
        })
    }

    checkTrackingDialog() {
        if (!this.editor.view.state.doc.attrs.tracked) {
            return Promise.resolve()
        }
        const buttons = [],
            promise = new Promise(resolve => {
                buttons.push({
                    type: "cancel",
                    click: () => {
                        dialog.close()
                        resolve(cancelPromise())
                    }
                })
                buttons.push({
                    type: "ok",
                    click: () => {
                        dialog.close()
                        resolve()
                    }
                })
            })

        const dialog = new Dialog({
            title: gettext("No tracking"),
            body: gettext("Changes to citation sources are not being tracked!"),
            icon: "exclamation-triangle",
            width: 400,
            height: 100,
            buttons
        })
        dialog.open()
        return promise
    }

    layoutCitationsTwo() {
        const citRenderer = this.citRenderer
        let needFootnoteLayout = false
        if (this.citationType !== citRenderer.fm.citationType) {
            // The citation format has changed, so we need to relayout the footnotes as well
            needFootnoteLayout = true
        }
        this.citationType = citRenderer.fm.citationType
        // Add the rendered html and css of the bibliography to the DOM.
        const docBibliography = document.querySelector(".doc-bibliography")
        if (!docBibliography) {
            return
        }
        docBibliography.innerHTML = citRenderer.fm.bibHTML
        let styleEl = document.querySelector(".doc-bibliography-style")
        if (!styleEl) {
            document.body.insertAdjacentHTML(
                "beforeend",
                '<style type="text/css" class="doc-bibliography-style"></style>'
            )
            styleEl = document.querySelector(".doc-bibliography-style")
        }
        let css = citRenderer.fm.bibCSS
        if (this.editor.docInfo.access_rights === "write") {
            this.bindBibliographyClicks()
            css += `
                div.csl-entry {
                    cursor: pointer;
                }
                div.csl-entry:hover {
                    background-color: grey;
                }`
        }
        if (styleEl.innerHTML !== css) {
            styleEl.innerHTML = css
        }

        const citationsContainer = document.getElementById(
            "citation-footnote-box-container"
        )
        if (this.citationType === "note") {
            // Check if there is an empty citation in the main body text (not footnotes)
            const emptyCitations = document.querySelector("span.citation:empty")

            if (emptyCitations) {
                // Find all the citations in the main body text (not footnotes)
                const citationNodes = document.querySelectorAll(
                        "#document-editable span.citation"
                    ),
                    citationsHTML = citRenderer.fm.citationTexts
                        .slice(0, citationNodes.length)
                        .map(
                            citText =>
                                `<div class="footnote-citation">${citText}</div>`
                        )
                        .join("")
                if (citationsContainer.innerHTML !== citationsHTML) {
                    citationsContainer.innerHTML = citationsHTML
                }
                // The citations have not been filled, so we do so manually.
                citationNodes.forEach(
                    citationNode =>
                        (citationNode.innerHTML =
                            '<span class="citation-footnote-marker"></span>')
                )

                const footnoteCitationNodes = document.querySelectorAll(
                    "#footnote-box-container span.citation"
                )
                const footnoteCitTexts = citRenderer.fm.citationTexts.slice(
                    citationNodes.length
                )

                footnoteCitTexts.forEach((citText, index) => {
                    const citationNode = footnoteCitationNodes[index]
                    if (citationNode) {
                        citationNode.innerHTML = citText
                    }
                })
            }
        } else {
            if (citationsContainer.innerHTML !== "") {
                citationsContainer.innerHTML = ""
            }
        }

        this.footnoteNumberOverride()
        if (needFootnoteLayout) {
            this.editor.mod.footnotes.layout.updateDOM()
        }
    }

    footnoteNumberOverride() {
        /* Find the order of footnotes and citations in the document and
         * write CSS to number all the citation footnotes and other footnotes
         * correspondingly. Update footnote-numbering-override correspondingly.
         */

        let outputCSS = ""

        if (this.citationType === "note") {
            let editorFootnoteCounter = 1,
                citationFootnoteCounter = 1,
                footnoteCounter = 1

            this.editor.view.state.doc.descendants(node => {
                if (
                    node.isInline &&
                    (node.type.name === "footnote" ||
                        node.type.name === "citation")
                ) {
                    if (node.type.name === "footnote") {
                        outputCSS += `#footnote-box-container .footnote-container:nth-of-type(${editorFootnoteCounter}) > *:first-child::before {
                             content: "${footnoteCounter} ";
                         }\n`
                        editorFootnoteCounter++
                    } else {
                        outputCSS += `.footnote-citation:nth-of-type(${citationFootnoteCounter})::before {
                             content: "${footnoteCounter} ";
                         }\n`
                        citationFootnoteCounter++
                    }
                    footnoteCounter++
                }
            })
        }

        if (this.fnOverrideElement.innerHTML !== outputCSS) {
            this.fnOverrideElement.innerHTML = outputCSS
        }
    }
}
