import type { MarkdownDiagnostic } from '../types';
import { type MarkdownTagRegistry, markdownTextEnd } from './markdownTags';

const LIST = /^ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|$)/;
const LIST_START = /^\d{1,9}$/;
const INDENTED = /^(?: {4}|\t)/;
const LEADING_WHITESPACE = /^[ \t]/;
// CommonMark whitespace is spaces and tabs only, not a no-break space.
const BLANK = /^[ \t]*$/;
const LINE_END = /\r\n?|\n/g;
// A math block opens and closes like a code fence, with two or more dollars.
const FENCE = /^ {0,3}(`{3,}|~{3,}|\${2,})/;
// A raw tag and a comment, two of the HTML blocks a blank line does not end,
// each with what ends it anywhere on a line, its first line included.
const RAW_HTML: ReadonlyArray<readonly [start: RegExp, end: RegExp]> = [
  [
    /^ {0,3}<(?:pre|script|style|textarea)(?=[ \t>]|$)/i,
    /<\/(?:pre|script|style|textarea)>/i,
  ],
  [/^ {0,3}<!--/, /-->/],
];
const BYTE_ORDER_MARK = '\uFEFF';

/**
 * Link and footnote definitions resolve across the whole source. A definition
 * can sit in a quote or list item, escape a bracket or break its label across
 * lines. micromark skips a byte order mark that starts the source.
 */
export const MARKDOWN_DEFINITION =
  /(?:^\uFEFF?|[\n\r])(?:[ \t>]|[*+-][ \t]|\d{1,9}[.)][ \t])*\[(?:[^[\]\\]|\\[\s\S])+\]:/;

/**
 * Whether a continued parse reads `source` whole instead of reusing segments:
 * a definition resolves across the whole source, and a segment without the
 * source's carriage returns or leading byte order mark reads its line endings
 * and offsets differently.
 */
export const readsMarkdownWhole = (source: string) =>
  MARKDOWN_DEFINITION.test(source) ||
  source.includes('\r') ||
  source.startsWith(BYTE_ORDER_MARK);

type ScanState = {
  fence: Readonly<{ char: string; length: number }> | null;
  openList: boolean;
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
      BLANK.test(line.slice(close[0].length))
    ) {
      state.fence = null;
    }

    return;
  }
  if (state.rawEnd) {
    if (state.rawEnd.test(line)) state.rawEnd = null;

    return;
  }
  if (LIST.test(line)) state.openList = true;
  const fence = FENCE.exec(line);

  // The info string of a backtick or dollar fence never holds its own marker.
  if (
    fence &&
    (fence[1].startsWith('~') ||
      !line.slice(fence[0].length).includes(fence[1][0]))
  ) {
    state.fence = { char: fence[1][0], length: fence[1].length };

    return;
  }
  const raw = RAW_HTML.find(([start]) => start.test(line));

  if (raw) {
    if (!raw[1].test(line)) state.rawEnd = raw[1];

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
 * fence, math block or raw HTML block, no open list and no indented line before
 * it that the next block could continue. The next block must start unindented
 * and not with a list marker or a last line of digits that can still become
 * one, since either can continue an earlier list item or list. A list stays
 * open until such a block starts after a blank line, because a streamed chunk
 * can end inside the next item's marker. `from` must be such a boundary itself
 * (or 0).
 *
 * The count of registered block tags only skips offsets inside a balanced tag.
 * It reads no pairing, so it can reach 0 while a tag is open, and the caller
 * must still refuse a segment that ends inside an unclosed tag.
 */
export const findMarkdownSegmentBoundaries = (
  source: string,
  from: number,
  tags: MarkdownTagRegistry
): number[] => {
  const tagPatterns = createTagPatterns(tags);
  const state: ScanState = {
    fence: null,
    openList: false,
    previousNonBlank: null,
    rawEnd: null,
    tagDepth: 0,
  };
  const boundaries: number[] = [];
  const textEnd = markdownTextEnd(source);
  let pendingBlank = false;
  let offset = from;

  while (offset < source.length) {
    LINE_END.lastIndex = offset;
    const lineEnd = LINE_END.exec(source);
    const line = source.slice(offset, lineEnd?.index ?? source.length);
    const blank = BLANK.test(line);

    if (
      !blank &&
      pendingBlank &&
      !LEADING_WHITESPACE.test(line) &&
      !LIST.test(line) &&
      !(lineEnd === null && LIST_START.test(line)) &&
      state.previousNonBlank !== null &&
      !state.fence &&
      !state.rawEnd &&
      state.tagDepth === 0
    ) {
      if (
        !state.openList &&
        !INDENTED.test(state.previousNonBlank) &&
        // A segment's parse drops a byte order mark that starts it.
        !line.startsWith(BYTE_ORDER_MARK) &&
        // The tag pass reads an unclosed tag before trailing whitespace, a
        // no-break space included, as still arriving.
        offset < textEnd
      ) {
        boundaries.push(offset);
      }
      state.openList = false;
    }
    pendingBlank = blank;
    if (!blank) scanLine(state, line, tagPatterns);
    offset = lineEnd ? LINE_END.lastIndex : source.length;
  }

  return boundaries;
};

/**
 * Whether the last root node of a segment's own parse can take what the stream
 * adds after the segment: a block that runs past the segment's last line of
 * text, such as an unclosed fence, comment or raw tag.
 */
export const holdsMarkdownSegmentOpen = (
  segment: string,
  last: Readonly<{
    position?: Readonly<{ end: Readonly<{ line: number }> }>;
  }> | null
) => {
  if (!last?.position) return true;
  const lines = segment.split(LINE_END);
  let text = lines.length;

  while (text > 0 && BLANK.test(lines[text - 1])) text -= 1;

  return last.position.end.line > text;
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

export const countMarkdownLines = (source: string, offset: number) =>
  source.slice(0, offset).match(LINE_END)?.length ?? 0;
