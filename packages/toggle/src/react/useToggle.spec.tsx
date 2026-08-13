import type React from 'react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';
import type { NodeKey } from '@platejs/plite';

const toggleKey = 'toggle-runtime' as NodeKey;

const useEditorPluginMock = mock();
const useEditorMock = mock();
const useEditorSelectorMock = mock();
const usePluginStoreMock = mock();

mock.module('../lib', () => ({
  BaseTogglePlugin: { name: 'baseToggle' },
}));

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditorPlugin: useEditorPluginMock,
  useEditor: useEditorMock,
  useEditorSelector: useEditorSelectorMock,
  usePluginStore: usePluginStoreMock,
}));

describe('toggle hooks', () => {
  beforeEach(() => {
    useEditorPluginMock.mockReset();
    useEditorMock.mockReset();
    useEditorSelectorMock.mockReset();
    usePluginStoreMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds toolbar button props that open toggles and toggle the block', async () => {
    const { useToggleToolbarButton, useToggleToolbarButtonState } =
      await import(
        `./useToggle?toolbar=${Math.random().toString(36).slice(2)}`
      );
    const toggle = mock();
    const focus = mock();
    const toggleKeys = mock();
    const editor = {
      api: { dom: { focus } },
      plugin: () => ({
        api: { toggleKeys },
        name: 'toggle',
        schema: { type: 'toggle' },
        update: { toggle },
      }),
      read: {
        nodes: {
          isBlock: () => true,
          toArray: () => [[{}, [0]]],
        },
      },
      key: () => toggleKey,
    };

    useEditorSelectorMock.mockReturnValue(true);
    useEditorMock.mockReturnValue(editor);

    const { result } = renderHook(() => {
      const state = useToggleToolbarButtonState();

      return useToggleToolbarButton(state);
    });

    result.current.props.onClick();

    expect(result.current.props.pressed).toBe(true);
    expect(toggleKeys).toHaveBeenCalledWith([toggleKey], true);
    expect(toggle).toHaveBeenCalledWith({ collapse: true });
    expect(focus).toHaveBeenCalled();
  });

  it('builds toggle button state from open keys and toggles the clicked key', async () => {
    const { useToggleButton, useToggleButtonState } = await import(
      `./useToggle?button=${Math.random().toString(36).slice(2)}`
    );
    const toggleKeys = mock();

    usePluginStoreMock.mockReturnValue(new Set([toggleKey]));
    useEditorPluginMock.mockReturnValue({ api: { toggleKeys } });

    const { result } = renderHook(() => {
      const state = useToggleButtonState(toggleKey);

      return useToggleButton(state);
    });

    result.current.buttonProps.onClick({
      preventDefault: mock(),
    } as unknown as React.MouseEvent);

    expect(result.current.open).toBe(true);
    expect(toggleKeys).toHaveBeenCalledWith([toggleKey]);
  });
});
