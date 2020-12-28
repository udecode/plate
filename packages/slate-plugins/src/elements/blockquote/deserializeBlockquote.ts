import {
  getElementDeserializer,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { DEFAULTS_BLOCKQUOTE } from './defaults';
import { BlockquoteDeserializeOptions } from './types';

export const deserializeBlockquote = (
  options?: BlockquoteDeserializeOptions
): DeserializeHtml => {
  const { blockquote } = setDefaults(options, DEFAULTS_BLOCKQUOTE);

  return {
    element: getElementDeserializer({
      type: blockquote.type,
      rules: [{ nodeNames: 'BLOCKQUOTE' }],
      ...options?.blockquote?.deserialize,
    }),
  };
};
