import {NodeSelection, Plugin, PluginKey} from "prosemirror-state"
import {RemoveMarkStep} from "prosemirror-transform"
import {Decoration, DecorationSet} from "prosemirror-view"

import {addAlert, noSpaceTmp} from "../../common"
import {
    randomFigureId,
    randomHeadingId,
    randomListId,
    randomTableId
} from "../../schema/common"
import {CATS} from "../../schema/i18n"
import {LinkDialog} from "../dialogs"

const key = new PluginKey("links")

const copyLink = href => {
    const textarea = document.createElement("textarea")
    textarea.textContent = href
    textarea.style.position = "fixed" // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea)
    textarea.select()
    try {
        document.execCommand("copy") // Security exception may be thrown by some browsers.
        document.body.removeChild(textarea)
        addAlert("info", gettext("Link copied to clipboard"))
    } catch (_ex) {
        addAlert(
            "info",
            gettext("Copy to clipboard failed. Please copy manually.")
        )
    }
}

const nonDeletedTextContent = node => {
    let text = ""
    node.descendants(subNode => {
        if (
            subNode.isText &&
            !subNode.marks.find(mark => mark.type.name === "deletion")
        ) {
            text += subNode.text
        }
    })
    return text
}

export const getInternalTargets = (state, language, editor) => {
    const internalTargets = []
    const anchors = {}
    const categories = {}

    state.doc.descendants(node => {
        if (node.attrs.track?.find(track => track.type === "deletion")) {
            return true
        }
        if (node.type.groups.includes("heading")) {
            const textContent = nonDeletedTextContent(node)
            if (textContent.length) {
                internalTargets.push({
                    id: node.attrs.id,
                    text: textContent
                })
            }
            return true
        }

        if (
            ["figure", "table"].includes(node.type.name) &&
            node.attrs.category &&
            node.attrs.category !== "none"
        ) {
            if (!categories[node.attrs.category]) {
                categories[node.attrs.category] = 0
            }
            categories[node.attrs.category]++

            internalTargets.push({
                id: node.attrs.id,
                text:
                    editor === "main"
                        ? `${CATS[node.attrs.category][language]} ${categories[node.attrs.category]}`
                        : `${CATS[node.attrs.category][language]} ${categories[node.attrs.category]}A`
            })
            return true
        }
        if (node.type.name === "text") {
            const anchor = node.marks.find(mark => mark.type.name === "anchor")
            if (anchor) {
                anchors[anchor.attrs.id] =
                    (anchors[anchor.attrs.id] || "") + node.text
            }
        }
    })
    Object.entries(anchors).forEach(([id, text]) =>
        internalTargets.push({id, text})
    )

    return internalTargets
}

export const linksPlugin = options => {
    function getUrl(state, oldState, oldUrl) {
        const id = state.selection.$head.parent.attrs.id,
            mark = state.selection.$head
                .marks()
                .find(mark => mark.type.name === "anchor")
        let newUrl = oldUrl.split("#")[0]
        if (mark) {
            newUrl += `#${mark.attrs.id}`
        } else if (id) {
            newUrl += `#${id}`
        }
        const changed = oldUrl === newUrl ? false : true
        // TODO: Should the following be moved to a view?
        // Not sure if this counts as a DOM update.
        if (changed && options.editor.currentView.state === oldState) {
            window.history.replaceState("", "", newUrl)
        }
        return newUrl
    }

    function getLinkMark(state) {
        return state.selection.$head
            .marks()
            .find(mark => mark.type.name === "link")
    }

    function getAnchorMark(state) {
        return state.selection.$head
            .marks()
            .find(mark => mark.type.name === "anchor")
    }

    function getCrossReference(state) {
        return state.selection instanceof NodeSelection
            ? state.selection.node.type.name == "cross_reference"
                ? state.selection.node
                : undefined
            : undefined
    }

    function getDecos(state) {
        const $head = state.selection.$head
        const currentMarks = [],
            linkMark = $head.marks().find(mark => mark.type.name === "link"),
            anchorMark = $head.marks().find(mark => mark.type.name === "anchor")
        const crossRef =
            state.selection instanceof NodeSelection
                ? state.selection.node.type.name == "cross_reference"
                    ? state.selection.node
                    : undefined
                : undefined

        if (linkMark) {
            currentMarks.push(linkMark)
        }
        if (anchorMark) {
            currentMarks.push(anchorMark)
        }
        if (crossRef) {
            currentMarks.push(crossRef)
        }
        if (!currentMarks.length) {
            return DecorationSet.empty
        }

        let startPos = $head.start() // position of block start.
        if (crossRef) {
            // For cross ref , take the end pos of the node
            startPos = state.selection.from + crossRef.nodeSize
        } else {
            let index = $head.index()
            while (
                index < $head.parent.childCount - 1 &&
                currentMarks.some(mark =>
                    mark.isInSet($head.parent.child(index + 1).marks)
                )
            ) {
                index++
            }
            for (let i = 0; i <= index; i++) {
                startPos += $head.parent.child(i).nodeSize
            }
        }
        const dom = createDropUp(linkMark, anchorMark, crossRef, $head),
            deco = Decoration.widget(startPos, dom)
        return DecorationSet.create(state.doc, [deco])
    }

    function createDropUp(linkMark, anchorMark, crossRef, $head) {
        const dropUp = document.createElement("span"),
            editor = options.editor,
            writeAccess =
                editor.docInfo.access_rights === "write" ? true : false,
            editAccess = ["write", "write-tracked", "review-tracked"].includes(
                editor.docInfo.access_rights
            )
                ? true
                : false
        let linkType,
            linkHref,
            anchorHref,
            requiredPx = 10

        if (linkMark) {
            linkType = linkMark.attrs.href[0] === "#" ? "internal" : "external"
            linkHref =
                linkType === "internal"
                    ? window.location.href.split("#")[0] + linkMark.attrs.href
                    : linkMark.attrs.href
            requiredPx += 120
        }

        if (anchorMark) {
            anchorHref =
                window.location.href.split("#")[0] + "#" + anchorMark.attrs.id
            requiredPx += 92
        }

        dropUp.classList.add("drop-up-outer")

        dropUp.innerHTML = noSpaceTmp`
            <div class="link drop-up-inner" style="top: -${requiredPx}px;">
                ${
                    linkMark
                        ? `<div class="drop-up-head">
                        ${
                            linkMark.attrs.title
                                ? `<div class="link-title">${gettext("Title")}:&nbsp;${linkMark.attrs.title}</div>`
                                : ""
                        }
                        <div class="link-href">
                            <a class="href${linkType === "internal" ? " internal" : ""}" ${linkType === "external" ? 'target="_blank"' : ""} href="${linkHref}">
            		            ${linkHref}
            		        </a>
                        </div>
                    </div>
                    <ul class="drop-up-options">
                        <li class="copy-link" title="${gettext("Copy link")}">
                            ${gettext("Copy link")}
                        </li>
                        ${
                            writeAccess
                                ? `<li class="edit-link" title="${gettext("Edit link")}">
                                ${gettext("Edit")}
                            </li>
                            <li class="remove-link" title="${gettext("Remove link")}">
                                ${gettext("Remove")}
                            </li>`
                                : ""
                        }
                    </ul>`
                        : ""
                }
                ${
                    anchorMark
                        ? `<div class="drop-up-head">
                        <div class="link-title">${gettext("Anchor")}</div>
                        <div class="link-href">
                        <a class="href" target="_blank" href="${anchorHref}">
                            ${anchorHref}
                        </a>
                        </div>
                    </div>
                    <ul class="drop-up-options">
                        <li class="copy-anchor" title="${gettext("Copy anchor")}">
                            ${gettext("Copy anchor")}
                        </li>
                        ${
                            writeAccess
                                ? `<li class="remove-anchor" title="${gettext("Remove anchor")}">
                                ${gettext("Remove")}
                            </li>`
                                : ""
                        }
                    </ul>`
                        : ""
                }
${
    crossRef
        ? `<div class="drop-up-head" ${editAccess ? "" : 'style="border-radius:6px;"'}>
                        <div class="link-title">${gettext("Cross Reference")}</div>
                        <div class="link-href">
                        <span>
                            ${crossRef.attrs.title ? crossRef.attrs.title : "Target Lost"}
                        </a>
                        </div>
                    </div>
                        ${
                            editAccess
                                ? `<ul class="drop-up-options">
        <li class="edit-crossRef" title="${gettext("Edit cross reference")}">
                                ${gettext("Edit")}
                            </li>
                            <li class="remove-crossRef" title="${gettext("Remove cross reference")}">
                                ${gettext("Remove")}
                            </li>
                            </ul>`
                                : ""
                        }
                    `
        : ""
}
            </div>`

        if (linkType === "internal") {
            const el = dropUp.querySelector("a.internal")
            el.addEventListener("click", event => {
                event.preventDefault()
                event.stopImmediatePropagation()
                options.editor.scrollIdIntoView(linkMark.attrs.href.slice(1))
            })
        }

        const copyLinkHref = dropUp.querySelector(".copy-link")
        if (copyLinkHref) {
            copyLinkHref.addEventListener("mousedown", event => {
                event.preventDefault()
                event.stopImmediatePropagation()
                copyLink(linkHref)
            })
        }
        const copyAnchorHref = dropUp.querySelector(".copy-anchor")
        if (copyAnchorHref) {
            copyAnchorHref.addEventListener("mousedown", event => {
                event.preventDefault()
                event.stopImmediatePropagation()
                copyLink(anchorHref)
            })
        }

        const editLink = dropUp.querySelector(".edit-link")
        if (editLink) {
            editLink.addEventListener("mousedown", event => {
                event.preventDefault()
                event.stopImmediatePropagation()
                const dialog = new LinkDialog(editor)
                dialog.init()
            })
        }

        const editCrossRef = dropUp.querySelector(".edit-crossRef")
        if (editCrossRef) {
            editCrossRef.addEventListener("mousedown", event => {
                event.preventDefault()
                event.stopImmediatePropagation()
                const dialog = new LinkDialog(editor)
                dialog.init()
            })
        }

        const removeLink = dropUp.querySelector(".remove-link")
        if (removeLink) {
            removeLink.addEventListener("mousedown", event => {
                event.preventDefault()
                event.stopImmediatePropagation()
                editor.view.dispatch(
                    editor.view.state.tr.removeMark(
                        $head.start(),
                        $head.end(),
                        linkMark
                    )
                )
            })
        }

        const removeAnchor = dropUp.querySelector(".remove-anchor")
        if (removeAnchor) {
            removeAnchor.addEventListener("mousedown", event => {
                event.preventDefault()
                event.stopImmediatePropagation()
                editor.view.dispatch(
                    editor.view.state.tr.removeMark(
                        $head.start(),
                        $head.end(),
                        anchorMark
                    )
                )
            })
        }

        const removeCrossRef = dropUp.querySelector(".remove-crossRef")
        if (removeCrossRef) {
            removeCrossRef.addEventListener("mousedown", event => {
                event.preventDefault()
                event.stopImmediatePropagation()
                editor.view.dispatch(
                    editor.view.state.tr.delete($head.pos - 1, $head.pos)
                )
            })
        }
        return dropUp
    }

    return new Plugin({
        key,
        state: {
            init() {
                return {
                    url: window.location.href,
                    decos: DecorationSet.empty,
                    linkMark: false
                }
            },
            apply(tr, _prev, oldState, state) {
                let {url, decos, linkMark, anchorMark, crossReference} =
                    this.getState(oldState)
                url = getUrl(state, oldState, url)
                const newLinkMark = getLinkMark(state)
                const newAnchorMark = getAnchorMark(state)
                const newCrossReference = getCrossReference(state)
                if (
                    newLinkMark === linkMark &&
                    newAnchorMark === anchorMark &&
                    newCrossReference === crossReference
                ) {
                    decos = decos.map(tr.mapping, tr.doc)
                } else {
                    decos = getDecos(state)
                    linkMark = newLinkMark
                    anchorMark = newAnchorMark
                    crossReference = newCrossReference
                }
                if (!tr.getMeta("remote")) {
                    // We look for changes to figures or headings.
                    let foundIdElement = false // found heading or figure
                    let ranges = []
                    tr.steps.forEach((step, index) => {
                        ranges.push([step.from, step.to])
                        tr.docs[index].nodesBetween(
                            step.from,
                            step.to,
                            node => {
                                if (
                                    node.type.groups.includes("heading") ||
                                    node.type.name === "figure"
                                ) {
                                    foundIdElement = true
                                }
                            }
                        )
                        ranges = ranges.map(range => {
                            return [
                                tr.mapping.maps[index].map(range[0], -1),
                                tr.mapping.maps[index].map(range[1], 1)
                            ]
                        })
                    })
                    let foundAnchorWithoutId = false // found an anchor without an ID
                    ranges.forEach(range => {
                        state.doc.nodesBetween(range[0], range[1], node => {
                            if (
                                !foundIdElement &&
                                (node.type.groups.includes("heading") ||
                                    [
                                        "figure",
                                        "table",
                                        "bullet_list",
                                        "ordered_list"
                                    ].includes(node.type.name))
                            ) {
                                foundIdElement = true
                            }
                            if (!foundAnchorWithoutId) {
                                node.marks.forEach(mark => {
                                    if (
                                        mark.type.name === "anchor" &&
                                        !mark.attrs.id
                                    ) {
                                        foundAnchorWithoutId = true
                                    }
                                })
                            }
                        })
                    })

                    if (foundIdElement || foundAnchorWithoutId) {
                        const linkUpdate = {foundAnchorWithoutId}
                        tr.setMeta("linkUpdate", linkUpdate)
                        if (
                            oldState.schema === options.editor.view.state.schema
                        ) {
                            tr.setMeta("toFoot", {linkUpdate: true})
                        } else {
                            tr.setMeta("toMain", {linkUpdate: true})
                        }
                    }
                }

                return {
                    url,
                    decos,
                    linkMark,
                    anchorMark,
                    crossReference
                }
            }
        },
        appendTransaction: (trs, oldState, newState) => {
            // Check if any of the transactions are local.
            if (trs.every(tr => !tr.getMeta("linkUpdate"))) {
                // All transactions are remote or don't change anything. Give up.
                return
            }

            const foundAnchorWithoutId = trs.find(tr => {
                const linkUpdate = tr.getMeta("linkUpdate")
                return linkUpdate && linkUpdate.foundAnchorWithoutId
            })
            // ID should not be found in the other pm either. So we look through
            // those as well.
            let otherState, language
            if (oldState.schema === options.editor.view.state.schema) {
                otherState = options.editor.mod.footnotes.fnEditor.view.state
                language = newState.doc.attrs.language
            } else {
                otherState = options.editor.view.state
                language = options.editor.view.state.doc.attrs.language
            }

            const internalTargets = getInternalTargets(
                newState,
                language,
                oldState.schema === options.editor.view.state.schema
                    ? "main"
                    : "foot"
            ).concat(
                getInternalTargets(
                    otherState,
                    language,
                    oldState.schema === options.editor.view.state.schema
                        ? "foot"
                        : "main"
                )
            )

            // Check if there are any headings or figures in the affected range.
            // Otherwise, skip.

            // Check that unique IDs only exist once in the document and that the
            // text values are up to date for all IDs if they are referenced.
            //
            // If an ID is used more than once, add steps to change the ID of all
            // but the first occurence.
            const ids = []

            otherState.doc.descendants(node => {
                if (
                    node.type.groups.includes("heading") ||
                    ["figure", "table", "bullet_list", "ordered_list"].includes(
                        node.type.name
                    )
                ) {
                    ids.push(node.attrs.id)
                }
            })

            const newTr = newState.tr.setMeta("fixIds", true)

            newState.doc.descendants((node, pos) => {
                if (
                    node.type.groups.includes("heading") ||
                    ["figure", "table", "bullet_list", "ordered_list"].includes(
                        node.type.name
                    )
                ) {
                    if (ids.includes(node.attrs.id) || !node.attrs.id) {
                        // Add node if the id is false (default) or it is present twice
                        const randomIdGenerator = node.type.groups.includes(
                            "heading"
                        )
                            ? randomHeadingId
                            : node.type.name === "figure"
                              ? randomFigureId
                              : node.type.name === "table"
                                ? randomTableId
                                : randomListId
                        let id

                        while (!id || ids.includes(id)) {
                            id = randomIdGenerator()
                        }

                        const attrs = Object.assign({}, node.attrs, {id})

                        // Because we only change attributes, positions should stay the
                        // the same throughout all our extra steps. We therefore do no
                        // mapping of positions through these steps.
                        newTr.setNodeMarkup(pos, null, attrs)

                        ids.push(id)
                    } else {
                        ids.push(node.attrs.id)
                    }
                } else if (
                    node.type.name === "cross_reference" &&
                    !internalTargets.find(
                        it =>
                            it.id === node.attrs.id &&
                            it.text === node.attrs.title
                    )
                ) {
                    const iTarget = internalTargets.find(
                        it => it.id === node.attrs.id
                    )
                    const attrs = Object.assign({}, node.attrs, {
                        title: iTarget ? iTarget.text : null
                    })
                    newTr.setNodeMarkup(pos, null, attrs)
                }
                node.marks.forEach(mark => {
                    if (
                        mark.type.name === "link" &&
                        mark.attrs.href[0] === "#" &&
                        !internalTargets.find(
                            it =>
                                it.id === mark.attrs.href.slice(1) &&
                                it.text === node.attrs.title
                        )
                    ) {
                        const iTarget = internalTargets.find(
                            it => it.id === mark.attrs.href.slice(1)
                        )
                        const attrs = Object.assign({}, mark.attrs, {
                            title: iTarget ? iTarget.text : null
                        })
                        newTr.addMark(
                            pos,
                            pos + node.nodeSize,
                            newState.schema.marks.link.create(attrs)
                        )
                    }
                })
            })

            // Remove anchor marks without ID
            if (foundAnchorWithoutId) {
                const markType = newState.schema.marks.anchor.create({
                    id: false
                })
                newTr.step(
                    new RemoveMarkStep(0, newState.doc.content.size, markType)
                )
            }

            return newTr
        },
        props: {
            handleDOMEvents: {
                focus: (view, _event) => {
                    const {url} = key.getState(view.state)
                    window.history.replaceState("", "", url)
                }
            },
            decorations(state) {
                const {decos} = this.getState(state)
                return decos
            }
        }
    })
}
