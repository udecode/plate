import {
  createEditor,
  defineExtension,
  defineEditorSchema,
  type Editor,
  type EditorDocumentValue,
  type EditorExtensionReference,
  type PersistedDocumentInput,
  type SnapshotInput,
  type EditorTransactionSpecBuilder,
  type Selection,
  type Value,
} from '@platejs/plite';
import {
  failInvariant,
  type AnyEditor,
  getCompiledEditorSchemaFromApi,
  initializeEditorExtensions,
  MAIN_ROOT_KEY,
  mapSemanticUpdateMethodArguments,
  repairEditorValue,
  setEditorMaxLength,
  setEditorReadOnly,
  setEditorSnapshotInputTransform,
  setEditorStateViewTransform,
  setEditorTransactionViewTransform,
} from '@platejs/plite/internal';

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
  withEditorApplicationSchemaCandidate,
  withCompiledPlateModelCandidate,
  withCompiledPlatePluginCandidate,
} from '../../internal/plugin/compilePlateModel';
import {
  mapDocumentSelection,
  prepareDocument,
} from '../../internal/plugin/pipePrepareDocument';
import { createPlateChangeHandlersExtension } from '../../internal/plugin/plateChangeHandlers';
import { clearPlateRuntimeCandidate } from '../../internal/plugin/plateRuntime';
import { clearPluginStores } from '../../internal/plugin/pluginStore';
import {
  collectPlatePluginSourceCandidates,
  createPlateModelPublication,
  createPlateRuntimeExtensions,
  getPlateRuntimeExtensionBindings,
  resolvePlateRuntimeExtension,
  resolvePlugins,
  restorePlateRuntimeExtensionBindings,
  snapshotPlatePluginSources,
} from '../../internal/plugin/resolvePlugins';
import type { NoInfer } from '../../internal/types';
import {
  getPluginSchemaFamily,
  isNominalPluginDescriptor,
  isNominalPluginReference,
} from '../../internal/utils/mergePlugins';
import type {
  AnyBasePlugin,
  BasePluginPortal,
  BasePluginDefinitionInput,
  DynamicBasePluginPortal,
} from '../plugin/BasePlugin';
import { createPluginPortal } from '../plugin/createPluginContext.internal';
import { defineBasePlugin } from '../plugin/defineBasePlugin';
import type {
  AnyBasePluginDefinition,
  NodeComponents,
  PluginReference,
} from '../plugin/PluginDefinition';
import type { InternalPluginDefinitionOf } from '../plugin/pluginDefinitionLookup.internal';
import {
  type CorePluginDefinition,
  type CorePlugins,
  getCorePlugins,
} from '../plugins/getCorePlugins';
import type {
  InferPlugins,
  InferRuntimePlugins,
  BaseEditor,
  BasePluginInput,
  InternalBaseEditorMutationProvider,
  InternalBaseEditorWithInstalledPlugins,
  MergeInstalledPluginDefinitions,
} from './BaseEditor';
import { type DocumentMigrations, migrateDocument } from './documentMigrations';
import {
  type EditorApplicationSchema,
  type EditorSchemaIdentity,
  getEditorSchemaIdentity,
} from './editorApplicationSchema';

type ProjectInjectedEditor<TEditor, TProjection> = Omit<
  TEditor,
  keyof TProjection
> &
  TProjection;

type PluginLookupInput = AnyBasePlugin | PluginReference | string;
type PluginContextLookupInput = PluginLookupInput;

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
  editor: BaseEditor,
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

const lowerPlateNodeType = (editor: BaseEditor, type: unknown): unknown => {
  if (Array.isArray(type)) {
    return type.map((item) => lowerPlateNodeType(editor, item));
  }
  if (!hasPlateSchemaDescriptorShape(type)) return type;

  return (
    resolvePlateSchemaDescriptor(editor, type, true).binding.elementType ??
    failInvariant('Expected value to be defined')
  );
};

const lowerPlateNodeOptions = (
  editor: BaseEditor,
  options: unknown
): unknown => {
  if (typeof options !== 'object' || options === null) return options;

  const record = options as Record<string, unknown>;
  let changed = false;
  const next = { ...record };

  if ('type' in record) {
    next.type = lowerPlateNodeType(editor, record.type);
    changed = next.type !== record.type;
  }
  for (const key of ['someOptions', 'split'] as const) {
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
  editor: BaseEditor,
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
  duplicate: 1,
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
  lift: 0,
  reset: 1,
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

const normalizeBaseInitialValue = <V extends Value>(
  editor: BaseEditor,
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

  const document = editor.read.schema.fitDocument(currentValue);

  return {
    document,
    schema: editor.read.schema.identity(),
  };
};

const resolveBaseInitialValue = <V extends Value>(
  editor: BaseEditor,
  {
    autoSelect,
    implicitDocumentIsCurrent,
    initialValue,
    selection,
  }: {
    autoSelect?: boolean | 'end' | 'start';
    implicitDocumentIsCurrent: boolean;
    initialValue?:
      | ((context: { editor: BaseEditor }) => EditorValueInput<V>)
      | EditorValueInput<V>;
    selection?: Selection;
  }
) => {
  const nextValue = normalizeBaseInitialValue<V>(
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

const normalizeBaseEditor = (editor: BaseEditor) => {
  const wasNormalizing = editor.runtime.isNormalizing;

  editor.runtime.isNormalizing = true;
  try {
    repairEditorValue(editor);
  } finally {
    editor.runtime.isNormalizing = wasNormalizing;
  }
};

const createPlateSchemaExtensions = (
  editor: BaseEditor,
  identityOptions: EditorSchemaIdentity | undefined,
  model: ReturnType<typeof compilePlateModel>,
  pluginList: readonly AnyBasePlugin[],
  applicationSchema?: ReturnType<typeof compileEditorApplicationSchema>,
  applicationName?: string
) => {
  const definition = {
    groups: model.contribution.groups ?? {},
    root:
      applicationSchema?.root ??
      createPlateBlockContent({
        default: { type: 'paragraph' },
        min: 1,
      }),
  };
  const identity = identityOptions
    ? defineEditorSchema(`schema:${identityOptions.id}`, {
        ...definition,
        id: identityOptions.id,
        version: identityOptions.version,
      })
    : defineEditorSchema('schema:derived', definition);
  const { codecExtension, runtime } = withCompiledPlateModelCandidate(
    editor,
    model,
    () => {
      const innerRuntime = createPlateRuntimeExtensions(
        editor,
        pluginList,
        model,
        (type) => lowerPlateNodeType(editor, type)
      );

      return {
        codecExtension: compilePlateCodecs(editor, model, pluginList),
        runtime: innerRuntime,
      };
    }
  );
  const applicationSchemaExtension = applicationSchema
    ? defineExtension(`schema:application:${applicationName ?? 'editor'}`, {
        schema: applicationSchema.contribution,
      })
    : undefined;
  let publication: ReturnType<typeof createPlateModelPublication> | undefined;

  const modelExtension = defineExtension('plate:model', {
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
    identity,
    ...runtime.extensions,
    ...(applicationSchemaExtension ? [applicationSchemaExtension] : []),
    modelExtension,
    ...(codecExtension ? [codecExtension] : []),
  ]);
};

const createPlateConfiguration = (
  editor: BaseEditor,
  identity: EditorSchemaIdentity | undefined,
  pluginList: readonly AnyBasePlugin[],
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
    const modelExtensions = createPlateSchemaExtensions(
      editor,
      identity,
      model,
      pluginList,
      applicationSchema,
      schema?.id
    );
    return Object.freeze({
      extensions: Object.freeze([
        ...modelExtensions,
        createPlateChangeHandlersExtension(editor),
      ]),
      model,
    });
  });

const installPlateModelAccessors = (editor: BaseEditor) => {
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

const plateExtensionPortals = new WeakMap<
  object,
  Readonly<{
    original: BaseEditor['extension'];
    portal: BaseEditor['extension'];
  }>
>();

const installPlateExtensionPortal = (editor: BaseEditor) => {
  const installed = plateExtensionPortals.get(editor);

  if (installed?.portal === editor.extension) return () => {};

  const original = editor.extension;
  const portal = ((reference: EditorExtensionReference) =>
    Reflect.apply(original, editor, [
      resolvePlateRuntimeExtension(editor, reference),
    ])) as BaseEditor['extension'];

  editor.extension = portal;
  plateExtensionPortals.set(editor, Object.freeze({ original, portal }));

  return () => {
    if (editor.extension === portal) editor.extension = original;
    plateExtensionPortals.delete(editor);
  };
};

const installPlateEditorExtensions = (
  editor: BaseEditor,
  identity: EditorSchemaIdentity | undefined,
  initialization?: Readonly<{
    initialize?: (tx: EditorTransactionSpecBuilder<Value, any>) => void;
    initialValue?: () => SnapshotInput;
  }>,
  schema?: EditorApplicationSchema
) => {
  const previousBindings = getPlateRuntimeExtensionBindings(editor);
  const restoreExtensionPortal = installPlateExtensionPortal(editor);
  let restoreModelAccessors: (() => void) | undefined;

  try {
    const configuration = createPlateConfiguration(
      editor,
      identity,
      getPlateRuntime(editor).pluginList,
      schema
    );

    withCompiledPlateModelCandidate(editor, configuration.model, () => {
      initializeEditorExtensions<AnyEditor>(editor, configuration.extensions, {
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
      });
    });
  } catch (error) {
    restoreModelAccessors?.();
    restorePlateRuntimeExtensionBindings(editor, previousBindings);
    restoreExtensionPortal();
    throw error;
  }

  if (!restoreModelAccessors) installPlateModelAccessors(editor);
};

export type BaseEditorOptions<
  P extends BasePluginInput = CorePluginDefinition,
> = {
  /**
   * Unique identifier for the editor instance.
   *
   * @default nanoid()
   */
  id?: string;
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
  /** Specifies the component for each plugin name. */
  components?: NodeComponents;
  /**
   * Specifies the maximum number of characters allowed in the editor. When the
   * limit is reached, further input will be prevented.
   */
  maxLength?: number;
  /** Versioned complete-document migrations bound to the named schema. */
  migrations?: DocumentMigrations;
  /**
   * Array of plugins to be loaded into the editor. Plugins extend the editor's
   * functionality and define custom behavior.
   */
  plugins?: readonly P[];
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
   * process. A later complete `editor.update.value.replace(...)` still runs
   * every plugin `prepareDocument` before schema fitting.
   *
   * @default false
   */
  skipInitialization?: boolean;
};

type ApplyBaseEditorOptions<
  V extends Value = Value,
  P extends BasePluginInput = CorePluginDefinition,
> = Omit<BaseEditorOptions<P>, 'id'> &
  Partial<
    Pick<AnyBasePlugin, 'decorate' | 'initialState' | 'inject' | 'override'>
  > & {
    /** Root editor API declarations for the synthetic root plugin. */
    api?: BasePluginDefinitionInput['api'];
    /**
     * Complete editor document, persisted document envelope, or primary-root
     * array shorthand. Versioned migrations and installed plugin preparation
     * run after the plugin model and schema are compiled.
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

/**
 * Applies the Base plugin model to the supplied Plite editor during
 * construction.
 */
const applyBaseEditor = <
  V extends Value = Value,
  P extends BasePluginInput = CorePluginDefinition,
>(
  e: AnyEditor,
  options: ApplyBaseEditorOptions<V, P>,
  implicitDocumentIsCurrent: boolean
): InternalBaseEditorWithInstalledPlugins<
  V,
  InferBaseEditorPlugins<P[]>,
  InferBaseEditorSchemaPlugins<P[]>
> => {
  const {
    affinity,
    autoSelect,
    initialValue,
    maxLength,
    migrations,
    plugins = [],
    readOnly,
    schema,
    selection,
    shouldNormalizeEditor,
    skipInitialization,
    userId,
    ...pluginConfig
  } = options;
  const identity = getEditorSchemaIdentity(schema);
  const editor = e as unknown as BaseEditor;

  editor.runtime ??= {} as BaseEditor['runtime'];
  editor.runtime.userId = userId;
  if (readOnly !== undefined) {
    setEditorReadOnly(editor, readOnly);
  }
  if (maxLength !== undefined) {
    setEditorMaxLength(editor, maxLength);
  }

  function getInstalledPluginPortal<P extends AnyBasePlugin & PluginReference>(
    plugin: P
  ): BasePluginPortal<InternalPluginDefinitionOf<P>>;
  function getInstalledPluginPortal(
    plugin: AnyBasePlugin | PluginReference | string
  ): DynamicBasePluginPortal;
  function getInstalledPluginPortal(plugin: PluginContextLookupInput): unknown {
    return createPluginPortal(editor, plugin);
  }
  editor.plugin = getInstalledPluginPortal;
  const baseCorePlugins = getCorePlugins({ affinity });

  const internalRootCandidate = Reflect.apply(defineBasePlugin, undefined, [
    'root',
    {
      ...pluginConfig,
      override: {
        ...pluginConfig.override,
        components: {
          ...pluginConfig.components,
          ...pluginConfig.override?.components,
        },
      },
    },
  ]);

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
  const publicationBeforeExtension = getPlateModelPublication(editor);
  const applicationPolicy = schema;
  let restoreSnapshotInputTransform: (() => void) | undefined;
  let restoreStateViewTransform: (() => void) | undefined;
  let restoreTransactionViewTransform: (() => void) | undefined;

  try {
    withEditorApplicationSchemaCandidate(
      editor,
      applicationPolicy,
      collectPlatePluginSourceCandidates(sourcePlugins),
      () => resolvePlugins(editor, sourcePlugins)
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
        const bindings = getPlateRuntimeExtensionBindings(editor);
        const groups = new Map<string, unknown>();

        bindings?.plugins.forEach((binding, name) => {
          const group = Reflect.get(transaction, binding.extension.name);

          if (group !== undefined) groups.set(name, group);
        });

        const portal = (plugin: PluginLookupInput) => {
          if (
            typeof plugin !== 'string' &&
            !isNominalPluginDescriptor(plugin)
          ) {
            throw new TypeError(
              'Plate transaction plugin lookup requires a plugin descriptor or plugin name string.'
            );
          }

          const name = typeof plugin === 'string' ? plugin : plugin.name;
          const binding = bindings?.plugins.get(name);

          if (!binding) {
            throw new Error(`Plate plugin "${name}" is not installed.`);
          }
          if (
            typeof plugin !== 'string' &&
            getPluginSchemaFamily(plugin) !== binding.family
          ) {
            throw new Error(
              `Plate plugin "${name}" resolves to a different descriptor family.`
            );
          }

          const group = groups.get(name);

          if (group === undefined) {
            throw new Error(
              `Plate plugin "${name}" does not expose transaction methods.`
            );
          }

          return group;
        };
        const directPluginGroup = groups.get('plugin');

        transaction.plugin =
          (typeof directPluginGroup === 'object' &&
            directPluginGroup !== null) ||
          typeof directPluginGroup === 'function'
            ? new Proxy(portal, {
                get(target, property, receiver) {
                  if (Reflect.has(directPluginGroup, property)) {
                    return Reflect.get(
                      directPluginGroup,
                      property,
                      directPluginGroup
                    );
                  }

                  return Reflect.get(target, property, receiver);
                },
              })
            : portal;
      }
    );
    restoreSnapshotInputTransform = setEditorSnapshotInputTransform(
      editor,
      (input: SnapshotInput) => {
        const inputSelection = input.selection;
        const innerSelection =
          inputSelection &&
          inputSelection !== 'start' &&
          inputSelection !== 'end'
            ? inputSelection
            : null;
        const inputDocument =
          'document' in input
            ? input.document
            : {
                children: input.children,
                ...(input.meta === undefined ? {} : { meta: input.meta }),
                ...(input.roots === undefined ? {} : { roots: input.roots }),
              };
        if ('document' in input && !migrations) {
          const current = editor.read.schema.identity();
          const source = input.schema;
          const matches =
            source.kind === current.kind &&
            source.fingerprint === current.fingerprint &&
            (source.kind === 'derived' ||
              (current.kind === 'named' &&
                source.id === current.id &&
                source.version === current.version));

          if (!matches) {
            throw new Error(
              `Persisted document schema ${JSON.stringify(source)} does not match current schema ${JSON.stringify(current)}.`
            );
          }
        }
        const migration = migrations
          ? migrateDocument(
              'document' in input
                ? input
                : (inputDocument as EditorDocumentValue),
              { editor, migrations }
            )
          : undefined;
        const migrated =
          migration?.document ?? (inputDocument as EditorDocumentValue);
        const selectionRoot =
          innerSelection?.anchor.root ??
          innerSelection?.focus.root ??
          MAIN_ROOT_KEY;
        const runnerSelection =
          migration?.selection === 'start' || migration?.selection === 'end'
            ? undefined
            : migration?.selection;
        const migratedSelection =
          runnerSelection !== undefined
            ? runnerSelection
            : mapDocumentSelection(
                editor,
                innerSelection,
                inputDocument as EditorDocumentValue,
                migrated,
                selectionRoot
              );
        const prepared = prepareDocument(
          editor,
          migrated,
          migratedSelection,
          selectionRoot
        );

        return {
          ...prepared.document,
          selection:
            inputSelection === 'start' || inputSelection === 'end'
              ? inputSelection
              : prepared.selection,
        };
      }
    );
    withEditorApplicationSchemaCandidate(
      editor,
      applicationPolicy,
      collectPlatePluginSourceCandidates(sourcePlugins),
      () => {
        installPlateEditorExtensions(
          editor,
          identity
            ? Object.freeze({
                id: identity.id,
                version: identity.version,
              })
            : undefined,
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
                    selection,
                  }),
              },
          schema
        );
      }
    );

    return editor as unknown as InternalBaseEditorWithInstalledPlugins<
      V,
      InferBaseEditorPlugins<P[]>,
      InferBaseEditorSchemaPlugins<P[]>
    >;
  } catch (error) {
    restoreSnapshotInputTransform?.();
    restoreStateViewTransform?.();
    restoreTransactionViewTransform?.();
    if (!publicationBeforeExtension) clearPlateModelPublication(editor);
    clearPluginStores(editor);
    throw error;
  } finally {
    clearPlateRuntimeCandidate(editor);
  }
};

type CreateBaseEditorOptionsForValue<
  V extends Value,
  P extends readonly unknown[] = readonly CreateBaseEditorPluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = Partial<
  Omit<ApplyBaseEditorOptions<V, BasePluginInput>, 'plugins' | 'schema'>
> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /**
   * Existing Plite editor to configure as a Base editor.
   *
   * @default createEditor()
   */
  editor?: Editor;
  /**
   * Array of plugins to be loaded into the editor. Plugins extend the editor's
   * functionality and define custom behavior.
   */
  plugins?: P;
  schema?: TSchema;
};

export type CreateBaseEditorOptions<
  P extends readonly unknown[] = readonly CreateBaseEditorPluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = CreateBaseEditorOptionsForValue<Value, P, TSchema>;

type CreateBaseEditorPluginInput<
  _C extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = BasePluginInput;

type InferCreateBaseEditorPlugins<P extends readonly unknown[]> =
  InferBaseEditorPlugins<P>;

/**
 * Creates a base Plate editor (non-React version).
 *
 * This function creates a fully configured base editor on top of Plite for
 * non-React environments or server-side contexts. It applies the specified
 * plugins and configuration to create a functional editor.
 *
 * Examples:
 *
 * ```ts
 * const editor = createBaseEditor({
 *   plugins: [ParagraphPlugin, HeadingPlugin],
 *   initialValue: [{ type: 'paragraph', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom configuration
 * const editor = createBaseEditor({
 *   plugins: [ParagraphPlugin, ElementIdPlugin],
 *   maxLength: 1000,
 *   autoSelect: 'end',
 * });
 *
 * // Server-side editor with feature-owned HTML conversion
 * const editor = createBaseEditor({
 *   plugins: [ParagraphPlugin, HtmlPlugin],
 *   initialValue: ({ editor }) =>
 *     editor.api.html.deserialize({
 *       element: '<p>HTML content</p>',
 *     }),
 * });
 *
 * // Name the schema only when persisted or collaborative state needs lineage.
 * const persistedEditor = createBaseEditor({
 *   schema: { id: 'acme-document', version: 1 },
 * });
 * ```
 *
 * @see {@link createPlateEditor} for a React-specific version of editor creation.
 * @see {@link usePlateEditor} for a memoized React version.
 */
export function createBaseEditor<
  const P extends readonly unknown[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: CreateBaseEditorOptions<P, TSchema> & { plugins: P }
): BaseEditor<P, TSchema>;
export function createBaseEditor<
  const TEditor,
  const P extends readonly unknown[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: Omit<
    CreateBaseEditorOptions<P, TSchema>,
    'editor' | 'initialValue'
  > & {
    editor: TEditor extends Editor<infer _V, infer _TExtensions>
      ? TEditor
      : never;
    initialValue?: CreateBaseEditorOptionsForValue<
      TEditor extends Editor<infer V, infer _TExtensions> ? V : never,
      P
    >['initialValue'];
  }
): ProjectInjectedEditor<
  TEditor,
  InternalBaseEditorWithInstalledPlugins<
    TEditor extends Editor<infer V, infer _TExtensions> ? V : never,
    InferCreateBaseEditorPlugins<P>,
    InternalBaseEditorMutationProvider<
      P,
      InferCreateBaseEditorPlugins<P>,
      TSchema
    >
  >
>;
export function createBaseEditor<
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options?: CreateBaseEditorOptions<readonly [], TSchema>
): BaseEditor<readonly [], TSchema>;
export function createBaseEditor({
  editor,
  id,
  ...options
}: CreateBaseEditorOptionsForValue<Value> = {}): unknown {
  const baseEditor =
    editor ??
    createEditor({
      id,
      maxLength: options.maxLength,
      readOnly: options.readOnly,
    });

  return applyBaseEditor<Value, BasePluginInput>(
    baseEditor,
    options,
    editor === undefined
  );
}
