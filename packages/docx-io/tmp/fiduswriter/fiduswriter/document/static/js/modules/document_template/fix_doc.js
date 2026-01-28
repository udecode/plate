import deepEqual from "fast-deep-equal"

import {toFullJSON} from "../schema/mini_json"

function cleanFootnotes(node, elements, marks) {
    if (node.attrs?.footnote) {
        // We remove forbidden block nodes
        node.attrs.footnote = node.attrs.footnote.filter(
            node => !elements.includes(node.type)
        )
        // We remove forbidden marks + inline nodes
        node.attrs.footnote.forEach(subNode =>
            cleanNode(subNode, elements, marks)
        )
    }
    if (node.content) {
        node.content.forEach(subNode =>
            cleanFootnotes(subNode, elements, marks)
        )
    }
}

function cleanNode(node, elements, marks) {
    if (node.marks) {
        // remove forbidden marks
        node.marks = node.marks.filter(mark => !marks.includes(mark.type))
        if (!node.marks.length) {
            delete node.marks
        }
    }
    if (node.content) {
        // remove forbidden elements
        node.content = node.content.filter(
            node => !elements.includes(node.type)
        )
        node.content.forEach(subNode => cleanNode(subNode, elements, marks))
        if (!node.content.length) {
            delete node.content
        }
    }
}

export function adjustDocToTemplate(
    miniDoc,
    miniTemplate,
    documentStyleSlugs,
    schema
) {
    const doc = toFullJSON(miniDoc, schema),
        template = toFullJSON(miniTemplate, schema),
        removedFootnoteElements = doc.attrs.footnote_elements.filter(
            element => !template.attrs.footnote_elements.includes(element)
        ),
        removedFootnoteMarks = doc.attrs.footnote_marks.filter(
            mark => !template.attrs.footnote_marks.includes(mark)
        ),
        attrs = [
            "footnote_marks",
            "footnote_elements",
            "languages",
            "citationstyles",
            "papersizes",
            "bibliography_header",
            "template",
            "import_id"
        ]
    attrs.forEach(attr => (doc.attrs[attr] = template.attrs[attr]))

    if (!doc.attrs.citationstyles.includes(doc.attrs.citationstyle)) {
        if (!doc.attrs.citationstyles.length) {
            throw new Error("Document template allows no citation styles.")
        }
        doc.attrs.citationstyle = template.attrs.citationstyle
    }

    if (!doc.attrs.languages.includes(doc.attrs.language)) {
        if (!doc.attrs.languages.length) {
            throw new Error("Document template allows no languages.")
        }
        doc.attrs.language = template.attrs.language
    }

    if (!doc.attrs.papersizes.includes(doc.attrs.papersize)) {
        if (!doc.attrs.papersizes.length) {
            throw new Error("Document template allows no paper sizes.")
        }
        doc.attrs.papersize = doc.attrs.papersizes[0]
    }

    if (!documentStyleSlugs.includes(doc.attrs.documentstyle)) {
        if (!documentStyleSlugs.length) {
            doc.attrs.documentstyle = false
        } else {
            doc.attrs.documentstyle = documentStyleSlugs[0]
        }
    }

    if (!doc.attrs.citationstyles.includes(doc.attrs.citationstyle)) {
        if (!doc.attrs.citationstyles.length) {
            throw new Error(
                "No citation styles have been defined for document template."
            )
        }
        doc.attrs.citationstyle = doc.attrs.citationstyles[0]
    }

    if (removedFootnoteMarks.length || removedFootnoteElements.length) {
        cleanFootnotes(doc, removedFootnoteElements, removedFootnoteMarks)
    }

    const oldContent = doc.content
    doc.content = [
        oldContent.shift() // The title
    ]

    let movedParts = []

    if (template.content) {
        template.content.slice(1).forEach(part => {
            let oldNode = oldContent.find(
                oldContentNode =>
                    oldContentNode.type === part.type &&
                    oldContentNode.attrs.id === part.attrs.id
            )
            if (oldNode) {
                while (oldNode !== oldContent[0]) {
                    const firstOldContent = oldContent.shift(),
                        inTemplate = !!template.content.find(
                            part =>
                                part.type === firstOldContent.type &&
                                part.attrs.id === firstOldContent.attrs.id
                        )
                    if (inTemplate) {
                        movedParts.push(firstOldContent)
                    } else if (
                        firstOldContent.content &&
                        !firstOldContent.attrs.hidden &&
                        firstOldContent.attrs.locking !== "fixed" &&
                        !(
                            // table with just first row, which is fixed.
                            (
                                firstOldContent.attrs.locking === "header" &&
                                firstOldContent.content.length === 1
                            )
                        ) &&
                        !(
                            // heading/richtext with just the default content
                            (
                                firstOldContent.attrs.elements &&
                                firstOldContent.content.length === 1 &&
                                firstOldContent.content[0].type ===
                                    firstOldContent.attrs.elements[0] &&
                                !firstOldContent.content[0].content
                            )
                        )
                    ) {
                        firstOldContent.attrs.deleted = true
                        doc.content.push(firstOldContent)
                    }
                }
                oldContent.shift()
            } else {
                oldNode = movedParts.find(
                    oldContentNode =>
                        oldContentNode.type === part.type &&
                        oldContentNode.attrs.id === part.attrs.id
                )
                if (oldNode) {
                    movedParts = movedParts.filter(
                        oldContentNode => oldContentNode !== oldNode
                    )
                }
            }
            if (oldNode) {
                const newNode = Object.assign({}, oldNode, {
                    attrs: {}
                })
                Object.entries(part.attrs).forEach(([key, value]) => {
                    newNode.attrs[key] = value
                })
                if (newNode.attrs.optional) {
                    newNode.attrs.hidden = oldNode.attrs.hidden
                }
                if (
                    (newNode.attrs.initial || oldNode.attrs.initial) &&
                    (oldNode.attrs.locking === "fixed" ||
                        deepEqual(
                            oldNode.attrs.initial || {},
                            oldNode.content || {}
                        ))
                ) {
                    if (newNode.attrs.initial) {
                        newNode.content = newNode.attrs.initial
                    } else {
                        delete newNode.content
                    }
                }

                if (oldNode.attrs.elements) {
                    // parts that define elements also define marks.
                    const removedElements = oldNode.attrs.elements.filter(
                        element => !newNode.attrs.elements.includes(element)
                    )
                    const removedMarks = oldNode.attrs.marks.filter(
                        mark => !newNode.attrs.marks.includes(mark)
                    )
                    if (removedElements.length || removedMarks.length) {
                        cleanNode(newNode, removedElements, removedMarks)
                        if (
                            !newNode.content &&
                            ["richtext_part", "heading_part"].includes(
                                part.type
                            )
                        ) {
                            newNode.content = [{type: part.attrs.elements[0]}]
                        } else if (
                            !newNode.content &&
                            part.type === "table_part"
                        ) {
                            newNode.content = [
                                {
                                    type: "table",
                                    content: [
                                        {type: "table_caption"},
                                        {
                                            type: "table_body",
                                            content: [
                                                {
                                                    type: "table_row",
                                                    content: [
                                                        {
                                                            type: "table_cell",
                                                            content: [
                                                                {
                                                                    type: "paragraph"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
                doc.content.push(newNode)
            } else {
                // The node is new and didn't exist in the old document.
                doc.content.push(JSON.parse(JSON.stringify(part)))
            }
        })
    }

    // move remaining oldContent items that were not in template.
    while (oldContent.length) {
        const newNode = oldContent.shift()
        const attrs = Object.assign({}, newNode.attrs)
        if (attrs.hasOwnProperty("deleted")) {
            newNode.attrs.deleted = true
            doc.content.push(newNode)
        }
    }
    return doc
}
