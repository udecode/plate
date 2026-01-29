import {postJson} from "../../common"
import {NativeImporter} from "../native"
import {OdtConvert} from "./convert"

export class OdtImporter {
    constructor(file, user, path, importId, additionalFiles) {
        this.file = file
        this.user = user
        this.path = path
        this.importId = importId

        this._additionalFiles = additionalFiles // We do not use these files in the ODT importer

        this.template = null
        this.output = {
            ok: false,
            statusText: "",
            doc: null,
            docInfo: null
        }
    }

    init() {
        return this.getTemplate().then(() => this.importOdt())
    }

    getTemplate() {
        return postJson("/api/document/get_template/", {
            import_id: this.importId
        }).then(({json}) => {
            this.template = json.template
        })
    }

    importOdt() {
        return import("jszip").then(({default: JSZip}) => {
            return JSZip.loadAsync(this.file).then(zip => {
                const contentPromise = zip.file("content.xml")?.async("string")
                const stylePromise = zip.file("styles.xml")?.async("string")
                const manifestPromise = zip
                    .file("META-INF/manifest.xml")
                    ?.async("string")

                if (!contentPromise) {
                    this.output.statusText = gettext(
                        "File does not contain content.xml"
                    )
                    return Promise.resolve(this.output)
                }

                // Get all images from the ODT
                const imageFiles = {}
                zip.forEach((relativePath, zipEntry) => {
                    if (relativePath.startsWith("Pictures/")) {
                        imageFiles[relativePath] = zipEntry
                    }
                })

                const imagePromises = Object.entries(imageFiles).map(
                    ([filename, zipEntry]) =>
                        zipEntry.async("blob").then(blob => ({
                            filename,
                            blob
                        }))
                )

                return Promise.all([
                    contentPromise,
                    stylePromise,
                    manifestPromise,
                    Promise.all(imagePromises)
                ]).then(([contentXml, stylesXml, manifestXml, images]) => {
                    const imageObj = {}
                    images.forEach(({filename, blob}) => {
                        imageObj[filename] = blob
                    })

                    return this.handleOdtContent(
                        contentXml,
                        stylesXml,
                        manifestXml,
                        imageObj
                    )
                })
            })
        })
    }

    handleOdtContent(contentXml, stylesXml, manifestXml, images = {}) {
        const converter = new OdtConvert(
            contentXml,
            stylesXml,
            manifestXml,
            this.importId,
            this.template,
            {} // Initial empty bibliography that will be populated during conversion
        )

        let convertedDoc
        try {
            convertedDoc = converter.init()
        } catch (error) {
            this.output.statusText = error.message
            console.error(error)
            return this.output
        }

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
            converter.bibliography || {}, // Pass the populated bibliography
            converter.images,
            Object.entries(images).map(([filename, blob]) => ({
                filename,
                content: blob
            })),
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
    }
}
