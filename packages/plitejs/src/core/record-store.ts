import type { EditorDocumentRecords } from '../interfaces/editor';
import { deepFreeze, isRecord } from './change/json';
import { copyFields } from './change/lazy-root';
import {
  persistentMapCeiling,
  persistentMapChanges,
  persistentMapDelete,
  persistentMapEntries,
  persistentMapFromSorted,
  persistentMapGet,
  type PersistentMapNode,
  persistentMapSet,
  persistentMapSize,
} from './persistent-map';
import { assertEditorJsonValue } from './value-codec';

/** One record set: each record's id to its canonical JSON text. */
type RecordTree = PersistentMapNode<string>;

/**
 * A record set's version: the same object in every store version that left
 * the set alone, and `null` while it holds no record.
 */
export type RecordSetVersion = RecordTree | null;

/**
 * Every record set that holds a record, by set name. A record is keyed data
 * beside the document's children: no node keys, positions or views, and a
 * version shares every tree node a write leaves alone.
 *
 * @internal
 */
export type RecordStore = Readonly<Record<string, RecordTree>>;

/**
 * Record writes by set and id. A string sets that canonical JSON under the
 * id, and `null` drops the id.
 *
 * @internal
 */
export type RecordOps = ReadonlyMap<string, ReadonlyMap<string, string | null>>;

export type RecordOpsJson = Readonly<
  Record<string, Readonly<Record<string, string | null>>>
>;

/** A put under an id that already holds other content. */
export class EditorRecordConflictError extends Error {
  override name = 'EditorRecordConflictError';
}

export const EMPTY_RECORD_STORE: RecordStore = Object.freeze({});

export const NO_RECORD_OPS: RecordOps = new Map();

const STORE_OF_JSON = new WeakMap<object, RecordStore>();

const treeOf = (store: RecordStore, set: string) =>
  Object.hasOwn(store, set) ? store[set] : null;

/** JSON text with object keys sorted, so equal records are equal strings. */
export const canonicalRecordJson = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalRecordJson).join(',')}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalRecordJson(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
};

/**
 * One put, checked as a JSON object and stored as its canonical text. An id
 * names its record's content, so a put of other content under an id `store`
 * already holds is refused.
 */
export const recordPut = (
  store: RecordStore,
  set: string,
  id: string,
  record: unknown
): RecordOps => {
  assertEditorJsonValue(record, `Record ${id} in record set ${set}`);
  if (!isRecord(record)) {
    throw new TypeError(`Record ${id} in record set ${set} must be an object.`);
  }

  const json = canonicalRecordJson(record);
  const existing = getRecord(store, set, id);

  if (existing !== undefined && existing !== json) {
    throw new EditorRecordConflictError(
      `Record ${id} in ${set} already holds other content.`
    );
  }

  return new Map([[set, new Map([[id, json]])]]);
};

export const recordDrop = (set: string, id: string): RecordOps =>
  new Map([[set, new Map([[id, null]])]]);

export const getRecord = (store: RecordStore, set: string, id: string) =>
  persistentMapGet(treeOf(store, set), id);

/** Whether some id in the set starts with `prefix`, in one ceiling lookup. */
export const hasRecordWithPrefix = (
  store: RecordStore,
  set: string,
  prefix: string
) => {
  const found = persistentMapCeiling(treeOf(store, set), prefix);

  return found !== undefined && found[0].startsWith(prefix);
};

export const getRecordCount = (store: RecordStore, set: string) =>
  persistentMapSize(treeOf(store, set));

export const getRecordSetVersion = (
  store: RecordStore,
  set: string
): RecordSetVersion => treeOf(store, set);

export const recordSetChanges = (
  before: RecordSetVersion,
  after: RecordSetVersion
) => persistentMapChanges(before, after);

/** `store` without any record of `set`. */
export const withoutRecordSet = (store: RecordStore, set: string) => {
  if (!Object.hasOwn(store, set)) return store;

  const { [set]: _dropped, ...rest } = store;

  return Object.freeze(rest);
};

export const getRecordEntries = (store: RecordStore, set: string) =>
  persistentMapEntries(treeOf(store, set));

export const applyRecordOps = (
  store: RecordStore,
  ops: RecordOps
): RecordStore => {
  let next: Record<string, RecordTree> | null = null;

  for (const [set, writes] of ops) {
    const before = treeOf(store, set);
    let tree = before;

    for (const [id, json] of writes) {
      if (json === null) {
        tree = persistentMapDelete(tree, id);
      } else if (persistentMapGet(tree, id) !== json) {
        tree = persistentMapSet(tree, id, json);
      }
    }

    if (tree !== before) {
      next ??= { ...store };
      if (tree) next[set] = tree;
      else delete next[set];
    }
  }

  return next ? Object.freeze(next) : store;
};

/** Compose two writes in sequence; the later write to an id wins. */
export const composeRecordOps = (
  first: RecordOps,
  second: RecordOps
): RecordOps => {
  if (first.size === 0) return second;
  if (second.size === 0) return first;

  const composed = new Map(first);

  for (const [set, writes] of second) {
    const prior = composed.get(set);

    composed.set(set, prior ? new Map([...prior, ...writes]) : writes);
  }

  return composed;
};

export const invertRecordOps = (
  before: RecordStore,
  ops: RecordOps
): RecordOps => {
  const inverse = new Map<string, ReadonlyMap<string, string | null>>();

  for (const [set, writes] of ops) {
    const tree = treeOf(before, set);
    const undo = new Map<string, string | null>();

    for (const [id, json] of writes) {
      const prior = persistentMapGet(tree, id) ?? null;

      if (prior !== json) undo.set(id, prior);
    }

    if (undo.size > 0) inverse.set(set, undo);
  }

  return inverse;
};

export const filterRecordOps = (
  ops: RecordOps,
  keep: (set: string) => boolean
): RecordOps => {
  if ([...ops.keys()].every(keep)) return ops;

  return new Map([...ops].filter(([set]) => keep(set)));
};

/** `ops` without its drops. */
export const recordPutsOf = (ops: RecordOps): RecordOps => {
  const puts = new Map<string, ReadonlyMap<string, string | null>>();

  for (const [set, writes] of ops) {
    const kept = new Map([...writes].filter(([, json]) => json !== null));

    if (kept.size > 0) puts.set(set, kept);
  }

  return puts;
};

/** The writes that turn `before` into `after`, walking only changed sets. */
export const recordOpsBetween = (
  before: RecordStore,
  after: RecordStore
): RecordOps => {
  if (before === after) return NO_RECORD_OPS;

  const ops = new Map<string, ReadonlyMap<string, string | null>>();

  for (const set of new Set([...Object.keys(before), ...Object.keys(after)])) {
    const beforeTree = treeOf(before, set);
    const afterTree = treeOf(after, set);

    if (beforeTree === afterTree) continue;

    const writes = new Map<string, string | null>();

    for (const id of persistentMapChanges(beforeTree, afterTree)) {
      writes.set(id, persistentMapGet(afterTree, id) ?? null);
    }

    if (writes.size > 0) ops.set(set, writes);
  }

  return ops;
};

export const recordOpsToJson = (ops: RecordOps): RecordOpsJson =>
  Object.fromEntries(
    [...ops].map(([set, writes]) => [set, Object.fromEntries(writes)])
  );

const isCanonicalRecordJson = (write: unknown) => {
  if (typeof write !== 'string') return false;

  try {
    const record: unknown = JSON.parse(write);

    return isRecord(record) && canonicalRecordJson(record) === write;
  } catch {
    return false;
  }
};

export const recordOpsFromJson = (json: unknown): RecordOps => {
  if (!isRecord(json)) throw new Error('Invalid record writes.');

  return new Map(
    Object.entries(json).map(([set, writes]) => {
      if (
        !isRecord(writes) ||
        !Object.values(writes).every(
          (write) => write === null || isCanonicalRecordJson(write)
        )
      ) {
        throw new Error(`Invalid record writes for ${set}.`);
      }

      return [
        set,
        new Map(Object.entries(writes) as Array<[string, string | null]>),
      ];
    })
  );
};

const parseRecordStore = (json: Readonly<Record<string, unknown>>) => {
  const store: Record<string, RecordTree> = {};

  for (const [set, records] of Object.entries(json)) {
    if (!isRecord(records)) {
      throw new Error(`Invalid records for record set ${set}.`);
    }

    const tree = persistentMapFromSorted(
      Object.keys(records)
        .sort()
        .map((id) => {
          const record = records[id];

          if (!isRecord(record)) {
            throw new Error(`Invalid record ${id} in record set ${set}.`);
          }

          return [id, canonicalRecordJson(record)] as const;
        })
    );

    if (tree) store[set] = tree;
  }

  return Object.freeze(store);
};

/**
 * Parse a document's records, canonicalizing each once. JSON this module
 * serialized, or frozen JSON it parsed before, returns its store as is.
 */
export const recordStoreFromJson = (json: unknown): RecordStore => {
  if (json === undefined) return EMPTY_RECORD_STORE;
  if (typeof json === 'object' && json !== null) {
    const known = STORE_OF_JSON.get(json);

    if (known) return known;
  }
  if (!isRecord(json)) throw new Error('Invalid document records.');
  assertEditorJsonValue(json, 'Document records');

  const store = parseRecordStore(json);

  if (Object.isFrozen(json)) STORE_OF_JSON.set(json, store);

  return store;
};

export const recordStoreToJson = (
  store: RecordStore
): EditorDocumentRecords => {
  const json = deepFreeze(
    Object.fromEntries(
      Object.entries(store).map(([set, tree]) => [
        set,
        Object.fromEntries(
          [...persistentMapEntries(tree)].map(([id, text]) => [
            id,
            JSON.parse(text) as Readonly<Record<string, unknown>>,
          ])
        ),
      ])
    )
  );

  STORE_OF_JSON.set(json, store);

  return json;
};

// A document value carries its records here rather than as JSON, so every
// version of a value shares the store's tree nodes and holds no JSON copy.
const VALUE_RECORDS = new WeakMap<object, RecordStore>();

/**
 * The records beside a document value: the store core attached to it, or its
 * `records` JSON, or none.
 */
export const getValueRecords = (
  value: Readonly<{ records?: EditorDocumentRecords }>
): RecordStore =>
  VALUE_RECORDS.get(value) ?? recordStoreFromJson(value.records);

/** Whether a value says what its records are, as a store or as JSON. */
export const hasValueRecords = (
  value: Readonly<{ records?: EditorDocumentRecords }>
) => VALUE_RECORDS.has(value) || value.records !== undefined;

/** Attach `store` to a value object that no other store was attached to. */
export const withValueRecords = <T extends object>(
  value: T,
  store: RecordStore
): T => {
  VALUE_RECORDS.set(value, store);

  return value;
};

// Only the latest store's JSON stays memoized, so the store versions history
// keeps hold no JSON.
let latestJson: Readonly<{
  json: EditorDocumentRecords;
  store: RecordStore;
}> | null = null;

const latestRecordsJson = (store: RecordStore) => {
  if (latestJson?.store !== store) {
    latestJson = { json: recordStoreToJson(store), store };
  }

  return latestJson.json;
};

/**
 * `value` with `fields` over it and `ops` applied to its records. A spread
 * alone would drop the records a value carries beside its JSON.
 */
export const deriveValue = <V extends object>(
  value: V,
  fields: Partial<V>,
  ops: RecordOps = NO_RECORD_OPS
): V => {
  const store = getValueRecords(value);
  const next = copyFields({}, value as Readonly<Record<string, unknown>>, [
    'records',
  ]);

  for (const [key, field] of Object.entries(fields)) next[key] = field;

  return withValueRecords(next as V, applyRecordOps(store, ops));
};

/** Attach `store` and give the value its `records` field when it holds any. */
export const showValueRecords = <T extends Record<string, unknown>>(
  value: T,
  store: RecordStore,
  toJson: (store: RecordStore) => EditorDocumentRecords = latestRecordsJson
): T => {
  if (Object.keys(store).length > 0) {
    (value as Record<string, unknown>).records = toJson(store);
  }

  return withValueRecords(value, store);
};
