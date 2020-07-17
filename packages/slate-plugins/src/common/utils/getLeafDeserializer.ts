import {
  getNodeDeserializer,
  GetNodeDeserializerOptions,
} from './getNodeDeserializer';

export interface GetLeafDeserializerOptions
  extends Omit<GetNodeDeserializerOptions, 'node'> {
  type: string;
}

/**
 * See {@link getNodeDeserializer}.
 */
export const getLeafDeserializer = (options: GetLeafDeserializerOptions) =>
  getNodeDeserializer({
    ...options,
    node: () => ({ [options.type]: true }),
  });
