import {
  containsCompleteEditorSchema,
  createEditor as createPliteEditor,
  defineExtension,
  defineEditorSchema,
  type Editor as PliteEditor,
  type EditorDocumentValue,
  type EditorExtensionReference,
  type EditorExtensionsFromOptions,
  type EditorLifecycleErrorSink,
  type EditorValueFromOptions,
  type PersistedDocumentInput,
  setEditorReadOnly,
  type SnapshotInput,
  type EditorTransactionSpecBuilder,
  SelectionApi,
  type Selection,
  type Value,
  getCompiledEditorSchemaFromApi,
  initializeEditorExtensions,
  MAIN_ROOT_KEY,
  mapSemanticUpdateMethodArguments,
  repairEditorValue,
  setEditorMaxLength,
  setEditorSnapshotInputTransform,
  setEditorStateViewTransform,
  setEditorTransactionViewTransform,
} from 'plitejs';

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
import { type DocumentMigrations, migrateDocument } from './documentMigrations';
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
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
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
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  {
    autoSelect,
    implicitDocumentIsCurrent,
    initialValue,
    selection,
  }: {
    autoSelect?: boolean | 'end' | 'start';
    implicitDocumentIsCurrent: boolean;
    initialValue?:
      | ((context: { editor: Editor<V, TExtensions> }) => EditorValueInput<V>)
      | EditorValueInput<V>;
    selection?: Selection;
  }
) => {
  const nextValue = normalizeBaseInitialValue<V, TExtensions>(
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

const createPlateSchemaExtensions = (
  editor: Editor,
  identityOptions: EditorSchemaIdentity | undefined,
  model: ReturnType<typeof compilePlateModel>,
  pluginList: readonly AnyBasePlugin[],
  extensions: readonly EditorExtensionReference[],
  applicationSchema?: ReturnType<typeof compileEditorApplicationSchema>,
  applicationName?: string
) => {
  const hasCompleteExtensionSchema = containsCompleteEditorSchema(extensions);
  const definition = {
    groups: model.contribution.groups ?? {},
    root:
      applicationSchema?.root ??
      createPlateBlockContent({
        default: { type: 'paragraph' },
        min: 1,
      }),
  };
  const schemaFoundation = hasCompleteExtensionSchema
    ? undefined
    : identityOptions
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
        (type) => lowerPlateNodeType(editor, type),
        { includeSchemaContributions: !hasCompleteExtensionSchema }
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
    ...(schemaFoundation ? [schemaFoundation] : []),
    ...runtime.extensions,
    ...extensions,
    ...(applicationSchemaExtension ? [applicationSchemaExtension] : []),
    modelExtension,
    ...(codecExtension ? [codecExtension] : []),
  ]);
};

const createPlateConfiguration = (
  editor: Editor,
  identity: EditorSchemaIdentity | undefined,
  pluginList: readonly AnyBasePlugin[],
  extensions: readonly EditorExtensionReference[],
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
      extensions,
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

const plateExtensionPortals = new WeakMap<
  object,
  Readonly<{
    original: Editor['extension'];
    portal: Editor['extension'];
  }>
>();

const installPlateExtensionPortal = (editor: Editor) => {
  const installed = plateExtensionPortals.get(editor);

  if (installed?.portal === editor.extension) return () => {};

  const original = editor.extension;
  const portal = ((reference: EditorExtensionReference) =>
    Reflect.apply(original, editor, [
      resolvePlateRuntimeExtension(editor, reference),
    ])) as Editor['extension'];

  editor.extension = portal;
  plateExtensionPortals.set(editor, Object.freeze({ original, portal }));

  return () => {
    if (editor.extension === portal) editor.extension = original;
    plateExtensionPortals.delete(editor);
  };
};

const installPlateEditorExtensions = (
  editor: Editor,
  identity: EditorSchemaIdentity | undefined,
  extensions: readonly EditorExtensionReference[],
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
      extensions,
      schema
    );

    withCompiledPlateModelCandidate(editor, configuration.model, () => {
      initializeEditorExtensions<PliteEditor<any, any>>(
        editor,
        configuration.extensions,
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
    restorePlateRuntimeExtensionBindings(editor, previousBindings);
    restoreExtensionPortal();
    throw error;
  }

  if (!restoreModelAccessors) installPlateModelAccessors(editor);
};

export type EditorOptions<
  TExtensions extends readonly EditorExtensionReference[] = readonly [],
  P extends BasePluginInput = CorePluginDefinition,
> = {
  /**
   * Unique identifier for the editor instance.
   *
   * @default nanoid()
   */
  id?: string;
  /** Low-level Plite extensions installed after Plate's runtime bridge. */
  extensions?: TExtensions;
  /** Receives failures from extension lifecycle observers. */
  lifecycleErrorSink?: EditorLifecycleErrorSink<PliteEditor<any, any>>;
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
  /** Initial selection using the Plite constructor name. */
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
   * process. A later complete `editor.update.value.replace(...)` still runs
   * every plugin `prepareDocument` before schema fitting.
   *
   * @default false
   */
  skipInitialization?: boolean;
};

type ApplyEditorOptions<
  V extends Value = Value,
  P extends BasePluginInput = CorePluginDefinition,
  TExtensions extends readonly EditorExtensionReference[] = readonly [],
> = Omit<EditorOptions<TExtensions, P>, 'id'> &
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
export const applyEditor = <
  V extends Value = Value,
  P extends BasePluginInput = CorePluginDefinition,
  const TExtensions extends readonly EditorExtensionReference[] = readonly [],
>(
  e: PliteEditor<any, any>,
  options: ApplyEditorOptions<V, P, TExtensions>,
  implicitDocumentIsCurrent: boolean
): InternalBaseEditorWithInstalledPlugins<
  V,
  InferBaseEditorPlugins<P[]>,
  InferBaseEditorSchemaPlugins<P[]>,
  TExtensions
> => {
  const {
    affinity,
    autoSelect,
    extensions = [],
    initialValue,
    initialSelection,
    lifecycleErrorSink: _lifecycleErrorSink,
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
  const editor = e as unknown as Editor;

  editor.runtime ??= {} as Editor['runtime'];
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
              `Persisted document schema ${JSON.stringify(
                source
              )} does not match current schema ${JSON.stringify(current)}.`
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
          SelectionApi.root(innerSelection) ?? MAIN_ROOT_KEY;
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
          extensions,
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
      }
    );

    return editor as unknown as InternalBaseEditorWithInstalledPlugins<
      V,
      InferBaseEditorPlugins<P[]>,
      InferBaseEditorSchemaPlugins<P[]>,
      TExtensions
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

type CreateEditorOptionsForValue<
  V extends Value,
  TExtensions extends readonly EditorExtensionReference[] = readonly [],
  P extends readonly unknown[] = readonly CreateEditorPluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = Partial<
  Omit<
    ApplyEditorOptions<V, BasePluginInput, TExtensions>,
    'plugins' | 'schema'
  >
> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /** Existing Plite editor to enhance instead of allocating a new editor. */
  editor?: PliteEditor<any, any>;
  /**
   * Array of plugins to be loaded into the editor. Plugins extend the editor's
   * functionality and define custom behavior.
   */
  plugins?: P;
  schema?: TSchema;
};

export type CreateEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly EditorExtensionReference[] = readonly [],
  P extends readonly unknown[] = readonly CreateEditorPluginInput[],
  TSchema extends EditorApplicationSchema | undefined =
    | EditorApplicationSchema
    | undefined,
> = CreateEditorOptionsForValue<V, TExtensions, P, TSchema>;

export function createEditorWithEditor<
  V extends Value = Value,
  const TExtensions extends readonly EditorExtensionReference[] = readonly [],
  const P extends readonly unknown[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  editor: PliteEditor<any, any>,
  options: CreateEditorOptions<V, TExtensions, P, TSchema> = {}
): Editor<V, TExtensions, P, TSchema> {
  return applyEditor(
    editor,
    options as unknown as Parameters<typeof applyEditor>[1],
    false
  ) as unknown as Editor<V, TExtensions, P, TSchema>;
}

type CreateEditorPluginInput<
  _C extends AnyBasePluginDefinition = AnyBasePluginDefinition,
> = BasePluginInput;

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
export function createEditor<
  V extends Value,
  const TExtensions extends readonly EditorExtensionReference[] = readonly [],
>(
  options: CreateEditorOptionsForValue<
    V,
    TExtensions,
    readonly [],
    undefined
  > & { plugins?: never }
): Editor<V, TExtensions>;
export function createEditor<
  const TOptions extends CreateEditorOptionsForValue<
    any,
    readonly EditorExtensionReference[],
    readonly [],
    undefined
  > & {
    extensions: readonly EditorExtensionReference[];
    plugins?: never;
  },
>(
  options: TOptions
): Editor<
  EditorValueFromOptions<TOptions>,
  EditorExtensionsFromOptions<TOptions>
>;
export function createEditor<
  V extends Value = Value,
  const TExtensions extends readonly EditorExtensionReference[] = readonly [],
  const P extends readonly unknown[] = readonly [],
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options: CreateEditorOptions<V, TExtensions, P, TSchema> & { plugins: P }
): Editor<V, TExtensions, P, TSchema>;
export function createEditor<
  V extends Value = Value,
  const TSchema extends EditorApplicationSchema | undefined = undefined,
>(
  options?: CreateEditorOptions<V, readonly [], readonly [], TSchema>
): Editor<V, readonly [], readonly [], TSchema>;
export function createEditor({
  editor: inputEditor,
  id,
  ...options
}: CreateEditorOptionsForValue<
  Value,
  readonly EditorExtensionReference[]
> = {}): unknown {
  const editor =
    inputEditor ??
    createPliteEditor({
      id,
      lifecycleErrorSink: options.lifecycleErrorSink,
      maxLength: options.maxLength,
      readOnly: options.readOnly,
    });

  return applyEditor<
    Value,
    BasePluginInput,
    readonly EditorExtensionReference[]
  >(editor, options, inputEditor === undefined);
}
