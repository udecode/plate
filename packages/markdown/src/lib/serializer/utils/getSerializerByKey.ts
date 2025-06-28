import type { SerializeMdOptions } from '../serializeMd';

import { rebuildRules } from '../../rules/defaultRules';

export const getSerializerByKey = (
  key: string,
  options: SerializeMdOptions
) => {
  const nodes = options.rules;

  return nodes?.[key]?.serialize === undefined
    ? rebuildRules(options.editor!)[key]?.serialize
    : nodes?.[key]?.serialize;
};
