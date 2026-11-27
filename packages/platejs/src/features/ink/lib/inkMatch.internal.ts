import {
  type Point as EditorPoint,
  type Element,
  ElementApi,
  type Node,
  type Path,
  type Range,
  TextApi,
} from '../../../facade';
import type {
  InkCopy,
  InkLine,
  InkMark,
  InkMarkBlock,
  InkPassageWord,
  InkSample,
} from './BaseInkPlugin';
import {
  gapAround,
  INK_VOID,
  type InkMatchedRun,
  type InkText,
  inkHolds,
  lineOf,
  lineStart,
  matchMarginBlock,
  matchMarkBlock,
} from './inkAnchor.internal';
import { digest } from './inkCodec.internal';
import { reflowInlineMark, reflowMarginMark } from './inkReflow.internal';

export { gapAround, INK_VOID, type InkText, inkHolds, lineOf, lineStart };

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
  voids?: string;
}>;

export type InkMargins = Readonly<{ left: number; right: number }>;

export type InkSignReason = 'changed' | 'narrow';

export type InkPlacement =
  | Readonly<{
      dx: number;
      dy: number;
      sign?: 'changed';
      strokes?: ReadonlyArray<readonly InkSample[]>;
      type: 'ink';
    }>
  | Readonly<{ reason: InkSignReason; type: 'sign' }>;

type Point = readonly [x: number, y: number];

const SUBPIXEL_DRIFT = 0.5;

const sign = (reason: InkSignReason): InkPlacement => ({
  reason,
  type: 'sign',
});

const INK_RUNS = new RegExp(`[^\\s${INK_VOID}]+|${INK_VOID}`, 'gu');

const textsBySchema = new WeakMap<object, WeakMap<Node, InkText>>();

const sortedKeys = (_: string, value: unknown) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value).sort(([a], [b]) => (a < b ? -1 : 1))
      )
    : value;

type InkSchema = Readonly<{
  identity: () => object;
  isInline: (node: Node) => boolean;
  isVoid: (node: Node) => boolean;
  property: (
    query: Readonly<{ key: string; placement: 'element'; type?: string }>
  ) => Readonly<{ role: string }> | null;
}>;

const voidEntry = (schema: InkSchema, child: Element, at: number) => {
  const type = typeof child.type === 'string' ? child.type : undefined;
  const content = Object.fromEntries(
    Object.entries(child).filter(
      ([key]) =>
        key !== 'children' &&
        key !== 'id' &&
        schema.property({ key, placement: 'element', type })?.role !==
          'metadata'
    )
  );

  return `[${at},${JSON.stringify(content, sortedKeys)}]`;
};

/**
 * A block's text as ink reads it: its text, with each inline void as one
 * `INK_VOID`, so a mention the copy lacks changes the text.
 */
export const inkText = (schema: InkSchema, block: Node): InkText => {
  const identity = schema.identity();
  let texts = textsBySchema.get(identity);

  if (!texts) {
    texts = new WeakMap();
    textsBySchema.set(identity, texts);
  }

  let read = texts.get(block);

  if (!read) {
    let text = '';
    const voids: string[] = [];
    const walk = (node: Node) => {
      if (TextApi.isText(node)) text += node.text;
      if (!ElementApi.isElement(node)) return;
      for (const child of node.children) {
        if (
          ElementApi.isElement(child) &&
          schema.isInline(child) &&
          schema.isVoid(child)
        ) {
          voids.push(voidEntry(schema, child, text.length));
          text += INK_VOID;
        } else {
          walk(child);
        }
      }
    };

    walk(block);
    read =
      voids.length > 0
        ? { text, voids: digest(`[${voids.join(',')}]`) }
        : { text };
    texts.set(block, read);
  }

  return read;
};

const SEGMENTED_SCRIPT =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}]/u;

let segmenter: Intl.Segmenter | undefined;
const wordsCache = new Map<
  string,
  ReadonlyArray<readonly [start: number, end: number]>
>();
const WORDS_CACHE_LIMIT = 64;

export const inkWords = (text: string) => {
  const cached = wordsCache.get(text);

  if (cached) return cached;

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

  if (wordsCache.size >= WORDS_CACHE_LIMIT) {
    const oldest = wordsCache.keys().next().value;

    if (oldest !== undefined) wordsCache.delete(oldest);
  }
  wordsCache.set(text, words);

  return words;
};

export const inkPassageWords = (
  text: string,
  baseOffset: number
): readonly InkPassageWord[] => {
  segmenter ??= new Intl.Segmenter('und', { granularity: 'word' });

  const words: InkPassageWord[] = [];

  for (const { index, segment } of segmenter.segment(text)) {
    if (/^\s+$/u.test(segment)) continue;
    words.push({
      end: baseOffset + index + segment.length,
      start: baseOffset + index,
    });
  }

  return words;
};

type BlockSegment =
  | Readonly<{ end: number; kind: 'text'; path: Path; start: number }>
  | Readonly<{ end: number; kind: 'void'; path: Path; start: number }>;

export const inkBlockRange = (
  schema: InkSchema,
  block: Node,
  blockPath: Path,
  start: number,
  end: number
): Range | null => {
  const segments: BlockSegment[] = [];
  let offset = 0;
  const walk = (node: Node, path: Path) => {
    if (TextApi.isText(node)) {
      segments.push({
        end: offset + node.text.length,
        kind: 'text',
        path,
        start: offset,
      });
      offset += node.text.length;

      return;
    }
    if (!ElementApi.isElement(node)) return;
    for (const [index, child] of node.children.entries()) {
      const childPath = [...path, index];

      if (
        ElementApi.isElement(child) &&
        schema.isInline(child) &&
        schema.isVoid(child)
      ) {
        segments.push({
          end: offset + 1,
          kind: 'void',
          path: childPath,
          start: offset,
        });
        offset += 1;
      } else {
        walk(child, childPath);
      }
    }
  };

  walk(block, blockPath);
  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    end < start ||
    end > offset
  ) {
    return null;
  }

  const pointAt = (
    at: number,
    side: 'collapsed' | 'end' | 'start'
  ): EditorPoint | null => {
    if (side === 'collapsed') {
      for (const seg of segments) {
        if (seg.kind === 'text' && seg.start <= at && at <= seg.end) {
          return { offset: at - seg.start, path: seg.path };
        }
      }
    } else if (side === 'start') {
      for (const seg of segments) {
        if (seg.kind === 'text' && seg.start <= at && at < seg.end) {
          return { offset: at - seg.start, path: seg.path };
        }
      }
      for (let i = segments.length - 1; i >= 0; i -= 1) {
        const seg = segments[i];

        if (seg.kind === 'text' && seg.end === at) {
          return { offset: seg.end - seg.start, path: seg.path };
        }
      }
    } else {
      for (const seg of segments) {
        if (seg.kind === 'text' && seg.start < at && at <= seg.end) {
          return { offset: at - seg.start, path: seg.path };
        }
      }
      for (const seg of segments) {
        if (seg.kind === 'text' && seg.start === at) {
          return { offset: 0, path: seg.path };
        }
      }
    }

    const fallback = segments.find(
      (seg) => seg.kind === 'void' && seg.start <= at && at <= seg.end
    );

    return fallback ? { offset: 0, path: [...fallback.path, 0] } : null;
  };

  const anchor = pointAt(start, start === end ? 'collapsed' : 'start');
  const focus = start === end ? anchor : pointAt(end, 'end');

  return anchor && focus ? { anchor, focus } : null;
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

    if (run.start === run.end) {
      const [start, end] = gapAround(copy.text, run.start);
      const gap = live.measure(start, end);

      if (!gap) return false;

      const half = end > start ? gap.width / 2 : tolerance;

      return (
        Math.abs(run.left + run.width / 2 - (gap.left + gap.width / 2)) <= half
      );
    }

    const now = live.measure(run.start, run.end);

    return (
      now !== undefined &&
      Math.abs(now.left - run.left) <= tolerance &&
      Math.abs(now.width - run.width) <= tolerance
    );
  });
};

export const placedPolylinesOf = (
  mark: InkMark,
  placement: Extract<InkPlacement, { type: 'ink' }>
): ReadonlyArray<readonly Point[]> => {
  const source = placement.strokes ?? [mark.samples];

  return source.map((stroke) =>
    stroke.map(([x, y]): Point => [x + placement.dx, y + placement.dy])
  );
};

export const placementClearsNearby = (
  mark: InkMark,
  placement: Extract<InkPlacement, { type: 'ink' }>,
  nearby: readonly InkBox[]
) => {
  if (nearby.length === 0) return true;

  const radius = mark.brush.size / 2;
  const polylines = placedPolylinesOf(mark, placement);

  return !nearby.some((box) =>
    polylines.some((points) => footprintEnters(points, radius, box))
  );
};

const unmarkedWordBoxesIn = (
  now: InkLiveBlock,
  runs: readonly InkMatchedRun[]
): InkBox[] => {
  const boxes: InkBox[] = [];

  for (const [start, end] of inkWords(now.text)) {
    if (runs.some((run) => run.start < end && run.end > start)) continue;

    let cursor = start;

    while (cursor < end) {
      const line = now.line(cursor);

      if (!line || line.end <= cursor) break;

      const to = Math.min(end, line.end);
      const box = now.measure(cursor, to);

      if (box) boxes.push(box);
      cursor = to;
    }
  }

  return boxes;
};

const verifyPolylinesOnRuns = (
  now: InkLiveBlock,
  polylines: ReadonlyArray<readonly Point[]>,
  runs: readonly InkMatchedRun[],
  unheldReach: number
) => {
  for (const moved of polylines) {
    const touched = inkTouchedWords(now, moved, unheldReach);

    if (
      !touched ||
      touched.some(
        ([start, end]) =>
          !runs.some((run) => run.start < end && run.end > start)
      )
    ) {
      return false;
    }
  }

  return true;
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
  const finalize = (
    candidate: Extract<InkPlacement, { type: 'ink' }>
  ): InkPlacement =>
    placementClearsNearby(mark, candidate, nearby)
      ? candidate
      : sign('changed');

  if (blocks.length < mark.blocks.length) return sign('changed');
  if (mark.margin) {
    const [{ block, copy, now }] = blocks;
    const { reach, side } = mark.margin;

    if (reach > margins[side]) return sign('narrow');

    const marginDx =
      side === 'left'
        ? now.box.left - block.left
        : now.box.left + now.box.width - block.left - copy.width;
    const anchor = matchMarginBlock(copy, block, mark, now);
    const placed = reflowMarginMark({
      anchor,
      block,
      copy,
      marginDx,
      mark,
      now,
    });

    return finalize({
      dx: placed.dx,
      dy: placed.dy,
      ...(anchor.changed && { sign: 'changed' as const }),
      ...(placed.strokes && { strokes: placed.strokes }),
      type: 'ink',
    });
  }
  if (mark.direction === 'rtl') return sign('changed');

  // Fast path: every block is text-exact and layout-exact -> pure rigid shift.
  let allExactAndHeld = true;
  const shiftsX: number[] = [];
  const shiftsY: number[] = [];

  for (const { block, copy, now } of blocks) {
    if (
      !inkHolds(copy, now) ||
      !copyHolds(copy, block, now, markedLines(copy, block, points, radius))
    ) {
      allExactAndHeld = false;
      break;
    }
    shiftsX.push(now.box.left - block.left);
    shiftsY.push(now.box.top - block.top);
  }

  const heights = blocks.flatMap(({ copy }) =>
    copy.lines.map((line) => line.height)
  );
  const tolerance = (heights.length > 0 ? Math.min(...heights) : 1) / 8;
  const unheldReach = Math.max(0, radius - SUBPIXEL_DRIFT);

  if (allExactAndHeld) {
    const [dx] = shiftsX;
    const [dy] = shiftsY;

    if (
      !shiftsX.every((shift) => Math.abs(shift - dx) <= tolerance) ||
      !shiftsY.every((shift) => Math.abs(shift - dy) <= tolerance)
    ) {
      return sign('changed');
    }

    const candidate: Extract<InkPlacement, { type: 'ink' }> = {
      dx,
      dy,
      type: 'ink',
    };
    const polylines = placedPolylinesOf(mark, candidate);

    for (const { block, now } of blocks) {
      const exactRuns = block.runs.map((run) => ({
        ...run,
        copyEnd: run.end,
        copyStart: run.start,
      }));

      if (!verifyPolylinesOnRuns(now, polylines, exactRuns, unheldReach)) {
        return sign('changed');
      }
    }

    return finalize(candidate);
  }

  // Attached reflow path: resolve per-mark runs via dual-alignment diff.
  const matchedBlocks: Array<{
    block: InkMarkBlock;
    copy: InkCopy;
    now: InkLiveBlock;
    runs: readonly InkMatchedRun[];
  }> = [];

  for (const { block, copy, now } of blocks) {
    const matched = matchMarkBlock(copy, block, now);

    if (matched.kind === 'changed') return sign('changed');
    matchedBlocks.push({ block, copy, now, runs: matched.runs });
  }

  // Single-block mark: point mark or 4-family inline reflow.
  if (matchedBlocks.length === 1) {
    const [{ block, copy, now, runs }] = matchedBlocks;

    if (runs.length === 1 && runs[0].start === runs[0].end) {
      const [run] = runs;
      const [gapStart, gapEnd] = gapAround(now.text, run.start);
      const startLine = now.line(gapStart);
      const endLine = now.line(Math.max(gapStart, gapEnd - 1));

      if (!startLine || !endLine || startLine.end !== endLine.end) {
        return sign('changed');
      }

      const gap = now.measure(gapStart, gapEnd);
      const savedLine = copy.lines[lineOf(copy.lines, run.copyStart)];

      if (!gap || !savedLine) return sign('changed');

      const dx =
        now.box.left -
        block.left +
        (gap.left + gap.width / 2 - (run.left + run.width / 2));
      const dy =
        now.box.top -
        block.top +
        (gap.top + gap.height / 2 - (savedLine.top + savedLine.height / 2));
      const candidate: Extract<InkPlacement, { type: 'ink' }> = {
        dx,
        dy,
        type: 'ink',
      };

      if (
        !verifyPolylinesOnRuns(
          now,
          placedPolylinesOf(mark, candidate),
          runs,
          unheldReach
        )
      ) {
        return sign('changed');
      }

      return finalize(candidate);
    }

    const reflowed = reflowInlineMark({
      block,
      copy,
      mark,
      now,
      runs,
      unmarkedBoxes: unmarkedWordBoxesIn(now, runs),
    });

    if (!reflowed) return sign('changed');

    const candidate: Extract<InkPlacement, { type: 'ink' }> = {
      dx: reflowed.dx,
      dy: reflowed.dy,
      ...(reflowed.strokes && { strokes: reflowed.strokes }),
      type: 'ink',
    };

    if (
      !verifyPolylinesOnRuns(
        now,
        placedPolylinesOf(mark, candidate),
        runs,
        unheldReach
      )
    ) {
      return sign('changed');
    }

    return finalize(candidate);
  }

  // Multi-block mark: require consistent rigid shift across every block.
  const multiShiftsX: number[] = [];
  const multiShiftsY: number[] = [];

  for (const { block, copy, now, runs } of matchedBlocks) {
    const reflowed = reflowInlineMark({
      block,
      copy,
      mark,
      now,
      runs,
      unmarkedBoxes: unmarkedWordBoxesIn(now, runs),
    });

    if (!reflowed || reflowed.strokes) return sign('changed');
    multiShiftsX.push(reflowed.dx);
    multiShiftsY.push(reflowed.dy);
  }

  const [dx] = multiShiftsX;
  const [dy] = multiShiftsY;

  if (
    !multiShiftsX.every((shift) => Math.abs(shift - dx) <= tolerance) ||
    !multiShiftsY.every((shift) => Math.abs(shift - dy) <= tolerance)
  ) {
    return sign('changed');
  }

  const candidate: Extract<InkPlacement, { type: 'ink' }> = {
    dx,
    dy,
    type: 'ink',
  };
  const polylines = placedPolylinesOf(mark, candidate);

  for (const { now, runs } of matchedBlocks) {
    if (!verifyPolylinesOnRuns(now, polylines, runs, unheldReach)) {
      return sign('changed');
    }
  }

  return finalize(candidate);
};
