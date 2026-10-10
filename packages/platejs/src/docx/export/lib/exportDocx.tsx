import { dequal } from 'dequal';

import type {
  AuthoredDocumentProjection,
  AuthoredReviewProjection,
} from '../../../authored';
import {
  projectAuthoredDocument,
  projectAuthoredRange,
  projectAuthoredReview,
} from '../../../authored';
import {
  type BasePluginInput,
  DocumentChange,
  type Editor,
  type EditorDocumentValue,
  type Range,
} from '../../../core';
import type { EditorStaticProps } from '../../../static/components/PlateStatic';
import { renderStaticHtmlWithOverrides } from '../../../static/internal/renderStaticHtmlWithOverrides';
import type { StaticHtmlResult } from '../../../static/renderStaticHtml';
import { throwIfDocxAborted } from '../../internal/abort';
import {
  acquireDocxSource,
  docxSourceSchemaMatches,
  type DocxSource,
  type DocxSourceLease,
} from '../../internal/source';
import type { DocxComment, DocxDiagnostic } from '../../internal/types';
import { addDocxComments, prepareDocxComments } from './comments';
import { DOCX_STATIC_COMPONENTS } from './docxStaticComponents';
import { exportHtmlToDocx } from './exportHtmlToDocx.internal';
import type { Margins, PageSize } from './internal/types';
import { checkDocxOutput, prepareDocxOutput } from './outputSafety';
import {
  applyReviewProjection,
  createReviewProjection,
  projectReviewRange,
} from './reviewProjection';
import { preserveDocxSource } from './sourcePreservation';

export type { DocxComment, DocxDiagnostic };
export type { Margins, PageSize } from './internal/types';

/** Options for converting one captured editor document to DOCX. */
export type DocxExportOptions = Readonly<{
  /** Fetch remote HTTP(S) images during export. @default false */
  allowRemoteImages?: boolean;
  /** Word comments whose ranges address the proposed editor projection. */
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
  /** Page size in twentieths of a point. */
  pageSize?: PageSize;
  /**
   * Static plugins that draw the body and every comment body, such as the
   * app's static kit; see `renderStaticHtml`. DOCX's own drawings of code
   * blocks, columns, equations, callouts, headings and tables of contents
   * take precedence. Each `missing-static-presentation` diagnostic counts as
   * lost content under `lossPolicy`. It does not stop an unchanged `source`
   * from returning its original file.
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
   * contents marks its placeholder `[data-empty]`. A task list item marks its
   * `li` with `data-checked`, which becomes a ☑ or ☐ list marker.
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

type CapturedExportSnapshot = AuthoredDocumentProjection &
  Readonly<{ format?: AuthoredReviewProjection }>;

const captureExportSnapshot = (
  editor: Editor,
  projection: DocxExportOptions['projection']
): CapturedExportSnapshot => {
  const review = editor.read.value();

  if (projection === 'review') {
    const format = projectAuthoredReview(review);

    return Object.freeze({
      diagnostics: format.diagnostics,
      document: format.proposed,
      format,
      review: format.review,
      unresolved: format.unresolved,
    });
  }

  return projectAuthoredDocument(review, { projection });
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

  if (
    options.projection === 'review' &&
    snapshot.format &&
    snapshot.format.changes.length > 0
  ) {
    const review = createReviewProjection(snapshot.format);

    return Object.freeze({
      comments: mapCommentRanges(comments, (range) =>
        projectReviewRange(review, range)
      ),
      diagnostics: Object.freeze([]),
      document: review.document,
      review,
      snapshot,
    });
  }
  if (options.projection !== 'accepted') {
    return Object.freeze({
      comments,
      diagnostics: Object.freeze([]),
      document: snapshot.document,
      review: undefined,
      snapshot,
    });
  }
  const projected: DocxComment[] = [];
  const diagnostics: DocxDiagnostic[] = [];

  mapCommentRanges(comments, (range) =>
    projectAuthoredRange(snapshot, range)
  ).forEach((comment, index) => {
    // Like rejecting a suggestion in Word, the accepted projection drops a
    // comment when none of the content it annotates survives.
    if (comment.target === null && comments[index]?.target) {
      diagnostics.push({
        code: 'authored-lossy-projection',
        message: `The accepted projection omits comment ${comment.id} because it excludes all of the annotated content.`,
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

const nativeOnlyDiagnostics = (
  document: EditorDocumentValue
): readonly DocxDiagnostic[] => {
  const diagnostics: DocxDiagnostic[] = [];

  for (const root of Object.keys(document.roots ?? {})) {
    diagnostics.push({
      code: 'lossy-content',
      feature: 'named-root',
      message: `Named root ${root} is omitted from DOCX output.`,
      root,
      severity: 'warning',
    });
  }
  const nativeMeta = Object.keys(document.meta ?? {}).filter(
    (key) => key !== 'authored'
  );

  if (nativeMeta.length > 0) {
    diagnostics.push({
      code: 'lossy-content',
      feature: 'document-metadata',
      message: 'Plate document metadata is omitted from DOCX output.',
      severity: 'warning',
    });
  }

  return diagnostics;
};

const renderDocxHtml = async (
  editor: Editor,
  document: EditorDocumentValue,
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
    DOCX_STATIC_COMPONENTS
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
  if (!DocumentChange.between(lease.document, capture.snapshot.review).empty) {
    reasons.push('document-changed');
  }
  if (options.comments !== undefined && !dequal(comments, lease.comments)) {
    reasons.push('comments-changed');
  }
  if (
    options.title !== undefined ||
    options.margins !== undefined ||
    options.orientation !== undefined ||
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

// Like HTML and Markdown, omitted named roots and metadata warn under every
// policy. Other established content loss fails under reject.
const isContentLoss = (diagnostic: DocxDiagnostic) =>
  diagnostic.code === 'missing-static-presentation' ||
  diagnostic.code === 'resource-omitted' ||
  (diagnostic.code === 'unsupported-content' &&
    diagnostic.action === 'dropped') ||
  (diagnostic.code === 'lossy-content' &&
    diagnostic.feature !== 'document-metadata' &&
    diagnostic.feature !== 'named-root');

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

  if (
    options.projection === 'review' &&
    capture.snapshot.unresolved.conflicted > 0
  ) {
    const count = capture.snapshot.unresolved.conflicted;

    return Object.freeze({
      diagnostics: Object.freeze([
        {
          code: 'authored-conflict' as const,
          count,
          message: `Review DOCX cannot represent ${count} conflicted authored change${count === 1 ? '' : 's'} faithfully. Resolve conflicts before export.`,
          severity: 'error' as const,
        },
      ]),
      ok: false,
    });
  }
  const sourceResolution = resolveSourceExport(
    editor,
    capture,
    options,
    comments
  );

  const { snapshot } = capture;
  const nativeOnly = nativeOnlyDiagnostics(snapshot.review);

  if (sourceResolution.kind === 'exact') {
    throwIfDocxAborted(options.signal);

    return Object.freeze({
      blob: sourceResolution.lease.blob,
      diagnostics: Object.freeze(nativeOnly),
      ok: true,
    });
  }
  const diagnostics: DocxDiagnostic[] = [
    ...sourceResolution.diagnostics,
    ...nativeOnly,
    ...snapshot.diagnostics,
    ...capture.diagnostics,
  ];

  try {
    const [main, commentRenders] = await Promise.all([
      renderDocxHtml(editor, capture.document, options),
      Promise.all(
        capture.comments.map(async ({ body, id }) => ({
          id,
          ...(await renderDocxHtml(editor, { children: body }, options)),
        }))
      ),
    ]);

    throwIfDocxAborted(options.signal);
    const rendered = capture.review
      ? applyReviewProjection(main.data, capture.review)
      : { diagnostics: [], html: main.data };

    diagnostics.push(
      ...rendered.diagnostics,
      ...missingDrawings([main, ...commentRenders])
    );
    const preparedComments = prepareDocxComments(
      rendered.html,
      capture.comments,
      new Map(commentRenders.map(({ data, id }) => [id, data]))
    );

    diagnostics.push(...preparedComments.diagnostics);
    throwIfDocxAborted(options.signal);
    const { signal } = options;
    const output = await prepareDocxOutput(preparedComments.html, options);

    diagnostics.push(...output.diagnostics);
    let blob = await generateDocx(output.html, options);

    throwIfDocxAborted(signal);
    blob = await addDocxComments(blob, preparedComments, signal);
    throwIfDocxAborted(signal);
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

    if ((options.lossPolicy ?? 'reject') === 'reject') {
      const policyDiagnostics = diagnostics.map((diagnostic) =>
        diagnostic.severity === 'warning' && isContentLoss(diagnostic)
          ? (Object.freeze({
              ...diagnostic,
              severity: 'error' as const,
            }) as DocxDiagnostic)
          : diagnostic
      );

      if (policyDiagnostics.some(({ severity }) => severity === 'error')) {
        return Object.freeze({
          diagnostics: Object.freeze(policyDiagnostics),
          ok: false,
        });
      }
    }

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
