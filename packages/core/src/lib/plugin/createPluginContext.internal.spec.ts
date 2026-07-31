import type { BaseEditor } from '../editor';

import { createBaseEditor } from '../editor';
import { createBasePlugin } from './createBasePlugin';
import { createPluginContext } from './createPluginContext.internal';

describe('createPluginContext', () => {
  const TestPlugin = createBasePlugin({
    name: 'test',
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
    const context = createPluginContext(
      editor,
      testPlugin.configure({ initialState: { testValue: 'configured' } })
    );

    expect(context).toMatchObject({
      api: {},
      editor,
      installed: true,
      plugin: expect.objectContaining({
        name: 'test',
        type: 'test-type',
      }),
      type: 'test-type',
    });
  });

  it('works with extension context typing', () => {
    const plugin = createBasePlugin({
      name: 'test',
      type: 'test-type',
      initialState: {
        testValue: 'initial',
      },
    });

    const typedEditor = createBaseEditor({
      plugins: [plugin],
    });
    const context = createPluginContext(typedEditor, plugin);
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
    expect(context.plugin.name).toBe('test');
    expect(context).not.toHaveProperty('defineCodecs');
    expect(context).not.toHaveProperty('editor');
  });

  it('publishes compiled injection defaults on the resolved descriptor', () => {
    const plugin = createBasePlugin({
      inject: { nodeProps: {} },
      name: 'injected',
      type: 'injected-type',
    });
    const typedEditor = createBaseEditor({ plugins: [plugin] });

    expect(typedEditor.plugin(plugin).plugin.inject.nodeProps).toMatchObject({
      nodeKey: 'injected-type',
      styleKey: 'injected-type',
    });
  });

  it('gets plugin context by plugin name', () => {
    const context = createPluginContext(editor, 'test');

    expect(context).toMatchObject({
      api: {},
      editor,
      plugin: expect.objectContaining({
        name: 'test',
        type: 'test-type',
      }),
      type: 'test-type',
    });
  });

  it('rejects weak name objects at runtime', () => {
    expect(() =>
      Reflect.apply(editor.plugin, editor, [{ name: 'test' }])
    ).toThrow(
      'Plate plugin lookup requires a plugin descriptor or plugin name string.'
    );
  });

  it('rejects a same-name descriptor from a different family', () => {
    const foreignPlugin = createBasePlugin({
      api: () => ({
        foreignMethod: () => 'foreign',
      }),
      name: 'test',
      type: 'test-type',
    });
    const context = editor.plugin(foreignPlugin);

    expect(context.installed).toBe(false);
    expect(() => context.plugin).toThrow('different descriptor family');
    expect(() => context.api.foreignMethod()).toThrow(
      'different descriptor family'
    );
    expect(() => editor.plugin(foreignPlugin).plugin).toThrow(
      'different descriptor family'
    );
    const dynamicPortal = editor.plugin('test');

    expect(dynamicPortal.installed).toBe(true);
    expect(dynamicPortal.type).toBe('test-type');
    expect(dynamicPortal.plugin.name).toBe('test');
  });

  it('rejects a plugin that is not installed', () => {
    const unresolvedPlugin = createBasePlugin({
      name: 'unresolved',
      type: 'unresolved-type',
      initialState: {
        unresolvedValue: 'initial',
      },
    });

    const context = createPluginContext(editor, unresolvedPlugin);
    const dynamicPortal = editor.plugin('unresolved');

    expect(context.installed).toBe(false);
    expect(dynamicPortal.installed).toBe(false);
    for (const capability of [
      () => dynamicPortal.api,
      () => dynamicPortal.plugin,
      () => dynamicPortal.read,
      () => dynamicPortal.store,
      () => dynamicPortal.type,
      () => dynamicPortal.update,
    ]) {
      expect(capability).toThrow('Plate plugin "unresolved" is not installed.');
    }
    expect(() => context.plugin).toThrow(
      'Plate plugin "unresolved" is not installed.'
    );
  });

  it('reports literal-disabled plugins as not installed', () => {
    const disabledPlugin = createBasePlugin({
      enabled: false,
      name: 'disabled',
    });
    const disabledEditor = createBaseEditor({
      plugins: [disabledPlugin],
    });

    expect(disabledEditor.plugin(disabledPlugin).installed).toBe(false);
  });

  it('publishes plugin API only under its owner namespace', () => {
    const plugin = createBasePlugin({
      api: () => ({
        editorMethod: () => 'editor',
        pluginMethod: () => 'plugin',
      }),
      name: 'methodPlugin',
    });

    const typedEditor = createBaseEditor({
      plugins: [plugin],
    });
    const context = typedEditor.plugin(plugin);

    expect(context.api.pluginMethod()).toBe('plugin');
    expect(context.api.editorMethod()).toBe('editor');
    expect(context.api).toBe(typedEditor.api.methodPlugin);
    // @ts-expect-error owner-local methods never publish at the editor root.
    expect(typedEditor.api.pluginMethod).toBeUndefined();
    // @ts-expect-error owner-local methods never publish at the editor root.
    expect(typedEditor.api.editorMethod).toBeUndefined();
  });

  it('preserves function introspection on plugin capability facades', () => {
    const plugin = createBasePlugin({
      name: 'capability',
      read: () => ({
        isActive: () => true,
      }),
      update: () => ({
        toggle: () => {},
      }),
    }).extend(() => ({
      api: () => ({
        inspect: () => 'ready',
      }),
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

  it('exposes plugin-owned updates without their name namespace', () => {
    let mode: 'edit' | 'view' = 'view';
    let insertedBy: 'command' | null = null;
    const plugin = createBasePlugin({
      name: 'command',
      update: () => ({
        editorInsertNode: () => {
          insertedBy = 'command';
        },
        insertNode: () => {
          insertedBy = 'command';
        },
        setMode: (nextMode: 'edit' | 'view') => {
          mode = nextMode;
        },
      }),
    });
    const typedEditor = createBaseEditor({
      plugins: [plugin],
    });

    typedEditor.plugin(plugin).update.setMode('edit');
    typedEditor.plugin(plugin).update.insertNode();
    typedEditor.plugin(plugin).update.editorInsertNode();

    expect(mode).toBe('edit');
    expect(insertedBy).toBe('command');
  });
});
