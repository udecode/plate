import {
  type PluginConfig,
  HtmlPlugin,
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

export const BaseCodeLinePlugin = createSlatePlugin({
  key: 'code_line',
  decorate: decorateCodeLine,
  node: { isElement: true },
});

export const BaseCodeSyntaxPlugin = createSlatePlugin({
  key: 'code_syntax',
  node: { isLeaf: true },
});

export const BaseCodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
  key: 'code_block',
  extendEditor: withCodeBlock,
  inject: {
    plugins: {
      [HtmlPlugin.key]: {
        parser: {
          query: ({ editor }) => {
            const codeLineType = editor.getType(BaseCodeLinePlugin);

            return !someNode(editor, {
              match: { type: codeLineType },
            });
          },
        },
      },
    },
  },
  node: { isElement: true },
  options: {
    syntax: true,
    syntaxPopularFirst: false,
  },
  parsers: { html: { deserializer: htmlDeserializerCodeBlock } },
  plugins: [BaseCodeLinePlugin, BaseCodeSyntaxPlugin],
});
