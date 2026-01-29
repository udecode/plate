import {DocumentTemplateExporter} from "../../document_template"
import {FW_DOCUMENT_VERSION} from "../../schema"
import {ZipFileCreator} from "../tools/zip"
/** Create a zip blob for a shrunk fidus file.
 */

export class ZipFidus {
    constructor(
        docId,
        doc,
        shrunkImageDB,
        shrunkBibDB,
        httpFiles,
        includeTemplate = true
    ) {
        this.docId = docId
        this.doc = doc
        this.shrunkImageDB = shrunkImageDB
        this.shrunkBibDB = shrunkBibDB
        this.httpFiles = httpFiles
        this.includeTemplate = includeTemplate

        this.textFiles = [
            {
                filename: "document.json",
                contents: JSON.stringify(this.doc)
            },
            {
                filename: "images.json",
                contents: JSON.stringify(this.shrunkImageDB)
            },
            {
                filename: "bibliography.json",
                contents: JSON.stringify(this.shrunkBibDB)
            },
            {
                filename: "filetype-version",
                contents: FW_DOCUMENT_VERSION
            }
        ]
    }

    init() {
        if (!this.includeTemplate) {
            return this.createZip()
        }
        const templateExporter = new DocumentTemplateExporter(
            this.docId,
            "/api/document/get_template_for_doc/",
            false
        )
        return templateExporter.init().then(() => {
            this.textFiles = this.textFiles.concat(templateExporter.textFiles)
            this.httpFiles = this.httpFiles.concat(templateExporter.httpFiles)
            return this.createZip()
        })
    }

    createZip() {
        const zipper = new ZipFileCreator(
            this.textFiles,
            this.httpFiles,
            [],
            "application/fidus+zip"
        )
        return zipper.init()
    }
}
