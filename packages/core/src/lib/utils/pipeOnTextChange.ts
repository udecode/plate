import type { Descendant, TextOperation } from '@platejs/plite';

import type { BaseEditor } from '../editor/BaseEditor';
import type { AnyBasePlugin } from '../plugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';

type OnTextChangeContext = Parameters<
  NonNullable<NonNullable<AnyBasePlugin['handlers']>['onTextChange']>
>[0];

export const pipeOnTextChange = (
  editor: BaseEditor,
  node: Descendant,
  text: string,
  prevText: string,
  operation: TextOperation
) => {
  return editor.runtime.pluginCache.handlers.onTextChange.some((key) => {
    const plugin = editor.getPlugin({ key });

    // Skip if plugin not found or readOnly
    if (!plugin || editor.read.view.isReadOnly()) {
      return false;
    }

    const handler = plugin.handlers?.onTextChange;
    if (!handler) {
      return false;
    }

    // The custom event handler may return a boolean to specify whether the event
    // shall be treated as being handled or not.
    const context: OnTextChangeContext = {
      ...getEditorPlugin(editor, plugin),
      editor,
      node,
      operation,
      plugin,
      prevText,
      text,
    };
    const shouldTreatEventAsHandled = handler(context);

    if (shouldTreatEventAsHandled != null) {
      return shouldTreatEventAsHandled;
    }

    return false;
  });
};
