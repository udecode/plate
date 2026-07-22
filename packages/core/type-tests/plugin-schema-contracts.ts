import {
  definePropertyPolicy,
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
  definePluginHostPolicy,
  type ExtendConfig,
  getPluginHostPolicyResource,
  type ImmutablePluginConfiguration,
  type InferConfig,
  type InferPluginDocumentType,
  isPluginHostPolicy,
  NodeIdPlugin,
  type PluginHostPolicy,
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

const HostPolicy = definePluginHostPolicy({
  id: 'plate-test:core:host-policy-type',
  resource: {
    parse: (value: string) => value.toUpperCase(),
    rules: ['paragraph'] as const,
  },
  version: 1,
});
const ConfigPropertyPolicy = definePropertyPolicy({
  id: 'plate-test:core:immutable-plugin-config',
  validate: (value): value is string => typeof value === 'string',
  version: 1,
});
const exactHostPolicy: PluginHostPolicy<{
  parse: (value: string) => string;
  rules: readonly ['paragraph'];
}> = HostPolicy;
const parsedHostPolicyValue: string =
  getPluginHostPolicyResource(HostPolicy).parse('plate');
const unknownHostPolicy: unknown = HostPolicy;

if (isPluginHostPolicy(unknownHostPolicy)) {
  const hostPolicyId: string = unknownHostPolicy.id;

  void hostPolicyId;
}

// @ts-expect-error Host policy identity is nominal, not structurally forgeable.
const forgedHostPolicy: PluginHostPolicy<{ value: number }> = {
  id: 'plate-test:core:forged-host-policy',
  version: 1,
};

void exactHostPolicy;
void forgedHostPolicy;
void parsedHostPolicyValue;

declare const immutablePluginConfigSymbol: symbol;

// @ts-expect-error bigint is not a valid immutable plugin config value.
const invalidBigintPluginConfig: ImmutablePluginConfiguration<bigint> = 1n;
// @ts-expect-error symbols are not valid immutable plugin config values.
const invalidSymbolPluginConfig: ImmutablePluginConfiguration<symbol> =
  immutablePluginConfigSymbol;

void invalidBigintPluginConfig;
void invalidSymbolPluginConfig;

const TargetPlugin = createBasePlugin({
  key: 'schemaTarget',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  type: 'schema-target',
});

const ImmutableConfigPlugin = createBasePlugin({
  config: {
    count: 1,
    enabled: true,
    hostPolicy: HostPolicy,
    label: 'schema-target',
    nullable: null,
    optional: undefined,
    policy: ConfigPropertyPolicy,
    targets: [TargetPlugin],
  },
  key: 'immutableConfig',
});
const exactImmutableConfigCount: number = ImmutableConfigPlugin.config.count;
const exactImmutableConfigEnabled: boolean =
  ImmutableConfigPlugin.config.enabled;
const exactImmutableConfigHostPolicy: typeof HostPolicy =
  ImmutableConfigPlugin.config.hostPolicy;
const exactImmutableConfigLabel: string = ImmutableConfigPlugin.config.label;
const exactImmutableConfigPolicy: typeof ConfigPropertyPolicy =
  ImmutableConfigPlugin.config.policy;
const exactImmutableConfigTarget: PluginReference<
  'schemaTarget',
  'schema-target'
> = ImmutableConfigPlugin.config.targets[0];

createBasePlugin({
  // @ts-expect-error plugin descriptors reject bigint config values.
  config: {
    invalid: 1n,
  },
  key: 'invalidBigintConfig',
});

createBasePlugin({
  // @ts-expect-error plugin descriptors reject symbol config values.
  config: {
    invalid: immutablePluginConfigSymbol,
  },
  key: 'invalidSymbolConfig',
});

void exactImmutableConfigCount;
void exactImmutableConfigEnabled;
void exactImmutableConfigHostPolicy;
void exactImmutableConfigLabel;
void exactImmutableConfigPolicy;
void exactImmutableConfigTarget;
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
declare const configuredTargetConfiguration: ImmutablePluginConfiguration<{
  targets: readonly [typeof ConfiguredTargetPlugin];
}>;
const configuredTargetType: 'configured-schema-target' =
  ConfiguredTargetPlugin.type;
const configuredTargetReference: PluginReference<
  'schemaTarget',
  'configured-schema-target'
> = configuredTargetConfiguration.targets[0];
declare const canonicalTargetReferenceConfiguration: ImmutablePluginConfiguration<{
  target: PluginReference<'schemaTarget', 'configured-schema-target'>;
}>;
const canonicalTargetReference: PluginReference<
  'schemaTarget',
  'configured-schema-target'
> = canonicalTargetReferenceConfiguration.target;
const configuredTargetEditor = createBaseEditor({
  plugins: [ConfiguredTargetPlugin],
});
const configuredTargetElement =
  configuredTargetEditor.read.schema.createAndFill(ConfiguredTargetPlugin);
const exactConfiguredTargetType: 'configured-schema-target' =
  configuredTargetElement.type;

configuredTargetEditor.read.schema.handle(ConfiguredTargetPlugin);

void configuredTargetReference;
void canonicalTargetReference;
void exactConfiguredTargetType;
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
  config: {
    prefix: 'configured',
    targets: [TargetPlugin] as const,
  },
  host: {
    dangerouslyAllowAttributes: ['data-owner'],
  },
  key: 'configuredProperty',
  schema: ({ config, own, plugins, type }) => {
    const prefix: string = config.prefix;
    const targetPlugin: PluginReference<'schemaTarget'> = config.targets[0];
    const ownedType: string = type;

    // @ts-expect-error Schema factories cannot read mutable runtime options.
    const runtimeOptions = config.options;

    void prefix;
    void targetPlugin;
    void ownedType;
    void runtimeOptions;

    return {
      properties: [
        own.elementProperty(property.string(), {
          target: target.types(plugins.elementTypes(config.targets)),
        }),
      ],
    };
  },
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

const configuredPrefix: string = ConfiguredPropertyPlugin.config.prefix;
const configuredTarget: PluginReference<'schemaTarget'> =
  ConfiguredPropertyPlugin.config.targets[0];

// @ts-expect-error Plugin config is immutable after descriptor construction.
ConfiguredPropertyPlugin.config.prefix = 'changed';
// @ts-expect-error Nested plugin config arrays are immutable.
ConfiguredPropertyPlugin.config.targets.push(TargetPlugin);
// @ts-expect-error Plugin references expose immutable identity only.
ConfiguredPropertyPlugin.config.targets[0].type = 'changed';
// @ts-expect-error Plugin references do not expose mutable plugin config.
ConfiguredPropertyPlugin.config.targets[0].config.prefix = 'changed';

const editor = createBaseEditor({
  plugins: [
    TargetPlugin,
    ConfiguredPropertyPlugin,
    ElementPropertyPlugin,
    MarkPropertyPlugin,
    AmbiguousPropertyPlugin,
  ],
});

// @ts-expect-error Published components are immutable.
editor.runtime.components.test = () => null;
// @ts-expect-error Published component registries cannot be replaced.
editor.runtime.components = {};
// @ts-expect-error Published plugin lists are immutable.
editor.runtime.pluginList.push(TargetPlugin);
// @ts-expect-error Published plugin lists cannot be replaced.
editor.runtime.pluginList = [];
// @ts-expect-error Published plugin-cache indexes are immutable.
editor.runtime.pluginCache.decorate.push('test');
// @ts-expect-error Published plugin-cache maps are immutable.
editor.runtime.pluginCache.node.types.test = 'test';
// @ts-expect-error Published plugin caches cannot be replaced.
editor.runtime.pluginCache = {};
// @ts-expect-error Published input-rule indexes are immutable.
editor.runtime.inputRules.insertBreak.push();
// @ts-expect-error Published input-rule maps are immutable.
editor.runtime.inputRules.insertText.byTrigger.test = [];
// @ts-expect-error Published input-rule descriptors are immutable.
editor.runtime.inputRules.insertBreak[0].priority = 0;
// @ts-expect-error Published input-rule registries cannot be replaced.
editor.runtime.inputRules = {};
// @ts-expect-error Published shortcut maps are immutable.
editor.runtime.shortcuts.test = null;
// @ts-expect-error Published shortcut descriptors are immutable.
editor.runtime.shortcuts.test!.priority = 0;
// @ts-expect-error Published shortcut registries cannot be replaced.
editor.runtime.shortcuts = {};

const requirePluginReference = <T extends PluginReference>(plugin: T) => plugin;
const ReferenceChildPlugin = createBasePlugin({
  key: 'schemaReferenceChild',
  plugins: [TargetPlugin, ElementPropertyPlugin],
});
const ReferenceParentPlugin = createBasePlugin({
  key: 'schemaReferenceParent',
  plugins: [ReferenceChildPlugin],
});
const DependencyInferencePlugin = createBasePlugin({
  key: 'schemaDependencyInference',
})
  .extendApi(() => ({
    readDependencyInference: () => 'dependency' as const,
  }))
  .extendTx(() => () => ({
    writeDependencyInference: () => undefined,
  }));
const NestedInferencePlugin = createBasePlugin({
  key: 'schemaNestedInference',
})
  .extendApi(() => ({ readNestedInference: () => 'nested' as const }))
  .extendTx(() => () => ({ writeNestedInference: () => undefined }));
export const InferenceTreePlugin = createBasePlugin({
  dependencies: [DependencyInferencePlugin],
  key: 'schemaInferenceTree',
  plugins: [NestedInferencePlugin],
});
const ExplicitReferenceParentPlugin = createBasePlugin<
  PluginConfig<'explicitSchemaReferenceParent'>
>({
  key: 'explicitSchemaReferenceParent',
  plugins: [TargetPlugin],
});
const exactInferredChildPlugin: typeof TargetPlugin =
  ReferenceChildPlugin.plugins[0];
export const exactInferredDependencyPlugin: typeof DependencyInferencePlugin =
  InferenceTreePlugin.dependencies[0];
export const exactInferredNestedPlugin: typeof NestedInferencePlugin =
  InferenceTreePlugin.plugins[0];
const explicitChildReference: PluginReference =
  ExplicitReferenceParentPlugin.plugins[0];
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
  plugins: [ReferenceParentPlugin],
});
export const inferenceTreeEditor = createBaseEditor({
  plugins: [InferenceTreePlugin],
});
const inferenceTreeValue: Value = [];
export const inferenceTreePlateEditor = createPlateEditor({
  plugins: [InferenceTreePlugin],
  value: inferenceTreeValue,
});
export const broadInferenceTreePlateEditor: PlateEditor<
  Value,
  PlateCorePlugin
> = inferenceTreePlateEditor;
export const exactDependencyApiResult: 'dependency' =
  inferenceTreeEditor.api.schemaDependencyInference.readDependencyInference();
export const exactNestedApiResult: 'nested' =
  inferenceTreeEditor.api.schemaNestedInference.readNestedInference();
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
requirePluginReference(TargetPlugin.configure({ priority: 101 }));
requirePluginReference(TargetPlugin.extend({ priority: 102 }));
requirePluginReference(TargetPlugin.extend(() => ({ priority: 103 })));
requirePluginReference(
  TargetPlugin.extendEditorApi(() => ({ nominalEditorApi: () => true }))
);
requirePluginReference(
  TargetPlugin.extendApi(() => ({ nominalPluginApi: () => true }))
);
requirePluginReference(
  TargetPlugin.extendSelectors(() => ({ nominalSelector: () => true }))
);
requirePluginReference(
  TargetPlugin.extendTx(() => () => ({ nominalTx: () => true }))
);
requirePluginReference(
  TargetPlugin.extendTxGroup('nominalGroup', () => () => ({
    nominalTx: () => true,
  }))
);
requirePluginReference(
  TargetPlugin.extendExtension({
    api: { nominalExtension: { read: () => true } },
  })
);
requirePluginReference(TargetPlugin.withComponent(() => null));
requirePluginReference(ReferenceParentPlugin.configurePlugin(TargetPlugin, {}));
requirePluginReference(ReferenceParentPlugin.extendPlugin(TargetPlugin, {}));

const ConfiguredReferenceTree = ReferenceParentPlugin.configurePlugin(
  TargetPlugin,
  {}
);
const ExtendedReferenceTree = ReferenceParentPlugin.extendPlugin(
  TargetPlugin,
  {}
);
const configuredDeepReference: PluginReference<'schemaTarget'> =
  ConfiguredReferenceTree.plugins[0].plugins[0];
const extendedDeepReference: PluginReference<'schemaTarget'> =
  ExtendedReferenceTree.plugins[0].plugins[0];

const PlateTargetPlugin = toPlatePlugin(TargetPlugin);
const PlateReferenceParentPlugin = toPlatePlugin(ReferenceParentPlugin);
const ExtendedSchemaTargetPlugin = TargetPlugin.extendApi(() => ({
  schemaModelProof: () => true,
})).extendExtension({
  api: { schemaModelProof: { read: () => true } },
});
const PlateExtendedSchemaTargetPlugin = toPlatePlugin(
  ExtendedSchemaTargetPlugin
).extendSelectors(() => ({ schemaModelProof: () => true }));
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
requirePluginReference(toPlatePlugin(TargetPlugin, { priority: 104 }));
requirePluginReference(toPlatePlugin(TargetPlugin, () => ({ priority: 105 })));
requirePluginReference(PlateTargetPlugin.clone());
requirePluginReference(PlateTargetPlugin.configure({ priority: 106 }));
requirePluginReference(PlateTargetPlugin.extend({ priority: 107 }));
requirePluginReference(PlateTargetPlugin.extend(() => ({ priority: 108 })));
requirePluginReference(
  PlateTargetPlugin.extendEditorApi(() => ({ nominalEditorApi: () => true }))
);
requirePluginReference(
  PlateTargetPlugin.extendApi(() => ({ nominalPluginApi: () => true }))
);
requirePluginReference(
  PlateTargetPlugin.extendSelectors(() => ({ nominalSelector: () => true }))
);
requirePluginReference(
  PlateTargetPlugin.extendTx(() => () => ({ nominalTx: () => true }))
);
requirePluginReference(
  PlateTargetPlugin.extendTxGroup('nominalPlateGroup', () => () => ({
    nominalTx: () => true,
  }))
);
requirePluginReference(
  PlateTargetPlugin.extendExtension({
    api: { nominalPlateExtension: { read: () => true } },
  })
);
requirePluginReference(PlateTargetPlugin.withComponent(() => null));
requirePluginReference(
  PlateReferenceParentPlugin.configurePlugin(TargetPlugin, {})
);
requirePluginReference(
  PlateReferenceParentPlugin.extendPlugin(TargetPlugin, {})
);
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

editor.configure(
  ConfiguredPropertyPlugin,
  { prefix: 'next' },
  {
    migrate({ document, next }) {
      next.validateDocument(document);

      return document;
    },
  }
);
editor.configure(ConfiguredPropertyPlugin, {
  // @ts-expect-error Plugin references are descriptors, not magic key strings.
  targets: ['schemaTarget'],
});
editor.configure(ConfiguredPropertyPlugin, {
  // @ts-expect-error Configuration values retain their plugin-owned types.
  prefix: 42,
});
editor.configure(ConfiguredPropertyPlugin, {
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
void configuredTarget;
void configuredDeepReference;
void exactInferredChildPlugin;
void explicitChildReference;
void extendedSchemaTargetType;
void extendedDeepReference;
void handledTarget;
void plateExtendedSchemaTargetType;
void targetType;
