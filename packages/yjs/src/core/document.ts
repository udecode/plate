import type { Descendant, Path } from '@platejs/plite';
import * as Y from 'yjs';

import {
  getPliteYjsElementType,
  getYjsAttributes,
  hasYjsAttributes,
  PLITE_TYPE_ATTRIBUTE,
  setYjsAttribute,
  setYjsAttributes,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import { areJsonLikeValuesEqual } from './json-equality';
import { copyPath, lastPathIndex, parentPath } from './path';
import {
  getYjsTextDeltaPartText,
  isNonEmptyYjsTextDeltaPart,
} from './text-delta';

const HIDDEN_ATTRIBUTE = 'plite:yjs-hidden';
const NODE_ID_ATTRIBUTE = 'plite:yjs-id';
export const SPLIT_UNDO_TEXT_ATTRIBUTE = 'plite:yjs-split-undo-text';
const VIRTUAL_CHILD_ID_ATTRIBUTE = 'plite:yjs-virtual-child-id';
const VIRTUAL_PLACEHOLDER_ATTRIBUTE = 'plite:yjs-virtual-placeholder';
const VIRTUAL_YJS_CHILD_RAW_INDEX = -1;
const INTERNAL_YJS_ATTRIBUTES = [
  HIDDEN_ATTRIBUTE,
  NODE_ID_ATTRIBUTE,
  PLITE_TYPE_ATTRIBUTE,
  SPLIT_UNDO_TEXT_ATTRIBUTE,
  VIRTUAL_CHILD_ID_ATTRIBUTE,
  VIRTUAL_PLACEHOLDER_ATTRIBUTE,
] as const;
const INTERNAL_YJS_ATTRIBUTE_SET = new Set<string>(INTERNAL_YJS_ATTRIBUTES);

let nextNodeId = 0;
const nodeIdScope = Math.random().toString(36).slice(2);

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
    index++;
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
    index++;
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
      index--;
      continue;
    }

    const partText = getYjsTextDeltaPartText(part);

    if (partText.length === 0) {
      index--;
      continue;
    }

    let partIndex = partText.length - 1;

    while (partIndex >= 0 && suffixIndex > 0) {
      suffixIndex--;

      if (partText[partIndex] !== suffix[suffixIndex]) {
        return false;
      }
      partIndex--;
    }
    index--;
  }

  return suffixIndex === 0;
};

const isYjsContentNode = (value: unknown): value is YjsNode =>
  value instanceof Y.XmlElement || value instanceof Y.XmlText;

const getRawYjsChildren = (node: Y.XmlElement): YjsNode[] => {
  const rawChildren = node.toArray();
  const children = new Array<YjsNode>(rawChildren.length);
  let writeIndex = 0;
  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (isYjsContentNode(child)) {
      children[writeIndex] = child;
      writeIndex++;
    }
    index++;
  }

  children.length = writeIndex;

  return children;
};

const pushRawYjsChildren = (target: YjsNode[], node: Y.XmlElement): void => {
  const rawChildren = node.toArray();
  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (isYjsContentNode(child)) {
      target.push(child);
    }
    index++;
  }
};

const hasRawYjsChildren = (node: Y.XmlElement): boolean => {
  const rawChildren = node.toArray();
  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (isYjsContentNode(child)) {
      return true;
    }
    index++;
  }

  return false;
};

const isHiddenYjsNode = (node: YjsNode): boolean =>
  getYjsAttributes(node)[HIDDEN_ATTRIBUTE] === true;

const isEmptyAttributeFreeYjsText = (node: YjsNode): boolean =>
  node instanceof Y.XmlText &&
  getYjsLength(node) === 0 &&
  !hasYjsAttributes(node);

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
  getYjsAttributes(node)[VIRTUAL_PLACEHOLDER_ATTRIBUTE] === true;

const hasRawYjsChildSlot = (slot: YjsVisibleChildSlot): boolean =>
  slot.rawIndex !== VIRTUAL_YJS_CHILD_RAW_INDEX;

const getVirtualYjsChild = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  visited?: Set<Y.XmlElement>,
  resolveNodeById?: YjsNodeIdResolver
): YjsNode | null => {
  const virtualChildId = node.getAttribute(VIRTUAL_CHILD_ID_ATTRIBUTE);

  if (typeof virtualChildId === 'string') {
    const nextVisited = visited ?? new Set<Y.XmlElement>();

    if (nextVisited.has(node)) {
      return null;
    }

    nextVisited.add(node);

    const virtualChild =
      resolveNodeById?.(virtualChildId) ??
      findYjsNodeById(root, virtualChildId);

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
      writeIndex++;
    }
  }

  let rawIndex = 0;

  while (rawIndex < rawChildren.length) {
    const child = rawChildren[rawIndex];

    if (child === undefined) {
      rawIndex++;
      continue;
    }

    if (isHiddenYjsNode(child)) {
      rawIndex++;
      continue;
    }

    if (child instanceof Y.XmlElement && isVirtualYjsPlaceholder(child)) {
      const virtualChild = getVirtualYjsChild(
        root,
        child,
        undefined,
        resolveNodeById
      );

      if (virtualChild !== null) {
        rawSlots[writeIndex] = { node: virtualChild, rawIndex };
        writeIndex++;
      }

      rawIndex++;
      continue;
    }

    rawSlots[writeIndex] = { node: child, rawIndex };
    writeIndex++;
    rawIndex++;
  }

  rawSlots.length = writeIndex;

  return rawSlots;
};

const getYjsVisibleChildNodes = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  resolveNodeById?: YjsNodeIdResolver,
  rawChildren = getRawYjsChildren(node)
): YjsNode[] => {
  const children = new Array<YjsNode>(rawChildren.length + 1);
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
      writeIndex++;
    }
  }

  let rawIndex = 0;

  while (rawIndex < rawChildren.length) {
    const child = rawChildren[rawIndex];

    if (child === undefined) {
      rawIndex++;
      continue;
    }

    if (isHiddenYjsNode(child)) {
      rawIndex++;
      continue;
    }

    if (child instanceof Y.XmlElement && isVirtualYjsPlaceholder(child)) {
      const virtualChild = getVirtualYjsChild(
        root,
        child,
        undefined,
        resolveNodeById
      );

      if (virtualChild !== null) {
        children[writeIndex] = virtualChild;
        writeIndex++;
      }

      rawIndex++;
      continue;
    }

    children[writeIndex] = child;
    writeIndex++;
    rawIndex++;
  }

  children.length = writeIndex;

  return children;
};

const getYjsVisibleChildSlotAt = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  index: number,
  resolveNodeById: YjsNodeIdResolver,
  rawChildren: readonly unknown[] = node.toArray()
): YjsVisibleChildSlot | undefined => {
  if (typeof index !== 'number' || index < 0) {
    return;
  }

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

      visibleIndex++;
    }
  }

  let rawIndex = 0;

  while (rawIndex < rawChildren.length) {
    const child = rawChildren[rawIndex];

    if (!isYjsContentNode(child) || isHiddenYjsNode(child)) {
      rawIndex++;
      continue;
    }

    if (child instanceof Y.XmlElement && isVirtualYjsPlaceholder(child)) {
      const virtualChild = getVirtualYjsChild(
        root,
        child,
        undefined,
        resolveNodeById
      );

      if (virtualChild !== null) {
        if (visibleIndex === index) {
          return { node: virtualChild, rawIndex };
        }

        visibleIndex++;
      }

      rawIndex++;
      continue;
    }

    if (visibleIndex === index) {
      return { node: child, rawIndex };
    }

    visibleIndex++;
    rawIndex++;
  }

  return;
};

const getYjsVisibleChildAt = (
  root: Y.XmlElement,
  node: Y.XmlElement,
  index: number,
  resolveNodeById: YjsNodeIdResolver
): YjsNode | undefined =>
  getYjsVisibleChildSlotAt(root, node, index, resolveNodeById)?.node;

export const getYjsChildren = (node: Y.XmlElement): YjsNode[] => {
  const rawChildren = node.toArray();
  const children = new Array<YjsNode>(rawChildren.length);
  let writeIndex = 0;
  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (isYjsContentNode(child) && !isHiddenYjsNode(child)) {
      children[writeIndex] = child;
      writeIndex++;
    }
    index++;
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
    throw new Error('text operation target is not a Y.XmlText.');
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
    childIndex++;
  }

  return null;
};

export const getYjsVisiblePath = (
  root: Y.XmlElement,
  target: YjsNode
): Path | null => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const path: Path = [];
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
        index++;
        continue;
      }

      path.push(index);
      const childPath = visit(child, visited);
      path.pop();

      if (childPath !== null) {
        return childPath;
      }
      index++;
    }

    return null;
  };

  return visit(root, new Set());
};

export const createYjsText = (
  text: string,
  attributes: YjsAttributeRecord
): Y.XmlText => {
  const yjsText = new Y.XmlText();

  assertPublicYjsAttributesCanBeSet(attributes);
  setYjsAttributes(yjsText, attributes);

  if (text.length > 0) {
    yjsText.insert(0, text, attributes);
  }

  return yjsText;
};

export const createYjsNode = (node: Descendant): YjsNode => {
  if ('text' in node) {
    const attributes: YjsAttributeRecord = {};

    copyRecordAttributes(attributes, node, 'text');

    return createYjsText(String(node.text), attributes);
  }

  const attributes: YjsAttributeRecord = {};
  const elementType = String(node.type ?? 'element');
  const element = new Y.XmlElement(elementType);

  copyRecordAttributes(attributes, node, 'children', 'type');

  assertPublicYjsAttributesCanBeSet(attributes);
  setYjsAttribute(element, PLITE_TYPE_ATTRIBUTE, elementType);
  setYjsAttributes(element, attributes);

  if (node.children.length > 0) {
    element.insert(0, createYjsNodes(node.children));
  }

  return element;
};

export const createYjsNodes = (nodes: readonly Descendant[]): YjsNode[] => {
  const yjsNodes = new Array<YjsNode>(nodes.length);

  let index = 0;

  while (index < nodes.length) {
    const node = nodes[index];

    if (node === undefined) {
      throw new Error(
        'Cannot create Yjs nodes from a sparse Plite node array.'
      );
    }

    yjsNodes[index] = createYjsNode(node);
    index++;
  }

  return yjsNodes;
};

export const replaceYjsChildren = (
  parent: Y.XmlElement,
  children: readonly Descendant[]
): void => {
  const length = getYjsLength(parent);

  parent.removeAttribute(VIRTUAL_CHILD_ID_ATTRIBUTE);

  if (length > 0) {
    parent.delete(0, length);
  }

  if (children.length > 0) {
    parent.insert(0, createYjsNodes(children));
  }
};

export const readPliteValueFromYjs = (root: Y.XmlElement): Descendant[] => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const visibleChildren = getYjsVisibleChildrenWithResolver(
    root,
    root,
    resolveNodeById
  );
  const children = new Array<Descendant>(visibleChildren.length);

  let index = 0;

  while (index < visibleChildren.length) {
    const node = visibleChildren[index];

    if (node === undefined) {
      throw new Error('Cannot read Plite value from a sparse Yjs node array.');
    }

    children[index] = readPliteNodeFromYjs(root, node, resolveNodeById);
    index++;
  }

  return children.length > 0
    ? children
    : [{ children: [{ text: '' }], type: 'paragraph' }];
};

export const removeRedundantEmptyYjsTextNodes = (root: Y.XmlElement): void => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const visit = (parent: Y.XmlElement): void => {
    const rawChildren = getRawYjsChildren(parent);
    let index = 0;

    while (index < rawChildren.length) {
      const child = rawChildren[index];

      if (child instanceof Y.XmlElement) {
        visit(child);
      }
      index++;
    }

    const visibleSlots = getYjsVisibleChildSlots(
      root,
      parent,
      resolveNodeById,
      rawChildren
    );

    if (visibleSlots.length <= 1) {
      return;
    }

    let slotIndex = visibleSlots.length - 1;

    while (slotIndex >= 0) {
      const slot = visibleSlots[slotIndex];

      if (slot === undefined) {
        slotIndex--;
        continue;
      }

      const child = slot.node;

      if (hasRawYjsChildSlot(slot) && isEmptyAttributeFreeYjsText(child)) {
        parent.delete(slot.rawIndex, 1);
      }
      slotIndex--;
    }
  };

  visit(root);
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
    if (
      !Object.hasOwn(attributes, key) ||
      INTERNAL_YJS_ATTRIBUTE_SET.has(key)
    ) {
      continue;
    }

    publicAttributes[key] = attributes[key];
  }

  return publicAttributes;
};

const readYjsTextForPlite = (
  node: Y.XmlText
): { readonly attributes: YjsAttributeRecord; readonly text: string } => {
  if (getYjsLength(node) === 0) {
    return { attributes: {}, text: '' };
  }

  const delta = node.toDelta();
  let attributes: YjsAttributeRecord | undefined;
  let attributesAreUniform = true;
  let text = '';
  let index = 0;

  while (index < delta.length) {
    const part = delta[index];

    if (part === undefined) {
      index++;
      continue;
    }

    text += getYjsTextDeltaPartText(part);

    if (attributesAreUniform && isNonEmptyYjsTextDeltaPart(part)) {
      const partAttributes = getPublicAttributes(part.attributes);

      if (attributes === undefined) {
        attributes = partAttributes;
      } else if (!yjsAttributeRecordsEqual(attributes, partAttributes)) {
        attributes = {};
        attributesAreUniform = false;
      }
    }

    index++;
  }

  return { attributes: attributes ?? {}, text };
};

const getPublicYjsAttributes = (node: YjsNode): YjsAttributeRecord =>
  getPublicAttributes(getYjsAttributes(node));

const getPublicYjsElementAttributes = (
  node: Y.XmlElement
): YjsAttributeRecord => {
  const attributes = getPublicYjsAttributes(node);

  delete attributes[PLITE_TYPE_ATTRIBUTE];

  return attributes;
};

const readPliteNodeFromYjs = (
  root: Y.XmlElement,
  node: YjsNode,
  resolveNodeById: YjsNodeIdResolver
): Descendant => {
  if (node instanceof Y.XmlText) {
    const attributes = getPublicYjsAttributes(node);
    const readback = readYjsTextForPlite(node);
    const pliteText: YjsAttributeRecord = {};

    copyRecordAttributes(pliteText, attributes);
    copyRecordAttributes(pliteText, readback.attributes);
    pliteText.text = readback.text;

    return pliteText as Descendant;
  }

  const attributes = getPublicYjsElementAttributes(node);
  const type = getPliteYjsElementType(node);
  const visibleChildren = getYjsVisibleChildrenWithResolver(
    root,
    node,
    resolveNodeById
  );
  const children = new Array<Descendant>(visibleChildren.length);

  let index = 0;

  while (index < visibleChildren.length) {
    const child = visibleChildren[index];

    if (child === undefined) {
      throw new Error(
        'Cannot read Plite element children from a sparse array.'
      );
    }

    children[index] = readPliteNodeFromYjs(root, child, resolveNodeById);
    index++;
  }

  const pliteElement: YjsAttributeRecord = {};

  copyRecordAttributes(pliteElement, attributes);
  pliteElement.type = type;
  pliteElement.children = children.length > 0 ? children : [{ text: '' }];

  return pliteElement as Descendant;
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

  const attributes = getPublicYjsAttributes(node);

  if (node instanceof Y.XmlText) {
    const clone = new Y.XmlText();

    setYjsAttributes(clone, attributes);

    if (getYjsLength(node) > 0) {
      clone.applyDelta(node.toDelta(), { sanitize: false });
    }

    return clone;
  }

  const clone = new Y.XmlElement(node.nodeName);
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
      writeIndex++;
    }
    slotIndex++;
  }

  children.length = writeIndex;
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
      writeIndex++;
    }
    index++;
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
      index++;
      continue;
    }

    if (!hasRawYjsChildSlot(slot)) {
      parent.removeAttribute(VIRTUAL_CHILD_ID_ATTRIBUTE);
      rightChildren[writeIndex] = createVirtualYjsMovePlaceholder(slot.node);
      writeIndex++;
      index++;

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
      writeIndex++;
    }
    index++;
  }

  rightChildren.length = writeIndex;

  index = visibleSlots.length - 1;

  while (index >= position) {
    const slot = visibleSlots[index];

    if (slot !== undefined && hasRawYjsChildSlot(slot)) {
      parent.delete(slot.rawIndex, 1);
    }
    index--;
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
    pathIndex++;
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
    pathIndex++;
  }

  return current;
};

export const getYjsNode = (root: Y.XmlElement, path: Path): YjsNode =>
  getYjsNodeWithResolver(root, path, createLazyYjsNodeIdResolver(root));

export const getYjsNodeIf = (root: Y.XmlElement, path: Path): YjsNode | null =>
  getYjsNodeWithResolverIf(root, path, createLazyYjsNodeIdResolver(root));

export const setVirtualYjsMove = (
  root: Y.XmlElement,
  target: YjsNode,
  wrapper: Y.XmlElement
): void => {
  const nodeId = ensureYjsNodeId(target);

  hideYjsNode(target);
  setYjsAttribute(wrapper, VIRTUAL_CHILD_ID_ATTRIBUTE, nodeId);
};

export const createVirtualYjsMovePlaceholder = (
  target: YjsNode
): Y.XmlElement => {
  const nodeId = ensureYjsNodeId(target);
  const placeholder = new Y.XmlElement('plite-yjs-virtual-placeholder');

  hideYjsNode(target);
  setYjsAttribute(placeholder, VIRTUAL_CHILD_ID_ATTRIBUTE, nodeId);
  setYjsAttribute(placeholder, VIRTUAL_PLACEHOLDER_ATTRIBUTE, true);

  return placeholder;
};

export const hideYjsNode = (node: YjsNode): void => {
  setYjsAttribute(node, HIDDEN_ATTRIBUTE, true);
};

export const insertYjsChild = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  index: number,
  child: YjsNode
): void => {
  if (
    getYjsLength(parent) === 0 &&
    typeof parent.getAttribute(VIRTUAL_CHILD_ID_ATTRIBUTE) !== 'string'
  ) {
    parent.insert(0, [child]);

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
    parent.removeAttribute(VIRTUAL_CHILD_ID_ATTRIBUTE);
    parent.insert(0, [
      child,
      createVirtualYjsMovePlaceholder(visibleSlot.node),
    ]);

    return;
  }

  const rawIndex =
    index >= visibleSlots.length || !visibleSlot
      ? rawChildren.length
      : visibleSlot.rawIndex;

  parent.insert(rawIndex, [child]);
};

export const setVirtualYjsUnwrapMove = (
  root: Y.XmlElement,
  target: YjsNode,
  wrapper: Y.XmlElement,
  wrapperParent: Y.XmlElement,
  wrapperIndex: number
): void => {
  const nodeId = target.getAttribute(NODE_ID_ATTRIBUTE);

  if (
    typeof nodeId !== 'string' ||
    wrapper.getAttribute(VIRTUAL_CHILD_ID_ATTRIBUTE) !== nodeId
  ) {
    throw new Error('move_node unwrap target is not a virtual wrapper child.');
  }

  target.removeAttribute(HIDDEN_ATTRIBUTE);
  wrapper.removeAttribute(VIRTUAL_CHILD_ID_ATTRIBUTE);

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
  const nodeId = target.getAttribute(NODE_ID_ATTRIBUTE);

  return (
    typeof nodeId === 'string' &&
    wrapper.getAttribute(VIRTUAL_CHILD_ID_ATTRIBUTE) === nodeId
  );
};

export const removeYjsVirtualPlaceholderChild = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  index: number,
  target: YjsNode
): boolean => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const rawChildren = getRawYjsChildren(parent);
  const visibleSlot = getYjsVisibleChildSlotAt(
    root,
    parent,
    index,
    resolveNodeById,
    rawChildren
  );

  if (
    !visibleSlot ||
    !hasRawYjsChildSlot(visibleSlot) ||
    visibleSlot.node !== target
  ) {
    return false;
  }

  const rawChild = rawChildren[visibleSlot.rawIndex];

  if (
    !(rawChild instanceof Y.XmlElement) ||
    !isVirtualYjsPlaceholder(rawChild)
  ) {
    return false;
  }

  parent.delete(visibleSlot.rawIndex, 1);

  return true;
};

export const removeYjsChild = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  index: number,
  pliteNode?: Descendant
): YjsChildRemovalMode => {
  const resolveNodeById = createLazyYjsNodeIdResolver(root);
  const rawChildren = getRawYjsChildren(parent);
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
      rawChildren,
      pliteNode,
      resolveNodeById
    );

    return hiddenIndex;
  };

  if (visibleSlot !== undefined) {
    if (!hasRawYjsChildSlot(visibleSlot)) {
      if (
        pliteNode !== undefined &&
        !matchesPliteNode(visibleSlot.node, pliteNode)
      ) {
        throw new Error('Cannot remove a virtual Yjs child from its parent.');
      }

      parent.removeAttribute(VIRTUAL_CHILD_ID_ATTRIBUTE);

      return 'hidden';
    }

    if (
      pliteNode !== undefined &&
      !matchesPliteNode(visibleSlot.node, pliteNode) &&
      getHiddenIndex() !== -1
    ) {
      parent.delete(getHiddenIndex(), 1);

      return 'hidden';
    }

    if (
      visibleSlot.node instanceof Y.XmlElement &&
      hasHiddenYjsDescendant(visibleSlot.node)
    ) {
      hideYjsNode(visibleSlot.node);

      return 'hidden-parent';
    }

    parent.delete(visibleSlot.rawIndex, 1);

    return 'visible';
  }

  const matchingHiddenIndex = getHiddenIndex();

  if (matchingHiddenIndex === -1) {
    throw new Error('No Yjs child to remove at the requested visible path.');
  }

  parent.delete(matchingHiddenIndex, 1);

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

  if (INTERNAL_YJS_ATTRIBUTE_SET.has(key)) {
    throw new Error(`Cannot set internal Yjs attribute "${key}".`);
  }
};

const assertPublicYjsAttributesCanBeSet = (
  attributes: Readonly<YjsAttributeRecord>
): void => {
  for (const key in attributes) {
    if (!Object.hasOwn(attributes, key)) {
      continue;
    }

    assertPublicYjsAttributeCanBeSet(key);
  }
};

const ensureYjsNodeId = (node: YjsNode): string => {
  const currentId = node.getAttribute(NODE_ID_ATTRIBUTE);

  if (typeof currentId === 'string') {
    return currentId;
  }

  const scope = node.doc ? String(node.doc.clientID) : nodeIdScope;
  const nextId = `plite-yjs-${scope}-${++nextNodeId}`;

  setYjsAttribute(node, NODE_ID_ATTRIBUTE, nextId);

  return nextId;
};

const matchesPliteNode = (
  yjsNode: YjsNode,
  pliteNode?: Descendant
): boolean => {
  if (pliteNode === undefined) {
    return false;
  }

  if ('text' in pliteNode) {
    return yjsNode instanceof Y.XmlText;
  }

  if (!(yjsNode instanceof Y.XmlElement)) {
    return false;
  }

  return (
    getPliteYjsElementType(yjsNode) === String(pliteNode.type ?? 'element')
  );
};

const matchesPliteNodeContent = (
  root: Y.XmlElement,
  yjsNode: YjsNode,
  pliteNode: Descendant,
  resolveNodeById: YjsNodeIdResolver
): boolean => {
  if (!matchesPliteNode(yjsNode, pliteNode)) {
    return false;
  }

  if ('text' in pliteNode) {
    const text = String(pliteNode.text);

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

  if (children.length !== pliteNode.children.length) {
    return false;
  }

  let index = 0;

  while (index < pliteNode.children.length) {
    const child = pliteNode.children[index];
    const yjsChild = children[index];

    if (
      child === undefined ||
      yjsChild === undefined ||
      !matchesPliteNodeContent(root, yjsChild, child, resolveNodeById)
    ) {
      return false;
    }
    index++;
  }

  return true;
};

const findHiddenYjsChildIndex = (
  root: Y.XmlElement,
  rawChildren: readonly YjsNode[],
  pliteNode: Descendant | undefined,
  resolveNodeById: YjsNodeIdResolver
): number => {
  if (pliteNode === undefined) {
    return -1;
  }

  let candidateIndex = -1;
  let candidateCount = 0;

  let index = 0;

  while (index < rawChildren.length) {
    const child = rawChildren[index];

    if (child === undefined) {
      index++;
      continue;
    }

    if (!isHiddenYjsNode(child) || !matchesPliteNode(child, pliteNode)) {
      index++;
      continue;
    }

    if (matchesPliteNodeContent(root, child, pliteNode, resolveNodeById)) {
      return index;
    }

    candidateIndex = index;
    candidateCount++;
    index++;
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
    if (node.getAttribute(NODE_ID_ATTRIBUTE) === id) {
      return node;
    }

    if (node instanceof Y.XmlElement) {
      pushRawYjsChildren(stack, node);
    }
  }

  return null;
};

const createYjsNodeIdResolver = (root: Y.XmlElement): YjsNodeIdResolver => {
  const nodesById = new Map<string, YjsNode>();
  const stack: YjsNode[] = [root];

  for (let node = stack.pop(); node; node = stack.pop()) {
    const nodeId = node.getAttribute(NODE_ID_ATTRIBUTE);

    if (typeof nodeId === 'string') {
      nodesById.set(nodeId, node);
    }

    if (node instanceof Y.XmlElement) {
      pushRawYjsChildren(stack, node);
    }
  }

  return (id) => nodesById.get(id) ?? null;
};

const createLazyYjsNodeIdResolver = (root: Y.XmlElement): YjsNodeIdResolver => {
  let resolveNodeById: YjsNodeIdResolver | null = null;

  return (id) => {
    resolveNodeById ??= createYjsNodeIdResolver(root);

    return resolveNodeById(id);
  };
};
