import { type BasePluginInput, createBaseEditor } from '../../lib/editor';
import { defineBasePlugin } from '../../lib/plugin';
import { getPluginStore } from './pluginStore';

const createStoreEditor = <const P extends readonly BasePluginInput[]>(
  plugins: P
) => createBaseEditor({ plugins });

describe('plugin store', () => {
  it('owns one store per installed plugin', () => {
    const FirstPlugin = defineBasePlugin('first', {
      initialState: { value: 1 },
    });
    const SecondPlugin = defineBasePlugin('second', {
      initialState: { value: 2 },
    });
    const editor = createStoreEditor([FirstPlugin, SecondPlugin]);

    expect(editor.plugin(FirstPlugin).store.get()).toEqual({ value: 1 });
    expect(editor.plugin(SecondPlugin).store.get()).toEqual({ value: 2 });
    expect(getPluginStore(editor, FirstPlugin.name)).toBeDefined();
    expect(getPluginStore(editor, SecondPlugin.name)).toBeDefined();

    editor.plugin(FirstPlugin).store.set({ value: 3 });

    expect(editor.plugin(FirstPlugin).store.get()).toEqual({ value: 3 });
    expect(editor.plugin(SecondPlugin).store.get()).toEqual({ value: 2 });
  });

  it('isolates the same plugin store across editors', () => {
    const Plugin = defineBasePlugin('plugin', {
      initialState: { value: 1 },
    });
    const first = createStoreEditor([Plugin]);
    const second = createStoreEditor([Plugin]);

    first.plugin(Plugin).store.set({ value: 2 });

    expect(first.plugin(Plugin).store.get('value')).toBe(2);
    expect(second.plugin(Plugin).store.get('value')).toBe(1);
    expect(getPluginStore(first, Plugin.name)).not.toBe(
      getPluginStore(second, Plugin.name)
    );
  });

  it('uses an empty state when initialState is omitted', () => {
    const Plugin = defineBasePlugin('plugin', {});
    const editor = createStoreEditor([Plugin]);

    expect(editor.plugin(Plugin).store.get()).toEqual({});
  });

  it('supports partial and draft updates', () => {
    const Plugin = defineBasePlugin('plugin', {
      initialState: {
        nested: { label: 'one' },
        untouched: true,
        value: 1,
      },
    });
    const editor = createStoreEditor([Plugin]);
    const { store } = editor.plugin(Plugin);

    store.set({ value: 2 });
    store.set((draft) => {
      draft.nested.label = 'two';
    });

    expect(store.get()).toEqual({
      nested: { label: 'two' },
      untouched: true,
      value: 2,
    });
  });

  it('owns and freezes writes without leaking caller mutation', () => {
    const Plugin = defineBasePlugin('plugin', {
      initialState: { nested: { value: 1 } },
    });
    const editor = createStoreEditor([Plugin]);
    const { store } = editor.plugin(Plugin);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    const partialInput = { value: 2 };

    store.set({ nested: partialInput });

    expect(store.get('nested')).toEqual({ value: 2 });
    expect(store.get('nested')).not.toBe(partialInput);
    expect(Object.isFrozen(store.get('nested'))).toBe(true);
    expect(Object.isFrozen(store.get())).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    partialInput.value = 20;

    expect(store.get('nested')).toEqual({ value: 2 });
    expect(listener).toHaveBeenCalledTimes(1);

    const updaterInput = { value: 3 };

    store.set((draft) => {
      draft.nested = updaterInput;
    });
    updaterInput.value = 30;

    expect(store.get('nested')).toEqual({ value: 3 });
    expect(store.get('nested')).not.toBe(updaterInput);
    expect(Object.isFrozen(store.get('nested'))).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(() => Object.assign(store.get(), { nested: null })).toThrow();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  it('evaluates pure selectors against current state', () => {
    const Plugin = defineBasePlugin('plugin', {
      initialState: { value: 2 },
      selectors: {
        multiplied: (state, factor: number) => state.value * factor,
      },
    });
    const editor = createStoreEditor([Plugin]);
    const { store } = editor.plugin(Plugin);

    expect(store.get('multiplied', 3)).toBe(6);

    store.set({ value: 4 });

    expect(store.get('multiplied', 3)).toBe(12);
  });

  it('merges selector declarations from extensions', () => {
    const Plugin = defineBasePlugin('plugin', {
      initialState: { value: 2 },
      selectors: {
        doubled: (state) => state.value * 2,
      },
    }).extend({
      selectors: {
        multiplied: (state) => state.value * 3,
      },
    });
    const editor = createStoreEditor([Plugin]);
    const { store } = editor.plugin(Plugin);

    expect(store.get('doubled')).toBe(4);
    expect(store.get('multiplied')).toBe(6);
  });

  it('rejects state and selector key collisions', () => {
    const Plugin = defineBasePlugin('plugin', {
      initialState: { value: 2 },
      selectors: {
        value: (state) => state.value * 2,
      },
    });

    expect(() => createStoreEditor([Plugin])).toThrow(
      'Plate plugin "plugin" defines "value" as both state and selector.'
    );
  });

  it('throws for unknown state fields or selectors', () => {
    const Plugin = defineBasePlugin('plugin', {
      initialState: { value: 1 },
    });
    const editor = createStoreEditor([Plugin]);

    expect(() => editor.plugin(Plugin).store.get('missing' as 'value')).toThrow(
      'Plate plugin "plugin" has no state field or selector "missing".'
    );
  });
});
