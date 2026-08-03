import {
  type EditorSchemaProperty,
  type PropertyJsonValue,
  property,
  schema,
  target,
} from '@platejs/plite';
import {
  createBaseEditor,
  defineBasePlugin,
  type BaseEditor,
  type DefinitionOf,
  NodeIdPlugin,
  normalizeNodeId,
  type PluginReference,
} from '@platejs/core';
import type { AnyBasePlugin } from '../src/lib/plugin/BasePlugin';
import type { NormalizePluginState } from '../src/lib/plugin/PluginDefinition';
import {
  createPlateEditor,
  definePlatePlugin,
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

// @ts-expect-error Plugins without schema.element are not element descriptors.
noSchemaEditor.read.schema.element(NoSchemaPlugin);
// @ts-expect-error Plugins without schema.element cannot construct elements.
noSchemaEditor.read.schema.create(NoSchemaPlugin);

type ConfiguredPropertyPluginState = {
  prefix: string;
};

const configuredPropertyInitialState: ConfiguredPropertyPluginState = {
  prefix: 'configured',
};

const ConfiguredPropertyPlugin = defineBasePlugin('configuredProperty', {
  initialState: configuredPropertyInitialState,
  schema: ({ initialState, own, targetElementTypes }) => {
    const prefix: string = initialState.prefix;
    const targetElementType: string = targetElementTypes[0]!;
    const ownedKey: 'configuredProperty' = own.key;

    void prefix;
    void targetElementType;
    void ownedKey;

    return {
      properties: [
        own.elementProperty(property.string(), {
          target: target.types(targetElementTypes),
        }),
      ],
    };
  },
  targetPlugins: [TargetPlugin],
});

const AmbiguousPropertyPlugin = defineBasePlugin('ambiguousProperty', {
  schema: {
    properties: [
      schema.elementProperty('first-property', property.string(), {
        target: target.type('schemaTarget'),
      }),
      schema.elementProperty('second-property', property.number(), {
        target: target.type('schemaTarget'),
      }),
    ],
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
    properties: [
      schema.elementProperty('firstProperty', property.string(), {
        target: target.group('element'),
      }),
      schema.elementProperty('secondProperty', property.number(), {
        target: target.group('element'),
      }),
    ],
  },
});
const aggregatePropertiesEditor = createBaseEditor({
  plugins: [AggregatePropertiesPlugin],
});
// @ts-expect-error aggregate property contributors do not own one primary key
void aggregatePropertiesEditor.plugin(AggregatePropertiesPlugin).key;

const ExplicitPlateElementPlugin = definePlatePlugin('plateElementOwner', {
  schema: { element: schema.element.textBlock() },
  type: 'plateElementDocumentType',
  update: ({ type }) => {
    const exactType: 'plateElementDocumentType' = type;

    return { identity: () => exactType };
  },
});
const explicitPlateElementType: 'plateElementDocumentType' =
  ExplicitPlateElementPlugin.type;
const noPlateElementKey: undefined = ExplicitPlateElementPlugin.key;

const ExplicitPlateMarkPlugin = definePlatePlugin('plateMarkOwner', {
  api: ({ key }) => {
    const exactKey: 'plateMarkDocumentKey' = key;

    return { identity: () => exactKey };
  },
  key: 'plateMarkDocumentKey',
  schema: { mark: property.boolean() },
});
const explicitPlateMarkKey: 'plateMarkDocumentKey' =
  ExplicitPlateMarkPlugin.key;
const noPlateMarkType: undefined = ExplicitPlateMarkPlugin.type;

void explicitPlateElementType;
void explicitPlateMarkKey;
void noPlateElementKey;
void noPlateMarkType;

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
erasedCollectionEditor.read.schema.element(TargetPlugin.type);
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
const configuredProperty: string | undefined =
  editor.read.schema.getElementProperty(targetElement, 'configured-property');
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
const elementPropertyHandle = schema.handle.property(
  schema.handle.element(
    ElementPropertyPlugin,
    editor.plugin(ElementPropertyPlugin).type
  ),
  'tone'
);
const handledElementSchemaProperty: EditorSchemaProperty | null =
  editor.read.schema.property(elementPropertyHandle);
const nodeIdEditor = createBaseEditor({
  plugins: [TargetPlugin, NodeIdPlugin],
});
NodeIdPlugin.configure({
  initialState: {
    idCreator: () => 'node-id',
  },
});
NodeIdPlugin.configure({
  initialState: {
    // @ts-expect-error Generated node ids are strings.
    idCreator: () => 1,
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
const exactNormalizedNodeIdValue: ExactNodeIdValue =
  normalizeNodeId(exactNodeIdValue);
const nodeIdProperty: PropertyJsonValue | undefined =
  nodeIdEditor.read.schema.getElementProperty<PropertyJsonValue>(
    targetElement,
    'id'
  );
editor.read.schema.element(TargetPlugin);
void configuredSchemaProperty;
void elementSchemaProperty;
void handledElementSchemaProperty;
void markSchemaProperty;
void nodeIdProperty;
void exactNormalizedNodeIdValue;
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
  schema: ({ own }) => ({
    properties: [
      // @ts-expect-error Element property placement requires an explicit target.
      own.elementProperty(property.string()),
    ],
  }),
});

void configuredPrefix;
void configuredProperty;
void configuredTargetPlugin;
void explicitChildReference;
void extendedSchemaTargetType;
void plateExtendedSchemaTargetType;
void targetType;
