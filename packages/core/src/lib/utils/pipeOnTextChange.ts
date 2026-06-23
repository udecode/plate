import type { Descendant, TextOperation } from '@platejs/slate';

import type { SlateEditor } from '../editor/SlateEditor';
import type { AnyEditorPlugin } from '../plugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';

type OnTextChangeContext = Parameters<
  NonNullable<NonNullable<AnyEditorPlugin['handlers']>['onTextChange']>
>[0];

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
