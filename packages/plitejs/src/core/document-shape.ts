import type {
  EditorDocumentValue,
  EditorSchemaDocumentValue,
  PersistedDocumentInput,
  SnapshotInput,
} from '../interfaces/editor';
import type {
  DerivedEditorSchemaIdentity,
  EditorSchemaIdentity,
  NamedEditorSchemaIdentity,
} from '../interfaces/schema';
import { getEditorJsonRecordEntries } from './value-codec';

/** A record reader's refusal; `json` marks an object that is not plain JSON. */
export type EditorRecordIssue =
  | Readonly<{ kind: 'json' | 'record' }>
  | Readonly<{ kind: 'field' | 'missing'; field: string }>;

export type EditorDocumentShapeIssue =
  | EditorRecordIssue
  | Readonly<{ kind: 'children' | 'meta' | 'primary-root' | 'roots' }>
  | Readonly<{ kind: 'root'; root: string }>;

export type EditorDocumentShape = Readonly<{
  children: readonly unknown[];
  meta?: Readonly<Record<string, unknown>>;
  roots?: Readonly<Record<string, readonly unknown[]>>;
}>;

/** The top-level fields one input kind admits. */
export type EditorRecordFields = Readonly<
  Record<string, 'optional' | 'required'>
>;

export type PersistedEnvelopeRecord = Readonly<{
  document: unknown;
  schema: EditorSchemaIdentity;
  selection?: unknown;
}>;

type DirectSnapshotInput = Exclude<SnapshotInput, PersistedDocumentInput>;

export const EDITOR_DOCUMENT_FIELDS = Object.freeze({
  children: 'required',
  meta: 'optional',
  roots: 'optional',
} satisfies Record<keyof EditorDocumentValue, 'optional' | 'required'>);

export const EDITOR_SNAPSHOT_FIELDS = Object.freeze({
  children: 'required',
  meta: 'optional',
  roots: 'optional',
  selection: 'optional',
} satisfies Record<keyof DirectSnapshotInput, 'optional' | 'required'>);

/** A root-bound view replaces one root; metadata loads through the editor. */
export const EDITOR_ROOT_SNAPSHOT_FIELDS = Object.freeze({
  children: 'required',
  selection: 'optional',
} satisfies Partial<
  Record<keyof DirectSnapshotInput, 'optional' | 'required'>
>);

export const EDITOR_STRUCTURE_FIELDS = Object.freeze({
  children: 'required',
  roots: 'optional',
} satisfies Record<keyof EditorSchemaDocumentValue, 'optional' | 'required'>);

const PERSISTED_DOCUMENT_FIELDS = Object.freeze({
  document: 'required',
  schema: 'required',
  selection: 'optional',
} satisfies Record<keyof PersistedDocumentInput, 'optional' | 'required'>);

const DERIVED_SCHEMA_IDENTITY_FIELDS = Object.freeze({
  fingerprint: 'required',
  kind: 'required',
} satisfies Record<keyof DerivedEditorSchemaIdentity, 'required'>);

const NAMED_SCHEMA_IDENTITY_FIELDS = Object.freeze({
  fingerprint: 'required',
  id: 'required',
  kind: 'required',
  version: 'required',
} satisfies Record<keyof NamedEditorSchemaIdentity, 'required'>);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const getEditorDocumentShapeIssueMessage = (
  issue: EditorDocumentShapeIssue
): string => {
  switch (issue.kind) {
    case 'record':
    case 'children':
    case 'missing': {
      return 'Editor document value must be an object with a children array.';
    }
    case 'json': {
      return 'Editor document value must encode to JSON-compatible data.';
    }
    case 'field': {
      return `Editor document field "${issue.field}" is not supported. Store application data in meta.`;
    }
    case 'meta': {
      return 'Editor document metadata must be an object.';
    }
    case 'roots': {
      return 'Editor document roots must be an object.';
    }
    case 'primary-root': {
      return 'Editor document roots cannot redefine the primary root; use children.';
    }
    case 'root': {
      return `Editor document root "${issue.root}" must be an array.`;
    }
  }

  throw new Error('Unknown editor document shape issue.');
};

const getEditorRecordIssueMessage = (
  label: string,
  issue: EditorRecordIssue
): string => {
  switch (issue.kind) {
    case 'field': {
      return `${label} field "${issue.field}" is not supported.`;
    }
    case 'missing': {
      return `${label} field "${issue.field}" is required.`;
    }
    case 'json':
    case 'record': {
      return `${label} must be a plain data object.`;
    }
  }

  throw new Error('Unknown editor record issue.');
};

export const rejectEditorRecord =
  (label: string) =>
  (issue: EditorRecordIssue): never => {
    throw new TypeError(getEditorRecordIssueMessage(label, issue));
  };

/**
 * Read a plain JSON record's own fields, refusing a field outside `fields`.
 * A field holding `undefined` carries no data and counts as absent, and only
 * then is the result a copy.
 */
export const readDocumentRecord = (
  value: unknown,
  fields: EditorRecordFields,
  reject: (issue: EditorRecordIssue) => never
): Readonly<Record<string, unknown>> => {
  const entries = getEditorJsonRecordEntries(value);

  if (!entries) return reject({ kind: isRecord(value) ? 'json' : 'record' });

  const defined = entries.filter(([, item]) => item !== undefined);

  for (const [field] of defined) {
    if (!Object.hasOwn(fields, field)) reject({ kind: 'field', field });
  }
  for (const [field, need] of Object.entries(fields)) {
    if (need === 'required' && !defined.some(([key]) => key === field)) {
      reject({ kind: 'missing', field });
    }
  }

  return defined.length === entries.length
    ? (value as Readonly<Record<string, unknown>>)
    : Object.fromEntries(defined);
};

export function assertEditorDocumentContainers(
  input: unknown,
  reject: (issue: EditorDocumentShapeIssue) => never
): asserts input is EditorDocumentShape {
  if (!isRecord(input)) reject({ kind: 'record' });
  if (!Object.hasOwn(input, 'children') || !Array.isArray(input.children)) {
    reject({ kind: 'children' });
  }
  if (input.meta !== undefined && !isRecord(input.meta)) {
    reject({ kind: 'meta' });
  }
  if (input.roots === undefined) return;
  if (!isRecord(input.roots)) reject({ kind: 'roots' });
  if (Object.hasOwn(input.roots, 'main')) reject({ kind: 'primary-root' });

  for (const [root, children] of Object.entries(input.roots)) {
    if (!Array.isArray(children)) reject({ kind: 'root', root });
  }
}

/**
 * Read a document's top-level fields and containers. `assertJson` runs on the
 * record before its containers, so a JSON error is reported first.
 */
export const readEditorDocument = (
  input: unknown,
  reject: (issue: EditorDocumentShapeIssue) => never,
  assertJson?: (record: Readonly<Record<string, unknown>>) => void
): EditorDocumentValue => {
  const record = readDocumentRecord(input, EDITOR_DOCUMENT_FIELDS, reject);

  assertJson?.(record);
  assertEditorDocumentContainers(record, reject);

  return record as EditorDocumentValue;
};

export const isEnvelopeInput = (
  value: unknown
): value is Readonly<Record<string, unknown>> &
  Readonly<{ document: unknown }> =>
  isRecord(value) && Object.hasOwn(value, 'document');

const readPersistedSchemaIdentity = (value: unknown): EditorSchemaIdentity => {
  const reject = rejectEditorRecord('Persisted document schema');
  const { kind } = readDocumentRecord(
    value,
    { ...NAMED_SCHEMA_IDENTITY_FIELDS, id: 'optional', version: 'optional' },
    reject
  );
  const identity = readDocumentRecord(
    value,
    kind === 'named'
      ? NAMED_SCHEMA_IDENTITY_FIELDS
      : DERIVED_SCHEMA_IDENTITY_FIELDS,
    reject
  );
  const { version } = identity;

  if (
    typeof identity.fingerprint !== 'string' ||
    (kind !== 'derived' &&
      (kind !== 'named' ||
        typeof identity.id !== 'string' ||
        typeof version !== 'number' ||
        !Number.isSafeInteger(version) ||
        version < 0))
  ) {
    throw new TypeError('Persisted document schema is not a schema identity.');
  }

  return identity as EditorSchemaIdentity;
};

/** Read a persisted envelope and its schema identity; the document stays raw. */
export const readPersistedEnvelope = (
  input: unknown
): PersistedEnvelopeRecord => {
  const envelope = readDocumentRecord(
    input,
    PERSISTED_DOCUMENT_FIELDS,
    rejectEditorRecord('Persisted document envelope')
  );

  return {
    ...envelope,
    document: envelope.document,
    schema: readPersistedSchemaIdentity(envelope.schema),
  };
};
