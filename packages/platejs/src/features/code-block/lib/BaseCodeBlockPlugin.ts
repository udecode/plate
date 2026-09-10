import {
  ContentSlice,
  DebugPlugin,
  defineBasePlugin,
  type DefinitionOf,
  editorCommands,
  type Element,
  ElementApi,
  type ElementOf,
  type Location,
  NodeApi,
  type NodeEntry,
  type NodeSelection,
  PathApi,
  type PlateNodeInsertOptions,
  PLUGINS,
  property,
  type Range,
  RangeApi,
  schema,
} from '../../../core';
import { clipboardHandler } from '../../../dom/plite-dom.internal';

const CODE_LANGUAGE_CLASS_RE = /(?:^|\s)language-([^\s]+)/;
const NON_WHITESPACE = /\S/;
const NON_WHITESPACE_OR_END = /\S|$/;
const TRAILING_NEWLINES = /\n+$/;
const patchedLowlights = new WeakSet<object>();

type HighlightMode = {
  aliases?: string[];
  begin?: RegExp | string;
  beginKeywords?: string;
  className?: string;
  contains?: Array<HighlightMode | string>;
  end?: RegExp | string;
  endsWithParent?: boolean;
  excludeBegin?: boolean;
  excludeEnd?: boolean;
  illegal?: RegExp | string;
  keywords?: string | string[] | Record<string, string | string[]>;
  name?: string;
  relevance?: number;
  skip?: boolean;
  variants?: HighlightMode[];
};
type HighlightLanguage = HighlightMode & {
  contains: HighlightMode[];
  name: string;
};
type HighlightJs = {
  APOS_STRING_MODE: HighlightMode;
  BACKSLASH_ESCAPE: HighlightMode;
  HASH_COMMENT_MODE: HighlightMode;
  QUOTE_STRING_MODE: HighlightMode;
  UNDERSCORE_TITLE_MODE: HighlightMode;
};
export type HighlightNode = {
  children?: HighlightNode[];
  properties?: Record<string, unknown>;
  type: string;
  value?: string;
};
export type HighlightResult = {
  children: HighlightNode[];
  type: string;
};
export type CodeHighlightGrammar = (...args: never[]) => unknown;

export type CodeHighlightLowlight = {
  highlight(
    language: string,
    value: string,
    options?: Readonly<{ prefix?: string | null }> | null
  ): HighlightResult;
  highlightAuto(
    value: string,
    options?: Readonly<{
      prefix?: string | null;
      subset?: readonly string[] | null;
    }> | null
  ): HighlightResult;
  listLanguages(): string[];
  registered(aliasOrName: string): boolean;
};
type CodeHighlightRegistry = {
  register(name: string, grammar: CodeHighlightGrammar): unknown;
  registerAlias(language: string, alias: readonly string[] | string): unknown;
};
const isCodeHighlightRegistry = (
  lowlight: CodeHighlightLowlight
): lowlight is CodeHighlightLowlight & CodeHighlightRegistry => {
  const registry = lowlight as CodeHighlightLowlight &
    Partial<CodeHighlightRegistry>;

  return (
    typeof registry.register === 'function' &&
    typeof registry.registerAlias === 'function'
  );
};
type CodeBlockDecoration = Readonly<{
  attributes: Readonly<{ className: string; 'data-code-block-syntax': '' }>;
  key: string;
  range: Range;
}>;
type CodeHighlightWarning =
  | { error: unknown; kind: 'highlight'; language: string }
  | { kind: 'missing-language'; language: string };
type CodeHighlightCache = {
  attributes: ReadonlyMap<string, CodeBlockDecoration['attributes']>;
  decorations: readonly CodeBlockDecoration[];
  language: string | null;
  lowlight: CodeHighlightLowlight;
  text: string;
};

const getLineStartOffset = (text: string, offset: number) =>
  offset === 0 ? 0 : text.lastIndexOf('\n', offset - 1) + 1;

const getLineEndOffset = (text: string, offset: number) => {
  const nextBreak = text.indexOf('\n', offset);

  return nextBreak === -1 ? text.length : nextBreak;
};

const getIndentDepth = (text: string, offset: number) => {
  const lineStart = getLineStartOffset(text, offset);
  const lineEnd = getLineEndOffset(text, offset);

  return text.slice(lineStart, lineEnd).search(NON_WHITESPACE_OR_END);
};

const countTrailingNewlines = (text: string) =>
  text.match(TRAILING_NEWLINES)?.[0].length ?? 0;

const readCodeDomText = (node: Node): string => {
  if (node.nodeName === 'SELECT') return '';
  if (node.nodeName === 'BR') return '\n';
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';

  return Array.from(node.childNodes).map(readCodeDomText).join('');
};

const restoreTrailingNewlines = (text: string, element: HTMLElement) => {
  const encoded = element.dataset.codeTrailingNewlines;

  if (!encoded || !/^\d+$/.test(encoded)) return text;

  const expected = Number(encoded);
  const current = countTrailingNewlines(text);

  if (!Number.isSafeInteger(expected) || expected > text.length + 1) {
    return text;
  }

  return current < expected ? text + '\n'.repeat(expected - current) : text;
};

const getSelectedLineStarts = (text: string, start: number, end: number) => {
  const starts = [getLineStartOffset(text, start)];
  let nextBreak = text.indexOf('\n', starts[0]);

  while (nextBreak !== -1 && nextBreak < end) {
    starts.push(nextBreak + 1);
    nextBreak = text.indexOf('\n', nextBreak + 1);
  }

  return starts;
};

const offsetToLinePoint = (text: string, offset: number) => {
  const before = text.slice(0, offset);
  const line = before.split('\n').length - 1;
  const lineStart = before.lastIndexOf('\n') + 1;

  return { line, offset: offset - lineStart };
};

export const BaseCodeBlockPlugin = defineBasePlugin(PLUGINS.codeBlock, {
  read: ({ plugin, state }) => {
    const entry = ({
      at,
    }: {
      at?: Location | null;
    } = {}) => {
      const selection = state.selection();
      const target = at === undefined ? selection : at;

      if (!target) return undefined;

      const codeBlock = state.nodes.above({
        at: target,
        type: plugin,
      });

      if (!codeBlock) return undefined;

      return { codeBlock };
    };

    return {
      entry,
      indentDepth: () => {
        const selection = state.selection();
        const codeBlock = entry()?.codeBlock;

        if (!selection || !codeBlock) return 0;

        return getIndentDepth(
          NodeApi.string(codeBlock[0]),
          selection.anchor.offset
        );
      },
      isEmpty: () => {
        const codeBlock = entry()?.codeBlock[0];

        if (!codeBlock) return false;
        if (codeBlock.children.length === 0) return true;
        if (codeBlock.children.length > 1) return false;

        return !NodeApi.string(codeBlock.children[0]);
      },
    };
  },
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1, max: 1 }),
      properties: { language: property.string() },
      slice: { preserveContext: true },
    },
  },

  component: 'pre',
  codecs: ({ defineCodecs, schema: { type } }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => {
          const languageClass = element
            .querySelector(':scope > code')
            ?.className.match(CODE_LANGUAGE_CLASS_RE)?.[1];
          const language =
            element.dataset.language || languageClass || undefined;
          const text = restoreTrailingNewlines(
            readCodeDomText(element),
            element
          );

          return {
            children: [{ text }],
            ...(language ? { language } : {}),
          };
        },
        encode: ({ content, node }) => {
          const trailingNewlines = countTrailingNewlines(NodeApi.string(node));

          return {
            attributes: {
              ...(trailingNewlines > 0
                ? { 'data-code-trailing-newlines': trailingNewlines }
                : {}),
              'data-language': node.language,
            },
            children: [{ children: content, tag: 'code' }],
            tag: 'pre',
          };
        },
        match: [
          { tag: 'pre' },
          { style: { fontFamily: 'Consolas' }, tag: 'p' },
        ],
        priority: 10,
        query: ({ state }) => {
          const selection = state.selection();

          return !selection || !state.nodes.some({ at: selection, type });
        },
      },
      'text/markdown': {
        from: 'code',
        kind: 'node',
        decode: ({ node }) => ({
          ...(node.lang ? { language: node.lang } : {}),
          children: [{ text: node.value || '' }],
          type,
        }),
        encode: ({ node }) => ({
          lang: node.language,
          type: 'code',
          value: NodeApi.string(node),
        }),
      },
    }),
  shortcuts: {
    selectAll: { keys: 'mod+a' },
    tab: { keys: 'tab' },
    untab: { keys: 'shift+tab' },
  },
})
  .extend(({ editor, plugin, schema: { type } }) => {
    type CodeBlock = ElementOf<typeof plugin>;

    return {
      update: ({ tx }) => {
        const paragraphType = editor.plugin(PLUGINS.paragraph).schema.type;
        const codeBlockTextPath = (path: readonly number[]) => [...path, 0];
        const createParagraphs = (code: string) =>
          code.split('\n').map((text) => ({
            children: [{ text }],
            type: paragraphType,
          }));
        const pointInBlock = (
          blockPath: readonly number[],
          point: { path: readonly number[] }
        ) => PathApi.isAncestor(blockPath, point.path);
        const mapPointToParagraph = (
          blockPath: readonly number[],
          code: string,
          point: { offset: number; path: readonly number[]; root?: string }
        ) => {
          const mapped = offsetToLinePoint(code, point.offset);
          const blockIndex = blockPath.at(-1);

          if (blockIndex === undefined) return point;

          return {
            offset: mapped.offset,
            path: [...blockPath.slice(0, -1), blockIndex + mapped.line, 0],
            ...(point.root ? { root: point.root } : {}),
          };
        };
        const unwrap = ({
          at,
        }: {
          at?: Location | NodeSelection;
        } = {}) => {
          if (at === undefined && !tx.selection()) return;

          const codeBlockEntries = Array.from(
            tx.nodes.entries({
              at,
              type: plugin,
            })
          ).reverse();

          for (const [codeBlock, codeBlockPath] of codeBlockEntries) {
            const code = NodeApi.string(codeBlock);
            const selection = tx.selection();
            const mappedSelection =
              selection &&
              pointInBlock(codeBlockPath, selection.anchor) &&
              pointInBlock(codeBlockPath, selection.focus)
                ? {
                    anchor: mapPointToParagraph(
                      codeBlockPath,
                      code,
                      selection.anchor
                    ),
                    focus: mapPointToParagraph(
                      codeBlockPath,
                      code,
                      selection.focus
                    ),
                  }
                : undefined;

            tx.nodes.replace(createParagraphs(code), { at: codeBlockPath });

            if (mappedSelection) tx.selection.set(mappedSelection);
          }
        };
        const insertBlock = (
          options: Omit<PlateNodeInsertOptions, 'split'> = {}
        ) => {
          const selection = tx.selection();

          if (!selection || tx.selection.isExpanded()) return;

          if (tx.nodes.some({ type: plugin })) return;
          if (!tx.selection.isAtBlockStart()) tx.break.insert();

          const mutationOptions = {
            at: options.at,
            mode: options.mode,
            voids: options.voids,
          };

          tx.nodes.set(
            {
              type,
            },
            mutationOptions
          );
        };
        const setContent = ({
          code,
          element,
        }: {
          code: string;
          element: CodeBlock;
        }) => {
          tx.nodes.replaceChildren([{ text: code }], { at: element });
        };
        const tab = (reverse = false) => {
          const selection = tx.selection();

          if (!selection) return false;

          const codeBlock = tx.nodes.above({
            at: selection.anchor,
            type: plugin,
          });

          if (!codeBlock || !pointInBlock(codeBlock[1], selection.focus)) {
            return false;
          }

          const text = NodeApi.string(codeBlock[0]);
          const textPath = codeBlockTextPath(codeBlock[1]);
          const value = '  ';

          if (!tx.selection.isExpanded()) {
            const lineStart = getLineStartOffset(text, selection.anchor.offset);
            const beforeCursor = text.slice(lineStart, selection.anchor.offset);
            const offset = NON_WHITESPACE.test(beforeCursor)
              ? selection.anchor.offset
              : lineStart;

            if (reverse) {
              const removable = text
                .slice(lineStart, lineStart + value.length)
                .match(/^[ \t]{1,2}/)?.[0].length;

              if (!removable) return true;

              tx.text.delete({
                at: {
                  anchor: { offset: lineStart, path: textPath },
                  focus: { offset: lineStart + removable, path: textPath },
                },
              });
            } else {
              tx.text.insert(value, { at: { offset, path: textPath } });
            }

            return true;
          }

          const [start, end] = RangeApi.edges(selection);
          const lineStarts = getSelectedLineStarts(
            text,
            start.offset,
            end.offset
          ).reverse();

          for (const lineStart of lineStarts) {
            if (reverse) {
              const removable = text
                .slice(lineStart, lineStart + value.length)
                .match(/^[ \t]{1,2}/)?.[0].length;

              if (!removable) continue;

              tx.text.delete({
                at: {
                  anchor: { offset: lineStart, path: textPath },
                  focus: { offset: lineStart + removable, path: textPath },
                },
              });
            } else {
              tx.text.insert(value, {
                at: { offset: lineStart, path: textPath },
              });
            }
          }

          return true;
        };

        return {
          format: ({ element }: { element: CodeBlock }) => {
            const { language } = element;
            const code = NodeApi.string(element);

            if (language !== 'json') return;

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
          insert: (
            {
              defaultType = editor.plugin(PLUGINS.paragraph).schema.type,
            }: { defaultType?: string } = {},
            options: Omit<PlateNodeInsertOptions, 'split'> = {}
          ) => {
            const selection = tx.selection();

            if (!selection) return;

            const block = tx.selection.isCollapsed()
              ? tx.nodes.block({ at: selection })
              : undefined;
            const shouldInsertNextBlock =
              tx.selection.isExpanded() ||
              !block ||
              !tx.nodes.isEmpty(block[0]);
            let codeBlockOptions = options;

            if (shouldInsertNextBlock) {
              const { at: _at, ...remainingOptions } = options;

              tx.blocks.insertAfter(
                { children: [{ text: '' }], type: defaultType },
                {
                  ...options,
                  select: true,
                }
              );
              codeBlockOptions = remainingOptions;
            }

            insertBlock(codeBlockOptions);
          },
          resetBlock: () => {
            if (!tx.nodes.block({ type: plugin })) return false;

            unwrap();

            return true;
          },
          selectAll: () => {
            const codeBlock = tx.nodes.above({
              type: plugin,
            });

            if (!codeBlock) return false;

            const selection = tx.selection();
            const blockRange = tx.ranges.get(codeBlock[1]);

            if (
              selection &&
              blockRange &&
              RangeApi.equals(selection, blockRange)
            ) {
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
              type: plugin,
            });

            unwrap();

            if (!isActive) {
              const [start, end] = RangeApi.edges(selection);
              const startBlock = tx.nodes.block({ at: start });
              const endBlock = tx.nodes.block({ at: end });

              if (!startBlock || !endBlock) return;

              const startParent = startBlock[1].slice(0, -1);
              const endParent = endBlock[1].slice(0, -1);
              const startIndex = startBlock[1].at(-1);
              const endIndex = endBlock[1].at(-1);

              if (
                startIndex === undefined ||
                endIndex === undefined ||
                !PathApi.equals(startParent, endParent)
              ) {
                tx.nodes.set({ type }, { at: startBlock[1] });

                return;
              }

              const blocks: Array<NodeEntry<Element>> = [];

              for (let index = startIndex; index <= endIndex; index++) {
                const block = tx.nodes.get([...startParent, index], {
                  match: ElementApi.isElement,
                });

                if (block) blocks.push(block);
              }

              if (blocks.length === 0) return;

              const values = blocks.map(([block]) => NodeApi.string(block));
              const mapSelectionPoint = (point: typeof selection.anchor) => {
                let offset = 0;

                for (let index = 0; index < blocks.length; index++) {
                  const [, blockPath] = blocks[index];

                  if (pointInBlock(blockPath, point)) {
                    const blockStart = tx.points.start(blockPath);
                    const range =
                      blockStart && tx.ranges.get(blockStart, point);

                    offset += range ? tx.text.string(range).length : 0;

                    return {
                      offset,
                      path: codeBlockTextPath(blocks[0][1]),
                      ...(point.root ? { root: point.root } : {}),
                    };
                  }

                  offset += values[index].length + 1;
                }

                return point;
              };
              const mappedSelection = {
                anchor: mapSelectionPoint(selection.anchor),
                focus: mapSelectionPoint(selection.focus),
              };

              for (const [, blockPath] of blocks.slice(1).reverse()) {
                tx.nodes.remove({ at: blockPath });
              }

              tx.nodes.replace(
                {
                  children: [{ text: values.join('\n') }],
                  type,
                },
                { at: blocks[0][1] }
              );
              tx.selection.set(mappedSelection);
            }
          },
          untab: () => tab(true),
        };
      },
    };
  })
  .extend((context) => ({
    contributions: [
      clipboardHandler({
        insertData(data, { next, tx }) {
          const text = data.getData('text/plain');
          const vscodeDataString = data.getData('vscode-editor-data');
          const block = tx.nodes.block();
          const isInCodeBlock = block?.[0].type === context.schema.type;

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
              if (isInCodeBlock) {
                tx.text.insert(text);

                return true;
              }

              if (!block) return next(data);

              tx.fragment.replace(
                [
                  {
                    children: [{ text }],
                    language,
                    type: context.schema.type,
                  },
                ],
                {
                  at: PathApi.next(block[1]),
                }
              );

              return true;
            } catch {
              // Ignore malformed syntax nodes and keep scanning candidates.
            }
          }

          if (isInCodeBlock && text?.includes('\n')) {
            tx.text.insert(text);

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

        if (!selection || state.selection.isExpanded()) {
          return false;
        }

        const codeBlock = state.nodes.above({ type: context.plugin });

        if (
          !codeBlock ||
          codeBlock[0].type !== context.schema.type ||
          selection.anchor.offset !== 0
        ) {
          return false;
        }

        if (NodeApi.string(codeBlock[0]).length > 0) {
          return state.transaction(() => {});
        }

        return state.transaction((tx) => {
          tx.nodes.set(
            {
              type: context.editor.plugin(PLUGINS.paragraph).schema.type,
            },
            { at: codeBlock[1] }
          );
        });
      }),
      around(editorCommands.insertBreak, ({ state }) => {
        const selection = state.selection();
        const codeBlock = selection
          ? state.nodes.above({
              at: selection,
              type: context.plugin,
            })
          : undefined;

        if (
          !selection ||
          !codeBlock ||
          codeBlock[0].type !== context.schema.type ||
          !PathApi.isAncestor(codeBlock[1], selection.focus.path)
        ) {
          return false;
        }

        const code = NodeApi.string(codeBlock[0]);
        const [start, end] = RangeApi.edges(selection);
        const indentDepth = getIndentDepth(code, start.offset);
        const suffixIndent =
          code.slice(end.offset).match(/^[ \t]*/)?.[0].length ?? 0;
        const indent = ' '.repeat(Math.max(0, indentDepth - suffixIndent));

        return state.transaction((tx) => {
          tx.text.insert(`\n${indent}`, { at: selection });
        });
      }),
      around(editorCommands.replaceSlice, ({ input, state, next }) => {
        const { options, slice } = input;
        const fragment = [...slice.content];
        const target = options?.at;
        const currentSelection = state.selection();

        if (target === undefined && !currentSelection) {
          return next();
        }

        const at =
          target === undefined
            ? (currentSelection ?? undefined)
            : NodeApi.isNode(target)
              ? state.nodes.path(target)
              : target;

        if (target !== undefined && at === undefined) {
          return next();
        }

        if (!state.nodes.block({ at, type: context.schema.type })) {
          return next();
        }

        const separator = fragment.every((node) => !ElementApi.isElement(node))
          ? ''
          : '\n';
        const text = fragment
          .map((node) => NodeApi.string(node))
          .join(separator);

        return next({
          ...input,
          slice: ContentSlice.withContent(slice, [{ text }], {
            open: 'closed',
          }),
        });
      }),
    ],
  }));

export type CodeBlockElement = ElementOf<typeof BaseCodeBlockPlugin>;

export type CodeHighlightPluginState = {
  defaultLanguage: string | null;
  lowlight: CodeHighlightLowlight | null;
};

export const BaseCodeHighlightPlugin = defineBasePlugin(PLUGINS.codeSyntax, {
  dependencies: [BaseCodeBlockPlugin],
  initialState: (): CodeHighlightPluginState => ({
    defaultLanguage: null,
    lowlight: null,
  }),
}).extend(({ editor, store }) => {
  const stablePythonAliases = ['py', 'gyp', 'ipython'] as const;
  const source = (value: RegExp | string | null | undefined) => {
    if (!value) return null;

    return typeof value === 'string' ? value : value.source;
  };
  const concat = (...values: Array<RegExp | string | null | undefined>) =>
    values.map((value) => source(value)).join('');
  const lookahead = (value: RegExp | string) => concat('(?=', value, ')');

  // Adapted from the older Highlight.js Python grammar. The current 11.x
  // grammar uses unicodeRegex + multi-match rules that can generate invalid
  // regex ranges in browser bundles.
  // The vendored grammar stays lexical to its single plugin owner.
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
  // The vendored grammar stays lexical to its single plugin owner.
  const ensureStablePythonGrammar = (
    lowlight: CodeHighlightLowlight,
    language: string | null | undefined
  ) => {
    if (
      language !== 'python' ||
      patchedLowlights.has(lowlight) ||
      !isCodeHighlightRegistry(lowlight)
    ) {
      return;
    }

    lowlight.register('python', pythonBrowserSafe);
    lowlight.registerAlias('python', stablePythonAliases);
    patchedLowlights.add(lowlight);
  };
  const blockDecorations = new Map<string, CodeHighlightCache>();
  let nextSyntaxKey = 0;
  let observers = 0;
  const parseNodes = (
    nodes: HighlightNode[],
    className: string[] = [],
    result: Array<{ classes: string[]; text: string }> = []
  ) => {
    for (const node of nodes) {
      if (node.type === 'element') {
        const nodeClassName = node.properties?.className;
        const classes = [
          ...className,
          ...(Array.isArray(nodeClassName)
            ? nodeClassName.map(String)
            : typeof nodeClassName === 'string'
              ? [nodeClassName]
              : []),
        ];

        parseNodes(node.children ?? [], classes, result);
      } else if (node.type === 'text' && typeof node.value === 'string') {
        result.push({ classes: className, text: node.value });
      }
    }
    return result;
  };

  return {
    decorate: {
      observe: ({ refresh }) => {
        observers += 1;
        const unsubscribe = store.subscribe(() => {
          blockDecorations.clear();
          refresh({ nodeKeys: 'all' });
        });

        return () => {
          unsubscribe();
          observers -= 1;
          if (observers === 0) blockDecorations.clear();
        };
      },
      read: ({ entry: [node, path] }): readonly CodeBlockDecoration[] => {
        const { defaultLanguage, lowlight } = store.get();

        if (!lowlight || !NodeApi.isText(node)) return [];
        const codeBlockType = editor.plugin(PLUGINS.codeBlock).schema.type;
        const entry = editor.read.nodes.parent(path, { type: codeBlockType });

        if (!entry) return [];
        const [block, blockPath] = entry;
        const blockKey = editor.key(block);
        const text = NodeApi.string(block);
        const language =
          (typeof block.language === 'string' ? block.language : undefined) ||
          defaultLanguage;
        const previous = blockDecorations.get(blockKey);

        if (
          previous?.language === language &&
          previous.text === text &&
          previous.lowlight === lowlight
        ) {
          const previousPath = previous.decorations[0]?.range.anchor.path;

          if (previousPath && !PathApi.isParent(blockPath, previousPath)) {
            const textPath = Object.freeze([...blockPath, 0]);

            previous.decorations = Object.freeze(
              previous.decorations.map((decoration) =>
                Object.freeze({
                  ...decoration,
                  range: Object.freeze({
                    anchor: Object.freeze({
                      ...decoration.range.anchor,
                      path: textPath,
                    }),
                    focus: Object.freeze({
                      ...decoration.range.focus,
                      path: textPath,
                    }),
                  }),
                })
              )
            );
          }
          return previous.decorations;
        }

        ensureStablePythonGrammar(lowlight, language);
        let highlighted: HighlightResult;
        let warning: CodeHighlightWarning | undefined;

        try {
          if (!language || language === 'plaintext') {
            highlighted = { children: [], type: 'root' };
          } else if (language === 'auto') {
            highlighted = lowlight.highlightAuto(text);
          } else highlighted = lowlight.highlight(language, text);
        } catch (error) {
          const languageName = language ?? 'unknown';

          warning =
            language && lowlight.listLanguages().includes(language)
              ? { error, kind: 'highlight', language: languageName }
              : { kind: 'missing-language', language: languageName };
          highlighted = { children: [], type: 'root' };
        }

        const decorations: CodeBlockDecoration[] = [];
        const attributesByClass = new Map<
          string,
          CodeBlockDecoration['attributes']
        >();
        const textPath = Object.freeze([...blockPath, 0]);
        const previousTokens = previous?.decorations ?? [];
        let retainedPrefix = 0;
        let matchingPrefix = true;
        let start = 0;

        for (const token of parseNodes(highlighted.children)) {
          const end = start + token.text.length;

          if (end > start && token.classes.length > 0) {
            const className = token.classes.join(' ');
            let attributes = attributesByClass.get(className);

            if (!attributes) {
              attributes =
                previous?.attributes.get(className) ??
                Object.freeze({ className, 'data-code-block-syntax': '' });
              attributesByClass.set(className, attributes);
            }
            const before = previousTokens[decorations.length];

            if (
              matchingPrefix &&
              before &&
              before.attributes === attributes &&
              before.range.anchor.offset === start &&
              before.range.focus.offset === end &&
              PathApi.equals(before.range.anchor.path, textPath)
            ) {
              decorations.push(before);
              retainedPrefix += 1;
            } else {
              matchingPrefix = false;
              decorations.push({
                attributes,
                key: '',
                range: {
                  anchor: { offset: start, path: textPath },
                  focus: { offset: end, path: textPath },
                },
              });
            }
          }
          start = end;
        }

        const delta = text.length - (previous?.text.length ?? 0);
        let beforeEnd = previousTokens.length;
        let afterEnd = decorations.length;

        while (beforeEnd > retainedPrefix && afterEnd > retainedPrefix) {
          const before = previousTokens[beforeEnd - 1];
          const after = decorations[afterEnd - 1];

          if (
            before.attributes !== after.attributes ||
            before.range.anchor.offset + delta !== after.range.anchor.offset ||
            before.range.focus.offset + delta !== after.range.focus.offset
          ) {
            break;
          }
          decorations[afterEnd - 1] =
            delta === 0 && PathApi.equals(before.range.anchor.path, textPath)
              ? before
              : { ...after, key: before.key };
          beforeEnd -= 1;
          afterEnd -= 1;
        }
        for (let index = retainedPrefix; index < afterEnd; index++) {
          decorations[index] = {
            ...decorations[index],
            key: `${blockKey}:${nextSyntaxKey}`,
          };
          nextSyntaxKey += 1;
        }
        for (let index = retainedPrefix; index < decorations.length; index++) {
          const decoration = decorations[index];

          if (Object.isFrozen(decoration)) continue;
          Object.freeze(decoration.range.anchor);
          Object.freeze(decoration.range.focus);
          Object.freeze(decoration.range);
          Object.freeze(decoration);
        }
        Object.freeze(decorations);
        blockDecorations.set(blockKey, {
          attributes: attributesByClass,
          decorations,
          language,
          lowlight,
          text,
        });

        if (warning?.kind === 'highlight') {
          editor
            .plugin(DebugPlugin)
            .api.warn(
              `Could not highlight with Highlight.js for language "${warning.language}". Falling back to plaintext`,
              'CODE_HIGHLIGHT',
              warning.error
            );
        } else if (warning) {
          editor
            .plugin(DebugPlugin)
            .api.warn(
              `Language "${warning.language}" is not registered. Falling back to plaintext`
            );
        }
        return decorations;
      },
    },
    on: {
      commit({ commit }) {
        if (blockDecorations.size === 0) return;
        const structure =
          commit.changed.hasAny('structure') ||
          commit.changed.hasAny('replace');

        if (!structure && !commit.changed.hasAny('properties')) return;
        const codeBlockType = editor.plugin(PLUGINS.codeBlock).schema.type;
        const keys = new Set([
          ...commit.changed.nodeKeysAll('node'),
          ...(structure ? commit.changed.nodeKeysAll('presence') : []),
        ]);

        for (const key of keys) {
          if (!blockDecorations.has(key)) continue;
          const entry = editor.read.nodes.get(key);

          if (!entry || !ElementApi.isElementType(entry[0], codeBlockType)) {
            blockDecorations.delete(key);
          }
        }
      },
    },
  };
});

export type CodeBlockDefinition = DefinitionOf<typeof BaseCodeBlockPlugin>;

export type CodeHighlightDefinition = DefinitionOf<
  typeof BaseCodeHighlightPlugin
>;
