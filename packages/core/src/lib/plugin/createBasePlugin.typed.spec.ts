import type { NodeComponent, PluginConfig } from './PluginConfig';
import { property, schema, target } from '@platejs/plite';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { toPlatePlugin } from '../../react/plugin/toPlatePlugin';
import { createBaseEditor } from '../editor';
import { createRuleFactory } from '../plugins/input-rules/createRuleFactory';
import type { BasePluginOverride } from './BasePlugin';
import { createBasePlugin } from './createBasePlugin';

const assertTypedSchemaContributions = () => {
  createBasePlugin({
    key: 'validSchema',
    initialState: { targetTypes: ['cell', 'header'] },
    schema: ({ initialState }) => ({
      properties: [
        schema.elementProperty('status', property.string(), {
          target: target.types(initialState.targetTypes),
        }),
      ],
    }),
  });

  createBasePlugin({
    key: 'invalidSchema',
    // @ts-expect-error schema callbacks cannot access the editor runtime
    schema: ({ editor }) => ({ editor }),
  });

  const ParagraphPlugin = createBasePlugin({
    key: 'typedContentRootParagraph',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  });
  const ImagePlugin = createBasePlugin({
    key: 'typedContentRootImage',
    schema: { element: { void: 'block' } },
  });
  const CaptionPlugin = createBasePlugin({
    key: 'typedCaption',
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
  const image = editor.read.schema.createAndFill(ImagePlugin);
  const captionRoot: string = image.childRoots.typedCaption;

  // @ts-expect-error targeted content-root slots stay exact
  image.childRoots.notes;
  void captionRoot;

  createBasePlugin({
    key: 'invalidContentRootTarget',
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
};

void assertTypedSchemaContributions;

const assertTypedNodeSchemas = () => {
  createBasePlugin({
    key: 'booleanMark',
    schema: { mark: property.boolean({ default: false, omitDefault: true }) },
  });

  createBasePlugin({
    key: 'tone',
    schema: {
      mark: {
        split: 'drop',
        target: target.group('textBlock'),
        property: property.string(),
      },
    },
  });

  createBasePlugin({
    key: 'image',
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

void assertTypedNodeSchemas;

const assertTypedContextualConfiguration = () => {
  const BasePlugin = createBasePlugin({
    key: 'baseContextual',
    initialState: { enabled: false },
  });

  BasePlugin.configure(({ editor, plugin }) => {
    editor.id satisfies string;
    plugin.key satisfies 'baseContextual';

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
  // @ts-expect-error React extension config must be applied before consumer configure
  toPlatePlugin(ConfiguredBasePlugin, { render: { node: () => null } });

  // @ts-expect-error contextual configure cannot add state fields
  BasePlugin.configure(() => ({ initialState: { missing: true } }));
  // @ts-expect-error contextual configure cannot define model fields
  BasePlugin.configure(() => ({ type: 'other' }));

  const PlatePlugin = createPlatePlugin({
    key: 'plateContextual',
    initialState: { enabled: false },
  });

  PlatePlugin.configure(({ editor, plugin }) => {
    editor.id satisfies string;
    plugin.key satisfies 'plateContextual';

    return { initialState: { enabled: true } };
  });
  const ConfiguredPlatePlugin = PlatePlugin.configure({
    initialState: { enabled: true },
  });

  // @ts-expect-error configured descriptors accept one consumer configuration
  ConfiguredPlatePlugin.configure({ initialState: { enabled: false } });
  // @ts-expect-error configured descriptors are terminal authoring inputs
  ConfiguredPlatePlugin.configure({ component: () => null });

  // @ts-expect-error contextual configure cannot add state fields
  PlatePlugin.configure(() => ({ initialState: { missing: true } }));
  // @ts-expect-error contextual configure cannot define model fields
  PlatePlugin.configure(() => ({ schema: null }));
};

void assertTypedContextualConfiguration;

const assertTypedInputRuleConfiguration = () => {
  const BaseRulePlugin = createBasePlugin({
    key: 'typedInputRuleOwner',
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

const assertTypedInitialAuthoringContext = () => {
  const BasePlugin = createBasePlugin({
    key: 'baseInitialContext',
    initialState: {
      prefix: 'base',
    },
    api: ({ editor, store, plugin, type }) => ({
      label: () => `${editor.id}:${plugin.key}:${type}:${store.get('prefix')}`,
    }),
    extension: ({ plugin }) => ({
      api: {
        baseInitialExtension: {
          key: () => plugin.key,
        },
      },
    }),
    read: ({ editor, store, state }) => ({
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
  });
  const baseEditor = createBaseEditor({
    id: 'base-constructor',
    plugins: [BasePlugin],
  });

  baseEditor.plugin(BasePlugin).api.label() satisfies string;
  baseEditor.plugin(BasePlugin).store.get('label') satisfies string;
  baseEditor.read.baseInitialContext.readLabel() satisfies string;
  baseEditor.update.baseInitialContext.updateLabel() satisfies void;
  baseEditor.api.baseInitialExtension.key() satisfies 'baseInitialContext';

  const BehaviorOnlyPlugin = createBasePlugin({
    extension: {
      on: {
        commit: () => {},
      },
    },
    key: 'behaviorOnly',
  });
  const ExactRootApiPlugin = createBasePlugin({
    extension: {
      api: {
        exactRoot: {
          value: () => 1 as const,
        },
      },
    },
    key: 'exactRootApi',
  });
  const exactEditor = createBaseEditor({
    plugins: [BehaviorOnlyPlugin, ExactRootApiPlugin],
  });

  exactEditor.api.exactRoot.value() satisfies 1;
  // @ts-expect-error behavior-only extensions cannot widen root API
  exactEditor.api.missingRootApi;

  const PlatePlugin = createPlatePlugin({
    key: 'plateInitialContext',
    initialState: {
      prefix: 'plate',
    },
    api: ({ editor, store }) => ({
      label: () => `${editor.id}:${store.get('prefix')}`,
    }),
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

void assertTypedInitialAuthoringContext;

const assertTypedWeakPluginOverrides = () => {
  type TargetConfig = PluginConfig<
    'typedWeakTarget',
    { allowed: boolean; requiredMode: string }
  >;

  // Foreign configuration patches only the initialState it owns.
  const exactOverride = {
    initialState: { allowed: true },
  } satisfies BasePluginOverride<TargetConfig>;

  createBasePlugin({
    key: 'typedWeakContributor',
    override: {
      plugins: {
        typedWeakTarget: exactOverride,
      },
    },
  });

  ({
    initialState: {
      // @ts-expect-error exact weak override checking requires the target config
      missing: true,
    },
  }) satisfies BasePluginOverride<TargetConfig>;

  ({
    // @ts-expect-error weak overrides cannot mutate dependencies
    dependencies: [],
  }) satisfies BasePluginOverride<TargetConfig>;
  ({
    // @ts-expect-error weak overrides cannot mutate the target key
    key: 'other',
  }) satisfies BasePluginOverride<TargetConfig>;
  ({
    // @ts-expect-error weak overrides cannot nest another override
    override: {},
  }) satisfies BasePluginOverride<TargetConfig>;
  ({
    // @ts-expect-error erased weak overrides still cannot mutate the target key
    key: 'other',
  }) satisfies BasePluginOverride;
  ({
    // @ts-expect-error erased weak overrides still cannot mutate dependencies
    dependencies: [],
  }) satisfies BasePluginOverride;
  ({
    // @ts-expect-error erased weak overrides still cannot nest another override
    override: {},
  }) satisfies BasePluginOverride;
  ({
    // @ts-expect-error weak overrides cannot replace schema
    schema: { mark: property.boolean() },
  }) satisfies BasePluginOverride<TargetConfig>;
  ({
    // @ts-expect-error erased weak overrides cannot replace schema
    schema: { mark: property.boolean() },
  }) satisfies BasePluginOverride;
};

void assertTypedWeakPluginOverrides;

const assertTypedPlateShortcutTargets = () => {
  createPlatePlugin({
    key: 'missingInitialShortcutTarget',
    shortcuts: {
      // @ts-expect-error initial shortcuts without a command require a handler
      missing: { keys: 'mod+m' },
    },
  });

  createPlatePlugin<
    PluginConfig<
      'explicitShortcutConfig',
      {},
      {},
      { explicitShortcutConfig: { run: () => boolean } }
    >
  >({
    key: 'explicitShortcutConfig',
  }).extend({
    shortcuts: { run: { keys: 'mod+r' } },
  });

  const Plugin = createPlatePlugin({
    key: 'plateShortcutTargets',
    update: () => ({
      both: () => true,
      update: () => true,
    }),
  }).extend(() => ({
    api: {
      api: () => true,
      both: () => true,
    },
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

  const ApiScopeCollisionPlugin = Plugin.extend(() => ({
    extension: {
      api: {
        api: () => true,
      },
    },
  }));

  ApiScopeCollisionPlugin.extend({
    shortcuts: {
      // @ts-expect-error plugin/editor API collisions require a custom handler
      api: { keys: 'mod+a', target: 'api' },
    },
  });
};

void assertTypedPlateShortcutTargets;

const assertTypedRenderOwnership = () => {
  const CustomNode: NodeComponent = () => null;

  createBasePlugin({
    // @ts-expect-error Base constructors stay renderer-neutral
    component: CustomNode,
    key: 'intrinsicRender',
    render: {
      // @ts-expect-error custom node components use the Plate component field
      as: CustomNode,
    },
  });
  createBasePlugin({ key: 'staticRender' }).configure({
    component: CustomNode,
  });
  createPlatePlugin({
    component: CustomNode,
    key: 'customRender',
  });
};

void assertTypedRenderOwnership;

describe('createBasePlugin', () => {
  it('create a plugin with explicit types and cover various scenarios', () => {
    type TestStoreState = {
      valueA?: string;
      valueB?: number;
    };

    type TestApi = {
      testMethod: () => void;
    };

    const basePlugin = createPlatePlugin<
      PluginConfig<'testPlugin', TestStoreState, TestApi>
    >({
      key: 'testPlugin',
      type: 'test',
      initialState: {
        valueA: 'initial',
        valueB: 10,
      },
      extension: {
        api: {
          testMethod: () => {},
        },
      },
    });

    const baseEditor = createBaseEditor({
      plugins: [basePlugin],
    });

    // Test basic plugin creation
    expect(baseEditor.getPlugin(basePlugin).key).toBe('testPlugin');
    expect(baseEditor.getPlugin(basePlugin).type).toBe('test');
    expect(baseEditor.getPlugin(basePlugin).initialState).toEqual({
      valueA: 'initial',
      valueB: 10,
    });

    // Test configure method
    const configuredPlugin = basePlugin.configure({
      initialState: { valueA: 'modified' },
    });
    const configuredEditor = createBaseEditor({
      plugins: [configuredPlugin],
    });
    expect(configuredEditor.getPlugin(configuredPlugin).initialState).toEqual({
      valueA: 'modified',
      valueB: 10,
    });

    // Test extend method
    const extendedPlugin = basePlugin.extend({
      type: 'extended',
      initialState: { valueB: 20 },
    });
    const extendedEditor = createBaseEditor({
      plugins: [extendedPlugin],
    });
    expect(extendedEditor.getPlugin(extendedPlugin).type).toBe('extended');
    expect(extendedEditor.getPlugin(extendedPlugin).initialState).toEqual({
      valueA: 'initial',
      valueB: 20,
    });

    // Test multiple extensions before the one consumer configuration
    const multiExtendedPlugin = basePlugin
      .extend({ type: 'firstExtend' })
      .extend({ type: 'secondExtend' })
      .configure({
        initialState: {
          valueA: 'configured',
          valueB: 30,
        },
      });

    const resolvedMultiExtended = resolvePluginTest(multiExtendedPlugin);
    expect(resolvedMultiExtended.type).toBe('secondExtend');
    expect(resolvedMultiExtended.initialState).toEqual({
      valueA: 'configured',
      valueB: 30,
    });
  });
});
