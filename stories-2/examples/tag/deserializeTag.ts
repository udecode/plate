import { getNodeDeserializer, setDefaults } from '@udecode/slate-plugins';
import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { DEFAULTS_TAG } from './defaults';
import { TagDeserializeOptions } from './types';

export const deserializeTag = (
  options?: TagDeserializeOptions
): DeserializeHtml => {
  const { tag } = setDefaults(options, DEFAULTS_TAG);

  return {
    element: getNodeDeserializer({
      type: tag.type,
      node: (el) => ({
        type: tag.type,
        url: el.getAttribute('href'),
      }),
      rules: [{ nodeNames: 'A' }],
    }),
  };
};
