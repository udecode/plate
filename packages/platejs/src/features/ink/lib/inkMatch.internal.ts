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
} from './BaseInkPlugin';
import { digest } from './inkCodec.internal';

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

export type InkText = Readonly<{ text: string; voids?: string }>;

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

export const inkHolds = (copy: InkText, now: InkText) =>
  now.text === copy.text && now.voids === copy.voids;

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

export const lineStart = (lines: readonly InkLine[], index: number) =>
  index === 0 ? 0 : lines[index - 1].end;

export const lineOf = (lines: readonly InkLine[], offset: number) => {
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

    return placement.type === 'ink' && !inkHolds(copy, now)
      ? { ...placement, sign: 'changed' }
      : placement;
  }
  if (mark.direction === 'rtl') return sign('changed');

  const shifts: number[] = [];

  for (const { block, copy, now } of blocks) {
    if (!inkHolds(copy, now)) return sign('changed');
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
