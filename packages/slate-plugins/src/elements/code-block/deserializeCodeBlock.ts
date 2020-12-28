import {
  getElementDeserializer,
  setDefaults,
} from '@udecode/slate-plugins-common';
import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import { CodeBlockDeserializeOptions } from './types';

export const deserializeCodeBlock = (
  options?: CodeBlockDeserializeOptions
): DeserializeHtml => {
  const { code_block } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  return {
    element: getElementDeserializer({
      type: code_block.type,
      rules: [{ nodeNames: 'PRE' }],
      ...options?.code_block?.deserialize,
    }),
  };
};
