import {
  ElementApi,
  type EditorSchemaContribution,
  type EditorSchemaOverride,
  type EditorStateSchemaApi,
  type Node,
  type SchemaContent,
  type SchemaContentRule,
  type SchemaContentRootContribution,
  type SchemaContentOptions,
  type SchemaElement,
  type SchemaProperty,
  type SchemaPropertyHandle,
  type SchemaTarget,
  schema,
} from '@platejs/plite';
import {
  failInvariant,
  getCompiledSchemaPropertyId,
  getSchemaElementSourceReference,
  preserveCompiledSchemaPropertyIdentity,
} from '@platejs/plite/internal';

import type { BaseEditor } from '../../lib/editor';
import type {
  EditorApplicationSchema,
  EditorSchemaIdentity,
} from '../../lib/editor/editorApplicationSchema';
import type {
  AnyBasePlugin,
  BasePlugin,
  DefinitionOf,
  NodeComponents,
  PluginReference,
  PluginSchemaContext,
  PluginSchemaDeclaration,
  PluginSchemaMark,
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
  family: object | null;
  isDecoration: boolean;
  kind: 'element' | 'mark' | 'none';
  name: string;
  propertyKey: string | null;
  propertyHandles: Readonly<Record<string, SchemaPropertyHandle | undefined>>;
  properties: readonly SchemaProperty[];
  propertyIds: readonly string[];
  schema: Readonly<{
    key?: string;
    properties: Readonly<Record<string, SchemaPropertyHandle | undefined>>;
    type?: string;
  }>;
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
  genericElementToggles: readonly string[];
  identity: EditorSchemaIdentity | null;
  inputRules: PlateRuntime['inputRules'];
  model: CompiledPlateModel;
  pluginCache: PlateRuntime['pluginCache'];
  pluginList: readonly AnyBasePlugin[];
  plugins: Readonly<Record<string, AnyBasePlugin>>;
  shortcutTable: PlateRuntime['shortcutTable'];
  shortcuts: PlateRuntime['shortcuts'];
  updateMethods: PlateRuntime['updateMethods'];
}>;

const PLATE_BLOCK_CONTENT_SCHEMA_GROUP = 'plate:block-content';
const getPlateOwner = (editor: object) => getPlateRuntimeOwner(editor);
const resolvingSchemaIdentities = new WeakMap<object, Set<object>>();

const evaluatePluginSchemaIdentity = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
): PluginSchemaDeclaration | null => {
  const owner = getPlateOwner(editor);
  let resolving = resolvingSchemaIdentities.get(owner);

  if (!resolving) {
    resolving = new Set();
    resolvingSchemaIdentities.set(owner, resolving);
  }
  if (resolving.has(plugin)) return null;

  resolving.add(plugin);
  try {
    return evaluatePluginSchemaDeclaration(editor, plugin);
  } finally {
    resolving.delete(plugin);
    if (resolving.size === 0) resolvingSchemaIdentities.delete(owner);
  }
};

/**
 * Resolve the authored element default without fabricating identity.
 *
 * @internal
 */
export const resolvePluginElementType = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
) => {
  const declaration = evaluatePluginSchemaIdentity(editor, plugin);

  return declaration &&
    'element' in declaration &&
    declaration.element &&
    typeof declaration.element === 'object' &&
    'type' in declaration.element &&
    typeof declaration.element.type === 'string'
    ? declaration.element.type
    : plugin.name;
};

/**
 * Resolve the authored mark key without fabricating identity.
 *
 * @internal
 */
export const resolvePluginPropertyKey = (
  editor: BaseEditor,
  plugin: AnyBasePlugin
) => {
  const declaration = evaluatePluginSchemaIdentity(editor, plugin);

  return declaration &&
    'mark' in declaration &&
    declaration.mark &&
    typeof declaration.mark === 'object' &&
    'property' in declaration.mark &&
    'key' in declaration.mark &&
    typeof declaration.mark.key === 'string'
    ? declaration.mark.key
    : plugin.name;
};

export const createPlateBlockContent = (options?: SchemaContentOptions) =>
  schema.content.group(PLATE_BLOCK_CONTENT_SCHEMA_GROUP, options);

/** @internal */
export const isPlateBlockContent = (
  schemaApi: Pick<EditorStateSchemaApi, 'isElementTypeInGroup'>,
  node: Node
) =>
  ElementApi.isElement(node) &&
  schemaApi.isElementTypeInGroup(node.type, PLATE_BLOCK_CONTENT_SCHEMA_GROUP);

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

const candidateModels = new WeakMap<object, CompiledPlateModel>();
const candidateApplicationElementTypes = new WeakMap<
  object,
  Readonly<Record<string, string | undefined>>
>();
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

/**
 * Final element identity visible while schema-aware plugin stages resolve.
 *
 * @internal
 */
export const getCandidateApplicationElementType = (
  editor: object,
  plugin: PluginReference | string
) =>
  candidateApplicationElementTypes.get(getPlateOwner(editor))?.[
    typeof plugin === 'string' ? plugin : plugin.name
  ];

/**
 * Publish closed-editor element remaps before plugin callbacks capture them.
 *
 * @internal
 */
export const withEditorApplicationSchemaCandidate = <T>(
  editor: object,
  policy: EditorApplicationSchema | undefined,
  plugins: readonly AnyBasePlugin[],
  run: () => T
): T => {
  const owner = getPlateOwner(editor);
  const previous = candidateApplicationElementTypes.get(owner);
  const types: Record<string, string> = Object.create(null);

  for (const override of policy?.overrides ?? []) {
    if (!override.element?.type) continue;
    const name = override.source;
    const authoredSource =
      getSchemaElementSourceReference(override) ?? override.source;
    const candidates = plugins.filter((plugin) => plugin.name === name);

    if (candidates.length === 0) {
      throw new Error(
        `Editor schema override references missing plugin "${name}".`
      );
    }
    if (
      typeof authoredSource !== 'string' &&
      (!isNominalPluginReference(authoredSource) ||
        !candidates.some(
          (plugin) =>
            getPluginSchemaFamily(authoredSource) ===
            getPluginSchemaFamily(plugin)
        ))
    ) {
      throw new Error(
        `Editor schema override descriptor "${name}" does not match the installed plugin family.`
      );
    }

    if (types[name]) {
      throw new Error(
        `Editor schema overrides element type for plugin "${name}" more than once.`
      );
    }
    types[name] = override.element.type;
  }
  candidateApplicationElementTypes.set(owner, Object.freeze(types));

  try {
    return run();
  } finally {
    if (previous) candidateApplicationElementTypes.set(owner, previous);
    else candidateApplicationElementTypes.delete(owner);
  }
};

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
    types: Object.freeze(
      plugins.map(
        (targetPlugin) =>
          getCandidateApplicationElementType(editor, targetPlugin) ??
          getPlateModelPublication(editor)?.model.byName[targetPlugin.name]
            ?.elementType ??
          resolvePluginElementType(editor, targetPlugin)
      )
    ),
  });

  editorBindings.set(plugin, binding);

  return binding;
};

/** Internal compiled view of a plugin's weak, optional target allowlist. */
export const getResolvedPluginTargetBinding = (
  editor: BaseEditor,
  plugin: Pick<AnyBasePlugin, 'name' | 'targetPlugins'>
): ResolvedPluginTargetBinding => {
  const cached = resolvedTargetBindings.get(getPlateOwner(editor))?.get(plugin);

  return cached ?? compileResolvedPluginTargetBinding(editor, plugin);
};

/**
 * Resolve the installed document types owned by one target binding.
 *
 * @internal
 */
export const getResolvedPluginTargetTypes = (
  editor: BaseEditor,
  plugin: Pick<AnyBasePlugin, 'name' | 'targetPlugins'>
) => getResolvedPluginTargetBinding(editor, plugin).types;

const resolveReference = <const TPlugin extends PluginReference | string>(
  editor: BaseEditor,
  owner: Readonly<{ name: string }>,
  plugin: TPlugin,
  references: PendingReference[]
): TPlugin extends Readonly<{
  schema: Readonly<{
    element: Readonly<{ type: infer TType extends string }>;
  }>;
}>
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

  return (getCandidateApplicationElementType(editor, target) ??
    resolvePluginElementType(editor, target)) as TPlugin extends Readonly<{
    schema: Readonly<{
      element: Readonly<{ type: infer TType extends string }>;
    }>;
  }>
    ? TType
    : TPlugin extends Readonly<{ name: infer TName extends string }>
      ? TName
      : string;
};

const isPluginSchemaDeclaration = (
  value: unknown
): value is PluginSchemaDeclaration =>
  typeof value === 'object' && value !== null;

/**
 * Evaluate one plugin schema against the current editor candidate.
 *
 * @internal
 */
export const evaluatePluginSchemaDeclaration = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  references: PendingReference[] = []
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
    blockContent: (options) => {
      const { default: defaultValue, ...contentOptions } = options ?? {};
      const resolvedDefault =
        defaultValue &&
        typeof defaultValue === 'object' &&
        'name' in defaultValue
          ? {
              type: resolveReference(editor, plugin, defaultValue, references),
            }
          : defaultValue;

      return createPlateBlockContent({
        ...contentOptions,
        ...(resolvedDefault !== undefined ? { default: resolvedDefault } : {}),
      });
    },
  });
  const context: PluginSchemaContext = Object.freeze({
    initialState: plugin.initialState,
    name: plugin.name,
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
    const { key: _key, property: descriptor, ...options } = mark;

    return schema.textProperty(key, descriptor, {
      typeChange: 'preserve-if-allowed',
      ...options,
    });
  }

  return schema.textProperty(key, mark, {
    typeChange: 'preserve-if-allowed',
  });
};

/**
 * Resolve one exact authored property before schema publication.
 *
 * @internal
 */
export const getAuthoredPluginPropertyHandle = (
  editor: BaseEditor,
  plugin: AnyBasePlugin,
  localId: string
): SchemaPropertyHandle | undefined => {
  const declaration = evaluatePluginSchemaDeclaration(editor, plugin);

  if (!declaration) return undefined;

  const elementProperty = declaration.element?.properties?.[localId];

  if (elementProperty) {
    return schema.handle.property(
      schema.elementProperty(localId, elementProperty, {
        target: Object.freeze({
          kind: 'type' as const,
          type: declaration.element?.type ?? plugin.name,
        }),
      })
    );
  }

  const property = declaration.properties?.[localId];

  if (!property) return undefined;

  return schema.handle.property(
    'key' in property ? property : Object.freeze({ ...property, key: localId })
  );
};

type AuthoredElementSource = Readonly<{
  family: object | null;
  type: string | null;
}>;

const resolvePluginElementSource = (
  source: string,
  authoredSource: unknown,
  owner: string,
  elementTypes: ReadonlyMap<string, AuthoredElementSource>,
  references: PendingReference[]
) => {
  const target = elementTypes.get(source);

  if (!target) {
    throw new Error(
      `Plate plugin "${owner}" schema references missing or disabled plugin "${source}".`
    );
  }
  if (
    authoredSource !== undefined &&
    typeof authoredSource !== 'string' &&
    !isNominalPluginReference(authoredSource)
  ) {
    throw new Error(
      `Plate plugin "${owner}" schema references an invalid plugin descriptor.`
    );
  }
  if (
    authoredSource &&
    typeof authoredSource === 'object' &&
    isNominalPluginReference(authoredSource) &&
    getPluginSchemaFamily(authoredSource) !== target.family
  ) {
    throw new Error(
      `Plate plugin "${owner}" schema descriptor "${source}" does not match the installed plugin family.`
    );
  }
  if (!target.type) {
    throw new Error(
      `Plate plugin "${owner}" schema reference "${source}" does not own an element type.`
    );
  }
  references.push({ owner, target: source });

  return target.type;
};

const lowerPluginContentRule = (
  rule: SchemaContentRule,
  owner: string,
  elementTypes: ReadonlyMap<string, AuthoredElementSource>,
  references: PendingReference[]
): SchemaContentRule => {
  switch (rule.kind) {
    case 'type': {
      return 'source' in rule && typeof rule.source === 'string'
        ? Object.freeze({
            kind: 'type' as const,
            type: resolvePluginElementSource(
              rule.source,
              getSchemaElementSourceReference(rule),
              owner,
              elementTypes,
              references
            ),
          })
        : rule;
    }
    case 'all':
    case 'any': {
      return Object.freeze({
        ...rule,
        rules: Object.freeze(
          rule.rules.map((child) =>
            lowerPluginContentRule(child, owner, elementTypes, references)
          )
        ),
      });
    }
    case 'not': {
      return Object.freeze({
        ...rule,
        rule: lowerPluginContentRule(
          rule.rule,
          owner,
          elementTypes,
          references
        ),
      });
    }
    default: {
      return rule;
    }
  }
};

const lowerPluginContent = (
  content: SchemaContent,
  owner: string,
  elementTypes: ReadonlyMap<string, AuthoredElementSource>,
  references: PendingReference[]
): SchemaContent => {
  const allowed = lowerPluginContentRule(
    content.allowed,
    owner,
    elementTypes,
    references
  );
  const resolvedType =
    content.allowed.kind === 'type' &&
    'source' in content.allowed &&
    typeof content.allowed.source === 'string' &&
    allowed.kind === 'type'
      ? allowed.type
      : null;

  return Object.freeze({
    ...content,
    allowed,
    ...(resolvedType && content.default !== 'text'
      ? { default: Object.freeze({ type: resolvedType }) }
      : {}),
  });
};

const lowerPluginTarget = (
  target: SchemaTarget,
  owner: string,
  elementTypes: ReadonlyMap<string, AuthoredElementSource>,
  references: PendingReference[]
): SchemaTarget => {
  switch (target.kind) {
    case 'type': {
      return 'source' in target && typeof target.source === 'string'
        ? Object.freeze({
            kind: 'type' as const,
            type: resolvePluginElementSource(
              target.source,
              getSchemaElementSourceReference(target),
              owner,
              elementTypes,
              references
            ),
          })
        : target;
    }
    case 'types': {
      if ('sources' in target && Array.isArray(target.sources)) {
        const authoredSources = getSchemaElementSourceReference(target);

        return Object.freeze({
          kind: 'types' as const,
          types: Object.freeze(
            target.sources.map((source, index) => {
              if (typeof source !== 'string') {
                throw new Error(
                  `Plate plugin "${owner}" schema relationship contains an invalid element source.`
                );
              }

              return resolvePluginElementSource(
                source,
                Array.isArray(authoredSources)
                  ? authoredSources[index]
                  : undefined,
                owner,
                elementTypes,
                references
              );
            })
          ),
        });
      }

      return target;
    }
    case 'and':
    case 'or': {
      return Object.freeze({
        ...target,
        targets: Object.freeze(
          target.targets.map((child) =>
            lowerPluginTarget(child, owner, elementTypes, references)
          )
        ),
      });
    }
    case 'not':
    case 'parent': {
      return Object.freeze({
        ...target,
        target: lowerPluginTarget(
          target.target,
          owner,
          elementTypes,
          references
        ),
      });
    }
    default: {
      return target;
    }
  }
};

const lowerPluginProperty = <
  TProperty extends Readonly<{ target?: SchemaTarget }>,
>(
  property: TProperty,
  owner: string,
  elementTypes: ReadonlyMap<string, AuthoredElementSource>,
  references: PendingReference[]
): TProperty =>
  property.target
    ? Object.freeze({
        ...property,
        target: lowerPluginTarget(
          property.target,
          owner,
          elementTypes,
          references
        ),
      })
    : property;

const lowerPluginSchemaDeclaration = (
  declaration: PluginSchemaDeclaration,
  owner: string,
  elementTypes: ReadonlyMap<string, AuthoredElementSource>,
  references: PendingReference[]
): PluginSchemaDeclaration => {
  const element = 'element' in declaration ? declaration.element : undefined;
  const mark = 'mark' in declaration ? declaration.mark : undefined;
  const { properties } = declaration;
  const nextElement = element
    ? Object.freeze({
        ...element,
        ...(element.content
          ? {
              content: lowerPluginContent(
                element.content,
                owner,
                elementTypes,
                references
              ),
            }
          : {}),
        ...(element.contentRoots
          ? {
              contentRoots: Object.freeze(
                Object.fromEntries(
                  Object.entries(element.contentRoots).map(([slot, root]) => [
                    slot,
                    'allowed' in root
                      ? lowerPluginContent(
                          root,
                          owner,
                          elementTypes,
                          references
                        )
                      : Object.freeze({
                          ...root,
                          content: lowerPluginContent(
                            root.content,
                            owner,
                            elementTypes,
                            references
                          ),
                        }),
                  ])
                )
              ),
            }
          : {}),
      })
    : undefined;
  const nextMark =
    mark && 'property' in mark && mark.target
      ? Object.freeze({
          ...mark,
          target: lowerPluginTarget(
            mark.target,
            owner,
            elementTypes,
            references
          ),
        })
      : mark;
  const nextProperties = properties
    ? Object.freeze(
        Object.fromEntries(
          Object.entries(properties).map(([localId, property]) => [
            localId,
            lowerPluginProperty(property, owner, elementTypes, references),
          ])
        )
      )
    : undefined;
  const nextContentRoots = declaration.contentRoots
    ? Object.freeze(
        declaration.contentRoots.map((root) =>
          Object.freeze({
            ...root,
            content: lowerPluginContent(
              root.content,
              owner,
              elementTypes,
              references
            ),
            target: lowerPluginTarget(
              root.target,
              owner,
              elementTypes,
              references
            ),
          })
        )
      )
    : undefined;

  return freezePluginDescriptorValue({
    ...declaration,
    ...(nextElement ? { element: nextElement } : {}),
    ...(nextMark ? { mark: nextMark } : {}),
    ...(nextProperties ? { properties: nextProperties } : {}),
    ...(nextContentRoots ? { contentRoots: nextContentRoots } : {}),
  }) as PluginSchemaDeclaration;
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
      evaluatePluginSchemaDeclaration(editor, plugin, references)
    );
  });
  const pluginsByName = new Map(
    pluginList.map((plugin) => [plugin.name, plugin])
  );
  const authoredElementTypes = new Map<string, AuthoredElementSource>();

  declarations.forEach((declaration, name) => {
    authoredElementTypes.set(
      name,
      Object.freeze({
        family: getPluginSchemaFamily(
          pluginsByName.get(name) ??
            failInvariant('Expected value to be defined')
        ),
        type:
          declaration && 'element' in declaration && declaration.element
            ? (declaration.element.type ?? name)
            : null,
      })
    );
  });
  declarations.forEach((declaration, name) => {
    if (!declaration) return;

    declarations.set(
      name,
      lowerPluginSchemaDeclaration(
        declaration,
        name,
        authoredElementTypes,
        references
      )
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
    const elementType = element?.type ?? plugin.name;
    const propertyKey =
      mark && 'property' in mark ? (mark.key ?? plugin.name) : plugin.name;
    const declaredPropertyEntries = Object.freeze(
      Object.entries(declaration?.properties ?? {}).map(([localId, property]) =>
        Object.freeze({
          localId,
          property: Object.freeze({
            ...property,
            ...('key' in property ? {} : { key: localId }),
          }) as SchemaProperty,
        })
      )
    );
    const declaredProperties = Object.freeze(
      declaredPropertyEntries.map(({ property }) => property)
    );
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
      const {
        blockContent,
        type: _type,
        ...schemaElement
      } = element as typeof element & {
        blockContent?: boolean;
        type?: string;
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
    const propertyEntries = Object.freeze([
      ...elementProperties.map((property) =>
        Object.freeze({ localId: property.key, property })
      ),
      ...declaredPropertyEntries,
      ...(textProperty
        ? [Object.freeze({ localId: propertyKey, property: textProperty })]
        : []),
    ]);
    const pluginProperties = Object.freeze(
      propertyEntries.map(({ property }) => property)
    );
    const propertyHandles: Record<string, SchemaPropertyHandle> =
      Object.create(null);

    for (const { localId, property } of propertyEntries) {
      if (propertyHandles[localId]) {
        throw new Error(
          `Plate plugin "${plugin.name}" owns more than one schema property named "${localId}".`
        );
      }
      propertyHandles[localId] = schema.handle.property(property);
    }
    const additionalPropertyHandles = Object.freeze(
      Object.fromEntries(
        propertyEntries.flatMap(({ localId }) =>
          textProperty && localId === propertyKey
            ? []
            : [[localId, propertyHandles[localId]]]
        )
      )
    );
    const schemaProperties = Object.freeze([
      ...declaredProperties,
      ...(textProperty ? [textProperty] : []),
    ]);
    const ownsPropertyKey = pluginProperties.some(
      (property) => property.key === propertyKey
    );

    properties.push(...declaredProperties);
    contentRoots.push(...declaredContentRoots);
    contributions[plugin.name] = Object.freeze({
      ...(declaredContentRoots.length > 0
        ? { contentRoots: declaredContentRoots }
        : {}),
      ...(element
        ? {
            elements: Object.freeze({
              [elementType]: elements[elementType],
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
      family: getPluginSchemaFamily(plugin),
      isDecoration: plugin.render.isDecoration ?? true,
      kind: element ? 'element' : mark ? 'mark' : 'none',
      name: plugin.name,
      propertyKey: ownsPropertyKey ? propertyKey : null,
      propertyHandles: Object.freeze(propertyHandles),
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
      schema: Object.freeze({
        ...(element ? { type: elementType } : {}),
        ...(mark ? { key: propertyKey } : {}),
        properties: additionalPropertyHandles,
      }),
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

type SchemaElementSourceReference = Readonly<{
  kind: 'type';
  source: string;
  type: string;
}>;

const assertApplicationDescriptorFamily = (
  reference: unknown,
  source: string,
  family: object | null,
  owner: 'override' | 'relationship'
) => {
  if (reference === undefined || typeof reference === 'string') return;
  if (!isNominalPluginReference(reference)) {
    throw new Error(
      `Editor schema ${owner} references an invalid plugin descriptor.`
    );
  }
  if (getPluginSchemaFamily(reference) !== family) {
    throw new Error(
      `Editor schema ${owner} descriptor "${source}" does not match the installed plugin family.`
    );
  }
};

const resolveApplicationElementSourceByName = (
  model: CompiledPlateModel,
  source: string,
  reference: unknown
) => {
  const binding = model.byName[source];

  if (!binding?.elementType) {
    throw new Error(
      `Editor schema relationship references missing element plugin "${source}".`
    );
  }
  assertApplicationDescriptorFamily(
    reference,
    source,
    binding.family,
    'relationship'
  );

  return binding.elementType;
};

const resolveApplicationElementSource = (
  model: CompiledPlateModel,
  reference: SchemaElementSourceReference
) =>
  resolveApplicationElementSourceByName(
    model,
    reference.source,
    getSchemaElementSourceReference(reference)
  );

const lowerApplicationContentRule = (
  model: CompiledPlateModel,
  rule: SchemaContentRule
): SchemaContentRule => {
  switch (rule.kind) {
    case 'type': {
      return 'source' in rule
        ? Object.freeze({
            kind: 'type' as const,
            type: resolveApplicationElementSource(
              model,
              rule as SchemaElementSourceReference
            ),
          })
        : rule;
    }
    case 'all':
    case 'any': {
      return Object.freeze({
        ...rule,
        rules: Object.freeze(
          rule.rules.map((child) => lowerApplicationContentRule(model, child))
        ),
      });
    }
    case 'not': {
      return Object.freeze({
        ...rule,
        rule: lowerApplicationContentRule(model, rule.rule),
      });
    }
    default: {
      return rule;
    }
  }
};

const findApplicationContentDefaultReference = (
  rule: SchemaContentRule,
  type: string
): SchemaElementSourceReference | null => {
  switch (rule.kind) {
    case 'type': {
      return 'source' in rule && rule.source === type
        ? (rule as SchemaElementSourceReference)
        : null;
    }
    case 'all':
    case 'any': {
      for (const child of rule.rules) {
        const reference = findApplicationContentDefaultReference(child, type);

        if (reference) return reference;
      }

      return null;
    }
    case 'not': {
      return findApplicationContentDefaultReference(rule.rule, type);
    }
    default: {
      return null;
    }
  }
};

const lowerApplicationContent = (
  model: CompiledPlateModel,
  content: SchemaContent
): SchemaContent => {
  const defaultReference =
    content.default !== undefined && content.default !== 'text'
      ? findApplicationContentDefaultReference(
          content.allowed,
          content.default.type
        )
      : null;

  return Object.freeze({
    ...content,
    allowed: lowerApplicationContentRule(model, content.allowed),
    ...(defaultReference
      ? {
          default: {
            type: resolveApplicationElementSource(model, defaultReference),
          },
        }
      : {}),
  });
};

const lowerApplicationTarget = (
  model: CompiledPlateModel,
  target: SchemaTarget
): SchemaTarget => {
  switch (target.kind) {
    case 'type': {
      return 'source' in target
        ? Object.freeze({
            kind: 'type' as const,
            type: resolveApplicationElementSource(
              model,
              target as SchemaElementSourceReference
            ),
          })
        : target;
    }
    case 'types': {
      if ('sources' in target && Array.isArray(target.sources)) {
        const authoredSources = getSchemaElementSourceReference(target);

        return Object.freeze({
          kind: 'types' as const,
          types: Object.freeze(
            target.sources.map((source, index) => {
              if (typeof source !== 'string') {
                throw new Error(
                  'Editor schema relationship contains an invalid element source.'
                );
              }

              return resolveApplicationElementSourceByName(
                model,
                source,
                Array.isArray(authoredSources)
                  ? authoredSources[index]
                  : undefined
              );
            })
          ),
        });
      }

      return target;
    }
    case 'and':
    case 'or': {
      return Object.freeze({
        ...target,
        targets: Object.freeze(
          target.targets.map((child) => lowerApplicationTarget(model, child))
        ),
      });
    }
    case 'not':
    case 'parent': {
      return Object.freeze({
        ...target,
        target: lowerApplicationTarget(model, target.target),
      });
    }
    default: {
      return target;
    }
  }
};

/**
 * Lower one closed editor policy against the authored plugin model.
 *
 * @internal
 */
export const compileEditorApplicationSchema = (
  model: CompiledPlateModel,
  policy: EditorApplicationSchema | undefined
):
  | Readonly<{
      contribution: EditorSchemaContribution;
      root?: SchemaContent;
    }>
  | undefined => {
  if (!policy) return undefined;

  const { root } = policy;

  if (
    root !== undefined &&
    (typeof root !== 'object' ||
      root === null ||
      !Number.isInteger(root.min) ||
      root.min < 1)
  ) {
    throw new TypeError(
      'Editor application schema root min must be a positive integer.'
    );
  }

  const overrides: EditorSchemaOverride[] = [];

  for (const input of policy.overrides ?? []) {
    const { source } = input;
    const binding = model.byName[source];

    if (!binding) {
      throw new Error(
        `Editor schema override references missing plugin "${source}".`
      );
    }
    assertApplicationDescriptorFamily(
      getSchemaElementSourceReference(input) ?? input.source,
      source,
      binding.family,
      'override'
    );
    if (input.element) {
      if (!binding.elementType) {
        throw new Error(
          `Editor schema override references non-element plugin "${source}".`
        );
      }
      overrides.push(
        Object.freeze({
          ...input.element,
          ...(input.element.content
            ? {
                content: lowerApplicationContent(model, input.element.content),
              }
            : {}),
          element: binding.elementType,
          kind: 'element' as const,
          source,
        })
      );
    }
    for (const [localId, propertyOverride] of Object.entries(
      input.properties ?? {}
    )) {
      const handle = binding.propertyHandles[localId];

      if (!handle) {
        throw new Error(
          `Editor schema override references unknown property "${source}.${localId}".`
        );
      }
      overrides.push(
        Object.freeze({
          id: handle.id,
          kind: 'property' as const,
          source,
          ...(Object.hasOwn(propertyOverride, 'target')
            ? {
                target: propertyOverride.target
                  ? lowerApplicationTarget(model, propertyOverride.target)
                  : null,
              }
            : {}),
        })
      );
    }
  }

  const properties = Object.entries(policy.properties ?? {}).map(
    ([localId, property]) => {
      const authored = Object.freeze({
        ...property,
        ...('key' in property ? {} : { key: localId }),
      }) as SchemaProperty;
      const lowered = {
        ...authored,
        ...(authored.target
          ? { target: lowerApplicationTarget(model, authored.target) }
          : {}),
      } as SchemaProperty;

      return getCompiledSchemaPropertyId(lowered) ===
        getCompiledSchemaPropertyId(authored)
        ? Object.freeze(lowered)
        : preserveCompiledSchemaPropertyIdentity(lowered, authored);
    }
  );

  return Object.freeze({
    contribution: Object.freeze({
      ...(overrides.length > 0 ? { overrides: Object.freeze(overrides) } : {}),
      ...(properties.length > 0
        ? { properties: Object.freeze(properties) }
        : {}),
    }),
    ...(root !== undefined
      ? { root: lowerApplicationContent(model, root) }
      : {}),
  });
};

/**
 * Materialize final element handles without rewriting authored contributions.
 *
 * @internal
 */
export const applyEditorApplicationSchema = (
  model: CompiledPlateModel,
  applicationSchema: EditorSchemaContribution | undefined
): CompiledPlateModel => {
  if (!applicationSchema?.overrides?.length) return model;

  const finalTypes = new Map<string, string>();
  for (const override of applicationSchema.overrides) {
    if (override.kind === 'property') continue;
    if (!override.type) continue;
    const { source } = override;

    if (finalTypes.has(source)) {
      throw new Error(
        `Editor schema overrides element type for plugin "${source}" more than once.`
      );
    }
    finalTypes.set(source, override.type);
  }

  const bindings = model.bindings.map((binding) => {
    const type = finalTypes.get(binding.name);
    const { propertyHandles } = binding;
    const { propertyKey } = binding;

    if (type && (!binding.elementType || !binding.schema.type)) {
      throw new Error(
        `Editor schema override references non-element plugin "${binding.name}".`
      );
    }

    return Object.freeze({
      ...binding,
      elementType: type ?? binding.elementType,
      propertyHandles,
      propertyKey,
      schema: Object.freeze({
        ...binding.schema,
        ...(binding.kind === 'mark'
          ? {
              key: propertyKey ?? failInvariant('Expected value to be defined'),
            }
          : {}),
        properties: Object.freeze(
          Object.fromEntries(
            Object.keys(binding.schema.properties).map((localId) => [
              localId,
              propertyHandles[localId],
            ])
          )
        ),
        ...(type ? { type } : {}),
      }),
    });
  });
  const byName: Record<string, CompiledPlateModelBinding> = Object.create(null);
  const byType: Record<string, CompiledPlateModelBinding> = Object.create(null);
  const byKey: Record<string, CompiledPlateModelBinding> = Object.create(null);

  for (const binding of bindings) {
    byName[binding.name] = binding;
    if (binding.propertyKey) byKey[binding.propertyKey] = binding;
    if (!binding.elementType) continue;
    const previous = byType[binding.elementType];

    if (previous) {
      throw new Error(
        `Editor schema element type "${binding.elementType}" is owned by both "${previous.name}" and "${binding.name}" after overrides.`
      );
    }
    byType[binding.elementType] = binding;
  }

  return Object.freeze({
    ...model,
    bindings: Object.freeze(bindings),
    byKey: Object.freeze(byKey),
    byName: Object.freeze(byName),
    byType: Object.freeze(byType),
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

/**
 * Runtime projection compiled from the installed Plate model.
 *
 * @internal
 */
export const getPlateRuntime = (editor: object): PlateRuntime => {
  const publication = getPlateModelPublication(editor);

  if (publication) return publication;
  const candidate = getPlateRuntimeCandidate(editor);

  if (candidate) return candidate;
  throw new Error('Plate runtime is not installed.');
};

/**
 * Whether the editor owns an installed or compiling Plate runtime.
 *
 * @internal
 */
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
    ? (
        candidatePluginSets.get(owner) ??
        failInvariant('Expected value to be defined')
      ).byName[name]
    : getPlateRuntime(editor).plugins[name];
}

/**
 * Resolve an installed element owner from persisted node identity.
 *
 * @internal
 */
export const getCompiledPlatePluginByType = (
  editor: object,
  type: string
): AnyBasePlugin | undefined => {
  const binding = getCompiledPlateModel(editor).byType[type];

  return binding ? getCompiledPlatePlugin(editor, binding.name) : undefined;
};

/**
 * Resolve an installed mark owner from persisted property identity.
 *
 * @internal
 */
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
    ? (candidatePluginApis.get(owner) ??
        failInvariant('Expected value to be defined'))[name]
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
