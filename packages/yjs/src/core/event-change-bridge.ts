import {
  type Descendant,
  type DocumentChange,
  type Element,
  type JsonEditorValue,
  type JsonNode,
  NodeApi,
  type Text,
} from '@platejs/plite';
import {
  failInvariant,
  createInternalRootChangeFromSections,
  type DocumentChangeRelocation,
  getDocumentChangeRelocations,
  getExactDocumentChangeRelocation,
} from '@platejs/plite/internal';
import * as Y from 'yjs';

import type { YjsNode } from './attributes';
import { getYjsAttributes } from './attributes';
import {
  applyCanonicalSplitToYjs,
  findCanonicalSplit,
} from './canonical-split';
import {
  createVirtualYjsMovePlaceholder,
  createYjsNode,
  createYjsPropertyContext,
  createYjsPropertyLocationAt,
  getYjsNodeIf,
  getYjsParent,
  getYjsVisibleChild,
  getYjsVisibleChildren,
  insertYjsChild,
  indexYjsPropertyContexts,
  isVirtualYjsChild,
  readPliteNodeFromYjs,
  removeYjsChild,
  removeRedundantEmptyYjsTextNodesAt,
  removeSupersededVirtualYjsSplitSuffixes,
  removeYjsVirtualPlaceholderChild,
  setVirtualYjsMove,
  setVirtualYjsUnwrapMove,
  splitVisibleYjsChildren,
  type YjsSetPropertyResolver,
  type YjsPropertyContext,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import { lastPathIndex, parentPath, pathsEqual } from './path';
import {
  canReplaceCompatibleYjsChildren,
  replaceCompatibleYjsChildren,
} from './replacement';

type CapturedYjsDeltaPart = Readonly<{
  delete?: number;
  insert?: unknown;
  retain?: number;
}>;

type CapturedYjsEvent = Readonly<{
  childListChanged: boolean;
  delta: readonly CapturedYjsDeltaPart[];
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

const valueForRoot = (
  root: string,
  children: readonly Descendant[]
): JsonEditorValue =>
  root === 'main'
    ? { children }
    : { children: [], roots: { [root]: children } };

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

type PliteText = Text;

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

type ElementTextMerge = Readonly<{
  after: Element;
  afterText: PliteText;
  before: readonly Element[];
  firstText: PliteText;
  from: number;
  lastText: PliteText;
  parentPath: readonly number[];
  prefix: string;
  suffix: string;
}>;

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

const findTextMergeAtLevel = (
  before: readonly Descendant[],
  after: readonly Descendant[],
  innerParentPath: readonly number[]
): ElementTextMerge | null => {
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
  const merged = afterChanged[0] ?? null;

  if (
    beforeChanged.length < 2 ||
    afterChanged.length !== 1 ||
    !isElement(merged) ||
    merged.children.length !== 1 ||
    !isText(merged.children[0] ?? null)
  ) {
    return null;
  }

  const elements = beforeChanged.filter(isElement);

  if (
    elements.length !== beforeChanged.length ||
    elements.some(
      (element) =>
        element.children.length !== 1 ||
        !isText(element.children[0] ?? null) ||
        !nodePropertiesEqual(elements[0], element, 'children')
    ) ||
    !nodePropertiesEqual(elements[0], merged, 'children')
  ) {
    return null;
  }

  const firstText = elements[0].children[0] as PliteText;
  const lastText = (
    elements.at(-1) ?? failInvariant('Expected value to be defined')
  ).children[0] as PliteText;
  const afterText = merged.children[0] as PliteText;

  if (
    !nodePropertiesEqual(firstText, afterText, 'text') ||
    !nodePropertiesEqual(lastText, afterText, 'text')
  ) {
    return null;
  }

  let prefixLength = 0;

  while (
    prefixLength < firstText.text.length &&
    prefixLength < afterText.text.length &&
    firstText.text[prefixLength] === afterText.text[prefixLength]
  ) {
    prefixLength += 1;
  }

  let suffixLength = 0;

  while (
    suffixLength < lastText.text.length &&
    suffixLength < afterText.text.length - prefixLength &&
    lastText.text.at(-1 - suffixLength) === afterText.text.at(-1 - suffixLength)
  ) {
    suffixLength += 1;
  }

  if (prefixLength + suffixLength !== afterText.text.length) return null;

  return {
    after: merged,
    afterText,
    before: elements,
    firstText,
    from,
    lastText,
    parentPath: innerParentPath,
    prefix: afterText.text.slice(0, prefixLength),
    suffix: afterText.text.slice(prefixLength),
  };
};

const findElementTextMerge = (
  before: readonly Descendant[],
  after: readonly Descendant[],
  innerParentPath2: readonly number[] = []
): ElementTextMerge | null => {
  const direct = findTextMergeAtLevel(before, after, innerParentPath2);

  if (direct !== null) return direct;
  if (before.length !== after.length) return null;

  let nested: ElementTextMerge | null = null;

  for (let index = 0; index < before.length; index++) {
    const oldNode = before[index] ?? null;
    const newNode = after[index] ?? null;

    if (areJsonLikeValuesEqual(oldNode, newNode)) continue;
    if (
      nested !== null ||
      !isElement(oldNode) ||
      !isElement(newNode) ||
      !nodePropertiesEqual(oldNode, newNode, 'children')
    ) {
      return null;
    }

    nested = findElementTextMerge(oldNode.children, newNode.children, [
      ...innerParentPath2,
      index,
    ]);

    if (nested === null) return null;
  }

  return nested;
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

const findTextLeafMergeTopIndex = (
  before: readonly Descendant[],
  after: readonly Descendant[]
): number | null => {
  let changedIndex: number | null = null;

  if (before.length !== after.length) return null;

  for (let index = 0; index < before.length; index++) {
    if (areJsonLikeValuesEqual(before[index], after[index])) continue;
    if (changedIndex !== null) return null;

    const oldElement = before[index] ?? null;
    const newElement = after[index] ?? null;

    if (
      !isElement(oldElement) ||
      !isElement(newElement) ||
      !nodePropertiesEqual(oldElement, newElement, 'children') ||
      oldElement.children.length < 2 ||
      newElement.children.length !== 1 ||
      !oldElement.children.every((child) => isText(child)) ||
      !isText(newElement.children[0] ?? null)
    ) {
      return null;
    }

    const first = oldElement.children[0];
    const merged = newElement.children[0] as PliteText;

    if (
      !nodePropertiesEqual(first, merged, 'text') ||
      oldElement.children.map((child) => child.text).join('') !== merged.text
    ) {
      return null;
    }

    changedIndex = index;
  }

  return changedIndex;
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
  accept: (children: readonly Descendant[]) => void;
  change: DocumentChange;
  changedChildren: number;
  changedRanges: number;
  children: readonly Descendant[];
  readTopLevelNodes: number;
}>;

export type YjsEventImportResult =
  | Readonly<{ fallback: YjsEventImportFallback; kind: 'fallback' }>
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

const PROJECTION_ATTRIBUTES = new Set([
  'plite:yjs-hidden',
  'plite:yjs-virtual-child-id',
  'plite:yjs-virtual-placeholder',
]);

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

  reset(children: readonly Descendant[]): void {
    this.measuredNodes = 0;
    this.root = null;

    for (const child of children) {
      const measured = measureTokenLength(child);

      this.measuredNodes += measured.nodes;
      this.root = mergeTokenLengthNodes(
        this.root,
        createTokenLengthNode(measured.length)
      );
    }
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

type IndexedSequenceNode<TValue extends object> = {
  left: IndexedSequenceNode<TValue> | null;
  parent: IndexedSequenceNode<TValue> | null;
  priority: number;
  right: IndexedSequenceNode<TValue> | null;
  size: number;
  value: TValue;
};

const indexedSequenceSize = <TValue extends object>(
  node: IndexedSequenceNode<TValue> | null
): number => node?.size ?? 0;

const updateIndexedSequenceNode = <TValue extends object>(
  node: IndexedSequenceNode<TValue>
): IndexedSequenceNode<TValue> => {
  node.size =
    indexedSequenceSize(node.left) + indexedSequenceSize(node.right) + 1;
  if (node.left) node.left.parent = node;
  if (node.right) node.right.parent = node;

  return node;
};

const mergeIndexedSequenceNodes = <TValue extends object>(
  left: IndexedSequenceNode<TValue> | null,
  right: IndexedSequenceNode<TValue> | null
): IndexedSequenceNode<TValue> | null => {
  if (left === null) return right;
  if (right === null) return left;

  if (left.priority <= right.priority) {
    left.right = mergeIndexedSequenceNodes(left.right, right);

    return updateIndexedSequenceNode(left);
  }

  right.left = mergeIndexedSequenceNodes(left, right.left);

  return updateIndexedSequenceNode(right);
};

const splitIndexedSequenceNodes = <TValue extends object>(
  root: IndexedSequenceNode<TValue> | null,
  count: number
): readonly [
  IndexedSequenceNode<TValue> | null,
  IndexedSequenceNode<TValue> | null,
] => {
  if (root === null) return [null, null];

  const leftSize = indexedSequenceSize(root.left);

  if (count <= leftSize) {
    const [left, right] = splitIndexedSequenceNodes(root.left, count);

    root.left = right;
    const nextRight = updateIndexedSequenceNode(root);

    if (left) left.parent = null;
    nextRight.parent = null;

    return [left, nextRight];
  }

  const [left, right] = splitIndexedSequenceNodes(
    root.right,
    count - leftSize - 1
  );

  root.right = left;
  const nextLeft = updateIndexedSequenceNode(root);

  nextLeft.parent = null;
  if (right) right.parent = null;

  return [nextLeft, right];
};

class IndexedSequence<TValue extends object> {
  private readonly nodes = new Map<TValue, IndexedSequenceNode<TValue>>();
  private root: IndexedSequenceNode<TValue> | null = null;

  get length(): number {
    return indexedSequenceSize(this.root);
  }

  at(index: number): TValue | undefined {
    let current = this.root;
    let target = index;

    while (current !== null) {
      const leftSize = indexedSequenceSize(current.left);

      if (target < leftSize) {
        current = current.left;
      } else if (target > leftSize) {
        target -= leftSize + 1;
        current = current.right;
      } else {
        return current.value;
      }
    }

    return undefined;
  }

  has(value: TValue): boolean {
    return this.nodes.has(value);
  }

  indexOf(value: TValue): number {
    let current = this.nodes.get(value);

    if (!current) return -1;

    let index = indexedSequenceSize(current.left);

    while (current.parent !== null) {
      if (current === current.parent.right) {
        index += indexedSequenceSize(current.parent.left) + 1;
      }
      current = current.parent;
    }

    return current === this.root ? index : -1;
  }

  move(from: number, to: number): void {
    if (from === to) return;

    const [left, afterLeft] = splitIndexedSequenceNodes(this.root, from);
    const [moved, right] = splitIndexedSequenceNodes(afterLeft, 1);
    const withoutMoved = mergeIndexedSequenceNodes(left, right);
    const [targetLeft, targetRight] = splitIndexedSequenceNodes(
      withoutMoved,
      to
    );

    this.root = mergeIndexedSequenceNodes(
      mergeIndexedSequenceNodes(targetLeft, moved),
      targetRight
    );
    if (this.root) this.root.parent = null;
  }

  reset(values: readonly TValue[]): void {
    this.nodes.clear();
    this.root = null;

    for (const value of values) {
      const node: IndexedSequenceNode<TValue> = {
        left: null,
        parent: null,
        priority: nextTokenLengthPriority(),
        right: null,
        size: 1,
        value,
      };

      this.nodes.set(value, node);
      this.root = mergeIndexedSequenceNodes(this.root, node);
      if (this.root) this.root.parent = null;
    }
  }

  slice(from: number, to: number): TValue[] {
    const values: TValue[] = [];

    const visit = (
      node: IndexedSequenceNode<TValue> | null,
      offset: number
    ): void => {
      if (node === null) return;

      const index = offset + indexedSequenceSize(node.left);

      if (from < index) visit(node.left, offset);
      if (from <= index && index < to) values.push(node.value);
      if (index + 1 < to) visit(node.right, index + 1);
    };

    visit(this.root, 0);

    return values;
  }

  splice(
    index: number,
    deleteCount: number,
    inserted: readonly TValue[]
  ): void {
    const [left, afterLeft] = splitIndexedSequenceNodes(this.root, index);
    const [removed, right] = splitIndexedSequenceNodes(afterLeft, deleteCount);

    for (const node of this.sequenceNodes(removed)) {
      if (this.nodes.get(node.value) === node) {
        this.nodes.delete(node.value);
      }
    }

    let middle: IndexedSequenceNode<TValue> | null = null;

    for (const value of inserted) {
      const node: IndexedSequenceNode<TValue> = {
        left: null,
        parent: null,
        priority: nextTokenLengthPriority(),
        right: null,
        size: 1,
        value,
      };

      this.nodes.set(value, node);
      middle = mergeIndexedSequenceNodes(middle, node);
    }

    this.root = mergeIndexedSequenceNodes(
      mergeIndexedSequenceNodes(left, middle),
      right
    );
    if (this.root) this.root.parent = null;
  }

  private *sequenceNodes(
    node: IndexedSequenceNode<TValue> | null
  ): Generator<IndexedSequenceNode<TValue>> {
    if (node === null) return;

    yield* this.sequenceNodes(node.left);
    yield node;
    yield* this.sequenceNodes(node.right);
  }
}

const rawYjsChildren = (node: Y.XmlElement): YjsNode[] =>
  node.toArray().filter(isYjsNode);

const hasProjectionAttributes = (node: YjsNode): boolean => {
  const attributes = getYjsAttributes(node);

  for (const key of PROJECTION_ATTRIBUTES) {
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

const isSimpleRootProjection = (
  root: Y.XmlElement,
  visible: readonly YjsNode[]
): boolean => {
  const raw = root.toArray();

  return (
    raw.length === visible.length &&
    raw.every((node, index) => node === visible[index] && isYjsNode(node))
  );
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
  before: IndexedSequence<YjsNode>,
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
  before: IndexedSequence<YjsNode>,
  delta: readonly CapturedYjsDeltaPart[]
): RootStructuralRegion[] | null => {
  if (delta.some((part) => part.delete !== undefined)) return null;

  const rawAfter = rawYjsChildren(root);
  const visibleAfter = new Set(getYjsVisibleChildren(root, root));
  const regions: RootStructuralRegion[] = [];
  let beforeIndex = 0;
  let rawIndex = 0;

  for (const part of delta) {
    if (part.retain !== undefined) {
      if (!isDeltaLength(part.retain)) return null;

      let remaining = part.retain;

      while (remaining > 0) {
        const retained = rawAfter[rawIndex];

        if (retained === undefined) return null;

        const visibleIndex = before.indexOf(retained);

        if (visibleIndex !== -1) {
          if (visibleIndex !== beforeIndex) return null;

          beforeIndex += 1;
        } else if (!hasProjectionAttributes(retained)) {
          return null;
        }
        rawIndex += 1;
        remaining -= 1;
      }
    }
    if (part.insert !== undefined) {
      if (!Array.isArray(part.insert) || !part.insert.every(isYjsNode)) {
        return null;
      }

      const inserted = part.insert as readonly YjsNode[];

      if (
        inserted.some(
          (node, index) =>
            rawAfter[rawIndex + index] !== node ||
            before.has(node) ||
            !visibleAfter.has(node)
        )
      ) {
        return null;
      }

      regions.push({
        beforeFrom: beforeIndex,
        beforeTo: beforeIndex,
        nodes: inserted,
      });
      rawIndex += inserted.length;
    }
  }

  return regions;
};

const finalizeRootRegions = (
  base: readonly RootStructuralRegion[],
  normalizedNodes: readonly YjsNode[],
  before: IndexedSequence<YjsNode>
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
  before: readonly Descendant[],
  after: readonly Descendant[],
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
      const node = after[afterTo];

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
  before: readonly Descendant[],
  after: readonly Descendant[],
  regions: readonly EventImportRegion[],
  lengths: TokenLengthIndex,
  isSetValued: YjsSetPropertyResolver
): {
  change: DocumentChange;
  changedChildren: number;
  changedRanges: number;
} => {
  const contexts = indexYjsPropertyContexts(
    before,
    root === 'main' ? null : root
  );
  const sectionInputs = regions.map((region) =>
    Object.freeze({
      after: Object.freeze(after.slice(region.afterFrom, region.afterTo)),
      before: Object.freeze(before.slice(region.beforeFrom, region.beforeTo)),
      from: lengths.prefix(region.beforeFrom),
    })
  );
  const result = createInternalRootChangeFromSections(
    root,
    lengths.total(),
    sectionInputs,
    (node, key) => {
      const context = contexts.get(node);

      return context ? isSetValued(node, key, context) : false;
    }
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

  return { insertedNodes, parents, recursiveRoots, truncatedTextNodes };
};

export class YjsEventChangeBridge {
  private readonly canonicalizeNode: (node: Descendant) => Descendant;
  private children: readonly Descendant[];
  private readonly isSetValued: YjsSetPropertyResolver;
  private readonly lengths: TokenLengthIndex;
  private ready = false;
  private readonly root: Y.XmlElement;
  private rootProjectionSimple = false;
  private readonly rootKey: string;
  private readonly schemaRoot: string | null;
  private readonly topNodes = new IndexedSequence<YjsNode>();

  constructor(
    root: Y.XmlElement,
    rootKey: string,
    children: readonly Descendant[],
    isSetValued: YjsSetPropertyResolver = () => false,
    canonicalizeNode: (node: Descendant) => Descendant = (node) => node
  ) {
    this.canonicalizeNode = canonicalizeNode;
    this.children = children;
    this.isSetValued = isSetValued;
    this.lengths = new TokenLengthIndex([]);
    this.root = root;
    this.rootKey = rootKey;
    this.schemaRoot = rootKey === 'main' ? null : rootKey;
    this.reset(children);
  }

  lower(
    change: DocumentChange,
    expected: readonly Descendant[],
    options: Readonly<{
      structureChanged: boolean;
    }>
  ): YjsEventLowerResult {
    const result = this.lowerAgainstMirror(change, expected, options);

    return result;
  }

  private lowerAgainstMirror(
    change: DocumentChange,
    expected: readonly Descendant[],
    {
      structureChanged,
    }: Readonly<{
      structureChanged: boolean;
    }>
  ): YjsEventLowerResult {
    if (!this.ready || this.topNodes.length !== this.children.length) {
      return { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' };
    }
    const split = structureChanged
      ? findCanonicalSplit(this.children, expected)
      : null;
    const splitResult =
      split === null ? null : this.lowerCanonicalSplit(change, expected, split);

    if (splitResult !== null) return splitResult;

    const exactMove = structureChanged
      ? getExactDocumentChangeRelocation(change, this.rootKey, this.children)
      : null;
    const exactRelocations: readonly DocumentChangeRelocation[] = exactMove
      ? [exactMove]
      : [];
    const relocationResult =
      exactRelocations.length === 1
        ? this.lowerExactRelocation(change, expected, exactRelocations[0])
        : null;

    if (relocationResult !== null) return relocationResult;

    if (structureChanged) {
      const elementSplit = this.lowerElementBoundarySplit(change, expected);

      if (elementSplit !== null) return elementSplit;

      const boundaryMerge = this.lowerTextBoundaryMerge(change, expected);

      if (boundaryMerge !== null) return boundaryMerge;

      const nestedSplice = this.lowerNestedChildSplice(change, expected);

      if (nestedSplice !== null) return nestedSplice;
    }
    const relocations =
      exactRelocations.length > 0
        ? exactRelocations
        : structureChanged
          ? getDocumentChangeRelocations(
              change,
              valueForRoot(this.rootKey, this.children)
            ).filter(
              (relocation) =>
                internalDocumentChangeRoot(relocation.root) === this.rootKey
            )
          : [];

    const mergedRegions = sparseLowerRegions(
      change,
      this.rootKey,
      this.children,
      expected,
      this.lengths
    );

    if (mergedRegions === null) {
      return { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' };
    }

    if (mergedRegions.length === 0) {
      if (expected !== this.children) {
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
      const touched = this.topNodes.slice(region.beforeFrom, region.beforeTo);

      if (
        touched.some(hasProjectedContent) &&
        !canReplaceCompatibleYjsChildren(
          this.root,
          touched,
          this.children.slice(region.beforeFrom, region.beforeTo),
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

      const before = this.children.slice(region.beforeFrom, region.beforeTo);
      const after = expected.slice(region.afterFrom, region.afterTo);
      const touched = this.topNodes.slice(region.beforeFrom, region.beforeTo);
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

        this.topNodes.splice(
          region.beforeFrom,
          region.beforeTo - region.beforeFrom,
          insertedNodes
        );
      }

      if (
        region.beforeTo - region.beforeFrom ===
        region.afterTo - region.afterFrom
      ) {
        for (let index = region.afterFrom; index < region.afterTo; index++) {
          const node = expected[index];

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
    this.children = expected;
    this.ready = this.topNodes.length === expected.length;

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
    expected: readonly Descendant[]
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const split = findTopLevelElementSplit(this.children, expected);

    if (split === null) return null;

    const original = this.topNodes.at(split.from);

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

    this.topNodes.splice(split.from + 1, 0, [right]);
    const tokenLengthNodes = this.lengths.splice(split.from, 1, [
      split.left,
      split.right,
    ]);

    this.children = expected;
    this.ready = this.topNodes.length === expected.length;
    this.rootProjectionSimple = false;

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

  private lowerTextBoundaryMerge(
    change: DocumentChange,
    expected: readonly Descendant[]
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const merge = findElementTextMerge(this.children, expected);

    if (merge !== null) {
      const parent =
        merge.parentPath.length === 0
          ? this.root
          : getYjsNodeIf(this.root, [...merge.parentPath]);

      if (!(parent instanceof Y.XmlElement)) return null;

      const yjsElements = getYjsVisibleChildren(this.root, parent).slice(
        merge.from,
        merge.from + merge.before.length
      );

      if (
        yjsElements.length !== merge.before.length ||
        !yjsElements.every((node) => node instanceof Y.XmlElement)
      ) {
        return null;
      }

      const firstElement = yjsElements[0];
      const lastElement = yjsElements.at(-1) as Y.XmlElement;
      const firstChildren = getYjsVisibleChildren(this.root, firstElement);
      const lastChildren = getYjsVisibleChildren(this.root, lastElement);

      if (
        firstChildren.length !== 1 ||
        lastChildren.length !== 1 ||
        !(firstChildren[0] instanceof Y.XmlText) ||
        !(lastChildren[0] instanceof Y.XmlText) ||
        !canReplaceCompatibleYjsChildren(
          this.root,
          firstChildren,
          [merge.firstText],
          [{ ...merge.afterText, text: merge.prefix }]
        ) ||
        !canReplaceCompatibleYjsChildren(
          this.root,
          lastChildren,
          [merge.lastText],
          [{ ...merge.afterText, text: merge.suffix }]
        )
      ) {
        return null;
      }

      replaceCompatibleYjsChildren(
        this.root,
        firstChildren,
        [merge.firstText],
        [{ ...merge.afterText, text: merge.prefix }],
        0,
        this.isSetValued,
        createYjsPropertyLocationAt(
          this.children,
          [...merge.parentPath, merge.from],
          this.schemaRoot
        )
      );
      replaceCompatibleYjsChildren(
        this.root,
        lastChildren,
        [merge.lastText],
        [{ ...merge.afterText, text: merge.suffix }],
        0,
        this.isSetValued,
        createYjsPropertyLocationAt(
          this.children,
          [...merge.parentPath, merge.from + merge.before.length - 1],
          this.schemaRoot
        )
      );

      insertYjsChild(
        this.root,
        firstElement,
        getYjsVisibleChildren(this.root, firstElement).length,
        createVirtualYjsMovePlaceholder(lastChildren[0])
      );

      for (let index = yjsElements.length - 1; index > 0; index--) {
        const node = yjsElements[index];

        if (!(node instanceof Y.XmlElement)) continue;

        const visible = getYjsVisibleChildren(this.root, parent);
        const visibleIndex = visible.indexOf(node);

        if (
          visibleIndex !== -1 &&
          !removeYjsVirtualPlaceholderChild(
            this.root,
            parent,
            visibleIndex,
            node
          )
        ) {
          removeYjsChild(this.root, parent, visibleIndex, merge.before[index]);
        }
      }

      let changedRanges = 0;

      change.iterChangedRanges((root) => {
        if (internalDocumentChangeRoot(root) === this.rootKey) {
          changedRanges += 1;
        }
      });

      const topIndex = merge.parentPath[0] ?? merge.from;
      let tokenLengthNodes = 0;

      if (merge.parentPath.length === 0) {
        this.topNodes.splice(merge.from, merge.before.length, [firstElement]);
        tokenLengthNodes = this.lengths.splice(
          merge.from,
          merge.before.length,
          [merge.after]
        );
      } else {
        const topNode = expected[topIndex];

        if (topNode !== undefined) {
          tokenLengthNodes = this.lengths.set(topIndex, topNode);
        }
      }

      this.children = expected;
      this.ready = this.topNodes.length === expected.length;
      this.rootProjectionSimple = false;

      return {
        changedRanges,
        inserted: 0,
        kind: 'lowered',
        removed: merge.parentPath.length === 0 ? merge.before.length - 1 : 0,
        start: topIndex,
        strategy: 'compatible',
        tokenLengthNodes,
      };
    }

    const textLeafTopIndex = findTextLeafMergeTopIndex(this.children, expected);

    if (textLeafTopIndex === null) return null;

    let changedRanges = 0;

    change.iterChangedRanges((root) => {
      if (internalDocumentChangeRoot(root) === this.rootKey) changedRanges += 1;
    });

    const child = expected[textLeafTopIndex];
    const tokenLengthNodes =
      child === undefined ? 0 : this.lengths.set(textLeafTopIndex, child);

    this.children = expected;

    return {
      changedRanges,
      inserted: 0,
      kind: 'lowered',
      removed: 0,
      start: textLeafTopIndex,
      strategy: 'compatible',
      tokenLengthNodes,
    };
  }

  private lowerNestedChildSplice(
    change: DocumentChange,
    expected: readonly Descendant[]
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const splice = findNestedChildSplice(this.children, expected);

    if (splice === null) return null;

    const parent = getYjsNodeIf(this.root, [...splice.parentPath]);

    if (!(parent instanceof Y.XmlElement)) return null;

    const touched = getYjsVisibleChildren(this.root, parent).slice(
      splice.from,
      splice.from + splice.before.length
    );

    if (
      !hasProjectedContent(parent) &&
      !touched.some((node) => hasProjectedContent(node))
    ) {
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

    let changedRanges = 0;

    change.iterChangedRanges((root) => {
      if (internalDocumentChangeRoot(root) === this.rootKey) changedRanges += 1;
    });

    const topIndex = splice.parentPath[0];
    const topNode = expected[topIndex];
    const tokenLengthNodes =
      topNode === undefined ? 0 : this.lengths.set(topIndex, topNode);

    this.children = expected;
    this.ready = this.topNodes.length === expected.length;
    this.rootProjectionSimple = false;

    return {
      changedRanges,
      inserted: insertedNodes.length,
      kind: 'lowered',
      removed: compatible ? 0 : splice.before.length,
      start: topIndex,
      strategy: compatible ? 'compatible' : 'range',
      tokenLengthNodes,
    };
  }

  private lowerCanonicalSplit(
    change: DocumentChange,
    expected: readonly Descendant[],
    split: NonNullable<ReturnType<typeof findCanonicalSplit>>
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const topIndex = split.elementPath[0];

    if (topIndex === undefined || this.topNodes.at(topIndex) === undefined) {
      return null;
    }

    const rightElement = applyCanonicalSplitToYjs(
      this.root,
      split,
      this.isSetValued,
      this.schemaRoot
    );
    const insertsTopLevel = split.elementPath.length === 1;

    if (insertsTopLevel) {
      this.topNodes.splice(topIndex + 1, 0, [rightElement]);
    }

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
      const changedTopNode = expected[topIndex];

      if (changedTopNode !== undefined) {
        tokenLengthNodes = this.lengths.set(topIndex, changedTopNode);
      }
    }
    this.children = expected;
    this.ready = this.topNodes.length === expected.length;

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
    expected: readonly Descendant[],
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

    this.topNodes.move(from, to);
    this.lengths.move(from, to);
    this.children = expected;
    this.ready = this.topNodes.length === expected.length;
    this.rootProjectionSimple = false;

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
    expected: readonly Descendant[],
    regions: readonly EventImportRegion[],
    relocations: readonly DocumentChangeRelocation[]
  ): Extract<YjsEventLowerResult, { kind: 'lowered' }> | null {
    const relocationTargets = new Map<string, YjsNode>();
    const propertyContexts = indexYjsPropertyContexts(
      expected,
      this.schemaRoot
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

      const target = getYjsNodeIf(this.root, [...relocation.path]);

      if (target === null) return null;

      relocationTargets.set(relocationPathKey(relocation.targetPath), target);
    }

    if (relocationTargets.size === 0) return null;

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
        const oldTopNode = this.topNodes.at(beforeIndex);

        if (oldTopNode !== undefined) {
          const visible = getYjsVisibleChildren(this.root, this.root);
          const visibleIndex = visible.indexOf(oldTopNode);

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
                this.children[beforeIndex]
              );
            }
            removed += 1;
          }
        }
        beforeIndex -= 1;
      }

      const insertionIndex = Math.min(
        entry.region.beforeFrom,
        getYjsVisibleChildren(this.root, this.root).length
      );

      entry.nodes.forEach((node, index) => {
        insertYjsChild(this.root, this.root, insertionIndex + index, node);
        inserted += 1;
      });
      regionIndex -= 1;
    }

    this.topNodes.reset(getYjsVisibleChildren(this.root, this.root));

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
    this.children = expected;
    this.ready = this.topNodes.length === expected.length;
    this.rootProjectionSimple = false;

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

  normalize(batch: CapturedYjsEventBatch): YjsEventNormalization {
    const { insertedNodes, parents, recursiveRoots, truncatedTextNodes } =
      eventNormalizationTargets(batch);
    const attachedParents = new Set(
      [...parents].filter((parent) => parent.doc === this.root.doc)
    );
    const attachedRoots = new Set(
      [...recursiveRoots].filter((node) => node.doc === this.root.doc)
    );
    const changedNodes = removeSupersededVirtualYjsSplitSuffixes(
      this.root,
      insertedNodes,
      truncatedTextNodes
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

  reset(children: readonly Descendant[]): number {
    const topNodes = getYjsVisibleChildren(this.root, this.root);

    this.children = children;
    this.lengths.reset(children);
    this.ready = topNodes.length === children.length;
    this.rootProjectionSimple = isSimpleRootProjection(this.root, topNodes);
    this.topNodes.reset(topNodes);

    return this.lengths.measurement();
  }

  translate(
    batch: CapturedYjsEventBatch,
    normalization: YjsEventNormalization
  ): YjsEventImportResult {
    if (!this.ready) {
      return { fallback: 'remote-event-mirror-mismatch', kind: 'fallback' };
    }

    let rootEvent: CapturedYjsEvent | null = null;
    const affectedTopNodes = new Set<YjsNode>();
    let hasProjectedTarget = false;
    let hasUnknownTarget = false;

    for (const node of normalization.changedNodes) {
      const topNode = getTopLevelNode(this.root, node);

      if (topNode !== null && this.topNodes.has(topNode)) {
        affectedTopNodes.add(topNode);
      }
    }

    for (const event of batch.events) {
      if (event.keys.some((key) => PROJECTION_ATTRIBUTES.has(key))) {
        return {
          fallback: 'remote-event-projected-content',
          kind: 'fallback',
        };
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

      const topNode = getTopLevelNode(this.root, event.target);

      if (topNode === null) {
        hasUnknownTarget = true;
      } else if (!this.topNodes.has(topNode)) {
        hasProjectedTarget = true;
      } else {
        affectedTopNodes.add(topNode);
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

    const normalizedTopNodes = [...normalization.removedNodes].filter((node) =>
      this.topNodes.has(node)
    );
    const parsedRootDelta =
      rootEvent === null
        ? []
        : this.rootProjectionSimple
          ? parseRootDelta(this.topNodes, rootEvent.delta)
          : parseProjectedRootInsertDelta(
              this.root,
              this.topNodes,
              rootEvent.delta
            );

    if (parsedRootDelta === null) {
      return { fallback: 'remote-event-invalid-delta', kind: 'fallback' };
    }

    const structural = finalizeRootRegions(
      parsedRootDelta,
      normalizedTopNodes,
      this.topNodes
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

      const index = this.topNodes.indexOf(node);

      return index === -1 ? undefined : mapRootNodeIndex(index, structural);
    };
    const readNodes = new Set<YjsNode>();

    for (const region of structural) {
      for (const node of region.nodes) {
        if (!this.topNodes.has(node)) readNodes.add(node);
      }
    }
    for (const node of affectedTopNodes) {
      if (getNextTopIndex(node) !== undefined) readNodes.add(node);
    }
    for (const node of readNodes) {
      if (hasProjectedContent(node)) {
        return {
          fallback: 'remote-event-projected-content',
          kind: 'fallback',
        };
      }
    }

    let nextChildren: Descendant[];

    try {
      nextChildren = [...this.children];

      for (let index = structural.length - 1; index >= 0; index--) {
        const region = structural[index];

        if (!region) continue;

        const inserted = region.nodes.map((node) => {
          const oldIndex = this.topNodes.indexOf(node);

          return oldIndex === -1
            ? this.canonicalizeNode(readPliteNodeFromYjs(this.root, node))
            : this.children[oldIndex];
        });

        nextChildren.splice(
          region.beforeFrom,
          region.beforeTo - region.beforeFrom,
          ...inserted
        );
      }

      for (const node of readNodes) {
        const index = getNextTopIndex(node);

        if (index !== undefined) {
          nextChildren[index] = this.canonicalizeNode(
            readPliteNodeFromYjs(this.root, node)
          );
        }
      }
    } catch {
      return { fallback: 'remote-event-read-failed', kind: 'fallback' };
    }

    const regions: EventImportRegion[] = [...structural];

    for (const node of affectedTopNodes) {
      const beforeIndex = this.topNodes.indexOf(node);
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

    const mergedRegions = mergeRegions(regions);
    const readTopIndexes = new Map(
      [...readNodes].map((node) => [node, getNextTopIndex(node)] as const)
    );
    const prepared = createEventDocumentChange(
      this.rootKey,
      this.children,
      nextChildren,
      mergedRegions,
      this.lengths,
      this.isSetValued
    );

    return {
      import: {
        ...prepared,
        accept: (children) => {
          this.children = children;
          for (let index = structural.length - 1; index >= 0; index--) {
            const region = structural[index];

            if (!region) continue;

            this.topNodes.splice(
              region.beforeFrom,
              region.beforeTo - region.beforeFrom,
              region.nodes
            );
            this.lengths.splice(
              region.beforeFrom,
              region.beforeTo - region.beforeFrom,
              children.slice(region.afterFrom, region.afterTo)
            );
          }
          this.ready = this.topNodes.length === children.length;

          for (const node of readNodes) {
            const index = readTopIndexes.get(node);
            const child = index === undefined ? undefined : children[index];

            if (index !== undefined && child !== undefined) {
              this.lengths.set(index, child);
            }
          }
        },
        children: nextChildren,
        readTopLevelNodes: readNodes.size,
      },
      kind: 'change',
    };
  }
}
