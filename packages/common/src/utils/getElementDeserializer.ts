import { GetElementDeserializerOptions } from '@udecode/slate-plugins-core';
import { getNodeDeserializer } from './getNodeDeserializer';

/**
 * See {@link getNodeDeserializer}.
 */
export const getElementDeserializer = (
  options: GetElementDeserializerOptions
) =>
  getNodeDeserializer({
    getNode: () => ({ type: options.type }),
    ...options,
  });
