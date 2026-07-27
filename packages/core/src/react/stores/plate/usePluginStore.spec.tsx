import React from 'react';

import { act, renderHook } from '@testing-library/react';

import type { PluginConfig } from '../../../lib';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import { createPlatePlugin } from '../../plugin';
import { useEditorPluginStore, usePluginStore } from './usePluginStore';

describe('usePluginStore', () => {
  it('subscribes to fields, named selectors, and selector callbacks', () => {
    const CounterPlugin = createPlatePlugin({
      initialState: {
        value: 1,
      },
      key: 'counter',
      selectors: {
        doubleValue: (state, factor: number) => state.value * factor,
      },
    });
    const editor = createPlateEditor({
      plugins: [CounterPlugin],
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result } = renderHook(
      () => {
        const doubled = usePluginStore(CounterPlugin, 'doubleValue', 3);
        const state = usePluginStore(CounterPlugin, (value) => value);
        const value = usePluginStore(CounterPlugin, 'value');
        const valueBySelector = usePluginStore(
          CounterPlugin,
          (current) => current.value * 10
        );

        const typedDoubled: number = doubled;
        const typedValue: number = value;

        // @ts-expect-error selector return must not degrade to any
        const invalidDoubled: string = doubled;
        // @ts-expect-error state-field return must not degrade to any
        const invalidValue: string = value;

        void invalidDoubled;
        void invalidValue;
        void typedDoubled;
        void typedValue;

        return { doubled, state, value, valueBySelector };
      },
      { wrapper }
    );

    expect(result.current).toEqual({
      doubled: 3,
      state: { value: 1 },
      value: 1,
      valueBySelector: 10,
    });

    act(() => {
      editor.plugin(CounterPlugin).store.set({ value: 2 });
    });

    expect(result.current).toEqual({
      doubled: 6,
      state: { value: 2 },
      value: 2,
      valueBySelector: 20,
    });
  });

  it('evaluates named selectors against the supplied subscription snapshot', () => {
    const snapshots: number[] = [];
    const CounterPlugin = createPlatePlugin({
      initialState: { value: 1 },
      key: 'counter',
      selectors: {
        trackedValue: (state) => {
          snapshots.push(state.value);

          return state.value;
        },
      },
    });
    const editor = createPlateEditor({ plugins: [CounterPlugin] });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result } = renderHook(
      () => usePluginStore(CounterPlugin, 'trackedValue'),
      { wrapper }
    );

    act(() => {
      editor.plugin(CounterPlugin).store.set({ value: 2 });
    });

    expect(result.current).toBe(2);
    expect(snapshots).toContain(1);
    expect(snapshots).toContain(2);
  });

  it('preserves optional named-selector return types', () => {
    type State = { value: number };
    type OptionalSelectorConfig = PluginConfig<
      'optionalSelector',
      State,
      {},
      {},
      {
        isEven?: (state: Readonly<State>) => boolean;
      }
    >;
    const OptionalSelectorPlugin = createPlatePlugin<OptionalSelectorConfig>({
      initialState: { value: 2 },
      key: 'optionalSelector',
      selectors: {
        isEven: (state) => state.value % 2 === 0,
      },
    });
    const editor = createPlateEditor({
      plugins: [OptionalSelectorPlugin],
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result } = renderHook(
      () => usePluginStore(OptionalSelectorPlugin, 'isEven'),
      { wrapper }
    );
    const typedIsEven: boolean = result.current;

    // @ts-expect-error optional selector return must not degrade to any
    const invalidIsEven: string = result.current;

    void invalidIsEven;
    expect(typedIsEven).toBe(true);
  });

  it('supports explicit editors and rejects missing plugins and keys', () => {
    const CounterPlugin = createPlatePlugin({
      initialState: { value: 1 },
      key: 'counter',
    });
    const ExternalPlugin = createPlatePlugin({
      initialState: { value: 5 },
      key: 'external',
    });
    const editor = createPlateEditor({ plugins: [CounterPlugin] });

    expect(
      renderHook(() => useEditorPluginStore(editor, CounterPlugin, 'value'))
        .result.current
    ).toBe(1);
    expect(() =>
      renderHook(() => useEditorPluginStore(editor, ExternalPlugin, 'value'))
    ).toThrow('Plate plugin "external" is not installed.');
    expect(() =>
      renderHook(() =>
        useEditorPluginStore(editor, CounterPlugin, 'missing' as 'value')
      )
    ).toThrow(
      'Plate plugin "counter" has no state field or selector "missing".'
    );
  });
});
