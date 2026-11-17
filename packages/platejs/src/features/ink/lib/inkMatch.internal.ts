import { ElementApi, type Node, TextApi } from '../../../facade';
import type { InkCopy, InkLine, InkMark, InkMarkBlock } from './BaseInkPlugin';

export type InkBox = Readonly<{
  height: number;
  left: number;
  top: number;
  width: number;
}>;

export type InkLiveBlock = Readonly<{
  box: InkBox;
  line: (offset: number) => InkLine | undefined;
  measure: (start: number, end: number) => InkBox | undefined;
  text: string;
}>;

export type InkMargins = Readonly<{ left: number; right: number }>;

export type InkSignReason = 'changed' | 'narrow';

export type InkPlacement =
  | Readonly<{ dx: number; dy: number; sign?: 'changed'; type: 'ink' }>
  | Readonly<{ reason: InkSignReason; type: 'sign' }>;

type Point = readonly [x: number, y: number];

const SUBPIXEL_DRIFT = 0.5;

const sign = (reason: InkSignReason): InkPlacement => ({
  reason,
  type: 'sign',
});

export const INK_VOID = String.fromCodePoint(0xff_fc);

const INK_RUNS = new RegExp(`[^\\s${INK_VOID}]+|${INK_VOID}`, 'gu');

/**
 * A block's text as ink reads it: its text, with each inline void as one
 * `INK_VOID`, so a mention the copy lacks changes the text.
 */
export const inkText = (
  schema: Readonly<{
    isInline: (node: Node) => boolean;
    isVoid: (node: Node) => boolean;
  }>,
  node: Node
): string => {
  if (TextApi.isText(node)) return node.text;
  if (!ElementApi.isElement(node)) return '';

  return node.children
    .map((child) =>
      ElementApi.isElement(child) &&
      schema.isInline(child) &&
      schema.isVoid(child)
        ? INK_VOID
        : inkText(schema, child)
    )
    .join('');
};

const SEGMENTED_SCRIPT =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}]/u;

let segmenter: Intl.Segmenter | undefined;

export const inkWords = (text: string) => {
  const words: Array<readonly [start: number, end: number]> = [];

  for (const { 0: run, index } of text.matchAll(INK_RUNS)) {
    if (!SEGMENTED_SCRIPT.test(run)) {
      words.push([index, index + run.length]);
      continue;
    }
    segmenter ??= new Intl.Segmenter('und', { granularity: 'word' });
    for (const { index: at, isWordLike, segment } of segmenter.segment(run)) {
      const start = index + at;
      const [last] = words.slice(-1);

      if (!isWordLike && last && last[0] >= index) {
        words[words.length - 1] = [last[0], start + segment.length];
      } else {
        words.push([start, start + segment.length]);
      }
    }
  }

  return words;
};

const pointToBox = ([x, y]: Point, box: InkBox) =>
  Math.hypot(
    Math.max(box.left - x, 0, x - box.left - box.width),
    Math.max(box.top - y, 0, y - box.top - box.height)
  );

const pointToSegment = ([x, y]: Point, [ax, ay]: Point, [bx, by]: Point) => {
  const length = (bx - ax) ** 2 + (by - ay) ** 2;
  const at =
    length === 0
      ? 0
      : Math.min(
          1,
          Math.max(0, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / length)
        );

  return Math.hypot(x - ax - at * (bx - ax), y - ay - at * (by - ay));
};

const segmentCrossesBox = ([ax, ay]: Point, [bx, by]: Point, box: InkBox) => {
  let low = 0;
  let high = 1;

  for (const [p, q] of [
    [ax - bx, ax - box.left],
    [bx - ax, box.left + box.width - ax],
    [ay - by, ay - box.top],
    [by - ay, box.top + box.height - ay],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
      continue;
    }

    const t = q / p;

    if (p < 0) low = Math.max(low, t);
    else high = Math.min(high, t);
    if (low > high) return false;
  }

  return true;
};

export const footprintEnters = (
  points: readonly Point[],
  radius: number,
  box: InkBox
) =>
  points.some((a, at) => {
    const b = points[at + 1] ?? a;

    return (
      segmentCrossesBox(a, b, box) ||
      Math.min(
        pointToBox(a, box),
        pointToBox(b, box),
        pointToSegment([box.left, box.top], a, b),
        pointToSegment([box.left + box.width, box.top], a, b),
        pointToSegment([box.left, box.top + box.height], a, b),
        pointToSegment([box.left + box.width, box.top + box.height], a, b)
      ) < radius
    );
  });

export const inkTouchedWords = (
  live: InkLiveBlock,
  points: readonly Point[],
  radius: number
) => {
  let low = Number.POSITIVE_INFINITY;
  let high = Number.NEGATIVE_INFINITY;

  for (const [, y] of points) {
    low = Math.min(low, y - radius);
    high = Math.max(high, y + radius);
  }

  const words = inkWords(live.text);
  const touched: Array<readonly [start: number, end: number]> = [];
  let next = 0;

  for (let start = 0; next < words.length;) {
    const line = live.line(start);

    if (!line || line.end <= start) return undefined;

    const top = live.box.top + line.top;

    if (top > high) break;
    if (top + line.height >= low) {
      for (let at = next; at < words.length && words[at][0] < line.end; at++) {
        const word = words[at];
        const box = live.measure(
          Math.max(word[0], start),
          Math.min(word[1], line.end)
        );

        if (!box) return undefined;
        if (
          touched.at(-1) !== word &&
          footprintEnters(points, radius, {
            ...box,
            left: live.box.left + box.left,
            top: live.box.top + box.top,
          })
        ) {
          touched.push(word);
        }
      }
    }
    while (next < words.length && words[next][1] <= line.end) next += 1;
    start = line.end;
  }

  return touched;
};

const lineStart = (lines: readonly InkLine[], index: number) =>
  index === 0 ? 0 : lines[index - 1].end;

const lineOf = (lines: readonly InkLine[], offset: number) => {
  const index = lines.findIndex((line) => offset < line.end);

  return index === -1 ? lines.length - 1 : index;
};

export const gapAround = (text: string, offset: number) => {
  let start = offset;
  let end = offset;

  while (start > 0 && /\s/.test(text[start - 1])) start -= 1;
  while (end < text.length && /\s/.test(text[end])) end += 1;

  return [start, end] as const;
};

const markedLines = (
  copy: InkCopy,
  block: InkMarkBlock,
  points: readonly Point[],
  radius: number
) => {
  const marked = new Set(
    block.runs.map((run) => lineOf(copy.lines, run.start))
  );

  for (const [index, line] of copy.lines.entries()) {
    const box = {
      ...line,
      left: block.left + line.left,
      top: block.top + line.top,
    };

    if (footprintEnters(points, radius, box)) marked.add(index);
  }

  return marked;
};

const copyHolds = (
  copy: InkCopy,
  block: InkMarkBlock,
  live: InkLiveBlock,
  lines: ReadonlySet<number>
) => {
  for (const index of lines) {
    const saved = copy.lines[index];
    const start = lineStart(copy.lines, index);
    const now = live.line(start);
    const tolerance = saved.height / 8;

    if (
      !now ||
      now.end !== saved.end ||
      (start > 0 && live.line(start - 1)?.end !== start) ||
      Math.abs(now.top - saved.top) > tolerance ||
      Math.abs(now.height - saved.height) > tolerance
    ) {
      return false;
    }
  }

  return block.runs.every((run) => {
    const tolerance = copy.lines[lineOf(copy.lines, run.start)].height / 8;
    const savedLeft = block.left + run.left;

    if (run.start === run.end) {
      const [start, end] = gapAround(copy.text, run.start);
      const gap = live.measure(start, end);

      if (!gap) return false;

      const half = end > start ? gap.width / 2 : tolerance;

      return (
        Math.abs(
          savedLeft + run.width / 2 - (live.box.left + gap.left + gap.width / 2)
        ) <= half
      );
    }

    const now = live.measure(run.start, run.end);

    return (
      now !== undefined &&
      Math.abs(live.box.left + now.left - savedLeft) <= tolerance &&
      Math.abs(now.width - run.width) <= tolerance
    );
  });
};

export const placeMark = ({
  copies,
  live,
  margins,
  mark,
  nearby,
}: Readonly<{
  copies: readonly InkCopy[];
  live: ReadonlyArray<InkLiveBlock | undefined>;
  margins: InkMargins;
  mark: InkMark;
  nearby: readonly InkBox[];
}>): InkPlacement => {
  const points = mark.samples.map(([x, y]): Point => [x, y]);
  const radius = mark.brush.size / 2;
  const blocks = mark.blocks.flatMap((block, index) => {
    const now = live[index];

    return now ? [{ block, copy: copies[index], now }] : [];
  });
  const clear = (dx: number, dy: number): InkPlacement =>
    nearby.some((box) =>
      footprintEnters(points, radius, {
        ...box,
        left: box.left - dx,
        top: box.top - dy,
      })
    )
      ? sign('changed')
      : { dx, dy, type: 'ink' };

  if (blocks.length < mark.blocks.length) return sign('changed');
  if (mark.margin) {
    const [{ block, copy, now }] = blocks;
    const { reach, side } = mark.margin;

    if (reach > margins[side]) return sign('narrow');

    const placement = clear(
      side === 'left'
        ? now.box.left - block.left
        : now.box.left + now.box.width - block.left - copy.width,
      now.box.top - block.top
    );

    return placement.type === 'ink' && now.text !== copy.text
      ? { ...placement, sign: 'changed' }
      : placement;
  }
  if (mark.direction === 'rtl') return sign('changed');

  const shifts: number[] = [];

  for (const { block, copy, now } of blocks) {
    if (now.text !== copy.text) return sign('changed');
    if (
      !copyHolds(copy, block, now, markedLines(copy, block, points, radius))
    ) {
      return sign('changed');
    }
    shifts.push(now.box.top - block.top);
  }

  const [dy] = shifts;
  const heights = blocks.flatMap(({ copy }) =>
    copy.lines.map((line) => line.height)
  );
  const tolerance = (heights.length > 0 ? Math.min(...heights) : 1) / 8;

  if (!shifts.every((shift) => Math.abs(shift - dy) <= tolerance)) {
    return sign('changed');
  }

  const moved = points.map(([x, y]): Point => [x, y + dy]);
  const unheldReach = Math.max(0, radius - SUBPIXEL_DRIFT);

  for (const { block, now } of blocks) {
    const touched = inkTouchedWords(now, moved, unheldReach);

    if (
      !touched ||
      touched.some(
        ([start, end]) =>
          !block.runs.some((run) => run.start < end && run.end > start)
      )
    ) {
      return sign('changed');
    }
  }

  return clear(0, dy);
};
