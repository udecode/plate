import {addTracks, parseTracks} from "./track"

export const randomHeadingId = () => {
    return `H${Math.round(Math.random() * 10000000) + 1}`
}

const createHeading = level => ({
    group: "block heading",
    content: "inline*",
    marks: "_",
    defining: true,
    attrs: {
        id: {
            default: false
        },
        track: {
            default: []
        }
    },
    parseDOM: [
        {
            tag: `h${level}`,
            getAttrs(dom) {
                return {
                    id: dom.id,
                    track: parseTracks(dom.dataset.track)
                }
            }
        }
    ],
    toDOM(node) {
        const attrs = {id: node.attrs.id}
        addTracks(node, attrs)
        return [`h${level}`, attrs, 0]
    }
})

export const heading1 = createHeading(1)
export const heading2 = createHeading(2)
export const heading3 = createHeading(3)
export const heading4 = createHeading(4)
export const heading5 = createHeading(5)
export const heading6 = createHeading(6)
