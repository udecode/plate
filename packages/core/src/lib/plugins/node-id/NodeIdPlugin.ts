import {
  type Descendant,
  DocumentChange,
  type EditorDocumentValue,
  type EditorTransactionTopLevelRange,
  type NodeEntry,
  type NodeMatch,
  type NodeProps,
  type Path,
  type Value,
  ElementApi,
  NodeApi,
  PathApi,
  TextApi,
  property,
  schema,
  target,
} from '@platejs/plite';
import cloneDeep from 'lodash/cloneDeep.js';
import isEqual from 'lodash/isEqual.js';
import { nanoid } from 'nanoid';
import {
  getInternalDocumentChangeRootKeys,
  MAIN_ROOT_KEY,
} from '@platejs/plite/internal';

import type { DefinitionOf } from '../../plugin/PluginDefinition';
import { createBasePlugin } from '../../plugin/createBasePlugin';

export type NodeIdPluginState = {
  /**
   * By default, inserted nodes reuse their existing id when that id is not
   * already present in the document. Set this option to true to always assign a
   * fresh id.
   */
  disableInsertOverrides?: boolean;
  /**
   * Filter inline `Element` nodes.
   *
   * @default true
   */
  filterInline: boolean;
  /**
   * Filter `Text` nodes.
   *
   * @default true
   */
  filterText: boolean;
  /**
   * Node key to store the id.
   *
   * @default 'id'
   */
  idKey: string;
  /**
   * Controls how missing ids are assigned in the initial value.
   *
   * - `'if-needed'`: normalize only when the first or last top-level node is
   *   missing an id
   * - `'always'`: walk the whole initial value and fill any missing ids
   * - `false`: skip initial-value id assignment
   *
   * @default 'if-needed'
   */
  initialValueIds?: false | 'always' | 'if-needed';
  /**
   * Reports duplicate-id scan cost during inserted-node normalization.
   */
  onDuplicateIdScan?: (stats: {
    candidateCount: number;
    duration: number;
    existingCount: number;
    visitedCount: number;
  }) => void;
  /**
   * Reuse ids from clipboard pastes when they do not exist in the target
   * document. Generic inserts keep explicit unique ids independently.
   *
   * @default false
   */
  reuseId?: boolean;
  /**
   * A function that generates and returns a unique ID.
   *
   * @default () => nanoid(10)
   */
  idCreator: () => string;
  /** Match nodes that receive IDs. */
  match?: NodeMatch<Descendant>;
};

export type NormalizeNodeIdOptions = Partial<
  Pick<NodeIdPluginState, 'filterText' | 'idCreator' | 'idKey' | 'match'>
>;

type NormalizeNodeIdRuntimeOptions = NormalizeNodeIdOptions &
  Partial<Pick<NodeIdPluginState, 'filterInline'>> & {
    isBlock?: (node: Descendant) => boolean;
  };

const isDefaultNodeIdFastPath = ({
  filterInline = true,
  filterText = true,
  match,
}: NormalizeNodeIdRuntimeOptions) =>
  match === undefined && filterInline && filterText;

const isBlockCandidate = (
  node: Descendant,
  isBlock?: (node: Descendant) => boolean
) => ElementApi.isElement(node) && (isBlock === undefined || isBlock(node));

const matchesNodeIdPolicy = (
  [node, path]: NodeEntry,
  {
    filterInline = true,
    filterText = true,
    isBlock,
    match,
  }: NormalizeNodeIdRuntimeOptions,
  matchNode: Descendant = node as Descendant
) =>
  (!match || NodeApi.matches(matchNode, match, path)) &&
  (!filterText || ElementApi.isElement(node)) &&
  (!filterInline ||
    !ElementApi.isElement(node) ||
    isBlockCandidate(node as Descendant, isBlock));

const shouldAssignNodeId = (
  entry: readonly [Descendant, Path],
  options: NormalizeNodeIdRuntimeOptions = {}
) => {
  const { idKey = 'id' } = options;

  return !entry[0][idKey] && matchesNodeIdPolicy(entry, options);
};

const resolveInitialValueIds = (
  options: Pick<NodeIdPluginState, 'initialValueIds'>
): false | 'always' | 'if-needed' => options.initialValueIds ?? 'if-needed';

const visitDocumentNodes = (
  value: EditorDocumentValue,
  root: string,
  visit: (node: Descendant) => boolean | void
) => {
  const children =
    root === MAIN_ROOT_KEY ? value.children : (value.roots?.[root] ?? []);

  const visitNode = (node: Descendant): boolean => {
    if (visit(node)) return true;
    if (!ElementApi.isElement(node)) return false;

    return node.children.some((child) => visitNode(child as Descendant));
  };

  children.some((node) => visitNode(node as Descendant));
};

const normalizeInsertedNodeIds = (
  input: {
    node: Descendant;
    path: Path;
    root: string;
  },
  options: NodeIdPluginState & Pick<NormalizeNodeIdRuntimeOptions, 'isBlock'>,
  before: EditorDocumentValue,
  reservedIds: Set<unknown>,
  freshIds: boolean
) => {
  const {
    disableInsertOverrides,
    idCreator = () => nanoid(10),
    idKey = 'id',
  } = options;
  const node = cloneDeep(input.node) as Descendant & {
    _id?: unknown;
  };
  const duplicateCandidateIds = new Set<unknown>();

  const collectCandidateIds = (entry: NodeEntry) => {
    const [entryNode, path] = entry;
    const entryRecord = entryNode as Record<string, unknown>;
    const matches = matchesNodeIdPolicy(
      [entryNode as Descendant, path],
      options
    );

    if (matches && !freshIds) {
      if (entryRecord[idKey] !== undefined) {
        duplicateCandidateIds.add(entryRecord[idKey]);
      }

      if (!disableInsertOverrides && entryRecord._id !== undefined) {
        duplicateCandidateIds.add(entryRecord._id);
      }
    }

    if (!ElementApi.isElement(entryNode)) return;

    entryNode.children.forEach((child, index) => {
      collectCandidateIds([child as Descendant, [...path, index]]);
    });
  };

  collectCandidateIds([node, input.path]);

  const existingIds = new Set<unknown>();
  const start = globalThis.performance?.now() ?? Date.now();
  let visitedCount = 0;

  if (duplicateCandidateIds.size > 0) {
    for (const id of reservedIds) {
      if (duplicateCandidateIds.has(id)) existingIds.add(id);
    }

    if (existingIds.size < duplicateCandidateIds.size) {
      visitDocumentNodes(before, input.root, (entryNode) => {
        visitedCount += 1;

        const id = (entryNode as Record<string, unknown>)[idKey];

        if (id === undefined || !duplicateCandidateIds.has(id)) return;

        existingIds.add(id);

        if (existingIds.size === duplicateCandidateIds.size) {
          return true;
        }
      });
    }
  }

  options.onDuplicateIdScan?.({
    candidateCount: duplicateCandidateIds.size,
    duration: (globalThis.performance?.now() ?? Date.now()) - start,
    existingCount: existingIds.size,
    visitedCount,
  });

  const normalizeInsertedNode = (entry: NodeEntry) => {
    const [entryNode, path] = entry;
    const entryRecord = entryNode as Record<string, unknown>;
    const matches = matchesNodeIdPolicy(
      [entryNode as Descendant, path],
      options
    );

    if (matches) {
      if (
        entryRecord[idKey] !== undefined &&
        (freshIds || existingIds.has(entryRecord[idKey]))
      ) {
        delete entryRecord[idKey];
      }

      if (entryRecord[idKey] === undefined) {
        Object.assign(entryRecord, { [idKey]: idCreator() });
      }

      if (entryRecord._id !== undefined) {
        const id = entryRecord._id;
        // biome-ignore lint/performance/noDelete: _id is an insert-only override marker.
        delete entryRecord._id;

        if (!freshIds && !disableInsertOverrides && !existingIds.has(id)) {
          entryRecord[idKey] = id;
        }
      }
    }

    if (entryRecord[idKey] !== undefined) {
      existingIds.add(entryRecord[idKey]);
      reservedIds.add(entryRecord[idKey]);
    }

    if (!ElementApi.isElement(entryNode)) return;

    entryNode.children.forEach((child, index) => {
      normalizeInsertedNode([child as Descendant, [...path, index]]);
    });
  };

  normalizeInsertedNode([node, input.path]);

  return node;
};

const normalizeSplitNodeIds = (
  input: {
    node: Descendant;
    path: Path;
    root: string;
  },
  options: NodeIdPluginState & Pick<NormalizeNodeIdRuntimeOptions, 'isBlock'>,
  before: EditorDocumentValue,
  reservedIds: Set<unknown>
) => {
  const { idCreator = () => nanoid(10), idKey = 'id', reuseId } = options;
  const properties = {
    ...NodeApi.extractProps(input.node),
  } as NodeProps<Descendant> & Record<string, unknown>;
  if (
    matchesNodeIdPolicy(
      [input.node, input.path],
      options,
      properties as Descendant
    )
  ) {
    const id = properties[idKey];
    const duplicate =
      id !== undefined &&
      (reservedIds.has(id) ||
        (() => {
          let found = false;

          visitDocumentNodes(before, input.root, (node) => {
            if ((node as Record<string, unknown>)[idKey] !== id) return;

            found = true;
            return true;
          });

          return found;
        })());

    if (!reuseId || id === undefined || duplicate) {
      properties[idKey] = idCreator();
    }
  } else if (properties[idKey] !== undefined) {
    delete properties[idKey];
  }

  if (properties[idKey] !== undefined) {
    reservedIds.add(properties[idKey]);
  }

  return TextApi.isText(input.node)
    ? ({ ...properties, text: input.node.text } as Descendant)
    : ({ ...properties, children: input.node.children } as Descendant);
};

type DocumentNodeEntry = {
  node: Descendant;
  path: Path;
};

const collectDocumentNodeEntries = (
  children: readonly Descendant[],
  topLevelIndices?: ReadonlySet<number>
): DocumentNodeEntry[] => {
  const entries: DocumentNodeEntry[] = [];

  const visit = (node: Descendant, path: Path) => {
    entries.push({ node, path });

    if (ElementApi.isElement(node)) {
      node.children.forEach((child, index) => {
        visit(child as Descendant, [...path, index]);
      });
    }
  };

  children.forEach((node, index) => {
    if (topLevelIndices && !topLevelIndices.has(index)) return;

    visit(node, [index]);
  });

  return entries;
};

const isSameNodeKind = (left: Descendant, right: Descendant) =>
  TextApi.isText(left)
    ? TextApi.isText(right)
    : ElementApi.isElement(right) && left.type === right.type;

const pathKey = (path: readonly number[]) => path.join('.');

const collectInsertedNodeEntries = (
  beforeChildren: readonly Descendant[],
  afterChildren: readonly Descendant[],
  idKey: string,
  ranges: readonly EditorTransactionTopLevelRange[]
) => {
  const collectIndices = (
    phase: 'after' | 'before',
    length: number
  ): ReadonlySet<number> => {
    const indices = new Set<number>();

    for (const range of ranges) {
      const window = range[phase];

      if (!window) continue;

      for (
        let index = Math.max(0, window[0]);
        index <= Math.min(length - 1, window[1]);
        index++
      ) {
        indices.add(index);
      }
    }

    return indices;
  };
  const beforeEntries = collectDocumentNodeEntries(
    beforeChildren,
    collectIndices('before', beforeChildren.length)
  );
  const afterEntries = collectDocumentNodeEntries(
    afterChildren,
    collectIndices('after', afterChildren.length)
  );
  const availableBefore = new Set(beforeEntries.map((_, index) => index));
  const matchedAfter = new Set<number>();
  const claimMatches = (
    match: (after: DocumentNodeEntry, before: DocumentNodeEntry) => boolean
  ) => {
    afterEntries.forEach((afterEntry, afterIndex) => {
      if (matchedAfter.has(afterIndex)) return;

      const beforeIndex = [...availableBefore].find((candidateIndex) =>
        match(afterEntry, beforeEntries[candidateIndex]!)
      );

      if (beforeIndex === undefined) return;

      availableBefore.delete(beforeIndex);
      matchedAfter.add(afterIndex);
    });
  };

  // Preserve local structural sharing first, then recover identity from exact
  // values and stable ids for serialized/external canonical changes.
  claimMatches((after, before) => after.node === before.node);
  claimMatches((after, before) => isEqual(after.node, before.node));
  claimMatches((after, before) => {
    const afterId = (after.node as Record<string, unknown>)[idKey];
    const beforeId = (before.node as Record<string, unknown>)[idKey];

    return (
      afterId !== undefined &&
      afterId === beforeId &&
      isSameNodeKind(after.node, before.node)
    );
  });
  claimMatches(
    (after, before) =>
      pathKey(after.path) === pathKey(before.path) &&
      isSameNodeKind(after.node, before.node)
  );

  const inserted = afterEntries.filter((_, index) => !matchedAfter.has(index));
  const insertedPaths = new Set(inserted.map(({ path }) => pathKey(path)));

  return inserted.filter(({ path }) => {
    for (let depth = 1; depth < path.length; depth++) {
      if (insertedPaths.has(pathKey(path.slice(0, depth)))) return false;
    }

    return true;
  });
};

const getNodeAt = (
  children: readonly Descendant[],
  path: readonly number[]
): Descendant | null => {
  let node: Descendant | undefined;
  let currentChildren = children;

  for (const index of path) {
    node = currentChildren[index];

    if (!node) return null;
    currentChildren = ElementApi.isElement(node) ? node.children : [];
  }

  return node ?? null;
};

const replaceNodeAt = (
  children: readonly Descendant[],
  path: readonly number[],
  node: Descendant
): Descendant[] => {
  const [index, ...rest] = path;

  if (index === undefined) return [...children];

  const current = children[index];

  if (!current) return [...children];

  const nextChildren = [...children];

  if (rest.length === 0) {
    nextChildren[index] = node;
  } else if (ElementApi.isElement(current)) {
    nextChildren[index] = {
      ...current,
      children: replaceNodeAt(
        current.children as readonly Descendant[],
        rest,
        node
      ),
    };
  }

  return nextChildren;
};

const isSplitNodeEntry = (
  beforeChildren: readonly Descendant[],
  afterChildren: readonly Descendant[],
  entry: DocumentNodeEntry
) => {
  if (!PathApi.hasPrevious(entry.path)) return null;

  const sourcePath = PathApi.previous(entry.path);
  const beforeNode = getNodeAt(beforeChildren, sourcePath);
  const leftNode = getNodeAt(afterChildren, sourcePath);

  if (!beforeNode || !leftNode) return null;

  if (
    TextApi.isText(beforeNode) &&
    TextApi.isText(leftNode) &&
    TextApi.isText(entry.node) &&
    leftNode.text + entry.node.text === beforeNode.text
  ) {
    return sourcePath;
  }

  if (
    ElementApi.isElement(beforeNode) &&
    ElementApi.isElement(leftNode) &&
    ElementApi.isElement(entry.node) &&
    beforeNode.type === leftNode.type &&
    beforeNode.type === entry.node.type &&
    isEqual([...leftNode.children, ...entry.node.children], beforeNode.children)
  ) {
    return sourcePath;
  }

  return null;
};

/**
 * Normalize node IDs in a value without using editor operations. This is a pure
 * function that returns the normalized value and preserves references for
 * unchanged branches. Raw values do not carry schema block semantics, so this
 * standalone helper treats every element as an ID candidate. Use `match` when
 * raw element types need filtering. NodeIdPlugin owns schema-aware inline
 * filtering.
 */
const normalizeNodeIdRuntime = (
  value: Value,
  options: NormalizeNodeIdRuntimeOptions = {}
): Value => {
  const { idCreator = () => nanoid(10), idKey = 'id' } = options;

  if (isDefaultNodeIdFastPath(options)) {
    const normalizeNodeFast = <N extends Descendant>(node: N): N => {
      if (!ElementApi.isElement(node)) return node;
      if (!isBlockCandidate(node, options.isBlock)) return node;

      let nextChildren: Descendant[] | undefined;

      node.children.forEach((child, index) => {
        const nextChild = normalizeNodeFast(child);

        if (nextChild !== child) {
          if (!nextChildren) {
            nextChildren = [...node.children];
          }

          nextChildren[index] = nextChild;
        }
      });

      if (!node[idKey]) {
        return {
          ...node,
          ...(nextChildren ? { children: nextChildren } : {}),
          [idKey]: idCreator(),
        };
      }

      if (nextChildren) {
        return {
          ...node,
          children: nextChildren,
        };
      }

      return node;
    };

    let valueChanged = false;

    const nextValue = value.map((node) => {
      const nextNode = normalizeNodeFast(node);

      if (nextNode !== node) {
        valueChanged = true;
      }

      return nextNode;
    });

    return valueChanged ? nextValue : value;
  }

  const normalizeNode = <N extends Descendant>(node: N, path: Path): N => {
    let nextNode = node;
    let childrenChanged = false;

    if (shouldAssignNodeId([node, path], options)) {
      nextNode = {
        ...node,
        [idKey]: idCreator(),
      };
    }

    if (ElementApi.isElement(node)) {
      const nextChildren = node.children.map((child, index) => {
        const nextChild = normalizeNode(child, [...path, index]);

        if (nextChild !== child) {
          childrenChanged = true;
        }

        return nextChild;
      });

      if (childrenChanged) {
        nextNode =
          nextNode === node
            ? {
                ...node,
                children: nextChildren,
              }
            : {
                ...nextNode,
                children: nextChildren,
              };
      }
    }

    return nextNode;
  };

  let valueChanged = false;

  const nextValue = value.map((node, index) => {
    const nextNode = normalizeNode(node, [index]);

    if (nextNode !== node) {
      valueChanged = true;
    }

    return nextNode;
  });

  return valueChanged ? nextValue : value;
};

export function normalizeNodeId<V extends Value>(
  value: V,
  options?: NormalizeNodeIdOptions
): V;
export function normalizeNodeId(
  value: Value,
  options: NormalizeNodeIdOptions = {}
): Value {
  return normalizeNodeIdRuntime(value, options);
}

// This annotation widens literal defaults to the complete public state.
const nodeIdInitialState: NodeIdPluginState = {
  filterInline: true,
  filterText: true,
  idKey: 'id',
  idCreator: () => nanoid(10),
};

export const NodeIdPlugin = createBasePlugin({
  initialState: nodeIdInitialState,
  name: 'nodeId',
  schema: ({ initialState }) => ({
    properties: [
      schema.elementProperty(initialState.idKey ?? 'id', property.json(), {
        role: 'metadata',
        target: target.group('element'),
      }),
    ],
  }),
  update: ({ store, tx }) => ({
    normalize() {
      const state = store.get();
      const {
        idCreator = nodeIdInitialState.idCreator,
        idKey = nodeIdInitialState.idKey,
      } = state;
      const updates: { at: Path; props: Record<string, unknown> }[] = [];
      const isBlock = (node: Descendant) =>
        ElementApi.isElement(node) && tx.schema.isBlock(node);
      const applyUpdates = () => {
        if (updates.length === 0) return;

        tx.tags.add('history-skip');

        for (const { at, props } of updates) {
          tx.nodes.set(props, { at });
        }
      };

      if (isDefaultNodeIdFastPath({ ...state, isBlock })) {
        const path: number[] = [];

        const visitFast = (node: Descendant) => {
          if (!ElementApi.isElement(node)) return;
          if (!isBlockCandidate(node, isBlock)) return;

          if (!node[idKey]) {
            updates.push({
              at: [...path],
              props: { [idKey]: idCreator() },
            });
          }

          node.children.forEach((child, index) => {
            path.push(index);
            visitFast(child);
            path.pop();
          });
        };

        tx.nodes.children().forEach((node, index) => {
          path.push(index);
          visitFast(node);
          path.pop();
        });

        applyUpdates();

        return;
      }

      const addNodeId = (entry: readonly [Descendant, Path]) => {
        const [node, path] = entry;

        if (shouldAssignNodeId(entry, { ...state, isBlock })) {
          updates.push({
            at: path,
            props: { [idKey]: idCreator() },
          });
        }

        // Only traverse children if this is an Element node
        if (ElementApi.isElement(node)) {
          node.children.forEach((child, index) => {
            addNodeId([child, [...path, index]]);
          });
        }
      };

      // Start traversal from top-level nodes.
      tx.nodes.children().forEach((node, index) => {
        addNodeId([node, [index]]);
      });

      applyUpdates();
    },
  }),
  on: {
    transactionChange({ after, before, change, changed, editor, store, tx }) {
      if (tx.tags.has('node-id-normalizing') || editor.runtime.isNormalizing) {
        return;
      }

      const state = store.get();
      const { idKey = 'id' } = state;
      const runtimeOptions = {
        ...state,
        idKey,
        isBlock: (node: Descendant) => editor.read.schema.isBlock(node),
      };
      const roots = new Set([
        ...getInternalDocumentChangeRootKeys(change),
        ...change.createRoots,
      ]);
      const updates: {
        node: Descendant;
        path: Path;
        root: string;
      }[] = [];

      for (const root of roots) {
        const publicRoot = root === MAIN_ROOT_KEY ? undefined : root;

        if (!changed.has('structure', publicRoot)) continue;

        const beforeChildren =
          root === MAIN_ROOT_KEY
            ? before.children
            : (before.roots?.[root] ?? []);
        const afterChildren =
          root === MAIN_ROOT_KEY ? after.children : (after.roots?.[root] ?? []);
        const insertedEntries = collectInsertedNodeEntries(
          beforeChildren,
          afterChildren,
          idKey,
          changed.topLevelRanges(publicRoot)
        );
        const reservedIds = new Set<unknown>();

        for (const entry of insertedEntries) {
          const splitPath = isSplitNodeEntry(
            beforeChildren,
            afterChildren,
            entry
          );
          const normalized = splitPath
            ? normalizeSplitNodeIds(
                { node: entry.node, path: splitPath, root },
                runtimeOptions,
                before,
                reservedIds
              )
            : normalizeInsertedNodeIds(
                { ...entry, root },
                runtimeOptions,
                before,
                reservedIds,
                tx.tags.has('paste') && state.reuseId !== true
              );

          if (!isEqual(normalized, entry.node)) {
            updates.push({ node: normalized, path: entry.path, root });
          }
        }
      }

      if (updates.length === 0) return;

      tx.tags.add('node-id-normalizing');
      let corrected = after;

      for (const update of updates) {
        if (update.root === MAIN_ROOT_KEY) {
          corrected = {
            ...corrected,
            children: replaceNodeAt(
              corrected.children,
              update.path,
              update.node
            ) as Value,
          };
        } else {
          corrected = {
            ...corrected,
            roots: {
              ...corrected.roots,
              [update.root]: replaceNodeAt(
                corrected.roots?.[update.root] ?? [],
                update.path,
                update.node
              ) as Value,
            },
          };
        }
      }

      tx.changes.apply(DocumentChange.between(after, corrected));
    },
  },
  transformInitialValue: ({ editor, store, value }) => {
    const state = store.get();
    const { idKey = 'id' } = state;
    const runtimeOptions = { ...state, idKey };
    const initialValueIds = resolveInitialValueIds(state);
    const normalize = (children: Value) =>
      normalizeNodeIdRuntime(children, {
        ...runtimeOptions,
        isBlock: (node) =>
          ElementApi.isElement(node) && editor.read.schema.isBlock(node),
      });

    if (initialValueIds === false) {
      return value;
    }

    // Perf: check if normalization is needed by looking at the first node and last node
    if (initialValueIds === 'if-needed') {
      const roots = [value.children, ...Object.values(value.roots ?? {})];

      if (
        roots.every(
          (children) =>
            children.length === 0 ||
            (children[0]?.[idKey] && children.at(-1)?.[idKey])
        )
      ) {
        return value;
      }
    }

    const children = normalize(value.children);
    let roots = value.roots;

    if (roots) {
      const normalizedRoots = Object.fromEntries(
        Object.entries(roots).map(([root, rootChildren]) => [
          root,
          normalize(rootChildren),
        ])
      );

      if (
        Object.entries(normalizedRoots).some(
          ([root, rootChildren]) => rootChildren !== roots?.[root]
        )
      ) {
        roots = normalizedRoots;
      }
    }

    if (children === value.children && roots === value.roots) return value;

    return {
      ...value,
      children,
      ...(roots ? { roots } : {}),
    };
  },
});

export type NodeIdPluginUpdate = {
  normalize: () => void;
};

export type NodeIdDefinition = DefinitionOf<typeof NodeIdPlugin>;
