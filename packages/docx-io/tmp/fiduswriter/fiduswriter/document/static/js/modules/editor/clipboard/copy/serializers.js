import {DOMSerializer} from "prosemirror-model"
import {RenderCitations} from "../../../citations/render"
import {BIBLIOGRAPHY_HEADERS} from "../../../schema/i18n"
import {createDocCopySchema, fnCopySchema} from "./schema"

// Wrap around DOMSerializer, allowing post processing.
class ClipboardDOMSerializer {
    constructor(nodes, marks, editor) {
        this.domSerializer = new DOMSerializer(nodes, marks)
        this.editor = editor
    }

    serializeFragment(fragment, options) {
        const domFragment = this.domSerializer.serializeFragment(
            fragment,
            options
        )
        return this.postProcessFragment(domFragment)
    }

    postProcessFragment(domFragment) {
        const citationFormatter = this.renderCitations(domFragment)
        this.renderFootnotes(domFragment, citationFormatter)
        this.removeTrackingData(domFragment)
        this.addBaseUrlToImages(domFragment)
        this.addFigureNumbers(domFragment)
        return domFragment
    }

    renderCitations(domFragment) {
        const settings = this.editor.view.state.doc.attrs,
            bibliographyHeader =
                settings.bibliography_header[settings.language] ||
                BIBLIOGRAPHY_HEADERS[settings.language]
        const citRenderer = new RenderCitations(
            domFragment,
            settings.citationstyle,
            bibliographyHeader,
            this.editor.mod.db.bibDB,
            this.editor.app.csl,
            true // synchronous. Should work as the editor has used the same style previously.
        )
        if (citRenderer.init()) {
            if (citRenderer.fm.bibHTML.length) {
                const bibDiv = document.createElement("div")
                bibDiv.classList.add("fiduswriter-clipboard-bibliography")
                bibDiv.innerHTML = citRenderer.fm.bibHTML
                bibDiv.firstElementChild.innerHTML = gettext("Bibliography")
                domFragment.appendChild(bibDiv)
            }
            return citRenderer.fm
        } else {
            return false
        }
    }

    renderFootnotes(domFragment, citationFormatter) {
        const footnoteSelector =
            citationFormatter && citationFormatter.citationType === "note"
                ? ".footnote-marker, .citation"
                : ".footnote-marker"
        // Inside of footnote markers add anchors and put footnotes with content
        // at the back of the document.
        // Also, link the footnote anchor with the footnote.
        const footnotes = domFragment.querySelectorAll(footnoteSelector)
        const footnotesContainer = document.createElement("section")
        let citationCount = 0
        footnotesContainer.setAttribute("role", "doc-footnotes")
        footnotesContainer.classList.add("fnlist")
        footnotesContainer.classList.add("fiduswriter-clipboard-footnotes")
        footnotes.forEach((footnote, index) => {
            const counter = index + 1,
                id = this.getRandomID()
            const footnoteAnchor = this.getFootnoteAnchor(counter, id)
            footnote.appendChild(footnoteAnchor)
            const newFootnote = document.createElement("h6") // We use H6 as Wordpress Gutenberg only allows IDs on H1-6 elements.
            newFootnote.setAttribute("role", "doc-footnote")
            newFootnote.innerHTML = footnote.matches(".footnote-marker")
                ? footnote.dataset.footnote
                : `<p>${citationFormatter.citationTexts[citationCount++] || " "}</p>`
            if (
                newFootnote.firstElementChild &&
                newFootnote.firstElementChild.matches("p")
            ) {
                newFootnote.firstElementChild.insertAdjacentHTML(
                    "afterbegin",
                    `${counter}. `
                )
            } else {
                newFootnote.insertAdjacentHTML(
                    "afterbegin",
                    `<p>${counter}. </p>`
                )
            }
            newFootnote.id = `fn-${id}`
            footnotesContainer.appendChild(newFootnote)
        })
        if (footnotes.length) {
            domFragment.appendChild(footnotesContainer)
        }
    }

    addFigureNumbers(domFragment) {
        domFragment
            .querySelectorAll(
                "figure[data-category='figure'] figcaption span.label"
            )
            .forEach((el, index) => {
                el.innerHTML += " " + (index + 1) + ": "
            })

        domFragment
            .querySelectorAll(
                "figure[data-category='photo'] figcaption span.label"
            )
            .forEach((el, index) => {
                el.innerHTML += " " + (index + 1) + ": "
            })

        domFragment
            .querySelectorAll(
                "figure[data-category='table'] figcaption span.label"
            )
            .forEach((el, index) => {
                el.innerHTML += " " + (index + 1) + ": "
            })
    }

    addBaseUrlToImages(domFragment) {
        domFragment
            .querySelectorAll("img")
            .forEach(el => el.setAttribute("src", el.src))
    }

    getRandomID() {
        return (0 | (Math.random() * 9e6)).toString(36)
    }

    getFootnoteAnchor(counter, id) {
        const footnoteAnchor = document.createElement("a")
        footnoteAnchor.setAttribute("href", `#fn-${id}`)
        footnoteAnchor.classList.add("fn")
        footnoteAnchor.classList.add("sdfootnoteanc")
        footnoteAnchor.innerHTML = `<sup>${counter}</sup>`
        return footnoteAnchor
    }

    removeTrackingData(domFragment) {
        domFragment
            .querySelectorAll(".approved-insertion, .insertion")
            .forEach(el => {
                const parent = el.parentNode
                const fragment = document.createDocumentFragment()
                while (el.firstChild) {
                    fragment.appendChild(el.firstChild)
                }
                parent.replaceChild(fragment, el)
            })
        domFragment
            .querySelectorAll(".deletion")
            .forEach(el => el.parentElement.removeChild(el))
    }

    static fromSchema(schema, editor) {
        return new ClipboardDOMSerializer(
            DOMSerializer.nodesFromSchema(schema),
            DOMSerializer.marksFromSchema(schema),
            editor
        )
    }
}

export const docClipboardSerializer = editor =>
    ClipboardDOMSerializer.fromSchema(
        createDocCopySchema(editor.schema),
        editor
    )
export const fnClipboardSerializer = editor =>
    ClipboardDOMSerializer.fromSchema(fnCopySchema, editor)
