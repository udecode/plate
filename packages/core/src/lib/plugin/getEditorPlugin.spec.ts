import type { BaseEditor } from '../editor';
import type { PluginConfig } from './PluginConfig';
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
      type: 'test-type',
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
      editor,
      plugin: expect.objectContaining({
        key: 'test',
        type: 'test-type',
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
      type: 'test-type',
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
      editor,
      plugin: expect.objectContaining({
        key: 'test',
        type: 'test-type',
      }),
      type: 'test-type',
    });
  });

  it('rejects a plugin that is not installed', () => {
    const unresolvedPlugin = createBasePlugin({
      key: 'unresolved',
      type: 'unresolved-type',
      options: {
        unresolvedOption: 'unresolvedValue',
      },
    });

    const context = getEditorPlugin(editor, unresolvedPlugin);

    expect(() => context.plugin).toThrow(
      'Plate plugin "unresolved" is not installed.'
    );
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

    expect(context.api.pluginMethod()).toBe('plugin');
    expect(typedEditor.api.editorMethod()).toBe('editor');
    // @ts-expect-error root editor APIs do not leak into plugin portals
    expect(context.api.editorMethod).toBeUndefined();
    // @ts-expect-error plugin APIs do not leak into the root editor API
    expect(typedEditor.api.pluginMethod).toBeUndefined();
  });

  it('exposes plugin-owned updates without their key namespace', () => {
    let mode: 'edit' | 'view' = 'view';
    let insertedBy: 'command' | 'other' | null = null;
    const plugin = createBasePlugin({ key: 'command' })
      .extendTx(() => () => ({
        setMode: (nextMode: 'edit' | 'view') => {
          mode = nextMode;
        },
      }))
      .extendTxGroup('insert', () => () => ({
        node: () => {
          insertedBy = 'command';
        },
      }))
      .extendExtension({
        tx: {
          editorInsert: () => ({
            node: () => {
              insertedBy = 'command';
            },
          }),
        },
      });
    const otherPlugin = createBasePlugin({ key: 'other' }).extendTxGroup(
      'insert',
      () => () => ({
        node: () => {
          insertedBy = 'other';
        },
      })
    );
    const typedEditor = createBaseEditor({
      plugins: [plugin, otherPlugin],
    });

    typedEditor.plugin(plugin).update.setMode('edit');
    typedEditor.plugin(plugin).update.insert.node();
    typedEditor.plugin(plugin).update.editorInsert.node();

    expect(mode).toBe('edit');
    expect(insertedBy).toBe('command');
  });
});
