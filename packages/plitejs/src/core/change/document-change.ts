import type { NamedRootKey, NodeKey } from '../../interfaces/editor';
import { getDefined } from '../../internal/get-defined';
import { isImmutable } from '../clone';
import {
  applyRecordOps,
  composeRecordOps,
  filterRecordOps,
  getValueRecords,
  hasValueRecords,
  invertRecordOps,
  NO_RECORD_OPS,
  recordStoresEqual,
  type RecordOps,
  type RecordStore,
  recordOpsBetween,
  recordOpsFromJson,
  recordOpsToJson,
  showValueRecords,
  transformRecordOps,
  withValueRecords,
} from '../record-store';
import { assertEditorJsonValue } from '../value-codec';
import {
  classifyRootChange,
  type DocumentChangeRootClassification,
} from './classification';
import {
  DocumentIndex,
  type NodeList,
  rootIndexOf,
  rootNodesOf,
} from './document-index';
import { deepFreeze, isRecord, jsonEqual, type JsonRecord } from './json';
import {
  copyRoots,
  hasRootNames,
  lazyRootOf,
  visitRootNames,
  setLazyRoot,
} from './lazy-root';
import type { ReadBack } from './read-back';
import {
  getInternalDocumentChangeStepFirstAt,
  propagateRootStepFirstAt,
  withInternalDocumentChangeStepFirstAt,
  withRootChangeStepFirstAt,
} from './replay-step-order';
import {
  collapseElementPropertyWrites,
  type KeptWrap,
  RootChange,
  type RootChangeJson,
  type DocumentSetPropertyResolver,
  type SectionData,
  type TrackMode,
  invertiblePropertyNode,
} from './root-change';
import {
  isElementNode,
  type JsonEditorValue,
  type JsonNode,
  type JsonPoint,
} from './tokens';
import type { PropertyModification } from './transform';
import { applyV4RegisterSteps } from './v4/apply';
import { extractRegisterSteps, extractV4Between } from './v4/extract';
import { invertV4RegisterSteps, invertV4Steps } from './v4/invert';
import { lowerV4Steps } from './v4/lower';
import { rebaseV4Changes } from './v4/rebase';
import { rebaseV4JoinOverSiblingRemoval } from './v4/replay-join-over-remove';
import type { V4EscalationReason, V4StepOutcome } from './v4/text-ot';
import {
  assertV4Steps,
  countV4BuilderFallbackDiff,
  type DocumentChangeJson,
  V4_REGISTER_SET,
  type V4Place,
  type V4PropDelta,
  type V4RegisterStep,
  v4RootLifecycle,
  type V4Step,
} from './v4/types';

export type { DocumentChangeJson, V4Place, V4PropDelta, V4Step };

export type DocumentChangedRange = Readonly<{
  fromAfter: number;
  fromBefore: number;
  /** `null` addresses the implicit primary root. */
  root: string | null;
  toAfter: number;
  toBefore: number;
}>;

export type DocumentCorrection = (
  value: JsonEditorValue,
  changedRanges: readonly DocumentChangedRange[]
) => JsonEditorValue;

// Listed rather than read from Object.prototype, so a polyfill or a host
// flag such as --disable-proto cannot change which root names pass.
const unsafeDocumentRootKeys: ReadonlySet<string> = new Set([
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
  '__proto__',
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'prototype',
  'toLocaleString',
  'toString',
  'valueOf',
]);

const unsafeOwnKeyNames: ReadonlySet<string> = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

export const isDocumentRootKey = (root: string) =>
  root.length > 0 && !unsafeDocumentRootKeys.has(root);

export function assertDocumentRootKey(root: unknown): asserts root is string {
  if (typeof root !== 'string' || !isDocumentRootKey(root)) {
    throw new Error(`Invalid document root key ${String(root)}.`);
  }
}

function assertOwnKeyName(key: unknown): asserts key is string {
  if (
    typeof key !== 'string' ||
    key.length === 0 ||
    unsafeOwnKeyNames.has(key)
  ) {
    throw new Error(`Invalid document root key ${String(key)}.`);
  }
}

export function assertNamedDocumentRootKey(
  root: unknown
): asserts root is string {
  assertDocumentRootKey(root);

  if (root === 'main') {
    throw new Error('Omit root to target the primary document.');
  }
}

function assertDeletableRoot(root: string) {
  if (root === 'main') {
    throw new Error('Omit root to target the primary document.');
  }

  assertOwnKeyName(root);
}

export const hasFunctions = (
  value: Record<PropertyKey, unknown>,
  keys: readonly PropertyKey[]
) => keys.every((key) => typeof value[key] === 'function');

export const readStructuralCollection = (
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

export const callStructuralCollectionMethod = (
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

export const readStructuralMap = (
  value: unknown
): ReadonlyArray<readonly [unknown, unknown]> | null => {
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

export const readStructuralSet = (
  value: unknown
): readonly unknown[] | null => {
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

export const freezeReadonlyMap = <K, V>(
  entries: Iterable<readonly [K, V]>
): ReadonlyMap<K, V> => {
  const source = new Map(entries);
  Object.freeze(source);
  const view: ReadonlyMap<K, V> = new Proxy(source, {
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
        ) => {
          target.forEach((value, key) => {
            callback.call(thisArg, value, key, view);
          });
        };
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

export const freezeReadonlySet = <T>(values: Iterable<T>): ReadonlySet<T> => {
  const source = new Set(values);
  Object.freeze(source);
  const view: ReadonlySet<T> = new Proxy(source, {
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
        ) => {
          target.forEach((value) => {
            callback.call(thisArg, value, value, view);
          });
        };
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

export const freezeRootClassification = (
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

export const valueRoot = <T>(
  value: Readonly<{
    children: readonly T[];
    roots?: Readonly<Record<string, readonly T[]>>;
  }>,
  root: string
): readonly T[] =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

/** @internal */
export const valueRootIndex = (value: JsonEditorValue, root: string) =>
  root === 'main'
    ? rootIndexOf(value, 'children')
    : rootIndexOf(value.roots ?? {}, root);

/** @internal */
export const valueRootNodes = (
  value: JsonEditorValue,
  root: string
): NodeList =>
  root === 'main'
    ? rootNodesOf(value, 'children')
    : rootNodesOf(value.roots ?? {}, root);

const freezeAppliedRoot = (
  holder: Readonly<Record<string, unknown>>,
  key: string,
  source: Readonly<Record<string, unknown>> | undefined,
  beforeOf: () => DocumentIndex
) => {
  const index = lazyRootOf(holder, key);

  if (!index) {
    deepFreeze(holder[key]);

    return;
  }
  const input = source && !lazyRootOf(source, key) ? source[key] : undefined;

  if (Array.isArray(input) && isImmutable(input)) {
    index.nodes.forEach((node) => deepFreeze(node));

    return;
  }
  for (const range of index.changedChildren(beforeOf())) {
    for (let at = range[2]; at < range[3]; at += 1) {
      deepFreeze(index.child(at));
    }
  }
};

const setChildren = (
  target: Record<string, unknown>,
  children: DocumentIndex | readonly JsonNode[]
) => {
  if (children instanceof DocumentIndex) {
    setLazyRoot(target, 'children', children);
  } else {
    target.children = children;
  }
};

export const readCanonicalChangeSetJson = (
  value: unknown
): RootChangeJson | null => {
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
    assertEditorJsonValue(value.sections, 'RootChange sections');

    const json = Reflect.apply(
      value.toJSON as () => unknown,
      value,
      []
    ) as RootChangeJson;
    const decoded = RootChange.fromJSON(json);
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

type DocumentChangeInput = Readonly<{
  /** Named roots created by this change. */
  createRoots?: Iterable<string>;
  /** Named roots deleted by this change. */
  deleteRoots?: Iterable<string>;
  /** Change for the implicit primary document. */
  primary?: RootChange | null;
  /** Derived classification for the primary change. */
  primaryClassification?: DocumentChangeRootClassification | null;
  /** Record puts and drops, by record set. */
  records?: RecordOps;
  /** Derived classifications keyed only by named roots. */
  rootClassifications?: ReadonlyMap<string, DocumentChangeRootClassification>;
  /** Changes keyed only by named secondary roots. */
  roots?: ReadonlyMap<string, RootChange>;
}>;

type DocumentChangeRootState = Readonly<{
  primary: RootChange | null;
  records: RecordOps;
  roots: ReadonlyMap<string, RootChange>;
}>;

const DOCUMENT_CHANGE_ROOTS = new WeakMap<
  DocumentChange,
  DocumentChangeRootState
>();

const DOCUMENT_CHANGE_V4_STEPS = new WeakMap<
  DocumentChange,
  readonly V4Step[]
>();

const UNBOUND_V4_CHANGES = new WeakSet<DocumentChange>();

const DOCUMENT_CHANGE_LAZY_V4 = new WeakMap<
  DocumentChange,
  Readonly<{
    after: JsonEditorValue;
    before: JsonEditorValue;
    fromBuilder?: boolean;
    isSetValued?: DocumentSetPropertyResolver;
  }>
>();

const getDocumentChangeRootState = (change: DocumentChange) => {
  const state = DOCUMENT_CHANGE_ROOTS.get(change);

  if (!state) throw new TypeError('Invalid DocumentChange instance.');

  return state;
};

let constructDocumentChange: (input?: DocumentChangeInput) => DocumentChange;

export type DocumentChangeMapPositionOptions<TRoot extends string = string> =
  Readonly<{
    association?: 'backward' | 'forward';
    /** Base document value for lowering an unbound v4 change. */
    base?: JsonEditorValue;
    /** Named secondary root. Omit for the primary root. */
    root?: NamedRootKey<TRoot>;
    track?: TrackMode;
  }>;

export type DocumentChangeIterChangedRangesOptions = Readonly<{
  /** Base document value for lowering an unbound v4 change. */
  base?: JsonEditorValue;
}>;

/** @internal */
export const isUnboundV4DocumentChange = (change: DocumentChange): boolean =>
  UNBOUND_V4_CHANGES.has(change);

/** @internal */
export const attachV4Steps = (
  change: DocumentChange,
  steps: readonly V4Step[]
): DocumentChange => {
  DOCUMENT_CHANGE_V4_STEPS.set(change, Object.freeze([...steps]));

  return change;
};

/** @internal */
export const attachLazyV4Steps = (
  change: DocumentChange,
  before: JsonEditorValue,
  after: JsonEditorValue,
  options: Readonly<{
    authoritative?: boolean;
    fromBuilder?: boolean;
    isSetValued?: DocumentSetPropertyResolver;
  }> = {}
): DocumentChange => {
  if (!DOCUMENT_CHANGE_V4_STEPS.has(change)) {
    if (options.authoritative) {
      DOCUMENT_CHANGE_LAZY_V4_COMPUTE.delete(change);
    }
    DOCUMENT_CHANGE_LAZY_V4.set(change, {
      after,
      before,
      fromBuilder: options.fromBuilder,
      isSetValued: options.isSetValued,
    });
  }

  return change;
};

/** @internal */
export const getAttachedV4Steps = (
  change: DocumentChange
): readonly V4Step[] | null => DOCUMENT_CHANGE_V4_STEPS.get(change) ?? null;

const DOCUMENT_CHANGE_LAZY_V4_COMPUTE = new WeakMap<
  DocumentChange,
  () => readonly V4Step[] | null
>();

/** @internal */
export const hasV4StepsSource = (change: DocumentChange): boolean =>
  change.empty ||
  DOCUMENT_CHANGE_V4_STEPS.has(change) ||
  DOCUMENT_CHANGE_LAZY_V4_COMPUTE.has(change) ||
  DOCUMENT_CHANGE_LAZY_V4.has(change);

/** @internal */
export const attachLazyV4Compute = (
  change: DocumentChange,
  compute: () => readonly V4Step[] | null
): DocumentChange => {
  if (!hasV4StepsSource(change)) {
    DOCUMENT_CHANGE_LAZY_V4_COMPUTE.set(change, compute);
  }

  return change;
};

const DOCUMENT_CHANGE_REGISTER_STEPS = new WeakMap<
  DocumentChange,
  readonly V4RegisterStep[]
>();

/** @internal */
export const getV4RegisterSteps = (
  change: DocumentChange
): readonly V4RegisterStep[] => {
  const direct = DOCUMENT_CHANGE_REGISTER_STEPS.get(change);

  if (direct !== undefined) return direct;

  const steps = DOCUMENT_CHANGE_V4_STEPS.get(change);

  if (!steps) return [];

  return steps.filter(
    (step): step is V4RegisterStep => step.op === 'set_register'
  );
};

/** @internal */
export const hasV4RegisterSteps = (change: DocumentChange): boolean => {
  const direct = DOCUMENT_CHANGE_REGISTER_STEPS.get(change);

  if (direct !== undefined) return direct.length > 0;

  const steps = DOCUMENT_CHANGE_V4_STEPS.get(change);

  return steps?.some((step) => step.op === 'set_register') ?? false;
};

/** @internal */
export const filterDocumentChangeRegisterKeys = (
  change: DocumentChange,
  keepKey: (id: string) => boolean
): DocumentChange => {
  const existingReg = getV4RegisterSteps(change);

  if (existingReg.length === 0) return change;

  const keptReg = existingReg.filter((step) => keepKey(step.id));

  if (keptReg.length === existingReg.length) return change;

  const existingSteps = DOCUMENT_CHANGE_V4_STEPS.get(change);
  const filteredSteps = existingSteps
    ? existingSteps.filter(
        (step) => step.op !== 'set_register' || keepKey(step.id)
      )
    : null;

  if (UNBOUND_V4_CHANGES.has(change)) {
    return createV4DocumentChange(filteredSteps ?? [], {
      records: getInternalDocumentChangeRecords(change),
    });
  }

  const next = createInternalDocumentChange(
    new Map(getInternalDocumentChangeEntries(change)),
    {
      classifications: new Map(
        getInternalDocumentChangeClassificationEntries(change)
      ),
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
      records: getInternalDocumentChangeRecords(change),
    }
  );

  if (filteredSteps) {
    DOCUMENT_CHANGE_V4_STEPS.set(next, Object.freeze(filteredSteps));
    if (keptReg.length > 0) {
      DOCUMENT_CHANGE_REGISTER_STEPS.set(next, Object.freeze(keptReg));
    }
  } else {
    copyV4StepsMetadata(change, next);
    DOCUMENT_CHANGE_REGISTER_STEPS.set(next, Object.freeze(keptReg));
  }

  return next;
};

/** @internal */
export const copyV4StepsMetadata = (
  from: DocumentChange,
  to: DocumentChange
) => {
  const registerSteps = DOCUMENT_CHANGE_REGISTER_STEPS.get(from);

  if (registerSteps) DOCUMENT_CHANGE_REGISTER_STEPS.set(to, registerSteps);

  const steps = DOCUMENT_CHANGE_V4_STEPS.get(from);

  if (steps) {
    DOCUMENT_CHANGE_V4_STEPS.set(to, steps);
    return;
  }

  const lazyCompute = DOCUMENT_CHANGE_LAZY_V4_COMPUTE.get(from);

  if (lazyCompute) {
    DOCUMENT_CHANGE_LAZY_V4_COMPUTE.set(to, lazyCompute);
    return;
  }

  const lazy = DOCUMENT_CHANGE_LAZY_V4.get(from);

  if (lazy) DOCUMENT_CHANGE_LAZY_V4.set(to, lazy);
};

/** @internal */
export const getV4Steps = (
  change: DocumentChange
): readonly V4Step[] | null => {
  const existing = DOCUMENT_CHANGE_V4_STEPS.get(change);

  if (existing) return existing;

  const mergeExplicitRegisters = (
    computed: readonly V4Step[]
  ): readonly V4Step[] => {
    const explicit = DOCUMENT_CHANGE_REGISTER_STEPS.get(change);

    if (explicit === undefined) return computed;

    return [
      ...computed.filter((step) => step.op !== 'set_register'),
      ...explicit,
    ];
  };

  const lazyCompute = DOCUMENT_CHANGE_LAZY_V4_COMPUTE.get(change);

  if (lazyCompute) {
    DOCUMENT_CHANGE_LAZY_V4_COMPUTE.delete(change);
    try {
      const computed = lazyCompute();

      if (computed) {
        const frozen = Object.freeze([...mergeExplicitRegisters(computed)]);

        DOCUMENT_CHANGE_V4_STEPS.set(change, frozen);
        return frozen;
      }
    } catch {
      return null;
    }
  }

  const lazy = DOCUMENT_CHANGE_LAZY_V4.get(change);

  if (!lazy) return null;

  try {
    if (lazy.fromBuilder) countV4BuilderFallbackDiff();
    const extracted = Object.freeze([
      ...mergeExplicitRegisters(
        extractV4Between(lazy.before, lazy.after, {
          isSetValued: lazy.isSetValued,
        })
      ),
    ]);

    DOCUMENT_CHANGE_V4_STEPS.set(change, extracted);
    return extracted;
  } catch {
    return null;
  }
};

/** @internal */
export const createV4DocumentChange = (
  steps: readonly V4Step[],
  options: Readonly<{ records?: RecordOps }> = {}
): DocumentChange => {
  const validated = assertV4Steps(steps);
  const { createRoots, deleteRoots } = v4RootLifecycle(validated);
  const change = constructDocumentChange({
    createRoots,
    deleteRoots,
    records: options.records ?? NO_RECORD_OPS,
  });

  DOCUMENT_CHANGE_V4_STEPS.set(change, Object.freeze([...validated]));
  UNBOUND_V4_CHANGES.add(change);

  return change;
};

/** @internal */
export const createRegisterDocumentChange = (
  steps: readonly V4RegisterStep[]
): DocumentChange => {
  if (steps.length === 0) return DocumentChange.empty;

  const validated = assertV4Steps(steps) as readonly V4RegisterStep[];
  const frozen = Object.freeze([...validated]);
  const change = createInternalDocumentChange(new Map());

  DOCUMENT_CHANGE_REGISTER_STEPS.set(change, frozen);
  DOCUMENT_CHANGE_V4_STEPS.set(change, frozen);

  return change;
};

/** @internal */
export const bindV4DocumentChange = (
  change: DocumentChange,
  base: JsonEditorValue
): DocumentChange => {
  if (!UNBOUND_V4_CHANGES.has(change)) return change;

  const steps = DOCUMENT_CHANGE_V4_STEPS.get(change) ?? [];
  const lowered = lowerV4Steps(steps, base, change);
  const bound = createInternalDocumentChange(lowered.roots, {
    classifications: lowered.classifications,
    createRoots: lowered.createRoots,
    deleteRoots: lowered.deleteRoots,
    records: getDocumentChangeRootState(change).records,
  });

  DOCUMENT_CHANGE_V4_STEPS.set(bound, steps);

  const registerSteps = steps.filter(
    (step): step is V4RegisterStep => step.op === 'set_register'
  );

  if (registerSteps.length > 0) {
    DOCUMENT_CHANGE_REGISTER_STEPS.set(bound, Object.freeze(registerSteps));
  }

  return bound;
};

/** @internal */
export const documentChangeFromV4JSON = (
  json: DocumentChangeJson
): DocumentChange => {
  assertEditorJsonValue(json, 'DocumentChange v4 JSON');

  if (
    !isRecord(json) ||
    json.version !== 4 ||
    !Object.keys(json).every((key) =>
      ['records', 'steps', 'version'].includes(key)
    )
  ) {
    throw new Error('Invalid DocumentChange v4 JSON.');
  }

  const steps = json.steps === undefined ? [] : assertV4Steps(json.steps);
  const records =
    json.records === undefined
      ? NO_RECORD_OPS
      : recordOpsFromJson(json.records);

  if (records.has(V4_REGISTER_SET)) {
    throw new Error(
      `Raw record writes for "${V4_REGISTER_SET}" are not allowed; use set_register steps.`
    );
  }

  return createV4DocumentChange(steps, { records });
};

/** @internal */
export const documentChangeToV4JSON = (
  change: DocumentChange
): DocumentChangeJson => {
  let steps = getV4Steps(change);
  const state = getDocumentChangeRootState(change);

  if (steps === null) {
    if (state.primary === null && state.roots.size === 0) {
      const lifecycle: V4Step[] = [
        ...[...change.createRoots].map((root): V4Step => ({
          op: 'create_root',
          root,
        })),
        ...[...change.deleteRoots].map((root): V4Step => ({
          op: 'delete_root',
          root,
        })),
        ...getV4RegisterSteps(change),
      ];

      steps = lifecycle;
    } else {
      throw new Error(
        'DocumentChange.toJSON requires v4 steps; construct from a builder, DocumentChange.between, or DocumentChange.fromJSON.'
      );
    }
  }

  return {
    ...(state.records.size > 0
      ? { records: recordOpsToJson(state.records) }
      : {}),
    ...(steps.length > 0 ? { steps: structuredClone(steps) } : {}),
    version: 4,
  };
};

/**
 * Read one change through the private primary-root sentinel.
 *
 * @internal
 */
export const getInternalDocumentRootChange = (
  change: DocumentChange,
  root: string
) => {
  const state = getDocumentChangeRootState(change);

  return root === 'main' ? (state.primary ?? undefined) : state.roots.get(root);
};

/**
 * Read a change's record puts and drops.
 *
 * @internal
 */
export const getInternalDocumentChangeRecords = (
  change: DocumentChange
): RecordOps => getDocumentChangeRootState(change).records;

type DocumentReplacementRun = Readonly<{
  from: number;
  to: number;
  fromAfter: number;
  toAfter: number;
}>;
const DOCUMENT_REPLACEMENT_RUNS = new WeakMap<
  DocumentChange,
  Map<string, readonly DocumentReplacementRun[]>
>();

const documentReplacementRuns = (
  change: DocumentChange,
  root: string
): readonly DocumentReplacementRun[] => {
  let roots = DOCUMENT_REPLACEMENT_RUNS.get(change);
  if (!roots) {
    roots = new Map();
    DOCUMENT_REPLACEMENT_RUNS.set(change, roots);
  }
  const cached = roots.get(root);
  if (cached) return cached;
  const compact = getInternalDocumentRootChange(change, root);
  if (!compact) return [];

  const runs: DocumentReplacementRun[] = [];
  let before = 0;
  let after = 0;
  for (let index = 0; index < compact.sections.length;) {
    let length = compact.sections[index];
    let inserted = compact.sections[index + 1];
    index += 2;
    while (
      inserted >= 0 &&
      index < compact.sections.length &&
      compact.sections[index + 1] >= 0
    ) {
      length += compact.sections[index];
      inserted += compact.sections[index + 1];
      index += 2;
    }
    if (length > 0 && inserted > 0) {
      runs.push({
        from: before,
        fromAfter: after,
        to: before + length,
        toAfter: after + inserted,
      });
    }
    before += length;
    after += inserted < 0 ? length : inserted;
  }
  const result = Object.freeze(runs);
  roots.set(root, result);
  return result;
};

/** Map an expanded range to content inserted by the same atomic replacement. */
export const mapDocumentRangeReplacement = (
  change: DocumentChange,
  root: string,
  first: number,
  second: number,
  associations: readonly [-1 | 1, -1 | 1]
): readonly [number, number] | null => {
  if (first === second) return null;
  const compact = getInternalDocumentRootChange(change, root);
  if (!compact) return null;
  const runs = documentReplacementRuns(change, root);
  if (!runs.length) return null;

  const from = Math.min(first, second);
  const to = Math.max(first, second);
  let low = 0;
  let high = runs.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (runs[middle].to <= from) low = middle + 1;
    else high = middle;
  }
  const firstRun = runs[low];
  if (!firstRun || firstRun.from >= to) return null;

  let start = firstRun.fromAfter;
  let end = firstRun.toAfter;
  for (
    let index = low + 1;
    index < runs.length && runs[index].from < to;
    index++
  ) {
    start = Math.min(start, runs[index].fromAfter);
    end = Math.max(end, runs[index].toAfter);
  }
  if (!(firstRun.from <= from && firstRun.to >= to)) {
    const mappedFirst = compact.mapPos(first, associations[0]);
    const mappedSecond = compact.mapPos(second, associations[1]);
    if (mappedFirst === null || mappedSecond === null) return null;
    start = Math.min(start, mappedFirst, mappedSecond);
    end = Math.max(end, mappedFirst, mappedSecond);
  }
  return first < second ? [start, end] : [end, start];
};

/**
 * Read one classification through the private primary-root sentinel.
 *
 * @internal
 */
export const getInternalDocumentChangeClassification = (
  change: DocumentChange,
  root: string
) =>
  root === 'main'
    ? (change.primaryClassification ?? undefined)
    : change.rootClassifications.get(root);

/**
 * Map through an internal sentinel-keyed root.
 *
 * @internal
 */
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

/**
 * Test whether one internal root has a compact change.
 *
 * @internal
 */
export const hasInternalDocumentChangeRoot = (
  change: DocumentChange,
  root: string
) => getInternalDocumentRootChange(change, root) !== undefined;

/** @internal */
export const isInternalDocumentChangeNoop = (
  change: DocumentChange,
  value: JsonEditorValue
) => {
  if (
    change.createRoots.size !== 0 ||
    change.deleteRoots.size !== 0 ||
    getInternalDocumentChangeRecords(change).size !== 0
  ) {
    return false;
  }

  const registerSteps = getV4RegisterSteps(change);

  if (registerSteps.length > 0) {
    const beforeRecords = getValueRecords(value);

    if (applyV4RegisterSteps(beforeRecords, registerSteps) !== beforeRecords) {
      return false;
    }
  }

  return [...getInternalDocumentChangeEntries(change)].every(
    ([root, rootChange]) => rootChange.isNoopOn(valueRootIndex(value, root))
  );
};

/** @internal */
export const isInternalRecordsOnlyChange = (change: DocumentChange) =>
  (getInternalDocumentChangeRecords(change).size > 0 ||
    hasV4RegisterSteps(change)) &&
  change.createRoots.size === 0 &&
  change.deleteRoots.size === 0 &&
  getInternalDocumentChangeEntries(change).next().done === true;

/**
 * List changed roots without exposing their compact changes.
 *
 * @internal
 */
export const getInternalDocumentChangeRootKeys = (change: DocumentChange) =>
  Object.freeze(
    [...getInternalDocumentChangeEntries(change)].map(([root]) => root)
  );

/**
 * Read changed token ranges without exposing compact sections.
 *
 * @internal
 */
export const getInternalDocumentChangeRanges = (
  change: DocumentChange,
  root: string
) => {
  const ranges: Array<readonly [number, number, number, number]> = [];

  getInternalDocumentRootChange(change, root)?.iterChangedRanges((...range) => {
    ranges.push(Object.freeze(range));
  });

  return Object.freeze(ranges);
};

/**
 * Map one JSON point between transaction snapshots.
 *
 * @internal
 */
export const mapInternalDocumentChangePoint = (
  change: DocumentChange,
  before: JsonEditorValue,
  after: JsonEditorValue,
  root: string,
  point: JsonPoint,
  association: -1 | 1
): JsonPoint | null => {
  if (change.deleteRoots.has(root)) return null;
  if (!hasInternalDocumentChangeRoot(change, root)) return point;

  try {
    const source = DocumentIndex.fromValue(valueRoot(before, root));
    const target = DocumentIndex.fromValue(valueRoot(after, root));
    const position = source.positionAt(point);
    const mapped = mapInternalDocumentChangePosition(
      change,
      root,
      position,
      association
    );

    return mapped === null ? null : target.pointAt(mapped, association);
  } catch {
    return null;
  }
};

/**
 * Iterate changes through the private primary-root sentinel.
 *
 * @yields {readonly [string, RootChange]} The root identifier and its root change.
 * @internal
 */
export function* getInternalDocumentChangeEntries(
  change: DocumentChange
): Generator<readonly [string, RootChange]> {
  const state = getDocumentChangeRootState(change);

  if (state.primary) yield ['main', state.primary];
  yield* state.roots;
}

/**
 * Iterate classifications through the private primary-root sentinel.
 *
 * @yields {readonly [string, DocumentChangeRootClassification]} The root identifier and its classification.
 * @internal
 */
export function* getInternalDocumentChangeClassificationEntries(
  change: DocumentChange
): Generator<readonly [string, DocumentChangeRootClassification]> {
  if (change.primaryClassification) {
    yield ['main', change.primaryClassification];
  }
  yield* change.rootClassifications;
}

/** @internal */
export const isInternalTextOnlyDocumentChange = (change: DocumentChange) => {
  const roots = getInternalDocumentChangeRootKeys(change);
  const classifications = [
    ...getInternalDocumentChangeClassificationEntries(change),
  ];

  return (
    roots.length > 0 &&
    classifications.length === roots.length &&
    classifications.every(
      ([, kind]) => kind.text && !kind.properties && !kind.structure
    )
  );
};

/**
 * Construct from an internal sentinel-keyed root map.
 *
 * @internal
 */
export const createInternalDocumentChange = (
  changes: ReadonlyMap<string, RootChange>,
  options: Readonly<{
    classifications?: ReadonlyMap<string, DocumentChangeRootClassification>;
    createRoots?: Iterable<string>;
    deleteRoots?: Iterable<string>;
    records?: RecordOps;
  }> = {}
) => {
  const roots = new Map(changes);
  const classifications = new Map(options.classifications);
  const primary = roots.get('main') ?? null;
  const primaryClassification = classifications.get('main') ?? null;

  roots.delete('main');
  classifications.delete('main');

  return constructDocumentChange({
    createRoots: options.createRoots,
    deleteRoots: options.deleteRoots,
    primary,
    primaryClassification,
    records: options.records,
    rootClassifications: classifications,
    roots,
  });
};

/**
 * The same change with other record puts and drops.
 *
 * @internal
 */
export const withDocumentChangeRecords = (
  change: DocumentChange,
  records: RecordOps
) => {
  if (getInternalDocumentChangeRecords(change) === records) return change;
  if (UNBOUND_V4_CHANGES.has(change)) {
    return createV4DocumentChange(DOCUMENT_CHANGE_V4_STEPS.get(change) ?? [], {
      records,
    });
  }

  const next = createInternalDocumentChange(
    new Map(getInternalDocumentChangeEntries(change)),
    {
      classifications: new Map(
        getInternalDocumentChangeClassificationEntries(change)
      ),
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
      records,
    }
  );
  copyV4StepsMetadata(change, next);

  return next;
};

/** @internal */
export const filterDocumentChangeRecordSets = (
  change: DocumentChange,
  keep: (set: string) => boolean
) =>
  withDocumentChangeRecords(
    change,
    filterRecordOps(getInternalDocumentChangeRecords(change), keep)
  );

/** @internal */
export const withoutRetainedRecordSets = (
  change: DocumentChange,
  recordSets: ReadonlyMap<string, Readonly<{ history?: 'retain' | 'undo' }>>
) =>
  filterDocumentChangeRecordSets(
    change,
    (set) => recordSets.get(set)?.history !== 'retain'
  );

/** @internal */
export const withInternalDocumentRootChange = (
  change: DocumentChange,
  root: string,
  rootChange: RootChange
) =>
  createInternalDocumentChange(
    new Map([...getInternalDocumentChangeEntries(change), [root, rootChange]]),
    {
      classifications: new Map(
        [...getInternalDocumentChangeClassificationEntries(change)].filter(
          ([key]) => key !== root
        )
      ),
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
      records: getInternalDocumentChangeRecords(change),
    }
  );

/** @internal */
export const filterDocumentChangeRoots = (
  change: DocumentChange,
  keep: (root: string) => boolean
) =>
  createInternalDocumentChange(
    new Map(
      [...getInternalDocumentChangeEntries(change)].filter(([root]) =>
        keep(root)
      )
    ),
    {
      classifications: new Map(
        [...getInternalDocumentChangeClassificationEntries(change)].filter(
          ([root]) => keep(root)
        )
      ),
      createRoots: [...change.createRoots].filter(keep),
      deleteRoots: [...change.deleteRoots].filter(keep),
      records: getInternalDocumentChangeRecords(change),
    }
  );

const writesOnlyElementProperties = (
  change: RootChange,
  document: () => DocumentIndex
) => {
  let index: DocumentIndex | undefined;
  let position = 0;

  for (let at = 0; at < change.sections.length; at += 2) {
    const length = getDefined(change.sections[at]);
    const inserted = getDefined(change.sections[at + 1]);

    if (inserted >= 0) return false;
    if (inserted === -2) {
      index ??= document();
      if (invertiblePropertyNode(index, position, length)?.kind !== 'element') {
        return false;
      }
    }
    position += length;
  }

  return true;
};

/** @internal */
export const documentChangeWritesOnlyElementProperties = (
  change: DocumentChange,
  value: JsonEditorValue
) =>
  change.createRoots.size === 0 &&
  change.deleteRoots.size === 0 &&
  [...getInternalDocumentChangeRecords(change).values()].every(
    (set) => set.size === 0
  ) &&
  [...getInternalDocumentChangeEntries(change)].every(([root, rootChange]) =>
    writesOnlyElementProperties(rootChange, () => valueRootIndex(value, root))
  );

/** @internal */
export const documentChangePropertyOnlyWrites = (
  change: DocumentChange,
  value: JsonEditorValue
): ReadonlyArray<
  Readonly<{ keys: readonly string[]; path: readonly number[]; root: string }>
> | null => {
  if (change.createRoots.size > 0 || change.deleteRoots.size > 0) return null;

  const writes: Array<
    Readonly<{ keys: readonly string[]; path: readonly number[]; root: string }>
  > = [];

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    let index: DocumentIndex | undefined;
    let position = 0;

    for (let at = 0; at < rootChange.sections.length; at += 2) {
      const length = getDefined(rootChange.sections[at]);
      const inserted = getDefined(rootChange.sections[at + 1]);

      if (inserted >= 0) return null;
      if (inserted === -2) {
        index ??= valueRootIndex(value, root);
        const node = invertiblePropertyNode(index, position, length);

        if (!node) return null;
        const modifications = rootChange.data[
          at / 2
        ] as readonly PropertyModification[];
        const keys = [...new Set(modifications.map(({ key }) => key))].sort();

        writes.push(
          Object.freeze({
            keys: Object.freeze(keys),
            path: node.path,
            root,
          })
        );
      }
      position += length;
    }
  }

  return writes;
};

/** @internal */
export const collapseDocumentElementPropertyWrites = (
  change: DocumentChange,
  value: JsonEditorValue,
  isSetValued: DocumentSetPropertyResolver,
  { textLeaves = false }: Readonly<{ textLeaves?: boolean }> = {}
) =>
  createInternalDocumentChange(
    new Map(
      [...getInternalDocumentChangeEntries(change)].map(
        ([root, rootChange]) =>
          [
            root,
            collapseElementPropertyWrites(
              rootChange,
              valueRootIndex(value, root),
              isSetValued,
              root === 'main' ? null : root,
              textLeaves
            ),
          ] as const
      )
    ),
    {
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
      records: getInternalDocumentChangeRecords(change),
    }
  );

/**
 * Carry target-document runtime identities inside inserted node slices.
 *
 * @internal
 */
export const bindDocumentChangeNodeKeys = (
  change: DocumentChange,
  target: JsonEditorValue,
  nodeKeyAt: (root: string, path: readonly number[]) => NodeKey | null
) => {
  const bound = createInternalDocumentChange(
    new Map(
      [...getInternalDocumentChangeEntries(change)].map(
        ([root, rootChange]) =>
          [
            root,
            rootChange.withInsertedNodeKeys(
              valueRootIndex(target, root),
              (path) => nodeKeyAt(root, path)
            ),
          ] as const
      )
    ),
    {
      classifications: new Map(
        getInternalDocumentChangeClassificationEntries(change)
      ),
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
      records: getInternalDocumentChangeRecords(change),
    }
  );
  copyV4StepsMetadata(change, bound);

  return bound;
};

export type InternalRootChangeSection = Readonly<{
  after: readonly JsonNode[];
  before: readonly JsonNode[];
  from: number;
  /** The section's change, when the caller knows more than a diff reads. */
  local?: RootChange;
}>;

export type InternalRootNodeChangeSection = Readonly<{
  after: readonly JsonNode[];
  before: readonly JsonNode[];
  /** Top-level child index in the current root. */
  from: number;
}>;

/**
 * Build one sparse root change without exposing the compact root
 * algebra to sibling packages.
 *
 * @internal
 */
export const createInternalRootChangeFromSections = (
  root: string,
  sourceLength: number,
  sections: readonly InternalRootChangeSection[],
  isSetValued: DocumentSetPropertyResolver
) => {
  assertDocumentRootKey(root);

  const compactSections: number[] = [];
  const data: SectionData[] = [];
  const changedSections: number[] = [];
  let position = 0;

  const append = (length: number, inserted: number, value: SectionData) => {
    if (length === 0 && inserted === -1) return;

    const last = compactSections.length - 1;

    if (inserted === -1 && last >= 1 && compactSections[last] === -1) {
      compactSections[last - 1] = (compactSections[last - 1] ?? 0) + length;

      return;
    }

    compactSections.push(length, inserted);
    data.push(value);
  };

  sections.forEach((section, index) => {
    if (
      !Number.isSafeInteger(section.from) ||
      section.from < position ||
      section.from > sourceLength
    ) {
      throw new Error('Invalid internal root change section offset.');
    }

    const local =
      section.local ??
      RootChange.betweenChangedBlocks(
        DocumentIndex.fromValue(section.before),
        DocumentIndex.fromValue(section.after),
        {
          isSetValued,
          root: root === 'main' ? null : root,
        }
      );

    if (local.empty) return;

    append(section.from - position, -1, null);

    let sectionIndex = 0;
    let dataIndex = 0;

    while (sectionIndex < local.sections.length) {
      append(
        local.sections[sectionIndex] ?? 0,
        local.sections[sectionIndex + 1] ?? -1,
        local.data[dataIndex] ?? null
      );
      sectionIndex += 2;
      dataIndex += 1;
    }

    position = section.from + local.length;
    changedSections.push(index);
  });

  append(sourceLength - position, -1, null);

  const rootChange = RootChange.fromSections(compactSections, data);

  return Object.freeze({
    change: createInternalDocumentChange(
      rootChange.empty ? new Map() : new Map([[root, rootChange]])
    ),
    changedSections: Object.freeze(changedSections),
  });
};

/**
 * Build one sparse root change from top-level node sections.
 *
 * @internal
 */
export const createInternalRootChangeFromNodeSections = (
  root: string,
  source: readonly JsonNode[],
  sections: readonly InternalRootNodeChangeSection[],
  isSetValued: DocumentSetPropertyResolver = () => false
) => {
  const document = DocumentIndex.fromValue(source);
  let childPosition = 0;

  const tokenSections = sections.map((section) => {
    if (
      !Number.isSafeInteger(section.from) ||
      section.from < childPosition ||
      section.from + section.before.length > source.length ||
      !jsonEqual(
        source.slice(section.from, section.from + section.before.length),
        section.before
      )
    ) {
      throw new Error('Invalid internal root node change section.');
    }
    childPosition = section.from + section.before.length;

    return Object.freeze({
      after: section.after,
      before: section.before,
      from: document.childPosition([], section.from),
    });
  });

  return createInternalRootChangeFromSections(
    root,
    document.length,
    tokenSections,
    isSetValued
  );
};

const touchedRootsOf = (change: DocumentChange) =>
  new Set([
    ...[...getInternalDocumentChangeEntries(change)].map(([root]) => root),
    ...change.createRoots,
    ...change.deleteRoots,
  ]);

/**
 * Roots that one change creates or deletes while the other touches them.
 * `compose` rebuilds only those roots from the source value instead of
 * composing positions.
 *
 * @internal
 */
export const rootsComposeRebuilds = (
  first: DocumentChange,
  second: DocumentChange
): ReadonlySet<string> => {
  const secondRoots = touchedRootsOf(second);

  return new Set(
    [...touchedRootsOf(first)].filter(
      (root) =>
        secondRoots.has(root) &&
        (first.createRoots.has(root) ||
          first.deleteRoots.has(root) ||
          second.createRoots.has(root) ||
          second.deleteRoots.has(root))
    )
  );
};

export class DocumentChange {
  static readonly empty = new DocumentChange();

  /** Named roots created by this change. */
  readonly createRoots: ReadonlySet<string>;
  /** Named roots deleted by this change. */
  readonly deleteRoots: ReadonlySet<string>;
  /** Derived classification for the primary change. */
  readonly primaryClassification: DocumentChangeRootClassification | null;
  /** Derived classifications keyed only by named roots. */
  readonly rootClassifications: ReadonlyMap<
    string,
    DocumentChangeRootClassification
  >;

  private constructor(input: DocumentChangeInput = {}) {
    this.deleteRoots = freezeReadonlySet(input.deleteRoots ?? []);
    const assertChangedRoot = (root: string) => {
      if (this.deleteRoots.has(root)) {
        assertDeletableRoot(root);
      } else {
        assertNamedDocumentRootKey(root);
      }
    };

    for (const root of input.roots?.keys() ?? []) assertChangedRoot(root);

    const primary = input.primary?.empty ? null : (input.primary ?? null);
    const roots = freezeReadonlyMap(
      [...(input.roots ?? [])].filter(([, change]) => !change.empty)
    );
    this.primaryClassification =
      primary && input.primaryClassification
        ? freezeRootClassification('primary', input.primaryClassification)
        : null;
    this.rootClassifications = freezeReadonlyMap(
      [...(input.rootClassifications ?? [])]
        .map(([root, classification]) => {
          assertChangedRoot(root);

          return [root, classification] as const;
        })
        .filter(([root]) => roots.has(root))
        .map(([root, classification]) => [
          root,
          freezeRootClassification(root, classification),
        ])
    );
    this.createRoots = freezeReadonlySet(input.createRoots ?? []);

    for (const root of this.createRoots) assertNamedDocumentRootKey(root);
    for (const root of this.deleteRoots) assertDeletableRoot(root);

    for (const root of this.createRoots) {
      if (this.deleteRoots.has(root)) {
        throw new Error(`Invalid created root ${root}.`);
      }
    }

    const records = freezeReadonlyMap(
      [...(input.records ?? NO_RECORD_OPS)]
        .filter(([, writes]) => writes.size > 0)
        .map(([set, writes]) => {
          assertOwnKeyName(set);

          return [set, freezeReadonlyMap(writes)] as const;
        })
    );

    DOCUMENT_CHANGE_ROOTS.set(
      this,
      Object.freeze({
        primary,
        records: records.size === 0 ? NO_RECORD_OPS : records,
        roots,
      })
    );
    Object.freeze(this);
  }

  static {
    constructDocumentChange = (input) => new DocumentChange(input);
  }

  static between(
    before: JsonEditorValue,
    after: JsonEditorValue,
    options: Readonly<{
      isSetValued?: DocumentSetPropertyResolver;
    }> = {}
  ) {
    return documentChangeBetween(before, after, options);
  }

  get empty() {
    const state = getDocumentChangeRootState(this);

    if (UNBOUND_V4_CHANGES.has(this)) {
      const steps = DOCUMENT_CHANGE_V4_STEPS.get(this) ?? [];

      return steps.length === 0 && state.records.size === 0;
    }

    return (
      state.primary === null &&
      state.roots.size === 0 &&
      state.records.size === 0 &&
      this.createRoots.size === 0 &&
      this.deleteRoots.size === 0 &&
      !hasV4RegisterSteps(this)
    );
  }

  /** Validate a document change without relying on constructor identity. */
  static isDocumentChange(value: unknown): value is DocumentChange {
    if (
      value instanceof DocumentChange &&
      (UNBOUND_V4_CHANGES.has(value) || DOCUMENT_CHANGE_ROOTS.has(value))
    ) {
      return true;
    }

    try {
      if (
        !isRecord(value) ||
        typeof value.empty !== 'boolean' ||
        Object.hasOwn(value, 'changes') ||
        Object.hasOwn(value, 'classifications') ||
        Object.hasOwn(value, 'primary') ||
        Object.hasOwn(value, 'preserveEmptyRoots') ||
        Object.hasOwn(value, 'records') ||
        Object.hasOwn(value, 'roots') ||
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

      const createRoots = readStructuralSet(value.createRoots);
      const deleteRoots = readStructuralSet(value.deleteRoots);
      const rootClassifications = readStructuralMap(value.rootClassifications);

      if (!createRoots || !deleteRoots || !rootClassifications) {
        return false;
      }

      const advertised = Reflect.apply(
        value.toJSON as () => unknown,
        value,
        []
      );
      const decoded = DocumentChange.fromJSON(advertised as DocumentChangeJson);
      const canonical = decoded.toJSON();
      const { primaryClassification } = value;

      if (primaryClassification !== null) {
        if (!isRecord(primaryClassification)) {
          return false;
        }

        const classification = freezeRootClassification(
          'primary',
          primaryClassification as DocumentChangeRootClassification
        );

        if (!jsonEqual(primaryClassification, classification)) return false;
      }

      const seenClassifications = new Set<string>();

      for (const [root, classification] of rootClassifications) {
        if (typeof root !== 'string') return false;
        if (!decoded.deleteRoots.has(root)) assertNamedDocumentRootKey(root);

        if (seenClassifications.has(root) || !isRecord(classification)) {
          return false;
        }

        const canonicalClassification = freezeRootClassification(
          root,
          classification as DocumentChangeRootClassification
        );

        if (!jsonEqual(classification, canonicalClassification)) return false;

        seenClassifications.add(root);
      }

      return (
        jsonEqual(advertised, canonical) &&
        jsonEqual(createRoots, [...decoded.createRoots]) &&
        jsonEqual(deleteRoots, [...decoded.deleteRoots]) &&
        decoded.empty === value.empty
      );
    } catch {
      return false;
    }
  }

  static fromJSON(json: DocumentChangeJson) {
    return documentChangeFromV4JSON(json);
  }

  /**
   * Rebase two changes from the same value for pairwise convergence (first-wins
   * on conflict, returning a compensating `a` so both replay orders reach the
   * same document).
   */
  static transform(
    a: DocumentChange,
    b: DocumentChange,
    value: JsonEditorValue
  ) {
    const lifecycle = lifecycleConflictOf(a, b, value);

    if (lifecycle) {
      throw new Error(
        `Cannot transform concurrent root lifecycle changes for ${lifecycle.root}.`
      );
    }

    if (allElementsHaveIds(value)) {
      const aSteps = tryV4StepsOf(a, value);
      const bSteps = tryV4StepsOf(b, value);

      if (aSteps !== null && bSteps !== null) {
        const records = recordsRebasedOf(a, b);
        const res = rebaseV4Changes(value, aSteps, bSteps);

        if (res.ok && records.unequal.length === 0) {
          let aOut = createV4DocumentChange(res.aPrime, {
            records: records.first,
          });
          let bOut = createV4DocumentChange(res.bPrime, {
            records: records.second,
          });

          if (!UNBOUND_V4_CHANGES.has(a) && !UNBOUND_V4_CHANGES.has(b)) {
            const aAfter = a.apply(value);
            const bAfter = b.apply(value);

            aOut = bindV4DocumentChange(aOut, bAfter);
            bOut = bindV4DocumentChange(bOut, aAfter);
          }

          return { a: aOut, b: bOut };
        }

        const aAfter = a.apply(value);
        const bAfter = b.apply(value);

        return {
          a: DocumentChange.between(bAfter, aAfter),
          b: DocumentChange.empty,
        };
      }
    }

    const transformed = transformInternalDocumentChange(a, b, value);

    return { a: transformed.a, b: transformed.b };
  }

  /**
   * Compose sequential changes. Overlapping root lifecycle transitions require
   * the source value because deleting a root discards content that no
   * value-free change algebra can recover.
   */
  compose(other: DocumentChange, value?: JsonEditorValue): DocumentChange {
    if (this.empty) return other;
    if (other.empty) return this;
    if (UNBOUND_V4_CHANGES.has(this) || UNBOUND_V4_CHANGES.has(other)) {
      const leftSteps = getV4Steps(this);
      const rightSteps = getV4Steps(other);

      if (leftSteps !== null && rightSteps !== null) {
        return createV4DocumentChange([...leftSteps, ...rightSteps], {
          records: composeRecordOps(
            getInternalDocumentChangeRecords(this),
            getInternalDocumentChangeRecords(other)
          ),
        });
      }
      if (!value) {
        throw new Error(
          'Composing an unbound v4 change with a bound change without v4 steps requires the source value.'
        );
      }

      const boundLeft = bindV4DocumentChange(this, value);
      const boundRight = bindV4DocumentChange(other, boundLeft.apply(value));

      return boundLeft.compose(boundRight, value);
    }

    const rebuilt = rootsComposeRebuilds(this, other);
    const records = composeRecordOps(
      getInternalDocumentChangeRecords(this),
      getInternalDocumentChangeRecords(other)
    );
    const changes = new Map<string, RootChange>();
    const classifications = new Map<string, DocumentChangeRootClassification>();
    const createRoots = new Set(
      [...this.createRoots, ...other.createRoots].filter(
        (root) => !rebuilt.has(root)
      )
    );
    const deleteRoots = new Set(
      [...this.deleteRoots, ...other.deleteRoots].filter(
        (root) => !rebuilt.has(root)
      )
    );

    if (rebuilt.size > 0 && !value) {
      throw new Error(
        `Composing overlapping lifecycle changes for root ${[...rebuilt][0]} requires the source value.`
      );
    }

    const rebuiltState =
      rebuilt.size > 0 && value
        ? {
            after: applyDocumentChangeValue(
              other,
              applyDocumentChangeValue(this, value)
            ),
            before: value,
          }
        : null;

    const roots = new Set([
      ...[...getInternalDocumentChangeEntries(this)].map(([root]) => root),
      ...[...getInternalDocumentChangeEntries(other)].map(([root]) => root),
      ...rebuilt,
    ]);

    for (const root of roots) {
      if (rebuiltState && rebuilt.has(root)) {
        const beforeDocument = valueRootIndex(rebuiltState.before, root);
        const afterDocument = valueRootIndex(rebuiltState.after, root);
        const change = RootChange.betweenChangedBlocks(
          beforeDocument,
          afterDocument,
          { root }
        );
        const existed = Object.hasOwn(rebuiltState.before.roots ?? {}, root);
        const exists = Object.hasOwn(rebuiltState.after.roots ?? {}, root);

        if (!change.empty) {
          changes.set(root, change);
          classifications.set(
            root,
            classifyRootChange(change, beforeDocument, afterDocument)
          );
        }
        if (!existed && exists) createRoots.add(root);
        if (existed && !exists) deleteRoots.add(root);
        continue;
      }

      const first = getInternalDocumentRootChange(this, root);
      const second = getInternalDocumentRootChange(other, root);
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
        // RootChange or classify once against the transaction snapshots.
        if (classification) classifications.set(root, classification);
      }

      if (
        rebuiltState &&
        root !== 'main' &&
        !Object.hasOwn(rebuiltState.before.roots ?? {}, root) &&
        !deleteRoots.has(root)
      ) {
        createRoots.add(root);
      }
    }

    const composed = createInternalDocumentChange(changes, {
      classifications,
      createRoots,
      deleteRoots,
      records,
    });
    const combinedRegisters = [
      ...getV4RegisterSteps(this),
      ...getV4RegisterSteps(other),
    ];

    if (combinedRegisters.length > 0) {
      DOCUMENT_CHANGE_REGISTER_STEPS.set(
        composed,
        Object.freeze(combinedRegisters)
      );
    }
    const leftImmediate = DOCUMENT_CHANGE_V4_STEPS.get(this);
    const rightImmediate = DOCUMENT_CHANGE_V4_STEPS.get(other);

    if (leftImmediate && rightImmediate) {
      attachV4Steps(composed, [...leftImmediate, ...rightImmediate]);
    } else if (hasV4StepsSource(this) && hasV4StepsSource(other)) {
      DOCUMENT_CHANGE_LAZY_V4_COMPUTE.set(composed, () => {
        const leftSteps = this.empty ? [] : getV4Steps(this);
        const rightSteps = other.empty ? [] : getV4Steps(other);

        return leftSteps && rightSteps ? [...leftSteps, ...rightSteps] : null;
      });
    }

    return composed;
  }

  /** Compose one transaction-wide structural correction into this change. */
  correct(value: JsonEditorValue, correction: DocumentCorrection) {
    const applied = deepFreeze(this.apply(value));
    const changedRanges: DocumentChangedRange[] = [];

    this.iterChangedRanges(
      (root, fromBefore, toBefore, fromAfter, toAfter) => {
        changedRanges.push({
          fromAfter,
          fromBefore,
          root,
          toAfter,
          toBefore,
        });
      },
      { base: value }
    );

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
    ) => void,
    options: DocumentChangeIterChangedRangesOptions = {}
  ) {
    if (UNBOUND_V4_CHANGES.has(this)) {
      if (!options.base) {
        throw new Error(
          'DocumentChange.iterChangedRanges requires options.base for an unbound v4 change.'
        );
      }
      const steps = DOCUMENT_CHANGE_V4_STEPS.get(this) ?? [];
      const lowered = lowerV4Steps(steps, options.base, this);

      for (const [root, change] of lowered.roots) {
        change.iterChangedRanges((...range) => {
          visit(root === 'main' ? null : root, ...range);
        });
      }
      return;
    }

    if (options.base !== undefined) {
      const steps = DOCUMENT_CHANGE_V4_STEPS.get(this);

      if (steps) {
        const lowered = lowerV4Steps(steps, options.base, this);

        for (const [root, change] of lowered.roots) {
          change.iterChangedRanges((...range) => {
            visit(root === 'main' ? null : root, ...range);
          });
        }
        return;
      }
    }

    for (const [root, change] of getInternalDocumentChangeEntries(this)) {
      change.iterChangedRanges((...range) => {
        visit(root === 'main' ? null : root, ...range);
      });
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

    const association = options.association === 'forward' ? 1 : -1;

    if (UNBOUND_V4_CHANGES.has(this)) {
      if (!options.base) {
        throw new Error(
          'DocumentChange.mapPosition requires options.base for an unbound v4 change.'
        );
      }
      const steps = DOCUMENT_CHANGE_V4_STEPS.get(this) ?? [];
      const lowered = lowerV4Steps(steps, options.base, this);
      const change = lowered.roots.get(root);

      return change
        ? change.mapPos(position, association, options.track)
        : position;
    }

    if (options.base !== undefined) {
      const steps = DOCUMENT_CHANGE_V4_STEPS.get(this);

      if (steps) {
        const lowered = lowerV4Steps(steps, options.base, this);
        const change = lowered.roots.get(root);

        return change
          ? change.mapPos(position, association, options.track)
          : position;
      }
    }

    const change = getInternalDocumentRootChange(this, root);

    return change
      ? change.mapPos(position, association, options.track)
      : position;
  }

  apply<T extends JsonEditorValue>(value: T): T {
    if (UNBOUND_V4_CHANGES.has(this)) {
      const steps = DOCUMENT_CHANGE_V4_STEPS.get(this) ?? [];
      const recordOps = getInternalDocumentChangeRecords(this);
      const hasRegisterSteps = steps.some((step) => step.op === 'set_register');
      const bound = bindV4DocumentChange(this, value);
      const applied = (
        hasRegisterSteps
          ? withDocumentChangeRecords(bound, NO_RECORD_OPS)
          : bound
      ).apply(value);

      if (!hasRegisterSteps) return applied;

      const { records: _staleRecords, ...withoutStaleRecords } =
        applied as Record<string, unknown>;
      const afterRegisters = applyV4RegisterSteps(
        getValueRecords(value),
        steps
      );
      const nextRecords =
        recordOps.size > 0
          ? applyRecordOps(afterRegisters, recordOps)
          : afterRegisters;

      withValueRecords(withoutStaleRecords, nextRecords);
      if (
        Object.hasOwn(value, 'records') ||
        !hasValueRecords(value) ||
        nextRecords !== getValueRecords(value)
      ) {
        showValueRecords(withoutStaleRecords, nextRecords);
      }

      return deepFreeze(withoutStaleRecords) as T;
    }

    const applied: Record<string, unknown> = applyDocumentChangeValue(
      this,
      value
    );

    for (const key of Object.keys(applied)) {
      if (key !== 'roots' || !isRecord(applied.roots)) {
        freezeAppliedRoot(applied, key, value, () =>
          rootIndexOf(value, key as 'children')
        );
        continue;
      }
      const named = applied.roots;

      for (const root of visitRootNames(named)) {
        freezeAppliedRoot(named, root, value.roots, () =>
          valueRootIndex(value, root)
        );
      }
      Object.freeze(named);
    }
    // A value that showed its records, or plain JSON that gains some, shows
    // them; a value whose store core carries keeps carrying it.
    if (Object.hasOwn(value, 'records') || !hasValueRecords(value)) {
      const records = getValueRecords(applied);

      // A change that writes no record keeps the JSON it was given, so a key
      // never serializes every record again.
      if (value.records !== undefined && records === getValueRecords(value)) {
        applied.records = value.records;
        withValueRecords(applied, records);
      } else {
        showValueRecords(applied, records);
      }
    }

    return Object.freeze(applied) as T;
  }

  invert(value: JsonEditorValue) {
    return invertDocumentChangeWithMint(this, value);
  }

  toJSON(): DocumentChangeJson {
    return documentChangeToV4JSON(this);
  }
}

/** @internal */
export const invertDocumentChangeWithMint = (
  change: DocumentChange,
  value: JsonEditorValue,
  mintWriteId?: () => string
): DocumentChange => {
  if (UNBOUND_V4_CHANGES.has(change)) {
    const steps = DOCUMENT_CHANGE_V4_STEPS.get(change) ?? [];

    return createV4DocumentChange(
      invertV4Steps(value, steps, { mintWriteId }),
      {
        records: invertRecordOps(
          getValueRecords(value),
          getInternalDocumentChangeRecords(change)
        ),
      }
    );
  }

  const deleteRoots = new Set([
    ...change.createRoots,
    ...[...getInternalDocumentChangeEntries(change)]
      .map(([root]) => root)
      .filter(
        (root) => root !== 'main' && !Object.hasOwn(value.roots ?? {}, root)
      ),
  ]);
  const createRoots = [...change.deleteRoots].filter((root) =>
    Object.hasOwn(value.roots ?? {}, root)
  );

  const changes = new Map(
    [...getInternalDocumentChangeEntries(change)].map(([root, rootChange]) => {
      const document = valueRootIndex(value, root);

      return [root, rootChange.invert(document)] as const;
    })
  );

  for (const root of createRoots) {
    const before = DocumentIndex.fromValue([]);
    const restored = DocumentIndex.fromValue(valueRoot(value, root));
    const restore = RootChange.betweenChangedBlocks(before, restored);

    if (restore.empty) changes.delete(root);
    else changes.set(root, restore);
  }

  const inverted = createInternalDocumentChange(changes, {
    classifications: new Map(
      [...changes.keys()].flatMap((root) => {
        const classification = getInternalDocumentChangeClassification(
          change,
          root
        );

        return classification ? [[root, classification] as const] : [];
      })
    ),
    createRoots,
    deleteRoots,
    records: invertRecordOps(
      getValueRecords(value),
      getInternalDocumentChangeRecords(change)
    ),
  });
  const registerSteps = getV4RegisterSteps(change);
  const invertedRegisters =
    registerSteps.length > 0
      ? Object.freeze(
          invertV4RegisterSteps(
            getValueRecords(value),
            registerSteps,
            mintWriteId
          )
        )
      : null;

  if (invertedRegisters && invertedRegisters.length > 0) {
    DOCUMENT_CHANGE_REGISTER_STEPS.set(inverted, invertedRegisters);
  }

  const steps = DOCUMENT_CHANGE_V4_STEPS.get(change);

  if (steps || DOCUMENT_CHANGE_LAZY_V4_COMPUTE.has(change)) {
    DOCUMENT_CHANGE_LAZY_V4_COMPUTE.set(inverted, () => {
      const resolvedSteps = steps ?? getV4Steps(change);

      if (!resolvedSteps) return null;

      const docOnlySteps = resolvedSteps.filter(
        (step) => step.op !== 'set_register'
      );

      if (docOnlySteps.length === 0) {
        return invertedRegisters ?? [];
      }

      let localMap: Map<
        string,
        Readonly<{ path: readonly number[]; root: string }>
      > | null = null;
      const boundLookup = (id: string) => {
        if (localMap === null) {
          const built = new Map<
            string,
            Readonly<{ path: readonly number[]; root: string }>
          >();
          const collectIds = (
            root: string,
            node: JsonNode,
            path: readonly number[]
          ) => {
            if (!isElementNode(node)) return;
            if (typeof node.id === 'string' && node.id.length > 0) {
              built.set(node.id, { path, root });
            }
            for (let i = 0; i < node.children.length; i += 1) {
              collectIds(root, getDefined(node.children[i]), [...path, i]);
            }
          };

          for (const [root, rootChange] of getInternalDocumentChangeEntries(
            change
          )) {
            const docIndex = valueRootIndex(value, root);
            const visitedTop = new Set<number>();

            rootChange.iterChangedRanges((fromBefore, toBefore) => {
              const ranges = docIndex.nodeRangesTouching(fromBefore, toBefore);

              for (const entry of ranges) {
                if (entry.path.length !== 1) continue;
                const topIdx = getDefined(entry.path[0]);

                if (visitedTop.has(topIdx)) continue;
                visitedTop.add(topIdx);
                collectIds(root, docIndex.node([topIdx]), [topIdx]);
              }
            });
          }
          localMap = built;
        }

        return localMap.get(id) ?? null;
      };

      return invertV4Steps(value, docOnlySteps, {
        lookup: boundLookup,
      });
    });
  } else {
    const lazy = DOCUMENT_CHANGE_LAZY_V4.get(change);

    if (lazy) {
      attachLazyV4Steps(inverted, lazy.after, lazy.before, {
        isSetValued: lazy.isSetValued,
      });
    } else if (
      invertedRegisters &&
      changes.size === 0 &&
      createRoots.length === 0 &&
      deleteRoots.size === 0
    ) {
      DOCUMENT_CHANGE_V4_STEPS.set(inverted, invertedRegisters);
    }
  }

  return inverted;
};

export const documentChangeBetween = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  options: Readonly<{
    emptySetsAsValues?: boolean;
    isSetValued?: DocumentSetPropertyResolver;
  }>
) => {
  const roots = new Set([
    'main',
    ...visitRootNames(before.roots),
    ...visitRootNames(after.roots),
  ]);
  const changes = new Map<string, RootChange>();
  const classifications = new Map<string, DocumentChangeRootClassification>();
  const createRoots = new Set<string>();
  const deleteRoots = new Set<string>();

  for (const root of roots) {
    const beforeDocument = valueRootIndex(before, root);
    const afterDocument = valueRootIndex(after, root);
    const change = RootChange.betweenChangedBlocks(
      beforeDocument,
      afterDocument,
      {
        ...options,
        root: root === 'main' ? null : root,
      }
    );

    if (!change.empty) {
      changes.set(root, change);
      classifications.set(
        root,
        classifyRootChange(change, beforeDocument, afterDocument)
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

  const allRecords = hasValueRecords(after)
    ? recordOpsBetween(getValueRecords(before), getValueRecords(after))
    : NO_RECORD_OPS;
  const records = allRecords.has(V4_REGISTER_SET)
    ? filterRecordOps(allRecords, (set) => set !== V4_REGISTER_SET)
    : allRecords;
  const registerSteps = allRecords.has(V4_REGISTER_SET)
    ? extractRegisterSteps(before, after)
    : [];

  const created = createInternalDocumentChange(changes, {
    classifications,
    createRoots,
    deleteRoots,
    records,
  });

  if (registerSteps.length > 0) {
    DOCUMENT_CHANGE_REGISTER_STEPS.set(created, Object.freeze(registerSteps));
    if (
      changes.size === 0 &&
      createRoots.size === 0 &&
      deleteRoots.size === 0
    ) {
      DOCUMENT_CHANGE_V4_STEPS.set(created, Object.freeze(registerSteps));

      return created;
    }
  }

  DOCUMENT_CHANGE_LAZY_V4.set(created, {
    after,
    before,
    isSetValued: options.isSetValued,
  });

  return created;
};

/** @internal */
export type ConflictRecords = ReadonlyArray<
  Readonly<{ id: string; set: string }>
>;

/** @internal */
export type DocumentChangeConflict =
  | Readonly<{ kind: 'record'; records: ConflictRecords }>
  | Readonly<{
      kind: 'root-lifecycle';
      records?: ConflictRecords;
      root: string;
    }>
  | Readonly<{
      kind: 'v4-escalation';
      reason: V4EscalationReason;
      records?: ConflictRecords;
    }>;

type RebasedPair = Readonly<{
  a: DocumentChange;
  b: DocumentChange;
  bOutcomes?: readonly V4StepOutcome[];
  keptWrap: KeptWrap | null;
}>;

/** @internal */
export type DocumentRebase =
  | DocumentChangeConflict
  | (RebasedPair & Readonly<{ kind: 'pair' }>);

type RebaseOptions = Readonly<{
  crossedMoves?: 'first-wins';
  isSetValued?: DocumentSetPropertyResolver;
  keepEqualEdits?: boolean;
  keepEqualInserts?: boolean;
  keepEqualMoves?: boolean;
  replay?: Readonly<{
    anchor?: boolean;
    canContain?: (parent: JsonNode, child: JsonNode) => boolean;
    carriesLift?: boolean;
    readBack?: ReadBack | null;
    pieceProps: (
      element: JsonNode,
      parent: readonly number[],
      root: string,
      nodes: NodeList
    ) => JsonRecord;
  }>;
}>;

const nodesHaveIds = (nodes: readonly JsonNode[]): boolean => {
  for (const node of nodes) {
    if (!isElementNode(node)) continue;
    if (typeof node.id !== 'string' || node.id.length === 0) return false;
    if (!nodesHaveIds(node.children)) return false;
  }

  return true;
};

const allElementsHaveIds = (value: JsonEditorValue): boolean => {
  if (!nodesHaveIds(value.children)) return false;
  if (value.roots) {
    for (const root of visitRootNames(value.roots)) {
      const nodes = value.roots[root];

      if (nodes && !nodesHaveIds(nodes)) return false;
    }
  }

  return true;
};

const tryV4StepsOf = (
  change: DocumentChange,
  base: JsonEditorValue,
  isSetValued?: DocumentSetPropertyResolver
): readonly V4Step[] | null => {
  const existing = getV4Steps(change);

  if (existing !== null) return existing;
  try {
    return extractV4Between(base, change.apply(base), { isSetValued });
  } catch {
    return null;
  }
};

const idToRootMap = (value: JsonEditorValue): ReadonlyMap<string, string> => {
  const map = new Map<string, string>();
  const walk = (root: string, nodes: readonly JsonNode[]) => {
    for (const node of nodes) {
      if (!isElementNode(node)) continue;
      if (typeof node.id === 'string' && node.id.length > 0) {
        map.set(node.id, root);
      }
      walk(root, node.children);
    }
  };

  walk('main', value.children);
  if (value.roots) {
    for (const root of visitRootNames(value.roots)) {
      walk(root, value.roots[root]);
    }
  }

  return map;
};

const stepTouchedIds = (step: V4Step): readonly string[] => {
  switch (step.op) {
    case 'insert_text':
    case 'delete_text':
    case 'format_text':
    case 'wrap_inline': {
      return [step.target];
    }
    case 'unwrap_inline': {
      return [step.parent, step.id];
    }
    case 'set_props':
    case 'remove_node':
    case 'split_node': {
      return [step.id];
    }
    case 'join_nodes': {
      return [step.target, step.source];
    }
    case 'insert_node': {
      return 'id' in step.to ? [step.to.id] : [];
    }
    case 'move_node': {
      return 'id' in step.to ? [step.id, step.to.id] : [step.id];
    }
    default: {
      return [];
    }
  }
};

const touchesRoot = (
  change: DocumentChange,
  root: string,
  value?: JsonEditorValue,
  idRoots?: () => ReadonlyMap<string, string>
) => {
  if (
    change.createRoots.has(root) ||
    change.deleteRoots.has(root) ||
    !!getInternalDocumentRootChange(change, root)
  ) {
    return true;
  }

  if (UNBOUND_V4_CHANGES.has(change)) {
    const steps = DOCUMENT_CHANGE_V4_STEPS.get(change) ?? [];

    for (const step of steps) {
      if (
        (step.op === 'create_root' || step.op === 'delete_root') &&
        step.root === root
      ) {
        return true;
      }
      if (
        (step.op === 'insert_node' || step.op === 'move_node') &&
        'root' in step.to &&
        step.to.root === root
      ) {
        return true;
      }
      if (value && idRoots) {
        for (const id of stepTouchedIds(step)) {
          if (idRoots().get(id) === root) return true;
        }
      }
    }
  }

  return false;
};

const lifecycleConflictOf = (
  a: DocumentChange,
  b: DocumentChange,
  value?: JsonEditorValue
): Extract<DocumentChangeConflict, { kind: 'root-lifecycle' }> | null => {
  const candidates = [
    ...a.createRoots,
    ...a.deleteRoots,
    ...b.createRoots,
    ...b.deleteRoots,
  ];

  if (candidates.length === 0) return null;

  let cachedIdRoots: ReadonlyMap<string, string> | null = null;
  const getIdRoots = () => {
    if (!cachedIdRoots) cachedIdRoots = value ? idToRootMap(value) : new Map();

    return cachedIdRoots;
  };

  for (const root of candidates) {
    if (
      touchesRoot(a, root, value, getIdRoots) &&
      touchesRoot(b, root, value, getIdRoots)
    ) {
      return { kind: 'root-lifecycle', root };
    }
  }

  return null;
};

const recordsRebasedOf = (a: DocumentChange, b: DocumentChange) =>
  transformRecordOps(
    getInternalDocumentChangeRecords(a),
    getInternalDocumentChangeRecords(b)
  );

/** @internal */
export const unequalRecordPuts = (
  a: DocumentChange,
  b: DocumentChange
): ConflictRecords => recordsRebasedOf(a, b).unequal;

const rebasedPair = (
  a: DocumentChange,
  b: DocumentChange,
  value: JsonEditorValue,
  {
    crossedMoves,
    keepEqualEdits = false,
    keepEqualInserts,
    keepEqualMoves,
    replay,
  }: RebaseOptions,
  records: Readonly<{ first: RecordOps; second: RecordOps }>
): RebasedPair => {
  const roots = new Set([
    ...[...getInternalDocumentChangeEntries(a)].map(([root]) => root),
    ...[...getInternalDocumentChangeEntries(b)].map(([root]) => root),
  ]);
  const aChanges = new Map<string, RootChange>();
  const bChanges = new Map<string, RootChange>();
  const stepFirstAt = replay
    ? getInternalDocumentChangeStepFirstAt(a)
    : undefined;
  let restStepFirstAt: Map<string, ReadonlySet<number>> | undefined;
  let keptWrap: KeptWrap | null = null;

  for (const root of roots) {
    const aChange = getInternalDocumentRootChange(a, root);
    const bChange = getInternalDocumentRootChange(b, root);
    const rootStepFirstAt = stepFirstAt?.get(root);

    if (aChange && bChange) {
      if (rootStepFirstAt) withRootChangeStepFirstAt(aChange, rootStepFirstAt);

      const document = valueRootIndex(value, root);
      const transformed = RootChange.transformInDocument(
        aChange,
        bChange,
        document,
        {
          crossedMoves,
          keepEqualEdits,
          keepEqualInserts,
          keepEqualMoves,
          replay: replay && {
            anchor: replay.anchor,
            canContain: replay.canContain,
            carriesLift: replay.carriesLift,
            pieceProps: (element, parent, nodes) =>
              replay.pieceProps(element, parent, root, nodes),
            readBack: replay.readBack,
          },
        }
      );

      keptWrap ??= transformed.keptWrap ?? null;
      if (!transformed.a.empty) {
        aChanges.set(root, transformed.a);
        const nextRootStepFirstAt = propagateRootStepFirstAt(
          aChange,
          bChange,
          rootStepFirstAt
        );

        if (nextRootStepFirstAt?.size) {
          restStepFirstAt ??= new Map();
          restStepFirstAt.set(root, nextRootStepFirstAt);
        }
      }
      if (!transformed.b.empty) bChanges.set(root, transformed.b);
    } else if (aChange) {
      aChanges.set(root, aChange);
      if (rootStepFirstAt?.size) {
        restStepFirstAt ??= new Map();
        restStepFirstAt.set(root, rootStepFirstAt);
      }
    } else if (bChange) {
      bChanges.set(root, bChange);
    }
  }

  const rebasedA = createInternalDocumentChange(aChanges, {
    createRoots: a.createRoots,
    deleteRoots: a.deleteRoots,
    records: records.first,
  });
  const rebasedB = createInternalDocumentChange(bChanges, {
    createRoots: b.createRoots,
    deleteRoots: b.deleteRoots,
    records: records.second,
  });

  const aRegisters = getV4RegisterSteps(a);
  const bRegisters = getV4RegisterSteps(b);

  if (aRegisters.length > 0 || bRegisters.length > 0) {
    const regRebase = rebaseV4Changes(value, aRegisters, bRegisters);

    if (regRebase.ok) {
      const nextAReg = regRebase.aPrime.filter(
        (step): step is V4RegisterStep => step.op === 'set_register'
      );
      const nextBReg = regRebase.bPrime.filter(
        (step): step is V4RegisterStep => step.op === 'set_register'
      );

      if (nextAReg.length > 0) {
        DOCUMENT_CHANGE_REGISTER_STEPS.set(rebasedA, Object.freeze(nextAReg));
        if (
          aChanges.size === 0 &&
          a.createRoots.size === 0 &&
          a.deleteRoots.size === 0
        ) {
          DOCUMENT_CHANGE_V4_STEPS.set(rebasedA, Object.freeze(nextAReg));
        }
      }
      if (nextBReg.length > 0) {
        DOCUMENT_CHANGE_REGISTER_STEPS.set(rebasedB, Object.freeze(nextBReg));
        if (
          bChanges.size === 0 &&
          b.createRoots.size === 0 &&
          b.deleteRoots.size === 0
        ) {
          DOCUMENT_CHANGE_V4_STEPS.set(rebasedB, Object.freeze(nextBReg));
        }
      }
    }
  }

  if (restStepFirstAt?.size) {
    withInternalDocumentChangeStepFirstAt(rebasedA, restStepFirstAt);
  }

  return {
    a: rebasedA,
    b: rebasedB,
    keptWrap,
  };
};

/** @internal */
export const rebaseDocumentChange = (
  a: DocumentChange,
  b: DocumentChange,
  value: JsonEditorValue,
  options: RebaseOptions = {}
): DocumentRebase => {
  const records = recordsRebasedOf(a, b);
  const lifecycle = lifecycleConflictOf(a, b, value);

  if (lifecycle) {
    return records.unequal.length > 0
      ? { ...lifecycle, records: records.unequal }
      : lifecycle;
  }
  if (records.unequal.length > 0) {
    return { kind: 'record', records: records.unequal };
  }

  if (allElementsHaveIds(value)) {
    const aSteps = tryV4StepsOf(a, value, options.isSetValued);
    const bSteps = tryV4StepsOf(b, value, options.isSetValued);

    if (aSteps !== null && bSteps !== null) {
      const res = rebaseV4Changes(value, aSteps, bSteps);

      if (!res.ok) {
        if (res.reason === 'root-conflict') {
          const conflictingRoot =
            [
              ...a.createRoots,
              ...a.deleteRoots,
              ...b.createRoots,
              ...b.deleteRoots,
            ][0] ?? 'main';

          return { kind: 'root-lifecycle', root: conflictingRoot };
        }

        return { kind: 'v4-escalation', reason: res.reason };
      }

      return {
        a: createV4DocumentChange(res.aPrime, { records: records.first }),
        b: createV4DocumentChange(res.bPrime, { records: records.second }),
        bOutcomes: res.bOutcomes,
        keptWrap: null,
        kind: 'pair',
      };
    }
  }

  return { kind: 'pair', ...rebasedPair(a, b, value, options, records) };
};

/** @internal */
export const transformInternalDocumentChange = (
  a: DocumentChange,
  b: DocumentChange,
  value: JsonEditorValue,
  options: RebaseOptions & Readonly<{ keepRecordWrites?: boolean }> = {}
): RebasedPair => {
  const lifecycle = lifecycleConflictOf(a, b, value);

  if (lifecycle) {
    throw new Error(
      `Cannot transform concurrent root lifecycle changes for ${lifecycle.root}.`
    );
  }

  const records = options.keepRecordWrites
    ? {
        first: getInternalDocumentChangeRecords(a),
        second: getInternalDocumentChangeRecords(b),
      }
    : recordsRebasedOf(a, b);

  if (options.replay && allElementsHaveIds(value)) {
    const aSteps = tryV4StepsOf(a, value, options.isSetValued);
    const bSteps = tryV4StepsOf(b, value, options.isSetValued);

    if (aSteps !== null && bSteps !== null) {
      const joined = rebaseV4JoinOverSiblingRemoval(value, aSteps, bSteps);

      if (joined) {
        return {
          a: createV4DocumentChange(joined.aPrime, { records: records.first }),
          b: createV4DocumentChange(joined.bPrime, { records: records.second }),
          keptWrap: null,
        };
      }
    }
  }

  return rebasedPair(a, b, value, options, records);
};

export const applyDocumentChangeValue = <T extends JsonEditorValue>(
  change: DocumentChange,
  value: T,
  indexedAfter: ReadonlyMap<string, DocumentIndex> = new Map(),
  recordsAfter?: RecordStore
) => {
  let children: DocumentIndex | readonly JsonNode[] =
    lazyRootOf(value, 'children') ?? value.children;
  let roots = value.roots ? copyRoots({}, value.roots) : undefined;

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const next =
      indexedAfter.get(root) ?? rootChange.apply(valueRootIndex(value, root));

    if (root === 'main') {
      children = next;
    } else {
      roots ??= {};
      setLazyRoot(roots, root, next);
    }
  }

  for (const root of change.createRoots) {
    roots ??= {};
    if (!Object.hasOwn(roots, root)) roots[root] = Object.freeze([]);
  }

  for (const root of change.deleteRoots) {
    if (roots) delete roots[root];
  }

  if (roots && !hasRootNames(roots)) {
    roots = undefined;
  }

  const records = getInternalDocumentChangeRecords(change);
  const registerSteps = getV4RegisterSteps(change);
  const nextValue: Record<string, unknown> = {};

  // Every field but records, whose read may serialize them: the store beside
  // the value carries them.
  for (const key of Object.keys(value)) {
    if (key === 'children') setChildren(nextValue, children);
    else if (key === 'roots') {
      if (roots !== undefined) nextValue.roots = roots;
    } else if (key !== 'records') nextValue[key] = value[key];
  }
  if (!Object.hasOwn(nextValue, 'children')) setChildren(nextValue, children);
  if (roots !== undefined) nextValue.roots = roots;
  if (records.size > 0 || registerSteps.length > 0 || hasValueRecords(value)) {
    let nextRecords = recordsAfter;

    if (nextRecords === undefined) {
      const baseRecords = getValueRecords(value);
      const afterRegisters =
        registerSteps.length > 0
          ? applyV4RegisterSteps(baseRecords, registerSteps)
          : baseRecords;

      nextRecords =
        records.size > 0
          ? applyRecordOps(afterRegisters, records)
          : afterRegisters;
    }
    withValueRecords(nextValue, nextRecords);
  }

  return nextValue as T;
};

/**
 * Apply a change whose indexed results are already immutable.
 *
 * @internal
 */
export const applyDocumentChangeWithIndexes = <T extends JsonEditorValue>(
  change: DocumentChange,
  value: T,
  indexedAfter: ReadonlyMap<string, DocumentIndex>,
  recordsAfter?: RecordStore
): T => {
  const nextValue = applyDocumentChangeValue(
    change,
    value,
    indexedAfter,
    recordsAfter
  );

  if (nextValue.roots) Object.freeze(nextValue.roots);

  return Object.freeze(nextValue);
};

/**
 * `RootChange.aligned` for each root: the change from `before` to `after`
 * that keeps every letter and element token, or null when a root holds other
 * ones, a root comes or goes, or the records differ.
 *
 * @internal
 */
export const alignedDocumentChange = (
  before: JsonEditorValue,
  after: JsonEditorValue
) => {
  const roots = new Set([
    'main',
    ...visitRootNames(before.roots),
    ...visitRootNames(after.roots),
  ]);
  const changes = new Map<string, RootChange>();
  const classifications = new Map<string, DocumentChangeRootClassification>();

  if (!recordStoresEqual(getValueRecords(before), getValueRecords(after))) {
    return null;
  }
  for (const root of roots) {
    const from = valueRoot(before, root);
    const to = valueRoot(after, root);

    if (from === to) continue;
    if (
      root !== 'main' &&
      Object.hasOwn(before.roots ?? {}, root) !==
        Object.hasOwn(after.roots ?? {}, root)
    ) {
      return null;
    }

    const beforeDocument = valueRootIndex(before, root);
    const afterDocument = valueRootIndex(after, root);
    const change = RootChange.aligned(beforeDocument, afterDocument);

    if (!change) return null;
    if (!change.empty) {
      changes.set(root, change);
      classifications.set(
        root,
        classifyRootChange(change, beforeDocument, afterDocument)
      );
    }
  }

  const aligned = createInternalDocumentChange(changes, { classifications });

  DOCUMENT_CHANGE_LAZY_V4.set(aligned, { after, before });

  return aligned;
};
