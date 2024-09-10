import {
  HtmlPlugin,
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
  someNode,
} from '@udecode/plate-common';

import type { Prism } from './types';

import { withCodeBlock } from '../lib/withCodeBlock';
import { decorateCodeLine } from './decorateCodeLine';
import { htmlDeserializerCodeBlock } from './htmlDeserializerCodeBlock';

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
  key: 'code_line',
  node: { isElement: true },
});

export const CodeSyntaxPlugin = createSlatePlugin({
  key: 'code_syntax',
  node: { isLeaf: true },
});

export const CodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
  extendEditor: withCodeBlock,
  inject: {
    plugins: {
      [HtmlPlugin.key]: {
        parser: {
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
  key: 'code_block',
  node: { isElement: true },
  options: {
    syntax: true,
    syntaxPopularFirst: false,
  },
  parsers: { html: { deserializer: htmlDeserializerCodeBlock } },
  plugins: [CodeLinePlugin, CodeSyntaxPlugin],
});
