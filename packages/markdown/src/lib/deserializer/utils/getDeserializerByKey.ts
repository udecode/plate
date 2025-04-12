import type { DeserializeMdOptions } from '../deserializeMd';

import { defaultRules } from '../../rules';

export const getDeserializerByKey = (
  key: string,
  options: DeserializeMdOptions
) => {
  const rules = options.rules;

  return rules?.[key]?.deserialize === undefined
    ? defaultRules[key]?.deserialize
    : rules?.[key]?.deserialize;
};
