import { PlateEditor } from '../types/PlateEditor';
import { OnChange } from '../types/plugins/PlatePlugin/OnChange';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';

export const pipeOnChange = (
  editor: PlateEditor,
  plugins: PlatePlugin[] = []
): ReturnType<OnChange> => {
  const onChanges = plugins.flatMap(
    (plugin) => plugin.onChange?.(editor, plugin) ?? []
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
