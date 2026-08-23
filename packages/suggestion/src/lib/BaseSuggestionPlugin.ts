import {
  type BaseEditor,
  defineBasePlugin,
  type DefinitionOf,
  type ElementWith,
  nanoid,
  type TextWith,
} from '@platejs/core';
import { type ComputeDiffOptions, computeDiff } from '@platejs/diff';
import {
  ContentSlice,
  type Descendant,
  type EditorNodesOptions,
  type EditorNodeUnsetOptions,
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
import { PLUGINS } from '@platejs/utils';
import isEqual from 'lodash/isEqual.js';

/** Tag applied when an update must bypass suggestion tracking. */
export const SUGGESTION_SKIP_TAG = 'skip-suggestion' as const;

/** Property used for transient suggestions without colliding with IDs. */
export const SUGGESTION_TRANSIENT_KEY = 'suggestionTransient';

/** Semantic update policies owned by the Suggestion plugin. */
export const SuggestionUpdatePolicy = Object.freeze({
  skip: Object.freeze({
    tags: Object.freeze([SUGGESTION_SKIP_TAG] as const),
  }) satisfies EditorUpdatePolicy,
});

export type BaseSuggestionPluginState = {
  currentUserId: string | null;
  isSuggesting: boolean;
};

export type SuggestionData = {
  id: string;
  createdAt: number;
  type: 'insert' | 'remove';
  userId: string;
  isLineBreak?: boolean;
};

export type InsertSuggestionData = {
  id: string;
  createdAt: number;
  type: 'insert';
  userId: string;
};

export type RemoveSuggestionData = {
  id: string;
  createdAt: number;
  type: 'remove';
  userId: string;
};

export type UpdateSuggestionData = {
  id: string;
  createdAt: number;
  type: 'update';
  userId: string;
  newProperties?: Readonly<Record<string, PropertyJsonValue>>;
  properties?: Readonly<Record<string, PropertyJsonValue>>;
};

export type InlineSuggestionData =
  | InsertSuggestionData
  | RemoveSuggestionData
  | UpdateSuggestionData;

export type ResolvedSuggestion = {
  createdAt: Date;
  keyId: string;
  suggestionId: string;
  type: 'insert' | 'remove' | 'replace' | 'update';
  userId: string;
  newProperties?: Record<string, unknown>;
  newText?: string;
  properties?: Record<string, unknown>;
  text?: string;
};

export type SuggestionDescription =
  | ({
      deletedText: string;
      type: 'deletion';
    } & SuggestionCommonDescription)
  | ({
      insertedText: string;
      type: 'insertion';
    } & SuggestionCommonDescription)
  | ({
      deletedText: string;
      insertedText: string;
      type: 'replacement';
    } & SuggestionCommonDescription);

type SuggestionCommonDescription = {
  suggestionId: string;
  userId: string;
};

type SuggestionIdentity = {
  createdAt: number;
  id: string;
};

type InlineSuggestionProperties = Node | Omit<Text, 'text'>;

type BaseSuggestionApi = {
  dataList: (node: InlineSuggestionProperties) => InlineSuggestionData[];
  createFragment: (
    fragment: readonly Descendant[],
    identity: SuggestionIdentity
  ) => Descendant[];
  createIdentity: () => SuggestionIdentity;
  diff: {
    (
      doc0: readonly Element[],
      doc1: readonly Element[],
      options?: Partial<ComputeDiffOptions>
    ): Element[];
    (
      doc0: readonly Descendant[],
      doc1: readonly Descendant[],
      options?: Partial<ComputeDiffOptions>
    ): Descendant[];
  };
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
  inlineData: (
    node: InlineSuggestionProperties
  ) => InlineSuggestionData | undefined;
  /** Whether suggestion middleware should track the current operation. */
  isTracking: (tags: readonly EditorUpdateTag[]) => boolean;
  isBlockSuggestion: (node: Node) => node is SuggestionElementContract;
  isCurrentUser: (node: InlineSuggestionProperties) => boolean;
  key: (id?: string) => `suggestion_${string}`;
  keyId: (node: InlineSuggestionProperties) => string | undefined;
  keys: (node: Node) => string[];
  id: (node: InlineSuggestionProperties) => string | undefined;
  suggestionData: (
    node: Node
  ) =>
    | InlineSuggestionData
    | SuggestionElementContract['suggestion']
    | undefined;
  skipDeletes: (node: Node) => string;
  /** Run synchronous operations without recursively creating suggestions. */
  untracked: <T>(fn: () => T) => T;
  userId: (node: Node) => string | undefined;
  userIds: (node: Node) => string[];
};

type DeleteSuggestionOptions = {
  moveSelection?: boolean;
  reverse?: boolean;
  unit?: TextUnit;
};

type DeleteSuggestionFragmentOptions = Omit<DeleteSuggestionOptions, 'unit'>;

type SetSuggestionNodesOptions = {
  createdAt?: number;
  includeInlineElements?: boolean;
  suggestionId?: string;
} & NodeSetNodesOptions;

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
): value is InlineSuggestionData => {
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

const isBlockSuggestionData = (value: unknown): value is SuggestionData =>
  hasSuggestionIdentity(value) &&
  (value.type === 'insert' || value.type === 'remove') &&
  (!('isLineBreak' in value) || typeof value.isLineBreak === 'boolean');

const blockSuggestionProperty = property.json({
  validate: isBlockSuggestionData,
  validationVersion: 1,
});

const suggestionMarkProperty = property.boolean({
  default: false,
  omitDefault: true,
});

type SuggestionElementContract = ElementWith<
  Readonly<{ suggestion: typeof blockSuggestionProperty }>,
  'suggestion'
>;

type SuggestionTextContract = TextWith<
  Readonly<{ suggestion: typeof suggestionMarkProperty }>,
  'suggestion'
>;
type SuggestionTextProperties = Partial<
  Record<`suggestion_${string}`, InlineSuggestionData>
>;

const initialState: BaseSuggestionPluginState = {
  currentUserId: 'alice',
  isSuggesting: false,
};

export const BaseSuggestionPlugin = defineBasePlugin(PLUGINS.suggestion, {
  initialState,
  codecs: ({ defineCodecs, schema: { key } }) =>
    defineCodecs({
      'text/markdown': {
        from: 'suggestion',
        kind: 'node',
        mark: true,
        decode: ({ decode, decoration, node }) =>
          decode(node.children, {
            [key]: true,
            ...decoration,
          }),
        encode: ({ node }) => {
          if (!TextApi.isText(node)) return undefined;

          return {
            attributes: [],
            children: [{ type: 'text', value: node.text }],
            name: 'suggestion',
            type: 'mdxJsxTextElement',
          };
        },
      },
    }),
  schema: {
    mark: {
      property: suggestionMarkProperty,
      split: 'preserve',
      target: target.group('element'),
      typeChange: 'preserve-if-allowed',
    },
    properties: {
      blockSuggestion: schema.elementProperty(
        'suggestion',
        blockSuggestionProperty,
        {
          split: 'preserve',
          target: target.group('block'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      inlineSuggestion: schema.elementProperty(
        'suggestion',
        property.boolean({ default: false, omitDefault: true }),
        {
          split: 'preserve',
          target: target.group('inline'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      transientElement: schema.elementProperty(
        SUGGESTION_TRANSIENT_KEY,
        property.boolean({ default: false, omitDefault: true }),
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      inlineSuggestionData: schema.elementProperty(
        'suggestionData',
        inlineSuggestionDataProperty,
        {
          split: 'preserve',
          target: target.group('inline'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      inlineSuggestionById: schema.elementProperty(
        schema.key.prefix('suggestion_'),
        inlineSuggestionDataProperty,
        {
          split: 'preserve',
          target: target.group('inline'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      transientText: schema.textProperty(
        SUGGESTION_TRANSIENT_KEY,
        property.boolean({ default: false, omitDefault: true }),
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      textSuggestionData: schema.textProperty(
        'suggestionData',
        inlineSuggestionDataProperty,
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
      textSuggestionById: schema.textProperty(
        schema.key.prefix('suggestion_'),
        inlineSuggestionDataProperty,
        {
          split: 'preserve',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
        }
      ),
    },
  },
})
  .extend({
    rules: { selection: { affinity: 'outward' } },
    api: ({
      editor,
      schema: { key: suggestionKey },
      store,
    }): BaseSuggestionApi => {
      const key = (id = '0'): `suggestion_${string}` =>
        `${suggestionKey}_${id}`;
      const keyId = (node: InlineSuggestionProperties) =>
        Object.keys(node).findLast((nodeKey) =>
          nodeKey.startsWith(`${suggestionKey}_`)
        );
      const keys = (node: Node) =>
        Object.keys(node).filter((nodeKey) =>
          nodeKey.startsWith(`${suggestionKey}_`)
        );
      const inlineData = (node: InlineSuggestionProperties) => {
        const nodeKey = keyId(node);

        if (!nodeKey) return undefined;

        const value = Reflect.get(node, nodeKey);

        return isInlineSuggestionData(value) ? value : undefined;
      };
      const dataList = (
        node: InlineSuggestionProperties
      ): InlineSuggestionData[] =>
        Object.keys(node)
          .filter((nodeKey) => nodeKey.startsWith(`${suggestionKey}_`))
          .map((nodeKey) => Reflect.get(node, nodeKey))
          .filter(isInlineSuggestionData);
      const isBlockSuggestion = (
        node: Node
      ): node is SuggestionElementContract =>
        ElementApi.isElement(node) &&
        !editor.read.schema.isInline(node) &&
        isBlockSuggestionData(Reflect.get(node, 'suggestion'));
      const isInlineSuggestion = (node: Node): node is Element | Text =>
        TextApi.isText(node) ||
        (ElementApi.isElement(node) && editor.read.schema.isInline(node));
      const id = (node: InlineSuggestionProperties) => {
        if (!ElementApi.isElement(node) || editor.read.schema.isInline(node)) {
          return keyId(node)?.replace(`${suggestionKey}_`, '');
        }

        if (isBlockSuggestion(node)) return node.suggestion.id;

        return undefined;
      };
      const suggestionData = (node: Node) => {
        if (isInlineSuggestion(node)) return inlineData(node);
        if (isBlockSuggestion(node)) return node.suggestion;

        return undefined;
      };
      const skipDeletes = (node: Node): string => {
        if (
          TextApi.isText(node) ||
          (ElementApi.isElement(node) && editor.read.schema.isInline(node))
        ) {
          if (ElementApi.isElement(node)) return NodeApi.string(node);
          if (!Reflect.get(node, suggestionKey)) return node.text;
          if (suggestionData(node)?.type === 'remove') return '';

          return node.text;
        }
        if (!ElementApi.isElement(node) && !NodeApi.isEditor(node)) return '';

        return Array.from(NodeApi.children(node, []))
          .map(([child]) => skipDeletes(child))
          .join('');
      };
      const getProps: BaseSuggestionApi['getProps'] = (
        node,
        {
          id: innerId = nanoid(),
          createdAt = Date.now(),
          suggestionDeletion,
          suggestionUpdate,
          transient,
        } = {}
      ) => {
        const { currentUserId } = store.get();

        if (currentUserId === null) return {};

        const suggestion = {
          id: innerId,
          createdAt,
          type: suggestionDeletion
            ? 'remove'
            : suggestionUpdate
              ? 'update'
              : 'insert',
          userId: currentUserId,
          ...suggestionUpdate,
        };

        if (ElementApi.isElement(node) && !editor.read.schema.isInline(node)) {
          return { suggestion };
        }

        return {
          [key(innerId)]: suggestion,
          [suggestionKey]: true,
          ...(transient ? { [SUGGESTION_TRANSIENT_KEY]: true } : {}),
        };
      };
      function diff(
        doc0: readonly Element[],
        doc1: readonly Element[],
        options?: Partial<ComputeDiffOptions>
      ): Element[];
      function diff(
        doc0: readonly Descendant[],
        doc1: readonly Descendant[],
        options?: Partial<ComputeDiffOptions>
      ): Descendant[];
      function diff(
        doc0: readonly Descendant[],
        doc1: readonly Descendant[],
        {
          getDeleteProps = (node) =>
            getProps(node, { suggestionDeletion: true }),
          getInsertProps = (node) => getProps(node),
          getUpdateProps = (node, properties, newProperties) =>
            getProps(node, {
              suggestionUpdate: {
                newProperties: Object.fromEntries(
                  Object.entries(newProperties).filter(
                    (entry): entry is [string, PropertyJsonValue] =>
                      isJsonValue(entry[1])
                  )
                ),
                properties: Object.fromEntries(
                  Object.entries(properties).filter(
                    (entry): entry is [string, PropertyJsonValue] =>
                      isJsonValue(entry[1])
                  )
                ),
              },
            }),
          isInline = editor.read.schema.isInline,
          ...options
        }: Partial<ComputeDiffOptions> = {}
      ): Descendant[] {
        const ignoredProperties = new Set(options.ignoreProps);
        const collectMetadataKeys = (
          nodes: readonly Descendant[],
          ancestors: readonly string[] = []
        ) => {
          for (const node of nodes) {
            if (ElementApi.isElement(node)) {
              if (typeof node.type !== 'string') continue;

              for (const innerKey of Object.keys(node)) {
                if (innerKey === 'children' || innerKey === 'type') continue;

                if (
                  editor.read.schema.property({
                    ancestors,
                    key: innerKey,
                    placement: 'element',
                    type: node.type,
                  })?.role === 'metadata'
                ) {
                  ignoredProperties.add(innerKey);
                }
              }
              collectMetadataKeys(node.children, [node.type, ...ancestors]);
              continue;
            }

            const parentType = ancestors[0];

            if (!parentType) continue;
            for (const innerKey2 of Object.keys(node)) {
              if (innerKey2 === 'text') continue;

              if (
                editor.read.schema.property({
                  ancestors: ancestors.slice(1),
                  key: innerKey2,
                  placement: 'text',
                  type: parentType,
                })?.role === 'metadata'
              ) {
                ignoredProperties.add(innerKey2);
              }
            }
          }
        };

        collectMetadataKeys(doc0);
        collectMetadataKeys(doc1);
        const values = computeDiff(doc0, doc1, {
          getDeleteProps,
          getInsertProps,
          getUpdateProps,
          ...options,
          ignoreProps: [...ignoredProperties],
          isInline,
        });
        const traverse = (nodes: readonly Descendant[]): Descendant[] =>
          nodes.map((node, index) => {
            if (ElementApi.isElement(node)) {
              return { ...node, children: traverse(node.children) };
            }
            if (!TextApi.isText(node) || !Reflect.get(node, suggestionKey)) {
              return node;
            }

            const current = suggestionData(node);
            const previous = index > 0 ? nodes[index - 1] : undefined;
            const previousData =
              previous && Boolean(Reflect.get(previous, suggestionKey))
                ? suggestionData(previous)
                : undefined;

            if (current?.type !== 'insert' || previousData?.type !== 'remove') {
              return node;
            }

            const next = {
              ...node,
              [key(previousData.id)]: {
                ...current,
                id: previousData.id,
                createdAt: previousData.createdAt,
              },
            };

            delete next[key(current.id)];

            return next;
          });

        return traverse(values);
      }

      return {
        createFragment: (fragment, { createdAt, id: innerId2 }) => {
          const { currentUserId } = store.get();

          if (currentUserId === null) {
            return fragment.map((source) => ({ ...source }));
          }

          return fragment.map((source) => {
            if (TextApi.isText(source)) {
              const node: { [key: string]: unknown; text: string } = {
                ...source,
              };

              node[suggestionKey] = true;
              keys(node).forEach((nodeKey) => {
                delete node[nodeKey];
              });
              node[key(innerId2)] = {
                id: innerId2,
                createdAt,
                type: 'insert',
                userId: currentUserId,
              };

              return node;
            }

            return {
              ...source,
              suggestion: {
                id: innerId2,
                createdAt,
                type: 'insert',
                userId: currentUserId,
              },
            };
          });
        },
        createIdentity: () => ({ createdAt: Date.now(), id: nanoid() }),
        dataList,
        diff,
        getProps,
        inlineData,
        isBlockSuggestion,
        isCurrentUser: (node) =>
          inlineData(node)?.userId === store.get().currentUserId,
        isTracking: (tags) =>
          store.get().currentUserId !== null &&
          (suggestionUntrackedDepth.get(editor) ?? 0) === 0 &&
          !tags.includes(SUGGESTION_SKIP_TAG),
        key,
        keyId,
        keys,
        id,
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
            .find(
              (innerId3): innerId3 is string => typeof innerId3 === 'string'
            ),
        userIds: (node) =>
          keys(node)
            .map((nodeKey) => Reflect.get(node, nodeKey)?.userId)
            .filter(
              (innerId4): innerId4 is string => typeof innerId4 === 'string'
            ),
      };
    },
  })
  .extend(({ api, store, schema: { key } }) => ({
    read: ({ state }) => {
      function node(
        options: Omit<EditorNodesOptions<Node>, 'type'> & {
          id?: string;
          isText: true;
        }
      ): NodeEntry<SuggestionTextContract> | undefined;
      function node(
        options?: Omit<EditorNodesOptions<Node>, 'type'> & {
          id?: string;
          isText?: boolean;
        }
      ):
        | NodeEntry<SuggestionElementContract | SuggestionTextContract>
        | undefined;
      function node(
        options: Omit<EditorNodesOptions<Node>, 'type'> & {
          id?: string;
          isText?: boolean;
        } = {}
      ) {
        const { id, isText, match, ...rest } = options;

        return state.nodes.find({
          ...rest,
          match: (
            candidate,
            path
          ): candidate is
            | SuggestionElementContract
            | SuggestionTextContract => {
            if (match && !match(candidate, path)) return false;
            if (!Reflect.get(candidate, key)) return false;
            if (isText && !TextApi.isText(candidate)) return false;
            if (!id) return true;
            if (TextApi.isText(candidate)) {
              return Boolean(candidate[api.key(id)]);
            }

            return (
              api.isBlockSuggestion(candidate) && candidate.suggestion.id === id
            );
          },
        });
      }
      const findIdentity = ({
        at,
        type: suggestionType,
      }: {
        at: Location;
        type: 'insert' | 'remove' | 'update';
      }): SuggestionIdentity | undefined => {
        const getTextEntry = (location: Location) =>
          state.nodes.find({
            at: location,
            match: (candidate): candidate is SuggestionTextContract =>
              TextApi.isText(candidate) && Boolean(Reflect.get(candidate, key)),
          });
        const getInlineEntry = (point: Point) =>
          state.nodes.above({
            at: point,
            match: (candidate): candidate is Element =>
              ElementApi.isElement(candidate) &&
              state.schema.isInline(candidate) &&
              Boolean(api.id(candidate)),
          });

        let entry = getTextEntry(at);
        let inlineEntry: NodeEntry<Element> | undefined;

        if (!entry) {
          const edges = state.ranges.edges(at);

          if (!edges) return undefined;

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
              const lineBreak = state.nodes.above({
                at: previousPoint ?? start,
                match: ElementApi.isElement,
              });
              const identity =
                lineBreak && api.isBlockSuggestion(lineBreak[0])
                  ? lineBreak[0].suggestion
                  : undefined;

              if (
                identity?.isLineBreak &&
                typeof identity.id === 'string' &&
                typeof identity.createdAt === 'number'
              ) {
                return { createdAt: identity.createdAt, id: identity.id };
              }
            }
          }
        }

        if (entry) {
          const identity = api.inlineData(entry[0]);

          if (
            identity?.type === suggestionType &&
            identity.userId === store.get().currentUserId
          ) {
            return { createdAt: identity.createdAt, id: identity.id };
          }
        }

        if (inlineEntry) {
          const identity = api.suggestionData(inlineEntry[0]);

          if (
            identity?.type === suggestionType &&
            identity.userId === store.get().currentUserId
          ) {
            return { createdAt: identity.createdAt, id: identity.id };
          }
        }

        return undefined;
      };

      return {
        activeDescriptions: () => {
          const entry = node({ isText: true });

          if (!entry) return [];

          const suggestionId = api.id(entry[0]);

          if (!suggestionId) return [];

          return api
            .dataList(entry[0])
            .map(({ id, userId }): SuggestionDescription => {
              const suggestionKey = api.key(id);
              const nodes = state.nodes
                .toArray({
                  at: [],
                  match: (
                    candidate
                  ): candidate is SuggestionTextContract &
                    SuggestionTextProperties =>
                    TextApi.isText(candidate) &&
                    Boolean(Reflect.get(candidate, suggestionKey)),
                })
                .map(([candidate]) => candidate);
              const insertions = nodes.filter((candidate) => {
                const suggestion = candidate[suggestionKey];

                return (
                  isInlineSuggestionData(suggestion) &&
                  suggestion.type === 'insert'
                );
              });
              const deletions = nodes.filter((candidate) => {
                const suggestion = candidate[suggestionKey];

                return (
                  isInlineSuggestionData(suggestion) &&
                  suggestion.type === 'remove'
                );
              });
              const insertedText = insertions
                .map((candidate) => candidate.text)
                .join('');
              const deletedText = deletions
                .map((candidate) => candidate.text)
                .join('');

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
            });
        },
        findIdentity,
        node,
        nodeEntries: (
          suggestionId: string,
          {
            at = [],
            ...options
          }: Omit<EditorNodesOptions<Descendant>, 'type'> = {}
        ) =>
          state.nodes.toArray({
            at,
            ...options,
            match: (candidate, path): candidate is Descendant =>
              (ElementApi.isElement(candidate) || TextApi.isText(candidate)) &&
              Boolean(Reflect.get(candidate, api.key(suggestionId))) &&
              (!options.match ||
                NodeApi.matches(candidate, options.match, path)),
          }),
        nodes: ({
          transient,
          ...options
        }: Omit<EditorNodesOptions<Descendant>, 'type'> & {
          transient?: boolean;
        } = {}) =>
          state.nodes.toArray({
            ...options,
            at: options.at ?? [],
            mode: 'all',
            match: (candidate): candidate is Descendant =>
              (ElementApi.isElement(candidate) || TextApi.isText(candidate)) &&
              Boolean(Reflect.get(candidate, key)) &&
              (!transient ||
                Boolean(Reflect.get(candidate, SUGGESTION_TRANSIENT_KEY))),
          }),
      };
    },
  }))
  .extend((context) => ({
    update: ({ tx }) => {
      const {
        api,
        schema: { key },
        store,
      } = context;
      const setNodes = (
        options: SetSuggestionNodesOptions = {}
      ): string | undefined => {
        const { currentUserId } = store.get();

        if (currentUserId === null) return undefined;

        const {
          createdAt = Date.now(),
          includeInlineElements = true,
          suggestionId = nanoid(),
          ...nodeOptions
        } = options ?? {};
        const at = nodeOptions.at ?? tx.selection();

        if (!at) return undefined;

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
        const suggestion: InlineSuggestionData = {
          id: suggestionId,
          createdAt,
          type: 'remove',
          userId: currentUserId,
        };
        const props: SuggestionTextProperties & Record<string, unknown> = {
          [key]: true,
        };

        props[api.key(suggestionId)] = suggestion;
        const matchTextOutsideInline: NodeSetNodesOptions['match'] = (
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
          tx.nodes.set(props, {
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
      const deleteRange = (
        at: Range,
        {
          moveSelection = true,
          reverse,
          unit = 'character',
        }: DeleteSuggestionOptions = {}
      ): string | undefined => {
        const { currentUserId } = store.get();

        if (currentUserId === null) return undefined;

        const getInlineEntryAt = (point: Point) =>
          tx.nodes.above({
            at: point,
            match: (node) =>
              ElementApi.isElement(node) && tx.schema.isInline(node),
          });
        const getAdjacentInlineVoidEntry = (
          point: Point,
          { reverse: innerReverse }: { reverse?: boolean }
        ) => {
          const index = point.path.at(-1);

          if (index === undefined || (innerReverse && index === 0)) {
            return undefined;
          }

          const adjacentPath = innerReverse
            ? PathApi.previous(point.path)
            : PathApi.next(point.path);
          const entry = tx.nodes.get(adjacentPath);

          if (
            entry &&
            ElementApi.isElement(entry[0]) &&
            tx.schema.isInline(entry[0]) &&
            tx.schema.isVoid(entry[0])
          ) {
            return entry;
          }

          return undefined;
        };
        const isBoundaryPoint = (
          point: Point,
          { reverse: innerReverse2 }: { reverse?: boolean }
        ) => {
          const range = tx.ranges.get(point.path);

          if (!range) return false;

          return innerReverse2
            ? tx.points.isStart(point, range)
            : tx.points.isEnd(point, range);
        };
        const isEmptyCurrentUserInsertBlock = (entry: NodeEntry<Element>) => {
          const [node, path] = entry;

          if (tx.text.string(path).length > 0) return false;

          return node.children.some(
            (child) =>
              TextApi.isText(child) &&
              Boolean(Reflect.get(child, key)) &&
              api.inlineData(child)?.type === 'insert' &&
              api.isCurrentUser(child)
          );
        };
        const { anchor: from, focus: to } = at;
        const { id, createdAt } =
          tx.suggestion.findIdentity({ at: from, type: 'remove' }) ??
          api.createIdentity();
        const toRef = tx.anchor(to, {
          association: 'forward',
          deletion: 'nearest',
        });

        while (true) {
          const pointCurrent = tx.selection()?.anchor;

          if (!pointCurrent) break;

          const pointTarget = toRef.resolve();

          if (!pointTarget || PointApi.equals(pointCurrent, pointTarget)) break;

          const crossesBlocks = tx.selection.isAcrossBlocks({
            at: { anchor: pointCurrent, focus: pointTarget },
          });

          if (!crossesBlocks) {
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
            inlineEntry &&
            PathApi.isAncestor(inlineEntry[1], pointCurrent.path);

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
                  userId: currentUserId,
                },
                [key]: true,
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
                  tx.nodes.unset(['suggestion'], {
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
                  suggestion: {
                    id,
                    createdAt,
                    type: 'remove',
                    userId: currentUserId,
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

          const currentSelection = tx.selection();

          if (
            currentSelection &&
            PointApi.equals(pointCurrent, currentSelection.anchor)
          ) {
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
      const deleteFragment = ({
        moveSelection = false,
        reverse,
      }: DeleteSuggestionFragmentOptions = {}): string | undefined => {
        if (store.get().currentUserId === null) return undefined;

        const selection = tx.selection();

        if (!selection) return undefined;

        const edges = tx.ranges.edges(selection);

        if (!edges) return undefined;

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
        clearTransient: (options?: EditorNodeUnsetOptions<Node>) => {
          tx.nodes.unset(context.schema.properties.transientElement, options);
        },
        accept: (description: ResolvedSuggestion) => {
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

          tx.nodes.unset([description.keyId, key, SUGGESTION_TRANSIENT_KEY], {
            at: [],
            mode: 'all',
            match: (node) => {
              if (
                TextApi.isText(node) ||
                (ElementApi.isElement(node) && tx.schema.isInline(node))
              ) {
                const suggestions = api.dataList(node);

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
          });

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
        addMark: (mark: string, value: unknown) => {
          const { currentUserId } = store.get();

          if (currentUserId === null || !isJsonValue(value)) return;

          const id = nanoid();
          const createdAt = Date.now();
          const match = (node: Node) => {
            if (!TextApi.isText(node)) return false;
            if (!Reflect.get(node, key)) return true;

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
                userId: currentUserId,
              },
              [key]: true,
            },
            { match, split: true }
          );
        },
        delete: deleteRange,
        deleteFragment,
        insertFragment: (
          fragment: readonly Descendant[],
          insertContent: (fragment: readonly Descendant[]) => void = (
            content
          ) => tx.fragment.replace(content)
        ) => {
          if (store.get().currentUserId === null) return;

          deleteFragment();

          const selection = tx.selection();

          if (!selection) return;

          insertContent(
            api.createFragment(
              fragment,
              tx.suggestion.findIdentity({
                at: selection,
                type: 'insert',
              }) ?? api.createIdentity()
            )
          );
        },
        insertText: (text: string) => {
          const { currentUserId } = store.get();

          if (currentUserId === null) return;

          const selection = tx.selection();

          if (!selection) return;

          const { id, createdAt } =
            tx.suggestion.findIdentity({
              at: selection,
              type: 'insert',
            }) ?? api.createIdentity();
          const deletedId = tx.selection.isExpanded()
            ? deleteFragment({ moveSelection: true })
            : undefined;
          const suggestionId = deletedId ?? id;

          const properties: SuggestionTextProperties = {};

          properties[api.key(suggestionId)] = {
            id: suggestionId,
            createdAt,
            type: 'insert',
            userId: currentUserId,
          };

          tx.nodes.insert(
            { ...properties, [key]: true, text },
            { at: tx.selection() ?? selection, select: true }
          );
        },
        reject: (description: ResolvedSuggestion) => {
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

          tx.nodes.unset([description.keyId, key, SUGGESTION_TRANSIENT_KEY], {
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
          });

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
            .toArray({
              at: [],
              match: (node): node is SuggestionTextContract =>
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
                  (data): data is UpdateSuggestionData =>
                    data.type === 'update' &&
                    data.id === description.suggestionId
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
              const suggestionKey: string = api.key(suggestion.id);

              tx.nodes.unset(suggestionKey, { at: path });
            });
        },
        removeMark: (mark: string, previousValue: unknown = true) => {
          const { currentUserId } = store.get();

          if (currentUserId === null || !isJsonValue(previousValue)) return;

          const id = nanoid();
          const createdAt = Date.now();
          const match = (node: Node) => {
            if (!TextApi.isText(node)) return false;
            if (!Reflect.get(node, key)) return true;

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
                userId: currentUserId,
              },
              [key]: true,
            },
            { match }
          );
        },
        removeNodes: (nodes: ReadonlyArray<NodeEntry<Element | Text>>) => {
          const { currentUserId } = store.get();

          if (currentUserId === null) return;
          if (nodes.length === 0) return;

          const selection = tx.selection();

          if (!selection) return;

          const { id, createdAt } =
            tx.suggestion.findIdentity({
              at: selection,
              type: 'remove',
            }) ?? api.createIdentity();

          nodes.forEach(([, path]) => {
            tx.nodes.set(
              {
                suggestion: {
                  id,
                  createdAt,
                  type: 'remove',
                  userId: currentUserId,
                },
              },
              { at: path }
            );
          });
        },
        setNodes,
      };
    },
  }))
  .extend((context) => ({
    commands: ({ around, handle }) => {
      const { editor, store } = context;

      return [
        handle(editorCommands.addMark, ({ input, state, tags }) => {
          if (
            !store.get().isSuggesting ||
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
            !store.get().isSuggesting ||
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
            !store.get().isSuggesting ||
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

            tx.suggestion.addMark(input.key, input.value);
          });
        }),
        around(editorCommands.insertNodes, ({ input, tags, next }) => {
          const { currentUserId } = store.get();

          if (
            !store.get().isSuggesting ||
            currentUserId === null ||
            !context.api.isTracking(tags)
          ) {
            return next();
          }

          const nodes = Array.isArray(input.nodes)
            ? input.nodes
            : [input.nodes];
          const slashInput = editor.plugin(PLUGINS.slashInput);

          if (
            slashInput.installed &&
            nodes.some(
              (node) =>
                ElementApi.isElement(node) &&
                node.type === slashInput.schema.type
            )
          ) {
            return next();
          }

          const suggestionNodes = nodes.map((node) => ({
            ...node,
            suggestion: {
              id: nanoid(),
              createdAt: Date.now(),
              type: 'insert',
              userId: currentUserId,
            },
          }));

          return next({ ...input, nodes: suggestionNodes });
        }),
        handle(editorCommands.removeNodes, ({ input, state, tags }) => {
          if (!store.get().isSuggesting || !context.api.isTracking(tags)) {
            return false;
          }

          const nodes = state.nodes
            .toArray(input.options)
            .filter(
              (entry): entry is NodeEntry<Element | Text> =>
                ElementApi.isElement(entry[0]) || TextApi.isText(entry[0])
            );
          const slashInput = editor.plugin(PLUGINS.slashInput);

          if (
            slashInput.installed &&
            nodes.some(
              ([node]) =>
                ElementApi.isElement(node) &&
                node.type === slashInput.schema.type
            )
          ) {
            return false;
          }

          return state.transaction((tx) => {
            tx.suggestion.removeNodes(nodes);
          });
        }),
        around(editorCommands.replaceSlice, ({ input, state, tags, next }) => {
          if (!store.get().isSuggesting || !context.api.isTracking(tags)) {
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
                  state.suggestion.findIdentity({
                    at: selection,
                    type: 'insert',
                  }) ?? context.api.createIdentity()
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

          if (store.get().isSuggesting && context.api.isTracking(tags)) {
            if (reverse) {
              const node = state.nodes.above();
              const suggestion =
                node && context.api.isBlockSuggestion(node[0])
                  ? node[0].suggestion
                  : undefined;

              if (suggestion && !suggestion.isLineBreak) {
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
              tx.nodes.unset(['suggestion'], { at: pointTarget });
            });

            return next.after(prefix);
          }

          return next();
        }),
        handle(editorCommands.deleteFragment, ({ input, state, tags }) => {
          if (!store.get().isSuggesting || !context.api.isTracking(tags)) {
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
          const { currentUserId } = store.get();

          if (
            !store.get().isSuggesting ||
            currentUserId === null ||
            !context.api.isTracking(tags)
          ) {
            return false;
          }

          const selection = state.selection();
          const above = state.nodes.above({ match: ElementApi.isElement });

          if (!selection || !above) return state.transaction(() => {});

          const [node, path] = above;

          if (
            path.length > 1 ||
            node.type !== editor.plugin(PLUGINS.paragraph).schema.type
          ) {
            return state.transaction((tx) => {
              tx.suggestion.insertText('\n');
            });
          }

          const { id, createdAt } =
            state.suggestion.findIdentity({
              at: selection,
              type: 'insert',
            }) ?? context.api.createIdentity();
          const inserted = next();

          if (inserted === false) return false;

          return state.transaction.extend(inserted, (tx) => {
            tx.tags.add('history-merge');
            tx.nodes.set(
              {
                suggestion: {
                  id,
                  createdAt,
                  isLineBreak: true,
                  type: 'insert',
                  userId: currentUserId,
                },
              },
              { at: path }
            );
          });
        }),
        handle(editorCommands.insertText, ({ input, state, tags }) => {
          if (!store.get().isSuggesting || !context.api.isTracking(tags)) {
            return false;
          }

          const node = state.nodes.above();
          const suggestion =
            node && context.api.isBlockSuggestion(node[0])
              ? node[0].suggestion
              : undefined;

          if (suggestion && !suggestion.isLineBreak) {
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
          const inlineNode =
            TextApi.isText(node) ||
            (ElementApi.isElement(node) && tx.schema.isInline(node))
              ? node
              : undefined;

          if (!inlineNode || !Reflect.get(inlineNode, context.schema.key)) {
            return;
          }

          const keyId = context.api.keyId(inlineNode);

          if (!keyId) {
            context.api.untracked(() => {
              tx.nodes.unset([context.schema.key, 'suggestionData'], {
                at: path,
              });
            });

            return;
          }

          const inlineData = context.api.inlineData(inlineNode);

          if (inlineData?.userId) return;

          if (inlineData?.type === 'remove') {
            context.api.untracked(() => {
              tx.nodes.unset([context.schema.key, keyId], { at: path });
            });
          } else {
            context.api.untracked(() => {
              tx.nodes.remove({ at: path });
            });
          }
        },
      },
    ],
  }));

/** Element carrying the active schema-owned block suggestion property. */
export type SuggestionElement = ElementWith<
  typeof BaseSuggestionPlugin,
  'blockSuggestion'
>;

/** Text carrying the active schema-owned suggestion mark. */
export type SuggestionText = TextWith<
  typeof BaseSuggestionPlugin,
  'suggestion'
>;

export type BaseSuggestionDefinition = DefinitionOf<
  typeof BaseSuggestionPlugin
>;
