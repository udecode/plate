import {
  createEditor,
  defineEditorExtension,
  defineEditorSchema,
  type Editor,
  type EditorDocumentValue,
  type EditorExtension,
  type EditorExtensionApiFactory,
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
import { clearPluginOptionsStores } from '../../internal/plugin/pluginOptionsStore';
import { isNominalPluginReference } from '../../internal/utils/mergePlugins';
import { createPlateChangeHandlersExtension } from '../../internal/plugin/plateChangeHandlers';
import type {
  AnyPluginConfig,
  NodeComponents,
  PluginConfig,
  PluginReference,
  WithRequiredKey,
} from '../plugin/PluginConfig';
import type {
  AnyBasePlugin,
  BasePlugin,
  InferConfig,
  InjectNodeProps,
} from '../plugin/BasePlugin';
import type { NodeIdOptions } from '../plugins/node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from '../plugins/paragraph/BaseParagraphPlugin';
import type {
  InferPlugins,
  BaseEditor,
  BasePluginInput,
  PlateSchemaIdentity,
} from './BaseEditor';

import {
  createPlateModelPublication,
  createPlateRuntimeExtension,
  plateReactCorePlugins,
  resolvePlugins,
  snapshotPlatePluginSources,
} from '../../internal/plugin/resolvePlugins';
import { transformInitialValue } from '../../internal/plugin/pipeTransformInitialValue';
import { createBasePlugin } from '../plugin/createBasePlugin';
import { getBasePlugin, getPluginType } from '../plugin/getBasePlugin';
import { getEditorPlugin } from '../plugin/getEditorPlugin';
import {
  type CorePluginConfig,
  getCorePlugins,
} from '../plugins/getCorePlugins';

type PluginLookupInput = AnyBasePlugin | WithRequiredKey<BasePluginInput>;
type PluginContextLookupInput = PluginLookupInput;

type PlateSchemaDescriptor = PluginReference;

const hasPlateSchemaDescriptorShape = (
  value: unknown
): value is PlateSchemaDescriptor =>
  typeof value === 'object' &&
  value !== null &&
  'key' in value &&
  'type' in value;

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
      Array.isArray(value) ? { children: value as V } : value
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
    children: [defaultChild] as V,
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

const PLATE_IMPLICIT_EXTENSION_NAME = Symbol.for(
  'plate.core.implicitExtensionName'
);

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === 'object' && value !== null;

const isPlainObject = (value: unknown): value is Record<PropertyKey, unknown> =>
  isRecord(value) && Object.getPrototypeOf(value) === Object.prototype;

const isImplicitPlateEditorExtension = (
  extension: unknown
): extension is Record<PropertyKey, unknown> & { name: string } =>
  isRecord(extension) &&
  extension[PLATE_IMPLICIT_EXTENSION_NAME] === true &&
  typeof extension.name === 'string';

const markImplicitPlateEditorExtension = <T extends object>(
  extension: T
): T => {
  Object.defineProperty(extension, PLATE_IMPLICIT_EXTENSION_NAME, {
    configurable: true,
    value: true,
  });

  return extension;
};

type EditorCommandFactory = NonNullable<EditorExtension['commands']>;

const isEditorCommandFactory = (
  value: unknown
): value is EditorCommandFactory => typeof value === 'function';

const composeEditorCommandFactories =
  (
    base: EditorCommandFactory,
    next: EditorCommandFactory
  ): EditorCommandFactory =>
  (context) => [...base(context), ...next(context)];

const mergeEditorExtensionValue = (
  key: string,
  base: unknown,
  next: unknown
): unknown => {
  if (Array.isArray(base) && Array.isArray(next)) {
    return [...base, ...next];
  }

  if (
    key === 'commands' &&
    isEditorCommandFactory(base) &&
    isEditorCommandFactory(next)
  ) {
    return composeEditorCommandFactories(base, next);
  }

  if (isPlainObject(base) && isPlainObject(next)) {
    return mergeEditorExtensionObjects(base, next);
  }

  return next;
};

const mergeEditorExtensionObjects = (
  base: Record<PropertyKey, unknown>,
  next: Record<PropertyKey, unknown>
) => {
  const merged: Record<PropertyKey, unknown> = { ...base };

  for (const [key, value] of Object.entries(next)) {
    merged[key] = mergeEditorExtensionValue(key, merged[key], value);
  }

  return markImplicitPlateEditorExtension(merged);
};

const mergeImplicitPlateEditorExtensions = (
  extensions: readonly EditorExtension[]
) => {
  const mergedExtensions: EditorExtension[] = [];
  const implicitIndexByName = new Map<string, number>();

  for (const extension of extensions) {
    if (!isImplicitPlateEditorExtension(extension as unknown)) {
      implicitIndexByName.delete(extension.name);

      mergedExtensions.push(extension);
      continue;
    }

    const index = implicitIndexByName.get(extension.name);

    if (index === undefined) {
      implicitIndexByName.set(extension.name, mergedExtensions.length);
      mergedExtensions.push(extension);
      continue;
    }

    const previous = mergedExtensions[index]!;

    mergedExtensions[index] = mergeEditorExtensionObjects(
      previous as Record<PropertyKey, unknown>,
      extension as Record<PropertyKey, unknown>
    ) as EditorExtension;
  }

  return mergedExtensions;
};

const normalizePlateEditorExtensions = (extensions: unknown) => {
  if (!extensions) return [];

  return Array.isArray(extensions) ? extensions : [extensions];
};

const resolvePlateEditorExtensions = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
): EditorExtension[] =>
  mergeImplicitPlateEditorExtensions(
    (plugin.__editorExtensions ?? []).flatMap(
      (extensionFactory) =>
        normalizePlateEditorExtensions(
          extensionFactory(getEditorPlugin(editor, plugin as any) as never)
        ) as EditorExtension[]
    )
  );

const groupPlateEditorExtensions = (extensions: readonly EditorExtension[]) => {
  const groups = new Map<string, EditorExtension[]>();

  for (const extension of extensions) {
    const name = extension.name;
    const group = groups.get(name) ?? [];

    group.push(extension);
    groups.delete(name);
    groups.set(name, group);
  }

  return Object.freeze(
    Object.fromEntries(
      [...groups].map(([name, group]) => [name, Object.freeze(group)])
    )
  );
};

export type PlateSchemaOptions = PlateSchemaIdentity;

const createPlateSchemaExtensions = (
  editor: BaseEditor,
  identityOptions: PlateSchemaOptions | undefined,
  model: ReturnType<typeof compilePlateModel>,
  pluginList: readonly AnyBasePlugin[]
) => {
  const contribution = model.contribution;
  const definition = {
    contentRoots: contribution.contentRoots ?? [],
    elements: contribution.elements ?? {},
    groups: contribution.groups ?? {},
    properties: contribution.properties ?? [],
    root: {
      content: createPlateBlockContent({
        default: { type: getEditorDefaultBlockType(editor) },
        min: 1,
      }),
    },
    roots: contribution.roots ?? {},
    unknown: 'reject' as const,
  };
  const identity = identityOptions
    ? defineEditorSchema({
        ...definition,
        id: identityOptions.id,
        version: identityOptions.version,
      })
    : defineEditorSchema(definition);
  const { extensionGroups, runtime } = withCompiledPlateModelCandidate(
    editor,
    model,
    () => {
      const runtime = createPlateRuntimeExtension(editor, pluginList);

      return {
        extensionGroups: groupPlateEditorExtensions(
          pluginList.flatMap((plugin) =>
            resolvePlateEditorExtensions(editor, plugin)
          )
        ),
        runtime,
      };
    }
  );
  let publication: ReturnType<typeof createPlateModelPublication> | undefined;
  const publishModel: EditorExtensionApiFactory = (
    _editor,
    { schema: compiledSchema }
  ) => {
    publication ??= createPlateModelPublication(
      editor,
      identityOptions ?? null,
      model,
      pluginList,
      compiledSchema,
      runtime.apiByPlugin,
      runtime.shortcutApiByPlugin,
      runtime.updateMethods
    );
    attachPlateModelPublication(editor, publication);

    return {};
  };

  const modelExtension = defineEditorExtension({
    api: publishModel,
    name: 'plate:model',
  });

  return Object.freeze({
    extensionGroups,
    modelExtensions: Object.freeze([
      identity,
      modelExtension,
      runtime.extension,
    ]),
  });
};

const createPlateConfiguration = (
  editor: BaseEditor,
  identity: PlateSchemaOptions | undefined,
  pluginList: readonly AnyBasePlugin[]
) =>
  withCompiledPlatePluginCandidate(editor, pluginList, () => {
    const model = compilePlateModel(editor);
    const { extensionGroups, modelExtensions } = createPlateSchemaExtensions(
      editor,
      identity,
      model,
      pluginList
    );
    return Object.freeze([
      ...modelExtensions,
      ...Object.values(extensionGroups).flatMap((group) => group ?? []),
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
    const plugin = publication.plugins[descriptor.key];
    const binding = publication.model.byKey[descriptor.key];

    if (!plugin || !binding) {
      throw new Error(
        `Plate schema descriptor "${descriptor.key}" is not installed.`
      );
    }
    if (plugin.type !== descriptor.type) {
      throw new Error(
        `Plate schema descriptor "${descriptor.key}" expects type "${descriptor.type}" but the installed plugin owns "${plugin.type}".`
      );
    }
    if (requireElement && !binding.elementType) {
      throw new Error(
        `Plate plugin "${descriptor.key}" does not declare schema.element.`
      );
    }

    return { binding, plugin };
  };
  const schemaFacade = new Proxy(rawSchema, {
    get(target, key, receiver) {
      if (key === 'createAndFill') {
        return (
          descriptor: Parameters<typeof rawSchema.createAndFill>[0] | unknown,
          properties?: Readonly<Record<string, unknown>>
        ) => {
          if (!hasPlateSchemaDescriptorShape(descriptor)) {
            return rawSchema.createAndFill(
              descriptor as Parameters<typeof rawSchema.createAndFill>[0],
              properties
            );
          }
          const { plugin } = resolveDescriptor(descriptor, true);

          return rawSchema.createAndFill(plugin.type, properties);
        };
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
              `Plate plugin "${plugin.key}" cannot identify one element property. Declare exactly one element property, or pass a raw Plite property handle or string.`
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
              `Plate plugin "${plugin.key}" cannot identify one schema property. Declare exactly one element or text property, or pass a raw Plite property handle or query.`
            );
          }

          return rawSchema.property({
            id: propertyIds[0]!,
            kind: 'schema-property',
          });
        };
      }
      if (key === 'handle') {
        return (descriptor: PlateSchemaDescriptor) => {
          const { plugin } = resolveDescriptor(descriptor, true);

          return Object.freeze({
            kind: 'schema-element',
            schema: editor,
            type: plugin.type,
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

const installPlateEditorExtensions = (
  editor: BaseEditor,
  identity: PlateSchemaOptions | undefined,
  initialize?: (tx: EditorTransactionSpecBuilder) => void
) => {
  const configuration = createPlateConfiguration(
    editor,
    identity,
    getPlateRuntime(editor).pluginList
  );

  let restoreModelAccessors: (() => void) | undefined;

  try {
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
    throw error;
  }

  if (!initialize) installPlateModelAccessors(editor);
};

export type BaseExtendBaseEditorOptions<
  P extends BasePluginInput = CorePluginConfig,
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
  /** Specifies the component for each plugin key. */
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
  nodeId?: NodeIdOptions | boolean;
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
  schema?: PlateSchemaOptions;
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
  P extends BasePluginInput = CorePluginConfig,
> = Omit<BaseExtendBaseEditorOptions<P>, 'id'> &
  Partial<
    Pick<
      AnyBasePlugin,
      'decorate' | 'inject' | 'transformInitialValue' | 'options' | 'override'
    >
  > & {
    /** Root editor API declarations for the synthetic root plugin. */
    api?: AnyPluginConfig['api'];
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
          editor: BaseEditor<V, CorePluginConfig | InferPlugins<P[]>>;
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
  P extends BasePluginInput = CorePluginConfig,
>(
  e: Editor,
  options: ExtendBaseEditorOptions<V, P>
): BaseEditor<V, CorePluginConfig | InferPlugins<P[]>> => {
  const {
    [plateReactCorePlugins]: reactCorePlugins = [],
    affinity,
    autoSelect,
    initialValue,
    maxLength,
    nodeId,
    plugins = [],
    readOnly,
    schema: schemaIdentity,
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

  editor.getPlugin = ((plugin: PluginLookupInput) =>
    getBasePlugin(editor, plugin)) as BaseEditor['getPlugin'];
  editor.plugin = ((plugin: PluginContextLookupInput) =>
    getEditorPlugin(editor, plugin)) as BaseEditor['plugin'];
  editor.getType = (pluginKey) => getPluginType(editor, pluginKey);
  editor.getInjectProps = (<C extends AnyPluginConfig = PluginConfig>(
    plugin: WithRequiredKey<C>
  ): InjectNodeProps<C> => {
    const resolvedPlugin = getBasePlugin(editor, plugin) as BasePlugin<C>;
    const nodeProps = (resolvedPlugin.inject?.nodeProps ??
      {}) as InjectNodeProps<C>;

    const nodeKey = nodeProps.nodeKey ?? editor.getType(plugin.key);

    return {
      ...nodeProps,
      nodeKey,
      styleKey: nodeProps.styleKey ?? nodeKey,
    };
  }) satisfies BaseEditor['getInjectProps'];
  const baseCorePlugins = getCorePlugins({
    affinity,
    nodeId,
  });

  const internalRootDescriptor: AnyBasePlugin = (createBasePlugin as any)({
    key: 'root',
    priority: 10_000,
    ...pluginConfig,
    override: {
      ...pluginConfig.override,
      components: {
        ...pluginConfig.components,
        ...pluginConfig.override?.components,
      },
    },
  }) as AnyBasePlugin;

  const sourcePlugins = snapshotPlatePluginSources({
    baseCore: baseCorePlugins as unknown as readonly AnyBasePlugin[],
    internalRoot: internalRootDescriptor,
    reactCore: reactCorePlugins,
    user: plugins as unknown as readonly AnyBasePlugin[],
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
    setEditorDefaultBlockType(editor, editor.getType(BaseParagraphPlugin.key));
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
                        editor: editor as unknown as BaseEditor<
                          V,
                          CorePluginConfig | InferPlugins<P[]>
                        >,
                      })
                  : initialValue,
              selection,
              shouldNormalizeEditor,
            })
    );

    return editor as any;
  } catch (error) {
    restoreSnapshotInputTransform?.();
    if (!publicationBeforeExtension) clearPlateModelPublication(editor);
    clearPluginOptionsStores(editor);
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

type CreateBaseEditorPluginInput<_C extends AnyPluginConfig = AnyPluginConfig> =
  BasePluginInput;

type InferCreateBaseEditorPlugins<P extends readonly unknown[]> =
  | InferConfig<typeof BaseParagraphPlugin>
  | InferPlugins<P>;

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
 *   schema: { id: 'acme-document', version: 1 },
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
): BaseEditor<V, InferCreateBaseEditorPlugins<P>>;
export function createBaseEditor<V extends Value = Value>(
  options?: CreateBaseEditorOptions<V>
): BaseEditor<V, CorePluginConfig>;
export function createBaseEditor<
  V extends Value = Value,
  const P extends readonly unknown[] = readonly [],
>({
  editor,
  id,
  ...options
}: CreateBaseEditorOptions<V, P> = {}): BaseEditor<
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
  ) as unknown as BaseEditor<V, InferCreateBaseEditorPlugins<P>>;
}
