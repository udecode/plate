import {
  type Editor,
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  TextApi,
} from '../../../core';
import type { ComboboxState } from './combobox';

type ComboboxRead = Pick<Editor['read'], 'nodes' | 'text'>;

export type TypedInsertion = Readonly<{ caret: Point; length: number }>;

const stateless = (pattern: RegExp) =>
  pattern.global || pattern.sticky
    ? new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, ''))
    : pattern;

const rootOf = (point: Point) => point.root ?? 'main';

const readTextBeforeCaret = (
  read: ComboboxRead,
  caret: Point,
  length: number
) => {
  const parent = PathApi.parent(caret.path);
  const leaves: Array<{ path: number[]; start: number; text: string }> = [];
  let collected = 0;

  for (
    let index = caret.path.at(-1) ?? 0;
    index >= 0 && collected < length;
    index -= 1
  ) {
    const path = [...parent, index];
    const node = read.nodes.get(path)?.[0];

    if (!TextApi.isText(node)) break;

    const end = leaves.length === 0 ? caret.offset : node.text.length;
    const start = Math.max(0, end - (length - collected));

    leaves.push({ path, start, text: node.text.slice(start, end) });
    collected += end - start;
  }

  leaves.reverse();

  const text = leaves.map((leaf) => leaf.text).join('');
  const pointAt = (offset: number): Point => {
    let rest = offset;

    for (const leaf of leaves) {
      if (rest <= leaf.text.length) {
        return { ...caret, offset: leaf.start + rest, path: leaf.path };
      }

      rest -= leaf.text.length;
    }

    return caret;
  };

  return { pointAt, text };
};

export const isComboboxQuery = (query: string, state: ComboboxState) => {
  const triggerWasProse = /^\s/.test(query);

  if (query.length > state.maxQueryLength || triggerWasProse) return false;

  const pattern = state.queryPattern ? stateless(state.queryPattern) : null;

  for (const char of query) {
    if (char === '\n' || (pattern && !pattern.test(char))) return false;
  }

  return true;
};

const longestTrigger = (trigger: ComboboxState['trigger']) =>
  trigger instanceof RegExp
    ? 1
    : Math.max(0, ...[trigger].flat().map((candidate) => candidate.length));

const textRunLength = (read: ComboboxRead, from: Point, to: Point) => {
  const parent = PathApi.parent(to.path);
  const first = from.path.at(-1) ?? 0;
  const last = to.path.at(-1) ?? 0;
  let length = 0;

  for (let index = first; index <= last; index += 1) {
    const node = read.nodes.get([...parent, index])?.[0];

    if (!TextApi.isText(node)) return null;

    length +=
      (index === last ? to.offset : node.text.length) -
      (index === first ? from.offset : 0);
  }

  return length;
};

const findLastTrigger = (
  text: string,
  typedFrom: number,
  trigger: ComboboxState['trigger']
) => {
  if (trigger instanceof RegExp) {
    const pattern = stateless(trigger);
    let end = text.length;

    for (const char of Array.from(text.slice(typedFrom)).reverse()) {
      end -= char.length;
      if (pattern.test(char)) return { end: end + char.length, start: end };
    }

    return null;
  }

  let best: { end: number; start: number } | null = null;

  for (const candidate of [trigger].flat()) {
    const start = candidate ? text.lastIndexOf(candidate) : -1;
    const end = start + candidate.length;

    if (
      start >= 0 &&
      end > typedFrom &&
      (!best || start > best.start || (start === best.start && end > best.end))
    ) {
      best = { end, start };
    }
  }

  return best;
};

export const findTypedTrigger = (
  read: ComboboxRead,
  { caret, length }: TypedInsertion,
  state: ComboboxState
): Range | null => {
  const run = readTextBeforeCaret(
    read,
    caret,
    length + longestTrigger(state.trigger) + 1
  );
  const found = findLastTrigger(
    run.text,
    Math.max(0, run.text.length - length),
    state.trigger
  );

  if (!found) return null;

  const start = run.pointAt(found.start);

  if (state.triggerPreviousCharPattern) {
    // The run stops at a block start or an inline element's edge, where the
    // previous character is ''.
    const previousChar =
      found.start > 0 ? run.text.slice(found.start - 1, found.start) : '';

    if (!stateless(state.triggerPreviousCharPattern).test(previousChar)) {
      return null;
    }
  }

  return { anchor: start, focus: run.pointAt(found.end) };
};

export const readComboboxQuery = (
  read: ComboboxRead,
  {
    caret,
    typedExtentEnd,
    trigger,
    triggerText,
  }: Readonly<{
    caret: Point;
    typedExtentEnd: Point;
    trigger: Range;
    triggerText: string;
  }>,
  state: ComboboxState
): string | null => {
  const [start, end] = RangeApi.edges(trigger);

  if (
    rootOf(start) !== rootOf(caret) ||
    !PathApi.equals(PathApi.parent(start.path), PathApi.parent(caret.path)) ||
    PointApi.isBefore(caret, end) ||
    PointApi.isAfter(caret, typedExtentEnd)
  ) {
    return null;
  }

  const runLength = textRunLength(read, start, caret);

  if (
    runLength === null ||
    runLength - triggerText.length > state.maxQueryLength ||
    read.text.string(trigger) !== triggerText
  ) {
    return null;
  }

  const query = read.text.string({ anchor: end, focus: caret });

  return isComboboxQuery(query, state) ? query : null;
};
