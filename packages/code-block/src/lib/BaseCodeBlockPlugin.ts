import type { createLowlight } from 'lowlight';

import {
  type PluginConfig,
  type TCodeBlockElement,
  type TElement,
  createSlatePlugin,
  createTSlatePlugin,
  KEYS,
} from 'platejs';

import { htmlDeserializerCodeBlock } from './deserializer/htmlDeserializerCodeBlock';
import { isCodeBlockEmpty } from './queries';
import {
  CODE_LINE_TO_DECORATIONS,
  setCodeBlockToDecorations,
} from './setCodeBlockToDecorations';
import { withCodeBlock } from './withCodeBlock';

export type CodeBlockConfig = PluginConfig<
  'code_block',
  {
    /**
     * Default language to use when no language is specified. Set to null to
     * disable syntax highlighting by default.
     */
    defaultLanguage?: string | null;
    /**
     * Lowlight instance to use for highlighting. If not provided, syntax
     * highlighting will be disabled.
     */
    lowlight?: ReturnType<typeof createLowlight> | null;
  }
>;

export const BaseCodeLinePlugin = createTSlatePlugin({
  key: KEYS.codeLine,
  node: { isElement: true, isStrictSiblings: true },
});

export const BaseCodeSyntaxPlugin = createSlatePlugin({
  key: KEYS.codeSyntax,
  node: { isLeaf: true },
});

export const BaseCodeBlockPlugin = createTSlatePlugin<CodeBlockConfig>({
  key: KEYS.codeBlock,
  inject: {
    plugins: {
      [KEYS.html]: {
        parser: {
          query: ({ editor }) =>
            !editor.api.some({
              match: { type: editor.getType(KEYS.codeLine) },
            }),
        },
      },
    },
  },
  node: {
    isElement: true,
  },
  options: {
    defaultLanguage: null,
    lowlight: null,
  },
  parsers: { html: { deserializer: htmlDeserializerCodeBlock } },
  plugins: [BaseCodeLinePlugin, BaseCodeSyntaxPlugin],
  render: { as: 'pre' },
  rules: {
    delete: {
      empty: 'reset',
    },
    match: ({ editor, rule }) =>
      ['break.empty', 'delete.empty'].includes(rule) &&
      isCodeBlockEmpty(editor),
  },
  decorate: ({ editor, entry: [node, path], getOptions, type }) => {
    if (!getOptions().lowlight) return [];

    const codeLineType = editor.getType(KEYS.codeLine);

    // Initialize decorations for the code block, we assume code line decorate will be called next.
    if (
      node.type === type &&
      !CODE_LINE_TO_DECORATIONS.get((node.children as TElement[])[0])
    ) {
      setCodeBlockToDecorations(editor, [node as TCodeBlockElement, path]);
    }

    if (node.type === codeLineType) {
      return CODE_LINE_TO_DECORATIONS.get(node as TElement) || [];
    }

    return [];
  },
})
  .overrideEditor(withCodeBlock)
  .extendTransforms(({ editor }) => ({
    toggle: () => {
      editor.tf.toggleBlock(editor.getType(KEYS.codeBlock));
    },
  }));
