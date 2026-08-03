import type { NodeComponent } from '../../lib';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createBaseEditor, defineBasePlugin } from '../../lib';
import { toPlatePlugin } from './toPlatePlugin';

describe('toPlatePlugin', () => {
  const BaseAdapterPlugin = defineBasePlugin('baseAdapter', {
    api: () => ({
      baseLabel: () => 'base' as const,
    }),
    initialState: { count: 1 },
  });

  it('lifts one Base descriptor with React component and event fields', () => {
    const Component: NodeComponent = () => null;
    const keyDown = mock();
    const plugin = toPlatePlugin(BaseAdapterPlugin, {
      component: Component,
      initialState: { label: 'react' },
      on: { keyDown },
    });
    const resolved = resolvePluginTest(plugin);

    expect(resolved.render.node).toBe(Component);
    expect(resolved.on.keyDown).toBe(keyDown);
    expect(resolved.initialState).toEqual({
      count: 1,
      label: 'react',
    });
  });

  it('preserves Base and React-owned staged capabilities', () => {
    const plugin = toPlatePlugin(BaseAdapterPlugin).extend(() => ({
      api: () => ({
        reactLabel: () => 'react' as const,
      }),
    }));
    const editor = createBaseEditor({ plugins: [plugin] });

    expect(editor.plugin(plugin).api.baseLabel()).toBe('base');
    expect(editor.plugin(plugin).api.reactLabel()).toBe('react');
  });

  it('runs Base lifecycle contributions before React adapter contributions', () => {
    const calls: string[] = [];
    const plugin = toPlatePlugin(
      defineBasePlugin('orderedLifecycle', {
        on: {
          transactionChange: () => {
            calls.push('base');
          },
        },
      }),
      {
        on: {
          transactionChange: () => {
            calls.push('react');
          },
        },
      }
    );
    const editor = createBaseEditor({ plugins: [plugin] });

    calls.length = 0;
    editor.update((tx) => {
      tx.text.insert('value');
    });

    expect(calls).toEqual(['base', 'react']);
  });

  it('rebinds required dependencies to their React descriptors', () => {
    const BaseChildPlugin = defineBasePlugin('child', {});
    const ChildPlugin = toPlatePlugin(BaseChildPlugin);
    const ParentPlugin = toPlatePlugin(
      defineBasePlugin('parent', {
        dependencies: [BaseChildPlugin],
      }),
      {
        dependencies: [ChildPlugin],
      }
    );

    expect(ParentPlugin.dependencies).toEqual([ChildPlugin]);
  });

  it('lets terminal configuration bind the component', () => {
    const Component: NodeComponent = () => null;
    const resolved = resolvePluginTest(
      toPlatePlugin(defineBasePlugin('configuredComponent', {})).configure({
        component: Component,
      })
    );

    expect(resolved.render.node).toBe(Component);
  });

  it('preserves terminal Base configuration through the React lift', () => {
    const plugin = toPlatePlugin(
      defineBasePlugin('configured', {}).configure({})
    );
    const extend = Reflect.get(plugin, 'extend');

    expect(typeof extend).toBe('function');
    expect(() => Reflect.apply(extend, plugin, [{}])).toThrow(
      'already configured'
    );
  });

  it('keeps adapter callbacks contextually typed by the Base owner', () => {
    const plugin = toPlatePlugin(BaseAdapterPlugin, ({ store }) => ({
      initialState: {
        doubled: store.get('count') * 2,
      },
    }));

    expect(resolvePluginTest(plugin).initialState).toEqual({
      count: 1,
      doubled: 2,
    });
  });

  it('rejects non-factory API contributions at the runtime boundary', () => {
    const plugin = toPlatePlugin(BaseAdapterPlugin);
    const extend = Reflect.get(plugin, 'extend') as (input: unknown) => unknown;

    expect(() =>
      extend.call(plugin, {
        api: { label: () => 'invalid' },
      })
    ).toThrow('Plate plugin `api` must be a factory.');
  });
});
