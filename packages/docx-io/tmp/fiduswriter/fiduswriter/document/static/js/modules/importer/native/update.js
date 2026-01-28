import {updateDoc} from "../../schema/convert"

export function updateFile(doc, filetypeVersion, bibliography, images) {
    // update bibliography -- currently not needed
    // bibliography = updateBib(bibliography)
    if (filetypeVersion < 3.2) {
        Object.values(images).forEach(
            image =>
                (image.copyright = {
                    holder: false,
                    year: false,
                    freeToRead: true,
                    licenses: []
                })
        )
    }
    if (filetypeVersion < 3.3) {
        doc.content = doc.contents
        delete doc.contents
    }
    if (filetypeVersion < 2.0) {
        // Before 2.0, version numbers of the doc and of the file differed.
        doc = updateDoc(doc, doc.settings["doc_version"], bibliography)
    } else {
        doc = updateDoc(doc, filetypeVersion, bibliography)
    }

    return {doc, bibliography, images}
}
