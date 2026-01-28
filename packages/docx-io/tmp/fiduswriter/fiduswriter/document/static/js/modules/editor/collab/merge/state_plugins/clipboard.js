import {Plugin, PluginKey, TextSelection} from "prosemirror-state"
import {docClipboardSerializer} from "../../../clipboard/copy"

const key = new PluginKey("clipboard")
export const clipboardPlugin = options => {
    return new Plugin({
        key,
        props: {
            handleDrop: (view, event, slice, moved) => {
                if (moved || (slice && slice.size)) {
                    return false // Something other than en empty plain text string from outside. Handled by PM already.
                }
                const eventPos = view.posAtCoords({
                    left: event.clientX,
                    top: event.clientY
                })
                if (!eventPos) {
                    return false
                }
                const $mouse = view.state.doc.resolve(eventPos.pos)
                if (!$mouse) {
                    return false
                }
                const tr = view.state.tr
                tr.setSelection(new TextSelection($mouse))
                view.dispatch(tr)
                return true
            },
            clipboardSerializer: docClipboardSerializer(options.editor)
        }
    })
}
