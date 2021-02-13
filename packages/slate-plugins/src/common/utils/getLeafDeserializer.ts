import {
  getNodeDeserializer,
  GetNodeDeserializerOptions,
  WithOptional,
} from './getNodeDeserializer';

export interface GetLeafDeserializerOptions
  extends WithOptional<
    Omit<GetNodeDeserializerOptions, 'withoutChildren'>,
    'node'
  > {
  type: string;
}

/**
 * See {@link getNodeDeserializer}.
 */
export const getLeafDeserializer = (options: GetLeafDeserializerOptions) =>
  getNodeDeserializer({
    node: () => ({ [options.type]: true }),
    ...options,
  });
