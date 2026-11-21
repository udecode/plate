import { nanoid } from 'nanoid';

import { definePlugin, ElementIdPlugin, txLocate } from '../../../core';
import {
  defineRuntimePlugin,
  getDocumentValueNode,
  type NodeKey,
} from '../../../facade';
import { readEditorAuthor } from '../../../lib/editor/editorUser.internal';
import {
  decodePoints,
  encodePoints,
  isInkRefusal,
  refuse,
  roundSample,
} from './inkCodec.internal';
import {
  addGone,
  captureGone,
  flushGone,
  GONE,
  hasPendingGone,
  idOf,
  type SavedRecords,
} from './inkGone.internal';
import {
  advanceInkPlaces,
  COPIES,
  MARKS,
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
 * Thai splits into the words `Intl.Segmenter` finds.
 */
export type InkMarkInput = Readonly<{
  at: number;
  blocks: readonly InkBlockInput[];
  brush: InkBrush;
  direction: InkDirection;
  margin?: InkMargin;
  samples: readonly InkSample[];
}>;

/** A Draw tool: the brush its marks are drawn with. */
export type InkTool = Readonly<{ brush: InkBrush; type: 'draw' }>;

/**
 * What one view shows and does with ink: the tool a pen draws with, or
 * `null` when drawing is off, whether ink and signs are hidden, and the ids
 * of the marks picked.
 */
export type InkViewState = {
  hidden: boolean;
  picked: readonly string[];
  tool: InkTool | null;
};

/**
 * Where a deleted block's sign sits: after or before a block still in the
 * document, or on the document-start rail when none is left.
 */
export type InkSignPlace =
  | Readonly<{ at: 'after' | 'before'; key: NodeKey }>
  | Readonly<{ at: 'start' }>;

/**
 * Where a copy's block stands now. `live` while the block that holds the
 * copy's id holds its text, `changed` while it holds other text, and `gone`
 * when no block holds the id.
 */
export type InkCopyPlace =
  | Readonly<{ key: NodeKey; kind: 'changed' | 'live' }>
  | Readonly<{ beside: InkSignPlace; kind: 'gone' }>;

const copiesOf = ({ copies }: Readonly<Record<string, unknown>>) => {
  const ids =
    typeof copies === 'string'
      ? copies.split(' ')
      : Array.isArray(copies)
        ? copies
        : [];

  return ids.length > 0 &&
    ids.every((id): id is string => typeof id === 'string' && id !== '')
    ? ids
    : null;
};

const beta2MayUndoTo = (id: string) => id.startsWith('c_');

const inkRecords = defineRuntimePlugin('ink-records', {
  schema: {
    records: {
      [COPIES]: {
        history: 'retain',
        namedBy: { keep: beta2MayUndoTo, names: copiesOf, set: MARKS },
      },
      [GONE]: { history: 'retain' },
      [MARKS]: {},
    },
  },
  update: ({ editor, tx }) => ({
    flush: txLocate(false, () => {
      flushGone(editor, tx, (id) => isNamed(tx.value().records, id));
    }),
  }),
});

const NO_RECORDS: SavedRecords[string] = {};
const namedCache = new WeakMap<object, ReadonlySet<string>>();

const idsIn = (set: SavedRecords[string], fields: readonly string[]) => {
  let ids = namedCache.get(set);

  if (!ids) {
    const found = new Set<string>();

    for (const record of Object.values(set)) {
      for (const field of fields) {
        const id = record[field];

        if (typeof id === 'string') found.add(id);
      }
    }
    ids = found;
    namedCache.set(set, ids);
  }

  return ids;
};

const isNamed = (records: SavedRecords | undefined, id: string) =>
  idsIn(records?.[COPIES] ?? NO_RECORDS, ['block']).has(id) ||
  idsIn(records?.[GONE] ?? NO_RECORDS, ['next', 'previous']).has(id);

const decodedCopies = new WeakMap<object, Map<string, InkCopy | undefined>>();

const decodedMarks = new WeakMap<object, WeakMap<object, readonly InkMark[]>>();

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

type SavedShape = 'beta2' | 'packed';

const encodeSamples = (input: unknown, shape: SavedShape) => {
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

  return shape === 'packed'
    ? encodePoints(checked.map(roundSample))
    : checked.flat().join(' ');
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
    width: numberIn(copy.width, `${name}.width`, 0),
  };
};

const encodeMark = (
  input: InkMarkInput,
  author: string,
  shape: SavedShape = 'packed'
) => {
  const list = <T>(values: readonly T[]) =>
    shape === 'packed' ? values.join(' ') : values;
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
      width,
    } = typeof block === 'object' && block !== null
      ? copyRecord(block, `blocks[${at}]`)
      : refuse(`blocks[${at}] must be an object`);
    const record = { block: id, height, lines: list(lines), text, width };

    return {
      id: `${shape === 'packed' ? 'p' : 'c'}_${digest(JSON.stringify(record))}`,
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

// cyrb53's mixing (public domain, bryc).
const digest = (text: string) => {
  let h1 = 0xde_ad_be_ef;
  let h2 = 0x41_c6_ce_57;

  for (let at = 0; at < text.length; at++) {
    const code = text.charCodeAt(at);

    h1 = Math.imul(h1 ^ code, 2_654_435_761);
    h2 = Math.imul(h2 ^ code, 1_597_334_677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2_246_822_507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3_266_489_909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2_246_822_507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3_266_489_909);

  const hex = (value: number) => (value >>> 0).toString(16).padStart(8, '0');

  return hex(h2) + hex(h1);
};

type SavedRecord = Readonly<Record<string, unknown>>;

const readSaved = <T>(read: () => T): T | undefined => {
  try {
    return read();
  } catch (error) {
    if (isInkRefusal(error)) return undefined;
    throw error;
  }
};

const sameFields = (encoded: SavedRecord, saved: SavedRecord) =>
  Object.entries(encoded).every(([key, value]) => {
    const other = saved[key];

    return Array.isArray(value) && Array.isArray(other)
      ? value.length === other.length &&
          value.every((item, at) => item === other[at])
      : value === other;
  });

const savedList = (value: unknown, name: string) =>
  typeof value === 'string'
    ? value === ''
      ? []
      : value.split(' ')
    : listIn<unknown>(value, name);

const savedNumbers = (value: unknown, name: string, stride: number) => {
  const numbers = savedList(value, name).map((number) =>
    typeof number === 'string' ? Number(number) : number
  );

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
    const numbers = savedNumbers(record.lines, 'lines', 5);
    const lines = groupsOf(numbers, 5, (at) => ({
      end: numbers[at],
      height: numbers[at + 4],
      left: numbers[at + 1],
      top: numbers[at + 2],
      width: numbers[at + 3],
    }));
    const { block, height, text, width, ...written } = copyRecord(
      { ...record, lines },
      'copy'
    );

    if (
      typeof record.lines === 'string' &&
      written.lines.join(' ') !== record.lines
    ) {
      refuse('a saved copy must be what add writes');
    }

    return frozen({ block, height, id, lines, text, width });
  });

const decodeMark = (
  id: string,
  record: SavedRecord,
  copyOf: (id: string) => InkCopy | undefined
): InkMark | undefined =>
  readSaved(() => {
    const shape: SavedShape =
      typeof record.copies === 'string' ? 'packed' : 'beta2';
    const copies = savedList(record.copies, 'copies').map(
      (copy, at) =>
        (typeof copy === 'string' && copyOf(copy)) ||
        refuse(`copies[${at}] must name a saved copy`)
    );
    const origins = savedNumbers(record.origins, 'origins', 2);
    const runs =
      record.runs === undefined ? [] : savedNumbers(record.runs, 'runs', 5);
    const points =
      shape === 'packed' ? [] : savedNumbers(record.points, 'points', 4);
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
      samples:
        shape === 'packed'
          ? decodePoints(textIn(record.points, 'points'))
          : groupsOf(points, 4, (at): InkSample => [
              points[at],
              points[at + 1],
              points[at + 2],
              points[at + 3],
            ]),
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
          width: copies[index].width,
        })),
      },
      author,
      shape
    ).mark;

    if (
      !sameFields(written, record) ||
      (shape === 'beta2' &&
        encodeSamples(mark.samples, 'beta2') !== record.points)
    ) {
      refuse('a saved mark must be what add writes');
    }

    return frozen({ ...mark, author, blocks, id });
  });

/**
 * Pen marks on a document's text, saved as records of the document value.
 * Its updates add and remove marks, and its reads return them decoded and say
 * where each copy's block stands. It turns on block ids, because a mark names
 * its blocks by id, and saves where a deleted block stood in the update that
 * deletes it.
 */
export const BaseInkPlugin = definePlugin('ink', {
  corrections: [
    {
      event: 'children',
      query: 'root',
      correct: ({ editor, tx }) => {
        if (hasPendingGone(editor)) tx['ink-records'].flush();
      },
    },
    {
      event: 'properties',
      query: 'root',
      correct: ({ editor, tx }) => {
        if (hasPendingGone(editor)) tx['ink-records'].flush();
      },
    },
  ],
  dependencies: [inkRecords, ElementIdPlugin],
  initialViewState: (): InkViewState => ({
    hidden: false,
    picked: [],
    tool: null,
  }),
  on: {
    commit: ({ commit, editor }) => {
      advanceInkPlaces(editor, commit);
    },
    transactionChange: ({ after, before, changed, editor, tx }) => {
      if (!changed.has('structure') && !changed.has('properties')) return;
      for (const { node, path } of changed.removed()) {
        const id = idOf(node);

        if (id) captureGone(editor, tx.tags, after, { gap: path, id });
      }
      if (changed.has('structure')) return;
      for (const path of changed.paths()) {
        const id = idOf(getDocumentValueNode(before, path));

        if (id && id !== idOf(getDocumentValueNode(after, path))) {
          captureGone(editor, tx.tags, after, { gap: path, id });
        }
      }
    },
  },
  read: ({ editor, state }) => {
    const set = (name: string) => state.value().records?.[name];
    const copyReader = (saved = set(COPIES) ?? NO_RECORDS) => {
      const decoded =
        decodedCopies.get(saved) ?? new Map<string, InkCopy | undefined>();

      decodedCopies.set(saved, decoded);

      return (id: string) => {
        if (!decoded.has(id)) {
          const record = saved[id];

          decoded.set(id, record && decodeCopy(id, record));
        }

        return decoded.get(id);
      };
    };
    const copy = (id: string) => copyReader()(id);

    return {
      /** The copy saved under `id`, or `undefined`. */
      copy,
      /** The mark saved under `id`, or `undefined`. */
      mark: (id: string) => {
        const record = set(MARKS)?.[id];

        return record && decodeMark(id, record, copyReader());
      },
      /**
       * Every saved mark, oldest first, frozen, as the same list while the
       * saved marks and copies stay the same.
       */
      marks: () => {
        const saved = set(MARKS) ?? NO_RECORDS;
        const copies = set(COPIES) ?? NO_RECORDS;
        let byCopies = decodedMarks.get(saved);

        if (!byCopies) {
          byCopies = new WeakMap();
          decodedMarks.set(saved, byCopies);
        }

        let marks = byCopies.get(copies);

        if (!marks) {
          const copyOf = copyReader(copies);

          marks = Object.freeze(
            Object.entries(saved)
              .flatMap(([id, record]) => decodeMark(id, record, copyOf) ?? [])
              .sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1))
          );
          byCopies.set(copies, marks);
        }

        return marks;
      },
      /**
       * Where the block of the copy saved under `copyId` stands now, or
       * `undefined` for a copy that is not saved. A deleted block's place
       * follows the saved places of deleted blocks to the nearest block left
       * before it, then after it.
       */
      place: (copyId: string): InkCopyPlace | undefined =>
        readInkPlace({ copy, editor, state }, copyId),
    };
  },
  update: ({ editor, tx }) => ({
    /**
     * Save one mark and each copy not saved yet, as one undo step, and
     * return the mark's id. Each sample saves rounded to a hundredth of a
     * pixel, a thousandth of pressure and a whole millisecond. Refuses
     * malformed input, and a sample whose hundredths of a pixel or
     * milliseconds pass a quarter of `Number.MAX_SAFE_INTEGER`, writing
     * nothing. A copy's
     * block deleted by this update, by one of the last four updates that
     * deleted blocks, or while a stroke that entered it was still unsaved,
     * gets its place saved too.
     */
    add: txLocate(false, (input: InkMarkInput) => {
      const { copies, mark } = encodeMark(input, readEditorAuthor(editor));
      const points = encodeSamples(input.samples, 'packed');
      const id = `m_${nanoid()}`;

      for (const copy of copies) {
        tx.records.put(COPIES, copy.id, copy.record);
        addGone(editor, tx, copy.record.block);
      }
      tx.records.put(MARKS, id, { ...mark, points });

      return id;
    }),
    /** Drop the marks `ids` names. Their copies stay. */
    remove: txLocate(false, (ids: readonly string[]) => {
      for (const id of ids) tx.records.drop(MARKS, id);
    }),
  }),
});
