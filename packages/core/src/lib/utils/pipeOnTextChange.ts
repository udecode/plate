import type { Descendant, TextOperation } from '@platejs/slate';

import type { SlateEditor } from '../editor/SlateEditor';

// biome-ignore lint/nursery/useMaxParams: All 5 parameters are necessary for text change handling
export const pipeOnTextChange = (
  editor: SlateEditor,
  node: Descendant,
  text: string,
  prevText: string,
  operation: TextOperation
) => {
  return editor.meta.pluginCache.handlers.onTextChange.some((key) => {
    const plugin = editor.getPlugin({ key });

    // Skip if plugin not found or readOnly
    if (!plugin || editor.dom?.readOnly) {
      return false;
    }

    const handler = plugin.handlers?.onTextChange;
    if (!handler) {
      return false;
    }

    // The custom event handler may return a boolean to specify whether the event
    // shall be treated as being handled or not.
    const shouldTreatEventAsHandled = handler({
      editor,
      node,
      operation,
      plugin,
      prevText,
      text,
    } as any);

    if (shouldTreatEventAsHandled != null) {
      return shouldTreatEventAsHandled;
    }

    return false;
  });
};
