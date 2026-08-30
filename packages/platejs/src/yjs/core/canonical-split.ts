import * as Y from 'yjs';

import {
  type Descendant,
  type Element,
  NodeApi,
  type Path,
  type Text,
} from '../../core';
import {
  getPliteYjsElementType,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  createYjsNode,
  createYjsPropertyContext,
  createYjsVisibleChildrenReader,
  getYjsLength,
  getYjsNode,
  getYjsParent,
  getYjsTextContentFrom,
  getYjsVisibleChildren,
  insertYjsChild,
  resolveYjsTextPoint,
  splitVisibleYjsChildren,
  type YjsPropertyContext,
  type YjsPropertyLocation,
  type YjsSetPropertyResolver,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import { nextPath } from './path';

type CanonicalSplit = Readonly<{
  elementPath: Path;
  elementProperties: YjsAttributeRecord;
  rightText: string;
  textPath: Path;
  textProperties: YjsAttributeRecord;
}>;

const isElement = (node: Descendant | null): node is Element =>
  node !== null && NodeApi.isElement(node);

const isText = (node: Descendant | null): node is Text =>
  node !== null && NodeApi.isText(node);

const nodeProperties = (
  node: Element | Text,
  contentKey: 'children' | 'text'
): YjsAttributeRecord => {
  const properties: YjsAttributeRecord = {};
  const record = node as Readonly<Record<string, unknown>>;

  for (const key of Object.keys(node)) {
    if (key !== contentKey) properties[key] = record[key];
  }

  return properties;
};

const nodePropertiesEqual = (
  left: Element | Text,
  right: Element | Text,
  contentKey: 'children' | 'text'
) =>
  areJsonLikeValuesEqual(
    nodeProperties(left, contentKey),
    nodeProperties(right, contentKey)
  );

const findSplitText = (
  before: Element,
  left: Element,
  right: Element,
  elementPath: Path
): CanonicalSplit | null => {
  for (let index = 0; index < before.children.length; index++) {
    const originalText = before.children[index] ?? null;
    const leftText = left.children[index] ?? null;
    const rightText = right.children[0] ?? null;

    if (
      !isText(originalText) ||
      !isText(leftText) ||
      !isText(rightText) ||
      originalText.text !== leftText.text + rightText.text ||
      !nodePropertiesEqual(originalText, leftText, 'text') ||
      !areJsonLikeValuesEqual(
        before.children.slice(0, index),
        left.children.slice(0, index)
      ) ||
      left.children.length !== index + 1 ||
      !areJsonLikeValuesEqual(
        before.children.slice(index + 1),
        right.children.slice(1)
      )
    ) {
      continue;
    }

    return {
      elementPath,
      elementProperties: nodeProperties(right, 'children'),
      rightText: rightText.text,
      textPath: [...elementPath, index],
      textProperties: nodeProperties(rightText, 'text'),
    };
  }

  return null;
};

const findCanonicalSplitAtLevel = (
  before: readonly Descendant[],
  after: readonly Descendant[],
  parentPath: Path
): CanonicalSplit | null => {
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

  if (beforeChanged.length === 1 && afterChanged.length === 2) {
    const original = beforeChanged[0] ?? null;
    const left = afterChanged[0] ?? null;
    const right = afterChanged[1] ?? null;

    if (
      isElement(original) &&
      isElement(left) &&
      isElement(right) &&
      nodePropertiesEqual(original, left, 'children')
    ) {
      const split = findSplitText(original, left, right, [...parentPath, from]);

      if (split !== null) return split;
    }
  }

  if (before.length !== after.length) return null;

  let nested: CanonicalSplit | null = null;

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

    nested = findCanonicalSplitAtLevel(oldNode.children, newNode.children, [
      ...parentPath,
      index,
    ]);

    if (nested === null) return null;
  }

  return nested;
};

export const findCanonicalSplit = (
  before: readonly Descendant[],
  after: readonly Descendant[]
): CanonicalSplit | null => findCanonicalSplitAtLevel(before, after, []);

const copyYjsNodes = (nodes: readonly YjsNode[]): YjsNode[] => {
  const copy = new Array<YjsNode>(nodes.length);

  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];

    if (node === undefined) {
      throw new Error('Cannot split a sparse Yjs child array.');
    }
    copy[index] = node;
  }

  return copy;
};

const createSplitYjsElement = (
  original: Y.XmlElement,
  properties: YjsAttributeRecord,
  children: readonly YjsNode[],
  isSetValued: YjsSetPropertyResolver,
  context: YjsPropertyContext
): Y.XmlElement => {
  const elementType =
    typeof properties.type === 'string'
      ? properties.type
      : getPliteYjsElementType(original);
  const element = createYjsNode(
    { ...properties, children: [], type: elementType },
    isSetValued,
    context
  );

  if (!(element instanceof Y.XmlElement)) {
    throw new Error('Cannot split a Yjs element into text.');
  }
  if (children.length > 0) element.insert(0, copyYjsNodes(children));

  return element;
};

const createYjsPropertyLocationFromPath = (
  root: Y.XmlElement,
  parent: Path,
  schemaRoot: string | null
): YjsPropertyLocation => {
  const ancestors: string[] = [];
  const current: number[] = [];

  for (const index of parent) {
    current.push(index);

    const node = getYjsNode(root, current);

    if (!(node instanceof Y.XmlElement)) {
      throw new Error(
        `Cannot resolve Yjs property parent context at ${parent.join('.')}.`
      );
    }
    ancestors.unshift(getPliteYjsElementType(node));
  }

  return { ancestors, path: parent, root: schemaRoot };
};

const splitYjsText = (
  root: Y.XmlElement,
  path: Path,
  position: number,
  properties: YjsAttributeRecord,
  isSetValued: YjsSetPropertyResolver,
  schemaRoot: string | null
): number => {
  const readVisibleChildren = createYjsVisibleChildrenReader(root);
  const point = resolveYjsTextPoint(root, path, position, readVisibleChildren);

  if (point === null) {
    throw new Error('Cannot lower split because the text boundary is gone.');
  }

  const children = readVisibleChildren(point.parent);
  const nextChild = children[point.childIndex + 1];
  const textLength = getYjsLength(point.text);

  if (point.offset === textLength && nextChild instanceof Y.XmlText) {
    return point.childIndex + 1;
  }

  const rightText = getYjsTextContentFrom(point.text, point.offset);

  if (rightText.length > 0) {
    point.text.delete(point.offset, rightText.length);
  }

  const rightNode = { ...properties, text: rightText } as Descendant;
  const right = createYjsNode(
    rightNode,
    isSetValued,
    createYjsPropertyContext(rightNode, {
      ...createYjsPropertyLocationFromPath(root, path.slice(0, -1), schemaRoot),
      path: nextPath(path),
    })
  );

  if (!(right instanceof Y.XmlText)) {
    throw new Error('Cannot split Yjs text into an element.');
  }

  insertYjsChild(root, point.parent, point.childIndex + 1, right);

  return point.childIndex + 1;
};

export const applyCanonicalSplitToYjs = (
  root: Y.XmlElement,
  split: CanonicalSplit,
  isSetValued: YjsSetPropertyResolver,
  schemaRoot: string | null
): Y.XmlElement => {
  const text = getYjsNode(root, split.textPath);

  if (!(text instanceof Y.XmlText)) {
    throw new Error('Cannot lower split because the text boundary is gone.');
  }

  const { index: textIndex, parent: textParent } = getYjsParent(
    root,
    split.textPath
  );
  const textSiblings = getYjsVisibleChildren(root, textParent);
  let contiguousTextLength = 0;

  for (let index = textIndex; index < textSiblings.length; index++) {
    const sibling = textSiblings[index];

    if (!(sibling instanceof Y.XmlText)) break;
    contiguousTextLength += getYjsLength(sibling);
  }

  const physicalElementPosition = splitYjsText(
    root,
    split.textPath,
    contiguousTextLength - split.rightText.length,
    split.textProperties,
    isSetValued,
    schemaRoot
  );
  const target = getYjsNode(root, split.elementPath);

  if (!(target instanceof Y.XmlElement)) {
    throw new Error('Cannot lower split because the element boundary is gone.');
  }

  const { index, parent } = getYjsParent(root, split.elementPath);
  const rightChildren = splitVisibleYjsChildren(
    root,
    target,
    physicalElementPosition
  );
  const rightNode = {
    ...split.elementProperties,
    children: [],
    type:
      typeof split.elementProperties.type === 'string'
        ? split.elementProperties.type
        : getPliteYjsElementType(target),
  } as Descendant;
  const right = createSplitYjsElement(
    target,
    split.elementProperties,
    rightChildren,
    isSetValued,
    createYjsPropertyContext(rightNode, {
      ...createYjsPropertyLocationFromPath(
        root,
        split.elementPath.slice(0, -1),
        schemaRoot
      ),
      path: nextPath(split.elementPath),
    })
  );

  insertYjsChild(root, parent, index + 1, right);

  return right;
};
