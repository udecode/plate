import {Plugin, PluginKey} from "prosemirror-state"
import {Decoration, DecorationSet} from "prosemirror-view"
import {escapeText, findTarget} from "../../common"

const key = new PluginKey("tocRender")

function getTocItems(decorations) {
    let tocItems

    decorations.find(deco => {
        if (deco.spec.tocItems) {
            tocItems = deco.spec.tocItems
            return true
        }
        return false
    })
    return tocItems
}

function tocHTML(tocItems, title) {
    return `<h1 class="toc">${escapeText(title)}</h1>
    ${tocItems
        .map(item => {
            const level = item.type.name.substr(-1)
            return `<h${level}><a href="#${item.id}">${escapeText(item.textContent)}</a></h${level}>`
        })
        .join("")}`
}

class ToCView {
    constructor(node, _view, _getPos, decorations, options) {
        this.dom = document.createElement("div")
        this.dom.classList.add("doc-part", "table-of-contents")
        if (node.attrs.hidden) {
            this.dom.dataset.hidden = "true"
        }
        const tocItems = getTocItems(decorations) || []
        this.dom.innerHTML = tocHTML(tocItems, node.attrs.title)
        this.dom.addEventListener("click", event => {
            const el = {}
            switch (true) {
                case findTarget(event, "a", el):
                    event.preventDefault()
                    event.stopImmediatePropagation()
                    el.id = el.target.getAttribute("href").slice(1)
                    options.editor.scrollIdIntoView(el.id)
                    break
            }
        })
    }

    update(node, decorations) {
        const tocItems = getTocItems(decorations)
        if (!tocItems) {
            return
        }
        this.dom.innerHTML = tocHTML(tocItems, node.attrs.title)
    }
}

function getDecos(state) {
    const decoPos = [],
        tocItems = []
    let decos = DecorationSet.empty
    state.doc.descendants((node, offset) => {
        if (node.attrs?.hidden) {
            return false
        } else if (node.type.name === "table_of_contents") {
            decoPos.push(offset)
        } else if (node.type.groups.includes("heading")) {
            tocItems.push({
                id: node.attrs.id,
                textContent: node.textContent,
                type: node.type
            })
        }
    })
    if (decoPos.length) {
        decos = DecorationSet.create(
            state.doc,
            decoPos.map(pos =>
                Decoration.node(
                    pos,
                    pos + 1,
                    {}, // We don't actually need to change anything about the node
                    {tocItems} // We communicate the toc items to the node view
                )
            )
        )
    }
    return decos
}

export const tocRenderPlugin = options =>
    new Plugin({
        key,
        state: {
            init(_config, state) {
                const decos = getDecos(state)
                return {decos}
            },
            apply(tr, _prev, oldState, state) {
                let {decos} = this.getState(oldState),
                    updateToc = false
                tr.mapping.maps.forEach((map, index) =>
                    map.forEach((oldStart, oldEnd, newStart, newEnd) => {
                        const oldDoc = tr.docs[index],
                            newDoc = tr.docs[index + 1] || tr.doc // tr.doc if it is the last step
                        let hidden = false

                        oldDoc.nodesBetween(oldStart, oldEnd, node => {
                            if (updateToc) {
                                return false
                            } else if (node.type.groups.includes("heading")) {
                                updateToc = true
                            } else if (node.attrs?.hidden) {
                                hidden = true // was hidden
                            }
                            return true
                        })
                        newDoc.nodesBetween(newStart, newEnd, node => {
                            if (updateToc) {
                                return false
                            } else if (node.type.groups.includes("heading")) {
                                updateToc = true
                            } else if (node.attrs?.hidden) {
                                hidden = hidden ? false : true // is hidden
                            }
                        })
                        if (hidden) {
                            // hidden has changed
                            updateToc = true
                        }
                    })
                )
                // There has been a change that should cause a table of contents update.
                // So we place a decoration around each toc-node which should cause it to
                // update.
                // See https://discuss.prosemirror.net/t/how-can-i-communicate-from-a-plugin-to-a-custom-nodeview/952/2

                if (updateToc) {
                    decos = getDecos(state)
                } else {
                    decos = decos.map(tr.mapping, tr.doc)
                }

                return {decos}
            }
        },
        props: {
            decorations(state) {
                const {decos} = this.getState(state)
                return decos
            },
            nodeViews: {
                table_of_contents: (node, view, getPos, decorations) =>
                    new ToCView(node, view, getPos, decorations, options)
            }
        }
    })
