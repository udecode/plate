import {
  createTreeIndex,
  createTreeIndexChildren,
  createTreeIndexNode,
  ResolvedTokenCursor,
  type TreeIndexChildren,
  type TreeIndexNode,
} from './resolved-token-cursor';
import type {
  EditorTransactionTopLevelRange,
  NamedRootKey,
  RuntimeId,
  TopLevelRuntimeRange,
} from '../interfaces/editor';
import { profileCoreDuration } from './profiling';
import { assertEditorJsonValue } from './value-codec';
import {
  preparedRuntimeIdAt,
  preparedRuntimeIdOffset,
  type PreparedRuntimeIdRange,
  reservePreparedRuntimeIdRange,
} from '../utils/runtime-ids';

type JsonRecord = Record<string, unknown>;

export type JsonNode = JsonRecord &
  (
    | { children: readonly JsonNode[]; text?: never }
    | { children?: never; text: string }
  );

export type JsonEditorValue = JsonRecord & {
  children: readonly JsonNode[];
  roots?: Readonly<Record<string, readonly JsonNode[]>>;
};

/** @internal Concrete placement used to resolve schema-owned property laws. */
export type DocumentPropertyContext = Readonly<{
  /** Element ancestors beyond the text parent, or including the element parent. */
  ancestors: readonly string[];
  parent: string | null;
  path: readonly number[];
  placement: 'element' | 'text';
  /** `null` addresses the implicit primary root. */
  root: string | null;
  /** Element type, or the parent type for text properties. */
  type: string;
}>;

/** @internal Resolve one property merge law at its concrete document location. */
export type DocumentSetPropertyResolver = (
  node: JsonNode,
  key: string,
  context: DocumentPropertyContext
) => boolean;

export type JsonPoint = {
  offset: number;
  path: readonly number[];
};

type JsonElementNode = JsonRecord & {
  children: readonly JsonNode[];
};

type JsonTextNode = JsonRecord & {
  text: string;
};

type NodeKind = 'element' | 'text';

const PREPARED_SOURCE_TOKEN = Symbol('plite.prepared-source-token');
const CLAIMED_PREPARED_SOURCES = new WeakSet<object>();
const PREPARED_TOKEN_NEXT = new WeakMap<JsonToken, JsonToken | null>();

const claimPreparedNodeSlice = (nodes: readonly JsonNode[]) => {
  const claimed: object[] = [];
  const local = new WeakSet<object>();
  const collect = (node: JsonNode): boolean => {
    if (local.has(node) || CLAIMED_PREPARED_SOURCES.has(node)) return false;

    local.add(node);
    claimed.push(node);

    return !isElementNode(node) || node.children.every(collect);
  };

  if (!nodes.every(collect)) return false;
  claimed.forEach((node) => {
    CLAIMED_PREPARED_SOURCES.add(node);
  });

  return true;
};

type OpenToken = {
  [PREPARED_SOURCE_TOKEN]?: true;
  kind: 'open';
  nodeKind: NodeKind;
  props: Readonly<JsonRecord>;
  sourceLength?: number;
  sourceNode?: JsonNode;
  sourceTokenCount?: number;
};

type TextToken = {
  kind: 'text';
  text: string;
};

type CloseToken = {
  kind: 'close';
  nodeKind: NodeKind;
};

type JsonToken = CloseToken | OpenToken | TextToken;

type JsonTokenData =
  | {
      kind: 'close';
      nodeKind: NodeKind;
    }
  | {
      kind: 'open';
      nodeKind: NodeKind;
      props: JsonRecord;
    }
  | {
      kind: 'text';
      text: string;
    };

type IndexEntry = {
  contentFrom: number;
  contentTo: number;
  from: number;
  kind: NodeKind;
  path: readonly number[];
  to: number;
};

export type ChangeSection = {
  from: number;
  insert?: DocumentSlice;
  /** Modify the properties of the node whose open token starts at `from`. */
  properties?: NodePropertyDelta;
  to?: number;
};

/**
 * An explicit node-property patch. `set` and `unset` replace scalar values;
 * `add` and `remove` treat array values as deterministic JSON sets.
 */
export type NodePropertyDelta = Readonly<{
  add?: Readonly<Record<string, readonly unknown[]>>;
  remove?: Readonly<Record<string, readonly unknown[]>>;
  set?: Readonly<JsonRecord>;
  unset?: readonly string[];
}>;

export type TrackMode = 'after' | 'around' | 'before';

export type DocumentChangedRange = Readonly<{
  fromAfter: number;
  fromBefore: number;
  /** `null` addresses the implicit primary root. */
  root: string | null;
  toAfter: number;
  toBefore: number;
}>;

export type DocumentChangeRootClassification = Readonly<{
  paths: readonly (readonly number[])[];
  properties: boolean;
  structure: boolean;
  text: boolean;
}>;

/** @internal Final-coordinate node candidate for runtime identity publication. */
export type DocumentChangeRuntimeCandidate = Readonly<{
  node: JsonNode;
  path: readonly number[];
}>;

/** @internal A token slice cannot form a balanced JSON node tree here. */
export class DocumentSliceStructureError extends Error {}

export type IndexedNodeRange = Readonly<{
  contentFrom: number;
  contentTo: number;
  from: number;
  kind: NodeKind;
  path: readonly number[];
  to: number;
}>;

export type DocumentCorrection = (
  value: JsonEditorValue,
  changedRanges: readonly DocumentChangedRange[]
) => JsonEditorValue;

type PropertyModification =
  | Readonly<{ key: string; type: 'add'; values: readonly unknown[] }>
  | Readonly<{ key: string; type: 'remove'; values: readonly unknown[] }>
  | Readonly<{ key: string; type: 'set'; value: unknown }>
  | Readonly<{ key: string; type: 'unset' }>;

type PropertyModificationJson =
  | { key: string; type: 'add' | 'remove'; values: readonly unknown[] }
  | { key: string; type: 'set'; value: unknown }
  | { key: string; type: 'unset' };

type PropertyDeltaJson = {
  operations: readonly PropertyModificationJson[];
  version: 1;
};

type ChangeSetJson = readonly {
  length: number;
  properties?: PropertyDeltaJson;
  replacement?: readonly JsonTokenData[];
}[];

type DocumentChangeJson = {
  createRoots?: readonly string[];
  deleteRoots?: readonly string[];
  primary?: ChangeSetJson;
  roots?: Readonly<Record<string, ChangeSetJson>>;
  version: 3;
};

const unsafeDocumentRootKeys = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

function assertDocumentRootKey(root: unknown): asserts root is string {
  if (
    typeof root !== 'string' ||
    root.length === 0 ||
    unsafeDocumentRootKeys.has(root)
  ) {
    throw new Error(`Invalid document root key ${String(root)}.`);
  }
}

function assertNamedDocumentRootKey(root: unknown): asserts root is string {
  assertDocumentRootKey(root);

  if (root === 'main') {
    throw new Error('[Plite] Omit root to target the primary document.');
  }
}

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasFunctions = (
  value: Record<PropertyKey, unknown>,
  keys: readonly PropertyKey[]
) => keys.every((key) => typeof value[key] === 'function');

const readStructuralCollection = (
  value: unknown,
  methods: readonly PropertyKey[]
): readonly unknown[] | null => {
  if (!isRecord(value)) return null;

  const collection = value as Record<PropertyKey, unknown>;

  if (
    !Number.isSafeInteger(collection.size) ||
    (collection.size as number) < 0 ||
    typeof Reflect.get(collection, Symbol.iterator) !== 'function' ||
    !hasFunctions(collection, methods)
  ) {
    return null;
  }

  try {
    const entries = [...(value as unknown as Iterable<unknown>)];

    return entries.length === collection.size ? entries : null;
  } catch {
    return null;
  }
};

const callStructuralCollectionMethod = (
  collection: Record<PropertyKey, unknown>,
  method: PropertyKey,
  args: readonly unknown[] = []
) => {
  const callback = collection[method];

  if (typeof callback !== 'function') {
    throw new TypeError('Invalid structural collection method.');
  }

  return Reflect.apply(callback, collection, args);
};

const readStructuralMap = (
  value: unknown
): readonly (readonly [unknown, unknown])[] | null => {
  const entries = readStructuralCollection(value, ['get', 'has', 'keys']);

  if (!entries || !isRecord(value)) return null;

  try {
    const keys = [
      ...(callStructuralCollectionMethod(value, 'keys') as Iterable<unknown>),
    ];
    const absent = Symbol('document-change-map-probe');

    if (
      keys.length !== entries.length ||
      callStructuralCollectionMethod(value, 'has', [absent]) !== false ||
      callStructuralCollectionMethod(value, 'get', [absent]) !== undefined
    ) {
      return null;
    }

    return entries.map((entry, index) => {
      if (!Array.isArray(entry) || entry.length !== 2) {
        throw new TypeError('Invalid structural map entry.');
      }

      const key = entry[0];
      const item = entry[1];

      if (
        !Object.is(keys[index], key) ||
        callStructuralCollectionMethod(value, 'has', [key]) !== true ||
        !Object.is(callStructuralCollectionMethod(value, 'get', [key]), item)
      ) {
        throw new TypeError('Inconsistent structural map.');
      }

      return [key, item] as const;
    });
  } catch {
    return null;
  }
};

const readStructuralSet = (value: unknown): readonly unknown[] | null => {
  const entries = readStructuralCollection(value, ['has', 'values']);

  if (!entries || !isRecord(value)) return null;

  try {
    const values = [
      ...(callStructuralCollectionMethod(value, 'values') as Iterable<unknown>),
    ];
    const absent = Symbol('document-change-set-probe');

    if (
      values.length !== entries.length ||
      callStructuralCollectionMethod(value, 'has', [absent]) !== false ||
      values.some(
        (entry, index) =>
          !Object.is(entry, entries[index]) ||
          callStructuralCollectionMethod(value, 'has', [entry]) !== true
      )
    ) {
      return null;
    }

    return entries;
  } catch {
    return null;
  }
};

const isElementNode = (node: JsonNode): node is JsonElementNode =>
  Array.isArray(node.children);

const isTextNode = (node: JsonNode): node is JsonTextNode =>
  typeof node.text === 'string';

const jsonEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;

  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonEqual(value, right[index]))
    );
  }

  if (!isRecord(left) || !isRecord(right)) return false;

  const keys = Object.keys(left);

  return (
    keys.length === Object.keys(right).length &&
    keys.every(
      (key) => Object.hasOwn(right, key) && jsonEqual(left[key], right[key])
    )
  );
};

const cloneJson = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => cloneJson(item)) as T;
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneJson(item)])
    ) as T;
  }

  return value;
};

const deepFreeze = <T>(value: T): T => {
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);

    return Object.freeze(value);
  }

  if (isRecord(value)) {
    for (const item of Object.values(value)) deepFreeze(item);

    return Object.freeze(value) as T;
  }

  return value;
};

const cloneFrozen = <T>(value: T): T => deepFreeze(cloneJson(value));

const freezeReadonlyMap = <K, V>(
  entries: Iterable<readonly [K, V]>
): ReadonlyMap<K, V> => {
  const source = new Map(entries);
  Object.freeze(source);
  let view!: ReadonlyMap<K, V>;

  view = new Proxy(source, {
    defineProperty() {
      throw new TypeError('Cannot mutate a published DocumentChange map.');
    },
    deleteProperty() {
      throw new TypeError('Cannot mutate a published DocumentChange map.');
    },
    get(target, property) {
      if (property === 'clear' || property === 'delete' || property === 'set') {
        return () => {
          throw new TypeError('Cannot mutate a published DocumentChange map.');
        };
      }
      if (property === 'forEach') {
        return (
          callback: (value: V, key: K, map: ReadonlyMap<K, V>) => void,
          thisArg?: unknown
        ) =>
          target.forEach((value, key) => {
            callback.call(thisArg, value, key, view);
          });
      }

      const value = Reflect.get(target, property, target);

      return typeof value === 'function' ? value.bind(target) : value;
    },
    set() {
      throw new TypeError('Cannot mutate a published DocumentChange map.');
    },
  });

  return view;
};

const freezeReadonlySet = <T>(values: Iterable<T>): ReadonlySet<T> => {
  const source = new Set(values);
  Object.freeze(source);
  let view!: ReadonlySet<T>;

  view = new Proxy(source, {
    defineProperty() {
      throw new TypeError('Cannot mutate a published DocumentChange set.');
    },
    deleteProperty() {
      throw new TypeError('Cannot mutate a published DocumentChange set.');
    },
    get(target, property) {
      if (property === 'add' || property === 'clear' || property === 'delete') {
        return () => {
          throw new TypeError('Cannot mutate a published DocumentChange set.');
        };
      }
      if (property === 'forEach') {
        return (
          callback: (value: T, valueAgain: T, set: ReadonlySet<T>) => void,
          thisArg?: unknown
        ) =>
          target.forEach((value) => {
            callback.call(thisArg, value, value, view);
          });
      }

      const value = Reflect.get(target, property, target);

      return typeof value === 'function' ? value.bind(target) : value;
    },
    set() {
      throw new TypeError('Cannot mutate a published DocumentChange set.');
    },
  });

  return view;
};

const freezeRootClassification = (
  root: string,
  classification: DocumentChangeRootClassification
): DocumentChangeRootClassification => {
  assertEditorJsonValue(
    classification,
    `Document change classification for root "${root}"`
  );

  if (
    !isRecord(classification) ||
    !Object.keys(classification).every((key) =>
      ['paths', 'properties', 'structure', 'text'].includes(key)
    ) ||
    !Array.isArray(classification.paths) ||
    !classification.paths.every(
      (path) =>
        Array.isArray(path) &&
        path.every((segment) => Number.isSafeInteger(segment) && segment >= 0)
    ) ||
    typeof classification.properties !== 'boolean' ||
    typeof classification.structure !== 'boolean' ||
    typeof classification.text !== 'boolean'
  ) {
    throw new Error(
      `Invalid document change classification for root "${root}".`
    );
  }

  return Object.freeze({
    paths: Object.freeze(
      classification.paths.map((path) => Object.freeze([...path]))
    ),
    properties: classification.properties,
    structure: classification.structure,
    text: classification.text,
  });
};

const unsafeNodePropertyKeys = new Set(['__proto__', 'children', 'text']);

const assertNodePropertyKey: (key: unknown) => asserts key is string = (
  key
) => {
  if (
    typeof key !== 'string' ||
    key.length === 0 ||
    unsafeNodePropertyKeys.has(key)
  ) {
    throw new Error(`Invalid node property key ${String(key)}.`);
  }
};

const canonicalJsonKey = (value: unknown): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJsonKey(item)).join(',')}]`;
  }
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJsonKey(value[key])}`)
      .join(',')}}`;
  }

  return `${typeof value}:${JSON.stringify(value)}`;
};

const normalizeSetValues = (values: readonly unknown[]) => {
  assertEditorJsonValue(values, 'Set-valued node property');
  const unique: unknown[] = [];

  for (const value of values) {
    if (!unique.some((item) => jsonEqual(item, value))) {
      unique.push(cloneFrozen(value));
    }
  }

  return Object.freeze(
    unique.sort((left, right) => {
      const leftKey = canonicalJsonKey(left);
      const rightKey = canonicalJsonKey(right);

      return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
    })
  );
};

const clonePropertyModification = (
  modification: PropertyModification
): PropertyModification => {
  assertNodePropertyKey(modification.key);

  if (modification.type === 'set') {
    assertEditorJsonValue(modification.value, 'Node property value');

    return Object.freeze({
      key: modification.key,
      type: modification.type,
      value: cloneFrozen(modification.value),
    });
  }
  if (modification.type === 'unset') {
    return Object.freeze({ key: modification.key, type: modification.type });
  }

  return Object.freeze({
    key: modification.key,
    type: modification.type,
    values: normalizeSetValues(modification.values),
  });
};

const normalizePropertyDelta = (
  delta: NodePropertyDelta
): readonly PropertyModification[] => {
  assertEditorJsonValue(delta, 'Node property delta');

  if (!isRecord(delta)) throw new Error('Invalid node property delta.');

  const modifications: PropertyModification[] = [];
  const keyKinds = new Map<string, 'scalar' | 'set'>();
  const reserve = (key: string, kind: 'scalar' | 'set') => {
    assertNodePropertyKey(key);
    const existing = keyKinds.get(key);
    if (existing && (existing === 'scalar' || kind === 'scalar')) {
      throw new Error(`Node property delta repeats key ${key}.`);
    }
    keyKinds.set(key, kind);
  };

  if (delta.unset !== undefined) {
    if (!Array.isArray(delta.unset)) {
      throw new Error('Invalid node property delta.');
    }
    for (const key of [...delta.unset].sort()) {
      reserve(key, 'scalar');
      modifications.push(Object.freeze({ key, type: 'unset' }));
    }
  }

  if (delta.set !== undefined) {
    if (!isRecord(delta.set)) throw new Error('Invalid node property delta.');
    for (const key of Object.keys(delta.set).sort()) {
      reserve(key, 'scalar');
      modifications.push(
        clonePropertyModification({ key, type: 'set', value: delta.set[key] })
      );
    }
  }

  for (const type of ['remove', 'add'] as const) {
    const entries = delta[type];

    if (entries === undefined) continue;
    if (!isRecord(entries)) throw new Error('Invalid node property delta.');

    for (const key of Object.keys(entries).sort()) {
      const values = entries[key];

      reserve(key, 'set');
      if (!Array.isArray(values))
        throw new Error('Invalid node property delta.');

      const normalized = normalizeSetValues(values);

      if (normalized.length > 0) {
        modifications.push(Object.freeze({ key, type, values: normalized }));
      }
    }
  }

  return Object.freeze(modifications);
};

const applyPropertyModifications = (
  props: Readonly<JsonRecord>,
  modifications: readonly PropertyModification[]
) => {
  const next = { ...props };

  for (const modification of modifications) {
    const { key } = modification;

    if (modification.type === 'set') {
      next[key] = cloneFrozen(modification.value);
      continue;
    }
    if (modification.type === 'unset') {
      delete next[key];
      continue;
    }

    const current = Object.hasOwn(next, key) ? next[key] : undefined;

    if (current !== undefined && !Array.isArray(current)) {
      throw new Error(`Set-valued node property ${key} is not an array.`);
    }

    const currentValues = normalizeSetValues(
      (current as readonly unknown[] | undefined) ?? []
    );
    const values =
      modification.type === 'add'
        ? normalizeSetValues([...currentValues, ...modification.values])
        : normalizeSetValues(
            currentValues.filter(
              (value) =>
                !modification.values.some((item) => jsonEqual(item, value))
            )
          );

    if (values.length === 0) delete next[key];
    else next[key] = values;
  }

  return cloneFrozen(next);
};

const semanticPropertyModifications = (
  before: Readonly<JsonRecord>,
  after: Readonly<JsonRecord>,
  isSetValued: (key: string) => boolean
) => {
  const modifications: PropertyModification[] = [];

  for (const key of [
    ...new Set([...Object.keys(before), ...Object.keys(after)]),
  ]
    .filter((key) => !unsafeNodePropertyKeys.has(key))
    .sort()) {
    if (!isSetValued(key)) {
      if (!Object.hasOwn(after, key)) {
        modifications.push(Object.freeze({ key, type: 'unset' }));
      } else if (
        !Object.hasOwn(before, key) ||
        !jsonEqual(before[key], after[key])
      ) {
        modifications.push(
          clonePropertyModification({ key, type: 'set', value: after[key] })
        );
      }
      continue;
    }

    const beforeValue = Object.hasOwn(before, key) ? before[key] : undefined;
    const afterValue = Object.hasOwn(after, key) ? after[key] : undefined;

    if (
      (beforeValue !== undefined && !Array.isArray(beforeValue)) ||
      (afterValue !== undefined && !Array.isArray(afterValue))
    ) {
      throw new Error(`Set-valued node property ${key} is not an array.`);
    }

    const previous = normalizeSetValues(
      (beforeValue as readonly unknown[] | undefined) ?? []
    );
    const next = normalizeSetValues(
      (afterValue as readonly unknown[] | undefined) ?? []
    );
    const removed = previous.filter(
      (value) => !next.some((item) => jsonEqual(item, value))
    );
    const added = next.filter(
      (value) => !previous.some((item) => jsonEqual(item, value))
    );

    if (removed.length > 0) {
      modifications.push(
        Object.freeze({ key, type: 'remove', values: removed })
      );
    }
    if (added.length > 0) {
      modifications.push(Object.freeze({ key, type: 'add', values: added }));
    }
  }

  return Object.freeze(modifications);
};

const invertPropertyModifications = (
  props: Readonly<JsonRecord>,
  modifications: readonly PropertyModification[]
) => {
  let current = cloneFrozen(props);
  const inverse: PropertyModification[] = [];

  for (const modification of modifications) {
    const { key } = modification;
    let inverted: PropertyModification | null;

    if (modification.type === 'set' || modification.type === 'unset') {
      inverted = Object.hasOwn(current, key)
        ? clonePropertyModification({ key, type: 'set', value: current[key] })
        : modification.type === 'set'
          ? Object.freeze({ key, type: 'unset' })
          : null;
    } else {
      const currentValue = Object.hasOwn(current, key)
        ? current[key]
        : undefined;

      if (currentValue !== undefined && !Array.isArray(currentValue)) {
        throw new Error(`Set-valued node property ${key} is not an array.`);
      }
      const currentValues = normalizeSetValues(
        (currentValue as readonly unknown[] | undefined) ?? []
      );
      const affected =
        modification.type === 'add'
          ? modification.values.filter(
              (value) => !currentValues.some((item) => jsonEqual(item, value))
            )
          : currentValues.filter((value) =>
              modification.values.some((item) => jsonEqual(item, value))
            );

      inverted =
        affected.length === 0
          ? null
          : Object.freeze({
              key,
              type: modification.type === 'add' ? 'remove' : 'add',
              values: normalizeSetValues(affected),
            });
    }

    current = applyPropertyModifications(current, [modification]);
    if (inverted) inverse.unshift(inverted);
  }

  return Object.freeze(inverse);
};

const subtractSetValues = (
  values: readonly unknown[],
  removed: readonly unknown[]
) =>
  normalizeSetValues(
    values.filter(
      (value) => !removed.some((removedValue) => jsonEqual(value, removedValue))
    )
  );

const transformEarlierPropertyModification = (
  earlier: PropertyModification,
  later: PropertyModification
): PropertyModification | null => {
  if (earlier.key !== later.key) return earlier;

  if (later.type === 'set' || later.type === 'unset') return null;

  if (earlier.type === 'add' || earlier.type === 'remove') {
    if (earlier.type === later.type) return earlier;

    const values = subtractSetValues(earlier.values, later.values);

    return values.length === 0 ? null : Object.freeze({ ...earlier, values });
  }

  if (earlier.type === 'unset') {
    return later.type === 'add'
      ? clonePropertyModification({
          key: earlier.key,
          type: 'set',
          value: later.values,
        })
      : earlier;
  }

  if (!Array.isArray(earlier.value)) {
    throw new Error(
      `Cannot apply set-valued node property ${later.type} to non-array ${earlier.key}.`
    );
  }

  const value =
    later.type === 'add'
      ? normalizeSetValues([...earlier.value, ...later.values])
      : subtractSetValues(earlier.value, later.values);

  return value.length === 0
    ? Object.freeze({ key: earlier.key, type: 'unset' })
    : clonePropertyModification({ key: earlier.key, type: 'set', value });
};

const transformEarlierPropertyModifications = (
  earlier: readonly PropertyModification[],
  later: readonly PropertyModification[]
) => {
  let transformed = [...earlier];

  for (const laterModification of later) {
    transformed = transformed.flatMap((earlierModification) => {
      const next = transformEarlierPropertyModification(
        earlierModification,
        laterModification
      );

      return next ? [next] : [];
    });
  }

  return Object.freeze(transformed);
};

const propertyModificationToJSON = (
  modification: PropertyModification
): PropertyModificationJson =>
  modification.type === 'set'
    ? {
        key: modification.key,
        type: modification.type,
        value: cloneJson(modification.value),
      }
    : modification.type === 'unset'
      ? { key: modification.key, type: modification.type }
      : {
          key: modification.key,
          type: modification.type,
          values: cloneJson(modification.values),
        };

const propertyModificationFromJSON = (value: unknown): PropertyModification => {
  if (!isRecord(value)) throw new Error('Invalid property delta JSON.');

  const { key, type } = value;

  assertNodePropertyKey(key);

  if (type === 'unset') {
    return Object.freeze({ key, type });
  }
  if (type === 'set' && Object.hasOwn(value, 'value')) {
    return clonePropertyModification({ key, type, value: value.value });
  }
  if ((type === 'add' || type === 'remove') && Array.isArray(value.values)) {
    const values = normalizeSetValues(value.values);

    if (values.length === 0) throw new Error('Invalid property delta JSON.');

    return Object.freeze({ key, type, values });
  }

  throw new Error('Invalid property delta JSON.');
};

const propertyModificationsFromJSON = (value: unknown) => {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Array.isArray(value.operations)
  ) {
    throw new Error('Invalid property delta JSON.');
  }

  return Object.freeze(value.operations.map(propertyModificationFromJSON));
};

const propertyDeltaFromModifications = (
  modifications: readonly PropertyModification[]
): NodePropertyDelta => {
  const add: Record<string, readonly unknown[]> = {};
  const remove: Record<string, readonly unknown[]> = {};
  const set: JsonRecord = {};
  const unset: string[] = [];

  for (const modification of modifications) {
    if (modification.type === 'set') {
      set[modification.key] = modification.value;
    } else if (modification.type === 'unset') {
      unset.push(modification.key);
    } else {
      (modification.type === 'add' ? add : remove)[modification.key] =
        modification.values;
    }
  }

  return Object.freeze({
    ...(Object.keys(add).length > 0 ? { add: Object.freeze(add) } : {}),
    ...(Object.keys(remove).length > 0
      ? { remove: Object.freeze(remove) }
      : {}),
    ...(Object.keys(set).length > 0 ? { set: Object.freeze(set) } : {}),
    ...(unset.length > 0 ? { unset: Object.freeze(unset) } : {}),
  });
};

const pathKey = (path: readonly number[]) => JSON.stringify(path);

const transformPathAfterRemove = (
  path: readonly number[],
  removedPath: readonly number[]
) => {
  const removedParent = removedPath.slice(0, -1);
  const removedIndex = removedPath.at(-1);

  if (removedIndex === undefined) {
    throw new Error('Cannot transform a path through root removal.');
  }

  if (
    removedPath.every((part, index) => path[index] === part) &&
    path.length >= removedPath.length
  ) {
    return null;
  }

  if (
    path.length >= removedPath.length &&
    removedParent.every((part, index) => path[index] === part) &&
    path[removedPath.length - 1]! > removedIndex
  ) {
    const transformed = [...path];

    transformed[removedPath.length - 1]! -= 1;

    return transformed;
  }

  return [...path];
};

const tokenLength = (token: JsonToken) =>
  token.kind === 'text' ? token.text.length : 1;

const tokensEqual = (left: JsonToken, right: JsonToken) => {
  if (left.kind !== right.kind) return false;

  if (left.kind === 'text' && right.kind === 'text') {
    return left.text === right.text;
  }

  if (left.kind === 'open' && right.kind === 'open') {
    return (
      left.nodeKind === right.nodeKind && jsonEqual(left.props, right.props)
    );
  }

  return (
    left.kind === 'close' &&
    right.kind === 'close' &&
    left.nodeKind === right.nodeKind
  );
};

const commonPrefixLength = (
  left: readonly JsonToken[],
  right: readonly JsonToken[]
) => {
  let length = 0;

  for (let index = 0; index < left.length && index < right.length; index += 1) {
    const leftToken = left[index]!;
    const rightToken = right[index]!;

    if (tokensEqual(leftToken, rightToken)) {
      length += tokenLength(leftToken);
      continue;
    }

    if (leftToken.kind === 'text' && rightToken.kind === 'text') {
      const limit = Math.min(leftToken.text.length, rightToken.text.length);

      for (let offset = 0; offset < limit; offset += 1) {
        if (leftToken.text[offset] !== rightToken.text[offset]) return length;

        length += 1;
      }
    }

    return length;
  }

  return length;
};

const commonSuffixLength = (
  left: readonly JsonToken[],
  right: readonly JsonToken[],
  limit: number
) => {
  let length = 0;
  let leftIndex = left.length - 1;
  let rightIndex = right.length - 1;

  while (leftIndex >= 0 && rightIndex >= 0 && length < limit) {
    const leftToken = left[leftIndex]!;
    const rightToken = right[rightIndex]!;
    const remaining = limit - length;

    if (tokensEqual(leftToken, rightToken)) {
      const size = Math.min(tokenLength(leftToken), remaining);
      length += size;

      if (size < tokenLength(leftToken)) return length;

      leftIndex -= 1;
      rightIndex -= 1;
      continue;
    }

    if (leftToken.kind === 'text' && rightToken.kind === 'text') {
      const textLimit = Math.min(
        leftToken.text.length,
        rightToken.text.length,
        remaining
      );

      for (let offset = 1; offset <= textLimit; offset += 1) {
        if (leftToken.text.at(-offset) !== rightToken.text.at(-offset)) {
          return length;
        }

        length += 1;
      }
    }

    return length;
  }

  return length;
};

const openToken = (
  nodeKind: NodeKind,
  props: JsonRecord,
  source?: {
    length: number;
    node: JsonNode;
    tokenCount: number;
  }
): OpenToken => {
  assertEditorJsonValue(props, 'Document node properties');

  if (Object.hasOwn(props, 'children') || Object.hasOwn(props, 'text')) {
    throw new Error('Token props cannot contain structural node fields.');
  }

  return Object.freeze({
    kind: 'open',
    nodeKind,
    props: cloneFrozen(props),
    ...(source
      ? {
          sourceLength: source.length,
          sourceNode: source.node,
          sourceTokenCount: source.tokenCount,
        }
      : {}),
  });
};

const closeToken = (nodeKind: NodeKind): CloseToken =>
  Object.freeze({
    kind: 'close',
    nodeKind,
  });

const textToken = (text: string): TextToken =>
  Object.freeze({ kind: 'text', text });

const normalizeTokens = (tokens: readonly JsonToken[]) => {
  const normalized: JsonToken[] = [];

  for (const token of tokens) {
    if (token.kind === 'text') {
      if (token.text.length === 0) continue;

      const previous = normalized.at(-1);

      if (previous?.kind === 'text') {
        normalized[normalized.length - 1] = textToken(
          previous.text + token.text
        );
      } else {
        normalized.push(textToken(token.text));
      }
    } else if (token.kind === 'open') {
      normalized.push(token);
    } else {
      normalized.push(token);
    }
  }

  return Object.freeze(normalized);
};

type PreparedNodeSlice = Readonly<{
  index: TreeIndexChildren;
  nodes: readonly JsonNode[];
  runtimeIds: PreparedRuntimeIdRange;
}>;

const DOCUMENT_SLICE_TOKENS = new WeakMap<
  DocumentSlice,
  readonly JsonToken[]
>();
const DOCUMENT_SLICE_OFFSETS = new WeakMap<DocumentSlice, readonly number[]>();
const DOCUMENT_SLICE_PREPARED_NODES = new WeakMap<
  DocumentSlice,
  PreparedNodeSlice
>();
const DOCUMENT_SLICE_DEFERRED_VIEWS = new WeakMap<
  DocumentSlice,
  Readonly<{
    from: number;
    source: DocumentSlice;
    to: number;
  }>
>();

/** @internal Read the immutable node/index run behind a prepared slice. */
export const getPreparedDocumentSlice = (slice: DocumentSlice) =>
  DOCUMENT_SLICE_PREPARED_NODES.get(slice);

/** @internal Resolve one prepared node path without materializing slice tokens. */
export const getPreparedDocumentRuntimeId = (
  slice: DocumentSlice,
  path: readonly number[]
) => {
  const prepared = DOCUMENT_SLICE_PREPARED_NODES.get(slice);

  if (!prepared || path.length === 0) return null;
  let children = prepared.index;
  let position = 0;

  for (let depth = 0; depth < path.length; depth++) {
    const index = path[depth]!;
    const node = children.children[index];
    const offset = children.offsets[index];

    if (!node || offset === undefined) return null;
    position += offset;

    if (depth === path.length - 1) {
      return preparedRuntimeIdAt(prepared.runtimeIds, position);
    }
    if (!node.children) return null;
    position += 1;
    children = node.children;
  }

  return null;
};

/** @internal Resolve one prepared identity without materializing slice tokens. */
export const getPreparedDocumentRuntimePath = (
  slice: DocumentSlice,
  runtimeId: RuntimeId
) => {
  const prepared = DOCUMENT_SLICE_PREPARED_NODES.get(slice);

  if (!prepared) return null;
  const position = preparedRuntimeIdOffset(prepared.runtimeIds, runtimeId);

  if (position === null) return null;

  return (
    new ResolvedTokenCursor(prepared.index).nodeStartingAt(position)?.path ??
    null
  );
};

/** @internal Report whether a slice has paid the token-materialization cost. */
export const hasMaterializedDocumentSliceTokens = (slice: DocumentSlice) =>
  DOCUMENT_SLICE_TOKENS.has(slice);

/** @internal Whether a slice is a lazy view over prepared document content. */
export const isDeferredPreparedDocumentSlice = (slice: DocumentSlice) =>
  DOCUMENT_SLICE_DEFERRED_VIEWS.has(slice);

export class DocumentSlice {
  static readonly empty = new DocumentSlice([], true);

  readonly length: number;

  private constructor(
    tokens: readonly JsonToken[],
    normalized = false,
    preparedNodes?: PreparedNodeSlice,
    deferredView?: Readonly<{
      from: number;
      source: DocumentSlice;
      to: number;
    }>
  ) {
    const source = normalized ? Object.freeze(tokens) : normalizeTokens(tokens);
    const offsets: number[] = [];
    let length = 0;

    if (preparedNodes) {
      length = preparedNodes.index.length;
      DOCUMENT_SLICE_PREPARED_NODES.set(this, preparedNodes);
    } else if (deferredView) {
      length = deferredView.to - deferredView.from;
      DOCUMENT_SLICE_DEFERRED_VIEWS.set(this, deferredView);
    } else {
      for (const token of source) {
        offsets.push(length);
        length += tokenLength(token);
      }
      DOCUMENT_SLICE_TOKENS.set(this, source);
      DOCUMENT_SLICE_OFFSETS.set(this, Object.freeze(offsets));
    }

    this.length = length;
    Object.freeze(this);
  }

  get offsets(): readonly number[] {
    this.materializeTokens();

    return DOCUMENT_SLICE_OFFSETS.get(this)!;
  }

  get tokens(): readonly JsonToken[] {
    return this.materializeTokens();
  }

  private materializeTokens() {
    const cached = DOCUMENT_SLICE_TOKENS.get(this);

    if (cached) return cached;
    const deferred = DOCUMENT_SLICE_DEFERRED_VIEWS.get(this);

    if (deferred) {
      const tokens = deferred.source.sliceMaterialized(
        deferred.from,
        deferred.to
      ).tokens;
      const offsets: number[] = [];
      let length = 0;

      for (const token of tokens) {
        offsets.push(length);
        length += tokenLength(token);
      }
      DOCUMENT_SLICE_TOKENS.set(this, tokens);
      DOCUMENT_SLICE_OFFSETS.set(this, Object.freeze(offsets));

      return tokens;
    }
    const prepared = DOCUMENT_SLICE_PREPARED_NODES.get(this);

    if (!prepared) return Object.freeze([]) as readonly JsonToken[];
    const tokens = Object.freeze(encodeTrustedNodes(prepared.nodes, true));
    const offsets: number[] = [];
    let length = 0;

    for (const token of tokens) {
      offsets.push(length);
      length += tokenLength(token);
    }
    DOCUMENT_SLICE_TOKENS.set(this, tokens);
    DOCUMENT_SLICE_OFFSETS.set(this, Object.freeze(offsets));

    return tokens;
  }

  static fromJSON(json: readonly JsonTokenData[]) {
    assertEditorJsonValue(json, 'Token slice JSON');

    if (!Array.isArray(json)) {
      throw new Error('Invalid token slice JSON.');
    }

    const tokens = json.map((token): JsonToken => {
      if (!isRecord(token)) throw new Error('Invalid token slice JSON.');

      if (token.kind === 'text' && typeof token.text === 'string') {
        return textToken(token.text);
      }

      if (
        token.kind === 'close' &&
        (token.nodeKind === 'element' || token.nodeKind === 'text')
      ) {
        return closeToken(token.nodeKind);
      }

      if (
        token.kind === 'open' &&
        (token.nodeKind === 'element' || token.nodeKind === 'text') &&
        isRecord(token.props)
      ) {
        return openToken(token.nodeKind, token.props);
      }

      throw new Error('Invalid token slice JSON.');
    });

    return new DocumentSlice(tokens);
  }

  static fromNodes(nodes: readonly JsonNode[]) {
    return IndexedDocument.fromValue(nodes).slice(0);
  }

  /** @internal Encode already detached, frozen, and shape-validated nodes. */
  static fromPreparedNodes(nodes: readonly JsonNode[]) {
    const index = createTreeIndex(nodes);
    const prepared = Object.freeze({
      index,
      nodes,
      runtimeIds: reservePreparedRuntimeIdRange(index.length),
    });

    return new DocumentSlice([], true, prepared);
  }

  /** @internal Encode immutable nodes already owned by an indexed document. */
  static fromIndexedNodes(nodes: readonly JsonNode[]) {
    return new DocumentSlice(encodeTrustedNodes(nodes, false), true);
  }

  static fromTokens(tokens: readonly JsonToken[]) {
    return new DocumentSlice(tokens);
  }

  static text(text: string) {
    return text.length === 0
      ? DocumentSlice.empty
      : new DocumentSlice([textToken(text)], true);
  }

  /** @internal Concatenate normalized slices with one token/offset pass. */
  static concat(slices: readonly DocumentSlice[]) {
    const tokens: JsonToken[] = [];

    for (const slice of slices) {
      for (const token of slice.tokens) {
        const previous = tokens.at(-1);

        if (previous?.kind === 'text' && token.kind === 'text') {
          tokens[tokens.length - 1] = textToken(previous.text + token.text);
        } else {
          tokens.push(token);
        }
      }
    }

    return tokens.length === 0
      ? DocumentSlice.empty
      : new DocumentSlice(tokens, true);
  }

  concat(other: DocumentSlice) {
    if (this.length === 0) return other;
    if (other.length === 0) return this;

    return DocumentSlice.concat([this, other]);
  }

  slice(from: number, to = this.length) {
    if (from < 0 || to < from || to > this.length) {
      throw new RangeError(`Invalid token slice range ${from}-${to}.`);
    }

    if (from === to) return DocumentSlice.empty;
    if (from === 0 && to === this.length) return this;

    const deferred = DOCUMENT_SLICE_DEFERRED_VIEWS.get(this);

    if (deferred) {
      return new DocumentSlice([], true, undefined, {
        from: deferred.from + from,
        source: deferred.source,
        to: deferred.from + to,
      });
    }
    if (DOCUMENT_SLICE_PREPARED_NODES.has(this)) {
      return new DocumentSlice([], true, undefined, {
        from,
        source: this,
        to,
      });
    }

    return this.sliceMaterialized(from, to);
  }

  private sliceMaterialized(from: number, to: number) {
    if (from < 0 || to < from || to > this.length) {
      throw new RangeError(`Invalid token slice range ${from}-${to}.`);
    }

    const result: JsonToken[] = [];
    let low = 0;
    let high = this.tokens.length;

    while (low < high) {
      const middle = (low + high) >> 1;
      const tokenEnd =
        this.offsets[middle]! + tokenLength(this.tokens[middle]!);

      if (tokenEnd <= from) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }

    for (let index = low; index < this.tokens.length; index++) {
      const token = this.tokens[index]!;
      const position = this.offsets[index]!;
      const length = tokenLength(token);
      const end = position + length;
      const overlapFrom = Math.max(from, position);
      const overlapTo = Math.min(to, end);

      if (overlapFrom < overlapTo) {
        if (token.kind === 'text') {
          result.push(
            textToken(
              token.text.slice(overlapFrom - position, overlapTo - position)
            )
          );
        } else {
          if (overlapFrom !== position || overlapTo !== end) {
            throw new Error('A structural token cannot be split.');
          }

          result.push(token);
        }
      }

      if (end >= to) break;
    }

    return new DocumentSlice(result);
  }

  toJSON(): readonly JsonTokenData[] {
    return this.tokens.map((token) =>
      token.kind === 'open'
        ? {
            kind: token.kind,
            nodeKind: token.nodeKind,
            props: cloneJson(token.props),
          }
        : { ...token }
    );
  }
}

const nodeProps = (node: JsonNode) => {
  const { children: _children, text: _text, ...props } = node;

  return props;
};

const encodeTrustedNodes = (nodes: readonly JsonNode[], prepared: boolean) => {
  const tokens: JsonToken[] = [];
  let position = 0;

  const encode = (node: JsonNode) => {
    const from = position;
    const kind: NodeKind = isTextNode(node) ? 'text' : 'element';
    const openIndex = tokens.length;
    const open: OpenToken = {
      ...(prepared ? { [PREPARED_SOURCE_TOKEN]: true as const } : {}),
      kind: 'open',
      nodeKind: kind,
      props: Object.freeze(nodeProps(node)),
    };

    tokens.push(open);
    position += 1;

    if (isTextNode(node)) {
      if (node.text.length > 0) {
        tokens.push(textToken(node.text));
        position += node.text.length;
      }
    } else {
      node.children.forEach(encode);
    }

    tokens.push(closeToken(kind));
    position += 1;
    open.sourceLength = position - from;
    open.sourceNode = node;
    open.sourceTokenCount = tokens.length - openIndex;
    Object.freeze(open);
  };

  nodes.forEach(encode);

  tokens.forEach((token, index) => {
    PREPARED_TOKEN_NEXT.set(token, tokens[index + 1] ?? null);
  });

  return tokens;
};

function assertNode(node: unknown): asserts node is JsonNode {
  if (!isRecord(node)) throw new Error('A JSON node must be an object.');

  const hasText = Object.hasOwn(node, 'text');
  const hasChildren = Object.hasOwn(node, 'children');

  if (hasText === hasChildren) {
    throw new Error('A JSON node must contain either text or children.');
  }

  if (hasText && typeof node.text !== 'string') {
    throw new Error('A JSON text node must contain string text.');
  }

  if (hasChildren) {
    if (!Array.isArray(node.children)) {
      throw new Error('A JSON element node must contain child nodes.');
    }

    node.children.forEach(assertNode);
  }
}

const encodeNodes = (nodes: readonly JsonNode[]) => {
  assertEditorJsonValue(nodes, 'Document nodes');

  const tokens: JsonToken[] = [];
  let position = 0;

  const encode = (node: JsonNode) => {
    assertNode(node);

    const from = position;
    const kind: NodeKind = isTextNode(node) ? 'text' : 'element';
    const openIndex = tokens.length;

    tokens.push(openToken(kind, nodeProps(node)));
    position += 1;

    if (isTextNode(node)) {
      if (node.text.length > 0) {
        tokens.push(textToken(node.text));
        position += node.text.length;
      }
    } else if (isElementNode(node)) {
      node.children.forEach(encode);
    } else {
      throw new Error('A JSON node must contain either text or children.');
    }

    tokens.push(closeToken(kind));
    position += 1;

    tokens[openIndex] = openToken(kind, nodeProps(node), {
      length: position - from,
      node,
      tokenCount: tokens.length - openIndex,
    });
  };

  nodes.forEach(encode);

  return {
    slice: DocumentSlice.fromTokens(tokens),
  };
};

type DecodeFrame = {
  children: JsonNode[];
  from: number;
  kind: NodeKind;
  openIndex: number;
  props: JsonRecord;
  text: string[];
};

type ChangedOutputRange = readonly [number, number];

const decodeNodes = (
  slice: DocumentSlice,
  changedRanges: readonly ChangedOutputRange[] = [],
  options: Readonly<{ reuseUnpreparedSources?: boolean }> = {}
) => {
  const result: JsonNode[] = [];
  const stack: DecodeFrame[] = [];
  const tokens = [...slice.tokens];
  let index = 0;
  let position = 0;
  const claimedSources = new WeakSet<object>();
  const claimSource = (node: JsonNode, prepared: boolean) => {
    const nodes: JsonNode[] = [];
    const local = new WeakSet<object>();
    const collect = (current: JsonNode): boolean => {
      if (
        local.has(current) ||
        claimedSources.has(current) ||
        (prepared && CLAIMED_PREPARED_SOURCES.has(current))
      ) {
        return false;
      }

      local.add(current);
      nodes.push(current);

      return !isElementNode(current) || current.children.every(collect);
    };

    if (!collect(node)) return false;
    nodes.forEach((current) => {
      claimedSources.add(current);
      if (prepared) CLAIMED_PREPARED_SOURCES.add(current);
    });

    return true;
  };

  const appendNode = (node: JsonNode) => {
    const parent = stack.at(-1);

    if (!parent) {
      result.push(node);
      return;
    }

    if (parent.kind !== 'element') {
      throw new DocumentSliceStructureError(
        'A text node cannot contain another node.'
      );
    }

    parent.children.push(node);
  };

  while (index < tokens.length) {
    const token = tokens[index]!;

    if (token.kind === 'open') {
      if (stack.at(-1)?.kind === 'text') {
        throw new DocumentSliceStructureError(
          'A text node cannot contain another node.'
        );
      }

      const sourceTo = position + (token.sourceLength ?? 0);
      const sourceIsChanged = changedRanges.some(([from, to]) =>
        from === to
          ? position < from && from < sourceTo
          : position < to && from < sourceTo
      );
      const prepared = token[PREPARED_SOURCE_TOKEN] === true;
      const sourceTokensMatch = (() => {
        if (!token.sourceNode || token.sourceTokenCount === undefined) {
          return false;
        }
        if (prepared) {
          let expected: JsonToken | null = token;

          for (let offset = 0; offset < token.sourceTokenCount; offset++) {
            if (!expected || tokens[index + offset] !== expected) return false;
            expected = PREPARED_TOKEN_NEXT.get(expected) ?? null;
          }

          return true;
        }

        const sourceTokens = encodeNodes([token.sourceNode]).slice.tokens;

        return (
          token.sourceTokenCount === sourceTokens.length &&
          sourceTokens.every((sourceToken, offset) => {
            const candidate = tokens[index + offset];

            return !!candidate && tokensEqual(candidate, sourceToken);
          })
        );
      })();

      if (
        token.sourceNode &&
        token.sourceLength !== undefined &&
        token.sourceTokenCount !== undefined &&
        sourceTokensMatch &&
        (!sourceIsChanged || prepared) &&
        (prepared || options.reuseUnpreparedSources !== false) &&
        claimSource(token.sourceNode, prepared)
      ) {
        appendNode(token.sourceNode);
        position = sourceTo;
        index += token.sourceTokenCount;
        continue;
      }

      stack.push({
        children: [],
        from: position,
        kind: token.nodeKind,
        openIndex: index,
        props: cloneJson(token.props),
        text: [],
      });
      position += 1;
      index += 1;
      continue;
    }

    if (token.kind === 'text') {
      const frame = stack.at(-1);

      if (frame?.kind !== 'text') {
        throw new DocumentSliceStructureError(
          'Text content must be inside a text node.'
        );
      }

      frame.text.push(token.text);
      position += token.text.length;
      index += 1;
      continue;
    }

    const frame = stack.pop();

    if (!frame || frame.kind !== token.nodeKind) {
      throw new DocumentSliceStructureError('Unbalanced JSON token slice.');
    }

    position += 1;

    const decodedNode =
      frame.kind === 'text'
        ? { ...frame.props, text: frame.text.join('') }
        : { ...frame.props, children: frame.children };

    assertNode(decodedNode);

    const node =
      frame.kind === 'element'
        ? (Object.freeze({
            ...cloneFrozen(frame.props),
            children: Object.freeze(frame.children),
          }) as JsonNode)
        : cloneFrozen(decodedNode);
    const sourceTokenCount = index - frame.openIndex + 1;

    tokens[frame.openIndex] = openToken(frame.kind, frame.props, {
      length: position - frame.from,
      node,
      tokenCount: sourceTokenCount,
    });
    appendNode(node);
    index += 1;
  }

  if (stack.length > 0) {
    throw new DocumentSliceStructureError('Unbalanced JSON token slice.');
  }

  return {
    nodes: Object.freeze(result),
    tokens: DocumentSlice.fromTokens(tokens),
  };
};

const nodeAtPath = (
  nodes: readonly JsonNode[],
  path: readonly number[]
): JsonNode => {
  if (path.length === 0) throw new Error('The document root is not a node.');

  let children = nodes;
  let node: JsonNode | undefined;

  for (const index of path) {
    node = children[index];
    if (!node) throw new Error(`Cannot resolve node at [${path}].`);

    children = isElementNode(node) ? node.children : [];
  }

  return node!;
};

type IndexedValue = {
  index: TreeIndexChildren;
  value: readonly JsonNode[];
};

const replaceIndexedChildren = (
  indexed: IndexedValue,
  parentPath: readonly number[],
  replace: (
    value: readonly JsonNode[],
    index: TreeIndexChildren
  ) => IndexedValue
): IndexedValue => {
  if (parentPath.length === 0) return replace(indexed.value, indexed.index);

  const childIndex = parentPath[0]!;
  const node = indexed.value[childIndex];
  const nodeIndex = indexed.index.children[childIndex];

  if (!node || !nodeIndex || !isElementNode(node) || !nodeIndex.children) {
    throw new Error(`Cannot resolve element at [${parentPath}].`);
  }

  const nested = replaceIndexedChildren(
    { index: nodeIndex.children, value: node.children },
    parentPath.slice(1),
    replace
  );
  const nextNode = Object.freeze({
    ...node,
    children: nested.value,
  }) as JsonNode;
  const nextValue = [...indexed.value];
  const nextIndexes = [...indexed.index.children];

  nextValue[childIndex] = nextNode;
  nextIndexes[childIndex] = {
    children: nested.index,
    kind: 'element',
    length: nested.index.length + 2,
  };

  return {
    index: createTreeIndexChildren(nextIndexes),
    value: Object.freeze(nextValue),
  };
};

const spliceIndexedChildren = (
  indexed: IndexedValue,
  parentPath: readonly number[],
  index: number,
  deleteCount: number,
  inserted: readonly JsonNode[],
  cloneInserted = true,
  insertedIndexes?: readonly TreeIndexNode[]
) =>
  replaceIndexedChildren(indexed, parentPath, (value, tree) => {
    const nextValue = [...value];
    const nextIndexes = [...tree.children];
    const frozenInserted = cloneInserted ? inserted.map(cloneFrozen) : inserted;

    nextValue.splice(index, deleteCount, ...frozenInserted);
    nextIndexes.splice(
      index,
      deleteCount,
      ...(insertedIndexes ?? frozenInserted.map(createTreeIndexNode))
    );

    return {
      index: createTreeIndexChildren(nextIndexes),
      value: Object.freeze(nextValue),
    };
  });

const updateIndexedNode = (
  indexed: IndexedValue,
  path: readonly number[],
  update: (node: JsonNode) => JsonNode
) => {
  const index = path.at(-1);

  if (index === undefined) throw new Error('Cannot update the document root.');

  return replaceIndexedChildren(indexed, path.slice(0, -1), (value, tree) => {
    const node = value[index];

    if (!node) throw new Error(`Cannot resolve node at [${path}].`);

    const updatedNode = update(node);
    const nextNode = isElementNode(updatedNode)
      ? (Object.freeze({
          ...cloneFrozen(nodeProps(updatedNode)),
          children: updatedNode.children,
        }) as JsonNode)
      : cloneFrozen(updatedNode);
    const nextValue = [...value];
    const nextIndexes = [...tree.children];

    nextValue[index] = nextNode;
    nextIndexes[index] = createTreeIndexNode(nextNode);

    return {
      index: createTreeIndexChildren(nextIndexes),
      value: Object.freeze(nextValue),
    };
  });
};

export class IndexedDocument {
  private static readonly immutableCache = new WeakMap<
    object,
    IndexedDocument
  >();

  readonly length: number;
  readonly value: readonly JsonNode[];

  private readonly tree: TreeIndexChildren;
  private resolvedTokenCursor?: ResolvedTokenCursor;
  private tokenCache?: DocumentSlice;

  private constructor(
    nodes: readonly JsonNode[],
    tokens?: DocumentSlice,
    tree?: TreeIndexChildren
  ) {
    if (tree && !tokens) {
      this.length = tree.length;
      this.tree = tree;
      this.value = nodes;
      return;
    }

    if (tokens) {
      this.length = tokens.length;
      this.tokenCache = tokens;
      this.tree = tree ?? createTreeIndex(nodes);
      this.value = nodes;
      return;
    }

    const value = Object.isFrozen(nodes) ? nodes : cloneFrozen(nodes);
    const encoded = encodeNodes(value);

    this.length = encoded.slice.length;
    this.tokenCache = encoded.slice;
    this.tree = tree ?? createTreeIndex(value);
    this.value = value;
  }

  get tokenCount() {
    return this.tokens.tokens.length;
  }

  get tokens() {
    this.tokenCache ??= encodeNodes(this.value).slice;

    return this.tokenCache;
  }

  static fromTokens(tokens: DocumentSlice) {
    const decoded = decodeNodes(tokens);

    return IndexedDocument.remember(
      new IndexedDocument(decoded.nodes, decoded.tokens)
    );
  }

  static fromValue(value: readonly JsonNode[]) {
    if (!Object.isFrozen(value)) {
      return IndexedDocument.remember(new IndexedDocument(value));
    }

    const cached = IndexedDocument.immutableCache.get(value);

    if (cached) return cached;

    return IndexedDocument.remember(new IndexedDocument(value));
  }

  static fromIndexedValue(indexed: IndexedValue) {
    return IndexedDocument.remember(
      new IndexedDocument(indexed.value, undefined, indexed.index)
    );
  }

  static fromChangedTokens(
    tokens: DocumentSlice,
    changedRanges: readonly ChangedOutputRange[]
  ) {
    const decoded = decodeNodes(tokens, changedRanges);

    return IndexedDocument.remember(
      new IndexedDocument(decoded.nodes, decoded.tokens)
    );
  }

  private static remember(document: IndexedDocument) {
    if (Object.isFrozen(document.value)) {
      IndexedDocument.immutableCache.set(document.value, document);
    }

    return document;
  }

  childPosition(parentPath: readonly number[], index: number) {
    const children =
      parentPath.length === 0
        ? this.value
        : (() => {
            const parent = this.node(parentPath);

            if (!isElementNode(parent)) {
              throw new Error(`Node at [${parentPath}] is not an element.`);
            }

            return parent.children;
          })();

    if (!Number.isInteger(index) || index < 0 || index > children.length) {
      throw new RangeError(`Invalid child index ${index} at [${parentPath}].`);
    }

    if (index < children.length) {
      return this.entry([...parentPath, index]).from;
    }

    return parentPath.length === 0
      ? this.length
      : this.entry(parentPath).contentTo;
  }

  childBoundaryAt(position: number) {
    return this.cursor().childBoundaryAt(position);
  }

  nodeRangesTouching(from: number, to = from): readonly IndexedNodeRange[] {
    return this.cursor().nodeRangesTouching(from, to);
  }

  /** @internal Return the outer-to-inner node stack at one token position. */
  openContextAt(position: number): readonly IndexedNodeRange[] {
    return this.cursor().openContextAt(position);
  }

  node(path: readonly number[]) {
    return nodeAtPath(this.value, path);
  }

  nodeRange(path: readonly number[]) {
    const { from, to } = this.entry(path);

    return { from, to };
  }

  nodeStartingAt(position: number) {
    return this.cursor().nodeStartingAt(position);
  }

  nodeSlice(path: readonly number[]) {
    return DocumentSlice.fromIndexedNodes([this.node(path)]);
  }

  pointAt(position: number, assoc: -1 | 1 = -1): JsonPoint | null {
    return this.cursor().pointAt(position, assoc);
  }

  positionAt(point: JsonPoint) {
    const entry = this.entry(point.path);

    if (entry.kind !== 'text') {
      throw new Error(`Point path [${point.path}] is not a text node.`);
    }

    const length = entry.contentTo - entry.contentFrom;

    if (
      !Number.isInteger(point.offset) ||
      point.offset < 0 ||
      point.offset > length
    ) {
      throw new RangeError(`Invalid text offset ${point.offset}.`);
    }

    return entry.contentFrom + point.offset;
  }

  textAt(position: number) {
    return this.cursor().textAt(position);
  }

  withInsertedNode(path: readonly number[], node: JsonNode) {
    const index = path.at(-1);

    if (index === undefined)
      throw new Error('Cannot insert the document root.');

    return IndexedDocument.fromIndexedValue(
      spliceIndexedChildren(
        { index: this.tree, value: this.value },
        path.slice(0, -1),
        index,
        0,
        [node]
      )
    );
  }

  withSplicedNodes(
    parentPath: readonly number[],
    index: number,
    deleteCount: number,
    nodes: readonly JsonNode[]
  ) {
    return IndexedDocument.fromIndexedValue(
      spliceIndexedChildren(
        { index: this.tree, value: this.value },
        parentPath,
        index,
        deleteCount,
        nodes
      )
    );
  }

  /** @internal Insert nodes already decoded, detached, and frozen by DocumentSlice. */
  withDecodedSplicedNodes(
    parentPath: readonly number[],
    index: number,
    deleteCount: number,
    nodes: readonly JsonNode[]
  ) {
    return IndexedDocument.fromIndexedValue(
      spliceIndexedChildren(
        { index: this.tree, value: this.value },
        parentPath,
        index,
        deleteCount,
        nodes,
        false
      )
    );
  }

  /** @internal Splice a prepared node slice without decoding or reindexing it. */
  withPreparedSplicedNodes(
    parentPath: readonly number[],
    index: number,
    deleteCount: number,
    prepared: PreparedNodeSlice
  ) {
    return IndexedDocument.fromIndexedValue(
      spliceIndexedChildren(
        { index: this.tree, value: this.value },
        parentPath,
        index,
        deleteCount,
        prepared.nodes,
        false,
        prepared.index.children
      )
    );
  }

  withExactNodeProperties(path: readonly number[], props: JsonRecord) {
    return IndexedDocument.fromIndexedValue(
      updateIndexedNode(
        { index: this.tree, value: this.value },
        path,
        (node) =>
          isTextNode(node)
            ? ({ ...props, text: node.text } as JsonNode)
            : ({ ...props, children: node.children } as JsonNode)
      )
    );
  }

  withMovedNode(path: readonly number[], newPath: readonly number[]) {
    const sourceIndex = path.at(-1);
    const targetIndex = newPath.at(-1);

    if (sourceIndex === undefined || targetIndex === undefined) {
      throw new Error('Cannot move the document root.');
    }

    const sourceParent = path.slice(0, -1);
    const targetParent = newPath.slice(0, -1);

    if (pathKey(sourceParent) === pathKey(targetParent)) {
      return IndexedDocument.fromIndexedValue(
        replaceIndexedChildren(
          { index: this.tree, value: this.value },
          sourceParent,
          (value, tree) => {
            const nextValue = [...value];
            const nextIndexes = [...tree.children];
            const [node] = nextValue.splice(sourceIndex, 1);
            const [nodeIndex] = nextIndexes.splice(sourceIndex, 1);

            if (!node || !nodeIndex) {
              throw new Error(`Cannot resolve node at [${path}].`);
            }

            nextValue.splice(targetIndex, 0, node);
            nextIndexes.splice(targetIndex, 0, nodeIndex);

            return {
              index: createTreeIndexChildren(nextIndexes),
              value: Object.freeze(nextValue),
            };
          }
        )
      );
    }

    const node = this.node(path);
    const transformedTarget = transformPathAfterRemove(newPath, path);

    if (!transformedTarget) {
      throw new Error('Cannot move a node inside itself.');
    }

    const without = spliceIndexedChildren(
      { index: this.tree, value: this.value },
      sourceParent,
      sourceIndex,
      1,
      []
    );

    return IndexedDocument.fromIndexedValue(
      spliceIndexedChildren(
        without,
        transformedTarget.slice(0, -1),
        transformedTarget.at(-1)!,
        0,
        [node]
      )
    );
  }

  withNodeProperties(path: readonly number[], properties: JsonRecord) {
    return IndexedDocument.fromIndexedValue(
      updateIndexedNode(
        { index: this.tree, value: this.value },
        path,
        (node) => {
          const next = { ...node } as JsonRecord;

          for (const [key, value] of Object.entries(properties)) {
            if (value === null) {
              delete next[key];
            } else {
              next[key] = value;
            }
          }

          return next as JsonNode;
        }
      )
    );
  }

  withRemovedNode(path: readonly number[]) {
    const index = path.at(-1);

    if (index === undefined)
      throw new Error('Cannot remove the document root.');

    return IndexedDocument.fromIndexedValue(
      spliceIndexedChildren(
        { index: this.tree, value: this.value },
        path.slice(0, -1),
        index,
        1,
        []
      )
    );
  }

  withText(path: readonly number[], from: number, to: number, text: string) {
    return IndexedDocument.fromIndexedValue(
      updateIndexedNode(
        { index: this.tree, value: this.value },
        path,
        (node) => {
          if (!isTextNode(node)) {
            throw new Error(`Node at [${path}] is not text.`);
          }

          return {
            ...node,
            text: node.text.slice(0, from) + text + node.text.slice(to),
          };
        }
      )
    );
  }

  slice(from: number, to = this.length) {
    return this.tokens.slice(from, to);
  }

  private cursor() {
    if (!this.resolvedTokenCursor) {
      this.resolvedTokenCursor = new ResolvedTokenCursor(this.tree);
    }

    return this.resolvedTokenCursor;
  }

  private entry(path: readonly number[]) {
    if (path.length === 0) {
      throw new Error('The document root does not have a node entry.');
    }

    let children = this.tree;
    let position = 0;
    let node: TreeIndexNode | undefined;

    for (let depth = 0; depth < path.length; depth++) {
      const index = path[depth]!;

      node = children.children[index];
      if (!node) throw new Error(`Cannot resolve token range at [${path}].`);

      position += children.offsets[index]!;

      if (depth < path.length - 1) {
        if (!node.children) {
          throw new Error(`Cannot descend through text at [${path}].`);
        }

        position += 1;
        children = node.children;
      }
    }

    const from = position;
    const contentFrom = from + 1;
    const contentTo = from + node!.length - 1;

    return {
      contentFrom,
      contentTo,
      from,
      kind: node!.kind,
      path,
      to: from + node!.length,
    } satisfies IndexEntry;
  }
}

const applyPropertyModificationsToSlice = (
  slice: DocumentSlice,
  modifications: readonly PropertyModification[]
) => {
  let changed = false;
  const tokens = slice.tokens.map((token): JsonToken => {
    if (token.kind !== 'open') return token;

    changed = true;

    return openToken(
      token.nodeKind,
      applyPropertyModifications(token.props, modifications)
    );
  });

  if (!changed) {
    throw new Error('Node property delta does not target an open node token.');
  }

  return DocumentSlice.fromTokens(tokens);
};

type SectionData = DocumentSlice | null | readonly PropertyModification[];
type Replacement = {
  from: number;
  insert: DocumentSlice;
  to: number;
};
type PropertyChange = {
  from: number;
  modifications: readonly PropertyModification[];
  to: number;
};

type ChangeSetApplyFallbackReason =
  | 'ambiguous-replacement-position'
  | 'invalid-property-target'
  | 'mixed-properties-and-replacements'
  | 'overlapping-replacement-range'
  | 'unresolved-local-replacement';

type MutableChangeSetApplyWork = {
  ancestorPaths: number[][];
  fallbackReason: ChangeSetApplyFallbackReason | null;
  localizedReplacements: number;
};

const CHANGE_SET_APPLY_STATS = new WeakMap<
  ChangeSet,
  Readonly<{
    ancestorPaths: readonly (readonly number[])[];
    changedRanges: readonly Readonly<{
      fromAfter: number;
      fromBefore: number;
      toAfter: number;
      toBefore: number;
    }>[];
    fallbackReason: ChangeSetApplyFallbackReason | null;
    localizedReplacements: number;
    propertyChanges: number;
    replacements: number;
    usedTokenFallback: boolean;
  }>
>();

/** @internal Inspect the most recent apply strategy for one immutable change. */
export const getChangeSetApplyStats = (change: ChangeSet) =>
  CHANGE_SET_APPLY_STATS.get(change) ?? null;

class SectionIterator {
  private readonly data: readonly SectionData[];
  private readonly sections: readonly number[];

  index = 0;
  inserted = -3;
  length = 0;
  offset = 0;

  constructor(sections: readonly number[], data: readonly SectionData[]) {
    this.data = data;
    this.sections = sections;
    this.next();
  }

  get done() {
    return this.inserted === -3;
  }

  get keep() {
    return this.inserted === -1 || this.inserted === -2;
  }

  get outputLength() {
    return this.keep ? this.length : this.inserted;
  }

  get slice() {
    return (this.data[(this.index - 2) >> 1] ??
      DocumentSlice.empty) as DocumentSlice;
  }

  get modifications() {
    return this.inserted === -2
      ? (this.data[(this.index - 2) >> 1] as readonly PropertyModification[])
      : null;
  }

  forward(length: number) {
    if (length === this.length) {
      this.next();
    } else {
      this.length -= length;
      this.offset += length;
    }
  }

  forwardOutput(length: number) {
    if (this.keep) {
      this.forward(length);
    } else if (length === this.inserted) {
      this.next();
    } else {
      this.inserted -= length;
      this.offset += length;
    }
  }

  next() {
    if (this.index < this.sections.length) {
      this.length = this.sections[this.index++]!;
      this.inserted = this.sections[this.index++]!;
    } else {
      this.length = 0;
      this.inserted = -3;
    }

    this.offset = 0;
  }

  slicePart(length?: number) {
    return this.slice.slice(
      this.offset,
      length === undefined ? undefined : this.offset + length
    );
  }
}

const addSection = (
  sections: number[],
  data: SectionData[],
  length: number,
  inserted: number,
  value: SectionData,
  forceJoin = false
) => {
  if (length === 0 && inserted <= 0) return;

  const last = sections.length - 2;

  if (last >= 0 && inserted === -1 && sections[last + 1] === -1) {
    sections[last]! += length;
    return;
  }

  if (
    inserted >= 0 &&
    (forceJoin || (last >= 0 && length === 0 && sections[last] === 0))
  ) {
    sections[last]! += length;
    sections[last + 1]! += inserted;
    data[data.length - 1] = (
      (data.at(-1) ?? DocumentSlice.empty) as DocumentSlice
    ).concat((value ?? DocumentSlice.empty) as DocumentSlice);
    return;
  }

  sections.push(length, inserted);
  data.push(value);
};

const composeSections = (
  sectionsA: readonly number[],
  dataA: readonly SectionData[],
  sectionsB: readonly number[],
  dataB: readonly SectionData[]
) => {
  const sections: number[] = [];
  const data: SectionData[] = [];
  const a = new SectionIterator(sectionsA, dataA);
  const b = new SectionIterator(sectionsB, dataB);
  let open = false;

  for (;;) {
    if (a.done && b.done) return { data, sections };

    if (a.inserted === 0) {
      addSection(sections, data, a.length, 0, a.slice, open);
      a.next();
      continue;
    }

    if (b.length === 0 && !b.done) {
      addSection(sections, data, 0, b.inserted, b.slice, open);
      b.next();
      continue;
    }

    if (a.done || b.done) {
      throw new Error('Cannot compose mismatched change-set lengths.');
    }

    const length = Math.min(a.outputLength, b.length);
    const sectionLength = sections.length;

    if (a.keep && b.keep) {
      const modifications = Object.freeze([
        ...(a.modifications ?? []),
        ...(b.modifications ?? []),
      ]);

      addSection(
        sections,
        data,
        length,
        modifications.length > 0 ? -2 : -1,
        modifications.length > 0 ? modifications : null,
        open
      );
    } else if (a.keep) {
      addSection(
        sections,
        data,
        length,
        b.offset > 0 ? 0 : b.inserted,
        b.offset > 0 ? DocumentSlice.empty : b.slice,
        open
      );
    } else if (b.keep) {
      const slice = a.slicePart(length);

      addSection(
        sections,
        data,
        a.offset > 0 ? 0 : a.length,
        length,
        b.modifications
          ? applyPropertyModificationsToSlice(slice, b.modifications)
          : slice,
        open
      );
    } else {
      addSection(
        sections,
        data,
        a.offset > 0 ? 0 : a.length,
        b.offset > 0 ? 0 : b.inserted,
        b.offset > 0 ? DocumentSlice.empty : b.slice,
        open
      );
    }

    open =
      (a.inserted > length || (!b.keep && b.length > length)) &&
      (open || sections.length > sectionLength);
    a.forwardOutput(length);
    b.forward(length);
  }
};

const transformChange = (
  changeA: ChangeSet,
  changeB: ChangeSet,
  before: boolean
) => {
  if (changeA.length !== changeB.length) {
    throw new Error('Cannot transform mismatched change-set lengths.');
  }

  const sections: number[] = [];
  const data: SectionData[] = [];
  const a = new SectionIterator(changeA.sections, changeA.data);
  const b = new SectionIterator(changeB.sections, changeB.data);
  let inserted = -1;
  let position = 0;

  for (;;) {
    if (a.keep && b.keep) {
      const length = Math.min(a.length, b.length);
      const modifications = a.modifications
        ? before
          ? transformEarlierPropertyModifications(
              a.modifications,
              b.modifications ?? []
            )
          : a.modifications
        : null;

      addSection(
        sections,
        data,
        length,
        modifications && modifications.length > 0 ? -2 : -1,
        modifications && modifications.length > 0 ? modifications : null
      );
      a.forward(length);
      b.forward(length);
      position += length;
      continue;
    }

    if (
      b.inserted >= 0 &&
      (a.inserted < 0 ||
        inserted === a.index ||
        (a.offset === 0 &&
          (b.length < a.length || (b.length === a.length && !before))))
    ) {
      const end = position + b.length;

      addSection(sections, data, b.inserted, -1, null);

      while (position < end) {
        if (a.done) throw new Error('Mismatched transformed change sets.');

        const piece = Math.min(a.length, end - position);

        if (a.inserted >= 0 && inserted < a.index && a.length <= piece) {
          addSection(sections, data, 0, a.inserted, a.slice);
          inserted = a.index;
        }

        a.forward(piece);
        position += piece;
      }

      b.next();
      continue;
    }

    if (a.inserted >= 0) {
      const start = position;
      const end = position + a.length;
      let length = 0;

      while (position < end) {
        if (b.keep) {
          const piece = Math.min(end - position, b.length);

          position += piece;
          length += piece;
          b.forward(piece);
        } else if (b.inserted === 0) {
          const piece = Math.min(end - position, b.length);

          position += piece;
          b.forward(piece);
        } else {
          break;
        }
      }

      if (inserted < a.index) {
        addSection(sections, data, length, a.inserted, a.slice);
        inserted = a.index;
      } else {
        addSection(sections, data, length, 0, DocumentSlice.empty);
      }

      a.forward(position - start);
      continue;
    }

    return ChangeSet.fromSections(sections, data);
  }
};

const getDocumentPropertyContext = (
  document: IndexedDocument,
  path: readonly number[],
  root: string | null
): DocumentPropertyContext => {
  const node = document.node(path);
  const ancestorTypes: string[] = [];

  for (let depth = path.length - 1; depth > 0; depth--) {
    const ancestor = document.node(path.slice(0, depth));

    if (!isTextNode(ancestor)) {
      ancestorTypes.push(String(ancestor.type ?? 'element'));
    }
  }

  const placement = isTextNode(node) ? 'text' : 'element';
  const parent = ancestorTypes[0] ?? null;

  return Object.freeze({
    ancestors: placement === 'text' ? ancestorTypes.slice(1) : ancestorTypes,
    parent,
    path: Object.freeze([...path]),
    placement,
    root,
    type:
      placement === 'text'
        ? (parent ?? 'text')
        : String(node.type ?? 'element'),
  });
};

const TREE_DIFF_MATRIX_LIMIT = 4096;
const TREE_DIFF_TEXT_BOUNDARY = 128;

type NodeTextBoundary = Readonly<{
  length: number;
  prefix: string;
  suffix: string;
}>;

const commonTextPrefixLength = (left: string, right: string) => {
  const limit = Math.min(left.length, right.length);
  let length = 0;

  while (length < limit && left[length] === right[length]) length++;

  return length;
};

const commonTextSuffixLength = (
  left: string,
  right: string,
  limit = Math.min(left.length, right.length)
) => {
  let length = 0;

  while (length < limit && left.at(-length - 1) === right.at(-length - 1)) {
    length++;
  }

  return length;
};

/**
 * Build a structural diff only when one source node has a uniquely stronger
 * continuation later in its sibling list. Flat prefix/suffix diffs can
 * otherwise retain an opening token on one inserted sibling and that node's
 * content/closing token on another, splitting one runtime identity in two.
 */
const createStructurallyAlignedChanges = (
  before: IndexedDocument,
  after: IndexedDocument,
  options: Readonly<{
    isSetValued?: DocumentSetPropertyResolver;
    root?: string | null;
  }>
) => {
  const changes: ChangeSection[] = [];
  const boundaries = new WeakMap<JsonNode, NodeTextBoundary>();
  const properties = new WeakMap<JsonNode, Readonly<JsonRecord>>();
  let displaced = false;

  const getProperties = (node: JsonNode) => {
    let result = properties.get(node);

    if (!result) {
      result = nodeProps(node);
      properties.set(node, result);
    }

    return result;
  };
  const getBoundary = (node: JsonNode): NodeTextBoundary => {
    const cached = boundaries.get(node);

    if (cached) return cached;

    if (isTextNode(node)) {
      const result = Object.freeze({
        length: node.text.length,
        prefix: node.text.slice(0, TREE_DIFF_TEXT_BOUNDARY),
        suffix: node.text.slice(-TREE_DIFF_TEXT_BOUNDARY),
      });

      boundaries.set(node, result);

      return result;
    }

    let length = 0;
    let prefix = '';
    let suffix = '';

    for (const child of node.children) {
      const childBoundary = getBoundary(child);

      length += childBoundary.length;
      if (prefix.length < TREE_DIFF_TEXT_BOUNDARY) {
        prefix += childBoundary.prefix.slice(
          0,
          TREE_DIFF_TEXT_BOUNDARY - prefix.length
        );
      }
    }
    for (let index = node.children.length - 1; index >= 0; index--) {
      const childBoundary = getBoundary(node.children[index]!);

      suffix = `${childBoundary.suffix.slice(
        Math.max(
          0,
          childBoundary.suffix.length -
            (TREE_DIFF_TEXT_BOUNDARY - suffix.length)
        )
      )}${suffix}`;
      if (suffix.length >= TREE_DIFF_TEXT_BOUNDARY) break;
    }

    const result = Object.freeze({ length, prefix, suffix });

    boundaries.set(node, result);

    return result;
  };
  const continuityScore = (source: JsonNode, target: JsonNode) => {
    if (isTextNode(source) !== isTextNode(target)) return 0;
    if (Object.is(source, target)) return 2_000_000_000;
    if (jsonEqual(source, target)) return 1_000_000_000;

    const sourceProperties = getProperties(source);
    const targetProperties = getProperties(target);
    const propertiesEqual = jsonEqual(sourceProperties, targetProperties);
    const sourceType = sourceProperties.type;
    const targetType = targetProperties.type;

    if (
      !propertiesEqual &&
      (sourceType === undefined || sourceType !== targetType)
    ) {
      return 0;
    }

    const sourceText = getBoundary(source);
    const targetText = getBoundary(target);
    const prefix = commonTextPrefixLength(sourceText.prefix, targetText.prefix);
    const suffix = commonTextSuffixLength(
      sourceText.suffix,
      targetText.suffix,
      Math.max(0, Math.min(sourceText.length, targetText.length) - prefix)
    );
    const overlap = prefix + suffix;

    if (overlap === 0) return 0;

    return (propertiesEqual ? 1024 : 512) + overlap * 16;
  };
  const isCompleteTextContinuation = (source: JsonNode, target: JsonNode) => {
    const sourceText = getBoundary(source);

    if (
      sourceText.length === 0 ||
      sourceText.length > TREE_DIFF_TEXT_BOUNDARY
    ) {
      return false;
    }

    const targetText = getBoundary(target);
    const prefix = commonTextPrefixLength(sourceText.prefix, targetText.prefix);
    const suffix = commonTextSuffixLength(
      sourceText.suffix,
      targetText.suffix,
      Math.max(0, Math.min(sourceText.length, targetText.length) - prefix)
    );

    return prefix + suffix === sourceText.length;
  };
  const addPropertyChanges = (
    source: JsonNode,
    target: JsonNode,
    path: readonly number[]
  ) => {
    const sourceProperties = getProperties(source);
    const targetProperties = getProperties(target);

    if (jsonEqual(sourceProperties, targetProperties)) return;

    const context = getDocumentPropertyContext(
      before,
      path,
      options.root ?? null
    );
    const modifications = semanticPropertyModifications(
      sourceProperties,
      targetProperties,
      (key) => options.isSetValued?.(source, key, context) ?? false
    );

    if (modifications.length > 0) {
      changes.push({
        from: before.nodeRange(path).from,
        properties: propertyDeltaFromModifications(modifications),
      });
    }
  };
  const diffNode = (
    source: JsonNode,
    target: JsonNode,
    path: readonly number[]
  ) => {
    if (jsonEqual(source, target)) return true;
    if (isTextNode(source) !== isTextNode(target)) return false;

    addPropertyChanges(source, target, path);

    if (isTextNode(source) && isTextNode(target)) {
      const range = before.nodeRange(path);
      const prefix = commonTextPrefixLength(source.text, target.text);
      const suffix = commonTextSuffixLength(
        source.text,
        target.text,
        Math.min(source.text.length, target.text.length) - prefix
      );

      if (prefix !== source.text.length || prefix !== target.text.length) {
        changes.push({
          from: range.from + 1 + prefix,
          insert: DocumentSlice.text(
            target.text.slice(prefix, target.text.length - suffix)
          ),
          to: range.to - 1 - suffix,
        });
      }

      return true;
    }
    if (!isElementNode(source) || !isElementNode(target)) return false;

    return diffChildren(source.children, target.children, path);
  };
  const diffChildren = (
    source: readonly JsonNode[],
    target: readonly JsonNode[],
    parentPath: readonly number[]
  ): boolean => {
    let prefix = 0;

    while (
      prefix < source.length &&
      prefix < target.length &&
      jsonEqual(source[prefix], target[prefix])
    ) {
      prefix++;
    }

    let suffix = 0;

    while (
      suffix < source.length - prefix &&
      suffix < target.length - prefix &&
      jsonEqual(source.at(-suffix - 1), target.at(-suffix - 1))
    ) {
      suffix++;
    }

    const sourceEnd = source.length - suffix;
    const targetEnd = target.length - suffix;
    const sourceCount = sourceEnd - prefix;
    const targetCount = targetEnd - prefix;

    if (sourceCount * targetCount > TREE_DIFF_MATRIX_LIMIT) return false;

    const scores = Array.from({ length: sourceCount }, (_value, sourceIndex) =>
      Array.from({ length: targetCount }, (_targetValue, targetIndex) =>
        continuityScore(
          source[prefix + sourceIndex]!,
          target[prefix + targetIndex]!
        )
      )
    );
    const matrix = Array.from(
      { length: sourceCount + 1 },
      () => new Float64Array(targetCount + 1)
    );

    for (let sourceIndex = sourceCount - 1; sourceIndex >= 0; sourceIndex--) {
      for (let targetIndex = targetCount - 1; targetIndex >= 0; targetIndex--) {
        const score = scores[sourceIndex]![targetIndex]!;
        const matched =
          score > 0
            ? score + matrix[sourceIndex + 1]![targetIndex + 1]!
            : Number.NEGATIVE_INFINITY;

        matrix[sourceIndex]![targetIndex] = Math.max(
          matched,
          matrix[sourceIndex + 1]![targetIndex]!,
          matrix[sourceIndex]![targetIndex + 1]!
        );
      }
    }

    const matches: Array<readonly [number, number]> = [];
    let sourceIndex = 0;
    let targetIndex = 0;

    while (sourceIndex < sourceCount && targetIndex < targetCount) {
      const score = scores[sourceIndex]![targetIndex]!;
      const matched =
        score > 0
          ? score + matrix[sourceIndex + 1]![targetIndex + 1]!
          : Number.NEGATIVE_INFINITY;
      const skipSource = matrix[sourceIndex + 1]![targetIndex]!;
      const skipTarget = matrix[sourceIndex]![targetIndex + 1]!;

      if (matched >= skipSource && matched >= skipTarget) {
        matches.push(
          Object.freeze([prefix + sourceIndex, prefix + targetIndex] as const)
        );
        sourceIndex++;
        targetIndex++;
      } else if (skipTarget >= skipSource) {
        targetIndex++;
      } else {
        sourceIndex++;
      }
    }

    let sourceCursor = prefix;
    let targetCursor = prefix;
    const addGap = (sourceTo: number, targetTo: number) => {
      if (sourceCursor === sourceTo && targetCursor === targetTo) return;

      changes.push({
        from: before.childPosition(parentPath, sourceCursor),
        insert: DocumentSlice.fromNodes(target.slice(targetCursor, targetTo)),
        to: before.childPosition(parentPath, sourceTo),
      });
    };

    for (const [matchedSource, matchedTarget] of matches) {
      addGap(matchedSource, matchedTarget);

      const row = scores[matchedSource - prefix]!;
      const score = row[matchedTarget - prefix]!;
      const best = Math.max(...row);
      const column = scores.map(
        (candidateRow) => candidateRow[matchedTarget - prefix]!
      );
      const columnBest = Math.max(...column);

      if (
        matchedSource !== matchedTarget &&
        isCompleteTextContinuation(
          source[matchedSource]!,
          target[matchedTarget]!
        ) &&
        score === best &&
        row.filter((candidate) => candidate === best).length === 1 &&
        score === columnBest &&
        column.filter((candidate) => candidate === columnBest).length === 1
      ) {
        displaced = true;
      }

      if (
        !diffNode(source[matchedSource]!, target[matchedTarget]!, [
          ...parentPath,
          matchedSource,
        ])
      ) {
        return false;
      }

      sourceCursor = matchedSource + 1;
      targetCursor = matchedTarget + 1;
    }

    addGap(sourceEnd, targetEnd);

    return true;
  };

  return diffChildren(before.value, after.value, []) && displaced
    ? changes
    : null;
};

export class ChangeSet {
  readonly data: readonly SectionData[];
  readonly length: number;
  readonly newLength: number;
  readonly sections: readonly number[];

  private constructor(
    sections: readonly number[],
    data: readonly SectionData[]
  ) {
    this.sections = Object.freeze([...sections]);
    this.data = Object.freeze([...data]);
    this.length = this.sections.reduce(
      (length, value, index) => (index % 2 === 0 ? length + value : length),
      0
    );
    this.newLength = this.sections.reduce((length, value, index) => {
      if (index % 2 === 0) return length;

      return length + (value < 0 ? this.sections[index - 1]! : value);
    }, 0);
    Object.freeze(this);
  }

  static create(
    document: IndexedDocument,
    changes: ChangeSection | readonly ChangeSection[]
  ) {
    const input = Array.isArray(changes) ? changes : [changes];
    const ordered = input
      .map((change, index) => ({ ...change, index }))
      .sort(
        (left, right) => left.from - right.from || left.index - right.index
      );
    const sections: number[] = [];
    const data: SectionData[] = [];
    let position = 0;

    for (const change of ordered) {
      const to =
        change.to ??
        (change.properties === undefined ? change.from : change.from + 1);

      if (
        !Number.isInteger(change.from) ||
        !Number.isInteger(to) ||
        change.from < position ||
        to < change.from ||
        to > document.length
      ) {
        throw new RangeError(
          `Invalid or overlapping change range ${change.from}-${to}.`
        );
      }
      if (change.insert && change.properties) {
        throw new Error(
          'A document change section cannot replace content and modify properties.'
        );
      }

      if (change.from > position) {
        addSection(sections, data, change.from - position, -1, null);
      }

      if (change.properties) {
        const entry = document.nodeStartingAt(change.from);

        if (!entry || to !== change.from + 1) {
          throw new Error(
            'Node property delta must target one open node token.'
          );
        }

        const modifications = normalizePropertyDelta(change.properties);

        addSection(
          sections,
          data,
          1,
          modifications.length > 0 ? -2 : -1,
          modifications.length > 0 ? modifications : null
        );
        position = to;
        continue;
      }

      const insert = change.insert ?? DocumentSlice.empty;

      addSection(sections, data, to - change.from, insert.length, insert);
      position = to;
    }

    if (position < document.length) {
      addSection(sections, data, document.length - position, -1, null);
    }

    return new ChangeSet(sections, data);
  }

  static between(
    before: IndexedDocument,
    after: IndexedDocument,
    options: Readonly<{
      isSetValued?: DocumentSetPropertyResolver;
      root?: string | null;
    }> = {}
  ) {
    if (jsonEqual(before.value, after.value)) {
      return ChangeSet.empty(before.length);
    }

    const beforeTokens = before.tokens;
    const afterTokens = after.tokens;
    const propertyOnly =
      beforeTokens.length === afterTokens.length &&
      beforeTokens.tokens.length === afterTokens.tokens.length &&
      beforeTokens.tokens.every((token, index) => {
        const next = afterTokens.tokens[index];

        if (!next || token.kind !== next.kind) return false;
        if (token.kind === 'text' && next.kind === 'text') {
          return token.text === next.text;
        }
        if (token.kind === 'open' && next.kind === 'open') {
          return token.nodeKind === next.nodeKind;
        }

        return (
          token.kind === 'close' &&
          next.kind === 'close' &&
          token.nodeKind === next.nodeKind
        );
      });

    if (propertyOnly) {
      const changes = beforeTokens.tokens.flatMap((token, index) => {
        const next = afterTokens.tokens[index]!;

        if (
          token.kind !== 'open' ||
          next.kind !== 'open' ||
          jsonEqual(token.props, next.props)
        ) {
          return [];
        }

        const entry = before.nodeStartingAt(beforeTokens.offsets[index]!);

        if (!entry) {
          throw new Error('Cannot resolve changed node properties.');
        }

        const node = before.node(entry.path);
        const context = getDocumentPropertyContext(
          before,
          entry.path,
          options.root ?? null
        );
        const modifications = semanticPropertyModifications(
          token.props,
          next.props,
          (key) => options.isSetValued?.(node, key, context) ?? false
        );

        return modifications.length === 0
          ? []
          : [
              {
                from: beforeTokens.offsets[index]!,
                properties: propertyDeltaFromModifications(modifications),
                to: beforeTokens.offsets[index]! + 1,
              } satisfies ChangeSection,
            ];
      });

      return ChangeSet.create(before, changes);
    }

    const from = commonPrefixLength(beforeTokens.tokens, afterTokens.tokens);
    const suffix = commonSuffixLength(
      before.tokens.tokens,
      after.tokens.tokens,
      Math.min(before.length, after.length) - from
    );

    const flat = ChangeSet.create(before, {
      from,
      insert: after.slice(from, after.length - suffix),
      to: before.length - suffix,
    });
    const aligned = createStructurallyAlignedChanges(before, after, options);

    return aligned ? ChangeSet.create(before, aligned) : flat;
  }

  static empty(length: number) {
    return length === 0
      ? new ChangeSet([], [])
      : new ChangeSet([length, -1], [null]);
  }

  /** @internal Lift this change from a token window into its parent document. */
  embed(length: number, offset: number) {
    if (
      !Number.isSafeInteger(length) ||
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      offset + this.length > length
    ) {
      throw new RangeError('Cannot embed a change outside its document.');
    }

    const sections: number[] = [];
    const data: SectionData[] = [];

    addSection(sections, data, offset, -1, null);

    for (
      let index = 0, dataIndex = 0;
      index < this.sections.length;
      dataIndex++
    ) {
      addSection(
        sections,
        data,
        this.sections[index++]!,
        this.sections[index++]!,
        this.data[dataIndex]!
      );
    }

    addSection(sections, data, length - offset - this.length, -1, null);

    return new ChangeSet(sections, data);
  }

  static fromJSON(json: ChangeSetJson) {
    assertEditorJsonValue(json, 'ChangeSet JSON');

    if (!Array.isArray(json)) throw new Error('Invalid ChangeSet JSON.');

    const sections: number[] = [];
    const data: SectionData[] = [];

    for (const section of json) {
      if (
        !isRecord(section) ||
        typeof section.length !== 'number' ||
        !Number.isSafeInteger(section.length) ||
        section.length < 0
      ) {
        throw new Error('Invalid ChangeSet JSON.');
      }

      if (
        section.replacement !== undefined &&
        section.properties !== undefined
      ) {
        throw new Error('Invalid ChangeSet JSON.');
      }

      if (section.properties !== undefined) {
        if (section.length !== 1) throw new Error('Invalid ChangeSet JSON.');

        const modifications = propertyModificationsFromJSON(section.properties);

        if (modifications.length === 0) {
          throw new Error('Invalid property delta JSON.');
        }

        addSection(sections, data, 1, -2, modifications);
      } else if (section.replacement === undefined) {
        addSection(sections, data, section.length, -1, null);
      } else {
        if (!Array.isArray(section.replacement)) {
          throw new Error('Invalid ChangeSet JSON.');
        }

        const replacement = DocumentSlice.fromJSON(
          section.replacement as readonly JsonTokenData[]
        );

        addSection(
          sections,
          data,
          section.length,
          replacement.length,
          replacement
        );
      }
    }

    return new ChangeSet(sections, data);
  }

  static fromSections(
    sections: readonly number[],
    data: readonly SectionData[]
  ) {
    return new ChangeSet(sections, data);
  }

  static transform(a: ChangeSet, b: ChangeSet) {
    return {
      a: transformChange(a, b, true),
      b: transformChange(b, a, false),
    };
  }

  static transformInDocument(
    a: ChangeSet,
    b: ChangeSet,
    document: IndexedDocument
  ) {
    const aReplacements = a.replacements();
    const bReplacements = b.replacements();
    const aPropertyChanges = a.propertyChanges();
    const bPropertyChanges = b.propertyChanges();
    const [aReplacement] = aReplacements;
    const [bReplacement] = bReplacements;
    const hasSingleReplacement =
      aReplacements.length === 1 && bReplacements.length === 1;
    const isNodeDeletion = (replacement: Replacement | undefined): boolean => {
      if (!replacement || replacement.insert.length > 0) return false;

      return document.nodeStartingAt(replacement.from)?.to === replacement.to;
    };
    const contains = (
      outer: Replacement | undefined,
      inner: Replacement | undefined
    ) =>
      !!outer &&
      !!inner &&
      (inner.from === inner.to
        ? outer.from < inner.from && inner.to < outer.to
        : outer.from <= inner.from && inner.to <= outer.to);
    const getMove = (replacements: readonly Replacement[]) => {
      if (replacements.length !== 2) return null;

      const deletion = replacements.find(
        (replacement) =>
          replacement.from < replacement.to && replacement.insert.length === 0
      );
      const insertion = replacements.find(
        (replacement) =>
          replacement.from === replacement.to && replacement.insert.length > 0
      );

      if (!deletion || !insertion) return null;

      const source = document.nodeStartingAt(deletion.from);
      const target = document.childBoundaryAt(insertion.from);

      if (!source || source.to !== deletion.to || !target) return null;

      let insertedNodes: readonly JsonNode[];

      try {
        insertedNodes = decodeNodes(insertion.insert).nodes;
      } catch {
        return null;
      }

      const sourceNode = document.node(source.path);

      if (
        insertedNodes.length !== 1 ||
        !jsonEqual(insertedNodes[0], sourceNode)
      ) {
        return null;
      }

      const sourceParent = source.path.slice(0, -1);
      const sourceIndex = source.path.at(-1)!;
      const sameParent = pathKey(sourceParent) === pathKey(target.parentPath);
      const targetIndex =
        sameParent && sourceIndex < target.index
          ? target.index - 1
          : target.index;

      return {
        from: source.from,
        path: source.path,
        to: source.to,
        targetPath: [...target.parentPath, targetIndex],
      };
    };
    const aMove = getMove(aReplacements);
    const bMove = getMove(bReplacements);
    const createMappedPropertyChange = (
      source: readonly PropertyChange[],
      move: NonNullable<ReturnType<typeof getMove>>,
      afterMove: IndexedDocument
    ) => {
      const mapped = source.map((propertyChange) => {
        const entry = document.nodeStartingAt(propertyChange.from);

        if (
          !entry ||
          entry.path.length < move.path.length ||
          !move.path.every((part, index) => entry.path[index] === part)
        ) {
          return null;
        }

        const path = [
          ...move.targetPath,
          ...entry.path.slice(move.path.length),
        ];

        return {
          from: afterMove.nodeRange(path).from,
          modifications: propertyChange.modifications,
        };
      });

      if (mapped.some((change) => change === null)) return null;

      const sections: number[] = [];
      const data: SectionData[] = [];
      let position = 0;

      for (const change of (
        mapped as Array<{
          from: number;
          modifications: readonly PropertyModification[];
        }>
      ).sort((left, right) => left.from - right.from)) {
        if (change.from > position) {
          addSection(sections, data, change.from - position, -1, null);
        }
        addSection(sections, data, 1, -2, change.modifications);
        position = change.from + 1;
      }

      if (position < afterMove.length) {
        addSection(sections, data, afterMove.length - position, -1, null);
      }

      return ChangeSet.fromSections(sections, data);
    };

    if (
      aMove &&
      bMove &&
      pathKey(aMove.path) === pathKey(bMove.path) &&
      pathKey(aMove.targetPath) === pathKey(bMove.targetPath)
    ) {
      return {
        a: ChangeSet.empty(a.newLength),
        b: ChangeSet.empty(b.newLength),
      };
    }

    if (bMove && aReplacements.length === 0 && aPropertyChanges.length > 0) {
      const afterA = a.apply(document);
      const afterB = b.apply(document);
      const mapped = createMappedPropertyChange(
        aPropertyChanges,
        bMove,
        afterB
      );

      if (mapped) {
        return {
          a: mapped,
          b: moveNodeChange(afterA, bMove.path, bMove.targetPath),
        };
      }
    }

    if (aMove && bReplacements.length === 0 && bPropertyChanges.length > 0) {
      const afterA = a.apply(document);
      const afterB = b.apply(document);
      const mapped = createMappedPropertyChange(
        bPropertyChanges,
        aMove,
        afterA
      );

      if (mapped) {
        return {
          a: moveNodeChange(afterB, aMove.path, aMove.targetPath),
          b: mapped,
        };
      }
    }

    const transformed = ChangeSet.transform(a, b);
    const afterA = a.apply(document);
    const afterB = b.apply(document);

    try {
      if (
        jsonEqual(
          transformed.b.apply(afterA).value,
          transformed.a.apply(afterB).value
        )
      ) {
        return transformed;
      }
    } catch {
      // Resolve structural conflicts below.
    }

    if (
      bMove &&
      aReplacements.length === 1 &&
      bMove.from <= aReplacement!.from &&
      aReplacement!.to < bMove.to
    ) {
      const moveAfterA = moveNodeChange(afterA, bMove.path, bMove.targetPath);
      const merged = moveAfterA.apply(afterA);

      return {
        a: ChangeSet.between(afterB, merged),
        b: moveAfterA,
      };
    }

    if (
      aMove &&
      bReplacements.length === 1 &&
      aMove.from <= bReplacement!.from &&
      bReplacement!.to < aMove.to
    ) {
      const moveAfterB = moveNodeChange(afterB, aMove.path, aMove.targetPath);
      const merged = moveAfterB.apply(afterB);

      return {
        a: moveAfterB,
        b: ChangeSet.between(afterA, merged),
      };
    }

    if (
      hasSingleReplacement &&
      isNodeDeletion(bReplacement) &&
      contains(bReplacement, aReplacement)
    ) {
      const deletedPath = document.nodeStartingAt(bReplacement!.from)!.path;

      return {
        a: ChangeSet.empty(afterB.length),
        b: removeNodeChange(afterA, deletedPath),
      };
    }

    if (
      hasSingleReplacement &&
      isNodeDeletion(aReplacement) &&
      contains(aReplacement, bReplacement)
    ) {
      const deletedPath = document.nodeStartingAt(aReplacement!.from)!.path;

      return {
        a: removeNodeChange(afterB, deletedPath),
        b: ChangeSet.empty(afterA.length),
      };
    }

    return {
      a: ChangeSet.empty(afterB.length),
      b: ChangeSet.between(afterA, afterB),
    };
  }

  get empty() {
    return (
      this.sections.length === 0 ||
      (this.sections.length === 2 && this.sections[1] === -1)
    );
  }

  private applyIndexed(
    document: IndexedDocument,
    replacements: readonly Replacement[],
    propertyChanges: readonly PropertyChange[],
    work: MutableChangeSetApplyWork
  ) {
    if (propertyChanges.length > 0) {
      if (replacements.length > 0) {
        work.fallbackReason = 'mixed-properties-and-replacements';

        return null;
      }

      let current = document;

      for (const propertyChange of propertyChanges) {
        const entry = current.nodeStartingAt(propertyChange.from);

        if (!entry || propertyChange.to !== propertyChange.from + 1) {
          work.fallbackReason = 'invalid-property-target';

          return null;
        }

        const node = current.node(entry.path);

        current = current.withExactNodeProperties(
          entry.path,
          applyPropertyModifications(
            nodeProps(node),
            propertyChange.modifications
          )
        );
        work.ancestorPaths.push([...entry.path]);
      }

      return current;
    }

    if (replacements.length === 2) {
      const deletion = replacements.find(
        (replacement) =>
          replacement.from < replacement.to && replacement.insert.length === 0
      );
      const insertion = replacements.find(
        (replacement) =>
          replacement.from === replacement.to && replacement.insert.length > 0
      );

      if (deletion && insertion) {
        const source = document.nodeStartingAt(deletion.from);
        const target = document.childBoundaryAt(insertion.from);

        if (source?.to === deletion.to && target) {
          try {
            const inserted = decodeNodes(insertion.insert).nodes;
            const sourceNode = document.node(source.path);

            if (inserted.length === 1 && jsonEqual(inserted[0], sourceNode)) {
              const sourceParent = source.path.slice(0, -1);
              const sourceIndex = source.path.at(-1)!;
              const sameParent =
                pathKey(sourceParent) === pathKey(target.parentPath);
              const targetIndex =
                sameParent && sourceIndex < target.index
                  ? target.index - 1
                  : target.index;

              work.ancestorPaths.push(
                [...sourceParent],
                [...target.parentPath]
              );
              work.localizedReplacements = 2;

              return document.withMovedNode(source.path, [
                ...target.parentPath,
                targetIndex,
              ]);
            }
          } catch {
            // Fall through to canonical token application.
          }
        }
      }
    }

    const replacementsByPosition = [...replacements].sort(
      (left, right) => left.from - right.from
    );

    for (let index = 1; index < replacementsByPosition.length; index++) {
      const previous = replacementsByPosition[index - 1]!;
      const replacement = replacementsByPosition[index]!;

      if (previous.from === replacement.from) {
        work.fallbackReason = 'ambiguous-replacement-position';

        return null;
      }
      if (previous.to > replacement.from) {
        work.fallbackReason = 'overlapping-replacement-range';

        return null;
      }
    }

    let current = document;
    const recordLocality = (path: readonly number[]) => {
      work.ancestorPaths.push([...path]);
      work.localizedReplacements += 1;

      return true;
    };

    for (const replacement of replacementsByPosition.toReversed()) {
      const preparedNodes = DOCUMENT_SLICE_PREPARED_NODES.get(
        replacement.insert
      );
      const fromBoundary = current.childBoundaryAt(replacement.from);
      const toBoundary = current.childBoundaryAt(replacement.to);

      if (
        preparedNodes &&
        fromBoundary &&
        toBoundary &&
        pathKey(fromBoundary.parentPath) === pathKey(toBoundary.parentPath) &&
        claimPreparedNodeSlice(preparedNodes.nodes)
      ) {
        if (!recordLocality(fromBoundary.parentPath)) return null;
        current = profileCoreDuration('change-set-local-splice', () =>
          current.withPreparedSplicedNodes(
            fromBoundary.parentPath,
            fromBoundary.index,
            toBoundary.index - fromBoundary.index,
            preparedNodes
          )
        );
        continue;
      }

      const text = replacement.insert.tokens.every(
        (token) => token.kind === 'text'
      )
        ? replacement.insert.tokens
            .map((token) => (token.kind === 'text' ? token.text : ''))
            .join('')
        : null;
      const textEntry = current.textAt(replacement.from);

      if (
        text !== null &&
        textEntry &&
        textEntry.contentFrom <= replacement.from &&
        replacement.to <= textEntry.contentTo
      ) {
        if (!recordLocality(textEntry.path)) return null;
        current = current.withText(
          textEntry.path,
          replacement.from - textEntry.contentFrom,
          replacement.to - textEntry.contentFrom,
          text
        );
        continue;
      }

      const insertedTokens = replacement.insert.tokens;
      const nodeEntry = current.nodeStartingAt(replacement.from);

      if (
        replacement.to === replacement.from + 1 &&
        insertedTokens.length === 1 &&
        insertedTokens[0]?.kind === 'open' &&
        nodeEntry
      ) {
        if (!recordLocality(nodeEntry.path)) return null;
        current = current.withExactNodeProperties(
          nodeEntry.path,
          insertedTokens[0].props
        );
        continue;
      }

      let insertedNodes: readonly JsonNode[] | null = null;

      try {
        insertedNodes = profileCoreDuration(
          'change-set-local-decode',
          () =>
            decodeNodes(replacement.insert, [], {
              reuseUnpreparedSources: false,
            }).nodes
        );
      } catch {
        // An open structural fragment may only decode with its local ancestor.
      }

      if (
        fromBoundary &&
        toBoundary &&
        insertedNodes &&
        pathKey(fromBoundary.parentPath) === pathKey(toBoundary.parentPath)
      ) {
        if (!recordLocality(fromBoundary.parentPath)) return null;
        current = profileCoreDuration('change-set-local-splice', () =>
          current.withDecodedSplicedNodes(
            fromBoundary.parentPath,
            fromBoundary.index,
            toBoundary.index - fromBoundary.index,
            insertedNodes
          )
        );
        continue;
      }

      if (insertedNodes && nodeEntry?.to === replacement.to) {
        const index = nodeEntry.path.at(-1)!;
        const parentPath = nodeEntry.path.slice(0, -1);

        if (!recordLocality(parentPath)) return null;
        current = profileCoreDuration('change-set-local-splice', () =>
          current.withDecodedSplicedNodes(parentPath, index, 1, insertedNodes)
        );
        continue;
      }

      if (
        insertedNodes &&
        replacement.from === replacement.to &&
        insertedNodes.length > 0
      ) {
        const boundary = current.childBoundaryAt(replacement.from);

        if (boundary) {
          if (!recordLocality(boundary.parentPath)) return null;
          current = profileCoreDuration('change-set-local-splice', () =>
            current.withDecodedSplicedNodes(
              boundary.parentPath,
              boundary.index,
              0,
              insertedNodes
            )
          );
          continue;
        }
      }

      const fromContext = current.openContextAt(replacement.from);
      const toPaths = new Set(
        current
          .openContextAt(replacement.to)
          .map((entry) => pathKey(entry.path))
      );
      const ancestors = [...fromContext]
        .reverse()
        .filter(
          (entry) =>
            toPaths.has(pathKey(entry.path)) &&
            entry.from <= replacement.from &&
            replacement.to <= entry.to &&
            (replacement.from !== replacement.to ||
              (entry.from < replacement.from && replacement.from < entry.to))
        );

      let localized = false;

      for (const ancestor of ancestors) {
        try {
          const ancestorSlice = current.nodeSlice(ancestor.path);
          const replacementFrom = replacement.from - ancestor.from;
          const replacementTo = replacement.to - ancestor.from;
          const local = DocumentSlice.concat([
            ancestorSlice.slice(0, replacementFrom),
            replacement.insert,
            ancestorSlice.slice(replacementTo),
          ]);
          const nodes = profileCoreDuration(
            'change-set-local-decode',
            () => decodeNodes(local).nodes
          );
          const index = ancestor.path.at(-1)!;

          if (!recordLocality(ancestor.path)) return null;
          current = profileCoreDuration('change-set-local-splice', () =>
            current.withDecodedSplicedNodes(
              ancestor.path.slice(0, -1),
              index,
              1,
              nodes
            )
          );
          localized = true;
          break;
        } catch {
          // Open slices may need a wider shared ancestor to become balanced.
        }
      }

      if (localized) continue;

      work.fallbackReason = 'unresolved-local-replacement';

      return null;
    }

    return current;
  }

  private replacements() {
    const replacements: Replacement[] = [];
    let position = 0;

    for (let index = 0, dataIndex = 0; index < this.sections.length; ) {
      const length = this.sections[index++]!;
      const inserted = this.sections[index++]!;
      const data = this.data[dataIndex++]!;

      if (inserted >= 0) {
        replacements.push({
          from: position,
          insert: (data ?? DocumentSlice.empty) as DocumentSlice,
          to: position + length,
        });
      }

      position += length;
    }

    return replacements;
  }

  private propertyChanges() {
    const changes: PropertyChange[] = [];
    let position = 0;

    for (let index = 0, dataIndex = 0; index < this.sections.length; ) {
      const length = this.sections[index++]!;
      const inserted = this.sections[index++]!;
      const data = this.data[dataIndex++]!;

      if (inserted === -2) {
        changes.push({
          from: position,
          modifications: data as readonly PropertyModification[],
          to: position + length,
        });
      }

      position += length;
    }

    return changes;
  }

  movedNode(document: IndexedDocument): Readonly<{
    path: readonly number[];
    targetPath: readonly number[];
  }> | null {
    const replacements = this.replacements();

    if (replacements.length !== 2) return null;

    const deletion = replacements.find(
      (replacement) =>
        replacement.from < replacement.to && replacement.insert.length === 0
    );
    const insertion = replacements.find(
      (replacement) =>
        replacement.from === replacement.to && replacement.insert.length > 0
    );

    if (!deletion || !insertion) return null;

    const source = document.nodeStartingAt(deletion.from);
    const target = document.childBoundaryAt(insertion.from);

    if (!source || source.to !== deletion.to || !target) return null;

    try {
      const inserted = decodeNodes(insertion.insert).nodes;
      const sourceNode = document.node(source.path);

      if (inserted.length !== 1 || !jsonEqual(inserted[0], sourceNode)) {
        return null;
      }

      const sourceParent = source.path.slice(0, -1);
      const sourceIndex = source.path.at(-1)!;
      const sameParent = pathKey(sourceParent) === pathKey(target.parentPath);
      const targetIndex =
        sameParent && sourceIndex < target.index
          ? target.index - 1
          : target.index;
      const targetParent = transformPathAfterRemove(
        target.parentPath,
        source.path
      );

      if (!targetParent) return null;

      return Object.freeze({
        path: Object.freeze([...source.path]),
        targetPath: Object.freeze([...targetParent, targetIndex]),
      });
    } catch {
      return null;
    }
  }

  apply(document: IndexedDocument) {
    return profileCoreDuration('change-set-apply', () =>
      this.applyInternal(document)
    );
  }

  private applyInternal(document: IndexedDocument) {
    if (document.length !== this.length) {
      throw new Error(
        `Cannot apply change length ${this.length} to document length ${document.length}.`
      );
    }

    if (this.empty) return document;

    const replacements = this.replacements();
    const propertyChanges = this.propertyChanges();
    const changedRanges: Array<{
      fromAfter: number;
      fromBefore: number;
      toAfter: number;
      toBefore: number;
    }> = [];
    const work: MutableChangeSetApplyWork = {
      ancestorPaths: [],
      fallbackReason: null,
      localizedReplacements: 0,
    };

    this.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
      changedRanges.push({ fromAfter, fromBefore, toAfter, toBefore });
    });

    const recordStats = (usedTokenFallback: boolean) => {
      CHANGE_SET_APPLY_STATS.set(
        this,
        Object.freeze({
          ancestorPaths: Object.freeze(
            work.ancestorPaths.map((path) => Object.freeze([...path]))
          ),
          changedRanges: Object.freeze(
            changedRanges.map((range) => Object.freeze({ ...range }))
          ),
          fallbackReason: work.fallbackReason,
          localizedReplacements: work.localizedReplacements,
          propertyChanges: propertyChanges.length,
          replacements: replacements.length,
          usedTokenFallback,
        })
      );
    };
    const indexed = profileCoreDuration('change-set-apply-indexed', () =>
      this.applyIndexed(document, replacements, propertyChanges, work)
    );

    if (indexed) {
      recordStats(false);

      return indexed;
    }

    return profileCoreDuration('change-set-apply-token-fallback', () => {
      const outputTokens: JsonToken[] = [];
      let position = 0;

      const append = (slice: DocumentSlice) => {
        for (const token of slice.tokens) outputTokens.push(token);
      };

      for (let index = 0, dataIndex = 0; index < this.sections.length; ) {
        const length = this.sections[index++]!;
        const inserted = this.sections[index++]!;
        const value = this.data[dataIndex++]!;

        const source = document.slice(position, position + length);

        append(
          inserted === -1
            ? source
            : inserted === -2
              ? applyPropertyModificationsToSlice(
                  source,
                  value as readonly PropertyModification[]
                )
              : ((value ?? DocumentSlice.empty) as DocumentSlice)
        );
        position += length;
      }

      if (position !== document.length) {
        throw new Error('ChangeSet does not cover the source document.');
      }

      const outputRanges: ChangedOutputRange[] = [];

      for (const { fromAfter, toAfter } of changedRanges) {
        outputRanges.push([fromAfter, toAfter]);
      }
      recordStats(true);

      return IndexedDocument.fromChangedTokens(
        DocumentSlice.fromTokens(outputTokens),
        outputRanges
      );
    });
  }

  compose(other: ChangeSet) {
    if (this.newLength !== other.length) {
      throw new Error('Cannot compose mismatched change-set lengths.');
    }

    const { data, sections } = composeSections(
      this.sections,
      this.data,
      other.sections,
      other.data
    );

    return new ChangeSet(sections, data);
  }

  invert(document: IndexedDocument) {
    if (document.length !== this.length) {
      throw new Error('Cannot invert against a mismatched document.');
    }

    const sections: number[] = [];
    const data: SectionData[] = [];
    let position = 0;

    for (let index = 0; index < this.sections.length; index += 2) {
      const length = this.sections[index]!;
      const inserted = this.sections[index + 1]!;

      if (inserted === -1) {
        addSection(sections, data, length, -1, null);
      } else if (inserted === -2) {
        const entry = document.nodeStartingAt(position);

        if (!entry || length !== 1) {
          throw new Error('Cannot invert an invalid node property delta.');
        }

        addSection(
          sections,
          data,
          1,
          -2,
          invertPropertyModifications(
            nodeProps(document.node(entry.path)),
            this.data[index >> 1] as readonly PropertyModification[]
          )
        );
      } else {
        const original =
          length === 0
            ? DocumentSlice.empty
            : document.slice(position, position + length);

        addSection(sections, data, inserted, length, original);
      }

      position += length;
    }

    return new ChangeSet(sections, data);
  }

  iterChangedRanges(
    visit: (fromA: number, toA: number, fromB: number, toB: number) => void
  ) {
    let positionA = 0;
    let positionB = 0;

    for (let index = 0; index < this.sections.length; ) {
      let length = this.sections[index++]!;
      let inserted = this.sections[index++]!;

      if (inserted === -1) {
        positionA += length;
        positionB += length;
        continue;
      }

      if (inserted === -2) inserted = length;

      while (index < this.sections.length && this.sections[index + 1] !== -1) {
        length += this.sections[index++]!;
        const added = this.sections[index++]!;

        inserted += added === -2 ? this.sections[index - 2]! : added;
      }

      visit(positionA, positionA + length, positionB, positionB + inserted);
      positionA += length;
      positionB += inserted;
    }
  }

  mapPos(
    position: number,
    assoc: -1 | 1 = -1,
    track?: TrackMode
  ): number | null {
    let positionA = 0;
    let positionB = 0;

    for (let index = 0; index < this.sections.length; ) {
      const length = this.sections[index++]!;
      const inserted = this.sections[index++]!;
      const endA = positionA + length;

      if (inserted < 0) {
        if (endA > position) return positionB + position - positionA;
        positionB += length;
      } else {
        if (
          track &&
          endA >= position &&
          ((track === 'around' && positionA < position && endA > position) ||
            (track === 'before' && positionA < position) ||
            (track === 'after' && endA > position))
        ) {
          return null;
        }

        if (
          endA > position ||
          (endA === position && assoc < 0 && length === 0)
        ) {
          return position === positionA || assoc < 0
            ? positionB
            : positionB + inserted;
        }

        positionB += inserted;
      }

      positionA = endA;
    }

    if (position > positionA) {
      throw new RangeError(
        `Position ${position} exceeds ChangeSet length ${positionA}.`
      );
    }

    return positionB;
  }

  toJSON(): ChangeSetJson {
    return this.data.map((value, index) => {
      const length = this.sections[index * 2]!;
      const inserted = this.sections[index * 2 + 1]!;

      if (inserted === -1) return { length };
      if (inserted === -2) {
        return {
          length,
          properties: {
            operations: (value as readonly PropertyModification[]).map(
              propertyModificationToJSON
            ),
            version: 1,
          },
        };
      }

      return {
        length,
        replacement: (value as DocumentSlice | null)?.toJSON() ?? [],
      };
    });
  }
}

const changeText = (
  document: IndexedDocument,
  path: readonly number[],
  from: number,
  to: number,
  text: string
) => {
  const start = document.positionAt({ offset: from, path });
  const end = document.positionAt({ offset: to, path });

  return ChangeSet.create(document, {
    from: start,
    insert: DocumentSlice.text(text),
    to: end,
  });
};

export const insertTextChange = (
  document: IndexedDocument,
  path: readonly number[],
  offset: number,
  text: string
) => changeText(document, path, offset, offset, text);

export const removeTextChange = (
  document: IndexedDocument,
  path: readonly number[],
  offset: number,
  text: string
) => changeText(document, path, offset, offset + text.length, '');

export const insertNodeChange = (
  document: IndexedDocument,
  path: readonly number[],
  node: JsonNode
) => {
  const parentPath = path.slice(0, -1);
  const index = path.at(-1);

  if (index === undefined) throw new Error('Cannot insert the document root.');

  return ChangeSet.create(document, {
    from: document.childPosition(parentPath, index),
    insert: DocumentSlice.fromNodes([node]),
  });
};

export const removeNodeChange = (
  document: IndexedDocument,
  path: readonly number[]
) => {
  const range = document.nodeRange(path);

  return ChangeSet.create(document, range);
};

export const setNodeChange = (
  document: IndexedDocument,
  path: readonly number[],
  newProperties: JsonRecord,
  properties: JsonRecord = {},
  isSetValued: DocumentSetPropertyResolver = () => false,
  root: string | null = null
) => {
  const node = document.node(path);
  const context = getDocumentPropertyContext(document, path, root);
  const next = { ...node } as JsonRecord;

  for (const key of Object.keys(properties)) {
    if (!Object.hasOwn(newProperties, key)) delete next[key];
  }

  for (const [key, value] of Object.entries(newProperties)) {
    if (value === null) {
      delete next[key];
    } else {
      next[key] = value;
    }
  }

  const range = document.nodeRange(path);
  const modifications = semanticPropertyModifications(
    nodeProps(node),
    nodeProps(next as JsonNode),
    (key) => isSetValued(node, key, context)
  );

  if (modifications.length === 0) return ChangeSet.empty(document.length);

  return ChangeSet.create(document, {
    from: range.from,
    properties: propertyDeltaFromModifications(modifications),
    to: range.from + 1,
  });
};

/** @internal Build a path-targeted property section for transform adapters. */
export const updateNodePropertiesChange = (
  document: IndexedDocument,
  path: readonly number[],
  properties: NodePropertyDelta
) => {
  const range = document.nodeRange(path);

  return ChangeSet.create(document, {
    from: range.from,
    properties,
    to: range.from + 1,
  });
};

export const moveNodeChange = (
  document: IndexedDocument,
  path: readonly number[],
  newPath: readonly number[]
) => {
  if (pathKey(path) === pathKey(newPath)) {
    return ChangeSet.empty(document.length);
  }

  const range = document.nodeRange(path);
  const sourceParent = path.slice(0, -1);
  const targetParent = newPath.slice(0, -1);
  const sourceIndex = path.at(-1);
  const targetIndex = newPath.at(-1);

  if (sourceIndex === undefined || targetIndex === undefined) {
    throw new Error('Cannot move the document root.');
  }

  const sameParent = pathKey(sourceParent) === pathKey(targetParent);
  const targetParentChildren =
    targetParent.length === 0
      ? document.value
      : (() => {
          const parent = document.node(targetParent);

          if (!isElementNode(parent)) {
            throw new Error(`Node at [${targetParent}] is not an element.`);
          }

          return parent.children;
        })();
  const originTargetIndex =
    sameParent && sourceIndex < targetIndex
      ? Math.min(targetIndex + 1, targetParentChildren.length)
      : targetIndex;
  const target = document.childPosition(targetParent, originTargetIndex);

  if (range.from <= target && target <= range.to) {
    throw new Error('Cannot move a node inside itself.');
  }

  return ChangeSet.create(document, [
    { from: range.from, to: range.to },
    { from: target, insert: document.nodeSlice(path) },
  ]);
};

export const replaceChildrenChange = (
  document: IndexedDocument,
  path: readonly number[],
  index: number,
  removeCount: number,
  newChildren: readonly JsonNode[]
) => {
  const currentChildren =
    path.length === 0
      ? document.value
      : (() => {
          const parent = document.node(path);

          if (!isElementNode(parent)) {
            throw new Error(`Node at [${path}] is not an element.`);
          }

          return parent.children;
        })();
  const removed = currentChildren.slice(index, index + removeCount);

  if (
    removed.length === newChildren.length &&
    removed.every((node, childIndex) =>
      jsonEqual(node, newChildren[childIndex])
    )
  ) {
    return ChangeSet.empty(document.length);
  }

  return ChangeSet.create(document, {
    from: document.childPosition(path, index),
    insert: DocumentSlice.fromNodes(newChildren),
    to: document.childPosition(path, index + removed.length),
  });
};

/** @internal Build one canonical child reconciliation without applying it. */
export const reconcileChildrenStep = (
  document: IndexedDocument,
  path: readonly number[],
  index: number,
  removeCount: number,
  newChildren: readonly JsonNode[]
) => {
  const currentChildren =
    path.length === 0
      ? document.value
      : (() => {
          const parent = document.node(path);

          if (!isElementNode(parent)) {
            throw new Error(`Node at [${path}] is not an element.`);
          }

          return parent.children;
        })();
  const removed = currentChildren.slice(index, index + removeCount);

  if (
    removed.length === newChildren.length &&
    removed.every((node, childIndex) =>
      jsonEqual(node, newChildren[childIndex])
    )
  ) {
    return Object.freeze({
      after: document,
      change: ChangeSet.empty(document.length),
    });
  }

  const after = document.withSplicedNodes(
    path,
    index,
    removed.length,
    newChildren
  );

  if (removed.length === 0 || newChildren.length === 0) {
    return Object.freeze({
      after,
      change: ChangeSet.create(document, {
        from: document.childPosition(path, index),
        insert: DocumentSlice.fromNodes(newChildren),
        to: document.childPosition(path, index + removed.length),
      }),
    });
  }

  const beforeWindow = IndexedDocument.fromValue(removed);
  const afterWindow = IndexedDocument.fromValue(newChildren);
  const localChange = ChangeSet.between(beforeWindow, afterWindow);
  const offset = document.childPosition(path, index);

  return Object.freeze({
    after,
    change: localChange.embed(document.length, offset),
  });
};

export const mergeNodeChange = (
  document: IndexedDocument,
  path: readonly number[]
) => {
  const index = path.at(-1);

  if (index === undefined || index === 0) {
    throw new Error(`Cannot merge node at [${path}].`);
  }

  const previousPath = [...path.slice(0, -1), index - 1];
  const previous = document.node(previousPath);
  const node = document.node(path);

  if (
    !(
      (isTextNode(previous) && isTextNode(node)) ||
      (isElementNode(previous) && isElementNode(node))
    )
  ) {
    throw new Error(`Cannot merge nodes of different kinds at [${path}].`);
  }

  const boundary = document.nodeRange(path).from;

  // A merge removes only the previous close token and current open token.
  // Encoding that primitive directly preserves the join position for points
  // on either side; a generic tree diff loses that semantic boundary.
  return ChangeSet.create(document, {
    from: boundary - 1,
    to: boundary + 1,
  });
};

export const splitNodeChange = (
  document: IndexedDocument,
  path: readonly number[],
  position: number,
  properties: JsonRecord
) => {
  const index = path.at(-1);

  if (index === undefined) throw new Error('Cannot split the document root.');

  const node = document.node(path);
  let before: JsonNode;
  let after: JsonNode;

  if (isTextNode(node)) {
    if (position < 0 || position > node.text.length) {
      throw new Error(`Cannot split text at offset ${position}.`);
    }

    before = { ...node, text: node.text.slice(0, position) };
    after = { ...properties, text: node.text.slice(position) } as JsonNode;
  } else {
    if (position < 0 || position > node.children.length) {
      throw new Error(`Cannot split element at child index ${position}.`);
    }

    before = { ...node, children: node.children.slice(0, position) };
    after = {
      ...(typeof properties.type === 'string'
        ? { type: properties.type }
        : typeof node.type === 'string'
          ? { type: node.type }
          : {}),
      ...properties,
      children: node.children.slice(position),
    } as JsonNode;
  }

  const split = document.withSplicedNodes(path.slice(0, -1), index, 1, [
    before,
    after,
  ]);

  return ChangeSet.between(document, split);
};

const classifyDocumentRange = (
  document: IndexedDocument,
  from: number,
  to: number
) => {
  const entries =
    from === to
      ? []
      : document
          .nodeRangesTouching(from, to)
          .filter((entry) => entry.from < to && from < entry.to);
  const structure = entries
    .flatMap((entry) => [
      ...(from <= entry.from && entry.from < to
        ? [
            {
              position: entry.from,
              signature: `open:${entry.kind}`,
            },
          ]
        : []),
      ...(from <= entry.to - 1 && entry.to - 1 < to
        ? [
            {
              position: entry.to - 1,
              signature: `close:${entry.kind}`,
            },
          ]
        : []),
    ])
    .sort((left, right) => left.position - right.position)
    .map(({ signature }) => signature);
  const text = entries
    .filter((entry) => entry.kind === 'text')
    .sort((left, right) => left.contentFrom - right.contentFrom)
    .flatMap((entry) => {
      const start = Math.max(from, entry.contentFrom);
      const end = Math.min(to, entry.contentTo);

      if (start >= end) return [];

      const node = document.node(entry.path);

      return isTextNode(node)
        ? [node.text.slice(start - entry.contentFrom, end - entry.contentFrom)]
        : [];
    });
  const properties = entries
    .filter((entry) => from <= entry.from && entry.from < to)
    .sort((left, right) => left.from - right.from)
    .map((entry) => nodeProps(document.node(entry.path)));

  return { properties, structure, text };
};

const classifyChangeSetWithRuntimeCandidates = (
  change: ChangeSet,
  before: IndexedDocument,
  after: IndexedDocument
): Readonly<{
  classification: DocumentChangeRootClassification;
  runtimeCandidates: readonly DocumentChangeRuntimeCandidate[];
}> => {
  const paths = new Map<string, readonly number[]>();
  const runtimeCandidates = new Map<string, DocumentChangeRuntimeCandidate>();
  const movedNode = change.movedNode(before);
  let properties = false;
  let structure = movedNode !== null;
  let text = false;

  if (movedNode) {
    paths.set(pathKey(movedNode.path), Object.freeze([...movedNode.path]));
    paths.set(
      pathKey(movedNode.targetPath),
      Object.freeze([...movedNode.targetPath])
    );
    runtimeCandidates.set(
      pathKey(movedNode.targetPath),
      Object.freeze({
        node: after.node(movedNode.targetPath),
        path: Object.freeze([...movedNode.targetPath]),
      })
    );
  }

  let positionBefore = 0;
  let positionAfter = 0;

  for (let index = 0; index < change.sections.length; ) {
    const length = change.sections[index++]!;
    const inserted = change.sections[index++]!;
    const fromBefore = positionBefore;
    const toBefore = positionBefore + length;
    const fromAfter = positionAfter;
    const toAfter = positionAfter + (inserted < 0 ? length : inserted);

    positionBefore = toBefore;
    positionAfter = toAfter;

    if (inserted === -1) continue;

    const overlappingRanges = (
      document: IndexedDocument,
      from: number,
      to: number
    ) =>
      from === to
        ? []
        : document
            .nodeRangesTouching(from, to)
            .filter((entry) => entry.from < to && from < entry.to);

    const beforeEntries = overlappingRanges(before, fromBefore, toBefore);
    const afterEntries = overlappingRanges(after, fromAfter, toAfter);

    for (const entry of [...beforeEntries, ...afterEntries]) {
      paths.set(pathKey(entry.path), Object.freeze([...entry.path]));
    }
    for (const entry of [
      ...after.nodeRangesTouching(fromAfter, toAfter),
      ...after.nodeRangesTouching(fromAfter),
      ...after.nodeRangesTouching(toAfter),
    ]) {
      const key = pathKey(entry.path);

      if (runtimeCandidates.has(key)) continue;
      runtimeCandidates.set(
        key,
        Object.freeze({
          node: after.node(entry.path),
          path: Object.freeze([...entry.path]),
        })
      );
    }

    if (inserted === -2) {
      properties = true;
      continue;
    }

    const beforeRange = classifyDocumentRange(before, fromBefore, toBefore);
    const afterRange = classifyDocumentRange(after, fromAfter, toAfter);
    const beforeStructure = beforeRange.structure;
    const afterStructure = afterRange.structure;
    const rangeStructureChanged =
      beforeStructure.length !== afterStructure.length ||
      beforeStructure.some(
        (signature, index) => signature !== afterStructure[index]
      );

    if (rangeStructureChanged) {
      structure = true;
      continue;
    }

    if (movedNode) continue;

    const beforeText = beforeRange.text;
    const afterText = afterRange.text;

    if (
      beforeText.length !== afterText.length ||
      beforeText.some((value, index) => value !== afterText[index])
    ) {
      text = true;
    }

    const beforeOpen = beforeRange.properties;
    const afterOpen = afterRange.properties;

    if (
      beforeOpen.length !== afterOpen.length ||
      beforeOpen.some(
        (token, index) =>
          !afterOpen[index] || !jsonEqual(token, afterOpen[index])
      )
    ) {
      properties = true;
    }
  }

  return Object.freeze({
    classification: Object.freeze({
      paths: Object.freeze([...paths.values()]),
      properties,
      structure,
      text,
    }),
    runtimeCandidates: Object.freeze([...runtimeCandidates.values()]),
  });
};

const classifyChangeSet = (
  change: ChangeSet,
  before: IndexedDocument,
  after: IndexedDocument
): DocumentChangeRootClassification =>
  classifyChangeSetWithRuntimeCandidates(change, before, after).classification;

/** @internal Classify one root without publishing classification metadata. */
export const classifyDocumentChangeRoot = (
  change: ChangeSet,
  before: IndexedDocument,
  after: IndexedDocument
): DocumentChangeRootClassification => classifyChangeSet(change, before, after);

const getDocumentRangePaths = (
  document: IndexedDocument,
  from: number,
  to: number
) => {
  const paths = new Map<string, readonly number[]>();

  for (const entry of [
    ...document.nodeRangesTouching(from, to),
    ...document.nodeRangesTouching(from),
    ...document.nodeRangesTouching(to),
  ]) {
    const path = Object.freeze([...entry.path]);

    paths.set(pathKey(path), path);
  }

  return Object.freeze([...paths.values()]);
};

const getTopLevelRange = (
  paths: readonly (readonly number[])[]
): TopLevelRuntimeRange | null => {
  const indices = paths.flatMap((path) =>
    path[0] === undefined ? [] : [path[0]]
  );

  return indices.length === 0
    ? null
    : Object.freeze([Math.min(...indices), Math.max(...indices)]);
};

/**
 * @internal Final-coordinate paths at or inside one root change. Removed-only
 * ranges resolve to their surviving boundary; an empty result means the root.
 */
export const getDocumentChangeAfterPaths = (
  change: ChangeSet,
  after: IndexedDocument
): readonly (readonly number[])[] => {
  const paths = new Map<string, readonly number[]>();

  change.iterChangedRanges((_fromBefore, _toBefore, fromAfter, toAfter) => {
    for (const path of getDocumentRangePaths(after, fromAfter, toAfter)) {
      paths.set(pathKey(path), path);
    }
  });

  return Object.freeze([...paths.values()]);
};

/** @internal Bounded top-level windows for each changed root range. */
export const getDocumentChangeTopLevelRanges = (
  change: ChangeSet,
  before: IndexedDocument,
  after: IndexedDocument
): readonly EditorTransactionTopLevelRange[] => {
  const ranges: EditorTransactionTopLevelRange[] = [];

  change.iterChangedRanges((fromBefore, toBefore, fromAfter, toAfter) => {
    ranges.push(
      Object.freeze({
        after: getTopLevelRange(
          getDocumentRangePaths(after, fromAfter, toAfter)
        ),
        before: getTopLevelRange(
          getDocumentRangePaths(before, fromBefore, toBefore)
        ),
      })
    );
  });

  return Object.freeze(ranges);
};

const valueRoot = (value: JsonEditorValue, root: string) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

const readCanonicalChangeSetJson = (value: unknown): ChangeSetJson | null => {
  if (
    !isRecord(value) ||
    typeof value.empty !== 'boolean' ||
    !Number.isSafeInteger(value.length) ||
    (value.length as number) < 0 ||
    !Number.isSafeInteger(value.newLength) ||
    (value.newLength as number) < 0 ||
    !Array.isArray(value.sections) ||
    !Array.isArray(value.data) ||
    !hasFunctions(value, [
      'apply',
      'compose',
      'invert',
      'iterChangedRanges',
      'mapPos',
      'movedNode',
      'toJSON',
    ])
  ) {
    return null;
  }

  try {
    assertEditorJsonValue(value.sections, 'ChangeSet sections');

    const json = Reflect.apply(
      value.toJSON as () => unknown,
      value,
      []
    ) as ChangeSetJson;
    const decoded = ChangeSet.fromJSON(json);
    const canonical = decoded.toJSON();

    if (
      !jsonEqual(json, canonical) ||
      !jsonEqual(value.sections, decoded.sections) ||
      value.data.length !== decoded.data.length ||
      value.length !== decoded.length ||
      value.newLength !== decoded.newLength ||
      value.empty !== decoded.empty
    ) {
      return null;
    }

    return canonical;
  } catch {
    return null;
  }
};

export type DocumentChangeInput = Readonly<{
  /** Named roots created by this change. */
  createRoots?: Iterable<string>;
  /** Named roots deleted by this change. */
  deleteRoots?: Iterable<string>;
  /** Change for the implicit primary document. */
  primary?: ChangeSet | null;
  /** Derived classification for the primary change. */
  primaryClassification?: DocumentChangeRootClassification | null;
  /** Derived classifications keyed only by named roots. */
  rootClassifications?: ReadonlyMap<string, DocumentChangeRootClassification>;
  /** Changes keyed only by named secondary roots. */
  roots?: ReadonlyMap<string, ChangeSet>;
}>;

export type DocumentChangeMapPositionOptions<TRoot extends string = string> =
  Readonly<{
    association?: 'backward' | 'forward';
    /** Named secondary root. Omit for the primary root. */
    root?: NamedRootKey<TRoot>;
    track?: TrackMode;
  }>;

/** @internal Read one change through the private primary-root sentinel. */
export const getInternalDocumentChangeSet = (
  change: DocumentChange,
  root: string
) => (root === 'main' ? (change.primary ?? undefined) : change.roots.get(root));

/** @internal Read one classification through the private primary-root sentinel. */
export const getInternalDocumentChangeClassification = (
  change: DocumentChange,
  root: string
) =>
  root === 'main'
    ? (change.primaryClassification ?? undefined)
    : change.rootClassifications.get(root);

/** @internal Map through an internal sentinel-keyed root. */
export const mapInternalDocumentChangePosition = (
  change: DocumentChange,
  root: string,
  position: number,
  association: -1 | 1 = -1,
  track?: TrackMode
) =>
  change.mapPosition(position, {
    association: association === -1 ? 'backward' : 'forward',
    ...(root === 'main' ? {} : { root }),
    track,
  });

/** @internal Iterate changes through the private primary-root sentinel. */
export function* getInternalDocumentChangeEntries(
  change: DocumentChange
): Generator<readonly [string, ChangeSet]> {
  if (change.primary) yield ['main', change.primary];
  yield* change.roots;
}

/** @internal Iterate classifications through the private primary-root sentinel. */
export function* getInternalDocumentChangeClassificationEntries(
  change: DocumentChange
): Generator<readonly [string, DocumentChangeRootClassification]> {
  if (change.primaryClassification) {
    yield ['main', change.primaryClassification];
  }
  yield* change.rootClassifications;
}

/** @internal Construct from an internal sentinel-keyed root map. */
export const createInternalDocumentChange = (
  changes: ReadonlyMap<string, ChangeSet>,
  options: Readonly<{
    classifications?: ReadonlyMap<string, DocumentChangeRootClassification>;
    createRoots?: Iterable<string>;
    deleteRoots?: Iterable<string>;
  }> = {}
) => {
  const roots = new Map(changes);
  const classifications = new Map(options.classifications ?? []);
  const primary = roots.get('main') ?? null;
  const primaryClassification = classifications.get('main') ?? null;

  roots.delete('main');
  classifications.delete('main');

  return new DocumentChange({
    createRoots: options.createRoots,
    deleteRoots: options.deleteRoots,
    primary,
    primaryClassification,
    rootClassifications: classifications,
    roots,
  });
};

export class DocumentChange {
  /** Named roots created by this change. */
  readonly createRoots: ReadonlySet<string>;
  /** Named roots deleted by this change. */
  readonly deleteRoots: ReadonlySet<string>;
  /** Change for the implicit primary document, or `null` when unchanged. */
  readonly primary: ChangeSet | null;
  /** Derived classification for the primary change. */
  readonly primaryClassification: DocumentChangeRootClassification | null;
  /** Derived classifications keyed only by named roots. */
  readonly rootClassifications: ReadonlyMap<
    string,
    DocumentChangeRootClassification
  >;
  /** Changes keyed only by named secondary roots. */
  readonly roots: ReadonlyMap<string, ChangeSet>;

  constructor(input: DocumentChangeInput = {}) {
    for (const root of input.roots?.keys() ?? []) {
      assertNamedDocumentRootKey(root);
    }

    this.primary = input.primary?.empty ? null : (input.primary ?? null);
    this.roots = freezeReadonlyMap(
      [...(input.roots ?? [])].filter(([, change]) => !change.empty)
    );
    this.primaryClassification =
      this.primary && input.primaryClassification
        ? freezeRootClassification('primary', input.primaryClassification)
        : null;
    this.rootClassifications = freezeReadonlyMap(
      [...(input.rootClassifications ?? [])]
        .map(([root, classification]) => {
          assertNamedDocumentRootKey(root);

          return [root, classification] as const;
        })
        .filter(([root]) => this.roots.has(root))
        .map(([root, classification]) => [
          root,
          freezeRootClassification(root, classification),
        ])
    );
    this.createRoots = freezeReadonlySet(input.createRoots ?? []);
    this.deleteRoots = freezeReadonlySet(input.deleteRoots ?? []);

    for (const root of this.createRoots) assertNamedDocumentRootKey(root);
    for (const root of this.deleteRoots) assertNamedDocumentRootKey(root);

    for (const root of this.createRoots) {
      if (this.deleteRoots.has(root)) {
        throw new Error(`Invalid created root ${root}.`);
      }
    }

    Object.freeze(this);
  }

  static between(
    before: JsonEditorValue,
    after: JsonEditorValue,
    options: Readonly<{
      isSetValued?: DocumentSetPropertyResolver;
    }> = {}
  ) {
    const roots = new Set([
      'main',
      ...Object.keys(before.roots ?? {}),
      ...Object.keys(after.roots ?? {}),
    ]);
    const changes = new Map<string, ChangeSet>();
    const classifications = new Map<string, DocumentChangeRootClassification>();
    const createRoots = new Set<string>();
    const deleteRoots = new Set<string>();

    for (const root of roots) {
      const beforeDocument = IndexedDocument.fromValue(valueRoot(before, root));
      const afterDocument = IndexedDocument.fromValue(valueRoot(after, root));
      const change = ChangeSet.between(beforeDocument, afterDocument, {
        ...options,
        root: root === 'main' ? null : root,
      });

      if (!change.empty) {
        changes.set(root, change);
        classifications.set(
          root,
          classifyChangeSet(change, beforeDocument, afterDocument)
        );
      }

      if (
        root !== 'main' &&
        !Object.hasOwn(before.roots ?? {}, root) &&
        Object.hasOwn(after.roots ?? {}, root)
      ) {
        createRoots.add(root);
      }

      if (
        root !== 'main' &&
        Object.hasOwn(before.roots ?? {}, root) &&
        !Object.hasOwn(after.roots ?? {}, root)
      ) {
        deleteRoots.add(root);
      }
    }

    return createInternalDocumentChange(changes, {
      classifications,
      createRoots,
      deleteRoots,
    });
  }

  get empty() {
    return (
      this.primary === null &&
      this.roots.size === 0 &&
      this.createRoots.size === 0 &&
      this.deleteRoots.size === 0
    );
  }

  /** Validate a document change without relying on constructor identity. */
  static isDocumentChange(value: unknown): value is DocumentChange {
    try {
      if (
        !isRecord(value) ||
        typeof value.empty !== 'boolean' ||
        Object.hasOwn(value, 'changes') ||
        Object.hasOwn(value, 'classifications') ||
        Object.hasOwn(value, 'preserveEmptyRoots') ||
        !hasFunctions(value, [
          'apply',
          'compose',
          'correct',
          'invert',
          'iterChangedRanges',
          'mapPosition',
          'toJSON',
        ])
      ) {
        return false;
      }

      const primary =
        value.primary === null
          ? null
          : readCanonicalChangeSetJson(value.primary);
      const roots = readStructuralMap(value.roots);
      const primaryClassification = value.primaryClassification;
      const rootClassifications = readStructuralMap(value.rootClassifications);
      const createRoots = readStructuralSet(value.createRoots);
      const deleteRoots = readStructuralSet(value.deleteRoots);

      if (
        (value.primary !== null && !primary) ||
        !roots ||
        !rootClassifications ||
        !createRoots ||
        !deleteRoots
      ) {
        return false;
      }

      const changeRoots = new Set<string>();
      const encodedChanges: Array<readonly [string, ChangeSetJson]> = [];

      for (const [root, rootChange] of roots) {
        assertNamedDocumentRootKey(root);

        if (changeRoots.has(root)) return false;

        const encoded = readCanonicalChangeSetJson(rootChange);

        if (!encoded) return false;

        changeRoots.add(root);
        encodedChanges.push([root, encoded]);
      }

      if (primaryClassification !== null) {
        if (!primary || !isRecord(primaryClassification)) return false;

        const canonical = freezeRootClassification(
          'primary',
          primaryClassification as DocumentChangeRootClassification
        );

        if (!jsonEqual(primaryClassification, canonical)) return false;
      }

      const classificationRoots = new Set<string>();

      for (const [root, classification] of rootClassifications) {
        assertNamedDocumentRootKey(root);

        if (
          classificationRoots.has(root) ||
          !changeRoots.has(root) ||
          !isRecord(classification)
        ) {
          return false;
        }

        const canonical = freezeRootClassification(
          root,
          classification as DocumentChangeRootClassification
        );

        if (!jsonEqual(classification, canonical)) return false;

        classificationRoots.add(root);
      }

      const readLifecycleRoots = (roots: readonly unknown[]) => {
        const result: string[] = [];
        const seen = new Set<string>();

        for (const root of roots) {
          assertNamedDocumentRootKey(root);

          if (seen.has(root)) return null;

          seen.add(root);
          result.push(root);
        }

        return result;
      };

      const created = readLifecycleRoots(createRoots);
      const deleted = readLifecycleRoots(deleteRoots);

      if (!created || !deleted) return false;

      const collectionJson: DocumentChangeJson = {
        ...(primary ? { primary } : {}),
        ...(encodedChanges.length > 0
          ? { roots: Object.fromEntries(encodedChanges) }
          : {}),
        ...(created.length > 0 ? { createRoots: created } : {}),
        ...(deleted.length > 0 ? { deleteRoots: deleted } : {}),
        version: 3,
      };
      const decoded = DocumentChange.fromJSON(collectionJson);
      const canonical = decoded.toJSON();
      const advertised = Reflect.apply(
        value.toJSON as () => unknown,
        value,
        []
      );
      const advertisedCanonical = DocumentChange.fromJSON(
        advertised as DocumentChangeJson
      ).toJSON();

      return (
        jsonEqual(collectionJson, canonical) &&
        jsonEqual(advertised, advertisedCanonical) &&
        jsonEqual(advertisedCanonical, canonical) &&
        decoded.empty === value.empty
      );
    } catch {
      return false;
    }
  }

  static fromJSON(json: DocumentChangeJson) {
    assertEditorJsonValue(json, 'DocumentChange JSON');

    if (
      !isRecord(json) ||
      json.version !== 3 ||
      !Object.keys(json).every((key) =>
        ['createRoots', 'deleteRoots', 'primary', 'roots', 'version'].includes(
          key
        )
      ) ||
      (json.roots !== undefined && !isRecord(json.roots))
    ) {
      throw new Error('Invalid DocumentChange JSON.');
    }
    if (
      (json.createRoots !== undefined &&
        (!Array.isArray(json.createRoots) ||
          !json.createRoots.every((root) => typeof root === 'string'))) ||
      (json.deleteRoots !== undefined &&
        (!Array.isArray(json.deleteRoots) ||
          !json.deleteRoots.every((root) => typeof root === 'string'))) ||
      (json.primary !== undefined && !Array.isArray(json.primary))
    ) {
      throw new Error('Invalid DocumentChange JSON.');
    }

    return new DocumentChange({
      createRoots: json.createRoots,
      deleteRoots: json.deleteRoots,
      primary:
        json.primary === undefined ? null : ChangeSet.fromJSON(json.primary),
      roots: new Map(
        Object.entries(json.roots ?? {}).map(([root, change]) => {
          assertNamedDocumentRootKey(root);

          return [root, ChangeSet.fromJSON(change)] as const;
        })
      ),
    });
  }

  /**
   * Rebase two changes from the same value for pairwise convergence.
   * Multi-peer ordering belongs to a collaboration adapter such as Yjs.
   */
  static transform(
    a: DocumentChange,
    b: DocumentChange,
    value: JsonEditorValue
  ) {
    const roots = new Set([
      ...[...getInternalDocumentChangeEntries(a)].map(([root]) => root),
      ...[...getInternalDocumentChangeEntries(b)].map(([root]) => root),
    ]);
    const aChanges = new Map<string, ChangeSet>();
    const bChanges = new Map<string, ChangeSet>();

    for (const root of roots) {
      const aChange = getInternalDocumentChangeSet(a, root);
      const bChange = getInternalDocumentChangeSet(b, root);

      if (aChange && bChange) {
        const document = IndexedDocument.fromValue(valueRoot(value, root));
        const transformed = ChangeSet.transformInDocument(
          aChange,
          bChange,
          document
        );

        if (!transformed.a.empty) aChanges.set(root, transformed.a);
        if (!transformed.b.empty) bChanges.set(root, transformed.b);
      } else if (aChange) {
        aChanges.set(root, aChange);
      } else if (bChange) {
        bChanges.set(root, bChange);
      }
    }

    const lifecycleRoots = new Set([
      ...a.createRoots,
      ...a.deleteRoots,
      ...b.createRoots,
      ...b.deleteRoots,
    ]);

    for (const root of lifecycleRoots) {
      const aTouches =
        a.createRoots.has(root) ||
        a.deleteRoots.has(root) ||
        !!getInternalDocumentChangeSet(a, root);
      const bTouches =
        b.createRoots.has(root) ||
        b.deleteRoots.has(root) ||
        !!getInternalDocumentChangeSet(b, root);

      if (aTouches && bTouches) {
        throw new Error(
          `Cannot transform concurrent root lifecycle changes for ${root}.`
        );
      }
    }

    return {
      a: createInternalDocumentChange(aChanges, {
        createRoots: a.createRoots,
        deleteRoots: a.deleteRoots,
      }),
      b: createInternalDocumentChange(bChanges, {
        createRoots: b.createRoots,
        deleteRoots: b.deleteRoots,
      }),
    };
  }

  /**
   * Compose sequential changes. Overlapping root lifecycle transitions require
   * the source value because deleting a root discards content that no
   * value-free change algebra can recover.
   */
  compose(other: DocumentChange, value?: JsonEditorValue) {
    const thisTouchedRoots = new Set([
      ...[...getInternalDocumentChangeEntries(this)].map(([root]) => root),
      ...this.createRoots,
      ...this.deleteRoots,
    ]);
    const otherTouchedRoots = new Set([
      ...[...getInternalDocumentChangeEntries(other)].map(([root]) => root),
      ...other.createRoots,
      ...other.deleteRoots,
    ]);
    const overlappingLifecycleRoot = [...thisTouchedRoots].find(
      (root) =>
        otherTouchedRoots.has(root) &&
        (this.createRoots.has(root) ||
          this.deleteRoots.has(root) ||
          other.createRoots.has(root) ||
          other.deleteRoots.has(root))
    );

    if (overlappingLifecycleRoot) {
      if (!value) {
        throw new Error(
          `Composing overlapping lifecycle changes for root ${overlappingLifecycleRoot} requires the source value.`
        );
      }

      return DocumentChange.between(value, other.apply(this.apply(value)));
    }

    const roots = new Set([
      ...[...getInternalDocumentChangeEntries(this)].map(([root]) => root),
      ...[...getInternalDocumentChangeEntries(other)].map(([root]) => root),
    ]);
    const changes = new Map<string, ChangeSet>();
    const classifications = new Map<string, DocumentChangeRootClassification>();

    for (const root of roots) {
      const first = getInternalDocumentChangeSet(this, root);
      const second = getInternalDocumentChangeSet(other, root);
      const change =
        first && second ? first.compose(second) : (first ?? second);

      if (change && !change.empty) {
        changes.set(root, change);
        const classification = first
          ? second
            ? undefined
            : getInternalDocumentChangeClassification(this, root)
          : getInternalDocumentChangeClassification(other, root);

        // Paths from two changes use different document coordinates. Keep a
        // classification only when this root comes from one side unchanged;
        // consumers can derive exact final-coordinate ranges from the composed
        // ChangeSet or classify once against the transaction snapshots.
        if (classification) classifications.set(root, classification);
      }
    }

    const createRoots = new Set([...this.createRoots, ...other.createRoots]);
    const deleteRoots = new Set([...this.deleteRoots, ...other.deleteRoots]);

    return createInternalDocumentChange(changes, {
      classifications,
      createRoots,
      deleteRoots,
    });
  }

  /** Compose one transaction-wide structural correction into this change. */
  correct(value: JsonEditorValue, correction: DocumentCorrection) {
    const applied = this.apply(value);
    const changedRanges: DocumentChangedRange[] = [];

    this.iterChangedRanges((root, fromBefore, toBefore, fromAfter, toAfter) => {
      changedRanges.push({
        fromAfter,
        fromBefore,
        root,
        toAfter,
        toBefore,
      });
    });

    const corrected = correction(applied, Object.freeze(changedRanges));
    const correctionChange = DocumentChange.between(applied, corrected);

    return correctionChange.empty
      ? this
      : this.compose(correctionChange, value);
  }

  iterChangedRanges(
    visit: (
      root: string | null,
      fromA: number,
      toA: number,
      fromB: number,
      toB: number
    ) => void
  ) {
    for (const [root, change] of getInternalDocumentChangeEntries(this)) {
      change.iterChangedRanges((...range) =>
        visit(root === 'main' ? null : root, ...range)
      );
    }
  }

  mapPosition<TRoot extends string = string>(
    position: number,
    options: DocumentChangeMapPositionOptions<TRoot> = {}
  ) {
    if (options.root !== undefined) {
      assertNamedDocumentRootKey(options.root);
    }
    const root = options.root ?? 'main';

    if (this.deleteRoots.has(root)) return null;

    const change = getInternalDocumentChangeSet(this, root);
    const association = options.association === 'forward' ? 1 : -1;

    return change
      ? change.mapPos(position, association, options.track)
      : position;
  }

  apply<T extends JsonEditorValue>(value: T): T {
    return deepFreeze(applyDocumentChangeValue(this, value));
  }

  invert(value: JsonEditorValue) {
    const deleteRoots = new Set([
      ...this.createRoots,
      ...[...getInternalDocumentChangeEntries(this)]
        .map(([root]) => root)
        .filter(
          (root) => root !== 'main' && !Object.hasOwn(value.roots ?? {}, root)
        ),
    ]);
    const createRoots = [...this.deleteRoots].filter((root) =>
      Object.hasOwn(value.roots ?? {}, root)
    );

    const changes = new Map(
      [...getInternalDocumentChangeEntries(this)].map(([root, change]) => {
        const document = IndexedDocument.fromValue(valueRoot(value, root));

        return [root, change.invert(document)] as const;
      })
    );

    for (const root of createRoots) {
      const before = IndexedDocument.fromValue([]);
      const restored = IndexedDocument.fromValue(valueRoot(value, root));
      const restore = ChangeSet.between(before, restored);

      if (restore.empty) changes.delete(root);
      else changes.set(root, restore);
    }

    return createInternalDocumentChange(changes, {
      classifications: new Map(
        [...changes.keys()].flatMap((root) => {
          const classification = getInternalDocumentChangeClassification(
            this,
            root
          );

          return classification ? [[root, classification] as const] : [];
        })
      ),
      createRoots,
      deleteRoots,
    });
  }

  toJSON(): DocumentChangeJson {
    return {
      ...(this.primary ? { primary: this.primary.toJSON() } : {}),
      ...(this.roots.size > 0
        ? {
            roots: Object.fromEntries(
              [...this.roots].map(([root, change]) => [root, change.toJSON()])
            ),
          }
        : {}),
      ...(this.createRoots.size > 0
        ? { createRoots: [...this.createRoots] }
        : {}),
      ...(this.deleteRoots.size > 0
        ? { deleteRoots: [...this.deleteRoots] }
        : {}),
      version: 3,
    };
  }
}

export type DocumentChangeRelocation = Readonly<{
  path: readonly number[];
  /** `null` addresses the implicit primary root. */
  root: string | null;
  targetPath: readonly number[];
}>;

/** @internal Read exact canonical moves without reconstructing the after value. */
export const getExactDocumentChangeRelocations = (
  change: DocumentChange,
  before: JsonEditorValue
): readonly DocumentChangeRelocation[] =>
  Object.freeze(
    [...getInternalDocumentChangeEntries(change)].flatMap(
      ([root, rootChange]) => {
        const exact = rootChange.movedNode(
          IndexedDocument.fromValue(valueRoot(before, root))
        );

        return exact
          ? [
              Object.freeze({
                path: exact.path,
                root: root === 'main' ? null : root,
                targetPath: exact.targetPath,
              }),
            ]
          : [];
      }
    )
  );

type RelocationCandidate = Readonly<{
  node: JsonNode;
  path: readonly number[];
}>;

type RelocationCandidateGroup = {
  candidates: RelocationCandidate[];
  node: JsonNode;
};

type StructuralFingerprint = Readonly<{
  hash: number;
  size: number;
}>;

const mixStructuralFingerprint = (hash: number, value: number) =>
  Math.imul(hash ^ value, 0x01_00_01_93) >>> 0;

const mixStructuralFingerprintString = (hash: number, value: string) => {
  let next = mixStructuralFingerprint(hash, value.length);

  for (let index = 0; index < value.length; index++) {
    next = mixStructuralFingerprint(next, value.charCodeAt(index));
  }

  return next;
};

const getStructuralFingerprint = (
  value: unknown,
  cache: WeakMap<object, StructuralFingerprint>
): StructuralFingerprint => {
  if (value !== null && typeof value === 'object') {
    const cached = cache.get(value);

    if (cached) return cached;

    let hash = mixStructuralFingerprint(0x81_1c_9d_c5, 5);
    let size = 1;

    if (Array.isArray(value)) {
      hash = mixStructuralFingerprint(hash, 6);
      hash = mixStructuralFingerprint(hash, value.length);

      for (const item of value) {
        const child = getStructuralFingerprint(item, cache);

        hash = mixStructuralFingerprint(hash, child.hash);
        hash = mixStructuralFingerprint(hash, child.size);
        size += child.size;
      }
    } else {
      const record = value as JsonRecord;
      const keys = Object.keys(record).sort();

      hash = mixStructuralFingerprint(hash, 7);
      hash = mixStructuralFingerprint(hash, keys.length);

      for (const key of keys) {
        hash = mixStructuralFingerprintString(hash, key);

        const child = getStructuralFingerprint(record[key], cache);

        hash = mixStructuralFingerprint(hash, child.hash);
        hash = mixStructuralFingerprint(hash, child.size);
        size += child.size;
      }
    }

    const fingerprint = Object.freeze({ hash, size });

    cache.set(value, fingerprint);

    return fingerprint;
  }

  const type = typeof value;
  let hash = mixStructuralFingerprint(0x81_1c_9d_c5, 1);

  hash = mixStructuralFingerprintString(hash, type);
  hash = mixStructuralFingerprintString(
    hash,
    typeof value === 'number' && Object.is(value, -0) ? '-0' : String(value)
  );

  return Object.freeze({ hash, size: 1 });
};

const groupRelocationCandidates = (
  candidates: readonly RelocationCandidate[],
  fingerprintCache: WeakMap<object, StructuralFingerprint>
) => {
  const buckets = new Map<string, RelocationCandidateGroup[]>();

  for (const candidate of candidates) {
    const fingerprint = getStructuralFingerprint(
      candidate.node,
      fingerprintCache
    );
    const key = `${fingerprint.hash}:${fingerprint.size}`;
    const groups = buckets.get(key) ?? [];
    const group = groups.find((entry) => jsonEqual(entry.node, candidate.node));

    if (group) {
      group.candidates.push(candidate);
    } else {
      groups.push({ candidates: [candidate], node: candidate.node });
      buckets.set(key, groups);
    }
  }

  return buckets;
};

const compareRelocationPaths = (
  left: readonly number[],
  right: readonly number[]
) => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index]! - right[index]!;

    if (difference !== 0) return difference;
  }

  return left.length - right.length;
};

const collectRelocationCandidates = (
  document: IndexedDocument,
  ranges: readonly (readonly [number, number])[]
) => {
  const candidates = new Map<string, RelocationCandidate>();

  for (const [from, to] of ranges) {
    for (const range of document.nodeRangesTouching(from, to)) {
      const key = pathKey(range.path);

      if (candidates.has(key)) continue;

      candidates.set(
        key,
        Object.freeze({
          node: document.node(range.path),
          path: range.path,
        })
      );
    }
  }

  return [...candidates.values()];
};

const hasIndexedPathAncestor = (
  paths: ReadonlySet<string>,
  path: readonly number[]
) => {
  for (let depth = 1; depth < path.length; depth++) {
    if (paths.has(pathKey(path.slice(0, depth)))) return true;
  }

  return false;
};

const deriveRootRelocations = (
  root: string,
  change: ChangeSet,
  before: IndexedDocument,
  after: IndexedDocument = change.apply(before)
): readonly DocumentChangeRelocation[] => {
  const exactMove = change.movedNode(before);

  if (exactMove) {
    return Object.freeze([
      Object.freeze({
        path: exactMove.path,
        root: root === 'main' ? null : root,
        targetPath: exactMove.targetPath,
      }),
    ]);
  }

  const beforeRanges: Array<readonly [number, number]> = [];
  const afterRanges: Array<readonly [number, number]> = [];

  change.iterChangedRanges((fromA, toA, fromB, toB) => {
    beforeRanges.push([fromA, toA]);
    afterRanges.push([fromB, toB]);
  });

  const beforeCandidates = collectRelocationCandidates(before, beforeRanges);
  const afterCandidates = collectRelocationCandidates(after, afterRanges);
  const fingerprintCache = new WeakMap<object, StructuralFingerprint>();
  const beforeBuckets = groupRelocationCandidates(
    beforeCandidates,
    fingerprintCache
  );
  const afterBuckets = groupRelocationCandidates(
    afterCandidates,
    fingerprintCache
  );
  const candidates: DocumentChangeRelocation[] = [];

  for (const [key, sourceGroups] of beforeBuckets) {
    const targetGroups = afterBuckets.get(key);

    if (!targetGroups) continue;

    for (const sourceGroup of sourceGroups) {
      if (sourceGroup.candidates.length !== 1) continue;

      const targetGroup = targetGroups.find((group) =>
        jsonEqual(sourceGroup.node, group.node)
      );

      if (!targetGroup || targetGroup.candidates.length !== 1) continue;

      const source = sourceGroup.candidates[0]!;
      const target = targetGroup.candidates[0]!;

      if (pathKey(source.path) === pathKey(target.path)) continue;

      candidates.push(
        Object.freeze({
          path: source.path,
          root: root === 'main' ? null : root,
          targetPath: target.path,
        })
      );
    }
  }

  candidates.sort(
    (left, right) =>
      left.path.length - right.path.length ||
      compareRelocationPaths(left.path, right.path)
  );

  const selected: DocumentChangeRelocation[] = [];
  const selectedSourcePaths = new Set<string>();
  const selectedTargetPaths = new Set<string>();

  for (const candidate of candidates) {
    if (
      hasIndexedPathAncestor(selectedSourcePaths, candidate.path) ||
      hasIndexedPathAncestor(selectedTargetPaths, candidate.targetPath)
    ) {
      continue;
    }

    selected.push(candidate);
    selectedSourcePaths.add(pathKey(candidate.path));
    selectedTargetPaths.add(pathKey(candidate.targetPath));
  }

  return Object.freeze(selected);
};

/** @internal Derive maximal stable subtree relocations for one root change. */
export const getChangeSetRelocations = (
  change: ChangeSet,
  before: IndexedDocument,
  after?: IndexedDocument
): readonly Readonly<{
  path: readonly number[];
  targetPath: readonly number[];
}>[] =>
  Object.freeze(
    deriveRootRelocations('main', change, before, after).map(
      ({ path, targetPath }) => Object.freeze({ path, targetPath })
    )
  );

/** @internal Derive maximal unique unchanged-subtree relocations. */
export const getDocumentChangeRelocations = (
  change: DocumentChange,
  before: JsonEditorValue
): readonly DocumentChangeRelocation[] =>
  Object.freeze(
    [...getInternalDocumentChangeEntries(change)].flatMap(
      ([root, rootChange]) =>
        deriveRootRelocations(
          root,
          rootChange,
          IndexedDocument.fromValue(valueRoot(before, root))
        )
    )
  );

const applyDocumentChangeValue = <T extends JsonEditorValue>(
  change: DocumentChange,
  value: T,
  indexedAfter: ReadonlyMap<string, IndexedDocument> = new Map()
) => {
  let children = value.children;
  let roots = value.roots ? { ...value.roots } : undefined;

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const next =
      indexedAfter.get(root)?.value ??
      rootChange.apply(IndexedDocument.fromValue(valueRoot(value, root))).value;

    if (root === 'main') {
      children = next;
    } else {
      roots ??= {};
      roots[root] = next;
    }
  }

  for (const root of change.createRoots) {
    roots ??= {};
    roots[root] ??= Object.freeze([]);
  }

  for (const root of change.deleteRoots) {
    if (roots) delete roots[root];
  }

  if (roots && Object.keys(roots).length === 0) {
    roots = undefined;
  }

  const { roots: _roots, ...valueWithoutRoots } = value;
  const nextValue =
    roots === undefined
      ? { ...valueWithoutRoots, children }
      : { ...value, children, roots };

  return nextValue as T;
};

/** @internal Apply a change whose indexed results are already immutable. */
export const applyDocumentChangeWithIndexes = <T extends JsonEditorValue>(
  change: DocumentChange,
  value: T,
  indexedAfter: ReadonlyMap<string, IndexedDocument>
): T => {
  const nextValue = applyDocumentChangeValue(change, value, indexedAfter);

  if (nextValue.roots) Object.freeze(nextValue.roots);

  return Object.freeze(nextValue);
};

export type DocumentChangeStep = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
  indexedAfter: ReadonlyMap<string, IndexedDocument>;
  indexedBefore: ReadonlyMap<string, IndexedDocument>;
  /** @internal Final nodes collected during classification, before publication. */
  runtimeCandidates: ReadonlyMap<
    string,
    readonly DocumentChangeRuntimeCandidate[]
  >;
}>;

export type DocumentChangeConstructionPolicy = (
  input: Readonly<{
    after: JsonEditorValue;
    before: JsonEditorValue;
    change: DocumentChange;
  }>,
  preparation?: object
) => DocumentChange;

type PreparedDocumentChange = Readonly<{
  after: JsonEditorValue;
  authority: object;
  before: JsonEditorValue;
  canonical: boolean;
  change: DocumentChange;
  indexedAfter: ReadonlyMap<string, IndexedDocument>;
  indexedBefore: ReadonlyMap<string, IndexedDocument>;
  indexes: ReadonlyMap<string, IndexedDocument>;
  revision?: object;
  runtimeCandidates: ReadonlyMap<
    string,
    readonly DocumentChangeRuntimeCandidate[]
  >;
}>;

const PREPARED_DOCUMENT_CHANGES = new WeakMap<object, PreparedDocumentChange>();

/** Builds and applies canonical document steps against one immutable draft. */
export class DocumentChangeBuilder {
  private accumulated: DocumentChange;
  private readonly assertCanonical?: (
    value: JsonEditorValue,
    change: DocumentChange
  ) => void;
  private canonical = true;
  private validationPending = false;
  private readonly construct?: DocumentChangeConstructionPolicy;
  private current: JsonEditorValue;
  private readonly indexes = new Map<string, IndexedDocument>();
  private readonly isSetValued: DocumentSetPropertyResolver;
  private readonly indexConstructedRoot?: (
    input: Readonly<{
      after: IndexedDocument;
      before: IndexedDocument;
      change?: ChangeSet;
      root: string;
    }>
  ) => void;
  private readonly preparationRevision?: () => object;
  private readonly source: JsonEditorValue;
  private readonly sourceIndexes = new Map<string, IndexedDocument>();
  private readonly preparationAuthority: object;
  private readonly runtimeCandidatesByChange = new WeakMap<
    DocumentChange,
    ReadonlyMap<string, readonly DocumentChangeRuntimeCandidate[]>
  >();
  private readonly validate?: (
    value: JsonEditorValue,
    change: DocumentChange
  ) => void;
  private readonly validateConstructed?: (
    input: Readonly<{
      after: JsonEditorValue;
      before: JsonEditorValue;
      change: DocumentChange;
      indexedAfter: ReadonlyMap<string, IndexedDocument>;
      indexedBefore: ReadonlyMap<string, IndexedDocument>;
    }>
  ) => void;

  constructor(
    value: JsonEditorValue,
    options: Readonly<{
      assertCanonical?: (
        value: JsonEditorValue,
        change: DocumentChange
      ) => void;
      construct?: DocumentChangeConstructionPolicy;
      indexConstructedRoot?: (
        input: Readonly<{
          after: IndexedDocument;
          before: IndexedDocument;
          change?: ChangeSet;
          root: string;
        }>
      ) => void;
      isSetValued?: DocumentSetPropertyResolver;
      preparationAuthority?: object;
      preparationRevision?: () => object;
      validate?: (value: JsonEditorValue, change: DocumentChange) => void;
      validateConstructed?: (
        input: Readonly<{
          after: JsonEditorValue;
          before: JsonEditorValue;
          change: DocumentChange;
          indexedAfter: ReadonlyMap<string, IndexedDocument>;
          indexedBefore: ReadonlyMap<string, IndexedDocument>;
        }>
      ) => void;
    }> = {}
  ) {
    this.source = value;
    this.current = value;
    this.assertCanonical = options.assertCanonical;
    this.construct = options.construct;
    this.indexConstructedRoot = options.indexConstructedRoot;
    this.isSetValued = options.isSetValued ?? (() => false);
    this.preparationAuthority =
      options.preparationAuthority ?? Object.freeze({});
    this.preparationRevision = options.preparationRevision;
    this.validate = options.validate;
    this.validateConstructed = options.validateConstructed;
    this.accumulated = new DocumentChange();
  }

  get change() {
    return this.accumulated;
  }

  get value() {
    return this.current;
  }

  /** @internal Reuse the builder's canonical indexes for publication. */
  indexedAfter(change: DocumentChange = this.accumulated) {
    const result = new Map<string, IndexedDocument>();

    for (const [root] of getInternalDocumentChangeEntries(change)) {
      if (!change.deleteRoots.has(root)) result.set(root, this.getIndex(root));
    }
    for (const root of change.createRoots) {
      result.set(root, this.getIndex(root));
    }

    return result;
  }

  /** @internal Fork the current draft while sharing its immutable indexes. */
  fork(options: Readonly<{ validation?: 'defer-to-parent' | 'inherit' }> = {}) {
    const fork = new DocumentChangeBuilder(this.current, {
      assertCanonical: this.assertCanonical,
      construct: this.construct,
      indexConstructedRoot: this.indexConstructedRoot,
      isSetValued: this.isSetValued,
      preparationAuthority: this.preparationAuthority,
      preparationRevision: this.preparationRevision,
      ...(options.validation === 'defer-to-parent'
        ? {}
        : {
            validate: this.validate,
            validateConstructed: this.validateConstructed,
          }),
    });

    for (const [root, index] of this.indexes) {
      fork.indexes.set(root, index);
      fork.sourceIndexes.set(root, index);
    }
    fork.canonical = this.canonical;
    fork.validationPending = this.validationPending;
    return fork;
  }

  /** @internal Require the parent transaction to validate an adopted canonical draft. */
  requireValidation() {
    if (!this.accumulated.empty) this.validationPending = true;
  }

  /** @internal Capture the finalized draft behind an opaque token. */
  prepare(
    change: DocumentChange = this.classify(),
    options: Readonly<{ classify?: boolean }> = {}
  ): object {
    if (!this.canonical) {
      throw new Error('Cannot prepare a non-canonical document draft.');
    }
    const classifiedChange =
      options.classify === false ? change : this.classify(change);
    const indexedAfter = new Map<string, IndexedDocument>();
    const indexedBefore = new Map<string, IndexedDocument>();

    for (const [root] of getInternalDocumentChangeEntries(classifiedChange)) {
      indexedBefore.set(root, this.getSourceIndex(root));
      indexedAfter.set(
        root,
        classifiedChange.deleteRoots.has(root)
          ? IndexedDocument.fromValue([])
          : this.getIndex(root)
      );
    }

    const token = Object.freeze({});

    PREPARED_DOCUMENT_CHANGES.set(
      token,
      Object.freeze({
        after: this.current,
        authority: this.preparationAuthority,
        before: this.source,
        canonical: this.canonical,
        change: classifiedChange,
        indexedAfter,
        indexedBefore,
        indexes: new Map(this.indexes),
        revision: this.preparationRevision?.(),
        runtimeCandidates:
          this.runtimeCandidatesByChange.get(classifiedChange) ?? new Map(),
      })
    );

    return token;
  }

  /** @internal Adopt a trusted prepared fork without replaying its changes. */
  adopt(prepared: object): DocumentChangeStep | null {
    const payload = PREPARED_DOCUMENT_CHANGES.get(prepared);

    if (
      !payload ||
      payload.authority !== this.preparationAuthority ||
      payload.before !== this.current ||
      !payload.canonical ||
      payload.revision !== this.preparationRevision?.()
    ) {
      return null;
    }

    const before = this.current;
    const accumulated = this.accumulated.empty
      ? payload.change
      : this.accumulated.compose(payload.change, this.source);

    for (const [root, index] of payload.indexes) {
      this.indexes.set(root, index);
    }
    for (const root of payload.change.deleteRoots) {
      this.indexes.delete(root);
    }

    this.accumulated = accumulated;
    if (accumulated === payload.change) {
      this.runtimeCandidatesByChange.set(
        accumulated,
        payload.runtimeCandidates
      );
    }
    this.canonical = true;
    this.current = payload.after;

    return Object.freeze({
      after: payload.after,
      before,
      change: payload.change,
      indexedAfter: payload.indexedAfter,
      indexedBefore: payload.indexedBefore,
      runtimeCandidates: payload.runtimeCandidates,
    });
  }

  /** Classify a transaction-wide change against cached source/current indexes. */
  classify(change: DocumentChange = this.accumulated) {
    const cachedRuntimeCandidates = this.runtimeCandidatesByChange.get(change);
    const alreadyClassified = [
      ...getInternalDocumentChangeEntries(change),
    ].every(([root]) => getInternalDocumentChangeClassification(change, root));

    if (cachedRuntimeCandidates && alreadyClassified) return change;

    const classifications = new Map<string, DocumentChangeRootClassification>();
    const runtimeCandidates = new Map<
      string,
      readonly DocumentChangeRuntimeCandidate[]
    >();

    for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
      const classified = classifyChangeSetWithRuntimeCandidates(
        rootChange,
        this.getSourceIndex(root),
        this.getIndex(root)
      );

      classifications.set(root, classified.classification);
      runtimeCandidates.set(root, classified.runtimeCandidates);
    }

    const classifiedChange = createInternalDocumentChange(
      new Map(getInternalDocumentChangeEntries(change)),
      {
        classifications,
        createRoots: change.createRoots,
        deleteRoots: change.deleteRoots,
      }
    );

    this.runtimeCandidatesByChange.set(
      classifiedChange,
      freezeReadonlyMap(runtimeCandidates)
    );

    return classifiedChange;
  }

  apply(
    change: DocumentChange,
    options: Readonly<{ classify?: boolean }> = {}
  ): DocumentChangeStep {
    const before = this.current;
    const classifications = new Map<string, DocumentChangeRootClassification>();
    const indexedAfter = new Map<string, IndexedDocument>();
    const indexedBefore = new Map<string, IndexedDocument>();
    const runtimeCandidates = new Map<
      string,
      readonly DocumentChangeRuntimeCandidate[]
    >();

    for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
      const beforeRoot = this.getIndex(root);
      const after = rootChange.apply(beforeRoot);

      this.indexConstructedRoot?.({
        after,
        before: beforeRoot,
        change: rootChange,
        root,
      });

      if (options.classify !== false) {
        const classified = classifyChangeSetWithRuntimeCandidates(
          rootChange,
          beforeRoot,
          after
        );

        classifications.set(root, classified.classification);
        runtimeCandidates.set(root, classified.runtimeCandidates);
      } else {
        runtimeCandidates.set(root, Object.freeze([]));
      }
      indexedBefore.set(root, beforeRoot);
      indexedAfter.set(root, after);
    }

    const classifiedChange = createInternalDocumentChange(
      new Map(getInternalDocumentChangeEntries(change)),
      {
        classifications,
        createRoots: change.createRoots,
        deleteRoots: change.deleteRoots,
      }
    );
    const frozenRuntimeCandidates = freezeReadonlyMap(runtimeCandidates);

    if (options.classify !== false) {
      this.runtimeCandidatesByChange.set(
        classifiedChange,
        frozenRuntimeCandidates
      );
    }

    const current = applyDocumentChangeWithIndexes(
      classifiedChange,
      this.current,
      indexedAfter
    );

    for (const [root, after] of indexedAfter) {
      this.indexes.set(root, after);
    }

    for (const root of change.createRoots) {
      if (!this.indexes.has(root)) {
        const after = IndexedDocument.fromValue(valueRoot(current, root));
        const beforeRoot = this.getSourceIndex(root);

        this.indexes.set(root, after);
        indexedAfter.set(root, after);
        indexedBefore.set(root, beforeRoot);
        this.indexConstructedRoot?.({ after, before: beforeRoot, root });
      }
    }
    for (const root of change.deleteRoots) {
      this.indexes.delete(root);
    }

    this.accumulated = this.accumulated.empty
      ? classifiedChange
      : this.accumulated.compose(classifiedChange, this.source);
    this.canonical = false;
    this.current = current;

    return Object.freeze({
      after: current,
      before,
      change: classifiedChange,
      indexedAfter,
      indexedBefore,
      runtimeCandidates: frozenRuntimeCandidates,
    });
  }

  /** Apply an externally supplied change that must already be publishable. */
  applyCanonical(change: DocumentChange): DocumentChangeStep {
    if (!this.validate && !this.assertCanonical) {
      const step = this.apply(change);

      this.canonical = true;

      return step;
    }

    // Validate an isolated draft, then publish those exact indexed roots.
    // A rejected change must not mutate this builder or its owner indexes.
    const candidateBuilder = new DocumentChangeBuilder(this.current, {
      isSetValued: this.isSetValued,
    });
    const candidate = candidateBuilder.apply(change);
    const accumulated = this.accumulated.empty
      ? candidate.change
      : this.accumulated.compose(candidate.change, this.source);

    this.validate?.(candidate.after, accumulated);
    this.assertCanonical?.(candidate.after, accumulated);

    return this.applyTrustedCanonical(candidate.change, {
      indexedAfter: candidate.indexedAfter,
      runtimeCandidates: candidate.runtimeCandidates,
    });
  }

  /**
   * @internal Apply a schema-fitted canonical change without revalidation.
   *
   * A fitter that already constructed the exact immutable target indexes may
   * supply them to avoid replaying the same change. Length and root lifecycle
   * checks still bind every supplied index to this builder's current draft.
   */
  applyTrustedCanonical(
    change: DocumentChange,
    options: Readonly<{
      indexedAfter?: ReadonlyMap<string, IndexedDocument>;
      runtimeCandidates?: ReadonlyMap<
        string,
        readonly DocumentChangeRuntimeCandidate[]
      >;
    }> = {}
  ): DocumentChangeStep {
    if (!options.indexedAfter) {
      const step = this.apply(change, { classify: false });

      this.runtimeCandidatesByChange.set(step.change, step.runtimeCandidates);
      this.canonical = true;

      return step;
    }

    const before = this.current;
    const indexedAfter = new Map<string, IndexedDocument>();
    const indexedBefore = new Map<string, IndexedDocument>();
    const runtimeCandidates = new Map<
      string,
      readonly DocumentChangeRuntimeCandidate[]
    >();
    const entries = new Map(getInternalDocumentChangeEntries(change));

    for (const [root, rootChange] of entries) {
      const beforeRoot = this.getIndex(root);
      const afterRoot = options.indexedAfter.get(root);

      if (change.deleteRoots.has(root)) {
        if (!afterRoot) {
          throw new Error(
            `Missing trusted indexed result for deleted root "${root}".`
          );
        }
        if (
          rootChange.length !== beforeRoot.length ||
          rootChange.newLength !== 0 ||
          afterRoot.length !== 0
        ) {
          throw new Error(
            `Trusted deletion for root "${root}" does not match change lengths.`
          );
        }

        indexedBefore.set(root, beforeRoot);
        indexedAfter.set(root, afterRoot);
        this.indexConstructedRoot?.({
          after: afterRoot,
          before: beforeRoot,
          change: rootChange,
          root,
        });
        runtimeCandidates.set(
          root,
          options.runtimeCandidates?.get(root) ?? Object.freeze([])
        );
        continue;
      }

      if (!afterRoot) {
        throw new Error(
          `Missing trusted indexed result for changed root "${root}".`
        );
      }
      if (
        rootChange.length !== beforeRoot.length ||
        rootChange.newLength !== afterRoot.length
      ) {
        throw new Error(
          `Trusted indexed result for root "${root}" does not match change lengths.`
        );
      }

      indexedBefore.set(root, beforeRoot);
      indexedAfter.set(root, afterRoot);
      this.indexConstructedRoot?.({
        after: afterRoot,
        before: beforeRoot,
        change: rootChange,
        root,
      });
      runtimeCandidates.set(
        root,
        options.runtimeCandidates?.get(root) ?? Object.freeze([])
      );
    }

    for (const root of change.createRoots) {
      if (root === 'main' || Object.hasOwn(this.current.roots ?? {}, root)) {
        throw new Error(`Cannot create editor root ${root}.`);
      }

      const rootChange = entries.get(root);
      const afterRoot =
        options.indexedAfter.get(root) ?? IndexedDocument.fromValue([]);

      if (
        (rootChange && rootChange.newLength !== afterRoot.length) ||
        (!rootChange && afterRoot.length !== 0)
      ) {
        throw new Error(
          `Trusted indexed result for created root "${root}" does not match its change.`
        );
      }

      indexedBefore.set(root, this.getSourceIndex(root));
      indexedAfter.set(root, afterRoot);
      this.indexConstructedRoot?.({
        after: afterRoot,
        before: this.getSourceIndex(root),
        change: rootChange,
        root,
      });
      runtimeCandidates.set(
        root,
        options.runtimeCandidates?.get(root) ?? Object.freeze([])
      );
    }

    for (const root of change.deleteRoots) {
      if (root === 'main' || !Object.hasOwn(this.current.roots ?? {}, root)) {
        throw new Error(`Cannot delete editor root ${root}.`);
      }
      indexedBefore.set(root, this.getIndex(root));
    }

    for (const root of options.indexedAfter.keys()) {
      if (!entries.has(root) && !change.createRoots.has(root)) {
        throw new Error(
          `Trusted indexed result targets unchanged root "${root}".`
        );
      }
    }

    const classifications = new Map<string, DocumentChangeRootClassification>();

    for (const [root] of entries) {
      const classification = getInternalDocumentChangeClassification(
        change,
        root
      );

      if (classification) classifications.set(root, classification);
    }

    const canonicalChange = createInternalDocumentChange(entries, {
      classifications,
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
    });
    const frozenRuntimeCandidates = freezeReadonlyMap(runtimeCandidates);
    const current = applyDocumentChangeWithIndexes(
      canonicalChange,
      this.current,
      indexedAfter
    );

    for (const [root, afterRoot] of indexedAfter) {
      this.indexes.set(root, afterRoot);
    }
    for (const root of change.deleteRoots) {
      this.indexes.delete(root);
    }

    this.accumulated = this.accumulated.empty
      ? canonicalChange
      : this.accumulated.compose(canonicalChange, this.source);
    this.runtimeCandidatesByChange.set(
      canonicalChange,
      frozenRuntimeCandidates
    );
    if (change !== canonicalChange) {
      this.runtimeCandidatesByChange.set(change, frozenRuntimeCandidates);
    }
    this.canonical = true;
    this.current = current;

    return Object.freeze({
      after: current,
      before,
      change: canonicalChange,
      indexedAfter,
      indexedBefore,
      runtimeCandidates: frozenRuntimeCandidates,
    });
  }

  /**
   * Construct and validate the canonical result of the accumulated draft.
   * Primitive edits may temporarily produce non-canonical structure; only the
   * transaction boundary is a publishable document.
   */
  finalize(
    preparation?: object,
    options: Readonly<{ classify?: boolean }> = {}
  ): DocumentChangeStep | null {
    if (this.canonical && !this.validationPending) return null;

    const before = this.current;
    const constructionChange = this.canonical
      ? undefined
      : this.construct?.(
          {
            after: before,
            before: this.source,
            change: this.accumulated,
          },
          preparation
        );
    const step =
      constructionChange && !constructionChange.empty
        ? this.apply(constructionChange, options)
        : null;

    if (this.accumulated.empty) {
      this.current = this.source;
      this.indexes.clear();
      for (const [root, index] of this.sourceIndexes) {
        this.indexes.set(root, index);
      }
      this.canonical = true;
      this.validationPending = false;

      if (!step) return null;
      const indexedAfter = new Map(step.indexedAfter);
      const runtimeCandidates = new Map<
        string,
        readonly DocumentChangeRuntimeCandidate[]
      >();

      for (const [root, rootChange] of getInternalDocumentChangeEntries(
        step.change
      )) {
        const sourceIndex = this.getSourceIndex(root);

        indexedAfter.set(root, sourceIndex);
        if (options.classify !== false) {
          runtimeCandidates.set(
            root,
            classifyChangeSetWithRuntimeCandidates(
              rootChange,
              step.indexedBefore.get(root)!,
              sourceIndex
            ).runtimeCandidates
          );
        }
      }

      return Object.freeze({
        ...step,
        after: this.source,
        indexedAfter,
        runtimeCandidates: freezeReadonlyMap(runtimeCandidates),
      });
    }

    if (this.validateConstructed) {
      const indexedAfter = new Map<string, IndexedDocument>();
      const indexedBefore = new Map<string, IndexedDocument>();

      const touchedRoots = new Set([
        ...[...getInternalDocumentChangeEntries(this.accumulated)].map(
          ([root]) => root
        ),
        ...this.accumulated.createRoots,
      ]);

      for (const root of touchedRoots) {
        if (!this.accumulated.deleteRoots.has(root)) {
          indexedAfter.set(root, this.getIndex(root));
        }
        indexedBefore.set(root, this.getSourceIndex(root));
      }
      this.validateConstructed({
        after: this.current,
        before: this.source,
        change: this.accumulated,
        indexedAfter,
        indexedBefore,
      });
    } else {
      this.validate?.(this.current, this.accumulated);
    }
    this.canonical = true;
    this.validationPending = false;

    return step;
  }

  createRoot(root: string, children: readonly JsonNode[]) {
    if (root === 'main' || Object.hasOwn(this.current.roots ?? {}, root)) {
      throw new Error(`Cannot create editor root ${root}.`);
    }

    const document = IndexedDocument.fromValue([]);
    const rootChange = replaceChildrenChange(document, [], 0, 0, children);

    return this.applyConstructed(
      createInternalDocumentChange(
        rootChange.empty ? new Map() : new Map([[root, rootChange]]),
        {
          createRoots: [root],
        }
      )
    );
  }

  deleteRoot(root: string) {
    if (root === 'main' || !Object.hasOwn(this.current.roots ?? {}, root)) {
      throw new Error(`Cannot delete editor root ${root}.`);
    }

    const document = this.getIndex(root);
    const rootChange = replaceChildrenChange(
      document,
      [],
      0,
      document.value.length,
      []
    );

    return this.applyConstructed(
      createInternalDocumentChange(
        rootChange.empty ? new Map() : new Map([[root, rootChange]]),
        {
          deleteRoots: [root],
        }
      )
    );
  }

  insertNode(root: string, path: readonly number[], node: JsonNode) {
    return this.applyRoot(
      root,
      insertNodeChange(this.getIndex(root), path, node)
    );
  }

  insertText(
    root: string,
    path: readonly number[],
    offset: number,
    text: string
  ) {
    return this.applyRoot(
      root,
      insertTextChange(this.getIndex(root), path, offset, text)
    );
  }

  mergeNode(root: string, path: readonly number[]) {
    return this.applyRoot(root, mergeNodeChange(this.getIndex(root), path));
  }

  moveNode(root: string, path: readonly number[], newPath: readonly number[]) {
    return this.applyRoot(
      root,
      moveNodeChange(this.getIndex(root), path, newPath)
    );
  }

  removeNode(root: string, path: readonly number[]) {
    return this.applyRoot(root, removeNodeChange(this.getIndex(root), path));
  }

  removeText(
    root: string,
    path: readonly number[],
    offset: number,
    text: string
  ) {
    const document = this.getIndex(root);
    const node = document.node(path);

    if (
      !isTextNode(node) ||
      node.text.slice(offset, offset + text.length) !== text
    ) {
      throw new Error(`Removed text does not match the draft at [${path}].`);
    }

    return this.applyRoot(root, removeTextChange(document, path, offset, text));
  }

  replaceChildren(
    root: string,
    path: readonly number[],
    index: number,
    removeCount: number,
    children: readonly JsonNode[]
  ) {
    return this.applyRoot(
      root,
      replaceChildrenChange(
        this.getIndex(root),
        path,
        index,
        removeCount,
        children
      )
    );
  }

  replaceRoot(root: string, children: readonly JsonNode[]) {
    if (root !== 'main' && !Object.hasOwn(this.current.roots ?? {}, root)) {
      throw new Error(`Cannot replace editor root ${root}.`);
    }

    const document = this.getIndex(root);

    return this.applyRoot(
      root,
      reconcileChildrenStep(document, [], 0, document.value.length, children)
        .change
    );
  }

  replaceSlice(
    root: string,
    from: JsonPoint,
    to: JsonPoint,
    insert: DocumentSlice
  ) {
    const document = this.getIndex(root);
    const fromPosition = document.positionAt(from);
    const toPosition = document.positionAt(to);

    if (toPosition < fromPosition) {
      throw new RangeError('A slice replacement range must be forward.');
    }

    return this.applyRoot(
      root,
      ChangeSet.create(document, {
        from: fromPosition,
        insert,
        to: toPosition,
      })
    );
  }

  setNode(
    root: string,
    path: readonly number[],
    newProperties: JsonRecord,
    properties: JsonRecord = {}
  ) {
    return this.applyRoot(
      root,
      setNodeChange(
        this.getIndex(root),
        path,
        newProperties,
        properties,
        this.isSetValued,
        root === 'main' ? null : root
      )
    );
  }

  splitNode(
    root: string,
    path: readonly number[],
    position: number,
    properties: JsonRecord
  ) {
    return this.applyRoot(
      root,
      splitNodeChange(this.getIndex(root), path, position, properties)
    );
  }

  private applyRoot(root: string, change: ChangeSet) {
    return this.applyConstructed(
      createInternalDocumentChange(
        change.empty ? new Map() : new Map([[root, change]])
      )
    );
  }

  private applyConstructed(change: DocumentChange): DocumentChangeStep {
    return this.apply(change);
  }

  private getIndex(root: string) {
    let document = this.indexes.get(root);

    if (!document) {
      document = IndexedDocument.fromValue(valueRoot(this.current, root));
      this.indexes.set(root, document);
    }

    return document;
  }

  private getSourceIndex(root: string) {
    let document = this.sourceIndexes.get(root);

    if (!document) {
      document = IndexedDocument.fromValue(valueRoot(this.source, root));
      this.sourceIndexes.set(root, document);
    }

    return document;
  }
}

export const classifyDocumentChange = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  change: DocumentChange
) => {
  const classifications = new Map(
    getInternalDocumentChangeClassificationEntries(change)
  );

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    classifications.set(
      root,
      classifyChangeSet(
        rootChange,
        IndexedDocument.fromValue(valueRoot(before, root)),
        IndexedDocument.fromValue(valueRoot(after, root))
      )
    );
  }

  return createInternalDocumentChange(
    new Map(getInternalDocumentChangeEntries(change)),
    {
      classifications,
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
    }
  );
};
