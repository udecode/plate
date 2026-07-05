import type { ValueOf } from '@platejs/plite';

import type { PlateEditor } from '../editor/PlateEditor';

import { isEditOnly } from '../../internal/plugin/isEditOnlyDisabled';
import { getPlugin } from '../plugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';

export const pipeOnChange = <E extends PlateEditor>(
  editor: E,
  value: ValueOf<E>
) => {
  return editor.runtime.pluginCache.handlers.onChange.some((key) => {
    const plugin = getPlugin(editor, { key });

    if (isEditOnly(editor.read.view.isReadOnly(), plugin, 'handlers')) {
      return false;
    }

    const handler = plugin.handlers.onChange!;

    // The custom event handler may return a boolean to specify whether the event
    // shall be treated as being handled or not.
    const shouldTreatEventAsHandled = handler({
      ...getEditorPlugin(editor, plugin),
      value,
    });

    if (shouldTreatEventAsHandled != null) {
      return shouldTreatEventAsHandled;
    }

    return false;
  });
};
