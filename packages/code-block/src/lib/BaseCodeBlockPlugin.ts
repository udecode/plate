import type { createLowlight } from 'lowlight';

import { type PluginConfig, createBasePlugin } from '@platejs/core';
import { ElementApi, property, schema } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { htmlDeserializerCodeBlock } from './deserializer/htmlDeserializerCodeBlock';
import { isCodeBlockEmpty } from './queries';
import {
  CODE_LINE_TO_DECORATIONS,
  setCodeBlockToDecorations,
} from './setCodeBlockToDecorations';
import { insertCodeBlock } from './transforms/insertCodeBlock';
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
  'codeBlock',
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
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      slice: { preserveContext: true },
      topLevel: false,
    },
  },
  type: NODES.codeLine,
});

export const BaseCodeSyntaxPlugin = createBasePlugin({
  key: KEYS.codeSyntax,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  type: NODES.codeSyntax,
});

const codeBlockOptions: CodeBlockConfig['options'] = {
  defaultLanguage: null,
  lowlight: null,
};

export const BaseCodeBlockPlugin = createBasePlugin({
  key: KEYS.codeBlock,
  inject: {
    plugins: {
      [KEYS.html]: {
        parser: {
          query: ({ registry, state }) => {
            const selection = state.selection();

            return (
              !selection ||
              !state.nodes.some({
                at: selection,
                match: { type: registry.getType(KEYS.codeLine) },
              })
            );
          },
        },
      },
    },
  },
  schema: ({ plugins }) => {
    const codeLineType = plugins.elementType(BaseCodeLinePlugin);

    return {
      element: {
        content: schema.content.type(codeLineType, {
          default: { type: codeLineType },
          min: 1,
        }),
        properties: { lang: property.string() },
        slice: { preserveContext: true },
      },
    };
  },
  type: NODES.codeBlock,
  options: codeBlockOptions,
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
})
  .extendExtension(withCodeBlock)
  .extendExtension(withInsertDataCodeBlock)
  .extendExtension(withInsertFragmentCodeBlock)
  .extendExtension(withNormalizeCodeBlock)
  .extendTx(({ editor }) => (tx) => ({
    insert: insertCodeBlock.bind(null, editor, tx),
    resetBlock: () => resetCodeBlock(editor, tx),
    selectAll: () => selectCodeBlock(editor, tx),
    tab: tabCodeBlock.bind(null, editor, tx),
    toggle: () => toggleCodeBlock(editor, tx),
    untab: () => tabCodeBlock(editor, tx, { reverse: true }),
  }))
  .extend({
    shortcuts: {
      selectAll: { keys: 'mod+a' },
      tab: { keys: 'tab' },
      untab: { keys: 'shift+tab' },
    },
  });
