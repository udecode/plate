import type { NodeComponent } from '../../lib';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createBaseEditor } from '../../lib';
import { createPlatePlugin } from './createPlatePlugin';

describe('createPlatePlugin', () => {
  it('binds the root component to the private render slot', () => {
    const Component: NodeComponent = () => null;
    const resolved = resolvePluginTest(
      createPlatePlugin({
        component: Component,
        name: 'component',
      })
    );

    expect(resolved.render.node).toBe(Component);
  });

  it('lets terminal configuration replace the component', () => {
    const Component: NodeComponent = () => null;
    const Replacement: NodeComponent = () => null;
    const resolved = resolvePluginTest(
      createPlatePlugin({
        component: Component,
        name: 'component',
      }).configure({ component: Replacement })
    );

    expect(resolved.render.node).toBe(Replacement);
  });

  it('publishes flat plugin API and update capabilities', () => {
    const plugin = createPlatePlugin({
      api: () => ({
        label: () => 'native' as const,
      }),
      name: 'native',
      update: ({ tx }) => ({
        insert: (text: string) =>
          tx.text.insert(text, { at: { offset: 0, path: [0, 0] } }),
      }),
    });
    const editor = createBaseEditor({
      initialValue: [{ children: [{ text: '' }], type: 'p' }],
      plugins: [plugin],
    });

    expect(editor.plugin(plugin).api.label()).toBe('native');
    editor.plugin(plugin).update.insert('value');
    expect(editor.read((state) => state.text.string([]))).toBe('value');
  });

  it('keeps staged capabilities on the React descriptor', () => {
    const plugin = createPlatePlugin({
      api: () => ({
        first: () => 'first' as const,
      }),
      name: 'staged',
    }).extend(() => ({
      api: () => ({
        second: () => 'second' as const,
      }),
    }));
    const editor = createBaseEditor({ plugins: [plugin] });

    expect(editor.plugin(plugin).api.first()).toBe('first');
    expect(editor.plugin(plugin).api.second()).toBe('second');
  });

  it('keeps React DOM events under the prefixless on root', () => {
    const keyDown = mock();
    const resolved = resolvePluginTest(
      createPlatePlugin({
        name: 'events',
        on: { keyDown },
      })
    );

    expect(resolved.on.keyDown).toBe(keyDown);
  });

  it('rejects non-factory API definitions at the runtime boundary', () => {
    const createRuntime = createPlatePlugin as unknown as (
      definition: unknown
    ) => unknown;

    expect(() =>
      createRuntime({
        api: { label: () => 'invalid' },
        name: 'invalidApi',
      })
    ).toThrow('Plate plugin `api` must be a factory.');
  });
});
