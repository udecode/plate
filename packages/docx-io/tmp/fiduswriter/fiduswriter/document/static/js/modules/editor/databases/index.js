import {ModBibliographyDB} from "./bibliography"
import {ModImageDB} from "./images"

export class ModDB {
    constructor(editor) {
        editor.mod.db = this
        this.editor = editor
        new ModImageDB(this)
        new ModBibliographyDB(this)
        // assign bibDB to be used in document schema.
        this.editor.schema.cached.bibDB = this.bibDB
        // assign bibDB to be used in footnote schema.
        this.editor.mod.footnotes.fnEditor.schema.cached.bibDB = this.bibDB
        // assign image DB to be used in document schema.
        this.editor.schema.cached.imageDB = this.imageDB
        // assign image DB to be used in footnote schema.
        this.editor.mod.footnotes.fnEditor.schema.cached.imageDB = this.imageDB
    }

    // remove images/citation items that are no longer part of the document.
    clean() {
        const usedImages = [],
            usedBibs = []
        this.editor.view.state.doc.descendants(node => {
            if (node.type.name === "citation") {
                node.attrs.references.forEach(ref =>
                    usedBibs.push(Number.parseInt(ref.id))
                )
            } else if (node.type.name === "image" && node.attrs.image) {
                usedImages.push(node.attrs.image)
            }
        })

        this.editor.mod.footnotes.fnEditor.view.state.doc.descendants(node => {
            if (node.type.name === "citation") {
                node.attrs.references.forEach(ref =>
                    usedBibs.push(Number.parseInt(ref.id))
                )
            } else if (node.type.name === "image" && node.attrs.image) {
                usedImages.push(node.attrs.image)
            }
        })

        const unusedImages = Object.keys(this.imageDB.db).filter(
                value => !usedImages.includes(Number.parseInt(value))
            ),
            unusedBibs = Object.keys(this.bibDB.db).filter(
                value => !usedBibs.includes(Number.parseInt(value))
            )
        unusedImages.forEach(id => this.imageDB.deleteImage(id))
        unusedBibs.forEach(id => this.bibDB.deleteReference(id))

        const imageDbKeys = Object.keys(this.imageDB.db)
        const missingImages = usedImages.filter(id => !imageDbKeys.includes(id))
        missingImages.forEach(id => {
            const userImage = this.editor.app.imageDB.db[id]
            if (!userImage) {
                // Image is not present. Give up.
                return
            }
            const imageEntry = JSON.parse(JSON.stringify(userImage))
            this.imageDB.setImage(id, imageEntry)
        })
    }
}
