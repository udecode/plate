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
  type ExtendConfig,
  type InferConfig,
  type InferPluginDocumentType,
  NodeIdPlugin,
  normalizeNodeId,
  type NormalizePluginState,
  type PluginConfig,
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
  key: 'schemaTarget',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  type: 'schema-target',
});

type ExtendedTargetConfig = ExtendConfig<
  InferConfig<typeof TargetPlugin>,
  { enabled: boolean }
>;
declare const extendedTargetDocumentType: InferPluginDocumentType<ExtendedTargetConfig>;
const exactExtendedTargetDocumentType: 'schema-target' =
  extendedTargetDocumentType;
const ConfiguredTargetPlugin = TargetPlugin.configure({
  type: 'configured-schema-target',
});
const configuredTargetType: 'configured-schema-target' =
  ConfiguredTargetPlugin.type;
const configuredTargetReference: PluginReference<
  'schemaTarget',
  'configured-schema-target'
> = ConfiguredTargetPlugin;
const canonicalTargetReference: PluginReference<
  'schemaTarget',
  'configured-schema-target'
> = configuredTargetReference;
const configuredTargetEditor = createBaseEditor({
  plugins: [ConfiguredTargetPlugin],
});
const configuredTargetElement =
  configuredTargetEditor.read.schema.createAndFill(ConfiguredTargetPlugin);
const exactConfiguredTargetType: 'configured-schema-target' =
  configuredTargetElement.type;
const ConfiguredPlateTargetPlugin = toPlatePlugin(TargetPlugin).configure({
  type: 'configured-plate-schema-target',
});
const configuredPlateTargetType: 'configured-plate-schema-target' =
  ConfiguredPlateTargetPlugin.type;
const configuredPlateTargetEditor = createPlateEditor({
  plugins: [ConfiguredPlateTargetPlugin],
});
const configuredPlateTargetElement =
  configuredPlateTargetEditor.read.schema.createAndFill(
    ConfiguredPlateTargetPlugin
  );
const exactConfiguredPlateTargetType: 'configured-plate-schema-target' =
  configuredPlateTargetElement.type;

configuredTargetEditor.read.schema.handle(ConfiguredTargetPlugin);

void configuredTargetReference;
void canonicalTargetReference;
void exactConfiguredTargetType;
void configuredPlateTargetType;
void exactConfiguredPlateTargetType;
void configuredTargetType;
void exactExtendedTargetDocumentType;

const NoSchemaPlugin = createBasePlugin({ key: 'noSchemaElement' });
const noSchemaEditor = createBaseEditor({
  plugins: [NoSchemaPlugin],
});

// @ts-expect-error Plugins without schema.element are not element descriptors.
noSchemaEditor.read.schema.element(NoSchemaPlugin);
// @ts-expect-error Plugins without schema.element cannot construct elements.
noSchemaEditor.read.schema.createAndFill(NoSchemaPlugin);

const ConfiguredPropertyPlugin = createBasePlugin({
  key: 'configuredProperty',
  initialState: { prefix: 'configured' },
  schema: ({ initialState, own, plugins, targetPluginKeys, type }) => {
    const prefix: string = initialState.prefix;
    const targetPluginKey: string = targetPluginKeys[0];
    const ownedType: string = type;

    void prefix;
    void targetPluginKey;
    void ownedType;

    return {
      properties: [
        own.elementProperty(property.string(), {
          target: target.types(plugins.elementTypesByKey(targetPluginKeys)),
        }),
      ],
    };
  },
  targetPluginKeys: [TargetPlugin.key],
  type: 'configured-property',
});

const AmbiguousPropertyPlugin = createBasePlugin({
  key: 'ambiguousProperty',
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
  key: 'schemaMarkProperty',
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
  key: 'schemaElementProperty',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { tone: property.string() },
    },
  },
  type: 'schema-element-property',
});

const UninstalledElementPropertyPlugin = createBasePlugin({
  key: 'uninstalledSchemaElementProperty',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: { tone: property.string() },
    },
  },
  type: 'uninstalled-schema-element-property',
});

const configuredPrefix: string = ConfiguredPropertyPlugin.initialState.prefix;
const configuredTargetPluginKey: string =
  ConfiguredPropertyPlugin.targetPluginKeys[0];

const PluginReferenceStatePlugin = createBasePlugin({
  key: 'pluginReferenceState',
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
  key: 'pluginResourceState',
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

// @ts-expect-error Plugin target keys are immutable.
ConfiguredPropertyPlugin.targetPluginKeys.push(TargetPlugin.key);

const editor = createBaseEditor({
  plugins: [
    TargetPlugin,
    ConfiguredPropertyPlugin,
    ElementPropertyPlugin,
    MarkPropertyPlugin,
    AmbiguousPropertyPlugin,
  ],
});

const requirePluginReference = <T extends PluginReference>(plugin: T) => plugin;
const ReferenceChildPlugin = createBasePlugin({
  dependencies: [TargetPlugin, ElementPropertyPlugin],
  key: 'schemaReferenceChild',
});
const DependencyInferencePlugin = createBasePlugin({
  key: 'schemaDependencyInference',
  api: {
    readDependencyInference: () => 'dependency' as const,
  },
}).extend(() => ({
  update: () => ({
    writeDependencyInference: () => undefined,
  }),
}));
const NestedInferencePlugin = createBasePlugin({
  key: 'schemaNestedInference',
  api: { readNestedInference: () => 'nested' as const },
}).extend(() => ({
  update: () => ({ writeNestedInference: () => undefined }),
}));
export const InferenceTreePlugin = createBasePlugin({
  dependencies: [DependencyInferencePlugin, NestedInferencePlugin],
  key: 'schemaInferenceTree',
});
const ExplicitReferenceParentPlugin = createBasePlugin<
  PluginConfig<
    'explicitSchemaReferenceParent',
    {},
    {},
    {},
    {},
    {},
    readonly [typeof TargetPlugin]
  >
>({
  dependencies: [TargetPlugin],
  key: 'explicitSchemaReferenceParent',
});
const exactInferredChildPlugin: typeof TargetPlugin =
  ReferenceChildPlugin.dependencies[0];
export const exactInferredDependencyPlugin: typeof DependencyInferencePlugin =
  InferenceTreePlugin.dependencies[0];
export const exactInferredNestedPlugin: typeof NestedInferencePlugin =
  InferenceTreePlugin.dependencies[1];
const explicitChildReference: PluginReference =
  ExplicitReferenceParentPlugin.dependencies[0];
const explicitParentAtErasedBoundary: AnyBasePlugin =
  ExplicitReferenceParentPlugin;
const exactEmptyOptionsAtErasedBoundary: AnyBasePlugin = createBasePlugin<
  PluginConfig<'exactEmptyOptions', Record<string, never>>
>({ key: 'exactEmptyOptions' });
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

nestedReferenceEditor.getPlugin(TargetPlugin);
nestedReferenceEditor.read.schema.element(TargetPlugin);
nestedReferenceEditor.read.schema.handle(TargetPlugin);
nestedReferenceEditor.read.schema.property(ElementPropertyPlugin);
erasedCollectionEditor.read.schema.element(TargetPlugin);
erasedCollectionEditor.read.schema.handle(UninstalledElementPropertyPlugin);
erasedCollectionEditor.read.schema.property(UninstalledElementPropertyPlugin);
void explicitParentAtErasedBoundary;
void exactEmptyOptionsAtErasedBoundary;
void exactDependencyApiResult;
void exactDependencyUpdate;
void exactInferredDependencyPlugin;
void exactInferredNestedPlugin;
void exactNestedApiResult;
void exactNestedUpdate;
void broadInferenceTreePlateEditor;

requirePluginReference(TargetPlugin);
requirePluginReference(TargetPlugin.clone());
requirePluginReference(TargetPlugin.configure({ enabled: true }));
requirePluginReference(TargetPlugin.extend({ editOnly: true }));
requirePluginReference(TargetPlugin.extend(() => ({ enabled: true })));
requirePluginReference(
  TargetPlugin.extend(() => ({
    extension: { api: { nominalEditorApi: () => true } },
  }))
);
requirePluginReference(
  TargetPlugin.extend(() => ({ api: { nominalPluginApi: () => true } }))
);
requirePluginReference(
  TargetPlugin.extend(() => ({ selectors: { nominalSelector: () => true } }))
);
requirePluginReference(
  TargetPlugin.extend(() => ({ update: () => ({ nominalTx: () => true }) }))
);
requirePluginReference(
  TargetPlugin.extend(() => ({
    extension: {
      tx: {
        nominalGroup: () => ({
          nominalTx: () => true,
        }),
      },
    },
  }))
);
requirePluginReference(
  TargetPlugin.extend({
    extension: {
      api: { nominalExtension: { read: () => true } },
    },
  })
);
const PlateTargetPlugin = toPlatePlugin(TargetPlugin);
const PlateReferenceChildPlugin = toPlatePlugin(ReferenceChildPlugin);
const ExtendedSchemaTargetPlugin = TargetPlugin.extend(() => ({
  api: {
    schemaModelProof: () => true,
  },
})).extend({
  extension: {
    api: { schemaModelProof: { read: () => true } },
  },
});
const PlateExtendedSchemaTargetPlugin = toPlatePlugin(
  ExtendedSchemaTargetPlugin
).extend(() => ({ selectors: { schemaModelProof: () => true } }));
const schemaModelEditor = createBaseEditor({
  plugins: [ExtendedSchemaTargetPlugin, PlateExtendedSchemaTargetPlugin],
});
const extendedSchemaTargetType: 'schema-target' =
  schemaModelEditor.read.schema.createAndFill(ExtendedSchemaTargetPlugin).type;
const plateExtendedSchemaTargetType: 'schema-target' =
  schemaModelEditor.read.schema.createAndFill(
    PlateExtendedSchemaTargetPlugin
  ).type;

requirePluginReference(createPlatePlugin({ key: 'createdPlateReference' }));
requirePluginReference(PlateTargetPlugin);
requirePluginReference(toPlatePlugin(TargetPlugin, { editOnly: true }));
requirePluginReference(toPlatePlugin(TargetPlugin, () => ({ enabled: true })));
requirePluginReference(PlateTargetPlugin.clone());
requirePluginReference(PlateTargetPlugin.configure({ enabled: true }));
requirePluginReference(PlateTargetPlugin.extend({ editOnly: true }));
requirePluginReference(PlateTargetPlugin.extend(() => ({ enabled: true })));
requirePluginReference(
  PlateTargetPlugin.extend(() => ({
    extension: { api: { nominalEditorApi: () => true } },
  }))
);
requirePluginReference(
  PlateTargetPlugin.extend(() => ({ api: { nominalPluginApi: () => true } }))
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
    extension: {
      tx: {
        nominalPlateGroup: () => ({
          nominalTx: () => true,
        }),
      },
    },
  }))
);
requirePluginReference(
  PlateTargetPlugin.extend({
    extension: {
      api: { nominalPlateExtension: { read: () => true } },
    },
  })
);
requirePluginReference(PlateTargetPlugin.configure({ component: () => null }));
requirePluginReference(PlateReferenceChildPlugin);
requirePluginReference(editor.getPlugin(TargetPlugin));
requirePluginReference(editor.plugin(TargetPlugin).plugin);

// @ts-expect-error Structurally matching objects are not plugin descriptors.
requirePluginReference({ key: 'schemaTarget', type: 'schema-target' });
// @ts-expect-error Key-only objects cannot forge Plate plugin references.
requirePluginReference({ key: 'schemaTarget' });

const targetElement = editor.read.schema.createAndFill(TargetPlugin, {
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
  editor.read.schema.handle(ElementPropertyPlugin),
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
export const targetHandle = editor.read.schema.handle(TargetPlugin);
const handledTarget = editor.read.schema.createAndFill(targetHandle, {
  'second-property': 1,
});
export const targetSecondPropertyHandle = schema.handle.property(
  targetHandle,
  'second-property'
);
const handledTargetSecondProperty: number | undefined =
  editor.read.schema.getElementProperty(
    handledTarget,
    targetSecondPropertyHandle
  );

// @ts-expect-error Handles expose only properties in the composed editor schema.
schema.handle.property(targetHandle, 'unknown-property');

editor.read.schema.element(TargetPlugin);
void configuredSchemaProperty;
void elementSchemaProperty;
void handledElementSchemaProperty;
void handledTargetSecondProperty;
void markSchemaProperty;
void nodeIdProperty;
void exactNormalizedNodeIdValue;
void stringOnlyNodeId;
// @ts-expect-error Property values come from the composed Plate plugin schema.
editor.read.schema.createAndFill(TargetPlugin, { 'first-property': 42 });
// @ts-expect-error Property-only plugins cannot construct elements.
editor.read.schema.createAndFill(AmbiguousPropertyPlugin);
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
// @ts-expect-error Exact editors reject uninstalled element handles.
editor.read.schema.handle(UninstalledElementPropertyPlugin);
editor.read.schema.handle<
  // @ts-expect-error The composed schema witness is editor-owned and cannot be selected by callers.
  typeof TargetPlugin,
  typeof UninstalledElementPropertyPlugin
>(TargetPlugin);

ConfiguredPropertyPlugin.configure({ initialState: { prefix: 'next' } });
ConfiguredPropertyPlugin.configure({
  targetPluginKeys: [TargetPlugin.key],
});
ConfiguredPropertyPlugin.configure({
  // @ts-expect-error Plugin target keys are strings.
  targetPluginKeys: [42],
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
  key: 'exclusiveSchema',
  // @ts-expect-error A plugin cannot own both an element and a mark.
  schema: {
    element: {},
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

createBasePlugin({
  key: 'explicitMarkDescriptor',
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
});

createBasePlugin({
  key: 'advancedMarkDescriptor',
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
  key: 'requiredElementPropertyTarget',
  schema: ({ own }) => ({
    properties: [
      // @ts-expect-error Element property placement requires an explicit target.
      own.elementProperty(property.string()),
    ],
  }),
});

void configuredPrefix;
void configuredProperty;
void configuredTargetPluginKey;
void exactInferredChildPlugin;
void explicitChildReference;
void extendedSchemaTargetType;
void handledTarget;
void plateExtendedSchemaTargetType;
void targetType;
