import type { Descendant, NodeOperation } from '@platejs/plite';

import type { BaseEditor } from '../editor/BaseEditor';
import type { AnyBasePlugin } from '../plugin';
import { getBasePlugin } from '../plugin/getBasePlugin';

type OnNodeChangeContext = Parameters<
  NonNullable<NonNullable<AnyBasePlugin['handlers']>['onNodeChange']>
>[0];

export const pipeOnNodeChange = (
  editor: BaseEditor,
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
      ...getBasePlugin(editor, plugin),
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
