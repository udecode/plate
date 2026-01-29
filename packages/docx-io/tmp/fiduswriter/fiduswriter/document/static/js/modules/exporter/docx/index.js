import download from "downloadjs"

import {shortFileTitle} from "../../common"
import {fixTables, removeHidden, textContent} from "../tools/doc_content"
import {createSlug} from "../tools/file"
import {XmlZip} from "../tools/xml_zip"
import {DOCXExporterCitations} from "./citations"
import {DOCXExporterComments} from "./comments"
import {DOCXExporterFootnotes} from "./footnotes"
import {DOCXExporterImages} from "./images"
import {DOCXExporterLists} from "./lists"
import {DOCXExporterMath} from "./math"
import {DOCXExporterMetadata} from "./metadata"
import {DOCXExporterRels} from "./rels"
import {DOCXExporterRender} from "./render"
import {DOCXExporterRichtext} from "./richtext"
import {DOCXExporterTables} from "./tables"
import {moveFootnoteComments} from "./tools"

/*
Exporter to Office Open XML docx (Microsoft Word)
*/

/*
TODO:
* - Remove comments
* - Export document language
* - Templating of tag/contributor output
*/

export class DOCXExporter {
    constructor(doc, templateUrl, bibDB, imageDB, csl) {
        this.doc = doc
        this.templateUrl = templateUrl
        this.bibDB = bibDB
        this.imageDB = imageDB
        this.csl = csl

        this.docTitle = shortFileTitle(this.doc.title, this.doc.path)
        this.mimeType =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        this.docContent = moveFootnoteComments(
            fixTables(removeHidden(this.doc.content))
        )
    }

    init() {
        const xml = new XmlZip(this.templateUrl, this.mimeType)

        const tables = new DOCXExporterTables(xml)
        const math = new DOCXExporterMath(xml)
        const render = new DOCXExporterRender(xml)
        const rels = new DOCXExporterRels(xml, "document")
        const metadata = new DOCXExporterMetadata(xml, this.getBaseMetadata())

        const images = new DOCXExporterImages(
            this.docContent,
            this.imageDB,
            xml,
            rels
        )
        const lists = new DOCXExporterLists(this.docContent, xml, rels)
        const citations = new DOCXExporterCitations(
            this.docContent,
            this.doc.settings,
            this.bibDB,
            this.csl,
            xml
        )

        const footnotes = new DOCXExporterFootnotes(
            this.doc,
            this.docContent,
            this.doc.settings,
            this.imageDB,
            this.bibDB,
            xml,
            citations,
            this.csl,
            lists,
            math,
            tables,
            rels
        )

        const richtext = new DOCXExporterRichtext(
            this.doc,
            this.doc.settings,
            lists,
            footnotes,
            math,
            tables,
            rels,
            citations,
            images
        )

        const comments = new DOCXExporterComments(
            this.docContent,
            this.doc.comments,
            xml,
            rels,
            richtext
        )

        return xml
            .init()
            .then(() => citations.init())
            .then(() => metadata.init())
            .then(() => tables.init())
            .then(() => math.init())
            .then(() => render.init())
            .then(() => rels.init())
            .then(() => images.init())
            .then(() => comments.init())
            .then(() => lists.init())
            .then(() => footnotes.init())
            .then(() => {
                const pmBib = footnotes.pmBib || citations.pmBib
                render.render(
                    this.docContent,
                    pmBib,
                    this.doc.settings,
                    richtext,
                    citations
                )
                return xml.prepareBlob()
            })
            .then(blob => this.download(blob))
    }

    download(blob) {
        return download(
            blob,
            createSlug(this.docTitle) + ".docx",
            this.mimeType
        )
    }

    getBaseMetadata() {
        return {
            authors: this.docContent.content.reduce((authors, part) => {
                if (
                    part.type === "contributors_part" &&
                    part.attrs.metadata === "authors" &&
                    part.content
                ) {
                    return authors.concat(
                        part.content.map(authorNode => authorNode.attrs)
                    )
                } else {
                    return authors
                }
            }, []),
            keywords: this.docContent.content.reduce((keywords, part) => {
                if (
                    part.type === "tags_part" &&
                    part.attrs.metadata === "keywords" &&
                    part.content
                ) {
                    return keywords.concat(
                        part.content.map(keywordNode => keywordNode.attrs.tag)
                    )
                } else {
                    return keywords
                }
            }, []),
            title: textContent(this.docContent.content[0]),
            language: this.doc.settings.language
        }
    }
}
