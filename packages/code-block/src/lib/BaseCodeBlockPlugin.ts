import type { createLowlight, LanguageFn } from 'lowlight';

import {
  createBasePlugin,
  DebugPlugin,
  type DefinitionOf,
} from '@platejs/core';
import {
  ContentSlice,
  type DecoratedRange,
  editorCommands,
  type Element,
  ElementApi,
  type ElementEntry,
  type ElementOf,
  type Location,
  NodeApi,
  type NodeEntry,
  type NodeInsertNodesOptions,
  PathApi,
  property,
  RangeApi,
  schema,
} from '@platejs/plite';
import { clipboardHandler } from '@platejs/plite-dom';
import { KEYS, NODES, type TCodeBlockElement } from '@platejs/utils';

import { findCodeBlockLanguageChange } from './codeHighlight.internal';

const CODE_LANGUAGE_CLASS_RE = /(?:^|\s)language-([^\s]+)/;
const NON_WHITESPACE = /\S/;
const NON_WHITESPACE_OR_END = /\S|$/;
const WHITESPACE = /\s/;
const patchedLowlights = new WeakSet<object>();

type Lowlight = ReturnType<typeof createLowlight>;
type CodeBlockDecoration = DecoratedRange & {
  className: string;
  [NODES.codeSyntax]: true;
};
type HighlightResult = ReturnType<Lowlight['highlight']>;
type HighlightNode = HighlightResult['children'][number];
type HighlightJs = Parameters<LanguageFn>[0];
type HighlightLanguage = ReturnType<LanguageFn>;
type HighlightMode = HighlightLanguage['contains'][number];
type CodeHighlightWarning =
  | { error: unknown; kind: 'highlight'; language: string }
  | { kind: 'missing-language'; language: string };
type CodeHighlightRuntime = {
  decorateBlock: (
    entry: NodeEntry<Element>,
    options: {
      defaultLanguage: string | null;
      lowlight: Lowlight;
    }
  ) => {
    decorations: Map<Element, DecoratedRange[]>;
    warning?: CodeHighlightWarning;
  };
  lineDecorations: WeakMap<Element, DecoratedRange[]>;
};
const codeHighlightRuntimes = new WeakMap<object, CodeHighlightRuntime>();

export const BaseCodeLinePlugin = createBasePlugin({
  name: KEYS.codeLine,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      slice: { preserveContext: true },
      blockContent: false,
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

export const BaseCodeBlockPlugin = createBasePlugin({
  name: KEYS.codeBlock,
  dependencies: [BaseCodeLinePlugin],
  read: ({ editor, state, type }) => {
    const entry = <N extends ElementOf<typeof editor> = Element>({
      at = state.selection(),
    }: {
      at?: Location | null;
    } = {}) => {
      if (!at) return;

      const codeLine = state.nodes.above<N>({
        at,
        match: (node): node is N =>
          ElementApi.isElement<N>(node) &&
          node.type === editor.plugin(KEYS.codeLine).type,
      });

      if (!codeLine) return;

      const codeBlock = state.nodes.parent<N>(codeLine[1]);

      if (
        !codeBlock ||
        !ElementApi.isElement(codeBlock[0]) ||
        codeBlock[0].type !== type
      ) {
        return;
      }

      return { codeBlock, codeLine };
    };

    return {
      entry,
      indentDepth: () => {
        const codeLine = entry()?.codeLine;

        return codeLine
          ? state.text.string(codeLine[1]).search(NON_WHITESPACE_OR_END)
          : 0;
      },
      isEmpty: () => {
        const codeBlock = entry()?.codeBlock[0];

        if (!codeBlock) return false;
        if (codeBlock.children.length === 0) return true;
        if (codeBlock.children.length > 1) return false;

        return !NodeApi.string(codeBlock.children[0]);
      },
      isAtStart: () =>
        !state.selection.isExpanded() &&
        state.selection.isAtBlockStart({ match: { type } }),
    };
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
          const codeLineType = context.editor.plugin(
            BaseCodeLinePlugin.name
          ).type;

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
      'text/markdown': {
        from: 'code',
        kind: 'node',
        decode: ({ node, registry, type }) => ({
          children: (node.value || '').split('\n').map((line) => ({
            children: [{ text: line }],
            type: registry.getType(KEYS.codeLine),
          })),
          ...(node.lang ? { lang: node.lang } : {}),
          type,
        }),
        encode: ({ node }) => ({
          lang: node.lang,
          type: 'code',
          value: node.children.map((child) => NodeApi.string(child)).join('\n'),
        }),
      },
    });
  },
  update: ({ editor, tx, type }) => {
    const unwrap = ({
      at = tx.selection() ?? undefined,
    }: {
      at?: Location;
    } = {}) => {
      if (!at) return;

      const codeBlockEntries = Array.from(
        tx.nodes.entries<Element>({
          at,
          match: { type },
        })
      ).reverse();

      for (const [codeBlock, codeBlockPath] of codeBlockEntries) {
        codeBlock.children.forEach((child, index) => {
          if (!ElementApi.isElement(child)) return;

          tx.nodes.set(
            { type: editor.plugin(KEYS.p).type },
            { at: codeBlockPath.concat(index) }
          );
        });
        tx.nodes.unwrap({
          at: codeBlockPath,
          match: { type },
        });
      }
    };
    const insertBlock = (
      options: Omit<NodeInsertNodesOptions<Element>, 'match'> = {}
    ) => {
      const selection = tx.selection();

      if (!selection || tx.selection.isExpanded()) return;

      const codeLineType = editor.plugin(KEYS.codeLine).type;

      if (tx.nodes.some({ match: { type: [type, codeLineType] } })) return;
      if (!tx.selection.isAtBlockStart()) tx.break.insert();

      tx.nodes.set(
        {
          children: [{ text: '' }],
          type: codeLineType,
        },
        options
      );
      tx.nodes.wrap(
        {
          children: [],
          type,
        },
        options
      );
    };
    const indent = ({
      codeLine,
      indentDepth = 2,
    }: {
      codeLine: ElementEntry;
      indentDepth?: number;
    }) => {
      const codeLineStart = tx.points.start(codeLine[0]);

      if (!codeLineStart) return;

      const value = ' '.repeat(indentDepth);

      if (!tx.selection.isExpanded()) {
        const selection = tx.selection();
        const cursor = selection?.anchor;
        const range = cursor && tx.ranges.get(codeLineStart, cursor);
        const text = range ? tx.text.string(range) : '';

        if (NON_WHITESPACE.test(text)) {
          if (selection) tx.text.insert(value, { at: selection });

          return;
        }
      }

      tx.text.insert(value, { at: codeLineStart });
    };
    const deleteStartSpace = (codeLine: ElementEntry) => {
      const codeLineStart = tx.points.start(codeLine[1]);
      const codeLineEnd = codeLineStart && tx.points.after(codeLineStart);
      const spaceRange =
        codeLineEnd && tx.ranges.get(codeLineStart, codeLineEnd);
      const spaceText = spaceRange ? tx.text.string(spaceRange) : '';

      if (!WHITESPACE.test(spaceText)) return false;

      tx.text.delete({ at: spaceRange });

      return true;
    };
    const outdent = ({ codeLine }: { codeLine: ElementEntry }) => {
      if (deleteStartSpace(codeLine)) deleteStartSpace(codeLine);
    };
    const setContent = ({
      code,
      element,
    }: {
      code: string;
      element: TCodeBlockElement;
    }) => {
      tx.nodes.replaceChildren(
        code.split('\n').map((line) => ({
          children: [{ text: line }],
          type: editor.plugin(KEYS.codeLine).type,
        })),
        { at: element }
      );
    };
    const tab = (reverse = false) => {
      const codeLines = tx.nodes.toArray<Element>({
        at: tx.selection() ?? undefined,
        match: { type: editor.plugin(KEYS.codeLine).type },
      });

      if (codeLines.length === 0) return false;

      const codeLineAnchors = codeLines.map(([, path]) =>
        tx.anchor(path, {
          association: 'forward',
          deletion: 'drop',
        })
      );

      for (const codeLineAnchor of codeLineAnchors) {
        const path = codeLineAnchor.release();
        const codeLine = path ? tx.nodes.get<Element>(path) : undefined;

        if (!codeLine || !tx.nodes.parent<Element>(codeLine[1])) continue;

        if (reverse) {
          outdent({ codeLine });
        } else {
          indent({ codeLine });
        }
      }

      return true;
    };

    return {
      format: ({ element }: { element: TCodeBlockElement }) => {
        const { lang } = element;
        const code = NodeApi.string(element);

        if (lang !== 'json') return;

        try {
          JSON.parse(code);
        } catch {
          return;
        }

        setContent({
          code: JSON.stringify(JSON.parse(code), null, 2),
          element,
        });
      },
      insert: ({
        defaultType = editor.plugin(KEYS.p).type,
        insertNodesOptions,
      }: {
        defaultType?: string;
        insertNodesOptions?: Omit<NodeInsertNodesOptions<Element>, 'match'>;
      } = {}) => {
        const selection = tx.selection();

        if (!selection) return;

        const block = tx.selection.isCollapsed()
          ? tx.nodes.block({ at: selection })
          : undefined;
        const shouldInsertNextBlock =
          tx.selection.isExpanded() || !block || !tx.nodes.isEmpty(block[0]);
        let codeBlockOptions = insertNodesOptions;

        if (shouldInsertNextBlock) {
          const { at: _at, ...options } = insertNodesOptions ?? {};

          tx.blocks.insertAfter(
            { children: [{ text: '' }], type: defaultType },
            {
              ...insertNodesOptions,
              select: true,
            }
          );
          codeBlockOptions = options;
        }

        insertBlock(codeBlockOptions);
      },
      resetBlock: () => {
        if (!tx.nodes.block({ match: { type } })) return false;

        unwrap();

        return true;
      },
      selectAll: () => {
        const codeBlock = tx.nodes.above<Element>({
          match: { type },
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
      toggle: () => {
        const selection = tx.selection();

        if (!selection) return;

        const isActive = tx.nodes.some({
          at: selection,
          match: { type },
        });

        unwrap();

        if (!isActive) {
          tx.nodes.set({ type: editor.plugin(KEYS.codeLine).type });
          tx.nodes.wrap({
            children: [],
            type,
          });
        }
      },
      untab: () => tab(true),
    };
  },
  shortcuts: {
    selectAll: { keys: 'mod+a' },
    tab: { keys: 'tab' },
    untab: { keys: 'shift+tab' },
  },
}).extend((context) => {
  const createCodeLine = (text: string) => ({
    children: [{ text }],
    type: context.editor.plugin(KEYS.codeLine).type,
  });

  return {
    contributions: [
      clipboardHandler({
        insertData(data, { next, transaction: tx }) {
          const text = data.getData('text/plain');
          const vscodeDataString = data.getData('vscode-editor-data');
          const codeLineType = context.editor.plugin(KEYS.codeLine).type;
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
      }),
    ],
    commands: ({ around, handle }) => [
      handle(editorCommands.delete, ({ input, state }) => {
        if (input.direction !== 'backward') return false;

        const selection = state.selection();

        if (!selection || state.selection.isExpanded()) return false;

        const codeLine = state.nodes.above<Element>({
          match: { type: context.editor.plugin(KEYS.codeLine).type },
        });
        const codeBlock = codeLine
          ? state.nodes.parent<Element>(codeLine[1])
          : undefined;

        if (
          !codeLine ||
          !codeBlock ||
          codeBlock[0].type !== context.type ||
          !state.selection.isAtBlockStart({
            match: { type: context.editor.plugin(KEYS.codeLine).type },
          })
        ) {
          return false;
        }

        const previousCodeLine = state.nodes.previous<Element>({
          at: codeLine[1],
          match: { type: context.editor.plugin(KEYS.codeLine).type },
        });
        const codeLineText = NodeApi.string(codeLine[0]);

        if (!previousCodeLine) {
          if (codeLineText.length > 0) return state.transaction(() => {});

          return state.transaction((tx) => {
            tx.nodes.replace(
              codeBlock[0].children.flatMap((child) =>
                ElementApi.isElement(child)
                  ? [
                      {
                        ...child,
                        type: context.editor.plugin(KEYS.p).type,
                      },
                    ]
                  : []
              ),
              {
                at: codeBlock[1],
              }
            );
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
              match: { type: context.editor.plugin(KEYS.codeLine).type },
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
            match: { type: context.editor.plugin(KEYS.codeLine).type },
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
        const codeLineType = context.editor.plugin(KEYS.codeLine).type;

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
  };
});

export type CodeBlockDefinition = DefinitionOf<typeof BaseCodeBlockPlugin>;

export type CodeHighlightPluginState = {
  defaultLanguage: string | null;
  lowlight: Lowlight | null;
};

export const BaseCodeHighlightPlugin = createBasePlugin({
  name: KEYS.codeSyntax,
  dependencies: [BaseCodeBlockPlugin],
  initialState: (): CodeHighlightPluginState => ({
    defaultLanguage: null,
    lowlight: null,
  }),
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  type: NODES.codeSyntax,
  decorate: ({ editor, entry: [node, path], store }) => {
    const { defaultLanguage, lowlight } = store.get();

    if (!lowlight) return [];

    const runtime = codeHighlightRuntimes.get(editor);

    if (!runtime) return [];

    const codeBlockType = editor.plugin(KEYS.codeBlock).type;
    const codeLineType = editor.plugin(KEYS.codeLine).type;

    if (
      ElementApi.isElement(node) &&
      node.type === codeBlockType &&
      ElementApi.isElement(node.children[0]) &&
      !runtime.lineDecorations.has(node.children[0])
    ) {
      const result = runtime.decorateBlock([node, path], {
        defaultLanguage,
        lowlight,
      });

      for (const [line, values] of result.decorations) {
        runtime.lineDecorations.set(line, values);
      }

      if (result.warning?.kind === 'highlight') {
        editor
          .plugin(DebugPlugin)
          .api.warn(
            `Could not highlight with Highlight.js for language "${result.warning.language}". Falling back to plaintext`,
            'CODE_HIGHLIGHT',
            result.warning.error
          );
      } else if (result.warning) {
        editor
          .plugin(DebugPlugin)
          .api.warn(
            `Language "${result.warning.language}" is not registered. Falling back to plaintext`
          );
      }
    }

    return ElementApi.isElement(node) && node.type === codeLineType
      ? (runtime.lineDecorations.get(node) ?? [])
      : [];
  },
}).extend(({ editor, store }) => {
  const stablePythonAliases = ['py', 'gyp', 'ipython'] as const;
  const source = (value: RegExp | string | null | undefined) => {
    if (!value) return null;

    return typeof value === 'string' ? value : value.source;
  };
  const concat = (...values: (RegExp | string | null | undefined)[]) =>
    values.map((value) => source(value)).join('');
  const lookahead = (value: RegExp | string) => concat('(?=', value, ')');

  // Adapted from the older Highlight.js Python grammar. The current 11.x
  // grammar uses unicodeRegex + multi-match rules that can generate invalid
  // regex ranges in browser bundles.
  // biome-ignore-start lint/performance/useTopLevelRegex: The vendored grammar stays lexical to its single plugin owner.
  const pythonBrowserSafe = (hljs: HighlightJs): HighlightLanguage => {
    const reservedWords = [
      'and',
      'as',
      'assert',
      'async',
      'await',
      'break',
      'case',
      'class',
      'continue',
      'def',
      'del',
      'elif',
      'else',
      'except',
      'finally',
      'for',
      'from',
      'global',
      'if',
      'import',
      'in',
      'is',
      'lambda',
      'match',
      'nonlocal|10',
      'not',
      'or',
      'pass',
      'raise',
      'return',
      'try',
      'while',
      'with',
      'yield',
    ];
    const builtIns = [
      '__import__',
      'abs',
      'all',
      'any',
      'ascii',
      'bin',
      'bool',
      'breakpoint',
      'bytearray',
      'bytes',
      'callable',
      'chr',
      'classmethod',
      'compile',
      'complex',
      'delattr',
      'dict',
      'dir',
      'divmod',
      'enumerate',
      'eval',
      'exec',
      'filter',
      'float',
      'format',
      'frozenset',
      'getattr',
      'globals',
      'hasattr',
      'hash',
      'help',
      'hex',
      'id',
      'input',
      'int',
      'isinstance',
      'issubclass',
      'iter',
      'len',
      'list',
      'locals',
      'map',
      'max',
      'memoryview',
      'min',
      'next',
      'object',
      'oct',
      'open',
      'ord',
      'pow',
      'print',
      'property',
      'range',
      'repr',
      'reversed',
      'round',
      'set',
      'setattr',
      'slice',
      'sorted',
      'staticmethod',
      'str',
      'sum',
      'super',
      'tuple',
      'type',
      'vars',
      'zip',
    ];
    const literals = [
      '__debug__',
      'Ellipsis',
      'False',
      'None',
      'NotImplemented',
      'True',
    ];
    const types = [
      'Any',
      'Callable',
      'Coroutine',
      'Dict',
      'List',
      'Literal',
      'Generic',
      'Optional',
      'Sequence',
      'Set',
      'Tuple',
      'Type',
      'Union',
    ];
    const keywords: NonNullable<HighlightMode['keywords']> = {
      $pattern: String.raw`[A-Za-z]\w+|__\w+__`,
      built_in: builtIns,
      keyword: reservedWords,
      literal: literals,
      type: types,
    };
    const prompt: HighlightMode = {
      begin: /^(>>>|\.\.\.) /,
      className: 'meta',
    };
    const subst: HighlightMode = {
      begin: /\{/,
      className: 'subst',
      end: /\}/,
      illegal: /#/,
      keywords,
    };
    const literalBracket: HighlightMode = {
      begin: /\{\{/,
      relevance: 0,
    };
    const string: HighlightMode = {
      className: 'string',
      contains: [hljs.BACKSLASH_ESCAPE],
      variants: [
        {
          begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
          contains: [hljs.BACKSLASH_ESCAPE, prompt],
          end: /'''/,
          relevance: 10,
        },
        {
          begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
          contains: [hljs.BACKSLASH_ESCAPE, prompt],
          end: /"""/,
          relevance: 10,
        },
        {
          begin: /([fF][rR]|[rR][fF]|[fF])'''/,
          contains: [hljs.BACKSLASH_ESCAPE, prompt, literalBracket, subst],
          end: /'''/,
        },
        {
          begin: /([fF][rR]|[rR][fF]|[fF])"""/,
          contains: [hljs.BACKSLASH_ESCAPE, prompt, literalBracket, subst],
          end: /"""/,
        },
        {
          begin: /([uU]|[rR])'/,
          end: /'/,
          relevance: 10,
        },
        {
          begin: /([uU]|[rR])"/,
          end: /"/,
          relevance: 10,
        },
        {
          begin: /([bB]|[bB][rR]|[rR][bB])'/,
          end: /'/,
        },
        {
          begin: /([bB]|[bB][rR]|[rR][bB])"/,
          end: /"/,
        },
        {
          begin: /([fF][rR]|[rR][fF]|[fF])'/,
          contains: [hljs.BACKSLASH_ESCAPE, literalBracket, subst],
          end: /'/,
        },
        {
          begin: /([fF][rR]|[rR][fF]|[fF])"/,
          contains: [hljs.BACKSLASH_ESCAPE, literalBracket, subst],
          end: /"/,
        },
        hljs.APOS_STRING_MODE,
        hljs.QUOTE_STRING_MODE,
      ],
    };
    const digitPart = '[0-9](_?[0-9])*';
    const pointFloat = `(\\b(${digitPart}))?\\.(${digitPart})|\\b(${digitPart})\\.`;
    const number: HighlightMode = {
      className: 'number',
      relevance: 0,
      variants: [
        {
          begin: `(\\b(${digitPart})|(${pointFloat}))[eE][+-]?(${digitPart})[jJ]?\\b`,
        },
        {
          begin: `(${pointFloat})[jJ]?`,
        },
        {
          begin: '\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?\\b',
        },
        {
          begin: '\\b0[bB](_?[01])+[lL]?\\b',
        },
        {
          begin: '\\b0[oO](_?[0-7])+[lL]?\\b',
        },
        {
          begin: '\\b0[xX](_?[0-9a-fA-F])+[lL]?\\b',
        },
        {
          begin: `\\b(${digitPart})[jJ]\\b`,
        },
      ],
    };
    const commentType: HighlightMode = {
      begin: lookahead(/# type:/),
      className: 'comment',
      contains: [
        {
          begin: /# type:/,
        },
        {
          begin: /#/,
          end: /\b\B/,
          endsWithParent: true,
        },
      ],
      end: /$/,
      keywords,
    };
    const params: HighlightMode = {
      className: 'params',
      variants: [
        {
          begin: /\(\s*\)/,
          className: '',
          skip: true,
        },
        {
          begin: /\(/,
          contains: ['self', prompt, number, string, hljs.HASH_COMMENT_MODE],
          end: /\)/,
          excludeBegin: true,
          excludeEnd: true,
          keywords,
        },
      ],
    };

    subst.contains = [string, number, prompt];

    return {
      aliases: [...stablePythonAliases],
      contains: [
        prompt,
        number,
        {
          begin: /\bself\b/,
        },
        {
          beginKeywords: 'if',
          relevance: 0,
        },
        string,
        commentType,
        hljs.HASH_COMMENT_MODE,
        {
          contains: [
            hljs.UNDERSCORE_TITLE_MODE,
            params,
            {
              begin: /->/,
              endsWithParent: true,
              keywords,
            },
          ],
          end: /:/,
          illegal: /[${=;\n,]/,
          variants: [
            {
              beginKeywords: 'def',
              className: 'function',
            },
            {
              beginKeywords: 'class',
              className: 'class',
            },
          ],
        },
        {
          begin: /^[\t ]*@/,
          className: 'meta',
          contains: [number, params, string],
          end: /(?=#)|$/,
        },
      ],
      illegal: /(<\/|->|\?)|=>/,
      keywords,
      name: 'Python',
    };
  };
  // biome-ignore-end lint/performance/useTopLevelRegex: The vendored grammar stays lexical to its single plugin owner.
  const ensureStablePythonGrammar = (
    lowlight: Lowlight,
    language: string | null | undefined
  ) => {
    if (language !== 'python' || patchedLowlights.has(lowlight)) return;

    lowlight.register('python', pythonBrowserSafe);
    lowlight.registerAlias('python', stablePythonAliases);
    patchedLowlights.add(lowlight);
  };
  const lineDecorations = new WeakMap<Element, DecoratedRange[]>();
  const parseNodes = (
    nodes: HighlightNode[],
    className: string[] = []
  ): { classes: string[]; text: string }[] =>
    nodes.flatMap((node) => {
      if (node.type === 'element') {
        const nodeClassName = node.properties.className;
        const classes = [
          ...className,
          ...(Array.isArray(nodeClassName)
            ? nodeClassName.map(String)
            : typeof nodeClassName === 'string'
              ? [nodeClassName]
              : []),
        ];

        return parseNodes(node.children, classes);
      }

      return node.type === 'text'
        ? [{ classes: className, text: node.value }]
        : [];
    });
  const normalizeTokens = (tokens: { classes: string[]; text: string }[]) => {
    const lines: { classes: string[]; content: string }[][] = [[]];
    let currentLine = lines[0];

    for (const token of tokens) {
      const tokenLines = token.text.split('\n');

      tokenLines.forEach((content, index) => {
        if (content) currentLine.push({ classes: token.classes, content });

        if (index < tokenLines.length - 1) {
          lines.push([]);
          currentLine = lines.at(-1)!;
        }
      });
    }

    return lines;
  };
  const decorateBlock: CodeHighlightRuntime['decorateBlock'] = (
    [block, blockPath],
    { defaultLanguage, lowlight }
  ) => {
    const decorations = new Map<Element, DecoratedRange[]>();
    const text = block.children.map((line) => NodeApi.string(line)).join('\n');
    const language = typeof block.lang === 'string' ? block.lang : undefined;
    const effectiveLanguage = language || defaultLanguage;

    ensureStablePythonGrammar(lowlight, effectiveLanguage);

    let highlighted: HighlightResult;
    let warning: CodeHighlightWarning | undefined;

    try {
      if (!effectiveLanguage || effectiveLanguage === 'plaintext') {
        highlighted = { children: [], type: 'root' };
      } else if (effectiveLanguage === 'auto') {
        highlighted = lowlight.highlightAuto(text);
      } else {
        highlighted = lowlight.highlight(effectiveLanguage, text);
      }
    } catch (error) {
      const languageName = effectiveLanguage ?? 'unknown';

      warning =
        effectiveLanguage &&
        lowlight.listLanguages().includes(effectiveLanguage)
          ? {
              error,
              kind: 'highlight',
              language: languageName,
            }
          : {
              kind: 'missing-language',
              language: languageName,
            };
      highlighted = { children: [], type: 'root' };
    }

    const normalizedTokens = normalizeTokens(parseNodes(highlighted.children));
    const lineCount = Math.min(normalizedTokens.length, block.children.length);

    for (let index = 0; index < lineCount; index++) {
      const element = block.children[index];

      if (!ElementApi.isElement(element)) continue;

      const values: DecoratedRange[] = [];
      let start = 0;

      decorations.set(element, values);

      for (const token of normalizedTokens[index]) {
        const end = start + token.content.length;

        if (end === start) continue;

        const decoration: CodeBlockDecoration = {
          anchor: {
            offset: start,
            path: [...blockPath, index, 0],
          },
          className: token.classes.join(' '),
          focus: {
            offset: end,
            path: [...blockPath, index, 0],
          },
          [NODES.codeSyntax]: true,
        };

        values.push(decoration);
        start = end;
      }
    }

    return {
      decorations,
      ...(warning ? { warning } : {}),
    };
  };

  const runtime = {
    decorateBlock,
    lineDecorations,
  };

  codeHighlightRuntimes.set(editor, runtime);

  return {
    corrections: [
      {
        event: 'content',
        correct({ entry: [node] }) {
          if (
            !ElementApi.isElement(node) ||
            node.type !== editor.plugin(KEYS.codeBlock).type ||
            !store.get().lowlight
          ) {
            return;
          }

          node.children.forEach((line) => {
            if (ElementApi.isElement(line)) {
              runtime.lineDecorations.delete(line);
            }
          });
        },
      },
    ],
    on: {
      transactionChange(context) {
        if (!store.get().lowlight) return;

        const codeBlock = findCodeBlockLanguageChange(
          context,
          editor.plugin(KEYS.codeBlock).type
        )?.before;

        if (!codeBlock) return;

        codeBlock.children.forEach((line) => {
          if (ElementApi.isElement(line)) {
            runtime.lineDecorations.delete(line);
          }
        });
      },
    },
  };
});

export type CodeHighlightDefinition = DefinitionOf<
  typeof BaseCodeHighlightPlugin
>;
