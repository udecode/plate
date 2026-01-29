import {DOMSerializer} from "prosemirror-model"
import {NodeSelection, Plugin, PluginKey} from "prosemirror-state"
import {Mapping} from "prosemirror-transform"
import {Decoration, DecorationSet} from "prosemirror-view"
import {noSpaceTmp} from "../../../../common"
import {changeSet} from "../changeset"
import {readOnlyFnEditor} from "../footnotes"
import {
    addDeletionMarks,
    dispatchRemoveDiffdata,
    removeDiffFromJson,
    updateMarkData
} from "../tools"
import {
    acceptChanges,
    addDeletedContentBack,
    copyChange,
    deleteContent,
    handleMarks,
    removeDecoration
} from "./action"

function createHiglightDecoration(from, to, state) {
    /* Creates a yellow coloured highlight decoration when the user
    tries to look at a change */
    const inlineDeco = Decoration.inline(from, to, {class: "selected-dec"})
    const deco = []
    deco.push(inlineDeco)
    state.doc.nodesBetween(from, to, (node, pos) => {
        if (
            pos < from ||
            ["bullet_list", "ordered_list"].includes(node.type.name)
        ) {
            return true
        } else if (node.isInline) {
            return false
        }
        if (node && node.attrs.diffdata && node.attrs.diffdata.length > 0) {
            deco.push(
                Decoration.node(
                    pos,
                    pos + node.nodeSize,
                    {class: "selected-dec"},
                    {}
                )
            )
        }
    })
    return deco
}

function createDeletionHighlight(decos, from, to, state, options) {
    /* Creates a yellow coloured highlight decoration when the user
    tries to look at a deletion change in offline editor */

    decos.find(from + 1, to).forEach(deco => {
        const decoId = deco.spec.id
        if (decoId !== undefined) {
            const specDecoration = options.merge.mergeView2.dom.querySelector(
                '[data-decoid="' + decoId + '"]'
            )
            const parentEl = specDecoration.closest(".deletion-decoration")
            parentEl.querySelectorAll(".online-deleted").forEach(ele => {
                ele.classList.add("selected-dec")
                ele.classList.add("deletion-highlight")
            })
        }
    })
    const inlineDeco = Decoration.inline(
        from,
        to,
        {class: "selected-dec"},
        {type: "deletion-highlight"}
    )
    const deco = []
    deco.push(inlineDeco)
    state.doc.nodesBetween(from, to, (node, pos) => {
        if (
            pos < from ||
            ["bullet_list", "ordered_list"].includes(node.type.name)
        ) {
            return true
        } else if (node.isInline) {
            return false
        }
        if (node.attrs.diffdata) {
            deco.push(
                Decoration.node(
                    pos,
                    pos + node.nodeSize,
                    {class: "selected-dec"},
                    {type: "deletion-highlight"}
                )
            )
        }
    })
    decos = decos.add(state.doc, deco)
    return decos
}
function createLinkDropUp(mark) {
    const dom = document.createElement("span")
    dom.classList.add("link-drop-up-outer")
    dom.innerHTML = noSpaceTmp`
        <div class="link-drop-up-inner">
            <span>Link:${mark.attrs.href}</span>
        </div>
        `
    return dom
}

function getDecos(decos, merge, state) {
    /* Creates PM deco for the change popup */
    const $head = state.selection.$head
    const currentMarks = [],
        diffMark = $head.marks().find(mark => mark.type.name === "diffdata")
    const linkMark = $head.marks().find(mark => mark.type.name === "link")

    decos = decos.remove(
        decos.find(null, null, spec => {
            if (spec.type && spec.type == "deletion") {
                return false
            } else {
                return true
            }
        })
    )

    if (diffMark) {
        currentMarks.push(diffMark)
    }
    if (!currentMarks.length) {
        const node =
            state.selection instanceof NodeSelection
                ? state.selection.node
                : state.selection.$head.parent
        const markFound = {}
        if (node && node.attrs.diffdata && node.attrs.diffdata.length > 0) {
            markFound["attrs"] = {}
            markFound["attrs"]["diff"] = node.attrs.diffdata[0].type
            markFound["attrs"]["from"] = node.attrs.diffdata[0].from
            markFound["attrs"]["to"] = node.attrs.diffdata[0].to
            markFound["attrs"]["steps"] = JSON.stringify(
                node.attrs.diffdata[0].steps
            )

            const startPos = $head.pos // position of block start.
            const dom = createDropUp(merge, markFound, linkMark),
                deco = Decoration.widget(startPos, dom)
            const highlightDecos = createHiglightDecoration(
                markFound["attrs"]["from"],
                markFound["attrs"]["to"],
                state
            )
            highlightDecos.push(deco)
            return decos.add(state.doc, highlightDecos)
        } else if (node.marks.find(mark => mark.type.name == "diffdata")) {
            const mark = node.marks.find(mark => mark.type.name == "diffdata")
            const startPos = $head.pos // position of block start.
            const dom = createDropUp(merge, mark, linkMark),
                deco = Decoration.widget(startPos, dom)
            const highlightDecos = createHiglightDecoration(
                mark.attrs.from,
                mark.attrs.to,
                state
            )
            highlightDecos.push(deco)
            return decos.add(state.doc, highlightDecos)
        } else if (linkMark) {
            const startPos = $head.pos
            const dom = createLinkDropUp(linkMark),
                deco = Decoration.widget(startPos, dom)
            return decos.add(state.doc, [deco])
        }
        return decos
    }
    const startPos = diffMark.attrs.to
    const dom = createDropUp(merge, diffMark, linkMark),
        deco = Decoration.widget(startPos, dom)
    const highlightDecos = createHiglightDecoration(
        diffMark.attrs.from,
        diffMark.attrs.to,
        state
    )
    highlightDecos.push(deco)
    return decos.add(state.doc, highlightDecos)
}

function deletionDecorations(decos, merge, doc, tr, deletionClass) {
    let index = 0
    let stepsTrackedByChangeset = []
    const changeset = new changeSet(tr).getChangeSet(),
        schema = merge.schema,
        commonDoc = merge.cpDoc,
        mapping = tr.mapping
    changeset.changes.forEach(change => {
        if (change.deleted.length > 0) {
            let dom = document.createElement("span")
            const slice = commonDoc.slice(change.fromA, change.toA)

            // Apply the marks before trying to serialize!!!!
            let stepsInvolved = []
            change.deleted.forEach(deletion =>
                stepsInvolved.push(Number.parseInt(deletion.data.step))
            )
            const stepsSet = new Set(stepsInvolved)
            stepsInvolved = Array.from(stepsSet)
            stepsInvolved.sort((a, b) => a - b)
            stepsTrackedByChangeset =
                stepsTrackedByChangeset.concat(stepsInvolved)
            const deletionMark = schema.marks.diffdata.create({
                diff: deletionClass,
                steps: JSON.stringify(stepsInvolved),
                from: change.fromA,
                to: change.toA,
                markOnly: false
            })

            // Slice with marked contents
            const content = addDeletionMarks(slice, deletionMark, schema)
            const deletedContent =
                DOMSerializer.fromSchema(schema).serializeFragment(content)

            // Parse HTML to accomodate minor changes
            if (deletedContent.querySelector("tr,td")) {
                dom = document.createElement("tbody")
                dom.appendChild(deletedContent)
            } else {
                dom.appendChild(deletedContent)
            }
            dom.querySelectorAll("span.footnote-marker").forEach(
                footnoteElement => {
                    const newFnElement = readOnlyFnEditor(footnoteElement)
                    newFnElement.classList.add("deleted-footnote-element")
                    newFnElement.classList.add(deletionClass)
                    footnoteElement.parentNode.appendChild(newFnElement)
                    footnoteElement.remove()
                }
            )
            dom.classList.add("deletion-decoration")
            dom.dataset.delfrom = change.fromA
            dom.dataset.delto = change.toA

            const dropUp = createDropUp(merge, deletionMark, undefined)
            dropUp.dataset.decoid = index
            dropUp.style.display = "none"
            dom.appendChild(dropUp)

            // Put decoration in proper place. In case of a footnote change, the original content
            // is put first, decoration is shown after the content
            let pos = mapping.map(change.fromA)
            if (change.lenA == change.lenB && stepsInvolved.length == 1) {
                const JSONSlice = slice.toJSON()
                if (
                    JSONSlice.content &&
                    JSONSlice.content.length == 1 &&
                    JSONSlice.content[0].type === "footnote"
                ) {
                    pos += 1
                }
            }
            decos = decos.add(doc, [
                Decoration.widget(pos, dom, {type: "deletion", id: index})
            ])
            index += 1
        }
    })
    if (deletionClass == "offline-deleted") {
        merge.offlineTrackedSteps = merge.offlineTrackedSteps.concat(
            stepsTrackedByChangeset
        )
    }
    return decos
}

function createDropUp(merge, diffMark, linkMark) {
    /* The actual function that creates a drop up */
    const dropUp = document.createElement("span"),
        requiredPx = 10,
        tr =
            diffMark.attrs.diff.search("offline") != -1
                ? merge.offlineTr
                : merge.onlineTr,
        trType =
            diffMark.attrs.diff.search("offline") != -1 ? "offline" : "online",
        opType =
            diffMark.attrs.diff.search("inserted") != -1
                ? "insertion"
                : "deletion"
    let textToBeDisplayed = ""

    if (diffMark.attrs.markOnly) {
        textToBeDisplayed = gettext("Format Change")
    } else {
        if (trType == "online") {
            if (opType == "insertion") {
                textToBeDisplayed = gettext("Inserted by online users")
            } else {
                textToBeDisplayed = gettext("Deleted by online users")
            }
        } else {
            if (opType == "insertion") {
                textToBeDisplayed = gettext("Inserted by you")
            } else {
                textToBeDisplayed = gettext("Deleted by you")
            }
        }
    }
    linkMark = linkMark === undefined ? false : linkMark
    dropUp.classList.add("drop-up-outer")
    dropUp.innerHTML = noSpaceTmp`
        <div class="link drop-up-inner" style="top: -${requiredPx}px;">
            ${
                diffMark
                    ? `<div class="drop-up-head">
                    ${
                        diffMark.attrs.diff
                            ? `<div class="link-title">${gettext("Change")}:&nbsp; ${textToBeDisplayed}</div>`
                            : ""
                    }
                    ${
                        linkMark
                            ? `<div> Link : ${linkMark.attrs.href}</div>`
                            : ""
                    }
                    ${
                        linkMark
                            ? `<div> Type : ${linkMark.attrs.href[0] == "#" ? "internal" : "external"}</div>`
                            : ""
                    }
                </div>
                <ul class="drop-up-options">
                    <li class="accept-change" title="${gettext("Accept change")}">
                        ${gettext("Accept Change")}
                    </li>
                    <li class="reject-change" title="${gettext("Reject change")}">
                        ${gettext("Reject Change")}
                    </li>
                    <li class="copy-data" title="${gettext("Copy content")}">
                        ${gettext("Copy")}
                    </li>
                </ul>`
                    : ""
            }
        </div>`

    const acceptChange = dropUp.querySelector(".accept-change")
    if (acceptChange) {
        acceptChange.addEventListener("mousedown", event => {
            event.preventDefault()
            event.stopImmediatePropagation()
            try {
                if (trType == "online") {
                    if (opType == "insertion") {
                        dispatchRemoveDiffdata(
                            merge.mergeView2,
                            diffMark.attrs.from,
                            diffMark.attrs.to
                        )
                    } else {
                        // remove online deletion decoration
                        const decorationId = dropUp.dataset.decoid
                        removeDecoration(merge.mergeView2, decorationId)
                    }
                } else {
                    if (opType == "insertion") {
                        acceptChanges(
                            merge,
                            diffMark,
                            merge.mergeView2,
                            merge.mergeView3,
                            tr
                        )
                    } else {
                        // remove offline deletion decoration
                        const decorationId = dropUp.dataset.decoid
                        if (deleteContent(merge, merge.mergeView2, diffMark)) {
                            merge.mergeView2.dispatch(
                                merge.mergeView2.state.tr.setMeta(
                                    "removeHighlight",
                                    true
                                )
                            )
                            removeDecoration(merge.mergeView3, decorationId)
                        }
                    }
                }
            } catch (error) {
                const onlineDoc = merge.editor.schema.nodeFromJSON(
                    removeDiffFromJson(merge.onlineDoc.toJSON())
                )
                const offlineDoc = merge.editor.schema.nodeFromJSON(
                    removeDiffFromJson(merge.offlineDoc.toJSON())
                )

                // Handle merge failure
                merge.editor.mod.collab.doc.merge.handleMergeFailure(
                    error,
                    offlineDoc,
                    onlineDoc,
                    merge
                )
            }
        })
    }
    const rejectChange = dropUp.querySelector(".reject-change")
    if (rejectChange) {
        rejectChange.addEventListener("mousedown", event => {
            event.preventDefault()
            event.stopImmediatePropagation()
            try {
                if (trType == "online") {
                    if (opType == "insertion") {
                        // Delete inserted content
                        if (diffMark.attrs.markOnly) {
                            handleMarks(
                                merge.mergeView2,
                                diffMark,
                                tr,
                                merge.schema
                            )
                            dispatchRemoveDiffdata(
                                merge.mergeView2,
                                diffMark.attrs.from,
                                diffMark.attrs.to
                            )
                        } else {
                            deleteContent(
                                merge,
                                merge.mergeView2,
                                diffMark,
                                false
                            )
                        }
                    } else {
                        // remove online deletion decoration
                        if (
                            addDeletedContentBack(
                                merge,
                                merge.mergeView2,
                                diffMark
                            )
                        ) {
                            const decorationId = dropUp.dataset.decoid
                            removeDecoration(merge.mergeView2, decorationId)
                        }
                    }
                } else {
                    if (opType == "insertion") {
                        dispatchRemoveDiffdata(
                            merge.mergeView3,
                            diffMark.attrs.from,
                            diffMark.attrs.to
                        )
                    } else {
                        // remove offline deletion decoration
                        dropUp.parentNode.classList.remove("offline-deleted")
                        dropUp.parentNode.classList.remove(
                            "deletion-decoration"
                        )
                        dropUp.parentNode
                            .querySelectorAll(".offline-deleted")
                            .forEach(ele => {
                                ele.classList.remove("offline-deleted")
                                ele.classList.remove("selected-dec")
                            })
                        dropUp.remove()
                        merge.mergeView2.dispatch(
                            merge.mergeView2.state.tr.setMeta(
                                "removeHighlight",
                                true
                            )
                        )
                    }
                }
            } catch (error) {
                const onlineDoc = merge.editor.schema.nodeFromJSON(
                    removeDiffFromJson(merge.onlineDoc.toJSON())
                )
                const offlineDoc = merge.editor.schema.nodeFromJSON(
                    removeDiffFromJson(merge.offlineDoc.toJSON())
                )

                // Handle merge failure
                merge.editor.mod.collab.doc.merge.handleMergeFailure(
                    error,
                    offlineDoc,
                    onlineDoc,
                    merge
                )
            }
        })
    }

    const copyData = dropUp.querySelector(".copy-data")
    if (copyData) {
        copyData.addEventListener("mousedown", event => {
            event.preventDefault()
            event.stopImmediatePropagation()
            if (trType == "online") {
                if (opType == "insertion") {
                    copyChange(
                        merge.mergeView2,
                        diffMark.attrs.from,
                        diffMark.attrs.to
                    )
                } else {
                    copyChange(
                        merge.mergeView1,
                        diffMark.attrs.from,
                        diffMark.attrs.to
                    )
                }
            } else {
                if (opType == "insertion") {
                    copyChange(
                        merge.mergeView3,
                        diffMark.attrs.from,
                        diffMark.attrs.to
                    )
                } else {
                    copyChange(
                        merge.mergeView1,
                        diffMark.attrs.from,
                        diffMark.attrs.to
                    )
                }
            }
        })
    }
    return dropUp
}

export const key = new PluginKey("mergeDiff")

export const diffPlugin = options =>
    new Plugin({
        key,
        state: {
            init(state) {
                let baseTr = false
                let deletionClass = false
                let decos = DecorationSet.empty
                if (state.doc.eq(options.merge.offlineDoc)) {
                    baseTr = options.merge.offlineTr
                    deletionClass = "offline-deleted"
                } else if (state.doc.eq(options.merge.onlineDoc)) {
                    baseTr = options.merge.onlineTr
                    deletionClass = "online-deleted"
                }
                if (baseTr) {
                    decos = deletionDecorations(
                        decos,
                        options.merge,
                        state.doc,
                        baseTr,
                        deletionClass
                    )
                }
                return {
                    baseTr: baseTr,
                    deletionClass: deletionClass,
                    decos: decos
                }
            },
            apply(tr, _prev, oldState, state) {
                let {decos} = this.getState(oldState)
                const {baseTr, deletionClass} = this.getState(oldState)

                decos = getDecos(decos, options.merge, state)

                if (tr.getMeta("removeHighlight")) {
                    decos = decos.remove(
                        decos.find(
                            null,
                            null,
                            spec => spec.type == "deletion-highlight"
                        )
                    )

                    // Remove the class set on deletion decorations
                    options.merge.mergeView2.dom
                        .querySelectorAll(".selected-dec.deletion-highlight")
                        .forEach(ele => {
                            ele.classList.remove("selected-dec")
                            ele.classList.remove("deletion-highlight")
                        })
                }
                if (tr.getMeta("decorationId")) {
                    const decorationId = Number.parseInt(
                        tr.getMeta("decorationId")
                    )
                    decos = decos.remove(
                        decos.find(null, null, spec => spec.id == decorationId)
                    )
                }
                if (tr.getMeta("highlight")) {
                    const data = tr.getMeta("highlight")
                    const from = options.merge.mergedDocMap.map(
                        Number.parseInt(data.from)
                    )
                    const to = options.merge.mergedDocMap.map(
                        Number.parseInt(data.to)
                    )
                    if (from && to) {
                        decos = createDeletionHighlight(
                            decos,
                            from,
                            to,
                            state,
                            options
                        )
                    }
                }

                if (tr.getMeta("initialDiffMap")) {
                    // If it is initial diffMap we update mark data
                    // So no need to update the deco's position.
                    decos = decos.map(new Mapping(), tr.doc)
                } else {
                    decos = decos.map(tr.mapping, tr.doc)
                }
                return {
                    baseTr: baseTr,
                    deletionClass: deletionClass,
                    decos: decos
                }
            }
        },
        props: {
            handleClick: (view, _pos, event) => {
                const $pos = view.state.doc.resolve(_pos)
                if (
                    $pos.node &&
                    $pos.parent &&
                    $pos.parent.type.name == "figure"
                ) {
                    // If the click is on a Fig element set up a node selection
                    // so that accept/reject options are shown properly.
                    const tr = view.state.tr
                    const $updatedPos = view.state.doc.resolve(
                        _pos - ($pos.parentOffset + 1)
                    )
                    tr.setSelection(new NodeSelection($updatedPos))
                    view.dispatch(tr)
                }

                const delDeco = view.dom.querySelectorAll(
                    ".offline-deleted,.online-deleted"
                )
                if (delDeco) {
                    delDeco.forEach(item =>
                        item.classList.remove("selected-dec")
                    )
                }
                const delPopUp = view.dom.querySelectorAll(
                    ".deletion-decoration .drop-up-outer"
                )
                if (delPopUp) {
                    delPopUp.forEach(popUp => (popUp.style.display = "none"))
                }
                const delFnToolTip = view.dom.querySelectorAll(
                    ".deleted-footnote-element"
                )
                if (delFnToolTip) {
                    delFnToolTip.forEach(
                        tooltip =>
                            (tooltip.childNodes[0].style.display = "none")
                    )
                }
                options.merge.mergeView2.dispatch(
                    options.merge.mergeView2.state.tr.setMeta(
                        "removeHighlight",
                        true
                    )
                )
                if (event.target.closest(".offline-deleted")) {
                    const parentEl = event.target.closest(
                        ".deletion-decoration"
                    )
                    const highlightEle =
                        parentEl.querySelectorAll(".offline-deleted")
                    if (highlightEle) {
                        highlightEle.forEach(ele =>
                            ele.classList.add("selected-dec")
                        )
                    }
                    parentEl.querySelector(".drop-up-outer").style.display =
                        "block"

                    // Add a decoration to highlight decoration to the online/merged view
                    options.merge.mergeView2.dispatch(
                        options.merge.mergeView2.state.tr.setMeta("highlight", {
                            from: parentEl.dataset.delfrom,
                            to: parentEl.dataset.delto
                        })
                    )
                } else if (event.target.closest(".online-deleted")) {
                    const parentEl = event.target.closest(
                        ".deletion-decoration"
                    )
                    const highlightEle =
                        parentEl.querySelectorAll(".online-deleted")
                    if (highlightEle) {
                        highlightEle.forEach(ele =>
                            ele.classList.add("selected-dec")
                        )
                    }
                    parentEl.querySelector(".drop-up-outer").style.display =
                        "block"
                }
                if (event.target.matches(".deleted-footnote-element")) {
                    event.target.childNodes[0].style.display = "block"
                }
            },
            decorations(state) {
                const {decos} = this.getState(state)
                return decos
            }
        },
        view(_view) {
            return {
                update: view => {
                    // Make sure that pop stays inside the view.
                    const changePopUp = view.dom.querySelector(".drop-up-outer")
                    if (changePopUp) {
                        const bounding = changePopUp.getBoundingClientRect()
                        const dialogBox =
                            document.querySelector("#editor-merge-view")
                        if (dialogBox) {
                            if (
                                bounding.right > dialogBox.offsetWidth ||
                                bounding.right >
                                    (window.innerWidth ||
                                        document.documentElement.clientWidth)
                            ) {
                                changePopUp.style.left = "100px"
                            }
                        }
                    }

                    // Make sure that the deletion decoration footnote stays inside the view
                    const footnote = view.dom.querySelector(
                        ".offline-deleted.deleted-footnote-element .footnote-tooltip"
                    )
                    if (footnote) {
                        const bounding = footnote.getBoundingClientRect()
                        const dialogBox =
                            document.querySelector("#editor-merge-view")
                        if (dialogBox) {
                            if (
                                bounding.right > dialogBox.offsetWidth ||
                                bounding.right >
                                    (window.innerWidth ||
                                        document.documentElement.clientWidth)
                            ) {
                                footnote.style.left = "-100px"
                            }
                        }
                    }
                }
            }
        },
        appendTransaction: (trs, _oldState, newState) => {
            if (trs.every(tr => !tr.steps.length)) {
                return
            }
            const updateMarkTr = newState.tr
            trs.forEach(tr => {
                if (tr.steps.length) {
                    updateMarkData(
                        tr,
                        options.merge.imageDataModified,
                        updateMarkTr
                    )
                }
            })
            updateMarkTr.setMeta("initialDiffMap", true)
            return updateMarkTr
        }
    })
