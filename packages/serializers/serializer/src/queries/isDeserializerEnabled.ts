import { PlateEditor, PlatePlugin, TPlateEditor } from '@udecode/plate-core';

export const isDeserializerEnabled = <T = TPlateEditor>(
  editor: PlateEditor<T>,
  plugins: PlatePlugin<T>[],
  deserializerId: string
) =>
  plugins.every(
    ({ deserialize }) => !deserialize?.(editor).isDisabled?.(deserializerId)
  );
