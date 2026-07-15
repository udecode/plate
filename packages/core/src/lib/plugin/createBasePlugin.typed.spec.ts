import type { NodeComponent, PluginConfig } from './PluginConfig';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createPlatePlugin } from '../../react/plugin/createPlatePlugin';
import { createBaseEditor } from '../editor';
import { createBasePlugin } from './createBasePlugin';

describe('createBasePlugin', () => {
  it('work with fn', () => {
    // Test plugin creation with a function
    const functionPlugin = createBasePlugin<
      PluginConfig<'functionPlugin', { editorId: string }>
    >((editor) => ({
      key: 'functionPlugin',
      options: { editorId: editor.id },
    }));

    const resolvedFunctionPlugin = resolvePluginTest(functionPlugin);
    expect(resolvedFunctionPlugin.key).toBe('functionPlugin');
  });

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
      node: { type: 'test' },
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
    expect(baseEditor.plugins.testPlugin.node.type).toBe('test');
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
      node: { type: 'extended' },
      options: { optionB: 20 },
    });
    const extendedEditor = createBaseEditor({
      plugins: [extendedPlugin],
    });
    expect(extendedEditor.plugins.testPlugin.node.type).toBe('extended');
    expect(extendedEditor.plugins.testPlugin.options).toEqual({
      optionA: 'initial',
      optionB: 20,
    });

    // Test withComponent method
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

    // Test plugin creation with a function
    const functionPlugin = createBasePlugin<
      PluginConfig<'functionPlugin', { editorId: string }>
    >((editor) => ({
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
