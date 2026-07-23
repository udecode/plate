import {
  type Editor,
  type EditorSchemaContribution,
  type SchemaElementPropertyOptions,
  type SchemaContentOptions,
  type SchemaElement,
  type SchemaProperty,
  type SchemaTextPropertyOptions,
  schema,
} from '@platejs/plite';
import { getCompiledSchemaPropertyId } from '@platejs/plite/internal';
import merge from 'lodash/merge.js';

import type { BaseEditor, PlateSchemaIdentity } from '../../lib/editor';
import type {
  AnyPluginConfig,
  AnyBasePlugin,
  BasePlugin,
  NodeComponents,
  PluginReference,
  PluginReferenceDocumentType,
  PluginSchemaContext,
  PluginSchemaDeclaration,
  PluginSchemaMark,
  PluginSchemaOwn,
  PluginSchemaReferences,
} from '../../lib/plugin';
import { getEditorPlugin } from '../../lib/plugin/getEditorPlugin';
import {
  freezePluginDescriptorValue,
  isNominalPluginReference,
} from '../utils/mergePlugins';
import {
  clearPlateRuntimeCandidate,
  getPlateRuntimeCandidate,
  type PlateRuntime,
} from './plateRuntime';

export type CompiledPlateModelBinding = Readonly<{
  elementPropertyKeys: readonly string[];
  elementType: string | null;
  isDecoration: boolean;
  kind: 'element' | 'mark' | 'none';
  pluginKey: string;
  propertyIds: readonly string[];
  referencedPluginKeys: readonly string[];
  textPropertyId: string | null;
  type: string;
}>;

export type CompiledPlateModel = Readonly<{
  bindings: readonly CompiledPlateModelBinding[];
  byKey: Readonly<Record<string, CompiledPlateModelBinding | undefined>>;
  byType: Readonly<Record<string, CompiledPlateModelBinding | undefined>>;
  contribution: EditorSchemaContribution;
  revision: object;
}>;

export type PlateModelPublication = Readonly<{
  apiByPlugin: Readonly<
    Record<string, Readonly<Record<string, unknown>> | undefined>
  >;
  components: Readonly<NodeComponents>;
  identity: PlateSchemaIdentity | null;
  inputRules: PlateRuntime['inputRules'];
  model: CompiledPlateModel;
  pluginCache: PlateRuntime['pluginCache'];
  pluginList: readonly AnyBasePlugin[];
  plugins: Readonly<Record<string, AnyBasePlugin>>;
  shortcuts: PlateRuntime['shortcuts'];
}>;

const PLATE_BLOCK_CONTENT_SCHEMA_GROUP = 'plate:block-content';

export const createPlateBlockContent = (options?: SchemaContentOptions) =>
  schema.content.group(PLATE_BLOCK_CONTENT_SCHEMA_GROUP, options);

const EMPTY_MODEL: CompiledPlateModel = Object.freeze({
  bindings: Object.freeze([]),
  byKey: Object.freeze(Object.create(null)),
  byType: Object.freeze(Object.create(null)),
  contribution: Object.freeze({}),
  revision: Object.freeze({}),
});

const PLATE_MODEL_PUBLICATIONS = new WeakMap<Editor, PlateModelPublication>();

const candidateModels = new WeakMap<BaseEditor, CompiledPlateModel>();
const candidatePluginApis = new WeakMap<
  BaseEditor,
  Readonly<Record<string, Readonly<Record<string, unknown>> | undefined>>
>();
const resolvingPlugins = new WeakMap<BaseEditor, AnyBasePlugin>();
const resolvedTargetBindings = new WeakMap<
  BaseEditor,
  WeakMap<object, ResolvedPluginTargetBinding>
>();
const candidatePluginSets = new WeakMap<
  BaseEditor,
  Readonly<{
    byKey: Readonly<Record<string, AnyBasePlugin | undefined>>;
    list: readonly AnyBasePlugin[];
  }>
>();

type PendingReference = Readonly<{
  owner: string;
  target: string;
}>;

type ResolvedPluginTargetBinding = Readonly<{
  keys: readonly string[];
  missingKeys: readonly string[];
  plugins: readonly AnyBasePlugin[];
  types: readonly string[];
}>;

const compileResolvedPluginTargetBinding = (
  editor: BaseEditor,
  plugin: Pick<AnyBasePlugin, 'key' | 'targetPluginKeys'>
): ResolvedPluginTargetBinding => {
  let editorBindings = resolvedTargetBindings.get(editor);

  if (!editorBindings) {
    editorBindings = new WeakMap();
    resolvedTargetBindings.set(editor, editorBindings);
  }

  const installed = new Map(
    getCompiledPlatePluginList(editor).map((candidate) => [
      candidate.key,
      candidate,
    ])
  );
  const plugins: AnyBasePlugin[] = [];
  const missingKeys: string[] = [];
  const seen = new Set<string>();

  for (const key of plugin.targetPluginKeys) {
    if (seen.has(key)) continue;
    seen.add(key);
    const targetPlugin = installed.get(key);

    if (!targetPlugin || targetPlugin.enabled === false) {
      missingKeys.push(key);
      continue;
    }

    plugins.push(targetPlugin);
  }

  const binding = Object.freeze({
    keys: Object.freeze(plugins.map(({ key }) => key)),
    missingKeys: Object.freeze(missingKeys),
    plugins: Object.freeze(plugins),
    types: Object.freeze(plugins.map(({ type }) => type)),
  });

  editorBindings.set(plugin as object, binding);

  return binding;
};

/** Internal compiled view of a plugin's weak, optional target allowlist. */
export const getResolvedPluginTargetBinding = (
  editor: BaseEditor,
  plugin: Pick<AnyBasePlugin, 'key' | 'targetPluginKeys'>
): ResolvedPluginTargetBinding => {
  const cached = resolvedTargetBindings.get(editor)?.get(plugin as object);

  return cached ?? compileResolvedPluginTargetBinding(editor, plugin);
};

/** @internal Resolve the installed document types owned by one target binding. */
export const getResolvedPluginTargetTypes = (
  editor: BaseEditor,
  plugin: Pick<AnyBasePlugin, 'key' | 'targetPluginKeys'>
) => getResolvedPluginTargetBinding(editor, plugin).types;

const applyResolvedTargetInjection = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
) => {
  const targetPluginToInject = plugin.inject?.targetPluginToInject;

  if (!targetPluginToInject) return;
  const binding = getResolvedPluginTargetBinding(editor, plugin);

  if (binding.keys.length === 0) return;
  const injectedPlugins: Record<string, Partial<AnyBasePlugin>> = Object.create(
    null
  );

  binding.keys.forEach((targetPlugin) => {
    injectedPlugins[targetPlugin] = withResolvingPlatePlugin(
      editor,
      plugin,
      () =>
        targetPluginToInject({
          ...getEditorPlugin(editor, plugin),
          targetPlugin,
        })
    );
  });

  plugin.inject = plugin.inject || {};
  plugin.inject.plugins = merge(
    Object.create(null),
    plugin.inject.plugins,
    injectedPlugins
  );
};

const assertType = (plugin: AnyBasePlugin) => {
  if (typeof plugin.type !== 'string' || plugin.type.length === 0) {
    throw new Error(
      `Plate plugin "${plugin.key}" type must be a non-empty string.`
    );
  }
};

const resolveReference = <const TPlugin extends PluginReference>(
  editor: BaseEditor,
  owner: Readonly<{ key: string }>,
  reference: TPlugin,
  references: PendingReference[]
): PluginReferenceDocumentType<TPlugin> => {
  if (!isNominalPluginReference(reference)) {
    throw new Error(
      `Plate plugin "${owner.key}" schema references an invalid plugin descriptor.`
    );
  }

  const target = getCompiledPlatePlugin(editor, reference.key);

  if (!target) {
    throw new Error(
      `Plate plugin "${owner.key}" schema references missing or disabled plugin "${reference.key}".`
    );
  }
  if (target.type !== reference.type) {
    throw new Error(
      `Plate plugin "${owner.key}" schema reference "${reference.key}" expects type "${reference.type}" but the installed plugin owns "${target.type}".`
    );
  }

  references.push(Object.freeze({ owner: owner.key, target: target.key }));

  return reference.type;
};

type PluginReferenceTypes<TPlugins extends readonly PluginReference[]> = {
  readonly [TIndex in keyof TPlugins]: PluginReferenceDocumentType<
    TPlugins[TIndex]
  >;
};

function resolveReferences<const TPlugins extends readonly PluginReference[]>(
  editor: BaseEditor,
  owner: Readonly<{ key: string }>,
  items: TPlugins,
  references: PendingReference[]
): PluginReferenceTypes<TPlugins>;
function resolveReferences(
  editor: BaseEditor,
  owner: Readonly<{ key: string }>,
  items: readonly PluginReference[],
  references: PendingReference[]
): readonly string[];
function resolveReferences(
  editor: BaseEditor,
  owner: Readonly<{ key: string }>,
  items: readonly PluginReference[],
  references: PendingReference[]
): readonly string[] {
  return Object.freeze(
    items.map((reference) =>
      resolveReference(editor, owner, reference, references)
    )
  );
}

const resolvePluginKeys = (
  editor: BaseEditor,
  owner: Readonly<{ key: string }>,
  pluginKeys: readonly string[],
  references: PendingReference[]
) =>
  Object.freeze(
    pluginKeys.flatMap((pluginKey) => {
      const target = getCompiledPlatePlugin(editor, pluginKey);

      if (!target) return [];

      references.push(Object.freeze({ owner: owner.key, target: target.key }));

      return [target.type];
    })
  );

const evaluateDeclaration = <C extends AnyPluginConfig>(
  editor: BaseEditor,
  plugin: BasePlugin<C>,
  references: PendingReference[]
): PluginSchemaDeclaration | null => {
  const declaration = plugin.schema;

  if (!declaration) return null;
  if (typeof declaration !== 'function') return declaration;

  const targetBinding = getResolvedPluginTargetBinding(editor, plugin);
  const plugins: PluginSchemaReferences = Object.freeze({
    blockContent: createPlateBlockContent,
    elementType: <const TPlugin extends PluginReference>(reference: TPlugin) =>
      resolveReference(editor, plugin, reference, references),
    elementTypes: <const TPlugins extends readonly PluginReference[]>(
      items: TPlugins
    ) => resolveReferences(editor, plugin, items, references),
    elementTypesByKey: (pluginKeys) => {
      if (pluginKeys === targetBinding.keys) {
        targetBinding.plugins.forEach((targetPlugin) => {
          references.push(
            Object.freeze({ owner: plugin.key, target: targetPlugin.key })
          );
        });

        return targetBinding.types;
      }

      return resolvePluginKeys(editor, plugin, pluginKeys, references);
    },
  });
  const own: PluginSchemaOwn = Object.freeze({
    elementProperty: (value, options: SchemaElementPropertyOptions) =>
      schema.elementProperty(plugin.type, value, options),
    textProperty: (value, options?: SchemaTextPropertyOptions) =>
      schema.textProperty(plugin.type, value, options),
  });
  const context: PluginSchemaContext<C> = Object.freeze({
    key: plugin.key,
    options: plugin.options,
    own,
    plugins,
    targetPluginKeys: targetBinding.keys,
    type: plugin.type,
  });

  return freezePluginDescriptorValue(declaration(context));
};

const compileMark = (type: string, mark: PluginSchemaMark): SchemaProperty => {
  if ('property' in mark) {
    const { property: descriptor, ...options } = mark;

    return schema.textProperty(type, descriptor, {
      typeChange: 'preserve-if-allowed',
      ...options,
    });
  }

  return schema.textProperty(type, mark, {
    typeChange: 'preserve-if-allowed',
  });
};

export const compilePlateModel = (editor: BaseEditor): CompiledPlateModel => {
  const pluginList = getCompiledPlatePluginList(editor);
  const references: PendingReference[] = [];
  const declarations = new Map<string, PluginSchemaDeclaration | null>();

  pluginList.forEach(assertType);
  pluginList.forEach((plugin) => {
    compileResolvedPluginTargetBinding(editor, plugin);
  });
  pluginList.forEach((plugin) => {
    applyResolvedTargetInjection(editor, plugin);
  });
  pluginList.forEach((plugin) => {
    declarations.set(
      plugin.key,
      evaluateDeclaration(editor, plugin, references)
    );
  });

  const elements: Record<string, SchemaElement> = Object.create(null);
  const bindingsByElementType = new Map<string, string>();
  const properties: SchemaProperty[] = [];
  const bindings = pluginList.map((plugin) => {
    const declaration = declarations.get(plugin.key) ?? null;
    if (
      declaration &&
      'element' in declaration &&
      declaration.element &&
      'mark' in declaration &&
      declaration.mark
    ) {
      throw new Error(
        `Plate plugin "${plugin.key}" cannot declare both schema.element and schema.mark.`
      );
    }
    const element =
      declaration && 'element' in declaration
        ? (declaration.element ?? null)
        : null;
    const mark =
      declaration && 'mark' in declaration ? (declaration.mark ?? null) : null;
    const declaredProperties = Object.freeze([
      ...(declaration?.properties ?? []),
    ]);
    const elementPropertyKeys = Object.freeze(
      Object.keys(element?.properties ?? {})
    );
    const elementPropertyIds = Object.freeze(
      elementPropertyKeys.map((key) =>
        getCompiledSchemaPropertyId({
          key,
          placement: 'element',
          target: Object.freeze({ kind: 'type', type: plugin.type }),
        })
      )
    );
    let textProperty: SchemaProperty | null = null;

    if (element) {
      if (Object.hasOwn(elements, plugin.type)) {
        const firstOwner = bindingsByElementType.get(plugin.type);

        throw new Error(
          `Plate plugins "${firstOwner}" and "${plugin.key}" both declare element type "${plugin.type}".`
        );
      }
      const { topLevel, ...schemaElement } = element as typeof element & {
        topLevel?: boolean;
      };
      const isInline =
        schemaElement.inline === true ||
        schemaElement.void === 'inline' ||
        schemaElement.void === 'markable-inline';
      const groups = [
        ...(schemaElement.groups ?? []),
        ...(!isInline && topLevel !== false
          ? [PLATE_BLOCK_CONTENT_SCHEMA_GROUP]
          : []),
      ];

      elements[plugin.type] = Object.freeze({
        ...schemaElement,
        ...(groups.length > 0
          ? { groups: Object.freeze([...new Set(groups)]) }
          : {}),
      });
      bindingsByElementType.set(plugin.type, plugin.key);
    }
    if (mark) {
      textProperty = compileMark(plugin.type, mark);
      properties.push(textProperty);
    }
    properties.push(...declaredProperties);

    return Object.freeze({
      elementPropertyKeys: Object.freeze([
        ...elementPropertyKeys,
        ...declaredProperties.flatMap((property) =>
          property.placement === 'element' && typeof property.key === 'string'
            ? [property.key]
            : []
        ),
      ]),
      elementType: element ? plugin.type : null,
      isDecoration: plugin.render.isDecoration ?? true,
      kind: element ? 'element' : mark ? 'mark' : 'none',
      pluginKey: plugin.key,
      propertyIds: Object.freeze([
        ...elementPropertyIds,
        ...declaredProperties.map((property) =>
          getCompiledSchemaPropertyId(property)
        ),
      ]),
      referencedPluginKeys: Object.freeze(
        references
          .filter((reference) => reference.owner === plugin.key)
          .map((reference) => reference.target)
      ),
      textPropertyId: textProperty
        ? getCompiledSchemaPropertyId(textProperty)
        : null,
      type: plugin.type,
    }) satisfies CompiledPlateModelBinding;
  });
  const byKey: Record<string, CompiledPlateModelBinding> = Object.create(null);
  const byType: Record<string, CompiledPlateModelBinding> = Object.create(null);

  for (const binding of bindings) {
    byKey[binding.pluginKey] = binding;
  }

  for (const binding of bindings) {
    if (binding.kind === 'none') continue;
    const existing = byType[binding.type];

    if (existing) {
      throw new Error(
        `Plate plugins "${existing.pluginKey}" and "${binding.pluginKey}" both own schema type "${binding.type}".`
      );
    }
    byType[binding.type] = binding;
  }
  for (const reference of references) {
    const target = byKey[reference.target];

    if (target?.kind !== 'element') {
      throw new Error(
        `Plate plugin "${reference.owner}" schema reference "${reference.target}" is not an element plugin.`
      );
    }
  }

  return Object.freeze({
    bindings: Object.freeze(bindings),
    byKey: Object.freeze(byKey),
    byType: Object.freeze(byType),
    contribution: Object.freeze({
      elements: Object.freeze(elements),
      groups: Object.freeze({
        [PLATE_BLOCK_CONTENT_SCHEMA_GROUP]: Object.freeze({}),
      }),
      properties: Object.freeze(properties),
    }),
    revision: Object.freeze({}),
  });
};

export const attachPlateModelPublication = (
  editor: BaseEditor,
  publication: PlateModelPublication
) => {
  PLATE_MODEL_PUBLICATIONS.set(editor, publication);
  clearPlateRuntimeCandidate(editor);
};

export const clearPlateModelPublication = (editor: Editor<any, any>) => {
  PLATE_MODEL_PUBLICATIONS.delete(editor as Editor);
};

export const getPlateModelPublication = (editor: Editor<any, any>) =>
  PLATE_MODEL_PUBLICATIONS.get(editor as Editor);

/** @internal Runtime projection compiled from the installed Plate model. */
export const getPlateRuntime = (editor: Editor<any, any>): PlateRuntime => {
  const publication = getPlateModelPublication(editor);

  if (publication) return publication;
  const candidate = getPlateRuntimeCandidate(editor);

  if (candidate) return candidate;
  throw new Error('Plate runtime is not installed.');
};

/** @internal Whether the editor owns an installed or compiling Plate runtime. */
export const hasPlateRuntime = (editor: Editor<any, any>) =>
  getPlateRuntimeCandidate(editor) !== undefined ||
  getPlateModelPublication(editor) !== undefined;

export const getCompiledPlateModel = (editor: BaseEditor) =>
  candidateModels.get(editor) ??
  getPlateModelPublication(editor)?.model ??
  EMPTY_MODEL;

export const getCompiledPlateModelBinding = (
  editor: BaseEditor,
  plugin: AnyBasePlugin | PluginReference
) => getCompiledPlateModel(editor).byKey[plugin.key];

export const getCompiledPlatePluginList = (editor: BaseEditor) =>
  candidatePluginSets.get(editor)?.list ?? getPlateRuntime(editor).pluginList;

export const hasCompiledPlatePluginCandidate = (editor: BaseEditor) =>
  candidatePluginSets.has(editor);

export const getCompiledPlatePlugin = (editor: BaseEditor, key: string) =>
  candidatePluginSets.has(editor)
    ? candidatePluginSets.get(editor)!.byKey[key]
    : getPlateRuntime(editor).plugins[key];

export const getCompiledPlatePluginApi = (editor: BaseEditor, key: string) =>
  candidatePluginApis.has(editor)
    ? candidatePluginApis.get(editor)![key]
    : getPlateModelPublication(editor)?.apiByPlugin[key];

export const hasCompiledPlatePluginApiCandidate = (editor: BaseEditor) =>
  candidatePluginApis.has(editor);

export const isResolvingPlatePlugin = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
) => resolvingPlugins.get(editor) === plugin;

export const setCompiledPlatePluginCandidate = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
) => {
  const candidate = candidatePluginSets.get(editor);

  if (!candidate) return;
  const list = [...candidate.list];
  const index = list.findIndex(({ key }) => key === plugin.key);

  if (index === -1) list.push(plugin);
  else list[index] = plugin;
  const byKey: Record<string, AnyBasePlugin> = Object.assign(
    Object.create(null),
    candidate.byKey,
    { [plugin.key]: plugin }
  );

  candidatePluginSets.set(
    editor,
    Object.freeze({
      byKey: Object.freeze(byKey),
      list: Object.freeze(list),
    })
  );
};

export const withCompiledPlatePluginCandidate = <T>(
  editor: BaseEditor,
  list: readonly AnyBasePlugin[],
  run: () => T
): T => {
  const previous = candidatePluginSets.get(editor);
  const byKey: Record<string, AnyBasePlugin> = Object.create(null);

  list.forEach((plugin) => {
    byKey[plugin.key] = plugin;
  });
  candidatePluginSets.set(
    editor,
    Object.freeze({
      byKey: Object.freeze(byKey),
      list: Object.freeze([...list]),
    })
  );
  try {
    return run();
  } finally {
    if (previous) candidatePluginSets.set(editor, previous);
    else candidatePluginSets.delete(editor);
  }
};

export const withCompiledPlateModelCandidate = <T>(
  editor: BaseEditor,
  model: CompiledPlateModel,
  run: () => T
): T => {
  const previous = candidateModels.get(editor);

  candidateModels.set(editor, model);
  try {
    return run();
  } finally {
    if (previous) candidateModels.set(editor, previous);
    else candidateModels.delete(editor);
  }
};

export const withCompiledPlatePluginApiCandidate = <T>(
  editor: BaseEditor,
  apiByPlugin: Readonly<
    Record<string, Readonly<Record<string, unknown>> | undefined>
  >,
  run: () => T
): T => {
  const previous = candidatePluginApis.get(editor);

  candidatePluginApis.set(editor, apiByPlugin);
  try {
    return run();
  } finally {
    if (previous) candidatePluginApis.set(editor, previous);
    else candidatePluginApis.delete(editor);
  }
};

export const withResolvingPlatePlugin = <T>(
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  run: () => T
): T => {
  const previous = resolvingPlugins.get(editor);

  resolvingPlugins.set(editor, plugin);
  try {
    return run();
  } finally {
    if (previous) resolvingPlugins.set(editor, previous);
    else resolvingPlugins.delete(editor);
  }
};
