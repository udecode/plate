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
  const { code_block_container } = setDefaults(options, DEFAULTS_CODE_BLOCK);

  return {
    element: [
      ...getElementDeserializer({
        type: code_block_container.type,
        rules: [
          { nodeNames: 'DIV' },
          { className: code_block_container.rootProps.className },
        ],
        ...options?.code_block?.deserialize,
      }),
    ],
  };
};
