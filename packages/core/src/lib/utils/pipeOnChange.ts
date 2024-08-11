import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../editor';

export const pipeOnChange = (editor: PlateEditor, value: Value) => {
  return editor.plugins.some((plugin) => {
    const handler = plugin.handlers.onChange;

    if (!handler) {
      return false;
    }

    // The custom event handler may return a boolean to specify whether the event
    // shall be treated as being handled or not.
    const shouldTreatEventAsHandled = handler({ editor, plugin, value });

    if (shouldTreatEventAsHandled != null) {
      return shouldTreatEventAsHandled;
    }

    return false;
  });
};
