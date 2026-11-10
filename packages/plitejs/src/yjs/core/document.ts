import * as Y from 'yjs';

import type { NodeList } from '../../core/change/document-index';
import { countCoreWork } from '../../core/work';
import {
  NodeApi,
  type Descendant,
  type JsonNode,
  type Path,
} from '../../index';
import { getDefined } from '../../internal/get-defined';
import {
  getYjsAttributes,
  getYjsElementType,
  setYjsAttribute,
  setYjsAttributes,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  getJoinedYjsLines,
  getYjsLinesJoinedAtEnd,
  hasJoinedYjsLines,
  joinedYjsIds,
  noteJoinedYjsLine,
} from './joined-lines';
import {
  isReservedYjsKey,
  isYjsMarkRecordKey,
  YJS_CHILD_VISIBILITY_KEYS,
  YJS_CUT_SOURCE_KEY,
  YJS_ELEMENT_NODE_NAME,
  YJS_HIDDEN_KEY,
  YJS_JOINED_AFTER_KEY,
  YJS_JOINED_BEFORE_KEY,
  YJS_JOINED_END_KEY,
  YJS_NODE_ID_KEY,
  YJS_VIRTUAL_CHILD_ID_KEY,
  YJS_VIRTUAL_PLACEHOLDER_KEY,
} from './keys';
import { copyPath } from './path';
import type {
  RootProjectionIndex,
  RootSlotEntry,
  YjsTreeRefs,
} from './root-projection-index';
import {
  encodeYjsSetValueAttributes,
  getYjsSetEditAttributeKeys,
  readYjsSetValueAttributes,
} from './set-valued-attributes';
import {
  createYjsRunEncoder,
  createYjsTextChain,
  cutOf,
  cutViewsOf,
  deleteUnshownYjsLetters,
  healYjsCutOf,
  readTextRuns,
  segmentPliteChildren,
  segmentYjsChildren,
  textPieceOf,
  yjsCutsBefore,
  yjsTextContent,
  yjsTextEndCutOf,
  yjsTextLength,
  type YjsViewCut,
} from './text-runs';

const VIRTUAL_YJS_CHILD_RAW_INDEX = -1;
const JOINED_LINE_POSITION = Number.MAX_SAFE_INTEGER;

export type YjsPropertyContext = Readonly<{
  /** Immediate element parent first. */
  ancestors: readonly string[];
  parent: string | null;
  path: Path;
  /** `null` addresses the implicit primary root. */
  root: string | null;
  /** Element type targeted by schema property rules. */
  type: string;
  placement: 'element' | 'text';
}>;

export type YjsPropertyLocation = Readonly<{
  /** Immediate element parent first. */
  ancestors: readonly string[];
  /** First child index when encoding a window rather than the whole parent. */
  offset?: number;
  /** Parent path. */
  path: Path;
  /** `null` addresses the implicit primary root. */
  root: string | null;
}>;

export type YjsSetPropertyResolver = ((
  node: JsonNode,
  key: string,
  context: YjsPropertyContext
) => boolean) &
  Readonly<{ isPlaceDependent: (key: string) => boolean }>;

export const noSetProperties: YjsSetPropertyResolver = Object.assign(
  () => false,
  { isPlaceDependent: () => false }
);

export type YjsKeyStorage =
  | 'members'
  | 'placed-members'
  | 'placed-value'
  | 'value';

export type YjsKeyStorageOf = (key: string) => YjsKeyStorage;

export const yjsKeyStorageOf =
  (
    isSetValued: YjsSetPropertyResolver,
    node: JsonNode,
    context: YjsPropertyContext
  ): YjsKeyStorageOf =>
  (key) => {
    const members = isSetValued(node, key, context);

    if (!isSetValued.isPlaceDependent(key)) {
      return members ? 'members' : 'value';
    }

    return members ? 'placed-members' : 'placed-value';
  };

/**
 * Whether an element of `type` holds text, so one that shows no children reads
 * as one empty text, as Plite holds it. An element whose content holds only
 * elements reads with no children.
 */
export type YjsTextAdmission = (type: string) => boolean;

const admitsAnyText: YjsTextAdmission = () => true;

const rootPropertyLocation = (): YjsPropertyLocation => ({
  ancestors: [],
  path: [],
  root: null,
});

export const createYjsPropertyContext = (
  node: JsonNode,
  location: YjsPropertyLocation
): YjsPropertyContext => {
  const placement = NodeApi.isText(node) ? 'text' : 'element';
  const parent = location.ancestors[0] ?? null;

  return {
    ancestors:
      placement === 'text' ? location.ancestors.slice(1) : location.ancestors,
    parent,
    path: location.path,
    placement,
    root: location.root,
    type:
      placement === 'text'
        ? (parent ?? 'text')
        : typeof (node as Readonly<Record<string, unknown>>).type === 'string'
          ? ((node as Readonly<Record<string, unknown>>).type as string)
          : 'element',
  };
};

export const createYjsPropertyLocationAt = (
  children: NodeList<Descendant>,
  path: Path,
  root: string | null,
  offset?: number
): YjsPropertyLocation => {
  let current = children;
  const ancestors: string[] = [];

  for (const index of path) {
    const parent = current.at(index);

    if (!parent || !NodeApi.isElement(parent)) {
      throw new Error(
        `Cannot resolve Yjs property parent context at ${path.join('.')}.`
      );
    }

    ancestors.unshift(String(parent.type ?? 'element'));
    current = parent.children;
  }

  return {
    ancestors,
    ...(offset === undefined ? {} : { offset }),
    path,
    root,
  };
};

export const indexYjsPropertyContexts = (
  children: NodeList<Descendant>,
  root: string | null,
  ranges?: ReadonlyArray<Readonly<{ from: number; to: number }>>,
  parent: Readonly<{ ancestors: readonly string[]; path: Path }> = {
    ancestors: [],
    path: [],
  }
): WeakMap<JsonNode, YjsPropertyContext> => {
  const contexts = new WeakMap<JsonNode, YjsPropertyContext>();

  const visit = (
    nodes: NodeList<Descendant>,
    innerParentPath: Path,
    ancestors: readonly string[],
    from = 0,
    to = nodes.length
  ): void => {
    for (let index = from; index < to; index++) {
      const node = nodes.at(index);

      if (!node) throw new Error('Cannot index a missing Yjs property node.');
      const path = [...innerParentPath, index];
      const context = createYjsPropertyContext(node, {
        ancestors,
        path,
        root,
      });

      contexts.set(node, context);

      if (NodeApi.isElement(node)) {
        visit(node.children, path, [context.type, ...ancestors]);
      }
    }
  };

  if (ranges) {
    for (const range of ranges) {
      visit(children, parent.path, parent.ancestors, range.from, range.to);
    }
  } else {
    visit(children, parent.path, parent.ancestors);
  }

  return contexts;
};

let nextNodeId = 0;
const nodeIdScope = Math.random().toString(36).slice(2);

const createYjsNodeId = (scope: string): string =>
  `${scope}-${(nextNodeId += 1)}`;

/**
 * A fresh node's id. The root index learns it when the node is inserted, since
 * a node Yjs has not integrated reads no attributes.
 */
export const assignFreshYjsNodeId = (node: YjsNode): string => {
  const id = createYjsNodeId(nodeIdScope);

  setYjsAttribute(node, YJS_NODE_ID_KEY, id);

  return id;
};

export const ensureYjsNodeId = (write: YjsWrite, node: YjsNode): string => {
  const currentId = node.getAttribute(YJS_NODE_ID_KEY);

  if (typeof currentId === 'string') {
    return currentId;
  }

  const id = createYjsNodeId(
    node.doc ? String(node.doc.clientID) : nodeIdScope
  );

  setYjsAttribute(node, YJS_NODE_ID_KEY, id);
  noteWrite(write)?.index.noteId(id, node);

  return id;
};

export const getYjsLength = (node: YjsNode): number => node.length;

export const noteYjsCutView = (
  write: YjsWrite,
  sourceId: string,
  cut: YjsViewCut
): void => {
  noteWrite(write)?.index.noteReferrer(sourceId, cut.view);
  scopeOf(write).notes.cuts.push(cut);
};

const isYjsContentNode = (value: unknown): value is YjsNode =>
  value instanceof Y.XmlElement || value instanceof Y.XmlText;

/** @internal */
export const readYjsChildrenNotingPlainList = (
  node: Y.XmlElement
): unknown[] => {
  const children = node.toArray();

  countCoreWork('yjsChildrenRead', children.length);
  notePlainYjsChildren(node, children, null);

  return children;
};

const getRawYjsChildren = (node: Y.XmlElement): YjsNode[] => {
  const rawChildren = readYjsChildrenNotingPlainList(node);
  const children = new Array<YjsNode>(rawChildren.length);
  let writeIndex = 0;
  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (isYjsContentNode(child)) {
      children[writeIndex] = child;
      writeIndex += 1;
    }
    index += 1;
  }

  children.length = writeIndex;

  return children;
};

export type PlainYjsChildren = Readonly<{
  shownNodeAt: (index: number) => Y.XmlElement | undefined;
  indexOfRawChild: (child: YjsNode) => number;
  length: number;
}>;

type PlainYjsList = PlainYjsChildren & {
  readonly ids: ReadonlySet<string>;
  joinsChecked: number;
  readonly placeholders: ReadonlyArray<
    readonly [placeholder: Y.XmlElement, node: YjsNode | null]
  >;
  placeholdersCheckedAt: number | null;
};

type PlainYjsLists = {
  readonly lists: WeakMap<Y.XmlElement, PlainYjsList | null>;
  reshapes: number;
  readonly shownBy: WeakMap<YjsNode, Y.XmlElement>;
};

const plainYjsListsByDoc = new WeakMap<Y.Doc, PlainYjsLists>();

const forEachReshapedYjsList = (
  transaction: Y.Transaction,
  visit: (element: Y.XmlElement) => void
): void => {
  for (const [type, keys] of transaction.changed) {
    if (!(type instanceof Y.XmlElement)) continue;
    for (const key of keys) {
      if (key === null) {
        visit(type);
      } else if (
        YJS_CHILD_VISIBILITY_KEYS.has(key) ||
        key === YJS_NODE_ID_KEY
      ) {
        visit(type);
        if (type.parent instanceof Y.XmlElement) visit(type.parent);
      }
    }
  }
};

const reshapingTransactions = new WeakSet<Y.Transaction>();

const reshapesYjsLists = (transaction: Y.Transaction): boolean => {
  if (reshapingTransactions.has(transaction)) return true;

  let reshapes = false;

  forEachReshapedYjsList(transaction, () => {
    reshapes = true;
  });
  if (reshapes) reshapingTransactions.add(transaction);

  return reshapes;
};

/**
 * The lists kept for `doc`, or null while an open transaction reshapes one:
 * an element that transaction creates records no change of its own, so no
 * list read before it ends can be kept.
 */
const plainYjsListsOf = (doc: Y.Doc | null): PlainYjsLists | null => {
  if (doc === null || doc._transactionCleanups.some(reshapesYjsLists)) {
    return null;
  }

  let room = plainYjsListsByDoc.get(doc);

  if (room === undefined) {
    const created: PlainYjsLists = {
      lists: new WeakMap(),
      reshapes: 0,
      shownBy: new WeakMap(),
    };

    // A peer's update, an undo or a load can reshape a list, and each runs in
    // a transaction whose observers read only after this event.
    doc.on('beforeObserverCalls', (transaction: Y.Transaction) => {
      let reshaped = false;

      forEachReshapedYjsList(transaction, (element) => {
        created.lists.delete(element);
        reshaped = true;
      });
      if (reshaped) created.reshapes += 1;
    });
    plainYjsListsByDoc.set(doc, created);
    room = created;
  }

  return room;
};

const isJoinedYjsId = (doc: Y.Doc, id: string): boolean =>
  getJoinedYjsLines(doc, id).length > 0 ||
  getYjsLinesJoinedAtEnd(doc, id).length > 0;

const takesJoinedYjsLines = (list: PlainYjsList, doc: Y.Doc): boolean => {
  const named = joinedYjsIds(doc);

  for (; list.joinsChecked < named.length; list.joinsChecked += 1) {
    const id = named[list.joinsChecked];

    if (list.ids.has(id) && isJoinedYjsId(doc, id)) return true;
  }

  return false;
};

const notePlainYjsChildren = (
  element: Y.XmlElement,
  rawChildren: readonly unknown[],
  projection: YjsProjection | null
): void => {
  const { doc } = element;
  const room = plainYjsListsOf(doc);

  if (doc === null || room === null || room.lists.has(element)) return;

  const { lists } = room;

  if (typeof element.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) === 'string') {
    lists.set(element, null);

    return;
  }

  const joined = hasJoinedYjsLines(doc);
  const children: Y.XmlElement[] = [];
  const indexes = new Map<YjsNode, number>();
  const shown = new Set<YjsNode>();
  const ids = new Set<string>();
  const placeholders: Array<readonly [Y.XmlElement, YjsNode | null]> = [];
  const noteId = (node: Y.XmlElement): boolean => {
    const id = node.getAttribute(YJS_NODE_ID_KEY);

    if (typeof id !== 'string') return true;
    ids.add(id);

    return !joined || !isJoinedYjsId(doc, id);
  };

  if (!noteId(element)) {
    lists.set(element, null);

    return;
  }
  for (const child of rawChildren) {
    if (!(child instanceof Y.XmlElement)) {
      lists.set(element, null);

      return;
    }
    if (child.getAttribute(YJS_HIDDEN_KEY) === true) continue;
    if (child.getAttribute(YJS_VIRTUAL_PLACEHOLDER_KEY) === true) {
      if (projection === null) return;

      const node = projection.slotNodeOf(child);

      placeholders.push([child, node]);
      if (node === null || shown.has(node)) continue;
      if (!(node instanceof Y.XmlElement) || !noteId(node)) {
        lists.set(element, null);

        return;
      }
      shown.add(node);
      room.shownBy.set(node, child);
      indexes.set(child, children.length);
      children.push(node);
      continue;
    }
    if (!noteId(child)) {
      lists.set(element, null);

      return;
    }
    shown.add(child);
    indexes.set(child, children.length);
    children.push(child);
  }
  countCoreWork('yjsChildrenRead', children.length);
  lists.set(element, {
    ids,
    indexOfRawChild: (child) => indexes.get(child) ?? -1,
    joinsChecked: joinedYjsIds(doc).length,
    length: children.length,
    placeholders,
    placeholdersCheckedAt: placeholders.length > 0 ? room.reshapes : null,
    shownNodeAt: (index) => children[index],
  });
};

/** @internal */
export const plainYjsChildren = (
  element: Y.XmlElement
): PlainYjsChildren | null => {
  const { doc } = element;
  const room = plainYjsListsOf(doc);

  if (doc === null || room === null) return null;

  const { lists } = room;
  const kept = lists.get(element);

  const projection = projectYjsRoot(rootOfYjsNode(element));

  if (
    kept &&
    kept.placeholdersCheckedAt !== null &&
    kept.placeholdersCheckedAt !== room.reshapes
  ) {
    if (
      kept.placeholders.every(
        ([placeholder, node]) => projection.slotNodeOf(placeholder) === node
      )
    ) {
      kept.placeholdersCheckedAt = room.reshapes;
    } else {
      lists.delete(element);
    }
  }
  if (!lists.has(element)) {
    notePlainYjsChildren(
      element,
      readYjsChildrenNotingPlainList(element),
      projection
    );
  }

  const list = lists.get(element);

  if (!list) return null;
  if (takesJoinedYjsLines(list, doc)) {
    lists.set(element, null);

    return null;
  }

  return list;
};

/** @internal */
export const keptYjsPlaceholderOf = (node: YjsNode): Y.XmlElement | null => {
  const room = plainYjsListsOf(node.doc);
  const placeholder = room?.shownBy.get(node);
  const parent = placeholder?.parent;
  const list =
    parent instanceof Y.XmlElement ? room?.lists.get(parent) : undefined;

  return placeholder &&
    list &&
    list.placeholdersCheckedAt === room?.reshapes &&
    list.shownNodeAt(list.indexOfRawChild(placeholder)) === node
    ? placeholder
    : null;
};

declare const yjsWriteBrand: unique symbol;

/**
 * The handle of an open write scope on a Yjs root. Every helper that hides or
 * deletes a Yjs node, or cuts a Yjs text, takes one, so such a write runs
 * inside a scope. Only `withYjsWrite` and `withYjsWrites` make one.
 *
 * @internal
 */
export type YjsWrite = Readonly<{
  [yjsWriteBrand]: true;
  root: Y.XmlElement;
}>;

declare const yjsSynchronizedIndexBrand: unique symbol;

/** @internal */
export type YjsSynchronizedIndex = RootProjectionIndex & {
  readonly [yjsSynchronizedIndexBrand]: true;
};

type YjsIndexReach = 'children' | 'ids';

type YjsLentIndex = Readonly<{
  /** The element this lowering made to show each id. */
  chosen: Map<string, Y.XmlElement>;
  index: RootProjectionIndex;
  reach: YjsIndexReach;
}>;

type YjsNotes = Readonly<{
  cuts: YjsViewCut[];
  deletedViews: YjsViewCut[];
  hidden: Set<YjsNode>;
  refTargets: Set<string>;
}>;

type YjsScope = {
  loan: YjsLentIndex | null;
  readonly notes: YjsNotes;
  settleLoan: YjsLentIndex | null;
  readonly write: YjsWrite | null;
};

const scopes = new Map<Y.XmlElement, YjsScope>();

const openYjsScope = (write: YjsWrite | null): YjsScope => ({
  loan: null,
  notes: {
    cuts: [],
    deletedViews: [],
    hidden: new Set(),
    refTargets: new Set(),
  },
  settleLoan: null,
  write,
});

const scopeOf = (write: YjsWrite): YjsScope => {
  const scope = scopes.get(write.root);

  if (scope?.write !== write) {
    throw new Error('A Yjs write ran outside its write scope.');
  }

  return scope;
};

const noteWrite = (write: YjsWrite): YjsLentIndex | null => {
  const scope = scopeOf(write);

  if (scope.loan === null) scope.settleLoan = null;

  return scope.loan;
};

const lend = <T>(
  scope: YjsScope,
  index: RootProjectionIndex,
  reach: YjsIndexReach,
  run: () => T
): T => {
  const previous = scope.loan;
  const loan = {
    chosen: new Map<string, Y.XmlElement>(),
    index,
    reach,
  };

  scope.loan = loan;
  scope.settleLoan = loan;
  try {
    return run();
  } finally {
    scope.loan = previous;
    if (scope.settleLoan === loan && previous !== null) {
      scope.settleLoan = previous;
    }
  }
};

/**
 * Runs `run` with a write scope open on each root it asks `writeOf` for.
 * Asking for a root that already has an open scope joins that scope, which
 * its opener ends. The caller runs this inside one Yjs transaction, so each
 * scope ends inside it.
 *
 * @internal
 */
export const withYjsWrites = <T>(
  run: (writeOf: (root: Y.XmlElement) => YjsWrite) => T
): T => {
  const opened: Y.XmlElement[] = [];
  const writeOf = (root: Y.XmlElement): YjsWrite => {
    const open = scopes.get(root);

    if (open) {
      if (open.write === null) {
        throw new Error('Cannot write a Yjs root while it is only read.');
      }

      return open.write;
    }

    const write = { root } as YjsWrite;

    scopes.set(root, openYjsScope(write));
    opened.push(root);

    return write;
  };
  let result: T;

  try {
    result = run(writeOf);
  } catch (error) {
    endYjsScopes(opened);
    throw error;
  }

  const failure = endYjsScopes(opened);

  if (failure) throw failure.error;

  return result;
};

const endYjsScopes = (
  roots: readonly Y.XmlElement[]
): Readonly<{ error: unknown }> | null => {
  let failure: Readonly<{ error: unknown }> | null = null;

  for (const root of roots) {
    const scope = scopes.get(root);

    try {
      if (scope) settleYjsScope(scope);
    } catch (error) {
      failure ??= { error };
    } finally {
      scopes.delete(root);
    }
  }

  return failure;
};

/**
 * Deletes the letters a scope's writes left that no text shows, and heals
 * each cut whose view never reached the document, so its letters join the
 * piece before it again. Only a node the writes hid, or that a removed
 * reference showed, can stop showing, so only those, the nodes they hold and
 * the nodes those show elsewhere are read.
 */
const settleYjsScope = (scope: YjsScope): void => {
  const { notes, write } = scope;

  if (write === null) return;
  if (
    notes.cuts.length === 0 &&
    notes.refTargets.size === 0 &&
    notes.hidden.size === 0 &&
    notes.deletedViews.length === 0
  ) {
    return;
  }

  scope.loan = scope.settleLoan;

  const { root } = write;

  for (const cut of notes.cuts) {
    if (cut.view._item === null) healYjsCutOf(cut);
  }

  const projection = projectYjsRoot(root);
  const shows = (node: YjsNode) => projection.shows(node);
  const pending: YjsNode[] = [...notes.hidden];
  const resolve = (id: string) => {
    const target = projection.lookup.resolve(id);

    if (target) pending.push(target);
  };
  const read = new Set<YjsNode>();
  const texts: Y.XmlText[] = [];

  for (const id of notes.refTargets) resolve(id);
  for (let node = pending.pop(); node; node = pending.pop()) {
    if (read.has(node)) continue;
    read.add(node);
    if (node.doc === null || isDeletedYjsNode(node) || shows(node)) continue;

    const stack: YjsNode[] = [node];

    for (let current = stack.pop(); current; current = stack.pop()) {
      if (current instanceof Y.XmlText) {
        texts.push(current);
        continue;
      }

      const ref = current.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

      if (typeof ref === 'string') resolve(ref);
      pushRawYjsChildren(stack, current);
    }
  }
  deleteUnshownYjsLetters(root, texts, notes.deletedViews, shows);
};

/**
 * Runs `run` in a write scope on `root`, inside one Yjs transaction of its
 * document, or in the scope already open on `root`.
 *
 * @internal
 */
export const withYjsWrite = <T>(
  root: Y.XmlElement,
  run: (write: YjsWrite) => T
): T => {
  const open = scopes.get(root)?.write;

  if (open) return run(open);

  const write = () => withYjsWrites((writeOf) => run(writeOf(root)));

  return root.doc ? root.doc.transact(write) : write();
};

/**
 * Runs `lower` with `index` answering for the children of the write's root
 * and resolving its tree's virtual references. The helpers' root writes keep
 * it current while `lower` runs.
 *
 * @internal
 */
export const withYjsRootIndex = <T>(
  write: YjsWrite,
  index: RootProjectionIndex,
  lower: () => T
): T => lend(scopeOf(write), index, 'children', lower);

const lendToRead = <T>(
  root: Y.XmlElement,
  index: RootProjectionIndex,
  reach: YjsIndexReach,
  read: () => T
): T => {
  const open = scopes.get(root);

  if (open) return lend(open, index, reach, read);

  const scope = openYjsScope(null);

  scopes.set(root, scope);
  try {
    return lend(scope, index, reach, read);
  } finally {
    scopes.delete(root);
  }
};

/** @internal */
export const withYjsRootIds = <T>(
  root: Y.XmlElement,
  index: RootProjectionIndex,
  read: () => T
): T => lendToRead(root, index, 'ids', read);

/** @internal */
export const withYjsSynchronizedIndex = <T>(
  root: Y.XmlElement,
  index: YjsSynchronizedIndex,
  read: () => T
): T => lendToRead(root, index, 'children', read);

const loanOf = (root: Y.XmlElement): YjsLentIndex | null =>
  scopes.get(root)?.loan ?? null;

const lentIndexOf = (parent: Y.XmlElement): RootProjectionIndex | null => {
  const loan = loanOf(parent);

  return loan?.reach === 'children' ? loan.index : null;
};

/** @internal */
export const indexedYjsRootChild = (
  root: Y.XmlElement,
  node: YjsNode
): number | null => lentIndexOf(root)?.indexOf(node) ?? null;

/**
 * What a root index is built from, or null for a root that shows a virtual
 * child of its own, which has no raw slot to index.
 *
 * @internal
 */
export const readYjsRootIndex = (
  root: Y.XmlElement
): Readonly<{ entries: RootSlotEntry[]; tree: YjsTreeRefs }> | null => {
  if (typeof root.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) === 'string') {
    return null;
  }

  const tree = readYjsTreeRefs(root);
  const rawChildren = getRawYjsChildren(root);
  const shown = new Map<number, YjsNode>();

  for (const slot of projectYjsRoot(root, lookupOf(tree)).slots(
    root,
    rawChildren
  )) {
    shown.set(slot.rawIndex, slot.node);
  }

  return {
    entries: rawChildren.map((raw, rawIndex) => ({
      raw,
      ref: placeholderRefOf(raw),
      shown: shown.get(rawIndex) ?? null,
    })),
    tree,
  };
};

const rebuildLentIndex = (write: YjsWrite): void => {
  const scope = scopeOf(write);

  if (scope.loan === null) return;

  const input = readYjsRootIndex(write.root);

  if (input === null) {
    scope.loan.index.reset([], { ids: new Map(), referrers: [] });
    scope.loan = null;
    scope.settleLoan = null;
  } else {
    scope.loan.index.reset(input.entries, input.tree);
  }
};

const noteInsertedIds = (index: RootProjectionIndex, node: YjsNode): void => {
  const stack: YjsNode[] = [node];

  for (let current = stack.pop(); current; current = stack.pop()) {
    const id = current.getAttribute(YJS_NODE_ID_KEY);

    if (typeof id === 'string') index.noteId(id, current);
    if (current instanceof Y.XmlElement) {
      for (const child of current.toArray()) {
        if (isYjsContentNode(child)) stack.push(child);
      }
    }
  }
};

const placeholderRefOf = (node: YjsNode): string | null => {
  const ref = node.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

  return node instanceof Y.XmlElement &&
    isVirtualYjsPlaceholder(node) &&
    typeof ref === 'string'
    ? ref
    : null;
};

/** @internal */
export const readYjsRootSlot = (
  root: Y.XmlElement,
  raw: YjsNode
): RootSlotEntry => ({
  raw,
  ref: placeholderRefOf(raw),
  shown: projectYjsRoot(root).slotNodeOf(raw),
});

/**
 * Whether a batch that changed the children of `root` can leave a duplicate
 * virtual reference or a redundant empty text among them. Only a placeholder
 * or an empty text it inserted at the root, a root child it inserted that a
 * root placeholder of `index` refers to, or a root text it truncated, can. The
 * rest were checked as they arrived, and a local lowering writes neither.
 *
 * @internal
 */
export const yjsRootNeedsNormalization = (
  root: Y.XmlElement,
  index: RootProjectionIndex,
  inserted: Iterable<YjsNode>,
  truncated: Iterable<Y.XmlText>
): boolean => {
  for (const node of inserted) {
    if (node.parent !== root) continue;

    const id = node.getAttribute(YJS_NODE_ID_KEY);

    if (
      placeholderRefOf(node) !== null ||
      isEmptyAttributeFreeYjsText(node) ||
      (typeof id === 'string' && index.references(id))
    ) {
      return true;
    }
  }
  for (const text of truncated) {
    if (text.parent === root) return true;
  }

  return false;
};

const insertRawYjsChildren = (
  write: YjsWrite,
  parent: Y.XmlElement,
  rawIndex: number,
  children: YjsNode[]
): void => {
  countCoreWork('yjsItemSteps', rawIndex);
  parent.insert(rawIndex, children);

  const loan = noteWrite(write);

  if (loan === null) return;
  for (const child of children) noteInsertedIds(loan.index, child);
  if (
    loan.reach === 'children' &&
    parent === write.root &&
    !loan.index.insert(
      rawIndex,
      children.map((child) => readYjsRootSlot(parent, child))
    )
  ) {
    rebuildLentIndex(write);
  }
};

const isUnder = (node: YjsNode, ancestors: ReadonlySet<YjsNode>): boolean => {
  let current: unknown = node;

  while (current instanceof Y.XmlElement || current instanceof Y.XmlText) {
    if (ancestors.has(current)) return true;
    current = current.parent;
  }

  return false;
};

const textsUnder = (
  node: YjsNode,
  enter: (node: YjsNode) => boolean
): Y.XmlText[] => {
  const texts: Y.XmlText[] = [];
  const stack: YjsNode[] = [node];

  for (let current = stack.pop(); current; current = stack.pop()) {
    if (!enter(current)) continue;
    if (current instanceof Y.XmlText) texts.push(current);
    else pushRawYjsChildren(stack, current);
  }

  return texts;
};

const rootOfYjsNode = (node: Y.XmlElement): Y.XmlElement => {
  let root = node;

  while (root.parent instanceof Y.XmlElement) root = root.parent;

  return root;
};

/**
 * Remove raw children of `parent`. A child that holds the source of a cut
 * whose view still shows outside the removed children stays, hidden, so the
 * view keeps its letters, and the scope's end deletes the letters the child
 * showed.
 */
const deleteYjsChildren = (
  write: YjsWrite,
  parent: Y.XmlElement,
  rawIndex: number,
  count: number
): void => {
  const children = parent.slice(rawIndex, rawIndex + count) as YjsNode[];
  const removed = new Set<YjsNode>(children);
  const projection = projectYjsRoot(rootOfYjsNode(parent));
  const losers = contestLosers(write, removed, true);
  const kept = children.map((child) =>
    textsUnder(child, () => true).some((text) =>
      cutViewsOf(text).some(
        (view) =>
          !isUnder(view, removed) && !projection.showsUnder(view, removed)
      )
    )
  );

  if (kept.includes(true)) {
    for (let index = count - 1; index >= 0; index--) {
      const child = children[index];

      if (!kept[index]) {
        deleteRawYjsChildren(write, parent, rawIndex + index, 1);
        continue;
      }

      writeYjsVisibility(write, child, YJS_HIDDEN_KEY, true);
    }
  } else {
    deleteRawYjsChildren(write, parent, rawIndex, count);
  }
  for (const loser of losers) dropYjsReferrer(write, loser);
};

/**
 * The one delete of a Yjs element's raw children. It notes what can outlive
 * them: the cut of each view they hold, whose letters stay in a source
 * elsewhere, and each node they refer to.
 */
const deleteRawYjsChildren = (
  write: YjsWrite,
  parent: Y.XmlElement,
  rawIndex: number,
  count: number
): void => {
  const { notes } = scopeOf(write);
  const stack = parent
    .slice(rawIndex, rawIndex + count)
    .filter(isYjsContentNode);

  for (let node = stack.pop(); node; node = stack.pop()) {
    if (node instanceof Y.XmlText) {
      const cut = cutOf(node);

      if (cut) notes.deletedViews.push({ ...cut, view: node });
      continue;
    }

    const ref = node.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

    if (typeof ref === 'string') notes.refTargets.add(ref);
    pushRawYjsChildren(stack, node);
  }

  const loan = noteWrite(write);

  if (loan?.reach === 'children' && parent === write.root) {
    loan.index.delete(rawIndex, count);
  }
  countCoreWork('yjsItemSteps', rawIndex);
  parent.delete(rawIndex, count);
};

/**
 * What a local lowering lent, whose root index records the contested ids a
 * write settles. A remote import never settles: the receiving peer reads the
 * writer's settling deletes as a change to the placeholders.
 */
const localLending = (write: YjsWrite): YjsLentIndex | null => {
  const { loan } = scopeOf(write);

  return loan?.reach === 'children' ? loan : null;
};

/**
 * For each node several elements show, one of them shown under `part`: the
 * elements a write to `part` deletes, so the node stays where this lowering
 * put it, else where it shows now. A removal takes the elements shown under
 * `part` with it, so they are not listed.
 */
const contestLosers = (
  write: YjsWrite,
  part: ReadonlySet<YjsNode>,
  removal: boolean
): Y.XmlElement[] => {
  const lending = localLending(write);

  if (lending === null) return [];

  const losers: Y.XmlElement[] = [];
  const projection = projectYjsRoot(write.root);

  for (const id of lending.index.contestedIds()) {
    const elements = lending.index
      .referrersOf(id)
      .filter((node): node is Y.XmlElement => node instanceof Y.XmlElement);
    const under = elements.filter((element) =>
      projection.showsUnder(element, part)
    );

    if (elements.length < 2 || under.length === 0) continue;

    const chosen = lending.chosen.get(id);
    const kept =
      chosen !== undefined && !isDeletedYjsNode(chosen)
        ? chosen
        : projection.referrerOf(id);

    for (const element of elements) {
      if (element !== kept && !(removal && under.includes(element))) {
        losers.push(element);
      }
    }
  }

  return losers;
};

/** Stops `element` showing the node it refers to. */
const dropYjsReferrer = (write: YjsWrite, element: Y.XmlElement): void => {
  const { parent } = element;

  if (isDeletedYjsNode(element)) return;
  if (!isVirtualYjsPlaceholder(element) || !(parent instanceof Y.XmlElement)) {
    writeYjsVisibility(write, element, YJS_VIRTUAL_CHILD_ID_KEY, null);

    return;
  }

  deleteRawYjsChildren(write, parent, rawIndexIn(parent, element), 1);
};

/**
 * Writes or removes one of `YJS_CHILD_VISIBILITY_KEYS` on `node`, so the lent
 * index follows what `node` shows in its parent, and notes the node it may
 * stop showing.
 */
const writeYjsVisibility = (
  write: YjsWrite,
  node: YjsNode,
  key: string,
  value: string | true | null
): void => {
  const { notes } = scopeOf(write);

  if (key === YJS_HIDDEN_KEY && value === true) notes.hidden.add(node);
  if (node.doc && key !== YJS_HIDDEN_KEY) {
    const ref = node.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

    if (
      typeof ref === 'string' &&
      ref !== value &&
      (key === YJS_VIRTUAL_CHILD_ID_KEY || value === null)
    ) {
      notes.refTargets.add(ref);
    }
  }
  if (value === null) {
    node.removeAttribute(key);
  } else {
    node.setAttribute(key, value);
  }

  const loan = noteWrite(write);

  if (
    key === YJS_VIRTUAL_CHILD_ID_KEY &&
    typeof value === 'string' &&
    node instanceof Y.XmlElement
  ) {
    loan?.index.noteReferrer(value, node);
    // A local write shows the node where the user put it, so removing the
    // move's source keeps this element and drops the node's other ones.
    if (loan?.reach === 'children') loan.chosen.set(value, node);
  }

  const { parent } = node;

  if (
    loan?.reach === 'children' &&
    parent === write.root &&
    !loan.index.show(readYjsRootSlot(write.root, node))
  ) {
    rebuildLentIndex(write);
  }
};

const pushRawYjsChildren = (target: YjsNode[], node: Y.XmlElement): void => {
  const rawChildren = readYjsChildrenNotingPlainList(node);
  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (isYjsContentNode(child)) {
      target.push(child);
    }
    index += 1;
  }
};

const isHiddenYjsNode = (node: YjsNode): boolean =>
  getYjsAttributes(node)[YJS_HIDDEN_KEY] === true;

export const isEmptyAttributeFreeYjsText = (node: YjsNode): boolean =>
  node instanceof Y.XmlText &&
  getYjsLength(node) === 0 &&
  Object.keys(getYjsAttributes(node)).every(
    (key) => key === YJS_NODE_ID_KEY || isYjsMarkRecordKey(key)
  );

/**
 * The same test for a text as a line shows it: a placeholder shows the text
 * it hides where it sits, so the hidden flag does not count.
 */
export const isEmptyAttributeFreeShownYjsText = (node: YjsNode): boolean =>
  node instanceof Y.XmlText &&
  getYjsLength(node) === 0 &&
  Object.keys(getYjsAttributes(node)).every(
    (key) =>
      key === YJS_HIDDEN_KEY ||
      key === YJS_NODE_ID_KEY ||
      isYjsMarkRecordKey(key)
  );

const copyRecordAttributes = (
  target: YjsAttributeRecord,
  source: Readonly<YjsAttributeRecord>,
  skipKey?: string,
  secondSkipKey?: string
): void => {
  for (const key in source) {
    if (
      !Object.hasOwn(source, key) ||
      key === skipKey ||
      key === secondSkipKey
    ) {
      continue;
    }

    target[key] = source[key];
  }
};

/**
 * A child an element shows and its raw index. A strand's raw index is in
 * `owner`, the joined line that holds it.
 */
type YjsVisibleChildSlot = {
  readonly node: YjsNode;
  readonly owner?: Y.XmlElement;
  readonly rawIndex: number;
};

type YjsChildRemovalMode = 'hidden' | 'hidden-parent' | 'visible';

/** A root tree's nodes by `yjs:id`, and the nodes noted as showing each id. */
type YjsTreeLookup = Readonly<{
  referrers: (id: string) => readonly YjsNode[];
  resolve: (id: string) => YjsNode | null;
}>;

type YjsJoinedPlace =
  | Readonly<{ anchor: YjsNode; kind: 'strand' }>
  | Readonly<{ kind: 'end'; line: Y.XmlElement }>;

type YjsShownStep =
  | Readonly<{ kind: 'child'; parent: Y.XmlElement }>
  | Readonly<{ kind: 'slot'; placeholder: Y.XmlElement }>
  | Readonly<{ kind: 'virtual'; element: Y.XmlElement }>
  | YjsJoinedPlace;

const stepTarget = (step: YjsShownStep): YjsNode => {
  if (step.kind === 'child') return step.parent;
  if (step.kind === 'slot') return step.placeholder;
  if (step.kind === 'virtual') return step.element;
  if (step.kind === 'end') return step.line;

  return step.anchor;
};

const showsInsideStepTarget = (step: YjsShownStep): boolean =>
  step.kind !== 'strand';

type YjsWalkResult = 'continue' | 'stop';

type YjsReferenceReads = Readonly<{
  placeOf: (line: Y.XmlElement) => YjsJoinedPlace | null;
  referrerOf: (id: string) => Y.XmlElement | null;
}>;

const isVirtualYjsPlaceholder = (node: YjsNode): boolean =>
  node instanceof Y.XmlElement &&
  getYjsAttributes(node)[YJS_VIRTUAL_PLACEHOLDER_KEY] === true;

const isVirtualYjsPlaceholderChild = (node: YjsNode): boolean =>
  node.parent instanceof Y.XmlElement && isVirtualYjsPlaceholder(node.parent);

const hasRawYjsChildSlot = (slot: YjsVisibleChildSlot): boolean =>
  slot.rawIndex !== VIRTUAL_YJS_CHILD_RAW_INDEX;

const isDeletedYjsNode = (node: YjsNode): boolean =>
  node._item?.deleted === true;

const rawIndexIn = (parent: Y.XmlElement, child: YjsNode): number => {
  let index = 0;

  for (let item = parent._start; item !== null; item = item.right) {
    countCoreWork('yjsItemSteps');
    if (item.deleted || !item.countable) continue;
    if (item.content instanceof Y.ContentType && item.content.type === child) {
      return index;
    }
    index += 1;
  }

  return -1;
};

type YjsPlaceStep = Readonly<{ child: YjsNode; parent: Y.XmlElement }> | number;

const positionOfStep = (step: YjsPlaceStep): number =>
  typeof step === 'number' ? step : rawIndexIn(step.parent, step.child);

const compareSiblings = (left: YjsNode, right: YjsNode): number => {
  for (
    let after = left._item?.right ?? null, before = left._item?.left ?? null;
    after !== null || before !== null;
  ) {
    if (after !== null) {
      countCoreWork('yjsItemSteps');
      if (
        after.content instanceof Y.ContentType &&
        after.content.type === right
      ) {
        return -1;
      }
      after = after.right;
    }
    if (before !== null) {
      countCoreWork('yjsItemSteps');
      if (
        before.content instanceof Y.ContentType &&
        before.content.type === right
      ) {
        return 1;
      }
      before = before.left;
    }
  }

  return 0;
};

const compareDocumentPositions = (
  left: readonly YjsPlaceStep[],
  right: readonly YjsPlaceStep[]
): number => {
  for (let depth = 0; depth < Math.min(left.length, right.length); depth++) {
    const a = left[depth];
    const b = right[depth];

    if (
      typeof a !== 'number' &&
      typeof b !== 'number' &&
      a.parent === b.parent
    ) {
      if (a.child !== b.child) return compareSiblings(a.child, b.child);
      continue;
    }

    const order = positionOfStep(a) - positionOfStep(b);

    if (order !== 0) return order;
  }

  return left.length - right.length;
};

const compareYjsItemIds = (left: YjsNode, right: YjsNode): number => {
  const a = left._item?.id;
  const b = right._item?.id;

  if (!a || !b) return 0;

  return a.client === b.client ? a.clock - b.clock : a.client - b.client;
};

const endPositionOf = (host: YjsNode, line: Y.XmlElement): number => {
  const id = line.getAttribute(YJS_NODE_ID_KEY);
  const hosts =
    typeof id === 'string' ? getYjsLinesJoinedAtEnd(line.doc, id) : [];

  return (
    getYjsLength(line) +
    hosts.filter((other) => compareYjsItemIds(other, host) < 0).length
  );
};

/** @internal */
export class YjsProjection {
  readonly lookup: YjsTreeLookup;
  readonly root: Y.XmlElement;

  constructor(root: Y.XmlElement, lookup: YjsTreeLookup) {
    this.root = root;
    this.lookup = lookup;
  }

  children(element: Y.XmlElement): YjsNode[] {
    const index = lentIndexOf(element);

    if (index !== null) {
      countCoreWork('yjsChildrenRead', index.length);

      return index.slice(0);
    }

    return this.slots(element).map((slot) => slot.node);
  }

  slots(
    element: Y.XmlElement,
    rawChildren?: readonly YjsNode[]
  ): readonly YjsVisibleChildSlot[] {
    const slots: YjsVisibleChildSlot[] = [];

    this.walk(
      element,
      (slot) => {
        slots.push(slot);

        return 'continue';
      },
      rawChildren ?? getRawYjsChildren(element)
    );

    return slots;
  }

  slotAt(
    element: Y.XmlElement,
    index: number
  ): YjsVisibleChildSlot | undefined {
    if (typeof index !== 'number' || index < 0) return undefined;

    const rootIndex = lentIndexOf(element);

    if (rootIndex !== null) return rootIndex.slotAt(index);

    let found: YjsVisibleChildSlot | undefined;
    let visibleIndex = 0;

    this.walk(
      element,
      (slot) => {
        if (visibleIndex === index) found = slot;
        visibleIndex += 1;

        return found === undefined ? 'continue' : 'stop';
      },
      getRawYjsChildren(element)
    );

    return found;
  }

  slotNodeOf(raw: YjsNode): YjsNode | null {
    if (isHiddenYjsNode(raw)) return null;
    if (raw instanceof Y.XmlElement && isVirtualYjsPlaceholder(raw)) {
      return this.virtualChildOf(raw);
    }

    return raw;
  }

  referrerOf(id: string): Y.XmlElement | null {
    return this.lastPlacedReferrer(this.lookup.referrers(id), new Set(), id);
  }

  anchorOf(line: Y.XmlElement): YjsNode | null {
    return this.readAnchor(line, this);
  }

  placeOf(line: Y.XmlElement): YjsJoinedPlace | null {
    return this.readPlace(line, this);
  }

  shows(node: YjsNode): boolean {
    const read = new Set<YjsNode>();

    for (let current = node; current !== this.root;) {
      if (read.has(current)) return false;
      read.add(current);

      const step = this.stepUp(current, this);

      if (step === null) return false;
      current = stepTarget(step);
    }

    return true;
  }

  showsUnder(node: YjsNode, part: ReadonlySet<YjsNode>): boolean {
    const read = new Set<YjsNode>();

    for (let current = node, inside = true; ;) {
      if (inside && part.has(current)) return true;
      if (current === this.root || read.has(current)) return false;
      read.add(current);

      const step = this.stepUp(current, this);

      if (step === null) return false;
      current = stepTarget(step);
      inside = showsInsideStepTarget(step);
    }
  }

  private walk(
    node: Y.XmlElement,
    visit: (slot: YjsVisibleChildSlot) => YjsWalkResult,
    rawChildren: readonly YjsNode[],
    visibleNodes = new Set<YjsNode>(),
    expanding = new Set<Y.XmlElement>()
  ): YjsWalkResult {
    const joined = hasJoinedYjsLines(node.doc);
    const expand = (hosts: readonly Y.XmlElement[]): YjsWalkResult => {
      for (const host of hosts) {
        expanding.add(host);

        const result = this.walk(
          host,
          (strand) => visit(strand.owner ? strand : { ...strand, owner: host }),
          getRawYjsChildren(host),
          visibleNodes,
          expanding
        );

        expanding.delete(host);
        if (result === 'stop') return 'stop';
      }

      return 'continue';
    };
    const emit = (slot: YjsVisibleChildSlot): YjsWalkResult => {
      visibleNodes.add(slot.node);
      if (visit(slot) === 'stop') return 'stop';

      return joined
        ? expand(this.strandHostsAfter(slot.node, expanding))
        : 'continue';
    };

    if (!isVirtualYjsPlaceholder(node)) {
      const virtualChild = this.virtualChildOf(node);

      if (
        virtualChild !== null &&
        emit({ node: virtualChild, rawIndex: VIRTUAL_YJS_CHILD_RAW_INDEX }) ===
          'stop'
      ) {
        return 'stop';
      }
    }

    for (let rawIndex = 0; rawIndex < rawChildren.length; rawIndex += 1) {
      const child = rawChildren[rawIndex];
      const shown = this.slotNodeOf(child);

      if (
        shown === null ||
        (isVirtualYjsPlaceholder(child) && visibleNodes.has(shown))
      ) {
        continue;
      }
      if (emit({ node: shown, rawIndex }) === 'stop') return 'stop';
    }

    return joined ? expand(this.endHostsOf(node, expanding)) : 'continue';
  }

  virtualChildOf(
    node: Y.XmlElement,
    visited = new Set<Y.XmlElement>()
  ): YjsNode | null {
    const id = node.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

    if (typeof id !== 'string' || visited.has(node)) return null;
    visited.add(node);

    const listed = this.lookup.referrers(id);
    const shownBy = listed.includes(node)
      ? this.referrerOf(id)
      : this.lastPlacedReferrer([...listed, node], new Set(), id);

    if (shownBy !== node) return null;

    const target = this.lookup.resolve(id);

    return target instanceof Y.XmlElement && isVirtualYjsPlaceholder(target)
      ? this.virtualChildOf(target, visited)
      : target;
  }

  private strandHostsAfter(
    shown: YjsNode,
    expanding: ReadonlySet<Y.XmlElement>
  ): Y.XmlElement[] {
    const id = shown.getAttribute(YJS_NODE_ID_KEY);
    const source =
      shown instanceof Y.XmlText
        ? shown.getAttribute(YJS_CUT_SOURCE_KEY)
        : null;
    const candidates = [
      ...(typeof id === 'string' ? getJoinedYjsLines(shown.doc, id) : []),
      ...(typeof source === 'string'
        ? getJoinedYjsLines(shown.doc, source)
        : []),
    ];

    if (candidates.length === 0) return candidates;

    return candidates
      .filter((host) => !expanding.has(host) && this.anchorOf(host) === shown)
      .sort(compareYjsItemIds);
  }

  private endHostsOf(
    line: Y.XmlElement,
    expanding: ReadonlySet<Y.XmlElement>
  ): Y.XmlElement[] {
    const id = line.getAttribute(YJS_NODE_ID_KEY);
    const candidates =
      typeof id === 'string' ? getYjsLinesJoinedAtEnd(line.doc, id) : [];

    return candidates
      .filter((host) => {
        if (host === line || expanding.has(host)) return false;

        const place = this.placeOf(host);

        return place?.kind === 'end' && place.line === line;
      })
      .sort(compareYjsItemIds);
  }

  private stepUp(node: YjsNode, reads: YjsReferenceReads): YjsShownStep | null {
    if (isDeletedYjsNode(node)) return null;
    if (isHiddenYjsNode(node)) {
      const id = node.getAttribute(YJS_NODE_ID_KEY);
      const shownBy = typeof id === 'string' ? reads.referrerOf(id) : null;

      if (shownBy !== null) {
        return isVirtualYjsPlaceholder(shownBy)
          ? { kind: 'slot', placeholder: shownBy }
          : { kind: 'virtual', element: shownBy };
      }

      return node instanceof Y.XmlElement ? reads.placeOf(node) : null;
    }

    const { parent } = node;

    if (
      !(parent instanceof Y.XmlElement) ||
      isVirtualYjsPlaceholderChild(node)
    ) {
      return null;
    }

    return { kind: 'child', parent };
  }

  private positionOf(
    node: YjsNode,
    reads: YjsReferenceReads
  ): YjsPlaceStep[] | null {
    const position: YjsPlaceStep[] = [];
    const read = new Set<YjsNode>();

    for (let current = node; ;) {
      if (isDeletedYjsNode(current)) return null;
      if (!(current.parent instanceof Y.XmlElement)) return position.reverse();
      if (read.has(current)) return null;
      read.add(current);

      const step = this.stepUp(current, reads);

      if (step === null) return null;
      if (step.kind === 'child') {
        position.push({ child: current, parent: step.parent });
      } else if (step.kind === 'virtual') {
        position.push(VIRTUAL_YJS_CHILD_RAW_INDEX);
      } else if (step.kind === 'strand') {
        position.push(JOINED_LINE_POSITION);
      } else if (step.kind === 'end') {
        position.push(endPositionOf(current, step.line));
      }
      current = stepTarget(step);
    }
  }

  private readsWhileResolving(resolving: Set<string>): YjsReferenceReads {
    const reads: YjsReferenceReads = {
      placeOf: (line) => this.readPlace(line, reads),
      referrerOf: (id) =>
        this.lastPlacedReferrer(this.lookup.referrers(id), resolving, id),
    };

    return reads;
  }

  private lastPlacedReferrer(
    referrers: readonly YjsNode[],
    resolving: Set<string>,
    id: string
  ): Y.XmlElement | null {
    const elements = referrers.filter(
      (referrer): referrer is Y.XmlElement =>
        referrer instanceof Y.XmlElement &&
        !isDeletedYjsNode(referrer) &&
        !isHiddenYjsNode(referrer) &&
        referrer.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) === id
    );

    if (elements.length <= 1) return elements[0] ?? null;
    if (resolving.has(id)) return null;

    resolving.add(id);

    const reads = this.readsWhileResolving(resolving);
    let shown: Y.XmlElement | null = null;
    let shownAt: YjsPlaceStep[] | null = null;

    for (const element of elements) {
      const at = this.positionOf(element, reads);

      if (at === null) continue;

      const order =
        shownAt === null ? 1 : compareDocumentPositions(at, shownAt);

      if (
        shown === null ||
        order > 0 ||
        (order === 0 && compareYjsItemIds(element, shown) > 0)
      ) {
        shown = element;
        shownAt = at;
      }
    }
    resolving.delete(id);

    return shown;
  }

  private readPlace(
    line: Y.XmlElement,
    reads: YjsReferenceReads
  ): YjsJoinedPlace | null {
    const anchor = this.readAnchor(line, reads);
    const endId = line.getAttribute(YJS_JOINED_END_KEY);

    if (typeof endId !== 'string') {
      return anchor ? { anchor, kind: 'strand' } : null;
    }

    const anchorId = anchor?.getAttribute(YJS_NODE_ID_KEY);
    const unshown =
      anchor !== null &&
      isHiddenYjsNode(anchor) &&
      (typeof anchorId !== 'string' || reads.referrerOf(anchorId) === null);

    if (anchor && !unshown) return { anchor, kind: 'strand' };

    const lineId = line.getAttribute(YJS_NODE_ID_KEY);

    if (
      !isHiddenYjsNode(line) ||
      (typeof lineId === 'string' && reads.referrerOf(lineId) !== null)
    ) {
      return null;
    }

    const into = this.lookup.resolve(endId);

    return into instanceof Y.XmlElement ? { kind: 'end', line: into } : null;
  }

  private readAnchor(
    line: Y.XmlElement,
    reads: YjsReferenceReads
  ): YjsNode | null {
    const anchorId = line.getAttribute(YJS_JOINED_AFTER_KEY);
    const lineId = line.getAttribute(YJS_NODE_ID_KEY);

    if (
      typeof anchorId !== 'string' ||
      !isHiddenYjsNode(line) ||
      (typeof lineId === 'string' && reads.referrerOf(lineId) !== null)
    ) {
      return null;
    }

    const anchor = this.lookup.resolve(anchorId);

    if (!(anchor instanceof Y.XmlText) || anchor.length === 0) return anchor;

    const end = line.getAttribute(YJS_JOINED_BEFORE_KEY);
    const cuts = yjsCutsBefore(anchor, typeof end === 'string' ? end : null);

    if (cuts.length === 0) return anchor;

    const views = new Map<string, Y.XmlText>();

    for (const view of this.lookup.referrers(anchorId)) {
      if (!(view instanceof Y.XmlText)) continue;

      const cut = cutOf(view);

      if (cut?.source === anchor) views.set(cut.key, view);
    }

    for (const key of cuts.toReversed()) {
      const view = views.get(key);

      if (view) return view;
    }

    return anchor;
  }
}

/** @internal */
export const projectYjsRoot = (
  root: Y.XmlElement,
  lookup = createLazyYjsTreeLookup(root)
): YjsProjection => new YjsProjection(root, lookup);

export const getYjsVisibleChildren = (
  root: Y.XmlElement,
  node: Y.XmlElement
): YjsNode[] => projectYjsRoot(root).children(node);

export type YjsVisibleChildrenReader = (node: Y.XmlElement) => YjsNode[];

export type YjsTextPoint = {
  readonly childIndex: number;
  readonly offset: number;
  readonly parent: Y.XmlElement;
  readonly text: Y.XmlText;
};

export const getYjsVisibleChild = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  index: number
): YjsNode | undefined => projectYjsRoot(root).slotAt(node, index)?.node;

export const createYjsVisibleChildrenReader = (
  root: Y.XmlElement
): YjsVisibleChildrenReader => {
  const projection = projectYjsRoot(root);

  return (node) => projection.children(node);
};

export const getYjsVisiblePath = (
  root: Y.XmlElement,
  target: YjsNode
): Path | null => {
  const projection = projectYjsRoot(root);
  const path: number[] = [];
  const visit = (node: YjsNode, visited: Set<YjsNode>): Path | null => {
    if (node === target) {
      return copyPath(path);
    }
    if (!(node instanceof Y.XmlElement) || visited.has(node)) {
      return null;
    }

    visited.add(node);

    const children = projection.children(node);

    let index = 0;

    while (index < children.length) {
      const child = children[index];

      if (child === undefined) {
        index += 1;
        continue;
      }

      path.push(index);
      const childPath = visit(child, visited);
      path.pop();

      if (childPath !== null) {
        return childPath;
      }
      index += 1;
    }

    return null;
  };

  return visit(root, new Set());
};

const createYjsNodeAttributes = (
  node: Descendant,
  isSetValued: YjsSetPropertyResolver,
  context: YjsPropertyContext,
  ...excluded: readonly string[]
): YjsAttributeRecord => {
  const attributes: YjsAttributeRecord = {};
  const excludedSet = new Set(excluded);
  const storageOf = yjsKeyStorageOf(isSetValued, node, context);

  for (const key in node) {
    if (!Object.hasOwn(node, key) || excludedSet.has(key)) continue;

    assertPublicYjsAttributeCanBeSet(key);

    const value = (node as Readonly<Record<string, unknown>>)[key];
    const storage = storageOf(key);

    if (storage === 'members' || storage === 'placed-members') {
      if (!Array.isArray(value)) {
        throw new Error(`Set-valued Yjs property "${key}" must be an array.`);
      }

      Object.assign(attributes, encodeYjsSetValueAttributes(key, value));
      // An empty list writes no member attributes and would read back as
      // absent, so it is stored as a plain value, as on a line moved here.
      if (storage === 'placed-members' && value.length === 0) {
        attributes[key] = value;
      }
    } else {
      attributes[key] = value;
      if (storage === 'placed-value') {
        Object.assign(
          attributes,
          encodeYjsSetValueAttributes(key, Array.isArray(value) ? value : [])
        );
      }
    }
  }

  return attributes;
};

export const createYjsNode = (
  node: Descendant,
  isSetValued: YjsSetPropertyResolver = noSetProperties,
  context = createYjsPropertyContext(node, rootPropertyLocation())
): YjsNode => {
  if (NodeApi.isText(node)) {
    return createYjsTextChain(
      [node],
      createYjsRunEncoder(isSetValued, {
        ancestors: context.parent
          ? [context.parent, ...context.ancestors]
          : context.ancestors,
        path: context.path.slice(0, -1),
        root: context.root,
        offset: context.path.at(-1) ?? 0,
      })
    );
  }

  const attributes = createYjsNodeAttributes(
    node,
    isSetValued,
    context,
    'children',
    'type'
  );
  const element = new Y.XmlElement(YJS_ELEMENT_NODE_NAME);

  assignFreshYjsNodeId(element);
  setYjsAttribute(element, 'type', String(node.type ?? 'element'));
  setYjsAttributes(element, attributes);

  if (node.children.length > 0) {
    element.insert(
      0,
      createYjsNodes(node.children, isSetValued, {
        ancestors: [context.type, ...context.ancestors],
        path: context.path,
        root: context.root,
      })
    );
  }

  return element;
};

export const createYjsNodes = (
  nodes: readonly Descendant[],
  isSetValued: YjsSetPropertyResolver = noSetProperties,
  location: YjsPropertyLocation = rootPropertyLocation()
): YjsNode[] =>
  segmentPliteChildren(nodes).map((segment) =>
    segment.kind === 'text'
      ? createYjsTextChain(
          segment.leaves,
          createYjsRunEncoder(isSetValued, {
            ...location,
            offset: (location.offset ?? 0) + segment.from,
          })
        )
      : createYjsNode(
          segment.node,
          isSetValued,
          createYjsPropertyContext(segment.node, {
            ...location,
            path: [...location.path, (location.offset ?? 0) + segment.from],
          })
        )
  );

export const replaceYjsChildren = (
  write: YjsWrite,
  parent: Y.XmlElement,
  children: readonly Descendant[],
  isSetValued: YjsSetPropertyResolver = noSetProperties,
  location: YjsPropertyLocation = rootPropertyLocation()
): void => {
  const length = getYjsLength(parent);

  writeYjsVisibility(write, parent, YJS_VIRTUAL_CHILD_ID_KEY, null);

  if (length > 0) {
    deleteYjsChildren(write, parent, 0, length);
  }

  if (children.length > 0) {
    insertRawYjsChildren(
      write,
      parent,
      0,
      createYjsNodes(children, isSetValued, location)
    );
  }
};

const EMPTY_YJS_VALUE = Object.freeze([]) as readonly Descendant[];

export const readPliteValueFromYjs = (
  root: Y.XmlElement,
  emptyValue: readonly Descendant[] = EMPTY_YJS_VALUE,
  admitsText: YjsTextAdmission = admitsAnyText,
  isSetValued: YjsSetPropertyResolver = noSetProperties
): Descendant[] => {
  const projection = projectYjsRoot(root);
  const children = segmentYjsChildren(projection.children(root)).flatMap(
    (segment) =>
      segment.kind === 'text'
        ? readTextRuns(segment.chain)
        : [
            readPliteNodeThrough(
              projection,
              segment.node,
              admitsText,
              isSetValued
            ),
          ]
  );

  return children.length > 0 ? children : [...emptyValue];
};

export const readPliteNodeFromYjs = (
  root: Y.XmlElement,
  node: YjsNode,
  admitsText: YjsTextAdmission = admitsAnyText,
  isSetValued: YjsSetPropertyResolver = noSetProperties
): Descendant =>
  readPliteNodeThrough(projectYjsRoot(root), node, admitsText, isSetValued);

const removeDuplicateVirtualYjsChildReferences = (
  write: YjsWrite,
  parent: Y.XmlElement,
  projection: YjsProjection,
  removed: Set<YjsNode>
): void => {
  const visibleNodes = new Set<YjsNode>();

  if (!isVirtualYjsPlaceholder(parent)) {
    const virtualChild = projection.virtualChildOf(parent);

    if (virtualChild !== null) visibleNodes.add(virtualChild);
  }

  const rawChildren = getRawYjsChildren(parent);
  let deleted = 0;

  for (let rawIndex = 0; rawIndex < rawChildren.length; rawIndex++) {
    const child = rawChildren[rawIndex];

    if (child === undefined || isHiddenYjsNode(child)) continue;

    if (child instanceof Y.XmlElement && isVirtualYjsPlaceholder(child)) {
      const virtualChild = projection.virtualChildOf(child);

      if (virtualChild !== null && visibleNodes.has(virtualChild)) {
        deleteYjsChildren(write, parent, rawIndex - deleted, 1);
        removed.add(child);
        deleted += 1;
      } else if (virtualChild !== null) {
        visibleNodes.add(virtualChild);
      }

      continue;
    }

    visibleNodes.add(child);
  }
};

const removeRedundantEmptyYjsTextChildren = (
  write: YjsWrite,
  parent: Y.XmlElement,
  projection: YjsProjection,
  removed: Set<YjsNode>
): void => {
  removeDuplicateVirtualYjsChildReferences(write, parent, projection, removed);

  if (parent !== write.root) return;

  const visibleSlots = projection.slots(parent);

  if (visibleSlots.length <= 1) return;

  let slotIndex = visibleSlots.length - 1;

  while (slotIndex >= 0) {
    const slot = visibleSlots[slotIndex];

    if (
      slot !== undefined &&
      hasRawYjsChildSlot(slot) &&
      isEmptyAttributeFreeYjsText(slot.node)
    ) {
      removed.add(slot.node);
      deleteYjsChildren(write, parent, slot.rawIndex, 1);
    }
    slotIndex -= 1;
  }
};

const removeRedundantEmptyYjsTextTree = (
  write: YjsWrite,
  parent: Y.XmlElement,
  projection: YjsProjection,
  removed: Set<YjsNode>,
  visited: Set<Y.XmlElement>
): void => {
  if (visited.has(parent)) return;

  visited.add(parent);

  const rawChildren = getRawYjsChildren(parent);
  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (child instanceof Y.XmlElement) {
      removeRedundantEmptyYjsTextTree(
        write,
        child,
        projection,
        removed,
        visited
      );
    }
    index += 1;
  }

  removeRedundantEmptyYjsTextChildren(write, parent, projection, removed);
};

export const removeRedundantEmptyYjsTextNodes = (write: YjsWrite): void => {
  removeRedundantEmptyYjsTextTree(
    write,
    write.root,
    projectYjsRoot(write.root),
    new Set(),
    new Set()
  );
};

export const removeRedundantEmptyYjsTextNodesAt = (
  write: YjsWrite,
  parents: ReadonlySet<Y.XmlElement>,
  recursiveRoots: ReadonlySet<Y.XmlElement>
): ReadonlySet<YjsNode> => {
  const projection = projectYjsRoot(write.root);
  const removed = new Set<YjsNode>();
  const visited = new Set<Y.XmlElement>();

  for (const recursiveRoot of recursiveRoots) {
    removeRedundantEmptyYjsTextTree(
      write,
      recursiveRoot,
      projection,
      removed,
      visited
    );
  }
  for (const parent of parents) {
    removeRedundantEmptyYjsTextChildren(write, parent, projection, removed);
  }

  return removed;
};

const getPublicYjsElementAttributes = (
  attributes: Readonly<YjsAttributeRecord>,
  isSetValued: YjsSetPropertyResolver
): YjsAttributeRecord => {
  const publicAttributes: YjsAttributeRecord = {};
  const entries = readYjsSetValueAttributes(attributes);

  for (const key in attributes) {
    if (!Object.hasOwn(attributes, key) || isReservedYjsKey(key)) {
      continue;
    }

    publicAttributes[key] = attributes[key];
  }

  const isEdited = (key: string) =>
    getYjsSetEditAttributeKeys(attributes, key).length > 0;

  for (const key of Object.keys(publicAttributes)) {
    if (
      !Object.hasOwn(entries, key) &&
      isSetValued.isPlaceDependent(key) &&
      isEdited(key)
    ) {
      delete publicAttributes[key];
    }
  }

  for (const key of Object.keys(entries)) {
    if (
      !Object.hasOwn(publicAttributes, key) ||
      !isSetValued.isPlaceDependent(key) ||
      isEdited(key)
    ) {
      publicAttributes[key] = entries[key];
    }
  }

  delete publicAttributes.type;

  return publicAttributes;
};

const readPliteNodeThrough = (
  projection: YjsProjection,
  node: YjsNode,
  admitsText: YjsTextAdmission,
  isSetValued: YjsSetPropertyResolver
): Descendant => {
  if (node instanceof Y.XmlText) return readTextRuns([node])[0];

  const type = getYjsElementType(node);
  const attributes = getPublicYjsElementAttributes(
    getYjsAttributes(node),
    isSetValued
  );
  const children = segmentYjsChildren(projection.children(node)).flatMap(
    (segment) =>
      segment.kind === 'text'
        ? readTextRuns(segment.chain)
        : [
            readPliteNodeThrough(
              projection,
              segment.node,
              admitsText,
              isSetValued
            ),
          ]
  );

  const pliteElement: YjsAttributeRecord = {};

  copyRecordAttributes(pliteElement, attributes);
  pliteElement.type = type;
  pliteElement.children =
    children.length > 0 || !admitsText(type) ? children : [{ text: '' }];

  return pliteElement as Descendant;
};

/**
 * Move the children `parent` shows from `position` up to `end`: each moved
 * child hides where it is and a placeholder for it is returned, for the
 * caller to insert where the children move, so the children keep their Yjs
 * nodes.
 */
export const moveVisibleYjsChildren = (
  write: YjsWrite,
  parent: Y.XmlElement,
  position: number,
  end?: number
): YjsNode[] => {
  const { rawChildren, slots } = materializeYjsStrands(write, parent);
  const visibleSlots = slots.slice(position, end);
  const moved = visibleSlots.map((slot) => {
    if (!hasRawYjsChildSlot(slot)) {
      writeYjsVisibility(write, parent, YJS_VIRTUAL_CHILD_ID_KEY, null);
    }

    return createVirtualYjsMovePlaceholder(write, slot.node);
  });

  // Settling a contest while the placeholders were made can delete other raw
  // children of `parent`, these placeholders among them.
  for (const slot of visibleSlots.toReversed()) {
    const raw = rawChildren[slot.rawIndex];

    if (
      hasRawYjsChildSlot(slot) &&
      raw instanceof Y.XmlElement &&
      isVirtualYjsPlaceholder(raw) &&
      !isDeletedYjsNode(raw)
    ) {
      deleteYjsChildren(write, parent, rawIndexIn(parent, raw), 1);
    }
  }

  return moved;
};

/**
 * The children `parent` shows, after each strand among them becomes a
 * placeholder in `parent` right after the child it follows, so a write to
 * `parent`'s raw children carries it. The new placeholder comes later in the
 * document than the strand did, so it shows the node.
 */
const materializeYjsStrands = (
  write: YjsWrite,
  parent: Y.XmlElement
): Readonly<{
  rawChildren: YjsNode[];
  slots: readonly YjsVisibleChildSlot[];
}> => {
  const rawChildren = getRawYjsChildren(parent);
  const slots = projectYjsRoot(write.root).slots(parent, rawChildren);

  if (!slots.some((slot) => slot.owner)) return { rawChildren, slots };

  const ownerChildren = new Map<Y.XmlElement, YjsNode[]>();
  const rawOf = ({ owner, rawIndex }: YjsVisibleChildSlot) => {
    if (!owner) return rawChildren[rawIndex];
    if (!ownerChildren.has(owner)) {
      ownerChildren.set(owner, getRawYjsChildren(owner));
    }

    return ownerChildren.get(owner)?.[rawIndex];
  };
  const raws = slots.map(rawOf);
  let after: YjsNode | null = null;

  for (const [index, slot] of slots.entries()) {
    const raw = raws[index];

    if (!slot.owner) {
      after = hasRawYjsChildSlot(slot) ? (raw ?? null) : null;
      continue;
    }

    const placeholder = createVirtualYjsMovePlaceholder(write, slot.node);

    insertRawYjsChildren(
      write,
      parent,
      after === null ? 0 : rawIndexIn(parent, after) + 1,
      [placeholder]
    );
    after = placeholder;
    if (
      raw instanceof Y.XmlElement &&
      isVirtualYjsPlaceholder(raw) &&
      !isDeletedYjsNode(raw)
    ) {
      deleteYjsChildren(write, slot.owner, rawIndexIn(slot.owner, raw), 1);
    }
  }

  const fresh = getRawYjsChildren(parent);

  return {
    rawChildren: fresh,
    slots: projectYjsRoot(write.root).slots(parent, fresh),
  };
};

export type YjsJoinMark = Readonly<{
  anchor: YjsNode | null;
  end: Y.XmlElement | null;
}>;

/**
 * Removes `line`, the `index`th child `parent` shows, for a join, and keeps
 * it as a joined line: a peer may still append to it, and Yjs drops an insert
 * into a deleted element.
 */
export const removeJoinedYjsLine = (
  write: YjsWrite,
  parent: Y.XmlElement,
  index: number,
  line: Y.XmlElement,
  places: ReadonlyMap<YjsNode, YjsJoinMark>
): void => {
  if (!removeYjsVirtualPlaceholderChild(write, parent, index, line)) {
    const slot = projectYjsRoot(write.root).slotAt(parent, index);

    if (slot?.node !== line) {
      throw new Error('No joined Yjs line at the requested visible index.');
    }
    if (hasRawYjsChildSlot(slot)) hideShownYjsElement(write, line);
    else writeYjsVisibility(write, parent, YJS_VIRTUAL_CHILD_ID_KEY, null);
  }

  markJoinedYjsLine(write, line, places);
};

const markJoinedYjsLine = (
  write: YjsWrite,
  line: Y.XmlElement,
  places: ReadonlyMap<YjsNode, YjsJoinMark>
): void => {
  const projection = projectYjsRoot(write.root);

  for (const child of getRawYjsChildren(line).toReversed()) {
    if (isDeletedYjsNode(child)) continue;

    const target = isVirtualYjsPlaceholder(child)
      ? projection.slotNodeOf(child)
      : null;

    if (target instanceof Y.XmlElement && places.has(target)) {
      deleteYjsChildren(write, line, rawIndexIn(line, child), 1);
      markJoinedYjsLine(write, target, places);
      continue;
    }
    if (isHiddenYjsNode(child)) continue;
    if (child instanceof Y.XmlElement && places.has(child)) {
      hideShownYjsElement(write, child);
      markJoinedYjsLine(write, child, places);
      continue;
    }
    if (
      child instanceof Y.XmlElement &&
      !isVirtualYjsPlaceholder(child) &&
      hasHiddenYjsDescendant(child)
    ) {
      hideShownYjsElement(write, child);
      continue;
    }

    deleteYjsChildren(write, line, rawIndexIn(line, child), 1);
  }

  const { anchor, end: into } = getDefined(places.get(line));
  const endId = into && ensureYjsNodeId(write, into);

  if (endId) {
    writeYjsVisibility(write, line, YJS_JOINED_END_KEY, endId);
    noteJoinedYjsLine(line, YJS_JOINED_END_KEY, endId);
  }
  if (anchor === null) {
    for (const host of endId ? getYjsLinesJoinedAtEnd(line.doc, endId) : []) {
      const { parent } = host;

      if (
        host !== line &&
        typeof host.getAttribute(YJS_JOINED_AFTER_KEY) !== 'string' &&
        parent instanceof Y.XmlElement &&
        !isDeletedYjsNode(parent) &&
        isInertJoinedYjsLine(host, projection)
      ) {
        deleteYjsChildren(write, parent, rawIndexIn(parent, host), 1);
      }
    }

    return;
  }

  const text = anchor instanceof Y.XmlText ? anchor : null;
  const anchorId = ensureYjsNodeId(
    write,
    text ? textPieceOf(text).source : anchor
  );
  const end = text && yjsTextEndCutOf(text);

  writeYjsVisibility(write, line, YJS_JOINED_AFTER_KEY, anchorId);
  if (end) writeYjsVisibility(write, line, YJS_JOINED_BEFORE_KEY, end);
  noteJoinedYjsLine(line, YJS_JOINED_AFTER_KEY, anchorId);

  const marked = projectYjsRoot(write.root);
  const place = marked.anchorOf(line);

  for (const host of getJoinedYjsLines(line.doc, anchorId)) {
    const { parent } = host;

    if (
      host !== line &&
      parent instanceof Y.XmlElement &&
      !isDeletedYjsNode(parent) &&
      isInertJoinedYjsLine(host, projection) &&
      marked.anchorOf(host) === place
    ) {
      deleteYjsChildren(write, parent, rawIndexIn(parent, host), 1);
    }
  }
};

/**
 * Whether `node` is a joined line that shows nothing now and can show
 * nothing later but what a peer appends to it: every child it holds is such
 * a line.
 */
const isInertJoinedYjsLine = (
  node: YjsNode,
  projection: YjsProjection
): boolean => {
  if (
    !(node instanceof Y.XmlElement) ||
    !isHiddenYjsNode(node) ||
    (typeof node.getAttribute(YJS_JOINED_AFTER_KEY) !== 'string' &&
      typeof node.getAttribute(YJS_JOINED_END_KEY) !== 'string')
  ) {
    return false;
  }

  const id = node.getAttribute(YJS_NODE_ID_KEY);

  return (
    (typeof id !== 'string' ||
      (projection.referrerOf(id) === null &&
        getYjsLinesJoinedAtEnd(node.doc, id).length === 0)) &&
    getRawYjsChildren(node).every((child) =>
      isInertJoinedYjsLine(child, projection)
    )
  );
};

/**
 * Hides `element`, which its parent shows, keeping each node several
 * elements show where it shows now.
 */
const hideShownYjsElement = (write: YjsWrite, element: Y.XmlElement): void => {
  const losers = contestLosers(write, new Set([element]), true);

  hideYjsNode(write, element);
  for (const loser of losers) dropYjsReferrer(write, loser);
};

export const setVirtualYjsMove = (
  write: YjsWrite,
  target: YjsNode,
  wrapper: Y.XmlElement
): void => {
  const nodeId = ensureYjsNodeId(write, target);

  hideYjsMoveTarget(write, target);
  writeYjsVisibility(write, wrapper, YJS_VIRTUAL_CHILD_ID_KEY, nodeId);
};

export const createVirtualYjsMovePlaceholder = (
  write: YjsWrite,
  target: YjsNode
): Y.XmlElement => {
  const nodeId = ensureYjsNodeId(write, target);
  const placeholder = new Y.XmlElement(YJS_ELEMENT_NODE_NAME);

  hideYjsMoveTarget(write, target);
  writeYjsVisibility(write, placeholder, YJS_VIRTUAL_CHILD_ID_KEY, nodeId);
  writeYjsVisibility(write, placeholder, YJS_VIRTUAL_PLACEHOLDER_KEY, true);

  return placeholder;
};

/**
 * Hides `target` where it is, for a move. A node shown under it keeps
 * showing where it shows now, so moving `target` past the node's other
 * placeholders cannot move the node.
 */
const hideYjsMoveTarget = (write: YjsWrite, target: YjsNode): void => {
  const losers = contestLosers(write, new Set([target]), false);

  hideYjsNode(write, target);
  for (const loser of losers) dropYjsReferrer(write, loser);
};

/**
 * Settles which placeholder shows each node under `target` while `target`
 * still shows, for a move that deletes `target`'s placeholder before it
 * writes the new one.
 */
export const settleYjsMoveContests = (
  write: YjsWrite,
  target: YjsNode
): void => {
  for (const loser of contestLosers(write, new Set([target]), false)) {
    dropYjsReferrer(write, loser);
  }
};

export const hideYjsNode = (write: YjsWrite, node: YjsNode): void => {
  writeYjsVisibility(write, node, YJS_HIDDEN_KEY, true);
};

export const insertYjsChild = (
  write: YjsWrite,
  parent: Y.XmlElement,
  index: number,
  child: YjsNode
): void => {
  const id = parent.getAttribute(YJS_NODE_ID_KEY);

  if (
    getYjsLength(parent) === 0 &&
    typeof parent.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) !== 'string' &&
    (typeof id !== 'string' ||
      getYjsLinesJoinedAtEnd(parent.doc, id).length === 0)
  ) {
    insertRawYjsChildren(write, parent, 0, [child]);

    return;
  }

  const rootIndex = lentIndexOf(parent);

  if (rootIndex !== null) {
    insertRawYjsChildren(
      write,
      parent,
      rootIndex.slotAt(index)?.rawIndex ?? rootIndex.rawLength,
      [child]
    );

    return;
  }

  const { rawChildren, slots: visibleSlots } = materializeYjsStrands(
    write,
    parent
  );
  const visibleSlot = visibleSlots[index];

  if (visibleSlot?.rawIndex === VIRTUAL_YJS_CHILD_RAW_INDEX) {
    // Parent-level virtual children have no raw slot; inserting before one
    // requires materializing it as a placeholder after the inserted child.
    writeYjsVisibility(write, parent, YJS_VIRTUAL_CHILD_ID_KEY, null);
    insertRawYjsChildren(write, parent, 0, [
      child,
      createVirtualYjsMovePlaceholder(write, visibleSlot.node),
    ]);

    return;
  }

  const rawIndex =
    index >= visibleSlots.length || !visibleSlot
      ? rawChildren.length
      : visibleSlot.rawIndex;

  insertRawYjsChildren(write, parent, rawIndex, [child]);
};

export const removeYjsVirtualPlaceholderChild = (
  write: YjsWrite,
  parent: Y.XmlElement,
  index: number,
  target: YjsNode
): boolean => {
  const rootIndex = lentIndexOf(parent);
  const read = rootIndex === null ? materializeYjsStrands(write, parent) : null;
  const visibleSlot =
    read === null
      ? rootIndex?.slotAt(index)
      : index >= 0
        ? read.slots[index]
        : undefined;

  if (
    !visibleSlot ||
    !hasRawYjsChildSlot(visibleSlot) ||
    visibleSlot.node !== target
  ) {
    return false;
  }

  const rawChild =
    rootIndex?.rawAt(visibleSlot.rawIndex) ??
    read?.rawChildren[visibleSlot.rawIndex];

  if (
    !(rawChild instanceof Y.XmlElement) ||
    !isVirtualYjsPlaceholder(rawChild)
  ) {
    return false;
  }

  deleteYjsChildren(write, parent, visibleSlot.rawIndex, 1);

  return true;
};

export const removeYjsChild = (
  write: YjsWrite,
  parent: Y.XmlElement,
  index: number,
  editorNode?: Descendant
): YjsChildRemovalMode => {
  const projection = projectYjsRoot(write.root);
  const rootIndex = lentIndexOf(parent);
  const read = rootIndex === null ? materializeYjsStrands(write, parent) : null;
  const rawChildren = read?.rawChildren;
  const visibleSlot =
    read === null
      ? projection.slotAt(parent, index)
      : index >= 0
        ? read.slots[index]
        : undefined;
  let hiddenIndex: number | null = null;
  const getHiddenIndex = (): number => {
    hiddenIndex ??= findHiddenYjsChildIndex(
      projection,
      rawChildren ?? getRawYjsChildren(parent),
      editorNode
    );

    return hiddenIndex;
  };

  if (visibleSlot !== undefined) {
    if (!hasRawYjsChildSlot(visibleSlot)) {
      if (
        editorNode !== undefined &&
        !matchesPliteNode(visibleSlot.node, editorNode)
      ) {
        throw new Error('Cannot remove a virtual Yjs child from its parent.');
      }

      writeYjsVisibility(write, parent, YJS_VIRTUAL_CHILD_ID_KEY, null);

      return 'hidden';
    }

    if (
      editorNode !== undefined &&
      !matchesPliteNode(visibleSlot.node, editorNode) &&
      getHiddenIndex() !== -1
    ) {
      deleteYjsChildren(write, parent, getHiddenIndex(), 1);

      return 'hidden';
    }

    if (
      visibleSlot.node instanceof Y.XmlElement &&
      hasHiddenYjsDescendant(visibleSlot.node)
    ) {
      hideShownYjsElement(write, visibleSlot.node);

      return 'hidden-parent';
    }

    deleteYjsChildren(write, parent, visibleSlot.rawIndex, 1);

    return 'visible';
  }

  const matchingHiddenIndex = getHiddenIndex();

  if (matchingHiddenIndex === -1) {
    throw new Error('No Yjs child to remove at the requested visible path.');
  }

  deleteYjsChildren(write, parent, matchingHiddenIndex, 1);

  return 'hidden';
};

export const assertPublicYjsAttributeCanBeSet = (key: string): void => {
  if (key === 'children' || key === 'text') {
    throw new Error(`Cannot set the "${key}" property on a Yjs node.`);
  }

  if (isReservedYjsKey(key)) {
    throw new Error(`Cannot set internal Yjs attribute "${key}".`);
  }
};

const matchesPliteNode = (
  yjsNode: YjsNode,
  editorNode?: Descendant
): boolean => {
  if (editorNode === undefined) {
    return false;
  }

  if (NodeApi.isText(editorNode)) {
    return yjsNode instanceof Y.XmlText;
  }

  if (!(yjsNode instanceof Y.XmlElement)) {
    return false;
  }

  return getYjsElementType(yjsNode) === String(editorNode.type ?? 'element');
};

const matchesPliteNodeContent = (
  projection: YjsProjection,
  yjsNode: YjsNode,
  editorNode: Descendant
): boolean => {
  if (!matchesPliteNode(yjsNode, editorNode)) {
    return false;
  }

  if (NodeApi.isText(editorNode)) {
    const text = String(editorNode.text);

    return (
      yjsNode instanceof Y.XmlText &&
      yjsTextLength(yjsNode) === text.length &&
      yjsTextContent(yjsNode) === text
    );
  }

  if (!(yjsNode instanceof Y.XmlElement)) {
    return false;
  }

  const children = projection.children(yjsNode);

  if (children.length !== editorNode.children.length) {
    return false;
  }

  let index = 0;

  while (index < editorNode.children.length) {
    const child = editorNode.children[index];
    const yjsChild = children[index];

    if (
      child === undefined ||
      yjsChild === undefined ||
      !matchesPliteNodeContent(projection, yjsChild, child)
    ) {
      return false;
    }
    index += 1;
  }

  return true;
};

const findHiddenYjsChildIndex = (
  projection: YjsProjection,
  rawChildren: readonly YjsNode[],
  editorNode: Descendant | undefined
): number => {
  if (editorNode === undefined) {
    return -1;
  }

  let candidateIndex = -1;
  let candidateCount = 0;

  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (child === undefined) {
      index += 1;
      continue;
    }

    if (!isHiddenYjsNode(child) || !matchesPliteNode(child, editorNode)) {
      index += 1;
      continue;
    }

    if (matchesPliteNodeContent(projection, child, editorNode)) {
      return index;
    }

    candidateIndex = index;
    candidateCount += 1;
    index += 1;
  }

  return candidateCount === 1 ? candidateIndex : -1;
};

const hasHiddenYjsDescendant = (node: Y.XmlElement): boolean => {
  const stack: YjsNode[] = [];

  pushRawYjsChildren(stack, node);

  for (let child = stack.pop(); child; child = stack.pop()) {
    if (isHiddenYjsNode(child)) {
      return true;
    }

    if (child instanceof Y.XmlElement) {
      pushRawYjsChildren(stack, child);
    }
  }

  return false;
};

/** @internal */
export const readYjsTreeRefs = (root: YjsNode): YjsTreeRefs => {
  const ids = new Map<string, YjsNode>();
  const referrers: Array<readonly [string, YjsNode]> = [];
  const stack: YjsNode[] = [root];

  for (let node = stack.pop(); node; node = stack.pop()) {
    const nodeId = node.getAttribute(YJS_NODE_ID_KEY);

    if (typeof nodeId === 'string') {
      ids.set(nodeId, node);
    }

    if (node instanceof Y.XmlElement) {
      const ref = node.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

      if (typeof ref === 'string') referrers.push([ref, node]);
      pushRawYjsChildren(stack, node);
    } else {
      const source = node.getAttribute(YJS_CUT_SOURCE_KEY);

      if (typeof source === 'string') referrers.push([source, node]);
    }
  }

  return { ids, referrers };
};

const lookupOf = (tree: YjsTreeRefs): YjsTreeLookup => {
  const referrers = new Map<string, YjsNode[]>();

  for (const [id, referrer] of tree.referrers) {
    const known = referrers.get(id);

    if (known) known.push(referrer);
    else referrers.set(id, [referrer]);
  }

  return {
    referrers: (id) => referrers.get(id) ?? [],
    resolve: (id) => tree.ids.get(id) ?? null,
  };
};

const createLazyYjsTreeLookup = (root: Y.XmlElement): YjsTreeLookup => {
  const loan = loanOf(root);

  if (loan !== null) {
    const { index } = loan;

    return {
      referrers: (id) => index.referrersOf(id),
      resolve: (id) => index.resolve(id),
    };
  }

  let lookup: YjsTreeLookup | null = null;
  const read = () => (lookup ??= lookupOf(readYjsTreeRefs(root)));

  return {
    referrers: (id) => read().referrers(id),
    resolve: (id) => read().resolve(id),
  };
};
