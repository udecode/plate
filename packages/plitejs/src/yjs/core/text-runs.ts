import { type Diff, DiffMatchPatch, DiffOp } from 'diff-match-patch-ts';
import * as Y from 'yjs';

import type { NodeList } from '../../core/change/document-index';
import { textPropertiesEqual } from '../../core/value-codec';
import { countCoreWork } from '../../core/work';
import {
  NodeApi,
  type Descendant,
  type Element,
  type Point,
  type Text,
} from '../../index';
import { getDefined } from '../../internal/get-defined';
import { yjsAddressesOf } from './addresses';
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
  ensureYjsNodeId,
  getYjsVisibleChildren,
  getYjsVisiblePath,
  insertYjsChild,
  isEmptyAttributeFreeShownYjsText,
  isEmptyAttributeFreeYjsText,
  noteYjsCutView,
  readYjsChildren,
  removeYjsChild,
  type YjsPropertyLocation,
  type YjsSetPropertyResolver,
  type YjsWrite,
} from './document';
import { areJsonLikeValuesEqual } from './json-equality';
import {
  isReservedYjsKey,
  isYjsMarkRecordKey,
  YJS_CUT_AT_KEY,
  YJS_CUT_KEY,
  YJS_CUT_SOURCE_KEY,
  YJS_MARK_KEY_PREFIX,
} from './keys';
import {
  encodeYjsSetValueAttributes,
  getYjsSetValueAttributeKeys,
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

export const isEmptyTextRun = (segment: PliteSegment) =>
  segment.kind === 'text' && segment.leaves.every((leaf) => leaf.text === '');

/**
 * An empty text run with no props. It needs no Yjs text, and an import
 * deletes one it finds.
 */
export const isBareTextRun = (segment: PliteSegment) =>
  segment.kind === 'text' &&
  segment.leaves.every((leaf) =>
    Object.entries(leaf).every(([key, value]) =>
      key === 'text' ? value === '' : value === undefined
    )
  );

export const alignSegments = (
  plite: readonly PliteSegment[],
  yjs: readonly YjsSegment[]
): Array<YjsSegment | null> | null => {
  const aligned: Array<YjsSegment | null> = [];
  let at = 0;

  for (const segment of plite) {
    if (yjs[at]?.kind === segment.kind) {
      aligned.push(yjs[at]);
      at += 1;
    } else if (isEmptyTextRun(segment)) {
      aligned.push(null);
    } else {
      return null;
    }
  }

  return at === yjs.length ? aligned : null;
};

/**
 * A parent's Plite children paired with the Yjs children that show them, as
 * the importer pairs them: an empty text with no Yjs text of its own pairs
 * with null, so a Yjs index past it is not its Plite index.
 */
export const alignYjsChildren = (
  plite: readonly Descendant[],
  yjs: readonly YjsNode[]
) => {
  const segments = segmentPliteChildren(plite);
  const targets = alignSegments(segments, segmentYjsChildren(yjs));
  return targets && { segments, targets };
};

/**
 * Stores an empty text wherever the editor holds an empty run that storage
 * lacks, in `stored` and its inline elements, so stored and editor children
 * pair one to one. It deletes no text: two peers that fill one place at once
 * leave two empty texts, which read as one run.
 */
export const fillYjsTextGaps = (
  write: YjsWrite,
  stored: Y.XmlElement,
  node: Element
): void => {
  if (
    !node.children.some((child) => !NodeApi.isText(child) || child.text === '')
  ) {
    return;
  }
  const visible = getYjsVisibleChildren(write.root, stored);
  const storedElements = visible.filter(
    (child): child is Y.XmlElement => child instanceof Y.XmlElement
  );
  const elements = node.children.filter((child) => NodeApi.isElement(child));
  if (storedElements.length === elements.length) {
    elements.forEach((child, index) =>
      fillYjsTextGaps(write, storedElements[index], child)
    );
  }
  const aligned = alignYjsChildren(node.children, visible);
  if (!aligned?.segments.some(isEmptyTextRun)) return;
  let next = visible.length;
  for (let index = aligned.targets.length - 1; index >= 0; index -= 1) {
    const slot = aligned.targets[index];
    if (slot) {
      next = slot.from;
      continue;
    }
    insertYjsChild(
      write,
      stored,
      next,
      createYjsTextChain([{ text: '' }], () => ({}))
    );
  }
};

const keptByGapDrop = <T extends YjsNode>(run: readonly T[]) =>
  run.find((node) => !isEmptyAttributeFreeShownYjsText(node)) ??
  run.find((node) => !isEmptyAttributeFreeYjsText(node)) ??
  run[0];

const storedByThisWrite = (write: YjsWrite, node: YjsNode) => {
  const transaction = getDefined(write.root.doc?._transaction);
  const { id } = getDefined(node._item);
  return id.clock >= (transaction.beforeState.get(id.client) ?? 0);
};

/**
 * An empty text that once held letters stays, so an undo puts them back in it.
 * An empty text an earlier write stored stays too, because Yjs deletes every
 * letter a teammate typed into it concurrently once this delete reaches them.
 */
const dropTextGapsIn = (
  write: YjsWrite,
  stored: Y.XmlElement,
  dropEarlierStored: boolean,
  visited: Set<Y.XmlElement>
) => {
  if (visited.has(stored)) return;
  visited.add(stored);
  const visible = getYjsVisibleChildren(write.root, stored);
  const dropped: number[] = [];
  for (const child of visible) {
    if (child instanceof Y.XmlElement) {
      dropTextGapsIn(write, child, dropEarlierStored, visited);
    }
  }
  let from = 0;
  while (from < visible.length) {
    let to = from;
    while (visible[to] instanceof Y.XmlText) to += 1;
    const run = visible.slice(from, to);
    const kept = keptByGapDrop(run);
    for (const [offset, node] of run.entries()) {
      if (
        node !== kept &&
        node._start === null &&
        isEmptyAttributeFreeShownYjsText(node) &&
        (dropEarlierStored || storedByThisWrite(write, node))
      ) {
        dropped.push(from + offset);
      }
    }
    from = Math.max(to, from + 1);
  }
  for (const index of dropped.reverse()) removeYjsChild(write, stored, index);
};

export const dropYjsTextGaps = (
  write: YjsWrite,
  stored: Y.XmlElement,
  { dropEarlierStored }: Readonly<{ dropEarlierStored: boolean }>
) => dropTextGapsIn(write, stored, dropEarlierStored, new Set());

const textRuns = (nodes: readonly Descendant[]) => {
  const runs: Text[] = [];

  for (const node of nodes) {
    if (!NodeApi.isText(node) || node.text === '') continue;

    const last = runs.at(-1);

    if (last && textPropertiesEqual(last, node)) {
      runs[runs.length - 1] = { ...last, text: last.text + node.text };
    } else {
      runs.push(node);
    }
  }

  return runs;
};

const yjsCursor = (
  children: readonly YjsNode[],
  skipped: ReadonlySet<number>,
  start = { at: 0, offset: 0 }
) => {
  let { at, offset } = start;
  const passes = (index: number) => {
    const node = children[index];

    return (
      skipped.has(index) ||
      (node instanceof Y.XmlText && yjsTextLength(node) === 0)
    );
  };
  const settle = () => {
    while (at < children.length && passes(at)) at += 1;
  };

  return {
    element() {
      if (offset !== 0) return null;
      settle();

      const node = children[at];

      if (!(node instanceof Y.XmlElement)) return null;
      at += 1;

      return { at: at - 1, node };
    },
    end() {
      if (offset !== 0) return false;
      settle();

      return at === children.length;
    },
    position: () => ({ at, offset }),
    text(length: number) {
      // An empty text claims the stored empty text in its place, so an
      // element inserted after it lands after that text, not before it.
      if (
        length === 0 &&
        offset === 0 &&
        children[at] instanceof Y.XmlText &&
        children[at].length === 0
      ) {
        at += 1;
      }
      for (let rest = length; rest > 0;) {
        if (offset === 0) settle();

        const node = children[at];

        if (!(node instanceof Y.XmlText)) return false;

        const shown = yjsTextLength(node);
        const taken = Math.min(rest, shown - offset);

        rest -= taken;
        offset += taken;
        if (offset === shown) {
          at += 1;
          offset = 0;
        }
      }

      return true;
    },
  };
};

/**
 * The writes for a splice that keeps its letters: the elements the change
 * removes or inserts whole, by `whole`, and each other element, which keeps
 * its Yjs node and takes its new value there. Null when the letters move or
 * the Yjs children do not line up with the splice.
 */
export const elementOnlySpliceEdits = (
  siblings: readonly Descendant[],
  splice: Readonly<{
    after: readonly Descendant[];
    before: readonly Descendant[];
    from: number;
  }>,
  children: readonly YjsNode[],
  whole: Readonly<{
    inserted: readonly boolean[];
    removed: readonly boolean[];
  }>
) => {
  if (
    !areJsonLikeValuesEqual(textRuns(splice.before), textRuns(splice.after))
  ) {
    return null;
  }

  const read = yjsCursor(children, new Set());
  const removed: Array<{ at: number; node: Element }> = [];
  const kept: Array<{ at: number; node: Element }> = [];
  const walk = (nodes: readonly Descendant[], own: boolean) =>
    nodes.every((node, index) => {
      if (NodeApi.isText(node)) return read.text(node.text.length);

      const found = read.element();

      if (found !== null && own) {
        (whole.removed[index] ? removed : kept).push({ at: found.at, node });
      }

      return found !== null;
    });

  if (!walk(siblings.slice(0, splice.from), false)) return null;

  const start = read.position();

  if (
    !walk(splice.before, true) ||
    !walk(siblings.slice(splice.from + splice.before.length), false) ||
    !read.end()
  ) {
    return null;
  }

  const write = yjsCursor(
    children,
    new Set(removed.map(({ at }) => at)),
    start
  );
  const inserted: Array<{ at: number; index: number; node: Element }> = [];
  const updated: Array<{
    after: Element;
    before: Element;
    index: number;
    node: Y.XmlElement;
  }> = [];
  let next = 0;

  for (const [index, node] of splice.after.entries()) {
    if (NodeApi.isText(node)) {
      if (!write.text(node.text.length)) return null;
      continue;
    }
    if (whole.inserted[index]) {
      const { at, offset } = write.position();

      if (offset !== 0) return null;
      inserted.push({ at, index: splice.from + index, node });
      continue;
    }

    const stay = kept[next];
    const found = write.element();

    next += 1;
    if (stay === undefined || found === null || found.at !== stay.at) {
      return null;
    }
    if (!areJsonLikeValuesEqual(stay.node, node)) {
      updated.push({
        after: node,
        before: stay.node,
        index: splice.from + index,
        node: found.node,
      });
    }
  }

  return next === kept.length ? { inserted, removed, updated } : null;
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
  /** Whether this is a cut embed, which shows no letter. */
  cut: boolean;
  live: boolean;
  /** The Yjs index of a live letter, or -1. */
  at: number;
  slot: number;
  marks: Map<string, Mark>;
  attributes: YjsAttributeRecord;
};
type MarkIndex = {
  byId: Map<string, Letter>;
  items: WeakMap<Y.Item, readonly Letter[]>;
  order: Letter[];
  live: Letter[];
  /** The Yjs indexes of the live cut embeds, in order. */
  cuts: number[];
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

const isCutContent = (content: Y.Item['content']) =>
  content instanceof Y.ContentEmbed &&
  typeof content.embed === 'object' &&
  content.embed !== null &&
  (content.embed as Record<string, unknown>)[YJS_CUT_KEY] === 1;

const refreshLetters = (text: Y.XmlText, index: MarkIndex) => {
  const order: Letter[] = [];
  const live: Letter[] = [];
  const cuts: number[] = [];
  for (let item = text._start; item; item = item.right) {
    if (item.content instanceof Y.ContentFormat) {
      if (!item.deleted) {
        throw new Error(
          'Yjs text formatting is not supported; use mark records.'
        );
      }
      continue;
    }
    if (
      !item.deleted &&
      !(item.content instanceof Y.ContentString) &&
      !isCutContent(item.content)
    ) {
      throw new Error('Yjs text embeds are not supported.');
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
            cut: isCutContent(item.content),
            live: false,
            at: -1,
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
      letter.at = isLive ? live.length : -1;
      order.push(letter);
      if (!isLive) continue;
      if (letter.cut) cuts.push(live.length);
      live.push(letter);
    }
  }
  index.order = order;
  index.live = live;
  index.cuts = cuts;
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
    cuts: [],
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
  v: unknown,
  anchor = true
) => {
  const index = markIndexOf(text);
  const { doc } = text;
  if (!doc) throw new Error('Mark records require an integrated Yjs text.');
  if (length === 0) return;
  // A record that starts a piece starts at its cut, so a letter a peer types
  // at the piece's start, which lands right after the cut, takes it too.
  const first = anchor && index.live[from - 1]?.cut ? from - 1 : from;
  const start = index.live[first];
  if (!start) return;
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

/**
 * The letters a Yjs text shows: Yjs indexes `[from, to)` of `source`. A plain
 * text shows itself up to its first cut. A view, an empty text whose
 * `yjs:cut-at` names a live cut, shows the source's letters from that cut to
 * the next one. A view whose cut is gone shows its own, empty, letters.
 */
export type YjsTextPiece = Readonly<{
  from: number;
  node: Y.XmlText;
  source: Y.XmlText;
  to: number;
}>;

const cutViews = new WeakMap<Y.XmlText, Map<string, Y.XmlText>>();

/** The text that holds a cut embed, and the embed's letter key there. */
export type YjsCut = Readonly<{ key: string; source: Y.XmlText }>;

export type YjsViewCut = YjsCut & Readonly<{ view: Y.XmlText }>;

const cutRecordOf = (item: Y.Item): YjsCut | null =>
  item.parent instanceof Y.XmlText
    ? { key: letterKey([item.id.client, item.id.clock]), source: item.parent }
    : null;

/** The live cut a view starts after. */
export const cutOf = (node: Y.XmlText): YjsCut | null => {
  const { doc } = node;
  if (!doc) return null;
  const at: unknown = node.getAttribute(YJS_CUT_AT_KEY);
  if (!isLetterId(at) || Y.getState(doc.store, at[0]) <= at[1]) return null;
  const item = Y.getItem(doc.store, Y.createID(at[0], at[1]));
  return item instanceof Y.Item && !item.deleted && isCutContent(item.content)
    ? cutRecordOf(item)
    : null;
};

const pieceEnd = (index: MarkIndex, from: number) =>
  index.cuts.find((cut) => cut >= from) ?? index.live.length;

export const textPieceOf = (node: Y.XmlText): YjsTextPiece => {
  const cut = cutOf(node);
  if (cut) {
    const { key, source } = cut;
    const index = markIndexOf(source);
    const from = getDefined(index.byId.get(key)).at + 1;
    if (node.length > 0) {
      throw new Error('A Yjs cut view cannot hold letters of its own.');
    }
    let views = cutViews.get(source);
    if (!views) {
      views = new Map();
      cutViews.set(source, views);
    }
    views.set(key, node);
    return { from, node, source, to: pieceEnd(index, from) };
  }
  if (!node.doc || node.length === 0) {
    return { from: 0, node, source: node, to: 0 };
  }
  return { from: 0, node, source: node, to: pieceEnd(markIndexOf(node), 0) };
};

/** How many letters a Yjs text shows. */
export const yjsTextLength = (node: Y.XmlText): number => {
  const { from, to } = textPieceOf(node);
  return to - from;
};

/** Whether a Yjs text is a cut view or the source of a cut. */
export const hasYjsCut = (node: Y.XmlText): boolean => {
  const { source, to } = textPieceOf(node);
  return source !== node || (node.doc !== null && to !== node.length);
};

/** The letters a Yjs text shows. */
export const yjsTextContent = (node: Y.XmlText): string => {
  const { from, source, to } = textPieceOf(node);
  if (from === to) return '';
  return markIndexOf(source)
    .live.slice(from, to)
    .map((letter) => letter.char)
    .join('');
};

/**
 * Whether a batch deleted one of `source`'s cuts. Its delta cannot say: a
 * deletion counts only the letters the batch deleted, while the tombstones
 * between two live letters include every cut an earlier join healed there.
 */
const deletesCutOf = (source: Y.XmlText, deletedCuts: readonly Y.Item[]) =>
  deletedCuts.some((cut) => cut.parent === source);

/** The live view of each cut of `source` that `keys` names and has one. */
const findCutViews = (
  root: Y.XmlElement,
  source: Y.XmlText,
  keys: readonly string[]
): Map<string, Y.XmlText> => {
  const found = new Map<string, Y.XmlText>();
  const unread = new Set<string>();
  const held = cutViews.get(source);
  for (const key of keys) {
    const view = held?.get(key);
    // A cut has one view, written with it, so once the view this peer read
    // is gone the cut has none. Only a cut whose view this peer never read
    // walks the tree.
    if (!view) unread.add(key);
    else if (cutOf(view)?.source === source) found.set(key, view);
  }
  const stack: unknown[] = unread.size > 0 ? [root] : [];
  for (let node = stack.pop(); node; node = stack.pop()) {
    if (node instanceof Y.XmlElement) {
      stack.push(...readYjsChildren(node));
      continue;
    }
    if (!(node instanceof Y.XmlText)) continue;
    const cut = cutOf(node);
    if (cut?.source !== source || !unread.delete(cut.key)) continue;
    textPieceOf(node);
    found.set(cut.key, node);
    if (unread.size === 0) break;
  }
  return found;
};

/**
 * The texts that show what a text delta changed in `source`, as `source`
 * left it: `source` for its head and, from `views`, the view of each piece
 * after a cut. A letter belongs to the piece it lands in, so one inserted
 * right after a cut starts the piece after it and one inserted right before
 * a cut ends the piece before it. Null when the delta inserts a cut or the
 * batch deleted one of `source`'s, either of which moves letters from one
 * piece to another.
 */
export const textsChangedBy = (
  source: Y.XmlText,
  delta: ReadonlyArray<
    Readonly<{ delete?: number; insert?: unknown; retain?: number }>
  >,
  views: readonly Y.XmlText[],
  deletedCuts: readonly Y.Item[]
): Y.XmlText[] | null => {
  if (deletesCutOf(source, deletedCuts)) return null;
  const { cuts, live } = markIndexOf(source);
  const pieceAt = (at: number) => {
    let piece = 0;
    while (piece < cuts.length && cuts[piece] < at) piece += 1;
    return piece;
  };
  const pieces = new Set<number>();
  let at = 0;
  for (const part of delta) {
    if (part.retain !== undefined) {
      at += part.retain;
    } else if (part.insert !== undefined) {
      if (typeof part.insert !== 'string') return null;
      pieces.add(pieceAt(at));
      at += part.insert.length;
    } else if (part.delete !== undefined) {
      pieces.add(pieceAt(at));
    }
  }
  if (pieces.size === 0) return null;
  const viewOfCut = new Map<string, Y.XmlText>();
  for (const view of views) {
    const cut = cutOf(view);
    if (cut?.source === source) viewOfCut.set(cut.key, view);
  }
  return [...pieces].flatMap((piece) => {
    if (piece === 0) return [source];
    const view = viewOfCut.get(letterKey(live[cuts[piece - 1]].id));
    return view ? [view] : [];
  });
};

/** The live views of the cuts in `source`. */
export const cutViewsOf = (source: Y.XmlText): Y.XmlText[] => {
  let cut = false;
  for (let item = source._start; item && !cut; item = item.right) {
    cut = !item.deleted && isCutContent(item.content);
  }
  if (!cut) return [];
  let root: unknown = source.parent;
  while (root instanceof Y.XmlElement && root.parent instanceof Y.XmlElement) {
    root = root.parent;
  }
  if (!(root instanceof Y.XmlElement)) return [];
  const { cuts, live } = markIndexOf(source);
  const keys = cuts.map((at) => letterKey(live[at].id));
  const views = findCutViews(root, source, keys);
  return keys.flatMap((key) => {
    const view = views.get(key);
    return view && !view._item?.deleted ? [view] : [];
  });
};

/**
 * Whether `view` shows the letters of `text`'s source right after the ones
 * `text` shows, through one live cut.
 */
export const continuesYjsText = (text: Y.XmlText, view: Y.XmlText): boolean => {
  const cut = cutOf(view);
  if (!cut) return false;
  const left = textPieceOf(text);
  return left.source === cut.source && left.to === textPieceOf(view).from - 1;
};

/**
 * Where a batch's `delta` to a source inserted the cut `view` starts after:
 * the text whose letters held that point before the batch, and the offset
 * there. Null when `view` shows no live cut, the delta did not insert it, or
 * the batch deleted a cut of the source, which moves letters between pieces.
 */
export const insertedCutOf = (
  view: Y.XmlText,
  delta: ReadonlyArray<
    Readonly<{ delete?: number; insert?: unknown; retain?: number }>
  >,
  deletedCuts: readonly Y.Item[]
): Readonly<{ offset: number; text: Y.XmlText }> | null => {
  const cut = cutOf(view);
  if (!cut || deletesCutOf(cut.source, deletedCuts)) return null;
  const { source } = cut;
  const { byId, cuts, live } = markIndexOf(source);
  const target = getDefined(byId.get(cut.key)).at;
  // The Yjs index each live item had before the batch, or -1 if it inserted it.
  const before = new Array<number>(live.length).fill(-1);
  let at = 0;
  let was = 0;
  for (const part of delta) {
    if (part.retain !== undefined) {
      for (const end = at + part.retain; at < end; at += 1) {
        before[at] = was;
        was += 1;
      }
    } else if (part.insert !== undefined) {
      at += typeof part.insert === 'string' ? part.insert.length : 1;
    } else if (part.delete !== undefined) {
      was += part.delete;
    }
  }
  for (; at < live.length; at += 1) {
    before[at] = was;
    was += 1;
  }
  if (before[target] !== -1) return null;
  let point = 0;
  for (let index = target - 1; index >= 0 && point === 0; index--) {
    if (before[index] !== -1) point = before[index] + 1;
  }
  const older = cuts.findLast(
    (index) => index < target && before[index] !== -1
  );
  if (older === undefined) return { offset: point, text: source };
  const key = letterKey(live[older].id);
  const text = cutViewsOf(source).find((node) => cutOf(node)?.key === key);
  return text ? { offset: point - before[older] - 1, text } : null;
};

export const isYjsCutItem = (item: Y.Item): boolean =>
  item.parent instanceof Y.XmlText && isCutContent(item.content);

/** The view of a deleted cut, as this peer last read it. */
export const deletedCutViewOf = (item: Y.Item): Y.XmlText | null => {
  const cut = cutRecordOf(item);
  return (cut && cutViews.get(cut.source)?.get(cut.key)) ?? null;
};

/** Delete `cut` while it is live, so its letters show in the piece before. */
export const healYjsCutOf = ({ key, source }: YjsCut): void => {
  const index = markIndexOf(source);
  const embed = index.byId.get(key);
  if (!embed?.live) return;
  source.delete(embed.at, 1);
  refreshLetters(source, index);
};

/** Delete the cut `view` starts after, so its letters show in the piece before. */
export const healYjsCut = (view: Y.XmlText): void => {
  const cut = cutOf(view);
  if (cut) healYjsCutOf(cut);
};

type ShowingTextByPiece = Map<number, Y.XmlText | undefined>;

/**
 * Delete the letters of each piece that `texts` held, or that starts after one
 * of `cuts`, while the text that shows the piece fails `shows`. A source held
 * every piece of its letters and shows the first, and a view held its own
 * piece. Each piece after a cut shows in the cut's view, which for one of
 * `cuts` is the view given with it.
 */
export const deleteUnshownYjsLetters = (
  root: Y.XmlElement,
  texts: Iterable<Y.XmlText>,
  cuts: Iterable<YjsViewCut>,
  shows: (node: Y.XmlText) => boolean
): void => {
  const held = new Map<Y.XmlText, ShowingTextByPiece>();
  const hold = (source: Y.XmlText, piece: number, node?: Y.XmlText) => {
    let pieces = held.get(source);
    if (!pieces) {
      pieces = new Map();
      held.set(source, pieces);
    }
    if (node || !pieces.has(piece)) pieces.set(piece, node);
  };
  for (const text of texts) {
    if (!text.doc || text._item?.deleted) continue;
    const { from, source } = textPieceOf(text);
    if (source !== text) {
      hold(source, markIndexOf(source).cuts.indexOf(from - 1) + 1, text);
      continue;
    }
    hold(source, 0, source);
    for (let piece = 1; piece <= markIndexOf(source).cuts.length; piece++) {
      hold(source, piece);
    }
  }
  for (const { key, source, view } of cuts) {
    if (!source.doc || source._item?.deleted) continue;
    const index = markIndexOf(source);
    const embed = index.byId.get(key);
    if (embed?.live) hold(source, index.cuts.indexOf(embed.at) + 1, view);
  }
  for (const [source, pieces] of held) {
    const index = markIndexOf(source);
    const keyOf = (piece: number) =>
      letterKey(index.live[index.cuts[piece - 1]].id);
    const views = findCutViews(
      root,
      source,
      [...pieces]
        .filter(([piece, node]) => piece > 0 && !node)
        .map(([piece]) => keyOf(piece))
    );
    const unshown = [...pieces]
      .flatMap(([piece, node]) => {
        const from = piece === 0 ? 0 : index.cuts[piece - 1] + 1;
        const to = index.cuts[piece] ?? index.live.length;
        const shownBy = node ?? views.get(keyOf(piece));
        return from < to && !(shownBy && shows(shownBy)) ? [{ from, to }] : [];
      })
      .sort((left, right) => right.from - left.from);
    for (const { from, to } of unshown) {
      source.delete(from, to - from);
    }
    if (unshown.length > 0) refreshLetters(source, index);
  }
};

/**
 * Where Yjs index `index` of `source` shows: the text whose piece holds it and
 * the offset there. An index at a cut ends the piece before the cut.
 */
const showingTextAt = (
  root: Y.XmlElement,
  source: Y.XmlText,
  index: number
): Readonly<{ node: Y.XmlText; offset: number }> | null => {
  const { cuts, live } = markIndexOf(source);
  let cut = -1;
  for (const at of cuts) {
    if (at >= index) break;
    cut = at;
  }
  if (cut === -1) return { node: source, offset: index };
  const key = letterKey(live[cut].id);
  const view = findCutViews(root, source, [key]).get(key);
  return view ? { node: view, offset: index - cut - 1 } : null;
};

export type YjsTextCut = Readonly<{
  /** The index in the chain of the first text the cut's right side holds. */
  at: number;
  /** The view a cut inside a piece makes, which the right side starts with. */
  view: Y.XmlText | null;
}>;

/**
 * Cut a text chain `offset` letters in. Inside a piece, this inserts a cut
 * embed in the piece's source and returns a new view of the letters after it,
 * so both sides keep their letters' Yjs identity. At a piece's edge, it writes
 * nothing.
 */
export const cutTextAt = (
  write: YjsWrite,
  chain: YjsTextChain,
  offset: number
): YjsTextCut => {
  let rest = offset;
  for (const [at, node] of chain.entries()) {
    const piece = textPieceOf(node);
    const length = piece.to - piece.from;
    if (rest === 0) return { at, view: null };
    if (rest < length) {
      const { source } = piece;
      const position = piece.from + rest;
      const index = markIndexOf(source);
      const next = { ...index.live[position].attributes };
      source.insertEmbed(position, { [YJS_CUT_KEY]: 1 });
      refreshLetters(source, index);
      const embed = index.live[position];
      // The embed takes its left neighbour's marks, as a letter does, and a
      // letter typed right after it takes the embed's, so the embed gets the
      // marks of the letter it now starts.
      for (const key of new Set([
        ...Object.keys(embed.attributes),
        ...Object.keys(next),
      ])) {
        if (!areJsonLikeValuesEqual(embed.attributes[key], next[key])) {
          writeMarkRecord(source, position, 1, key, next[key] ?? null, false);
        }
      }
      const view = new Y.XmlText();
      assignFreshYjsNodeId(view);
      const sourceId = ensureYjsNodeId(write, source);
      setYjsAttribute(view, YJS_CUT_SOURCE_KEY, sourceId);
      setYjsAttribute(view, YJS_CUT_AT_KEY, [...embed.id]);
      noteYjsCutView(write, sourceId, {
        key: letterKey(embed.id),
        source,
        view,
      });
      return { at: at + 1, view };
    }
    rest -= length;
  }
  return { at: chain.length, view: null };
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
  const { from, source, to } = textPieceOf(text);
  if (from === to) {
    const {
      [YJS_CUT_AT_KEY]: _at,
      [YJS_CUT_SOURCE_KEY]: _source,
      ...attributes
    } = getYjsAttributes(text);
    return [{ text: '', attributes }];
  }
  const runs: Array<{ text: string; attributes: YjsAttributeRecord }> = [];
  for (const letter of markIndexOf(source).live.slice(from, to)) {
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
  const pending = chain.length === 1 && pendingRuns.get(chain[0]);
  if (pending) return pending.map((leaf) => ({ ...leaf }));
  for (const text of chain) {
    const { source } = textPieceOf(text);
    if (!source._hasFormatting) continue;
    for (const part of source.toDelta()) {
      if (Object.keys(part.attributes ?? {}).length > 0) {
        throw new Error(
          'Yjs text formatting is not supported; use mark records.'
        );
      }
    }
  }
  if (chain.every((text) => yjsTextLength(text) === 0)) {
    return [{ ...decodeRunAttributes(getYjsAttributes(chain[0])), text: '' }];
  }
  const leaves: Text[] = [];
  for (const text of chain) {
    if (yjsTextLength(text) === 0) continue;
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

const locateChainOffset = (
  chain: YjsTextChain,
  offset: number,
  bias: 'left' | 'right' = 'left'
) => {
  if (chain.every((text) => yjsTextLength(text) === 0)) {
    const text = keptByGapDrop(chain);
    const piece = textPieceOf(text);
    return {
      at: piece.from,
      index: 0,
      segment: chain.indexOf(text),
      source: piece.source,
      text,
    };
  }
  let remaining = Math.max(0, offset);
  for (let i = 0; i < chain.length; i++) {
    const text = chain[i];
    const piece = textPieceOf(text);
    const length = piece.to - piece.from;
    if (
      remaining < length ||
      (remaining === length && bias === 'left' && length > 0) ||
      i === chain.length - 1
    ) {
      const index = Math.min(remaining, length);
      return {
        at: piece.from + index,
        index,
        segment: i,
        source: piece.source,
        text,
      };
    }
    remaining -= length;
  }
  throw new Error('A text chain needs a text.');
};

const chainOffsetOf = (
  chain: YjsTextChain,
  text: Y.XmlText,
  index: number
): number => {
  let offset = 0;
  for (const part of chain) {
    const length = yjsTextLength(part);
    if (part === text) return offset + Math.max(0, Math.min(index, length));
    offset += length;
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

/**
 * Compares decoded values so a value stored in another encoding, such as set
 * members a peer is still adding to, is not rewritten as the new encoder would
 * write it.
 */
const withoutKeptValues = (
  patch: Readonly<YjsAttributeRecord>,
  before: Readonly<YjsAttributeRecord>,
  after: Readonly<YjsAttributeRecord>
): YjsAttributeRecord => {
  const oldValues = decodeRunAttributes(before);
  const newValues = decodeRunAttributes(after);
  const kept = new Set<string>();
  for (const property of new Set([
    ...Object.keys(oldValues),
    ...Object.keys(newValues),
  ])) {
    if (!areJsonLikeValuesEqual(oldValues[property], newValues[property])) {
      continue;
    }
    kept.add(property);
    for (const key of getYjsSetValueAttributeKeys(patch, property)) {
      kept.add(key);
    }
  }
  return Object.fromEntries(
    Object.entries(patch).filter(([key]) => !kept.has(key))
  );
};

/**
 * Write `after` over the chain that shows `before`. Without `diff`, the
 * letters to keep come from a diff of the two texts, which cannot tell which
 * of two equal letters an edit removed. `encodeBefore` reads the attributes
 * `before` shows, which default to what `encode` writes for them.
 */
export const writeTextRuns = (
  chain: YjsTextChain,
  before: readonly Text[],
  after: readonly Text[],
  encode: YjsRunEncoder,
  {
    diff,
    encodeBefore = encode,
  }: Readonly<{ diff?: readonly Diff[]; encodeBefore?: YjsRunEncoder }> = {}
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
  for (const [operation, value] of diff ?? diffText(previous, next)) {
    if (operation === DiffOp.Delete) {
      let remaining = value.length;
      while (remaining > 0) {
        const position = locateChainOffset(chain, fromAfter, 'right');
        const length = Math.min(
          remaining,
          yjsTextLength(position.text) - position.index
        );
        if (length === 0) throw new Error('Cannot delete beyond a text chain.');
        position.source.delete(position.at, length);
        refreshLetters(position.source, markIndexOf(position.source));
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
        const index = markIndexOf(position.source);
        position.source.insert(
          position.at,
          next.slice(fromAfter, fromAfter + length)
        );
        refreshLetters(position.source, index);
        for (let inserted = position.at; inserted < position.at + length;) {
          const inherited = index.live[inserted].attributes;
          let end = inserted + 1;
          while (
            end < position.at + length &&
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
                position.source,
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
        let patch: YjsAttributeRecord = {};
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
          patch = withoutKeptValues(patch, oldAttributes, attributes);
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
            const piece = textPieceOf(text);
            const count = Math.min(rest, piece.to - piece.from - at);
            if (count > 0) {
              for (const [key, markValue] of Object.entries(patch)) {
                writeMarkRecord(
                  piece.source,
                  piece.from + at,
                  count,
                  key,
                  markValue
                );
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
  encode: YjsRunEncoder,
  { diff }: Readonly<{ diff?: readonly Diff[] }> = {}
): void => {
  const runs: Array<{ text: string; attributes: YjsAttributeRecord }> = [];
  for (const text of chain) {
    if (yjsTextLength(text) === 0) continue;
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
    { diff, encodeBefore: (_leaf, index) => runs[index].attributes }
  );
};

export const retainTextChainRange = (
  chain: YjsTextChain,
  from: number,
  length: number
): void => {
  let offset = 0;
  for (const text of chain) {
    const piece = textPieceOf(text);
    const shown = piece.to - piece.from;
    const start = Math.max(0, Math.min(shown, from - offset));
    const end = Math.max(start, Math.min(shown, from + length - offset));
    if (end < shown) piece.source.delete(piece.from + end, shown - end);
    if (start > 0) piece.source.delete(piece.from, start);
    refreshLetters(piece.source, markIndexOf(piece.source));
    offset += shown;
  }
};

const alignedChildrenOf = (
  root: Y.XmlElement,
  parent: Y.XmlElement,
  children: readonly Descendant[]
) => alignYjsChildren(children, getYjsVisibleChildren(root, parent));

/**
 * The Yjs position of a Plite text point. An empty text with no Yjs text
 * sits beside an element, so its point anchors on that element: at its start
 * for the text before it, at its end for the text after it.
 */
export const pliteToYjsTextPosition = (
  root: Y.XmlElement,
  children: NodeList<Descendant>,
  point: Point
): Readonly<{
  assoc: -1 | 0;
  index: number;
  type: Y.XmlElement | Y.XmlText;
}> | null => {
  const elementPath = point.path.slice(0, -1);
  const parent = yjsAddressesOf(root, children).elementAt(elementPath);
  if (!parent) return null;
  let projected: readonly Descendant[] =
    elementPath.length === 0 ? children.slice() : [];
  for (const [depth, index] of elementPath.entries()) {
    const node = depth === 0 ? children.at(index) : projected[index];
    if (!node || !NodeApi.isElement(node)) return null;
    projected = node.children;
  }
  const line = alignedChildrenOf(root, parent, projected);
  if (!line) return null;
  const leafIndex = point.path.at(-1) ?? -1;
  const at = line.segments.findIndex(
    (segment) =>
      segment.kind === 'text' &&
      segment.from <= leafIndex &&
      leafIndex < segment.from + segment.leaves.length
  );
  const segment = line.segments[at];
  const physical = line.targets[at];
  if (segment?.kind !== 'text') return null;
  if (physical === null) {
    const next = line.targets[at + 1];
    if (next?.kind === 'element') {
      return { assoc: -1, index: 0, type: next.node };
    }
    const previous = line.targets[at - 1];
    return previous?.kind === 'element'
      ? { assoc: 0, index: previous.node.length, type: previous.node }
      : null;
  }
  if (physical?.kind !== 'text') return null;
  const leaf = segment.leaves[leafIndex - segment.from];
  const offset =
    segment.leaves
      .slice(0, leafIndex - segment.from)
      .reduce((sum, item) => sum + item.text.length, 0) +
    Math.max(0, Math.min(point.offset, leaf.text.length));
  const position = locateChainOffset(physical.chain, offset);
  return {
    index: position.at,
    type: position.source,
    assoc:
      point.offset > 0 ||
      offset === segment.leaves.reduce((sum, item) => sum + item.text.length, 0)
        ? -1
        : 0,
  };
};

/**
 * The Plite children of the element that shows `node`, paired with its Yjs
 * children, and that element's Plite path.
 */
const alignedParentOf = (
  root: Y.XmlElement,
  children: NodeList<Descendant>,
  node: YjsNode
) => {
  const physicalPath = getYjsVisiblePath(root, node);
  if (!physicalPath) return null;
  let parent = root;
  let projected: readonly Descendant[] = children.slice();
  const path: number[] = [];
  for (const physicalIndex of physicalPath.slice(0, -1)) {
    const line = alignedChildrenOf(root, parent, projected);
    if (!line) return null;
    const at = line.targets.findIndex(
      (segment) => segment?.kind === 'element' && segment.from === physicalIndex
    );
    const physical = line.targets[at];
    const shown = line.segments[at];
    if (physical?.kind !== 'element' || shown?.kind !== 'element') return null;
    path.push(shown.from);
    parent = physical.node;
    projected = shown.node.children;
  }
  const line = alignedChildrenOf(root, parent, projected);
  return line && { line, path };
};

export const yjsToPliteTextPoint = (
  root: Y.XmlElement,
  children: NodeList<Descendant>,
  source: Y.XmlText,
  sourceIndex: number,
  assoc = -1
): Point | null => {
  const showing = showingTextAt(root, source, sourceIndex);
  if (!showing) return null;
  const { node: text, offset: index } = showing;
  const found = alignedParentOf(root, children, text);
  if (!found) return null;
  const at = found.line.targets.findIndex(
    (segment) => segment?.kind === 'text' && segment.chain.includes(text)
  );
  const physical = found.line.targets[at];
  const shown = found.line.segments[at];
  if (physical?.kind !== 'text' || shown?.kind !== 'text') return null;
  let offset = chainOffsetOf(physical.chain, text, index);
  for (const [leafIndex, leaf] of shown.leaves.entries()) {
    if (
      offset < leaf.text.length ||
      (offset === leaf.text.length && assoc < 0) ||
      leafIndex === shown.leaves.length - 1
    ) {
      return {
        path: [...found.path, shown.from + leafIndex],
        offset: Math.min(offset, leaf.text.length),
      };
    }
    offset -= leaf.text.length;
  }
  return null;
};

/**
 * The Plite point a position anchored on an element stands for: the end of
 * the text before it when `assoc` is negative, else the start of the text
 * after it.
 */
export const yjsToPliteSpacerPoint = (
  root: Y.XmlElement,
  children: NodeList<Descendant>,
  element: Y.XmlElement,
  assoc: number
): Point | null => {
  const found = alignedParentOf(root, children, element);
  if (!found) return null;
  const at = found.line.targets.findIndex(
    (segment) => segment?.kind === 'element' && segment.node === element
  );
  if (at === -1) return null;
  const shown = found.line.segments[assoc < 0 ? at - 1 : at + 1];
  if (shown?.kind !== 'text') return null;
  const leafIndex = assoc < 0 ? shown.leaves.length - 1 : 0;
  return {
    path: [...found.path, shown.from + leafIndex],
    offset: assoc < 0 ? shown.leaves[leafIndex].text.length : 0,
  };
};
