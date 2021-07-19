import { OnChange } from '../types/SlatePlugin/OnChange';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';

export const pipeOnChange = (
  editor: SPEditor,
  plugins: SlatePlugin[] = []
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
