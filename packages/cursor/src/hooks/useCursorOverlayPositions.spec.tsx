import { renderHook } from '@testing-library/react';

const useEditorRefMock = mock();
const useIsomorphicLayoutEffectMock = mock((effect: Function) => effect());
const getCursorOverlayStateMock = mock();
const getSelectionRectsMock = mock();
const useRefreshOnResizeMock = mock();

mock.module('platejs/react', () => ({
  useEditorRef: useEditorRefMock,
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
    useEditorRefMock.mockReset();
    getCursorOverlayStateMock.mockReset();
    getSelectionRectsMock.mockReset();
    useRefreshOnResizeMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('computes cached selection rects and returns cursor overlay state with refresh controls', async () => {
    const { useCursorOverlayPositions } = await import(
      `./useCursorOverlayPositions?test=${Math.random().toString(36).slice(2)}`
    );
    const range = { anchor: { path: [0, 0], offset: 0 } };

    useEditorRefMock.mockReturnValue({ id: 'editor' });
    getSelectionRectsMock.mockReturnValue([{ width: 10, x: 1, y: 2 }]);
    getCursorOverlayStateMock.mockReturnValue([{ caretPosition: { top: 2 } }]);
    useRefreshOnResizeMock.mockReturnValue({ refresh: mock() });

    const container = document.createElement('div');
    Object.defineProperty(container, 'scrollTop', { value: 5 });
    container.getBoundingClientRect = () => ({ x: 10, y: 20 }) as DOMRect;

    const { result } = renderHook(() =>
      useCursorOverlayPositions({
        containerRef: { current: container },
        cursors: {
          a: { selection: range },
        } as any,
      })
    );

    expect(getSelectionRectsMock).toHaveBeenCalledWith(
      { id: 'editor' },
      { range, xOffset: 10, yOffset: 15 }
    );
    expect(getCursorOverlayStateMock).toHaveBeenCalled();
    expect(result.current.cursors).toEqual([{ caretPosition: { top: 2 } }]);
  });
});
