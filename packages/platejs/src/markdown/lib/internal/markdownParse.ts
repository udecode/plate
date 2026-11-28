import type {
  List,
  ListItem,
  Nodes,
  Paragraph,
  Root,
  RootContent as MdRootContent,
} from 'mdast';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';

import {
  ContentSlice,
  type Descendant,
  type EditorCoreStateView,
  type EditorDocumentValue,
  EditorSchemaValidationError,
  type Element,
  ElementApi,
  TextApi,
} from '../../../core';
import { sameUpToListIds } from '../../../features/list/lib/listIdentity.internal';
import {
  getMarkdownParagraphType,
  landsMarkdownParagraph,
  UNLANDED_MARKDOWN_PARAGRAPH_TYPE,
} from '../../../internal/plugin/markdownParagraph';
import { createValidatedContentSlice } from '../../../internal/utils/trustedContentSlice';
import { mdastToSlate } from '../deserializer/mdastToSlate';
import type {
  DeserializeMdContext,
  MarkdownDiagnostic,
  MarkdownDocumentParseResult,
  MarkdownFrontmatter,
  MarkdownParsePolicy,
  MarkdownPlaceholderParseOptions,
  MarkdownPlaceholderParseResult,
  MarkdownPlaceholderSegment,
  MarkdownSliceParseResult,
} from '../types';
import {
  checkMarkdownTreeLimits,
  createMarkdownSourceLocation,
  DEFAULT_MARKDOWN_PARSE_LIMITS,
  MarkdownDiagnostics,
  ReportedMarkdownFailureError,
} from './markdownDiagnostics';
import { groupMarkdownInlineRuns } from './markdownDocument';
import {
  blankMarkdownFrontmatter,
  BYTE_ORDER_MARK,
  MARKDOWN_FRONTMATTER_KEY,
  readMarkdownFrontmatter,
} from './markdownFrontmatter';
import {
  findMarkdownFlowHtmlBlocks,
  getMarkdownParagraphLanding,
} from './markdownIntrinsics';
import type { CompiledMarkdownMappings } from './markdownMappings';
import {
  keepsReceived,
  type MarkdownGrammar,
  type MarkdownMarkKinds,
  type OpenTailCopy,
  type OpenTailPlan,
  type OpenTailRead,
} from './markdownOpenTail';
import {
  getMarkdownParser,
  getMergedOptionsDeserialize,
  type MarkdownRuntime,
  samePlugins,
} from './markdownRuntime';
import { cleanMarkdownDestinations } from './markdownSafety';
import {
  countMarkdownLines,
  DEFINITION_SYNTAX,
  findMarkdownSegmentBoundaries,
  holdsMarkdownSegmentOpen,
  MARKDOWN_DEFINITION,
  readsMarkdownWhole,
  shiftMarkdownDiagnostic,
} from './markdownSegments';
import {
  getMarkdownTagRepair,
  isMarkdownTagSyntax,
  MARKDOWN_TAG_NAME,
  trimIncompleteMarkdownTag,
} from './markdownTags';

type MarkdownSegmentHooks = Pick<
  DeserializeMdContext,
  'onRootBlocks' | 'onRootChildren' | 'onSyntaxNodes' | 'previousRootSibling'
> &
  Readonly<{
    /** The source is one paragraph, so no HTML block decodes on its own. */
    inline?: boolean;
    onSyntaxTree?: (root: Root) => void;
    openTail?: OpenTailRead;
  }>;

type MicromarkConstruct = Readonly<{ name?: string }> | null | undefined;

type MicromarkConstructs = Readonly<
  Record<string, MicromarkConstruct | readonly MicromarkConstruct[]>
>;

const SCANNED_BLOCK_SYNTAX = new Set([
  ...DEFINITION_SYNTAX,
  'mathFlow',
  'table',
]);

const SCANNED_INLINE_SYNTAX = new Set([
  ...DEFINITION_SYNTAX,
  'attention',
  'emailAutolink',
  'mathText',
  'protocolAutolink',
  'strikethrough',
  'tasklistCheck',
  'wwwAutolink',
]);

const SCANNED_SYNTAX = [
  [['document', 'contentInitial', 'flowInitial', 'flow'], SCANNED_BLOCK_SYNTAX],
  [['string', 'text', 'insideSpan'], SCANNED_INLINE_SYNTAX],
] as const;

const knownPluginSyntax = new WeakMap<
  CompiledMarkdownMappings,
  Readonly<{ remarkPlugins: readonly unknown[]; scanned: boolean }>
>();

/**
 * remark-frontmatter's fences, a directive or another plugin's block can close
 * on a later line or open at a segment's start, and another plugin's inline
 * syntax can read the line it starts on or the labels defined before it, so a
 * continued parse with one reads the whole source.
 */
export const knowsPluginSyntax = (runtime: MarkdownRuntime) => {
  const { remarkPlugins } = runtime.options;
  const cached = knownPluginSyntax.get(runtime.formats);

  if (cached && samePlugins(cached, remarkPlugins)) return cached.scanned;
  const extensions = getMarkdownParser(runtime).data('micromarkExtensions') as
    | unknown[]
    | undefined;
  const scanned = [extensions ?? []].flat(Infinity).every(
    (extension) =>
      isMarkdownTagSyntax(extension) ||
      SCANNED_SYNTAX.every(([fields, names]) =>
        fields.every((field) =>
          Object.values(
            (extension as Partial<Record<string, MicromarkConstructs>>)?.[
              field
            ] ?? {}
          )
            .flat()
            .every(
              (construct) =>
                !construct || (!!construct.name && names.has(construct.name))
            )
        )
      )
  );

  knownPluginSyntax.set(runtime.formats, { remarkPlugins, scanned });

  return scanned;
};

export const markdownToSlateNodesWithRuntime = (
  runtime: MarkdownRuntime,
  text: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics(),
  { inline, openTail, ...hooks }: MarkdownSegmentHooks = {},
  source = text
): Descendant[] => {
  const mergedOptions: ToSlateOptions = {
    ...getMergedOptionsDeserialize(runtime, options, {
      diagnostics,
      positionsReferToSource: true,
      source,
    }),
    ...hooks,
  };
  const parser = getMarkdownParser(runtime);
  const activeOpenTail = options.partial ? openTail : undefined;
  const file = activeOpenTail
    ? { data: { openTail: activeOpenTail }, value: text }
    : text;
  const tree = parser.runSync(parser.parse(text), file);

  return compileMarkdownTree(tree, text, mergedOptions, inline);
};

// This reads the parsed tree, not the source, because node positions count the
// raw source.
const readLineEndingsAsLf = (node: Nodes) => {
  if ('value' in node) node.value = node.value.replaceAll(/\r\n?/g, '\n');
  if ('alt' in node && node.alt) {
    node.alt = node.alt.replaceAll(/\r\n?/g, '\n');
  }
  if ('title' in node && node.title) {
    node.title = node.title.replaceAll(/\r\n?/g, '\n');
  }
  if ('children' in node) node.children.forEach(readLineEndingsAsLf);
  // mdast-util-gfm-task-list-item drops the first character of the item's
  // text, expecting the space after `[ ]`. When nothing but spaces follows
  // `[ ]` on its line, that character is a CRLF's CR, so its LF stays.
  if (node.type === 'listItem' && typeof node.checked === 'boolean') {
    const paragraph = node.children.find(
      (child): child is Paragraph => child.type === 'paragraph'
    );
    const head = paragraph?.children[0];

    if (head?.type === 'text' && head.value.startsWith('\n')) {
      head.value = head.value.slice(1);
      if (!head.value) paragraph?.children.shift();
    }
  }
};

type ToSlateOptions = DeserializeMdContext &
  Pick<MarkdownSegmentHooks, 'onSyntaxTree'>;

const compileMarkdownTree = (
  node: Root,
  text: string,
  options: ToSlateOptions,
  inline?: boolean
): Descendant[] => {
  if (text.includes('\r')) readLineEndingsAsLf(node);

  const syntaxNodes = checkMarkdownTreeLimits(
    node,
    options.limits,
    options.report
  );

  if (syntaxNodes === null) throw new ReportedMarkdownFailureError();
  options.onSyntaxNodes?.(syntaxNodes);
  options.onSyntaxTree?.(node);
  cleanMarkdownDestinations(node, {
    lossPolicy: options.lossPolicy,
    phase: 'parse',
    report: options.report,
    sourceLocation: options.sourceLocation,
  });

  return mdastToSlate(
    node,
    inline
      ? options
      : {
          ...options,
          flowHtmlBlocks: findMarkdownFlowHtmlBlocks(node),
        }
  );
};

export const markdownParseLimits = (options: MarkdownParsePolicy) =>
  Object.freeze({
    ...DEFAULT_MARKDOWN_PARSE_LIMITS,
    ...options.limits,
  });

export const reportByteLimit = (
  source: string,
  options: MarkdownParsePolicy,
  diagnostics: MarkdownDiagnostics
) => {
  const limits = markdownParseLimits(options);
  const bytes = new TextEncoder().encode(source).byteLength;

  if (bytes <= limits.maxBytes) return false;
  diagnostics.report({
    actual: bytes,
    code: 'markdown-limit-exceeded',
    limit: 'maxBytes',
    maximum: limits.maxBytes,
    message: `Markdown source exceeds ${limits.maxBytes} UTF-8 bytes.`,
    severity: 'error',
  });

  return true;
};

// A partial source is an unfinished stream prefix: hide a trailing tag that
// has not finished arriving.
const previewSource = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy
) =>
  options.partial
    ? trimIncompleteMarkdownTag(source, runtime.formats.tags)
    : source;

const runParsedNodes = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy,
  diagnostics: MarkdownDiagnostics,
  hooks?: MarkdownSegmentHooks,
  text = source
): Descendant[] | null => {
  if (reportByteLimit(source, options, diagnostics)) return null;
  if (
    landsMarkdownParagraph(runtime.registry) &&
    runtime.state.schema.element(UNLANDED_MARKDOWN_PARAGRAPH_TYPE)
  ) {
    reportUnlandedParagraph(
      diagnostics,
      `The schema declares "${UNLANDED_MARKDOWN_PARAGRAPH_TYPE}", which Markdown reserves for its own paragraph.`
    );

    return null;
  }

  try {
    return markdownToSlateNodesWithRuntime(
      runtime,
      previewSource(runtime, text, options),
      options,
      diagnostics,
      hooks,
      source
    );
  } catch (error) {
    if (error instanceof ReportedMarkdownFailureError) return null;
    throw error;
  }
};

/**
 * The installed editor and plugin state a parse ran under, and the earlier
 * result it may continue. Reuse requires all of them to match.
 */
export type MarkdownReuse = Readonly<{
  editor: object;
  pluginStates: readonly unknown[];
  previous: object | undefined;
}>;

type MarkdownSegment = Readonly<{
  diagnostics: readonly MarkdownDiagnostic[];
  end: number;
  lastRoot: MdRootContent | null;
  nodes: readonly Descendant[];
  syntaxNodes: number;
}>;

type MarkdownCheckpoint = Readonly<{
  editor: object;
  formats: CompiledMarkdownMappings;
  limits: string;
  lossPolicy: 'allow' | 'reject';
  pluginStates: readonly unknown[];
  segments: readonly MarkdownSegment[];
  source: string;
}>;

// Keyed by the returned result, so a fabricated or copied result never matches.
const markdownCheckpoints = new WeakMap<object, MarkdownCheckpoint>();

type MarkdownConversion = Readonly<{
  checkpoint: Pick<
    MarkdownCheckpoint,
    'limits' | 'lossPolicy' | 'segments' | 'source'
  > | null;
  /** Deeply frozen top-level blocks. */
  nodes: readonly Descendant[] | null;
  /** Blocks a slice still has to validate; reused segments already passed. */
  unvalidated: readonly Descendant[];
}>;

export const snapshotBlocks = (
  runtime: MarkdownRuntime,
  parsed: readonly Descendant[]
): readonly Descendant[] =>
  ContentSlice.closed([...normalizeDocumentChildren(runtime, parsed)]).content;

const MAX_COPIED_SEGMENT_LENGTH = 2000;

const fitsSlice = (runtime: MarkdownRuntime, blocks: readonly Descendant[]) => {
  if (
    landsMarkdownParagraph(runtime.registry) &&
    findMarkdownParagraph(blocks, [])
  ) {
    return false;
  }
  try {
    runtime.state.schema.assertFragment(blocks);

    return true;
  } catch (error) {
    if (error instanceof EditorSchemaValidationError) return false;
    throw error;
  }
};

type BlockFit = Readonly<{
  fits: (blocks: readonly Descendant[]) => boolean;
  ready: (parsed: readonly Descendant[]) => readonly Descendant[];
}>;

const sliceFit = (runtime: MarkdownRuntime): BlockFit => ({
  fits: (blocks) => fitsSlice(runtime, blocks),
  ready: (parsed) => snapshotBlocks(runtime, parsed),
});

const deferredFit = (runtime: MarkdownRuntime): BlockFit => ({
  fits: () => true,
  ready: (parsed) => normalizeDocumentChildren(runtime, parsed),
});

const headJoinsOpenPart = (
  runtime: MarkdownRuntime,
  parsed: readonly Descendant[],
  headEnd: number
) =>
  [parsed[headEnd - 1], parsed[headEnd]].every(
    (node) =>
      !!node && (TextApi.isText(node) || runtime.state.schema.isInline(node))
  );

const markKindsOf = (runtime: MarkdownRuntime): MarkdownMarkKinds => {
  const keys = (kind: string) =>
    new Set(
      [...runtime.formats.markWriters]
        .filter(([, writers]) => writers.some((writer) => writer.kind === kind))
        .map(([key]) => key)
    );

  return {
    emphasis: keys('emphasis'),
    exact: new Set(),
    strong: keys('strong'),
  };
};

// The probe's first and third paragraphs parse only under
// remark-cjk-friendly's rules, its second and fourth under any rule that
// parses the syntax at all.
const GRAMMAR_PROBE = 'a**「b」**\n\n**b**\n\na~~「b」~~\n\n~~b~~';
const grammars = new WeakMap<object, MarkdownGrammar>();

const probeGrammar = (runtime: MarkdownRuntime): MarkdownGrammar => {
  const { remarkPlugins } = runtime.options;
  const known = grammars.get(remarkPlugins);

  if (known) return known;
  const grammar = readGrammar(runtime);

  grammars.set(remarkPlugins, grammar);

  return grammar;
};

const readGrammar = (runtime: MarkdownRuntime): MarkdownGrammar => {
  let probe: readonly MdRootContent[];

  try {
    probe = [...getMarkdownParser(runtime).parse(GRAMMAR_PROBE).children];
  } catch {
    return { attention: null, strikethrough: null };
  }
  const [cjkStrong, strong, cjkDelete, deleted] = probe;
  const holds = (node: MdRootContent | undefined, type: string) =>
    node?.type === 'paragraph' &&
    node.children.some((child) => child.type === type);

  return {
    attention: holds(strong, 'strong')
      ? holds(cjkStrong, 'strong')
        ? 'cjkFriendly'
        : 'commonmark'
      : null,
    strikethrough: holds(deleted, 'delete')
      ? holds(cjkDelete, 'delete')
        ? 'cjkFriendly'
        : 'gfm'
      : null,
  };
};

const offsetOf = (diagnostic: MarkdownDiagnostic) =>
  ('source' in diagnostic ? diagnostic.source?.start?.offset : undefined) ??
  Number.NaN;

const diagnosticKeys = (
  diagnostics: readonly MarkdownDiagnostic[],
  sharedOffset: (offset: number) => number | null
) =>
  diagnostics
    .map((diagnostic) => {
      const { source: _source, ...rest } = diagnostic as MarkdownDiagnostic &
        Readonly<{ source?: unknown }>;

      return JSON.stringify([sharedOffset(offsetOf(diagnostic)), rest]);
    })
    .sort()
    .join('\n');

const hasUnplaced = (diagnostics: readonly MarkdownDiagnostic[]) =>
  diagnostics.some((diagnostic) => Number.isNaN(offsetOf(diagnostic)));

const isZeroWidthAt = (diagnostic: MarkdownDiagnostic, offset: number) =>
  'source' in diagnostic &&
  diagnostic.source?.start?.offset === offset &&
  diagnostic.source.end?.offset === offset;

type RootBefore = Readonly<{ index: number; root: Root; spentNodes: number }>;

const inSourceOrder = (children: readonly MdRootContent[]) => {
  let end = 0;

  return children.every((child) => {
    const start = child.position?.start.offset;

    if (start === undefined || start < end) return false;
    end = child.position?.end.offset ?? Number.POSITIVE_INFINITY;

    return true;
  });
};

const rootBefore = (root: Root, from: number): RootBefore | null => {
  if (!inSourceOrder(root.children)) return null;
  const found = root.children.findIndex(
    (child) => (child.position?.start.offset ?? 0) >= from
  );
  const index = found === -1 ? root.children.length : found;
  const previous = root.children[index - 1];

  if ((previous?.position?.end.offset ?? from) > from) return null;
  const head: Root = { children: root.children.slice(0, index), type: 'root' };
  const nodes = checkMarkdownTreeLimits(
    head,
    { maxBytes: Infinity, maxDepth: Infinity, maxNodes: Infinity },
    () => {}
  );

  return { index, root, spentNodes: (nodes ?? 1) - 1 };
};

const closeOpenTail = (
  runtime: MarkdownRuntime,
  options: MarkdownParsePolicy,
  received: Readonly<{
    blocks: readonly Descendant[];
    diagnostics: readonly MarkdownDiagnostic[];
  }>,
  plan: OpenTailPlan & Readonly<{ copy: OpenTailCopy }>,
  before: RootBefore,
  from: number,
  hooks: Pick<MarkdownSegmentHooks, 'inline' | 'previousRootSibling'>,
  fit: BlockFit,
  kept: number
) => {
  const limits = markdownParseLimits(options);
  const diagnostics = new MarkdownDiagnostics();
  let children = Number.NaN;
  let copy: readonly Descendant[];

  try {
    const parsed = markdownToSlateNodesWithRuntime(
      runtime,
      plan.copy.text,
      {
        ...options,
        limits: { ...limits, maxNodes: limits.maxNodes - before.spentNodes },
      },
      diagnostics,
      {
        inline: hooks.inline,
        onSyntaxTree: (root) => {
          children = root.children.length;
        },
        openTail: {
          copy: plan.copy,
          heldFromEnd: plan.heldFromEnd,
          mode: 'pairCopy',
        },
        previousRootSibling:
          before.root.children[before.index - 1] ??
          hooks.previousRootSibling ??
          null,
      }
    );

    if (
      diagnostics.failure() ||
      children !== before.root.children.length - before.index
    ) {
      return null;
    }
    copy = fit.ready(parsed);
  } catch {
    return null;
  }
  const closersAt = plan.copy.closers.from;

  return kept <= received.blocks.length &&
    keepsReceived(
      received.blocks.slice(kept),
      copy,
      plan.copy,
      markKindsOf(runtime)
    ) &&
    !hasUnplaced(diagnostics.all()) &&
    diagnosticKeys(diagnostics.all(), (offset) =>
      offset < closersAt ? offset + from : null
    ) ===
      diagnosticKeys(
        received.diagnostics.filter(
          (diagnostic) => offsetOf(diagnostic) >= from
        ),
        (offset) => (offset < from + closersAt ? offset : null)
      ) &&
    fit.fits(copy)
    ? Object.freeze([...received.blocks.slice(0, kept), ...copy])
    : null;
};

type OpenSegment = Readonly<{
  committed?: readonly MarkdownSegment[];
  fit: BlockFit;
  keptDiagnostics: readonly MarkdownDiagnostic[];
  retriesUncut: boolean;
  start: number | null;
}>;

const fitsByteLimit = (source: string, options: MarkdownParsePolicy) =>
  new TextEncoder().encode(source).byteLength <=
  markdownParseLimits(options).maxBytes;

const parsesInSegments = (source: string, options: MarkdownParsePolicy) =>
  fitsByteLimit(source, options) && !MARKDOWN_DEFINITION.test(source);

const openSegmentStart = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy,
  start = 0
) =>
  parsesInSegments(source, options)
    ? (findMarkdownSegmentBoundaries(
        previewSource(runtime, source, options),
        0,
        runtime.formats.tags
      ).at(-1) ?? start)
    : null;

const deliverOpenTail = (
  runtime: MarkdownRuntime,
  source: string,
  start: number,
  options: MarkdownParsePolicy,
  diagnostics: MarkdownDiagnostics,
  hooks: MarkdownSegmentHooks,
  segment: OpenSegment
): readonly Descendant[] | null => {
  const text = source.slice(start);
  const { committed, fit } = segment;
  const grammar = probeGrammar(runtime);
  const repairable = grammar.attention ?? grammar.strikethrough;
  const ready = (parsed: readonly Descendant[]) =>
    committed ? snapshotBlocks(runtime, parsed) : fit.ready(parsed);

  // micromark's offsets skip a byte order mark that starts the source, so
  // the tail cannot read a fresh preview's tree.
  if (source.startsWith(BYTE_ORDER_MARK) || !repairable) {
    const parsed = runParsedNodes(runtime, text, options, diagnostics, hooks);

    return parsed && ready(parsed);
  }
  const from =
    segment.start === null ||
    source.length - segment.start > MAX_COPIED_SEGMENT_LENGTH
      ? null
      : segment.start - start;
  const received = new MarkdownDiagnostics();
  const read: {
    before?: RootBefore | null;
    blocks?: readonly number[];
    plan?: OpenTailPlan;
  } = {};
  const onPlan = (plan: OpenTailPlan) => {
    read.plan = plan;
  };
  const parsed = runParsedNodes(runtime, text, options, received, {
    ...hooks,
    onRootBlocks: (counts) => {
      read.blocks = counts;
    },
    onSyntaxTree: (root) => {
      if (from !== null) read.before = rootBefore(root, from);
    },
    openTail:
      from === null
        ? { grammar, mode: 'planHold', onPlan }
        : { from, grammar, mode: 'planCopy', onPlan },
  });
  const blocks = parsed && !received.failure() ? ready(parsed) : null;
  const { before, plan } = read;

  if (plan?.heldFromEnd.length && !(blocks && fit.fits(blocks))) {
    if (!segment.retriesUncut) return null;
    const uncut = runParsedNodes(runtime, text, options, diagnostics, hooks);

    return uncut && ready(uncut);
  }
  const receivedAll = received.all();

  receivedAll.forEach(diagnostics.report);
  const headEnd = (read.blocks ?? [])
    .slice(0, before?.index)
    .reduce((sum, n) => sum + n, 0);

  if (
    !parsed ||
    !blocks ||
    headJoinsOpenPart(runtime, parsed, headEnd) ||
    !plan?.copy ||
    !before ||
    from === null ||
    hasUnplaced([...segment.keptDiagnostics, ...receivedAll]) ||
    segment.keptDiagnostics.some((diagnostic) =>
      isZeroWidthAt(diagnostic, from + start)
    ) ||
    receivedAll.some((diagnostic) => isZeroWidthAt(diagnostic, from))
  ) {
    return blocks;
  }

  return (
    closeOpenTail(
      runtime,
      options,
      { blocks, diagnostics: receivedAll },
      { ...plan, copy: plan.copy },
      before,
      from,
      hooks,
      fit,
      normalizeDocumentChildren(runtime, parsed.slice(0, headEnd)).length
    ) ?? blocks
  );
};

const convertMarkdownSource = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy,
  diagnostics: MarkdownDiagnostics,
  reuse?: MarkdownReuse
): MarkdownConversion => {
  const limits = markdownParseLimits(options);
  const limitsKey = JSON.stringify(limits);
  const lossPolicy = options.lossPolicy ?? 'reject';
  const full = (): MarkdownConversion => {
    let nodes: readonly Descendant[] | null;

    if (options.partial) {
      nodes = deliverOpenTail(
        runtime,
        source,
        0,
        options,
        diagnostics,
        {},
        {
          fit: sliceFit(runtime),
          keptDiagnostics: [],
          retriesUncut: true,
          start: openSegmentStart(runtime, source, options),
        }
      );
    } else {
      const parsed = runParsedNodes(runtime, source, options, diagnostics);

      nodes = parsed && snapshotBlocks(runtime, parsed);
    }

    return {
      checkpoint: reuse
        ? { limits: limitsKey, lossPolicy, segments: [], source }
        : null,
      nodes,
      unvalidated: nodes ?? [],
    };
  };

  if (
    !reuse?.previous ||
    readsMarkdownWhole(source) ||
    !knowsPluginSyntax(runtime) ||
    !fitsByteLimit(source, options)
  ) {
    return full();
  }
  const old = markdownCheckpoints.get(reuse.previous);
  const valid =
    !!old &&
    old.editor === reuse.editor &&
    old.formats === runtime.formats &&
    old.limits === limitsKey &&
    old.pluginStates.length === reuse.pluginStates.length &&
    old.pluginStates.every(
      (state, index) => state === reuse.pluginStates[index]
    ) &&
    source.startsWith(old.source);
  const previousSegments = valid ? old.segments : [];
  // A segment's diagnostics take their severity from the loss policy, so
  // under another policy only the segments that reported nothing still hold.
  const kept =
    old?.lossPolicy === lossPolicy
      ? previousSegments.length
      : previousSegments.findIndex((segment) => segment.diagnostics.length > 0);
  const segments = previousSegments.slice(
    0,
    kept === -1 ? previousSegments.length : kept
  );

  // A parse without `partial` converts the whole source, because a remark
  // plugin may read the whole tree.
  if (!options.partial) {
    const fresh = full();

    if (!fresh.nodes || segments.length === 0) return fresh;
    const keptNodes = segments.flatMap((segment) => segment.nodes);
    const tail = fresh.nodes.slice(keptNodes.length);
    const nodes = Object.freeze([...keptNodes, ...tail]);

    return sameUpToListIds(nodes, fresh.nodes)
      ? {
          checkpoint: { limits: limitsKey, lossPolicy, segments, source },
          nodes,
          unvalidated: tail,
        }
      : fresh;
  }
  const reused = segments.length;
  let stableEnd = segments.at(-1)?.end ?? 0;
  // Each segment parses its own root; the whole source has one.
  let syntaxNodes = segments.reduce(
    (count, segment) => count + segment.syntaxNodes - 1,
    1
  );
  const convertRange = (end: number) => {
    const local = new MarkdownDiagnostics();
    let count = 0;
    let lastRoot: MdRootContent | null = null;
    let ordered = false;
    const parsed = runParsedNodes(
      runtime,
      source.slice(stableEnd, end),
      {
        ...options,
        limits: { ...limits, maxNodes: limits.maxNodes - syntaxNodes + 1 },
        partial: false,
      },
      local,
      {
        onRootChildren: (children) => {
          lastRoot = children.at(-1) ?? null;
          ordered =
            inSourceOrder(children) &&
            children.every((child) => child.position?.end.offset !== undefined);
        },
        onSyntaxNodes: (nodes) => {
          count = nodes;
        },
        // A decoder reads the node before it, even across segments.
        previousRootSibling: segments.at(-1)?.lastRoot ?? null,
      }
    );

    if (!parsed || local.failure()) return null;
    const lines = countMarkdownLines(source, stableEnd);

    return {
      diagnostics: local
        .all()
        .map((diagnostic) =>
          shiftMarkdownDiagnostic(diagnostic, lines, stableEnd)
        ),
      lastRoot,
      parsed,
      placed: ordered && !hasUnplaced(local.all()),
      syntaxNodes: count,
    };
  };

  const boundaries = findMarkdownSegmentBoundaries(
    previewSource(runtime, source, options),
    stableEnd,
    runtime.formats.tags
  );
  let nextTry = 0;
  const prior = segments.flatMap((segment) => segment.nodes);

  for (const [index, boundary] of boundaries.entries()) {
    if (index < nextTry) continue;
    const segment = convertRange(boundary);

    if (!segment) return full();
    const { lastRoot } = segment;

    // A block or tag the segment's own parse leaves open holds what follows,
    // whatever the scan read, and so does a root block or diagnostic it leaves
    // without a source place, because a fresh parse reads the places of the
    // whole document. Only the last boundary tries again, because trying each
    // one inside a long open block would parse its body once per boundary.
    if (
      !segment.placed ||
      getMarkdownTagRepair(lastRoot ?? {})?.repair === 'unclosed' ||
      holdsMarkdownSegmentOpen(source.slice(stableEnd, boundary), lastRoot)
    ) {
      nextTry = boundaries.length - 1;
      continue;
    }
    const last = segment.parsed.at(-1);

    // Normalization joins top-level inline runs across a blank line, so a
    // segment ending in one is not complete yet.
    if (!last || TextApi.isText(last) || runtime.state.schema.isInline(last)) {
      continue;
    }
    const nodes = snapshotBlocks(runtime, segment.parsed);

    segments.push({
      diagnostics: segment.diagnostics,
      end: boundary,
      lastRoot: segment.lastRoot,
      nodes,
      syntaxNodes: segment.syntaxNodes,
    });
    for (const node of nodes) prior.push(node);
    syntaxNodes += segment.syntaxNodes - 1;
    stableEnd = boundary;
  }
  const local = new MarkdownDiagnostics();
  const tailNodes = deliverOpenTail(
    runtime,
    source,
    stableEnd,
    {
      ...options,
      limits: { ...limits, maxNodes: limits.maxNodes - syntaxNodes + 1 },
    },
    local,
    { previousRootSibling: segments.at(-1)?.lastRoot ?? null },
    {
      committed: segments,
      fit: sliceFit(runtime),
      keptDiagnostics: segments.flatMap((segment) => segment.diagnostics),
      retriesUncut: false,
      start: boundaries.at(-1) ?? stableEnd,
    }
  );

  if (!tailNodes || local.failure()) return full();
  for (const segment of segments) {
    segment.diagnostics.forEach(diagnostics.report);
  }
  const lines = countMarkdownLines(source, stableEnd);

  for (const diagnostic of local.all()) {
    diagnostics.report(shiftMarkdownDiagnostic(diagnostic, lines, stableEnd));
  }

  return {
    checkpoint: { limits: limitsKey, lossPolicy, segments, source },
    nodes: Object.freeze([...prior, ...tailNodes]),
    unvalidated: [
      ...segments.slice(reused).flatMap((segment) => segment.nodes),
      ...tailNodes,
    ],
  };
};

const rememberMarkdownConversion = <T extends object>(
  result: T,
  conversion: MarkdownConversion,
  runtime: MarkdownRuntime,
  reuse: MarkdownReuse | undefined
): T => {
  if (reuse && conversion.checkpoint) {
    markdownCheckpoints.set(result, {
      ...conversion.checkpoint,
      editor: reuse.editor,
      formats: runtime.formats,
      pluginStates: reuse.pluginStates,
    });
  }

  return result;
};

export const normalizeDocumentChildren = (
  runtime: MarkdownRuntime,
  children: readonly Descendant[]
): Element[] =>
  groupMarkdownInlineRuns(children, {
    isBlock: (node) => !runtime.state.schema.isInline(node),
    paragraphType: getMarkdownParagraphType(runtime.registry),
  });

export const reportUnlandedParagraph = (
  diagnostics: MarkdownDiagnostics,
  message: string,
  path?: readonly number[]
) =>
  diagnostics.report({
    action: 'dropped',
    code: 'markdown-unsupported-node',
    impact: 'lossy',
    message,
    ...(path ? { model: Object.freeze({ path }) } : {}),
    nodeType: 'paragraph',
    owner: 'markdown',
    phase: 'parse',
    severity: 'error',
  });

export const findMarkdownParagraph = (
  nodes: readonly Descendant[],
  path: readonly number[]
): readonly number[] | undefined => {
  for (const [index, node] of nodes.entries()) {
    if (!ElementApi.isElement(node)) continue;
    if (node.type === UNLANDED_MARKDOWN_PARAGRAPH_TYPE) return [...path, index];

    const found = findMarkdownParagraph(node.children, [...path, index]);

    if (found) return found;
  }

  return undefined;
};

const landMarkdownParagraphs = (
  runtime: MarkdownRuntime,
  children: readonly Element[],
  diagnostics: MarkdownDiagnostics
): Element[] => {
  const { schema } = runtime.state;

  return children.map((node, index) => {
    if (node.type !== UNLANDED_MARKDOWN_PARAGRAPH_TYPE) {
      const nested = findMarkdownParagraph(node.children, [index]);

      if (nested) {
        reportUnlandedParagraph(
          diagnostics,
          `No paragraph plugin is installed, so a Markdown paragraph inside "${node.type}" has no block to land in.`,
          nested
        );
      }

      return node;
    }

    const fallback = getMarkdownParagraphLanding(schema, index);

    if (
      !fallback ||
      node.children.some(
        (child) =>
          ElementApi.isElement(child) &&
          !schema.allowsElementType(fallback.type, child.type)
      )
    ) {
      reportUnlandedParagraph(
        diagnostics,
        `No paragraph plugin is installed, and the root's default block at position ${index} cannot hold a Markdown paragraph's text.`,
        [index]
      );

      return node;
    }

    const { children: inline, type: _type, ...properties } = node;
    const kept: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(properties)) {
      if (schema.property({ key, placement: 'element', type: fallback.type })) {
        kept[key] = value;
        continue;
      }
      diagnostics.report({
        code: 'markdown-property-omitted',
        key,
        message: `Markdown paragraph property "${key}" is not declared on "${fallback.type}" and was omitted.`,
        model: Object.freeze({ path: [index], property: key }),
        owner: 'markdown',
        phase: 'parse',
        reason: 'unsupported',
        severity: 'warning',
      });
    }

    return { ...fallback, ...kept, children: inline };
  });
};

export const reportSchemaInvalid = (
  error: unknown,
  diagnostics: MarkdownDiagnostics
) => {
  if (!(error instanceof EditorSchemaValidationError)) throw error;
  const schema = error.diagnostics[0];

  if (!schema) throw error;
  diagnostics.report({
    code: 'markdown-schema-invalid',
    message: schema.message,
    model: Object.freeze({
      path: schema.path,
      ...(schema.property ? { property: schema.property.key } : {}),
      ...(schema.root === null ? {} : { root: schema.root }),
    }),
    schema,
    severity: 'error',
  });
};

type MarkdownSchemaRepair = Extract<
  MarkdownDiagnostic,
  { code: 'markdown-schema-repair' }
>;

const fitMarkdownDocument = (
  runtime: MarkdownRuntime,
  document: EditorDocumentValue,
  options: MarkdownParsePolicy,
  diagnostics: MarkdownDiagnostics
) => {
  const schema = runtime.state.schema as EditorCoreStateView['schema'] &
    Readonly<{
      fitDocumentWithReport: (input: EditorDocumentValue) => Readonly<{
        document: EditorDocumentValue;
        repairs: ReadonlyArray<
          Readonly<{
            code: MarkdownSchemaRepair['repair'];
            impact: MarkdownSchemaRepair['impact'];
            inputs: MarkdownSchemaRepair['inputs'];
            outputs: MarkdownSchemaRepair['outputs'];
            owner: MarkdownSchemaRepair['owner'];
          }>
        >;
      }>;
    }>;
  const report = schema.fitDocumentWithReport(document);

  report.repairs.forEach((repair) => {
    diagnostics.report({
      code: 'markdown-schema-repair',
      impact: repair.impact,
      inputs: repair.inputs,
      message: `Markdown schema fitting applied "${repair.code}".`,
      outputs: repair.outputs,
      owner: repair.owner,
      repair: repair.code,
      severity:
        repair.impact === 'lossy' && options.lossPolicy !== 'allow'
          ? 'error'
          : 'warning',
    });
  });

  return report.document;
};

const documentParseFailure = (
  diagnostics: MarkdownDiagnostics
): MarkdownDocumentParseResult => {
  const failure = diagnostics.failure();

  if (!failure) throw new Error('Markdown parse failed without a diagnostic.');

  return Object.freeze({ diagnostics: failure, ok: false });
};

const sliceParseFailure = (
  diagnostics: MarkdownDiagnostics
): MarkdownSliceParseResult => {
  const failure = diagnostics.failure();

  if (!failure) throw new Error('Markdown parse failed without a diagnostic.');

  return Object.freeze({ diagnostics: failure, ok: false });
};

const deliverMarkdownDocument = (
  runtime: MarkdownRuntime,
  options: MarkdownParsePolicy,
  frontmatter: MarkdownFrontmatter | null,
  parsed: readonly Descendant[],
  diagnostics: MarkdownDiagnostics
): EditorDocumentValue | null => {
  // Normalized top-level blocks are elements. Fitting copies them, so a
  // document parse needs no frozen snapshot.
  const children = normalizeDocumentChildren(runtime, parsed);
  const input = Object.freeze({
    children: landsMarkdownParagraph(runtime.registry)
      ? landMarkdownParagraphs(runtime, children, diagnostics)
      : children,
    ...(frontmatter
      ? {
          meta: {
            [MARKDOWN_FRONTMATTER_KEY]: {
              format: frontmatter.format,
              value: frontmatter.value,
            },
          },
        }
      : {}),
  });

  if (diagnostics.failure()) return null;
  let document: EditorDocumentValue;

  try {
    document = fitMarkdownDocument(runtime, input, options, diagnostics);
    if (diagnostics.failure()) return null;
  } catch (error) {
    reportSchemaInvalid(error, diagnostics);

    return null;
  }
  try {
    runtime.state.schema.assertDocument(document);
  } catch (error) {
    reportSchemaInvalid(error, diagnostics);

    return null;
  }

  return document;
};

export const parseMarkdownDocumentWithRuntime = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy = {}
): MarkdownDocumentParseResult => {
  const diagnostics = new MarkdownDiagnostics();
  const frontmatter = readMarkdownFrontmatter(source);
  const text = frontmatter
    ? blankMarkdownFrontmatter(source, frontmatter.end)
    : source;
  let document: EditorDocumentValue | null = null;

  if (options.partial) {
    if (reportByteLimit(source, options, diagnostics)) {
      return documentParseFailure(diagnostics);
    }
    const preview = new MarkdownDiagnostics();
    const blocks = deliverOpenTail(
      runtime,
      text,
      0,
      options,
      preview,
      {},
      {
        fit: deferredFit(runtime),
        keptDiagnostics: [],
        retriesUncut: true,
        start: openSegmentStart(runtime, text, options, frontmatter?.end),
      }
    );

    if (!blocks || preview.failure()) return documentParseFailure(preview);
    document = deliverMarkdownDocument(
      runtime,
      options,
      frontmatter,
      blocks,
      preview
    );
    if (document) preview.all().forEach(diagnostics.report);
  }
  if (!document) {
    const parsed = runParsedNodes(
      runtime,
      source,
      options,
      diagnostics,
      {},
      text
    );

    document =
      parsed && !diagnostics.failure()
        ? deliverMarkdownDocument(
            runtime,
            options,
            frontmatter,
            parsed,
            diagnostics
          )
        : null;
  }
  if (!document || diagnostics.failure()) {
    return documentParseFailure(diagnostics);
  }

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    document,
    ok: true,
  });
};

export const parseMarkdownSliceWithRuntime = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy = {},
  reuse?: MarkdownReuse
): MarkdownSliceParseResult => {
  const diagnostics = new MarkdownDiagnostics();
  const conversion = convertMarkdownSource(
    runtime,
    source,
    options,
    diagnostics,
    reuse
  );

  if (!conversion.nodes || diagnostics.failure()) {
    return sliceParseFailure(diagnostics);
  }

  const unlanded =
    landsMarkdownParagraph(runtime.registry) &&
    findMarkdownParagraph(conversion.nodes, []);

  if (unlanded) {
    reportUnlandedParagraph(
      diagnostics,
      'No paragraph plugin is installed, and only a document parse lands a Markdown paragraph.',
      unlanded
    );

    return sliceParseFailure(diagnostics);
  }
  try {
    runtime.state.schema.assertFragment(conversion.unvalidated);
  } catch {
    // Report the error as validating the whole slice does.
    try {
      runtime.state.schema.assertFragment(conversion.nodes);
    } catch (error) {
      reportSchemaInvalid(error, diagnostics);

      return sliceParseFailure(diagnostics);
    }
  }
  // Every node is validated for this schema, so insertion can trust it.
  const slice = createValidatedContentSlice(
    conversion.nodes,
    runtime.state.schema
  );

  return rememberMarkdownConversion(
    Object.freeze({
      diagnostics: diagnostics.warnings(),
      ok: true,
      slice,
    }) as MarkdownSliceParseResult,
    conversion,
    runtime,
    reuse
  );
};

const isPlaceholderFlowNode = (
  node: MdRootContent,
  tag: string
): node is MdxJsxFlowElement =>
  node.type === 'mdxJsxFlowElement' && node.name === tag;

const isPlaceholderTextNode = (
  node: Nodes,
  tag: string
): node is MdxJsxTextElement =>
  node.type === 'mdxJsxTextElement' && node.name === tag;

const isEscapedOrTagMatch = (html: string, tag: string): boolean => {
  const escapedTag = tag.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return new RegExp(`<\\/?${escapedTag}(?=[\\s/>]|$)`, 'i').test(html);
};

const reportPlaceholderTagError = (
  diagnostics: MarkdownDiagnostics,
  tag: string,
  message: string,
  node?: Nodes,
  source?: string
) => {
  const location =
    node && source
      ? createMarkdownSourceLocation(node, source, true)
      : undefined;

  diagnostics.report({
    action: 'dropped',
    code: 'markdown-unsupported-node',
    impact: 'lossy',
    message,
    nodeType: tag,
    owner: 'markdown',
    phase: 'parse',
    severity: 'error',
    ...(location ? { source: location } : {}),
  });
};

const readPlaceholderRef = (
  node: MdxJsxFlowElement,
  tag: string,
  source: string,
  diagnostics: MarkdownDiagnostics
): string | null => {
  if (getMarkdownTagRepair(node)) {
    reportPlaceholderTagError(
      diagnostics,
      tag,
      `Placeholder tag <${tag}> must be self-closing and properly balanced.`,
      node,
      source
    );

    return null;
  }

  if (node.children.length > 0) {
    reportPlaceholderTagError(
      diagnostics,
      tag,
      `Placeholder tag <${tag}> cannot contain nested content.`,
      node,
      source
    );

    return null;
  }

  const startOffset = node.position?.start.offset;
  const endOffset = node.position?.end.offset;

  if (
    typeof startOffset === 'number' &&
    typeof endOffset === 'number' &&
    !source.slice(startOffset, endOffset).trimEnd().endsWith('/>')
  ) {
    reportPlaceholderTagError(
      diagnostics,
      tag,
      `Placeholder tag <${tag}> must be self-closing.`,
      node,
      source
    );

    return null;
  }

  if (node.attributes.length !== 1) {
    reportPlaceholderTagError(
      diagnostics,
      tag,
      `Placeholder tag <${tag}> must declare exactly one string "ref" attribute.`,
      node,
      source
    );

    return null;
  }

  const attribute = node.attributes[0];

  if (
    attribute?.type !== 'mdxJsxAttribute' ||
    attribute.name !== 'ref' ||
    typeof attribute.value !== 'string' ||
    attribute.value.length === 0
  ) {
    reportPlaceholderTagError(
      diagnostics,
      tag,
      `Placeholder tag <${tag}> must declare a non-empty string "ref" attribute.`,
      node,
      source
    );

    return null;
  }

  return attribute.value;
};

const assertNoNestedPlaceholderTag = (
  node: Nodes,
  tag: string,
  source: string,
  diagnostics: MarkdownDiagnostics
) => {
  if (isPlaceholderTextNode(node, tag)) {
    reportPlaceholderTagError(
      diagnostics,
      tag,
      `Placeholder tag <${tag}> cannot appear inline or inside a table cell.`,
      node,
      source
    );

    return;
  }

  if (node.type === 'mdxJsxFlowElement' && node.name === tag) {
    reportPlaceholderTagError(
      diagnostics,
      tag,
      `Placeholder tag <${tag}> cannot appear nested inside another block.`,
      node,
      source
    );

    return;
  }

  if (node.type === 'html' && isEscapedOrTagMatch(node.value, tag)) {
    reportPlaceholderTagError(
      diagnostics,
      tag,
      `Placeholder tag <${tag}> is misplaced or unmatched.`,
      node,
      source
    );

    return;
  }

  if ('children' in node) {
    for (const child of node.children) {
      assertNoNestedPlaceholderTag(child, tag, source, diagnostics);
    }
  }
};

type PlaceholderMdastChunk =
  | Readonly<{ kind: 'mdast'; nodes: MdRootContent[] }>
  | Readonly<{ kind: 'placeholder'; ref: string }>;

const splitListAroundPlaceholders = (
  list: List,
  tag: string,
  source: string,
  diagnostics: MarkdownDiagnostics,
  pushPlaceholder: (ref: string) => void,
  pushMdast: (node: MdRootContent) => void
) => {
  let pendingItems: ListItem[] = [];
  let itemOffset = 0;
  let runStartOffset = 0;

  const flushItems = () => {
    if (pendingItems.length === 0) return;

    const start =
      list.ordered && typeof list.start === 'number'
        ? list.start + runStartOffset
        : list.start;

    pushMdast({
      ...list,
      children: pendingItems,
      ...(list.ordered ? { start } : {}),
    });
    pendingItems = [];
  };

  for (const item of list.children) {
    const firstChild = item.children[0];
    const secondChild = item.children[1];
    const isBarePlaceholder =
      item.children.length === 1 &&
      firstChild !== undefined &&
      isPlaceholderFlowNode(firstChild, tag);
    const isPlaceholderWithNestedList =
      item.children.length === 2 &&
      firstChild !== undefined &&
      isPlaceholderFlowNode(firstChild, tag) &&
      secondChild?.type === 'list';

    if (isBarePlaceholder || isPlaceholderWithNestedList) {
      flushItems();
      const ref = readPlaceholderRef(firstChild, tag, source, diagnostics);

      if (ref !== null) {
        pushPlaceholder(ref);
      }
      if (isPlaceholderWithNestedList) {
        splitListAroundPlaceholders(
          secondChild,
          tag,
          source,
          diagnostics,
          pushPlaceholder,
          pushMdast
        );
      }
      itemOffset += 1;
      runStartOffset = itemOffset;
      continue;
    }

    assertNoNestedPlaceholderTag(item, tag, source, diagnostics);
    if (pendingItems.length === 0) runStartOffset = itemOffset;
    pendingItems.push(item);
    itemOffset += 1;
  }

  flushItems();
};

const placeholderParseFailure = (
  diagnostics: MarkdownDiagnostics
): MarkdownPlaceholderParseResult => {
  const failure = diagnostics.failure();

  if (!failure) {
    throw new Error('Markdown parse failed without a diagnostic.');
  }

  return Object.freeze({
    diagnostics: failure,
    ok: false,
  });
};

export const parseMarkdownPlaceholdersWithRuntime = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownPlaceholderParseOptions
): MarkdownPlaceholderParseResult => {
  const diagnostics = new MarkdownDiagnostics();
  const { tag } = options;

  if (!MARKDOWN_TAG_NAME.test(tag)) {
    reportPlaceholderTagError(
      diagnostics,
      tag,
      `Placeholder tag "${tag}" must match ${MARKDOWN_TAG_NAME}.`
    );

    return placeholderParseFailure(diagnostics);
  }

  if (runtime.formats.tags.has(tag)) {
    reportPlaceholderTagError(
      diagnostics,
      tag,
      `Placeholder tag "${tag}" collides with an already registered Markdown tag.`
    );

    return placeholderParseFailure(diagnostics);
  }

  const parseOptions: MarkdownParsePolicy = {
    ...(options.limits ? { limits: options.limits } : {}),
    ...(options.lossPolicy ? { lossPolicy: options.lossPolicy } : {}),
  };

  if (reportByteLimit(source, parseOptions, diagnostics)) {
    return placeholderParseFailure(diagnostics);
  }

  if (
    landsMarkdownParagraph(runtime.registry) &&
    runtime.state.schema.element(UNLANDED_MARKDOWN_PARAGRAPH_TYPE)
  ) {
    reportUnlandedParagraph(
      diagnostics,
      `The schema declares "${UNLANDED_MARKDOWN_PARAGRAPH_TYPE}", which Markdown reserves for its own paragraph.`
    );

    return placeholderParseFailure(diagnostics);
  }

  const mergedOptions = getMergedOptionsDeserialize(runtime, parseOptions, {
    diagnostics,
    positionsReferToSource: true,
    source,
  });
  const parser = getMarkdownParser(runtime, tag);

  let root: Root;

  try {
    root = parser.runSync(parser.parse(source), source);
  } catch (error) {
    if (error instanceof ReportedMarkdownFailureError) {
      return placeholderParseFailure(diagnostics);
    }
    throw error;
  }

  if (source.includes('\r')) readLineEndingsAsLf(root);

  const syntaxNodes = checkMarkdownTreeLimits(
    root,
    mergedOptions.limits,
    mergedOptions.report
  );

  if (syntaxNodes === null) {
    return placeholderParseFailure(diagnostics);
  }

  cleanMarkdownDestinations(root, {
    lossPolicy: mergedOptions.lossPolicy,
    phase: 'parse',
    report: mergedOptions.report,
    sourceLocation: mergedOptions.sourceLocation,
  });

  const flowHtmlBlocks = findMarkdownFlowHtmlBlocks(root);

  const chunks: PlaceholderMdastChunk[] = [];
  let pendingMdast: MdRootContent[] = [];

  const flushPendingMdast = () => {
    if (pendingMdast.length === 0) return;
    chunks.push({ kind: 'mdast', nodes: pendingMdast });
    pendingMdast = [];
  };

  const pushMdast = (node: MdRootContent) => {
    pendingMdast.push(node);
  };

  for (const child of root.children) {
    if (isPlaceholderFlowNode(child, tag)) {
      flushPendingMdast();
      const ref = readPlaceholderRef(child, tag, source, diagnostics);

      if (ref !== null) {
        chunks.push({ kind: 'placeholder', ref });
      }
      continue;
    }

    if (child.type === 'list') {
      splitListAroundPlaceholders(
        child,
        tag,
        source,
        diagnostics,
        (ref) => {
          flushPendingMdast();
          chunks.push({ kind: 'placeholder', ref });
        },
        pushMdast
      );
      continue;
    }

    assertNoNestedPlaceholderTag(child, tag, source, diagnostics);
    pushMdast(child);
  }

  flushPendingMdast();

  if (diagnostics.failure()) {
    return placeholderParseFailure(diagnostics);
  }

  const slateOptions: DeserializeMdContext = {
    ...mergedOptions,
    flowHtmlBlocks,
  };
  const segments: MarkdownPlaceholderSegment[] = [];

  for (const chunk of chunks) {
    if (chunk.kind === 'placeholder') {
      segments.push(Object.freeze({ kind: 'placeholder', ref: chunk.ref }));
      continue;
    }

    const subRoot: Root = {
      children: chunk.nodes,
      type: 'root',
    };
    const converted = mdastToSlate(subRoot, slateOptions);

    if (diagnostics.failure()) {
      return placeholderParseFailure(diagnostics);
    }

    const blocks = snapshotBlocks(runtime, converted);
    const unlanded =
      landsMarkdownParagraph(runtime.registry) &&
      findMarkdownParagraph(blocks, []);

    if (unlanded) {
      reportUnlandedParagraph(
        diagnostics,
        'No paragraph plugin is installed, and only a document parse lands a Markdown paragraph.',
        unlanded
      );

      return placeholderParseFailure(diagnostics);
    }

    try {
      runtime.state.schema.assertFragment(blocks);
    } catch (error) {
      reportSchemaInvalid(error, diagnostics);

      return placeholderParseFailure(diagnostics);
    }

    segments.push(
      Object.freeze({
        kind: 'nodes',
        nodes: Object.freeze(
          blocks.filter((node): node is Element => ElementApi.isElement(node))
        ),
      })
    );
  }

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    ok: true,
    segments: Object.freeze(segments),
  });
};

const LEADING_WHITESPACE = /^\s*/;
const TRAILING_WHITESPACE = /\s*$/;

const whitespace = (value: string): Descendant[] =>
  value ? [{ text: value }] : [];

const deliverMarkdownInline = (
  runtime: MarkdownRuntime,
  source: string,
  parsed: readonly Descendant[],
  diagnostics: MarkdownDiagnostics
): readonly Descendant[] | null => {
  const blocks = normalizeDocumentChildren(runtime, parsed);
  const [block] = blocks;

  if (
    blocks.length !== 1 ||
    block?.type !== getMarkdownParagraphType(runtime.registry)
  ) {
    diagnostics.report({
      actual: blocks.length,
      code: 'markdown-inline-blocks',
      message:
        blocks.length > 1
          ? `Inline Markdown produced ${blocks.length} blocks. Use parseSlice for block content.`
          : `Inline Markdown produced a "${block?.type}" block. Use parseSlice for block content.`,
      severity: 'error',
    });

    return null;
  }
  return [
    ...whitespace(LEADING_WHITESPACE.exec(source)?.[0] ?? ''),
    ...block.children,
    ...whitespace(TRAILING_WHITESPACE.exec(source)?.[0] ?? ''),
  ];
};

// Surrounding whitespace is kept for insertion into running text. A partial
// preview keeps only the trailing whitespace a partial parseSlice shows.
export const parseMarkdownInlineWithRuntime = (
  runtime: MarkdownRuntime,
  source: string,
  options: MarkdownParsePolicy = {}
): MarkdownSliceParseResult => {
  const diagnostics = new MarkdownDiagnostics();
  const trimmed = source.trim();

  if (!trimmed) {
    if (reportByteLimit(source, options, diagnostics)) {
      return sliceParseFailure(diagnostics);
    }

    return Object.freeze({
      diagnostics: diagnostics.warnings(),
      ok: true,
      slice: ContentSlice.closed(whitespace(source)),
    });
  }
  let children: readonly Descendant[] | null = null;

  if (options.partial) {
    const preview = new MarkdownDiagnostics();
    const read = fitsByteLimit(source.trimStart(), options)
      ? source.trimStart()
      : trimmed;
    let blocks: readonly Descendant[] | null;

    // The preview reads the trailing whitespace a strict parse trims, and a
    // remark parser may reject it.
    try {
      blocks = deliverOpenTail(
        runtime,
        read,
        0,
        options,
        preview,
        { inline: true },
        {
          fit: deferredFit(runtime),
          keptDiagnostics: [],
          retriesUncut: true,
          start: openSegmentStart(runtime, read, options),
        }
      );
    } catch {
      blocks = null;
    }

    children =
      blocks && !preview.failure()
        ? deliverMarkdownInline(runtime, source.trimEnd(), blocks, preview)
        : null;
    if (children) preview.all().forEach(diagnostics.report);
  }
  if (!children) {
    const parsed = runParsedNodes(runtime, trimmed, options, diagnostics, {
      inline: true,
    });

    children =
      parsed && !diagnostics.failure()
        ? deliverMarkdownInline(runtime, source, parsed, diagnostics)
        : null;
  }
  if (!children || diagnostics.failure()) return sliceParseFailure(diagnostics);

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    ok: true,
    slice: ContentSlice.closed(children),
  });
};
