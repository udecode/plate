import {
  createPluginFactory,
  getPlugin,
  KEY_DESERIALIZE_HTML,
  someNode,
} from '@udecode/plate-core';
import { ELEMENT_CODE_BLOCK, ELEMENT_CODE_LINE } from './constants';
import { decorateCodeLine } from './decorateCodeLine';
import { deserializeHtmlCodeBlock } from './deserializeHtmlCodeBlockPre';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';
import { CodeBlockPlugin } from './types';
import { withCodeBlock } from './withCodeBlock';

/**
 * Enables support for pre-formatted code blocks.
 */
export const createCodeBlockPlugin = createPluginFactory<CodeBlockPlugin>({
  key: ELEMENT_CODE_BLOCK,
  isElement: true,
  injectPlugin: (editor, { key }) => {
    if (key !== KEY_DESERIALIZE_HTML) return;

    const code_line = getPlugin(editor, ELEMENT_CODE_LINE);

    const isSelectionInCodeLine = someNode(editor, {
      match: { type: code_line.type },
    });

    return {
      isDisabled: isSelectionInCodeLine,
    };
  },
  deserializeHtml: deserializeHtmlCodeBlock,
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  withOverrides: withCodeBlock,
  options: {
    hotkey: ['mod+opt+8', 'mod+shift+8'],
    syntax: true,
    syntaxPopularFirst: false,
  },
  plugins: [
    {
      key: ELEMENT_CODE_LINE,
      isElement: true,
      decorate: decorateCodeLine,
    },
  ],
});
