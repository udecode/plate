import { describe, expect, it, mock } from 'bun:test';

import { act, renderHook } from '@testing-library/react';
import React from 'react';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { EditorProvider } from '../../components/EditorProvider';
import { createEditor } from '../../editor';
import { definePlatePlugin } from '../../plugin';
import { useEditorPluginStore, usePluginStore } from './usePluginStore';

describe('usePluginStore', () => {
  it('applies a changed equality function to the current selected value', () => {
    const Plugin = definePlatePlugin('equality', {
      initialState: { value: 1 },
    });
    const editor = createEditor({ plugins: [Plugin] });
    const { store } = editor.plugin(Plugin);
    const selector = () => store.get('value');
    const { result, rerender } = renderHook(
      ({ preserve }) =>
        usePluginStore(Plugin, selector, {
          equalityFn: preserve ? () => true : Object.is,
        }),
      {
        initialProps: { preserve: true },
        wrapper: ({ children }) => <Plate editor={editor}>{children}</Plate>,
      }
    );

    act(() => store.set({ value: 2 }));
    expect(result.current).toBe(1);

    rerender({ preserve: false });
    expect(result.current).toBe(2);
  });

  it('preserves unchanged state branches while owning newly supplied data', () => {
    const Plugin = definePlatePlugin('stableBranches', {
      initialState: { active: 0, results: [{ label: 'first' }] },
    });
    const editor = createEditor({ plugins: [Plugin] });
    const { store } = editor.plugin(Plugin);
    const initialResults = store.get('results');
    const renders = mock(() => {});
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );
    const { result } = renderHook(
      () => {
        renders();
        return usePluginStore(Plugin, 'results');
      },
      { wrapper }
    );
    const before = renders.mock.calls.length;

    act(() => store.set({ active: 1 }));
    expect(result.current).toBe(initialResults);
    expect(renders.mock.calls.length).toBe(before);

    act(() =>
      store.set((state) => {
        state.active = 2;
      })
    );
    expect(result.current).toBe(initialResults);
    expect(renders.mock.calls.length).toBe(before);

    const incoming = [{ label: 'second' }];
    act(() => store.set({ results: incoming }));
    const owned = result.current;
    expect(owned).not.toBe(incoming);
    expect(Object.isFrozen(owned[0])).toBe(true);
    incoming[0].label = 'third';
    expect(owned[0].label).toBe('second');
    act(() => store.set({ results: incoming }));
    expect(result.current[0].label).toBe('third');
    expect(result.current).not.toBe(owned);
    act(() =>
      store.set((state) => {
        state.results[0].label = 'fourth';
      })
    );
    expect(result.current[0].label).toBe('fourth');
    expect(owned[0].label).toBe('second');
  });

  it('rejects uninstalled plugin descriptors', () => {
    const Plugin = definePlatePlugin('uninstalled', {
      initialState: { value: 1 },
    });
    const editor = createEditor();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    expect(() =>
      renderHook(() => usePluginStore(Plugin, 'value'), { wrapper })
    ).toThrow('Plate plugin "uninstalled" is not installed.');
  });

  it('subscribes to fields, named selectors, and selector callbacks', () => {
    const CounterPlugin = definePlatePlugin('counter', {
      initialState: {
        value: 1,
      },
      selectors: {
        doubleValue: (state, factor: number) => state.value * factor,
      },
    });
    const editor = createEditor({
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
    const CounterPlugin = definePlatePlugin('counter', {
      initialState: { value: 1 },
      selectors: {
        trackedValue: (state) => {
          snapshots.push(state.value);

          return state.value;
        },
      },
    });
    const editor = createEditor({ plugins: [CounterPlugin] });
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

  it('selects the requested editor store inside nested providers', () => {
    const Plugin = definePlatePlugin('scopedStore', {
      initialState: { value: 1 },
    });
    const outerEditor = createEditor({ plugins: [Plugin] });
    const innerEditor = createEditor({ plugins: [Plugin] });
    innerEditor.plugin(Plugin).store.set({ value: 2 });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={outerEditor}>
        <Plate editor={innerEditor}>
          <EditorProvider editor={outerEditor}>{children}</EditorProvider>
        </Plate>
      </Plate>
    );
    const { result } = renderHook(
      () => usePluginStore(Plugin, (state) => state.value),
      { wrapper }
    );

    expect(result.current).toBe(1);

    act(() => innerEditor.plugin(Plugin).store.set({ value: 3 }));
    expect(result.current).toBe(1);

    act(() => outerEditor.plugin(Plugin).store.set({ value: 4 }));
    expect(result.current).toBe(4);
  });

  it('preserves optional named-selector return types', () => {
    type State = { value: number };
    const selectors: {
      isEven?: (state: Readonly<State>) => boolean;
    } = {
      isEven: (state) => state.value % 2 === 0,
    };
    const OptionalSelectorPlugin = definePlatePlugin('optionalSelector', {
      initialState: { value: 2 },
      selectors,
    });
    const editor = createEditor({
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
    const CounterPlugin = definePlatePlugin('counter', {
      initialState: { value: 1 },
    });
    const ExternalPlugin = definePlatePlugin('external', {
      initialState: { value: 5 },
    });
    const editor = createEditor({ plugins: [CounterPlugin] });

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
