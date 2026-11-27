import { dequal } from 'dequal';

import type { AuthoredProjectionDiagnostic } from '../../../authored';
import { projectAuthoredRange } from '../../../authored';
import {
  BaseParagraphPlugin,
  type BasePluginInput,
  type Descendant,
  type Element,
  DocumentChange,
  type Editor,
  type EditorDocumentValue,
  ElementApi,
  type Path,
  type Range,
} from '../../../core';
import { BaseBlockquotePlugin } from '../../../features/basic-nodes';
import { getPlateNodeMappingContributions } from '../../../internal/plugin/collectPlateNodeMappings';
import { projectPlateFormatDocument } from '../../../lib/editor/withPlite';
import type { EditorStaticProps } from '../../../static/components/PlateStatic';
import { renderStaticHtmlWithOverrides } from '../../../static/internal/renderStaticHtmlWithOverrides';
import type { StaticHtmlResult } from '../../../static/renderStaticHtml';
import { throwIfDocxAborted } from '../../internal/abort';
import { parseDocxHtml } from '../../internal/domParser';
import {
  acquireDocxSource,
  docxSourceSchemaMatches,
  type DocxSource,
  type DocxSourceLease,
} from '../../internal/source';
import type { DocxComment, DocxDiagnostic } from '../../internal/types';
import {
  addDocxComments,
  anchorDocxComments,
  EMPTY_PREPARED_DOCX_COMMENTS,
  joinDocxCommentBodies,
} from './comments';
import {
  type DocxTextFormat,
  docxStaticOverrides,
} from './docxStaticComponents';
import { exportHtmlToDocx } from './exportHtmlToDocx.internal';
import { indexDocxHosts } from './hostIndex';
import { toWordLevelRules } from './internal/docx-document';
import type { Margins, PageSize } from './internal/types';
import { checkDocxOutput, prepareDocxOutput } from './outputSafety';
import { addDocxReview } from './reviewPart';
import {
  applyReviewProjection,
  createReviewProjection,
} from './reviewProjection';
import { preserveDocxSource } from './sourcePreservation';

export type { DocxComment, DocxDiagnostic };
export type { Margins, PageSize } from './internal/types';

/** Options for converting one captured editor document to DOCX. */
export type DocxExportOptions = Readonly<{
  /** Fetch remote HTTP(S) images during export. @default false */
  allowRemoteImages?: boolean;
  /** Word comments whose ranges address the editor's stored document. */
  comments?: readonly DocxComment[];
  /**
   * React component used for static HTML rendering. It does not stop an
   * unchanged `source` from returning its original file.
   */
  component?: React.ComponentType<EditorStaticProps>;
  /**
   * Font family for the document body. Passing it rebuilds an unchanged
   * `source` instead of returning its original file.
   */
  fontFamily?: string;
  /**
   * `reject` fails the export when content would be dropped, such as an image
   * DOCX cannot embed or a comment without a representable range; `allow`
   * returns the file with warnings. A removed link destination keeps its
   * text, and named roots, metadata and other properties DOCX cannot
   * represent are warnings under both policies.
   *
   * @default 'reject'
   */
  lossPolicy?: 'allow' | 'reject';
  /** Page margins in twentieths of a point. */
  margins?: Margins;
  /** Page orientation. @default 'portrait' */
  orientation?: 'landscape' | 'portrait';
  /**
   * Number the pages in a footer, left-aligned in the document font. Setting
   * it to `true` rebuilds an unchanged `source`. The page-number footer
   * replaces the source's default footer and fills its empty first-page and
   * even-page footers.
   *
   * @default false
   */
  pageNumber?: boolean;
  /** Page size in twentieths of a point. */
  pageSize?: PageSize;
  /**
   * Static plugins that draw the body and every comment body, such as the
   * app's static kit; see `renderStaticHtml`. DOCX's own drawings of lists,
   * code blocks, columns, equations, callouts, headings and tables of
   * contents take precedence. Each `missing-static-presentation` diagnostic
   * counts as lost content under `lossPolicy`. It does not stop an unchanged
   * `source` from returning its original file.
   */
  presentation?: readonly BasePluginInput[];
  /** Visible document projection to export. */
  projection: 'accepted' | 'proposed' | 'review';
  /** Cooperative cancellation signal. */
  signal?: AbortSignal;
  /**
   * Retained import source used for exact or source-aware export. `null`, as
   * returned for a package exact reuse does not admit, generates the document
   * from editor content.
   */
  source?: DocxSource | null;
  /**
   * Exact CSS stylesheet applied before DOCX conversion. Passing it rebuilds
   * an unchanged `source` instead of returning its original file.
   *
   * DOCX's own drawings set no color, font or font size beyond an element's
   * own values, such as a callout's color, so the stylesheet owns them. Each
   * drawn element has the class `editor-<plugin name>`. A callout draws
   * `table > tbody > tr > td`, its first cell holding the icon; a code block
   * draws `[data-docx-preserve-whitespace]`; an empty equation or table of
   * contents marks its placeholder `[data-empty]`. A listed block's own outer
   * element carries its list item as `data-docx-list` attributes, so a rule
   * on `[data-docx-list="task"][data-docx-list-checked]` styles a checked
   * to-do's element. The rule's alignment and line height apply to each text
   * paragraph the listed block writes, not to an image or a table.
   *
   * The top and bottom margin, in `pt` or `px`, of an element drawn as a Word
   * paragraph, such as a paragraph or heading, sets its Word space before and
   * after. Without one, the Word paragraph and heading styles set that
   * spacing.
   */
  stylesheet?: string;
  /** Document metadata title. */
  title?: string;
}>;

export type DocxExportResult =
  | Readonly<{
      diagnostics: readonly DocxDiagnostic[];
      ok: false;
    }>
  | Readonly<{
      blob: Blob;
      diagnostics: readonly DocxDiagnostic[];
      ok: true;
    }>;

type CapturedExportSnapshot = Readonly<{
  diagnostics: readonly AuthoredProjectionDiagnostic[];
  /** The document the export renders. */
  document: EditorDocumentValue;
  /** The editor's document, review marks included. */
  stored: EditorDocumentValue;
}>;

const captureExportSnapshot = (
  editor: Editor,
  projection: DocxExportOptions['projection']
): CapturedExportSnapshot => {
  const stored = editor.read.value();

  if (projection === 'review') {
    return Object.freeze({
      diagnostics: Object.freeze([]),
      document: stored,
      stored,
    });
  }

  const projected = projectPlateFormatDocument(editor, stored, projection);

  return Object.freeze({
    diagnostics: projected.diagnostics,
    document: projected.document,
    stored,
  });
};

type ExportCapture = Readonly<{
  comments: readonly DocxComment[];
  diagnostics: readonly DocxDiagnostic[];
  document: EditorDocumentValue;
  review: ReturnType<typeof createReviewProjection> | undefined;
  snapshot: CapturedExportSnapshot;
}>;

const mapCommentRanges = (
  comments: readonly DocxComment[],
  project: (range: Range) => Range | null
) =>
  Object.freeze(
    comments.map((comment) => {
      if (!comment.target) return comment;
      const range = project(comment.target.range);

      return Object.freeze({
        ...comment,
        target: range ? Object.freeze({ range }) : null,
      });
    })
  );

const captureExport = (
  editor: Editor,
  options: DocxExportOptions,
  comments: readonly DocxComment[]
): ExportCapture => {
  const snapshot = captureExportSnapshot(editor, options.projection);

  if (options.projection === 'review') {
    const review = createReviewProjection(editor, snapshot.stored);

    return Object.freeze({
      comments,
      diagnostics: Object.freeze([]),
      document: review.document,
      review,
      snapshot,
    });
  }
  const projected: DocxComment[] = [];
  const diagnostics: DocxDiagnostic[] = [];

  mapCommentRanges(comments, (range) =>
    projectAuthoredRange(snapshot.stored, snapshot.document, range)
  ).forEach((comment, index) => {
    // Like deciding a suggestion in Word, a projection drops a comment when
    // none of the content it annotates survives.
    if (comment.target === null && comments[index]?.target) {
      diagnostics.push({
        code: 'authored-lossy-projection',
        message: `The ${options.projection} projection omits comment ${comment.id} because it excludes all of the annotated content.`,
        severity: 'warning',
      });
    } else {
      projected.push(comment);
    }
  });

  return Object.freeze({
    comments: Object.freeze(projected),
    diagnostics: Object.freeze(diagnostics),
    document: snapshot.document,
    review: undefined,
    snapshot,
  });
};

const metadataDiagnostics = (
  document: EditorDocumentValue
): readonly DocxDiagnostic[] => {
  const nativeMeta = Object.keys(document.meta ?? {}).filter(
    (key) => key !== 'authored'
  );

  return nativeMeta.length > 0
    ? [
        {
          code: 'lossy-content',
          feature: 'document-metadata',
          message: 'Plate document metadata is omitted from DOCX output.',
          severity: 'warning',
        },
      ]
    : [];
};

const namedRootDiagnostics = (
  document: EditorDocumentValue,
  renderedRoots: ReadonlySet<string>
): readonly DocxDiagnostic[] =>
  Object.keys(document.roots ?? {})
    .filter((root) => !renderedRoots.has(root))
    .map((root) => ({
      code: 'lossy-content' as const,
      feature: 'named-root' as const,
      message: `Named root ${root} is omitted from DOCX output.`,
      root,
      severity: 'warning' as const,
    }));

type DocxPropertyFormat = Readonly<{
  dropped: string;
  plugin: string;
  property: string;
}>;

const docxFormatsOf = (
  editor: Editor
): Readonly<{
  propertyFormats: readonly DocxPropertyFormat[];
  textFormats: readonly DocxTextFormat[];
}> => {
  const propertyFormats: DocxPropertyFormat[] = [];
  const textFormats: DocxTextFormat[] = [];

  for (const {
    declaration,
    owner,
    targetKey,
    targetPlugin,
    targetType,
  } of getPlateNodeMappingContributions(editor, 'docx')) {
    if (typeof declaration.dropped !== 'string') {
      throw new Error(
        `DOCX node mapping "${owner}" must define a dropped warning message.`
      );
    }

    if (targetType !== null) {
      if (typeof declaration.text !== 'function') {
        throw new Error(
          `DOCX node mapping "${owner}" must define dropped and text for an element.`
        );
      }

      textFormats.push({
        dropped: declaration.dropped,
        plugin: targetPlugin,
        text: declaration.text as DocxTextFormat['text'],
        type: targetType,
      });
      continue;
    }

    const property =
      typeof declaration.property === 'string'
        ? declaration.property
        : targetKey;

    if (!property) {
      throw new Error(
        `DOCX node mapping "${owner}" must target an element type or element property.`
      );
    }

    propertyFormats.push({
      dropped: declaration.dropped,
      plugin: targetPlugin,
      property,
    });
  }

  return { propertyFormats, textFormats };
};

const countElements = (nodes: readonly Descendant[], type: string): number =>
  nodes.reduce(
    (count, node) =>
      ElementApi.isElement(node)
        ? count +
          (node.type === type ? 1 : 0) +
          countElements(node.children, type)
        : count,
    0
  );

const countElementsWithProperty = (
  nodes: readonly Descendant[],
  property: string
): number =>
  nodes.reduce(
    (count, node) =>
      ElementApi.isElement(node)
        ? count +
          (node[property] !== undefined && node[property] !== false ? 1 : 0) +
          countElementsWithProperty(node.children, property)
        : count,
    0
  );

const propertyFormatDiagnostics = (
  propertyFormats: readonly DocxPropertyFormat[],
  document: EditorDocumentValue
): readonly DocxDiagnostic[] =>
  propertyFormats.flatMap(({ dropped, plugin, property }) => {
    const count =
      countElementsWithProperty(document.children, property) +
      Object.values(document.roots ?? {}).reduce(
        (total, rootNodes) =>
          total + countElementsWithProperty(rootNodes, property),
        0
      );

    return count > 0
      ? [
          {
            code: 'property-dropped' as const,
            count,
            feature: plugin,
            impact: 'lossy' as const,
            message: dropped,
            severity: 'warning' as const,
          },
        ]
      : [];
  });

const textFormatDiagnostics = (
  textFormats: readonly DocxTextFormat[],
  document: EditorDocumentValue
): readonly DocxDiagnostic[] =>
  textFormats.flatMap(({ dropped, plugin, type }) => {
    const count = countElements(document.children, type);

    return count > 0
      ? [
          {
            code: 'property-dropped' as const,
            count,
            feature: plugin,
            impact: 'lossy' as const,
            message: dropped,
            severity: 'warning' as const,
          },
        ]
      : [];
  });

const isNumberedOrTask = (node: Element) =>
  node.listType === 'numbered' || node.listType === 'task';

const canShareListWithOtherKind = (node: Element) =>
  node.listType !== 'bulleted' || typeof node.listId === 'string';

const listDiagnostics = (
  document: EditorDocumentValue
): readonly DocxDiagnostic[] => {
  const diagnostics: DocxDiagnostic[] = [];
  const styles = new Map<string, unknown>();
  const kinds = new Map<string, string>();
  const rules = new Map<string, string>();
  const firstLevels = new Map<string, unknown>();
  const warn = (
    feature: 'list-marker' | 'list-start' | 'list-structure',
    path: Path,
    message: string
  ) => {
    diagnostics.push({
      code: 'lossy-content',
      feature,
      message,
      path,
      severity: 'warning',
    });
  };
  const visit = (nodes: readonly Descendant[], parentPath: Path) => {
    nodes.forEach((node, index) => {
      if (!ElementApi.isElement(node)) return;

      const path = [...parentPath, index];

      if (
        node.listType === 'numbered' ||
        node.listType === 'bulleted' ||
        node.listType === 'task'
      ) {
        const listId = typeof node.listId === 'string' ? node.listId : '';
        const indent = typeof node.indent === 'number' ? node.indent : 1;
        const level = `${listId}:${indent}`;
        const numbered = node.listType === 'numbered';
        const levelRules = JSON.stringify(node.listLevels ?? null);

        if (canShareListWithOtherKind(node)) {
          const kind = numbered ? 'numbered' : 'unordered';
          const first = kinds.get(level);

          if (first === undefined) {
            kinds.set(level, kind);
          } else if (first !== kind) {
            warn(
              'list-structure',
              path,
              `The list item at ${path.join('.')} is not part of its list in Word, because the first item at its list level is ${first}.`
            );
          }
        }
        if (isNumberedOrTask(node)) {
          if (!firstLevels.has(listId)) {
            firstLevels.set(listId, node.listLevels);
          }
          if (!rules.has(listId)) {
            rules.set(listId, levelRules);
          } else if (rules.get(listId) !== levelRules) {
            warn(
              'list-structure',
              path,
              `The list item at ${path.join('.')} takes the level rules of its list's first item in Word.`
            );
          }
          if (
            typeof node.listStart === 'number' &&
            node.listStart !==
              (toWordLevelRules(firstLevels.get(listId)).get(indent - 1)
                ?.start ?? 1)
          ) {
            warn(
              'list-start',
              path,
              `Word keeps no start that applies only when an item opens its level, so the list item at ${path.join('.')} exports its shown number without its listStart.`
            );
          }
        }
        if (numbered) {
          const style = node.listStyle ?? 'decimal';

          if (!styles.has(level)) {
            styles.set(level, style);
          } else if (styles.get(level) !== style) {
            warn(
              'list-marker',
              path,
              `The list item at ${path.join('.')} shows the marker style of its list level's first item in Word.`
            );
          }
        }
      }
      visit(node.children, path);
    });
  };

  visit(document.children, []);

  return diagnostics;
};

const quoteDiagnostics = (
  editor: Editor,
  children: readonly Descendant[],
  commentId?: string
): readonly DocxDiagnostic[] => {
  const quote = editor.plugin(BaseBlockquotePlugin);

  if (!quote.installed) return [];

  const paragraphType = editor.plugin(BaseParagraphPlugin).schema.type;
  const diagnostics: DocxDiagnostic[] = [];
  const place = (path: Path) =>
    commentId === undefined
      ? path.join('.')
      : `${path.join('.')} in comment ${commentId}`;
  const warn = (path: Path, message: string) => {
    diagnostics.push({
      code: 'lossy-content',
      feature: 'quote-structure',
      message,
      path,
      severity: 'warning',
      ...(commentId === undefined ? {} : { sourceId: commentId }),
    });
  };
  const mergesIntoQuote = (child: Descendant) =>
    ElementApi.isElement(child) && child.type === quote.schema.type;
  const leavesQuote = (child: Descendant) =>
    ElementApi.isElement(child) &&
    !mergesIntoQuote(child) &&
    (child.type !== paragraphType || child.listType !== undefined);
  const writesQuoteParagraphAt = (node: Descendant, end: -1 | 0): boolean => {
    const child = ElementApi.isElement(node)
      ? node.children.at(end)
      : undefined;

    return (
      child !== undefined &&
      !leavesQuote(child) &&
      (!mergesIntoQuote(child) || writesQuoteParagraphAt(child, end))
    );
  };
  const visit = (nodes: readonly Descendant[], parentPath: Path) => {
    nodes.forEach((node, index) => {
      if (!ElementApi.isElement(node)) return;

      const path = [...parentPath, index];

      if (node.type === quote.schema.type) {
        const previous = nodes[index - 1];

        if (
          ElementApi.isElement(previous) &&
          previous.type === quote.schema.type &&
          writesQuoteParagraphAt(previous, -1) &&
          writesQuoteParagraphAt(node, 0)
        ) {
          warn(
            path,
            `The quote at ${place(path)} joins the quote before it in Word.`
          );
        }
        node.children.forEach((child, childIndex) => {
          const childPath = [...path, childIndex];

          if (mergesIntoQuote(child)) {
            warn(
              childPath,
              `The quote at ${place(childPath)} merges into the quote around it in Word.`
            );
          } else if (leavesQuote(child)) {
            warn(
              childPath,
              `The block at ${place(childPath)} exports outside its quote.`
            );
          }
        });
      }
      visit(node.children, path);
    });
  };

  visit(children, []);

  return diagnostics;
};

const renderDocxHtml = async (
  editor: Editor,
  document: EditorDocumentValue,
  story: string,
  textFormats: readonly DocxTextFormat[],
  { component, fontFamily, presentation, signal }: DocxExportOptions
) => {
  const rendered = await renderStaticHtmlWithOverrides(
    editor,
    {
      component,
      document,
      presentation,
      props: {
        style: { padding: '0', ...(fontFamily ? { fontFamily } : {}) },
      },
    },
    docxStaticOverrides(story, textFormats)
  );

  throwIfDocxAborted(signal);

  return rendered;
};

const missingDrawings = (
  renders: readonly StaticHtmlResult[]
): DocxDiagnostic[] => [
  ...new Map(
    renders
      .flatMap(({ diagnostics }) => diagnostics)
      .filter((diagnostic) => diagnostic.code === 'missing-static-presentation')
      .map((diagnostic) => [diagnostic.plugin, diagnostic])
  ).values(),
];

class DocxGenerationError extends Error {
  constructor(cause: unknown) {
    super('DOCX output could not be generated.', { cause });
    this.name = 'DocxGenerationError';
  }
}

type SourceExportResolution =
  | Readonly<{ kind: 'exact'; lease: DocxSourceLease }>
  | Readonly<{
      diagnostics: readonly DocxDiagnostic[];
      kind: 'render';
      lease?: DocxSourceLease;
    }>;

const renderWithoutSource = (
  diagnostics: readonly DocxDiagnostic[]
): SourceExportResolution =>
  Object.freeze({ diagnostics: Object.freeze(diagnostics), kind: 'render' });

const omittedCommentsDiagnostic: DocxDiagnostic = Object.freeze({
  code: 'source-part-omitted',
  message:
    'Source comments were omitted because regenerated output requires the current comment set.',
  part: 'word/comments.xml',
  reason: 'invalidated',
  severity: 'warning',
});

const sourceUnavailableDiagnostic = (
  reason: 'disposed' | 'invalid' | 'schema-mismatch'
): DocxDiagnostic => ({
  code: 'source-unavailable',
  message: `The retained DOCX source is ${
    reason === 'schema-mismatch' ? 'bound to a different editor schema' : reason
  }; the document will be generated from editor content.`,
  reason,
  severity: 'warning',
});

const resolveSourceExport = (
  editor: Editor,
  capture: ExportCapture,
  options: DocxExportOptions,
  comments: readonly DocxComment[]
): SourceExportResolution => {
  if (!options.source) return renderWithoutSource([]);
  const acquisition = acquireDocxSource(options.source);

  if (!acquisition.ok) {
    return renderWithoutSource([
      sourceUnavailableDiagnostic(acquisition.reason),
    ]);
  }
  const { lease } = acquisition;
  const omitted =
    options.comments === undefined && lease.comments.length > 0
      ? [omittedCommentsDiagnostic]
      : [];

  if (!docxSourceSchemaMatches(lease.schema, editor.read.schema.identity())) {
    return renderWithoutSource([
      sourceUnavailableDiagnostic('schema-mismatch'),
      ...omitted,
    ]);
  }
  const reasons: Array<
    Extract<DocxDiagnostic, { code: 'source-rewritten' }>['reason']
  > = [];

  if (options.projection !== 'review') reasons.push('projection-changed');
  if (!DocumentChange.between(lease.document, capture.snapshot.stored).empty) {
    reasons.push('document-changed');
  }
  if (options.comments !== undefined && !dequal(comments, lease.comments)) {
    reasons.push('comments-changed');
  }
  if (
    options.title !== undefined ||
    options.margins !== undefined ||
    options.orientation !== undefined ||
    options.pageNumber ||
    options.pageSize !== undefined ||
    options.stylesheet !== undefined ||
    options.fontFamily !== undefined
  ) {
    reasons.push('output-options-changed');
  }
  if (reasons.length === 0) return Object.freeze({ kind: 'exact', lease });

  return Object.freeze({
    diagnostics: Object.freeze([
      ...reasons.map((reason) => ({
        code: 'source-rewritten' as const,
        message: `The retained DOCX source cannot be returned unchanged because ${
          reason === 'document-changed'
            ? 'the editor document changed'
            : reason === 'comments-changed'
              ? 'the comment set changed'
              : reason === 'projection-changed'
                ? 'the export projection is not review'
                : 'package output options were supplied'
        }.`,
        reason,
        severity: 'warning' as const,
      })),
      ...omitted,
    ]),
    kind: 'render',
    lease,
  });
};

const isContentLoss = (diagnostic: DocxDiagnostic) =>
  diagnostic.code === 'missing-static-presentation' ||
  diagnostic.code === 'resource-omitted' ||
  (diagnostic.code === 'unsupported-content' &&
    diagnostic.action === 'dropped') ||
  (diagnostic.code === 'lossy-content' &&
    diagnostic.feature !== 'document-metadata' &&
    diagnostic.feature !== 'list-marker' &&
    diagnostic.feature !== 'list-start' &&
    diagnostic.feature !== 'named-root' &&
    diagnostic.feature !== 'quote-structure');

const rejectedLoss = (
  diagnostics: readonly DocxDiagnostic[],
  options: DocxExportOptions
): DocxExportResult | null => {
  if ((options.lossPolicy ?? 'reject') !== 'reject') return null;
  const policyDiagnostics = diagnostics.map((diagnostic) =>
    diagnostic.severity === 'warning' && isContentLoss(diagnostic)
      ? (Object.freeze({
          ...diagnostic,
          severity: 'error' as const,
        }) as DocxDiagnostic)
      : diagnostic
  );

  return policyDiagnostics.some(({ severity }) => severity === 'error')
    ? Object.freeze({
        diagnostics: Object.freeze(policyDiagnostics),
        ok: false,
      })
    : null;
};

const generateDocx = async (html: string, options: DocxExportOptions) => {
  try {
    const blob = await exportHtmlToDocx(html, options);

    throwIfDocxAborted(options.signal);

    return blob;
  } catch (error) {
    throwIfDocxAborted(options.signal);

    throw new DocxGenerationError(error);
  }
};

/** Convert one immutable editor snapshot to a deliberate DOCX projection. */
export async function exportDocx(
  editor: Editor,
  options: DocxExportOptions
): Promise<DocxExportResult> {
  if (
    !options ||
    !['accepted', 'proposed', 'review'].includes(options.projection)
  ) {
    throw new TypeError('DOCX export requires an explicit projection.');
  }
  if (
    options.lossPolicy !== undefined &&
    options.lossPolicy !== 'allow' &&
    options.lossPolicy !== 'reject'
  ) {
    throw new TypeError('lossPolicy must be "allow" or "reject".');
  }
  throwIfDocxAborted(options.signal);
  const comments = Object.freeze(
    (options.comments ?? []).map((comment) => structuredClone(comment))
  );
  if (new Set(comments.map(({ id }) => id)).size !== comments.length) {
    throw new TypeError('DOCX comment identities must be unique.');
  }
  const capture = captureExport(editor, options, comments);

  const sourceResolution = resolveSourceExport(
    editor,
    capture,
    options,
    comments
  );

  const { snapshot } = capture;
  const metadata = metadataDiagnostics(snapshot.stored);

  if (sourceResolution.kind === 'exact') {
    throwIfDocxAborted(options.signal);
    const exactDiagnostics = [
      ...namedRootDiagnostics(snapshot.stored, new Set()),
      ...metadata,
      ...(capture.review?.diagnostics ?? []),
    ];
    const rejected = rejectedLoss(exactDiagnostics, options);

    if (rejected) return rejected;

    return Object.freeze({
      blob: sourceResolution.lease.blob,
      diagnostics: Object.freeze(exactDiagnostics),
      ok: true,
    });
  }
  const { propertyFormats, textFormats } = docxFormatsOf(editor);
  const diagnostics: DocxDiagnostic[] = [
    ...sourceResolution.diagnostics,
    ...metadata,
    ...textFormatDiagnostics(textFormats, capture.document),
    ...propertyFormatDiagnostics(propertyFormats, capture.document),
    ...listDiagnostics(capture.document),
    ...quoteDiagnostics(editor, capture.document.children),
    ...capture.comments.flatMap(({ body, id, target }) =>
      target ? quoteDiagnostics(editor, body, id) : []
    ),
    ...snapshot.diagnostics,
    ...capture.diagnostics,
  ];

  try {
    const [main, commentRenders] = await Promise.all([
      renderDocxHtml(editor, capture.document, 'body', textFormats, options),
      Promise.all(
        capture.comments.map(async ({ body, id }) => ({
          id,
          ...(await renderDocxHtml(
            editor,
            { children: body },
            `comment:${id}`,
            textFormats,
            options
          )),
        }))
      ),
    ]);

    throwIfDocxAborted(options.signal);
    const hasStoredNamedRoots =
      Object.keys(snapshot.stored.roots ?? {}).length > 0;
    const needsMainDocument =
      capture.comments.length > 0 ||
      capture.review !== undefined ||
      hasStoredNamedRoots;
    const mainDocument = needsMainDocument
      ? parseDocxHtml(main.data)
      : undefined;
    const hostIndex = mainDocument ? indexDocxHosts(mainDocument) : undefined;

    if (hasStoredNamedRoots && hostIndex) {
      diagnostics.push(
        ...namedRootDiagnostics(snapshot.stored, hostIndex.renderedRoots)
      );
    }
    const anchored =
      mainDocument && hostIndex && capture.comments.length > 0
        ? anchorDocxComments(mainDocument, hostIndex, capture.comments)
        : EMPTY_PREPARED_DOCX_COMMENTS;
    const review =
      mainDocument && hostIndex && capture.review
        ? applyReviewProjection(mainDocument, hostIndex, capture.review)
        : undefined;

    diagnostics.push(
      ...(review?.diagnostics ?? []),
      ...missingDrawings([main, ...commentRenders])
    );
    if (mainDocument && anchored.comments.length > 0) {
      joinDocxCommentBodies(
        mainDocument,
        anchored,
        new Map(commentRenders.map(({ data, id }) => [id, data]))
      );
    }

    diagnostics.push(...anchored.diagnostics);
    throwIfDocxAborted(options.signal);
    const mainHtml =
      mainDocument && (anchored.comments.length > 0 || review !== undefined)
        ? mainDocument.body.innerHTML
        : main.data;
    const { signal } = options;
    const output = await prepareDocxOutput(mainHtml, options);

    diagnostics.push(...output.diagnostics);
    let blob = await generateDocx(output.html, options);

    throwIfDocxAborted(signal);
    blob = await addDocxComments(blob, anchored, signal);
    throwIfDocxAborted(signal);
    if (review) {
      const written = await addDocxReview(blob, review, signal);

      throwIfDocxAborted(signal);
      ({ blob } = written);
      diagnostics.push(...written.diagnostics);
    }
    if (sourceResolution.lease) {
      const { blob: preservedBlob, diagnostics: preservationDiagnostics } =
        await preserveDocxSource(blob, sourceResolution.lease, signal);

      throwIfDocxAborted(signal);
      blob = preservedBlob;
      diagnostics.push(...preservationDiagnostics);
    }
    const outputFailure = await checkDocxOutput(blob, signal);

    throwIfDocxAborted(signal);
    if (outputFailure) {
      return Object.freeze({
        diagnostics: Object.freeze([...diagnostics, outputFailure]),
        ok: false,
      });
    }

    const rejected = rejectedLoss(diagnostics, options);

    if (rejected) return rejected;

    return Object.freeze({
      blob,
      diagnostics: Object.freeze(diagnostics),
      ok: true,
    });
  } catch (error) {
    if (options.signal?.aborted) throwIfDocxAborted(options.signal);
    if (!(error instanceof DocxGenerationError)) throw error;
    const diagnostic: DocxDiagnostic = {
      code: 'decode-failed',
      message: 'DOCX output could not be generated.',
      severity: 'error',
    };

    return Object.freeze({
      diagnostics: Object.freeze([...diagnostics, diagnostic]),
      ok: false,
    });
  }
}
