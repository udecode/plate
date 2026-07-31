import {
  type EditorSchemaContribution,
  type SchemaContentRootContribution,
  type SchemaElementPropertyOptions,
  type SchemaContentOptions,
  type SchemaElement,
  type SchemaProperty,
  type SchemaTextPropertyOptions,
  schema,
} from '@platejs/plite';
import { getCompiledSchemaPropertyId } from '@platejs/plite/internal';

import type { BaseEditor, PlateSchemaIdentity } from '../../lib/editor';
import type {
  AnyBasePluginDefinition,
  AnyBasePlugin,
  BasePlugin,
  DefinitionOf,
  NodeComponents,
  PluginReference,
  PluginReferenceDocumentType,
  PluginSchemaContext,
  PluginSchemaDeclaration,
  PluginSchemaMark,
  PluginSchemaOwn,
  PluginSchemaReferences,
} from '../../lib/plugin';
import {
  freezePluginDescriptorValue,
  isNominalPluginReference,
} from '../utils/mergePlugins';
import {
  clearPlateRuntimeCandidate,
  getPlateRuntimeCandidate,
  getPlateRuntimeOwner,
  type PlateRuntime,
} from './plateRuntime';

export type CompiledPlateModelBinding = Readonly<{
  elementPropertyKeys: readonly string[];
  elementType: string | null;
  isDecoration: boolean;
  kind: 'element' | 'mark' | 'none';
  pluginName: string;
  properties: readonly SchemaProperty[];
  propertyIds: readonly string[];
  referencedPluginNames: readonly string[];
  textPropertyId: string | null;
  type: string;
}>;

export type CompiledPlateModel = Readonly<{
  bindings: readonly CompiledPlateModelBinding[];
  byName: Readonly<Record<string, CompiledPlateModelBinding | undefined>>;
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
  shortcutTable: PlateRuntime['shortcutTable'];
  shortcuts: PlateRuntime['shortcuts'];
}>;

const PLATE_BLOCK_CONTENT_SCHEMA_GROUP = 'plate:block-content';

export const createPlateBlockContent = (options?: SchemaContentOptions) =>
  schema.content.group(PLATE_BLOCK_CONTENT_SCHEMA_GROUP, options);

const EMPTY_MODEL: CompiledPlateModel = Object.freeze({
  bindings: Object.freeze([]),
  byName: Object.freeze(Object.create(null)),
  byType: Object.freeze(Object.create(null)),
  contribution: Object.freeze({}),
  revision: Object.freeze({}),
});

const PLATE_MODEL_PUBLICATIONS = new WeakMap<object, PlateModelPublication>();

const getPlateOwner = (editor: object) => getPlateRuntimeOwner(editor);

const candidateModels = new WeakMap<object, CompiledPlateModel>();
const candidatePluginApis = new WeakMap<
  object,
  Readonly<Record<string, Readonly<Record<string, unknown>> | undefined>>
>();
const resolvingPlugins = new WeakMap<object, AnyBasePlugin>();
const resolvedTargetBindings = new WeakMap<
  object,
  WeakMap<object, ResolvedPluginTargetBinding>
>();
const candidatePluginSets = new WeakMap<
  object,
  Readonly<{
    byName: Readonly<Record<string, AnyBasePlugin | undefined>>;
    list: readonly AnyBasePlugin[];
  }>
>();

type PendingReference = Readonly<{
  owner: string;
  target: string;
}>;

type ResolvedPluginTargetBinding = Readonly<{
  missingNames: readonly string[];
  names: readonly string[];
  plugins: readonly AnyBasePlugin[];
  types: readonly string[];
}>;

const compileResolvedPluginTargetBinding = (
  editor: BaseEditor,
  plugin: Pick<AnyBasePlugin, 'name' | 'targetPluginNames'>
): ResolvedPluginTargetBinding => {
  const owner = getPlateOwner(editor);
  let editorBindings = resolvedTargetBindings.get(owner);

  if (!editorBindings) {
    editorBindings = new WeakMap();
    resolvedTargetBindings.set(owner, editorBindings);
  }

  const installed = new Map(
    getCompiledPlatePluginList(editor).map((candidate) => [
      candidate.name,
      candidate,
    ])
  );
  const plugins: AnyBasePlugin[] = [];
  const missingNames: string[] = [];
  const seen = new Set<string>();

  for (const pluginName of plugin.targetPluginNames) {
    if (seen.has(pluginName)) continue;
    seen.add(pluginName);
    const targetPlugin = installed.get(pluginName);

    if (!targetPlugin || targetPlugin.enabled === false) {
      missingNames.push(pluginName);
      continue;
    }

    plugins.push(targetPlugin);
  }

  const binding = Object.freeze({
    missingNames: Object.freeze(missingNames),
    names: Object.freeze(plugins.map(({ name }) => name)),
    plugins: Object.freeze(plugins),
    types: Object.freeze(plugins.map(({ type }) => type)),
  });

  editorBindings.set(plugin as object, binding);

  return binding;
};

/** Internal compiled view of a plugin's weak, optional target allowlist. */
export const getResolvedPluginTargetBinding = (
  editor: BaseEditor,
  plugin: Pick<AnyBasePlugin, 'name' | 'targetPluginNames'>
): ResolvedPluginTargetBinding => {
  const cached = resolvedTargetBindings
    .get(getPlateOwner(editor))
    ?.get(plugin as object);

  return cached ?? compileResolvedPluginTargetBinding(editor, plugin);
};

/** @internal Resolve the installed document types owned by one target binding. */
export const getResolvedPluginTargetTypes = (
  editor: BaseEditor,
  plugin: Pick<AnyBasePlugin, 'name' | 'targetPluginNames'>
) => getResolvedPluginTargetBinding(editor, plugin).types;

const assertType = (plugin: AnyBasePlugin) => {
  if (typeof plugin.type !== 'string' || plugin.type.length === 0) {
    throw new Error(
      `Plate plugin "${plugin.name}" type must be a non-empty string.`
    );
  }
};

const resolveReference = <const TPlugin extends PluginReference>(
  editor: BaseEditor,
  owner: Readonly<{ name: string }>,
  reference: TPlugin,
  references: PendingReference[]
): PluginReferenceDocumentType<TPlugin> => {
  if (!isNominalPluginReference(reference)) {
    throw new Error(
      `Plate plugin "${owner.name}" schema references an invalid plugin descriptor.`
    );
  }

  const target = getCompiledPlatePlugin(editor, reference.name);

  if (!target) {
    throw new Error(
      `Plate plugin "${owner.name}" schema references missing or disabled plugin "${reference.name}".`
    );
  }
  if (target.type !== reference.type) {
    throw new Error(
      `Plate plugin "${owner.name}" schema reference "${reference.name}" expects type "${reference.type}" but the installed plugin owns "${target.type}".`
    );
  }

  references.push(Object.freeze({ owner: owner.name, target: target.name }));

  return reference.type;
};

type PluginReferenceTypes<TPlugins extends readonly PluginReference[]> = {
  readonly [TIndex in keyof TPlugins]: PluginReferenceDocumentType<
    TPlugins[TIndex]
  >;
};

function resolveReferences<const TPlugins extends readonly PluginReference[]>(
  editor: BaseEditor,
  owner: Readonly<{ name: string }>,
  items: TPlugins,
  references: PendingReference[]
): PluginReferenceTypes<TPlugins>;
function resolveReferences(
  editor: BaseEditor,
  owner: Readonly<{ name: string }>,
  items: readonly PluginReference[],
  references: PendingReference[]
): readonly string[];
function resolveReferences(
  editor: BaseEditor,
  owner: Readonly<{ name: string }>,
  items: readonly PluginReference[],
  references: PendingReference[]
): readonly string[] {
  return Object.freeze(
    items.map((reference) =>
      resolveReference(editor, owner, reference, references)
    )
  );
}

const resolvePluginNames = (
  editor: BaseEditor,
  owner: Readonly<{ name: string }>,
  pluginNames: readonly string[],
  references: PendingReference[]
) =>
  Object.freeze(
    pluginNames.flatMap((pluginName) => {
      const target = getCompiledPlatePlugin(editor, pluginName);

      if (!target) return [];

      references.push(
        Object.freeze({ owner: owner.name, target: target.name })
      );

      return [target.type];
    })
  );

const isPluginSchemaDeclaration = (
  value: unknown
): value is PluginSchemaDeclaration =>
  typeof value === 'object' && value !== null;

const evaluateDeclaration = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  references: PendingReference[]
): PluginSchemaDeclaration | null => {
  const declaration = plugin.schema;

  if (!declaration) return null;
  if (typeof declaration !== 'function') {
    if (!isPluginSchemaDeclaration(declaration)) {
      throw new Error(
        `Plate plugin "${plugin.name}" schema must be a declaration or factory.`
      );
    }

    return declaration;
  }

  const targetBinding = getResolvedPluginTargetBinding(editor, plugin);
  const plugins: PluginSchemaReferences = Object.freeze({
    blockContent: createPlateBlockContent,
    elementType: <const TPlugin extends PluginReference>(reference: TPlugin) =>
      resolveReference(editor, plugin, reference, references),
    elementTypes: <const TPlugins extends readonly PluginReference[]>(
      items: TPlugins
    ) => resolveReferences(editor, plugin, items, references),
    elementTypesByName: (pluginNames) => {
      if (pluginNames === targetBinding.names) {
        targetBinding.plugins.forEach((targetPlugin) => {
          references.push(
            Object.freeze({ owner: plugin.name, target: targetPlugin.name })
          );
        });

        return targetBinding.types;
      }

      return resolvePluginNames(editor, plugin, pluginNames, references);
    },
  });
  const own: PluginSchemaOwn = Object.freeze({
    contentRoot: (content, options) =>
      Object.freeze({
        content,
        ownership: options.ownership,
        slot: plugin.type,
        target: options.target,
      }),
    elementProperty: (value, options: SchemaElementPropertyOptions) =>
      schema.elementProperty(plugin.type, value, options),
    textProperty: (value, options?: SchemaTextPropertyOptions) =>
      schema.textProperty(plugin.type, value, options),
  });
  const context: PluginSchemaContext<AnyBasePluginDefinition> = Object.freeze({
    initialState: plugin.initialState,
    name: plugin.name,
    own,
    plugins,
    targetPluginNames: targetBinding.names,
    type: plugin.type,
  });

  const result = Reflect.apply(declaration, undefined, [context]);

  if (!isPluginSchemaDeclaration(result)) {
    throw new Error(
      `Plate plugin "${plugin.name}" schema factory must return a declaration.`
    );
  }

  return freezePluginDescriptorValue(result);
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
    declarations.set(
      plugin.name,
      evaluateDeclaration(editor, plugin, references)
    );
  });

  const elements: Record<string, SchemaElement> = Object.create(null);
  const bindingsByElementType = new Map<string, string>();
  const contentRoots: SchemaContentRootContribution[] = [];
  const properties: SchemaProperty[] = [];
  const bindings = pluginList.map((plugin) => {
    const declaration = declarations.get(plugin.name) ?? null;
    if (
      declaration &&
      'element' in declaration &&
      declaration.element &&
      'mark' in declaration &&
      declaration.mark
    ) {
      throw new Error(
        `Plate plugin "${plugin.name}" cannot declare both schema.element and schema.mark.`
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
    const declaredContentRoots = Object.freeze([
      ...(declaration?.contentRoots ?? []),
    ]);
    const elementPropertyKeys = Object.freeze(
      Object.keys(element?.properties ?? {})
    );
    const elementProperties = Object.freeze(
      Object.entries(element?.properties ?? {}).map(([key, value]) =>
        schema.elementProperty(key, value, {
          target: Object.freeze({ kind: 'type', type: plugin.type }),
        })
      )
    );
    const elementPropertyIds = Object.freeze(
      elementProperties.map(getCompiledSchemaPropertyId)
    );
    let textProperty: SchemaProperty | null = null;

    if (element) {
      if (Object.hasOwn(elements, plugin.type)) {
        const firstOwner = bindingsByElementType.get(plugin.type);

        throw new Error(
          `Plate plugins "${firstOwner}" and "${plugin.name}" both declare element type "${plugin.type}".`
        );
      }
      const { blockContent, ...schemaElement } = element as typeof element & {
        blockContent?: boolean;
      };
      const isInline =
        schemaElement.inline === true ||
        schemaElement.void === 'inline' ||
        schemaElement.void === 'markable-inline';
      const groups = [
        ...(schemaElement.groups ?? []),
        ...(!isInline && blockContent !== false
          ? [PLATE_BLOCK_CONTENT_SCHEMA_GROUP]
          : []),
      ];

      elements[plugin.type] = Object.freeze({
        ...schemaElement,
        ...(groups.length > 0
          ? { groups: Object.freeze([...new Set(groups)]) }
          : {}),
      });
      bindingsByElementType.set(plugin.type, plugin.name);
    }
    if (mark) {
      textProperty = compileMark(plugin.type, mark);
      properties.push(textProperty);
    }
    properties.push(...declaredProperties);
    contentRoots.push(...declaredContentRoots);

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
      pluginName: plugin.name,
      properties: Object.freeze([
        ...elementProperties,
        ...declaredProperties,
        ...(textProperty ? [textProperty] : []),
      ]),
      propertyIds: Object.freeze([
        ...elementPropertyIds,
        ...declaredProperties.map((property) =>
          getCompiledSchemaPropertyId(property)
        ),
      ]),
      referencedPluginNames: Object.freeze(
        references
          .filter((reference) => reference.owner === plugin.name)
          .map((reference) => reference.target)
      ),
      textPropertyId: textProperty
        ? getCompiledSchemaPropertyId(textProperty)
        : null,
      type: plugin.type,
    }) satisfies CompiledPlateModelBinding;
  });
  const byName: Record<string, CompiledPlateModelBinding> = Object.create(null);
  const byType: Record<string, CompiledPlateModelBinding> = Object.create(null);

  for (const binding of bindings) {
    byName[binding.pluginName] = binding;
  }

  for (const binding of bindings) {
    if (binding.kind === 'none') continue;
    const existing = byType[binding.type];

    if (existing) {
      throw new Error(
        `Plate plugins "${existing.pluginName}" and "${binding.pluginName}" both own schema type "${binding.type}".`
      );
    }
    byType[binding.type] = binding;
  }
  for (const reference of references) {
    const target = byName[reference.target];

    if (target?.kind !== 'element') {
      throw new Error(
        `Plate plugin "${reference.owner}" schema reference "${reference.target}" is not an element plugin.`
      );
    }
  }

  return Object.freeze({
    bindings: Object.freeze(bindings),
    byName: Object.freeze(byName),
    byType: Object.freeze(byType),
    contribution: Object.freeze({
      contentRoots: Object.freeze(contentRoots),
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
  editor: object,
  publication: PlateModelPublication
) => {
  PLATE_MODEL_PUBLICATIONS.set(getPlateOwner(editor), publication);
  clearPlateRuntimeCandidate(editor);
};

export const clearPlateModelPublication = (editor: object) => {
  PLATE_MODEL_PUBLICATIONS.delete(getPlateOwner(editor));
};

export const getPlateModelPublication = (editor: object) =>
  PLATE_MODEL_PUBLICATIONS.get(getPlateOwner(editor));

/** @internal Runtime projection compiled from the installed Plate model. */
export const getPlateRuntime = (editor: object): PlateRuntime => {
  const publication = getPlateModelPublication(editor);

  if (publication) return publication;
  const candidate = getPlateRuntimeCandidate(editor);

  if (candidate) return candidate;
  throw new Error('Plate runtime is not installed.');
};

/** @internal Whether the editor owns an installed or compiling Plate runtime. */
export const hasPlateRuntime = (editor: object) =>
  getPlateRuntimeCandidate(editor) !== undefined ||
  getPlateModelPublication(editor) !== undefined;

export const getCompiledPlateModel = (editor: object) =>
  candidateModels.get(getPlateOwner(editor)) ??
  getPlateModelPublication(editor)?.model ??
  EMPTY_MODEL;

export const getCompiledPlateModelBinding = (
  editor: object,
  plugin: Readonly<{ name: string }>
) => getCompiledPlateModel(editor).byName[plugin.name];

export const getCompiledPlatePluginList = (editor: object) =>
  candidatePluginSets.get(getPlateOwner(editor))?.list ??
  getPlateRuntime(editor).pluginList;

export const hasCompiledPlatePluginCandidate = (editor: object) =>
  candidatePluginSets.has(getPlateOwner(editor));

export function getCompiledPlatePlugin<
  P extends AnyBasePlugin & PluginReference,
>(editor: object, plugin: P): BasePlugin<DefinitionOf<P>> | undefined;
export function getCompiledPlatePlugin(
  editor: object,
  pluginName: string
): AnyBasePlugin | undefined;
export function getCompiledPlatePlugin(
  editor: object,
  plugin: string | Readonly<{ name: string }>
): unknown {
  const owner = getPlateOwner(editor);
  const pluginName = typeof plugin === 'string' ? plugin : plugin.name;

  return candidatePluginSets.has(owner)
    ? candidatePluginSets.get(owner)!.byName[pluginName]
    : getPlateRuntime(editor).plugins[pluginName];
}

export const getCompiledPlatePluginName = (editor: object, type: string) =>
  getPlateRuntime(editor).pluginCache.node.types[type];

export const getCompiledPlatePluginByType = (
  editor: object,
  type: string
): AnyBasePlugin | undefined => {
  const name = getCompiledPlatePluginName(editor, type);

  return name ? getCompiledPlatePlugin(editor, name) : undefined;
};

export const getCompiledPlateContainerTypes = (editor: object) =>
  getPlateRuntime(editor).pluginCache.node.containerTypes.map(
    (name) => getCompiledPlatePlugin(editor, name)?.type ?? name
  );

export const getCompiledPlatePluginApi = (
  editor: object,
  pluginName: string
) => {
  const owner = getPlateOwner(editor);

  return candidatePluginApis.has(owner)
    ? candidatePluginApis.get(owner)![pluginName]
    : getPlateModelPublication(editor)?.apiByPlugin[pluginName];
};

export const hasCompiledPlatePluginApiCandidate = (editor: object) =>
  candidatePluginApis.has(getPlateOwner(editor));

export const isResolvingPlatePlugin = (editor: object, plugin: AnyBasePlugin) =>
  resolvingPlugins.get(getPlateOwner(editor)) === plugin;

export const setCompiledPlatePluginCandidate = (
  editor: object,
  plugin: AnyBasePlugin
) => {
  const owner = getPlateOwner(editor);
  const candidate = candidatePluginSets.get(owner);

  if (!candidate) return;
  const list = [...candidate.list];
  const index = list.findIndex(({ name }) => name === plugin.name);

  if (index === -1) list.push(plugin);
  else list[index] = plugin;
  const byName: Record<string, AnyBasePlugin> = Object.assign(
    Object.create(null),
    candidate.byName,
    { [plugin.name]: plugin }
  );

  candidatePluginSets.set(
    owner,
    Object.freeze({
      byName: Object.freeze(byName),
      list: Object.freeze(list),
    })
  );
};

export const withCompiledPlatePluginCandidate = <T>(
  editor: object,
  list: readonly AnyBasePlugin[],
  run: () => T
): T => {
  const owner = getPlateOwner(editor);
  const previous = candidatePluginSets.get(owner);
  const byName: Record<string, AnyBasePlugin> = Object.create(null);

  list.forEach((plugin) => {
    byName[plugin.name] = plugin;
  });
  candidatePluginSets.set(
    owner,
    Object.freeze({
      byName: Object.freeze(byName),
      list: Object.freeze([...list]),
    })
  );
  try {
    return run();
  } finally {
    if (previous) candidatePluginSets.set(owner, previous);
    else candidatePluginSets.delete(owner);
  }
};

export const withCompiledPlateModelCandidate = <T>(
  editor: object,
  model: CompiledPlateModel,
  run: () => T
): T => {
  const owner = getPlateOwner(editor);
  const previous = candidateModels.get(owner);

  candidateModels.set(owner, model);
  try {
    return run();
  } finally {
    if (previous) candidateModels.set(owner, previous);
    else candidateModels.delete(owner);
  }
};

export const withCompiledPlatePluginApiCandidate = <T>(
  editor: object,
  apiByPlugin: Readonly<
    Record<string, Readonly<Record<string, unknown>> | undefined>
  >,
  run: () => T
): T => {
  const owner = getPlateOwner(editor);
  const previous = candidatePluginApis.get(owner);

  candidatePluginApis.set(owner, apiByPlugin);
  try {
    return run();
  } finally {
    if (previous) candidatePluginApis.set(owner, previous);
    else candidatePluginApis.delete(owner);
  }
};

export const withResolvingPlatePlugin = <T>(
  editor: object,
  plugin: AnyBasePlugin,
  run: () => T
): T => {
  const owner = getPlateOwner(editor);
  const previous = resolvingPlugins.get(owner);

  resolvingPlugins.set(owner, plugin);
  try {
    return run();
  } finally {
    if (previous) resolvingPlugins.set(owner, previous);
    else resolvingPlugins.delete(owner);
  }
};
