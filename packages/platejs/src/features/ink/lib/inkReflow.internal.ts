import type {
  InkCopy,
  InkLine,
  InkMark,
  InkMarkBlock,
  InkSample,
} from './BaseInkPlugin';
import {
  type InkMarginAnchor,
  type InkMatchedRun,
  lineOf,
} from './inkAnchor.internal';
import type { InkBox, InkLiveBlock } from './inkMatch.internal';

export type InkShapeFamily = 'box' | 'flow' | 'rigid' | 'span';

export type InkLiveSegment = Readonly<{
  box: InkBox;
  end: number;
  line: InkLine;
  start: number;
}>;

export type InkReflowResult = Readonly<{
  dx: number;
  dy: number;
  strokes?: ReadonlyArray<readonly InkSample[]>;
}>;

type Bounds = Readonly<{
  height: number;
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
  width: number;
}>;

const boundsOfSamples = (samples: readonly InkSample[]): Bounds => {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const [x, y] of samples) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  if (!Number.isFinite(minX)) {
    return { height: 0, maxX: 0, maxY: 0, minX: 0, minY: 0, width: 0 };
  }

  return {
    height: maxY - minY,
    maxX,
    maxY,
    minX,
    minY,
    width: maxX - minX,
  };
};

const pathLengthOf = (samples: readonly InkSample[]) => {
  let total = 0;

  for (let i = 1; i < samples.length; i += 1) {
    total += Math.hypot(
      samples[i][0] - samples[i - 1][0],
      samples[i][1] - samples[i - 1][1]
    );
  }

  return total;
};

const isMonotoneAxis = (
  samples: readonly InkSample[],
  axis: 0 | 1,
  maxReversal: number
) => {
  if (samples.length < 2) return false;

  const first = samples[0][axis];
  const lastSample = samples.at(-1);

  if (!lastSample) return false;

  const last = lastSample[axis];
  const dir = last >= first ? 1 : -1;
  let extreme = first * dir;

  for (let i = 1; i < samples.length; i += 1) {
    const val = samples[i][axis] * dir;

    if (val > extreme) extreme = val;
    else if (extreme - val > maxReversal) return false;
  }

  return true;
};

const avgLineHeightOf = (lines: readonly InkLine[]) => {
  if (lines.length === 0) return 0;

  let sum = 0;

  for (const line of lines) sum += line.height;

  return sum / lines.length;
};

const savedRunsBoxOf = (copy: InkCopy, block: InkMarkBlock): InkBox | null => {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const run of block.runs) {
    const line = copy.lines[lineOf(copy.lines, run.start)];

    if (!line) continue;
    left = Math.min(left, run.left);
    right = Math.max(right, run.left + run.width);
    top = Math.min(top, line.top);
    bottom = Math.max(bottom, line.top + line.height);
  }

  return Number.isFinite(left)
    ? { height: bottom - top, left, top, width: right - left }
    : null;
};

const savedRunLineSet = (copy: InkCopy, block: InkMarkBlock) => {
  const lines = new Set<number>();

  for (const run of block.runs) {
    lines.add(lineOf(copy.lines, run.start));
    if (run.end > run.start) lines.add(lineOf(copy.lines, run.end - 1));
  }

  return lines;
};

export const classifyInkMark = (
  mark: InkMark,
  copy: InkCopy,
  block: InkMarkBlock
): InkShapeFamily => {
  const { samples } = mark;

  if (samples.length < 2 || copy.lines.length === 0) return 'rigid';

  const firstSample = samples[0];
  const lastSample = samples.at(-1);

  if (!lastSample) return 'rigid';

  const bounds = boundsOfSamples(samples);
  const pathLen = pathLengthOf(samples);

  if (mark.margin) {
    const avgLh = avgLineHeightOf(copy.lines);

    if (
      avgLh > 0 &&
      bounds.height >= 1.6 * avgLh &&
      bounds.width <= 0.5 * bounds.height &&
      pathLen > 0 &&
      Math.abs(lastSample[1] - firstSample[1]) >= 0.7 * pathLen &&
      isMonotoneAxis(samples, 1, 0.35 * avgLh)
    ) {
      return 'span';
    }

    return 'rigid';
  }

  if (
    mark.blocks.length !== 1 ||
    block.runs.length === 0 ||
    block.runs.every((run) => run.start === run.end)
  ) {
    return 'rigid';
  }

  const runLines = savedRunLineSet(copy, block);
  const runsBox = savedRunsBoxOf(copy, block);

  if (!runsBox) return 'rigid';

  if (runLines.size === 1) {
    const [lineIndex] = runLines;
    const lh = copy.lines[lineIndex].height;
    const maxFlowHeight = mark.brush.opacity < 1 ? 1.25 * lh : 0.95 * lh;
    const minFlowWidth = block.runs.length >= 2 ? 0.8 * lh : 1.2 * lh;

    if (
      lh > 0 &&
      bounds.height <= maxFlowHeight &&
      bounds.width >= minFlowWidth &&
      pathLen > 0 &&
      Math.abs(lastSample[0] - firstSample[0]) >= 0.75 * pathLen &&
      isMonotoneAxis(samples, 0, 0.35 * lh)
    ) {
      return 'flow';
    }
  }

  const diag = Math.hypot(bounds.width, bounds.height);
  const endGap = Math.hypot(
    lastSample[0] - firstSample[0],
    lastSample[1] - firstSample[1]
  );
  const relMinX = bounds.minX - block.left;
  const relMaxX = bounds.maxX - block.left;
  const relMinY = bounds.minY - block.top;
  const relMaxY = bounds.maxY - block.top;
  const runsCenterX = runsBox.left + runsBox.width / 2;
  const runsCenterY = runsBox.top + runsBox.height / 2;

  if (
    diag > 0 &&
    endGap <= 0.55 * diag &&
    bounds.height >= 0.7 * runsBox.height &&
    bounds.width >= 0.8 * runsBox.width &&
    relMinX < runsCenterX &&
    relMaxX > runsCenterX &&
    relMinY < runsCenterY &&
    relMaxY > runsCenterY
  ) {
    return 'box';
  }

  return 'rigid';
};

export const measureLiveRunSegments = (
  live: InkLiveBlock,
  runs: readonly InkMatchedRun[]
): InkLiveSegment[] | undefined => {
  const raw: InkLiveSegment[] = [];

  for (const run of runs) {
    if (run.end <= run.start) continue;

    let cursor = run.start;

    while (cursor < run.end) {
      const line = live.line(cursor);

      if (!line || line.end <= cursor) return undefined;

      const segEnd = Math.min(run.end, line.end);
      const box = live.measure(cursor, segEnd);

      if (!box) return undefined;

      raw.push({ box, end: segEnd, line, start: cursor });
      cursor = segEnd;
    }
  }

  if (raw.length === 0) return undefined;

  raw.sort((a, b) => a.start - b.start || a.end - b.end);

  const merged: InkLiveSegment[] = [];

  for (const seg of raw) {
    const prev = merged.at(-1);

    if (
      prev &&
      prev.line.end === seg.line.end &&
      Math.abs(prev.line.top - seg.line.top) <= 0.5 &&
      seg.start >= prev.end &&
      /^\s*$/u.test(live.text.slice(prev.end, seg.start))
    ) {
      const left = Math.min(prev.box.left, seg.box.left);
      const right = Math.max(
        prev.box.left + prev.box.width,
        seg.box.left + seg.box.width
      );
      const top = Math.min(prev.box.top, seg.box.top);
      const bottom = Math.max(
        prev.box.top + prev.box.height,
        seg.box.top + seg.box.height
      );

      merged[merged.length - 1] = {
        box: { height: bottom - top, left, top, width: right - left },
        end: seg.end,
        line: prev.line,
        start: prev.start,
      };
    } else {
      merged.push(seg);
    }
  }

  return merged;
};

const unionBoxes = (boxes: readonly InkBox[]): InkBox => {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const box of boxes) {
    left = Math.min(left, box.left);
    top = Math.min(top, box.top);
    right = Math.max(right, box.left + box.width);
    bottom = Math.max(bottom, box.top + box.height);
  }

  return { height: bottom - top, left, top, width: right - left };
};

const densifySamples = (
  samples: readonly InkSample[],
  maxStep: number
): InkSample[] => {
  if (samples.length <= 1 || maxStep <= 0) return [...samples];

  const out: InkSample[] = [samples[0]];

  for (let i = 1; i < samples.length; i += 1) {
    const a = samples[i - 1];
    const b = samples[i];
    const dist = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const steps = Math.max(1, Math.ceil(dist / maxStep));

    for (let s = 1; s <= steps; s += 1) {
      const t = s / steps;

      out.push([
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
        a[3] + (b[3] - a[3]) * t,
      ]);
    }
  }

  return out;
};

const mapAxis = (
  value: number,
  savedStart: number,
  savedSize: number,
  liveStart: number,
  liveSize: number
) => {
  if (value < savedStart) return liveStart + (value - savedStart);
  if (value > savedStart + savedSize) {
    return liveStart + liveSize + (value - (savedStart + savedSize));
  }

  return liveStart + ((value - savedStart) / savedSize) * liveSize;
};

const isBelowBaseline = (
  samples: readonly InkSample[],
  blockTop: number,
  savedLine: InkLine
) => {
  const meanRelY =
    samples.reduce((sum, [, y]) => sum + (y - blockTop), 0) / samples.length;

  return meanRelY >= savedLine.top + 0.65 * savedLine.height;
};

const projectFlow = (
  mark: InkMark,
  copy: InkCopy,
  block: InkMarkBlock,
  now: InkLiveBlock,
  runs: readonly InkMatchedRun[]
): InkReflowResult | undefined => {
  const segs = measureLiveRunSegments(now, runs);
  const runsBox = savedRunsBoxOf(copy, block);

  if (!segs || !runsBox) return undefined;

  const savedLine = copy.lines[lineOf(copy.lines, block.runs[0].start)];
  const lh = savedLine.height;
  const blockDx = now.box.left - block.left;
  const blockDy = now.box.top - block.top;

  if (
    segs.length === 1 &&
    Math.abs(segs[0].box.width - runsBox.width) <= lh / 8 &&
    Math.abs(segs[0].line.height - lh) <= lh / 8
  ) {
    return {
      dx: blockDx + (segs[0].box.left - runsBox.left),
      dy: blockDy + (segs[0].line.top - savedLine.top),
    };
  }

  const totalLiveWidth = segs.reduce((sum, seg) => sum + seg.box.width, 0);

  if (totalLiveWidth <= 0 || runsBox.width <= 0) return undefined;

  const dense = densifySamples(mark.samples, Math.max(2, lh / 2));
  const anchorToBottom = isBelowBaseline(dense, block.top, savedLine);
  const savedBottom = savedLine.top + lh;
  const maxOverhang = 0.5 * lh;

  const cumStarts: number[] = [];
  let acc = 0;

  for (const seg of segs) {
    cumStarts.push(acc);
    acc += seg.box.width;
  }

  const mapY = (sampleY: number, seg: InkLiveSegment) => {
    const relY = sampleY - block.top;
    const liveY = anchorToBottom
      ? seg.line.top + seg.line.height + (relY - savedBottom)
      : seg.line.top + ((relY - savedLine.top) / lh) * seg.line.height;

    return liveY + block.top;
  };

  const segmentOf = (dist: number) => {
    if (dist <= 0) return 0;
    for (let i = 0; i < segs.length; i += 1) {
      if (dist <= cumStarts[i] + segs[i].box.width) return i;
    }

    return segs.length - 1;
  };

  const mapPoint = (
    sample: InkSample,
    segIndex: number,
    dist: number
  ): InkSample => {
    const seg = segs[segIndex];
    const local = Math.min(
      seg.box.width + maxOverhang,
      Math.max(-maxOverhang, dist - cumStarts[segIndex])
    );

    return [
      seg.box.left + local + block.left,
      mapY(sample[1], seg),
      sample[2],
      sample[3],
    ];
  };

  const strokes: InkSample[][] = [];
  let currentStroke: InkSample[] = [];
  let prevSeg = -1;
  let prevDist = 0;
  let prevSample: InkSample | undefined;

  for (const sample of dense) {
    const u = (sample[0] - block.left - runsBox.left) / runsBox.width;
    const dist = u * totalLiveWidth;
    const segIndex = segmentOf(dist);

    if (prevSeg !== -1 && segIndex !== prevSeg && prevSample) {
      const forward = segIndex > prevSeg;
      const boundary = forward
        ? cumStarts[prevSeg] + segs[prevSeg].box.width
        : cumStarts[prevSeg];
      const span = dist - prevDist;
      const ratio =
        span === 0
          ? 0.5
          : Math.min(1, Math.max(0, (boundary - prevDist) / span));
      const interpY = prevSample[1] + (sample[1] - prevSample[1]) * ratio;
      const interpP = prevSample[2] + (sample[2] - prevSample[2]) * ratio;
      const interpT = prevSample[3] + (sample[3] - prevSample[3]) * ratio;
      const edgeSample: InkSample = [sample[0], interpY, interpP, interpT];

      currentStroke.push(mapPoint(edgeSample, prevSeg, boundary));
      if (currentStroke.length >= 2) strokes.push(currentStroke);

      const stepDir = forward ? 1 : -1;

      for (let mid = prevSeg + stepDir; mid !== segIndex; mid += stepDir) {
        const startEdge = forward
          ? cumStarts[mid]
          : cumStarts[mid] + segs[mid].box.width;
        const endEdge = forward
          ? cumStarts[mid] + segs[mid].box.width
          : cumStarts[mid];

        strokes.push([
          mapPoint(edgeSample, mid, startEdge),
          mapPoint(edgeSample, mid, endEdge),
        ]);
      }

      const enterBoundary = forward
        ? cumStarts[segIndex]
        : cumStarts[segIndex] + segs[segIndex].box.width;

      currentStroke = [mapPoint(edgeSample, segIndex, enterBoundary)];
    }

    currentStroke.push(mapPoint(sample, segIndex, dist));
    prevSeg = segIndex;
    prevDist = dist;
    prevSample = sample;
  }

  if (currentStroke.length >= 2) strokes.push(currentStroke);
  if (strokes.length === 0) return undefined;

  return { dx: blockDx, dy: blockDy, strokes };
};

const projectBox = (
  mark: InkMark,
  copy: InkCopy,
  block: InkMarkBlock,
  now: InkLiveBlock,
  runs: readonly InkMatchedRun[],
  unmarkedBoxes: readonly InkBox[]
): InkReflowResult | undefined => {
  const segs = measureLiveRunSegments(now, runs);
  const savedBox = savedRunsBoxOf(copy, block);

  if (!segs || !savedBox || savedBox.width <= 0 || savedBox.height <= 0) {
    return undefined;
  }

  const savedLineCount = savedRunLineSet(copy, block).size;
  const liveLineTops = new Set(segs.map((seg) => Math.round(seg.line.top)));

  if (liveLineTops.size > savedLineCount) return undefined;

  const liveBox = unionBoxes(segs.map((seg) => seg.box));

  for (const other of unmarkedBoxes) {
    const overlapX =
      Math.min(liveBox.left + liveBox.width, other.left + other.width) -
      Math.max(liveBox.left, other.left);
    const overlapY =
      Math.min(liveBox.top + liveBox.height, other.top + other.height) -
      Math.max(liveBox.top, other.top);

    if (overlapX > 1 && overlapY > 1) return undefined;
  }

  const lh = avgLineHeightOf(copy.lines) || 1;
  const blockDx = now.box.left - block.left;
  const blockDy = now.box.top - block.top;

  if (
    Math.abs(liveBox.width - savedBox.width) <= lh / 8 &&
    Math.abs(liveBox.height - savedBox.height) <= lh / 8
  ) {
    return {
      dx: blockDx + (liveBox.left - savedBox.left),
      dy: blockDy + (liveBox.top - savedBox.top),
    };
  }

  const sx = liveBox.width / savedBox.width;
  const sy = liveBox.height / savedBox.height;

  if (sx < 0.5 || sx > 2 || sy < 0.5 || sy > 2) return undefined;

  const morphed: InkSample[] = mark.samples.map(([x, y, p, t]) => [
    mapAxis(
      x - block.left,
      savedBox.left,
      savedBox.width,
      liveBox.left,
      liveBox.width
    ) + block.left,
    mapAxis(
      y - block.top,
      savedBox.top,
      savedBox.height,
      liveBox.top,
      liveBox.height
    ) + block.top,
    p,
    t,
  ]);

  return { dx: blockDx, dy: blockDy, strokes: [morphed] };
};

const projectSpanMargin = (
  mark: InkMark,
  copy: InkCopy,
  block: InkMarkBlock,
  now: InkLiveBlock,
  anchor: InkMarginAnchor,
  marginDx: number
): InkReflowResult => {
  const blockDy = now.box.top - block.top;

  if (
    anchor.liveStart === undefined ||
    anchor.liveEnd === undefined ||
    copy.lines.length === 0
  ) {
    return { dx: marginDx, dy: blockDy };
  }

  const firstLive = now.line(anchor.liveStart);
  const lastLive = now.line(Math.max(anchor.liveStart, anchor.liveEnd - 1));

  if (!firstLive || !lastLive) return { dx: marginDx, dy: blockDy };

  const savedTop = copy.lines[anchor.fromLine].top;
  const savedBottom =
    copy.lines[anchor.toLine].top + copy.lines[anchor.toLine].height;
  const liveTop = firstLive.top;
  const liveBottom = lastLive.top + lastLive.height;
  const savedH = Math.max(1, savedBottom - savedTop);
  const liveH = Math.max(1, liveBottom - liveTop);
  const lh = avgLineHeightOf(copy.lines) || 1;

  if (Math.abs(liveH - savedH) <= lh / 8) {
    return { dx: marginDx, dy: blockDy + (liveTop - savedTop) };
  }

  const scale = liveH / savedH;

  if (scale < 0.4 || scale > 3) {
    return { dx: marginDx, dy: blockDy + (liveTop - savedTop) };
  }

  const stretched: InkSample[] = mark.samples.map(([x, y, p, t]) => [
    x,
    mapAxis(y - block.top, savedTop, savedH, liveTop, liveH) + block.top,
    p,
    t,
  ]);

  return { dx: marginDx, dy: blockDy, strokes: [stretched] };
};

const projectRigidInline = (
  copy: InkCopy,
  block: InkMarkBlock,
  now: InkLiveBlock,
  runs: readonly InkMatchedRun[]
): InkReflowResult | undefined => {
  const segs = measureLiveRunSegments(now, runs);
  const savedBox = savedRunsBoxOf(copy, block);

  if (!segs || !savedBox) return undefined;

  const savedLineCount = savedRunLineSet(copy, block).size;
  const liveLineTops = new Set(segs.map((seg) => Math.round(seg.line.top)));

  if (liveLineTops.size > savedLineCount) return undefined;

  const liveBox = unionBoxes(segs.map((seg) => seg.box));
  const lh = avgLineHeightOf(copy.lines) || 1;

  if (
    Math.abs(liveBox.width - savedBox.width) > lh / 4 ||
    Math.abs(liveBox.height - savedBox.height) > lh / 4
  ) {
    return undefined;
  }

  return {
    dx: now.box.left - block.left + (liveBox.left - savedBox.left),
    dy: now.box.top - block.top + (liveBox.top - savedBox.top),
  };
};

export const reflowInlineMark = ({
  block,
  copy,
  getUnmarkedBoxes,
  mark,
  now,
  runs,
}: Readonly<{
  block: InkMarkBlock;
  copy: InkCopy;
  getUnmarkedBoxes: () => readonly InkBox[];
  mark: InkMark;
  now: InkLiveBlock;
  runs: readonly InkMatchedRun[];
}>): InkReflowResult | undefined => {
  const family = classifyInkMark(mark, copy, block);

  if (family === 'flow') return projectFlow(mark, copy, block, now, runs);
  if (family === 'box') {
    return projectBox(mark, copy, block, now, runs, getUnmarkedBoxes());
  }

  return projectRigidInline(copy, block, now, runs);
};

export const reflowMarginMark = ({
  anchor,
  block,
  copy,
  marginDx,
  mark,
  now,
}: Readonly<{
  anchor: InkMarginAnchor;
  block: InkMarkBlock;
  copy: InkCopy;
  marginDx: number;
  mark: InkMark;
  now: InkLiveBlock;
}>): InkReflowResult => {
  const family = classifyInkMark(mark, copy, block);

  if (family === 'span') {
    return projectSpanMargin(mark, copy, block, now, anchor, marginDx);
  }

  const blockDy = now.box.top - block.top;

  if (anchor.liveStart !== undefined && copy.lines.length > 0) {
    const liveLine = now.line(anchor.liveStart);

    if (liveLine) {
      return {
        dx: marginDx,
        dy: blockDy + (liveLine.top - copy.lines[anchor.fromLine].top),
      };
    }
  }

  return { dx: marginDx, dy: blockDy };
};
