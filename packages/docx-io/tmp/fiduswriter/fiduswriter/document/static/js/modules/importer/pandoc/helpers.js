export const applyMarkToNodes = (nodes, markType, attrs = null) => {
    return nodes.map(node => {
        if (node.type === "text") {
            const mark = attrs ? {type: markType, attrs} : {type: markType}
            return {
                ...node,
                marks: [...(node.marks || []), mark]
            }
        }
        return node
    })
}

export const mergeTextNodes = nodes => {
    const mergedNodes = []
    let currentNode = null

    const areSameMarks = (marks1 = [], marks2 = []) => {
        if (marks1.length !== marks2.length) {
            return false
        }
        // Sort marks by type to ensure consistent comparison
        const sortedMarks1 = [...marks1].sort((a, b) =>
            a.type.localeCompare(b.type)
        )
        const sortedMarks2 = [...marks2].sort((a, b) =>
            a.type.localeCompare(b.type)
        )
        return sortedMarks1.every((mark, index) => {
            const mark2 = sortedMarks2[index]
            if (mark.type !== mark2.type) {
                return false
            }
            if (!mark.attrs && !mark2.attrs) {
                return true
            }
            return JSON.stringify(mark.attrs) === JSON.stringify(mark2.attrs)
        })
    }

    nodes.forEach(node => {
        if (node.type === "text") {
            if (
                currentNode &&
                currentNode.type === "text" &&
                areSameMarks(currentNode.marks, node.marks)
            ) {
                // Merge with previous node
                currentNode.text += node.text
            } else {
                // Start new node
                if (currentNode) {
                    mergedNodes.push(currentNode)
                }
                currentNode = {...node}
            }
        } else {
            if (currentNode) {
                mergedNodes.push(currentNode)
            }
            mergedNodes.push(node)
            currentNode = null
        }
    })

    if (currentNode) {
        mergedNodes.push(currentNode)
    }

    return mergedNodes
}

export const applyAnnotation = (nodes, type) => {
    return nodes.map(node => ({
        ...node,
        marks: [
            ...(node.marks || []),
            {
                type: "annotation_tag",
                attrs: {type, key: "", value: ""}
            }
        ]
    }))
}
