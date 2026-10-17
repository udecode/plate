import { property, txLocate, txOnly } from '../../core';
import { defineRuntimePlugin } from '../../facade';
import { mergePlugins } from '../../internal/utils/mergePlugins';
import { createEditor } from '../editor';
import { createPluginContext } from './createPluginContext.internal';
import { definePlugin } from './definePlugin';

const value = [{ children: [{ text: '' }], type: 'paragraph' }] as const;

describe('definePlugin', () => {
  it('creates one exact plugin owner with inferred state and API', () => {
    const CounterPlugin = definePlugin('counter', {
      api: ({ store }) => ({
        count: () => store.get().count,
      }),
      initialState: { count: 2 },
    });
    const editor = createEditor({
      plugins: [CounterPlugin],
      initialValue: value,
    });

    expect(CounterPlugin.name).toBe('counter');
    expect(editor.api.counter.count()).toBe(2);
    expect(editor.api.counter).toBe(editor.plugin(CounterPlugin).api);
  });

  it('uses one camelCase plugin and document identity', () => {
    expect(() => definePlugin('code_block', {})).toThrow(
      'human-readable camelCase identifier'
    );

    const CodeBlockPlugin = definePlugin('codeBlock', {});

    expect(CodeBlockPlugin.name).toBe('codeBlock');
  });

  it('evaluates ordered author stages once per editor', () => {
    const calls: string[] = [];
    const Plugin = definePlugin('ordered', {
      api: () => ({ first: () => 1 }),
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
    const editor = createEditor({ plugins: [Plugin] });

    expect(calls).toEqual(['second:1', 'third:2']);
    expect(editor.api.ordered.third()).toBe(3);
  });

  it('merges staged initialState without mutating its family', () => {
    const BasePlugin = definePlugin('state', {
      initialState: { first: 1, second: 2 },
    });
    const ExtendedPlugin = BasePlugin.extend({
      initialState: { second: 3 },
    });
    const editor = createEditor({ plugins: [ExtendedPlugin] });

    expect(BasePlugin.initialState).toEqual({ first: 1, second: 2 });
    expect(editor.plugin(ExtendedPlugin).store.get()).toEqual({
      first: 1,
      second: 3,
    });
  });

  it('adopts native Plite fields flat and preserves portal identity', () => {
    const RawPlugin = defineRuntimePlugin('native', {
      api: () => ({ name: () => 'native' }),
      read: ({ state }) => ({
        childCount: () => state.value().children.length,
      }),
      update: ({ tx }) => ({
        insert: txLocate(false, (text: string) => tx.text.insert(text)),
      }),
    });
    const NativePlugin = definePlugin('native', {}).extend(RawPlugin);
    const editor = createEditor({
      plugins: [NativePlugin],
      initialValue: value,
    });
    const ForeignNativePlugin = defineRuntimePlugin('native', {});

    expect(Object.isFrozen(NativePlugin)).toBe(true);
    expect(editor.api.native).toBe(editor.plugin(NativePlugin).api);
    expect(editor.api.native).toBe(editor.plugin(RawPlugin).api);
    expect(editor.api.native).toBe(
      Reflect.apply(editor.plugin, editor, [NativePlugin]).api
    );
    expect(editor.api.native.name()).toBe('native');
    expect(editor.read.native.childCount()).toBe(1);
    const foreignPortal = Reflect.apply(editor.plugin, editor, [
      ForeignNativePlugin,
    ]);
    expect(foreignPortal.installed).toBe(false);
    expect(() => foreignPortal.api).toThrow('not installed');

    editor.update((tx) => {
      tx.native.insert('x');
    });
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'x' }], type: 'paragraph' },
    ]);
  });

  it('resolves authored dependency portals to their lowered plugins', () => {
    const DependencyPlugin = definePlugin('portalDependency', {
      api: () => ({ value: () => 42 }),
    });
    const ConsumerPlugin = definePlugin('portalConsumer', {
      api: ({ editor }) => ({
        dependencyValue: () => editor.plugin(DependencyPlugin).api.value(),
      }),
      dependencies: [DependencyPlugin],
    });
    const editor = createEditor({
      plugins: [ConsumerPlugin],
    });
    const ForeignDependencyPlugin = definePlugin('portalDependency', {
      api: () => ({ value: () => 0 }),
    });

    expect(editor.api.portalConsumer.dependencyValue()).toBe(42);
    expect(() => editor.plugin(ForeignDependencyPlugin).api.value()).toThrow(
      'different descriptor family'
    );
  });

  it('combines Plate and native update capabilities under one owner', () => {
    const NativePlugin = defineRuntimePlugin('combined', {
      update: ({ tx }) => ({
        native: () => tx.text.insert('n'),
      }),
    });
    const Plugin = definePlugin('combined', {
      update: ({ tx }) => ({
        plate: () => tx.text.insert('p'),
      }),
    }).extend(NativePlugin);
    const editor = createEditor({
      plugins: [Plugin],
      initialValue: value,
    });

    editor.update((tx) => {
      tx.combined.plate();
      tx.combined.native();
    });
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'pn' }], type: 'paragraph' },
    ]);
  });

  it('applies terminal configuration before author stages resolve', () => {
    const Plugin = definePlugin('configured', {
      initialState: { value: 1 },
    })
      .extend(({ store }) => ({
        api: () => ({ value: () => store.get().value }),
      }))
      .configure({ initialState: { value: 4 } });
    const editor = createEditor({ plugins: [Plugin] });

    expect(editor.api.configured.value()).toBe(4);
  });

  it('resolves contextual terminal configuration independently per editor', () => {
    let next = 0;
    const Plugin = definePlugin('contextual', {
      initialState: { value: 0 },
    })
      .extend(({ store }) => ({
        api: () => ({ value: () => store.get().value }),
      }))
      .configure(() => ({ initialState: { value: (next += 1) } }));
    const first = createEditor({ plugins: [Plugin] });
    const second = createEditor({ plugins: [Plugin] });

    expect(first.api.contextual.value()).toBe(1);
    expect(second.api.contextual.value()).toBe(2);
  });

  it('rejects authoring after terminal configuration', () => {
    const Plugin = definePlugin('terminal', {}).configure({});

    expect(() =>
      Reflect.apply(Reflect.get(Plugin, 'extend'), undefined, [{}])
    ).toThrow('already configured');
    expect(() =>
      Reflect.apply(Reflect.get(Plugin, 'configure'), undefined, [{}])
    ).toThrow('already configured');
  });

  it('requires API factories at every authoring stage', () => {
    expect(() =>
      Reflect.apply(definePlugin, undefined, [
        'invalidConstructorApi',
        {
          api: { invalid: true },
        },
      ])
    ).toThrow('api` must be a context factory');

    const Plugin = definePlugin('invalidStageApi', {});

    expect(() =>
      Reflect.apply(Plugin.extend, undefined, [
        {
          api: { invalid: true },
        },
      ])
    ).toThrow('api` must be a context factory');
  });

  it('rejects stale prepareDocument fields at authoring and compilation boundaries', () => {
    const prepareDocument = () => ({ children: [] });
    const error =
      'Plate plugin `prepareDocument` is unsupported. Convert persisted documents before creating or replacing an editor value.';

    expect(() =>
      Reflect.apply(definePlugin, undefined, [
        'stalePrepareConstructor',
        { prepareDocument },
      ])
    ).toThrow(error);

    const Plugin = definePlugin('stalePrepare', {});

    expect(() =>
      Reflect.apply(Plugin.extend, undefined, [{ prepareDocument }])
    ).toThrow(error);
    expect(() =>
      Reflect.apply(Plugin.configure, undefined, [{ prepareDocument }])
    ).toThrow(error);

    const ContextualPlugin = Reflect.apply(Plugin.extend, undefined, [
      () => ({ prepareDocument }),
    ]) as typeof Plugin;

    expect(() => createEditor({ plugins: [ContextualPlugin] })).toThrow(error);

    const staleDescriptor = mergePlugins(Plugin, { prepareDocument });

    expect(() => createEditor({ plugins: [staleDescriptor] })).toThrow(error);
  });

  it('accepts Base constructor components and rejects author-stage replacement', () => {
    const Component = () => null;
    const Plugin = definePlugin('baseComponent', {
      component: Component,
    });
    const IntrinsicPlugin = definePlugin('intrinsicComponent', {
      component: 'h2',
    });
    const editor = createEditor({ plugins: [Plugin] });

    expect(editor.plugin(Plugin).component).toBe(Component);
    expect(
      createEditor({ plugins: [IntrinsicPlugin] }).plugin(IntrinsicPlugin)
        .component
    ).toBe('h2');

    expect(() =>
      Reflect.apply(Plugin.extend, undefined, [
        {
          component: () => null,
        },
      ])
    ).toThrow(
      'declare the default in the constructor or replace it through terminal .configure({ component })'
    );
  });

  it('replaces a Base constructor component through terminal configuration', () => {
    const Component = () => null;
    const Replacement = () => null;
    const Plugin = definePlugin('staticComponent', {
      component: Component,
      initialState: { value: 1 },
    }).configure({
      component: Replacement,
      initialState: { value: 2 },
    });
    const editor = createEditor({
      initialValue: value,
      plugins: [Plugin],
    });
    const resolved = editor.plugin(Plugin);

    expect(resolved.component).toBe(Replacement);
    expect(resolved.initialState).toEqual({ value: 2 });
  });

  it('locks authored schema identity across its descriptor family', () => {
    const Plugin = definePlugin('schema', {
      schema: { mark: property.boolean() },
    });
    const ExtendedPlugin = Plugin.extend({ initialState: { enabled: true } });

    expect(() => {
      (Plugin as { schema: unknown }).schema = { mark: property.string() };
    }).toThrow();
    expect(ExtendedPlugin.schema).toEqual(Plugin.schema);
  });

  it('freezes target plugin references at construction', () => {
    const ParagraphPlugin = definePlugin('paragraph', {});
    const targetPlugins = ['paragraph'];
    const Plugin = definePlugin('targeted', {
      initialState: { allowedPlugins: [ParagraphPlugin] },
      targetPlugins: [ParagraphPlugin, ...targetPlugins],
    });

    targetPlugins.push('heading');
    expect(Plugin.targetPlugins).toEqual([ParagraphPlugin, 'paragraph']);
    expect(Plugin.targetPlugins[0]).toBe(ParagraphPlugin);
    expect(Plugin.initialState.allowedPlugins[0]).toBe(ParagraphPlugin);
    expect(Object.isFrozen(Plugin.targetPlugins)).toBe(true);
  });

  it('runs a function shared by read and update as an update through the shortcut', () => {
    let calls = 0;
    const shared = () => {
      calls += 1;
    };
    const Plugin = definePlugin('sharedMethod', {
      read: () => ({ peek: shared }),
      update: () => ({ poke: shared }),
    });
    const editor = createEditor({ plugins: [Plugin], initialValue: value });

    editor.update.sharedMethod.poke();

    expect(calls).toBe(1);
  });

  it('rejects a promise from a function shared by read and update', () => {
    const thenable = { then: () => undefined };
    const shared = () => thenable;
    const Plugin = definePlugin('sharedPromise', {
      read: () => ({ peek: shared }),
      update: () => ({ poke: shared }),
    });
    const editor = createEditor({ plugins: [Plugin], initialValue: value });

    expect(() =>
      editor.update((tx) => {
        tx.sharedPromise.poke();
      })
    ).toThrow('Transaction authors must be synchronous');
  });

  it('refuses a read and a transaction-only control through a Plate portal and ctx.update', () => {
    let controlRuns = 0;
    const Plugin = definePlugin('guardedPortal', {
      read: () => ({ peek: () => 'read' }),
      update: () => ({
        control: txOnly(() => {
          controlRuns += 1;
        }),
      }),
    });
    const editor = createEditor({ plugins: [Plugin], initialValue: value });
    const portal = editor.plugin(Plugin).update as unknown as Record<
      string,
      (...args: unknown[]) => unknown
    >;
    const context = createPluginContext(editor, Plugin)
      .update as unknown as Record<string, (...args: unknown[]) => unknown>;

    expect(() => portal.peek()).toThrow('is read-only.');
    expect(() => portal.control()).toThrow('is transaction-only.');
    expect(() => portal.control.call(undefined)).toThrow(
      'is transaction-only.'
    );
    expect(() => context.peek()).toThrow('is read-only.');
    expect(() => context.control()).toThrow('is transaction-only.');
    expect(controlRuns).toBe(0);
  });

  it('falls back to the whole transaction for a plugin with no transaction group', () => {
    const Plugin = definePlugin('groupless', {
      api: () => ({ ready: () => true }),
    });
    const editor = createEditor({ plugins: [Plugin], initialValue: value });
    const update = createPluginContext(editor, Plugin).update as unknown as {
      text: { insert: (text: string, options: unknown) => void };
    };

    update.text.insert('x', { at: { offset: 0, path: [0, 0] } });

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'x' }], type: 'paragraph' },
    ]);
  });

  it('runs a callable read root with itself as the receiver', () => {
    const Plugin = definePlugin('selfRead', {
      read: () =>
        Object.assign(
          function root(this: { nested: () => string }) {
            return this.nested();
          },
          { nested: () => 'nested' }
        ),
    });
    const editor = createEditor({ plugins: [Plugin], initialValue: value });

    expect(createPluginContext(editor, Plugin).read()).toBe('nested');
  });
});
