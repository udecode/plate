import type { createLowlight } from 'lowlight';

import {
  type PluginConfig,
  type TCodeBlockElement,
  createEditorPlugin,
  ElementApi,
  KEYS,
} from 'platejs';
import type { EditorUpdateTransaction, Element } from '@platejs/plite';

import { htmlDeserializerCodeBlock } from './deserializer/htmlDeserializerCodeBlock';
import { isCodeBlockEmpty } from './queries';
import {
  CODE_BLOCK_TO_DECORATION_LANGUAGE,
  CODE_LINE_TO_DECORATIONS,
  setCodeBlockToDecorations,
} from './setCodeBlockToDecorations';

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

const isElementOfType = (node: unknown, type: string) =>
  typeof node === 'object' &&
  node !== null &&
  'children' in node &&
  (node as { type?: unknown }).type === type;

export const BaseCodeLinePlugin = createEditorPlugin({
  key: KEYS.codeLine,
  node: { isElement: true, isStrictSiblings: true },
});

export const BaseCodeSyntaxPlugin = createEditorPlugin({
  key: KEYS.codeSyntax,
  node: { isLeaf: true },
});

export const BaseCodeBlockPlugin = createEditorPlugin<CodeBlockConfig>({
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
      ElementApi.isElement(node) &&
      node.type === type &&
      (!CODE_LINE_TO_DECORATIONS.get((node.children as Element[])[0]) ||
        CODE_BLOCK_TO_DECORATION_LANGUAGE.get(node as TCodeBlockElement) !==
          ((node as TCodeBlockElement).lang || getOptions().defaultLanguage))
    ) {
      setCodeBlockToDecorations(editor, [node as TCodeBlockElement, path]);
    }

    if (ElementApi.isElement(node) && node.type === codeLineType) {
      return CODE_LINE_TO_DECORATIONS.get(node as Element) || [];
    }

    return [];
  },
}).extendTx(({ editor, type }) => (tx: EditorUpdateTransaction) => ({
  toggle: () => {
    const codeLineType = editor.getType(KEYS.codeLine);
    const defaultType = editor.getType(KEYS.p);
    const isActive = tx.nodes.some<Element>({
      match: (node) => isElementOfType(node, type),
    });
    const codeBlockEntries = tx.nodes
      .toArray<Element>({
        match: (node) => isElementOfType(node, type),
      })
      .reverse();

    for (const [codeBlock, codeBlockPath] of codeBlockEntries) {
      codeBlock.children.forEach((_, index) => {
        tx.nodes.set({ type: defaultType }, { at: [...codeBlockPath, index] });
      });
      tx.nodes.unwrap({
        at: codeBlockPath,
        match: (node) => isElementOfType(node, type),
        split: true,
      });
    }

    if (isActive) return;

    tx.nodes.set<Element>({ type: codeLineType });
    tx.nodes.wrap({ children: [], type });
  },
}));
