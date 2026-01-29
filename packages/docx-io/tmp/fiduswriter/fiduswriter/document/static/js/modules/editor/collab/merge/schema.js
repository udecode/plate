import {Schema} from "prosemirror-model"

export function parseDiff(str) {
    if (!str) {
        return []
    }
    let tracks
    try {
        tracks = JSON.parse(str)
    } catch (_error) {
        return []
    }
    if (!Array.isArray(tracks)) {
        return []
    }
}

export const createDiffSchema = docSchema => {
    let specNodes = docSchema.spec.nodes

    specNodes.forEach(nodeTypeName => {
        const nodeType = specNodes.get(nodeTypeName)
        if (nodeType.group !== "block") {
            return
        }
        const attrs = nodeType.attrs
        specNodes = specNodes.update(
            nodeTypeName,
            Object.assign({}, nodeType, {
                attrs: Object.assign({diffdata: {default: []}}, attrs),
                toDOM: node => {
                    let dom = nodeType.toDOM(node)
                    if (node.attrs.diffdata && node.attrs.diffdata.length) {
                        if (dom[1].class) {
                            dom[1].class =
                                dom[1].class + " " + node.attrs.diffdata[0].type
                        } else {
                            dom[1]["class"] = node.attrs.diffdata[0].type
                        }
                        dom = [
                            dom[0],
                            Object.assign(
                                {
                                    "data-diffdata": JSON.stringify(
                                        node.attrs.diffdata
                                    )
                                },
                                dom[1]
                            ),
                            dom[2]
                        ]
                    }
                    return dom
                },
                parseDOM: nodeType.parseDOM.map(tag => ({
                    tag: tag.tag,
                    getAttrs: dom => {
                        const attrs = tag.getAttrs(dom)
                        return Object.assign(
                            {
                                diffdata: parseDiff(dom.dataset.diffdata)
                            },
                            attrs
                        )
                    }
                }))
            })
        )
    })

    const diffdata = {
        attrs: {
            diff: {
                default: ""
            },
            steps: {
                default: []
            },
            from: {
                default: ""
            },
            to: {
                default: ""
            },
            markOnly: false
        },
        inclusive: false,
        parseDOM: [
            {
                tag: "span.diff",
                getAttrs(dom) {
                    return {
                        diff: dom.dataset.diff,
                        steps: dom.dataset.steps
                    }
                }
            }
        ],
        toDOM(node) {
            return [
                "span",
                {
                    class: `diff ${node.attrs.diff}`,
                    "data-diff": node.attrs.diff,
                    "data-steps": node.attrs.steps,
                    "data-from": node.attrs.from,
                    "data-to": node.attrs.to,
                    "data-markOnly": node.attrs.markOnly
                }
            ]
        }
    }

    const spec = {
        nodes: specNodes,
        marks: docSchema.spec.marks.addToEnd("diffdata", diffdata)
    }

    // Update link mark toDom to render a span instead of anchor tag
    // Since editable false PM Editor treats anchor tag as a normal a tag
    // and redirects
    const linkMarkSpec = spec.marks.get("link")
    spec.marks = spec.marks.update(
        "link",
        Object.assign({}, linkMarkSpec, {
            toDOM: node => {
                const dom = linkMarkSpec.toDOM(node)
                dom[0] = "span"
                return dom
            }
        })
    )

    return new Schema(spec)
}
