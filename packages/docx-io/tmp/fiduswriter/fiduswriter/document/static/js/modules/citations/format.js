import {escapeText} from "../common"
import {citeprocSys} from "./citeproc_sys"
/*
 * Use CSL and bibDB to format all citations for the given prosemirror json citation nodes
 */

export class FormatCitations {
    constructor(
        csl,
        allCitationInfos,
        citationStyle,
        bibliographyHeader,
        bibDB,
        synchronous = false,
        lang = "en-US"
    ) {
        this.csl = csl
        this.allCitationInfos = allCitationInfos
        this.citationStyle = citationStyle
        this.bibliographyHeader = bibliographyHeader
        this.bibDB = bibDB
        this.synchronous = synchronous
        this.lang = lang
    }

    init() {
        this.bibliography = false
        this.citations = []
        this.bibFormats = []
        this.citationTexts = []
        this.citationType = ""
        this.formatAllCitations()
        return this.getFormattedCitations()
    }

    formatAllCitations() {
        this.allCitationInfos.forEach(cInfo => {
            this.bibFormats.push(cInfo.format)
            this.citations.push({
                citationItems: cInfo.references,
                properties: {
                    noteIndex: this.bibFormats.length
                }
            })
        })
    }

    get bibHTML() {
        if (!this.bibliography || !this.bibliography[0].entry_ids.length) {
            return ""
        }
        const bib = this.bibliography,
            bibHTML = bib[0].bibstart + bib[1].join("") + bib[0].bibend
        return `<h1 class="doc-bibliography-header">${escapeText(this.bibliographyHeader)}</h1>${bibHTML}`
    }

    // CSS
    get bibCSS() {
        if (!this.bibliography || !this.bibliography[0].entry_ids.length) {
            return ""
        }
        const bibInfo = this.bibliography[0]
        let css = "\n"
        css += `.csl-entry {padding-bottom: ${bibInfo.entryspacing + 1}em;}\n`
        css += `.csl-bib-body {line-height: ${bibInfo.linespacing};}\n`
        if (bibInfo.hangingindent) {
            css += `
                    .csl-entry {
                        text-indent: -0.5in;
                        padding-left: 0.5in;
                    }\n`
        } else if (bibInfo["second-field-align"] === "margin") {
            css += `
                    .csl-left-margin {
                        text-indent: -${bibInfo.maxoffset}ch;
                        width: ${bibInfo.maxoffset}ch;
                    }
                `
        } else if (bibInfo["second-field-align"] === "flush") {
            css += `
                    .csl-left-margin {
                        width: ${bibInfo.maxoffset}ch;
                    }
                `
        }
        return css
    }

    reloadCitations(missingItems) {
        // Not all citations could be found in the database.
        // Reload the database if possible, but don't cycle if no new matches are found.
        if (!this.bibDB.getDB) {
            return Promise.resolve()
        }

        return this.bibDB.getDB().then(() => {
            if (missingItems.some(item => this.bibDB.db.hasOwnProperty(item))) {
                return this.init()
            } else {
                return Promise.resolve()
            }
        })
    }

    getFormattedCitations() {
        const citeprocConnector = new citeprocSys(this.bibDB)
        if (this.synchronous) {
            const citeprocInstance = this.csl.getEngineSync(
                citeprocConnector,
                this.citationStyle,
                this.lang
            )
            if (!citeprocInstance) {
                return false
            }
            this.process(citeprocInstance)
            return true
        } else {
            return this.csl
                .getEngine(citeprocConnector, this.citationStyle, this.lang)
                .then(citeprocInstance => {
                    this.process(citeprocInstance)
                    if (citeprocConnector.missingItems.length > 0) {
                        return this.reloadCitations(
                            citeprocConnector.missingItems
                        )
                    } else {
                        return Promise.resolve()
                    }
                })
        }
    }

    process(citeprocInstance) {
        const allIds = []
        this.citations.forEach(cit =>
            cit.citationItems.forEach(item => allIds.push(String(item.id)))
        )
        citeprocInstance.updateItems(allIds)

        const inText = citeprocInstance.cslXml.dataObj.attrs.class === "in-text"
        const len = this.citations.length
        for (let i = 0; i < len; i++) {
            const citation = this.citations[i],
                citationTexts = citeprocInstance.appendCitationCluster(
                    citation,
                    true
                )
            if (inText && "textcite" == this.bibFormats[i]) {
                const items = citation.citationItems
                let newCiteText = ""

                for (let j = 0; j < items.length; j++) {
                    const onlyNameOption = [
                        {
                            id: items[j].id,
                            "author-only": 1
                        }
                    ]

                    const onlyDateOption = [
                        {
                            id: items[j].id,
                            "suppress-author": 1
                        }
                    ]

                    if (items[j].locator) {
                        onlyDateOption[0].locator = items[j].locator
                    }

                    if (items[j].prefix) {
                        onlyDateOption[0].prefix = items[j].prefix
                    }

                    if (0 < j) {
                        newCiteText +=
                            citeprocInstance.citation.opt.layout_delimiter ||
                            "; "
                    }
                    newCiteText += `${citeprocInstance.makeCitationCluster(onlyNameOption)} ${citeprocInstance.makeCitationCluster(onlyDateOption)}`
                }
                citationTexts.find(citationText => citationText[0] === i)[1] =
                    newCiteText
            }
            citationTexts.forEach(
                ([index, citationText]) =>
                    (this.citationTexts[index] = citationText)
            )
        }
        this.citationType = citeprocInstance.cslXml.dataObj.attrs.class
        this.bibliography = citeprocInstance.makeBibliography()
    }
}
