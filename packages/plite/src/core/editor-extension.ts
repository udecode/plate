import type {
  BaseEditor,
  Editor,
  EditorCommitContext,
  EditorCorrection,
  EditorExtension,
  EditorExtensionActivationContext,
  EditorExtensionApiMap,
  EditorExtensionCleanupContext,
  EditorExtensionContribution,
  EditorExtensionConfigurationContext,
  EditorExtensionCommandContext,
  EditorExtensionPoint,
  EditorExtensionReadContext,
  EditorExtensionSchemaFactoryContext,
  EditorDocumentValue,
  EditorExtensionInput,
  EditorExtensionReconfigureOptions,
  EditorLifecycleErrorSink,
  EditorImmutableConfig,
  EditorNodeChangeContext,
  EditorStateField,
  EditorTextChangeContext,
  EditorTransactionChangeContext,
  EditorUpdateContext,
  RegisteredEditorExtension,
  ValueOf,
} from '../interfaces/editor';
import type { EditorSchemaDeclaration } from '../interfaces/schema';
import { ChangeDraft } from './change/builder';
import { DocumentChange } from './change/document-change';
import type { JsonEditorValue } from './change/tokens';
import { getEditorCommitSnapshot } from './commit';
import { registerCommandInRegistry } from './command-registry';
import { createCommandRegistration } from './command-definition';
import { createReadRegistration } from './read-definition';
import { registerReadInRegistry } from './read-registry';
import {
  createEditorSchema,
  type InternalEditorSchemaApi,
} from './editor-schema';
import {
  createExtensionRegistry,
  finalizeExtensionRegistry,
  getConfiguredExtensionRegistry,
  getExtensionRegistry,
  type ExtensionRegistry,
  type PublishedConfiguredExtensionRegistry,
  publishConfiguredExtensionRegistry,
  runWithEditorExtensionPublicationGuard,
  registerApiGroupInRegistry,
  registerCommitListenerInRegistry,
  registerEffectTypeInRegistry,
  registerExtensionContributionInRegistry,
  registerFacetProviderInRegistry,
  registerNodeChangeListenerInRegistry,
  registerCorrectionInRegistry,
  registerSelectionSpecInRegistry,
  registerStateFieldDescriptorInRegistry,
  registerStateGroupInRegistry,
  registerTextChangeListenerInRegistry,
  registerTransactionChangeListenerInRegistry,
  registerTxGroupInRegistry,
  validateConfiguredExtensionRegistry,
} from './extension-registry';
import { registerSchemaContribution } from './schema-contribution-registry';
import { normalizeEditorSchemaDeclaration } from './schema-definition';
import {
  areEditorSchemaIdentitiesEqual,
  type EditorSchemaContributionRecord,
  getEditorSchemaDeclarationKey,
  haveEquivalentEditorSchemaRuntimeValidationBindings,
} from './schema-compiler';

const EDITOR_EXTENSION_CONTRIBUTION_VALUES = new WeakMap<object, unknown>();

/** Define a typed extension point for ordered cross-extension contributions. */
export const defineExtensionPoint = <TValue>(
  id: string
): EditorExtensionPoint<TValue> => {
  if (!id) {
    throw new Error('Editor extension point id cannot be empty.');
  }

  const point = Object.freeze({
    id,
    of(value: TValue) {
      const contribution = Object.freeze({
        point,
      }) as EditorExtensionContribution<TValue>;

      EDITOR_EXTENSION_CONTRIBUTION_VALUES.set(contribution, value);

      return contribution;
    },
  });

  return point;
};

const getEditorExtensionContributionValue = (
  contribution: EditorExtensionContribution<unknown>
) => {
  if (!EDITOR_EXTENSION_CONTRIBUTION_VALUES.has(contribution)) {
    throw new Error(
      `Editor extension contribution "${contribution.point.id}" was not created by its point.`
    );
  }

  return EDITOR_EXTENSION_CONTRIBUTION_VALUES.get(contribution);
};
import { EditorSchemaValidationError } from './schema-validation';
import { toPublicRoot } from './public-root';
import { constructCanonicalDocumentChange } from './representation';
import {
  activateStateField,
  getEditorDocumentValue,
  runTrustedUpdate,
  stageEditorExtensionConfiguration,
} from './public-state';
import {
  EDITOR_EXTENSION_SLOT_INPUT,
  type InternalEditorExtensionSlotValue,
} from './extension-slot';
import {
  getEditorSchema,
  getEditorRuntimeOwner,
  getEditorRuntimeRoot,
  type InternalEditorExtensionPublicationEntry,
} from './editor-runtime';

type ExtensionRecord = {
  activation: ExtensionActivation | null;
  api: EditorExtensionApiMap | null;
  editor: Editor;
  explicit: boolean;
  extension: EditorExtension<Editor>;
  order: number;
  requiredBy: ReadonlySet<string>;
  slotOwners: ReadonlySet<string>;
};

type ExtensionState = {
  nextOrder: number;
  records: Map<string, ExtensionRecord>;
};

type ExtensionActivation = {
  abortController: AbortController;
  active: boolean;
  afterPublishCallbacks: Array<() => void>;
  cleanups: Array<(context: EditorExtensionCleanupContext) => void>;
  published: boolean;
};

const EXTENSION_STATE = new WeakMap<Editor, ExtensionState>();
const EXTENSION_ERROR_SINKS = new WeakMap<Editor, EditorLifecycleErrorSink>();
const CANONICAL_EDITOR_EXTENSIONS = new WeakSet<object>();
const CANONICAL_EDITOR_EXTENSION_BY_INPUT = new WeakMap<
  object,
  EditorExtension<any, any>
>();
const CANDIDATE_EDITOR_EXTENSION_APIS = new WeakMap<
  Editor,
  ReadonlyMap<EditorExtension<any, any>, EditorExtensionApiMap>
>();
let nextDynamicExtensionConfiguration = 0;

export const setEditorLifecycleErrorSink = (
  editor: Editor,
  sink: EditorLifecycleErrorSink | undefined
) => {
  const owner = getEditorRuntimeOwner(editor);

  if (sink) EXTENSION_ERROR_SINKS.set(owner, sink);
  else EXTENSION_ERROR_SINKS.delete(owner);
};

const reportExtensionLifecycleError = (
  editor: Editor,
  extension: string,
  phase: 'activate' | 'after-publish' | 'cleanup',
  cause: unknown
) =>
  reportEditorLifecycleError(
    Object.freeze({ cause, editor, extension, phase })
  );

export const reportEditorLifecycleError = (
  error: Parameters<EditorLifecycleErrorSink>[0]
) => {
  const sink = EXTENSION_ERROR_SINKS.get(getEditorRuntimeOwner(error.editor));

  if (sink) {
    try {
      sink(error);
      return;
    } catch (sinkError) {
      globalThis.console?.error(error, sinkError);
      return;
    }
  }

  globalThis.console?.error(error);
};

const assertSynchronousLifecycleResult = (result: unknown, label: string) => {
  if (
    result !== null &&
    (typeof result === 'object' || typeof result === 'function') &&
    typeof (result as { then?: unknown }).then === 'function'
  ) {
    throw new Error(`${label} must be synchronous.`);
  }
};

const getExtensionState = (editor: Editor) => {
  const owner = getEditorRuntimeOwner(editor);
  let state = EXTENSION_STATE.get(owner);

  if (!state) {
    state = {
      nextOrder: 0,
      records: new Map(),
    };
    EXTENSION_STATE.set(owner, state);
  }

  return state;
};

export const getCompiledEditorConfiguration = (editor: Editor) => {
  const registry = getConfiguredExtensionRegistry(editor);

  return Object.freeze({
    extensions: Object.freeze(
      [...registry.extensions.values()].sort(
        (left, right) => left.order - right.order
      )
    ),
    revision: registry.configurationRevision,
  });
};

const normalizeExtensionInput = <TEditor extends Editor>(
  input: EditorExtensionInput<TEditor>
) =>
  (Array.isArray(input) ? input : [input]).map((extension) =>
    canonicalizeEditorExtension(extension)
  );

type ExtensionEntry = {
  editor: Editor;
  explicit: boolean;
  extension: EditorExtension<Editor, any>;
  requiredBy: ReadonlySet<string>;
  slotOwners: ReadonlySet<string>;
};

type CanonicalExtensionSchemaResource = Readonly<{
  declarationKey: string;
  runtimeValidationBindings: readonly EditorSchemaContributionRecord[];
}>;

type CanonicalExtensionResource = Readonly<{
  key: PropertyKey;
  schema: CanonicalExtensionSchemaResource | null;
  value: unknown;
}>;

const CANONICAL_EDITOR_EXTENSION_RESOURCES = new WeakMap<
  object,
  ReadonlyMap<PropertyKey, CanonicalExtensionResource>
>();

const createCanonicalExtensionResourceRecord = <
  TExtension extends Readonly<{ name: string }>,
>(
  extension: TExtension
) => {
  const resources = new Map<PropertyKey, CanonicalExtensionResource>();

  for (const key of Reflect.ownKeys(extension)) {
    const value = Reflect.get(extension, key);
    let schemaResource: CanonicalExtensionSchemaResource | null = null;

    if (key === 'schema' && value !== undefined) {
      const runtimeValidationBindings = Object.freeze([
        Object.freeze({
          contribution: value as EditorSchemaDeclaration,
          extensionName: extension.name,
        }),
      ]);

      schemaResource = Object.freeze({
        declarationKey: getEditorSchemaDeclarationKey(
          runtimeValidationBindings
        ),
        runtimeValidationBindings,
      });
    }
    resources.set(key, Object.freeze({ key, schema: schemaResource, value }));
  }

  return resources as ReadonlyMap<PropertyKey, CanonicalExtensionResource>;
};

const expandExtensionInput = (
  input: EditorExtensionInput<any>,
  editor: Editor,
  relation:
    | Readonly<{ kind: 'dependency' | 'slot'; owner: string }>
    | Readonly<{ kind: 'explicit' }> = { kind: 'explicit' },
  visiting = new Set<EditorExtension>(),
  expanded = new Set<EditorExtension>()
): ExtensionEntry[] =>
  normalizeExtensionInput(input).flatMap((extension) => {
    const entry = {
      editor,
      explicit: relation.kind === 'explicit',
      extension: extension as EditorExtension<Editor, any>,
      requiredBy: new Set(
        relation.kind === 'dependency' ? [relation.owner] : []
      ),
      slotOwners: new Set(relation.kind === 'slot' ? [relation.owner] : []),
    };
    if (extension.enabled === false) return [entry];
    if (visiting.has(extension)) {
      throw new Error(
        `Editor extension "${extension.name}" has a cyclic dependency.`
      );
    }
    if (expanded.has(extension)) return [entry];

    visiting.add(extension);
    const dependencies = (extension.dependencies ?? []).flatMap(
      (dependency: EditorExtension) =>
        expandExtensionInput(
          dependency as EditorExtensionInput<any>,
          editor,
          { kind: 'dependency', owner: extension.name },
          visiting,
          expanded
        )
    );
    const slotInput = (extension as InternalEditorExtensionSlotValue)[
      EDITOR_EXTENSION_SLOT_INPUT
    ];

    if (!slotInput) {
      visiting.delete(extension);
      expanded.add(extension);

      return [...dependencies, entry];
    }
    const slotEntries = expandExtensionInput(
      slotInput,
      editor,
      { kind: 'slot', owner: extension.name },
      visiting,
      expanded
    );

    visiting.delete(extension);
    expanded.add(extension);

    return [...dependencies, entry, ...slotEntries];
  });

const getExtensionSlotId = (extensionName: string, slot: string) =>
  `${extensionName}:${slot}`;

const resolveLatestExtensionEntries = (
  entriesInput: readonly ExtensionEntry[]
) => {
  const entries = new Map<string, ExtensionEntry | null>();
  const fields = new Map<string, EditorStateField<any>>();

  for (const entry of entriesInput) {
    const { extension } = entry;
    assertNoUnsupportedSlots(extension);

    if (!extension.name) {
      throw new Error(
        `Editor extension must have a name (received keys: ${Object.keys(
          extension
        ).join(', ')}).`
      );
    }
    if (extension.enabled === false) {
      entries.delete(extension.name);
      entries.set(extension.name, null);
      continue;
    }
    for (const field of extension.stateFields ?? []) {
      const known = fields.get(field.key);

      if (known && known !== field) {
        throw new Error(
          `State field "${field.key}" conflicts with another descriptor identity in the same configuration.`
        );
      }
      fields.set(field.key, field);
    }

    const known = entries.get(extension.name);

    if (
      known &&
      known.extension !== extension &&
      !areEquivalentExtensions(known.extension, extension)
    ) {
      throw new Error(
        `Editor extension "${extension.name}" has multiple descriptor identities in the same configuration.`
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

    entries.delete(extension.name);
    entries.set(extension.name, merged);
  }

  return {
    entries: [...entries.values()].filter(
      (entry): entry is ExtensionEntry => entry !== null
    ),
    replacedNames: [...entries.keys()],
  };
};

const collectOwnedExtensionNames = (
  state: ExtensionState,
  owners: readonly string[]
) => {
  const requested = new Set(owners);
  const names = new Set<string>();

  for (const owner of requested) {
    const record = state.records.get(owner);

    if (
      !record ||
      [...record.requiredBy].every((requiredBy) => requested.has(requiredBy))
    ) {
      names.add(owner);
    }
  }
  let changed = true;

  while (changed) {
    changed = false;

    for (const [name, record] of state.records) {
      if (names.has(name) || record.explicit) continue;
      const owners = new Set([...record.requiredBy, ...record.slotOwners]);

      if (owners.size > 0 && [...owners].every((owner) => names.has(owner))) {
        names.add(name);
        changed = true;
      }
    }
  }

  return [...names];
};

const areEqualExtensionOwnerSets = (
  left: ReadonlySet<string>,
  right: ReadonlySet<string>
) => left.size === right.size && [...left].every((name) => right.has(name));

const getValidationStateWithoutReplacements = (
  state: ExtensionState,
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

type DefineEditorExtensionFor<TEditor extends BaseEditor<any>> = {
  <
    const TConfig,
    const TDeclaration extends EditorSchemaDeclaration,
    const TRest extends Omit<
      EditorExtension<TEditor, TConfig>,
      'config' | 'schema'
    >,
  >(
    extension: TRest & {
      config: TConfig & EditorImmutableConfig<TConfig>;
      schema: (
        context: EditorExtensionSchemaFactoryContext<TConfig>
      ) => TDeclaration;
    }
  ): Omit<TRest, 'config' | 'schema'> & {
    config: TConfig;
    schema: TDeclaration;
  };
  <
    const TConfig,
    const TRest extends Omit<EditorExtension<TEditor, TConfig>, 'config'>,
  >(
    extension: TRest & {
      config: TConfig & EditorImmutableConfig<TConfig>;
    }
  ): Omit<TRest, 'config'> & { config: TConfig };
  <const TConfig, const TExtension extends EditorExtension<TEditor, TConfig>>(
    extension: NoExtraEditorExtensionProperties<
      TExtension,
      EditorExtension<TEditor, TConfig>
    >
  ): TExtension extends Readonly<{
    schema: (
      ...args: any[]
    ) => infer TInferredDeclaration extends EditorSchemaDeclaration;
  }>
    ? Omit<TExtension, 'schema'> & Readonly<{ schema: TInferredDeclaration }>
    : TExtension;
};

type DefineEditorExtension = DefineEditorExtensionFor<Editor> &
  (<
    TEditor extends BaseEditor<any> = Editor,
  >() => DefineEditorExtensionFor<TEditor>);

type NoExtraEditorExtensionProperties<
  TExtension extends EditorExtension<any, any>,
  TShape extends EditorExtension<any, any>,
> = TExtension & Record<Exclude<keyof TExtension, keyof TShape>, never>;

const functionSource = Function.prototype.toString;
const objectConstructorSource = functionSource.call(Object);

const hasIntrinsicConstructor = (
  prototype: object,
  constructorSource: string
) => {
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'constructor');

  return (
    Object.hasOwn(descriptor ?? {}, 'value') &&
    typeof descriptor?.value === 'function' &&
    functionSource.call(descriptor.value) === constructorSource
  );
};

const isObjectPrototype = (prototype: object | null) =>
  prototype === null ||
  (Object.getPrototypeOf(prototype) === null &&
    hasIntrinsicConstructor(prototype, objectConstructorSource));

const cloneFrozenExtensionConfig = <T>(
  value: T,
  ancestors = new Set<object>()
): T => {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return value;
  }
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value;

    throw new TypeError(
      'Editor extension config accepts only finite JSON numbers.'
    );
  }
  if (typeof value !== 'object') {
    throw new TypeError(
      'Editor extension config accepts only plain immutable data. Keep functions and runtime resources in the extension factory closure.'
    );
  }
  if (ancestors.has(value)) {
    throw new TypeError('Editor extension config cannot be cyclic.');
  }

  const prototype = Object.getPrototypeOf(value);

  if (
    !Array.isArray(value) &&
    prototype !== Object.prototype &&
    prototype !== null
  ) {
    throw new TypeError(
      'Editor extension config accepts only plain immutable data. Keep class instances and runtime resources in the extension factory closure.'
    );
  }

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return Object.freeze(
        value.map((item) => cloneFrozenExtensionConfig(item, ancestors))
      ) as T;
    }

    const clone: Record<string, unknown> = {};

    for (const key of Reflect.ownKeys(value)) {
      if (typeof key !== 'string') {
        throw new TypeError(
          'Editor extension config accepts only string-keyed plain data.'
        );
      }
      const descriptor = Object.getOwnPropertyDescriptor(value, key);

      if (
        !descriptor ||
        !Object.hasOwn(descriptor, 'value') ||
        descriptor.enumerable === false
      ) {
        throw new TypeError(
          'Editor extension config cannot contain property accessors or hidden properties.'
        );
      }

      clone[key] = cloneFrozenExtensionConfig(descriptor.value, ancestors);
    }

    return Object.freeze(clone) as T;
  } finally {
    ancestors.delete(value);
  }
};

const canonicalizeEditorExtension = <
  TEditor extends BaseEditor<any>,
  TConfig,
  TExtension extends EditorExtension<TEditor, TConfig>,
>(
  extension: TExtension
): TExtension => {
  if (CANONICAL_EDITOR_EXTENSIONS.has(extension)) return extension;
  const cached = CANONICAL_EDITOR_EXTENSION_BY_INPUT.get(extension);

  if (cached) return cached as TExtension;
  const canonical = { ...extension } as Record<PropertyKey, unknown>;
  const listKeys = [
    'conflicts',
    'contributions',
    'corrections',
    'dependencies',
    'effectTypes',
    'facetProviders',
    'selectionKinds',
    'stateFields',
  ] as const;

  for (const key of listKeys) {
    const value = canonical[key];

    if (Array.isArray(value)) {
      canonical[key] = Object.freeze(Array.from(value));
    }
  }
  if (extension.config !== undefined) {
    canonical.config = cloneFrozenExtensionConfig(extension.config);
  }
  if (extension.on) {
    canonical.on = Object.freeze({ ...extension.on });
  }
  if (extension.schema) {
    const declaration =
      typeof extension.schema === 'function'
        ? extension.schema(
            Object.freeze({
              config: canonical.config as EditorImmutableConfig<TConfig>,
              name: extension.name,
            })
          )
        : extension.schema;

    canonical.schema = normalizeEditorSchemaDeclaration(declaration);
  }
  const slotInput = (extension as InternalEditorExtensionSlotValue)[
    EDITOR_EXTENSION_SLOT_INPUT
  ];

  if (slotInput) {
    canonical[EDITOR_EXTENSION_SLOT_INPUT] = Object.freeze(
      normalizeExtensionInput(slotInput)
    );
  }
  for (const key of ['api', 'state', 'tx'] as const) {
    const value = canonical[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      canonical[key] = Object.freeze({ ...value });
    }
  }

  const result = Object.freeze(canonical) as TExtension;

  CANONICAL_EDITOR_EXTENSION_RESOURCES.set(
    result,
    createCanonicalExtensionResourceRecord(result)
  );
  CANONICAL_EDITOR_EXTENSIONS.add(result);
  CANONICAL_EDITOR_EXTENSION_BY_INPUT.set(extension, result);

  return result;
};

/**
 * Defines an editor extension while preserving literal names, declared slots,
 * and compile-time rejection of unsupported extension keys.
 *
 * Use the curried form to bind an extension to a specific editor type before
 * passing the descriptor.
 */
export const defineEditorExtension = ((
  extension?: EditorExtension<any, any>
) =>
  extension === undefined
    ? <const TExtension extends EditorExtension<any, any>>(
        typedExtension: TExtension
      ) => canonicalizeEditorExtension(typedExtension)
    : canonicalizeEditorExtension(extension)) as DefineEditorExtension;

export const resolveInstalledEditorExtension = (
  editor: Editor,
  extension: EditorExtension<any, any>
) => {
  const canonical = CANONICAL_EDITOR_EXTENSIONS.has(extension)
    ? extension
    : CANONICAL_EDITOR_EXTENSION_BY_INPUT.get(extension);

  if (!canonical) return;
  const installed =
    getExtensionRegistry(editor).extensionsByDescriptor.get(
      canonical
    )?.descriptor;

  return installed === canonical ? installed : undefined;
};

/** @internal Read the resolved API map for one installed extension name. */
export const getInstalledEditorExtensionApi = (
  editor: Editor,
  name: string
): EditorExtensionApiMap | undefined =>
  getExtensionState(editor).records.get(name)?.api ?? undefined;

/** @internal Read an API map while a detached candidate is compiling. */
export const getCandidateEditorExtensionApi = (
  editor: Editor,
  extension: EditorExtension<any, any>
) => {
  const canonical = CANONICAL_EDITOR_EXTENSIONS.has(extension)
    ? extension
    : CANONICAL_EDITOR_EXTENSION_BY_INPUT.get(extension);

  return canonical
    ? CANDIDATE_EDITOR_EXTENSION_APIS.get(getEditorRuntimeOwner(editor))?.get(
        canonical
      )
    : undefined;
};

/** @internal Read ordered values from one published extension point. */
export const getEditorExtensionContributions = <TValue>(
  editor: Editor,
  point: EditorExtensionPoint<TValue>
) =>
  Object.freeze(
    (getExtensionRegistry(editor).contributions.get(point) ?? []).map(
      ({ value }) => value as Readonly<TValue>
    )
  );

/** @internal Read the exact descriptor installed for one extension name. */
export const getInstalledEditorExtension = (
  editor: Editor,
  name: string
): EditorExtension<any, any> | undefined =>
  getExtensionState(getEditorRuntimeOwner(editor)).records.get(name)?.extension;

const assertNoUnsupportedSlots = (extension: EditorExtension<Editor, any>) => {
  const methods = (extension as unknown as { methods?: unknown }).methods;
  const commitListeners = (
    extension as unknown as { commitListeners?: unknown }
  ).commitListeners;
  const register = (extension as unknown as { register?: unknown }).register;

  if (methods !== undefined) {
    throw new Error(
      `Editor extension "${extension.name}" cannot use methods. Add state or tx groups instead.`
    );
  }

  if (commitListeners !== undefined) {
    throw new Error(
      `Editor extension "${extension.name}" cannot use commitListeners. Add on.commit instead.`
    );
  }

  if (register !== undefined) {
    throw new Error(
      `Editor extension "${extension.name}" cannot use register. Declare extension resources directly.`
    );
  }
};

const getInstalledConflict = (
  state: ExtensionState,
  extension: EditorExtension<Editor, any>
) => {
  for (const [installedName, record] of state.records) {
    if (
      extension.conflicts?.includes(record.extension) ||
      record.extension.conflicts?.includes(extension)
    ) {
      return installedName;
    }
  }

  return null;
};

const getPendingConflict = (
  extension: EditorExtension<Editor, any>,
  pending: Map<string, EditorExtension<Editor, any>>
) => {
  for (const [pendingName, pendingExtension] of pending) {
    if (pendingName === extension.name) {
      continue;
    }

    if (
      extension.conflicts?.includes(pendingExtension) ||
      pendingExtension.conflicts?.includes(extension)
    ) {
      return pendingName;
    }
  }

  return null;
};

const resolveExtensionOrder = (
  state: ExtensionState,
  extensions: readonly EditorExtension<Editor, any>[]
) => {
  const pending = new Map<string, EditorExtension<Editor, any>>();
  const ordered: EditorExtension<Editor, any>[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  for (const extension of extensions) {
    pending.set(extension.name, extension);
  }

  for (const extension of extensions) {
    const installedConflict = getInstalledConflict(state, extension);

    if (installedConflict) {
      throw new Error(
        `Editor extension "${extension.name}" conflicts with "${installedConflict}".`
      );
    }

    const pendingConflict = getPendingConflict(extension, pending);

    if (pendingConflict) {
      throw new Error(
        `Editor extension "${extension.name}" conflicts with "${pendingConflict}".`
      );
    }
  }

  const visit = (extension: EditorExtension<Editor, any>) => {
    if (visited.has(extension.name)) {
      return;
    }

    if (visiting.has(extension.name)) {
      throw new Error(
        `Editor extension "${extension.name}" has a cyclic dependency.`
      );
    }

    visiting.add(extension.name);

    for (const dependency of extension.dependencies ?? []) {
      const pendingDependency = pending.get(dependency.name);

      if (pendingDependency) {
        if (
          pendingDependency !== dependency &&
          !areEquivalentExtensions(pendingDependency, dependency)
        ) {
          throw new Error(
            `Editor extension "${extension.name}" dependency "${dependency.name}" resolves to a different descriptor.`
          );
        }
        visit(pendingDependency);
        continue;
      }

      const installedDependency = state.records.get(dependency.name);

      if (!installedDependency) {
        throw new Error(
          `Editor extension "${extension.name}" has missing dependency "${dependency.name}".`
        );
      }
      if (
        installedDependency.extension !== dependency &&
        !areEquivalentExtensions(installedDependency.extension, dependency)
      ) {
        throw new Error(
          `Editor extension "${extension.name}" dependency "${dependency.name}" resolves to a different descriptor.`
        );
      }
    }

    visiting.delete(extension.name);
    visited.add(extension.name);
    ordered.push(extension);
  };

  for (const extension of extensions) {
    visit(extension);
  }

  return ordered;
};

const registerExtensionSlots = <TEditor extends Editor>(
  editor: TEditor,
  record: ExtensionRecord,
  registry: ExtensionRegistry<TEditor>,
  api: EditorExtensionApiMap | null = record.api
) => {
  const extension = record.extension as EditorExtension<TEditor, any>;
  const cleanups: Array<() => void> = [];
  const registerSlots = (slots: EditorExtension<TEditor, any>) => {
    assertNoUnsupportedSlots(slots as EditorExtension<Editor, any>);
    const commandContext: EditorExtensionCommandContext<TEditor> =
      Object.freeze({
        around: (command, handler) =>
          createCommandRegistration(command, 'around', handler),
        handle: (command, handler) =>
          createCommandRegistration(command, 'handle', handler),
      });

    for (const registration of slots.commands?.(commandContext) ?? []) {
      cleanups.push(registerCommandInRegistry(registry.commands, registration));
    }
    const readContext: EditorExtensionReadContext<TEditor> = Object.freeze({
      around: (read, handler) => createReadRegistration(read, handler as never),
    });

    for (const registration of slots.read?.(readContext) ?? []) {
      cleanups.push(registerReadInRegistry(registry.reads, registration));
    }

    for (const [name, value] of Object.entries(api ?? {})) {
      const values = Array.isArray(value) ? value : [value];

      for (const value of values) {
        cleanups.push(registerApiGroupInRegistry(registry, name, value));
      }
    }

    for (const [sourceIndex, contribution] of (
      slots.contributions ?? []
    ).entries()) {
      cleanups.push(
        registerExtensionContributionInRegistry(
          registry,
          contribution.point,
          Object.freeze({
            owner: extension,
            sourceIndex,
            value: getEditorExtensionContributionValue(contribution),
          })
        )
      );
    }

    for (const field of slots.stateFields ?? []) {
      cleanups.push(
        registerStateFieldDescriptorInRegistry(registry, extension.name, field)
      );
    }

    for (const type of slots.effectTypes ?? []) {
      cleanups.push(
        registerEffectTypeInRegistry(registry, extension.name, type)
      );
    }

    if (slots.schema) {
      if (typeof slots.schema === 'function') {
        throw new Error(
          `Editor extension "${extension.name}" schema factory was not normalized.`
        );
      }
      cleanups.push(
        registerSchemaContribution(
          registry.schemaContributions,
          extension.name,
          slots.schema
        )
      );
    }

    for (const provider of slots.facetProviders ?? []) {
      cleanups.push(registerFacetProviderInRegistry(registry, provider));
    }

    for (const [index, correction] of (slots.corrections ?? []).entries()) {
      cleanups.push(
        registerCorrectionInRegistry(
          registry,
          getExtensionSlotId(extension.name, `corrections.${index}`),
          correction as EditorCorrection<TEditor>
        )
      );
    }

    if (slots.on?.commit) {
      cleanups.push(
        registerCommitListenerInRegistry(registry, (commit) => {
          slots.on?.commit?.({
            commit,
            editor,
            snapshot: getEditorCommitSnapshot(
              commit,
              getEditorRuntimeRoot(editor)
            ),
          } as EditorCommitContext<TEditor>);
        })
      );
    }

    if (slots.on?.nodeChange) {
      cleanups.push(
        registerNodeChangeListenerInRegistry(registry, (context) =>
          slots.on?.nodeChange?.({
            ...context,
            editor,
          } as EditorNodeChangeContext<TEditor>)
        )
      );
    }

    if (slots.on?.textChange) {
      cleanups.push(
        registerTextChangeListenerInRegistry(registry, (context) =>
          slots.on?.textChange?.({
            ...context,
            editor,
          } as EditorTextChangeContext<TEditor>)
        )
      );
    }

    if (slots.on?.transactionChange) {
      cleanups.push(
        registerTransactionChangeListenerInRegistry(registry, (context) =>
          slots.on?.transactionChange?.({
            ...context,
            editor,
          } as EditorTransactionChangeContext<TEditor>)
        )
      );
    }

    for (const spec of slots.selectionKinds ?? []) {
      cleanups.push(
        registerSelectionSpecInRegistry(registry, extension.name, spec)
      );
    }

    for (const groupName of Object.keys(slots.state ?? {})) {
      const factory = slots.state?.[groupName];

      if (factory) {
        cleanups.push(
          registerStateGroupInRegistry(
            registry,
            extension.name,
            groupName,
            (state) => factory(state, editor)
          )
        );
      }
    }

    for (const groupName of Object.keys(slots.tx ?? {})) {
      const factory = slots.tx?.[groupName];

      if (factory) {
        cleanups.push(
          registerTxGroupInRegistry(
            registry,
            extension.name,
            groupName,
            (transaction, _runtimeEditor, context) =>
              factory(
                transaction,
                editor,
                Object.freeze({
                  afterCommit(handler) {
                    context.afterCommit(({ commit, snapshot }) => {
                      handler({
                        commit,
                        editor,
                        snapshot,
                      });
                    });
                  },
                }) as EditorUpdateContext<TEditor>
              )
          )
        );
      }
    }
  };

  try {
    registerSlots(extension);
  } catch (error) {
    for (const cleanup of cleanups.slice().reverse()) {
      cleanup();
    }

    throw error;
  }

  return cleanups;
};

const deactivateExtensionRecord = (
  record: ExtensionRecord,
  reason: EditorExtensionCleanupContext['reason']
) => {
  const activation = record.activation;
  const errors: unknown[] = [];
  const cleanupContext = Object.freeze({
    reason,
  }) satisfies EditorExtensionCleanupContext;

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
        cleanup(cleanupContext),
        `Editor extension "${record.extension.name}" cleanup`
      );
    } catch (error) {
      errors.push(error);
    }
  }
  record.activation = null;

  return errors;
};

const activateExtensionRecord = <TEditor extends Editor>(
  editor: TEditor,
  record: ExtensionRecord
) => {
  if (record.activation) {
    throw new Error(
      `Editor extension "${record.extension.name}" cannot activate twice.`
    );
  }

  const activation: ExtensionActivation = {
    abortController: new AbortController(),
    active: true,
    afterPublishCallbacks: [],
    cleanups: [],
    published: false,
  };
  record.activation = activation;
  const extension = record.extension as EditorExtension<TEditor, any>;
  const context = Object.freeze({
    name: extension.name,
    onCleanup(cleanup) {
      if (!activation.active) {
        throw new Error(
          `Editor extension "${extension.name}" cannot register cleanup after deactivation.`
        );
      }
      if (typeof cleanup !== 'function') {
        throw new Error('Editor extension cleanup must be a function.');
      }

      activation.cleanups.push(cleanup);
    },
    afterPublish(callback) {
      if (!activation.active || activation.published) {
        throw new Error(
          `Editor extension "${extension.name}" cannot register after-publish work after publication.`
        );
      }
      if (typeof callback !== 'function') {
        throw new Error(
          'Editor extension after-publish callback must be a function.'
        );
      }

      activation.afterPublishCallbacks.push(callback);
    },
    config: extension.config,
    root: toPublicRoot(getEditorRuntimeRoot(editor)),
    schema: createEditorSchema(() => editor),
    signal: activation.abortController.signal,
  } satisfies EditorExtensionActivationContext<any>);

  try {
    assertSynchronousLifecycleResult(
      extension.activate?.(editor, context),
      `Editor extension "${extension.name}" activation`
    );
  } catch (error) {
    const cleanupErrors = deactivateExtensionRecord(record, 'rollback');

    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        `Editor extension "${extension.name}" activation and cleanup failed.`
      );
    }
    throw error;
  }
};

const runExtensionAfterPublish = (editor: Editor, record: ExtensionRecord) => {
  const activation = record.activation;

  if (!activation?.active || activation.published) return;
  activation.published = true;

  for (const callback of activation.afterPublishCallbacks) {
    try {
      assertSynchronousLifecycleResult(
        callback(),
        `Editor extension "${record.extension.name}" after-publish callback`
      );
    } catch (cause) {
      reportExtensionLifecycleError(
        editor,
        record.extension.name,
        'after-publish',
        cause
      );
    }
  }
  activation.afterPublishCallbacks = [];
};

const getInstalledExtensionRecords = (
  state: ExtensionState,
  installedNames: readonly string[]
) =>
  installedNames
    .map((name) => state.records.get(name))
    .filter((record): record is ExtensionRecord => record !== undefined)
    .sort((a, b) => a.order - b.order);

const getRegisteredExtension = (
  record: ExtensionRecord,
  records: ReadonlyMap<string, ExtensionRecord>
): RegisteredEditorExtension => ({
  conflicts: Object.freeze([...(record.extension.conflicts ?? [])]),
  dependencies: Object.freeze([...(record.extension.dependencies ?? [])]),
  descriptor: record.extension,
  name: record.extension.name,
  order: record.order,
  requiredBy: Object.freeze(
    new Set(
      [...record.requiredBy]
        .map((name) => records.get(name))
        .filter((owner): owner is ExtensionRecord => owner !== undefined)
        .map(({ extension }) => extension)
    )
  ),
});

const resolveExtensionApi = <TEditor extends Editor>(
  editor: TEditor,
  extension: EditorExtension<TEditor, any>,
  context?: EditorExtensionConfigurationContext<TEditor, any>
) => {
  if (typeof extension.api === 'function' && !context) {
    throw new Error(
      `Editor extension "${extension.name}" API factory requires a candidate configuration context.`
    );
  }

  const api =
    typeof extension.api === 'function'
      ? extension.api(
          editor as EditorExtensionConfigurationContext<TEditor, any>['editor'],
          context!
        )
      : (extension.api ?? {});

  assertSynchronousLifecycleResult(
    api,
    `Editor extension "${extension.name}" API factory`
  );

  if (!api || typeof api !== 'object' || Array.isArray(api)) {
    throw new Error(
      `Editor extension "${extension.name}" API factory must return an object.`
    );
  }

  return Object.freeze({ ...api });
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

/** @internal Resolve extension APIs against a root-scoped editor view. */
export const createEditorViewExtensionApis = <TEditor extends Editor<any, any>>(
  editor: TEditor,
  source: Editor
): Pick<TEditor, 'api' | 'getApi'> => {
  let cachedRegistry: ExtensionRegistry | undefined;
  let apiGroups = new Map<string, unknown[]>();
  let descriptorApis = new Map<EditorExtension, EditorExtensionApiMap>();

  const refresh = () => {
    const registry = getExtensionRegistry(source);

    if (registry === cachedRegistry) return;

    const nextApiGroups = new Map<string, unknown[]>();
    const nextDescriptorApis = new Map<
      EditorExtension,
      EditorExtensionApiMap
    >();
    const schema = getEditorSchema(editor);

    for (const extension of registry.dependencyOrder) {
      if (registry.extensions.get(extension.name)?.descriptor !== extension) {
        continue;
      }
      const viewExtension = extension as EditorExtension<TEditor, any>;

      const extensionApi =
        typeof extension.api === 'function'
          ? resolveExtensionApi(
              editor,
              viewExtension,
              createExtensionConfigurationContext(
                editor,
                viewExtension,
                registry as ExtensionRegistry<TEditor>,
                schema
              )
            )
          : (getInstalledEditorExtensionApi(source, extension.name) ?? {});

      nextDescriptorApis.set(extension, extensionApi);

      for (const [name, value] of Object.entries(extensionApi)) {
        const values = nextApiGroups.get(name) ?? [];

        values.push(...(Array.isArray(value) ? value : [value]));
        nextApiGroups.set(name, values);
      }
    }

    cachedRegistry = registry;
    apiGroups = nextApiGroups;
    descriptorApis = nextDescriptorApis;
  };
  const resolveValue = (
    installedName: string,
    installedApi: EditorExtensionApiMap
  ) => {
    const apiNames = Object.keys(installedApi);
    const capabilityName = apiNames.includes(installedName)
      ? installedName
      : (apiNames[0] ?? installedName);

    if (apiNames.length > 1 && !apiNames.includes(installedName)) {
      throw new Error(
        `Editor extension "${installedName}" must expose exactly one API group or an API group matching its extension name to be used with editor.getApi().`
      );
    }
    const capability = installedApi[capabilityName];

    if (capability === undefined) {
      throw new Error(
        `Editor extension "${installedName}" API group "${capabilityName}" is not installed.`
      );
    }

    return Array.isArray(capability)
      ? resolveEditorApiCapability(capability)
      : capability;
  };
  const api = new Proxy(Object.create(null) as Record<string, unknown>, {
    get(_target, property) {
      if (typeof property !== 'string') return;

      refresh();
      const values = apiGroups.get(property);

      return values?.length ? resolveEditorApiCapability(values) : undefined;
    },
  }) as TEditor['api'];
  const getApi = ((extension: EditorExtension<any, any>) => {
    const candidateApi = getCandidateEditorExtensionApi(editor, extension);

    if (candidateApi) return resolveValue(extension.name, candidateApi);
    const installed = resolveInstalledEditorExtension(source, extension);

    if (!installed) {
      throw new Error(
        `Editor extension "${extension.name}" is not installed on this editor.`
      );
    }

    refresh();

    return resolveValue(
      installed.name,
      descriptorApis.get(installed) ??
        getInstalledEditorExtensionApi(source, installed.name) ??
        {}
    );
  }) as TEditor['getApi'];

  return Object.freeze({ api, getApi }) as Pick<TEditor, 'api' | 'getApi'>;
};

const createExtensionRecord = <TEditor extends Editor>(
  entry: ExtensionEntry,
  order: number
) =>
  ({
    activation: null,
    api:
      typeof entry.extension.api === 'function'
        ? null
        : resolveExtensionApi(
            entry.editor as TEditor,
            entry.extension as EditorExtension<TEditor, any>
          ),
    editor: entry.editor,
    explicit: entry.explicit,
    extension: entry.extension,
    order,
    requiredBy: Object.freeze(new Set(entry.requiredBy)),
    slotOwners: Object.freeze(new Set(entry.slotOwners)),
  }) satisfies ExtensionRecord;

const getOrderedExtensionRecords = (
  records: ReadonlyMap<string, ExtensionRecord>
) => {
  const ordered: ExtensionRecord[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (record: ExtensionRecord) => {
    const name = record.extension.name;

    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(`Editor extension "${name}" has a cyclic dependency.`);
    }

    visiting.add(name);
    for (const dependency of record.extension.dependencies ?? []) {
      const dependencyRecord = records.get(dependency.name);

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

const validateCompleteExtensionGraph = (
  records: ReadonlyMap<string, ExtensionRecord>
) => {
  for (const record of records.values()) {
    const extension = record.extension;

    for (const dependency of extension.dependencies ?? []) {
      const installed = records.get(dependency.name);

      if (!installed) {
        throw new Error(
          `Editor extension "${extension.name}" has missing dependency "${dependency.name}".`
        );
      }
      if (
        installed.extension !== dependency &&
        !areEquivalentExtensions(installed.extension, dependency)
      ) {
        throw new Error(
          `Editor extension "${extension.name}" dependency "${dependency.name}" resolves to a different descriptor.`
        );
      }
    }
    for (const conflict of extension.conflicts ?? []) {
      if (records.get(conflict.name)?.extension === conflict) {
        throw new Error(
          `Editor extension "${extension.name}" conflicts with "${conflict.name}".`
        );
      }
    }
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();
  const visit = (name: string) => {
    if (visited.has(name)) return;
    if (visiting.has(name)) {
      throw new Error(`Editor extension "${name}" has a cyclic dependency.`);
    }

    visiting.add(name);
    for (const dependency of records.get(name)?.extension.dependencies ?? []) {
      visit(dependency.name);
    }
    visiting.delete(name);
    visited.add(name);
  };

  for (const name of records.keys()) visit(name);
};

const sameExtensionRecords = (
  left: ReadonlyMap<string, ExtensionRecord>,
  right: ReadonlyMap<string, ExtensionRecord>
) =>
  left.size === right.size &&
  [...left].every(([name, record]) => right.get(name) === record);

const areEquivalentExtensionInputs = (
  left: EditorExtensionInput<any>,
  right: EditorExtensionInput<any>
): boolean => {
  const leftItems = normalizeExtensionInput(left);
  const rightItems = normalizeExtensionInput(right);

  return (
    leftItems.length === rightItems.length &&
    leftItems.every((extension, index) =>
      areEquivalentExtensions(extension, rightItems[index]!)
    )
  );
};

const IMMUTABLE_EXTENSION_RESOURCE_KEYS = new Set<PropertyKey>(['config']);
const ORDERED_VALUE_EXTENSION_RESOURCE_KEYS = new Set<PropertyKey>([
  'conflicts',
  'dependencies',
]);
const ORDERED_IDENTITY_EXTENSION_RESOURCE_KEYS = new Set<PropertyKey>([
  'contributions',
  'corrections',
  'effectTypes',
  'facetProviders',
  'selectionKinds',
  'stateFields',
]);
const KEYED_IDENTITY_EXTENSION_RESOURCE_KEYS = new Set<PropertyKey>([
  'api',
  'state',
  'tx',
]);

const areEquivalentImmutableExtensionValues = (
  left: unknown,
  right: unknown,
  leftPairs = new WeakMap<object, object>(),
  rightPairs = new WeakMap<object, object>()
): boolean => {
  if (Object.is(left, right)) return true;
  if (
    !left ||
    !right ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  ) {
    return false;
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    if (
      !Array.isArray(left) ||
      !Array.isArray(right) ||
      left.length !== right.length
    ) {
      return false;
    }
  } else if (
    !isObjectPrototype(Object.getPrototypeOf(left)) ||
    !isObjectPrototype(Object.getPrototypeOf(right))
  ) {
    return false;
  }

  const knownRight = leftPairs.get(left);

  if (knownRight) return knownRight === right;
  const knownLeft = rightPairs.get(right);

  if (knownLeft) return knownLeft === left;
  leftPairs.set(left, right);
  rightPairs.set(right, left);

  const leftKeys = Reflect.ownKeys(left);
  const rightKeys = Reflect.ownKeys(right);

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key) => {
    if (!rightKeys.includes(key)) return false;
    const leftDescriptor = Object.getOwnPropertyDescriptor(left, key);
    const rightDescriptor = Object.getOwnPropertyDescriptor(right, key);

    return Boolean(
      leftDescriptor &&
        rightDescriptor &&
        Object.hasOwn(leftDescriptor, 'value') &&
        Object.hasOwn(rightDescriptor, 'value') &&
        areEquivalentImmutableExtensionValues(
          leftDescriptor.value,
          rightDescriptor.value,
          leftPairs,
          rightPairs
        )
    );
  });
};

const areEquivalentOrderedIdentityResources = (left: unknown, right: unknown) =>
  Array.isArray(left) &&
  Array.isArray(right) &&
  left.length === right.length &&
  left.every((value, index) => Object.is(value, right[index]));

const areEquivalentKeyedIdentityResources = (left: unknown, right: unknown) => {
  if (Object.is(left, right)) return true;
  if (
    !left ||
    !right ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  ) {
    return false;
  }
  const leftKeys = Reflect.ownKeys(left);
  const rightKeys = Reflect.ownKeys(right);

  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key) =>
        rightKeys.includes(key) &&
        Object.is(Reflect.get(left, key), Reflect.get(right, key))
    )
  );
};

const areEquivalentNormalizedExtensionResources = (
  left: CanonicalExtensionResource,
  right: CanonicalExtensionResource
) => {
  const { key } = left;

  if (key !== right.key) return false;
  if (left.schema || right.schema) {
    return Boolean(
      left.schema &&
        right.schema &&
        left.schema.declarationKey === right.schema.declarationKey &&
        haveEquivalentEditorSchemaRuntimeValidationBindings(
          left.schema.runtimeValidationBindings,
          right.schema.runtimeValidationBindings
        )
    );
  }
  if (key === EDITOR_EXTENSION_SLOT_INPUT) {
    return areEquivalentExtensionInputs(
      left.value as EditorExtensionInput<any>,
      right.value as EditorExtensionInput<any>
    );
  }
  if (
    IMMUTABLE_EXTENSION_RESOURCE_KEYS.has(key) ||
    ORDERED_VALUE_EXTENSION_RESOURCE_KEYS.has(key)
  ) {
    return areEquivalentImmutableExtensionValues(left.value, right.value);
  }
  if (ORDERED_IDENTITY_EXTENSION_RESOURCE_KEYS.has(key)) {
    return areEquivalentOrderedIdentityResources(left.value, right.value);
  }
  if (KEYED_IDENTITY_EXTENSION_RESOURCE_KEYS.has(key)) {
    return areEquivalentKeyedIdentityResources(left.value, right.value);
  }

  return Object.is(left.value, right.value);
};

const areEquivalentExtensions = (
  left: EditorExtension<Editor, any>,
  right: EditorExtension<Editor, any>
): boolean => {
  if (left === right) return true;
  const leftResources = CANONICAL_EDITOR_EXTENSION_RESOURCES.get(left);
  const rightResources = CANONICAL_EDITOR_EXTENSION_RESOURCES.get(right);

  return (
    leftResources !== undefined &&
    rightResources !== undefined &&
    leftResources.size === rightResources.size &&
    [...leftResources].every(([key, resource]) => {
      const candidate = rightResources.get(key);

      return Boolean(
        candidate &&
          areEquivalentNormalizedExtensionResources(resource, candidate)
      );
    })
  );
};

type EditorExtensionPublicationOptions = EditorExtensionReconfigureOptions &
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
  const builder = new ChangeDraft(current as JsonEditorValue, {
    assertCanonical: (candidate, accumulated) => {
      if (
        !constructCanonicalDocumentChange(editor, candidate, accumulated, {
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
    validate: (candidate) =>
      schema.validateDocument(candidate as EditorDocumentValue),
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
  previousRegistry: ExtensionRegistry<TEditor>,
  previousSchemaRevision: number,
  nextRecords: ReadonlyMap<string, ExtensionRecord>,
  resolvedApis: ReadonlyMap<string, EditorExtensionApiMap> = new Map(),
  options: EditorExtensionPublicationOptions = {}
) => {
  validateCompleteExtensionGraph(nextRecords);

  const registry = createExtensionRegistry<TEditor>({
    configurationRevision: previousRegistry.configurationRevision + 1,
    schemaRevision: previousSchemaRevision,
    stateFieldIdentities: previousRegistry.stateFieldIdentities,
  });
  const cleanups: Array<() => void> = [];

  try {
    for (const record of getOrderedExtensionRecords(nextRecords)) {
      const registered = getRegisteredExtension(record, nextRecords);

      registry.extensions.set(record.extension.name, registered);
      registry.extensionsByDescriptor.set(record.extension, registered);
      registry.dependencyOrder = [
        ...registry.dependencyOrder,
        record.extension,
      ];
      cleanups.push(
        ...registerExtensionSlots(
          record.editor as TEditor,
          record,
          registry,
          typeof record.extension.api === 'function'
            ? (resolvedApis.get(record.extension.name) ?? null)
            : record.api
        )
      );
    }
  } catch (error) {
    for (const cleanup of cleanups.toReversed()) cleanup();
    throw error;
  }

  const preview = validateConfiguredExtensionRegistry(editor, registry);
  const previousIdentity =
    getExtensionRegistry(editor).schemaContributions.compiled?.identity ?? null;
  const nextIdentity = preview.schemaContributions.compiled?.identity ?? null;
  const declarativeSchemaChanged = !areEditorSchemaIdentitiesEqual(
    previousIdentity,
    nextIdentity
  );

  registry.schemaRevision =
    previousSchemaRevision + (declarativeSchemaChanged ? 1 : 0);

  const candidate = finalizeExtensionRegistry(registry);
  const mergedCandidate = validateConfiguredExtensionRegistry(
    editor,
    candidate,
    preview.schemaContributions
  );
  const schema = createEditorSchema<ValueOf<TEditor>>(
    () => editor,
    () => mergedCandidate
  );
  let documentChange = DocumentChange.empty;

  if (options.validateDocument !== false) {
    const currentDocument = getEditorDocumentValue(editor);
    if (options.initialPublication && !options.initializeDocument) {
      schema.validateDocument(currentDocument);

      return Object.freeze({
        configured: candidate,
        documentChange,
        merged: mergedCandidate,
        schema,
      });
    }
    if (!declarativeSchemaChanged) {
      schema.validateDocument(currentDocument);
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

            if (Object.hasOwn(migrated as object, 'meta')) {
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

const createExtensionConfigurationContext = <TEditor extends Editor>(
  editor: TEditor,
  extension: EditorExtension<TEditor, any>,
  registry: ExtensionRegistry<TEditor>,
  schema: InternalEditorSchemaApi<ValueOf<TEditor>>
) =>
  Object.freeze({
    config: extension.config,
    editor: editor as EditorExtensionConfigurationContext<
      TEditor,
      any
    >['editor'],
    getContributions: <TValue>(point: EditorExtensionPoint<TValue>) =>
      Object.freeze(
        (registry.contributions.get(point) ?? []).map(
          ({ value }) => value as Readonly<TValue>
        )
      ),
    name: extension.name,
    root: toPublicRoot(getEditorRuntimeRoot(editor)),
    schema,
  }) satisfies EditorExtensionConfigurationContext<TEditor, any>;

const validateExtensionConfigurations = <TEditor extends Editor>(
  records: ReadonlyMap<string, ExtensionRecord>,
  registry: ExtensionRegistry<TEditor>,
  schema: InternalEditorSchemaApi<ValueOf<TEditor>>
) => {
  for (const record of getOrderedExtensionRecords(records)) {
    const extension = record.extension as EditorExtension<TEditor, any>;

    if (!extension.validateConfiguration) continue;

    assertSynchronousLifecycleResult(
      extension.validateConfiguration(
        createExtensionConfigurationContext(
          record.editor as TEditor,
          extension,
          registry,
          schema
        )
      ),
      `Editor extension "${extension.name}" configuration validation`
    );
  }
};

export type PreparedEditorExtensionPublication = Readonly<{
  afterPublish: () => void;
  cleanup: () => void;
  commit: () => void;
  configurationChanged: boolean;
  documentChange: DocumentChange;
  finalize: () => void;
  rollback: () => void;
  stage: () => void;
  validateDocument: (value: EditorDocumentValue) => void;
}>;

const createNoopPublication = (): PreparedEditorExtensionPublication => {
  let phase: 'cancelled' | 'finalized' | 'prepared' | 'published' = 'prepared';

  return Object.freeze({
    afterPublish() {},
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
    stage() {},
    validateDocument() {},
  });
};

const prepareRecordPublication = <TEditor extends Editor>(
  editor: TEditor,
  state: ExtensionState,
  previousRegistry: ExtensionRegistry<TEditor>,
  previousRecords: Map<string, ExtensionRecord>,
  nextRecords: Map<string, ExtensionRecord>,
  nextOrder: number,
  activatedRecords: readonly ExtensionRecord[],
  deactivatedRecords: readonly ExtensionRecord[],
  cleanupRootNames: readonly string[],
  options: EditorExtensionPublicationOptions = {}
): PreparedEditorExtensionPublication => {
  if (sameExtensionRecords(previousRecords, nextRecords)) {
    return createNoopPublication();
  }

  const previousCurrentRegistry = getExtensionRegistry(editor);
  let candidate!: ExtensionRegistry<TEditor>;
  let candidateDocumentChange = DocumentChange.empty;
  let validateCandidateDocument: (value: EditorDocumentValue) => void = () => {
    throw new Error('Editor extension candidate schema is not prepared.');
  };
  const resolvedApis = new Map<string, EditorExtensionApiMap>();

  runWithEditorExtensionPublicationGuard(editor, () => {
    const declarative = buildConfiguredRegistry(
      editor,
      previousRegistry,
      previousCurrentRegistry.schemaRevision,
      nextRecords,
      new Map(),
      { validateDocument: false }
    );
    const candidateApis = new Map<
      EditorExtension<any, any>,
      EditorExtensionApiMap
    >();

    CANDIDATE_EDITOR_EXTENSION_APIS.set(
      getEditorRuntimeOwner(editor),
      candidateApis
    );

    try {
      for (const record of getOrderedExtensionRecords(nextRecords)) {
        if (typeof record.extension.api !== 'function') {
          candidateApis.set(record.extension, record.api ?? {});
          continue;
        }

        const extension = record.extension as EditorExtension<TEditor, any>;
        const api = resolveExtensionApi(
          record.editor as TEditor,
          extension,
          createExtensionConfigurationContext(
            record.editor as TEditor,
            extension,
            declarative.merged,
            declarative.schema
          )
        );

        resolvedApis.set(extension.name, api);
        candidateApis.set(extension, api);
      }
      const built = buildConfiguredRegistry(
        editor,
        previousRegistry,
        previousCurrentRegistry.schemaRevision,
        nextRecords,
        resolvedApis,
        options
      );

      validateExtensionConfigurations(nextRecords, built.merged, built.schema);
      candidate = built.configured;
      candidateDocumentChange = built.documentChange;
      validateCandidateDocument = built.schema.validateDocument;
    } finally {
      CANDIDATE_EDITOR_EXTENSION_APIS.delete(getEditorRuntimeOwner(editor));
    }
  });
  const previousFactoryApis = new Map<
    ExtensionRecord,
    EditorExtensionApiMap | null
  >();

  for (const record of nextRecords.values()) {
    if (typeof record.extension.api === 'function') {
      previousFactoryApis.set(record, record.api);
    }
  }
  const installResolvedApis = () => {
    for (const record of nextRecords.values()) {
      if (typeof record.extension.api !== 'function') continue;

      record.api = resolvedApis.get(record.extension.name) ?? null;
    }
  };
  const restorePreviousApis = () => {
    for (const [record, api] of previousFactoryApis) record.api = api;
  };
  const previousNextOrder = state.nextOrder;
  const appliedDraftFieldDisposals: Array<() => void> = [];
  let ownsDraftFields = false;
  let staged = false;
  const stageFields = () => {
    if (staged) return;
    if (phase !== 'prepared') {
      throw new Error('Editor extension fields must stage before publication.');
    }

    ownsDraftFields = true;
    try {
      for (const record of activatedRecords) {
        for (const field of record.extension.stateFields ?? []) {
          const rollback = activateStateField(editor, field);

          appliedDraftFieldDisposals.push(rollback);
        }
      }
      staged = true;
    } catch (error) {
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
  let registryPublication: PublishedConfiguredExtensionRegistry | null = null;

  const rollbackPublication = () => {
    if (phase === 'prepared') {
      disposeDraftFields();
      phase = 'cancelled';
      return;
    }
    if (phase !== 'published' || !registryPublication) return;

    registryPublication.rollback(() => {
      restorePreviousApis();
      state.records = previousRecords;
      state.nextOrder = previousNextOrder;
    });
    disposeDraftFields();
    phase = 'cancelled';
  };

  const publication = Object.freeze({
    cleanup() {
      if (cleanupCalled || cleanupRunning) return;
      cleanupRunning = true;

      try {
        if (phase !== 'finalized') {
          rollbackPublication();
          cleanupCalled = true;
          return;
        }

        const currentState = getExtensionState(editor);
        const ownedNames = collectOwnedExtensionNames(
          currentState,
          cleanupRootNames.filter((name) => currentState.records.has(name))
        );
        const affectedNames = [
          ...new Set([
            ...cleanupRootNames.filter((name) =>
              currentState.records.has(name)
            ),
            ...ownedNames,
          ]),
        ];
        const removableRecords = getInstalledExtensionRecords(
          currentState,
          affectedNames
        );

        if (removableRecords.length === 0) {
          cleanupCalled = true;
          return;
        }

        const removalInput = removableRecords.map(({ extension }) =>
          Object.freeze({ enabled: false, name: extension.name })
        );
        const removalKey = `editor.unextend:${++nextDynamicExtensionConfiguration}`;

        runTrustedUpdate(editor, () => {
          stageEditorExtensionConfiguration(
            editor,
            removalKey,
            removalInput,
            () => {
              cleanupCalled = true;
            }
          );
        });
      } finally {
        cleanupRunning = false;
      }
    },
    commit() {
      if (phase !== 'prepared') return;
      if (!staged) {
        throw new Error(
          'Editor extension publication must stage fields before commit.'
        );
      }

      if (
        getConfiguredExtensionRegistry(editor) !== previousRegistry ||
        getExtensionRegistry(editor) !== previousCurrentRegistry
      ) {
        throw new Error(
          'Editor extension publication is stale and cannot be committed.'
        );
      }

      try {
        registryPublication = publishConfiguredExtensionRegistry(
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
        for (const record of activatedRecords) {
          try {
            activateExtensionRecord(record.editor, record);
          } catch (cause) {
            reportExtensionLifecycleError(
              record.editor,
              record.extension.name,
              'activate',
              cause
            );
          }
        }
        for (const record of deactivatedRecords.toReversed()) {
          const reason = nextRecords.has(record.extension.name)
            ? 'replace'
            : 'remove';

          for (const cause of deactivateExtensionRecord(record, reason)) {
            reportExtensionLifecycleError(
              record.editor,
              record.extension.name,
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
        runExtensionAfterPublish(record.editor, record);
      }
    },
    rollback() {
      rollbackPublication();
    },
    stage() {
      stageFields();
    },
    validateDocument(value: EditorDocumentValue) {
      validateCandidateDocument(value);
    },
  });

  return publication;
};

export const prepareScopedEditorExtensionPublication = <TEditor extends Editor>(
  editor: TEditor,
  entries: readonly InternalEditorExtensionPublicationEntry[],
  options: EditorExtensionPublicationOptions = {}
): PreparedEditorExtensionPublication => {
  const configurationEditor = getEditorRuntimeOwner(editor) as TEditor;
  const state = getExtensionState(configurationEditor);
  const previousRegistry = getConfiguredExtensionRegistry(configurationEditor);
  const previousRecords = state.records;
  const expanded = new Set<EditorExtension>();
  const latest = resolveLatestExtensionEntries(
    entries.flatMap(({ editor: extensionEditor, extension }) =>
      expandExtensionInput(
        extension,
        extensionEditor ??
          state.records.get(extension.name)?.editor ??
          configurationEditor,
        { kind: 'explicit' },
        new Set(),
        expanded
      )
    )
  );
  const explicitReplacementNames = [
    ...new Set(entries.map(({ extension }) => extension.name)),
  ];
  const disabledNames = new Set(
    entries
      .filter(({ extension }) => extension.enabled === false)
      .map(({ extension }) => extension.name)
  );
  const replacedNames = collectOwnedExtensionNames(
    state,
    explicitReplacementNames
  );
  const nextByName = new Map(
    latest.entries.map((entry) => [entry.extension.name, entry])
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
          areEquivalentExtensions(previous.extension, next.extension)
      );
    });

  if (equivalentReplacement) return createNoopPublication();
  const validationState = getValidationStateWithoutReplacements(
    state,
    replacedNames
  );
  const orderedExtensions = resolveExtensionOrder(
    validationState,
    latest.entries.map((entry) => entry.extension)
  );
  const latestByName = new Map(
    latest.entries.map((entry) => [entry.extension.name, entry])
  );
  const nextRecords = new Map(previousRecords);

  for (const name of replacedNames) nextRecords.delete(name);
  for (const name of disabledNames) {
    if (replacedNames.includes(name)) continue;
    const retained = nextRecords.get(name);

    if (retained) {
      nextRecords.set(name, { ...retained, explicit: false });
    }
  }

  let nextOrder = state.nextOrder;
  const installedRecords = orderedExtensions.flatMap((extension) => {
    const entry = latestByName.get(extension.name)!;
    const previous = previousRecords.get(extension.name);
    const previousOrder = previous?.order;

    if (
      previous &&
      previous.editor === entry.editor &&
      areEquivalentExtensions(previous.extension, extension)
    ) {
      const requiredBy = new Set([...previous.requiredBy, ...entry.requiredBy]);
      const slotOwners = new Set([...previous.slotOwners, ...entry.slotOwners]);
      const explicit = previous.explicit || entry.explicit;

      if (
        explicit === previous.explicit &&
        areEqualExtensionOwnerSets(previous.requiredBy, requiredBy) &&
        areEqualExtensionOwnerSets(previous.slotOwners, slotOwners)
      ) {
        nextRecords.set(extension.name, previous);

        return [];
      }
      const retained = {
        ...previous,
        explicit,
        requiredBy: Object.freeze(requiredBy),
        slotOwners: Object.freeze(slotOwners),
      } satisfies ExtensionRecord;

      nextRecords.set(extension.name, retained);

      return [];
    }
    const record = createExtensionRecord(entry, previousOrder ?? nextOrder++);

    nextRecords.set(extension.name, record);

    return [record];
  });
  const requiredBy = new Map<string, Set<string>>();

  for (const record of nextRecords.values()) {
    for (const dependency of record.extension.dependencies ?? []) {
      const owners = requiredBy.get(dependency.name) ?? new Set<string>();

      owners.add(record.extension.name);
      requiredBy.set(dependency.name, owners);
    }
  }
  for (const [name, record] of nextRecords) {
    const owners = new Set(requiredBy.get(name) ?? []);

    if (areEqualExtensionOwnerSets(record.requiredBy, owners)) continue;
    nextRecords.set(name, {
      ...record,
      requiredBy: Object.freeze(owners),
    });
  }
  const deactivatedRecords = [...previousRecords.values()].filter((record) => {
    const next = nextRecords.get(record.extension.name);

    return (
      !next ||
      next.editor !== record.editor ||
      !areEquivalentExtensions(next.extension, record.extension)
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
      .map((entry) => entry.extension.name),
    options
  );
};

export const prepareEditorExtensionPublication = <TEditor extends Editor>(
  editor: TEditor,
  input: EditorExtensionInput<TEditor>
): PreparedEditorExtensionPublication =>
  prepareScopedEditorExtensionPublication(
    editor,
    normalizeExtensionInput(input).map((extension) =>
      Object.freeze({ editor, extension })
    )
  );

/** @internal Initial construction is the only publication allowed to fill root defaults. */
export const prepareInitialEditorExtensionPublication = <
  TEditor extends Editor,
>(
  editor: TEditor,
  input: EditorExtensionInput<TEditor>,
  initializeDocument: boolean
): PreparedEditorExtensionPublication =>
  prepareScopedEditorExtensionPublication(
    editor,
    normalizeExtensionInput(input).map((extension) =>
      Object.freeze({ editor, extension })
    ),
    { initialPublication: true, initializeDocument }
  );

export const extendEditor = <TEditor extends Editor>(
  editor: TEditor,
  input: EditorExtensionInput<TEditor>,
  options: EditorExtensionReconfigureOptions = {}
): (() => void) => {
  let cleanup = () => {};
  const key = `editor.extend:${++nextDynamicExtensionConfiguration}`;

  runTrustedUpdate(editor, () => {
    stageEditorExtensionConfiguration(
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

  return () => cleanup();
};
