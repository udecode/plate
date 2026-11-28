import type { EditorDocumentRecords } from '../interfaces/editor';
import type { SchemaRecordSet } from '../interfaces/schema';
import { deepFreeze, isRecord } from './change/json';
import { copyFields } from './change/lazy-root';
import { freezeOwnedJsonValue, isOwnedJsonValue } from './clone';
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
import {
  assertEditorJsonValue,
  getEditorJsonArrayItems,
  getEditorJsonRecordEntries,
  setLazyJsonField,
} from './value-codec';
import { countCoreWork } from './work';

type RecordJson = Readonly<Record<string, unknown>>;

type StoredRecord = { json: RecordJson | undefined; readonly text: string };

type RecordTree = PersistentMapNode<StoredRecord>;

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

const jsonOf = (record: StoredRecord) => {
  record.json ??= freezeOwnedJsonValue(
    deepFreeze(JSON.parse(record.text) as RecordJson)
  );

  return record.json;
};

const sameRecord = (a: StoredRecord, b: StoredRecord) =>
  a === b || a.text === b.text;

// A key that may be an array index, which every object lists first, in number
// order.
const INDEX_KEY = /^(?:0|[1-9]\d*)$/;

const NOT_JSON = new Error('Not JSON.');

const notJson = (): never => {
  throw NOT_JSON;
};

// `JSON.stringify` reads through getters, `toJSON` and proxy traps, so the text
// is written from a plain copy of the own values the walk checked.
const recordTextOf = (
  record: RecordJson,
  read?: (plain: RecordJson) => void
): string | undefined => {
  const open = new WeakSet<object>();
  let indexKeys = false;
  const copy = (value: unknown): unknown => {
    switch (typeof value) {
      case 'boolean':
      case 'string': {
        return value;
      }
      case 'number': {
        return Number.isFinite(value) && !Object.is(value, -0)
          ? value
          : notJson();
      }
      case 'object': {
        break;
      }
      default: {
        return notJson();
      }
    }
    if (value === null) return null;
    if (open.has(value)) notJson();
    open.add(value);
    try {
      if (Array.isArray(value)) {
        return (getEditorJsonArrayItems(value) ?? notJson()).map(copy);
      }

      const entries = (getEditorJsonRecordEntries(value) ?? notJson())
        .map(([key, item]) => {
          indexKeys ||= INDEX_KEY.test(key);

          return [key, copy(item)] as const;
        })
        .sort(([a], [b]) => (a < b ? -1 : 1));

      return Object.fromEntries(entries);
    } finally {
      open.delete(value);
    }
  };
  let plain: unknown;

  try {
    plain = copy(record);
  } catch (error) {
    if (error === NOT_JSON) return undefined;
    throw error;
  }
  countCoreWork('recordTexts');
  read?.(plain as RecordJson);

  return indexKeys ? canonicalRecordJson(plain) : JSON.stringify(plain);
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
  const label = `Record ${id} in record set ${set}`;

  if (!isRecord(record)) {
    assertEditorJsonValue(record, label);
    throw new TypeError(`${label} must be an object.`);
  }

  const json = recordTextOf(record);

  if (json === undefined) {
    throw new Error(`${label} must encode to JSON-compatible data.`);
  }

  const existing = getRecordText(store, set, id);

  if (existing !== undefined && existing !== json) {
    throw new EditorRecordConflictError(
      `Record ${id} in ${set} already holds other content.`
    );
  }

  return new Map([[set, new Map([[id, json]])]]);
};

export const recordDrop = (set: string, id: string): RecordOps =>
  new Map([[set, new Map([[id, null]])]]);

export const hasRecord = (store: RecordStore, set: string, id: string) =>
  persistentMapGet(treeOf(store, set), id) !== undefined;

export const getRecordText = (store: RecordStore, set: string, id: string) => {
  const record = persistentMapGet(treeOf(store, set), id);

  return record?.text;
};

/** Whether some id in the set starts with `prefix`, in one ceiling lookup. */
export const hasRecordWithPrefix = (
  store: RecordStore,
  set: string,
  prefix: string
) => {
  const found = persistentMapCeiling(treeOf(store, set), prefix);

  return found !== undefined && found[0].startsWith(prefix);
};

export function* getRecordsWithPrefix(
  store: RecordStore,
  set: string,
  prefix: string
): Generator<readonly [string, string]> {
  const tree = treeOf(store, set);
  let found = persistentMapCeiling(tree, prefix);

  while (found !== undefined && found[0].startsWith(prefix)) {
    yield [found[0], found[1].text] as const;
    found = persistentMapCeiling(tree, `${found[0]}\u0000`);
  }
}

export const getRecordCount = (store: RecordStore, set: string) =>
  persistentMapSize(treeOf(store, set));

export const getRecordSetVersion = (
  store: RecordStore,
  set: string
): RecordSetVersion => treeOf(store, set);

export const readRecord = (
  version: RecordSetVersion,
  id: string
): RecordJson | undefined => {
  const record = persistentMapGet(version, id);

  return record && jsonOf(record);
};

export const recordSetChanges = (
  before: RecordSetVersion,
  after: RecordSetVersion
) => persistentMapChanges(before, after, sameRecord);

export const recordSetIds = (version: RecordSetVersion) =>
  recordSetChanges(null, version);

/** `store` without any record of `set`. */
export const withoutRecordSet = (store: RecordStore, set: string) => {
  if (!Object.hasOwn(store, set)) return store;

  const { [set]: _dropped, ...rest } = store;

  return Object.freeze(rest);
};

/**
 * Each record in the set, in id order.
 *
 * @yields {readonly [string, string]} Its id and canonical text.
 */
export function* getRecordEntries(
  store: RecordStore,
  set: string
): Generator<readonly [string, string]> {
  for (const [id, record] of persistentMapEntries(treeOf(store, set))) {
    yield [id, record.text] as const;
  }
}

/**
 * Each id in the set, in id order, without reading a record.
 *
 * @yields {string} The id.
 */
export function* getRecordIds(
  store: RecordStore,
  set: string
): Generator<string> {
  for (const [id] of persistentMapEntries(treeOf(store, set))) yield id;
}

export const recordStoresEqual = (a: RecordStore, b: RecordStore) =>
  a === b ||
  [...new Set([...Object.keys(a), ...Object.keys(b)])].every(
    (set) =>
      persistentMapChanges(treeOf(a, set), treeOf(b, set), sameRecord)
        .length === 0
  );

export const applyRecordOps = (
  store: RecordStore,
  ops: RecordOps
): RecordStore => {
  let next: Record<string, RecordTree> | null = null;

  for (const [set, writes] of ops) {
    const before = treeOf(store, set);
    let tree = before;

    countCoreWork('recordWrites', writes.size);
    if (before) {
      for (const [id, json] of writes) {
        if (json === null) {
          tree = persistentMapDelete(tree, id);
        } else {
          const held = persistentMapGet(tree, id);

          if (held === undefined || held.text !== json) {
            tree = persistentMapSet(tree, id, { json: undefined, text: json });
          }
        }
      }
    } else {
      tree = persistentMapFromSorted(
        [...writes]
          .filter((write): write is [string, string] => write[1] !== null)
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([id, text]) => [id, { json: undefined, text }] as const)
      );
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

const withoutIds = (
  ops: RecordOps,
  ids: ReadonlyMap<string, ReadonlySet<string>>
): RecordOps => {
  if (ids.size === 0) return ops;

  const kept = new Map<string, ReadonlyMap<string, string | null>>();

  for (const [set, writes] of ops) {
    const lost = ids.get(set);
    const left = lost
      ? new Map([...writes].filter(([id]) => !lost.has(id)))
      : writes;

    if (left.size > 0) kept.set(set, left);
  }

  return kept;
};

export const transformRecordOps = (first: RecordOps, second: RecordOps) => {
  const firstLost = new Map<string, Set<string>>();
  const secondLost = new Map<string, Set<string>>();
  const unequal: Array<Readonly<{ id: string; set: string }>> = [];

  for (const [set, secondWrites] of second) {
    const firstWrites = first.get(set);

    if (!firstWrites) continue;

    for (const [id, secondWrite] of secondWrites) {
      const firstWrite = firstWrites.get(id);

      if (firstWrite === undefined || firstWrite === secondWrite) continue;
      if (firstWrite !== null && secondWrite !== null) {
        unequal.push({ id, set });
      }

      const lost = firstWrite === null ? firstLost : secondLost;
      const ids = lost.get(set) ?? new Set();

      lost.set(set, ids.add(id));
    }
  }

  return {
    first: withoutIds(first, firstLost),
    second: withoutIds(second, secondLost),
    unequal,
  };
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
      const held = persistentMapGet(tree, id);
      const prior = held === undefined ? null : held.text;

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

    for (const id of persistentMapChanges(beforeTree, afterTree, sameRecord)) {
      const record = persistentMapGet(afterTree, id);

      writes.set(id, record === undefined ? null : record.text);
    }

    if (writes.size > 0) ops.set(set, writes);
  }

  return ops;
};

export const recordOpsToJson = (ops: RecordOps): RecordOpsJson =>
  Object.fromEntries(
    [...ops].map(([set, writes]) => [set, Object.fromEntries(writes)])
  );

const keysSorted = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null) return true;
  if (Array.isArray(value)) return value.every(keysSorted);

  let last: string | undefined;

  for (const [key, item] of Object.entries(value)) {
    if ((last !== undefined && last >= key) || !keysSorted(item)) return false;
    last = key;
  }

  return true;
};

const isCanonicalRecordJson = (write: unknown) => {
  if (typeof write !== 'string') return false;

  try {
    const record: unknown = JSON.parse(write);

    return (
      isRecord(record) &&
      (keysSorted(record)
        ? JSON.stringify(record)
        : canonicalRecordJson(record)) === write
    );
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

const invalidRecords = (): never => {
  throw new Error('Document records must encode to JSON-compatible data.');
};

type NamedBy = NonNullable<SchemaRecordSet['namedBy']>;

type RecordSetRules = ReadonlyMap<string, Readonly<{ namedBy?: NamedBy }>>;

const NO_RULES: RecordSetRules = new Map();

const namedIdsOf = (rules: RecordSetRules) => {
  const named = new Map<string, Set<string>>();
  const unreadable = new Set<string>();
  const namers = new Map<
    string,
    Array<readonly [string, Set<string>, NamedBy['names']]>
  >();

  for (const [set, { namedBy }] of rules) {
    if (!namedBy) continue;
    const ids = new Set<string>();

    named.set(set, ids);
    namers.set(namedBy.set, [
      ...(namers.get(namedBy.set) ?? []),
      [set, ids, namedBy.names],
    ]);
  }

  return {
    keeps: (set: string) => {
      const ids = named.get(set);
      const keep = rules.get(set)?.namedBy?.keep;

      return ids && !unreadable.has(set)
        ? (id: string) => ids.has(id) || keep?.(id) === true
        : undefined;
    },
    named,
    namers,
    read: (set: string, record: RecordJson) => {
      for (const [target, ids, names] of namers.get(set) ?? []) {
        if (unreadable.has(target)) continue;

        let listed: unknown;

        try {
          listed = names(record);
        } catch {
          listed = null;
        }
        if (!Array.isArray(listed)) unreadable.add(target);
        else for (const id of listed) if (typeof id === 'string') ids.add(id);
      }
    },
  };
};

const parseRecordStore = (
  json: Readonly<Record<string, unknown>>,
  rules: RecordSetRules
) => {
  const ids = namedIdsOf(rules);
  const sets = getEditorJsonRecordEntries(json) ?? invalidRecords();
  const trees = new Map<string, RecordTree | null>();
  const load = (set: string, records: unknown) => {
    const keeps = ids.keeps(set);

    trees.set(
      set,
      persistentMapFromSorted(
        [...(getEditorJsonRecordEntries(records, keeps) ?? invalidRecords())]
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([id, record]) => {
            if (!isRecord(record)) {
              throw new Error(`Invalid record ${id} in record set ${set}.`);
            }

            return [
              id,
              {
                json: undefined,
                text:
                  recordTextOf(record, (plain) => ids.read(set, plain)) ??
                  invalidRecords(),
              },
            ] as const;
          })
      )
    );
  };

  countCoreWork('recordLoads');
  for (const [set, records] of sets) {
    if (!isRecord(records)) {
      throw new Error(`Invalid records for record set ${set}.`);
    }
  }
  const namedLast = [
    ...sets.filter(([set]) => !ids.named.has(set)),
    ...sets.filter(([set]) => ids.named.has(set)),
  ];

  for (const [set, records] of namedLast) load(set, records);

  return Object.freeze(
    Object.fromEntries(
      sets.flatMap(([set]) => {
        const tree = trees.get(set);

        return tree ? [[set, tree] as const] : [];
      })
    )
  );
};

export const collectLiveStore = (
  store: RecordStore,
  rules: RecordSetRules
): RecordStore => {
  const ids = namedIdsOf(rules);

  for (const set of ids.namers.keys()) {
    for (const [, text] of getRecordEntries(store, set)) {
      ids.read(set, JSON.parse(text) as RecordJson);
    }
  }

  return Object.freeze(
    Object.fromEntries(
      Object.entries(store).flatMap(([set, tree]) => {
        const keeps = ids.keeps(set);
        const kept = keeps
          ? [...persistentMapEntries(tree)].filter(([id]) => keeps(id))
          : undefined;

        if (!kept || kept.length === persistentMapSize(tree)) {
          return [[set, tree] as const];
        }

        const collected = persistentMapFromSorted(kept);

        return collected ? [[set, collected] as const] : [];
      })
    )
  );
};

export const collectRecordStore = (
  json: unknown,
  rules: RecordSetRules
): RecordStore => {
  if (json === undefined) return EMPTY_RECORD_STORE;

  const known =
    typeof json === 'object' && json !== null
      ? STORE_OF_JSON.get(json)
      : undefined;

  if (known) return collectLiveStore(known, rules);
  if (!isRecord(json)) throw new Error('Invalid document records.');

  return parseRecordStore(json, rules);
};

export const recordStoreFromJson = (json: unknown): RecordStore => {
  if (json === undefined) return EMPTY_RECORD_STORE;
  if (typeof json === 'object' && json !== null) {
    const known = STORE_OF_JSON.get(json);

    if (known) return known;
  }
  if (!isRecord(json)) throw new Error('Invalid document records.');

  const store = parseRecordStore(json, NO_RULES);

  if (isOwnedJsonValue(json)) STORE_OF_JSON.set(json, store);

  return store;
};

const setTableOf = (tree: RecordTree) => {
  let table: Readonly<Record<string, RecordJson>> | undefined;

  return {
    tree,
    get value() {
      if (!table) countCoreWork('recordTables');
      table ??= freezeOwnedJsonValue(
        Object.fromEntries(
          Array.from(persistentMapEntries(tree), ([id, record]) => [
            id,
            jsonOf(record),
          ])
        )
      );

      return table;
    },
  };
};

const TABLES_OF_JSON = new WeakMap<
  object,
  ReadonlyMap<string, ReturnType<typeof setTableOf>>
>();

let latestJson: Readonly<{
  json: EditorDocumentRecords;
  store: RecordStore;
}> | null = null;

export const isBuiltRecordsJson = (json: unknown) =>
  typeof json === 'object' && json !== null && TABLES_OF_JSON.has(json);

export const recordStoreToJson = (
  store: RecordStore,
  reuseTablesFrom: EditorDocumentRecords | undefined = latestJson?.json
): EditorDocumentRecords => {
  if (latestJson?.store === store) return latestJson.json;

  const latest = reuseTablesFrom && TABLES_OF_JSON.get(reuseTablesFrom);
  const json: EditorDocumentRecords = {};

  countCoreWork('recordsJsonObjects');
  const tables = new Map<string, ReturnType<typeof setTableOf>>();

  for (const [set, tree] of Object.entries(store)) {
    const shared = latest?.get(set);
    const table = shared?.tree === tree ? shared : setTableOf(tree);

    tables.set(set, table);
    setLazyJsonField(json, set, table);
  }
  freezeOwnedJsonValue(json);
  STORE_OF_JSON.set(json, store);
  TABLES_OF_JSON.set(json, tables);
  latestJson = { json, store };

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

export const collectValueRecords = (
  value: Readonly<{ records?: EditorDocumentRecords }>,
  rules: RecordSetRules
): RecordStore => {
  const known = VALUE_RECORDS.get(value);

  return known
    ? collectLiveStore(known, rules)
    : collectRecordStore(value.records, rules);
};

/** Whether a value says what its records are, as a store or as JSON. */
export const hasValueRecords = (
  value: Readonly<{ records?: EditorDocumentRecords }>
) => VALUE_RECORDS.has(value) || value.records !== undefined;

export const getAttachedValueRecords = (value: object) =>
  VALUE_RECORDS.get(value);

export const transferValueRecords = <T extends object>(
  from: unknown,
  to: T
): T => {
  if (from === null || typeof from !== 'object' || from === to) return to;

  const store = VALUE_RECORDS.get(from);

  return store ? withValueRecords(to, store) : to;
};

/** Attach `store` to a value object that no other store was attached to. */
export const withValueRecords = <T extends object>(
  value: T,
  store: RecordStore
): T => {
  VALUE_RECORDS.set(value, store);

  return value;
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

export const withoutValueRoots = <
  V extends Readonly<{
    records?: EditorDocumentRecords;
    roots?: Readonly<Record<string, unknown>>;
  }>,
>(
  value: V,
  dropped: ReadonlySet<string>
): V => {
  const { roots, ...rest } = value;
  const kept = Object.entries(roots ?? {}).filter(
    ([root]) => !dropped.has(root)
  );

  return withValueRecords(
    (kept.length > 0
      ? { ...rest, roots: Object.fromEntries(kept) }
      : rest) as V,
    getValueRecords(value)
  );
};

/** Attach `store` and give the value its `records` field when it holds any. */
export const showValueRecords = <T extends Record<string, unknown>>(
  value: T,
  store: RecordStore,
  toJson: (store: RecordStore) => EditorDocumentRecords = recordStoreToJson
): T => {
  if (Object.keys(store).length > 0) {
    (value as Record<string, unknown>).records = toJson(store);
  }

  return withValueRecords(value, store);
};
