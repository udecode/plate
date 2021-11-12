import { PlateEditor, PlatePlugin } from '@udecode/plate-core';

export const isDeserializerEnabled = <T = {}>(
  editor: PlateEditor<T>,
  plugins: PlatePlugin<T>[],
  deserializerId: string
) =>
  plugins.every((plugin) => {
    return !plugin.deserialize?.(editor, plugin).isDisabled?.(deserializerId);
  });
