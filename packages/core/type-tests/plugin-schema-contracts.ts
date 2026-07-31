import {
  type EditorSchemaProperty,
  type PropertyJsonValue,
  property,
  schema,
  target,
  type Value,
} from '@platejs/plite';
import {
  type AnyBasePlugin,
  createBaseEditor,
  createBasePlugin,
  type DefinitionOf,
  NodeIdPlugin,
  normalizeNodeId,
  type NormalizePluginState,
  type PluginReference,
} from '@platejs/core';
import {
  createPlateEditor,
  createPlatePlugin,
  type PlateCorePlugin,
  type PlateEditor,
  toPlatePlugin,
} from '@platejs/core/react';

const TargetPlugin = createBasePlugin({
  name: 'schemaTarget',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  type: 'schema-target',
});

const ExtendedTargetPlugin = TargetPlugin.extend({
  initialState: { enabled: true },
});
type ExtendedTargetDefinition = DefinitionOf<typeof ExtendedTargetPlugin>;
declare const extendedTargetDocumentType: ExtendedTargetDefinition['type'];
const exactExtendedTargetDocumentType: 'schema-target' =
  extendedTargetDocumentType;
const ConfiguredTargetPlugin = TargetPlugin.configure({});
const configuredTargetType: 'schema-target' = ConfiguredTargetPlugin.type;
const configuredTargetReference: PluginReference<
  'schemaTarget',
  'schema-target'
> = ConfiguredTargetPlugin;
const canonicalTargetReference: PluginReference<
  'schemaTarget',
  'schema-target'
> = configuredTargetReference;
const configuredTargetEditor = createBaseEditor({
  plugins: [ConfiguredTargetPlugin],
});
const configuredTargetElement = configuredTargetEditor.read.schema.create(
  ConfiguredTargetPlugin
);
const exactConfiguredTargetType: 'schema-target' = configuredTargetElement.type;
const ConfiguredPlateTargetPlugin = toPlatePlugin(TargetPlugin).configure({});
const configuredPlateTargetType: 'schema-target' =
  ConfiguredPlateTargetPlugin.type;
const configuredPlateTargetEditor = createPlateEditor({
  plugins: [ConfiguredPlateTargetPlugin],
});
const configuredPlateTargetElement =
  configuredPlateTargetEditor.read.schema.create(ConfiguredPlateTargetPlugin);
const exactConfiguredPlateTargetType: 'schema-target' =
  configuredPlateTargetElement.type;

configuredTargetEditor.read.schema.isElementTypeInGroup(
  ConfiguredTargetPlugin,
  'textBlock'
);

void configuredTargetReference;
void canonicalTargetReference;
void exactConfiguredTargetType;
void configuredPlateTargetType;
void exactConfiguredPlateTargetType;
void configuredTargetType;
void exactExtendedTargetDocumentType;

const NoSchemaPlugin = createBasePlugin({ name: 'noSchemaElement' });
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

const ConfiguredPropertyPlugin = createBasePlugin({
  name: 'configuredProperty',
  initialState: configuredPropertyInitialState,
  schema: ({ initialState, own, plugins, targetPluginNames, type }) => {
    const prefix: string = initialState.prefix;
    const targetPluginName: 'schemaTarget' = targetPluginNames[0];
    const ownedType: 'configured-property' = type;

    void prefix;
    void targetPluginName;
    void ownedType;

    return {
      properties: [
        own.elementProperty(property.string(), {
          target: target.types(plugins.elementTypesByName(targetPluginNames)),
        }),
      ],
    };
  },
  targetPluginNames: [TargetPlugin.name],
  type: 'configured-property',
});

const AmbiguousPropertyPlugin = createBasePlugin({
  name: 'ambiguousProperty',
  schema: {
    properties: [
      schema.elementProperty('first-property', property.string(), {
        target: target.type('schema-target'),
      }),
      schema.elementProperty('second-property', property.number(), {
        target: target.type('schema-target'),
      }),
    ],
  },
  type: 'ambiguous-property',
});

const MarkPropertyPlugin = createPlatePlugin({
  name: 'schemaMarkProperty',
  schema: {
    mark: {
      inclusive: false,
      property: property.string(),
      split: 'preserve',
    },
  },
  type: 'schema-mark-property',
});

const ElementPropertyPlugin = createPlatePlugin({
  name: 'schemaElementProperty',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { tone: property.string() },
    },
  },
  type: 'schema-element-property',
});

const UninstalledElementPropertyPlugin = createBasePlugin({
  name: 'uninstalledSchemaElementProperty',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { tone: property.string() },
    },
  },
  type: 'uninstalled-schema-element-property',
});

const configuredPrefix: string = ConfiguredPropertyPlugin.initialState.prefix;
const configuredTargetPluginName: string =
  ConfiguredPropertyPlugin.targetPluginNames[0];

const PluginReferenceStatePlugin = createBasePlugin({
  name: 'pluginReferenceState',
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
const exactTargetReference: PluginReference<'schemaTarget', 'schema-target'> =
  targetReference;
const exactNestedTargetReference: PluginReference<
  'schemaTarget',
  'schema-target'
> = nestedTargetReference;
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
const PluginResourceStatePlugin = createBasePlugin({
  name: 'pluginResourceState',
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
ConfiguredPropertyPlugin.targetPluginNames.push(TargetPlugin.name);

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
const ReferenceChildPlugin = createBasePlugin({
  dependencies: [TargetPlugin, ElementPropertyPlugin],
  name: 'schemaReferenceChild',
});
const DependencyInferencePlugin = createBasePlugin({
  api: () => ({
    readDependencyInference: () => 'dependency' as const,
  }),
  name: 'schemaDependencyInference',
  update: () => ({
    writeDependencyInference: () => undefined,
  }),
});
const NestedInferencePlugin = createBasePlugin({
  api: () => ({ readNestedInference: () => 'nested' as const }),
  name: 'schemaNestedInference',
  update: () => ({ writeNestedInference: () => undefined }),
});
export const InferenceTreePlugin = createBasePlugin({
  dependencies: [DependencyInferencePlugin, NestedInferencePlugin],
  name: 'schemaInferenceTree',
});
const ExplicitReferenceParentPlugin = createBasePlugin({
  dependencies: [TargetPlugin],
  name: 'explicitSchemaReferenceParent',
});
const exactInferredChildPluginName: 'schemaTarget' =
  ReferenceChildPlugin.dependencies[0].name;
export const exactInferredDependencyPluginName: 'schemaDependencyInference' =
  InferenceTreePlugin.dependencies[0].name;
export const exactInferredNestedPluginName: 'schemaNestedInference' =
  InferenceTreePlugin.dependencies[1].name;
const explicitChildReference: PluginReference<'schemaTarget', 'schema-target'> =
  ExplicitReferenceParentPlugin.dependencies[0];
const explicitParentAtErasedBoundary: AnyBasePlugin =
  ExplicitReferenceParentPlugin;
const exactEmptyStateAtErasedBoundary: AnyBasePlugin = createBasePlugin({
  name: 'exactEmptyState',
});
const erasedPluginCollection: readonly AnyBasePlugin[] = [TargetPlugin];
const erasedCollectionEditor = createBaseEditor({
  plugins: erasedPluginCollection,
});
const nestedReferenceEditor = createBaseEditor({
  plugins: [ReferenceChildPlugin],
});
export const inferenceTreeEditor = createBaseEditor({
  plugins: [InferenceTreePlugin],
});
const inferenceTreeValue: Value = [];
export const inferenceTreePlateEditor = createPlateEditor({
  plugins: [InferenceTreePlugin],
  initialValue: inferenceTreeValue,
});
export const broadInferenceTreePlateEditor: PlateEditor<
  Value,
  PlateCorePlugin
> = inferenceTreePlateEditor;
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

void nestedReferenceEditor.plugin(TargetPlugin).plugin;
nestedReferenceEditor.read.schema.element(TargetPlugin);
nestedReferenceEditor.read.schema.isElementTypeInGroup(
  TargetPlugin,
  'textBlock'
);
nestedReferenceEditor.read.schema.property(ElementPropertyPlugin);
erasedCollectionEditor.read.schema.element(TargetPlugin);
erasedCollectionEditor.read.schema.property(UninstalledElementPropertyPlugin);
void explicitParentAtErasedBoundary;
void exactEmptyStateAtErasedBoundary;
void exactDependencyApiResult;
void exactDependencyUpdate;
void exactInferredDependencyPluginName;
void exactInferredNestedPluginName;
void exactInferredChildPluginName;
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
const extendedSchemaTargetType: 'schema-target' =
  schemaInferenceEditor.read.schema.create(ExtendedSchemaTargetPlugin).type;
const plateExtendedSchemaTargetType: 'schema-target' =
  schemaInferenceEditor.read.schema.create(
    PlateExtendedSchemaTargetPlugin
  ).type;

requirePluginReference(createPlatePlugin({ name: 'createdPlateReference' }));
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
requirePluginReference(editor.plugin(TargetPlugin).plugin);
requirePluginReference(editor.plugin(TargetPlugin).plugin);

// @ts-expect-error Structurally matching objects are not plugin descriptors.
requirePluginReference({ name: 'schemaTarget', type: 'schema-target' });
// @ts-expect-error Name-only objects cannot forge Plate plugin references.
requirePluginReference({ name: 'schemaTarget' });

const targetElement = editor.read.schema.create(TargetPlugin, {
  'first-property': 'center',
});
const targetType: 'schema-target' = targetElement.type;
const configuredProperty: string | undefined =
  editor.read.schema.getElementProperty(
    targetElement,
    ConfiguredPropertyPlugin
  );
const configuredSchemaProperty: EditorSchemaProperty | null =
  editor.read.schema.property(ConfiguredPropertyPlugin);
const elementSchemaProperty: EditorSchemaProperty | null =
  editor.read.schema.property(ElementPropertyPlugin);
const markSchemaProperty: EditorSchemaProperty | null =
  editor.read.schema.property(MarkPropertyPlugin);
const elementPropertyHandle = schema.handle.property(
  schema.handle.element(ElementPropertyPlugin, ElementPropertyPlugin.type),
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
  nodeIdEditor.read.schema.getElementProperty(targetElement, NodeIdPlugin);
// @ts-expect-error JSON-valued node ids are not guaranteed to be strings.
const stringOnlyNodeId: string | undefined =
  nodeIdEditor.read.schema.getElementProperty(targetElement, NodeIdPlugin);
editor.read.schema.element(TargetPlugin);
void configuredSchemaProperty;
void elementSchemaProperty;
void handledElementSchemaProperty;
void markSchemaProperty;
void nodeIdProperty;
void exactNormalizedNodeIdValue;
void stringOnlyNodeId;
// @ts-expect-error Property values come from the composed Plate plugin schema.
editor.read.schema.create(TargetPlugin, { 'first-property': 42 });
// @ts-expect-error Property-only plugins cannot construct elements.
editor.read.schema.create(AmbiguousPropertyPlugin);
// @ts-expect-error Ambiguous property plugins require an explicit Plite handle.
editor.read.schema.getElementProperty(targetElement, AmbiguousPropertyPlugin);
// @ts-expect-error Element-only plugins do not identify a schema property.
editor.read.schema.property(TargetPlugin);
// @ts-expect-error Ambiguous property plugins require an explicit Plite handle.
editor.read.schema.property(AmbiguousPropertyPlugin);
editor.read.schema.getElementProperty(
  targetElement,
  // @ts-expect-error Exact editors reject uninstalled property descriptors.
  UninstalledElementPropertyPlugin
);
// @ts-expect-error Exact editors reject uninstalled property descriptors.
editor.read.schema.property(UninstalledElementPropertyPlugin);
ConfiguredPropertyPlugin.configure({ initialState: { prefix: 'next' } });
ConfiguredPropertyPlugin.configure({
  targetPluginNames: [TargetPlugin.name],
});
ConfiguredPropertyPlugin.configure({
  // @ts-expect-error Plugin target names are strings.
  targetPluginNames: [42],
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

createBasePlugin({
  name: 'exclusiveSchema',
  // @ts-expect-error A plugin cannot own both an element and a mark.
  schema: {
    element: {},
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

createBasePlugin({
  name: 'explicitMarkDescriptor',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

createBasePlugin({
  name: 'advancedMarkDescriptor',
  schema: {
    mark: {
      inclusive: false,
      property: property.string(),
      split: 'preserve',
      typeChange: 'preserve-if-allowed',
    },
  },
});

createBasePlugin({
  name: 'requiredElementPropertyTarget',
  schema: ({ own }) => ({
    properties: [
      // @ts-expect-error Element property placement requires an explicit target.
      own.elementProperty(property.string()),
    ],
  }),
});

void configuredPrefix;
void configuredProperty;
void configuredTargetPluginName;
void explicitChildReference;
void extendedSchemaTargetType;
void plateExtendedSchemaTargetType;
void targetType;
