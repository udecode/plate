import type { createLowlight } from 'lowlight';

import { type PluginConfig, createBasePlugin } from '@platejs/core';
import { ElementApi, property, schema } from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { isCodeBlockEmpty } from './queries';
import {
  CODE_LINE_TO_DECORATIONS,
  resetCodeBlockDecorations,
  setCodeBlockToDecorations,
} from './setCodeBlockToDecorations';
import { insertCodeBlock } from './transforms/insertCodeBlock';
import { toggleCodeBlock } from './transforms/toggleCodeBlock';
import {
  resetCodeBlock,
  selectCodeBlock,
  tabCodeBlock,
  getCodeBlockLanguageChange,
  withCodeBlock,
} from './withCodeBlock';
import { withInsertDataCodeBlock } from './withInsertDataCodeBlock';
import { withInsertFragmentCodeBlock } from './withInsertFragmentCodeBlock';

const CODE_LANGUAGE_CLASS_RE = /(?:^|\s)language-([^\s]+)/;

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
}).extendHtmlCodec(() => ({
  decode: () => ({}),
  encode: ({ content }) => ({
    attributes: { 'data-code-line': true },
    children: content,
    style: { display: 'block', minHeight: '1em' },
    tag: 'span',
  }),
  match: [{ attributes: { 'data-code-line': true }, tag: 'span' }],
}));

export type CodeBlockConfig = PluginConfig<
  'codeBlock',
  {},
  {},
  {},
  {},
  {},
  readonly [typeof BaseCodeLinePlugin]
>;

export const BaseCodeBlockPlugin = createBasePlugin({
  key: KEYS.codeBlock,
  dependencies: [BaseCodeLinePlugin],
  parsers: {
    html: {
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
  render: { as: 'pre' },
  rules: {
    delete: {
      empty: 'reset',
    },
    match: ({ editor, rule }) =>
      ['break.empty', 'delete.empty'].includes(rule) &&
      isCodeBlockEmpty(editor),
  },
})
  .extendHtmlCodec(({ editor }) => ({
    decode: ({ element }) => {
      const encodedLines = Array.from(
        element.querySelectorAll(':scope > code > span[data-code-line]')
      );
      const languageSelectorText =
        Array.from(element.childNodes).find(
          (node) => node.nodeName === 'SELECT'
        )?.textContent ?? '';
      const languageClass = element
        .querySelector(':scope > code')
        ?.className.match(CODE_LANGUAGE_CLASS_RE)?.[1];
      const lang = element.dataset.language || languageClass || undefined;
      const lines =
        encodedLines.length > 0
          ? encodedLines.map((line) => line.textContent ?? '')
          : (element.textContent ?? '')
              .replace(languageSelectorText, '')
              .split('\n');
      const codeLineType = editor.getType(BaseCodeLinePlugin.key);

      return {
        children: lines.map((line) => ({
          children: [{ text: line }],
          type: codeLineType,
        })),
        ...(lang ? { lang } : {}),
      };
    },
    encode: ({ content, node }) => ({
      attributes: {
        'data-language': node.lang,
      },
      children: [{ children: content, tag: 'code' }],
      tag: 'pre',
    }),
    match: [{ tag: 'pre' }, { style: { fontFamily: 'Consolas' }, tag: 'p' }],
    priority: 10,
  }))
  .extendExtension(withCodeBlock)
  .extendExtension(withInsertDataCodeBlock)
  .extendExtension(withInsertFragmentCodeBlock)
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

export type CodeHighlightConfig = PluginConfig<
  'codeSyntax',
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
  },
  {},
  {},
  {},
  {},
  readonly [typeof BaseCodeBlockPlugin]
>;

/** Adds Lowlight syntax highlighting to code blocks. */
export const BaseCodeHighlightPlugin = createBasePlugin({
  key: KEYS.codeSyntax,
  dependencies: [BaseCodeBlockPlugin],
  options: {
    defaultLanguage: null as string | null,
    lowlight: null as ReturnType<typeof createLowlight> | null,
  },
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  type: NODES.codeSyntax,
  decorate: ({ editor, entry: [node, path], getOptions }) => {
    if (!getOptions().lowlight) return [];

    const codeBlockType = editor.getType(KEYS.codeBlock);
    const codeLineType = editor.getType(KEYS.codeLine);

    if (
      ElementApi.isElement(node) &&
      node.type === codeBlockType &&
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
}).extendExtension(({ editor, getOptions }) => ({
  corrections: [
    {
      event: 'content',
      correct({ entry }) {
        const [node, path] = entry;

        if (
          ElementApi.isElement(node) &&
          node.type === editor.getType(KEYS.codeBlock) &&
          getOptions().lowlight
        ) {
          setCodeBlockToDecorations(editor, [node, path]);
        }
      },
    },
  ],
  onTransactionChange(context) {
    const codeBlock =
      getOptions().lowlight &&
      getCodeBlockLanguageChange(context, editor.getType(KEYS.codeBlock))
        ?.before;

    if (ElementApi.isElement(codeBlock)) resetCodeBlockDecorations(codeBlock);
  },
}));
