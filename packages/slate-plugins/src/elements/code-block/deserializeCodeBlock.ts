import { DeserializeHtml } from '@udecode/slate-plugins-core';
import { getElementDeserializer } from '../../common/utils/getElementDeserializer';
import { setDefaults } from '../../common/utils/setDefaults';
import { DEFAULTS_CODE_BLOCK } from './defaults';
import {
  CodeBlockDeserializeOptions,
  CodeLineDeserializeOptions,
} from './types';

// FIXME Handle code_line

export const deserializeCodeBlock = (
  options?: CodeBlockDeserializeOptions & CodeLineDeserializeOptions
): DeserializeHtml => {
  const { code_block, code_line } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  return {
    element: [
      ...getElementDeserializer({
        type: code_block.type,
        rules: [{ nodeNames: 'PRE' }],
        ...options?.code_block?.deserialize,
      }),
      ...getElementDeserializer({
        type: code_line.type,
        rules: [{ nodeNames: 'DIV' }],
        ...options?.code_line?.deserialize,
      }),
    ],
  };
};
