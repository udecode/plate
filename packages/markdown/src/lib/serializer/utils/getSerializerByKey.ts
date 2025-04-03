import type { SerializeMdOptions } from '../serializeMd';

import { defaultNodes } from '../../node-rules';

export const getSerializerByKey = (
  key: string,
  options: SerializeMdOptions
) => {
  const nodes = options.nodes;

  return nodes?.[key]?.serialize === undefined
    ? defaultNodes[key]?.serialize
    : nodes?.[key]?.serialize;
};
