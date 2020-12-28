import { GetElementDeserializerOptions } from '../types/PluginOptions.types';
import { getNodeDeserializer } from './getNodeDeserializer';

/**
 * See {@link getNodeDeserializer}.
 */
export const getElementDeserializer = (
  options: GetElementDeserializerOptions
) =>
  getNodeDeserializer({
    node: () => ({ type: options.type }),
    ...options,
  });
