import { dequal } from 'dequal';

import type { AuthoredFormatSnapshot } from '../../../authored';
import {
  projectAuthoredRange,
  readAuthoredFormatSnapshot,
} from '../../../authored';
import {
  createEditor,
  DocumentChange,
  type BasePluginInput,
  type Editor,
  type EditorDocumentValue,
  type Range,
} from '../../../core';
import type {
  EditorStaticProps,
  RenderStaticHtmlOptions,
} from '../../../static';
import { renderStaticHtml } from '../../../static';
import {
  acquireDocxSource,
  docxSourceSchemaMatches,
  type DocxSource,
  type DocxSourceLease,
} from '../../internal/source';
import type { DocxComment, DocxDiagnostic } from '../../internal/types';
import { addDocxComments, prepareDocxComments } from './comments';
import { exportHtmlToDocx } from './exportHtmlToDocx.internal';
import type { Margins, PageSize } from './internal/types';
import { addAuthoredDocxEnvelope } from './packageArtifacts';
import {
  applyReviewProjection,
  createReviewProjection,
  DocxReviewSegmentPlugin,
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
  /** Plate descriptors used for static HTML serialization. */
  editorPlugins?: readonly BasePluginInput[];
  /** React component used for static HTML rendering. */
  editorStaticComponent?: React.ComponentType<EditorStaticProps>;
  /** Font family for the document body. */
  fontFamily?: string;
  /** Page margins in twentieths of a point. */
  margins?: Margins;
  /** Page orientation. @default 'portrait' */
  orientation?: 'landscape' | 'portrait';
  /** Page size in twentieths of a point. */
  pageSize?: PageSize;
  /** Exact visible and native document projection to export. */
  projection: 'accepted' | 'proposed' | 'review';
  /** Cooperative cancellation signal. */
  signal?: AbortSignal;
  /** Retained import source used for exact or source-aware export. */
  source?: DocxSource;
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

const captureExportSnapshot = (editor: Editor): AuthoredFormatSnapshot => {
  const review = editor.read.value();

  if (review.meta?.authored !== undefined) {
    return readAuthoredFormatSnapshot(editor as never, { review });
  }

  return Object.freeze({
    accepted: review,
    changes: Object.freeze([]),
    markup: Object.freeze({}),
    properties: Object.freeze([]),
    proposed: review,
    review,
  });
};

type ExportCapture = Readonly<{
  comments: readonly DocxComment[];
  document: EditorDocumentValue;
  review: ReturnType<typeof createReviewProjection> | undefined;
  snapshot: AuthoredFormatSnapshot;
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
  const snapshot = captureExportSnapshot(editor);

  if (options.projection === 'review' && snapshot.changes.length > 0) {
    const review = createReviewProjection(snapshot);

    return Object.freeze({
      comments: mapCommentRanges(comments, (range) =>
        projectReviewRange(review, range)
      ),
      document: review.document,
      review,
      snapshot,
    });
  }

  return Object.freeze({
    comments:
      options.projection === 'accepted'
        ? mapCommentRanges(comments, (range) =>
            projectAuthoredRange(editor, range, 'accepted')
          )
        : comments,
    document:
      options.projection === 'accepted' ? snapshot.accepted : snapshot.proposed,
    review: undefined,
    snapshot,
  });
};

const throwIfAborted = (signal: AbortSignal | undefined) => {
  if (!signal?.aborted) return;

  throw signal.reason ?? new DOMException('Aborted', 'AbortError');
};

const nativeOnlyDiagnostics = (
  document: EditorDocumentValue
): readonly DocxDiagnostic[] => {
  const diagnostics: DocxDiagnostic[] = [];

  for (const root of Object.keys(document.roots ?? {})) {
    diagnostics.push({
      code: 'lossy-content',
      feature: 'named-root',
      message: `Named root ${root} is preserved only in the native DOCX envelope.`,
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
        'Plate document metadata is preserved only in the native DOCX envelope.',
      severity: 'warning',
    });
  }

  return diagnostics;
};

const projectionDiagnostics = (
  projection: 'accepted' | 'proposed',
  changeCount: number
): readonly DocxDiagnostic[] =>
  changeCount === 0
    ? []
    : [
        {
          code: 'lossy-content',
          feature: 'authored-changes',
          message: `${projection} projection omits ${changeCount} pending authored change${
            changeCount === 1 ? '' : 's'
          }.`,
          severity: 'warning',
        },
      ];

const renderProjection = async (
  capture: ExportCapture,
  options: DocxExportOptions
) => {
  const { editorPlugins = [], editorStaticComponent, fontFamily } = options;
  const { document, review } = capture;
  const plugins = review
    ? [...editorPlugins, DocxReviewSegmentPlugin]
    : editorPlugins;
  const staticEditor = createEditor({
    initialValue: document,
    plugins,
  });
  const htmlOptions: Partial<RenderStaticHtmlOptions> = {
    props: {
      style: { padding: '0', ...(fontFamily ? { fontFamily } : {}) },
    },
  };

  if (editorStaticComponent) {
    htmlOptions.editorComponent = editorStaticComponent;
  }
  const html = await renderStaticHtml(staticEditor, htmlOptions);

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
  reason: Extract<DocxDiagnostic, { code: 'source-unavailable' }>['reason']
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

const generateDocx = async (html: string, options: DocxExportOptions) => {
  try {
    return await exportHtmlToDocx(html, options);
  } catch (error) {
    throw new DocxGenerationError(error);
  }
};

const renderCommentBodies = async (
  comments: readonly DocxComment[],
  options: DocxExportOptions
) =>
  new Map(
    await Promise.all(
      comments.map(async (comment) => {
        const editor = createEditor({
          initialValue: comment.body,
          plugins: options.editorPlugins ?? [],
        });
        const htmlOptions: Partial<RenderStaticHtmlOptions> = {
          props: {
            style: {
              padding: '0',
              ...(options.fontFamily ? { fontFamily: options.fontFamily } : {}),
            },
          },
        };

        if (options.editorStaticComponent) {
          htmlOptions.editorComponent = options.editorStaticComponent;
        }

        return [
          comment.id,
          await renderStaticHtml(editor, htmlOptions),
        ] as const;
      })
    )
  );

/** Convert one immutable editor snapshot to a deliberate DOCX projection. */
export async function exportToDocx(
  editor: Editor,
  options: DocxExportOptions
): Promise<DocxExportResult> {
  if (
    !options ||
    !['accepted', 'proposed', 'review'].includes(options.projection)
  ) {
    throw new TypeError('DOCX export requires an explicit projection.');
  }
  throwIfAborted(options.signal);
  const sourceAcquisition = options.source
    ? acquireDocxSource(options.source)
    : undefined;
  const comments = Object.freeze(
    (options.comments ?? []).map((comment) => structuredClone(comment))
  );
  if (new Set(comments.map(({ id }) => id)).size !== comments.length) {
    throw new TypeError('DOCX comment identities must be unique.');
  }
  const capture = captureExport(editor, options, comments);
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
    throwIfAborted(options.signal);

    return Object.freeze({
      blob: sourceAcquisition.lease.blob,
      diagnostics: Object.freeze([]),
      ok: true,
    });
  }
  const { snapshot } = capture;
  const diagnostics: DocxDiagnostic[] = [
    ...sourceResolution.diagnostics,
    ...nativeOnlyDiagnostics(snapshot.review),
    ...(options.projection === 'review'
      ? []
      : projectionDiagnostics(options.projection, snapshot.changes.length)),
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
      renderProjection(capture, options),
      renderCommentBodies(comments, options),
    ]);

    diagnostics.push(...rendered.diagnostics);
    const preparedComments = prepareDocxComments(
      rendered.html,
      capture.comments,
      commentBodies
    );

    diagnostics.push(...preparedComments.diagnostics);
    throwIfAborted(options.signal);
    const { projection, signal } = options;
    let blob = await generateDocx(preparedComments.html, options);

    throwIfAborted(signal);
    blob = await addDocxComments(blob, preparedComments);
    if (projection === 'review') {
      blob = await addAuthoredDocxEnvelope(blob, snapshot.review, signal);
    }
    if (sourceResolution.lease) {
      const { blob: preservedBlob, diagnostics: preservationDiagnostics } =
        await preserveDocxSource(blob, sourceResolution.lease, signal);

      blob = preservedBlob;
      diagnostics.push(...preservationDiagnostics);
    }

    return Object.freeze({
      blob,
      diagnostics: Object.freeze(diagnostics),
      ok: true,
    });
  } catch (error) {
    if (options.signal?.aborted) throwIfAborted(options.signal);
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
