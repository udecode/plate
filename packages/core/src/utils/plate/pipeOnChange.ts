import { Value } from '@udecode/slate';
import { PlateEditor } from '../../types/plate/PlateEditor';

export const pipeOnChange = <V extends Value>(editor: PlateEditor<V>) => {
  const onChanges = editor.plugins.flatMap(
    (plugin) => plugin.handlers?.onChange?.(editor, plugin) ?? []
  );

  return (nodes: V) => {
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
