/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import { act } from 'react';

import { render } from '@testing-library/react';

import { createBaseEditor } from '../../lib/editor';
import { type PluginConfig, createBasePlugin } from '../../lib/plugin';
import { PlateError } from '../../lib/plugins';
import { TestPlate as Plate } from '../../react/__tests__/TestPlate';
import {
  type PlatePlugin,
  createPlateEditor,
  createPlatePlugin,
  useEditorPluginOption,
  useEditorPluginOptions,
  usePluginOption,
} from '../../react';
import { getPluginOptionsStore } from './pluginOptionsStore';

function TestComponent({
  editor,
  plugin,
}: {
  editor: ReturnType<typeof createPlateEditor>;
  plugin: PlatePlugin<PluginConfig<any, { value: number }>>;
}) {
  return (
    <Plate editor={editor}>
      <TestComponentInner plugin={plugin} />
    </Plate>
  );
}

// Mock component to test re-rendering
const TestComponentInner = ({
  plugin,
}: {
  plugin: PlatePlugin<PluginConfig<any, { value: number }>>;
}) => {
  const value = usePluginOption(plugin, 'value');

  return (
    <div>
      <div data-testid="test-component">{value}</div>
    </div>
  );
};

const TestComponentNested = ({
  editor,
  plugin,
}: {
  editor: ReturnType<typeof createPlateEditor>;
  plugin: PlatePlugin<
    PluginConfig<any, { value: number; nested?: { subValue: string } }>
  >;
}) => {
  const value = useEditorPluginOption(editor, plugin, 'value');
  const nestedValue = useEditorPluginOption(editor, plugin, 'nested');

  return (
    <div>
      <div data-testid="test-component">{value}</div>
      <div data-testid="test-nested">{nestedValue?.subValue}</div>
    </div>
  );
};

const createStoreEditor = (
  plugins: NonNullable<Parameters<typeof createBaseEditor>[0]>['plugins']
) =>
  createBaseEditor({
    plugins,
  });

describe('BasePlugin store', () => {
  it('create a store for each plugin', () => {
    const p1 = createBasePlugin({ key: 'plugin1', options: { value: 1 } });
    const p2 = createBasePlugin({ key: 'plugin2', options: { value: 2 } });
    const editor = createStoreEditor([p1, p2]);

    expect(getPluginOptionsStore(editor, p1.key)).toBeDefined();
    expect(getPluginOptionsStore(editor, p2.key)).toBeDefined();
  });

  it('initialize the store with plugin options', () => {
    const p1 = createBasePlugin({ key: 'plugin1', options: { value: 1 } });
    const editor = createBaseEditor({
      plugins: [p1],
    });

    expect(editor.plugin(p1).getOptions()).toEqual({ value: 1 });
  });

  it('update plugin options when setOption is called', () => {
    const p1 = createBasePlugin({ key: 'plugin1', options: { value: 1 } });
    const editor = createBaseEditor({
      plugins: [p1],
    });

    editor.plugin(p1).setOption('value', 2);

    expect(editor.plugin(p1).getOptions()).toEqual({ value: 2 });
  });

  it('handle nested options in the store', () => {
    const p1 = createBasePlugin({
      key: 'plugin1',
      options: { nested: { value: 1 } },
    });
    const editor = createBaseEditor({
      plugins: [p1],
    });

    editor.plugin(p1).setOption('nested', { value: 2 });

    expect(editor.plugin(p1).getOptions()).toEqual({ nested: { value: 2 } });
  });

  it('owns and freezes every plain option write without leaking caller mutation', () => {
    const p1 = createBasePlugin({
      key: 'plugin1',
      options: { nested: { value: 1 } },
    });
    const editor = createBaseEditor({ plugins: [p1] });
    const portal = editor.plugin(p1);
    const listener = vi.fn();
    const unsubscribe = getPluginOptionsStore(editor, p1.key)!.store.subscribe(
      listener
    );
    const setOptionInput = { value: 2 };

    portal.setOption('nested', setOptionInput);

    expect(portal.getOption('nested')).toEqual({ value: 2 });
    expect(portal.getOption('nested')).not.toBe(setOptionInput);
    expect(Object.isFrozen(portal.getOption('nested'))).toBe(true);
    expect(Object.isFrozen(portal.getOptions())).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);

    setOptionInput.value = 20;

    expect(portal.getOption('nested')).toEqual({ value: 2 });
    expect(listener).toHaveBeenCalledTimes(1);

    const setOptionsInput = { value: 3 };

    portal.setOptions({ nested: setOptionsInput });
    setOptionsInput.value = 30;

    expect(portal.getOption('nested')).toEqual({ value: 3 });
    expect(portal.getOption('nested')).not.toBe(setOptionsInput);
    expect(listener).toHaveBeenCalledTimes(2);

    const updaterInput = { value: 4 };

    portal.setOptions((draft) => {
      draft.nested = updaterInput;
    });
    updaterInput.value = 40;

    expect(portal.getOption('nested')).toEqual({ value: 4 });
    expect(portal.getOption('nested')).not.toBe(updaterInput);
    expect(Object.isFrozen(portal.getOption('nested'))).toBe(true);
    expect(Object.isFrozen(portal.getOptions())).toBe(true);
    expect(listener).toHaveBeenCalledTimes(3);
    expect(() =>
      Object.assign(portal.getOptions(), { nested: null })
    ).toThrow();
    expect(listener).toHaveBeenCalledTimes(3);
    unsubscribe();
  });

  it('maintain separate stores for each plugin', () => {
    const p1 = createBasePlugin({ key: 'plugin1', options: { value: 1 } });
    const p2 = createBasePlugin({ key: 'plugin2', options: { value: 2 } });
    const editor = createBaseEditor({
      plugins: [p1, p2],
    });

    editor.plugin(p1).setOption('value', 3);

    expect(editor.plugin(p1).getOptions()).toEqual({ value: 3 });
    expect(editor.plugin(p2).getOptions()).toEqual({ value: 2 });
  });

  it('handle plugins with no initial options', () => {
    const p1 = createBasePlugin({ key: 'plugin1' });
    const editor = createBaseEditor({
      plugins: [p1],
    });

    expect(editor.plugin(p1).getOptions()).toEqual({});
  });

  it('preserve other plugin properties when updating store', () => {
    const p1 = createBasePlugin({
      key: 'plugin1',
      type: 'test',
      options: { value: 1 },
    });
    const editor = createBaseEditor({
      plugins: [p1],
    });

    editor.plugin(p1).setOption('value', 2);

    expect(editor.plugin(p1).getOptions()).toEqual({ value: 2 });
    expect(editor.getPlugin(p1).type).toBe('test');
  });

  it('allow getting the entire store', () => {
    const p1 = createBasePlugin({ key: 'plugin1', options: { value: 1 } });
    const editor = createStoreEditor([p1]);

    const store = getPluginOptionsStore(editor, p1.key)!;
    expect(store).toBeDefined();
  });

  describe('extendSelectors', () => {
    it('add new selectors to the plugin store', () => {
      const p1 = createBasePlugin({
        key: 'plugin1',
        options: { value: 1 },
      }).extend(({ getOptions }) => ({
        selectors: {
          doubleValue: () => getOptions().value * 2,
          param: (a1: number, a2: number) => getOptions().value + a1 + a2,
        },
      }));

      const editor = createStoreEditor([p1]);

      expect(editor.plugin(p1).getOption('doubleValue')).toBe(2);
      expect(editor.plugin(p1).getOption('param', 2, 2)).toBe(5);
    });

    it('allow chaining multiple extendSelectors calls', () => {
      const p1 = createBasePlugin({
        key: 'plugin1',
        options: { value: 1 },
      })
        .extend(({ getOptions }) => ({
          selectors: {
            doubleValue: (mul: number) => getOptions().value * mul,
          },
        }))
        .extend(({ getOption }) => ({
          selectors: {
            tripleValue: () => getOption('doubleValue', 2) * 3,
          },
        }));

      const editor = createStoreEditor([p1]);

      expect(editor.plugin(p1).getOption('doubleValue', 2)).toBe(2);
      expect(editor.plugin(p1).getOption('tripleValue')).toBe(6);
    });

    it('update extended selectors when options change', () => {
      const p1 = createBasePlugin({
        key: 'plugin1',
        options: { value: 1 },
      }).extend(({ getOptions }) => ({
        selectors: {
          doubleValue: () => getOptions().value * 2,
        },
      }));

      const editor = createStoreEditor([p1]);

      expect(editor.plugin(p1).getOption('doubleValue')).toBe(2);

      editor.plugin(p1).setOption('value', 2);

      expect(editor.plugin(p1).getOption('doubleValue')).toBe(4);
    });
  });
});

describe('PlatePlugin usePluginOption', () => {
  describe('setOption', () => {
    it('update a single option', () => {
      const p1 = createBasePlugin({ key: 'plugin1', options: { value: 1 } });
      const editor = createStoreEditor([p1]);

      editor.plugin(p1).setOption('value', 2);

      expect(editor.plugin(p1).getOptions()).toEqual({ value: 2 });
    });

    it('merge multiple options', () => {
      const p1 = createBasePlugin({
        key: 'plugin1',
        options: { other: 'test', untouched: 1, value: 1 },
      });
      const editor = createStoreEditor([p1]);

      editor.plugin(p1).setOptions({ other: 'updated', value: 2 });

      expect(editor.plugin(p1).getOptions()).toEqual({
        other: 'updated',
        untouched: 1,
        value: 2,
      });
    });

    it('update with immer', () => {
      const p1 = createBasePlugin({
        key: 'plugin1',
        options: { other: 'test', value: 1 },
      });
      const editor = createStoreEditor([p1]);

      editor.plugin(p1).setOptions((draft) => {
        draft.other = 'updated';
      });

      expect(editor.plugin(p1).getOptions()).toEqual({
        other: 'updated',
        value: 1,
      });
    });

    it('update nested options', () => {
      const p1 = createBasePlugin({
        key: 'plugin1',
        options: { nested: { subValue: 'initial' } },
      });
      const editor = createStoreEditor([p1]);

      editor.plugin(p1).setOption('nested', { subValue: 'updated' });

      expect(editor.plugin(p1).getOptions()).toEqual({
        nested: { subValue: 'updated' },
      });
    });
  });

  describe('usePluginOption', () => {
    it('returns the current option value', () => {
      const p1 = createBasePlugin({ key: 'plugin1', options: { value: 1 } });
      const editor = createPlateEditor({
        plugins: [p1],
      });

      const TestHook = () => {
        const value = useEditorPluginOption(editor, p1, 'value');

        return <div data-testid="test-hook">{value}</div>;
      };

      const { getByTestId } = render(<TestHook />);

      (expect(getByTestId('test-hook')) as any).toHaveTextContent('1');
    });

    it('update when option value changes', () => {
      const p1 = createPlatePlugin({ key: 'plugin1', options: { value: 1 } });
      const editor = createPlateEditor({
        plugins: [p1],
      });

      const { getByTestId } = render(
        <TestComponent editor={editor} plugin={p1 as any} />
      );

      (expect(getByTestId('test-component')) as any).toHaveTextContent('1');

      act(() => {
        editor.plugin(p1).setOption('value', 2);
      });

      (expect(getByTestId('test-component')) as any).toHaveTextContent('2');
    });

    it('handle nested option values', () => {
      const p1 = createPlatePlugin({
        key: 'plugin1',
        options: { nested: { subValue: 'initial' }, value: 1 },
      });
      const editor = createPlateEditor({
        plugins: [p1],
      });

      const { getByTestId } = render(
        <TestComponentNested editor={editor} plugin={p1 as any} />
      );

      (expect(getByTestId('test-nested')) as any).toHaveTextContent('initial');

      act(() => {
        editor.plugin(p1).setOptions({ nested: { subValue: 'updated' } });
      });

      (expect(getByTestId('test-nested')) as any).toHaveTextContent('updated');
    });

    it('does not cause unnecessary re-renders', () => {
      const p1 = createBasePlugin({
        key: 'plugin1',
        options: { other: 'test', value: 1 },
      });
      const editor = createPlateEditor({
        plugins: [p1],
      });

      let renderCount = 0;
      const TestHook = () => {
        const value = useEditorPluginOption(editor, p1, 'value');
        renderCount++;

        return <div data-testid="test-hook">{value}</div>;
      };

      const { getByTestId } = render(<TestHook />);

      expect(renderCount).toBe(1);

      act(() => {
        editor.plugin(p1).setOption('other', 'updated');
      });

      expect(renderCount).toBe(1);
      (expect(getByTestId('test-hook')) as any).toHaveTextContent('1');
    });

    it('throw when setting an option that was undefined', () => {
      // Create a plugin with no initial options, but with a defined type
      type PluginOptions = {
        existingOption: string;
      };
      const p1 = createBasePlugin<any, PluginOptions>({ key: 'plugin1' });
      const editor = createStoreEditor([p1]);

      // Setting an existing option should work
      expect(() => {
        editor.plugin(p1).setOption('existingOption', 'value');
      }).not.toThrow(new PlateError('', ''));
    });

    it('work with extended options', () => {
      const p1 = createPlatePlugin({
        key: 'plugin1',
        options: { value: 1 },
      }).extend(({ getOptions }) => ({
        selectors: {
          doubleValue: (mul: number) => getOptions().value * mul,
        },
      }));

      const editor = createPlateEditor({
        plugins: [p1],
      });

      const TestHook = () => {
        // @ts-expect-error
        let _never = useEditorPluginOption(editor, p1, 'doubleValue');
        _never = 1;
        const doubleValue = useEditorPluginOption(editor, p1, 'doubleValue', 2);

        return <div data-testid="test-hook">{doubleValue}</div>;
      };

      const { getByTestId } = render(<TestHook />);

      (expect(getByTestId('test-hook')) as any).toHaveTextContent('2');

      act(() => {
        editor.plugin(p1).setOption('value', 2);
      });

      (expect(getByTestId('test-hook')) as any).toHaveTextContent('4');
    });
  });

  describe('usePluginOptions', () => {
    it('allow access to the entire store', () => {
      const p1 = createBasePlugin({
        key: 'plugin1',
        options: { other: 'test', value: 1 },
      });
      const editor = createPlateEditor({
        plugins: [p1],
      });

      const TestHook = () => {
        const { other, value } = useEditorPluginOptions(
          editor,
          p1,
          (state) => ({
            other: state.other,
            value: state.value,
          })
        );

        return (
          <div>
            <div data-testid="test-value">{value}</div>
            <div data-testid="test-other">{other}</div>
          </div>
        );
      };

      const { getByTestId } = render(<TestHook />);

      (expect(getByTestId('test-value')) as any).toHaveTextContent('1');
      (expect(getByTestId('test-other')) as any).toHaveTextContent('test');
    });
  });
});
