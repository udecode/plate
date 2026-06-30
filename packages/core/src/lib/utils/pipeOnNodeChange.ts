import type { Descendant, NodeOperation } from '@platejs/plite';

import type { BaseEditor } from '../editor/SlateEditor';
import type { AnyBasePlugin } from '../plugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';

type OnNodeChangeContext = Parameters<
  NonNullable<NonNullable<AnyBasePlugin['handlers']>['onNodeChange']>
>[0];

export const pipeOnNodeChange = (
  editor: BaseEditor,
  node: Descendant,
  prevNode: Descendant,
  operation: NodeOperation
) => {
  return editor.runtime.pluginCache.handlers.onNodeChange.some((key) => {
    const plugin = editor.getPlugin({ key });

    // Skip if plugin not found or readOnly
    if (!plugin || editor.api.dom.isReadOnly()) {
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
