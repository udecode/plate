import { type Diff, DiffMatchPatch, DiffOp } from 'diff-match-patch-ts';
import * as Y from 'yjs';

import type { NodeList } from '../../core/change/document-index';
import { countCoreWork } from '../../core/work';
import {
  NodeApi,
  type Descendant,
  type Element,
  type Point,
  type Text,
} from '../../index';
import { getDefined } from '../../internal/get-defined';
import {
  getYjsAttributes,
  setYjsAttribute,
  type YjsAttributeRecord,
  type YjsNode,
} from './attributes';
import {
  assertPublicYjsAttributeCanBeSet,
  assignFreshYjsNodeId,
  createYjsPropertyContext,
  getYjsVisibleChildren,
  getYjsVisiblePath,
  insertYjsChild,
  type YjsPropertyLocation,
  type YjsSetPropertyResolver,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import {
  isReservedYjsKey,
  isYjsMarkRecordKey,
  YJS_MARK_KEY_PREFIX,
} from './keys';
import {
  encodeYjsSetValueAttributes,
  isYjsSetValueAttribute,
  readYjsSetValueAttributes,
} from './set-valued-attributes';

export type YjsTextChain = readonly [Y.XmlText, ...Y.XmlText[]];
export type YjsSegment =
  | Readonly<{ kind: 'text'; chain: YjsTextChain; from: number }>
  | Readonly<{ kind: 'element'; node: Y.XmlElement; from: number }>;
export type PliteSegment =
  | Readonly<{ kind: 'text'; leaves: readonly Text[]; from: number }>
  | Readonly<{ kind: 'element'; node: Element; from: number }>;
export type YjsRunEncoder = (
  leaf: Text,
  childIndex: number
) => YjsAttributeRecord;

export const segmentYjsChildren = (
  children: readonly YjsNode[]
): YjsSegment[] => {
  const segments: YjsSegment[] = [];
  for (let index = 0; index < children.length;) {
    const child = children[index];
    if (child instanceof Y.XmlText) {
      const chain: [Y.XmlText, ...Y.XmlText[]] = [child];
      const from = index;
      index += 1;
      while (children[index] instanceof Y.XmlText) {
        chain.push(children[index] as Y.XmlText);
        index += 1;
      }
      segments.push({ kind: 'text', chain, from });
    } else {
      segments.push({ kind: 'element', node: child, from: index });
      index += 1;
    }
  }
  return segments;
};

export const segmentPliteChildren = (
  children: readonly Descendant[]
): PliteSegment[] => {
  const segments: PliteSegment[] = [];
  for (let index = 0; index < children.length;) {
    const child = children[index];
    if (NodeApi.isText(child)) {
      const leaves: Text[] = [child];
      const from = index;
      index += 1;
      while (NodeApi.isText(children[index])) {
        leaves.push(children[index] as Text);
        index += 1;
      }
      segments.push({ kind: 'text', leaves, from });
    } else {
      segments.push({ kind: 'element', node: child, from: index });
      index += 1;
    }
  }
  return segments;
};

export const createYjsRunEncoder =
  (
    isSetValued: YjsSetPropertyResolver,
    location: YjsPropertyLocation
  ): YjsRunEncoder =>
  (leaf, childIndex) => {
    const result: YjsAttributeRecord = {};
    const context = createYjsPropertyContext(leaf, {
      ...location,
      path: [...location.path, (location.offset ?? 0) + childIndex],
    });
    for (const [key, value] of Object.entries(leaf)) {
      if (key === 'text' || value === undefined) continue;
      assertPublicYjsAttributeCanBeSet(key);
      if (isSetValued(leaf, key, context)) {
        if (!Array.isArray(value)) {
          throw new Error(`Set-valued Yjs property "${key}" must be an array.`);
        }
        for (const [member, item] of Object.entries(
          encodeYjsSetValueAttributes(key, value)
        )) {
          result[member] = [item];
        }
      } else result[key] = [value];
    }
    return result;
  };

export const decodeRunAttributes = (
  attributes: Readonly<YjsAttributeRecord>
): YjsAttributeRecord => {
  const properties: YjsAttributeRecord = {};
  const members: YjsAttributeRecord = {};
  for (const [key, boxed] of Object.entries(attributes)) {
    if (!Array.isArray(boxed) || boxed.length !== 1) continue;
    if (isYjsSetValueAttribute(key)) members[key] = boxed[0];
    else if (!isReservedYjsKey(key) && key !== 'text' && key !== 'children') {
      properties[key] = boxed[0];
    }
  }
  return Object.assign(properties, readYjsSetValueAttributes(members));
};

type LetterId = readonly [client: number, clock: number];
type MarkRecord = Readonly<{
  k: string;
  v: readonly [unknown] | null;
  s: LetterId;
  e: LetterId | null;
  l: number;
  seen: Readonly<Record<string, number>>;
}>;
type Mark = Readonly<{
  name: string;
  client: number;
  clock: number;
  record: MarkRecord;
}>;
type Letter = {
  id: LetterId;
  char: string;
  live: boolean;
  slot: number;
  marks: Map<string, Mark>;
  attributes: YjsAttributeRecord;
};
type MarkIndex = {
  byId: Map<string, Letter>;
  items: WeakMap<Y.Item, readonly Letter[]>;
  order: Letter[];
  live: Letter[];
  records: Map<string, Mark>;
  pending: Map<string, Mark>;
  maxPriority: number;
};

const markIndexes = new WeakMap<Y.XmlText, MarkIndex>();
const pendingRuns = new WeakMap<Y.XmlText, readonly Text[]>();
const pendingAttributes = new WeakMap<
  Y.XmlText,
  readonly YjsAttributeRecord[]
>();
const letterKey = (id: LetterId) => `${id[0]}.${id[1]}`;

const isLetterId = (value: unknown): value is LetterId =>
  Array.isArray(value) &&
  value.length === 2 &&
  value.every((part) => Number.isSafeInteger(part) && part >= 0);

const parseMark = (name: string, value: unknown): Mark => {
  countCoreWork('yjsMarkRecordsVisited');
  const match = /^yjs:mark:(\d+)\.(\d+)$/.exec(name);
  if (
    !match ||
    !value ||
    typeof value !== 'object' ||
    !('k' in value) ||
    typeof value.k !== 'string' ||
    !('v' in value) ||
    !(value.v === null || (Array.isArray(value.v) && value.v.length === 1)) ||
    !('s' in value) ||
    !isLetterId(value.s) ||
    !('e' in value) ||
    !(value.e === null || isLetterId(value.e)) ||
    !('l' in value) ||
    typeof value.l !== 'number' ||
    !Number.isSafeInteger(value.l) ||
    value.l < 1 ||
    !('seen' in value) ||
    !value.seen ||
    typeof value.seen !== 'object' ||
    Object.entries(value.seen).some(
      ([client, clock]) =>
        !/^\d+$/.test(client) || !Number.isSafeInteger(clock) || clock < 0
    )
  ) {
    throw new Error(`Invalid Yjs mark record "${name}".`);
  }
  return {
    name,
    client: Number(match[1]),
    clock: Number(match[2]),
    record: value as MarkRecord,
  };
};

const higherMark = (left: Mark, right: Mark) =>
  left.record.l > right.record.l ||
  (left.record.l === right.record.l && left.client > right.client);

const resolveLetterKey = (letter: Letter, key: string) => {
  const covering = [...letter.marks.values()].filter((mark) => {
    countCoreWork('yjsMarkRecordsVisited');
    return mark.record.k === key;
  });
  const known = covering.filter(
    (mark) => letter.id[1] < (mark.record.seen[letter.id[0]] ?? 0)
  );
  const candidates = known.length > 0 ? known : covering;
  const frontier = candidates.filter(
    (mark) =>
      !candidates.some(
        (other) =>
          other !== mark && mark.clock < (other.record.seen[mark.client] ?? 0)
      )
  );
  const own =
    known.length === 0
      ? frontier.filter((mark) => mark.client === letter.id[0])
      : [];
  let winner: Mark | undefined;
  for (const mark of own.length > 0 ? own : frontier) {
    if (!winner || higherMark(mark, winner)) winner = mark;
  }
  if (winner?.record.v != null) letter.attributes[key] = winner.record.v;
  else delete letter.attributes[key];
};

const markSpan = (index: MarkIndex, record: MarkRecord) => {
  countCoreWork('yjsMarkRecordsVisited');
  const start = index.byId.get(letterKey(record.s));
  const end = record.e && index.byId.get(letterKey(record.e));
  if (!start || (record.e && !end)) return null;
  return { from: start.slot, to: end ? end.slot : index.order.length };
};

const addMark = (index: MarkIndex, mark: Mark) => {
  index.records.set(mark.name, mark);
  index.maxPriority = Math.max(index.maxPriority, mark.record.l);
  const span = markSpan(index, mark.record);
  if (!span) {
    index.pending.set(mark.name, mark);
    return;
  }
  index.pending.delete(mark.name);
  for (let slot = span.from; slot < span.to; slot++) {
    const letter = index.order[slot];
    let superseded = false;
    // A causal successor marked every letter its predecessor marked, so a
    // superseded record can leave this letter for good: only the frontier can
    // win here or on letters later inserted next to it.
    for (const candidate of letter.marks.values()) {
      countCoreWork('yjsMarkRecordsVisited');
      if (candidate.record.k !== mark.record.k) continue;
      if (mark.clock < (candidate.record.seen[mark.client] ?? 0)) {
        superseded = true;
        break;
      }
      if (candidate.clock < (mark.record.seen[candidate.client] ?? 0)) {
        letter.marks.delete(candidate.name);
      }
    }
    if (superseded) continue;
    letter.marks.set(mark.name, mark);
    resolveLetterKey(letter, mark.record.k);
  }
};

const removeMark = (index: MarkIndex, mark: Mark) => {
  index.records.delete(mark.name);
  index.pending.delete(mark.name);
  const span = markSpan(index, mark.record);
  if (!span) return;
  for (let slot = span.from; slot < span.to; slot++) {
    const letter = index.order[slot];
    if (!letter.marks.delete(mark.name)) continue;
    resolveLetterKey(letter, mark.record.k);
  }
};

const refreshLetters = (text: Y.XmlText, index: MarkIndex) => {
  const order: Letter[] = [];
  const live: Letter[] = [];
  for (let item = text._start; item; item = item.right) {
    if (item.content instanceof Y.ContentFormat) {
      if (!item.deleted) {
        throw new Error(
          'Yjs text formatting is not supported; use mark records.'
        );
      }
      continue;
    }
    // An item keeps its letters until Yjs splits or merges it, so a keystroke
    // only looks up the letters of the items it changed.
    let letters = index.items.get(item);
    if (letters?.length !== item.length) {
      const rebuilt: Letter[] = [];
      for (let offset = 0; offset < item.length; offset++) {
        const id: LetterId = [item.id.client, item.id.clock + offset];
        const key = letterKey(id);
        let letter = index.byId.get(key);
        if (!letter) {
          const inherited = order.at(-1)?.marks;
          countCoreWork('yjsMarkRecordsVisited', inherited?.size ?? 0);
          letter = {
            id,
            char: '',
            live: false,
            slot: -1,
            marks: new Map(inherited),
            attributes: {},
          };
          for (const mark of letter.marks.values()) {
            countCoreWork('yjsMarkRecordsVisited');
            resolveLetterKey(letter, mark.record.k);
          }
          index.byId.set(key, letter);
        }
        letter.char =
          item.content instanceof Y.ContentString
            ? item.content.str[offset]
            : '';
        rebuilt.push(letter);
      }
      letters = rebuilt;
      index.items.set(item, letters);
    }
    const isLive = !item.deleted;
    for (const letter of letters) {
      letter.live = isLive;
      letter.slot = order.length;
      order.push(letter);
      if (isLive) live.push(letter);
    }
  }
  index.order = order;
  index.live = live;
  for (const mark of index.pending.values()) addMark(index, mark);
};

const markIndexOf = (text: Y.XmlText): MarkIndex => {
  const held = markIndexes.get(text);
  if (held) return held;
  const index: MarkIndex = {
    byId: new Map(),
    items: new WeakMap(),
    order: [],
    live: [],
    records: new Map(),
    pending: new Map(),
    maxPriority: 0,
  };
  markIndexes.set(text, index);
  refreshLetters(text, index);
  for (const [name, value] of Object.entries(getYjsAttributes(text))) {
    if (isYjsMarkRecordKey(name)) addMark(index, parseMark(name, value));
  }
  text.observe((event) => {
    if (event.delta.length > 0) refreshLetters(text, index);
    for (const name of event.keysChanged) {
      if (!isYjsMarkRecordKey(name)) continue;
      const old = index.records.get(name);
      const value: unknown = text.getAttribute(name);
      if (old && value === old.record) continue;
      if (old) removeMark(index, old);
      if (value !== undefined) addMark(index, parseMark(name, value));
    }
  });
  return index;
};

const writeMarkRecord = (
  text: Y.XmlText,
  from: number,
  length: number,
  k: string,
  v: unknown
) => {
  const index = markIndexOf(text);
  const { doc } = text;
  if (!doc) throw new Error('Mark records require an integrated Yjs text.');
  const start = index.live[from];
  if (!start || length === 0) return;
  const end = index.live[from + length];
  const record: MarkRecord = {
    k,
    v: v === null ? null : [Array.isArray(v) ? v[0] : v],
    s: start.id,
    e: end?.id ?? null,
    l: index.maxPriority + 1,
    seen: Object.fromEntries(Y.decodeStateVector(Y.encodeStateVector(doc))),
  };
  const client = doc.clientID;
  const clock = record.seen[client] ?? 0;
  const name = `${YJS_MARK_KEY_PREFIX}${client}.${clock}`;
  const span = getDefined(markSpan(index, record));
  const covered = new Map<string, Mark>();
  for (let slot = span.from; slot < span.to; slot++) {
    for (const mark of index.order[slot].marks.values()) {
      countCoreWork('yjsMarkRecordsVisited');
      if (mark.record.k === k) covered.set(mark.name, mark);
    }
  }
  setYjsAttribute(text, name, record);
  addMark(index, { name, client, clock, record });
  for (const mark of covered.values()) {
    countCoreWork('yjsMarkRecordsVisited');
    const previous = markSpan(index, mark.record);
    if (
      previous &&
      previous.from >= span.from &&
      previous.to <= span.to &&
      mark.clock < (record.seen[mark.client] ?? 0) &&
      Object.entries(mark.record.seen).every(
        ([author, seen]) => seen <= (record.seen[author] ?? 0)
      )
    ) {
      text.removeAttribute(mark.name);
      removeMark(index, mark);
    }
  }
};

const readEncodedRuns = (text: Y.XmlText) => {
  const pending = pendingRuns.get(text);
  const encoded = pendingAttributes.get(text);
  if (pending && encoded) {
    return pending.map((leaf, index) => ({
      text: leaf.text,
      attributes: encoded[index],
    }));
  }
  if (text.length === 0) {
    return [{ text: '', attributes: getYjsAttributes(text) }];
  }
  const runs: Array<{ text: string; attributes: YjsAttributeRecord }> = [];
  for (const letter of markIndexOf(text).live) {
    const previous = runs.at(-1);
    if (
      previous &&
      areJsonLikeValuesEqual(previous.attributes, letter.attributes)
    ) {
      previous.text += letter.char;
    } else {
      runs.push({ text: letter.char, attributes: { ...letter.attributes } });
    }
  }
  return runs;
};

export const readTextRuns = (chain: YjsTextChain): Text[] => {
  for (const text of chain) {
    if (!text._hasFormatting) continue;
    for (const part of text.toDelta()) {
      if (Object.keys(part.attributes ?? {}).length > 0) {
        throw new Error(
          'Yjs text formatting is not supported; use mark records.'
        );
      }
    }
  }
  const pending = chain.length === 1 && pendingRuns.get(chain[0]);
  if (pending) return pending.map((leaf) => ({ ...leaf }));
  if (chain.every((text) => text.length === 0)) {
    return [{ ...decodeRunAttributes(getYjsAttributes(chain[0])), text: '' }];
  }
  const leaves: Text[] = [];
  for (const text of chain) {
    if (text.length === 0) continue;
    for (const run of readEncodedRuns(text)) {
      const properties = decodeRunAttributes(run.attributes);
      const previous = leaves.at(-1);
      if (previous) {
        const { text: previousText, ...previousProperties } = previous;
        if (areJsonLikeValuesEqual(properties, previousProperties)) {
          leaves[leaves.length - 1] = {
            ...properties,
            text: previousText + run.text,
          };
          continue;
        }
      }
      leaves.push({ ...properties, text: run.text });
    }
  }
  return leaves.length > 0 ? leaves : [{ text: '' }];
};

const writeEmptyAttributes = (
  text: Y.XmlText,
  attributes: YjsAttributeRecord
) => {
  for (const key of Object.keys(getYjsAttributes(text))) {
    if (
      (!isReservedYjsKey(key) || isYjsSetValueAttribute(key)) &&
      !Object.hasOwn(attributes, key)
    ) {
      text.removeAttribute(key);
    }
  }
  for (const [key, value] of Object.entries(attributes)) {
    if (!areJsonLikeValuesEqual(getYjsAttributes(text)[key], value)) {
      setYjsAttribute(text, key, value);
    }
  }
};

export const createYjsTextChain = (
  leaves: readonly Text[],
  encode: YjsRunEncoder
): Y.XmlText => {
  const encoded = leaves.map((leaf, index) => encode(leaf, index));
  const text = new Y.XmlText();
  assignFreshYjsNodeId(text);
  const plain = leaves.map((leaf) => leaf.text).join('');
  if (plain.length === 0) {
    writeEmptyAttributes(text, encoded[0] ?? {});
  } else {
    text.insert(0, plain);
    pendingRuns.set(text, leaves);
    pendingAttributes.set(text, encoded);
    text._pending?.push(() => {
      pendingRuns.delete(text);
      pendingAttributes.delete(text);
      const plainLeaf = { text: plain };
      writeTextRuns([text], [plainLeaf], leaves, (leaf, index) =>
        leaf === plainLeaf ? {} : encoded[index]
      );
    });
  }
  return text;
};

export const cloneYjsText = (
  source: Y.XmlText,
  attributes: YjsAttributeRecord
): Y.XmlText => {
  const runs = readEncodedRuns(source);
  const clone = createYjsTextChain(
    runs.map((run) => ({
      ...decodeRunAttributes(run.attributes),
      text: run.text,
    })),
    (_leaf, index) => runs[index].attributes
  );
  for (const [key, value] of Object.entries(attributes)) {
    setYjsAttribute(clone, key, value);
  }
  return clone;
};

export const locateChainOffset = (
  chain: YjsTextChain,
  offset: number,
  bias: 'left' | 'right' = 'left'
) => {
  let remaining = Math.max(0, offset);
  for (let i = 0; i < chain.length; i++) {
    const text = chain[i];
    if (
      remaining < text.length ||
      (remaining === text.length && bias === 'left' && text.length > 0) ||
      i === chain.length - 1
    ) {
      return { index: Math.min(remaining, text.length), segment: i, text };
    }
    remaining -= text.length;
  }
  return { index: 0, segment: 0, text: chain[0] };
};

export const chainOffsetOf = (
  chain: YjsTextChain,
  text: Y.XmlText,
  index: number
): number => {
  let offset = 0;
  for (const part of chain) {
    if (part === text) {
      return offset + Math.max(0, Math.min(index, text.length));
    }
    offset += part.length;
  }
  throw new Error('Text does not belong to the chain.');
};

const textDiff = new DiffMatchPatch();
textDiff.Diff_Timeout = 0;

const diffText = (before: string, after: string): Diff[] => {
  let prefix = 0;
  const limit = Math.min(before.length, after.length);
  while (prefix < limit && before[prefix] === after[prefix]) prefix += 1;
  let suffix = 0;
  while (
    suffix < limit - prefix &&
    before.at(-1 - suffix) === after.at(-1 - suffix)
  ) {
    suffix += 1;
  }
  const left = before.slice(prefix, before.length - suffix);
  const right = after.slice(prefix, after.length - suffix);
  const reverse = left > right;
  const middle: Diff[] =
    left.length === 0
      ? [[DiffOp.Insert, right]]
      : right.length === 0
        ? [[DiffOp.Delete, left]]
        : left.length > 1_000_000 / right.length
          ? [
              [DiffOp.Delete, left],
              [DiffOp.Insert, right],
            ]
          : textDiff
              .diff_main(reverse ? right : left, reverse ? left : right, false)
              .map(([op, value]): Diff => [
                reverse
                  ? op === DiffOp.Insert
                    ? DiffOp.Delete
                    : op === DiffOp.Delete
                      ? DiffOp.Insert
                      : op
                  : op,
                value,
              ]);
  return [
    ...(prefix ? [[DiffOp.Equal, before.slice(0, prefix)] as Diff] : []),
    ...middle,
    ...(suffix
      ? [[DiffOp.Equal, before.slice(before.length - suffix)] as Diff]
      : []),
  ];
};

const leafCursor = (leaves: readonly Text[]) => {
  let index = 0;
  let from = 0;
  return (offset: number) => {
    if (leaves.length === 0) throw new Error('A text group needs a leaf.');
    while (
      index < leaves.length - 1 &&
      offset >= from + leaves[index].text.length
    ) {
      from += leaves[index].text.length;
      index += 1;
    }
    const leaf = leaves[index];
    return { leaf, index, end: from + leaf.text.length };
  };
};

export const writeTextRuns = (
  chain: YjsTextChain,
  before: readonly Text[],
  after: readonly Text[],
  encode: YjsRunEncoder,
  encodeBefore: YjsRunEncoder = encode
): void => {
  const previous = before.map((leaf) => leaf.text).join('');
  const next = after.map((leaf) => leaf.text).join('');
  if (previous.length === 0 && next.length > 0) {
    writeEmptyAttributes(chain[0], {});
  }
  let fromBefore = 0;
  let fromAfter = 0;
  const targetAt = leafCursor(after);
  const sourceAt = leafCursor(before);
  for (const [operation, value] of diffText(previous, next)) {
    if (operation === DiffOp.Delete) {
      let remaining = value.length;
      while (remaining > 0) {
        const position = locateChainOffset(chain, fromAfter, 'right');
        const length = Math.min(
          remaining,
          position.text.length - position.index
        );
        if (length === 0) throw new Error('Cannot delete beyond a text chain.');
        position.text.delete(position.index, length);
        refreshLetters(position.text, markIndexOf(position.text));
        remaining -= length;
      }
      fromBefore += value.length;
      continue;
    }
    let remaining = value.length;
    while (remaining > 0) {
      const target = targetAt(fromAfter);
      const source = operation === DiffOp.Equal ? sourceAt(fromBefore) : null;
      const length = Math.min(
        remaining,
        target.end - fromAfter,
        source ? source.end - fromBefore : remaining
      );
      const attributes = encode(target.leaf, target.index);
      if (operation === DiffOp.Insert) {
        const position = locateChainOffset(chain, fromAfter);
        const index = markIndexOf(position.text);
        position.text.insert(
          position.index,
          next.slice(fromAfter, fromAfter + length)
        );
        refreshLetters(position.text, index);
        for (
          let inserted = position.index;
          inserted < position.index + length;
        ) {
          const inherited = index.live[inserted].attributes;
          let end = inserted + 1;
          while (
            end < position.index + length &&
            areJsonLikeValuesEqual(inherited, index.live[end].attributes)
          ) {
            end += 1;
          }
          if (!areJsonLikeValuesEqual(inherited, attributes)) {
            for (const key of new Set([
              ...Object.keys(inherited),
              ...Object.keys(attributes),
            ])) {
              writeMarkRecord(
                position.text,
                inserted,
                end - inserted,
                key,
                attributes[key] ?? null
              );
            }
          }
          inserted = end;
        }
      } else if (source) {
        const oldAttributes = encodeBefore(source.leaf, source.index);
        const patch: YjsAttributeRecord = {};
        for (const key of new Set([
          ...Object.keys(oldAttributes),
          ...Object.keys(attributes),
        ])) {
          if (!areJsonLikeValuesEqual(oldAttributes[key], attributes[key])) {
            patch[key] = Object.hasOwn(attributes, key)
              ? attributes[key]
              : null;
          }
        }
        if (Object.keys(patch).length > 0) {
          let rest = length;
          let { index: at, segment } = locateChainOffset(
            chain,
            fromAfter,
            'right'
          );
          while (rest > 0) {
            const text = chain[segment];
            if (text === undefined) {
              throw new Error('Cannot format beyond a text chain.');
            }
            const count = Math.min(rest, text.length - at);
            if (count > 0) {
              for (const [key, markValue] of Object.entries(patch)) {
                writeMarkRecord(text, at, count, key, markValue);
              }
            }
            rest -= count;
            segment += 1;
            at = 0;
          }
        }
        fromBefore += length;
      }
      fromAfter += length;
      remaining -= length;
    }
  }
  if (next.length === 0) {
    writeEmptyAttributes(chain[0], after[0] ? encode(after[0], 0) : {});
  }
};

export const rewriteTextRuns = (
  chain: YjsTextChain,
  after: readonly Text[],
  encode: YjsRunEncoder
): void => {
  const runs: Array<{ text: string; attributes: YjsAttributeRecord }> = [];
  for (const text of chain) {
    if (text.length === 0) continue;
    for (const run of readEncodedRuns(text)) {
      const last = runs.at(-1);
      if (last && areJsonLikeValuesEqual(last.attributes, run.attributes)) {
        last.text += run.text;
      } else {
        runs.push({ ...run });
      }
    }
  }
  writeTextRuns(
    chain,
    runs.map((run) => ({ text: run.text })),
    after,
    encode,
    (_leaf, index) => runs[index].attributes
  );
};

export const retainTextChainRange = (
  chain: YjsTextChain,
  from: number,
  length: number
): void => {
  let offset = 0;
  for (const text of chain) {
    const end = offset + text.length;
    const startInText = Math.max(0, Math.min(text.length, from - offset));
    const endInText = Math.max(
      startInText,
      Math.min(text.length, from + length - offset)
    );
    if (endInText < text.length) {
      text.delete(endInText, text.length - endInText);
    }
    if (startInText > 0) text.delete(0, startInText);
    refreshLetters(text, markIndexOf(text));
    offset = end;
  }
};

export const cutTextChain = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  chain: YjsTextChain,
  offset: number
): number => {
  const position = locateChainOffset(chain, offset);
  const visible = getYjsVisibleChildren(root, parent);
  const index = visible.indexOf(position.text);
  if (position.index === 0) return index;
  if (position.index === position.text.length) return index + 1;
  const suffix: Array<{ text: string; attributes: YjsAttributeRecord }> = [];
  let skipped = 0;
  for (const leaf of readEncodedRuns(position.text)) {
    const end = skipped + leaf.text.length;
    if (end > position.index) {
      suffix.push({
        ...leaf,
        text: leaf.text.slice(Math.max(0, position.index - skipped)),
      });
    }
    skipped = end;
  }
  const right = createYjsTextChain(
    suffix.map((run) => ({
      ...decodeRunAttributes(run.attributes),
      text: run.text,
    })),
    (_leaf, runIndex) => suffix[runIndex].attributes
  );
  position.text.delete(position.index, position.text.length - position.index);
  refreshLetters(position.text, markIndexOf(position.text));
  insertYjsChild(root, parent, index + 1, right);
  return index + 1;
};

export const pliteToYjsTextPosition = (
  root: Y.XmlElement,
  children: NodeList<Descendant>,
  point: Point
) => {
  let parent = root;
  let projected = children;
  for (const index of point.path.slice(0, -1)) {
    const segments = segmentPliteChildren(projected.slice());
    const at = segments.findIndex(
      (segment) => segment.from === index && segment.kind === 'element'
    );
    const physical = segmentYjsChildren(getYjsVisibleChildren(root, parent))[
      at
    ];
    const node = projected.at(index);
    if (physical?.kind !== 'element' || !NodeApi.isElement(node)) return null;
    parent = physical.node;
    projected = node.children;
  }
  const segments = segmentPliteChildren(projected.slice());
  const leafIndex = point.path.at(-1) ?? -1;
  const at = segments.findIndex(
    (segment) =>
      segment.kind === 'text' &&
      segment.from <= leafIndex &&
      leafIndex < segment.from + segment.leaves.length
  );
  const segment = segments[at];
  const physical = segmentYjsChildren(getYjsVisibleChildren(root, parent))[at];
  if (segment?.kind !== 'text' || physical?.kind !== 'text') return null;
  const leaf = segment.leaves[leafIndex - segment.from];
  const offset =
    segment.leaves
      .slice(0, leafIndex - segment.from)
      .reduce((sum, item) => sum + item.text.length, 0) +
    Math.max(0, Math.min(point.offset, leaf.text.length));
  const position = locateChainOffset(physical.chain, offset);
  return {
    ...position,
    assoc:
      point.offset > 0 ||
      offset === segment.leaves.reduce((sum, item) => sum + item.text.length, 0)
        ? (-1 as const)
        : (0 as const),
  };
};

export const yjsToPliteTextPoint = (
  root: Y.XmlElement,
  children: NodeList<Descendant>,
  text: Y.XmlText,
  index: number,
  assoc = -1
): Point | null => {
  const physicalPath = getYjsVisiblePath(root, text);
  if (!physicalPath) return null;
  let parent = root;
  let projected = children;
  const path: number[] = [];
  for (const physicalIndex of physicalPath.slice(0, -1)) {
    const segments = segmentYjsChildren(getYjsVisibleChildren(root, parent));
    const at = segments.findIndex(
      (segment) => segment.from === physicalIndex && segment.kind === 'element'
    );
    const segment = segments[at];
    const shown = segmentPliteChildren(projected.slice())[at];
    if (segment?.kind !== 'element' || shown?.kind !== 'element') return null;
    path.push(shown.from);
    parent = segment.node;
    projected = shown.node.children;
  }
  const segments = segmentYjsChildren(getYjsVisibleChildren(root, parent));
  const at = segments.findIndex(
    (segment) => segment.kind === 'text' && segment.chain.includes(text)
  );
  const physical = segments[at];
  const shown = segmentPliteChildren(projected.slice())[at];
  if (physical?.kind !== 'text' || shown?.kind !== 'text') return null;
  let offset = chainOffsetOf(physical.chain, text, index);
  for (const [leafIndex, leaf] of shown.leaves.entries()) {
    if (
      offset < leaf.text.length ||
      (offset === leaf.text.length && assoc < 0) ||
      leafIndex === shown.leaves.length - 1
    ) {
      return {
        path: [...path, shown.from + leafIndex],
        offset: Math.min(offset, leaf.text.length),
      };
    }
    offset -= leaf.text.length;
  }
  return null;
};
