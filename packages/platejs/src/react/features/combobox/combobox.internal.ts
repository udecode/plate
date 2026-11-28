import {
  PathApi,
  type Point,
  PointApi,
  type Range,
  RangeApi,
  TextApi,
} from '../../../core';
import type { Editor } from '../../editor';

type ComboboxRead = Pick<Editor['read'], 'nodes' | 'text'>;

export type ComboboxPolicy = Readonly<{
  label: string;
  maxQueryLength: number;
  queryPattern: RegExp | null;
  trigger: string;
  triggerPreviousCharPattern: RegExp | null;
  triggerQuery: ((editor: Editor) => boolean) | null;
}>;

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

export const isComboboxQuery = (query: string, policy: ComboboxPolicy) => {
  const triggerWasProse = /^\s/.test(query);

  if (query.length > policy.maxQueryLength || triggerWasProse) return false;

  const pattern = policy.queryPattern ? stateless(policy.queryPattern) : null;

  for (const char of query) {
    if (char === '\n' || (pattern && !pattern.test(char))) return false;
  }

  return true;
};

const readTriggerAndQuery = (
  read: ComboboxRead,
  start: Point,
  end: Point,
  caret: Point,
  maxTotalLength: number
) => {
  const parent = PathApi.parent(caret.path);
  const first = start.path.at(-1) ?? 0;
  const endLeaf = end.path.at(-1) ?? 0;
  const last = caret.path.at(-1) ?? 0;
  let total = 0;
  let triggerLen = 0;
  const parts: string[] = [];

  for (let index = first; index <= last; index += 1) {
    const node = read.nodes.get([...parent, index])?.[0];

    if (!TextApi.isText(node)) return null;

    const from = index === first ? start.offset : 0;
    const to = index === last ? caret.offset : node.text.length;
    const sliceLen = to - from;

    total += sliceLen;
    if (total > maxTotalLength) return null;

    if (index < endLeaf) {
      triggerLen += sliceLen;
    } else if (index === endLeaf) {
      triggerLen += end.offset - from;
    }

    parts.push(node.text.slice(from, to));
  }

  const run = parts.join('');

  return {
    query: run.slice(triggerLen),
    trigger: run.slice(0, triggerLen),
  };
};

const findLastTrigger = (text: string, typedFrom: number, trigger: string) => {
  if (!trigger) return null;

  const start = text.lastIndexOf(trigger);
  const end = start + trigger.length;

  return start !== -1 && end > typedFrom ? { end, start } : null;
};

export const findTypedTrigger = (
  read: ComboboxRead,
  { caret, length }: TypedInsertion,
  policy: ComboboxPolicy
): Range | null => {
  if (!policy.trigger) return null;

  const run = readTextBeforeCaret(
    read,
    caret,
    length + policy.trigger.length + 1
  );
  const found = findLastTrigger(
    run.text,
    Math.max(0, run.text.length - length),
    policy.trigger
  );

  if (!found) return null;

  const start = run.pointAt(found.start);

  if (policy.triggerPreviousCharPattern) {
    // The run stops at a block start or an inline element's edge, where the
    // previous character is ''.
    const previousChar =
      found.start > 0 ? run.text.slice(found.start - 1, found.start) : '';

    if (!stateless(policy.triggerPreviousCharPattern).test(previousChar)) {
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
  policy: ComboboxPolicy
): string | null => {
  const [start, end] = RangeApi.edges(trigger);

  if (
    policy.trigger !== triggerText ||
    rootOf(start) !== rootOf(caret) ||
    !PathApi.equals(PathApi.parent(start.path), PathApi.parent(caret.path)) ||
    PointApi.isBefore(caret, end) ||
    PointApi.isAfter(caret, typedExtentEnd)
  ) {
    return null;
  }

  const run = readTriggerAndQuery(
    read,
    start,
    end,
    caret,
    triggerText.length + policy.maxQueryLength
  );

  if (!run || run.trigger !== triggerText) return null;

  return isComboboxQuery(run.query, policy) ? run.query : null;
};
