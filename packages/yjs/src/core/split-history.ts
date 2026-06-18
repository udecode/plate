import type { Path } from '@platejs/slate';
import * as Y from 'yjs';

import {
  formatYjsTextAttributes,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  createYjsVisibleChildrenReader,
  getYjsLength,
  SPLIT_UNDO_TEXT_ATTRIBUTE,
  type YjsVisibleChildrenReader,
} from './document';
import { isRecord } from './record';
import { isNonEmptyYjsTextDeltaPart } from './text-delta';

export type SplitHistory = {
  absorbedRemoteSplit?: boolean;
  readonly elementPath: Path;
  readonly elementPosition: number;
  readonly elementProperties: YjsAttributeRecord;
  rightText: string;
  readonly textPath: Path;
  readonly textProperties: YjsAttributeRecord;
  undoneWhileDisconnected?: boolean;
};

export type PendingTextSplitHistory = Omit<
  SplitHistory,
  'elementPosition' | 'elementProperties'
>;

export const SPLIT_HISTORY_META = 'slate-yjs:split-history';

export type SplitUndoTextRepair = {
  readonly hasRemoteSplitBoundary: boolean;
  readonly length: number;
  readonly offset: number;
  readonly text: Y.XmlText;
};

type TrailingSplitUndoText = {
  readonly length: number;
  readonly offset: number;
  readonly value: string;
};

const isSlateIndex = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

const isSlatePath = (value: unknown): value is Path => {
  if (!Array.isArray(value)) {
    return false;
  }

  let index = 0;

  while (index < value.length) {
    const pathIndex = value[index];

    if (!isSlateIndex(pathIndex)) {
      return false;
    }
    index++;
  }

  return true;
};

const isOptionalBoolean = (value: unknown): value is boolean | undefined =>
  value === undefined || typeof value === 'boolean';

const createTrailingSplitUndoText = (
  value: string,
  offset: number
): TrailingSplitUndoText | null =>
  value.length > 0 ? { length: value.length, offset, value } : null;

const hasAttributes = (
  attributes: Readonly<YjsAttributeRecord> | undefined
): boolean => {
  if (attributes === undefined) {
    return false;
  }

  for (const key in attributes) {
    if (Object.hasOwn(attributes, key)) {
      return true;
    }
  }

  return false;
};

const getTextInsertAttributes = (
  attributes: YjsAttributeRecord | undefined,
  extraAttributes: YjsAttributeRecord,
  extraAttributesHaveKeys = hasAttributes(extraAttributes)
): YjsAttributeRecord => {
  if (!extraAttributesHaveKeys) {
    return attributes ?? {};
  }
  if (!hasAttributes(attributes)) {
    return extraAttributes;
  }

  const merged: YjsAttributeRecord = {};

  for (const key in attributes) {
    if (Object.hasOwn(attributes, key)) {
      merged[key] = attributes[key];
    }
  }
  for (const key in extraAttributes) {
    if (Object.hasOwn(extraAttributes, key)) {
      merged[key] = extraAttributes[key];
    }
  }

  return merged;
};

const appendTextContent = (
  target: Y.XmlText,
  source: Y.XmlText,
  extraAttributes: YjsAttributeRecord = {}
): string => {
  if (getYjsLength(source) === 0) {
    return '';
  }

  let offset = getYjsLength(target);
  let insertedText = '';
  const extraAttributesHaveKeys = hasAttributes(extraAttributes);
  const sourceDelta = source.toDelta();
  let index = 0;

  while (index < sourceDelta.length) {
    const delta = sourceDelta[index];

    if (!isNonEmptyYjsTextDeltaPart(delta)) {
      index++;
      continue;
    }

    target.insert(
      offset,
      delta.insert,
      getTextInsertAttributes(
        delta.attributes,
        extraAttributes,
        extraAttributesHaveKeys
      )
    );
    offset += delta.insert.length;
    insertedText += delta.insert;
    index++;
  }

  return insertedText;
};

const appendElementTextWithReader = (
  readVisibleChildren: YjsVisibleChildrenReader,
  target: Y.XmlText,
  element: Y.XmlElement,
  extraAttributes: YjsAttributeRecord = {}
): string => {
  let insertedText = '';
  const children = readVisibleChildren(element);
  let index = 0;

  while (index < children.length) {
    const child = children[index];

    if (child === undefined) {
      throw new Error('Cannot append text from a sparse visible child array.');
    }

    if (child instanceof Y.XmlText) {
      insertedText += appendTextContent(target, child, extraAttributes);
    } else {
      insertedText += appendElementTextWithReader(
        readVisibleChildren,
        target,
        child,
        extraAttributes
      );
    }
    index++;
  }

  return insertedText;
};

export const appendElementText = (
  root: Y.XmlElement,
  target: Y.XmlText,
  element: Y.XmlElement,
  extraAttributes: YjsAttributeRecord = {}
): string =>
  appendElementTextWithReader(
    createYjsVisibleChildrenReader(root),
    target,
    element,
    extraAttributes
  );

const findLastVisibleText = (
  readVisibleChildren: YjsVisibleChildrenReader,
  node: YjsNode
): Y.XmlText | null => {
  if (node instanceof Y.XmlText) {
    return node;
  }

  const children = readVisibleChildren(node);

  let index = children.length - 1;

  while (index >= 0) {
    const child = children[index];

    if (child === undefined) {
      index--;
      continue;
    }

    const text = findLastVisibleText(readVisibleChildren, child);

    if (text !== null) {
      return text;
    }
    index--;
  }

  return null;
};

export const getTrailingSplitUndoText = (
  text: Y.XmlText
): TrailingSplitUndoText | null => {
  if (getYjsLength(text) === 0) {
    return null;
  }

  const delta = text.toDelta();
  let offset = getYjsLength(text);
  let value = '';

  let index = delta.length - 1;

  while (index >= 0) {
    const part = delta[index];

    if (!isNonEmptyYjsTextDeltaPart(part)) {
      return createTrailingSplitUndoText(value, offset);
    }

    if (part.attributes?.[SPLIT_UNDO_TEXT_ATTRIBUTE] === true) {
      offset -= part.insert.length;
      value = part.insert + value;
      index--;
      continue;
    }

    break;
  }

  return createTrailingSplitUndoText(value, offset);
};

export const clearSplitUndoTextAttribute = (
  text: Y.XmlText,
  offset: number,
  length: number
): void => {
  formatYjsTextAttributes(text, offset, length, {
    [SPLIT_UNDO_TEXT_ATTRIBUTE]: null,
  });
};

const visibleTextStartsWithReader = (
  readVisibleChildren: YjsVisibleChildrenReader,
  node: YjsNode,
  prefix: string
): boolean => {
  if (prefix.length === 0) {
    return true;
  }

  let prefixIndex = 0;
  const visit = (current: YjsNode): boolean => {
    if (prefixIndex === prefix.length) {
      return true;
    }

    if (current instanceof Y.XmlText) {
      if (getYjsLength(current) === 0) {
        return true;
      }

      const currentDelta = current.toDelta();
      let deltaIndex = 0;

      while (deltaIndex < currentDelta.length) {
        const part = currentDelta[deltaIndex];

        if (!isNonEmptyYjsTextDeltaPart(part)) {
          deltaIndex++;
          continue;
        }

        for (
          let index = 0;
          index < part.insert.length && prefixIndex < prefix.length;
          index++
        ) {
          if (part.insert[index] !== prefix[prefixIndex]) {
            return false;
          }

          prefixIndex++;
        }

        if (prefixIndex === prefix.length) {
          return true;
        }
        deltaIndex++;
      }

      return true;
    }

    const children = readVisibleChildren(current);
    let childIndex = 0;

    while (childIndex < children.length) {
      const child = children[childIndex];

      if (child === undefined) {
        throw new Error(
          'Cannot compare text from a sparse visible child array.'
        );
      }

      if (!visit(child)) {
        return false;
      }
      if (prefixIndex === prefix.length) {
        return true;
      }
      childIndex++;
    }

    return true;
  };

  return visit(node) && prefixIndex === prefix.length;
};

export const visibleTextStartsWith = (
  root: Y.XmlElement,
  node: YjsNode,
  prefix: string
): boolean =>
  visibleTextStartsWithReader(
    createYjsVisibleChildrenReader(root),
    node,
    prefix
  );

export const findSplitUndoTextRepairs = (
  root: Y.XmlElement
): SplitUndoTextRepair[] => {
  const repairs: SplitUndoTextRepair[] = [];
  const readVisibleChildren = createYjsVisibleChildrenReader(root);

  const visit = (parent: Y.XmlElement): void => {
    const children = readVisibleChildren(parent);

    let index = 0;

    while (index < children.length) {
      const left = children[index];

      if (!(left instanceof Y.XmlElement)) {
        index++;
        continue;
      }

      const leftText = findLastVisibleText(readVisibleChildren, left);
      const right = children[index + 1];
      const trailing =
        leftText === null ? null : getTrailingSplitUndoText(leftText);

      if (leftText !== null && trailing !== null) {
        repairs.push({
          hasRemoteSplitBoundary:
            right === undefined
              ? false
              : visibleTextStartsWithReader(
                  readVisibleChildren,
                  right,
                  trailing.value
                ),
          length: trailing.length,
          offset: trailing.offset,
          text: leftText,
        });
      }
      index++;
    }

    let childIndex = 0;

    while (childIndex < children.length) {
      const child = children[childIndex];

      if (child instanceof Y.XmlElement) {
        visit(child);
      }
      childIndex++;
    }
  };

  visit(root);

  return repairs;
};

export const isSplitHistory = (value: unknown): value is SplitHistory => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isSlatePath(value.elementPath) &&
    isSlatePath(value.textPath) &&
    typeof value.rightText === 'string' &&
    isSlateIndex(value.elementPosition) &&
    isRecord(value.elementProperties) &&
    isRecord(value.textProperties) &&
    isOptionalBoolean(value.absorbedRemoteSplit) &&
    isOptionalBoolean(value.undoneWhileDisconnected)
  );
};
