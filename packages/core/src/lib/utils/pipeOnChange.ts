import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../editor';

import { getPluginContext } from '../plugin';

export const pipeOnChange = (editor: PlateEditor, value: Value) => {
  return editor.pluginList.some((plugin) => {
    const handler = plugin.handlers.onChange;

    if (!handler) {
      return false;
    }

    // The custom event handler may return a boolean to specify whether the event
    // shall be treated as being handled or not.
    const shouldTreatEventAsHandled = handler({
      ...getPluginContext(editor, plugin),
      value,
    });

    if (shouldTreatEventAsHandled != null) {
      return shouldTreatEventAsHandled;
    }

    return false;
  });
};
