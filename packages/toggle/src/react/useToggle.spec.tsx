import type React from 'react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';

const useEditorPluginMock = mock();
const useEditorMock = mock();
const useEditorSelectorMock = mock();
const usePluginStoreMock = mock();

mock.module('../lib', () => ({
  BaseTogglePlugin: { key: 'baseToggle' },
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
    const collapse = mock();
    const focus = mock();
    const toggleIds = mock();
    const update = mock(
      (
        callback: (tx: {
          blocks: { toggle: typeof toggle };
          selection: { collapse: typeof collapse };
        }) => void
      ) => callback({ blocks: { toggle }, selection: { collapse } })
    );
    const editor = {
      api: { dom: { focus } },
      plugin: () => ({ api: { toggleIds } }),
      read: {
        nodes: {
          isBlock: () => true,
          toArray: () => [[{ id: 't1' }]],
        },
      },
      update,
    };

    useEditorSelectorMock.mockReturnValue(true);
    useEditorMock.mockReturnValue(editor);

    const { result } = renderHook(() => {
      const state = useToggleToolbarButtonState();

      return useToggleToolbarButton(state);
    });

    result.current.props.onClick();

    expect(result.current.props.pressed).toBe(true);
    expect(toggleIds).toHaveBeenCalledWith(['t1'], true);
    expect(toggle).toHaveBeenCalledWith('toggle');
    expect(collapse).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
  });

  it('builds toggle button state from open ids and toggles the clicked id', async () => {
    const { useToggleButton, useToggleButtonState } = await import(
      `./useToggle?button=${Math.random().toString(36).slice(2)}`
    );
    const toggleIds = mock();

    usePluginStoreMock.mockReturnValue(new Set(['t1']));
    useEditorPluginMock.mockReturnValue({ api: { toggleIds } });

    const { result } = renderHook(() => {
      const state = useToggleButtonState('t1');

      return useToggleButton(state);
    });

    result.current.buttonProps.onClick({
      preventDefault: mock(),
    } as unknown as React.MouseEvent);

    expect(result.current.open).toBe(true);
    expect(toggleIds).toHaveBeenCalledWith(['t1']);
  });
});
