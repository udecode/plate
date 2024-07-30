import {
  KEY_DESERIALIZE_HTML,
  createPlugin,
  getPlugin,
  someNode,
} from '@udecode/plate-common/server';

import type { CodeBlockPluginOptions } from '../shared/types';

import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_SYNTAX,
} from '../shared/constants';
import { deserializeHtmlCodeBlock } from '../shared/deserializeHtmlCodeBlockPre';
import { withCodeBlock } from '../shared/withCodeBlock';
import { decorateCodeLine } from './decorateCodeLine';
import { onKeyDownCodeBlock } from './onKeyDownCodeBlock';

export const CodeLinePlugin = createPlugin({
  isElement: true,
  key: ELEMENT_CODE_LINE,
});

export const CodeSyntaxPlugin = createPlugin({
  decorate: decorateCodeLine,
  isLeaf: true,
  key: ELEMENT_CODE_SYNTAX,
});

/** Enables support for pre-formatted code blocks. */
export const CodeBlockPlugin = createPlugin<CodeBlockPluginOptions>({
  deserializeHtml: deserializeHtmlCodeBlock,
  handlers: {
    onKeyDown: onKeyDownCodeBlock,
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
}).extend((editor) => ({
  inject: {
    pluginsByKey: {
      [KEY_DESERIALIZE_HTML]: {
        editor: {
          insertData: {
            query: () => {
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
}));
