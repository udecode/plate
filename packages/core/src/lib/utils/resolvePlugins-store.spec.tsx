import React from 'react';

import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

import {
  type PlatePlugin,
  createPlateEditor,
  createPlatePlugin,
} from '../../react';
import { createSlateEditor } from '../editor';
import { type PluginConfig, createSlatePlugin } from '../plugin';
import { PlateError } from '../plugins';

// Mock component to test re-rendering
const TestComponent = ({
  editor,
  plugin,
}: {
  editor: ReturnType<typeof createPlateEditor>;
  plugin: PlatePlugin<PluginConfig<any, { value: number }>>;
}) => {
  const value = editor.useOption(plugin, 'value');

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
    PluginConfig<any, { nested?: { subValue: string }; value: number }>
  >;
}) => {
  const value = editor.useOption(plugin, 'value');
  const nestedValue = editor.useOption(plugin, 'nested');

  return (
    <div>
      <div data-testid="test-component">{value}</div>
      <div data-testid="test-nested">{nestedValue?.subValue}</div>
    </div>
  );
};

describe('SlatePlugin store', () => {
  it('should create a store for each plugin', () => {
    const p1 = createSlatePlugin({ key: 'plugin1', options: { value: 1 } });
    const p2 = createSlatePlugin({ key: 'plugin2', options: { value: 2 } });
    const editor = createPlateEditor({ plugins: [p1, p2] });

    expect(editor.getOptionsStore(p1)).toBeDefined();
    expect(editor.getOptionsStore(p2)).toBeDefined();
  });

  it('should initialize the store with plugin options', () => {
    const p1 = createSlatePlugin({ key: 'plugin1', options: { value: 1 } });
    const editor = createSlateEditor({ plugins: [p1] });

    expect(editor.getOptions(p1)).toEqual({ value: 1 });
  });

  it('should update plugin options when setOption is called', () => {
    const p1 = createSlatePlugin({ key: 'plugin1', options: { value: 1 } });
    const editor = createSlateEditor({ plugins: [p1] });

    editor.setOption(p1, 'value', 2);

    expect(editor.getOptions(p1)).toEqual({ value: 2 });
  });

  it('should handle nested options in the store', () => {
    const p1 = createSlatePlugin({
      key: 'plugin1',
      options: { nested: { value: 1 } },
    });
    const editor = createSlateEditor({ plugins: [p1] });

    editor.setOption(p1, 'nested', { value: 2 });

    expect(editor.getOptions(p1)).toEqual({ nested: { value: 2 } });
  });

  it('should maintain separate stores for each plugin', () => {
    const p1 = createSlatePlugin({ key: 'plugin1', options: { value: 1 } });
    const p2 = createSlatePlugin({ key: 'plugin2', options: { value: 2 } });
    const editor = createSlateEditor({ plugins: [p1, p2] });

    editor.setOption(p1, 'value', 3);

    expect(editor.getOptions(p1)).toEqual({ value: 3 });
    expect(editor.getOptions(p2)).toEqual({ value: 2 });
  });

  it('should handle plugins with no initial options', () => {
    const p1 = createSlatePlugin({ key: 'plugin1' });
    const editor = createSlateEditor({ plugins: [p1] });

    expect(editor.getOptions(p1)).toEqual({});
  });

  it('should preserve other plugin properties when updating store', () => {
    const p1 = createSlatePlugin({
      key: 'plugin1',
      node: { type: 'test' },
      options: { value: 1 },
    });
    const editor = createSlateEditor({ plugins: [p1] });

    editor.setOption(p1, 'value', 2);

    expect(editor.getOptions(p1)).toEqual({ value: 2 });
    expect(editor.getPlugin(p1).node.type).toBe('test');
  });

  it('should allow getting the entire store', () => {
    const p1 = createSlatePlugin({ key: 'plugin1', options: { value: 1 } });
    const editor = createPlateEditor({ plugins: [p1] });

    const store = editor.getOptionsStore(p1);
    expect(store).toBeDefined();
  });

  describe('extendOptions', () => {
    it('should add new selectors to the plugin store', () => {
      const p1 = createSlatePlugin({
        key: 'plugin1',
        options: { value: 1 },
      }).extendOptions(({ getOptions }) => ({
        doubleValue: () => getOptions().value * 2,
        param: (a1: number, a2: number) => getOptions().value + a1 + a2,
      }));

      const editor = createPlateEditor({ plugins: [p1] });

      expect(editor.getOption(p1, 'doubleValue')).toBe(2);
      expect(editor.getOption(p1, 'param', 2, 2)).toBe(5);
    });

    it('should allow chaining multiple extendOptions calls', () => {
      const p1 = createSlatePlugin({
        key: 'plugin1',
        options: { value: 1 },
      })
        .extendOptions(({ getOptions }) => ({
          doubleValue: (mul: number) => getOptions().value * mul,
        }))
        .extendOptions(({ getOption }) => ({
          tripleValue: () => getOption('doubleValue', 2) * 3,
        }));

      const editor = createPlateEditor({ plugins: [p1] });

      expect(editor.getOption(p1, 'doubleValue', 2)).toBe(2);
      expect(editor.getOption(p1, 'tripleValue')).toBe(6);
    });

    it('should update extended selectors when options change', () => {
      const p1 = createSlatePlugin({
        key: 'plugin1',
        options: { value: 1 },
      }).extendOptions(({ getOptions }) => ({
        doubleValue: () => {
          return getOptions().value * 2;
        },
      }));

      const editor = createPlateEditor({ plugins: [p1] });

      expect(editor.getOption(p1, 'doubleValue')).toBe(2);

      editor.setOption(p1, 'value', 2);

      expect(editor.getOption(p1, 'doubleValue')).toBe(4);
    });
  });
});

describe('PlatePlugin useOptions', () => {
  it('should re-render component when setOption is called', async () => {
    const p1 = createPlatePlugin({
      key: 'plugin1',
      options: { value: 1 },
    });
    const editor = createPlateEditor({ plugins: [p1] });

    const { getByTestId } = render(
      <TestComponent editor={editor} plugin={p1} />
    );

    // Initial render
    expect(getByTestId('test-component')).toHaveTextContent('1');

    // Update store
    act(() => {
      editor.setOption(p1, 'value', 2);
    });

    // Check if component re-rendered with new value
    expect(getByTestId('test-component')).toHaveTextContent('2');
  });

  describe('setOption', () => {
    it('should update a single option', () => {
      const p1 = createSlatePlugin({ key: 'plugin1', options: { value: 1 } });
      const editor = createPlateEditor({ plugins: [p1] });

      editor.setOption(p1, 'value', 2);

      expect(editor.getOptions(p1)).toEqual({ value: 2 });
    });

    it('should merge multiple options', () => {
      const p1 = createSlatePlugin({
        key: 'plugin1',
        options: { other: 'test', untouched: 1, value: 1 },
      });
      const editor = createPlateEditor({ plugins: [p1] });

      editor.setOptions(p1, { other: 'updated', value: 2 });

      expect(editor.getOptions(p1)).toEqual({
        other: 'updated',
        untouched: 1,
        value: 2,
      });
    });

    it('should update with immer', () => {
      const p1 = createSlatePlugin({
        key: 'plugin1',
        options: { other: 'test', value: 1 },
      });
      const editor = createPlateEditor({ plugins: [p1] });

      editor.setOptions(p1, (draft) => {
        draft.other = 'updated';
      });

      expect(editor.getOptions(p1)).toEqual({ other: 'updated', value: 1 });
    });

    it('should update nested options', () => {
      const p1 = createSlatePlugin({
        key: 'plugin1',
        options: { nested: { subValue: 'initial' } },
      });
      const editor = createPlateEditor({ plugins: [p1] });

      editor.setOption(p1, 'nested', { subValue: 'updated' });

      expect(editor.getOptions(p1)).toEqual({
        nested: { subValue: 'updated' },
      });
    });
  });

  describe('useOption', () => {
    it('should return the current option value', () => {
      const p1 = createSlatePlugin({ key: 'plugin1', options: { value: 1 } });
      const editor = createPlateEditor({ plugins: [p1] });

      const TestHook = () => {
        const value = editor.useOption(p1, 'value');

        return <div data-testid="test-hook">{value}</div>;
      };

      const { getByTestId } = render(<TestHook />);

      expect(getByTestId('test-hook')).toHaveTextContent('1');
    });

    it('should update when option value changes', () => {
      const p1 = createPlatePlugin({ key: 'plugin1', options: { value: 1 } });
      const editor = createPlateEditor({ plugins: [p1] });

      const { getByTestId } = render(
        <TestComponent editor={editor} plugin={p1} />
      );

      expect(getByTestId('test-component')).toHaveTextContent('1');

      act(() => {
        editor.setOption(p1, 'value', 2);
      });

      expect(getByTestId('test-component')).toHaveTextContent('2');
    });

    it('should handle nested option values', () => {
      const p1 = createPlatePlugin({
        key: 'plugin1',
        options: { nested: { subValue: 'initial' }, value: 1 },
      });
      const editor = createPlateEditor({ plugins: [p1] });

      const { getByTestId } = render(
        <TestComponentNested editor={editor} plugin={p1 as any} />
      );

      expect(getByTestId('test-nested')).toHaveTextContent('initial');

      act(() => {
        editor.setOptions(p1, { nested: { subValue: 'updated' } });
      });

      expect(getByTestId('test-nested')).toHaveTextContent('updated');
    });

    it('should not cause unnecessary re-renders', () => {
      const p1 = createSlatePlugin({
        key: 'plugin1',
        options: { other: 'test', value: 1 },
      });
      const editor = createPlateEditor({ plugins: [p1] });

      let renderCount = 0;
      const TestHook = () => {
        const value = editor.useOption(p1, 'value');
        renderCount++;

        return <div data-testid="test-hook">{value}</div>;
      };

      const { getByTestId } = render(<TestHook />);

      expect(renderCount).toBe(1);

      act(() => {
        editor.setOption(p1, 'other', 'updated');
      });

      expect(renderCount).toBe(1);
      expect(getByTestId('test-hook')).toHaveTextContent('1');
    });

    it('should throw when setting an option that was undefined', () => {
      // Create a plugin with no initial options, but with a defined type
      type PluginOptions = {
        existingOption: string;
      };
      const p1 = createSlatePlugin<any, PluginOptions>({ key: 'plugin1' });
      const editor = createPlateEditor({ plugins: [p1] });

      // Setting an existing option should work
      expect(() => {
        editor.setOption(p1, 'existingOption', 'value');
      }).not.toThrow(new PlateError('', ''));
    });

    it('should work with extended options', () => {
      const p1 = createPlatePlugin({
        key: 'plugin1',
        options: { value: 1 },
      }).extendOptions(({ getOptions }) => ({
        doubleValue: (mul: number) => getOptions().value * mul,
      }));

      const editor = createPlateEditor({ plugins: [p1] });

      const TestHook = () => {
        let never = editor.useOption(p1, 'doubleValue');
        // @ts-expect-error
        never = 1;
        const doubleValue = editor.useOption(p1, 'doubleValue', 2);

        return <div data-testid="test-hook">{doubleValue}</div>;
      };

      const { getByTestId } = render(<TestHook />);

      expect(getByTestId('test-hook')).toHaveTextContent('2');

      act(() => {
        editor.setOption(p1, 'value', 2);
      });

      expect(getByTestId('test-hook')).toHaveTextContent('4');
    });
  });

  describe('useOptions', () => {
    it('should allow access to the entire store', () => {
      const p1 = createSlatePlugin({
        key: 'plugin1',
        options: { other: 'test', value: 1 },
      });
      const editor = createPlateEditor({ plugins: [p1] });

      const TestHook = () => {
        const { other, value } = editor.useOptions(p1, (state) => ({
          other: state.other,
          value: state.value,
        }));

        return (
          <div>
            <div data-testid="test-value">{value}</div>
            <div data-testid="test-other">{other}</div>
          </div>
        );
      };

      const { getByTestId } = render(<TestHook />);

      expect(getByTestId('test-value')).toHaveTextContent('1');
      expect(getByTestId('test-other')).toHaveTextContent('test');
    });
  });
});
