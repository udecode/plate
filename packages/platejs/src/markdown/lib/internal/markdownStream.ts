import type { RootContent as MdRootContent } from 'mdast';

import {
  type ContentSlice,
  type Descendant,
  type Editor,
  type Element,
  ElementApi,
  PLUGINS,
  TextApi,
  type Value,
} from '../../../core';
import { sameUpToListIds } from '../../../features/list/lib/listIdentity.internal';
import {
  getMarkdownParagraphType,
  landsMarkdownParagraph,
} from '../../../internal/plugin/markdownParagraph';
import { createValidatedContentSlice } from '../../../internal/utils/trustedContentSlice';
import type {
  MarkdownDiagnostic,
  MarkdownParseLimits,
  MarkdownStream,
  MarkdownStreamDelta,
  MarkdownStreamOptions,
  MarkdownStreamSnapshot,
} from '../types';
import {
  MarkdownDiagnostics,
  ReportedMarkdownFailureError,
} from './markdownDiagnostics';
import { BYTE_ORDER_MARK } from './markdownFrontmatter';
import {
  findMarkdownParagraph,
  knowsPluginSyntax,
  markdownParseLimits,
  markdownToSlateNodesWithRuntime,
  parseMarkdownInlineWithRuntime,
  parseMarkdownSliceWithRuntime,
  reportSchemaInvalid,
  reportUnlandedParagraph,
  snapshotBlocks,
} from './markdownParse';
import {
  hasOnlyKnownLocalRemarkPlugins,
  type MarkdownRuntime,
  type MarkdownRuntimeState,
  samePlugins,
  withMarkdownRuntime,
} from './markdownRuntime';
import { type MarkdownTagRegistry, markdownTextEnd } from './markdownTags';
import {
  healMarkdownTail,
  healTableRowTail,
  type MarkdownTailGrammar,
  probeMarkdownTailGrammar,
  scanMarkdownTailBlocks,
  trimIncompleteRegisteredTag,
} from './markdownTailHeal';

export type MarkdownStreamMetrics = Readonly<{
  appendCodeFastPaths: number;
  appendTextFastPaths: number;
  fullTailParses: number;
  parsedChars: number;
  parserCalls: number;
  tableRowFastPaths: number;
}>;

type MutableMetrics = {
  -readonly [K in keyof MarkdownStreamMetrics]: MarkdownStreamMetrics[K];
};

const streamMetrics = new WeakMap<object, MutableMetrics>();

export const getMarkdownStreamMetrics = (
  stream: object
): MarkdownStreamMetrics =>
  streamMetrics.get(stream) ?? {
    appendCodeFastPaths: 0,
    appendTextFastPaths: 0,
    fullTailParses: 0,
    parsedChars: 0,
    parserCalls: 0,
    tableRowFastPaths: 0,
  };

const LIST_RE = /^ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|$)/;
const LIST_START_RE = /^\d{1,9}$/;
const INDENTED_RE = /^(?: {4}|\t)/;
const LEADING_WS_RE = /^[ \t]/;
const BLANK_RE = /^[ \t]*$/;
const FENCE_OPEN_RE = /^ {0,3}(`{3,}|~{3,})/;
const MATH_OR_FENCE_RE = /^ {0,3}(`{3,}|~{3,}|\${2,})/;
const RAW_HTML_OPEN_CLOSE: ReadonlyArray<readonly [RegExp, RegExp]> = [
  [
    /^ {0,3}<(?:pre|script|style|textarea)(?=[ \t>]|$)/i,
    /<\/(?:pre|script|style|textarea)>/i,
  ],
  [/^ {0,3}<!--/, /-->/],
];
const COMPLETE_DEFINITION_LINE_RE =
  /^(?:[ \t>]|[*+-][ \t]|\d{1,9}[.)][ \t])*\[(?:[^[\]\\]|\\[\s\S])+\]:[ \t]*\S/;
const TABLE_SEPARATOR_LINE_RE =
  /^[ \t]*\|?(?:[ \t]*:?-{1,}:?[ \t]*\|)+[ \t]*:?-{1,}:?[ \t]*\|?[ \t]*$|^[ \t]*\|[ \t]*:?-{1,}:?[ \t]*\|?[ \t]*$/;
const NON_TABLE_LINE_START_RE =
  /^ {0,3}(?:#{1,6}(?:[ \t]|$)|>|`{3,}|~{3,}|\$\$|<(?:pre|script|style|textarea|!--)|(?:[*+-]|\d{1,9}[.)])[ \t])/i;

// Characters or sequences that can trigger inline or block Markdown syntax or
// source preprocessing when appended to a plain unmarked paragraph.
const PROSE_TRIGGER_RE = /[\0*_~[\]()\\`<>:&|#$!@;\n\r]| {2}|www\.|http/i;
const PROSE_START_GUARD_RE = /^ {0,3}(?:[-+=]|\d{1,9}(?:[.)]|$))/;

type CommittedSegment = Readonly<{
  diagnostics: readonly MarkdownDiagnostic[];
  lastRoot: MdRootContent | null;
}>;

type IncrementalTableState = {
  blockIndex: number;
  colCount: number;
  committedRows: Element[];
  committedRowSyntaxNodes: number;
  diagnostics: MarkdownDiagnostic[];
  headerLines: string;
  headerSyntaxNodes: number;
  inProgressRow: Element | null;
  nextRowLine: number;
  nextRowOffset: number;
  published: boolean;
  tableBase: Element;
  tableStart: number;
  tableType: string;
};

type IncrementalFenceState = {
  blockIndex: number;
  char: '`' | '~';
  codeBlock: Element;
  indent: number;
  length: number;
  pendingNewline: boolean;
  processedEnd: number;
};

const getBlockTagNames = (
  tags: MarkdownTagRegistry
): ReadonlySet<string> | null => {
  const names = new Set<string>();

  for (const [name, kind] of tags) {
    if (kind === 'block') names.add(name);
  }

  return names.size === 0 ? null : names;
};

// Single linear scan for registered block tags on a line so an adversarial line
// with thousands of unclosed `<column ` openers never rescans to EOL.
const updateBlockTagDepth = (
  line: string,
  blockTags: ReadonlySet<string>,
  depth: number
): number => {
  let tagDepth = depth;
  let pos = 0;

  while (pos < line.length) {
    const lt = line.indexOf('<', pos);

    if (lt === -1) break;
    let i = lt + 1;
    const closing = line[i] === '/';

    if (closing) i += 1;
    const nameStart = i;

    if (i >= line.length || !/[A-Za-z]/.test(line[i])) {
      pos = lt + 1;
      continue;
    }
    i += 1;
    while (i < line.length && /[\w-]/.test(line[i])) i += 1;
    const name = line.slice(nameStart, i);

    if (!blockTags.has(name)) {
      pos = i;
      continue;
    }
    if (closing) {
      while (i < line.length && /\s/.test(line[i])) i += 1;
      if (line[i] === '>') {
        tagDepth = Math.max(0, tagDepth - 1);
        pos = i + 1;
        continue;
      }
      pos = i;
      continue;
    }
    if (i >= line.length || !/[\s>/]/.test(line[i])) {
      pos = i;
      continue;
    }
    const gt = line.indexOf('>', i);

    if (gt === -1) break;
    if (line[gt - 1] !== '/') {
      tagDepth += 1;
    }
    pos = gt + 1;
  }

  return tagDepth;
};

const isDefaultDecoder = (
  runtime: MarkdownRuntime,
  kind: string,
  expectedOwner: string
): boolean => {
  const decoders = runtime.formats.decodeByNode.get(kind);

  return decoders?.length === 1 && decoders[0].owner === expectedOwner;
};

const hasDefinitionMatching = (source: string, pattern: RegExp): boolean => {
  let offset = 0;
  let fence: { char: string; length: number } | null = null;
  let afterBlank = true;

  while (offset < source.length) {
    const nl = source.indexOf('\n', offset);
    const lineEnd = nl === -1 ? source.length : nl;
    const line = source.slice(offset, lineEnd);

    if (fence) {
      const close = FENCE_OPEN_RE.exec(line);

      if (
        close?.[1][0] === fence.char &&
        close[1].length >= fence.length &&
        BLANK_RE.test(line.slice(close[0].length))
      ) {
        fence = null;
        afterBlank = true;
      }
    } else if (BLANK_RE.test(line)) {
      afterBlank = true;
    } else {
      const openFence = FENCE_OPEN_RE.exec(line);

      if (
        openFence &&
        (openFence[1].startsWith('~') ||
          !line.slice(openFence[0].length).includes(openFence[1][0]))
      ) {
        fence = { char: openFence[1][0], length: openFence[1].length };
      } else {
        const isIndentedCode = afterBlank && INDENTED_RE.test(line);

        if (!isIndentedCode && pattern.test(line)) {
          return true;
        }
      }
      afterBlank = false;
    }
    offset = nl === -1 ? source.length : nl + 1;
  }

  return false;
};

const hasCompleteDefinitionOutsideCode = (source: string): boolean =>
  hasDefinitionMatching(source, COMPLETE_DEFINITION_LINE_RE);

const utf8ByteLength = (
  text: string,
  prevHighSurrogate = false
): Readonly<{ bytes: number; endsHighSurrogate: boolean }> => {
  if (!text) return { bytes: 0, endsHighSurrogate: prevHighSurrogate };
  let bytes = 0;
  let start = 0;

  if (prevHighSurrogate) {
    const first = text.charCodeAt(0);

    if (first >= 0xdc_00 && first <= 0xdf_ff) {
      // Combine with the prior chunk's lone high surrogate (counted as 3) into a 4-byte pair.
      bytes += 1;
      start = 1;
    }
  }

  let endsHighSurrogate = false;

  for (let i = start; i < text.length; i++) {
    const code = text.charCodeAt(i);

    if (code < 0x80) {
      bytes += 1;
    } else if (code < 0x8_00) {
      bytes += 2;
    } else if (code >= 0xd8_00 && code <= 0xdb_ff) {
      if (
        i + 1 < text.length &&
        text.charCodeAt(i + 1) >= 0xdc_00 &&
        text.charCodeAt(i + 1) <= 0xdf_ff
      ) {
        bytes += 4;
        i += 1;
      } else {
        bytes += 3;
        if (i === text.length - 1) endsHighSurrogate = true;
      }
    } else {
      bytes += 3;
    }
  }

  return { bytes, endsHighSurrogate };
};

const deepFreezeNode = <T>(value: T): T => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) deepFreezeNode(item);
  } else {
    for (const prop of Object.values(value as Record<string, unknown>)) {
      deepFreezeNode(prop);
    }
  }

  return Object.freeze(value);
};

const proposeSegmentBoundaries = (
  source: string,
  from: number,
  tags: MarkdownTagRegistry
): number[] => {
  const blockTags = getBlockTagNames(tags);
  const boundaries: number[] = [];
  const textEnd = markdownTextEnd(source);
  let fence: { char: string; length: number } | null = null;
  let rawEnd: RegExp | null = null;
  let openList = false;
  let previousNonBlank: string | null = null;
  let tagDepth = 0;
  let pendingBlank = false;
  let offset = from;

  while (offset < source.length) {
    const nl = source.indexOf('\n', offset);
    const lineEnd = nl === -1 ? source.length : nl;
    const line = source.slice(offset, lineEnd);
    const blank = BLANK_RE.test(line);

    if (
      !blank &&
      pendingBlank &&
      !LEADING_WS_RE.test(line) &&
      !LIST_RE.test(line) &&
      !(nl === -1 && LIST_START_RE.test(line)) &&
      previousNonBlank !== null &&
      !fence &&
      !rawEnd &&
      tagDepth === 0
    ) {
      if (
        !openList &&
        !INDENTED_RE.test(previousNonBlank) &&
        !line.startsWith(BYTE_ORDER_MARK) &&
        offset < textEnd
      ) {
        boundaries.push(offset);
      }
      openList = false;
    }
    pendingBlank = blank;

    if (!blank) {
      previousNonBlank = line;
      if (fence) {
        const close = MATH_OR_FENCE_RE.exec(line);

        if (
          close?.[1][0] === fence.char &&
          close[1].length >= fence.length &&
          BLANK_RE.test(line.slice(close[0].length))
        ) {
          fence = null;
        }
      } else if (rawEnd) {
        if (rawEnd.test(line)) rawEnd = null;
      } else {
        if (LIST_RE.test(line)) openList = true;
        const openFence = MATH_OR_FENCE_RE.exec(line);

        if (
          openFence &&
          (openFence[1].startsWith('~') ||
            !line.slice(openFence[0].length).includes(openFence[1][0]))
        ) {
          fence = { char: openFence[1][0], length: openFence[1].length };
        } else {
          const raw = RAW_HTML_OPEN_CLOSE.find(([start]) => start.test(line));

          if (raw) {
            if (!raw[1].test(line)) rawEnd = raw[1];
          } else if (blockTags) {
            tagDepth = updateBlockTagDepth(line, blockTags, tagDepth);
          }
        }
      }
    }

    offset = nl === -1 ? source.length : nl + 1;
  }

  return boundaries;
};

const holdsSegmentOpen = (
  segment: string,
  last: MdRootContent | null,
  lineShift = 0
): boolean => {
  if (!last?.position) return true;
  const lines = segment.split('\n');
  let textLines = lines.length;

  while (textLines > 0 && BLANK_RE.test(lines[textLines - 1])) textLines -= 1;

  return last.position.end.line - lineShift > textLines;
};

const hasNonEmptyText = (node: Descendant): boolean => {
  if (TextApi.isText(node)) return node.text.length > 0;

  return node.children.some(hasNonEmptyText);
};

const stripHeldSuffixFromNode = (
  node: Descendant,
  suffix: string,
  runtime: MarkdownRuntime
): Descendant => {
  if (TextApi.isText(node)) {
    if (node[PLUGINS.code] === true || !node.text.endsWith(suffix)) {
      return node;
    }

    return { ...node, text: node.text.slice(0, -suffix.length) };
  }
  if (
    node.type === PLUGINS.codeBlock ||
    runtime.state.schema.isVoid(node) ||
    node.children.length === 0
  ) {
    return node;
  }
  // Walk backward past trailing empty children (such as padded GFM table cells)
  // so held markers in an earlier active cell are stripped too.
  let targetIndex = node.children.length - 1;

  while (targetIndex > 0 && !hasNonEmptyText(node.children[targetIndex])) {
    targetIndex -= 1;
  }
  const targetChild = node.children[targetIndex];
  const updatedChild = stripHeldSuffixFromNode(targetChild, suffix, runtime);

  if (updatedChild === targetChild) return node;
  const nextChildren = node.children.slice();

  nextChildren[targetIndex] = updatedChild;

  return { ...node, children: nextChildren };
};

const stripHeldSuffix = (
  nodes: readonly Descendant[],
  suffix: string,
  runtime: MarkdownRuntime
): readonly Descendant[] => {
  if (!suffix || nodes.length === 0) return nodes;
  const lastIndex = nodes.length - 1;
  const lastNode = nodes[lastIndex];
  const updated = stripHeldSuffixFromNode(lastNode, suffix, runtime);

  if (updated === lastNode) return nodes;
  const next = nodes.slice();

  next[lastIndex] = updated;

  return next;
};

const hasUnclosedTagDiagnostic = (
  diagnostics: readonly MarkdownDiagnostic[]
): boolean =>
  diagnostics.some(
    (d) => d.code === 'markdown-tag-repair' && d.reason === 'unclosed'
  );

const healDefinitionTail = (
  text: string,
  tags: MarkdownTagRegistry,
  allowMath: boolean
): Readonly<{ healed: string; heldSuffix: string; modified: boolean }> => {
  const blocks = scanMarkdownTailBlocks(text, allowMath, tags);
  const trimmed =
    blocks.inFence ||
    blocks.inIndentedCode ||
    blocks.inRawHtml ||
    blocks.inMathBlock
      ? text
      : trimIncompleteRegisteredTag(text, tags, blocks.activeBlockStart);
  let bs = 0;

  for (let i = trimmed.length - 1; i >= 0 && trimmed[i] === '\\'; i--) {
    bs += 1;
  }
  const heldSuffix = bs % 2 === 1 ? '\\' : '';

  return {
    healed: trimmed,
    heldSuffix,
    modified: trimmed !== text || heldSuffix.length > 0,
  };
};

const countLinesBefore = (source: string, offset: number): number => {
  let count = 0;

  for (let i = 0; i < offset; i++) {
    if (source[i] === '\n') count += 1;
  }

  return count;
};

const diagnosticOffset = (diagnostic: MarkdownDiagnostic) =>
  ('source' in diagnostic ? diagnostic.source?.start?.offset : undefined) ??
  Number.NaN;

const hasUnplacedDiagnostic = (diagnostics: readonly MarkdownDiagnostic[]) =>
  diagnostics.some((diagnostic) => Number.isNaN(diagnosticOffset(diagnostic)));

const inSourceOrder = (roots: readonly MdRootContent[]): boolean => {
  let end = 0;

  for (const root of roots) {
    const start = root.position?.start.offset;
    const stop = root.position?.end.offset;

    if (
      start === undefined ||
      stop === undefined ||
      start < end ||
      stop < start
    ) {
      return false;
    }
    end = stop;
  }

  return true;
};

const makeInitialSnapshot = <V extends Value>(): MarkdownStreamSnapshot<V> =>
  Object.freeze({
    delta: Object.freeze({ kind: 'reset', revision: 0 }),
    diagnostics: Object.freeze([]),
    done: false,
    nodes: Object.freeze([]),
    ok: true,
    revision: 0,
    stableCount: 0,
  });

const stripLeadingIndent = (line: string, maxIndent: number): string => {
  let stripped = 0;

  while (
    stripped < maxIndent &&
    stripped < line.length &&
    line[stripped] === ' '
  ) {
    stripped += 1;
  }

  return line.slice(stripped);
};

const couldBeClosingFenceLine = (
  line: string,
  char: '`' | '~',
  minLength: number,
  isPartialEof: boolean
): boolean => {
  if (!line) return false;
  let i = 0;

  while (i < 3 && i < line.length && line[i] === ' ') i += 1;
  if (i >= line.length) {
    // A partial EOF line of 1..3 spaces could still be followed by fence chars.
    return isPartialEof && i > 0;
  }
  if (line[i] !== char) return false;
  let run = 0;

  while (i < line.length && line[i] === char) {
    run += 1;
    i += 1;
  }
  if (isPartialEof && i === line.length) {
    // A partial line of 1..minLength fence chars at EOF could still become a closer.
    return true;
  }

  return run >= minLength && BLANK_RE.test(line.slice(i));
};

const parseInlineWhitespace = (source: string): Descendant[] =>
  source ? [{ text: source }] : [];

export const createMarkdownStream = <V extends Value = Value>(
  editor: Editor,
  getPluginState: () => MarkdownRuntimeState,
  getOwnerStates: () => readonly unknown[],
  options: MarkdownStreamOptions = {}
): MarkdownStream<V> => {
  const mode = options.mode ?? 'blocks';
  const incompleteLinks = options.incompleteLinks ?? 'placeholder';
  const finishLossPolicy = options.lossPolicy ?? 'reject';
  const policyLimits = options.limits;

  let rawSource = '';
  let rawByteLength = 0;
  let pendingHighSurrogate = false;
  let normalizedSource = '';
  let pendingCr = false;
  let revision = 0;
  let currentSnapshot: MarkdownStreamSnapshot<V> = makeInitialSnapshot<V>();

  let boundFormats: object | null = null;
  let boundRemarkPlugins: readonly unknown[] = [];
  let boundOwnerStates: readonly unknown[] = [];

  let committedSegments: CommittedSegment[] = [];
  let committedBlocks: Descendant[] = [];
  let committedEnd = 0;
  let committedLines = 0;
  let committedSyntaxNodes = 0;
  let rejectedBoundaries = new Set<number>();
  let tableBailedAt = -1;
  let hasDefinition = false;
  let tailHealedLast = false;
  let tableState: IncrementalTableState | null = null;
  let fenceState: IncrementalFenceState | null = null;

  const metrics: MutableMetrics = {
    appendCodeFastPaths: 0,
    appendTextFastPaths: 0,
    fullTailParses: 0,
    parsedChars: 0,
    parserCalls: 0,
    tableRowFastPaths: 0,
  };

  const resetInternalState = () => {
    committedSegments = [];
    committedBlocks = [];
    committedEnd = 0;
    committedLines = 0;
    committedSyntaxNodes = 0;
    rejectedBoundaries = new Set();
    tableBailedAt = -1;
    hasDefinition = false;
    tailHealedLast = false;
    tableState = null;
    fenceState = null;
  };

  const exceedsByteLimit = (diagnostics: MarkdownDiagnostics): boolean => {
    const limits = markdownParseLimits({ limits: policyLimits });

    if (rawByteLength <= limits.maxBytes) return false;
    diagnostics.report({
      actual: rawByteLength,
      code: 'markdown-limit-exceeded',
      limit: 'maxBytes',
      maximum: limits.maxBytes,
      message: `Markdown source exceeds ${limits.maxBytes} UTF-8 bytes.`,
      severity: 'error',
    });

    return true;
  };

  const appendNormalized = (chunk: string): string => {
    if (!chunk) return '';
    let input = chunk;

    if (pendingCr) {
      pendingCr = false;
      if (input.startsWith('\n')) {
        input = input.slice(1);
      }
    }
    if (!input) return '';
    if (input.endsWith('\r')) {
      pendingCr = true;
    }

    return input.replaceAll(/\r\n?/g, '\n');
  };

  const ensureRuntimeBound = (runtime: MarkdownRuntime): boolean => {
    const ownerStates = getOwnerStates();
    const hadBinding = boundFormats !== null;
    const same =
      boundFormats === runtime.formats &&
      samePlugins(
        { remarkPlugins: boundRemarkPlugins },
        runtime.options.remarkPlugins
      ) &&
      boundOwnerStates.length === ownerStates.length &&
      boundOwnerStates.every((state, index) => state === ownerStates[index]);

    if (!same) {
      boundFormats = runtime.formats;
      boundRemarkPlugins = runtime.options.remarkPlugins;
      boundOwnerStates = ownerStates;
      if (hadBinding) {
        resetInternalState();

        return true;
      }
    }

    return false;
  };

  const parseFragment = (
    runtime: MarkdownRuntime,
    text: string,
    parseOpts: Readonly<{
      inline?: boolean;
      limits?: Partial<MarkdownParseLimits>;
      lossPolicy: 'allow' | 'reject';
      positionShift?: Readonly<{
        lines: number;
        minLine?: number;
        offset: number;
      }>;
      previousRootSibling?: MdRootContent | null;
      suppressEndTagRepair?: boolean;
    }>,
    diagnostics: MarkdownDiagnostics
  ): {
    hasDefinition: boolean;
    nodes: readonly Descendant[] | null;
    roots: readonly MdRootContent[];
    syntaxNodes: number;
  } => {
    metrics.parserCalls += 1;
    metrics.parsedChars += text.length;
    let hasDef = false;
    let roots: readonly MdRootContent[] = [];
    let syntaxNodes = 0;

    try {
      const parsed = markdownToSlateNodesWithRuntime(
        runtime,
        text,
        {
          limits: parseOpts.limits ?? policyLimits,
          lossPolicy: parseOpts.lossPolicy,
        },
        diagnostics,
        {
          inline: parseOpts.inline,
          onHasDefinition: (found) => {
            hasDef = found;
          },
          onRootChildren: (children) => {
            roots = children;
          },
          onSyntaxNodes: (count) => {
            syntaxNodes = count;
          },
          positionShift: parseOpts.positionShift,
          previousRootSibling: parseOpts.previousRootSibling,
          suppressEndTagRepair: parseOpts.suppressEndTagRepair,
        },
        text
      );

      return { hasDefinition: hasDef, nodes: parsed, roots, syntaxNodes };
    } catch (error) {
      if (error instanceof ReportedMarkdownFailureError) {
        return {
          hasDefinition: hasDef,
          nodes: null,
          roots: [],
          syntaxNodes: 0,
        };
      }
      throw error;
    }
  };

  const validatePreviewBlocks = (
    runtime: MarkdownRuntime,
    blocks: readonly Descendant[],
    diagnostics: MarkdownDiagnostics
  ): Readonly<{ nodes: readonly Descendant[]; repaired: boolean }> | null => {
    const unlanded =
      landsMarkdownParagraph(runtime.registry) &&
      findMarkdownParagraph(blocks, []);

    if (unlanded) {
      reportUnlandedParagraph(
        diagnostics,
        'No paragraph plugin is installed, and only a document parse lands a Markdown paragraph.',
        unlanded
      );

      return null;
    }
    try {
      runtime.state.schema.assertFragment(blocks);

      return { nodes: blocks, repaired: false };
    } catch {
      // Schema-constrained incomplete containers (such as <columnGroup> with 1
      // <column>) repair for live preview only; repaired blocks are never committed.
      try {
        const fitted = runtime.state.schema.fitDocument({
          children: blocks.filter((node): node is Element =>
            ElementApi.isElement(node)
          ),
        }).children;

        runtime.state.schema.assertFragment(fitted);

        return { nodes: fitted, repaired: true };
      } catch (error) {
        reportSchemaInvalid(error, diagnostics);

        return null;
      }
    }
  };

  const publish = (
    nextNodes: readonly Descendant[],
    diagnostics: readonly MarkdownDiagnostic[],
    delta: MarkdownStreamDelta,
    stableCount: number,
    done: boolean,
    ok: boolean,
    slice?: ContentSlice<V>
  ): MarkdownStreamSnapshot<V> => {
    const frozenNodes = deepFreezeNode([...nextNodes]);
    const frozenDelta =
      delta.kind === 'splice'
        ? Object.freeze({ ...delta, nodes: deepFreezeNode([...delta.nodes]) })
        : Object.freeze(delta);
    const snap: MarkdownStreamSnapshot<V> = Object.freeze({
      delta: frozenDelta,
      diagnostics: Object.freeze([...diagnostics]),
      done,
      nodes: frozenNodes,
      ok,
      revision,
      ...(slice ? { slice } : {}),
      stableCount,
    });

    currentSnapshot = snap;

    return snap;
  };

  const tryParagraphFastPath = (
    runtime: MarkdownRuntime,
    normChunk: string
  ): MarkdownStreamSnapshot<V> | null => {
    if (
      !normChunk ||
      /[ \t]$/.test(normChunk) ||
      tailHealedLast ||
      tableState ||
      fenceState ||
      hasDefinition ||
      rawSource.includes('\r') ||
      rawSource.startsWith(BYTE_ORDER_MARK) ||
      !knowsPluginSyntax(runtime) ||
      !hasOnlyKnownLocalRemarkPlugins(runtime) ||
      !isDefaultDecoder(runtime, 'paragraph', 'markdown') ||
      PROSE_TRIGGER_RE.test(normChunk)
    ) {
      return null;
    }
    const prevNodes = currentSnapshot.nodes;

    if (prevNodes.length !== committedBlocks.length + 1) return null;
    const tailBlock = prevNodes.at(-1);
    const paragraphType = getMarkdownParagraphType(runtime.registry);

    if (
      !tailBlock ||
      !ElementApi.isElement(tailBlock) ||
      tailBlock.type !== paragraphType ||
      tailBlock.children.length !== 1
    ) {
      return null;
    }
    const leaf = tailBlock.children[0];

    if (!TextApi.isText(leaf) || Object.keys(leaf).length !== 1) return null;
    const tailSource = normalizedSource.slice(committedEnd);

    if (
      PROSE_TRIGGER_RE.test(tailSource) ||
      PROSE_START_GUARD_RE.test(tailSource)
    ) {
      return null;
    }
    const prevTailSource = tailSource.slice(
      0,
      tailSource.length - normChunk.length
    );

    if (
      !prevTailSource ||
      /[ \t]$/.test(prevTailSource) ||
      leaf.text !== prevTailSource
    ) {
      return null;
    }

    const blockIndex = committedBlocks.length;
    const updatedParagraph: Element = deepFreezeNode({
      ...tailBlock,
      children: [{ text: leaf.text + normChunk }],
    });
    const nextNodes = [...committedBlocks, updatedParagraph];
    const baseRevision = revision;

    revision += 1;
    metrics.appendTextFastPaths += 1;

    return publish(
      nextNodes,
      currentSnapshot.diagnostics,
      {
        baseRevision,
        blockIndex,
        kind: 'append-text',
        revision,
        text: normChunk,
      },
      committedBlocks.length,
      false,
      true
    );
  };

  const tryOpenFenceFastPath = (
    runtime: MarkdownRuntime,
    normChunk: string
  ): MarkdownStreamSnapshot<V> | null => {
    if (
      !fenceState ||
      !currentSnapshot.ok ||
      !normChunk ||
      normChunk.includes('\0') ||
      hasDefinition ||
      rawSource.includes('\r') ||
      rawSource.startsWith(BYTE_ORDER_MARK) ||
      !knowsPluginSyntax(runtime) ||
      !hasOnlyKnownLocalRemarkPlugins(runtime) ||
      !isDefaultDecoder(runtime, 'code', PLUGINS.codeBlock)
    ) {
      return null;
    }

    const tailSlice = normalizedSource.slice(fenceState.processedEnd);

    if (fenceState.indent > 0 && tailSlice.includes('\t')) {
      fenceState = null;

      return null;
    }
    const firstLineStart = normalizedSource.lastIndexOf(
      '\n',
      fenceState.processedEnd - 1
    );
    const currentLinePrefix = normalizedSource.slice(
      firstLineStart + 1,
      fenceState.processedEnd
    );
    const combined = currentLinePrefix + tailSlice;
    const lines = combined.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const isLast = i === lines.length - 1;

      if (
        couldBeClosingFenceLine(
          lines[i],
          fenceState.char,
          fenceState.length,
          isLast
        )
      ) {
        fenceState = null;

        return null;
      }
    }

    let appended = '';
    let { pendingNewline } = fenceState;
    let pos = 0;

    while (pos < tailSlice.length) {
      const nl = tailSlice.indexOf('\n', pos);
      const isAtLineStart = pos === 0 ? currentLinePrefix.length === 0 : true;

      if (nl === -1) {
        const part = tailSlice.slice(pos);

        if (part.length > 0) {
          if (pendingNewline) {
            appended += '\n';
            pendingNewline = false;
          }
          appended += isAtLineStart
            ? stripLeadingIndent(part, fenceState.indent)
            : part;
        }
        break;
      }

      const linePart = tailSlice.slice(pos, nl);

      if (pendingNewline) {
        appended += '\n';
        pendingNewline = false;
      }
      appended += isAtLineStart
        ? stripLeadingIndent(linePart, fenceState.indent)
        : linePart;
      pendingNewline = true;
      pos = nl + 1;
    }

    fenceState.pendingNewline = pendingNewline;
    fenceState.processedEnd = normalizedSource.length;

    if (!appended) {
      // Deferred trailing newline leaves nodes unchanged; emit a no-op splice
      // so delta replay never re-applies the previous append-code payload.
      const baseRevision = revision;

      revision += 1;

      return publish(
        currentSnapshot.nodes,
        currentSnapshot.diagnostics,
        {
          baseRevision,
          from: currentSnapshot.nodes.length,
          kind: 'splice',
          nodes: Object.freeze([]),
          revision,
        },
        committedBlocks.length,
        false,
        true
      );
    }

    const prevLeaf = fenceState.codeBlock.children[0];
    const prevText = TextApi.isText(prevLeaf) ? prevLeaf.text : '';
    const updatedBlock: Element = deepFreezeNode({
      ...fenceState.codeBlock,
      children: [{ text: prevText + appended }],
    });

    fenceState.codeBlock = updatedBlock;
    const nextNodes = [...committedBlocks, updatedBlock];
    const baseRevision = revision;

    revision += 1;
    metrics.appendCodeFastPaths += 1;

    return publish(
      nextNodes,
      currentSnapshot.diagnostics,
      {
        baseRevision,
        blockIndex: fenceState.blockIndex,
        kind: 'append-code',
        revision,
        text: appended,
      },
      committedBlocks.length,
      false,
      true
    );
  };

  const filterTableRowDiagnostics = (
    diags: readonly MarkdownDiagnostic[]
  ): MarkdownDiagnostic[] =>
    diags.filter((diagnostic) => {
      const source = 'source' in diagnostic ? diagnostic.source : undefined;

      return !(source?.start && source.start.line < 3);
    });

  const rebaseLimitDiagnostics = (
    diags: readonly MarkdownDiagnostic[],
    maxNodes: number
  ): MarkdownDiagnostic[] =>
    committedSyntaxNodes === 0
      ? [...diags]
      : diags.map((diagnostic) => {
          if (
            diagnostic.code === 'markdown-limit-exceeded' &&
            diagnostic.limit === 'maxNodes'
          ) {
            return Object.freeze({
              ...diagnostic,
              actual: diagnostic.actual + committedSyntaxNodes,
              maximum: maxNodes,
              message: `Markdown syntax tree exceeds ${maxNodes} nodes.`,
            });
          }

          return diagnostic;
        });

  const bailTable = () => {
    tableState = null;
    tableBailedAt = committedEnd;

    return null;
  };

  const tryIncrementalTable = (
    runtime: MarkdownRuntime,
    grammar: MarkdownTailGrammar,
    prevCommittedCount: number
  ): MarkdownStreamSnapshot<V> | null => {
    if (
      !grammar.table ||
      !currentSnapshot.ok ||
      hasDefinition ||
      tableBailedAt === committedEnd ||
      rawSource.startsWith(BYTE_ORDER_MARK) ||
      !knowsPluginSyntax(runtime) ||
      !hasOnlyKnownLocalRemarkPlugins(runtime) ||
      !isDefaultDecoder(runtime, 'table', PLUGINS.table)
    ) {
      tableState = null;

      return null;
    }

    const hasCr = rawSource.includes('\r');
    const limits = markdownParseLimits({ limits: policyLimits });
    const tableType = runtime.registry.type(PLUGINS.table);
    const tail = normalizedSource.slice(committedEnd);

    if (!tableState) {
      const nl1 = tail.indexOf('\n');

      if (nl1 === -1) return null;
      const nl2 = tail.indexOf('\n', nl1 + 1);

      if (nl2 === -1) return null;
      const headerLine = tail.slice(0, nl1);
      const sepLine = tail.slice(nl1 + 1, nl2);

      if (!headerLine.includes('|') || !TABLE_SEPARATOR_LINE_RE.test(sepLine)) {
        return null;
      }
      const headerLines = `${headerLine}\n${sepLine}`;
      const headerDiag = new MarkdownDiagnostics();
      const remainingNodes = Math.max(
        1,
        limits.maxNodes - committedSyntaxNodes
      );
      const parsedHeader = parseFragment(
        runtime,
        headerLines,
        {
          limits: { ...policyLimits, maxNodes: remainingNodes },
          lossPolicy: 'allow',
          positionShift: { lines: committedLines, offset: committedEnd },
        },
        headerDiag
      );

      if (
        !parsedHeader.nodes ||
        headerDiag.failure() ||
        parsedHeader.nodes.length !== 1 ||
        parsedHeader.hasDefinition ||
        (hasCr && headerDiag.all().length > 0)
      ) {
        return bailTable();
      }
      const tableNode = parsedHeader.nodes[0];

      if (
        !ElementApi.isElement(tableNode) ||
        tableNode.type !== tableType ||
        tableNode.children.length !== 1 ||
        !ElementApi.isElement(tableNode.children[0])
      ) {
        return bailTable();
      }

      const headerRow = deepFreezeNode(tableNode.children[0]);

      tableState = {
        blockIndex: committedBlocks.length,
        colCount: headerRow.children.length,
        committedRows: [headerRow],
        committedRowSyntaxNodes: 0,
        diagnostics: [...headerDiag.all()],
        headerLines,
        headerSyntaxNodes: parsedHeader.syntaxNodes,
        inProgressRow: null,
        nextRowLine: committedLines + 2,
        nextRowOffset: committedEnd + nl2 + 1,
        published: false,
        tableBase: tableNode,
        tableStart: committedEnd,
        tableType,
      };
    }

    const hadInProgress = tableState.inProgressRow !== null;
    const newlyValidatedRows: Element[] = [];
    let lastAppendedRow: Element | null = null;
    let lastRowIndex = -1;
    let lastDeltaKind: 'append-table-row' | 'replace-table-row' | null = null;
    let rowChanges = 0;

    while (tableState.nextRowOffset < normalizedSource.length) {
      const rowOffset = tableState.nextRowOffset;
      const nl = normalizedSource.indexOf('\n', rowOffset);

      if (nl === -1) break;
      const line = normalizedSource.slice(rowOffset, nl);

      if (BLANK_RE.test(line) || NON_TABLE_LINE_START_RE.test(line)) {
        return bailTable();
      }
      const rowDiag = new MarkdownDiagnostics();
      const parsedRow = parseFragment(
        runtime,
        `${tableState.headerLines}\n${line}`,
        {
          lossPolicy: 'allow',
          positionShift: {
            lines: tableState.nextRowLine - 2,
            minLine: 3,
            offset: rowOffset - (tableState.headerLines.length + 1),
          },
        },
        rowDiag
      );

      if (
        !parsedRow.nodes ||
        rowDiag.failure() ||
        parsedRow.nodes.length !== 1 ||
        parsedRow.hasDefinition
      ) {
        return bailTable();
      }
      const rowDiagnostics = filterTableRowDiagnostics(rowDiag.all());

      if (hasCr && rowDiagnostics.length > 0) {
        return bailTable();
      }
      const rowSyntaxDelta = Math.max(
        0,
        parsedRow.syntaxNodes - tableState.headerSyntaxNodes
      );

      if (
        committedSyntaxNodes +
          tableState.headerSyntaxNodes +
          tableState.committedRowSyntaxNodes +
          rowSyntaxDelta >
        limits.maxNodes
      ) {
        return bailTable();
      }
      const tableNode = parsedRow.nodes[0];

      if (
        !ElementApi.isElement(tableNode) ||
        tableNode.type !== tableState.tableType ||
        tableNode.children.length !== 2 ||
        !ElementApi.isElement(tableNode.children[0]) ||
        !ElementApi.isElement(tableNode.children[1])
      ) {
        return bailTable();
      }
      const parsedHeader = tableNode.children[0];
      const bodyRow = deepFreezeNode(tableNode.children[1]);

      // Widening row pads earlier rows in BaseTablePlugin -> fall back to full splice.
      if (
        parsedHeader.children.length > tableState.colCount ||
        bodyRow.children.length > tableState.colCount
      ) {
        return bailTable();
      }

      const rowIndex = tableState.committedRows.length;

      tableState.committedRows.push(bodyRow);
      newlyValidatedRows.push(bodyRow);
      tableState.committedRowSyntaxNodes += rowSyntaxDelta;
      if (rowDiagnostics.length > 0) {
        tableState.diagnostics.push(...rowDiagnostics);
      }
      tableState.nextRowOffset = nl + 1;
      tableState.nextRowLine += 1;
      lastAppendedRow = bodyRow;
      lastRowIndex = rowIndex;
      lastDeltaKind =
        rowChanges === 0 && hadInProgress
          ? 'replace-table-row'
          : 'append-table-row';
      rowChanges += 1;
      metrics.tableRowFastPaths += 1;
    }

    let nextInProgress: Element | null = null;
    let partialDiags: MarkdownDiagnostic[] = [];
    const partialOffset = tableState.nextRowOffset;
    const partialLine = normalizedSource.slice(partialOffset);

    if (partialLine.length > 0) {
      if (
        BLANK_RE.test(partialLine) ||
        NON_TABLE_LINE_START_RE.test(partialLine)
      ) {
        return bailTable();
      }
      const healedPartial = healTableRowTail(partialLine, {
        grammar,
        incompleteLinks,
        mode: 'inline',
        tags: runtime.formats.tags,
      });
      const rowDiag = new MarkdownDiagnostics();
      const parsedPartial = parseFragment(
        runtime,
        `${tableState.headerLines}\n${healedPartial.healed}`,
        {
          lossPolicy: 'allow',
          positionShift: {
            lines: tableState.nextRowLine - 2,
            minLine: 3,
            offset: partialOffset - (tableState.headerLines.length + 1),
          },
          suppressEndTagRepair: true,
        },
        rowDiag
      );

      if (
        !parsedPartial.nodes ||
        rowDiag.failure() ||
        parsedPartial.nodes.length !== 1 ||
        parsedPartial.hasDefinition
      ) {
        return bailTable();
      }
      partialDiags = filterTableRowDiagnostics(rowDiag.all());
      if (hasCr && partialDiags.length > 0) {
        return bailTable();
      }
      const partialSyntaxDelta = Math.max(
        0,
        parsedPartial.syntaxNodes - tableState.headerSyntaxNodes
      );

      if (
        committedSyntaxNodes +
          tableState.headerSyntaxNodes +
          tableState.committedRowSyntaxNodes +
          partialSyntaxDelta >
        limits.maxNodes
      ) {
        return bailTable();
      }
      const tableNode = parsedPartial.nodes[0];

      if (
        !ElementApi.isElement(tableNode) ||
        tableNode.type !== tableState.tableType ||
        tableNode.children.length !== 2 ||
        !ElementApi.isElement(tableNode.children[0]) ||
        !ElementApi.isElement(tableNode.children[1])
      ) {
        return bailTable();
      }
      if (
        tableNode.children[0].children.length > tableState.colCount ||
        tableNode.children[1].children.length > tableState.colCount
      ) {
        return bailTable();
      }
      nextInProgress = deepFreezeNode(
        stripHeldSuffix(
          [tableNode.children[1]],
          healedPartial.heldSuffix,
          runtime
        )[0] as Element
      );
      newlyValidatedRows.push(nextInProgress);
      lastAppendedRow = nextInProgress;
      lastRowIndex = tableState.committedRows.length;
      lastDeltaKind =
        rowChanges === 0 && hadInProgress
          ? 'replace-table-row'
          : 'append-table-row';
      rowChanges += 1;
      metrics.tableRowFastPaths += 1;
    }

    const validationTarget: Element = {
      ...tableState.tableBase,
      children:
        newlyValidatedRows.length > 0
          ? [tableState.committedRows[0], ...newlyValidatedRows]
          : [tableState.committedRows[0]],
    };
    const tableCheckDiag = new MarkdownDiagnostics();
    const validatedTable = validatePreviewBlocks(
      runtime,
      [validationTarget],
      tableCheckDiag
    );

    if (!validatedTable || validatedTable.repaired) {
      return bailTable();
    }

    const rows = nextInProgress
      ? [...tableState.committedRows, nextInProgress]
      : [...tableState.committedRows];
    const tableElement: Element = deepFreezeNode({
      ...tableState.tableBase,
      children: rows,
    });

    const tableExisted =
      tableState.published && prevCommittedCount === committedBlocks.length;

    tableState.inProgressRow = nextInProgress;
    tableState.published = true;
    const nextNodes = [...committedBlocks, tableElement];
    const baseRevision = revision;

    revision += 1;

    const delta: MarkdownStreamDelta =
      tableExisted && rowChanges === 1 && lastAppendedRow && lastDeltaKind
        ? {
            baseRevision,
            blockIndex: tableState.blockIndex,
            kind: lastDeltaKind,
            revision,
            row: lastAppendedRow,
            rowIndex: lastRowIndex,
          }
        : {
            baseRevision,
            from: prevCommittedCount,
            kind: 'splice',
            nodes: nextNodes.slice(prevCommittedCount),
            revision,
          };

    return publish(
      nextNodes,
      [
        ...committedSegments.flatMap((s) => s.diagnostics),
        ...tableState.diagnostics,
        ...partialDiags,
      ],
      delta,
      committedBlocks.length,
      false,
      true
    );
  };

  const maybeTrackOpenFence = (
    runtime: MarkdownRuntime,
    tail: string,
    tailBlocks: readonly Descendant[]
  ) => {
    fenceState = null;
    if (
      tailBlocks.length !== 1 ||
      !knowsPluginSyntax(runtime) ||
      !hasOnlyKnownLocalRemarkPlugins(runtime) ||
      !isDefaultDecoder(runtime, 'code', PLUGINS.codeBlock)
    ) {
      return;
    }
    const block = tailBlocks[0];

    if (!ElementApi.isElement(block) || block.type !== PLUGINS.codeBlock) {
      return;
    }
    const firstNl = tail.indexOf('\n');

    if (firstNl === -1) return;
    const openLine = tail.slice(0, firstNl);
    const match = FENCE_OPEN_RE.exec(openLine);

    if (!match) return;
    const fenceChar = match[1][0] as '`' | '~';
    const fenceLen = match[1].length;

    if (fenceChar === '`' && openLine.slice(match[0].length).includes('`')) {
      return;
    }
    const indent = match[0].length - fenceLen;
    const body = tail.slice(firstNl + 1);
    const bodyLines = body.split('\n');

    for (let i = 0; i < bodyLines.length; i++) {
      if (
        couldBeClosingFenceLine(
          bodyLines[i],
          fenceChar,
          fenceLen,
          i === bodyLines.length - 1
        )
      ) {
        return;
      }
    }

    fenceState = {
      blockIndex: committedBlocks.length,
      char: fenceChar,
      codeBlock: deepFreezeNode(block),
      indent,
      length: fenceLen,
      pendingNewline: body.endsWith('\n'),
      processedEnd: normalizedSource.length,
    };
  };

  const updateInlinePreview = (
    runtime: MarkdownRuntime,
    normChunk: string,
    wasReset: boolean
  ): MarkdownStreamSnapshot<V> => {
    const diagnostics = new MarkdownDiagnostics();

    if (exceedsByteLimit(diagnostics)) {
      revision += 1;

      return publish(
        [],
        diagnostics.all(),
        { kind: 'reset', revision },
        0,
        false,
        false
      );
    }

    const trimmed = normalizedSource.trim();

    if (!trimmed) {
      const nodes = parseInlineWhitespace(normalizedSource);
      const baseRevision = revision;

      revision += 1;

      return publish(
        nodes,
        diagnostics.warnings(),
        wasReset
          ? { kind: 'reset', revision }
          : { baseRevision, from: 0, kind: 'splice', nodes, revision },
        0,
        false,
        true
      );
    }

    if (
      !wasReset &&
      normChunk &&
      !/\s$/.test(normChunk) &&
      !tailHealedLast &&
      !PROSE_TRIGGER_RE.test(normChunk) &&
      !PROSE_TRIGGER_RE.test(normalizedSource) &&
      !PROSE_START_GUARD_RE.test(normalizedSource) &&
      knowsPluginSyntax(runtime) &&
      hasOnlyKnownLocalRemarkPlugins(runtime) &&
      isDefaultDecoder(runtime, 'paragraph', 'markdown') &&
      currentSnapshot.nodes.length === 1 &&
      TextApi.isText(currentSnapshot.nodes[0]) &&
      Object.keys(currentSnapshot.nodes[0]).length === 1 &&
      !/\s$/.test(currentSnapshot.nodes[0].text) &&
      currentSnapshot.nodes[0].text ===
        normalizedSource.slice(0, normalizedSource.length - normChunk.length)
    ) {
      const updated: Descendant = deepFreezeNode({
        text: currentSnapshot.nodes[0].text + normChunk,
      });
      const baseRevision = revision;

      revision += 1;
      metrics.appendTextFastPaths += 1;

      return publish(
        [updated],
        currentSnapshot.diagnostics,
        {
          baseRevision,
          blockIndex: 0,
          kind: 'append-text',
          revision,
          text: normChunk,
        },
        0,
        false,
        true
      );
    }

    const grammar = probeMarkdownTailGrammar(runtime);
    const leadingWs = /^[ \t\n\r]*/.exec(normalizedSource)?.[0] ?? '';
    const contentSource = normalizedSource.slice(leadingWs.length);
    const inlineHasDef = hasCompleteDefinitionOutsideCode(normalizedSource);
    const healed = inlineHasDef
      ? healDefinitionTail(contentSource, runtime.formats.tags, grammar.math)
      : healMarkdownTail(contentSource, {
          grammar,
          incompleteLinks,
          mode: 'inline',
          tags: runtime.formats.tags,
        });

    tailHealedLast = healed.modified;
    const rawHtmlTail = scanMarkdownTailBlocks(
      contentSource.replace(/[\n\r]+$/, ''),
      grammar.math,
      runtime.formats.tags
    ).inRawHtml;
    const trimmedHealed = rawHtmlTail
      ? healed.healed.replace(/^[ \t\n\r]+|[\n\r]+$/g, '')
      : healed.healed.replace(/^[ \t\n\r]+|[ \t\n\r]+$/g, '');

    if (!trimmedHealed) {
      const nodes = parseInlineWhitespace(leadingWs);
      const baseRevision = revision;

      revision += 1;

      return publish(
        nodes,
        diagnostics.warnings(),
        wasReset
          ? { kind: 'reset', revision }
          : { baseRevision, from: 0, kind: 'splice', nodes, revision },
        0,
        false,
        true
      );
    }

    metrics.fullTailParses += 1;
    const parsed = parseFragment(
      runtime,
      trimmedHealed,
      { inline: true, lossPolicy: 'allow', suppressEndTagRepair: true },
      diagnostics
    );

    if (!parsed.nodes) {
      revision += 1;

      return publish(
        [],
        diagnostics.all(),
        { kind: 'reset', revision },
        0,
        false,
        false
      );
    }

    const blocks = snapshotBlocks(runtime, parsed.nodes);
    const first = blocks[0];
    const paragraphType = getMarkdownParagraphType(runtime.registry);

    if (
      blocks.length !== 1 ||
      !ElementApi.isElement(first) ||
      first.type !== paragraphType
    ) {
      diagnostics.report({
        actual: blocks.length,
        code: 'markdown-inline-blocks',
        message:
          blocks.length > 1
            ? `Inline Markdown produced ${blocks.length} blocks. Use parseSlice for block content.`
            : `Inline Markdown produced a "${ElementApi.isElement(first) ? first.type : 'text'}" block. Use parseSlice for block content.`,
        severity: 'error',
      });
      revision += 1;

      return publish(
        [],
        diagnostics.all(),
        { kind: 'reset', revision },
        0,
        false,
        false
      );
    }

    const rawInlineNodes: Descendant[] = [
      ...parseInlineWhitespace(leadingWs),
      ...first.children,
    ];
    const inlineNodes = stripHeldSuffix(
      rawInlineNodes,
      healed.heldSuffix,
      runtime
    );

    const baseRevision = revision;

    revision += 1;

    return publish(
      inlineNodes,
      diagnostics.warnings(),
      wasReset
        ? { kind: 'reset', revision }
        : {
            baseRevision,
            from: 0,
            kind: 'splice',
            nodes: inlineNodes,
            revision,
          },
      0,
      false,
      true
    );
  };

  const updateBlocksPreview = (
    runtime: MarkdownRuntime,
    normChunk: string,
    wasReset: boolean
  ): MarkdownStreamSnapshot<V> => {
    const diagnostics = new MarkdownDiagnostics();

    if (exceedsByteLimit(diagnostics)) {
      revision += 1;

      return publish(
        [],
        diagnostics.all(),
        { kind: 'reset', revision },
        0,
        false,
        false
      );
    }

    const prevCommittedCount = committedBlocks.length;
    let resetFromDef = wasReset;

    const invalidateForDefinition = () => {
      hasDefinition = true;
      if (committedSegments.length > 0 || tableState || fenceState) {
        committedSegments = [];
        committedBlocks = [];
        committedEnd = 0;
        committedLines = 0;
        committedSyntaxNodes = 0;
        rejectedBoundaries = new Set();
        tableBailedAt = -1;
        tableState = null;
        fenceState = null;
        resetFromDef = true;
      }
    };

    if (!resetFromDef) {
      const textHit = tryParagraphFastPath(runtime, normChunk);

      if (textHit) return textHit;

      const fenceHit = tryOpenFenceFastPath(runtime, normChunk);

      if (fenceHit) return fenceHit;
    }

    const grammar = probeMarkdownTailGrammar(runtime);

    if (!resetFromDef && !fenceState) {
      const tableHit = tryIncrementalTable(
        runtime,
        grammar,
        prevCommittedCount
      );

      if (tableHit) return tableHit;
    }

    const canSegment =
      !hasDefinition &&
      !rawSource.includes('\r') &&
      !rawSource.startsWith(BYTE_ORDER_MARK) &&
      knowsPluginSyntax(runtime) &&
      hasOnlyKnownLocalRemarkPlugins(runtime);

    const limits = markdownParseLimits({ limits: policyLimits });

    if (canSegment) {
      const candidates = proposeSegmentBoundaries(
        normalizedSource,
        committedEnd,
        runtime.formats.tags
      );

      for (const boundary of candidates) {
        if (rejectedBoundaries.has(boundary)) continue;
        const segmentText = normalizedSource.slice(committedEnd, boundary);
        const segDiag = new MarkdownDiagnostics();
        const remainingNodes = Math.max(
          1,
          limits.maxNodes - committedSyntaxNodes
        );
        const parsedSeg = parseFragment(
          runtime,
          segmentText,
          {
            limits: { ...policyLimits, maxNodes: remainingNodes },
            lossPolicy: 'allow',
            positionShift: { lines: committedLines, offset: committedEnd },
            previousRootSibling: committedSegments.at(-1)?.lastRoot ?? null,
          },
          segDiag
        );

        if (!parsedSeg.nodes || segDiag.failure()) break;
        if (parsedSeg.hasDefinition) {
          invalidateForDefinition();
          break;
        }
        const lastRoot = parsedSeg.roots.at(-1) ?? null;
        const segAllDiag = segDiag.all();

        if (
          holdsSegmentOpen(segmentText, lastRoot, committedLines) ||
          !inSourceOrder(parsedSeg.roots) ||
          hasUnplacedDiagnostic(segAllDiag) ||
          hasUnclosedTagDiagnostic(segAllDiag)
        ) {
          rejectedBoundaries.add(boundary);
          continue;
        }
        const blocks = snapshotBlocks(runtime, parsedSeg.nodes);
        const validated = validatePreviewBlocks(runtime, blocks, segDiag);

        // Never commit schema-repaired segments: finish() must validate them strictly.
        if (!validated || validated.repaired) {
          rejectedBoundaries.add(boundary);
          break;
        }

        committedSegments.push({
          diagnostics: segAllDiag,
          lastRoot,
        });
        committedBlocks.push(...validated.nodes);
        committedLines += countLinesBefore(segmentText, segmentText.length);
        committedEnd = boundary;
        committedSyntaxNodes += Math.max(0, parsedSeg.syntaxNodes - 1);
        rejectedBoundaries = new Set();
        tableBailedAt = -1;
        tableState = null;
        fenceState = null;
      }

      if (
        !resetFromDef &&
        !hasDefinition &&
        !fenceState &&
        committedBlocks.length > prevCommittedCount
      ) {
        const tableHit = tryIncrementalTable(
          runtime,
          grammar,
          prevCommittedCount
        );

        if (tableHit) return tableHit;
      }
    }

    const parseTailPass = (): MarkdownStreamSnapshot<V> => {
      const tail = normalizedSource.slice(committedEnd);
      const healed = hasCompleteDefinitionOutsideCode(tail)
        ? healDefinitionTail(tail, runtime.formats.tags, grammar.math)
        : healMarkdownTail(tail, {
            grammar,
            incompleteLinks,
            mode: 'blocks',
            tags: runtime.formats.tags,
          });

      tailHealedLast = healed.modified;

      let tailBlocks: readonly Descendant[] = [];
      const tailDiag = new MarkdownDiagnostics();

      if (healed.healed.length > 0) {
        metrics.fullTailParses += 1;
        const remainingNodes = Math.max(
          1,
          limits.maxNodes - committedSyntaxNodes
        );
        const parsedTail = parseFragment(
          runtime,
          healed.healed,
          {
            limits: { ...policyLimits, maxNodes: remainingNodes },
            lossPolicy: 'allow',
            positionShift: { lines: committedLines, offset: committedEnd },
            previousRootSibling: committedSegments.at(-1)?.lastRoot ?? null,
            suppressEndTagRepair: true,
          },
          tailDiag
        );

        if (!parsedTail.nodes || tailDiag.failure()) {
          revision += 1;

          return publish(
            [],
            [
              ...committedSegments.flatMap((s) => s.diagnostics),
              ...rebaseLimitDiagnostics(tailDiag.all(), limits.maxNodes),
            ],
            { kind: 'reset', revision },
            0,
            false,
            false
          );
        }
        if (!hasDefinition && parsedTail.hasDefinition) {
          const hadCommitted =
            committedSegments.length > 0 ||
            tableState !== null ||
            fenceState !== null;

          invalidateForDefinition();
          if (hadCommitted) return parseTailPass();
        }
        const blocks = snapshotBlocks(runtime, parsedTail.nodes);
        const validated = validatePreviewBlocks(runtime, blocks, tailDiag);

        if (!validated) {
          revision += 1;

          return publish(
            [],
            [
              ...committedSegments.flatMap((s) => s.diagnostics),
              ...rebaseLimitDiagnostics(tailDiag.all(), limits.maxNodes),
            ],
            { kind: 'reset', revision },
            0,
            false,
            false
          );
        }
        tailBlocks = stripHeldSuffix(
          validated.nodes,
          healed.heldSuffix,
          runtime
        );
      }

      maybeTrackOpenFence(runtime, tail, tailBlocks);

      const allDiagnostics = [
        ...committedSegments.flatMap((s) => s.diagnostics),
        ...tailDiag.all(),
      ];
      const nextNodes = [...committedBlocks, ...tailBlocks];
      const baseRevision = revision;

      revision += 1;

      const delta: MarkdownStreamDelta =
        resetFromDef || !currentSnapshot.ok
          ? { kind: 'reset', revision }
          : {
              baseRevision,
              from: prevCommittedCount,
              kind: 'splice',
              nodes: nextNodes.slice(prevCommittedCount),
              revision,
            };

      return publish(
        nextNodes,
        allDiagnostics,
        delta,
        committedBlocks.length,
        false,
        true
      );
    };

    return parseTailPass();
  };

  const publishNoOp = (): MarkdownStreamSnapshot<V> => {
    const snap: MarkdownStreamSnapshot<V> = Object.freeze({
      ...currentSnapshot,
      delta: Object.freeze({
        baseRevision: revision,
        from: currentSnapshot.nodes.length,
        kind: 'splice',
        nodes: Object.freeze([]),
        revision,
      }),
    });

    currentSnapshot = snap;

    return snap;
  };

  const runAppend = (chunk: string): MarkdownStreamSnapshot<V> =>
    withMarkdownRuntime(editor, getPluginState(), (runtime) => {
      let wasReset = ensureRuntimeBound(runtime);

      if (currentSnapshot.done) {
        resetInternalState();
        wasReset = true;
      }
      const normChunk = appendNormalized(chunk);
      const byteUpdate = utf8ByteLength(chunk, pendingHighSurrogate);

      rawSource += chunk;
      rawByteLength += byteUpdate.bytes;
      pendingHighSurrogate = byteUpdate.endsHighSurrogate;
      normalizedSource += normChunk;

      if (mode === 'inline') {
        return updateInlinePreview(runtime, normChunk, wasReset);
      }

      return updateBlocksPreview(runtime, normChunk, wasReset);
    });

  const runFinish = (): MarkdownStreamSnapshot<V> =>
    withMarkdownRuntime(editor, getPluginState(), (runtime) => {
      const runtimeReset = ensureRuntimeBound(runtime);
      tableState = null;
      fenceState = null;

      if (currentSnapshot.done && !runtimeReset) {
        return publishNoOp();
      }

      if (mode === 'inline') {
        const result = parseMarkdownInlineWithRuntime(runtime, rawSource, {
          limits: policyLimits,
          lossPolicy: finishLossPolicy,
        });
        const baseRevision = revision;

        revision += 1;
        if (!result.ok) {
          return publish(
            [],
            result.diagnostics,
            { kind: 'reset', revision },
            0,
            true,
            false
          );
        }
        const nodes = result.slice.content;

        return publish(
          nodes,
          result.diagnostics,
          { baseRevision, from: 0, kind: 'splice', nodes, revision },
          nodes.length,
          true,
          true,
          result.slice as ContentSlice<V>
        );
      }

      const diagnostics = new MarkdownDiagnostics();

      if (exceedsByteLimit(diagnostics)) {
        revision += 1;

        return publish(
          [],
          diagnostics.all(),
          { kind: 'reset', revision },
          0,
          true,
          false
        );
      }

      const canReuseCommitted =
        currentSnapshot.ok &&
        committedSegments.length > 0 &&
        !hasDefinition &&
        !rawSource.includes('\r') &&
        !rawSource.startsWith(BYTE_ORDER_MARK) &&
        hasOnlyKnownLocalRemarkPlugins(runtime) &&
        knowsPluginSyntax(runtime) &&
        (finishLossPolicy === 'allow' ||
          committedSegments.every((seg) => seg.diagnostics.length === 0));

      if (canReuseCommitted) {
        const tail = normalizedSource.slice(committedEnd);
        const limits = markdownParseLimits({ limits: policyLimits });
        const remainingNodes = Math.max(
          1,
          limits.maxNodes - committedSyntaxNodes
        );
        const tailDiag = new MarkdownDiagnostics();
        const parsedTail = tail
          ? parseFragment(
              runtime,
              tail,
              {
                limits: { ...policyLimits, maxNodes: remainingNodes },
                lossPolicy: finishLossPolicy,
                positionShift: { lines: committedLines, offset: committedEnd },
                previousRootSibling: committedSegments.at(-1)?.lastRoot ?? null,
              },
              tailDiag
            )
          : {
              hasDefinition: false,
              nodes: [] as readonly Descendant[],
              roots: [],
              syntaxNodes: 0,
            };

        if (
          parsedTail.nodes &&
          !tailDiag.failure() &&
          !parsedTail.hasDefinition
        ) {
          const tailBlocks = snapshotBlocks(runtime, parsedTail.nodes);
          const unlanded =
            landsMarkdownParagraph(runtime.registry) &&
            findMarkdownParagraph(tailBlocks, []);

          if (!unlanded) {
            try {
              const schema: MarkdownRuntime['state']['schema'] =
                runtime.state.schema;

              schema.assertFragment(tailBlocks);
              const allNodes = Object.freeze([
                ...committedBlocks,
                ...tailBlocks,
              ]);
              const slice = createValidatedContentSlice(
                allNodes,
                runtime.state.schema
              ) as ContentSlice<V>;
              const allDiags = [
                ...committedSegments.flatMap((s) => s.diagnostics),
                ...tailDiag.all(),
              ];
              const baseRevision = revision;

              revision += 1;

              return publish(
                allNodes,
                allDiags,
                {
                  baseRevision,
                  from: committedBlocks.length,
                  kind: 'splice',
                  nodes: tailBlocks,
                  revision,
                },
                allNodes.length,
                true,
                true,
                slice
              );
            } catch {
              // Fall through to whole-source validation for accurate full-slice diagnostics.
            }
          }
        }
      }

      const fresh = parseMarkdownSliceWithRuntime(runtime, rawSource, {
        limits: policyLimits,
        lossPolicy: finishLossPolicy,
      });

      revision += 1;
      if (!fresh.ok) {
        return publish(
          [],
          fresh.diagnostics,
          { kind: 'reset', revision },
          0,
          true,
          false
        );
      }

      const freshNodes = fresh.slice.content;
      const keepPrefix =
        currentSnapshot.ok &&
        committedBlocks.length > 0 &&
        freshNodes.length >= committedBlocks.length &&
        sameUpToListIds(
          committedBlocks,
          freshNodes.slice(0, committedBlocks.length)
        );

      if (keepPrefix) {
        const tailNodes = freshNodes.slice(committedBlocks.length);
        const mergedNodes = Object.freeze([...committedBlocks, ...tailNodes]);
        const slice = createValidatedContentSlice(
          mergedNodes,
          runtime.state.schema
        ) as ContentSlice<V>;

        return publish(
          mergedNodes,
          fresh.diagnostics,
          {
            baseRevision: revision - 1,
            from: committedBlocks.length,
            kind: 'splice',
            nodes: tailNodes,
            revision,
          },
          mergedNodes.length,
          true,
          true,
          slice
        );
      }

      return publish(
        freshNodes,
        fresh.diagnostics,
        { kind: 'reset', revision },
        freshNodes.length,
        true,
        true,
        fresh.slice as ContentSlice<V>
      );
    });

  const runReset = () => {
    rawSource = '';
    rawByteLength = 0;
    pendingHighSurrogate = false;
    normalizedSource = '';
    pendingCr = false;
    revision = 0;
    resetInternalState();
    currentSnapshot = makeInitialSnapshot<V>();
  };

  const runSet = (source: string): MarkdownStreamSnapshot<V> => {
    if (source === rawSource && !currentSnapshot.done) {
      return withMarkdownRuntime(editor, getPluginState(), (runtime) => {
        if (!ensureRuntimeBound(runtime)) {
          return publishNoOp();
        }
        if (mode === 'inline') {
          return updateInlinePreview(runtime, '', true);
        }

        return updateBlocksPreview(runtime, '', true);
      });
    }
    if (source.startsWith(rawSource) && !currentSnapshot.done) {
      return runAppend(source.slice(rawSource.length));
    }
    rawSource = '';
    rawByteLength = 0;
    pendingHighSurrogate = false;
    normalizedSource = '';
    pendingCr = false;
    resetInternalState();

    return withMarkdownRuntime(editor, getPluginState(), (runtime) => {
      ensureRuntimeBound(runtime);
      const normChunk = appendNormalized(source);
      const byteUpdate = utf8ByteLength(source);

      rawSource = source;
      rawByteLength = byteUpdate.bytes;
      pendingHighSurrogate = byteUpdate.endsHighSurrogate;
      normalizedSource = normChunk;

      if (mode === 'inline') {
        return updateInlinePreview(runtime, normChunk, true);
      }

      return updateBlocksPreview(runtime, normChunk, true);
    });
  };

  const stream: MarkdownStream<V> = Object.freeze({
    append: runAppend,
    finish: runFinish,
    reset: runReset,
    set: runSet,
    get snapshot() {
      return currentSnapshot;
    },
    get source() {
      return rawSource;
    },
  });

  streamMetrics.set(stream, metrics);

  return stream;
};
