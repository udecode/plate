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
        rules: [
          { nodeNames: 'PRE' },
          { className: code_block.rootProps.className },
        ],
        ...options?.code_block?.deserialize,
      }),
      ...getElementDeserializer({
        type: code_line.type,
        rules: [{ className: code_line.rootProps.className }],
        ...options?.code_line?.deserialize,
      }),
    ],
  };
};
