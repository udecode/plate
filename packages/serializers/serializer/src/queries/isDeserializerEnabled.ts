import { PlateEditor } from '@udecode/plate-core';

export const isDeserializerEnabled = <T = {}>(
  editor: PlateEditor<T>,
  deserializerId: string
) =>
  editor.plugins.every((plugin) => {
    return !plugin.deserialize?.(editor, plugin).isDisabled?.(deserializerId);
  });
