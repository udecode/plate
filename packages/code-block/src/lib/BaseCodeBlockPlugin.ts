import type { BuiltinTheme, ThemedToken } from 'shiki';

import {
  type DecoratedRange,
  type PluginConfig,
  type TElement,
  createSlatePlugin,
  createTSlatePlugin,
  HtmlPlugin,
} from '@udecode/plate';

import { htmlDeserializerCodeBlock } from './deserializer/htmlDeserializerCodeBlock';
import { withCodeBlock } from './withCodeBlock';

export type CodeBlockConfig = PluginConfig<
  'code_block',
  {
    // Store shiki tokens per block
    annotations?: Record<
      string, // block id
      ThemedToken[][]
    >;
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
    syntax: true,
    syntaxPopularFirst: false,
  },
  parsers: { html: { deserializer: htmlDeserializerCodeBlock } },
  plugins: [BaseCodeLinePlugin, BaseCodeSyntaxPlugin],
  decorate: ({ editor, entry: [node, path], getOptions, type }) => {
    const options = getOptions();

    if (!options.syntax || node.type !== type) {
      return [];
    }

    // Get annotations for this block using block id
    const blockTokens = options.annotations?.[(node as any).id] ?? [];

    // Map annotations to line-specific decorations
    const decorations: DecoratedRange[] = [];

    // Process each line directly from node.children
    (node.children as TElement[]).forEach((_, lineIndex) => {
      const linePath = [...path, lineIndex];
      const lineTokens = blockTokens[lineIndex] ?? [];
      let offset = 0;

      lineTokens.forEach((token) => {
        if (token.content) {
          decorations.push({
            anchor: {
              offset,
              path: linePath,
            },
            [BaseCodeSyntaxPlugin.key]: true,
            focus: {
              offset: offset + token.content.length,
              path: linePath,
            },
            token: {
              bgColor: token.bgColor,
              color: token.color,
              fontStyle: token.fontStyle,
            },
          } as any);
          offset += token.content.length;
        }
      });
    });

    console.log(decorations);

    return decorations;
  },
}).overrideEditor(withCodeBlock);
