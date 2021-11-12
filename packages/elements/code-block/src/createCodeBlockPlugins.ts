import { createPlugin } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './defaults';
import {
  getCodeBlockDeserialize,
  getCodeLineDeserialize,
} from './getCodeBlockDeserialize';
import { getCodeBlockOnKeyDown } from './getCodeBlockOnKeyDown';
import { getCodeLineDecorate } from './getCodeLineDecorate';
import { withCodeBlock } from './withCodeBlock';

/**
 * Enables support for pre-formatted code blocks.
 */
export const createCodeBlockPlugins = createPlugin({
  key: 'codeBlock',
  plugins: [
    {
      key: ELEMENT_CODE_BLOCK,
      isElement: true,
      deserialize: getCodeBlockDeserialize(),
      onKeyDown: getCodeBlockOnKeyDown(),
      withOverrides: withCodeBlock(),
    },
    {
      key: ELEMENT_CODE_LINE,
      isElement: true,
      deserialize: getCodeLineDeserialize(),
      decorate: getCodeLineDecorate(),
    },
  ],
});
