export const cross_reference = {
    inline: true,
    group: "inline",
    attrs: {
        id: {
            default: false
        },
        title: {
            default: null // title === null means that the target is gone
        }
    },
    parseDOM: [
        {
            tag: "span.cross-reference[data-id][data-title]",
            getAttrs(dom) {
                return {
                    id: dom.dataset.id,
                    title: dom.dataset.title
                }
            }
        }
    ],
    toDOM(node) {
        return [
            "span",
            {
                class: `cross-reference${node.attrs.title ? "" : " missing-target"}`,
                "data-id": node.attrs.id,
                "data-title": node.attrs.title
            },
            node.attrs.title ? node.attrs.title : gettext("Missing Target")
        ]
    }
}

export const link = {
    attrs: {
        href: {},
        title: {
            default: ""
        }
    },
    inclusive: false,
    parseDOM: [
        {
            tag: "a[href]",
            getAttrs(dom) {
                return {
                    href: dom.getAttribute("href"),
                    title: dom.getAttribute("title")
                }
            }
        }
    ],
    toDOM(node) {
        const {href, title} = node.attrs
        const attrs =
            title || href.charAt(0) !== "#"
                ? {href, title}
                : {
                      href,
                      title: gettext("Missing target"),
                      class: "missing-target"
                  }
        return ["a", attrs, 0]
    }
}

export const randomAnchorId = () => {
    return `A${Math.round(Math.random() * 10000000) + 1}`
}

export const anchor = {
    attrs: {
        id: {
            default: false
        }
    },
    inclusive: false,
    group: "annotation",
    parseDOM: [
        {
            tag: "span.anchor[data-id]",
            getAttrs(dom) {
                return {
                    id: dom.dataset.id
                }
            }
        }
    ],
    toDOM(node) {
        return [
            "span",
            {
                class: "anchor",
                "data-id": node.attrs.id
            }
        ]
    }
}
