import { nanoid } from 'nanoid';

import { definePlugin, ElementIdPlugin, txLocate } from '../../../core';
import { defineRuntimePlugin } from '../../../facade';
import { readEditorAuthor } from '../../../lib/editor/editorUser.internal';

/** Which way a mark's text runs. */
export type InkDirection = 'ltr' | 'rtl';

/** The pen a mark was drawn with. `opacity` runs from 0 to 1. */
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

/** What `add` saves: one pen contact, measured on the blocks it crosses. */
export type InkMarkInput = Readonly<{
  at: number;
  blocks: readonly InkBlockInput[];
  brush: InkBrush;
  direction: InkDirection;
  margin?: InkMargin;
  samples: readonly InkSample[];
}>;

const MARKS = 'ink-marks';
const COPIES = 'ink-copies';
const GONE = 'ink-gone';

const inkRecords = defineRuntimePlugin('ink-records', {
  schema: {
    records: {
      [COPIES]: { history: 'retain' },
      [GONE]: { history: 'retain' },
      [MARKS]: {},
    },
  },
});

class InkRefusalError extends TypeError {
  override name = 'InkRefusalError';
}

const refuse = (message: string): never => {
  throw new InkRefusalError(`Ink mark refused: ${message}.`);
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
  const numbers: number[] = [];
  let time = 0;

  if (samples.length === 0) refuse('a mark needs at least one sample');
  for (const [at, sample] of samples.entries()) {
    const name = `samples[${at}]`;

    if (!Array.isArray(sample) || sample.length !== 4) {
      refuse(`${name} must be [x, y, pressure, time]`);
    }
    numbers.push(
      numberIn(sample[0], `${name} x`),
      numberIn(sample[1], `${name} y`),
      numberIn(sample[2], `${name} pressure`, 0, 1)
    );
    time = numberIn(sample[3], `${name} time`, time);
    numbers.push(time);
  }

  return numbers.join(' ');
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

const encodeMark = (input: InkMarkInput, author: string) => {
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
    const record =
      typeof block === 'object' && block !== null
        ? copyRecord(block, `blocks[${at}]`)
        : refuse(`blocks[${at}] must be an object`);

    return { id: `c_${digest(JSON.stringify(record))}`, record };
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
      ? { runs }
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
      copies: copies.map((copy) => copy.id),
      direction: directionIn(input.direction),
      opacity: numberIn(brush.opacity, 'brush.opacity', 0, 1),
      origins,
      points: encodeSamples(input.samples),
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
    if (error instanceof InkRefusalError) return undefined;
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

const savedNumbers = (value: unknown, name: string, stride: number) => {
  const numbers = listIn<unknown>(value, name);

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
    const { block, height, text, width } = copyRecord(
      { ...record, lines },
      'copy'
    );

    return { block, height, id, lines, text, width };
  });

const decodeMark = (
  id: string,
  record: SavedRecord,
  copyOf: (id: string) => InkCopy | undefined
): InkMark | undefined =>
  readSaved(() => {
    const copies = listIn<unknown>(record.copies, 'copies').map(
      (copy, at) =>
        (typeof copy === 'string' && copyOf(copy)) ||
        refuse(`copies[${at}] must name a saved copy`)
    );
    const origins = savedNumbers(record.origins, 'origins', 2);
    const runs =
      record.runs === undefined ? [] : savedNumbers(record.runs, 'runs', 5);
    const points = savedNumbers(
      typeof record.points === 'string'
        ? record.points.split(' ').map(Number)
        : undefined,
      'points',
      4
    );
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
      samples: groupsOf(points, 4, (at): InkSample => [
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
      author
    ).mark;

    if (!sameFields(written, record)) {
      refuse('a saved mark must be what add writes');
    }

    return { ...mark, author, blocks, id };
  });

/**
 * Pen marks on a document's text, saved as records of the document value.
 * Its updates add and remove marks, and its reads return them decoded. It
 * turns on block ids, because a mark names its blocks by id.
 */
export const BaseInkPlugin = definePlugin('ink', {
  dependencies: [inkRecords, ElementIdPlugin],
  read: ({ state }) => {
    const set = (name: string) => state.value().records?.[name];
    const copyReader = () => {
      const saved = set(COPIES);
      const decoded = new Map<string, InkCopy | undefined>();

      return (id: string) => {
        if (!decoded.has(id)) {
          const record = saved?.[id];

          decoded.set(id, record && decodeCopy(id, record));
        }

        return decoded.get(id);
      };
    };

    return {
      /** The copy saved under `id`, or `undefined`. */
      copy: (id: string) => copyReader()(id),
      /** The mark saved under `id`, or `undefined`. */
      mark: (id: string) => {
        const record = set(MARKS)?.[id];

        return record && decodeMark(id, record, copyReader());
      },
      /** Every saved mark, oldest first. */
      marks: () => {
        const copyOf = copyReader();

        return Object.entries(set(MARKS) ?? {})
          .flatMap(([id, record]) => decodeMark(id, record, copyOf) ?? [])
          .sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1));
      },
    };
  },
  update: ({ editor, tx }) => ({
    /**
     * Save one mark and each copy not saved yet, as one undo step, and
     * return the mark's id. Refuses malformed input, writing nothing.
     */
    add: txLocate(false, (input: InkMarkInput) => {
      const { copies, mark } = encodeMark(input, readEditorAuthor(editor));
      const id = `m_${nanoid()}`;

      for (const copy of copies) tx.records.put(COPIES, copy.id, copy.record);
      tx.records.put(MARKS, id, mark);

      return id;
    }),
    /** Drop the marks `ids` names. Their copies stay. */
    remove: txLocate(false, (ids: readonly string[]) => {
      for (const id of ids) tx.records.drop(MARKS, id);
    }),
  }),
});
