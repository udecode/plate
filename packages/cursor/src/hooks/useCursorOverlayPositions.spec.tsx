import { renderHook } from '@testing-library/react';
import { createBaseEditor } from '@platejs/core';
import type { Range } from '@platejs/plite';

const useEditorMock = mock();
const useIsomorphicLayoutEffectMock = mock((effect: () => void) => effect());
const getCursorOverlayStateMock = mock();
const getSelectionRectsMock = mock();
const useRefreshOnResizeMock = mock();

mock.module('@platejs/core/react', () => ({
  useEditor: useEditorMock,
}));

mock.module('@udecode/react-utils', () => ({
  useIsomorphicLayoutEffect: useIsomorphicLayoutEffectMock,
}));

mock.module('../queries/getCursorOverlayState', () => ({
  getCursorOverlayState: getCursorOverlayStateMock,
}));

mock.module('../queries/getSelectionRects', () => ({
  getSelectionRects: getSelectionRectsMock,
}));

mock.module('./useRefreshOnResize', () => ({
  useRefreshOnResize: useRefreshOnResizeMock,
}));

describe('useCursorOverlayPositions', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    getCursorOverlayStateMock.mockReset();
    getSelectionRectsMock.mockReset();
    useRefreshOnResizeMock.mockReset();
    useRefreshOnResizeMock.mockReturnValue({ refresh: mock() });
  });

  afterAll(() => {
    mock.restore();
  });

  it('computes cached selection rects and returns cursor overlay state with refresh controls', async () => {
    const { useCursorOverlayPositions } = await import(
      `./useCursorOverlayPositions?test=${Math.random().toString(36).slice(2)}`
    );
    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } satisfies Range;
    const editor = createBaseEditor();

    useEditorMock.mockReturnValue(editor);
    getSelectionRectsMock.mockReturnValue([
      { height: 10, left: 1, top: 2, width: 10 },
    ]);
    getCursorOverlayStateMock.mockReturnValue([
      {
        caretPosition: { height: 10, left: 1, top: 2 },
        id: 'a',
        selection: range,
        selectionRects: [],
      },
    ]);

    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', { value: 5 });
    container.getBoundingClientRect = () => new DOMRect(10, 20);

    const { result } = renderHook(() =>
      useCursorOverlayPositions({
        containerRef: { current: container },
        cursors: {
          a: { selection: range },
        },
      })
    );

    expect(getSelectionRectsMock).toHaveBeenCalledWith(editor, {
      range,
      xOffset: 10,
      yOffset: 15,
    });
    expect(getCursorOverlayStateMock).toHaveBeenCalled();
    expect(result.current.cursors).toEqual([
      {
        caretPosition: { height: 10, left: 1, top: 2 },
        id: 'a',
        selection: range,
        selectionRects: [],
      },
    ]);
  });

  it('uses viewport coordinates when no relative container is provided', async () => {
    const { useCursorOverlayPositions } = await import(
      `./useCursorOverlayPositions?test=${Math.random().toString(36).slice(2)}`
    );
    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } satisfies Range;
    const editor = createBaseEditor();

    useEditorMock.mockReturnValue(editor);
    getSelectionRectsMock.mockReturnValue([]);
    getCursorOverlayStateMock.mockReturnValue([]);

    renderHook(() =>
      useCursorOverlayPositions({
        cursors: { a: { selection: range } },
      })
    );

    expect(getSelectionRectsMock).toHaveBeenCalledWith(editor, {
      range,
      xOffset: 0,
      yOffset: 0,
    });
  });
});
