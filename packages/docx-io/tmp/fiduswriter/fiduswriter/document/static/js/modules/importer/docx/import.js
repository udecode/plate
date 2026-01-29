import {postJson} from "../../common"
import {NativeImporter} from "../native"
import {DocxConvert} from "./convert"

export class DocxImporter {
    constructor(file, user, path, importId, additionalFiles) {
        this.file = file
        this.user = user
        this.path = path
        this.importId = importId
        this._additionalFiles = additionalFiles

        this.template = null
        this.output = {
            ok: false,
            statusText: "",
            doc: null,
            docInfo: null
        }
    }

    init() {
        return this.getTemplate().then(() => this.importDocx())
    }

    getTemplate() {
        return postJson("/api/document/get_template/", {
            import_id: this.importId
        }).then(({json}) => {
            this.template = json.template
        })
    }

    importDocx() {
        return import("jszip").then(({default: JSZip}) => {
            return JSZip.loadAsync(this.file).then(zip => {
                const docx = new DocxConvert(
                    zip,
                    this.importId,
                    this.template,
                    {} // Initial empty bibliography
                )

                return docx.init().then(convertedDoc => {
                    const title =
                        convertedDoc.content.content[0].content?.[0]?.text ||
                        gettext("Untitled")
                    const nativeImporter = new NativeImporter(
                        {
                            content: convertedDoc.content,
                            title,
                            comments: convertedDoc.comments,
                            settings: convertedDoc.settings
                        },
                        {},
                        docx.images,
                        [], // No additional image files needed
                        this.user,
                        this.importId,
                        this.path + title
                    )

                    return nativeImporter
                        .init()
                        .then(({doc, docInfo}) => {
                            this.output.ok = true
                            this.output.doc = doc
                            this.output.docInfo = docInfo
                            this.output.statusText = `${doc.title} ${gettext("successfully imported.")}`
                            return this.output
                        })
                        .catch(error => {
                            this.output.statusText = error.message
                            console.error(error)
                            return this.output
                        })
                })
            })
        })
    }
}
