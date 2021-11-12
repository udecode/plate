import { ElementDeserializePlugin } from '@udecode/plate-core';
import { getNodeDeserializer } from './getNodeDeserializer';

/**
 * See {@link getNodeDeserializer}.
 */
export const getElementDeserializer = (options: ElementDeserializePlugin) =>
  getNodeDeserializer({
    getNode: () => ({ type: options.type }),
    ...options,
  });
