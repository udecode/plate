import { dequal } from 'dequal';
import type { Nodes, Parent, Root } from 'mdast';

import {
  type ContentSlice,
  type Descendant,
  type EditorDocumentValue,
  type Element,
  ElementApi,
  type RootKey,
} from '../../../core';
import { createContentFormatDocument } from '../../../internal/plugin/pluginFormatOperation';
import { convertNodesSerialize } from '../serializer/convertNodesSerialize';
import { finishMarkdownLists } from '../serializer/listToMdastTree';
import type {
  MarkdownDiagnostic,
  MarkdownSerializePolicy,
  MarkdownSerializeResult,
  SerializeMdContext,
} from '../types';
import { MarkdownDiagnostics } from './markdownDiagnostics';
import {
  BYTE_ORDER_MARK,
  hasMarkdownFrontmatterShape,
  isMarkdownFrontmatter,
  MARKDOWN_FRONTMATTER_KEY,
  opensMarkdownFrontmatterFence,
  readMarkdownFrontmatter,
  writeMarkdownFrontmatter,
} from './markdownFrontmatter';
import { writeBareUrlsSafely } from './markdownIntrinsics';
import { allocateMarkdownFootnoteLabels } from './markdownReferences';
import {
  createFallbackMarkdownStringifier,
  getMarkdownParser,
  getMarkdownStringifier,
  getMergedOptionsSerialize,
  type MarkdownRuntime,
  type MarkdownWriterExtension,
  readCommonMark,
} from './markdownRuntime';
import { cleanMarkdownDestinations, writeMathSafely } from './markdownSafety';

const printsNoText = (node: Nodes): boolean =>
  node.type === 'html' || node.type === 'text'
    ? node.value === ''
    : node.type === 'table'
      ? node.children.every((row) => row.children.length === 0)
      : node.type === 'list' || node.type === 'tableRow'
        ? node.children.length === 0
        : (node.type === 'emphasis' ||
            node.type === 'paragraph' ||
            node.type === 'strong' ||
            node.type === 'tableCell') &&
          node.children.every(printsNoText);

const dropUnwritableMarkdownNodes = (
  parent: { children: Parent['children'] },
  writable: ReadonlySet<string>,
  configuredWriters: ReadonlySet<string>,
  report: (nodeType: string) => void
) => {
  parent.children = parent.children.filter((child) => {
    if (!writable.has(child.type)) {
      report(child.type);
      return false;
    }
    if ('children' in child && !configuredWriters.has(child.type)) {
      dropUnwritableMarkdownNodes(child, writable, configuredWriters, report);
    }
    return true;
  });
};

const collectUnwritableMarkdownKinds = (
  parent: { children: Parent['children'] },
  writable: ReadonlySet<string>,
  unwritable: Set<string>
) => {
  for (const child of parent.children) {
    if (!writable.has(child.type)) {
      unwritable.add(child.type);
    }
    if ('children' in child) {
      collectUnwritableMarkdownKinds(child, writable, unwritable);
    }
  }
};

const writeMarkdownBody = (
  runtime: MarkdownRuntime,
  context: SerializeMdContext
) => {
  const stringifier = getMarkdownStringifier(
    runtime,
    context.remarkStringifyOptions
  );
  const tree: Root = {
    children: convertNodesSerialize(context.value, context),
    type: 'root',
  };

  finishMarkdownLists(tree, context);
  cleanMarkdownDestinations(tree, {
    lossPolicy: context.lossPolicy,
    phase: 'serialize',
    report: context.report,
  });
  allocateMarkdownFootnoteLabels(tree, (label) =>
    context.report({
      action: 'replaced',
      code: 'markdown-unsupported-node',
      impact: 'lossy',
      message: `Footnote reference "${label}" has no definition in the output and reads back as text.`,
      nodeType: 'footnoteReference',
      owner: 'markdown',
      phase: 'serialize',
      severity: 'warning',
    })
  );

  const transformed = stringifier.processor.runSync(tree);

  writeBareUrlsSafely(transformed);
  writeMathSafely(transformed, readCommonMark);

  const reportUnwritable = (nodeType: string) =>
    context.report({
      action: 'dropped',
      code: 'markdown-unsupported-node',
      impact: 'lossy',
      message: `Markdown cannot write "${nodeType}": no configured remark plugin serializes it.`,
      nodeType,
      owner: 'markdown',
      phase: 'serialize',
      severity: context.lossPolicy === 'allow' ? 'warning' : 'error',
    });

  // mdast-util-to-markdown's own writers write every child and read its
  // neighbors' output, so a child no writer handles leaves the tree before
  // they run. A configured writer may write its children itself, so a node
  // under one reports only when that writer reaches it.
  if (!stringifier.configuredWriters.has('root')) {
    dropUnwritableMarkdownNodes(
      transformed,
      stringifier.writable,
      stringifier.configuredWriters,
      reportUnwritable
    );
  }
  const unwritableKinds = new Set<string>();

  collectUnwritableMarkdownKinds(
    transformed,
    stringifier.writable,
    unwritableKinds
  );

  let { processor } = stringifier;

  if (unwritableKinds.size > 0) {
    const unwritable: MarkdownWriterExtension & {
      handlers: Record<string, (node: { type: string }) => string>;
    } = { handlers: {} };

    for (const nodeType of unwritableKinds) {
      unwritable.handlers[nodeType] = (node) => {
        reportUnwritable(node.type);

        return '';
      };
    }
    processor = createFallbackMarkdownStringifier(stringifier, unwritable);
  }

  const written = transformed.children.filter(
    (node) => !unwritableKinds.has(node.type)
  );

  return {
    data: processor.stringify(transformed),
    emptyRootHasBom: stringifier.emptyRootHasBom,
    lastKind: written.findLast((node) => !printsNoText(node))?.type,
  };
};

type MarkdownFrontmatterOmitted = Extract<
  MarkdownDiagnostic,
  { code: 'markdown-frontmatter-omitted' }
>;

const writeStoredMarkdownFrontmatter = (
  document: EditorDocumentValue
):
  | Readonly<{ block: string }>
  | Readonly<{ reason: MarkdownFrontmatterOmitted['reason'] }>
  | null => {
  const stored = document.meta?.[MARKDOWN_FRONTMATTER_KEY];

  if (stored === undefined) return null;
  if (!hasMarkdownFrontmatterShape(stored)) return { reason: 'shape' };
  if (!isMarkdownFrontmatter(stored)) return { reason: 'format' };

  const block = writeMarkdownFrontmatter(stored);

  return block === null ? { reason: 'unreadable' } : { block };
};

const FRONTMATTER_OMITTED_MESSAGES: Record<
  MarkdownFrontmatterOmitted['reason'],
  string
> = {
  format: 'its format is neither "yaml" nor "toml"',
  shape:
    'it is not an object of exactly a string "format" and a string "value"',
  unreadable: 'the written block would not read back as the same value',
};

const withoutElementIds = (nodes: readonly Descendant[]): Descendant[] =>
  nodes.map((node) => {
    if (!ElementApi.isElement(node)) return node;

    const { id: _id, ...kept } = node;

    return { ...kept, children: withoutElementIds(node.children) };
  });

const isFittedEmptyDocument = (
  runtime: MarkdownRuntime,
  document: EditorDocumentValue
) => {
  const fitted = runtime.state.schema.fitDocument({ children: [] }).children;

  if (document.children.length !== fitted.length) return false;

  return dequal(
    withoutElementIds(document.children),
    withoutElementIds(fitted)
  );
};

// mdast types name only `yaml`; remark-frontmatter's TOML preset emits `toml`.
const isFrontmatterKind = (kind: string | undefined) =>
  kind === 'yaml' || kind === 'toml';

/**
 * Reads the output as a UTF-8 file gives it back: each lone surrogate
 * replaced, with and without the byte-order mark a file read may drop.
 */
const readsBackMarkdownFrontmatter = (
  runtime: MarkdownRuntime,
  context: SerializeMdContext,
  data: string
) => {
  const readsBlock = (form: string) => {
    if (!opensMarkdownFrontmatterFence(form)) return false;

    const file = form.toWellFormed();

    if (readMarkdownFrontmatter(file)) return true;
    if (context.remarkPlugins.length === 0) return false;

    return isFrontmatterKind(
      getMarkdownParser(runtime).parse(file).children[0]?.type
    );
  };

  return (
    readsBlock(data) ||
    (data.startsWith(BYTE_ORDER_MARK) && readsBlock(data.slice(1)))
  );
};

const writeMarkdownDocument = (
  runtime: MarkdownRuntime,
  context: SerializeMdContext,
  frontmatter: string | null
) => {
  if (
    frontmatter !== null &&
    isFittedEmptyDocument(runtime, context.document)
  ) {
    const { emptyRootHasBom } = getMarkdownStringifier(
      runtime,
      context.remarkStringifyOptions
    );

    return `${emptyRootHasBom ? BYTE_ORDER_MARK : ''}${frontmatter}`;
  }

  const { data, emptyRootHasBom, lastKind } = writeMarkdownBody(
    runtime,
    context
  );
  const insertAfterRootByteOrderMark = (text: string, body: string) => {
    const rootMarkLength =
      body.startsWith(BYTE_ORDER_MARK) && emptyRootHasBom ? 1 : 0;

    return `${body.slice(0, rootMarkLength)}${text}${body.slice(rootMarkLength)}`;
  };

  if (frontmatter !== null) {
    return insertAfterRootByteOrderMark(frontmatter, data);
  }
  if (!readsBackMarkdownFrontmatter(runtime, context, data)) return data;

  // mdast-util-to-markdown adds a final line ending only when the output lacks
  // one, so a body that ends in raw HTML may end in the HTML's line ending.
  const bodyLessFinalLineEnding =
    lastKind !== 'html' && data.endsWith('\n') ? data.slice(0, -1) : data;

  return insertAfterRootByteOrderMark('\n', bodyLessFinalLineEnding);
};

export const serializeMarkdownWithRuntime = (
  runtime: MarkdownRuntime,
  document: EditorDocumentValue,
  options: MarkdownSerializePolicy = {},
  initialDiagnostics: readonly MarkdownDiagnostic[] = []
): MarkdownSerializeResult => {
  runtime.state.schema.assertDocument(document);
  const readRoots = new Set<RootKey>();
  const serialized = new MarkdownDiagnostics();
  const frontmatter = writeStoredMarkdownFrontmatter(document);
  const data = writeMarkdownDocument(
    runtime,
    getMergedOptionsSerialize(
      runtime,
      options,
      document,
      serialized,
      readRoots
    ),
    frontmatter && 'block' in frontmatter ? frontmatter.block : null
  );
  const diagnostics = new MarkdownDiagnostics(initialDiagnostics);

  Object.keys(document.roots ?? {})
    .filter((root) => !readRoots.has(root))
    .sort()
    .forEach((root) => {
      diagnostics.report({
        code: 'markdown-unsupported-root',
        message: `Semantic Markdown omits document root "${root}".`,
        root,
        severity: 'warning',
      });
    });
  if (frontmatter && 'reason' in frontmatter) {
    diagnostics.report({
      code: 'markdown-frontmatter-omitted',
      impact: 'lossy',
      message: `Markdown omits the front matter block at document metadata "${MARKDOWN_FRONTMATTER_KEY}": ${FRONTMATTER_OMITTED_MESSAGES[frontmatter.reason]}.`,
      reason: frontmatter.reason,
      severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
    });
  }
  Object.keys(document.meta ?? {})
    .filter((key) => key !== 'authored' && key !== MARKDOWN_FRONTMATTER_KEY)
    .sort()
    .forEach((key) => {
      diagnostics.report({
        code: 'markdown-unsupported-metadata',
        key,
        message: `Semantic Markdown omits document metadata "${key}".`,
        severity: 'warning',
      });
    });
  serialized.all().forEach(diagnostics.report);

  return finishMarkdownSerialize(data, diagnostics);
};

export const serializeMarkdownSliceWithRuntime = (
  runtime: MarkdownRuntime,
  children: Element[],
  roots?: ContentSlice['roots']
) => {
  const diagnostics = new MarkdownDiagnostics();
  const { data } = writeMarkdownBody(
    runtime,
    getMergedOptionsSerialize(
      runtime,
      {},
      createContentFormatDocument({ content: children, roots }),
      diagnostics
    )
  );

  return finishMarkdownSerialize(data, diagnostics);
};

const finishMarkdownSerialize = (
  data: string,
  diagnostics: MarkdownDiagnostics
): MarkdownSerializeResult => {
  const failure = diagnostics.failure();

  if (failure) return Object.freeze({ diagnostics: failure, ok: false });

  return Object.freeze({
    data,
    diagnostics: diagnostics.warnings(),
    ok: true,
  });
};
