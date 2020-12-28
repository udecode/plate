import {
  getNodeDeserializer,
  GetNodeDeserializerOptions,
  WithOptional,
} from './getNodeDeserializer';

export interface GetElementDeserializerOptions
  extends WithOptional<GetNodeDeserializerOptions, 'node'> {
  type: string;
}

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
