import {addAlert, deactivateWait, postJson, shortFileTitle} from "../../common"
import {extractTemplate} from "../../document_template"
import {GetImages} from "./get_images"

export class NativeImporter {
    /* Save document information into the database */
    constructor(
        doc,
        bibliography,
        images,
        otherFiles,
        user,
        importId = null,
        requestedPath = "",
        template = null
    ) {
        this.doc = doc
        this.docId = false
        this.path = false
        this.bibliography = bibliography
        this.images = images
        this.otherFiles = otherFiles // Data of image files
        this.user = user
        this.importId = importId
        this.requestedPath = requestedPath
        this.template = template
    }

    init() {
        const ImageTranslationTable = {}
        // We first create any new entries in the DB for images.
        const imageGetter = new GetImages(this.images, this.otherFiles)
        return imageGetter
            .init()
            .then(() => {
                const missingImage = Object.values(this.images).find(
                    imageEntry => !imageEntry.file
                )
                if (missingImage) {
                    addAlert(
                        "error",
                        `${gettext("Could not create document. Missing image file:")} ${missingImage.image}`
                    )
                    deactivateWait()
                    throw new Error(`Missing image file: ${missingImage.image}`)
                }
            })
            .then(() => this.createDoc())
            .then(() => {
                if (!this.docId) {
                    return Promise.reject(new Error("document not created"))
                }
                return this.saveImages(this.images, ImageTranslationTable)
            })
            .then(() => {
                // We need to change some reference numbers in the document content
                this.translateReferenceIds(ImageTranslationTable)
                // We are good to go. All the used images and bibliography entries
                // exist in the DB for this user with the same numbers.
                // We can go ahead and create the new document entry in the
                // bibliography without any changes.
                return this.saveDocument()
            })
    }

    saveImages(images, ImageTranslationTable) {
        const sendPromises = Object.values(images).map(imageEntry => {
            return postJson("/api/document/import/image/", {
                doc_id: this.docId,
                title: imageEntry.title,
                copyright: imageEntry.copyright,
                checksum: imageEntry.checksum,
                image: {
                    file: imageEntry.file,
                    filename: imageEntry.image.split("/").pop()
                }
            })
                .then(
                    ({json}) => (ImageTranslationTable[imageEntry.id] = json.id)
                )
                .catch(error => {
                    addAlert(
                        "error",
                        `${gettext("Could not save Image")} ${imageEntry.checksum}`
                    )
                    throw error
                })
        })
        return Promise.all(sendPromises)
    }

    translateReferenceIds(ImageTranslationTable) {
        function walkTree(node) {
            switch (node.type) {
                case "image":
                    if (node.attrs.image !== false) {
                        node.attrs.image =
                            ImageTranslationTable[node.attrs.image]
                    }
                    break
                case "footnote":
                    if (node.attrs?.footnote) {
                        node.attrs.footnote.forEach(childNode => {
                            walkTree(childNode)
                        })
                    }
                    break
            }
            if (node.content) {
                node.content.forEach(childNode => {
                    walkTree(childNode)
                })
            }
        }
        walkTree(this.doc.content)
    }

    createDoc() {
        const template = this.template
            ? this.template
            : extractTemplate(this.doc.content)

        // We create the document on the sever so that we have an ID for it and
        // can link the images to it.
        return postJson("/api/document/import/create/", {
            template: JSON.stringify(template.content),
            export_templates: JSON.stringify(template.exportTemplates),
            document_styles: JSON.stringify(template.documentStyles),
            files:
                template.files.map(
                    ({filename, content}) => new File([content], filename)
                ) || [],
            import_id: this.importId
                ? this.importId
                : template.content.attrs.import_id,
            template_title: template.content.attrs.template,
            path: this.requestedPath
        })
            .then(({json}) => {
                this.docId = json.id
                this.path = json.path
            })
            .catch(error => {
                addAlert("error", gettext("Could not create document"))
                throw error
            })
    }

    saveDocument() {
        return postJson("/api/document/import/", {
            id: this.docId,
            title: this.doc.title,
            content: this.doc.content,
            comments: this.doc.comments,
            bibliography: this.bibliography
        })
            .then(({json}) => {
                const docInfo = {
                    is_owner: true,
                    access_rights: "write",
                    id: this.docId
                }
                this.doc.owner = {
                    id: this.user.id,
                    name: this.user.name,
                    avatar: this.user.avatar
                }
                this.doc.is_owner = true
                this.doc.version = 0
                this.doc.comment_version = 0
                this.doc.id = this.docId
                this.doc.added = json.added
                this.doc.updated = json.updated
                this.doc.revisions = []
                this.doc.rights = "write"
                this.doc.path = this.path
                return {doc: this.doc, docInfo}
            })
            .catch(error => {
                addAlert(
                    "error",
                    `${gettext("Could not save ")} ${shortFileTitle(this.doc.title, this.doc.path)}`
                )
                throw error
            })
    }
}
