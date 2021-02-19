import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import { CodeBlockDeserializeOptions } from './types';

// FIXME Handle code_block_line

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
