import { PlatePlugin, SPEditor } from '@udecode/plate-core';

export const isDeserializerEnabled = (
  editor: SPEditor,
  plugins: PlatePlugin[] = [],
  deserializerId: string
) =>
  plugins.reduce(
    (all, { deserialize }) =>
      all || (deserialize?.(editor).isDisabled?.(deserializerId) ?? true),
    true
  );
