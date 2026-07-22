import type React from 'react';

import { renderHook } from '@testing-library/react';
import * as actualCoreReact from '@platejs/core/react';

const useEditorPluginMock = mock();
const useEditorMock = mock();
const useEditorSelectorMock = mock();
const usePluginOptionMock = mock();
const openNextTogglesMock = mock();

mock.module('../../lib', () => ({
  BaseTogglePlugin: { key: 'baseToggle' },
  someToggle: mock(),
}));

mock.module('../transforms', () => ({
  openNextToggles: openNextTogglesMock,
}));

mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditorPlugin: useEditorPluginMock,
  useEditor: useEditorMock,
  useEditorSelector: useEditorSelectorMock,
  usePluginOption: usePluginOptionMock,
}));

describe('toggle hooks', () => {
  beforeEach(() => {
    useEditorPluginMock.mockReset();
    useEditorMock.mockReset();
    useEditorSelectorMock.mockReset();
    usePluginOptionMock.mockReset();
    openNextTogglesMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('builds toolbar button props that open toggles and toggle the block', async () => {
    const { useToggleToolbarButton, useToggleToolbarButtonState } =
      await import(
        `./useToggleToolbarButton?test=${Math.random().toString(36).slice(2)}`
      );
    const toggle = mock();
    const collapse = mock();
    const focus = mock();
    const update = mock(
      (
        callback: (tx: {
          blocks: { toggle: typeof toggle };
          selection: { collapse: typeof collapse };
        }) => void
      ) => callback({ blocks: { toggle }, selection: { collapse } })
    );
    const editor = { api: { dom: { focus } }, update };

    useEditorSelectorMock.mockReturnValue(true);
    useEditorMock.mockReturnValue(editor);

    const { result } = renderHook(() => {
      const state = useToggleToolbarButtonState();

      return useToggleToolbarButton(state);
    });

    result.current.props.onClick();

    expect(result.current.props.pressed).toBe(true);
    expect(openNextTogglesMock).toHaveBeenCalledWith(editor);
    expect(toggle).toHaveBeenCalledWith('toggle');
    expect(collapse).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
  });

  it('builds toggle button state from open ids and toggles the clicked id', async () => {
    const { useToggleButton, useToggleButtonState } = await import(
      `./useToggleButton?test=${Math.random().toString(36).slice(2)}`
    );
    const toggleIds = mock();

    usePluginOptionMock.mockReturnValue(new Set(['t1']));
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
