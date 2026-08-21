import { createBaseEditor } from '@platejs/core';
import type { Range } from '@platejs/plite';
import { act, renderHook } from '@testing-library/react';

const useEditorMock = mock();
const useIsomorphicLayoutEffectMock = mock((effect: () => void) => effect());
const getCursorOverlayStateMock = mock();
const getSelectionRectsMock = mock();

mock.module('@platejs/core/react', () => ({
  useEditor: useEditorMock,
}));

mock.module('@udecode/react-utils', () => ({
  useIsomorphicLayoutEffect: useIsomorphicLayoutEffectMock,
}));

mock.module('./cursorGeometry', () => ({
  FROZEN_EMPTY_ARRAY: Object.freeze([]),
  getCursorOverlayState: getCursorOverlayStateMock,
  getSelectionRects: getSelectionRectsMock,
}));

const importHooks = () =>
  import(`./useCursorOverlay?test=${Math.random().toString(36).slice(2)}`);

describe('cursor overlay hooks', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
    getCursorOverlayStateMock.mockReset();
    getSelectionRectsMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('computes cached selection rects and exposes refresh controls', async () => {
    const { useCursorOverlayPositions } = await importHooks();
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
        refreshOnResize: false,
      })
    );

    expect(getSelectionRectsMock).toHaveBeenCalledWith(editor, {
      range,
      xOffset: 10,
      yOffset: 15,
    });
    expect(result.current.cursors).toEqual([
      {
        caretPosition: { height: 10, left: 1, top: 2 },
        id: 'a',
        selection: range,
        selectionRects: [],
      },
    ]);
    expect(typeof result.current.refresh).toBe('function');
  });

  it('uses viewport coordinates without a relative container', async () => {
    const { useCursorOverlayPositions } = await importHooks();
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
        refreshOnResize: false,
      })
    );

    expect(getSelectionRectsMock).toHaveBeenCalledWith(editor, {
      range,
      xOffset: 0,
      yOffset: 0,
    });
  });

  it('centers narrow selection rects at the configured minimum width', async () => {
    const { useCursorOverlayPositions } = await importHooks();
    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } satisfies Range;

    useEditorMock.mockReturnValue(createBaseEditor());
    getSelectionRectsMock.mockReturnValue([
      { height: 10, left: 10, top: 2, width: 0 },
    ]);
    getCursorOverlayStateMock.mockImplementation((value) => value);

    const { result } = renderHook(() =>
      useCursorOverlayPositions({
        cursors: { a: { selection: range } },
        minSelectionWidth: 2,
        refreshOnResize: false,
      })
    );

    expect(result.current.cursors.selectionRects).toEqual({
      a: [{ height: 10, left: 9, top: 2, width: 2 }],
    });
  });

  it('recomputes cached rects when the minimum width changes', async () => {
    const { useCursorOverlayPositions } = await importHooks();
    const range = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    } satisfies Range;
    let minSelectionWidth = 2;

    useEditorMock.mockReturnValue(createBaseEditor());
    getSelectionRectsMock.mockReturnValue([
      { height: 10, left: 10, top: 2, width: 0 },
    ]);
    getCursorOverlayStateMock.mockImplementation((value) => value);

    const { rerender, result } = renderHook(() =>
      useCursorOverlayPositions({
        cursors: { a: { selection: range } },
        minSelectionWidth,
        refreshOnResize: false,
      })
    );

    minSelectionWidth = 4;
    rerender();

    expect(getSelectionRectsMock).toHaveBeenCalledTimes(2);
    expect(result.current.cursors.selectionRects).toEqual({
      a: [{ height: 10, left: 8, top: 2, width: 4 }],
    });
  });

  it('coalesces scheduled renders even when the frame id is zero', async () => {
    const { useCursorOverlayPositions } = await importHooks();
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    let frameCallback: FrameRequestCallback | undefined;
    let renderCount = 0;

    globalThis.requestAnimationFrame = (callback) => {
      frameCallback = callback;

      return 0;
    };

    const { result } = renderHook(() => {
      renderCount++;

      return useCursorOverlayPositions({ refreshOnResize: false });
    });

    act(() => {
      result.current.refresh();
      result.current.refresh();
    });

    expect(renderCount).toBe(1);

    act(() => {
      frameCallback?.(0);
    });

    expect(renderCount).toBe(2);
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  });

  it('cancels a pending frame before an immediate render', async () => {
    const { useCursorOverlayPositions } = await importHooks();
    const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    const cancelAnimationFrame = mock();
    let renderCount = 0;

    globalThis.cancelAnimationFrame = cancelAnimationFrame;
    globalThis.requestAnimationFrame = () => 7;

    const { result } = renderHook(() => {
      renderCount++;

      return useCursorOverlayPositions({ refreshOnResize: false });
    });

    act(() => {
      result.current.refresh();
      result.current.refresh(true);
    });

    expect(cancelAnimationFrame).toHaveBeenCalledWith(7);
    expect(renderCount).toBe(2);
    globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  });
});
