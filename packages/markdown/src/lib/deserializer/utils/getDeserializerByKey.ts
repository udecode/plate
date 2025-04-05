import type { DeserializeMdOptions } from '../deserializeMd';

import { defaultRules } from '../../rules';

export const getDeserializerByKey = (
  key: string,
  options: DeserializeMdOptions
) => {
  const nodes = options.nodes;

  return nodes?.[key]?.deserialize === undefined
    ? defaultRules[key]?.deserialize
    : nodes?.[key]?.deserialize;
};
