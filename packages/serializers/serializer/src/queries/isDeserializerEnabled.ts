import { PlatePlugin, SPEditor } from '@udecode/plate-core';

export const isDeserializerEnabled = <TEditor extends SPEditor = SPEditor>(
  editor: TEditor,
  plugins: PlatePlugin<TEditor>[] = [],
  deserializerId: string
) =>
  plugins.reduce(
    (all, { deserialize }) =>
      all && (!deserialize?.(editor).isDisabled?.(deserializerId) ?? true),
    true
  );
