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
  SEGMENTED_SCRIPT,
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

export type InkPlacement = Readonly<{
  dx: number;
  dy: number;
  strokes?: ReadonlyArray<readonly InkSample[]>;
  type: 'ink';
}> | null;

type Point = readonly [x: number, y: number];

const LAYER_CLAMP_INSET = 4;

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
  placement: NonNullable<InkPlacement>
): ReadonlyArray<readonly Point[]> => {
  const source = placement.strokes ?? [mark.samples];

  return source.map((stroke) =>
    stroke.map(([x, y]): Point => [x + placement.dx, y + placement.dy])
  );
};

export const placementClearsNearby = (
  mark: InkMark,
  placement: NonNullable<InkPlacement>,
  nearby: readonly InkBox[]
) => {
  if (nearby.length === 0) return true;

  const radius = mark.brush.size / 2;
  const polylines = placedPolylinesOf(mark, placement);

  return !nearby.some((box) =>
    polylines.some((points) => footprintEnters(points, radius, box))
  );
};

const strokeBoundsX = (
  mark: InkMark,
  dx: number,
  strokes?: ReadonlyArray<readonly InkSample[]>
): readonly [number, number] => {
  const radius = mark.brush.size / 2;
  const source = strokes ?? [mark.samples];
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;

  for (const stroke of source) {
    for (const [x] of stroke) {
      if (x + dx - radius < minX) minX = x + dx - radius;
      if (x + dx + radius > maxX) maxX = x + dx + radius;
    }
  }

  return [minX, maxX];
};

const clampHorizontalDx = (
  mark: InkMark,
  dx: number,
  minBound: number,
  maxBound: number,
  strokes?: ReadonlyArray<readonly InkSample[]>
) => {
  if (
    !Number.isFinite(minBound) ||
    !Number.isFinite(maxBound) ||
    maxBound <= minBound
  ) {
    return dx;
  }

  const [minX, maxX] = strokeBoundsX(mark, dx, strokes);

  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) return dx;
  if (maxX - minX > maxBound - minBound) return dx + (minBound - minX);
  if (minX < minBound) return dx + (minBound - minX);
  if (maxX > maxBound) return dx - (maxX - maxBound);

  return dx;
};

export const placeMark = ({
  copies,
  live,
  margins,
  mark,
}: Readonly<{
  copies: readonly InkCopy[];
  live: ReadonlyArray<InkLiveBlock | undefined>;
  margins: InkMargins;
  mark: InkMark;
  nearby?: readonly InkBox[];
}>): InkPlacement => {
  const points = mark.samples.map(([x, y]): Point => [x, y]);
  const radius = mark.brush.size / 2;
  const blocks = mark.blocks.flatMap((block, index) => {
    const now = live[index];

    return now ? [{ block, copy: copies[index], now }] : [];
  });

  if (blocks.length < mark.blocks.length) return null;

  const firstLive = blocks[0].now;
  const layerWidth = firstLive.box.left + firstLive.box.width + margins.right;
  const hasLayerWidth =
    Number.isFinite(layerWidth) && layerWidth > LAYER_CLAMP_INSET * 2;

  if (mark.margin) {
    const [{ block, copy, now }] = blocks;
    const { side } = mark.margin;
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
    const dx = hasLayerWidth
      ? clampHorizontalDx(
          mark,
          placed.dx,
          LAYER_CLAMP_INSET,
          layerWidth - LAYER_CLAMP_INSET,
          placed.strokes
        )
      : placed.dx;

    return {
      dx,
      dy: placed.dy,
      ...(placed.strokes && { strokes: placed.strokes }),
      type: 'ink',
    };
  }

  if (blocks.length === 1 && blocks[0].copy.lines.length === 0) {
    const [{ block, copy, now }] = blocks;

    if (
      copy.width <= 0 ||
      copy.height <= 0 ||
      now.box.width <= 0 ||
      now.box.height <= 0
    ) {
      return null;
    }
    if (
      Math.abs(now.box.width - copy.width) <= 0.5 &&
      Math.abs(now.box.height - copy.height) <= 0.5
    ) {
      return {
        dx: now.box.left - block.left,
        dy: now.box.top - block.top,
        type: 'ink',
      };
    }

    const sx = now.box.width / copy.width;
    const sy = now.box.height / copy.height;
    const scaled: InkSample[] = mark.samples.map(([x, y, p, t]) => [
      now.box.left + (x - block.left) * sx,
      now.box.top + (y - block.top) * sy,
      p,
      t,
    ]);

    return {
      dx: 0,
      dy: 0,
      strokes: [scaled],
      type: 'ink',
    };
  }

  const fallback = (): NonNullable<InkPlacement> => {
    const [{ block, now }] = blocks;
    let dx = now.box.left - block.left;
    const dy = now.box.top - block.top;
    const [, maxX] = strokeBoundsX(mark, dx);
    const blockRight = now.box.left + now.box.width;

    if (maxX > blockRight) {
      dx = clampHorizontalDx(
        mark,
        dx,
        hasLayerWidth
          ? Math.max(LAYER_CLAMP_INSET, now.box.left)
          : now.box.left,
        hasLayerWidth
          ? Math.min(layerWidth - LAYER_CLAMP_INSET, blockRight)
          : blockRight
      );
    } else if (hasLayerWidth) {
      dx = clampHorizontalDx(
        mark,
        dx,
        LAYER_CLAMP_INSET,
        layerWidth - LAYER_CLAMP_INSET
      );
    }

    return { dx, dy, type: 'ink' };
  };

  if (mark.direction === 'rtl') return fallback();

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

  const shiftTolerance = () => {
    const heights = blocks.flatMap(({ copy }) =>
      copy.lines.map((line) => line.height)
    );

    return (heights.length > 0 ? Math.min(...heights) : 1) / 8;
  };
  const consistentShift = (xs: readonly number[], ys: readonly number[]) => {
    const tolerance = shiftTolerance();
    const [dx] = xs;
    const [dy] = ys;

    return xs.every((shift) => Math.abs(shift - dx) <= tolerance) &&
      ys.every((shift) => Math.abs(shift - dy) <= tolerance)
      ? ({ dx, dy } as const)
      : undefined;
  };

  if (allExactAndHeld) {
    const shift = consistentShift(shiftsX, shiftsY);

    return shift ? { dx: shift.dx, dy: shift.dy, type: 'ink' } : fallback();
  }

  const matchedBlocks: Array<{
    block: InkMarkBlock;
    copy: InkCopy;
    now: InkLiveBlock;
    runs: readonly InkMatchedRun[];
  }> = [];

  for (const { block, copy, now } of blocks) {
    const matched = matchMarkBlock(copy, block, now);

    if (matched.kind === 'changed') return fallback();
    matchedBlocks.push({ block, copy, now, runs: matched.runs });
  }

  if (matchedBlocks.length === 1) {
    const [{ block, copy, now, runs }] = matchedBlocks;

    if (runs.length === 1 && runs[0].start === runs[0].end) {
      const [run] = runs;
      const [gapStart, gapEnd] = gapAround(now.text, run.start);
      const startLine = now.line(gapStart);
      const endLine = now.line(Math.max(gapStart, gapEnd - 1));

      if (!startLine || !endLine || startLine.end !== endLine.end) {
        return fallback();
      }

      const gap = now.measure(gapStart, gapEnd);
      const savedLine = copy.lines[lineOf(copy.lines, run.copyStart)];

      if (!gap || !savedLine) return fallback();

      return {
        dx:
          now.box.left -
          block.left +
          (gap.left + gap.width / 2 - (run.left + run.width / 2)),
        dy:
          now.box.top -
          block.top +
          (gap.top + gap.height / 2 - (savedLine.top + savedLine.height / 2)),
        type: 'ink',
      };
    }

    const reflowed = reflowInlineMark({
      block,
      copy,
      getUnmarkedBoxes: () => [],
      mark,
      now,
      runs,
    });

    if (!reflowed) return fallback();

    return {
      dx: reflowed.dx,
      dy: reflowed.dy,
      ...(reflowed.strokes && { strokes: reflowed.strokes }),
      type: 'ink',
    };
  }

  const multiShiftsX: number[] = [];
  const multiShiftsY: number[] = [];

  for (const { block, copy, now, runs } of matchedBlocks) {
    const reflowed = reflowInlineMark({
      block,
      copy,
      getUnmarkedBoxes: () => [],
      mark,
      now,
      runs,
    });

    if (!reflowed) return fallback();
    multiShiftsX.push(reflowed.dx);
    multiShiftsY.push(reflowed.dy);
  }

  const shift = consistentShift(multiShiftsX, multiShiftsY);

  return shift ? { dx: shift.dx, dy: shift.dy, type: 'ink' } : fallback();
};
