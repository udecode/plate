import type { MarkdownDiagnostic } from '../types';
import type { MarkdownTagRegistry } from './markdownTags';

const LIST = /^ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|$)/;
const INDENTED = /^(?: {4}|\t)/;
const LEADING_WHITESPACE = /^[ \t]/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;
const MATH = /^ {0,3}\$\$/;
const MATH_ON_ONE_LINE = /\$\$.*\$\$/;
const RAW_HTML = /^ {0,3}<(!--|pre|script|style|textarea)(?=[\s>]|$)/i;
const RAW_HTML_END: Readonly<Record<string, RegExp>> = {
  '!--': /-->/,
  pre: /<\/pre>/i,
  script: /<\/script>/i,
  style: /<\/style>/i,
  textarea: /<\/textarea>/i,
};

/** Link and footnote definitions resolve across the whole source. */
export const MARKDOWN_DEFINITION = /(?:^|\n) {0,3}\[[^\]\n]+\]:/;

type ScanState = {
  fence: Readonly<{ char: string; length: number }> | null;
  math: boolean;
  previousNonBlank: string | null;
  rawEnd: RegExp | null;
  tagDepth: number;
};

const escapeTag = (name: string) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createTagPatterns = (tags: MarkdownTagRegistry) => {
  const names = [...tags]
    .filter(([, kind]) => kind === 'block')
    .map(([name]) => escapeTag(name));

  return names.length === 0
    ? null
    : {
        close: new RegExp(`</(?:${names.join('|')})\\s*>`, 'g'),
        open: new RegExp(`<(?:${names.join('|')})(?=[\\s>/])[^>]*?(/?)>`, 'g'),
      };
};

const scanLine = (
  state: ScanState,
  line: string,
  tags: ReturnType<typeof createTagPatterns>
) => {
  state.previousNonBlank = line;
  if (state.fence) {
    const close = FENCE.exec(line);

    if (
      close?.[1][0] === state.fence.char &&
      close[1].length >= state.fence.length &&
      line.trim() === close[1]
    ) {
      state.fence = null;
    }

    return;
  }
  if (state.math) {
    if (MATH.test(line)) state.math = false;

    return;
  }
  if (state.rawEnd) {
    if (state.rawEnd.test(line)) state.rawEnd = null;

    return;
  }
  const fence = FENCE.exec(line);

  if (fence) {
    state.fence = { char: fence[1][0], length: fence[1].length };

    return;
  }
  if (MATH.test(line) && !MATH_ON_ONE_LINE.test(line.trim())) {
    state.math = true;

    return;
  }
  const raw = RAW_HTML.exec(line);

  if (raw) {
    const end = RAW_HTML_END[raw[1].toLowerCase()];

    if (!end.test(line.slice(raw.index + raw[0].length))) state.rawEnd = end;

    return;
  }
  if (!tags) return;
  for (const match of line.matchAll(tags.open)) {
    if (match[1] !== '/') state.tagDepth += 1;
  }
  for (const _ of line.matchAll(tags.close)) {
    state.tagDepth = Math.max(0, state.tagDepth - 1);
  }
};

/**
 * Offsets after `from` where a streamed source can be split without changing
 * how either side parses: a blank line followed by a new block, with no open
 * fence, math block, raw HTML block or registered block tag, and no list or
 * indented line before it that the next block could continue. The next block
 * must start unindented and not with a list marker, since either can continue
 * an earlier list item or list. `from` must be such a boundary itself (or 0).
 */
export const findMarkdownSegmentBoundaries = (
  source: string,
  from: number,
  tags: MarkdownTagRegistry
): number[] => {
  const tagPatterns = createTagPatterns(tags);
  const state: ScanState = {
    fence: null,
    math: false,
    previousNonBlank: null,
    rawEnd: null,
    tagDepth: 0,
  };
  const boundaries: number[] = [];
  let pendingBlank = false;
  let offset = from;

  while (offset < source.length) {
    const newline = source.indexOf('\n', offset);
    const end = newline === -1 ? source.length : newline + 1;
    const line = source.slice(offset, end).replace(/\r?\n$/, '');
    const blank = line.trim() === '';

    if (
      !blank &&
      pendingBlank &&
      !LEADING_WHITESPACE.test(line) &&
      !LIST.test(line) &&
      state.previousNonBlank !== null &&
      !state.fence &&
      !state.math &&
      !state.rawEnd &&
      state.tagDepth === 0 &&
      !LIST.test(state.previousNonBlank) &&
      !INDENTED.test(state.previousNonBlank)
    ) {
      boundaries.push(offset);
    }
    pendingBlank = blank;
    if (!blank) scanLine(state, line, tagPatterns);
    offset = end;
  }

  return boundaries;
};

const shiftPoint = <
  T extends Readonly<{ line: number; offset?: number }> | undefined,
>(
  point: T,
  lines: number,
  offset: number
): T =>
  point
    ? {
        ...point,
        line: point.line + lines,
        ...(point.offset === undefined
          ? {}
          : { offset: point.offset + offset }),
      }
    : point;

/** Move a segment's diagnostic to whole-source coordinates. */
export const shiftMarkdownDiagnostic = (
  diagnostic: MarkdownDiagnostic,
  lines: number,
  offset: number
): MarkdownDiagnostic => {
  const source = 'source' in diagnostic ? diagnostic.source : undefined;

  if (!source || (lines === 0 && offset === 0)) return diagnostic;

  return {
    ...diagnostic,
    source: {
      ...source,
      end: shiftPoint(source.end, lines, offset),
      start: shiftPoint(source.start, lines, offset),
    },
  } as MarkdownDiagnostic;
};

/** Lines before `offset`. */
export const countMarkdownLines = (source: string, offset: number) => {
  let lines = 0;

  for (let index = source.indexOf('\n'); index !== -1 && index < offset;) {
    lines += 1;
    index = source.indexOf('\n', index + 1);
  }

  return lines;
};
