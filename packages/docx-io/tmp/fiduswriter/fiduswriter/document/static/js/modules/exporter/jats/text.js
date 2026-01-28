import {escapeText} from "../../common"

export function convertTexts(nodeList) {
    return nodeList.map(node => convertText(node)).join("")
}

export function convertText(node) {
    let start = ""
    let end = ""
    let strong, em, underline, hyperlink, anchor
    // Check for hyperlink, bold/strong, italic/em and underline
    if (node.marks) {
        strong = node.marks.find(mark => mark.type === "strong")
        em = node.marks.find(mark => mark.type === "em")
        underline = node.marks.find(mark => mark.type === "underline")
        hyperlink = node.marks.find(mark => mark.type === "link")
        anchor = node.marks.find(mark => mark.type === "anchor")
    }
    let attrs = anchor ? ` id="${anchor.attrs.id}"` : ""
    if (em) {
        start += `<italic${attrs}>`
        end = "</italic>" + end
        attrs = ""
    }
    if (strong) {
        start += `<bold${attrs}>`
        end = "</bold>" + end
        attrs = ""
    }
    if (underline) {
        start += `<underline${attrs}>`
        end = "</underline>" + end
        attrs = ""
    }
    if (hyperlink) {
        const href = hyperlink.attrs.href
        if (href[0] === "#") {
            // Internal link
            start += `<xref rid="${href.substring(1)}"${attrs}>`
            end = "</xref>" + end
        } else {
            // External link
            start += `<ext-link xlink:href="${escapeText(href)}" ext-link-type="uri" xlink:title="${escapeText(hyperlink.attrs.title)}"${attrs}>`
            end = "</ext-link>" + end
        }
        attrs = ""
    }
    if (attrs) {
        start += `<named-content${attrs}>`
        end = "</named-content>" + end
        attrs = ""
    }
    return start + escapeText(node.text) + end
}
