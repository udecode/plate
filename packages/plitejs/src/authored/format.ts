import {
  readAuthoredViewFragments,
  readAuthoredViewRenderSegments,
  type NativeAuthoredRenderSegment,
} from '../core/authored-runtime';
import {
  createInternalRootChangeFromNodeSections,
  type DocumentChange,
} from '../core/change/document-change';
import { createEditorViewRuntime } from '../editor-runtime-view';
import type {
  AnyEditor,
  EditorDocumentValue,
  Value,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Text } from '../interfaces/text';
import {
  admitAuthoredReviewDocument,
  assertAuthoredDocumentValue,
  createAuthoredReviewCheckpoint,
} from './checkpoint';
import type { AuthoredChange } from './types';

export type AuthoredFormatProjection = 'accepted' | 'markup' | 'proposed';

export type AuthoredFormatDiagnostic = Readonly<{
  code:
    | 'authored-lossy-projection'
    | 'authored-review-unsupported-node'
    | 'authored-review-unsupported-property'
    | 'authored-review-unsupported-revision';
  message: string;
  severity: 'warning';
}>;

export type AuthoredJsonProjection = 'accepted' | 'proposed' | 'review';

export type AuthoredJsonResult = Readonly<{
  data: string;
  diagnostics: readonly AuthoredFormatDiagnostic[];
}>;

export type AuthoredImportedRevision = Readonly<{
  authorId: string;
  /** Sparse change authored by this revision against the preceding projection. */
  change: DocumentChange;
  createdAt: number;
  id: string;
}>;

export type AuthoredImportedRevisionSection = Readonly<{
  after: readonly Descendant[];
  before: readonly Descendant[];
  from: number;
}>;

/** Build one sparse primary-document change from non-overlapping node sections. */
export const createAuthoredImportedRevisionChange = (
  source: EditorDocumentValue,
  sections: readonly AuthoredImportedRevisionSection[]
) =>
  createInternalRootChangeFromNodeSections('main', source.children, sections)
    .change;

export type AuthoredFormatPropertyChange = Readonly<{
  after: Readonly<Record<string, unknown>>;
  before: Readonly<Record<string, unknown>>;
  changeId: string;
  nodeKind: 'element' | 'text';
  path: Path;
  root: string;
}>;

export type AuthoredFormatSegment = Readonly<{
  changeIds: readonly string[];
  children?: readonly AuthoredFormatSegment[];
  node: Descendant;
  path: Path;
  retained: Readonly<{
    authorId: string;
    changeId: string;
    kind: 'delete' | 'move';
  }> | null;
  root: string;
  /** Source offsets when this segment is a text slice. */
  textRange: Readonly<{ end: number; start: number }> | null;
}>;

export type AuthoredFormatSnapshot = Readonly<{
  accepted: EditorDocumentValue;
  changes: readonly AuthoredChange[];
  markup: Readonly<Record<string, readonly AuthoredFormatSegment[]>>;
  properties: readonly AuthoredFormatPropertyChange[];
  proposed: EditorDocumentValue;
  /** Exact persisted authored document captured with every derived projection. */
  review: EditorDocumentValue;
}>;

type AuthoredEditor = AnyEditor & {
  read: AnyEditor['read'] & {
    authored: {
      changes: (query?: {
        cursor?: string;
        limit?: number;
        status?: 'pending';
      }) => { cursor: string | null; items: readonly AuthoredChange[] };
      changesAt: (range: {
        anchor: { offset: number; path: Path };
        focus: { offset: number; path: Path };
      }) => readonly AuthoredChange[];
    };
  };
};

const documentFor = (
  persisted: EditorDocumentValue,
  view: AuthoredEditor
): EditorDocumentValue => {
  const { authored: _authored, ...meta } = persisted.meta ?? {};
  const roots = persisted.roots
    ? Object.fromEntries(
        Object.keys(persisted.roots).map((root) => [root, view.read.root(root)])
      )
    : undefined;

  return Object.freeze({
    children: view.read.children(),
    ...(Object.keys(meta).length === 0 ? {} : { meta: Object.freeze(meta) }),
    ...(roots === undefined ? {} : { roots }),
  });
};

const lossyProjectionDiagnostics = (
  projection: Exclude<AuthoredJsonProjection, 'review'>,
  changes: readonly AuthoredChange[]
): readonly AuthoredFormatDiagnostic[] =>
  changes.length === 0
    ? []
    : [
        Object.freeze({
          code: 'authored-lossy-projection' as const,
          message: `${projection} projection omits ${
            changes.length
          } pending authored change${changes.length === 1 ? '' : 's'}.`,
          severity: 'warning' as const,
        }),
      ];

const pendingChanges = (editor: AuthoredEditor) => {
  const result: AuthoredChange[] = [];
  let cursor: string | undefined;

  do {
    const page = editor.read.authored.changes({
      cursor,
      limit: 200,
      status: 'pending',
    });

    result.push(...page.items);
    cursor = page.cursor ?? undefined;
  } while (cursor);

  return Object.freeze(result);
};

const formatSegment = (
  segment: NativeAuthoredRenderSegment,
  pending: ReadonlySet<string>,
  root: string
): AuthoredFormatSegment => {
  const ownIds = segment.fragment
    ? [segment.fragment.changeId]
    : segment.changeId && pending.has(segment.changeId)
      ? [segment.changeId]
      : [];
  const children =
    segment.kind === 'element'
      ? segment.children.map((child) => formatSegment(child, pending, root))
      : undefined;
  const changeIds = Object.freeze([
    ...new Set([
      ...ownIds,
      ...(children?.flatMap((child) => child.changeIds) ?? []),
    ]),
  ]);
  const node =
    segment.kind === 'text'
      ? Object.freeze({
          ...(segment.node as Text),
          text: (segment.node as Text).text.slice(segment.start, segment.end),
        })
      : Object.freeze({
          ...segment.node,
          children: children?.map((child) => child.node) ?? [],
        });

  return Object.freeze({
    changeIds,
    ...(children === undefined ? {} : { children: Object.freeze(children) }),
    node,
    path: segment.path,
    retained: segment.fragment
      ? Object.freeze({
          authorId: segment.fragment.authorId,
          changeId: segment.fragment.changeId,
          kind: segment.fragment.kind,
        })
      : null,
    root,
    textRange:
      segment.kind === 'text'
        ? Object.freeze({ end: segment.end, start: segment.start })
        : null,
  });
};

/** Materialize one immutable review snapshot for document format adapters. */
export const readAuthoredFormatSnapshot = <V extends Value>(
  input: AnyEditor<V> & AuthoredEditor,
  options: Readonly<{ review?: EditorDocumentValue }> = {}
): AuthoredFormatSnapshot => {
  const editor = input as AuthoredEditor;

  if (!editor.read.authored) {
    throw new Error('Authored changes are not installed.');
  }
  const review = options.review ?? editor.read.value();
  const accepted = createEditorViewRuntime(input, {
    authored: { intent: 'edit', projection: 'accepted' },
  }) as unknown as AuthoredEditor;
  const proposed = createEditorViewRuntime(input, {
    authored: { intent: 'propose', projection: 'proposed' },
  }) as unknown as AuthoredEditor;
  const markup = createEditorViewRuntime(input, {
    authored: { intent: 'propose', projection: 'markup' },
  }) as unknown as AuthoredEditor;
  const changes = pendingChanges(markup);
  const pending = new Set(changes.map(({ id }) => id));
  const roots = ['main', ...Object.keys(review.roots ?? {})];
  const segments = Object.fromEntries(
    roots.map((root) => {
      const children =
        root === 'main' ? markup.read.children() : markup.read.root(root);
      const rendered = readAuthoredViewRenderSegments(
        markup,
        children,
        root,
        []
      );

      return [
        root,
        Object.freeze(
          rendered.map((segment) => formatSegment(segment, pending, root))
        ),
      ];
    })
  );
  const properties = changes.flatMap((change) =>
    readAuthoredViewFragments(markup, change.id).flatMap((fragment) =>
      fragment.kind === 'properties'
        ? [
            Object.freeze({
              after: fragment.after,
              before: fragment.before,
              changeId: change.id,
              nodeKind: fragment.nodeKind,
              path: fragment.path,
              root: fragment.root,
            }),
          ]
        : []
    )
  );

  return Object.freeze({
    accepted: documentFor(review, accepted),
    changes,
    markup: Object.freeze(segments),
    properties: Object.freeze(properties),
    proposed: documentFor(review, proposed),
    review,
  });
};

/** Serialize an authored document as an explicit projection or its full review envelope. */
export const serializeAuthoredJson = <V extends Value>(
  editor: AnyEditor<V> & AuthoredEditor,
  options: Readonly<{ projection?: AuthoredJsonProjection }> = {}
): AuthoredJsonResult => {
  const projection = options.projection ?? 'accepted';
  const snapshot = readAuthoredFormatSnapshot(editor);
  const document =
    projection === 'review'
      ? snapshot.review
      : projection === 'accepted'
        ? snapshot.accepted
        : snapshot.proposed;

  return Object.freeze({
    data: JSON.stringify(document),
    diagnostics:
      projection === 'review'
        ? Object.freeze([])
        : Object.freeze(
            lossyProjectionDiagnostics(projection, snapshot.changes)
          ),
  });
};

/** Parse a detached authored JSON envelope. Installed editor schema validates it on load. */
export const deserializeAuthoredJson = (data: string): EditorDocumentValue =>
  assertAuthoredDocumentValue(JSON.parse(data));

/** Build one validated native review envelope from sparse imported revisions. */
export const createAuthoredReviewDocument = (input: {
  accepted: EditorDocumentValue;
  revisions: readonly AuthoredImportedRevision[];
}): EditorDocumentValue =>
  admitAuthoredReviewDocument(createAuthoredReviewCheckpoint(input)).document;
