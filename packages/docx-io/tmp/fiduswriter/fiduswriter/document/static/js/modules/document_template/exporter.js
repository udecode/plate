import download from "downloadjs"

import {postJson} from "../common"
import {createSlug} from "../exporter/tools/file"
import {ZipFileCreator} from "../exporter/tools/zip"

export class DocumentTemplateExporter {
    constructor(
        id,
        getUrl = "/api/document/admin/get_template/",
        download = true
    ) {
        this.id = id
        this.getUrl = getUrl
        this.download = download

        this.zipFileName = false
        this.docVersion = false
        this.textFiles = []
        this.httpFiles = []
    }

    init() {
        return postJson(this.getUrl, {id: this.id}).then(({json}) => {
            this.docVersion = json.doc_version
            this.zipFileName = `${createSlug(json.title)}.fidustemplate`
            this.textFiles.push({
                filename: "template.json",
                contents: JSON.stringify(json.content)
            })
            const exportTemplates = []
            json.export_templates.forEach(template => {
                const filename = `exporttemplates/${template.fields.template_file.split("/").slice(-1)[0]}`
                this.httpFiles.push({
                    filename,
                    url: template.fields.template_file
                })
                exportTemplates.push({
                    file: filename,
                    file_type: template.fields.file_type,
                    title: template.fields.title
                })
            })
            this.textFiles.push({
                filename: "exporttemplates.json",
                contents: JSON.stringify(exportTemplates)
            })
            const documentStyles = []
            json.document_styles.forEach(docStyle => {
                const style = {
                    contents: docStyle.fields.contents,
                    slug: docStyle.fields.slug,
                    title: docStyle.fields.title,
                    files: []
                }
                docStyle.fields.documentstylefile_set.forEach(docstyleFile => {
                    const filename = `documentstyles/${docstyleFile[1]}`
                    this.httpFiles.push({
                        filename,
                        url: docstyleFile[0]
                    })
                    style.files.push(filename)
                })
                documentStyles.push(style)
            })
            this.textFiles.push({
                filename: "documentstyles.json",
                contents: JSON.stringify(documentStyles)
            })
            if (this.download) {
                return this.createZip()
            }
            return Promise.resolve()
        })
    }

    createZip() {
        this.textFiles.push({
            filename: "filetype-version",
            contents: this.docVersion
        })
        const zipper = new ZipFileCreator(
            this.textFiles,
            this.httpFiles,
            undefined,
            "application/fidustemplate+zip"
        )
        return zipper
            .init()
            .then(blob => download(blob, this.zipFileName, "application/zip"))
    }
}
