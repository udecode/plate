import { schema } from '@platejs/plite';

import type { NodeComponent } from '../../lib';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createBaseEditor, createBasePlugin } from '../../lib';
import { toPlatePlugin } from './toPlatePlugin';

describe('toPlatePlugin', () => {
  const BaseParagraphPlugin = createBasePlugin({
    api: () => ({
      baseLabel: () => 'base' as const,
    }),
    initialState: { count: 1 },
    name: 'paragraph',
    schema: {
      element: {
        content: schema.content.open({ default: 'text', min: 1 }),
      },
    },
  });

  it('lifts one Base descriptor with React component and event fields', () => {
    const Component: NodeComponent = () => null;
    const keyDown = mock();
    const plugin = toPlatePlugin(BaseParagraphPlugin, {
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
    const plugin = toPlatePlugin(BaseParagraphPlugin).extend(() => ({
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
      createBasePlugin({
        name: 'orderedLifecycle',
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
    const BaseChildPlugin = createBasePlugin({ name: 'child' });
    const ChildPlugin = toPlatePlugin(BaseChildPlugin);
    const ParentPlugin = toPlatePlugin(
      createBasePlugin({
        dependencies: [BaseChildPlugin],
        name: 'parent',
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
      toPlatePlugin(
        createBasePlugin({
          name: 'configuredComponent',
        })
      ).configure({ component: Component })
    );

    expect(resolved.render.node).toBe(Component);
  });

  it('preserves terminal Base configuration through the React lift', () => {
    const plugin = toPlatePlugin(
      createBasePlugin({
        name: 'configured',
      }).configure({})
    );
    const extend = Reflect.get(plugin, 'extend');

    expect(typeof extend).toBe('function');
    expect(() => Reflect.apply(extend, plugin, [{}])).toThrow(
      'already configured'
    );
  });

  it('keeps adapter callbacks contextually typed by the Base owner', () => {
    const plugin = toPlatePlugin(BaseParagraphPlugin, ({ store }) => ({
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
    const plugin = toPlatePlugin(BaseParagraphPlugin);
    const extend = Reflect.get(plugin, 'extend') as (input: unknown) => unknown;

    expect(() =>
      extend.call(plugin, {
        api: { label: () => 'invalid' },
      })
    ).toThrow('Plate plugin `api` must be a factory.');
  });
});
