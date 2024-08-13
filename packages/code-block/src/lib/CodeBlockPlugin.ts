import {
  DeserializeHtmlPlugin,
  createPlugin,
  getPlugin,
  someNode,
} from '@udecode/plate-common';

import type { CodeBlockPluginOptions } from '../lib/types';

import { deserializeHtmlCodeBlock } from '../lib/deserializeHtmlCodeBlockPre';
import { withCodeBlock } from '../lib/withCodeBlock';
import { decorateCodeLine } from './decorateCodeLine';

export const CodeLinePlugin = createPlugin({
  decorate: decorateCodeLine,
  isElement: true,
  key: 'code_line',
});

export const CodeSyntaxPlugin = createPlugin({
  isLeaf: true,
  key: 'code_syntax',
});

export const CodeBlockPlugin = createPlugin<
  'code_block',
  CodeBlockPluginOptions
>({
  deserializeHtml: deserializeHtmlCodeBlock,
  inject: {
    plugins: {
      [DeserializeHtmlPlugin.key]: {
        editor: {
          insertData: {
            query: ({ editor }) => {
              const code_line = getPlugin(editor, CodeLinePlugin.key);

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
  key: 'code_block',
  options: {
    syntax: true,
    syntaxPopularFirst: false,
  },
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
  withOverrides: withCodeBlock,
});
