import {Slice} from "prosemirror-model"
import {Selection, TextSelection} from "prosemirror-state"
import {CellSelection} from "prosemirror-tables"
import {
    AddMarkStep,
    Mapping,
    RemoveMarkStep,
    ReplaceAroundStep,
    ReplaceStep
} from "prosemirror-transform"

function markInsertion(tr, from, to, user, date1, date10, approved) {
    const insertionMark = tr.doc.type.schema.marks.insertion.create({
        user: user.id,
        username: user.username,
        date: date10,
        approved
    })
    // Add insertion mark also to block nodes (figures, text blocks) but not table cells/rows and lists.
    tr.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isInline) {
            tr.removeMark(
                Math.max(from, pos),
                Math.min(pos + node.nodeSize, to),
                tr.doc.type.schema.marks.deletion
            )
            tr.removeMark(
                Math.max(from, pos),
                Math.min(pos + node.nodeSize, to),
                tr.doc.type.schema.marks.insertion
            )
            tr.addMark(
                Math.max(from, pos),
                Math.min(pos + node.nodeSize, to),
                insertionMark
            )
            return false
        } else if (
            pos < from ||
            ["bullet_list", "ordered_list"].includes(node.type.name)
        ) {
            return true
        } else if (["table_row", "table_cell"].includes(node.type.name)) {
            return false
        }
        if (node.attrs.track) {
            const track = []
            if (!approved) {
                track.push({
                    type: "insertion",
                    user: user.id,
                    username: user.username,
                    date: date1
                })
            }
            tr.setNodeMarkup(
                pos,
                null,
                Object.assign({}, node.attrs, {track}),
                node.marks
            )
        }
        if (["figure", "table"].includes(node.type.name)) {
            // A table or figure was inserted. We don't add track marks to elements inside of it.
            return false
        }
    })
}

function markDeletion(tr, from, to, user, date1, date10) {
    const deletionMark = tr.doc.type.schema.marks.deletion.create({
        user: user.id,
        username: user.username,
        date: date10
    })
    let firstTableCellChild = false
    let listItem = false
    const deletionMap = new Mapping()
    // Add deletion mark to block nodes (figures, text blocks) and find already deleted inline nodes (and leave them alone)
    tr.doc.nodesBetween(from, to, (node, pos, _parent, _index) => {
        if (pos < from && node.type.name === "table_cell") {
            firstTableCellChild = true
            return true
        } else if ((pos < from && node.isBlock) || firstTableCellChild) {
            firstTableCellChild = false
            return true
        } else if (["table_row", "table_cell"].includes(node.type.name)) {
            return false
        } else if (
            node.isInline &&
            node.marks.find(
                mark =>
                    mark.type.name === "insertion" &&
                    mark.attrs.user === user.id &&
                    !mark.attrs.approved
            )
        ) {
            const removeStep = new ReplaceStep(
                deletionMap.map(Math.max(from, pos)),
                deletionMap.map(Math.min(to, pos + node.nodeSize)),
                Slice.empty
            )
            if (!tr.maybeStep(removeStep).failed) {
                deletionMap.appendMap(removeStep.getMap())
            }
        } else if (
            node.isInline &&
            !node.marks.find(mark => mark.type.name === "deletion")
        ) {
            tr.addMark(
                deletionMap.map(Math.max(from, pos)),
                deletionMap.map(Math.min(to, pos + node.nodeSize)),
                deletionMark
            )
        } else if (
            !node.attrs.track?.find(
                trackAttr => trackAttr.type === "deletion"
            ) &&
            !["bullet_list", "ordered_list"].includes(node.type.name)
        ) {
            if (
                node.attrs.track?.find(
                    trackAttr =>
                        trackAttr.type === "insertion" &&
                        trackAttr.user === user.id
                )
            ) {
                let removeStep
                // user has created element. so (s)he is allowed to delete it again.
                if (node.isTextblock && to < pos + node.nodeSize) {
                    // The node is a textblock. So we need to merge into the last possible
                    // position inside the last text block.
                    const selectionBefore = Selection.findFrom(
                        tr.doc.resolve(pos),
                        -1
                    )
                    if (selectionBefore instanceof TextSelection) {
                        removeStep = new ReplaceStep(
                            deletionMap.map(selectionBefore.$anchor.pos),
                            deletionMap.map(to),
                            Slice.empty
                        )
                    }
                } else {
                    removeStep = new ReplaceStep(
                        deletionMap.map(Math.max(from, pos)),
                        deletionMap.map(Math.min(to, pos + node.nodeSize)),
                        Slice.empty
                    )
                }

                if (!tr.maybeStep(removeStep).failed) {
                    deletionMap.appendMap(removeStep.getMap())
                }
                if (node.type.name === "list_item" && listItem) {
                    listItem = false
                }
            } else if (node.attrs.track) {
                if (node.type.name === "list_item") {
                    listItem = true
                } else if (listItem) {
                    // The first child of the first list item (likely a par) will not be merged with the paragraph
                    // before it.
                    listItem = false
                    return
                }
                const track = node.attrs.track.slice()
                track.push({
                    type: "deletion",
                    user: user.id,
                    username: user.username,
                    date: date1
                })
                tr.setNodeMarkup(
                    deletionMap.map(pos),
                    null,
                    Object.assign({}, node.attrs, {track}),
                    node.marks
                )
            }
            if (node.type.name === "figure") {
                return false
            }
        }
    })

    return deletionMap
}

function markWrapping(tr, pos, oldNode, newNode, user, date1) {
    let track = oldNode.attrs.track.slice(),
        blockTrack = track.find(track => track.type === "block_change")

    if (blockTrack) {
        track = track.filter(track => track !== blockTrack)
        if (
            blockTrack.before.type !== newNode.type.name ||
            blockTrack.before.attrs.level !== newNode.attrs.level
        ) {
            blockTrack = {
                type: "block_change",
                user: user.id,
                username: user.username,
                date: date1,
                before: blockTrack.before
            }
            track.push(blockTrack)
        }
    } else {
        blockTrack = {
            type: "block_change",
            user: user.id,
            username: user.username,
            date: date1,
            before: {type: oldNode.type.name, attrs: oldNode.attrs}
        }
        if (blockTrack.before.attrs.id) {
            delete blockTrack.before.attrs.id
        }
        if (blockTrack.before.attrs.track) {
            delete blockTrack.before.attrs.track
        }
        track.push(blockTrack)
    }
    if (tr.doc.nodeAt(pos)) {
        tr.setNodeMarkup(pos, null, Object.assign({}, newNode.attrs, {track}))
    }
}

export function amendTransaction(tr, state, editor) {
    if (
        !tr.steps.length ||
        (tr.meta &&
            !Object.keys(tr.meta).every(
                // Only replace TRs that have no metadata or only inputType metadata
                metadata => ["inputType", "uiEvent", "paste"].includes(metadata)
            )) ||
        // don't replace history TRs
        ["historyUndo", "historyRedo"].includes(tr.getMeta("inputType"))
    ) {
        // None of the transactions change the doc, or all are remote, come from footnotes,
        // are footnote creations, history or fixing IDs. Give up.
        return tr
    } else {
        return trackedTransaction(
            tr,
            state,
            editor.user,
            !editor.view.state.doc.attrs.tracked &&
                !["write-tracked", "review-tracked"].includes(
                    editor.docInfo.access_rights
                ),
            Date.now() - editor.clientTimeAdjustment
        )
    }
}

export function trackedTransaction(tr, state, user, approved, date) {
    const newTr = state.tr,
        map = new Mapping(),
        date10 = Math.floor(date / 600000) * 10, // 10 minute interval
        date1 = Math.floor(date / 60000), // 1 minute interval
        // We only insert content if this is not directly a tr for cell deletion. This is because tables delete rows by deleting the
        // content of each cell and replacing it with an empty paragraph.
        cellDeleteTr =
            ["deleteContentBackward", "deleteContentForward"].includes(
                tr.getMeta("inputType")
            ) && state.selection instanceof CellSelection
    tr.steps.forEach((originalStep, originalStepIndex) => {
        const step = originalStep.map(map),
            doc = newTr.doc
        if (!step) {
            return
        }
        if (step instanceof ReplaceStep) {
            const newStep = approved
                ? step
                : step.slice.size && !cellDeleteTr
                  ? new ReplaceStep(
                        step.to, // We insert all the same steps, but with "from"/"to" both set to "to" in order not to delete content. Mapped as needed.
                        step.to,
                        step.slice,
                        step.structure
                    )
                  : false
            // We didn't apply the original step in its original place. We adjust the map accordingly.
            const invertStep = originalStep
                .invert(tr.docs[originalStepIndex])
                .map(map)
            map.appendMap(invertStep.getMap())
            if (newStep) {
                const trTemp = state.apply(newTr).tr
                if (!trTemp.maybeStep(newStep).failed) {
                    const mappedNewStepTo = newStep.getMap().map(newStep.to)
                    markInsertion(
                        trTemp,
                        newStep.from,
                        mappedNewStepTo,
                        user,
                        date1,
                        date10,
                        approved
                    )
                    // We condense it down to a single replace step.
                    const condensedStep = new ReplaceStep(
                        newStep.from,
                        newStep.to,
                        trTemp.doc.slice(newStep.from, mappedNewStepTo)
                    )
                    newTr.step(condensedStep)
                    const mirrorIndex = map.maps.length - 1
                    map.appendMap(condensedStep.getMap(), mirrorIndex)
                    if (!newTr.selection.eq(trTemp.selection)) {
                        newTr.setSelection(
                            Selection.fromJSON(trTemp.selection.toJSON())
                        )
                    }
                }
            }
            if (!approved && step.from !== step.to) {
                map.appendMap(
                    markDeletion(newTr, step.from, step.to, user, date1, date10)
                )
            }
        } else if (approved) {
            newTr.step(step)
        } else if (step instanceof ReplaceAroundStep) {
            if (step.from === step.gapFrom && step.to === step.gapTo) {
                // wrapped in something
                newTr.step(step)
                const from = step.getMap().map(step.from, -1)
                const to = step.getMap().map(step.gapFrom)
                markInsertion(newTr, from, to, user, date1, date10, false)
            } else if (
                !step.slice.size ||
                step.slice.content.content.length === 2
            ) {
                // unwrapped from something
                const invertStep = originalStep
                    .invert(tr.docs[originalStepIndex])
                    .map(map)
                map.appendMap(invertStep.getMap())
                map.appendMap(
                    markDeletion(
                        newTr,
                        step.from,
                        step.gapFrom,
                        user,
                        date1,
                        date10
                    )
                )
            } else if (
                step.slice.size === 2 &&
                step.gapFrom - step.from === 1 &&
                step.to - step.gapTo === 1
            ) {
                // Replaced one wrapping with another
                newTr.step(step)
                const oldNode = doc.nodeAt(step.from)
                if (oldNode.attrs.track) {
                    markWrapping(
                        newTr,
                        step.from,
                        oldNode,
                        step.slice.content.firstChild,
                        user,
                        date1
                    )
                }
            } else {
                newTr.step(step)
                const ranges = [
                    {
                        from: step.getMap().map(step.from, -1),
                        to: step.getMap().map(step.gapFrom)
                    },
                    {
                        from: step.getMap().map(step.gapTo, -1),
                        to: step.getMap().map(step.to)
                    }
                ]
                ranges.forEach(range =>
                    doc.nodesBetween(range.from, range.to, (_node, pos) => {
                        if (pos < range.from) {
                            return true
                        }
                        markInsertion(
                            newTr,
                            range.from,
                            range.to,
                            user,
                            date1,
                            date10,
                            false
                        )
                    })
                )
            }
        } else if (step instanceof AddMarkStep) {
            doc.nodesBetween(step.from, step.to, (node, pos) => {
                if (!node.isInline) {
                    return true
                }
                if (node.marks.find(mark => mark.type.name === "deletion")) {
                    return false
                } else {
                    newTr.addMark(
                        Math.max(step.from, pos),
                        Math.min(step.to, pos + node.nodeSize),
                        step.mark
                    )
                }
                if (
                    ["em", "strong", "underline"].includes(
                        step.mark.type.name
                    ) &&
                    !node.marks.find(mark => mark.type === step.mark.type)
                ) {
                    const formatChangeMark = node.marks.find(
                        mark => mark.type.name === "format_change"
                    )
                    let after, before
                    if (formatChangeMark) {
                        if (
                            formatChangeMark.attrs.before.includes(
                                step.mark.type.name
                            )
                        ) {
                            before = formatChangeMark.attrs.before.filter(
                                markName => markName !== step.mark.type.name
                            )
                            after = formatChangeMark.attrs.after
                        } else {
                            before = formatChangeMark.attrs.before
                            after = formatChangeMark.attrs.after.concat(
                                step.mark.type.name
                            )
                        }
                    } else {
                        before = []
                        after = [step.mark.type.name]
                    }
                    if (after.length || before.length) {
                        newTr.addMark(
                            Math.max(step.from, pos),
                            Math.min(step.to, pos + node.nodeSize),
                            state.schema.marks.format_change.create({
                                user: user.id,
                                username: user.username,
                                date: date10,
                                before,
                                after
                            })
                        )
                    } else if (formatChangeMark) {
                        newTr.removeMark(
                            Math.max(step.from, pos),
                            Math.min(step.to, pos + node.nodeSize),
                            formatChangeMark
                        )
                    }
                }
            })
        } else if (step instanceof RemoveMarkStep) {
            doc.nodesBetween(step.from, step.to, (node, pos) => {
                if (!node.isInline) {
                    return true
                }
                if (node.marks.find(mark => mark.type.name === "deletion")) {
                    return false
                } else {
                    newTr.removeMark(
                        Math.max(step.from, pos),
                        Math.min(step.to, pos + node.nodeSize),
                        step.mark
                    )
                }

                if (
                    ["em", "strong", "underline"].includes(
                        step.mark.type.name
                    ) &&
                    node.marks.find(mark => mark.type === step.mark.type)
                ) {
                    const formatChangeMark = node.marks.find(
                        mark => mark.type.name === "format_change"
                    )
                    let after, before
                    if (formatChangeMark) {
                        if (
                            formatChangeMark.attrs.after.includes(
                                step.mark.type.name
                            )
                        ) {
                            after = formatChangeMark.attrs.after.filter(
                                markName => markName !== step.mark.type.name
                            )
                            before = formatChangeMark.attrs.before
                        } else {
                            after = formatChangeMark.attrs.after
                            before = formatChangeMark.attrs.before.concat(
                                step.mark.type.name
                            )
                        }
                    } else {
                        after = []
                        before = [step.mark.type.name]
                    }
                    if (after.length || before.length) {
                        newTr.addMark(
                            Math.max(step.from, pos),
                            Math.min(step.to, pos + node.nodeSize),
                            state.schema.marks.format_change.create({
                                user: user.id,
                                username: user.username,
                                date: date10,
                                before,
                                after
                            })
                        )
                    } else if (formatChangeMark) {
                        newTr.removeMark(
                            Math.max(step.from, pos),
                            Math.min(step.to, pos + node.nodeSize),
                            formatChangeMark
                        )
                    }
                }
            })
        }
    })

    // We copy the input type meta data from the original transaction.
    if (tr.getMeta("inputType")) {
        newTr.setMeta("inputType", tr.getMeta("inputType"))
    }
    if (tr.getMeta("uiEvent")) {
        newTr.setMeta("uiEvent", tr.getMeta("uiEvent"))
    }

    if (tr.selectionSet) {
        if (
            tr.selection instanceof TextSelection &&
            (tr.selection.from < state.selection.from ||
                tr.getMeta("inputType") === "deleteContentBackward")
        ) {
            const caretPos = map.map(tr.selection.from, -1)
            newTr.setSelection(new TextSelection(newTr.doc.resolve(caretPos)))
        } else {
            newTr.setSelection(tr.selection.map(newTr.doc, map))
        }
    }
    if (tr.storedMarksSet) {
        newTr.setStoredMarks(tr.storedMarks)
    }
    if (tr.scrolledIntoView) {
        newTr.scrollIntoView()
    }

    return newTr
}
