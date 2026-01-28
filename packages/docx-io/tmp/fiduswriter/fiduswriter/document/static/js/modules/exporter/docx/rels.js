// manages the .rels files. Need to initialize one for each of document.xml and footnotes.xml
import {escapeText} from "../../common"

const DEFAULT_XML = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`

const DEFAULT_HYPERLINK_STYLE = `<w:style w:type="character" w:styleId="InternetLink">
    <w:name w:val="Hyperlink"/>
    <w:rPr>
        <w:color w:val="000080"/>
        <w:u w:val="single"/>
    </w:rPr>
</w:style>`

export class DOCXExporterRels {
    constructor(xml, docName) {
        this.xml = xml
        this.docName = docName
        this.relsXML = false
        this.ctXML = false
        this.relIdCounter = -1
        this.filePath = `word/_rels/${this.docName}.xml.rels`
        this.ctFilePath = "[Content_Types].xml"
        this.styleXML = false
        this.styleFilePath = "word/styles.xml"
        this.hyperLinkStyle = false
    }

    init() {
        return Promise.all([
            this.initCt()
                .then(() => {
                    return this.xml.getXml(this.filePath, DEFAULT_XML)
                })
                .then(xml => {
                    this.relsXML = xml
                    this.findMaxRelId()
                }),
            this.xml.getXml(this.styleFilePath).then(styleXML => {
                this.styleXML = styleXML
                return Promise.resolve()
            })
        ])
    }

    initCt() {
        return this.xml.getXml(this.ctFilePath).then(ctXML => {
            this.ctXML = ctXML
            this.addRelsToCt()
            return Promise.resolve()
        })
    }

    // Go through a rels xml file and file all the listed relations
    findMaxRelId() {
        const rels = this.relsXML.queryAll("Relationship")

        rels.forEach(rel => {
            const id = Number.parseInt(
                rel.getAttribute("Id").replace(/\D/g, "")
            )
            if (id > this.relIdCounter) {
                this.relIdCounter = id
            }
        })
    }

    addRelsToCt() {
        const override = this.ctXML.query("Overrid", {
            PartName: `/${this.filePath}`
        })
        if (!override) {
            const types = this.ctXML.query("Types")
            types.appendXML(
                `<Override PartName="/${this.filePath}" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>`
            )
        }
    }

    // Add a relationship for a link
    addLinkRel(link) {
        const rels = this.relsXML.query("Relationships")
        const rId = ++this.relIdCounter
        const string = `<Relationship Id="rId${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeText(link)}" TargetMode="External"/>`
        rels.appendXML(string)
        return rId
    }

    addLinkStyle() {
        if (this.hyperLinkStyle) {
            // already added
            return
        }
        const hyperLinkEl = this.styleXML.query("w:name", {
            "w:val": "Hyperlink"
        })
        if (hyperLinkEl) {
            this.hyperLinkStyle =
                hyperLinkEl.parentElement.getAttribute("w:styleId")
        } else {
            const stylesEl = this.styleXML.query("w:styles")
            stylesEl.appendXML(DEFAULT_HYPERLINK_STYLE)
            this.hyperLinkStyle = "InternetLink"
        }
    }

    // add a relationship for an image
    addImageRel(imgFileName) {
        const rels = this.relsXML.query("Relationships")
        const rId = ++this.relIdCounter
        const string = `<Relationship Id="rId${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${escapeText(imgFileName)}"/>`
        rels.appendXML(string)
        return rId
    }

    addFootnoteRel() {
        const footnotesRel = this.relsXML.query("Relationship", {
            Target: "footnotes.xml"
        })
        if (footnotesRel) {
            // Rel exists already
            const fnRId = Number.parseInt(
                footnotesRel.getAttribute("Id").replace(/\D/g, "")
            )
            return fnRId
        }
        const rels = this.relsXML.query("Relationships")
        const rId = ++this.relIdCounter
        const string = `<Relationship Id="rId${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes" Target="footnotes.xml"/>`
        rels.appendXML(string)
        return rId
    }

    addNumberingRel() {
        const numberingRel = this.relsXML.query("Relationship", {
            Target: "numbering.xml"
        })
        if (numberingRel) {
            // Rel exists already
            const nuRId = Number.parseInt(
                numberingRel.getAttribute("Id").replace(/\D/g, "")
            )
            return nuRId
        }
        const rels = this.relsXML.query("Relationships")
        const rId = ++this.relIdCounter
        const string = `<Relationship Id="rId${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>`
        rels.appendXML(string)
        return rId
    }

    addCommentsRel() {
        const commentsRel = this.relsXML.query("Relationship", {
            Target: "comments.xml"
        })
        if (commentsRel) {
            return
        }
        const rels = this.relsXML.query("Relationships")
        const string = `<Relationship Id="rId${++this.relIdCounter}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/>`
        rels.appendXML(string)
        const override = this.ctXML.query("Override", {
            PartName: "/word/comments.xml"
        })
        if (!override) {
            const types = this.ctXML.query("Types")
            types.appendXML(
                '<Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>'
            )
        }
    }

    addCommentsExtendedRel() {
        const commentsExtendedRel = this.relsXML.query("Relationship", {
            Target: "commentsExtended.xml"
        })
        if (commentsExtendedRel) {
            return
        }
        const rels = this.relsXML.query("Relationships")
        const string = `<Relationship Id="rId${++this.relIdCounter}" Type="http://schemas.microsoft.com/office/2011/relationships/commentsExtended" Target="commentsExtended.xml"/>`
        rels.appendXML(string)
        const override = this.ctXML.query("Override", {
            PartName: "/word/commentsExtended.xml"
        })
        if (!override) {
            const types = this.ctXML.query("Types")
            types.appendXML(
                '<Override PartName="/word/commentsExtended.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtended+xml"/>'
            )
        }
    }
}
