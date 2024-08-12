import {
  KEY_DESERIALIZE_HTML,
  createPlugin,
  getPlugin,
  someNode,
} from '@udecode/plate-common';

import type { CodeBlockPluginOptions } from '../lib/types';

import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
} from '../lib/constants';
import { deserializeHtmlCodeBlock } from '../lib/deserializeHtmlCodeBlockPre';
import { withCodeBlock } from '../lib/withCodeBlock';
import { decorateCodeLine } from './decorateCodeLine';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

export const CodeLinePlugin = createPlugin({
  decorate: decorateCodeLine,
  isElement: true,
  key: ELEMENT_CODE_LINE,
});

export const CodeSyntaxPlugin = createPlugin({
  isLeaf: true,
  key: ELEMENT_CODE_SYNTAX,
});

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = createPlugin<
  'code_block',
  CodeBlockPluginOptions
>({
  deserializeHtml: deserializeHtmlCodeBlock,
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
  },
  inject: {
    pluginsByKey: {
      [KEY_DESERIALIZE_HTML]: {
        editor: {
          insertData: {
            query: ({ editor }) => {
              const code_line = getPlugin(editor, ELEMENT_CODE_LINE);

              return !someNode(editor, {
                match: { type: code_line.type },
              });
            },
          },
        },
      },
    },
  },
  isElement: true,
  key: ELEMENT_CODE_BLOCK,
  options: {
    hotkey: ['mod+opt+8', 'mod+shift+8'],
    syntax: true,
    syntaxPopularFirst: false,
  },
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
  withOverrides: withCodeBlock,
});
