import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '@noble/hashes/utils';

import type { DocumentChangeJson } from '../core/change/document-change';
import { DocumentChange } from '../core/change/document-change';
import { jsonEqual, type JsonEditorValue } from '../core/change/tokens';
import {
  canonicalJsonKey,
  type PropertyDeltaJson,
  type PropertyModificationJson,
} from '../core/change/transform';
import { freezeOwnedJsonValue, isOwnedJsonValue } from '../core/clone';
import { ContentSlice } from '../core/content-slice';
import { profileCoreDuration } from '../core/profiling';
import { defineStateField } from '../core/state-field';
import { defineEffect } from '../core/transaction-values';
import {
  defineValueCodec,
  ownCurrentEditorValueCodecInput,
  snapshotEditorJsonValue,
} from '../core/value-codec';
import type { EditorEffect } from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import {
  matchingAuthoredIntervals,
  writeAuthoredInterval,
  type AuthoredIntervals,
} from './intervals';
import {
  authoredPositionSpans,
  decodeAuthoredPosition,
  type AuthoredPosition,
  type AuthoredSpan,
} from './positions';
import {
  decodeAuthoredPositionRoots,
  decodeAuthoredSpan,
  decodeFlatAuthoredPositionRoots,
  encodeFlatAuthoredPositionRoots,
} from './positions-codec';
import {
  decodeRecordTree,
  readRecord,
  recordTreeFromSortedEntries,
  records,
  removeRecord,
  writeRecord,
  type RecordTree,
} from './record-tree';
import {
  decodeAuthoredRetainedData,
  readAuthoredRetainedContent,
  readAuthoredTextBoundary,
} from './retained';
import type {
  AuthoredPositionRoots,
  AuthoredRootTarget,
  AuthoredStep,
  AuthoredTarget,
} from './steps';
import type {
  AuthoredChangeKind,
  AuthoredQuery,
  AuthoredSelection,
  AuthoredStatus,
} from './types';

type AuthoredStamp = Readonly<{
  authorId: string;
  clock: number;
  id: string;
  parents: readonly string[];
  replica: string;
  seen: RecordTree<number> | null;
  sequence: number;
  time: number;
}>;

export type AuthoredEditIdentity = AuthoredStamp &
  Readonly<{
    changeId: string;
    dependencies: readonly string[];
    inverseOf: string | null;
    kind: 'edit';
    proposal: boolean;
    retained?: string;
  }>;

export type AuthoredTargetFacts = AuthoredTarget &
  Readonly<{
    length: number;
    properties: PropertyDeltaJson | null;
    textBoundary: ReturnType<typeof readAuthoredTextBoundary>;
  }>;
export type AuthoredStepFacts = Readonly<{
  rootTargets: readonly AuthoredRootTarget[];
  targets: readonly AuthoredTargetFacts[];
}>;
export type AuthoredEdit = AuthoredEditIdentity &
  Readonly<{
    steps: readonly AuthoredStep[];
  }>;
export type AuthoredCompactEdit = AuthoredEditIdentity &
  Readonly<{
    content: Readonly<{
      digest: string;
      kind: AuthoredChangeKind;
      steps: readonly AuthoredStepFacts[];
    }>;
  }>;
export type AuthoredContribution = AuthoredEdit | AuthoredCompactEdit;
export type AuthoredContributionStep = AuthoredStep | AuthoredStepFacts;

export const authoredContributionSteps = (
  operation: AuthoredContribution
): readonly AuthoredContributionStep[] =>
  operation.retained
    ? []
    : 'steps' in operation
      ? operation.steps
      : operation.content.steps.length
        ? operation.content.steps
        : materializeAuthoredEdit(operation).steps;

export const hasAuthoredContent = (
  operation: AuthoredOperation
): operation is AuthoredEdit =>
  operation.kind === 'edit' &&
  ('steps' in operation || AUTHORED_EDIT_BODIES.has(operation));

export type AuthoredReview = AuthoredStamp &
  Readonly<{
    action: 'accept' | 'reject';
    selection: AuthoredSelection;
  }> &
  (
    | Readonly<{ kind: 'decide' | 'resolve'; undoOf: null }>
    | Readonly<{ kind: 'undo'; undoOf: string }>
  );

export type AuthoredOperation = AuthoredContribution | AuthoredReview;

type AuthoredOperations = Readonly<{
  checkpoint: Readonly<{
    accepted: JsonEditorValue;
    positions: AuthoredPositionRoots | null;
    state: AuthoredState | null;
  }> | null;
  documentId: string;
  operations: readonly AuthoredOperation[];
  retained: readonly AuthoredEdit[];
}>;

export const authoredOriginOperation = (
  state: AuthoredState,
  origin: string
) => {
  for (
    let end = origin.lastIndexOf(':');
    end > 0;
    end = origin.lastIndexOf(':', end - 1)
  ) {
    const operation = readRecord(state.operations, origin.slice(0, end));
    if (operation?.kind === 'edit') return operation;
  }
  return null;
};

export type AuthoredRecord = Readonly<{
  authorId: string;
  createdAt: number;
  dependencies: readonly string[];
  heads: readonly string[];
  id: string;
  kind: AuthoredChangeKind;
  operations: RecordTree<string> | null;
  reviews: RecordTree<string> | null;
  revision: number;
  status: AuthoredStatus;
  updatedAt: number;
}>;

export type AuthoredState = Readonly<{
  acceptedPositions: AuthoredPositionRoots;
  changes: RecordTree<AuthoredRecord> | null;
  clock: number;
  documentId: string;
  frontier: readonly string[];
  operations: RecordTree<AuthoredOperation> | null;
  order: RecordTree<string> | null;
  projected: JsonEditorValue | null;
  projectedPositions: AuthoredPositionRoots;
  vector: RecordTree<number> | null;
}>;

const LEGACY_PROJECTION_CHECKPOINTS = new WeakMap<
  AuthoredState,
  Readonly<{
    projected: JsonEditorValue;
    projectedPositions: AuthoredPositionRoots;
  }>
>();
const AUTHORED_STATE_ENCODINGS = new WeakMap<AuthoredState, object>();

/** @internal */
export const checksumAuthoredPayload = (value: string) => {
  let first = 0x81_1c_9d_c5;
  let second = 0x9e_37_79_b9;
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01_00_01_93);
    second = Math.imul(second ^ code, 0x85_eb_ca_6b);
  }

  return `${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0)
    .toString(16)
    .padStart(8, '0')}`;
};

export const rememberLegacyAuthoredProjection = (
  state: AuthoredState,
  checkpoint: Readonly<{
    projected: JsonEditorValue;
    projectedPositions: AuthoredPositionRoots;
  }>
) => {
  if (state.operations && !state.projectedPositions) {
    LEGACY_PROJECTION_CHECKPOINTS.set(state, checkpoint);
  }
};

const record = (
  value: unknown,
  keys?: readonly string[]
): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid authored data.');
  }
  if (
    keys &&
    (Object.keys(value).length !== keys.length ||
      Object.keys(value).some((key) => !keys.includes(key)))
  ) {
    throw new Error('Invalid authored data fields.');
  }
  return value as Record<string, unknown>;
};

const decodeId = (value: unknown): string => {
  if (typeof value !== 'string' || !value || value.includes('\u0000')) {
    throw new Error('Invalid authored identity.');
  }
  return value;
};

const integer = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error('Invalid authored clock.');
  }
  return value;
};

const decodeIds = (value: unknown): readonly string[] => {
  if (!Array.isArray(value)) throw new Error('Invalid authored identities.');
  const result = value.map(decodeId);
  if (new Set(result).size !== result.length) {
    throw new Error('Duplicate authored identity.');
  }
  return result;
};

const decodeChange = (value: unknown): DocumentChangeJson => {
  const data = record(value);
  if (data.version !== 3) {
    throw new Error('Unsupported authored document change.');
  }
  return DocumentChange.fromJSON(data as DocumentChangeJson).toJSON();
};

const decodeTargets = (
  input: unknown,
  requireContent = true
): readonly AuthoredTarget[] => {
  if (!Array.isArray(input)) throw new Error('Invalid authored targets.');
  return input.map((value) => {
    const data = record(value, [
      'association',
      'afterFrom',
      'afterTo',
      'from',
      'inserted',
      'removed',
      'retained',
      'root',
      'section',
      'to',
    ]);
    if (
      data.association !== null &&
      data.association !== 'left' &&
      data.association !== 'right'
    ) {
      throw new Error('Invalid authored insertion association.');
    }
    if (!Array.isArray(data.removed) || !Array.isArray(data.inserted)) {
      throw new Error('Invalid authored retained spans.');
    }
    const decoded = snapshotEditorJsonValue(
      {
        association: data.association,
        afterFrom: decodeAuthoredPosition(data.afterFrom),
        afterTo: decodeAuthoredPosition(data.afterTo),
        from: decodeAuthoredPosition(data.from),
        inserted: data.inserted.map(decodeAuthoredSpan),
        removed: data.removed.map(decodeAuthoredSpan),
        retained: decodeAuthoredRetainedData(data.retained),
        root: decodeId(data.root),
        section: integer(data.section),
        to: decodeAuthoredPosition(data.to),
      } satisfies AuthoredTarget,
      'Authored target'
    );
    const retained = readAuthoredRetainedContent(decoded);
    if (requireContent && !!retained !== decoded.removed.length > 0) {
      throw new Error('Authored target is missing its retained content.');
    }
    if (retained && retained.kind !== 'properties') {
      const removed = [
        ...authoredPositionSpans(
          retained.positions,
          retained.from,
          retained.to
        ),
      ].map((entry) => ({
        ...entry.span,
        offset: entry.span.offset + Math.max(retained.from - entry.from, 0),
        length:
          Math.min(retained.to, entry.to) - Math.max(retained.from, entry.from),
      }));
      if (!jsonEqual(removed, decoded.removed)) {
        throw new Error('Authored retained content does not match its target.');
      }
    }
    return decoded;
  });
};

const decodeRootTargets = (input: unknown): readonly AuthoredRootTarget[] => {
  if (!Array.isArray(input)) throw new Error('Invalid authored root targets.');
  const lifecycle = (value: unknown) => {
    if (value === null) return null;
    const data = record(value, ['birth', 'present']);
    if (typeof data.present !== 'boolean') {
      throw new Error('Invalid authored root presence.');
    }
    return {
      birth: data.birth === null ? null : decodeId(data.birth),
      present: data.present,
    };
  };
  return input.map((value) => {
    const data = record(value, ['root', 'before', 'after']);
    return {
      root: decodeId(data.root),
      before: lifecycle(data.before),
      after: lifecycle(data.after),
    };
  });
};

const decodeEditIdentity = (
  data: Record<string, unknown>
): AuthoredEditIdentity => {
  if (
    data.kind !== 'edit' ||
    typeof data.proposal !== 'boolean' ||
    data.clock === 0
  ) {
    throw new Error('Invalid authored operation.');
  }
  return {
    authorId: decodeId(data.authorId),
    changeId: decodeId(data.changeId),
    clock: integer(data.clock),
    dependencies: decodeIds(data.dependencies),
    id: decodeId(data.id),
    inverseOf: data.inverseOf === null ? null : decodeId(data.inverseOf),
    kind: 'edit',
    parents: decodeIds(data.parents),
    proposal: data.proposal,
    ...(data.retained !== undefined
      ? { retained: decodeId(data.retained) }
      : {}),
    replica: decodeId(data.replica),
    seen: decodeRecordTree(data.seen, integer),
    sequence: integer(data.sequence),
    time: integer(data.time),
  };
};

const editCodec = defineValueCodec<AuthoredEdit>({
  version: 1,
  decode(value) {
    const data = record(value, [
      'authorId',
      'changeId',
      'clock',
      'dependencies',
      'id',
      'inverseOf',
      'kind',
      'parents',
      'proposal',
      'replica',
      'seen',
      'sequence',
      'steps',
      'time',
      ...(value && typeof value === 'object' && 'retained' in value
        ? ['retained']
        : []),
    ]);
    if (!Array.isArray(data.steps) || data.steps.length === 0) {
      throw new Error('Invalid authored operation.');
    }
    return snapshotEditorJsonValue(
      {
        ...decodeEditIdentity(data),
        steps: data.steps.map((item) => {
          const step = record(item, ['forward', 'rootTargets', 'targets']);
          return {
            forward: decodeChange(step.forward),
            rootTargets: decodeRootTargets(step.rootTargets),
            targets: decodeTargets(step.targets),
          };
        }),
      },
      'Authored operation'
    );
  },
  encode: (value) => value,
});

export const decodeAuthoredEdit = (value: unknown) => editCodec.decode(value);

const decodeCompactEdit = (input: unknown): AuthoredCompactEdit => {
  const data = record(input, [
    'authorId',
    'changeId',
    'clock',
    'content',
    'dependencies',
    'id',
    'inverseOf',
    'kind',
    'parents',
    'proposal',
    'replica',
    'seen',
    'sequence',
    'time',
    ...(input && typeof input === 'object' && 'retained' in input
      ? ['retained']
      : []),
  ]);
  const content = record(data.content, ['digest', 'kind', 'steps']);
  if (
    typeof content.digest !== 'string' ||
    !/^[a-f0-9]{64}$/.test(content.digest) ||
    !['delete', 'format', 'insert', 'mixed', 'structure'].includes(
      String(content.kind)
    ) ||
    !Array.isArray(content.steps) ||
    !content.steps.length
  ) {
    throw new Error('Invalid authored content footprint.');
  }
  const steps = content.steps.map((stepValue) => {
    const step = record(stepValue, ['rootTargets', 'targets']);
    if (!Array.isArray(step.targets)) {
      throw new Error('Invalid authored target footprint.');
    }
    const targets = step.targets.map((targetValue) => {
      const targetData = record(targetValue);
      const { length, properties, textBoundary, ...identity } = targetData;
      const target = getDefined(decodeTargets([identity], false)[0]);
      if (target.retained && target.retained.kind !== 'properties') {
        throw new Error(
          'A compact authored target cannot contain a retained body.'
        );
      }
      const modifications =
        properties === null
          ? null
          : getDefined(
              decodeChange({ version: 3, primary: [{ length: 1, properties }] })
                .primary?.[0].properties
            );
      let boundary: AuthoredTargetFacts['textBoundary'] = null;
      if (textBoundary !== null) {
        const boundaryData = record(textBoundary, ['position', 'spans']);
        if (!Array.isArray(boundaryData.spans)) {
          throw new Error('Invalid authored text boundary.');
        }
        boundary = {
          position: getDefined(
            decodeAuthoredPosition({ left: boundaryData.position, right: null })
              .left
          ),
          spans: boundaryData.spans.map(decodeAuthoredSpan),
        };
      }
      return {
        ...target,
        length: integer(length),
        properties: modifications,
        textBoundary: boundary,
      };
    });
    return { rootTargets: decodeRootTargets(step.rootTargets), targets };
  });
  return snapshotEditorJsonValue(
    {
      ...decodeEditIdentity(data),
      content: {
        digest: content.digest,
        kind: content.kind as AuthoredChangeKind,
        steps,
      },
    },
    'Authored content footprint'
  );
};

const operationCodec = defineValueCodec<AuthoredOperation>({
  version: 1,
  encode: (value) => value,
  decode(input) {
    if (record(input).kind === 'edit') {
      return Object.hasOwn(record(input), 'content')
        ? decodeCompactEdit(input)
        : editCodec.decode(input);
    }
    const data = record(input, [
      'action',
      'authorId',
      'clock',
      'id',
      'kind',
      'parents',
      'replica',
      'seen',
      'selection',
      'sequence',
      'time',
      'undoOf',
    ]);
    if (
      (data.kind !== 'decide' &&
        data.kind !== 'resolve' &&
        data.kind !== 'undo') ||
      (data.action !== 'accept' && data.action !== 'reject') ||
      (data.kind === 'undo'
        ? typeof data.undoOf !== 'string'
        : data.undoOf !== null) ||
      data.clock === 0
    ) {
      throw new Error('Invalid authored review.');
    }
    const selection = record(data.selection, ['changes', 'documentId']);
    if (!Array.isArray(selection.changes)) {
      throw new Error('Invalid authored review selection.');
    }
    return snapshotEditorJsonValue(
      {
        action: data.action,
        authorId: decodeId(data.authorId),
        clock: integer(data.clock),
        id: decodeId(data.id),
        parents: decodeIds(data.parents),
        replica: decodeId(data.replica),
        seen: decodeRecordTree(data.seen, integer),
        sequence: integer(data.sequence),
        time: integer(data.time),
        ...(data.kind === 'undo'
          ? { kind: data.kind, undoOf: decodeId(data.undoOf) }
          : { kind: data.kind, undoOf: null }),
        selection: {
          documentId: decodeId(selection.documentId),
          changes: selection.changes.map((value) => {
            const selected = record(value, ['heads', 'id', 'revision']);
            return {
              heads: decodeIds(selected.heads),
              id: decodeId(selected.id),
              revision: integer(selected.revision),
            };
          }),
        },
      },
      'Authored review'
    );
  },
});

const checkpointTuple = (
  input: unknown,
  length: number,
  label: string
): readonly unknown[] => {
  if (!Array.isArray(input) || input.length !== length) {
    throw new Error(`Invalid authored ${label}.`);
  }
  return input;
};

const encodeCheckpointPosition = (position: AuthoredPosition) =>
  freezeOwnedJsonValue([
    position.left &&
      freezeOwnedJsonValue([position.left.origin, position.left.offset]),
    position.right &&
      freezeOwnedJsonValue([position.right.origin, position.right.offset]),
  ]);

const decodeCheckpointPosition = (input: unknown): AuthoredPosition => {
  const value = checkpointTuple(input, 2, 'position');
  const endpoint = (candidate: unknown) => {
    if (candidate === null) return null;
    const tuple = checkpointTuple(candidate, 2, 'position endpoint');
    return { origin: decodeId(tuple[0]), offset: integer(tuple[1]) };
  };
  return snapshotEditorJsonValue(
    { left: endpoint(value[0]), right: endpoint(value[1]) },
    'Authored position'
  );
};

const encodeCheckpointSpan = (span: AuthoredSpan) =>
  freezeOwnedJsonValue([
    span.birth,
    span.length,
    span.offset,
    span.origin,
    span.placement,
    span.properties,
  ]);

const decodeCheckpointSpan = (input: unknown): AuthoredSpan => {
  const value = checkpointTuple(input, 6, 'position span');
  return decodeAuthoredSpan({
    birth: value[0],
    length: value[1],
    offset: value[2],
    origin: value[3],
    placement: value[4],
    properties: value[5],
  });
};

const encodeCheckpointTarget = (target: AuthoredTarget) =>
  freezeOwnedJsonValue([
    target.association,
    encodeCheckpointPosition(target.afterFrom),
    encodeCheckpointPosition(target.afterTo),
    encodeCheckpointPosition(target.from),
    freezeOwnedJsonValue(target.inserted.map(encodeCheckpointSpan)),
    freezeOwnedJsonValue(target.removed.map(encodeCheckpointSpan)),
    target.retained,
    target.root,
    target.section,
    encodeCheckpointPosition(target.to),
  ]);

const decodeCheckpointTarget = (input: unknown): AuthoredTarget => {
  const value = checkpointTuple(input, 10, 'target');
  if (!Array.isArray(value[4]) || !Array.isArray(value[5])) {
    throw new Error('Invalid authored checkpoint target spans.');
  }
  return getDefined(
    decodeTargets([
      {
        association: value[0],
        afterFrom: decodeCheckpointPosition(value[1]),
        afterTo: decodeCheckpointPosition(value[2]),
        from: decodeCheckpointPosition(value[3]),
        inserted: value[4].map(decodeCheckpointSpan),
        removed: value[5].map(decodeCheckpointSpan),
        retained: value[6],
        root: value[7],
        section: value[8],
        to: decodeCheckpointPosition(value[9]),
      },
    ])[0]
  );
};

const encodeCheckpointRootTarget = (target: AuthoredRootTarget) =>
  freezeOwnedJsonValue([
    target.root,
    target.before &&
      freezeOwnedJsonValue([target.before.birth, target.before.present]),
    target.after &&
      freezeOwnedJsonValue([target.after.birth, target.after.present]),
  ]);

const decodeCheckpointRootTarget = (input: unknown): AuthoredRootTarget => {
  const value = checkpointTuple(input, 3, 'root target');
  const lifecycle = (candidate: unknown) => {
    if (candidate === null) return null;
    const tuple = checkpointTuple(candidate, 2, 'root lifecycle');
    if (typeof tuple[1] !== 'boolean') {
      throw new Error('Invalid authored root presence.');
    }
    return {
      birth: tuple[0] === null ? null : decodeId(tuple[0]),
      present: tuple[1],
    };
  };
  return {
    root: decodeId(value[0]),
    before: lifecycle(value[1]),
    after: lifecycle(value[2]),
  };
};

const AUTHORED_EDIT_BODIES = new WeakMap<
  AuthoredCompactEdit,
  {
    decoded?: AuthoredEdit;
    input: readonly unknown[];
  }
>();
const AUTHORED_EDIT_ENCODINGS = new WeakMap<AuthoredEdit, readonly unknown[]>();

const encodeCheckpointSteps = (operation: AuthoredEdit) =>
  JSON.stringify(
    operation.steps.map((step) =>
      freezeOwnedJsonValue([
        step.forward,
        freezeOwnedJsonValue(step.rootTargets.map(encodeCheckpointRootTarget)),
        freezeOwnedJsonValue(step.targets.map(encodeCheckpointTarget)),
      ])
    )
  );

const encodeCheckpointEdit = (operation: AuthoredEdit) => {
  const previous = AUTHORED_EDIT_ENCODINGS.get(operation);
  if (previous) return previous;
  const steps = encodeCheckpointSteps(operation);
  const value = freezeOwnedJsonValue([
    0,
    operation.authorId,
    operation.changeId,
    operation.clock,
    operation.dependencies,
    operation.id,
    operation.inverseOf,
    operation.parents,
    operation.proposal,
    operation.replica,
    freezeOwnedJsonValue(
      [...records(operation.seen)].map(([replica, sequence]) =>
        freezeOwnedJsonValue([replica, sequence])
      )
    ),
    operation.sequence,
    operation.time,
    changeKind(operation),
    checksumAuthoredPayload(steps),
    steps,
  ]);
  AUTHORED_EDIT_ENCODINGS.set(operation, value);

  return value;
};

const encodeCheckpointOperation = (operation: AuthoredOperation) => {
  if (
    operation.kind !== 'edit' ||
    operation.retained ||
    !hasAuthoredContent(operation)
  ) {
    return freezeOwnedJsonValue([1, operation]);
  }
  if ('content' in operation) {
    const deferred = operation as unknown as AuthoredCompactEdit;
    const body = getDefined(AUTHORED_EDIT_BODIES.get(deferred));
    if (body.input.length === 16) return body.input;
    const steps = JSON.stringify(body.input[14]);
    const value = freezeOwnedJsonValue([
      ...body.input.slice(0, 14),
      checksumAuthoredPayload(steps),
      steps,
    ]);
    AUTHORED_EDIT_ENCODINGS.set(operation, value);

    return value;
  }
  return encodeCheckpointEdit(operation);
};

const decodeCheckpointEditIdentity = (
  value: readonly unknown[]
): AuthoredEditIdentity => {
  if (typeof value[8] !== 'boolean' || !Array.isArray(value[10])) {
    throw new Error('Invalid authored checkpoint edit.');
  }
  const causalEntries = value[10] as readonly unknown[];
  const clock = integer(value[3]);
  if (clock === 0) throw new Error('Invalid authored operation.');
  const seen = recordTreeFromSortedEntries<number>(
    causalEntries.map((entry) => {
      const pair = checkpointTuple(entry, 2, 'causal entry');
      return [decodeId(pair[0]), integer(pair[1])] as const;
    })
  );

  return {
    authorId: decodeId(value[1]),
    changeId: decodeId(value[2]),
    clock,
    dependencies: decodeIds(value[4]),
    id: decodeId(value[5]),
    inverseOf: value[6] === null ? null : decodeId(value[6]),
    kind: 'edit',
    parents: decodeIds(value[7]),
    proposal: value[8],
    replica: decodeId(value[9]),
    seen,
    sequence: integer(value[11]),
    time: integer(value[12]),
  };
};

const decodeDeferredCheckpointEdit = (
  input: readonly unknown[],
  encodedSteps: boolean
): AuthoredCompactEdit => {
  const value = checkpointTuple(
    input,
    encodedSteps ? 16 : 15,
    'checkpoint edit'
  );
  const identity = decodeCheckpointEditIdentity(value);
  const kind = value[13];
  if (
    !['delete', 'format', 'insert', 'mixed', 'structure'].includes(
      String(kind)
    ) ||
    (encodedSteps
      ? typeof value[14] !== 'string' ||
        !/^[a-f0-9]{16}$/.test(value[14]) ||
        typeof value[15] !== 'string' ||
        checksumAuthoredPayload(value[15]) !== value[14]
      : !Array.isArray(value[14]) || value[14].length === 0)
  ) {
    throw new Error('Invalid authored retained operation body.');
  }
  let operation: AuthoredCompactEdit = freezeOwnedJsonValue({
    ...identity,
    content: {
      digest:
        '0000000000000000000000000000000000000000000000000000000000000000',
      kind: kind as AuthoredChangeKind,
      steps: [],
    },
  } satisfies AuthoredCompactEdit);
  AUTHORED_EDIT_BODIES.set(operation, { input: value });
  if (kind !== 'insert' || identity.inverseOf) {
    const decoded = decodeFullCheckpointEdit(value);
    const compact = compactAuthoredEdit(decoded);
    operation = compact;
    AUTHORED_EDIT_BODIES.set(operation, { decoded, input: value });
  }

  return operation;
};

const decodeFullCheckpointEdit = (input: unknown): AuthoredEdit => {
  if (!Array.isArray(input) || (input.length !== 15 && input.length !== 16)) {
    throw new Error('Invalid authored checkpoint edit.');
  }
  const value = input;
  const identity = decodeCheckpointEditIdentity(value);
  let stepInputs: unknown = value[14];
  if (value.length === 16) {
    if (
      typeof value[14] !== 'string' ||
      !/^[a-f0-9]{16}$/.test(value[14]) ||
      typeof value[15] !== 'string' ||
      checksumAuthoredPayload(value[15]) !== value[14]
    ) {
      throw new Error('Invalid authored retained operation body.');
    }
    try {
      stepInputs = JSON.parse(value[15]);
    } catch {
      throw new Error('Invalid authored retained operation body.');
    }
  }
  if (!Array.isArray(stepInputs) || stepInputs.length === 0) {
    throw new Error('Invalid authored retained operation body.');
  }
  const steps: readonly AuthoredStep[] = stepInputs.map((stepInput) => {
    const step = checkpointTuple(stepInput, 3, 'step');
    if (!Array.isArray(step[1]) || !Array.isArray(step[2])) {
      throw new Error('Invalid authored checkpoint step.');
    }

    return {
      forward: decodeChange(step[0]),
      rootTargets: step[1].map(decodeCheckpointRootTarget),
      targets: step[2].map(decodeCheckpointTarget),
    };
  });

  return snapshotEditorJsonValue({ ...identity, steps }, 'Authored operation');
};

const decodeCheckpointOperation = (
  input: unknown,
  encodedSteps: boolean
): AuthoredOperation => {
  if (!Array.isArray(input) || ![0, 1].includes(input[0] as number)) {
    throw new Error('Invalid authored checkpoint operation.');
  }
  if (input[0] === 1) {
    const value = checkpointTuple(input, 2, 'checkpoint operation');
    return operationCodec.decode(value[1]);
  }
  return decodeDeferredCheckpointEdit(input, encodedSteps);
};

export const materializeAuthoredEdit = (
  operation: AuthoredContribution
): AuthoredEdit => {
  if ('steps' in operation) return operation;
  const body = AUTHORED_EDIT_BODIES.get(operation);
  if (!body) throw new Error('Missing authored contribution.');
  if (body.decoded) return body.decoded;
  const decoded = decodeFullCheckpointEdit(body.input);
  const compact = compactAuthoredEdit(decoded);
  const { content: decodedContent, ...decodedIdentity } = compact;
  const { content: storedContent, ...storedIdentity } = operation;
  const matches = operation.content.steps.length
    ? jsonEqual(
        {
          ...compact,
          content: { ...decodedContent, digest: storedContent.digest },
        },
        operation
      )
    : jsonEqual(decodedIdentity, storedIdentity) &&
      decodedContent.kind === storedContent.kind;
  if (!matches) {
    throw new Error('Authored retained content does not match its operation.');
  }
  body.decoded = decoded;

  return decoded;
};

export const authoredOrderKey = (clock: number, identity: string) =>
  `${String(clock).padStart(16, '0')}:${identity}`;

const encodeCheckpointRecord = (value: AuthoredRecord) =>
  freezeOwnedJsonValue([
    value.authorId,
    value.createdAt,
    value.dependencies,
    value.heads,
    value.id,
    value.kind,
    freezeOwnedJsonValue(
      [...records(value.operations)].map(([, identity]) => identity)
    ),
    freezeOwnedJsonValue(
      [...records(value.reviews)].map(([, identity]) => identity)
    ),
    value.revision,
    value.status,
    value.updatedAt,
  ]);

const decodeAuthoredRecord = (
  input: unknown,
  operations: AuthoredState['operations']
): AuthoredRecord => {
  const data = record(input, [
    'authorId',
    'createdAt',
    'dependencies',
    'heads',
    'id',
    'kind',
    'operations',
    'reviews',
    'revision',
    'status',
    'updatedAt',
  ]);
  if (
    !['delete', 'format', 'insert', 'mixed', 'structure'].includes(
      String(data.kind)
    ) ||
    !['accepted', 'conflicted', 'pending', 'rejected'].includes(
      String(data.status)
    ) ||
    !Array.isArray(data.operations) ||
    !Array.isArray(data.reviews)
  ) {
    throw new Error('Invalid authored change.');
  }
  return snapshotEditorJsonValue(
    {
      authorId: decodeId(data.authorId),
      createdAt: integer(data.createdAt),
      dependencies: decodeIds(data.dependencies),
      heads: decodeIds(data.heads),
      id: decodeId(data.id),
      kind: data.kind as AuthoredChangeKind,
      operations: recordTreeFromSortedEntries(
        data.operations.map((identity) => {
          const id = decodeId(identity);
          const operation = readRecord(operations, id);
          if (!operation || operation.kind !== 'edit') {
            throw new Error('Invalid authored contribution identity.');
          }
          return [authoredOrderKey(operation.clock, id), id] as const;
        })
      ),
      reviews: recordTreeFromSortedEntries(
        data.reviews.map((identity) => {
          const id = decodeId(identity);
          const operation = readRecord(operations, id);
          if (!operation || operation.kind === 'edit') {
            throw new Error('Invalid authored review identity.');
          }
          return [authoredOrderKey(operation.clock, id), id] as const;
        })
      ),
      revision: integer(data.revision),
      status: data.status as AuthoredStatus,
      updatedAt: integer(data.updatedAt),
    },
    'Authored change'
  );
};

const decodeCheckpointRecord = (
  input: unknown,
  operations: AuthoredState['operations']
) => {
  const value = checkpointTuple(input, 11, 'change');

  return decodeAuthoredRecord(
    {
      authorId: value[0],
      createdAt: value[1],
      dependencies: value[2],
      heads: value[3],
      id: value[4],
      kind: value[5],
      operations: value[6],
      reviews: value[7],
      revision: value[8],
      status: value[9],
      updatedAt: value[10],
    },
    operations
  );
};

const validateDirectAuthoredState = (state: AuthoredState) => {
  const frontier = new Set<string>();
  const referencedOperations = new Set<string>();
  const sequences = new Map<string, Set<number>>();
  let clock = 0;
  for (const [key, operation] of records(state.operations)) {
    if (key !== operation.id) {
      throw new Error('Invalid authored operation identity.');
    }
    if (operation.id !== `${operation.replica}:${operation.sequence}`) {
      throw new Error('Invalid authored replica sequence.');
    }
    const replica = sequences.get(operation.replica) ?? new Set<number>();
    if (replica.has(operation.sequence)) {
      throw new Error('Invalid authored replica sequence.');
    }
    replica.add(operation.sequence);
    sequences.set(operation.replica, replica);
    clock = Math.max(clock, operation.clock);
    frontier.add(operation.id);
  }
  for (const [, operation] of records(state.operations)) {
    const expectedSeen = new Map<string, number>();
    const observe = (replica: string, sequence: number) =>
      expectedSeen.set(
        replica,
        Math.max(expectedSeen.get(replica) ?? 0, sequence)
      );
    for (const parent of operation.parents) {
      const previous = readRecord(state.operations, parent);
      if (
        !previous ||
        previous.clock >= operation.clock ||
        !observesAuthoredOperation(operation, previous)
      ) {
        throw new Error('Missing authored operation prerequisite.');
      }
      for (const [replica, sequence] of records(previous.seen)) {
        observe(replica, sequence);
      }
      observe(previous.replica, previous.sequence);
      frontier.delete(parent);
    }
    if (
      expectedSeen.size !== (operation.seen?.count ?? 0) ||
      [...expectedSeen].some(
        ([replica, sequence]) =>
          readRecord(operation.seen, replica) !== sequence
      )
    ) {
      throw new Error('Invalid authored causal observation.');
    }
  }
  if (clock !== state.clock) throw new Error('Invalid authored clock.');
  if (
    frontier.size !== state.frontier.length ||
    state.frontier.some((identity) => !frontier.has(identity))
  ) {
    throw new Error('Invalid authored frontier.');
  }
  if (sequences.size !== (state.vector?.count ?? 0)) {
    throw new Error('Invalid authored vector.');
  }
  for (const [replica, entries] of sequences) {
    const sequence = readRecord(state.vector, replica);
    if (sequence !== entries.size) throw new Error('Invalid authored vector.');
    for (let index = 1; index <= sequence; index++) {
      if (!entries.has(index)) throw new Error('Invalid authored vector.');
    }
  }
  for (const [key, change] of records(state.changes)) {
    if (key !== change.id) throw new Error('Invalid authored change identity.');
    if (
      readRecord(state.order, authoredOrderKey(change.createdAt, change.id)) !==
      change.id
    ) {
      throw new Error('Invalid authored change order.');
    }
    const edits: AuthoredContribution[] = [];
    for (const [, operationId] of records(change.operations)) {
      const operation = readRecord(state.operations, operationId);
      if (
        !operation ||
        operation.kind !== 'edit' ||
        operation.changeId !== change.id
      ) {
        throw new Error('Invalid authored contribution identity.');
      }
      referencedOperations.add(operationId);
      edits.push(operation);
      if (
        (change.status === 'pending' || change.status === 'conflicted') &&
        !hasAuthoredContent(operation)
      ) {
        throw new Error('Invalid authored contribution identity.');
      }
    }
    const reviews: AuthoredReview[] = [];
    for (const [, operationId] of records(change.reviews)) {
      const operation = readRecord(state.operations, operationId);
      if (
        !operation ||
        operation.kind === 'edit' ||
        !operation.selection.changes.some(
          (selected) => selected.id === change.id
        )
      ) {
        throw new Error('Invalid authored review identity.');
      }
      referencedOperations.add(operationId);
      reviews.push(operation);
    }
    const first = edits[0];
    if (!first) throw new Error('Invalid authored change contribution.');
    const dependencies = [
      ...new Set(edits.flatMap((operation) => operation.dependencies)),
    ].sort();
    const kinds = new Set(
      edits.filter((operation) => !operation.retained).map(changeKind)
    );
    const heads = maximalAuthoredHeads(
      state.operations,
      [...edits, ...reviews].map((operation) => operation.id)
    );
    const updatedAt = Math.max(
      ...edits.map((operation) => operation.time),
      ...reviews.map((operation) => operation.time)
    );
    if (
      first.changeId !== change.id ||
      first.authorId !== change.authorId ||
      first.time !== change.createdAt ||
      edits.some(
        (operation, index) =>
          operation.authorId !== change.authorId ||
          (index > 0 && !operation.proposal)
      )
    ) {
      throw new Error('Invalid authored change attribution.');
    }
    if (
      dependencies.length !== change.dependencies.length ||
      dependencies.some(
        (dependency, index) => dependency !== change.dependencies[index]
      )
    ) {
      throw new Error('Invalid authored change dependencies.');
    }
    if (
      change.kind !== (kinds.size === 1 ? getDefined([...kinds][0]) : 'mixed')
    ) {
      throw new Error('Invalid authored change kind.');
    }
    if (
      heads.length !== change.heads.length ||
      heads.some((head, index) => head !== change.heads[index])
    ) {
      throw new Error('Invalid authored change heads.');
    }
    if (change.revision !== edits.length + reviews.length) {
      throw new Error('Invalid authored change revision.');
    }
    if (change.status !== authoredStatusFromHeads(state, heads, change.id)) {
      throw new Error('Invalid authored change status.');
    }
    if (change.updatedAt !== updatedAt) {
      throw new Error('Invalid authored change timestamp.');
    }
  }
  if ((state.order?.count ?? 0) !== (state.changes?.count ?? 0)) {
    throw new Error('Invalid authored change order.');
  }
  if (referencedOperations.size !== (state.operations?.count ?? 0)) {
    throw new Error('Invalid authored operation membership.');
  }
};

const decodeLegacyAuthoredState = (input: unknown): AuthoredState => {
  const data = record(input, ['acceptedPositions', 'documentId', 'operations']);
  const operations = decodeRecordTree(data.operations, operationCodec.decode);
  for (const [key, operation] of records(operations)) {
    if (key !== operation.id) {
      throw new Error('Invalid authored operation identity.');
    }
  }
  let state = snapshotEditorJsonValue(
    {
      ...emptyAuthoredState(decodeId(data.documentId)),
      operations,
    },
    'Authored checkpoint'
  );
  for (const operation of [...records(operations)]
    .map(([, storedOperation]) => storedOperation)
    .sort(
      (left, right) =>
        left.clock - right.clock || left.id.localeCompare(right.id)
    )) {
    state = applyAuthoredOperation(state, operation, true);
  }
  for (const [, change] of records(state.changes)) {
    if (change.status !== 'pending' && change.status !== 'conflicted') continue;
    for (const [, operationId] of records(change.operations)) {
      const operation = readRecord(state.operations, operationId);
      if (!operation || !hasAuthoredContent(operation)) {
        throw new Error('Invalid authored contribution identity.');
      }
    }
  }
  return snapshotEditorJsonValue(
    {
      ...state,
      acceptedPositions: decodeAuthoredPositionRoots(data.acceptedPositions),
    },
    'Authored checkpoint'
  );
};

const encodeDirectAuthoredState = (value: AuthoredState) => {
  const cached = AUTHORED_STATE_ENCODINGS.get(value);
  if (cached) return cached;
  const projection = value.projectedPositions
    ? {
        projected: getDefined(value.projected),
        projectedPositions: value.projectedPositions,
      }
    : LEGACY_PROJECTION_CHECKPOINTS.get(value);
  const encoded = freezeOwnedJsonValue({
    acceptedPositions: profileCoreDuration(
      'authored-checkpoint-encode-accepted-positions',
      () => encodeFlatAuthoredPositionRoots(value.acceptedPositions)
    ),
    changes: profileCoreDuration('authored-checkpoint-encode-changes', () =>
      freezeOwnedJsonValue(
        [...records(value.changes)].map(([, change]) =>
          encodeCheckpointRecord(change)
        )
      )
    ),
    documentId: value.documentId,
    operations: profileCoreDuration(
      'authored-checkpoint-encode-operations',
      () =>
        freezeOwnedJsonValue(
          [...records(value.operations)].map(([, operation]) =>
            encodeCheckpointOperation(operation)
          )
        )
    ),
    projected: projection?.projected ?? null,
    projectedPositions: profileCoreDuration(
      'authored-checkpoint-encode-projected-positions',
      () =>
        encodeFlatAuthoredPositionRoots(projection?.projectedPositions ?? null)
    ),
  });
  AUTHORED_STATE_ENCODINGS.set(value, encoded);

  return encoded;
};

const decodeDirectAuthoredState = (
  input: unknown,
  options: Readonly<{
    detachOperationBodies: boolean;
    encodedSteps: boolean;
    tupleChanges: boolean;
  }>
): AuthoredState => {
  const data = record(input, [
    'acceptedPositions',
    'changes',
    'documentId',
    'operations',
    'projected',
    'projectedPositions',
  ]);
  const operationData = data.operations;
  const changeData = data.changes;

  if (!Array.isArray(operationData) || !Array.isArray(changeData)) {
    throw new Error('Invalid authored checkpoint.');
  }
  const operationInputs: readonly unknown[] =
    options.detachOperationBodies && !isOwnedJsonValue(operationData)
      ? profileCoreDuration('authored-checkpoint-detach-operations', () =>
          structuredClone(operationData)
        )
      : operationData;
  const changeInputs: readonly unknown[] = changeData;
  const acceptedPositions = profileCoreDuration(
    'authored-checkpoint-accepted-positions',
    () => decodeFlatAuthoredPositionRoots(data.acceptedPositions)
  );
  const operations = profileCoreDuration('authored-checkpoint-operations', () =>
    recordTreeFromSortedEntries<AuthoredOperation>(
      operationInputs.map((operationInput) => {
        const operation = decodeCheckpointOperation(
          operationInput,
          options.encodedSteps
        );
        return [operation.id, operation] as const;
      })
    )
  );
  const changes = profileCoreDuration('authored-checkpoint-changes', () =>
    recordTreeFromSortedEntries<AuthoredRecord>(
      changeInputs.map((changeInput) => {
        const change = options.tupleChanges
          ? decodeCheckpointRecord(changeInput, operations)
          : decodeAuthoredRecord(changeInput, operations);
        return [change.id, change] as const;
      })
    )
  );
  const projectedPositions = profileCoreDuration(
    'authored-checkpoint-projected-positions',
    () => decodeFlatAuthoredPositionRoots(data.projectedPositions)
  );
  let clock = 0;
  const frontier = new Set<string>();
  const vector = new Map<string, number>();
  for (const [, operation] of records(operations)) {
    clock = Math.max(clock, operation.clock);
    frontier.add(operation.id);
    vector.set(
      operation.replica,
      Math.max(vector.get(operation.replica) ?? 0, operation.sequence)
    );
  }
  for (const [, operation] of records(operations)) {
    for (const parent of operation.parents) frontier.delete(parent);
  }
  const byKey = (
    left: readonly [string, unknown],
    right: readonly [string, unknown]
  ) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0);
  const state = snapshotEditorJsonValue(
    {
      acceptedPositions,
      changes,
      clock,
      documentId: decodeId(data.documentId),
      frontier: [...frontier].sort(),
      operations,
      order: recordTreeFromSortedEntries(
        [...records(changes)]
          .map(
            ([, change]) =>
              [
                authoredOrderKey(change.createdAt, change.id),
                change.id,
              ] as const
          )
          .sort(byKey)
      ),
      projected:
        data.projected === null
          ? null
          : decodeAcceptedCheckpoint(data.projected),
      projectedPositions,
      vector: recordTreeFromSortedEntries([...vector].sort(byKey)),
    },
    'Authored checkpoint'
  );
  profileCoreDuration('authored-checkpoint-validation', () =>
    validateDirectAuthoredState(state)
  );

  return state;
};

const decodeAuthoredStateV2 = (input: unknown): AuthoredState => {
  const encoded = record(input, ['digest', 'payload']);
  if (
    typeof encoded.digest !== 'string' ||
    !/^[a-f0-9]{16}$/.test(encoded.digest) ||
    typeof encoded.payload !== 'string' ||
    checksumAuthoredPayload(encoded.payload) !== encoded.digest
  ) {
    throw new Error('Invalid authored checkpoint.');
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(encoded.payload);
  } catch {
    throw new Error('Invalid authored checkpoint.');
  }

  return decodeDirectAuthoredState(parsed, {
    detachOperationBodies: false,
    encodedSteps: false,
    tupleChanges: false,
  });
};

const stateCodec = ownCurrentEditorValueCodecInput(
  defineValueCodec<AuthoredState>({
    version: 5,
    previousVersions: {
      4: (input) =>
        decodeDirectAuthoredState(input, {
          detachOperationBodies: true,
          encodedSteps: true,
          tupleChanges: true,
        }),
      1: decodeLegacyAuthoredState,
      2: decodeAuthoredStateV2,
      3: (input) =>
        decodeDirectAuthoredState(input, {
          detachOperationBodies: true,
          encodedSteps: false,
          tupleChanges: true,
        }),
    },
    encode: (value) =>
      profileCoreDuration('authored-checkpoint-encode', () =>
        encodeDirectAuthoredState(value)
      ),
    decode: (input) =>
      decodeDirectAuthoredState(input, {
        detachOperationBodies: true,
        encodedSteps: true,
        tupleChanges: true,
      }),
  })
);

const DECODED_OPERATIONS = new WeakSet<object>();

export const snapshotAuthoredOperationBatch = (
  value: AuthoredOperations,
  label: string
) => {
  const batch = snapshotEditorJsonValue(value, label);
  DECODED_OPERATIONS.add(batch);

  return batch;
};

const decodeAcceptedCheckpoint = (input: unknown): JsonEditorValue => {
  const value = record(input);
  if (
    !Object.hasOwn(value, 'children') ||
    Object.keys(value).some((key) => key !== 'children' && key !== 'roots')
  ) {
    throw new Error('Invalid authored accepted checkpoint.');
  }
  const root = (children: unknown) =>
    ContentSlice.fromJSON({ content: children, openStart: 0, openEnd: 0 })
      .content;
  return {
    children: root(value.children),
    ...(value.roots === undefined
      ? {}
      : {
          roots: Object.fromEntries(
            Object.entries(record(value.roots)).map(([key, children]) => [
              decodeId(key),
              root(children),
            ])
          ),
        }),
  };
};

const decodeLegacyAuthoredOperations = (input: unknown): AuthoredOperations => {
  const data = record(input, [
    'checkpoint',
    'documentId',
    'operations',
    'retained',
  ]);
  if (!Array.isArray(data.operations) || !Array.isArray(data.retained)) {
    throw new Error('Invalid authored operation batch.');
  }
  let checkpoint: AuthoredOperations['checkpoint'] = null;
  if (data.checkpoint !== null) {
    const saved = record(data.checkpoint, ['accepted', 'positions']);
    checkpoint = {
      accepted: decodeAcceptedCheckpoint(saved.accepted),
      positions: decodeAuthoredPositionRoots(saved.positions),
      state: null,
    };
  }
  return snapshotAuthoredOperationBatch(
    {
      checkpoint,
      documentId: decodeId(data.documentId),
      operations: data.operations.map(operationCodec.decode),
      retained: data.retained.map(editCodec.decode),
    },
    'Authored operations'
  );
};

const decodeDirectAuthoredOperations = (
  input: unknown,
  decodeState: (input: unknown) => AuthoredState
): AuthoredOperations => {
  if (input && typeof input === 'object' && DECODED_OPERATIONS.has(input)) {
    return input as AuthoredOperations;
  }
  const data = record(input, [
    'checkpoint',
    'documentId',
    'operations',
    'retained',
  ]);
  if (!Array.isArray(data.operations) || !Array.isArray(data.retained)) {
    throw new Error('Invalid authored operation batch.');
  }
  let checkpoint: AuthoredOperations['checkpoint'] = null;
  if (data.checkpoint !== null) {
    const saved = record(data.checkpoint, ['accepted', 'state']);
    const state = decodeState(saved.state);
    checkpoint = {
      accepted: decodeAcceptedCheckpoint(saved.accepted),
      positions: state.acceptedPositions,
      state,
    };
  }
  return snapshotAuthoredOperationBatch(
    {
      checkpoint,
      documentId: decodeId(data.documentId),
      operations: data.operations.map(operationCodec.decode),
      retained: data.retained.map(editCodec.decode),
    },
    'Authored operations'
  );
};

const operationsCodec = defineValueCodec<AuthoredOperations>({
  version: 4,
  previousVersions: {
    3: (input) => decodeDirectAuthoredOperations(input, stateCodec.decode),
    1: decodeLegacyAuthoredOperations,
    2: (input) => decodeDirectAuthoredOperations(input, decodeAuthoredStateV2),
  },
  encode: (value) =>
    snapshotEditorJsonValue(
      {
        ...value,
        checkpoint: value.checkpoint && {
          accepted: value.checkpoint.accepted,
          state: stateCodec.encode(getDefined(value.checkpoint.state)),
        },
      },
      'Authored operations'
    ),
  decode: (input) => decodeDirectAuthoredOperations(input, stateCodec.decode),
});

export const authoredOperationEffect = defineEffect<AuthoredOperations>({
  key: 'authored.operation',
  codec: operationsCodec,
  collab: 'shared',
  collabReplay: 'latest',
  collabSnapshot: (state) => {
    const snapshot = state.getField(authoredState);
    const value = state.value();
    return {
      checkpoint: {
        accepted: {
          children: value.children,
          ...(value.roots ? { roots: value.roots } : {}),
        },
        positions: snapshot.acceptedPositions,
        state: snapshot,
      },
      documentId: snapshot.documentId,
      retained: [],
      operations: [],
    };
  },
  history: 'skip',
});

export const readAuthoredOperationBatch = (
  effect: EditorEffect
): AuthoredOperations | undefined =>
  effect.type === authoredOperationEffect ? effect.value : undefined;

const changeKind = (operation: AuthoredContribution): AuthoredChangeKind => {
  if ('content' in operation) return operation.content.kind;
  if (
    operation.steps.some(
      (step) =>
        step.forward.createRoots?.length || step.forward.deleteRoots?.length
    )
  ) {
    return 'structure';
  }
  const kinds = new Set<AuthoredChangeKind>();
  for (const root of operation.steps.flatMap((step) => [
    step.forward.primary,
    ...Object.values(step.forward.roots ?? {}),
  ])) {
    for (const section of root ?? []) {
      if (section.properties) kinds.add('format');
      if (section.replacement) {
        if (section.replacement.some((token) => token.kind !== 'text')) {
          kinds.add('structure');
        } else {
          kinds.add(
            section.length
              ? section.replacement.length
                ? 'mixed'
                : 'delete'
              : 'insert'
          );
        }
      }
    }
  }
  return kinds.size === 1 ? [...kinds][0] : 'mixed';
};

const COMPACT_CONTENT = new WeakMap<AuthoredEdit, AuthoredCompactEdit>();
const compactAuthoredEdit = (operation: AuthoredEdit): AuthoredCompactEdit => {
  const cached = COMPACT_CONTENT.get(operation);
  if (cached) return cached;
  const { steps, ...identity } = operation;
  const compact = snapshotEditorJsonValue(
    {
      ...identity,
      content: {
        digest: bytesToHex(sha256(canonicalJsonKey(operation))),
        kind: changeKind(operation),
        steps: steps.map((step) => ({
          rootTargets: step.rootTargets,
          targets: step.targets.map((target) => {
            const section = getDefined(
              (target.root === 'main'
                ? step.forward.primary
                : step.forward.roots?.[target.root])?.[target.section]
            );
            return {
              ...target,
              retained:
                target.retained?.kind === 'properties' ? target.retained : null,
              length: section.length,
              properties: section.properties ?? null,
              textBoundary: readAuthoredTextBoundary(target, section),
            };
          }),
        })),
      },
    },
    'Authored content footprint'
  );
  COMPACT_CONTENT.set(operation, compact);
  return compact;
};

export const equalAuthoredOperations = (
  left: AuthoredOperation,
  right: AuthoredOperation
) => {
  if (left.kind !== 'edit' || right.kind !== 'edit') {
    return jsonEqual(left, right);
  }
  if (hasAuthoredContent(left) && hasAuthoredContent(right)) {
    return jsonEqual(
      materializeAuthoredEdit(left),
      materializeAuthoredEdit(right)
    );
  }
  return jsonEqual(
    hasAuthoredContent(left)
      ? 'content' in left
        ? left
        : compactAuthoredEdit(left)
      : left,
    hasAuthoredContent(right)
      ? 'content' in right
        ? right
        : compactAuthoredEdit(right)
      : right
  );
};

export const retainAuthoredContent = (
  state: AuthoredState,
  content: readonly AuthoredEdit[]
) => {
  let { operations } = state;
  for (const operation of content) {
    const previous = readRecord(operations, operation.id);
    if (!previous) continue;
    if (!equalAuthoredOperations(previous, operation)) {
      throw new Error(
        'Authored retained content does not match its operation.'
      );
    }
    if (hasAuthoredContent(previous)) continue;
    operations = writeRecord(operations, operation.id, operation);
    const change = readRecord(state.changes, operation.changeId);
    if (change?.operations) RETAINED_OPERATIONS.delete(change.operations);
  }
  if (operations === state.operations) return state;
  const index = state.operations
    ? AUTHORED_INDEXES.get(state.operations)
    : undefined;
  if (index && operations) AUTHORED_INDEXES.set(operations, index);
  return snapshotEditorJsonValue(
    { ...state, operations },
    'Authored retained content'
  );
};

export const compactAuthoredContent = (
  state: AuthoredState,
  ids: Iterable<string>
) => {
  let { operations } = state;
  for (const id of ids) {
    const change = readRecord(state.changes, id);
    if (
      !change ||
      change.status === 'pending' ||
      change.status === 'conflicted'
    ) {
      continue;
    }
    for (const [, operationId] of records(change.operations)) {
      const operation = readRecord(operations, operationId);
      if (!operation || !hasAuthoredContent(operation)) continue;
      operations = writeRecord(
        operations,
        operationId,
        'content' in operation
          ? compactAuthoredEdit(materializeAuthoredEdit(operation))
          : compactAuthoredEdit(operation)
      );
    }
    if (change.operations) RETAINED_OPERATIONS.delete(change.operations);
  }
  if (operations === state.operations) return state;
  const index = state.operations
    ? AUTHORED_INDEXES.get(state.operations)
    : undefined;
  if (index && operations) AUTHORED_INDEXES.set(operations, index);
  return snapshotEditorJsonValue(
    { ...state, operations },
    'Authored content checkpoint'
  );
};

const RETAINED_OPERATIONS = new WeakMap<
  RecordTree<string>,
  RecordTree<string> | null
>();
const hasRetainedCounterpart = (operation: AuthoredContribution) =>
  hasAuthoredContent(operation) &&
  authoredContributionSteps(operation).some((step) =>
    step.targets.some(
      (target) =>
        target.removed.some((span) => span.birth !== operation.changeId) ||
        (target.retained?.kind === 'properties' &&
          target.retained.spans?.some(
            (span) => span.birth !== operation.changeId
          ))
    )
  );

const retainedOperationIndex = (
  state: AuthoredState,
  operations: RecordTree<string> | null
) => {
  if (!operations) return null;
  if (RETAINED_OPERATIONS.has(operations)) {
    return RETAINED_OPERATIONS.get(operations) ?? null;
  }
  let index: RecordTree<string> | null = null;
  for (const [key, id] of records(operations)) {
    const operation = readRecord(state.operations, id);
    if (operation?.kind === 'edit' && hasRetainedCounterpart(operation)) {
      index = writeRecord(index, key, id);
    }
  }
  RETAINED_OPERATIONS.set(operations, index);
  return index;
};

export function* retainedAuthoredOperations(
  state: AuthoredState,
  change: AuthoredRecord
) {
  for (const [, id] of records(
    retainedOperationIndex(state, change.operations)
  )) {
    const operation = readRecord(state.operations, id);
    if (operation && hasAuthoredContent(operation)) {
      yield materializeAuthoredEdit(operation);
    }
  }
}

const reduceEdit = (
  state: AuthoredState,
  operation: AuthoredContribution
): AuthoredState => {
  if (operation.inverseOf) {
    const original = readRecord(state.operations, operation.inverseOf);
    if (
      !original ||
      original.kind !== 'edit' ||
      original.authorId !== operation.authorId ||
      original.proposal !== operation.proposal ||
      (operation.proposal && original.changeId !== operation.changeId) ||
      !observesAuthoredOperation(operation, original)
    ) {
      throw new Error('Invalid authored edit compensation target.');
    }
  }
  if (
    operation.dependencies.some(
      (dependency) =>
        dependency === operation.changeId ||
        !readRecord(state.changes, dependency)
    )
  ) {
    throw new Error('Missing authored operation prerequisite.');
  }
  const previous = readRecord(state.changes, operation.changeId);
  if (
    previous &&
    (previous.authorId !== operation.authorId || !operation.proposal)
  ) {
    throw new Error('Only the original author may amend a pending change.');
  }
  if (operation.retained && (!previous || !operation.proposal)) {
    throw new Error('Retained edits require an existing pending contribution.');
  }
  if (operation.retained) {
    const target: unknown = JSON.parse(operation.retained);
    if (
      !Array.isArray(target) ||
      target.length !== 5 ||
      typeof target[0] !== 'string' ||
      typeof target[1] !== 'string' ||
      target.slice(2).some((value) => !Number.isSafeInteger(value) || value < 0)
    ) {
      throw new Error('Invalid retained edit target.');
    }
    const original = readRecord(state.operations, target[0]);
    const retained =
      original?.kind === 'edit' &&
      !original.retained &&
      hasAuthoredContent(original)
        ? materializeAuthoredEdit(original).steps[target[2]]?.targets.find(
            (item) => item.root === target[1] && item.section === target[3]
          )
        : null;
    if (
      !original ||
      original.kind !== 'edit' ||
      original.changeId !== operation.changeId ||
      !retained ||
      retained.retained?.kind !== 'delete' ||
      !observesAuthoredOperation(operation, original)
    ) {
      throw new Error(
        'Retained edits require an observed deletion in the same contribution.'
      );
    }
  }
  if (previous) {
    const retained = getDefined(previous.operations);
    const first = getDefined(readRecord(retained, retained.first));
    if (
      !observesAuthoredOperation(
        operation,
        getDefined(readRecord(state.operations, first))
      )
    ) {
      throw new Error('Missing authored contribution prerequisite.');
    }
  }
  if (
    previous?.reviews &&
    !(
      previous.status === 'pending' &&
      previous.heads.every((head) =>
        observesAuthoredOperation(
          operation,
          getDefined(readRecord(state.operations, head))
        )
      )
    )
  ) {
    const observed = new Map<string, AuthoredOperation>();
    for (const tree of [previous.operations, previous.reviews]) {
      for (const [, id] of records(tree)) {
        const prior = getDefined(readRecord(state.operations, id));
        if (
          observesAuthoredOperation(operation, prior) &&
          prior.sequence > (observed.get(prior.replica)?.sequence ?? 0)
        ) {
          observed.set(prior.replica, prior);
        }
      }
    }
    const heads = maximalAuthoredHeads(
      state.operations,
      [...observed.values()].map((prior) => prior.id)
    );
    if (authoredStatusFromHeads(state, heads, previous.id) !== 'pending') {
      throw new Error('Only the original author may amend a pending change.');
    }
  }
  const kind = changeKind(operation);
  const next: AuthoredRecord = snapshotEditorJsonValue(
    {
      authorId: operation.authorId,
      createdAt: previous?.createdAt ?? operation.time,
      dependencies: [
        ...new Set([
          ...(previous?.dependencies ?? []),
          ...operation.dependencies,
        ]),
      ].sort(),
      heads: [
        ...(previous?.heads ?? []).filter(
          (head) =>
            !observesAuthoredOperation(
              operation,
              getDefined(readRecord(state.operations, head))
            )
        ),
        operation.id,
      ].sort(),
      id: operation.changeId,
      kind:
        operation.retained && previous
          ? previous.kind
          : previous && previous.kind !== kind
            ? 'mixed'
            : kind,
      operations: writeRecord(
        previous?.operations ?? null,
        authoredOrderKey(operation.clock, operation.id),
        operation.id
      ),
      reviews: previous?.reviews ?? null,
      revision: (previous?.revision ?? 0) + 1,
      status: operation.proposal ? 'pending' : 'accepted',
      updatedAt: Math.max(previous?.updatedAt ?? 0, operation.time),
    },
    'Authored change'
  );
  const retained = retainedOperationIndex(state, previous?.operations ?? null);
  RETAINED_OPERATIONS.set(
    getDefined(next.operations),
    hasRetainedCounterpart(operation)
      ? writeRecord(
          retained,
          authoredOrderKey(operation.clock, operation.id),
          operation.id
        )
      : retained
  );
  const changes = writeRecord(state.changes, next.id, next);
  return {
    ...state,
    changes: previous?.reviews
      ? reduceAuthoredComponent(
          state,
          changes,
          writeRecord(state.operations, operation.id, operation),
          [next.id]
        )
      : changes,
    order: previous
      ? state.order
      : writeRecord(
          state.order,
          authoredOrderKey(next.createdAt, next.id),
          next.id
        ),
  };
};

export const observesAuthoredOperation = (
  operation: AuthoredStamp,
  previous: AuthoredStamp
) => (readRecord(operation.seen, previous.replica) ?? 0) >= previous.sequence;

const maximalAuthoredHeads = (
  operations: AuthoredState['operations'],
  heads: readonly string[]
): readonly string[] => {
  if (heads.length < 2) return heads;
  const covered = new Map<string, number>();
  const candidates = heads.map((head) =>
    getDefined(readRecord(operations, head))
  );
  for (const candidate of candidates) {
    for (const [replica, sequence] of records(candidate.seen)) {
      covered.set(replica, Math.max(covered.get(replica) ?? 0, sequence));
    }
  }
  return candidates
    .filter(
      (candidate) => candidate.sequence > (covered.get(candidate.replica) ?? 0)
    )
    .map((candidate) => candidate.id)
    .sort();
};

const REVIEW_SELECTIONS = new WeakMap<
  AuthoredReview,
  ReadonlyMap<string, readonly string[]>
>();
const reviewSelectionHeads = (operation: AuthoredReview) => {
  let selected = REVIEW_SELECTIONS.get(operation);
  if (!selected) {
    selected = new Map(
      operation.selection.changes.map((change) => [change.id, change.heads])
    );
    REVIEW_SELECTIONS.set(operation, selected);
  }
  return selected;
};

export const authoredStatusBeforeReview = (
  state: AuthoredState,
  operation: AuthoredReview,
  identity: string
): AuthoredStatus => {
  const heads = reviewSelectionHeads(operation).get(identity);
  if (!heads?.length) throw new Error('Missing authored review history.');
  return authoredStatusFromHeads(state, heads, identity);
};

const authoredStatusFromHeads = (
  state: AuthoredState,
  heads: readonly string[],
  identity: string
): AuthoredStatus => {
  const queue = [...heads];
  const visited = new Set<string>();
  const statuses = new Set<AuthoredStatus>();
  while (queue.length) {
    const id = getDefined(queue.pop());
    if (visited.has(id)) continue;
    visited.add(id);
    const head = readRecord(state.operations, id);
    if (!head) throw new Error('Missing authored review history.');
    if (head.kind === 'undo') {
      const target = readRecord(state.operations, head.undoOf);
      if (!target || target.kind === 'edit') {
        throw new Error('Invalid authored review compensation.');
      }
      const previous = reviewSelectionHeads(target).get(identity);
      if (!previous) {
        throw new Error('Incomplete authored review compensation.');
      }
      queue.push(...previous);
    } else {
      statuses.add(
        head.kind === 'edit'
          ? head.proposal
            ? 'pending'
            : 'accepted'
          : head.action === 'accept'
            ? 'accepted'
            : 'rejected'
      );
    }
  }
  return statuses.size === 1 ? [...statuses][0] : 'conflicted';
};

const reduceReview = (
  state: AuthoredState,
  operation: AuthoredReview
): AuthoredState => {
  if (
    operation.selection.documentId !== state.documentId ||
    !operation.selection.changes.length ||
    new Set(operation.selection.changes.map((change) => change.id)).size !==
      operation.selection.changes.length
  ) {
    throw new Error('Invalid authored review selection.');
  }
  if (operation.kind === 'undo') {
    const target = readRecord(state.operations, operation.undoOf);
    if (
      !target ||
      target.kind === 'edit' ||
      target.authorId !== operation.authorId ||
      target.selection.changes.length !== operation.selection.changes.length ||
      operation.selection.changes.some(
        (change) =>
          !reviewSelectionHeads(target).has(change.id) ||
          change.heads.length !== 1 ||
          change.heads[0] !== target.id
      )
    ) {
      throw new Error('Invalid authored review compensation.');
    }
  }
  let { changes } = state;
  const operations = writeRecord(state.operations, operation.id, operation);
  for (const selected of operation.selection.changes) {
    const previous = readRecord(changes, selected.id);
    if (
      !previous ||
      selected.heads.some((head) => {
        const prior = readRecord(operations, head);
        return !prior || !observesAuthoredOperation(operation, prior);
      })
    ) {
      throw new Error('Missing authored review prerequisite.');
    }
    const heads = [
      ...previous.heads.filter((head) => {
        const prior = readRecord(operations, head);
        return prior && !observesAuthoredOperation(operation, prior);
      }),
      operation.id,
    ].sort();
    const reviews = writeRecord(
      previous.reviews,
      authoredOrderKey(operation.clock, operation.id),
      operation.id
    );
    changes = writeRecord(
      changes,
      previous.id,
      snapshotEditorJsonValue(
        {
          ...previous,
          heads,
          reviews,
          revision: (previous.operations?.count ?? 0) + reviews.count,
          updatedAt: Math.max(previous.updatedAt, operation.time),
        },
        'Authored reviewed change'
      )
    );
  }
  return {
    ...state,
    changes: reduceAuthoredComponent(
      state,
      changes,
      operations,
      operation.selection.changes.map((change) => change.id)
    ),
  };
};

const reduceAuthoredComponent = (
  state: AuthoredState,
  previousChanges: AuthoredState['changes'],
  operations: AuthoredState['operations'],
  ids: readonly string[]
): AuthoredState['changes'] => {
  let changes = previousChanges;
  const component = new Set<string>();
  const heads = new Set<string>();
  const queue = [...ids];
  while (queue.length) {
    const identity = getDefined(queue.pop());
    if (component.has(identity)) continue;
    component.add(identity);
    const change = readRecord(changes, identity);
    if (!change) throw new Error('Missing authored review component.');
    for (const head of change.heads) {
      heads.add(head);
      const prior = readRecord(operations, head);
      if (prior && prior.kind !== 'edit') {
        for (const member of prior.selection.changes) queue.push(member.id);
      }
    }
  }
  const activeHeads = maximalAuthoredHeads(operations, [...heads]);
  const active = activeHeads.map((head) =>
    getDefined(readRecord(operations, head))
  );
  const actions = new Set(
    active
      .filter((head): head is AuthoredReview => head.kind !== 'edit')
      .map((head) => head.action)
  );
  const status =
    actions.size > 1 ||
    (actions.size > 0 && active.some((head) => head.kind === 'edit'))
      ? 'conflicted'
      : actions.size === 0
        ? 'pending'
        : actions.has('accept')
          ? 'accepted'
          : 'rejected';
  for (const identity of component) {
    const previous = getDefined(readRecord(changes, identity));
    let { reviews } = previous;
    for (const head of active) {
      if (head.kind !== 'edit') {
        reviews = writeRecord(
          reviews,
          authoredOrderKey(head.clock, head.id),
          head.id
        );
      }
    }
    changes = writeRecord(
      changes,
      identity,
      snapshotEditorJsonValue(
        {
          ...previous,
          heads: activeHeads,
          reviews,
          revision: (previous.operations?.count ?? 0) + (reviews?.count ?? 0),
          status:
            active.length === 1 && active[0].kind === 'undo'
              ? authoredStatusBeforeReview(
                  state,
                  readRecord(
                    state.operations,
                    active[0].undoOf
                  ) as AuthoredReview,
                  identity
                )
              : active.some((head) => head.kind === 'undo')
                ? 'conflicted'
                : status,
          updatedAt: Math.max(
            previous.updatedAt,
            ...active.map((head) => head.time)
          ),
        },
        'Authored decision component'
      )
    );
  }
  return changes;
};

const applyAuthoredOperation = (
  state: AuthoredState,
  operation: AuthoredOperation,
  replay: boolean
): AuthoredState =>
  profileCoreDuration('authored-reduce', () => {
    const existing = readRecord(state.operations, operation.id);
    if (existing) {
      if (!equalAuthoredOperations(existing, operation)) {
        throw new Error('Authored operation identity collision.');
      }
      if (!replay) return state;
    }
    if (
      operation.sequence < 1 ||
      operation.id !== `${operation.replica}:${operation.sequence}` ||
      operation.sequence !==
        (readRecord(operation.seen, operation.replica) ?? 0) + 1 ||
      operation.sequence !==
        (readRecord(state.vector, operation.replica) ?? 0) + 1 ||
      [...records(operation.seen)].some(
        ([replica, sequence]) =>
          sequence > (readRecord(state.vector, replica) ?? 0)
      )
    ) {
      throw new Error('Invalid authored replica sequence.');
    }
    if (
      operation.parents.some((parent) => {
        const previous = readRecord(state.operations, parent);
        return (
          !previous ||
          previous.clock >= operation.clock ||
          !observesAuthoredOperation(operation, previous)
        );
      })
    ) {
      throw new Error('Missing authored operation prerequisite.');
    }
    if (
      operation.seen !== state.vector ||
      operation.parents.length !== state.frontier.length ||
      operation.parents.some(
        (parent, index) => parent !== state.frontier[index]
      )
    ) {
      const expectedSeen = new Map<string, number>();
      const observe = (replica: string, sequence: number) =>
        expectedSeen.set(
          replica,
          Math.max(expectedSeen.get(replica) ?? 0, sequence)
        );
      for (const parent of operation.parents) {
        const previous = getDefined(readRecord(state.operations, parent));
        for (const [replica, sequence] of records(previous.seen)) {
          observe(replica, sequence);
        }
        observe(previous.replica, previous.sequence);
      }
      if (
        expectedSeen.size !== (operation.seen?.count ?? 0) ||
        [...expectedSeen].some(
          ([replica, sequence]) =>
            readRecord(operation.seen, replica) !== sequence
        )
      ) {
        throw new Error('Invalid authored causal observation.');
      }
    }
    const next =
      operation.kind === 'edit'
        ? reduceEdit(state, operation)
        : reduceReview(state, operation);
    const result = snapshotEditorJsonValue(
      {
        ...next,
        clock: Math.max(state.clock, operation.clock),
        frontier: [
          ...state.frontier.filter((head) => !operation.parents.includes(head)),
          operation.id,
        ].sort(),
        operations: replay
          ? state.operations
          : writeRecord(state.operations, operation.id, operation),
        vector: writeRecord(
          state.vector,
          operation.replica,
          operation.sequence
        ),
      },
      'Authored checkpoint'
    );
    const previousIndex = state.operations
      ? AUTHORED_INDEXES.get(state.operations)
      : EMPTY_AUTHORED_INDEX;
    if (previousIndex) {
      let index = previousIndex;
      const changed =
        operation.kind === 'edit' &&
        !readRecord(state.changes, operation.changeId)?.reviews
          ? [operation.changeId]
          : reviewComponent(
              result,
              operation.kind === 'edit'
                ? [operation.changeId]
                : operation.selection.changes.map((change) => change.id)
            );
      for (const identity of changed) {
        index = updateIndex(
          index,
          readRecord(state.changes, identity),
          getDefined(readRecord(result.changes, identity))
        );
      }
      index = indexPropertyWrites(index, operation);
      AUTHORED_INDEXES.set(getDefined(result.operations), index);
    }
    return result;
  });

export const reduceAuthoredOperation = (
  state: AuthoredState,
  operation: AuthoredOperation
): AuthoredState => applyAuthoredOperation(state, operation, false);

type AuthoredIndex = Readonly<{
  deletions: RecordTree<RecordTree<AuthoredDeletion>> | null;
  authors: RecordTree<string> | null;
  authorStatuses: RecordTree<string> | null;
  dependants: RecordTree<string> | null;
  statuses: RecordTree<string> | null;
  properties: RecordTree<RecordTree<AuthoredPropertyWrite>> | null;
  textProperties: RecordTree<
    NonNullable<AuthoredIntervals<AuthoredPropertyWrite>>
  > | null;
  textBoundaries: RecordTree<
    Readonly<{ order: string; spans: readonly AuthoredSpan[] }>
  > | null;
  compensations: RecordTree<RecordTree<AuthoredEditIdentity>> | null;
}>;
type AuthoredDeletion = Readonly<{
  operation: AuthoredEditIdentity;
  target: AuthoredTarget;
  stepIndex: number;
  targetIndex: number;
}>;
export type AuthoredPropertyWrite = Readonly<{
  operation: AuthoredEditIdentity;
  target: AuthoredTarget;
  modifications: readonly PropertyModificationJson[];
}>;
const AUTHORED_INDEXES = new WeakMap<
  NonNullable<AuthoredState['operations']>,
  AuthoredIndex
>();
const EMPTY_AUTHORED_INDEX: AuthoredIndex = Object.freeze({
  deletions: null,
  authors: null,
  authorStatuses: null,
  dependants: null,
  statuses: null,
  properties: null,
  textProperties: null,
  textBoundaries: null,
  compensations: null,
});
const propertyNodePrefix = (origin: string, offset: number) =>
  `${JSON.stringify([origin, offset])}\u0000`;
const propertyKey = (origin: string, offset: number, key: string) =>
  `${propertyNodePrefix(origin, offset)}${JSON.stringify(key)}`;
const indexPropertyWrites = (
  index: AuthoredIndex,
  operation: AuthoredOperation
): AuthoredIndex => {
  if (operation.kind !== 'edit' || operation.retained) return index;
  let { properties, textProperties, textBoundaries, compensations, deletions } =
    index;
  const identity: AuthoredEditIdentity = Object.freeze({
    authorId: operation.authorId,
    changeId: operation.changeId,
    clock: operation.clock,
    dependencies: operation.dependencies,
    id: operation.id,
    inverseOf: operation.inverseOf,
    kind: 'edit',
    parents: operation.parents,
    proposal: operation.proposal,
    replica: operation.replica,
    seen: operation.seen,
    sequence: operation.sequence,
    time: operation.time,
  });
  if (operation.inverseOf) {
    compensations = writeRecord(
      compensations,
      operation.inverseOf,
      writeRecord(
        readRecord(compensations, operation.inverseOf),
        operation.id,
        identity
      )
    );
  }
  const steps =
    'steps' in operation ? operation.steps : operation.content.steps;
  for (const [stepIndex, step] of steps.entries()) {
    for (const [targetIndex, target] of step.targets.entries()) {
      const sections =
        'forward' in step
          ? target.root === 'main'
            ? step.forward.primary
            : step.forward.roots?.[target.root]
          : undefined;
      const section = sections?.[target.section];
      const facts = 'forward' in step ? undefined : step.targets[targetIndex];
      const order = `${authoredOrderKey(
        operation.clock,
        operation.id
      )}\u0000${String(stepIndex).padStart(16, '0')}\u0000${String(
        targetIndex
      ).padStart(16, '0')}`;
      const boundary = facts
        ? facts.textBoundary
        : section && readAuthoredTextBoundary(target, section);
      if (boundary) {
        const key = JSON.stringify([
          boundary.position.origin,
          boundary.position.offset,
        ]);
        const previous = readRecord(textBoundaries, key);
        if (!previous || order < previous.order) {
          textBoundaries = writeRecord(textBoundaries, key, {
            order,
            spans: boundary.spans,
          });
        }
      }
      if (operation.inverseOf) continue;
      if (
        operation.proposal &&
        target.removed.length &&
        (target.retained?.kind === 'delete' || (facts && !facts.properties))
      ) {
        for (const endpoint of [target.from.left, target.to.right]) {
          if (!endpoint) continue;
          const key = JSON.stringify([
            target.root,
            endpoint.origin,
            endpoint.offset,
          ]);
          deletions = writeRecord(
            deletions,
            key,
            writeRecord(readRecord(deletions, key), order, {
              operation: identity,
              target,
              stepIndex,
              targetIndex,
            })
          );
        }
      }
      const modifications =
        facts?.properties?.operations ?? section?.properties?.operations;
      const span = target.removed[0];
      if (!modifications || !span) continue;
      const write = Object.freeze({
        operation: identity,
        target,
        modifications,
      });
      if (
        target.retained?.kind === 'properties' &&
        target.retained.spans?.length
      ) {
        for (const content of target.retained.spans) {
          textProperties = writeRecord(
            textProperties,
            content.origin,
            writeAuthoredInterval(readRecord(textProperties, content.origin), {
              from: content.offset,
              to: content.offset + content.length,
              id: order,
              insertion: false,
              value: write,
            })
          );
        }
        continue;
      }
      for (const key of new Set(modifications.map((entry) => entry.key))) {
        const propertyIdentity = propertyKey(span.origin, span.offset, key);
        properties = writeRecord(
          properties,
          propertyIdentity,
          writeRecord(readRecord(properties, propertyIdentity), order, write)
        );
      }
    }
  }
  return properties === index.properties &&
    deletions === index.deletions &&
    textProperties === index.textProperties &&
    textBoundaries === index.textBoundaries &&
    compensations === index.compensations
    ? index
    : {
        ...index,
        properties,
        textProperties,
        textBoundaries,
        compensations,
        deletions,
      };
};

export function* authoredDeletionsAt(
  state: AuthoredState,
  root: string,
  position: AuthoredPosition
) {
  const index = indexAuthoredState(state);
  const visited = new Set<AuthoredTarget>();
  for (const endpoint of [position.left, position.right]) {
    if (!endpoint) continue;
    const key = JSON.stringify([root, endpoint.origin, endpoint.offset]);
    for (const [, deletion] of records(readRecord(index.deletions, key))) {
      if (visited.has(deletion.target)) continue;
      visited.add(deletion.target);
      const operation = readRecord(state.operations, deletion.operation.id);
      if (!operation || !hasAuthoredContent(operation)) continue;
      const target =
        materializeAuthoredEdit(operation).steps[deletion.stepIndex]?.targets[
          deletion.targetIndex
        ];
      if (target?.retained?.kind === 'delete') yield { ...deletion, target };
    }
  }
}

const updateIndex = (
  index: AuthoredIndex,
  previous: AuthoredRecord | null,
  next: AuthoredRecord
): AuthoredIndex => {
  let { authors, authorStatuses, dependants, statuses } = index;
  const order = authoredOrderKey(next.createdAt, next.id);
  if (!previous) {
    authors = writeRecord(authors, `${next.authorId}\u0000${order}`, next.id);
  }
  if (previous?.status !== next.status) {
    if (previous) {
      statuses = removeRecord(statuses, `${previous.status}\u0000${order}`);
      authorStatuses = removeRecord(
        authorStatuses,
        `${previous.authorId}\u0000${previous.status}\u0000${order}`
      );
    }
    statuses = writeRecord(statuses, `${next.status}\u0000${order}`, next.id);
    authorStatuses = writeRecord(
      authorStatuses,
      `${next.authorId}\u0000${next.status}\u0000${order}`,
      next.id
    );
  }
  for (const dependency of next.dependencies) {
    if (!previous?.dependencies.includes(dependency)) {
      dependants = writeRecord(
        dependants,
        `${dependency}\u0000${next.id}`,
        next.id
      );
    }
  }
  return { ...index, authors, authorStatuses, dependants, statuses };
};

export const indexAuthoredState = (state: AuthoredState): AuthoredIndex => {
  if (!state.operations) return EMPTY_AUTHORED_INDEX;
  const { operations } = state;
  const existing = AUTHORED_INDEXES.get(operations);
  if (existing) return existing;
  return profileCoreDuration('authored-index', () => {
    const authors: Array<readonly [string, string]> = [];
    const authorStatuses: Array<readonly [string, string]> = [];
    const dependants: Array<readonly [string, string]> = [];
    const statuses: Array<readonly [string, string]> = [];
    for (const [, change] of records(state.changes)) {
      const order = authoredOrderKey(change.createdAt, change.id);
      authors.push([`${change.authorId}\u0000${order}`, change.id]);
      authorStatuses.push([
        `${change.authorId}\u0000${change.status}\u0000${order}`,
        change.id,
      ]);
      statuses.push([`${change.status}\u0000${order}`, change.id]);
      for (const dependency of change.dependencies) {
        dependants.push([`${dependency}\u0000${change.id}`, change.id]);
      }
    }
    const byKey = (
      left: readonly [string, unknown],
      right: readonly [string, unknown]
    ) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0);
    let index: AuthoredIndex = {
      ...EMPTY_AUTHORED_INDEX,
      authors: recordTreeFromSortedEntries(authors.sort(byKey)),
      authorStatuses: recordTreeFromSortedEntries(authorStatuses.sort(byKey)),
      dependants: recordTreeFromSortedEntries(dependants.sort(byKey)),
      statuses: recordTreeFromSortedEntries(statuses.sort(byKey)),
    };
    for (const [, operation] of records(operations)) {
      index = indexPropertyWrites(index, operation);
    }
    AUTHORED_INDEXES.set(operations, index);
    return index;
  });
};

export const hasAuthoredPropertyProjection = (state: AuthoredState) => {
  const { properties, textBoundaries, textProperties } =
    indexAuthoredState(state);

  return !!(properties || textBoundaries || textProperties);
};

export function* authoredPropertyWrites(
  state: AuthoredState,
  origin: string,
  offset: number,
  key: string
) {
  for (const [, write] of records(
    readRecord(
      indexAuthoredState(state).properties,
      propertyKey(origin, offset, key)
    )
  )) {
    yield write;
  }
}

export function* authoredPropertyKeys(
  state: AuthoredState,
  origin: string,
  offset: number
): Generator<string> {
  const prefix = propertyNodePrefix(origin, offset);
  for (const [key] of records(indexAuthoredState(state).properties, {
    prefix,
  })) {
    yield JSON.parse(key.slice(prefix.length));
  }
}

export const authoredTextPropertyWrites = (
  state: AuthoredState,
  span: AuthoredSpan
) =>
  matchingAuthoredIntervals(
    readRecord(indexAuthoredState(state).textProperties, span.origin),
    span.offset,
    span.offset + span.length
  );

export const authoredTextBoundary = (
  state: AuthoredState,
  origin: string,
  offset: number
) =>
  readRecord(
    indexAuthoredState(state).textBoundaries,
    JSON.stringify([origin, offset])
  );

export const isAuthoredPropertyWriteVisible = (
  state: AuthoredState,
  operation: AuthoredEditIdentity,
  visible: (edit: AuthoredEditIdentity) => boolean
): boolean =>
  visible(operation) &&
  ![
    ...records(
      readRecord(indexAuthoredState(state).compensations, operation.id)
    ),
  ].some(([, compensation]) =>
    isAuthoredPropertyWriteVisible(state, compensation, visible)
  );

export const authoredOperationPropertySteps = (
  state: AuthoredState,
  operation: AuthoredContribution
) => {
  const steps = [...authoredContributionSteps(operation)];
  let original: AuthoredOperation | null = operation;
  while (original?.kind === 'edit' && original.inverseOf) {
    original = readRecord(state.operations, original.inverseOf);
    if (original?.kind === 'edit') {
      steps.push(...authoredContributionSteps(original));
    }
  }
  return steps;
};

export const authoredDependants = (state: AuthoredState, identity: string) =>
  [
    ...records(indexAuthoredState(state).dependants, {
      prefix: `${identity}\u0000`,
    }),
  ].map(([, id]) => getDefined(readRecord(state.changes, id)));

export function* matchingAuthoredChanges(
  state: AuthoredState,
  query: Omit<AuthoredQuery, 'cursor' | 'limit'>,
  after?: string
) {
  const index = indexAuthoredState(state);
  const prefix =
    query.authorId !== undefined
      ? `${query.authorId}\u0000${
          query.status !== undefined ? `${query.status}\u0000` : ''
        }`
      : query.status !== undefined
        ? `${query.status}\u0000`
        : '';
  const tree =
    query.authorId !== undefined
      ? query.status !== undefined
        ? index.authorStatuses
        : index.authors
      : query.status !== undefined
        ? index.statuses
        : state.order;
  for (const [key, identity] of records(tree, {
    prefix,
    after: after
      ? `${prefix}${after}`
      : query.from !== undefined
        ? `${prefix}${authoredOrderKey(query.from, '')}`
        : undefined,
  })) {
    const change = getDefined(readRecord(state.changes, identity));
    if (query.to !== undefined && change.createdAt > query.to) break;
    yield { key: key.slice(prefix.length), change };
  }
}

export const reviewComponent = (
  state: AuthoredState,
  ids: readonly string[]
): readonly string[] => {
  const component = new Set<string>();
  const queue = [...ids];
  while (queue.length) {
    const identity = getDefined(queue.pop());
    if (component.has(identity)) continue;
    component.add(identity);
    const change = readRecord(state.changes, identity);
    for (const head of change?.heads ?? []) {
      const operation = readRecord(state.operations, head);
      if (operation && operation.kind !== 'edit') {
        queue.push(
          ...operation.selection.changes.map((selected) => selected.id)
        );
      }
    }
  }
  return [...component].sort();
};

export const emptyAuthoredState = (
  documentId: string = crypto.randomUUID()
): AuthoredState =>
  snapshotEditorJsonValue(
    {
      acceptedPositions: null,
      changes: null,
      clock: 0,
      documentId,
      frontier: [],
      operations: null,
      order: null,
      projected: null,
      projectedPositions: null,
      vector: null,
    },
    'Authored checkpoint'
  );

export const authoredState = defineStateField<AuthoredState>({
  key: 'authored',
  history: 'skip',
  persist: stateCodec,
  initial: () => emptyAuthoredState(),
  reduce: (previous, effect) => {
    if (effect.type !== authoredOperationEffect) return previous;
    const batch = profileCoreDuration('authored-operation-decode', () =>
      operationsCodec.decode(effect.value)
    );
    let state = previous;
    if (batch.documentId !== state.documentId) {
      if (state.operations) {
        throw new Error('Authored operations belong to another document.');
      }
      state = emptyAuthoredState(batch.documentId);
    }
    if (batch.checkpoint) {
      const retained = [...records(state.operations)].flatMap(
        ([, operation]) =>
          hasAuthoredContent(operation)
            ? [materializeAuthoredEdit(operation)]
            : []
      );
      if (
        batch.checkpoint.state &&
        batch.checkpoint.state.documentId !== batch.documentId
      ) {
        throw new Error('Authored operations belong to another document.');
      }
      state = batch.checkpoint.state ?? emptyAuthoredState(batch.documentId);
      for (const operation of batch.operations) {
        state = reduceAuthoredOperation(state, operation);
      }
      state = retainAuthoredContent(state, retained);
      for (const [, operation] of records(state.operations)) {
        const status =
          operation.kind === 'edit'
            ? readRecord(state.changes, operation.changeId)?.status
            : undefined;
        if (
          operation.kind === 'edit' &&
          !hasAuthoredContent(operation) &&
          (status === 'pending' || status === 'conflicted')
        ) {
          throw new Error('Compacted authored content must be closed.');
        }
      }
      return snapshotEditorJsonValue(
        {
          ...state,
          acceptedPositions:
            batch.checkpoint.positions ?? state.acceptedPositions,
        },
        'Authored checkpoint'
      );
    }
    if (
      batch.operations.some(
        (operation) =>
          operation.kind === 'edit' && !hasAuthoredContent(operation)
      )
    ) {
      throw new Error(
        'Compacted authored content requires a document checkpoint.'
      );
    }
    const incoming = batch.operations.filter(
      (operation) => !readRecord(state.operations, operation.id)
    );
    const retainedChanges = new Set<string>();
    for (const operation of incoming) {
      if (operation.kind === 'edit') {
        retainedChanges.add(operation.changeId);
        const original = operation.inverseOf
          ? readRecord(state.operations, operation.inverseOf)
          : null;
        if (original?.kind === 'edit') {
          retainedChanges.add(original.changeId);
        }
      } else {
        for (const change of operation.selection.changes) {
          retainedChanges.add(change.id);
        }
      }
    }
    if (
      batch.retained.some(
        (operation) => !retainedChanges.has(operation.changeId)
      )
    ) {
      throw new Error('Unexpected authored retained content.');
    }
    if (incoming.length) {
      state = retainAuthoredContent(state, batch.retained);
    }
    for (const operation of batch.operations) {
      state = reduceAuthoredOperation(state, operation);
    }
    return state;
  },
});
