import { Value } from '../slate/editor/TEditor';
import { PlateEditor } from '../types/PlateEditor';
import { OnChange } from '../types/plugins/OnChange';

export const pipeOnChange = <V extends Value>(
  editor: PlateEditor<V>
): ReturnType<OnChange<V>> => {
  const onChanges = editor.plugins.flatMap(
    (plugin) => plugin.handlers?.onChange?.(editor, plugin) ?? []
  );

  return (nodes) => {
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
