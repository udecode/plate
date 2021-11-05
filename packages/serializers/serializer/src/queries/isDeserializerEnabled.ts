import { PlateEditor, PlatePlugin } from '@udecode/plate-core';

export const isDeserializerEnabled = <T = {}>(
  editor: PlateEditor<T>,
  plugins: PlatePlugin<T>[],
  deserializerId: string
) =>
  plugins.every(
    ({ deserialize }) => !deserialize?.(editor).isDisabled?.(deserializerId)
  );
