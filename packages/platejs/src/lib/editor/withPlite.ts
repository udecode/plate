import type { EditorStateField } from 'plitejs';
import {
  compileEditorSchemaCapabilityEntries,
  type CompiledEditorSchema,
  initializePluginEntries,
  type InternalPluginPublicationEntry,
  type NativeAuthoredDocumentCapability,
  withPluginPortalCandidates,
} from 'plitejs/internal';

import {
  containsCompleteEditorSchema,
  createEditor as createPliteEditor,
  defineRuntimePlugin,
  defineEditorSchema,
  type Editor as RuntimeEditor,
  type EditorDocumentValue,
  type EditorSchemaContract,
  type RuntimePluginReference,
  type EditorLifecycleErrorSink,
  type PersistedDocumentInput,
  setEditorReadOnly,
  type SnapshotInput,
  type EditorTransactionSpecBuilder,
  type Selection,
  type Value,
  getCompiledEditorSchemaFromApi,
  mapSemanticUpdateMethodArguments,
  repairEditorValue,
  setEditorMaxLength,
  setEditorStateViewTransform,
  setEditorTransactionViewTransform,
} from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import { compilePlateCodecs } from '../../internal/plugin/compilePlateCodecs';
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

const normalizeBaseInitialValue = <
  V extends Value,
  TPlugins extends readonly unknown[],
>(
  editor: Editor<V, TPlugins>,
  value: unknown,
  implicitDocumentIsCurrent: boolean
): EditorDocumentValue<V> | PersistedDocumentInput<V> => {
  if (value !== undefined) {
    const children = Array.isArray(value)
      ? value
      : value &&
          typeof value === 'object' &&
          'document' in value &&
          value.document &&
          typeof value.document === 'object' &&
          Array.isArray((value.document as EditorDocumentValue).children)
        ? (value.document as EditorDocumentValue).children
        : value &&
            typeof value === 'object' &&
            Array.isArray((value as EditorDocumentValue).children)
          ? (value as EditorDocumentValue).children
          : null;

    if (!children || children.length === 0) {
      throw new Error(
        'Plate initialValue must contain at least one primary-root element.'
      );
    }

    return (
      Array.isArray(value) ? { children: value as unknown as V } : value
    ) as EditorDocumentValue<V> | PersistedDocumentInput<V>;
  }

  const currentValue = editor.read.value() as EditorDocumentValue<V>;

  if (currentValue.children.length > 0) {
    return implicitDocumentIsCurrent
      ? {
          document: currentValue,
          schema: editor.read.schema.identity(),
        }
      : currentValue;
  }

  const document = editor.read.schema.fitDocument(
    currentValue
  ) as EditorDocumentValue<V>;

  return {
    document,
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
    implicitDocumentIsCurrent,
    initialValue,
    selection,
  }: {
    autoSelect?: boolean | 'end' | 'start';
    implicitDocumentIsCurrent: boolean;
    initialValue?:
      | ((context: { editor: Editor<V, TPlugins> }) => EditorValueInput<V>)
      | EditorValueInput<V>;
    selection?: Selection;
  }
) => {
  const nextValue = normalizeBaseInitialValue<V, TPlugins>(
    editor,
    typeof initialValue === 'function'
      ? initialValue({ editor })
      : initialValue,
    implicitDocumentIsCurrent
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

const normalizeBaseEditor = (editor: Editor) => {
  const wasNormalizing = editor.runtime.isNormalizing;

  editor.runtime.isNormalizing = true;
  try {
    repairEditorValue(editor);
  } finally {
    editor.runtime.isNormalizing = wasNormalizing;
  }
};

const createPlateSchemaPlugins = (
  editor: Editor,
  identityOptions: EditorSchemaIdentity | undefined,
  model: ReturnType<typeof compilePlateModel>,
  pluginList: readonly AnyBasePlugin[],
  runtimePlugins: readonly RuntimePluginReference[],
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
  const { codecPlugin, runtime } = withCompiledPlateModelCandidate(
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
        codecPlugin: compilePlateCodecs(editor, model, pluginList),
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
    ...(codecPlugin ? [{ plugin: codecPlugin }] : []),
  ]);
};

const createPlateConfiguration = (
  editor: Editor,
  identity: EditorSchemaIdentity | undefined,
  pluginList: readonly AnyBasePlugin[],
  plugins: readonly RuntimePluginReference[],
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
   * Unique identifier for the editor instance.
   *
   * @default nanoid()
   */
  id?: string;
  /** Receives failures from plugin lifecycle observers. */
  lifecycleErrorSink?: EditorLifecycleErrorSink<RuntimeEditor<any, any>>;
  /**
   * Current user ID for collaborative features (e.g., Yjs). Used to identify
   * the creator of elements like combobox inputs.
   */
  userId?: string | null;
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

type ApplyEditorOptions<
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
     * Omit this option to preserve an existing editor document or construct the
     * schema's default primary-root child for a new editor.
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
    maxLength,
    plugins = [],
    readOnly,
    schema,
    userId,
  }: Omit<
    Pick<
      EditorOptions<readonly BasePluginInput[]>,
      'affinity' | 'maxLength' | 'plugins' | 'readOnly' | 'schema' | 'userId'
    >,
    'plugins'
  > & {
    plugins?: readonly BasePluginInput[];
  },
  pluginConfig: Pick<
    ApplyEditorOptions,
    'api' | 'decorate' | 'initialState' | 'inject' | 'override'
  > = {}
) => {
  const identity = getEditorSchemaIdentity(schema);

  editor.runtime ??= {} as Editor['runtime'];
  editor.runtime.userId = userId;
  if (readOnly !== undefined) {
    setEditorReadOnly(editor, readOnly);
  }
  if (maxLength !== undefined) {
    setEditorMaxLength(editor, maxLength);
  }

  const baseCorePlugins = getCorePlugins({ affinity });

  const internalRootCandidate = createBasePlugin('root', pluginConfig);

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
  const publicationBeforePlugin = getPlateModelPublication(editor);
  const applicationPolicy = schema;
  let restoreStateViewTransform: (() => void) | undefined;
  let restoreTransactionViewTransform: (() => void) | undefined;

  const restore = () => {
    restoreStateViewTransform?.();
    restoreTransactionViewTransform?.();
    if (!publicationBeforePlugin) clearPlateModelPublication(editor);
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
    clearPlateRuntimeCandidate(editor);
    throw error;
  }
};

/** Applies the Base plugin model to an editor during construction. */
export const applyEditor = <
  V extends Value = Value,
  P extends BasePluginInput = CorePlugins[number],
  const TPlugins extends readonly RuntimePluginReference[] = readonly [],
>(
  e: RuntimeEditor<any, any>,
  options: ApplyEditorOptions<V, P, TPlugins>,
  implicitDocumentIsCurrent: boolean
): InternalBaseEditorWithInstalledPlugins<
  V,
  InferBaseEditorPlugins<P[]>,
  InferBaseEditorSchemaPlugins<P[]>,
  RuntimePluginsFromTuple<TPlugins>
> => {
  if (Object.hasOwn(options, 'migrations')) {
    throw new Error(
      'Plate editor `migrations` is unsupported. Convert persisted documents with migrateDocument before creating or replacing an editor value.'
    );
  }
  const {
    affinity,
    autoSelect,
    initialValue,
    initialSelection,
    lifecycleErrorSink: _lifecycleErrorSink,
    maxLength,
    plugins = [],
    readOnly,
    schema,
    selection,
    shouldNormalizeEditor,
    skipInitialization,
    userId,
    ...pluginConfig
  } = options;
  const editor = e as unknown as Editor;
  const pluginInputs = partitionPluginInputs(plugins);
  let prepared: ReturnType<typeof prepareInitialPlatePlugins> | undefined;

  try {
    prepared = prepareInitialPlatePlugins(
      editor,
      {
        affinity,
        maxLength,
        plugins: pluginInputs.plate,
        readOnly,
        schema,
        userId,
      },
      pluginConfig
    );
    const { identity } = prepared;

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
        skipInitialization
          ? undefined
          : {
              initialize: shouldNormalizeEditor
                ? () => normalizeBaseEditor(editor)
                : undefined,
              initialValue: () =>
                resolveBaseInitialValue(editor, {
                  autoSelect,
                  implicitDocumentIsCurrent,
                  initialValue:
                    typeof initialValue === 'function'
                      ? () =>
                          initialValue({
                            editor:
                              editor as unknown as InternalBaseEditorWithInstalledPlugins<
                                V,
                                InferBaseEditorPlugins<P[]>,
                                InferBaseEditorSchemaPlugins<P[]>
                              >,
                          })
                      : initialValue,
                  selection: selection ?? initialSelection,
                }),
            },
        schema
      );
    });

    return editor as unknown as InternalBaseEditorWithInstalledPlugins<
      V,
      InferBaseEditorPlugins<P[]>,
      InferBaseEditorSchemaPlugins<P[]>,
      RuntimePluginsFromTuple<TPlugins>
    >;
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

/** @internal */
export const compilePlateEditorTarget = (
  options: Pick<
    EditorOptions<readonly RuntimePluginReference[]>,
    'plugins' | 'schema'
  >
): PlateEditorTargetCompilation => {
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
        options.schema
      );
      const capability = withCompiledPlateModelCandidate(
        editor,
        configuration.model,
        () =>
          compileEditorSchemaCapabilityEntries(editor, configuration.entries)
      );
      const schema = capability.contract;
      const publication = getPlateModelPublication(editor);

      if (!publication) {
        throw new Error('Editor compilation requires a validated Plate model.');
      }
      const artifact: EditorCompilation = Object.freeze({
        bindings: Object.freeze(
          publication.model.bindings.map((binding) =>
            Object.freeze({
              ...(publication.updateMethods[binding.name]?.includes('toggle')
                ? { authoredToggle: true as const }
                : {}),
              ...(binding.propertyKey ? { key: binding.propertyKey } : {}),
              name: binding.name,
              ...(binding.elementType ? { type: binding.elementType } : {}),
            })
          )
        ),
        schema,
      });

      return Object.freeze({
        artifact,
        ...(capability.authored ? { authored: capability.authored } : {}),
        fields: capability.fields,
        schema: capability.schema,
      });
    });
  } finally {
    prepared?.restore();
    clearPlateRuntimeCandidate(editor);
  }
};

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
  Omit<ApplyEditorOptions<V, BasePluginInput, TPlugins>, 'plugins' | 'schema'>
> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /** Existing editor to enhance instead of allocating a new editor. */
  editor?: RuntimeEditor<any, any>;
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

export function createEditorWithEditor<
  V extends Value = Value,
  const TPlugins extends readonly RuntimePluginReference[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  editor: RuntimeEditor<any, any>,
  options: CreateEditorOptions<V, TPlugins, TSchema> = {}
): Editor<
  V,
  RuntimePluginsFromTuple<TPlugins>,
  PlatePluginsFromTuple<TPlugins>,
  TSchema
> {
  return applyEditor(
    editor,
    options as unknown as Parameters<typeof applyEditor>[1],
    false
  ) as unknown as Editor<
    V,
    RuntimePluginsFromTuple<TPlugins>,
    PlatePluginsFromTuple<TPlugins>,
    TSchema
  >;
}

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
 *   initialValue: ({ editor }) =>
 *     editor.api.html.deserialize({
 *       element: '<p>HTML content</p>',
 *     }),
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
export function createEditor({
  editor: inputEditor,
  id,
  ...options
}: CreateEditorOptionsForValue<
  Value,
  readonly RuntimePluginReference[]
> = {}): unknown {
  const editor =
    inputEditor ??
    createPliteEditor({
      id,
      lifecycleErrorSink: options.lifecycleErrorSink,
      maxLength: options.maxLength,
      readOnly: options.readOnly,
    });

  return applyEditor<Value, BasePluginInput, readonly RuntimePluginReference[]>(
    editor,
    options,
    inputEditor === undefined
  );
}
