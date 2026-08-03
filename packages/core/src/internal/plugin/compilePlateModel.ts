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
  PluginSchemaContext,
  PluginSchemaDeclaration,
  PluginSchemaMark,
  PluginSchemaOwn,
  PluginSchemaReferences,
} from '../../lib/plugin';
import {
  freezePluginDescriptorValue,
  getPluginSchemaFamily,
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
  name: string;
  propertyKey: string | null;
  properties: readonly SchemaProperty[];
  propertyIds: readonly string[];
  referencedNames: readonly string[];
  textPropertyId: string | null;
}>;

export type CompiledPlateModel = Readonly<{
  bindings: readonly CompiledPlateModelBinding[];
  byKey: Readonly<Record<string, CompiledPlateModelBinding | undefined>>;
  byName: Readonly<Record<string, CompiledPlateModelBinding | undefined>>;
  byType: Readonly<Record<string, CompiledPlateModelBinding | undefined>>;
  contribution: EditorSchemaContribution;
  contributions: Readonly<Record<string, EditorSchemaContribution | undefined>>;
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

/** @internal Apply the constructor default for one element identity. */
export const resolvePluginElementType = (
  plugin: Pick<AnyBasePlugin, 'name' | 'type'>
) => plugin.type ?? plugin.name;

/** @internal Apply the constructor default for one property identity. */
export const resolvePluginPropertyKey = (
  plugin: Pick<AnyBasePlugin, 'key' | 'name'>
) => plugin.key ?? plugin.name;

export const createPlateBlockContent = (options?: SchemaContentOptions) =>
  schema.content.group(PLATE_BLOCK_CONTENT_SCHEMA_GROUP, options);

const EMPTY_MODEL: CompiledPlateModel = Object.freeze({
  bindings: Object.freeze([]),
  byKey: Object.freeze(Object.create(null)),
  byName: Object.freeze(Object.create(null)),
  byType: Object.freeze(Object.create(null)),
  contribution: Object.freeze({}),
  contributions: Object.freeze(Object.create(null)),
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
  plugin: Pick<AnyBasePlugin, 'name' | 'targetPlugins'>
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

  for (const target of plugin.targetPlugins) {
    if (typeof target !== 'string' && !isNominalPluginReference(target)) {
      throw new Error(
        `Plate plugin "${plugin.name}" targetPlugins contains an invalid plugin descriptor.`
      );
    }

    const name = typeof target === 'string' ? target : target.name;

    if (seen.has(name)) continue;
    seen.add(name);
    const targetPlugin = installed.get(name);

    if (!targetPlugin) {
      missingNames.push(name);
      continue;
    }
    if (
      typeof target !== 'string' &&
      getPluginSchemaFamily(target) !== getPluginSchemaFamily(targetPlugin)
    ) {
      throw new Error(
        `Plate plugin "${plugin.name}" targetPlugins descriptor "${name}" does not match the installed plugin family.`
      );
    }
    if (targetPlugin.enabled === false) {
      missingNames.push(name);
      continue;
    }

    plugins.push(targetPlugin);
  }

  const binding = Object.freeze({
    missingNames: Object.freeze(missingNames),
    names: Object.freeze(plugins.map(({ name }) => name)),
    plugins: Object.freeze(plugins),
    types: Object.freeze(plugins.map(({ name, type }) => type ?? name)),
  });

  editorBindings.set(plugin as object, binding);

  return binding;
};

/** Internal compiled view of a plugin's weak, optional target allowlist. */
export const getResolvedPluginTargetBinding = (
  editor: BaseEditor,
  plugin: Pick<AnyBasePlugin, 'name' | 'targetPlugins'>
): ResolvedPluginTargetBinding => {
  const cached = resolvedTargetBindings
    .get(getPlateOwner(editor))
    ?.get(plugin as object);

  return cached ?? compileResolvedPluginTargetBinding(editor, plugin);
};

/** @internal Resolve the installed document types owned by one target binding. */
export const getResolvedPluginTargetTypes = (
  editor: BaseEditor,
  plugin: Pick<AnyBasePlugin, 'name' | 'targetPlugins'>
) => getResolvedPluginTargetBinding(editor, plugin).types;

const resolveReference = <const TPlugin extends PluginReference | string>(
  editor: BaseEditor,
  owner: Readonly<{ name: string }>,
  plugin: TPlugin,
  references: PendingReference[]
): TPlugin extends Readonly<{ type: infer TType extends string }>
  ? TType
  : TPlugin extends Readonly<{ name: infer TName extends string }>
    ? TName
    : string => {
  if (typeof plugin !== 'string' && !isNominalPluginReference(plugin)) {
    throw new Error(
      `Plate plugin "${owner.name}" schema references an invalid plugin descriptor.`
    );
  }

  const name = typeof plugin === 'string' ? plugin : plugin.name;
  const target = getCompiledPlatePlugin(editor, name);

  if (!target) {
    throw new Error(
      `Plate plugin "${owner.name}" schema references missing or disabled plugin "${name}".`
    );
  }
  if (
    typeof plugin !== 'string' &&
    getPluginSchemaFamily(plugin) !== getPluginSchemaFamily(target)
  ) {
    throw new Error(
      `Plate plugin "${owner.name}" schema descriptor "${name}" does not match the installed plugin family.`
    );
  }
  references.push(Object.freeze({ owner: owner.name, target: target.name }));

  return resolvePluginElementType(target) as TPlugin extends Readonly<{
    type: infer TType extends string;
  }>
    ? TType
    : TPlugin extends Readonly<{ name: infer TName extends string }>
      ? TName
      : string;
};

type PluginReferenceTypes<
  TPlugins extends readonly (PluginReference | string)[],
> = {
  readonly [TIndex in keyof TPlugins]: TPlugins[TIndex] extends Readonly<{
    type: infer TType extends string;
  }>
    ? TType
    : TPlugins[TIndex] extends Readonly<{
          name: infer TName extends string;
        }>
      ? TName
      : string;
};

function resolveReferences<
  const TPlugins extends readonly (PluginReference | string)[],
>(
  editor: BaseEditor,
  owner: Readonly<{ name: string }>,
  items: TPlugins,
  references: PendingReference[]
): PluginReferenceTypes<TPlugins>;
function resolveReferences(
  editor: BaseEditor,
  owner: Readonly<{ name: string }>,
  items: readonly (PluginReference | string)[],
  references: PendingReference[]
): readonly string[];
function resolveReferences(
  editor: BaseEditor,
  owner: Readonly<{ name: string }>,
  items: readonly (PluginReference | string)[],
  references: PendingReference[]
): readonly string[] {
  return Object.freeze(
    items.map((reference) =>
      resolveReference(editor, owner, reference, references)
    )
  );
}

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
  const elementType = resolvePluginElementType(plugin);
  const propertyKey = resolvePluginPropertyKey(plugin);
  const plugins: PluginSchemaReferences = Object.freeze({
    blockContent: createPlateBlockContent,
    element: <const TPlugin extends PluginReference | string>(
      target: TPlugin
    ) =>
      Object.freeze({
        kind: 'type' as const,
        type: resolveReference(editor, plugin, target, references),
      }),
    elementType: <const TPlugin extends PluginReference | string>(
      target: TPlugin
    ) => resolveReference(editor, plugin, target, references),
    elementTypes: <
      const TPlugins extends readonly (PluginReference | string)[],
    >(
      items: TPlugins
    ) => resolveReferences(editor, plugin, items, references),
  });
  const own: PluginSchemaOwn = Object.freeze({
    key: propertyKey,
    type: elementType,
    contentRoot: (content, options) =>
      Object.freeze({
        content,
        ownership: options.ownership,
        slot: propertyKey,
        target: options.target,
      }),
    elementProperty: (value, options: SchemaElementPropertyOptions) =>
      schema.elementProperty(propertyKey, value, options),
    textProperty: (value, options?: SchemaTextPropertyOptions) =>
      schema.textProperty(propertyKey, value, options),
  });
  const context: PluginSchemaContext<AnyBasePluginDefinition> = Object.freeze({
    initialState: plugin.initialState,
    name: plugin.name,
    own,
    plugins,
    targetElementTypes: targetBinding.types,
  });

  const result = Reflect.apply(declaration, undefined, [context]);

  if (!isPluginSchemaDeclaration(result)) {
    throw new Error(
      `Plate plugin "${plugin.name}" schema factory must return a declaration.`
    );
  }

  return freezePluginDescriptorValue(result);
};

const compileMark = (key: string, mark: PluginSchemaMark): SchemaProperty => {
  if ('property' in mark) {
    const { property: descriptor, ...options } = mark;

    return schema.textProperty(key, descriptor, {
      typeChange: 'preserve-if-allowed',
      ...options,
    });
  }

  return schema.textProperty(key, mark, {
    typeChange: 'preserve-if-allowed',
  });
};

export const compilePlateModel = (editor: BaseEditor): CompiledPlateModel => {
  const pluginList = getCompiledPlatePluginList(editor);
  const references: PendingReference[] = [];
  const declarations = new Map<string, PluginSchemaDeclaration | null>();

  pluginList.forEach((plugin) => {
    compileResolvedPluginTargetBinding(editor, plugin);
  });
  pluginList.forEach((plugin) => {
    declarations.set(
      plugin.name,
      evaluateDeclaration(editor, plugin, references)
    );
  });
  pluginList.forEach((plugin) => {
    const targetBinding = getResolvedPluginTargetBinding(editor, plugin);

    targetBinding.plugins.forEach((targetPlugin) => {
      const declaration = declarations.get(targetPlugin.name);

      if (!declaration || !('element' in declaration) || !declaration.element) {
        throw new Error(
          `Plate plugin "${plugin.name}" targetPlugins entry "${targetPlugin.name}" does not own an element type.`
        );
      }
    });
  });
  references.forEach(({ owner, target: targetName }) => {
    const declaration = declarations.get(targetName);

    if (!declaration || !('element' in declaration) || !declaration.element) {
      throw new Error(
        `Plate plugin "${owner}" schema reference "${targetName}" does not own an element type.`
      );
    }
  });

  const elements: Record<string, SchemaElement> = Object.create(null);
  const bindingsByElementType = new Map<string, string>();
  const contentRoots: SchemaContentRootContribution[] = [];
  const properties: SchemaProperty[] = [];
  const contributions: Record<string, EditorSchemaContribution> =
    Object.create(null);
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
    const elementType = resolvePluginElementType(plugin);
    const propertyKey = resolvePluginPropertyKey(plugin);

    if (!element && plugin.type !== undefined) {
      throw new Error(
        `Plate plugin "${plugin.name}" declares \`type\` without schema.element.`
      );
    }
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
          target: Object.freeze({ kind: 'type', type: elementType }),
        })
      )
    );
    const elementPropertyIds = Object.freeze(
      elementProperties.map(getCompiledSchemaPropertyId)
    );
    let textProperty: SchemaProperty | null = null;

    if (element) {
      if (Object.hasOwn(elements, elementType)) {
        const firstOwner = bindingsByElementType.get(elementType);

        throw new Error(
          `Plate plugins "${firstOwner}" and "${plugin.name}" both declare element type "${elementType}".`
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

      elements[elementType] = Object.freeze({
        ...schemaElement,
        ...(groups.length > 0
          ? { groups: Object.freeze([...new Set(groups)]) }
          : {}),
      });
      bindingsByElementType.set(elementType, plugin.name);
    }
    if (mark) {
      textProperty = compileMark(propertyKey, mark);
      properties.push(textProperty);
    }
    const pluginProperties = Object.freeze([
      ...elementProperties,
      ...declaredProperties,
      ...(textProperty ? [textProperty] : []),
    ]);
    const schemaProperties = Object.freeze([
      ...declaredProperties,
      ...(textProperty ? [textProperty] : []),
    ]);
    const ownsPropertyKey = pluginProperties.some(
      (property) => property.key === propertyKey
    );

    if (!ownsPropertyKey && plugin.key !== undefined) {
      throw new Error(
        `Plate plugin "${plugin.name}" declares \`key\` without owning that schema property.`
      );
    }

    properties.push(...declaredProperties);
    contentRoots.push(...declaredContentRoots);
    contributions[plugin.name] = Object.freeze({
      ...(declaredContentRoots.length > 0
        ? { contentRoots: declaredContentRoots }
        : {}),
      ...(element
        ? {
            elements: Object.freeze({
              [elementType]: elements[elementType]!,
            }),
          }
        : {}),
      ...(schemaProperties.length > 0 ? { properties: schemaProperties } : {}),
    });

    return Object.freeze({
      elementPropertyKeys: Object.freeze([
        ...elementPropertyKeys,
        ...declaredProperties.flatMap((property) =>
          property.placement === 'element' && typeof property.key === 'string'
            ? [property.key]
            : []
        ),
      ]),
      elementType: element ? elementType : null,
      isDecoration: plugin.render.isDecoration ?? true,
      kind: element ? 'element' : mark ? 'mark' : 'none',
      name: plugin.name,
      propertyKey: ownsPropertyKey ? propertyKey : null,
      properties: pluginProperties,
      propertyIds: Object.freeze([
        ...elementPropertyIds,
        ...declaredProperties.map((property) =>
          getCompiledSchemaPropertyId(property)
        ),
      ]),
      referencedNames: Object.freeze(
        references
          .filter((reference) => reference.owner === plugin.name)
          .map((reference) => reference.target)
      ),
      textPropertyId: textProperty
        ? getCompiledSchemaPropertyId(textProperty)
        : null,
    }) satisfies CompiledPlateModelBinding;
  });
  const byKey: Record<string, CompiledPlateModelBinding> = Object.create(null);
  const byName: Record<string, CompiledPlateModelBinding> = Object.create(null);
  const byType: Record<string, CompiledPlateModelBinding> = Object.create(null);

  for (const binding of bindings) {
    byName[binding.name] = binding;
    if (binding.propertyKey) {
      const existing = byKey[binding.propertyKey];

      if (existing) {
        throw new Error(
          `Plate plugins "${existing.name}" and "${binding.name}" both own mark/property key "${binding.propertyKey}".`
        );
      }
      byKey[binding.propertyKey] = binding;
    }
  }

  for (const binding of bindings) {
    if (!binding.elementType) continue;
    const existing = byType[binding.elementType];

    if (existing) {
      throw new Error(
        `Plate plugins "${existing.name}" and "${binding.name}" both own element type "${binding.elementType}".`
      );
    }
    byType[binding.elementType] = binding;
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
    byKey: Object.freeze(byKey),
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
    contributions: Object.freeze(contributions),
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
  plugin: PluginReference | string
) =>
  getCompiledPlateModel(editor).byName[
    typeof plugin === 'string' ? plugin : plugin.name
  ];

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
  plugin: string
): AnyBasePlugin | undefined;
export function getCompiledPlatePlugin(
  editor: object,
  plugin: PluginReference | string
): unknown {
  const owner = getPlateOwner(editor);
  const name = typeof plugin === 'string' ? plugin : plugin.name;

  return candidatePluginSets.has(owner)
    ? candidatePluginSets.get(owner)!.byName[name]
    : getPlateRuntime(editor).plugins[name];
}

/** @internal Resolve an installed element owner from persisted node identity. */
export const getCompiledPlatePluginByType = (
  editor: object,
  type: string
): AnyBasePlugin | undefined => {
  const binding = getCompiledPlateModel(editor).byType[type];

  return binding ? getCompiledPlatePlugin(editor, binding.name) : undefined;
};

/** @internal Resolve an installed mark owner from persisted property identity. */
export const getCompiledPlatePluginByKey = (
  editor: object,
  key: string
): AnyBasePlugin | undefined => {
  const binding = getCompiledPlateModel(editor).byKey[key];

  return binding ? getCompiledPlatePlugin(editor, binding.name) : undefined;
};

export const getCompiledPlateContainerTypes = (editor: object) =>
  getPlateRuntime(editor).pluginCache.node.containerTypes;

export const getCompiledPlatePluginApi = (
  editor: object,
  plugin: AnyBasePlugin | PluginReference | string
) => {
  const owner = getPlateOwner(editor);
  const name = typeof plugin === 'string' ? plugin : plugin.name;

  return candidatePluginApis.has(owner)
    ? candidatePluginApis.get(owner)![name]
    : getPlateModelPublication(editor)?.apiByPlugin[name];
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
