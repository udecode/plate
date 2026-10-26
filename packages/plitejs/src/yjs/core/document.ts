import * as Y from 'yjs';

import type { NodeList } from '../../core/change/document-index';
import { countCoreWork } from '../../core/work';
import {
  NodeApi,
  type Descendant,
  type JsonNode,
  type Path,
} from '../../index';
import {
  getYjsAttributes,
  getYjsElementType,
  setYjsAttribute,
  setYjsAttributes,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  isReservedYjsKey,
  isYjsMarkRecordKey,
  YJS_CUT_SOURCE_KEY,
  YJS_ELEMENT_NODE_NAME,
  YJS_HIDDEN_KEY,
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
  yjsTextContent,
  yjsTextLength,
  type YjsViewCut,
} from './text-runs';

const VIRTUAL_YJS_CHILD_RAW_INDEX = -1;

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

export type YjsSetPropertyResolver = (
  node: JsonNode,
  key: string,
  context: YjsPropertyContext
) => boolean;

const noSetProperties: YjsSetPropertyResolver = () => false;

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
  ranges?: ReadonlyArray<Readonly<{ from: number; to: number }>>
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
    for (const range of ranges) visit(children, [], [], range.from, range.to);
  } else {
    visit(children, [], []);
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

/**
 * A Yjs element's raw children, counted toward `yjsChildrenRead`.
 *
 * @internal
 */
export const readYjsChildren = (node: Y.XmlElement): unknown[] => {
  const children = node.toArray();

  countCoreWork('yjsChildrenRead', children.length);

  return children;
};

const getRawYjsChildren = (node: Y.XmlElement): YjsNode[] => {
  const rawChildren = readYjsChildren(node);
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

type YjsLentIndex = Readonly<{
  /** The element this lowering made to show each id. */
  chosen: Map<string, Y.XmlElement>;
  answersChildren: boolean;
  index: RootProjectionIndex;
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
  answersChildren: boolean,
  run: () => T
): T => {
  const previous = scope.loan;
  const loan = {
    answersChildren,
    chosen: new Map<string, Y.XmlElement>(),
    index,
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

  const lookup = createLazyYjsTreeLookup(root);
  const shows = (node: YjsNode) => showsInYjsRoot(root, node, lookup);
  const pending: YjsNode[] = [...notes.hidden];
  const resolve = (id: string) => {
    const target = lookup.resolve(id);

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
 * Whether `root` shows `node`, by the reader's rule read upward: a node shows
 * where its parent shows it, unless it is hidden, and a hidden node, `node`
 * included, shows only where the referrer `shownYjsReferrerAmong` picks
 * shows it. A placeholder shows its target, never its own children.
 */
const showsInYjsRoot = (
  root: Y.XmlElement,
  node: YjsNode,
  lookup: YjsTreeLookup
): boolean => {
  const read = new Set<YjsNode>();

  for (let current: YjsNode = node; current !== root;) {
    if (read.has(current) || isDeletedYjsNode(current)) return false;
    read.add(current);
    if (isHiddenYjsNode(current)) {
      const id = current.getAttribute(YJS_NODE_ID_KEY);
      const shownBy =
        typeof id === 'string'
          ? shownYjsReferrerAmong(lookup.referrers(id), lookup, new Set(), id)
          : null;

      if (shownBy === null) return false;
      current = shownBy;
      continue;
    }

    const { parent } = current;

    if (!(parent instanceof Y.XmlElement) || isVirtualYjsPlaceholder(parent)) {
      return false;
    }
    current = parent;
  }

  return true;
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
): T => lend(scopeOf(write), index, true, lower);

/**
 * Runs `read` with `index` resolving the virtual references of `root`'s tree.
 * Child reads skip the index, whose slots still hold the root before a remote
 * batch.
 *
 * @internal
 */
export const withYjsRootIds = <T>(
  root: Y.XmlElement,
  index: RootProjectionIndex,
  read: () => T
): T => {
  const open = scopes.get(root);

  if (open) return lend(open, index, false, read);

  const scope = openYjsScope(null);

  scopes.set(root, scope);
  try {
    return lend(scope, index, false, read);
  } finally {
    scopes.delete(root);
  }
};

const loanOf = (root: Y.XmlElement): YjsLentIndex | null =>
  scopes.get(root)?.loan ?? null;

const lentIndexOf = (parent: Y.XmlElement): RootProjectionIndex | null => {
  const loan = loanOf(parent);

  return loan?.answersChildren ? loan.index : null;
};

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

  for (const slot of getYjsVisibleChildSlots(
    root,
    root,
    lookupOf(tree),
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
  shown: shownAtRoot(root, raw),
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

const shownAtRoot = (root: Y.XmlElement, raw: YjsNode): YjsNode | null => {
  if (isHiddenYjsNode(raw)) return null;
  if (raw instanceof Y.XmlElement && isVirtualYjsPlaceholder(raw)) {
    return getVirtualYjsChild(
      root,
      raw,
      undefined,
      createLazyYjsTreeLookup(root)
    );
  }

  return raw;
};

const insertRawYjsChildren = (
  write: YjsWrite,
  parent: Y.XmlElement,
  rawIndex: number,
  children: YjsNode[]
): void => {
  parent.insert(rawIndex, children);

  const loan = noteWrite(write);

  if (loan === null) return;
  for (const child of children) noteInsertedIds(loan.index, child);
  if (
    loan.answersChildren &&
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

/**
 * Whether `node` shows inside one of `part`: whether `part` holds it or the
 * element it shows in. A hidden node shows in the element that shows it
 * through a virtual reference, not in its parent.
 */
const showsUnder = (
  node: YjsNode,
  part: ReadonlySet<YjsNode>,
  lookup: YjsTreeLookup
): boolean => {
  const hops = new Set<YjsNode>();
  const shownIn = (current: YjsNode): YjsNode | null => {
    if (!isHiddenYjsNode(current)) {
      return current.parent instanceof Y.XmlElement ? current.parent : null;
    }
    if (hops.has(current)) return null;
    hops.add(current);

    const id = current.getAttribute(YJS_NODE_ID_KEY);

    return typeof id === 'string'
      ? shownYjsReferrerAmong(lookup.referrers(id), lookup, new Set(), id)
      : null;
  };

  for (let current: YjsNode | null = node; current !== null;) {
    if (part.has(current)) return true;
    current = shownIn(current);
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
  const lookup = createLazyYjsTreeLookup(rootOfYjsNode(parent));
  const losers = contestLosers(write, removed, true);
  const kept = children.map((child) =>
    textsUnder(child, () => true).some((text) =>
      cutViewsOf(text).some(
        (view) => !isUnder(view, removed) && !showsUnder(view, removed, lookup)
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

  if (loan?.answersChildren && parent === write.root) {
    loan.index.delete(rawIndex, count);
  }
  parent.delete(rawIndex, count);
};

/**
 * What a local lowering lent, whose root index records the contested ids a
 * write settles. A remote import never settles: the receiving peer reads the
 * writer's settling deletes as a change to the placeholders.
 */
const localLending = (write: YjsWrite): YjsLentIndex | null => {
  const { loan } = scopeOf(write);

  return loan?.answersChildren ? loan : null;
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
  const lookup = createLazyYjsTreeLookup(write.root);

  for (const id of lending.index.contestedIds()) {
    const elements = lending.index
      .referrersOf(id)
      .filter((node): node is Y.XmlElement => node instanceof Y.XmlElement);
    const under = elements.filter((element) =>
      showsUnder(element, part, lookup)
    );

    if (elements.length < 2 || under.length === 0) continue;

    const chosen = lending.chosen.get(id);
    const kept =
      chosen !== undefined && !isDeletedYjsNode(chosen)
        ? chosen
        : shownYjsReferrerAmong(elements, lookup, new Set(), id);

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
    if (loan?.answersChildren) loan.chosen.set(value, node);
  }

  const { parent } = node;

  if (
    loan?.answersChildren &&
    parent === write.root &&
    !loan.index.show(readYjsRootSlot(write.root, node))
  ) {
    rebuildLentIndex(write);
  }
};

const pushRawYjsChildren = (target: YjsNode[], node: Y.XmlElement): void => {
  const rawChildren = readYjsChildren(node);
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

type YjsVisibleChildSlot = {
  readonly node: YjsNode;
  readonly rawIndex: number;
};

type YjsChildRemovalMode = 'hidden' | 'hidden-parent' | 'visible';

/** A root tree's nodes by `yjs:id`, and the nodes noted as showing each id. */
type YjsTreeLookup = Readonly<{
  referrers: (id: string) => readonly YjsNode[];
  resolve: (id: string) => YjsNode | null;
}>;

const isVirtualYjsPlaceholder = (node: YjsNode): boolean =>
  node instanceof Y.XmlElement &&
  getYjsAttributes(node)[YJS_VIRTUAL_PLACEHOLDER_KEY] === true;

const hasRawYjsChildSlot = (slot: YjsVisibleChildSlot): boolean =>
  slot.rawIndex !== VIRTUAL_YJS_CHILD_RAW_INDEX;

const isDeletedYjsNode = (node: YjsNode): boolean =>
  node._item?.deleted === true;

const rawIndexIn = (parent: Y.XmlElement, child: YjsNode): number => {
  let index = 0;

  for (let item = parent._start; item !== null; item = item.right) {
    if (item.deleted || !item.countable) continue;
    if (item.content instanceof Y.ContentType && item.content.type === child) {
      return index;
    }
    index += 1;
  }

  return -1;
};

/**
 * Where `node` shows in the document: the child index at each level from the
 * root down, where a hidden node takes the place of the element that shows
 * it, and -1 stands for an element's virtual first child. Null when it shows
 * nowhere.
 */
const documentPositionOf = (
  node: YjsNode,
  lookup: YjsTreeLookup,
  resolving: Set<string>
): number[] | null => {
  const position: number[] = [];

  for (let current: YjsNode = node; ;) {
    const { parent } = current;

    if (isDeletedYjsNode(current)) return null;
    if (!(parent instanceof Y.XmlElement)) return position.reverse();
    if (current !== node && isHiddenYjsNode(current)) {
      const id = current.getAttribute(YJS_NODE_ID_KEY);
      const shownBy =
        typeof id === 'string'
          ? shownYjsReferrerAmong(lookup.referrers(id), lookup, resolving, id)
          : null;

      if (shownBy === null) return null;
      if (!isVirtualYjsPlaceholder(shownBy)) position.push(-1);
      current = shownBy;
      continue;
    }

    position.push(rawIndexIn(parent, current));
    current = parent;
  }
};

const compareDocumentPositions = (
  left: readonly number[],
  right: readonly number[]
): number => {
  for (let depth = 0; depth < Math.min(left.length, right.length); depth++) {
    const order = left[depth] - right[depth];

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

/**
 * The element among `referrers` that shows the node with `id`. Two splits
 * can each move the same children into a line of their own, so one node can
 * have several placeholders. The one that comes last in the document shows
 * it, because the children after a split belong to its last piece; equal
 * places fall back to Yjs item id order. Every peer computes the same pick
 * from the Yjs document alone, so no peer shows the node twice or nowhere.
 */
const shownYjsReferrerAmong = (
  referrers: readonly YjsNode[],
  lookup: YjsTreeLookup,
  resolving: Set<string>,
  id: string
): Y.XmlElement | null => {
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

  let shown: Y.XmlElement | null = null;
  let shownAt: number[] | null = null;

  for (const element of elements) {
    const at = documentPositionOf(element, lookup, resolving);

    if (at === null) continue;

    const order = shownAt === null ? 1 : compareDocumentPositions(at, shownAt);

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
};

/**
 * The element that shows the node with `id` through a virtual reference, or
 * null when none does.
 *
 * @internal
 */
export const getShownYjsReferrer = (
  root: Y.XmlElement,
  id: string
): Y.XmlElement | null => {
  const lookup = createLazyYjsTreeLookup(root);

  return shownYjsReferrerAmong(lookup.referrers(id), lookup, new Set(), id);
};

const getVirtualYjsChild = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  visited?: Set<Y.XmlElement>,
  lookup = createLazyYjsTreeLookup(root)
): YjsNode | null => {
  const virtualChildId = node.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

  if (typeof virtualChildId === 'string') {
    const nextVisited = visited ?? new Set<Y.XmlElement>();

    if (nextVisited.has(node)) {
      return null;
    }

    nextVisited.add(node);

    const referrers = lookup.referrers(virtualChildId);

    if (
      shownYjsReferrerAmong(
        referrers.includes(node) ? referrers : [...referrers, node],
        lookup,
        new Set(),
        virtualChildId
      ) !== node
    ) {
      return null;
    }

    const virtualChild = lookup.resolve(virtualChildId);

    if (
      virtualChild instanceof Y.XmlElement &&
      isVirtualYjsPlaceholder(virtualChild)
    ) {
      return getVirtualYjsChild(root, virtualChild, nextVisited, lookup);
    }

    return virtualChild;
  }

  return null;
};

const getYjsVisibleChildSlots = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  lookup?: YjsTreeLookup,
  rawChildren = getRawYjsChildren(node)
): YjsVisibleChildSlot[] => {
  const rawSlots = new Array<YjsVisibleChildSlot>(rawChildren.length + 1);
  const visibleNodes = new Set<YjsNode>();
  let writeIndex = 0;

  if (!isVirtualYjsPlaceholder(node)) {
    const virtualChild = getVirtualYjsChild(root, node, undefined, lookup);

    if (virtualChild !== null) {
      rawSlots[writeIndex] = {
        node: virtualChild,
        rawIndex: VIRTUAL_YJS_CHILD_RAW_INDEX,
      };
      visibleNodes.add(virtualChild);
      writeIndex += 1;
    }
  }

  let rawIndex = 0;

  while (rawIndex < rawChildren.length) {
    const child = rawChildren[rawIndex];

    if (child === undefined) {
      rawIndex += 1;
      continue;
    }

    if (isHiddenYjsNode(child)) {
      rawIndex += 1;
      continue;
    }

    if (child instanceof Y.XmlElement && isVirtualYjsPlaceholder(child)) {
      const virtualChild = getVirtualYjsChild(root, child, undefined, lookup);

      if (virtualChild !== null && !visibleNodes.has(virtualChild)) {
        rawSlots[writeIndex] = { node: virtualChild, rawIndex };
        visibleNodes.add(virtualChild);
        writeIndex += 1;
      }

      rawIndex += 1;
      continue;
    }

    rawSlots[writeIndex] = { node: child, rawIndex };
    visibleNodes.add(child);
    writeIndex += 1;
    rawIndex += 1;
  }

  rawSlots.length = writeIndex;

  return rawSlots;
};

const getYjsVisibleChildNodes = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  lookup?: YjsTreeLookup
): YjsNode[] => {
  const index = lentIndexOf(node);

  if (index !== null) {
    countCoreWork('yjsChildrenRead', index.length);

    return index.slice(0);
  }

  const rawChildren = getRawYjsChildren(node);
  const children = new Array<YjsNode>(rawChildren.length + 1);
  const visibleNodes = new Set<YjsNode>();
  let writeIndex = 0;

  if (!isVirtualYjsPlaceholder(node)) {
    const virtualChild = getVirtualYjsChild(root, node, undefined, lookup);

    if (virtualChild !== null) {
      children[writeIndex] = virtualChild;
      visibleNodes.add(virtualChild);
      writeIndex += 1;
    }
  }

  let rawIndex = 0;

  while (rawIndex < rawChildren.length) {
    const child = rawChildren[rawIndex];

    if (child === undefined) {
      rawIndex += 1;
      continue;
    }

    if (isHiddenYjsNode(child)) {
      rawIndex += 1;
      continue;
    }

    if (child instanceof Y.XmlElement && isVirtualYjsPlaceholder(child)) {
      const virtualChild = getVirtualYjsChild(root, child, undefined, lookup);

      if (virtualChild !== null && !visibleNodes.has(virtualChild)) {
        children[writeIndex] = virtualChild;
        visibleNodes.add(virtualChild);
        writeIndex += 1;
      }

      rawIndex += 1;
      continue;
    }

    children[writeIndex] = child;
    visibleNodes.add(child);
    writeIndex += 1;
    rawIndex += 1;
  }

  children.length = writeIndex;

  return children;
};

const getYjsVisibleChildSlotAt = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  index: number,
  lookup: YjsTreeLookup,
  rawChildren?: readonly unknown[]
): YjsVisibleChildSlot | undefined => {
  if (typeof index !== 'number' || index < 0) {
    return undefined;
  }
  if (rawChildren === undefined) {
    const rootIndex = lentIndexOf(node);

    if (rootIndex !== null) return rootIndex.slotAt(index);
  }

  const children = rawChildren ?? readYjsChildren(node);

  const visibleNodes = new Set<YjsNode>();
  let visibleIndex = 0;

  if (!isVirtualYjsPlaceholder(node)) {
    const virtualChild = getVirtualYjsChild(root, node, undefined, lookup);

    if (virtualChild !== null) {
      if (visibleIndex === index) {
        return {
          node: virtualChild,
          rawIndex: VIRTUAL_YJS_CHILD_RAW_INDEX,
        };
      }

      visibleNodes.add(virtualChild);
      visibleIndex += 1;
    }
  }

  let rawIndex = 0;

  while (rawIndex < children.length) {
    const child = children[rawIndex];

    if (!isYjsContentNode(child) || isHiddenYjsNode(child)) {
      rawIndex += 1;
      continue;
    }

    if (child instanceof Y.XmlElement && isVirtualYjsPlaceholder(child)) {
      const virtualChild = getVirtualYjsChild(root, child, undefined, lookup);

      if (virtualChild !== null && !visibleNodes.has(virtualChild)) {
        if (visibleIndex === index) {
          return { node: virtualChild, rawIndex };
        }

        visibleNodes.add(virtualChild);
        visibleIndex += 1;
      }

      rawIndex += 1;
      continue;
    }

    visibleNodes.add(child);

    if (visibleIndex === index) {
      return { node: child, rawIndex };
    }

    visibleIndex += 1;
    rawIndex += 1;
  }

  return undefined;
};

const getYjsVisibleChildAt = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  index: number,
  lookup: YjsTreeLookup
): YjsNode | undefined =>
  getYjsVisibleChildSlotAt(root, node, index, lookup)?.node;

export const getYjsChildren = (node: Y.XmlElement): YjsNode[] => {
  const rawChildren = readYjsChildren(node);
  const children = new Array<YjsNode>(rawChildren.length);
  let writeIndex = 0;
  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (isYjsContentNode(child) && !isHiddenYjsNode(child)) {
      children[writeIndex] = child;
      writeIndex += 1;
    }
    index += 1;
  }

  children.length = writeIndex;

  return children;
};

export const getYjsVisibleChildren = (
  root: Y.XmlElement,
  node: Y.XmlElement
): YjsNode[] => getYjsVisibleChildNodes(root, node);

export type YjsVisibleChildrenReader = (node: Y.XmlElement) => YjsNode[];

export type YjsTextPoint = {
  readonly childIndex: number;
  readonly offset: number;
  readonly parent: Y.XmlElement;
  readonly text: Y.XmlText;
};

const getYjsVisibleChildrenWithResolver = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  lookup: YjsTreeLookup
): YjsNode[] => getYjsVisibleChildNodes(root, node, lookup);

export const getYjsVisibleChild = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  index: number
): YjsNode | undefined =>
  getYjsVisibleChildAt(root, node, index, createLazyYjsTreeLookup(root));

export const hasYjsVisibleChildren = (
  root: Y.XmlElement,
  node: Y.XmlElement
): boolean => getYjsVisibleChild(root, node, 0) !== undefined;

export const hasMultipleYjsVisibleChildren = (
  root: Y.XmlElement,
  node: Y.XmlElement
): boolean => getYjsVisibleChild(root, node, 1) !== undefined;

export const createYjsVisibleChildrenReader = (
  root: Y.XmlElement
): YjsVisibleChildrenReader => {
  const lookup = createLazyYjsTreeLookup(root);

  return (node) => getYjsVisibleChildrenWithResolver(root, node, lookup);
};

export const getYjsVisiblePath = (
  root: Y.XmlElement,
  target: YjsNode
): Path | null => {
  const lookup = createLazyYjsTreeLookup(root);
  const path: number[] = [];
  const visit = (node: YjsNode, visited: Set<YjsNode>): Path | null => {
    if (node === target) {
      return copyPath(path);
    }
    if (!(node instanceof Y.XmlElement) || visited.has(node)) {
      return null;
    }

    visited.add(node);

    const children = getYjsVisibleChildrenWithResolver(root, node, lookup);

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

  for (const key in node) {
    if (!Object.hasOwn(node, key) || excludedSet.has(key)) continue;

    assertPublicYjsAttributeCanBeSet(key);

    const value = (node as Readonly<Record<string, unknown>>)[key];

    if (isSetValued(node, key, context)) {
      if (!Array.isArray(value)) {
        throw new Error(`Set-valued Yjs property "${key}" must be an array.`);
      }

      Object.assign(attributes, encodeYjsSetValueAttributes(key, value));
    } else {
      attributes[key] = value;
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
  admitsText: YjsTextAdmission = admitsAnyText
): Descendant[] => {
  const lookup = createLazyYjsTreeLookup(root);
  const visibleChildren = getYjsVisibleChildrenWithResolver(root, root, lookup);
  const children = segmentYjsChildren(visibleChildren).flatMap((segment) =>
    segment.kind === 'text'
      ? readTextRuns(segment.chain)
      : [
          readPliteNodeFromYjsWithResolver(
            root,
            segment.node,
            lookup,
            admitsText
          ),
        ]
  );

  return children.length > 0 ? children : [...emptyValue];
};

export const readPliteNodeFromYjs = (
  root: Y.XmlElement,
  node: YjsNode,
  admitsText: YjsTextAdmission = admitsAnyText
): Descendant =>
  readPliteNodeFromYjsWithResolver(
    root,
    node,
    createLazyYjsTreeLookup(root),
    admitsText
  );

const removeDuplicateVirtualYjsChildReferences = (
  write: YjsWrite,
  parent: Y.XmlElement,
  lookup: YjsTreeLookup,
  removed: Set<YjsNode>
): void => {
  const { root } = write;
  const visibleNodes = new Set<YjsNode>();

  if (!isVirtualYjsPlaceholder(parent)) {
    const virtualChild = getVirtualYjsChild(root, parent, undefined, lookup);

    if (virtualChild !== null) visibleNodes.add(virtualChild);
  }

  const rawChildren = getRawYjsChildren(parent);
  let deleted = 0;

  for (let rawIndex = 0; rawIndex < rawChildren.length; rawIndex++) {
    const child = rawChildren[rawIndex];

    if (child === undefined || isHiddenYjsNode(child)) continue;

    if (child instanceof Y.XmlElement && isVirtualYjsPlaceholder(child)) {
      const virtualChild = getVirtualYjsChild(root, child, undefined, lookup);

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
  lookup: YjsTreeLookup,
  removed: Set<YjsNode>
): void => {
  removeDuplicateVirtualYjsChildReferences(write, parent, lookup, removed);

  if (parent !== write.root) return;

  const rawChildren = getRawYjsChildren(parent);
  const visibleSlots = getYjsVisibleChildSlots(
    write.root,
    parent,
    lookup,
    rawChildren
  );

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
  lookup: YjsTreeLookup,
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
      removeRedundantEmptyYjsTextTree(write, child, lookup, removed, visited);
    }
    index += 1;
  }

  removeRedundantEmptyYjsTextChildren(write, parent, lookup, removed);
};

export const removeRedundantEmptyYjsTextNodes = (write: YjsWrite): void => {
  const lookup = createLazyYjsTreeLookup(write.root);
  removeRedundantEmptyYjsTextTree(
    write,
    write.root,
    lookup,
    new Set(),
    new Set()
  );
};

export const removeRedundantEmptyYjsTextNodesAt = (
  write: YjsWrite,
  parents: ReadonlySet<Y.XmlElement>,
  recursiveRoots: ReadonlySet<Y.XmlElement>
): ReadonlySet<YjsNode> => {
  const lookup = createLazyYjsTreeLookup(write.root);
  const removed = new Set<YjsNode>();
  const visited = new Set<Y.XmlElement>();

  for (const recursiveRoot of recursiveRoots) {
    removeRedundantEmptyYjsTextTree(
      write,
      recursiveRoot,
      lookup,
      removed,
      visited
    );
  }
  for (const parent of parents) {
    removeRedundantEmptyYjsTextChildren(write, parent, lookup, removed);
  }

  return removed;
};

const getPublicAttributes = (
  attributes?: Readonly<YjsAttributeRecord>
): YjsAttributeRecord => {
  const publicAttributes: YjsAttributeRecord = {};

  if (attributes === undefined) {
    return publicAttributes;
  }

  for (const key in attributes) {
    if (!Object.hasOwn(attributes, key) || isReservedYjsKey(key)) {
      continue;
    }

    publicAttributes[key] = attributes[key];
  }

  Object.assign(publicAttributes, readYjsSetValueAttributes(attributes));

  return publicAttributes;
};

const getPublicYjsAttributes = (node: YjsNode): YjsAttributeRecord =>
  getPublicAttributes(getYjsAttributes(node));

const getPublicYjsElementAttributes = (
  node: Y.XmlElement
): YjsAttributeRecord => {
  const attributes = getPublicYjsAttributes(node);

  delete attributes.type;

  return attributes;
};

const readPliteNodeFromYjsWithResolver = (
  root: Y.XmlElement,
  node: YjsNode,
  lookup: YjsTreeLookup,
  admitsText: YjsTextAdmission
): Descendant => {
  if (node instanceof Y.XmlText) return readTextRuns([node])[0];

  const attributes = getPublicYjsElementAttributes(node);
  const type = getYjsElementType(node);
  const visibleChildren = getYjsVisibleChildrenWithResolver(root, node, lookup);
  const children = segmentYjsChildren(visibleChildren).flatMap((segment) =>
    segment.kind === 'text'
      ? readTextRuns(segment.chain)
      : [
          readPliteNodeFromYjsWithResolver(
            root,
            segment.node,
            lookup,
            admitsText
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
 * Move the children `parent` shows from `position` on: each moved child hides
 * where it is and a placeholder for it is returned, for the caller to insert
 * where the children move, so the children keep their Yjs nodes.
 */
export const moveVisibleYjsChildren = (
  write: YjsWrite,
  parent: Y.XmlElement,
  position: number
): YjsNode[] => {
  const rawChildren = getRawYjsChildren(parent);
  const visibleSlots = getYjsVisibleChildSlots(
    write.root,
    parent,
    createLazyYjsTreeLookup(write.root),
    rawChildren
  ).slice(position);
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
  if (
    getYjsLength(parent) === 0 &&
    typeof parent.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) !== 'string'
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

  const { root } = write;
  const lookup = createLazyYjsTreeLookup(root);
  const rawChildren = getRawYjsChildren(parent);
  const visibleSlots = getYjsVisibleChildSlots(
    root,
    parent,
    lookup,
    rawChildren
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
  const rawChildren =
    rootIndex === null ? getRawYjsChildren(parent) : undefined;
  const visibleSlot = getYjsVisibleChildSlotAt(
    write.root,
    parent,
    index,
    createLazyYjsTreeLookup(write.root),
    rawChildren
  );

  if (
    !visibleSlot ||
    !hasRawYjsChildSlot(visibleSlot) ||
    visibleSlot.node !== target
  ) {
    return false;
  }

  const rawChild =
    rootIndex?.rawAt(visibleSlot.rawIndex) ??
    rawChildren?.[visibleSlot.rawIndex];

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
  const { root } = write;
  const lookup = createLazyYjsTreeLookup(root);
  const rawChildren =
    lentIndexOf(parent) === null ? getRawYjsChildren(parent) : undefined;
  const visibleSlot = getYjsVisibleChildSlotAt(
    root,
    parent,
    index,
    lookup,
    rawChildren
  );
  let hiddenIndex: number | null = null;
  const getHiddenIndex = (): number => {
    hiddenIndex ??= findHiddenYjsChildIndex(
      root,
      rawChildren ?? getRawYjsChildren(parent),
      editorNode,
      lookup
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
      const losers = contestLosers(write, new Set([visibleSlot.node]), true);

      hideYjsNode(write, visibleSlot.node);
      for (const loser of losers) dropYjsReferrer(write, loser);

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
  root: Y.XmlElement,
  yjsNode: YjsNode,
  editorNode: Descendant,
  lookup: YjsTreeLookup
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

  const children = getYjsVisibleChildrenWithResolver(root, yjsNode, lookup);

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
      !matchesPliteNodeContent(root, yjsChild, child, lookup)
    ) {
      return false;
    }
    index += 1;
  }

  return true;
};

const findHiddenYjsChildIndex = (
  root: Y.XmlElement,
  rawChildren: readonly YjsNode[],
  editorNode: Descendant | undefined,
  lookup: YjsTreeLookup
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

    if (matchesPliteNodeContent(root, child, editorNode, lookup)) {
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
