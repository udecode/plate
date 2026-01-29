// Annotation tag is not used by the core Fidus Writer editor, but can be used by plugins that need to add annotation capability.
export const annotation_tag = {
    attrs: {
        type: {
            default: "" // Make this a string unique to your plugin so that you avoid handling tags of other plugins. For example 'rdfa' for an rdfa-tagging plugin.
        },
        key: {
            default: "" // key or variable/tag name
        },
        value: {
            default: "" // value of variable/tag
        }
    },
    inclusive: false,
    excludes: "", // allows several tags on the same content.
    group: "annotation",
    parseDOM: [
        {
            tag: "span.annotation-tag[data-type]",
            getAttrs(dom) {
                return {
                    type: dom.dataset.type,
                    key: dom.dataset.key ? dom.dataset.key : "",
                    value: dom.dataset.value ? dom.dataset.value : ""
                }
            }
        }
    ],
    toDOM(node) {
        const attrs = {
            class: "annotation-tag",
            "data-type": node.attrs.type
        }
        if (node.attrs.key?.length) {
            attrs["data-key"] = node.attrs.key
        }
        if (node.attrs.value?.length) {
            attrs["data-value"] = node.attrs.value
        }
        return ["span", attrs]
    }
}

export const comment = {
    attrs: {
        id: {
            default: false
        }
    },
    inclusive: false,
    excludes: "",
    group: "annotation",
    parseDOM: [
        {
            tag: "span.comment[data-id]",
            getAttrs(dom) {
                return {
                    id: Number.parseInt(dom.dataset.id)
                }
            }
        }
    ],
    toDOM(node) {
        return [
            "span",
            {
                class: "comment",
                "data-id": node.attrs.id
            }
        ]
    }
}

export function randomCommentId() {
    return String(Math.floor(Math.random() * 0xffffffff))
}
