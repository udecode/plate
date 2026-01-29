import {descendantNodes} from "../tools/doc_content"

export const moveFootnoteComments = topNode => {
    // DOCX doesn't support comments in footnotes. So we copy all comment marks from footnote
    // to parent node.
    descendantNodes(topNode).forEach(node => {
        if (node.type === "footnote") {
            descendantNodes({
                type: "footnotecontainer",
                content: node.attrs.footnote
            }).forEach(fnNode => {
                if (fnNode.marks) {
                    fnNode.marks
                        .filter(mark => mark.type === "comment")
                        .forEach(mark => {
                            if (!node.marks) {
                                node.marks = []
                            }
                            node.marks.push(mark)
                        })
                }
            })
        }
    })

    return topNode
}

export const translateBlockType = blockType => {
    switch (blockType) {
        case "heading1":
            return "Heading1"
        case "heading2":
            return "Heading2"
        case "heading3":
            return "Heading3"
        case "heading4":
            return "Heading4"
        case "heading5":
            return "Heading5"
        case "heading6":
            return "Heading6"
        case "code_block":
            return "Code"
        case "blockquote":
            return "Quote"
        default:
            return "Normal"
    }
}
