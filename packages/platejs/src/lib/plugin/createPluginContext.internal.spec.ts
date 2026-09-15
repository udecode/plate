import {
  property,
  schema,
  target,
  type SchemaPropertyHandle,
} from '../../core';
import type { Editor } from '../editor';
import { createEditor } from '../editor';
import { createPluginContext } from './createPluginContext.internal';
import { definePlugin } from './definePlugin';

describe('createPluginContext', () => {
  const TestPlugin = definePlugin('test', {
    initialState: {
      testValue: 'initial',
    },
  });

  let editor: Editor;
  let testPlugin: typeof TestPlugin;

  beforeEach(() => {
    testPlugin = TestPlugin;

    editor = createEditor({
      plugins: [testPlugin],
    });
  });

  it('get plugin context by plugin object', () => {
    const context = createPluginContext(editor, testPlugin);

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

  it('reuses plugin access while keeping runtime getters live', () => {
    const context = createPluginContext(editor, testPlugin);
    const portal = editor.plugin(testPlugin);

    expect(createPluginContext(editor, testPlugin)).toBe(context);
    expect(editor.plugin(testPlugin)).toBe(portal);
    expect(context.store.get('testValue')).toBe('initial');
    expect(portal.store.get('testValue')).toBe('initial');
  });

  it('keeps plugin capability facades serialization-safe', () => {
    const plugin = definePlugin('serializableContext', {
      api: () => ({ ready: () => true }),
      read: () => ({ ready: () => true }),
      update: () => ({ run: () => {} }),
    });
    const typedEditor = createEditor({ plugins: [plugin] });
    const portal = typedEditor.plugin(plugin);

    expect(() => JSON.stringify(portal.api)).not.toThrow();
    expect(() => JSON.stringify(portal.read)).not.toThrow();
    expect(() => JSON.stringify(portal.update)).not.toThrow();
    expect(
      JSON.stringify({
        api: portal.api,
        read: portal.read,
        update: portal.update,
      })
    ).toBe('{"api":{}}');
  });

  it('works with plugin context typing', () => {
    const plugin = definePlugin('test', {
      initialState: {
        testValue: 'initial',
      },
    });

    const typedEditor = createEditor({
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

  it('does not reevaluate published schema factories for plugin access', () => {
    let schemaEvaluations = 0;
    const plugin = definePlugin('publishedSchema', {
      schema: () => {
        schemaEvaluations += 1;

        return {
          element: schema.element.textBlock(),
        };
      },
    });
    const typedEditor = createEditor({ plugins: [plugin] });
    const evaluationsAfterPublication = schemaEvaluations;

    for (let index = 0; index < 20; index++) {
      expect(typedEditor.plugin(plugin).schema.type).toBe('publishedSchema');
    }

    expect(schemaEvaluations).toBe(evaluationsAfterPublication);
  });

  it('publishes compiled injection defaults on the resolved descriptor', () => {
    const plugin = definePlugin('injected', {
      inject: { nodeProps: {} },
    });
    const typedEditor = createEditor({ plugins: [plugin] });

    expect(typedEditor.plugin(plugin).inject.nodeProps).toEqual({});
  });

  it('creates complete schema-property handles before model publication', () => {
    let authoredHandle: SchemaPropertyHandle | undefined;
    const plugin = definePlugin('authoredHandle', {
      api: ({ schema: authorSchema }) => {
        authoredHandle = authorSchema.properties.tone;

        return {};
      },
      schema: {
        properties: {
          tone: schema.elementProperty('persisted_tone', property.string(), {
            target: target.group('block'),
          }),
        },
      },
    });
    const typedEditor = createEditor({ plugins: [plugin] });
    const publishedHandle = createPluginContext(typedEditor, plugin).schema
      .properties.tone;

    expect(authoredHandle).toEqual({
      id: expect.stringMatching(/^element:persisted_tone@/),
      key: 'persisted_tone',
      kind: 'schema-property',
      placement: 'element',
    });
    expect(authoredHandle).toEqual(publishedHandle);
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

  it('resolves configured descriptors and ancestors but rejects siblings', () => {
    const plugin = definePlugin('runtimeFamily', {
      initialState: { value: 'root' },
    });
    const ancestor = plugin.extend({ initialState: { value: 'installed' } });
    const installed = ancestor.extend({}).configure({});
    const sibling = plugin.extend({ initialState: { value: 'sibling' } });
    const typedEditor = createEditor({ plugins: [installed] });

    expect(typedEditor.plugin(installed).installed).toBe(true);
    expect(typedEditor.plugin(installed).store.get('value')).toBe('installed');
    expect(typedEditor.plugin(plugin).installed).toBe(true);
    expect(typedEditor.plugin(plugin).store.get('value')).toBe('installed');
    expect(typedEditor.plugin(ancestor).installed).toBe(true);
    expect(typedEditor.plugin(ancestor).store.get('value')).toBe('installed');
    expect(typedEditor.plugin(sibling).installed).toBe(false);
    expect(() => typedEditor.plugin(sibling).store).toThrow(
      'descriptor is not installed'
    );
  });

  it('rejects weak name objects at runtime', () => {
    expect(() =>
      Reflect.apply(editor.plugin, editor, [{ name: 'test' }])
    ).toThrow();
  });

  it('rejects a same-name descriptor from a different family', () => {
    const foreignPlugin = definePlugin('test', {
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
  });

  it('does not publish resolved schema across an uninstalled same-name family', () => {
    const InstalledPlugin = definePlugin('shared', {
      schema: {
        element: { ...schema.element.textBlock(), type: 'installedType' },
      },
    });
    const RequestedPlugin = definePlugin('shared', {
      schema: {
        element: { ...schema.element.textBlock(), type: 'requestedType' },
      },
    });
    const typedEditor = createEditor({ plugins: [InstalledPlugin] });
    const requested = typedEditor.plugin(RequestedPlugin);

    expect(requested.installed).toBe(false);
    expect(() => requested.schema).toThrow('different descriptor family');
    expect(() => requested.name).toThrow('different descriptor family');
  });

  it('rejects a plugin that is not installed', () => {
    const unresolvedPlugin = definePlugin('unresolved', {
      initialState: {
        unresolvedValue: 'initial',
      },
    });

    const context = createPluginContext(editor, unresolvedPlugin);
    const portal = editor.plugin(unresolvedPlugin);

    expect(context.installed).toBe(false);
    expect(portal.installed).toBe(false);
    for (const capability of [
      () => portal.api,
      () => portal.name,
      () => portal.inject,
      () => portal.read,
      () => portal.store,
      () => portal.update,
    ]) {
      expect(capability).toThrow('Plate plugin "unresolved" is not installed.');
    }
    expect(() => context.plugin).toThrow(
      'Plate plugin "unresolved" is not installed.'
    );
  });

  it('requires installation before exposing resolved schema handles', () => {
    const ElementPlugin = definePlugin('uninstalledElement', {
      schema: { element: schema.element.textBlock() },
    });
    const MarkPlugin = definePlugin('uninstalledMark', {
      schema: { mark: property.boolean() },
    });

    expect(() => editor.plugin(ElementPlugin).schema).toThrow(
      'is not installed'
    );
    expect(() => editor.plugin(MarkPlugin).schema).toThrow('is not installed');
  });

  it('reports literal-disabled plugins as not installed', () => {
    const disabledPlugin = definePlugin('disabled', {
      enabled: false,
    });
    const disabledEditor = createEditor({
      plugins: [disabledPlugin],
    });

    expect(disabledEditor.plugin(disabledPlugin).installed).toBe(false);
  });

  it('publishes plugin API only under its owner namespace', () => {
    const plugin = definePlugin('methodPlugin', {
      api: () => ({
        editorMethod: () => 'editor',
        pluginMethod: () => 'plugin',
      }),
    });

    const typedEditor = createEditor({
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

  it('keeps capability facades callable without prototype traversal', () => {
    let updateInspections = 0;
    const plugin = definePlugin('capability', {
      read: () => ({
        inspect: () => 'read',
        isActive: () => true,
      }),
      update: () => ({
        inspect: () => {
          updateInspections += 1;
        },
        toggle: () => {},
      }),
    }).extend(() => ({
      api: () => ({
        inspect: () => 'ready',
      }),
    }));
    const typedEditor = createEditor({
      plugins: [plugin],
    });
    const context = typedEditor.plugin(plugin);

    expect(typeof context.api.inspect).toBe('function');
    expect(typeof context.read.isActive).toBe('function');
    expect(typeof context.update.toggle).toBe('function');
    expect(context.read.isActive()).toBe(true);
    expect(context.read.inspect()).toBe('read');
    context.update.inspect();
    expect(updateInspections).toBe(1);
    const prototypeFacade = Reflect.get(context.read, '__proto__');
    const inheritedMethod = Reflect.get(prototypeFacade, 'hasOwnProperty');

    expect(() =>
      Reflect.apply(inheritedMethod, prototypeFacade, ['isActive'])
    ).toThrow('Plugin read method "__proto__.hasOwnProperty" is not callable.');
  });

  it('keeps callable read roots symmetric through plugin access', () => {
    const plugin = definePlugin('callableRead', {
      read: () =>
        Object.assign(() => 'root', {
          nested: () => 'nested',
        }),
    });
    const typedEditor = createEditor({ plugins: [plugin] });

    expect(typedEditor.read.callableRead()).toBe('root');
    expect(typedEditor.plugin(plugin).read()).toBe('root');
    expect(typedEditor.plugin(plugin).read.nested()).toBe('nested');
  });

  it('supports compiled call and apply invocations on scoped capabilities', () => {
    const plugin = definePlugin('invocation', {
      read: ({ state }) => ({
        text: () => state.children()[0].children[0].text,
      }),
      update: ({ tx }) => ({
        insert: (text: string) =>
          tx.text.insert(text, { at: { path: [0, 0], offset: 0 } }),
      }),
    });
    const typedEditor = createEditor({ plugins: [plugin] });
    const portal = typedEditor.plugin(plugin);

    /* eslint-disable no-useless-call -- Exercise the invocation form emitted by React Compiler. */
    expect(portal.read.text.call(portal.read)).toBe('');
    portal.update.insert.call(portal.update, 'a');
    expect(portal.read.text.apply(portal.read, [])).toBe('a');
    /* eslint-enable no-useless-call */
    portal
      .update({ tags: ['compiled-call'] })
      .insert.apply(portal.update, ['b']);
    expect(portal.read.text()).toBe('ba');
    expect(typedEditor.read.lastCommit()?.tags).toContain('compiled-call');
  });

  it('exposes plugin-owned updates without their name namespace', () => {
    let mode: 'edit' | 'view' = 'view';
    let insertedBy: 'command' | null = null;
    let applied = false;
    const plugin = definePlugin('command', {
      update: () => ({
        apply: () => {
          applied = true;
        },
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
    const typedEditor = createEditor({
      plugins: [plugin],
    });

    typedEditor.plugin(plugin).update.apply();
    typedEditor.plugin(plugin).update.setMode('edit');
    typedEditor.plugin(plugin).update.insertNode();
    typedEditor.plugin(plugin).update.editorInsertNode();

    expect(mode).toBe('edit');
    expect(insertedBy).toBe('command');
    expect(applied).toBe(true);
  });

  it('applies policy through the scoped update facade exactly once', () => {
    let calls = 0;
    let tagged = false;
    const plugin = definePlugin('policyCommand', {
      update: ({ tx }) => ({
        run: () => {
          calls += 1;
          tagged = tx.tags.has('policy-test');
        },
      }),
    });
    const typedEditor = createEditor({ plugins: [plugin] });

    typedEditor.plugin(plugin).update({ tags: 'policy-test' }).run();

    expect(calls).toBe(1);
    expect(tagged).toBe(true);
  });
});
