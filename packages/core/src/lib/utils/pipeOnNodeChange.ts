import type { Descendant, NodeOperation } from '@platejs/slate';

import type { SlateEditor } from '../editor/SlateEditor';

export const pipeOnNodeChange = (
  editor: SlateEditor,
  node: Descendant,
  prevNode: Descendant,
  operation: NodeOperation
) => {
  return editor.meta.pluginCache.handlers.onNodeChange.some((key) => {
    const plugin = editor.getPlugin({ key });

    // Skip if plugin not found or readOnly
    if (!plugin || editor.dom?.readOnly) {
      return false;
    }

    const handler = plugin.handlers?.onNodeChange;
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
      prevNode,
    } as any);

    if (shouldTreatEventAsHandled != null) {
      return shouldTreatEventAsHandled;
    }

    return false;
  });
};
