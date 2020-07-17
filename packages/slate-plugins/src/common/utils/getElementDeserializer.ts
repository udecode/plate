import {
  getNodeDeserializer,
  GetNodeDeserializerOptions,
} from './getNodeDeserializer';

export interface GetElementDeserializerOptions
  extends Omit<GetNodeDeserializerOptions, 'node'> {
  type: string;
}

/**
 * See {@link getNodeDeserializer}.
 */
export const getElementDeserializer = (
  options: GetElementDeserializerOptions
) =>
  getNodeDeserializer({
    ...options,
    node: () => ({ type: options.type }),
  });
