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

export const submitTag = (tagInputView, view, getPos) => {
    const tagState = tagInputView.state
    const selectionTo = tagState.selection.to
    const tag =
        selectionTo > 1
            ? tagState.doc.textBetween(1, selectionTo)
            : tagState.doc.textContent
    if (tag.length) {
        try {
            const eState = view.state,
                startPos = getPos()

            // Validate that the position is still valid
            if (
                startPos === null ||
                startPos === undefined ||
                startPos < 0 ||
                startPos >= eState.doc.content.size
            ) {
                // Position is out of range, node was likely removed or moved
                return
            }

            const nodeAtPos = view.state.doc.nodeAt(startPos)
            if (!nodeAtPos) {
                // Node no longer exists at this position
                return
            }

            const pos = startPos + nodeAtPos.nodeSize - 1,
                node = eState.schema.nodes.tag.create({tag})
            view.dispatch(view.state.tr.insert(pos, node))
            tagInputView.dispatch(
                tagState.tr.delete(
                    1,
                    selectionTo > 1 ? selectionTo : tagState.doc.nodeSize - 3
                )
            )
        } catch (_e) {
            // If there's any error during tag submission (e.g., position became invalid),
            // silently fail to avoid disrupting the user's workflow
        }
    }
}
