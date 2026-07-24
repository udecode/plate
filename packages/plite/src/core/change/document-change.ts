import {
  classifyRootChange,
  type DocumentChangeRootClassification,
} from './classification';
import { DocumentIndex } from './document-index';
import {
  RootChange,
  type RootChangeJson,
  type DocumentSetPropertyResolver,
  type SectionData,
  type TrackMode,
} from './root-change';
import {
  deepFreeze,
  isRecord,
  type JsonEditorValue,
  jsonEqual,
  type JsonNode,
  type JsonPoint,
} from './tokens';
import type { NamedRootKey } from '../../interfaces/editor';
import { assertEditorJsonValue } from '../value-codec';

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

export type DocumentChangeJson = {
  createRoots?: readonly string[];
  deleteRoots?: readonly string[];
  primary?: RootChangeJson;
  roots?: Readonly<Record<string, RootChangeJson>>;
  version: 3;
};

export const unsafeDocumentRootKeys = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

export function assertDocumentRootKey(root: unknown): asserts root is string {
  if (
    typeof root !== 'string' ||
    root.length === 0 ||
    unsafeDocumentRootKeys.has(root)
  ) {
    throw new Error(`Invalid document root key ${String(root)}.`);
  }
}

export function assertNamedDocumentRootKey(
  root: unknown
): asserts root is string {
  assertDocumentRootKey(root);

  if (root === 'main') {
    throw new Error('[Plite] Omit root to target the primary document.');
  }
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

export const freezeReadonlySet = <T>(values: Iterable<T>): ReadonlySet<T> => {
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

export const valueRoot = (value: JsonEditorValue, root: string) =>
  root === 'main' ? value.children : (value.roots?.[root] ?? []);

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
  /** Derived classifications keyed only by named roots. */
  rootClassifications?: ReadonlyMap<string, DocumentChangeRootClassification>;
  /** Changes keyed only by named secondary roots. */
  roots?: ReadonlyMap<string, RootChange>;
}>;

type DocumentChangeRootState = Readonly<{
  primary: RootChange | null;
  roots: ReadonlyMap<string, RootChange>;
}>;

const DOCUMENT_CHANGE_ROOTS = new WeakMap<
  DocumentChange,
  DocumentChangeRootState
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
    /** Named secondary root. Omit for the primary root. */
    root?: NamedRootKey<TRoot>;
    track?: TrackMode;
  }>;

/** @internal Read one change through the private primary-root sentinel. */
export const getInternalDocumentRootChange = (
  change: DocumentChange,
  root: string
) => {
  const state = getDocumentChangeRootState(change);

  return root === 'main' ? (state.primary ?? undefined) : state.roots.get(root);
};

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

/** @internal Test whether one internal root has a compact change. */
export const hasInternalDocumentChangeRoot = (
  change: DocumentChange,
  root: string
) => getInternalDocumentRootChange(change, root) !== undefined;

/** @internal List changed roots without exposing their compact changes. */
export const getInternalDocumentChangeRootKeys = (change: DocumentChange) =>
  Object.freeze(
    [...getInternalDocumentChangeEntries(change)].map(([root]) => root)
  );

/** @internal Read changed token ranges without exposing compact sections. */
export const getInternalDocumentChangeRanges = (
  change: DocumentChange,
  root: string
) => {
  const ranges: (readonly [number, number, number, number])[] = [];

  getInternalDocumentRootChange(change, root)?.iterChangedRanges((...range) => {
    ranges.push(Object.freeze(range));
  });

  return Object.freeze(ranges);
};

/** @internal Map one JSON point between transaction snapshots. */
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

/** @internal Iterate changes through the private primary-root sentinel. */
export function* getInternalDocumentChangeEntries(
  change: DocumentChange
): Generator<readonly [string, RootChange]> {
  const state = getDocumentChangeRootState(change);

  if (state.primary) yield ['main', state.primary];
  yield* state.roots;
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
  changes: ReadonlyMap<string, RootChange>,
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

  return constructDocumentChange({
    createRoots: options.createRoots,
    deleteRoots: options.deleteRoots,
    primary,
    primaryClassification,
    rootClassifications: classifications,
    roots,
  });
};

export type InternalRootChangeSection = Readonly<{
  after: readonly JsonNode[];
  before: readonly JsonNode[];
  from: number;
}>;

/**
 * @internal Build one sparse root change without exposing the compact root
 * algebra to sibling packages.
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

    const before = DocumentIndex.fromValue(section.before);
    const after = DocumentIndex.fromValue(section.after);
    const local = RootChange.between(before, after, {
      isSetValued,
      root: root === 'main' ? null : root,
    });

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
      dataIndex++;
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
    for (const root of input.roots?.keys() ?? []) {
      assertNamedDocumentRootKey(root);
    }

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
          assertNamedDocumentRootKey(root);

          return [root, classification] as const;
        })
        .filter(([root]) => roots.has(root))
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

    DOCUMENT_CHANGE_ROOTS.set(this, Object.freeze({ primary, roots }));
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
    const roots = new Set([
      'main',
      ...Object.keys(before.roots ?? {}),
      ...Object.keys(after.roots ?? {}),
    ]);
    const changes = new Map<string, RootChange>();
    const classifications = new Map<string, DocumentChangeRootClassification>();
    const createRoots = new Set<string>();
    const deleteRoots = new Set<string>();

    for (const root of roots) {
      const beforeDocument = DocumentIndex.fromValue(valueRoot(before, root));
      const afterDocument = DocumentIndex.fromValue(valueRoot(after, root));
      const change = RootChange.between(beforeDocument, afterDocument, {
        ...options,
        root: root === 'main' ? null : root,
      });

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

    return createInternalDocumentChange(changes, {
      classifications,
      createRoots,
      deleteRoots,
    });
  }

  get empty() {
    const state = getDocumentChangeRootState(this);

    return (
      state.primary === null &&
      state.roots.size === 0 &&
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
        Object.hasOwn(value, 'primary') ||
        Object.hasOwn(value, 'preserveEmptyRoots') ||
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
      const changeRoots = new Set(Object.keys(canonical.roots ?? {}));

      if (canonical.primary !== undefined) changeRoots.add('main');

      const primaryClassification = value.primaryClassification;

      if (primaryClassification !== null) {
        if (
          canonical.primary === undefined ||
          !isRecord(primaryClassification)
        ) {
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
        assertNamedDocumentRootKey(root);

        if (
          seenClassifications.has(root) ||
          !changeRoots.has(root) ||
          !isRecord(classification)
        ) {
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
        jsonEqual(createRoots, canonical.createRoots ?? []) &&
        jsonEqual(deleteRoots, canonical.deleteRoots ?? []) &&
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
        json.primary === undefined ? null : RootChange.fromJSON(json.primary),
      roots: new Map(
        Object.entries(json.roots ?? {}).map(([root, change]) => {
          assertNamedDocumentRootKey(root);

          return [root, RootChange.fromJSON(change)] as const;
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
    const aChanges = new Map<string, RootChange>();
    const bChanges = new Map<string, RootChange>();

    for (const root of roots) {
      const aChange = getInternalDocumentRootChange(a, root);
      const bChange = getInternalDocumentRootChange(b, root);

      if (aChange && bChange) {
        const document = DocumentIndex.fromValue(valueRoot(value, root));
        const transformed = RootChange.transformInDocument(
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
        !!getInternalDocumentRootChange(a, root);
      const bTouches =
        b.createRoots.has(root) ||
        b.deleteRoots.has(root) ||
        !!getInternalDocumentRootChange(b, root);

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
    const changes = new Map<string, RootChange>();
    const classifications = new Map<string, DocumentChangeRootClassification>();

    for (const root of roots) {
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

    const change = getInternalDocumentRootChange(this, root);
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
        const document = DocumentIndex.fromValue(valueRoot(value, root));

        return [root, change.invert(document)] as const;
      })
    );

    for (const root of createRoots) {
      const before = DocumentIndex.fromValue([]);
      const restored = DocumentIndex.fromValue(valueRoot(value, root));
      const restore = RootChange.between(before, restored);

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
    const state = getDocumentChangeRootState(this);

    return {
      ...(state.primary ? { primary: state.primary.toJSON() } : {}),
      ...(state.roots.size > 0
        ? {
            roots: Object.fromEntries(
              [...state.roots].map(([root, change]) => [root, change.toJSON()])
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

export const applyDocumentChangeValue = <T extends JsonEditorValue>(
  change: DocumentChange,
  value: T,
  indexedAfter: ReadonlyMap<string, DocumentIndex> = new Map()
) => {
  let children = value.children;
  let roots = value.roots ? { ...value.roots } : undefined;

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    const next =
      indexedAfter.get(root)?.value ??
      rootChange.apply(DocumentIndex.fromValue(valueRoot(value, root))).value;

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
  indexedAfter: ReadonlyMap<string, DocumentIndex>
): T => {
  const nextValue = applyDocumentChangeValue(change, value, indexedAfter);

  if (nextValue.roots) Object.freeze(nextValue.roots);

  return Object.freeze(nextValue);
};
