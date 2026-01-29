import {Slice} from "prosemirror-model"
import {liftListItem} from "prosemirror-schema-list"
import {EditorState, Selection, TextSelection} from "prosemirror-state"
import {
    ReplaceAroundStep,
    ReplaceStep,
    replaceStep
} from "prosemirror-transform"

export const deleteNode = (tr, node, nodePos, map, accept) => {
    // Delete a node either because a deletion has been accepted or an insertion rejected.
    const newNodePos = map.map(nodePos),
        trackType = accept ? "deletion" : "insertion"
    let delStep
    if (node.isTextblock) {
        const selectionBefore = Selection.findFrom(
            tr.doc.resolve(newNodePos),
            -1
        )
        if (selectionBefore instanceof TextSelection) {
            const start = selectionBefore.$anchor.pos,
                end = newNodePos + 1
            let allowMerge = true
            // Make sure there is no isolating nodes inbetween.
            tr.doc.nodesBetween(start, end, (node, pos) => {
                if (pos < start) {
                    return true
                }
                if (node.type.spec.isolating) {
                    allowMerge = false
                }
            })
            if (allowMerge) {
                delStep = replaceStep(tr.doc, start, end)
            } else {
                const track = node.attrs.track.filter(
                    track => track.type !== trackType
                )
                tr.setNodeMarkup(
                    newNodePos,
                    null,
                    Object.assign({}, node.attrs, {track}),
                    node.marks
                )
            }
        } else {
            // There is a block node right in front of it that cannot be removed. Give up. (table/figure/etc.)
            const track = node.attrs.track.filter(
                track => track.type !== trackType
            )
            tr.setNodeMarkup(
                newNodePos,
                null,
                Object.assign({}, node.attrs, {track}),
                node.marks
            )
        }
    } else if (node.isLeaf || ["figure", "table"].includes(node.type.name)) {
        delStep = new ReplaceStep(
            newNodePos,
            map.map(nodePos + node.nodeSize),
            Slice.empty
        )
    } else if (node.type === tr.doc.type.schema.nodes["list_item"]) {
        const state = EditorState.create({
            doc: tr.doc,
            selection: Selection.findFrom(tr.doc.resolve(newNodePos), 1)
        })
        liftListItem(node.type)(state, newTr => {
            newTr.steps.forEach(step => {
                tr.step(step)
                map.appendMap(step.getMap())
            })
        })
    } else {
        const end = map.map(nodePos + node.nodeSize)
        delStep = new ReplaceAroundStep(
            newNodePos,
            end,
            newNodePos + 1,
            end - 1,
            Slice.empty,
            0,
            true
        )
    }
    if (delStep) {
        tr.step(delStep)
        const stepMap = delStep.getMap()
        map.appendMap(stepMap)
    }
}
