import type { DeserializeMdOptions } from '../deserializeMd';

import { buildRules } from '../../rules/defaultRules';

export const getDeserializerByKey = (
  key: string,
  options: DeserializeMdOptions
) => {
  const rules = options.rules;

  return rules?.[key]?.deserialize === undefined
    ? buildRules(options.editor!)[key]?.deserialize
    : rules?.[key]?.deserialize;
};
