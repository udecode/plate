import {descendantNodes} from "../tools/doc_content"
import {DOCXExporterCitations} from "./citations"
import {DOCXExporterImages} from "./images"
import {DOCXExporterLists} from "./lists"
import {DOCXExporterRels} from "./rels"
import {DOCXExporterRichtext} from "./richtext"

const DEFAULT_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:footnotes xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" mc:Ignorable="w14 wp14">
        <w:footnote w:id="0" w:type="separator">
            <w:p>
                <w:r>
                    <w:separator />
                </w:r>
            </w:p>
        </w:footnote>
        <w:footnote w:id="1" w:type="continuationSeparator">
            <w:p>
                <w:r>
                    <w:continuationSeparator />
                </w:r>
            </w:p>
        </w:footnote>
    </w:footnotes>`

const DEFAULT_SETTINGS_XML = `<w:footnotePr>
        <w:numFmt w:val="decimal"/>
        <w:footnote w:id="0"/>
        <w:footnote w:id="1"/>
    </w:footnotePr>`

const DEFAULT_STYLE_FOOTNOTE = `<w:style w:type="paragraph" w:styleId="Footnote">
        <w:name w:val="Footnote Text" />
        <w:basedOn w:val="Normal" />
        <w:pPr>
            <w:suppressLineNumbers />
            <w:ind w:left="339" w:hanging="339" />
        </w:pPr>
        <w:rPr>
            <w:sz w:val="20" />
            <w:szCs w:val="20" />
        </w:rPr>
    </w:style>`

const DEFAULT_STYLE_FOOTNOTE_ANCHOR = `
    <w:style w:type="character" w:styleId="FootnoteAnchor">
        <w:name w:val="Footnote Anchor" />
        <w:rPr>
            <w:vertAlign w:val="superscript" />
        </w:rPr>
    </w:style>
    `

export class DOCXExporterFootnotes {
    constructor(
        doc,
        docContent,
        settings,
        imageDB,
        bibDB,
        xml,
        citations,
        csl,
        lists,
        math,
        tables,
        rels
    ) {
        this.doc = doc
        this.docContent = docContent
        this.settings = settings
        this.imageDB = imageDB
        this.bibDB = bibDB
        this.xml = xml
        this.citations = citations
        this.csl = csl
        this.lists = lists
        this.math = math
        this.tables = tables
        this.rels = rels

        this.pmBib = false
        this.fnPmJSON = false
        this.images = false
        this.augmentedCitations = false
        this.footnotes = [] // footnotes
        this.fnXML = false
        this.ctXML = false
        this.styleXML = false
        this.filePath = "word/footnotes.xml"
        this.ctFilePath = "[Content_Types].xml"
        this.settingsFilePath = "word/settings.xml"
        this.styleFilePath = "word/styles.xml"
    }

    init() {
        this.findFootnotes()
        if (
            this.footnotes.length ||
            (this.citations.citFm.citationType === "note" &&
                this.citations.citInfos.length)
        ) {
            this.convertFootnotes()
            this.fnRels = new DOCXExporterRels(this.xml, "footnotes")
            // Include the citinfos from the main body document so that they will be
            // used for calculating the bibliography as well
            this.augmentedCitations = new DOCXExporterCitations(
                this.fnPmJSON,
                this.settings,
                this.bibDB,
                this.csl,
                this.xml,
                this.citations.citInfos
            )

            this.images = new DOCXExporterImages(
                this.fnPmJSON,
                this.imageDB,
                this.xml,
                this.fnRels
            )
            this.lists = new DOCXExporterLists(
                this.fnPmJSON,
                this.xml,
                this.fnRels
            )

            return this.augmentedCitations
                .init()
                .then(() => {
                    // Replace the main bibliography with the new one that
                    // includes both citations in main document
                    // and in the footnotes.
                    this.pmBib = this.augmentedCitations.pmBib
                    return this.fnRels.init()
                })
                .then(() => this.images.init())
                .then(() => this.lists.init())
                .then(() => this.initCt())
                .then(() => this.setSettings())
                .then(() => this.addStyles())
                .then(() => this.createXml())
        } else {
            // No footnotes were found.
            return Promise.resolve()
        }
    }

    initCt() {
        return this.xml.getXml(this.ctFilePath).then(ctXML => {
            this.ctXML = ctXML
            this.addRelsToCt()
            return Promise.resolve()
        })
    }

    addRelsToCt() {
        const override = this.ctXML.query("Override", {
            PartName: `/${this.filePath}`
        })
        if (!override) {
            const types = this.ctXML.query("Types")
            types.appendXML(
                `<Override PartName="/${this.filePath}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>`
            )
        }
    }

    addStyles() {
        return this.xml.getXml(this.styleFilePath).then(styleXML => {
            this.styleXML = styleXML
            this.addStyle("Footnote", DEFAULT_STYLE_FOOTNOTE)
            this.addStyle("FootnoteAnchor", DEFAULT_STYLE_FOOTNOTE_ANCHOR)
            return Promise.resolve()
        })
    }

    addStyle(styleName, xml) {
        if (!this.styleXML.query("w:style", {"w:styleId": styleName})) {
            const stylesEl = this.styleXML.query("w:styles")
            stylesEl.appendXML(xml)
        }
    }

    findFootnotes() {
        descendantNodes(this.docContent).forEach(node => {
            if (node.type === "footnote") {
                this.footnotes.push(node.attrs.footnote)
            }
        })
    }

    convertFootnotes() {
        const fnContent = []
        this.footnotes.forEach(footnote => {
            fnContent.push({
                type: "footnotecontainer",
                content: footnote
            })
        })
        this.fnPmJSON = {
            type: "doc",
            content: fnContent
        }
    }

    createXml() {
        this.richtext = new DOCXExporterRichtext(
            this.doc,
            this.lists,
            this,
            this.settings,
            this.math,
            this.tables,
            this.fnRels,
            this.augmentedCitations,
            this.images
        )
        this.fnXML = this.richtext.transformRichtext(this.fnPmJSON)
        // TODO: add max dimensions
        this.rels.addFootnoteRel()
        return this.xml.getXml(this.filePath, DEFAULT_XML).then(xml => {
            const footnotesEl = xml.query("w:footnotes")
            footnotesEl.appendXML(this.fnXML)
            this.xml = xml
        })
    }

    setSettings() {
        return this.xml.getXml(this.settingsFilePath).then(settingsXML => {
            const footnotePr = settingsXML.query("w:footnotePr")
            if (!footnotePr) {
                const settingsEl = settingsXML.query("w:settings")
                settingsEl.appendXML(DEFAULT_SETTINGS_XML)
            }
            this.settingsXML = settingsXML
            return Promise.resolve()
        })
    }
}
