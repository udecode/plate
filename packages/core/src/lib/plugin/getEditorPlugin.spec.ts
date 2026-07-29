import type { BaseEditor } from '../editor';

import { createBaseEditor } from '../editor';
import { createBasePlugin } from './createBasePlugin';
import { getEditorPlugin } from './getEditorPlugin';

describe('getEditorPlugin', () => {
  const TestPlugin = createBasePlugin({
    key: 'test',
    type: 'test-type',
    initialState: {
      testValue: 'initial',
    },
  });

  let editor: BaseEditor;
  let testPlugin: typeof TestPlugin;

  beforeEach(() => {
    testPlugin = TestPlugin;

    editor = createBaseEditor({
      plugins: [testPlugin],
    });
  });

  it('get plugin context by plugin object', () => {
    const context = getEditorPlugin(
      editor,
      testPlugin.configure({ initialState: { testValue: 'configured' } })
    );

    expect(context).toMatchObject({
      api: {},
      editor,
      installed: true,
      plugin: expect.objectContaining({
        key: 'test',
        type: 'test-type',
      }),
      type: 'test-type',
    });
  });

  it('works with extension context typing', () => {
    const plugin = createBasePlugin({
      key: 'test',
      type: 'test-type',
      initialState: {
        testValue: 'initial',
      },
    });

    const typedEditor = createBaseEditor({
      plugins: [plugin],
    });
    const context = getEditorPlugin(typedEditor, plugin);
    const value = context.store.get('testValue');
    const initialState = context.store.get();

    expect(value satisfies string).toBe('initial');
    expect(initialState.testValue satisfies string).toBe('initial');

    const assertTypedContext = () => {
      // @ts-expect-error invalid state keys should stay rejected.
      context.store.get('missingValue');
    };
    void assertTypedContext;
  });

  it('exposes plugin context as an editor method', () => {
    const context = editor.plugin(testPlugin);
    const value = context.store.get('testValue');

    expect(value satisfies string).toBe('initial');
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
      initialState: {
        unresolvedValue: 'initial',
      },
    });

    const context = getEditorPlugin(editor, unresolvedPlugin);

    expect(context.installed).toBe(false);
    expect(() => context.plugin).toThrow(
      'Plate plugin "unresolved" is not installed.'
    );
  });

  it('reports literal-disabled plugins as not installed', () => {
    const disabledPlugin = createBasePlugin({
      enabled: false,
      key: 'disabled',
    });
    const disabledEditor = createBaseEditor({
      plugins: [disabledPlugin],
    });

    expect(disabledEditor.plugin(disabledPlugin).installed).toBe(false);
  });

  it('splits plugin-owned API from the root editor API', () => {
    const plugin = createBasePlugin({
      key: 'methodPlugin',
      extension: {
        api: {
          editorMethod: () => 'editor',
        },
      },
    }).extend(() => ({
      api: {
        pluginMethod: () => 'plugin',
      },
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

  it('preserves function introspection on plugin capability facades', () => {
    const plugin = createBasePlugin({
      key: 'capability',
      read: () => ({
        isActive: () => true,
      }),
      update: () => ({
        toggle: () => {},
      }),
    }).extend(() => ({
      api: {
        inspect: () => 'ready',
      },
    }));
    const typedEditor = createBaseEditor({
      plugins: [plugin],
    });
    const context = typedEditor.plugin(plugin);

    expect(context.api.inspect.constructor).toBe(Function);
    expect(context.read.isActive.constructor).toBe(Function);
    expect(context.update.toggle.constructor).toBe(Function);
    expect(context.read.isActive()).toBe(true);
  });

  it('exposes plugin-owned updates without their key namespace', () => {
    let mode: 'edit' | 'view' = 'view';
    let insertedBy: 'command' | null = null;
    const plugin = createBasePlugin({
      key: 'command',
      update: () => ({
        setMode: (nextMode: 'edit' | 'view') => {
          mode = nextMode;
        },
      }),
    })
      .extend(() => ({
        extension: {
          tx: {
            insert: () => ({
              node: () => {
                insertedBy = 'command';
              },
            }),
          },
        },
      }))
      .extend({
        extension: {
          tx: {
            editorInsert: () => ({
              node: () => {
                insertedBy = 'command';
              },
            }),
          },
        },
      });
    const typedEditor = createBaseEditor({
      plugins: [plugin],
    });

    typedEditor.plugin(plugin).update.setMode('edit');
    typedEditor.plugin(plugin).update.insert.node();
    typedEditor.plugin(plugin).update.editorInsert.node();

    expect(mode).toBe('edit');
    expect(insertedBy).toBe('command');
  });
});
