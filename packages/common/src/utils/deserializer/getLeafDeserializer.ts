import { LeafDeserializePlugin } from '@udecode/plate-core';
import { getNodeDeserializer } from './getNodeDeserializer';

/**
 * See {@link getNodeDeserializer}.
 */
export const getLeafDeserializer = (options: LeafDeserializePlugin) =>
  getNodeDeserializer({
    getNode: () => ({ [options.type!]: true }),
    ...options,
  });
