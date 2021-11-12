import { KEY_DESERIALIZE_AST } from '@udecode/plate-ast-serializer';
import { createPlugin } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';
import {
  getCodeBlockDeserialize,
  getCodeLineDeserialize,
} from './getCodeBlockDeserialize';
import { getCodeBlockOnKeyDown } from './getCodeBlockOnKeyDown';
import { getCodeLineDecorate } from './getCodeLineDecorate';
import { CodeBlockPlugin } from './types';
import { withCodeBlock } from './withCodeBlock';

/**
 * Enables support for pre-formatted code blocks.
 */
export const createCodeBlockPlugin = createPlugin<CodeBlockPlugin>({
  key: ELEMENT_CODE_BLOCK,
  isElement: true,
  deserialize: getCodeBlockDeserialize(),
  deserializers: [KEY_DESERIALIZE_AST],
  onKeyDown: getCodeBlockOnKeyDown(),
  withOverrides: withCodeBlock(),
  hotkey: ['mod+opt+8', 'mod+shift+8'],
  syntax: true,
  syntaxPopularFirst: false,
  plugins: [
    {
      key: ELEMENT_CODE_LINE,
      isElement: true,
      deserialize: getCodeLineDeserialize(),
      decorate: getCodeLineDecorate(),
    },
  ],
});
