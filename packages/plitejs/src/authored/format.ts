import type { NativeAuthoredProjectionDiagnostic } from '../core/authored-document-capability';
import type { NativeAuthoredRenderSegment } from '../core/authored-runtime';
import {
  createInternalRootChangeFromNodeSections,
  type DocumentChange,
} from '../core/change/document-change';
import { jsonEqual } from '../core/change/tokens';
import {
  getEditorDocumentShapeIssueMessage,
  readEditorDocument,
} from '../core/document-shape';
import type { EditorDocumentValue } from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import type { Range } from '../interfaces/range';
import { TextApi, type Text } from '../interfaces/text';
import {
  projectAuthoredDocumentRange,
  type AuthoredRangeProjection,
} from './anchors';
import {
  admitAuthoredReviewDocument,
  assertAuthoredDocumentValue,
  createAuthoredReviewCheckpoint,
} from './checkpoint';
import {
  authoredFragmentBucket,
  compileAuthoredFragmentIndex,
  type AuthoredFragmentIndex,
} from './fragment-index';
import { readAuthoredMarkupFragments } from './markup';
import { createDetachedAuthoredProjectionContext } from './projection-context';
import { readAuthoredChange } from './read';
import { readRecord } from './record-tree';
import { composeAuthoredRenderSegments } from './render';
import { matchingAuthoredChanges } from './state';
import { authoredRootNodes } from './steps';
import type { AuthoredChange } from './types';

export type AuthoredFormatProjection = 'accepted' | 'markup' | 'proposed';

export type AuthoredProjectionDiagnostic = NativeAuthoredProjectionDiagnostic;

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

export type AuthoredReviewProjection = Readonly<{
  accepted: EditorDocumentValue;
  changes: readonly AuthoredChange[];
  diagnostics: readonly AuthoredProjectionDiagnostic[];
  markup: Readonly<Record<string, readonly AuthoredFormatSegment[]>>;
  properties: readonly AuthoredFormatPropertyChange[];
  proposed: EditorDocumentValue;
  /** Exact persisted authored document captured with every derived projection. */
  review: EditorDocumentValue;
  unresolved: AuthoredUnresolvedChangeCounts;
}>;

export type AuthoredUnresolvedChangeCounts = Readonly<{
  conflicted: number;
  pending: number;
}>;

export type AuthoredDocumentProjection = Readonly<{
  diagnostics: readonly AuthoredProjectionDiagnostic[];
  document: EditorDocumentValue;
  /** Exact persisted authored document captured with the derived projection. */
  review: EditorDocumentValue;
  unresolved: AuthoredUnresolvedChangeCounts;
}>;

const unresolvedCounts = (
  changes: ReadonlyArray<Readonly<{ status: string }>>
): AuthoredUnresolvedChangeCounts => {
  let conflicted = 0;
  let pending = 0;

  for (const change of changes) {
    if (change.status === 'conflicted') conflicted += 1;
    if (change.status === 'pending') pending += 1;
  }

  return Object.freeze({ conflicted, pending });
};

export const authoredProjectionDiagnostics = (
  projection: 'accepted' | 'proposed',
  unresolved: AuthoredUnresolvedChangeCounts
): readonly AuthoredProjectionDiagnostic[] =>
  Object.freeze([
    ...(unresolved.pending === 0
      ? []
      : [
          Object.freeze({
            code: 'authored-lossy-projection' as const,
            message: `${projection} projection omits ${
              unresolved.pending
            } pending authored change${unresolved.pending === 1 ? '' : 's'}.`,
            severity: 'warning' as const,
          }),
        ]),
    ...(unresolved.conflicted === 0
      ? []
      : [
          Object.freeze({
            code: 'authored-conflict' as const,
            message: `${projection} projection resolves ${
              unresolved.conflicted
            } conflicted authored change${
              unresolved.conflicted === 1 ? '' : 's'
            } to one side; review data remains only in the authored envelope.`,
            severity: 'warning' as const,
          }),
        ]),
  ]);

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

const samePath = (left: Path, right: Path) =>
  left.length === right.length &&
  left.every((part, index) => part === right[index]);

const sameList = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

const sameTextProperties = (left: Text, right: Text) => {
  const { text: _leftText, ...leftProperties } = left;
  const { text: _rightText, ...rightProperties } = right;

  return jsonEqual(leftProperties, rightProperties);
};

const coalesceFormatSegments = (
  segments: readonly AuthoredFormatSegment[]
): readonly AuthoredFormatSegment[] => {
  const normalized = segments.map((segment) => {
    if (!segment.children) return segment;

    const children = coalesceFormatSegments(segment.children);

    return Object.freeze({
      ...segment,
      children,
      node: Object.freeze({
        ...segment.node,
        children: Object.freeze(children.map((child) => child.node)),
      }),
    });
  });

  return Object.freeze(
    normalized.reduce<AuthoredFormatSegment[]>((result, segment) => {
      const previous = result.at(-1);

      if (
        previous &&
        TextApi.isText(previous.node) &&
        TextApi.isText(segment.node) &&
        previous.root === segment.root &&
        samePath(previous.path, segment.path) &&
        sameList(previous.changeIds, segment.changeIds) &&
        jsonEqual(previous.retained, segment.retained) &&
        previous.textRange &&
        segment.textRange &&
        previous.textRange.end === segment.textRange.start &&
        sameTextProperties(previous.node, segment.node)
      ) {
        result[result.length - 1] = Object.freeze({
          ...previous,
          node: Object.freeze({
            ...previous.node,
            text: previous.node.text + segment.node.text,
          }),
          textRange: Object.freeze({
            end: segment.textRange.end,
            start: previous.textRange.start,
          }),
        });
      } else {
        result.push(segment);
      }

      return result;
    }, [])
  );
};

const projectAuthoredReviewDocument = (
  review: EditorDocumentValue
): AuthoredReviewProjection => {
  const admitted = admitAuthoredReviewDocument(review);
  const accepted: AuthoredRangeProjection = {
    mode: 'accepted',
    positions: admitted.positions.accepted,
    state: admitted.state,
    value: admitted.accepted,
  };
  const proposed: AuthoredRangeProjection = {
    mode: 'proposed',
    positions: admitted.positions.proposed,
    state: admitted.state,
    value: admitted.proposed,
  };
  let fragmentIndex: AuthoredFragmentIndex | null = null;
  const context = createDetachedAuthoredProjectionContext((nodeKey, root) =>
    fragmentIndex
      ? (readRecord(
          fragmentIndex.buckets,
          authoredFragmentBucket(root, nodeKey)
        )?.slots ?? [])
      : []
  );

  fragmentIndex = compileAuthoredFragmentIndex(context, accepted, proposed);
  const changes = Object.freeze(
    [...matchingAuthoredChanges(admitted.state, { status: 'pending' })].map(
      ({ change }) =>
        readAuthoredChange(
          change,
          admitted.state,
          admitted.positions.proposed,
          admitted.proposed
        )
    )
  );
  const pending = new Set(changes.map(({ id }) => id));
  const roots = ['main', ...Object.keys(review.roots ?? {})];
  const segments = Object.fromEntries(
    roots.map((root) => {
      const children = authoredRootNodes(
        admitted.proposed,
        root
      ) as readonly Descendant[];
      const rendered = composeAuthoredRenderSegments(
        context,
        children,
        root,
        [],
        accepted,
        proposed
      );

      return [
        root,
        Object.freeze(
          coalesceFormatSegments(
            rendered.map((segment) => formatSegment(segment, pending, root))
          )
        ),
      ];
    })
  );
  const properties = changes.flatMap((change) =>
    readAuthoredMarkupFragments(change.id, accepted, proposed).flatMap(
      (fragment) =>
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
    accepted: admitted.accepted,
    changes,
    diagnostics: Object.freeze(
      admitted.changes.some(({ status }) => status === 'conflicted')
        ? [
            Object.freeze({
              code: 'authored-conflict' as const,
              message: `Review projection preserves ${unresolvedCounts(admitted.changes).conflicted} conflicted authored change${unresolvedCounts(admitted.changes).conflicted === 1 ? '' : 's'} in the native document; visible review markup represents pending changes only.`,
              severity: 'warning' as const,
            }),
          ]
        : []
    ),
    markup: Object.freeze(segments),
    properties: Object.freeze(properties),
    proposed: admitted.proposed,
    review,
    unresolved: unresolvedCounts(admitted.changes),
  });
};

/** Project one detached document without requiring an editor runtime. */
export const projectAuthoredDocument = (
  document: EditorDocumentValue,
  options: Readonly<{
    projection: Exclude<AuthoredFormatProjection, 'markup'>;
  }>
): AuthoredDocumentProjection => {
  if (document.meta?.authored === undefined) {
    return Object.freeze({
      diagnostics: Object.freeze([]),
      document,
      review: document,
      unresolved: Object.freeze({ conflicted: 0, pending: 0 }),
    });
  }
  const admitted = admitAuthoredReviewDocument(document);
  const unresolved = unresolvedCounts(admitted.changes);

  return Object.freeze({
    diagnostics: authoredProjectionDiagnostics(options.projection, unresolved),
    document:
      options.projection === 'accepted' ? admitted.accepted : admitted.proposed,
    review: admitted.document,
    unresolved,
  });
};

/** Project a detached native review document, including visible markup facts. */
export const projectAuthoredReview = (
  document: EditorDocumentValue
): AuthoredReviewProjection => {
  if (document.meta?.authored === undefined) {
    return Object.freeze({
      accepted: document,
      changes: Object.freeze([]),
      diagnostics: Object.freeze([]),
      markup: Object.freeze({}),
      properties: Object.freeze([]),
      proposed: document,
      review: document,
      unresolved: Object.freeze({ conflicted: 0, pending: 0 }),
    });
  }
  return projectAuthoredReviewDocument(document);
};

/** Parse a detached document envelope. Installed editor schema validates it on load. */
export const parseAuthoredDocument = (data: string): EditorDocumentValue =>
  assertAuthoredDocumentValue(
    readEditorDocument(JSON.parse(data), (issue) => {
      throw new Error(getEditorDocumentShapeIssueMessage(issue));
    })
  );

/** Map a proposed-coordinate range through the exact review captured by a projection. */
export const projectAuthoredRange = (
  projection: AuthoredDocumentProjection,
  range: Range
): Range | null => {
  if (projection.document === projection.review) return range;
  const admitted = admitAuthoredReviewDocument(projection.review);

  return projectAuthoredDocumentRange(
    {
      mode: 'proposed',
      positions: admitted.positions.proposed,
      state: admitted.state,
      value: admitted.proposed,
    },
    {
      mode: 'accepted',
      positions: admitted.positions.accepted,
      state: admitted.state,
      value: admitted.accepted,
    },
    range
  );
};

/** Build one validated native review envelope from sparse imported revisions. */
export const createAuthoredReviewDocument = (input: {
  accepted: EditorDocumentValue;
  revisions: readonly AuthoredImportedRevision[];
}): EditorDocumentValue =>
  admitAuthoredReviewDocument(createAuthoredReviewCheckpoint(input)).document;
