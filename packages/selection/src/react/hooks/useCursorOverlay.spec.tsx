import React from 'react';

import { renderHook } from '@testing-library/react';

const useEditorRefMock = mock();
const useEditorContainerRefMock = mock();
const usePluginOptionMock = mock();
const useIsomorphicLayoutEffectMock = mock((effect: () => void) => effect());
const useRefreshOnResizeMock = mock(() => ({
  refresh: refreshMock,
}));
const getSelectionRectsMock = mock();
const getCursorOverlayStateMock = mock();
const refreshMock = mock();

mock.module('../CursorOverlayPlugin', () => ({
  CursorOverlayPlugin: { key: 'cursorOverlay' },
}));

mock.module('platejs/react', async () => ({
  useEditorContainerRef: useEditorContainerRefMock,
  useEditorRef: useEditorRefMock,
  useIsomorphicLayoutEffect: useIsomorphicLayoutEffectMock,
  usePluginOption: usePluginOptionMock,
}));

mock.module('../queries/getSelectionRects', () => ({
  getSelectionRects: getSelectionRectsMock,
}));

mock.module('../queries/getCursorOverlayState', () => ({
  getCursorOverlayState: getCursorOverlayStateMock,
}));

mock.module('./useRefreshOnResize', () => ({
  useRefreshOnResize: useRefreshOnResizeMock,
}));

const loadModule = async () =>
  import(`./useCursorOverlay?test=${Math.random().toString(36).slice(2)}`);

describe('useCursorOverlay', () => {
  afterEach(() => {
    mock.restore();
    useEditorRefMock.mockReset();
    useEditorContainerRefMock.mockReset();
    usePluginOptionMock.mockReset();
    useIsomorphicLayoutEffectMock.mockClear();
    useRefreshOnResizeMock.mockClear();
    getSelectionRectsMock.mockReset();
    getCursorOverlayStateMock.mockReset();
    refreshMock.mockReset();
  });

  it('returns empty cursor overlays when the container is missing', async () => {
    useEditorRefMock.mockReturnValue({});
    useEditorContainerRefMock.mockReturnValue({ current: null });
    usePluginOptionMock.mockReturnValue(undefined);
    getCursorOverlayStateMock.mockReturnValue([]);

    const { useCursorOverlay } = await loadModule();
    const { result } = renderHook(() => useCursorOverlay());

    expect(result.current).toEqual({
      cursors: [],
      refresh: refreshMock,
    });
    expect(getSelectionRectsMock).not.toHaveBeenCalled();
  });

  it('normalizes tiny selection rects and forwards them to cursor state composition', async () => {
    const editor = {};
    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    };
    const container = document.createElement('div');
    spyOn(container, 'getBoundingClientRect').mockReturnValue({
      x: 50,
      y: 80,
    } as any);
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      value: 4,
    });

    useEditorRefMock.mockReturnValue(editor);
    useEditorContainerRefMock.mockReturnValue({ current: container });
    usePluginOptionMock.mockReturnValue({
      a: {
        key: 'a',
        selection: range,
      },
    });
    getSelectionRectsMock.mockReturnValue([
      { height: 12, left: 6, top: 8, width: 0.5 },
    ]);
    getCursorOverlayStateMock.mockImplementation(({ selectionRects }) => [
      { key: 'a', selectionRects: selectionRects.a },
    ]);

    const { useCursorOverlay } = await loadModule();
    const { result } = renderHook(() =>
      useCursorOverlay({
        minSelectionWidth: 4,
      })
    );

    expect(getSelectionRectsMock).toHaveBeenCalledWith(editor, {
      range,
      xOffset: 50,
      yOffset: 76,
    });
    expect(getCursorOverlayStateMock).toHaveBeenCalledWith({
      cursors: {
        a: {
          key: 'a',
          selection: range,
        },
      },
      selectionRects: {
        a: [
          {
            height: 12,
            left: 4.25,
            top: 8,
            width: 4,
          },
        ],
      },
    });
    expect(result.current.refresh).toBe(refreshMock);
  });
});
