import { OnChange } from '../types/PlatePlugin/OnChange';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { SPEditor } from '../types/SPEditor';

export const pipeOnChange = (
  editor: SPEditor,
  plugins: PlatePlugin[] = []
): ReturnType<OnChange> => {
  const onChanges = plugins.flatMap(
    (plugin) => plugin.onChange?.(editor) ?? []
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
