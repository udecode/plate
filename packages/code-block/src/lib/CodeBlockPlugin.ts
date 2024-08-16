import {
  DeserializeHtmlPlugin,
  type HotkeyPluginOptions,
  type PluginConfig,
  createPlugin,
  createTPlugin,
  someNode,
} from '@udecode/plate-common';

import type { Prism } from './types';

import { deserializeHtmlCodeBlock } from '../lib/deserializeHtmlCodeBlockPre';
import { withCodeBlock } from '../lib/withCodeBlock';
import { decorateCodeLine } from './decorateCodeLine';

export type CodeBlockConfig = PluginConfig<
  'code_block',
  {
    deserializers?: string[];
    prism?: Prism;
    syntax?: boolean;
    syntaxPopularFirst?: boolean;
  } & HotkeyPluginOptions
>;

export const CodeLinePlugin = createPlugin({
  decorate: decorateCodeLine,
  isElement: true,
  key: 'code_line',
});

export const CodeSyntaxPlugin = createPlugin({
  isLeaf: true,
  key: 'code_syntax',
});

export const CodeBlockPlugin = createTPlugin<CodeBlockConfig>({
  deserializeHtml: deserializeHtmlCodeBlock,
  inject: {
    plugins: {
      [DeserializeHtmlPlugin.key]: {
        editor: {
          insertData: {
            query: ({ editor }) => {
              const codeLineType = editor.getType(CodeLinePlugin);

              return !someNode(editor, {
                match: { type: codeLineType },
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
