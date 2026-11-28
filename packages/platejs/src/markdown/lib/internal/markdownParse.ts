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
} from '../../../core';
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
  MARKDOWN_FRONTMATTER_KEY,
  readMarkdownFrontmatter,
} from './markdownFrontmatter';
import {
  findMarkdownFlowHtmlBlocks,
  getMarkdownParagraphLanding,
} from './markdownIntrinsics';
import type { CompiledMarkdownMappings } from './markdownMappings';
import { hasMarkdownDefinitions } from './markdownReferences';
import {
  getMarkdownParser,
  getMergedOptionsDeserialize,
  type MarkdownRuntime,
  samePlugins,
} from './markdownRuntime';
import { cleanMarkdownDestinations } from './markdownSafety';
import {
  getMarkdownTagRepair,
  isMarkdownTagSyntax,
  MARKDOWN_TAG_NAME,
} from './markdownTags';

const DEFINITION_SYNTAX = [
  'gfmFootnoteCall',
  'gfmFootnoteDefinition',
  'gfmPotentialFootnoteCall',
];

type MarkdownPositionShift = Readonly<{
  lines: number;
  minLine?: number;
  offset: number;
}>;

type MarkdownSegmentHooks = Pick<
  DeserializeMdContext,
  'onRootChildren' | 'onSyntaxNodes' | 'previousRootSibling'
> &
  Readonly<{
    /** The source is one paragraph, so no HTML block decodes on its own. */
    inline?: boolean;
    onHasDefinition?: (hasDefinition: boolean) => void;
    positionShift?: MarkdownPositionShift;
    suppressEndTagRepair?: boolean;
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

const shiftMdastPositions = (
  node: Nodes,
  shift: MarkdownPositionShift
): void => {
  const minLine = shift.minLine ?? 1;

  if (node.position) {
    const { end, start } = node.position;

    if (start.line >= minLine) {
      start.line += shift.lines;
      if (start.offset !== undefined) start.offset += shift.offset;
      if (end.line >= minLine) {
        end.line += shift.lines;
        if (end.offset !== undefined) end.offset += shift.offset;
      }
    }
  }
  if ('children' in node) {
    for (const child of node.children) {
      shiftMdastPositions(child, shift);
    }
  }
};

export const markdownToSlateNodesWithRuntime = (
  runtime: MarkdownRuntime,
  text: string,
  options: MarkdownParsePolicy = {},
  diagnostics = new MarkdownDiagnostics(),
  {
    inline,
    onHasDefinition,
    positionShift,
    suppressEndTagRepair,
    ...hooks
  }: MarkdownSegmentHooks = {},
  source = text
): Descendant[] => {
  const mergedOptions: DeserializeMdContext = {
    ...getMergedOptionsDeserialize(runtime, options, {
      diagnostics,
      positionsReferToSource: true,
      source,
      sourceOffset: positionShift ? positionShift.offset : 0,
      suppressEndTagRepair,
    }),
    ...hooks,
  };
  const parser = getMarkdownParser(runtime);
  const tree = parser.runSync(parser.parse(text), text);

  onHasDefinition?.(hasMarkdownDefinitions(tree));
  if (
    positionShift &&
    (positionShift.lines !== 0 || positionShift.offset !== 0)
  ) {
    shiftMdastPositions(tree, positionShift);
  }

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

const compileMarkdownTree = (
  node: Root,
  text: string,
  options: DeserializeMdContext,
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
      text,
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

export const snapshotBlocks = (
  runtime: MarkdownRuntime,
  parsed: readonly Descendant[]
): readonly Descendant[] =>
  ContentSlice.closed([...normalizeDocumentChildren(runtime, parsed)]).content;

const normalizeDocumentChildren = (
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
  const parsed = runParsedNodes(
    runtime,
    source,
    options,
    diagnostics,
    {},
    text
  );
  const document =
    parsed && !diagnostics.failure()
      ? deliverMarkdownDocument(
          runtime,
          options,
          frontmatter,
          parsed,
          diagnostics
        )
      : null;

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
  options: MarkdownParsePolicy = {}
): MarkdownSliceParseResult => {
  const diagnostics = new MarkdownDiagnostics();
  const parsed = runParsedNodes(runtime, source, options, diagnostics);

  if (!parsed || diagnostics.failure()) {
    return sliceParseFailure(diagnostics);
  }

  const nodes = snapshotBlocks(runtime, parsed);
  const unlanded =
    landsMarkdownParagraph(runtime.registry) &&
    findMarkdownParagraph(nodes, []);

  if (unlanded) {
    reportUnlandedParagraph(
      diagnostics,
      'No paragraph plugin is installed, and only a document parse lands a Markdown paragraph.',
      unlanded
    );

    return sliceParseFailure(diagnostics);
  }
  try {
    runtime.state.schema.assertFragment(nodes);
  } catch (error) {
    reportSchemaInvalid(error, diagnostics);

    return sliceParseFailure(diagnostics);
  }

  const slice = createValidatedContentSlice(nodes, runtime.state.schema);

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    ok: true,
    slice,
  });
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
  const parsed = runParsedNodes(runtime, trimmed, options, diagnostics, {
    inline: true,
  });
  const children =
    parsed && !diagnostics.failure()
      ? deliverMarkdownInline(runtime, source, parsed, diagnostics)
      : null;

  if (!children || diagnostics.failure()) return sliceParseFailure(diagnostics);

  return Object.freeze({
    diagnostics: diagnostics.warnings(),
    ok: true,
    slice: ContentSlice.closed(children),
  });
};
