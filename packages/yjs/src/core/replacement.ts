import type { Descendant, Operation } from '@platejs/plite';
import * as Y from 'yjs';

import {
  formatYjsTextAttributes,
  getPliteYjsElementType,
  removePliteYjsAttribute,
  setPliteYjsAttribute,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  assertPublicYjsAttributeCanBeSet,
  createYjsVisibleChildrenReader,
  getYjsLength,
  type YjsVisibleChildrenReader,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import { isRecord } from './record';

type PliteElementLike = {
  readonly children: readonly Descendant[];
} & Readonly<Record<string, unknown>>;

type PliteTextLike = {
  readonly text: string;
} & Readonly<Record<string, unknown>>;

export const isNoopPliteOperationForYjs = (operation: Operation): boolean => {
  switch (operation.type) {
    case 'replace_children':
    case 'replace_fragment':
      return areJsonLikeValuesEqual(operation.children, operation.newChildren);
    default:
      return false;
  }
};

const isPliteText = (node: unknown): node is PliteTextLike =>
  isRecord(node) && typeof node.text === 'string';

const isPliteElement = (node: unknown): node is PliteElementLike =>
  isRecord(node) && Array.isArray(node.children);

const getTextAttributes = (node: PliteTextLike): YjsAttributeRecord => {
  const attributes: YjsAttributeRecord = {};

  for (const key in node) {
    if (Object.hasOwn(node, key) && key !== 'text') {
      attributes[key] = node[key];
    }
  }

  return attributes;
};

const getElementAttributes = (node: PliteElementLike): YjsAttributeRecord => {
  const attributes: YjsAttributeRecord = {};

  for (const key in node) {
    if (Object.hasOwn(node, key) && key !== 'children') {
      attributes[key] = node[key];
    }
  }

  return attributes;
};

const applyTextFormatPatch = (
  text: Y.XmlText,
  patch: YjsAttributeRecord
): void => {
  const length = getYjsLength(text);

  if (length === 0) {
    return;
  }

  formatYjsTextAttributes(text, 0, length, patch);
};

const copyYjsChildren = (children: readonly YjsNode[]): YjsNode[] => {
  const copy = new Array<YjsNode>(children.length);

  let index = 0;

  while (index < children.length) {
    const child = children[index];

    if (child === undefined) {
      throw new Error('Cannot copy a sparse Yjs child array.');
    }

    copy[index] = child;
    index++;
  }

  return copy;
};

export const setYjsNodeAttributes = (
  node: YjsNode,
  properties: YjsAttributeRecord,
  newProperties: YjsAttributeRecord
): void => {
  const textNode = node instanceof Y.XmlText ? node : null;
  const textPatch: YjsAttributeRecord | null = textNode === null ? null : {};
  let hasTextPatch = false;

  for (const key in newProperties) {
    if (!Object.hasOwn(newProperties, key)) {
      continue;
    }

    const value = newProperties[key];

    assertPublicYjsAttributeCanBeSet(key);

    if (value === null || value === undefined) {
      if (properties[key] === null || properties[key] === undefined) {
        continue;
      }

      removePliteYjsAttribute(node, key);
      if (textPatch !== null) {
        textPatch[key] = null;
        hasTextPatch = true;
      }
      continue;
    }

    if (areJsonLikeValuesEqual(properties[key], value)) {
      continue;
    }

    setPliteYjsAttribute(node, key, value);

    if (textPatch !== null) {
      textPatch[key] = value;
      hasTextPatch = true;
    }
  }

  for (const key in properties) {
    if (!Object.hasOwn(properties, key)) {
      continue;
    }

    if (Object.hasOwn(newProperties, key)) {
      continue;
    }
    assertPublicYjsAttributeCanBeSet(key);

    removePliteYjsAttribute(node, key);

    if (textPatch !== null) {
      textPatch[key] = null;
      hasTextPatch = true;
    }
  }

  if (textNode !== null && textPatch !== null && hasTextPatch) {
    applyTextFormatPatch(textNode, textPatch);
  }
};

export const createSplitElement = (
  original: Y.XmlElement,
  properties: YjsAttributeRecord,
  children: readonly YjsNode[]
): Y.XmlElement => {
  const elementType =
    typeof properties.type === 'string'
      ? properties.type
      : getPliteYjsElementType(original);
  const element = new Y.XmlElement(elementType);

  for (const key in properties) {
    if (!Object.hasOwn(properties, key) || key === 'type') {
      continue;
    }

    assertPublicYjsAttributeCanBeSet(key);
  }
  setPliteYjsAttribute(element, 'type', elementType);

  for (const key in properties) {
    if (!Object.hasOwn(properties, key) || key === 'type') {
      continue;
    }

    setPliteYjsAttribute(element, key, properties[key]);
  }

  if (children.length > 0) {
    element.insert(0, copyYjsChildren(children));
  }

  return element;
};

const getSharedPrefixLength = (left: string, right: string): number => {
  let index = 0;

  while (
    index < left.length &&
    index < right.length &&
    left[index] === right[index]
  ) {
    index++;
  }

  return index;
};

const getSharedSuffixLength = (
  left: string,
  right: string,
  prefixLength: number
): number => {
  let length = 0;

  while (
    length < left.length - prefixLength &&
    length < right.length - prefixLength
  ) {
    const leftIndex = left.length - 1 - length;
    const rightIndex = right.length - 1 - length;

    if (left[leftIndex] !== right[rightIndex]) {
      break;
    }

    length++;
  }

  return length;
};

const replaceYjsText = (
  text: Y.XmlText,
  previous: string,
  next: string,
  attributes: YjsAttributeRecord
): void => {
  if (previous === next) {
    return;
  }

  const prefixLength = getSharedPrefixLength(previous, next);
  const suffixLength = getSharedSuffixLength(previous, next, prefixLength);
  const removeLength = previous.length - prefixLength - suffixLength;
  const insertLength = next.length - prefixLength - suffixLength;

  if (removeLength > 0) {
    text.delete(prefixLength, removeLength);
  }

  if (insertLength > 0) {
    const insertText = next.slice(prefixLength, prefixLength + insertLength);

    text.insert(prefixLength, insertText, attributes);
  }
};

const canReplaceCompatibleYjsChildren = (
  readVisibleChildren: YjsVisibleChildrenReader,
  children: readonly YjsNode[],
  oldChildren: readonly Descendant[],
  newChildren: readonly Descendant[],
  startIndex = 0
): boolean => {
  if (
    children.length - startIndex < oldChildren.length ||
    oldChildren.length !== newChildren.length
  ) {
    return false;
  }

  let index = 0;

  while (index < oldChildren.length) {
    const child = children[startIndex + index];
    const oldChild = oldChildren[index];
    const newChild = newChildren[index];

    if (child === undefined) {
      return false;
    }

    if (child instanceof Y.XmlText) {
      if (!isPliteText(oldChild) || !isPliteText(newChild)) {
        return false;
      }
      index++;
      continue;
    }

    if (
      child instanceof Y.XmlElement &&
      isPliteElement(oldChild) &&
      isPliteElement(newChild)
    ) {
      if (
        !canReplaceCompatibleYjsChildren(
          readVisibleChildren,
          readVisibleChildren(child),
          oldChild.children,
          newChild.children
        )
      ) {
        return false;
      }

      index++;
      continue;
    }

    return false;
  }

  return true;
};

const applyCompatibleYjsChildrenReplacement = (
  readVisibleChildren: YjsVisibleChildrenReader,
  children: readonly YjsNode[],
  oldChildren: readonly Descendant[],
  newChildren: readonly Descendant[],
  startIndex = 0
): void => {
  let index = 0;

  while (index < oldChildren.length) {
    const child = children[startIndex + index];
    const oldChild = oldChildren[index];
    const newChild = newChildren[index];

    if (child instanceof Y.XmlText) {
      if (!isPliteText(oldChild) || !isPliteText(newChild)) {
        index++;
        continue;
      }

      const attributes = getTextAttributes(newChild);

      setYjsNodeAttributes(child, getTextAttributes(oldChild), attributes);
      replaceYjsText(child, oldChild.text, newChild.text, attributes);

      index++;
      continue;
    }

    if (
      child instanceof Y.XmlElement &&
      isPliteElement(oldChild) &&
      isPliteElement(newChild)
    ) {
      setYjsNodeAttributes(
        child,
        getElementAttributes(oldChild),
        getElementAttributes(newChild)
      );
      applyCompatibleYjsChildrenReplacement(
        readVisibleChildren,
        readVisibleChildren(child),
        oldChild.children,
        newChild.children
      );
    }
    index++;
  }
};

const replaceCompatibleYjsChildrenWithReader = (
  readVisibleChildren: YjsVisibleChildrenReader,
  children: readonly YjsNode[],
  oldChildren: readonly Descendant[],
  newChildren: readonly Descendant[],
  startIndex = 0
): boolean => {
  if (
    !canReplaceCompatibleYjsChildren(
      readVisibleChildren,
      children,
      oldChildren,
      newChildren,
      startIndex
    )
  ) {
    return false;
  }

  applyCompatibleYjsChildrenReplacement(
    readVisibleChildren,
    children,
    oldChildren,
    newChildren,
    startIndex
  );

  return true;
};

export const replaceCompatibleYjsChildren = (
  root: Y.XmlElement,
  children: readonly YjsNode[],
  oldChildren: readonly Descendant[],
  newChildren: readonly Descendant[],
  startIndex = 0
): boolean =>
  replaceCompatibleYjsChildrenWithReader(
    createYjsVisibleChildrenReader(root),
    children,
    oldChildren,
    newChildren,
    startIndex
  );
