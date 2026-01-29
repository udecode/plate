import {DOMParser, DOMSerializer, Node} from "prosemirror-model"

import {fnSchema} from "./footnotes"

// Convert the footnote HTML stored with the marker to a PM node representation of the footnote.
export const htmlToFnNode = content => {
    const footnoteDOM = document.createElement("div")
    footnoteDOM.classList.add("footnote-container")
    footnoteDOM.innerHTML = content
    const node = DOMParser.fromSchema(fnSchema).parse(footnoteDOM, {
        preserveWhitespace: true,
        topNode: false
    })
    const json = node.firstChild.toJSON().content

    return json
}

export const fnNodeToPmNode = fnContents => {
    const footnote = {
        type: "footnotecontainer",
        content: fnContents
    }
    return Node.fromJSON(fnSchema, footnote)
}

export const fnNodeToHtml = jsonString => {
    const pmNode = fnNodeToPmNode(jsonString),
        serializer = DOMSerializer.fromSchema(fnSchema)
    return serializer.serializeNode(pmNode).innerHTML
}
