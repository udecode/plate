import type { InkCopy, InkLine, InkMark, InkMarkBlock } from './BaseInkPlugin';

export const INK_VOID = String.fromCodePoint(0xff_fc);

export type InkText = Readonly<{ text: string; voids?: string }>;

export const inkHolds = (copy: InkText, now: InkText) =>
  now.text === copy.text && now.voids === copy.voids;

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

const MAX_DIFF_CHARS = 4096;
const MAX_DIFF_OPS = 256;

const WORD_CHAR = /[\p{L}\p{N}_]/u;
const COMBINING_MARK = /\p{M}/u;
const SEGMENTED_SCRIPT =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}]/u;

type EqualStretch = Readonly<{
  aStart: number;
  bStart: number;
  length: number;
}>;

export type InkTextAlignment = Readonly<{
  stretches: readonly EqualStretch[];
}>;

export type InkMatchedRun = Readonly<{
  copyEnd: number;
  copyStart: number;
  end: number;
  left: number;
  start: number;
  width: number;
}>;

export type InkMatchedBlock =
  | Readonly<{ kind: 'changed' }>
  | Readonly<{ kind: 'exact'; runs: readonly InkMatchedRun[] }>
  | Readonly<{ kind: 'matched'; runs: readonly InkMatchedRun[] }>;

export type InkMarginAnchor = Readonly<{
  changed: boolean;
  fromLine: number;
  liveEnd?: number;
  liveStart?: number;
  toLine: number;
}>;

const metrics = {
  blockDiffs: 0,
  exactFastPaths: 0,
  matchCalls: 0,
};

export const getInkAnchorMetrics = () => Object.freeze({ ...metrics });

const isLowSurrogate = (code: number) => code >= 0xdc_00 && code <= 0xdf_ff;

const reverseCodeUnits = (text: string) => {
  let out = '';

  for (let i = text.length - 1; i >= 0; i -= 1) {
    out += text[i];
  }

  return out;
};

const mergeStretches = (stretches: readonly EqualStretch[]): EqualStretch[] => {
  const merged: EqualStretch[] = [];

  for (const stretch of stretches) {
    if (stretch.length <= 0) continue;

    const prev = merged.at(-1);

    if (
      prev &&
      prev.aStart + prev.length === stretch.aStart &&
      prev.bStart + prev.length === stretch.bStart
    ) {
      merged[merged.length - 1] = {
        aStart: prev.aStart,
        bStart: prev.bStart,
        length: prev.length + stretch.length,
      };
    } else {
      merged.push(stretch);
    }
  }

  return merged;
};

const myersEqualStretches = (
  a: string,
  b: string,
  maxOps: number
): EqualStretch[] | null => {
  const n = a.length;
  const m = b.length;

  if (n === 0 || m === 0) return [];
  if (a === b) return [{ aStart: 0, bStart: 0, length: n }];

  const maxD = Math.min(maxOps, n + m);
  const offset = maxD;
  const v = new Int32Array(2 * maxD + 1);
  const trace: Int32Array[] = [];
  let foundD = -1;

  for (let d = 0; d <= maxD; d += 1) {
    trace.push(v.slice());

    for (let k = -d; k <= d; k += 2) {
      let x =
        k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])
          ? v[offset + k + 1]
          : v[offset + k - 1] + 1;
      let y = x - k;

      while (x < n && y < m && a.charCodeAt(x) === b.charCodeAt(y)) {
        x += 1;
        y += 1;
      }
      v[offset + k] = x;

      if (x >= n && y >= m) {
        foundD = d;
        break;
      }
    }
    if (foundD !== -1) break;
  }

  if (foundD === -1) return null;

  const reversed: EqualStretch[] = [];
  let x = n;
  let y = m;

  for (let d = foundD; d > 0; d -= 1) {
    const prev = trace[d];
    const k = x - y;
    const prevK =
      k === -d || (k !== d && prev[offset + k - 1] < prev[offset + k + 1])
        ? k + 1
        : k - 1;
    const prevX = prev[offset + prevK];
    const prevY = prevX - prevK;
    const diagStartX = prevK === k + 1 ? prevX : prevX + 1;
    const diagStartY = prevK === k + 1 ? prevY + 1 : prevY;

    if (x > diagStartX) {
      reversed.push({
        aStart: diagStartX,
        bStart: diagStartY,
        length: x - diagStartX,
      });
    }
    x = prevX;
    y = prevY;
  }

  if (x > 0 && y > 0) {
    reversed.push({ aStart: 0, bStart: 0, length: Math.min(x, y) });
  }
  reversed.reverse();

  return mergeStretches(reversed);
};

const alignPrefixFirst = (a: string, b: string): EqualStretch[] | null => {
  let prefix = 0;

  while (
    prefix < a.length &&
    prefix < b.length &&
    a.charCodeAt(prefix) === b.charCodeAt(prefix)
  ) {
    prefix += 1;
  }

  let suffix = 0;

  while (
    prefix + suffix < a.length &&
    prefix + suffix < b.length &&
    a.charCodeAt(a.length - 1 - suffix) === b.charCodeAt(b.length - 1 - suffix)
  ) {
    suffix += 1;
  }

  const midA = a.slice(prefix, a.length - suffix);
  const midB = b.slice(prefix, b.length - suffix);

  if (midA.length + midB.length > MAX_DIFF_CHARS) return null;

  const mid = myersEqualStretches(midA, midB, MAX_DIFF_OPS);

  if (!mid) return null;

  const out: EqualStretch[] = [];

  if (prefix > 0) out.push({ aStart: 0, bStart: 0, length: prefix });
  for (const stretch of mid) {
    out.push({
      aStart: stretch.aStart + prefix,
      bStart: stretch.bStart + prefix,
      length: stretch.length,
    });
  }
  if (suffix > 0) {
    out.push({
      aStart: a.length - suffix,
      bStart: b.length - suffix,
      length: suffix,
    });
  }

  return mergeStretches(out);
};

const alignSuffixFirst = (a: string, b: string): EqualStretch[] | null => {
  let suffix = 0;

  while (
    suffix < a.length &&
    suffix < b.length &&
    a.charCodeAt(a.length - 1 - suffix) === b.charCodeAt(b.length - 1 - suffix)
  ) {
    suffix += 1;
  }

  let prefix = 0;

  while (
    prefix + suffix < a.length &&
    prefix + suffix < b.length &&
    a.charCodeAt(prefix) === b.charCodeAt(prefix)
  ) {
    prefix += 1;
  }

  const midA = a.slice(prefix, a.length - suffix);
  const midB = b.slice(prefix, b.length - suffix);

  if (midA.length + midB.length > MAX_DIFF_CHARS) return null;

  const midRev = myersEqualStretches(
    reverseCodeUnits(midA),
    reverseCodeUnits(midB),
    MAX_DIFF_OPS
  );

  if (!midRev) return null;

  const out: EqualStretch[] = [];

  if (prefix > 0) out.push({ aStart: 0, bStart: 0, length: prefix });
  for (let i = midRev.length - 1; i >= 0; i -= 1) {
    const stretch = midRev[i];

    out.push({
      aStart: prefix + midA.length - stretch.aStart - stretch.length,
      bStart: prefix + midB.length - stretch.bStart - stretch.length,
      length: stretch.length,
    });
  }
  if (suffix > 0) {
    out.push({
      aStart: a.length - suffix,
      bStart: b.length - suffix,
      length: suffix,
    });
  }

  return mergeStretches(out);
};

const intersectAlignments = (
  first: readonly EqualStretch[],
  second: readonly EqualStretch[]
): EqualStretch[] => {
  const agreed: EqualStretch[] = [];
  let i = 0;
  let j = 0;

  while (i < first.length && j < second.length) {
    const s1 = first[i];
    const s2 = second[j];
    const s1End = s1.aStart + s1.length;
    const s2End = s2.aStart + s2.length;
    const lo = Math.max(s1.aStart, s2.aStart);
    const hi = Math.min(s1End, s2End);

    if (lo < hi && s1.bStart - s1.aStart === s2.bStart - s2.aStart) {
      agreed.push({
        aStart: lo,
        bStart: lo + (s1.bStart - s1.aStart),
        length: hi - lo,
      });
    }
    if (s1End <= s2End) i += 1;
    else j += 1;
  }

  return mergeStretches(agreed);
};

const alignmentCache = new WeakMap<
  InkCopy,
  WeakMap<InkText, InkTextAlignment | null>
>();

export const diffInkStrings = (
  copyText: string,
  liveText: string
): InkTextAlignment | null => {
  if (copyText === liveText) {
    return {
      stretches:
        copyText.length > 0
          ? [{ aStart: 0, bStart: 0, length: copyText.length }]
          : [],
    };
  }

  const first = alignPrefixFirst(copyText, liveText);

  if (!first) return null;

  const second = alignSuffixFirst(copyText, liveText);

  if (!second) return null;

  return { stretches: intersectAlignments(first, second) };
};

export const diffInkCopy = (
  copy: InkCopy,
  now: InkText
): InkTextAlignment | null => {
  let byNow = alignmentCache.get(copy);

  if (!byNow) {
    byNow = new WeakMap();
    alignmentCache.set(copy, byNow);
  }
  if (byNow.has(now)) return byNow.get(now) ?? null;

  metrics.blockDiffs += 1;

  const computed = diffInkStrings(copy.text, now.text);

  byNow.set(now, computed);

  return computed;
};

const stretchAt = (
  stretches: readonly EqualStretch[],
  offset: number
): EqualStretch | undefined => {
  let lo = 0;
  let hi = stretches.length - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const stretch = stretches[mid];

    if (offset < stretch.aStart) hi = mid - 1;
    else if (offset >= stretch.aStart + stretch.length) lo = mid + 1;
    else return stretch;
  }

  return undefined;
};

export const mapCopySpan = (
  alignment: InkTextAlignment,
  copyStart: number,
  copyEnd: number
): number | undefined => {
  if (copyEnd <= copyStart) return undefined;

  const stretch = stretchAt(alignment.stretches, copyStart);

  if (!stretch || copyEnd > stretch.aStart + stretch.length) return undefined;

  return stretch.bStart + (copyStart - stretch.aStart);
};

const mapCopyPoint = (
  alignment: InkTextAlignment,
  copyText: string,
  liveText: string,
  offset: number
): number | undefined => {
  if (copyText.length === 0) return liveText.length === 0 ? 0 : undefined;

  const [gapStart, gapEnd] = gapAround(copyText, offset);

  let liveGapStart: number;

  if (gapStart === 0) {
    const first = stretchAt(alignment.stretches, 0);

    if (first?.bStart !== 0) return undefined;
    liveGapStart = 0;
  } else {
    const left = mapCopySpan(alignment, gapStart - 1, gapStart);

    if (left === undefined) return undefined;
    liveGapStart = left + 1;
  }

  let liveGapEnd: number;

  if (gapEnd === copyText.length) {
    const last = mapCopySpan(alignment, copyText.length - 1, copyText.length);

    if (last !== liveText.length - 1) return undefined;
    liveGapEnd = liveText.length;
  } else {
    const right = mapCopySpan(alignment, gapEnd, gapEnd + 1);

    if (right === undefined) return undefined;
    liveGapEnd = right;
  }

  if (liveGapEnd < liveGapStart) return undefined;
  if (!/^\s*$/u.test(liveText.slice(liveGapStart, liveGapEnd))) {
    return undefined;
  }

  // Keep relative offset inside the gap when unchanged, else clamp to the gap.
  const within = offset - gapStart;

  return Math.min(liveGapEnd, liveGapStart + within);
};

const isCleanGraphemeBoundary = (text: string, offset: number) => {
  if (offset <= 0 || offset >= text.length) return true;
  if (isLowSurrogate(text.charCodeAt(offset))) return false;
  if (COMBINING_MARK.test(text[offset])) return false;

  return true;
};

const boundariesHold = (
  alignment: InkTextAlignment,
  copyText: string,
  liveText: string,
  copyStart: number,
  copyEnd: number,
  liveStart: number,
  liveEnd: number
) => {
  if (
    !isCleanGraphemeBoundary(liveText, liveStart) ||
    !isCleanGraphemeBoundary(liveText, liveEnd)
  ) {
    return false;
  }

  const copyPrev = copyStart > 0 ? copyText[copyStart - 1] : undefined;
  const livePrev = liveStart > 0 ? liveText[liveStart - 1] : undefined;
  const copyNext = copyEnd < copyText.length ? copyText[copyEnd] : undefined;
  const liveNext = liveEnd < liveText.length ? liveText[liveEnd] : undefined;

  if (
    (copyPrev === undefined || !WORD_CHAR.test(copyPrev)) &&
    livePrev !== undefined &&
    WORD_CHAR.test(livePrev)
  ) {
    return false;
  }
  if (
    (copyNext === undefined || !WORD_CHAR.test(copyNext)) &&
    liveNext !== undefined &&
    WORD_CHAR.test(liveNext)
  ) {
    return false;
  }

  // In unspaced CJK/Thai scripts, require the immediate neighbor on each side
  // to stay aligned (or non-segmented) so a run does not detach mid-word
  // across ICU versions.
  if (
    copyStart > 0 &&
    SEGMENTED_SCRIPT.test(copyText[copyStart]) &&
    copyPrev !== undefined &&
    SEGMENTED_SCRIPT.test(copyPrev)
  ) {
    const prevStretch = stretchAt(alignment.stretches, copyStart - 1);
    const startStretch = stretchAt(alignment.stretches, copyStart);

    if (!prevStretch || prevStretch !== startStretch) return false;
  }
  if (
    copyEnd < copyText.length &&
    SEGMENTED_SCRIPT.test(copyText[copyEnd - 1]) &&
    copyNext !== undefined &&
    SEGMENTED_SCRIPT.test(copyNext)
  ) {
    const endStretch = stretchAt(alignment.stretches, copyEnd - 1);
    const nextStretch = stretchAt(alignment.stretches, copyEnd);

    if (!endStretch || endStretch !== nextStretch) return false;
  }

  return true;
};

/**
 * Resolve one mark's runs inside a live block using an O(1) exact-copy fast
 * path or a cached dual-alignment diff when the block's text changed.
 */
export const matchMarkBlock = (
  copy: InkCopy,
  block: InkMarkBlock,
  now: InkText
): InkMatchedBlock => {
  metrics.matchCalls += 1;

  if (inkHolds(copy, now)) {
    metrics.exactFastPaths += 1;

    return {
      kind: 'exact',
      runs: block.runs.map((run) => ({
        ...run,
        copyEnd: run.end,
        copyStart: run.start,
      })),
    };
  }

  if (block.runs.length === 0) return { kind: 'changed' };

  const alignment = diffInkCopy(copy, now);

  if (!alignment) return { kind: 'changed' };

  // Merge touching runs (such as a single word wrapped across visual lines at
  // capture time) into logical spans before mapping so fragments never split
  // across separate occurrences.
  const logical: Array<{
    end: number;
    indices: number[];
    start: number;
  }> = [];

  for (const [index, run] of block.runs.entries()) {
    const prev = logical.at(-1);

    if (
      prev &&
      prev.end > prev.start &&
      run.end > run.start &&
      run.start === prev.end
    ) {
      prev.end = run.end;
      prev.indices.push(index);
    } else {
      logical.push({ end: run.end, indices: [index], start: run.start });
    }
  }

  const mapped = new Array<InkMatchedRun>(block.runs.length);

  for (const group of logical) {
    if (group.start === group.end) {
      const [gapStart, gapEnd] = gapAround(copy.text, group.start);
      const touchesVoid =
        (gapStart > 0 && copy.text[gapStart - 1] === INK_VOID) ||
        (gapEnd < copy.text.length && copy.text[gapEnd] === INK_VOID);

      if (touchesVoid && now.voids !== copy.voids) {
        return { kind: 'changed' };
      }

      const liveAt = mapCopyPoint(alignment, copy.text, now.text, group.start);

      if (liveAt === undefined || !isCleanGraphemeBoundary(now.text, liveAt)) {
        return { kind: 'changed' };
      }

      const run = block.runs[group.indices[0]];

      mapped[group.indices[0]] = {
        ...run,
        copyEnd: run.end,
        copyStart: run.start,
        end: liveAt,
        start: liveAt,
      };
      continue;
    }

    const slice = copy.text.slice(group.start, group.end);

    if (slice.includes(INK_VOID) && now.voids !== copy.voids) {
      return { kind: 'changed' };
    }

    const liveStart = mapCopySpan(alignment, group.start, group.end);

    if (liveStart === undefined) return { kind: 'changed' };

    const liveEnd = liveStart + (group.end - group.start);

    if (
      !boundariesHold(
        alignment,
        copy.text,
        now.text,
        group.start,
        group.end,
        liveStart,
        liveEnd
      )
    ) {
      return { kind: 'changed' };
    }

    const delta = liveStart - group.start;

    for (const index of group.indices) {
      const run = block.runs[index];

      mapped[index] = {
        ...run,
        copyEnd: run.end,
        copyStart: run.start,
        end: run.end + delta,
        start: run.start + delta,
      };
    }
  }

  return { kind: 'matched', runs: mapped };
};

export const marginLineSpanOf = (
  lines: readonly InkLine[],
  mark: InkMark,
  blockTop: number
): readonly [from: number, to: number] => {
  if (lines.length === 0) return [0, 0];

  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const sample of mark.samples) {
    const y = sample[1] - blockTop;

    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minY)) return [0, lines.length - 1];

  let from = -1;
  let to = -1;
  let nearest = 0;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const [index, line] of lines.entries()) {
    const lineBottom = line.top + line.height;

    if (line.top <= maxY && lineBottom >= minY) {
      if (from === -1) from = index;
      to = index;
    }

    const dist =
      maxY < line.top
        ? line.top - maxY
        : minY > lineBottom
          ? minY - lineBottom
          : 0;

    if (dist < bestDist) {
      bestDist = dist;
      nearest = index;
    }
  }

  return from === -1 ? [nearest, nearest] : [from, to];
};

const trimmedRange = (text: string, from: number, to: number) => {
  let start = from;
  let end = to;

  while (start < end && /\s/u.test(text[start])) start += 1;
  while (end > start && /\s/u.test(text[end - 1])) end -= 1;

  return start < end ? ([start, end] as const) : undefined;
};

/**
 * Anchor a margin note to the text of the copy lines it originally sat beside.
 * Unrelated edits on other lines of the same paragraph keep `changed: false`
 * and provide live character offsets for line tracking or vertical stretching.
 */
export const matchMarginBlock = (
  copy: InkCopy,
  block: InkMarkBlock,
  mark: InkMark,
  now: InkText
): InkMarginAnchor => {
  const [fromLine, toLine] = marginLineSpanOf(copy.lines, mark, block.top);

  if (copy.lines.length === 0) {
    return {
      changed: !inkHolds(copy, now),
      fromLine: 0,
      toLine: 0,
    };
  }

  const rawStart = lineStart(copy.lines, fromLine);
  const rawEnd = copy.lines[toLine].end;

  if (inkHolds(copy, now)) {
    return {
      changed: false,
      fromLine,
      liveEnd: rawEnd,
      liveStart: rawStart,
      toLine,
    };
  }

  const alignment = diffInkCopy(copy, now);

  if (!alignment) return { changed: true, fromLine, toLine };

  const trimmed = trimmedRange(copy.text, rawStart, rawEnd);

  if (!trimmed) {
    return { changed: now.text.trim().length > 0, fromLine, toLine };
  }

  const [trimStart, trimEnd] = trimmed;
  const fullLiveStart = mapCopySpan(alignment, trimStart, trimEnd);
  const voidOk =
    !copy.text.slice(trimStart, trimEnd).includes(INK_VOID) ||
    now.voids === copy.voids;

  if (fullLiveStart !== undefined && voidOk) {
    return {
      changed: false,
      fromLine,
      liveEnd: fullLiveStart + (trimEnd - trimStart),
      liveStart: fullLiveStart,
      toLine,
    };
  }

  // Even if text inside a multi-line span changed, keep start/end endpoints
  // when both boundary lines still map cleanly (for vertical margin bars).
  const firstTrim = trimmedRange(
    copy.text,
    lineStart(copy.lines, fromLine),
    copy.lines[fromLine].end
  );
  const lastTrim = trimmedRange(
    copy.text,
    lineStart(copy.lines, toLine),
    copy.lines[toLine].end
  );
  const liveStart =
    firstTrim && mapCopySpan(alignment, firstTrim[0], firstTrim[1]);
  const liveEndStart =
    lastTrim && mapCopySpan(alignment, lastTrim[0], lastTrim[1]);
  const liveEnd =
    liveEndStart !== undefined && lastTrim
      ? liveEndStart + (lastTrim[1] - lastTrim[0])
      : undefined;

  return {
    changed: true,
    fromLine,
    ...(liveStart !== undefined && liveEnd !== undefined && liveEnd >= liveStart
      ? { liveEnd, liveStart }
      : {}),
    toLine,
  };
};
