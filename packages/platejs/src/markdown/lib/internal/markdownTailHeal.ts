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
  modified: boolean;
}>;

// Probes installed remark syntax extensions once per (mappings, remarkPlugins):
// CJK-friendly vs CommonMark attention/strikethrough, inline math, and GFM tables.
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

/** Streaming preview only: hide a bounded trailing `<...` that may still become a registered tag. */
export const trimIncompleteRegisteredTag = (
  source: string,
  tags: MarkdownTagRegistry
): string => {
  const lt = source.lastIndexOf('<');

  if (
    lt === -1 ||
    source.length - lt > MAX_INCOMPLETE_TAG_LENGTH ||
    /[>\n\r]/.test(source.slice(lt))
  ) {
    return source;
  }
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
const MATH_FENCE_RE = /^ {0,3}\$\$[ \t]*$/;
const BLANK_RE = /^[ \t]*$/;
const RAW_HTML_BLOCKS: ReadonlyArray<readonly [RegExp, RegExp]> = [
  [
    /^ {0,3}<(?:pre|script|style|textarea)(?=[ \t>]|$)/i,
    /<\/(?:pre|script|style|textarea)>/i,
  ],
  [/^ {0,3}<!--/, /-->/],
];
const PARTIAL_TABLE_SEPARATOR_RE =
  /^[ \t]*\|?(?:[ \t]*:?-{1,}:?[ \t]*\|)*[ \t]*:?-{0,}:?[ \t]*$/;

type BlockScanResult = Readonly<{
  activeBlockStart: number;
  inFence: boolean;
  inMathBlock: boolean;
  inRawHtml: boolean;
  mathBodyStart: number;
}>;

const scanBlocks = (source: string, allowMath: boolean): BlockScanResult => {
  let offset = 0;
  let fence: { char: string; length: number } | null = null;
  let inMathBlock = false;
  let mathBodyStart = -1;
  let rawEnd: RegExp | null = null;
  let activeBlockStart = 0;
  let afterBlank = true;

  while (offset < source.length) {
    const nl = source.indexOf('\n', offset);
    const lineEnd = nl === -1 ? source.length : nl;
    const line = source.slice(offset, lineEnd);

    if (fence) {
      const close = FENCE_RE.exec(line);

      if (
        close?.[1][0] === fence.char &&
        close[1].length >= fence.length &&
        BLANK_RE.test(line.slice(close[0].length))
      ) {
        fence = null;
        afterBlank = true;
      }
    } else if (inMathBlock) {
      if (MATH_FENCE_RE.test(line)) {
        inMathBlock = false;
        mathBodyStart = -1;
        afterBlank = true;
      }
    } else if (rawEnd) {
      if (rawEnd.test(line)) {
        rawEnd = null;
        afterBlank = true;
      }
    } else if (BLANK_RE.test(line)) {
      afterBlank = true;
    } else {
      if (afterBlank) {
        activeBlockStart = offset;
        afterBlank = false;
      }
      const openFence = FENCE_RE.exec(line);

      if (
        openFence &&
        (openFence[1].startsWith('~') ||
          !line.slice(openFence[0].length).includes(openFence[1][0]))
      ) {
        fence = { char: openFence[1][0], length: openFence[1].length };
      } else if (allowMath && MATH_FENCE_RE.test(line)) {
        inMathBlock = true;
        mathBodyStart = nl === -1 ? source.length : nl + 1;
      } else {
        const raw = RAW_HTML_BLOCKS.find(([start]) => start.test(line));

        if (raw && !raw[1].test(line)) {
          rawEnd = raw[1];
        }
      }
    }

    offset = nl === -1 ? source.length : nl + 1;
  }

  return {
    activeBlockStart,
    inFence: fence !== null,
    inMathBlock,
    inRawHtml: rawEnd !== null,
    mathBodyStart,
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
  if (!PARTIAL_TABLE_SEPARATOR_RE.test(sepLine)) {
    return null;
  }
  const headerCols = countTableCells(headerLine);

  if (headerCols === 0) return null;

  const trimmedSep = sepLine.trim();
  const hasLeadingPipe = trimmedSep.startsWith('|');
  const inner = hasLeadingPipe ? trimmedSep.slice(1) : trimmedSep;
  const parts = inner.split('|');

  if (parts.length > headerCols + 1) return null;

  const completed = Array.from({ length: headerCols }, (_, index) => {
    const part = parts[index]?.trim() ?? '';

    if (/^:?-{1,}:?$/.test(part)) return part;
    if (part === ':') return ':---';

    return '---';
  });

  return `${source.slice(0, activeBlockStart)}${headerLine}\n| ${completed.join(' | ')} |`;
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
): string => {
  if (!region) return region;

  const { grammar, incompleteLinks } = options;
  let working = region;

  // Hold back a single trailing unescaped backslash so `\*` does not flash raw `\`.
  let trailingBackslashes = 0;
  for (let i = working.length - 1; i >= 0 && working[i] === '\\'; i--) {
    trailingBackslashes += 1;
  }
  let heldCount = 0;
  if (trailingBackslashes % 2 === 1) {
    working = working.slice(0, -1);
    heldCount = 1;
  }

  // First pass: find open code span, inline math, or incomplete inline link/image.
  let codeSpan: { start: number; ticks: number } | null = null;
  let mathStart = -1;
  let linkOpen: {
    bracket: number;
    destStart: number;
    isImage: boolean;
    labelEnd: number;
  } | null = null;
  let openBracket: { index: number; isImage: boolean } | null = null;
  let inAngleTag = false;
  let lastMatchedCloserEnd = -1;
  const delimiters: DelimiterEntry[] = [];

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

    if (inAngleTag) {
      if (ch === '>') inAngleTag = false;
      continue;
    }

    if (linkOpen) {
      if (ch === ')' || ch === '\n') {
        linkOpen = null;
      }
      continue;
    }

    if (ch === '`') {
      let end = i;

      while (end < working.length && working[end] === '`') end += 1;
      codeSpan = { start: i, ticks: end - i };
      i = end - 1;
      continue;
    }

    if (ch === '<' && /^<\/?[A-Za-z]/.test(working.slice(i))) {
      const closeIdx = working.indexOf('>', i + 1);

      if (closeIdx !== -1 && !working.slice(i, closeIdx).includes('\n')) {
        inAngleTag = true;
        continue;
      }
    }

    if (grammar.math && ch === '$' && working[i + 1] !== '$') {
      if (mathStart === -1) {
        const next = working[i + 1];
        const prev = working[i - 1];

        if (next && !isWhitespace(next) && prev !== '$') {
          mathStart = i;
        }
      } else {
        const prev = working[i - 1];

        if (prev && !isWhitespace(prev)) {
          mathStart = -1;
        }
      }
      continue;
    }

    if (mathStart !== -1) continue;

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
        for (const d of delimiters) {
          if (d.index > openBracket.index) d.count = 0;
        }
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

      const { canClose, canOpen } = classifyFlanking(ch, before, after, cjk);

      // Try to pair closing run with matching open run on the stack.
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
          lastMatchedCloserEnd = end;
          // Drop any unmatched inner delimiters crossed by this pair.
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
        });
      }

      i = end - 1;
    }
  }

  // Case 1: Open inline code span at EOF — close it, then still close outer emphasis!
  let closedInlineSpan = false;

  if (codeSpan) {
    const body = working.slice(codeSpan.start + codeSpan.ticks);

    if (body.length === 0) {
      const hold = Math.min(codeSpan.ticks, MAX_HELD_MARKERS - heldCount);

      if (hold > 0) {
        working = working.slice(0, -hold);
        heldCount += hold;
      }
    } else {
      let trailingTicks = 0;

      for (
        let i = working.length - 1;
        i >= codeSpan.start + codeSpan.ticks;
        i--
      ) {
        if (working[i] === '`') trailingTicks += 1;
        else break;
      }
      const needed = Math.max(1, codeSpan.ticks - trailingTicks);

      working = `${working}${'`'.repeat(needed)}`;
      closedInlineSpan = true;
    }
  }

  // Case 2: Open inline math span at EOF — close it, then still close outer emphasis!
  if (!codeSpan && mathStart !== -1 && grammar.math) {
    const body = working.slice(mathStart + 1);

    if (
      body.length > 0 &&
      !/^\s/.test(body) &&
      !/\s$/.test(body) &&
      !/^\d+(?:[.,]\d+)?$/.test(body)
    ) {
      working = `${working}$`;
      closedInlineSpan = true;
    }
  }

  // Case 3: Incomplete inline link or image `[label](url` at EOF.
  let suffix = '';

  if (linkOpen) {
    const dest = working.slice(linkOpen.destStart);

    if (isStreamingUrlPrefix(dest)) {
      if (!linkOpen.isImage && incompleteLinks === 'text') {
        const label = working.slice(linkOpen.bracket + 1, linkOpen.labelEnd);

        working = `${working.slice(0, linkOpen.bracket)}${label}`;
      } else {
        const safeDest = safeStreamingDestination(dest);

        working = `${working.slice(0, linkOpen.destStart)}${safeDest})`;
      }
    }
  }

  // Case 4: Hold back up to MAX_HELD_MARKERS trailing bare emphasis/strikethrough
  // markers at EOF so `Use **` does not flash literal `**`. Never strip a marker
  // that already matched an opener (`lastMatchedCloserEnd === working.length`).
  const activeDelims = delimiters.filter((d) => d.count > 0 && d.canOpen);

  while (activeDelims.length > 0 && heldCount < MAX_HELD_MARKERS) {
    const last = activeDelims.at(-1);

    if (!last || last.index + last.count !== working.length) break;
    const take = Math.min(last.count, MAX_HELD_MARKERS - heldCount);

    working = working.slice(0, -take);
    heldCount += take;
    last.count -= take;
    if (last.count === 0) activeDelims.pop();
  }

  // Also check if working itself ends in trailing unstacked markers (e.g., `Use **`
  // where `**` was not left-flanking because EOF followed it), skipping markers
  // that already paired as closers.
  if (!closedInlineSpan) {
    while (
      heldCount < MAX_HELD_MARKERS &&
      working.length > 0 &&
      working.length > lastMatchedCloserEnd
    ) {
      const tailChar = working.at(-1);
      const allowed =
        (tailChar === '*' && grammar.attention !== null) ||
        (tailChar === '_' && grammar.attention !== null) ||
        (tailChar === '~' && grammar.strikethrough !== null);

      if (!allowed) break;
      // Do not hold an escaped marker.
      let bs = 0;
      for (let j = working.length - 2; j >= 0 && working[j] === '\\'; j--) {
        bs += 1;
      }
      if (bs % 2 === 1) break;
      // Only hold if preceded by whitespace, punctuation, another marker, or CJK (not mid-word `_`).
      const before = working.at(-2);
      if (
        tailChar === '_' &&
        before &&
        !isWhitespace(before) &&
        !isPunctuation(before)
      ) {
        break;
      }
      working = working.slice(0, -1);
      heldCount += 1;
    }
  }

  // Close remaining open emphasis/strikethrough runs in LIFO order.
  // Place closers BEFORE any trailing whitespace so `Use **a ` stays bolded
  // (`Use **a** `) instead of flashing raw `**` on every space.
  let wsStart = working.length;
  while (wsStart > 0 && isWhitespace(working[wsStart - 1])) {
    wsStart -= 1;
  }
  const core = working.slice(0, wsStart);
  const trailingSpaces = working.slice(wsStart);

  for (let i = activeDelims.length - 1; i >= 0; i--) {
    const opener = activeDelims[i];

    if (opener.count <= 0) continue;
    const afterOpener = core.slice(opener.index + opener.count);

    if (!afterOpener || BLANK_RE.test(afterOpener)) continue;
    if (opener.char === '~') {
      if (opener.count === 2) suffix += '~~';
    } else {
      suffix += opener.char.repeat(Math.min(opener.count, 3));
    }
  }

  return `${core}${suffix}${trailingSpaces}`;
};

export const healMarkdownTail = (
  source: string,
  options: MarkdownTailHealOptions
): HealedMarkdownTail => {
  if (!source) return { healed: source, modified: false };

  const trimmed = trimIncompleteRegisteredTag(source, options.tags);

  if (options.mode === 'inline') {
    const windowStart = Math.max(0, trimmed.length - MAX_INLINE_HEAL_WINDOW);
    const prefix = trimmed.slice(0, windowStart);
    const healedRegion = healInlineRegion(trimmed.slice(windowStart), options);
    const healed = `${prefix}${healedRegion}`;

    return { healed, modified: healed !== source };
  }

  const blockState = scanBlocks(trimmed, options.grammar.math);

  if (blockState.inFence || blockState.inRawHtml) {
    return { healed: trimmed, modified: trimmed !== source };
  }

  if (blockState.inMathBlock && options.grammar.math) {
    let body = trimmed.slice(blockState.mathBodyStart);

    // Hold a lone trailing `$` on a fresh line while closing `$$` arrives.
    if (body.endsWith('\n$')) {
      body = body.slice(0, -1);
    }
    if (body.trim().length > 0) {
      const sep = body.endsWith('\n') ? '' : '\n';
      const healed = `${trimmed.slice(0, blockState.mathBodyStart)}${body}${sep}$$`;

      return { healed, modified: healed !== source };
    }

    return { healed: trimmed, modified: trimmed !== source };
  }

  if (options.grammar.table) {
    const tableHealed = healIncompleteTableSeparator(
      trimmed,
      blockState.activeBlockStart
    );

    if (tableHealed !== null) {
      return { healed: tableHealed, modified: tableHealed !== source };
    }
  }

  const tailStart = Math.max(
    blockState.activeBlockStart,
    trimmed.length - MAX_INLINE_HEAL_WINDOW
  );
  const healedTail = healInlineRegion(trimmed.slice(tailStart), options);
  const healed = `${trimmed.slice(0, tailStart)}${healedTail}`;

  return { healed, modified: healed !== source };
};
