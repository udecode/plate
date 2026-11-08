import isEqual from 'lodash/isEqual.js';

import type { HtmlMatcher } from '../../plugin';

const HTML_MATCHER_FIELDS = new Set([
  'attributes',
  'className',
  'style',
  'tag',
]);
export const HTML_ATTRIBUTE_RE = /^[a-z_:][a-z0-9_.:-]*$/;
const HTML_CLASS_WHITESPACE_RE = /\s/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const normalizeStyleName = (name: string) =>
  name.startsWith('--')
    ? name
    : name.replaceAll(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

const normalizeMatchValues = (
  value: unknown,
  label: string,
  normalize: (item: string) => string = (item) => item
): readonly string[] => {
  const values = typeof value === 'string' ? [value] : value;

  if (
    !Array.isArray(values) ||
    values.length === 0 ||
    values.some((item) => typeof item !== 'string' || item.length === 0)
  ) {
    throw new Error(`${label} must be a non-empty string or string array.`);
  }

  return Object.freeze([...new Set(values.map(normalize))]);
};

/** @internal */
export const compileMatcher = (
  owner: string,
  matcher: unknown,
  index: number
): HtmlMatcher => {
  const label = `Plate HTML mapping "${owner}" matcher ${index}`;

  if (!isRecord(matcher)) throw new Error(`${label} must be an object.`);
  const fields = Object.keys(matcher);

  if (fields.length === 0) {
    throw new Error(`${label} must define at least one matcher field.`);
  }
  fields.forEach((field) => {
    if (!HTML_MATCHER_FIELDS.has(field)) {
      throw new Error(`${label} has unknown field "${field}".`);
    }
  });

  const compiled: {
    attributes?: Readonly<Record<string, true | readonly string[]>>;
    className?: string;
    style?: Readonly<Record<string, '*' | readonly string[]>>;
    tag?: readonly string[];
  } = {};

  if (matcher.tag !== undefined) {
    compiled.tag = normalizeMatchValues(matcher.tag, `${label} tag`, (item) =>
      item.toLowerCase()
    );
  }
  if (matcher.className !== undefined) {
    if (
      typeof matcher.className !== 'string' ||
      matcher.className.length === 0 ||
      HTML_CLASS_WHITESPACE_RE.test(matcher.className)
    ) {
      throw new Error(`${label} className must be one non-empty class token.`);
    }
    compiled.className = matcher.className;
  }
  if (matcher.attributes !== undefined) {
    if (!isRecord(matcher.attributes)) {
      throw new Error(`${label} attributes must be an object.`);
    }
    const attributes = new Map<string, true | readonly string[]>();

    if (Object.keys(matcher.attributes).length === 0) {
      throw new Error(`${label} attributes cannot be empty.`);
    }
    Object.entries(matcher.attributes).forEach(([rawName, value]) => {
      const name = rawName.toLowerCase();

      if (!HTML_ATTRIBUTE_RE.test(name)) {
        throw new Error(`${label} has invalid attribute "${rawName}".`);
      }
      const normalized =
        value === true
          ? true
          : normalizeMatchValues(value, `${label} attribute "${name}"`);
      const existing = attributes.get(name);

      if (existing !== undefined && !isEqual(existing, normalized)) {
        throw new Error(`${label} has conflicting attribute "${name}".`);
      }
      attributes.set(name, normalized);
    });
    compiled.attributes = Object.freeze(Object.fromEntries(attributes));
  }
  if (matcher.style !== undefined) {
    if (!isRecord(matcher.style)) {
      throw new Error(`${label} style must be an object.`);
    }
    const styles = new Map<string, '*' | readonly string[]>();

    if (Object.keys(matcher.style).length === 0) {
      throw new Error(`${label} style cannot be empty.`);
    }
    Object.entries(matcher.style).forEach(([rawName, value]) => {
      if (!rawName) throw new Error(`${label} has an empty style key.`);
      const name = normalizeStyleName(rawName);
      const normalized =
        value === '*'
          ? '*'
          : normalizeMatchValues(value, `${label} style "${name}"`);
      const existing = styles.get(name);

      if (existing !== undefined && !isEqual(existing, normalized)) {
        throw new Error(`${label} has conflicting style key "${name}".`);
      }
      styles.set(name, normalized);
    });
    compiled.style = Object.freeze(Object.fromEntries(styles));
  }
  if (Object.keys(compiled).length === 0) {
    throw new Error(`${label} must define at least one active matcher field.`);
  }

  return Object.freeze(compiled) as HtmlMatcher;
};

const matchValue = (actual: string, expected: unknown) =>
  Array.isArray(expected) && expected.includes(actual);

const getStyleValue = (element: ElementCSSInlineStyle, key: string) => {
  const value =
    element.style.getPropertyValue(key) ||
    Reflect.get(element.style, key) ||
    '';

  return String(value).trim();
};

/** @internal */
export const matches = (
  element: Element & ElementCSSInlineStyle,
  matcher: HtmlMatcher
) => {
  if (matcher.tag && !matchValue(element.tagName.toLowerCase(), matcher.tag)) {
    return false;
  }
  if (matcher.className && !element.classList.contains(matcher.className)) {
    return false;
  }
  if (
    matcher.attributes &&
    !Object.entries(matcher.attributes).every(([name, expected]) => {
      if (expected === true) return element.hasAttribute(name);
      const actual = element.getAttribute(name);

      return actual !== null && matchValue(actual, expected);
    })
  ) {
    return false;
  }
  if (
    matcher.style &&
    !Object.entries(matcher.style).every(([name, expected]) => {
      const actual = getStyleValue(element, name);

      return expected === '*'
        ? actual.length > 0
        : matchValue(actual, expected);
    })
  ) {
    return false;
  }

  return true;
};
