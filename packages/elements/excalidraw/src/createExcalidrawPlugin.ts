import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_EXCALIDRAW } from './defaults';
import { getExcalidrawDeserialize } from './getExcalidrawDeserialize';

/**
 * Enables support for Excalidraw drawing tool within a Slate document
 */
export const createExcalidrawPlugin = ({
  key = ELEMENT_EXCALIDRAW,
}: {
  key?: string;
} = {}): PlatePlugin => ({
  key,
  isElement: true,
  isVoid: true,
  deserialize: getExcalidrawDeserialize(key),
});
