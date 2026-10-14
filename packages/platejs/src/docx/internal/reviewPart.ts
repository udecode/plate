import { hashSchemaIdentityString } from 'plitejs/internal';

import type { Value } from '../../core';

const WORD = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const MATH = 'http://schemas.openxmlformats.org/officeDocument/2006/math';

/** Root namespace of the custom XML data item that holds the part. */
export const REVIEW_PART_NAMESPACE = 'urn:platejs:docx:review:1';

export const isCustomXmlItem = (part: string) =>
  /^customXml\/item\d+\.xml$/.test(part);

/**
 * The stored top-level blocks that hold review marks, each bound to the
 * bookmark around its rendering, and the document's metadata roots.
 */
export type ReviewPart = Readonly<{
  bindings: readonly ReviewPartBinding[];
  roots: Readonly<Record<string, Value>>;
  version: 1;
}>;

export type ReviewPartBinding = Readonly<{
  fingerprint: string;
  name: string;
  nodes: Value;
}>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isElementList = (value: unknown): value is Value =>
  Array.isArray(value) &&
  value.every((node) => isRecord(node) && Array.isArray(node.children));

const isRoots = (value: unknown): value is ReviewPart['roots'] =>
  isRecord(value) && Object.values(value).every(isElementList);

const isBinding = (value: unknown): value is ReviewPartBinding =>
  isRecord(value) &&
  typeof value.name === 'string' &&
  typeof value.fingerprint === 'string' &&
  isElementList(value.nodes) &&
  value.nodes.length > 0;

export const parseReviewPart = (source: string): ReviewPart | null => {
  let value: unknown;

  try {
    value = JSON.parse(source);
  } catch {
    return null;
  }
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Array.isArray(value.bindings) ||
    !value.bindings.every(isBinding) ||
    new Set(value.bindings.map(({ name }) => name)).size !==
      value.bindings.length ||
    !isRoots(value.roots)
  ) {
    return null;
  }

  return Object.freeze({
    bindings: Object.freeze(value.bindings),
    roots: value.roots,
    version: 1,
  });
};

/** A WordprocessingML attribute, read the way every DOM in use parses it. */
export const wordAttribute = (element: Element, name: string) =>
  element.getAttributeNS(WORD, name) ??
  element.getAttribute(`w:${name}`) ??
  element.getAttribute(name);

const isWord = (element: Element, ...names: string[]) =>
  element.namespaceURI === WORD && names.includes(element.localName);

// Word drops the milliseconds of a revision date when it saves.
const revisionKey = (element: Element) => {
  const time = Date.parse(wordAttribute(element, 'date') ?? '');
  const date = Number.isFinite(time)
    ? new Date(Math.floor(time / 1000) * 1000).toISOString()
    : '';

  return `${element.localName} ${wordAttribute(element, 'author') ?? ''} ${date}`;
};

const CONTENT_REVISIONS = ['del', 'ins', 'moveFrom', 'moveTo'];

const childOf = (element: Element | null | undefined, name: string) =>
  element
    ? Array.from(element.children).find((child) => isWord(child, name))
    : undefined;

const paragraphMark = (paragraph: Element) => {
  const properties = childOf(paragraph, 'pPr');
  const marks = Array.from(childOf(properties, 'rPr')?.children ?? []).filter(
    (child) => isWord(child, ...CONTENT_REVISIONS)
  );
  const change = childOf(properties, 'pPrChange');

  return [...marks, ...(change ? [change] : [])].map(revisionKey).join('/');
};

const runOf = (element: Element) => {
  for (
    let ancestor: Element | null = element;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    if (isWord(ancestor, 'r')) return ancestor;
  }

  return element;
};

type OpenBinding = { last: string | null; name: string; tokens: string[] };

/**
 * Hash what each named bookmark covers, leaving out what Word renumbers or adds
 * when it saves: ids, run boundaries, proofing marks, other bookmarks and
 * comment anchors. A name whose bookmark or end is missing has no entry.
 */
export const reviewBindingFingerprints = (
  document: Document,
  names: ReadonlySet<string>
) => {
  const fingerprints = new Map<string, string>();
  const open = new Map<string, OpenBinding>();
  const stacks = new Map<Element, string>();
  const stackOf = (element: Element) => {
    const run = runOf(element);
    let stack = stacks.get(run);

    if (stack === undefined) {
      const keys: string[] = [];

      for (
        let ancestor = run.parentElement;
        ancestor;
        ancestor = ancestor.parentElement
      ) {
        if (isWord(ancestor, ...CONTENT_REVISIONS)) {
          keys.unshift(revisionKey(ancestor));
        }
      }
      const change = childOf(childOf(run, 'rPr'), 'rPrChange');

      if (change) keys.push(revisionKey(change));
      stack = keys.join('/');
      stacks.set(run, stack);
    }

    return stack;
  };
  const text = (element: Element, value: string) => {
    const stack = stackOf(element);

    for (const range of open.values()) {
      if (stack === range.last) {
        range.tokens[range.tokens.length - 1] += value;
      } else {
        range.tokens.push(stack, value);
        range.last = stack;
      }
    }
  };
  const boundary = (token: string) => {
    for (const range of open.values()) {
      range.tokens.push(token);
      range.last = null;
    }
  };

  for (const element of Array.from(document.getElementsByTagName('*'))) {
    if (isWord(element, 'bookmarkStart')) {
      const name = wordAttribute(element, 'name');
      const id = wordAttribute(element, 'id');

      if (name && id && names.has(name) && !fingerprints.has(name)) {
        open.set(id, { last: null, name, tokens: [] });
      }
      continue;
    }
    if (isWord(element, 'bookmarkEnd')) {
      const range = open.get(wordAttribute(element, 'id') ?? '');

      if (range) {
        open.delete(wordAttribute(element, 'id') ?? '');
        fingerprints.set(
          range.name,
          hashSchemaIdentityString(JSON.stringify(range.tokens))
        );
      }
      continue;
    }
    if (open.size === 0) continue;
    const inRun = element.parentElement
      ? isWord(element.parentElement, 'r')
      : false;

    if (element.namespaceURI === MATH && element.localName === 't') {
      text(element, element.textContent ?? '');
    } else if (isWord(element, 't', 'delText')) {
      text(element, element.textContent ?? '');
    } else if (inRun && isWord(element, 'tab')) {
      text(element, '\t');
    } else if (inRun && isWord(element, 'br', 'cr')) {
      text(element, '\n');
    } else if (inRun && isWord(element, 'drawing', 'object', 'pict')) {
      text(element, '\uFFFC');
    } else if (isWord(element, 'p')) {
      boundary(`p ${paragraphMark(element)}`);
    } else if (isWord(element, 'tbl', 'tc', 'tr')) {
      boundary(element.localName);
    }
  }

  return fingerprints;
};
