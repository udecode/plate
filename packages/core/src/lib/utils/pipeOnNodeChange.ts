import type { Descendant, NodeOperation } from '@platejs/plite';

import type { BasePlateEditor } from '../editor/BasePlateEditor';
import type { AnyEditorPlugin } from '../plugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';

type OnNodeChangeContext = Parameters<
  NonNullable<NonNullable<AnyEditorPlugin['handlers']>['onNodeChange']>
>[0];

export const pipeOnNodeChange = (
  editor: BasePlateEditor,
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
    const context: OnNodeChangeContext = {
      ...getEditorPlugin(editor, plugin),
      editor,
      node,
      operation,
      plugin,
      prevNode,
    };
    const shouldTreatEventAsHandled = handler(context);

    if (shouldTreatEventAsHandled != null) {
      return shouldTreatEventAsHandled;
    }

    return false;
  });
};
