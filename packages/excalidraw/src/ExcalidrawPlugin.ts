import { createPlugin } from '@udecode/plate-common';

/** Enables support for Excalidraw drawing tool within a Slate document */
export const ExcalidrawPlugin = createPlugin({
  isElement: true,
  isVoid: true,
  key: 'excalidraw',
});
