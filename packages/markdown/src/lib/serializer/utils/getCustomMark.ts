import type { SerializeMdOptions } from '../serializeMd';

export const getCustomMark = (options?: SerializeMdOptions): string[] => {
  if (!options?.nodes) {
    return [];
  }

  return Object.entries(options.nodes)
    .filter(([_, parser]) => parser?.mark)
    .map(([key]) => key);
};
