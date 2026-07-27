import type { createLowlight } from 'lowlight';

import {
  type BaseEditor,
  createBasePlugin,
  DebugPlugin,
  type InferConfig,
} from '@platejs/core';
import {
  ContentSlice,
  type DecoratedRange,
  editorCommands,
  type EditorTransactionChangeContext,
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
import { KEYS, NODES, type TCodeBlockElement } from '@platejs/utils';

import { ensureStablePythonGrammar } from './ensureStablePythonGrammar';

const CODE_LANGUAGE_CLASS_RE = /(?:^|\s)language-([^\s]+)/;
const NON_WHITESPACE = /\S/;
const NON_WHITESPACE_OR_END = /\S|$/;
const WHITESPACE = /\s/;

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

export const BaseCodeBlockPlugin = createBasePlugin({
  key: KEYS.codeBlock,
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
          node.type === editor.getType(KEYS.codeLine),
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
              tx.nodes.replace(
                codeBlock[0].children.flatMap((child) =>
                  ElementApi.isElement(child)
                    ? [
                        {
                          ...child,
                          type: context.editor.getType(KEYS.p),
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
    };
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
            { type: editor.getType(KEYS.p) },
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

      const codeLineType = editor.getType(KEYS.codeLine);

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
          type: editor.getType(KEYS.codeLine),
        })),
        { at: element }
      );
    };
    const tab = (reverse = false) => {
      const codeLines = tx.nodes.toArray<Element>({
        at: tx.selection() ?? undefined,
        match: { type: editor.getType(KEYS.codeLine) },
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
        defaultType = editor.getType(KEYS.p),
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
          tx.nodes.set({ type: editor.getType(KEYS.codeLine) });
          tx.nodes.wrap({
            children: [],
            type,
          });
        }
      },
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

export type CodeBlockConfig = InferConfig<typeof BaseCodeBlockPlugin>;

export const BaseCodeHighlightPlugin = createBasePlugin({
  key: KEYS.codeSyntax,
  dependencies: [BaseCodeBlockPlugin],
  initialState: {
    defaultLanguage: null as string | null,
    lowlight: null as ReturnType<typeof createLowlight> | null,
  },
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  type: NODES.codeSyntax,
}).extend(({ editor, store }) => {
  type CodeBlockDecoration = DecoratedRange & {
    className: string;
    [NODES.codeSyntax]: true;
  };
  type HighlightResult = ReturnType<
    ReturnType<typeof createLowlight>['highlight']
  >;
  type HighlightNode = HighlightResult['children'][number];

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
  const decorations = ([block, blockPath]: NodeEntry<Element>) => {
    const { defaultLanguage, lowlight } = store.get();
    const nodeToDecorations = new Map<Element, DecoratedRange[]>();

    if (!lowlight) return nodeToDecorations;

    const text = block.children.map((line) => NodeApi.string(line)).join('\n');
    const language = typeof block.lang === 'string' ? block.lang : undefined;
    const effectiveLanguage = language || defaultLanguage;

    ensureStablePythonGrammar(lowlight, effectiveLanguage);

    let highlighted: HighlightResult;

    try {
      if (!effectiveLanguage || effectiveLanguage === 'plaintext') {
        highlighted = { children: [], type: 'root' };
      } else if (effectiveLanguage === 'auto') {
        highlighted = lowlight.highlightAuto(text);
      } else {
        highlighted = lowlight.highlight(effectiveLanguage, text);
      }
    } catch (error) {
      if (
        effectiveLanguage &&
        lowlight.listLanguages().includes(effectiveLanguage)
      ) {
        editor
          .plugin(DebugPlugin)
          .api.warn(
            `Could not highlight with Highlight.js for language "${effectiveLanguage}". Falling back to plaintext`,
            'CODE_HIGHLIGHT',
            error
          );
      } else {
        editor
          .plugin(DebugPlugin)
          .api.warn(
            `Language "${effectiveLanguage}" is not registered. Falling back to plaintext`
          );
      }
      highlighted = { children: [], type: 'root' };
    }

    const normalizedTokens = normalizeTokens(parseNodes(highlighted.children));
    const lineCount = Math.min(normalizedTokens.length, block.children.length);

    for (let index = 0; index < lineCount; index++) {
      const element = block.children[index];

      if (!ElementApi.isElement(element)) continue;

      const values: DecoratedRange[] = [];
      let start = 0;

      nodeToDecorations.set(element, values);

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

    return nodeToDecorations;
  };

  const languageChange = (
    context: Pick<
      EditorTransactionChangeContext<BaseEditor>,
      'after' | 'before' | 'change' | 'changed'
    >
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
        const after = NodeApi.getIf(
          { children: afterChildren } as Element,
          path
        );
        const beforeLanguage =
          ElementApi.isElement(before) &&
          before.type === editor.getType(KEYS.codeBlock)
            ? before.lang
            : undefined;
        const afterLanguage =
          ElementApi.isElement(after) &&
          after.type === editor.getType(KEYS.codeBlock)
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
  const getLineDecorations = (line: Element) => lineDecorations.get(line) ?? [];
  const resetDecorations = (codeBlock: Element) => {
    codeBlock.children.forEach((line) => {
      if (ElementApi.isElement(line)) lineDecorations.delete(line);
    });
  };
  const setDecorations = (entry: NodeEntry<Element>) => {
    for (const [node, values] of decorations(entry)) {
      lineDecorations.set(node, values);
    }
  };

  return {
    decorate: ({ entry: [node, path] }) => {
      if (!store.get().lowlight) return [];

      const codeBlockType = editor.getType(KEYS.codeBlock);
      const codeLineType = editor.getType(KEYS.codeLine);

      if (
        ElementApi.isElement(node) &&
        node.type === codeBlockType &&
        ElementApi.isElement(node.children[0]) &&
        getLineDecorations(node.children[0]).length === 0
      ) {
        setDecorations([node, path]);
      }

      return ElementApi.isElement(node) && node.type === codeLineType
        ? getLineDecorations(node)
        : [];
    },
    extension: {
      corrections: [
        {
          event: 'content',
          correct({ entry }) {
            const [node] = entry;

            if (
              ElementApi.isElement(node) &&
              node.type === editor.getType(KEYS.codeBlock) &&
              store.get().lowlight
            ) {
              setDecorations([node, entry[1]]);
            }
          },
        },
      ],
      onTransactionChange(context) {
        const codeBlock =
          store.get().lowlight && languageChange(context)?.before;

        if (ElementApi.isElement(codeBlock)) {
          resetDecorations(codeBlock);
        }
      },
    },
  };
});

export type CodeHighlightConfig = InferConfig<typeof BaseCodeHighlightPlugin>;
