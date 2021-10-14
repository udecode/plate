import { PlatePlugin, SPEditor } from '@udecode/plate-core';

export const isDeserializerEnabled = <TEditor extends SPEditor = SPEditor>(
  editor: TEditor,
  plugins: PlatePlugin<TEditor>[],
  deserializerId: string
) =>
  plugins.every(
    ({ deserialize }) => !deserialize?.(editor).isDisabled?.(deserializerId)
  );
