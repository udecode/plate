import {BibLatexExporter} from "biblatex-csl-converter"
import download from "downloadjs"

import {shortFileTitle} from "../../common"
import {fixTables, removeHidden} from "../tools/doc_content"
import {createSlug} from "../tools/file"
import {ZipFileCreator} from "../tools/zip"
import {LatexExporterConvert} from "./convert"
import {readMe} from "./readme"
/*
 Exporter to LaTeX
*/

export class LatexExporter {
    constructor(doc, bibDB, imageDB, updated) {
        this.doc = doc
        this.docTitle = shortFileTitle(this.doc.title, this.doc.path)
        this.bibDB = bibDB
        this.imageDB = imageDB
        this.updated = updated

        this.docContent = false
        this.zipFileName = false
        this.textFiles = []
        this.httpFiles = []
    }

    init() {
        this.zipFileName = `${createSlug(this.docTitle)}.latex.zip`
        this.docContent = fixTables(removeHidden(this.doc.content))
        this.converter = new LatexExporterConvert(
            this,
            this.imageDB,
            this.bibDB,
            this.doc.settings
        )
        this.conversion = this.converter.init(this.docContent)
        if (Object.keys(this.conversion.usedBibDB).length > 0) {
            const bibExport = new BibLatexExporter(this.conversion.usedBibDB)
            this.textFiles.push({
                filename: "bibliography.bib",
                contents: bibExport.parse()
            })
        }
        this.textFiles.push({
            filename: "document.tex",
            contents: this.conversion.latex
        })
        this.textFiles.push({filename: "README.txt", contents: readMe})
        this.conversion.imageIds.forEach(id => {
            this.httpFiles.push({
                filename: this.imageDB.db[id].image.split("/").pop(),
                url: this.imageDB.db[id].image
            })
        })
        return this.createZip()
    }

    createZip() {
        const zipper = new ZipFileCreator(
            this.textFiles,
            this.httpFiles,
            undefined,
            undefined,
            this.updated
        )

        return zipper.init().then(blob => this.download(blob))
    }

    download(blob) {
        return download(blob, this.zipFileName, "application/zip")
    }
}
