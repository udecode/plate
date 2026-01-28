import {GapCursor} from "prosemirror-gapcursor"
import {Plugin, PluginKey, TextSelection} from "prosemirror-state"

// A plugin that makes sure that the selecion is not put into a node that has been
// hidden.

const posHidden = $pos => {
    let hidden = false
    for (let i = $pos.depth; i > 0; i--) {
        const node = $pos.node(i)
        if (
            node.attrs.hidden ||
            (["table_caption", "figure_caption"].includes(node.type.name) &&
                $pos.node(i - 1).attrs.caption === false)
        ) {
            hidden = true
        }
    }
    return hidden
}

const key = new PluginKey("jump-hidden-nodes")
export const jumpHiddenNodesPlugin = _options =>
    new Plugin({
        key,
        appendTransaction: (trs, oldState, state) => {
            if (state.selection.from !== state.selection.to) {
                // Only applies to collapsed selection
                return
            }
            const selectionSet = trs.find(tr => tr.selectionSet)

            if (selectionSet && posHidden(state.selection.$from)) {
                const dir =
                    state.selection.from > oldState.selection.from ? 1 : -1
                let newPos = state.selection.from,
                    hidden = true,
                    validTextSelection = false,
                    validGapCursor = false,
                    $pos
                while (hidden || (!validGapCursor && !validTextSelection)) {
                    newPos += dir
                    if (newPos === 0 || newPos === state.doc.nodeSize) {
                        // Could not find any valid position
                        return
                    }
                    $pos = state.doc.resolve(newPos)
                    validTextSelection = $pos.parent.inlineContent
                    validGapCursor = GapCursor.valid($pos)
                    hidden = posHidden($pos)
                }
                const selection = validTextSelection
                    ? new TextSelection($pos)
                    : new GapCursor($pos)
                return state.tr.setSelection(selection)
            }
        }
    })
