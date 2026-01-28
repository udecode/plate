export function getNonDeletedTextContent(topNode) {
    let text = ""
    topNode.descendants(node => {
        if (
            node.marks.find(mark => mark.type.name === "deletion") ||
            (node.attrs &&
                (node.attrs.track?.find(track => track.type === "deletion") ||
                    node.attrs.hidden))
        ) {
            return
        } else if (node.isBlock) {
            text += "\n"
        } else if (node.isText) {
            text += node.text
        }
    })
    return text
        .replace(/(^\s*)|(\s*$)/gi, "")
        .replace(/[ ]{2,}/gi, " ")
        .replace(/\n /, "\n")
        .replace(/\n{2,}/gi, "\n")
}
