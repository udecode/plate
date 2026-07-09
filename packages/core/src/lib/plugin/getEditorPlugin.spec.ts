import type { BaseEditor } from '../editor';
import type { PluginConfig } from './SlatePlugin';
import type { BasePlugin } from './BasePlugin';

import { createBaseEditor } from '../editor';
import { createBasePlugin } from './createBasePlugin';
import { getEditorPlugin } from './getEditorPlugin';

describe('getEditorPlugin', () => {
  type TestConfig = PluginConfig<
    'test',
    {
      testOption: string;
    }
  >;

  let editor: BaseEditor;
  let testPlugin: BasePlugin<TestConfig>;

  beforeEach(() => {
    testPlugin = createBasePlugin<TestConfig>({
      key: 'test',
      node: { type: 'test-type' },
      options: {
        testOption: 'testValue',
      },
    });

    editor = createBaseEditor({
      plugins: [testPlugin],
    });
  });

  it('get plugin context by plugin object', () => {
    const context = getEditorPlugin(
      editor,
      testPlugin.configure({ options: { testOption: 't' } })
    );

    expect(context).toMatchObject({
      api: {},
      editorApi: editor.api,
      editor,
      plugin: expect.objectContaining({
        key: 'test',
        node: { type: 'test-type' },
      }),
      type: 'test-type',
    });
  });

  it('works with extension context typing', () => {
    type Config = PluginConfig<
      'test',
      {
        testOption: string;
      }
    >;
    const plugin = createBasePlugin<Config>({
      key: 'test',
      node: { type: 'test-type' },
      options: {
        testOption: 'testValue',
      },
    });

    const typedEditor = createBaseEditor({
      plugins: [plugin],
    });
    const context = getEditorPlugin(typedEditor, plugin);
    const option = context.getOption('testOption');
    const options = context.getOptions();

    expect(option satisfies string).toBe('testValue');
    expect(options.testOption satisfies string).toBe('testValue');

    const assertTypedContext = () => {
      // @ts-expect-error invalid option keys should stay rejected.
      context.getOption('missingOption');
    };
    void assertTypedContext;
  });

  it('exposes plugin context as an editor method', () => {
    const context = editor.plugin(testPlugin);
    const option = context.getOption('testOption');

    expect(option satisfies string).toBe('testValue');
    expect(context.plugin.key).toBe('test');
  });

  it('exposes key-based plugin context as an editor method', () => {
    const context = editor.plugin<TestConfig>('test');
    const option = context.getOption('testOption');

    expect(option satisfies string).toBe('testValue');
    expect(context.plugin.key).toBe('test');
  });

  it('get plugin context by plugin key', () => {
    const context = getEditorPlugin(editor, { key: 'test' });

    expect(context).toMatchObject({
      api: {},
      editorApi: editor.api,
      editor,
      plugin: expect.objectContaining({
        key: 'test',
        node: { type: 'test-type' },
      }),
      type: 'test-type',
    });
  });

  it('resolve unresolved plugin', () => {
    const unresolvedPlugin = createBasePlugin({
      key: 'unresolved',
      node: { type: 'unresolved-type' },
      options: {
        unresolvedOption: 'unresolvedValue',
      },
    });

    const context = getEditorPlugin(editor, unresolvedPlugin);

    expect(context).toMatchObject({
      api: {},
      editorApi: editor.api,
      editor,
      plugin: expect.objectContaining({
        key: 'unresolved',
        node: { type: 'unresolved-type' },
      }),
      type: 'unresolved-type',
    });
  });

  it('splits plugin-owned API from the root editor API', () => {
    const plugin = createBasePlugin({
      key: 'methodPlugin',
    })
      .extendEditorApi(() => ({
        editorMethod: () => 'editor',
      }))
      .extendApi(() => ({
        pluginMethod: () => 'plugin',
      }));

    const typedEditor = createBaseEditor({
      plugins: [plugin],
    });
    const context = typedEditor.plugin(plugin);

    expect(context.api.editorMethod()).toBe('editor');
    expect(context.api.pluginMethod()).toBe('plugin');
    expect(context.editorApi.editorMethod()).toBe('editor');
    expect(context.editorApi.methodPlugin.pluginMethod()).toBe('plugin');
    expect((context.api as any).methodPlugin).toBeUndefined();
  });
});
