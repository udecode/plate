import type { SerializeMdOptions } from '../serializeMd';

import { buildRules } from '../../rules/defaultRules';

export const getSerializerByKey = (
  key: string,
  options: SerializeMdOptions
) => {
  const nodes = options.rules;

  return nodes?.[key]?.serialize === undefined
    ? buildRules(options.editor!)[key]?.serialize
    : nodes?.[key]?.serialize;
};
