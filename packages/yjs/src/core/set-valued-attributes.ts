import { assertEditorJsonValue } from '@platejs/plite/internal';

import type { YjsAttributeRecord } from './attributes';

export const YJS_SET_VALUE_ATTRIBUTE_PREFIX = 'plite:yjs-set:';

const canonicalJson = (value: unknown): string => {
  assertEditorJsonValue(value, 'Yjs set-valued attribute item');

  if (value === null) return 'null';
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(',')}]`;
  }
  if (typeof value !== 'object') {
    return `${typeof value}:${JSON.stringify(value)}`;
  }

  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalJson(
          (value as Readonly<Record<string, unknown>>)[key]
        )}`
    )
    .join(',')}}`;
};

const propertyPrefix = (property: string): string =>
  `${YJS_SET_VALUE_ATTRIBUTE_PREFIX}${encodeURIComponent(property)}:`;

export const createYjsSetValueAttributeKey = (
  property: string,
  value: unknown
): string =>
  `${propertyPrefix(property)}${encodeURIComponent(canonicalJson(value))}`;

export const isYjsSetValueAttribute = (key: string): boolean =>
  key.startsWith(YJS_SET_VALUE_ATTRIBUTE_PREFIX);

export const getYjsSetValueAttributeKeys = (
  attributes: Readonly<YjsAttributeRecord>,
  property: string
): readonly string[] => {
  const prefix = propertyPrefix(property);

  return Object.keys(attributes).filter((key) => key.startsWith(prefix));
};

export const encodeYjsSetValueAttributes = (
  property: string,
  values: readonly unknown[]
): YjsAttributeRecord => {
  const attributes: YjsAttributeRecord = {};

  for (const value of values) {
    attributes[createYjsSetValueAttributeKey(property, value)] =
      structuredClone(value);
  }

  return attributes;
};

export const readYjsSetValueAttributes = (
  attributes: Readonly<YjsAttributeRecord>
): YjsAttributeRecord => {
  const entries = new Map<
    string,
    Array<readonly [canonicalKey: string, value: unknown]>
  >();

  for (const [key, value] of Object.entries(attributes)) {
    if (!isYjsSetValueAttribute(key)) continue;

    const separator = key.indexOf(':', YJS_SET_VALUE_ATTRIBUTE_PREFIX.length);

    if (separator === -1) continue;

    try {
      const property = decodeURIComponent(
        key.slice(YJS_SET_VALUE_ATTRIBUTE_PREFIX.length, separator)
      );

      if (
        property.length === 0 ||
        property === '__proto__' ||
        property === 'constructor' ||
        property === 'prototype' ||
        key !== createYjsSetValueAttributeKey(property, value)
      ) {
        continue;
      }

      const values = entries.get(property) ?? [];

      values.push([canonicalJson(value), structuredClone(value)]);
      entries.set(property, values);
    } catch {
      // Ignore malformed internal attributes from untrusted collaborative data.
    }
  }

  const result: YjsAttributeRecord = {};

  for (const [property, values] of entries) {
    Object.defineProperty(result, property, {
      configurable: true,
      enumerable: true,
      value: values
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([, value]) => value),
      writable: true,
    });
  }

  return result;
};
