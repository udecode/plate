import type {
  BaseEditor,
  AnyEditor as Editor,
  Plugin,
  PluginDependencyReferenceFor,
  PluginReference,
  PluginActivationContext,
  PluginApiFactoryContext,
  PluginApiMap,
  PluginCleanupContext,
  PluginContribution,
  PluginContributionInput,
  PluginCandidateContext,
  PluginCommandContext,
  PluginDefinition,
  PluginDefinitionInput,
  PluginFactoryTypeLambda,
  PluginFactoryTypeProvider,
  PluginPoint,
  PluginReadContext,
  EditorDocumentValue,
  PluginInput,
  PluginReconfigureOptions,
  EditorStateField,
  EditorUpdatePolicy,
  EditorUpdateTransaction,
  EditorValueFromPlugins,
  RegisteredPlugin,
  ValueOf,
} from '../interfaces/editor';
import type {
  EditorSchemaDeclaration,
  EditorSchemaDefinition,
} from '../interfaces/schema';
import { getDefined } from '../internal/get-defined';
import { ChangeDraft } from './change/builder';
import { DocumentChange } from './change/document-change';
import { createCommandRegistration } from './command-definition';
import { registerCommandInRegistry } from './command-registry';
import { getEditorCommitSnapshot } from './commit';
import {
  getEditorRuntimeOwner,
  getEditorRuntimeRoot,
  type InternalCompiledPluginPublicationEntry,
  type InternalPluginPublicationEntry,
} from './editor-runtime';
import {
  createEditorSchema,
  type InternalEditorSchemaApi,
} from './editor-schema';
import { reportEditorLifecycleError } from './lifecycle-error';
import {
  createPluginRegistry,
  finalizePluginRegistry,
  getConfiguredPluginRegistry,
  getPluginRegistry,
  type PluginRegistry,
  type PublishedConfiguredPluginRegistry,
  publishConfiguredPluginRegistry,
  runWithCandidatePluginRegistry,
  runWithPluginPublicationGuard,
  registerApiGroupInRegistry,
  registerCommitListenerInRegistry,
  registerEffectTypeInRegistry,
  registerPluginContributionInRegistry,
  registerNodeChangeListenerInRegistry,
  registerCorrectionInRegistry,
  registerStateFieldDescriptorInRegistry,
  registerStateGroupInRegistry,
  registerTextChangeListenerInRegistry,
  registerTransactionChangeListenerInRegistry,
  registerTxGroupInRegistry,
  validateConfiguredPluginRegistry,
} from './plugin-registry';
import { getPluginSlotInput } from './plugin-slot';
import { toPublicRoot } from './public-root';
import {
  activateStateField,
  getEditorDocumentValue,
  runTrustedUpdate,
  stagePluginCandidate,
  withTransactionSpecDraftRead,
} from './public-state';
import { createReadRegistration } from './read-definition';
import { registerReadInRegistry } from './read-registry';
import { constructCanonicalDocumentChange } from './representation';
import {
  areEditorSchemaIdentitiesEqual,
  createEditorSchemaContract,
  type CompiledEditorSchema,
  type EditorSchemaContract,
} from './schema-compiler';
import { registerSchemaContribution } from './schema-contribution-registry';
import {
  type EditorSchemaDefinitionInput,
  type NormalizedEditorSchemaInput,
  normalizeEditorSchemaDeclaration,
  normalizeEditorSchemaDefinition,
} from './schema-definition';
import { EditorSchemaValidationError } from './schema-validation';

const PLUGIN_CONTRIBUTION_VALUES = new WeakMap<object, unknown>();
type PluginPortalFactory = NonNullable<
  InternalCompiledPluginPublicationEntry['createPortal']
>;
const PLUGIN_PORTAL_FACTORIES = new WeakMap<object, PluginPortalFactory>();
const PLUGIN_PORTAL_CANDIDATES = new WeakMap<
  object,
  ReadonlyMap<PluginReference, PluginPortalFactory>
>();

/**
 * Make exact author descriptors available while an owning compiler evaluates
 * callbacks before publication has produced installed records.
 *
 * @internal
 */
export const withPluginPortalCandidates = <T>(
  editor: Editor,
  entries: ReadonlyArray<
    Readonly<{
      createPortal: NonNullable<
        InternalCompiledPluginPublicationEntry['createPortal']
      >;
      descriptor: PluginReference;
      sources?: readonly PluginReference[];
    }>
  >,
  run: () => T
): T => {
  const owner = getEditorRuntimeOwner(editor);
  const previous = PLUGIN_PORTAL_CANDIDATES.get(owner);
  const candidates = new Map(previous);

  for (const entry of entries) {
    for (const descriptor of [entry.descriptor, ...(entry.sources ?? [])]) {
      const existing = candidates.get(descriptor);

      if (existing && existing !== entry.createPortal) {
        throw new Error(
          `Editor plugin descriptor "${descriptor.name}" has multiple candidate portal owners.`
        );
      }
      candidates.set(descriptor, entry.createPortal);
    }
  }
  PLUGIN_PORTAL_CANDIDATES.set(owner, candidates);

  try {
    return run();
  } finally {
    if (previous) {
      PLUGIN_PORTAL_CANDIDATES.set(owner, previous);
    } else {
      PLUGIN_PORTAL_CANDIDATES.delete(owner);
    }
  }
};

export const createPluginUpdatePortal = (
  editor: Editor,
  pluginName: string,
  expectedPlugin?: PluginReference
): unknown => {
  const assertCapabilityOwner = () => {
    if (
      expectedPlugin &&
      getCandidatePluginApi(editor, expectedPlugin) === undefined &&
      resolveInstalledPlugin(editor, expectedPlugin) === undefined
    ) {
      throw new Error(
        `Editor plugin "${pluginName}" descriptor is no longer installed.`
      );
    }
  };
  const resolveCapability = () => {
    assertCapabilityOwner();
    const capability = Reflect.get(editor.update, pluginName);

    if (capability === undefined) {
      throw new Error(
        `Editor plugin "${pluginName}" does not expose update methods.`
      );
    }

    return capability;
  };
  const resolveCapabilityPath = (
    source: unknown,
    path: readonly PropertyKey[]
  ) => {
    let owner: unknown = source;
    let value = source;

    for (const key of path) {
      owner = value;
      value = Reflect.get(value as object, key);
    }

    return { owner, value };
  };
  const createScopedUpdatePath = (
    path: readonly PropertyKey[],
    policy?: EditorUpdatePolicy
  ): unknown =>
    new Proxy(
      (...args: unknown[]) => {
        assertCapabilityOwner();
        if (policy === undefined) {
          const { owner, value } = resolveCapabilityPath(
            resolveCapability(),
            path
          );

          if (typeof value !== 'function') {
            throw new TypeError(
              `Editor plugin "${pluginName}" update method "${path
                .map(String)
                .join('.')}" is not callable.`
            );
          }

          return Reflect.apply(value, owner, args);
        }

        let result: unknown;
        const update = editor.update as unknown as (
          policy: EditorUpdatePolicy,
          fn: (tx: EditorUpdateTransaction<any, any>) => void
        ) => void;

        update(policy, (tx) => {
          const { owner, value } = resolveCapabilityPath(
            Reflect.get(tx, pluginName),
            path
          );

          if (typeof value !== 'function') {
            throw new TypeError(
              `Editor plugin "${pluginName}" update method "${path
                .map(String)
                .join('.')}" is not callable.`
            );
          }

          result = Reflect.apply(value, owner, args);
        });

        return result;
      },
      {
        get(_target, key) {
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return undefined;
          }
          return createScopedUpdatePath([...path, key], policy);
        },
      }
    );
  const createScopedUpdate = (policy?: EditorUpdatePolicy): unknown =>
    new Proxy(
      (nextPolicy: EditorUpdatePolicy) => createScopedUpdate(nextPolicy),
      {
        get(_target, key) {
          if (key === 'then' || key === 'toJSON' || typeof key === 'symbol') {
            return undefined;
          }

          return createScopedUpdatePath([key], policy);
        },
      }
    );

  return createScopedUpdate();
};

/** Define a typed plugin point for ordered cross-plugin contributions. */
export const definePluginPoint = <TValue>(id: string): PluginPoint<TValue> => {
  if (!id) {
    throw new Error('Editor plugin point id cannot be empty.');
  }

  const point = Object.freeze({
    id,
    of(value: TValue) {
      const contribution = Object.freeze({
        point,
      }) as PluginContribution<TValue>;

      PLUGIN_CONTRIBUTION_VALUES.set(contribution, value);

      return contribution;
    },
  });

  return point;
};

const getPluginContributionValue = (
  contribution: PluginContributionInput<any>
) => {
  if (!PLUGIN_CONTRIBUTION_VALUES.has(contribution)) {
    throw new Error(
      `Editor plugin contribution "${contribution.point.id}" was not created by its point.`
    );
  }

  return PLUGIN_CONTRIBUTION_VALUES.get(contribution);
};

type PluginRecord = {
  activation: PluginActivation | null;
  api: PluginApiMap | null;
  createPortal?: InternalCompiledPluginPublicationEntry['createPortal'];
  definition: PluginRuntimeDefinition;
  descriptor: PluginReference;
  editor: Editor;
  explicit: boolean;
  order: number;
  requiredBy: ReadonlySet<string>;
  sources: readonly PluginReference[];
  slotOwners: ReadonlySet<string>;
};

type PluginRuntimeDefinition = PluginDefinitionInput &
  Readonly<{ name: string }>;

type PluginState = {
  nextOrder: number;
  records: Map<string, PluginRecord>;
};

type PluginActivation = {
  abortController: AbortController;
  active: boolean;
  afterPublishCallbacks: Array<() => void>;
  beforePublishCallbacks: Array<() => void>;
  beforePublishCalled: boolean;
  cleanups: Array<(context: PluginCleanupContext) => void>;
  published: boolean;
};

const PLUGIN_STATE = new WeakMap<Editor, PluginState>();
const CANONICAL_PLUGINS = new WeakSet<object>();
const PLUGIN_AUTHORED_DEFINITIONS = new WeakMap<
  PluginReference,
  PluginRuntimeDefinition
>();
const CANDIDATE_PLUGIN_APIS = new WeakMap<
  Editor,
  ReadonlyMap<PluginReference, PluginApiMap>
>();
let nextDynamicPluginPublication = 0;

/**
 * Test nominal descriptor identity without structural guessing.
 *
 * @internal
 */
export const isPlugin = (value: unknown): value is PluginReference =>
  typeof value === 'object' && value !== null && CANONICAL_PLUGINS.has(value);

const getPluginLookupReferences = (record: {
  descriptor: PluginReference;
  sources: readonly PluginReference[];
}) => [record.descriptor, ...record.sources];

export {
  reportEditorLifecycleError,
  setEditorLifecycleErrorSink,
} from './lifecycle-error';

const reportPluginLifecycleError = (
  editor: Editor,
  pluginName: string,
  phase:
    | 'afterPublish'
    | 'cleanup'
    | 'commit-listener'
    | 'node-change-listener'
    | 'text-change-listener',
  cause: unknown
) => {
  reportEditorLifecycleError(
    Object.freeze({ cause, editor, pluginName, phase })
  );
};

const assertSynchronousLifecycleResult = (result: unknown, label: string) => {
  if (
    result !== null &&
    (typeof result === 'object' || typeof result === 'function') &&
    typeof (result as { then?: unknown }).then === 'function'
  ) {
    void Promise.resolve(result).catch(() => {});
    throw new Error(`${label} must be synchronous.`);
  }
};

export class PluginPublicationError extends Error {
  readonly pluginName: string;
  readonly phase: 'activate' | 'beforePublish';
  readonly rollbackErrors: readonly unknown[];

  constructor(
    pluginName: string,
    cause: unknown,
    rollbackErrors: readonly unknown[] = [],
    phase: 'activate' | 'beforePublish' = 'activate'
  ) {
    const causeMessage =
      cause instanceof Error
        ? cause.message
        : typeof cause === 'string'
          ? cause
          : undefined;

    super(
      `Editor plugin "${pluginName}" ${phase === 'activate' ? 'activation' : 'before-publish callback'} failed${
        causeMessage ? `: ${causeMessage}` : '.'
      }`,
      { cause }
    );
    this.name = 'PluginPublicationError';
    this.pluginName = pluginName;
    this.phase = phase;
    this.rollbackErrors = Object.freeze([...rollbackErrors]);
  }
}

const getPluginState = (editor: Editor) => {
  const owner = getEditorRuntimeOwner(editor);
  let state = PLUGIN_STATE.get(owner);

  if (!state) {
    state = {
      nextOrder: 0,
      records: new Map(),
    };
    PLUGIN_STATE.set(owner, state);
  }

  return state;
};

export const getCompiledEditorConfiguration = (editor: Editor) => {
  const registry = getConfiguredPluginRegistry(editor);

  return Object.freeze({
    plugins: Object.freeze(
      [...registry.plugins.values()].sort(
        (left, right) => left.order - right.order
      )
    ),
    revision: registry.configurationRevision,
  });
};

const normalizePluginInput = (input: PluginInput) =>
  (Array.isArray(input) ? input : [input]).map((plugin) => {
    if (!isPlugin(plugin)) {
      throw new Error(
        'Editor plugins must be created by definePlugin or another descriptor factory.'
      );
    }

    return plugin;
  });

/** Return whether an plugin input installs a complete editor schema. */
export const containsCompleteEditorSchema = (input: PluginInput): boolean => {
  const visiting = new Set<PluginReference>();
  const inspected = new Set<PluginReference>();

  const inspect = (candidate: PluginInput): boolean =>
    normalizePluginInput(candidate).some((plugin) => {
      const definition = PLUGIN_AUTHORED_DEFINITIONS.get(plugin);

      if (!definition) {
        throw new Error(
          `Editor plugin "${plugin.name}" does not carry a raw authored definition.`
        );
      }
      if (definition.enabled === false || inspected.has(plugin)) return false;
      if (visiting.has(plugin)) {
        throw new Error(
          `Editor plugin "${plugin.name}" has a cyclic dependency.`
        );
      }

      visiting.add(plugin);
      const declaration = definition.schema;
      const ownsCompleteSchema =
        typeof declaration === 'object' &&
        declaration !== null &&
        Object.hasOwn(declaration, 'root');
      const ownsCompleteDependency = (definition.dependencies ?? []).some(
        (dependency) => inspect(dependency)
      );
      const slotInput = getPluginSlotInput(plugin);
      const ownsCompleteSlotInput = slotInput ? inspect(slotInput) : false;

      visiting.delete(plugin);
      inspected.add(plugin);

      return (
        ownsCompleteSchema || ownsCompleteDependency || ownsCompleteSlotInput
      );
    });

  return inspect(input);
};

type PluginEntry = {
  createPortal?: InternalCompiledPluginPublicationEntry['createPortal'];
  definition: PluginRuntimeDefinition;
  descriptor: PluginReference;
  editor: Editor;
  explicit: boolean;
  requiredBy: ReadonlySet<string>;
  sources: readonly PluginReference[];
  slotOwners: ReadonlySet<string>;
};

const expandPluginInput = (
  input: InternalCompiledPluginPublicationEntry,
  editor: Editor,
  entriesByReference: ReadonlyMap<
    PluginReference,
    InternalCompiledPluginPublicationEntry
  >,
  relation:
    | Readonly<{ kind: 'dependency' | 'slot'; owner: string }>
    | Readonly<{ kind: 'explicit' }> = { kind: 'explicit' },
  visiting = new Set<PluginReference>(),
  expanded = new Set<PluginReference>()
): PluginEntry[] =>
  [input].flatMap((publication) => {
    const { definition, descriptor, sources } = publication;
    const entry = {
      ...(publication.createPortal
        ? { createPortal: publication.createPortal }
        : {}),
      definition,
      descriptor,
      editor,
      explicit: relation.kind === 'explicit',
      requiredBy: new Set(
        relation.kind === 'dependency' ? [relation.owner] : []
      ),
      sources,
      slotOwners: new Set(relation.kind === 'slot' ? [relation.owner] : []),
    };
    if (definition.enabled === false) return [entry];
    if (visiting.has(descriptor)) {
      throw new Error(
        `Editor plugin "${descriptor.name}" has a cyclic dependency.`
      );
    }
    if (expanded.has(descriptor)) return [entry];

    visiting.add(descriptor);
    const dependencies = (definition.dependencies ?? []).flatMap(
      (dependency: PluginReference) => {
        const dependencyEntry =
          entriesByReference.get(dependency) ??
          createAuthoredPluginInput(dependency, editor);

        return dependencyEntry
          ? expandPluginInput(
              dependencyEntry,
              dependencyEntry.editor ?? editor,
              entriesByReference,
              { kind: 'dependency', owner: descriptor.name },
              visiting,
              expanded
            )
          : [];
      }
    );
    const slotInput = getPluginSlotInput(descriptor);

    if (!slotInput) {
      visiting.delete(descriptor);
      expanded.add(descriptor);

      return [...dependencies, entry];
    }
    const slotEntries = normalizePluginInput(slotInput).flatMap(
      (slotDescriptor) => {
        const slotEntry =
          entriesByReference.get(slotDescriptor) ??
          createAuthoredPluginInput(slotDescriptor, editor);

        return slotEntry
          ? expandPluginInput(
              slotEntry,
              slotEntry.editor ?? editor,
              entriesByReference,
              { kind: 'slot', owner: descriptor.name },
              visiting,
              expanded
            )
          : [];
      }
    );

    visiting.delete(descriptor);
    expanded.add(descriptor);

    return [...dependencies, entry, ...slotEntries];
  });

const getPluginSlotId = (pluginName: string, slot: string) =>
  `${pluginName}:${slot}`;

const resolveLatestPluginEntries = (entriesInput: readonly PluginEntry[]) => {
  const entries = new Map<string, PluginEntry | null>();
  const fields = new Map<string, EditorStateField<any>>();

  for (const entry of entriesInput) {
    const { definition, descriptor } = entry;
    assertNoUnsupportedSlots(definition);

    if (!descriptor.name) {
      throw new Error(
        `Editor plugin must have a name (received keys: ${Object.keys(
          descriptor
        ).join(', ')}).`
      );
    }
    if (definition.enabled === false) {
      const known = entries.get(descriptor.name);

      if (known && known.descriptor !== descriptor) {
        throw new Error(
          `Editor plugin "${descriptor.name}" has multiple descriptor identities in the same configuration.`
        );
      }
      entries.delete(descriptor.name);
      entries.set(descriptor.name, null);
      continue;
    }
    for (const field of definition.stateFields ?? []) {
      const known = fields.get(field.key);

      if (known && known !== field) {
        throw new Error(
          `State field "${field.key}" conflicts with another descriptor identity in the same configuration.`
        );
      }
      fields.set(field.key, field);
    }

    const known = entries.get(descriptor.name);

    if (known && known.descriptor !== descriptor) {
      throw new Error(
        `Editor plugin "${descriptor.name}" has multiple descriptor identities in the same configuration.`
      );
    }
    const merged = known
      ? {
          ...known,
          explicit: known.explicit || entry.explicit,
          requiredBy: new Set([...known.requiredBy, ...entry.requiredBy]),
          slotOwners: new Set([...known.slotOwners, ...entry.slotOwners]),
        }
      : entry;

    entries.delete(descriptor.name);
    entries.set(descriptor.name, merged);
  }

  return {
    entries: [...entries.values()].filter(
      (entry): entry is PluginEntry => entry !== null
    ),
    replacedNames: [...entries.keys()],
  };
};

const collectOwnedPluginNames = (
  state: PluginState,
  owners: readonly string[]
) => {
  const requested = new Set(owners);
  const names = new Set<string>();

  for (const owner of requested) {
    const record = state.records.get(owner);

    if (
      !record ||
      [...record.requiredBy, ...record.slotOwners].every((innerOwner) =>
        requested.has(innerOwner)
      )
    ) {
      names.add(owner);
    }
  }
  let changed = true;

  while (changed) {
    changed = false;

    for (const [name, record] of state.records) {
      if (names.has(name) || record.explicit) continue;
      const innerOwners = new Set([...record.requiredBy, ...record.slotOwners]);

      if (
        innerOwners.size > 0 &&
        [...innerOwners].every((owner) => names.has(owner))
      ) {
        names.add(name);
        changed = true;
      }
    }
  }

  return [...names];
};

const areEqualPluginOwnerSets = (
  left: ReadonlySet<string>,
  right: ReadonlySet<string>
) => left.size === right.size && [...left].every((name) => right.has(name));

const isSameInstalledPlugin = (
  current: PluginRecord | undefined,
  installed: PluginRecord | undefined
) =>
  current !== undefined &&
  installed !== undefined &&
  current.editor === installed.editor &&
  current.definition === installed.definition &&
  current.descriptor === installed.descriptor;

const getValidationStateWithoutReplacements = (
  state: PluginState,
  replacedNames: readonly string[]
) => {
  if (replacedNames.length === 0) {
    return state;
  }

  const records = new Map(state.records);

  for (const name of replacedNames) {
    records.delete(name);
  }

  return { ...state, records };
};

type NormalizedPluginApi<TInput> = TInput extends {
  api: (...args: never[]) => infer TResult;
}
  ? TResult
  : never;

type NormalizedPluginRead<TInput> = TInput extends {
  read: (...args: never[]) => infer TResult;
}
  ? TResult
  : never;

type NormalizedPluginUpdate<TInput> = TInput extends {
  update: (...args: never[]) => infer TResult;
}
  ? TResult
  : never;

type NormalizedPluginSchema<TInput> = TInput extends {
  schema: infer TSchema;
}
  ? TSchema extends (...args: never[]) => infer TResult
    ? TResult extends EditorSchemaDeclaration
      ? TResult
      : never
    : TSchema extends EditorSchemaDeclaration
      ? TSchema
      : never
  : never;

type PluginPresenceField =
  | 'activate'
  | 'commands'
  | 'contributions'
  | 'corrections'
  | 'effectTypes'
  | 'on'
  | 'readMiddleware'
  | 'stateFields'
  | 'validate';

type PluginInputSeed = {
  [TKey in keyof PluginDefinitionInput]?: unknown;
};

type PluginAuthorEditor<TDependencies extends readonly PluginReference[]> =
  Editor<EditorValueFromPlugins<TDependencies>, TDependencies>;

type NormalizedPluginReferences<TInput> = TInput extends readonly unknown[]
  ? {
      readonly [TIndex in keyof TInput]: PluginDependencyReferenceFor<
        TInput[TIndex]
      >;
    }
  : never;

type NormalizePluginDefinition<
  TInput extends PluginInputSeed,
  N extends string,
> = Readonly<{
  [
    TKey in keyof TInput as TKey extends keyof PluginDefinition ? TKey : never
  ]: TKey extends 'api'
    ? NormalizedPluginApi<TInput>
    : TKey extends 'conflicts' | 'dependencies'
      ? NormalizedPluginReferences<TInput[TKey]>
      : TKey extends 'enabled'
        ? TInput[TKey]
        : TKey extends 'read'
          ? NormalizedPluginRead<TInput>
          : TKey extends 'update'
            ? NormalizedPluginUpdate<TInput>
            : TKey extends 'schema'
              ? NormalizedPluginSchema<TInput>
              : TKey extends PluginPresenceField
                ? true
                : TInput[TKey];
}> &
  Readonly<{ name: N }>;

type DefinePlugin = {
  <
    const N extends string,
    const TDependencies extends readonly PluginReference[],
    const TInput extends PluginDefinitionInput<
      PluginAuthorEditor<TDependencies>
    >,
  >(
    name: N,
    plugin: TInput &
      Readonly<{ dependencies: TDependencies }> &
      NoExtraPluginProperties<TInput>
  ): Plugin<NormalizePluginDefinition<TInput, N>>;
  <
    const N extends string,
    const TInput extends PluginDefinitionInput<PluginAuthorEditor<readonly []>>,
  >(
    name: N,
    plugin: TInput &
      Readonly<{ dependencies?: never }> &
      NoExtraPluginProperties<TInput>
  ): Plugin<NormalizePluginDefinition<TInput, N>>;
};

type NoExtraPluginProperties<TInput> = Record<
  Exclude<keyof TInput, keyof PluginDefinitionInput>,
  never
>;

const normalizePluginDefinition = <
  TEditor extends BaseEditor<any, any> = Editor,
>(
  plugin: PluginDefinitionInput<TEditor> & Readonly<{ name: string }>
): PluginRuntimeDefinition => {
  const canonical = { ...plugin } as Record<PropertyKey, unknown>;
  const stateFieldEffects = (plugin.stateFields ?? []).flatMap(
    (field) => field.effectTypes ?? []
  );

  if (stateFieldEffects.length > 0) {
    canonical.effectTypes = [
      ...new Set([...(plugin.effectTypes ?? []), ...stateFieldEffects]),
    ];
  }
  const listKeys = [
    'conflicts',
    'contributions',
    'corrections',
    'dependencies',
    'effectTypes',
    'stateFields',
  ] as const;

  for (const key of listKeys) {
    const value = canonical[key];

    if (Array.isArray(value)) {
      canonical[key] = Object.freeze(
        key === 'stateFields'
          ? value.map((field) => (field === plugin ? canonical : field))
          : Array.from(value)
      );
    }
  }
  if (plugin.on) {
    canonical.on = Object.freeze({ ...plugin.on });
  }
  if (plugin.schema) {
    const declaration =
      typeof plugin.schema === 'function'
        ? plugin.schema(
            Object.freeze({
              name: plugin.name,
            })
          )
        : plugin.schema;

    canonical.schema = normalizeEditorSchemaDeclaration(declaration);
  }
  return Object.freeze(canonical) as PluginRuntimeDefinition;
};

/**
 * Mark one owner-created object as a shared nominal descriptor.
 *
 * @internal
 */
export const brandPluginDescriptor = <TDescriptor extends object>(
  descriptor: TDescriptor,
  familySource?: PluginReference
): TDescriptor & PluginReference => {
  const name = Reflect.get(descriptor, 'name');

  if (name !== undefined && typeof name !== 'string') {
    throw new Error('Editor plugin descriptor names must be strings.');
  }

  CANONICAL_PLUGINS.add(descriptor);
  const inheritedPortal = familySource
    ? PLUGIN_PORTAL_FACTORIES.get(familySource)
    : undefined;

  if (inheritedPortal) {
    PLUGIN_PORTAL_FACTORIES.set(descriptor, inheritedPortal);
  }

  return descriptor as TDescriptor & PluginReference;
};

/** Associate an owner-specific portal projection with one nominal descriptor. */
export const setPluginPortalFactory = (
  descriptor: PluginReference,
  createPortal: PluginPortalFactory
) => {
  if (!isPlugin(descriptor)) {
    throw new Error(
      'Editor plugin portal factories require a shared nominal descriptor.'
    );
  }
  const existing = PLUGIN_PORTAL_FACTORIES.get(descriptor);

  if (existing && existing !== createPortal) {
    throw new Error(
      `Editor plugin descriptor "${descriptor.name}" has multiple portal owners.`
    );
  }
  PLUGIN_PORTAL_FACTORIES.set(descriptor, createPortal);
};

const normalizePluginSourceReferences = (
  name: string,
  input: unknown
): readonly PluginReference[] => {
  if (input === undefined) return [];
  if (!Array.isArray(input)) {
    throw new Error('Editor plugin source references must be an array.');
  }

  return Object.freeze(
    [...new Set(input)].map((reference) => {
      if (!isPlugin(reference)) {
        throw new Error(
          'Editor plugin source references must be created by definePlugin.'
        );
      }
      if (reference.name !== name) {
        throw new Error(
          `Editor plugin source reference "${reference.name}" cannot back "${name}".`
        );
      }

      return reference;
    })
  );
};

const canonicalizePlugin = <TEditor extends BaseEditor<any, any> = Editor>(
  plugin: PluginDefinitionInput<TEditor> & Readonly<{ name: string }>
): PluginReference => {
  if (CANONICAL_PLUGINS.has(plugin)) {
    return plugin as unknown as PluginReference;
  }

  const definition = normalizePluginDefinition(plugin);
  const descriptor = brandPluginDescriptor(definition);

  PLUGIN_AUTHORED_DEFINITIONS.set(descriptor, definition);

  return descriptor;
};

/** Compile one owner-authored descriptor into an editor-local publication. */
export const compilePluginInput = <
  TEditor extends BaseEditor<any, any> = Editor,
>(
  descriptor: PluginReference,
  definition: PluginDefinitionInput<TEditor>,
  options: Readonly<{
    createPortal?: InternalCompiledPluginPublicationEntry['createPortal'];
    editor?: Editor;
    sources?: readonly PluginReference[];
  }> = {}
): InternalCompiledPluginPublicationEntry => {
  if (!isPlugin(descriptor)) {
    throw new Error(
      'Compiled editor plugins require a shared nominal descriptor.'
    );
  }
  const sources = normalizePluginSourceReferences(
    descriptor.name,
    options.sources
  );

  return Object.freeze({
    ...(options.createPortal ? { createPortal: options.createPortal } : {}),
    definition: normalizePluginDefinition({
      ...definition,
      name: descriptor.name,
    }),
    descriptor,
    ...(options.editor ? { editor: options.editor } : {}),
    sources,
  });
};

const createAuthoredPluginInput = (
  descriptor: PluginReference,
  editor?: Editor
): InternalCompiledPluginPublicationEntry | undefined => {
  const definition = PLUGIN_AUTHORED_DEFINITIONS.get(descriptor);

  if (!definition) return undefined;

  return Object.freeze({
    definition,
    descriptor,
    ...(editor ? { editor } : {}),
    sources: Object.freeze([]),
  });
};

/**
 * Define one editor plugin from an immutable name and contextually typed
 * author definition.
 * The returned descriptor carries only its normalized capability contract.
 */
export const definePlugin = ((
  name: string,
  definition: PluginDefinitionInput
) => canonicalizePlugin({ ...definition, name })) as DefinePlugin;

export function carryPluginFactoryType<
  TProvider extends PluginFactoryTypeLambda,
  TFactory extends (...args: never[]) => PluginReference,
>(factory: TFactory): TFactory & PluginFactoryTypeProvider<TProvider>;
export function carryPluginFactoryType(
  factory: (...args: never[]) => PluginReference
): (...args: never[]) => PluginReference {
  return factory;
}

/** Define one complete schema as a nominal editor plugin. */
export const defineEditorSchema = <
  const N extends string,
  const TInput extends EditorSchemaDefinition,
>(
  name: N,
  definition: EditorSchemaDefinitionInput<TInput>
): Plugin<
  NormalizePluginDefinition<
    Readonly<{ schema: NormalizedEditorSchemaInput<TInput> }>,
    N
  >
> =>
  definePlugin(name, {
    schema: normalizeEditorSchemaDefinition(name, definition),
  });

/** Compile one dynamically assembled plugin at an internal owner boundary. */
export const compilePlugin = <TEditor extends BaseEditor<any, any> = Editor>(
  plugin: PluginDefinitionInput<TEditor> & Readonly<{ name: string }>
): PluginReference => canonicalizePlugin(plugin);

export const resolveInstalledPlugin = (
  editor: Editor,
  plugin: PluginReference
): PluginReference | undefined => {
  if (!CANONICAL_PLUGINS.has(plugin)) return undefined;
  const installed =
    getPluginRegistry(editor).pluginsByDescriptor.get(plugin)?.descriptor;

  return installed;
};

/**
 * Read the resolved API map for one installed plugin name.
 *
 * @internal
 */
export const getInstalledPluginApi = (
  editor: Editor,
  name: string
): PluginApiMap | undefined =>
  getPluginState(editor).records.get(name)?.api ?? undefined;

/**
 * Read an API map while a detached candidate is compiling.
 *
 * @internal
 */
export const getCandidatePluginApi = (
  editor: Editor,
  plugin: PluginReference
) =>
  CANONICAL_PLUGINS.has(plugin)
    ? CANDIDATE_PLUGIN_APIS.get(getEditorRuntimeOwner(editor))?.get(plugin)
    : undefined;

/**
 * Read one API group resolved earlier in the active candidate.
 *
 * @internal
 */
export const getCandidateEditorApiValue = (
  editor: Editor,
  name: string
): unknown => {
  const candidateApis = CANDIDATE_PLUGIN_APIS.get(
    getEditorRuntimeOwner(editor)
  );

  if (!candidateApis) return undefined;
  for (const api of candidateApis.values()) {
    if (Object.hasOwn(api, name)) return api[name];
  }

  return undefined;
};

/**
 * Read ordered values from one published plugin point.
 *
 * @internal
 */
export const getPluginContributions = <TValue>(
  editor: Editor,
  point: PluginPoint<TValue>
) =>
  Object.freeze(
    (getPluginRegistry(editor).contributions.get(point) ?? []).map(
      ({ value }) => value as Readonly<TValue>
    )
  );

/**
 * Read the exact descriptor installed for one plugin name.
 *
 * @internal
 */
export const getInstalledPlugin = (
  editor: Editor,
  name: string
): PluginReference | undefined =>
  getPluginState(getEditorRuntimeOwner(editor)).records.get(name)?.descriptor;

const assertNoUnsupportedSlots = (definition: PluginRuntimeDefinition) => {
  const { methods } = definition as unknown as { methods?: unknown };
  const { commitListeners } = definition as unknown as {
    commitListeners?: unknown;
  };
  const { register } = definition as unknown as { register?: unknown };

  if (methods !== undefined) {
    throw new Error(
      `Editor plugin "${definition.name}" cannot use methods. Declare read or update capabilities instead.`
    );
  }

  if (commitListeners !== undefined) {
    throw new Error(
      `Editor plugin "${definition.name}" cannot use commitListeners. Add on.commit instead.`
    );
  }

  if (register !== undefined) {
    throw new Error(
      `Editor plugin "${definition.name}" cannot use register. Declare plugin resources directly.`
    );
  }
};

const resolvePluginOrder = (
  state: PluginState,
  entries: readonly PluginEntry[]
) => {
  const pending = new Map<string, PluginEntry>();
  const pendingByReference = new Map<PluginReference, PluginEntry>();
  const installedByReference = new Map<PluginReference, PluginRecord>();
  const ordered: PluginEntry[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  for (const record of state.records.values()) {
    for (const reference of getPluginLookupReferences(record)) {
      installedByReference.set(reference, record);
    }
  }
  for (const entry of entries) {
    pending.set(entry.descriptor.name, entry);
    for (const reference of getPluginLookupReferences(entry)) {
      const known = pendingByReference.get(reference);
      if (known && known.descriptor !== entry.descriptor) {
        throw new Error(
          `Editor plugin source reference "${reference.name}" resolves to multiple descriptors.`
        );
      }
      pendingByReference.set(reference, entry);
    }
  }

  for (const entry of entries) {
    for (const conflict of entry.definition.conflicts ?? []) {
      const installedConflict = installedByReference.get(conflict);

      if (installedConflict) {
        throw new Error(
          `Editor plugin "${entry.descriptor.name}" conflicts with "${installedConflict.descriptor.name}".`
        );
      }
      const pendingConflict = pendingByReference.get(conflict);

      if (
        pendingConflict &&
        pendingConflict.descriptor.name !== entry.descriptor.name
      ) {
        throw new Error(
          `Editor plugin "${entry.descriptor.name}" conflicts with "${pendingConflict.descriptor.name}".`
        );
      }
    }
  }
  for (const [installedName, record] of state.records) {
    for (const conflict of record.definition.conflicts ?? []) {
      const pendingConflict = pendingByReference.get(conflict);

      if (pendingConflict) {
        throw new Error(
          `Editor plugin "${pendingConflict.descriptor.name}" conflicts with "${installedName}".`
        );
      }
    }
  }

  const visit = (entry: PluginEntry) => {
    const { descriptor } = entry;
    if (visited.has(descriptor.name)) {
      return;
    }

    if (visiting.has(descriptor.name)) {
      throw new Error(
        `Editor plugin "${descriptor.name}" has a cyclic dependency.`
      );
    }

    visiting.add(descriptor.name);

    for (const dependency of entry.definition.dependencies ?? []) {
      const pendingDependency = pendingByReference.get(dependency);

      if (pendingDependency) {
        visit(pendingDependency);
        continue;
      }

      const installedDependency = installedByReference.get(dependency);

      if (!installedDependency) {
        const sameName =
          pending.get(dependency.name) ?? state.records.get(dependency.name);
        throw new Error(
          sameName
            ? `Editor plugin "${descriptor.name}" dependency "${dependency.name}" resolves to a different descriptor.`
            : `Editor plugin "${descriptor.name}" has missing dependency "${dependency.name}".`
        );
      }
    }

    visiting.delete(descriptor.name);
    visited.add(descriptor.name);
    ordered.push(entry);
  };

  for (const entry of entries) {
    visit(entry);
  }

  return ordered;
};

const registerPluginSlots = <TEditor extends Editor>(
  editor: TEditor,
  record: PluginRecord,
  registry: PluginRegistry<TEditor>,
  api: PluginApiMap | null = record.api
) => {
  const { definition: plugin } = record;
  const cleanups: Array<() => void> = [];
  const registerSlots = (slots: PluginDefinitionInput<TEditor>) => {
    assertNoUnsupportedSlots(slots as PluginRuntimeDefinition);
    const commandContext: PluginCommandContext<TEditor> = Object.freeze({
      around: (command, handler) =>
        createCommandRegistration(command, 'around', handler),
      handle: (command, handler) =>
        createCommandRegistration(command, 'handle', handler),
    });

    for (const registration of slots.commands?.(commandContext) ?? []) {
      cleanups.push(
        registerCommandInRegistry(registry.commands, registration, plugin.name)
      );
    }
    const readContext: PluginReadContext<TEditor> = Object.freeze({
      around: (read, handler) => createReadRegistration(read, handler as never),
    });

    for (const registration of slots.readMiddleware?.(readContext) ?? []) {
      cleanups.push(registerReadInRegistry(registry.reads, registration));
    }

    for (const [name, value] of Object.entries(api ?? {})) {
      const values = Array.isArray(value) ? value : [value];

      for (const innerValue of values) {
        cleanups.push(registerApiGroupInRegistry(registry, name, innerValue));
      }
    }

    for (const [sourceIndex, contribution] of (
      slots.contributions ?? []
    ).entries()) {
      cleanups.push(
        registerPluginContributionInRegistry(
          registry,
          contribution.point,
          Object.freeze({
            owner: plugin,
            sourceIndex,
            value: getPluginContributionValue(contribution),
          })
        )
      );
    }

    for (const field of slots.stateFields ?? []) {
      cleanups.push(
        registerStateFieldDescriptorInRegistry(registry, plugin.name, field)
      );
    }

    for (const type of slots.effectTypes ?? []) {
      cleanups.push(registerEffectTypeInRegistry(registry, plugin.name, type));
    }

    if (slots.schema) {
      if (typeof slots.schema === 'function') {
        throw new Error(
          `Editor plugin "${plugin.name}" schema factory was not normalized.`
        );
      }
      cleanups.push(
        registerSchemaContribution(
          registry.schemaContributions,
          plugin.name,
          slots.schema
        )
      );
    }

    for (const [index, correction] of (slots.corrections ?? []).entries()) {
      cleanups.push(
        registerCorrectionInRegistry(
          registry,
          getPluginSlotId(plugin.name, `corrections.${index}`),
          correction
        )
      );
    }

    if (slots.on?.commit) {
      cleanups.push(
        registerCommitListenerInRegistry(registry, (commit) => {
          try {
            slots.on?.commit?.({
              commit,
              editor,
              snapshot: getEditorCommitSnapshot(
                commit,
                getEditorRuntimeRoot(editor)
              ),
            });
          } catch (error) {
            reportPluginLifecycleError(
              editor,
              plugin.name,
              'commit-listener',
              error
            );
          }
        })
      );
    }

    if (slots.on?.nodeChange) {
      cleanups.push(
        registerNodeChangeListenerInRegistry(registry, (context) => {
          try {
            slots.on?.nodeChange?.({
              ...context,
              editor,
            });
          } catch (error) {
            reportPluginLifecycleError(
              editor,
              plugin.name,
              'node-change-listener',
              error
            );
          }
        })
      );
    }

    if (slots.on?.textChange) {
      cleanups.push(
        registerTextChangeListenerInRegistry(registry, (context) => {
          try {
            slots.on?.textChange?.({
              ...context,
              editor,
            });
          } catch (error) {
            reportPluginLifecycleError(
              editor,
              plugin.name,
              'text-change-listener',
              error
            );
          }
        })
      );
    }

    if (slots.on?.transactionChange) {
      cleanups.push(
        registerTransactionChangeListenerInRegistry(registry, (context) =>
          slots.on?.transactionChange?.({
            ...context,
            editor,
          })
        )
      );
    }

    if (slots.read) {
      cleanups.push(
        registerStateGroupInRegistry(
          registry,
          plugin.name,
          plugin.name,
          (state, readEditor) =>
            getDefined(slots.read)({ editor: readEditor, state })
        )
      );
    }

    if (slots.update) {
      cleanups.push(
        registerTxGroupInRegistry(
          registry,
          plugin.name,
          plugin.name,
          (tx, updateEditor, context) =>
            getDefined(slots.update)({
              context: Object.freeze({
                afterCommit(handler) {
                  context.afterCommit(({ commit, snapshot }) => {
                    handler({
                      commit,
                      editor: updateEditor,
                      snapshot,
                    });
                  });
                },
              }),
              editor: updateEditor,
              tx,
            })
        )
      );
    }
  };

  try {
    registerSlots(plugin as unknown as PluginDefinitionInput<TEditor>);
  } catch (error) {
    for (const cleanup of cleanups.slice().reverse()) {
      cleanup();
    }

    throw error;
  }

  return cleanups;
};

const deactivatePluginRecord = (
  record: PluginRecord,
  reason: PluginCleanupContext['reason']
) => {
  const { activation } = record;
  const errors: unknown[] = [];
  const cleanupContext = Object.freeze({
    reason,
  }) satisfies PluginCleanupContext;

  if (!activation?.active) return errors;

  activation.active = false;
  try {
    activation.abortController.abort(cleanupContext.reason);
  } catch (error) {
    errors.push(error);
  }

  for (const cleanup of activation.cleanups.toReversed()) {
    try {
      assertSynchronousLifecycleResult(
        // oxlint-disable-next-line typescript/no-confusing-void-expression -- Runtime plugins can violate their declared void contract with a Promise; this guard rejects that actual value.
        cleanup(cleanupContext),
        `Editor plugin "${record.descriptor.name}" cleanup`
      );
    } catch (error) {
      errors.push(error);
    }
  }
  record.activation = null;

  return errors;
};

const activatePluginRecord = <TEditor extends Editor>(
  editor: TEditor,
  record: PluginRecord
) => {
  if (record.activation) {
    throw new Error(
      `Editor plugin "${record.descriptor.name}" cannot activate twice.`
    );
  }

  const activation: PluginActivation = {
    abortController: new AbortController(),
    active: true,
    afterPublishCallbacks: [],
    beforePublishCallbacks: [],
    beforePublishCalled: false,
    cleanups: [],
    published: false,
  };
  record.activation = activation;
  const { definition, descriptor } = record;
  const runtimeFields = definition as PluginDefinitionInput<TEditor>;
  const context = Object.freeze({
    editor,
    pluginName: descriptor.name,
    onCleanup(cleanup) {
      if (!activation.active) {
        throw new Error(
          `Editor plugin "${descriptor.name}" cannot register cleanup after deactivation.`
        );
      }
      if (typeof cleanup !== 'function') {
        throw new Error('Editor plugin cleanup must be a function.');
      }

      activation.cleanups.push(cleanup);
    },
    beforePublish(callback) {
      if (!activation.active || activation.beforePublishCalled) {
        throw new Error(
          `Editor plugin "${descriptor.name}" cannot register before-publish work after preparation.`
        );
      }
      if (typeof callback !== 'function') {
        throw new Error(
          'Editor plugin before-publish callback must be a function.'
        );
      }

      activation.beforePublishCallbacks.push(callback);
    },
    afterPublish(callback) {
      if (!activation.active || activation.published) {
        throw new Error(
          `Editor plugin "${descriptor.name}" cannot register after-publish work after publication.`
        );
      }
      if (typeof callback !== 'function') {
        throw new Error(
          'Editor plugin after-publish callback must be a function.'
        );
      }

      activation.afterPublishCallbacks.push(callback);
    },
    root: toPublicRoot(getEditorRuntimeRoot(editor)),
    schema: createEditorSchema(() => editor),
    signal: activation.abortController.signal,
  } satisfies PluginActivationContext & Readonly<{ editor: TEditor }>);

  try {
    assertSynchronousLifecycleResult(
      runtimeFields.activate?.(context),
      `Editor plugin "${descriptor.name}" activation`
    );
  } catch (error) {
    const cleanupErrors = deactivatePluginRecord(record, 'rollback');

    throw new PluginPublicationError(descriptor.name, error, cleanupErrors);
  }
};

const runPluginAfterPublish = (editor: Editor, record: PluginRecord) => {
  const { activation } = record;

  if (!activation?.active || activation.published) return;
  activation.published = true;

  for (const callback of activation.afterPublishCallbacks) {
    try {
      assertSynchronousLifecycleResult(
        // oxlint-disable-next-line typescript/no-confusing-void-expression -- Runtime plugins can violate their declared void contract with a Promise; this guard rejects that actual value.
        callback(),
        `Editor plugin "${record.descriptor.name}" after-publish callback`
      );
    } catch (error) {
      reportPluginLifecycleError(
        editor,
        record.descriptor.name,
        'afterPublish',
        error
      );
    }
  }
  activation.afterPublishCallbacks = [];
};

const getInstalledPluginRecords = (
  state: PluginState,
  installedNames: readonly string[]
) =>
  installedNames
    .map((name) => state.records.get(name))
    .filter((record): record is PluginRecord => record !== undefined)
    .sort((a, b) => a.order - b.order);

const getRegisteredPlugin = (
  record: PluginRecord,
  records: ReadonlyMap<string, PluginRecord>
): RegisteredPlugin => ({
  conflicts: Object.freeze([...(record.definition.conflicts ?? [])]),
  dependencies: Object.freeze([...(record.definition.dependencies ?? [])]),
  descriptor: record.descriptor,
  name: record.descriptor.name,
  order: record.order,
  requiredBy: Object.freeze(
    new Set(
      [...record.requiredBy]
        .map((name) => records.get(name))
        .filter((owner): owner is PluginRecord => owner !== undefined)
        .map(({ descriptor }) => descriptor)
    )
  ),
});

const resolvePluginApi = <TEditor extends Editor>(
  plugin: PluginRuntimeDefinition,
  context?: PluginApiFactoryContext<TEditor>
) => {
  if (plugin.api !== undefined && !context) {
    throw new Error(
      `Editor plugin "${plugin.name}" API factory requires a candidate context.`
    );
  }

  if (plugin.api === undefined) return Object.freeze({});
  const api = getDefined(plugin.api as PluginDefinitionInput<TEditor>['api'])(
    getDefined(context)
  );

  assertSynchronousLifecycleResult(api, `Editor plugin "${plugin.name}" API`);

  if (!api || typeof api !== 'object' || Array.isArray(api)) {
    throw new Error(
      `Editor plugin "${plugin.name}" API must return an object.`
    );
  }

  return Object.freeze({
    [plugin.name]: Object.freeze({ ...api }),
  });
};

const resolveEditorApiCapability = (capabilities: readonly unknown[]) => {
  if (capabilities.length === 1) {
    return capabilities[0];
  }

  if (
    capabilities.every(
      (capability) =>
        typeof capability === 'object' &&
        capability !== null &&
        !Array.isArray(capability)
    )
  ) {
    return Object.freeze(Object.assign({}, ...capabilities));
  }

  return capabilities.at(-1);
};

/**
 * Resolve plugin APIs against a root-scoped editor view.
 *
 * @internal
 */
export const createEditorViewPluginApis = <TEditor extends Editor>(
  editor: TEditor,
  source: Editor
): Pick<TEditor, 'api' | 'plugin'> => {
  let cachedRegistry: PluginRegistry | undefined;
  let cachedConfiguredRegistry:
    | ReturnType<typeof getConfiguredPluginRegistry>
    | undefined;
  let cachedConfigurationRevision = -1;
  let apiGroups = new Map<string, unknown[]>();
  let descriptorApis = new Map<PluginReference, PluginApiMap>();

  const refresh = () => {
    const registry = getPluginRegistry(source);
    const configuredRegistry = getConfiguredPluginRegistry(source);
    const configurationRevision =
      getCompiledEditorConfiguration(source).revision;

    if (
      registry === cachedRegistry &&
      configuredRegistry === cachedConfiguredRegistry &&
      configurationRevision === cachedConfigurationRevision
    ) {
      return;
    }

    const previousRegistry = cachedRegistry;
    const previousConfiguredRegistry = cachedConfiguredRegistry;
    const previousConfigurationRevision = cachedConfigurationRevision;
    const previousApiGroups = apiGroups;
    const previousDescriptorApis = descriptorApis;

    cachedRegistry = registry;
    cachedConfiguredRegistry = configuredRegistry;
    cachedConfigurationRevision = configurationRevision;
    apiGroups = new Map();
    descriptorApis = new Map();

    try {
      for (const descriptor of registry.dependencyOrder) {
        if (registry.plugins.get(descriptor.name)?.descriptor !== descriptor) {
          continue;
        }
        const record = getPluginState(
          getEditorRuntimeOwner(source)
        ).records.get(descriptor.name);

        if (!record || record.descriptor !== descriptor) continue;

        const pluginApi =
          record.definition.api === undefined
            ? {}
            : resolvePluginApi(
                record.definition,
                createPluginApiFactoryContext(
                  editor,
                  registry as PluginRegistry<TEditor>
                )
              );

        descriptorApis.set(descriptor, pluginApi);

        for (const [name, value] of Object.entries(pluginApi)) {
          const values = apiGroups.get(name) ?? [];

          values.push(...(Array.isArray(value) ? value : [value]));
          apiGroups.set(name, values);
        }
      }
    } catch (error) {
      cachedRegistry = previousRegistry;
      cachedConfiguredRegistry = previousConfiguredRegistry;
      cachedConfigurationRevision = previousConfigurationRevision;
      apiGroups = previousApiGroups;
      descriptorApis = previousDescriptorApis;
      throw error;
    }
  };
  const resolveValue = (installedName: string, installedApi: PluginApiMap) => {
    const capability = installedApi[installedName];

    if (capability === undefined) {
      throw new Error(
        `Editor plugin "${installedName}" does not expose an API.`
      );
    }

    return capability;
  };
  const createPortal = (
    requested: PluginReference,
    enforceIdentity: boolean
  ) => {
    const candidatePortal = PLUGIN_PORTAL_CANDIDATES.get(
      getEditorRuntimeOwner(source)
    )?.get(requested);

    if (candidatePortal) {
      return candidatePortal(editor, requested);
    }
    const registered =
      getPluginRegistry(source).pluginsByDescriptor.get(requested);
    const record = registered
      ? getPluginState(getEditorRuntimeOwner(source)).records.get(
          registered.name
        )
      : undefined;
    const authoredPortal = PLUGIN_PORTAL_FACTORIES.get(requested);

    if (authoredPortal) {
      return authoredPortal(editor, requested);
    }
    if (record?.createPortal && record.descriptor === requested) {
      return record.createPortal(editor, requested);
    }
    const installedName = requested.name;
    const installedAtCreation =
      getCandidatePluginApi(editor, requested) !== undefined ||
      resolveInstalledPlugin(source, requested) !== undefined;
    const update = createPluginUpdatePortal(
      editor,
      installedName,
      enforceIdentity ? requested : undefined
    );
    const assertCurrentDescriptor = () => {
      if (
        enforceIdentity &&
        getCandidatePluginApi(editor, requested) === undefined &&
        resolveInstalledPlugin(source, requested) === undefined
      ) {
        throw new Error(
          installedAtCreation
            ? `Editor plugin "${installedName}" descriptor is no longer installed.`
            : `Editor plugin "${installedName}" is not installed on this editor.`
        );
      }
    };

    return Object.freeze({
      get installed() {
        return (
          getCandidatePluginApi(editor, requested) !== undefined ||
          resolveInstalledPlugin(source, requested) !== undefined
        );
      },
      get api() {
        const candidateApi = getCandidatePluginApi(editor, requested);

        if (candidateApi) return resolveValue(installedName, candidateApi);

        assertCurrentDescriptor();
        refresh();
        const installed =
          getPluginRegistry(source).plugins.get(installedName)?.descriptor;

        if (!installed) {
          throw new Error(
            `Editor plugin "${installedName}" is not installed on this editor.`
          );
        }
        return resolveValue(
          installedName,
          descriptorApis.get(installed) ??
            getInstalledPluginApi(editor, installedName) ??
            {}
        );
      },
      get read() {
        assertCurrentDescriptor();
        const capability = Reflect.get(editor.read, installedName);

        if (capability === undefined) {
          throw new Error(
            `Editor plugin "${installedName}" does not expose read methods.`
          );
        }

        return capability;
      },
      get update() {
        assertCurrentDescriptor();
        return update;
      },
    });
  };
  const api = new Proxy(Object.create(null) as Record<string, unknown>, {
    get(_target, property) {
      if (typeof property !== 'string') return undefined;
      const candidateValue = getCandidateEditorApiValue(editor, property);

      if (candidateValue !== undefined) return candidateValue;

      refresh();
      const values = apiGroups.get(property);

      return values?.length ? resolveEditorApiCapability(values) : undefined;
    },
  }) as TEditor['api'];
  const pluginPortal = ((plugin: PluginReference) => {
    if (!isPlugin(plugin)) {
      throw new TypeError(
        'Editor plugin lookup requires a descriptor created by definePlugin.'
      );
    }
    const candidateApi = getCandidatePluginApi(editor, plugin);

    if (candidateApi) {
      return createPortal(plugin, true);
    }
    refresh();

    return createPortal(plugin, true);
  }) as unknown as TEditor['plugin'];

  return Object.freeze({ api, plugin: pluginPortal });
};

const createPluginRecord = (entry: PluginEntry, order: number) =>
  ({
    activation: null,
    api: entry.definition.api === undefined ? Object.freeze({}) : null,
    ...(entry.createPortal ? { createPortal: entry.createPortal } : {}),
    definition: entry.definition,
    descriptor: entry.descriptor,
    editor: entry.editor,
    explicit: entry.explicit,
    order,
    requiredBy: Object.freeze(new Set(entry.requiredBy)),
    sources: entry.sources,
    slotOwners: Object.freeze(new Set(entry.slotOwners)),
  }) satisfies PluginRecord;

const getOrderedPluginRecords = (
  records: ReadonlyMap<string, PluginRecord>
) => {
  const ordered: PluginRecord[] = [];
  const recordsByReference = new Map<PluginReference, PluginRecord>();
  const visited = new Set<string>();
  const visiting = new Set<string>();

  for (const record of records.values()) {
    for (const reference of getPluginLookupReferences(record)) {
      recordsByReference.set(reference, record);
    }
  }
  const visit = (record: PluginRecord) => {
    const { name } = record.descriptor;

    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(`Editor plugin "${name}" has a cyclic dependency.`);
    }

    visiting.add(name);
    for (const dependency of record.definition.dependencies ?? []) {
      const dependencyRecord = recordsByReference.get(dependency);

      if (dependencyRecord) visit(dependencyRecord);
    }
    visiting.delete(name);
    visited.add(name);
    ordered.push(record);
  };

  for (const record of [...records.values()].sort(
    (left, right) => left.order - right.order
  )) {
    visit(record);
  }

  return ordered;
};

const validateCompletePluginGraph = (
  records: ReadonlyMap<string, PluginRecord>
) => {
  const recordsByReference = new Map<PluginReference, PluginRecord>();

  for (const record of records.values()) {
    for (const reference of getPluginLookupReferences(record)) {
      const known = recordsByReference.get(reference);
      if (known && known.descriptor !== record.descriptor) {
        throw new Error(
          `Editor plugin source reference "${reference.name}" resolves to multiple installed descriptors.`
        );
      }
      recordsByReference.set(reference, record);
    }
  }
  for (const record of records.values()) {
    const { definition, descriptor } = record;

    for (const dependency of definition.dependencies ?? []) {
      const installed = recordsByReference.get(dependency);

      if (!installed) {
        const sameName = records.get(dependency.name);
        throw new Error(
          sameName
            ? `Editor plugin "${descriptor.name}" dependency "${dependency.name}" resolves to a different descriptor.`
            : `Editor plugin "${descriptor.name}" has missing dependency "${dependency.name}".`
        );
      }
    }
    for (const conflict of definition.conflicts ?? []) {
      if (recordsByReference.has(conflict)) {
        throw new Error(
          `Editor plugin "${descriptor.name}" conflicts with "${conflict.name}".`
        );
      }
    }
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (name: string) => {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(`Editor plugin "${name}" has a cyclic dependency.`);
    }

    visiting.add(name);
    for (const dependency of records.get(name)?.definition.dependencies ?? []) {
      const dependencyRecord = recordsByReference.get(dependency);

      if (dependencyRecord) visit(dependencyRecord.descriptor.name);
    }
    visiting.delete(name);
    visited.add(name);
  };

  for (const name of records.keys()) visit(name);
};

const samePluginRecords = (
  left: ReadonlyMap<string, PluginRecord>,
  right: ReadonlyMap<string, PluginRecord>
) =>
  left.size === right.size &&
  [...left].every(([name, record]) => right.get(name) === record);

type PluginPublicationOptions = PluginReconfigureOptions &
  Readonly<{
    /** Initial construction publishes the fitted candidate document. */
    initializeDocument?: boolean;
    /** Initial explicit documents validate without canonical rewrite. */
    initialPublication?: boolean;
    validateDocument?: boolean;
  }>;

const classifyCandidatePublicationDocument = (
  editor: Editor,
  schema: ReturnType<typeof createEditorSchema>,
  current: EditorDocumentValue,
  document: EditorDocumentValue
) => {
  const change = DocumentChange.between(current, document);
  const builder = new ChangeDraft(current, {
    assertCanonical: (candidate, accumulated) => {
      if (
        !constructCanonicalDocumentChange(editor, candidate, accumulated, {
          before: current,
          schema,
        }).empty
      ) {
        throw new EditorSchemaValidationError(
          'Editor schema migration must return a canonical document. Use next.fitDocument(document) to fit external content.'
        );
      }
    },
    indexConstructedRoot: schema.indexConstructedRoot,
    isSetValued: (node, key, context) =>
      schema.isSetValuedProperty(node, key, context),
    validate: (candidate) => {
      schema.assertDocument(candidate);
    },
  });

  builder.applyCanonical(change);

  return Object.freeze({
    change: builder.classify(),
    document,
  });
};

const fitCandidatePublicationDocument = (
  editor: Editor,
  schema: ReturnType<typeof createEditorSchema>,
  current: EditorDocumentValue,
  input: EditorDocumentValue
) =>
  classifyCandidatePublicationDocument(
    editor,
    schema,
    current,
    schema.fitDocument(input)
  );

const buildConfiguredRegistry = <TEditor extends Editor>(
  editor: TEditor,
  previousRegistry: PluginRegistry<TEditor>,
  previousSchemaRevision: number,
  nextRecords: ReadonlyMap<string, PluginRecord>,
  orderedRecords: readonly PluginRecord[],
  resolvedApis: ReadonlyMap<string, PluginApiMap> = new Map(),
  options: PluginPublicationOptions = {}
) => {
  const registry = createPluginRegistry<TEditor>({
    configurationRevision: previousRegistry.configurationRevision + 1,
    schemaRevision: previousSchemaRevision,
    stateFieldIdentities: previousRegistry.stateFieldIdentities,
  });
  const cleanups: Array<() => void> = [];
  const dependencyOrder: PluginReference[] = [];

  try {
    for (const record of orderedRecords) {
      const registered = getRegisteredPlugin(record, nextRecords);

      registry.plugins.set(record.descriptor.name, registered);
      for (const reference of getPluginLookupReferences(record)) {
        const known = registry.pluginsByDescriptor.get(reference);

        if (known && known.descriptor !== registered.descriptor) {
          throw new Error(
            `Editor plugin source reference "${reference.name}" resolves to multiple installed descriptors.`
          );
        }
        registry.pluginsByDescriptor.set(reference, registered);
      }
      dependencyOrder.push(record.descriptor);
      cleanups.push(
        ...registerPluginSlots(
          record.editor as TEditor,
          record,
          registry,
          record.definition.api === undefined
            ? record.api
            : (resolvedApis.get(record.descriptor.name) ?? null)
        )
      );
    }
    registry.dependencyOrder = dependencyOrder;
  } catch (error) {
    for (const cleanup of cleanups.toReversed()) cleanup();
    throw error;
  }

  const preview = validateConfiguredPluginRegistry(editor, registry);
  const previousIdentity =
    getPluginRegistry(editor).schemaContributions.compiled?.identity ?? null;
  const nextIdentity = preview.schemaContributions.compiled?.identity ?? null;
  const declarativeSchemaChanged = !areEditorSchemaIdentitiesEqual(
    previousIdentity,
    nextIdentity
  );

  registry.schemaRevision =
    previousSchemaRevision + (declarativeSchemaChanged ? 1 : 0);

  const candidate = finalizePluginRegistry(registry);
  const mergedCandidate = validateConfiguredPluginRegistry(
    editor,
    candidate,
    preview.schemaContributions
  );
  const schema: InternalEditorSchemaApi<ValueOf<TEditor>> = createEditorSchema<
    ValueOf<TEditor>
  >(
    () => editor,
    () => mergedCandidate
  );
  let documentChange = DocumentChange.empty;

  if (options.validateDocument !== false) {
    const currentDocument = getEditorDocumentValue(editor);
    if (options.initialPublication && !options.initializeDocument) {
      schema.assertDocument(currentDocument);

      return Object.freeze({
        configured: candidate,
        documentChange,
        merged: mergedCandidate,
        schema,
      });
    }
    if (!declarativeSchemaChanged) {
      schema.assertDocument(currentDocument);
    } else {
      const inputDocument = options.migrate
        ? (() => {
            const document = Object.freeze({
              children: currentDocument.children,
              ...(currentDocument.roots
                ? { roots: currentDocument.roots }
                : {}),
            });
            const migrated = options.migrate({ document, next: schema });

            if (Object.hasOwn(migrated, 'meta')) {
              throw new Error(
                'Schema migrations cannot replace editor state-field metadata.'
              );
            }

            return {
              children: migrated.children,
              ...(currentDocument.meta !== undefined
                ? { meta: currentDocument.meta }
                : {}),
              ...(migrated.roots !== undefined
                ? { roots: migrated.roots }
                : {}),
            };
          })()
        : currentDocument;
      const fitted = options.migrate
        ? classifyCandidatePublicationDocument(
            editor,
            schema,
            currentDocument,
            inputDocument
          )
        : fitCandidatePublicationDocument(
            editor,
            schema,
            currentDocument,
            inputDocument
          );

      if (
        !options.initializeDocument &&
        !options.migrate &&
        !fitted.change.empty
      ) {
        throw new EditorSchemaValidationError(
          'Editor schema reconfiguration requires an explicit migration when the current document is not canonical under the candidate schema.'
        );
      }
      documentChange = fitted.change;
    }
  }

  return Object.freeze({
    configured: candidate,
    documentChange,
    merged: mergedCandidate,
    schema,
  });
};

const createPluginApiFactoryContext = <TEditor extends Editor>(
  editor: TEditor,
  registry: PluginRegistry<TEditor>
) =>
  Object.freeze({
    editor: editor as PluginApiFactoryContext<TEditor>['editor'],
    getContributions: <TValue>(point: PluginPoint<TValue>) =>
      Object.freeze(
        (registry.contributions.get(point) ?? []).map(
          ({ value }) => value as Readonly<TValue>
        )
      ),
    root: toPublicRoot(getEditorRuntimeRoot(editor)),
  }) satisfies PluginApiFactoryContext<TEditor>;

const createPluginCandidateContext = <TEditor extends Editor>(
  editor: TEditor,
  plugin: PluginReference,
  registry: PluginRegistry<TEditor>,
  schema: InternalEditorSchemaApi<ValueOf<TEditor>>
) =>
  Object.freeze({
    ...createPluginApiFactoryContext(editor, registry),
    name: plugin.name,
    schema,
  }) satisfies PluginCandidateContext<TEditor>;

const validatePlugins = <TEditor extends Editor>(
  records: readonly PluginRecord[],
  registry: PluginRegistry<TEditor>,
  schema: InternalEditorSchemaApi<ValueOf<TEditor>>
) => {
  for (const record of records) {
    const { definition, descriptor } = record;
    const runtimeFields = definition as PluginDefinitionInput<TEditor>;

    if (!runtimeFields.validate) continue;

    assertSynchronousLifecycleResult(
      // oxlint-disable-next-line typescript/no-confusing-void-expression -- Runtime plugins can violate their declared void contract with a Promise; this guard rejects that actual value.
      runtimeFields.validate(
        createPluginCandidateContext(
          record.editor as TEditor,
          descriptor,
          registry,
          schema
        )
      ),
      `Editor plugin "${descriptor.name}" validation`
    );
  }
};

export type PreparedPluginPublication = Readonly<{
  afterPublish: () => void;
  beforePublish: () => void;
  cleanup: () => void;
  commit: () => void;
  configurationChanged: boolean;
  documentChange: DocumentChange;
  finalize: () => void;
  rollback: () => void;
  schemaCompilation: () => PreparedEditorSchemaCompilation;
  schemaContract: () => EditorSchemaContract;
  stage: () => void;
  validateDocument: (value: EditorDocumentValue) => void;
}>;

export type PreparedEditorSchemaCompilation = Readonly<{
  contributions: <TValue>(
    point: PluginPoint<TValue>
  ) => ReadonlyArray<Readonly<TValue>>;
  fields: ReadonlyArray<EditorStateField<any>>;
  schema: import('./schema-compiler').CompiledEditorSchema;
}>;

const createNoopPublication = (
  editor: Editor,
  schema: CompiledEditorSchema
): PreparedPluginPublication => {
  let phase: 'cancelled' | 'finalized' | 'prepared' | 'published' = 'prepared';

  return Object.freeze({
    afterPublish() {},
    beforePublish() {},
    cleanup() {
      phase = 'cancelled';
    },
    commit() {
      if (phase === 'prepared') phase = 'published';
    },
    configurationChanged: false,
    documentChange: DocumentChange.empty,
    finalize() {
      if (phase === 'published') phase = 'finalized';
    },
    rollback() {
      if (phase === 'prepared' || phase === 'published') phase = 'cancelled';
    },
    schemaCompilation: () =>
      Object.freeze({
        contributions: <TValue>(point: PluginPoint<TValue>) =>
          Object.freeze(
            (getPluginRegistry(editor).contributions.get(point) ?? []).map(
              ({ value }) => value as Readonly<TValue>
            )
          ),
        fields: Object.freeze(
          [...getPluginRegistry(editor).stateFields.values()].map(
            ({ field }) => field
          )
        ),
        schema,
      }),
    stage() {},
    schemaContract: () => createEditorSchemaContract(schema),
    validateDocument() {},
  });
};

const prepareRecordPublication = <TEditor extends Editor>(
  editor: TEditor,
  state: PluginState,
  previousRegistry: PluginRegistry<TEditor>,
  previousRecords: Map<string, PluginRecord>,
  nextRecords: Map<string, PluginRecord>,
  nextOrder: number,
  activatedRecords: readonly PluginRecord[],
  deactivatedRecords: readonly PluginRecord[],
  cleanupRootNames: readonly string[],
  options: PluginPublicationOptions = {}
): PreparedPluginPublication => {
  if (samePluginRecords(previousRecords, nextRecords)) {
    return createNoopPublication(
      editor,
      getPluginRegistry(editor).schemaContributions.compiled
    );
  }

  const previousCurrentRegistry = getPluginRegistry(editor);
  let candidate!: PluginRegistry<TEditor>;
  let mergedCandidate!: PluginRegistry<TEditor>;
  let candidateDocumentChange = DocumentChange.empty;
  let validateCandidateDocument: (value: EditorDocumentValue) => void = () => {
    throw new Error('Editor plugin candidate schema is not prepared.');
  };
  const resolvedApis = new Map<string, PluginApiMap>();
  const orderedRecords = getOrderedPluginRecords(nextRecords);

  validateCompletePluginGraph(nextRecords);

  runWithPluginPublicationGuard(editor, () => {
    const declarative = [...nextRecords.values()].some(
      ({ definition }) => definition.api !== undefined
    )
      ? buildConfiguredRegistry(
          editor,
          previousRegistry,
          previousCurrentRegistry.schemaRevision,
          nextRecords,
          orderedRecords,
          new Map(),
          { validateDocument: false }
        )
      : null;
    const candidateApis = new Map<PluginReference, PluginApiMap>();

    CANDIDATE_PLUGIN_APIS.set(getEditorRuntimeOwner(editor), candidateApis);

    try {
      for (const record of orderedRecords) {
        if (record.definition.api === undefined) {
          for (const reference of getPluginLookupReferences(record)) {
            candidateApis.set(reference, record.api ?? {});
          }
          continue;
        }

        const { definition, descriptor } = record;
        const api = resolvePluginApi(
          definition,
          createPluginApiFactoryContext(
            record.editor as TEditor,
            getDefined(declarative).merged
          )
        );

        resolvedApis.set(descriptor.name, api);
        for (const reference of getPluginLookupReferences(record)) {
          candidateApis.set(reference, api);
        }
      }
      const built = buildConfiguredRegistry(
        editor,
        previousRegistry,
        previousCurrentRegistry.schemaRevision,
        nextRecords,
        orderedRecords,
        resolvedApis,
        options
      );

      validatePlugins(orderedRecords, built.merged, built.schema);
      candidate = built.configured;
      mergedCandidate = built.merged;
      candidateDocumentChange = built.documentChange;
      const nextSchema: InternalEditorSchemaApi<ValueOf<TEditor>> =
        built.schema;

      validateCandidateDocument = (value) => {
        nextSchema.assertDocument(value);
      };
    } finally {
      CANDIDATE_PLUGIN_APIS.delete(getEditorRuntimeOwner(editor));
    }
  });
  const previousFactoryApis = new Map<PluginRecord, PluginApiMap | null>();

  for (const record of nextRecords.values()) {
    if (record.definition.api !== undefined) {
      previousFactoryApis.set(record, record.api);
    }
  }
  const installResolvedApis = () => {
    for (const record of nextRecords.values()) {
      if (record.definition.api === undefined) continue;

      record.api = resolvedApis.get(record.descriptor.name) ?? null;
    }
  };
  const restorePreviousApis = () => {
    for (const [record, api] of previousFactoryApis) record.api = api;
  };
  const previousNextOrder = state.nextOrder;
  const appliedDraftFieldDisposals: Array<() => void> = [];
  const stagedActivationRecords: PluginRecord[] = [];
  const candidateApis = new Map<PluginReference, PluginApiMap>();

  for (const record of nextRecords.values()) {
    const api =
      record.definition.api === undefined
        ? (record.api ?? {})
        : (resolvedApis.get(record.descriptor.name) ?? {});

    for (const reference of getPluginLookupReferences(record)) {
      candidateApis.set(reference, api);
    }
  }
  const rollbackStagedActivations = () => {
    const errors: Array<{ cause: unknown; record: PluginRecord }> = [];

    for (const record of stagedActivationRecords.toReversed()) {
      for (const cause of deactivatePluginRecord(record, 'rollback')) {
        errors.push({ cause, record });
      }
    }
    stagedActivationRecords.length = 0;

    return errors;
  };
  const reportRollbackErrors = (
    errors: ReadonlyArray<{ cause: unknown; record: PluginRecord }>
  ) => {
    for (const { cause, record } of errors) {
      reportPluginLifecycleError(
        record.editor,
        record.descriptor.name,
        'cleanup',
        cause
      );
    }
  };
  let ownsDraftFields = false;
  let staged = false;
  const stageFields = () => {
    if (staged) return;
    if (phase !== 'prepared') {
      throw new Error('Editor plugin fields must stage before publication.');
    }

    ownsDraftFields = true;
    try {
      for (const record of activatedRecords) {
        for (const field of record.definition.stateFields ?? []) {
          const rollback = activateStateField(editor, field);

          appliedDraftFieldDisposals.push(rollback);
        }
      }
      const owner = getEditorRuntimeOwner(editor);

      CANDIDATE_PLUGIN_APIS.set(owner, candidateApis);
      try {
        runWithCandidatePluginRegistry(
          editor,
          { configured: candidate, current: mergedCandidate },
          () => {
            withTransactionSpecDraftRead(editor, () => {
              for (const record of activatedRecords) {
                try {
                  activatePluginRecord(record.editor, record);
                  stagedActivationRecords.push(record);
                } catch (error) {
                  const rollbackErrors = rollbackStagedActivations();

                  if (error instanceof PluginPublicationError) {
                    throw new PluginPublicationError(
                      error.pluginName,
                      error.cause,
                      [
                        ...error.rollbackErrors,
                        ...rollbackErrors.map(({ cause }) => cause),
                      ]
                    );
                  }
                  throw error;
                }
              }
            });
          }
        );
      } finally {
        CANDIDATE_PLUGIN_APIS.delete(owner);
      }
      staged = true;
    } catch (error) {
      reportRollbackErrors(rollbackStagedActivations());
      for (const rollback of appliedDraftFieldDisposals.toReversed()) {
        rollback();
      }
      appliedDraftFieldDisposals.length = 0;
      ownsDraftFields = false;
      throw error;
    }
  };
  const disposeDraftFields = () => {
    if (!ownsDraftFields) return;
    ownsDraftFields = false;
    for (const rollback of appliedDraftFieldDisposals.toReversed()) rollback();
  };
  let cleanupCalled = false;
  let cleanupRunning = false;
  let phase: 'cancelled' | 'finalized' | 'prepared' | 'published' = 'prepared';
  let afterPublishCalled = false;
  let beforePublishCalled = false;
  let registryPublication: PublishedConfiguredPluginRegistry | null = null;

  const rollbackPublication = () => {
    if (phase === 'prepared') {
      reportRollbackErrors(rollbackStagedActivations());
      disposeDraftFields();
      phase = 'cancelled';
      return;
    }
    if (phase !== 'published' || !registryPublication) return;

    registryPublication.rollback(() => {
      reportRollbackErrors(rollbackStagedActivations());
      restorePreviousApis();
      state.records = previousRecords;
      state.nextOrder = previousNextOrder;
    });
    disposeDraftFields();
    phase = 'cancelled';
  };

  const publication = Object.freeze({
    beforePublish() {
      if (phase !== 'published' || beforePublishCalled) return;
      beforePublishCalled = true;

      runWithPluginPublicationGuard(editor, () => {
        withTransactionSpecDraftRead(editor, () => {
          for (const record of activatedRecords) {
            const { activation } = record;
            if (!activation?.active) continue;
            activation.beforePublishCalled = true;
            try {
              for (const callback of activation.beforePublishCallbacks) {
                assertSynchronousLifecycleResult(
                  // oxlint-disable-next-line typescript/no-confusing-void-expression -- Runtime plugins can return a Promise despite the declared void contract.
                  callback(),
                  `Editor plugin "${record.descriptor.name}" before-publish callback`
                );
              }
              activation.beforePublishCallbacks = [];
            } catch (error) {
              throw new PluginPublicationError(
                record.descriptor.name,
                error,
                rollbackStagedActivations().map(({ cause }) => cause),
                'beforePublish'
              );
            }
          }
        });
      });
    },
    cleanup() {
      if (cleanupCalled || cleanupRunning) return;
      cleanupRunning = true;

      try {
        if (phase !== 'finalized') {
          rollbackPublication();
          cleanupCalled = true;
          return;
        }

        const currentState = getPluginState(editor);
        const currentRootNames = cleanupRootNames.filter((name) =>
          isSameInstalledPlugin(
            currentState.records.get(name),
            nextRecords.get(name)
          )
        );
        const ownedNames = collectOwnedPluginNames(
          currentState,
          currentRootNames
        );
        const affectedNames = [
          ...new Set([...currentRootNames, ...ownedNames]),
        ].filter((name) =>
          isSameInstalledPlugin(
            currentState.records.get(name),
            nextRecords.get(name)
          )
        );
        const removableRecords = getInstalledPluginRecords(
          currentState,
          affectedNames
        );

        if (removableRecords.length === 0) {
          cleanupCalled = true;
          return;
        }

        const removalInput = removableRecords.map(({ descriptor }) =>
          canonicalizePlugin({
            enabled: false,
            name: descriptor.name,
          })
        );
        const removalKey = `editor.unextend:${(nextDynamicPluginPublication += 1)}`;

        runTrustedUpdate(editor, () => {
          stagePluginCandidate(editor, removalKey, removalInput, () => {
            cleanupCalled = true;
          });
        });
      } finally {
        cleanupRunning = false;
      }
    },
    commit() {
      if (phase !== 'prepared') return;
      if (!staged) {
        throw new Error(
          'Editor plugin publication must stage fields before commit.'
        );
      }

      if (
        getConfiguredPluginRegistry(editor) !== previousRegistry ||
        getPluginRegistry(editor) !== previousCurrentRegistry
      ) {
        reportRollbackErrors(rollbackStagedActivations());
        disposeDraftFields();
        phase = 'cancelled';
        throw new Error(
          'Editor plugin publication is stale and cannot be committed.'
        );
      }

      try {
        registryPublication = publishConfiguredPluginRegistry(
          editor,
          candidate,
          () => {
            installResolvedApis();
            state.records = nextRecords;
            state.nextOrder = nextOrder;
          }
        );
        phase = 'published';
      } catch (error) {
        reportRollbackErrors(rollbackStagedActivations());
        restorePreviousApis();
        state.records = previousRecords;
        state.nextOrder = previousNextOrder;
        disposeDraftFields();
        phase = 'cancelled';
        throw error;
      }
    },
    configurationChanged: true,
    documentChange: candidateDocumentChange,
    finalize() {
      if (phase !== 'published' || !registryPublication) return;

      registryPublication.finalize(() => {
        ownsDraftFields = false;
        appliedDraftFieldDisposals.length = 0;
        stagedActivationRecords.length = 0;
        for (const record of deactivatedRecords.toReversed()) {
          const reason = nextRecords.has(record.descriptor.name)
            ? 'replace'
            : 'remove';

          for (const cause of deactivatePluginRecord(record, reason)) {
            reportPluginLifecycleError(
              record.editor,
              record.descriptor.name,
              'cleanup',
              cause
            );
          }
        }
      });
      phase = 'finalized';
    },
    afterPublish() {
      if (phase !== 'finalized' || afterPublishCalled) return;
      afterPublishCalled = true;

      for (const record of activatedRecords) {
        runPluginAfterPublish(record.editor, record);
      }
    },
    rollback() {
      rollbackPublication();
    },
    schemaCompilation() {
      if (phase !== 'prepared') {
        throw new Error('Editor plugin candidate schema is not prepared.');
      }
      return Object.freeze({
        contributions: <TValue>(point: PluginPoint<TValue>) =>
          Object.freeze(
            (mergedCandidate.contributions.get(point) ?? []).map(
              ({ value }) => value as Readonly<TValue>
            )
          ),
        fields: Object.freeze(
          [...mergedCandidate.stateFields.values()].map(({ field }) => field)
        ),
        schema: mergedCandidate.schemaContributions.compiled,
      });
    },
    stage() {
      stageFields();
    },
    schemaContract() {
      if (phase !== 'prepared') {
        throw new Error('Editor plugin candidate schema is not prepared.');
      }
      return createEditorSchemaContract(
        mergedCandidate.schemaContributions.compiled
      );
    },
    validateDocument(value: EditorDocumentValue) {
      validateCandidateDocument(value);
    },
  });

  return publication;
};

export const prepareScopedPluginPublication = <TEditor extends Editor>(
  editor: TEditor,
  entries: readonly InternalPluginPublicationEntry[],
  options: PluginPublicationOptions = {}
): PreparedPluginPublication => {
  const configurationEditor = getEditorRuntimeOwner(editor) as TEditor;
  const state = getPluginState(configurationEditor);
  const previousRegistry = getConfiguredPluginRegistry(configurationEditor);
  const previousRecords = state.records;
  const compiledEntries = entries.map((entry) =>
    'descriptor' in entry
      ? entry
      : getDefined(createAuthoredPluginInput(entry.plugin, entry.editor))
  );
  const entriesByReference = new Map<
    PluginReference,
    InternalCompiledPluginPublicationEntry
  >();

  for (const entry of compiledEntries) {
    if (!isPlugin(entry.descriptor)) {
      throw new Error(
        'Editor plugin publication requires shared nominal descriptors.'
      );
    }
    if (entry.definition.name !== entry.descriptor.name) {
      throw new Error(
        `Editor plugin definition "${entry.definition.name}" cannot back descriptor "${entry.descriptor.name}".`
      );
    }
    for (const reference of getPluginLookupReferences(entry)) {
      const known = entriesByReference.get(reference);

      if (known && known.descriptor !== entry.descriptor) {
        throw new Error(
          `Editor plugin source reference "${reference.name}" resolves to multiple descriptors.`
        );
      }
      entriesByReference.set(reference, entry);
    }
  }
  const expanded = new Set<PluginReference>();
  const latest = resolveLatestPluginEntries(
    compiledEntries.flatMap((entry) =>
      expandPluginInput(
        entry,
        entry.editor ??
          state.records.get(entry.descriptor.name)?.editor ??
          configurationEditor,
        entriesByReference,
        { kind: 'explicit' },
        new Set(),
        expanded
      )
    )
  );
  const explicitReplacementNames = [
    ...new Set(compiledEntries.map(({ descriptor }) => descriptor.name)),
  ];
  const disabledNames = new Set(
    compiledEntries
      .filter(({ definition }) => definition.enabled === false)
      .map(({ descriptor }) => descriptor.name)
  );
  const replacedNames = collectOwnedPluginNames(
    state,
    explicitReplacementNames
  );
  const nextByName = new Map(
    latest.entries.map((entry) => [entry.descriptor.name, entry])
  );
  const equivalentReplacement =
    disabledNames.size === 0 &&
    replacedNames.length === nextByName.size &&
    replacedNames.every((name) => {
      const previous = previousRecords.get(name);
      const next = nextByName.get(name);

      return Boolean(
        previous &&
        next &&
        previous.editor === next.editor &&
        previous.explicit === next.explicit &&
        previous.definition === next.definition &&
        previous.descriptor === next.descriptor
      );
    });

  if (equivalentReplacement) {
    return createNoopPublication(
      editor,
      getPluginRegistry(editor).schemaContributions.compiled
    );
  }
  const validationState = getValidationStateWithoutReplacements(
    state,
    replacedNames
  );
  const orderedEntries = resolvePluginOrder(validationState, latest.entries);
  const latestByName = new Map(
    latest.entries.map((entry) => [entry.descriptor.name, entry])
  );
  const nextRecords = new Map(previousRecords);
  const replacedNameSet = new Set(replacedNames);

  for (const name of replacedNames) nextRecords.delete(name);
  for (const name of disabledNames) {
    if (replacedNameSet.has(name)) continue;
    const retained = nextRecords.get(name);

    if (retained) {
      nextRecords.set(name, { ...retained, explicit: false });
    }
  }

  let { nextOrder } = state;
  const installedRecords = orderedEntries.flatMap((orderedEntry) => {
    const { descriptor } = orderedEntry;
    const entry = getDefined(latestByName.get(descriptor.name));
    const previous = previousRecords.get(descriptor.name);
    const previousOrder = previous?.order;

    if (
      previous &&
      previous.descriptor !== descriptor &&
      !replacedNameSet.has(descriptor.name)
    ) {
      throw new Error(
        `Editor plugin "${descriptor.name}" has multiple descriptor identities in the same configuration.`
      );
    }

    if (
      previous &&
      previous.editor === entry.editor &&
      previous.definition === entry.definition &&
      previous.descriptor === descriptor &&
      previous.createPortal === entry.createPortal
    ) {
      const requiredBy = new Set([...previous.requiredBy, ...entry.requiredBy]);
      const slotOwners = new Set([...previous.slotOwners, ...entry.slotOwners]);
      const explicit = previous.explicit || entry.explicit;

      if (
        explicit === previous.explicit &&
        areEqualPluginOwnerSets(previous.requiredBy, requiredBy) &&
        areEqualPluginOwnerSets(previous.slotOwners, slotOwners)
      ) {
        nextRecords.set(descriptor.name, previous);

        return [];
      }
      const retained = {
        ...previous,
        explicit,
        requiredBy: Object.freeze(requiredBy),
        slotOwners: Object.freeze(slotOwners),
      } satisfies PluginRecord;

      nextRecords.set(descriptor.name, retained);

      return [];
    }
    const order = previousOrder ?? nextOrder;

    if (previousOrder === undefined) nextOrder += 1;
    const record = createPluginRecord(entry, order);

    nextRecords.set(descriptor.name, record);

    return [record];
  });
  const requiredBy = new Map<string, Set<string>>();
  const slotOwners = new Map<string, Set<string>>();
  const nextRecordsByReference = new Map<PluginReference, PluginRecord>();

  for (const record of nextRecords.values()) {
    for (const reference of getPluginLookupReferences(record)) {
      nextRecordsByReference.set(reference, record);
    }
  }

  for (const record of nextRecords.values()) {
    for (const dependency of record.definition.dependencies ?? []) {
      const dependencyRecord = nextRecordsByReference.get(dependency);

      if (!dependencyRecord) continue;
      const dependencyName = dependencyRecord.descriptor.name;
      const owners = requiredBy.get(dependencyName) ?? new Set<string>();

      owners.add(record.descriptor.name);
      requiredBy.set(dependencyName, owners);
    }
    const slotInput = getPluginSlotInput(record.descriptor);

    if (!slotInput) continue;
    for (const slotDescriptor of normalizePluginInput(slotInput)) {
      const slotEntry =
        entriesByReference.get(slotDescriptor) ??
        createAuthoredPluginInput(slotDescriptor, record.editor);

      if (!slotEntry) continue;
      for (const entry of expandPluginInput(
        slotEntry,
        record.editor,
        entriesByReference,
        {
          kind: 'slot',
          owner: record.descriptor.name,
        }
      )) {
        const retained = nextRecords.get(entry.descriptor.name);

        if (!retained || retained.descriptor !== entry.descriptor) continue;
        for (const owner of entry.slotOwners) {
          const owners =
            slotOwners.get(entry.descriptor.name) ?? new Set<string>();

          owners.add(owner);
          slotOwners.set(entry.descriptor.name, owners);
        }
      }
    }
  }
  for (const [name, record] of nextRecords) {
    const dependencyOwners = new Set(requiredBy.get(name));
    const currentSlotOwners = new Set(slotOwners.get(name));

    if (
      areEqualPluginOwnerSets(record.requiredBy, dependencyOwners) &&
      areEqualPluginOwnerSets(record.slotOwners, currentSlotOwners)
    ) {
      continue;
    }
    nextRecords.set(name, {
      ...record,
      requiredBy: Object.freeze(dependencyOwners),
      slotOwners: Object.freeze(currentSlotOwners),
    });
  }
  const deactivatedRecords = [...previousRecords.values()].filter((record) => {
    const next = nextRecords.get(record.descriptor.name);

    return (
      !next ||
      next.editor !== record.editor ||
      next.definition !== record.definition ||
      next.descriptor !== record.descriptor
    );
  });

  return prepareRecordPublication(
    configurationEditor,
    state,
    previousRegistry,
    previousRecords,
    nextRecords,
    nextOrder,
    installedRecords,
    deactivatedRecords,
    latest.entries
      .filter((entry) => entry.explicit)
      .map((entry) => entry.descriptor.name),
    options
  );
};

export const preparePluginPublication = (
  editor: Editor,
  input: PluginInput
): PreparedPluginPublication =>
  prepareScopedPluginPublication(
    editor,
    normalizePluginInput(input).map((plugin) =>
      getDefined(createAuthoredPluginInput(plugin, editor))
    )
  );

/**
 * Initial construction is the only publication allowed to fill root defaults.
 *
 * @internal
 */
export const prepareInitialPluginPublication = (
  editor: Editor,
  input: PluginInput,
  initializeDocument: boolean | 'schema-contract'
): PreparedPluginPublication =>
  prepareScopedPluginPublication(
    editor,
    normalizePluginInput(input).map((plugin) =>
      getDefined(createAuthoredPluginInput(plugin, editor))
    ),
    initializeDocument === 'schema-contract'
      ? { initialPublication: true, validateDocument: false }
      : { initialPublication: true, initializeDocument }
  );

export const extendEditor = (
  editor: Editor,
  input: PluginInput,
  options: PluginReconfigureOptions = {}
): (() => void) => {
  let cleanup = () => {};
  const key = `editor.install:${(nextDynamicPluginPublication += 1)}`;

  runTrustedUpdate(editor, () => {
    stagePluginCandidate(
      editor,
      key,
      input,
      (nextCleanup) => {
        cleanup = nextCleanup;
      },
      editor,
      options
    );
  });

  return () => {
    cleanup();
  };
};
