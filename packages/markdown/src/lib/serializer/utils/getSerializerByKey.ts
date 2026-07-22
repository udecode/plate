import type { SerializeMdContext } from '../../types';

export const getSerializerByKey = (key: string, options: SerializeMdContext) =>
  options.rules?.[key]?.serialize;
