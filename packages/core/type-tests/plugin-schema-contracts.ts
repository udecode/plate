import {
  type ElementOf,
  type EditorSchemaProperty,
  type PropertyJsonValue,
  type Value,
  property,
  schema,
  target,
} from '@platejs/plite';
import {
  type BasePluginContext,
  type BasePluginDefinition,
  createBaseEditor,
  defineBasePlugin,
  type BaseEditor,
  type DefinitionOf,
  ElementIdPlugin,
  type ElementWith,
  migrateElementIds,
  type PluginReference,
  type TextWith,
} from '@platejs/core';
import type { SchemaElement } from '@platejs/plite';
import type { AnyBasePlugin } from '../src/lib/plugin/BasePlugin';
import type { NormalizePluginState } from '../src/lib/plugin/PluginDefinition';
import type { PliteElementProps } from '../src/static/components/plite-nodes';
import {
  createPlateEditor,
  definePlatePlugin,
  type PlateElementForDescriptor,
  type PlateElementProps,
  type PlateEditor,
  toPlatePlugin,
} from '@platejs/core/react';

const TargetPlugin = defineBasePlugin('schemaTarget', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

type GenericElementPluginDefinition = BasePluginDefinition &
  Readonly<{ schema: Readonly<{ element: SchemaElement }> }>;

declare const genericElementContext: BasePluginContext<GenericElementPluginDefinition>;

const genericElementType: string = genericElementContext.schema.type;
// @ts-expect-error A generic element schema does not expose a primary property key.
void genericElementContext.schema.key;
void genericElementType;

const ExtendedTargetPlugin = TargetPlugin.extend({
  initialState: { enabled: true },
});
type ExtendedTargetDefinition = DefinitionOf<typeof ExtendedTargetPlugin>;
declare const extendedTargetName: ExtendedTargetDefinition['name'];
const exactExtendedTargetName: 'schemaTarget' = extendedTargetName;
const ConfiguredTargetPlugin = TargetPlugin.configure({});
const configuredTargetName: 'schemaTarget' = ConfiguredTargetPlugin.name;
const configuredTargetReference: PluginReference<'schemaTarget'> =
  ConfiguredTargetPlugin;
const canonicalTargetReference: PluginReference<'schemaTarget'> =
  configuredTargetReference;
const configuredTargetEditor = createBaseEditor({
  plugins: [ConfiguredTargetPlugin],
});
const configuredTargetElement = configuredTargetEditor.read.schema.create(
  ConfiguredTargetPlugin
);
const exactConfiguredTargetType: 'schemaTarget' = configuredTargetElement.type;
const ConfiguredPlateTargetPlugin = toPlatePlugin(TargetPlugin).configure({});
const configuredPlateTargetName: 'schemaTarget' =
  ConfiguredPlateTargetPlugin.name;
const configuredPlateTargetEditor = createPlateEditor({
  plugins: [ConfiguredPlateTargetPlugin],
});
const configuredPlateTargetElement =
  configuredPlateTargetEditor.read.schema.create(ConfiguredPlateTargetPlugin);
const exactConfiguredPlateTargetType: 'schemaTarget' =
  configuredPlateTargetElement.type;

configuredTargetEditor.read.schema.isElementTypeInGroup(
  ConfiguredTargetPlugin,
  'textBlock'
);

void configuredTargetReference;
void canonicalTargetReference;
void exactConfiguredTargetType;
void configuredPlateTargetName;
void exactConfiguredPlateTargetType;
void configuredTargetName;
void exactExtendedTargetName;

const NoSchemaPlugin = defineBasePlugin('noSchemaElement', {});
const noSchemaEditor = createBaseEditor({
  plugins: [NoSchemaPlugin],
});
type NoSchemaElement = ElementOf<typeof NoSchemaPlugin>;
declare const noSchemaElement: NoSchemaElement;

// @ts-expect-error Plugins without schema.element are not element descriptors.
noSchemaEditor.read.schema.element(NoSchemaPlugin);
// @ts-expect-error Plugins without schema.element cannot construct elements.
noSchemaEditor.read.schema.create(NoSchemaPlugin);
// @ts-expect-error Schema-less plugins do not expose an inferred element.
void noSchemaElement.type;

type ConfiguredPropertyPluginState = {
  prefix: string;
};

const configuredPropertyInitialState: ConfiguredPropertyPluginState = {
  prefix: 'configured',
};

const ConfiguredPropertyPlugin = defineBasePlugin('configuredProperty', {
  initialState: configuredPropertyInitialState,
  schema: ({ initialState, targetElementTypes }) => {
    const prefix: string = initialState.prefix;
    const targetElementType: string = targetElementTypes[0]!;

    void prefix;
    void targetElementType;

    return {
      properties: {
        configuredProperty: schema.elementProperty(property.string(), {
          target: target.types(targetElementTypes),
        }),
      },
    };
  },
  targetPlugins: [TargetPlugin],
});

const AmbiguousPropertyPlugin = defineBasePlugin('ambiguousProperty', {
  schema: {
    properties: {
      'first-property': schema.elementProperty(property.string(), {
        target: target.type('schemaTarget'),
      }),
      'second-property': schema.elementProperty(property.number(), {
        target: target.type('schemaTarget'),
      }),
    },
  },
});

const MarkPropertyPlugin = definePlatePlugin('schemaMarkProperty', {
  schema: {
    mark: {
      inclusive: false,
      property: property.string(),
      split: 'preserve',
    },
  },
});

const ElementPropertyPlugin = definePlatePlugin('schemaElementProperty', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { tone: property.string() },
    },
  },
});

const JsonElementPropertyPlugin = defineBasePlugin('jsonElementProperty', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: {
        sizes: property.json({
          validate: (value): value is number[] =>
            Array.isArray(value) &&
            value.every((item) => typeof item === 'number'),
          validationVersion: 1,
        }),
      },
    },
  },
});
type JsonPropertyElement = ElementOf<typeof JsonElementPropertyPlugin>;
declare const jsonPropertyElement: JsonPropertyElement;
const exactJsonSizes: readonly number[] | undefined = jsonPropertyElement.sizes;

void exactJsonSizes;

const SchemaPropertyContributorPlugin = defineBasePlugin(
  'schemaPropertyContributor',
  {
    schema: {
      properties: {
        active: schema.textProperty(
          'persistedActive',
          property.boolean({ default: false, omitDefault: true })
        ),
        metadata: schema.textProperty(
          schema.key.prefix('metadata_'),
          property.string()
        ),
        priority: schema.elementProperty(property.number(), {
          target: target.group('element'),
        }),
      },
    },
  }
);

type ContributedElement = ElementWith<
  typeof SchemaPropertyContributorPlugin,
  'priority'
>;
type ContributedText = TextWith<
  typeof SchemaPropertyContributorPlugin,
  'active'
>;
declare const contributedElement: ContributedElement;
declare const contributedText: ContributedText;
declare const metadataKey: `metadata_${string}`;
const exactContributedPriority: number = contributedElement.priority;
const exactContributedActive: true = contributedText.persistedActive;
const exactContributedMetadata: string | undefined =
  contributedText[metadataKey];

const rawElementProperties = {
  width: property.number(),
} as const;
declare const rawPropertyElement: ElementWith<typeof rawElementProperties>;
const exactRawWidth: number | undefined = rawPropertyElement.width;

type CombinedContributors = ElementWith<
  typeof ConfiguredPropertyPlugin | typeof SchemaPropertyContributorPlugin,
  'configuredProperty' | 'priority'
>;
declare const combinedContributors: CombinedContributors;
const exactCombinedConfiguredProperty: string =
  combinedContributors.configuredProperty;
const exactCombinedPriority: number = combinedContributors.priority;

const SharedStringPropertyPlugin = defineBasePlugin('sharedStringProperty', {
  schema: {
    properties: {
      shared: schema.elementProperty('sharedString', property.string(), {
        target: target.group('element'),
      }),
    },
  },
});
const SharedNumberPropertyPlugin = defineBasePlugin('sharedNumberProperty', {
  schema: {
    properties: {
      shared: schema.elementProperty('sharedNumber', property.number(), {
        target: target.group('element'),
      }),
    },
  },
});
type CorrelatedContributors = ElementWith<
  typeof SharedStringPropertyPlugin | typeof SharedNumberPropertyPlugin
>;
type RequiredCorrelatedContributors = ElementWith<
  typeof SharedStringPropertyPlugin | typeof SharedNumberPropertyPlugin,
  'shared'
>;
declare const correlatedContributors: CorrelatedContributors;
declare const requiredCorrelatedContributors: RequiredCorrelatedContributors;
const exactCorrelatedString: string | undefined =
  correlatedContributors.sharedString;
const exactCorrelatedNumber: number | undefined =
  correlatedContributors.sharedNumber;
const exactRequiredCorrelatedString: string =
  requiredCorrelatedContributors.sharedString;
const exactRequiredCorrelatedNumber: number =
  requiredCorrelatedContributors.sharedNumber;

type InvalidContributedElement = ElementWith<
  typeof SchemaPropertyContributorPlugin,
  // @ts-expect-error Required property IDs must belong to the supplied owners.
  'missing'
>;
type InvalidRequiredPrefix = TextWith<
  typeof SchemaPropertyContributorPlugin,
  // @ts-expect-error Prefix properties describe a key family, not one required key.
  'metadata'
>;
declare const invalidContributedElement: InvalidContributedElement;
declare const invalidRequiredPrefix: InvalidRequiredPrefix;

void exactCombinedConfiguredProperty;
void exactCombinedPriority;
void exactCorrelatedNumber;
void exactCorrelatedString;
void exactContributedActive;
void exactContributedMetadata;
void exactContributedPriority;
void exactRawWidth;
void exactRequiredCorrelatedNumber;
void exactRequiredCorrelatedString;
void invalidContributedElement;
void invalidRequiredPrefix;

const RelationshipParagraphPlugin = defineBasePlugin('relationshipParagraph', {
  schema: { element: schema.element.textBlock() },
});
const RelationshipCellPlugin = defineBasePlugin('relationshipCell', {
  dependencies: [RelationshipParagraphPlugin],
  schema: {
    element: {
      content: schema.content.type('relationshipParagraph', {
        default: { type: 'relationshipParagraph' },
        min: 1,
      }),
    },
  },
});
const RelationshipRowPlugin = defineBasePlugin('relationshipRow', {
  dependencies: [RelationshipCellPlugin],
  schema: {
    element: {
      content: schema.content.type('relationshipCell', {
        default: { type: 'relationshipCell' },
        min: 1,
      }),
    },
  },
});
const RelationshipTablePlugin = defineBasePlugin('relationshipTable', {
  dependencies: [RelationshipRowPlugin],
  schema: {
    element: {
      content: schema.content.type('relationshipRow', {
        default: { type: 'relationshipRow' },
        min: 1,
      }),
    },
  },
});
const relationshipEditor = createBaseEditor({
  plugins: [RelationshipTablePlugin],
});
const relationshipTable = relationshipEditor.read.schema.create(
  RelationshipTablePlugin
);
const exactRelationshipTable: 'relationshipTable' = relationshipTable.type;

// Static children expose the finite installed vocabulary. Plite runtime schema
// rejects this cell directly under a table.
const relationshipTableVocabulary: typeof relationshipTable = {
  children: [{ children: [], type: 'relationshipCell' }],
  type: 'relationshipTable',
};

void exactRelationshipTable;
void relationshipTableVocabulary;

const AggregatePropertiesPlugin = defineBasePlugin('aggregateProperties', {
  schema: {
    properties: {
      firstProperty: schema.elementProperty(property.string(), {
        target: target.group('element'),
      }),
      secondProperty: schema.elementProperty(property.number(), {
        target: target.group('element'),
      }),
    },
  },
});
const aggregatePropertiesEditor = createBaseEditor({
  plugins: [AggregatePropertiesPlugin],
});
// @ts-expect-error aggregate property contributors do not own one primary key
void aggregatePropertiesEditor.plugin(AggregatePropertiesPlugin).key;

const ExplicitPlateElementPlugin = definePlatePlugin('plateElementOwner', {
  schema: {
    element: {
      ...schema.element.textBlock(),
      type: 'plateElementDocumentType',
    },
  },
  update: ({ schema }) => {
    const exactType: 'plateElementDocumentType' = schema.type;

    return { identity: () => exactType };
  },
});
const explicitPlateElementType: 'plateElementDocumentType' =
  ExplicitPlateElementPlugin.schema.element.type;
// @ts-expect-error author descriptors do not expose a universal property key
void ExplicitPlateElementPlugin.key;

const PlateDependencyElementPlugin = definePlatePlugin(
  'plateDependencyElement',
  {
    schema: {
      element: {
        ...schema.element.textBlock(),
        properties: { dependencyOnly: property.boolean() },
      },
    },
  }
);
const PlateOwnerElementPlugin = definePlatePlugin('plateOwnerElement', {
  dependencies: [PlateDependencyElementPlugin],
  schema: {
    element: {
      ...schema.element.textBlock(),
      properties: { ownerOnly: property.string() },
    },
  },
});
type PlateOwnerElement = ElementOf<typeof PlateOwnerElementPlugin>;
type PlateOwnerHookElement = PlateElementForDescriptor<
  typeof PlateOwnerElementPlugin
>;
declare const plateOwnerElement: PlateOwnerElement;
declare const plateOwnerHookElement: PlateOwnerHookElement;
declare const plateOwnerProps: PlateElementProps<
  typeof PlateOwnerElementPlugin
>;
declare const plateOwnerStaticProps: PliteElementProps<
  typeof PlateOwnerElementPlugin
>;
const exactPlateOwnerType: 'plateOwnerElement' = plateOwnerElement.type;
const exactPlateOwnerProperty: string | undefined = plateOwnerElement.ownerOnly;
const exactPlateOwnerHookType: 'plateOwnerElement' = plateOwnerHookElement.type;
const exactPlateOwnerPropsType: 'plateOwnerElement' =
  plateOwnerProps.element.type;
const exactPlateOwnerStaticPropsType: 'plateOwnerElement' =
  plateOwnerStaticProps.element.type;
// @ts-expect-error Descriptor-local element inference excludes dependency nodes.
void plateOwnerElement.dependencyOnly;
// @ts-expect-error Hook element inference excludes dependency nodes.
void plateOwnerHookElement.dependencyOnly;
// @ts-expect-error PlateElementProps element inference excludes dependency nodes.
void plateOwnerProps.element.dependencyOnly;
// @ts-expect-error PliteElementProps element inference excludes dependency nodes.
void plateOwnerStaticProps.element.dependencyOnly;

const PlateFactoryElementPlugin = definePlatePlugin('plateFactoryElement', {
  schema: () => ({
    element: {
      ...schema.element.textBlock(),
      properties: { factoryOnly: property.number() },
    },
  }),
});
type PlateFactoryHookElement = PlateElementForDescriptor<
  typeof PlateFactoryElementPlugin
>;
declare const plateFactoryHookElement: PlateFactoryHookElement;
const exactPlateFactoryType: 'plateFactoryElement' =
  plateFactoryHookElement.type;
const exactPlateFactoryProperty: number | undefined =
  plateFactoryHookElement.factoryOnly;
void exactPlateFactoryProperty;
void exactPlateFactoryType;

const ExplicitPlateMarkPlugin = definePlatePlugin('plateMarkOwner', {
  api: ({ schema }) => {
    const exactKey: 'plateMarkDocumentKey' = schema.key;

    return { identity: () => exactKey };
  },
  schema: {
    mark: {
      key: 'plateMarkDocumentKey',
      property: property.boolean(),
    },
  },
});
const explicitPlateMarkKey: 'plateMarkDocumentKey' =
  ExplicitPlateMarkPlugin.schema.mark.key;
// @ts-expect-error author descriptors do not expose a universal element type
void ExplicitPlateMarkPlugin.type;

void explicitPlateElementType;
void explicitPlateMarkKey;
void exactPlateOwnerHookType;
void exactPlateOwnerProperty;
void exactPlateOwnerPropsType;
void exactPlateOwnerStaticPropsType;
void exactPlateOwnerType;

const configuredPrefix: string = ConfiguredPropertyPlugin.initialState.prefix;
const configuredTargetPlugin: typeof TargetPlugin =
  ConfiguredPropertyPlugin.targetPlugins[0];

const PluginReferenceStatePlugin = defineBasePlugin('pluginReferenceState', {
  initialState: {
    nested: { targets: [TargetPlugin] as const },
    target: TargetPlugin,
  },
}).configure({
  initialState: { target: TargetPlugin },
});
const pluginReferenceStateEditor = createBaseEditor({
  plugins: [TargetPlugin, PluginReferenceStatePlugin],
});
const targetReference = pluginReferenceStateEditor
  .plugin(PluginReferenceStatePlugin)
  .store.get('target');
const nestedTargetReference = pluginReferenceStateEditor
  .plugin(PluginReferenceStatePlugin)
  .store.get('nested').targets[0];
const exactTargetReference: PluginReference<'schemaTarget'> = targetReference;
const exactNestedTargetReference: PluginReference<'schemaTarget'> =
  nestedTargetReference;
const readonlyPluginReferenceState = pluginReferenceStateEditor
  .plugin(PluginReferenceStatePlugin)
  .store.get();

// @ts-expect-error Runtime plugin-valued initial state exposes references, not descriptors.
targetReference.configure({ enabled: true });
// @ts-expect-error Nested runtime state references do not expose descriptor methods.
nestedTargetReference.extend({ enabled: true });
// @ts-expect-error Runtime state records are immutable snapshots.
readonlyPluginReferenceState.target = TargetPlugin;
// @ts-expect-error Nested runtime state arrays are immutable snapshots.
readonlyPluginReferenceState.nested.targets.push(TargetPlugin);

void exactTargetReference;
void exactNestedTargetReference;

class PluginStateResource {
  readonly #value = 'opaque';

  read() {
    return this.#value;
  }
}

const pluginStateResource = new PluginStateResource();
const PluginResourceStatePlugin = defineBasePlugin('pluginResourceState', {
  initialState: { resource: pluginStateResource },
});
const pluginResourceEditor = createBaseEditor({
  plugins: [PluginResourceStatePlugin],
});
const exactPluginStateResource: PluginStateResource = pluginResourceEditor
  .plugin(PluginResourceStatePlugin)
  .store.get('resource');

void exactPluginStateResource;

type ThirdPartyPreset = {
  plugins: Array<() => void>;
  settings: { joins: string[] };
};
declare const configuredThirdPartyPreset: NormalizePluginState<ThirdPartyPreset>;
const configuredThirdPartyPlugin: () => void =
  configuredThirdPartyPreset.plugins[0];

// @ts-expect-error Plain third-party state arrays are immutable snapshots.
configuredThirdPartyPreset.plugins.push(() => {});
// @ts-expect-error Nested third-party state arrays are immutable snapshots.
configuredThirdPartyPreset.settings.joins.push('mutable');

void configuredThirdPartyPlugin;

// @ts-expect-error Plugin target names are immutable.
ConfiguredPropertyPlugin.targetPlugins.push(TargetPlugin.name);

const editor = createBaseEditor({
  plugins: [
    TargetPlugin,
    ConfiguredPropertyPlugin,
    ElementPropertyPlugin,
    MarkPropertyPlugin,
    AmbiguousPropertyPlugin,
  ],
});

const installedElementPlugins = [TargetPlugin, ElementPropertyPlugin] as const;

for (const installedElementPlugin of installedElementPlugins) {
  const installedElement = editor.read.schema.create(installedElementPlugin);
  const installedElementSchema = editor.read.schema.element(
    installedElementPlugin
  );

  void installedElement;
  void installedElementSchema;
}

const markPortal = editor.plugin(MarkPropertyPlugin);
const exactMarkKey: 'schemaMarkProperty' = markPortal.schema.key;
const markValue: string | undefined = markPortal.read.value();
const markActive: boolean = markPortal.read.isActive();
markPortal.read.isActive('accent');
markPortal.update.set('accent');
markPortal.update.toggle('accent');
markPortal.update.clear();
editor.read.schemaMarkProperty.value() satisfies string | undefined;
editor.update.schemaMarkProperty.set('accent');
editor.update.schemaMarkProperty.toggle('accent');
// @ts-expect-error Non-boolean mark toggles require the exact mark value.
markPortal.update.toggle();
// @ts-expect-error String marks reject boolean values.
markPortal.update.set(true);

const booleanMarkEditor = createPlateEditor({
  plugins: [ExplicitPlateMarkPlugin],
});
const booleanMarkPortal = booleanMarkEditor.plugin(ExplicitPlateMarkPlugin);
booleanMarkPortal.update.toggle();
booleanMarkPortal.update.set(true);
// @ts-expect-error Boolean mark toggles do not accept a value.
booleanMarkPortal.update.toggle(true);

const dynamicElementType: string = editor.plugin('schemaTarget').schema.type;
const dynamicMarkKey: string = editor.plugin('schemaMarkProperty').schema.key;

void dynamicElementType;
void dynamicMarkKey;
void exactMarkKey;
void markActive;
void markValue;

const requirePluginReference = <T extends PluginReference>(plugin: T) => plugin;
const ReferenceChildPlugin = defineBasePlugin('schemaReferenceChild', {
  dependencies: [TargetPlugin, ElementPropertyPlugin],
});
const DependencyInferencePlugin = defineBasePlugin(
  'schemaDependencyInference',
  {
    api: () => ({
      readDependencyInference: () => 'dependency' as const,
    }),
    update: () => ({
      writeDependencyInference: () => undefined,
    }),
  }
);
const NestedInferencePlugin = defineBasePlugin('schemaNestedInference', {
  api: () => ({ readNestedInference: () => 'nested' as const }),
  update: () => ({ writeNestedInference: () => undefined }),
});
export const InferenceTreePlugin = defineBasePlugin('schemaInferenceTree', {
  dependencies: [DependencyInferencePlugin, NestedInferencePlugin],
});
const ExplicitReferenceParentPlugin = defineBasePlugin(
  'explicitSchemaReferenceParent',
  {
    dependencies: [TargetPlugin],
  }
);
const exactInferredChildName: 'schemaTarget' =
  ReferenceChildPlugin.dependencies[0].name;
export const exactInferredDependencyName: 'schemaDependencyInference' =
  InferenceTreePlugin.dependencies[0].name;
export const exactInferredNestedName: 'schemaNestedInference' =
  InferenceTreePlugin.dependencies[1].name;
const explicitChildReference: PluginReference<'schemaTarget'> =
  ExplicitReferenceParentPlugin.dependencies[0];
const explicitParentAtErasedBoundary: AnyBasePlugin =
  ExplicitReferenceParentPlugin;
const exactEmptyStateAtErasedBoundary: AnyBasePlugin = defineBasePlugin(
  'exactEmptyState',
  {}
);
const erasedPluginCollection: readonly AnyBasePlugin[] = [TargetPlugin];
const erasedCollectionEditor = createBaseEditor({
  plugins: erasedPluginCollection,
});
const nestedReferenceEditor = createBaseEditor({
  plugins: [ReferenceChildPlugin],
});
export const inferenceTreeEditor: BaseEditor<
  readonly [typeof InferenceTreePlugin]
> = createBaseEditor({
  plugins: [InferenceTreePlugin],
});
export const inferenceTreePlateEditor: PlateEditor<
  readonly [typeof InferenceTreePlugin]
> = createPlateEditor({
  plugins: [InferenceTreePlugin],
});
export const broadInferenceTreePlateEditor: PlateEditor =
  inferenceTreePlateEditor;
export const exactDependencyApiResult: 'dependency' = inferenceTreeEditor
  .plugin(DependencyInferencePlugin)
  .api.readDependencyInference();
export const exactNestedApiResult: 'nested' = inferenceTreeEditor
  .plugin(NestedInferencePlugin)
  .api.readNestedInference();
export const exactDependencyUpdate: () => undefined =
  inferenceTreeEditor.update.schemaDependencyInference.writeDependencyInference;
export const exactNestedUpdate: () => undefined =
  inferenceTreeEditor.update.schemaNestedInference.writeNestedInference;

void nestedReferenceEditor.plugin(TargetPlugin);
nestedReferenceEditor.read.schema.element(TargetPlugin);
nestedReferenceEditor.read.schema.isElementTypeInGroup(
  TargetPlugin,
  'textBlock'
);
nestedReferenceEditor.read.schema.property({
  key: 'tone',
  placement: 'element',
});
erasedCollectionEditor.read.schema.element(TargetPlugin);
erasedCollectionEditor.read.schema.property({
  key: 'tone',
  placement: 'element',
});
void explicitParentAtErasedBoundary;
void exactEmptyStateAtErasedBoundary;
void exactDependencyApiResult;
void exactDependencyUpdate;
void exactInferredDependencyName;
void exactInferredNestedName;
void exactInferredChildName;
void exactNestedApiResult;
void exactNestedUpdate;
void broadInferenceTreePlateEditor;

requirePluginReference(TargetPlugin);
requirePluginReference(TargetPlugin.configure({ enabled: true }));
requirePluginReference(TargetPlugin.extend({ editOnly: true }));
requirePluginReference(TargetPlugin.extend(() => ({ enabled: true })));
requirePluginReference(
  TargetPlugin.extend(() => ({
    api: () => ({ nominalApi: () => true }),
  }))
);
requirePluginReference(
  TargetPlugin.extend(() => ({ selectors: { nominalSelector: () => true } }))
);
requirePluginReference(
  TargetPlugin.extend(() => ({ update: () => ({ nominalTx: () => true }) }))
);
requirePluginReference(
  TargetPlugin.extend(() => ({
    update: () => ({
      nominalGroupUpdate: () => true,
    }),
  }))
);
requirePluginReference(
  TargetPlugin.extend({
    on: {
      commit: () => {
        // Prefixless lifecycle fields remain part of the exact descriptor.
      },
    },
  })
);
const PlateTargetPlugin = toPlatePlugin(TargetPlugin);
const PlateReferenceChildPlugin = toPlatePlugin(ReferenceChildPlugin);
const ExtendedSchemaTargetPlugin = TargetPlugin.extend(() => ({
  api: () => ({
    schemaInferenceProof: () => true,
  }),
})).extend(({ api }) => ({
  api: () => ({ readSchemaInferenceProof: () => api.schemaInferenceProof() }),
}));
const PlateExtendedSchemaTargetPlugin = toPlatePlugin(
  ExtendedSchemaTargetPlugin
).extend(() => ({ selectors: { schemaInferenceProof: () => true } }));
const schemaInferenceEditor = createBaseEditor({
  plugins: [ExtendedSchemaTargetPlugin, PlateExtendedSchemaTargetPlugin],
});
const extendedSchemaTargetType: 'schemaTarget' =
  schemaInferenceEditor.read.schema.create(ExtendedSchemaTargetPlugin).type;
const plateExtendedSchemaTargetType: 'schemaTarget' =
  schemaInferenceEditor.read.schema.create(
    PlateExtendedSchemaTargetPlugin
  ).type;

requirePluginReference(definePlatePlugin('createdPlateReference', {}));
requirePluginReference(PlateTargetPlugin);
requirePluginReference(toPlatePlugin(TargetPlugin, { editOnly: true }));
requirePluginReference(toPlatePlugin(TargetPlugin, () => ({ enabled: true })));
requirePluginReference(PlateTargetPlugin.configure({ enabled: true }));
requirePluginReference(PlateTargetPlugin.extend({ editOnly: true }));
requirePluginReference(PlateTargetPlugin.extend(() => ({ enabled: true })));
requirePluginReference(
  PlateTargetPlugin.extend(() => ({
    api: () => ({ nominalApi: () => true }),
  }))
);
requirePluginReference(
  PlateTargetPlugin.extend(() => ({
    selectors: { nominalSelector: () => true },
  }))
);
requirePluginReference(
  PlateTargetPlugin.extend(() => ({
    update: () => ({ nominalTx: () => true }),
  }))
);
requirePluginReference(
  PlateTargetPlugin.extend(() => ({
    update: () => ({
      nominalPlateGroupUpdate: () => true,
    }),
  }))
);
requirePluginReference(
  PlateTargetPlugin.extend({
    on: {
      keyDown: ({ event }) => {
        const key: string = event.key;

        void key;
      },
    },
  })
);
requirePluginReference(PlateTargetPlugin.configure({ component: () => null }));
requirePluginReference(PlateReferenceChildPlugin);
requirePluginReference(editor.plugin(TargetPlugin));
requirePluginReference(editor.plugin(TargetPlugin));

// @ts-expect-error Structurally matching objects are not plugin descriptors.
requirePluginReference({ name: 'schemaTarget', type: 'schemaTarget' });
// @ts-expect-error Name-only objects cannot forge Plate plugin references.
requirePluginReference({ name: 'schemaTarget' });

const targetElement = editor.read.schema.create(TargetPlugin, {
  'first-property': 'center',
});
const targetType: 'schemaTarget' = targetElement.type;
const configuredProperty = editor.read.schema.getProperty(
  targetElement,
  'configured-property'
);
const unknownConfiguredProperty: unknown = configuredProperty;
// @ts-expect-error Dynamic property names return unknown.
const typedConfiguredProperty: string | undefined = configuredProperty;
const configuredSchemaProperty: EditorSchemaProperty | null =
  editor.read.schema.property({
    key: 'configured-property',
    placement: 'element',
  });
const elementSchemaProperty: EditorSchemaProperty | null =
  editor.read.schema.property({ key: 'tone', placement: 'element' });
const markSchemaProperty: EditorSchemaProperty | null =
  editor.read.schema.property({
    key: 'schema-mark-property',
    placement: 'text',
  });
const handledElementSchemaProperty: EditorSchemaProperty | null =
  editor.read.schema.property({ key: 'tone', placement: 'element' });

// @ts-expect-error Element consumer portals expose only their primary type.
void editor.plugin(ElementPropertyPlugin).schema.properties;
// @ts-expect-error Aggregate property contributors expose no consumer schema.
void aggregatePropertiesEditor.plugin(AggregatePropertiesPlugin).schema;
const elementIdEditor = createBaseEditor({
  plugins: [TargetPlugin, ElementIdPlugin],
});
ElementIdPlugin.configure({
  initialState: {
    generateId: () => 'element-id',
  },
});
ElementIdPlugin.configure({
  initialState: {
    // @ts-expect-error Generated element ids are strings.
    generateId: () => 1,
  },
});
type ExactNodeIdValue = [
  {
    children: [{ text: string }];
    custom: number;
    type: 'paragraph';
  },
];
declare const exactNodeIdValue: ExactNodeIdValue;
const migratedElementIdValue: Value = migrateElementIds(exactNodeIdValue, {
  generateId: () => 'element-id',
}).value;
// @ts-expect-error Migration adds canonical IDs and cannot preserve the input's exact shape.
const exactMigratedElementIdValue: ExactNodeIdValue = migrateElementIds(
  exactNodeIdValue,
  { generateId: () => 'element-id' }
).value;
const elementIdProperty = elementIdEditor.read.schema.getProperty(
  targetElement,
  'id'
);
const unknownElementIdProperty: unknown = elementIdProperty;
// @ts-expect-error Raw property names cannot select their own result type.
const typedElementIdProperty: PropertyJsonValue | undefined = elementIdProperty;
const semanticElementIdProperty: string | undefined = elementIdEditor
  .plugin(ElementIdPlugin)
  .read.id(targetElement);
editor.read.schema.element(TargetPlugin);
void configuredSchemaProperty;
void typedConfiguredProperty;
void unknownConfiguredProperty;
void elementSchemaProperty;
void handledElementSchemaProperty;
void markSchemaProperty;
void elementIdProperty;
void unknownElementIdProperty;
void semanticElementIdProperty;
void typedElementIdProperty;
void exactMigratedElementIdValue;
void migratedElementIdValue;
editor.read.schema.create(TargetPlugin, { 'first-property': 42 });
// @ts-expect-error Property-only plugins cannot construct elements.
editor.read.schema.create(AmbiguousPropertyPlugin);
ConfiguredPropertyPlugin.configure({ initialState: { prefix: 'next' } });
ConfiguredPropertyPlugin.configure({
  targetPlugins: [TargetPlugin],
});
ConfiguredPropertyPlugin.configure({
  // @ts-expect-error Plugin targets are descriptors or strings.
  targetPlugins: [42],
});
ConfiguredPropertyPlugin.configure({
  // @ts-expect-error Weak name-only objects are not plugin descriptors.
  targetPlugins: [{ name: 'schemaTarget' }],
});
ConfiguredPropertyPlugin.configure({
  initialState: {
    // @ts-expect-error Configuration values retain their plugin-owned types.
    prefix: 42,
  },
});
ConfiguredPropertyPlugin.configure({
  // @ts-expect-error Configuration is exact to the plugin descriptor.
  unknown: true,
});

// @ts-expect-error The compiled Plate model is a private registry resource.
void editor.api.plateModel;
// @ts-expect-error The compiled Plate model is not exposed through runtime.
void editor.runtime.model;

defineBasePlugin('exclusiveSchema', {
  // @ts-expect-error A plugin cannot own both an element and a mark.
  schema: {
    element: {},
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

defineBasePlugin('explicitMarkDescriptor', {
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

defineBasePlugin('advancedMarkDescriptor', {
  schema: {
    mark: {
      inclusive: false,
      property: property.string(),
      split: 'preserve',
      typeChange: 'preserve-if-allowed',
    },
  },
});

defineBasePlugin('requiredElementPropertyTarget', {
  schema: {
    properties: {
      // @ts-expect-error Element property placement requires an explicit target.
      value: schema.elementProperty(property.string()),
    },
  },
});

void configuredPrefix;
void configuredProperty;
void configuredTargetPlugin;
void explicitChildReference;
void extendedSchemaTargetType;
void plateExtendedSchemaTargetType;
void targetType;
