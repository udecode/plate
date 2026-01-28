import download from "downloadjs"

import {shortFileTitle} from "../../common"

import {fixTables, removeHidden, textContent} from "../tools/doc_content"
import {createSlug} from "../tools/file"
import {XmlZip} from "../tools/xml_zip"

import {ODTExporterCitations} from "./citations"
import {ODTExporterFootnotes} from "./footnotes"
import {ODTExporterImages} from "./images"
import {ODTExporterMath} from "./math"
import {ODTExporterMetadata} from "./metadata"
import {ODTExporterRender} from "./render"
import {ODTExporterRichtext} from "./richtext"
import {ODTExporterStyles} from "./styles"
import {ODTExporterTracks} from "./track"

/*
Exporter to Open Document Text (LibreOffice)
*/

/*
TODO:
* - Export tracked changes of block changes and inline format changes
*    (this feature is lacking in ODT files created with LibreOffice 7.6.7.2)
*/

export class ODTExporter {
    constructor(doc, templateUrl, bibDB, imageDB, csl) {
        this.doc = doc
        this.templateUrl = templateUrl
        this.bibDB = bibDB
        this.imageDB = imageDB
        this.csl = csl

        this.pmCits = false
        this.docContent = fixTables(removeHidden(this.doc.content))
        this.docTitle = shortFileTitle(this.doc.title, this.doc.path)
        this.mimeType = "application/vnd.oasis.opendocument.text"
    }

    init() {
        const xml = new XmlZip(this.templateUrl, this.mimeType)
        const styles = new ODTExporterStyles(xml)
        const math = new ODTExporterMath(xml)
        const tracks = new ODTExporterTracks(xml)

        const metadata = new ODTExporterMetadata(
            xml,
            styles,
            this.getBaseMetadata()
        )
        const citations = new ODTExporterCitations(
            this.docContent,
            this.doc.settings,
            styles,
            this.bibDB,
            this.csl
        )
        const footnotes = new ODTExporterFootnotes(
            this.docContent,
            this.doc.settings,
            xml,
            citations,
            styles,
            this.bibDB,
            this.imageDB,
            this.csl
        )

        const images = new ODTExporterImages(this.docContent, xml, this.imageDB)

        const richtext = new ODTExporterRichtext(
            this.doc.comments,
            this.doc.settings,
            styles,
            tracks,
            footnotes,
            citations,
            math,
            images
        )

        const render = new ODTExporterRender(xml)
        return xml
            .init()
            .then(() => styles.init())
            .then(() => tracks.init())
            .then(() => math.init())
            .then(() => metadata.init())
            .then(() => citations.init())
            .then(() => render.init())
            .then(() => images.init())
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

    download(blob) {
        return download(blob, createSlug(this.docTitle) + ".odt", this.mimeType)
    }
}
