import type { SerializeMdOptions } from '../serializeMd';

export const getCustomMark = (options?: SerializeMdOptions): string[] => {
  if (!options?.rules) {
    return [];
  }

  return Object.entries(options.rules)
    .filter(([_, parser]) => parser?.mark)
    .map(([key]) => key);
};
