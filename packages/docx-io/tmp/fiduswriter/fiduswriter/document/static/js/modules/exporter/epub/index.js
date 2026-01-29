import pretty from "pretty"
import {HTMLExporter} from "../html"

import {
    containerTemplate,
    navTemplate,
    ncxTemplate,
    opfTemplate
} from "./templates"
import {
    buildHierarchy,
    getFontMimeType,
    getImageMimeType,
    getTimestamp
} from "./tools"

export class EpubExporter extends HTMLExporter {
    constructor(doc, bibDB, imageDB, csl, updated, documentStyles) {
        super(doc, bibDB, imageDB, csl, updated, documentStyles, {
            xhtml: true,
            epub: true
        })
        // Overriden properties
        this.documentFileName = "document.xhtml"
        this.fileEnding = "epub"
        this.mimeType = "application/epub+zip"
    }

    createZip() {
        this.prefixFiles()
        this.createEPUBFiles()
        return super.createZip()
    }

    prefixFiles() {
        // prefix all files with "EPUB/"
        this.textFiles = this.textFiles.map(file =>
            Object.assign({}, file, {filename: `EPUB/${file.filename}`})
        )
        this.httpFiles = this.httpFiles.map(file =>
            Object.assign({}, file, {filename: `EPUB/${file.filename}`})
        )
        this.includeZips = this.includeZips.map(file =>
            Object.assign({}, file, {directory: `EPUB/${file.directory}`})
        )
    }

    createEPUBFiles() {
        // Generate the required EPUB-specific files using the converted content
        this.textFiles.push(
            {
                filename: "META-INF/container.xml",
                contents: pretty(containerTemplate(), {ocd: true})
            },
            {
                filename: "EPUB/document.opf",
                contents: pretty(this.createOPF(), {ocd: true})
            },
            {
                filename: "EPUB/document.ncx",
                contents: pretty(this.createNCX(), {ocd: true})
            },
            {
                filename: "EPUB/document-nav.xhtml",
                contents: pretty(this.createNav(), {ocd: true})
            }
        )
    }

    createOPF() {
        const timestamp = getTimestamp(this.updated)
        const images = this.httpFiles
            .map(file =>
                Object.assign({mimeType: getImageMimeType(file.filename)}, file)
            )
            .filter(image => image.mimeType)

        const fontFiles = this.httpFiles
            .map(file =>
                Object.assign({mimeType: getFontMimeType(file.filename)}, file)
            )
            .filter(file => file.mimeType)

        const styleSheets = this.textFiles.filter(file =>
            file.filename.endsWith(".css")
        )

        // Extract authors and keywords from metaData
        const authors = this.converter.metaData.authors.map(
            ({attrs: author}) => {
                if (author.firstname || author.lastname) {
                    const nameParts = []
                    if (author.firstname) {
                        nameParts.push(author.firstname)
                    }
                    if (author.lastname) {
                        nameParts.push(author.lastname)
                    }
                    return nameParts.join(" ")
                } else if (author.institution) {
                    return author.institution
                }
            }
        )
        return opfTemplate({
            language: this.lang,
            title: this.docTitle,
            authors,
            keywords: this.converter.metaData.keywords,
            idType: "fidus",
            id: this.doc.id,
            date: timestamp.slice(0, 10),
            modified: timestamp,
            styleSheets,
            math: this.converter.features.math,
            images,
            fontFiles,
            copyright: this.doc.settings.copyright
        })
    }

    createNCX() {
        return ncxTemplate({
            shortLang: this.shortLang,
            title: this.docTitle,
            idType: "fidus",
            id: this.doc.id,
            toc: buildHierarchy(this.converter.metaData.toc)
        })
    }

    createNav() {
        const styleSheets = this.textFiles.filter(file =>
            file.filename.endsWith(".css")
        )
        return navTemplate({
            shortLang: this.shortLang,
            toc: buildHierarchy(this.converter.metaData.toc),
            styleSheets
        })
    }
}
