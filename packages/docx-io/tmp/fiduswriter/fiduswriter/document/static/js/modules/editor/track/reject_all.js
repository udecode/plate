import {Slice} from "prosemirror-model"
import {
    AddMarkStep,
    Mapping,
    RemoveMarkStep,
    ReplaceStep
} from "prosemirror-transform"

import {deactivateAllSelectedChanges} from "../state_plugins"

import {deleteNode} from "./delete"

export const rejectAll = (view, from = 0, to = false) => {
    if (!to) {
        to = view.state.doc.content.size
    }
    const tr = view.state.tr.setMeta("track", true),
        map = new Mapping()
    view.state.doc.nodesBetween(from, to, (node, pos) => {
        if (pos < from && !node.isInline) {
            return true
        }
        let deletedNode = false
        if (node.attrs.track?.find(track => track.type === "insertion")) {
            deleteNode(tr, node, pos, map, false)
            deletedNode = true
        } else if (
            node.marks?.find(
                mark => mark.type.name === "insertion" && !mark.attrs.approved
            )
        ) {
            const delStep = new ReplaceStep(
                map.map(Math.max(pos, from)),
                map.map(Math.min(pos + node.nodeSize, to)),
                Slice.empty
            )
            tr.step(delStep)
            map.appendMap(delStep.getMap())
            deletedNode = true
        } else if (node.attrs.track?.find(track => track.type === "deletion")) {
            const track = node.attrs.track.filter(
                track => track.type !== "deletion"
            )
            tr.setNodeMarkup(
                map.map(pos),
                null,
                Object.assign({}, node.attrs, {track}),
                node.marks
            )
        } else if (node.marks?.find(mark => mark.type.name === "deletion")) {
            tr.removeMark(
                map.map(Math.max(pos, from)),
                map.map(Math.min(pos + node.nodeSize, to)),
                view.state.schema.marks.deletion
            )
        }
        const formatChangeMark = node.marks.find(
            mark => mark.type.name === "format_change"
        )

        if (node.isInline && !deletedNode && formatChangeMark) {
            formatChangeMark.attrs.before.forEach(oldMark =>
                tr.step(
                    new AddMarkStep(
                        map.map(Math.max(pos, from)),
                        map.map(Math.min(pos + node.nodeSize, to)),
                        view.state.schema.marks[oldMark].create()
                    )
                )
            )
            formatChangeMark.attrs.after.forEach(newMark => {
                tr.step(
                    new RemoveMarkStep(
                        map.map(Math.max(pos, from)),
                        map.map(Math.min(pos + node.nodeSize, to)),
                        node.marks.find(mark => mark.type.name === newMark)
                    )
                )
            })

            tr.step(
                new RemoveMarkStep(
                    map.map(Math.max(pos, from)),
                    map.map(Math.min(pos + node.nodeSize, to)),
                    formatChangeMark
                )
            )
        }
        if (!node.isInline && !deletedNode && node.attrs.track) {
            const blockChangeTrack = node.attrs.track.find(
                track => track.type === "block_change"
            )
            if (blockChangeTrack) {
                const track = node.attrs.track.filter(
                    track => track !== blockChangeTrack
                )
                tr.setNodeMarkup(
                    map.map(pos),
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
        }

        return true
    })

    deactivateAllSelectedChanges(tr)

    if (tr.steps.length) {
        view.dispatch(tr)
    }
}
