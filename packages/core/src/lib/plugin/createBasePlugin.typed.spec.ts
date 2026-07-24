import type { NodeComponent, PluginConfig } from './PluginConfig';
import { property, schema, target } from '@platejs/plite';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { toPlatePlugin } from '../../react/plugin/toPlatePlugin';
import { createBaseEditor } from '../editor';
import type { BasePluginOverride } from './BasePlugin';
import { createBasePlugin } from './createBasePlugin';

const assertTypedSchemaContributions = () => {
  type SchemaConfig = PluginConfig<'validSchema', { targetTypes: string[] }>;

  createBasePlugin<SchemaConfig>({
    key: 'validSchema',
    options: { targetTypes: ['cell', 'header'] },
    schema: ({ options }) => ({
      properties: [
        schema.elementProperty('status', property.string(), {
          target: target.types(options.targetTypes),
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
  const BasePlugin = createBasePlugin<
    PluginConfig<'baseContextual', { enabled: boolean }>
  >({
    key: 'baseContextual',
    options: { enabled: false },
  });

  BasePlugin.configure(({ editor, plugin }) => {
    editor.id satisfies string;
    plugin.key satisfies 'baseContextual';

    return { options: { enabled: true } };
  });
  const ConfiguredBasePlugin = BasePlugin.configure({
    options: { enabled: true },
  });

  // @ts-expect-error configured descriptors accept one consumer configuration
  ConfiguredBasePlugin.configure({ options: { enabled: false } });
  // @ts-expect-error configured descriptors are terminal authoring inputs
  ConfiguredBasePlugin.extend({ options: { enabled: false } });

  const WrappedConfiguredBasePlugin = toPlatePlugin(ConfiguredBasePlugin);

  // @ts-expect-error Base-to-Plate wrapping preserves terminal authoring state
  WrappedConfiguredBasePlugin.withComponent(() => null);
  // @ts-expect-error React extension config must be applied before consumer configure
  toPlatePlugin(ConfiguredBasePlugin, { render: { node: () => null } });

  // @ts-expect-error contextual configure cannot add option fields
  BasePlugin.configure(() => ({ options: { missing: true } }));
  // @ts-expect-error contextual configure cannot define model fields
  BasePlugin.configure(() => ({ type: 'other' }));

  const PlatePlugin = createPlatePlugin<
    PluginConfig<'plateContextual', { enabled: boolean }>
  >({
    key: 'plateContextual',
    options: { enabled: false },
  });

  PlatePlugin.configure(({ editor, plugin }) => {
    editor.id satisfies string;
    plugin.key satisfies 'plateContextual';

    return { options: { enabled: true } };
  });
  const ConfiguredPlatePlugin = PlatePlugin.configure({
    options: { enabled: true },
  });

  // @ts-expect-error configured descriptors accept one consumer configuration
  ConfiguredPlatePlugin.configure({ options: { enabled: false } });
  // @ts-expect-error configured descriptors are terminal authoring inputs
  ConfiguredPlatePlugin.withComponent(() => null);

  // @ts-expect-error contextual configure cannot add option fields
  PlatePlugin.configure(() => ({ options: { missing: true } }));
  // @ts-expect-error contextual configure cannot define model fields
  PlatePlugin.configure(() => ({ schema: null }));
};

void assertTypedContextualConfiguration;

const assertTypedWeakPluginOverrides = () => {
  type TargetConfig = PluginConfig<'typedWeakTarget', { allowed: boolean }>;

  const exactOverride = {
    options: { allowed: true },
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
    options: {
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
    // @ts-expect-error explicitly typed factories declare shortcuts after capabilities
    shortcuts: { run: { keys: 'mod+r' } },
  });

  const Plugin = createPlatePlugin({ key: 'plateShortcutTargets' })
    .extendTx(() => () => ({
      both: () => true,
      update: () => true,
    }))
    .extendApi(() => ({
      api: () => true,
      both: () => true,
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

  const ApiScopeCollisionPlugin = Plugin.extendEditorApi(() => ({
    api: () => true,
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
    key: 'intrinsicRender',
    // @ts-expect-error custom renderers belong in withComponent
    render: {
      as: CustomNode,
    },
  });
  createBasePlugin({ key: 'customRender' }).withComponent(CustomNode);
};

void assertTypedRenderOwnership;

describe('createBasePlugin', () => {
  it('create a plugin with explicit types and cover various scenarios', () => {
    type TestOptions = {
      optionA?: string;
      optionB?: number;
    };

    type TestApi = {
      testMethod: () => void;
    };

    const basePlugin = createPlatePlugin<
      PluginConfig<'testPlugin', TestOptions, TestApi>
    >({
      key: 'testPlugin',
      type: 'test',
      options: {
        optionA: 'initial',
        optionB: 10,
      },
    }).extendEditorApi(() => ({
      testMethod: () => {},
    }));

    const baseEditor = createBaseEditor({
      plugins: [basePlugin],
    });

    // Test basic plugin creation
    expect(baseEditor.getPlugin(basePlugin).key).toBe('testPlugin');
    expect(baseEditor.getPlugin(basePlugin).type).toBe('test');
    expect(baseEditor.getPlugin(basePlugin).options).toEqual({
      optionA: 'initial',
      optionB: 10,
    });

    // Test configure method
    const configuredPlugin = basePlugin.configure({
      options: { optionA: 'modified' },
    });
    const configuredEditor = createBaseEditor({
      plugins: [configuredPlugin],
    });
    expect(configuredEditor.getPlugin(configuredPlugin).options).toEqual({
      optionA: 'modified',
      optionB: 10,
    });

    // Test extend method
    const extendedPlugin = basePlugin.extend({
      type: 'extended',
      options: { optionB: 20 },
    });
    const extendedEditor = createBaseEditor({
      plugins: [extendedPlugin],
    });
    expect(extendedEditor.getPlugin(extendedPlugin).type).toBe('extended');
    expect(extendedEditor.getPlugin(extendedPlugin).options).toEqual({
      optionA: 'initial',
      optionB: 20,
    });

    // Test the component convenience facade
    const MockComponent: NodeComponent = () => null;
    const componentPlugin = basePlugin.withComponent(MockComponent);
    const editorWithComponent = createBaseEditor({
      plugins: [componentPlugin],
    });
    expect(editorWithComponent.getPlugin(componentPlugin).render.node).toBe(
      MockComponent
    );

    // Test multiple extensions before the one consumer configuration
    const multiExtendedPlugin = basePlugin
      .extend({ type: 'firstExtend' })
      .extend({ type: 'secondExtend' })
      .configure({
        options: {
          optionA: 'configured',
          optionB: 30,
        },
      });

    const resolvedMultiExtended = resolvePluginTest(multiExtendedPlugin);
    expect(resolvedMultiExtended.type).toBe('secondExtend');
    expect(resolvedMultiExtended.options).toEqual({
      optionA: 'configured',
      optionB: 30,
    });
  });
});
