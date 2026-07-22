import type { NodeComponent, PluginConfig } from './PluginConfig';
import { property, schema, target } from '@platejs/plite';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { createBaseEditor } from '../editor';
import { createBasePlugin } from './createBasePlugin';

const assertTypedSchemaContributions = () => {
  type SchemaConfig = PluginConfig<
    'validSchema',
    {},
    {},
    {},
    {},
    {},
    readonly [],
    { targetPluginKeys: string[] }
  >;

  createBasePlugin<SchemaConfig>({
    config: { targetPluginKeys: ['cell', 'header'] },
    key: 'validSchema',
    schema: ({ config }) => {
      // @ts-expect-error schema callback config is deeply readonly
      config.targetPluginKeys.push('paragraph');

      return {
        properties: [
          schema.elementProperty('status', property.string(), {
            target: target.types(config.targetPluginKeys),
          }),
        ],
      };
    },
  });

  createBasePlugin({
    key: 'invalidSchema',
    // @ts-expect-error schema callbacks cannot access the editor runtime
    schema: ({ editor }) => ({ editor }),
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
    expect(baseEditor.plugins.testPlugin.key).toBe('testPlugin');
    expect(baseEditor.plugins.testPlugin.type).toBe('test');
    expect(baseEditor.plugins.testPlugin.options).toEqual({
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
    expect(configuredEditor.plugins.testPlugin.options).toEqual({
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
    expect(extendedEditor.plugins.testPlugin.type).toBe('extended');
    expect(extendedEditor.plugins.testPlugin.options).toEqual({
      optionA: 'initial',
      optionB: 20,
    });

    // Test the component convenience facade
    const MockComponent: NodeComponent = () => null;
    const componentPlugin = basePlugin.withComponent(MockComponent);
    const editorWithComponent = createBaseEditor({
      plugins: [componentPlugin],
    });
    expect(editorWithComponent.plugins.testPlugin.render.node).toBe(
      MockComponent
    );

    // Test nested plugins and extendPlugin
    const nestedPlugin = createBasePlugin<
      PluginConfig<'nested', { nestedOption: string }>
    >({
      key: 'nested',
      options: { nestedOption: 'initial' },
    });

    const parentPlugin = createBasePlugin<
      PluginConfig<'parent', { parentOption: string }>
    >({
      key: 'parent',
      options: { parentOption: 'parent' },
      plugins: [nestedPlugin],
    });

    const extendedParentPlugin = parentPlugin.extendPlugin(nestedPlugin, {
      options: { nestedOption: 'modified' },
    });

    const resolvedParentEditor = createBaseEditor({
      plugins: [extendedParentPlugin],
    });
    expect(resolvedParentEditor.plugins.nested.options).toEqual({
      nestedOption: 'modified',
    });

    // Test configurePlugin
    const configuredParentPlugin = parentPlugin.configurePlugin(nestedPlugin, {
      options: { nestedOption: 'configured' },
    });

    const resolvedConfiguredParentEditor = createBaseEditor({
      plugins: [configuredParentPlugin],
    });
    expect(resolvedConfiguredParentEditor.plugins.nested.options).toEqual({
      nestedOption: 'configured',
    });

    // Test multiple extends and configurations
    const multiExtendedPlugin = basePlugin
      .extend({ type: 'firstExtend' })
      .configure({ options: { optionA: 'firstConfigure' } })
      .extend({ type: 'secondExtend' })
      .configure({ options: { optionB: 30 } });

    const resolvedMultiExtended = resolvePluginTest(multiExtendedPlugin);
    expect(resolvedMultiExtended.type).toBe('secondExtend');
    expect(resolvedMultiExtended.options).toEqual({
      optionA: 'initial',
      optionB: 30,
    });
  });
});
