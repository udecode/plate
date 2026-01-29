import {parseTracks} from "./track"

// :: NodeSpec A plain paragraph textblock. Represented in the DOM
// as a `<p>` element.
export const paragraph = {
    group: "block",
    content: "inline*",
    attrs: {
        track: {
            default: []
        }
    },
    parseDOM: [
        {
            tag: "p",
            getAttrs(dom) {
                return {
                    track: parseTracks(dom.dataset.track)
                }
            }
        }
    ],
    toDOM(node) {
        const attrs =
            node.attrs.track && node.attrs.track.length
                ? {"data-track": JSON.stringify(node.attrs.track)}
                : {}
        return ["p", attrs, 0]
    }
}

// :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
export const blockquote = {
    content: "block+",
    group: "block",
    attrs: {
        track: {
            default: []
        }
    },
    marks: "annotation",
    defining: true,
    parseDOM: [
        {
            tag: "blockquote",
            getAttrs(dom) {
                return {
                    track: parseTracks(dom.dataset.track)
                }
            }
        }
    ],
    toDOM(node) {
        const attrs =
            node.attrs.track && node.attrs.track.length
                ? {"data-track": JSON.stringify(node.attrs.track)}
                : {}
        return ["blockquote", attrs, 0]
    }
}

// :: NodeSpec A horizontal rule (`<hr>`).
export const horizontal_rule = {
    group: "block",
    attrs: {
        track: {
            default: []
        }
    },
    parseDOM: [
        {
            tag: "hr",
            getAttrs(dom) {
                return {
                    track: parseTracks(dom.dataset.track)
                }
            }
        }
    ],
    toDOM(node) {
        const attrs =
            node.attrs.track && node.attrs.track.length
                ? {"data-track": JSON.stringify(node.attrs.track)}
                : {}
        return ["hr", attrs]
    }
}

export const underline = {
    parseDOM: [{tag: "span.underline"}],
    toDOM() {
        return ["span", {class: "underline"}, 0]
    }
}
