import type { Descendant } from '@platejs/plite';
import { type Diff, DiffMatchPatch, DiffOp } from 'diff-match-patch-ts';
import * as Y from 'yjs';

import {
  formatYjsTextAttributes,
  getYjsAttributes,
  removePliteYjsAttribute,
  setYjsAttribute,
  setPliteYjsAttribute,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  assertPublicYjsAttributeCanBeSet,
  createYjsPropertyContext,
  createYjsVisibleChildrenReader,
  getYjsLength,
  type YjsPropertyContext,
  type YjsPropertyLocation,
  type YjsSetPropertyResolver,
  type YjsVisibleChildrenReader,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import { isRecord } from './record';
import {
  encodeYjsSetValueAttributes,
  getYjsSetValueAttributeKeys,
} from './set-valued-attributes';

type PliteElementLike = {
  readonly children: readonly Descendant[];
} & Readonly<Record<string, unknown>>;

type PliteTextLike = {
  readonly text: string;
} & Readonly<Record<string, unknown>>;

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

const getEncodedTextAttributes = (
  node: PliteTextLike,
  isSetValued: YjsSetPropertyResolver,
  context: YjsPropertyContext
): YjsAttributeRecord => {
  const attributes = getTextAttributes(node);
  const encoded: YjsAttributeRecord = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (!isSetValued(node as Descendant, key, context)) {
      encoded[key] = value;
      continue;
    }
    if (!Array.isArray(value)) {
      throw new Error(`Set-valued Yjs property "${key}" must be an array.`);
    }

    Object.assign(encoded, encodeYjsSetValueAttributes(key, value));
  }

  return encoded;
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

export const setYjsNodeAttributes = (
  node: YjsNode,
  properties: YjsAttributeRecord,
  newProperties: YjsAttributeRecord,
  isSetValued: (key: string) => boolean = () => false
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

    if (isSetValued(key)) {
      if (!Array.isArray(value)) {
        throw new Error(`Set-valued Yjs property "${key}" must be an array.`);
      }

      const currentAttributes = getYjsAttributes(node);
      const encoded = encodeYjsSetValueAttributes(key, value);

      removePliteYjsAttribute(node, key);
      if (textPatch !== null) {
        textPatch[key] = null;
        hasTextPatch = true;
      }

      for (const encodedKey of getYjsSetValueAttributeKeys(
        currentAttributes,
        key
      )) {
        if (Object.hasOwn(encoded, encodedKey)) continue;

        node.removeAttribute(encodedKey);
        if (textPatch !== null) {
          textPatch[encodedKey] = null;
          hasTextPatch = true;
        }
      }
      for (const [encodedKey, encodedValue] of Object.entries(encoded)) {
        if (
          areJsonLikeValuesEqual(currentAttributes[encodedKey], encodedValue)
        ) {
          continue;
        }

        setYjsAttribute(node, encodedKey, encodedValue);
        if (textPatch !== null) {
          textPatch[encodedKey] = encodedValue;
          hasTextPatch = true;
        }
      }

      continue;
    }

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

    if (isSetValued(key)) {
      const currentAttributes = getYjsAttributes(node);

      removePliteYjsAttribute(node, key);
      if (textPatch !== null) {
        textPatch[key] = null;
        hasTextPatch = true;
      }
      for (const encodedKey of getYjsSetValueAttributeKeys(
        currentAttributes,
        key
      )) {
        node.removeAttribute(encodedKey);
        if (textPatch !== null) {
          textPatch[encodedKey] = null;
          hasTextPatch = true;
        }
      }

      continue;
    }

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

const textDiff = new DiffMatchPatch();
const MAX_TEXT_DIFF_MATRIX = 1_000_000;

textDiff.Diff_Timeout = 0;

const commonPrefixLength = (left: string, right: string): number => {
  const limit = Math.min(left.length, right.length);
  let length = 0;

  while (length < limit && left[length] === right[length]) length++;

  return length;
};

const commonSuffixLength = (
  left: string,
  right: string,
  prefix: number
): number => {
  const limit = Math.min(left.length, right.length) - prefix;
  let length = 0;

  while (length < limit && left.at(-1 - length) === right.at(-1 - length)) {
    length++;
  }

  return length;
};

const boundedTextDiff = (left: string, right: string): Diff[] => {
  const prefixLength = commonPrefixLength(left, right);
  const suffixLength = commonSuffixLength(left, right, prefixLength);
  const prefix = left.slice(0, prefixLength);
  const suffix = left.slice(left.length - suffixLength);
  const leftMiddle = left.slice(prefixLength, left.length - suffixLength);
  const rightMiddle = right.slice(prefixLength, right.length - suffixLength);
  const middle =
    leftMiddle.length === 0
      ? ([[DiffOp.Insert, rightMiddle]] satisfies Diff[])
      : rightMiddle.length === 0
        ? ([[DiffOp.Delete, leftMiddle]] satisfies Diff[])
        : leftMiddle.length <= MAX_TEXT_DIFF_MATRIX / rightMiddle.length
          ? textDiff.diff_main(leftMiddle, rightMiddle, false)
          : ([
              [DiffOp.Delete, leftMiddle],
              [DiffOp.Insert, rightMiddle],
            ] satisfies Diff[]);

  return [
    ...(prefix ? ([[DiffOp.Equal, prefix]] satisfies Diff[]) : []),
    ...middle,
    ...(suffix ? ([[DiffOp.Equal, suffix]] satisfies Diff[]) : []),
  ];
};

const diffText = (previous: string, next: string): Diff[] => {
  const reverse = previous > next;
  const diff = boundedTextDiff(
    reverse ? next : previous,
    reverse ? previous : next
  );

  return reverse
    ? diff.map(
        ([operation, value]) =>
          [
            operation === DiffOp.Delete
              ? DiffOp.Insert
              : operation === DiffOp.Insert
                ? DiffOp.Delete
                : DiffOp.Equal,
            value,
          ] satisfies Diff
      )
    : diff;
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

  let offset = 0;

  for (const [operation, value] of diffText(previous, next)) {
    if (operation === DiffOp.Equal) {
      offset += value.length;
    } else if (operation === DiffOp.Delete) {
      text.delete(offset, value.length);
    } else {
      text.insert(offset, value, attributes);
      offset += value.length;
    }
  }
};

const canReplaceCompatibleYjsChildrenWithReader = (
  readVisibleChildren: YjsVisibleChildrenReader,
  children: readonly YjsNode[],
  oldChildren: readonly Descendant[],
  newChildren: readonly Descendant[],
  startIndex = 0
): boolean => {
  if (
    children.length - startIndex !== oldChildren.length ||
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
        !canReplaceCompatibleYjsChildrenWithReader(
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
  startIndex = 0,
  isSetValued: YjsSetPropertyResolver = () => false,
  location: YjsPropertyLocation = { ancestors: [], path: [], root: null }
): void => {
  let index = 0;

  while (index < oldChildren.length) {
    const child = children[startIndex + index];
    const oldChild = oldChildren[index];
    const newChild = newChildren[index];

    if (newChild === undefined) {
      index++;
      continue;
    }

    const context = createYjsPropertyContext(newChild, {
      ancestors: location.ancestors,
      path: [...location.path, (location.offset ?? startIndex) + index],
      root: location.root,
    });

    if (child instanceof Y.XmlText) {
      if (!isPliteText(oldChild) || !isPliteText(newChild)) {
        index++;
        continue;
      }

      const attributes = getTextAttributes(newChild);

      setYjsNodeAttributes(
        child,
        getTextAttributes(oldChild),
        attributes,
        (key) => isSetValued(newChild as Descendant, key, context)
      );
      replaceYjsText(
        child,
        oldChild.text,
        newChild.text,
        getEncodedTextAttributes(newChild, isSetValued, context)
      );

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
        getElementAttributes(newChild),
        (key) => isSetValued(newChild as Descendant, key, context)
      );
      applyCompatibleYjsChildrenReplacement(
        readVisibleChildren,
        readVisibleChildren(child),
        oldChild.children,
        newChild.children,
        0,
        isSetValued,
        {
          ancestors: [context.type, ...context.ancestors],
          path: context.path,
          root: context.root,
        }
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
  startIndex = 0,
  isSetValued: YjsSetPropertyResolver = () => false,
  location: YjsPropertyLocation = { ancestors: [], path: [], root: null }
): boolean => {
  if (
    !canReplaceCompatibleYjsChildrenWithReader(
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
    startIndex,
    isSetValued,
    location
  );

  return true;
};

export const canReplaceCompatibleYjsChildren = (
  root: Y.XmlElement,
  children: readonly YjsNode[],
  oldChildren: readonly Descendant[],
  newChildren: readonly Descendant[],
  startIndex = 0
): boolean =>
  canReplaceCompatibleYjsChildrenWithReader(
    createYjsVisibleChildrenReader(root),
    children,
    oldChildren,
    newChildren,
    startIndex
  );

export const replaceCompatibleYjsChildren = (
  root: Y.XmlElement,
  children: readonly YjsNode[],
  oldChildren: readonly Descendant[],
  newChildren: readonly Descendant[],
  startIndex = 0,
  isSetValued: YjsSetPropertyResolver = () => false,
  location: YjsPropertyLocation = { ancestors: [], path: [], root: null }
): boolean =>
  replaceCompatibleYjsChildrenWithReader(
    createYjsVisibleChildrenReader(root),
    children,
    oldChildren,
    newChildren,
    startIndex,
    isSetValued,
    location
  );
