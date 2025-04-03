import type { DeserializeMdOptions } from '../deserializeMd';

import { defaultNodes } from '../../node-rules';

export const getDeserializerByKey = (
  key: string,
  options: DeserializeMdOptions
) => {
  const nodes = options.nodes;

  return nodes?.[key]?.deserialize === undefined
    ? defaultNodes[key]?.deserialize
    : nodes?.[key]?.deserialize;
};
