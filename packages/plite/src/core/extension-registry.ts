import type {
  Editor,
  EditorCommitListener,
  EditorCorrection,
  EditorEffectType,
  EditorExtensionReference,
  EditorFacet,
  EditorFacetProvider,
  EditorNodeChangeHandler,
  EditorSelectionSpec,
  EditorStateView,
  EditorStateField,
  EditorTextChangeHandler,
  EditorTransactionChangeHandler,
  EditorUpdateContext,
  EditorUpdateTransaction,
  ExtensionsOf,
  RegisteredEditorExtension,
  ValueOf,
} from '../interfaces/editor';
import type { CompiledEditorSchema } from './schema-compiler';
import {
  createSchemaContributionRegistry,
  finalizeSchemaContributionRegistry,
  mergeSchemaContributionRegistries,
  type EditorSchemaContributionRegistry,
} from './schema-contribution-registry';

type EditorStateGroupFactory<TEditor extends Editor> = (
  state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>,
  editor: TEditor
) => unknown;

type EditorTxGroupFactory<TEditor extends Editor> = (
  tx: EditorUpdateTransaction<ValueOf<TEditor>, ExtensionsOf<TEditor>>,
  editor: TEditor,
  context: EditorUpdateContext<TEditor>
) => unknown;

export type EditorStateGroupRegistration<TEditor extends Editor = Editor> =
  Readonly<{
    extensionName: string;
    factory: EditorStateGroupFactory<TEditor>;
  }>;

export type EditorTxGroupRegistration<TEditor extends Editor = Editor> =
  Readonly<{
    extensionName: string;
    factory: EditorTxGroupFactory<TEditor>;
  }>;

export type CompiledCommandPipeline = Readonly<{
  descriptor: object;
  entries: readonly unknown[];
  hasAround: boolean;
  id: string;
}>;

export type CompiledCommandRegistry = Readonly<{
  byDescriptor: ReadonlyMap<object, CompiledCommandPipeline>;
  byId: ReadonlyMap<string, object>;
  revision: number;
}>;

export type CompiledReadPipeline = Readonly<{
  descriptor: object;
  entries: readonly unknown[];
  id: string;
}>;

export type CompiledReadRegistry = Readonly<{
  byDescriptor: ReadonlyMap<object, CompiledReadPipeline>;
  byId: ReadonlyMap<string, object>;
  revision: number;
}>;

export type ExtensionRegistry<TEditor extends Editor = Editor> = {
  apiGroups: Map<string, unknown[]>;
  commands: CompiledCommandRegistry;
  commitListeners: Set<EditorCommitListener<ValueOf<TEditor>>>;
  configurationRevision: number;
  contributions: Map<object, EditorExtensionContributionRegistration[]>;
  dependencyOrder: readonly EditorExtensionReference[];
  effectTypes: Map<string, EditorEffectTypeRegistration>;
  extensions: Map<string, RegisteredEditorExtension>;
  extensionsByDescriptor: Map<
    EditorExtensionReference,
    RegisteredEditorExtension
  >;
  facets: Map<string, EditorFacetProvider[]>;
  nodeChangeListeners: Set<EditorNodeChangeHandler<TEditor>>;
  corrections: Map<string, EditorCorrection<TEditor>>;
  reads: CompiledReadRegistry;
  schemaContributions: EditorSchemaContributionRegistry;
  schemaRevision: number;
  selectionSpecs: Map<string, EditorSelectionSpecRegistration>;
  stateGroups: Map<string, EditorStateGroupRegistration<TEditor>>;
  stateFieldIdentities: Map<string, EditorStateField<any>>;
  stateFields: Map<string, EditorStateFieldRegistration>;
  textChangeListeners: Set<EditorTextChangeHandler<TEditor>>;
  transactionChangeListeners: Set<EditorTransactionChangeHandler<TEditor>>;
  txGroups: Map<string, EditorTxGroupRegistration<TEditor>>;
};

type ExtensionRegistryStore = {
  base: ExtensionRegistry;
  baseInitialized: boolean;
  configured: ExtensionRegistry;
  current: ExtensionRegistry;
  publishing: boolean;
};

export type EditorEffectTypeRegistration = Readonly<{
  extensionName: string;
  type: EditorEffectType;
}>;

export type EditorStateFieldRegistration = Readonly<{
  extensionName: string;
  field: EditorStateField<any>;
}>;

export type EditorSelectionSpecRegistration = Readonly<{
  extensionName: string;
  spec: EditorSelectionSpec;
}>;

export type EditorExtensionContributionRegistration = Readonly<{
  owner: object;
  sourceIndex: number;
  value: unknown;
}>;

const EXTENSION_REGISTRIES = new WeakMap<Editor, ExtensionRegistryStore>();

const reservedStateGroupNames = new Set([
  'marks',
  'nodes',
  'points',
  'ranges',
  'schema',
  'selection',
  'text',
  'value',
]);

const reservedTxGroupNames = new Set([...reservedStateGroupNames, 'roots']);

export const createExtensionRegistry = <TEditor extends Editor = Editor>(
  options: Readonly<{
    configurationRevision?: number;
    schemaRevision?: number;
    stateFieldIdentities?: ReadonlyMap<string, EditorStateField<any>>;
  }> = {}
): ExtensionRegistry<TEditor> => ({
  apiGroups: new Map(),
  commands: {
    byDescriptor: new Map(),
    byId: new Map(),
    revision: options.configurationRevision ?? 0,
  },
  commitListeners: new Set(),
  configurationRevision: options.configurationRevision ?? 0,
  contributions: new Map(),
  dependencyOrder: [],
  effectTypes: new Map(),
  extensions: new Map(),
  extensionsByDescriptor: new Map(),
  facets: new Map(),
  nodeChangeListeners: new Set(),
  corrections: new Map(),
  reads: {
    byDescriptor: new Map(),
    byId: new Map(),
    revision: options.configurationRevision ?? 0,
  },
  schemaContributions: createSchemaContributionRegistry(
    options.schemaRevision ?? 0
  ),
  schemaRevision: options.schemaRevision ?? 0,
  selectionSpecs: new Map(),
  stateGroups: new Map(),
  stateFieldIdentities: new Map(options.stateFieldIdentities),
  stateFields: new Map(),
  textChangeListeners: new Set(),
  transactionChangeListeners: new Set(),
  txGroups: new Map(),
});

const immutableCollectionMutation = () => {
  throw new Error('Published editor extension registries are immutable.');
};

const freezeMap = <TKey, TValue>(source: ReadonlyMap<TKey, TValue>) => {
  const map = new Map(source);
  let immutable!: Map<TKey, TValue>;

  immutable = new Proxy(map, {
    get(target, property) {
      if (property === 'clear' || property === 'delete' || property === 'set') {
        return immutableCollectionMutation;
      }
      if (property === 'forEach') {
        return (
          callback: (value: TValue, key: TKey, map: Map<TKey, TValue>) => void,
          thisArg?: unknown
        ) =>
          target.forEach((value, key) => {
            callback.call(thisArg, value, key, immutable);
          });
      }

      const value = Reflect.get(target, property, target);

      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  return Object.freeze(immutable);
};

const freezeSet = <TValue>(source: ReadonlySet<TValue>) => {
  const set = new Set(source);
  let immutable!: Set<TValue>;

  immutable = new Proxy(set, {
    get(target, property) {
      if (property === 'add' || property === 'clear' || property === 'delete') {
        return immutableCollectionMutation;
      }
      if (property === 'forEach') {
        return (
          callback: (value: TValue, key: TValue, set: Set<TValue>) => void,
          thisArg?: unknown
        ) =>
          target.forEach((value) => {
            callback.call(thisArg, value, value, immutable);
          });
      }

      const value = Reflect.get(target, property, target);

      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  return Object.freeze(immutable);
};

const freezeArrayMap = <TKey, T>(source: ReadonlyMap<TKey, readonly T[]>) =>
  freezeMap(
    new Map(
      [...source].map(([key, values]) => [
        key,
        Object.freeze([...values]) as T[],
      ])
    )
  );

const finalizeCommandRegistry = (
  registry: CompiledCommandRegistry
): CompiledCommandRegistry =>
  Object.freeze({
    byDescriptor: freezeMap(
      new Map(
        [...registry.byDescriptor].map(([descriptor, pipeline]) => [
          descriptor,
          Object.freeze({
            ...pipeline,
            entries: Object.freeze([...pipeline.entries]),
          }),
        ])
      )
    ),
    byId: freezeMap(registry.byId),
    revision: registry.revision,
  });

const finalizeReadRegistry = (
  registry: CompiledReadRegistry
): CompiledReadRegistry =>
  Object.freeze({
    byDescriptor: freezeMap(
      new Map(
        [...registry.byDescriptor].map(([descriptor, pipeline]) => [
          descriptor,
          Object.freeze({
            ...pipeline,
            entries: Object.freeze([...pipeline.entries]),
          }),
        ])
      )
    ),
    byId: freezeMap(registry.byId),
    revision: registry.revision,
  });

/** Freeze a detached registry after all declarations have been validated. */
export const finalizeExtensionRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>
): ExtensionRegistry<TEditor> =>
  Object.freeze({
    ...registry,
    apiGroups: freezeArrayMap(registry.apiGroups),
    commands: finalizeCommandRegistry(registry.commands),
    commitListeners: freezeSet(registry.commitListeners),
    contributions: freezeArrayMap(registry.contributions),
    dependencyOrder: Object.freeze([...registry.dependencyOrder]),
    effectTypes: freezeMap(registry.effectTypes),
    extensions: freezeMap(registry.extensions),
    extensionsByDescriptor: freezeMap(registry.extensionsByDescriptor),
    facets: freezeArrayMap(registry.facets),
    nodeChangeListeners: freezeSet(registry.nodeChangeListeners),
    corrections: freezeMap(registry.corrections),
    reads: finalizeReadRegistry(registry.reads),
    schemaContributions: finalizeSchemaContributionRegistry(
      registry.schemaContributions
    ),
    selectionSpecs: freezeMap(registry.selectionSpecs),
    stateGroups: freezeMap(registry.stateGroups),
    stateFieldIdentities: freezeMap(registry.stateFieldIdentities),
    stateFields: freezeMap(registry.stateFields),
    textChangeListeners: freezeSet(registry.textChangeListeners),
    transactionChangeListeners: freezeSet(registry.transactionChangeListeners),
    txGroups: freezeMap(registry.txGroups),
  });

const mergeArrayMap = <TKey, T>(
  configured: ReadonlyMap<TKey, readonly T[]>,
  base: ReadonlyMap<TKey, readonly T[]>
) => {
  const result = new Map<TKey, T[]>();

  for (const key of new Set([...configured.keys(), ...base.keys()])) {
    result.set(key, [...(configured.get(key) ?? []), ...(base.get(key) ?? [])]);
  }

  return result;
};

const assertExtensionPointIdentities = (points: Iterable<object>): void => {
  const pointsById = new Map<string, object>();

  for (const point of points) {
    const id = (point as Readonly<{ id: string }>).id;
    const known = pointsById.get(id);

    if (known && known !== point) {
      throw new Error(
        `Editor extension point id "${id}" cannot install multiple descriptor identities.`
      );
    }
    pointsById.set(id, point);
  }
};

const mergeCommandRegistries = (
  configured: CompiledCommandRegistry,
  base: CompiledCommandRegistry,
  revision: number
): CompiledCommandRegistry => {
  const descriptorsById = new Map<string, object>();

  for (const descriptor of [
    ...configured.byDescriptor.keys(),
    ...base.byDescriptor.keys(),
  ]) {
    const id = (descriptor as Readonly<{ id: string }>).id;
    const known = descriptorsById.get(id);

    if (known && known !== descriptor) {
      throw new Error(
        `Editor command id "${id}" cannot install multiple descriptor identities.`
      );
    }
    descriptorsById.set(id, descriptor);
  }

  const entriesByDescriptor = mergeArrayMap(
    new Map(
      [...configured.byDescriptor].map(([descriptor, pipeline]) => [
        descriptor,
        pipeline.entries,
      ])
    ),
    new Map(
      [...base.byDescriptor].map(([descriptor, pipeline]) => [
        descriptor,
        pipeline.entries,
      ])
    )
  );

  return {
    byDescriptor: new Map(
      [...entriesByDescriptor].map(([descriptor, entries]) => [
        descriptor,
        {
          descriptor,
          entries,
          hasAround: entries.some(
            (entry) => (entry as Readonly<{ kind?: string }>).kind === 'around'
          ),
          id: (descriptor as Readonly<{ id: string }>).id,
        },
      ])
    ),
    byId: descriptorsById,
    revision,
  };
};

const mergeReadRegistries = (
  configured: CompiledReadRegistry,
  base: CompiledReadRegistry,
  revision: number
): CompiledReadRegistry => {
  const descriptorsById = new Map<string, object>();

  for (const descriptor of [
    ...configured.byDescriptor.keys(),
    ...base.byDescriptor.keys(),
  ]) {
    const id = (descriptor as Readonly<{ id: string }>).id;
    const known = descriptorsById.get(id);

    if (known && known !== descriptor) {
      throw new Error(
        `Editor read id "${id}" cannot install multiple descriptor identities.`
      );
    }
    descriptorsById.set(id, descriptor);
  }

  const entriesByDescriptor = mergeArrayMap(
    new Map(
      [...configured.byDescriptor].map(([descriptor, pipeline]) => [
        descriptor,
        pipeline.entries,
      ])
    ),
    new Map(
      [...base.byDescriptor].map(([descriptor, pipeline]) => [
        descriptor,
        pipeline.entries,
      ])
    )
  );

  return {
    byDescriptor: new Map(
      [...entriesByDescriptor].map(([descriptor, entries]) => [
        descriptor,
        {
          descriptor,
          entries,
          id: (descriptor as Readonly<{ id: string }>).id,
        },
      ])
    ),
    byId: descriptorsById,
    revision,
  };
};

const assertNoMapConflicts = (
  kind: string,
  configured: ReadonlyMap<string, unknown>,
  base: ReadonlyMap<string, unknown>
) => {
  for (const key of configured.keys()) {
    if (base.has(key)) {
      throw new Error(
        `Configured editor ${kind} "${key}" conflicts with a built-in resource.`
      );
    }
  }
};

const mergeRegistries = (
  configured: ExtensionRegistry,
  base: ExtensionRegistry,
  previousSchemaContributions: EditorSchemaContributionRegistry | null = null
): ExtensionRegistry => {
  assertExtensionPointIdentities([
    ...configured.contributions.keys(),
    ...base.contributions.keys(),
  ]);
  assertNoMapConflicts('effect', configured.effectTypes, base.effectTypes);
  assertNoMapConflicts(
    'selection kind',
    configured.selectionSpecs,
    base.selectionSpecs
  );
  assertNoMapConflicts('state group', configured.stateGroups, base.stateGroups);
  assertNoMapConflicts('state field', configured.stateFields, base.stateFields);
  assertNoMapConflicts('transaction group', configured.txGroups, base.txGroups);

  const stateFieldIdentities = new Map(configured.stateFieldIdentities);

  base.stateFieldIdentities.forEach((field, key) => {
    const known = stateFieldIdentities.get(key);

    if (known && known !== field) {
      throw new Error(
        `State field "${key}" does not match the stable descriptor identity already known by this editor.`
      );
    }
    stateFieldIdentities.set(key, field);
  });

  for (const [key, providers] of configured.facets) {
    const configuredFacet = providers[0]?.facet;
    const baseFacet = base.facets.get(key)?.[0]?.facet;

    if (configuredFacet && baseFacet && configuredFacet !== baseFacet) {
      throw new Error(
        `Editor facet "${key}" cannot install multiple descriptor identities.`
      );
    }
  }

  return finalizeExtensionRegistry({
    apiGroups: mergeArrayMap(configured.apiGroups, base.apiGroups),
    commands: mergeCommandRegistries(
      configured.commands,
      base.commands,
      configured.configurationRevision
    ),
    commitListeners: new Set([
      ...configured.commitListeners,
      ...base.commitListeners,
    ]),
    configurationRevision: configured.configurationRevision,
    contributions: mergeArrayMap(configured.contributions, base.contributions),
    dependencyOrder: [...configured.dependencyOrder],
    effectTypes: new Map([...configured.effectTypes, ...base.effectTypes]),
    extensions: new Map(configured.extensions),
    extensionsByDescriptor: new Map(configured.extensionsByDescriptor),
    facets: mergeArrayMap(configured.facets, base.facets),
    nodeChangeListeners: new Set([
      ...configured.nodeChangeListeners,
      ...base.nodeChangeListeners,
    ]),
    corrections: new Map([...configured.corrections, ...base.corrections]),
    reads: mergeReadRegistries(
      configured.reads,
      base.reads,
      configured.configurationRevision
    ),
    schemaContributions: mergeSchemaContributionRegistries(
      configured.schemaContributions,
      base.schemaContributions,
      Math.max(configured.schemaRevision, base.schemaRevision),
      previousSchemaContributions
    ),
    schemaRevision: Math.max(configured.schemaRevision, base.schemaRevision),
    selectionSpecs: new Map([
      ...configured.selectionSpecs,
      ...base.selectionSpecs,
    ]),
    stateGroups: new Map([...configured.stateGroups, ...base.stateGroups]),
    stateFieldIdentities,
    stateFields: new Map([...configured.stateFields, ...base.stateFields]),
    textChangeListeners: new Set([
      ...configured.textChangeListeners,
      ...base.textChangeListeners,
    ]),
    transactionChangeListeners: new Set([
      ...configured.transactionChangeListeners,
      ...base.transactionChangeListeners,
    ]),
    txGroups: new Map([...configured.txGroups, ...base.txGroups]),
  });
};

const createExtensionRegistryStore = (): ExtensionRegistryStore => {
  const base = finalizeExtensionRegistry(createExtensionRegistry());
  const configured = finalizeExtensionRegistry(createExtensionRegistry());

  return {
    base,
    baseInitialized: false,
    configured,
    current: mergeRegistries(configured, base),
    publishing: false,
  };
};

const getExtensionRegistryStore = (editor: Editor) => {
  let store = EXTENSION_REGISTRIES.get(editor);

  if (!store) {
    store = createExtensionRegistryStore();
    EXTENSION_REGISTRIES.set(editor, store);
  }

  return store;
};

export const assertEditorExtensionPublicationInactive = (editor: Editor) => {
  if (getExtensionRegistryStore(editor).publishing) {
    throw new Error(
      'editor writes cannot be started during extension lifecycle publication'
    );
  }
};

export const getExtensionRegistry = <TEditor extends Editor>(
  editor: TEditor
): ExtensionRegistry<TEditor> =>
  getExtensionRegistryStore(editor).current as ExtensionRegistry<TEditor>;

/** Canonical compiled schema for the current editor configuration. */
export const getCompiledEditorSchema = (editor: Editor): CompiledEditorSchema =>
  getExtensionRegistry(editor).schemaContributions.compiled;

export const getConfiguredExtensionRegistry = <TEditor extends Editor>(
  editor: TEditor
): ExtensionRegistry<TEditor> =>
  getExtensionRegistryStore(editor).configured as ExtensionRegistry<TEditor>;

export const validateConfiguredExtensionRegistry = <TEditor extends Editor>(
  editor: TEditor,
  registry: ExtensionRegistry<TEditor>,
  previousSchemaContributions?: EditorSchemaContributionRegistry
) =>
  mergeRegistries(
    registry as ExtensionRegistry,
    getExtensionRegistryStore(editor).base,
    previousSchemaContributions ??
      getExtensionRegistryStore(editor).current.schemaContributions
  ) as ExtensionRegistry<TEditor>;

export const initializeBaseExtensionRegistry = <TEditor extends Editor>(
  editor: TEditor,
  registry: ExtensionRegistry<TEditor>
) => {
  const store = getExtensionRegistryStore(editor);

  if (!Object.isFrozen(registry)) {
    throw new Error('Editor base extension registry must be finalized.');
  }
  if (store.baseInitialized) {
    throw new Error('Editor base extension registry is already initialized.');
  }

  store.base = registry as ExtensionRegistry;
  store.baseInitialized = true;
  store.current = mergeRegistries(store.configured, store.base);
};

export const runWithEditorExtensionPublicationGuard = <T>(
  editor: Editor,
  fn: () => T
): T => {
  const store = getExtensionRegistryStore(editor);

  if (store.publishing) {
    throw new Error('Editor extension registry publication cannot re-enter.');
  }

  store.publishing = true;
  try {
    return fn();
  } finally {
    store.publishing = false;
  }
};

export type PublishedConfiguredExtensionRegistry = Readonly<{
  finalize: (beforeFinalize?: () => void) => void;
  rollback: (beforeRollback?: () => void) => void;
}>;

export const publishConfiguredExtensionRegistry = <TEditor extends Editor>(
  editor: TEditor,
  registry: ExtensionRegistry<TEditor>,
  afterPublish: () => void = () => {}
): PublishedConfiguredExtensionRegistry => {
  const store = getExtensionRegistryStore(editor);

  if (!Object.isFrozen(registry)) {
    throw new Error('Editor extension registry candidates must be finalized.');
  }
  if (store.publishing) {
    throw new Error('Editor extension registry publication cannot re-enter.');
  }

  const configured = registry as ExtensionRegistry;
  const previousConfigured = store.configured;
  const previousCurrent = store.current;
  const current = mergeRegistries(
    configured,
    store.base,
    previousCurrent.schemaContributions
  );
  let publishedConfigured = configured;
  let publishedCurrent = current;
  let active = true;

  store.publishing = true;
  try {
    store.configured = configured;
    store.current = current;
    afterPublish();
    publishedConfigured = store.configured;
    publishedCurrent = store.current;
  } catch (error) {
    store.configured = previousConfigured;
    store.current = previousCurrent;
    throw error;
  } finally {
    store.publishing = false;
  }

  const assertActivePublication = () => {
    if (!active) {
      throw new Error('Editor extension publication is already settled.');
    }
    if (
      store.configured !== publishedConfigured ||
      store.current !== publishedCurrent
    ) {
      throw new Error(
        'Editor extension publication changed before it was finalized.'
      );
    }
    if (store.publishing) {
      throw new Error('Editor extension registry publication cannot re-enter.');
    }
  };

  return Object.freeze({
    finalize(beforeFinalize = () => {}) {
      assertActivePublication();
      store.publishing = true;
      try {
        beforeFinalize();
        active = false;
      } finally {
        store.publishing = false;
      }
    },
    rollback(beforeRollback = () => {}) {
      assertActivePublication();
      store.publishing = true;
      try {
        beforeRollback();
      } finally {
        store.configured = previousConfigured;
        store.current = previousCurrent;
        store.publishing = false;
        active = false;
      }
    },
  });
};

const assertEffectType = (
  extensionName: string,
  type: EditorEffectType
): void => {
  if (!type.key) {
    throw new Error(
      `Editor extension "${extensionName}" cannot install an effect with an empty key.`
    );
  }
  if (!Object.isFrozen(type)) {
    throw new Error(
      `Editor effect "${type.key}" from "${extensionName}" must be created with defineEffect().`
    );
  }
  if (type.collab !== 'local' && type.collab !== 'shared') {
    throw new Error(
      `Editor effect "${type.key}" has invalid collaboration policy "${String(
        type.collab
      )}".`
    );
  }
  if (
    (type.collab === 'shared' &&
      type.collabReplay !== 'latest' &&
      type.collabReplay !== 'live') ||
    (type.collab === 'local' && type.collabReplay !== 'live')
  ) {
    throw new Error(
      `Editor effect "${
        type.key
      }" has invalid collaboration replay policy "${String(
        type.collabReplay
      )}".`
    );
  }
  if (
    (type.collabReplay === 'latest' &&
      typeof type.collabSnapshot !== 'function') ||
    (type.collabReplay !== 'latest' && type.collabSnapshot !== undefined)
  ) {
    throw new Error(
      `Editor effect "${type.key}" has an invalid collaboration snapshot policy.`
    );
  }
  if (type.history !== 'push' && type.history !== 'skip') {
    throw new Error(
      `Editor effect "${type.key}" has invalid history policy "${String(
        type.history
      )}".`
    );
  }
  if (typeof type.invert !== 'function' || typeof type.map !== 'function') {
    throw new Error(
      `Editor effect "${type.key}" must define invert and map functions.`
    );
  }
  if (
    type.codec &&
    (!Number.isSafeInteger(type.codec.version) ||
      type.codec.version < 1 ||
      typeof type.codec.encode !== 'function' ||
      typeof type.codec.decode !== 'function')
  ) {
    throw new Error(`Editor effect "${type.key}" has an invalid codec.`);
  }
  if (type.collab === 'shared' && !type.codec) {
    throw new Error(
      `Shared editor effect "${type.key}" requires a persistence codec.`
    );
  }
  if (
    type.collabTransport &&
    (type.collab !== 'shared' ||
      !type.codec ||
      typeof type.collabTransport.encode !== 'function' ||
      typeof type.collabTransport.decode !== 'function')
  ) {
    throw new Error(
      `Editor effect "${type.key}" has an invalid collaboration transport.`
    );
  }
};

export const registerEffectTypeInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  extensionName: string,
  type: EditorEffectType
) => {
  const existing = registry.effectTypes.get(type.key);

  assertEffectType(extensionName, type);
  if (existing) {
    throw new Error(
      `Editor effect "${type.key}" from "${extensionName}" conflicts with "${existing.extensionName}".`
    );
  }

  const registration = Object.freeze({ extensionName, type });

  registry.effectTypes.set(type.key, registration);

  return () => {
    if (registry.effectTypes.get(type.key) === registration) {
      registry.effectTypes.delete(type.key);
    }
  };
};

export const registerSelectionSpecInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  extensionName: string,
  spec: EditorSelectionSpec
) => {
  const kind: string = spec.kind;
  const existing = registry.selectionSpecs.get(kind);

  if (kind === 'text' || kind === 'node') {
    throw new Error(
      `Editor selection kind "${kind}" is built in and cannot be replaced by "${extensionName}".`
    );
  }
  if (
    typeof spec.validate !== 'function' ||
    typeof spec.codec?.decode !== 'function' ||
    typeof spec.codec?.encode !== 'function' ||
    !Number.isSafeInteger(spec.codec?.version) ||
    spec.codec.version < 1
  ) {
    throw new Error(
      `Editor selection kind "${kind}" from "${extensionName}" must define a validator and a versioned persistence codec.`
    );
  }

  if (existing) {
    throw new Error(
      `Editor selection kind "${kind}" from "${extensionName}" conflicts with "${existing.extensionName}".`
    );
  }

  const registration = Object.freeze({
    extensionName,
    spec: Object.freeze({ ...spec }),
  });
  registry.selectionSpecs.set(kind, registration);

  return () => {
    if (registry.selectionSpecs.get(kind) === registration) {
      registry.selectionSpecs.delete(kind);
    }
  };
};

export const inheritExtensionRegistry = <
  TEditor extends Editor,
  TSourceEditor extends Editor,
>(
  editor: TEditor,
  source: TSourceEditor
) => {
  EXTENSION_REGISTRIES.set(editor, getExtensionRegistryStore(source));
};

export const registerApiGroupInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  name: string,
  value: unknown
) => {
  const values = registry.apiGroups.get(name) ?? [];

  values.push(value);
  registry.apiGroups.set(name, values);

  return () => {
    const current = registry.apiGroups.get(name);

    if (!current) {
      return;
    }

    const index = current.indexOf(value);
    if (index >= 0) {
      current.splice(index, 1);
    }

    if (current.length === 0) {
      registry.apiGroups.delete(name);
    }
  };
};

export const registerExtensionContributionInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  point: object,
  registration: EditorExtensionContributionRegistration
) => {
  assertExtensionPointIdentities([...registry.contributions.keys(), point]);
  const contributions = registry.contributions.get(point) ?? [];

  contributions.push(Object.freeze(registration));
  registry.contributions.set(point, contributions);

  return () => {
    const current = registry.contributions.get(point);

    if (!current) return;
    const index = current.findIndex(
      (entry) =>
        entry.owner === registration.owner &&
        entry.sourceIndex === registration.sourceIndex
    );

    if (index >= 0) current.splice(index, 1);
    if (current.length === 0) registry.contributions.delete(point);
  };
};

export const registerFacetProviderInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  provider: EditorFacetProvider
) => {
  const current = registry.facets.get(provider.facet.key) ?? [];
  const installedFacet = current[0]?.facet as EditorFacet<any, any> | undefined;

  if (!provider.facet.key) {
    throw new Error('Editor facet key cannot be empty.');
  }
  if (!Object.isFrozen(provider.facet)) {
    throw new Error(
      `Editor facet "${provider.facet.key}" must be created with defineFacet().`
    );
  }
  if (installedFacet && installedFacet !== provider.facet) {
    throw new Error(
      `Editor facet "${provider.facet.key}" cannot install multiple descriptor identities.`
    );
  }

  const providers = [...current, provider];

  registry.facets.set(provider.facet.key, providers);

  return () => {
    const current = registry.facets.get(provider.facet.key);

    if (!current) return;

    const next = current.filter((candidate) => candidate !== provider);

    if (next.length === 0) registry.facets.delete(provider.facet.key);
    else registry.facets.set(provider.facet.key, next);
  };
};

export const registerStateFieldDescriptorInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  extensionName: string,
  field: EditorStateField<any>
) => {
  const known = registry.stateFieldIdentities.get(field.key);
  const existing = registry.stateFields.get(field.key);

  if (!field.key) {
    throw new Error(
      `Editor extension "${extensionName}" cannot install a state field with an empty key.`
    );
  }
  if (!Object.isFrozen(field) || typeof field.compare !== 'function') {
    throw new Error(
      `State field "${field.key}" from "${extensionName}" must be created with defineStateField().`
    );
  }
  if (known && known !== field) {
    throw new Error(
      `State field "${field.key}" does not match the stable descriptor identity already known by this editor.`
    );
  }
  if (existing) {
    throw new Error(
      `State field "${field.key}" from "${extensionName}" conflicts with "${existing.extensionName}".`
    );
  }

  const registration = Object.freeze({ extensionName, field });

  registry.stateFieldIdentities.set(field.key, field);
  registry.stateFields.set(field.key, registration);

  return () => {
    if (registry.stateFields.get(field.key) === registration) {
      registry.stateFields.delete(field.key);
    }
  };
};

export const registerCorrectionInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  id: string,
  correction: EditorCorrection<TEditor>
) => {
  registry.corrections.set(id, correction);

  return () => {
    if (registry.corrections.get(id) === correction) {
      registry.corrections.delete(id);
    }
  };
};

export const registerCommitListenerInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  listener: EditorCommitListener<ValueOf<TEditor>>
) => {
  registry.commitListeners.add(listener);

  return () => {
    registry.commitListeners.delete(listener);
  };
};

export const registerNodeChangeListenerInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  listener: EditorNodeChangeHandler<TEditor>
) => {
  registry.nodeChangeListeners.add(listener);

  return () => {
    registry.nodeChangeListeners.delete(listener);
  };
};

export const registerTextChangeListenerInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  listener: EditorTextChangeHandler<TEditor>
) => {
  registry.textChangeListeners.add(listener);

  return () => {
    registry.textChangeListeners.delete(listener);
  };
};

export const registerTransactionChangeListenerInRegistry = <
  TEditor extends Editor,
>(
  registry: ExtensionRegistry<TEditor>,
  listener: EditorTransactionChangeHandler<TEditor>
) => {
  registry.transactionChangeListeners.add(listener);

  return () => {
    registry.transactionChangeListeners.delete(listener);
  };
};

export const hasChangeListeners = (editor: Editor) => {
  const registry = getExtensionRegistry(editor);

  return (
    registry.nodeChangeListeners.size > 0 ||
    registry.textChangeListeners.size > 0
  );
};

const registerViewGroup = <TRegistration>(
  groups: Map<string, { extensionName: string; factory: TRegistration }>,
  reservedNames: Set<string>,
  kind: 'editor' | 'state' | 'tx',
  extensionName: string,
  groupName: string,
  factory: TRegistration
) => {
  if (reservedNames.has(groupName)) {
    throw new Error(
      `Editor extension "${extensionName}" ${kind} group "${groupName}" is reserved by Plite core.`
    );
  }

  const existing = groups.get(groupName);

  if (existing) {
    throw new Error(
      `Editor extension ${kind} group "${groupName}" from "${extensionName}" conflicts with "${existing.extensionName}".`
    );
  }

  const registration = Object.freeze({ extensionName, factory });
  groups.set(groupName, registration);

  return () => {
    if (groups.get(groupName) === registration) {
      groups.delete(groupName);
    }
  };
};

export const registerStateGroupInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  extensionName: string,
  groupName: string,
  factory: EditorStateGroupFactory<TEditor>
) =>
  registerViewGroup(
    registry.stateGroups,
    reservedStateGroupNames,
    'state',
    extensionName,
    groupName,
    factory
  );

export const registerTxGroupInRegistry = <TEditor extends Editor>(
  registry: ExtensionRegistry<TEditor>,
  extensionName: string,
  groupName: string,
  factory: EditorTxGroupFactory<TEditor>
) =>
  registerViewGroup(
    registry.txGroups,
    reservedTxGroupNames,
    'tx',
    extensionName,
    groupName,
    factory
  );
