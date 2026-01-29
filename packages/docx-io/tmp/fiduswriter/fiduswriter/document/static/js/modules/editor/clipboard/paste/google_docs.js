import {GeneralPasteHandler} from "./general"

// Google Docs (the writing component) paste handler
export class GoogleDocsPasteHandler extends GeneralPasteHandler {
    // Convert an existing node to a different node, if needed.
    convertNode(node) {
        node = super.convertNode(node)
        // Replace  nodes with other nodes to not change the number of child nodes
        // <b style="font-weight:normal;">...</b> => <span>...</span>
        if (node.tagName === "B" && node.style.fontWeight === "normal") {
            node = this.neutralizeInlineNode(node)
        }
        return node
    }

    // Replace any type of inline node with a span node.
    neutralizeInlineNode(node) {
        const newNode = document.createElement("span")
        while (node.firstChild) {
            newNode.appendChild(node.firstChild)
        }
        node.parentNode.replaceChild(newNode, node)

        return newNode
    }
}
