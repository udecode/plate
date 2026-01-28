import {parseTracks} from "./track"

export function randomFigureId() {
    return "F" + Math.round(Math.random() * 10000000) + 1
}

let imageDBBroken = false

export const figure = {
    inline: false,
    allowGapCursor: false,
    selectable: true,
    group: "block",
    attrs: {
        category: {default: "none"},
        caption: {default: false},
        id: {default: false},
        track: {default: []},
        aligned: {default: "center"},
        width: {default: "100"}
    },
    content:
        "figure_caption image|figure_caption figure_equation|image figure_caption|figure_equation figure_caption",
    parseDOM: [
        {
            tag: "figure",
            getAttrs(dom) {
                return {
                    category: dom.dataset.category,
                    caption: !!dom.dataset.captionHidden,
                    id: dom.id,
                    track: parseTracks(dom.dataset.track),
                    aligned: dom.dataset.aligned,
                    width: dom.dataset.width,
                    diff: dom.dataset.diff
                }
            }
        }
    ],
    toDOM(node) {
        const attrs = {
            id: node.attrs.id,
            class: `aligned-${node.attrs.aligned} image-width-${node.attrs.width}`,
            "data-aligned": node.attrs.aligned,
            "data-width": node.attrs.width,
            "data-category": node.attrs.category
        }
        if (!node.attrs.caption) {
            attrs["data-caption-hidden"] = true
        }
        if (node.attrs.track?.length) {
            attrs["data-track"] = JSON.stringify(node.attrs.track)
        }
        return ["figure", attrs, 0]
    }
}

export const image = {
    selectable: false,
    draggable: false,
    attrs: {
        image: {default: false}
    },
    parseDOM: [
        {
            tag: "img",
            getAttrs(dom) {
                const image = Number.parseInt(dom.dataset.image)
                return {
                    image: isNaN(image) ? false : image
                }
            }
        }
    ],
    toDOM(node) {
        const dom = document.createElement("img")
        if (node.attrs.image !== false) {
            dom.dataset.image = node.attrs.image
            if (node.type.schema.cached.imageDB) {
                if (
                    node.type.schema.cached.imageDB.db[node.attrs.image]?.image
                ) {
                    const imgSrc =
                        node.type.schema.cached.imageDB.db[node.attrs.image]
                            .image
                    dom.setAttribute("src", imgSrc)
                    dom.dataset.imageSrc =
                        node.type.schema.cached.imageDB.db[
                            node.attrs.image
                        ].image
                } else {
                    /* The image was not present in the imageDB -- possibly because a collaborator just added ut.
                    Try to reload the imageDB, but only once. If the image cannot be found in the updated
                    imageDB, do not attempt at reloading the imageDB if an image cannot be
                    found. */
                    if (imageDBBroken) {
                        dom.setAttribute("src", staticUrl("img/error.avif"))
                    } else {
                        node.type.schema.cached.imageDB.getDB().then(() => {
                            if (
                                node.type.schema.cached.imageDB.db[
                                    node.attrs.image
                                ]?.image
                            ) {
                                const imgSrc =
                                    node.type.schema.cached.imageDB.db[
                                        node.attrs.image
                                    ].image
                                dom.setAttribute("src", imgSrc)
                                dom.dataset.imageSrc =
                                    node.type.schema.cached.imageDB.db[
                                        node.attrs.image
                                    ].image
                            } else {
                                imageDBBroken = true
                            }
                        })
                    }
                }
            }
        }
        return dom
    }
}

export const figure_equation = {
    selectable: false,
    draggable: false,
    attrs: {
        equation: {
            default: false
        }
    },
    parseDOM: [
        {
            tag: "div.figure-equation[data-equation]",
            getAttrs(dom) {
                return {
                    equation: dom.dataset.equation
                }
            }
        }
    ],
    toDOM(node) {
        const dom = document.createElement("div")
        dom.dataset.equation = node.attrs.equation
        dom.classList.add("figure-equation")
        if (node.attrs.equation !== false) {
            import("mathlive").then(MathLive => {
                dom.innerHTML = MathLive.convertLatexToMarkup(
                    node.attrs.equation,
                    {
                        mathstyle: "displaystyle"
                    }
                )
            })
        }
        return dom
    }
}

export const figure_caption = {
    isolating: true,
    defining: true,
    content: "inline*",
    parseDOM: [{tag: "figcaption span.text"}],
    toDOM() {
        return [
            "figcaption",
            ["span", {class: "label"}],
            ["span", {class: "text"}, 0]
        ]
    }
}
