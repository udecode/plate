import { GetLeafDeserializerOptions } from '../types/PluginOptions.types';
import { getNodeDeserializer } from './getNodeDeserializer';

/**
 * See {@link getNodeDeserializer}.
 */
export const getLeafDeserializer = (options: GetLeafDeserializerOptions) =>
  getNodeDeserializer({
    node: () => ({ [options.type]: true }),
    ...options,
  });
