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
  DocumentChange,
  type Editor,
  type EditorDocumentValue,
  type Range,
} from '../../../core';
import type { EditorStaticProps } from '../../../static/components/PlateStatic';
import { renderStaticHtmlWithOverrides } from '../../../static/internal/renderStaticHtmlWithOverrides';
import type { RenderStaticHtmlOptions } from '../../../static/renderStaticHtml';
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
  addAuthoredDocxEnvelope,
  removeAuthoredDocxEnvelope,
} from './packageArtifacts';
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
  /** React component used for static HTML rendering. */
  component?: React.ComponentType<EditorStaticProps>;
  /** Font family for the document body. */
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
  /** Attach Plate's correspondence-bound native review state. Review projection only. */
  nativeState?: 'attach';
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
  /** Exact CSS stylesheet applied before DOCX conversion. */
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
  document: EditorDocumentValue,
  nativeState: DocxExportOptions['nativeState']
): readonly DocxDiagnostic[] => {
  const diagnostics: DocxDiagnostic[] = [];

  for (const root of Object.keys(document.roots ?? {})) {
    diagnostics.push({
      code: 'lossy-content',
      feature: 'named-root',
      message:
        nativeState === 'attach'
          ? `Named root ${root} is preserved only in attached Plate native state.`
          : `Named root ${root} is omitted from DOCX output.`,
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
      message:
        nativeState === 'attach'
          ? 'Plate document metadata is preserved only in attached Plate native state.'
          : 'Plate document metadata is omitted from DOCX output.',
      severity: 'warning',
    });
  }

  return diagnostics;
};

const renderProjection = async (
  editor: Editor,
  capture: ExportCapture,
  options: DocxExportOptions
) => {
  const { component, fontFamily } = options;
  const { document, review } = capture;
  const htmlOptions: Partial<RenderStaticHtmlOptions> = {
    document,
    props: {
      style: { padding: '0', ...(fontFamily ? { fontFamily } : {}) },
    },
  };

  if (component) htmlOptions.component = component;
  const { data: html } = await renderStaticHtmlWithOverrides(
    editor,
    htmlOptions,
    DOCX_STATIC_COMPONENTS
  );

  throwIfDocxAborted(options.signal);

  return review
    ? applyReviewProjection(html, review)
    : Object.freeze({ diagnostics: Object.freeze([]), html });
};

class DocxGenerationError extends Error {
  constructor(cause: unknown) {
    super('DOCX output could not be generated.', { cause });
    this.name = 'DocxGenerationError';
  }
}

type SourceExportResolution = Readonly<{
  diagnostics: readonly DocxDiagnostic[];
  exact: boolean;
  lease?: DocxSourceLease;
}>;

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
  comments: readonly DocxComment[],
  commentsSupplied: boolean,
  lease: DocxSourceLease
): SourceExportResolution => {
  if (!docxSourceSchemaMatches(lease.schema, editor.read.schema.identity())) {
    return Object.freeze({
      diagnostics: Object.freeze([
        sourceUnavailableDiagnostic('schema-mismatch'),
      ]),
      exact: false,
    });
  }
  const reasons: Array<
    Extract<DocxDiagnostic, { code: 'source-rewritten' }>['reason']
  > = [];

  if (options.projection !== 'review') reasons.push('projection-changed');
  if (!DocumentChange.between(lease.document, capture.snapshot.review).empty) {
    reasons.push('document-changed');
  }
  if (commentsSupplied && !dequal(comments, lease.comments)) {
    reasons.push('comments-changed');
  }
  if (
    options.title !== undefined ||
    options.margins !== undefined ||
    options.orientation !== undefined ||
    options.pageSize !== undefined
  ) {
    reasons.push('output-options-changed');
  }

  return Object.freeze({
    diagnostics: Object.freeze(
      reasons.map((reason) => ({
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
      }))
    ),
    exact: reasons.length === 0,
    lease,
  });
};

// Like HTML and Markdown, omitted named roots and metadata warn under every
// policy. Other established content loss fails under reject.
const isContentLoss = (diagnostic: DocxDiagnostic) =>
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

const renderCommentBodies = async (
  editor: Editor,
  comments: readonly DocxComment[],
  options: DocxExportOptions
) => {
  const entries = await Promise.all(
    comments.map(async (comment) => {
      const htmlOptions: Partial<RenderStaticHtmlOptions> = {
        document: { children: comment.body },
        props: {
          style: {
            padding: '0',
            ...(options.fontFamily ? { fontFamily: options.fontFamily } : {}),
          },
        },
      };

      if (options.component) htmlOptions.component = options.component;

      const { data } = await renderStaticHtmlWithOverrides(
        editor,
        htmlOptions,
        DOCX_STATIC_COMPONENTS
      );

      throwIfDocxAborted(options.signal);

      return [comment.id, data] as const;
    })
  );

  throwIfDocxAborted(options.signal);

  return new Map(entries);
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
  if (options.nativeState !== undefined && options.nativeState !== 'attach') {
    throw new TypeError('nativeState must be "attach" when provided.');
  }
  if (options.nativeState === 'attach' && options.projection !== 'review') {
    throw new TypeError(
      'Plate native state can be attached only to review DOCX output.'
    );
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
  const sourceAcquisition = options.source
    ? acquireDocxSource(options.source)
    : undefined;
  const sourceResolution: SourceExportResolution = options.source
    ? sourceAcquisition?.ok
      ? resolveSourceExport(
          editor,
          capture,
          options,
          comments,
          options.comments !== undefined,
          sourceAcquisition.lease
        )
      : Object.freeze({
          diagnostics: Object.freeze([
            sourceUnavailableDiagnostic(sourceAcquisition?.reason ?? 'invalid'),
          ]),
          exact: false,
        })
    : Object.freeze({
        diagnostics: Object.freeze([]),
        exact: false,
      });

  if (sourceAcquisition?.ok && sourceResolution.exact) {
    throwIfDocxAborted(options.signal);
    if (options.nativeState === 'attach') {
      const blob = await addAuthoredDocxEnvelope(
        sourceAcquisition.lease.blob,
        capture.snapshot.review,
        options.signal
      );

      return Object.freeze({
        blob,
        diagnostics: Object.freeze([]),
        ok: true,
      });
    }
    const sanitized = await removeAuthoredDocxEnvelope(
      sourceAcquisition.lease.blob,
      options.signal
    );

    return Object.freeze({
      blob: sanitized.blob,
      diagnostics: Object.freeze(
        sanitized.removed
          ? [
              {
                code: 'source-part-omitted' as const,
                message:
                  'Attached Plate native state was omitted by the export policy.',
                part: 'editor/authored.json',
                reason: 'invalidated' as const,
                severity: 'warning' as const,
              },
            ]
          : []
      ),
      ok: true,
    });
  }
  const { snapshot } = capture;
  const diagnostics: DocxDiagnostic[] = [
    ...sourceResolution.diagnostics,
    ...nativeOnlyDiagnostics(snapshot.review, options.nativeState),
    ...snapshot.diagnostics,
    ...capture.diagnostics,
  ];

  if (
    sourceAcquisition?.ok &&
    options.comments === undefined &&
    sourceAcquisition.lease.comments.length > 0
  ) {
    diagnostics.push({
      code: 'source-part-omitted',
      message:
        'Source comments were omitted because regenerated output requires the current comment set.',
      part: 'word/comments.xml',
      reason: 'invalidated',
      severity: 'warning',
    });
  }

  try {
    const [rendered, commentBodies] = await Promise.all([
      renderProjection(editor, capture, options),
      renderCommentBodies(editor, comments, options),
    ]);

    throwIfDocxAborted(options.signal);
    diagnostics.push(...rendered.diagnostics);
    const preparedComments = prepareDocxComments(
      rendered.html,
      capture.comments,
      commentBodies
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
    if (options.nativeState === 'attach') {
      blob = await addAuthoredDocxEnvelope(blob, snapshot.review, signal);
      throwIfDocxAborted(signal);
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
