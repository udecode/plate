import {DOMParser, DOMSerializer} from "prosemirror-model"

import {cslBibSchema} from "../../bibliography/schema/csl_bib"
import {FormatCitations} from "../../citations/format"
import {fnSchema} from "../../schema/footnotes"
import {descendantNodes} from "../tools/doc_content"

export class ODTExporterCitations {
    constructor(docContent, settings, styles, bibDB, csl, origCitInfos = []) {
        this.docContent = docContent
        this.settings = settings
        this.styles = styles
        this.bibDB = bibDB
        this.csl = csl
        // If citInfos were found in a previous run, they are stored here
        // (for example: first citations in main document, then in footnotes)
        this.origCitInfos = origCitInfos
        this.citInfos = []
        this.citationTexts = []
        this.pmCits = []
        this.citFm = false
        this.pmBib = false
    }

    init() {
        return this.formatCitations()
    }

    // Citations are highly interdependent -- so we need to format them all
    // together before laying out the document.
    formatCitations() {
        if (this.origCitInfos.length) {
            // Initial citInfos are taken from a previous run to include in
            // bibliography, and they are removed before spitting out the
            // citation entries for the given document.
            // That way the bibliography should contain information from both.
            this.citInfos = this.citInfos.concat(this.origCitInfos)
        }

        descendantNodes(this.docContent).forEach(node => {
            if (node.type === "citation") {
                this.citInfos.push(JSON.parse(JSON.stringify(node.attrs)))
            }
        })
        this.citFm = new FormatCitations(
            this.csl,
            this.citInfos,
            this.settings.citationstyle,
            "",
            this.bibDB,
            false,
            this.settings.language
        )
        return this.citFm.init().then(() => {
            this.citationTexts = this.citFm.citationTexts
            if (this.origCitInfos.length) {
                // Remove all citation texts originating from original starting citInfos
                this.citationTexts.splice(0, this.origCitInfos.length)
            }
            this.convertCitations()
            return Promise.resolve()
        })
    }

    convertCitations() {
        // There could be some formatting in the citations, so we parse them through the PM schema for final formatting.
        // We need to put the citations each in a paragraph so that it works with
        // the fiduswriter schema and so that the converter doesn't mash them together.
        if (this.citationTexts.length) {
            let citationsHTML = ""
            this.citationTexts.forEach(ct => {
                citationsHTML += `<p>${ct}</p>`
            })

            // We create a standard footnote container DOM node,
            // add the citations into it, and parse it back.
            const fnNode = fnSchema.nodeFromJSON({type: "footnotecontainer"})
            const serializer = DOMSerializer.fromSchema(fnSchema)
            const dom = serializer.serializeNode(fnNode)
            dom.innerHTML = citationsHTML
            this.pmCits = DOMParser.fromSchema(fnSchema)
                .parse(dom, {topNode: fnNode})
                .toJSON().content
        } else {
            this.pmCits = []
        }

        // Now we do the same for the bibliography.
        const cslBib = this.citFm.bibliography
        if (cslBib && cslBib[1].length > 0) {
            this.styles.addReferenceStyle(cslBib[0])
            const bibNode = cslBibSchema.nodeFromJSON({type: "cslbib"})
            const serializer = DOMSerializer.fromSchema(cslBibSchema)
            const dom = serializer.serializeNode(bibNode)
            dom.innerHTML = cslBib[1].join("")
            this.pmBib = DOMParser.fromSchema(cslBibSchema)
                .parse(dom, {topNode: bibNode})
                .toJSON()
        }
    }
}
