import { nanoid } from 'nanoid';

import { definePlugin, txLocate } from '../../../core';
import {
  defineRuntimePlugin,
  getActiveEditorUpdateId,
  getDocumentValueNode,
  getRecordSetVersion,
  getValueRecords,
  isEditorDraftView,
  type Node,
  type NodeKey,
  PathApi,
  type Range,
  type RecordSetVersion,
  readRecord,
  readShownElementById,
  readShownRecords,
  recordSetIds,
  txStored,
} from '../../../facade';
import { readEditorAuthor } from '../../../lib/editor/editorUser.internal';
import {
  marginLineSpanOf,
  matchMarginBlock,
  matchMarkBlock,
} from './inkAnchor.internal';
import {
  countInkDecode,
  decodePoints,
  digest,
  encodePoints,
  isInkRefusal,
  refuse,
  roundSample,
} from './inkCodec.internal';
import {
  INK_VOID,
  inkBlockRange,
  inkHolds,
  inkPassageWords,
  inkText,
  lineOf,
  lineStart,
} from './inkMatch.internal';
import {
  advanceInkPlaces,
  byMark,
  COPIES,
  DIGITIZED,
  idOf,
  isInkMarkShown,
  MARKS,
  readInkLiveMarks,
  readInkPlace,
} from './inkPlaces.internal';

/** Which way a mark's text runs. */
export type InkDirection = 'ltr' | 'rtl';

/**
 * The pen a mark was drawn with. `opacity` runs from 0 to 1. `size` is the
 * line's width at full pressure, and a lighter press paints thinner.
 */
export type InkBrush = Readonly<{
  color: string;
  opacity: number;
  size: number;
}>;

/**
 * One pen sample: where it was in the mark's space, its pressure from 0 to 1,
 * and its time in milliseconds after the mark's `at`.
 */
export type InkSample = readonly [
  x: number,
  y: number,
  pressure: number,
  time: number,
];

/**
 * One visual line of a copied block: the text offset its line ends at, and its
 * box inside the block's box.
 */
export type InkLine = Readonly<{
  end: number;
  height: number;
  left: number;
  top: number;
  width: number;
}>;

/**
 * Words a mark marks in one block: the text offsets of the run, and where the
 * run sat on its line, inside the block's box. A run with `start` equal to
 * `end` marks the point between two words.
 */
export type InkRun = Readonly<{
  end: number;
  left: number;
  start: number;
  width: number;
}>;

/**
 * A note drawn in the margin beside its block: the side it sits on, and how
 * far past the block's edge it reaches.
 */
export type InkMargin = Readonly<{
  reach: number;
  side: 'left' | 'right';
}>;

/**
 * A block as it was when a mark was drawn on it: its element id, its text,
 * each visual line and its box's size. Marks drawn on the same block state
 * share one copy.
 */
export type InkCopy = Readonly<{
  block: string;
  height: number;
  id: string;
  lines: readonly InkLine[];
  text: string;
  /**
   * A digest of the content properties of the block's inline voids at their
   * offsets, excluding metadata such as ids and review marks, so a mention
   * swapped for another reads as changed.
   */
  voids?: string;
  width: number;
}>;

/**
 * A block a mark crosses: its copy, where the block's box sat in the mark's
 * space, and the words the mark marks in it.
 */
export type InkMarkBlock = Readonly<{
  copy: string;
  left: number;
  runs: readonly InkRun[];
  top: number;
}>;

/**
 * One pen contact on the document. Its samples and its blocks' boxes share
 * one space. A margin note has one block, no runs and a `margin`.
 */
export type InkMark = Readonly<{
  /** When the pen touched down, in milliseconds since the epoch. */
  at: number;
  author: string;
  blocks: readonly InkMarkBlock[];
  brush: InkBrush;
  direction: InkDirection;
  id: string;
  margin?: InkMargin;
  samples: readonly InkSample[];
}>;

/**
 * A block a stroke crosses, as measured when the stroke began: its copy's
 * fields, where its box sat in the mark's space and the words marked in it.
 */
export type InkBlockInput = Omit<InkCopy, 'id'> & Omit<InkMarkBlock, 'copy'>;

/**
 * What `add` saves: one pen contact, measured on the blocks it crosses. Each
 * block's `text` is its ink text, with each inline void as one U+FFFC, and its
 * `runs` hold every word the stroke touches, one run per line of a word that
 * wraps. Words split on white space, and a run of Han, Hiragana, Katakana or
 * Thai splits into the words `Intl.Segmenter` finds. A block's `voids` digests
 * its inline voids as the stroke measured them. A block that leaves `voids`
 * out takes the document block's, or none when that block's ink text is not
 * `text`, so a copy over a void then reads as changed.
 */
export type InkMarkInput = Readonly<{
  at: number;
  blocks: readonly InkBlockInput[];
  brush: InkBrush;
  direction: InkDirection;
  margin?: InkMargin;
  samples: readonly InkSample[];
}>;

/**
 * A Draw tool. `draw` draws marks with its brush. `erase` removes each mark
 * whose ink its path, `size` pixels wide, touches. `lasso` picks the marks
 * with more than half their samples inside its loop.
 */
export type InkTool =
  | Readonly<{ brush: InkBrush; type: 'draw' }>
  | Readonly<{ size: number; type: 'erase' }>
  | Readonly<{ type: 'lasso' }>;

/**
 * What one view shows and does with ink: the tool a pen uses, or `null` when
 * drawing is off, whether ink and signs are hidden, whether digitized marks
 * show faded, and the ids of the marks picked.
 */
export type InkViewState = {
  hidden: boolean;
  picked: readonly string[];
  showDigitized: boolean;
  tool: InkTool | null;
};

/**
 * Where a copy's block stands now. `live` while the block that holds the
 * copy's id holds its text and inline voids, and `changed` while it holds
 * other text or voids.
 */
export type InkCopyPlace = Readonly<{
  key: NodeKey;
  kind: 'changed' | 'live';
}>;

/** A word's character offsets in its saved copy's text. */
export type InkPassageWord = Readonly<{
  end: number;
  start: number;
}>;

/**
 * One mark's touched words and point gaps inside an `InkPassage`, plus its
 * margin side when the mark is a margin note beside the passage's lines.
 */
export type InkPassageMark = Readonly<{
  gaps: readonly number[];
  id: string;
  margin?: InkMargin['side'];
  words: readonly number[];
}>;

/**
 * One run of marked lines on a saved copy or live block, with its text, word
 * offsets, and the words and gaps each mark touches. When `block` is present,
 * `start`, `text`, and `words` are in live block coordinates rather than saved
 * copy coordinates.
 */
export type InkPassage = Readonly<{
  /** Present when passage offsets and text use live block coordinates. */
  block?: string;
  copy: string;
  marks: readonly InkPassageMark[];
  start: number;
  text: string;
  words: readonly InkPassageWord[];
}>;

/**
 * Character offsets in one saved copy's text (or one live block's text when
 * `block` is given) to resolve to a live range.
 */
export type InkRangeInput =
  | Readonly<{ block: string; end: number; start: number }>
  | Readonly<{ copy: string; end: number; start: number }>;

const copiesOf = ({ copies }: Readonly<Record<string, unknown>>) => {
  const ids = typeof copies === 'string' ? copies.split(' ') : [];

  return ids.length > 0 && ids.every((id) => id !== '') ? ids : null;
};

const inkRecords = defineRuntimePlugin('inkRecords', {
  activate: ({ afterPublish, editor }) => {
    afterPublish(() => {
      const store = readShownRecords(editor);
      const digitized = getRecordSetVersion(store, DIGITIZED);
      if (!digitized) return;
      const marks = getRecordSetVersion(store, MARKS);
      const orphans = recordSetIds(digitized).filter(
        (id) => !readRecord(marks, id)
      );
      if (orphans.length === 0) return;
      editor.update((tx) => {
        tx.tags.add('history-skip');
        const currentMarks = getRecordSetVersion(
          getValueRecords(tx.value()),
          MARKS
        );
        for (const id of orphans) {
          if (!readRecord(currentMarks, id)) tx.records.drop(DIGITIZED, id);
        }
      });
    });
  },
  schema: {
    records: {
      [COPIES]: {
        history: 'retain',
        namedBy: { names: copiesOf, set: MARKS },
      },
      [DIGITIZED]: {},
      [MARKS]: {},
    },
  },
  update: ({ editor, tx }) => ({
    cleanup: txLocate(false, () => {
      flushPendingCleanup(editor, tx);
    }),
  }),
});

type SavedRecord = Readonly<Record<string, unknown>>;

// The store keeps an unchanged record as the same object, so each decode is
// cached on its record.
const decodedCopies = new WeakMap<SavedRecord, InkCopy | undefined>();

// A mark's decode also holds the copy record under each id the mark names, or
// `undefined` for a missing one, because a copy dropped or saved later changes
// what the mark decodes to.
const decodedMarks = new WeakMap<
  SavedRecord,
  Readonly<{ mark?: InkMark; named: ReadonlyArray<SavedRecord | undefined> }>
>();

const markLists = new WeakMap<object, WeakMap<object, readonly InkMark[]>>();
const shownMarkLists = new WeakMap<
  object,
  WeakMap<object, WeakMap<object, readonly InkMark[]>>
>();
const EMPTY_SET_VERSION = {};

const cached = <K extends object, V>(
  map: WeakMap<K, V>,
  key: K,
  make: () => V
) => {
  let value = map.get(key);
  if (!value) map.set(key, (value = make()));
  return value;
};

const frozen = <T extends object>(value: T) => {
  for (const field of Object.values(value)) {
    if (typeof field === 'object' && field !== null) frozen(field);
  }
  Object.freeze(value);

  return value;
};

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const numberIn = (
  value: unknown,
  name: string,
  min = -Infinity,
  max = Infinity
) => {
  if (!isNumber(value) || value < min || value > max) {
    return refuse(`${name} must be a finite number from ${min} to ${max}`);
  }

  return value === 0 ? 0 : value;
};

const offsetIn = (value: unknown, name: string, min: number, max?: number) => {
  const offset = numberIn(value, name, min, max);

  return Number.isInteger(offset)
    ? offset
    : refuse(`${name} must be a whole number`);
};

const textIn = (value: unknown, name: string) =>
  typeof value === 'string' && value.length > 0
    ? value
    : refuse(`${name} must be a non-empty string`);

const listIn = <T>(value: unknown, name: string) =>
  Array.isArray(value)
    ? (value as readonly T[])
    : refuse(`${name} must be an array`);

const directionIn = (value: unknown): InkDirection =>
  value === 'ltr' || value === 'rtl'
    ? value
    : refuse("direction must be 'ltr' or 'rtl'");

const sideIn = (value: unknown): InkMargin['side'] =>
  value === 'left' || value === 'right'
    ? value
    : refuse("margin.side must be 'left' or 'right'");

const encodeSamples = (input: unknown) => {
  const samples = listIn<InkSample>(input, 'samples');
  let time = 0;

  if (samples.length === 0) refuse('a mark needs at least one sample');

  const checked = samples.map((sample, at): InkSample => {
    const name = `samples[${at}]`;

    if (!Array.isArray(sample) || sample.length !== 4) {
      refuse(`${name} must be [x, y, pressure, time]`);
    }
    time = numberIn(sample[3], `${name} time`, time);

    return [
      numberIn(sample[0], `${name} x`),
      numberIn(sample[1], `${name} y`),
      numberIn(sample[2], `${name} pressure`, 0, 1),
      time,
    ];
  });

  return encodePoints(checked.map(roundSample));
};

const copyRecord = (
  copy: Readonly<Partial<Record<keyof Omit<InkCopy, 'id'>, unknown>>>,
  name: string
) => {
  const text =
    typeof copy.text === 'string'
      ? copy.text
      : refuse(`${name}.text must be a string`);
  const lines = listIn<InkLine>(copy.lines, `${name}.lines`);
  const flat: number[] = [];
  let end = 0;

  for (const [at, line] of lines.entries()) {
    const lineName = `${name}.lines[${at}]`;

    end = offsetIn(line?.end, `${lineName}.end`, end, text.length);
    flat.push(
      end,
      numberIn(line.left, `${lineName}.left`),
      numberIn(line.top, `${lineName}.top`),
      numberIn(line.width, `${lineName}.width`, 0),
      numberIn(line.height, `${lineName}.height`, 0)
    );
  }
  if (end !== text.length) refuse(`${name}.lines must end where its text ends`);

  return {
    block: textIn(copy.block, `${name}.block`),
    height: numberIn(copy.height, `${name}.height`, 0),
    lines: flat,
    text,
    voids:
      copy.voids === undefined
        ? undefined
        : text.includes(INK_VOID)
          ? textIn(copy.voids, `${name}.voids`)
          : refuse(`${name}.voids needs an inline void in its text`),
    width: numberIn(copy.width, `${name}.width`, 0),
  };
};

const encodeMark = (
  input: InkMarkInput,
  author: string,
  voidsOf: (block: string, text: string) => string | undefined
) => {
  const list = <T>(values: readonly T[]) => values.join(' ');
  if (typeof input !== 'object' || input === null) {
    refuse('input must be an object');
  }

  const blocks = listIn<InkBlockInput>(input.blocks, 'blocks');
  const { margin } = input;

  if (blocks.length === 0) refuse('a mark needs at least one block');
  if (margin !== undefined && blocks.length !== 1) {
    refuse('a margin note sits beside exactly one block');
  }
  if (new Set(blocks.map((block) => block?.block)).size !== blocks.length) {
    refuse('a mark names each block once');
  }

  const copies = blocks.map((block, at) => {
    const {
      block: id,
      height,
      lines,
      text,
      voids: measured,
      width,
    } = typeof block === 'object' && block !== null
      ? copyRecord(block, `blocks[${at}]`)
      : refuse(`blocks[${at}] must be an object`);
    const voids = Object.hasOwn(block, 'voids') ? measured : voidsOf(id, text);
    const record = {
      block: id,
      height,
      lines: list(lines),
      text,
      width,
      ...(voids === undefined ? {} : { voids }),
    };

    return {
      id: `p_${digest(JSON.stringify(record))}`,
      record,
    };
  });
  const origins: number[] = [];
  const runs: number[] = [];

  for (const [at, block] of blocks.entries()) {
    const name = `blocks[${at}]`;
    const { length } = copies[at].record.text;
    const blockRuns = listIn<InkRun>(block.runs, `${name}.runs`);

    origins.push(
      numberIn(block.left, `${name}.left`),
      numberIn(block.top, `${name}.top`)
    );
    if (margin !== undefined && blockRuns.length > 0) {
      refuse('a margin note marks no words');
    }
    for (const [index, run] of blockRuns.entries()) {
      const runName = `${name}.runs[${index}]`;
      const start = offsetIn(run?.start, `${runName}.start`, 0, length);

      runs.push(
        at,
        start,
        offsetIn(run.end, `${runName}.end`, start, length),
        numberIn(run.left, `${runName}.left`),
        numberIn(run.width, `${runName}.width`, 0)
      );
    }
  }

  const brush =
    typeof input.brush === 'object' && input.brush !== null
      ? input.brush
      : refuse('brush must be an object');
  const place =
    margin === undefined
      ? { runs: list(runs) }
      : {
          reach: numberIn(margin.reach, 'margin.reach', 0),
          side: sideIn(margin.side),
        };

  return {
    copies,
    mark: {
      at: numberIn(input.at, 'at', 0),
      author,
      color: textIn(brush.color, 'brush.color'),
      copies: list(copies.map((copy) => copy.id)),
      direction: directionIn(input.direction),
      opacity: numberIn(brush.opacity, 'brush.opacity', 0, 1),
      origins: list(origins),
      size: numberIn(brush.size, 'brush.size', 0),
      ...place,
    },
  };
};

const readSaved = <T>(read: () => T): T | undefined => {
  try {
    return read();
  } catch (error) {
    if (isInkRefusal(error)) return undefined;
    throw error;
  }
};

const sameFields = (encoded: SavedRecord, saved: SavedRecord) =>
  Object.entries(encoded).every(([key, value]) => value === saved[key]);

const savedList = (value: unknown, name: string) =>
  typeof value === 'string'
    ? value === ''
      ? []
      : value.split(' ')
    : refuse(`${name} must be a string`);

const savedNumbers = (value: unknown, name: string, stride: number) => {
  const numbers = savedList(value, name).map(Number);

  if (numbers.length % stride !== 0) {
    refuse(`${name} must hold ${stride} numbers per entry`);
  }

  return numbers.map((number, at) => numberIn(number, `${name}[${at}]`));
};

const groupsOf = <T>(
  numbers: readonly number[],
  stride: number,
  build: (at: number) => T
) =>
  Array.from({ length: numbers.length / stride }, (_, index) =>
    build(index * stride)
  );

const decodeCopy = (id: string, record: SavedRecord): InkCopy | undefined =>
  readSaved(() => {
    countInkDecode('copies');

    const numbers = savedNumbers(record.lines, 'lines', 5);
    const lines = groupsOf(numbers, 5, (at) => ({
      end: numbers[at],
      height: numbers[at + 4],
      left: numbers[at + 1],
      top: numbers[at + 2],
      width: numbers[at + 3],
    }));
    const { block, height, text, voids, width, ...written } = copyRecord(
      { ...record, lines },
      'copy'
    );

    if (written.lines.join(' ') !== record.lines) {
      refuse('a saved copy must be what add writes');
    }

    return frozen({
      block,
      height,
      id,
      lines,
      text,
      width,
      ...(voids === undefined ? {} : { voids }),
    });
  });

const decodeMark = (
  id: string,
  record: SavedRecord,
  copyOf: (id: string) => InkCopy | undefined
): InkMark | undefined =>
  readSaved(() => {
    countInkDecode('marks');

    const copies = savedList(record.copies, 'copies').map(
      (copy, at) =>
        copyOf(copy) || refuse(`copies[${at}] must name a saved copy`)
    );
    const origins = savedNumbers(record.origins, 'origins', 2);
    const runs =
      record.runs === undefined ? [] : savedNumbers(record.runs, 'runs', 5);
    const marked = groupsOf(runs, 5, (at) => ({
      copy: runs[at],
      run: {
        end: runs[at + 2],
        left: runs[at + 3],
        start: runs[at + 1],
        width: runs[at + 4],
      },
    }));
    const blocks = copies.map((copy, index) => ({
      copy: copy.id,
      left: origins[index * 2],
      runs: marked
        .filter((entry) => entry.copy === index)
        .map((entry) => entry.run),
      top: origins[index * 2 + 1],
    }));
    const author =
      typeof record.author === 'string'
        ? record.author
        : refuse('author must be a string');
    const mark = {
      at: numberIn(record.at, 'at'),
      brush: {
        color: textIn(record.color, 'color'),
        opacity: numberIn(record.opacity, 'opacity'),
        size: numberIn(record.size, 'size'),
      },
      direction: directionIn(record.direction),
      ...(record.runs === undefined
        ? {
            margin: {
              reach: numberIn(record.reach, 'reach'),
              side: sideIn(record.side),
            },
          }
        : {}),
      samples: decodePoints(textIn(record.points, 'points')),
    };
    const { copies: _, ...written } = encodeMark(
      {
        ...mark,
        blocks: blocks.map(({ copy, ...placed }, index) => ({
          ...placed,
          block: copies[index].block,
          height: copies[index].height,
          lines: copies[index].lines,
          text: copies[index].text,
          voids: copies[index].voids,
          width: copies[index].width,
        })),
      },
      author,
      () => undefined
    ).mark;

    if (!sameFields(written, record)) {
      refuse('a saved mark must be what add writes');
    }

    return frozen({ ...mark, author, blocks, id });
  });

const copyIn = (copies: RecordSetVersion, id: string) => {
  const record = readRecord(copies, id);

  if (record && !decodedCopies.has(record)) {
    decodedCopies.set(record, decodeCopy(id, record));
  }

  return record && decodedCopies.get(record);
};

const markIn = (id: string, record: SavedRecord, copies: RecordSetVersion) => {
  const named = (copiesOf(record) ?? []).map((copy) =>
    readRecord(copies, copy)
  );
  const decoded = decodedMarks.get(record);

  if (decoded?.named.every((copy, at) => copy === named[at])) {
    return decoded.mark;
  }

  const mark = decodeMark(id, record, (copy) => copyIn(copies, copy));

  decodedMarks.set(record, { mark, named });

  return mark;
};

type PendingCleanup = {
  emptiedBlocks: Set<string>;
  removedBlocks: Set<string>;
};

const pendingCleanups = new WeakMap<object, PendingCleanup>();

const cleanupFor = (editor: Parameters<typeof getActiveEditorUpdateId>[0]) => {
  const updateId = getActiveEditorUpdateId(editor);

  if (!updateId) return undefined;

  let pending = pendingCleanups.get(updateId);

  if (!pending) {
    pending = { emptiedBlocks: new Set(), removedBlocks: new Set() };
    pendingCleanups.set(updateId, pending);
  }

  return pending;
};

const hasPendingCleanup = (
  editor: Parameters<typeof getActiveEditorUpdateId>[0]
) => {
  const updateId = getActiveEditorUpdateId(editor);

  return updateId !== null && pendingCleanups.has(updateId);
};

const flushPendingCleanup = (
  editor: Parameters<typeof getActiveEditorUpdateId>[0],
  tx: {
    nodes: { byId: (id: string) => Readonly<{ node: Node }> | null };
    records: { drop: (set: string, id: string) => void };
    schema: Parameters<typeof inkText>[0];
    tags: { has: (tag: string) => boolean };
    value: () => Parameters<typeof getValueRecords>[0];
  }
) => {
  if (
    tx.tags.has('collaboration') ||
    tx.tags.has('historic') ||
    isEditorDraftView(editor)
  ) {
    return;
  }

  const updateId = getActiveEditorUpdateId(editor);

  if (!updateId) return;

  const pending = pendingCleanups.get(updateId);

  if (!pending) return;
  pendingCleanups.delete(updateId);

  const deadBlocks = new Set<string>();

  for (const id of pending.removedBlocks) {
    if (!tx.nodes.byId(id)) deadBlocks.add(id);
  }

  const emptiedBlocks = new Set<string>();

  for (const id of pending.emptiedBlocks) {
    const holder = tx.nodes.byId(id);

    if (
      holder &&
      !tx.schema.isVoid(holder.node) &&
      inkText(tx.schema, holder.node).text.trim().length === 0
    ) {
      emptiedBlocks.add(id);
    }
  }
  if (deadBlocks.size === 0 && emptiedBlocks.size === 0) return;

  const store = getValueRecords(tx.value());
  const marks = getRecordSetVersion(store, MARKS);
  const copies = getRecordSetVersion(store, COPIES);

  if (!marks || !copies) return;

  const toDrop: string[] = [];

  for (const id of recordSetIds(marks)) {
    const record = readRecord(marks, id);

    if (!record) continue;

    const isMargin = record.side !== undefined;

    for (const copyId of copiesOf(record) ?? []) {
      const copyRec = readRecord(copies, copyId);

      if (!copyRec || typeof copyRec.block !== 'string') continue;
      if (deadBlocks.has(copyRec.block)) {
        toDrop.push(id);
        break;
      }
      if (
        !isMargin &&
        typeof copyRec.lines === 'string' &&
        copyRec.lines.length > 0 &&
        emptiedBlocks.has(copyRec.block)
      ) {
        toDrop.push(id);
        break;
      }
    }
  }
  if (toDrop.length === 0) return;

  const digitized = getRecordSetVersion(store, DIGITIZED);

  for (const id of toDrop) {
    tx.records.drop(MARKS, id);
    if (readRecord(digitized, id)) tx.records.drop(DIGITIZED, id);
  }
};

/**
 * Pen marks on a document's text or void blocks, saved as records of the
 * document value. Deleting a marked block or emptying a marked text block
 * removes its marks in the same transaction so undo restores both together.
 */
export const BaseInkPlugin = definePlugin('ink', {
  corrections: [
    {
      event: 'children',
      query: 'root',
      correct: ({ editor, tx }) => {
        if (hasPendingCleanup(editor)) tx.inkRecords.cleanup();
      },
    },
    {
      event: 'properties',
      query: 'root',
      correct: ({ editor, tx }) => {
        if (hasPendingCleanup(editor)) tx.inkRecords.cleanup();
      },
    },
    {
      event: 'content',
      query: 'root',
      correct: ({ editor, tx }) => {
        if (hasPendingCleanup(editor)) tx.inkRecords.cleanup();
      },
    },
  ],
  dependencies: [inkRecords],
  initialViewState: (): InkViewState => ({
    hidden: false,
    picked: [],
    showDigitized: false,
    tool: null,
  }),
  on: {
    commit: ({ commit, editor }) => {
      advanceInkPlaces(editor, commit);
    },
    transactionChange: ({ after, before, changed, editor, tx }) => {
      if (
        tx.tags.has('collaboration') ||
        tx.tags.has('historic') ||
        isEditorDraftView(editor)
      ) {
        return;
      }

      const pending = cleanupFor(editor);

      if (!pending) return;

      if (changed.has('structure') || changed.has('properties')) {
        for (const { node } of changed.removed()) {
          const id = idOf(node);

          if (id) pending.removedBlocks.add(id);
        }
        if (!changed.has('structure')) {
          for (const path of changed.paths()) {
            const id = idOf(getDocumentValueNode(before, path));

            if (id && id !== idOf(getDocumentValueNode(after, path))) {
              pending.removedBlocks.add(id);
            }
          }
        }
      }
      if (changed.has('text') || changed.has('structure')) {
        for (const path of changed.paths()) {
          for (let len = path.length; len >= 1; len -= 1) {
            const beforeNode = getDocumentValueNode(before, path.slice(0, len));
            const id = idOf(beforeNode);

            if (!id || !beforeNode) continue;
            if (tx.schema.isVoid(beforeNode)) break;
            if (inkText(tx.schema, beforeNode).text.trim().length > 0) {
              const afterHolder = tx.nodes.byId(id);

              if (
                afterHolder &&
                !tx.schema.isVoid(afterHolder.node) &&
                inkText(tx.schema, afterHolder.node).text.trim().length === 0
              ) {
                pending.emptiedBlocks.add(id);
              }
            }
            break;
          }
        }
      }
    },
  },
  read: ({ editor, state }) => {
    const version = (set: string) =>
      getRecordSetVersion(readShownRecords(editor), set);
    const copy = (id: string) => copyIn(version(COPIES), id);

    const read = {
      /** The copy saved under `id`, or `undefined`. */
      copy,
      /**
       * Every shown (non-digitized) mark currently attached to live document
       * text, oldest first, frozen.
       */
      liveMarks: () =>
        readInkLiveMarks({ copy, editor, marks: read.shownMarks, state }),
      /** The mark saved under `id`, or `undefined`. */
      mark: (id: string) => {
        const record = readRecord(version(MARKS), id);

        return record && markIn(id, record, version(COPIES));
      },
      /**
       * Every saved mark, oldest first, frozen, as the same list while the
       * saved marks and copies stay the same. Each mark stays the same object
       * while its record and the copies it names stay the same.
       */
      marks: () => {
        const saved = version(MARKS);
        const copies = version(COPIES);
        let byCopies = markLists.get(saved ?? EMPTY_SET_VERSION);

        if (!byCopies) {
          byCopies = new WeakMap();
          markLists.set(saved ?? EMPTY_SET_VERSION, byCopies);
        }

        let marks = byCopies.get(copies ?? EMPTY_SET_VERSION);

        if (!marks) {
          marks = Object.freeze(
            recordSetIds(saved)
              .flatMap((id) => {
                const record = readRecord(saved, id);

                return (record && markIn(id, record, copies)) ?? [];
              })
              .sort(byMark)
          );
          byCopies.set(copies ?? EMPTY_SET_VERSION, marks);
        }

        return marks;
      },
      /**
       * One passage per run of marked lines for the marks `ids` names, in
       * document order. On an unchanged single-copy block each run covers the
       * lines its marks touch plus one line on each side. On an edited or
       * multi-copy live block, folded marks are omitted and live attached
       * marks are grouped into live-block passages (`block` set).
       */
      passages: (ids: readonly string[]): readonly InkPassage[] => {
        const LIVE_CONTEXT_CHARS = 160;
        const LIVE_WHOLE_BLOCK_MAX = 400;

        const expandWordLeft = (text: string, at: number) => {
          let cursor = Math.max(0, at);

          while (cursor > 0 && !/\s/u.test(text[cursor - 1])) cursor -= 1;

          return cursor;
        };
        const expandWordRight = (text: string, at: number) => {
          let cursor = Math.min(text.length, at);

          while (cursor < text.length && !/\s/u.test(text[cursor])) cursor += 1;

          return cursor;
        };

        const matchedByBlock = new WeakMap<
          InkMarkBlock,
          ReturnType<typeof matchMarkBlock>
        >();
        const markList = [...new Set(ids)]
          .map((id) => read.mark(id))
          .filter((mark): mark is InkMark => {
            if (!mark) return false;
            if (mark.margin) return true;

            return mark.blocks.every((block) => {
              const saved = copy(block.copy);

              if (!saved) return false;

              const holder = readShownElementById(editor, saved.block);

              if (!holder) return true;

              const matched = matchMarkBlock(
                saved,
                block,
                inkText(state.schema, holder.node)
              );

              matchedByBlock.set(block, matched);

              return matched.kind !== 'changed';
            });
          });

        const byBlock = new Map<
          string,
          Array<{
            block: InkMarkBlock;
            copy: InkCopy;
            mark: InkMark;
          }>
        >();

        for (const mark of markList) {
          for (const block of mark.blocks) {
            const saved = copy(block.copy);

            if (!saved || saved.lines.length === 0) continue;

            const bucket = byBlock.get(saved.block) ?? [];

            bucket.push({ block, copy: saved, mark });
            byBlock.set(saved.block, bucket);
          }
        }

        const out: Array<{
          path: readonly number[] | undefined;
          passage: InkPassage;
        }> = [];

        const mapPassageMarks = (
          entries: ReadonlyArray<{
            mark: InkMark;
            run: Readonly<{ end: number; start: number }> | null;
          }>,
          words: readonly InkPassageWord[]
        ): InkPassageMark[] => {
          const byId = new Map<
            string,
            { gaps: Set<number>; mark: InkMark; words: Set<number> }
          >();

          for (const { mark, run } of entries) {
            let item = byId.get(mark.id);

            if (!item) {
              item = { gaps: new Set(), mark, words: new Set() };
              byId.set(mark.id, item);
            }
            if (!run) continue;
            if (run.end > run.start) {
              let touched = false;

              for (const [index, word] of words.entries()) {
                if (word.start < run.end && word.end > run.start) {
                  item.words.add(index);
                  touched = true;
                }
              }
              if (!touched) {
                const gap = words.findIndex((word) => run.start < word.end);

                item.gaps.add(gap === -1 ? words.length : gap);
              }
            } else {
              const gap = words.findIndex((word) => run.start < word.end);

              item.gaps.add(gap === -1 ? words.length : gap);
            }
          }

          return [...byId.values()]
            .sort((a, b) => byMark(a.mark, b.mark))
            .map(({ gaps, mark, words: markWords }): InkPassageMark => ({
              gaps: [...gaps].sort((a, b) => a - b),
              id: mark.id,
              ...(mark.margin ? { margin: mark.margin.side } : {}),
              words: [...markWords].sort((a, b) => a - b),
            }));
        };

        for (const [blockId, items] of byBlock) {
          const holder = readShownElementById(editor, blockId);
          const path = holder?.path;
          const now = holder ? inkText(state.schema, holder.node) : undefined;
          const copyIds = new Set(items.map((item) => item.copy.id));
          const allExactSingleCopy =
            copyIds.size === 1 && (!now || inkHolds(items[0].copy, now));

          if (allExactSingleCopy) {
            const saved = items[0].copy;
            const entries: Array<{
              hi: number;
              lo: number;
              mark: InkMark;
              run: InkRun | null;
            }> = [];

            for (const { block, mark } of items) {
              if (block.runs.length === 0) {
                const [from, to] = marginLineSpanOf(
                  saved.lines,
                  mark,
                  block.top
                );

                entries.push({
                  hi: Math.min(saved.lines.length - 1, to + 1),
                  lo: Math.max(0, from - 1),
                  mark,
                  run: null,
                });
                continue;
              }
              for (const run of block.runs) {
                const from = lineOf(saved.lines, run.start);
                const to =
                  run.end > run.start ? lineOf(saved.lines, run.end - 1) : from;

                entries.push({
                  hi: Math.min(saved.lines.length - 1, to + 1),
                  lo: Math.max(0, from - 1),
                  mark,
                  run,
                });
              }
            }

            entries.sort((a, b) => a.lo - b.lo || a.hi - b.hi);

            const groups: Array<{
              entries: typeof entries;
              hi: number;
              lo: number;
            }> = [];

            for (const entry of entries) {
              const last = groups.at(-1);

              if (last && entry.lo <= last.hi + 1) {
                last.hi = Math.max(last.hi, entry.hi);
                last.entries.push(entry);
              } else {
                groups.push({
                  entries: [entry],
                  hi: entry.hi,
                  lo: entry.lo,
                });
              }
            }

            for (const group of groups) {
              const start = lineStart(saved.lines, group.lo);
              const { end } = saved.lines[group.hi];
              const text = saved.text.slice(start, end);
              const words = inkPassageWords(text, start);

              out.push({
                passage: {
                  copy: saved.id,
                  marks: mapPassageMarks(group.entries, words),
                  start,
                  text,
                  words,
                },
                path,
              });
            }
            continue;
          }

          if (!now) continue;

          const liveEntries: Array<{
            copyId: string;
            hi: number;
            lo: number;
            mark: InkMark;
            run: Readonly<{ end: number; start: number }> | null;
          }> = [];

          for (const { block, copy: saved, mark } of items) {
            if (mark.margin) {
              const anchor = matchMarginBlock(saved, block, mark, now);
              const rawLo = anchor.liveStart ?? 0;
              const rawHi = anchor.liveEnd ?? now.text.length;
              const lo =
                now.text.length <= LIVE_WHOLE_BLOCK_MAX
                  ? 0
                  : expandWordLeft(now.text, rawLo - LIVE_CONTEXT_CHARS);
              const hi =
                now.text.length <= LIVE_WHOLE_BLOCK_MAX
                  ? now.text.length
                  : expandWordRight(now.text, rawHi + LIVE_CONTEXT_CHARS);

              liveEntries.push({
                copyId: saved.id,
                hi,
                lo,
                mark,
                run: null,
              });
              continue;
            }

            const matched =
              matchedByBlock.get(block) ?? matchMarkBlock(saved, block, now);

            if (matched.kind === 'changed') continue;
            for (const run of matched.runs) {
              const lo =
                now.text.length <= LIVE_WHOLE_BLOCK_MAX
                  ? 0
                  : expandWordLeft(now.text, run.start - LIVE_CONTEXT_CHARS);
              const hi =
                now.text.length <= LIVE_WHOLE_BLOCK_MAX
                  ? now.text.length
                  : expandWordRight(now.text, run.end + LIVE_CONTEXT_CHARS);

              liveEntries.push({
                copyId: saved.id,
                hi,
                lo,
                mark,
                run: { end: run.end, start: run.start },
              });
            }
          }

          if (liveEntries.length === 0) continue;

          liveEntries.sort((a, b) => a.lo - b.lo || a.hi - b.hi);

          const groups: Array<{
            copyId: string;
            entries: typeof liveEntries;
            hi: number;
            lo: number;
          }> = [];

          for (const entry of liveEntries) {
            const last = groups.at(-1);

            if (last && entry.lo <= last.hi + 1) {
              last.hi = Math.max(last.hi, entry.hi);
              last.entries.push(entry);
            } else {
              groups.push({
                copyId: entry.copyId,
                entries: [entry],
                hi: entry.hi,
                lo: entry.lo,
              });
            }
          }

          for (const group of groups) {
            const text = now.text.slice(group.lo, group.hi);
            const words = inkPassageWords(text, group.lo);

            out.push({
              passage: {
                block: blockId,
                copy: group.copyId,
                marks: mapPassageMarks(group.entries, words),
                start: group.lo,
                text,
                words,
              },
              path,
            });
          }
        }

        out.sort((a, b) => {
          if (a.path && b.path) {
            const cmp = PathApi.compare(a.path, b.path);

            if (cmp !== 0) return cmp;
          } else if (a.path || b.path) {
            return a.path ? -1 : 1;
          }
          if (a.passage.start !== b.passage.start) {
            return a.passage.start - b.passage.start;
          }

          return a.passage.copy < b.passage.copy
            ? -1
            : a.passage.copy > b.passage.copy
              ? 1
              : 0;
        });

        return out.map(({ passage }) => passage);
      },
      /**
       * Where the block of the copy saved under `copyId` stands now, or
       * `undefined` for a copy that is not saved. A deleted block's place
       * follows the saved places of deleted blocks to the nearest block left
       * before it, then after it.
       */
      place: (copyId: string): InkCopyPlace | undefined =>
        readInkPlace({ copy, editor, state }, copyId),
      /**
       * The live range for character offsets `[start, end]` in one saved copy's
       * text (returning `null` once the block is gone or its text or inline
       * voids differ from the copy) or in one live block's text when `block`
       * is provided.
       */
      range: (input: InkRangeInput): Range | null => {
        let holder: ReturnType<typeof readShownElementById>;

        if ('block' in input) {
          holder = readShownElementById(editor, input.block);
        } else {
          const saved = copy(input.copy);

          if (!saved) return null;
          holder = readShownElementById(editor, saved.block);
          if (!holder || !inkHolds(saved, inkText(state.schema, holder.node))) {
            return null;
          }
        }
        if (!holder) return null;

        return inkBlockRange(
          state.schema,
          holder.node,
          holder.path,
          input.start,
          input.end
        );
      },
      /** Every saved mark with no digitized record, oldest first, frozen. */
      shownMarks: () => {
        const digitized = version(DIGITIZED);
        if (!digitized) return read.marks();
        const saved = version(MARKS);
        const copies = version(COPIES);
        const byCopies = cached(
          shownMarkLists,
          saved ?? EMPTY_SET_VERSION,
          () => new WeakMap()
        );
        const byDigitized = cached(
          byCopies,
          copies ?? EMPTY_SET_VERSION,
          () => new WeakMap()
        );
        return cached(byDigitized, digitized, () =>
          Object.freeze(
            recordSetIds(saved)
              .flatMap((id) => {
                const record = isInkMarkShown(digitized, id)
                  ? readRecord(saved, id)
                  : undefined;
                return (record && markIn(id, record, copies)) ?? [];
              })
              .sort(byMark)
          )
        );
      },
    };

    return read;
  },
  update: ({ editor, tx }) => ({
    /**
     * Save one mark and each copy not saved yet, as one undo step, and
     * return the mark's id. Each sample saves rounded to a hundredth of a
     * pixel, a thousandth of pressure and a whole millisecond. Refuses
     * malformed input, and a sample whose hundredths of a pixel or
     * milliseconds pass a quarter of `Number.MAX_SAFE_INTEGER`, or a block
     * whose `voids` comes with no inline void in its `text`, writing nothing.
     * A block that leaves `voids` out takes the document block's, as
     * `InkMarkInput` says. A copy's block deleted by this update, by one of
     * the last four updates that deleted blocks, or while a stroke that
     * entered it was still unsaved, gets its place saved too. Each other
     * copy's block and the block on each side of it get theirs.
     */
    add: txStored((input: InkMarkInput) => {
      const { copies, mark } = encodeMark(
        input,
        readEditorAuthor(editor),
        (block, text) => {
          if (!text.includes(INK_VOID)) return undefined;

          const holder = tx.nodes.byId(block);
          const now = holder && inkText(tx.schema, holder.node);

          return now?.text === text ? now.voids : undefined;
        }
      );
      const points = encodeSamples(input.samples);
      const id = `m_${nanoid()}`;

      for (const copy of copies) {
        tx.records.put(COPIES, copy.id, copy.record);
      }
      tx.records.put(MARKS, id, { ...mark, points });

      return id;
    }),
    /**
     * Permanently drop digitized marks, their digitized records, and every
     * saved copy no remaining mark references, skipping undo history so purged
     * copies are never left dangling behind a restored mark. Omit `ids` to drop
     * every digitized mark; non-digitized and missing ids are skipped. Returns
     * the dropped mark ids.
     */
    dropDigitized: txLocate(false, (ids?: readonly string[]) => {
      const store = getValueRecords(tx.value());
      const marks = getRecordSetVersion(store, MARKS);
      const digitized = getRecordSetVersion(store, DIGITIZED);
      const copies = getRecordSetVersion(store, COPIES);
      const candidates =
        ids === undefined ? recordSetIds(digitized) : [...new Set(ids)];
      const toDrop = candidates.filter(
        (id) =>
          readRecord(marks, id) !== undefined &&
          readRecord(digitized, id) !== undefined
      );

      if (toDrop.length === 0) return [];

      tx.history.skip();

      const dropSet = new Set(toDrop);
      const usedCopies = new Set<string>();

      for (const id of recordSetIds(marks)) {
        if (dropSet.has(id)) continue;
        const record = readRecord(marks, id);

        if (!record) continue;
        for (const copyId of copiesOf(record) ?? []) {
          usedCopies.add(copyId);
        }
      }

      const staleCopies = new Set<string>();

      for (const id of toDrop) {
        const record = readRecord(marks, id);

        if (!record) continue;
        for (const copyId of copiesOf(record) ?? []) {
          if (!usedCopies.has(copyId) && readRecord(copies, copyId)) {
            staleCopies.add(copyId);
          }
        }
      }

      for (const id of toDrop) {
        tx.records.drop(MARKS, id);
        tx.records.drop(DIGITIZED, id);
      }
      for (const copyId of staleCopies) {
        tx.records.drop(COPIES, copyId);
      }

      return toDrop;
    }),
    /** Drop the marks `ids` names and their digitized records. Their copies stay. */
    remove: txLocate(false, (ids: readonly string[]) => {
      const digitized = getRecordSetVersion(
        getValueRecords(tx.value()),
        DIGITIZED
      );
      for (const id of new Set(ids)) {
        tx.records.drop(MARKS, id);
        if (readRecord(digitized, id)) tx.records.drop(DIGITIZED, id);
      }
    }),
    /** Mark or unmark `ids` as digitized, skipping missing or unchanged ids. */
    setDigitized: txStored((ids: readonly string[], value: boolean) => {
      const store = getValueRecords(tx.value());
      const marks = getRecordSetVersion(store, MARKS);
      const digitized = getRecordSetVersion(store, DIGITIZED);
      for (const id of new Set(ids)) {
        if (!readRecord(marks, id)) continue;
        const has = readRecord(digitized, id) !== undefined;
        if (value && !has) tx.records.put(DIGITIZED, id, {});
        else if (!value && has) tx.records.drop(DIGITIZED, id);
      }
    }),
  }),
});
