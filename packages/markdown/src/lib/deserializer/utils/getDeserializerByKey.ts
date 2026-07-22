import type { DeserializeMdContext } from '../../types';

export const getDeserializerByKey = (
  type: string,
  options: DeserializeMdContext
) => {
  const key = options.getPluginKey(type) ?? type;

  return options.rules?.[key]?.deserialize;
};
