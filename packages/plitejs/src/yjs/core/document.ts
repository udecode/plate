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
import { areJsonLikeValuesEqual } from './json-equality';
import {
  isReservedYjsKey,
  isYjsMarkRecordKey,
  YJS_ELEMENT_NODE_NAME,
  YJS_HIDDEN_KEY,
  YJS_NODE_ID_KEY,
  YJS_VIRTUAL_CHILD_ID_KEY,
  YJS_VIRTUAL_PLACEHOLDER_KEY,
} from './keys';
import { copyPath, lastPathIndex, parentPath } from './path';
import type {
  RootProjectionIndex,
  RootSlotEntry,
  YjsTreeRefs,
} from './root-projection-index';
import {
  encodeYjsSetValueAttributes,
  isYjsSetValueAttribute,
  readYjsSetValueAttributes,
} from './set-valued-attributes';
import {
  cloneYjsText,
  createYjsRunEncoder,
  createYjsTextChain,
  readTextRuns,
  segmentPliteChildren,
  segmentYjsChildren,
} from './text-runs';

type YjsTextDeltaPart = {
  readonly attributes?: Readonly<Record<string, unknown>>;
  readonly insert?: unknown;
};

const getYjsTextDeltaPartText = (part: YjsTextDeltaPart): string =>
  typeof part.insert === 'string' ? part.insert : '';

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

const writeYjsNodeId = (node: YjsNode, id: string): string => {
  setYjsAttribute(node, YJS_NODE_ID_KEY, id);
  lent?.index.noteId(id, node);

  return id;
};

export const assignFreshYjsNodeId = (node: YjsNode): string =>
  writeYjsNodeId(node, createYjsNodeId(nodeIdScope));

const ensureYjsNodeId = (node: YjsNode): string => {
  const currentId = node.getAttribute(YJS_NODE_ID_KEY);

  if (typeof currentId === 'string') {
    return currentId;
  }

  const scope = node.doc ? String(node.doc.clientID) : nodeIdScope;

  return writeYjsNodeId(node, createYjsNodeId(scope));
};

export const getYjsLength = (node: YjsNode): number => node.length;

export const getYjsTextContent = (node: Y.XmlText): string => {
  if (getYjsLength(node) === 0) {
    return '';
  }

  let text = '';
  const delta = node.toDelta();

  if (delta.length === 1) {
    const part = delta[0];

    return part === undefined ? '' : getYjsTextDeltaPartText(part);
  }

  let index = 0;

  while (index < delta.length) {
    const part = delta[index];

    text += getYjsTextDeltaPartText(part);
    index += 1;
  }

  return text;
};

export const getYjsTextContentFrom = (
  node: Y.XmlText,
  offset: number
): string => {
  if (offset <= 0) {
    return getYjsTextContent(node);
  }
  if (offset >= getYjsLength(node)) {
    return '';
  }

  let text = '';
  let skipped = 0;
  const delta = node.toDelta();

  if (delta.length === 1) {
    const part = delta[0];
    const partText = part === undefined ? '' : getYjsTextDeltaPartText(part);

    return partText.slice(offset);
  }

  let index = 0;

  while (index < delta.length) {
    const part = delta[index];
    const partText = getYjsTextDeltaPartText(part);
    const nextSkipped = skipped + partText.length;

    if (offset <= skipped) {
      text += partText;
    } else if (offset < nextSkipped) {
      text += partText.slice(offset - skipped);
    }

    skipped = nextSkipped;
    index += 1;
  }

  return text;
};

export const yjsTextContentEndsWith = (
  node: Y.XmlText,
  suffix: string
): boolean => {
  if (suffix.length === 0) {
    return true;
  }
  if (getYjsLength(node) < suffix.length) {
    return false;
  }

  const delta = node.toDelta();

  if (delta.length === 1) {
    const part = delta[0];
    const partText = part === undefined ? '' : getYjsTextDeltaPartText(part);

    return partText.endsWith(suffix);
  }

  let suffixIndex = suffix.length;
  let index = delta.length - 1;

  while (index >= 0 && suffixIndex > 0) {
    const part = delta[index];

    if (part === undefined) {
      index -= 1;
      continue;
    }

    const partText = getYjsTextDeltaPartText(part);

    if (partText.length === 0) {
      index -= 1;
      continue;
    }

    let partIndex = partText.length - 1;

    while (partIndex >= 0 && suffixIndex > 0) {
      suffixIndex -= 1;

      if (partText[partIndex] !== suffix[suffixIndex]) {
        return false;
      }
      partIndex -= 1;
    }
    index -= 1;
  }

  return suffixIndex === 0;
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

let lent: Readonly<{
  index: RootProjectionIndex;
  root: Y.XmlElement;
  slots: boolean;
}> | null = null;

const lend = <T>(
  root: Y.XmlElement,
  index: RootProjectionIndex,
  slots: boolean,
  run: () => T
): T => {
  const previous = lent;

  lent = { index, root, slots };
  try {
    return run();
  } finally {
    lent = previous;
  }
};

/**
 * Runs `lower` with `index` answering for the children of `root` and
 * resolving its tree's virtual references. The helpers' root writes keep it
 * current while `lower` runs.
 *
 * @internal
 */
export const withYjsRootIndex = <T>(
  root: Y.XmlElement,
  index: RootProjectionIndex,
  lower: () => T
): T => lend(root, index, true, lower);

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
): T => lend(root, index, false, read);

const lentIndexOf = (parent: Y.XmlElement): RootProjectionIndex | null =>
  lent !== null && lent.slots && lent.root === parent ? lent.index : null;

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
  const { ids } = tree;
  const rawChildren = getRawYjsChildren(root);
  const shown = new Map<number, YjsNode>();

  for (const slot of getYjsVisibleChildSlots(
    root,
    root,
    (id) => ids.get(id) ?? null,
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

const rebuildLentIndex = (): void => {
  if (lent === null) return;

  const input = readYjsRootIndex(lent.root);

  if (input === null) {
    lent.index.reset([], { ids: new Map(), referrers: [] });
    lent = null;
  } else {
    lent.index.reset(input.entries, input.tree);
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
      createLazyYjsNodeIdResolver(root)
    );
  }

  return raw;
};

const insertRawYjsChildren = (
  parent: Y.XmlElement,
  rawIndex: number,
  children: YjsNode[]
): void => {
  parent.insert(rawIndex, children);

  const index = lentIndexOf(parent);

  if (
    index !== null &&
    !index.insert(
      rawIndex,
      children.map((child) => readYjsRootSlot(parent, child))
    )
  ) {
    rebuildLentIndex();
  }
};

const deleteRawYjsChildren = (
  parent: Y.XmlElement,
  rawIndex: number,
  count: number
): void => {
  lentIndexOf(parent)?.delete(rawIndex, count);
  parent.delete(rawIndex, count);
};

/**
 * Writes or removes one of `YJS_CHILD_VISIBILITY_KEYS` on `node`, so the lent
 * index follows what `node` shows in its parent.
 */
const writeYjsVisibility = (
  node: YjsNode,
  key: string,
  value: string | true | null
): void => {
  if (value === null) {
    node.removeAttribute(key);
  } else {
    setYjsAttribute(node, key, value);
  }
  if (
    key === YJS_VIRTUAL_CHILD_ID_KEY &&
    typeof value === 'string' &&
    node instanceof Y.XmlElement
  ) {
    lent?.index.noteReferrer(value, node);
  }

  const { parent } = node;

  if (!(parent instanceof Y.XmlElement)) return;

  const index = lentIndexOf(parent);

  if (index !== null && !index.show(readYjsRootSlot(parent, node))) {
    rebuildLentIndex();
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

const hasRawYjsChildren = (node: Y.XmlElement): boolean => {
  const rawChildren = readYjsChildren(node);
  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (isYjsContentNode(child)) {
      return true;
    }
    index += 1;
  }

  return false;
};

const isHiddenYjsNode = (node: YjsNode): boolean =>
  getYjsAttributes(node)[YJS_HIDDEN_KEY] === true;

const isEmptyAttributeFreeYjsText = (node: YjsNode): boolean =>
  node instanceof Y.XmlText &&
  getYjsLength(node) === 0 &&
  Object.keys(getYjsAttributes(node)).every(
    (key) => key === YJS_NODE_ID_KEY || isYjsMarkRecordKey(key)
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
type YjsNodeIdResolver = (id: string) => YjsNode | null;

const isVirtualYjsPlaceholder = (node: YjsNode): boolean =>
  node instanceof Y.XmlElement &&
  getYjsAttributes(node)[YJS_VIRTUAL_PLACEHOLDER_KEY] === true;

const hasRawYjsChildSlot = (slot: YjsVisibleChildSlot): boolean =>
  slot.rawIndex !== VIRTUAL_YJS_CHILD_RAW_INDEX;

const getVirtualYjsChild = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  visited?: Set<Y.XmlElement>,
  resolveNodeById?: YjsNodeIdResolver
): YjsNode | null => {
  const virtualChildId = node.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY);

  if (typeof virtualChildId === 'string') {
    const nextVisited = visited ?? new Set<Y.XmlElement>();

    if (nextVisited.has(node)) {
      return null;
    }

    nextVisited.add(node);

    const virtualChild = resolveNodeById
      ? resolveNodeById(virtualChildId)
      : findYjsNodeById(root, virtualChildId);

    if (
      virtualChild instanceof Y.XmlElement &&
      isVirtualYjsPlaceholder(virtualChild)
    ) {
      return getVirtualYjsChild(
        root,
        virtualChild,
        nextVisited,
        resolveNodeById
      );
    }

    return virtualChild;
  }

  return null;
};

const getYjsVisibleChildSlots = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  resolveNodeById?: YjsNodeIdResolver,
  rawChildren = getRawYjsChildren(node)
): YjsVisibleChildSlot[] => {
  const rawSlots = new Array<YjsVisibleChildSlot>(rawChildren.length + 1);
  const visibleNodes = new Set<YjsNode>();
  let writeIndex = 0;

  if (!isVirtualYjsPlaceholder(node)) {
    const virtualChild = getVirtualYjsChild(
      root,
      node,
      undefined,
      resolveNodeById
    );

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
      const virtualChild = getVirtualYjsChild(
        root,
        child,
        undefined,
        resolveNodeById
      );

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
  resolveNodeById?: YjsNodeIdResolver
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
    const virtualChild = getVirtualYjsChild(
      root,
      node,
      undefined,
      resolveNodeById
    );

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
      const virtualChild = getVirtualYjsChild(
        root,
        child,
        undefined,
        resolveNodeById
      );

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
  resolveNodeById: YjsNodeIdResolver,
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
    const virtualChild = getVirtualYjsChild(
      root,
      node,
      undefined,
      resolveNodeById
    );

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
      const virtualChild = getVirtualYjsChild(
        root,
        child,
        undefined,
        resolveNodeById
      );

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
  resolveNodeById: YjsNodeIdResolver
): YjsNode | undefined =>
  getYjsVisibleChildSlotAt(root, node, index, resolveNodeById)?.node;

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
  resolveNodeById: YjsNodeIdResolver
): YjsNode[] => getYjsVisibleChildNodes(root, node, resolveNodeById);

export const getYjsVisibleChild = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  index: number
): YjsNode | undefined =>
  getYjsVisibleChildAt(root, node, index, createLazyYjsNodeIdResolver(root));

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
  const resolveNodeById = createLazyYjsNodeIdResolver(root);

  return (node) =>
    getYjsVisibleChildrenWithResolver(root, node, resolveNodeById);
};

export const resolveYjsTextPoint = (
  root: Y.XmlElement,
  path: Path,
  offset: number,
  readVisibleChildren: YjsVisibleChildrenReader
): YjsTextPoint | null => {
  const target = getYjsNode(root, path);

  if (!(target instanceof Y.XmlText)) {
    throw new Error('Text target is not a Y.XmlText.');
  }

  const { index, parent } = getYjsParent(root, path);
  const children = readVisibleChildren(parent);
  let remainingOffset = offset;

  let childIndex = index;

  while (childIndex < children.length) {
    const child = children[childIndex];

    if (!(child instanceof Y.XmlText)) {
      break;
    }

    const length = getYjsLength(child);

    if (remainingOffset <= length) {
      return { childIndex, offset: remainingOffset, parent, text: child };
    }

    remainingOffset -= length;
    childIndex += 1;
  }

  return null;
};

export const getYjsVisiblePath = (
  root: Y.XmlElement,
  target: YjsNode
): Path | null => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const path: number[] = [];
  const visit = (node: YjsNode, visited: Set<YjsNode>): Path | null => {
    if (node === target) {
      return copyPath(path);
    }
    if (!(node instanceof Y.XmlElement) || visited.has(node)) {
      return null;
    }

    visited.add(node);

    const children = getYjsVisibleChildrenWithResolver(
      root,
      node,
      resolveNodeById
    );

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
  parent: Y.XmlElement,
  children: readonly Descendant[],
  isSetValued: YjsSetPropertyResolver = noSetProperties,
  location: YjsPropertyLocation = rootPropertyLocation()
): void => {
  const length = getYjsLength(parent);

  writeYjsVisibility(parent, YJS_VIRTUAL_CHILD_ID_KEY, null);

  if (length > 0) {
    deleteRawYjsChildren(parent, 0, length);
  }

  if (children.length > 0) {
    insertRawYjsChildren(
      parent,
      0,
      createYjsNodes(children, isSetValued, location)
    );
  }
};

const EMPTY_YJS_VALUE = Object.freeze([]) as readonly Descendant[];

export const readPliteValueFromYjs = (
  root: Y.XmlElement,
  emptyValue: readonly Descendant[] = EMPTY_YJS_VALUE
): Descendant[] => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const visibleChildren = getYjsVisibleChildrenWithResolver(
    root,
    root,
    resolveNodeById
  );
  const children = segmentYjsChildren(visibleChildren).flatMap((segment) =>
    segment.kind === 'text'
      ? readTextRuns(segment.chain)
      : [readPliteNodeFromYjsWithResolver(root, segment.node, resolveNodeById)]
  );

  return children.length > 0 ? children : [...emptyValue];
};

export const readPliteNodeFromYjs = (
  root: Y.XmlElement,
  node: YjsNode
): Descendant =>
  readPliteNodeFromYjsWithResolver(
    root,
    node,
    createLazyYjsNodeIdResolver(root)
  );

const removeDuplicateVirtualYjsChildReferences = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  resolveNodeById: YjsNodeIdResolver,
  removed: Set<YjsNode>
): void => {
  const visibleNodes = new Set<YjsNode>();

  if (!isVirtualYjsPlaceholder(parent)) {
    const virtualChild = getVirtualYjsChild(
      root,
      parent,
      undefined,
      resolveNodeById
    );

    if (virtualChild !== null) visibleNodes.add(virtualChild);
  }

  const rawChildren = getRawYjsChildren(parent);
  let deleted = 0;

  for (let rawIndex = 0; rawIndex < rawChildren.length; rawIndex++) {
    const child = rawChildren[rawIndex];

    if (child === undefined || isHiddenYjsNode(child)) continue;

    if (child instanceof Y.XmlElement && isVirtualYjsPlaceholder(child)) {
      const virtualChild = getVirtualYjsChild(
        root,
        child,
        undefined,
        resolveNodeById
      );

      if (virtualChild !== null && visibleNodes.has(virtualChild)) {
        deleteRawYjsChildren(parent, rawIndex - deleted, 1);
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
  root: Y.XmlElement,
  parent: Y.XmlElement,
  resolveNodeById: YjsNodeIdResolver,
  removed: Set<YjsNode>
): void => {
  removeDuplicateVirtualYjsChildReferences(
    root,
    parent,
    resolveNodeById,
    removed
  );

  const rawChildren = getRawYjsChildren(parent);
  const visibleSlots = getYjsVisibleChildSlots(
    root,
    parent,
    resolveNodeById,
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
      deleteRawYjsChildren(parent, slot.rawIndex, 1);
    }
    slotIndex -= 1;
  }
};

const removeRedundantEmptyYjsTextTree = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  resolveNodeById: YjsNodeIdResolver,
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
        root,
        child,
        resolveNodeById,
        removed,
        visited
      );
    }
    index += 1;
  }

  removeRedundantEmptyYjsTextChildren(root, parent, resolveNodeById, removed);
};

export const removeRedundantEmptyYjsTextNodes = (root: Y.XmlElement): void => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  removeRedundantEmptyYjsTextTree(
    root,
    root,
    resolveNodeById,
    new Set(),
    new Set()
  );
};

export const removeRedundantEmptyYjsTextNodesAt = (
  root: Y.XmlElement,
  parents: ReadonlySet<Y.XmlElement>,
  recursiveRoots: ReadonlySet<Y.XmlElement>
): ReadonlySet<YjsNode> => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const removed = new Set<YjsNode>();
  const visited = new Set<Y.XmlElement>();

  for (const recursiveRoot of recursiveRoots) {
    removeRedundantEmptyYjsTextTree(
      root,
      recursiveRoot,
      resolveNodeById,
      removed,
      visited
    );
  }
  for (const parent of parents) {
    removeRedundantEmptyYjsTextChildren(root, parent, resolveNodeById, removed);
  }

  return removed;
};

const yjsAttributeRecordsEqual = (
  left: YjsAttributeRecord,
  right: YjsAttributeRecord
): boolean => {
  for (const key in left) {
    if (!Object.hasOwn(left, key)) {
      continue;
    }

    if (!areJsonLikeValuesEqual(left[key], right[key])) {
      return false;
    }
  }

  for (const key in right) {
    if (!Object.hasOwn(right, key)) {
      continue;
    }

    if (!areJsonLikeValuesEqual(left[key], right[key])) {
      return false;
    }
  }

  return true;
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

const getCloneableYjsAttributes = (node: YjsNode): YjsAttributeRecord => {
  const attributes: YjsAttributeRecord = {};

  for (const [key, value] of Object.entries(getYjsAttributes(node))) {
    if (isReservedYjsKey(key) && !isYjsSetValueAttribute(key)) {
      continue;
    }

    attributes[key] = value;
  }

  return attributes;
};

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
  resolveNodeById: YjsNodeIdResolver
): Descendant => {
  if (node instanceof Y.XmlText) return readTextRuns([node])[0];

  const attributes = getPublicYjsElementAttributes(node);
  const type = getYjsElementType(node);
  const visibleChildren = getYjsVisibleChildrenWithResolver(
    root,
    node,
    resolveNodeById
  );
  const children = segmentYjsChildren(visibleChildren).flatMap((segment) =>
    segment.kind === 'text'
      ? readTextRuns(segment.chain)
      : [readPliteNodeFromYjsWithResolver(root, segment.node, resolveNodeById)]
  );

  const pliteElement: YjsAttributeRecord = {};

  copyRecordAttributes(pliteElement, attributes);
  pliteElement.type = type;
  pliteElement.children = children.length > 0 ? children : [{ text: '' }];

  return pliteElement as Descendant;
};

const rawYjsSiblingOf = (node: YjsNode, step: -1 | 1) =>
  step < 0 ? node.prevSibling : node.nextSibling;

/**
 * A shown child of the root walks its raw siblings outward, so finding its
 * neighbor does not read every root child.
 */
const visibleYjsNeighborOf = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  node: YjsNode,
  step: -1 | 1,
  resolveNodeById: YjsNodeIdResolver
): YjsNode | undefined => {
  if (
    parent === root &&
    !isHiddenYjsNode(node) &&
    typeof root.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) !== 'string'
  ) {
    for (
      let sibling = rawYjsSiblingOf(node, step);
      sibling !== null;
      sibling = rawYjsSiblingOf(sibling, step)
    ) {
      if (!isYjsContentNode(sibling) || isHiddenYjsNode(sibling)) continue;
      if (
        !(sibling instanceof Y.XmlElement && isVirtualYjsPlaceholder(sibling))
      ) {
        return sibling;
      }

      const shown = getVirtualYjsChild(
        root,
        sibling,
        undefined,
        resolveNodeById
      );

      if (shown !== null) return shown;
    }

    return undefined;
  }

  const slots = getYjsVisibleChildSlots(root, parent, resolveNodeById);

  return slots[slots.findIndex((slot) => slot.node === node) + step]?.node;
};

export const removeSupersededVirtualYjsSplitSuffixes = (
  root: Y.XmlElement,
  insertedNodes: ReadonlySet<YjsNode>,
  truncatedTextNodes: ReadonlySet<Y.XmlText>
): ReadonlySet<YjsNode> => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const changed = new Set<YjsNode>();
  const hasTruncatedTextDescendant = (parent: Y.XmlElement): boolean => {
    for (const text of truncatedTextNodes) {
      let current = text.parent;

      while (current !== null) {
        if (current === parent) return true;

        current = current.parent;
      }
    }

    return false;
  };

  for (const inserted of insertedNodes) {
    if (
      !(inserted instanceof Y.XmlElement) ||
      inserted.doc !== root.doc ||
      isHiddenYjsNode(inserted)
    ) {
      continue;
    }

    const insertedIsPlaceholder = isVirtualYjsPlaceholder(inserted);
    let previous: YjsNode | undefined;
    let right: YjsNode | undefined;

    if (insertedIsPlaceholder) {
      const insertedParent = inserted.parent;

      if (!(insertedParent instanceof Y.XmlElement)) continue;

      previous = insertedParent;

      const { parent } = insertedParent;

      if (!(parent instanceof Y.XmlElement)) continue;

      right = visibleYjsNeighborOf(
        root,
        parent,
        insertedParent,
        1,
        resolveNodeById
      );
    } else {
      const { parent } = inserted;

      if (!(parent instanceof Y.XmlElement)) continue;

      previous = visibleYjsNeighborOf(
        root,
        parent,
        inserted,
        -1,
        resolveNodeById
      );
      right = inserted;
    }

    if (
      !(previous instanceof Y.XmlElement) ||
      !(right instanceof Y.XmlElement) ||
      getYjsElementType(previous) !== getYjsElementType(right) ||
      !yjsAttributeRecordsEqual(
        getPublicYjsElementAttributes(previous),
        getPublicYjsElementAttributes(right)
      )
    ) {
      continue;
    }

    const rightChildren = getYjsVisibleChildNodes(root, right, resolveNodeById);
    const previousRawChildren = getRawYjsChildren(previous);
    const previousSlots = getYjsVisibleChildSlots(
      root,
      previous,
      resolveNodeById,
      previousRawChildren
    );
    const suffixSlot = previousSlots.at(-1);
    const rightChild = rightChildren[0];
    const suffixValue =
      suffixSlot === undefined
        ? null
        : readPliteNodeFromYjsWithResolver(
            root,
            suffixSlot.node,
            resolveNodeById
          );
    const rightValue =
      rightChild === undefined
        ? null
        : readPliteNodeFromYjsWithResolver(root, rightChild, resolveNodeById);
    const exactSuffix =
      suffixValue !== null &&
      rightValue !== null &&
      areJsonLikeValuesEqual(suffixValue, rightValue);
    let extendedSuffix = false;

    if (
      suffixValue !== null &&
      rightValue !== null &&
      NodeApi.isText(suffixValue) &&
      NodeApi.isText(rightValue) &&
      suffixValue.text.length > 0 &&
      rightValue.text.startsWith(suffixValue.text) &&
      hasTruncatedTextDescendant(previous)
    ) {
      const { text: _suffixText, ...suffixProperties } = suffixValue;
      const { text: _rightText, ...rightProperties } = rightValue;

      extendedSuffix = areJsonLikeValuesEqual(
        suffixProperties,
        rightProperties
      );
    }

    if (
      rightChildren.length !== 1 ||
      rightChild === undefined ||
      suffixSlot === undefined ||
      !hasRawYjsChildSlot(suffixSlot) ||
      !isHiddenYjsNode(suffixSlot.node) ||
      (!exactSuffix && !extendedSuffix)
    ) {
      continue;
    }

    const placeholder = previousRawChildren[suffixSlot.rawIndex];

    if (
      !(placeholder instanceof Y.XmlElement) ||
      !isVirtualYjsPlaceholder(placeholder) ||
      (insertedIsPlaceholder && placeholder !== inserted)
    ) {
      continue;
    }

    deleteRawYjsChildren(previous, suffixSlot.rawIndex, 1);
    changed.add(previous);
  }

  return changed;
};

const cloneYjsNodeWithRoot = (
  node: YjsNode,
  root: Y.XmlElement,
  resolveNodeById: YjsNodeIdResolver
): YjsNode | null => {
  if (node instanceof Y.XmlElement && isVirtualYjsPlaceholder(node)) {
    const virtualChild = getVirtualYjsChild(
      root,
      node,
      undefined,
      resolveNodeById
    );

    return virtualChild === null
      ? null
      : cloneYjsNodeWithRoot(virtualChild, root, resolveNodeById);
  }

  const attributes = getCloneableYjsAttributes(node);

  if (node instanceof Y.XmlText) return cloneYjsText(node, attributes);

  const clone = new Y.XmlElement(YJS_ELEMENT_NODE_NAME);
  const rawChildren = getRawYjsChildren(node);
  const visibleSlots = getYjsVisibleChildSlots(
    root,
    node,
    resolveNodeById,
    rawChildren
  );
  const children = new Array<YjsNode>(visibleSlots.length);
  let writeIndex = 0;
  let slotIndex = 0;

  while (slotIndex < visibleSlots.length) {
    const slot = visibleSlots[slotIndex];

    if (slot === undefined) {
      throw new Error('Cannot clone Yjs children from a sparse slot array.');
    }

    const childClone = cloneYjsSlotWithRoot(
      root,
      slot,
      rawChildren[slot.rawIndex],
      resolveNodeById
    );

    if (childClone !== null) {
      children[writeIndex] = childClone;
      writeIndex += 1;
    }
    slotIndex += 1;
  }

  children.length = writeIndex;
  assignFreshYjsNodeId(clone);
  setYjsAttributes(clone, attributes);

  if (children.length > 0) {
    clone.insert(0, children);
  }

  return clone;
};

export const cloneVisibleYjsNodes = (
  root: Y.XmlElement,
  nodes: readonly YjsNode[]
): YjsNode[] => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const clones = new Array<YjsNode>(nodes.length);
  let writeIndex = 0;
  let index = 0;

  while (index < nodes.length) {
    const node = nodes[index];

    if (node === undefined) {
      throw new Error('Cannot clone visible Yjs nodes from a sparse array.');
    }

    const clone = cloneYjsNodeWithRoot(node, root, resolveNodeById);

    if (clone !== null) {
      clones[writeIndex] = clone;
      writeIndex += 1;
    }
    index += 1;
  }

  clones.length = writeIndex;

  return clones;
};

const cloneYjsSlotWithRoot = (
  root: Y.XmlElement,
  slot: YjsVisibleChildSlot,
  rawChild: YjsNode | undefined,
  resolveNodeById: YjsNodeIdResolver
): YjsNode | null => {
  if (
    !hasRawYjsChildSlot(slot) ||
    (rawChild instanceof Y.XmlElement && isVirtualYjsPlaceholder(rawChild))
  ) {
    return createVirtualYjsMovePlaceholder(slot.node);
  }

  return cloneYjsNodeWithRoot(slot.node, root, resolveNodeById);
};

export const splitVisibleYjsChildren = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  position: number
): YjsNode[] => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const rawChildren = getRawYjsChildren(parent);
  const visibleSlots = getYjsVisibleChildSlots(
    root,
    parent,
    resolveNodeById,
    rawChildren
  );
  const rightChildren = new Array<YjsNode>(
    Math.max(visibleSlots.length - position, 0)
  );
  let writeIndex = 0;

  let index = position;

  while (index < visibleSlots.length) {
    const slot = visibleSlots[index];

    if (slot === undefined) {
      index += 1;
      continue;
    }

    if (!hasRawYjsChildSlot(slot)) {
      writeYjsVisibility(parent, YJS_VIRTUAL_CHILD_ID_KEY, null);
      rightChildren[writeIndex] = createVirtualYjsMovePlaceholder(slot.node);
      writeIndex += 1;
      index += 1;

      continue;
    }

    const childClone = cloneYjsSlotWithRoot(
      root,
      slot,
      rawChildren[slot.rawIndex],
      resolveNodeById
    );

    if (childClone !== null) {
      rightChildren[writeIndex] = childClone;
      writeIndex += 1;
    }
    index += 1;
  }

  rightChildren.length = writeIndex;

  index = visibleSlots.length - 1;

  while (index >= position) {
    const slot = visibleSlots[index];

    if (slot !== undefined && hasRawYjsChildSlot(slot)) {
      deleteRawYjsChildren(parent, slot.rawIndex, 1);
    }
    index -= 1;
  }

  return rightChildren;
};

const getYjsNodeWithResolver = (
  root: Y.XmlElement,
  path: Path,
  resolveNodeById: YjsNodeIdResolver
): YjsNode => {
  let current: YjsNode = root;
  let pathIndex = 0;

  while (pathIndex < path.length) {
    const index = path[pathIndex];

    if (typeof index !== 'number') {
      throw new Error(`No Yjs node at path ${path.join('.')}`);
    }

    if (current instanceof Y.XmlText) {
      throw new Error(
        `Cannot descend into Y.XmlText at path ${path.join('.')}`
      );
    }

    const child: YjsNode | undefined = getYjsVisibleChildAt(
      root,
      current,
      index,
      resolveNodeById
    );

    if (!isYjsContentNode(child)) {
      throw new Error(`No Yjs node at path ${path.join('.')}`);
    }

    current = child;
    pathIndex += 1;
  }

  return current;
};

const getYjsNodeWithResolverIf = (
  root: Y.XmlElement,
  path: Path,
  resolveNodeById: YjsNodeIdResolver
): YjsNode | null => {
  let current: YjsNode = root;
  let pathIndex = 0;

  while (pathIndex < path.length) {
    const index = path[pathIndex];

    if (typeof index !== 'number') {
      return null;
    }

    if (current instanceof Y.XmlText) {
      return null;
    }

    const child: YjsNode | undefined = getYjsVisibleChildAt(
      root,
      current,
      index,
      resolveNodeById
    );

    if (!isYjsContentNode(child)) {
      return null;
    }

    current = child;
    pathIndex += 1;
  }

  return current;
};

export const getYjsNode = (root: Y.XmlElement, path: Path): YjsNode =>
  getYjsNodeWithResolver(root, path, createLazyYjsNodeIdResolver(root));

export const getYjsNodeIf = (root: Y.XmlElement, path: Path): YjsNode | null =>
  getYjsNodeWithResolverIf(root, path, createLazyYjsNodeIdResolver(root));

export const setVirtualYjsMove = (
  target: YjsNode,
  wrapper: Y.XmlElement
): void => {
  const nodeId = ensureYjsNodeId(target);

  hideYjsNode(target);
  writeYjsVisibility(wrapper, YJS_VIRTUAL_CHILD_ID_KEY, nodeId);
};

export const createVirtualYjsMovePlaceholder = (
  target: YjsNode
): Y.XmlElement => {
  const nodeId = ensureYjsNodeId(target);
  const placeholder = new Y.XmlElement(YJS_ELEMENT_NODE_NAME);

  hideYjsNode(target);
  writeYjsVisibility(placeholder, YJS_VIRTUAL_CHILD_ID_KEY, nodeId);
  writeYjsVisibility(placeholder, YJS_VIRTUAL_PLACEHOLDER_KEY, true);

  return placeholder;
};

export const hideYjsNode = (node: YjsNode): void => {
  writeYjsVisibility(node, YJS_HIDDEN_KEY, true);
};

export const insertYjsChild = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  index: number,
  child: YjsNode
): void => {
  if (
    getYjsLength(parent) === 0 &&
    typeof parent.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) !== 'string'
  ) {
    insertRawYjsChildren(parent, 0, [child]);

    return;
  }

  const rootIndex = lentIndexOf(parent);

  if (rootIndex !== null) {
    insertRawYjsChildren(
      parent,
      rootIndex.slotAt(index)?.rawIndex ?? rootIndex.rawLength,
      [child]
    );

    return;
  }

  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const rawChildren = getRawYjsChildren(parent);
  const visibleSlots = getYjsVisibleChildSlots(
    root,
    parent,
    resolveNodeById,
    rawChildren
  );
  const visibleSlot = visibleSlots[index];

  if (visibleSlot?.rawIndex === VIRTUAL_YJS_CHILD_RAW_INDEX) {
    // Parent-level virtual children have no raw slot; inserting before one
    // requires materializing it as a placeholder after the inserted child.
    writeYjsVisibility(parent, YJS_VIRTUAL_CHILD_ID_KEY, null);
    insertRawYjsChildren(parent, 0, [
      child,
      createVirtualYjsMovePlaceholder(visibleSlot.node),
    ]);

    return;
  }

  const rawIndex =
    index >= visibleSlots.length || !visibleSlot
      ? rawChildren.length
      : visibleSlot.rawIndex;

  insertRawYjsChildren(parent, rawIndex, [child]);
};

export const setVirtualYjsUnwrapMove = (
  root: Y.XmlElement,
  target: YjsNode,
  wrapper: Y.XmlElement,
  wrapperParent: Y.XmlElement,
  wrapperIndex: number
): void => {
  const nodeId = target.getAttribute(YJS_NODE_ID_KEY);

  if (
    typeof nodeId !== 'string' ||
    wrapper.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) !== nodeId
  ) {
    throw new Error('move_node unwrap target is not a virtual wrapper child.');
  }

  writeYjsVisibility(target, YJS_HIDDEN_KEY, null);
  writeYjsVisibility(wrapper, YJS_VIRTUAL_CHILD_ID_KEY, null);

  if (hasRawYjsChildren(wrapper)) {
    insertYjsChild(
      root,
      wrapperParent,
      wrapperIndex,
      createVirtualYjsMovePlaceholder(target)
    );
  } else {
    hideYjsNode(wrapper);
  }
};

export const isVirtualYjsChild = (
  target: YjsNode,
  wrapper: Y.XmlElement
): boolean => {
  const nodeId = target.getAttribute(YJS_NODE_ID_KEY);

  return (
    typeof nodeId === 'string' &&
    wrapper.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) === nodeId
  );
};

export const removeYjsVirtualPlaceholderChild = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  index: number,
  target: YjsNode
): boolean => {
  const rootIndex = lentIndexOf(parent);
  const rawChildren =
    rootIndex === null ? getRawYjsChildren(parent) : undefined;
  const visibleSlot = getYjsVisibleChildSlotAt(
    root,
    parent,
    index,
    createLazyYjsNodeIdResolver(root),
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

  deleteRawYjsChildren(parent, visibleSlot.rawIndex, 1);

  return true;
};

export const removeYjsChild = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  index: number,
  editorNode?: Descendant
): YjsChildRemovalMode => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const rawChildren =
    lentIndexOf(parent) === null ? getRawYjsChildren(parent) : undefined;
  const visibleSlot = getYjsVisibleChildSlotAt(
    root,
    parent,
    index,
    resolveNodeById,
    rawChildren
  );
  let hiddenIndex: number | null = null;
  const getHiddenIndex = (): number => {
    hiddenIndex ??= findHiddenYjsChildIndex(
      root,
      rawChildren ?? getRawYjsChildren(parent),
      editorNode,
      resolveNodeById
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

      writeYjsVisibility(parent, YJS_VIRTUAL_CHILD_ID_KEY, null);

      return 'hidden';
    }

    if (
      editorNode !== undefined &&
      !matchesPliteNode(visibleSlot.node, editorNode) &&
      getHiddenIndex() !== -1
    ) {
      deleteRawYjsChildren(parent, getHiddenIndex(), 1);

      return 'hidden';
    }

    if (
      visibleSlot.node instanceof Y.XmlElement &&
      hasHiddenYjsDescendant(visibleSlot.node)
    ) {
      hideYjsNode(visibleSlot.node);

      return 'hidden-parent';
    }

    deleteRawYjsChildren(parent, visibleSlot.rawIndex, 1);

    return 'visible';
  }

  const matchingHiddenIndex = getHiddenIndex();

  if (matchingHiddenIndex === -1) {
    throw new Error('No Yjs child to remove at the requested visible path.');
  }

  deleteRawYjsChildren(parent, matchingHiddenIndex, 1);

  return 'hidden';
};

export const getYjsParent = (
  root: Y.XmlElement,
  path: Path
): { readonly index: number; readonly parent: Y.XmlElement } => {
  const index = lastPathIndex(path);

  if (index === undefined) {
    throw new Error('Cannot resolve a parent for the Yjs root.');
  }

  const yjsParentPath = parentPath(path);
  const parent = getYjsNode(root, yjsParentPath);

  if (parent instanceof Y.XmlText) {
    throw new Error(`Yjs parent is text at path ${yjsParentPath.join('.')}`);
  }

  return { index, parent };
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
  resolveNodeById: YjsNodeIdResolver
): boolean => {
  if (!matchesPliteNode(yjsNode, editorNode)) {
    return false;
  }

  if (NodeApi.isText(editorNode)) {
    const text = String(editorNode.text);

    return (
      yjsNode instanceof Y.XmlText &&
      getYjsLength(yjsNode) === text.length &&
      getYjsTextContent(yjsNode) === text
    );
  }

  if (!(yjsNode instanceof Y.XmlElement)) {
    return false;
  }

  const children = getYjsVisibleChildrenWithResolver(
    root,
    yjsNode,
    resolveNodeById
  );

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
      !matchesPliteNodeContent(root, yjsChild, child, resolveNodeById)
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
  resolveNodeById: YjsNodeIdResolver
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

    if (matchesPliteNodeContent(root, child, editorNode, resolveNodeById)) {
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

const findYjsNodeById = (root: Y.XmlElement, id: string): YjsNode | null => {
  const stack: YjsNode[] = [root];

  for (let node = stack.pop(); node; node = stack.pop()) {
    if (node.getAttribute(YJS_NODE_ID_KEY) === id) {
      return node;
    }

    if (node instanceof Y.XmlElement) {
      pushRawYjsChildren(stack, node);
    }
  }

  return null;
};

/** @internal */
export const readYjsTreeRefs = (root: YjsNode): YjsTreeRefs => {
  const ids = new Map<string, YjsNode>();
  const referrers: Array<readonly [string, Y.XmlElement]> = [];
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
    }
  }

  return { ids, referrers };
};

const createYjsNodeIdResolver = (root: Y.XmlElement): YjsNodeIdResolver => {
  const nodesById = readYjsTreeRefs(root).ids;

  return (id) => nodesById.get(id) ?? null;
};

const createLazyYjsNodeIdResolver = (root: Y.XmlElement): YjsNodeIdResolver => {
  if (lent !== null && lent.root === root) {
    const { index } = lent;

    return (id) => index.resolve(id);
  }

  let resolveNodeById: YjsNodeIdResolver | null = null;

  return (id) => {
    resolveNodeById ??= createYjsNodeIdResolver(root);

    return resolveNodeById(id);
  };
};
