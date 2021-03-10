import { GetElementDeserializerOptions } from '../types/Deserialize';
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
