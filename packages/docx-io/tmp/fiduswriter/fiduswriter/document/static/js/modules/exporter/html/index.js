import download from "downloadjs"
import pretty from "pretty"

import {get, shortFileTitle} from "../../common"
import {removeHidden} from "../tools/doc_content"
import {createSlug} from "../tools/file"
import {ZipFileCreator} from "../tools/zip"

import {HTMLExporterConvert} from "./convert"
import {htmlExportTemplate} from "./templates"
/*
 Exporter to HTML
*/

export class HTMLExporter {
    constructor(
        doc,
        bibDB,
        imageDB,
        csl,
        updated,
        documentStyles,
        converterOptions = {},
        template = htmlExportTemplate
    ) {
        this.doc = doc
        this.bibDB = bibDB
        this.imageDB = imageDB
        this.csl = csl
        this.updated = updated
        this.documentStyles = documentStyles
        this.converterOptions = converterOptions

        this.docTitle = shortFileTitle(this.doc.title, this.doc.path)

        this.docContent = false
        this.zipFileName = false
        this.textFiles = []
        this.httpFiles = []
        this.includeZips = []
        this.metaData = {} // Information to be used in sub classes.
        // To override in subclasses
        this.htmlExportTemplate = template
        this.contentFileName = "document.html"
        this.fileEnding = "html.zip"
        this.mimeType = "application/zip"

        // Stylesheets will have one of:
        // * a url - which means they will be fetched before they are included as a separate file
        // * a filename and contents - which means they will be included as a separate file
        // * only contents - which means they will be incldued inside <style></style> tags in the document header
        // * only filename - which means they will be referenced as a separate file. You need to add the file yourself.
        this.styleSheets = [{url: staticUrl("css/document.css")}]
    }

    async init() {
        await this.process()
        return await this.createZip()
    }

    async process() {
        // Process the document and prepare files
        this.zipFileName = `${createSlug(this.docTitle)}.${this.fileEnding}`
        this.docContent = removeHidden(this.doc.content)

        const docStyle = this.getDocStyle(this.doc)

        if (docStyle) {
            this.styleSheets.push(docStyle)
        }
        await Promise.all(
            this.styleSheets.map(async sheet => await this.loadStyle(sheet))
        )

        this.converter = new HTMLExporterConvert(
            this.docTitle,
            this.doc.settings,
            this.docContent,
            this.htmlExportTemplate,
            this.imageDB,
            this.bibDB,
            this.csl,
            this.styleSheets,
            this.converterOptions
        )
        const {html, imageIds, metaData, extraStyleSheets} =
            await this.converter.init()
        this.metaData = metaData
        if (this.converter.features.math) {
            this.includeZips.push({
                directory: "css",
                url: staticUrl("zip/mathlive_style.zip")
            })
        }
        this.addDoc(html)
        this.addImages(imageIds)
        await Promise.all(
            extraStyleSheets.map(async sheet => await this.loadStyle(sheet))
        )
    }

    getProcessedFiles() {
        // Return the processed files and metadata. Used when using the
        // exporter in a different context than creating a zip file.
        return {
            textFiles: this.textFiles,
            httpFiles: this.httpFiles,
            includeZips: this.includeZips,
            metaData: this.metaData,
            converter: this.converter
        }
    }

    addDoc(html) {
        this.textFiles.push({
            filename: this.contentFileName,
            contents: pretty(html, {ocd: true})
        })
    }

    addImages(imageIds) {
        imageIds.forEach(id => {
            const image = this.imageDB.db[id]
            this.httpFiles.push({
                filename: `images/${image.image.split("/").pop()}`,
                url: image.image
            })
        })
    }

    getDocStyle(doc) {
        const docStyle = this.documentStyles.find(
            docStyle => docStyle.slug === doc.settings.documentstyle
        )

        // The files will be in the base directory. The filenames of
        // DocumentStyleFiles will therefore not need to replaced with their URLs.
        if (!docStyle) {
            return false
        }
        let contents = docStyle.contents
        docStyle.documentstylefile_set.forEach(
            ([_url, filename]) =>
                (contents = contents.replace(
                    new RegExp(filename, "g"),
                    `media/${filename}`
                ))
        )
        this.httpFiles = this.httpFiles.concat(
            docStyle.documentstylefile_set.map(([url, filename]) => ({
                filename: `css/media/${filename}`,
                url
            }))
        )
        return {contents, filename: `css/${docStyle.slug}.css`}
    }

    async loadStyle(sheet) {
        if (sheet.url) {
            const response = await get(sheet.url)
            const text = await response.text()
            sheet.contents = text
            sheet.filename = `css/${sheet.url.split("/").pop().split("?")[0]}`
            delete sheet.url
        }
        if (sheet.filename) {
            this.textFiles.push(sheet)
        }
        return Promise.resolve(sheet)
    }

    async createZip() {
        const zipper = new ZipFileCreator(
            this.textFiles,
            this.httpFiles,
            this.includeZips,
            this.mimeType,
            this.updated
        )
        const blob = await zipper.init()
        return this.download(blob)
    }

    download(blob) {
        return download(blob, this.zipFileName, this.mimeType)
    }
}
