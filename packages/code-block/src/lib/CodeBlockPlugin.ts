import {
  DeserializeHtmlPlugin,
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
  someNode,
} from '@udecode/plate-common';

import type { Prism } from './types';

import { withCodeBlock } from '../lib/withCodeBlock';
import { decorateCodeLine } from './decorateCodeLine';
import { deserializeHtmlCodeBlock } from './deserializeHtmlCodeBlock';

export type CodeBlockConfig = PluginConfig<
  'code_block',
  {
    deserializers?: string[];
    prism?: Prism;
    syntax?: boolean;
    syntaxPopularFirst?: boolean;
  }
>;

export const CodeLinePlugin = createSlatePlugin({
  decorate: decorateCodeLine,
  isElement: true,
  key: 'code_line',
});

export const CodeSyntaxPlugin = createSlatePlugin({
  isLeaf: true,
  key: 'code_syntax',
});

export const CodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
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
