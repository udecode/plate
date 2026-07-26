import type { createLowlight } from 'lowlight';

import {
  type BaseEditor,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import {
  ContentSlice,
  editorCommands,
  type EditorTransactionChangeContext,
  type Element,
  ElementApi,
  NodeApi,
  PathApi,
  property,
  RangeApi,
  schema,
} from '@platejs/plite';
import { KEYS, NODES } from '@platejs/utils';

import { isCodeBlockEmpty } from './queries';
import {
  CODE_LINE_TO_DECORATIONS,
  resetCodeBlockDecorations,
  setCodeBlockToDecorations,
} from './setCodeBlockToDecorations';
import { insertCodeBlock } from './transforms/insertCodeBlock';
import { toggleCodeBlock } from './transforms/toggleCodeBlock';
import { indentCodeLine, outdentCodeLine, unwrapCodeBlock } from './transforms';

const CODE_LANGUAGE_CLASS_RE = /(?:^|\s)language-([^\s]+)/;
const NON_WHITESPACE = /\S/;
const NON_WHITESPACE_OR_END = /\S|$/;

export const getCodeBlockLanguageChange = (
  context: Pick<
    EditorTransactionChangeContext<BaseEditor>,
    'after' | 'before' | 'change' | 'changed'
  >,
  type: string
) => {
  const roots = new Set<string | undefined>();

  context.change.iterChangedRanges((root) => roots.add(root ?? undefined));

  for (const root of roots) {
    if (!context.changed.has('properties', root)) continue;

    const beforeChildren =
      root === undefined
        ? context.before.children
        : (context.before.roots?.[root] ?? []);
    const afterChildren =
      root === undefined
        ? context.after.children
        : (context.after.roots?.[root] ?? []);

    for (const path of context.changed.paths(root)) {
      const before = NodeApi.getIf(
        { children: beforeChildren } as Element,
        path
      );
      const after = NodeApi.getIf({ children: afterChildren } as Element, path);

      const beforeLanguage =
        ElementApi.isElement(before) && before.type === type
          ? before.lang
          : undefined;
      const afterLanguage =
        ElementApi.isElement(after) && after.type === type
          ? after.lang
          : undefined;

      if (
        (beforeLanguage !== undefined || afterLanguage !== undefined) &&
        beforeLanguage !== afterLanguage
      ) {
        return { after, before };
      }
    }
  }
};

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
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => ({}),
        encode: ({ content }) => ({
          attributes: { 'data-code-line': true },
          children: content,
          style: { display: 'block', minHeight: '1em' },
          tag: 'span',
        }),
        match: [{ attributes: { 'data-code-line': true }, tag: 'span' }],
      },
    }),
});

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
  render: { as: 'pre' },
  rules: {
    delete: {
      empty: 'reset',
    },
    match: ({ editor, rule }) =>
      ['break.empty', 'delete.empty'].includes(rule) &&
      isCodeBlockEmpty(editor),
  },
  codecs: (context) => {
    const { defineCodecs } = context;

    return defineCodecs({
      'text/html': {
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
          const codeLineType = context.editor.getType(BaseCodeLinePlugin.key);

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
        match: [
          { tag: 'pre' },
          { style: { fontFamily: 'Consolas' }, tag: 'p' },
        ],
        priority: 10,
      },
    });
  },
  extension: (context) => {
    const createCodeLine = (text: string) => ({
      children: [{ text }],
      type: context.editor.getType(KEYS.codeLine),
    });

    return {
      clipboard: {
        insertData(data, { next, tx }) {
          const text = data.getData('text/plain');
          const vscodeDataString = data.getData('vscode-editor-data');
          const codeLineType = context.editor.getType(KEYS.codeLine);
          const block = tx.nodes.block();
          const isInCodeBlock =
            !!block && [context.type, codeLineType].includes(block[0].type);

          if (vscodeDataString) {
            try {
              const vscodeData: unknown = JSON.parse(vscodeDataString);
              const language =
                typeof vscodeData === 'object' &&
                vscodeData !== null &&
                'mode' in vscodeData &&
                typeof vscodeData.mode === 'string'
                  ? vscodeData.mode
                  : undefined;
              const lines = text.split('\n');

              if (isInCodeBlock) {
                tx.fragment.replace(lines.map(createCodeLine));

                return true;
              }

              if (!block) return next(data);

              tx.fragment.replace(
                [
                  {
                    children: lines.map(createCodeLine),
                    lang: language,
                    type: context.type,
                  },
                ],
                {
                  at: PathApi.next(block[1]),
                }
              );

              return true;
            } catch (_error) {}
          }

          if (isInCodeBlock && text?.includes('\n')) {
            tx.fragment.replace(text.split('\n').map(createCodeLine));

            return true;
          }

          return next(data);
        },
      },
      commands: ({ around, handle }) => [
        handle(editorCommands.delete, ({ input, state }) => {
          if (input.direction !== 'backward') return false;

          const selection = state.selection();

          if (!selection || state.selection.isExpanded()) return false;

          const codeLine = state.nodes.above<Element>({
            match: { type: context.editor.getType(KEYS.codeLine) },
          });
          const codeBlock = codeLine
            ? state.nodes.parent<Element>(codeLine[1])
            : undefined;

          if (
            !codeLine ||
            !codeBlock ||
            codeBlock[0].type !== context.type ||
            !state.selection.isAtBlockStart({
              match: { type: context.editor.getType(KEYS.codeLine) },
            })
          ) {
            return false;
          }

          const previousCodeLine = state.nodes.previous<Element>({
            at: codeLine[1],
            match: { type: context.editor.getType(KEYS.codeLine) },
          });
          const codeLineText = NodeApi.string(codeLine[0]);

          if (!previousCodeLine) {
            if (codeLineText.length > 0) return state.transaction(() => {});

            return state.transaction((tx) => {
              codeBlock[0].children.forEach((child, index) => {
                if (!ElementApi.isElement(child)) return;

                tx.nodes.set(
                  { type: context.editor.getType(KEYS.p) },
                  { at: codeBlock[1].concat(index) }
                );
              });
              tx.nodes.unwrap({
                at: codeBlock[1],
                match: { type: context.type },
              });
            });
          }

          if (codeLineText.length > 0) return false;

          const previousLineEnd = state.points.end(previousCodeLine[1]);

          return state.transaction((tx) => {
            tx.nodes.remove({ at: codeLine[1] });

            if (previousLineEnd) {
              tx.selection.set(previousLineEnd);
            }
          });
        }),
        around(editorCommands.insertBreak, ({ state, next }) => {
          const selection = state.selection();
          const codeLine = selection
            ? state.nodes.above<Element>({
                at: selection,
                match: { type: context.editor.getType(KEYS.codeLine) },
              })
            : undefined;
          const codeBlock = codeLine
            ? state.nodes.parent<Element>(codeLine[1])
            : undefined;

          if (
            !selection ||
            !codeLine ||
            !codeBlock ||
            codeBlock[0].type !== context.type
          ) {
            return false;
          }

          const indentDepth = state.text
            .string(codeLine[1])
            .search(NON_WHITESPACE_OR_END);
          const result = next();

          if (result === false) return false;

          return state.transaction.extend(result, (tx) => {
            const insertedCodeLine = tx.nodes.above<Element>({
              match: { type: context.editor.getType(KEYS.codeLine) },
            });

            if (!insertedCodeLine) return;

            const start = tx.points.start(insertedCodeLine[1]);

            if (!start) return;

            const currentIndentDepth = tx.text
              .string(insertedCodeLine[1])
              .search(NON_WHITESPACE_OR_END);
            const indent = ' '.repeat(
              Math.max(0, indentDepth - currentIndentDepth)
            );

            if (!tx.selection.isExpanded()) {
              const nextSelection = tx.selection();
              const cursor = nextSelection?.anchor;
              const range = cursor && tx.ranges.get(start, cursor);
              const text = range ? tx.text.string(range) : '';

              if (NON_WHITESPACE.test(text)) {
                if (nextSelection) {
                  tx.text.insert(indent, { at: nextSelection });
                }

                return;
              }
            }

            tx.text.insert(indent, { at: start });
          });
        }),
        around(editorCommands.replaceSlice, ({ input, state, next }) => {
          const { options, slice } = input;
          const fragment = [...slice.content];
          const target = options?.at;
          const at =
            target === undefined
              ? (state.selection() ?? undefined)
              : NodeApi.isNode(target)
                ? state.nodes.path(target)
                : target;
          const codeLineType = context.editor.getType(KEYS.codeLine);

          if (target !== undefined && at === undefined) {
            return next();
          }

          if (
            !state.nodes.block({
              at,
              match: { type: [context.type, codeLineType] },
            })
          ) {
            return next();
          }

          const codeLines = fragment.flatMap((node) => {
            if (ElementApi.isElement(node) && node.type === context.type) {
              return node.children.filter((child): child is Element =>
                ElementApi.isElement(child)
              );
            }

            return [createCodeLine(NodeApi.string(node))];
          });

          return next({
            ...input,
            slice: ContentSlice.withContent(slice, codeLines, {
              open: 'closed',
            }),
          });
        }),
      ],
      priority: 10,
    };
  },
  update: (context) => {
    const { tx } = context;
    const tab = (reverse = false) => {
      const codeLines = tx.nodes.toArray<Element>({
        at: tx.selection() ?? undefined,
        match: { type: context.editor.getType(KEYS.codeLine) },
      });

      if (codeLines.length === 0) return false;

      const codeBlock = tx.nodes.parent<Element>(codeLines[0][1]);

      if (!codeBlock) return false;

      const codeLineAnchors = codeLines.map(([, path]) =>
        tx.anchor(path, {
          association: 'forward',
          deletion: 'drop',
        })
      );

      for (const codeLineAnchor of codeLineAnchors) {
        const path = codeLineAnchor.release();
        const codeLine = path ? tx.nodes.get<Element>(path) : undefined;
        const currentCodeBlock = codeLine
          ? tx.nodes.parent<Element>(codeLine[1])
          : undefined;

        if (!codeLine || !currentCodeBlock) continue;

        if (reverse) {
          outdentCodeLine(tx, {
            codeBlock: currentCodeBlock,
            codeLine,
          });
        } else {
          indentCodeLine(tx, {
            codeBlock: currentCodeBlock,
            codeLine,
          });
        }
      }

      return true;
    };

    return {
      insert: insertCodeBlock.bind(null, context.editor, tx),
      resetBlock: () => {
        if (
          !tx.nodes.block({
            match: { type: context.type },
          })
        ) {
          return false;
        }

        unwrapCodeBlock(context.editor, tx);

        return true;
      },
      selectAll: () => {
        const codeBlock = tx.nodes.above<Element>({
          match: { type: context.type },
        });

        if (!codeBlock) return false;

        const selection = tx.selection();
        const blockRange = tx.ranges.get(codeBlock[1]);

        if (selection && blockRange && RangeApi.equals(selection, blockRange)) {
          return false;
        }

        tx.selection.set(codeBlock[1]);

        return true;
      },
      tab: ({ reverse = false } = {}) => tab(reverse),
      toggle: () => toggleCodeBlock(context.editor, tx),
      untab: () => tab(true),
    };
  },
}).extend({
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
  extension: ({ editor, getOptions }) => ({
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
  }),
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
});
