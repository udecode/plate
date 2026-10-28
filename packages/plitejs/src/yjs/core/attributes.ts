import type * as Y from 'yjs';

import { YJS_CHILD_VISIBILITY_KEYS } from './keys';

export type YjsNode = Y.XmlElement | Y.XmlText;
export type YjsAttributeRecord = Record<string, unknown>;

type YjsAttributeWriter = {
  readonly setAttribute: (key: string, value: unknown) => void;
};

export const getYjsAttributes = (node: YjsNode): YjsAttributeRecord =>
  toYjsAttributeRecord(node.getAttributes());

export const hasYjsAttributes = (node: YjsNode): boolean => {
  const attributes = node.getAttributes();

  for (const key in attributes) {
    if (Object.hasOwn(attributes, key)) {
      return true;
    }
  }

  return false;
};

export const setYjsAttribute = (
  node: YjsNode,
  key: string,
  value: unknown
): void => {
  if (YJS_CHILD_VISIBILITY_KEYS.has(key)) {
    throw new Error(
      `Cannot set "${key}" outside the Yjs write scope that settles it.`
    );
  }

  // Yjs accepts JSON-ish attribute values at runtime; its XML declarations are narrower.
  const writer = node as unknown as YjsAttributeWriter;

  writer.setAttribute(key, value);
};

export const toYjsAttributeRecord = (
  attributes: Readonly<Partial<YjsAttributeRecord>>
): YjsAttributeRecord => {
  const record: YjsAttributeRecord = {};

  for (const key in attributes) {
    if (Object.hasOwn(attributes, key)) {
      record[key] = attributes[key];
    }
  }

  return record;
};

export const setYjsAttributes = (
  node: YjsNode,
  attributes: YjsAttributeRecord
): void => {
  for (const key in attributes) {
    if (!Object.hasOwn(attributes, key)) {
      continue;
    }

    setYjsAttribute(node, key, attributes[key]);
  }
};

export const getYjsElementType = (element: Y.XmlElement): string =>
  String(element.getAttribute('type') ?? 'element');
