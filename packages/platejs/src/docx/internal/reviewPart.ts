import type { EditorDocumentRecords, Value } from '../../core';
import { readDocxNumbering } from './readDocxNumbering';

const WORD = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const MATH = 'http://schemas.openxmlformats.org/officeDocument/2006/math';
const RELATIONSHIPS =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

/** Root namespace of the custom XML data item that holds the part. */
export const REVIEW_PART_NAMESPACE = 'urn:platejs:docx:review:1';

export const isCustomXmlItem = (part: string) =>
  /^customXml\/item\d+\.xml$/.test(part);

/**
 * The stored top-level blocks that hold review marks, each bound to the
 * bookmark around its rendering, and the document's review records.
 */
export type ReviewPart = Readonly<{
  bindings: readonly ReviewPartBinding[];
  records?: EditorDocumentRecords;
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

const isRecords = (value: unknown): value is EditorDocumentRecords =>
  isRecord(value) &&
  Object.values(value).every(
    (set) => isRecord(set) && Object.values(set).every(isRecord)
  );

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
    (value.records !== undefined && !isRecords(value.records))
  ) {
    return null;
  }

  return Object.freeze({
    bindings: Object.freeze(value.bindings),
    ...(value.records === undefined ? {} : { records: value.records }),
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

const FINGERPRINTED_RUN_PROPERTIES = [
  'b',
  'caps',
  'color',
  'dstrike',
  'highlight',
  'i',
  'rStyle',
  'shd',
  'smallCaps',
  'strike',
  'sz',
  'u',
  'vertAlign',
];
const FINGERPRINTED_PARAGRAPH_PROPERTIES = ['ind', 'jc', 'pStyle'];
const TOGGLES = new Set(['b', 'caps', 'dstrike', 'i', 'smallCaps', 'strike']);
const OFF = new Set(['0', 'false', 'off']);
const UNSET = new Set(['auto', 'none']);

// Word writes `left` and `right` for what a newer schema calls `start` and
// `end`.
const INDENTS = [
  ['start', 'left'],
  ['end', 'right'],
  ['firstLine'],
  ['hanging'],
];

const valueOf = (element: Element, name: string) => {
  if (name === 'ind') {
    return INDENTS.flatMap(([side, ...aliases]) => {
      const value = [side, ...aliases]
        .map((attribute) => wordAttribute(element, attribute))
        .find((found) => found !== null);

      return value === undefined ? [] : [`${side}:${value}`];
    }).join(';');
  }

  return wordAttribute(element, name === 'shd' ? 'fill' : 'val');
};

const formatOf = (properties: Element | undefined, names: readonly string[]) =>
  names
    .flatMap((name) => {
      const element = childOf(properties, name);

      if (!element) return [];

      const value = valueOf(element, name)?.toLowerCase() ?? null;

      if (TOGGLES.has(name)) {
        return value !== null && OFF.has(value) ? [] : [name];
      }
      if (value !== null && UNSET.has(value)) return [];

      return [value === null ? name : `${name}=${value}`];
    })
    .join(',');

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

const fnv1a64Hex = (value: string | Uint8Array) => {
  let high = 0xcb_f2_9c_e4;
  let low = 0x84_22_23_25;

  for (let index = 0; index < value.length; index++) {
    low =
      (low ^
        (typeof value === 'string'
          ? value.charCodeAt(index)
          : value[index])) >>>
      0;

    const lowProduct = low * 0x01_b3;
    const carry = Math.floor(lowProduct / 0x1_00_00_00_00);

    high = (Math.imul(high, 0x01_b3) + Math.imul(low, 0x01_00) + carry) >>> 0;
    low = lowProduct >>> 0;
  }

  return `${high.toString(16).padStart(8, '0')}${low
    .toString(16)
    .padStart(8, '0')}`;
};

type RelationshipKey = (id: string) => string;

// happy-dom parses a prefixed attribute without its namespace.
const relationshipIdsOf = (element: Element) =>
  Array.from(element.attributes).flatMap((attribute) =>
    attribute.namespaceURI === RELATIONSHIPS || attribute.name.startsWith('r:')
      ? [attribute.value]
      : []
  );

const packagePathOf = (target: string) => {
  if (target.startsWith('/')) return target.slice(1);
  try {
    return decodeURIComponent(
      new URL(target, 'file:///word/').pathname.slice(1)
    );
  } catch {
    return undefined;
  }
};

const relationshipKeys = (
  relationships: Document | undefined,
  part: (path: string) => Uint8Array | undefined
): RelationshipKey => {
  const targets = new Map(
    Array.from(relationships?.getElementsByTagName('Relationship') ?? []).map(
      (relationship) =>
        [
          relationship.getAttribute('Id') ?? '',
          {
            external: relationship.getAttribute('TargetMode') === 'External',
            target: relationship.getAttribute('Target') ?? '',
          },
        ] as const
    )
  );
  const keys = new Map<string, string>();

  return (id) => {
    let key = keys.get(id);

    if (key === undefined) {
      const { external = true, target = '' } = targets.get(id) ?? {};
      const path = external ? undefined : packagePathOf(target);
      const bytes = path === undefined ? undefined : part(path);

      key = bytes ? fnv1a64Hex(bytes) : target;
      keys.set(id, key);
    }

    return key;
  };
};

type ReviewPackageKeys = Readonly<{
  listItem: (paragraph: Element) => string;
  relationship: RelationshipKey;
}>;

export const reviewPackageKeys = (
  document: Document,
  parts: Readonly<{
    numbering?: Document;
    relationships?: Document;
    styles?: Document;
  }>,
  part: (path: string) => Uint8Array | undefined
): ReviewPackageKeys => {
  const items = readDocxNumbering(document, parts);

  return {
    listItem: (paragraph) => {
      const item = items.get(paragraph);

      if (!item) return '';

      const { listId: _listId, ...list } = item;

      return JSON.stringify(list);
    },
    relationship: relationshipKeys(parts.relationships, part),
  };
};

const stackOf = (
  run: Element,
  stacks: Map<Element, string>,
  relationship: RelationshipKey
) => {
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
      } else if (isWord(ancestor, 'hyperlink')) {
        keys.unshift(
          `link ${relationshipIdsOf(ancestor).map(relationship).join(' ')}#${wordAttribute(ancestor, 'anchor') ?? ''}`
        );
      }
    }
    const properties = childOf(run, 'rPr');
    const change = childOf(properties, 'rPrChange');

    if (change) keys.push(revisionKey(change));
    keys.push(formatOf(properties, FINGERPRINTED_RUN_PROPERTIES));
    stack = keys.join('/');
    stacks.set(run, stack);
  }

  return stack;
};

const objectKeysOf = (element: Element, relationship: RelationshipKey) =>
  [element, ...Array.from(element.getElementsByTagName('*'))]
    .flatMap((part) => [
      ...relationshipIdsOf(part).map(relationship),
      ...(part.localName === 'docPr'
        ? [part.getAttribute('descr') ?? '', part.getAttribute('title') ?? '']
        : []),
    ])
    .join(' ');

const fingerprintOf = (
  blocks: readonly Element[],
  { listItem, relationship }: ReviewPackageKeys
) => {
  const tokens: string[] = [];
  const stacks = new Map<Element, string>();
  let last: string | null = null;
  const text = (element: Element, value: string) => {
    const stack = stackOf(runOf(element), stacks, relationship);

    if (stack === last) {
      tokens[tokens.length - 1] += value;
    } else {
      tokens.push(stack, value);
      last = stack;
    }
  };
  const boundary = (token: string) => {
    tokens.push(token);
    last = null;
  };

  for (const block of blocks) {
    for (const element of [
      block,
      ...Array.from(block.getElementsByTagName('*')),
    ]) {
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
        text(element, `\uFFFC${objectKeysOf(element, relationship)}`);
      } else if (isWord(element, 'p')) {
        boundary(
          `p ${paragraphMark(element)} ${formatOf(childOf(element, 'pPr'), FINGERPRINTED_PARAGRAPH_PROPERTIES)} ${listItem(element)}`
        );
      } else if (isWord(element, 'tbl', 'tc', 'tr')) {
        boundary(element.localName);
      }
    }
  }

  return fnv1a64Hex(JSON.stringify(tokens));
};

export type ReviewBindingBookmark = { end?: Element; start: Element };

/** The first bookmark of each name in `names`, with its end once found. */
export const reviewBindingBookmarks = (
  document: Document,
  names: ReadonlySet<string>
) => {
  const bookmarks = new Map<string, ReviewBindingBookmark>();
  const nameById = new Map<string, string>();

  for (const element of Array.from(document.getElementsByTagName('*'))) {
    const id = wordAttribute(element, 'id') ?? '';

    if (isWord(element, 'bookmarkStart')) {
      const name = wordAttribute(element, 'name') ?? '';

      if (names.has(name) && !bookmarks.has(name)) {
        bookmarks.set(name, { start: element });
        nameById.set(id, name);
      }
    } else if (isWord(element, 'bookmarkEnd')) {
      const bookmark = bookmarks.get(nameById.get(id) ?? '');

      if (bookmark && !bookmark.end) bookmark.end = element;
    }
  }

  return bookmarks;
};

/**
 * Hash every top-level block each bookmark touches, leaving out what Word
 * renumbers or adds when it saves: ids, run boundaries, proofing marks,
 * bookmarks, comment anchors and run properties such as fonts, languages and
 * complex-script copies. Word also renames media parts, so a relationship
 * counts by its external address or by the bytes of the part it names.
 */
export const reviewBindingFingerprints = (
  bookmarks: ReadonlyMap<string, ReviewBindingBookmark>,
  keys: ReviewPackageKeys
) => {
  const topLevelBlockOf = (element: Element) => {
    let block = element;

    while (block.parentElement && !isWord(block.parentElement, 'body')) {
      block = block.parentElement;
    }

    return block;
  };
  const fingerprints = new Map<string, string>();

  for (const [name, { end, start }] of bookmarks) {
    if (!end) continue;

    const last = topLevelBlockOf(end);
    const blocks: Element[] = [];

    for (
      let block: Element | null = topLevelBlockOf(start);
      block;
      block = block.nextElementSibling
    ) {
      blocks.push(block);
      if (block === last) break;
    }
    if (blocks.at(-1) !== last) continue;
    fingerprints.set(name, fingerprintOf(blocks, keys));
  }

  return fingerprints;
};
