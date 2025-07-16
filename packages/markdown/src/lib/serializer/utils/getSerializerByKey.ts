import type { SerializeMdOptions } from '../serializeMd';

import { buildRules } from '../../rules/defaultRules';

export const getSerializerByKey = (
  key: string,
  options: SerializeMdOptions
) => {
  const nodes = options.rules;


  const rules = buildRules(options.editor!)

  return nodes?.[key]?.serialize === undefined
    ? rules[key]?.serialize
    : nodes?.[key]?.serialize;
};
