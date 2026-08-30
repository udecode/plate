import * as Y from 'yjs';

export const PLITE_TYPE_ATTRIBUTE = 'plite:type';

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

export const formatYjsTextAttributes = (
  text: Y.XmlText,
  index: number,
  length: number,
  attributes: YjsAttributeRecord
): void => {
  text.format(index, length, attributes);
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

export const getPliteYjsElementType = (element: Y.XmlElement): string =>
  String(element.getAttribute(PLITE_TYPE_ATTRIBUTE) ?? element.nodeName);

export const setPliteYjsAttribute = (
  node: YjsNode,
  key: string,
  value: unknown
): void => {
  if (key === 'type' && node instanceof Y.XmlElement) {
    setYjsAttribute(node, PLITE_TYPE_ATTRIBUTE, String(value));

    return;
  }

  setYjsAttribute(node, key, value);
};

export const removePliteYjsAttribute = (node: YjsNode, key: string): void => {
  if (key === 'type' && node instanceof Y.XmlElement) {
    node.removeAttribute(PLITE_TYPE_ATTRIBUTE);

    return;
  }

  node.removeAttribute(key);
};

export const setPliteYjsAttributes = (
  node: YjsNode,
  attributes: YjsAttributeRecord
): void => {
  for (const key in attributes) {
    if (!Object.hasOwn(attributes, key)) {
      continue;
    }

    setPliteYjsAttribute(node, key, attributes[key]);
  }
};
