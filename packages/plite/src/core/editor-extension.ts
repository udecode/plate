import type {
  BaseEditor,
  Editor,
  EditorCommitContext,
  EditorCorrection,
  EditorExtension,
  EditorExtensionActivationContext,
  EditorExtensionApiMap,
  EditorExtensionCleanupContext,
  EditorExtensionConfigurationContext,
  EditorExtensionCommandContext,
  EditorExtensionSchemaFactoryContext,
  EditorDocumentValue,
  EditorExtensionInput,
  EditorExtensionReconfigureOptions,
  EditorClipboardInsertDataCapability,
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
  registerCapabilityInRegistry,
  registerCommitListenerInRegistry,
  registerEffectTypeInRegistry,
  registerFacetProviderInRegistry,
  registerNodeChangeListenerInRegistry,
  registerCorrectionInRegistry,
  registerQueryMiddlewareInRegistry,
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
  getEditorRuntimeOwner,
  getEditorRuntimeRoot,
  type InternalEditorExtensionPublicationEntry,
} from './editor-runtime';

type ExtensionRecord = {
  activation: ExtensionActivation | null;
  api: EditorExtensionApiMap | null;
  editor: Editor;
  extension: EditorExtension<Editor>;
  owner: string | null;
  order: number;
};

type ExtensionState = {
  nextOrder: number;
  records: Map<string, ExtensionRecord>;
};

type ExtensionActivation = {
  abortController: AbortController;
  active: boolean;
  cleanups: Array<(context: EditorExtensionCleanupContext) => void>;
  ready: boolean;
  readyCallbacks: Array<() => void>;
};

const EXTENSION_STATE = new WeakMap<Editor, ExtensionState>();
const EXTENSION_ERROR_SINKS = new WeakMap<Editor, EditorLifecycleErrorSink>();
const CANONICAL_EDITOR_EXTENSIONS = new WeakSet<object>();
const CANONICAL_EDITOR_EXTENSION_BY_INPUT = new WeakMap<
  object,
  EditorExtension<any, any, any>
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
  phase: 'activate' | 'cleanup' | 'ready',
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
  extension: EditorExtension<Editor, any>;
  owner: string | null;
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
  owner: string | null = null
): ExtensionEntry[] =>
  normalizeExtensionInput(input).flatMap((extension) => {
    const entry = {
      editor,
      extension: extension as EditorExtension<Editor, any>,
      owner,
    };
    const slotInput = (extension as InternalEditorExtensionSlotValue)[
      EDITOR_EXTENSION_SLOT_INPUT
    ];

    if (!slotInput || extension.enabled === false) return [entry];

    return [entry, ...expandExtensionInput(slotInput, editor, extension.name)];
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
    for (const field of extension.fields ?? []) {
      const known = fields.get(field.key);

      if (known && known !== field) {
        throw new Error(
          `State field "${field.key}" conflicts with another descriptor identity in the same configuration.`
        );
      }
      fields.set(field.key, field);
    }

    entries.delete(extension.name);
    entries.set(extension.name, extension.enabled === false ? null : entry);
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
  const names = new Set(owners);
  let changed = true;

  while (changed) {
    changed = false;

    for (const [name, record] of state.records) {
      if (record.owner && names.has(record.owner) && !names.has(name)) {
        names.add(name);
        changed = true;
      }
    }
  }

  return [...names];
};

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
      EditorExtension<TEditor, any, TConfig>,
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
    const TExtension extends EditorExtension<TEditor, any, TConfig>,
  >(
    extension: NoExtraEditorExtensionProperties<
      TExtension,
      EditorExtension<TEditor, any, TConfig>
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
  TExtension extends EditorExtension<any, any, any>,
  TShape extends EditorExtension<any, any, any>,
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

const cloneFrozenSchemaDeclaration = <T>(
  value: T,
  clones = new WeakMap<object, unknown>()
): T => {
  if (!value || typeof value !== 'object') return value;

  const existing = clones.get(value);

  if (existing !== undefined) return existing as T;
  if (Array.isArray(value)) {
    const clone = new Array<unknown>(value.length);

    clones.set(value, clone);

    for (let index = 0; index < value.length; index++) {
      clone[index] = cloneFrozenSchemaDeclaration(value[index], clones);
    }

    return Object.freeze(clone) as T;
  }
  if (!isObjectPrototype(Object.getPrototypeOf(value))) {
    return value;
  }

  const clone: Record<PropertyKey, unknown> = {};

  clones.set(value, clone);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new Error(
        'Editor extension declarations cannot contain property accessors.'
      );
    }

    Object.defineProperty(clone, key, {
      enumerable: descriptor.enumerable,
      value: cloneFrozenSchemaDeclaration(descriptor.value, clones),
    });
  }

  return Object.freeze(clone) as T;
};

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
      'Editor extension config accepts only plain immutable data. Move functions and runtime resources to options.'
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
      'Editor extension config accepts only plain immutable data. Move class instances and runtime resources to options.'
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
  TOptions,
  TConfig,
  TExtension extends EditorExtension<TEditor, TOptions, TConfig>,
>(
  extension: TExtension
): TExtension => {
  if (CANONICAL_EDITOR_EXTENSIONS.has(extension)) return extension;
  const cached = CANONICAL_EDITOR_EXTENSION_BY_INPUT.get(extension);

  if (cached) return cached as TExtension;
  const canonical = { ...extension } as Record<PropertyKey, unknown>;
  const listKeys = [
    'conflicts',
    'corrections',
    'dependencies',
    'effects',
    'facets',
    'fields',
    'peerDependencies',
    'selections',
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
  if (extension.options && typeof extension.options === 'object') {
    canonical.options = cloneFrozenSchemaDeclaration(extension.options);
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
  for (const key of ['api', 'clipboard', 'queries', 'state', 'tx'] as const) {
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
  extension?: EditorExtension<any, any, any>
) =>
  extension === undefined
    ? <const TExtension extends EditorExtension<any, any, any>>(
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
  const installed = getExtensionState(editor).records.get(
    canonical.name
  )?.extension;

  return installed === canonical ? installed : undefined;
};

/** @internal Read the resolved API map for one installed extension name. */
export const getInstalledEditorExtensionApi = (
  editor: Editor,
  name: string
): EditorExtensionApiMap | undefined =>
  getExtensionState(editor).records.get(name)?.api ?? undefined;

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
      `Editor extension "${extension.name}" cannot use commitListeners. Add onCommit instead.`
    );
  }

  if (register !== undefined) {
    throw new Error(
      `Editor extension "${extension.name}" cannot use register. Declare extension resources directly.`
    );
  }
};

const hasExtensionNamed = (
  state: ExtensionState,
  pending: Map<string, EditorExtension<Editor, any>>,
  name: string
) => state.records.has(name) || pending.has(name);

const getInstalledConflict = (
  state: ExtensionState,
  extension: EditorExtension<Editor, any>
) => {
  for (const [installedName, record] of state.records) {
    if (
      extension.conflicts?.includes(installedName) ||
      record.extension.conflicts?.includes(extension.name)
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
      extension.conflicts?.includes(pendingName) ||
      pendingExtension.conflicts?.includes(extension.name)
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

    for (const peerDependency of extension.peerDependencies ?? []) {
      if (!hasExtensionNamed(state, pending, peerDependency)) {
        throw new Error(
          `Editor extension "${extension.name}" has missing peer dependency "${peerDependency}".`
        );
      }
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
      const pendingDependency = pending.get(dependency);

      if (pendingDependency) {
        visit(pendingDependency);
        continue;
      }

      if (!state.records.has(dependency)) {
        throw new Error(
          `Editor extension "${extension.name}" has missing dependency "${dependency}".`
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

    for (const [name, value] of Object.entries(api ?? {})) {
      const values = Array.isArray(value) ? value : [value];

      for (const capability of values) {
        cleanups.push(registerCapabilityInRegistry(registry, name, capability));
      }
    }

    if (slots.clipboard?.insertData) {
      cleanups.push(
        registerCapabilityInRegistry(
          registry,
          'clipboard.insertData',
          ((runtimeEditor, data, tx, next = () => false) =>
            slots.clipboard?.insertData?.(data, {
              editor: runtimeEditor,
              next,
              tx,
            }) === true) as EditorClipboardInsertDataCapability<TEditor>
        )
      );
    }

    for (const field of slots.fields ?? []) {
      cleanups.push(
        registerStateFieldDescriptorInRegistry(registry, extension.name, field)
      );
    }

    for (const type of slots.effects ?? []) {
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

    for (const provider of slots.facets ?? []) {
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

    if (slots.onCommit) {
      cleanups.push(
        registerCommitListenerInRegistry(registry, (commit) => {
          slots.onCommit?.({
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

    if (slots.onNodeChange) {
      cleanups.push(
        registerNodeChangeListenerInRegistry(registry, (context) =>
          slots.onNodeChange?.({
            ...context,
            editor,
          } as EditorNodeChangeContext<TEditor>)
        )
      );
    }

    if (slots.onTextChange) {
      cleanups.push(
        registerTextChangeListenerInRegistry(registry, (context) =>
          slots.onTextChange?.({
            ...context,
            editor,
          } as EditorTextChangeContext<TEditor>)
        )
      );
    }

    if (slots.onTransactionChange) {
      cleanups.push(
        registerTransactionChangeListenerInRegistry(registry, (context) =>
          slots.onTransactionChange?.({
            ...context,
            editor,
          } as EditorTransactionChangeContext<TEditor>)
        )
      );
    }

    for (const [group, methods] of Object.entries(slots.queries ?? {})) {
      for (const [method, middleware] of Object.entries(methods ?? {})) {
        if (middleware) {
          cleanups.push(
            registerQueryMiddlewareInRegistry(
              registry,
              group as never,
              method as never,
              middleware as never
            )
          );
        }
      }
    }

    for (const spec of slots.selections ?? []) {
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
    cleanups: [],
    ready: false,
    readyCallbacks: [],
  };
  record.activation = activation;
  const extension = record.extension as EditorExtension<TEditor, any>;
  const registry = getExtensionRegistry(editor);
  const context = Object.freeze({
    capabilities: <TValue>(name: string) =>
      Object.freeze([
        ...(registry.capabilities.get(name) ?? []),
      ]) as readonly Readonly<TValue>[],
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
    onReady(callback) {
      if (!activation.active || activation.ready) {
        throw new Error(
          `Editor extension "${extension.name}" cannot register ready work after publication.`
        );
      }
      if (typeof callback !== 'function') {
        throw new Error('Editor extension ready callback must be a function.');
      }

      activation.readyCallbacks.push(callback);
    },
    options: extension.options,
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

const runExtensionReady = (editor: Editor, record: ExtensionRecord) => {
  const activation = record.activation;

  if (!activation?.active || activation.ready) return;
  activation.ready = true;

  for (const callback of activation.readyCallbacks) {
    try {
      assertSynchronousLifecycleResult(
        callback(),
        `Editor extension "${record.extension.name}" ready callback`
      );
    } catch (cause) {
      reportExtensionLifecycleError(
        editor,
        record.extension.name,
        'ready',
        cause
      );
    }
  }
  activation.readyCallbacks = [];
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
  extension: EditorExtension<Editor, any>,
  order: number
): RegisteredEditorExtension => ({
  conflicts: Object.freeze([...(extension.conflicts ?? [])]),
  dependencies: Object.freeze([...(extension.dependencies ?? [])]),
  name: extension.name,
  order,
  peerDependencies: Object.freeze([...(extension.peerDependencies ?? [])]),
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
      ? extension.api(editor, context!)
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

const createExtensionRecord = <TEditor extends Editor>(
  editor: TEditor,
  extension: EditorExtension<Editor, any>,
  owner: string | null,
  order: number
) =>
  ({
    activation: null,
    api:
      typeof extension.api === 'function'
        ? null
        : resolveExtensionApi(
            editor,
            extension as EditorExtension<TEditor, any>
          ),
    editor,
    extension,
    owner,
    order,
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
      const dependencyRecord = records.get(dependency);

      if (dependencyRecord) visit(dependencyRecord);
    }
    visiting.delete(name);
    visited.add(name);
    ordered.push(record);
  };

  for (const record of [...records.values()].sort(
    (left, right) =>
      (right.extension.priority ?? 0) - (left.extension.priority ?? 0) ||
      left.order - right.order
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
      if (!records.has(dependency)) {
        throw new Error(
          `Editor extension "${extension.name}" has missing dependency "${dependency}".`
        );
      }
    }
    for (const dependency of extension.peerDependencies ?? []) {
      if (!records.has(dependency)) {
        throw new Error(
          `Editor extension "${extension.name}" has missing peer dependency "${dependency}".`
        );
      }
    }
    for (const conflict of extension.conflicts ?? []) {
      if (records.has(conflict)) {
        throw new Error(
          `Editor extension "${extension.name}" conflicts with "${conflict}".`
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
      visit(dependency);
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
  'peerDependencies',
]);
const ORDERED_IDENTITY_EXTENSION_RESOURCE_KEYS = new Set<PropertyKey>([
  'corrections',
  'effects',
  'facets',
  'fields',
  'selections',
]);
const KEYED_IDENTITY_EXTENSION_RESOURCE_KEYS = new Set<PropertyKey>([
  'api',
  'clipboard',
  'queries',
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
      registry.extensions.set(
        record.extension.name,
        getRegisteredExtension(record.extension, record.order)
      );
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
    capabilities: <TValue>(name: string) =>
      Object.freeze([
        ...(registry.capabilities.get(name) ?? []),
      ]) as readonly Readonly<TValue>[],
    editor,
    name: extension.name,
    options: extension.options,
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
  cleanup: () => void;
  commit: () => void;
  configurationChanged: boolean;
  documentChange: DocumentChange;
  finalize: () => void;
  ready: () => void;
  rollback: () => void;
  stage: () => void;
  validateDocument: (value: EditorDocumentValue) => void;
}>;

const createNoopPublication = (): PreparedEditorExtensionPublication => {
  let phase: 'cancelled' | 'finalized' | 'prepared' | 'published' = 'prepared';

  return Object.freeze({
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
    ready() {},
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

    for (const record of getOrderedExtensionRecords(nextRecords)) {
      if (typeof record.extension.api !== 'function') continue;

      const extension = record.extension as EditorExtension<TEditor, any>;

      resolvedApis.set(
        extension.name,
        resolveExtensionApi(
          record.editor as TEditor,
          extension,
          createExtensionConfigurationContext(
            record.editor as TEditor,
            extension,
            declarative.merged,
            declarative.schema
          )
        )
      );
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
        for (const field of record.extension.fields ?? []) {
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
  let readyCalled = false;
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
          activatedRecords
            .filter(
              (record) =>
                currentState.records.get(record.extension.name) === record
            )
            .map((record) => record.extension.name)
        );
        const removableRecords = getInstalledExtensionRecords(
          currentState,
          ownedNames
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
    ready() {
      if (phase !== 'finalized' || readyCalled) return;
      readyCalled = true;

      for (const record of activatedRecords) {
        runExtensionReady(record.editor, record);
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
  const latest = resolveLatestExtensionEntries(
    entries.flatMap(({ editor: extensionEditor, extension }) =>
      expandExtensionInput(
        extension,
        extensionEditor ??
          state.records.get(extension.name)?.editor ??
          configurationEditor
      )
    )
  );
  const replacedNames = collectOwnedExtensionNames(state, latest.replacedNames);
  const nextByName = new Map(
    latest.entries.map((entry) => [entry.extension.name, entry])
  );
  const equivalentReplacement =
    replacedNames.length === nextByName.size &&
    replacedNames.every((name) => {
      const previous = previousRecords.get(name);
      const next = nextByName.get(name);

      return Boolean(
        previous &&
          next &&
          previous.editor === next.editor &&
          previous.owner === next.owner &&
          areEquivalentExtensions(previous.extension, next.extension)
      );
    });

  if (equivalentReplacement) return createNoopPublication();
  const replacedRecords = getInstalledExtensionRecords(state, replacedNames);
  const validationState = getValidationStateWithoutReplacements(
    state,
    replacedNames
  );
  const orderedExtensions = resolveExtensionOrder(
    validationState,
    latest.entries.map((entry) => entry.extension)
  );
  const owners = new Map(
    latest.entries.map((entry) => [entry.extension.name, entry.owner])
  );
  const editors = new Map(
    latest.entries.map((entry) => [entry.extension.name, entry.editor])
  );
  const nextRecords = new Map(previousRecords);

  for (const name of replacedNames) nextRecords.delete(name);

  let nextOrder = state.nextOrder;
  const installedRecords = orderedExtensions.map((extension) => {
    const previousOrder = previousRecords.get(extension.name)?.order;
    const record = createExtensionRecord(
      editors.get(extension.name) ?? configurationEditor,
      extension,
      owners.get(extension.name) ?? null,
      previousOrder ?? nextOrder++
    );

    nextRecords.set(extension.name, record);

    return record;
  });

  return prepareRecordPublication(
    configurationEditor,
    state,
    previousRegistry,
    previousRecords,
    nextRecords,
    nextOrder,
    installedRecords,
    replacedRecords,
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
