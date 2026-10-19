import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
} from 'mdast-util-mdx';

import type {
  EditorCoreStateView,
  PropertyValueDescriptor,
} from '../../../core';
import type { MarkdownTagElement } from './markdownTags';

/**
 * The Markdown wire form of tag attributes. The schema property kind selects
 * the rule; the schema still validates the decoded value.
 */
type PropertyDescriptor = PropertyValueDescriptor &
  Readonly<{
    item?: PropertyDescriptor;
    values?: readonly string[];
  }>;

export type MarkdownTagAttributes = Readonly<Record<string, string | true>>;

const NUMBER = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

const INVALID = Symbol('invalid');

const isValidValue = (
  descriptor: PropertyDescriptor,
  value: unknown
): boolean => {
  const validKind = (() => {
    switch (descriptor.kind) {
      case 'boolean': {
        return typeof value === 'boolean';
      }
      case 'enum': {
        return (
          typeof value === 'string' &&
          descriptor.values?.includes(value) === true
        );
      }
      case 'number': {
        return typeof value === 'number' && Number.isFinite(value);
      }
      case 'set': {
        const { item } = descriptor;

        return (
          Array.isArray(value) &&
          item !== undefined &&
          value.every((entry) => isValidValue(item, entry))
        );
      }
      case 'string': {
        return typeof value === 'string';
      }
      default: {
        return true;
      }
    }
  })();

  return validKind && (!descriptor.validate || descriptor.validate(value));
};

const decodeValue = (
  descriptor: PropertyDescriptor,
  raw: string | true
): unknown => {
  const value = (() => {
    switch (descriptor.kind) {
      case 'boolean': {
        if (raw === true || raw === 'true') return true;

        return raw === 'false' ? false : INVALID;
      }
      case 'enum': {
        return raw !== true && descriptor.values?.includes(raw) ? raw : INVALID;
      }
      case 'json': {
        if (raw === true) return true;
        try {
          return JSON.parse(raw);
        } catch {
          // JSON properties accept strings, written raw (`width="80%"`).
          return raw;
        }
      }
      case 'number': {
        if (raw === true || !NUMBER.test(raw)) return INVALID;
        const parsed = Number(raw);

        return Number.isFinite(parsed) ? parsed : INVALID;
      }
      case 'set': {
        if (raw === true) return INVALID;
        try {
          const parsed: unknown = JSON.parse(raw);

          return Array.isArray(parsed) ? parsed : INVALID;
        } catch {
          return INVALID;
        }
      }
      default: {
        return raw === true ? '' : raw;
      }
    }
  })();

  return value === INVALID || !isValidValue(descriptor, value)
    ? INVALID
    : value;
};

const encodeJsonValue = (value: unknown): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return JSON.stringify(value);

  try {
    JSON.parse(value);

    return JSON.stringify(value);
  } catch {
    return value;
  }
};

const encodeValue = (
  descriptor: PropertyDescriptor | undefined,
  value: unknown
): string | null | undefined => {
  if (descriptor?.kind === 'json') return encodeJsonValue(value);
  if (descriptor?.kind === 'set') {
    return value === undefined ? undefined : JSON.stringify(value);
  }
  if (value === undefined || value === null) return undefined;
  if (value === true) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return JSON.stringify(
      [...value].sort((a, b) => {
        const left = String(a);
        const right = String(b);
        return left < right ? -1 : left > right ? 1 : 0;
      })
    );
  }

  return JSON.stringify(value);
};

const describe = (
  state: EditorCoreStateView,
  type: string | null,
  key: string
): PropertyDescriptor | undefined => {
  if (!type) return undefined;

  return state.schema.property({ key, placement: 'element', type })?.value;
};

/** Raw attribute values; the tokenizer already decoded character references. */
export const readMarkdownTagAttributes = (
  tag: MarkdownTagElement
): MarkdownTagAttributes =>
  Object.fromEntries(
    tag.attributes.flatMap(
      (
        attribute: MdxJsxAttribute | MdxJsxExpressionAttribute
      ): Array<[string, string | true]> => {
        if (attribute.type !== 'mdxJsxAttribute') return [];
        const { name, value } = attribute;

        if (value === null || value === undefined) return [[name, true]];

        return [[name, typeof value === 'string' ? value : value.value]];
      }
    )
  );

/** One declaration's value from a tag's `style` attribute, such as `color`. */
export const readMarkdownStyleValue = (
  tag: MarkdownTagElement,
  property: string
): string | undefined => {
  const { style } = readMarkdownTagAttributes(tag);

  if (typeof style !== 'string') return undefined;
  for (const declaration of style.split(';')) {
    const separator = declaration.indexOf(':');

    if (
      separator !== -1 &&
      declaration.slice(0, separator).trim() === property
    ) {
      return declaration.slice(separator + 1).trim() || undefined;
    }
  }

  return undefined;
};

const isElidedDefault = (
  descriptor: PropertyDescriptor | undefined,
  value: unknown
) =>
  descriptor?.omitDefault === true &&
  JSON.stringify(descriptor.default) === JSON.stringify(value);

/**
 * Encode property values as tag attributes; defaults follow `omitDefault`.
 * `aliases` maps a property key to the attribute name it is written as.
 */
export const encodeMarkdownTagAttributes = (
  state: EditorCoreStateView,
  type: string | null,
  properties: Readonly<Record<string, unknown>>,
  aliases?: ReadonlyMap<string, string>
): MdxJsxAttribute[] =>
  Object.entries(properties).flatMap(([key, value]): MdxJsxAttribute[] => {
    const descriptor = describe(state, type, key);

    if (isElidedDefault(descriptor, value)) return [];
    const encoded = encodeValue(descriptor, value);

    return encoded === undefined
      ? []
      : [
          {
            name: aliases?.get(key) ?? key,
            type: 'mdxJsxAttribute',
            value: encoded,
          },
        ];
  });

/** An owned property and the attribute name it is written as. */
export type MarkdownOwnedAttribute = Readonly<{
  attribute: string;
  key: string;
}>;

const isNodeProperty = (
  state: EditorCoreStateView,
  type: string,
  key: string
) => {
  const property = state.schema.property({ key, placement: 'element', type });

  return !!property && property.role !== 'metadata';
};

/**
 * Decode a tag's properties: owned properties from their attribute names, and
 * other plugins' non-metadata properties of `type` from their keys. Malformed
 * values are reported through `omit` and left out.
 */
export const decodeMarkdownNodeProperties = (
  state: EditorCoreStateView,
  type: string,
  owned: readonly MarkdownOwnedAttribute[],
  attributes: MarkdownTagAttributes,
  omit: (attribute: string) => void
): Record<string, unknown> => {
  const properties: Record<string, unknown> = {};
  const ownedNames = new Set(
    owned.flatMap(({ attribute, key }) => [attribute, key])
  );
  const read = (attribute: string, key: string) => {
    const raw = attributes[attribute];
    const descriptor = describe(state, type, key);

    if (raw === undefined || !descriptor) return;
    const value = decodeValue(descriptor, raw);

    if (value === INVALID) omit(attribute);
    else properties[key] = value;
  };

  for (const { attribute, key } of owned) read(attribute, key);
  for (const attribute of Object.keys(attributes)) {
    if (!ownedNames.has(attribute) && isNodeProperty(state, type, attribute)) {
      read(attribute, attribute);
    }
  }

  return properties;
};

/**
 * Encode a node's properties as tag attributes: owned properties first under
 * their attribute names, then other plugins' non-metadata properties by key,
 * except `excluded` ones that the enclosing Markdown structure represents.
 * `represented` lists the keys the output carries, including defaults it
 * elides because `omitDefault` restores them.
 */
export const encodeMarkdownNodeAttributes = (
  state: EditorCoreStateView,
  type: string,
  owned: readonly MarkdownOwnedAttribute[],
  node: Readonly<Record<string, unknown>>,
  excluded: ReadonlySet<string>
): Readonly<{ attributes: MdxJsxAttribute[]; represented: string[] }> => {
  const attributes: MdxJsxAttribute[] = [];
  const represented: string[] = [];
  const ownedNames = new Set(
    owned.flatMap(({ attribute, key }) => [attribute, key])
  );
  const write = (attribute: string, key: string) => {
    const value = node[key];

    if (value === undefined || excluded.has(key)) return;
    const descriptor = describe(state, type, key);

    if (isElidedDefault(descriptor, value)) {
      represented.push(key);
      return;
    }
    const encoded = encodeValue(descriptor, value);

    if (encoded === undefined) return;
    attributes.push({
      name: attribute,
      type: 'mdxJsxAttribute',
      value: encoded,
    });
    represented.push(key);
  };

  for (const { attribute, key } of owned) write(attribute, key);
  for (const key of Object.keys(node).sort()) {
    if (
      key !== 'children' &&
      key !== 'type' &&
      !ownedNames.has(key) &&
      isNodeProperty(state, type, key)
    ) {
      write(key, key);
    }
  }

  return { attributes, represented };
};
