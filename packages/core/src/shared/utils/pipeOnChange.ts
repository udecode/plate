import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../types/PlateEditor';

export const pipeOnChange = (editor: PlateEditor) => {
  const onChanges = editor.plugins.flatMap(
    (plugin) => plugin.handlers?.onChange?.(editor, plugin) ?? []
  );

  return (nodes: Value) => {
    return onChanges.some((handler) => {
      if (!handler) {
        return false;
      }

      // The custom event handler may return a boolean to specify whether the event
      // shall be treated as being handled or not.
      const shouldTreatEventAsHandled = handler(nodes);

      if (shouldTreatEventAsHandled != null) {
        return shouldTreatEventAsHandled;
      }

      return false;
    });
  };
};
