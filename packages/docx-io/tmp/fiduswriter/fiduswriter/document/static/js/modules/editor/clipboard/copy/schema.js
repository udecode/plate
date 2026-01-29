// A slight modification of the document schema for the purpose of copying.
import {DOMSerializer, Node, Schema} from "prosemirror-model"

import {citation} from "../../../schema/common"
import {footnote} from "../../../schema/document/content"
import {fnSchema} from "../../../schema/footnotes"

const copyCitation = Object.assign({}, citation)

copyCitation.toDOM = node => {
    const bibDB = node.type.schema.cached.bibDB,
        bibs = {}
    node.attrs.references.forEach(ref => (bibs[ref.id] = bibDB.db[ref.id]))
    return [
        "span",
        {
            class: "citation",
            "data-format": node.attrs.format,
            "data-references": JSON.stringify(node.attrs.references),
            "data-bibs": JSON.stringify(bibs)
        }
    ]
}

/*
Citations inside of footnotes copied from the main editor also need to have bibliography
information attached to them.
*/

export const fnCopySchema = new Schema({
    marks: fnSchema.spec.marks,
    nodes: fnSchema.spec.nodes.update("citation", copyCitation)
})

const copyFootnote = Object.assign({}, footnote)

copyFootnote.toDOM = node => {
    if (!fnCopySchema.cached.bibDB) {
        fnCopySchema.cached.bibDB = fnSchema.cached.bibDB
    }
    const fnCopySerializer = DOMSerializer.fromSchema(fnCopySchema)
    const dom = document.createElement("span")
    dom.classList.add("footnote-marker")
    const pmNode = Node.fromJSON(fnCopySchema, {
        type: "footnotecontainer",
        content: node.attrs.footnote
    })
    dom.dataset.footnote = fnCopySerializer.serializeNode(pmNode).innerHTML
    dom.innerHTML = "&nbsp;"
    return dom
}

export const createDocCopySchema = docSchema => {
    const newSchema = new Schema({
        marks: docSchema.spec.marks,
        nodes: docSchema.spec.nodes
            .update("citation", copyCitation)
            .update("footnote", copyFootnote)
    })
    newSchema.cached.bibDB = docSchema.cached.bibDB
    return newSchema
}
