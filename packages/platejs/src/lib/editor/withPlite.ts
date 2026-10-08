import type { EditorStateField } from 'plitejs';
import {
  cloneEditorJsonValue,
  type CompiledEditorSchema,
  createDetachedEditorSchema,
  EDITOR_DOCUMENT_FIELDS,
  type EditorRecordIssue,
  isEnvelopeInput,
  readDocumentRecord,
  readPersistedEnvelope,
  getEditorAuthoredDocumentCapability,
  initializePluginEntries,
  type InternalPluginPublicationEntry,
  type NativeAuthoredDocumentCapability,
  type NativeAuthoredDocumentProjection,
  withCompiledEditorSchemaCapabilityEntries,
  withEditorDocumentProjection,
  withPluginPortalCandidates,
} from 'plitejs/internal';

import {
  containsCompleteEditorSchema,
  createEditor as createPliteEditor,
  defineRuntimePlugin,
  defineEditorSchema,
  type Editor as RuntimeEditor,
  type EditorCoreStateView,
  type EditorDocumentValue,
  type EditorStateSchemaApi,
  type EditorSchemaContract,
  type RuntimePluginReference,
  type EditorLifecycleErrorSink,
  type PersistedDocumentInput,
  type SnapshotInput,
  type EditorTransactionSpecBuilder,
  type Selection,
  type Value,
  getCompiledEditorSchemaFromApi,
  mapSemanticUpdateMethodArguments,
  repairEditorValue,
  setEditorStateViewTransform,
  setEditorTransactionViewTransform,
} from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import { compilePlateFormats } from '../../internal/plugin/compilePlateFormats';
import {
  attachPlateModelPublication,
  applyEditorApplicationSchema,
  clearPlateModelPublication,
  compileEditorApplicationSchema,
  compilePlateModel,
  createPlateBlockContent,
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateModelPublication,
  getPlateRuntime,
  isPlateBlockContent,
  withEditorApplicationSchemaCandidate,
  withCompiledPlateModelCandidate,
  withCompiledPlatePluginCandidate,
} from '../../internal/plugin/compilePlateModel';
import { createPlateChangeHandlersPlugin } from '../../internal/plugin/plateChangeHandlers';
import { clearPlateRuntimeCandidate } from '../../internal/plugin/plateRuntime';
import { clearPluginStores } from '../../internal/plugin/pluginStore';
import {
  collectPlatePluginSourceCandidates,
  createPlateModelPublication,
  createPlateRuntimePlugins,
  resolvePlugins,
  snapshotPlatePluginSources,
} from '../../internal/plugin/resolvePlugins';
import type { NoInfer } from '../../internal/types';
import {
  getPluginSourceReferences,
  getPluginSchemaFamily,
  isNominalPluginDescriptor,
  isNominalPluginReference,
} from '../../internal/utils/mergePlugins';
import type {
  AnyBasePlugin,
  BasePluginDefinitionInput,
} from '../plugin/BasePlugin';
import { createPlatePluginPortal } from '../plugin/createPluginContext.internal';
import { createBasePlugin } from '../plugin/defineBasePlugin.internal';
import type { PluginReference } from '../plugin/PluginDefinition';
import {
  type CorePluginDefinition,
  type CorePlugins,
  getCorePlugins,
} from '../plugins/getCorePlugins.internal';
import type {
  InferPlugins,
  InferRuntimePlugins,
  Editor,
  BasePluginInput,
  InternalBaseEditorWithInstalledPlugins,
  MergeInstalledPluginDefinitions,
} from './Editor';
import {
  type EditorApplicationSchema,
  type EditorSchemaIdentity,
  getEditorSchemaIdentity,
} from './editorApplicationSchema';
import { defineEditorUser, resolveEditorUserId } from './editorUser.internal';

type PlateSchemaDescriptor = PluginReference;

type InferBaseEditorPlugins<TPlugins extends readonly unknown[]> =
  MergeInstalledPluginDefinitions<
    InferRuntimePlugins<CorePlugins>,
    InferRuntimePlugins<TPlugins>
  >;

type InferBaseEditorSchemaPlugins<TPlugins extends readonly unknown[]> =
  MergeInstalledPluginDefinitions<CorePluginDefinition, InferPlugins<TPlugins>>;

const hasPlateSchemaDescriptorShape = (
  value: unknown
): value is PlateSchemaDescriptor =>
  typeof value === 'object' && value !== null && 'name' in value;

const isBasePluginDescriptor = (value: unknown): value is AnyBasePlugin =>
  isNominalPluginDescriptor(value) &&
  ['configure', 'extend'].every(
    (method) => typeof Reflect.get(value, method) === 'function'
  );

const resolvePlateSchemaDescriptor = (
  editor: Editor,
  descriptor: PlateSchemaDescriptor,
  requireElement: boolean
) => {
  if (!isNominalPluginReference(descriptor)) {
    throw new Error('Plate schema received an invalid plugin descriptor.');
  }
  const plugin = getCompiledPlatePlugin(editor, descriptor.name);
  const binding = getCompiledPlateModelBinding(editor, descriptor);

  if (!plugin || !binding) {
    throw new Error(
      `Plate schema descriptor "${descriptor.name}" is not installed.`
    );
  }
  if (getPluginSchemaFamily(descriptor) !== getPluginSchemaFamily(plugin)) {
    throw new Error(
      `Plate schema descriptor "${descriptor.name}" does not match the installed plugin family.`
    );
  }
  if (requireElement && !binding.elementType) {
    throw new Error(
      `Plate plugin "${descriptor.name}" does not declare schema.element.`
    );
  }

  return { binding, plugin };
};

const lowerPlateNodeType = (editor: Editor, type: unknown): unknown => {
  if (Array.isArray(type)) {
    return type.map((item) => lowerPlateNodeType(editor, item));
  }
  if (!hasPlateSchemaDescriptorShape(type)) return type;

  return (
    resolvePlateSchemaDescriptor(editor, type, true).binding.elementType ??
    failInvariant('Expected value to be defined')
  );
};

const lowerPlateNodeOptions = (editor: Editor, options: unknown): unknown => {
  if (typeof options !== 'object' || options === null) return options;

  const record = options as Record<string, unknown>;
  let changed = false;
  const next = { ...record };

  if ('type' in record) {
    next.type = lowerPlateNodeType(editor, record.type);
    changed = next.type !== record.type;
  }
  for (const key of ['split'] as const) {
    if (!(key in record)) continue;
    const lowered = lowerPlateNodeOptions(editor, record[key]);

    if (lowered !== record[key]) {
      next[key] = lowered;
      changed = true;
    }
  }

  return changed ? next : options;
};

const createPlateNodeOptionsProxy = (
  editor: Editor,
  target: object,
  optionIndexes: Readonly<Record<string, number>>
) => {
  const methodCache = new Map<PropertyKey, unknown>();

  return new Proxy(
    typeof target === 'function'
      ? (...args: unknown[]) => Reflect.apply(target, target, args)
      : {},
    {
      get(source, key) {
        const sourceDescriptor = Reflect.getOwnPropertyDescriptor(source, key);

        if (
          sourceDescriptor &&
          !sourceDescriptor.configurable &&
          'value' in sourceDescriptor &&
          !sourceDescriptor.writable
        ) {
          return sourceDescriptor.value;
        }

        const value = Reflect.get(target, key, target);
        const optionIndex =
          typeof key === 'string' ? optionIndexes[key] : undefined;

        if (typeof value !== 'function' || optionIndex === undefined) {
          return value;
        }

        const cached = methodCache.get(key);

        if (cached) return cached;

        const mapped = mapSemanticUpdateMethodArguments(value, (input) => {
          const args = [...input];

          args[optionIndex] = lowerPlateNodeOptions(editor, args[optionIndex]);

          return args;
        });

        methodCache.set(key, mapped);

        return mapped;
      },
      getOwnPropertyDescriptor(source, key) {
        const sourceDescriptor = Reflect.getOwnPropertyDescriptor(source, key);

        if (sourceDescriptor && !sourceDescriptor.configurable) {
          return sourceDescriptor;
        }
        const descriptor = Reflect.getOwnPropertyDescriptor(target, key);

        return descriptor ? { ...descriptor, configurable: true } : undefined;
      },
      has(_source, key) {
        return Reflect.has(target, key);
      },
      ownKeys(source) {
        return [
          ...new Set([...Reflect.ownKeys(source), ...Reflect.ownKeys(target)]),
        ];
      },
    }
  );
};

const STATE_NODE_OPTION_INDEXES = Object.freeze({
  above: 0,
  block: 0,
  blocks: 0,
  entries: 0,
  find: 0,
  get: 1,
  levels: 0,
  next: 0,
  parent: 1,
  previous: 0,
  some: 0,
  toArray: 0,
});

const TRANSACTION_NODE_OPTION_INDEXES = Object.freeze({
  ...STATE_NODE_OPTION_INDEXES,
  insert: 1,
  lift: 0,
  merge: 0,
  move: 0,
  remove: 0,
  set: 1,
  split: 0,
  unset: 1,
  unwrap: 0,
  wrap: 1,
});

const BLOCK_OPTION_INDEXES = Object.freeze({
  duplicate: 0,
  insertAfter: 1,
  set: 1,
  toggle: 1,
});

const SELECTION_OPTION_INDEXES = Object.freeze({
  isAcrossBlocks: 0,
  isAtBlockEnd: 0,
  isAtBlockStart: 0,
  isWithinBlock: 0,
});

export type EditorValueInput<V extends Value> =
  | EditorDocumentValue<V>
  | PersistedDocumentInput<V>
  | Readonly<V>
  | V;

const EMPTY_INITIAL_VALUE =
  'Plate initialValue must contain at least one primary-root element.';

const readPlateInitialValue = (
  value: unknown
): EditorDocumentValue | PersistedDocumentInput => {
  const reject = (issue: EditorRecordIssue): never => {
    throw new Error(
      issue.kind === 'json'
        ? 'Plate initialValue must encode to JSON-compatible data.'
        : issue.kind !== 'field'
          ? EMPTY_INITIAL_VALUE
          : issue.field === 'selection'
            ? 'Plate initialValue field "selection" is not supported. Pass the selection option instead.'
            : `Plate initialValue field "${issue.field}" is not supported. Store application data in meta.`
    );
  };

  if (isEnvelopeInput(value)) {
    const envelope = readPersistedEnvelope(value);
    const document = envelope.document as { children?: unknown } | null;

    if (!Array.isArray(document?.children) || document.children.length === 0) {
      throw new Error(EMPTY_INITIAL_VALUE);
    }

    return envelope as PersistedDocumentInput;
  }

  const document = Array.isArray(value)
    ? { children: value }
    : readDocumentRecord(value, EDITOR_DOCUMENT_FIELDS, reject);

  if (!Array.isArray(document.children) || document.children.length === 0) {
    throw new Error(EMPTY_INITIAL_VALUE);
  }

  return document as EditorDocumentValue;
};

const normalizeBaseInitialValue = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: Editor<V, TPlugins>,
  value: unknown
): EditorDocumentValue<V> | PersistedDocumentInput<V> => {
  if (value !== undefined) {
    return readPlateInitialValue(value) as
      | EditorDocumentValue<V>
      | PersistedDocumentInput<V>;
  }

  const currentValue = editor.read.value() as EditorDocumentValue<V>;

  return {
    document:
      currentValue.children.length > 0
        ? currentValue
        : editor.read.schema.fitDocument(currentValue),
    schema: editor.read.schema.identity(),
  };
};

const resolveBaseInitialValue = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: Editor<V, TPlugins>,
  {
    autoSelect,
    initialValue,
    selection,
  }: {
    autoSelect?: boolean | 'end' | 'start';
    initialValue?:
      | ((context: { editor: Editor<V, TPlugins> }) => EditorValueInput<V>)
      | EditorValueInput<V>;
    selection?: Selection;
  }
) => {
  const nextValue = normalizeBaseInitialValue<V, TPlugins>(
    editor,
    typeof initialValue === 'function' ? initialValue({ editor }) : initialValue
  );
  const autoSelection =
    autoSelect === true
      ? 'end'
      : autoSelect === 'start' || autoSelect === 'end'
        ? autoSelect
        : undefined;
  const selectionInput =
    selection ??
    autoSelection ??
    ('document' in nextValue ? nextValue.selection : undefined) ??
    null;

  return {
    ...nextValue,
    selection: selectionInput,
  };
};

const createPlateSchemaPlugins = (
  editor: Editor,
  identityOptions: EditorSchemaIdentity | undefined,
  model: ReturnType<typeof compilePlateModel>,
  pluginList: readonly AnyBasePlugin[],
  runtimePlugins: readonly RuntimePluginReference[],
  publicationSchema: EditorApplicationSchema | undefined,
  pluginInputs: readonly RuntimePluginReference[],
  applicationSchema?: ReturnType<typeof compileEditorApplicationSchema>,
  applicationName?: string
): readonly InternalPluginPublicationEntry[] => {
  const hasCompletePluginSchema = containsCompleteEditorSchema(runtimePlugins);
  const definition = {
    groups: model.contribution.groups ?? {},
    root:
      applicationSchema?.root ??
      createPlateBlockContent({
        default: { type: 'paragraph' },
        min: 1,
      }),
  };
  const schemaFoundation = hasCompletePluginSchema
    ? undefined
    : identityOptions
      ? defineEditorSchema(`schema:${identityOptions.id}`, {
          ...definition,
          id: identityOptions.id,
          version: identityOptions.version,
        })
      : defineEditorSchema('schema:derived', definition);
  const { formatPlugins, runtime } = withCompiledPlateModelCandidate(
    editor,
    model,
    () => {
      const innerRuntime = createPlateRuntimePlugins(
        editor,
        pluginList,
        model,
        (type) => lowerPlateNodeType(editor, type),
        { includeSchemaContributions: !hasCompletePluginSchema }
      );

      return {
        formatPlugins: compilePlateFormats(editor, model, pluginList),
        runtime: innerRuntime,
      };
    }
  );
  const applicationSchemaPlugin = applicationSchema
    ? defineRuntimePlugin(`schema:application:${applicationName ?? 'editor'}`, {
        schema: applicationSchema.contribution,
      })
    : undefined;
  let publication: ReturnType<typeof createPlateModelPublication> | undefined;

  const modelPlugin = defineRuntimePlugin('plate:model', {
    validate: ({ schema: schemaApi }) => {
      const compiledSchema = getCompiledEditorSchemaFromApi(schemaApi);

      if (!compiledSchema) {
        throw new Error(
          'Generated editor validation requires a compiled schema.'
        );
      }
      const { apiByPlugin, shortcutApiByPlugin } =
        runtime.resolveApiPublication();

      publication ??= createPlateModelPublication(
        editor,
        identityOptions ?? null,
        publicationSchema,
        pluginInputs,
        model,
        pluginList,
        schemaApi,
        apiByPlugin,
        shortcutApiByPlugin,
        runtime.updateMethods
      );
      attachPlateModelPublication(editor, publication);
    },
  });

  return Object.freeze([
    ...(schemaFoundation ? [{ plugin: schemaFoundation }] : []),
    ...runtime.entries,
    ...runtimePlugins.map((plugin) => ({ plugin })),
    ...(applicationSchemaPlugin ? [{ plugin: applicationSchemaPlugin }] : []),
    { plugin: modelPlugin },
    ...formatPlugins.map((plugin) => ({ plugin })),
  ]);
};

const createPlateConfiguration = (
  editor: Editor,
  identity: EditorSchemaIdentity | undefined,
  pluginList: readonly AnyBasePlugin[],
  plugins: readonly RuntimePluginReference[],
  userPlugins: readonly BasePluginInput[],
  schema?: EditorApplicationSchema
) =>
  withCompiledPlatePluginCandidate(editor, pluginList, () => {
    const authoredModel = compilePlateModel(editor);
    const applicationSchema = compileEditorApplicationSchema(
      authoredModel,
      schema
    );
    const model = applyEditorApplicationSchema(
      authoredModel,
      applicationSchema?.contribution
    );
    const modelPlugins = createPlateSchemaPlugins(
      editor,
      identity,
      model,
      pluginList,
      plugins,
      schema,
      Object.freeze([...userPlugins, ...plugins]),
      applicationSchema,
      schema?.id
    );
    return Object.freeze({
      entries: Object.freeze([
        ...modelPlugins,
        { plugin: createPlateChangeHandlersPlugin(editor) },
      ]),
      model,
    });
  });

const installPlateModelAccessors = (editor: Editor) => {
  const previousSchemaDescriptor = Object.getOwnPropertyDescriptor(
    editor.read,
    'schema'
  );
  const rawSchema = editor.read.schema;
  const schemaFacade = new Proxy(rawSchema, {
    get(target, key, receiver) {
      if (key === 'create') {
        return (
          descriptor: unknown,
          properties?: Readonly<Record<string, unknown>>
        ) => {
          if (!hasPlateSchemaDescriptorShape(descriptor)) {
            return rawSchema.create(
              descriptor as Parameters<typeof rawSchema.create>[0],
              properties
            );
          }
          const { binding } = resolvePlateSchemaDescriptor(
            editor,
            descriptor,
            true
          );

          return rawSchema.create(
            binding.elementType ??
              failInvariant('Expected value to be defined'),
            properties
          );
        };
      }
      if (key === 'allowsElementType') {
        return (
          parent: PlateSchemaDescriptor | string,
          child: PlateSchemaDescriptor | string
        ) =>
          rawSchema.allowsElementType(
            hasPlateSchemaDescriptorShape(parent)
              ? (resolvePlateSchemaDescriptor(editor, parent, true).binding
                  .elementType ?? failInvariant('Expected value to be defined'))
              : parent,
            hasPlateSchemaDescriptorShape(child)
              ? (resolvePlateSchemaDescriptor(editor, child, true).binding
                  .elementType ?? failInvariant('Expected value to be defined'))
              : child
          );
      }
      if (key === 'element') {
        return (descriptor: PlateSchemaDescriptor | string) => {
          if (!hasPlateSchemaDescriptorShape(descriptor)) {
            return rawSchema.element(descriptor);
          }
          const { binding } = resolvePlateSchemaDescriptor(
            editor,
            descriptor,
            true
          );

          return rawSchema.element(
            binding.elementType ?? failInvariant('Expected value to be defined')
          );
        };
      }
      if (key === 'isElementTypeInGroup') {
        return (descriptor: PlateSchemaDescriptor | string, group: string) =>
          rawSchema.isElementTypeInGroup(
            hasPlateSchemaDescriptorShape(descriptor)
              ? (resolvePlateSchemaDescriptor(editor, descriptor, true).binding
                  .elementType ?? failInvariant('Expected value to be defined'))
              : descriptor,
            group
          );
      }
      if (key === 'isBlockContent') {
        return (node: Parameters<typeof rawSchema.isBlock>[0]) =>
          isPlateBlockContent(rawSchema, node);
      }
      return Reflect.get(target, key, receiver);
    },
  });

  Object.defineProperty(editor.read, 'schema', {
    configurable: true,
    enumerable: true,
    value: schemaFacade,
  });

  return () => {
    if (previousSchemaDescriptor) {
      Object.defineProperty(editor.read, 'schema', previousSchemaDescriptor);
    } else {
      Reflect.deleteProperty(editor.read, 'schema');
    }
  };
};

const withPlatePluginPortalCandidates = <T>(
  editor: Editor,
  sources: Parameters<typeof collectPlatePluginSourceCandidates>[0],
  run: () => T
): T =>
  withPluginPortalCandidates(
    editor,
    collectPlatePluginSourceCandidates(sources).map((descriptor) => ({
      createPortal: createPlatePluginPortal,
      descriptor,
      sources: getPluginSourceReferences(descriptor),
    })),
    run
  );

const installPlateRuntimePlugins = (
  editor: Editor,
  identity: EditorSchemaIdentity | undefined,
  plugins: readonly RuntimePluginReference[],
  userPlugins: readonly BasePluginInput[],
  initialization?: Readonly<{
    initialize?: (tx: EditorTransactionSpecBuilder<Value, any>) => void;
    initialValue?: () => SnapshotInput;
  }>,
  schema?: EditorApplicationSchema
) => {
  let restoreModelAccessors: (() => void) | undefined;

  try {
    const configuration = createPlateConfiguration(
      editor,
      identity,
      getPlateRuntime(editor).pluginList,
      plugins,
      userPlugins,
      schema
    );

    withCompiledPlateModelCandidate(editor, configuration.model, () => {
      initializePluginEntries<RuntimeEditor<any, any>>(
        editor,
        configuration.entries,
        {
          initialize: initialization?.initialize
            ? (tx) => {
                restoreModelAccessors ??= installPlateModelAccessors(editor);
                (
                  initialization.initialize ??
                  failInvariant('Expected value to be defined')
                )(tx);
              }
            : undefined,
          initialValue: initialization?.initialValue
            ? () => {
                restoreModelAccessors ??= installPlateModelAccessors(editor);

                return (
                  initialization.initialValue ??
                  failInvariant('Expected value to be defined')
                )();
              }
            : undefined,
        }
      );
    });
  } catch (error) {
    restoreModelAccessors?.();
    throw error;
  }

  if (!restoreModelAccessors) installPlateModelAccessors(editor);
};

export type EditorOptions<
  TPlugins extends readonly RuntimePluginReference[] = readonly [],
> = {
  /**
   * Unique identifier for the editor instance. Without one, the editor gets a
   * generated id.
   */
  id?: string;
  /** Receives failures from plugin lifecycle observers. */
  lifecycleErrorSink?: EditorLifecycleErrorSink<RuntimeEditor<any, any>>;
  /**
   * The user this editor writes and comments as, recorded as the author of
   * authored changes. Without a `userId`, the editor writes as the local user,
   * `'local'`; pass one whenever more than one person writes the document. A
   * `userId` that contains a NUL character throws.
   */
  userId?: string;
  /**
   * Enable mark/element affinity.
   *
   * @default true
   */
  affinity?: boolean;
  /**
   * Select the editor after initialization.
   *
   * @default false
   *
   * - `true` | 'end': Select the end of the editor
   * - `false`: Do not select anything
   * - `'start'`: Select the start of the editor
   */
  autoSelect?: boolean | 'end' | 'start';
  /**
   * Specifies the maximum number of characters allowed in the editor. When the
   * limit is reached, further input will be prevented.
   */
  maxLength?: number;
  /**
   * Array of plugins to be loaded into the editor. Plugins extend the editor's
   * functionality and define custom behavior.
   */
  plugins?: TPlugins;
  /**
   * Editor read-only initial state. For dynamic read-only control, use the
   * `Plate.readOnly` prop instead.
   *
   * @default false
   */
  readOnly?: boolean;
  /** Application-owned schema policy and optional persisted lineage. */
  schema?: EditorApplicationSchema;
  /**
   * Initial selection state for the editor. Defines where the cursor should be
   * positioned when the editor loads.
   */
  selection?: Selection;
  /** Initial model selection. */
  initialSelection?: Selection;
  /**
   * When `true`, normalizes the `initialValue` passed to the editor. This is
   * useful when adding normalization rules to already existing content or when
   * the initial value might not conform to the current schema.
   *
   * Note: Normalization may take time for large documents.
   *
   * @default false
   */
  shouldNormalizeEditor?: boolean;
  /**
   * When `true`, skips `initialValue`, selection, and normalization.
   * Useful when the editor state is managed externally (e.g., with Yjs
   * collaboration) or when you want to manually control the initialization
   * process. A later complete `editor.update.value.replace(...)` accepts only
   * current-schema input and applies normal schema fitting.
   *
   * @default false
   */
  skipInitialization?: boolean;
};

type BaseEditorOptions<
  V extends Value = Value,
  P extends BasePluginInput = CorePlugins[number],
  TPlugins extends readonly RuntimePluginReference[] = readonly [],
> = Omit<EditorOptions<TPlugins>, 'id'> &
  Partial<
    Pick<AnyBasePlugin, 'decorate' | 'initialState' | 'inject' | 'override'>
  > & {
    /** Root editor API declarations for the synthetic root plugin. */
    api?: BasePluginDefinitionInput['api'];
    /**
     * Complete editor document, persisted document envelope, or primary-root
     * array shorthand. Persisted envelopes must match the compiled current
     * schema identity.
     *
     * Omit this option to start from the schema's default primary-root child.
     */
    initialValue?:
      | ((context: {
          editor: InternalBaseEditorWithInstalledPlugins<
            V,
            InferBaseEditorPlugins<P[]>,
            InferBaseEditorSchemaPlugins<P[]>
          >;
        }) => EditorValueInput<NoInfer<V>>)
      | EditorValueInput<NoInfer<V>>;
  };

const partitionPluginInputs = (
  plugins: readonly RuntimePluginReference[]
): Readonly<{
  plate: readonly BasePluginInput[];
  runtime: readonly RuntimePluginReference[];
}> => {
  const plate: BasePluginInput[] = [];
  const runtime: RuntimePluginReference[] = [];

  for (const plugin of plugins) {
    if (isNominalPluginDescriptor(plugin)) {
      plate.push(plugin as BasePluginInput);
    } else {
      runtime.push(plugin);
    }
  }

  return Object.freeze({
    plate: Object.freeze(plate),
    runtime: Object.freeze(runtime),
  });
};

const prepareInitialPlatePlugins = (
  editor: Editor,
  {
    affinity,
    plugins = [],
    schema,
  }: Omit<
    Pick<EditorOptions<readonly BasePluginInput[]>, 'affinity' | 'schema'>,
    'plugins'
  > & {
    plugins?: readonly BasePluginInput[];
  },
  rootPluginConfig: object = {}
) => {
  const identity = getEditorSchemaIdentity(schema);
  const baseCorePlugins = getCorePlugins({ affinity });

  const internalRootCandidate = createBasePlugin('root', rootPluginConfig);

  if (!isBasePluginDescriptor(internalRootCandidate)) {
    throw new Error(
      'Plate root plugin construction returned an invalid descriptor.'
    );
  }
  const internalRootDescriptor = internalRootCandidate;

  const sourcePlugins = snapshotPlatePluginSources({
    baseCore: baseCorePlugins,
    internalRoot: internalRootDescriptor,
    reactCore: [],
    user: plugins,
  });
  const applicationPolicy = schema;
  let restoreStateViewTransform: (() => void) | undefined;
  let restoreTransactionViewTransform: (() => void) | undefined;

  const restore = () => {
    restoreStateViewTransform?.();
    restoreTransactionViewTransform?.();
    clearPlateModelPublication(editor);
    clearPluginStores(editor);
  };

  try {
    withPlatePluginPortalCandidates(editor, sourcePlugins, () =>
      withEditorApplicationSchemaCandidate(
        editor,
        applicationPolicy,
        collectPlatePluginSourceCandidates(sourcePlugins),
        () => resolvePlugins(editor, sourcePlugins)
      )
    );
    restoreStateViewTransform = setEditorStateViewTransform(editor, (state) => {
      for (const [key, optionIndexes] of [
        ['nodes', STATE_NODE_OPTION_INDEXES],
        ['selection', SELECTION_OPTION_INDEXES],
      ] as const) {
        const group = state[key];

        if (
          (typeof group === 'object' && group !== null) ||
          typeof group === 'function'
        ) {
          state[key] = createPlateNodeOptionsProxy(
            editor,
            group,
            optionIndexes
          );
        }
      }
    });
    restoreTransactionViewTransform = setEditorTransactionViewTransform(
      editor,
      (transaction) => {
        for (const [key, optionIndexes] of [
          ['blocks', BLOCK_OPTION_INDEXES],
          ['nodes', TRANSACTION_NODE_OPTION_INDEXES],
          ['selection', SELECTION_OPTION_INDEXES],
        ] as const) {
          const group = transaction[key];

          if (
            (typeof group === 'object' && group !== null) ||
            typeof group === 'function'
          ) {
            transaction[key] = createPlateNodeOptionsProxy(
              editor,
              group,
              optionIndexes
            );
          }
        }
      }
    );
    return {
      identity,
      restore,
      userPlugins: sourcePlugins.user,
      withSchemaCandidate: <T>(run: () => T): T =>
        withPlatePluginPortalCandidates(editor, sourcePlugins, () =>
          withEditorApplicationSchemaCandidate(
            editor,
            applicationPolicy,
            collectPlatePluginSourceCandidates(sourcePlugins),
            run
          )
        ),
    };
  } catch (error) {
    restore();
    throw error;
  }
};

// A proxy can answer `in` and own-property checks differently, so a key either one sees counts.
const hasOption = (options: object, key: string) => {
  if (key in options) return true;
  for (
    let object: object | null = options;
    object !== null;
    object = Object.getPrototypeOf(object)
  ) {
    if (Object.hasOwn(object, key)) return true;
  }

  return false;
};

/**
 * Call this on the options a caller passed, before any copy drops a key.
 *
 * @internal
 */
export const assertConstructorOptions = (options: object) => {
  if (hasOption(options, 'editor')) {
    throw new Error(
      'Plate editor constructors always create a new editor and take no `editor` option. Pass the document as `initialValue`, and render an existing editor with `EditorRoot`.'
    );
  }
  if (hasOption(options, 'migrations')) {
    throw new Error(
      'Plate editor `migrations` is unsupported. Convert persisted documents with migrateDocument before creating or replacing an editor value.'
    );
  }
};

type BuildEditorOptions<TEditor extends Editor> = EditorOptions<
  readonly RuntimePluginReference[]
> & {
  initialValue?:
    | ((context: { editor: TEditor }) => EditorValueInput<Value>)
    | EditorValueInput<Value>;
};

/**
 * Options that are not editor options configure the root plugin.
 *
 * @internal
 */
export const buildEditor = <TEditor extends Editor = Editor>(
  options: BuildEditorOptions<TEditor>
): Editor => {
  assertConstructorOptions(options);
  const {
    affinity,
    autoSelect,
    id,
    initialValue,
    initialSelection,
    lifecycleErrorSink,
    maxLength,
    plugins = [],
    readOnly,
    schema,
    selection,
    shouldNormalizeEditor,
    skipInitialization,
    userId,
    ...rootPluginConfig
  } = options;
  const editorUserId = resolveEditorUserId(userId);
  const editor = createPliteEditor({
    id,
    lifecycleErrorSink,
    maxLength,
    readOnly,
  }) as unknown as Editor;

  defineEditorUser(editor, editorUserId);
  const pluginInputs = partitionPluginInputs(plugins);
  let prepared: ReturnType<typeof prepareInitialPlatePlugins> | undefined;

  try {
    prepared = prepareInitialPlatePlugins(
      editor,
      { affinity, plugins: pluginInputs.plate, schema },
      rootPluginConfig
    );
    const { identity, userPlugins } = prepared;

    prepared.withSchemaCandidate(() => {
      installPlateRuntimePlugins(
        editor,
        identity
          ? Object.freeze({
              id: identity.id,
              version: identity.version,
            })
          : undefined,
        pluginInputs.runtime,
        userPlugins,
        skipInitialization
          ? undefined
          : {
              initialize: shouldNormalizeEditor
                ? () => repairEditorValue(editor)
                : undefined,
              initialValue: () =>
                resolveBaseInitialValue(editor, {
                  autoSelect,
                  initialValue:
                    typeof initialValue === 'function'
                      ? () => initialValue({ editor: editor as TEditor })
                      : initialValue,
                  selection: selection ?? initialSelection,
                }),
            },
        schema
      );
    });

    return editor;
  } catch (error) {
    prepared?.restore();
    throw error;
  } finally {
    clearPlateRuntimeCandidate(editor);
  }
};

/** Detached schema and plugin facts emitted by `compileEditor`. */
export type EditorCompilation = Readonly<{
  bindings: ReadonlyArray<
    Readonly<{
      authoredToggle?: true;
      key?: string;
      name: string;
      type?: string;
    }>
  >;
  schema: EditorSchemaContract;
}>;

/** @internal */
export type PlateEditorTargetCompilation = Readonly<{
  artifact: EditorCompilation;
  authored?: NativeAuthoredDocumentCapability;
  fields: ReadonlyArray<EditorStateField<any>>;
  schema: CompiledEditorSchema;
}>;

type PlateEditorTargetCompilationContext = PlateEditorTargetCompilation &
  Readonly<{ editor: Editor }>;

const withPlateEditorTargetCompilation = <T>(
  options: Pick<
    EditorOptions<readonly RuntimePluginReference[]>,
    'plugins' | 'schema'
  >,
  run: (context: PlateEditorTargetCompilationContext) => T
): T => {
  const editor = createPliteEditor() as unknown as Editor;
  const pluginInputs = partitionPluginInputs(options.plugins ?? []);
  let prepared: ReturnType<typeof prepareInitialPlatePlugins> | undefined;

  try {
    const current = prepareInitialPlatePlugins(editor, {
      plugins: pluginInputs.plate,
      schema: options.schema,
    });

    prepared = current;

    return current.withSchemaCandidate(() => {
      const configuration = createPlateConfiguration(
        editor,
        current.identity,
        getPlateRuntime(editor).pluginList,
        pluginInputs.runtime,
        current.userPlugins,
        options.schema
      );
      return withCompiledPlateModelCandidate(editor, configuration.model, () =>
        withCompiledEditorSchemaCapabilityEntries(
          editor,
          configuration.entries,
          (capability) => {
            const publication = getPlateModelPublication(editor);

            if (!publication) {
              throw new Error(
                'Editor compilation requires a validated Plate model.'
              );
            }
            const artifact: EditorCompilation = Object.freeze({
              bindings: Object.freeze(
                publication.model.bindings.map((binding) =>
                  Object.freeze({
                    ...(publication.updateMethods[binding.name]?.includes(
                      'toggle'
                    )
                      ? { authoredToggle: true as const }
                      : {}),
                    ...(binding.propertyKey
                      ? { key: binding.propertyKey }
                      : {}),
                    name: binding.name,
                    ...(binding.elementType
                      ? { type: binding.elementType }
                      : {}),
                  })
                )
              ),
              schema: capability.contract,
            });

            return run(
              Object.freeze({
                artifact,
                ...(capability.authored
                  ? { authored: capability.authored }
                  : {}),
                editor,
                fields: capability.fields,
                schema: capability.schema,
              })
            );
          }
        )
      );
    });
  } finally {
    prepared?.restore();
    clearPlateRuntimeCandidate(editor);
  }
};

/** @internal */
export const compilePlateEditorTarget = (
  options: Pick<
    EditorOptions<readonly RuntimePluginReference[]>,
    'plugins' | 'schema'
  >
): PlateEditorTargetCompilation =>
  withPlateEditorTargetCompilation(options, ({ editor: _editor, ...result }) =>
    Object.freeze(result)
  );

const projectFormatDocument = (
  document: EditorDocumentValue,
  projection: 'accepted' | 'proposed' | 'review',
  authored: NativeAuthoredDocumentCapability | undefined
): NativeAuthoredDocumentProjection => {
  if (document.meta?.authored === undefined) {
    return Object.freeze({
      diagnostics: Object.freeze([]),
      document,
      review: document,
    });
  }
  if (!authored) {
    throw new TypeError(
      'Authored document projection requires the authored plugin in the editor configuration.'
    );
  }

  return authored.project(document, projection);
};

/** Project one format document through the editor's installed authored capability. @internal */
export const projectPlateFormatDocument = (
  editor: Editor,
  document: EditorDocumentValue,
  projection: 'accepted' | 'proposed' | 'review'
): NativeAuthoredDocumentProjection => {
  const schema: EditorStateSchemaApi = editor.read.schema;

  schema.assertDocument(document);
  const projected = projectFormatDocument(
    document,
    projection,
    getEditorAuthoredDocumentCapability(editor)
  );

  schema.assertDocument(projected.document);

  return projected;
};

/** Run one format conversion against compiled plugin/schema facts without activation. @internal */
export const withPlateFormatCompilation = <T>(
  options: Pick<
    EditorOptions<readonly RuntimePluginReference[]>,
    'plugins' | 'schema'
  >,
  run: (
    context: Readonly<{
      editor: Editor;
      projectDocument: (
        document: EditorDocumentValue,
        projection: 'accepted' | 'proposed' | 'review'
      ) => NativeAuthoredDocumentProjection;
      readState: <R>(read: (state: EditorCoreStateView) => R) => R;
      readDocument: <R>(
        document: EditorDocumentValue,
        read: (state: EditorCoreStateView, document: EditorDocumentValue) => R
      ) => R;
    }>
  ) => T
): T =>
  withPlateEditorTargetCompilation(options, ({ authored, editor, schema }) => {
    const emptyDocument = Object.freeze({
      children: Object.freeze([]),
    }) as EditorDocumentValue;
    const detachedSchema: ReturnType<typeof createDetachedEditorSchema> =
      createDetachedEditorSchema(schema, emptyDocument);

    return run(
      Object.freeze({
        editor,
        projectDocument: (document, projection) => {
          detachedSchema.assertDocument(document);
          const projected = projectFormatDocument(
            document,
            projection,
            authored
          );

          detachedSchema.assertDocument(projected.document);

          return projected;
        },
        readState: (read) =>
          editor.read((state) =>
            read(
              Object.freeze({
                ...state,
                schema: detachedSchema,
              }) satisfies EditorCoreStateView
            )
          ),
        readDocument: (document, read) => {
          const owned = cloneEditorJsonValue(document);
          const operationSchema: ReturnType<typeof createDetachedEditorSchema> =
            createDetachedEditorSchema(schema, owned);

          operationSchema.assertDocument(owned);

          return withEditorDocumentProjection(editor, owned, () =>
            editor.read((state) => {
              const detachedState = Object.freeze({
                ...state,
                schema: operationSchema,
                value: () => owned,
              }) satisfies EditorCoreStateView;

              return read(detachedState, owned);
            })
          );
        },
      })
    );
  });

/** @internal */
export const compilePlateEditor = (
  options: Pick<
    EditorOptions<readonly RuntimePluginReference[]>,
    'plugins' | 'schema'
  >
): EditorCompilation => compilePlateEditorTarget(options).artifact;

type CreateEditorOptionsForValue<
  V extends Value,
  TPlugins extends readonly RuntimePluginReference[] = readonly [],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = Partial<
  Omit<BaseEditorOptions<V, BasePluginInput, TPlugins>, 'plugins' | 'schema'>
> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /**
   * Array of plugins to be loaded into the editor. Plugins extend the editor's
   * functionality and define custom behavior.
   */
  plugins?: TPlugins;
  schema?: TSchema;
};

export type CreateEditorOptions<
  V extends Value = Value,
  TPlugins extends readonly RuntimePluginReference[] = readonly [],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = CreateEditorOptionsForValue<V, TPlugins, TSchema>;

export type PlatePluginsFromTuple<TPlugins extends readonly unknown[]> = [
  TPlugins[number],
] extends [BasePluginInput]
  ? Extract<TPlugins, readonly BasePluginInput[]>
  : [Extract<TPlugins[number], BasePluginInput>] extends [never]
    ? readonly []
    : number extends TPlugins['length']
      ? ReadonlyArray<Extract<TPlugins[number], BasePluginInput>>
      : TPlugins extends readonly [infer TPlugin, ...infer TRest]
        ? TPlugin extends BasePluginInput
          ? readonly [TPlugin, ...PlatePluginsFromTuple<TRest>]
          : PlatePluginsFromTuple<TRest>
        : readonly [];

/** Keep only descriptors authored for the substrate runtime. */
export type RuntimePluginsFromTuple<TPlugins extends readonly unknown[]> = [
  TPlugins[number],
] extends [BasePluginInput]
  ? readonly []
  : [Extract<TPlugins[number], BasePluginInput>] extends [never]
    ? TPlugins
    : number extends TPlugins['length']
      ? ReadonlyArray<Exclude<TPlugins[number], BasePluginInput>>
      : TPlugins extends readonly [infer TPlugin, ...infer TRest]
        ? TPlugin extends BasePluginInput
          ? RuntimePluginsFromTuple<TRest>
          : TPlugin extends RuntimePluginReference
            ? readonly [TPlugin, ...RuntimePluginsFromTuple<TRest>]
            : RuntimePluginsFromTuple<TRest>
        : readonly [];

/**
 * Creates a base Plate editor (non-React version).
 *
 * This function creates a fully configured Plate editor for
 * non-React environments or server-side contexts. It applies the specified
 * plugins and configuration to create a functional editor.
 *
 * Examples:
 *
 * ```ts
 * const editor = createEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   initialValue: [{ type: 'paragraph', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom configuration
 * const editor = createEditor({
 *   plugins: [ParagraphPlugin, ElementIdPlugin],
 *   maxLength: 1000,
 *   autoSelect: 'end',
 * });
 *
 * // Server-side editor with feature-owned HTML conversion
 * const editor = createEditor({
 *   plugins: [ParagraphPlugin, HtmlPlugin],
 *   initialValue: ({ editor }) => {
 *     const result = editor.api.html.parse('<p>HTML content</p>');
 *
 *     if (!result.ok) throw new Error(result.diagnostics[0].message);
 *
 *     return result.document;
 *   },
 * });
 *
 * // Name the schema only when persisted or collaborative state needs lineage.
 * const persistedEditor = createEditor({
 *   schema: { id: 'acme-document', version: 1 },
 * });
 * ```
 *
 * @see {@link createEditor} for a React-specific version of editor creation.
 * @see {@link useCreateEditor} for a memoized React version.
 */
export function createEditor<
  V extends Value = Value,
  const TPlugins extends readonly RuntimePluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: CreateEditorOptions<V, TPlugins, TSchema> & { plugins: TPlugins }
): Editor<
  V,
  RuntimePluginsFromTuple<TPlugins>,
  PlatePluginsFromTuple<TPlugins>,
  TSchema
>;
export function createEditor<
  V extends Value = Value,
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options?: CreateEditorOptions<V, readonly [], TSchema>
): Editor<V, readonly [], readonly [], TSchema>;
export function createEditor(
  options: CreateEditorOptionsForValue<
    Value,
    readonly RuntimePluginReference[]
  > = {}
): unknown {
  return buildEditor(options);
}
