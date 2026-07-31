import { property, schema, target } from '@platejs/plite';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { toPlatePlugin } from '../../react/plugin/toPlatePlugin';
import { createBaseEditor } from '../editor';
import { createRuleFactory } from '../plugins/input-rules/createRuleFactory';
import type { BasePluginOverride } from './BasePlugin';
import { createBasePlugin } from './createBasePlugin';
import type { DefinitionOf, NodeComponent } from './PluginDefinition';

const assertTypedSchemaContributions = () => {
  createBasePlugin({
    initialState: { targetTypes: ['cell', 'header'] },
    name: 'validSchema',
    schema: ({ initialState }) => ({
      properties: [
        schema.elementProperty('status', property.string(), {
          target: target.types(initialState.targetTypes),
        }),
      ],
    }),
  });

  createBasePlugin({
    name: 'invalidSchema',
    // @ts-expect-error schema callbacks cannot access the editor runtime
    schema: ({ editor }) => ({ editor }),
  });

  const ParagraphPlugin = createBasePlugin({
    name: 'typedContentRootParagraph',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });
  const ImagePlugin = createBasePlugin({
    name: 'typedContentRootImage',
    schema: { element: { void: 'block' } },
  });
  const CaptionPlugin = createBasePlugin({
    name: 'typedCaption',
    schema: ({ own, plugins }) => ({
      contentRoots: [
        own.contentRoot(
          schema.content.type(plugins.elementType(ParagraphPlugin)),
          {
            ownership: 'exclusive',
            target: target.types(plugins.elementTypes([ImagePlugin])),
          }
        ),
      ],
    }),
  });
  const editor = createBaseEditor({
    plugins: [ParagraphPlugin, ImagePlugin, CaptionPlugin],
  });
  const image = editor.read.schema.create(ImagePlugin);
  const captionRoot: string = image.childRoots.typedCaption;

  // @ts-expect-error targeted content-root slots stay exact
  image.childRoots.notes;
  void captionRoot;

  createBasePlugin({
    name: 'invalidContentRootTarget',
    schema: ({ own }) => ({
      contentRoots: [
        own.contentRoot(schema.content.type('paragraph'), {
          ownership: 'shared',
          // @ts-expect-error structural content roots cannot depend on root context
          target: target.root(),
        }),
      ],
    }),
  });

  createBasePlugin({
    name: 'booleanMark',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });
  createBasePlugin({
    name: 'tone',
    schema: {
      mark: {
        property: property.string(),
        split: 'drop',
        target: target.group('textBlock'),
      },
    },
  });
  createBasePlugin({
    name: 'image',
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

const assertTypedContextualConfiguration = () => {
  const BasePlugin = createBasePlugin({
    initialState: { enabled: false },
    name: 'baseContextual',
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

  const PlatePlugin = createPlatePlugin({
    initialState: { enabled: false },
    name: 'plateContextual',
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
  const BaseRulePlugin = createBasePlugin({
    name: 'typedInputRuleOwner',
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
  const FullSchemaPlugin = createBasePlugin({
    api: () => ({
      value: () => 1 as const,
    }),
    effectTypes: [],
    name: 'fullSchemaConstructor',
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

  const BasePlugin = createBasePlugin({
    api: ({ editor, plugin, store, type }) => ({
      label: () => `${editor.id}:${plugin.name}:${type}:${store.get('prefix')}`,
    }),
    initialState: {
      prefix: 'base',
    },
    name: 'baseInitialContext',
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
  baseEditor.plugin(BasePlugin).store.get('label') satisfies string;
  baseEditor.read.baseInitialContext.readLabel() satisfies string;
  baseEditor.update.baseInitialContext.updateLabel() satisfies void;
  baseEditor
    .plugin(BasePlugin)
    .api.baseInitialExtension.name() satisfies 'baseInitialContext';

  const BehaviorOnlyPlugin = createBasePlugin({
    name: 'behaviorOnly',
    on: {
      commit: () => {},
    },
  });
  const ExactRootApiPlugin = createBasePlugin({
    api: () => ({
      exactRoot: {
        value: () => 1 as const,
      },
    }),
    name: 'exactRootApi',
  });
  const exactEditor = createBaseEditor({
    plugins: [BehaviorOnlyPlugin, ExactRootApiPlugin],
  });

  exactEditor.plugin(ExactRootApiPlugin).api.exactRoot.value() satisfies 1;
  // @ts-expect-error behavior-only plugins cannot widen root API
  exactEditor.api.missingRootApi;

  const PlatePlugin = createPlatePlugin({
    api: ({ editor, store }) => ({
      label: () => `${editor.id}:${store.get('prefix')}`,
    }),
    initialState: {
      prefix: 'plate',
    },
    name: 'plateInitialContext',
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
  const TargetPlugin = createBasePlugin({
    initialState: { allowed: false, requiredMode: 'strict' },
    name: 'typedWeakTarget',
  });
  type TargetDefinition = DefinitionOf<typeof TargetPlugin>;

  const exactOverride = {
    initialState: { allowed: true },
  } satisfies BasePluginOverride<TargetDefinition>;

  createBasePlugin({
    name: 'typedWeakContributor',
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
  createPlatePlugin({
    name: 'missingInitialShortcutTarget',
    shortcuts: {
      // @ts-expect-error unknown shortcut names require a handler
      missing: { keys: 'mod+m' },
    },
  });

  const Plugin = createPlatePlugin({
    name: 'plateShortcutTargets',
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
  const StaticPlugin = createBasePlugin({ name: 'staticRender' });

  createBasePlugin({ component: CustomNode, name: 'intrinsicRender' });
  // @ts-expect-error component defaults belong in the constructor or terminal configuration
  StaticPlugin.extend({ component: CustomNode });
  createBasePlugin({
    name: 'invalidBaseRender',
    render: {
      // @ts-expect-error custom node components use the Plate component field
      node: CustomNode,
    },
  });
  StaticPlugin.configure({
    component: CustomNode,
  });
  createPlatePlugin({
    component: CustomNode,
    name: 'customRender',
  });
};

void assertTypedRenderOwnership;

describe('createBasePlugin', () => {
  it('preserves inferred capabilities through author stages and configuration', () => {
    const plugin = createPlatePlugin({
      api: () => ({
        testMethod: () => 'ok' as const,
      }),
      initialState: {
        valueA: 'initial',
        valueB: 10,
      },
      name: 'testPlugin',
      type: 'test',
    });
    const editor = createBaseEditor({
      plugins: [plugin],
    });

    expect(editor.plugin(plugin).plugin.name).toBe('testPlugin');
    expect(editor.plugin(plugin).plugin.type).toBe('test');
    expect(editor.plugin(plugin).api.testMethod()).toBe('ok');
    expect(editor.plugin(plugin).plugin.initialState).toEqual({
      valueA: 'initial',
      valueB: 10,
    });

    const configuredPlugin = plugin.configure({
      initialState: { valueA: 'modified' },
    });
    const configuredEditor = createBaseEditor({
      plugins: [configuredPlugin],
    });

    expect(
      configuredEditor.plugin(configuredPlugin).plugin.initialState
    ).toEqual({
      valueA: 'modified',
      valueB: 10,
    });

    const extendedPlugin = plugin.extend({
      initialState: { valueB: 20 },
    });
    const extendedEditor = createBaseEditor({
      plugins: [extendedPlugin],
    });

    expect(extendedEditor.plugin(extendedPlugin).plugin.type).toBe('test');
    expect(extendedEditor.plugin(extendedPlugin).plugin.initialState).toEqual({
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

    expect(resolved.type).toBe('test');
    expect(resolved.initialState).toEqual({
      valueA: 'configured',
      valueB: 30,
    });
  });
});
