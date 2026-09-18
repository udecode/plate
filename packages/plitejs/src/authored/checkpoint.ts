import { ChangeDraft } from '../core/change/builder';
import { DocumentChange } from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import type { JsonEditorValue } from '../core/change/tokens';
import { assertEditorDocumentShape } from '../core/document-shape';
import {
  getCompiledEditorSchemaFromApi,
  type InternalEditorSchemaApi,
} from '../core/editor-schema';
import { snapshotEditorJsonValue } from '../core/value-codec';
import type { EditorDocumentValue } from '../interfaces/editor';
import type { AuthoredImportedRevision } from './format';
import { authoredPositionSpans } from './positions';
import { readRecord, records } from './record-tree';
import {
  authoredState,
  emptyAuthoredState,
  reduceAuthoredOperation,
  type AuthoredEdit,
  type AuthoredState,
} from './state';
import {
  authoredRootNodes,
  captureAuthoredChange,
  createAuthoredPositionRoots,
  type AuthoredPositionRoots,
} from './steps';

type AuthoredDocumentAssertion = (document: EditorDocumentValue) => void;

export type AuthoredDocumentAdmissionOptions = Readonly<{
  /** Additional compiled target checks, such as target-owned element IDs. */
  assertTarget?: AuthoredDocumentAssertion;
  /** Detached schema capability compiled for the destination document. */
  schema?: InternalEditorSchemaApi;
}>;

export type AuthoredReviewCheckpointInput = AuthoredDocumentAdmissionOptions &
  Readonly<{
    accepted: EditorDocumentValue;
    documentId?: string;
    replica?: string;
    revisions: readonly AuthoredImportedRevision[];
  }>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isDocumentNode = (value: unknown): boolean => {
  if (!isRecord(value)) return false;
  if (typeof value.text === 'string') return !Object.hasOwn(value, 'children');

  return (
    typeof value.type === 'string' &&
    Array.isArray(value.children) &&
    value.children.every(isDocumentNode)
  );
};

export const assertAuthoredDocumentValue = (
  value: unknown
): EditorDocumentValue => {
  const invalid = (): never => {
    throw new Error('Authored JSON must contain a valid document envelope.');
  };

  assertEditorDocumentShape(value, () => invalid());

  if (
    !value.children.every(isDocumentNode) ||
    Object.values(value.roots ?? {}).some((root) => !root.every(isDocumentNode))
  ) {
    invalid();
  }

  return value as EditorDocumentValue;
};

const ownDocument = (value: unknown, label: string): EditorDocumentValue =>
  assertAuthoredDocumentValue(snapshotEditorJsonValue(value, label));

const assertImportedRevision = (revision: AuthoredImportedRevision) => {
  if (!revision.id || !revision.authorId) {
    throw new Error('Imported authored revisions require stable identity.');
  }
  if (!Number.isSafeInteger(revision.createdAt) || revision.createdAt < 0) {
    throw new Error('Imported authored revision time is invalid.');
  }
  if (!DocumentChange.isDocumentChange(revision.change)) {
    throw new Error('Imported authored revision change is invalid.');
  }
};

const targetAssertion = (
  options: AuthoredDocumentAdmissionOptions
): AuthoredDocumentAssertion => {
  const compiled = options.schema
    ? getCompiledEditorSchemaFromApi(options.schema)
    : undefined;

  if (options.schema && !compiled) {
    throw new Error(
      'Detached authored schema must bind compiled facts in the same source runtime.'
    );
  }

  return (document) => {
    options.schema?.assertDocument(document);
    options.assertTarget?.(document);
  };
};

const documentContent = (value: EditorDocumentValue): EditorDocumentValue =>
  Object.freeze({
    children: value.children,
    ...(value.roots ? { roots: value.roots } : {}),
  });

const publicProjection = (
  document: EditorDocumentValue,
  projected: EditorDocumentValue
): EditorDocumentValue => {
  const { authored: _authored, ...meta } = document.meta ?? {};

  return snapshotEditorJsonValue(
    {
      ...documentContent(projected),
      ...(Object.keys(meta).length ? { meta } : {}),
    },
    'Authored document projection'
  );
};

const assertPositions = (
  positions: AuthoredPositionRoots,
  document: JsonEditorValue,
  label: string
) => {
  const present = new Set(['main', ...Object.keys(document.roots ?? {})]);

  for (const [root, current] of records(positions)) {
    if (current.present !== present.has(root)) {
      throw new Error(
        `Authored checkpoint does not match the ${label} document roots.`
      );
    }
    if (
      current.present &&
      (current.positions.root?.length ?? 0) !==
        DocumentIndex.fromValue(authoredRootNodes(document, root)).length
    ) {
      throw new Error(
        `Authored checkpoint does not match the ${label} content.`
      );
    }
    present.delete(root);
  }
  if (present.size > 0) {
    throw new Error(`Missing authored ${label} positions.`);
  }
};

type TextRun = Readonly<{ from: number; text: string; to: number }>;

const textByOrigin = (
  document: JsonEditorValue,
  positions: AuthoredPositionRoots
) => {
  const origins = new Map<string, TextRun[]>();

  for (const [root, current] of records(positions)) {
    if (!current.present) continue;
    const index = DocumentIndex.fromValue(authoredRootNodes(document, root));

    for (const { from, span, to } of authoredPositionSpans(current.positions)) {
      let { offset } = span;

      for (const token of index.slice(from, to).tokens) {
        const length = token.kind === 'text' ? token.text.length : 1;

        if (token.kind === 'text') {
          const runs = origins.get(span.origin) ?? [];

          if (!origins.has(span.origin)) origins.set(span.origin, runs);
          runs.push({ from: offset, text: token.text, to: offset + length });
        }
        offset += length;
      }
    }
  }
  for (const runs of origins.values()) {
    runs.sort((left, right) => left.from - right.from);
  }

  return origins;
};

const assertSharedOriginText = (
  accepted: JsonEditorValue,
  acceptedPositions: AuthoredPositionRoots,
  proposed: JsonEditorValue,
  proposedPositions: AuthoredPositionRoots
) => {
  const acceptedByOrigin = textByOrigin(accepted, acceptedPositions);
  const proposedByOrigin = textByOrigin(proposed, proposedPositions);

  for (const [origin, acceptedRuns] of acceptedByOrigin) {
    const proposedRuns = proposedByOrigin.get(origin);

    if (!proposedRuns) continue;
    let start = 0;

    for (const acceptedRun of acceptedRuns) {
      while (
        start < proposedRuns.length &&
        proposedRuns[start].to <= acceptedRun.from
      ) {
        start += 1;
      }
      for (
        let index = start;
        index < proposedRuns.length &&
        proposedRuns[index].from < acceptedRun.to;
        index += 1
      ) {
        const proposedRun = proposedRuns[index];
        const from = Math.max(acceptedRun.from, proposedRun.from);
        const to = Math.min(acceptedRun.to, proposedRun.to);

        if (
          from < to &&
          acceptedRun.text.slice(
            from - acceptedRun.from,
            to - acceptedRun.from
          ) !==
            proposedRun.text.slice(
              from - proposedRun.from,
              to - proposedRun.from
            )
        ) {
          throw new Error(
            'Authored checkpoint shared-origin text contradicts accepted content.'
          );
        }
      }
    }
  }
};

/**
 * Validate and normalize a decoded current checkpoint without replaying pending
 * operations or materializing retained operation bodies.
 *
 * @internal
 */
export const normalizeAuthoredReviewDocument = (
  document: EditorDocumentValue,
  state: AuthoredState,
  options: AuthoredDocumentAdmissionOptions = {}
) => {
  const owned = ownDocument(document, 'Authored document');
  const assertTarget = targetAssertion(options);
  const acceptedDocument = documentContent(owned);
  const accepted = acceptedDocument as JsonEditorValue;

  assertTarget(acceptedDocument);
  if (!state.acceptedPositions && state.operations) {
    throw new Error('Missing authored accepted-position checkpoint.');
  }
  const acceptedPositions =
    state.acceptedPositions ??
    createAuthoredPositionRoots(accepted, state.documentId);

  assertPositions(acceptedPositions, accepted, 'accepted');
  if (
    Boolean(state.projected) !== Boolean(state.projectedPositions) ||
    (state.operations && !state.projected)
  ) {
    throw new Error(
      'Missing authored proposed checkpoint; explicit historical conversion is required.'
    );
  }
  const proposed = state.projected ?? accepted;
  const proposedPositions = state.projectedPositions ?? acceptedPositions;
  const proposedDocument = assertAuthoredDocumentValue(proposed);

  assertTarget(proposedDocument);
  assertPositions(proposedPositions, proposed, 'proposed');
  assertSharedOriginText(
    accepted,
    acceptedPositions,
    proposed,
    proposedPositions
  );

  return Object.freeze({
    accepted: publicProjection(owned, acceptedDocument),
    changes: Object.freeze(
      [...records(state.changes)].map(([, change]) => change)
    ),
    document: snapshotEditorJsonValue(
      {
        ...owned,
        meta: { ...owned.meta, authored: authoredState.serialize(state) },
      },
      'Authored document checkpoint'
    ),
    positions: Object.freeze({
      accepted: acceptedPositions,
      proposed: proposedPositions,
    }),
    proposed: publicProjection(owned, proposedDocument),
    state,
  });
};

/**
 * Admit a native current authored checkpoint directly from immutable document
 * state. Current pending operations are not replayed.
 *
 * @internal
 */
export const admitAuthoredReviewDocument = (
  document: EditorDocumentValue,
  options: AuthoredDocumentAdmissionOptions = {}
) => {
  const owned = ownDocument(document, 'Authored document');
  const metadata = owned.meta?.authored;

  if (metadata === undefined) {
    throw new Error('Expected a native authored checkpoint.');
  }

  return normalizeAuthoredReviewDocument(
    owned,
    authoredState.deserialize(metadata),
    options
  );
};

/**
 * Construct native authored history once. The caller owns final target admission.
 *
 * @internal
 */
export const createAuthoredReviewCheckpoint = (
  input: AuthoredReviewCheckpointInput
): EditorDocumentValue => {
  const accepted = ownDocument(input.accepted, 'Accepted authored document');
  const assertTarget = targetAssertion(input);

  assertTarget(accepted);
  if (accepted.meta && Object.hasOwn(accepted.meta, 'authored')) {
    throw new Error(
      'Authored import expects accepted content; admit native authored input directly.'
    );
  }
  input.revisions.forEach(assertImportedRevision);
  if (input.revisions.length === 0) {
    throw new Error('Expected at least one imported authored revision.');
  }
  if (
    new Set(input.revisions.map(({ id }) => id)).size !== input.revisions.length
  ) {
    throw new Error('Imported authored revision identities must be unique.');
  }

  let state = emptyAuthoredState(input.documentId);
  const replica = input.replica ?? `import:${state.documentId}`;
  const acceptedContent = documentContent(accepted) as JsonEditorValue;
  const acceptedPositions = createAuthoredPositionRoots(
    acceptedContent,
    state.documentId
  );
  const compiledSchema = input.schema
    ? getCompiledEditorSchemaFromApi(input.schema)
    : undefined;
  let proposed = acceptedContent;
  let positions = acceptedPositions;

  for (const revision of input.revisions) {
    if (revision.change.empty) {
      throw new Error(`Imported authored revision "${revision.id}" is empty.`);
    }
    const sequence = (readRecord(state.vector, replica) ?? 0) + 1;
    const operationId = `${replica}:${sequence}`;
    const draft = new ChangeDraft(proposed);

    draft.apply(revision.change);
    const after = ownDocument(draft.value, 'Imported authored revision');

    assertTarget(after);
    if (Object.hasOwn(after, 'meta')) {
      throw new Error(
        'Imported authored revisions cannot change document metadata.'
      );
    }
    const captured = captureAuthoredChange({
      change: draft.change,
      changeId: revision.id,
      operationId,
      positions,
      schema: compiledSchema,
      state,
      steps: draft.steps,
      value: proposed,
    });
    const operation: AuthoredEdit = {
      authorId: revision.authorId,
      changeId: revision.id,
      clock: state.clock + 1,
      dependencies: captured.dependencies,
      id: operationId,
      inverseOf: null,
      kind: 'edit',
      parents: state.frontier,
      proposal: true,
      replica,
      seen: state.vector,
      sequence,
      steps: captured.steps,
      time: revision.createdAt,
    };

    state = reduceAuthoredOperation(state, operation);
    ({ positions } = captured);
    proposed = after;
  }

  state = snapshotEditorJsonValue(
    {
      ...state,
      acceptedPositions,
      projected: proposed,
      projectedPositions: positions,
    },
    'Authored checkpoint'
  );

  return snapshotEditorJsonValue(
    {
      ...accepted,
      meta: {
        ...accepted.meta,
        authored: authoredState.serialize(state),
      },
    },
    'Authored review document'
  );
};
