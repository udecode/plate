import * as Y from 'yjs';

import {
  type Descendant,
  type Element,
  NodeApi,
  type Path,
  type Text,
} from '../../index';
import {
  getYjsElementType,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  createYjsNode,
  createYjsPropertyContext,
  getYjsNode,
  getYjsParent,
  getYjsVisibleChildren,
  insertYjsChild,
  splitVisibleYjsChildren,
  type YjsPropertyContext,
  type YjsPropertyLocation,
  type YjsSetPropertyResolver,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import { nextPath } from './path';
import {
  createYjsRunEncoder,
  createYjsTextChain,
  cutTextChain,
  rewriteTextRuns,
  segmentPliteChildren,
  segmentYjsChildren,
} from './text-runs';

type CanonicalSplit = Readonly<{
  elementPath: Path;
  elementProperties: YjsAttributeRecord;
  rightLeaves: readonly Text[] | null;
  textPath: Path;
  textGroup: number;
  textOffset: number;
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

    const segments = segmentPliteChildren(before.children);
    const textGroup = segments.findIndex(
      (segment) =>
        segment.kind === 'text' &&
        segment.from <= index &&
        index < segment.from + segment.leaves.length
    );
    const group = segments[textGroup];
    if (group?.kind !== 'text') return null;
    const [rightGroup] = segmentPliteChildren(right.children);
    return {
      elementPath,
      elementProperties: nodeProperties(right, 'children'),
      rightLeaves:
        nodePropertiesEqual(originalText, rightText, 'text') ||
        rightGroup?.kind !== 'text'
          ? null
          : rightGroup.leaves,
      textPath: [...elementPath, index],
      textGroup,
      textOffset:
        group.leaves
          .slice(0, index - group.from)
          .reduce((sum, leaf) => sum + leaf.text.length, 0) +
        leftText.text.length,
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
      : getYjsElementType(original);
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
    ancestors.unshift(getYjsElementType(node));
  }

  return { ancestors, path: parent, root: schemaRoot };
};

export const applyCanonicalSplitToYjs = (
  root: Y.XmlElement,
  split: CanonicalSplit,
  isSetValued: YjsSetPropertyResolver,
  schemaRoot: string | null
): Y.XmlElement => {
  const target = getYjsNode(root, split.elementPath);

  if (!(target instanceof Y.XmlElement)) {
    throw new Error('Cannot lower split because the element boundary is gone.');
  }
  const group = segmentYjsChildren(getYjsVisibleChildren(root, target))[
    split.textGroup
  ];
  if (group?.kind !== 'text') {
    throw new Error('Cannot lower split because the text boundary is gone.');
  }
  const physicalElementPosition = cutTextChain(
    root,
    target,
    group.chain,
    split.textOffset
  );

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
        : getYjsElementType(target),
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

  // Patching the moved runs in place, instead of refusing the split, keeps a
  // peer's concurrent typing in the block it split.
  if (split.rightLeaves) {
    const encode = createYjsRunEncoder(isSetValued, {
      ...createYjsPropertyLocationFromPath(
        root,
        nextPath(split.elementPath),
        schemaRoot
      ),
      offset: 0,
    });
    const rightGroup = segmentYjsChildren(
      getYjsVisibleChildren(root, right)
    )[0];
    if (rightGroup?.kind === 'text') {
      rewriteTextRuns(rightGroup.chain, split.rightLeaves, encode);
    } else {
      insertYjsChild(
        root,
        right,
        0,
        createYjsTextChain(split.rightLeaves, encode)
      );
    }
  }

  return right;
};
