import type { NodeComponent, PluginConfig } from './BasePlugin';

import { createTPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { createSlateEditor } from '../editor';
import { resolvePluginTest } from '../utils';
import { createTSlatePlugin } from './createSlatePlugin';

describe('createTSlatePlugin', () => {
  it('should work with fn', () => {
    // Test plugin creation with a function
    const functionPlugin = createTSlatePlugin<
      PluginConfig<'functionPlugin', { editorId: string }>
    >((editor: any) => ({
      key: 'functionPlugin',
      options: { editorId: editor.id },
    }));

    const resolvedFunctionPlugin = resolvePluginTest(functionPlugin);
    expect(resolvedFunctionPlugin.key).toBe('functionPlugin');
  });

  it('should create a plugin with explicit types and cover various scenarios', () => {
    interface TestOptions {
      optionA?: string;
      optionB?: number;
    }

    interface TestApi {
      testMethod: () => void;
    }

    const basePlugin = createTPlatePlugin<
      PluginConfig<'testPlugin', TestOptions, TestApi>
    >({
      key: 'testPlugin',
      node: { type: 'test' },
      options: {
        optionA: 'initial',
        optionB: 10,
      },
    }).extendEditorApi(() => ({
      testMethod: () => {},
    }));

    const baseEditor = createSlateEditor({
      plugins: [basePlugin],
    });

    // Test basic plugin creation
    expect(baseEditor.plugins.testPlugin.key).toBe('testPlugin');
    expect(baseEditor.plugins.testPlugin.node.type).toBe('test');
    expect(baseEditor.plugins.testPlugin.options).toEqual({
      optionA: 'initial',
      optionB: 10,
    });

    // Test configure method
    const configuredPlugin = basePlugin.configure({
      options: { optionA: 'modified' },
    });
    const configuredEditor = createSlateEditor({
      plugins: [configuredPlugin],
    });
    expect(configuredEditor.plugins.testPlugin.options).toEqual({
      optionA: 'modified',
      optionB: 10,
    });

    // Test extend method
    const extendedPlugin = basePlugin.extend({
      node: { type: 'extended' },
      options: { optionB: 20 },
    });
    const extendedEditor = createSlateEditor({
      plugins: [extendedPlugin],
    });
    expect(extendedEditor.plugins.testPlugin.node.type).toBe('extended');
    expect(extendedEditor.plugins.testPlugin.options).toEqual({
      optionA: 'initial',
      optionB: 20,
    });

    // Test withComponent method
    const MockComponent: NodeComponent = () => null;
    const pluginWithComponent = basePlugin.withComponent(MockComponent);
    const editorWithComponent = createSlateEditor({
      plugins: [pluginWithComponent],
    });
    expect(editorWithComponent.plugins.testPlugin.render.node).toBe(
      MockComponent
    );

    // Test nested plugins and extendPlugin
    const nestedPlugin = createTSlatePlugin<
      PluginConfig<'nested', { nestedOption: string }>
    >({
      key: 'nested',
      options: { nestedOption: 'initial' },
    });

    const parentPlugin = createTSlatePlugin<
      PluginConfig<'parent', { parentOption: string }>
    >({
      key: 'parent',
      options: { parentOption: 'parent' },
      plugins: [nestedPlugin],
    });

    const extendedParentPlugin = parentPlugin.extendPlugin(
      { key: 'nested' },
      {
        options: { nestedOption: 'modified' },
      }
    );

    const resolvedParentEditor = createSlateEditor({
      plugins: [extendedParentPlugin],
    });
    expect(resolvedParentEditor.plugins.nested.options).toEqual({
      nestedOption: 'modified',
    });

    // Test configurePlugin
    const configuredParentPlugin = parentPlugin.configurePlugin(nestedPlugin, {
      options: { nestedOption: 'configured' },
    });

    const resolvedConfiguredParentEditor = createSlateEditor({
      plugins: [configuredParentPlugin],
    });
    expect(resolvedConfiguredParentEditor.plugins.nested.options).toEqual({
      nestedOption: 'configured',
    });

    // Test plugin creation with a function
    const functionPlugin = createTSlatePlugin<
      PluginConfig<'functionPlugin', { editorId: string }>
    >((editor: any) => ({
      key: 'functionPlugin',
      options: { editorId: editor.id },
    }));

    const resolvedFunctionPlugin = resolvePluginTest(functionPlugin);
    expect(resolvedFunctionPlugin.key).toBe('functionPlugin');
    expect(resolvedFunctionPlugin.options).toHaveProperty('editorId');

    // Test multiple extends and configurations
    const multiExtendedPlugin = basePlugin
      .extend({ node: { type: 'firstExtend' } })
      .configure({ options: { optionA: 'firstConfigure' } })
      .extend({ node: { type: 'secondExtend' } })
      .configure({ options: { optionB: 30 } });

    const resolvedMultiExtended = resolvePluginTest(multiExtendedPlugin);
    expect(resolvedMultiExtended.node.type).toBe('secondExtend');
    expect(resolvedMultiExtended.options).toEqual({
      optionA: 'initial',
      optionB: 30,
    });
  });
});
