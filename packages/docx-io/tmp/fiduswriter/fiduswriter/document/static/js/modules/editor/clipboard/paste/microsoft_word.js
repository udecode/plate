import {GeneralPasteHandler} from "./general"

// Microsoft Word 2016 paste handler
export class MicrosoftWordPasteHandler extends GeneralPasteHandler {
    // Remove unused content
    cleanDOM() {
        // Remove footnote list container with separator line
        const removableElements = this.dom.querySelectorAll(
            'div[style*="mso-element:footnote-list"]'
        )

        removableElements.forEach(el => el.parentNode.removeChild(el))
    }

    // Iterate over pasted nodes and their children
    iterateNode(node) {
        node = super.convertNode(node)
        if ((node.tagName === "P") & !node.firstChild) {
            node.parentNode.removeChild(node)
            return true
        } else if (node.nodeType === 8) {
            if (node.textContent === "EndFragment") {
                // End of paste content. Remove all remaining sibling nodes.
                while (node) {
                    const nextSibling = node.nextSibling
                    node.parentNode.removeChild(node)
                    node = nextSibling
                }
                return false
            } else {
                node.parentNode.removeChild(node)
                return true
            }
        }
        if (node.nodeType === 1) {
            let childNode = node.firstChild
            while (childNode) {
                const nextChildNode = childNode.nextSibling
                if (this.iterateNode(childNode)) {
                    childNode = nextChildNode
                } else {
                    childNode = false
                }
            }
            node = this.convertNode(node)
        }

        return true
    }

    // Convert an existing node to a different node, if needed.
    convertNode(node) {
        // Footnote markers (only in main pm instance):
        if (
            node.tagName === "A" &&
            node.firstChild?.tagName === "SPAN" &&
            node.firstChild?.classList.contains("MsoFootnoteReference") &&
            this.pmType === "main"
        ) {
            // Remove "#_ftn" from the selector (#_ftn1)
            const fnSelector = node.getAttribute("href")
            const fnNumber = node
                .getAttribute("href")
                .substring(5, fnSelector.length)
            const footnote = this.dom.querySelector("#ftn" + fnNumber)
            if (footnote) {
                const footnoteCounter = footnote.querySelector(
                    'a[href="#_ftnref' + fnNumber + '"]'
                )
                if (footnoteCounter) {
                    const followingNode = footnoteCounter.nextSibling
                    footnoteCounter.parentNode.removeChild(footnoteCounter)
                    if (followingNode?.nodeType === 3) {
                        // If there is a text string right after the footnote
                        // marker, remove any leading spaces.
                        followingNode.nodeValue =
                            followingNode.nodeValue.replace(/^\s+/, "")
                    }
                }
                this.footnoteMarkers.push(node)
                this.footnotes.push(footnote)
            }
        }

        return node
    }
}
