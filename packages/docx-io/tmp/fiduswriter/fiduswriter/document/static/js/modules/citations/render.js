import {FormatCitations} from "./format"
/**
 * Render citations into the DOM.
 */

export class RenderCitations {
    constructor(
        contentElement,
        citationStyle,
        bibliographyHeader,
        bibDB,
        csl,
        synchronous = false,
        lang = "en-US"
    ) {
        this.contentElement = contentElement
        this.citationStyle = citationStyle
        this.bibliographyHeader = bibliographyHeader
        this.bibDB = bibDB
        this.csl = csl
        this.synchronous = synchronous
        this.lang = lang

        this.allCitationNodes = []
        this.allCitationInfos = []
        this.fm = false
    }

    init() {
        this.allCitationNodes =
            this.contentElement.querySelectorAll("span.citation")
        this.allCitationNodes.forEach(cElement => {
            const citeInfo = Object.assign({}, cElement.dataset)
            citeInfo.references = JSON.parse(citeInfo.references)
            this.allCitationInfos.push(citeInfo)
        })
        this.fm = new FormatCitations(
            this.csl,
            this.allCitationInfos,
            this.citationStyle,
            this.bibliographyHeader,
            this.bibDB,
            this.synchronous,
            this.lang
        )
        if (this.synchronous) {
            if (!this.fm.init()) {
                return false
            }
            this.renderCitations()
            return true
        } else {
            return this.fm.init().then(() => {
                this.renderCitations()
                return Promise.resolve()
            })
        }
    }

    renderCitations() {
        if ("note" !== this.fm.citationType) {
            this.fm.citationTexts.forEach(
                (citationText, index) =>
                    (this.allCitationNodes[index].innerHTML = citationText)
            )
        }
    }
}
