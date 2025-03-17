import type { createLowlight } from 'lowlight';

import {
  type NodeEntry,
  type PluginConfig,
  type TElement,
  createSlatePlugin,
  createTSlatePlugin,
  HtmlPlugin,
} from '@udecode/plate';

import type { TCodeBlockElement } from './types';

import { htmlDeserializerCodeBlock } from './deserializer/htmlDeserializerCodeBlock';
import {
  CODE_LINE_TO_DECORATIONS,
  resetCodeBlockDecorations,
  setCodeBlockToDecorations as setCodeBlockToDecorations,
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
          query: ({ editor }) =>
            !editor.api.some({
              match: { type: editor.getType(BaseCodeLinePlugin) },
            }),
        },
      },
    },
  },
  node: { isElement: true },
  options: {
    defaultLanguage: null,
    lowlight: null,
  },
  parsers: { html: { deserializer: htmlDeserializerCodeBlock } },
  plugins: [BaseCodeLinePlugin, BaseCodeSyntaxPlugin],
  decorate: ({ editor, entry: [node, path], getOptions, type }) => {
    if (!getOptions().lowlight) return [];

    const codeLineType = editor.getType(BaseCodeLinePlugin);

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
  .overrideEditor(
    ({ editor, getOptions, tf: { apply, normalizeNode }, type }) => ({
      transforms: {
        apply(operation) {
          if (getOptions().lowlight && operation.type === 'set_node') {
            const entry = editor.api.node(operation.path);

            if (entry?.[0].type === type && operation.newProperties?.lang) {
              // Clear decorations for all code lines in this block
              resetCodeBlockDecorations(entry[0] as TCodeBlockElement);
            }
          }

          apply(operation);
        },
        normalizeNode(entry, options) {
          const [node] = entry;

          // Decorate is called on selection change as well, so we prefer to only run this on code block changes.
          if (getOptions().lowlight && node.type === type) {
            setCodeBlockToDecorations(
              editor,
              entry as NodeEntry<TCodeBlockElement>
            );
          }

          normalizeNode(entry, options);
        },
      },
    })
  )
  .overrideEditor(withCodeBlock);
