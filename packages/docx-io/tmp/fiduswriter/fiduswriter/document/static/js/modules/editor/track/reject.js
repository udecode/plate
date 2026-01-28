import {AddMarkStep, Mapping, RemoveMarkStep} from "prosemirror-transform"

import {deactivateAllSelectedChanges} from "../state_plugins"
import {deleteNode} from "./delete"

export const reject = (type, pos, view) => {
    const tr = view.state.tr.setMeta("track", true),
        map = new Mapping()
    let reachedEnd = false,
        inlineChange = false
    const trackMark = view.state.doc
        .nodeAt(pos)
        .marks.find(mark => mark.type.name === type)
    view.state.doc.nodesBetween(
        pos,
        view.state.doc.nodeSize - 2,
        (node, nodePos) => {
            if (nodePos < pos) {
                return true
            }
            if (reachedEnd) {
                return false
            }
            if (!node.isInline) {
                reachedEnd = true // Changes on inline nodes are applied/reject until next non-inline node. Non-inline node changes are only applied that one node by default.
                if (inlineChange) {
                    // Change has already affected inline node. Don't apply to block level.
                    return false
                }
            } else if (!trackMark.isInSet(node.marks)) {
                reachedEnd = true
                return false
            } else {
                inlineChange = true
            }
            if (type === "insertion") {
                deleteNode(tr, node, nodePos, map, false)
            } else if (type === "deletion") {
                if (node.attrs.track) {
                    const track = node.attrs.track.filter(
                        track => track.type !== "deletion"
                    )
                    tr.setNodeMarkup(
                        map.map(nodePos),
                        null,
                        Object.assign({}, node.attrs, {track}),
                        node.marks
                    )
                    reachedEnd = true
                } else {
                    tr.removeMark(
                        map.map(nodePos),
                        map.map(nodePos + node.nodeSize),
                        view.state.schema.marks.deletion
                    )
                }
            } else if (type === "format_change") {
                trackMark.attrs.before.forEach(oldMark =>
                    tr.step(
                        new AddMarkStep(
                            map.map(nodePos),
                            map.map(nodePos + node.nodeSize),
                            view.state.schema.marks[oldMark].create()
                        )
                    )
                )
                trackMark.attrs.after.forEach(newMark => {
                    tr.step(
                        new RemoveMarkStep(
                            map.map(nodePos),
                            map.map(nodePos + node.nodeSize),
                            node.marks.find(mark => mark.type.name === newMark)
                        )
                    )
                })
                tr.step(
                    new RemoveMarkStep(
                        map.map(nodePos),
                        map.map(nodePos + node.nodeSize),
                        trackMark
                    )
                )
            } else if (type === "block_change") {
                const blockChangeTrack = node.attrs.track?.find(
                        track => track.type === "block_change"
                    ),
                    track = node.attrs.track?.filter(
                        track => track !== blockChangeTrack
                    )
                if (!blockChangeTrack) {
                    return true
                }
                tr.setNodeMarkup(
                    map.map(nodePos),
                    view.state.schema.nodes[blockChangeTrack.before.type],
                    Object.assign(
                        {},
                        node.attrs,
                        blockChangeTrack.before.attrs,
                        {
                            track
                        }
                    ),
                    node.marks
                )
            }
            return true
        }
    )

    deactivateAllSelectedChanges(tr)

    if (tr.steps.length) {
        view.dispatch(tr)
    }
}
