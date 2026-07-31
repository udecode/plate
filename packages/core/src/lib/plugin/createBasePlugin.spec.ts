import { defineEditorExtension, property } from '@platejs/plite';
import { getInstalledEditorExtension } from '@platejs/plite/internal';

import { createBaseEditor } from '../editor';
import { createBasePlugin } from './createBasePlugin';

const value = [{ children: [{ text: '' }], type: 'p' }];

describe('createBasePlugin', () => {
  it('creates one exact plugin owner with inferred state and API', () => {
    const CounterPlugin = createBasePlugin({
      api: ({ store }) => ({
        count: () => store.get().count,
      }),
      name: 'counter',
      initialState: { count: 2 },
    });
    const editor = createBaseEditor({
      plugins: [CounterPlugin],
      initialValue: value,
    });

    expect(CounterPlugin.name).toBe('counter');
    expect(CounterPlugin.type).toBe('counter');
    expect(editor.api.counter.count()).toBe(2);
    expect(editor.api.counter).toBe(editor.plugin(CounterPlugin).api);
  });

  it('evaluates ordered author stages once per editor', () => {
    const calls: string[] = [];
    const Plugin = createBasePlugin({
      api: () => ({ first: () => 1 }),
      name: 'ordered',
    })
      .extend(({ api }) => {
        calls.push(`second:${api.first()}`);

        return {
          api: () => ({ second: () => api.first() + 1 }),
        };
      })
      .extend(({ api }) => {
        calls.push(`third:${api.second()}`);

        return {
          api: () => ({ third: () => api.first() + api.second() }),
        };
      });
    const editor = createBaseEditor({ plugins: [Plugin] });

    expect(calls).toEqual(['second:1', 'third:2']);
    expect(editor.api.ordered.third()).toBe(3);
  });

  it('merges staged initialState without mutating its family', () => {
    const BasePlugin = createBasePlugin({
      name: 'state',
      initialState: { first: 1, second: 2 },
    });
    const ExtendedPlugin = BasePlugin.extend({
      initialState: { second: 3 },
    });
    const editor = createBaseEditor({ plugins: [ExtendedPlugin] });

    expect(BasePlugin.initialState).toEqual({ first: 1, second: 2 });
    expect(editor.plugin(ExtendedPlugin).store.get()).toEqual({
      first: 1,
      second: 3,
    });
  });

  it('adopts native Plite fields flat and preserves portal identity', () => {
    const NativeExtension = defineEditorExtension({
      api: () => ({ name: () => 'native' }),
      name: 'native',
      read: ({ state }) => ({
        childCount: () => state.value().children.length,
      }),
      update: ({ tx }) => ({
        insert: (text: string) => tx.text.insert(text),
      }),
    });
    const NativePlugin = createBasePlugin({ name: 'native' }).extend(
      NativeExtension
    );
    const editor = createBaseEditor({
      plugins: [NativePlugin],
      initialValue: value,
    });
    const installed = getInstalledEditorExtension(editor, 'native')!;
    const ForeignNativeExtension = defineEditorExtension({
      name: 'native',
    });

    expect(Object.isFrozen(NativeExtension)).toBe(true);
    expect(editor.api.native).toBe(editor.plugin(NativePlugin).api);
    expect(editor.api.native).toBe(editor.extension(NativePlugin).api);
    expect(editor.api.native).toBe(
      Reflect.apply(editor.extension, editor, [NativeExtension]).api
    );
    expect(editor.api.native).toBe(
      Reflect.apply(editor.extension, editor, [installed]).api
    );
    expect(editor.api.native.name()).toBe('native');
    expect(editor.read.native.childCount()).toBe(1);
    expect(() =>
      Reflect.apply(editor.extension, editor, [ForeignNativeExtension])
    ).toThrow('not installed');

    editor.update((tx) => {
      tx.native.insert('x');
    });
    expect(editor.read.children()[0].children[0].text).toBe('x');
  });

  it('resolves authored dependency portals to their lowered extensions', () => {
    const DependencyPlugin = createBasePlugin({
      api: () => ({ value: () => 42 }),
      name: 'portalDependency',
    });
    const ConsumerPlugin = createBasePlugin({
      api: ({ editor }) => ({
        dependencyValue: () => editor.extension(DependencyPlugin).api.value(),
      }),
      dependencies: [DependencyPlugin],
      name: 'portalConsumer',
    });
    const editor = createBaseEditor({
      plugins: [ConsumerPlugin],
    });
    const ForeignDependencyPlugin = createBasePlugin({
      api: () => ({ value: () => 0 }),
      name: 'portalDependency',
    });

    expect(editor.api.portalConsumer.dependencyValue()).toBe(42);
    expect(() => editor.extension(ForeignDependencyPlugin).api.value()).toThrow(
      'different descriptor family'
    );
  });

  it('combines Plate and native update capabilities under one owner', () => {
    const NativeExtension = defineEditorExtension({
      name: 'combined',
      update: ({ tx }) => ({
        native: () => tx.text.insert('n'),
      }),
    });
    const Plugin = createBasePlugin({
      name: 'combined',
      update: ({ tx }) => ({
        plate: () => tx.text.insert('p'),
      }),
    }).extend(NativeExtension);
    const editor = createBaseEditor({
      plugins: [Plugin],
      initialValue: value,
    });

    editor.update((tx) => {
      tx.combined.plate();
      tx.combined.native();
    });
    expect(editor.read.children()[0].children[0].text).toBe('pn');
  });

  it('applies terminal configuration before author stages resolve', () => {
    const Plugin = createBasePlugin({
      name: 'configured',
      initialState: { value: 1 },
    })
      .extend(({ store }) => ({
        api: () => ({ value: () => store.get().value }),
      }))
      .configure({ initialState: { value: 4 } });
    const editor = createBaseEditor({ plugins: [Plugin] });

    expect(editor.api.configured.value()).toBe(4);
  });

  it('resolves contextual terminal configuration independently per editor', () => {
    let next = 0;
    const Plugin = createBasePlugin({
      name: 'contextual',
      initialState: { value: 0 },
    })
      .extend(({ store }) => ({
        api: () => ({ value: () => store.get().value }),
      }))
      .configure(() => ({ initialState: { value: ++next } }));
    const first = createBaseEditor({ plugins: [Plugin] });
    const second = createBaseEditor({ plugins: [Plugin] });

    expect(first.api.contextual.value()).toBe(1);
    expect(second.api.contextual.value()).toBe(2);
  });

  it('rejects authoring after terminal configuration', () => {
    const Plugin = createBasePlugin({ name: 'terminal' }).configure({});

    expect(() =>
      Reflect.apply(Reflect.get(Plugin, 'extend'), undefined, [{}])
    ).toThrow('already configured');
    expect(() =>
      Reflect.apply(Reflect.get(Plugin, 'configure'), undefined, [{}])
    ).toThrow('already configured');
  });

  it('requires API factories at every authoring stage', () => {
    expect(() =>
      Reflect.apply(createBasePlugin, undefined, [
        {
          api: { invalid: true },
          name: 'invalid-constructor-api',
        },
      ])
    ).toThrow('api` must be a context factory');

    const Plugin = createBasePlugin({ name: 'invalid-stage-api' });

    expect(() =>
      Reflect.apply(Plugin.extend, undefined, [
        {
          api: { invalid: true },
        },
      ])
    ).toThrow('api` must be a context factory');
  });

  it('accepts Base constructor components and rejects author-stage replacement', () => {
    const Component = () => null;
    const Plugin = createBasePlugin({
      component: Component,
      name: 'base-component',
    });
    const editor = createBaseEditor({ plugins: [Plugin] });

    expect(editor.plugin(Plugin).plugin.render.node).toBe(Component);

    expect(() =>
      Reflect.apply(Plugin.extend, undefined, [
        {
          component: () => null,
        },
      ])
    ).toThrow(
      'declare the default in the constructor or replace it through terminal .configure({ component })'
    );
    expect(() =>
      Reflect.apply(createBasePlugin, undefined, [
        {
          name: 'invalid-render-node',
          render: {
            // @plate-schema-adoption-negative-render-node
            node: () => null,
          },
        },
      ])
    ).toThrow(
      'Use top-level `component` in createBasePlugin/createPlatePlugin'
    );
  });

  it('replaces a Base constructor component through terminal configuration', () => {
    const Component = () => null;
    const Replacement = () => null;
    const Plugin = createBasePlugin({
      component: Component,
      initialState: { value: 1 },
      name: 'static-component',
    }).configure({
      component: Replacement,
      initialState: { value: 2 },
    });
    const editor = createBaseEditor({
      initialValue: value,
      plugins: [Plugin],
    });
    const resolved = editor.plugin(Plugin).plugin;

    expect(Reflect.get(resolved.render, 'node')).toBe(Replacement);
    expect(resolved.initialState).toEqual({ value: 2 });
  });

  it('locks authored schema identity across its descriptor family', () => {
    const Plugin = createBasePlugin({
      name: 'schema',
      schema: { mark: property.boolean() },
    });
    const ExtendedPlugin = Plugin.extend({ initialState: { enabled: true } });

    expect(() => {
      (Plugin as { schema: unknown }).schema = { mark: property.string() };
    }).toThrow();
    expect(ExtendedPlugin.schema).toEqual(Plugin.schema);
  });

  it('freezes target plugin names at construction', () => {
    const targetPluginNames = ['paragraph'];
    const Plugin = createBasePlugin({
      name: 'targeted',
      targetPluginNames,
    });

    targetPluginNames.push('heading');
    expect(Plugin.targetPluginNames).toEqual(['paragraph']);
    expect(Object.isFrozen(Plugin.targetPluginNames)).toBe(true);
  });
});
