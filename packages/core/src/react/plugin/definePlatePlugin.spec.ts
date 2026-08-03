import type { NodeComponent } from '../../lib';
import { schema } from '@platejs/plite';

import { resolvePluginTest } from '../../internal/plugin/resolveCreatePluginTest';
import { createBaseEditor } from '../../lib';
import { definePlatePlugin } from './definePlatePlugin';

describe('definePlatePlugin', () => {
  it('binds the root component to the private render slot', () => {
    const Component: NodeComponent = () => null;
    const resolved = resolvePluginTest(
      definePlatePlugin('component', {
        component: Component,
      })
    );

    expect(resolved.render.node).toBe(Component);
  });

  it('lets terminal configuration replace the component', () => {
    const Component: NodeComponent = () => null;
    const Replacement: NodeComponent = () => null;
    const resolved = resolvePluginTest(
      definePlatePlugin('component', {
        component: Component,
      }).configure({ component: Replacement })
    );

    expect(resolved.render.node).toBe(Replacement);
  });

  it('publishes flat plugin API and update capabilities', () => {
    const plugin = definePlatePlugin('native', {
      api: () => ({
        label: () => 'native' as const,
      }),
      update: ({ tx }) => ({
        insert: (text: string) =>
          tx.text.insert(text, { at: { offset: 0, path: [0, 0] } }),
      }),
    });
    const editor = createBaseEditor({
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      plugins: [plugin],
    });

    expect(editor.plugin(plugin).api.label()).toBe('native');
    editor.plugin(plugin).update.insert('value');
    expect(editor.read((state) => state.text.string([]))).toBe('value');
  });

  it('keeps staged capabilities on the React descriptor', () => {
    const plugin = definePlatePlugin('staged', {
      api: () => ({
        first: () => 'first' as const,
      }),
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
      definePlatePlugin('events', {
        on: { keyDown },
      })
    );

    expect(resolved.on.keyDown).toBe(keyDown);
  });

  it('does not publish resolved element identity when the React plugin is absent', () => {
    const plugin = definePlatePlugin('elementOwner', {
      schema: {
        element: { ...schema.element.textBlock(), type: 'documentElement' },
      },
    });
    const editor = createBaseEditor();

    expect(editor.plugin(plugin).installed).toBe(false);
    expect(() => editor.plugin(plugin).schema).toThrow('is not installed');
  });

  it('rejects non-factory API definitions at the runtime boundary', () => {
    const createRuntime = definePlatePlugin as unknown as (
      name: string,
      definition: unknown
    ) => unknown;

    expect(() =>
      createRuntime('invalidApi', {
        api: { label: () => 'invalid' },
      })
    ).toThrow('Plate plugin `api` must be a factory.');
  });
});
