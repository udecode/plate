import type {
  EditorDocumentRecords,
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
  | Readonly<{
      kind:
        | 'children'
        | 'meta'
        | 'meta-key'
        | 'primary-root'
        | 'records'
        | 'roots';
    }>
  | Readonly<{ kind: 'root'; root: string }>;

type EditorDocumentShape = Readonly<{
  children: readonly unknown[];
  meta?: Readonly<Record<string, unknown>>;
  records?: EditorDocumentRecords;
  roots?: Readonly<Record<string, readonly unknown[]>>;
}>;

/** The top-level fields one input kind admits. */
type EditorRecordFields = Readonly<Record<string, 'optional' | 'required'>>;

type EditorRecordOf<TFields extends EditorRecordFields> = Readonly<
  {
    [K in keyof TFields as TFields[K] extends 'required' ? K : never]: unknown;
  } & {
    [K in keyof TFields as TFields[K] extends 'required' ? never : K]?: unknown;
  }
>;

type SchemaIdentityIssue = EditorRecordIssue | Readonly<{ kind: 'identity' }>;

type PersistedEnvelopeRecord = Readonly<{
  document: unknown;
  schema: EditorSchemaIdentity;
  selection?: unknown;
}>;

type DirectSnapshotInput = Exclude<SnapshotInput, PersistedDocumentInput>;

export const EDITOR_DOCUMENT_FIELDS = Object.freeze({
  children: 'required',
  meta: 'optional',
  records: 'optional',
  roots: 'optional',
} satisfies Record<keyof EditorDocumentValue, 'optional' | 'required'>);

export const EDITOR_SNAPSHOT_FIELDS = Object.freeze({
  children: 'required',
  meta: 'optional',
  records: 'optional',
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
    case 'meta-key': {
      return 'Editor document metadata cannot hold the key "__proto__".';
    }
    case 'records': {
      return 'Editor document records must map each record set to an object of record objects.';
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
export const readDocumentRecord = <const TFields extends EditorRecordFields>(
  value: unknown,
  fields: TFields,
  reject: (issue: EditorRecordIssue) => never
): EditorRecordOf<TFields> => {
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

  return (
    defined.length === entries.length ? value : Object.fromEntries(defined)
  ) as EditorRecordOf<TFields>;
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
  if (
    input.records !== undefined &&
    (!isRecord(input.records) ||
      !Object.values(input.records).every(
        (records) => isRecord(records) && Object.values(records).every(isRecord)
      ))
  ) {
    reject({ kind: 'records' });
  }
  if (input.roots === undefined) return;
  if (!isRecord(input.roots)) reject({ kind: 'roots' });
  if (Object.hasOwn(input.roots, 'main')) reject({ kind: 'primary-root' });

  for (const [root, children] of Object.entries(input.roots)) {
    if (!Array.isArray(children)) reject({ kind: 'root', root });
  }
}

/**
 * Read a stored document's top-level fields and containers, keeping a `meta`
 * key named `__proto__` so a migration step can still drop it. `assertJson`
 * runs on the record before its containers, so a JSON error is reported first.
 */
export const readStoredEditorDocument = (
  input: unknown,
  reject: (issue: EditorDocumentShapeIssue) => never,
  assertJson?: (record: Readonly<Record<string, unknown>>) => void
): EditorDocumentValue => {
  const record = readDocumentRecord(input, EDITOR_DOCUMENT_FIELDS, reject);

  assertJson?.(record);
  assertEditorDocumentContainers(record, reject);

  return record as EditorDocumentValue;
};

/**
 * Read a document an editor loads: a stored document whose `meta` has no
 * `__proto__` key, because meta writes assign by key, and an assigned
 * `__proto__` key sets the meta object's prototype or vanishes.
 */
export const readEditorDocument = (
  input: unknown,
  reject: (issue: EditorDocumentShapeIssue) => never,
  assertJson?: (record: Readonly<Record<string, unknown>>) => void
): EditorDocumentValue => {
  const document = readStoredEditorDocument(input, reject, assertJson);

  if (document.meta && Object.hasOwn(document.meta, '__proto__')) {
    reject({ kind: 'meta-key' });
  }

  return document;
};

// Reads the descriptor so no getter runs here; an accessor, such as a lazy
// root's children, counts as present, and the record reader judges it later.
const holds = (value: Record<string, unknown>, field: string) => {
  const descriptor = Object.getOwnPropertyDescriptor(value, field);

  return (
    descriptor !== undefined &&
    (descriptor.get !== undefined || descriptor.value !== undefined)
  );
};

/**
 * A raw document may keep a legacy `document` beside its children, and a field
 * holding `undefined` is absent, as `readDocumentRecord` reads it.
 */
export const isEnvelopeInput = (
  value: unknown
): value is Readonly<Record<string, unknown>> &
  Readonly<{ document: unknown }> =>
  isRecord(value) && holds(value, 'document') && !holds(value, 'children');

const isFilledString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

/**
 * A schema starts at version 1. An envelope's identity is a migration source,
 * which may name version 0, before the first schema.
 */
export const readSchemaIdentity = (
  value: unknown,
  reject: (issue: SchemaIdentityIssue) => never,
  lineage: 'schema' | 'source'
): EditorSchemaIdentity => {
  const { kind } = readDocumentRecord(
    value,
    { ...NAMED_SCHEMA_IDENTITY_FIELDS, id: 'optional', version: 'optional' },
    reject
  );

  if (kind === 'derived') {
    const { fingerprint } = readDocumentRecord(
      value,
      DERIVED_SCHEMA_IDENTITY_FIELDS,
      reject
    );

    if (!isFilledString(fingerprint)) reject({ kind: 'identity' });

    return Object.freeze({ fingerprint, kind });
  }
  if (kind !== 'named') return reject({ kind: 'identity' });

  const { fingerprint, id, version } = readDocumentRecord(
    value,
    NAMED_SCHEMA_IDENTITY_FIELDS,
    reject
  );

  if (
    !isFilledString(fingerprint) ||
    !isFilledString(id) ||
    typeof version !== 'number' ||
    !Number.isSafeInteger(version) ||
    version < (lineage === 'schema' ? 1 : 0)
  ) {
    reject({ kind: 'identity' });
  }

  return Object.freeze({ fingerprint, id, kind, version });
};

const rejectPersistedSchema = (issue: SchemaIdentityIssue): never => {
  if (issue.kind === 'identity') {
    throw new TypeError('Persisted document schema is not a schema identity.');
  }

  return rejectEditorRecord('Persisted document schema')(issue);
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
    schema: readSchemaIdentity(
      envelope.schema,
      rejectPersistedSchema,
      'source'
    ),
  };
};
