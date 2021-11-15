import { KEY_DESERIALIZE_AST } from '@udecode/plate-ast-serializer';
import { createPluginFactory } from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';
import { decorateCodeLine } from './decorateCodeLine';
import {
  getCodeBlockDeserialize,
  getCodeLineDeserialize,
} from './getCodeBlockDeserialize';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';
import { CodeBlockPlugin } from './types';
import { withCodeBlock } from './withCodeBlock';

/**
 * Enables support for pre-formatted code blocks.
 */
export const createCodeBlockPlugin = createPluginFactory<CodeBlockPlugin>({
  key: ELEMENT_CODE_BLOCK,
  isElement: true,
  deserialize: getCodeBlockDeserialize(),
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  withOverrides: withCodeBlock,
  options: {
    deserializers: [KEY_DESERIALIZE_AST],
    hotkey: ['mod+opt+8', 'mod+shift+8'],
    syntax: true,
    syntaxPopularFirst: false,
  },
  plugins: [
    {
      key: ELEMENT_CODE_LINE,
      isElement: true,
      deserialize: getCodeLineDeserialize(),
      decorate: decorateCodeLine,
    },
  ],
});
