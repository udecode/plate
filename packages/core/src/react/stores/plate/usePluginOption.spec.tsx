import React from 'react';

import { act, renderHook } from '@testing-library/react';

import type { PluginConfig } from '../../../lib';

import { TestPlate as Plate } from '../../__tests__/TestPlate';
import { createPlateEditor } from '../../editor';
import { createPlatePlugin } from '../../plugin';
import {
  useEditorPluginOption,
  useEditorPluginOptions,
  usePluginOption,
  usePluginOptions,
} from './usePluginOption';

describe('usePluginOption', () => {
  it('reads plugin options, selectors, and state from the closest plate editor', () => {
    const CounterPlugin = createPlatePlugin({
      key: 'counter',
      options: {
        value: 1,
      },
    }).extendSelectors(({ getOptions }) => ({
      doubleValue: (factor: number) => getOptions().value * factor,
    }));

    const editor = createPlateEditor({
      plugins: [CounterPlugin],
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    const { result, rerender } = renderHook(
      () => {
        const doubled = usePluginOption(CounterPlugin, 'doubleValue', 3);
        const state = usePluginOption(CounterPlugin, 'state');
        const value = usePluginOption(CounterPlugin, 'value');
        const valueBySelector = usePluginOptions(
          CounterPlugin,
          (state) => state.value * 10
        );

        const typedDoubled: number = doubled;
        const typedValue: number = value;
        const typedSelector: number = valueBySelector;

        // @ts-expect-error selector return must not degrade to any
        const invalidDoubled: string = doubled;
        // @ts-expect-error option return must not degrade to any
        const invalidValue: string = value;

        void invalidDoubled;
        void invalidValue;
        void typedDoubled;
        void typedSelector;
        void typedValue;

        return {
          doubled,
          state,
          value,
          valueBySelector,
        };
      },
      { wrapper }
    );

    expect(result.current.value).toBe(1);
    expect(result.current.doubled).toBe(3);
    expect(result.current.state).toEqual({ value: 1 });
    expect(result.current.valueBySelector).toBe(10);

    act(() => {
      editor.plugin(CounterPlugin).setOption('value', 2);
    });
    rerender();

    expect(result.current.value).toBe(2);
    expect(result.current.doubled).toBe(6);
    expect(result.current.state).toEqual({ value: 2 });
    expect(result.current.valueBySelector).toBe(20);
  });

  it('keeps optional selector return types from full plugin objects', () => {
    type OptionalSelectorConfig = PluginConfig<
      'optionalSelector',
      {
        value: number;
      },
      {},
      {},
      {
        isEven?: () => boolean;
      }
    >;

    const OptionalSelectorPlugin = createPlatePlugin<OptionalSelectorConfig>({
      key: 'optionalSelector',
      options: {
        value: 2,
      },
    }).extendSelectors<OptionalSelectorConfig['selectors']>(
      ({ getOptions }) => ({
        isEven: () => getOptions().value % 2 === 0,
      })
    );

    const editor = createPlateEditor({
      plugins: [OptionalSelectorPlugin],
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <Plate editor={editor}>{children}</Plate>
    );

    const { result } = renderHook(
      () => {
        const isEven = usePluginOption(OptionalSelectorPlugin, 'isEven');
        const typedIsEven: boolean = isEven;

        // @ts-expect-error optional selector return must not degrade to any
        const invalidIsEven: string = isEven;

        void invalidIsEven;
        void typedIsEven;

        return isEven;
      },
      { wrapper }
    );

    expect(result.current).toBe(true);
  });

  it('logs and returns undefined for missing options, and returns undefined when the store is missing', () => {
    const CounterPlugin = createPlatePlugin({
      key: 'counter',
      options: {
        value: 1,
      },
    });
    const editor = createPlateEditor({
      plugins: [CounterPlugin],
    });
    const externalPlugin = createPlatePlugin({
      key: 'external',
      options: {
        value: 5,
      },
    });
    const debugError = mock();

    editor.api.debug.error = debugError as any;

    const missingKey = renderHook(() =>
      useEditorPluginOption(editor, CounterPlugin, 'missing' as any)
    );
    const missingStore = renderHook(() => ({
      option: useEditorPluginOption(editor, externalPlugin, 'value'),
      selected: useEditorPluginOptions(
        editor,
        externalPlugin,
        (state) => state
      ),
    }));

    expect(missingKey.result.current).toBeUndefined();
    expect(debugError).toHaveBeenCalledWith(
      'usePluginOption: missing option is not defined in plugin counter',
      'OPTION_UNDEFINED'
    );
    expect(missingStore.result.current).toEqual({
      option: undefined,
      selected: undefined,
    });
  });

  it('returns undefined for missing runtime plugin option stores', () => {
    const CounterPlugin = createPlatePlugin({
      key: 'counter',
      options: {
        value: 1,
      },
    });
    const externalPlugin = createPlatePlugin({
      key: 'external',
      options: {
        value: 5,
      },
    });
    const editor = createPlateEditor({
      plugins: [CounterPlugin],
    });

    const missingStore = renderHook(() => ({
      option: useEditorPluginOption(editor, externalPlugin, 'value'),
      selected: useEditorPluginOptions(
        editor,
        externalPlugin,
        (state) => state
      ),
    }));

    expect(missingStore.result.current).toEqual({
      option: undefined,
      selected: undefined,
    });
  });
});
