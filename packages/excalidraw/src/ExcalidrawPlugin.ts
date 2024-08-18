import { createSlatePlugin } from '@udecode/plate-common';

/** Enables support for Excalidraw drawing tool within a Slate document */
export const ExcalidrawPlugin = createSlatePlugin({
  isElement: true,
  isVoid: true,
  key: 'excalidraw',
});
