import type {
  BaseEditor,
  AnyEditor as Editor,
  EditorCommitContext,
  EditorCorrection,
  EditorExtension,
  EditorExtensionDependencyReferenceFor,
  EditorExtensionReference,
  EditorExtensionActivationContext,
  EditorExtensionApiFactoryContext,
  EditorExtensionApiMap,
  EditorExtensionCleanupContext,
  EditorExtensionContribution,
  EditorExtensionContributionInput,
  EditorExtensionCandidateContext,
  EditorExtensionCommandContext,
  EditorExtensionDefinition,
  EditorExtensionDefinitionInput,
  EditorExtensionPoint,
  EditorExtensionReadContext,
  EditorDocumentValue,
  EditorExtensionInput,
  EditorExtensionReconfigureOptions,
  EditorNodeChangeContext,
  EditorStateField,
  EditorTextChangeContext,
  EditorTransactionChangeContext,
  EditorUpdateContext,
  EditorUpdatePolicy,
  EditorUpdateTransaction,
  EditorValueFromExtensions,
  RegisteredEditorExtension,
  EditorSelectionSpec,
  ValueOf,
} from '../interfaces/editor';
import type { SelectionValue } from '../interfaces/selection';
import type {
  EditorSchemaDeclaration,
  EditorSchemaDefinition,
} from '../interfaces/schema';
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
  runWithCandidateExtensionRegistry,
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
import {
  type EditorSchemaDefinitionInput,
  type NormalizedEditorSchemaInput,
  normalizeEditorSchemaDeclaration,
  normalizeEditorSchemaDefinition,
} from './schema-definition';
import { areEditorSchemaIdentitiesEqual } from './schema-compiler';

const EDITOR_EXTENSION_CONTRIBUTION_VALUES = new WeakMap<object, unknown>();

export const createEditorExtensionUpdatePortal = (
  editor: Editor,
  extensionName: string,
  expectedExtension?: EditorExtensionReference
): unknown => {
  const assertCapabilityOwner = () => {
    if (
      expectedExtension &&
      getCandidateEditorExtensionApi(editor, expectedExtension) === undefined &&
      resolveInstalledEditorExtension(editor, expectedExtension) !==
        expectedExtension
    ) {
      throw new Error(
        `Editor extension "${extensionName}" descriptor is no longer installed.`
      );
    }
  };
  const resolveCapability = () => {
    assertCapabilityOwner();
    const capability = Reflect.get(editor.update, extensionName);

    if (capability === undefined) {
      throw new Error(
        `Editor extension "${extensionName}" does not expose update methods.`
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
              `Editor extension "${extensionName}" update method "${path
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
            Reflect.get(tx, extensionName),
            path
          );

          if (typeof value !== 'function') {
            throw new TypeError(
              `Editor extension "${extensionName}" update method "${path
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
            return;
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
            return;
          }

          return createScopedUpdatePath([key], policy);
        },
      }
    );

  return createScopedUpdate();
};

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
  contribution: EditorExtensionContributionInput<any>
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
  stageEditorExtensionCandidate,
  withTransactionSpecDraftRead,
} from './public-state';
import { getEditorExtensionSlotInput } from './extension-slot';
import {
  getEditorRuntimeOwner,
  getEditorRuntimeRoot,
  type InternalEditorExtensionPublicationEntry,
} from './editor-runtime';

type ExtensionRecord = {
  activation: ExtensionActivation | null;
  api: EditorExtensionApiMap | null;
  editor: Editor;
  explicit: boolean;
  extension: EditorExtensionReference;
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
const CANONICAL_EDITOR_EXTENSIONS = new WeakSet<object>();
const CANONICAL_EDITOR_EXTENSION_BY_INPUT = new WeakMap<
  object,
  EditorExtensionReference
>();
const CANDIDATE_EDITOR_EXTENSION_APIS = new WeakMap<
  Editor,
  ReadonlyMap<EditorExtensionReference, EditorExtensionApiMap>
>();
let nextDynamicExtensionPublication = 0;

/** @internal Test nominal descriptor identity without structural guessing. */
export const isEditorExtension = (
  value: unknown
): value is EditorExtensionReference =>
  typeof value === 'object' &&
  value !== null &&
  CANONICAL_EDITOR_EXTENSIONS.has(value);

const getEditorExtensionRuntimeFields = <
  TEditor extends BaseEditor<any, any> = Editor,
>(
  extension: EditorExtensionReference
) => extension as unknown as EditorExtensionDefinitionInput<TEditor>;

import { reportEditorLifecycleError } from './lifecycle-error';

export {
  reportEditorLifecycleError,
  setEditorLifecycleErrorSink,
} from './lifecycle-error';

const reportExtensionLifecycleError = (
  editor: Editor,
  extensionName: string,
  phase: 'afterPublish' | 'cleanup',
  cause: unknown
) =>
  reportEditorLifecycleError(
    Object.freeze({ cause, editor, extensionName, phase })
  );

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

export class EditorExtensionPublicationError extends Error {
  readonly extensionName: string;
  readonly phase = 'activate' as const;
  readonly rollbackErrors: readonly unknown[];

  constructor(
    extensionName: string,
    cause: unknown,
    rollbackErrors: readonly unknown[] = []
  ) {
    const causeMessage =
      cause instanceof Error
        ? cause.message
        : typeof cause === 'string'
          ? cause
          : undefined;

    super(
      `Editor extension "${extensionName}" activation failed${causeMessage ? `: ${causeMessage}` : '.'}`,
      { cause }
    );
    this.name = 'EditorExtensionPublicationError';
    this.extensionName = extensionName;
    this.rollbackErrors = Object.freeze([...rollbackErrors]);
  }
}

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

const normalizeExtensionInput = (input: EditorExtensionInput) =>
  (Array.isArray(input) ? input : [input]).map((extension) => {
    if (!isEditorExtension(extension)) {
      throw new Error(
        'Editor extensions must be created by defineExtension or another descriptor factory.'
      );
    }

    return extension;
  });

type ExtensionEntry = {
  editor: Editor;
  explicit: boolean;
  extension: EditorExtensionReference;
  requiredBy: ReadonlySet<string>;
  slotOwners: ReadonlySet<string>;
};

const expandExtensionInput = (
  input: EditorExtensionInput,
  editor: Editor,
  relation:
    | Readonly<{ kind: 'dependency' | 'slot'; owner: string }>
    | Readonly<{ kind: 'explicit' }> = { kind: 'explicit' },
  visiting = new Set<EditorExtensionReference>(),
  expanded = new Set<EditorExtensionReference>()
): ExtensionEntry[] =>
  normalizeExtensionInput(input).flatMap((extension) => {
    const entry = {
      editor,
      explicit: relation.kind === 'explicit',
      extension: extension as EditorExtensionReference,
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
      (dependency: EditorExtensionReference) =>
        expandExtensionInput(
          dependency as EditorExtensionInput,
          editor,
          { kind: 'dependency', owner: extension.name },
          visiting,
          expanded
        )
    );
    const slotInput = getEditorExtensionSlotInput(extension);

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
      const known = entries.get(extension.name);

      if (known && known.extension !== extension) {
        throw new Error(
          `Editor extension "${extension.name}" has multiple descriptor identities in the same configuration.`
        );
      }
      entries.delete(extension.name);
      entries.set(extension.name, null);
      continue;
    }
    for (const field of getEditorExtensionRuntimeFields(extension)
      .stateFields ?? []) {
      const known = fields.get(field.key);

      if (known && known !== field) {
        throw new Error(
          `State field "${field.key}" conflicts with another descriptor identity in the same configuration.`
        );
      }
      fields.set(field.key, field);
    }

    const known = entries.get(extension.name);

    if (known && known.extension !== extension) {
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
      [...record.requiredBy, ...record.slotOwners].every((owner) =>
        requested.has(owner)
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

const isSameInstalledExtension = (
  current: ExtensionRecord | undefined,
  installed: ExtensionRecord | undefined
) =>
  current !== undefined &&
  installed !== undefined &&
  current.editor === installed.editor &&
  current.extension === installed.extension;

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

type NormalizedEditorExtensionApi<TInput> = TInput extends {
  api: (...args: never[]) => infer TResult;
}
  ? TResult
  : never;

type NormalizedEditorExtensionRead<TInput> = TInput extends {
  read: (...args: never[]) => infer TResult;
}
  ? TResult
  : never;

type NormalizedEditorExtensionUpdate<TInput> = TInput extends {
  update: (...args: never[]) => infer TResult;
}
  ? TResult
  : never;

type NormalizedEditorExtensionSchema<TInput> = TInput extends {
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

type EditorExtensionPresenceField =
  | 'activate'
  | 'commands'
  | 'contributions'
  | 'corrections'
  | 'effectTypes'
  | 'facetProviders'
  | 'on'
  | 'readMiddleware'
  | 'stateFields'
  | 'validate';

type EditorExtensionInputSeed = {
  [TKey in keyof EditorExtensionDefinitionInput]?: unknown;
};

type EditorExtensionAuthorEditor<
  TDependencies extends readonly EditorExtensionReference[],
> = Editor<EditorValueFromExtensions<TDependencies>, TDependencies>;

type NormalizedEditorExtensionReferences<TInput> =
  TInput extends readonly unknown[]
    ? {
        readonly [TIndex in keyof TInput]: EditorExtensionDependencyReferenceFor<
          TInput[TIndex]
        >;
      }
    : never;

type NormalizeEditorExtensionDefinition<
  TInput extends EditorExtensionInputSeed,
  N extends string,
> = Readonly<{
  [TKey in keyof TInput as TKey extends keyof EditorExtensionDefinition
    ? TKey
    : never]: TKey extends 'api'
    ? NormalizedEditorExtensionApi<TInput>
    : TKey extends 'conflicts' | 'dependencies'
      ? NormalizedEditorExtensionReferences<TInput[TKey]>
      : TKey extends 'enabled'
        ? TInput[TKey]
        : TKey extends 'read'
          ? NormalizedEditorExtensionRead<TInput>
          : TKey extends 'update'
            ? NormalizedEditorExtensionUpdate<TInput>
            : TKey extends 'schema'
              ? NormalizedEditorExtensionSchema<TInput>
              : TKey extends 'selectionKinds'
                ? Extract<
                    EditorExtensionSelectionFromInput<TInput>,
                    SelectionValue
                  >
                : TKey extends EditorExtensionPresenceField
                  ? true
                  : TInput[TKey];
}> &
  Readonly<{ name: N }>;

type EditorExtensionSelectionFromInput<TInput> = TInput extends {
  selectionKinds: readonly EditorSelectionSpec<infer TSelection>[];
}
  ? TSelection
  : never;

type DefineExtension = {
  <
    const N extends string,
    const TDependencies extends readonly EditorExtensionReference[],
    const TInput extends EditorExtensionDefinitionInput<
      EditorExtensionAuthorEditor<TDependencies>
    >,
  >(
    name: N,
    extension: TInput &
      Readonly<{ dependencies: TDependencies }> &
      NoExtraEditorExtensionProperties<TInput>
  ): EditorExtension<NormalizeEditorExtensionDefinition<TInput, N>>;
  <
    const N extends string,
    const TInput extends EditorExtensionDefinitionInput<
      EditorExtensionAuthorEditor<readonly []>
    >,
  >(
    name: N,
    extension: TInput &
      Readonly<{ dependencies?: never }> &
      NoExtraEditorExtensionProperties<TInput>
  ): EditorExtension<NormalizeEditorExtensionDefinition<TInput, N>>;
};

type NoExtraEditorExtensionProperties<TInput> = Record<
  Exclude<keyof TInput, keyof EditorExtensionDefinitionInput>,
  never
>;

const canonicalizeEditorExtension = <
  TEditor extends BaseEditor<any, any> = Editor,
>(
  extension: EditorExtensionDefinitionInput<TEditor> &
    Readonly<{ name: string }>
): EditorExtensionReference => {
  if (CANONICAL_EDITOR_EXTENSIONS.has(extension)) {
    return extension as unknown as EditorExtensionReference;
  }
  const cached = CANONICAL_EDITOR_EXTENSION_BY_INPUT.get(extension);

  if (cached) return cached;
  const canonical = { ...extension } as Record<PropertyKey, unknown>;
  const stateFieldEffects = (extension.stateFields ?? []).flatMap(
    (field) => field.effectTypes ?? []
  );

  if (stateFieldEffects.length > 0) {
    canonical.effectTypes = [
      ...new Set([...(extension.effectTypes ?? []), ...stateFieldEffects]),
    ];
  }
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
      canonical[key] = Object.freeze(
        key === 'stateFields'
          ? value.map((field) => (field === extension ? canonical : field))
          : Array.from(value)
      );
    }
  }
  if (extension.on) {
    canonical.on = Object.freeze({ ...extension.on });
  }
  if (extension.schema) {
    const declaration =
      typeof extension.schema === 'function'
        ? extension.schema(
            Object.freeze({
              name: extension.name,
            })
          )
        : extension.schema;

    canonical.schema = normalizeEditorSchemaDeclaration(declaration);
  }
  const result = Object.freeze(
    canonical
  ) as unknown as EditorExtensionReference;

  CANONICAL_EDITOR_EXTENSIONS.add(result);
  CANONICAL_EDITOR_EXTENSION_BY_INPUT.set(extension, result);

  return result;
};

/**
 * Define one editor extension from an immutable name and contextually typed
 * author definition.
 * The returned descriptor carries only its normalized capability contract.
 */
export const defineExtension = ((
  name: string,
  definition: EditorExtensionDefinitionInput
) => canonicalizeEditorExtension({ ...definition, name })) as DefineExtension;

/** Define one complete schema as a nominal editor extension. */
export const defineEditorSchema = <
  const N extends string,
  const TInput extends EditorSchemaDefinition,
>(
  name: N,
  definition: EditorSchemaDefinitionInput<TInput>
): EditorExtension<
  NormalizeEditorExtensionDefinition<
    Readonly<{ schema: NormalizedEditorSchemaInput<TInput> }>,
    N
  >
> =>
  defineExtension(name, {
    schema: normalizeEditorSchemaDefinition(name, definition),
  });

/** Compile one dynamically assembled extension at an internal owner boundary. */
export const compileEditorExtension = <
  TEditor extends BaseEditor<any, any> = Editor,
>(
  extension: EditorExtensionDefinitionInput<TEditor> &
    Readonly<{ name: string }>
): EditorExtensionReference => canonicalizeEditorExtension(extension);

export const resolveInstalledEditorExtension = (
  editor: Editor,
  extension: EditorExtensionReference
): EditorExtensionReference | undefined => {
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
  extension: EditorExtensionReference
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

/** @internal Read one API group resolved earlier in the active candidate. */
export const getCandidateEditorApiValue = (
  editor: Editor,
  name: string
): unknown => {
  const candidateApis = CANDIDATE_EDITOR_EXTENSION_APIS.get(
    getEditorRuntimeOwner(editor)
  );

  if (!candidateApis) return;
  for (const api of candidateApis.values()) {
    if (Object.hasOwn(api, name)) return api[name];
  }
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
): EditorExtensionReference | undefined =>
  getExtensionState(getEditorRuntimeOwner(editor)).records.get(name)?.extension;

const assertNoUnsupportedSlots = (extension: EditorExtensionReference) => {
  const methods = (extension as unknown as { methods?: unknown }).methods;
  const commitListeners = (
    extension as unknown as { commitListeners?: unknown }
  ).commitListeners;
  const register = (extension as unknown as { register?: unknown }).register;

  if (methods !== undefined) {
    throw new Error(
      `Editor extension "${extension.name}" cannot use methods. Declare read or update capabilities instead.`
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
  extension: EditorExtensionReference
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
  extension: EditorExtensionReference,
  pending: Map<string, EditorExtensionReference>
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
  extensions: readonly EditorExtensionReference[]
) => {
  const pending = new Map<string, EditorExtensionReference>();
  const ordered: EditorExtensionReference[] = [];
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

  const visit = (extension: EditorExtensionReference) => {
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
        if (pendingDependency !== dependency) {
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
      if (installedDependency.extension !== dependency) {
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
  const extension = record.extension as EditorExtensionReference;
  const cleanups: Array<() => void> = [];
  const registerSlots = (slots: EditorExtensionDefinitionInput<TEditor>) => {
    assertNoUnsupportedSlots(slots as EditorExtensionReference);
    const commandContext: EditorExtensionCommandContext<TEditor> =
      Object.freeze({
        around: (command, handler) =>
          createCommandRegistration(command, 'around', handler),
        handle: (command, handler) =>
          createCommandRegistration(command, 'handle', handler),
      });

    for (const registration of slots.commands?.(commandContext) ?? []) {
      cleanups.push(
        registerCommandInRegistry(
          registry.commands,
          registration,
          extension.name
        )
      );
    }
    const readContext: EditorExtensionReadContext<TEditor> = Object.freeze({
      around: (read, handler) => createReadRegistration(read, handler as never),
    });

    for (const registration of slots.readMiddleware?.(readContext) ?? []) {
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

    if (slots.read) {
      cleanups.push(
        registerStateGroupInRegistry(
          registry,
          extension.name,
          extension.name,
          (state) => slots.read!({ editor, state })
        )
      );
    }

    if (slots.update) {
      cleanups.push(
        registerTxGroupInRegistry(
          registry,
          extension.name,
          extension.name,
          (tx, _runtimeEditor, context) =>
            slots.update!({
              context: Object.freeze({
                afterCommit(handler) {
                  context.afterCommit(({ commit, snapshot }) => {
                    handler({
                      commit,
                      editor,
                      snapshot,
                    });
                  });
                },
              }) as EditorUpdateContext<TEditor>,
              editor,
              tx,
            })
        )
      );
    }
  };

  try {
    registerSlots(
      extension as unknown as EditorExtensionDefinitionInput<TEditor>
    );
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
  const extension = record.extension as EditorExtensionReference;
  const runtimeFields = getEditorExtensionRuntimeFields<TEditor>(extension);
  const context = Object.freeze({
    editor,
    extensionName: extension.name,
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
    root: toPublicRoot(getEditorRuntimeRoot(editor)),
    schema: createEditorSchema(() => editor),
    signal: activation.abortController.signal,
  } satisfies EditorExtensionActivationContext & Readonly<{ editor: TEditor }>);

  try {
    assertSynchronousLifecycleResult(
      runtimeFields.activate?.(context),
      `Editor extension "${extension.name}" activation`
    );
  } catch (error) {
    const cleanupErrors = deactivateExtensionRecord(record, 'rollback');

    throw new EditorExtensionPublicationError(
      extension.name,
      error,
      cleanupErrors
    );
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
        'afterPublish',
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
  extension: EditorExtensionReference,
  context?: EditorExtensionApiFactoryContext<TEditor>
) => {
  if (extension.api !== undefined && !context) {
    throw new Error(
      `Editor extension "${extension.name}" API factory requires a candidate context.`
    );
  }

  if (extension.api === undefined) return Object.freeze({});
  const api =
    (extension.api as EditorExtensionDefinitionInput<TEditor>['api'])!(
      context!
    );

  assertSynchronousLifecycleResult(
    api,
    `Editor extension "${extension.name}" API`
  );

  if (!api || typeof api !== 'object' || Array.isArray(api)) {
    throw new Error(
      `Editor extension "${extension.name}" API must return an object.`
    );
  }

  return Object.freeze({
    [extension.name]: Object.freeze({ ...api }),
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

/** @internal Resolve extension APIs against a root-scoped editor view. */
export const createEditorViewExtensionApis = <TEditor extends Editor<any, any>>(
  editor: TEditor,
  source: Editor
): Pick<TEditor, 'api' | 'extension'> => {
  let cachedRegistry: ExtensionRegistry | undefined;
  let cachedConfiguredRegistry:
    | ReturnType<typeof getConfiguredExtensionRegistry>
    | undefined;
  let cachedConfigurationRevision = -1;
  let apiGroups = new Map<string, unknown[]>();
  let descriptorApis = new Map<
    EditorExtensionReference,
    EditorExtensionApiMap
  >();

  const refresh = () => {
    const registry = getExtensionRegistry(source);
    const configuredRegistry = getConfiguredExtensionRegistry(source);
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
      for (const extension of registry.dependencyOrder) {
        if (registry.extensions.get(extension.name)?.descriptor !== extension) {
          continue;
        }
        const viewExtension = extension as EditorExtensionReference;

        const extensionApi =
          extension.api === undefined
            ? {}
            : resolveExtensionApi(
                viewExtension,
                createExtensionApiFactoryContext(
                  editor,
                  registry as ExtensionRegistry<TEditor>
                )
              );

        descriptorApis.set(extension, extensionApi);

        for (const [name, value] of Object.entries(extensionApi)) {
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
  const resolveValue = (
    installedName: string,
    installedApi: EditorExtensionApiMap
  ) => {
    const capability = installedApi[installedName];

    if (capability === undefined) {
      throw new Error(
        `Editor extension "${installedName}" does not expose an API.`
      );
    }

    return capability;
  };
  const createPortal = (
    requested: EditorExtensionReference,
    enforceIdentity: boolean
  ) => {
    const installedName = requested.name;
    const update = createEditorExtensionUpdatePortal(
      editor,
      installedName,
      enforceIdentity ? requested : undefined
    );
    const assertCurrentDescriptor = () => {
      if (
        enforceIdentity &&
        getCandidateEditorExtensionApi(editor, requested) === undefined &&
        resolveInstalledEditorExtension(source, requested) !== requested
      ) {
        throw new Error(
          `Editor extension "${installedName}" descriptor is no longer installed.`
        );
      }
    };

    return Object.freeze({
      get api() {
        const candidateApi = getCandidateEditorExtensionApi(editor, requested);

        if (candidateApi) return resolveValue(installedName, candidateApi);

        assertCurrentDescriptor();
        refresh();
        const installed =
          getExtensionRegistry(source).extensions.get(
            installedName
          )?.descriptor;

        if (!installed) {
          throw new Error(
            `Editor extension "${installedName}" is not installed on this editor.`
          );
        }
        return resolveValue(
          installedName,
          descriptorApis.get(installed) ??
            getInstalledEditorExtensionApi(editor, installedName) ??
            {}
        );
      },
      get read() {
        assertCurrentDescriptor();
        const capability = Reflect.get(editor.read, installedName);

        if (capability === undefined) {
          throw new Error(
            `Editor extension "${installedName}" does not expose read methods.`
          );
        }

        return capability;
      },
      get update() {
        return update;
      },
    });
  };
  const api = new Proxy(Object.create(null) as Record<string, unknown>, {
    get(_target, property) {
      if (typeof property !== 'string') return;
      const candidateValue = getCandidateEditorApiValue(editor, property);

      if (candidateValue !== undefined) return candidateValue;

      refresh();
      const values = apiGroups.get(property);

      return values?.length ? resolveEditorApiCapability(values) : undefined;
    },
  }) as TEditor['api'];
  const extensionPortal = ((extension: EditorExtensionReference) => {
    const candidateApi = getCandidateEditorExtensionApi(editor, extension);

    if (candidateApi) {
      return createPortal(extension, true);
    }
    const installed = resolveInstalledEditorExtension(source, extension);

    if (!installed) {
      throw new Error(
        `Editor extension "${extension.name}" is not installed on this editor.`
      );
    }

    refresh();

    return createPortal(installed, true);
  }) as unknown as TEditor['extension'];

  return Object.freeze({ api, extension: extensionPortal }) as Pick<
    TEditor,
    'api' | 'extension'
  >;
};

const createExtensionRecord = (entry: ExtensionEntry, order: number) =>
  ({
    activation: null,
    api: entry.extension.api === undefined ? Object.freeze({}) : null,
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
      if (installed.extension !== dependency) {
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
      schema.assertDocument(candidate as EditorDocumentValue),
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
          record.extension.api === undefined
            ? record.api
            : (resolvedApis.get(record.extension.name) ?? null)
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

const createExtensionApiFactoryContext = <TEditor extends Editor>(
  editor: TEditor,
  registry: ExtensionRegistry<TEditor>
) =>
  Object.freeze({
    editor: editor as EditorExtensionApiFactoryContext<TEditor>['editor'],
    getContributions: <TValue>(point: EditorExtensionPoint<TValue>) =>
      Object.freeze(
        (registry.contributions.get(point) ?? []).map(
          ({ value }) => value as Readonly<TValue>
        )
      ),
    root: toPublicRoot(getEditorRuntimeRoot(editor)),
  }) satisfies EditorExtensionApiFactoryContext<TEditor>;

const createExtensionCandidateContext = <TEditor extends Editor>(
  editor: TEditor,
  extension: EditorExtensionReference,
  registry: ExtensionRegistry<TEditor>,
  schema: InternalEditorSchemaApi<ValueOf<TEditor>>
) =>
  Object.freeze({
    ...createExtensionApiFactoryContext(editor, registry),
    name: extension.name,
    schema,
  }) satisfies EditorExtensionCandidateContext<TEditor>;

const validateExtensions = <TEditor extends Editor>(
  records: ReadonlyMap<string, ExtensionRecord>,
  registry: ExtensionRegistry<TEditor>,
  schema: InternalEditorSchemaApi<ValueOf<TEditor>>
) => {
  for (const record of getOrderedExtensionRecords(records)) {
    const extension = record.extension as EditorExtensionReference;
    const runtimeFields = getEditorExtensionRuntimeFields<TEditor>(extension);

    if (!runtimeFields.validate) continue;

    assertSynchronousLifecycleResult(
      runtimeFields.validate(
        createExtensionCandidateContext(
          record.editor as TEditor,
          extension,
          registry,
          schema
        )
      ),
      `Editor extension "${extension.name}" validation`
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
  let mergedCandidate!: ExtensionRegistry<TEditor>;
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
      EditorExtensionReference,
      EditorExtensionApiMap
    >();

    CANDIDATE_EDITOR_EXTENSION_APIS.set(
      getEditorRuntimeOwner(editor),
      candidateApis
    );

    try {
      for (const record of getOrderedExtensionRecords(nextRecords)) {
        if (record.extension.api === undefined) {
          candidateApis.set(record.extension, record.api ?? {});
          continue;
        }

        const extension = record.extension as EditorExtensionReference;
        const api = resolveExtensionApi(
          extension,
          createExtensionApiFactoryContext(
            record.editor as TEditor,
            declarative.merged
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

      validateExtensions(nextRecords, built.merged, built.schema);
      candidate = built.configured;
      mergedCandidate = built.merged;
      candidateDocumentChange = built.documentChange;
      const nextSchema: InternalEditorSchemaApi<ValueOf<TEditor>> =
        built.schema;

      validateCandidateDocument = (value) => {
        nextSchema.assertDocument(value);
      };
    } finally {
      CANDIDATE_EDITOR_EXTENSION_APIS.delete(getEditorRuntimeOwner(editor));
    }
  });
  const previousFactoryApis = new Map<
    ExtensionRecord,
    EditorExtensionApiMap | null
  >();

  for (const record of nextRecords.values()) {
    if (record.extension.api !== undefined) {
      previousFactoryApis.set(record, record.api);
    }
  }
  const installResolvedApis = () => {
    for (const record of nextRecords.values()) {
      if (record.extension.api === undefined) continue;

      record.api = resolvedApis.get(record.extension.name) ?? null;
    }
  };
  const restorePreviousApis = () => {
    for (const [record, api] of previousFactoryApis) record.api = api;
  };
  const previousNextOrder = state.nextOrder;
  const appliedDraftFieldDisposals: Array<() => void> = [];
  const stagedActivationRecords: ExtensionRecord[] = [];
  const candidateApis = new Map<
    EditorExtensionReference,
    EditorExtensionApiMap
  >();

  for (const record of nextRecords.values()) {
    candidateApis.set(
      record.extension,
      record.extension.api === undefined
        ? (record.api ?? {})
        : (resolvedApis.get(record.extension.name) ?? {})
    );
  }
  const rollbackStagedActivations = () => {
    const errors: Array<{ cause: unknown; record: ExtensionRecord }> = [];

    for (const record of stagedActivationRecords.toReversed()) {
      for (const cause of deactivateExtensionRecord(record, 'rollback')) {
        errors.push({ cause, record });
      }
    }
    stagedActivationRecords.length = 0;

    return errors;
  };
  const reportRollbackErrors = (
    errors: readonly { cause: unknown; record: ExtensionRecord }[]
  ) => {
    for (const { cause, record } of errors) {
      reportExtensionLifecycleError(
        record.editor,
        record.extension.name,
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
      throw new Error('Editor extension fields must stage before publication.');
    }

    ownsDraftFields = true;
    try {
      for (const record of activatedRecords) {
        for (const field of getEditorExtensionRuntimeFields(record.extension)
          .stateFields ?? []) {
          const rollback = activateStateField(editor, field);

          appliedDraftFieldDisposals.push(rollback);
        }
      }
      const owner = getEditorRuntimeOwner(editor);

      CANDIDATE_EDITOR_EXTENSION_APIS.set(owner, candidateApis);
      try {
        runWithCandidateExtensionRegistry(
          editor,
          { configured: candidate, current: mergedCandidate },
          () =>
            withTransactionSpecDraftRead(editor, () => {
              for (const record of activatedRecords) {
                try {
                  activateExtensionRecord(record.editor, record);
                  stagedActivationRecords.push(record);
                } catch (error) {
                  const rollbackErrors = rollbackStagedActivations();

                  if (error instanceof EditorExtensionPublicationError) {
                    throw new EditorExtensionPublicationError(
                      error.extensionName,
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
            })
        );
      } finally {
        CANDIDATE_EDITOR_EXTENSION_APIS.delete(owner);
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
  let registryPublication: PublishedConfiguredExtensionRegistry | null = null;

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
        const currentRootNames = cleanupRootNames.filter((name) =>
          isSameInstalledExtension(
            currentState.records.get(name),
            nextRecords.get(name)
          )
        );
        const ownedNames = collectOwnedExtensionNames(
          currentState,
          currentRootNames
        );
        const affectedNames = [
          ...new Set([...currentRootNames, ...ownedNames]),
        ].filter((name) =>
          isSameInstalledExtension(
            currentState.records.get(name),
            nextRecords.get(name)
          )
        );
        const removableRecords = getInstalledExtensionRecords(
          currentState,
          affectedNames
        );

        if (removableRecords.length === 0) {
          cleanupCalled = true;
          return;
        }

        const removalInput = removableRecords.map(({ extension }) =>
          canonicalizeEditorExtension({
            enabled: false,
            name: extension.name,
          })
        );
        const removalKey = `editor.unextend:${++nextDynamicExtensionPublication}`;

        runTrustedUpdate(editor, () => {
          stageEditorExtensionCandidate(
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
        reportRollbackErrors(rollbackStagedActivations());
        disposeDraftFields();
        phase = 'cancelled';
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
  const expanded = new Set<EditorExtensionReference>();
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
          previous.extension === next.extension
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
      previous.extension !== extension &&
      !replacedNames.includes(extension.name)
    ) {
      throw new Error(
        `Editor extension "${extension.name}" has multiple descriptor identities in the same configuration.`
      );
    }

    if (
      previous &&
      previous.editor === entry.editor &&
      previous.extension === extension
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
  const slotOwners = new Map<string, Set<string>>();

  for (const record of nextRecords.values()) {
    for (const dependency of record.extension.dependencies ?? []) {
      const owners = requiredBy.get(dependency.name) ?? new Set<string>();

      owners.add(record.extension.name);
      requiredBy.set(dependency.name, owners);
    }
    const slotInput = getEditorExtensionSlotInput(record.extension);

    if (!slotInput) continue;
    for (const entry of expandExtensionInput(slotInput, record.editor, {
      kind: 'slot',
      owner: record.extension.name,
    })) {
      const retained = nextRecords.get(entry.extension.name);

      if (!retained || retained.extension !== entry.extension) continue;
      for (const owner of entry.slotOwners) {
        const owners =
          slotOwners.get(entry.extension.name) ?? new Set<string>();

        owners.add(owner);
        slotOwners.set(entry.extension.name, owners);
      }
    }
  }
  for (const [name, record] of nextRecords) {
    const dependencyOwners = new Set(requiredBy.get(name) ?? []);
    const currentSlotOwners = new Set(slotOwners.get(name) ?? []);

    if (
      areEqualExtensionOwnerSets(record.requiredBy, dependencyOwners) &&
      areEqualExtensionOwnerSets(record.slotOwners, currentSlotOwners)
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
    const next = nextRecords.get(record.extension.name);

    return (
      !next ||
      next.editor !== record.editor ||
      next.extension !== record.extension
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
  input: EditorExtensionInput
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
  input: EditorExtensionInput,
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
  input: EditorExtensionInput,
  options: EditorExtensionReconfigureOptions = {}
): (() => void) => {
  let cleanup = () => {};
  const key = `editor.install:${++nextDynamicExtensionPublication}`;

  runTrustedUpdate(editor, () => {
    stageEditorExtensionCandidate(
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
