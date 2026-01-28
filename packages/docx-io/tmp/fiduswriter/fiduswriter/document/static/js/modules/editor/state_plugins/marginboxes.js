import {Plugin, PluginKey} from "prosemirror-state"

const key = new PluginKey("marginboxes")
export const marginboxesPlugin = options =>
    new Plugin({
        key,
        view(_editorState) {
            return {
                update: (view, _prevState) => {
                    options.editor.mod.marginboxes.view(view)
                }
            }
        }
    })
