import {updateDoc} from "../schema/convert"

export function updateTemplateFile(
    title,
    content,
    exportTemplates,
    documentStyles,
    filetypeVersion
) {
    // This function can be modified and used in case updting the template file is different
    // from updating the content itself some time in the future.

    const oldDoc = {
        content,
        diffs: [],
        bibliography: {},
        comments: {},
        title,
        version: 1,
        id: 1
    }
    const doc = updateDoc(oldDoc, filetypeVersion)
    return {title, content: doc.content, exportTemplates, documentStyles}
}
