import {postJson} from "../common"
import {
    MAX_FW_DOCUMENT_VERSION,
    MIN_FW_DOCUMENT_VERSION
} from "../importer/native/file"
import {FW_DOCUMENT_VERSION} from "../schema"

import {updateTemplateFile} from "./update"

const TEXT_FILENAMES = [
    "mimetype",
    "filetype-version",
    "template.json",
    "exporttemplates.json",
    "documentstyles.json"
]

export class DocumentTemplateImporter {
    constructor(file, createUrl = "/api/document/admin/create_template/") {
        this.file = file
        this.createUrl = createUrl

        this.textFiles = []
        this.otherFiles = []
        this.ok = false
        this.statusText = ""
        this.docTemplate = false
    }

    init() {
        return new Promise(resolve => {
            // use a BlobReader to read the zip from a Blob object
            const reader = new window.FileReader()
            reader.onloadend = () => {
                if (
                    reader.result.length > 60 &&
                    reader.result.substring(0, 2) === "PK"
                ) {
                    this.initZipFileRead().then(() => resolve(this))
                } else {
                    this.statusText = gettext(
                        "The uploaded file does not appear to be a Fidus Writer Template file."
                    )
                    resolve(this)
                }
            }
            reader.readAsText(this.file)
        })
    }

    initZipFileRead() {
        // Extract all the files that can be found in every fidus-file (not images)
        return import("jszip")
            .then(({default: JSZip}) => new JSZip())
            .then(zipfs => zipfs.loadAsync(this.file))
            .then(zipfs => {
                const filenames = [],
                    p = []
                let validFile = true

                zipfs.forEach(filename => filenames.push(filename))

                TEXT_FILENAMES.forEach(filename => {
                    if (filenames.indexOf(filename) === -1) {
                        validFile = false
                    }
                })
                if (!validFile) {
                    this.statusText = gettext(
                        "The uploaded file does not appear to be a Fidus Writer file."
                    )
                    return
                }

                filenames
                    .filter(filename => !filename.endsWith("/"))
                    .forEach(filename => {
                        p.push(
                            new Promise(resolve => {
                                let fileType, fileList
                                if (
                                    ["mimetype", "filetype-version"].includes(
                                        filename
                                    ) ||
                                    filename.endsWith(".json")
                                ) {
                                    fileType = "string"
                                    fileList = this.textFiles
                                } else {
                                    fileType = "blob"
                                    fileList = this.otherFiles
                                }
                                zipfs.files[filename]
                                    .async(fileType)
                                    .then(content => {
                                        fileList.push({filename, content})
                                        resolve()
                                    })
                            })
                        )
                    })
                return Promise.all(p).then(() =>
                    this.processFidusTemplateFile()
                )
            })
    }

    processFidusTemplateFile() {
        const filetypeVersion = Number.parseFloat(
                this.textFiles.find(
                    file => file.filename === "filetype-version"
                ).content
            ),
            mimeType = this.textFiles.find(
                file => file.filename === "mimetype"
            ).content
        if (
            mimeType === "application/fidustemplate+zip" &&
            filetypeVersion >= MIN_FW_DOCUMENT_VERSION &&
            filetypeVersion <= MAX_FW_DOCUMENT_VERSION
        ) {
            const template = JSON.parse(
                this.textFiles.find(file => file.filename === "template.json")
                    .content
            )
            const {title, content, exportTemplates, documentStyles} =
                updateTemplateFile(
                    template.attrs.template,
                    template,
                    JSON.parse(
                        this.textFiles.find(
                            file => file.filename === "exporttemplates.json"
                        ).content
                    ),
                    JSON.parse(
                        this.textFiles.find(
                            file => file.filename === "documentstyles.json"
                        ).content
                    ),
                    filetypeVersion
                )
            return postJson(this.createUrl, {
                title,
                content,
                import_id: content.attrs.import_id,
                export_templates: JSON.stringify(exportTemplates),
                document_styles: JSON.stringify(documentStyles),
                files: this.otherFiles.map(
                    ({filename, content}) => new File([content], filename)
                )
            }).then(({json}) => {
                this.ok = true
                this.docTemplate = {
                    id: json.id,
                    title: json.title,
                    added: json.added,
                    updated: json.updated
                }
                this.statusText = `${title} ${gettext("successfully imported.")}`
                return this
            })
        } else {
            // The file is not a Fidus Writer file.
            this.statusText =
                gettext(
                    "The uploaded file does not appear to be of the version used on this server: "
                ) + FW_DOCUMENT_VERSION
            return this
        }
    }
}
