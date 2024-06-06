import { createPluginFactory } from '@udecode/plate-common/server';

export const ELEMENT_EXCALIDRAW = 'excalidraw';

/** Enables support for Excalidraw drawing tool within a Slate document */
export const createExcalidrawPlugin = createPluginFactory({
  isElement: true,
  isVoid: true,
  key: ELEMENT_EXCALIDRAW,
});
