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
  reportByteLimit,
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
  type MarkdownTailGrammar,
  probeMarkdownTailGrammar,
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
  appendCodeFastPaths: number;
  appendTextFastPaths: number;
  fullTailParses: number;
  parsedChars: number;
  parserCalls: number;
  tableRowFastPaths: number;
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
// Matches link or footnote definitions even inside quotes or list items.
const DEFINITION_LINE_RE =
  /^(?:[ \t>]|[*+-][ \t]|\d{1,9}[.)][ \t])*\[(?:[^[\]\\]|\\[\s\S])+\]:/;
const TABLE_SEPARATOR_LINE_RE =
  /^[ \t]*\|?(?:[ \t]*:?-{1,}:?[ \t]*\|)+[ \t]*:?-{1,}:?[ \t]*\|?[ \t]*$|^[ \t]*\|[ \t]*:?-{1,}:?[ \t]*\|?[ \t]*$/;
const NON_TABLE_LINE_START_RE =
  /^ {0,3}(?:#{1,6}(?:[ \t]|$)|>|`{3,}|~{3,}|\$\$|<(?:pre|script|style|textarea|!--)|(?:[*+-]|\d{1,9}[.)])[ \t])/i;

// Characters or sequences that can trigger inline or block Markdown syntax when
// appended to a plain unmarked paragraph.
const PROSE_TRIGGER_RE = /[*_~[\]()\\`<>:&|#$!@;\n\r]| {2}|www\.|http/i;
const PROSE_START_GUARD_RE = /^ {0,3}(?:[-+=]|\d{1,9}[.)]?$)/;

type CommittedSegment = Readonly<{
  diagnostics: readonly MarkdownDiagnostic[];
  end: number;
  lastRoot: MdRootContent | null;
  nodes: readonly Descendant[];
  syntaxNodes: number;
}>;

type IncrementalTableState = {
  blockIndex: number;
  colCount: number;
  committedRows: Element[];
  headerLines: string;
  inProgressRow: Element | null;
  nextRowOffset: number;
  tableStart: number;
};

type IncrementalFenceState = {
  blockIndex: number;
  char: '`' | '~';
  codeBlock: Element;
  fenceStart: number;
  indent: number;
  length: number;
  pendingNewline: boolean;
  processedEnd: number;
};

type TagPatterns = Readonly<{ close: RegExp; open: RegExp }>;

const escapeRegExp = (name: string) =>
  name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createBlockTagPatterns = (
  tags: MarkdownTagRegistry
): TagPatterns | null => {
  const names = [...tags]
    .filter(([, kind]) => kind === 'block')
    .map(([name]) => escapeRegExp(name));

  return names.length === 0
    ? null
    : {
        close: new RegExp(`</(?:${names.join('|')})\\s*>`, 'g'),
        open: new RegExp(`<(?:${names.join('|')})(?=[\\s>/])[^>]*?(/?)>`, 'g'),
      };
};

const isDefaultDecoder = (
  runtime: MarkdownRuntime,
  kind: string,
  expectedOwner: string
): boolean => {
  const decoders = runtime.formats.decodeByNode.get(kind);

  return decoders?.length === 1 && decoders[0].owner === expectedOwner;
};

const hasDefinitionOutsideCode = (source: string): boolean => {
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

        if (!isIndentedCode && DEFINITION_LINE_RE.test(line)) {
          return true;
        }
      }
      afterBlank = false;
    }
    offset = nl === -1 ? source.length : nl + 1;
  }

  return false;
};

/** Proposes candidate blank-line segment boundaries after `from` for parser verification. */
const proposeSegmentBoundaries = (
  source: string,
  from: number,
  tags: MarkdownTagRegistry
): number[] => {
  const tagPatterns = createBlockTagPatterns(tags);
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
          } else if (tagPatterns) {
            for (const match of line.matchAll(tagPatterns.open)) {
              if (match[1] !== '/') tagDepth += 1;
            }
            for (const _ of line.matchAll(tagPatterns.close)) {
              tagDepth = Math.max(0, tagDepth - 1);
            }
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
  last: MdRootContent | null
): boolean => {
  if (!last?.position) return true;
  const lines = segment.split('\n');
  let textLines = lines.length;

  while (textLines > 0 && BLANK_RE.test(lines[textLines - 1])) textLines -= 1;

  return last.position.end.line > textLines;
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

const shiftDiagnostic = (
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

const LEADING_WS_MATCH = /^[\t\n\f\r ]+/;
const TRAILING_WS_MATCH = /[\t\n\f\r ]+$/;

const assertFragment = (
  runtime: MarkdownRuntime,
  nodes: readonly Descendant[]
) => {
  runtime.state.schema.assertFragment(nodes);
};

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
  let normalizedSource = '';
  let pendingCr = false;
  let revision = 0;
  let currentSnapshot: MarkdownStreamSnapshot<V> = makeInitialSnapshot<V>();

  // Cached runtime fingerprint for invalidation if plugin state changes mid-stream.
  let boundFormats: object | null = null;
  let boundRemarkPlugins: readonly unknown[] = [];
  let boundOwnerStates: readonly unknown[] = [];

  // Committed state for block streaming.
  let committedSegments: CommittedSegment[] = [];
  let committedBlocks: Descendant[] = [];
  let committedEnd = 0;
  let committedSyntaxNodes = 0;
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
    committedSyntaxNodes = 0;
    hasDefinition = false;
    tailHealedLast = false;
    tableState = null;
    fenceState = null;
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
      if (committedSegments.length > 0 || tableState || fenceState) {
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
      limits?: Partial<
        typeof policyLimits extends undefined
          ? never
          : NonNullable<typeof policyLimits>
      >;
      lossPolicy: 'allow' | 'reject';
      previousRootSibling?: MdRootContent | null;
    }>,
    diagnostics: MarkdownDiagnostics
  ): {
    nodes: readonly Descendant[] | null;
    roots: readonly MdRootContent[];
    syntaxNodes: number;
  } => {
    metrics.parserCalls += 1;
    metrics.parsedChars += text.length;
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
          onRootChildren: (children) => {
            roots = children;
          },
          onSyntaxNodes: (count) => {
            syntaxNodes = count;
          },
          previousRootSibling: parseOpts.previousRootSibling,
        },
        text
      );

      return { nodes: parsed, roots, syntaxNodes };
    } catch (error) {
      if (error instanceof ReportedMarkdownFailureError) {
        return { nodes: null, roots: [], syntaxNodes: 0 };
      }
      throw error;
    }
  };

  const validatePreviewBlocks = (
    runtime: MarkdownRuntime,
    blocks: readonly Descendant[],
    diagnostics: MarkdownDiagnostics
  ): readonly Descendant[] | null => {
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

      return blocks;
    } catch {
      // Schema-constrained incomplete containers (such as <columnGroup> with 1
      // <column>) repair for live preview while finish() still validates strictly.
      try {
        const fitted = runtime.state.schema.fitDocument({
          children: blocks.filter((node): node is Element =>
            ElementApi.isElement(node)
          ),
        }).children;

        runtime.state.schema.assertFragment(fitted);

        return fitted;
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
    const frozenNodes = Object.freeze([...nextNodes]);
    const snap: MarkdownStreamSnapshot<V> = Object.freeze({
      delta: Object.freeze(delta),
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
      tailHealedLast ||
      tableState ||
      fenceState ||
      hasDefinition ||
      rawSource.includes('\r') ||
      rawSource.startsWith(BYTE_ORDER_MARK) ||
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
    // Check that the existing leaf matches the tail text (not transformed or trimmed).
    const prevTailSource = tailSource.slice(
      0,
      tailSource.length - normChunk.length
    );

    if (!prevTailSource || leaf.text !== prevTailSource) return null;

    const limits = markdownParseLimits({ limits: policyLimits });
    if (new TextEncoder().encode(rawSource).byteLength > limits.maxBytes) {
      return null;
    }

    const blockIndex = committedBlocks.length;
    const updatedParagraph: Element = {
      ...tailBlock,
      children: [{ text: leaf.text + normChunk }],
    };
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
      !normChunk ||
      hasDefinition ||
      rawSource.includes('\r') ||
      rawSource.startsWith(BYTE_ORDER_MARK) ||
      !hasOnlyKnownLocalRemarkPlugins(runtime) ||
      !isDefaultDecoder(runtime, 'code', PLUGINS.codeBlock)
    ) {
      return null;
    }
    const limits = markdownParseLimits({ limits: policyLimits });

    if (new TextEncoder().encode(rawSource).byteLength > limits.maxBytes) {
      return null;
    }

    const tailSlice = normalizedSource.slice(fenceState.processedEnd);
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

    // Bail out to the real parser if any arriving line could close the fence.
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

    // Build appended text with fence indent stripping and deferred trailing newline.
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
      // Only a deferred trailing newline arrived; document text is unchanged.
      return currentSnapshot;
    }

    const prevLeaf = fenceState.codeBlock.children[0];
    const prevText = TextApi.isText(prevLeaf) ? prevLeaf.text : '';
    const updatedBlock: Element = {
      ...fenceState.codeBlock,
      children: [{ text: prevText + appended }],
    };

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

  const tryIncrementalTable = (
    runtime: MarkdownRuntime,
    grammar: MarkdownTailGrammar,
    diagnostics: MarkdownDiagnostics
  ): MarkdownStreamSnapshot<V> | null => {
    if (
      !grammar.table ||
      hasDefinition ||
      rawSource.includes('\r') ||
      rawSource.startsWith(BYTE_ORDER_MARK) ||
      !hasOnlyKnownLocalRemarkPlugins(runtime) ||
      !isDefaultDecoder(runtime, 'table', PLUGINS.table)
    ) {
      tableState = null;

      return null;
    }

    const tail = normalizedSource.slice(committedEnd);

    // Try to enter incremental table mode when the tail starts with header + separator + '\n'.
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
      const parsedHeader = parseFragment(
        runtime,
        headerLines,
        { lossPolicy: 'allow' },
        headerDiag
      );

      if (!parsedHeader.nodes || parsedHeader.nodes.length !== 1) return null;
      const tableNode = parsedHeader.nodes[0];

      if (
        !ElementApi.isElement(tableNode) ||
        tableNode.type !== PLUGINS.table ||
        tableNode.children.length !== 1 ||
        !ElementApi.isElement(tableNode.children[0])
      ) {
        return null;
      }

      const headerRow = tableNode.children[0];

      tableState = {
        blockIndex: committedBlocks.length,
        colCount: headerRow.children.length,
        committedRows: [headerRow],
        headerLines,
        inProgressRow: null,
        nextRowOffset: committedEnd + nl2 + 1,
        tableStart: committedEnd,
      };
    }

    // Advance row-by-row over complete body lines since `tableState.nextRowOffset`.
    const startRowCount = tableState.committedRows.length;
    const hadInProgress = tableState.inProgressRow !== null;
    let lastAppendedRow: Element | null = null;
    let lastRowIndex = -1;
    let lastDeltaKind:
      | 'append-table-row'
      | 'replace-table-row'
      | 'splice'
      | null = null;
    let rowChanges = 0;

    while (tableState.nextRowOffset < normalizedSource.length) {
      const nl = normalizedSource.indexOf('\n', tableState.nextRowOffset);

      if (nl === -1) break;
      const line = normalizedSource.slice(tableState.nextRowOffset, nl);

      if (BLANK_RE.test(line) || NON_TABLE_LINE_START_RE.test(line)) {
        // Table ended; fall back to normal segment commit + tail parse.
        tableState = null;

        return null;
      }
      const rowDiag = new MarkdownDiagnostics();
      const parsedRow = parseFragment(
        runtime,
        `${tableState.headerLines}\n${line}`,
        { lossPolicy: 'allow' },
        rowDiag
      );

      if (!parsedRow.nodes || parsedRow.nodes.length !== 1) {
        tableState = null;

        return null;
      }
      const tableNode = parsedRow.nodes[0];

      if (
        !ElementApi.isElement(tableNode) ||
        tableNode.type !== PLUGINS.table ||
        tableNode.children.length !== 2 ||
        !ElementApi.isElement(tableNode.children[0]) ||
        !ElementApi.isElement(tableNode.children[1])
      ) {
        tableState = null;

        return null;
      }
      const parsedHeader = tableNode.children[0];
      const bodyRow = tableNode.children[1];

      // Widening row pads earlier rows in BaseTablePlugin -> fall back to full splice.
      if (
        parsedHeader.children.length > tableState.colCount ||
        bodyRow.children.length > tableState.colCount
      ) {
        tableState = null;

        return null;
      }

      const rowIndex = tableState.committedRows.length;

      tableState.committedRows.push(bodyRow);
      tableState.nextRowOffset = nl + 1;
      lastAppendedRow = bodyRow;
      lastRowIndex = rowIndex;
      lastDeltaKind =
        rowChanges === 0 && hadInProgress
          ? 'replace-table-row'
          : 'append-table-row';
      rowChanges += 1;
      metrics.tableRowFastPaths += 1;
    }

    // Handle trailing in-progress row (if any non-empty chars arrived without '\n').
    let nextInProgress: Element | null = null;
    const partialLine = normalizedSource.slice(tableState.nextRowOffset);

    if (partialLine.length > 0) {
      if (
        BLANK_RE.test(partialLine) ||
        NON_TABLE_LINE_START_RE.test(partialLine)
      ) {
        tableState = null;

        return null;
      }
      const healedRow = healMarkdownTail(partialLine, {
        grammar,
        incompleteLinks,
        mode: 'inline',
        tags: runtime.formats.tags,
      }).healed;
      const rowDiag = new MarkdownDiagnostics();
      const parsedPartial = parseFragment(
        runtime,
        `${tableState.headerLines}\n${healedRow}`,
        { lossPolicy: 'allow' },
        rowDiag
      );

      if (!parsedPartial.nodes || parsedPartial.nodes.length !== 1) {
        tableState = null;

        return null;
      }
      const tableNode = parsedPartial.nodes[0];

      if (
        !ElementApi.isElement(tableNode) ||
        tableNode.type !== PLUGINS.table ||
        tableNode.children.length !== 2 ||
        !ElementApi.isElement(tableNode.children[0]) ||
        !ElementApi.isElement(tableNode.children[1])
      ) {
        tableState = null;

        return null;
      }
      if (
        tableNode.children[0].children.length > tableState.colCount ||
        tableNode.children[1].children.length > tableState.colCount
      ) {
        tableState = null;

        return null;
      }
      nextInProgress = tableNode.children[1];
      lastAppendedRow = nextInProgress;
      lastRowIndex = tableState.committedRows.length;
      lastDeltaKind =
        rowChanges === 0 && hadInProgress
          ? 'replace-table-row'
          : 'append-table-row';
      rowChanges += 1;
      metrics.tableRowFastPaths += 1;
    }

    tableState.inProgressRow = nextInProgress;
    const rows = nextInProgress
      ? [...tableState.committedRows, nextInProgress]
      : [...tableState.committedRows];
    const tableElement: Element = {
      children: rows,
      type: PLUGINS.table,
    };
    const nextNodes = [...committedBlocks, tableElement];
    const baseRevision = revision;

    revision += 1;

    // If a single row appended/replaced and table already existed, emit granular table delta.
    const tableExisted =
      startRowCount > 1 ||
      (currentSnapshot.nodes.length === committedBlocks.length + 1 &&
        ElementApi.isElement(currentSnapshot.nodes[committedBlocks.length]) &&
        (currentSnapshot.nodes[committedBlocks.length] as Element).type ===
          PLUGINS.table);
    const delta: MarkdownStreamDelta =
      tableExisted &&
      rowChanges === 1 &&
      lastAppendedRow &&
      (lastDeltaKind === 'append-table-row' ||
        lastDeltaKind === 'replace-table-row')
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
            from: committedBlocks.length,
            kind: 'splice',
            nodes: [tableElement],
            revision,
          };

    return publish(
      nextNodes,
      diagnostics.warnings(),
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

    // Only track if the fence is still open (no closing fence line inside body).
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
      codeBlock: block,
      fenceStart: committedEnd,
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

    if (reportByteLimit(rawSource, { limits: policyLimits }, diagnostics)) {
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

    // Tightly-gated inline plain-text fast path.
    if (
      !wasReset &&
      normChunk &&
      !tailHealedLast &&
      !PROSE_TRIGGER_RE.test(normChunk) &&
      !PROSE_TRIGGER_RE.test(normalizedSource) &&
      hasOnlyKnownLocalRemarkPlugins(runtime) &&
      isDefaultDecoder(runtime, 'paragraph', 'markdown') &&
      currentSnapshot.nodes.length === 1 &&
      TextApi.isText(currentSnapshot.nodes[0]) &&
      Object.keys(currentSnapshot.nodes[0]).length === 1 &&
      currentSnapshot.nodes[0].text ===
        normalizedSource.slice(0, normalizedSource.length - normChunk.length)
    ) {
      const updated: Descendant = {
        text: currentSnapshot.nodes[0].text + normChunk,
      };
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
    const leadingWs = LEADING_WS_MATCH.exec(normalizedSource)?.[0] ?? '';
    const trailingWs = TRAILING_WS_MATCH.exec(normalizedSource)?.[0] ?? '';
    const contentSource = normalizedSource.slice(leadingWs.length);
    const healed = healMarkdownTail(contentSource, {
      grammar,
      incompleteLinks,
      mode: 'inline',
      tags: runtime.formats.tags,
    });

    tailHealedLast = healed.modified;
    const trimmedHealed = healed.healed.trim();

    if (!trimmedHealed) {
      const nodes = parseInlineWhitespace(leadingWs + trailingWs);
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
      { inline: true, lossPolicy: 'allow' },
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
    const inlineNodes: Descendant[] =
      blocks.length === 1 &&
      ElementApi.isElement(first) &&
      first.type === getMarkdownParagraphType(runtime.registry)
        ? [
            ...parseInlineWhitespace(leadingWs),
            ...first.children,
            ...parseInlineWhitespace(trailingWs),
          ]
        : [...blocks];

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

    if (reportByteLimit(rawSource, { limits: policyLimits }, diagnostics)) {
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

    // Container-aware late-definition check.
    let resetFromDef = wasReset;

    if (!hasDefinition && hasDefinitionOutsideCode(normalizedSource)) {
      hasDefinition = true;
      if (committedSegments.length > 0 || tableState || fenceState) {
        committedSegments = [];
        committedBlocks = [];
        committedEnd = 0;
        committedSyntaxNodes = 0;
        tableState = null;
        fenceState = null;
        resetFromDef = true;
      }
    }

    if (!resetFromDef) {
      const textHit = tryParagraphFastPath(runtime, normChunk);

      if (textHit) return textHit;

      const fenceHit = tryOpenFenceFastPath(runtime, normChunk);

      if (fenceHit) return fenceHit;
    }

    const grammar = probeMarkdownTailGrammar(runtime);

    // Try fixed-width incremental GFM table when not resetting.
    if (!resetFromDef && !fenceState) {
      const tableHit = tryIncrementalTable(runtime, grammar, diagnostics);

      if (tableHit) return tableHit;
    }

    const canSegment =
      !hasDefinition &&
      !rawSource.includes('\r') &&
      !rawSource.startsWith(BYTE_ORDER_MARK) &&
      knowsPluginSyntax(runtime);

    const limits = markdownParseLimits({ limits: policyLimits });

    if (canSegment) {
      const candidates = proposeSegmentBoundaries(
        normalizedSource,
        committedEnd,
        runtime.formats.tags
      );

      for (const boundary of candidates) {
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
            previousRootSibling: committedSegments.at(-1)?.lastRoot ?? null,
          },
          segDiag
        );

        if (!parsedSeg.nodes || segDiag.failure()) break;
        const lastRoot = parsedSeg.roots.at(-1) ?? null;
        const segAllDiag = segDiag.all();

        if (
          holdsSegmentOpen(segmentText, lastRoot) ||
          !inSourceOrder(parsedSeg.roots) ||
          hasUnplacedDiagnostic(segAllDiag)
        ) {
          continue;
        }
        const blocks = snapshotBlocks(runtime, parsedSeg.nodes);
        const validated = validatePreviewBlocks(runtime, blocks, segDiag);

        if (!validated) break;

        const lineShift = countLinesBefore(normalizedSource, committedEnd);
        const shiftedDiags = segAllDiag.map((d) =>
          shiftDiagnostic(d, lineShift, committedEnd)
        );

        committedSegments.push({
          diagnostics: shiftedDiags,
          end: boundary,
          lastRoot,
          nodes: validated,
          syntaxNodes: parsedSeg.syntaxNodes,
        });
        committedBlocks.push(...validated);
        committedEnd = boundary;
        committedSyntaxNodes += Math.max(0, parsedSeg.syntaxNodes - 1);
        tableState = null;
        fenceState = null;
      }

      // After committing new segments, check if the remaining tail opens a table.
      if (!resetFromDef && !fenceState) {
        const tableHit = tryIncrementalTable(runtime, grammar, diagnostics);

        if (tableHit) return tableHit;
      }
    }

    const tail = normalizedSource.slice(committedEnd);
    const healed = healMarkdownTail(tail, {
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
          previousRootSibling: committedSegments.at(-1)?.lastRoot ?? null,
        },
        tailDiag
      );

      if (!parsedTail.nodes || tailDiag.failure()) {
        revision += 1;

        return publish(
          [],
          [
            ...committedSegments.flatMap((s) => s.diagnostics),
            ...tailDiag.all(),
          ],
          { kind: 'reset', revision },
          0,
          false,
          false
        );
      }
      const blocks = snapshotBlocks(runtime, parsedTail.nodes);
      const validated = validatePreviewBlocks(runtime, blocks, tailDiag);

      if (!validated) {
        revision += 1;

        return publish(
          [],
          [
            ...committedSegments.flatMap((s) => s.diagnostics),
            ...tailDiag.all(),
          ],
          { kind: 'reset', revision },
          0,
          false,
          false
        );
      }
      tailBlocks = validated;
    }

    maybeTrackOpenFence(runtime, tail, tailBlocks);

    const lineShift = countLinesBefore(normalizedSource, committedEnd);
    const allDiagnostics = [
      ...committedSegments.flatMap((s) => s.diagnostics),
      ...tailDiag.all().map((d) => shiftDiagnostic(d, lineShift, committedEnd)),
    ];
    const nextNodes = [...committedBlocks, ...tailBlocks];
    const baseRevision = revision;

    revision += 1;

    const delta: MarkdownStreamDelta = resetFromDef
      ? { kind: 'reset', revision }
      : {
          baseRevision,
          from: committedBlocks.length,
          kind: 'splice',
          nodes: tailBlocks,
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

  const runAppend = (chunk: string): MarkdownStreamSnapshot<V> =>
    withMarkdownRuntime(editor, getPluginState(), (runtime) => {
      const wasReset = ensureRuntimeBound(runtime);
      const normChunk = appendNormalized(chunk);

      rawSource += chunk;
      normalizedSource += normChunk;

      if (mode === 'inline') {
        return updateInlinePreview(runtime, normChunk, wasReset);
      }

      return updateBlocksPreview(runtime, normChunk, wasReset);
    });

  const runFinish = (): MarkdownStreamSnapshot<V> =>
    withMarkdownRuntime(editor, getPluginState(), (runtime) => {
      ensureRuntimeBound(runtime);
      tableState = null;
      fenceState = null;

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

      if (reportByteLimit(rawSource, { limits: policyLimits }, diagnostics)) {
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
                previousRootSibling: committedSegments.at(-1)?.lastRoot ?? null,
              },
              tailDiag
            )
          : { nodes: [] as readonly Descendant[], roots: [], syntaxNodes: 0 };

        if (parsedTail.nodes && !tailDiag.failure()) {
          const tailBlocks = snapshotBlocks(runtime, parsedTail.nodes);
          const unlanded =
            landsMarkdownParagraph(runtime.registry) &&
            findMarkdownParagraph(tailBlocks, []);

          if (!unlanded) {
            try {
              assertFragment(runtime, tailBlocks);
              const allNodes = Object.freeze([
                ...committedBlocks,
                ...tailBlocks,
              ]);
              const slice = createValidatedContentSlice(
                allNodes,
                runtime.state.schema
              ) as ContentSlice<V>;
              const lineShift = countLinesBefore(
                normalizedSource,
                committedEnd
              );
              const allDiags = [
                ...committedSegments.flatMap((s) => s.diagnostics),
                ...tailDiag
                  .all()
                  .map((d) => shiftDiagnostic(d, lineShift, committedEnd)),
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

      // Whole-source strict reconciliation (custom remarkPlugins, late defs, CRLF/BOM, or errors).
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
    normalizedSource = '';
    pendingCr = false;
    revision = 0;
    resetInternalState();
    currentSnapshot = makeInitialSnapshot<V>();
  };

  const runSet = (source: string): MarkdownStreamSnapshot<V> => {
    if (source === rawSource && !currentSnapshot.done) {
      return currentSnapshot;
    }
    if (source.startsWith(rawSource) && !currentSnapshot.done) {
      return runAppend(source.slice(rawSource.length));
    }
    rawSource = '';
    normalizedSource = '';
    pendingCr = false;
    resetInternalState();

    return withMarkdownRuntime(editor, getPluginState(), (runtime) => {
      ensureRuntimeBound(runtime);
      const normChunk = appendNormalized(source);

      rawSource = source;
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
