import {
  type BaseEditor,
  createBasePlugin,
  type InferConfig,
  nanoid,
} from '@platejs/core';
import {
  ContentSlice,
  type Descendant,
  type EditorCoreStateView,
  type EditorNodesOptions,
  type EditorUpdatePolicy,
  type Element,
  type EditorUpdateTag,
  ElementApi,
  type Location,
  type NodeSetNodesOptions,
  NodeApi,
  type Point,
  PointApi,
  PathApi,
  type Range,
  RangeApi,
  editorCommands,
  type Node,
  type NodeEntry,
  type PropertyJsonValue,
  property,
  schema,
  target,
  type Text,
  type TextUnit,
  TextApi,
} from '@platejs/plite';
import {
  KEYS,
  type TInlineSuggestionData,
  type TSuggestionElement,
  type TSuggestionText,
  type TUpdateSuggestionData,
} from '@platejs/utils';
import isEqual from 'lodash/isEqual.js';

import type { TResolvedSuggestion, TSuggestionDescription } from './types';

/** Tag applied when an update must bypass suggestion tracking. */
export const SUGGESTION_SKIP_TAG = 'skip-suggestion' as const;

/** Property used for transient suggestions without colliding with IDs. */
export const SUGGESTION_TRANSIENT_KEY = `${KEYS.suggestion}Transient`;

/** Semantic update policies owned by the Suggestion plugin. */
export const SuggestionUpdatePolicy = Object.freeze({
  skip: Object.freeze({
    tags: Object.freeze([SUGGESTION_SKIP_TAG] as const),
  }) satisfies EditorUpdatePolicy,
});

type BaseSuggestionPluginOptions = {
  currentUserId: string | null;
  isSuggesting: boolean;
};

type SuggestionStateView = Pick<
  EditorCoreStateView,
  'nodes' | 'points' | 'ranges' | 'schema'
>;

type BaseSuggestionApi = {
  dataList: (node: Text) => TInlineSuggestionData[];
  activeDescriptions: () => TSuggestionDescription[];
  createFragment: (
    fragment: readonly Descendant[],
    at: Location,
    state?: SuggestionStateView
  ) => Descendant[];
  findProps: (options: {
    at: Location;
    state?: SuggestionStateView;
    type: 'insert' | 'remove' | 'update';
  }) => { id: string; createdAt: number };
  getProps: (
    node: Descendant,
    options?: {
      id?: string;
      createdAt?: number;
      suggestionDeletion?: boolean;
      suggestionUpdate?: {
        newProperties?: Record<string, unknown>;
        properties?: Record<string, unknown>;
      };
      transient?: boolean;
    }
  ) => Record<string, unknown>;
  inlineData: (node: Element | Text) => TInlineSuggestionData | undefined;
  /** Whether suggestion middleware should track the current operation. */
  isTracking: (tags: readonly EditorUpdateTag[]) => boolean;
  isBlockSuggestion: (node: Node) => node is TSuggestionElement;
  isCurrentUser: (node: Element | Text) => boolean;
  key: (id?: string) => string;
  keyId: (node: Element | Text) => string | undefined;
  keys: (node: Node) => string[];
  node: (
    options?: EditorNodesOptions<Node> & { id?: string; isText?: boolean }
  ) => NodeEntry<TSuggestionElement | TSuggestionText> | undefined;
  nodeEntries: (
    suggestionId: string,
    options?: EditorNodesOptions<Node>
  ) => readonly NodeEntry<TSuggestionText>[];
  nodeId: (node: Node) => string | undefined;
  nodes: (
    options?: EditorNodesOptions<Node> & { transient?: boolean }
  ) => readonly NodeEntry<Element | TSuggestionText>[];
  suggestionData: (
    node: Node
  ) => TInlineSuggestionData | TSuggestionElement['suggestion'] | undefined;
  skipDeletes: (node: Node) => string;
  /** Run synchronous operations without recursively creating suggestions. */
  untracked: <T>(fn: () => T) => T;
  userId: (node: Node) => string | undefined;
  userIds: (node: Node) => string[];
};

type BaseSuggestionTx = {
  accept: (description: TResolvedSuggestion) => void;
  addMark: (key: string, value: unknown) => void;
  delete: (
    at: Range,
    options?: {
      moveSelection?: boolean;
      reverse?: boolean;
      unit?: TextUnit;
    }
  ) => string | undefined;
  deleteFragment: (options?: {
    moveSelection?: boolean;
    reverse?: boolean;
  }) => string | undefined;
  insertFragment: (
    fragment: readonly Descendant[],
    insertContent?: (fragment: readonly Descendant[]) => void
  ) => void;
  insertText: (text: string) => void;
  reject: (description: TResolvedSuggestion) => void;
  removeMark: (key: string, previousValue?: unknown) => void;
  removeNodes: (nodes: readonly NodeEntry<Element | Text>[]) => void;
  setNodes: (
    options?: {
      createdAt?: number;
      includeInlineElements?: boolean;
      suggestionId?: string;
    } & NodeSetNodesOptions<Node>
  ) => string | undefined;
};

const suggestionUntrackedDepth = new WeakMap<BaseEditor, number>();

const isJsonValue = (value: unknown): value is PropertyJsonValue => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return true;
  }
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value !== 'object') return false;

  return Object.values(value).every(isJsonValue);
};

const isJsonRecord = (
  value: unknown
): value is Readonly<Record<string, PropertyJsonValue>> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every(isJsonValue);

const hasSuggestionIdentity = (
  value: unknown
): value is Readonly<{
  createdAt: number;
  id: string;
  type: string;
  userId: string;
}> =>
  isJsonRecord(value) &&
  typeof value.createdAt === 'number' &&
  typeof value.id === 'string' &&
  typeof value.type === 'string' &&
  typeof value.userId === 'string';

const isInlineSuggestionData = (
  value: unknown
): value is TInlineSuggestionData => {
  if (!hasSuggestionIdentity(value)) return false;
  if (value.type === 'insert' || value.type === 'remove') return true;

  return (
    value.type === 'update' &&
    (!('newProperties' in value) || isJsonRecord(value.newProperties)) &&
    (!('properties' in value) || isJsonRecord(value.properties))
  );
};

const inlineSuggestionDataProperty = property.json({
  validate: isInlineSuggestionData,
  validationVersion: 1,
});

const BaseSuggestionPluginDefinition = createBasePlugin({
  key: KEYS.suggestion,
  schema: {
    mark: {
      property: property.boolean({ default: false, omitDefault: true }),
      split: 'preserve',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    },
    properties: [
      schema.elementProperty(
        KEYS.suggestion,
        property.json({
          validate: (value): value is TSuggestionElement['suggestion'] =>
            hasSuggestionIdentity(value) &&
            (value.type === 'insert' || value.type === 'remove') &&
            (!('isLineBreak' in value) ||
              typeof value.isLineBreak === 'boolean'),
          validationVersion: 1,
        }),
        {
          split: 'preserve',
          target: target.group('block'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      schema.elementProperty(
        KEYS.suggestion,
        property.boolean({ default: false, omitDefault: true }),
        {
          split: 'preserve',
          target: target.group('inline'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      schema.elementProperty(
        SUGGESTION_TRANSIENT_KEY,
        property.boolean({ default: false, omitDefault: true }),
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      schema.elementProperty('suggestionData', inlineSuggestionDataProperty, {
        split: 'preserve',
        target: target.group('inline'),
        typeChange: 'preserve-if-allowed',
      }),
      schema.elementProperty(
        schema.key.prefix(`${KEYS.suggestion}_`),
        inlineSuggestionDataProperty,
        {
          split: 'preserve',
          target: target.group('inline'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      schema.textProperty(
        SUGGESTION_TRANSIENT_KEY,
        property.boolean({ default: false, omitDefault: true }),
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      schema.textProperty('suggestionData', inlineSuggestionDataProperty, {
        split: 'preserve',
        target: target.group('element'),
        typeChange: 'preserve-if-allowed',
      }),
      schema.textProperty(
        schema.key.prefix(`${KEYS.suggestion}_`),
        inlineSuggestionDataProperty,
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    ],
  },
  rules: { selection: { affinity: 'outward' } },
  options: {
    currentUserId: 'alice',
    isSuggesting: false,
  } as BaseSuggestionPluginOptions,
  api: ({ editor, getOptions, type }) => {
    const key = (id = '0') => `${KEYS.suggestion}_${id}`;
    const keyId = (node: Element | Text) =>
      Object.keys(node)
        .filter((nodeKey) => nodeKey.startsWith(`${KEYS.suggestion}_`))
        .at(-1);
    const keys = (node: Node) =>
      Object.keys(node).filter((nodeKey) =>
        nodeKey.startsWith(`${KEYS.suggestion}_`)
      );
    const inlineData = (node: Element | Text) => {
      const nodeKey = keyId(node);

      if (!nodeKey) return;

      const value = node[nodeKey];

      return isInlineSuggestionData(value) ? value : undefined;
    };
    const dataList = (node: Text): TInlineSuggestionData[] =>
      Object.keys(node)
        .filter((nodeKey) => nodeKey.startsWith(`${KEYS.suggestion}_`))
        .map((nodeKey) => node[nodeKey])
        .filter(isInlineSuggestionData);
    const isBlockSuggestion = (node: Node): node is TSuggestionElement =>
      ElementApi.isElement(node) &&
      !editor.read.schema.isInline(node) &&
      'suggestion' in node;
    const isInlineSuggestion = (node: Node): node is Element | Text =>
      TextApi.isText(node) ||
      (ElementApi.isElement(node) && editor.read.schema.isInline(node));
    const nodeId = (node: Node) => {
      if (isInlineSuggestion(node)) {
        return keyId(node)?.replace(`${type}_`, '');
      }

      if (isBlockSuggestion(node)) return node.suggestion.id;
    };
    const suggestionData = (node: Node) => {
      if (isInlineSuggestion(node)) return inlineData(node);
      if (isBlockSuggestion(node)) return node.suggestion;
    };
    const skipDeletes = (node: Node): string => {
      if (
        TextApi.isText(node) ||
        (ElementApi.isElement(node) && editor.read.schema.isInline(node))
      ) {
        if (ElementApi.isElement(node)) return NodeApi.string(node);
        if (!node[KEYS.suggestion]) return node.text;
        if (suggestionData(node)?.type === 'remove') return '';

        return node.text;
      }
      if (!ElementApi.isElement(node) && !NodeApi.isEditor(node)) return '';

      return Array.from(NodeApi.children(node, []))
        .map(([child]) => skipDeletes(child))
        .join('');
    };
    const findNode = (
      options: EditorNodesOptions<Node> & {
        id?: string;
        isText?: boolean;
      } = {}
    ) => {
      const { id, isText, ...rest } = options;

      return editor.read.nodes.find<TSuggestionElement | TSuggestionText>({
        match: (node) => {
          if (!Reflect.get(node, type)) return false;
          if (isText && !TextApi.isText(node)) return false;
          if (!id) return true;
          if (TextApi.isText(node)) return Boolean(node[key(id)]);
          if (isBlockSuggestion(node)) return node.suggestion.id === id;

          return false;
        },
        ...rest,
      });
    };
    const findProps = ({
      at,
      state = editor.read,
      type: suggestionType,
    }: {
      at: Location;
      state?: SuggestionStateView;
      type: 'insert' | 'remove' | 'update';
    }) => {
      const fallback = { id: nanoid(), createdAt: Date.now() };
      const getTextEntry = (location: Location) =>
        state.nodes.find<TSuggestionText>({
          at: location,
          match: (node) =>
            TextApi.isText(node) && Boolean(Reflect.get(node, type)),
        });
      const getInlineEntry = (point: Point) =>
        state.nodes.above<Element>({
          at: point,
          match: (node) =>
            ElementApi.isElement(node) &&
            state.schema.isInline(node) &&
            Boolean(nodeId(node)),
        });

      let entry = getTextEntry(at) as NodeEntry<TSuggestionText> | undefined;
      let inlineEntry: NodeEntry<Element> | undefined;

      if (!entry) {
        const edges = state.ranges.edges(at);

        if (!edges) return fallback;

        const [start, end] = edges;
        const nextPoint = state.points.after(end);

        if (nextPoint) {
          entry = getTextEntry(nextPoint);
          if (!entry) inlineEntry = getInlineEntry(nextPoint);
        }

        if (!entry && !inlineEntry) {
          const previousPoint = state.points.before(start);

          if (previousPoint) {
            entry = getTextEntry(previousPoint);
            if (!entry) inlineEntry = getInlineEntry(previousPoint);
          }

          const block = state.nodes.block({ at: start });

          if (!entry && block && state.points.isStart(start, block[1])) {
            const lineBreak = state.nodes.above<TSuggestionElement>({
              at: previousPoint ?? start,
            });
            const lineBreakData = lineBreak?.[0].suggestion;

            if (lineBreakData?.isLineBreak) {
              return {
                id: lineBreakData.id ?? nanoid(),
                createdAt: lineBreakData.createdAt ?? Date.now(),
              };
            }
          }
        }
      }

      if (
        entry &&
        inlineData(entry[0])?.type === suggestionType &&
        inlineData(entry[0])?.userId === getOptions().currentUserId
      ) {
        return {
          id: nodeId(entry[0]) ?? nanoid(),
          createdAt: inlineData(entry[0])?.createdAt ?? Date.now(),
        };
      }

      const inlineSuggestion = inlineEntry && suggestionData(inlineEntry[0]);

      if (
        inlineEntry &&
        inlineSuggestion?.type === suggestionType &&
        inlineSuggestion.userId === getOptions().currentUserId
      ) {
        return {
          id: nodeId(inlineEntry[0]) ?? nanoid(),
          createdAt: inlineSuggestion.createdAt ?? Date.now(),
        };
      }

      return fallback;
    };
    return {
      activeDescriptions: () => {
        const entry = findNode({ isText: true });

        if (!entry) return [];

        const suggestionId = nodeId(entry[0]);

        if (!suggestionId) return [];

        return dataList(entry[0] as TSuggestionText).map(
          ({ id, userId }): TSuggestionDescription => {
            const suggestionKey = key(id);
            const nodes = editor.read.nodes
              .toArray<TSuggestionText>({
                at: [],
                match: (node) => Boolean(Reflect.get(node, suggestionKey)),
              })
              .map(([node]) => node);
            const insertions = nodes.filter((node) => {
              const suggestion = node[suggestionKey];

              return (
                isInlineSuggestionData(suggestion) &&
                suggestion.type === 'insert'
              );
            });
            const deletions = nodes.filter((node) => {
              const suggestion = node[suggestionKey];

              return (
                isInlineSuggestionData(suggestion) &&
                suggestion.type === 'remove'
              );
            });
            const insertedText = insertions.map((node) => node.text).join('');
            const deletedText = deletions.map((node) => node.text).join('');

            if (insertions.length > 0 && deletions.length > 0) {
              return {
                deletedText,
                insertedText,
                suggestionId: id,
                type: 'replacement',
                userId,
              };
            }
            if (deletions.length > 0) {
              return {
                deletedText,
                suggestionId: id,
                type: 'deletion',
                userId,
              };
            }

            return {
              insertedText,
              suggestionId: id,
              type: 'insertion',
              userId,
            };
          }
        );
      },
      createFragment: (fragment, at, state = editor.read) => {
        const { id, createdAt } = findProps({
          at,
          state,
          type: 'insert',
        });

        return fragment.map((source) => {
          if (TextApi.isText(source)) {
            const node: { [key: string]: unknown; text: string } = {
              ...source,
            };

            node[KEYS.suggestion] = true;
            keys(node).forEach((nodeKey) => {
              delete node[nodeKey];
            });
            node[key(id)] = {
              id,
              createdAt,
              type: 'insert',
              userId: getOptions().currentUserId!,
            };

            return node;
          }

          return {
            ...source,
            [KEYS.suggestion]: {
              id,
              createdAt,
              type: 'insert',
              userId: getOptions().currentUserId!,
            },
          };
        });
      },
      dataList,
      findProps,
      getProps: (
        node,
        {
          id = nanoid(),
          createdAt = Date.now(),
          suggestionDeletion,
          suggestionUpdate,
          transient,
        } = {}
      ) => {
        const suggestion = {
          id,
          createdAt,
          type: suggestionDeletion
            ? 'remove'
            : suggestionUpdate
              ? 'update'
              : 'insert',
          userId: getOptions().currentUserId!,
          ...suggestionUpdate,
        };

        if (ElementApi.isElement(node) && !editor.read.schema.isInline(node)) {
          return { [KEYS.suggestion]: suggestion };
        }

        return {
          [key(id)]: suggestion,
          [KEYS.suggestion]: true,
          ...(transient ? { [SUGGESTION_TRANSIENT_KEY]: true } : {}),
        };
      },
      inlineData,
      isBlockSuggestion,
      isCurrentUser: (node) =>
        inlineData(node)?.userId === getOptions().currentUserId,
      isTracking: (tags) =>
        (suggestionUntrackedDepth.get(editor) ?? 0) === 0 &&
        !tags.includes(SUGGESTION_SKIP_TAG),
      key,
      keyId,
      keys,
      node: findNode,
      nodeEntries: (suggestionId, { at = [], ...options } = {}) =>
        editor.read.nodes.toArray<TSuggestionText>({
          at,
          ...options,
          match: (node, path) =>
            Boolean(Reflect.get(node, key(suggestionId))) &&
            (!options.match || NodeApi.matches(node, options.match, path)),
        }),
      nodeId,
      nodes: ({ transient, ...options } = {}) =>
        editor.read.nodes.toArray<Element | TSuggestionText>({
          ...options,
          at: options.at ?? [],
          mode: 'all',
          match: (node) =>
            Boolean(Reflect.get(node, type)) &&
            (!transient ||
              Boolean(Reflect.get(node, SUGGESTION_TRANSIENT_KEY))),
        }),
      skipDeletes,
      suggestionData,
      untracked: (fn) => {
        const depth = suggestionUntrackedDepth.get(editor) ?? 0;
        suggestionUntrackedDepth.set(editor, depth + 1);

        try {
          return fn();
        } finally {
          if (depth === 0) {
            suggestionUntrackedDepth.delete(editor);
          } else {
            suggestionUntrackedDepth.set(editor, depth);
          }
        }
      },
      userId: (node) =>
        keys(node)
          .map((nodeKey) => Reflect.get(node, nodeKey)?.userId)
          .find((id): id is string => typeof id === 'string'),
      userIds: (node) =>
        keys(node)
          .map((nodeKey) => Reflect.get(node, nodeKey)?.userId)
          .filter((id): id is string => typeof id === 'string'),
    } satisfies BaseSuggestionApi;
  },
});

export const BaseSuggestionPlugin = BaseSuggestionPluginDefinition.extend<{
  update: BaseSuggestionTx;
}>((context) => ({
  update: ({ tx }) => {
    const { api, getOptions } = context;
    const setNodes: BaseSuggestionTx['setNodes'] = (options) => {
      const {
        createdAt = Date.now(),
        includeInlineElements = true,
        suggestionId = nanoid(),
        ...nodeOptions
      } = options ?? {};
      const at = (nodeOptions.at ?? tx.selection()) as Location | null;

      if (!at) return;

      const queryAt = RangeApi.isRange(at)
        ? { anchor: RangeApi.start(at), focus: RangeApi.end(at) }
        : at;
      const inlineEntries = includeInlineElements
        ? tx.nodes.toArray({
            ...nodeOptions,
            at: queryAt,
            match: (node) =>
              ElementApi.isElement(node) && tx.schema.isInline(node),
          })
        : [];
      const suggestion: TInlineSuggestionData = {
        id: suggestionId,
        createdAt,
        type: 'remove',
        userId: getOptions().currentUserId!,
      };
      const props = {
        [api.key(suggestionId)]: suggestion,
        [KEYS.suggestion]: true,
      };
      const matchTextOutsideInline: NodeSetNodesOptions<Node>['match'] = (
        node,
        path
      ) => {
        if (
          nodeOptions.match &&
          !NodeApi.matches(node, nodeOptions.match, path)
        ) {
          return false;
        }
        if (!includeInlineElements || !TextApi.isText(node)) return true;

        const parent = tx.nodes.parent(path);

        return !parent || !tx.schema.isInline(parent[0]);
      };

      inlineEntries.forEach(([, path]) => {
        tx.nodes.set<TSuggestionText>(props, {
          ...nodeOptions,
          at: path,
          match: (node) =>
            ElementApi.isElement(node) && tx.schema.isInline(node),
        });
      });

      tx.nodes.set(props, {
        ...nodeOptions,
        at: queryAt,
        marks: true,
        match: matchTextOutsideInline,
      });

      return suggestionId;
    };
    const deleteRange: BaseSuggestionTx['delete'] = (
      at,
      { moveSelection = true, reverse, unit = 'character' } = {}
    ) => {
      const getInlineEntryAt = (point: Point) =>
        tx.nodes.above<Element>({
          at: point,
          match: (node) =>
            ElementApi.isElement(node) && tx.schema.isInline(node),
        });
      const getAdjacentInlineVoidEntry = (
        point: Point,
        { reverse }: { reverse?: boolean }
      ) => {
        const index = point.path.at(-1);

        if (index === undefined || (reverse && index === 0)) return;

        const adjacentPath = reverse
          ? PathApi.previous(point.path)
          : PathApi.next(point.path);
        const entry = tx.nodes.get<Element>(adjacentPath);

        if (
          entry &&
          ElementApi.isElement(entry[0]) &&
          tx.schema.isInline(entry[0]) &&
          tx.schema.isVoid(entry[0])
        ) {
          return entry;
        }
      };
      const isBoundaryPoint = (
        point: Point,
        { reverse }: { reverse?: boolean }
      ) => {
        const range = tx.ranges.get(point.path);

        if (!range) return false;

        return reverse
          ? tx.points.isStart(point, range)
          : tx.points.isEnd(point, range);
      };
      const isEmptyCurrentUserInsertBlock = (entry: NodeEntry<Element>) => {
        const [node, path] = entry;

        if (tx.text.string(path).length > 0) return false;

        return node.children.some(
          (child) =>
            TextApi.isText(child) &&
            Boolean(child[KEYS.suggestion]) &&
            api.inlineData(child)?.type === 'insert' &&
            api.isCurrentUser(child)
        );
      };
      const { anchor: from, focus: to } = at;
      const { id, createdAt } = api.findProps({
        at: from,
        state: tx,
        type: 'remove',
      });
      const toRef = tx.refs.point(to, {
        association: 'forward',
        deletion: 'nearest',
      });

      while (true) {
        const pointCurrent = tx.selection()?.anchor;

        if (!pointCurrent) break;

        const pointTarget = toRef.resolve();

        if (!pointTarget || PointApi.equals(pointCurrent, pointTarget)) break;

        if (
          !tx.selection.isAcrossBlocks({
            at: { anchor: pointCurrent, focus: pointTarget },
          })
        ) {
          const inlineRange = reverse
            ? { anchor: pointTarget, focus: pointCurrent }
            : { anchor: pointCurrent, focus: pointTarget };
          const text = tx.text.string(inlineRange);
          const hasInlineNode = tx.nodes.some({
            at: inlineRange,
            match: (node) =>
              ElementApi.isElement(node) && tx.schema.isInline(node),
          });

          if (text.length === 0 && !hasInlineNode) break;
        }

        const pointNext =
          unit === 'character'
            ? reverse
              ? tx.points.before(pointCurrent, { unit: 'character' })
              : tx.points.after(pointCurrent, { unit: 'character' })
            : pointTarget;

        if (!pointNext || PointApi.equals(pointNext, pointCurrent)) break;

        let range: Range = reverse
          ? { anchor: pointNext, focus: pointCurrent }
          : { anchor: pointCurrent, focus: pointNext };

        if (unit === 'character') {
          range = tx.ranges.unhang(range, { character: true });
        }

        const inlineEntryAtNext = getInlineEntryAt(pointNext);
        const inlineEntryAtCurrent = inlineEntryAtNext
          ? undefined
          : getInlineEntryAt(pointCurrent);
        const adjacentInlineEntry =
          inlineEntryAtNext ||
          inlineEntryAtCurrent ||
          !isBoundaryPoint(pointCurrent, { reverse })
            ? undefined
            : getAdjacentInlineVoidEntry(pointCurrent, { reverse });
        const inlineEntry =
          inlineEntryAtNext ??
          (inlineEntryAtCurrent &&
          !tx.schema.isSelectable(inlineEntryAtCurrent[0])
            ? inlineEntryAtCurrent
            : undefined) ??
          (adjacentInlineEntry &&
          !tx.schema.isSelectable(adjacentInlineEntry[0])
            ? adjacentInlineEntry
            : undefined);
        const pointCurrentInsideInline =
          inlineEntry && PathApi.isAncestor(inlineEntry[1], pointCurrent.path);

        if (
          inlineEntry &&
          tx.schema.isVoid(inlineEntry[0]) &&
          (!inlineEntryAtNext || !pointCurrentInsideInline)
        ) {
          tx.nodes.set(
            {
              [api.key(id)]: {
                id,
                createdAt,
                type: 'remove',
                userId: getOptions().currentUserId!,
              },
              [KEYS.suggestion]: true,
            },
            { at: inlineEntry[1] }
          );

          const beforeInline = tx.points.before(inlineEntry[1]);
          const targetInsideInline =
            PathApi.equals(inlineEntry[1], pointTarget.path) ||
            PathApi.isAncestor(inlineEntry[1], pointTarget.path);

          if (reverse) {
            if (beforeInline) {
              tx.selection.set(beforeInline);

              if (
                !targetInsideInline &&
                !PointApi.equals(beforeInline, pointTarget)
              ) {
                continue;
              }
            }

            break;
          }

          const afterInline = tx.points.after(inlineEntry[1]);

          if (afterInline) {
            tx.selection.set(afterInline);
            if (!PointApi.equals(afterInline, pointTarget)) continue;
          } else if (beforeInline) {
            tx.selection.set(beforeInline);
          }

          break;
        }

        const block = tx.nodes.block({ at: pointCurrent });

        if (
          block &&
          tx.points.isStart(pointCurrent, block[1]) &&
          isEmptyCurrentUserInsertBlock(block)
        ) {
          tx.nodes.remove({ at: block[1] });
          continue;
        }

        if (tx.selection.isAcrossBlocks({ at: range })) {
          const previousBlock = tx.nodes.above({ at: range.anchor });

          if (previousBlock && ElementApi.isElement(previousBlock[0])) {
            if (api.isBlockSuggestion(previousBlock[0])) {
              if (previousBlock[0].suggestion.type === 'insert') {
                tx.nodes.unset([KEYS.suggestion], {
                  at: previousBlock[1],
                });
                tx.nodes.merge({ at: PathApi.next(previousBlock[1]) });
              }
              if (previousBlock[0].suggestion.type === 'remove') {
                tx.selection.move({ reverse, unit: 'character' });
              }
              break;
            }

            const isVoid =
              tx.schema.isVoid(previousBlock[0]) &&
              !tx.schema.isInline(previousBlock[0]);

            tx.nodes.set(
              {
                [KEYS.suggestion]: {
                  id,
                  createdAt,
                  type: 'remove',
                  userId: getOptions().currentUserId!,
                  ...(isVoid ? {} : { isLineBreak: true }),
                },
              },
              { at: previousBlock[1] }
            );
            tx.selection.move({ reverse, unit: 'character' });
            break;
          }

          break;
        }

        if (PointApi.equals(pointCurrent, tx.selection()!.anchor)) {
          if (unit === 'character') {
            tx.selection.move({ reverse, unit: 'character' });
          } else if (moveSelection) {
            tx.selection.set(pointNext);
          }
        }

        const insertedText = tx.nodes.find({
          at: range,
          match: (node) =>
            TextApi.isText(node) &&
            api.inlineData(node)?.type === 'insert' &&
            api.isCurrentUser(node),
        });

        if (insertedText) {
          tx.text.delete({ at: range, unit: 'character' });
          continue;
        }

        setNodes({
          at: range,
          createdAt,
          includeInlineElements: unit !== 'character',
          suggestionId: id,
        });

        if (unit !== 'character') break;
      }

      return id;
    };
    const deleteFragment: BaseSuggestionTx['deleteFragment'] = ({
      moveSelection = false,
      reverse,
    } = {}) => {
      const selection = tx.selection();

      if (!selection) return;

      const edges = tx.ranges.edges(selection);

      if (!edges) return;

      const [start, end] = edges;

      if (reverse) {
        tx.selection.collapse({ edge: 'end' });

        return deleteRange(
          { anchor: end, focus: start },
          { reverse: true, unit: 'block' }
        );
      }

      tx.selection.collapse({ edge: 'start' });

      return deleteRange(
        { anchor: start, focus: end },
        { moveSelection, unit: 'block' }
      );
    };
    return {
      accept: (description) => {
        tx.tags.add(SUGGESTION_SKIP_TAG);

        const mergeNodes = tx.nodes.toArray({
          at: [],
          match: (node) =>
            ElementApi.isElement(node) &&
            api.isBlockSuggestion(node) &&
            node.suggestion.type === 'remove' &&
            Boolean(node.suggestion.isLineBreak) &&
            node.suggestion.id === description.suggestionId,
        });

        mergeNodes.toReversed().forEach(([, path]) => {
          tx.nodes.merge({ at: PathApi.next(path) });
        });

        tx.nodes.unset(
          [description.keyId, KEYS.suggestion, SUGGESTION_TRANSIENT_KEY],
          {
            at: [],
            mode: 'all',
            match: (node) => {
              if (
                TextApi.isText(node) ||
                (ElementApi.isElement(node) && tx.schema.isInline(node))
              ) {
                const suggestions = api.dataList(node as TSuggestionText);

                if (suggestions.some((data) => data.type === 'update')) {
                  return suggestions.some(
                    (data) => data.id === description.suggestionId
                  );
                }

                const suggestion = api.inlineData(node);

                return Boolean(
                  suggestion?.type === 'insert' &&
                    suggestion.id === description.suggestionId
                );
              }
              if (ElementApi.isElement(node) && api.isBlockSuggestion(node)) {
                return node.suggestion.isLineBreak
                  ? node.suggestion.id === description.suggestionId
                  : node.suggestion.type === 'insert' &&
                      node.suggestion.id === description.suggestionId;
              }

              return false;
            },
          }
        );

        const emptyInlineEntries = tx.nodes.toArray({
          at: [],
          match: (node) =>
            ElementApi.isElement(node) &&
            tx.schema.isInline(node) &&
            Array.from(NodeApi.texts(node)).every(([text]) => {
              const suggestion = api.inlineData(text);

              return (
                suggestion?.type === 'remove' &&
                suggestion.id === description.suggestionId
              );
            }),
        });

        emptyInlineEntries.toReversed().forEach(([, path]) => {
          tx.nodes.remove({ at: path });
        });

        tx.nodes.remove({
          at: [],
          mode: 'all',
          match: (node) => {
            if (
              TextApi.isText(node) ||
              (ElementApi.isElement(node) && tx.schema.isInline(node))
            ) {
              const suggestion = api.inlineData(node);

              return Boolean(
                suggestion?.type === 'remove' &&
                  suggestion.id === description.suggestionId
              );
            }
            if (ElementApi.isElement(node) && api.isBlockSuggestion(node)) {
              return (
                node.suggestion.type === 'remove' &&
                node.suggestion.id === description.suggestionId &&
                !node.suggestion.isLineBreak
              );
            }

            return false;
          },
        });
      },
      addMark: (mark, value) => {
        const id = nanoid();
        const createdAt = Date.now();
        const match = (node: Node) => {
          if (!TextApi.isText(node)) return false;
          if (!node[KEYS.suggestion]) return true;

          return api.inlineData(node)?.type === 'update';
        };

        tx.nodes.set(
          {
            [mark]: value,
            [api.key(id)]: {
              id,
              createdAt,
              newProperties: { [mark]: value },
              type: 'update',
              userId: getOptions().currentUserId,
            },
            [KEYS.suggestion]: true,
          },
          { match, split: true }
        );
      },
      delete: deleteRange,
      deleteFragment,
      insertFragment: (
        fragment,
        insertContent = (content) => tx.fragment.replace(content)
      ) => {
        deleteFragment();

        const selection = tx.selection();

        if (!selection) return;

        insertContent(api.createFragment(fragment, selection, tx));
      },
      insertText: (text) => {
        const selection = tx.selection();

        if (!selection) return;

        const { id, createdAt } = api.findProps({
          at: selection,
          state: tx,
          type: 'insert',
        });
        const deletedId = tx.selection.isExpanded()
          ? deleteFragment({ moveSelection: true })
          : undefined;
        const suggestionId = deletedId ?? id;

        tx.nodes.insert<TSuggestionText>(
          {
            [api.key(suggestionId)]: {
              id: suggestionId,
              createdAt,
              type: 'insert',
              userId: getOptions().currentUserId!,
            },
            suggestion: true,
            text,
          },
          { at: tx.selection() ?? selection, select: true }
        );
      },
      reject: (description) => {
        tx.tags.add(SUGGESTION_SKIP_TAG);

        const inlineInsertElements = tx.nodes.toArray({
          at: [],
          match: (node) => {
            if (!ElementApi.isElement(node) || !tx.schema.isInline(node)) {
              return false;
            }

            const suggestion = api.inlineData(node);

            return Boolean(
              suggestion?.type === 'insert' &&
                suggestion.id === description.suggestionId
            );
          },
        });
        const mergeNodes = tx.nodes.toArray({
          at: [],
          match: (node) =>
            ElementApi.isElement(node) &&
            api.isBlockSuggestion(node) &&
            node.suggestion.type === 'insert' &&
            Boolean(node.suggestion.isLineBreak) &&
            node.suggestion.id === description.suggestionId,
        });

        mergeNodes.toReversed().forEach(([, path]) => {
          tx.nodes.merge({ at: PathApi.next(path) });
        });

        tx.nodes.unset(
          [description.keyId, KEYS.suggestion, SUGGESTION_TRANSIENT_KEY],
          {
            at: [],
            mode: 'all',
            match: (node) => {
              if (
                TextApi.isText(node) ||
                (ElementApi.isElement(node) && tx.schema.isInline(node))
              ) {
                const suggestion = api.inlineData(node);

                return Boolean(
                  suggestion?.type === 'remove' &&
                    suggestion.id === description.suggestionId
                );
              }
              if (ElementApi.isElement(node) && api.isBlockSuggestion(node)) {
                return node.suggestion.isLineBreak
                  ? node.suggestion.id === description.suggestionId
                  : node.suggestion.type === 'remove' &&
                      node.suggestion.id === description.suggestionId;
              }

              return false;
            },
          }
        );

        tx.nodes.remove({
          at: [],
          mode: 'all',
          match: (node) => {
            if (TextApi.isText(node)) {
              const suggestion = api.inlineData(node);

              return Boolean(
                suggestion?.type === 'insert' &&
                  suggestion.id === description.suggestionId
              );
            }
            if (ElementApi.isElement(node) && api.isBlockSuggestion(node)) {
              return (
                node.suggestion.type === 'insert' &&
                node.suggestion.id === description.suggestionId &&
                !node.suggestion.isLineBreak
              );
            }

            return false;
          },
        });

        inlineInsertElements.toReversed().forEach(([, path]) => {
          tx.nodes.remove({ at: path });
        });

        tx.nodes
          .toArray<Text>({
            at: [],
            match: (node) =>
              TextApi.isText(node) &&
              api
                .dataList(node)
                .some(
                  (data) =>
                    data.type === 'update' &&
                    data.id === description.suggestionId
                ),
          })
          .forEach(([node, path]) => {
            const suggestion = api
              .dataList(node)
              .find(
                (data): data is TUpdateSuggestionData =>
                  data.type === 'update' && data.id === description.suggestionId
              );

            if (!suggestion) return;

            const previousProperties = suggestion.properties ?? {};
            const newProperties = suggestion.newProperties ?? {};
            const unset = Object.keys(newProperties).filter(
              (propertyKey) => !Object.hasOwn(previousProperties, propertyKey)
            );

            if (unset.length > 0) tx.nodes.unset(unset, { at: path });
            if (Object.keys(previousProperties).length > 0) {
              tx.nodes.set(previousProperties, { at: path });
            }
            tx.nodes.unset([api.key(suggestion.id)], { at: path });
          });
      },
      removeMark: (mark, previousValue = true) => {
        const id = nanoid();
        const createdAt = Date.now();
        const match = (node: Node) => {
          if (!TextApi.isText(node)) return false;
          if (!node[KEYS.suggestion]) return true;

          return api.inlineData(node)?.type === 'update';
        };

        tx.nodes.unset(mark, { match });
        tx.nodes.set(
          {
            [api.key(id)]: {
              id,
              createdAt,
              properties: { [mark]: previousValue },
              type: 'update',
              userId: getOptions().currentUserId,
            },
            [KEYS.suggestion]: true,
          },
          { match }
        );
      },
      removeNodes: (nodes) => {
        if (nodes.length === 0) return;

        const selection = tx.selection();

        if (!selection) return;

        const { id, createdAt } = api.findProps({
          at: selection,
          state: tx,
          type: 'remove',
        });

        nodes.forEach(([, path]) => {
          tx.nodes.set(
            {
              [KEYS.suggestion]: {
                id,
                createdAt,
                type: 'remove',
                userId: getOptions().currentUserId!,
              },
            },
            { at: path }
          );
        });
      },
      setNodes,
    };
  },
})).extend((context) => ({
  extension: {
    commands: ({ around, handle }) => {
      const { editor, getOptions } = context;

      return [
        handle(editorCommands.addMark, ({ input, state, tags }) => {
          if (
            !getOptions().isSuggesting ||
            !context.api.isTracking(tags) ||
            !state.selection.isExpanded()
          ) {
            return false;
          }

          return state.transaction((tx) => {
            tx.suggestion.addMark(input.key, input.value);
          });
        }),
        handle(editorCommands.removeMark, ({ input, state, tags }) => {
          if (
            !getOptions().isSuggesting ||
            !context.api.isTracking(tags) ||
            !state.selection.isExpanded()
          ) {
            return false;
          }

          const previousValue = state.marks()?.[input.key] ?? true;

          return state.transaction((tx) => {
            tx.suggestion.removeMark(input.key, previousValue);
          });
        }),
        handle(editorCommands.toggleMark, ({ input, state, tags }) => {
          if (
            !getOptions().isSuggesting ||
            !context.api.isTracking(tags) ||
            !state.selection.isExpanded()
          ) {
            return false;
          }

          const currentValue = state.marks()?.[input.key];
          const isActive =
            currentValue !== undefined && isEqual(currentValue, input.value);

          return state.transaction((tx) => {
            if (isActive) {
              tx.suggestion.removeMark(input.key, currentValue);
              return;
            }

            const clear = input.options?.clear;

            for (const key of clear
              ? Array.isArray(clear)
                ? clear
                : [clear]
              : []) {
              tx.suggestion.removeMark(key, state.marks()?.[key] ?? true);
            }
            tx.suggestion.addMark(input.key, input.value);
          });
        }),
        around(editorCommands.insertNodes, ({ input, tags, next }) => {
          if (!getOptions().isSuggesting || !context.api.isTracking(tags)) {
            return next();
          }

          const nodes = Array.isArray(input.nodes)
            ? input.nodes
            : [input.nodes];

          if (
            nodes.some(
              (node) =>
                ElementApi.isElement(node) && node.type === 'slash_input'
            )
          ) {
            return next();
          }

          const suggestionNodes = nodes.map((node) => ({
            ...node,
            [KEYS.suggestion]: {
              id: nanoid(),
              createdAt: Date.now(),
              type: 'insert',
              userId: getOptions().currentUserId!,
            },
          }));

          return next({ ...input, nodes: suggestionNodes });
        }),
        handle(editorCommands.removeNodes, ({ input, state, tags }) => {
          if (!getOptions().isSuggesting || !context.api.isTracking(tags)) {
            return false;
          }

          const nodes = state.nodes.toArray<Element | Text>(input.options);

          if (
            nodes.some(
              ([node]) =>
                ElementApi.isElement(node) && node.type === 'slash_input'
            )
          ) {
            return false;
          }

          return state.transaction((tx) => {
            tx.suggestion.removeNodes(nodes);
          });
        }),
        around(editorCommands.replaceSlice, ({ input, state, tags, next }) => {
          if (!getOptions().isSuggesting || !context.api.isTracking(tags)) {
            return next();
          }

          const selection =
            input.options?.at === undefined
              ? state.selection()
              : state.ranges.get(input.options.at);

          if (!selection) return next();

          if (!RangeApi.isExpanded(selection)) {
            return next({
              ...input,
              slice: ContentSlice.withContent(
                input.slice,
                context.api.createFragment(
                  input.slice.content,
                  selection,
                  state
                ),
                { open: 'preserve' }
              ),
            });
          }

          return state.transaction((tx) => {
            if (input.options?.at !== undefined) {
              tx.selection.set(selection);
            }

            tx.suggestion.insertFragment(input.slice.content, (content) =>
              tx.slice.replace(
                ContentSlice.withContent(input.slice, content, {
                  open: 'preserve',
                }),
                input.options
              )
            );
          });
        }),
        around(editorCommands.delete, ({ input, state, tags, next }) => {
          const selection = state.selection();

          if (!selection) return next();

          const reverse = input.direction === 'backward';
          const pointTarget = reverse
            ? state.points.before(selection, { unit: input.unit })
            : state.points.after(selection, { unit: input.unit });

          if (getOptions().isSuggesting && context.api.isTracking(tags)) {
            if (reverse) {
              const node = state.nodes.above<TSuggestionElement>();

              if (
                node?.[0][KEYS.suggestion] &&
                !node[0].suggestion.isLineBreak
              ) {
                return next();
              }
            }

            if (!pointTarget) return state.transaction(() => {});

            return state.transaction((tx) => {
              tx.suggestion.delete(
                { anchor: selection.anchor, focus: pointTarget },
                { reverse, unit: input.unit }
              );
            });
          }

          if (
            reverse &&
            pointTarget &&
            state.selection.isAcrossBlocks({
              at: { anchor: selection.anchor, focus: pointTarget },
            })
          ) {
            const prefix = state.transaction((tx) => {
              tx.nodes.unset([KEYS.suggestion], { at: pointTarget });
            });

            return next.after(prefix);
          }

          return next();
        }),
        handle(editorCommands.deleteFragment, ({ input, state, tags }) => {
          if (!getOptions().isSuggesting || !context.api.isTracking(tags)) {
            return false;
          }

          const selection =
            input.at === undefined
              ? state.selection()
              : state.ranges.get(input.at);

          if (!selection) return false;

          return state.transaction((tx) => {
            if (input.at !== undefined) tx.selection.set(selection);

            tx.suggestion.deleteFragment({
              reverse: input.direction === 'backward',
            });
          });
        }),
        around(editorCommands.insertBreak, ({ state, tags, next }) => {
          if (!getOptions().isSuggesting || !context.api.isTracking(tags)) {
            return false;
          }

          const selection = state.selection();
          const above = state.nodes.above<Element>();

          if (!selection || !above) return state.transaction(() => {});

          const [node, path] = above;

          if (path.length > 1 || node.type !== editor.getType(KEYS.p)) {
            return state.transaction((tx) => {
              tx.suggestion.insertText('\n');
            });
          }

          const { id, createdAt } = context.api.findProps({
            at: selection,
            state,
            type: 'insert',
          });
          const inserted = next();

          if (inserted === false) return false;

          return state.transaction.extend(inserted, (tx) => {
            tx.tags.add('history-merge');
            tx.nodes.set(
              {
                [KEYS.suggestion]: {
                  id,
                  createdAt,
                  isLineBreak: true,
                  type: 'insert',
                  userId: getOptions().currentUserId!,
                },
              },
              { at: path }
            );
          });
        }),
        handle(editorCommands.insertText, ({ input, state, tags }) => {
          if (!getOptions().isSuggesting || !context.api.isTracking(tags)) {
            return false;
          }

          const node = state.nodes.above<TSuggestionElement>();

          if (node?.[0][KEYS.suggestion] && !node[0].suggestion.isLineBreak) {
            return false;
          }

          return state.transaction((tx) => {
            tx.suggestion.insertText(input.text);
          });
        }),
      ];
    },
    corrections: [
      {
        event: 'properties',
        correct({ entry, tx }) {
          const [node, path] = entry;
          const hasSuggestion = !!(node as Record<string, unknown>)[
            KEYS.suggestion
          ];
          const inlineSuggestion =
            (ElementApi.isElement(node) && tx.schema.isInline(node)) ||
            TextApi.isText(node);

          if (
            hasSuggestion &&
            inlineSuggestion &&
            !context.api.keyId(node as Element)
          ) {
            context.api.untracked(() => {
              tx.nodes.unset([KEYS.suggestion, 'suggestionData'], {
                at: path,
              });
            });

            return;
          }

          if (
            hasSuggestion &&
            inlineSuggestion &&
            !context.api.inlineData(node as Element)?.userId
          ) {
            if (context.api.inlineData(node as Element)?.type === 'remove') {
              context.api.untracked(() => {
                tx.nodes.unset(
                  [KEYS.suggestion, context.api.keyId(node as Element)!],
                  {
                    at: path,
                  }
                );
              });
            } else {
              context.api.untracked(() => {
                tx.nodes.remove({ at: path });
              });
            }

            return;
          }
        },
      },
    ],
  },
}));

export type BaseSuggestionConfig = InferConfig<typeof BaseSuggestionPlugin>;
