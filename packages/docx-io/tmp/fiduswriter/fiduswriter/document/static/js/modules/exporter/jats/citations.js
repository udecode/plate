import {FormatCitations} from "../../citations/format"

import {jatsBib} from "./bibliography"

export class JATSExporterCitations {
    constructor(doc, bibDB, csl) {
        this.doc = doc
        this.bibDB = bibDB
        this.csl = csl

        this.citationTexts = []
        this.citFm = false
        this.jatsBib = ""
        this.jatsIdConvert = {}
    }

    init(citInfos) {
        this.citInfos = citInfos
        if (!citInfos.length) {
            return Promise.resolve()
        }
        return this.formatCitations()
    }

    // Citations are highly interdependent -- so we need to format them all
    // together before laying out the document.
    // We disregard the styling of the bibliography and instead create our own, JATS-specific bibliography.
    formatCitations() {
        return this.csl
            .getStyle(this.doc.settings.citationstyle)
            .then(citationstyle => {
                const modStyle = JSON.parse(JSON.stringify(citationstyle))
                const citationLayout = modStyle.children
                    .find(section => section.name === "citation")
                    .children.find(section => section.name === "layout").attrs
                const origCitationLayout = JSON.parse(
                    JSON.stringify(citationLayout)
                )
                citationLayout.prefix = "{{prefix}}"
                citationLayout.suffix = "{{suffix}}"
                citationLayout.delimiter = "{{delimiter}}"
                this.citFm = new FormatCitations(
                    this.csl,
                    this.citInfos,
                    modStyle,
                    "",
                    this.bibDB,
                    false,
                    this.doc.settings.language
                )
                return Promise.all([
                    Promise.resolve(origCitationLayout),
                    this.citFm.init()
                ])
            })
            .then(([origCitationLayout]) => {
                // We need to add xref-links to the bibliography items. And there may be more than one work cited
                // so we need to first split, then add the links and eventually put the citation back together
                // again.
                // The IDs used in the jats bibliography are 1 and up in this order
                this.citFm.bibliography[0].entry_ids.forEach((id, index) => {
                    this.jatsIdConvert[id] = index + 1
                    this.jatsBib += jatsBib(this.bibDB.db[id], index + 1)
                })
                this.citationTexts = this.citFm.citationTexts.map(
                    (ref, index) => {
                        const content = ref
                            .split("{{delimiter}}")
                            .map((citationText, conIndex) => {
                                const prefixSplit =
                                    citationText.split("{{prefix}}")
                                const prefix =
                                    prefixSplit.length > 1
                                        ? prefixSplit.shift() +
                                          (origCitationLayout.prefix || "")
                                        : ""
                                citationText = prefixSplit[0]
                                const suffixSplit =
                                    citationText.split("{{suffix}}")
                                const suffix =
                                    suffixSplit.length > 1
                                        ? (origCitationLayout.suffix || "") +
                                          suffixSplit.pop()
                                        : ""
                                citationText = suffixSplit[0]
                                const citId =
                                    this.citFm.citations[index].sortedItems[
                                        conIndex
                                    ][1].id
                                const jatsId = this.jatsIdConvert[citId]
                                return `${prefix}<xref ref-type="bibr" rid="ref-${jatsId}">${citationText}</xref>${suffix}`
                            })
                            .join(origCitationLayout.delimiter || "")
                        return content
                            .replace(/<b>/g, "<bold>")
                            .replace(/<\/b>/g, "</bold>")
                            .replace(/<i>/g, "<italic>")
                            .replace(/<\/i>/g, "</italic>")
                            .replace(
                                /<span style="font-variant:small-caps;">/g,
                                "<sc>"
                            )
                            .replace(/<\/span>/g, "</sc>")
                    }
                )
                return Promise.resolve()
            })
    }
}
