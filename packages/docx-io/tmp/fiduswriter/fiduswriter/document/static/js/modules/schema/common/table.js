import {tableNodes} from "prosemirror-tables"

import {parseTracks} from "./track"

export const table = {
    inline: false,
    group: "block",
    tableRole: "table",
    attrs: {
        id: {default: false},
        track: {default: []},
        width: {default: "100"},
        aligned: {default: "center"},
        layout: {default: "fixed"},
        category: {default: "none"},
        caption: {default: false}
    },
    content: "table_caption table_body",
    parseDOM: [
        {
            tag: "table",
            getAttrs(dom) {
                const track = parseTracks(dom.dataset.track),
                    width = dom.dataset.width,
                    aligned = width === "100" ? "center" : dom.dataset.aligned,
                    layout = dom.dataset.layout,
                    id = dom.id || dom.dataset.id
                return {
                    track,
                    width,
                    aligned,
                    layout,
                    id,
                    category: dom.dataset.category,
                    caption: !!dom.dataset.captionHidden
                }
            }
        }
    ],
    toDOM(node) {
        const attrs = {
            id: node.attrs.id,
            class: `table-${node.attrs.width} table-${node.attrs.aligned} table-${node.attrs.layout}`,
            "data-width": node.attrs.width,
            "data-aligned": node.attrs.aligned,
            "data-layout": node.attrs.layout,
            "data-category": node.attrs.category
        }
        if (node.attrs.track.length) {
            attrs["data-track"] = JSON.stringify(node.attrs.track)
        }
        if (!node.attrs.caption) {
            attrs["data-caption-hidden"] = true
        }
        return ["table", attrs, 0]
    }
}

export const table_caption = {
    content: "inline*",
    parseDOM: [{tag: "caption span.text"}],
    toDOM() {
        return [
            "caption",
            ["span", {class: "label"}],
            ["span", {class: "text"}, 0]
        ]
    }
}

const origTableNodes = tableNodes({
    cellContent: "block+"
})

export const table_body = Object.assign({}, origTableNodes["table"], {
    parseDOM: [{tag: "tbody"}],
    toDOM() {
        return ["tbody", 0]
    }
})

export const table_row = {
    content: "(table_cell | table_header)+",
    tableRole: "row",
    parseDOM: [{tag: "tr"}],
    toDOM() {
        return ["tr", 0]
    }
}

export const table_header = Object.assign(
    {marks: "annotation"},
    origTableNodes["table_header"]
)

export const table_cell = Object.assign(
    {marks: "annotation"},
    origTableNodes["table_cell"]
)

export function randomTableId() {
    return "T" + Math.round(Math.random() * 10000000) + 1
}
