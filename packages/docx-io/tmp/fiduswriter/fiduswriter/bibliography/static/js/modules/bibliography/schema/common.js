export const text = {
    group: "inline"
}

export const literal = {
    content: "inline*",
    marks: "_",
    parseDOM: [{tag: "div.literal"}],
    toDOM() {
        return [
            "div",
            {
                class: "literal"
            },
            0
        ]
    }
}

export const variable = {
    inline: true,
    group: "inline",
    attrs: {
        variable: {default: ""}
    },
    parseDOM: [
        {
            tag: "span[data-variable]",
            getAttrs(dom) {
                return {
                    variable: dom.getAttribute("data-variable")
                }
            }
        }
    ],
    toDOM(node) {
        return [
            "span",
            {"data-variable": node.attrs.variable},
            node.attrs.variable
        ]
    }
}

export const sup = {
    parseDOM: [
        {tag: "sup"},
        {style: "vertical-align", getAttrs: value => value == "super" && null}
    ],
    toDOM() {
        return ["sup"]
    }
}

export const sub = {
    parseDOM: [
        {tag: "sub"},
        {style: "vertical-align", getAttrs: value => value == "sub" && null}
    ],
    toDOM() {
        return ["sub"]
    }
}

export const smallcaps = {
    parseDOM: [
        {tag: "span.smallcaps"},
        {
            style: "font-variant",
            getAttrs: value => value == "small-caps" && null
        }
    ],
    toDOM() {
        return ["span", {class: "smallcaps"}]
    }
}

//Currently unsupported

export const url = {
    parseDOM: [{tag: "span.url"}],
    toDOM() {
        return ["span", {class: "url"}]
    }
}

export const enquote = {
    parseDOM: [{tag: "span.enquote"}],
    toDOM() {
        return ["span", {class: "enquote"}]
    }
}
