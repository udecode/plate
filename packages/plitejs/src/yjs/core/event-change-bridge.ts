import { type Diff, DiffOp } from 'diff-match-patch-ts';
import * as Y from 'yjs';

import {
  createInternalDocumentChange,
  createInternalRootChangeFromSections as createDocumentChangeFromRootSections,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import { DocumentIndex, type NodeList } from '../../core/change/document-index';
import { deepFreeze } from '../../core/change/json';
import type { DocumentChangeRelocation } from '../../core/change/mapping';
import {
  getDocumentChangeRelocations,
  getExactDocumentChangeRelocation,
} from '../../core/change/mapping';
import { RootChange } from '../../core/change/root-change';
import { PreparedTokenSliceStructureError } from '../../core/change/tokens';
import { countCoreWork } from '../../core/work';
import {
  type Descendant,
  type DocumentChange,
  type Element,
  type JsonNode,
  NodeApi,
  type Text,
} from '../../index';
import { failInvariant } from '../../internal/fail-invariant';
import { getDefined } from '../../internal/get-defined';
import type { YjsNode } from './attributes';
import { getYjsAttributes } from './attributes';
import {
  applyCanonicalSplitToYjs,
  findCanonicalSplit,
} from './canonical-split';
import {
  createVirtualYjsMovePlaceholder,
  createYjsNode,
  createYjsNodes,
  createYjsPropertyContext,
  createYjsPropertyLocationAt,
  getYjsNodeIf,
  getYjsParent,
  getYjsVisibleChild,
  getYjsVisibleChildren,
  indexYjsPropertyContexts,
  insertYjsChild,
  isVirtualYjsChild,
  readPliteNodeFromYjs,
  readYjsChildren,
  readYjsRootIndex,
  readYjsRootSlot,
  readYjsTreeRefs,
  removeRedundantEmptyYjsTextNodesAt,
  removeSupersededVirtualYjsSplitSuffixes,
  removeYjsChild,
  removeYjsVirtualPlaceholderChild,
  setVirtualYjsMove,
  setVirtualYjsUnwrapMove,
  splitVisibleYjsChildren,
  withYjsRootIds,
  withYjsRootIndex,
  yjsRootNeedsNormalization,
  type YjsPropertyContext,
  type YjsSetPropertyResolver,
} from './document';
import {
  composeTextDeltas,
  editOf,
  type FoundJoin,
  joinedChange,
  type JoinRun,
  joinRunsOf,
  letterEditsIn,
  pushDiff,
  splitAtRuns,
  withoutEqualEdges,
} from './joins';
import { areJsonLikeValuesEqual } from './json-equality';
import {
  YJS_CHILD_VISIBILITY_KEYS,
  YJS_HIDDEN_KEY,
  YJS_NODE_ID_KEY,
  YJS_VIRTUAL_CHILD_ID_KEY,
  YJS_VIRTUAL_PLACEHOLDER_KEY,
} from './keys';
import { lastPathIndex, parentPath, pathsEqual } from './path';
import {
  canReplaceCompatibleYjsChildren,
  replaceCompatibleYjsChildren,
  sameSkeleton,
  setYjsElementAttributes,
} from './replacement';
import { RootProjectionIndex } from './root-projection-index';
import {
  alignSegments,
  createYjsRunEncoder,
  elementOnlySpliceEdits,
  retainTextChainRange,
  rewriteTextRuns,
  segmentPliteChildren,
  segmentYjsChildren,
  writeTextRuns,
  type PliteSegment,
} from './text-runs';

type CapturedYjsDeltaPart = Readonly<{
  delete?: number;
  insert?: unknown;
  retain?: number;
}>;

type CapturedYjsEvent = Readonly<{
  childListChanged: boolean;
  delta: readonly CapturedYjsDeltaPart[];
  /** Yjs computes `event.changes` only while the observer runs. */
  deleted: ReadonlyArray<YjsNode | null>;
  keys: readonly string[];
  target: Y.AbstractType<unknown>;
}>;

export type CapturedYjsEventBatch = Readonly<{
  deletedTextTargets: readonly Y.XmlText[];
  events: readonly CapturedYjsEvent[];
}>;

export type YjsEventNormalization = Readonly<{
  changedNodes: ReadonlySet<YjsNode>;
  removedNodes: ReadonlySet<YjsNode>;
}>;

export type YjsEventImportFallback =
  | 'remote-event-empty-root'
  | 'remote-event-invalid-delta'
  | 'remote-event-mirror-mismatch'
  | 'remote-event-projected-content'
  | 'remote-event-read-failed'
  | 'remote-event-root-attributes'
  | 'remote-event-unknown-target';

type EventImportRegion = {
  afterFrom: number;
  afterTo: number;
  beforeFrom: number;
  beforeTo: number;
};

/**
 * How a remote import fits what it reads into the editor's schema: `block`
 * fits one read top-level block and throws when its content cannot fit;
 * `holds` says whether the root, changed only inside `windows`, still holds
 * its content.
 */
export type YjsImportFit = Readonly<{
  block: (node: Descendant) => Descendant;
  holds: (
    after: Readonly<{ at: (index: number) => Descendant; length: number }>,
    windows: readonly EventImportRegion[]
  ) => boolean;
}>;

const UNCHECKED_IMPORT_FIT: YjsImportFit = {
  block: (node) => node,
  holds: () => true,
};

/**
 * The top-level stretch a structural change touched, with its offset: the
 * before nodes its changed ranges span and the after nodes in their place.
 */
type RootWindow = Readonly<{
  after: readonly Descendant[];
  before: readonly Descendant[];
  from: number;
}>;

const shiftPath = (path: readonly number[], by: number) =>
  by === 0
    ? path
    : [
        (path[0] ?? failInvariant('Expected a root index')) + by,
        ...path.slice(1),
      ];

/** A detector's find, read on a window, at its place in the whole root. */
const inRoot = <
  T extends Readonly<{ from: number; parentPath: readonly number[] }>,
>(
  found: T | null,
  by: number
): T | null =>
  found === null || by === 0
    ? found
    : found.parentPath.length === 0
      ? { ...found, from: found.from + by }
      : { ...found, parentPath: shiftPath(found.parentPath, by) };

const isEmptyYjsText = (node: YjsNode | undefined): boolean =>
  node instanceof Y.XmlText && node.length === 0;

const applyExactYjsRelocation = (
  root: Y.XmlElement,
  relocation: DocumentChangeRelocation
): boolean => {
  const sourcePath = [...relocation.path];
  const targetPath = [...relocation.targetPath];
  const target = getYjsNodeIf(root, sourcePath);
  const sourceIndex = lastPathIndex(sourcePath);

  if (target === null) return false;

  const sourceParentPath = parentPath(sourcePath);
  const sourceParent = getYjsNodeIf(root, sourceParentPath);
  const targetParentPath = parentPath(targetPath);
  const targetIndex = lastPathIndex(targetPath);
  const targetParent = getYjsNodeIf(root, targetParentPath);

  if (
    sourceParent instanceof Y.XmlElement &&
    isVirtualYjsChild(target, sourceParent) &&
    pathsEqual(targetPath, sourceParentPath)
  ) {
    const { index: wrapperIndex, parent: wrapperParent } = getYjsParent(
      root,
      sourceParentPath
    );

    setVirtualYjsUnwrapMove(
      root,
      target,
      sourceParent,
      wrapperParent,
      wrapperIndex
    );

    return true;
  }

  if (!(targetParent instanceof Y.XmlElement) || targetIndex === undefined) {
    return false;
  }

  const removeSourceVirtualPlaceholder = (): void => {
    if (
      sourceParent instanceof Y.XmlElement &&
      sourceParent !== targetParent &&
      sourceIndex !== undefined
    ) {
      removeYjsVirtualPlaceholderChild(root, sourceParent, sourceIndex, target);
    }
  };

  if (
    sourceParent instanceof Y.XmlElement &&
    sourceParent === targetParent &&
    sourceIndex !== undefined
  ) {
    removeYjsVirtualPlaceholderChild(root, sourceParent, sourceIndex, target);
  }

  const firstTargetChild = getYjsVisibleChild(root, targetParent, 0);
  const hasMultipleTargetChildren =
    getYjsVisibleChild(root, targetParent, 1) !== undefined;
  let removedEmptyTargetChild = false;

  if (
    targetIndex === 0 &&
    !hasMultipleTargetChildren &&
    isEmptyYjsText(firstTargetChild)
  ) {
    removeYjsChild(root, targetParent, 0);
    removedEmptyTargetChild = true;
  }

  if (
    targetIndex === 0 &&
    targetParent.length === 0 &&
    (firstTargetChild === undefined || removedEmptyTargetChild)
  ) {
    setVirtualYjsMove(target, targetParent);
    removeSourceVirtualPlaceholder();

    return true;
  }

  insertYjsChild(
    root,
    targetParent,
    targetIndex,
    createVirtualYjsMovePlaceholder(target)
  );
  removeSourceVirtualPlaceholder();

  return true;
};

const isElement = (node: Descendant | null): node is Element =>
  node !== null && NodeApi.isElement(node);

const isText = (node: Descendant | null) =>
  node !== null && NodeApi.isText(node);

const nodePropertiesEqual = (
  left: Descendant,
  right: Descendant,
  contentKey: 'children' | 'text'
): boolean => {
  const leftProperties = { ...left } as Record<string, unknown>;
  const rightProperties = { ...right } as Record<string, unknown>;

  delete leftProperties[contentKey];
  delete rightProperties[contentKey];

  return areJsonLikeValuesEqual(leftProperties, rightProperties);
};

type TopLevelElementSplit = Readonly<{
  before: Element;
  from: number;
  left: Element;
  position: number;
  right: Element;
}>;

const findTopLevelElementSplit = (
  before: readonly Descendant[],
  after: readonly Descendant[]
): TopLevelElementSplit | null => {
  let from = 0;

  while (
    from < before.length &&
    from < after.length &&
    areJsonLikeValuesEqual(before[from], after[from])
  ) {
    from += 1;
  }

  let suffixCount = 0;

  while (
    suffixCount < before.length - from &&
    suffixCount < after.length - from &&
    areJsonLikeValuesEqual(
      before.at(-1 - suffixCount),
      after.at(-1 - suffixCount)
    )
  ) {
    suffixCount += 1;
  }

  const beforeChanged = before.slice(from, before.length - suffixCount);
  const afterChanged = after.slice(from, after.length - suffixCount);
  const original = beforeChanged[0] ?? null;
  const left = afterChanged[0] ?? null;
  const right = afterChanged[1] ?? null;

  if (
    beforeChanged.length !== 1 ||
    afterChanged.length !== 2 ||
    !isElement(original) ||
    !isElement(left) ||
    !isElement(right) ||
    !nodePropertiesEqual(original, left, 'children') ||
    !nodePropertiesEqual(original, right, 'children') ||
    !areJsonLikeValuesEqual(original.children, [
      ...left.children,
      ...right.children,
    ])
  ) {
    return null;
  }

  return {
    before: original,
    from,
    left,
    position: left.children.length,
    right,
  };
};

const textOf = (nodes: readonly Descendant[]): string =>
  nodes
    .map((node) => (NodeApi.isText(node) ? node.text : textOf(node.children)))
    .join('');

const sameSegment = (left: PliteSegment, right: PliteSegment) =>
  left.kind === 'text'
    ? right.kind === 'text' && areJsonLikeValuesEqual(left.leaves, right.leaves)
    : right.kind === 'element' && areJsonLikeValuesEqual(left.node, right.node);

const findInlineTextCut = (
  before: readonly Descendant[],
  after: readonly Descendant[],
  ancestorPath: readonly number[] = []
): Readonly<{
  parentPath: readonly number[];
  group: number;
  before: readonly Text[];
  after: readonly Descendant[];
  from: number;
  kept: number;
  leaves: readonly Text[];
  offset: number;
}> | null => {
  const oldSegments = segmentPliteChildren(before);
  const newSegments = segmentPliteChildren(after);
  let from = 0;
  while (
    from < oldSegments.length &&
    from < newSegments.length &&
    sameSegment(oldSegments[from], newSegments[from])
  ) {
    from += 1;
  }
  let suffix = 0;
  while (
    suffix < oldSegments.length - from &&
    suffix < newSegments.length - from &&
    sameSegment(
      oldSegments[oldSegments.length - 1 - suffix],
      newSegments[newSegments.length - 1 - suffix]
    )
  ) {
    suffix += 1;
  }
  const old = oldSegments[from];
  const next = newSegments.slice(from, newSegments.length - suffix);
  if (
    oldSegments.length - from - suffix === 1 &&
    old?.kind === 'text' &&
    next.length > 1 &&
    ancestorPath.length > 0
  ) {
    const start = next[0].from;
    const end = newSegments[newSegments.length - suffix]?.from ?? after.length;
    const pieces = after.slice(start, end);
    // The last text piece keeps the leaf's Yjs letters, so a peer's concurrent
    // append at the leaf's end stays in the kept piece.
    const last = next.findLast((segment) => segment.kind === 'text');
    if (last?.kind === 'text' && textOf(pieces) === textOf(old.leaves)) {
      const kept = last.from - start;
      return {
        parentPath: ancestorPath,
        group: from,
        before: old.leaves,
        after: pieces,
        from: start,
        kept,
        leaves: last.leaves,
        offset: textOf(pieces.slice(0, kept)).length,
      };
    }
  }
  if (before.length !== after.length) return null;
  let changed = -1;
  for (let index = 0; index < before.length; index++) {
    if (areJsonLikeValuesEqual(before[index], after[index])) continue;
    if (changed !== -1) return null;
    changed = index;
  }
  const oldNode = before[changed];
  const newNode = after[changed];
  return oldNode &&
    newNode &&
    NodeApi.isElement(oldNode) &&
    NodeApi.isElement(newNode) &&
    nodePropertiesEqual(oldNode, newNode, 'children')
    ? findInlineTextCut(oldNode.children, newNode.children, [
        ...ancestorPath,
        changed,
      ])
    : null;
};

type NestedChildSplice = Readonly<{
  after: readonly Descendant[];
  before: readonly Descendant[];
  from: number;
  parentPath: readonly number[];
}>;

const findNestedChildSplice = (
  before: readonly Descendant[],
  after: readonly Descendant[],
  innerParentPath3: readonly number[] = []
): NestedChildSplice | null => {
  if (areJsonLikeValuesEqual(before, after)) return null;

  if (before.length === after.length) {
    let changedIndex: number | null = null;

    for (let index = 0; index < before.length; index++) {
      if (areJsonLikeValuesEqual(before[index], after[index])) continue;
      if (changedIndex !== null) return null;

      changedIndex = index;
    }

    if (changedIndex === null) return null;

    const oldNode = before[changedIndex] ?? null;
    const newNode = after[changedIndex] ?? null;

    if (
      isElement(oldNode) &&
      isElement(newNode) &&
      nodePropertiesEqual(oldNode, newNode, 'children')
    ) {
      const nested = findNestedChildSplice(oldNode.children, newNode.children, [
        ...innerParentPath3,
        changedIndex,
      ]);

      if (nested !== null) return nested;
    }
    if (innerParentPath3.length === 0) return null;

    return {
      after: [newNode],
      before: [oldNode],
      from: changedIndex,
      parentPath: innerParentPath3,
    };
  }

  if (innerParentPath3.length === 0) return null;

  let from = 0;

  while (
    from < before.length &&
    from < after.length &&
    areJsonLikeValuesEqual(before[from], after[from])
  ) {
    from += 1;
  }

  let suffixCount = 0;

  while (
    suffixCount < before.length - from &&
    suffixCount < after.length - from &&
    areJsonLikeValuesEqual(
      before.at(-1 - suffixCount),
      after.at(-1 - suffixCount)
    )
  ) {
    suffixCount += 1;
  }

  return {
    after: after.slice(from, after.length - suffixCount),
    before: before.slice(from, before.length - suffixCount),
    from,
    parentPath: innerParentPath3,
  };
};

const relocationPathKey = (path: readonly number[]): string => path.join('.');

const createYjsNodeWithRelocations = (
  node: Descendant,
  path: readonly number[],
  relocationTargets: ReadonlyMap<string, YjsNode>,
  isSetValued: YjsSetPropertyResolver,
  contexts: WeakMap<JsonNode, YjsPropertyContext>
): YjsNode => {
  const relocationTarget = relocationTargets.get(relocationPathKey(path));

  if (relocationTarget !== undefined) {
    return createVirtualYjsMovePlaceholder(relocationTarget);
  }
  const context = contexts.get(node);

  if (!context) {
    throw new Error(
      `Cannot resolve Yjs property context at ${path.join('.')}.`
    );
  }
  if (!isElement(node)) return createYjsNode(node, isSetValued, context);

  const element = createYjsNode(
    { ...node, children: [] },
    isSetValued,
    context
  );

  if (!(element instanceof Y.XmlElement)) {
    throw new Error('Cannot create a relocated Yjs element from text.');
  }
  if (node.children.length > 0) {
    element.insert(
      0,
      node.children.map((child, index) =>
        createYjsNodeWithRelocations(
          child,
          [...path, index],
          relocationTargets,
          isSetValued,
          contexts
        )
      )
    );
  }

  return element;
};

type PreparedEventImport = Readonly<{
  /**
   * Adopts the root the editor published for this import. A ticket the
   * bridge moved past, by a reset, a lowering or an earlier accept, does
   * nothing.
   */
  accept: (published: DocumentIndex) => void;
  change: DocumentChange;
  changedChildren: number;
  changedRanges: number;
  readTopLevelNodes: number;
}>;

export type YjsJoinRecovery = (
  before: readonly Descendant[],
  after: readonly Descendant[]
) => RootChange | null;

export type YjsEventImportResult =
  | Readonly<{
      fallback: YjsEventImportFallback;
      kind: 'fallback';
      recover?: YjsJoinRecovery;
    }>
  | Readonly<{ import: PreparedEventImport; kind: 'change' }>;

export type YjsEventLowerResult =
  | Readonly<{ fallback: YjsEventImportFallback; kind: 'fallback' }>
  | Readonly<{
      changedRanges: number;
      inserted: number;
      kind: 'lowered';
      removed: number;
      start: number;
      strategy: 'compatible' | 'range';
      tokenLengthNodes: number;
    }>;

const isYjsNode = (value: unknown): value is YjsNode =>
  value instanceof Y.XmlElement || value instanceof Y.XmlText;

const copyDelta = (
  delta: ReadonlyArray<Readonly<Record<string, unknown>>>
): CapturedYjsDeltaPart[] =>
  delta.map((part) => ({
    ...(typeof part.delete === 'number' ? { delete: part.delete } : {}),
    ...(part.insert === undefined
      ? {}
      : {
          insert: Array.isArray(part.insert) ? [...part.insert] : part.insert,
        }),
    ...(typeof part.retain === 'number' ? { retain: part.retain } : {}),
  }));

const changedEventKeys = (event: Y.YEvent<Y.AbstractType<unknown>>) => {
  if (event instanceof Y.YTextEvent) {
    return [...event.keysChanged];
  }
  if (event instanceof Y.YXmlEvent) {
    return [...event.attributesChanged];
  }

  return [...event.keys.keys()];
};

export const captureYjsEventBatch = (
  events: ReadonlyArray<Y.YEvent<Y.AbstractType<unknown>>>,
  transaction: Y.Transaction
): CapturedYjsEventBatch => {
  const deletedTextTargets = new Set<Y.XmlText>();

  Y.iterateDeletedStructs(transaction, transaction.deleteSet, (struct) => {
    if (struct instanceof Y.Item && struct.parent instanceof Y.XmlText) {
      deletedTextTargets.add(struct.parent);
    }
  });

  return {
    deletedTextTargets: [...deletedTextTargets],
    events: events.map((event) => {
      const childListChanged =
        'childListChanged' in event && event.childListChanged === true;

      return {
        childListChanged,
        delta: childListChanged ? copyDelta(event.delta) : [],
        deleted:
          childListChanged && event.target instanceof Y.XmlElement
            ? [...event.changes.deleted].map(({ content }) =>
                content instanceof Y.ContentType && isYjsNode(content.type)
                  ? content.type
                  : null
              )
            : [],
        keys: changedEventKeys(event),
        target: event.target,
      };
    }),
  };
};

export const mergeYjsEventBatches = (
  left: CapturedYjsEventBatch | null,
  right: CapturedYjsEventBatch
): CapturedYjsEventBatch =>
  left === null
    ? right
    : {
        deletedTextTargets: [
          ...new Set([...left.deletedTextTargets, ...right.deletedTextTargets]),
        ],
        events: [...left.events, ...right.events],
      };

const measureTokenLength = (
  node: Descendant
): Readonly<{ length: number; nodes: number }> => {
  if (NodeApi.isText(node)) {
    return { length: String(node.text).length + 2, nodes: 1 };
  }

  let length = 2;
  let nodes = 1;

  for (const child of node.children) {
    const measured = measureTokenLength(child);

    length += measured.length;
    nodes += measured.nodes;
  }

  return { length, nodes };
};

type TokenLengthNode = {
  left: TokenLengthNode | null;
  length: number;
  priority: number;
  right: TokenLengthNode | null;
  size: number;
  total: number;
};

let tokenLengthPrioritySeed = 0x9e_37_79_b9;

const nextTokenLengthPriority = (): number => {
  tokenLengthPrioritySeed ^= tokenLengthPrioritySeed << 13;
  tokenLengthPrioritySeed ^= tokenLengthPrioritySeed >>> 17;
  tokenLengthPrioritySeed ^= tokenLengthPrioritySeed << 5;

  return tokenLengthPrioritySeed >>> 0;
};

const tokenLengthSize = (node: TokenLengthNode | null): number =>
  node?.size ?? 0;

const tokenLengthTotal = (node: TokenLengthNode | null): number =>
  node?.total ?? 0;

const updateTokenLengthNode = (node: TokenLengthNode): TokenLengthNode => {
  node.size = tokenLengthSize(node.left) + tokenLengthSize(node.right) + 1;
  node.total =
    tokenLengthTotal(node.left) + node.length + tokenLengthTotal(node.right);

  return node;
};

const createTokenLengthNode = (length: number): TokenLengthNode => ({
  left: null,
  length,
  priority: nextTokenLengthPriority(),
  right: null,
  size: 1,
  total: length,
});

const mergeTokenLengthNodes = (
  left: TokenLengthNode | null,
  right: TokenLengthNode | null
): TokenLengthNode | null => {
  if (left === null) return right;
  if (right === null) return left;

  if (left.priority <= right.priority) {
    left.right = mergeTokenLengthNodes(left.right, right);

    return updateTokenLengthNode(left);
  }

  right.left = mergeTokenLengthNodes(left, right.left);

  return updateTokenLengthNode(right);
};

const splitTokenLengthNodes = (
  root: TokenLengthNode | null,
  count: number
): readonly [TokenLengthNode | null, TokenLengthNode | null] => {
  if (root === null) return [null, null];

  const leftSize = tokenLengthSize(root.left);

  if (count <= leftSize) {
    const [left, right] = splitTokenLengthNodes(root.left, count);

    root.left = right;

    return [left, updateTokenLengthNode(root)];
  }

  const [left, right] = splitTokenLengthNodes(root.right, count - leftSize - 1);

  root.right = left;

  return [updateTokenLengthNode(root), right];
};

class TokenLengthIndex {
  private measuredNodes = 0;
  private root: TokenLengthNode | null = null;

  constructor(children: readonly Descendant[]) {
    this.reset(children);
  }

  prefix(count: number): number {
    let length = 0;
    let remaining = Math.max(0, Math.min(count, tokenLengthSize(this.root)));
    let current = this.root;

    while (current !== null && remaining > 0) {
      const leftSize = tokenLengthSize(current.left);

      if (remaining <= leftSize) {
        current = current.left;
      } else {
        length += tokenLengthTotal(current.left) + current.length;
        remaining -= leftSize + 1;
        current = current.right;
      }
    }

    return length;
  }

  span(from: number, to: number): readonly [number, number] {
    const fromBoundary = this.boundary(from);

    if (from === to && fromBoundary !== null) {
      return [fromBoundary, fromBoundary];
    }

    const fromIndex =
      fromBoundary ?? Math.min(this.containing(from), this.length);
    const toBoundary = this.boundary(to);
    const toIndex =
      toBoundary ?? Math.min(this.containing(to) + 1, this.length);

    return [fromIndex, Math.max(fromIndex, toIndex)];
  }

  reset(children: NodeList<Descendant>): void {
    this.measuredNodes = 0;
    this.root = null;

    children.forEach((child) => {
      const measured = measureTokenLength(child);

      this.measuredNodes += measured.nodes;
      this.root = mergeTokenLengthNodes(
        this.root,
        createTokenLengthNode(measured.length)
      );
    });
  }

  set(index: number, node: Descendant): number {
    const measured = measureTokenLength(node);

    this.root = this.setAt(this.root, index, measured.length);

    return measured.nodes;
  }

  splice(
    index: number,
    deleteCount: number,
    inserted: readonly Descendant[]
  ): number {
    const [left, afterLeft] = splitTokenLengthNodes(this.root, index);
    const [, right] = splitTokenLengthNodes(afterLeft, deleteCount);
    let middle: TokenLengthNode | null = null;
    let measuredNodes = 0;

    for (const node of inserted) {
      const measured = measureTokenLength(node);

      measuredNodes += measured.nodes;
      middle = mergeTokenLengthNodes(
        middle,
        createTokenLengthNode(measured.length)
      );
    }

    this.root = mergeTokenLengthNodes(
      mergeTokenLengthNodes(left, middle),
      right
    );

    return measuredNodes;
  }

  move(from: number, to: number): void {
    if (from === to) return;

    const [left, afterLeft] = splitTokenLengthNodes(this.root, from);
    const [moved, right] = splitTokenLengthNodes(afterLeft, 1);
    const withoutMoved = mergeTokenLengthNodes(left, right);
    const [targetLeft, targetRight] = splitTokenLengthNodes(withoutMoved, to);

    this.root = mergeTokenLengthNodes(
      mergeTokenLengthNodes(targetLeft, moved),
      targetRight
    );
  }

  measurement(): number {
    return this.measuredNodes;
  }

  total(): number {
    return tokenLengthTotal(this.root);
  }

  get length(): number {
    return tokenLengthSize(this.root);
  }

  private boundary(position: number): number | null {
    if (position < 0 || position > this.total()) return null;

    let current = this.root;
    let index = 0;
    let offset = 0;

    while (current !== null) {
      const leftSize = tokenLengthSize(current.left);
      const start = offset + tokenLengthTotal(current.left);

      if (position < start) {
        current = current.left;
        continue;
      }
      if (position === start) return index + leftSize;

      const end = start + current.length;

      if (position < end) return null;
      if (position === end) return index + leftSize + 1;

      index += leftSize + 1;
      offset = end;
      current = current.right;
    }

    return position === offset ? index : null;
  }

  private containing(position: number): number {
    let current = this.root;
    let index = 0;
    let offset = 0;

    while (current !== null) {
      const leftSize = tokenLengthSize(current.left);
      const start = offset + tokenLengthTotal(current.left);

      if (position < start) {
        current = current.left;
        continue;
      }
      if (position < start + current.length) return index + leftSize;

      index += leftSize + 1;
      offset = start + current.length;
      current = current.right;
    }

    return index;
  }

  private setAt(
    node: TokenLengthNode | null,
    index: number,
    length: number
  ): TokenLengthNode {
    if (node === null) {
      throw new Error('Cannot update a missing Yjs mirror token length.');
    }

    const leftSize = tokenLengthSize(node.left);

    if (index < leftSize) {
      node.left = this.setAt(node.left, index, length);
    } else if (index > leftSize) {
      node.right = this.setAt(node.right, index - leftSize - 1, length);
    } else {
      node.length = length;
    }

    return updateTokenLengthNode(node);
  }
}

const rawYjsChildren = (node: Y.XmlElement): YjsNode[] =>
  readYjsChildren(node).filter(isYjsNode);

const isDeletedYjsNode = (node: YjsNode) => node._item?.deleted === true;

const hasProjectionAttributes = (node: YjsNode): boolean => {
  const attributes = getYjsAttributes(node);

  for (const key of YJS_CHILD_VISIBILITY_KEYS) {
    if (Object.hasOwn(attributes, key)) return true;
  }

  return false;
};

const hasProjectedContent = (node: YjsNode): boolean => {
  const stack: YjsNode[] = [node];

  for (let current = stack.pop(); current; current = stack.pop()) {
    if (hasProjectionAttributes(current)) return true;
    if (current instanceof Y.XmlElement) {
      stack.push(...rawYjsChildren(current));
    }
  }

  return false;
};

const getTopLevelNode = (
  root: Y.XmlElement,
  target: Y.AbstractType<unknown> | YjsNode
): YjsNode | null => {
  let current: Y.AbstractType<unknown> | YjsNode = target;
  let { parent } = current;

  while (parent !== null && parent !== root) {
    current = parent;
    ({ parent } = current);
  }

  return parent === root && isYjsNode(current) ? current : null;
};

const isDeltaLength = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

type RootStructuralRegion = Readonly<{
  beforeFrom: number;
  beforeTo: number;
  nodes: readonly YjsNode[];
}>;

const parseRootDelta = (
  before: RootProjectionIndex,
  delta: readonly CapturedYjsDeltaPart[]
): RootStructuralRegion[] | null => {
  const regions: Array<{
    beforeFrom: number;
    beforeTo: number;
    nodes: YjsNode[];
  }> = [];
  let beforeIndex = 0;
  let current:
    | {
        beforeFrom: number;
        beforeTo: number;
        nodes: YjsNode[];
      }
    | undefined;
  const flush = () => {
    if (!current) return;

    regions.push(current);
    current = undefined;
  };
  const begin = () =>
    (current ??= {
      beforeFrom: beforeIndex,
      beforeTo: beforeIndex,
      nodes: [],
    });

  for (const part of delta) {
    if (part.retain !== undefined) {
      flush();
      if (
        !isDeltaLength(part.retain) ||
        beforeIndex + part.retain > before.length
      ) {
        return null;
      }

      beforeIndex += part.retain;
    }
    if (part.delete !== undefined) {
      if (
        !isDeltaLength(part.delete) ||
        beforeIndex + part.delete > before.length
      ) {
        return null;
      }

      begin();
      beforeIndex += part.delete;
      (current ?? failInvariant('Expected value to be defined')).beforeTo =
        beforeIndex;
    }
    if (part.insert !== undefined) {
      if (!Array.isArray(part.insert) || !part.insert.every(isYjsNode)) {
        return null;
      }

      begin().nodes.push(...part.insert);
    }
  }
  flush();

  const inserted = new Set<YjsNode>();

  for (const region of regions) {
    for (const node of region.nodes) {
      if (inserted.has(node)) return null;
      inserted.add(node);

      const oldIndex = before.indexOf(node);

      if (
        oldIndex !== -1 &&
        !regions.some(
          ({ beforeFrom, beforeTo }) =>
            beforeFrom <= oldIndex && oldIndex < beforeTo
        )
      ) {
        return null;
      }
    }
  }

  return regions;
};

const parseProjectedRootInsertDelta = (
  root: Y.XmlElement,
  before: RootProjectionIndex,
  delta: readonly CapturedYjsDeltaPart[]
): RootStructuralRegion[] | null => {
  if (delta.some((part) => part.delete !== undefined)) return null;

  const regions: RootStructuralRegion[] = [];
  let visibleAfter: ReadonlySet<YjsNode> | undefined;
  const showsAfter = (node: YjsNode) =>
    !hasProjectionAttributes(node) ||
    (visibleAfter ??= new Set(getYjsVisibleChildren(root, root))).has(node);
  let beforeIndex = 0;
  let rawIndex = 0;

  for (const part of delta) {
    if (part.retain !== undefined) {
      if (
        !isDeltaLength(part.retain) ||
        rawIndex + part.retain > before.rawLength
      ) {
        return null;
      }

      const end = rawIndex + part.retain;

      while (rawIndex < end) {
        // Up to the next crossing child, each retained child shows itself or
        // nothing, and the batch could not change its projection attributes
        // without an earlier fallback, so their visible indexes run on.
        const crossing = Math.min(before.nextCrossing(rawIndex), end);
        const from = before.visibleBefore(rawIndex);
        const shown = before.visibleBefore(crossing) - from;

        if (shown > 0 && from !== beforeIndex) return null;

        beforeIndex += shown;
        rawIndex = crossing;
        if (rawIndex === end) break;

        const retained = before.rawAt(rawIndex);

        if (retained === undefined) return null;

        countCoreWork('yjsChildrenRead');

        const visibleIndex = before.indexOf(retained);

        if (visibleIndex !== -1) {
          if (visibleIndex !== beforeIndex) return null;

          beforeIndex += 1;
        } else if (!hasProjectionAttributes(retained)) {
          return null;
        }
        rawIndex += 1;
      }
    }
    if (part.insert !== undefined) {
      if (!Array.isArray(part.insert) || !part.insert.every(isYjsNode)) {
        return null;
      }

      const inserted = part.insert as readonly YjsNode[];

      if (inserted.some((node) => before.has(node) || !showsAfter(node))) {
        return null;
      }

      regions.push({
        beforeFrom: beforeIndex,
        beforeTo: beforeIndex,
        nodes: inserted,
      });
    }
  }

  return regions;
};

const finalizeRootRegions = (
  base: readonly RootStructuralRegion[],
  normalizedNodes: readonly YjsNode[],
  before: RootProjectionIndex
): Array<EventImportRegion & { nodes: readonly YjsNode[] }> | null => {
  const regions: Array<{
    beforeFrom: number;
    beforeTo: number;
    nodes: YjsNode[];
  }> = base.map((region) => ({
    beforeFrom: region.beforeFrom,
    beforeTo: region.beforeTo,
    nodes: [...region.nodes],
  }));

  for (const node of normalizedNodes) {
    const oldIndex = before.indexOf(node);

    if (oldIndex === -1) continue;
    for (const region of regions) {
      region.nodes = region.nodes.filter((candidate) => candidate !== node);
    }
    if (
      !regions.some(
        ({ beforeFrom, beforeTo }) =>
          beforeFrom <= oldIndex && oldIndex < beforeTo
      )
    ) {
      regions.push({
        beforeFrom: oldIndex,
        beforeTo: oldIndex + 1,
        nodes: [],
      });
    }
  }

  regions.sort((left, right) => left.beforeFrom - right.beforeFrom);

  let offset = 0;
  let previousTo = 0;
  const finalized: Array<EventImportRegion & { nodes: readonly YjsNode[] }> =
    [];

  for (const region of regions) {
    if (region.beforeFrom < previousTo) return null;

    const afterFrom = region.beforeFrom + offset;
    const afterTo = afterFrom + region.nodes.length;

    finalized.push({
      afterFrom,
      afterTo,
      beforeFrom: region.beforeFrom,
      beforeTo: region.beforeTo,
      nodes: region.nodes,
    });
    offset += region.nodes.length - (region.beforeTo - region.beforeFrom);
    previousTo = region.beforeTo;
  }

  return before.length + offset > 0 ? finalized : null;
};

const mapRootNodeIndex = (
  beforeIndex: number,
  regions: ReadonlyArray<
    EventImportRegion & {
      nodes: readonly YjsNode[];
    }
  >
): number | undefined => {
  let offset = 0;

  for (const region of regions) {
    if (beforeIndex < region.beforeFrom) return beforeIndex + offset;
    if (beforeIndex < region.beforeTo) return undefined;

    offset += region.nodes.length - (region.beforeTo - region.beforeFrom);
  }

  return beforeIndex + offset;
};

const mergeRegions = (
  regions: readonly EventImportRegion[]
): EventImportRegion[] => {
  const ordered = [...regions].sort(
    (left, right) =>
      left.beforeFrom - right.beforeFrom || left.afterFrom - right.afterFrom
  );
  const merged: EventImportRegion[] = [];

  for (const region of ordered) {
    const previous = merged.at(-1);

    if (
      previous &&
      (region.beforeFrom < previous.beforeTo ||
        region.afterFrom < previous.afterTo)
    ) {
      previous.beforeTo = Math.max(previous.beforeTo, region.beforeTo);
      previous.afterTo = Math.max(previous.afterTo, region.afterTo);
    } else {
      merged.push({ ...region });
    }
  }

  return merged;
};

type LowerTokenRange = Readonly<{
  beforeFrom: number;
  beforeTo: number;
  fromAfter: number;
  fromBefore: number;
  toAfter: number;
  toBefore: number;
}>;

const internalDocumentChangeRoot = (root: string | null) => root ?? 'main';

const sparseLowerRegions = (
  change: DocumentChange,
  rootKey: string,
  before: NodeList<Descendant>,
  after: NodeList<Descendant>,
  lengths: TokenLengthIndex
): EventImportRegion[] | null => {
  const ranges: LowerTokenRange[] = [];

  change.iterChangedRanges((root, fromBefore, toBefore, fromAfter, toAfter) => {
    if (internalDocumentChangeRoot(root) !== rootKey) return;

    const [beforeFrom, beforeTo] = lengths.span(fromBefore, toBefore);

    ranges.push({
      beforeFrom,
      beforeTo,
      fromAfter,
      fromBefore,
      toAfter,
      toBefore,
    });
  });

  if (before.length === after.length) {
    return mergeRegions(
      ranges.map(({ beforeFrom, beforeTo }) => ({
        afterFrom: beforeFrom,
        afterTo: beforeTo,
        beforeFrom,
        beforeTo,
      }))
    );
  }

  ranges.sort(
    (left, right) =>
      left.beforeFrom - right.beforeFrom || left.fromBefore - right.fromBefore
  );

  const regions: EventImportRegion[] = [];

  for (const range of ranges) {
    const previous = regions.at(-1);
    const afterFrom = previous
      ? previous.afterTo + (range.beforeFrom - previous.beforeTo)
      : range.beforeFrom;
    const beforeBoundary = lengths.prefix(range.beforeFrom);
    const afterBoundary = range.fromAfter - (range.fromBefore - beforeBoundary);
    const requiredLength = range.toAfter - afterBoundary;

    if (
      afterFrom < 0 ||
      afterFrom > after.length ||
      requiredLength < 0 ||
      range.beforeFrom < (previous?.beforeTo ?? 0)
    ) {
      return null;
    }

    let afterTo = afterFrom;
    let measuredLength = 0;

    while (afterTo < after.length && measuredLength < requiredLength) {
      const node = after.at(afterTo);

      if (!node) return null;

      measuredLength += measureTokenLength(node).length;
      afterTo += 1;
    }

    if (measuredLength < requiredLength) return null;

    regions.push({
      afterFrom,
      afterTo,
      beforeFrom: range.beforeFrom,
      beforeTo: range.beforeTo,
    });
  }

  const last = regions.at(-1);

  if (last && after.length - last.afterTo !== before.length - last.beforeTo) {
    return null;
  }

  return mergeRegions(regions);
};

const createEventDocumentChange = (
  root: string,
  before: NodeList<Descendant>,
  after: (from: number, to: number) => readonly Descendant[],
  regions: readonly EventImportRegion[],
  lengths: TokenLengthIndex,
  isSetValued: YjsSetPropertyResolver,
  joins: readonly FoundJoin[] = []
): {
  change: DocumentChange;
  changedChildren: number;
  changedRanges: number;
} => {
  let contexts: ReturnType<typeof indexYjsPropertyContexts> | undefined;
  const resolve = (node: JsonNode, key: string) => {
    contexts ??= indexYjsPropertyContexts(
      before,
      root === 'main' ? null : root,
      regions.map((region) => ({
        from: region.beforeFrom,
        to: region.beforeTo,
      }))
    );
    const context = contexts.get(node);

    return context ? isSetValued(node, key, context) : false;
  };
  const sectionInputs = regions.map((region) => {
    const regionAfter = Object.freeze(after(region.afterFrom, region.afterTo));
    const regionBefore = Object.freeze(
      before.slice(region.beforeFrom, region.beforeTo)
    );
    const inside = joins.filter(
      ({ lines }) =>
        region.beforeFrom <= lines[0][0] && lines[0][0] < region.beforeTo
    );
    const local =
      inside.length === 0
        ? null
        : joinedChange(
            DocumentIndex.fromValue(regionBefore),
            regionAfter,
            inside.map((join) => ({
              after: join.after === null ? null : join.after - region.afterFrom,
              edits: join.edits,
              lines: join.lines.map(([top, ...rest]) => [
                top - region.beforeFrom,
                ...rest,
              ]),
              removedElements: join.removedElements,
            })),
            (left, right) =>
              RootChange.between(left, right, {
                isSetValued: resolve,
                root: root === 'main' ? null : root,
              })
          );

    return Object.freeze({
      after: regionAfter,
      before: regionBefore,
      from: lengths.prefix(region.beforeFrom),
      ...(local ? { local } : {}),
    });
  });
  const result = createDocumentChangeFromRootSections(
    root,
    lengths.total(),
    sectionInputs,
    resolve
  );
  const changedSections = new Set(result.changedSections);
  let changedChildren = 0;

  regions.forEach((region, index) => {
    if (!changedSections.has(index)) return;

    changedChildren += Math.max(
      region.beforeTo - region.beforeFrom,
      region.afterTo - region.afterFrom
    );
  });

  return {
    change: result.change,
    changedChildren,
    changedRanges: changedSections.size,
  };
};

const eventNormalizationTargets = (batch: CapturedYjsEventBatch) => {
  const insertedNodes = new Set<YjsNode>();
  const parents = new Set<Y.XmlElement>();
  const recursiveRoots = new Set<Y.XmlElement>();
  const truncatedTextNodes = new Set(batch.deletedTextTargets);
  const hidden = new Set<YjsNode>();

  for (const event of batch.events) {
    if (event.childListChanged && event.target instanceof Y.XmlElement) {
      parents.add(event.target);
    }
    if (
      isYjsNode(event.target) &&
      event.keys.includes(YJS_HIDDEN_KEY) &&
      getYjsAttributes(event.target)[YJS_HIDDEN_KEY] === true
    ) {
      hidden.add(event.target);
    }
    if (event.target instanceof Y.XmlText) {
      const { parent } = event.target;

      if (parent instanceof Y.XmlElement) parents.add(parent);
      if (event.delta.some((part) => part.delete !== undefined)) {
        truncatedTextNodes.add(event.target);
      }
    }

    for (const part of event.delta) {
      if (!Array.isArray(part.insert)) continue;

      for (const inserted of part.insert) {
        if (!isYjsNode(inserted)) continue;

        insertedNodes.add(inserted);
        if (inserted instanceof Y.XmlElement) recursiveRoots.add(inserted);
      }
    }
  }

  return {
    newlyHidden: new Set(
      [...hidden].filter((node) => !insertedNodes.has(node))
    ),
    insertedNodes,
    parents,
    recursiveRoots,
    truncatedTextNodes,
  };
};

type JoinWrite = Readonly<{
  edit: () => void;
  joined: readonly number[];
  lines: ReadonlyArray<readonly number[]>;
  parent: Y.XmlElement;
  place: () => void;
  removed: readonly YjsNode[];
}>;

const propertiesOf = (node: Element) =>
  Object.fromEntries(
    Object.entries(node).filter(([key]) => key !== 'children')
  );

export class YjsEventChangeBridge {
  private readonly fit: YjsImportFit;
  // Moves on every reset, lowering and accept, so an import prepared before
  // one of them cannot adopt its root.
  private generation = 0;
  // The root's top-level children as the editor last published them, which
  // the Yjs root matches. A commit or an import hands over the editor's node
  // list, so a key reads only the nodes it changed.
  private mirror: NodeList<Descendant>;
  private readonly isSetValued: YjsSetPropertyResolver;
  private readonly lengths: TokenLengthIndex;
  private readonly maskedBlocks = new Set<YjsNode>();
  private readonly writtenMaskedBlocks = new Set<YjsNode>();
  private ready = false;
  private readonly root: Y.XmlElement;
  private readonly rootIndex = new RootProjectionIndex();
  private readonly rootKey: string;
  private readonly schemaRoot: string | null;

  constructor(
    root: Y.XmlElement,
    rootKey: string,
    children: NodeList<Descendant>,
    isSetValued: YjsSetPropertyResolver = () => false,
    fit: YjsImportFit = UNCHECKED_IMPORT_FIT
  ) {
    this.fit = fit;
    this.mirror = children;
    this.isSetValued = isSetValued;
    this.lengths = new TokenLengthIndex([]);
    this.root = root;
    this.rootKey = rootKey;
    this.schemaRoot = rootKey === 'main' ? null : rootKey;
    this.reset(children);
  }

  get synchronized(): NodeList<Descendant> {
    return this.mirror;
  }

  private setMirror(children: NodeList<Descendant>) {
    this.generation += 1;
    this.mirror = children;
  }

  lower(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    options: Readonly<{
      /** The commit's indexes of this root, which relocation reads. */
      indexes: () => Readonly<{ after: DocumentIndex; before: DocumentIndex }>;
      structureChanged: boolean;
    }>
  ): YjsEventLowerResult {
    this.writtenMaskedBlocks.clear();
    for (const node of this.maskedBlocks) {
      const index = this.rootIndex.indexOf(node);

      if (index !== -1 && this.mirror.at(index) !== expected.at(index)) {
        this.writtenMaskedBlocks.add(node);
      }
    }
    const result = withYjsRootIndex(this.root, this.rootIndex, () =>
      this.lowerAgainstMirror(change, expected, options)
    );

    // Keep the list the caller passes, so its next commit finds the mirror
    // by identity.
    if (result.kind === 'lowered') this.setMirror(expected);

    return result;
  }

  private lowerAgainstMirror(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    {
      indexes,
      structureChanged,
    }: Readonly<{
      indexes: () => Readonly<{ after: DocumentIndex; before: DocumentIndex }>;
      structureChanged: boolean;
    }>
  ): YjsEventLowerResult {
    if (!this.ready || this.rootIndex.length !== this.mirror.length) {
      return { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' };
    }
    if (!structureChanged) return this.lowerRegions(change, expected, []);

    const joined = this.lowerJoins(change, indexes().before);

    if (!joined) return this.lowerStructure(change, expected, indexes);
    if (joined.rest === null) return joined.lowered;

    const rest = this.lowerStructure(joined.rest, expected, () => ({
      after: indexes().after,
      before: joined.middle,
    }));

    return rest.kind === 'lowered' && joined.lowered.kind === 'lowered'
      ? {
          ...rest,
          changedRanges: rest.changedRanges + joined.lowered.changedRanges,
          tokenLengthNodes:
            rest.tokenLengthNodes + joined.lowered.tokenLengthNodes,
        }
      : rest;
  }

  /**
   * Write the commit's joins as the shape Yjs keeps for a move: each joined
   * line's own edits from the commit's sections while the lines are apart,
   * then a placeholder in the first line for each child of the lines joined
   * into it, then the joined and removed lines hidden. Returns the document
   * the rest of the commit applies to and that rest, or null, before any
   * write, when the commit holds no join this can write.
   */
  private lowerJoins(
    change: DocumentChange,
    before: DocumentIndex
  ): Readonly<{
    lowered: YjsEventLowerResult;
    middle: DocumentIndex;
    rest: DocumentChange | null;
  }> | null {
    const committed = getInternalDocumentRootChange(change, this.rootKey);

    if (!committed) return null;

    const rootChange = withoutEqualEdges(committed, before);
    const runs = joinRunsOf(rootChange, before);

    if (runs.length === 0) return null;

    const split = splitAtRuns(rootChange, runs);

    if (
      !split ||
      runs.some((run, index) =>
        runs.some(
          (other, at) =>
            at !== index &&
            other.range.from <= run.range.from &&
            run.range.to <= other.range.to
        )
      )
    ) {
      return null;
    }

    let middle: DocumentIndex;

    // The commit's edits inside the joined lines need not balance on their
    // own, as a wrapper that closes after the lines shows.
    try {
      middle = split.inner.apply(before);
    } catch (error) {
      if (error instanceof PreparedTokenSliceStructureError) return null;
      throw error;
    }

    const planned: JoinWrite[] = [];

    for (const run of runs) {
      const write = this.planJoin(run, before, middle, split.inner);

      if (!write) return null;
      planned.push(write);
    }

    for (const write of planned) write.edit();
    for (const write of planned) write.place();

    const removals = new Map<Y.XmlElement, YjsNode[]>();

    for (const { parent, removed } of planned) {
      removals.set(parent, [...(removals.get(parent) ?? []), ...removed]);
    }
    for (const [parent, nodes] of removals) {
      const visible = this.visibleChildrenOf(parent);
      const indexes = nodes
        .map((node) => [visible.indexOf(node), node] as const)
        .sort(([a], [b]) => b - a);

      for (const [index, node] of indexes) {
        if (
          index !== -1 &&
          !removeYjsVirtualPlaceholderChild(this.root, parent, index, node)
        ) {
          removeYjsChild(this.root, parent, index);
        }
      }
    }

    let tokenLengthNodes = 0;

    for (const { joined, lines } of planned) {
      if (lines[0].length > 1) {
        tokenLengthNodes += this.lengths.set(
          lines[0][0],
          middle.child(joined[0]) as Descendant
        );
      }
    }
    for (const { joined, lines } of [...planned].reverse()) {
      if (lines[0].length === 1) {
        tokenLengthNodes += this.lengths.splice(
          lines[0][0],
          getDefined(lines.at(-1))[0] - lines[0][0] + 1,
          [middle.child(joined[0]) as Descendant]
        );
      }
    }

    this.setMirror(middle.nodes as NodeList<Descendant>);
    this.ready = this.rootIndex.length === this.mirror.length;

    const lowered: YjsEventLowerResult = this.ready
      ? {
          changedRanges: runs.length,
          inserted: 0,
          kind: 'lowered',
          removed: 0,
          start: runs[0].lines[0][0],
          strategy: 'compatible',
          tokenLengthNodes,
        }
      : { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' };
    const rest = split.outer.sections.some(
      (value, index) => index % 2 === 1 && value !== -1
    );

    return {
      lowered,
      middle,
      rest:
        rest && this.ready
          ? createInternalDocumentChange(new Map([[this.rootKey, split.outer]]))
          : null,
    };
  }

  /**
   * Plan one run's writes, reading each joined line's children against its
   * Yjs children and the joined line's children in order. Returns null when
   * they do not line up.
   */
  private planJoin(
    run: JoinRun,
    before: DocumentIndex,
    middle: DocumentIndex,
    inner: RootChange
  ): JoinWrite | null {
    const parentAt = run.lines[0].slice(0, -1);
    const parent =
      parentAt.length === 0 ? this.root : getYjsNodeIf(this.root, parentAt);

    if (!(parent instanceof Y.XmlElement)) return null;

    const childAt = (path: readonly number[]) =>
      parent === this.root
        ? this.rootIndex.at(getDefined(path.at(-1)))
        : getYjsNodeIf(this.root, path);
    const lines = run.lines.map(childAt);
    const removed = run.removed.map(childAt);
    const joinedAt = middle.nodeStartingAt(
      getDefined(inner.mapPos(run.range.from, 1))
    );
    const joinedPath = joinedAt?.path;
    const joined = joinedPath && middle.node(joinedPath);
    const first = before.node(run.lines[0]);

    if (
      !joinedPath ||
      !NodeApi.isElement(joined) ||
      !NodeApi.isElement(first) ||
      !lines.every((line) => line instanceof Y.XmlElement) ||
      !removed.every((node) => node !== undefined && node !== null)
    ) {
      return null;
    }

    const yjsLines = lines as Y.XmlElement[];
    const { children } = joined;
    const location = (offset: number) =>
      createYjsPropertyLocationAt(
        middle.nodes as NodeList<Descendant>,
        joinedPath,
        this.schemaRoot,
        offset
      );
    let at = 0;
    let used = 0;
    const take = (count: number): Text[] | null => {
      const leaves: Text[] = [];
      const leaf = children[at];
      let letters = count;

      if (letters === 0) {
        if (used === 0 && NodeApi.isText(leaf) && leaf.text === '') {
          at += 1;

          return [leaf];
        }

        return [];
      }

      while (letters > 0) {
        const text = children[at];

        if (!NodeApi.isText(text) || text.text.length === used) return null;

        const taken = Math.min(letters, text.text.length - used);

        leaves.push({ ...text, text: text.text.slice(used, used + taken) });
        used += taken;
        letters -= taken;
        if (used === text.text.length) {
          at += 1;
          used = 0;
        }
      }

      return leaves;
    };
    const edits: Array<() => void> = [];
    const gone: Array<readonly [Y.XmlElement, YjsNode]> = [];

    for (const [index, path] of run.lines.entries()) {
      const line = before.node(path);
      const yjsLine = yjsLines[index];

      if (!NodeApi.isElement(line)) return null;

      const retyped = line.type !== joined.type;
      const segments = segmentPliteChildren(line.children);
      const targets = alignSegments(
        segments,
        segmentYjsChildren(getYjsVisibleChildren(this.root, yjsLine))
      );

      if (!targets) return null;

      for (const [order, segment] of segments.entries()) {
        const target = targets[order];

        if (segment.kind === 'text') {
          const { from } = before.nodeRange([...path, segment.from]);
          const { to } = before.nodeRange([
            ...path,
            segment.from + segment.leaves.length - 1,
          ]);
          const diff = letterEditsIn(inner, before, from, to);
          const offset = at;
          const after =
            diff &&
            take(
              diff.reduce(
                (count, [operation, value]) =>
                  operation === DiffOp.Delete ? count : count + value.length,
                0
              )
            );

          if (!diff || !after) return null;
          if (target?.kind !== 'text') {
            if (after.some((leaf) => leaf.text !== '')) return null;
            continue;
          }

          const encode = createYjsRunEncoder(
            this.isSetValued,
            location(offset)
          );

          edits.push(() =>
            retyped
              ? rewriteTextRuns(target.chain, after, encode, { diff })
              : writeTextRuns(target.chain, segment.leaves, after, encode, {
                  diff,
                })
          );
          continue;
        }

        if (target?.kind !== 'element') return null;

        const range = before.nodeRange([...path, segment.from]);
        const edit = editOf(inner, range.from, range.to);

        if (edit === 'removed') {
          gone.push([yjsLine, target.node]);
          continue;
        }
        if (used !== 0) return null;

        const next = children[at];

        if (!NodeApi.isElement(next)) return null;
        at += 1;
        if (edit === 'kept') continue;

        const yjsChildren = getYjsVisibleChildren(this.root, target.node);

        if (
          !canReplaceCompatibleYjsChildren(
            this.root,
            yjsChildren,
            segment.node.children,
            next.children
          )
        ) {
          return null;
        }

        const inlineLocation = createYjsPropertyLocationAt(
          middle.nodes as NodeList<Descendant>,
          [...joinedPath, at - 1],
          this.schemaRoot
        );

        edits.push(() =>
          replaceCompatibleYjsChildren(
            this.root,
            yjsChildren,
            segment.node.children,
            next.children,
            0,
            this.isSetValued,
            inlineLocation,
            retyped || segment.node.type !== next.type
          )
        );
      }
    }

    if (at !== children.length || used !== 0) return null;

    const firstProperties = propertiesOf(first);
    const joinedProperties = propertiesOf(joined);

    if (!areJsonLikeValuesEqual(firstProperties, joinedProperties)) {
      const context = createYjsPropertyContext(joined, {
        ...createYjsPropertyLocationAt(
          middle.nodes as NodeList<Descendant>,
          joinedPath.slice(0, -1),
          this.schemaRoot
        ),
        path: joinedPath,
      });

      edits.push(() =>
        setYjsElementAttributes(
          yjsLines[0],
          firstProperties,
          joinedProperties,
          (key) => this.isSetValued(joined, key, context)
        )
      );
    }

    return {
      edit: () => {
        for (const write of edits) write();
        for (const [line, node] of gone) {
          const index = getYjsVisibleChildren(this.root, line).indexOf(node);

          if (
            index !== -1 &&
            !removeYjsVirtualPlaceholderChild(this.root, line, index, node)
          ) {
            removeYjsChild(this.root, line, index);
          }
        }
      },
      joined: joinedPath,
      lines: run.lines,
      parent,
      place: () => {
        let end = getYjsVisibleChildren(this.root, yjsLines[0]).length;

        for (const line of yjsLines.slice(1)) {
          for (const child of getYjsVisibleChildren(this.root, line)) {
            insertYjsChild(
              this.root,
              yjsLines[0],
              end,
              createVirtualYjsMovePlaceholder(child)
            );
            end += 1;
          }
        }
      },
      removed: [...yjsLines.slice(1), ...removed],
    };
  }

  private lowerStructure(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    indexes: () => Readonly<{ after: DocumentIndex; before: DocumentIndex }>
  ): YjsEventLowerResult {
    const window = this.windowOf(change, expected);

    if (window === 'mismatch') {
      return { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' };
    }
    if (window === null) return this.lowerRegions(change, expected, []);
    if (window !== 'many' && sameSkeleton(window.before, window.after)) {
      return this.lowerRegions(change, expected, []);
    }

    const splitResult =
      window === 'many'
        ? null
        : this.lowerCanonicalSplit(change, expected, window);

    if (splitResult !== null) return splitResult;

    const exactMove = getExactDocumentChangeRelocation(
      change,
      this.rootKey,
      indexes().before
    );
    const relocationResult = exactMove
      ? this.lowerExactRelocation(change, expected, exactMove)
      : null;

    if (relocationResult !== null) return relocationResult;

    const detected =
      window === 'many'
        ? null
        : (this.lowerElementBoundarySplit(change, expected, window) ??
          this.lowerInlineTextCut(change, expected, window) ??
          this.lowerNestedChildSplice(change, expected, window));

    if (detected !== null) return detected;

    const { after, before } = indexes();

    return this.lowerRegions(
      change,
      expected,
      exactMove
        ? [exactMove]
        : getDocumentChangeRelocations(change, this.rootKey, before, after)
    );
  }

  /**
   * Every block after the changed span is retained, so the after span ends as
   * far from the root's end. Detectors trim inside the window, so a change
   * between equal neighbors stays on the block it touched, where a whole-root
   * trim could slide it to an equal one. A change that leaves blocks untouched
   * between its ranges, such as a move, is `'many'`, because each detector
   * expects one changed stretch.
   */
  private windowOf(
    change: DocumentChange,
    expected: NodeList<Descendant>
  ): RootWindow | 'many' | 'mismatch' | null {
    const spans: Array<readonly [number, number]> = [];

    change.iterChangedRanges((root, fromA, toA) => {
      if (internalDocumentChangeRoot(root) === this.rootKey) {
        spans.push(this.lengths.span(fromA, toA));
      }
    });
    if (spans.length === 0) return null;

    spans.sort(([a], [b]) => a - b);

    const [from, first] = spans[0];
    let to = first;

    for (const [start, end] of spans) {
      if (start > to) return 'many';
      to = Math.max(to, end);
    }

    const afterTo = to + expected.length - this.mirror.length;

    if (
      to > this.mirror.length ||
      afterTo < from ||
      afterTo > expected.length
    ) {
      return 'mismatch';
    }

    return {
      after: expected.slice(from, afterTo),
      before: this.mirror.slice(from, to),
      from,
    };
  }

  private lowerRegions(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    relocations: readonly DocumentChangeRelocation[]
  ): YjsEventLowerResult {
    const mergedRegions = sparseLowerRegions(
      change,
      this.rootKey,
      this.mirror,
      expected,
      this.lengths
    );

    if (mergedRegions === null) {
      return { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' };
    }

    if (mergedRegions.length === 0) {
      if (expected !== this.mirror) {
        return {
          fallback: 'remote-event-mirror-mismatch',
          kind: 'fallback',
        };
      }

      return {
        changedRanges: 0,
        inserted: 0,
        kind: 'lowered',
        removed: 0,
        start: 0,
        strategy: 'compatible',
        tokenLengthNodes: 0,
      };
    }

    if (relocations.length > 0) {
      const relocated = this.lowerCompositeRelocations(
        expected,
        mergedRegions,
        relocations
      );

      if (relocated !== null) return relocated;
    }

    for (const region of mergedRegions) {
      const touched = this.rootIndex.slice(region.beforeFrom, region.beforeTo);

      if (
        touched.some(hasProjectedContent) &&
        !canReplaceCompatibleYjsChildren(
          this.root,
          touched,
          this.mirror.slice(region.beforeFrom, region.beforeTo),
          expected.slice(region.afterFrom, region.afterTo),
          0
        )
      ) {
        return {
          fallback: 'remote-event-projected-content',
          kind: 'fallback',
        };
      }
    }

    let inserted = 0;
    let removed = 0;
    let tokenLengthNodes = 0;
    let strategy: 'compatible' | 'range' = 'compatible';
    let regionIndex = mergedRegions.length - 1;

    while (regionIndex >= 0) {
      const region = mergedRegions[regionIndex];

      if (region === undefined) {
        regionIndex -= 1;
        continue;
      }

      const before = this.mirror.slice(region.beforeFrom, region.beforeTo);
      const after = expected.slice(region.afterFrom, region.afterTo);
      const touched = this.rootIndex.slice(region.beforeFrom, region.beforeTo);
      const compatible = replaceCompatibleYjsChildren(
        this.root,
        touched,
        before,
        after,
        0,
        this.isSetValued,
        {
          ancestors: [],
          offset: region.afterFrom,
          path: [],
          root: this.schemaRoot,
        }
      );

      if (!compatible) {
        strategy = 'range';

        let removeCount = region.beforeTo - region.beforeFrom;
        let removedIndex = 0;

        while (removeCount > 0) {
          const target = touched[removedIndex];

          if (
            target === undefined ||
            !removeYjsVirtualPlaceholderChild(
              this.root,
              this.root,
              region.beforeFrom,
              target
            )
          ) {
            removeYjsChild(
              this.root,
              this.root,
              region.beforeFrom,
              before[removedIndex]
            );
          }
          removeCount -= 1;
          removedIndex += 1;
          removed += 1;
        }

        const insertedNodes = after.map((node, index) =>
          createYjsNode(
            node,
            this.isSetValued,
            createYjsPropertyContext(node, {
              ancestors: [],
              path: [region.afterFrom + index],
              root: this.schemaRoot,
            })
          )
        );
        let insertIndex = 0;

        while (insertIndex < insertedNodes.length) {
          const node = insertedNodes[insertIndex];

          if (node !== undefined) {
            insertYjsChild(
              this.root,
              this.root,
              region.beforeFrom + insertIndex,
              node
            );
            inserted += 1;
          }
          insertIndex += 1;
        }
      }

      if (
        region.beforeTo - region.beforeFrom ===
        region.afterTo - region.afterFrom
      ) {
        for (let index = region.afterFrom; index < region.afterTo; index++) {
          const node = expected.at(index);

          if (node) {
            tokenLengthNodes += this.lengths.set(
              region.beforeFrom + (index - region.afterFrom),
              node
            );
          }
        }
      } else {
        tokenLengthNodes += this.lengths.splice(
          region.beforeFrom,
          region.beforeTo - region.beforeFrom,
          after
        );
      }

      regionIndex -= 1;
    }
    this.ready = this.rootIndex.length === expected.length;

    return {
      changedRanges: mergedRegions.length,
      inserted,
      kind: 'lowered',
      removed,
      start: mergedRegions[0]?.beforeFrom ?? 0,
      strategy,
      tokenLengthNodes,
    };
  }

  private lowerElementBoundarySplit(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    window: RootWindow
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const found = findTopLevelElementSplit(window.before, window.after);

    if (found === null) return null;

    const split = { ...found, from: found.from + window.from };

    const original = this.rootIndex.at(split.from);

    if (!(original instanceof Y.XmlElement)) return null;

    const rightChildren = splitVisibleYjsChildren(
      this.root,
      original,
      split.position
    );
    const right = createYjsNode(
      { ...split.right, children: [] },
      this.isSetValued,
      createYjsPropertyContext(split.right, {
        ancestors: [],
        path: [split.from + 1],
        root: this.schemaRoot,
      })
    );

    if (!(right instanceof Y.XmlElement)) return null;

    if (rightChildren.length > 0) {
      right.insert(0, [...rightChildren]);
    }
    insertYjsChild(this.root, this.root, split.from + 1, right);

    let changedRanges = 0;

    change.iterChangedRanges((root) => {
      if (internalDocumentChangeRoot(root) === this.rootKey) changedRanges += 1;
    });

    const tokenLengthNodes = this.lengths.splice(split.from, 1, [
      split.left,
      split.right,
    ]);

    this.ready = this.rootIndex.length === expected.length;

    return {
      changedRanges,
      inserted: 1,
      kind: 'lowered',
      removed: 0,
      start: split.from,
      strategy: 'compatible',
      tokenLengthNodes,
    };
  }

  private lowerInlineTextCut(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    window: RootWindow
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const found = findInlineTextCut(window.before, window.after);
    if (!found) return null;
    const cut = {
      ...found,
      parentPath: shiftPath(found.parentPath, window.from),
    };
    const parent = getYjsNodeIf(this.root, [...cut.parentPath]);
    if (!(parent instanceof Y.XmlElement)) return null;
    const group = segmentYjsChildren(getYjsVisibleChildren(this.root, parent))[
      cut.group
    ];
    if (group?.kind !== 'text') return null;
    const keptLength = textOf(cut.leaves).length;
    const before: Text[] = [];
    let offset = 0;
    for (const leaf of cut.before) {
      const start = Math.max(0, cut.offset - offset);
      const end = Math.min(leaf.text.length, cut.offset + keptLength - offset);
      if (end > start) {
        before.push({ ...leaf, text: leaf.text.slice(start, end) });
      }
      offset += leaf.text.length;
    }
    // Trim the existing Yjs text rather than re-create it, so a peer's
    // concurrent edit inside the kept piece survives.
    retainTextChainRange(group.chain, cut.offset, keptLength);
    const location = createYjsPropertyLocationAt(
      expected,
      [...cut.parentPath],
      this.schemaRoot
    );
    writeTextRuns(
      group.chain,
      before.length ? before : [{ text: '' }],
      cut.leaves,
      createYjsRunEncoder(this.isSetValued, {
        ...location,
        offset: cut.from + cut.kept,
      })
    );
    const prefix = createYjsNodes(
      cut.after.slice(0, cut.kept),
      this.isSetValued,
      { ...location, offset: cut.from }
    );
    const suffix = createYjsNodes(
      cut.after.slice(cut.kept + cut.leaves.length),
      this.isSetValued,
      { ...location, offset: cut.from + cut.kept + cut.leaves.length }
    );
    suffix.forEach((node, index) =>
      insertYjsChild(
        this.root,
        parent,
        group.from + group.chain.length + index,
        node
      )
    );
    prefix.forEach((node, index) =>
      insertYjsChild(this.root, parent, group.from + index, node)
    );
    const topIndex = cut.parentPath[0];
    const topNode = expected.at(topIndex);
    const tokenLengthNodes = topNode ? this.lengths.set(topIndex, topNode) : 0;
    this.ready = this.rootIndex.length === expected.length;
    let changedRanges = 0;
    change.iterChangedRanges((root) => {
      if (internalDocumentChangeRoot(root) === this.rootKey) changedRanges += 1;
    });
    return {
      changedRanges,
      inserted: prefix.length + suffix.length,
      kind: 'lowered',
      removed: 0,
      start: topIndex,
      strategy: 'compatible',
      tokenLengthNodes,
    };
  }

  private lowerNestedChildSplice(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    window: RootWindow
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const splice = inRoot(
      findNestedChildSplice(window.before, window.after),
      window.from
    );

    if (splice === null) return null;

    const parent = getYjsNodeIf(this.root, [...splice.parentPath]);

    if (!(parent instanceof Y.XmlElement)) return null;

    const visible = getYjsVisibleChildren(this.root, parent);
    const touched = visible.slice(
      splice.from,
      splice.from + splice.before.length
    );
    const beforeSiblings = splice.parentPath.reduce<NodeList<Descendant>>(
      (siblings, index) => (siblings.at(index) as Element).children,
      this.mirror
    );

    const corresponds =
      visible.length === beforeSiblings.length &&
      visible.every((node, index) => {
        const sibling = beforeSiblings.at(index) ?? null;

        return node instanceof Y.XmlText
          ? isText(sibling) && sibling.text.length === node.length
          : !isText(sibling);
      });

    if (!corresponds) {
      return this.lowerElementSplice(
        change,
        expected,
        splice,
        parent,
        elementOnlySpliceEdits(beforeSiblings.slice(), splice, visible)
      );
    }

    const projected =
      hasProjectedContent(parent) ||
      touched.some((node) => hasProjectedContent(node));

    const recreatesElement = () =>
      !splice.before.every((node) => isText(node)) &&
      !canReplaceCompatibleYjsChildren(
        this.root,
        touched,
        splice.before,
        splice.after
      );

    // Only the changed children are written, so a peer's concurrent edits to
    // the rest of the block survive. Outside a projection, it may re-create
    // texts, as a leaf split does, but not an element, as a wrap would: Yjs
    // drops a peer's concurrent edits inside a deleted element, and
    // lowerCompositeRelocations keeps them.
    if (!projected && recreatesElement()) {
      return null;
    }

    const compatible = replaceCompatibleYjsChildren(
      this.root,
      touched,
      splice.before,
      splice.after,
      0,
      this.isSetValued,
      createYjsPropertyLocationAt(
        expected,
        [...splice.parentPath],
        this.schemaRoot,
        splice.from
      )
    );
    const insertedNodes = compatible
      ? []
      : splice.after.map((node, index) => {
          const location = createYjsPropertyLocationAt(
            expected,
            [...splice.parentPath],
            this.schemaRoot
          );

          return createYjsNode(
            node,
            this.isSetValued,
            createYjsPropertyContext(node, {
              ...location,
              path: [...splice.parentPath, splice.from + index],
            })
          );
        });

    if (!compatible) {
      for (const node of splice.before) {
        removeYjsChild(this.root, parent, splice.from, node);
      }
    }

    insertedNodes.forEach((node, index) => {
      insertYjsChild(this.root, parent, splice.from + index, node);
    });

    return this.loweredSplice(
      change,
      expected,
      splice,
      insertedNodes.length,
      compatible ? 0 : splice.before.length,
      compatible ? 'compatible' : 'range'
    );
  }

  private lowerElementSplice(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    splice: NestedChildSplice,
    parent: Y.XmlElement,
    edits: ReturnType<typeof elementOnlySpliceEdits>
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    if (edits === null) return null;

    const location = createYjsPropertyLocationAt(
      expected,
      [...splice.parentPath],
      this.schemaRoot
    );
    const writes = [
      ...edits.removed.map((edit) => ({ ...edit, kind: 'remove' as const })),
      ...edits.inserted.map((edit) => ({ ...edit, kind: 'insert' as const })),
    ];
    const removalsFirst = (write: (typeof writes)[number]) =>
      write.kind === 'remove' ? Infinity : write.index;

    writes.sort(
      (left, right) =>
        right.at - left.at || removalsFirst(right) - removalsFirst(left)
    );

    for (const write of writes) {
      if (write.kind === 'remove') {
        removeYjsChild(this.root, parent, write.at, write.node);
      } else {
        insertYjsChild(
          this.root,
          parent,
          write.at,
          createYjsNode(
            write.node,
            this.isSetValued,
            createYjsPropertyContext(write.node, {
              ...location,
              path: [...splice.parentPath, write.index],
            })
          )
        );
      }
    }

    return this.loweredSplice(
      change,
      expected,
      splice,
      edits.inserted.length,
      edits.removed.length,
      'compatible'
    );
  }

  private loweredSplice(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    splice: NestedChildSplice,
    inserted: number,
    removed: number,
    strategy: 'compatible' | 'range'
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> {
    let changedRanges = 0;

    change.iterChangedRanges((root) => {
      if (internalDocumentChangeRoot(root) === this.rootKey) changedRanges += 1;
    });

    const topIndex = splice.parentPath[0];
    const topNode = expected.at(topIndex);
    const tokenLengthNodes =
      topNode === undefined ? 0 : this.lengths.set(topIndex, topNode);

    this.ready = this.rootIndex.length === expected.length;

    return {
      changedRanges,
      inserted,
      kind: 'lowered',
      removed,
      start: topIndex,
      strategy,
      tokenLengthNodes,
    };
  }

  private lowerCanonicalSplit(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    window: RootWindow
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const found = findCanonicalSplit(window.before, window.after);

    if (found === null) return null;

    const split = {
      ...found,
      elementPath: shiftPath(found.elementPath, window.from),
      textPath: shiftPath(found.textPath, window.from),
    };
    const topIndex = split.elementPath[0];

    if (topIndex === undefined || this.rootIndex.at(topIndex) === undefined) {
      return null;
    }

    applyCanonicalSplitToYjs(
      this.root,
      split,
      this.isSetValued,
      this.schemaRoot
    );
    const insertsTopLevel = split.elementPath.length === 1;

    let changedRanges = 0;

    change.iterChangedRanges((root) => {
      if (internalDocumentChangeRoot(root) === this.rootKey) changedRanges += 1;
    });

    let tokenLengthNodes = 0;

    if (insertsTopLevel) {
      tokenLengthNodes = this.lengths.splice(
        topIndex,
        1,
        expected.slice(topIndex, topIndex + 2)
      );
    } else {
      const changedTopNode = expected.at(topIndex);

      if (changedTopNode !== undefined) {
        tokenLengthNodes = this.lengths.set(topIndex, changedTopNode);
      }
    }
    this.ready = this.rootIndex.length === expected.length;

    return {
      changedRanges,
      inserted: insertsTopLevel ? 1 : 0,
      kind: 'lowered',
      removed: 0,
      start: topIndex,
      strategy: 'compatible',
      tokenLengthNodes,
    };
  }

  private lowerExactRelocation(
    change: DocumentChange,
    expected: NodeList<Descendant>,
    relocation: DocumentChangeRelocation
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    if (relocation.path.length !== 1 || relocation.targetPath.length !== 1) {
      return null;
    }
    if (!applyExactYjsRelocation(this.root, relocation)) return null;

    let changedRanges = 0;

    change.iterChangedRanges((root) => {
      if (internalDocumentChangeRoot(root) === this.rootKey) changedRanges += 1;
    });

    const from = relocation.path[0];
    const to = relocation.targetPath[0];

    this.lengths.move(from, to);
    this.ready = this.rootIndex.length === expected.length;

    return {
      changedRanges,
      inserted: 0,
      kind: 'lowered',
      removed: 0,
      start: Math.min(relocation.path[0] ?? 0, relocation.targetPath[0] ?? 0),
      strategy: 'compatible',
      tokenLengthNodes: 0,
    };
  }

  private oneYjsChildPerChild(path: readonly number[]): boolean {
    let siblings = this.mirror;

    return path.slice(0, -1).every((index, depth) => {
      const parent = getYjsNodeIf(this.root, path.slice(0, depth + 1));

      siblings = (siblings.at(index) as Element).children;

      return (
        parent instanceof Y.XmlElement &&
        getYjsVisibleChildren(this.root, parent).length === siblings.length
      );
    });
  }

  private lowerCompositeRelocations(
    expected: NodeList<Descendant>,
    regions: readonly EventImportRegion[],
    relocations: readonly DocumentChangeRelocation[]
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const relocationTargets = new Map<string, YjsNode>();
    const propertyContexts = indexYjsPropertyContexts(
      expected,
      this.schemaRoot,
      regions.map((region) => ({ from: region.afterFrom, to: region.afterTo }))
    );

    for (const relocation of relocations) {
      const topIndex = relocation.targetPath[0];
      const covered =
        topIndex !== undefined &&
        regions.some(
          (region) => region.afterFrom <= topIndex && topIndex < region.afterTo
        );

      if (!covered) {
        const sourceTopIndex = relocation.path[0];
        const sourceCovered =
          sourceTopIndex !== undefined &&
          regions.some(
            (region) =>
              region.beforeFrom <= sourceTopIndex &&
              sourceTopIndex < region.beforeTo
          );

        if (sourceCovered) return null;

        continue;
      }

      if (!this.oneYjsChildPerChild(relocation.path)) return null;

      const target = getYjsNodeIf(this.root, [...relocation.path]);

      if (target === null) return null;

      relocationTargets.set(relocationPathKey(relocation.targetPath), target);
    }

    if (relocationTargets.size === 0) return null;

    const beforeNodes = regions.map((region) =>
      this.rootIndex.slice(region.beforeFrom, region.beforeTo)
    );
    const prepared = regions.map((region) => ({
      nodes: expected
        .slice(region.afterFrom, region.afterTo)
        .map((node, index) =>
          createYjsNodeWithRelocations(
            node,
            [region.afterFrom + index],
            relocationTargets,
            this.isSetValued,
            propertyContexts
          )
        ),
      region,
    }));
    let inserted = 0;
    let removed = 0;
    let regionIndex = prepared.length - 1;

    while (regionIndex >= 0) {
      const entry = prepared[regionIndex];

      if (entry === undefined) {
        regionIndex -= 1;
        continue;
      }

      let beforeIndex = entry.region.beforeTo - 1;

      while (beforeIndex >= entry.region.beforeFrom) {
        const oldTopNode =
          beforeNodes[regionIndex]?.[beforeIndex - entry.region.beforeFrom];

        if (oldTopNode !== undefined) {
          const visibleIndex = this.rootIndex.indexOf(oldTopNode);

          if (visibleIndex !== -1) {
            if (
              !removeYjsVirtualPlaceholderChild(
                this.root,
                this.root,
                visibleIndex,
                oldTopNode
              )
            ) {
              removeYjsChild(
                this.root,
                this.root,
                visibleIndex,
                this.mirror.at(beforeIndex)
              );
            }
            removed += 1;
          }
        }
        beforeIndex -= 1;
      }

      const insertionIndex = Math.min(
        entry.region.beforeFrom,
        this.rootIndex.length
      );

      entry.nodes.forEach((node, index) => {
        insertYjsChild(this.root, this.root, insertionIndex + index, node);
        inserted += 1;
      });
      regionIndex -= 1;
    }

    let tokenLengthNodes = 0;

    for (let index = prepared.length - 1; index >= 0; index--) {
      const entry = prepared[index];

      if (!entry) continue;

      tokenLengthNodes += this.lengths.splice(
        entry.region.beforeFrom,
        entry.region.beforeTo - entry.region.beforeFrom,
        expected.slice(entry.region.afterFrom, entry.region.afterTo)
      );
    }
    this.ready = this.rootIndex.length === expected.length;

    return {
      changedRanges: regions.length,
      inserted,
      kind: 'lowered',
      removed,
      start: regions[0]?.beforeFrom ?? 0,
      strategy: 'range',
      tokenLengthNodes,
    };
  }

  /**
   * Normalizing writes to the Yjs root, so the caller runs this in its
   * canonicalize transaction.
   */
  prepareRemote(batch: CapturedYjsEventBatch): YjsEventImportResult {
    return withYjsRootIds(this.root, this.rootIndex, () => {
      this.noteRemoteIds(batch);

      const joins = this.ready ? this.findJoins(batch) : [];
      const result = this.translate(batch, this.normalize(batch), joins);

      if (result.kind !== 'fallback') return result;

      const recover = this.recoverJoins(joins);

      return recover ? { ...result, recover } : result;
    });
  }

  private readFittedBlock(node: YjsNode): Descendant {
    const raw = readPliteNodeFromYjs(this.root, node);
    const fitted = deepFreeze(this.fit.block(raw));

    if (areJsonLikeValuesEqual(raw, fitted)) this.maskedBlocks.delete(node);
    else this.maskedBlocks.add(node);

    return fitted;
  }

  refreshMasks(children: NodeList<Descendant>): void {
    this.maskedBlocks.clear();
    for (let index = 0; index < this.rootIndex.length; index++) {
      const node = this.rootIndex.at(index);

      if (
        node &&
        (children.length !== this.rootIndex.length ||
          !areJsonLikeValuesEqual(
            readPliteNodeFromYjs(this.root, node),
            children.at(index)
          ))
      ) {
        this.maskedBlocks.add(node);
      }
    }
  }

  drift(
    expected: NodeList<Descendant>,
    fallback = false
  ): PreparedEventImport | null {
    const values = new Map<number, Descendant>();

    for (const node of fallback
      ? this.maskedBlocks
      : this.writtenMaskedBlocks) {
      const index = this.rootIndex.indexOf(node);

      if (index === -1) {
        this.maskedBlocks.delete(node);
        continue;
      }
      const fitted = this.readFittedBlock(node);

      if (!areJsonLikeValuesEqual(fitted, expected.at(index))) {
        values.set(index, fitted);
      }
    }
    this.writtenMaskedBlocks.clear();
    if (values.size === 0) return null;

    const regions = [...values.keys()]
      .sort((a, b) => a - b)
      .map((index) => ({
        afterFrom: index,
        afterTo: index + 1,
        beforeFrom: index,
        beforeTo: index + 1,
      }));
    const prepared = createEventDocumentChange(
      this.rootKey,
      expected,
      (from, to) =>
        Array.from(
          { length: to - from },
          (_, offset) =>
            values.get(from + offset) ??
            expected.at(from + offset) ??
            failInvariant('Expected drift block')
        ),
      regions,
      this.lengths,
      this.isSetValued
    );
    const ticket = this.generation;

    return {
      ...prepared,
      accept: (published) => {
        if (ticket !== this.generation) return;

        const children = published.nodes as NodeList<Descendant>;

        this.setMirror(children);
        for (const index of values.keys()) {
          const child = children.at(index);

          if (child) this.lengths.set(index, child);
        }
      },
      readTopLevelNodes: values.size,
    };
  }

  /**
   * Records the ids and virtual references a batch brought, before any
   * reference resolves to them.
   */
  private noteRemoteIds(batch: CapturedYjsEventBatch): void {
    for (const event of batch.events) {
      const { target } = event;

      if (isYjsNode(target)) {
        const id = target.getAttribute(YJS_NODE_ID_KEY);
        const ref = target.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

        if (event.keys.includes(YJS_NODE_ID_KEY) && typeof id === 'string') {
          this.rootIndex.noteId(id, target);
        }
        if (
          event.keys.includes(YJS_VIRTUAL_CHILD_ID_KEY) &&
          typeof ref === 'string' &&
          target instanceof Y.XmlElement
        ) {
          this.rootIndex.noteReferrer(ref, target);
        }
      }
      for (const part of event.delta) {
        if (!Array.isArray(part.insert)) continue;

        for (const inserted of part.insert) {
          if (!isYjsNode(inserted)) continue;

          const tree = readYjsTreeRefs(inserted);

          for (const [id, node] of tree.ids) this.rootIndex.noteId(id, node);
          for (const [id, referrer] of tree.referrers) {
            this.rootIndex.noteReferrer(id, referrer);
          }
        }
      }
    }
  }

  private normalize(batch: CapturedYjsEventBatch): YjsEventNormalization {
    const {
      newlyHidden,
      insertedNodes,
      parents,
      recursiveRoots,
      truncatedTextNodes,
    } = eventNormalizationTargets(batch);
    const attachedParents = new Set(
      [...parents].filter(
        (parent) =>
          parent.doc === this.root.doc &&
          (parent !== this.root ||
            yjsRootNeedsNormalization(
              this.root,
              this.rootIndex,
              insertedNodes,
              truncatedTextNodes
            ))
      )
    );
    const attachedRoots = new Set(
      [...recursiveRoots].filter((node) => node.doc === this.root.doc)
    );
    const changedNodes = removeSupersededVirtualYjsSplitSuffixes(
      this.root,
      insertedNodes,
      truncatedTextNodes,
      newlyHidden
    );

    return {
      changedNodes,
      removedNodes: removeRedundantEmptyYjsTextNodesAt(
        this.root,
        attachedParents,
        attachedRoots
      ),
    };
  }

  reset(children: NodeList<Descendant>): number {
    this.setMirror(children);
    this.lengths.reset(children);
    this.ready =
      this.resetRootIndex() && this.rootIndex.length === children.length;

    return this.lengths.measurement();
  }

  /**
   * Returns false for a root that shows a virtual child of its own, which the
   * index cannot hold.
   */
  private resetRootIndex(): boolean {
    const input = readYjsRootIndex(this.root);

    this.rootIndex.reset(
      input?.entries ?? [],
      input?.tree ?? { ids: new Map(), referrers: [] }
    );

    return input !== null;
  }

  private visibleChildrenOf(
    parent: Y.XmlElement
  ): Pick<RootProjectionIndex, 'indexOf' | 'slice'> {
    return parent === this.root
      ? this.rootIndex
      : getYjsVisibleChildren(this.root, parent);
  }

  /**
   * Adds each top-level block whose visible content can hold `node`: the
   * block it sits in, when the root shows that block, and every block that
   * shows it or an ancestor through a virtual reference. A root child the
   * batch inserted counts as shown, since its region reads it. Returns
   * whether any block shows `node`.
   */
  private addShownBlocks(
    node: Y.AbstractType<unknown> | YjsNode,
    blocks: Set<YjsNode>,
    visited = new Set<unknown>()
  ): boolean {
    let shown = false;

    for (
      let current: Y.AbstractType<unknown> | YjsNode | null = node;
      current !== this.root;
      current = current.parent
    ) {
      if (current === null || !isYjsNode(current) || visited.has(current)) {
        return shown;
      }
      visited.add(current);

      const id = current.getAttribute(YJS_NODE_ID_KEY);

      if (typeof id === 'string') {
        for (const referrer of this.rootIndex.referrersOf(id)) {
          shown = this.addShownBlocks(referrer, blocks, visited) || shown;
        }
      }
      if (current.parent === this.root) {
        if (this.rootIndex.has(current)) {
          blocks.add(current);
          shown = true;
        } else if (!this.rootIndex.holdsRaw(current)) {
          shown = true;
        }

        return shown;
      }
    }

    return shown;
  }

  /**
   * Whether `event` hides a root child that showed itself, which leaves the
   * root as a removal.
   */
  private hidesRootChild(event: CapturedYjsEvent): boolean {
    const { target } = event;

    if (!isYjsNode(target)) return false;

    const slot = this.rootIndex.slotAt(this.rootIndex.indexOf(target));

    return (
      slot !== undefined &&
      this.rootIndex.rawAt(slot.rawIndex) === target &&
      target.getAttribute(YJS_HIDDEN_KEY) === true &&
      event.keys.every(
        (key) => key === YJS_HIDDEN_KEY || !YJS_CHILD_VISIBILITY_KEYS.has(key)
      )
    );
  }

  private hasUnresolvedReference(node: YjsNode): boolean {
    const stack: YjsNode[] = [node];

    for (let current = stack.pop(); current; current = stack.pop()) {
      const ref = current.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

      if (typeof ref === 'string' && this.rootIndex.resolve(ref) === null) {
        return true;
      }
      if (current instanceof Y.XmlElement) {
        stack.push(...rawYjsChildren(current));
      }
    }

    return false;
  }

  /**
   * Find the batch's joins. A join is a run of sibling lines the batch hid,
   * right after a line it left in place, whose children show, in order, at
   * that line's end through placeholders the batch wrote there. A hidden line
   * between them whose children show nowhere was removed. The search reads
   * each hidden line, its previous siblings back to a line the batch kept, and
   * the children of the lines it joins.
   */
  private findJoins(
    batch: CapturedYjsEventBatch
  ): Array<FoundJoin & { top: YjsNode }> {
    const inserted = new Set<YjsNode>();
    const hidden = new Set<YjsNode>();
    const deltas = new Map<Y.XmlText, Array<readonly CapturedYjsDeltaPart[]>>();
    const childEvents = new Map<Y.XmlElement, CapturedYjsEvent[]>();

    for (const event of batch.events) {
      const { target } = event;

      if (
        isYjsNode(target) &&
        event.keys.includes(YJS_HIDDEN_KEY) &&
        target.getAttribute(YJS_HIDDEN_KEY) === true
      ) {
        hidden.add(target);
      }
      if (target instanceof Y.XmlText && event.delta.length > 0) {
        deltas.set(target, [...(deltas.get(target) ?? []), event.delta]);
      }
      if (target instanceof Y.XmlElement && event.childListChanged) {
        childEvents.set(target, [...(childEvents.get(target) ?? []), event]);
      }
      for (const part of event.delta) {
        if (!Array.isArray(part.insert)) continue;
        for (const node of part.insert) {
          if (isYjsNode(node)) inserted.add(node);
        }
      }
    }

    const found: Array<FoundJoin & { top: YjsNode }> = [];

    if (![...hidden].some((node) => node instanceof Y.XmlElement)) {
      return found;
    }

    const shown = (node: YjsNode) => {
      if (
        !(node instanceof Y.XmlElement) ||
        getYjsAttributes(node)[YJS_VIRTUAL_PLACEHOLDER_KEY] !== true
      ) {
        return node;
      }

      const ref = node.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

      return typeof ref === 'string' ? this.rootIndex.resolve(ref) : null;
    };
    const rawChildrenBefore = (parent: Y.XmlElement) => {
      let children: Array<YjsNode | null> = readYjsChildren(parent).map(
        (child) => (isYjsNode(child) ? child : null)
      );

      for (const event of (childEvents.get(parent) ?? []).toReversed()) {
        const previous: Array<YjsNode | null> = [];
        let at = 0;
        let deleted = 0;

        for (const part of event.delta) {
          if (part.retain !== undefined) {
            previous.push(...children.slice(at, at + part.retain));
            at += part.retain;
          } else if (part.delete !== undefined) {
            previous.push(
              ...event.deleted.slice(deleted, deleted + part.delete)
            );
            deleted += part.delete;
          } else if (Array.isArray(part.insert)) {
            at += part.insert.length;
          }
        }
        if (at > children.length || deleted !== event.deleted.length) {
          return null;
        }
        previous.push(...children.slice(at));
        children = previous;
      }

      return children.every((child) => child !== null) ? children : null;
    };
    const childLists = new Map<Y.XmlElement, YjsNode[] | null>();
    const childrenBefore = (parent: Y.XmlElement): YjsNode[] | null => {
      if (!childLists.has(parent)) {
        childLists.set(parent, readChildrenBefore(parent));
      }

      return childLists.get(parent) ?? null;
    };
    const readChildrenBefore = (parent: Y.XmlElement): YjsNode[] | null => {
      if (typeof parent.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) === 'string') {
        return null;
      }

      const raw = rawChildrenBefore(parent);

      if (!raw) return null;

      const children: YjsNode[] = [];

      for (const child of raw) {
        const node = shown(child);

        if (node === null) return null;
        if (
          node === child &&
          child.getAttribute(YJS_HIDDEN_KEY) === true &&
          !hidden.has(child)
        ) {
          continue;
        }
        children.push(node);
      }

      return children;
    };
    const siblingsOf = (
      parent: Y.XmlElement
    ): Pick<RootProjectionIndex, 'at' | 'indexOf' | 'length'> | null =>
      parent === this.root ? this.rootIndex : childrenBefore(parent);
    const childIndexes = new Map<Y.XmlElement, Map<YjsNode, number>>();
    const indexIn = (parent: Y.XmlElement, node: YjsNode) => {
      if (parent === this.root) return this.rootIndex.indexOf(node);

      let indexes = childIndexes.get(parent);

      if (!indexes) {
        const children = childrenBefore(parent) ?? [];

        countCoreWork('yjsChildrenRead', children.length);
        indexes = new Map(children.map((child, at) => [child, at] as const));
        childIndexes.set(parent, indexes);
      }

      return indexes.get(node) ?? -1;
    };
    const pathOf = (node: YjsNode): number[] | null => {
      const { parent } = node;

      if (!(parent instanceof Y.XmlElement)) return null;
      if (parent === this.root) {
        const index = indexIn(parent, node);

        return index === -1 ? null : [index];
      }
      if (parent.getAttribute(YJS_HIDDEN_KEY) === true) return null;

      const path = pathOf(parent);
      const index = indexIn(parent, node);

      return path && index !== -1 ? [...path, index] : null;
    };
    const gone = (node: YjsNode | undefined) =>
      node !== undefined && (hidden.has(node) || isDeletedYjsNode(node));
    const lineAt = (path: readonly number[]) => {
      let node: Descendant | undefined = this.mirror.at(path[0]);

      for (const index of path.slice(1)) {
        node =
          node && NodeApi.isElement(node) ? node.children[index] : undefined;
      }

      return node && NodeApi.isElement(node) ? node : null;
    };
    const lengthBefore = (text: Y.XmlText) =>
      (deltas.get(text) ?? []).reduce(
        (sum, delta) =>
          delta.reduce(
            (total, part) =>
              total +
              (part.delete ?? 0) -
              (typeof part.insert === 'string' ? part.insert.length : 0),
            sum
          ),
        text.length
      );
    const editsOf = (line: Element, children: readonly YjsNode[]) => {
      const segments = segmentPliteChildren(line.children);
      const targets = alignSegments(segments, segmentYjsChildren(children));
      const edits: Diff[][] = [];
      const removed: number[] = [];

      if (!targets) return null;

      for (const [order, segment] of segments.entries()) {
        const target = targets[order];

        if (segment.kind === 'element') {
          if (target?.kind === 'element' && isDeletedYjsNode(target.node)) {
            removed.push(segment.from);
          }
          continue;
        }

        const letters = segment.leaves.map((leaf) => leaf.text).join('');

        if (target?.kind !== 'text') {
          edits.push([]);
          continue;
        }

        // Yjs deletes a deleted text's content, so its length reads 0.
        const lengths = target.chain.map((text) =>
          isDeletedYjsNode(text) ? null : lengthBefore(text)
        );
        const known = lengths.reduce<number>((sum, n) => sum + (n ?? 0), 0);

        if (
          lengths.filter((n) => n === null).length > 1 ||
          known > letters.length
        ) {
          return null;
        }

        const diff: Diff[] = [];
        let offset = 0;

        for (const [index, text] of target.chain.entries()) {
          const length = lengths[index] ?? letters.length - known;
          const own = letters.slice(offset, offset + length);
          const textDiff =
            lengths[index] === null
              ? [[DiffOp.Delete, own] as Diff]
              : composeTextDeltas(own, deltas.get(text) ?? []);

          if (!textDiff) return null;
          for (const entry of textDiff) pushDiff(diff, entry[0], entry[1]);
          offset += length;
        }

        if (offset !== letters.length) return null;
        edits.push(diff);
      }

      return { edits, removed };
    };
    const firsts = new Set<YjsNode>();
    const runStarts = new Map<YjsNode, number>();
    const siblingAt = (
      siblings: NonNullable<ReturnType<typeof siblingsOf>>,
      at: number
    ) => {
      countCoreWork('yjsJoinSiblingsRead');

      return siblings.at(at);
    };

    for (const line of hidden) {
      if (!(line instanceof Y.XmlElement)) continue;

      const { parent } = line;

      if (!(parent instanceof Y.XmlElement)) continue;

      const siblings = siblingsOf(parent);
      const index = siblings ? indexIn(parent, line) : -1;

      if (!siblings || index === -1) continue;

      const passed: YjsNode[] = [line];
      let start = index - 1;

      for (; start >= 0; start -= 1) {
        const sibling = siblingAt(siblings, start);

        if (sibling === undefined || !gone(sibling)) break;

        const known = runStarts.get(sibling);

        if (known !== undefined) {
          start = known;
          break;
        }
        passed.push(sibling);
      }
      for (const node of passed) runStarts.set(node, start);

      const first = siblings.at(start);

      if (
        !(first instanceof Y.XmlElement) ||
        firsts.has(first) ||
        getYjsAttributes(first)[YJS_HIDDEN_KEY] === true
      ) {
        continue;
      }
      firsts.add(first);

      const raw = rawYjsChildren(first);
      const targets: YjsNode[] = [];
      let tail = raw.length - 1;

      for (; tail >= 0; tail--) {
        const child = raw[tail];

        if (
          !inserted.has(child) ||
          !(child instanceof Y.XmlElement) ||
          getYjsAttributes(child)[YJS_VIRTUAL_PLACEHOLDER_KEY] !== true
        ) {
          break;
        }

        const target = shown(child);

        if (target === null) {
          targets.length = 0;
          break;
        }
        if (!inserted.has(target)) targets.push(target);
      }
      if (targets.length === 0) continue;
      targets.reverse();

      const isTarget = new Set(targets);

      const lines = [start];
      let read = 0;
      let joins = true;

      for (
        let at = start + 1;
        joins && at < siblings.length && gone(siblingAt(siblings, at));
        at++
      ) {
        const next = siblings.at(at);

        if (next === undefined || isTarget.has(next)) {
          joins = false;
          break;
        }

        const children =
          next instanceof Y.XmlElement && !isDeletedYjsNode(next)
            ? childrenBefore(next)
            : [];

        if (children === null) {
          joins = false;
          break;
        }

        const live = children.filter((child) => !isDeletedYjsNode(child));
        const count = live.filter((child) => isTarget.has(child)).length;

        if (count > 0) {
          joins =
            count === live.length &&
            live.every((child, offset) => targets[read + offset] === child);
          read += live.length;
          lines.push(at);
        } else if (read === targets.length) {
          break;
        } else if (children.some((child) => hidden.has(child))) {
          joins = false;
        }
      }

      const parentAt = parent === this.root ? [] : pathOf(parent);

      if (!joins || read !== targets.length || lines.length < 2 || !parentAt) {
        continue;
      }

      const edits: Diff[][][] = [];
      const removed: number[][] = [];

      for (const at of lines) {
        const node = siblings.at(at);
        const joined = lineAt([...parentAt, at]);
        const children =
          node instanceof Y.XmlElement ? childrenBefore(node) : null;
        const lineEdits = joined && children && editsOf(joined, children);

        if (!lineEdits) {
          joins = false;
          break;
        }
        edits.push(lineEdits.edits);
        removed.push(lineEdits.removed);
      }

      let top: YjsNode = first;

      while (top.parent instanceof Y.XmlElement && top.parent !== this.root) {
        top = top.parent;
      }
      if (joins) {
        found.push({
          after: null,
          edits,
          lines: lines.map((at) => [...parentAt, at]),
          removedElements: removed,
          top,
        });
      }
    }

    return found.sort((left, right) => {
      const at = left.lines[0].findIndex(
        (index, depth) => index !== right.lines[0][depth]
      );

      return at === -1 ? 0 : left.lines[0][at] - (right.lines[0][at] ?? 0);
    });
  }

  joinRecovery(batch: CapturedYjsEventBatch): YjsJoinRecovery | null {
    if (!this.ready) return null;

    return this.recoverJoins(
      withYjsRootIds(this.root, this.rootIndex, () => {
        this.noteRemoteIds(batch);

        return this.findJoins(batch);
      })
    );
  }

  private recoverJoins(
    joins: ReadonlyArray<FoundJoin & { top: YjsNode }>
  ): YjsJoinRecovery | null {
    if (joins.length === 0) return null;

    return (before, after) => {
      const visible = getYjsVisibleChildren(this.root, this.root);

      if (visible.length !== after.length) return null;

      const placed = joins.map((join) => ({
        ...join,
        after: visible.indexOf(join.top),
      }));

      if (placed.some((join) => join.after === -1)) return null;

      return joinedChange(
        DocumentIndex.fromValue(before),
        after,
        placed,
        (left, right) => this.between(left, right)
      );
    };
  }

  private between(before: DocumentIndex, after: DocumentIndex): RootChange {
    let contexts: ReturnType<typeof indexYjsPropertyContexts> | undefined;

    return RootChange.between(before, after, {
      isSetValued: (node, key) => {
        contexts ??= indexYjsPropertyContexts(
          before.value as unknown as NodeList<Descendant>,
          this.schemaRoot
        );
        const context = contexts.get(node);

        return context ? this.isSetValued(node, key, context) : false;
      },
      root: this.schemaRoot,
    });
  }

  private translate(
    batch: CapturedYjsEventBatch,
    normalization: YjsEventNormalization,
    found: ReadonlyArray<FoundJoin & { top: YjsNode }>
  ): YjsEventImportResult {
    if (!this.ready) {
      return { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' };
    }

    let rootEvent: CapturedYjsEvent | null = null;
    const affectedTopNodes = new Set<YjsNode>();
    const hiddenTopNodes = new Set<YjsNode>();
    let changesVisibility = false;
    let hasProjectedTarget = false;
    let hasUnknownTarget = false;

    for (const node of normalization.changedNodes) {
      this.addShownBlocks(node, affectedTopNodes);
    }

    for (const event of batch.events) {
      const visibility = event.keys.some((key) =>
        YJS_CHILD_VISIBILITY_KEYS.has(key)
      );

      changesVisibility ||= visibility;
      if (
        visibility &&
        (event.target === this.root || event.target.parent === this.root)
      ) {
        if (event.target === this.root || !this.hidesRootChild(event)) {
          return {
            fallback: 'remote-event-projected-content',
            kind: 'fallback',
          };
        }
        hiddenTopNodes.add(event.target as YjsNode);
        continue;
      }

      if (event.target === this.root) {
        if (event.keys.length > 0) {
          return {
            fallback: 'remote-event-root-attributes',
            kind: 'fallback',
          };
        }
        if (event.childListChanged) {
          if (rootEvent !== null) {
            return {
              fallback: 'remote-event-invalid-delta',
              kind: 'fallback',
            };
          }

          rootEvent = event;
        }
        continue;
      }

      if (getTopLevelNode(this.root, event.target) === null) {
        hasUnknownTarget = true;
      } else if (!this.addShownBlocks(event.target, affectedTopNodes)) {
        hasProjectedTarget = true;
      }
    }

    if (hasProjectedTarget) {
      return {
        fallback: 'remote-event-projected-content',
        kind: 'fallback',
      };
    }

    if (hasUnknownTarget && rootEvent === null) {
      return {
        fallback: 'remote-event-unknown-target',
        kind: 'fallback',
      };
    }

    const removedTopNodes = [
      ...[...normalization.removedNodes].filter((node) =>
        this.rootIndex.has(node)
      ),
      ...hiddenTopNodes,
    ];
    const parsedRootDelta =
      rootEvent === null
        ? []
        : this.rootIndex.simple
          ? parseRootDelta(this.rootIndex, rootEvent.delta)
          : parseProjectedRootInsertDelta(
              this.root,
              this.rootIndex,
              rootEvent.delta
            );

    // A root delta beside a visibility change, such as an undone move that
    // deletes its root placeholder, is projected content the import cannot
    // place.
    if (parsedRootDelta === null) {
      return {
        fallback: changesVisibility
          ? 'remote-event-projected-content'
          : 'remote-event-invalid-delta',
        kind: 'fallback',
      };
    }

    const structural = finalizeRootRegions(
      parsedRootDelta,
      removedTopNodes,
      this.rootIndex
    );

    if (structural === null) {
      return { fallback: 'remote-event-empty-root', kind: 'fallback' };
    }

    const insertedTopIndexes = new Map<YjsNode, number>();

    for (const region of structural) {
      region.nodes.forEach((node, index) => {
        insertedTopIndexes.set(node, region.afterFrom + index);
      });
    }
    const getNextTopIndex = (node: YjsNode): number | undefined => {
      const insertedIndex = insertedTopIndexes.get(node);

      if (insertedIndex !== undefined) return insertedIndex;

      const index = this.rootIndex.indexOf(node);

      return index === -1 ? undefined : mapRootNodeIndex(index, structural);
    };
    const readNodes = new Set<YjsNode>();

    for (const region of structural) {
      for (const node of region.nodes) {
        if (!this.rootIndex.has(node)) readNodes.add(node);
      }
    }
    for (const node of affectedTopNodes) {
      if (getNextTopIndex(node) !== undefined) readNodes.add(node);
    }
    for (const node of readNodes) {
      // A root child that is hidden or shows another node comes from a root
      // move, which still reads the whole root.
      if (
        (node.parent === this.root && hasProjectionAttributes(node)) ||
        this.hasUnresolvedReference(node)
      ) {
        return {
          fallback: 'remote-event-projected-content',
          kind: 'fallback',
        };
      }
    }

    const readValues = new Map<YjsNode, Descendant>();

    try {
      for (const node of readNodes) {
        // The editor takes a change's nodes only when they are immutable.
        readValues.set(node, this.readFittedBlock(node));
      }
    } catch {
      return { fallback: 'remote-event-read-failed', kind: 'fallback' };
    }

    const retained = (node: YjsNode | undefined, beforeIndex: number) =>
      (node && readValues.get(node)) ??
      (beforeIndex < 0 ? undefined : this.mirror.at(beforeIndex)) ??
      failInvariant('Expected a retained top-level node');
    const nextChildAt = (afterIndex: number): Descendant => {
      let shift = 0;

      for (const region of structural) {
        if (afterIndex < region.afterFrom) break;
        if (afterIndex < region.afterTo) {
          const node = region.nodes[afterIndex - region.afterFrom];

          return retained(node, node ? this.rootIndex.indexOf(node) : -1);
        }
        shift +=
          region.afterTo -
          region.afterFrom -
          (region.beforeTo - region.beforeFrom);
      }

      const beforeIndex = afterIndex - shift;

      return retained(this.rootIndex.at(beforeIndex), beforeIndex);
    };

    const regions: EventImportRegion[] = [...structural];

    for (const node of affectedTopNodes) {
      const beforeIndex = this.rootIndex.indexOf(node);
      const afterIndex = getNextTopIndex(node);

      if (beforeIndex !== -1 && afterIndex !== undefined) {
        regions.push({
          afterFrom: afterIndex,
          afterTo: afterIndex + 1,
          beforeFrom: beforeIndex,
          beforeTo: beforeIndex + 1,
        });
      }
    }

    const joins: FoundJoin[] = [];

    for (const join of found) {
      const at = getNextTopIndex(join.top);

      if (at === undefined) continue;
      if (join.lines[0].length === 1) {
        regions.push({
          afterFrom: at,
          afterTo: at + 1,
          beforeFrom: join.lines[0][0],
          beforeTo: getDefined(join.lines.at(-1))[0] + 1,
        });
      }
      joins.push({ ...join, after: at });
    }

    const mergedRegions = mergeRegions(regions);

    // A root that needs completion goes to whole-root recovery, because the
    // editor completes nothing an import publishes.
    if (
      !this.fit.holds(
        {
          at: nextChildAt,
          length: mergedRegions.reduce(
            (length, region) =>
              length +
              region.afterTo -
              region.afterFrom -
              (region.beforeTo - region.beforeFrom),
            this.mirror.length
          ),
        },
        mergedRegions
      )
    ) {
      return { fallback: 'remote-event-read-failed', kind: 'fallback' };
    }

    const readTopIndexes = new Map(
      [...readNodes].map((node) => [node, getNextTopIndex(node)] as const)
    );
    const prepared = createEventDocumentChange(
      this.rootKey,
      this.mirror,
      (from, to) =>
        Array.from({ length: to - from }, (_, index) =>
          nextChildAt(from + index)
        ),
      mergedRegions,
      this.lengths,
      this.isSetValued,
      joins
    );
    const ticket = this.generation;

    return {
      import: {
        ...prepared,
        accept: (published) => {
          if (ticket !== this.generation) return;

          const children = published.nodes as NodeList<Descendant>;

          withYjsRootIds(this.root, this.rootIndex, () =>
            this.spliceRootIndex(
              rootEvent,
              normalization.removedNodes,
              hiddenTopNodes
            )
          );
          this.setMirror(children);
          for (let index = structural.length - 1; index >= 0; index--) {
            const region = structural[index];

            if (!region) continue;

            this.lengths.splice(
              region.beforeFrom,
              region.beforeTo - region.beforeFrom,
              children.slice(region.afterFrom, region.afterTo)
            );
          }
          this.ready = this.rootIndex.length === children.length;

          for (const [, index] of readTopIndexes) {
            const child = index === undefined ? undefined : children.at(index);

            if (index !== undefined && child !== undefined) {
              this.lengths.set(index, child);
            }
          }
        },
        readTopLevelNodes: readNodes.size,
      },
      kind: 'change',
    };
  }

  private spliceRootIndex(
    rootEvent: CapturedYjsEvent | null,
    removed: ReadonlySet<YjsNode>,
    hidden: ReadonlySet<YjsNode>
  ): void {
    let rawIndex = 0;
    let consistent = true;

    for (const part of rootEvent?.delta ?? []) {
      if (part.retain !== undefined) {
        rawIndex += part.retain;
      } else if (part.delete !== undefined) {
        this.rootIndex.delete(rawIndex, part.delete);
      } else if (Array.isArray(part.insert)) {
        const inserted = part.insert.filter(isYjsNode);

        consistent =
          this.rootIndex.insert(
            rawIndex,
            inserted.map((node) => readYjsRootSlot(this.root, node))
          ) && consistent;
        rawIndex += inserted.length;
      }
    }
    for (const node of removed) this.rootIndex.remove(node);
    for (const node of hidden) {
      consistent =
        this.rootIndex.show(readYjsRootSlot(this.root, node)) && consistent;
    }
    if (!consistent || this.rootIndex.rawLength !== this.root.length) {
      this.resetRootIndex();
    }
  }
}
