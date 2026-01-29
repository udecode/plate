/** Same functionality as objToNode/nodeToObj in diffDOM.js, but also offers output in XHTML format (obj2Node) and without form support. */
export const obj2Node = (obj, docType) => {
    let parser
    if (obj === undefined) {
        return false
    }
    if (docType === "xhtml") {
        parser = new window.DOMParser().parseFromString("<xml/>", "text/xml")
    } else {
        parser = document
    }

    function inner(obj, insideSvg) {
        let node
        if (obj.hasOwnProperty("t")) {
            node = parser.createTextNode(obj.t)
        } else if (obj.hasOwnProperty("co")) {
            node = parser.createComment(obj.co)
        } else {
            if (obj.nn === "svg" || insideSvg) {
                node = parser.createElementNS(
                    "http://www.w3.org/2000/svg",
                    obj.nn
                )
                insideSvg = true
            } else if (obj.nn === "script") {
                // Do not allow scripts
                return parser.createTextNode("")
            } else {
                node = parser.createElement(obj.nn.toLowerCase())
            }
            if (obj.a) {
                for (let i = 0; i < obj.a.length; i++) {
                    node.setAttribute(obj.a[i][0], obj.a[i][1])
                }
            }
            if (obj.c) {
                for (let i = 0; i < obj.c.length; i++) {
                    node.appendChild(inner(obj.c[i], insideSvg))
                }
            }
        }
        return node
    }
    return inner(obj)
}

export const node2Obj = node => {
    const obj = {}

    if (node.nodeType === 3) {
        obj.t = node.data
    } else if (node.nodeType === 8) {
        obj.co = node.data
    } else {
        obj.nn = node.nodeName
        if (node.attributes?.length > 0) {
            obj.a = []
            for (let i = 0; i < node.attributes.length; i++) {
                obj.a.push([node.attributes[i].name, node.attributes[i].value])
            }
        }
        if (node.childNodes?.length > 0) {
            obj.c = []
            for (let i = 0; i < node.childNodes.length; i++) {
                if (node.childNodes[i]) {
                    obj.c.push(node2Obj(node.childNodes[i]))
                }
            }
        }
    }
    return obj
}
