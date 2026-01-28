import {BibLatexImporter} from "../../bibliography/import"
import {postJson} from "../../common"
import {NativeImporter} from "../native"
import {PandocConvert} from "./convert"

export class PandocImporter {
    constructor(file, user, path, importId, additionalFiles) {
        this.file = file
        this.user = user
        this.path = path
        this.importId = importId
        this.additionalFiles = additionalFiles

        this.template = null
        this.output = {
            ok: false,
            statusText: "",
            doc: null,
            docInfo: null
        }
        this.title = gettext("Untitled")
    }

    async init() {
        await this.getTemplate()
        const text = await this.file.text()
        return this.handlePandocJson(
            text,
            this.additionalFiles?.images,
            this.additionalFiles?.bibliography
        )
    }

    async getTemplate() {
        const {json} = await postJson("/api/document/get_template/", {
            import_id: this.importId
        })
        this.template = json.template
    }

    importJSON() {
        const reader = new FileReader()
        return new Promise(resolve => {
            reader.onload = () =>
                resolve(this.handlePandocJson(reader.result, {}, null))
            reader.readAsText(this.file)
        })
    }

    handlePandocJson(jsonString, images = {}, bibString = "") {
        let pandocJson
        try {
            pandocJson = JSON.parse(jsonString)
        } catch (error) {
            this.output.statusText = error.message
            return this.output
        }

        // Create a promise that will resolve with the bibliography entries
        const bibPromise = new Promise(resolve => {
            if (bibString) {
                // Create a temporary bibliography database
                const tempBibDB = {
                    saveBibEntries: data => {
                        // Instead of saving, just return the data
                        return Promise.resolve(
                            Object.entries(data).map((entry, index) => [
                                entry[0],
                                index + 1
                            ])
                        )
                    }
                }

                // Create a temporary callback that will resolve with the bibliography data
                const tempCallback = () => {}

                // Create a temporary addToList function
                const tempAddToList = () => {}

                // Use BibLatexImporter to parse the bibliography
                const importer = new BibLatexImporter(
                    bibString,
                    tempBibDB,
                    tempAddToList,
                    tempCallback,
                    false // Don't show alerts
                )

                // Store the original onMessage function
                const originalOnMessage = importer.onMessage

                // Override onMessage to capture the bibliography data
                importer.onMessage = function (message) {
                    if (message.type === "data") {
                        resolve(message.data)
                    }
                    originalOnMessage.call(this, message)
                }

                importer.init()
            } else {
                resolve({})
            }
        })

        return bibPromise.then(bibliography => {
            const converter = new PandocConvert(
                pandocJson,
                this.importId,
                this.template,
                bibliography
            )

            let convertedDoc
            try {
                convertedDoc = converter.init()
            } catch (error) {
                this.output.statusText = error.message
                console.error(error)
                return this.output
            }
            if (
                ["", "Untitled"].includes(
                    convertedDoc.content.content[0].content?.[0]?.text
                )
            ) {
                convertedDoc.content.content[0].content[0].text = this.title
            } else {
                this.title =
                    convertedDoc.content.content[0].content[0].text ||
                    this.title
            }

            // Create a new NativeImporter instance
            const nativeImporter = new NativeImporter(
                {
                    content: convertedDoc.content,
                    title: this.title,
                    comments: {},
                    settings: convertedDoc.settings
                },
                bibliography,
                converter.images, // Pass converted images
                Object.entries(images).map(([filename, blob]) => ({
                    filename,
                    content: blob
                })),
                this.user,
                null,
                this.path + this.title
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
    }
}
