import { AnyObject, createPluginFactory } from '@udecode/plate-common';

export const ELEMENT_EXCALIDRAW = 'excalidraw';

/**
 * Enables support for Excalidraw drawing tool within a Slate document
 */
export const createExcalidrawPlugin = createPluginFactory<AnyObject>({
  key: ELEMENT_EXCALIDRAW,
  isElement: true,
  isVoid: true,
});
