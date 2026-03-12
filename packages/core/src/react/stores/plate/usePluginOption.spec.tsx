import React from 'react';

import { act, renderHook } from '@testing-library/react';

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
      () => ({
        doubled: usePluginOption(CounterPlugin, 'doubleValue', 3),
        state: usePluginOption(CounterPlugin, 'state'),
        value: usePluginOption(CounterPlugin, 'value'),
        valueBySelector: usePluginOptions(
          CounterPlugin,
          (state) => state.value * 10
        ),
      }),
      { wrapper }
    );

    expect(result.current.value).toBe(1);
    expect(result.current.doubled).toBe(3);
    expect(result.current.state).toEqual({ value: 1 });
    expect(result.current.valueBySelector).toBe(10);

    act(() => {
      editor.setOption(CounterPlugin, 'value', 2);
    });
    rerender();

    expect(result.current.value).toBe(2);
    expect(result.current.doubled).toBe(6);
    expect(result.current.state).toEqual({ value: 2 });
    expect(result.current.valueBySelector).toBe(20);
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
});
