import type { createLowlight } from 'lowlight';

import { type PluginConfig, createBasePlugin } from '@platejs/core';
import { ElementApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { htmlDeserializerCodeBlock } from './deserializer/htmlDeserializerCodeBlock';
import { isCodeBlockEmpty } from './queries';
import {
  CODE_LINE_TO_DECORATIONS,
  setCodeBlockToDecorations,
} from './setCodeBlockToDecorations';
import { toggleCodeBlock } from './transforms/toggleCodeBlock';
import {
  resetCodeBlock,
  selectCodeBlock,
  tabCodeBlock,
  withCodeBlock,
} from './withCodeBlock';
import { withInsertDataCodeBlock } from './withInsertDataCodeBlock';
import { withInsertFragmentCodeBlock } from './withInsertFragmentCodeBlock';
import { withNormalizeCodeBlock } from './withNormalizeCodeBlock';

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

export const BaseCodeLinePlugin = createBasePlugin({
  key: KEYS.codeLine,
  node: { isElement: true, isStrictSiblings: true },
});

export const BaseCodeSyntaxPlugin = createBasePlugin({
  key: KEYS.codeSyntax,
  node: { isLeaf: true },
});

export const BaseCodeBlockPlugin = createBasePlugin<CodeBlockConfig>({
  key: KEYS.codeBlock,
  inject: {
    plugins: {
      [KEYS.html]: {
        parser: {
          query: ({ editor }) => {
            const selection = editor.read.selection();

            return (
              !selection ||
              !editor.read.nodes.some({
                at: selection,
                match: { type: editor.getType(KEYS.codeLine) },
              })
            );
          },
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
      ElementApi.isElement(node.children[0]) &&
      !CODE_LINE_TO_DECORATIONS.get(node.children[0])
    ) {
      setCodeBlockToDecorations(editor, [node, path]);
    }

    if (ElementApi.isElement(node) && node.type === codeLineType) {
      return CODE_LINE_TO_DECORATIONS.get(node) || [];
    }

    return [];
  },
  shortcuts: {
    selectAll: { keys: 'mod+a' },
    tab: { keys: 'tab' },
    untab: { keys: 'shift+tab' },
  },
})
  .extendExtension(withCodeBlock)
  .extendExtension(withInsertDataCodeBlock)
  .extendExtension(withInsertFragmentCodeBlock)
  .extendExtension(withNormalizeCodeBlock)
  .extendTx(({ editor }) => (tx) => ({
    resetBlock: () => resetCodeBlock(editor, tx),
    selectAll: () => selectCodeBlock(editor, tx),
    tab: (options?: { reverse?: boolean }) => tabCodeBlock(editor, tx, options),
    toggle: () => toggleCodeBlock(editor, tx),
    untab: () => tabCodeBlock(editor, tx, { reverse: true }),
  }));
