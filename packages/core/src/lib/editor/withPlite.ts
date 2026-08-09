import {
  createEditor,
  defineExtension,
  defineEditorSchema,
  type Editor,
  type EditorDocumentValue,
  type EditorExtensionReference,
  type SnapshotInput,
  type EditorTransactionSpecBuilder,
  type Selection,
  type Value,
} from '@platejs/plite';
import {
  type AnyEditor,
  getCompiledEditorSchemaFromApi,
  initializeEditorExtensions,
  MAIN_ROOT_KEY,
  repairEditorValue,
  setEditorMaxLength,
  setEditorReadOnly,
  setEditorSnapshotInputTransform,
} from '@platejs/plite/internal';

import type { NoInfer } from '../../internal/types';
import { compilePlateCodecs } from '../../internal/plugin/compilePlateCodecs';
import {
  attachPlateModelPublication,
  applyEditorApplicationSchema,
  clearPlateModelPublication,
  compileEditorApplicationSchema,
  compilePlateModel,
  createPlateBlockContent,
  getPlateModelPublication,
  getPlateRuntime,
  withEditorApplicationSchemaCandidate,
  withCompiledPlateModelCandidate,
  withCompiledPlatePluginCandidate,
} from '../../internal/plugin/compilePlateModel';
import { clearPlateRuntimeCandidate } from '../../internal/plugin/plateRuntime';
import { clearPluginStores } from '../../internal/plugin/pluginStore';
import {
  getPluginSchemaFamily,
  isNominalPluginDescriptor,
  isNominalPluginReference,
} from '../../internal/utils/mergePlugins';
import { createPlateChangeHandlersExtension } from '../../internal/plugin/plateChangeHandlers';
import type {
  AnyBasePluginDefinition,
  NodeComponents,
  PluginReference,
} from '../plugin/PluginDefinition';
import type { InternalPluginDefinitionOf } from '../plugin/pluginDefinitionLookup.internal';
import type {
  AnyBasePlugin,
  BasePluginPortal,
  BasePluginDefinitionInput,
  DynamicBasePluginPortal,
} from '../plugin/BasePlugin';
import type { NodeIdPluginState } from '../plugins/node-id/NodeIdPlugin';
import type {
  InferPlugins,
  InferRuntimePlugins,
  BaseEditor,
  BasePluginInput,
  InternalBaseEditorMutationProvider,
  InternalBaseEditorWithInstalledPlugins,
  MergeInstalledPluginDefinitions,
  PlateSchemaIdentity,
} from './BaseEditor';

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
import { transformInitialValue } from '../../internal/plugin/pipeTransformInitialValue';
import {
  getGeneratedEditorContract,
  getRuntimeEditorDefinition,
  type RuntimeEditorDefinition,
  type RuntimeGeneratedEditorContract,
} from './defineEditor';

type ProjectInjectedEditor<TEditor, TProjection> = Omit<
  TEditor,
  keyof TProjection
> &
  TProjection;
import { defineBasePlugin } from '../plugin/defineBasePlugin';
import { createPluginPortal } from '../plugin/createPluginContext.internal';
import {
  type CorePluginDefinition,
  type CorePlugins,
  getCorePlugins,
} from '../plugins/getCorePlugins';

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

export type EditorValueInput<V extends Value> =
  | EditorDocumentValue<V>
  | Readonly<V>
  | V;

const normalizeBaseInitialValue = <V extends Value>(
  editor: BaseEditor,
  value: unknown
): EditorDocumentValue<V> => {
  if (value !== undefined) {
    const children = Array.isArray(value)
      ? value
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
    ) as EditorDocumentValue<V>;
  }

  const currentValue = editor.read.value() as EditorDocumentValue<V>;

  if (currentValue.children.length > 0) return currentValue;

  const defaultChild = editor.read.schema.createDefaultRootChild();

  if (!defaultChild) {
    throw new Error('Plate schema must declare a default primary-root child.');
  }

  return {
    ...currentValue,
    children: [defaultChild] as unknown as V,
  };
};

const initializeBaseEditor = <V extends Value>(
  editor: BaseEditor,
  tx: EditorTransactionSpecBuilder,
  {
    autoSelect,
    initialValue,
    selection,
    shouldNormalizeEditor,
  }: {
    autoSelect?: boolean | 'end' | 'start';
    initialValue?:
      | ((context: { editor: BaseEditor }) => EditorValueInput<V>)
      | EditorValueInput<V>;
    selection?: Selection;
    shouldNormalizeEditor?: boolean;
  }
) => {
  const nextValue = normalizeBaseInitialValue<V>(
    editor,
    typeof initialValue === 'function' ? initialValue({ editor }) : initialValue
  );
  const selectionInput =
    selection ??
    (autoSelect === true
      ? 'end'
      : autoSelect === 'start' || autoSelect === 'end'
        ? autoSelect
        : null);

  const wasInitializing = editor.runtime.isNormalizing;

  editor.runtime.isNormalizing = true;
  try {
    tx.value.replace({
      ...nextValue,
      selection: selectionInput,
    });
    if (shouldNormalizeEditor) repairEditorValue(editor);
  } finally {
    editor.runtime.isNormalizing = wasInitializing;
  }
};

const createPlateSchemaExtensions = (
  editor: BaseEditor,
  identityOptions: PlateSchemaIdentity | undefined,
  model: ReturnType<typeof compilePlateModel>,
  pluginList: readonly AnyBasePlugin[],
  generatedContract?: RuntimeGeneratedEditorContract,
  applicationSchema?: ReturnType<typeof compileEditorApplicationSchema>,
  applicationName?: string
) => {
  const definition = {
    groups: model.contribution.groups ?? {},
    root: createPlateBlockContent({
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
      const runtime = createPlateRuntimeExtensions(editor, pluginList, model);

      return {
        codecExtension: compilePlateCodecs(editor, model, pluginList),
        runtime,
      };
    }
  );
  const applicationSchemaExtension = applicationSchema
    ? defineExtension(
        `schema:application:${generatedContract?.definitionName ?? applicationName ?? 'editor'}`,
        { schema: applicationSchema }
      )
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
      if (
        generatedContract &&
        compiledSchema.identity.fingerprint !== generatedContract.fingerprint
      ) {
        throw new Error(
          `Generated editor schema is stale: expected "${generatedContract.fingerprint}" but compiled "${compiledSchema.identity.fingerprint}". Run plate generate.`
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
  identity: PlateSchemaIdentity | undefined,
  pluginList: readonly AnyBasePlugin[],
  generatedContract?: RuntimeGeneratedEditorContract,
  editorDefinition?: RuntimeEditorDefinition
) =>
  withCompiledPlatePluginCandidate(editor, pluginList, () => {
    const authoredModel = compilePlateModel(editor);
    const policy = generatedContract?.schemaPolicy ?? editorDefinition?.schema;
    const applicationSchema = compileEditorApplicationSchema(
      authoredModel,
      policy
    );
    const model = applyEditorApplicationSchema(authoredModel, policy);
    const modelExtensions = createPlateSchemaExtensions(
      editor,
      identity,
      model,
      pluginList,
      generatedContract,
      applicationSchema,
      editorDefinition?.name
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
  const getPublication = () => {
    const publication = getPlateModelPublication(editor);

    if (!publication) {
      throw new Error('Plate model is not installed.');
    }

    return publication;
  };

  const rawSchema = editor.read.schema;
  const resolveDescriptor = (
    descriptor: PlateSchemaDescriptor,
    requireElement: boolean
  ) => {
    if (!isNominalPluginReference(descriptor)) {
      throw new Error('Plate schema received an invalid plugin descriptor.');
    }
    const publication = getPublication();
    const plugin = publication.plugins[descriptor.name];
    const binding = publication.model.byName[descriptor.name];

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
  const schemaFacade = new Proxy(rawSchema, {
    get(target, key, receiver) {
      if (key === 'create') {
        return (
          descriptor: Parameters<typeof rawSchema.create>[0] | unknown,
          properties?: Readonly<Record<string, unknown>>
        ) => {
          if (!hasPlateSchemaDescriptorShape(descriptor)) {
            return rawSchema.create(
              descriptor as Parameters<typeof rawSchema.create>[0],
              properties
            );
          }
          const { binding } = resolveDescriptor(descriptor, true);

          return rawSchema.create(binding.elementType!, properties);
        };
      }
      if (key === 'allowsElementType') {
        return (
          parent: PlateSchemaDescriptor | string,
          child: PlateSchemaDescriptor | string
        ) =>
          rawSchema.allowsElementType(
            hasPlateSchemaDescriptorShape(parent)
              ? resolveDescriptor(parent, true).binding.elementType!
              : parent,
            hasPlateSchemaDescriptorShape(child)
              ? resolveDescriptor(child, true).binding.elementType!
              : child
          );
      }
      if (key === 'element') {
        return (descriptor: PlateSchemaDescriptor | string) => {
          if (!hasPlateSchemaDescriptorShape(descriptor)) {
            return rawSchema.element(descriptor);
          }
          const { binding } = resolveDescriptor(descriptor, true);

          return rawSchema.element(binding.elementType!);
        };
      }
      if (key === 'isElementTypeInGroup') {
        return (descriptor: PlateSchemaDescriptor | string, group: string) =>
          rawSchema.isElementTypeInGroup(
            hasPlateSchemaDescriptorShape(descriptor)
              ? resolveDescriptor(descriptor, true).binding.elementType!
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
  identity: PlateSchemaIdentity | undefined,
  initialize?: (tx: EditorTransactionSpecBuilder) => void,
  generatedContract?: RuntimeGeneratedEditorContract,
  editorDefinition?: RuntimeEditorDefinition
) => {
  const previousBindings = getPlateRuntimeExtensionBindings(editor);
  const restoreExtensionPortal = installPlateExtensionPortal(editor);
  let restoreModelAccessors: (() => void) | undefined;

  try {
    const configuration = createPlateConfiguration(
      editor,
      identity,
      getPlateRuntime(editor).pluginList,
      generatedContract,
      editorDefinition
    );

    withCompiledPlateModelCandidate(editor, configuration.model, () =>
      initializeEditorExtensions<Editor>(editor, configuration.extensions, {
        initialize: initialize
          ? (tx) => {
              restoreModelAccessors = installPlateModelAccessors(editor);
              initialize(tx);
            }
          : undefined,
      })
    );
  } catch (error) {
    restoreModelAccessors?.();
    restorePlateRuntimeExtensionBindings(editor, previousBindings);
    restoreExtensionPortal();
    throw error;
  }

  if (!initialize) installPlateModelAccessors(editor);
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
  /**
   * Configuration for automatic node ID generation and management.
   *
   * Unless set to `false`, the editor automatically adds unique IDs to nodes
   * through the core NodeIdPlugin:
   *
   * - Normalizes the initial value for missing IDs
   * - Adds IDs to new nodes during insertion
   * - Preserves explicit target-unique IDs on generic inserts
   * - Generates fresh clipboard-paste IDs unless `reuseId` is true
   * - Handles ID conflicts and duplicates
   *
   * @default { filterInline: true, filterText: true, idCreator: () => nanoid(10) }
   */
  nodeId?: Partial<NodeIdPluginState> | boolean;
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
  /**
   * Application-owned lineage for History, Yjs, and schema migrations.
   * Omit it for a schema identified only by its compiled semantics.
   */
  schemaIdentity?: PlateSchemaIdentity;
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
   * every plugin `transformInitialValue` before schema fitting.
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
    Pick<
      AnyBasePlugin,
      | 'decorate'
      | 'initialState'
      | 'inject'
      | 'override'
      | 'transformInitialValue'
    >
  > & {
    /** Root editor API declarations for the synthetic root plugin. */
    api?: BasePluginDefinitionInput['api'];
    /**
     * One-shot editor document, or primary-root array shorthand. The callback
     * runs synchronously after the plugin model and schema are compiled, so
     * feature-owned decoders can use the configured editor.
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
  E extends AnyEditor = AnyEditor,
>(
  e: E,
  options: ApplyBaseEditorOptions<V, P>
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
    nodeId,
    plugins = [],
    readOnly,
    schemaIdentity,
    selection,
    shouldNormalizeEditor,
    skipInitialization,
    userId,
    ...pluginConfig
  } = options;
  const generatedContract = getGeneratedEditorContract(plugins);
  const editorDefinition = getRuntimeEditorDefinition(plugins);
  const effectiveSchemaIdentity =
    schemaIdentity ??
    generatedContract?.schemaIdentity ??
    editorDefinition?.schemaIdentity;
  const editor = e as unknown as BaseEditor;

  editor.runtime = editor.runtime ?? ({} as BaseEditor['runtime']);
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
  const baseCorePlugins = getCorePlugins({
    affinity,
    nodeId,
  });

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
  const applicationPolicy =
    generatedContract?.schemaPolicy ?? editorDefinition?.schema;
  let restoreSnapshotInputTransform: (() => void) | undefined;

  try {
    withEditorApplicationSchemaCandidate(
      editor,
      applicationPolicy,
      collectPlatePluginSourceCandidates(sourcePlugins),
      () => resolvePlugins(editor, sourcePlugins)
    );
    restoreSnapshotInputTransform = setEditorSnapshotInputTransform(
      editor,
      (input: SnapshotInput) => {
        const { selection: inputSelection, ...value } = input;
        const selection =
          inputSelection &&
          inputSelection !== 'start' &&
          inputSelection !== 'end'
            ? inputSelection
            : null;
        const transformed = transformInitialValue(
          editor,
          value as EditorDocumentValue,
          selection,
          selection?.anchor.root ?? selection?.focus.root ?? MAIN_ROOT_KEY
        );

        return {
          ...transformed.value,
          selection:
            inputSelection === 'start' || inputSelection === 'end'
              ? inputSelection
              : transformed.selection,
        };
      }
    );
    installPlateEditorExtensions(
      editor,
      effectiveSchemaIdentity
        ? Object.freeze({
            id: effectiveSchemaIdentity.id,
            version: effectiveSchemaIdentity.version,
          })
        : undefined,
      skipInitialization
        ? undefined
        : (tx) =>
            initializeBaseEditor(editor, tx, {
              autoSelect,
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
              shouldNormalizeEditor,
            }),
      generatedContract,
      editorDefinition
    );

    return editor as unknown as InternalBaseEditorWithInstalledPlugins<
      V,
      InferBaseEditorPlugins<P[]>,
      InferBaseEditorSchemaPlugins<P[]>
    >;
  } catch (error) {
    restoreSnapshotInputTransform?.();
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
> = Partial<Omit<ApplyBaseEditorOptions<V, BasePluginInput>, 'plugins'>> & {
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
};

export type CreateBaseEditorOptions<
  P extends readonly unknown[] = readonly CreateBaseEditorPluginInput[],
> = CreateBaseEditorOptionsForValue<Value, P>;

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
 *   plugins: [ParagraphPlugin, H1Plugin],
 *   initialValue: [{ type: 'paragraph', children: [{ text: 'Hello world!' }] }],
 * });
 *
 * // Editor with custom configuration
 * const editor = createBaseEditor({
 *   plugins: [ParagraphPlugin],
 *   maxLength: 1000,
 *   nodeId: { idCreator: () => uuidv4() },
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
 *   schemaIdentity: { id: 'acme-document', version: 1 },
 * });
 * ```
 *
 * @see {@link createPlateEditor} for a React-specific version of editor creation.
 * @see {@link usePlateEditor} for a memoized React version.
 */
export function createBaseEditor<
  const P extends readonly unknown[] = readonly [],
>(options: CreateBaseEditorOptions<P> & { plugins: P }): BaseEditor<P>;
export function createBaseEditor<
  const TEditor,
  const P extends readonly unknown[] = readonly [],
>(
  options: Omit<CreateBaseEditorOptions<P>, 'editor' | 'initialValue'> & {
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
    InternalBaseEditorMutationProvider<P, InferCreateBaseEditorPlugins<P>>
  >
>;
export function createBaseEditor(
  options?: CreateBaseEditorOptions<readonly []>
): BaseEditor<readonly []>;
export function createBaseEditor({
  editor,
  id,
  ...options
}: CreateBaseEditorOptionsForValue<
  Value,
  readonly BasePluginInput[]
> = {}): unknown {
  const baseEditor =
    editor ??
    createEditor({
      id,
      maxLength: options.maxLength,
      readOnly: options.readOnly,
    });

  return applyBaseEditor<Value, BasePluginInput>(
    baseEditor,
    options as unknown as ApplyBaseEditorOptions<Value, BasePluginInput>
  ) as unknown as BaseEditor;
}
