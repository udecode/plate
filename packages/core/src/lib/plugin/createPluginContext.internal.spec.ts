import { property, schema } from '@platejs/plite';

import type { BaseEditor } from '../editor';

import { createBaseEditor } from '../editor';
import { defineBasePlugin } from './defineBasePlugin';
import { createPluginContext } from './createPluginContext.internal';

describe('createPluginContext', () => {
  const TestPlugin = defineBasePlugin('test', {
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
      }),
      name: 'test',
    });
  });

  it('works with extension context typing', () => {
    const plugin = defineBasePlugin('test', {
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
    expect(context.name).toBe('test');
    expect(context).not.toHaveProperty('plugin');
    expect(context).not.toHaveProperty('defineCodecs');
    expect(context).not.toHaveProperty('editor');
  });

  it('publishes compiled injection defaults on the resolved descriptor', () => {
    const plugin = defineBasePlugin('injected', {
      inject: { nodeProps: {} },
    });
    const typedEditor = createBaseEditor({ plugins: [plugin] });

    expect(typedEditor.plugin(plugin).inject.nodeProps).toEqual({});
  });

  it('gets plugin context by plugin name', () => {
    const context = createPluginContext(editor, 'test');

    expect(context).toMatchObject({
      api: {},
      editor,
      plugin: expect.objectContaining({
        name: 'test',
      }),
      name: 'test',
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
    const foreignPlugin = defineBasePlugin('test', {
      api: () => ({
        foreignMethod: () => 'foreign',
      }),
    });
    const context = editor.plugin(foreignPlugin);

    expect(context.installed).toBe(false);
    expect(() => context.name).toThrow('different descriptor family');
    expect(() => context.api.foreignMethod()).toThrow(
      'different descriptor family'
    );
    expect(() => editor.plugin(foreignPlugin).name).toThrow(
      'different descriptor family'
    );
    const dynamicPortal = editor.plugin('test');

    expect(dynamicPortal.installed).toBe(true);
    expect(dynamicPortal.name).toBe('test');
  });

  it('does not publish resolved schema across an uninstalled same-name family', () => {
    const InstalledPlugin = defineBasePlugin('shared', {
      schema: {
        element: { ...schema.element.textBlock(), type: 'installedType' },
      },
    });
    const RequestedPlugin = defineBasePlugin('shared', {
      schema: {
        element: { ...schema.element.textBlock(), type: 'requestedType' },
      },
    });
    const typedEditor = createBaseEditor({ plugins: [InstalledPlugin] });
    const requested = typedEditor.plugin(RequestedPlugin);

    expect(requested.installed).toBe(false);
    expect(() => requested.schema).toThrow('different descriptor family');
    expect(() => requested.name).toThrow('different descriptor family');
  });

  it('rejects a plugin that is not installed', () => {
    const unresolvedPlugin = defineBasePlugin('unresolved', {
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
      () => dynamicPortal.name,
      () => dynamicPortal.inject,
      () => dynamicPortal.read,
      () => dynamicPortal.store,
      () => dynamicPortal.update,
    ]) {
      expect(capability).toThrow('Plate plugin "unresolved" is not installed.');
    }
    expect(() => context.plugin).toThrow(
      'Plate plugin "unresolved" is not installed.'
    );
  });

  it('requires installation before exposing resolved schema handles', () => {
    const ElementPlugin = defineBasePlugin('uninstalledElement', {
      schema: { element: schema.element.textBlock() },
    });
    const MarkPlugin = defineBasePlugin('uninstalledMark', {
      schema: { mark: property.boolean() },
    });

    expect(() => editor.plugin(ElementPlugin).schema).toThrow(
      'is not installed'
    );
    expect(() => editor.plugin(MarkPlugin).schema).toThrow('is not installed');
    expect(() => editor.plugin('codeBlock').schema).toThrow('is not installed');
  });

  it('reports literal-disabled plugins as not installed', () => {
    const disabledPlugin = defineBasePlugin('disabled', {
      enabled: false,
    });
    const disabledEditor = createBaseEditor({
      plugins: [disabledPlugin],
    });

    expect(disabledEditor.plugin(disabledPlugin).installed).toBe(false);
  });

  it('publishes plugin API only under its owner namespace', () => {
    const plugin = defineBasePlugin('methodPlugin', {
      api: () => ({
        editorMethod: () => 'editor',
        pluginMethod: () => 'plugin',
      }),
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
    const plugin = defineBasePlugin('capability', {
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
    const plugin = defineBasePlugin('command', {
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
