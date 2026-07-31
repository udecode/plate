import {
  createEditor,
  defineEditorExtension,
  defineEditorSchema,
  type Editor,
  type EditorDocumentValue,
  type EditorExtensionReference,
  type EditorSchemaPropertyHandle,
  type EditorSchemaPropertyQuery,
  type SnapshotInput,
  type EditorTransactionSpecBuilder,
  type Element,
  type Selection,
  type Value,
} from '@platejs/plite';
import {
  getEditorDefaultBlockType,
  initializeEditorExtensions,
  MAIN_ROOT_KEY,
  repairEditorValue,
  setEditorDefaultBlockType,
  setEditorMaxLength,
  setEditorReadOnly,
  setEditorSnapshotInputTransform,
} from '@platejs/plite/internal';

import type { NoInfer } from '../../internal/types';
import { compilePlateCodecs } from '../../internal/plugin/compilePlateCodecs';
import {
  attachPlateModelPublication,
  clearPlateModelPublication,
  compilePlateModel,
  createPlateBlockContent,
  getPlateModelPublication,
  getPlateRuntime,
  withCompiledPlateModelCandidate,
  withCompiledPlatePluginCandidate,
} from '../../internal/plugin/compilePlateModel';
import { clearPlateRuntimeCandidate } from '../../internal/plugin/plateRuntime';
import { clearPluginStores } from '../../internal/plugin/pluginStore';
import {
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
  AnyBasePluginPortal,
  BasePluginPortal,
  BasePluginDefinitionInput,
} from '../plugin/BasePlugin';
import type { NodeIdPluginState } from '../plugins/node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from '../plugins/paragraph/BaseParagraphPlugin';
import type {
  InferPlugins,
  BaseEditor,
  BasePluginInput,
  InternalBaseEditorWithInstalledPlugins,
  MergeInstalledPluginDefinitions,
  PlateSchemaIdentity,
} from './BaseEditor';

import {
  createPlateModelPublication,
  createPlateRuntimeExtensions,
  getPlateRuntimeExtensionBindings,
  plateReactCorePlugins,
  resolvePlateRuntimeExtension,
  resolvePlugins,
  restorePlateRuntimeExtensionBindings,
  snapshotPlatePluginSources,
} from '../../internal/plugin/resolvePlugins';
import { transformInitialValue } from '../../internal/plugin/pipeTransformInitialValue';
import { createBasePlugin } from '../plugin/createBasePlugin';
import { createPluginPortal } from '../plugin/createPluginContext.internal';
import {
  type CorePluginDefinition,
  getCorePlugins,
} from '../plugins/getCorePlugins';

type PluginLookupInput = AnyBasePlugin | string;
type PluginContextLookupInput = PluginLookupInput;

type PlateSchemaDescriptor = PluginReference;

type InferBaseEditorPlugins<TPlugins extends readonly unknown[]> =
  MergeInstalledPluginDefinitions<CorePluginDefinition, InferPlugins<TPlugins>>;

const hasPlateSchemaDescriptorShape = (
  value: unknown
): value is PlateSchemaDescriptor =>
  typeof value === 'object' &&
  value !== null &&
  'name' in value &&
  'type' in value;

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
  pluginList: readonly AnyBasePlugin[]
) => {
  const contribution = model.contribution;
  const definition = {
    contentRoots: contribution.contentRoots ?? [],
    elements: contribution.elements ?? {},
    groups: contribution.groups ?? {},
    properties: contribution.properties ?? [],
    root: createPlateBlockContent({
      default: { type: getEditorDefaultBlockType(editor) },
      min: 1,
    }),
    roots: contribution.roots ?? {},
  };
  const identity = identityOptions
    ? defineEditorSchema({
        ...definition,
        id: identityOptions.id,
        version: identityOptions.version,
      })
    : defineEditorSchema(definition);
  const { codecExtension, runtime } = withCompiledPlateModelCandidate(
    editor,
    model,
    () => {
      const runtime = createPlateRuntimeExtensions(editor, pluginList);

      return {
        codecExtension: compilePlateCodecs(editor, model, pluginList),
        runtime,
      };
    }
  );
  let publication: ReturnType<typeof createPlateModelPublication> | undefined;

  const modelExtension = defineEditorExtension({
    name: 'plate:model',
    validate: ({ schema: compiledSchema }) => {
      const { apiByPlugin, shortcutApiByPlugin } =
        runtime.resolveApiPublication();

      publication ??= createPlateModelPublication(
        editor,
        identityOptions ?? null,
        model,
        pluginList,
        compiledSchema,
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
    modelExtension,
    ...(codecExtension ? [codecExtension] : []),
  ]);
};

const createPlateConfiguration = (
  editor: BaseEditor,
  identity: PlateSchemaIdentity | undefined,
  pluginList: readonly AnyBasePlugin[]
) =>
  withCompiledPlatePluginCandidate(editor, pluginList, () => {
    const model = compilePlateModel(editor);
    const modelExtensions = createPlateSchemaExtensions(
      editor,
      identity,
      model,
      pluginList
    );
    return Object.freeze([
      ...modelExtensions,
      createPlateChangeHandlersExtension(editor),
    ]);
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
    if (plugin.type !== descriptor.type) {
      throw new Error(
        `Plate schema descriptor "${descriptor.name}" expects type "${descriptor.type}" but the installed plugin owns "${plugin.type}".`
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
          const { plugin } = resolveDescriptor(descriptor, true);

          return rawSchema.create(plugin.type, properties);
        };
      }
      if (key === 'allowsElementType') {
        return (
          parent: PlateSchemaDescriptor | string,
          child: PlateSchemaDescriptor | string
        ) =>
          rawSchema.allowsElementType(
            hasPlateSchemaDescriptorShape(parent)
              ? resolveDescriptor(parent, true).plugin.type
              : parent,
            hasPlateSchemaDescriptorShape(child)
              ? resolveDescriptor(child, true).plugin.type
              : child
          );
      }
      if (key === 'element') {
        return (descriptor: PlateSchemaDescriptor | string) => {
          if (!hasPlateSchemaDescriptorShape(descriptor)) {
            return rawSchema.element(descriptor);
          }
          const { plugin } = resolveDescriptor(descriptor, true);

          return rawSchema.element(plugin.type);
        };
      }
      if (key === 'isElementTypeInGroup') {
        return (descriptor: PlateSchemaDescriptor | string, group: string) =>
          rawSchema.isElementTypeInGroup(
            hasPlateSchemaDescriptorShape(descriptor)
              ? resolveDescriptor(descriptor, true).plugin.type
              : descriptor,
            group
          );
      }
      if (key === 'getElementProperty') {
        return (
          element: Element,
          property:
            | Parameters<typeof rawSchema.getElementProperty>[1]
            | PlateSchemaDescriptor
        ) => {
          if (!hasPlateSchemaDescriptorShape(property)) {
            return rawSchema.getElementProperty(element, property);
          }
          const { binding, plugin } = resolveDescriptor(property, false);

          if (binding.elementPropertyKeys.length !== 1) {
            throw new Error(
              `Plate plugin "${plugin.name}" cannot identify one element property. Declare exactly one element property, or pass a raw Plite property handle or string.`
            );
          }

          return rawSchema.getElementProperty(
            element,
            binding.elementPropertyKeys[0]
          );
        };
      }
      if (key === 'property') {
        return (
          property:
            | EditorSchemaPropertyHandle
            | EditorSchemaPropertyQuery
            | PlateSchemaDescriptor
        ) => {
          if ('placement' in property) {
            return rawSchema.property(property);
          }
          if ('kind' in property) {
            return rawSchema.property(property);
          }
          const { binding, plugin } = resolveDescriptor(property, false);
          const propertyIds = [
            ...binding.propertyIds,
            ...(binding.textPropertyId ? [binding.textPropertyId] : []),
          ];

          if (propertyIds.length !== 1) {
            throw new Error(
              `Plate plugin "${plugin.name}" cannot identify one schema property. Declare exactly one element or text property, or pass a raw Plite property handle or query.`
            );
          }

          return rawSchema.property({
            id: propertyIds[0]!,
            kind: 'schema-property',
          });
        };
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
  initialize?: (tx: EditorTransactionSpecBuilder) => void
) => {
  const previousBindings = getPlateRuntimeExtensionBindings(editor);
  const restoreExtensionPortal = installPlateExtensionPortal(editor);
  let restoreModelAccessors: (() => void) | undefined;

  try {
    const configuration = createPlateConfiguration(
      editor,
      identity,
      getPlateRuntime(editor).pluginList
    );

    initializeEditorExtensions<Editor>(editor, configuration, {
      initialize: initialize
        ? (tx) => {
            restoreModelAccessors = installPlateModelAccessors(editor);
            initialize(tx);
          }
        : undefined,
    });
  } catch (error) {
    restoreModelAccessors?.();
    restorePlateRuntimeExtensionBindings(editor, previousBindings);
    restoreExtensionPortal();
    throw error;
  }

  if (!initialize) installPlateModelAccessors(editor);
};

export type BaseExtendBaseEditorOptions<
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
   * @default { idKey: 'id', filterInline: true, filterText: true, idCreator: () => nanoid(10) }
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

export type ExtendBaseEditorOptions<
  V extends Value = Value,
  P extends BasePluginInput = CorePluginDefinition,
> = Omit<BaseExtendBaseEditorOptions<P>, 'id'> &
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
            InferBaseEditorPlugins<P[]>
          >;
        }) => EditorValueInput<NoInfer<V>>)
      | EditorValueInput<NoInfer<V>>;
  };

/**
 * Applies Plate enhancements to an editor instance (non-React version).
 *
 * @remarks
 *   This function supports server-side usage as it doesn't include React-specific
 *   features like component rendering or hooks integration.
 * @see {@link createBaseEditor} for a higher-level non-React editor creation function.
 * @see {@link createPlateEditor} for a React-specific version of editor creation.
 * @see {@link usePlateEditor} for a memoized React version.
 * @see {@link extendPlateEditor} for the React-specific enhancement function.
 */
export const extendBaseEditor = <
  V extends Value = Value,
  P extends BasePluginInput = CorePluginDefinition,
>(
  e: Editor,
  options: ExtendBaseEditorOptions<V, P>
): InternalBaseEditorWithInstalledPlugins<V, InferBaseEditorPlugins<P[]>> => {
  const {
    [plateReactCorePlugins]: reactCorePlugins = [],
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
  } = options as ExtendBaseEditorOptions<V, P> & {
    [plateReactCorePlugins]?: readonly AnyBasePlugin[];
  };
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
  function getInstalledPluginPortal(pluginName: string): AnyBasePluginPortal;
  function getInstalledPluginPortal(plugin: PluginContextLookupInput): unknown {
    return createPluginPortal(editor, plugin);
  }
  editor.plugin = getInstalledPluginPortal;
  const baseCorePlugins = getCorePlugins({
    affinity,
    nodeId,
  });

  const internalRootCandidate = Reflect.apply(createBasePlugin, undefined, [
    {
      name: 'root',
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
    reactCore: reactCorePlugins,
    user: plugins,
  });
  const schemaIdentitySnapshot = schemaIdentity
    ? Object.freeze({
        id: schemaIdentity.id,
        version: schemaIdentity.version,
      })
    : undefined;
  const publicationBeforeExtension = getPlateModelPublication(editor);
  let restoreSnapshotInputTransform: (() => void) | undefined;

  try {
    resolvePlugins(editor, sourcePlugins);
    setEditorDefaultBlockType(
      editor,
      editor.plugin(BaseParagraphPlugin.name).type
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
      schemaIdentitySnapshot,
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
                            InferBaseEditorPlugins<P[]>
                          >,
                      })
                  : initialValue,
              selection,
              shouldNormalizeEditor,
            })
    );

    return editor as unknown as InternalBaseEditorWithInstalledPlugins<
      V,
      InferBaseEditorPlugins<P[]>
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

export type CreateBaseEditorOptions<
  V extends Value = Value,
  P extends readonly unknown[] = readonly CreateBaseEditorPluginInput[],
> = Partial<Omit<ExtendBaseEditorOptions<V, BasePluginInput>, 'plugins'>> & {
  /** Stable logical identity for the created editor. */
  id?: string;
  /**
   * Initial editor to be extended with `extendBaseEditor`.
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
 *   initialValue: [{ type: 'p', children: [{ text: 'Hello world!' }] }],
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
 * @see {@link extendBaseEditor} for the underlying function that applies base Plate enhancements to an editor.
 */
export function createBaseEditor<
  V extends Value = Value,
  const P extends readonly unknown[] = readonly [],
>(
  options: CreateBaseEditorOptions<V, P> & { plugins: P }
): InternalBaseEditorWithInstalledPlugins<V, InferCreateBaseEditorPlugins<P>>;
export function createBaseEditor<V extends Value = Value>(
  options?: CreateBaseEditorOptions<V>
): InternalBaseEditorWithInstalledPlugins<V, CorePluginDefinition>;
export function createBaseEditor<
  V extends Value = Value,
  const P extends readonly unknown[] = readonly [],
>({
  editor,
  id,
  ...options
}: CreateBaseEditorOptions<V, P> = {}): InternalBaseEditorWithInstalledPlugins<
  V,
  InferCreateBaseEditorPlugins<P>
> {
  const baseEditor =
    editor ??
    createEditor({
      id,
      maxLength: options.maxLength,
      readOnly: options.readOnly,
    });

  return extendBaseEditor<V, BasePluginInput>(
    baseEditor,
    options as unknown as ExtendBaseEditorOptions<V, BasePluginInput>
  ) as unknown as InternalBaseEditorWithInstalledPlugins<
    V,
    InferCreateBaseEditorPlugins<P>
  >;
}
