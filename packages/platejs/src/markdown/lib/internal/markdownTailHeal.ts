import type { RootContent as MdRootContent } from 'mdast';

import type { CompiledMarkdownMappings } from './markdownMappings';
import {
  getMarkdownParser,
  type MarkdownRuntime,
  samePlugins,
} from './markdownRuntime';
import type { MarkdownTagRegistry } from './markdownTags';

export type MarkdownTailGrammar = Readonly<{
  attention: 'cjkFriendly' | 'commonmark' | null;
  math: boolean;
  strikethrough: 'cjkFriendly' | 'gfm' | null;
  table: boolean;
}>;

export type MarkdownTailHealOptions = Readonly<{
  grammar: MarkdownTailGrammar;
  incompleteLinks: 'placeholder' | 'text';
  mode: 'blocks' | 'inline';
  tags: MarkdownTagRegistry;
}>;

export type HealedMarkdownTail = Readonly<{
  healed: string;
  heldSuffix: string;
  modified: boolean;
}>;

const TAIL_GRAMMAR_PROBE =
  'a**「b」**\n\n**b**\n\na~~「b」~~\n\n~~b~~\n\n$a$\n\n| a |\n| - |\n| b |';

const tailGrammars = new WeakMap<
  CompiledMarkdownMappings,
  Readonly<{
    grammar: MarkdownTailGrammar;
    remarkPlugins: readonly unknown[];
  }>
>();

const hasNodeType = (
  node: MdRootContent | undefined,
  type: string
): boolean => {
  if (!node) return false;
  if (node.type === type) return true;
  if ('children' in node) {
    return node.children.some((child) => hasNodeType(child, type));
  }

  return false;
};

export const probeMarkdownTailGrammar = (
  runtime: MarkdownRuntime
): MarkdownTailGrammar => {
  const { remarkPlugins } = runtime.options;
  const cached = tailGrammars.get(runtime.formats);

  if (cached && samePlugins(cached, remarkPlugins)) return cached.grammar;

  let grammar: MarkdownTailGrammar = {
    attention: null,
    math: false,
    strikethrough: null,
    table: false,
  };

  try {
    const { children } = getMarkdownParser(runtime).parse(TAIL_GRAMMAR_PROBE);
    const [cjkStrong, strong, cjkDelete, deleted, mathNode, tableNode] =
      children;

    grammar = {
      attention: hasNodeType(strong, 'strong')
        ? hasNodeType(cjkStrong, 'strong')
          ? 'cjkFriendly'
          : 'commonmark'
        : null,
      math: hasNodeType(mathNode, 'inlineMath'),
      strikethrough: hasNodeType(deleted, 'delete')
        ? hasNodeType(cjkDelete, 'delete')
          ? 'cjkFriendly'
          : 'gfm'
        : null,
      table: tableNode?.type === 'table',
    };
  } catch {
    // Keep conservative default grammar if a custom parser rejects the probe.
  }

  tailGrammars.set(runtime.formats, { grammar, remarkPlugins });

  return grammar;
};

const MAX_INCOMPLETE_TAG_LENGTH = 256;
const MAX_INLINE_HEAL_WINDOW = 4096;
const MAX_HELD_MARKERS = 3;

const isInsideInlineCodeAt = (
  source: string,
  limit: number,
  blockStart = 0
): boolean => {
  const start = Math.max(0, blockStart);
  let openTicks = 0;

  for (let i = start; i < limit; i++) {
    const ch = source[i];

    // Blank lines end any CommonMark paragraph and reset open inline code spans.
    if (ch === '\n') {
      let next = i + 1;

      while (
        next < limit &&
        (source[next] === ' ' || source[next] === '\t' || source[next] === '>')
      ) {
        next += 1;
      }
      if (next < limit && source[next] === '\n') {
        openTicks = 0;
        i = next;
        continue;
      }
    }

    if (openTicks > 0) {
      if (ch === '`') {
        let end = i;

        while (end < limit && source[end] === '`') end += 1;
        if (end - i === openTicks) openTicks = 0;
        i = end - 1;
      }
      continue;
    }
    if (ch === '\\') {
      i += 1;
      continue;
    }
    if (ch === '`') {
      let end = i;

      while (end < limit && source[end] === '`') end += 1;
      openTicks = end - i;
      i = end - 1;
    }
  }

  return openTicks > 0;
};

/** Streaming preview only: hide a bounded trailing `<...` that may still become a registered tag. */
export const trimIncompleteRegisteredTag = (
  source: string,
  tags: MarkdownTagRegistry,
  blockStart = 0
): string => {
  const lt = source.lastIndexOf('<');

  if (
    lt === -1 ||
    source.length - lt > MAX_INCOMPLETE_TAG_LENGTH ||
    /[>\n\r]/.test(source.slice(lt)) ||
    isInsideInlineCodeAt(source, lt, blockStart)
  ) {
    return source;
  }
  let backslashes = 0;

  for (let i = lt - 1; i >= blockStart && source[i] === '\\'; i--) {
    backslashes += 1;
  }
  if (backslashes % 2 === 1) return source;

  const match = /^<\/?([A-Za-z][\w-]*)?/.exec(source.slice(lt));

  if (!match) return source;
  const name = match[1] ?? '';
  const typingName = match[0].length === source.length - lt;
  const couldBeTag = typingName
    ? [...tags.keys()].some((tag) => tag.startsWith(name))
    : tags.has(name);

  return couldBeTag ? source.slice(0, lt) : source;
};

const FENCE_RE = /^ {0,3}(`{3,}|~{3,})/;
const CONTAINER_PREFIX_RE =
  /^(?:[ \t]*>[ \t]?|[ \t]*(?:[*+-]|\d{1,9}[.)])[ \t]+)*/;
const BLOCK_START_RE =
  /^ {0,3}(?:#{1,6}(?:[ \t]|$)|>|(?:[*+-]|\d{1,9}[.)])[ \t])/;
const INDENTED_CODE_RE = /^(?: {4}|\t)/;
const MATH_FENCE_RE = /^ {0,3}\$\$[ \t]*$/;
const BLANK_RE = /^[ \t]*$/;
const RAW_HTML_BLOCKS: ReadonlyArray<readonly [RegExp, RegExp]> = [
  [
    /^ {0,3}<(?:pre|script|style|textarea)(?=[ \t>]|$)/i,
    /<\/(?:pre|script|style|textarea)>/i,
  ],
  [/^ {0,3}<!--/, /-->/],
  [/^ {0,3}<\?/, /\?>/],
  [/^ {0,3}<!\[CDATA\[/, /\]\]>/],
  [/^ {0,3}<![A-Za-z]/, />/],
];
const TYPE6_HTML_TAG_RE =
  /^ {0,3}<\/?(address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?=[ \t/>]|$)/i;
const THEMATIC_BREAK_LINE_RE =
  /^[ \t]{0,3}(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})$/;

// Linear character scan to avoid quadratic regex backtracking on long lines.
const parseType7HtmlTagName = (line: string): string | null => {
  let i = 0;

  while (i < 3 && i < line.length && line[i] === ' ') i += 1;
  if (line[i] !== '<') return null;
  i += 1;
  const closing = line[i] === '/';

  if (closing) i += 1;
  const nameStart = i;

  if (i >= line.length || !/[A-Za-z]/.test(line[i])) return null;
  i += 1;
  while (i < line.length && /[A-Za-z0-9-]/.test(line[i])) i += 1;
  const name = line.slice(nameStart, i);

  if (closing) {
    while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i += 1;
  } else if (i < line.length && line[i] !== '>' && line[i] !== '/') {
    if (!/[ \t]/.test(line[i])) return null;
    while (i < line.length && line[i] !== '>' && line[i] !== '<') i += 1;
  } else if (line[i] === '/') {
    i += 1;
  }
  if (line[i] !== '>') return null;
  i += 1;

  while (i < line.length && (line[i] === ' ' || line[i] === '\t')) i += 1;

  return i === line.length ? name : null;
};

const isPartialTableSeparator = (line: string): boolean => {
  const trimmed = line.trim();

  if (!trimmed) return true;
  const inner = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const parts = inner.split('|');

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    const isLast = i === parts.length - 1;

    if (isLast) {
      if (!/^:?-{0,}:?$/.test(part)) return false;
    } else if (!/^:?-{1,}:?$/.test(part)) {
      return false;
    }
  }

  return true;
};

type BlockScanResult = Readonly<{
  activeBlockStart: number;
  inFence: boolean;
  inIndentedCode: boolean;
  inMathBlock: boolean;
  inRawHtml: boolean;
  mathBodyStart: number;
}>;

const startsType6Or7HtmlBlock = (
  line: string,
  tags: MarkdownTagRegistry
): boolean => {
  const m6 = TYPE6_HTML_TAG_RE.exec(line);

  if (m6) return !tags.has(m6[1]) && !tags.has(m6[1].toLowerCase());
  const name7 = parseType7HtmlTagName(line);

  if (name7) return !tags.has(name7) && !tags.has(name7.toLowerCase());

  return false;
};

export const scanMarkdownTailBlocks = (
  source: string,
  allowMath: boolean,
  tags: MarkdownTagRegistry
): BlockScanResult => {
  let offset = 0;
  const state: {
    fence: { char: string; inContainer: boolean; length: number } | null;
    inMathBlock: boolean;
    inType6Html: boolean;
    mathBodyStart: number;
    rawEnd: RegExp | null;
    singleLineRawHtml: boolean;
  } = {
    fence: null,
    inMathBlock: false,
    inType6Html: false,
    mathBodyStart: -1,
    rawEnd: null,
    singleLineRawHtml: false,
  };
  let inIndentedCode = false;
  let activeBlockStart = 0;
  let afterBlank = true;

  const stripContainerPrefix = (line: string): string => {
    const match = CONTAINER_PREFIX_RE.exec(line);

    return match ? line.slice(match[0].length) : line;
  };

  const enterLineBlock = (line: string, nl: number) => {
    state.singleLineRawHtml = false;
    const inner = stripContainerPrefix(line);
    const directFence = FENCE_RE.exec(line);
    const openFence = directFence ?? FENCE_RE.exec(inner);
    const fenceLine = directFence ? line : inner;

    if (
      openFence &&
      (openFence[1].startsWith('~') ||
        !fenceLine.slice(openFence[0].length).includes(openFence[1][0]))
    ) {
      state.fence = {
        char: openFence[1][0],
        inContainer: !directFence,
        length: openFence[1].length,
      };
    } else if (allowMath && MATH_FENCE_RE.test(line)) {
      state.inMathBlock = true;
      state.mathBodyStart = nl === -1 ? source.length : nl + 1;
    } else {
      const raw = RAW_HTML_BLOCKS.find(([start]) => start.test(line));

      if (raw) {
        if (raw[1].test(line)) {
          state.singleLineRawHtml = true;
        } else {
          state.rawEnd = raw[1];
        }
      } else if (startsType6Or7HtmlBlock(line, tags)) {
        state.inType6Html = true;
      }
    }
  };

  while (offset < source.length) {
    const nl = source.indexOf('\n', offset);
    const lineEnd = nl === -1 ? source.length : nl;
    const line = source.slice(offset, lineEnd);

    if (state.fence) {
      state.singleLineRawHtml = false;
      const closeTarget = state.fence.inContainer
        ? stripContainerPrefix(line)
        : line;
      const close = FENCE_RE.exec(closeTarget);

      if (
        close &&
        close[1].startsWith(state.fence.char) &&
        close[1].length >= state.fence.length &&
        BLANK_RE.test(closeTarget.slice(close[0].length))
      ) {
        state.fence = null;
        afterBlank = true;
        activeBlockStart = nl === -1 ? source.length : nl + 1;
      }
    } else if (state.inMathBlock) {
      state.singleLineRawHtml = false;
      if (MATH_FENCE_RE.test(line)) {
        state.inMathBlock = false;
        state.mathBodyStart = -1;
        afterBlank = true;
        activeBlockStart = nl === -1 ? source.length : nl + 1;
      }
    } else if (state.rawEnd) {
      state.singleLineRawHtml = false;
      if (state.rawEnd.test(line)) {
        state.rawEnd = null;
        state.singleLineRawHtml = true;
        afterBlank = true;
        activeBlockStart = nl === -1 ? source.length : nl + 1;
      }
    } else if (state.inType6Html) {
      state.singleLineRawHtml = false;
      if (BLANK_RE.test(line)) {
        state.inType6Html = false;
        afterBlank = true;
        activeBlockStart = nl === -1 ? source.length : nl + 1;
      }
    } else if (inIndentedCode) {
      state.singleLineRawHtml = false;
      const inner = stripContainerPrefix(line);

      if (!BLANK_RE.test(inner) && !INDENTED_CODE_RE.test(inner)) {
        inIndentedCode = false;
        activeBlockStart = offset;
        afterBlank = false;
        enterLineBlock(line, nl);
      }
    } else if (BLANK_RE.test(line)) {
      state.singleLineRawHtml = false;
      afterBlank = true;
      if (nl !== -1) {
        activeBlockStart = nl + 1;
      }
    } else {
      if (afterBlank) {
        activeBlockStart = offset;
        afterBlank = false;
        const inner = stripContainerPrefix(line);

        if (INDENTED_CODE_RE.test(line) || INDENTED_CODE_RE.test(inner)) {
          inIndentedCode = true;
          offset = nl === -1 ? source.length : nl + 1;
          continue;
        }
      } else if (
        BLOCK_START_RE.test(line) ||
        THEMATIC_BREAK_LINE_RE.test(line) ||
        state.singleLineRawHtml
      ) {
        activeBlockStart = offset;
      }
      enterLineBlock(line, nl);
    }

    offset = nl === -1 ? source.length : nl + 1;
  }

  return {
    activeBlockStart,
    inFence: state.fence !== null,
    inIndentedCode,
    inMathBlock: state.inMathBlock,
    inRawHtml:
      state.rawEnd !== null || state.inType6Html || state.singleLineRawHtml,
    mathBodyStart: state.mathBodyStart,
  };
};

const countTableCells = (line: string): number => {
  const trimmed = line.trim();

  if (!trimmed.includes('|')) return 0;
  let start = 0;
  let end = trimmed.length;

  if (trimmed.startsWith('|')) start += 1;
  if (end > start && trimmed.endsWith('|') && !trimmed.endsWith('\\|')) {
    end -= 1;
  }
  let count = 1;

  for (let i = start; i < end; i++) {
    if (trimmed[i] === '\\') {
      i += 1;
      continue;
    }
    if (trimmed[i] === '|') count += 1;
  }

  return count;
};

const healIncompleteTableSeparator = (
  source: string,
  activeBlockStart: number
): string | null => {
  const block = source.slice(activeBlockStart);
  const firstNl = block.indexOf('\n');

  if (firstNl === -1) return null;
  if (block.includes('\n', firstNl + 1)) return null;

  const headerLine = block.slice(0, firstNl);
  const sepLine = block.slice(firstNl + 1);

  if (!sepLine.includes('---') && !/\|[ \t]*:?-{1,}:?[ \t]*\|/.test(sepLine)) {
    return null;
  }
  if (!isPartialTableSeparator(sepLine)) {
    return null;
  }
  const headerCols = countTableCells(headerLine);

  if (headerCols === 0) return null;

  const trimmedSep = sepLine.trim();
  const hasLeadingPipe = trimmedSep.startsWith('|');
  const inner = hasLeadingPipe ? trimmedSep.slice(1) : trimmedSep;
  const parts = inner.split('|');

  // Only heal once the separator already has all columns (avoid inventing
  // columns before they arrive, which false-triggers on mismatched tables).
  const activeCols =
    parts.length > 1 && parts.at(-1)?.trim() === ''
      ? parts.length - 1
      : parts.length;

  if (activeCols !== headerCols) return null;

  const completed = Array.from({ length: headerCols }, (_, index) => {
    const part = parts[index]?.trim() ?? '';

    if (/^:?-{1,}:?$/.test(part)) return part;
    if (part === ':') return ':---';

    return '---';
  });

  const rebuilt = `${source.slice(0, activeBlockStart)}${headerLine}\n| ${completed.join(' | ')} |`;

  return rebuilt === source ? null : rebuilt;
};

const UNICODE_WS = /[\s\u00A0]/u;
const UNICODE_PUNCT = /[\p{P}\p{S}]/u;
const CJK_CHAR =
  /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u3130-\u318F\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFF00-\uFFEF]/u;

const isWhitespace = (ch: string | undefined) => !ch || UNICODE_WS.test(ch);
const isPunctuation = (ch: string | undefined) =>
  !!ch && UNICODE_PUNCT.test(ch);
const isCjkOrCjkPunct = (ch: string | undefined) => !!ch && CJK_CHAR.test(ch);

const STREAMING_URL_SCHEMES = ['https://', 'http://'] as const;

const isStreamingUrlPrefix = (dest: string): boolean => {
  if (!dest || /[\s<>()]/.test(dest)) return false;
  if (
    dest.startsWith('/') ||
    dest.startsWith('./') ||
    dest.startsWith('../') ||
    dest.startsWith('#') ||
    dest.startsWith('www.') ||
    dest.toLowerCase().startsWith('mailto:')
  ) {
    return true;
  }

  const lower = dest.toLowerCase();

  return STREAMING_URL_SCHEMES.some(
    (scheme) => lower.startsWith(scheme) || scheme.startsWith(lower)
  );
};

const safeStreamingDestination = (dest: string): string => {
  const lower = dest.toLowerCase();

  if (lower.startsWith('https://') && dest.length > 'https://'.length) {
    return dest;
  }
  if (lower.startsWith('http://') && dest.length > 'http://'.length) {
    return dest;
  }
  if (
    dest.startsWith('/') ||
    dest.startsWith('./') ||
    dest.startsWith('../') ||
    dest.startsWith('#')
  ) {
    return dest;
  }

  return '#';
};

type DelimiterEntry = {
  canClose: boolean;
  canOpen: boolean;
  char: '*' | '_' | '~';
  count: number;
  index: number;
  initialCount: number;
};

const classifyFlanking = (
  char: '*' | '_' | '~',
  before: string | undefined,
  after: string | undefined,
  cjkFriendly: boolean
): Readonly<{ canClose: boolean; canOpen: boolean }> => {
  const beforeWs = isWhitespace(before);
  const afterWs = isWhitespace(after);
  const beforePunct = isPunctuation(before);
  const afterPunct = isPunctuation(after);

  let leftFlanking = !afterWs && (!afterPunct || beforeWs || beforePunct);
  let rightFlanking = !beforeWs && (!beforePunct || afterWs || afterPunct);

  if (cjkFriendly && char !== '_') {
    if (!afterWs && isCjkOrCjkPunct(before)) leftFlanking = true;
    if (!beforeWs && isCjkOrCjkPunct(after)) rightFlanking = true;
  }

  if (char === '_') {
    return {
      canClose: rightFlanking && (!leftFlanking || afterPunct),
      canOpen: leftFlanking && (!rightFlanking || beforePunct),
    };
  }

  return {
    canClose: rightFlanking,
    canOpen: leftFlanking,
  };
};

const healInlineRegion = (
  region: string,
  options: MarkdownTailHealOptions
): Readonly<{ healed: string; heldSuffix: string }> => {
  if (!region) return { healed: region, heldSuffix: '' };

  const { grammar, incompleteLinks } = options;
  let working = region;

  // Scan raw input before trimming a trailing backslash because backslashes
  // inside code spans are literal.
  let codeSpan: { start: number; ticks: number } | null = null;
  let mathStart = -1;
  let mathIsCurrency = false;
  let linkOpen: {
    bracket: number;
    destStart: number;
    isImage: boolean;
    labelEnd: number;
  } | null = null;
  let openBracket: { index: number; isImage: boolean } | null = null;
  let inUnclosedHtml = false;
  let inUnclosedAutolink = false;
  let lastMatchedCloserEnd = -1;
  const delimiters: DelimiterEntry[] = [];

  let trailingBackslashes = 0;
  for (let i = region.length - 1; i >= 0 && region[i] === '\\'; i--) {
    trailingBackslashes += 1;
  }
  let hasTrailingBackslash = trailingBackslashes % 2 === 1;

  for (let i = 0; i < working.length; i++) {
    const ch = working[i];

    if (codeSpan) {
      if (ch === '`') {
        let end = i;

        while (end < working.length && working[end] === '`') end += 1;
        if (end - i === codeSpan.ticks) {
          codeSpan = null;
        }
        i = end - 1;
      }
      continue;
    }

    if (ch === '\\') {
      i += 1;
      continue;
    }

    if (linkOpen) {
      if (ch === ')') {
        for (const d of delimiters) {
          if (d.index > linkOpen.bracket) d.count = 0;
        }
        linkOpen = null;
      } else if (ch === '\n') {
        linkOpen = null;
      }
      continue;
    }

    if (ch === '`' && !inUnclosedAutolink) {
      let end = i;

      while (end < working.length && working[end] === '`') end += 1;
      codeSpan = { start: i, ticks: end - i };
      i = end - 1;
      continue;
    }

    if (ch === '<') {
      if (working.startsWith('<!--', i)) {
        const closeIdx = working.indexOf('-->', i + 4);

        if (closeIdx === -1) {
          inUnclosedHtml = true;
          break;
        }
        i = closeIdx + 2;
        continue;
      }
      if (working.startsWith('<?', i)) {
        const closeIdx = working.indexOf('?>', i + 2);

        if (closeIdx === -1) {
          inUnclosedHtml = true;
          break;
        }
        i = closeIdx + 1;
        continue;
      }
      if (working.startsWith('<![CDATA[', i)) {
        const closeIdx = working.indexOf(']]>', i + 9);

        if (closeIdx === -1) {
          inUnclosedHtml = true;
          break;
        }
        i = closeIdx + 2;
        continue;
      }
      if (/^<(?:https?:\/\/|mailto:)/i.test(working.slice(i))) {
        const closeIdx = working.indexOf('>', i + 1);

        if (closeIdx === -1 || working.slice(i, closeIdx).includes('\n')) {
          inUnclosedAutolink = true;
          continue;
        }
        i = closeIdx;
        continue;
      }
      if (/^<\/?[A-Za-z!]/.test(working.slice(i))) {
        let quote: '"' | "'" | null = null;
        let closeIdx = -1;

        for (let j = i + 1; j < working.length; j++) {
          const c = working[j];

          if (quote) {
            if (c === quote) quote = null;
            continue;
          }
          if (c === '"' || c === "'") {
            quote = c;
            continue;
          }
          if (c === '>') {
            closeIdx = j;
            break;
          }
          if (c === '\n' && working[j + 1] === '\n') break;
        }
        if (closeIdx !== -1) {
          i = closeIdx;
          continue;
        }
      }
    }

    if (
      grammar.math &&
      ch === '$' &&
      working[i + 1] !== '$' &&
      working[i - 1] !== '$'
    ) {
      if (mathStart === -1) {
        const next = working[i + 1];
        const prev = working[i - 1];
        const closesEmphasisAroundDollar =
          prev !== undefined &&
          (prev === '*' || prev === '_' || prev === '~') &&
          next === prev;

        if (!closesEmphasisAroundDollar) {
          // Track every unescaped single `$` toggle to match micromark's
          // parity, while marking currency-like openers so they neither skip
          // emphasis healing nor inject a synthetic closing `$`.
          mathStart = i;
          mathIsCurrency =
            !next ||
            isWhitespace(next) ||
            /^\d[\d,]*(?:\.\d+)?(?:[kKmMbBtT%]|(?:\s*(?:[-–]|\/)\s*\d[\d,]*(?:\.\d+)?[kKmMbBtT%]?))?(?=\s|[.,;:!?)/-]|$)/.test(
              working.slice(i + 1)
            );
        }
      } else {
        mathStart = -1;
        mathIsCurrency = false;
      }
      continue;
    }

    if (mathStart !== -1 && !mathIsCurrency) continue;

    if (ch === '!' && working[i + 1] === '[') {
      openBracket = { index: i, isImage: true };
      i += 1;
      continue;
    }

    if (ch === '[') {
      openBracket = { index: i, isImage: false };
      continue;
    }

    if (ch === ']' && openBracket) {
      if (working[i + 1] === '(') {
        linkOpen = {
          bracket: openBracket.index,
          destStart: i + 2,
          isImage: openBracket.isImage,
          labelEnd: i,
        };
        openBracket = null;
        i += 1;
        continue;
      }
      openBracket = null;
      continue;
    }

    if (
      (ch === '*' && grammar.attention !== null) ||
      (ch === '_' && grammar.attention !== null) ||
      (ch === '~' && grammar.strikethrough !== null)
    ) {
      let end = i;

      while (end < working.length && working[end] === ch) end += 1;
      const count = end - i;
      const before = i > 0 ? working[i - 1] : undefined;
      const after = end < working.length ? working[end] : undefined;
      const cjk =
        ch === '~'
          ? grammar.strikethrough === 'cjkFriendly'
          : grammar.attention === 'cjkFriendly';

      if (ch === '~' && count !== 2 && count !== 1) {
        i = end - 1;
        continue;
      }

      const flanking = classifyFlanking(ch, before, after, cjk);
      const openingPunctAtEof =
        end === working.length &&
        before !== undefined &&
        /[([{]/.test(before) &&
        !delimiters.some(
          (d) => d.char === ch && d.count === count && d.canOpen
        );
      const { canOpen } = flanking;
      const canClose = openingPunctAtEof ? false : flanking.canClose;
      let remaining = count;

      if (canClose) {
        for (let d = delimiters.length - 1; d >= 0 && remaining > 0; d--) {
          const opener = delimiters[d];

          if (opener.char !== ch || !opener.canOpen || opener.count === 0) {
            continue;
          }
          if (ch === '~' && opener.count !== remaining) continue;
          if (
            ch !== '~' &&
            (opener.canClose || canOpen) &&
            (opener.count + remaining) % 3 === 0 &&
            (opener.count % 3 !== 0 || remaining % 3 !== 0)
          ) {
            continue;
          }
          const used =
            ch === '~'
              ? opener.count
              : remaining >= 2 && opener.count >= 2
                ? 2
                : 1;

          opener.count -= used;
          remaining -= used;
          lastMatchedCloserEnd = end - remaining;
          for (let inner = d + 1; inner < delimiters.length; inner++) {
            delimiters[inner].count = 0;
          }
          if (opener.count > 0 && remaining > 0) d += 1;
        }
      }

      if (remaining > 0 && canOpen) {
        delimiters.push({
          canClose,
          canOpen,
          char: ch,
          count: remaining,
          index: end - remaining,
          initialCount: count,
        });
      }

      i = end - 1;
    }
  }

  if (inUnclosedHtml) return { healed: region, heldSuffix: '' };

  if (codeSpan) {
    hasTrailingBackslash = false;
  } else if (hasTrailingBackslash) {
    working = working.slice(0, -1);
  }

  // Skip space-padded spans: CommonMark strips spaces only once both ends have space.
  let closedInlineSpan = false;
  let heldBackticks = '';

  if (codeSpan && codeSpan.ticks === 1) {
    const body = working.slice(codeSpan.start + 1);
    const charBeforeTick =
      codeSpan.start > 0 ? working[codeSpan.start - 1] : undefined;
    const allowsMultiline =
      charBeforeTick === undefined || !/[A-Za-z0-9]/.test(charBeforeTick);

    if (body.length === 0) {
      heldBackticks = '`';
    } else if (
      !body.includes('`') &&
      !body.startsWith(' ') &&
      (!body.includes('\n') ||
        (allowsMultiline && body.length <= 200 && !/\n {0,3}-/.test(body)))
    ) {
      let codeEnd = working.length;

      while (
        codeEnd > codeSpan.start + 1 &&
        (working[codeEnd - 1] === ' ' || working[codeEnd - 1] === '\n')
      ) {
        codeEnd -= 1;
      }
      if (codeEnd > codeSpan.start + 1) {
        working = `${working.slice(0, codeEnd)}\`${working.slice(codeEnd)}`;
        closedInlineSpan = true;
      }
    }
  }

  // Require math-like start and an ASCII letter or backslash so currency
  // (`$50`) and punctuation (`$.;'`) stay literal.
  if (!codeSpan && mathStart !== -1 && !mathIsCurrency && grammar.math) {
    const body = working.slice(mathStart + 1);

    if (
      body.length > 0 &&
      !body.includes('\n') &&
      /^[A-Za-z0-9(\\[{-]/.test(body) &&
      !/\s$/.test(body) &&
      /[A-Za-z\\]/.test(body)
    ) {
      working = `${working}$`;
      closedInlineSpan = true;
    }
  }

  let suffix = '';
  let linkHealed = false;
  let linkLabelHasMarkers = false;

  if (linkOpen) {
    const dest = working.slice(linkOpen.destStart);
    const label = working.slice(linkOpen.bracket + 1, linkOpen.labelEnd);

    if (isStreamingUrlPrefix(dest) && (linkOpen.isImage || label.length > 0)) {
      for (const d of delimiters) {
        if (d.index > linkOpen.bracket) d.count = 0;
      }
      if (!linkOpen.isImage && incompleteLinks === 'text') {
        linkLabelHasMarkers = /[*_~]/.test(label);
        working = `${working.slice(0, linkOpen.bracket)}${label}`;
      } else {
        const safeDest = safeStreamingDestination(dest);

        working = `${working.slice(0, linkOpen.destStart)}${safeDest})`;
      }
      linkHealed = true;
    }
  }

  // Hold trailing bare markers for post-parse trimming so `Use **`, `  Foo *`,
  // `- [ ] *`, and `- a\n**` hide markers without stripping preceding spaces.
  const activeDelims = delimiters.filter((d) => d.count > 0 && d.canOpen);
  const lastNlIdx = working.lastIndexOf('\n');
  const lastLine = lastNlIdx === -1 ? working : working.slice(lastNlIdx + 1);
  const isThematicLine = THEMATIC_BREAK_LINE_RE.test(lastLine);
  let heldCount = (hasTrailingBackslash ? 1 : 0) + heldBackticks.length;
  let heldMarkers = '';

  const openHiddenCount = activeDelims.reduce(
    (sum, d) =>
      sum + (d.char === '~' ? (d.count === 2 ? 2 : 0) : Math.min(d.count, 3)),
    0
  );

  if (!isThematicLine && !closedInlineSpan && !heldBackticks) {
    let cursor = working.length;
    let remainingOpenHidden = openHiddenCount;

    while (cursor > lastMatchedCloserEnd) {
      const tailChar = working[cursor - 1];
      const allowed =
        (tailChar === '*' && grammar.attention !== null) ||
        (tailChar === '_' && grammar.attention !== null) ||
        (tailChar === '~' && grammar.strikethrough !== null);

      if (!allowed) break;

      let runStart = cursor - 1;

      while (
        runStart > lastMatchedCloserEnd &&
        working[runStart - 1] === tailChar
      ) {
        runStart -= 1;
      }
      const runLen = cursor - runStart;
      let bs = 0;
      for (let j = runStart - 1; j >= 0 && working[j] === '\\'; j--) {
        bs += 1;
      }
      if (bs % 2 === 1) break;

      const before = runStart > 0 ? working[runStart - 1] : undefined;
      const midWordUnderscore =
        tailChar === '_' &&
        before !== undefined &&
        !isWhitespace(before) &&
        !isPunctuation(before);

      if (midWordUnderscore) break;

      const top = activeDelims.at(-1);
      const onStack = top && top.index === runStart && top.count === runLen;
      const isPartialDoubleCloser =
        !onStack &&
        runLen === 1 &&
        (tailChar === '_' || tailChar === '*') &&
        before !== undefined &&
        !isWhitespace(before) &&
        activeDelims.some(
          (d) =>
            d.char === tailChar &&
            d.count === 2 &&
            d.initialCount === 2 &&
            runStart > d.index + 2
        );

      if (isPartialDoubleCloser) break;

      const otherOpenHidden = onStack
        ? remainingOpenHidden -
          (top.char === '~'
            ? top.count === 2
              ? 2
              : 0
            : Math.min(top.count, 3))
        : remainingOpenHidden;

      if (runLen + heldCount + otherOpenHidden > MAX_HELD_MARKERS) break;

      heldMarkers = working.slice(runStart, cursor) + heldMarkers;
      heldCount += runLen;
      remainingOpenHidden = otherOpenHidden;
      if (onStack) activeDelims.pop();
      cursor = runStart;
    }
  }

  // Place closers before trailing whitespace and before unheld space-preceded
  // marker runs like `**foo bar **\n` so `"foo bar "` stays a prefix without
  // flashing raw `**` at the opener.
  const heldTailLen = heldBackticks.length + heldMarkers.length;
  const scanForClosers =
    heldTailLen > 0 ? working.slice(0, working.length - heldTailLen) : working;
  let outerWsStart = scanForClosers.length;
  while (outerWsStart > 0 && isWhitespace(scanForClosers[outerWsStart - 1])) {
    outerWsStart -= 1;
  }
  let closeRegion = scanForClosers.slice(0, outerWsStart);
  const outerTrailingWs = scanForClosers.slice(outerWsStart);
  let unheldTail = '';
  let markerEnd = closeRegion.length;

  while (
    markerEnd > 0 &&
    (closeRegion[markerEnd - 1] === '*' ||
      closeRegion[markerEnd - 1] === '_' ||
      closeRegion[markerEnd - 1] === '~')
  ) {
    markerEnd -= 1;
  }
  if (markerEnd < closeRegion.length) {
    let wsBeforeMarker = markerEnd;

    while (
      wsBeforeMarker > 0 &&
      isWhitespace(closeRegion[wsBeforeMarker - 1])
    ) {
      wsBeforeMarker -= 1;
    }
    if (
      wsBeforeMarker < markerEnd &&
      activeDelims.some(
        (d) => d.char === closeRegion[markerEnd] && wsBeforeMarker > d.index
      )
    ) {
      unheldTail = closeRegion.slice(wsBeforeMarker);
      closeRegion = closeRegion.slice(0, wsBeforeMarker);
    }
  }

  // Never inject a closer directly after `[label]:` (even inside blockquotes or
  // lists; doing so synthesizes a fake link definition whose URL is the closer).
  let colonTail = '';
  if (
    /(?:^|\n)(?:[ \t>]|[*+-][ \t]|\d{1,9}[.)][ \t])*\[(?:[^[\]\\]|\\[\s\S])+\]:$/.test(
      closeRegion
    )
  ) {
    colonTail = ':';
    closeRegion = closeRegion.slice(0, -1);
  }

  let wsStart = closeRegion.length;
  while (wsStart > 0 && isWhitespace(closeRegion[wsStart - 1])) {
    wsStart -= 1;
  }
  let core = closeRegion.slice(0, wsStart);
  const trailingSpaces = `${closeRegion.slice(wsStart)}${colonTail}${unheldTail}${outerTrailingWs}`;

  // If `core` ends with an unescaped trailing backslash before whitespace/newline
  // (e.g. `*foo\\\n`), drop that backslash before injecting emphasis closers so
  // `\` does not escape the injected closer (`*foo\*`).
  let coreEndBackslashes = 0;
  for (let i = core.length - 1; i >= 0 && core[i] === '\\'; i--) {
    coreEndBackslashes += 1;
  }
  const coreEndsWithEscape = coreEndBackslashes % 2 === 1;

  // Complete partial 2-char closers blocked by CommonMark rule-of-3 at EOF (e.g. `foo __*_` -> `foo __*__`).
  let trailingCoreBs = 0;
  for (let i = core.length - 2; i >= 0 && core[i] === '\\'; i--) {
    trailingCoreBs += 1;
  }
  const partialClosingMatch =
    !heldMarkers &&
    !trailingSpaces &&
    working.length > lastMatchedCloserEnd &&
    trailingCoreBs % 2 === 0 &&
    activeDelims.length > 0 &&
    (core.endsWith('_') || core.endsWith('*'));
  let partialCloserChar: '*' | '_' | null = null;

  if (partialClosingMatch) {
    const ch = core.at(-1) as '*' | '_';
    const matching = activeDelims.findLast(
      (d) => d.char === ch && d.count === 2 && d.initialCount === 2
    );

    if (
      matching &&
      !core.endsWith(ch + ch) &&
      core.length > matching.index + 2
    ) {
      partialCloserChar = ch;
    }
  }

  let closedMarkers = heldCount;
  let escapedCloserPrefix = '';

  if (partialCloserChar) {
    suffix = partialCloserChar;
    closedMarkers += 1;
  } else if (!linkLabelHasMarkers) {
    // Pick delimiters outermost-first within MAX_HELD_MARKERS so earlier closed
    // spans do not un-close when a deeper nested delimiter arrives, then emit
    // their closers in LIFO order.
    let closeCore = coreEndsWithEscape ? core.slice(0, -1) : core;
    let escapeWs = '';

    if (coreEndsWithEscape) {
      let wsBeforeEscape = closeCore.length;

      while (
        wsBeforeEscape > 0 &&
        isWhitespace(closeCore[wsBeforeEscape - 1])
      ) {
        wsBeforeEscape -= 1;
      }
      escapeWs = closeCore.slice(wsBeforeEscape);
      closeCore = closeCore.slice(0, wsBeforeEscape);
    }
    const chosen: DelimiterEntry[] = [];

    for (const opener of activeDelims) {
      if (opener.initialCount > 3) {
        continue;
      }
      const afterOpener = closeCore.slice(opener.index + opener.count);

      if (!afterOpener || BLANK_RE.test(afterOpener)) continue;
      const addLen =
        opener.char === '~' ? (opener.count === 2 ? 2 : 0) : opener.count;

      if (addLen === 0 || closedMarkers + addLen > MAX_HELD_MARKERS) continue;
      chosen.push(opener);
      closedMarkers += addLen;
    }
    if (chosen.length > 0) {
      for (let i = chosen.length - 1; i >= 0; i--) {
        suffix += chosen[i].char.repeat(chosen[i].count);
      }
      if (coreEndsWithEscape) {
        core = closeCore;
        escapedCloserPrefix = `${escapeWs}\\`;
      }
    }
  }

  // If we injected a closer (emphasis, code, math, or link), keep any trailing
  // held markers or backslash after `trailingSpaces` and trim them post-parse
  // so preceding spaces (e.g. `__foo _` or `**a \\`) survive CommonMark trimming.
  const heldSuffix = `${heldBackticks}${heldMarkers}${hasTrailingBackslash ? '\\' : ''}`;

  if (suffix || closedInlineSpan || linkHealed) {
    if (heldSuffix && trailingSpaces) {
      return {
        healed: `${core}${suffix}${escapedCloserPrefix}${trailingSpaces}${heldSuffix}`,
        heldSuffix,
      };
    }

    return {
      healed: `${core}${suffix}${escapedCloserPrefix}${trailingSpaces}`,
      heldSuffix: '',
    };
  }

  return {
    healed: region,
    heldSuffix,
  };
};

export const healMarkdownTail = (
  source: string,
  options: MarkdownTailHealOptions
): HealedMarkdownTail => {
  if (!source) return { healed: source, heldSuffix: '', modified: false };

  const blockState = scanMarkdownTailBlocks(
    source,
    options.grammar.math,
    options.tags
  );

  if (blockState.inFence || blockState.inIndentedCode || blockState.inRawHtml) {
    return { healed: source, heldSuffix: '', modified: false };
  }

  if (blockState.inMathBlock && options.grammar.math) {
    const body = source.slice(blockState.mathBodyStart);

    if (body.trim().length > 0 && !body.endsWith('\n$')) {
      const sep = body.endsWith('\n') ? '' : '\n';
      const healed = `${source.slice(0, blockState.mathBodyStart)}${body}${sep}$$`;

      return { healed, heldSuffix: '', modified: healed !== source };
    }

    return { healed: source, heldSuffix: '', modified: false };
  }

  if (options.mode === 'blocks' && options.grammar.table) {
    const activeBlock = source.slice(blockState.activeBlockStart);
    const firstNl = activeBlock.indexOf('\n');

    if (firstNl !== -1) {
      const secondNl = activeBlock.indexOf('\n', firstNl + 1);

      if (secondNl !== -1) {
        const headerLine = activeBlock.slice(0, firstNl);
        const sepLine = activeBlock.slice(firstNl + 1, secondNl);

        if (
          headerLine.includes('|') &&
          isPartialTableSeparator(sepLine) &&
          sepLine.includes('-')
        ) {
          const lastNl = source.lastIndexOf('\n');

          if (lastNl >= blockState.activeBlockStart + secondNl) {
            const lastLine = source.slice(lastNl + 1);
            const healedRow = healTableRowTail(lastLine, options);
            const healed = `${source.slice(0, lastNl + 1)}${healedRow.healed}`;

            return {
              healed,
              heldSuffix: healedRow.heldSuffix,
              modified: healed !== source || healedRow.heldSuffix.length > 0,
            };
          }
        }
      }
    }
  }

  const trimmed = trimIncompleteRegisteredTag(
    source,
    options.tags,
    blockState.activeBlockStart
  );

  if (options.mode === 'inline') {
    const windowStart = Math.max(
      blockState.activeBlockStart,
      trimmed.length - MAX_INLINE_HEAL_WINDOW
    );
    const prefix = trimmed.slice(0, windowStart);
    const { healed: healedRegion, heldSuffix } = healInlineRegion(
      trimmed.slice(windowStart),
      options
    );
    const healed = `${prefix}${healedRegion}`;

    return {
      healed,
      heldSuffix,
      modified: healed !== source || heldSuffix.length > 0,
    };
  }

  if (options.grammar.table) {
    const tableHealed = healIncompleteTableSeparator(
      trimmed,
      blockState.activeBlockStart
    );

    if (tableHealed !== null) {
      return {
        healed: tableHealed,
        heldSuffix: '',
        modified: tableHealed !== source,
      };
    }
  }

  const tailStart = Math.max(
    blockState.activeBlockStart,
    trimmed.length - MAX_INLINE_HEAL_WINDOW
  );
  const { healed: healedTail, heldSuffix } = healInlineRegion(
    trimmed.slice(tailStart),
    options
  );
  const healed = `${trimmed.slice(0, tailStart)}${healedTail}`;

  return {
    healed,
    heldSuffix,
    modified: healed !== source || heldSuffix.length > 0,
  };
};

// GFM splits table cells on every unescaped `|` before inline code parsing, so
// heal only the active cell after the last unescaped `|`.
export const healTableRowTail = (
  line: string,
  options: MarkdownTailHealOptions
): HealedMarkdownTail => {
  if (!line) return { healed: line, heldSuffix: '', modified: false };

  let lastPipe = -1;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '\\') {
      i += 1;
      continue;
    }
    if (ch === '|') lastPipe = i;
  }

  const prefix = lastPipe === -1 ? '' : line.slice(0, lastPipe + 1);
  const activeCell = lastPipe === -1 ? line : line.slice(lastPipe + 1);

  if (!activeCell || BLANK_RE.test(activeCell)) {
    return { healed: line, heldSuffix: '', modified: false };
  }
  const healedCell = healMarkdownTail(activeCell, {
    ...options,
    mode: 'inline',
  });

  return {
    healed: `${prefix}${healedCell.healed}`,
    heldSuffix: healedCell.heldSuffix,
    modified: healedCell.modified,
  };
};
