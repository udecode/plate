import type { BuiltinTheme, ThemedToken } from 'shiki';

import {
  type PluginConfig,
  createSlatePlugin,
  createTSlatePlugin,
  HtmlPlugin,
} from '@udecode/plate';

import { htmlDeserializerCodeBlock } from './deserializer/htmlDeserializerCodeBlock';
import { withCodeBlock } from './withCodeBlock';

export type CodeBlockConfig = PluginConfig<
  'code_block',
  {
    annotations?: Record<
      string, // block id
      {
        tokens: ThemedToken[][];
        decorations?: any[]; // Cache for computed decorations
        dirty?: boolean;
      }
    >;
    /**
     * Minimum time (in milliseconds) between highlight operations.
     *
     * @default 0 (no throttling)
     */
    delay?: number;
    syntax?: boolean;
    syntaxPopularFirst?: boolean;
    theme?: BuiltinTheme | string;
  }
>;

export const BaseCodeLinePlugin = createTSlatePlugin({
  key: 'code_line',
  node: { isElement: true },
});

export const BaseCodeSyntaxPlugin = createSlatePlugin({
  key: 'code_syntax',
  node: { isLeaf: true },
});

export const BaseCodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
  key: 'code_block',
  inject: {
    plugins: {
      [HtmlPlugin.key]: {
        parser: {
          query: ({ editor }) => {
            const codeLineType = editor.getType(BaseCodeLinePlugin);

            return !editor.api.some({
              match: { type: codeLineType },
            });
          },
        },
      },
    },
  },
  node: { isElement: true },
  options: {
    annotations: {},
    delay: 0,
    syntax: true,
    syntaxPopularFirst: false,
  },
  parsers: { html: { deserializer: htmlDeserializerCodeBlock } },
  plugins: [BaseCodeLinePlugin, BaseCodeSyntaxPlugin],
}).overrideEditor(withCodeBlock);
