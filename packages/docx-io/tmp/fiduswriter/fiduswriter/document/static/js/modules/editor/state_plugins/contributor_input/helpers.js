import {GapCursor} from "prosemirror-gapcursor"
import {TextSelection} from "prosemirror-state"

export const nextSelection = (state, pos, dir) => {
    let newSelection
    let newPos = pos
    let $newPos

    while (!newSelection) {
        newPos += dir
        if (newPos === 0 || newPos === state.doc.nodeSize) {
            // Could not find any valid position
            break
        }
        $newPos = state.doc.resolve(newPos)
        if ($newPos.parent.inlineContent) {
            newSelection = new TextSelection($newPos)
        } else if (GapCursor.valid($newPos)) {
            newSelection = new GapCursor($newPos)
        }
    }

    return newSelection
}
