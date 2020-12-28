import {
  getLeafDeserializer,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { DEFAULTS_STRIKETHROUGH } from './defaults';
import { StrikethroughDeserializeOptions } from './types';

export const deserializeStrikethrough = (
  options?: StrikethroughDeserializeOptions
): DeserializeHtml => {
  const { strikethrough } = setDefaults(options, DEFAULTS_STRIKETHROUGH);

  return {
    leaf: getLeafDeserializer({
      type: strikethrough.type,
      rules: [
        { nodeNames: ['S', 'DEL', 'STRIKE'] },
        {
          style: {
            textDecoration: 'line-through',
          },
        },
      ],
      ...options?.strikethrough?.deserialize,
    }),
  };
};
