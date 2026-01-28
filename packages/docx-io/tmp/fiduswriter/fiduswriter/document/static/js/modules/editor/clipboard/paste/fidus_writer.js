import {GeneralPasteHandler} from "./general"

// Fidus Writer paste handler
export class FidusWriterPasteHandler extends GeneralPasteHandler {
    // Convert an existing node to a different node, if needed.
    convertNode(node) {
        node = super.convertNode(node)
        // Replace  nodes with other nodes to not change the number of child nodes
        // <b style="font-weight:normal;">...</b> => <span>...</span>
        if (node.tagName === "SPAN" && node.classList.contains("citation")) {
            node = this.verifyCitationNode(node)
        }
        return node
    }

    verifyCitationNode(node) {
        try {
            const bibs = JSON.parse(node.dataset.bibs),
                references = JSON.parse(node.dataset.references),
                bibDB = this.editor.mod.db.bibDB,
                idTranslations = {}
            Object.keys(bibs).forEach(bibKey => {
                const reference = bibs[bibKey]
                const oldKey = bibDB.findReference(reference)
                if (oldKey) {
                    idTranslations[bibKey] = oldKey
                } else {
                    const newKey = bibDB.addReference(reference, bibKey)
                    idTranslations[bibKey] = newKey
                }
            })

            if (
                Object.entries(idTranslations).every(
                    trans => trans[0] === trans[1]
                )
            ) {
                return node
            }
            references.forEach(ref => (ref.id = idTranslations[ref.id]))
            node.dataset.references = JSON.stringify(references)
            return node
        } catch (_error) {
            return node
        }
    }

    cleanDOM() {
        // Remove the bibliography that was added by the copy serializer
        const clipboardArtifacts = this.dom.querySelectorAll(
            ".fiduswriter-clipboard-bibliography, .fiduswriter-clipboard-footnotes"
        )
        clipboardArtifacts.forEach(el => el.parentElement.removeChild(el))
    }
}
