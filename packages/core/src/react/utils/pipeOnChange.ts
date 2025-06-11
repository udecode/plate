import type { Value } from '@platejs/slate';

import type { PlateEditor } from '../editor/PlateEditor';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { getPlugin } from '../plugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';

export const pipeOnChange = (editor: PlateEditor, value: Value) => {
  return editor.meta.pluginCache.handlers.onChange.some((key) => {
    const plugin = getPlugin(editor, { key });

    if (isEditOnly(editor.dom.readOnly, plugin, 'handlers')) {
      return false;
    }

    const handler = plugin.handlers.onChange!;

    // The custom event handler may return a boolean to specify whether the event
    // shall be treated as being handled or not.
    const shouldTreatEventAsHandled = handler({
      ...(getEditorPlugin(editor, plugin) as any),
      value,
    });

    if (shouldTreatEventAsHandled != null) {
      return shouldTreatEventAsHandled;
    }

    return false;
  });
};
