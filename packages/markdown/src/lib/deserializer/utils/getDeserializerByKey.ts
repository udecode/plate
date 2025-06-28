import type { DeserializeMdOptions } from '../deserializeMd';

import { rebuildRules } from '../../rules/defaultRules';

export const getDeserializerByKey = (
  key: string,
  options: DeserializeMdOptions
) => {
  const rules = options.rules;

  return rules?.[key]?.deserialize === undefined
    ? rebuildRules(options.editor!)[key]?.deserialize
    : rules?.[key]?.deserialize;
};
