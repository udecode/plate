import {
  getElementDeserializer,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { DEFAULTS_PARAGRAPH } from './defaults';
import { ParagraphDeserializeOptions } from './types';

export const deserializeParagraph = (
  options?: ParagraphDeserializeOptions
): DeserializeHtml => {
  const { p } = setDefaults(options, DEFAULTS_PARAGRAPH);

  return {
    element: getElementDeserializer({
      type: p.type,
      rules: [{ nodeNames: 'P' }],
      ...options?.p?.deserialize,
    }),
  };
};
