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
import {
  PreparedTokenSlice,
  PreparedTokenSliceStructureError,
} from '../../core/change/tokens';
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
import { yjsAddressesOf, yjsNodeOf } from './addresses';
import type { YjsNode } from './attributes';
import { getYjsAttributes } from './attributes';
import {
  boundariesInBatch,
  type BatchBoundaries,
  boundariesOf,
  type FoundSplit,
  type FoundUnsplit,
  splitChangeTo,
  type YjsBatchView,
} from './boundaries';
import { writeSplit } from './canonical-split';
import {
  createVirtualYjsMovePlaceholder,
  createYjsNode,
  createYjsNodes,
  createYjsPropertyContext,
  createYjsPropertyLocationAt,
  getShownYjsReferrer,
  getYjsVisibleChild,
  getYjsVisibleChildren,
  indexYjsPropertyContexts,
  insertYjsChild,
  isEmptyAttributeFreeShownYjsText,
  isEmptyAttributeFreeYjsText,
  readPliteNodeFromYjs,
  readYjsChildren,
  readYjsRootIndex,
  readYjsRootSlot,
  readYjsTreeRefs,
  removeRedundantEmptyYjsTextNodesAt,
  removeYjsChild,
  removeYjsVirtualPlaceholderChild,
  setVirtualYjsMove,
  settleYjsMoveContests,
  withYjsRootIds,
  withYjsRootIndex,
  yjsRootNeedsNormalization,
  type YjsPropertyLocation,
  type YjsPropertyContext,
  type YjsSetPropertyResolver,
  type YjsTextAdmission,
  type YjsWrite,
} from './document';
import {
  composeTextDeltas,
  editOf,
  type FoundJoin,
  joinedChange,
  type JoinRun,
  joinRunsOf,
  letterEditsIn,
  lettersInsertedAt,
  pushDiff,
  replacedWhole,
  splitAtRuns,
  withoutEqualEdges,
} from './joins';
import { areJsonLikeValuesEqual } from './json-equality';
import {
  YJS_CHILD_VISIBILITY_KEYS,
  YJS_CUT_SOURCE_KEY,
  YJS_HIDDEN_KEY,
  YJS_NODE_ID_KEY,
  YJS_VIRTUAL_CHILD_ID_KEY,
  YJS_VIRTUAL_PLACEHOLDER_KEY,
} from './keys';
import {
  canReplaceCompatibleYjsChildren,
  replaceCompatibleYjsChildren,
  type YjsReplacedElement,
  sameSkeleton,
  setYjsElementAttributes,
} from './replacement';
import { RootProjectionIndex } from './root-projection-index';
import {
  alignYjsChildren,
  continuesYjsText,
  createYjsRunEncoder,
  createYjsTextChain,
  elementOnlySpliceEdits,
  dropYjsTextGaps,
  fillYjsTextGaps,
  hasYjsCut,
  healYjsCut,
  isYjsCutItem,
  retainTextChainRange,
  rewriteTextRuns,
  segmentPliteChildren,
  textPieceOf,
  textsChangedBy,
  writeTextRuns,
  yjsTextLength,
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

/** A batch read against the document before it, as joins and splits read it. */
type BatchReader = YjsBatchView &
  Readonly<{
    gone: (node: YjsNode | undefined) => boolean;
    indexIn: (parent: Y.XmlElement, node: YjsNode) => number;
    lengthBefore: (text: Y.XmlText) => number;
    siblingsOf: (
      parent: Y.XmlElement
    ) => Pick<RootProjectionIndex, 'at' | 'indexOf' | 'length'> | null;
  }>;

export type CapturedYjsEventBatch = Readonly<{
  /**
   * The children each element the batch deleted held before it, in order.
   * Yjs drops a deleted element's children once the transaction ends.
   */
  deletedChildren: ReadonlyMap<Y.XmlElement, readonly YjsNode[]>;
  /** The cut embeds the batch deleted. */
  deletedCuts: readonly Y.Item[];
  /** Yjs keeps no deleted node's attributes once the transaction ends. */
  deletedIds: readonly string[];
  deletedTextTargets: readonly Y.XmlText[];
  events: readonly CapturedYjsEvent[];
  /**
   * Each visibility key's value before the batch, for each node whose key
   * the batch changed and each element it deleted. Yjs keeps neither an old
   * value nor a deleted element's attributes once the transaction ends.
   */
  visibilityBefore: ReadonlyMap<YjsNode, ReadonlyMap<string, unknown>>;
}>;

export type YjsEventNormalization = Readonly<{
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

const splitOffMovedEdges = (
  region: EventImportRegion,
  sources: ReadonlySet<number>,
  targets: ReadonlySet<number>
): EventImportRegion[] => {
  const head: EventImportRegion[] = [];
  const tail: EventImportRegion[] = [];
  let { afterFrom, afterTo, beforeFrom, beforeTo } = region;

  for (;;) {
    if (beforeFrom < beforeTo && sources.has(beforeFrom)) {
      head.push({
        afterFrom,
        afterTo: afterFrom,
        beforeFrom,
        beforeTo: beforeFrom + 1,
      });
      beforeFrom += 1;
    } else if (afterFrom < afterTo && targets.has(afterFrom)) {
      head.push({
        afterFrom,
        afterTo: afterFrom + 1,
        beforeFrom,
        beforeTo: beforeFrom,
      });
      afterFrom += 1;
    } else if (beforeFrom < beforeTo && sources.has(beforeTo - 1)) {
      tail.unshift({
        afterFrom: afterTo,
        afterTo,
        beforeFrom: beforeTo - 1,
        beforeTo,
      });
      beforeTo -= 1;
    } else if (afterFrom < afterTo && targets.has(afterTo - 1)) {
      tail.unshift({
        afterFrom: afterTo - 1,
        afterTo,
        beforeFrom: beforeTo,
        beforeTo,
      });
      afterTo -= 1;
    } else {
      break;
    }
  }

  const rest =
    beforeFrom < beforeTo || afterFrom < afterTo
      ? [{ afterFrom, afterTo, beforeFrom, beforeTo }]
      : [];

  return [...head, ...rest, ...tail];
};

/**
 * How a remote import fits what it reads into the editor's schema: `block`
 * fits one read top-level block and throws when its content cannot fit;
 * `holds` says whether the root, changed only inside `windows`, still holds
 * its content; `admitsText` says which elements read an empty text when they
 * show no children.
 */
export type YjsImportFit = Readonly<{
  admitsText: YjsTextAdmission;
  block: (node: Descendant) => Descendant;
  holds: (
    after: Readonly<{ at: (index: number) => Descendant; length: number }>,
    windows: readonly EventImportRegion[]
  ) => boolean;
}>;

const UNCHECKED_IMPORT_FIT: YjsImportFit = {
  admitsText: () => true,
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

const inPlaceRegions = ({ before, from }: RootWindow): EventImportRegion[] =>
  before.map((_, index) => ({
    afterFrom: from + index,
    afterTo: from + index + 1,
    beforeFrom: from + index,
    beforeTo: from + index + 1,
  }));

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
  node instanceof Y.XmlText && yjsTextLength(node) === 0;

/**
 * Moves the root child at `from` to `to` by placeholder. Both indexes are
 * root positions, which the lent root index answers for.
 */
const applyExactYjsRelocation = (
  write: YjsWrite,
  from: number,
  to: number
): boolean => {
  const { root } = write;
  const target = getYjsVisibleChild(root, root, from);

  if (target === undefined) return false;

  settleYjsMoveContests(write, target);
  removeYjsVirtualPlaceholderChild(write, root, from, target);

  const firstTargetChild = getYjsVisibleChild(root, root, 0);
  const hasMultipleTargetChildren =
    getYjsVisibleChild(root, root, 1) !== undefined;
  let removedEmptyTargetChild = false;

  if (
    to === 0 &&
    !hasMultipleTargetChildren &&
    isEmptyYjsText(firstTargetChild)
  ) {
    removeYjsChild(write, root, 0);
    removedEmptyTargetChild = true;
  }

  if (
    to === 0 &&
    root.length === 0 &&
    (firstTargetChild === undefined || removedEmptyTargetChild)
  ) {
    setVirtualYjsMove(write, target, root);

    return true;
  }

  insertYjsChild(
    write,
    root,
    to,
    createVirtualYjsMovePlaceholder(write, target)
  );

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
  siblings: readonly Descendant[];
  group: number;
  cutLeaves: readonly Text[];
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
        siblings: before,
        group: from,
        cutLeaves: old.leaves,
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
  write: YjsWrite,
  node: Descendant,
  path: readonly number[],
  relocationTargets: ReadonlyMap<string, YjsNode>,
  isSetValued: YjsSetPropertyResolver,
  contexts: WeakMap<JsonNode, YjsPropertyContext>
): YjsNode => {
  const relocationTarget = relocationTargets.get(relocationPathKey(path));

  if (relocationTarget !== undefined) {
    return createVirtualYjsMovePlaceholder(write, relocationTarget);
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
          write,
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
  const deletedCuts: Y.Item[] = [];
  const deletedIds: string[] = [];
  const deletedTextTargets = new Set<Y.XmlText>();
  const visibilityBefore = new Map<YjsNode, Map<string, unknown>>();
  const noteBefore = (node: YjsNode, key: string, value: unknown) => {
    const values = visibilityBefore.get(node);

    if (!values) visibilityBefore.set(node, new Map([[key, value]]));
    else if (!values.has(key)) values.set(key, value);
  };

  const captured = events.map((event) => {
    const childListChanged =
      'childListChanged' in event && event.childListChanged === true;
    const keys = changedEventKeys(event);
    const { target } = event;

    for (const key of keys) {
      if (isYjsNode(target) && YJS_CHILD_VISIBILITY_KEYS.has(key)) {
        noteBefore(target, key, event.keys.get(key)?.oldValue);
      }
    }

    return {
      childListChanged,
      delta: childListChanged ? copyDelta(event.delta) : [],
      deleted:
        childListChanged && target instanceof Y.XmlElement
          ? [...event.changes.deleted].map(({ content }) =>
              content instanceof Y.ContentType && isYjsNode(content.type)
                ? content.type
                : null
            )
          : [],
      keys,
      target,
    };
  });

  const deletedItems = new Set<Y.Item>();
  const deletedParents = new Set<Y.XmlElement>();

  Y.iterateDeletedStructs(transaction, transaction.deleteSet, (struct) => {
    if (!(struct instanceof Y.Item)) return;
    if (struct.parent instanceof Y.XmlText) {
      deletedTextTargets.add(struct.parent);
      if (isYjsCutItem(struct)) deletedCuts.push(struct);
    }
    if (!isYjsNode(struct.parent) || struct.parent._item?.deleted !== true) {
      return;
    }
    // A deleted node's current value is its last entry for the key.
    if (struct.parentSub !== null && struct.right === null) {
      const value = struct.content.getContent()[0];

      if (YJS_CHILD_VISIBILITY_KEYS.has(struct.parentSub)) {
        noteBefore(struct.parent, struct.parentSub, value);
      } else if (
        struct.parentSub === YJS_NODE_ID_KEY &&
        typeof value === 'string'
      ) {
        deletedIds.push(value);
      }
    }
    if (
      struct.parent instanceof Y.XmlElement &&
      struct.parentSub === null &&
      struct.id.clock < (transaction.beforeState.get(struct.id.client) ?? 0)
    ) {
      deletedItems.add(struct);
      deletedParents.add(struct.parent);
    }
  });

  const deletedChildren = new Map<Y.XmlElement, YjsNode[]>();

  for (const parent of deletedParents) {
    const children: YjsNode[] = [];

    for (let item = parent._start; item !== null; item = item.right) {
      if (
        deletedItems.has(item) &&
        item.content instanceof Y.ContentType &&
        isYjsNode(item.content.type)
      ) {
        children.push(item.content.type);
      }
    }
    deletedChildren.set(parent, children);
  }

  return {
    deletedChildren,
    deletedCuts,
    deletedIds,
    deletedTextTargets: [...deletedTextTargets],
    events: captured,
    visibilityBefore,
  };
};

export const mergeYjsEventBatches = (
  left: CapturedYjsEventBatch | null,
  right: CapturedYjsEventBatch
): CapturedYjsEventBatch => {
  if (left === null) return right;

  const visibilityBefore = new Map(left.visibilityBefore);

  for (const [node, values] of right.visibilityBefore) {
    const first = visibilityBefore.get(node);

    visibilityBefore.set(node, first ? new Map([...values, ...first]) : values);
  }

  return {
    deletedChildren: new Map([
      ...right.deletedChildren,
      ...left.deletedChildren,
    ]),
    deletedCuts: [...left.deletedCuts, ...right.deletedCuts],
    deletedIds: [...left.deletedIds, ...right.deletedIds],
    deletedTextTargets: [
      ...new Set([...left.deletedTextTargets, ...right.deletedTextTargets]),
    ],
    events: [...left.events, ...right.events],
    visibilityBefore,
  };
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

/**
 * Whether `node` or a node under it is hidden, so another line shows it. Only
 * such a line keeps a rewrite out: a placeholder shows a node no other line
 * reads, and the write's settle deletes what the rewrite stops showing.
 */
const holdsHiddenNode = (node: YjsNode): boolean => {
  const stack: YjsNode[] = [node];

  for (let current = stack.pop(); current; current = stack.pop()) {
    if (getYjsAttributes(current)[YJS_HIDDEN_KEY] === true) return true;
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

        // A placeholder's slot shows its target, which sits under another
        // parent.
        if (before.slotAt(beforeIndex)?.rawIndex === rawIndex) {
          beforeIndex += 1;
        } else if (before.has(retained) || !hasProjectionAttributes(retained)) {
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
    });
  });

  ranges.sort(
    (left, right) =>
      left.beforeFrom - right.beforeFrom || left.fromBefore - right.fromBefore
  );

  const stretches: LowerTokenRange[] = [];

  for (const range of ranges) {
    const previous = stretches.at(-1);

    if (previous && range.beforeFrom < previous.beforeTo) {
      stretches[stretches.length - 1] = {
        ...previous,
        beforeTo: Math.max(previous.beforeTo, range.beforeTo),
        toAfter: range.toAfter,
      };
    } else {
      stretches.push(range);
    }
  }

  const loneStretchKeepsPositions =
    before.length === after.length && stretches.length <= 1;

  if (loneStretchKeepsPositions) {
    return stretches.map(({ beforeFrom, beforeTo }) => ({
      afterFrom: beforeFrom,
      afterTo: beforeTo,
      beforeFrom,
      beforeTo,
    }));
  }

  const regions: EventImportRegion[] = [];

  for (const range of stretches) {
    const previous = regions.at(-1);
    const afterFrom = previous
      ? previous.afterTo + (range.beforeFrom - previous.beforeTo)
      : range.beforeFrom;
    const beforeBoundary = lengths.prefix(range.beforeFrom);
    const afterBoundary = range.fromAfter - (range.fromBefore - beforeBoundary);
    const requiredLength = range.toAfter - afterBoundary;

    if (afterFrom < 0 || afterFrom > after.length || requiredLength < 0) {
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

  return regions;
};

const createEventDocumentChange = (
  root: string,
  before: NodeList<Descendant>,
  after: (from: number, to: number) => readonly Descendant[],
  regions: readonly EventImportRegion[],
  lengths: TokenLengthIndex,
  isSetValued: YjsSetPropertyResolver,
  joins: readonly FoundJoin[] = [],
  splits: readonly FoundSplit[] = [],
  unsplits: readonly FoundUnsplit[] = []
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
    const holds = (top: number) =>
      region.beforeFrom <= top && top < region.beforeTo;
    const cuts = splits.filter(({ line }) => holds(line[0]));
    const heals = unsplits.filter(({ left }) => holds(left[0]));
    const between = (left: DocumentIndex, right: DocumentIndex) =>
      RootChange.between(left, right, {
        isSetValued: resolve,
        root: root === 'main' ? null : root,
      });
    const shift = ([top, ...rest]: readonly number[]) => [
      top - region.beforeFrom,
      ...rest,
    ];
    const local =
      inside.length === 0
        ? cuts.length === 0 && heals.length === 0
          ? null
          : splitChangeTo(
              DocumentIndex.fromValue(regionBefore),
              regionAfter,
              cuts.map(({ levels, line, point }) => ({
                levels,
                line: shift(line),
                point:
                  point.kind === 'text'
                    ? { ...point, path: shift(point.path) }
                    : point,
              })),
              between,
              heals.map(({ left, line }) => ({
                left: shift(left),
                line: shift(line),
              }))
            )
        : joinedChange(
            DocumentIndex.fromValue(regionBefore),
            regionAfter,
            inside.map((join) => ({
              after: join.after === null ? null : join.after - region.afterFrom,
              edits: join.edits,
              inline: join.inline.map(
                ([first, second]) => [shift(first), shift(second)] as const
              ),
              lines: join.lines.map(shift),
              removedElements: join.removedElements,
            })),
            between
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

  for (const event of batch.events) {
    if (event.childListChanged && event.target instanceof Y.XmlElement) {
      parents.add(event.target);
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
    insertedNodes,
    parents,
    recursiveRoots,
    truncatedTextNodes,
  };
};

type JoinWrite = Readonly<{
  edit: () => void;
  joined: readonly number[];
  joinedLine: Y.XmlElement;
  lines: ReadonlyArray<readonly number[]>;
  parent: Y.XmlElement;
  place: () => void;
  removed: readonly YjsNode[];
}>;

const combineLowered = (
  left: YjsEventLowerResult,
  right: YjsEventLowerResult
): YjsEventLowerResult => {
  if (right.kind !== 'lowered') return right;
  if (left.kind !== 'lowered') return left;

  return {
    ...right,
    changedRanges: left.changedRanges + right.changedRanges,
    tokenLengthNodes: left.tokenLengthNodes + right.tokenLengthNodes,
  };
};

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
  /** Stored blocks the fill already checked against their mirror block. */
  private checkedBlocks = new WeakSet<YjsNode>();
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
    write: YjsWrite,
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
    return withYjsRootIndex(write, this.rootIndex, () => {
      this.fillTextGaps(write, change, 'before');
      const { inlineJoinedLines, lowered, writtenLines } =
        this.lowerAgainstMirror(write, change, expected, options);

      if (lowered.kind !== 'lowered') return lowered;
      // Keep the list the caller passes, so its next commit finds the mirror
      // by identity.
      this.setMirror(expected);
      if (options.structureChanged) this.fillTextGaps(write, change, 'after');
      const inlineJoined = new Set(inlineJoinedLines);
      for (const line of new Set(writtenLines)) {
        if (
          !isDeletedYjsNode(line) &&
          getYjsAttributes(line)[YJS_HIDDEN_KEY] !== true
        ) {
          dropYjsTextGaps(write, line, {
            dropEarlierStored: inlineJoined.has(line),
          });
        }
      }

      return lowered;
    });
  }

  private fillTextGaps(
    write: YjsWrite,
    change: DocumentChange,
    side: 'after' | 'before'
  ) {
    const blocks = new Set<number>();
    change.iterChangedRanges((root, fromA, toA, fromB, toB) => {
      if (internalDocumentChangeRoot(root) !== this.rootKey) return;
      const [from, to] =
        side === 'before'
          ? this.lengths.span(fromA, toA)
          : this.lengths.span(fromB, toB);
      for (let index = from; index < to; index += 1) blocks.add(index);
    });
    this.fillBlocks(write, blocks, side);
  }

  private fillBlocks(
    write: YjsWrite,
    blocks: Iterable<number>,
    side: 'after' | 'before'
  ) {
    const children = this.mirror;

    if (!this.ready || this.rootIndex.length !== children.length) return;
    for (const index of blocks) {
      const stored = this.rootIndex.at(index);
      const node = children.at(index);
      if (
        !(stored instanceof Y.XmlElement) ||
        !node ||
        !NodeApi.isElement(node)
      ) {
        continue;
      }
      if (side === 'after' || !this.checkedBlocks.has(stored)) {
        fillYjsTextGaps(write, stored, node);
      }
      this.checkedBlocks.add(stored);
    }
  }

  /**
   * Runs a write that replaces the lowering, such as a fallback rewrite, with
   * the root index lent while it matches the Yjs root, so its removals settle
   * contested nodes as the lowering's do.
   */
  rewrite<T>(write: YjsWrite, run: () => T): T {
    return this.ready ? withYjsRootIndex(write, this.rootIndex, run) : run();
  }

  private lowerAgainstMirror(
    write: YjsWrite,
    change: DocumentChange,
    expected: NodeList<Descendant>,
    {
      indexes,
      structureChanged,
    }: Readonly<{
      indexes: () => Readonly<{ after: DocumentIndex; before: DocumentIndex }>;
      structureChanged: boolean;
    }>
  ): Readonly<{
    inlineJoinedLines: readonly Y.XmlElement[];
    lowered: YjsEventLowerResult;
    writtenLines: readonly Y.XmlElement[];
  }> {
    if (!this.ready || this.rootIndex.length !== this.mirror.length) {
      return {
        inlineJoinedLines: [],
        lowered: { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' },
        writtenLines: [],
      };
    }
    if (!structureChanged) {
      return {
        inlineJoinedLines: [],
        lowered: this.lowerRegions(write, change, expected, []),
        writtenLines: [],
      };
    }

    const joined = this.lowerJoins(write, change, indexes().before);
    const afterJoins = joined
      ? joined.rest && { change: joined.rest, before: joined.middle }
      : { change, before: indexes().before };

    const inlineJoinedLines = joined?.inlineJoinedLines ?? [];
    const writtenLines = [...(joined?.writtenLines ?? [])];

    if (afterJoins === null) {
      return {
        inlineJoinedLines,
        lowered: getDefined(joined).lowered,
        writtenLines,
      };
    }

    const split = this.lowerSplits(write, afterJoins.change, afterJoins.before);
    const rest = split
      ? split.rest && { change: split.rest, before: split.middle }
      : afterJoins;
    const lowered = [joined?.lowered, split?.lowered].filter(
      (result) => result !== undefined
    );

    writtenLines.push(...(split?.writtenLines ?? []));
    if (rest === null) {
      return {
        inlineJoinedLines,
        lowered: lowered.reduce(combineLowered),
        writtenLines,
      };
    }

    return {
      inlineJoinedLines,
      lowered: [
        ...lowered,
        this.lowerStructure(write, rest.change, expected, () => ({
          after: indexes().after,
          before: rest.before,
        })),
      ].reduce(combineLowered),
      writtenLines,
    };
  }

  /**
   * Write the commit's splits as cuts, each line keeping its Yjs nodes: a
   * cut inside a text becomes a cut embed and a view, and the children after
   * the cut move by placeholder. Returns the document the rest of the commit
   * applies to, that rest and the Yjs lines it wrote, or null, before any
   * write, when the commit holds no split this can write. A split this cannot
   * write after an earlier one it wrote stays in the rest, with every split
   * after it.
   */
  private lowerSplits(
    write: YjsWrite,
    change: DocumentChange,
    before: DocumentIndex
  ): Readonly<{
    lowered: YjsEventLowerResult;
    middle: DocumentIndex;
    rest: DocumentChange | null;
    writtenLines: readonly Y.XmlElement[];
  }> | null {
    const committed = getInternalDocumentRootChange(change, this.rootKey);
    const found = committed && boundariesOf(committed, before);

    if (!found) return null;

    const steps: Array<{
      after: DocumentIndex;
      before: DocumentIndex;
      change: RootChange;
    }> = [];
    let current = before;

    try {
      for (const boundary of found.boundaries) {
        const step = RootChange.create(current, {
          from: boundary.at,
          insert: PreparedTokenSlice.fromTokens(boundary.tokens),
        });
        const next = step.apply(current);

        steps.push({ after: next, before: current, change: step });
        current = next;
      }
    } catch (error) {
      if (error instanceof PreparedTokenSliceStructureError) return null;
      throw error;
    }

    let tokenLengthNodes = 0;
    let inserted = 0;
    let written = 0;
    const writtenLines: Y.XmlElement[] = [];

    for (const [index, boundary] of found.boundaries.entries()) {
      const step = steps[index];
      const top = step.before.openContextAt(boundary.at)[0]?.path[0];
      const wrote =
        top === undefined
          ? null
          : writeSplit(
              write,
              step.before,
              step.after,
              boundary,
              this.isSetValued,
              this.schemaRoot
            );

      if (top === undefined || wrote === null) {
        if (index === 0) return null;
        break;
      }

      writtenLines.push(...wrote);
      written += 1;
      if (step.after.nodes.length > step.before.nodes.length) {
        inserted += 1;
        tokenLengthNodes += this.lengths.splice(top, 1, [
          step.after.child(top) as Descendant,
          step.after.child(top + 1) as Descendant,
        ]);
      } else {
        tokenLengthNodes += this.lengths.set(
          top,
          step.after.child(top) as Descendant
        );
      }
    }

    const middle = written === steps.length ? current : steps[written].before;
    const rest = steps
      .slice(written)
      .reduceRight<RootChange | null>(
        (after, step) => (after ? step.change.compose(after) : step.change),
        found.rest
      );

    this.setMirror(middle.nodes as NodeList<Descendant>);
    this.ready = this.rootIndex.length === this.mirror.length;

    return {
      lowered: this.ready
        ? {
            changedRanges: written,
            inserted,
            kind: 'lowered',
            removed: 0,
            start: getDefined(before.openContextAt(found.boundaries[0].at)[0])
              .path[0],
            strategy: 'compatible',
            tokenLengthNodes,
          }
        : { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' },
      middle,
      rest:
        rest && this.ready
          ? createInternalDocumentChange(new Map([[this.rootKey, rest]]))
          : null,
      writtenLines,
    };
  }

  /**
   * Write the commit's joins as the shape Yjs keeps for a move: each joined
   * line's own edits from the commit's sections while the lines are apart,
   * then a placeholder in the first line for each child of the lines joined
   * into it, then the joined and removed lines hidden. Returns the document
   * the rest of the commit applies to, that rest and the Yjs lines it wrote,
   * or null, before any write, when the commit holds no join this can write.
   */
  private lowerJoins(
    write: YjsWrite,
    change: DocumentChange,
    before: DocumentIndex
  ): Readonly<{
    inlineJoinedLines: readonly Y.XmlElement[];
    lowered: YjsEventLowerResult;
    middle: DocumentIndex;
    rest: DocumentChange | null;
    writtenLines: readonly Y.XmlElement[];
  }> | null {
    const committed = getInternalDocumentRootChange(change, this.rootKey);

    if (!committed) return null;

    const rootChange = withoutEqualEdges(committed, before);
    const runs = joinRunsOf(rootChange, before);

    if (!runs || runs.length === 0) return null;

    const split = splitAtRuns(rootChange, runs);

    if (!split) return null;

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
      const join = this.planJoin(write, run, before, middle, split.inner);

      if (!join) return null;
      planned.push(join);
    }

    for (const join of planned) join.edit();
    for (const join of planned) join.place();

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
          !removeYjsVirtualPlaceholderChild(write, parent, index, node)
        ) {
          removeYjsChild(write, parent, index);
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
      inlineJoinedLines: planned
        .filter((_, index) => runs[index].inline.length > 0)
        .map(({ joinedLine }) => joinedLine),
      lowered,
      middle,
      rest:
        rest && this.ready
          ? createInternalDocumentChange(new Map([[this.rootKey, split.outer]]))
          : null,
      writtenLines: planned.map(({ joinedLine }) => joinedLine),
    };
  }

  /**
   * Plan one run's writes, reading each joined line's children against its
   * Yjs children and the joined line's children in order. Returns null when
   * they do not line up.
   */
  private planJoin(
    write: YjsWrite,
    run: JoinRun,
    before: DocumentIndex,
    middle: DocumentIndex,
    inner: RootChange
  ): JoinWrite | null {
    const addresses = yjsAddressesOf(
      this.root,
      before.nodes as NodeList<Descendant>
    );
    const parent = addresses.elementAt(run.lines[0].slice(0, -1));

    if (parent === null) return null;

    const childAt = (path: readonly number[]) =>
      yjsNodeOf(addresses.childAt(parent, getDefined(path.at(-1))));
    const lines = run.lines.map(childAt);
    const removed = run.removed.map(childAt).filter((node) => node !== null);

    if (!removed.every((node) => node !== undefined)) return null;

    const levels = [
      { paths: run.lines, yjs: lines },
      ...run.inline.map((paths) => ({
        paths,
        yjs: paths.map((path) => addresses.elementAt(path)),
      })),
    ];
    const yjsLevels: Y.XmlElement[][] = [];
    const edits: Array<() => void> = [];
    const gone: Array<readonly [Y.XmlElement, YjsNode]> = [];
    let joinedPath: readonly number[] | undefined;

    for (const [depth, level] of levels.entries()) {
      const path = middle.nodeStartingAt(
        getDefined(inner.mapPos(before.nodeRange(level.paths[0]).from, 1))
      )?.path;
      const joined = path && middle.node(path);
      const first = before.node(level.paths[0]);

      if (
        !path ||
        !NodeApi.isElement(joined) ||
        !NodeApi.isElement(first) ||
        !level.yjs.every((line) => line instanceof Y.XmlElement)
      ) {
        return null;
      }

      const yjsLines = level.yjs;

      yjsLevels.push(yjsLines);

      const inward = levels[depth + 1]?.paths;
      const plan = this.planLineWrites(
        write,
        inner,
        before,
        level.paths.map((at, index) => [at, yjsLines[index]] as const),
        joined,
        (offset) =>
          createYjsPropertyLocationAt(
            middle.nodes as NodeList<Descendant>,
            path,
            this.schemaRoot,
            offset
          ),
        inward && [getDefined(inward[0].at(-1)), getDefined(inward[1].at(-1))]
      );

      if (!plan) return null;

      edits.push(...plan.edits);
      gone.push(...plan.gone);
      joinedPath ??= path;

      const firstProperties = propertiesOf(first);
      const joinedProperties = propertiesOf(joined);

      if (!areJsonLikeValuesEqual(firstProperties, joinedProperties)) {
        const context = createYjsPropertyContext(joined, {
          ...createYjsPropertyLocationAt(
            middle.nodes as NodeList<Descendant>,
            path.slice(0, -1),
            this.schemaRoot
          ),
          path,
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
    }

    const [yjsLines] = yjsLevels;
    const append = (line: Y.XmlElement, children: readonly YjsNode[]) => {
      let end = getYjsVisibleChildren(this.root, line).length;

      for (const child of children) {
        insertYjsChild(
          write,
          line,
          end,
          createVirtualYjsMovePlaceholder(write, child)
        );
        end += 1;
      }
    };

    return {
      edit: () => {
        for (const edit of edits) edit();
        this.removeLineChildren(write, gone);
      },
      joined: getDefined(joinedPath),
      joinedLine: yjsLines[0],
      lines: run.lines,
      parent,
      place: () => {
        for (const [depth, [first, second]] of yjsLevels.entries()) {
          const inward = yjsLevels[depth + 1];

          if (!inward) break;

          const children = getYjsVisibleChildren(this.root, second);

          append(first, children.slice(children.indexOf(inward[1]) + 1));
        }

        const innermost = getDefined(yjsLevels.at(-1));
        let last = getYjsVisibleChildren(this.root, innermost[0]).at(-1);

        for (const line of innermost.slice(1)) {
          const children = getYjsVisibleChildren(this.root, line);
          const [head] = children;
          // A line whose text continues the line before through a cut joins
          // it by deleting the cut, so its letters stay in their text.
          const heals =
            last instanceof Y.XmlText &&
            head instanceof Y.XmlText &&
            continuesYjsText(last, head);
          const emptyEnterCopy =
            yjsLevels.length > 1 && children.every(isEmptyAttributeFreeYjsText);
          const moved = heals
            ? children.slice(1)
            : emptyEnterCopy
              ? []
              : children;

          if (heals) healYjsCut(head);
          append(innermost[0], moved);
          last = moved.at(-1) ?? last;
        }
      },
      removed: [...yjsLines.slice(1), ...removed],
    };
  }

  /**
   * Yjs drops a peer's concurrent edits inside a text it deletes, so each
   * kept text takes its letter edits in its own Yjs text instead of being
   * re-created. `inward` names the child of the first line and of the second
   * that join one level in, which the next level's plan writes: the first
   * stands for the joined child, and the second joins it.
   */
  private planLineWrites(
    write: YjsWrite,
    inner: RootChange,
    before: DocumentIndex,
    lines: ReadonlyArray<readonly [readonly number[], Y.XmlElement]>,
    joined: Element,
    location: (offset: number) => YjsPropertyLocation,
    inward?: readonly [number, number]
  ) {
    const { children } = joined;
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
    const insertNewText = (
      yjsLine: Y.XmlElement,
      anchor: YjsNode | null,
      leaves: readonly Text[],
      offset: number
    ) => {
      const encode = createYjsRunEncoder(this.isSetValued, location(offset));

      edits.push(() => {
        const visible = getYjsVisibleChildren(this.root, yjsLine);

        insertYjsChild(
          write,
          yjsLine,
          anchor ? visible.indexOf(anchor) : visible.length,
          createYjsTextChain(leaves, encode)
        );
      });
    };

    for (const [index, [path, yjsLine]] of lines.entries()) {
      const line = before.node(path);

      if (!NodeApi.isElement(line)) return null;

      const retyped = line.type !== joined.type;
      const aligned = alignYjsChildren(
        line.children,
        getYjsVisibleChildren(this.root, yjsLine)
      );

      if (!aligned) return null;

      const { segments, targets } = aligned;

      let collected = -1;

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
            if (after.some((leaf) => leaf.text !== '')) {
              const next = targets[order + 1];

              insertNewText(
                yjsLine,
                next?.kind === 'element' ? next.node : null,
                after,
                offset
              );
            }
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
        if (inward?.[index] === segment.from) {
          if (index === 0) {
            if (used !== 0 || !NodeApi.isElement(children[at])) return null;
            at += 1;
          }
          continue;
        }

        const range = before.nodeRange([...path, segment.from]);
        const edit = editOf(inner, range.from, range.to);

        if (edit === 'removed') {
          const inserted = lettersInsertedAt(
            inner,
            Math.max(range.from, collected + 1),
            range.to
          );
          const offset = at;
          const after = inserted ? take(inserted.length) : [];

          if (inserted === null || !after) return null;
          if (inserted) insertNewText(yjsLine, target.node, after, offset);
          collected = range.to;
          gone.push([yjsLine, target.node]);
          continue;
        }
        if (used !== 0) return null;

        const next = children[at];

        if (!NodeApi.isElement(next)) return null;
        at += 1;
        if (edit === 'kept') continue;

        if (
          !canReplaceCompatibleYjsChildren(
            this.root,
            [target.node],
            [segment.node],
            [next]
          )
        ) {
          return null;
        }

        const inlineLocation = location(at - 1);

        edits.push(() =>
          replaceCompatibleYjsChildren(
            write,
            [target.node],
            [segment.node],
            [next],
            0,
            this.isSetValued,
            inlineLocation,
            retyped
          )
        );
      }
    }

    return at === children.length && used === 0 ? { edits, gone } : null;
  }

  private removeLineChildren(
    write: YjsWrite,
    gone: ReadonlyArray<readonly [Y.XmlElement, YjsNode]>
  ) {
    for (const [line, node] of gone) {
      const index = getYjsVisibleChildren(this.root, line).indexOf(node);

      if (
        index !== -1 &&
        !removeYjsVirtualPlaceholderChild(write, line, index, node)
      ) {
        removeYjsChild(write, line, index);
      }
    }
  }

  private lowerStructure(
    write: YjsWrite,
    change: DocumentChange,
    expected: NodeList<Descendant>,
    indexes: () => Readonly<{ after: DocumentIndex; before: DocumentIndex }>
  ): YjsEventLowerResult {
    const window = this.windowOf(change, expected);

    if (window === 'mismatch') {
      return { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' };
    }
    if (window === null) return this.lowerRegions(write, change, expected, []);

    const inPlace =
      window !== 'many' && sameSkeleton(window.before, window.after)
        ? inPlaceRegions(window)
        : null;
    let regions: EventImportRegion[] | null | undefined;

    if (inPlace) {
      regions = sparseLowerRegions(
        change,
        this.rootKey,
        this.mirror,
        expected,
        this.lengths
      );

      if (
        regions === null ||
        regions.every(
          (region) =>
            region.beforeTo - region.beforeFrom ===
            region.afterTo - region.afterFrom
        )
      ) {
        return this.lowerRegions(
          write,
          change,
          expected,
          [],
          regions,
          indexes().before
        );
      }
    }

    const exactMove = getExactDocumentChangeRelocation(
      change,
      this.rootKey,
      indexes().before
    );
    const relocationResult = exactMove
      ? this.lowerExactRelocation(write, change, expected, exactMove)
      : null;

    if (relocationResult !== null) return relocationResult;

    const detected =
      window === 'many'
        ? null
        : (this.lowerInlineTextCut(write, change, expected, window) ??
          this.lowerNestedChildSplice(
            write,
            change,
            expected,
            window,
            indexes
          ) ??
          this.lowerRootSplice(write, change, expected, window, indexes));

    if (detected !== null) return detected;

    const { after, before } = indexes();
    const relocations = getDocumentChangeRelocations(
      change,
      this.rootKey,
      before,
      after
    );

    if (relocations.length === 0 && inPlace) {
      return this.lowerRegions(write, change, expected, [], inPlace, before);
    }

    return this.lowerRegions(
      write,
      change,
      expected,
      relocations,
      regions,
      before
    );
  }

  /**
   * The root children the change removes whole, from their open token
   * through their close, as indexes in `before`. A change of a block's type
   * replaces only its open token and keeps the block. A move between root
   * children leaves the blocks between them untouched, so it lowers as a
   * relocation and never reaches this. A move inside one block deletes and
   * inserts the same tokens, which reads like a replacement, so a nested
   * element keeps pairing by shape.
   */
  private replacedElements(
    change: DocumentChange,
    before: DocumentIndex
  ): ReadonlySet<number> {
    const replaced = new Set<number>();
    const committed = getInternalDocumentRootChange(change, this.rootKey);
    if (!committed) return replaced;
    let position = 0;
    for (let index = 0; index < committed.sections.length; index += 2) {
      const length = committed.sections[index];
      const at = position;
      position += length;
      if (committed.sections[index + 1] < 0 || length === 0) continue;
      for (const range of before.nodeRangesTouching(at, at + length)) {
        if (
          range.kind === 'element' &&
          range.path.length === 1 &&
          at <= range.from &&
          range.to <= at + length
        ) {
          replaced.add(range.path[0]);
        }
      }
    }
    return replaced;
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
    write: YjsWrite,
    change: DocumentChange,
    expected: NodeList<Descendant>,
    relocations: readonly DocumentChangeRelocation[],
    mergedRegions = sparseLowerRegions(
      change,
      this.rootKey,
      this.mirror,
      expected,
      this.lengths
    ),
    /** The document `change` applies to, when it can remove elements. */
    document?: DocumentIndex
  ): YjsEventLowerResult {
    const removedElements = document
      ? this.replacedElements(change, document)
      : null;
    const replacedIn =
      (from: number): YjsReplacedElement =>
      (index) =>
        removedElements?.has(from + index) ?? false;

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
        write,
        expected,
        mergedRegions,
        relocations
      );

      if (relocated !== null) return relocated;
    }

    for (const region of mergedRegions) {
      const touched = this.rootIndex.slice(region.beforeFrom, region.beforeTo);
      const replaced = replacedIn(region.beforeFrom);

      // A block the change removes goes through the removal gate, which keeps
      // what other blocks show of it.
      if (
        touched.some(
          (node, index) => holdsHiddenNode(node) && !replaced(index)
        ) &&
        !canReplaceCompatibleYjsChildren(
          this.root,
          touched,
          this.mirror.slice(region.beforeFrom, region.beforeTo),
          expected.slice(region.afterFrom, region.afterTo),
          0,
          replaced
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
        write,
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
        },
        false,
        replacedIn(region.beforeFrom)
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
              write,
              this.root,
              region.beforeFrom,
              target
            )
          ) {
            removeYjsChild(
              write,
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
              write,
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

  private lowerInlineTextCut(
    write: YjsWrite,
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
    const parent = yjsAddressesOf(this.root, this.mirror).elementAt(
      cut.parentPath
    );
    if (parent === null) return null;
    const group = alignYjsChildren(
      cut.siblings,
      getYjsVisibleChildren(this.root, parent)
    )?.targets[cut.group];
    if (group?.kind !== 'text') return null;
    const keptLength = textOf(cut.leaves).length;
    const before: Text[] = [];
    let offset = 0;
    for (const leaf of cut.cutLeaves) {
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
        write,
        parent,
        group.from + group.chain.length + index,
        node
      )
    );
    prefix.forEach((node, index) =>
      insertYjsChild(write, parent, group.from + index, node)
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
    write: YjsWrite,
    change: DocumentChange,
    expected: NodeList<Descendant>,
    window: RootWindow,
    indexes: () => Readonly<{ after: DocumentIndex; before: DocumentIndex }>
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const splice = inRoot(
      findNestedChildSplice(window.before, window.after),
      window.from
    );

    if (splice === null) return null;

    const parent = yjsAddressesOf(this.root, this.mirror).elementAt(
      splice.parentPath
    );

    if (parent === null) return null;

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
          ? isText(sibling) && sibling.text.length === yjsTextLength(node)
          : !isText(sibling);
      });

    if (
      corresponds &&
      replaceCompatibleYjsChildren(
        write,
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
      )
    ) {
      return this.loweredSplice(change, expected, splice, 0, 0, 'compatible');
    }

    const letters = this.lowerLetterSplice(
      write,
      change,
      expected,
      splice,
      parent,
      indexes
    );

    if (letters !== null) return letters;

    const edits = this.elementSpliceEdits(
      change,
      splice,
      beforeSiblings,
      visible,
      indexes
    );

    if (edits !== null) {
      return this.lowerElementSplice(
        write,
        change,
        expected,
        splice,
        parent,
        edits
      );
    }
    if (!corresponds) return null;

    // Yjs drops a peer's concurrent edits inside a deleted element, so outside
    // a projection this path re-creates only texts, and
    // lowerCompositeRelocations keeps an element's edits.
    if (
      !hasProjectedContent(parent) &&
      !touched.some((node) => hasProjectedContent(node)) &&
      !splice.before.every((node) => isText(node))
    ) {
      return null;
    }

    const location = createYjsPropertyLocationAt(
      expected,
      [...splice.parentPath],
      this.schemaRoot
    );
    const insertedNodes = splice.after.map((node, index) =>
      createYjsNode(
        node,
        this.isSetValued,
        createYjsPropertyContext(node, {
          ...location,
          path: [...splice.parentPath, splice.from + index],
        })
      )
    );

    for (const node of splice.before) {
      removeYjsChild(write, parent, splice.from, node);
    }
    insertedNodes.forEach((node, index) => {
      insertYjsChild(write, parent, splice.from + index, node);
    });

    return this.loweredSplice(
      change,
      expected,
      splice,
      insertedNodes.length,
      splice.before.length,
      'range'
    );
  }

  /**
   * The splice as element writes, when its letters stay: the change says
   * which elements it removes or inserts whole, and every other element
   * keeps its Yjs node, so a peer who wrote the same element at the same time
   * writes the same node instead of adding a copy. Null when a kept element's
   * children cannot be written in place.
   */
  private elementSpliceEdits(
    change: DocumentChange,
    splice: NestedChildSplice,
    siblings: NodeList<Descendant>,
    children: readonly YjsNode[],
    indexes: () => Readonly<{ after: DocumentIndex; before: DocumentIndex }>
  ) {
    const whole = this.wholeChildren(change, indexes, splice);
    const edits =
      whole &&
      elementOnlySpliceEdits(siblings.slice(), splice, children, whole);

    return edits?.updated.every((edit) =>
      canReplaceCompatibleYjsChildren(
        this.root,
        [edit.node],
        [edit.before],
        [edit.after]
      )
    )
      ? edits
      : null;
  }

  private lowerLetterSplice(
    write: YjsWrite,
    change: DocumentChange,
    expected: NodeList<Descendant>,
    splice: NestedChildSplice,
    parent: Y.XmlElement,
    indexes: () => Readonly<{ after: DocumentIndex; before: DocumentIndex }>
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const committed = getInternalDocumentRootChange(change, this.rootKey);

    if (!committed) return null;

    const { after, before } = indexes();
    const path = [...splice.parentPath];
    const line = before.node(path);
    const next = after.node(path);

    if (
      !NodeApi.isElement(line) ||
      !NodeApi.isElement(next) ||
      !areJsonLikeValuesEqual(propertiesOf(line), propertiesOf(next))
    ) {
      return null;
    }

    const plan = this.planLineWrites(
      write,
      withoutEqualEdges(committed, before),
      before,
      [[path, parent]],
      next,
      (offset) =>
        createYjsPropertyLocationAt(expected, path, this.schemaRoot, offset)
    );

    if (!plan || plan.gone.length === 0) return null;
    for (const edit of plan.edits) edit();
    this.removeLineChildren(write, plan.gone);

    return this.loweredSplice(
      change,
      expected,
      splice,
      0,
      plan.gone.length,
      'compatible'
    );
  }

  /**
   * Which of a stretch of siblings the change removes whole, and which of the
   * nodes in their place it inserts whole.
   */
  private wholeChildren(
    change: DocumentChange,
    indexes: () => Readonly<{ after: DocumentIndex; before: DocumentIndex }>,
    stretch: NestedChildSplice
  ) {
    const committed = getInternalDocumentRootChange(change, this.rootKey);

    if (!committed) return null;

    const { after, before } = indexes();
    const inner = withoutEqualEdges(committed, before);
    const rangesIn = (document: DocumentIndex, nodes: readonly Descendant[]) =>
      nodes.map((_, index) =>
        document.nodeRange([...stretch.parentPath, stretch.from + index])
      );
    const inserted = replacedWhole(inner, rangesIn(after, stretch.after), true);
    const removed = replacedWhole(
      inner,
      rangesIn(before, stretch.before),
      false
    );
    const keptIn = (nodes: readonly Descendant[], replaced: boolean[]) =>
      nodes.flatMap((node, index) =>
        replaced[index] || isText(node) ? [] : [index]
      );
    const sources = keptIn(stretch.before, removed);
    const places = keptIn(stretch.after, inserted);
    const depth = stretch.parentPath.length;
    const childOf = (path: readonly number[]) =>
      path.length > depth &&
      stretch.parentPath.every((index, at) => path[at] === index)
        ? getDefined(path[depth]) - stretch.from
        : -1;
    const movesPairInOrder = getDocumentChangeRelocations(
      change,
      this.rootKey,
      before,
      after
    ).every(({ path, targetPath }) => {
      const source = sources.indexOf(childOf(path));

      return (
        source !== -1 &&
        places[source] === childOf(targetPath) &&
        path.length === targetPath.length &&
        path.every((index, at) => at <= depth || targetPath[at] === index)
      );
    });

    return movesPairInOrder ? { inserted, removed } : null;
  }

  /**
   * The changed top-level blocks as block writes, as lowerNestedChildSplice
   * writes a block's children: the blocks the change removes or inserts whole,
   * and each other block in its Yjs node.
   */
  private lowerRootSplice(
    write: YjsWrite,
    change: DocumentChange,
    expected: NodeList<Descendant>,
    window: RootWindow,
    indexes: () => Readonly<{ after: DocumentIndex; before: DocumentIndex }>
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const whole = this.wholeChildren(change, indexes, {
      ...window,
      parentPath: [],
    });

    if (!whole) return null;

    const touched = this.rootIndex.slice(
      window.from,
      window.from + window.before.length
    );
    const kept = window.before.flatMap((_, index) =>
      whole.removed[index] ? [] : [index]
    );
    const places = window.after.flatMap((_, index) =>
      whole.inserted[index] ? [] : [index]
    );

    if (kept.length === 0 || kept.length !== places.length) return null;

    const pairs = kept.map((at, order) => ({
      after: getDefined(window.after[places[order]]),
      before: getDefined(window.before[at]),
      index: window.from + places[order],
      node: getDefined(touched[at]),
    }));

    if (
      touched.some(
        (node, index) => whole.removed[index] && hasProjectedContent(node)
      ) ||
      !pairs.every((pair) =>
        canReplaceCompatibleYjsChildren(
          this.root,
          [pair.node],
          [pair.before],
          [pair.after]
        )
      )
    ) {
      return null;
    }

    for (const pair of pairs) {
      replaceCompatibleYjsChildren(
        write,
        [pair.node],
        [pair.before],
        [pair.after],
        0,
        this.isSetValued,
        { ancestors: [], offset: pair.index, path: [], root: this.schemaRoot }
      );
    }

    let removed = 0;

    for (let index = window.before.length - 1; index >= 0; index--) {
      if (!whole.removed[index]) continue;

      const at = window.from + index;

      if (
        !removeYjsVirtualPlaceholderChild(
          write,
          this.root,
          at,
          getDefined(touched[index])
        )
      ) {
        removeYjsChild(write, this.root, at, window.before[index]);
      }
      removed += 1;
    }

    let inserted = 0;

    for (const [index, node] of window.after.entries()) {
      if (!whole.inserted[index]) continue;
      insertYjsChild(
        write,
        this.root,
        window.from + index,
        createYjsNode(
          node,
          this.isSetValued,
          createYjsPropertyContext(node, {
            ancestors: [],
            path: [window.from + index],
            root: this.schemaRoot,
          })
        )
      );
      inserted += 1;
    }

    let changedRanges = 0;

    change.iterChangedRanges((root) => {
      if (internalDocumentChangeRoot(root) === this.rootKey) changedRanges += 1;
    });

    const tokenLengthNodes = this.lengths.splice(
      window.from,
      window.before.length,
      window.after
    );

    this.ready = this.rootIndex.length === expected.length;

    return {
      changedRanges,
      inserted,
      kind: 'lowered',
      removed,
      start: window.from,
      strategy: 'compatible',
      tokenLengthNodes,
    };
  }

  private lowerElementSplice(
    write: YjsWrite,
    change: DocumentChange,
    expected: NodeList<Descendant>,
    splice: NestedChildSplice,
    parent: Y.XmlElement,
    edits: NonNullable<ReturnType<typeof elementOnlySpliceEdits>>
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> {
    const location = createYjsPropertyLocationAt(
      expected,
      [...splice.parentPath],
      this.schemaRoot
    );

    for (const edit of edits.updated) {
      replaceCompatibleYjsChildren(
        write,
        [edit.node],
        [edit.before],
        [edit.after],
        0,
        this.isSetValued,
        { ...location, offset: edit.index }
      );
    }
    const writes = [
      ...edits.removed.map((edit) => ({ ...edit, kind: 'remove' as const })),
      ...edits.inserted.map((edit) => ({ ...edit, kind: 'insert' as const })),
    ];
    const removalsFirst = (step: (typeof writes)[number]) =>
      step.kind === 'remove' ? Infinity : step.index;

    writes.sort(
      (left, right) =>
        right.at - left.at || removalsFirst(right) - removalsFirst(left)
    );

    for (const step of writes) {
      if (step.kind === 'remove') {
        removeYjsChild(write, parent, step.at, step.node);
      } else {
        insertYjsChild(
          write,
          parent,
          step.at,
          createYjsNode(
            step.node,
            this.isSetValued,
            createYjsPropertyContext(step.node, {
              ...location,
              path: [...splice.parentPath, step.index],
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

  private lowerExactRelocation(
    write: YjsWrite,
    change: DocumentChange,
    expected: NodeList<Descendant>,
    relocation: DocumentChangeRelocation
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    if (relocation.path.length !== 1 || relocation.targetPath.length !== 1) {
      return null;
    }

    const from = relocation.path[0];
    const to = relocation.targetPath[0];

    if (!applyExactYjsRelocation(write, from, to)) return null;

    let changedRanges = 0;

    change.iterChangedRanges((root) => {
      if (internalDocumentChangeRoot(root) === this.rootKey) changedRanges += 1;
    });

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

  private lowerCompositeRelocations(
    write: YjsWrite,
    expected: NodeList<Descendant>,
    regions: readonly EventImportRegion[],
    relocations: readonly DocumentChangeRelocation[]
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const relocationTargets = new Map<string, YjsNode>();
    const addresses = yjsAddressesOf(this.root, this.mirror);
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

      const parent = addresses.elementAt(relocation.path.slice(0, -1));
      const target =
        parent &&
        yjsNodeOf(
          addresses.childAt(parent, getDefined(relocation.path.at(-1)))
        );

      if (!target) return null;

      relocationTargets.set(relocationPathKey(relocation.targetPath), target);
    }

    if (relocationTargets.size === 0) return null;

    const blockMoves = relocations.filter(
      ({ path, targetPath }) => path.length === 1 && targetPath.length === 1
    );
    const sources = new Set(blockMoves.map(({ path }) => getDefined(path[0])));
    const targets = new Set(
      blockMoves.map(({ targetPath }) => getDefined(targetPath[0]))
    );
    const touchesMove = (region: EventImportRegion) =>
      relocations.some(
        ({ path, targetPath }) =>
          (path[0] !== undefined &&
            region.beforeFrom <= path[0] &&
            path[0] < region.beforeTo) ||
          (targetPath[0] !== undefined &&
            region.afterFrom <= targetPath[0] &&
            targetPath[0] < region.afterTo)
      );
    const prepared = regions
      .flatMap((region) => splitOffMovedEdges(region, sources, targets))
      .map((region) => {
        const touched = this.rootIndex.slice(
          region.beforeFrom,
          region.beforeTo
        );
        const before = this.mirror.slice(region.beforeFrom, region.beforeTo);
        const after = expected.slice(region.afterFrom, region.afterTo);
        const compatible =
          canReplaceCompatibleYjsChildren(
            this.root,
            touched,
            before,
            after,
            0
          ) && !touchesMove(region);

        return { after, before, compatible, region, touched };
      });

    for (const entry of prepared) {
      if (!entry.compatible) continue;
      replaceCompatibleYjsChildren(
        write,
        entry.touched,
        entry.before,
        entry.after,
        0,
        this.isSetValued,
        {
          ancestors: [],
          offset: entry.region.afterFrom,
          path: [],
          root: this.schemaRoot,
        }
      );
    }

    const built = prepared.map((entry) => ({
      at: entry.region.afterFrom,
      nodes: entry.compatible
        ? []
        : entry.after.map((node, index) =>
            createYjsNodeWithRelocations(
              write,
              node,
              [entry.region.afterFrom + index],
              relocationTargets,
              this.isSetValued,
              propertyContexts
            )
          ),
    }));
    let inserted = 0;
    let removed = 0;

    for (const entry of prepared) {
      if (entry.compatible) continue;

      entry.touched.forEach((oldTopNode, offset) => {
        const visibleIndex = this.rootIndex.indexOf(oldTopNode);

        if (visibleIndex === -1) return;
        if (
          !removeYjsVirtualPlaceholderChild(
            write,
            this.root,
            visibleIndex,
            oldTopNode
          )
        ) {
          removeYjsChild(
            write,
            this.root,
            visibleIndex,
            this.mirror.at(entry.region.beforeFrom + offset)
          );
        }
        removed += 1;
      });
    }

    for (const { at, nodes } of built) {
      nodes.forEach((node, index) => {
        insertYjsChild(write, this.root, at + index, node);
        inserted += 1;
      });
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
  prepareRemote(
    write: YjsWrite,
    batch: CapturedYjsEventBatch
  ): YjsEventImportResult {
    const textOnly = batch.events.every(
      ({ target }) => target instanceof Y.XmlText
    );

    if (!textOnly) this.checkedBlocks = new WeakSet();

    return withYjsRootIds(this.root, this.rootIndex, () => {
      this.noteRemoteIds(batch);

      const read = this.ready ? this.readBatch(batch) : null;
      const joins = read ? this.findJoins(read) : [];
      const found = read
        ? boundariesInBatch(read)
        : { splits: [], unsplits: [] };
      const result = this.translate(
        batch,
        this.normalize(write, batch),
        joins,
        found
      );

      if (result.kind !== 'fallback') return result;

      const recover = this.recoverJoins(joins, found);

      return recover ? { ...result, recover } : result;
    });
  }

  private readFittedBlock(node: YjsNode): Descendant {
    const raw = readPliteNodeFromYjs(this.root, node, this.fit.admitsText);
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
            readPliteNodeFromYjs(this.root, node, this.fit.admitsText),
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
        const refKey =
          target instanceof Y.XmlText
            ? YJS_CUT_SOURCE_KEY
            : YJS_VIRTUAL_CHILD_ID_KEY;
        const ref = target.getAttribute(refKey);

        if (event.keys.includes(YJS_NODE_ID_KEY) && typeof id === 'string') {
          this.rootIndex.noteId(id, target);
        }
        if (event.keys.includes(refKey) && typeof ref === 'string') {
          this.rootIndex.noteReferrer(ref, target);
        }
        if (event.keys.some((key) => YJS_CHILD_VISIBILITY_KEYS.has(key))) {
          this.rootIndex.noteChanged(target);
        }
      }
      for (const node of event.deleted) {
        if (node !== null) this.rootIndex.noteChanged(node);
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

  private normalize(
    write: YjsWrite,
    batch: CapturedYjsEventBatch
  ): YjsEventNormalization {
    const { insertedNodes, parents, recursiveRoots, truncatedTextNodes } =
      eventNormalizationTargets(batch);
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
    return {
      removedNodes: removeRedundantEmptyYjsTextNodesAt(
        write,
        attachedParents,
        attachedRoots
      ),
    };
  }

  reset(children: NodeList<Descendant>): number {
    this.checkedBlocks = new WeakSet();
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
   * block it sits in, when the root shows that block, the block of the
   * placeholder that shows it or an ancestor, and, unless `views` is false,
   * the block of each cut view that shows letters of it. A root child the
   * batch inserted counts as shown, since its region reads it. Returns
   * whether any block shows `node`.
   */
  private addShownBlocks(
    node: Y.AbstractType<unknown> | YjsNode,
    blocks: Set<YjsNode>,
    visited = new Set<unknown>(),
    views = true
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
        const shownBy = getShownYjsReferrer(this.root, id);

        for (const referrer of this.rootIndex.referrersOf(id)) {
          if (referrer instanceof Y.XmlText ? !views : referrer !== shownBy) {
            continue;
          }
          shown = this.addShownBlocks(referrer, blocks, visited) || shown;
        }
      }
      // A root placeholder's slot shows its target, wherever the target sits.
      if (this.rootIndex.has(current)) {
        blocks.add(current);

        return true;
      }
      if (current.parent === this.root) {
        return shown || !this.rootIndex.holdsRaw(current);
      }
    }

    return shown;
  }

  /**
   * The texts that show what `event` changed when it only changed letters
   * of a text whose letters several pieces show: the text for its head and
   * the view of each piece after a cut. Null for any other event, or when the
   * batch holds another event on the same text, because the pieces are read
   * from the text as the batch left it.
   */
  private changedPieces(
    event: CapturedYjsEvent,
    deletedCuts: readonly Y.Item[]
  ): Y.XmlText[] | null {
    const { target } = event;

    if (!(target instanceof Y.XmlText) || event.keys.length > 0) return null;

    const id = target.getAttribute(YJS_NODE_ID_KEY);
    const views =
      typeof id === 'string'
        ? this.rootIndex
            .referrersOf(id)
            .filter((node): node is Y.XmlText => node instanceof Y.XmlText)
        : [];

    return views.length === 0
      ? null
      : textsChangedBy(target, event.delta, views, deletedCuts);
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
   * Read a batch against the document before it: the nodes it inserted and
   * hid, each text's deltas, and each element's shown children and each
   * node's path as they were before it, read on demand.
   */
  private readBatch(batch: CapturedYjsEventBatch): BatchReader {
    const inserted = new Set<YjsNode>();
    const hidden = new Set<YjsNode>();
    const deltas = new Map<Y.XmlText, Array<readonly CapturedYjsDeltaPart[]>>();
    const childEvents = new Map<Y.XmlElement, CapturedYjsEvent[]>();
    const removed = new Set<YjsNode>();
    const before = (node: YjsNode, key: string) => {
      const values = batch.visibilityBefore.get(node);

      return values?.has(key) ? values.get(key) : node.getAttribute(key);
    };
    const deletedReferrers = new Map<string, Y.XmlElement[]>();

    for (const node of batch.visibilityBefore.keys()) {
      const ref = before(node, YJS_VIRTUAL_CHILD_ID_KEY);

      if (
        node instanceof Y.XmlElement &&
        isDeletedYjsNode(node) &&
        typeof ref === 'string'
      ) {
        deletedReferrers.set(ref, [...(deletedReferrers.get(ref) ?? []), node]);
      }
    }

    for (const event of batch.events) {
      const { target } = event;

      if (
        isYjsNode(target) &&
        event.keys.includes(YJS_HIDDEN_KEY) &&
        before(target, YJS_HIDDEN_KEY) !== true &&
        target.getAttribute(YJS_HIDDEN_KEY) === true
      ) {
        hidden.add(target);
      }
      if (target instanceof Y.XmlText && event.delta.length > 0) {
        deltas.set(target, [...(deltas.get(target) ?? []), event.delta]);
      }
      if (target instanceof Y.XmlElement && event.childListChanged) {
        childEvents.set(target, [...(childEvents.get(target) ?? []), event]);
        for (const node of event.deleted) if (node) removed.add(node);
      }
      for (const part of event.delta) {
        if (!Array.isArray(part.insert)) continue;
        for (const node of part.insert) {
          if (isYjsNode(node)) inserted.add(node);
        }
      }
    }

    const isPlaceholder = (node: YjsNode) =>
      node instanceof Y.XmlElement &&
      getYjsAttributes(node)[YJS_VIRTUAL_PLACEHOLDER_KEY] === true;
    const shown = (node: YjsNode) => {
      if (!isPlaceholder(node)) return node;

      const ref = node.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

      return typeof ref === 'string' ? this.rootIndex.resolve(ref) : null;
    };
    const rawChildrenBefore = (parent: Y.XmlElement) => {
      let children: Array<YjsNode | null> = isDeletedYjsNode(parent)
        ? [...(batch.deletedChildren.get(parent) ?? [])]
        : readYjsChildren(parent).map((child) =>
            isYjsNode(child) ? child : null
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
        // A child the batch deleted still showed before it.
        const ref =
          before(child, YJS_VIRTUAL_PLACEHOLDER_KEY) === true
            ? before(child, YJS_VIRTUAL_CHILD_ID_KEY)
            : null;
        const node =
          typeof ref === 'string'
            ? (this.rootIndex.resolve(ref) ?? this.rootIndex.held(ref))
            : child;

        if (node === null) return null;
        if (node === child && before(child, YJS_HIDDEN_KEY) === true) {
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
    const isNew = (node: YjsNode) => {
      for (
        let current: Y.AbstractType<unknown> | YjsNode | null = node;
        current !== null && isYjsNode(current);
        current = current.parent
      ) {
        if (inserted.has(current)) return true;
      }

      return false;
    };
    const shownBy = (node: YjsNode) => {
      const id = node.getAttribute(YJS_NODE_ID_KEY);

      return typeof id === 'string' ? getShownYjsReferrer(this.root, id) : null;
    };
    const shownBefore = (node: YjsNode) => {
      const id = node.getAttribute(YJS_NODE_ID_KEY);

      if (typeof id !== 'string') return null;

      const candidates = [
        ...this.rootIndex.referrersOf(id),
        ...(deletedReferrers.get(id) ?? []),
      ].filter(
        (referrer): referrer is Y.XmlElement =>
          referrer instanceof Y.XmlElement &&
          before(referrer, YJS_VIRTUAL_CHILD_ID_KEY) === id &&
          before(referrer, YJS_HIDDEN_KEY) !== true &&
          !isNew(referrer)
      );

      if (candidates.length <= 1) return candidates[0] ?? null;

      const now = shownBy(node);

      return now && candidates.includes(now) ? now : null;
    };
    const parentOf = (node: YjsNode): Y.XmlElement | null => {
      if (this.rootIndex.has(node)) return this.root;

      const parent =
        before(node, YJS_HIDDEN_KEY) === true
          ? shownBefore(node)?.parent
          : node.parent;

      return parent instanceof Y.XmlElement ? parent : null;
    };
    const moved = (node: YjsNode) => {
      if (hidden.has(node)) return true;

      const by = shownBy(node);

      return by !== null && isNew(by);
    };
    const pliteIndexes = new Map<Y.XmlElement, Map<YjsNode, number> | null>();
    const readPliteIndexes = (parent: Y.XmlElement, path: number[]) => {
      const line = lineAt(path);
      const children = childrenBefore(parent);

      if (!line || !children) return null;
      countCoreWork('yjsChildrenRead', children.length);

      const aligned = alignYjsChildren(line.children, children);

      if (!aligned) return null;

      const indexes = new Map<YjsNode, number>();

      for (const [order, segment] of aligned.segments.entries()) {
        const target = aligned.targets[order];

        if (target?.kind === 'element') indexes.set(target.node, segment.from);
      }

      return indexes;
    };
    const pathOf = (node: Y.XmlElement): number[] | null => {
      const parent = parentOf(node);

      if (!parent) return null;
      if (parent === this.root) {
        const index = indexIn(parent, node);

        return index === -1 ? null : [index];
      }

      const path = pathOf(parent);

      if (!path) return null;
      if (!pliteIndexes.has(parent)) {
        pliteIndexes.set(parent, readPliteIndexes(parent, path));
      }

      const index = pliteIndexes.get(parent)?.get(node);

      return index === undefined ? null : [...path, index];
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

    return {
      childrenBefore,
      deletedCuts: batch.deletedCuts,
      deltas,
      gone,
      hidden,
      indexIn,
      inserted,
      isPlaceholder,
      lengthBefore,
      lineAt,
      moved,
      parentOf,
      pathOf,
      removed,
      shown,
      siblingsOf,
      sourceOf: (text) => textPieceOf(text).source,
    };
  }

  /**
   * Find the batch's joins. A join is a run of sibling lines the batch hid or
   * deleted, right after a line it left in place, whose children show, in
   * order, at that line's end through placeholders the batch wrote there. A
   * line between them whose children show nowhere was removed. A joined line
   * whose children all showed through placeholders is deleted, since the
   * join's placeholders replace them. The search reads each hidden or deleted
   * line, its previous siblings back to a line the batch kept, and the
   * children of the lines it joins.
   */
  private findJoins(batch: BatchReader): Array<FoundJoin & { top: YjsNode }> {
    const found: Array<FoundJoin & { top: YjsNode }> = [];
    const {
      childrenBefore,
      deltas,
      gone,
      hidden,
      indexIn,
      inserted,
      lengthBefore,
      lineAt,
      pathOf,
      shown,
      siblingsOf,
    } = batch;
    const candidates = [...hidden, ...batch.removed].filter(
      (node): node is Y.XmlElement => node instanceof Y.XmlElement
    );

    if (candidates.length === 0) return found;

    const editsOf = (line: Element, children: readonly YjsNode[]) => {
      const aligned = alignYjsChildren(line.children, children);
      const edits: Diff[][] = [];
      const removed: number[] = [];

      if (!aligned) return null;

      for (const [order, segment] of aligned.segments.entries()) {
        const target = aligned.targets[order];

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

        // A text's deltas count a cut's embed and miss its view's letters.
        if (target.chain.some(hasYjsCut)) return null;

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
    const placedAtEnd = (element: Y.XmlElement) => {
      const raw = rawYjsChildren(element);
      const targets: YjsNode[] = [];

      for (let tail = raw.length - 1; tail >= 0; tail--) {
        const child = raw[tail];

        if (
          !inserted.has(child) ||
          !(child instanceof Y.XmlElement) ||
          getYjsAttributes(child)[YJS_VIRTUAL_PLACEHOLDER_KEY] !== true
        ) {
          break;
        }

        const target = shown(child);

        if (target === null) return [];
        if (!inserted.has(target)) targets.push(target);
      }

      return targets.reverse();
    };
    const elementBefore = (
      line: Element,
      node: Y.XmlElement,
      index: number
    ) => {
      const children = childrenBefore(node);
      const aligned = children && alignYjsChildren(line.children, children);
      const order =
        aligned?.segments.findIndex(
          (segment) => segment.kind === 'element' && segment.from === index
        ) ?? -1;
      const target = order === -1 ? null : aligned?.targets[order];

      return target?.kind === 'element' && target.node instanceof Y.XmlElement
        ? target.node
        : null;
    };
    const isEmptyText = (node: Descendant | undefined) =>
      node !== undefined && NodeApi.isText(node) && node.text === '';
    const isEmptiedCopy = (node: YjsNode | undefined): boolean => {
      if (!(node instanceof Y.XmlElement)) return false;
      const children = childrenBefore(node)?.filter(
        (child) => !isEmptyAttributeFreeShownYjsText(child)
      );

      return (
        children !== undefined &&
        children.length > 0 &&
        children.every((child) => batch.moved(child) || isEmptiedCopy(child))
      );
    };
    const inlinePairsOf = (
      [first, second]: readonly [readonly number[], readonly number[]],
      [left, right]: readonly [Y.XmlElement, Y.XmlElement]
    ) => {
      const pairs: Array<readonly [readonly number[], readonly number[]]> = [];
      let paths = [first, second] as const;
      let nodes = [left, right] as const;

      for (;;) {
        const a = lineAt(paths[0]);
        const b = lineAt(paths[1]);

        if (!a || !b) return [];

        const at = a.children.findLastIndex((child) => !isEmptyText(child));
        const head = b.children.findIndex((child) => !isEmptyText(child));
        const [l, r] = [a.children[at], b.children[head]];

        if (
          !l ||
          !r ||
          !NodeApi.isElement(l) ||
          !NodeApi.isElement(r) ||
          l.type !== r.type
        ) {
          break;
        }

        const yl = elementBefore(a, nodes[0], at);
        const yr = elementBefore(b, nodes[1], head);
        const live =
          yr && childrenBefore(yr)?.filter((c) => !isDeletedYjsNode(c));
        const moved = yl && placedAtEnd(yl);

        if (
          !yl ||
          !yr ||
          !live ||
          !moved ||
          gone(yl) ||
          !isDeletedYjsNode(yr) ||
          live.length !== moved.length ||
          live.some((child, index) => moved[index] !== child)
        ) {
          break;
        }
        paths = [
          [...paths[0], at],
          [...paths[1], head],
        ];
        nodes = [yl, yr];
        pairs.push(paths);
      }

      const innermost = pairs.at(-1);
      const a = innermost && lineAt(innermost[0]);
      const b = innermost && lineAt(innermost[1]);

      return a &&
        b &&
        NodeApi.isText(a.children.at(-1)) &&
        NodeApi.isText(b.children[0])
        ? pairs
        : [];
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

    for (const line of candidates) {
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

      const targets = placedAtEnd(first);

      if (targets.length === 0) continue;

      const isTarget = new Set(targets);
      const keptByJoin = (child: YjsNode) =>
        !isDeletedYjsNode(child) &&
        (isTarget.has(child) || !isEmptyAttributeFreeShownYjsText(child));

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
          next instanceof Y.XmlElement ? childrenBefore(next) : [];

        if (children === null) {
          joins = false;
          break;
        }

        const kept = children.filter(keptByJoin);
        const live =
          !isTarget.has(kept[0]) && isEmptiedCopy(kept[0])
            ? kept.slice(1)
            : kept;
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

      if (!joins || read !== targets.length || lines.length < 2) continue;

      const nodes = lines.map((at) => siblings.at(at));
      const paths = nodes.map((node) =>
        node instanceof Y.XmlElement ? pathOf(node) : null
      );

      if (!paths.every((path) => path !== null)) continue;

      const edits: Diff[][][] = [];
      const removed: number[][] = [];

      for (const [order, node] of nodes.entries()) {
        const joined = lineAt(paths[order]);
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
      if (!joins) continue;

      const [firstNode, secondNode] = nodes;
      const inline =
        paths.length === 2 &&
        firstNode instanceof Y.XmlElement &&
        secondNode instanceof Y.XmlElement
          ? inlinePairsOf([paths[0], paths[1]], [firstNode, secondNode])
          : [];
      const joinedAt = inline[0]?.[1].at(-1);

      found.push({
        after: null,
        edits,
        inline,
        lines: paths,
        removedElements: removed.map((elements, order) =>
          order === 1 ? elements.filter((at) => at !== joinedAt) : elements
        ),
        top,
      });
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

    const [joins, found] = withYjsRootIds(this.root, this.rootIndex, () => {
      this.noteRemoteIds(batch);

      const read = this.readBatch(batch);

      return [this.findJoins(read), boundariesInBatch(read)] as const;
    });

    return this.recoverJoins(joins, found);
  }

  /**
   * The import's change from its joins or, when it has none, its splits and
   * unsplits, each made first so the lines keep their content.
   */
  private recoverJoins(
    joins: ReadonlyArray<FoundJoin & { top: YjsNode }>,
    { splits, unsplits }: BatchBoundaries
  ): YjsJoinRecovery | null {
    if (joins.length + splits.length + unsplits.length === 0) return null;

    return (before, after) => {
      if (joins.length === 0) {
        const visible = getYjsVisibleChildren(this.root, this.root);
        const placed = splits.filter(
          ({ copied, levels, line, spine }) =>
            levels < line.length ||
            visible.indexOf(spine) === visible.indexOf(copied) + 1
        );

        return placed.length + unsplits.length === 0
          ? null
          : splitChangeTo(
              DocumentIndex.fromValue(before),
              after,
              placed,
              (left, right) => this.between(left, right),
              unsplits
            );
      }

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
    found: ReadonlyArray<FoundJoin & { top: YjsNode }>,
    boundaries: BatchBoundaries
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

    // The block that shows a node several placeholders refer to can change
    // with any of them, so each of their blocks is read again.
    for (const referrers of this.rootIndex.takeContestChanges()) {
      for (const referrer of referrers) {
        this.addShownBlocks(referrer, affectedTopNodes);
      }
    }

    const textEvents = new Map<unknown, number>();

    for (const { target } of batch.events) {
      textEvents.set(target, (textEvents.get(target) ?? 0) + 1);
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

      const pieces =
        textEvents.get(event.target) === 1
          ? this.changedPieces(event, batch.deletedCuts)
          : null;

      if (getTopLevelNode(this.root, event.target) === null) {
        hasUnknownTarget = true;
      } else if (
        pieces === null
          ? !this.addShownBlocks(event.target, affectedTopNodes)
          : !pieces.reduce(
              (shown, text) =>
                this.addShownBlocks(text, affectedTopNodes, new Set(), false) ||
                shown,
              false
            )
      ) {
        hasProjectedTarget = true;
      }
    }

    // Yjs fires no event on the nodes under a deleted element.
    for (const id of batch.deletedIds) {
      for (const referrer of this.rootIndex.referrersOf(id)) {
        this.addShownBlocks(referrer, affectedTopNodes);
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
    const splits: FoundSplit[] = [];

    for (const split of boundaries.splits) {
      const { levels, line, spine } = split;
      const node = this.rootIndex.at(line[0]);
      const at = node && getNextTopIndex(node);

      // A split region holds the line and, for a split of a top-level
      // line, its new line right after it.
      if (
        at === undefined ||
        (levels === line.length && getNextTopIndex(spine) !== at + 1)
      ) {
        continue;
      }
      splits.push(split);
      regions.push({
        afterFrom: at,
        afterTo: at + (levels === line.length ? 2 : 1),
        beforeFrom: line[0],
        beforeTo: line[0] + 1,
      });
    }
    const unsplits: FoundUnsplit[] = [];

    for (const unsplit of boundaries.unsplits) {
      const { left, line } = unsplit;
      const top = left[0];
      const node = this.rootIndex.at(top);
      const at = node && getNextTopIndex(node);

      if (at === undefined) continue;
      unsplits.push(unsplit);
      regions.push({
        afterFrom: at,
        afterTo: at + 1,
        beforeFrom: top,
        beforeTo: line[0] + 1,
      });
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
      joins,
      splits,
      unsplits
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
