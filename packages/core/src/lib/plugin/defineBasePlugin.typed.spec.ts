import {
  property,
  schema,
  target,
  type SchemaElementTarget,
} from '@platejs/plite';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { definePlatePlugin } from '../../react/plugin/definePlatePlugin';
import { toPlatePlugin } from '../../react/plugin/toPlatePlugin';
import { createBaseEditor } from '../editor';
import { createRuleFactory } from '../plugins/input-rules/createRuleFactory';
import type { BasePluginOverride } from './BasePlugin';
import { defineBasePlugin } from './defineBasePlugin';
import type { DefinitionOf, NodeComponent } from './PluginDefinition';
import type { PlateNodeInsertOptions } from '../editor/pluginRuntimeTypes';

const assertTypedSchemaContributions = () => {
  defineBasePlugin('validSchema', {
    initialState: { targetTypes: ['cell', 'header'] },
    schema: ({ initialState }) => ({
      properties: {
        status: schema.elementProperty(property.string(), {
          target: target.types(initialState.targetTypes),
        }),
      },
    }),
  });

  defineBasePlugin('invalidSchema', {
    // @ts-expect-error schema callbacks cannot access the editor runtime
    schema: ({ editor }) => ({ editor }),
  });

  const ParagraphPlugin = defineBasePlugin('typedContentRootParagraph', {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });
  const ImagePlugin = defineBasePlugin('typedContentRootImage', {
    schema: { element: { void: 'block' } },
  });
  const CaptionPlugin = defineBasePlugin('typedCaption', {
    schema: () => ({
      contentRoots: [
        {
          content: schema.content.element(ParagraphPlugin),
          ownership: 'exclusive',
          slot: 'typedCaption',
          target: target.elements([ImagePlugin]),
        },
      ],
    }),
  });
  const editor = createBaseEditor({
    plugins: [ParagraphPlugin, ImagePlugin, CaptionPlugin],
  });
  const image = editor.read.schema.create(ImagePlugin);
  void image;

  const NestedTextBlockPlugin = defineBasePlugin('typedNestedTextBlock', {
    schema: {
      element: {
        blockContent: false,
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });
  const nestedEditor = createBaseEditor({ plugins: [NestedTextBlockPlugin] });
  const nestedUpdate = nestedEditor.plugin(NestedTextBlockPlugin).update;

  false satisfies 'toggle' extends keyof typeof nestedUpdate ? true : false;

  // @ts-expect-error structural content roots cannot depend on root context
  const invalidContentRootTarget: SchemaElementTarget = target.root();
  void invalidContentRootTarget;

  defineBasePlugin('booleanMark', {
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });
  defineBasePlugin('tone', {
    schema: {
      mark: {
        property: property.string(),
        split: 'drop',
        target: target.group('textBlock'),
      },
    },
  });
  defineBasePlugin('image', {
    schema: {
      element: {
        properties: {
          alt: property.string({ default: '' }),
          url: property.string(),
        },
        void: 'inline',
      },
    },
  });
};

void assertTypedSchemaContributions;

const assertTypedNodeQueries = () => {
  const LinkPlugin = defineBasePlugin('typedQueryLink', {
    schema: {
      element: {
        ...schema.element.textBlock(),
        properties: {
          url: property.string(),
        },
        type: 'typed_query_link',
      },
    },
  });
  const MentionPlugin = defineBasePlugin('typedQueryMention', {
    schema: {
      element: {
        properties: {
          userId: property.string(),
        },
        void: 'inline',
      },
    },
  });
  const BoldPlugin = defineBasePlugin('typedQueryBold', {
    schema: { mark: property.boolean() },
  });
  const editor = createBaseEditor({
    plugins: [LinkPlugin, MentionPlugin, BoldPlugin],
  });
  const storedInsertOptions: PlateNodeInsertOptions = {
    split: { type: LinkPlugin },
  };

  const link = editor.read.nodes.find({
    match: (node, path) => {
      node.url satisfies string | undefined;
      path satisfies readonly number[];

      return node.url === '/docs';
    },
    type: LinkPlugin,
  });

  if (link) {
    link[0].url satisfies string | undefined;
    link[0].type satisfies 'typed_query_link';
  }

  const linkAtPath = editor.read.nodes.get([0], { type: LinkPlugin });

  if (linkAtPath) {
    linkAtPath[0].url satisfies string | undefined;
    linkAtPath[0].type satisfies 'typed_query_link';
  }

  const parentLink = editor.read.nodes.parent([0, 0], { type: LinkPlugin });

  if (parentLink) {
    parentLink[0].url satisfies string | undefined;
    parentLink[0].type satisfies 'typed_query_link';
  }

  const linkOrMention = editor.read.nodes.find({
    type: [LinkPlugin, MentionPlugin],
  });

  if (linkOrMention?.[0].type === 'typed_query_link') {
    linkOrMention[0].url satisfies string | undefined;
  } else if (linkOrMention) {
    linkOrMention[0].userId satisfies string | undefined;
  }

  editor.read((state) => {
    state.nodes.find({ type: LinkPlugin })?.[0].url satisfies
      | string
      | undefined;
  });

  editor.update((tx) => {
    tx.nodes.remove({
      match: (node) => node.url === '/docs',
      type: LinkPlugin,
    });
    tx.nodes.set({ url: '/next' }, { type: LinkPlugin });
    tx.nodes.insert(
      { children: [{ text: '' }], type: 'typed_query_link', url: '/next' },
      { split: { type: LinkPlugin } }
    );
    tx.nodes.insert(
      { children: [{ text: '' }], type: 'typed_query_link', url: '/next' },
      storedInsertOptions
    );
  });
  editor.update.nodes.set({ url: '/next' }, { type: LinkPlugin });

  editor.read.nodes.find({
    // @ts-expect-error match is function-only
    match: { type: 'typed_query_link' },
  });
  editor.read.nodes.find<import('@platejs/plite').Element>({
    // @ts-expect-error callers cannot select an unchecked output generic
    type: LinkPlugin,
  });
  editor.read.nodes.find({
    // @ts-expect-error marks are not element selectors
    type: BoldPlugin,
  });
};

void assertTypedNodeQueries;

const assertTypedPluginPropertyMutations = () => {
  const Dependency = defineBasePlugin('typedMutationDependency', {
    schema: {
      properties: {
        dependencyTone: schema.elementProperty(property.string(), {
          target: target.group('block'),
        }),
      },
    },
  });

  defineBasePlugin('typedMutationOwner', {
    dependencies: [Dependency],
    schema: {
      element: {
        content: schema.content.text(),
        properties: {
          count: property.number(),
        },
      },
      properties: {
        storedTone: schema.elementProperty(
          'persisted_tone',
          property.string(),
          {
            target: target.group('block'),
          }
        ),
      },
    },
    update: ({ schema: authorSchema, tx }) => {
      const countOrCustomKey = 'count' as 'count' | 'custom';
      const invalidNumberIndexUnion = {} as
        | Record<number, string>
        | { count: number };
      const validStringIndexUnion = {} as
        | Record<string, string>
        | { count: number };
      const dynamicNumberKey = 1 as number;
      const dynamicStringKey = 'count' as string;
      const storedToneOrCustomKey = 'storedTone' as 'storedTone' | 'custom';
      const validPatchUnion = {} as
        | { count: number }
        | { dependencyTone: string };

      tx.nodes.set({ count: 1 });
      tx.nodes.set({ count: undefined });
      tx.nodes.set({ dependencyTone: 'warning' });
      tx.nodes.set(validPatchUnion);
      tx.nodes.set({
        [authorSchema.properties.storedTone.key]: 'warning',
      });
      tx.nodes.set(
        { count: 1 },
        { at: {} as import('@platejs/plite').Element }
      );
      tx.nodes.unset(authorSchema.properties.storedTone);

      // @ts-expect-error local property values remain exact
      tx.nodes.set({ count: '1' });
      // Dynamic string-keyed patches are validated by the runtime schema.
      tx.nodes.set({ [countOrCustomKey]: '1' });
      // @ts-expect-error broad number indexes cannot bypass schema ownership
      tx.nodes.set({ [dynamicNumberKey]: 1 });
      tx.nodes.set({ [dynamicStringKey]: 1 });
      // @ts-expect-error every union member must satisfy schema ownership
      tx.nodes.set(invalidNumberIndexUnion);
      tx.nodes.set(validStringIndexUnion);
      // @ts-expect-error unknown on one closed property is not an open record
      tx.nodes.set({ count: undefined as unknown });
      // @ts-expect-error aliased properties use their persisted schema key
      tx.nodes.set({ storedTone: 'warning' });
      // Dynamic string-keyed patches remain the explicit escape hatch.
      tx.nodes.set({ [storedToneOrCustomKey]: 'warning' });

      return {};
    },
  });

  const FirstShared = defineBasePlugin('typedMutationFirstShared', {
    schema: {
      properties: {
        shared: schema.elementProperty(property.string(), {
          target: target.group('block'),
        }),
      },
    },
  });
  const SecondShared = defineBasePlugin('typedMutationSecondShared', {
    schema: {
      properties: {
        shared: schema.elementProperty(property.number(), {
          target: target.group('block'),
        }),
      },
    },
  });

  defineBasePlugin('typedMutationAmbiguousOwner', {
    dependencies: [FirstShared, SecondShared],
    update: ({ tx }) => {
      tx.nodes.set({ shared: 'value' });
      tx.nodes.set({ shared: 1 });

      return {};
    },
  });
};

void assertTypedPluginPropertyMutations;

const assertTypedContextualConfiguration = () => {
  const BasePlugin = defineBasePlugin('baseContextual', {
    initialState: { enabled: false },
  });

  BasePlugin.configure(({ editor, plugin }) => {
    editor.id satisfies string;
    plugin.name satisfies 'baseContextual';

    return { initialState: { enabled: true } };
  });
  const ConfiguredBasePlugin = BasePlugin.configure({
    initialState: { enabled: true },
  });

  // @ts-expect-error configured descriptors accept one consumer configuration
  ConfiguredBasePlugin.configure({ initialState: { enabled: false } });
  // @ts-expect-error configured descriptors are terminal authoring inputs
  ConfiguredBasePlugin.extend({ initialState: { enabled: false } });

  const WrappedConfiguredBasePlugin = toPlatePlugin(ConfiguredBasePlugin);

  // @ts-expect-error Base-to-Plate wrapping preserves terminal authoring state
  WrappedConfiguredBasePlugin.configure({ component: () => null });
  // @ts-expect-error React adaptation must happen before consumer configuration
  toPlatePlugin(ConfiguredBasePlugin, { component: () => null });

  // @ts-expect-error contextual configure cannot add state fields
  BasePlugin.configure(() => ({ initialState: { missing: true } }));
  // @ts-expect-error contextual configure cannot define model fields
  BasePlugin.configure(() => ({ type: 'other' }));

  const PlatePlugin = definePlatePlugin('plateContextual', {
    initialState: { enabled: false },
  });

  PlatePlugin.configure(({ editor, plugin }) => {
    editor.id satisfies string;
    plugin.name satisfies 'plateContextual';

    return { initialState: { enabled: true } };
  });
  const ConfiguredPlatePlugin = PlatePlugin.configure({
    initialState: { enabled: true },
  });

  // @ts-expect-error configured descriptors accept one consumer configuration
  ConfiguredPlatePlugin.configure({ initialState: { enabled: false } });
  // @ts-expect-error configured descriptors are terminal authoring inputs
  ConfiguredPlatePlugin.extend({ component: () => null });

  // @ts-expect-error contextual configure cannot add state fields
  PlatePlugin.configure(() => ({ initialState: { missing: true } }));
  // @ts-expect-error contextual configure cannot define model fields
  PlatePlugin.configure(() => ({ schema: null }));
};

void assertTypedContextualConfiguration;

const assertTypedInputRuleConfiguration = () => {
  const BaseRulePlugin = defineBasePlugin('typedInputRuleOwner', {
    read: () => ({ enabled: () => true }),
  });
  const rule = createRuleFactory(BaseRulePlugin)({
    apply: () => {},
    resolve: ({ editor }) =>
      editor.plugin(BaseRulePlugin).read.enabled() ? true : undefined,
    trigger: ' ',
    type: 'insertText',
  })();

  toPlatePlugin(BaseRulePlugin).configure({ inputRules: [rule] });
};

void assertTypedInputRuleConfiguration;

const assertTypedAuthoringContext = () => {
  const FullSchemaPlugin = defineBasePlugin('fullSchemaConstructor', {
    api: () => ({
      value: () => 1 as const,
    }),
    effectTypes: [],
    read: () => ({
      ready: () => true as const,
    }),
    render: { isDecoration: false },
    rules: { selection: { affinity: 'outward' } },
    schema: {
      mark: property.boolean({ default: false, omitDefault: true }),
    },
    stateFields: [],
    update: () => ({
      run: () => 'done' as const,
    }),
  });
  const fullSchemaEditor = createBaseEditor({
    plugins: [FullSchemaPlugin],
  });

  fullSchemaEditor.api.fullSchemaConstructor.value() satisfies 1;
  fullSchemaEditor.read.fullSchemaConstructor.ready() satisfies true;
  fullSchemaEditor.update.fullSchemaConstructor.run() satisfies 'done';

  const BasePlugin = defineBasePlugin('baseInitialContext', {
    api: ({ editor, plugin, store }) => ({
      label: () =>
        `${editor.id}:${plugin.name}:${plugin.name}:${store.get('prefix')}`,
    }),
    initialState: {
      prefix: 'base',
    },
    read: ({ editor, state, store }) => ({
      readLabel: () => {
        state satisfies object;

        return `${editor.id}:${store.get().prefix}`;
      },
    }),
    selectors: {
      label: (state) => state.prefix.toUpperCase(),
    },
    update: ({ context, store, tx }) => ({
      updateLabel: () => {
        context satisfies object;
        store.get().prefix satisfies string;
        tx satisfies object;
      },
    }),
  }).extend(({ plugin }) => ({
    api: () => ({
      baseInitialExtension: {
        name: () => plugin.name,
      },
    }),
  }));
  const baseEditor = createBaseEditor({
    id: 'base-constructor',
    plugins: [BasePlugin],
  });

  baseEditor.plugin(BasePlugin).api.label() satisfies string;
  baseEditor.plugin(BasePlugin).name satisfies 'baseInitialContext';
  baseEditor.plugin(BasePlugin).store.get('label') satisfies string;
  // @ts-expect-error consumer portals expose descriptor fields directly.
  baseEditor.plugin(BasePlugin).plugin;
  baseEditor.read.baseInitialContext.readLabel() satisfies string;
  baseEditor.update.baseInitialContext.updateLabel() satisfies void;
  baseEditor
    .plugin(BasePlugin)
    .api.baseInitialExtension.name() satisfies 'baseInitialContext';

  const BehaviorOnlyPlugin = defineBasePlugin('behaviorOnly', {
    on: {
      commit: () => {},
    },
  });
  const ElementIdentityPlugin = defineBasePlugin('elementCapability', {
    api: ({ schema }) => ({
      identity: () => schema.type,
    }),
    read: ({ schema }) => ({
      identity: () => schema.type,
    }),
    schema: {
      element: {
        ...schema.element.textBlock(),
        type: 'persistedElement',
      },
    },
    update: ({ schema }) => ({
      create: () => ({
        children: [{ text: '' }],
        type: schema.type,
      }),
    }),
  });
  const DefaultElementIdentityPlugin = defineBasePlugin(
    'defaultElementCapability',
    {
      schema: () => ({
        element: schema.element.textBlock(),
      }),
      update: ({ schema }) => ({
        create: () => ({
          children: [{ text: '' }],
          type: schema.type,
        }),
      }),
    }
  ).extend(({ schema }) => ({
    api: () => ({
      defaultElementType: () => schema.type,
    }),
  }));
  const PropertyIdentityPlugin = defineBasePlugin('propertyCapability', {
    schema: {
      mark: {
        key: 'persistedProperty',
        property: property.boolean({ default: false, omitDefault: true }),
      },
    },
    api: ({ schema }) => ({
      identity: () => schema.key,
    }),
    read: ({ schema }) => ({
      identity: () => schema.key,
    }),
    update: ({ schema }) => ({
      create: () => ({ [schema.key]: true }),
    }),
  });
  const ExactRootApiPlugin = defineBasePlugin('exactRootApi', {
    api: () => ({
      exactRoot: {
        value: () => 1 as const,
      },
    }),
  });
  const exactEditor = createBaseEditor({
    plugins: [
      BehaviorOnlyPlugin,
      DefaultElementIdentityPlugin,
      ElementIdentityPlugin,
      ExactRootApiPlugin,
      PropertyIdentityPlugin,
    ],
  });

  exactEditor.plugin(ElementIdentityPlugin).schema
    .type satisfies 'persistedElement';
  exactEditor
    .plugin(ElementIdentityPlugin)
    .api.identity() satisfies 'persistedElement';
  exactEditor.read.elementCapability.identity() satisfies 'persistedElement';
  exactEditor.plugin(DefaultElementIdentityPlugin).schema
    .type satisfies 'defaultElementCapability';
  exactEditor
    .plugin(DefaultElementIdentityPlugin)
    .api.defaultElementType() satisfies 'defaultElementCapability';
  exactEditor.plugin(PropertyIdentityPlugin).schema
    .key satisfies 'persistedProperty';
  exactEditor
    .plugin(PropertyIdentityPlugin)
    .api.identity() satisfies 'persistedProperty';
  exactEditor.read.propertyCapability.identity() satisfies 'persistedProperty';
  exactEditor.plugin(ExactRootApiPlugin).api.exactRoot.value() satisfies 1;
  // @ts-expect-error behavior-only plugins expose no consumer schema
  exactEditor.plugin(BehaviorOnlyPlugin).schema;
  // @ts-expect-error element plugins expose no consumer property handles
  exactEditor.plugin(ElementIdentityPlugin).schema.properties;
  // @ts-expect-error mark plugins expose no consumer element identity
  exactEditor.plugin(PropertyIdentityPlugin).schema.type;
  // @ts-expect-error behavior-only plugins cannot widen root API
  exactEditor.api.missingRootApi;

  const PlatePlugin = definePlatePlugin('plateInitialContext', {
    api: ({ editor, store }) => ({
      label: () => `${editor.id}:${store.get('prefix')}`,
    }),
    initialState: {
      prefix: 'plate',
    },
    selectors: {
      label: (state) => state.prefix.toUpperCase(),
    },
    update: ({ editor, tx }) => ({
      focus: () => {
        editor.id satisfies string;
        tx satisfies object;
      },
    }),
  });

  PlatePlugin.initialState.prefix satisfies string;
};

void assertTypedAuthoringContext;

const assertTypedWeakPluginOverrides = () => {
  const TargetPlugin = defineBasePlugin('typedWeakTarget', {
    initialState: { allowed: false, requiredMode: 'strict' },
  });
  type TargetDefinition = DefinitionOf<typeof TargetPlugin>;

  const exactOverride = {
    initialState: { allowed: true },
  } satisfies BasePluginOverride<TargetDefinition>;

  defineBasePlugin('typedWeakContributor', {
    override: {
      plugins: {
        typedWeakTarget: exactOverride,
      },
    },
  });

  ({
    initialState: {
      // @ts-expect-error exact weak override checking requires owned state keys
      missing: true,
    },
  }) satisfies BasePluginOverride<TargetDefinition>;
  ({
    // @ts-expect-error weak overrides cannot mutate dependencies
    dependencies: [],
  }) satisfies BasePluginOverride<TargetDefinition>;
  ({
    // @ts-expect-error weak overrides cannot mutate the target name
    name: 'other',
  }) satisfies BasePluginOverride<TargetDefinition>;
  ({
    // @ts-expect-error weak overrides cannot nest another override
    override: {},
  }) satisfies BasePluginOverride<TargetDefinition>;
  ({
    // @ts-expect-error weak overrides cannot replace schema
    schema: { mark: property.boolean() },
  }) satisfies BasePluginOverride<TargetDefinition>;
};

void assertTypedWeakPluginOverrides;

const assertTypedPlateShortcutTargets = () => {
  definePlatePlugin('missingInitialShortcutTarget', {
    shortcuts: {
      // @ts-expect-error unknown shortcut names require a handler
      missing: { keys: 'mod+m' },
    },
  });

  const Plugin = definePlatePlugin('plateShortcutTargets', {
    update: () => ({
      both: () => true,
      update: () => true,
    }),
  }).extend(() => ({
    api: () => ({
      api: () => true,
      both: () => true,
    }),
  }));

  Plugin.extend({
    shortcuts: {
      api: { keys: 'mod+a' },
      both: { keys: 'mod+b', target: 'api' },
      custom: { handler: () => true, keys: 'mod+c' },
      update: { keys: 'mod+u' },
    },
  });
  Plugin.extend({
    shortcuts: {
      // @ts-expect-error update/API collisions require an explicit target
      both: { keys: 'mod+b' },
    },
  });
  Plugin.extend({
    shortcuts: {
      // @ts-expect-error unknown commands require a custom handler
      missing: { keys: 'mod+m' },
    },
  });
  Plugin.extend({
    shortcuts: {
      // @ts-expect-error API-only commands cannot target update
      api: { keys: 'mod+a', target: 'update' },
    },
  });
  Plugin.extend({
    shortcuts: {
      // @ts-expect-error custom handlers reject automatic command targets
      invalidHandlerTarget: {
        handler: () => true,
        keys: 'mod+i',
        target: 'api',
      },
    },
  });
};

void assertTypedPlateShortcutTargets;

const assertTypedRenderOwnership = () => {
  const CustomNode: NodeComponent = () => null;
  const StaticPlugin = defineBasePlugin('staticRender', {});

  defineBasePlugin('intrinsicRender', { component: CustomNode });
  // @ts-expect-error component defaults belong in the constructor or terminal configuration
  StaticPlugin.extend({ component: CustomNode });
  defineBasePlugin('invalidBaseRender', {
    render: {
      // @ts-expect-error custom node components use the Plate component field
      node: CustomNode,
    },
  });
  StaticPlugin.configure({
    component: CustomNode,
  });
  definePlatePlugin('customRender', {
    component: CustomNode,
  });
};

void assertTypedRenderOwnership;

describe('defineBasePlugin', () => {
  it('preserves inferred capabilities through author stages and configuration', () => {
    const plugin = definePlatePlugin('testPlugin', {
      api: () => ({
        testMethod: () => 'ok' as const,
      }),
      initialState: {
        valueA: 'initial',
        valueB: 10,
      },
    });
    const editor = createBaseEditor({
      plugins: [plugin],
    });

    expect(editor.plugin(plugin).name).toBe('testPlugin');
    expect(editor.plugin(plugin).api.testMethod()).toBe('ok');
    expect(editor.plugin(plugin).initialState).toEqual({
      valueA: 'initial',
      valueB: 10,
    });

    const configuredPlugin = plugin.configure({
      initialState: { valueA: 'modified' },
    });
    const configuredEditor = createBaseEditor({
      plugins: [configuredPlugin],
    });

    expect(configuredEditor.plugin(configuredPlugin).initialState).toEqual({
      valueA: 'modified',
      valueB: 10,
    });

    const extendedPlugin = plugin.extend({
      initialState: { valueB: 20 },
    });
    const extendedEditor = createBaseEditor({
      plugins: [extendedPlugin],
    });

    expect(extendedEditor.plugin(extendedPlugin).name).toBe('testPlugin');
    expect(extendedEditor.plugin(extendedPlugin).initialState).toEqual({
      valueA: 'initial',
      valueB: 20,
    });

    const multiExtendedPlugin = plugin
      .extend({ initialState: { valueA: 'extended' } })
      .extend({ initialState: { valueB: 30 } })
      .configure({
        initialState: {
          valueA: 'configured',
        },
      });
    const resolved = resolvePluginTest(multiExtendedPlugin);

    expect(resolved.name).toBe('testPlugin');
    expect(resolved.initialState).toEqual({
      valueA: 'configured',
      valueB: 30,
    });
  });
});
